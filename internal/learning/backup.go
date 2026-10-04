package learning

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	bolt "go.etcd.io/bbolt"
)

const (
	backupFilePrefix       = "english_learn-"
	backupTimestampLayout  = "20060102-150405"
	preRestoreSuffixFormat = ".pre-restore-%s"
	// offlineLockTimeout 是离线打开数据库时等待文件锁的时间。
	offlineLockTimeout = 2 * time.Second
)

// ErrDatabaseLocked 表示数据库文件被正在运行的服务进程独占，无法离线读写。
var ErrDatabaseLocked = errors.New("database file is locked by a running server; stop the service or use the admin backup API")

// BackupInfo 描述一个备份文件。
type BackupInfo struct {
	Name      string `json:"name"`
	Path      string `json:"path"`
	SizeBytes int64  `json:"sizeBytes"`
	CreatedAt string `json:"createdAt"`
}

// CreateBackup 对当前进程已打开的数据库做一致性快照（在线备份）。
// 它复用 bbolt 的只读事务 Tx.WriteTo，快照期间不阻塞读写请求。
func (s *Store) CreateBackup(destDir string) (string, error) {
	if s.db == nil {
		return "", errors.New("database is not open")
	}
	dest, err := nextBackupPath(destDir)
	if err != nil {
		return "", err
	}
	err = writeSnapshot(dest, func(w io.Writer) error {
		return s.db.View(func(tx *bolt.Tx) error {
			_, err := tx.WriteTo(w)
			return err
		})
	})
	if err != nil {
		return "", err
	}
	return dest, nil
}

// CreateBackupFromFile 离线备份：直接读取数据库文件，要求没有其它进程持有它。
func CreateBackupFromFile(databasePath, destDir string) (string, error) {
	handle, err := OpenDatabaseReadOnly(databasePath)
	if err != nil {
		return "", err
	}
	defer handle.Close()
	dest, err := nextBackupPath(destDir)
	if err != nil {
		return "", err
	}
	err = writeSnapshot(dest, func(w io.Writer) error {
		return handle.View(func(tx *bolt.Tx) error {
			_, err := tx.WriteTo(w)
			return err
		})
	})
	if err != nil {
		return "", err
	}
	return dest, nil
}

// OpenDatabaseReadOnly 以只读方式打开数据库文件；被占用时返回 ErrDatabaseLocked。
func OpenDatabaseReadOnly(path string) (*bolt.DB, error) {
	handle, err := bolt.Open(path, 0o600, &bolt.Options{ReadOnly: true, Timeout: offlineLockTimeout})
	if err != nil {
		if errors.Is(err, bolt.ErrTimeout) {
			return nil, fmt.Errorf("%w (%s)", ErrDatabaseLocked, path)
		}
		return nil, fmt.Errorf("open %s: %w", path, err)
	}
	return handle, nil
}

// VerifyDatabase 打开备份并跑一遍 bbolt 的页级一致性检查。
func VerifyDatabase(path string) error {
	handle, err := OpenDatabaseReadOnly(path)
	if err != nil {
		return err
	}
	defer handle.Close()
	return handle.View(func(tx *bolt.Tx) error {
		for checkErr := range tx.Check() {
			if checkErr != nil {
				return checkErr
			}
		}
		return nil
	})
}

// RestoreDatabase 用备份文件替换配置里的数据库，返回旧库的保存路径。
//
// 恢复要求服务进程已经停止（否则返回 ErrDatabaseLocked）；
// 旧库会先另存为 <db>.pre-restore-<时间戳>，再用临时文件 + rename 原子替换。
func RestoreDatabase(cfg Config, backupPath string) (string, error) {
	if err := VerifyDatabase(backupPath); err != nil {
		return "", fmt.Errorf("verify backup %s: %w", backupPath, err)
	}
	target := cfg.DatabasePath
	saved := ""
	if _, err := os.Stat(target); err == nil {
		handle, err := openDatabaseExclusive(target)
		if err != nil {
			return "", err
		}
		_ = handle.Close()
		saved = target + fmt.Sprintf(preRestoreSuffixFormat, time.Now().Format(backupTimestampLayout))
		if err := copyFile(target, saved); err != nil {
			return "", fmt.Errorf("backup current database: %w", err)
		}
	} else if !os.IsNotExist(err) {
		return "", err
	}
	raw, err := os.ReadFile(backupPath)
	if err != nil {
		return "", err
	}
	temp := target + ".restoring"
	if err := os.WriteFile(temp, raw, 0o600); err != nil {
		return "", err
	}
	if err := os.Rename(temp, target); err != nil {
		_ = os.Remove(temp)
		return "", err
	}
	return saved, nil
}

// ListBackups 返回目录中的备份文件，按创建时间从新到旧排序。
func ListBackups(dir string) ([]BackupInfo, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return []BackupInfo{}, nil
		}
		return nil, err
	}
	items := make([]BackupInfo, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if !strings.HasPrefix(name, backupFilePrefix) || !strings.HasSuffix(name, ".db") {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			return nil, err
		}
		items = append(items, BackupInfo{
			Name:      name,
			Path:      filepath.Join(dir, name),
			SizeBytes: info.Size(),
			CreatedAt: info.ModTime().Format(time.RFC3339),
		})
	}
	sort.Slice(items, func(i, j int) bool { return items[i].CreatedAt > items[j].CreatedAt })
	return items, nil
}

// openDatabaseExclusive 尝试独占打开数据库，用来判断服务是否还在运行。
func openDatabaseExclusive(path string) (*bolt.DB, error) {
	handle, err := bolt.Open(path, 0o600, &bolt.Options{Timeout: offlineLockTimeout})
	if err != nil {
		if errors.Is(err, bolt.ErrTimeout) {
			return nil, fmt.Errorf("%w (%s)", ErrDatabaseLocked, path)
		}
		return nil, fmt.Errorf("open %s: %w", path, err)
	}
	return handle, nil
}

func nextBackupPath(destDir string) (string, error) {
	if err := os.MkdirAll(destDir, 0o755); err != nil {
		return "", fmt.Errorf("create backups dir %s: %w", destDir, err)
	}
	base := backupFilePrefix + time.Now().Format(backupTimestampLayout)
	candidate := filepath.Join(destDir, base+".db")
	for i := 1; ; i++ {
		if _, err := os.Stat(candidate); os.IsNotExist(err) {
			return candidate, nil
		}
		candidate = filepath.Join(destDir, fmt.Sprintf("%s-%d.db", base, i))
	}
}

// writeSnapshot 先写临时文件再 rename，避免留下半截备份。
func writeSnapshot(dest string, write func(io.Writer) error) error {
	temp := dest + ".partial"
	file, err := os.OpenFile(temp, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o600)
	if err != nil {
		return err
	}
	if err := write(file); err != nil {
		_ = file.Close()
		_ = os.Remove(temp)
		return err
	}
	if err := file.Sync(); err != nil {
		_ = file.Close()
		_ = os.Remove(temp)
		return err
	}
	if err := file.Close(); err != nil {
		_ = os.Remove(temp)
		return err
	}
	if err := os.Rename(temp, dest); err != nil {
		_ = os.Remove(temp)
		return err
	}
	return nil
}

func copyFile(source, dest string) error {
	in, err := os.Open(source)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.OpenFile(dest, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o600)
	if err != nil {
		return err
	}
	if _, err := io.Copy(out, in); err != nil {
		_ = out.Close()
		return err
	}
	return out.Close()
}
