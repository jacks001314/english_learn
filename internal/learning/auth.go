package learning

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kataras/iris/v12"
	bolt "go.etcd.io/bbolt"
	"golang.org/x/crypto/bcrypt"
)

const (
	sessionCookie        = "english_learn_session"
	initialAdminPassword = "Admin123!"
)

type sessionRecord struct {
	UserID    string `json:"userId"`
	ExpiresAt string `json:"expiresAt"`
}
type storedUser struct {
	ID                 string `json:"id"`
	Username           string `json:"username"`
	DisplayName        string `json:"displayName"`
	Role               string `json:"role"`
	Active             bool   `json:"active"`
	CreatedAt          string `json:"createdAt"`
	LastLoginAt        string `json:"lastLoginAt,omitempty"`
	MustChangePassword bool   `json:"mustChangePassword,omitempty"`
	PasswordHash       string `json:"passwordHash"`
}

func encodeUser(u User) storedUser {
	return storedUser{
		ID: u.ID, Username: u.Username, DisplayName: u.DisplayName, Role: u.Role,
		Active: u.Active, CreatedAt: u.CreatedAt, LastLoginAt: u.LastLoginAt,
		MustChangePassword: u.MustChangePassword, PasswordHash: u.PasswordHash,
	}
}
func decodeUser(v []byte) (User, error) {
	var s storedUser
	if err := json.Unmarshal(v, &s); err != nil {
		return User{}, err
	}
	return User{ID: s.ID, Username: s.Username, DisplayName: s.DisplayName, Role: s.Role, Active: s.Active, CreatedAt: s.CreatedAt, LastLoginAt: s.LastLoginAt, MustChangePassword: s.MustChangePassword, PasswordHash: s.PasswordHash}, nil
}
func putUser(bucket *bolt.Bucket, u User) error { return putJSON(bucket, u.ID, encodeUser(u)) }

func (s *Store) seedAdmin() error {
	return s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(usersBucket))
		if bucket.Stats().KeyN > 0 {
			return nil
		}
		hash, err := bcrypt.GenerateFromPassword([]byte(initialAdminPassword), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u := User{ID: uuid.NewString(), Username: "admin", DisplayName: "系统管理员", Role: "admin", Active: true, CreatedAt: time.Now().Format(time.RFC3339), MustChangePassword: true, PasswordHash: string(hash)}
		return putUser(bucket, u)
	})
}

func normalizeUsername(v string) string { return strings.ToLower(strings.TrimSpace(v)) }

func (s *Store) createUser(req AuthRequest) (User, error) {
	req.Username = normalizeUsername(req.Username)
	req.DisplayName = strings.TrimSpace(req.DisplayName)
	if len(req.Username) < 3 || len(req.Username) > 32 {
		return User{}, fmt.Errorf("用户名需为 3-32 个字符")
	}
	if len(req.Password) < 8 {
		return User{}, fmt.Errorf("密码至少需要 8 个字符")
	}
	if req.DisplayName == "" {
		req.DisplayName = req.Username
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return User{}, err
	}
	u := User{ID: uuid.NewString(), Username: req.Username, DisplayName: req.DisplayName, Role: "student", Active: true, CreatedAt: time.Now().Format(time.RFC3339), PasswordHash: string(hash)}
	err = s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(usersBucket))
		c := b.Cursor()
		for _, v := c.First(); v != nil; _, v = c.Next() {
			old, decodeErr := decodeUser(v)
			if decodeErr == nil && old.Username == u.Username {
				return fmt.Errorf("用户名已存在")
			}
		}
		return putUser(b, u)
	})
	return u, err
}

func (s *Store) authenticate(username, password string) (User, error) {
	var found User
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(usersBucket)).ForEach(func(_, v []byte) error {
			u, decodeErr := decodeUser(v)
			if decodeErr == nil && u.Username == normalizeUsername(username) {
				found = u
			}
			return nil
		})
	})
	if err != nil {
		return User{}, err
	}
	if found.ID == "" || bcrypt.CompareHashAndPassword([]byte(found.PasswordHash), []byte(password)) != nil {
		return User{}, fmt.Errorf("用户名或密码错误")
	}
	if !found.Active {
		return User{}, fmt.Errorf("账号已停用")
	}
	found.MustChangePassword = found.MustChangePassword || usesInitialAdminPassword(found)
	found.LastLoginAt = time.Now().Format(time.RFC3339)
	_ = s.db.Update(func(tx *bolt.Tx) error { return putUser(tx.Bucket([]byte(usersBucket)), found) })
	return found, nil
}

func (s *Store) newSession(userID string) (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	token := hex.EncodeToString(b)
	record := sessionRecord{UserID: userID, ExpiresAt: time.Now().Add(30 * 24 * time.Hour).Format(time.RFC3339)}
	return token, s.db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(sessionsBucket)), token, record) })
}
func (s *Store) deleteSession(token string) error {
	return s.db.Update(func(tx *bolt.Tx) error { return tx.Bucket([]byte(sessionsBucket)).Delete([]byte(token)) })
}
func (s *Store) userByID(id string) (User, bool, error) {
	var u User
	ok := false
	err := s.db.View(func(tx *bolt.Tx) error {
		v := tx.Bucket([]byte(usersBucket)).Get([]byte(id))
		if v == nil {
			return nil
		}
		ok = true
		var err error
		u, err = decodeUser(v)
		return err
	})
	return u, ok, err
}
func (s *Store) userFromToken(token string) (User, bool) {
	var rec sessionRecord
	err := s.db.View(func(tx *bolt.Tx) error {
		v := tx.Bucket([]byte(sessionsBucket)).Get([]byte(token))
		if v == nil {
			return fmt.Errorf("missing")
		}
		return json.Unmarshal(v, &rec)
	})
	if err != nil {
		return User{}, false
	}
	expires, _ := time.Parse(time.RFC3339, rec.ExpiresAt)
	if expires.Before(time.Now()) {
		return User{}, false
	}
	u, ok, _ := s.userByID(rec.UserID)
	if ok {
		u.MustChangePassword = u.MustChangePassword || usesInitialAdminPassword(u)
	}
	return u, ok && u.Active
}

func usesInitialAdminPassword(user User) bool {
	return user.Role == "admin" && bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(initialAdminPassword)) == nil
}
func (s *Store) currentUser(ctx iris.Context) (User, bool) {
	token := ctx.GetCookie(sessionCookie)
	if token == "" {
		return User{}, false
	}
	return s.userFromToken(token)
}
func (s *Store) requireAuth(ctx iris.Context) {
	if u, ok := s.currentUser(ctx); ok {
		ctx.Values().Set("user", u)
		ctx.Next()
		return
	}
	writeError(ctx, 401, "请先登录")
}
func (s *Store) requireAdmin(ctx iris.Context) {
	u, ok := s.currentUser(ctx)
	if !ok {
		writeError(ctx, 401, "请先登录")
		return
	}
	if u.Role != "admin" {
		writeError(ctx, 403, "需要管理员权限")
		return
	}
	ctx.Values().Set("user", u)
	ctx.Next()
}
func (s *Store) allUsers() ([]User, error) {
	items := []User{}
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(usersBucket)).ForEach(func(_, v []byte) error {
			u, err := decodeUser(v)
			if err != nil {
				return err
			}
			items = append(items, u)
			return nil
		})
	})
	sort.Slice(items, func(i, j int) bool { return items[i].CreatedAt > items[j].CreatedAt })
	return items, err
}
func (s *Store) updateUser(id string, in UserUpdate) (User, error) {
	u, ok, err := s.userByID(id)
	if err != nil || !ok {
		return User{}, fmt.Errorf("用户不存在")
	}
	if strings.TrimSpace(in.DisplayName) != "" {
		u.DisplayName = strings.TrimSpace(in.DisplayName)
	}
	if in.Role == "admin" || in.Role == "student" {
		if u.Role == "admin" && in.Role != "admin" {
			users, _ := s.allUsers()
			admins := 0
			for _, x := range users {
				if x.Role == "admin" && x.Active {
					admins++
				}
			}
			if admins <= 1 {
				return User{}, fmt.Errorf("必须至少保留一名有效管理员")
			}
		}
		u.Role = in.Role
	}
	if in.Active != nil {
		if u.Role == "admin" && u.Active && !*in.Active {
			users, _ := s.allUsers()
			admins := 0
			for _, x := range users {
				if x.Role == "admin" && x.Active {
					admins++
				}
			}
			if admins <= 1 {
				return User{}, fmt.Errorf("不能停用最后一名管理员")
			}
		}
		u.Active = *in.Active
	}
	err = s.db.Update(func(tx *bolt.Tx) error { return putUser(tx.Bucket([]byte(usersBucket)), u) })
	return u, err
}

func (s *Store) adminResetPassword(id, password string) error {
	if len(password) < 8 {
		return fmt.Errorf("新密码至少需要 8 个字符")
	}
	u, ok, err := s.userByID(id)
	if err != nil || !ok {
		return fmt.Errorf("用户不存在")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hash)
	return s.db.Update(func(tx *bolt.Tx) error { return putUser(tx.Bucket([]byte(usersBucket)), u) })
}

func (s *Store) changePassword(user User, in PasswordChange) error {
	if len(in.NewPassword) < 8 {
		return fmt.Errorf("新密码至少需要 8 个字符")
	}
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(in.CurrentPassword)) != nil {
		return fmt.Errorf("当前密码错误")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(in.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.PasswordHash = string(hash)
	user.MustChangePassword = false
	return s.db.Update(func(tx *bolt.Tx) error { return putUser(tx.Bucket([]byte(usersBucket)), user) })
}

func (s *Store) writeAudit(user User, action, detail string) error {
	item := AuditLog{ID: uuid.NewString(), UserID: user.ID, Username: user.Username, Action: action, Detail: detail, CreatedAt: time.Now().Format(time.RFC3339)}
	return s.db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(auditLogsBucket)), item.ID, item) })
}
func (s *Store) recentAudits() ([]AuditLog, error) {
	items := []AuditLog{}
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(auditLogsBucket)).ForEach(func(_, v []byte) error {
			var x AuditLog
			if err := json.Unmarshal(v, &x); err != nil {
				return err
			}
			items = append(items, x)
			return nil
		})
	})
	sort.Slice(items, func(i, j int) bool { return items[i].CreatedAt > items[j].CreatedAt })
	if len(items) > 50 {
		items = items[:50]
	}
	return items, err
}
func (s *Store) platformStats() (PlatformStats, error) {
	result := PlatformStats{Words: len(s.datasets["primary"]) + len(s.datasets["middle"])}
	users, err := s.allUsers()
	if err != nil {
		return result, err
	}
	result.Users = len(users)
	for _, u := range users {
		if u.Active {
			result.ActiveUsers++
		}
		if u.Role == "admin" {
			result.Admins++
		}
	}
	content, err := contentLibraryStats(s.db)
	if err != nil {
		return result, err
	}
	result.Articles = content.Articles
	err = s.db.View(func(tx *bolt.Tx) error { result.Sessions = tx.Bucket([]byte(sessionsBucket)).Stats().KeyN; return nil })
	return result, err
}

func (s *Store) saveArticleProgress(userID string, in ArticleProgress) (ArticleProgress, error) {
	if strings.TrimSpace(in.ArticleID) == "" {
		return in, fmt.Errorf("article id required")
	}
	now := time.Now()
	in.UpdatedAt = now.Format(time.RFC3339)
	key := scopedKey(userID, normalizeID(in.ArticleID))
	planLevel := "middle"
	if article, ok, _ := s.readArticle(in.ArticleID); ok && articleMatchesLevel(article, "primary") {
		planLevel = "primary"
	}
	err := s.db.Update(func(tx *bolt.Tx) error {
		if err := putJSON(tx.Bucket([]byte(articleProgressBucket)), key, in); err != nil {
			return err
		}
		if err := recordLearningEventTx(tx, LearningEvent{UserID: userID, Type: "article_progress", ContentType: "article", ContentID: normalizeID(in.ArticleID), Source: "reading", Details: map[string]any{"completed": in.Completed, "memorized": in.Memorized}, CreatedAt: now.Format(time.RFC3339Nano)}); err != nil {
			return err
		}
		if in.Completed {
			return completeMatchingPlanTaskTx(tx, userID, planLevel, "reading", now)
		}
		return nil
	})
	return in, err
}
func (s *Store) readArticleProgress(userID string) (map[string]ArticleProgress, error) {
	result := map[string]ArticleProgress{}
	prefix := userID + "|"
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(articleProgressBucket)).ForEach(func(k, v []byte) error {
			key := string(k)
			if !strings.HasPrefix(key, prefix) {
				return nil
			}
			var x ArticleProgress
			if err := json.Unmarshal(v, &x); err != nil {
				return err
			}
			result[x.ArticleID] = x
			return nil
		})
	})
	return result, err
}
