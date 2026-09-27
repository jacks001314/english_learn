// web/js/grammar/yufan/future-tense.js —— 由 yufan 教材扫描图片整理的语法讲义数据
// 来源目录：yufan/动词/动词时态/将来时（教材第 14 章，P253—P267，共 15 张）
// 契约见同目录 README.md。自检：node --check web/js/grammar/yufan/future-tense.js

export default [
  {
    topicId: "g-future-tense",
    newTopic: true,
    title: "动词的将来时",
    category: "动词",
    difficulty: 3,
    sourceDirs: ["yufan/动词/动词时态/将来时"],
    imagesRead: 15,
    summary:
      "将来时用 will / shall + 动词原形表示将来要发生的动作或状态；be going to 强调打算、计划；过去将来时用 would / should + 动词原形，多用于宾语从句和间接引语。",
    intro:
      "本章（教材第 14 章，P253—P267）先讲一般将来时的构成与基本用法，再讲过去将来时，最后汇总其他表示将来的结构（be going to / be to do / be about to do、一般现在时与进行时表将来），并附易错陷阱与实力测验。",
    forms: [
      { name: "一般将来时·肯定", pattern: "主语 + will / shall + 动词原形 + ……", note: "I will call you this evening." },
      { name: "一般将来时·否定", pattern: "主语 + will / shall + not + 动词原形 + ……", note: "will not 常缩写为 won't。" },
      { name: "一般将来时·疑问", pattern: "Will / Shall + 主语 + 动词原形 + ……?", note: "Will there be less pollution?" },
      { name: "过去将来时", pattern: "主语 + would / should + 动词原形 + ……", note: "把 will / shall 变为过去式即可，多用于宾语从句和间接引语。" },
      { name: "be going to 结构", pattern: "主语 + be going to + 动词原形 + ……", note: "表示打算、计划或决定要做的事，也用于有迹象的预测。" },
      { name: "be to do / be about to do", pattern: "be to do sth. / be about to do sth.", note: "表示安排、计划；be about to 表示马上、很快就要发生。" },
    ],
    points: [
      {
        title: "一般将来时的基本用法",
        desc: "表示将来某个时间要发生的动作或存在的状态，常与 tomorrow、next year、soon 等时间状语连用；也可用在主从复合句的主句中。",
        good: [
          "My mother will spend her holiday in Shanghai in August.",
          "We'll have a picnic if it doesn't rain tomorrow.",
          "I'll send a message to you as soon as I get there.",
        ],
        bad: ["We'll have a picnic if it doesn't rain tomorrow.（从句不能用 will rain）"],
      },
      {
        title: "主将从现",
        desc: "在时间状语从句和条件状语从句中，主句用一般将来时，从句要用一般现在时（有时用现在完成时）表示将来。",
        good: ["I'll write a composition about the play after I have seen it.", "We'll help him if he asks us."],
        bad: ["If you will go there, I will go with you."],
      },
      {
        title: "be going to 与 will / shall 的区别",
        desc: "be going to 表示主观上事先打算、计划或意图；will / shall 表示未经事先考虑的意图。不清楚是否事先考虑时，两者都可以用。",
        good: ["There is somebody at the door. I'll go and open it.", "He is going to change his job."],
        bad: ["There is somebody at the door. I am going to open it.（未经事先考虑，宜用 I'll）"],
      },
      {
        title: "过去将来时用于宾语从句和间接引语",
        desc: "过去将来时表示从过去的某一时间来看将来要发生的动作或状态，也可表示过去习惯性的动作或状态（此时所有人称一律用 would）。",
        good: [
          "He said he would work for that boss the next year.",
          "Whenever he had time, he would do some reading.",
          "I would play with him when I was a child.",
        ],
        bad: [],
      },
    ],
    pitfalls: [
      "条件状语从句和时间状语从句中不能用将来时，要改用一般现在时（主将从现）。",
      "对一般疑问句的肯定回答要用 Yes, I will.，不能用缩略式 I'll，因为 shall / will 在句末时不能用缩略式。",
      "There is going to be... 与 There will be... 都表示将来，不能写成 There will have...。",
      "if 既可引导宾语从句（可用一般将来时），又可引导条件状语从句（用一般现在时），两种时态不同。",
      "按时刻表发生的动作（火车发车、飞机起飞等）用一般现在时表将来；go、come、leave、start 等可用现在进行时表将来。",
    ],
    examTips: [
      "看到 tomorrow、next week、in the future、soon 等时间状语，优先考虑一般将来时。",
      "答语中出现 right now、now 等提示“临时决定”的词，用 will 而不用 be going to。",
      "看到 if 从句，先判断是宾语从句还是条件状语从句：条件句用一般现在时，主句用一般将来时。",
      "There be 句型的将来时用 There will be / There is going to be，注意不能出现 have。",
    ],
    memoryCard: [
      "一般将来时 = will / shall + 动词原形；过去将来时 = would / should + 动词原形。",
      "主将从现：主句将来时，从句现在时。",
      "事先打算用 be going to，临时决定用 will。",
    ],
    sections: [
      {
        heading: "一、概述：动词的将来时",
        blocks: [
          {
            type: "text",
            text:
              "动词的将来时包括一般将来时和过去将来时。一般将来时表示将来某个时间要发生的动作或存在的状态，也表示将来经常或重复发生的动作，常与表示将来的时间状语连用，如 tomorrow、next year、soon 等。过去将来时表示对过去某一时间而言将要发生的动作或存在的状态。",
          },
          {
            type: "examples",
            items: [
              { en: "I'm going to study tomorrow.", zh: "我打算明天学习。" },
              { en: "I will / shall study tomorrow.", zh: "我明天将要学习。" },
              { en: "I didn't know they were going to live abroad.", zh: "我不知道他们打算在国外生活。" },
              { en: "I didn't know they would live abroad.", zh: "我不知道他们将在国外生活。" },
            ],
          },
        ],
      },
      {
        heading: "二、一般将来时的构成",
        blocks: [
          {
            type: "text",
            text:
              "一般将来时由「助动词 will / shall + 动词原形」构成。will / shall 本身没有人称和数的变化。在书面语中，主语是第一人称（I 或 we）时，常用助动词 shall；在口语中，所有的人称都可以用 will。",
          },
          {
            type: "list",
            items: [
              "肯定句：主语 + will / shall + 动词原形 + ……",
              "否定句：主语 + will / shall + not + 动词原形 + ……",
              "一般疑问句：Will / Shall + 主语 + 动词原形 + ……?",
              "特殊疑问句：疑问词 + will / shall + 主语 + 动词原形 + ……?",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "I will / shall arrive in New York tomorrow morning.", zh: "我明天早上到达纽约。" },
              { en: "We will come to see you next week.", zh: "下周我们会来看你。" },
              { en: "I think it'll be hotter in Beijing next summer.", zh: "我想明年夏天北京会更热。" },
              { en: "There will be a computer on every student's desk in the future.", zh: "将来，每位同学的桌子上都会有一台电脑。" },
              { en: "She will not listen to me.", zh: "她不会听我的话的。" },
              { en: "The teachers won't write on the blackboard with chalk any more.", zh: "老师们将不再用粉笔在黑板上写字。" },
              { en: "The car won't start.", zh: "这辆车发动不起来。" },
              { en: "Oil and water won't mix.", zh: "油和水不能混合在一起。" },
            ],
          },
          {
            type: "examples",
            items: [
              { en: "A: Will there be less pollution? B: Yes, there will. / No, there will not.", zh: "将来污染会更少吗？——是的，会更少。/ 不，不会更少。" },
              { en: "A: Shall we have any class tomorrow? B: Yes, we will / shall.", zh: "明天我们有课吗？——是的，我们明天有课。" },
              { en: "A: Shall I go home now? B: Yes, you will. / No, you won't.", zh: "我现在可以回家了吗？——是的，可以回家了。/ 不，你不可以回家。" },
              { en: "A: Will you please open the window? B: Yes, I will. / Of course. / Sure.", zh: "劳驾，您打开窗户好吗？——好的。/ 当然了。" },
              { en: "A: When will Mike arrive here tomorrow? B: He will arrive here at three o'clock.", zh: "迈克明天什么时候到这儿？——他明天三点钟到这儿。" },
              { en: "A: How many books will they give us? B: They will give us thirty books.", zh: "他们会给我们多少本书呢？——他们会给我们 30 本书。" },
            ],
          },
          {
            type: "table",
            head: ["完整形式", "缩写形式"],
            rows: [
              ["I will", "I'll"],
              ["you will", "you'll"],
              ["he will", "he'll"],
              ["she will", "she'll"],
              ["it will", "it'll"],
              ["we will", "we'll"],
              ["they will", "they'll"],
            ],
          },
          {
            type: "tip",
            text:
              "「Shall I / we...?」常用来询问、征求对方意见，或表示客气的邀请；「Will you...?」常用于客气的邀请或命令。这两种情况的回答比较灵活。",
          },
          {
            type: "pitfall",
            text: "对一般疑问句的肯定回答要用 Yes, I will.，不能用 I'll——shall 和 will 在句末时不能用缩略式。",
          },
          {
            type: "table",
            head: ["时间状语", "含义"],
            rows: [
              ["soon", "很快"],
              ["tomorrow", "明天"],
              ["the day after tomorrow", "后天"],
              ["this afternoon", "今天下午"],
              ["this evening", "今天晚上"],
              ["this year", "今年"],
              ["before long", "不久，很快"],
              ["in the (near) future", "在（不久的）将来"],
              ["in two weeks / days", "两周 / 天以后"],
              ["some day", "将来的某一天"],
              ["next week / month / year / summer", "下一周 / 下个月 / 明年 / 明年夏天"],
            ],
          },
        ],
      },
      {
        heading: "三、一般将来时的基本用法",
        blocks: [
          {
            type: "list",
            items: [
              "1 表示将来的动作或状态。",
              "2 用在一些主从复合句中：主句用一般将来时表示将来的动作或状态。",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "My mother will spend her holiday in Shanghai in August.", zh: "8 月份我妈妈将去上海度假。" },
              { en: "In the future, there'll be a new school.", zh: "将来这儿要建一所新学校。" },
              { en: "We'll have a picnic if it doesn't rain tomorrow.", zh: "明天如果不下雨我们就去野餐。" },
              { en: "Mike will pass the exam if he studies harder.", zh: "如果迈克再努力些，他就会及格的。" },
              { en: "I'll send a message to you as soon as / when I get there.", zh: "我一到那儿就会给你发信息。" },
              { en: "We'll help him if he asks us.", zh: "如果他请求我们的话，我们愿意帮他。" },
            ],
          },
          {
            type: "tip",
            text:
              "在复合句中，尤其要注意在时间状语从句和条件状语从句中的时态搭配：主句用一般将来时表示将来的动作和状态，从句则要用一般现在时，有时也用现在完成时表示。",
          },
          {
            type: "examples",
            items: [
              { en: "I'll write a composition about the play after / when / as soon as I have seen it.", zh: "看完了这个剧本后，我将写一篇关于它的文章。" },
            ],
          },
        ],
      },
      {
        heading: "四、过去将来时",
        blocks: [
          {
            type: "text",
            text:
              "过去将来时由「助动词 would / should + 动词原形」构成，表示从过去的某一时间来看将来要发生的动作或存在的状态，常用于宾语从句和间接引语中。其构成和一般将来时一样，只要把助动词 will、shall 变为过去式即可。",
          },
          {
            type: "list",
            items: [
              "肯定句：主语 + would / should + 动词原形 + ……",
              "否定句：主语 + would / should + not + 动词原形 + ……",
              "疑问句：Would / Should + 主语 + 动词原形 + ……?；疑问词 + would / should + 主语 + 动词原形 + ……?",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "She was sixty-six. After three years she would be sixty-nine.", zh: "她 66 岁了。3 年后，她将 69 岁。" },
              { en: "He asked me if I would go abroad.", zh: "他问我是否会出国。" },
              { en: "I didn't know if he would come. = I didn't know whether he would come.", zh: "我不知道他是否会来。" },
              { en: "She told us that she would not go with us if it rained.", zh: "她告诉我们，如果下雨，她就不和我们一起去了。" },
              { en: "There were some signs that Betty would not go to that party.", zh: "有些迹象表明贝蒂不会去参加那个聚会。" },
              { en: "Would I dine with him? I thought about it before.", zh: "是否跟他一起吃饭呢？我之前考虑过这个问题。" },
              { en: "I didn't know how to do it. What would be their ideas?", zh: "我不知如何去做。他们会有什么想法呢？" },
            ],
          },
          {
            type: "list",
            items: [
              "1 表示过去习惯性的动作或状态。",
              "2 用于间接引语及宾语从句中。",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "Whenever he had time, he would do some reading.", zh: "他一有时间，就会看书。" },
              { en: "This door wouldn't open.", zh: "这扇门老是打不开。" },
              { en: "I would play with him when I was a child.", zh: "当我还是孩童时，总是和他一起玩。" },
              { en: "He said he would work for that boss the next year.", zh: "他说下一年他打算为那个老板工作。" },
              { en: "I thought he would accept the invitation. But he refused it.", zh: "我原以为他会接受邀请，但他拒绝了。" },
              { en: "He didn't expect that we should / would all be there.", zh: "他没想到我们都在那里。" },
            ],
          },
          {
            type: "tip",
            text: "当表示过去习惯性的动作或状态时，不管什么人称一律用 would。",
          },
        ],
      },
      {
        heading: "五、其他表示将来的结构",
        blocks: [
          {
            type: "text",
            text:
              "除了 will / shall + 动词原形，教材还汇总了五种表示将来的结构：be going to + 动词原形、be to (do)、be about to (do)、一般现在时 / 一般过去时表将来、现在进行时 / 过去进行时表将来。",
          },
          {
            type: "list",
            items: [
              "1 be going to + 动词原形 + ……：表示将要发生的事情，或打算、计划、决定要做的事情。",
              "肯定句：主语 + be going to + 动词原形 + ……；否定句：主语 + be not going to + 动词原形 + ……",
              "一般疑问句：Be + 主语 + going to + 动词原形 + ……?；特殊疑问句：疑问词 + be + 主语 + going to + 动词原形 + ……?",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "He is going to travel around the world.", zh: "他计划周游世界。" },
              { en: "They're going to have a picnic this weekend.", zh: "他们这个周末要去野餐。" },
              { en: "He said he was going to teach in Beijing next year.", zh: "他说明年他将在北京任教。" },
              { en: "I'm not going to be a teacher.", zh: "我不打算当老师。" },
              { en: "It's not going to rain this afternoon.", zh: "今天下午没有雨。" },
              { en: "A: Are you going to be a doctor when you grow up? B: Yes, I am. / No, I'm not.", zh: "你长大后打算当一名医生吗？——是的，我想。/ 不，我不想。" },
              { en: "A: Where is she going to have her birthday party?", zh: "她打算在哪儿举办生日聚会？" },
              { en: "A: What are you going to do next Sunday? B: I'm going to go fishing.", zh: "下个星期天你打算做什么？——我打算去钓鱼。" },
              { en: "A: When is she going to buy a new house? B: She is going to buy a new house in September.", zh: "她准备什么时候买新房子？——她计划 9 月份买新房。" },
            ],
          },
          {
            type: "tip",
            text:
              "比较 who 问句和 when 问句的区别：who 问句用疑问词 who 对主语进行提问，所以 who 就是这个句子的主语，后面不可能再出现主语；when 问句是用疑问词 when 对时间状语提问，所以 when 后面的句子中一定有主语。",
          },
          {
            type: "examples",
            items: [
              { en: "There is somebody at the door. I'll go and open it.", zh: "门口有人，我去开门。（未经事先考虑的意图，用 I'll）" },
              { en: "Mike: I'm sorry. I forgot to mail the letter for you. Tom: Never mind. I'll mail it tomorrow.", zh: "迈克：真对不起，我忘了替你寄信了。汤姆：没关系。明天我去寄。" },
              { en: "He is going to change his job.", zh: "他打算换工作。（事先考虑好的，用 be going to）" },
            ],
          },
          {
            type: "list",
            items: [
              "2 be to (do) 表示将来：表示安排、计划在近期将发生的事情，或过去曾经计划要做的事。如 There is to be an exhibition next month here.（这儿下个月将有个展览。）/ She is to be here at 10 a.m. tomorrow.（她将于明天上午 10 点抵达这里。）",
              "3 be about to (do) 表示将来：表示事情或动作马上、很快就要发生，一般不用时间状语，但有时也可与 when 连用。如 The bell is about to ring.（马上就要响铃了。）/ Their daughter is about to get married.（他们的女儿很快就要结婚了。）/ We were about to go to a movie when Monica appeared.",
              "4 一般现在时 / 一般过去时表示将来：按时刻表将要发生的动作或事件往往用一般现在时代替一般将来时，如火车发车、到站或飞机起飞、降落等；条件状语从句和时间状语从句中须用一般过去时代替过去将来时。如 The plane takes off at one o'clock this afternoon.（飞机下午 1 点起飞。）/ I didn't know when Jerry would come, but when he came I would let you know.",
              "5 现在进行时 / 过去进行时表示将来：有些词，如 go（去）、come（来）、leave（离开）、start（开始），用现在进行时或者过去进行时表示将来。如 When is she coming?（她什么时候来呀？）/ I'm leaving tomorrow.（明天我要走了。）/ She told me she was coming to see me.",
            ],
          },
        ],
      },
      {
        heading: "六、易错点（Common Mistakes）与实力测验",
        blocks: [
          {
            type: "pitfall",
            text:
              "陷阱例题 1：A: You've left the light on, Tracy. B: Oh, yes. ______ to turn it off right now.（A. I'd go B. I've gone C. I'll go D. I go）——本题根据情景判断时态，答语中 right now 提示用一般将来时，答案为 C（I'll go）。",
          },
          {
            type: "pitfall",
            text:
              "陷阱例题 2：A: I wonder if it ______ tomorrow. B: Don't worry, if it ______, we'll stay at home.（A. rains; rains B. will rain; rains C. rains; will rain D. will rain; will rain）——第一个句子中 if 引导宾语从句，用一般将来时；第二个句子中 if 引导条件状语从句，用一般现在时表示将来，答案为 B。",
          },
          {
            type: "pitfall",
            text:
              "陷阱例题 3：There ______ a football game between Italy and Germany tomorrow morning.（A. has B. is going to be C. will have D. has been）——There is going to be... 与 There will be... 都表示将来，易受 There will be... 影响而误选 C（will have），答案为 B。",
          },
          {
            type: "pitfall",
            text:
              "陷阱例题 4：Jane says that she ______ to Beijing next week.（A. has gone B. will go C. goes D. go）——题干中的时间状语 next week 提示一般将来时，答案为 B。",
          },
          {
            type: "list",
            items: [
              "实力测验（P264—P267）题型：1 用括号中动词的适当形式填空（10 题）；2 选择填空；3 汉译英；4 英译汉；5 改错（每句只有一处错误）。",
              "改错重点：I think I am going to have a cup of coffee（临时决定宜用 I'll have）；Are we going for a walk?；If it will be a fine day tomorrow...（条件从句不能用 will）；Shall they swim...?；I think I have something to drink（应为 I'll have）。",
            ],
          },
        ],
      },
    ],
  },
];
