package learning

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Config 汇总服务运行所需的全部可配置项。
//
// 取值优先级（后者覆盖前者）：
//  1. 内置默认值（DefaultConfig）
//  2. 可选的 config.json（默认在项目根目录，可用 ENGLISH_LEARN_CONFIG 指向别处）
//  3. 环境变量（ENGLISH_LEARN_ADDR / ENGLISH_LEARN_DB /
//     ENGLISH_LEARN_BACKUPS_DIR / ENGLISH_LEARN_LOG_LEVEL / ENGLISH_LEARN_LOG_FORMAT）
//  4. 命令行参数（由 cmd/server 在加载后覆盖 addr）
type Config struct {
	// Root 是项目根目录；相对路径（数据库、备份目录）都以它为基准解析。
	Root string
	// Address 是 HTTP 监听地址，例如 ":8081"。
	Address string
	// DatabasePath 是 BoltDB 数据库文件的绝对路径。
	DatabasePath string
	// BackupsDir 是数据库备份输出目录的绝对路径。
	BackupsDir string
	// LogLevel 取值 debug / info / warn / error。
	LogLevel string
	// LogFormat 取值 text / json。
	LogFormat string
}

const (
	defaultAddress      = ":8080"
	defaultDatabaseFile = "english_learn.db"
	defaultBackupsDir   = "backups"
	configFileEnv       = "ENGLISH_LEARN_CONFIG"
	defaultLogLevel     = "info"
	defaultLogFormat    = "text"
)

var (
	validLogLevels  = []string{"debug", "info", "warn", "error"}
	validLogFormats = []string{"text", "json"}
)

// fileConfig 是 config.json 的结构；字段留空表示“未配置”，沿用上一层取值。
type fileConfig struct {
	Addr       string `json:"addr"`
	DBPath     string `json:"dbPath"`
	BackupsDir string `json:"backupsDir"`
	LogLevel   string `json:"logLevel"`
	LogFormat  string `json:"logFormat"`
}

// DefaultConfig 返回不读取任何外部文件时的默认配置，与历史行为保持一致。
func DefaultConfig(root string) Config {
	return Config{
		Root:         root,
		Address:      defaultAddress,
		DatabasePath: filepath.Join(root, defaultDatabaseFile),
		BackupsDir:   filepath.Join(root, defaultBackupsDir),
		LogLevel:     defaultLogLevel,
		LogFormat:    defaultLogFormat,
	}
}

// LoadConfig 依次叠加 config.json 与环境变量，最后校验结果。
func LoadConfig(root string) (Config, error) {
	cfg := DefaultConfig(root)
	if err := applyConfigFile(&cfg, configFilePath(root)); err != nil {
		return cfg, err
	}
	applyEnvironment(&cfg)
	if err := cfg.Validate(); err != nil {
		return cfg, err
	}
	return cfg, nil
}

func configFilePath(root string) string {
	configured := strings.TrimSpace(os.Getenv(configFileEnv))
	if configured == "" {
		return filepath.Join(root, "config.json")
	}
	if filepath.IsAbs(configured) {
		return filepath.Clean(configured)
	}
	return filepath.Join(root, configured)
}

func applyConfigFile(cfg *Config, path string) error {
	raw, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("read config %s: %w", path, err)
	}
	var parsed fileConfig
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return fmt.Errorf("parse config %s: %w", path, err)
	}
	if value := strings.TrimSpace(parsed.Addr); value != "" {
		cfg.Address = value
	}
	if value := strings.TrimSpace(parsed.DBPath); value != "" {
		cfg.DatabasePath = resolveConfigPath(cfg.Root, value)
	}
	if value := strings.TrimSpace(parsed.BackupsDir); value != "" {
		cfg.BackupsDir = resolveConfigPath(cfg.Root, value)
	}
	if value := strings.TrimSpace(parsed.LogLevel); value != "" {
		cfg.LogLevel = strings.ToLower(value)
	}
	if value := strings.TrimSpace(parsed.LogFormat); value != "" {
		cfg.LogFormat = strings.ToLower(value)
	}
	return nil
}

func applyEnvironment(cfg *Config) {
	if value := strings.TrimSpace(os.Getenv("ENGLISH_LEARN_ADDR")); value != "" {
		cfg.Address = value
	}
	if value := strings.TrimSpace(os.Getenv("ENGLISH_LEARN_DB")); value != "" {
		cfg.DatabasePath = resolveConfigPath(cfg.Root, value)
	}
	if value := strings.TrimSpace(os.Getenv("ENGLISH_LEARN_BACKUPS_DIR")); value != "" {
		cfg.BackupsDir = resolveConfigPath(cfg.Root, value)
	}
	if value := strings.TrimSpace(os.Getenv("ENGLISH_LEARN_LOG_LEVEL")); value != "" {
		cfg.LogLevel = strings.ToLower(value)
	}
	if value := strings.TrimSpace(os.Getenv("ENGLISH_LEARN_LOG_FORMAT")); value != "" {
		cfg.LogFormat = strings.ToLower(value)
	}
}

// resolveConfigPath 把相对路径按项目根目录展开，绝对路径原样返回。
func resolveConfigPath(root, value string) string {
	if filepath.IsAbs(value) {
		return filepath.Clean(value)
	}
	return filepath.Join(root, value)
}

// Validate 检查配置取值是否合法，避免用错误配置启动服务。
func (c Config) Validate() error {
	if strings.TrimSpace(c.Root) == "" {
		return fmt.Errorf("config: root must not be empty")
	}
	if strings.TrimSpace(c.Address) == "" {
		return fmt.Errorf("config: addr must not be empty")
	}
	if strings.TrimSpace(c.DatabasePath) == "" {
		return fmt.Errorf("config: dbPath must not be empty")
	}
	if !containsString(validLogLevels, c.LogLevel) {
		return fmt.Errorf("config: logLevel %q is invalid (want one of %s)", c.LogLevel, strings.Join(validLogLevels, ", "))
	}
	if !containsString(validLogFormats, c.LogFormat) {
		return fmt.Errorf("config: logFormat %q is invalid (want one of %s)", c.LogFormat, strings.Join(validLogFormats, ", "))
	}
	return nil
}

func containsString(list []string, value string) bool {
	for _, item := range list {
		if item == value {
			return true
		}
	}
	return false
}
