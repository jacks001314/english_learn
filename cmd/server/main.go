package main

import (
	"flag"
	"fmt"
	"os"

	"english_learn/internal/learning"
)

func main() {
	address := flag.String("addr", "", "HTTP listen address; overrides config/env (default :8080)")
	flag.Parse()

	root, err := learning.FindProjectRoot("")
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
	cfg, err := learning.LoadConfig(root)
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
	if flagWasSet("addr") {
		cfg.Address = *address
	}
	if err := learning.RunWithConfig(cfg); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}

// flagWasSet 判断某个命令行参数是否被显式传入（用于实现“参数 > 配置 > 默认值”的优先级）。
func flagWasSet(name string) bool {
	found := false
	flag.Visit(func(f *flag.Flag) {
		if f.Name == name {
			found = true
		}
	})
	return found
}
