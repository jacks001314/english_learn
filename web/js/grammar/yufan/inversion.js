// web/js/grammar/yufan/inversion.js
// 来源：yufan/倒装句（教材第 24 章扫描 7 张，微信图片_20260927175417_644_66.jpg ~ 微信图片_20260927175455_650_66.jpg）
// 由 yufan 图片讲义整理，供 GrammarView 「语法专题」页面渲染。
// 新专题（topics.js 中原无 g-inversion），按契约 §2 提供 category / difficulty / forms / points / pitfalls / examTips / memoryCard。
// 自检：node --check web/js/grammar/yufan/inversion.js

export default [
  {
    topicId: "g-inversion",
    newTopic: true,
    title: "倒装句",
    category: "句法",
    difficulty: 4,
    sourceDirs: ["yufan/倒装句"],
    imagesRead: 7,
    summary: "倒装是把谓语的全部或一部分提到主语之前：全部提前叫完全倒装，只把助动词、系动词或情态动词提前叫部分倒装；多为语法结构需要或为了强调。",
    intro: "按教材第 24 章顺序整理：倒装概述 → 倒装的应用（完全倒装 / 部分倒装 / 让步状语从句 / 虚拟语气 / 感叹句 / so...that / 直接引语 / there be / 修辞倒装）→ 章末常见失分陷阱。",
    notes: "第 7 张（微信图片_20260927175455_650_66.jpg）为章末「实力测验」选择填空 10 题，原书未附答案，未录入正文。",
    sections: [
      {
        heading: "1 倒装概述",
        blocks: [
          {
            type: "text",
            text: "英语句子的最基本结构是主谓结构，倒装就是将谓语的全部或一部分提到主语的前面。倒装是一种语法手段，采用倒装语序，或是语法结构的需要，或是为了强调。",
          },
          {
            type: "text",
            text: "英语句子的基本语序是「主语 + 谓语」。如果将谓语的全部或一部分放在主语之前，这种语序叫倒装语序。倒装主要有两种：完全倒装和部分倒装。完全倒装是指将句子的全部谓语置于主语之前；若句子中只有谓语的一部分（通常是助动词或情态动词）位于主语之前，则称之为部分倒装。",
          },
          {
            type: "examples",
            items: [
              { en: "Here comes the bus.", zh: "公共汽车来了。（完全倒装）" },
              { en: "Never have I been there before.", zh: "我从没到过那里。（部分倒装）" },
            ],
          },
          {
            type: "table",
            head: ["类型", "特点", "例句"],
            rows: [
              ["完全倒装", "全部谓语置于主语之前", "Here comes the bus. / Away went the boy."],
              ["部分倒装", "只把助动词、系动词或情态动词提到主语之前", "Never have I been there before. / Seldom does he go out."],
            ],
          },
        ],
      },
      {
        heading: "2 完全倒装",
        blocks: [
          {
            type: "text",
            text: "一般以 here、there、now、then、up、down、out、in、away 等开头的句子，要完全倒装。谓语动词通常是 be、go、come、seem、follow 等。",
          },
          {
            type: "examples",
            items: [
              { en: "There goes the bell. = The bell goes.", zh: "铃响了。" },
              { en: "Up went the rocket into the sky.", zh: "火箭飕地一下子升上了天。" },
              { en: "Away went the boy.", zh: "那个男孩走开了。" },
            ],
          },
          {
            type: "pitfall",
            text: "若主语是人称代词，则不倒装。Here it is.（给你。）/ Away he went.（他走了。）",
          },
          {
            type: "text",
            text: "介词短语作地点状语放在句首时，要用倒装语序。",
          },
          {
            type: "examples",
            items: [
              { en: "By his side stood a little boy.", zh: "他身旁站着一个小男孩。" },
              { en: "In the middle of the lake lies a small island.", zh: "湖的中央有一个小岛。" },
              { en: "Behind the hill is a new expressway.", zh: "小山的后面是一条新的高速公路。" },
              { en: "Out of the window came the sound of music.", zh: "从窗外传来了音乐声。" },
            ],
          },
          {
            type: "pitfall",
            text: "当主语是代词时，即便介词短语作地点状语放在句首，也不用倒装：At the foot of the mountain it stands.（它坐落在山脚下。）",
          },
          {
            type: "text",
            text: "there be 结构中的倒装：there 是引导词，动词 be 后才是真正的主语。",
          },
          {
            type: "examples",
            items: [
              { en: "There are many people over there.", zh: "那边有很多人。" },
              { en: "There used to be a church near our school.", zh: "我们学校附近曾经有一个教堂。" },
              { en: "There are two old women waiting for you at the gate.", zh: "有两个老妇人在门口等你。" },
            ],
          },
        ],
      },
      {
        heading: "3 部分倒装",
        blocks: [
          {
            type: "text",
            text: "以 never、seldom、hardly、not、neither、nor、little 等否定词开头的句子，要部分倒装。通常只把助动词、系动词、情态动词提到主语之前。",
          },
          {
            type: "examples",
            items: [
              { en: "Never shall I forget it.", zh: "我永远忘不了这件事。" },
              { en: "Seldom does he go out.", zh: "他不常出门。" },
              { en: "Hardly had the thief seen the policeman when he ran away.", zh: "这个小偷一看到警察就逃跑了。" },
              { en: "Not a single mistake did he make.", zh: "他没有出一个错误。" },
              { en: "Not only did we lose all our money, but we also came close to losing our lives.", zh: "我们不但把钱全丢了，还几乎丧了命。" },
              { en: "Nor am I aware that anyone else knows the secret.", zh: "我也不知道别人谁能知道这个秘密。" },
              { en: "Little did I think John will lose the game.", zh: "我一点儿也没有想到约翰会输掉比赛。" },
              { en: "No sooner was he back at home than he realised his mistake.", zh: "他一回到家就意识到他弄错了。" },
            ],
          },
          {
            type: "tip",
            text: "little 置于 know、think、imagine、guess、dream、expect 等有关思考意义的动词前面时，little = not at all，译为「一点儿也不」。",
          },
          {
            type: "text",
            text: "把 so、neither、nor 放在句首，表示前面肯定或否定的内容也适合于后面的人或物时，要用倒装语序。",
          },
          {
            type: "examples",
            items: [
              { en: "You can go surfing, so can I.", zh: "你能冲浪，我也能。" },
              { en: "I have never been abroad, neither has he.", zh: "我没出过国，他也是。" },
              { en: "I didn't go to the cinema last night, nor did he.", zh: "昨晚我没去看电影，他也没去。" },
            ],
          },
          {
            type: "text",
            text: "以 only 修饰的副词、介词短语或状语从句放在句首时，要用倒装语序。",
          },
          {
            type: "examples",
            items: [
              { en: "Only in my house do they feel at home.", zh: "只有在我家里，他们才感觉随意。" },
              { en: "Only then did I realise that I was wrong.", zh: "只有到那时，我才意识到我错了。" },
              { en: "Only in this way can you work out the problem.", zh: "只有用这种方式，你才可以解决这个问题。" },
              { en: "Only when he came home did she learn the news.", zh: "直到他回家后，她才知道这个消息。" },
            ],
          },
          {
            type: "pitfall",
            text: "如果 only 修饰主语，虽放在句首，也不用倒装：Only Amanda and John received my presents.（只有阿曼达和约翰收到了我的礼物。）",
          },
          {
            type: "text",
            text: "方式副词（well）或频度副词（often、always、many a time）放在句首时，要用倒装语序。",
          },
          {
            type: "examples",
            items: [
              { en: "Well do I remember the day.", zh: "那个日子我记忆犹新。" },
              { en: "Often did he remind me not to do it.", zh: "他时常提醒我不要那样做。" },
              { en: "Many a time has he given me good advice.", zh: "他多次给我忠告。" },
            ],
          },
          {
            type: "tip",
            text: "此类倒装属于修辞性倒装，用于表示特别强调的语气。",
          },
        ],
      },
      {
        heading: "4 让步状语从句、虚拟语气与感叹句中的倒装",
        blocks: [
          {
            type: "text",
            text: "让步状语从句可以把表语提前，用 as 代替 although，构成倒装。句型：表语 + as + 主语 + 系动词。",
          },
          {
            type: "examples",
            items: [
              { en: "Old as he is, he works hard. = Although he is old, he works hard.", zh: "尽管他老了，但他依然很努力地工作。" },
              { en: "Child as he is, he knows a lot. = Although he is a child, he knows a lot.", zh: "尽管他是个孩子，但他懂得很多。" },
            ],
          },
          {
            type: "pitfall",
            text: "as 引导的让步状语从句中，名词作表语位于句首时，注意名词前面不加冠词：Child as he is（不是 A child as he is）。",
          },
          {
            type: "text",
            text: "当表示虚拟语气的条件状语从句省略 if 时，要将 should、had 或 were 置于从句主语之前，构成倒装。",
          },
          {
            type: "examples",
            items: [
              { en: "Should it rain, the crops would be saved. = If it should rain, the crops would be saved.", zh: "如果下雨，庄稼就有救了。" },
              { en: "Should he act like that again, he would be fired immediately. = If he should act like that again, he would be fired immediately.", zh: "要是他再那样做，他会被立即解雇的。" },
            ],
          },
          {
            type: "tip",
            text: "省略 if 的虚拟语气条件句中用倒装句式，一般表达与事实相反的情况。",
          },
          {
            type: "text",
            text: "某些表示愿望的感叹句用倒装语序。",
          },
          {
            type: "examples",
            items: [
              { en: "Long live our friendship!", zh: "我们的友谊万岁！" },
              { en: "May you succeed!", zh: "祝你成功！" },
            ],
          },
        ],
      },
      {
        heading: "5 so...that、直接引语与修辞性倒装",
        blocks: [
          {
            type: "text",
            text: "so...that... 和 such...that... 引导状语从句，当 so 或 such 位于句首时，主句要用倒装语序。",
          },
          {
            type: "examples",
            items: [
              { en: "So badly did he do his homework that the teacher criticised him.", zh: "他的作业做得太差，老师批评了他。" },
              { en: "So loudly did he speak that everyone in the room could hear him clearly.", zh: "他说话的声音那么大，房间里所有的人都能听清楚。" },
            ],
          },
          {
            type: "text",
            text: "直接引语后注明说话人的句子，主语是名词时常用倒装；主语是代词时，往往不倒装。",
          },
          {
            type: "examples",
            items: [
              { en: "\"Could you do me a favour?\" asked Robert.", zh: "「你能帮我个忙吗？」罗伯特问。" },
              { en: "\"What is it all about?\" asked the stranger.", zh: "「究竟是什么事呢？」陌生人问。" },
              { en: "\"Let's go out for a picnic,\" he said.", zh: "他说：「我们出去野餐吧。」（主语是代词时，往往不倒装）" },
            ],
          },
          {
            type: "text",
            text: "有时为了保持句子平衡、衔接，或为了强调表语或状语，而把表语或状语前置。",
          },
          {
            type: "examples",
            items: [
              { en: "Present at the dancing party were the teachers in our school and some foreign friends.", zh: "出席舞会的是我们学校的老师和一些外国朋友。" },
              { en: "At the foot of the hill lies a beautiful lake, and near the lake are some farm houses, hidden in trees.", zh: "山脚下有一个美丽的湖泊，湖边有一些农舍，掩映在树木中。" },
            ],
          },
        ],
      },
      {
        heading: "6 常见失分陷阱（章末 Common Mistakes）",
        blocks: [
          {
            type: "pitfall",
            text: "______, his idea was accepted by all the people at the meeting. —— as 引导让步状语从句常用倒装语序，as 作连词意为「虽然」。结构为：名词 / 形容词 / 副词 / 动词原形 + as + 主语 + 系动词 / 情态动词。答案选 Strange as it might sound。",
          },
          {
            type: "pitfall",
            text: "A: My room gets very cold at night. B: ______. —— so 放在句首，表示前面的内容也适合于后面的人或物时要用倒装语序。前一句谓语动词为 gets，后一句应用 does，答案选 So does mine。",
          },
          {
            type: "pitfall",
            text: "______ homework did we have to do that we had no time to take a rest. —— so...that... 和 such...that... 引导状语从句，当 so 或 such 位于句首时主句要用倒装语序。由「以至于没有时间休息」可知作业多，用 much，答案选 So much。",
          },
          {
            type: "pitfall",
            text: "Not until the motorbike looked almost new ______ repairing and cleaning it. —— 以 never、seldom、not、not only...but also、not until 等否定词开头的句子要部分倒装。语序为「否定词 + 助动词 / 情态动词 + 主语 + 其他」，答案选 did he stop。",
          },
        ],
      },
    ],
    forms: [
      { name: "完全倒装", pattern: "状语（here / there / away... ）+ 谓语 + 主语", note: "谓语通常是 be、go、come、seem、follow；主语为人称代词时不倒装。" },
      { name: "部分倒装（否定词开头）", pattern: "否定词（never / seldom / hardly / not / neither / nor / little）+ 助动词 / 系动词 / 情态动词 + 主语 + 谓语", note: "用于语法结构需要或强调。" },
      { name: "So / Neither / Nor 引起倒装", pattern: "肯定：So + 助动词 + 主语；否定：Neither / Nor + 助动词 + 主语", note: "表示前面的内容也适用于后面的人或物。" },
      { name: "Only + 状语置于句首", pattern: "Only + 副词 / 介词短语 / 状语从句 + 助动词 + 主语", note: "only 修饰主语时不倒装。" },
      { name: "让步状语从句倒装", pattern: "表语（名词 / 形容词 / 副词）+ as + 主语 + 系动词", note: "用 as 代替 although；名词作表语时前面不加冠词。" },
      { name: "虚拟语气省略 if", pattern: "Should / Had / Were + 主语 + ...", note: "用于省略 if 的虚拟条件句，一般表达与事实相反的情况。" },
      { name: "so / such...that 置于句首", pattern: "So + 副词 / 形容词 + 助动词 + 主语 + that...", note: "so 或 such 位于句首时主句要用倒装语序。" },
    ],
    points: [
      {
        title: "完全倒装与部分倒装的判断",
        desc: "句首是方向 / 地点副词或介词短语作地点状语（here、there、away、in the middle of...）时用完全倒装；句首是否定词、only + 状语、so / neither / nor 时用部分倒装。",
        good: ["Here comes the bus.", "In the middle of the lake lies a small island.", "Never have I been there before.", "Only in this way can you work out the problem."],
        bad: ["Never I have been there before.", "Only in this way you can work out the problem."],
      },
      {
        title: "主语是代词时不倒装",
        desc: "完全倒装句型中主语若是人称代词，语序保持不变。",
        good: ["Here it is.", "Away he went.", "At the foot of the mountain it stands."],
        bad: ["Here is it.", "At the foot of the mountain stands it."],
      },
      {
        title: "so / neither / nor 只表示「也一样」时倒装",
        desc: "表示「前面的情况也适用于后面的人或物」时用倒装，且时态、助动词要与前句一致。",
        good: ["You can go surfing, so can I.", "I have never been abroad, neither has he.", "I didn't go to the cinema last night, nor did he."],
        bad: ["You can go surfing, so I can.", "I didn't go to the cinema last night, nor did he did."],
      },
      {
        title: "as 引导让步状语从句的倒装结构",
        desc: "把名词 / 形容词 / 副词 / 动词原形提到 as 前面，as 意为「虽然」；名词作表语时前面不加冠词。",
        good: ["Old as he is, he works hard.", "Child as he is, he knows a lot.", "Strange as it might sound, his idea was accepted."],
        bad: ["A child as he is, he knows a lot.", "As strange it might sound, his idea was accepted."],
      },
    ],
    contrasts: [
      {
        title: "完全倒装 vs 部分倒装",
        head: ["比较项", "完全倒装", "部分倒装"],
        rows: [
          ["倒装范围", "整个谓语置于主语之前", "只把助动词 / 系动词 / 情态动词提前"],
          ["常见触发", "here / there / now / then / up / down / out / in / away 开头；地点状语介词短语置于句首", "否定词开头、so / neither / nor、only + 状语、so...that、修辞性倒装"],
          ["例句", "Here comes the bus.", "Never have I been there before."],
        ],
      },
      {
        title: "so / neither / nor 的呼应",
        head: ["前句", "后句结构", "例句"],
        rows: [
          ["肯定句", "So + 助动词 + 主语", "You can go surfing, so can I."],
          ["否定句", "Neither / Nor + 助动词 + 主语", "I have never been abroad, neither has he."],
          ["否定句", "Nor + 助动词 + 主语", "I didn't go to the cinema last night, nor did he."],
        ],
      },
    ],
    pitfalls: [
      "否定词或 only + 状语置于句首时才倒装；only 修饰主语时不倒装：Only Amanda and John received my presents.",
      "完全倒装中主语是人称代词时不倒装：Here it is. / Away he went.",
      "让步状语从句用 as 时要把表语提前，且名词作表语时不加冠词：Child as he is...",
      "as 引导让步状语从句的结构是「名词 / 形容词 / 副词 / 动词原形 + as + 主语 + 系动词」，不是 as 直接置于句首：Strange as it might sound。",
      "so / neither / nor 引起的倒装，助动词的时态和形式要与前一句保持一致：My room gets very cold. — So does mine.",
      "否定词开头的部分倒装，语序为「否定词 + 助动词 / 情态动词 + 主语 + 其他」：Not until... did he stop...",
    ],
    examTips: [
      "中考单选常以「否定词 / only + 状语 / so + 倒装 / as 让步倒装 / not until」为主要考法，先找句首的触发词，再判断完全还是部分倒装。",
      "看到句首是 here、there、away、in the middle of... 时判断主语是不是人称代词；是代词就不倒装。",
      "so / neither / nor 呼应句要与前句的时态、助动词一致，前句是实义动词一般现在时（gets），后句用 does。",
      "Not until 置于句首时，倒装发生在主句：Not until the motorbike looked almost new did he stop repairing and cleaning it.",
    ],
    memoryCard: [
      "谓语全部提前 = 完全倒装；只提前助动词 / 系动词 / 情态动词 = 部分倒装。",
      "here / there / away + 名词主语才倒装，代词主语不倒装。",
      "否定词、only + 状语在句首，都要部分倒装。",
      "让步从句：表语 + as + 主语（Child as he is...）。",
      "省略 if 的虚拟：Should / Had / Were 提前。",
      "so / neither / nor 呼应倒装，助动词要跟前句一致。",
    ],
  },
];