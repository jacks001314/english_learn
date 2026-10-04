package learning

import (
	"log/slog"
	"net/http"
	"path/filepath"

	"github.com/kataras/iris/v12"
)

// AdminBackup 触发一次在线数据库备份（bbolt 一致性快照），返回快照文件路径。
func (c *Controller) AdminBackup(ctx iris.Context) {
	user, ok := c.store.currentUser(ctx)
	if !ok {
		writeError(ctx, http.StatusForbidden, "需要管理员权限")
		return
	}
	path, err := c.store.CreateBackup(c.backupsDir)
	if err != nil {
		slog.Error("database backup failed", "error", err.Error(), "user", user.Username)
		writeError(ctx, http.StatusInternalServerError, "备份失败："+err.Error())
		return
	}
	slog.Info("database backup created", "path", path, "user", user.Username)
	_ = c.store.writeAudit(user, "database.backup", path)
	_ = ctx.JSON(iris.Map{"name": filepath.Base(path), "path": path})
}

// AdminBackups 列出已有备份文件（按时间从新到旧）。
func (c *Controller) AdminBackups(ctx iris.Context) {
	items, err := ListBackups(c.backupsDir)
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "读取备份目录失败："+err.Error())
		return
	}
	_ = ctx.JSON(iris.Map{"dir": c.backupsDir, "backups": items})
}
