package learning

import (
	"testing"
	"time"

	bolt "go.etcd.io/bbolt"
)

func TestAdminHomeworkOverviewCountsRealWorkflowState(t *testing.T) {
	oldDB := db
	t.Cleanup(func() { db = oldDB })
	database := openTestDB(t)
	defer database.Close()
	db = database

	now := time.Date(2026, 7, 27, 12, 0, 0, 0, time.Local)
	active, err := saveHomework(Homework{
		ID: "active", Title: "Active homework", Status: "published",
		DueAt: now.Add(24 * time.Hour).Format(time.RFC3339), AssigneeIDs: []string{"student-1", "student-2"},
	}, User{Username: "admin"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := saveHomework(Homework{
		ID: "overdue", Title: "Overdue homework", Status: "published",
		DueAt: now.Add(-24 * time.Hour).Format(time.RFC3339), AssigneeIDs: []string{"student-3"},
	}, User{Username: "admin"}); err != nil {
		t.Fatal(err)
	}

	submissions := []HomeworkSubmission{
		{ID: "s1", HomeworkID: active.ID, UserID: "student-1", Status: "submitted"},
		{ID: "s2", HomeworkID: active.ID, UserID: "student-2", Status: "graded", Grade: HomeworkGrade{Status: "confirmed"}},
	}
	if err := db.Update(func(tx *bolt.Tx) error {
		for _, submission := range submissions {
			if err := putJSON(tx.Bucket([]byte(homeworkSubmissionsBucket)), scopedKey(submission.UserID, submission.HomeworkID), submission); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}

	items, summary, err := adminHomeworkOverview(now)
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 2 || summary.Assignments != 2 || summary.Active != 1 || summary.Assigned != 3 || summary.Submitted != 2 || summary.PendingGrading != 1 {
		t.Fatalf("unexpected overview: items=%d summary=%+v", len(items), summary)
	}
	for _, item := range items {
		if item.ID == active.ID && (item.SubmissionCount != 2 || item.ConfirmedCount != 1 || item.PendingCount != 1) {
			t.Fatalf("unexpected active homework counts: %+v", item)
		}
	}
}

func TestHomeworkIsOverdueAcceptsBrowserLocalDateTime(t *testing.T) {
	now := time.Date(2026, 7, 27, 12, 0, 0, 0, time.Local)
	if !homeworkIsOverdue(Homework{DueAt: "2026-07-27T11:30"}, now) {
		t.Fatal("expected browser local datetime to be overdue")
	}
	if homeworkIsOverdue(Homework{DueAt: "2026-07-27T12:30"}, now) {
		t.Fatal("future browser local datetime should remain active")
	}
}
