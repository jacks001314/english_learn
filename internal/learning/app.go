package learning

import (
	"log/slog"

	"github.com/kataras/iris/v12"
)

func newApp(store *Store, root string) *iris.Application {
	return newAppWithConfig(DefaultConfig(root), store, nil)
}

// newAppWithConfig 按配置搭建 Iris 应用。store 是数据访问实例。
// 传入 logger 时会把 Iris 自带的 golog 输出接到同一个结构化日志器上；
// 传 nil 时保持框架默认日志行为（单元测试走这条路径）。
func newAppWithConfig(cfg Config, store *Store, logger *slog.Logger) *iris.Application {
	app := iris.New()
	if logger != nil {
		bridgeFrameworkLog(app, cfg.LogLevel, logger)
	}
	controller := NewController(store, cfg.Root, cfg.BackupsDir)
	RegisterRoutes(store, app, controller, cfg.Root)
	return app
}
