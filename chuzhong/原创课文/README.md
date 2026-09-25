# 原创课文（替代教材原文）

> 说明：这些课文是**原创**内容，**并非**外研社教材原文。每篇都按对应模块/单元的**主题、语法点与目标词汇**编写，难度与教材该模块相当，可用于精读、词汇练习与语法教学，同时规避版权风险。

## 进度（全部完成 ✅）

| 册次 | 版本 | 篇数 |
| --- | --- | --- |
| 七年级上册 | 外研版（2024）单元制 | 6 |
| 七年级下册 | 外研版（2024）单元制 | 6 |
| 八年级上册 | 外研2011课标版（模块制） | 12 |
| 八年级下册 | 外研2011课标版（模块制） | 10 |
| 九年级上册 | 外研2011课标版（模块制） | 12 |
| 九年级下册 | 外研2011课标版（模块制） | 8 |

共 **54 篇**：每册在每个模块/单元下有一篇，含对话 + 短文 + 目标词对照。

## 目录结构

```text
原创课文/
├── README.md
├── 七年级上册/   Unit1_A_new_start.md … Unit6_The_power_of_plants.md
├── 七年级下册/   Unit1_The_secrets_of_happiness.md … Unit6_Hitting_the_road.md
├── 八年级上册/   Module1_How_to_learn_English.md … Module12_Help.md
├── 八年级下册/   Module1_Feelings_and_impressions.md … Module10_On_the_radio.md
├── 九年级上册/   Module1_Wonders_of_the_world.md … Module12_Save_our_world.md
├── 九年级下册/   Module1_Travel.md … Module8_My_future_life.md
└── structured/                    # 结构化 JSON（便于接入项目）
    ├── 七年级上册.json
    ├── 七年级下册.json
    ├── 八年级上册.json
    ├── 八年级下册.json
    ├── 九年级上册.json
    └── 九年级下册.json
```

## 每篇课文的结构

每个模块/单元一篇，包含三部分：

1. **对话（Dialogue）**：贴合该模块话题与语法的简短对话。
2. **短文（Reading）**：围绕该模块主题的一段原创短文，融入模块目标词。
3. **目标词使用对照**：表格列出「模块目标词 → 课文中出现的句子 → 释义」。

## 结构化数据（structured/）

每个册次一个 JSON，便于接入项目的阅读/练习页面。结构如下：

```text
{ "book": "八年级上册",
  "items": [
    { "file": "Module1_...md",
      "heading": "...",
      "section": "Module 1",
      "topic": "英语学习方法（提建议）",
      "dialogue": [ { "speaker": "Lily", "text": "..." }, ... ],
      "reading": { "title": "...", "paragraphs": ["...", ...] },
      "words": [ { "word": "matter", "sentence": "What's the matter?", "meaning": "问题；麻烦" }, ... ]
    }, ...
  ]
}
```

## 版权说明

本目录内容为**原创**编写，未复制任何教材原文。教材标题、目录等信息仅作课程结构参考；如需教材原文，请使用正版教材或出版社授权资源。
