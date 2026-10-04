package learning

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	bolt "go.etcd.io/bbolt"
)

func (s *Store) importExamFile(database *bolt.DB, path string) error {
	raw, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	var items []ExamPaper
	if err := json.Unmarshal(raw, &items); err != nil {
		return err
	}
	old := s.db
	s.db = database
	defer func() { s.db = old }()
	for _, item := range items {
		if current, ok, _ := s.examPaper(item.ID); ok {
			// Seed files may first publish a verified source shell and later add
			// fully reviewed questions. Upgrade that shell without overwriting
			// administrator-edited structured papers.
			if len(current.Sections) > 0 || len(item.Sections) == 0 {
				continue
			}
		}
		if _, err := s.saveExamPaper(item, "seed"); err != nil {
			return err
		}
	}
	return nil
}

func (s *Store) saveExamPaper(item ExamPaper, editor string) (ExamPaper, error) {
	item.ID = normalizeID(item.ID)
	if item.ID == "" {
		return item, fmt.Errorf("试卷 ID 不能为空")
	}
	if strings.TrimSpace(item.Title) == "" {
		return item, fmt.Errorf("试卷标题不能为空")
	}
	if item.Region == "" {
		item.Region = "北京市"
	}
	if item.Subject == "" {
		item.Subject = "英语"
	}
	if item.Status == "" {
		item.Status = "draft"
	}
	if item.Status != "draft" && item.Status != "published" {
		return item, fmt.Errorf("试卷状态必须为 draft 或 published")
	}
	item.UpdatedAt = time.Now().Format(time.RFC3339)
	item.UpdatedBy = editor
	score := 0.0
	sectionIDs := map[string]bool{}
	questionIDs := map[string]bool{}
	for si := range item.Sections {
		section := &item.Sections[si]
		if section.ID == "" {
			section.ID = fmt.Sprintf("section-%d", si+1)
		}
		if sectionIDs[section.ID] {
			return item, fmt.Errorf("分区编号重复: %s", section.ID)
		}
		sectionIDs[section.ID] = true
		if item.Status == "published" && strings.TrimSpace(section.Title) == "" {
			return item, fmt.Errorf("第 %d 个分区标题不能为空", si+1)
		}
		if item.Status == "published" && len(section.Questions) == 0 {
			return item, fmt.Errorf("分区“%s”至少需要一道题", section.Title)
		}
		for qi := range section.Questions {
			q := &section.Questions[qi]
			if q.ID == "" {
				q.ID = fmt.Sprintf("q-%d-%d", si+1, qi+1)
			}
			if questionIDs[q.ID] {
				return item, fmt.Errorf("题目编号重复: %s", q.ID)
			}
			questionIDs[q.ID] = true
			if q.Score < 0 {
				return item, fmt.Errorf("题目分值不能为负数")
			}
			if item.Status == "published" {
				if strings.TrimSpace(q.Type) == "" {
					return item, fmt.Errorf("题目 %s 的题型不能为空", q.ID)
				}
				if strings.TrimSpace(q.Prompt) == "" {
					return item, fmt.Errorf("题目 %s 的题干不能为空", q.ID)
				}
				if q.Score <= 0 {
					return item, fmt.Errorf("题目 %s 的分值必须大于 0", q.ID)
				}
				if q.Type == "choice" || q.Type == "single" {
					if len(q.Options) < 2 {
						return item, fmt.Errorf("选择题 %s 至少需要两个选项", q.ID)
					}
					for _, option := range q.Options {
						if strings.TrimSpace(option) == "" {
							return item, fmt.Errorf("选择题 %s 存在空选项", q.ID)
						}
					}
					answer := strings.ToUpper(strings.TrimSpace(fmt.Sprint(q.Answer)))
					if len(answer) != 1 || int(answer[0]-'A') < 0 || int(answer[0]-'A') >= len(q.Options) {
						return item, fmt.Errorf("选择题 %s 的答案不在有效选项内", q.ID)
					}
				} else if q.Type != "essay" && q.Type != "writing" && q.Type != "subjective" && strings.TrimSpace(fmt.Sprint(q.Answer)) == "" {
					return item, fmt.Errorf("题目 %s 的标准答案不能为空", q.ID)
				}
			}
			score += q.Score
		}
	}
	if len(item.Sections) > 0 {
		item.TotalScore = score
	}
	if item.Status == "published" && len(item.Sections) == 0 && item.AttachmentURL == "" {
		return item, fmt.Errorf("发布试卷前必须添加题目")
	}
	if item.Status == "published" && len(item.Sections) > 0 && item.DurationMinutes <= 0 {
		return item, fmt.Errorf("在线试卷的考试时长必须大于 0 分钟")
	}
	err := s.db.Update(func(tx *bolt.Tx) error {
		_ = tx.Bucket([]byte(deletedExamsBucket)).Delete([]byte(item.ID))
		return putJSON(tx.Bucket([]byte(examPapersBucket)), item.ID, item)
	})
	return item, err
}
func (s *Store) deleteExamPaper(id string) error {
	id = normalizeID(id)
	return s.db.Update(func(tx *bolt.Tx) error {
		if err := tx.Bucket([]byte(deletedExamsBucket)).Put([]byte(id), []byte("1")); err != nil {
			return err
		}
		return tx.Bucket([]byte(examPapersBucket)).Delete([]byte(id))
	})
}
func (s *Store) examPapers(includeDraft bool) ([]ExamPaper, error) {
	items := []ExamPaper{}
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(examPapersBucket)).ForEach(func(_, v []byte) error {
			var item ExamPaper
			if err := json.Unmarshal(v, &item); err != nil {
				return err
			}
			if !includeDraft && item.Status != "published" {
				return nil
			}
			items = append(items, item)
			return nil
		})
	})
	sort.Slice(items, func(i, j int) bool {
		if items[i].Year == items[j].Year {
			return items[i].Title < items[j].Title
		}
		return items[i].Year > items[j].Year
	})
	return items, err
}
func (s *Store) examPaper(id string) (ExamPaper, bool, error) {
	var item ExamPaper
	ok := false
	err := s.db.View(func(tx *bolt.Tx) error {
		v := tx.Bucket([]byte(examPapersBucket)).Get([]byte(normalizeID(id)))
		if v == nil {
			return nil
		}
		ok = true
		return json.Unmarshal(v, &item)
	})
	return item, ok, err
}
func (s *Store) submitExam(user User, in ExamSubmission) (ExamAttempt, error) {
	paper, ok, err := s.examPaper(in.PaperID)
	if err != nil || !ok {
		return ExamAttempt{}, fmt.Errorf("试卷不存在")
	}
	now := time.Now()
	started, err := time.Parse(time.RFC3339, in.StartedAt)
	if err != nil {
		started = now
	}
	attempt := ExamAttempt{ID: uuid.NewString(), UserID: user.ID, PaperID: paper.ID, PaperTitle: paper.Title, TotalScore: paper.TotalScore, StartedAt: started.Format(time.RFC3339), SubmittedAt: now.Format(time.RFC3339), DurationSeconds: int(now.Sub(started).Seconds()), Results: []QuestionResult{}}
	correctCount, totalObjective := 0, 0
	for _, section := range paper.Sections {
		for _, q := range section.Questions {
			answer := in.Answers[q.ID]
			correct, scored := checkExamAnswer(q, answer)
			score := 0.0
			if correct {
				score = q.Score
			}
			if scored {
				totalObjective++
				if correct {
					correctCount++
				}
			}
			attempt.Score += score
			attempt.Results = append(attempt.Results, QuestionResult{QuestionID: q.ID, Correct: correct, Score: score, MaxScore: q.Score, Answer: answer, Expected: q.Answer, Explanation: q.Explanation})
		}
	}
	if totalObjective > 0 {
		attempt.Accuracy = correctCount * 100 / totalObjective
	}
	err = s.db.Update(func(tx *bolt.Tx) error {
		if err := putJSON(tx.Bucket([]byte(examAttemptsBucket)), scopedKey(user.ID, attempt.ID), attempt); err != nil {
			return err
		}
		return recordLearningEventTx(tx, LearningEvent{UserID: user.ID, Type: "exam_submitted", ContentType: "exam", ContentID: paper.ID, Correct: correctCount, Wrong: max(0, totalObjective-correctCount), Source: "exam", Details: map[string]any{"accuracy": attempt.Accuracy, "score": attempt.Score, "totalScore": attempt.TotalScore}, CreatedAt: now.Format(time.RFC3339Nano)})
	})
	return attempt, err
}
func checkExamAnswer(q ExamQuestion, answer any) (bool, bool) {
	if q.Type == "essay" || q.Type == "writing" || q.Type == "subjective" {
		return false, false
	}
	expected := strings.TrimSpace(strings.ToLower(fmt.Sprint(q.Answer)))
	actual := strings.TrimSpace(strings.ToLower(fmt.Sprint(answer)))
	return expected == actual, true
}
func (s *Store) userExamAttempts(userID string) ([]ExamAttempt, error) {
	items := []ExamAttempt{}
	prefix := userID + "|"
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(examAttemptsBucket)).ForEach(func(k, v []byte) error {
			if !strings.HasPrefix(string(k), prefix) {
				return nil
			}
			var item ExamAttempt
			if err := json.Unmarshal(v, &item); err != nil {
				return err
			}
			items = append(items, item)
			return nil
		})
	})
	sort.Slice(items, func(i, j int) bool { return items[i].SubmittedAt > items[j].SubmittedAt })
	return items, err
}
