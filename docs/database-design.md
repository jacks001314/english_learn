# 内容数据库设计

## 目标

教学内容和学习数据分离。词汇、读音、例句、文章可以独立新增、修订和发布，学习进度不会因内容升级而丢失。

## BoltDB 分桶

| Bucket | Key | Value | 用途 |
| --- | --- | --- | --- |
| `content_meta` | `schema_version` | 整数 | 内容库结构版本 |
| `words` | `word_id` | `WordEntry` | 基础词条库 |
| `pronunciations` | `pronunciation_id` | `Pronunciation` | 音标与音频资源，可一词多读音 |
| `examples` | `example_id` | `ExampleSentence` | 例句库，可一词多例句 |
| `articles` | `article_id` | `Article` | 短文、阅读材料、翻译与难度信息 |
| `article_words` | `article_id:word_id` | 关联元数据 | 文章与重点词汇的多对多关系 |
| `progress` | `student_id:level:word_id` | `Progress` | 学习进度；当前阶段暂为 `level:word_id` |
| `settings` | 设置键 | JSON | 每日目标等用户设置 |

## 稳定 ID

- 词条 ID 不使用数据库自增值，使用稳定规范化 ID。
- 读音、例句、文章使用独立 ID，不嵌入词条对象。
- 内容修订不得修改已有稳定 ID；删除内容采用停用标记或迁移记录。
- 学习进度只引用词条 ID，不保存词条副本。

## 关系

```text
WordEntry 1 ── N Pronunciation
WordEntry 1 ── N ExampleSentence
Article   N ── N WordEntry
Student   1 ── N Progress ── 1 WordEntry
```

## 内容完整性约束

- 每个 `WordEntry` 至少有一个 `WordSense`。
- 每个词至少有一个 `Pronunciation`，其中音标为必填项。
- 音频地址与来源为可选增强项；当前默认使用浏览器语音合成朗读。
- 多义词按不同 `WordSense.id` 拆分，不允许只保存一段无法关联的混合释义。
- 兼容 JSON 使用 `senses[]` 保存释义 ID、释义文本及对应双语例句，导入内容库后拆为独立资源。
- 每个 `WordSense` 至少有一个 `ExampleSentence`，例句必须包含英文、翻译和 `senseId`。
- 浏览器语音合成是当前默认朗读能力，不要求为每个词保存独立音频文件。
- 内容导入必须通过 `contentaudit -strict` 后才能成为正式发布内容。

## 迁移策略

1. 当前 `backend/*.json` 继续作为兼容导入源。
2. 导入时把词条基础信息写入 `words`，音标写入 `pronunciations`，例句写入 `examples`。
3. API 暂时组合这些资源并返回现有 `Word` 读模型，前端无需立即修改。
4. 后续增加文章导入器、内容版本号和增量迁移。
5. 多用户阶段将进度键迁移为 `student_id:level:word_id`。

## 后续扩展

- 语法知识库 `grammar_notes`
- 图片与视频资源库 `media_assets`
- 教材、年级、单元关系库 `curriculum_links`
- 内容来源、版权、审核状态和发布时间
- 全文搜索索引与内容版本回滚
