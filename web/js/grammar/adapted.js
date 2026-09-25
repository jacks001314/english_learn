// 初中语法专题 · 真题语篇原句改编练习
// 说明：北京中考单项填空不考查冠词、数词、There be、祈使句等语法点，卷中也不存在对应真题。
// 因此从 2022–2024 年北京市中考英语试卷的完形/阅读语篇中提取真实原句，就目标语法点挖空改编。
// 每题都保留 sourceOriginal（原句）与出处，便于对照；这是「真题语境改编」，不是真题原题。

export const adaptedItems = [
  // ===== 名词与主谓一致 =====
  {
    origin: "adapted", id: "adp-noun-1", topicId: "g-nouns", answer: "A", difficulty: 2,
    stem: "If each of us can put in more efforts, food waste ________ sure to be reduced for the good of our future.",
    options: ["is", "are", "were", "be"],
    explanation: "考查主谓一致。food waste 是不可数名词，谓语用单数 is。",
    sourcePaper: "北京市中考英语（2023年）", sourceYear: 2023, sourceSection: "阅读理解",
    sourceOriginal: "If each of us can put in more efforts, food waste is sure to be reduced for the good of our future.",
  },
  {
    origin: "adapted", id: "adp-noun-2", topicId: "g-nouns", answer: "A", difficulty: 1,
    stem: "So my ________ is: when you do physical exercise, make sure you feel good about yourself over feeling good about the numbers.",
    options: ["advice", "advices", "advise", "advises"],
    explanation: "考查不可数名词。advice 是不可数名词，没有复数形式。",
    sourcePaper: "北京市中考英语（2024年）", sourceYear: 2024, sourceSection: "阅读表达",
    sourceOriginal: "So my advice is: when you do physical exercise, make sure you feel good about yourself over feeling good about the numbers.",
  },
  {
    origin: "adapted", id: "adp-noun-3", topicId: "g-nouns", answer: "B", difficulty: 1,
    stem: "Experiences that give pleasure can also give enjoyment, but the two feelings ________ quite different.",
    options: ["is", "are", "was", "be"],
    explanation: "考查主谓一致。主语 the two feelings 是复数，谓语用 are。",
    sourcePaper: "北京市中考英语（2023年）", sourceYear: 2023, sourceSection: "阅读理解",
    sourceOriginal: "Experiences that give pleasure can also give enjoyment, but the two feelings are quite different.",
  },

  // ===== 冠词 =====
  {
    origin: "adapted", id: "adp-art-1", topicId: "g-articles", answer: "B", difficulty: 1,
    stem: "Later, we performed wonderfully in ________ important show.",
    options: ["a", "an", "the", "/"],
    explanation: "考查不定冠词。important 以元音音素 /ɪ/ 开头，表示“一场”用 an。",
    sourcePaper: "北京市中考英语（2022年）", sourceYear: 2022, sourceSection: "阅读理解",
    sourceOriginal: "Later, we performed wonderfully in an important show.",
  },
  {
    origin: "adapted", id: "adp-art-2", topicId: "g-articles", answer: "C", difficulty: 2,
    stem: "Challenging as it is, ________ use of meal plans in preparing food can play an important role in ending food waste in the family.",
    options: ["a", "an", "the", "/"],
    explanation: "考查定冠词。此处特指“使用膳食计划这一做法”，用 the。",
    sourcePaper: "北京市中考英语（2023年）", sourceYear: 2023, sourceSection: "阅读理解",
    sourceOriginal: "Challenging as it is, the use of meal plans in preparing food can play an important role in ending food waste in the family.",
  },
  {
    origin: "adapted", id: "adp-art-3", topicId: "g-articles", answer: "C", difficulty: 2,
    stem: "On ________ final day of the camp was the bag race.",
    options: ["a", "an", "the", "/"],
    explanation: "考查定冠词。final day 被 of the camp 限定，表示特指，用 the。",
    sourcePaper: "北京市中考英语（2024年）", sourceYear: 2024, sourceSection: "完形填空",
    sourceOriginal: "On the final day of the camp was the bag race.",
  },

  // ===== 数词 =====
  {
    origin: "adapted", id: "adp-num-1", topicId: "g-numerals", answer: "A", difficulty: 2,
    stem: "In addition, the wasted food produces over three ________ tons of carbon dioxide, which speeds up climate change.",
    options: ["billion", "billions", "billion of", "billions of"],
    explanation: "考查数词。具体数字 three 后接 billion，不加 -s，也不接 of。",
    sourcePaper: "北京市中考英语（2023年）", sourceYear: 2023, sourceSection: "阅读理解",
    sourceOriginal: "In addition, the wasted food produces over three billion tons of carbon dioxide, which speeds up climate change.",
  },
  {
    origin: "adapted", id: "adp-num-2", topicId: "g-numerals", answer: "A", difficulty: 2,
    stem: "The game asked players to provide basic background information, and nearly four ________ people worldwide did so.",
    options: ["million", "millions", "million of", "millions of"],
    explanation: "考查数词。具体数字 four 后接 million，用单数且不接 of。",
    sourcePaper: "北京市中考英语（2024年）", sourceYear: 2024, sourceSection: "阅读理解",
    sourceOriginal: "The game asked players to provide basic background information, and nearly four million people worldwide did so.",
  },
  {
    origin: "adapted", id: "adp-num-3", topicId: "g-numerals", answer: "A", difficulty: 2,
    stem: "At the same time, there are nearly one ________ people who go hungry.",
    options: ["billion", "billions", "billion of", "billions of"],
    explanation: "考查数词。one 是具体数字，后面用 billion，不加 -s、不接 of。",
    sourcePaper: "北京市中考英语（2023年）", sourceYear: 2023, sourceSection: "阅读理解",
    sourceOriginal: "At the same time, there are nearly one billion people who go hungry.",
  },

  // ===== There be 句型 =====
  {
    origin: "adapted", id: "adp-there-1", topicId: "g-there-be", answer: "A", difficulty: 1,
    stem: "But we believe there ________ more to consider.",
    options: ["is", "are", "have", "has"],
    explanation: "考查 There be 句型。主语 more 表示不可数的“更多内容”，be 用单数 is；There be 也不能与 have 连用。",
    sourcePaper: "北京市中考英语（2022年）", sourceYear: 2022, sourceSection: "阅读理解",
    sourceOriginal: "But we believe there is more to consider.",
  },
  {
    origin: "adapted", id: "adp-there-2", topicId: "g-there-be", answer: "B", difficulty: 1,
    stem: "At the same time, there ________ nearly one billion people who go hungry.",
    options: ["is", "are", "has", "have"],
    explanation: "考查 There be 句型。主语 people 是复数，be 用 are。",
    sourcePaper: "北京市中考英语（2023年）", sourceYear: 2023, sourceSection: "阅读理解",
    sourceOriginal: "At the same time, there are nearly one billion people who go hungry.",
  },
  {
    origin: "adapted", id: "adp-there-3", topicId: "g-there-be", answer: "A", difficulty: 2,
    stem: "________ a special project I want us to work on this term, Scott announced at the recycling club meeting the next day.",
    options: ["There is", "There are", "It is", "There has"],
    explanation: "考查 There be 句型。a special project 是单数名词，用 There is；There be 不与 have/has 连用。",
    sourcePaper: "北京市中考英语（2024年）", sourceYear: 2024, sourceSection: "阅读理解",
    sourceOriginal: "\u201cThere is a special project I want us to work on this term,\u201d Scott announced at the recycling club meeting the next day.",
  },

  // ===== 祈使句与感叹句 =====
  {
    origin: "adapted", id: "adp-imp-1", topicId: "g-imperatives", answer: "A", difficulty: 1,
    stem: "________ into what the company tells us about their product.",
    options: ["Look", "Looks", "Looking", "To look"],
    explanation: "考查祈使句。祈使句以动词原形开头，用 Look。",
    sourcePaper: "北京市中考英语（2022年）", sourceYear: 2022, sourceSection: "阅读理解",
    sourceOriginal: "Look into what the company tells us about their product.",
  },
  {
    origin: "adapted", id: "adp-imp-2", topicId: "g-imperatives", answer: "A", difficulty: 1,
    stem: "________ to choose local products.",
    options: ["Try", "Tries", "Trying", "Tried"],
    explanation: "考查祈使句。祈使句以动词原形开头，用 Try。",
    sourcePaper: "北京市中考英语（2022年）", sourceYear: 2022, sourceSection: "阅读理解",
    sourceOriginal: "Think about how much energy was used to get it to us. Try to choose local products.",
  },
  {
    origin: "adapted", id: "adp-imp-3", topicId: "g-imperatives", answer: "A", difficulty: 2,
    stem: "So my advice is: when you do physical exercise, ________ sure you feel good about yourself over feeling good about the numbers.",
    options: ["make", "makes", "making", "to make"],
    explanation: "考查祈使句。祈使句用动词原形开头，make sure 意为“确保”。",
    sourcePaper: "北京市中考英语（2024年）", sourceYear: 2024, sourceSection: "阅读表达",
    sourceOriginal: "So my advice is: when you do physical exercise, make sure you feel good about yourself over feeling good about the numbers.",
  },

  // ===== 状语从句 =====
  {
    origin: "adapted", id: "adp-adv-1", topicId: "g-adverbial-clause", answer: "A", difficulty: 3,
    stem: "In the whole process, I was taught that ________ we each had our own job to do in a show, it would take all of us working together to make the show great.",
    options: ["although", "as soon as", "so that", "unless"],
    explanation: "考查让步状语从句。前后为让步关系：虽然每个人在演出中各有分工，但仍需要所有人通力合作。",
    sourcePaper: "北京市中考英语（2022年）", sourceYear: 2022, sourceSection: "阅读理解",
    sourceOriginal: "In the whole process, I was taught that although we each had our own job to do in a show, it would take all of us working together to make the show great.",
  },
  {
    origin: "adapted", id: "adp-adv-2", topicId: "g-adverbial-clause", answer: "A", difficulty: 2,
    stem: "None of these experiences may be especially pleasurable ________ they are taking place, but when we think back on them afterwards, we would say, \u201cThat was enjoyable.\u201d",
    options: ["when", "although", "unless", "until"],
    explanation: "考查时间状语从句。when 引导时间状语从句，表示“当……发生时”。",
    sourcePaper: "北京市中考英语（2023年）", sourceYear: 2023, sourceSection: "阅读理解",
    sourceOriginal: "None of these experiences may be especially pleasurable when they are taking place, but when we think back on them afterwards, we would say, \u201cThat was enjoyable.\u201d",
  },
  {
    origin: "adapted", id: "adp-adv-3", topicId: "g-adverbial-clause", answer: "A", difficulty: 3,
    stem: "Serena suddenly realized that Rose had wanted her to control herself to be a better rider, ________ she would have had a nice time with Piper.",
    options: ["even though", "as soon as", "so that", "unless"],
    explanation: "考查让步状语从句。even though 意为“即使、尽管”，表示让步关系。",
    sourcePaper: "北京市中考英语（2024年）", sourceYear: 2024, sourceSection: "完形填空",
    sourceOriginal: "Serena suddenly realized that Rose had wanted her to control herself to be a better rider, even though she would have had a nice time with Piper.",
    sourceNote: "原句出自 2024 年完形填空语篇；第 20 空答案为 control，此处已按答卷填回后引用。",
  },
];
