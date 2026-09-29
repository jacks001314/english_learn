// 初中语法专题 · 专项练习（自编）
// 用途：北京卷与公开真题都查不到对应题目的语法点，按教材语法项目自编，保证每个专题的子考点都有练习。
// 这些题目不是真题，界面统一标注为「专项练习」，与「北京中考真题」「外地中考真题」「真题改编」区分。
// 每题用 point 字段标明所覆盖的具体语法点。

const raw = [
  // ===== 数词 =====
  { id: "auth-num-ordinal", topicId: "g-numerals", point: "序数词", answer: "B", difficulty: 1,
    stem: "September is the ________ month of a year.",
    options: ["nine", "ninth", "nineth", "the ninth"],
    explanation: "考查序数词。九月是一年中的第九个月，用序数词 ninth（nine 去 e 加 th）。故选 B。" },
  { id: "auth-num-fraction", topicId: "g-numerals", point: "分数表达", answer: "C", difficulty: 3,
    stem: "________ of the students in our class are girls.",
    options: ["Two three", "Two third", "Two thirds", "Second three"],
    explanation: "考查分数。分子用基数词，分母用序数词；分子大于 1 时分母加 -s，故为 two thirds。故选 C。" },
  { id: "auth-num-numbering", topicId: "g-numerals", point: "编号表达", answer: "A", difficulty: 1,
    stem: "Tom lives in ________.",
    options: ["Room 302", "302 Room", "the Room 302", "room 302"],
    explanation: "考查编号表达。名词 + 数字表示编号时名词首字母大写且不加冠词，故为 Room 302。故选 A。" },
  { id: "auth-num-approx", topicId: "g-numerals", point: "概数（hundreds of）", answer: "D", difficulty: 2,
    stem: "________ people visit this museum every day.",
    options: ["Hundred", "Hundreds", "Hundred of", "Hundreds of"],
    explanation: "考查概数。表示不确切数量时用 hundreds of，hundred 加 -s 并接 of。故选 D。" },

  // ===== There be 句型 =====
  { id: "auth-there-question", topicId: "g-there-be", point: "疑问句与不可数名词", answer: "A", difficulty: 1,
    stem: "________ there any milk in the fridge?",
    options: ["Is", "Are", "Has", "Have"],
    explanation: "考查 There be 句型。milk 是不可数名词，be 用单数 Is。故选 A。" },
  { id: "auth-there-future", topicId: "g-there-be", point: "将来时", answer: "B", difficulty: 2,
    stem: "There ________ a meeting tomorrow afternoon.",
    options: ["is going to have", "is going to be", "are going to have", "will have"],
    explanation: "考查 There be 的将来时。There be 不能与 have 连用，将来时用 there is going to be / there will be。故选 B。" },
  { id: "auth-there-near", topicId: "g-there-be", point: "就近原则", answer: "A", difficulty: 2,
    stem: "There ________ a pen and two books on the desk.",
    options: ["is", "are", "have", "has"],
    explanation: "考查就近原则。be 的形式由最靠近它的名词决定，a pen 是单数，用 is。故选 A。" },

  // ===== 祈使句与感叹句 =====
  { id: "auth-imp-negative", topicId: "g-imperatives", point: "否定祈使句", answer: "A", difficulty: 1,
    stem: "________ late for class again, Tom.",
    options: ["Don't be", "Not be", "Don't", "Not to be"],
    explanation: "考查否定祈使句。祈使句否定用 Don't + 动词原形；late 是形容词，需加 be。故选 A。" },
  { id: "auth-imp-exclaim", topicId: "g-imperatives", point: "感叹句 How", answer: "C", difficulty: 2,
    stem: "________ interesting the story is!",
    options: ["What", "What an", "How", "How a"],
    explanation: "考查感叹句。How + 形容词 + 主语 + 谓语！此处 interesting 是形容词。故选 C。" },
  { id: "auth-imp-andor", topicId: "g-imperatives", point: "祈使句 + and/or", answer: "C", difficulty: 2,
    stem: "Work hard, ________ you will succeed.",
    options: ["or", "but", "and", "so"],
    explanation: "考查祈使句 + and 结构。祈使句后接 and 表示“就……”，接 or 表示“否则……”。此处为顺承，用 and。故选 C。" },

  // ===== 状语从句 =====
  { id: "auth-adv-if", topicId: "g-adverbial-clause", point: "条件状语从句（主将从现）", answer: "A", difficulty: 2,
    stem: "If it ________ tomorrow, we will stay at home.",
    options: ["rains", "will rain", "rained", "is raining"],
    explanation: "考查条件状语从句的时态。if 引导条件句遵循“主将从现”，从句用一般现在时。故选 A。" },
  { id: "auth-adv-result", topicId: "g-adverbial-clause", point: "结果状语从句 so...that", answer: "A", difficulty: 2,
    stem: "He was so tired ________ he fell asleep at once.",
    options: ["that", "because", "though", "if"],
    explanation: "考查结果状语从句。so + 形容词 + that 从句表示“如此……以至于……”。故选 A。" },
  { id: "auth-adv-cause", topicId: "g-adverbial-clause", point: "原因状语从句 because", answer: "A", difficulty: 1,
    stem: "________ he was ill, he didn't go to school.",
    options: ["Because", "Although", "So", "If"],
    explanation: "考查原因状语从句。前后为因果关系，用 Because 引导原因；Because 不能与 so 连用。故选 A。" },

  // ===== 名词与主谓一致 =====
  { id: "auth-noun-news", topicId: "g-nouns", point: "不可数名词 news 作主语", answer: "B", difficulty: 2,
    stem: "The news ________ very exciting.",
    options: ["are", "is", "were", "be"],
    explanation: "考查主谓一致。news 形式上是复数，但作不可数名词，谓语用单数 is。故选 B。" },
  { id: "auth-noun-each", topicId: "g-nouns", point: "each of + 复数名词作主语", answer: "B", difficulty: 2,
    stem: "Each of the students ________ a dictionary.",
    options: ["have", "has", "having", "to have"],
    explanation: "考查主谓一致。each of + 复数名词作主语时，谓语用第三人称单数 has。故选 B。" },

  // ===== 冠词（补充：序数词/最高级前的 the 与泛指）=====
  { id: "auth-art-superlative", topicId: "g-articles", point: "最高级前用 the", answer: "C", difficulty: 2,
    stem: "The Great Wall is ________ longest wall in the world.",
    options: ["a", "an", "the", "/"],
    explanation: "考查定冠词。形容词最高级前用 the。故选 C。" },
  { id: "auth-art-first", topicId: "g-articles", point: "序数词前用 the", answer: "C", difficulty: 2,
    stem: "He was ________ first person to arrive at the finish line.",
    options: ["a", "an", "the", "/"],
    explanation: "考查定冠词。序数词前一般用 the。故选 C。" },
];

export const authoredExercises = raw.map((item) => ({
  ...item,
  origin: "authored",
  type: "choice",
  sourceLabel: `专项练习 · 覆盖考点：${item.point}`,
  source: {
    type: "authored",
    note: "该语法点暂无公开中考真题，按外研版教材语法项目自编，用于补齐考点覆盖。",
  },
}));
