// web/js/grammar/yufan/attributive-clause.js
// 来源：外研版九年级上册 Module 10 Australia / Module 11 Photos 的语法聚焦（定语从句），
//       例句同时对照本仓 chuzhong/九年级.md、chuzhong/grammar.json 与 chuzhong/原创课文/九年级上册。
// 性质：按教材语法项目整理的自撰讲义（非扫描件），因此 authored: true、sourceDirs 为空、imagesRead 为 0。
// 分工：本文件只提供讲义正文（sections）；专题正文（速查卡/要点/易错/记忆卡）在 web/js/grammar/topics.js 的 g-attributive-clause。
// 自检：node --check web/js/grammar/yufan/attributive-clause.js
export default [
  {
    topicId: "g-attributive-clause",
    newTopic: false,
    authored: true,
    title: "定语从句",
    sourceDirs: [],
    imagesRead: 0,
    sourceNote: "依据外研版九年级上册 Module 10 / Module 11 语法聚焦整理",
    summary: "定语从句放在名词或代词后面起修饰作用：先行词指人用 who/that，指物用 which/that；关系代词作宾语时可省略，作主语时不能省略。",
    intro: "按教材语法聚焦顺序整理：概念（先行词与关系词）→ that/which 指物（Module 10）→ who/that 指人（Module 11）→ 关系代词作宾语可省略 → 只能用 that 的情形 → 从句中的主谓一致 → 易错清单与辨析。",
    sections: [
      {
        heading: "一、定语从句是什么：先行词与关系词",
        blocks: [
          {
            type: "text",
            text: "修饰名词的成分叫定语。单个形容词作定语时放在名词前面，例如 a magical place（一个有魔力的地方）；如果修饰语是一个句子，句子就要放在名词后面，这个句子就是定语从句。",
          },
          {
            type: "text",
            text: "被修饰的那个名词或代词叫先行词；引导从句、并在从句里代替先行词的词叫关系词。本专题只讲关系代词 that / which / who。",
          },
          {
            type: "table",
            head: ["修饰语", "位置", "例子"],
            rows: [
              ["形容词（单词作定语）", "名词前", "a magical place 一个有魔力的地方"],
              ["定语从句（句子作定语）", "名词后（紧跟先行词）", "green hills and mountains that reach a great height 高耸入云的山"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "Further north and east, there are green hills and mountains that reach a great height.", zh: "再往北、往东，有绿色的丘陵和高耸入云的山。" },
              { en: "It is a magical place with a lot of beautiful sights.", zh: "那是一个有很多美景的神奇地方。" },
            ],
          },
          {
            type: "tip",
            text: "关系代词就是先行词的“替身”：从句里已经用关系代词代替了先行词，所以从句中不能再重复出现被修饰的那个名词。",
          },
        ],
      },
      {
        heading: "二、指物：that / which（Module 10 Australia）",
        blocks: [
          {
            type: "text",
            text: "先行词是物时，关系代词用 that 或 which，初中阶段二者大多可以互换；that 更口语、更常见。",
          },
          {
            type: "examples",
            items: [
              { en: "I have some photos that I took in Australia last year.", zh: "我有一些去年在澳大利亚拍的照片。" },
              { en: "The game that they like most is Australian football.", zh: "他们最喜欢的运动是澳式足球。" },
              { en: "The photo which we liked best was taken by Zhao Min.", zh: "我们最喜欢的那张照片是赵敏拍的。" },
            ],
          },
          {
            type: "table",
            head: ["句子", "先行词", "关系代词", "在从句中作"],
            rows: [
              ["I have some photos that I took in Australia last year.", "photos", "that", "宾语"],
              ["The game that they like most is Australian football.", "The game", "that", "宾语"],
              ["green hills and mountains that reach a great height", "mountains", "that", "主语"],
            ],
          },
          {
            type: "tip",
            text: "判断关系代词在从句中作什么成分：把从句单独拎出来读——从句缺主语，关系代词就作主语；从句缺宾语，就作宾语。",
          },
        ],
      },
      {
        heading: "三、指人：who / that（Module 11 Photos）",
        blocks: [
          {
            type: "text",
            text: "先行词是人时，关系代词用 who，口语中也常用 that。which 不能指人。",
          },
          {
            type: "examples",
            items: [
              { en: "He's the boy who won the photo competition last year!", zh: "他就是去年赢得摄影比赛的那个男孩！" },
              { en: "I learned about the old culture of the people who lived there for thousands of years before us.", zh: "我了解了在我们之前几千年就住在那里的那些人的古老文化。" },
            ],
          },
          {
            type: "table",
            head: ["关系代词", "指代", "在从句中可作", "例子"],
            rows: [
              ["who", "人", "主语 / 宾语", "the boy who won the photo competition"],
              ["which", "物", "主语 / 宾语", "the photo which we liked best"],
              ["that", "人 / 物", "主语 / 宾语", "the photos that I took in Australia"],
            ],
          },
          {
            type: "pitfall",
            text: "指人不能用 which：× He's the boy which won the photo competition last year.",
          },
        ],
      },
      {
        heading: "四、关系代词作宾语时可以省略",
        blocks: [
          {
            type: "text",
            text: "关系代词在从句中作宾语时，可以省略；作主语时不能省略。省略后句子依然完整，只是少了对先行词的说明。",
          },
          {
            type: "examples",
            items: [
              { en: "The photo (which) we liked best was taken by Zhao Min.", zh: "我们最喜欢的那张照片是赵敏拍的。" },
              { en: "I have some photos (that) I took in Australia last year.", zh: "我有一些去年在澳大利亚拍的照片。" },
            ],
          },
          {
            type: "list",
            items: [
              "作宾语可省略：The photo (which) we liked best …（从句 we liked best 已经完整）",
              "作主语不可省略：the boy who won the photo competition（从句缺主语，必须有 who）",
            ],
          },
          {
            type: "pitfall",
            text: "作主语时漏掉关系代词，句子会出现两个谓语：× The boy won the photo competition last year is my friend.",
          },
        ],
      },
      {
        heading: "五、只能用 that 的几种情况",
        blocks: [
          {
            type: "list",
            items: [
              "先行词是不定代词：all、everything、anything、nothing、much、little 等。",
              "先行词被 the only、the very、the last 修饰。",
              "先行词被序数词或形容词最高级修饰。",
              "先行词既指人又指物（如 the people and things）。",
            ],
          },
          {
            type: "table",
            head: ["情况", "例句"],
            rows: [
              ["先行词被 the only 修饰", "This is the only museum that I have visited in Beijing."],
              ["先行词是不定代词", "Everything that he said was true."],
              ["先行词被最高级修饰", "It is the best film that I have ever seen."],
              ["先行词既有人又有物", "We talked about the people and things that we remembered."],
            ],
          },
          {
            type: "pitfall",
            text: "以上情形不用 which：× This is the only museum which I have visited in Beijing.",
          },
        ],
      },
      {
        heading: "六、定语从句中的主谓一致",
        blocks: [
          {
            type: "text",
            text: "关系代词在从句中作主语时，从句谓语动词的形式由先行词决定，与主句的主语无关。",
          },
          {
            type: "examples",
            items: [
              { en: "I have some photos that were taken in Australia last year.", zh: "我有一些去年在澳大利亚拍的照片。" },
              { en: "He's the boy who wins the photo competition every year.", zh: "他就是每年都赢得摄影比赛的那个男孩。" },
            ],
          },
          {
            type: "tip",
            text: "做题时先划出先行词，再给从句谓语定单复数：先行词是 photos（复数）就用 were，是 the boy（单数）就用 wins。",
          },
          {
            type: "pitfall",
            text: "× I have some photos that was taken in Australia last year.（先行词 photos 是复数）",
          },
        ],
      },
      {
        heading: "七、易错清单与辨析（定语从句 vs 宾语从句）",
        blocks: [
          {
            type: "list",
            items: [
              "从句里又重复了被修饰的名词：× the photos that I took them in Australia.",
              "指人用 which：× the boy which won the photo competition.",
              "该用 that 的地方用了 which：× the only museum which I have visited.",
              "作主语的关系代词被省略：× The boy won the prize is my friend.",
            ],
          },
          {
            type: "table",
            head: ["对比项", "定语从句", "宾语从句"],
            rows: [
              ["位置", "紧跟先行词（名词 / 代词）之后", "放在主句动词之后"],
              ["作用", "修饰名词，相当于形容词", "作主句动词的宾语"],
              ["引导词", "关系代词 that / which / who", "连词 that / if / whether 或疑问词"],
              ["判断方法", "去掉从句，主句仍完整，只是少了对名词的修饰", "去掉从句，主句就缺了宾语"],
              ["例子", "The photo which we liked best was taken by Zhao Min.", "She said that the show was on air."],
            ],
          },
          {
            type: "pitfall",
            text: "北京中考单项填空不直接考查定语从句，但完形与阅读语篇中定语从句密集出现；读长句时先找先行词，再把从句括起来读主句。",
          },
        ],
      },
    ],
  },
];