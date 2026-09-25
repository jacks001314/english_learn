// 初中语法专题 · 真题练习数据
// 来源：北京市中考英语「一、单项填空」（全市统考真题），题干、选项、答案、详解均取自真题原卷与官方答案。
// 原始文件：backend/exams/beijing/<年份>/content.txt
// 覆盖年份：2021–2025（近 5 年）。
// - 2022/2023/2024：原卷文本 + 官方答案与详解。
// - 2025：原卷为扫描件，题干经逐页图像核对，答案取自官方《英语试卷答案及评分标准》答案页。
// - 2021：原卷为扫描件且未附答案页，题干经逐页图像核对，答案按题目语法唯一确定。
// 语篇原句改编练习（冠词、数词、There be、祈使句等）见 adapted.js。

import { adaptedItems } from "./adapted.js";
import { otherRegionExams } from "./exams-other.js";
import { authoredExercises } from "./authored.js";
import { beijingPoints, adaptedPoints } from "./points.js";

const examPaper = (year) => `北京市中考英语（${year}年）`;

// 答案出处，用于在前端如实标注每道题的答案来源。
const answerSourceByYear = {
  2021: "题干经原卷图像核对；原卷扫描件未附答案页，答案按题目语法唯一确定",
  2022: "原卷官方答案与详解",
  2023: "原卷官方答案与详解",
  2024: "原卷官方答案与详解",
  2025: "题干经原卷图像核对；答案取自官方《英语试卷答案及评分标准》",
};

const raw = [
  // ---------------- 2022 ----------------
  {
    year: 2022, no: 1, topicId: "g-pronouns", answer: "B",
    stem: "My sister is only six, but ________ can already help with some housework.",
    options: ["he", "she", "it", "they"],
    explanation: "考查代词辨析。句意：我妹妹只有六岁，但她已经能帮忙做一些家务了。he 他；she 她；it 它；they 他们。此处指前文提到的“My sister”，应用 she。故选 B。",
  },
  {
    year: 2022, no: 2, topicId: "g-prepositions", answer: "A",
    stem: "We have history class ________ three o'clock every Friday afternoon.",
    options: ["at", "on", "in", "to"],
    explanation: "考查介词辨析。at 后接具体时间点；on 后接星期或具体某天；in 后接早中晚、月份、季节、年份等。“three o'clock”是时间点，用 at。故选 A。",
  },
  {
    year: 2022, no: 3, topicId: "g-modal-verbs", answer: "C",
    stem: "—________ I take photos here?\n—Sorry, you can't. It's not allowed in the museum.",
    options: ["Must", "Need", "Can", "Will"],
    explanation: "考查情态动词辨析。句意：——我可以在这里拍照吗？——对不起，你不能。博物馆不允许拍照。Can 表示请求许可，符合语境；由答语“you can't”也可反推。故选 C。",
  },
  {
    year: 2022, no: 4, topicId: "g-adj-adv", answer: "B",
    stem: "After taking tennis classes, Tim is much ________ than last year.",
    options: ["strong", "stronger", "strongest", "the strongest"],
    explanation: "考查形容词比较等级。句中出现 than，表示两者比较，应使用比较级 stronger；much 用于修饰比较级。故选 B。",
  },
  {
    year: 2022, no: 5, topicId: "g-questions", answer: "A",
    stem: "—________ will Liu Yang stay in the space station this time?\n—For six months.",
    options: ["How long", "How often", "How much", "How soon"],
    explanation: "考查疑问词组辨析。答语“For six months.”表示一段时间，故用 How long 提问。How often 提问频率；How much 提问数量或价格；How soon 提问多久以后。故选 A。",
  },
  {
    year: 2022, no: 6, topicId: "g-conjunctions", answer: "D",
    stem: "Mr. Smith has helped me a lot, ________ I'm thankful to him.",
    options: ["or", "but", "for", "so"],
    explanation: "考查连词辨析。句意：史密斯先生帮了我很多，因此我很感激他。前后为因果关系，用 so。故选 D。",
  },
  {
    year: 2022, no: 7, topicId: "g-present-continuous", answer: "D",
    stem: "The workers ________ the community center now.",
    options: ["cleaned", "were cleaning", "will clean", "are cleaning"],
    explanation: "考查动词时态。时间状语 now 表明动作正在进行，应用现在进行时 are cleaning。故选 D。",
  },
  {
    year: 2022, no: 8, topicId: "g-if-clause", answer: "A",
    stem: "Don't lose heart. If you keep working hard, you ________ some day.",
    options: ["will succeed", "succeed", "succeeded", "have succeeded"],
    explanation: "考查 if 条件状语从句的时态。if 引导真实条件句时遵循“主将从现”，主句用一般将来时，从句用一般现在时。故选 A。",
  },
  {
    year: 2022, no: 9, topicId: "g-past-continuous", answer: "C",
    stem: "I ________ about my sister when my phone rang. It was her!",
    options: ["think", "will think", "was thinking", "am thinking"],
    explanation: "考查动词时态。when 引导的从句用一般过去时，表示过去某个时间点正在进行的动作用过去进行时 was thinking。故选 C。",
  },
  {
    year: 2022, no: 10, topicId: "g-present-perfect", answer: "D",
    stem: "Jim ________ a lot about Chinese culture since he began to study in our school.",
    options: ["learns", "learned", "will learn", "has learned"],
    explanation: "考查动词时态。since 引导的时间状语从句表示从过去某一时间延续到现在，主句用现在完成时 has learned。故选 D。",
  },
  {
    year: 2022, no: 11, topicId: "g-passive-voice", answer: "C",
    stem: "On our farm, the tea leaves ________ by hand when they are ready.",
    options: ["pick", "picked", "are picked", "were picked"],
    explanation: "考查动词的语态。主语 the tea leaves 与 pick 之间是被动关系，且句子描述的是一般性事实，用一般现在时的被动语态 are picked。故选 C。",
  },
  {
    year: 2022, no: 12, topicId: "g-object-clause", answer: "B",
    stem: "—Do you know ________ the new national park?\n—Yes, I do. To protect wildlife and benefit the local people.",
    options: ["why did China set up", "why China set up", "when did China set up", "when China set up"],
    explanation: "考查宾语从句。宾语从句用陈述语序，排除 A、C；答语说明的是目的，故用 why 引导。故选 B。",
  },

  // ---------------- 2023 ----------------
  {
    year: 2023, no: 1, topicId: "g-pronouns", answer: "B",
    stem: "My sister enjoys singing and ________ favorite subject is music.",
    options: ["his", "her", "your", "their"],
    explanation: "考查代词用法。句意：我的姐姐喜欢唱歌，她最喜欢的科目是音乐。此处修饰名词 subject，需用形容词性物主代词；主语 My sister 为女性，用 her。故选 B。",
  },
  {
    year: 2023, no: 2, topicId: "g-prepositions", answer: "C",
    stem: "It's a good idea to visit Beijing ________ October.",
    options: ["at", "on", "in", "to"],
    explanation: "考查介词辨析。at 后接时间点；on 后接具体某天或某天的早中晚；in 后接年份、月份、季节等。October 是月份，用 in。故选 C。",
  },
  {
    year: 2023, no: 3, topicId: "g-modal-verbs", answer: "A",
    stem: "—Must I stay here and wait for you?\n—No, you ________. You can go home now.",
    options: ["needn't", "can't", "mustn't", "shouldn't"],
    explanation: "考查情态动词。must 引导的一般疑问句，否定回答用 needn't（不必），不能用 mustn't（禁止）。故选 A。",
  },
  {
    year: 2023, no: 4, topicId: "g-adj-adv", answer: "B",
    stem: "—Which do you like ________, swimming or skating?\n—Swimming.",
    options: ["well", "better", "best", "the best"],
    explanation: "考查副词比较等级。swimming or skating 表明是两者比较，应用比较级 better。故选 B。",
  },
  {
    year: 2023, no: 5, topicId: "g-questions", answer: "A",
    stem: "—________ do you tidy your own room?\n—Twice a week.",
    options: ["How often", "How soon", "How much", "How long"],
    explanation: "考查疑问词组辨析。答语 Twice a week. 表示频率，用 How often 提问。故选 A。",
  },
  {
    year: 2023, no: 6, topicId: "g-conjunctions", answer: "D",
    stem: "It was difficult to climb the mountain, ________ Sam got to the top at last.",
    options: ["or", "so", "for", "but"],
    explanation: "考查连词辨析。句意：爬山很困难，但 Sam 最终到达了山顶。前后为转折关系，用 but。故选 D。",
  },
  {
    year: 2023, no: 7, topicId: "g-present-continuous", answer: "C",
    stem: "—Lucy, what are you doing?\n—I ________ a model ship.",
    options: ["make", "made", "am making", "was making"],
    explanation: "考查动词时态。问句 What are you doing? 为现在进行时，答语也应用现在进行时 am making。故选 C。",
  },
  {
    year: 2023, no: 8, topicId: "g-past-simple", answer: "B",
    stem: "The Shenzhou-15 astronauts ________ to Earth safely on June 4, 2023.",
    options: ["return", "returned", "will return", "have returned"],
    explanation: "考查动词时态。时间状语 on June 4, 2023 表示过去的时间，应用一般过去时 returned。故选 B。",
  },
  {
    year: 2023, no: 9, topicId: "g-if-clause", answer: "C",
    stem: "If you go to the concert with us tomorrow, you ________ a great time there.",
    options: ["have", "had", "will have", "have had"],
    explanation: "考查 if 条件状语从句。if 引导真实条件句，遵循“主将从现”：从句用一般现在时 go，主句用一般将来时 will have。故选 C。",
  },
  {
    year: 2023, no: 10, topicId: "g-present-perfect", answer: "D",
    stem: "Eric ________ many things since he became interested in science.",
    options: ["is learning", "was learning", "will learn", "has learned"],
    explanation: "考查动词时态。since 引导的从句表示从过去持续到现在，主句用现在完成时 has learned。故选 D。",
  },
  {
    year: 2023, no: 11, topicId: "g-passive-voice", answer: "A",
    stem: "The park is getting more and more beautiful because more kinds of flowers ________ every year.",
    options: ["are planted", "were planted", "plant", "planted"],
    explanation: "考查动词时态和语态。every year 表明用一般现在时；主语 flowers 与 plant 是被动关系，用一般现在时被动语态 are planted。故选 A。",
  },
  {
    year: 2023, no: 12, topicId: "g-object-clause", answer: "B",
    stem: "—Lily, can you tell me ________ during the Dragon Boat Festival this year?\n—Sure. We ate zongzi and watched a dragon boat race.",
    options: ["what you will do", "what you did", "what will you do", "what did you do"],
    explanation: "考查宾语从句。宾语从句用陈述语序，排除 C、D；答语 We ate zongzi… 表明动作发生在过去，用一般过去时。故选 B。",
  },

  // ---------------- 2024 ----------------
  {
    year: 2024, no: 1, topicId: "g-pronouns", answer: "A",
    stem: "My friends and I like sports. ________ often play basketball together after school.",
    options: ["We", "I", "They", "You"],
    explanation: "考查代词辨析。句意：我和朋友都喜欢运动。我们经常在放学后一起打篮球。主语是 My friends and I，指“我们”，用 We。故选 A。",
  },
  {
    year: 2024, no: 2, topicId: "g-prepositions", answer: "B",
    stem: "The Chang'e-6 landed on the far side of the moon ________ June 2, 2024.",
    options: ["at", "on", "to", "in"],
    explanation: "考查介词辨析。June 2, 2024 是具体某一天，其前应用介词 on。故选 B。",
  },
  {
    year: 2024, no: 3, topicId: "g-modal-verbs", answer: "A",
    stem: "—Bill, ________ I use your ruler?\n—Of course you can. Here you are.",
    options: ["can", "must", "need", "should"],
    explanation: "考查情态动词。句意：Bill，我可以用你的尺子吗？根据答语 Of course you can. 可知此处表示请求允许，用 can。故选 A。",
  },
  {
    year: 2024, no: 4, topicId: "g-adj-adv", answer: "D",
    stem: "What a lovely reading room! It's one of ________ in our school.",
    options: ["nice", "nicer", "nicest", "the nicest"],
    explanation: "考查形容词最高级。one of + the + 形容词最高级 + 复数名词，意为“最……之一”，故用 the nicest。故选 D。",
  },
  {
    year: 2024, no: 5, topicId: "g-questions", answer: "B",
    stem: "—Lily, your new schoolbag is pretty. ________ did you buy it?\n—In a store near my home.",
    options: ["How", "Where", "Why", "When"],
    explanation: "考查疑问词辨析。答语 In a store near my home. 表示地点，用 Where 提问。故选 B。",
  },
  {
    year: 2024, no: 6, topicId: "g-conjunctions", answer: "C",
    stem: "—Hi, Mike! Would you like to go boating with me?\n—Yes, I'd love to, ________ I have to finish my science project first.",
    options: ["and", "or", "but", "for"],
    explanation: "考查连词辨析。句意：是的，我想去，但是我必须先完成科学项目。前后为转折关系，用 but。故选 C。",
  },
  {
    year: 2024, no: 7, topicId: "g-past-simple", answer: "B",
    stem: "—What did you do last Saturday, Tina?\n—I ________ to the nursing home and worked as a volunteer there.",
    options: ["go", "went", "will go", "was going"],
    explanation: "考查动词时态。问句 What did you do last Saturday 询问上周六做了什么，答语描述过去发生的动作，用一般过去时 went。故选 B。",
  },
  {
    year: 2024, no: 8, topicId: "g-present-simple", answer: "A",
    stem: "A lot of people in China ________ by high-speed train every year.",
    options: ["travel", "traveled", "will travel", "have traveled"],
    explanation: "考查动词时态。时间状语 every year 表明描述习惯性、经常性的动作，用一般现在时 travel。故选 A。",
  },
  {
    year: 2024, no: 9, topicId: "g-past-continuous", answer: "C",
    stem: "—Amy, you didn't answer my call yesterday evening. What were you doing?\n—Sorry, I didn't hear the ring. I ________ a book in my study.",
    options: ["am reading", "have read", "was reading", "will read"],
    explanation: "考查动词时态。yesterday evening 和 What were you doing? 表明描述过去某一时刻正在进行的动作，用过去进行时 was reading。故选 C。",
  },
  {
    year: 2024, no: 10, topicId: "g-present-perfect", answer: "D",
    stem: "With the help of my teacher, I ________ much progress in English since last year.",
    options: ["am making", "will make", "was making", "have made"],
    explanation: "考查动词时态。时间状语 since last year 表示从去年延续到现在，用现在完成时 have made。故选 D。",
  },
  {
    year: 2024, no: 11, topicId: "g-passive-voice", answer: "C",
    stem: "Chinese ________ by more and more people around the world these days.",
    options: ["speaks", "spoke", "is spoken", "was spoken"],
    explanation: "考查动词时态和语态。主语 Chinese 与 speak 是被动关系，用被动语态；these days 表明描述客观事实，用一般现在时，故为 is spoken。故选 C。",
  },
  {
    year: 2024, no: 12, topicId: "g-object-clause", answer: "D",
    stem: "—Tim, do you know ________ the art festival?\n—Sure! Next Friday.",
    options: ["when did we hold", "when we held", "when will we hold", "when we will hold"],
    explanation: "考查宾语从句。宾语从句用陈述语序，排除 A、C；答语 Next Friday. 表示将来，用一般将来时。故选 D。",
  },

  // ---------------- 2025 ----------------
  {
    year: 2025, no: 1, topicId: "g-pronouns", answer: "D",
    stem: "My sister is good at singing. ________ can even sing some French songs.",
    options: ["I", "He", "You", "She"],
    explanation: "考查代词辨析。句意：我姐姐擅长唱歌，她甚至能唱一些法语歌。此处指代前文的 My sister，是女性，用 She。故选 D。",
  },
  {
    year: 2025, no: 2, topicId: "g-prepositions", answer: "D",
    stem: "These Chinese astronauts will stay in the space station ________ six months.",
    options: ["at", "on", "to", "for"],
    explanation: "考查介词辨析。six months 是一段时间，用 for 表示持续时长。故选 D。",
  },
  {
    year: 2025, no: 3, topicId: "g-modal-verbs", answer: "A",
    stem: "—Mom, ________ I go to the cinema with my classmates this Sunday afternoon?\n—Yes, of course you can.",
    options: ["can", "must", "need", "should"],
    explanation: "考查情态动词。答语 Yes, of course you can. 提示此处是请求许可，用 can。故选 A。",
  },
  {
    year: 2025, no: 4, topicId: "g-adj-adv", answer: "D",
    stem: "The National Library of China is ________ public library in Asia.",
    options: ["large", "larger", "largest", "the largest"],
    explanation: "考查形容词最高级。in Asia 表示比较范围，三者以上用最高级，最高级前加 the，故为 the largest。故选 D。",
  },
  {
    year: 2025, no: 5, topicId: "g-questions", answer: "B",
    stem: "—Steve, ________ did you begin to learn how to play chess?\n—About two years ago.",
    options: ["what", "when", "why", "where"],
    explanation: "考查疑问词辨析。答语 About two years ago. 表示时间，用 when 提问。故选 B。",
  },
  {
    year: 2025, no: 6, topicId: "g-conjunctions", answer: "C",
    stem: "Janet has done a lot for us, ________ we want to write her a thank-you letter.",
    options: ["or", "but", "so", "for"],
    explanation: "考查连词辨析。句意：Janet 为我们做了很多，所以我们想给她写一封感谢信。前后为因果关系，用 so。故选 C。",
  },
  {
    year: 2025, no: 7, topicId: "g-past-continuous", answer: "B",
    stem: "Mary ________ a picture when her dad got home yesterday evening.",
    options: ["draws", "was drawing", "is drawing", "will draw"],
    explanation: "考查动词时态。when 引导的从句用一般过去时，主句表示过去某一时刻正在进行的动作，用过去进行时 was drawing。故选 B。",
  },
  {
    year: 2025, no: 8, topicId: "g-present-simple", answer: "A",
    stem: "Charlie ________ his grandparents every weekend. He loves them very much.",
    options: ["visits", "was visiting", "will visit", "has visited"],
    explanation: "考查动词时态。every weekend 表示习惯性动作，用一般现在时；主语 Charlie 是第三人称单数，动词加 -s。故选 A。",
  },
  {
    year: 2025, no: 9, topicId: "g-past-simple", answer: "C",
    stem: "—Peter, did you play table tennis with your friends after school yesterday?\n—No, I didn't. We ________ vegetables in our school garden.",
    options: ["water", "have watered", "watered", "are going to water"],
    explanation: "考查动词时态。问句用 did 询问昨天的事，答语描述过去发生的动作，用一般过去时 watered。故选 C。",
  },
  {
    year: 2025, no: 10, topicId: "g-present-perfect", answer: "B",
    stem: "Many international students ________ to visit our school since last year.",
    options: ["are coming", "have come", "came", "will come"],
    explanation: "考查动词时态。since last year 表示从去年延续到现在，用现在完成时 have come。故选 B。",
  },
  {
    year: 2025, no: 11, topicId: "g-passive-voice", answer: "C",
    stem: "Language learning apps ________ by more and more people these days.",
    options: ["use", "used", "are used", "were used"],
    explanation: "考查动词时态和语态。主语 Language learning apps 与 use 是被动关系，these days 表明描述当前情况，用一般现在时被动语态 are used。故选 C。",
  },
  {
    year: 2025, no: 12, topicId: "g-object-clause", answer: "A",
    stem: "—Linda, do you know ________ for the school trip this term?\n—Yes. We are going to the Capital Museum.",
    options: ["where we are going", "where we went", "where are we going", "where did we go"],
    explanation: "考查宾语从句。宾语从句用陈述语序，排除 C、D；答语 We are going to the Capital Museum. 表示将来的安排，用 where we are going。故选 A。",
  },

  // ---------------- 2021 ----------------
  // 原卷为扫描件且未附答案页：题干经图像核对，答案按语法唯一确定。
  {
    year: 2021, no: 1, topicId: "g-pronouns", answer: "B",
    stem: "Mary's birthday is coming. We've decided to make a cake for ________.",
    options: ["him", "her", "you", "them"],
    explanation: "考查代词辨析。句意：Mary 的生日要到了，我们决定为她做一个蛋糕。for 是介词，后面用宾格；Mary 是女性，用 her。故选 B。",
  },
  {
    year: 2021, no: 2, topicId: "g-prepositions", answer: "A",
    stem: "Space Day of China falls ________ April 24th every year.",
    options: ["on", "by", "at", "in"],
    explanation: "考查介词辨析。April 24th 是具体某一天，具体某天前用 on。故选 A。",
  },
  {
    year: 2021, no: 3, topicId: "g-questions", answer: "D",
    stem: "—________ shall we meet for the picnic?\n—At the school gate.",
    options: ["How", "When", "Why", "Where"],
    explanation: "考查疑问词辨析。答语 At the school gate. 表示地点，用 Where 提问。故选 D。",
  },
  {
    year: 2021, no: 4, topicId: "g-modal-verbs", answer: "A",
    stem: "—Sam, ________ I join you in the community service?\n—Of course you can.",
    options: ["can", "must", "should", "need"],
    explanation: "考查情态动词。答语 Of course you can. 提示此处是请求许可，用 can。故选 A。",
  },
  {
    year: 2021, no: 5, topicId: "g-conjunctions", answer: "C",
    stem: "The doctors worked for ten hours, ________ nobody took a break.",
    options: ["so", "for", "but", "or"],
    explanation: "考查连词辨析。句意：医生们工作了十个小时，但没有人休息。前后为转折关系，用 but。故选 C。",
  },
  {
    year: 2021, no: 6, topicId: "g-adj-adv", answer: "B",
    stem: "The teacher is glad to see that Tony is ________ than before.",
    options: ["careful", "more careful", "most careful", "the most careful"],
    explanation: "考查形容词比较等级。than before 表明是两者比较，用比较级 more careful。故选 B。",
  },
  {
    year: 2021, no: 7, topicId: "g-present-continuous", answer: "B",
    stem: "—Peter, what are you doing?\n—Oh, I ________ a report about national heroes.",
    options: ["will write", "am writing", "wrote", "have written"],
    explanation: "考查动词时态。问句 What are you doing? 为现在进行时，答语也应用现在进行时 am writing。故选 B。",
  },
  {
    year: 2021, no: 8, topicId: "g-past-simple", answer: "D",
    stem: "My parents and I ________ trees last Sunday.",
    options: ["plant", "will plant", "are planting", "planted"],
    explanation: "考查动词时态。last Sunday 表示过去的时间，用一般过去时 planted。故选 D。",
  },
  {
    year: 2021, no: 9, topicId: "g-present-simple", answer: "A",
    stem: "—Lily, what do you usually do after school?\n—I ________ exercise with my friends.",
    options: ["do", "did", "will do", "was doing"],
    explanation: "考查动词时态。usually 表示习惯性动作，用一般现在时，主语 I 后用动词原形 do。故选 A。",
  },
  {
    year: 2021, no: 10, topicId: "g-present-perfect", answer: "C",
    stem: "Mr. Smith ________ Chinese for two years. He's much better at it now.",
    options: ["learns", "was learning", "has learned", "will learn"],
    explanation: "考查动词时态。for two years 表示从过去持续到现在，用现在完成时 has learned。故选 C。",
  },
  {
    year: 2021, no: 11, topicId: "g-passive-voice", answer: "D",
    stem: "Today, many winter Olympic sports ________ even by children.",
    options: ["enjoyed", "enjoy", "were enjoyed", "are enjoyed"],
    explanation: "考查动词的语态。主语 winter Olympic sports 与 enjoy 是被动关系；Today 表明描述当前情况，用一般现在时被动语态 are enjoyed。故选 D。",
  },
  {
    year: 2021, no: 12, topicId: "g-object-clause", answer: "C",
    stem: "—Could you please tell me ________?\n—Next Thursday morning.",
    options: [
      "when we visited the Capital Museum",
      "when did we visit the Capital Museum",
      "when we will visit the Capital Museum",
      "when will we visit the Capital Museum",
    ],
    explanation: "考查宾语从句。宾语从句用陈述语序，排除 B、D；答语 Next Thursday morning. 表示将来，用一般将来时。故选 C。",
  },

  // 语篇原句改编练习（真题语境）—— 见 adapted.js
  ...adaptedItems,
];

const beijingExercises = raw.map((item) => {
  if (item.origin === "adapted") {
    return {
      id: item.id,
      topicId: item.topicId,
      type: "choice",
      difficulty: item.difficulty || 2,
      stem: item.stem,
      options: item.options,
      answer: item.answer,
      explanation: item.explanation,
      origin: "adapted",
      point: adaptedPoints[item.id] || "",
      sourceLabel: `${item.sourcePaper} · ${item.sourceSection}语篇原句改编`,
      source: {
        type: "adapted",
        paper: item.sourcePaper,
        region: "北京市",
        year: item.sourceYear,
        section: item.sourceSection,
        original: item.sourceOriginal,
        note: item.sourceNote || "题干取自该年试卷语篇原句，就目标语法点挖空改编，不是真题原题。",
      },
    };
  }
  return {
    id: `bj-${item.year}-${item.no}`,
    topicId: item.topicId,
    type: "choice",
    difficulty: 3,
    stem: item.stem,
    options: item.options,
    answer: item.answer,
    explanation: item.explanation,
    origin: "exam",
    point: beijingPoints[`bj-${item.year}-${item.no}`] || "",
    sourceLabel: `${examPaper(item.year)} · 单项填空第 ${item.no} 题`,
    source: {
      type: "exam",
      paper: examPaper(item.year),
      region: "北京市",
      year: item.year,
      section: "一、单项填空",
      no: item.no,
      answerSource: answerSourceByYear[item.year] || "",
      file: `backend/exams/beijing/${item.year}/content.txt`,
    },
  };
});

export const grammarExercises = [...beijingExercises, ...otherRegionExams, ...authoredExercises];

export const examExercises = grammarExercises.filter((e) => e.origin === "exam");
export const otherExamExercises = grammarExercises.filter((e) => e.origin === "exam-other");
export const adaptedExercises = grammarExercises.filter((e) => e.origin === "adapted");
export const authoredOnly = grammarExercises.filter((e) => e.origin === "authored");

export const exercisesByTopic = grammarExercises.reduce((acc, item) => {
  (acc[item.topicId] ||= []).push(item);
  return acc;
}, {});

// 每个专题内排序：北京中考真题 → 外地中考真题 → 语篇原句改编 → 专项练习。
const originOrder = { exam: 0, "exam-other": 1, adapted: 2, authored: 3 };
for (const list of Object.values(exercisesByTopic)) {
  list.sort((a, b) => {
    if (a.origin !== b.origin) return originOrder[a.origin] - originOrder[b.origin];
    if (a.origin === "exam") return a.source.year - b.source.year || a.source.no - b.source.no;
    return a.id.localeCompare(b.id);
  });
}

export const examYears = [...new Set(examExercises.map((e) => e.source.year))].sort();
