# 英语学习乐园

面向小学和初中学生的英语词汇学习网站，后端使用 Go、Iris、BoltDB，前端使用 Vue 3 组件化实现。

## 已实现功能

- 多用户注册、登录与安全会话，密码使用 bcrypt 哈希保存
- 学习者与管理员角色，支持账号启用、停用及角色调整
- 管理后台支持批量导入单词和文章 JSON 数据
- 首次运行管理员账号为 `admin`，初始密码为 `Admin123!`；首次登录后必须立即修改

- 小学、初中词汇分页浏览和中英文搜索
- 支持例句、年级、主题、教材单元等扩展词汇信息及筛选（词库补充后自动生效）
- 分类词库支持按年级、A–Z 首字母、词性和主题浏览，并可正序或倒序排列
- 内置完整国家名称词汇，支持中英文搜索和“国家”主题筛选
- 浏览器语音合成英语朗读，无需维护独立音频文件
- 英译中、中译英、听音选词、拼写和例句完形练习
- 每组 10 题练习结算与针对性学习建议
- 单词掌握、答题正确与错误记录
- 错题本、到期复习和学习报告
- 今日复习页面，支持按学段完成“记得/忘了”反馈
- 根据连续复习表现动态安排 1～60 天复习间隔
- BoltDB 持久化学习进度
- 小学与初中同名单词的学习记录相互隔离
- 桌面端和移动端响应式页面
- 中学生英文美文阅读馆，提供七至九年级分层原创素材
- 支持主题筛选、双语精读、全文/逐段朗读、重点词句和背诵自测
- 阅读与背诵完成状态保存在浏览器本地
- 新增热门问答主题原创合集，内容不复制第三方用户文章
- 文章首次打开时幂等导入 BoltDB，后续通过文章 API 从数据库读取

## 项目结构

```text
cmd/server/                         服务启动入口
internal/learning/model.go          数据模型
internal/learning/repository.go     数据集和 BoltDB 数据访问
internal/learning/service.go        学习业务逻辑
internal/learning/controller.go     HTTP 控制器
internal/learning/router.go         Iris 路由注册
internal/learning/run.go            应用生命周期
backend/*.json                      小学、初中词汇数据
web/js/components/                  Vue 页面与业务组件
web/js/api.js                       前端接口模块
web/js/speech.js                    语音模块
web/vendor/                         本地 Vue 运行时
docs/database-design.md             内容资源库与 BoltDB 设计
```

内容库设计（词条、读音、例句、文章及其关系）见 [数据库设计](docs/database-design.md)。

## 启动

```powershell
go run ./cmd/server
```

访问 <http://localhost:8080>。

## 编译与安装（Windows）

完整构建会执行测试、静态检查、词库质量检查、内容完整性审计，并生成独立运行目录：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build.ps1
```

如果旧版本正在运行，可构建到新的版本目录：

```powershell
.\scripts\build.ps1 -OutputDirectory "dist\english-learn-next"
```

产物位于 `dist\english-learn`。安装到当前用户目录：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

默认安装到 `%LOCALAPPDATA%\EnglishLearn`，升级安装会保留 `english_learn.db`。自定义安装目录：

```powershell
.\scripts\install.ps1 -InstallDirectory "D:\EnglishLearn"
```

卸载并保留学习数据：

```powershell
.\scripts\uninstall.ps1 -KeepData
```

如果从项目目录之外运行，可指定项目根目录：

```powershell
$env:ENGLISH_LEARN_ROOT="D:\qax\reagent\dev\english_learn"
go run ./cmd/server
```

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/admin/users`（管理员）
- `PUT /api/admin/users/{id}`（管理员）
- `POST /api/admin/import/words`（管理员）
- `POST /api/admin/import/articles`（管理员）

- `GET /api/health`
- `GET /api/stats`
- `GET /api/dashboard`
- `GET /api/words?level=primary&page=1&q=apple`
- `GET /api/word-facets?level=primary`
- `GET /api/words/{id}?level=primary`
- `GET /api/quiz?level=primary`
- `GET /api/progress`
- `POST /api/progress/{id}?level=primary`
- `GET /api/mistakes?level=primary`
- `POST /api/mistakes/{id}/resolve?level=primary`
- `GET /api/review/today?level=primary`
- `GET /api/articles`
- `GET /api/articles/{id}`
- `POST /api/articles/import`

学习数据保存在项目根目录的 `english_learn.db`。

## 检查

```powershell
go test ./...
go vet ./...
```

生成词库质量报告：

```powershell
go run ./cmd/wordcheck -output reports/word-quality.md
```

审计音标、读音来源和每个释义对应的例句：

```powershell
go run ./cmd/contentaudit -output reports/content-completeness.json
```

将独立维护的教学内容补丁合并进词库：

```powershell
go run ./cmd/enrichwords
```

按固定顺序自动合并全部人工补丁（构建时也会自动执行）：

```powershell
go run ./cmd/synccontent
```

CI 中可要求警告也使命令失败：

```powershell
go run ./cmd/wordcheck -fail-on=warning -format=json -output reports/word-quality.json
```
