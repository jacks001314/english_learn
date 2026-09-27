// 初中语法专题 · 讲解数据（外研版）
// 专题划分依据：义务教育英语课程标准语法项目 + 北京市中考单项填空考点分布。
// 教材对应关系来自 chuzhong/grammar.json（外研版七/八/九年级模块语法聚焦）与 chuzhong/catalog.json（模块标题）。
// 练习题见 exercises.js，均为北京市中考英语真题。

export const grammarTopics = [
  // ================= 词法 =================
  {
    id: "g-pronouns",
    title: "代词",
    short: "代词",
    category: "词法",
    difficulty: 1,
    summary: "用代词代替名词，避免重复。核心是分清「人称代词主格/宾格」和「形容词性/名词性物主代词」。",
    forms: [
      { name: "人称代词·主格", pattern: "I / you / he / she / it / we / they", note: "作句子主语。" },
      { name: "人称代词·宾格", pattern: "me / you / him / her / it / us / them", note: "作动词或介词的宾语。" },
      { name: "形容词性物主代词", pattern: "my / your / his / her / its / our / their + 名词", note: "后面必须跟名词。" },
      { name: "名词性物主代词", pattern: "mine / yours / his / hers / its / ours / theirs", note: "后面不再跟名词。" },
    ],
    points: [
      {
        title: "主格作主语，宾格作宾语",
        desc: "主语位置用主格；动词后面、介词后面用宾格。",
        good: ["My friends and I like sports. We often play basketball.", "Mr Wang is coming. I can't wait to see him."],
        bad: ["My friends and me like sports.", "I can't wait to see he."],
      },
      {
        title: "形容词性物主代词后必须接名词",
        desc: "表示“……的”，一定要带上被修饰的名词。",
        good: ["My sister enjoys singing and her favorite subject is music.", "This is my father."],
        bad: ["This book is her.（想说“这本书是她的”应用 hers）"],
      },
      {
        title: "名词性物主代词单独使用",
        desc: "its 没有名词性形式；his 的形容词性和名词性拼写相同。",
        good: ["That book is mine.", "This is our school; that one is theirs."],
        bad: ["That book is my."],
      },
    ],
    contrasts: [
      {
        title: "形容词性 vs 名词性物主代词",
        head: ["形容词性（+名词）", "名词性（独立使用）"],
        rows: [["my book", "mine"], ["your pen", "yours"], ["her bag", "hers"], ["their room", "theirs"]],
      },
    ],
    pitfalls: [
      "并列主语中 I 要放在后面：My friends and I（不是 I and my friends）。",
      "its 与 it's 要区分：its 是“它的”，it's = it is。",
      "反身代词 oneself 不能代替主格宾语：He hurt himself.",
    ],
    examTips: ["北京中考单项填空几乎每年 1 题，主要考形容词性物主代词和主格，靠“看主语、看后面有没有名词”两步即可判断。"],
    memoryCard: ["主格作主，宾格作宾。", "物主代词：有名词用形容词性，没名词用名词性。"],
    textbookLinks: [
      { book: "七年级上册", section: "Unit 1", title: "A new start" },
      { book: "九年级下册", section: "Module 2", title: "Education" },
    ],
  },
  {
    id: "g-prepositions",
    title: "介词（时间与地点）",
    short: "介词",
    category: "词法",
    difficulty: 2,
    summary: "介词是中考必考小词。重点是时间介词 at / on / in 的分工，以及常见固定搭配。",
    forms: [
      { name: "时间介词", pattern: "at + 时间点 / on + 具体某天 / in + 月份、年份、季节、泛指早中晚", note: "口诀：点用 at，天用 on，月年季节用 in。" },
      { name: "地点介词", pattern: "at + 小地点 / in + 大地点、内部 / on + 表面", note: "at the bus stop, in Beijing, on the wall" },
      { name: "其他高频", pattern: "by + 交通工具；with + 工具/人；for + 目的", note: "by high-speed train, with a pen" },
    ],
    points: [
      {
        title: "at 用于时间点",
        desc: "具体钟点、中午、夜晚等。",
        good: ["We have history class at three o'clock.", "at noon / at night"],
        bad: ["We have history class on three o'clock."],
      },
      {
        title: "on 用于具体某天",
        desc: "星期、日期、具体某天的早中晚。",
        good: ["The Chang'e-6 landed on June 2, 2024.", "on Monday / on Monday morning"],
        bad: ["on October（月份不具体到某天）"],
      },
      {
        title: "in 用于月份、年份、季节",
        desc: "范围较大或泛指的时间段。",
        good: ["It's a good idea to visit Beijing in October.", "in 2024 / in summer / in the morning"],
        bad: ["visit Beijing on October"],
      },
    ],
    contrasts: [
      {
        title: "at / on / in 速查",
        head: ["介词", "接什么", "例子"],
        rows: [["at", "时间点、小地点", "at 7:00, at the door"], ["on", "具体某天、星期、表面", "on June 2, on Monday, on the wall"], ["in", "月份/年份/季节/大地点", "in October, in Beijing"]],
      },
    ],
    pitfalls: [
      "有修饰语就升级：in the morning → on Monday morning（因为具体到某天）。",
      "by + 交通工具用单数、不加冠词：by bus / by high-speed train。",
      "arrive in + 大地点，arrive at + 小地点。",
    ],
    examTips: ["北京中考单项填空每年 1 题，几乎只考时间介词 at/on/in，先看空后是“点、天还是月年”。"],
    memoryCard: ["点 at，天 on，月年季节 in。", "具体到某天的早中晚，也改用 on。"],
    textbookLinks: [],
    spreadNote: "介词在教材中随话题分散出现，未作为单一模块的语法聚焦；中考则每年固定考查。",
  },
  {
    id: "g-adj-adv",
    title: "形容词与副词（比较级、最高级）",
    short: "比较等级",
    category: "词法",
    difficulty: 3,
    summary: "两者比较用比较级，三者及以上用最高级。北京中考常考 than、one of the + 最高级等标志。",
    forms: [
      { name: "比较级", pattern: "A + 动词 + 比较级 + than + B", note: "than 是比较级最明显的标志。" },
      { name: "最高级", pattern: "A + 动词 + the + 最高级 + in/of 范围", note: "范围用 in + 地点/集体，of + 复数。" },
      { name: "one of 结构", pattern: "one of the + 最高级 + 复数名词", note: "意为“最……之一”，名词必须复数。" },
      { name: "同级比较", pattern: "as + 原级 + as", note: "否定为 not as/so ... as。" },
    ],
    points: [
      {
        title: "两者比较用比较级",
        desc: "选项中同时出现两个比较对象，或有 than 时，用比较级。",
        good: ["After taking tennis classes, Tim is much stronger than last year.", "Which do you like better, swimming or skating?"],
        bad: ["Tim is much strongest than last year."],
      },
      {
        title: "三者及以上用最高级",
        desc: "最高级前通常加 the。",
        good: ["It's one of the nicest reading rooms in our school.", "He is the best player in our team."],
        bad: ["It's one of nicest rooms.", "He is best player in our team."],
      },
      {
        title: "程度副词修饰比较级",
        desc: "much / far / a lot / even / a little 可修饰比较级，但不能修饰原级。",
        good: ["much stronger", "a little taller"],
        bad: ["very stronger"],
      },
    ],
    contrasts: [
      {
        title: "比较级 vs 最高级",
        head: ["用法", "结构", "例子"],
        rows: [["两者比较", "比较级 + than", "taller than"], ["三者及以上", "the + 最高级 + in/of", "the tallest in his class"], ["最……之一", "one of the + 最高级 + 复数", "one of the nicest rooms"]],
      },
    ],
    pitfalls: [
      "不规则变化要背：good/well → better → best；bad/badly → worse → worst；many/much → more → most；little → less → least；far → farther/further → farthest/furthest。",
      "one of 后面的名词必须是复数。",
      "比较级前不加 the（除非表示“两者中较……的那个”）。",
    ],
    examTips: ["北京中考每年 1 题，快速判断：看到 than 或“两者”选比较级；看到 one of / in + 范围选最高级。"],
    memoryCard: ["两者 than，三者 the。", "one of the 后面跟复数。"],
    textbookLinks: [
      { book: "七年级下册", section: "Unit 3", title: "Food matters" },
      { book: "八年级上册", section: "Module 2", title: "My home town and my country" },
      { book: "八年级上册", section: "Module 3", title: "Sports" },
      { book: "八年级上册", section: "Module 4", title: "Planes, ships and trains" },
      { book: "九年级下册", section: "Module 3", title: "Life now and then" },
    ],
  },
  {
    id: "g-conjunctions",
    title: "连词",
    short: "连词",
    category: "词法",
    difficulty: 2,
    summary: "用连词连接分句，判断前后是并列、转折、因果还是选择关系。",
    forms: [
      { name: "并列", pattern: "and", note: "前后一致、递进。" },
      { name: "转折", pattern: "but", note: "前后相反、出乎意料。" },
      { name: "因果", pattern: "so（因此）/ because（因为）", note: "so 后接结果，because 后接原因。" },
      { name: "选择/否则", pattern: "or", note: "或者；否则。" },
    ],
    points: [
      {
        title: "but 表转折",
        desc: "前后意思相反时用 but。",
        good: ["It was difficult to climb the mountain, but Sam got to the top at last.", "I'd love to, but I have to finish my project first."],
        bad: ["It was difficult, so Sam got to the top at last.（语义相反，应用 but）"],
      },
      {
        title: "so 表结果",
        desc: "前面是原因，后面是结果。",
        good: ["Mr. Smith has helped me a lot, so I'm thankful to him."],
        bad: ["Mr. Smith has helped me a lot, but I'm thankful to him."],
      },
      {
        title: "or 表选择或否定并列",
        desc: "祈使句 + or 表示“否则”。",
        good: ["Wash your hands before meals, or you may get ill."],
        bad: [],
      },
    ],
    contrasts: [
      {
        title: "so 与 because",
        head: ["连词", "连接内容", "例子"],
        rows: [["so", "原因 + so + 结果", "It rained, so we stayed at home."], ["because", "结果 + because + 原因", "We stayed at home because it rained."]],
      },
    ],
    pitfalls: ["so 和 because 不能同时出现在一个句子里。", "though/although 与 but 也不同时使用。"],
    examTips: ["每年 1 题，先判断空前后两句话是“一致/相反/因果/选择”，再选词。"],
    memoryCard: ["and 顺，but 转，so 果，or 选。"],
    textbookLinks: [
      { book: "九年级上册", section: "Module 3", title: "Heroes" },
      { book: "九年级上册", section: "Module 4", title: "Home alone" },
    ],
  },

  // ================= 动词 =================
  {
    id: "g-modal-verbs",
    title: "情态动词",
    short: "情态动词",
    category: "动词",
    difficulty: 3,
    summary: "情态动词后接动词原形，用来表达能力、许可、必须、建议和推测。must 的否定回答是考点。",
    forms: [
      { name: "能力/许可", pattern: "can / could + 动词原形", note: "can 表能力，也可表请求许可。" },
      { name: "必须/禁止", pattern: "must / mustn't + 动词原形", note: "must 必须；mustn't 禁止。" },
      { name: "不必", pattern: "needn't / don't have to", note: "must 问句的否定回答用 needn't。" },
      { name: "建议/推测", pattern: "should / may / might + 动词原形", note: "should 应该；may/might 可能。" },
    ],
    points: [
      {
        title: "can 表请求许可",
        desc: "请求别人允许时用 can/could，答语也用 can。",
        good: ["—Can I take photos here? —Sorry, you can't.", "—Bill, can I use your ruler? —Of course you can."],
        bad: ["—Can I use your ruler? —Of course you must."],
      },
      {
        title: "must 问句的否定回答用 needn't",
        desc: "must 提问时，肯定回答用 must，否定回答用 needn't（不必），不用 mustn't（禁止）。",
        good: ["—Must I stay here? —No, you needn't.", "—Must I finish it today? —Yes, you must."],
        bad: ["—Must I stay here? —No, you mustn't."],
      },
      {
        title: "should 表建议",
        desc: "提出建议时用 should。",
        good: ["You should practise speaking aloud.", "You should bring a rope."],
        bad: [],
      },
    ],
    contrasts: [
      {
        title: "mustn't vs needn't",
        head: ["形式", "含义", "例子"],
        rows: [["mustn't", "禁止、不许", "You mustn't cross the rope."], ["needn't", "不必", "You needn't come so early."]],
      },
    ],
    pitfalls: ["情态动词后一定跟动词原形，不能加 -s 或 -ed。", "must 也可表肯定推测：He must be at home.（他一定在家）"],
    examTips: ["每年 1 题，出现 Must I...? 的否定回答优先选 needn't；出现请求许可优先选 can。"],
    memoryCard: ["必须 must，禁止 mustn't，不必 needn't。", "情态动词后跟原形。"],
    textbookLinks: [
      { book: "七年级上册", section: "Unit 2", title: "More than fun" },
      { book: "七年级下册", section: "Unit 4", title: "The art of having fun" },
      { book: "八年级上册", section: "Module 10", title: "The weather" },
      { book: "八年级上册", section: "Module 11", title: "Way of life" },
      { book: "九年级下册", section: "Module 4", title: "Rules and suggestions" },
    ],
  },
  {
    id: "g-present-simple",
    title: "一般现在时",
    short: "一般现在时",
    category: "动词",
    difficulty: 1,
    summary: "表示习惯、经常发生的动作或客观事实；时间标志是 every day / every year / usually 等。",
    forms: [
      { name: "肯定", pattern: "主语 + 动词原形 / 第三人称单数 + -s(-es)", note: "He plays. They travel." },
      { name: "否定", pattern: "主语 + don't / doesn't + 动词原形", note: "" },
      { name: "疑问", pattern: "Do / Does + 主语 + 动词原形?", note: "" },
    ],
    points: [
      {
        title: "表示经常性、习惯性动作",
        desc: "常与 every day/year、usually、often、sometimes 连用。",
        good: ["A lot of people in China travel by high-speed train every year.", "I usually make breakfast for my family on Saturdays."],
        bad: ["A lot of people travel by high-speed train last year."],
      },
      {
        title: "第三人称单数变化",
        desc: "主语是 he/she/it 或单数名词时，动词加 -s/-es。",
        good: ["Sam skates with his friends every weekend.", "He plays the guitar every day."],
        bad: ["Sam skate with his friends every weekend."],
      },
      {
        title: "表示客观事实与真理",
        desc: "描述不受时间限制的事实。",
        good: ["Plants make their own food.", "The sun rises in the east."],
        bad: [],
      },
    ],
    contrasts: [
      {
        title: "一般现在时 vs 现在进行时",
        head: ["时态", "含义", "标志词"],
        rows: [["一般现在时", "习惯、事实", "every day, usually, often"], ["现在进行时", "此刻正在进行", "now, look, listen"]],
      },
    ],
    pitfalls: ["第三人称单数别丢 -s：He plays, She enjoys。", "助动词 does/don't 后面用动词原形。"],
    examTips: ["看到 every year / usually 优先考虑一般现在时；注意主语是不是第三人称单数。"],
    memoryCard: ["习惯事实用一般现在。", "三单动词加 -s。"],
    textbookLinks: [
      { book: "七年级上册", section: "Unit 2", title: "More than fun" },
      { book: "七年级下册", section: "Unit 5", title: "Amazing nature" },
    ],
  },
  {
    id: "g-present-continuous",
    title: "现在进行时",
    short: "现在进行时",
    category: "动词",
    difficulty: 2,
    summary: "表示此刻或现阶段正在进行的动作，结构是 be + 动词 -ing，常与 now / look / listen 连用。",
    forms: [
      { name: "肯定", pattern: "am / is / are + 动词 -ing", note: "I am reading. She is running." },
      { name: "否定", pattern: "am / is / are + not + 动词 -ing", note: "" },
      { name: "疑问", pattern: "Am / Is / Are + 主语 + 动词 -ing?", note: "" },
    ],
    points: [
      {
        title: "now 提示正在发生",
        desc: "看到 now 通常用现在进行时。",
        good: ["The workers are cleaning the community center now.", "My little brother is playing with his toy car now."],
        bad: ["The workers clean the community center now."],
      },
      {
        title: "问句与答语时态一致",
        desc: "What are you doing? 的答语也用现在进行时。",
        good: ["—Lucy, what are you doing? —I am making a model ship."],
        bad: ["—What are you doing? —I make a model ship."],
      },
      {
        title: "-ing 的变化规则",
        desc: "一般直接加 -ing；以不发音 e 结尾去 e；重读闭音节双写末尾字母。",
        good: ["reading, making, running, sitting"],
        bad: ["makeing, runing"],
      },
    ],
    contrasts: [
      {
        title: "一般现在时 vs 现在进行时",
        head: ["对比", "一般现在时", "现在进行时"],
        rows: [["含义", "经常发生", "正在发生"], ["标志", "every day, usually", "now, look, listen"], ["例子", "He plays football.", "He is playing football."]],
      },
    ],
    pitfalls: ["be 动词不能丢：He is running（不是 He running）。", "like / want / know 等状态动词一般不用进行时。"],
    examTips: ["北京中考常以 now 或对话形式考查，注意问句时态与答语一致。"],
    memoryCard: ["正在发生 be + doing。", "看到 now 想到进行时。"],
    textbookLinks: [
      { book: "七年级上册", section: "Unit 6", title: "Fantastic friends" },
      { book: "七年级下册", section: "Unit 4", title: "The art of having fun" },
    ],
  },
  {
    id: "g-past-simple",
    title: "一般过去时",
    short: "一般过去时",
    category: "动词",
    difficulty: 2,
    summary: "表示过去某个时间发生并结束的动作，常与 yesterday / last Saturday / on June 4, 2023 等过去时间连用。",
    forms: [
      { name: "肯定", pattern: "主语 + 动词过去式", note: "went, returned, landed" },
      { name: "否定", pattern: "主语 + didn't + 动词原形", note: "I didn't hear the ring." },
      { name: "疑问", pattern: "Did + 主语 + 动词原形?", note: "What did you do last Saturday?" },
    ],
    points: [
      {
        title: "明确的过去时间是标志",
        desc: "yesterday、last week、in 2023、on June 4, 2023 等都提示一般过去时。",
        good: ["The Shenzhou-15 astronauts returned to Earth safely on June 4, 2023.", "I went to the nursing home and worked as a volunteer there."],
        bad: ["The astronauts return to Earth safely on June 4, 2023."],
      },
      {
        title: "答语与问句时态一致",
        desc: "问句用 did，答语也用过去式。",
        good: ["—What did you do last Saturday? —I went to the nursing home."],
        bad: ["—What did you do last Saturday? —I go to the nursing home."],
      },
      {
        title: "不规则动词要记忆",
        desc: "go→went, see→saw, take→took, eat→ate, is→was, are→were。",
        good: ["We ate zongzi and watched a dragon boat race."],
        bad: [],
      },
    ],
    pitfalls: ["didn't 后面用动词原形，不能用过去式。", "一般过去时只说明动作发生过，不强调对现在的影响。"],
    examTips: ["看到具体过去时间（last…, yesterday, in 2023）直接选一般过去时。"],
    memoryCard: ["过去时间过去式。", "did/didn't 后接原形。"],
    textbookLinks: [
      { book: "九年级上册", section: "Module 1", title: "Wonders of the world" },
    ],
  },
  {
    id: "g-past-continuous",
    title: "过去进行时",
    short: "过去进行时",
    category: "动词",
    difficulty: 3,
    summary: "表示过去某一时刻或某段时间正在进行的动作，结构是 was/were + 动词 -ing。",
    forms: [
      { name: "肯定", pattern: "was / were + 动词 -ing", note: "I was reading. They were playing." },
      { name: "否定", pattern: "was / were + not + 动词 -ing", note: "" },
      { name: "疑问", pattern: "Was / Were + 主语 + 动词 -ing?", note: "What were you doing?" },
    ],
    points: [
      {
        title: "描述过去某时正在做的事",
        desc: "常与 at that time、yesterday evening、when 从句连用。",
        good: ["I was thinking about my sister when my phone rang.", "I was reading a book in my study."],
        bad: ["I read a book in my study when he called."],
      },
      {
        title: "when 引导的从句用一般过去时",
        desc: "when 引出突然发生的动作，主句用过去进行时表示背景动作。",
        good: ["While I was riding, a car appeared.", "I was trying to pick it up when it bit me."],
        bad: [],
      },
      {
        title: "while 引导持续动作",
        desc: "while 后常接过去进行时。",
        good: ["While I was riding, a car appeared."],
        bad: [],
      },
    ],
    contrasts: [
      {
        title: "一般过去时 vs 过去进行时",
        head: ["时态", "含义", "例子"],
        rows: [["一般过去时", "动作发生并结束", "I read a book last night."], ["过去进行时", "当时正在进行", "I was reading at 8 p.m. last night."]],
      },
    ],
    pitfalls: ["was/were 要与主语一致：I/he/she/it 用 was，you/we/they 用 were。", "when 与 while 的搭配：while + 进行时，when + 一般过去时。"],
    examTips: ["北京中考用对话或 when 从句考查，注意“背景动作”用过去进行时。"],
    memoryCard: ["过去某时正在做：was/were + doing。", "when 打断，while 持续。"],
    textbookLinks: [
      { book: "八年级上册", section: "Module 7", title: "A famous story" },
      { book: "八年级上册", section: "Module 8", title: "Accidents" },
    ],
  },
  {
    id: "g-present-perfect",
    title: "现在完成时",
    short: "现在完成时",
    category: "动词",
    difficulty: 4,
    summary: "表示过去发生的动作对现在造成影响，或从过去持续到现在。结构是 have/has + 过去分词。",
    forms: [
      { name: "肯定", pattern: "have / has + 过去分词", note: "I have made progress." },
      { name: "否定", pattern: "haven't / hasn't + 过去分词", note: "They haven't arrived yet." },
      { name: "疑问", pattern: "Have / Has + 主语 + 过去分词?", note: "Have you ever seen a tower?" },
    ],
    points: [
      {
        title: "since 表示“自从”",
        desc: "since + 时间点/过去时从句，主句用现在完成时。",
        good: ["Jim has learned a lot about Chinese culture since he began to study in our school.", "I have felt ill since Monday."],
        bad: ["Jim learned a lot since he began to study in our school."],
      },
      {
        title: "for 表示“持续多久”",
        desc: "for + 时间段。",
        good: ["We have played football for a year.", "I have been ill for a week."],
        bad: [],
      },
      {
        title: "already / yet / just / ever / never",
        desc: "already、just 用于肯定句；yet 用于否定句和疑问句；ever、never 表示经历。",
        good: ["We have already started the project.", "They haven't arrived yet.", "She has never been abroad."],
        bad: [],
      },
    ],
    contrasts: [
      {
        title: "现在完成时 vs 一般过去时",
        head: ["时态", "强调", "标志词"],
        rows: [["现在完成时", "对现在的影响/持续到现在", "since, for, already, yet, ever, never"], ["一般过去时", "过去发生并结束", "yesterday, last week, in 2023"]],
      },
    ],
    pitfalls: ["不能与明确的过去时间连用：× I have finished it yesterday。", "have/has 要与主语一致。", "过去分词要背：make→made, learn→learned/learnt, see→seen, be→been。"],
    examTips: ["北京中考每年 1 题，看到 since / for（+ 时间段）/ since 从句，直接锁定现在完成时。"],
    memoryCard: ["have/has + 过去分词。", "since 记时间点，for 记时间段。"],
    textbookLinks: [
      { book: "八年级下册", section: "Module 2", title: "Experiences" },
      { book: "八年级下册", section: "Module 3", title: "Journey to space" },
      { book: "八年级下册", section: "Module 4", title: "Seeing the doctor" },
      { book: "八年级下册", section: "Module 5", title: "Cartoon stories" },
    ],
  },
  {
    id: "g-passive-voice",
    title: "被动语态",
    short: "被动语态",
    category: "动词",
    difficulty: 4,
    summary: "主语是动作的承受者时用被动语态，结构是 be + 过去分词。初中重点是一般现在时和一般过去时的被动。",
    forms: [
      { name: "一般现在时被动", pattern: "am / is / are + 过去分词", note: "Chinese is spoken by more and more people." },
      { name: "一般过去时被动", pattern: "was / were + 过去分词", note: "The kite was invented in China." },
      { name: "一般将来时被动", pattern: "will be + 过去分词", note: "The game will be held here." },
      { name: "含情态动词被动", pattern: "can / must be + 过去分词", note: "Books will be replaced by the Internet?" },
    ],
    points: [
      {
        title: "主语是动作承受者",
        desc: "判断主语和动词是“被动关系”时用被动语态，常用 by 引出执行者。",
        good: ["Chinese is spoken by more and more people around the world these days.", "The tea leaves are picked by hand."],
        bad: ["Chinese speaks by more and more people."],
      },
      {
        title: "时态由 be 体现",
        desc: "过去分词不变，时态通过 be 的变化表示。",
        good: ["The flowers are planted every year.（一般现在）", "The kite was invented in China.（一般过去）"],
        bad: ["The flowers are plant every year."],
      },
      {
        title: "主动变被动的步骤",
        desc: "宾语提前作主语 → 动词变 be + 过去分词 → 原主语用 by 引出。",
        good: ["People speak English. → English is spoken by people."],
        bad: [],
      },
    ],
    contrasts: [
      {
        title: "主动 vs 被动",
        head: ["语态", "主语", "例子"],
        rows: [["主动语态", "动作执行者", "Many people speak Chinese."], ["被动语态", "动作承受者", "Chinese is spoken by many people."]],
      },
    ],
    pitfalls: ["be 动词不能丢，过去分词不能写成原形。", "happen、appear 等不及物动词没有被动语态。", "by 引出执行者，with 引出工具。"],
    examTips: ["每年 1 题：先看主语是“人还是物”，物作主语且动作由人发出，基本就是被动。"],
    memoryCard: ["被动 = be + 过去分词。", "时态看 be，动词用分词。"],
    textbookLinks: [
      { book: "九年级上册", section: "Module 7", title: "Great books" },
      { book: "九年级上册", section: "Module 8", title: "Sports life" },
      { book: "九年级上册", section: "Module 9", title: "Great inventions" },
      { book: "九年级下册", section: "Module 6", title: "Eating together" },
    ],
  },

  // ================= 句法 =================
  {
    id: "g-questions",
    title: "疑问句与疑问词",
    short: "疑问词",
    category: "句法",
    difficulty: 2,
    summary: "特殊疑问句用疑问词开头。重点是 how 词组的辨析：how long / how often / how soon / how much。",
    forms: [
      { name: "问时长", pattern: "How long ...? —— For + 时间段", note: "How long will Liu Yang stay? For six months." },
      { name: "问频率", pattern: "How often ...? —— Twice a week 等", note: "How often do you tidy your room?" },
      { name: "问多久以后", pattern: "How soon ...? —— In + 时间段", note: "How soon will he come? In two days." },
      { name: "问价格/不可数数量", pattern: "How much ...?", note: "How much is this T-shirt?" },
      { name: "问地点/原因/时间", pattern: "Where / Why / When ...?", note: "Where did you buy it?" },
    ],
    points: [
      {
        title: "how long 问一段时间",
        desc: "答语通常是 for + 时间段或 since 从句。",
        good: ["—How long will Liu Yang stay in the space station? —For six months."],
        bad: ["—How often will he stay? —For six months."],
      },
      {
        title: "how often 问频率",
        desc: "答语是次数/频率（once a week, twice a month）。",
        good: ["—How often do you tidy your own room? —Twice a week."],
        bad: [],
      },
      {
        title: "how soon 问“多久以后”",
        desc: "答语通常是 in + 时间段。",
        good: ["—How soon will the meeting begin? —In ten minutes."],
        bad: [],
      },
    ],
    contrasts: [
      {
        title: "how 词组速查",
        head: ["疑问词", "提问内容", "典型答语"],
        rows: [["How long", "时长", "For six months."], ["How often", "频率", "Twice a week."], ["How soon", "多久以后", "In two days."], ["How much", "价格/不可数数量", "88 yuan."], ["How many", "可数数量", "Three."]],
      },
    ],
    pitfalls: ["how long 与 how soon 都带“多久”，但答语不同：for 用 long，in 用 soon。", "疑问句语序为“疑问词 + 助动词 + 主语 + 动词”。"],
    examTips: ["每年 1 题，看到答语立刻反推：For… → How long；Twice… → How often；In… → How soon；地点 → Where。"],
    memoryCard: ["for 配 long，in 配 soon，次数配 often。"],
    textbookLinks: [],
    spreadNote: "疑问词在教材中随对话分散出现；北京中考每年固定 1 题。",
  },

  // ================= 复合句 =================
  {
    id: "g-if-clause",
    title: "if 条件状语从句",
    short: "if 条件句",
    category: "复合句",
    difficulty: 3,
    summary: "if 引导真实条件句时遵循“主将从现”：主句用一般将来时，if 从句用一般现在时。",
    forms: [
      { name: "主将从现", pattern: "If + 主语 + 一般现在时, 主语 + will + 动词原形", note: "If you go with us, you will have a good time." },
      { name: "祈使句主句", pattern: "If + 一般现在时, 祈使句", note: "If you go to London, visit the museum." },
    ],
    points: [
      {
        title: "主句用一般将来时",
        desc: "if 从句用一般现在时表示将来，主句用 will + 动词原形。",
        good: ["If you keep working hard, you will succeed some day.", "If you go to the concert with us tomorrow, you will have a great time there."],
        bad: ["If you will keep working hard, you will succeed.", "If you keep working hard, you succeed some day."],
      },
      {
        title: "主句也可用祈使句或含情态动词",
        desc: "表示提醒、建议时。",
        good: ["If you go to London, visit the museum.", "If you finish first, you can go out."],
        bad: [],
      },
    ],
    contrasts: [
      {
        title: "if 从句 vs 主句",
        head: ["位置", "时态", "例子"],
        rows: [["if 从句", "一般现在时", "If you go..."], ["主句", "一般将来时 will", "...you will have a great time."]],
      },
    ],
    pitfalls: ["if 从句中不能用 will：× If you will go...。", "if 也可表示“是否”，引导宾语从句，此时时态按需要变化。"],
    examTips: ["北京中考每 1–2 题，看到 if + 一般现在时，主句直接选 will。"],
    memoryCard: ["if 从句现在时，主句将来时。", "主将从现。"],
    textbookLinks: [
      { book: "九年级上册", section: "Module 5", title: "Museums" },
      { book: "九年级上册", section: "Module 6", title: "Problems" },
    ],
  },
  {
    id: "g-object-clause",
    title: "宾语从句",
    short: "宾语从句",
    category: "复合句",
    difficulty: 4,
    summary: "宾语从句在句中作宾语，用陈述语序，连接词有 that、if/whether 和特殊疑问词。北京中考几乎每年 1 题。",
    forms: [
      { name: "that 引导", pattern: "主句 + that + 陈述句", note: "that 可省略。" },
      { name: "if / whether 引导", pattern: "主句 + if/whether + 陈述语序", note: "表示“是否”。" },
      { name: "特殊疑问词引导", pattern: "主句 + 疑问词 + 陈述语序", note: "语序是关键考点。" },
    ],
    points: [
      {
        title: "宾语从句必须用陈述语序",
        desc: "疑问词后接“主语 + 谓语”，不能倒装。",
        good: ["Do you know why China set up the new national park?", "Can you tell me what you did during the Dragon Boat Festival?"],
        bad: ["Do you know why did China set up the new national park?", "Can you tell me what did you do?"],
      },
      {
        title: "时态与主句呼应",
        desc: "主句是现在时，从句按实际需要选时态；主句是过去时，从句通常用相应过去时态。",
        good: ["Do you know when we will hold the art festival?", "She said that the show was on air."],
        bad: ["Do you know when will we hold the art festival?"],
      },
      {
        title: "连接词的选择",
        desc: "答语说明原因用 why，说明时间用 when，说明内容用 what。",
        good: ["—Do you know why China set up the park? —To protect wildlife."],
        bad: [],
      },
    ],
    contrasts: [
      {
        title: "疑问句 vs 宾语从句语序",
        head: ["类型", "语序", "例子"],
        rows: [["特殊疑问句", "疑问词 + 助动词 + 主语", "What did you do?"], ["宾语从句", "疑问词 + 主语 + 谓语", "...what you did."]],
      },
    ],
    pitfalls: ["从句语序不倒装是最高频失分点。", "主句是过去时，从句时态要相应后退。", "whether 与 if 在句首或介词后只能用 whether。"],
    examTips: ["每年 1 题：先排除倒装选项，再根据答语判断时态和连接词。"],
    memoryCard: ["宾语从句用陈述语序。", "先排序，再定时态。"],
    textbookLinks: [
      { book: "八年级下册", section: "Module 8", title: "Time off" },
      { book: "八年级下册", section: "Module 9", title: "Friendship" },
      { book: "八年级下册", section: "Module 10", title: "On the radio" },
      { book: "九年级下册", section: "Module 7", title: "English for you and me" },
    ],
  },

  // ===== 以下专题北京中考单项填空不直接考查，内容依据教材语法项目 + 教材例句 + 自编练习 =====
  {
    id: "g-nouns",
    title: "名词与主谓一致",
    short: "名词",
    category: "词法",
    difficulty: 3,
    summary: "名词分可数与不可数，复数变化有规则；谓语动词的数要与主语保持一致。",
    forms: [
      { name: "可数名词复数", pattern: "一般加 -s；以 s/x/ch/sh 结尾加 -es；辅音字母 + y 变 y 为 i 再加 -es", note: "books, boxes, watches, cities" },
      { name: "不规则复数", pattern: "man→men, child→children, foot→feet, tooth→teeth, sheep→sheep", note: "单复数同形：sheep, deer, fish" },
      { name: "不可数名词", pattern: "news, milk, water, information, advice 等无复数形式", note: "谓语用单数。" },
      { name: "主谓一致", pattern: "each/every/everyone + 单数谓语；the number of + 复数名词 + 单数谓语", note: "就近原则用于 there be。" },
    ],
    points: [
      {
        title: "不可数名词没有复数",
        desc: "news、information、advice、milk 等作主语时谓语用单数。",
        good: ["The news is very exciting.", "There is no milk in the fridge."],
        bad: ["The news are very exciting.", "I have some advices for you."],
      },
      {
        title: "单复数同形的名词",
        desc: "sheep、deer、fish 等单复数形同，靠数量词或上下文判断。",
        good: ["There are many sheep on the farm.", "How many lanterns are there?"],
        bad: ["There are many sheeps on the farm."],
      },
      {
        title: "each / every 作主语用单数",
        desc: "each of + 复数名词、everyone、every + 单数名词作主语，谓语用单数。",
        good: ["Each of the students has a dictionary.", "Everyone likes the new teacher."],
        bad: ["Each of the students have a dictionary."],
      },
    ],
    contrasts: [
      {
        title: "易混不可数名词",
        head: ["可数", "不可数"],
        rows: [["a suggestion（建议）", "advice"], ["an item of news", "news"], ["a piece of furniture", "furniture"], ["a piece of information", "information"]],
      },
    ],
    pitfalls: ["news 是“不可数名词”，谓语用单数。", "the number of（……的数量）用单数谓语；a number of（许多）用复数谓语。", "people 作“人”讲时是复数，谓语用复数。"],
    examTips: ["中考主要通过与主谓一致结合的题型考查：先定名词单复数，再看谓语用 is 还是 are。"],
    memoryCard: ["news、advice、information 永远单数。", "each / every 作主语，谓语用单数。"],
    textbookLinks: [
      { book: "七年级上册", section: "Unit 4", title: "Time to celebrate" },
      { book: "九年级下册", section: "Module 1", title: "Travel" },
    ],
    textbookExamples: [
      { en: "I have some dumplings.", zh: "我有一些饺子。", source: "外研版七年级上册 Unit 4" },
      { en: "There is no milk in the fridge.", zh: "冰箱里没有牛奶。", source: "外研版七年级上册 Unit 4" },
      { en: "How many lanterns are there?", zh: "那里有多少个灯笼？", source: "外研版七年级上册 Unit 4" },
      { en: "We took a flight by plane.", zh: "我们乘飞机旅行。", source: "外研版九年级下册 Module 1" },
    ],
  },
  {
    id: "g-articles",
    title: "冠词",
    short: "冠词",
    category: "词法",
    difficulty: 2,
    summary: "冠词放在名词前，用 a/an 表示泛指、the 表示特指。判断依据是发音，不是拼写。",
    forms: [
      { name: "不定冠词 a", pattern: "a + 辅音音素开头的词", note: "a book, a university, a useful tool" },
      { name: "不定冠词 an", pattern: "an + 元音音素开头的词", note: "an apple, an hour, an honest boy" },
      { name: "定冠词 the", pattern: "特指、上文提过、独一无二、乐器、最高级前", note: "the sun, play the piano, the tallest" },
      { name: "零冠词", pattern: "球类运动、三餐、学科、球员前不加冠词", note: "play football, have breakfast" },
    ],
    points: [
      {
        title: "看读音而不是看字母",
        desc: "以元音音素开头用 an，即使首字母是辅音字母；反之用 a。",
        good: ["an engineer（元音音素 /e/）", "a university（辅音音素 /j/）", "an hour（h 不发音）"],
        bad: ["a engineer", "an university"],
      },
      {
        title: "特指用 the",
        desc: "第二次提到、被定语从句或短语限定、双方都知道的事物用 the。",
        good: ["This is the book I told you about.", "The Great Wall was built long ago."],
        bad: ["This is a book I told you about."],
      },
      {
        title: "固定搭配",
        desc: "乐器前加 the，球类运动前不加冠词。",
        good: ["He plays the piano very well.", "She plays basketball every day."],
        bad: ["He plays piano.", "She plays the basketball."],
      },
    ],
    contrasts: [
      {
        title: "a / an / the 速判",
        head: ["形式", "用法", "例子"],
        rows: [["a/an", "泛指“一个”", "a pen, an apple"], ["the", "特指、独一无二、乐器", "the sun, play the guitar"], ["零冠词", "球类、三餐、学科", "play football, have lunch"]],
      },
    ],
    pitfalls: ["university、useful、European 虽以元音字母开头，但读音以辅音音素开头，用 a。", "hour、honest 的 h 不发音，用 an。", "球类运动前不能加 the。"],
    examTips: ["中考常在完形与语篇题中考查。先读单词的音，再决定 a/an；判断是否特指决定用不用 the。"],
    memoryCard: ["a 辅音音素，an 元音音素。", "球类不加 the，乐器要加 the。"],
    textbookLinks: [
      { book: "九年级下册", section: "Module 1", title: "Travel" },
    ],
    textbookExamples: [
      { en: "We took a flight by plane.", zh: "我们乘飞机飞行。", source: "外研版九年级下册 Module 1" },
      { en: "The pilot landed at the airport.", zh: "飞行员在机场着陆。", source: "外研版九年级下册 Module 1" },
    ],
  },
  {
    id: "g-numerals",
    title: "数词",
    short: "数词",
    category: "词法",
    difficulty: 3,
    summary: "基数词表示数量，序数词表示顺序。重点是 hundred/thousand/million 的用法和分数表达。",
    forms: [
      { name: "基数词", pattern: "one, two, twenty-one, one hundred", note: "表示数量。" },
      { name: "序数词", pattern: "first, second, third, fourth, twentieth", note: "表示顺序，前常加 the。" },
      { name: "概数", pattern: "hundreds of / thousands of / millions of", note: "表示“数百/数千/数百万”，加 -s 并接 of。" },
      { name: "分数", pattern: "分子用基数词，分母用序数词；分子大于 1 时分母加 -s", note: "two thirds（2/3）" },
    ],
    points: [
      {
        title: "具体数字后不加 -s",
        desc: "hundred/thousand/million 前有具体数字时用单数，且不接 of。",
        good: ["two thousand students", "The population is about 1.37 billion.", "The city has two hundred thousand people."],
        bad: ["two thousands students", "two thousands of students"],
      },
      {
        title: "概数用复数 + of",
        desc: "表示不确切数量时用 hundreds/thousands/millions + of。",
        good: ["Thousands of people visit the Great Wall every year."],
        bad: ["Thousand of people visit the Great Wall."],
      },
      {
        title: "编号表达",
        desc: "名词 + 数字表示编号，名词首字母大写，不加冠词。",
        good: ["Room 302", "Lesson One / Lesson 1", "Bus No. 10"],
        bad: ["the Room 302", "302 Room"],
      },
    ],
    contrasts: [
      {
        title: "确切数量 vs 概数",
        head: ["形式", "含义", "例子"],
        rows: [["具体数字 + 单数", "确切数量", "three hundred books"], ["复数 + of", "大约的数量", "hundreds of books"]],
      },
    ],
    pitfalls: ["分数作主语时，谓语与 of 后面的名词一致：Two thirds of the land is ...。", "序数词前一般加 the：the first prize。"],
    examTips: ["中考常在语篇中考查 big numbers 与时态结合；记住“有数字不加 s，没数字加 s 接 of”。"],
    memoryCard: ["有数字，不加 s；没数字，加 s 接 of。", "分子基数，分母序数。"],
    textbookLinks: [
      { book: "八年级上册", section: "Module 9", title: "Population" },
      { book: "九年级下册", section: "Module 1", title: "Travel" },
    ],
    textbookExamples: [
      { en: "The population is about 1.37 billion.", zh: "人口大约是 13.7 亿。", source: "外研版八年级上册 Module 9" },
      { en: "The city has two hundred thousand people.", zh: "这座城市有二十万人口。", source: "外研版八年级上册 Module 9" },
    ],
  },
  {
    id: "g-there-be",
    title: "There be 句型",
    short: "There be",
    category: "句法",
    difficulty: 1,
    summary: "There be 表示“某地有某物”，be 的形式由后面的名词决定，遵循就近原则。",
    forms: [
      { name: "肯定", pattern: "There is / are + 名词 + 地点", note: "There is a book on the desk." },
      { name: "否定", pattern: "There is / are + not (no) + 名词", note: "There is no milk in the fridge." },
      { name: "疑问", pattern: "Is / Are there + 名词 + 地点?", note: "Are there any apples?" },
      { name: "将来时", pattern: "There is / are going to be 或 There will be", note: "There will be a meeting tomorrow." },
    ],
    points: [
      {
        title: "就近原则",
        desc: "be 的形式由最靠近它的名词决定。",
        good: ["There is a pen and two books on the desk.", "There are two books and a pen on the desk."],
        bad: ["There are a pen and two books on the desk."],
      },
      {
        title: "不可数名词用 is",
        desc: "water、milk、money 等不可数名词作主语时用 is。",
        good: ["There is some water in the bottle.", "Is there any milk in the fridge?"],
        bad: ["Are there any milk in the fridge?"],
      },
      {
        title: "将来时不能用 have",
        desc: "There be 与 have 不能混用，将来时用 there will be / there is going to be。",
        good: ["There will be a sports meeting next week.", "There is going to be a meeting tomorrow afternoon."],
        bad: ["There will have a sports meeting next week."],
      },
    ],
    contrasts: [
      {
        title: "There be vs have",
        head: ["结构", "含义", "例子"],
        rows: [["There be", "某地存在某物", "There is a book on the desk."], ["have/has", "某人拥有某物", "I have a book."]],
      },
    ],
    pitfalls: ["There be 后面不能再加 have。", "some 用于肯定句，any 用于否定句和疑问句。"],
    examTips: ["中考多在语篇与写作中考查。先找 be 后面最近的名词，再决定 is/are。"],
    memoryCard: ["There be 表存在，have 表拥有。", "就近原则定 is/are。"],
    textbookLinks: [
      { book: "七年级上册", section: "Unit 4", title: "Time to celebrate" },
    ],
    textbookExamples: [
      { en: "There is no milk in the fridge.", zh: "冰箱里没有牛奶。", source: "外研版七年级上册 Unit 4" },
      { en: "How many lanterns are there?", zh: "有多少个灯笼？", source: "外研版七年级上册 Unit 4" },
    ],
  },
  {
    id: "g-imperatives",
    title: "祈使句与感叹句",
    short: "祈使句",
    category: "句法",
    difficulty: 2,
    summary: "祈使句以动词原形开头，表示命令、请求、建议；感叹句用 What/How 开头表达强烈情感。",
    forms: [
      { name: "祈使句肯定", pattern: "动词原形 + 其他", note: "Keep calm and stay still." },
      { name: "祈使句否定", pattern: "Don't + 动词原形", note: "Don't cross that rope!" },
      { name: "be 型祈使句", pattern: "Be + 形容词", note: "Be careful!" },
      { name: "感叹句", pattern: "What + 名词短语 + 主谓！/ How + 形容词/副词 + 主谓！", note: "What a lovely reading room! / How interesting the story is!" },
    ],
    points: [
      {
        title: "祈使句用动词原形开头",
        desc: "主语 you 通常省略；否定式在句首加 Don't。",
        good: ["Remember your passport.", "Don't move the person.", "Be careful when you cross the road."],
        bad: ["You remember your passport.（非祈使句语气）", "Not be late for class."],
      },
      {
        title: "What 感叹名词，How 感叹形容词/副词",
        desc: "What 后接名词短语，How 后接形容词或副词。",
        good: ["What a lovely reading room!", "How interesting the story is!", "How fast he runs!"],
        bad: ["What interesting the story is!", "How a lovely reading room!"],
      },
      {
        title: "祈使句 + and/or 结构",
        desc: "祈使句后接 and 表示“就……”，接 or 表示“否则……”。",
        good: ["Wash your hands before meals, or you may get ill.", "Work hard, and you will succeed."],
        bad: [],
      },
    ],
    contrasts: [
      {
        title: "What vs How",
        head: ["引导词", "后接", "例子"],
        rows: [["What", "名词短语", "What a nice day!"], ["How", "形容词/副词", "How nice the day is!"]],
      },
    ],
    pitfalls: ["祈使句没有主语，动词用原形，不能加 -s 或 to。", "What 后如果是可数名词单数，别忘了 a/an。"],
    examTips: ["中考在语篇与写作中考查。急救、规则、建议类文本常用祈使句。"],
    memoryCard: ["祈使句：动词原形开头，否定加 Don't。", "What 接名词，How 接形容词。"],
    textbookLinks: [
      { book: "七年级下册", section: "Unit 2", title: "Go for it!" },
      { book: "七年级下册", section: "Unit 6", title: "Hitting the road" },
      { book: "八年级上册", section: "Module 12", title: "Help" },
      { book: "九年级上册", section: "Module 5", title: "Museums" },
    ],
    textbookExamples: [
      { en: "Go for it!", zh: "加油，放手去做！", source: "外研版七年级下册 Unit 2" },
      { en: "Remember your passport.", zh: "记得带你的护照。", source: "外研版七年级下册 Unit 6" },
      { en: "Keep calm and stay still.", zh: "保持冷静，不要动。", source: "外研版八年级上册 Module 12" },
      { en: "Don't cross that rope!", zh: "不要越过那条绳子！", source: "外研版九年级上册 Module 5" },
    ],
  },
  {
    id: "g-adverbial-clause",
    title: "状语从句",
    short: "状语从句",
    category: "复合句",
    difficulty: 4,
    summary: "状语从句用连词引导，表示时间、条件、让步、原因、结果等关系。时间状语从句遵循“主将从现”。",
    forms: [
      { name: "时间状语从句", pattern: "as soon as / when / while / until / before / after", note: "My family goes out as soon as the holiday begins." },
      { name: "条件状语从句", pattern: "if / unless + 一般现在时", note: "If you go to London, visit the museum." },
      { name: "让步状语从句", pattern: "though / although + 从句", note: "Though it was hard, she never gave up." },
      { name: "结果状语从句", pattern: "so + 形容词/副词 + that 从句", note: "He worked so hard that he succeeded." },
    ],
    points: [
      {
        title: "时间状语从句的“主将从现”",
        desc: "as soon as、when、until 等引导的时间状语从句用一般现在时表示将来。",
        good: ["I will call you as soon as I arrive at the airport.", "We waited until the flag rose."],
        bad: ["I will call you as soon as I will arrive at the airport."],
      },
      {
        title: "though / although 表让步",
        desc: "意为“虽然、尽管”，不能与 but 连用。",
        good: ["Though it was hard, she never gave up.", "Although I was alone, I felt fine."],
        bad: ["Though it was hard, but she never gave up."],
      },
      {
        title: "so ... that 表结果",
        desc: "so 后接形容词或副词，that 引导结果从句。",
        good: ["He worked so hard that he succeeded.", "He was so tired that he fell asleep at once."],
        bad: ["He worked so hard, that he succeeded."],
      },
    ],
    contrasts: [
      {
        title: "常见状语从句连词",
        head: ["关系", "连词", "例子"],
        rows: [["时间", "as soon as, when, while, until", "as soon as the holiday begins"], ["条件", "if, unless", "if you go to London"], ["让步", "though, although", "though it was hard"], ["结果", "so ... that", "so hard that he succeeded"]],
      },
    ],
    pitfalls: ["though/although 与 but 不能同时出现。", "because 与 so 也不能同时出现。", "时间状语从句中不能用 will 表示将来。"],
    examTips: ["中考在语篇和书面表达中考查较多：先判断两句之间是什么关系，再选连词。"],
    memoryCard: ["时间条件从句，主将从现。", "though 不与 but 连用。"],
    textbookLinks: [
      { book: "九年级上册", section: "Module 2", title: "Public holidays" },
      { book: "九年级上册", section: "Module 3", title: "Heroes" },
      { book: "九年级上册", section: "Module 4", title: "Home alone" },
    ],
    textbookExamples: [
      { en: "My family goes out as soon as the holiday begins.", zh: "假期一开始，我们全家就出门。", source: "外研版九年级上册 Module 2" },
      { en: "We waited until the flag rose.", zh: "我们一直等到国旗升起。", source: "外研版九年级上册 Module 2" },
      { en: "Though it was hard, she never gave up.", zh: "虽然很艰难，但她从未放弃。", source: "外研版九年级上册 Module 3" },
      { en: "He worked so hard that he succeeded.", zh: "他如此努力，以至于成功了。", source: "外研版九年级上册 Module 3" },
    ],
  },
];

export const grammarCategories = ["词法", "句法", "动词", "复合句"];

export const topicsById = Object.fromEntries(grammarTopics.map((t) => [t.id, t]));

export const sortedTopics = [...grammarTopics].sort(
  (a, b) => grammarCategories.indexOf(a.category) - grammarCategories.indexOf(b.category) || a.difficulty - b.difficulty,
);
