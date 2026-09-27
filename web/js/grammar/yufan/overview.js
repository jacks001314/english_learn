// web/js/grammar/yufan/overview.js
// 来源：yufan/总论/（教材《总论·关于英语语法》扫描页，共 9 张）
// 说明：本专题在 topics.js 中不存在，为新增专题（newTopic: true）。

export default [
  {
    topicId: "g-overview",
    newTopic: true,
    title: "总论",
    short: "总论",
    category: "词法",
    difficulty: 1,
    sourceDirs: ["yufan/总论"],
    imagesRead: 9,
    summary: "总论梳理英语语法的整体框架：十大词类、词形变化、三种构词法（转化/合成/派生）与句子成分，是后续各个专题的“总地图”。",
    intro: "英语语法是研究英语语言使用规律的一门学科，主要由词法和句法构成；语法可分为词类、词形变化、构词法和句子成分四大部分。",
    forms: [
      { name: "实词 / 虚词", pattern: "实词：名词 n.、形容词 adj.、数词 num.、代词 pron.、动词 v.、副词 adv.；虚词：冠词 art.、介词 prep.、连词 conj.", note: "实词能在句子中独立充当成分，虚词不能。" },
      { name: "构词法三种", pattern: "转化（词类转换，词形基本不变）/ 合成（两词以上合为一个词）/ 派生（词根 + 前缀或后缀）", note: "派生：前缀多改变词义，后缀多改变词类。" },
      { name: "句子成分", pattern: "主语 + 谓语（+ 表语 / 宾语 / 宾语补足语）+ 定语 / 状语", note: "主语和谓语是句子的主体部分；其余为次要部分。" },
    ],
    points: [
      {
        title: "一词多词性，按在句中的功能判断",
        desc: "同一个词可以是名词也可以是动词；可以是形容词也可以是副词。不要把一个词固定看成某一词类。",
        good: [
          "Last year he paid a visit to London with his parents.（visit 作名词）",
          "He visits his grandparents once a week.（visit 作动词）",
          "She prefers a fast car to a slow car.（fast 作形容词，修饰 car）",
          "The little boy can run as fast as his elder brother.（fast 作副词，修饰 run）",
        ],
        bad: [
          "只看单词拼写判断词性，而不看它在句中的位置和功能。",
        ],
      },
      {
        title: "合成词变复数：只变主体名词",
        desc: "多数合成名词变复数时，只把主体名词变成复数；但由 man、woman 构成的合成词变复数时，必须把两个词都变为复数。",
        good: [
          "daughter(s)-in-law 儿媳；passer(s)-by 过路人",
          "tooth-brush(es) 牙刷；playground(s) 操场",
          "women teachers 女教师；men doctors 男医生",
        ],
        bad: [
          "woman teachers（man/woman 构成的合成词须两个词都变复数）",
        ],
      },
      {
        title: "不定式作主语，常用形式主语 it",
        desc: "不定式（短语）可以作主语，但常用由形式主语 it 引出的句型，真正的主语仍在后面。",
        good: [
          "To teach them English is my job.",
          "It is my job to teach them English.",
        ],
        bad: [
          "把 It is my job to teach them English. 中的 it 当成真正的主语。",
        ],
      },
    ],
    pitfalls: [
      "不要把单词固定在某一词性上：语言是灵活的，要注意掌握单词的词性，才能减少不必要的错误。",
      "合成词变复数一般只变主体名词（daughter(s)-in-law、passer(s)-by）；但 man/woman 构成的合成词要把两个词都变复数（women teachers、men doctors）。",
      "数词和表示年龄、重量、尺寸的名词用连字符构成合成形容词时，这些名词要用单数形式：a five-year-old boy、a four-foot-long box。",
      "感叹词比较特殊，一般不在句子中充当成分；不定式前的 to 是小品词，与介词 to 不同。",
    ],
    examTips: [
      "总论是各专题的“地图”：中考不会单独考“总论”，但词性判断、构词法（合成形容词作定语、派生词词义辨析）常穿插在单选、完形与语篇填空中出现。",
      "做题时先判断空格在句中充当什么成分、修饰谁，再决定词性与词形。",
    ],
    memoryCard: [
      "十大词类：名、形、数、代、动、副、冠、介、连、叹。",
      "实词可独立充当成分；冠词、介词、连词不能。",
      "构词三法：转化、合成、派生。",
      "句子成分：主、谓、表、宾、宾补、定、状。",
    ],
    sections: [
      {
        heading: "一、关于英语语法",
        blocks: [
          { type: "text", text: "英语语法是研究英语语言使用规律的一门学科，主要由词法和句法构成。" },
          { type: "list", items: [
            "英语语法可分为词类、词形变化、构词法和句子成分四大部分。",
          ] },
          { type: "table", head: ["部分", "内容"], rows: [
            ["词类", "英语中的词分为十大词类"],
            ["词形变化", "动词、名词、代词、形容词和副词的词形变化"],
            ["构词法", "转化、合成、派生"],
            ["句子成分", "主语、谓语、表语、宾语、宾语补足语、定语、状语"],
          ] },
          { type: "examples", items: [
            { en: "What we want is to see the child in pursuit of knowledge, and not knowledge in pursuit of the child.", zh: "我们希望看到孩子追求知识，而不是知识追求孩子。（乔治·伯纳德·萧）" },
          ] },
        ],
      },
      {
        heading: "二、词类：十大词类",
        blocks: [
          { type: "text", text: "英语中的词虽然有数十万之多，但根据词义、在句中所起的作用及形式特征，可以分为十大词类。" },
          { type: "table", head: ["序号", "词类", "意义"], rows: [
            ["1", "名词 n.", "表示人或事物的名称。"],
            ["2", "形容词 adj.", "修饰名词，表示人或事物的特征。"],
            ["3", "数词 num.", "表示数量或顺序。"],
            ["4", "代词 pron.", "代替名词或名词词组。"],
            ["5", "动词 v.", "表示动作或状态。"],
            ["6", "副词 adv.", "修饰动词、形容词或其他副词。"],
            ["7", "冠词 art.", "用在名词前帮助说明名词所指的人或事物。"],
            ["8", "介词 prep.", "表示名词、代词等和句中其他词的关系。"],
            ["9", "连词 conj.", "连接词与词、短语与短语或句与句。"],
            ["10", "感叹词 int.", "表示说话时的高兴、惊讶等情感，不在句中担任成分。"],
          ] },
          { type: "list", items: [
            "在这十种词类中，冠词、代词、形容词、数词及介词都和名词有关，而副词则和动词有关。",
            "其中代词可代替名词，形容词和数词修饰名词，冠词限制名词的范围，介词则说明名词与其他词的关系。",
          ] },
        ],
      },
      {
        heading: "三、实词、虚词与小品词",
        blocks: [
          { type: "list", items: [
            "名词、形容词、数词、代词、动词和副词能在句子中独立充当成分，我们称之为实词。",
            "介词、连词和冠词不能在句中独立充当成分，我们称之为虚词。",
            "感叹词比较特殊，它一般不在句子中充当成分。",
            "英语中特殊的词还有不定式前的 to，我们称之为小品词，它与介词 to 不同。",
          ] },
          { type: "examples", items: [
            { en: "I have two books.", zh: "我有两本书。（代词 + 动词 + 数词 + 名词）" },
            { en: "This is a new book.", zh: "这是一本新书。（代词 + 动词 + 冠词 + 形容词 + 名词）" },
            { en: "It is on my desk.", zh: "它在我的桌子上。（代词 + 动词 + 介词 + 名词短语）" },
            { en: "He works carefully.", zh: "他工作得很仔细。（代词 + 动词 + 副词）" },
            { en: "Please listen to me.", zh: "请听我讲。（此处 to 是介词）" },
            { en: "It's necessary for us to have a meeting.", zh: "我们需要开个会。（此处 to 是小品词）" },
          ] },
          { type: "tip", text: "判断实词还是虚词，看它能不能在句中独立充当成分。" },
        ],
      },
      {
        heading: "四、一词多词性",
        blocks: [
          { type: "text", text: "英语中很多词是一词多词性的。实际上，一个词可以是名词，也可以是动词；或者，一个词既是形容词也是副词。总之，语言是灵活的。要注意掌握单词的词性，以减少不必要的错误。" },
          { type: "table", head: ["例词", "词性", "例句"], rows: [
            ["visit", "① n. 拜访，访问；游览", "Last year he paid a visit to London with his parents."],
            ["visit", "② v. 拜访，访问；参观", "He visits his grandparents once a week."],
            ["fast", "① adj. 紧的；牢的；快速的", "She prefers a fast car to a slow car.（fast 修饰名词 car）"],
            ["fast", "② adv. 牢固地；很快地；紧紧地", "The little boy can run as fast as his elder brother.（fast 修饰动词 run）"],
            ["fast", "③ n. 禁食（期），斋戒（期）", "Friday is a fast day."],
            ["colour", "① n. 颜色", "What colour is his hair?"],
            ["colour", "② v. 把……涂成……颜色", "Colour the picture yellow."],
            ["home", "① n. 家", "Let's go to my parents' home."],
            ["home", "② adv. 在家；回家", "Let's go home."],
            ["upstairs", "① adv. 向楼上；在楼上", "She went upstairs."],
            ["upstairs", "② adj. 位于楼上的；住在楼上的", "I live in the upstairs room."],
            ["upstairs", "③ n. 二楼；二楼以上各层；楼上", "They're painting the upstairs."],
          ] },
          { type: "examples", items: [
            { en: "The girl is fast asleep.", zh: "这个姑娘在酣睡。（副词修饰形容词 asleep）" },
          ] },
        ],
      },
      {
        heading: "五、词形变化",
        blocks: [
          { type: "text", text: "英语的这一特点与汉语不同：汉语中没有词形变化，而在英语中除了虚词（冠词、介词、连词）和感叹词没有词形变化外，其余的实词都有词形变化。其中以动词的词形变化最多。" },
          { type: "list", items: [
            "动词的词形变化有人称、数、时态、语态和语气的变化。",
            "名词有自己的单数、复数及名词所有格的变化。",
            "代词有人称、数和格的变化，不仅变化多，而且变化大，需要牢记。",
            "形容词和副词都有原级、比较级和最高级的变化。",
            "除上述规则外，还有一些固定的前缀、后缀与词根的变化。",
          ] },
          { type: "examples", items: [
            { en: "My mother goes to work by bus.", zh: "我妈妈坐公共汽车去上班。（主语是第三人称单数，一般现在时，动词 go 后加 -es）" },
            { en: "The museum was built in 1957.", zh: "这座博物馆是 1957 年建的。（被动语态 + 过去时，用 be + 过去分词）" },
            { en: "He will show me around his school.", zh: "他将带我参观他的学校。（he 主格；me 宾格；his 所有格）" },
            { en: "She is the thinnest of the four.", zh: "四个人中她最瘦。（形容词的最高级）" },
            { en: "She speaks English faster than her sister.", zh: "她说英语的语速比她姐姐快。（副词的比较级）" },
            { en: "He looks as young as his brother.", zh: "他看起来和他弟弟一样年轻。（形容词的原级）" },
          ] },
          { type: "table", head: ["名词形式", "例"], rows: [
            ["单数", "an hour 一小时；a student 一个学生"],
            ["复数", "three hours 三小时；many teachers 许多老师"],
            ["名词单数的所有格", "Mary's sister 玛丽的姐姐；a friend of my brother 我哥哥的一个朋友"],
            ["名词复数的所有格", "Teachers' Day 教师节；Students' Union 学生会"],
          ] },
          { type: "table", head: ["变化类型", "例"], rows: [
            ["前缀", "dis-, im-…：disable 使丧失能力；impossible 不可能的"],
            ["后缀", "-er, -ful, -less, -ly, -ness, -tion…：teacher 老师；beautiful 美丽的；neatly 整洁地；carelessness 不小心"],
            ["词根", "care, happy…：careful 小心的；careless 不小心的；happily 快乐地；happiness 幸福，快乐"],
          ] },
        ],
      },
      {
        heading: "六、构词法",
        blocks: [
          { type: "text", text: "构词法有三种，即转化、合成和派生。转化，就是由一个词类转化为另一词类；合成，就是由两个或更多的词合成一个词；而派生，则通过加前缀或后缀构成另一个词。" },
        ],
      },
      {
        heading: "6.1 转化",
        blocks: [
          { type: "text", text: "由一种词类转化成另一种或几种词类而词形并没有太大变化，我们就称为转化。也就是说，一个单词可作名词，也可作动词或别的词类。同学们在学习单词时，可以多查字典，掌握单词的多种用法。" },
        ],
      },
      {
        heading: "6.2 合成",
        blocks: [
          { type: "list", items: [
            "由两个或更多的词合成一个词，我们称之为合成词。有的合成词之间用连字符，有的则不用。常见合成名词有 drink-driving（酒后驾车）、greenhouse（温室）、bus driver（公交司机）等。",
            "注意：news（新闻）、paper（纸）均是不可数名词，但当它们合成一个词 newspaper（报纸）时，就变成了可数名词。",
            "多数合成名词变复数时，只把主体名词变成复数：daughter(s)-in-law 儿媳、passer(s)-by 过路人、tooth-brush(es) 牙刷、playground(s) 操场。",
            "由 man、woman 构成的合成词变为复数时，必须把两个词都变为复数：women teachers 女教师、men doctors 男医生。",
            "在合成词中，如果数词和表示年龄、重量、尺寸等的名词用连字符构成时，这些名词要用单数形式：a five-year-old boy = He is five years old.；a four-foot-long box = The box is four feet long.。",
          ] },
          { type: "examples", items: [
            { en: "He is a five-year-old boy.", zh: "他是一个 5 岁的小男孩。" },
            { en: "She is looking after a blue-eyed baby. = She is looking after a baby with blue eyes.", zh: "她正在照看一个蓝眼睛的婴儿。" },
            { en: "There is a short-legged deer in the zoo. = There is a deer with short legs in the zoo.", zh: "这个动物园中有一只短腿鹿。" },
            { en: "She is a good-tempered woman. = She is a woman with a good temper.", zh: "她是一个好脾气的女人。" },
          ] },
          { type: "tip", text: "“数词/形容词 + 名词 + -ed”构成的合成形容词（blue-eyed、short-legged、good-tempered），往往可用相应的 with 词组替换。" },
        ],
      },
      {
        heading: "6.3 派生",
        blocks: [
          { type: "text", text: "由一个词根加上前缀（prefixes）或后缀（suffixes）构成另一个词，我们称之为派生。加前缀一般不会引起词类的转变，前缀中有相当多的一部分是用来构成反义的；而后缀往往使词类转换。" },
          { type: "table", head: ["前缀", "含义", "例"], rows: [
            ["re-", "表示再一次；重复（re = again）", "tell 告诉 → retell 复述；write 书写 → rewrite 重写；union 联合 → reunion 重聚"],
            ["im-", "表示否定（negative）", "possible 可能的 → impossible 不可能的；polite 礼貌的 → impolite 无礼的（特别记忆：以 m 和 p 开头的单词加 im-）"],
            ["in-", "表示否定（negative）", "correct 正确的 → incorrect 不正确的；direct 直接的 → indirect 间接的"],
            ["ir-", "表示否定（negative）", "regular 规则的 → irregular 不规则的（特别记忆：以 r 开头的单词加 ir-）"],
            ["un-", "表示否定（negative）", "comfortable 舒适的 → uncomfortable 不舒适的；usual 平常的 → unusual 不平常的；certain 确定的 → uncertain 不确定的"],
          ] },
          { type: "table", head: ["后缀", "类别", "例"], rows: [
            ["-er / -or / -ist", "名词后缀", "work 工作 → worker 工人；play 玩 → player 运动员；act 扮演 → actor 男演员；science 科学 → scientist 科学家；teach 教 → teacher 教师；drive 驾驶 → driver 司机；sail 航行 → sailor 水手"],
            ["-tion / -sion", "名词后缀", "invite 邀请 → invitation 请柬；discuss 讨论 → discussion 讨论；express 表达 → expression 表达；措辞"],
            ["-ment", "名词后缀", "move 运动 → movement 运动；govern 统治 → government 政府"],
            ["-ness", "名词后缀", "happy 快乐的 → happiness 幸福；ill 生病 → illness 疾病；careful 小心的 → carefulness 小心"],
            ["-hood", "名词后缀", "child 孩子 → childhood 儿童时代"],
            ["-ful", "形容词后缀", "care 小心 → careful 小心的；help 帮助 → helpful 有用的"],
            ["-less", "形容词后缀", "care 关心 → careless 不关心的；help 帮助 → helpless 无助的；use 使用 → useless 无用的"],
            ["-y", "形容词后缀", "snow 雪 → snowy 下雪的；rain 雨 → rainy 下雨的，多雨的；wind 风 → windy 有风的；rock 岩石 → rocky 多岩石的；salt 食盐 → salty 咸的，有盐分的"],
            ["-ly", "形容词后缀", "friend 朋友 → friendly 友好的；sister 姐妹 → sisterly 像姐妹的；brother 兄弟 → brotherly 兄弟的；love 爱 → lovely 可爱的"],
            ["-ly", "副词后缀", "careful 仔细的 → carefully 仔细地；hungry 饥饿的 → hungrily 饥饿地；nervous 紧张的 → nervously 紧张地"],
          ] },
        ],
      },
      {
        heading: "七、句子成分",
        blocks: [
          { type: "text", text: "句子是由词按一定语法结构组成的、能表达一个完整概念的语言单位。句子的开头第一个字母必须要大写，结尾要有句号“.”、问号“?”或感叹号“!”。" },
          { type: "list", items: [
            "组成句子的各个部分叫做句子的成分。句子成分包括：主语、谓语、表语、宾语（直接宾语、间接宾语）、宾语补足语、定语和状语。",
            "主语和谓语是句子的主体部分（在英文中，一般的句子必须有主语和谓语）。",
            "表语、宾语和宾语补足语是谓语的组成部分；定语和状语是句子的次要部分。",
          ] },
        ],
      },
      {
        heading: "7.1 主语",
        blocks: [
          { type: "text", text: "主语是谓语讲述的对象，表示所说的“是什么”或“是谁”。一般由名词、代词、数词、不定式或相当于名词的词或短语来充当，位于句首。" },
          { type: "examples", items: [
            { en: "We study in No. 1 Middle School.", zh: "我们在一中学习。（讲述“谁”）" },
            { en: "The classroom is very clean.", zh: "这间教室很干净。（讲述“什么”）" },
            { en: "Three were absent.", zh: "三个人缺席。（数词作主语）" },
            { en: "To teach them English is my job.", zh: "教他们英语是我的工作。（不定式作主语）" },
          ] },
          { type: "tip", text: "不定式作主语时，常用由形式主语 it 引出的句型，因此 To teach them English is my job. 可以变为 It is my job to teach them English.，其真正的主语是 to teach them English。" },
        ],
      },
      {
        heading: "7.2 谓语",
        blocks: [
          { type: "text", text: "谓语用来说明主语“做什么”“是什么”或“怎么样”。谓语（谓语部分里主要的词）必须用动词。谓语和主语在人称和数两方面必须保持一致。它的位置一般在主语之后。" },
          { type: "examples", items: [
            { en: "He is a good student.", zh: "他是一名好学生。（系动词和表语一起作谓语）" },
            { en: "His parents are doctors.", zh: "他的父母都是医生。（系动词和表语一起作谓语）" },
            { en: "She looks well.", zh: "她看起来气色很好。（系动词和表语一起作谓语）" },
            { en: "We study hard.", zh: "我们努力学习。（实义动词作谓语）" },
            { en: "Justin has been to China twice.", zh: "贾斯廷去过中国两次。（助动词和 be 动词一起作谓语）" },
            { en: "We have finished reading the book.", zh: "我们已经看完了这本书。（助动词和实义动词一起作谓语）" },
            { en: "You must go to bed earlier.", zh: "你必须早一点儿睡觉。（情态动词和实义动词一起作谓语）" },
          ] },
        ],
      },
      {
        heading: "7.3 表语（后续专题展开）",
        blocks: [
          { type: "text", text: "表语说明主语“是什么”或者“怎么样”，一般由名词、形容词、副词等充当。（教材第 009 页起继续展开）" },
          { type: "tip", text: "主语、谓语、表语、宾语、宾语补足语、定语和状语的完整讲解，见“句子成分和基本句型”专题。" },
        ],
      },
    ],
    extras: {
      memoryCard: [
        "四大部分：词类、词形变化、构词法、句子成分。",
        "合成词变复数：只变主体名词；man/woman 构成的合成词两个词都变。",
      ],
    },
    notes: "yufan/总论 共 9 张全部查看（234—242）。最后一张（242）为“表语”开头，教材内容在此页截断，后续内容在“句子成分和基本句型”目录中。",
  },
];