package learning

import (
	bolt "go.etcd.io/bbolt"
)

// Store 是进程内的数据访问实例：持有 BoltDB 句柄与内存中的词库视图。
// 所有持久化与词库读写都经由该实例完成，包内不再存在可变的包级数据库状态。
type Store struct {
	db        *bolt.DB
	datasets  map[string][]Word
	wordIndex map[string]Word
}

// DB 暴露底层 BoltDB 句柄，供备份等只读/管理场景使用。
func (s *Store) DB() *bolt.DB { return s.db }

// Close 关闭底层数据库；对 nil 实例与未打开的实例都返回 nil。
func (s *Store) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}
