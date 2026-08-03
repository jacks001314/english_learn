# AI 内容工厂

管理员入口为“AI 内容工厂”。系统采用持久化后台任务，不会在 HTTP 请求内等待长时间识别。

## 支持的输入

- 公开 HTTP/HTTPS 网页和附件，包含内网与本机地址拦截。
- PDF：文本层提取；扫描件自动转视觉识别。
- DOCX：读取文档 XML 并保留段落和表格分隔。
- PNG、JPG、WEBP：优先 Tesseract，缺失时使用 Codex 视觉。
- TXT、Markdown。
- MP3、WAV、M4A、MP4、MOV、WEBM：读取媒体时长；存在 Whisper CLI 时自动转写。

## 流水线

1. 素材保存、SHA-256 和重复检测。
2. 文档提取、OCR、视觉识别或媒体转写。
3. Codex Core 或 Claude Code 生成严格 JSON。
4. 文章完整度、题号、选项、答案和总分规则校验。
5. 管理员对照提取文本编辑结构化草稿。
6. 审核发布到正式文章或试卷数据库。
7. 保存发布批次与旧版本快照，支持回滚。

## 安全边界

- 学生端智能体无本地工具权限。
- Claude Code 内容任务使用 Plan 模式，并禁用 Bash、文件、网络和任务工具。
- Codex 视觉只接收管理员上传或白名单下载后保存的图片页。
- 智能体不能直接发布，必须通过服务器校验和管理员审核。
- API Key 和 Token 不返回浏览器明文。
- 下载限制 30MB、最多五次重定向，拒绝本机、私网和链路本地地址。

## 可选运行依赖

```powershell
npm install -g @anthropic-ai/claude-code
```

PDF 工具：`pdftotext`、`pdftoppm`。

本地 OCR：`tesseract`，建议安装 `eng` 与 `chi_sim` 语言包。

媒体转写：`whisper` 或 `whisper-cli`。缺失时素材仍会保留，并在审核页显示待转写警告。

## 数据库 Bucket

- `content_factory_tasks`
- `content_factory_assets`
- `content_factory_events`
- `content_factory_drafts`
- `content_factory_versions`
- `content_factory_batches`
- `content_factory_schedules`

任务、草稿、事件和发布批次均会参与现有数据库合并流程，重新构建不会清空。
