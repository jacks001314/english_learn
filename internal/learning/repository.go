package learning

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"strings"

	bolt "go.etcd.io/bbolt"
)

const (
	progressBucket                = "progress"
	settingsBucket                = "settings"
	dailyGoalKey                  = "daily_review_goal"
	contentMetaBucket             = "content_meta"
	wordsBucket                   = "words"
	pronunciationsBucket          = "pronunciations"
	examplesBucket                = "examples"
	articlesBucket                = "articles"
	articleWordsBucket            = "article_words"
	usersBucket                   = "users"
	sessionsBucket                = "sessions"
	managedWordsBucket            = "managed_words"
	deletedWordsBucket            = "deleted_words"
	deletedArticlesBucket         = "deleted_articles"
	articleProgressBucket         = "article_progress"
	auditLogsBucket               = "audit_logs"
	examPapersBucket              = "exam_papers"
	deletedExamsBucket            = "deleted_exams"
	examAttemptsBucket            = "exam_attempts"
	agentConfigBucket             = "agent_config"
	agentAuditBucket              = "agent_audit"
	contentFactoryTasksBucket     = "content_factory_tasks"
	contentFactoryDraftsBucket    = "content_factory_drafts"
	contentFactoryEventsBucket    = "content_factory_events"
	contentFactoryAssetsBucket    = "content_factory_assets"
	contentFactoryBatchesBucket   = "content_factory_batches"
	contentFactoryVersionsBucket  = "content_factory_versions"
	contentFactorySchedulesBucket = "content_factory_schedules"
	contentVersionsBucket         = "content_versions"
	homeworksBucket               = "homeworks"
	homeworkSubmissionsBucket     = "homework_submissions"
	learningEventsBucket          = "learning_events"
	learningPlansBucket           = "learning_plans"
	contentSchemaKey              = "schema_version"
	contentSchemaVersion          = 3
)

// openStore 打开（或创建）数据库与词库，返回进程内唯一的 Store 实例。
// 任一初始化步骤失败都会关闭已打开的数据库并把错误返回给调用方。
func openStore(cfg Config) (*Store, error) {
	root := cfg.Root
	s := &Store{datasets: map[string][]Word{}, wordIndex: map[string]Word{}}
	if err := initAgentDirectories(root); err != nil {
		return nil, err
	}
	if err := s.loadDataset(filepath.Join(root, "backend", "primary_school.json"), "primary"); err != nil {
		return nil, err
	}
	if err := s.loadDataset(filepath.Join(root, "backend", "middle_school.json"), "middle"); err != nil {
		return nil, err
	}
	if err := s.loadCountries(root); err != nil {
		return nil, err
	}
	database, err := bolt.Open(cfg.DatabasePath, 0600, nil)
	if err != nil {
		return nil, err
	}
	s.db = database
	if err := initDB(database); err != nil {
		database.Close()
		return nil, err
	}
	if err := s.seedAdmin(); err != nil {
		database.Close()
		return nil, err
	}
	if err := s.loadManagedWords(database); err != nil {
		database.Close()
		return nil, err
	}
	if err := s.loadDeletedWords(database); err != nil {
		database.Close()
		return nil, err
	}
	if err := s.migrateLegacyProgress(database); err != nil {
		database.Close()
		return nil, err
	}
	if err := s.importContentLibrary(database); err != nil {
		database.Close()
		return nil, err
	}
	if err := s.importArticleFile(filepath.Join(root, "backend", "articles.json")); err != nil {
		database.Close()
		return nil, err
	}
	for _, name := range []string{"exams.json", "exam_sources.json", "exams_2024.json", "exams_2025.json"} {
		if err := s.importExamFile(database, filepath.Join(root, "backend", name)); err != nil {
			database.Close()
			return nil, err
		}
	}
	s.startFactoryRunner(root)
	return s, nil
}

func (s *Store) importArticleFile(path string) error {
	raw, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	var items []Article
	if err := json.Unmarshal(raw, &items); err != nil {
		return fmt.Errorf("load %s: %w", path, err)
	}
	if len(items) == 0 {
		return nil
	}
	return s.upsertSeedArticles(items)
}

func (s *Store) upsertSeedArticles(items []Article) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		articles := tx.Bucket([]byte(articlesBucket))
		deleted := tx.Bucket([]byte(deletedArticlesBucket))
		for _, item := range items {
			item.ID = normalizeID(item.ID)
			if deleted.Get([]byte(item.ID)) != nil {
				continue
			}
			if articles.Get([]byte(item.ID)) == nil {
				if err := putJSON(articles, item.ID, item); err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func initDB(database *bolt.DB) error {
	return database.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(progressBucket))
		if err != nil {
			return err
		}
		_, err = tx.CreateBucketIfNotExists([]byte(settingsBucket))
		if err != nil {
			return err
		}
		for _, name := range []string{contentMetaBucket, wordsBucket, pronunciationsBucket, examplesBucket, articlesBucket, articleWordsBucket, usersBucket, sessionsBucket, managedWordsBucket, deletedWordsBucket, deletedArticlesBucket, articleProgressBucket, auditLogsBucket, examPapersBucket, deletedExamsBucket, examAttemptsBucket, agentConfigBucket, agentAuditBucket, contentFactoryTasksBucket, contentFactoryDraftsBucket, contentFactoryEventsBucket, contentFactoryAssetsBucket, contentFactoryBatchesBucket, contentFactoryVersionsBucket, contentFactorySchedulesBucket, contentVersionsBucket, homeworksBucket, homeworkSubmissionsBucket, learningEventsBucket, learningPlansBucket} {
			if _, err := tx.CreateBucketIfNotExists([]byte(name)); err != nil {
				return err
			}
		}
		meta := tx.Bucket([]byte(contentMetaBucket))
		encoded, _ := json.Marshal(contentSchemaVersion)
		if err := meta.Put([]byte(contentSchemaKey), encoded); err != nil {
			return err
		}
		return nil
	})
}

func firstString(values []string) string {
	if len(values) > 0 {
		return values[0]
	}
	return ""
}
func scopedKey(userID, key string) string {
	if userID == "" {
		return key
	}
	return userID + "|" + key
}

func (s *Store) readDailyReviewGoal(userIDs ...string) (int, error) {
	goal := 10
	key := scopedKey(firstString(userIDs), dailyGoalKey)
	err := s.db.View(func(tx *bolt.Tx) error {
		raw := tx.Bucket([]byte(settingsBucket)).Get([]byte(key))
		if raw == nil {
			return nil
		}
		return json.Unmarshal(raw, &goal)
	})
	return goal, err
}

func (s *Store) saveDailyReviewGoal(goal int, userIDs ...string) error {
	encoded, err := json.Marshal(goal)
	if err != nil {
		return err
	}
	key := scopedKey(firstString(userIDs), dailyGoalKey)
	return s.db.Update(func(tx *bolt.Tx) error { return tx.Bucket([]byte(settingsBucket)).Put([]byte(key), encoded) })
}

func (s *Store) loadDataset(path, key string) error {
	raw, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var list []Word
	if err := json.Unmarshal(raw, &list); err != nil {
		return fmt.Errorf("load %s: %w", path, err)
	}
	for i := range list {
		list[i].Level = key
		s.wordIndex[progressKey(key, list[i].ID)] = list[i]
	}
	s.datasets[key] = list
	slog.Info("loaded word dataset", "dataset", key, "words", len(list), "path", path)
	return nil
}

func normalizeID(id string) string { return strings.ToLower(strings.TrimSpace(id)) }

func normalizeLevel(level string) string {
	if level == "middle" {
		return "middle"
	}
	return "primary"
}

func progressKey(level, id string) string { return normalizeLevel(level) + ":" + normalizeID(id) }

func (s *Store) findWord(level, id string) (Word, bool) {
	item, ok := s.wordIndex[progressKey(level, id)]
	return item, ok
}

func (s *Store) wordsByLevel(level string) []Word { return s.datasets[normalizeLevel(level)] }

func (s *Store) upsertManagedWords(level string, items []Word) (int, error) {
	level = normalizeLevel(level)
	count := 0
	err := s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(managedWordsBucket))
		for _, item := range items {
			if strings.TrimSpace(item.ID) == "" {
				item.ID = normalizeID(item.Word)
			}
			if item.ID == "" || strings.TrimSpace(item.Word) == "" {
				return fmt.Errorf("word id and text are required")
			}
			item.Level = level
			key := progressKey(level, item.ID)
			_ = tx.Bucket([]byte(deletedWordsBucket)).Delete([]byte(key))
			if err := putJSON(bucket, key, item); err != nil {
				return err
			}
			s.mergeWord(item)
			count++
		}
		return nil
	})
	if err == nil {
		err = s.importContentLibrary(s.db)
	}
	return count, err
}
func (s *Store) deleteManagedWord(level, id string) error {
	level = normalizeLevel(level)
	key := progressKey(level, id)
	return s.db.Update(func(tx *bolt.Tx) error {
		if err := tx.Bucket([]byte(deletedWordsBucket)).Put([]byte(key), []byte("1")); err != nil {
			return err
		}
		_ = tx.Bucket([]byte(managedWordsBucket)).Delete([]byte(key))
		s.removeWord(level, id)
		return nil
	})
}
func (s *Store) removeWord(level, id string) {
	key := progressKey(level, id)
	delete(s.wordIndex, key)
	items := s.datasets[level]
	out := items[:0]
	for _, w := range items {
		if normalizeID(w.ID) != normalizeID(id) {
			out = append(out, w)
		}
	}
	s.datasets[level] = out
}
func (s *Store) loadDeletedWords(database *bolt.DB) error {
	return database.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(deletedWordsBucket)).ForEach(func(k, _ []byte) error {
			parts := strings.SplitN(string(k), ":", 2)
			if len(parts) == 2 {
				s.removeWord(parts[0], parts[1])
			}
			return nil
		})
	})
}
func (s *Store) mergeWord(item Word) {
	level := normalizeLevel(item.Level)
	item.Level = level
	key := progressKey(level, item.ID)
	s.wordIndex[key] = item
	for i := range s.datasets[level] {
		if normalizeID(s.datasets[level][i].ID) == normalizeID(item.ID) {
			s.datasets[level][i] = item
			return
		}
	}
	s.datasets[level] = append(s.datasets[level], item)
}
func (s *Store) loadManagedWords(database *bolt.DB) error {
	return database.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(managedWordsBucket)).ForEach(func(_, v []byte) error {
			var item Word
			if err := json.Unmarshal(v, &item); err != nil {
				return err
			}
			s.mergeWord(item)
			return nil
		})
	})
}

func (s *Store) upsertArticles(items []Article) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(articlesBucket))
		for _, item := range items {
			item.ID = normalizeID(item.ID)
			if item.ID == "" || strings.TrimSpace(item.Title) == "" {
				return fmt.Errorf("article id and title are required")
			}
			_ = tx.Bucket([]byte(deletedArticlesBucket)).Delete([]byte(item.ID))
			if err := putJSON(bucket, item.ID, item); err != nil {
				return err
			}
		}
		return nil
	})
}

func (s *Store) deleteArticle(id string) error {
	id = normalizeID(id)
	return s.db.Update(func(tx *bolt.Tx) error {
		if err := tx.Bucket([]byte(deletedArticlesBucket)).Put([]byte(id), []byte("1")); err != nil {
			return err
		}
		return tx.Bucket([]byte(articlesBucket)).Delete([]byte(id))
	})
}

func (s *Store) readArticles() ([]Article, error) {
	items := make([]Article, 0)
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(articlesBucket)).ForEach(func(_, value []byte) error {
			var item Article
			if err := json.Unmarshal(value, &item); err != nil {
				return err
			}
			if item.Status == "draft" || item.Status == "archived" {
				return nil
			}
			items = append(items, item)
			return nil
		})
	})
	return items, err
}

func (s *Store) readAllArticles() ([]Article, error) {
	items := []Article{}
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(articlesBucket)).ForEach(func(_, v []byte) error {
			var item Article
			if err := json.Unmarshal(v, &item); err != nil {
				return err
			}
			items = append(items, item)
			return nil
		})
	})
	return items, err
}

func (s *Store) readArticle(id string) (Article, bool, error) {
	var item Article
	found := false
	err := s.db.View(func(tx *bolt.Tx) error {
		raw := tx.Bucket([]byte(articlesBucket)).Get([]byte(normalizeID(id)))
		if raw == nil {
			return nil
		}
		found = true
		return json.Unmarshal(raw, &item)
	})
	return item, found, err
}

func (s *Store) readProgress(userIDs ...string) (map[string]Progress, error) {
	items := map[string]Progress{}
	userID := firstString(userIDs)
	prefix := ""
	if userID != "" {
		prefix = userID + "|"
	}
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(progressBucket)).ForEach(func(key, value []byte) error {
			visible := string(key)
			if prefix != "" {
				if !strings.HasPrefix(visible, prefix) {
					return nil
				}
				visible = strings.TrimPrefix(visible, prefix)
			} else if strings.Contains(visible, "|") {
				return nil
			}
			var progress Progress
			if err := json.Unmarshal(value, &progress); err != nil {
				return err
			}
			items[visible] = progress
			return nil
		})
	})
	return items, err
}

func (s *Store) migrateLegacyProgress(database *bolt.DB) error {
	type move struct{ oldKey, newKey, value []byte }
	return database.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(progressBucket))
		moves := make([]move, 0)
		if err := bucket.ForEach(func(key, value []byte) error {
			if strings.Contains(string(key), ":") {
				return nil
			}
			level := "primary"
			if _, ok := s.findWord(level, string(key)); !ok {
				level = "middle"
			}
			moves = append(moves, move{append([]byte(nil), key...), []byte(progressKey(level, string(key))), append([]byte(nil), value...)})
			return nil
		}); err != nil {
			return err
		}
		for _, item := range moves {
			if bucket.Get(item.newKey) == nil {
				if err := bucket.Put(item.newKey, item.value); err != nil {
					return err
				}
			}
			if err := bucket.Delete(item.oldKey); err != nil {
				return err
			}
		}
		return nil
	})
}
