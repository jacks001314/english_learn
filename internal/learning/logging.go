package learning

import (
	"io"
	"log/slog"
	"os"
	"regexp"
	"strings"

	"github.com/kataras/iris/v12"
)

// ansiPattern 匹配终端颜色控制序列；Iris 的启动横幅在终端里会带颜色，
// 转成结构化日志时需要先剥掉，否则 JSON 值里会混入转义字符。
var ansiPattern = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)

// NewAppLogger 按配置构造结构化日志器（log/slog）。
// level 控制最低输出级别，format 决定 text 还是 json 编码。
func NewAppLogger(cfg Config, out io.Writer) *slog.Logger {
	if out == nil {
		out = os.Stdout
	}
	options := &slog.HandlerOptions{Level: ParseLogLevel(cfg.LogLevel)}
	var handler slog.Handler
	if strings.EqualFold(cfg.LogFormat, "json") {
		handler = slog.NewJSONHandler(out, options)
	} else {
		handler = slog.NewTextHandler(out, options)
	}
	return slog.New(handler)
}

// ParseLogLevel 把配置里的级别名转成 slog.Level，未知取值按 info 处理。
func ParseLogLevel(name string) slog.Level {
	switch strings.ToLower(strings.TrimSpace(name)) {
	case "debug":
		return slog.LevelDebug
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}

// irisLogWriter 承接 Iris 直接写到 stdout 的原始文本（启动横幅等），
// 按行转发到结构化日志，让框架输出与应用输出格式一致。
type irisLogWriter struct{ logger *slog.Logger }

func (w irisLogWriter) Write(p []byte) (int, error) {
	for _, line := range strings.Split(string(p), "\n") {
		line = strings.TrimSpace(ansiPattern.ReplaceAllString(line, ""))
		if line == "" {
			continue
		}
		w.logger.Info(line, "component", "iris")
	}
	return len(p), nil
}

// bridgeFrameworkLog 把 Iris/golog 的两条输出通道都接到结构化日志上：
//   - 带级别的消息经 Install 处理器转发（保留原级别）；
//   - 直接写 stdout 的启动横幅替换 Printer 输出，按行转发。
func bridgeFrameworkLog(app *iris.Application, level string, logger *slog.Logger) {
	app.Logger().SetLevel(strings.ToLower(strings.TrimSpace(level)))
	app.Logger().SetOutput(irisLogWriter{logger: logger})
	app.Logger().Install(logger)
}
