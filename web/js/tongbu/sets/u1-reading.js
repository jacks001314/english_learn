// 七年级上册 Unit 1 阅读加油站：Different views on school subjects
export default {
  id: "tb7a-u1-reading",
  book: "七年级上册",
  unit: "Unit 1",
  title: "阅读加油站：Different views on school subjects",
  subtitle: "话题阅读 · 学科喜好",
  source: "基础同步达标手册 七年级上（北京市三帆中学）",
  pages: "P14",
  vocab: [
    { word: "stand", phonetic: "stænd", pos: "v.", meaning: "忍受", use: "can't stand maths 受不了数学" },
    { word: "perfectly", phonetic: "ˈpɜːfɪktli", pos: "adv.", meaning: "完美地", use: "play it perfectly" },
    { word: "hallway", phonetic: "ˈhɔːlweɪ", pos: "n.", meaning: "走廊", use: "show it in the school hallway" },
    { word: "experiment", phonetic: "ɪkˈsperɪmənt", pos: "n.", meaning: "实验", use: "do cool experiments" },
    { word: "rocket", phonetic: "ˈrɒkɪt", pos: "n.", meaning: "火箭", use: "build a mini rocket" },
    { word: "instrument", phonetic: "ˈɪnstrəmənt", pos: "n.", meaning: "乐器；仪器", use: "play instruments" },
    { word: "grammar", phonetic: "ˈɡræmə(r)", pos: "n.", meaning: "语法", use: "English grammar lessons" },
    { word: "however", phonetic: "haʊˈevə(r)", pos: "adv.", meaning: "然而，不过", use: "表转折，常用逗号隔开" },
    { word: "instead of", phonetic: "ɪnˈsted əv", pos: "词组", meaning: "代替，而不是", use: "run outside instead of drawing pictures" },
  ],
  phrases: [
    { en: "raise your hand", zh: "举起手", tip: "raise 是及物动词，后直接接宾语" },
    { en: "can't stand sth", zh: "无法忍受某事", tip: "stand 后接名词或动名词" },
    { en: "make learning fun", zh: "让学习变得有趣", tip: "make + 宾语 + 形容词" },
    { en: "no matter how hard I try", zh: "无论我多努力", tip: "no matter how + 形容词/副词" },
    { en: "get good at sth", zh: "变得擅长某事", tip: "get good at the guitar" },
    { en: "instead of doing sth", zh: "而不是做某事", tip: "instead of 后接动名词" },
    { en: "in one's own special ways", zh: "以各自特别的方式", tip: "in one's own way 以某人自己的方式" },
  ],
  patterns: [
    { en: "Raise your hand if you love P.E. but just can't stand maths!", zh: "如果你喜欢体育却受不了数学，请举手！", note: "祈使句 + if 从句。" },
    { en: "Science is super cool! Our teacher makes learning fun with cool experiments.", zh: "科学超级酷！我们的老师用有趣的实验让学习变得有趣。", note: "make + 宾语 + 形容词。" },
    { en: "No matter how hard I try, I can't remember all the dates and names.", zh: "无论我多努力，我都记不住所有的日期和名字。", note: "no matter how 引导让步状语从句。" },
    { en: "I always wish I could run outside instead of drawing the pictures.", zh: "我总是希望自己能到外面跑，而不是画画。", note: "instead of + 动名词。" },
    { en: "That's what makes school interesting.", zh: "这正是让学校生活有趣的地方。", note: "what 引导表语从句。" },
  ],
  grammar: [
    {
      title: "表达喜好与厌恶",
      points: [
        "like / love / enjoy / be interested in：I love music class the most.",
        "can't stand / don't like / don't enjoy：I really don't enjoy history.",
        "回答“多久一次”用频率副词或短语：Every Tuesday and Thursday（一周两次）。",
      ],
    },
    {
      title: "make + 宾语 + 形容词/动词原形",
      points: [
        "make learning fun with cool experiments（make + 宾语 + 形容词）。",
        "Music class makes my heart sing.（make + 宾语 + 动词原形）。",
      ],
    },
    {
      title: "while 与 instead of",
      points: [
        "while 表示对比：Some love quiet classes while others love moving around.",
        "instead of 表示“而不是”，后接名词或动名词：instead of drawing the pictures。",
      ],
    },
  ],
  examPoints: [
    "how often 问频率，结合文中 Every Tuesday and Thursday 得出 Twice a week。",
    "细节题要回到原文定位人名与学科：Sophia — Music。",
    "推理题：Noah 说 art class 让人想跑出去，说明他不喜欢美术课。",
    "文体判断：校园话题、学生访谈 → school newsletter（校园简报）。",
  ],
  sections: [
    {
      id: "reading",
      title: "六、阅读加油站（阅读短文，完成练习）",
      tip: "易读度 77.8，词数 277，建议用时 6 分钟。先看题干，再回到原文定位。",
      type: "choice",
      passage: [
        "Raise your hand if you love P.E. but just can't stand maths! You're not alone — these four students have some strong feelings about their school subjects too.",
        "【Emma】Art class is my favourite! Every Tuesday and Thursday, we get to show ourselves through painting. Last month, I made a colourful painting of my dog, and my teacher showed it in the school hallway (走廊)! However, I don't like English grammar lessons. I just don't get all those rules. My teacher says I need to practise more.",
        "【Liam】Science is super cool! Our teacher, Mr Johnson, makes learning fun with cool experiments (实验). Last week, we built a mini rocket (火箭)! But I really don't enjoy history. No matter how hard I try, I can't remember all the dates and names.",
        "【Sophia】I love music class the most! On Mondays and Wednesdays, we learn new songs and play instruments (乐器). I'm getting really good at the guitar — I can play My Heart Will Go On perfectly! Music class makes my heart sing, but geography? Ugh! Remembering the weather in different places is so difficult.",
        "【Noah】P.E. is the best subject ever! We play fun games like basketball, soccer, and ping-pong. Last Friday, I won in our mini soccer game! But in art class, I always wish I could run outside instead of drawing the pictures. The 45-minute class feels much longer than other classes.",
        "Every student has different favourite and least favourite subjects. Some love quiet classes while others love moving around. That's what makes school interesting — we all get to enjoy different activities and learn in our own special ways!",
      ],
      items: [
        {
          q: "How often does Emma have art class?",
          options: ["Every day.", "Once a week.", "Twice a week.", "Three times a week."],
          a: "C",
          explain: "原文 Every Tuesday and Thursday 表明每周两次，故选 Twice a week。",
        },
        {
          q: "What do we know about Mr Johnson?",
          options: ["He teaches history.", "He is a strict teacher.", "He makes science fun to learn.", "He doesn't like doing experiments."],
          a: "C",
          explain: "Liam 说 Our teacher, Mr Johnson, makes learning fun with cool experiments，说明他把科学课变得有趣。",
        },
        {
          q: "Which student is correctly matched (正确匹配) with his or her favourite subject?",
          options: ["Emma — P.E.", "Liam — Maths", "Sophia — Music", "Noah — Art"],
          a: "C",
          explain: "Sophia 说 I love music class the most，故 Sophia — Music 正确。",
        },
        {
          q: "What does Noah think about art?",
          options: ["It's an exciting class.", "He doesn't like it at all.", "It's as interesting as P.E.", "He wants more art classes."],
          a: "B",
          explain: "Noah 说上美术课时总希望能到外面跑，说明他根本不喜欢美术课。",
        },
        {
          q: "Where might we find this text?",
          options: ["In a sports magazine.", "In a science textbook.", "In a travel guidebook.", "In a school newsletter."],
          a: "D",
          explain: "文章记录四名学生对学校学科的看法，最可能出现在学校简报（school newsletter）上。",
        },
      ],
    },
  ],
};