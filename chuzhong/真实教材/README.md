# 真实教材内容（扫描件整理）

本目录存放从**教材原书扫描件**中提取、整理的课程学习内容，用于「课程学习」页面。

## 与 `原创课文/` 的区别

| 目录 | 内容来源 | 用途 |
| --- | --- | --- |
| `原创课文/` | **原创编写**，非教材原文 | 规避版权风险的替代课文 |
| `真实教材/`（本目录） | **教材原书扫描件**提取 | 与教材逐页对应的同步学习内容 |

`internal/learning/course.go` 的加载顺序为：**先读 `真实教材/`，读不到再回退到 `vocab/` + `原创课文/`**。

## 目录结构

```text
真实教材/
├── README.md（本文件）
└── 七年级上册/
    ├── book.json                  # 书级元数据（附录音频：发音指南 / 专有名词）
    ├── vocab.json                 # 教材 Words and expressions 词汇表（298 条）
    └── units/
        ├── 00-starter.json        # Starter Welcome to junior high!
        ├── 01-unit1.json          # Unit 1 A new start
        ├── 02-unit2.json          # Unit 2 More than fun
        ├── 03-unit3.json          # Unit 3 Family ties
        ├── 04-unit4.json          # Unit 4 Time to celebrate
        ├── 05-unit5.json          # Unit 5 The power of plants
        └── 06-unit6.json          # Unit 6 Fantastic friends
```

> 注意：本册教材实际单元顺序为 **Unit 5 The power of plants**、**Unit 6 Fantastic friends**，
> 与旧版整理数据中的顺序相反，本目录以教材原书为准。

## 每个单元包含的内容

每个 `units/*.json` 中的 `section` 字段包含：

| 字段 | 说明 | 教材来源 |
| --- | --- | --- |
| `words` | 词汇（单词、音标、词性、释义、首次出现页码） | Words and expressions 词汇表 |
| `phrases` | 词组与固定搭配 | 词汇表 + 单元 Useful expressions |
| `patterns` | 句型（句型结构、中文含义、例句） | Useful expressions / Communication bank |
| `grammar` | 语法（主题、总述、分点讲解与例句） | 单元 Grammar in use 页 + 附录 Guide to the language use |
| `notes` | 知识点（语言点与文化背景） | 附录 Notes |
| `article` | 文章（`reading` 主课文、`extra` 拓展阅读、`dialogues` 对话） | Understanding ideas / Reading for writing |
| `listening` | 听力（标题、`tracks` 听力录音、`phonetics` 语音练习、任务、听力原稿） | 附录 Listening scripts |
| `goals` | 单元学习目标 | 单元首页 |
| `wordsAudio` | 整单元单词录音 URL | Words and expressions 音频 |
| `speaking` | 口语活动（Work in pairs）配套录音 | Understanding ideas 音频 |
| `article.*.audio` | 课文 / 拓展阅读配套录音 URL | Understanding ideas / Reading for writing 音频 |

## 配套音频

教材配套录音位于 `web/audio/7/`（由项目根目录的 `audio_7/` 原始音频整理而来，
文件名已规范化为 ASCII，便于在网页中引用）：

```text
web/audio/7/
├── appendix/    pronunciation-guide.mp3（发音指南）, proper-nouns.mp3（专有名词）
├── starter/     vocab.mp3, reading.mp3, listening-1..3.mp3
├── unitN/       vocab.mp3, reading.mp3, speaking.mp3, writing.mp3,
│                listening-1..3.mp3, phonetics.mp3
└── ...
```

页面中的播放位置：

- **词汇**页：`wordsAudio`（整单元单词朗读）。
- **文章**页：主课文 / 拓展阅读的 `audio`，以及「口语活动」录音。
- **听力**页：`listening.tracks`（听力 1/2/3）、`listening.phonetics`（Phonetics in use）
  以及书级 `appendixAudios`（发音指南、专有名词）。

替换或新增音频：把 mp3 放进 `web/audio/7/<unit>/`，再更新对应
`units/*.json`（或 `book.json`）里的 URL 即可；`TestCourseLoadsTextbookContent`
会校验每个 URL 都能在 `web/` 下找到对应文件。

## 内容来源与整理流程

1. 扫描 172 张教材页面照片，按页码排序。
2. 使用 RapidOCR（ONNX）逐页识别，按版面位置恢复阅读顺序。
3. 关键页面（词汇表、听力原稿、图文混排阅读页）用视觉模型逐字校对，
   修正 OCR 的音标、专有名词与错切分。
4. 词汇表按教材原书条目逐条录入，音标人工核对。
5. 生成结构化 JSON，并由 `go test ./internal/learning -run TestCourseLoadsTextbookContent` 校验完整性。

## 版权说明

本目录内容摘自外研版《英语》七年级上册（2024 年版）教材扫描件，
仅用于**个人学习与教学参考**。教材文字、版式与图片版权归外语教学与研究出版社及原作者所有，
请勿用于商业用途；如需正式使用请购置正版教材或取得授权。

听力音频来自教材配套录音，版权同样归外语教学与研究出版社所有，仅限个人学习使用。
