// web/js/grammar/yufan/agreement.js
// 来源：yufan/主谓一致（第 22 章，15 张教材扫描图）
// 契约见同目录 README.md；本文件为纯数据 ES Module。

export default [
  {
    topicId: "g-agreement",
    newTopic: true,
    title: "主谓一致",
    sourceDirs: ["yufan/主谓一致"],
    imagesRead: 15,
    category: "句法",
    difficulty: 4,
    summary:
      "主语的单复数决定谓语动词的形式。先掌握语法一致、意义一致、就近一致三条原则，再按主语类型（并列主语、不定代词、集体名词、数量短语、从句等）逐类处理特殊情况。",
    intro:
      "主谓一致难在“形式”与“意义”不一致：主语形式是单数、意义是复数时用复数谓语（如 The crowd were fighting for their lives.），反之用单数谓语（如 Twenty dollars is too dear.）。做题时先定位真正的主语，忽略插入语和修饰语。",
    forms: [
      { name: "语法一致原则", pattern: "语法形式是单数的主语 + 单数谓语；语法形式是复数的主语 + 复数谓语", note: "His father is a doctor. / The twins have found their mother." },
      { name: "意义一致原则", pattern: "按主语表达的内在含义决定谓语单复数", note: "Twenty dollars is too dear. / The crowd were fighting for their lives." },
      { name: "就近一致原则", pattern: "谓语与邻近的主语保持人称和数的一致", note: "Neither you nor your brother has passed the exam." },
      { name: "并列连词连接主语", pattern: "A or B / either A or B / neither A nor B / not only A but (also) B + 谓语", note: "谓语与后一个主语一致：Either he or I am wrong." },
      { name: "主语 + 插入语", pattern: "主语 + as well as / with / together with / rather than / but / except … + 谓语", note: "谓语仍与主语一致：Nobody but us knows it." },
    ],
    points: [
      {
        title: "就近一致：or / either…or / neither…nor / not only…but also",
        desc: "谓语动词与最靠近它的那个主语保持人称和数的一致。",
        good: ["Tom or his brothers are waiting in the room.", "Neither the students nor the teacher knows anything about it.", "Not only the students but also the teacher is active in sports and games."],
        bad: ["Neither the students nor the teacher know anything about it."],
      },
      {
        title: "插入语不影响主语的数",
        desc: "主语后接 as well as、with、together with、rather than、but、except 等短语时，谓语动词仍与主语一致。",
        good: ["The teacher, together with his students, is visiting the museum.", "Nobody but us knows it.", "I, rather than you, am to blame."],
        bad: ["The teacher, together with his students, are visiting the museum."],
      },
      {
        title: "each / every / no 修饰的单数主语，即使并列也用单数谓语",
        desc: "不定代词 each、every、no 所修饰的单数可数名词，即使以 and 或逗号连接成多个并列主语，谓语仍用单数。",
        good: ["Each boy and each girl wants to serve the people in the future.", "Every man and woman attends the meeting."],
        bad: ["Each boy and each girl want to serve the people in the future.（each 所修饰的并列主语，谓语仍用单数）"],
      },
      {
        title: "and 连接的主语看“同一概念”还是“不同概念”",
        desc: "表示不同概念用复数谓语；表示同一概念用单数谓语，且只在第一个名词前加修饰语。",
        good: ["The singer and the dancer come from Guangxi.（两个人）", "The singer and dancer comes from Guangxi.（同一个人）", "The tenth and last chapter is difficult to understand.（同一章）"],
        bad: ["The singer and dancer come from Guangxi.（同一个人时应用单数）"],
      },
      {
        title: "one of + 复数名词 + 定语从句的谓语",
        desc: "定语从句谓语与靠近的复数名词一致（用复数）；但 one 前有 the (only) 时，从句谓语用单数。",
        good: ["This is one of the most interesting questions that have been asked.", "She was the only one of the girls who was late for the meeting."],
        bad: ["This is one of the most interesting questions that has been asked.（定语从句的谓语应与靠近的复数名词一致，用 have）"],
      },
      {
        title: "the number of 用单数，a number of 用复数",
        desc: "“the number of + 复数名词”作主语，谓语用单数；“a number of + 复数名词”作主语，谓语用复数。",
        good: ["The number of students in our school is 1,123.", "A number of students like playing football."],
        bad: ["The number of students in our school are 1,123."],
      },
    ],
    pitfalls: [
      "谓语只与真正的主语一致，不要被 with / together with / as well as / but / except 等插入语带偏。",
      "主语是单数、意义是复数（The crowd were…）或形式是复数、意义是单数（Twenty dollars is…）时，一律按意义一致处理。",
      "people、police、cattle 作主语时，谓语只能用复数形式。",
      "“the + 形容词/过去分词”表示一类人时谓语用复数（The injured have been taken to hospital.），但表示某个人或物时用单数（The wounded is a friend of his.）。",
      "glasses、trousers、clothes、shoes 等以 -s 结尾的名词作主语用复数谓语，但前面有 a pair of / a kind of 等时，谓语随 pair、kind 的数变化。",
      "each 位于复数主语之后不影响主语的数：The boys each have an apple.",
    ],
    examTips: [
      "先划出真正的主语（划掉插入语和定语从句），再判断单复数，是这类题最快的方法。",
      "看到 or / either…or / neither…nor / not only…but also 立刻用就近一致；看到 the number of / a number of 立刻区分单复数。",
      "分数、百分数、part of、a lot of、the population 等作主语时，一律看 of 后面的名词（或所表示的概念）：复数概念用复数，单数/不可数概念用单数。",
    ],
    memoryCard: [
      "三原则：语法一致、意义一致、就近一致。",
      "插入语不改变主语：with、as well as、but、except 都忽略。",
      "the number of 单，a number of 复；people / police / cattle 只复。",
    ],
    sections: [
      {
        heading: "一、主谓一致的三原则",
        blocks: [
          {
            type: "text",
            text:
              "在英语中，主语的单复数形式决定着谓语动词应该采用的相应形式。由于动词有许多不同的形式和功能，对每一个句子来说，我们不仅要考虑谓语动词在时态、语态上是否恰当，还要注意谓语动词必须在人称和数上与主语保持一致。",
          },
          {
            type: "examples",
            items: [
              { en: "They are students.", zh: "他们是学生。" },
              { en: "His family are watching TV.", zh: "他们全家人正在看电视。" },
              { en: "Either you or I am going to work there.", zh: "不是你就是我将要去那里工作。" },
            ],
          },
          {
            type: "text",
            text:
              "① 语法一致原则：一般来说，语法形式是单数的主语，谓语动词用单数形式；语法形式是复数的主语，谓语动词用复数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "His father is a doctor.", zh: "他父亲是一位医生。" },
              { en: "The number of errors was surprising.", zh: "错误的数量之多，是惊人的。" },
              { en: "We love our motherland.", zh: "我们热爱我们的祖国。" },
              { en: "The twins have found their mother.", zh: "双胞胎找到了他们的妈妈。" },
            ],
          },
          {
            type: "text",
            text:
              "② 意义一致原则：主谓一致不仅根据其外部语法形态来决定，最主要是取决于主语所表达的内在含义。主语形式虽为单数，但在意义上却为复数，谓语动词用复数形式；主语形式虽为复数，但在意义上却为单数，谓语动词用单数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "Twenty dollars is too dear.", zh: "20 美元太贵了。" },
              { en: "The crowd were fighting for their lives.", zh: "这些人正为生存而战斗。" },
              { en: "Three years in a strange land seems like a long time.", zh: "在异国他乡生活 3 年，却仿佛是度过了很长的时间。" },
            ],
          },
          {
            type: "text",
            text:
              "③ 就近一致原则：谓语动词根据它前面邻近的名词、代词等的数的形式，来决定自身数的形式。",
          },
          {
            type: "examples",
            items: [
              { en: "Not only his children but also he himself wants to go there.", zh: "不仅他的孩子想去那里，而且他本人也想去。" },
              { en: "Neither you nor your brother has passed the exam.", zh: "你和你弟弟考试都没有及格。" },
            ],
          },
        ],
      },
      {
        heading: "二、并列主语与插入语",
        blocks: [
          {
            type: "text",
            text:
              "Ⓐ 两个作主语的名词或代词由 either…or、neither…nor、or、not only…but (also) 连接时，谓语动词应与后一个主语的人称和数保持一致。",
          },
          {
            type: "examples",
            items: [
              { en: "Tom or his brothers are waiting in the room.", zh: "汤姆或他的哥哥们正在房间里等候着。" },
              { en: "Either he or I am wrong.", zh: "不是他错了就是我错了。" },
              { en: "Neither the students nor the teacher knows anything about it.", zh: "学生们和老师都不知道这件事。" },
              { en: "Not only the students but also the teacher is active in sports and games.", zh: "不仅学生，就连老师都积极参加体育运动。" },
            ],
          },
          {
            type: "text",
            text:
              "Ⓑ 主语是单数而后接由 as well as、with、together with、like、along with、rather than、no less than、as much as、including、in addition to、besides、but、except 等引起的短语时，谓语动词仍用单数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "No one except his own supporters agrees with him.", zh: "除了他自己的支持者以外，谁也不同意他的意见。" },
              { en: "Nobody but us knows it.", zh: "除我们之外，再没有人知道此事。" },
              { en: "I, rather than you, am to blame.", zh: "该受责备的是我而不是你。" },
              { en: "She as well as the other students has learned how to type.", zh: "她和其他学生一样，也学会了如何打字。" },
              { en: "Our school, with some few schools, was built in the 1950s.", zh: "我们学校和不少学校一样建于 20 世纪 50 年代。" },
              { en: "A professor, together with some students, was moved into a new laboratory.", zh: "一位教授和几个学生搬到新实验室里去了。" },
            ],
          },
          {
            type: "text",
            text:
              "Ⓖ 一个或两个以上的并列主语由 and 连接时，如果表示不同概念，谓语动词用复数形式；如果表示同一概念，谓语动词要用单数形式。后一种情况只在第一个名词前加修饰语。",
          },
          {
            type: "examples",
            items: [
              { en: "The singer and the dancer come from Guangxi.", zh: "这位歌手和这位舞蹈演员来自广西。（and 前后表示两个人）" },
              { en: "The singer and dancer comes from Guangxi.", zh: "那位歌手兼舞蹈演员来自广西。（and 前后表示同一个人）" },
              { en: "A professor and writer has attended the meeting.", zh: "一位教授兼作家出席了这次会议。（and 前后表示同一个人）" },
              { en: "The tenth and the last chapter are difficult to understand.", zh: "第十章和最后一章很难看懂。（and 前后表示两章）" },
              { en: "The tenth and last chapter is difficult to understand.", zh: "第十章也就是最后一章很难看懂。（and 前后表示同一章）" },
            ],
          },
        ],
      },
      {
        heading: "三、不定代词及合成代词作主语",
        blocks: [
          {
            type: "text",
            text:
              "Ⓒ 由 each、either、neither 或 some、any、no、every 构成的合成代词作主语时，谓语动词用单数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "Each boy has read the book.", zh: "每个男孩都看过这本书了。" },
              { en: "Neither of them is interested in English.", zh: "他们两人对英语都不感兴趣。" },
              { en: "Either of the stories is interesting.", zh: "两个故事中的任何一个都有趣。" },
              { en: "Somebody is waiting for you at the gate of the school.", zh: "有人在学校大门口等你。" },
              { en: "Nobody wants to go there.", zh: "没有人愿意去那里。" },
              { en: "Everything goes very well.", zh: "一切进行得很顺利。" },
            ],
          },
          {
            type: "tip",
            text: "each 位于复数主语之后时不影响主语的数：The boys each have an apple.（男孩们每人都有一个苹果。）",
          },
          {
            type: "text",
            text:
              "Ⓗ 不定代词 none 作主语时，谓语动词可用单数形式或者复数形式。none of 短语作主语时，如果 of 之后为复数概念，则谓语动词用单数形式或复数形式都可以；如果 of 之后为单数概念，则谓语动词用单数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "None knows / know a great deal about this experiment.", zh: "没有一个人对这项实验很了解。" },
              { en: "None has / have been found.", zh: "一个也没有找到。" },
              { en: "None of the apples is / are good.", zh: "那些苹果没有一个是好的。" },
              { en: "None of the apple is good.", zh: "那个苹果没有一点儿是好的。" },
            ],
          },
          {
            type: "text",
            text:
              "Ⓘ 代词 what、who、which、any、all、most、more 等作主语时，谓语动词用单数还是复数主要由它们所代替的意义决定。",
          },
          {
            type: "examples",
            items: [
              { en: "What is wrong with you?", zh: "你怎么了？" },
              { en: "There are some books on the desk. What are the names of them?", zh: "桌子上有一些书。书名是什么？" },
              { en: "He who laughs the last laughs the best.", zh: "谁笑到最后，谁笑得最好。" },
              { en: "All of the students have seen the film.", zh: "全体学生都看过这部电影。" },
              { en: "All that glitters is not gold.", zh: "闪光的不全是金子。" },
              { en: "All of his spare time was spent in reading.", zh: "他所有的空余时间都花在看书上。" },
              { en: "Most of her money is spent on clothes.", zh: "她大部分的钱花在买衣服上。" },
            ],
          },
          {
            type: "text",
            text:
              "Ⓙ 不定代词 each、every、no 所修饰的单数可数名词，即使以 and 或逗号连接成多个并列主语，谓语动词仍用单数形式。Ⓚ more than one、many a 短语作主语时，尽管意义上是复数，但谓语动词通常用单数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "Each boy and each girl wants to serve the people in the future.", zh: "每个男孩和女孩都想将来为人民服务。" },
              { en: "Every man and woman attends the meeting.", zh: "男的、女的都参加这个会。" },
              { en: "No boy and no girl likes him in his class.", zh: "他们班上的男孩和女孩都不喜欢他。" },
              { en: "More than one student has tried.", zh: "不止一个学生尝试过。" },
              { en: "Many a student and teacher is watching the football match.", zh: "许多学生和老师正在观看足球比赛。" },
            ],
          },
        ],
      },
      {
        heading: "四、集体名词与 people / police / cattle",
        blocks: [
          {
            type: "text",
            text:
              "Ⓔ 作主语用的集体名词作为一个整体看待时，谓语动词可用单数形式；若就其中各个成员来考虑，谓语动词则用复数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "My family has moved into the new house.", zh: "我家已搬进了新房子。（My family 表示“我家”，是一个整体，谓语动词用单数形式。）" },
              { en: "My family enjoy sports and games.", zh: "我们全家人都喜欢体育运动。（My family 意为“家庭中的每个人”，强调各个成员，谓语动词用复数形式。）" },
              { en: "The committee was made up of 10 members.", zh: "委员会由 10 人组成。（强调整体）" },
              { en: "The committee were in the hall.", zh: "委员们都在大厅内。（强调各个成员）" },
            ],
          },
          {
            type: "text",
            text: "Ⓕ people（人民）、police、cattle 等集体名词作主语时，谓语动词只能用复数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "The people in the city are very friendly.", zh: "那个城市的人们都很友好。" },
              { en: "The police are searching for the murderer.", zh: "警察正在搜寻杀人犯。" },
              { en: "The cattle are grazing near the river.", zh: "牛群在河边吃草。" },
            ],
          },
          {
            type: "text",
            text:
              "Ⓜ “the + 形容词 / 过去分词”这一表示一类人的结构作主语时，谓语动词用复数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "The injured have been taken to hospital.", zh: "伤员已被送往医院。" },
              { en: "The young are required to respect the old.", zh: "年轻人应该尊敬老人。" },
              { en: "The old are taken good care of in our country.", zh: "在我们国家，老人受到了很好的照顾。" },
              { en: "The good in him outweighs the bad.", zh: "他身上的优点多过缺点。" },
              { en: "The wounded is a friend of his.", zh: "这位伤员是他的一个朋友。" },
            ],
          },
          {
            type: "tip",
            text: "“the + 形容词/过去分词”也可以表示某物或某个人（如 The good、The wounded），此时谓语动词用单数形式。",
          },
        ],
      },
      {
        heading: "五、数量、分数与“数”的特殊结构",
        blocks: [
          {
            type: "text",
            text:
              "Ⓓ 表示数目、时间、金额、距离、路程、书名、国名、报刊名称等的名词复数作主语时，谓语动词用单数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "Two hours is enough for us to finish the experiment.", zh: "两个小时足够我们做完这项实验。" },
              { en: "Ten dollars is too cheap for this pair of shoes.", zh: "这双鞋卖 10 美元太便宜了。" },
              { en: "Two hundred miles is a long distance.", zh: "200 英里是很长的一段距离。" },
              { en: "The United States is a developed country.", zh: "美国是一个发达国家。" },
              { en: "The New York Times is published daily.", zh: "《纽约时报》每天都出版。" },
            ],
          },
          {
            type: "text",
            text:
              "Ⓞ 分数、百分数作主语，谓语动词常与其后 of 短语所表示的概念一致：of 后表示复数概念，谓语动词用复数；of 后表示单数概念，谓语动词用单数。",
          },
          {
            type: "examples",
            items: [
              { en: "Three fifths of the workers here are women.", zh: "这儿五分之三的工人是妇女。" },
              { en: "Sixty percent of his money was spent on books.", zh: "他把百分之六十的钱都花在买书上了。" },
            ],
          },
          {
            type: "text",
            text:
              "Ⓨ “the number of + 复数名词”作主语，谓语动词用单数；“a number of + 复数名词”作主语，谓语动词用复数。Ⓢ part of 短语作主语，谓语动词跟 of 后面的名词的数一致；Ⓣ population 作主语，如指人口数谓语动词用单数，如指成员等谓语动词用复数。",
          },
          {
            type: "table",
            head: ["主语结构", "谓语动词"],
            rows: [
              ["“the amount of + 不可数名词”作主语", "谓语动词用单数"],
              ["“an amount of + 不可数名词”作主语", "谓语动词用单数"],
              ["“the quantity of + 复数名词或不可数名词”作主语", "谓语动词用单数"],
              ["“a quantity of + 复数名词”作主语", "谓语动词用复数"],
              ["“a quantity of + 不可数名词”作主语", "谓语动词用单数"],
              ["“quantities of + 复数名词或不可数名词”作主语", "谓语动词用复数"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "The number of students in our school is 1,123.", zh: "我校学生数为 1123 人。" },
              { en: "A number of students like playing football.", zh: "许多学生喜欢踢足球。" },
              { en: "Quantities of tea were sold last month.", zh: "上个月销售了大量的茶叶。" },
              { en: "(A) part of the books have arrived.", zh: "一部分书已经到了。" },
              { en: "Part of his money was spent on smoking.", zh: "他的一部分钱花在抽烟上了。" },
              { en: "Parts of the book are interesting.", zh: "这本书有些部分是有趣的。" },
              { en: "The population of the village is 538.", zh: "这个村子的人口总数为 538 人。" },
              { en: "One third of the population here are workers.", zh: "这儿三分之一的人是工人。" },
            ],
          },
          {
            type: "tip",
            text: "parts of 短语作主语，谓语动词用复数；“分数或百分数 + of the population”短语作主语，谓语动词用复数。",
          },
          {
            type: "text",
            text:
              "Ⓧ a lot of、lots of、plenty of、enough of、masses of、a mass of、a large / small quantity of 等短语作主语时，of 后接不可数名词，谓语动词用单数；of 后接可数名词复数，谓语动词用复数。Ⓦ little、a little、a bit of、much、a good / great deal of、an amount of 等通常修饰不可数名词，作主语时谓语动词用单数。Ⓥ few (of)、a few (of)、both (of)、both…and、many、dozens of、a great many、a good many 等通常修饰复数名词或代词，作主语时谓语动词用复数。",
          },
          {
            type: "examples",
            items: [
              { en: "A lot of problems were settled at the meeting yesterday.", zh: "在昨天的会议上解决了许多问题。" },
              { en: "A mass of work remains to be done.", zh: "还有大量的工作要做。" },
              { en: "Much homework has to be done this afternoon.", zh: "今天下午有许多家庭作业要做。" },
              { en: "A great deal of money was wasted on the project.", zh: "这项工程浪费了大量的钱。" },
              { en: "Few of them have passed the exam.", zh: "他们之中很少有人通过这次考试。" },
              { en: "Dozens of students are on the platform.", zh: "月台上有几十个学生。" },
              { en: "A good many students have tried.", zh: "很多学生都尝试过。" },
            ],
          },
        ],
      },
      {
        heading: "六、从句与其它结构作主语",
        blocks: [
          {
            type: "text",
            text:
              "Ⓝ 在“……one of + 复数名词 + who / that / which 定语从句”结构中，当关系代词作主语时，定语从句的谓语动词与靠近的复数名词的数一致，因此从句的谓语动词用复数；但是当 one 之前有 the (only) 修饰时，从句的谓语动词用单数。",
          },
          {
            type: "examples",
            items: [
              { en: "This is one of the most interesting questions that have been asked.", zh: "这是被问到的最有趣的问题之一。" },
              { en: "She was the only one of the girls who was late for the meeting.", zh: "她是那些女孩中唯一一个开会迟到的。" },
            ],
          },
          {
            type: "text",
            text:
              "Ⓟ 单个的动名词短语、不定式短语、主语从句作主语，谓语动词用单数；但并列的此类结构作主语，谓语动词用复数。Ⓩ 在大多数情况下，由 what 引导的名词性分句作主语时，其后的谓语动词（多数是 be 的某种形式）应按语法一致原则使用单数形式。",
          },
          {
            type: "examples",
            items: [
              { en: "Raising pigs is her job.", zh: "养猪是她的工作。" },
              { en: "To see is to believe.", zh: "眼见为实。" },
              { en: "Whether he will come or not is still a question.", zh: "他来不来仍是个问题。" },
              { en: "Listening, speaking, reading and writing are all important in learning English.", zh: "在学英语时，听、说、读和写都很重要。" },
              { en: "What is needed is acts.", zh: "需要的是行动。" },
              { en: "What you need is more rest.", zh: "你所需的是更多的休息。" },
            ],
          },
          {
            type: "text",
            text:
              "Ⓛ 在“there be + 并列主语”和“here be + 并列主语”结构中，谓语动词一般应与并列主语中的第一个主语的数一致。Ⓠ glasses、trousers、clothes、shoes、chopsticks、compasses、scissors 等作主语时谓语用复数，但这些名词前有 kind of、piece of、pair of、sort of、type of 等修饰时，谓语动词视 kind、piece 等的数来定。Ⓡ this kind of book = a book of this kind 作主语谓语用单数；these kind of men = men of this kind 作主语谓语用复数。Ⓤ the Olympic Games、the Asian Games 等短语作主语时谓语用复数。",
          },
          {
            type: "examples",
            items: [
              { en: "There is a pen and two books on the desk.", zh: "桌上有一支钢笔和两本书。" },
              { en: "There are some books and a pen on the desk.", zh: "桌上有些书和一支钢笔。" },
              { en: "At that time there was only a teacher and a student in the room.", zh: "那时房间里只有一个教师和一个学生。" },
              { en: "Here is a letter and a book for you.", zh: "这里有一封信和一本书是给你的。" },
              { en: "His trousers are worn out.", zh: "他的裤子破了。" },
              { en: "A pair of shoes was in the box.", zh: "这个盒子里有一双鞋。" },
              { en: "There are two pieces of paper on the floor.", zh: "地板上有两张纸。" },
              { en: "This kind of book is of great value. = A book of this kind is of great value.", zh: "这种书很有价值。" },
              { en: "These kind of books are very expensive.", zh: "这种书很贵。" },
              { en: "This kind of men is dangerous. / These kind of men are dangerous. = Men of this kind are dangerous.", zh: "这种人很危险。" },
              { en: "The Olympic Games are held every four years.", zh: "奥运会每四年举行一次。" },
            ],
          },
          {
            type: "tip",
            text: "在非正式英语中，“there / here be + 并列主语”结构中的谓语动词可用复数形式。all kinds of 后跟复数名词，谓语动词用复数。",
          },
        ],
      },
      {
        heading: "七、常见错误（Common Mistakes）",
        blocks: [
          {
            type: "examples",
            items: [
              {
                en: "Common Mistakes 1: Not only I but also Mary and Jane ______ tired of having one examination after another. A. is B. are C. am D. be",
                zh: "不仅我，玛丽和简也厌倦了参加一个接一个的考试。答案 B。（not only…but also… 连接并列主语时用就近一致，谓语与邻近的主语 Mary and Jane 一致。）",
              },
              {
                en: "Common Mistakes 2: Nobody but you ______ what he said. A. agrees with B. agrees out C. agree with D. agree to",
                zh: "除了你没有人同意他所说的。答案 A。（主语为 nobody 时谓语用单数；被 but、as well as、with 等修饰时谓语仍与主语一致。）",
              },
              {
                en: "Common Mistakes 3: She is the only one among the ______ writers who ______ stories for children. A. woman; writes B. women; write C. women; writes D. woman; write",
                zh: "她是女作家中唯一一位给孩子们写故事的人。答案 C。（woman writer 的复数是 women writers；定语从句的谓语由 the only one 决定，用单数。）",
              },
              {
                en: "Common Mistakes 4: More than ______ of the workers ______ from Paris. A. ten percents; is B. ten percent; are C. three times; was D. percents ten; comes",
                zh: "超过百分之十的工人来自巴黎。答案 B。（“分数或百分数 + of + 名词”作主语时，谓语与 of 后的名词在数上保持一致。）",
              },
            ],
          },
        ],
      },
      {
        heading: "八、实力测验（原题摘录，答案未在图片中给出）",
        blocks: [
          {
            type: "list",
            items: [
              "一、用括号内所给词的正确形式填空 1. A: Why are your group so happy? B: Our group ______ (beat) theirs in the oral English competition.",
              "2. Not only I but also my classmates ______ (be) tired of this tedious speech.",
              "3. “News of victories ______ (keep) pouring in as our army advances,” the company commander said.",
              "4. Whether he'll come or not ______ (be) not known.",
              "5. E-mail, as well as telephones, ______ (play) an important part in daily communication.",
              "二、选择括号内的正确形式填空 1. Three fourths of the surface of the earth ______ (is, are, were) sea.",
              "2. Books of this kind ______ (sells, sell, is sold, are sold) well.",
              "3. He is the only one of the children who ______ (speak, speaks, is spoken) Italian in the class.",
              "4. The population of the city ______ (is, are) not large, but one third of the population here ______ (is, are) highly-educated citizens.",
              "5. Many a student ______ (has, have) bought the book, but only a few of them ______ (has, have) read it through.",
              "三、选择填空 1. Neither he nor I ______ interested in this story.（A. is B. am C. are D. be）",
              "2. Each of them ______ got a dictionary.（A. have B. has C. is having D. are having）",
              "3. Those who ______ playing basketball can join the basketball club.（A. likes B. are liking C. like D. is liking）",
              "4. The pictures that ______ drawn by the famous painter ______ been put up on the wall.（A. were; have B. were; has C. are; had D. is; have）",
              "5. The police ______ searching for the thief in the house.（A. is B. are C. has been D. was）",
              "6. The number of the students in our school ______ increasing.（A. is B. are C. has D. have）",
              "7. A: Using public chopsticks ______ necessary when eating with others. B: That's right.（A. is B. are C. was D. were）",
              "8. The wounded ______ been taken to the hospital already.（A. has B. were C. was D. have）",
              "9. His family ______ watching sports games on TV.（A. enjoy B. enjoys C. likes D. liked）",
              "10. Neither of the answers ______ right.（A. are B. seem C. seems D. look）",
              "11. Neither the students nor the teacher ______ the right answer.（A. know B. knows C. known D. to know）",
              "12. Mary with her grandparents often ______ her weekend in the country.（A. spend B. spends C. spent D. spending）",
              "13. His family now ______ in the country.（A. live B. living C. lived D. lives）",
              "14. Two hundred dollars ______ enough for the coat.（A. are B. is C. have D. seem）",
              "15. None ______ finished your homework. So you must go on with your homework after class.（A. has B. have C. had D. both A and B）",
              "16. All but one worker ______ here just now.（A. is B. was C. has been D. were）",
              "17. ______ of the land in the district ______ covered with trees and grass.（A. Two fifth; is B. Two fifth; are C. Two fifths; is D. Two fifths; are）",
              "18. A library with five thousand books ______ to the nation as a gift.（A. is offered B. has offered C. are offered D. have offered）",
              "19. When and where to build the new factory ______ yet.（A. has not been decided B. are not decided C. has not decided D. have not decided）",
              "20. Either you or the headmaster ______ the prizes to these good students at the meeting.（A. is handing out B. are to hand out C. are handing out D. is to hand out）",
              "21. Dr Smith, together with his wife and two sons, ______ arrive on the evening flight.（A. are to B. are going to C. is to D. will be）",
              "22. Running ______ a good way to exercise every day.（A. is B. was C. are D. were）",
              "23. The teacher, with 6 girls and 8 boys of her class, ______ visiting a museum when the earthquake struck.（A. was B. were C. had been D. would be）",
              "24. His family ______ not rich, but his family ______ all healthy.（A. are; is B. is; are C. is; is D. are; are）",
              "25. Ten years ______ since Mr Wang came here and began to work as an English teacher.（A. have passed B. has passed C. passed D. are passing）",
              "26. The United Nations ______ in 1945 to keep peace of the world.（A. founded B. were set up C. were founded D. was founded）",
              "27. Each boy and each girl ______ an active part in the sports meeting.（A. takes B. take C. is taken D. are taking）",
              "28. The rest of the water in that well ______.（A. are polluted B. pollutes C. is polluted D. polluted）",
              "29. One third of the students in her class ______ into key universities.（A. has been admitted B. have been admitted C. has admitted D. have admitted）",
              "30. Early to bed and early to rise ______ one healthy and wise.（A. make B. is making C. has made D. makes）",
              "31. Whether he comes or not ______.（A. matter much B. don't matter much C. matters not much D. doesn't matter much）",
              "32. The boys each ______ an orange. Each is very happy.（A. have B. has C. is given D. has received）",
              "33. This is one of the bridges that ______ in this city in the past three years.（A. has been built B. have been built C. were built D. was built）",
              "34. One pair of glasses ______ enough for this girl.（A. has not B. have not C. are not D. is not）",
              "35. My sister as well as I ______ in singing.（A. are interesting B. am interested C. is interested D. are interested）",
            ],
          },
        ],
      },
    ],
    notes: [
      "图片 微信图片_20260927174524_614_66.jpg 为第 22 章章首页（名人名言页），无语法正文，已记录其名言与译文。",
      "实力测验部分跨页（第 416、418、419 页），个别题目的选项在页边被裁切，已按可辨识内容转写；这些原题图片中未给出答案。",
      "以下图片内容清晰、可逐字转写：615—628。无完全不可识别的图片。",
    ],
  },
];
