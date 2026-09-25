// 初中语法专题 · 外地中考真题（单项选择）
// 说明：北京中考单项填空不考查冠词、名词的数等，故补充其他省市中考真题。
// 来源：
//   1) 无忧考网《2017中考英语专项训练：初中英语冠词练习题》 https://www.51test.net/show/8101598.html
//   2) 无忧考网《中考英语名词试题汇总（附答案）》 https://www.51test.net/show/2406757.html
//   3) 无忧考网《中考英语量词、数词试题归总2012》 https://www.51test.net/show/2406707.html
//   4) 无忧考网《初三中考英语状语从句试题归类》 https://www.51test.net/show/3051212.html
//   5) 中考网《2024年中考真题系列--感叹句》 http://www.zhongkao.com/e/20230925/651186b35b0d3.shtml
// 题目按「真题原题」收录，仅补充标点与格式，不改动题干与选项内容；每题均保留年份与地区。

import { otherPoints } from "./points.js";

const compiledByTopic = {
  "g-articles": "https://www.51test.net/show/8101598.html",
  "g-nouns": "https://www.51test.net/show/2406757.html",
  "g-numerals": "https://www.51test.net/show/2406707.html",
  "g-adverbial-clause": "https://www.51test.net/show/3051212.html",
  "g-imperatives": "http://www.zhongkao.com/e/20230925/651186b35b0d3.shtml",
};

export const otherRegionExams = [
  {
    id: "other-art-2013-nanping", topicId: "g-articles", answer: "B", difficulty: 1,
    region: "福建省南平市", year: 2013,
    stem: "This is ________ interesting book and I enjoy it.",
    options: ["a", "an", "the"],
    explanation: "考查不定冠词。interesting 以元音音素 /ɪ/ 开头，用 an。故选 B。",
  },
  {
    id: "other-art-2013-heihe", topicId: "g-articles", answer: "B", difficulty: 1,
    region: "黑龙江省黑河市", year: 2013,
    stem: "Bill likes playing ________ basketball, but he doesn't like playing ________ piano.",
    options: ["the; the", "/; the", "the; /"],
    explanation: "考查冠词。球类运动前不加冠词，乐器前加 the，故为 /; the。故选 B。",
  },
  {
    id: "other-art-2013-jilin", topicId: "g-articles", answer: "D", difficulty: 1,
    region: "吉林省", year: 2013,
    stem: "Lisa had ________ egg and ________ glass of milk for breakfast this morning.",
    options: ["a; a", "an; an", "a; an", "an; a"],
    explanation: "考查不定冠词。egg 以元音音素开头用 an，glass 以辅音音素开头用 a。故选 D。",
  },
  {
    id: "other-art-2013-huaian", topicId: "g-articles", answer: "C", difficulty: 1,
    region: "江苏省淮安市", year: 2013,
    stem: "This summer, I'm going to visit ________ Great Wall.",
    options: ["a", "an", "the", "/"],
    explanation: "考查定冠词。由普通名词构成的专有名词（the Great Wall）前用 the。故选 C。",
  },
  {
    id: "other-art-2012-huanggang", topicId: "g-articles", answer: "D", difficulty: 2,
    region: "湖北省黄冈市", year: 2012,
    stem: "As we know, England is ________ European country and Singapore is ________ Asian country.",
    options: ["an; an", "an; a", "a; a", "a; an"],
    explanation: "考查不定冠词。European 虽以元音字母开头，但读音以辅音音素 /j/ 开头，用 a；Asian 以元音音素开头，用 an。故选 D。",
  },
  {
    id: "other-art-2012-guiyang", topicId: "g-articles", answer: "B", difficulty: 1,
    region: "贵州省贵阳市", year: 2012,
    stem: "\u201cCindy, do you have ________ e-mail address? I want to send you some photos.\u201d \u201cYes, I do. It's cindy126@sohu.com.\u201d",
    options: ["a", "an", "the"],
    explanation: "考查不定冠词。e-mail 以元音音素 /iː/ 开头，用 an。故选 B。",
  },
  {
    id: "other-art-2012-nanjing", topicId: "g-articles", answer: "D", difficulty: 2,
    region: "江苏省南京市", year: 2012,
    stem: "—What do you usually have for ________ breakfast, Peter?\n—A fried egg, three pieces of bread and a glass of milk.",
    options: ["a", "an", "the", "/"],
    explanation: "考查零冠词。三餐名词前一般不加冠词。故选 D。",
  },
  {
    id: "other-art-2012-tianjin", topicId: "g-articles", answer: "A", difficulty: 2,
    region: "天津市", year: 2012,
    stem: "We usually go to ________ school on weekdays, and sometimes go to ________ cinema at weekends.",
    options: ["/; the", "the; the", "the; /", "/; /"],
    explanation: "考查冠词。go to school 表示“去上学”，school 前不加冠词；go to the cinema 表示“去看电影”，cinema 前加 the。故选 A。",
  },

  // ===== 名词与主谓一致（2011–2012 年各地中考真题）=====
  {
    id: "other-noun-2012-suizhou", topicId: "g-nouns", answer: "D", difficulty: 1, region: "湖北省随州市", year: 2012,
    stem: "The ________ often eat grass on the hill.",
    options: ["chicken", "horse", "cow", "sheep"],
    explanation: "考查名词的数。谓语 eat 表明主语是复数；sheep 单复数同形，故选 D。",
  },
  {
    id: "other-noun-2012-guiyang", topicId: "g-nouns", answer: "B", difficulty: 1, region: "贵州省贵阳市", year: 2012,
    stem: "\u201cWhat do we need for the salad?\u201d \u201cWe need two apples and three ________.\u201d",
    options: ["orange", "tomatoes", "broccoli"],
    explanation: "考查名词的数。three 后接可数名词复数；broccoli 是不可数名词，故选 B。",
  },
  {
    id: "other-noun-2012-guangdong", topicId: "g-nouns", answer: "C", difficulty: 1, region: "广东省", year: 2012,
    stem: "The students of Grade 7 visited Mike's farm and saw many ________ there.",
    options: ["bird", "duck", "sheep", "rabbit"],
    explanation: "考查名词的数。many 后接可数名词复数；sheep 单复数同形，故选 C。",
  },
  {
    id: "other-noun-2012-yulin", topicId: "g-nouns", answer: "D", difficulty: 2, region: "广西壮族自治区玉林市", year: 2012,
    stem: "The Internet is very useful. We can get a lot of ________ from it.",
    options: ["thing", "message", "informations", "information"],
    explanation: "考查不可数名词。information 是不可数名词，不能加 -s；a lot of 可修饰不可数名词，故选 D。",
  },
  {
    id: "other-noun-2012-anshun", topicId: "g-nouns", answer: "D", difficulty: 2, region: "贵州省安顺市", year: 2012,
    stem: "Could you please give some ________ to the ________ teachers?",
    options: ["advice; man", "advices; men", "suggestion; man", "suggestions; men"],
    explanation: "考查名词的数。some 后接可数名词复数 suggestions；man 作定语修饰复数名词时也变复数，用 men。故选 D。",
  },
  {
    id: "other-noun-2011-enshi", topicId: "g-nouns", answer: "B", difficulty: 2, region: "湖北省恩施州", year: 2011,
    stem: "—How far is it from your home to school?\n—It's about twenty ________ walk.",
    options: ["minute's", "minutes'", "minutes"],
    explanation: "考查名词所有格。表示“二十分钟的步行路程”，twenty 为复数，其所有格在词尾加撇号，故为 minutes'。故选 B。",
  },
  {
    id: "other-noun-2012-jinan", topicId: "g-nouns", answer: "A", difficulty: 2, region: "山东省济南市", year: 2012,
    stem: "—Mum, I am hungry. May I have some ________?\n—Of course. But don't eat too much.",
    options: ["bread", "noodle", "dumpling", "hamburger"],
    explanation: "考查可数与不可数名词。too much 修饰不可数名词，选项中只有 bread 是不可数名词。故选 A。",
  },
  {
    id: "other-noun-2012-taian", topicId: "g-nouns", answer: "D", difficulty: 2, region: "山东省泰安市", year: 2012,
    stem: "—Would you like some ________?\n—Yes, a little please.",
    options: ["apple", "banana", "orange", "milk"],
    explanation: "考查可数与不可数名词。a little 修饰不可数名词，选项中只有 milk 是不可数名词。故选 D。",
  },
  {
    id: "other-noun-2012-guangan", topicId: "g-nouns", answer: "C", difficulty: 2, region: "四川省广安市", year: 2012,
    stem: "—Miss Li, could you give me ________ on English learning?\n—Certainly. First you should speak English every day.",
    options: ["any advices", "many advices", "some advice"],
    explanation: "考查不可数名词。advice 不可数，没有复数形式，也不能用 many 修饰；some 可修饰不可数名词。故选 C。",
  },
  {
    id: "other-noun-2012-shaanxi", topicId: "g-nouns", answer: "C", difficulty: 2, region: "陕西省", year: 2012,
    stem: "I'm going to the supermarket to buy some ________ this afternoon.",
    options: ["paper and pencil", "apples and bananas", "milk and eggs", "bowl and spoons"],
    explanation: "考查名词的数与搭配。some 后接可数名词复数或不可数名词，只有 milk and eggs 搭配合理且形式正确。故选 C。",
  },

  // ===== 数词（2011–2012 年各地中考真题）=====
  {
    id: "other-num-2012-qianxinan", topicId: "g-numerals", answer: "A", difficulty: 2, region: "贵州省黔西南州", year: 2012,
    stem: "________ visitors come to Xingyi during May Day holidays every year.",
    options: ["Thousands of", "Two thousands", "Thousand of", "Thousand"],
    explanation: "考查概数。表示不确切数量时用 thousands of；有具体数字时才用单数且不接 of。故选 A。",
  },
  {
    id: "other-num-2012-guangdong", topicId: "g-numerals", answer: "B", difficulty: 2, region: "广东省", year: 2012,
    stem: "—How was your weekend?\n—Great! It was my grandfather's ________ birthday. We enjoyed ourselves.",
    options: ["seventy", "seventieth", "the seventieth", "seventeenth"],
    explanation: "考查序数词。表示“第几十个生日”用序数词；名词前已有 my grandfather's 所有格，不再加 the。故选 B。",
  },
  {
    id: "other-num-2012-tongren", topicId: "g-numerals", answer: "B", difficulty: 3, region: "贵州省铜仁市", year: 2012,
    stem: "About ________ of the students in Grade Nine this year were born in the ________.",
    options: ["three five; 1996", "three fifths; 1990s", "third fifth; 1997", "third fifths; 1990s"],
    explanation: "考查分数与年代。分数分子用基数词、分母用序数词，分子大于 1 时分母加 -s，故为 three fifths；表示“90 年代”用 1990s。故选 B。",
  },
  {
    id: "other-num-2011-enshi", topicId: "g-numerals", answer: "B", difficulty: 2, region: "湖北省恩施州", year: 2011,
    stem: "He wrote his ________ novel when he was ________.",
    options: ["five; fifties", "fifth; fifty", "fifth; fiftieth"],
    explanation: "考查序数词与基数词。“第五部小说”用序数词 fifth；表示年龄“五十岁”用基数词 fifty。故选 B。",
  },
  {
    id: "other-num-2012-liangshan", topicId: "g-numerals", answer: "B", difficulty: 3, region: "四川省凉山州", year: 2012,
    stem: "There are ________ teachers in our school, and ________ of them are women teachers.",
    options: ["two hundreds; three fourth", "two hundred; three fourths", "two hundred; three forths"],
    explanation: "考查数词与分数。具体数字 two 后 hundred 不加 -s；分数 three fourths 的分母用序数词复数形式。故选 B。",
  },
  {
    id: "other-num-2012-heihe", topicId: "g-numerals", answer: "A", difficulty: 2, region: "黑龙江省黑河市", year: 2012,
    stem: "A ________ girl named Dong Xinyi looked after her disabled father.",
    options: ["three-year-old", "three-years-old", "three years old"],
    explanation: "考查复合形容词。数词 + 名词单数 + 形容词作定语时用连字符，名词用单数，故为 three-year-old。故选 A。",
  },
  {
    id: "other-num-2012-liaocheng", topicId: "g-numerals", answer: "D", difficulty: 3, region: "山东省聊城市", year: 2012,
    stem: "Please turn to page ________ and look at the ________ picture in this unit.",
    options: ["twentieth; one", "twenty; one", "twentieth; first", "twenty; first"],
    explanation: "考查编号与序数词。“第 20 页”用 page twenty；表示“第一幅图”用序数词 first。故选 D。",
  },
  {
    id: "other-num-2012-hangzhou", topicId: "g-numerals", answer: "B", difficulty: 3, region: "浙江省杭州市", year: 2012,
    stem: "We have two ears and one mouth so that we can listen ________ we speak.",
    options: ["as twice much as", "twice as much as", "as much as twice", "as much twice as"],
    explanation: "考查倍数表达。倍数词 twice 放在 as ... as 结构之前，即 twice as much as。故选 B。",
  },

  // ===== 状语从句（2012 年各地中考真题）=====
  {
    id: "other-adv-2012-fuzhou", topicId: "g-adverbial-clause", answer: "B", difficulty: 2, region: "福建省福州市", year: 2012,
    stem: "—We'll go for a picnic if it ________ this Sunday.\n—Wish you a lovely weekend.",
    options: ["rain", "doesn't rain", "won't rain"],
    explanation: "考查条件状语从句。主句是一般将来时，if 从句用一般现在时；表示“不下雨”用 doesn't rain。故选 B。",
  },
  {
    id: "other-adv-2012-guiyang", topicId: "g-adverbial-clause", answer: "C", difficulty: 2, region: "贵州省贵阳市", year: 2012,
    stem: "Teresa is ________ nervous ________ she can't talk in front of the class.",
    options: ["such, that", "too, to", "so, that"],
    explanation: "考查结果状语从句。so + 形容词 + that 从句；such 后接名词，too...to 后接动词原形。故选 C。",
  },
  {
    id: "other-adv-2012-anhui", topicId: "g-adverbial-clause", answer: "C", difficulty: 3, region: "安徽省", year: 2012,
    stem: "—What's your plan for the summer holidays?\n—I'll go to Beijing ________ the school term ends.",
    options: ["in order that", "so that", "as soon as", "even though"],
    explanation: "考查时间状语从句。as soon as 表示“一……就……”，引导时间状语从句。故选 C。",
  },
  {
    id: "other-adv-2012-mianyang", topicId: "g-adverbial-clause", answer: "A", difficulty: 2, region: "四川省绵阳市", year: 2012,
    stem: "________ I was in the US, I made a lot of American friends.",
    options: ["While", "Although", "Unless", "Until"],
    explanation: "考查时间状语从句。While 表示“在……期间”，引导时间状语从句。故选 A。",
  },
  {
    id: "other-adv-2012-tongren", topicId: "g-adverbial-clause", answer: "C", difficulty: 3, region: "贵州省铜仁市", year: 2012,
    stem: "The bus driver always says to us, \u201cDon't get off ________ the bus stops.\u201d",
    options: ["when", "while", "until", "if"],
    explanation: "考查时间状语从句。not ... until 表示“直到……才……”。故选 C。",
  },
  {
    id: "other-adv-2012-leshan", topicId: "g-adverbial-clause", answer: "A", difficulty: 2, region: "四川省乐山市", year: 2012,
    stem: "________ he has little knowledge, the old worker has a lot of experience.",
    options: ["Although", "Because", "If"],
    explanation: "考查让步状语从句。前后为让步关系：虽然知识不多，但经验丰富，用 Although。故选 A。",
  },
  {
    id: "other-adv-2012-guangdong", topicId: "g-adverbial-clause", answer: "D", difficulty: 3, region: "广东省", year: 2012,
    stem: "—If our government ________ attention to controlling food safety now, our health ________ in danger.",
    options: ["won't pay, is", "doesn't pay, is", "won't pay, will be", "doesn't pay, will be"],
    explanation: "考查条件状语从句的“主将从现”。if 从句用一般现在时 doesn't pay，主句用一般将来时 will be。故选 D。",
  },
  {
    id: "other-adv-2012-chengdu", topicId: "g-adverbial-clause", answer: "C", difficulty: 2, region: "四川省成都市", year: 2012,
    stem: "—I want to know when Mr. Brown will arrive.\n—When he ________, I will tell you.",
    options: ["will arrive", "arrived", "arrives"],
    explanation: "考查时间状语从句。when 引导时间状语从句时用一般现在时表示将来，故用 arrives。故选 C。",
  },

  // ===== 感叹句（2020 年各地中考真题）=====
  {
    id: "other-excl-2020-qiandongnan", topicId: "g-imperatives", answer: "A", difficulty: 2, region: "贵州省黔东南州", year: 2020,
    stem: "—The Chinese government has successfully stopped the virus from spreading in China.\n—________ proud we Chinese feel!",
    options: ["How", "How a", "What", "What a"],
    explanation: "考查感叹句。中心词 proud 是形容词，用 How 引导：How + 形容词 + 主语 + 谓语！故选 A。",
  },
  {
    id: "other-excl-2020-binzhou", topicId: "g-imperatives", answer: "C", difficulty: 2, region: "山东省滨州市", year: 2020,
    stem: "—The little boy is only three years old, but he can memorize about 50 poems.\n—________ talented boy he is!",
    options: ["How", "How a", "What a", "What"],
    explanation: "考查感叹句。中心词 boy 是可数名词单数，用 What a + 形容词 + 单数名词 + 主语 + 谓语！故选 C。",
  },
  {
    id: "other-excl-2020-guangyuan", topicId: "g-imperatives", answer: "C", difficulty: 2, region: "四川省广元市", year: 2020,
    stem: "—Do you know that we have already made great progress in 5G?\n—Oh, ________ exciting news!",
    options: ["how", "what an", "what"],
    explanation: "考查感叹句。news 是不可数名词，用 What + 形容词 + 不可数名词！不加不定冠词。故选 C。",
  },
  {
    id: "other-excl-2020-mudanjiang", topicId: "g-imperatives", answer: "A", difficulty: 2, region: "黑龙江省牡丹江市", year: 2020,
    stem: "—Do you know the last Beidou satellite was launched successfully yesterday?\n—________ good news! All the people are proud of the achievements China has made.",
    options: ["What", "What a", "How"],
    explanation: "考查感叹句。news 是不可数名词，用 What + 形容词 + 不可数名词！故选 A。",
  },
  {
    id: "other-excl-2020-suihua", topicId: "g-imperatives", answer: "C", difficulty: 2, region: "黑龙江省绥化市", year: 2020,
    stem: "________ interesting stories they are!",
    options: ["What an", "How", "What"],
    explanation: "考查感叹句。中心词 stories 是可数名词复数，用 What + 形容词 + 复数名词 + 主语 + 谓语！故选 C。",
  },
  {
    id: "other-excl-2020-ezhou", topicId: "g-imperatives", answer: "B", difficulty: 2, region: "湖北省鄂州市", year: 2020,
    stem: "—________ unusual year 2020 is!\n—Yeah! The pandemic is a challenge not only to China but also to the world.",
    options: ["What", "What an", "What a", "How"],
    explanation: "考查感叹句。year 是可数名词单数，unusual 以元音音素开头，用 What an。故选 B。",
  },
  {
    id: "other-excl-2020-hainan", topicId: "g-imperatives", answer: "C", difficulty: 2, region: "海南省", year: 2020,
    stem: "—Look, that is Tower Bridge!\n—Wow, ________ great bridge it is!",
    options: ["what", "how", "what a"],
    explanation: "考查感叹句。bridge 是可数名词单数，great 以辅音音素开头，用 What a。故选 C。",
  },
  {
    id: "other-excl-2020-suqian", topicId: "g-imperatives", answer: "B", difficulty: 2, region: "江苏省宿迁市", year: 2020,
    stem: "________ useful dictionary it is! I want to buy one.",
    options: ["What", "What a", "How", "How a"],
    explanation: "考查感叹句。dictionary 是可数名词单数，useful 虽以元音字母开头但读音以辅音音素 /j/ 开头，用 What a。故选 B。",
  },
].map((item) => ({
  ...item,
  origin: "exam-other",
  point: otherPoints[item.id] || "",
  type: "choice",
  sourceLabel: `${item.region}中考英语（${item.year}年）· 单项选择题`,
  source: {
    type: "exam",
    region: item.region,
    year: item.year,
    section: "单项选择题",
    compiledFrom: compiledByTopic[item.topicId] || "",
    note: "题目取自公开汇编，题面自带年份与地区标注；非北京卷。",
  },
}));
