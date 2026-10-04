package learning

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	bolt "go.etcd.io/bbolt"
)

type HomeworkQuestion struct {
	ID      string   `json:"id"`
	Type    string   `json:"type"`
	Prompt  string   `json:"prompt"`
	Options []string `json:"options,omitempty"`
	Answer  any      `json:"answer,omitempty"`
	Score   float64  `json:"score"`
}
type Homework struct {
	ID           string             `json:"id"`
	Title        string             `json:"title"`
	Description  string             `json:"description"`
	Requirements string             `json:"requirements"`
	DueAt        string             `json:"dueAt"`
	Status       string             `json:"status"`
	AssigneeIDs  []string           `json:"assigneeIds"`
	Questions    []HomeworkQuestion `json:"questions"`
	AllowUpload  bool               `json:"allowUpload"`
	AIGrading    bool               `json:"aiGrading"`
	CreatedBy    string             `json:"createdBy"`
	CreatedAt    string             `json:"createdAt"`
	UpdatedAt    string             `json:"updatedAt"`
}
type HomeworkAttachment struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	MIMEType string `json:"mimeType"`
	Size     int64  `json:"size"`
	Path     string `json:"-"`
}
type HomeworkGrade struct {
	Score       float64  `json:"score"`
	MaxScore    float64  `json:"maxScore"`
	Feedback    string   `json:"feedback"`
	Suggestions []string `json:"suggestions"`
	Status      string   `json:"status"`
	GradedBy    string   `json:"gradedBy"`
	GradedAt    string   `json:"gradedAt"`
}
type HomeworkSubmission struct {
	ID          string               `json:"id"`
	HomeworkID  string               `json:"homeworkId"`
	UserID      string               `json:"userId"`
	StudentName string               `json:"studentName"`
	Answers     map[string]any       `json:"answers"`
	Notes       string               `json:"notes"`
	Attachments []HomeworkAttachment `json:"attachments"`
	Status      string               `json:"status"`
	SubmittedAt string               `json:"submittedAt"`
	Grade       HomeworkGrade        `json:"grade"`
}

type AdminHomeworkItem struct {
	Homework
	SubmissionCount int `json:"submissionCount"`
	ConfirmedCount  int `json:"confirmedCount"`
	PendingCount    int `json:"pendingCount"`
}

type AdminHomeworkSummary struct {
	Assignments    int `json:"assignments"`
	Active         int `json:"active"`
	Assigned       int `json:"assigned"`
	Submitted      int `json:"submitted"`
	PendingGrading int `json:"pendingGrading"`
}

func (s *Store) saveHomework(h Homework, user User) (Homework, error) {
	h.ID = normalizeID(h.ID)
	if h.ID == "" {
		h.ID = uuid.NewString()
	}
	if strings.TrimSpace(h.Title) == "" {
		return h, errors.New("作业标题不能为空")
	}
	if len(h.AssigneeIDs) == 0 {
		return h, errors.New("至少指定一名学生")
	}
	if h.Status == "" {
		h.Status = "published"
	}
	now := time.Now().Format(time.RFC3339)
	if h.CreatedAt == "" {
		h.CreatedAt = now
	}
	h.UpdatedAt = now
	h.CreatedBy = user.Username
	for i := range h.Questions {
		if h.Questions[i].ID == "" {
			h.Questions[i].ID = fmt.Sprintf("q%d", i+1)
		}
	}
	err := s.db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(homeworksBucket)), h.ID, h) })
	return h, err
}
func (s *Store) homeworkByID(id string) (Homework, bool, error) {
	var h Homework
	ok := false
	err := s.db.View(func(tx *bolt.Tx) error {
		v := tx.Bucket([]byte(homeworksBucket)).Get([]byte(id))
		if v == nil {
			return nil
		}
		ok = true
		return json.Unmarshal(v, &h)
	})
	return h, ok, err
}
func (s *Store) allHomeworks() ([]Homework, error) {
	out := []Homework{}
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(homeworksBucket)).ForEach(func(_, v []byte) error {
			var h Homework
			if err := json.Unmarshal(v, &h); err != nil {
				return err
			}
			out = append(out, h)
			return nil
		})
	})
	sort.Slice(out, func(i, j int) bool { return out[i].CreatedAt > out[j].CreatedAt })
	return out, err
}

func (s *Store) adminHomeworkOverview(now time.Time) ([]AdminHomeworkItem, AdminHomeworkSummary, error) {
	homeworks, err := s.allHomeworks()
	if err != nil {
		return nil, AdminHomeworkSummary{}, err
	}
	items := make([]AdminHomeworkItem, 0, len(homeworks))
	summary := AdminHomeworkSummary{Assignments: len(homeworks)}
	for _, homework := range homeworks {
		submissions, err := s.listHomeworkSubmissions(homework.ID)
		if err != nil {
			return nil, AdminHomeworkSummary{}, err
		}
		item := AdminHomeworkItem{Homework: homework, SubmissionCount: len(submissions)}
		for _, submission := range submissions {
			if submission.Grade.Status == "confirmed" {
				item.ConfirmedCount++
			} else {
				item.PendingCount++
			}
		}
		items = append(items, item)
		summary.Assigned += len(homework.AssigneeIDs)
		summary.Submitted += item.SubmissionCount
		summary.PendingGrading += item.PendingCount
		if homework.Status == "published" && !homeworkIsOverdue(homework, now) {
			summary.Active++
		}
	}
	return items, summary, nil
}

func homeworkIsOverdue(homework Homework, now time.Time) bool {
	if strings.TrimSpace(homework.DueAt) == "" {
		return false
	}
	for _, layout := range []string{time.RFC3339, "2006-01-02T15:04"} {
		if due, err := time.ParseInLocation(layout, homework.DueAt, now.Location()); err == nil {
			return due.Before(now)
		}
	}
	return false
}
func (s *Store) assignedHomeworks(userID string) ([]Homework, error) {
	all, err := s.allHomeworks()
	if err != nil {
		return nil, err
	}
	out := []Homework{}
	for _, h := range all {
		for _, id := range h.AssigneeIDs {
			if id == userID && h.Status == "published" {
				out = append(out, h)
				break
			}
		}
	}
	return out, nil
}
func (st *Store) submissionFor(homeworkID, userID string) (HomeworkSubmission, bool, error) {
	key := scopedKey(userID, homeworkID)
	var s HomeworkSubmission
	ok := false
	err := st.db.View(func(tx *bolt.Tx) error {
		v := tx.Bucket([]byte(homeworkSubmissionsBucket)).Get([]byte(key))
		if v == nil {
			return nil
		}
		ok = true
		return json.Unmarshal(v, &s)
	})
	return s, ok, err
}
func (st *Store) listHomeworkSubmissions(homeworkID string) ([]HomeworkSubmission, error) {
	out := []HomeworkSubmission{}
	err := st.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(homeworkSubmissionsBucket)).ForEach(func(_, v []byte) error {
			var s HomeworkSubmission
			if json.Unmarshal(v, &s) == nil && s.HomeworkID == homeworkID {
				out = append(out, s)
			}
			return nil
		})
	})
	return out, err
}
func saveHomeworkAttachment(root string, user User, header *multipart.FileHeader) (HomeworkAttachment, error) {
	if header.Size <= 0 || header.Size > 15<<20 {
		return HomeworkAttachment{}, errors.New("附件必须小于15MB")
	}
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".pdf": true}[ext] {
		return HomeworkAttachment{}, errors.New("仅支持图片或PDF")
	}
	src, err := header.Open()
	if err != nil {
		return HomeworkAttachment{}, err
	}
	defer src.Close()
	id := uuid.NewString()
	dir := filepath.Join(root, ".homework", user.ID, id)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return HomeworkAttachment{}, err
	}
	path := filepath.Join(dir, "submission"+ext)
	dst, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
	if err != nil {
		return HomeworkAttachment{}, err
	}
	defer dst.Close()
	n, err := dst.ReadFrom(src)
	if err != nil {
		return HomeworkAttachment{}, err
	}
	return HomeworkAttachment{ID: id, Name: filepath.Base(header.Filename), MIMEType: header.Header.Get("Content-Type"), Size: n, Path: path}, nil
}
func (st *Store) submitHomework(root string, user User, homeworkID string, answers map[string]any, notes string, files []*multipart.FileHeader) (HomeworkSubmission, error) {
	h, ok, err := st.homeworkByID(homeworkID)
	if err != nil || !ok {
		return HomeworkSubmission{}, errors.New("作业不存在")
	}
	assigned := false
	for _, id := range h.AssigneeIDs {
		if id == user.ID {
			assigned = true
		}
	}
	if !assigned {
		return HomeworkSubmission{}, errors.New("该作业未指定给当前学生")
	}
	attachments := []HomeworkAttachment{}
	for _, f := range files {
		a, err := saveHomeworkAttachment(root, user, f)
		if err != nil {
			return HomeworkSubmission{}, err
		}
		attachments = append(attachments, a)
	}
	s, exists, _ := st.submissionFor(homeworkID, user.ID)
	if !exists {
		s = HomeworkSubmission{ID: uuid.NewString(), HomeworkID: homeworkID, UserID: user.ID, StudentName: user.DisplayName}
	}
	s.Answers = answers
	s.Notes = notes
	s.Attachments = append(s.Attachments, attachments...)
	s.Status = "submitted"
	s.SubmittedAt = time.Now().Format(time.RFC3339)
	err = st.db.Update(func(tx *bolt.Tx) error {
		return putJSON(tx.Bucket([]byte(homeworkSubmissionsBucket)), scopedKey(user.ID, homeworkID), s)
	})
	return s, err
}
func (s *Store) gradeHomeworkWithAgent(ctx context.Context, root string, h Homework, submission HomeworkSubmission) (HomeworkSubmission, error) {
	prompt := fmt.Sprintf("请批改以下英语作业。作业要求：%s\n题目：%s\n学生答案：%s\n请用中文给出总分建议、逐项反馈和3条改进建议。", h.Requirements, mustJSON(h.Questions), mustJSON(submission.Answers))
	out, err := s.runAgent(ctx, root, User{ID: "admin", Username: "homework-grader"}, AgentChatRequest{Message: prompt, Mode: "homework"})
	if err != nil {
		return submission, err
	}
	max := 0.0
	score := 0.0
	for _, q := range h.Questions {
		max += q.Score
		if q.Answer != nil && strings.EqualFold(strings.TrimSpace(fmt.Sprint(q.Answer)), strings.TrimSpace(fmt.Sprint(submission.Answers[q.ID]))) {
			score += q.Score
		}
	}
	submission.Grade = HomeworkGrade{Score: score, MaxScore: max, Feedback: out.Message, Suggestions: []string{}, Status: "ai_draft", GradedBy: out.Engine, GradedAt: time.Now().Format(time.RFC3339)}
	submission.Status = "graded"
	err = s.db.Update(func(tx *bolt.Tx) error {
		return putJSON(tx.Bucket([]byte(homeworkSubmissionsBucket)), scopedKey(submission.UserID, submission.HomeworkID), submission)
	})
	return submission, err
}
func (s *Store) confirmHomeworkGrade(submission HomeworkSubmission, user User) (HomeworkSubmission, error) {
	old, ok, err := s.submissionFor(submission.HomeworkID, submission.UserID)
	if err != nil || !ok {
		return submission, errors.New("提交不存在")
	}
	old.Grade = submission.Grade
	old.Grade.Status = "confirmed"
	old.Grade.GradedBy = user.Username
	old.Grade.GradedAt = time.Now().Format(time.RFC3339)
	old.Status = "graded"
	err = s.db.Update(func(tx *bolt.Tx) error {
		return putJSON(tx.Bucket([]byte(homeworkSubmissionsBucket)), scopedKey(old.UserID, old.HomeworkID), old)
	})
	return old, err
}
func mustJSON(v any) string { raw, _ := json.Marshal(v); return string(raw) }
