package learning

import (
	"log/slog"
	"os"
	"strings"
)

// Run 是历史入口：先加载 config.json 与环境变量，再用显式传入的 address 覆盖监听地址。
func Run(root, address string) error {
	cfg, err := LoadConfig(root)
	if err != nil {
		return err
	}
	if strings.TrimSpace(address) != "" {
		cfg.Address = address
	}
	return RunWithConfig(cfg)
}

// RunWithConfig 按给定配置启动 HTTP 服务。
// 日志级别与格式来自配置，Iris 的框架日志也会汇总到同一个日志器。
func RunWithConfig(cfg Config) error {
	if err := cfg.Validate(); err != nil {
		return err
	}
	logger := NewAppLogger(cfg, os.Stdout)
	slog.SetDefault(logger)
	store, err := openStore(cfg)
	if err != nil {
		return err
	}
	defer store.Close()

	app := newAppWithConfig(cfg, store, logger)
	logger.Info("english-learn listening",
		"addr", cfg.Address,
		"db", cfg.DatabasePath,
		"backupsDir", cfg.BackupsDir,
		"logLevel", cfg.LogLevel,
		"logFormat", cfg.LogFormat,
	)
	return app.Listen(cfg.Address)
}
