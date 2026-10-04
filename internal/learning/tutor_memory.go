package learning

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	bolt "go.etcd.io/bbolt"
)

// 助教讲解的记忆沉淀。
//
// 一次讲解如果只活在聊天记录里，下次遇到同一个词助教会从头再讲一遍；把它压缩成
// 一条“助教笔记”后，练习页的快照会把上次的结论带进提示词，助教就能接着说
// “上次我们说过……这次你又是……”，学习画像和学习计划也能引用它。
const (
	tutorNotesBucket = "tutor_notes"
	// 一条笔记最多保留的字符数：够说明一个错因，又不会挤占提示词预算。
	tutorNoteSummaryRunes = 280
	// 每个学生保留的笔记条数上限，超出时丢弃最久未更新的。
	tutorNotesPerUser = 400
)

// TutorNote is the distilled conclusion of one assistant explanation.
type TutorNote struct {
	ID        string `json:"id"`
	UserID    string `json:"userId"`
	Level     string `json:"level,omitempty"`
	WordID    string `json:"wordId"`
	Word      string `json:"word"`
	Meaning   string `json:"meaning,omitempty"`
	Scene     string `json:"scene,omitempty"`
	Question  string `json:"question,omitempty"`
	Summary   string `json:"summary"`
	Exchanges int    `json:"exchanges"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func tutorNoteKey(userID, level, wordID string) string {
	return userID + "|" + progressKey(level, wordID)
}

// recordTutorNote stores the explanation for the word that is currently on
// screen. It is best effort: a missing word or an empty answer simply produces
// no note, and callers ignore the error rather than failing the reply.
func (s *Store) recordTutorNote(userID string, snapshot AgentSnapshot, question, answer string, now time.Time) (*TutorNote, error) {
	item := snapshot.Current
	if item == nil || strings.TrimSpace(item.WordID) == "" {
		return nil, nil
	}
	summary := summarizeTutorAnswer(answer, tutorNoteSummaryRunes)
	if summary == "" {
		return nil, nil
	}
	key := tutorNoteKey(userID, item.Level, item.WordID)
	note := TutorNote{
		ID: uuid.NewString(), UserID: userID, Level: item.Level, WordID: item.WordID,
		Word: item.Spelling, Meaning: item.Meaning, Scene: snapshot.Scene,
		Question: truncateRunes(question, 200), Summary: summary,
		Exchanges: 1, CreatedAt: now.Format(time.RFC3339), UpdatedAt: now.Format(time.RFC3339),
	}
	err := s.db.Update(func(tx *bolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(tutorNotesBucket))
		if err != nil {
			return err
		}
		if raw := bucket.Get([]byte(key)); raw != nil {
			var previous TutorNote
			if json.Unmarshal(raw, &previous) == nil {
				note.ID = previous.ID
				note.CreatedAt = previous.CreatedAt
				note.Exchanges = previous.Exchanges + 1
			}
		}
		if err := putJSON(bucket, key, note); err != nil {
			return err
		}
		if _, err := tx.CreateBucketIfNotExists([]byte(learningEventsBucket)); err != nil {
			return err
		}
		return recordLearningEventTx(tx, LearningEvent{
			ID: uuid.NewString(), UserID: userID, Type: "agent_tutor", ContentType: "word",
			ContentID: item.WordID, Level: item.Level, Source: "agent",
			Details: map[string]any{
				"scene": snapshot.Scene, "word": item.Spelling, "question": note.Question,
				"summary": summary, "exchanges": note.Exchanges,
			},
			CreatedAt: now.Format(time.RFC3339),
		})
	})
	if err != nil {
		return nil, err
	}
	_ = s.pruneTutorNotes(userID, tutorNotesPerUser)
	out := note
	return &out, nil
}

// pruneTutorNotes keeps the newest notes of one student.
func (s *Store) pruneTutorNotes(userID string, keep int) error {
	if keep <= 0 {
		return nil
	}
	return s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(tutorNotesBucket))
		if bucket == nil {
			return nil
		}
		prefix := userID + "|"
		notes := make([]TutorNote, 0)
		err := bucket.ForEach(func(key, value []byte) error {
			if !strings.HasPrefix(string(key), prefix) {
				return nil
			}
			var note TutorNote
			if json.Unmarshal(value, &note) == nil {
				notes = append(notes, note)
			}
			return nil
		})
		if err != nil || len(notes) <= keep {
			return err
		}
		sort.Slice(notes, func(i, j int) bool { return notes[i].UpdatedAt > notes[j].UpdatedAt })
		for _, note := range notes[keep:] {
			if err := bucket.Delete([]byte(tutorNoteKey(note.UserID, note.Level, note.WordID))); err != nil {
				return err
			}
		}
		return nil
	})
}

// tutorNoteFor returns the stored note for one word, if any.
func (s *Store) tutorNoteFor(userID, level, wordID string) (*TutorNote, error) {
	if strings.TrimSpace(userID) == "" || strings.TrimSpace(wordID) == "" {
		return nil, nil
	}
	var note TutorNote
	found := false
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(tutorNotesBucket))
		if bucket == nil {
			return nil
		}
		raw := bucket.Get([]byte(tutorNoteKey(userID, level, wordID)))
		if raw == nil {
			return nil
		}
		if err := json.Unmarshal(raw, &note); err != nil {
			return err
		}
		found = true
		return nil
	})
	if err != nil || !found {
		return nil, err
	}
	return &note, nil
}

// tutorNotesForUser returns the newest notes of one student keyed by word,
// which is what the learning profile and the plan need.
func (s *Store) tutorNotesForUser(userID string) (map[string]TutorNote, error) {
	out := map[string]TutorNote{}
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(tutorNotesBucket))
		if bucket == nil {
			return nil
		}
		prefix := userID + "|"
		return bucket.ForEach(func(key, value []byte) error {
			if !strings.HasPrefix(string(key), prefix) {
				return nil
			}
			var note TutorNote
			if json.Unmarshal(value, &note) != nil {
				return nil
			}
			out[progressKey(note.Level, note.WordID)] = note
			return nil
		})
	})
	if err != nil {
		return nil, err
	}
	return out, nil
}

// summarizeTutorAnswer turns a model reply into a one-paragraph note: markdown
// decoration is dropped and the text is capped so the prompt stays cheap.
func summarizeTutorAnswer(answer string, max int) string {
	text := strings.ReplaceAll(answer, "\r\n", "\n")
	lines := make([]string, 0, 8)
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSpace(line)
		line = strings.TrimLeft(line, "#>*-• ")
		line = strings.TrimPrefix(line, "```")
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		lines = append(lines, line)
	}
	joined := strings.Join(lines, " ")
	joined = strings.Join(strings.Fields(joined), " ")
	return truncateRunes(joined, max)
}

func tutorNoteDetail(note *TutorNote) string {
	if note == nil || note.Summary == "" {
		return ""
	}
	stamp := note.UpdatedAt
	if parsed, err := time.Parse(time.RFC3339, note.UpdatedAt); err == nil {
		stamp = parsed.Format("1月2日")
	}
	return fmt.Sprintf("%s（累计讲解 %d 次）：%s", stamp, note.Exchanges, note.Summary)
}
