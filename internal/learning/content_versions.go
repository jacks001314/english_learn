package learning

import (
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	bolt "go.etcd.io/bbolt"
)

func publicContentStatus(status string) bool {
	return status == "" || status == "published"
}

func validContentStatus(status string) bool {
	return status == "draft" || status == "published" || status == "archived"
}

func contentVersionPrefix(contentType, level, id string) string {
	return strings.Join([]string{contentType, normalizeLevel(level), normalizeID(id), ""}, "|")
}

func contentVersionKey(contentType, level, id string, version int) string {
	return contentVersionPrefix(contentType, level, id) + fmt.Sprintf("%08d", version)
}

func nextContentVersion(tx *bolt.Tx, contentType, level, id string) int {
	prefix := contentVersionPrefix(contentType, level, id)
	cursor := tx.Bucket([]byte(contentVersionsBucket)).Cursor()
	version := 0
	for key, _ := cursor.Seek([]byte(prefix)); key != nil && strings.HasPrefix(string(key), prefix); key, _ = cursor.Next() {
		value := strings.TrimPrefix(string(key), prefix)
		if parsed, err := strconv.Atoi(value); err == nil && parsed > version {
			version = parsed
		}
	}
	return version + 1
}

func recordContentVersion(tx *bolt.Tx, contentType, level, id, status, action, editor string, snapshot []byte) error {
	version := nextContentVersion(tx, contentType, level, id)
	item := ContentVersion{
		ID: uuid.NewString(), ContentType: contentType, ContentID: normalizeID(id), Level: level,
		Version: version, Status: status, Action: action, Snapshot: append([]byte(nil), snapshot...),
		CreatedAt: time.Now().Format(time.RFC3339), CreatedBy: editor,
	}
	return putJSON(tx.Bucket([]byte(contentVersionsBucket)), contentVersionKey(contentType, level, id, version), item)
}

func hasContentVersions(tx *bolt.Tx, contentType, level, id string) bool {
	prefix := contentVersionPrefix(contentType, level, id)
	key, _ := tx.Bucket([]byte(contentVersionsBucket)).Cursor().Seek([]byte(prefix))
	return key != nil && strings.HasPrefix(string(key), prefix)
}

func (s *Store) listContentVersions(contentType, level, id string) ([]ContentVersion, error) {
	items := []ContentVersion{}
	prefix := contentVersionPrefix(contentType, level, id)
	err := s.db.View(func(tx *bolt.Tx) error {
		cursor := tx.Bucket([]byte(contentVersionsBucket)).Cursor()
		for key, value := cursor.Seek([]byte(prefix)); key != nil && strings.HasPrefix(string(key), prefix); key, value = cursor.Next() {
			var item ContentVersion
			if err := json.Unmarshal(value, &item); err != nil {
				return err
			}
			items = append(items, item)
		}
		return nil
	})
	sort.Slice(items, func(i, j int) bool { return items[i].Version > items[j].Version })
	return items, err
}

func (s *Store) getContentVersion(contentType, level, id string, version int) (ContentVersion, bool, error) {
	var item ContentVersion
	found := false
	err := s.db.View(func(tx *bolt.Tx) error {
		raw := tx.Bucket([]byte(contentVersionsBucket)).Get([]byte(contentVersionKey(contentType, level, id, version)))
		if raw == nil {
			return nil
		}
		found = true
		return json.Unmarshal(raw, &item)
	})
	return item, found, err
}

func (s *Store) saveManagedWordVersioned(level string, item Word, editor, action string) (Word, error) {
	level = normalizeLevel(level)
	if strings.TrimSpace(item.ID) == "" {
		item.ID = normalizeID(item.Word)
	}
	item.ID = normalizeID(item.ID)
	if item.ID == "" || strings.TrimSpace(item.Word) == "" {
		return item, fmt.Errorf("单词 ID 和英文不能为空")
	}
	if !validContentStatus(item.Status) {
		return item, fmt.Errorf("内容状态无效")
	}
	item.Level = level
	item.UpdatedAt = time.Now().Format(time.RFC3339)
	item.UpdatedBy = editor
	current, exists := s.findWord(level, item.ID)
	raw, _ := json.Marshal(item)
	err := s.db.Update(func(tx *bolt.Tx) error {
		if exists && !hasContentVersions(tx, "word", level, item.ID) {
			baseline, _ := json.Marshal(current)
			if err := recordContentVersion(tx, "word", level, item.ID, current.Status, "baseline", firstNonEmpty(current.UpdatedBy, "system"), baseline); err != nil {
				return err
			}
		}
		key := progressKey(level, item.ID)
		_ = tx.Bucket([]byte(deletedWordsBucket)).Delete([]byte(key))
		if err := putJSON(tx.Bucket([]byte(managedWordsBucket)), key, item); err != nil {
			return err
		}
		return recordContentVersion(tx, "word", level, item.ID, item.Status, action, editor, raw)
	})
	if err != nil {
		return item, err
	}
	s.mergeWord(item)
	if err := s.importContentLibrary(s.db); err != nil {
		return item, err
	}
	return item, nil
}

func (s *Store) saveArticleVersioned(item Article, editor, action string) (Article, error) {
	item.ID = normalizeID(item.ID)
	if item.ID == "" || strings.TrimSpace(item.Title) == "" {
		return item, fmt.Errorf("文章 ID 和英文标题不能为空")
	}
	if !validContentStatus(item.Status) {
		return item, fmt.Errorf("内容状态无效")
	}
	item.UpdatedAt = time.Now().Format(time.RFC3339)
	item.UpdatedBy = editor
	current, exists, err := s.readArticle(item.ID)
	if err != nil {
		return item, err
	}
	raw, _ := json.Marshal(item)
	err = s.db.Update(func(tx *bolt.Tx) error {
		if exists && !hasContentVersions(tx, "article", "", item.ID) {
			baseline, _ := json.Marshal(current)
			if err := recordContentVersion(tx, "article", "", item.ID, current.Status, "baseline", firstNonEmpty(current.UpdatedBy, "system"), baseline); err != nil {
				return err
			}
		}
		_ = tx.Bucket([]byte(deletedArticlesBucket)).Delete([]byte(item.ID))
		if err := putJSON(tx.Bucket([]byte(articlesBucket)), item.ID, item); err != nil {
			return err
		}
		return recordContentVersion(tx, "article", "", item.ID, item.Status, action, editor, raw)
	})
	return item, err
}

func (s *Store) restoreContentVersion(contentType, level, id string, version int, editor string) (any, error) {
	item, found, err := s.getContentVersion(contentType, level, id, version)
	if err != nil {
		return nil, err
	}
	if !found {
		return nil, fmt.Errorf("内容版本不存在")
	}
	switch contentType {
	case "word":
		var word Word
		if err := json.Unmarshal(item.Snapshot, &word); err != nil {
			return nil, err
		}
		word.ID = normalizeID(id)
		word.Status = firstNonEmpty(word.Status, "published")
		return s.saveManagedWordVersioned(level, word, editor, "rollback")
	case "article":
		var article Article
		if err := json.Unmarshal(item.Snapshot, &article); err != nil {
			return nil, err
		}
		article.ID = normalizeID(id)
		article.Status = firstNonEmpty(article.Status, "published")
		return s.saveArticleVersioned(article, editor, "rollback")
	default:
		return nil, fmt.Errorf("不支持的内容类型")
	}
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}
