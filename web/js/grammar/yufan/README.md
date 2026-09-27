# yufan 语法讲义 · 产出契约（必须严格遵守）

本目录用于把 `yufan/<主题>/` 下的教材扫描图片，整理成**结构化语法讲义数据**，
供 `web/js/components/GrammarView.js` 渲染到「语法专题」页面。

## 1. 你只允许新增文件

- 在 `web/js/grammar/yufan/` 下新增 `<slug>.js`（slug 由主控分配，全小写 ASCII）。
- **不要**修改 `topics.js`、`exercises.js`、`GrammarView.js`、`index.js`、`grammar.css` 或任何本目录之外的文件。
- 合并由主控完成。

## 2. 文件格式（ES Module，纯数据，无 import）

```js
// web/js/grammar/yufan/<slug>.js
export default [
  {
    topicId: "g-nouns",              // 目标专题 id
    newTopic: false,                 // true = topics.js 里还没有该专题，需要新建
    title: "名词",                    // 专题中文名
    sourceDirs: ["yufan/名词"],       // 本次使用的图片目录（相对项目根）
    imagesRead: 15,                  // 实际看过的图片张数
    summary: "……",                    // 必填：专题一句话概述（比现有更精准时提供）
    intro: "……",                      // 可选：讲义导语
    sections: [ /* 见 §3，至少 1 节 */ ],
    extras: { /* 见 §4，可选 */ },
  },
];
```

一个文件可以导出多个条目（例如一个目录同时覆盖两个专题）。

### newTopic 为 true 时必须额外提供

```js
category: "词法",   // 只能是 词法 / 句法 / 动词 / 复合句 之一
difficulty: 3,      // 1—5 整数
forms:  [ { name, pattern, note } ],
points: [ { title, desc, good: [...], bad: [...] } ],   // good/bad 是英文例句字符串数组
pitfalls: ["…"],
examTips: ["…"],
memoryCard: ["…"],
```

## 3. sections（讲义正文）

```js
sections: [
  {
    heading: "一、人称代词与物主代词",
    blocks: [
      { type: "text",     text: "……" },
      { type: "list",     items: ["……", "……"] },
      { type: "table",    head: ["基数词", "序数词"], rows: [["one", "first"], ["two", "second"]] },
      { type: "examples", items: [ { en: "This is my book.", zh: "这是我的书。" } ] },
      { type: "tip",      text: "……" },
      { type: "pitfall",  text: "……" },
    ],
  },
]
```

硬性规则：

1. `type` 只能是 `text` / `list` / `table` / `examples` / `tip` / `pitfall` 六种。
2. `table.rows` 每个单元格都是字符串；行列数必须与 `head` 对齐。
3. 每个 `sections` 至少 1 节、每节至少 1 个 block；整份文件建议 3—8 节，覆盖图片主要内容。
4. 讲解用中文，例句用英文（`examples` 必须同时给 `en` 和 `zh`）。
5. **忠实于图片**：只写图片里真实出现的内容。看不清的图，在 `notes` 里标注，不要编造。
6. 图片中的表格要尽量还原成 `table` block。
7. 允许并鼓励在 `blocks` 里保留图片中的编号体系（如“1 数词的词形”“A/B/C”）。

## 4. extras（对现有专题页的增量补充，可选）

合并时按内容去重后追加到 `topics.js` 的对应字段：

```js
extras: {
  forms:     [ { name, pattern, note } ],
  points:    [ { title, desc, good: [...], bad: [...] } ],
  contrasts: [ { title, head: [...], rows: [[...]] } ],
  pitfalls:  ["……"],
  examTips:  ["……"],
  memoryCard:["……"],
}
```

只有在图片确实提供了现有页面**没有**的信息时才写 extras；不要复述已有内容。

## 5. 质量与自检（交付前必须做）

1. 用 `node --check <文件>` 或 `node -e "import('./<文件>')"` 确认语法正确、能成功导入。
2. 逐个核对：分配给你的每个图片文件是否都被看过（`imagesRead` 必须等于分配的图片总数）。
3. 在 A2A 回复里报告：文件路径、覆盖的图片目录与张数、未能识别/存疑的图片清单。

## 6. 目录到专题的映射（本次任务分配）

| 图片目录 | 目标 topicId | 说明 |
| --- | --- | --- |
| yufan/名词 | g-nouns | 已有专题，补充 |
| yufan/冠词 | g-articles | 已有专题，补充 |
| yufan/数词 | g-numerals | 已有专题，补充 |
| yufan/总论 | g-overview | 新专题 |
| yufan/代词 | g-pronouns | 已有专题，补充 |
| yufan/直接引语与间接引语 | g-object-clause | 已有专题，补充 |
| yufan/形容词 | g-adj-adv | 已有专题，补充 |
| yufan/副词 | g-adj-adv | 已有专题，补充 |
| yufan/倒装句 | g-inversion | 新专题 |
| yufan/介词 | g-prepositions | 已有专题，补充 |
| yufan/连词 | g-conjunctions | 已有专题，补充 |
| yufan/动词/动词时态/一般现在时 | g-present-simple | 已有专题，补充 |
| yufan/动词/动词时态/进行时 | g-present-continuous | 已有专题，补充 |
| yufan/动词/动词时态/一般过去时 | g-past-simple | 已有专题，补充 |
| yufan/动词/动词时态/将来时 | g-future-tense | 新专题 |
| yufan/动词/动词时态/完成时 | g-present-perfect | 已有专题，补充 |
| yufan/动词/被动语态 | g-passive-voice | 已有专题，补充 |
| yufan/动词/动词概说 | g-verbs-overview | 新专题 |
| yufan/动词/助动词和情态动词 | g-modal-verbs | 已有专题，补充 |
| yufan/动词/非谓语动词 | g-nonfinite-verbs | 新专题 |
| yufan/主谓一致 | g-agreement | 新专题 |
| yufan/句子成分和基本句型 | g-sentence-members | 新专题 |
| yufan/句子的种类 | g-sentence-types | 新专题 |
| yufan/句子的结构 | g-sentence-structure | 新专题 |
| yufan/疑问句 | g-questions | 已有专题，补充 |
## 7. 图片读取规范（防 413，2026-09-27 起强制）

原始扫描图 1080x1920、单张 640-850KB。`view_image` 会把整张图以 base64 常驻会话历史，每次请求全量重发；
实测 `api.deepseek.com/responses` 网关请求体上限 ≈ **48MiB**（45/46/47MB 通过，48/49/50/51/52MB 全部
`413 Payload Too Large` / openresty+EdgeOne）。一个 worker 读满 45 张以上原始图（≈49MB）后会话即被撑爆，
后续该会话**任何**请求都 413，且客户端会连续重试约 14 分钟后该轮彻底失败、零产出。

强制流程：

1. **先生成压缩镜像**：保持原分辨率、JPEG `quality=60` + `optimize` + `progressive`。
   项目脚本：`python scripts/yufan-prepare-images.py`（`--dirs` 可限定子目录），或
   ```
   python3 - <<'PY'
   import os
   from PIL import Image
   SRC="yufan"; DST="yufan-ds"; Q=60
   for root,_,files in os.walk(SRC):
       rel=os.path.relpath(root,SRC)
       out=os.path.join(DST,rel) if rel!="." else DST
       os.makedirs(out,exist_ok=True)
       for f in files:
           if not f.lower().endswith((".jpg",".jpeg",".png")): continue
           Image.open(os.path.join(root,f)).convert("RGB").save(
               os.path.join(out,f),"JPEG",quality=Q,optimize=True,progressive=True)
   print("mirror done")
   PY
   ```
   实测 696KB -> 110KB（≈6 倍压缩），中文小字可读性肉眼无损。
2. **只读 `yufan-ds/**`**，禁止直接 `view_image` 读 `yufan/**` 原图。
3. **单会话读图 ≤ 40 张**，超出必须分段（先写出已完成部分再继续）。
4. `sourceDirs` / `imagesRead` 仍按**原始目录**与张数填写（`yufan-ds/` 只是读图镜像，不是新的源目录）。
5. 超限后的会话无法救回（历史永远超标）：换新 worker，不要在旧会话上重试。
### 7.1 重要增补：两条必须同时成立（2026-09-27，由 yufan-lexis 队长量化提出）

**"建了压缩镜像"本身不足以保证安全**：

- 全量镜像 = 54,419,510 B（≈53MB）；base64 后 ≈ **72MB**（>48MiB 上限）；
  即使按原图 304.5MB/5.87 折算也 ≈43MB 原文 → base64 ≈ **59MB**，**仍超上限**。
- 因此真正的兜底约束是 **单会话读图 ≤ 40 张**：40 张 × ≈120KB ≈ 4.8MB 原文 → base64 ≈ 6.6MB。

⇒ 结论：**"只读 yufan-ds/ 镜像" + "单会话 ≤40 张"两条必须同时成立**；
严禁"因为有了镜像就整目录一次性读完"（53 张已 7.0MB、145 张会到 19MB 原文 ≈26MB base64，逼近上限）。

分组建议：单个 worker 单会话的读图预算按 **≤40 张** 切分（本任务 30/36/17 张的分法即符合）。
### 7.2 yufan-ds/ 的存放约定
`yufan-ds/` 是**按需生成的读图镜像**，不随项目交付、不提交、不预置（避免半量镜像造成误判）：
需要时在 project 根目录跑 `python scripts/yufan-prepare-images.py`（全量约 40 秒，输出 ~53MB），
用完可删。聚合页面与 `build-yufan-lectures.mjs` 都不依赖它，只依赖 `yufan/` 原图与 `web/js/grammar/yufan/*.js`。