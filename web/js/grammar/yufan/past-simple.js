// web/js/grammar/yufan/past-simple.js
// 来源：yufan/动词/动词时态/一般过去时（15 张教材扫描图片）→ 第12章 动词的一般过去时
export default [
  {
    topicId: "g-past-simple",
    newTopic: false,
    title: "一般过去时",
    sourceDirs: ["yufan/动词/动词时态/一般过去时"],
    imagesRead: 15,
    summary:
      "第12章把一般过去时分成 be 动词和行为动词两套：be 动词的过去式是 was/were，行为动词的过去式一般在词尾加 -ed（不规则动词要另记）；否定与疑问由 be 动词或 did 承担，did/didn't 后面一律用动词原形。",
    intro:
      "本章依次讲 be 动词的一般过去时、行为动词的一般过去时、一般过去时的基本用法，并给出不规则动词表、一般现在时与一般过去时的句型对比、used to 的用法与中考失分陷阱。",
    sections: [
      {
        heading: "一、总体认知：一般过去时由“主语 + 动词的过去式”表达",
        blocks: [
          {
            type: "text",
            text: "动词的一般过去时主要表示过去的动作或状态，在句中由“主语 + 动词的过去式”来表达（“动词的过去式”就是叙述过去事情的动词形式）。本章分别讲解 be 动词的过去时和行为动词的过去时，并具体讲解动词一般过去时的一些基本用法。",
          },
          {
            type: "examples",
            items: [
              { en: "He walks to school.", zh: "他（现在经常）步行上学。（walks 是现在式，表示目前习惯性、经常性的动作）" },
              { en: "He walked to school.", zh: "他步行去上学了。（walked 是过去式，叙述过去发生过的事情）" },
            ],
          },
        ],
      },
      {
        heading: "二、be 动词的一般过去时",
        blocks: [
          {
            type: "text",
            text: "be 动词（am/is/are）的一般现在时和一般过去时对照如下。",
          },
          {
            type: "table",
            head: ["主语", "一般现在时", "一般过去时"],
            rows: [
              ["I（第一人称单数）", "am", "was"],
              ["he, she, it（第三人称单数）", "is", "was"],
              ["you（第二人称单、复数）", "are", "were"],
              ["we, they（第一、三人称复数）", "are", "were"],
            ],
          },
          {
            type: "text",
            text: "be 动词过去时的基本句型：肯定句 主语 + be 动词的过去式（was/were）+ ……；否定句 主语 + be 动词的过去式（was/were）+ not + ……；一般疑问句 be 动词的过去式（Was/Were）+ 主语 + ……?；特殊疑问句 疑问词 + 一般疑问句?",
          },
          {
            type: "examples",
            items: [
              { en: "I was busy yesterday.", zh: "我昨天很忙。（肯定句）" },
              { en: "He was not busy yesterday.", zh: "他昨天不忙。（否定句）" },
              { en: "We were not busy yesterday.", zh: "我们昨天不忙。（否定句）" },
              { en: "Was he busy yesterday?", zh: "他昨天忙吗？（一般疑问句）" },
              { en: "Were you busy yesterday?", zh: "你昨天忙吗？（一般疑问句）" },
              { en: "Why was he busy yesterday?", zh: "他昨天为什么忙？（特殊疑问句）" },
              { en: "Why were you busy yesterday?", zh: "你昨天为什么忙？（特殊疑问句）" },
            ],
          },
          {
            type: "text",
            text: "1 be 动词一般过去时的肯定句：主语 + be 动词的过去式（was/were）+ ……",
          },
          {
            type: "examples",
            items: [
              { en: "Mike was in the United States last year.", zh: "迈克去年在美国。" },
              { en: "I was very tired last night.", zh: "我昨天晚上很累。" },
              { en: "Carl was a teacher.", zh: "卡尔以前是个老师。" },
              { en: "Charles was an engineer.", zh: "查尔斯以前是个工程师。" },
              { en: "You were absent from school two days ago.", zh: "两天前你没到校。" },
            ],
          },
          {
            type: "tip",
            text: "There is / are... 句型用于一般过去时，需把 is、are 变为它们的过去式：There was / were...。",
          },
          {
            type: "text",
            text: "2 be 动词一般过去时的否定句：主语 + be 动词的过去式（was/were）+ not + ……。它的结构和一般现在时一样，只要在 be 动词的过去式后面加上 not 就可以了。",
          },
          {
            type: "examples",
            items: [
              { en: "Gary was not in Canada last year.", zh: "加里去年不在加拿大。" },
              { en: "I wasn't busy the other day.", zh: "前几天我不忙。" },
              { en: "Mike wasn't at school.", zh: "迈克不在学校。" },
              { en: "Dogs weren't in the park.", zh: "小狗们没在公园里。" },
              { en: "There weren't any boys in the room.", zh: "房间里一个男孩也没有。" },
              { en: "They weren't Germans.", zh: "他们不是德国人。" },
              { en: "Mr Robert wasn't angry with his son's fault.", zh: "罗伯特先生没有为他儿子的错误生气。" },
            ],
          },
          {
            type: "tip",
            text: "否定式的 was not、were not 大多使用缩写形式 wasn't（读作 [ˈwɒznt]）和 weren't（读作 [wɜːnt]）。",
          },
          {
            type: "text",
            text: "3 be 动词一般过去时的一般疑问句：be 动词的过去式（Was/Were）+ 主语 + ……?。结构和一般现在时一样，只要把 be 动词的过去式调到主语前面即可；回答时用“Yes, ... was/were.”或“No, ... wasn't/weren't.”",
          },
          {
            type: "examples",
            items: [
              { en: "A: Was she a teacher? B: Yes, she was.", zh: "她以前是个老师吗？—— 是的，她是。" },
              { en: "A: Were they doctors? B: Yes, they were.", zh: "他们以前是医生吗？—— 是的，他们是。" },
              { en: "A: Was your father free this morning? B: No, he wasn't.", zh: "今天上午你爸爸有空吗？—— 不，他没空。" },
              { en: "A: Were they present at the meeting? B: Yes, they were.", zh: "他们出席会议了吗？—— 是的，他们出席了。" },
              { en: "A: Was there a grocery store near here? B: Yes, there was.", zh: "以前这附近有杂货店吗？—— 是的，以前有。" },
              { en: "A: Were they in the garden? B: No, they weren't.", zh: "他们那时在花园里吗？—— 不，他们不在。" },
            ],
          },
          {
            type: "text",
            text: "4 be 动词一般过去时的特殊疑问句：疑问词 + 一般疑问句?。只需将疑问词放在句首，后面跟一般疑问句即可；回答特殊疑问句时不用 yes 或 no，而是需要直接回答所问的问题。",
          },
          {
            type: "examples",
            items: [
              { en: "A: Where was Cecilia last year? B: She was in Shanghai.", zh: "去年塞西莉亚在哪儿？—— 她在上海。" },
              { en: "A: Where were you yesterday morning? B: I was at school.", zh: "你昨天上午在哪儿呢？—— 我在学校。" },
              { en: "A: What was there in the suitcase then? B: There was a laptop, a cell phone and a PSP.", zh: "那时旅行箱里有什么？—— 有一台笔记本电脑、一部手机和一个 PSP 游戏机。" },
            ],
          },
          {
            type: "table",
            head: ["句型", "一般现在时", "一般过去时"],
            rows: [
              ["肯定句", "He is...", "He was..."],
              ["否定句", "He isn't...", "He wasn't..."],
              ["一般疑问句", "Is he...?", "Was he...?"],
              ["特殊疑问句", "疑问词 + is he...?", "疑问词 + was he...?"],
            ],
          },
        ],
      },
      {
        heading: "三、行为动词的一般过去时",
        blocks: [
          {
            type: "text",
            text: "be 动词的过去式为 was 和 were，而行为动词的过去式一般是在动词后加 -ed，我们把这类动词称为规则动词。在加 -ed 时，不同的规则动词在形式上还会有不同的变化规律。行为动词一般过去时的基本句型：肯定句 主语 + 动词的过去式 + ……；否定句 主语 + did not + 动词原形 + ……；一般疑问句 Did + 主语 + 动词原形 + ……?；特殊疑问句 疑问词 + 一般疑问句?",
          },
          {
            type: "examples",
            items: [
              { en: "He played tennis last week.", zh: "他上周打网球了。（肯定句）" },
              { en: "He did not play tennis last week.", zh: "上周他没打网球。（否定句）" },
              { en: "Did he play tennis last week?", zh: "上周他打网球了吗？（一般疑问句）" },
              { en: "Where did he play tennis last week?", zh: "上周他在哪儿打网球？（特殊疑问句）" },
            ],
          },
          {
            type: "list",
            items: [
              "last 可与表示时间的名词连用：last night 昨夜、last week 上周、last month 上个月、last year 去年、last Monday 上周一。",
            ],
          },
          {
            type: "text",
            text: "1 行为动词一般过去时的肯定句：主语 + 动词的过去式 + ……。行为动词的一般过去时没有人称和数的变化，主语即使是第三人称单数，谓语动词也和其它人称形式一样。",
          },
          {
            type: "examples",
            items: [
              { en: "He had a good time yesterday.", zh: "昨天他过得很高兴。" },
              { en: "I saw a film last week.", zh: "上周我看了一部电影。" },
              { en: "She studied Korean two years ago.", zh: "两年前她学的韩语。" },
              { en: "We said goodbye to Roger at five.", zh: "5点钟时，我们和罗杰告别。" },
              { en: "Walter found an amusing book.", zh: "沃尔特找到一本有趣的书。" },
              { en: "William rushed into the room.", zh: "威廉冲进了房间。" },
            ],
          },
          {
            type: "text",
            text: "注意不规则动词的时态变化，务必熟记下列动词的原形和过去式。",
          },
          {
            type: "table",
            head: ["原形", "过去式"],
            rows: [
              ["read [riːd]", "read [red]"],
              ["put", "put"],
              ["have", "had"],
              ["do", "did"],
              ["say", "said"],
              ["go", "went"],
              ["see", "saw"],
              ["come", "came"],
              ["know", "knew"],
              ["get", "got"],
              ["take", "took"],
              ["find", "found"],
            ],
          },
          {
            type: "text",
            text: "2 行为动词一般过去时的否定句：主语 + did not + 动词原形 + ……。不论主语是第几人称、是单数还是复数，在主语后面加上 did not（而不是 do not 或 does not）就可以了；did not 常用缩写形式 didn't，读作 [ˈdɪdnt]。",
          },
          {
            type: "examples",
            items: [
              { en: "We did not have a good time yesterday.", zh: "昨天我们玩得不开心。" },
              { en: "Andrew didn't have classes this morning.", zh: "今天上午安德鲁没课。" },
              { en: "I didn't work overtime yesterday.", zh: "我昨天没有加班。" },
              { en: "You didn't do your best to do it.", zh: "你没有尽力去做。" },
              { en: "Brant didn't do his homework.", zh: "布兰特没做作业。" },
            ],
          },
          {
            type: "text",
            text: "3 行为动词一般过去时的一般疑问句：Did + 主语 + 动词原形 + ……?。结构和一般现在时一般疑问句的结构一样，无论主语是第几人称、是单数还是复数，在主语前面加上 Did 即可。",
          },
          {
            type: "examples",
            items: [
              { en: "A: Did he go there? B: Yes, he did. / No, he didn't.", zh: "他去那儿了吗？—— 是的，他去了。／不，他没去。" },
              { en: "A: Did you telephone your uncle yesterday? B: Yes, I did. / No, I didn't.", zh: "你昨天给你叔叔打电话了吗？—— 是的，我打了。／不，我没打。" },
            ],
          },
          {
            type: "tip",
            text: "在过去时的一般疑问句中，因为句首用了 Did，谓语动词要用原形。",
          },
          {
            type: "text",
            text: "4 行为动词一般过去时的特殊疑问句：疑问词 + 一般疑问句?。结构和一般现在时一样，只需将疑问词放在句首，后面跟一般疑问句即可。",
          },
          {
            type: "examples",
            items: [
              { en: "A: How many subjects did you study last term? B: We studied seven subjects.", zh: "上学期你们学习了几门课？—— 我们学习了7门课。" },
              { en: "A: When did you get up this morning? B: At six.", zh: "今天早晨你几点钟起床的？—— 6点钟。" },
              { en: "A: Where did you download these listening materials? B: I downloaded them from the English website of China Daily.", zh: "你从哪儿下载的这些听力资料？—— 我从《中国日报》的英语网站上下载的。" },
            ],
          },
          {
            type: "tip",
            text: "subject 和 lesson 的区别：表示具体的科目、学科，不能用 lesson，而要用 subject；表示教材上的第几课，要用 lesson，如 Lesson 2。",
          },
          {
            type: "table",
            head: ["句型", "一般现在时", "一般过去时"],
            rows: [
              ["肯定句", "I go.... / He goes....", "I went.... / He went...."],
              ["否定句", "I don't go.... / He doesn't go....", "I didn't go.... / He didn't go...."],
              ["一般疑问句", "Do you go...? / Does he go...?", "Did you go...? / Did he go...?"],
              ["特殊疑问句", "疑问词 + do you...? / does he...?", "疑问词 + did you...? / did he...?"],
            ],
          },
        ],
      },
      {
        heading: "四、一般过去时的基本用法",
        blocks: [
          {
            type: "text",
            text: "1 表示在过去某一时间内发生的动作或情况。带有确定的过去时间状语时，以下过去时间状语常用于一般过去时的句子中：yesterday 昨天、last year 去年、once upon a time 很久以前、in the old days 过去的日子里、when I was eight years old 当我8岁时、two weeks ago 两周前、the other day 前几天、just now 刚才。",
          },
          {
            type: "examples",
            items: [
              { en: "I went to school on foot yesterday.", zh: "我昨天是步行去的学校。" },
              { en: "Did you travel to Hong Kong the other day?", zh: "前几天，你们去香港旅游了吗？" },
              { en: "A fire destroyed the whole forest last year.", zh: "去年一场大火毁了整个森林。" },
              { en: "He left just now.", zh: "他刚刚离开。" },
              { en: "Lei Feng was a good soldier.", zh: "雷锋是个好战士。" },
              { en: "Thomas Edison was one of the world's leading inventors.", zh: "托马斯·爱迪生是世界一流的发明家。" },
            ],
          },
          {
            type: "tip",
            text: "在谈到历史人物或已去世的人物的情况时，多用过去时。",
          },
          {
            type: "text",
            text: "有些句子虽然没有表示过去时间的状语，但实际上是指过去发生的动作或存在的状态，也要用一般过去时。",
          },
          {
            type: "examples",
            items: [
              { en: "I thought you were ill.", zh: "我以为你病了呢。（说明在说话之前我以为你病了，但是现在我知道你没有病）" },
              { en: "I thought you wanted to have some cakes.", zh: "我以为你想要吃一些蛋糕。（用过去时作试探性的询问、请求、建议等）" },
            ],
          },
          {
            type: "text",
            text: "2 表示过去一段时间内经常或反复发生的动作。一般过去时还表示过去的习惯或反复发生的动作、过去持续了一段时间的行为或过去曾经存在的状态，常与 always（总是）、never（从不）等连用。",
          },
          {
            type: "examples",
            items: [
              { en: "She always carried an umbrella.", zh: "她过去总是带着一把伞。（只是说明她过去的动作，不表明她现在是否常带着一把伞）" },
              { en: "She always carries an umbrella.", zh: "她老是带着一把伞。（说明这是她的习惯，表明她现在仍然习惯总带着一把伞）" },
              { en: "I never drank alcohol.", zh: "我以前从不喝酒。（不涉及现在，不说明现在是否喝酒）" },
            ],
          },
          {
            type: "text",
            text: "3 表示过去连续发生的动作。当表示过去连续发生的动作时，往往没有表示过去的时间状语，要通过上下文来判定是否用一般过去时。",
          },
          {
            type: "examples",
            items: [
              { en: "The boy opened his eyes for a moment, looked at the captain, and then died.", zh: "那男孩的眼睛张开了一会儿，看看船长，然后就死了。（open、look 和 die 是过去连续发生的三个动作，所以都要用过去时）" },
              { en: "Joe was late. He dressed himself quickly, rushed out of the house and ran to the school.", zh: "乔起晚了。他迅速穿上衣服，冲出家门，向学校跑去。" },
            ],
          },
          {
            type: "text",
            text: "4 用于虚拟语气，可指现在或将来的情况。",
          },
          {
            type: "examples",
            items: [
              { en: "Would you try it again if you had a second chance?", zh: "如果还有一次机会，你想再试一次吗？" },
              { en: "If I were you, I would do it in another way.", zh: "如果我是你，我会用另一种方式做。" },
            ],
          },
          {
            type: "text",
            text: "5 如果强调已经终止的习惯时要用 used to。",
          },
          {
            type: "examples",
            items: [
              { en: "Paul used to drink.", zh: "保罗过去经常喝酒。（意味着他现在不喝酒了，喝酒这个动作终止了）" },
              { en: "I used to take a walk after supper.", zh: "我过去总是在晚饭后散步。（意味着我现在不在晚饭后散步了）" },
              { en: "I used to enjoy gardening, but I don't like it any more.", zh: "以前我很喜欢园艺，但现在一点儿也不喜欢。" },
              { en: "He didn't use to smoke.", zh: "以前他不常抽烟。（否定句）" },
              { en: "A: Did he use to smoke? B: Yes, he did. / No, he didn't.", zh: "以前他常抽烟吗？—— 是的，他常抽。／不，他不常抽。" },
            ],
          },
          {
            type: "tip",
            text: "在英国英语（尤其书面语）中，used to 的否定式常用 Used not to，疑问式常用 Used + 主语 + to + ……?：He used not to smoke. / Used he to smoke?（used not = usedn't，读作 [ˈjuːsnt]）",
          },
          {
            type: "table",
            head: ["对比项", "used to", "would"],
            rows: [
              ["含义", "表示过去常做而现在已终止（不做）的动作，强调与现在的关系", "只说明过去的动作习惯，和现在没关系，这个动作现在也许终止，也许还在继续"],
              ["例句", "He used to drink a lot.（他过去总是喝很多酒。）", "He would take a walk after supper.（他过去总是在晚饭后散步。）"],
              ["时间状语", "不必带时间状语", "表示在过去某一段时间内的某种习惯做法，所以要带时间状语：He would drink a lot when he was young."],
            ],
          },
        ],
      },
      {
        heading: "五、正误辨析：一般过去时改为一般疑问句",
        blocks: [
          {
            type: "text",
            text: "把一般过去时的肯定句 Li Ming studied English this morning. 变为一般疑问句，只有第一种写法正确。",
          },
          {
            type: "examples",
            items: [
              { en: "Did Li Ming study English this morning?（○）", zh: "李明今天早晨学英语了吗？—— 正确写法。" },
              { en: "Did Li Ming studied English this morning?（×）", zh: "行为动词应该用原形。" },
              { en: "Does Li Ming study English this morning?（×）", zh: "时态应该用原句子的时态（过去时）。" },
              { en: "Was Li Ming studied English this morning?（×）", zh: "助动词应该用 did，而行为动词应该用原形。" },
            ],
          },
        ],
      },
      {
        heading: "六、失分陷阱（中考例题）",
        blocks: [
          {
            type: "text",
            text: "本章“失分陷阱”共 4 道中考例题，分别考查一般过去时的疑问句结构、否定句、肯定句与 when 状语从句的时态对应。",
          },
          {
            type: "examples",
            items: [
              {
                en: "A: When did Jessy get to New York? B: Yesterday.",
                zh: "【武汉中考】根据答语 yesterday 判断应用一般过去时提问；一般过去时的疑问句在主语前面加上 did 即可，且谓语动词要用原形。答案 B（did; get）。",
              },
              {
                en: "Edward, you play so well. But I didn't know you played the piano.",
                zh: "【海南中考】考查一般过去时的否定句“主语 + did not + 动词原形 + ……”：“不知道你弹钢琴”是过去的事，现在已经知道了，用一般过去时。答案 A（didn't know）。",
              },
              {
                en: "It was great! I met many old friends at the party.",
                zh: "【泸州中考】根据题干中出现的 was 可判断应用一般过去时；一般过去时肯定句为“主语 + 动词的过去式 + ……”，meet 的过去式是 met。答案 B（met）。",
              },
              {
                en: "The bus stopped suddenly when a group of students ran onto the road.",
                zh: "【广州中考】注意到题干中的关键词 ran（run 的过去式）即可判断主句用一般过去时。答案 B（stopped）。",
              },
            ],
          },
        ],
      },
      {
        heading: "七、实力测验（第232—235页）考点速览",
        blocks: [
          {
            type: "text",
            text: "本章“实力测验”共 6 种题型：1 用括号中适当的词填空；2 用括号中动词的适当形式填空；3 用适当的词完成下列句子；4 选择填空；5 按要求变换句型（共 20 题）；6 根据中文提示完成下列句子。",
          },
          {
            type: "list",
            items: [
              "第 1 题集中考 be 动词的过去式选择：I ___ (am, is, was, were) busy last week.、There ___ (is, was, are, were) a lot of people in this village ten years ago.。",
              "动词适当形式填空考一般过去时与 when/as soon as 从句配合：When I ___ (knock) at his door, he was cooking.、As soon as he arrived in the country, he ___ (phone) me.。",
              "选择填空考一般现在时与一般过去时对比：He usually goes to school by bus, but yesterday he ___ a taxi.（took）。",
              "used to 的考查：I ___ like pork, but now I like beef.（used to）；There ___ a hotel at the foot of the hill.（used to be）。",
              "反意疑问句：You had your birthday party the other day, ___ you?（didn't）；There were only a few vegetables left, ___ there?（were）。",
              "句型变换重点：否定句、一般疑问句、对画线部分提问（如 My parents travelled round by train.、There are three pieces of paper on the desk.），以及 There used to be a bridge over this river. 的否定句。",
              "汉译英考查一般过去时叙述周末经历与时间状语位置（如“萨拉喜欢看书。昨晚她看了一本地理方面的书。”）。",
            ],
          },
        ],
      },
    ],
    extras: {
      forms: [
        {
          name: "be 动词的过去式",
          pattern: "was / were + ……",
          note: "I/he/she/it 用 was；you/we/they 用 were。",
        },
        {
          name: "used to 结构",
          pattern: "used to do / didn't use to do / Did ... use to do?",
          note: "强调过去有过、现在已终止的习惯。",
        },
      ],
      points: [
        {
          title: "行为动词一般过去时没有人称和数的变化",
          desc: "主语即使是第三人称单数，谓语动词也用过去式，不加 -s。",
          good: ["He had a good time yesterday.", "She studied Korean two years ago."],
          bad: ["She studieds Korean two years ago."],
        },
        {
          title: "used to 强调已经终止的习惯",
          desc: "used to do 表示过去常做而现在已不做的动作，强调与现在的关系。",
          good: ["Paul used to drink.", "I used to take a walk after supper."],
          bad: ["Did he used to smoke?"],
        },
        {
          title: "过去连续发生的动作用一般过去时",
          desc: "往往没有时间状语，要通过上下文判定。",
          good: [
            "The boy opened his eyes for a moment, looked at the captain, and then died.",
            "Joe was late. He dressed himself quickly, rushed out of the house and ran to the school.",
          ],
          bad: [],
        },
        {
          title: "过去时可用于虚拟语气和试探性语气",
          desc: "虚拟语气可指现在或将来的情况；I thought... 可作试探性的询问、请求、建议。",
          good: ["If I were you, I would do it in another way.", "I thought you wanted to have some cakes."],
          bad: [],
        },
      ],
      contrasts: [
        {
          title: "used to vs would",
          head: ["对比项", "used to", "would"],
          rows: [
            ["含义", "过去常做而现在已终止的动作，强调与现在的关系", "只说明过去的动作习惯，和现在没关系"],
            ["时间状语", "不必带时间状语", "要带时间状语，如 He would drink a lot when he was young."],
          ],
        },
      ],
      pitfalls: [
        "did / didn't 后面的动词必须用原形：× Did Li Ming studied English this morning?",
        "be 动词的句子改为疑问句时不借助 did：× Was Li Ming studied English this morning?",
        "时态要与原句一致：把 He had lunch at school every day last year. 改为否定句应为 He didn't have lunch...，不能改用 doesn't。",
        "used to 的否定式为 didn't use to（或书面语 used not to），不能说 didn't used to。",
        "一般过去时只说明动作发生过，不强调对现在的影响；与现在完成时的区别在于是否与现在有关。",
      ],
      examTips: [
        "看到 yesterday、last…、… ago、just now、the other day 等过去时间状语，直接考虑一般过去时。",
        "题干中已有 was、ran 等过去式时，空格处通常也要求过去式（It was great! I met many old friends at the party.）。",
        "有确定过去时间时不用现在完成时：I ___ you played the piano.（选 didn't know）。",
      ],
      memoryCard: [
        "be 动词过去式：I/he/she/it 用 was，you/we/they 用 were。",
        "did / didn't 后面跟动词原形。",
        "used to do = 过去常做，现在不做了。",
      ],
    },
    notes: [
      "微信图片_20260927143541_450_66.jpg、微信图片_20260927143554_451_66.jpg 右侧的竖排“注意！失分陷阱！”装饰栏与部分题号被裁切，正文题干可读，已按可识别内容转写。",
      "微信图片_20260927143601_452_66.jpg 至 微信图片_20260927143616_454_66.jpg 为练习页，答案栏为空白（部分选项栏边角被裁切），未编造答案。",
    ],
  },
];
