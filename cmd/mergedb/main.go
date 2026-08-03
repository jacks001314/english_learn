package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"

	bolt "go.etcd.io/bbolt"
)

type source struct {
	path     string
	modified int64
}

func main() {
	target := flag.String("target", "", "merged database output")
	flag.Parse()
	if *target == "" || flag.NArg() == 0 {
		fmt.Fprintln(os.Stderr, "usage: mergedb -target output.db source1.db [source2.db ...]")
		os.Exit(2)
	}
	absTarget, _ := filepath.Abs(*target)
	sources := []source{}
	seen := map[string]bool{}
	for _, path := range flag.Args() {
		abs, _ := filepath.Abs(path)
		if abs == absTarget || seen[abs] {
			continue
		}
		info, err := os.Stat(abs)
		if err != nil || info.IsDir() {
			continue
		}
		seen[abs] = true
		sources = append(sources, source{abs, info.ModTime().UnixNano()})
	}
	sort.Slice(sources, func(i, j int) bool { return sources[i].modified < sources[j].modified })
	if len(sources) == 0 {
		fmt.Fprintln(os.Stderr, "no readable database sources")
		os.Exit(1)
	}
	_ = os.Remove(absTarget)
	targetDB, err := bolt.Open(absTarget, 0600, nil)
	if err != nil {
		panic(err)
	}
	defer targetDB.Close()
	for _, src := range sources {
		count, err := merge(targetDB, src.path)
		if err != nil {
			panic(fmt.Errorf("merge %s: %w", src.path, err))
		}
		fmt.Printf("merged %-70s %d records\n", src.path, count)
	}
}

func merge(target *bolt.DB, path string) (int, error) {
	options := &bolt.Options{ReadOnly: true, Timeout: 3 * time.Second}
	sourceDB, err := bolt.Open(path, 0600, options)
	if err != nil {
		return 0, err
	}
	defer sourceDB.Close()
	count := 0
	err = sourceDB.View(func(stx *bolt.Tx) error {
		return target.Update(func(ttx *bolt.Tx) error {
			return stx.ForEach(func(name []byte, sb *bolt.Bucket) error {
				tb, err := ttx.CreateBucketIfNotExists(name)
				if err != nil {
					return err
				}
				return copyBucket(tb, sb, &count)
			})
		})
	})
	return count, err
}
func copyBucket(target, source *bolt.Bucket, count *int) error {
	return source.ForEach(func(k, v []byte) error {
		if v != nil {
			*count++
			return target.Put(k, append([]byte(nil), v...))
		}
		child, err := target.CreateBucketIfNotExists(k)
		if err != nil {
			return err
		}
		return copyBucket(child, source.Bucket(k), count)
	})
}
