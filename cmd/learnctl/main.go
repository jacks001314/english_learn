// Command learnctl 是 Lingo Bloom 的运维小工具：
// 备份 / 校验 / 恢复 BoltDB 数据库，并打印当前生效的配置。
//
// 用法示例：
//
//	learnctl config
//	learnctl backup --out backups
//	learnctl backup --online --base http://127.0.0.1:8081 --username admin --password xxx
//	learnctl list
//	learnctl verify --file backups/english_learn-20261004-120000.db
//	learnctl restore --from backups/english_learn-20261004-120000.db --yes
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"english_learn/internal/learning"
)

const usageText = `learnctl — Lingo Bloom 运维工具

用法：
  learnctl config  [--root DIR]                                 打印生效配置
  learnctl backup  [--root DIR] [--out DIR]                     离线备份（要求服务已停止）
  learnctl backup  --online --base URL --username U --password P 在线备份（走管理端接口）
  learnctl list    [--root DIR]                                 列出备份
  learnctl verify  --file FILE                                  校验备份文件完整性
  learnctl restore [--root DIR] --from FILE [--yes]             用备份恢复数据库（要求服务已停止）

通用参数：
  --root DIR   项目根目录，默认自动向上查找（也可用 ENGLISH_LEARN_ROOT 指定）
`

func main() {
	if len(os.Args) < 2 {
		fmt.Fprint(os.Stderr, usageText)
		os.Exit(2)
	}
	command, args := os.Args[1], os.Args[2:]
	var err error
	switch command {
	case "config":
		err = runConfig(args)
	case "backup":
		err = runBackup(args)
	case "list":
		err = runList(args)
	case "verify":
		err = runVerify(args)
	case "restore":
		err = runRestore(args)
	case "help", "-h", "--help":
		fmt.Print(usageText)
		return
	default:
		fmt.Fprintf(os.Stderr, "unknown command %q\n\n%s", command, usageText)
		os.Exit(2)
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}

func resolveConfig(root string) (learning.Config, error) {
	resolved, err := learning.FindProjectRoot(root)
	if err != nil {
		return learning.Config{}, err
	}
	return learning.LoadConfig(resolved)
}

func runConfig(args []string) error {
	fs := flag.NewFlagSet("config", flag.ExitOnError)
	root := fs.String("root", "", "project root")
	_ = fs.Parse(args)
	cfg, err := resolveConfig(*root)
	if err != nil {
		return err
	}
	raw, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	fmt.Println(string(raw))
	return nil
}

func runBackup(args []string) error {
	fs := flag.NewFlagSet("backup", flag.ExitOnError)
	root := fs.String("root", "", "project root")
	out := fs.String("out", "", "backup output directory (default <root>/backups)")
	online := fs.Bool("online", false, "ask the running server to back itself up (uses the admin API)")
	base := fs.String("base", "http://127.0.0.1:8080", "server base URL for --online")
	username := fs.String("username", "", "admin username for --online")
	password := fs.String("password", "", "admin password for --online")
	_ = fs.Parse(args)

	cfg, err := resolveConfig(*root)
	if err != nil {
		return err
	}
	dest := *out
	if strings.TrimSpace(dest) == "" {
		dest = cfg.BackupsDir
	}
	if *online {
		path, err := onlineBackup(*base, *username, *password)
		if err != nil {
			return err
		}
		fmt.Println(path)
		return nil
	}
	path, err := learning.CreateBackupFromFile(cfg.DatabasePath, dest)
	if err != nil {
		return err
	}
	fmt.Println(path)
	return nil
}

func runList(args []string) error {
	fs := flag.NewFlagSet("list", flag.ExitOnError)
	root := fs.String("root", "", "project root")
	_ = fs.Parse(args)
	cfg, err := resolveConfig(*root)
	if err != nil {
		return err
	}
	items, err := learning.ListBackups(cfg.BackupsDir)
	if err != nil {
		return err
	}
	if len(items) == 0 {
		fmt.Printf("no backups in %s\n", cfg.BackupsDir)
		return nil
	}
	fmt.Printf("%-48s %12s  %s\n", "name", "size", "createdAt")
	for _, item := range items {
		fmt.Printf("%-48s %10.1fKB  %s\n", item.Name, float64(item.SizeBytes)/1024, item.CreatedAt)
	}
	return nil
}

func runVerify(args []string) error {
	fs := flag.NewFlagSet("verify", flag.ExitOnError)
	file := fs.String("file", "", "backup file to verify")
	_ = fs.Parse(args)
	if strings.TrimSpace(*file) == "" {
		return fmt.Errorf("--file is required")
	}
	if err := learning.VerifyDatabase(*file); err != nil {
		return err
	}
	fmt.Printf("ok: %s is a consistent BoltDB file\n", *file)
	return nil
}

func runRestore(args []string) error {
	fs := flag.NewFlagSet("restore", flag.ExitOnError)
	root := fs.String("root", "", "project root")
	from := fs.String("from", "", "backup file to restore from")
	yes := fs.Bool("yes", false, "confirm the restore")
	_ = fs.Parse(args)
	if strings.TrimSpace(*from) == "" {
		return fmt.Errorf("--from is required")
	}
	cfg, err := resolveConfig(*root)
	if err != nil {
		return err
	}
	if !*yes {
		return fmt.Errorf("restore replaces %s; re-run with --yes to confirm", cfg.DatabasePath)
	}
	saved, err := learning.RestoreDatabase(cfg, *from)
	if err != nil {
		return err
	}
	fmt.Printf("restored %s from %s\n", cfg.DatabasePath, *from)
	if saved != "" {
		fmt.Printf("previous database kept at %s\n", saved)
	}
	return nil
}

// onlineBackup 登录管理端并触发一次服务器内的在线备份。
func onlineBackup(base, username, password string) (string, error) {
	if strings.TrimSpace(username) == "" || strings.TrimSpace(password) == "" {
		return "", fmt.Errorf("--online requires --username and --password")
	}
	client := &http.Client{Timeout: 60 * time.Second}
	endpoint := strings.TrimRight(base, "/")
	body, err := json.Marshal(map[string]string{"username": username, "password": password})
	if err != nil {
		return "", err
	}
	loginResp, err := client.Post(endpoint+"/api/auth/login", "application/json", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	defer loginResp.Body.Close()
	if loginResp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("login failed: HTTP %d", loginResp.StatusCode)
	}
	var session *http.Cookie
	for _, cookie := range loginResp.Cookies() {
		if cookie.Name == "english_learn_session" {
			session = cookie
		}
	}
	if session == nil {
		return "", fmt.Errorf("login succeeded but no session cookie was returned")
	}
	req, err := http.NewRequest(http.MethodPost, endpoint+"/api/admin/backup", nil)
	if err != nil {
		return "", err
	}
	req.AddCookie(session)
	backupResp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer backupResp.Body.Close()
	var payload struct {
		Path  string `json:"path"`
		Error string `json:"error"`
	}
	if err := json.NewDecoder(backupResp.Body).Decode(&payload); err != nil {
		return "", fmt.Errorf("decode backup response: %w", err)
	}
	if backupResp.StatusCode != http.StatusOK {
		if payload.Error != "" {
			return "", fmt.Errorf("backup failed: %s", payload.Error)
		}
		return "", fmt.Errorf("backup failed: HTTP %d", backupResp.StatusCode)
	}
	return payload.Path, nil
}
