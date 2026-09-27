# 外研社（外研版）初中英语教材内容 · 七年级 / 八年级 / 九年级

本目录收集整理了**北京市三帆中学**使用的**外研社（Foreign Language Teaching and Research Press / FLTRP）**初中英语教材（外研版）七、八、九三个年级的具体学习内容，包括**课程目录（模块/单元结构）**与**分模块词汇表（单词、音标、中文释义）**，可直接用于本项目的词汇学习、练习生成与阅读选材。

## 目录结构

```text
chuzhong/
├── README.md              # 本说明
├── catalog.json           # 课程结构：年级 → 上/下册 → 模块/单元 → 标题、主题
├── 七年级.md               # 七年级课程目录（Markdown，便于阅读）
├── 八年级.md               # 八年级课程目录（Markdown）
├── 九年级.md               # 九年级课程目录（Markdown）
└── vocab/                 # 分模块词汇表
    ├── 七年级上册.json     # 词表（结构化，程序可读）
    ├── 七年级上册.md       # 词表（Markdown 表格，便于阅读）
    ├── 七年级下册.json / .md
    ├── 八年级上册.json / .md
    ├── 八年级下册.json / .md
    ├── 九年级上册.json / .md
    └── 九年级下册.json / .md

另有 `原创课文/` 目录：为各册每个模块/单元**原创**的课文（对话 + 短文 + 目标词对照，共 54 篇），含 Markdown 原文与 `structured/` 结构化 JSON，详见 `原创课文/README.md`。
```

## 词汇表数据说明（vocab/）

每个词表包含：**单词、音标、中文释义**，按模块/单元分组。JSON 结构：

```text
{ "book": "八年级上册",
  "sections": [
    { "section": "Module 1", "title": "How to learn English",
      "words": [ { "word": "pair", "phonetic": "peə(r)", "meaning": "（相关的）两个人，一对" }, ... ] },
    ...
  ]
}
```

## 教材版本说明（重要）

- **七年级**：使用 **外研版（2024）新教材**（单元制）。上、下册各 6 个正式单元：
  - 上册：Unit 1 *A new start* / Unit 2 *More than fun* / Unit 3 *Family ties* / Unit 4 *Time to celebrate* / Unit 5 *The power of plants* / Unit 6 *Fantastic friends*
  - 下册：Unit 1 *The secrets of happiness* / Unit 2 *Go for it!* / Unit 3 *Food matters* / Unit 4 *The art of having fun* / Unit 5 *Amazing nature* / Unit 6 *Hitting the road*
- **八年级、九年级**：本数据集使用 **外研2011课标版**（模块制，每个模块含 Unit 1 / Unit 2 / Unit 3 Language in use）。
  - 八年级：上册 Module 1–12、下册 Module 1–10
  - 九年级：上册 Module 1–12、下册 Module 1–8
- 注意：新教材仍在逐步推广应用，若学校某年级已换用「外研版2024」新教材（八年级新教材为单元制，如 *This is me*、*Digital life* 等），请以实际教材为准。

## 数据来源与准确性

- 课程目录与模块标题参照公开的「外研版初中英语」目录整理。
- 词汇表整理自公开的「外研版教材单词列表」网页数据，并已按教材目录核对模块/单元标题。
- 个别单词的释义、音标或词性可能因教材版本而异，**请以教材原书为准**。
- 不同来源对八年级新教材单元命名略有出入，建议结合学校实际版本使用。

## 版权提示

- 本目录收录的是**课程目录标题**与**词汇数据（单词、音标、释义）**，**不含**教科书中的课文正文、对话、阅读原文等受版权保护的完整文本。
- 如需完整课文，请通过正规渠道使用正版教材或出版社授权资源。

## 模块/单元数量一览

| 年级 | 上册 | 下册 |
| --- | --- | --- |
| 七年级（新版） | Unit 1–6 | Unit 1–6 |
| 八年级（课标版） | Module 1–12 | Module 1–10 |
| 九年级（课标版） | Module 1–12 | Module 1–8 |

> 本目录用于教学参考与学习内容组织；教材文字、版式与图片版权归外研社及原作者所有。
