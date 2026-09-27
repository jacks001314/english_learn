// web/js/grammar/yufan/questions.js
// 来源：yufan/疑问句（第 20 章，17 张教材扫描图）
// 契约见同目录 README.md；对已有专题 g-questions 做增量补充（不复述 how 词组辨析）。

export default [
  {
    topicId: "g-questions",
    newTopic: false,
    title: "疑问句与疑问词",
    sourceDirs: ["yufan/疑问句"],
    imagesRead: 17,
    summary:
      "疑问句以提出问题为目的，分为一般疑问句、特殊疑问句、选择疑问句和反意疑问句四种；本章补充分类、各句型构成、疑问代词的形容词用法、how 词组表、选择疑问句与反意疑问句全套规则及答语。",
    intro:
      "一般疑问句用 yes / no 回答，特殊疑问句用疑问词开头、不能用 yes / no 回答，选择疑问句用 or 连接两种以上情况，反意疑问句则由“陈述句 + 意思相反的简短问句”构成。语调：一般疑问句、选择疑问句句末多用升调（选择疑问句最后一种用降调），特殊疑问句、反意疑问句（强调时）用降调。",
    sections: [
      {
        heading: "一、疑问句的四种类型",
        blocks: [
          {
            type: "text",
            text:
              "以提出问题为目的的句子叫做疑问句，疑问句是英语中的常见句式，可分为：一般疑问句、特殊疑问句、选择疑问句和反意疑问句四种。",
          },
          {
            type: "examples",
            items: [
              { en: "Is she from America?", zh: "一般疑问句：她来自美国吗？" },
              { en: "When is your birthday?", zh: "特殊疑问句：你的生日是哪天？" },
              { en: "Is this a dog or a cat?", zh: "选择疑问句：这是狗，还是猫？" },
              { en: "You are a student, aren't you?", zh: "反意疑问句：你是学生，不是吗？" },
            ],
          },
          {
            type: "tip",
            text: "章首页名人名言（Thomas Alva Edison）：The brain can be developed just the same as the muscles can be developed, if one will only take the pains to train the mind to think. —— 头脑可以像肌肉一样得到发展，只要你肯不辞辛苦地训练心智去思考。",
          },
        ],
      },
      {
        heading: "二、一般疑问句",
        blocks: [
          {
            type: "text",
            text:
              "用 yes 或者 no 回答的疑问句，称为一般疑问句。这种疑问句句末语调多用升调，句末用问号“?”。",
          },
          {
            type: "list",
            items: [
              "① be 动词的一般疑问句：陈述句中有 be 动词时，可直接将它们提至主语前。句型：Be 动词 + 主语 + ……？",
              "② 情态动词的一般疑问句：陈述句中有情态动词时，可直接将它们提至主语前。句型：情态动词 + 主语 + 动词原形 + ……？",
              "③ 行为动词的一般疑问句：陈述句中只有行为动词时，要在句首加助动词 do / does / did。句型：Do / Does / Did + 主语 + 动词原形 + ……？",
              "④ 现在完成时和过去完成时的一般疑问句：要把助动词 have / has / had 提至句首。句型：Have / Has / Had + 主语 + 动词的过去分词 + ……？",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "A: Is he your close friend? B: Yes, he is. / No, he isn't.", zh: "他是你要好的朋友吗？——是的，他是。／不，他不是。" },
              { en: "A: Is there any drink in the ring-pull can? B: Yes, there is. / No, there isn't.", zh: "易拉罐里有饮料吗？——是的，有。／不，没有。" },
              { en: "A: Are there any birds in the sky? B: Yes, there are. / No, there aren't.", zh: "天空中有鸟吗？——是的，有。／不，没有。" },
              { en: "A: Were the babies crying last night? B: Yes, they were. / No, they weren't.", zh: "昨天晚上这些宝宝一直在哭吗？——是的，他们在哭。／不，他们没哭。" },
              { en: "A: Is English spoken all over the world? B: Yes, it is. / No, it isn't.", zh: "全世界都说英语吗？——是的，都说。／不，不是。" },
              { en: "A: Can you bring me some lemons? B: Yes, I can. / No, I can't.", zh: "你能给我拿些柠檬来吗？——是的，可以。／不，不可以。" },
              { en: "A: Must I do it now? B: Yes, you must. / No, you needn't.", zh: "我必须现在做吗？——是的，你必须。／不，你不必。" },
              { en: "A: Does he have supper at home every day? B: Yes, he does. / No, he doesn't.", zh: "他每天在家吃晚饭吗？——是的，他是。／不，他不是。" },
              { en: "A: Did he do morning exercises yesterday? B: Yes, he did. / No, he didn't.", zh: "昨天他做早操了吗？——是的，他做了。／不，他没做。" },
              { en: "A: Have you known her since your childhood? B: Yes, I have. / No, I haven't.", zh: "你从童年时就认识她吗？——是的，我是。／不，我不是。" },
              { en: "A: Had he learned about two thousand English words before he came here? B: Yes, he had. / No, he hadn't.", zh: "他来这儿以前就已经学了大约两千个单词了吗？——是的，他是。／不，他不是。" },
            ],
          },
          {
            type: "tip",
            text: "一些情态动词构成的一般疑问句，形式上是问句，表达的却是请求、建议等，语气委婉：Can / Could you carry the heavy box for me? / Will / Would you please give me some butter? / May I have some more rice? / Will you visit the museum next week? / Would you like to go with us? / Shall we go swimming?",
          },
          {
            type: "pitfall",
            text: "“Can you…?”变成否定形式的问句“Can't you…?”后，不表示委婉、客气的请求，而是带有惊讶、责难、反问等口气：Can't you carry the heavy box for me?（你难道不能帮我搬一下这个重箱子吗？）",
          },
        ],
      },
      {
        heading: "三、特殊疑问句（一）：疑问代词的用法",
        blocks: [
          {
            type: "text",
            text:
              "用疑问词引导的疑问句叫做特殊疑问句。疑问句句末语调多用降调，回答特殊疑问句时不能用 yes 或 no。疑问词分为疑问代词（what、who、whom、whose、which）和疑问副词（when、where、why、how）两类。疑问副词在句中作状语，所以它们都不能对主语进行提问。",
          },
          {
            type: "text",
            text:
              "what 引导的特殊疑问句可以对主语、表语和宾语进行提问。注意“What is + 人？”句型用来询问某人的职业，一般译为“某人是干什么的？”，与询问姓名或关系的“Who is + 人？”不同。",
          },
          {
            type: "examples",
            items: [
              { en: "A: What is in the room? B: There are a lot of chairs in it. = A lot of chairs are in it.", zh: "屋子里有什么？（对主语提问）——有许多椅子。" },
              { en: "A: What is this? B: It's a bench.", zh: "这是什么？（对表语提问）——这是一条长凳。" },
              { en: "A: What is your mother? B: She is a teacher.", zh: "你妈妈是做什么工作的？（对表语提问）——她是个老师。" },
              { en: "A: What do you want to be? B: I want to be an actor.", zh: "你理想中的职业是什么？（对宾语提问）——我想成为一名演员。" },
            ],
          },
          {
            type: "text",
            text:
              "who、whom、whose 引导的特殊疑问句可以对主语、表语和宾语进行提问。who 可以对主语和表语提问；whom 是 who 的宾格，对宾语提问，但口语中 who 可代替 whom 对宾语提问。",
          },
          {
            type: "examples",
            items: [
              { en: "A: Who broke the window? B: Li Ming did.", zh: "谁打破了窗户？（对主语提问）——李明打破的。" },
              { en: "A: Who / Whom did Frank meet? B: He met Vivian.", zh: "弗兰克遇到了谁？（对宾语提问）——他遇到了维维安。" },
              { en: "A: Who is that woman? B: She is Rose. / She is my mother.", zh: "那个女人是谁？（对表语提问）——她是罗丝。（询问姓名）／她是我妈妈。（询问关系）" },
              { en: "A: Whose is this umbrella? / Whose umbrella is this? B: This umbrella is my sister's.", zh: "这把伞是谁的？（对表语提问，whose 也可起形容词作用）——这把伞是我姐姐的。" },
            ],
          },
          {
            type: "text",
            text:
              "which 引导的特殊疑问句可以对主语和宾语进行提问。当疑问代词 what、who、which 在疑问句中作主语时，句子的语序均是陈述句语序。",
          },
          {
            type: "examples",
            items: [
              { en: "A: Which is the longest river in China? B: The Yangtze River is the longest river in China.", zh: "中国最长的河流是哪一条？（对主语提问）——长江是中国最长的河流。" },
              { en: "A: Which does he want? B: He wants the green one.", zh: "他想要哪一个？（对宾语提问）——他想要那个绿色的。" },
            ],
          },
          {
            type: "text",
            text:
              "what、whose、which 后面跟上名词时，这三个疑问词起形容词的作用，这类疑问句可以对主语、表语和宾语提问。",
          },
          {
            type: "examples",
            items: [
              { en: "A: Whose father has been elected as the governor of our province? B: Lily's father.", zh: "谁的父亲当选了我们的省长？（对主语提问）——莉莉的父亲。" },
              { en: "A: Whose pens are these? B: They are Li Ming's.", zh: "这些是谁的钢笔？（对表语提问）——这些是李明的。" },
              { en: "A: What size shoes do you take? B: I take size 38.", zh: "你穿多大号的鞋？（对宾语提问）——我穿 38 号的。" },
              { en: "A: Which book did you read? B: I read Harry Potter and the Sorcerer's Stone.", zh: "你看的是哪本书？（对宾语提问）——我看的是《哈利·波特与魔法石》。" },
            ],
          },
        ],
      },
      {
        heading: "四、特殊疑问句（二）：疑问副词的用法",
        blocks: [
          {
            type: "text",
            text:
              "when 引导的特殊疑问句用来询问时间；when 用来提问年、月、日和星期，what time 用来提问具体的钟点。注意 when 是对具体时间的询问，所以不能和完成时连用：How long have you been here?（√）／When did you come here?（√）／When have you been here?（×）",
          },
          {
            type: "examples",
            items: [
              { en: "A: When were you born? B: (I was born) on June 5, 1993.", zh: "你是何时出生的？——（我）是 1993 年 6 月 5 日出生的。（可以简略回答出时间）" },
              { en: "A: When shall I return you the magazine? B: It's up to you.", zh: "这本杂志我该什么时候还给你？——由你决定。" },
              { en: "A: Where do you live? B: (I live in) Beijing.", zh: "你住在哪儿？——我住在北京。（可以简略回答出地点）" },
              { en: "A: Where is this music coming from? B: It is coming from the neighbour.", zh: "这音乐是从哪儿传来的？——是从隔壁传来的。" },
              { en: "A: Why are you late? B: Because I was stuck in a traffic jam.", zh: "你为什么迟到？——因为我遇上了交通堵塞。（why 只能由 because 引导的句子回答）" },
              { en: "A: Why didn't you see the film? = Why did you not see the film? B: Because I had seen it before.", zh: "你为什么不看那部电影？——因为我以前看过了。" },
            ],
          },
          {
            type: "text",
            text:
              "how 可单独置于疑问句的句首，用来询问某人如何做某事（做某事的方法、手段），也可用于询问身体状况、天气情况等。“How + 形容词/副词 + ……？”用来询问年龄、身高、数量、次数、距离等。",
          },
          {
            type: "examples",
            items: [
              { en: "A: How do you go to school? B: I go to school by bus.", zh: "你怎样去上学？（询问方式）——我坐公交车去上学。" },
              { en: "A: How is it going? B: Marvelous. / Quite well.", zh: "最近怎么样？（询问状况）——棒极了。／非常好。" },
              { en: "A: How is the weather today? B: It's cloudy.", zh: "今天天气如何？（询问天气）——（今天）多云。" },
            ],
          },
          {
            type: "table",
            head: ["搭配", "词义", "例句"],
            rows: [
              ["How many", "多少（可数名词）", "How many sisters do you have?（你有多少姐妹？）"],
              ["How much", "多少（不可数名词）", "How much is the book?（这本书多少钱？）"],
              ["How old", "多大（岁数）", "How old are you?（你多大了？）"],
              ["How tall", "多高（人、树等）", "How tall is that tree?（那棵树有多高？）"],
              ["How high", "多高（山等）", "How high is Mt Fuji?（富士山有多高？）"],
              ["How far", "多远（距离）", "How far is it from A to B?（从 A 到 B 有多远？）"],
              ["How long", "多久（时间）", "How long will you stay here?（你将在这里停留多久？）"],
              ["How long", "多长（长度）", "How long is the rope?（这根绳子有多长？）"],
              ["How often", "多久一次（频率）", "How often do you visit here?（你多久拜访这里一次？）"],
              ["How soon", "多快（时间）", "How soon will he be back?（他多久会回来？）"],
            ],
          },
          {
            type: "tip",
            text: "“How…”还构成常用句式：How do you do?（你好。）／How about…? = What about…?（……如何？）／How do you like…? = What do you think of…?（你觉得……怎么样？）",
          },
        ],
      },
      {
        heading: "五、选择疑问句",
        blocks: [
          {
            type: "text",
            text:
              "提出两种或两种以上的情况，要求对方选择一种情况回答，这种问句叫做选择疑问句。选择疑问句的两种或两种以上的情况用 or 连接，回答时不能用 yes 或 no；语调一般是最后一种选择用降调，其余的用升调。选择疑问句可以分为一般选择疑问句和特殊选择疑问句两种。",
          },
          {
            type: "list",
            items: [
              "① 一般选择疑问句句型：一般疑问句 + or + 被选择的情况？",
              "② 特殊选择疑问句句型：特殊疑问句，A or B？",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "A: Are you a teacher or a student? B: I'm a student.", zh: "你是个老师还是个学生？——我是个学生。" },
              { en: "A: Do you like Coke or juice? B: I like Coke.", zh: "你喜欢可乐还是果汁？——我喜欢可乐。" },
              { en: "A: Did you work out the maths problem in this way or (in) that way? B: I did it in that way.", zh: "你是用这种方法还是用那种方法把这道数学题算出来的？——我用那种方法算出来的。" },
              { en: "Shall we go there by bus or taxi?", zh: "我们是坐公交车还是出租车去那儿？" },
              { en: "Is it coffee, tea or something else?", zh: "这是咖啡、茶、还是其他什么东西？" },
              { en: "A: Which do you prefer, science fiction movie or epic movie? B: I prefer science fiction movie to epic movie.", zh: "你更喜欢科幻片还是史诗片？——我比较喜欢科幻片。" },
              { en: "A: When will he leave for London, today or tomorrow? B: Tomorrow.", zh: "他何时动身去伦敦，今天还是明天？——明天。" },
            ],
          },
        ],
      },
      {
        heading: "六、反意疑问句（一）：构成与 be 动词、情态动词、行为动词",
        blocks: [
          {
            type: "text",
            text:
              "在陈述句之后加上一个意思与之相反的简短问句，用以向对方证实所叙述的事情，这种句子叫做反意疑问句。反意疑问句必须由意思相反的两部分组成，在前一部分（陈述句）之后用逗号，后一部分（简短问句）之后用问号。反意疑问句的否定句必须用缩略形式，同时它的主语必须用人称代词，不能用名词。前一部分用降调，后一部分在表示疑问时用升调，在表示强调某意思时用降调。它分为两类：① 前一部分为肯定式，后一部分是否定式；② 前一部分为否定式，后一部分是肯定式。",
          },
          {
            type: "list",
            items: [
              "① 陈述部分的谓语含 be 动词：现在 ……（陈述句）, isn't / aren't + 主语？；过去 ……（陈述句）, wasn't / weren't + 主语？",
              "② 陈述部分的谓语含情态动词和助动词：……（陈述句）, 情态动词的简短否定式 + 主语？／……（陈述句）, 助动词的简短否定式 + 主语？",
              "③ 陈述部分的谓语含行为动词：现在 ……（陈述句）, don't / doesn't + 主语？；过去 ……（陈述句）, didn't + 主语？",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "It's a nice day, isn't it?", zh: "今天天气很好，不是吗？" },
              { en: "A: It was a wonderful night, wasn't it? B: Yes, it was. / No, it wasn't.", zh: "那是个奇妙的夜晚，不是吗？——是的，它是。／不，它不是。" },
              { en: "A: The Greens were at home last night, weren't they? B: Yes, they were. / No, they weren't.", zh: "格林夫妇昨晚在家，是吗？——是的，他们在家。／不，他们不在家。" },
              { en: "A: Tom is skating, isn't he? B: Yes, he is. / No, he isn't.", zh: "汤姆在滑冰，不是吗？（进行时）——是的，他是。／不，他不是。" },
              { en: "A: She is loved by her parents, isn't she? B: Yes, she is. / No, she isn't.", zh: "她被父母亲疼爱着，不是吗？（被动语态）——是的，她是。／不，她不是。" },
              { en: "A: Your brother can swim, can't he? B: Yes, he can. / No, he can't.", zh: "你哥哥会游泳，不是吗？——是的，他会。／不，他不会。" },
              { en: "A: We have to finish it, don't we? B: Yes, we do. / No, we don't.", zh: "我们不得不完成它，不是吗？——是的。／不，不是。" },
              { en: "A: The workers had to take the first bus, didn't they? B: Yes, they did. / No, they didn't.", zh: "工人们不得不赶头班车，不是吗？——是的，他们是。／不，他们不是。" },
              { en: "A: Justin has been to London before, hasn't he? B: Yes, he has. / No, he hasn't.", zh: "贾斯廷以前去过伦敦，是吗？——是的，他去过。／不，他没去过。" },
              { en: "A: You have achieved success, haven't you? B: Yes, I have. / No, I haven't.", zh: "你已经获得成功了，不是吗？——是的。／不，还没有。" },
              { en: "My sister had heard the news before I told her, hadn't she?", zh: "在我告诉我姐姐之前，她已经知道这个消息了，不是吗？" },
              { en: "You like rock music, don't you?", zh: "你喜欢摇滚乐，不是吗？" },
              { en: "A: Amanda speaks French, doesn't she? B: Yes, she does. / No, she doesn't.", zh: "阿曼达说法语，不是吗？——是的。／不，她不说。" },
              { en: "He lived in London, too, didn't he?", zh: "他也住在伦敦，不是吗？" },
              { en: "A: Your sister helped him, didn't she? B: Yes, she did. / No, she didn't.", zh: "你姐姐帮助了他，不是吗？——是的，她帮助了他。／不，她没有帮助他。" },
            ],
          },
          {
            type: "tip",
            text: "在反意疑问句中，前后两部分的动词在人称、数和时态上通常保持一致；后一部分的人称代词应和前一部分的主语（名词或代词）保持一致。进行时和被动语态中皆有 be 动词，所以它们的反意疑问句形式和 be 动词的反意疑问句形式相似。",
          },
          {
            type: "pitfall",
            text: "动词 have 表示“有……”时，反意疑问句采用两种形式均可：He has a lot of books, hasn't he? = He has a lot of books, doesn't he?；当 have 表示其他含义（如“经历”“开会”“吃”）时，只能用 do 来构成疑问部分：The students have a meeting once a week, don't they? / His mother has her lunch at the factory, doesn't she?",
          },
          {
            type: "pitfall",
            text: "像 dislike、hate 这样的词，虽然意思是“不喜欢、讨厌”，表示否定含义，但在反意疑问句中仍按肯定句来处理，疑问部分用否定式：A: You dislike English, don't you? B: Yes, I do.（是的，我不喜欢。）／B: No, I don't.（不，我喜欢。）",
          },
        ],
      },
      {
        heading: "七、反意疑问句（二）：否定陈述句与其他类型",
        blocks: [
          {
            type: "text",
            text:
              "陈述句（否定式）+ 疑问部分（肯定式）这种反意疑问句的结构和前一种一样，只不过要颠倒一下肯定句和否定句的位置。这部分难点在于回答，回答和汉语习惯不同：在这种问句中，根据实际情况，如果事实是肯定的，就要用“Yes + 肯定结构”，如果事实是否定的，就要用“No + 否定结构”。",
          },
          {
            type: "examples",
            items: [
              { en: "A: Mr Smith isn't Austrian, is he? B: Yes, he is. / No, he isn't.", zh: "史密斯先生不是奥地利人，对吗？——不，他是。／是的，他不是。" },
              { en: "A: You're not ready, are you? B: Yes, I am. / No, I'm not.", zh: "你没有准备好，是吧？——不，我准备好了。／是的，我没有。" },
              { en: "A: Thomas doesn't go there every day, does he? B: Yes, he does. / No, he doesn't.", zh: "托马斯不是每天都去那儿，对吧？——不，他每天都去。／是的，他不是每天去。" },
              { en: "A: Your classmates didn't have a good time last summer, did they? B: Yes, they did. / No, they didn't.", zh: "你的同学们去年夏天玩得不是很愉快，是吗？——不，他们玩得很愉快。／是的，他们玩得不愉快。" },
              { en: "A: They haven't been to the Great Wall, have they? B: Yes, they have. / No, they haven't.", zh: "他们没去过长城，是吗？——不，他们去过。／是的，他们没去过。" },
            ],
          },
          {
            type: "list",
            items: [
              "① 祈使句的反意疑问句：在肯定的祈使句后，为了使祈使句听起来比较婉转、客气，可以加一个简短的问句，例如 will you? / would you? / won't you? / can you? / could you? / can't you?，最常用的是 will you? 或 won't you?。（Speak louder, will you? / Give me a hand, would you? / Turn off the light, won't you? / Read it slowly, can / can't you?）",
              "② 在 Let's… 祈使句后加上 shall we? 或 shan't we?，因为 Let's 包含谈话的对方在内；而在 Let us / me / him… 后要加上 will you? 或 won't you?，因为 Let us 不包括谈话的对方在内。（Let's go and see a film, shall we? / Let's have a cup of coffee, shall we? / Let us wait for you in the reading room, will you? / Let me have a try, will you? / Let her play the piano, will you?）",
              "③ 陈述部分含表示否定意义的词（never、seldom、hardly、few、little、nobody、no one、nothing、neither）时，疑问部分要用肯定式。（He never watches TV, does he? / Very few people understand what he said, do they? / No one can help me, can he / they? / Neither of them will go, will he?）",
              "④ 陈述部分是 there be 结构时，疑问部分用 there，省略主语代词。（There is something wrong with the computer, isn't there? / There is no time left, is there? / There will not be any trouble, will there?）",
              "⑤ 陈述部分的主语是不定代词：everything、nothing 等表示事物的不定代词作主语时，疑问部分主语用 it；everyone、no one、someone 等表示人的不定代词作主语时，疑问部分常用 they（有时也用 he）。（Everything here is dirty, isn't it? / Everybody knows the answer, don't they?）",
              "⑥ 陈述部分为含宾语从句的主从复合句时，疑问部分的动词和主语代词常和主句的动词和主语保持一致；但如果宾语从句由 think、believe、suppose、imagine 等词引导时，疑问部分的动词和主语应与宾语从句的动词和主语保持一致。（You told them he wouldn't come, didn't you? / He never said he was a good student, did he? / I think you are right, aren't you? / I don't think she can complete the essay alone, can she? / I don't believe he knows it, does he? / I suppose they are waiting for us now, aren't they?）",
            ],
          },
          {
            type: "pitfall",
            text: "“I / We don't think / believe… + 宾语从句”属于英语中最常见的否定转移，即位于宾语从句中的否定词 not 被转移到主句中去了。只有某些动词才允许否定转移，例如 think、believe、suppose、imagine 等。这种否定转移的主从复合句，它的反意疑问句是针对被否定转移的从句而提出的，所以要根据宾语从句中的谓语动词和主语来构成其疑问部分。",
          },
          {
            type: "tip",
            text: "在否定的祈使句后面，只能用肯定的疑问部分“will you?”：Don't be late, will you?（别迟到，行吗？）",
          },
        ],
      },
      {
        heading: "八、易错点与实战（Common Mistakes 摘录）",
        blocks: [
          {
            type: "examples",
            items: [
              {
                en: "Common Mistakes 1: Would you like a cup of coffee ______ shall we get down to business right away? A. and B. then C. or D. for",
                zh: "您是先来杯咖啡，还是我们马上谈正事？答案 C。（提出两种以上情况、要求选择一种回答，是选择疑问句。）",
              },
              {
                en: "Common Mistakes 2: He is expected to make a speech this afternoon, ______? A. is he not B. isn't he C. is not he D. isn't it",
                zh: "有人希望他今天下午作报告，是吗？答案 B。（反意疑问句的否定句必须用缩略形式，且主语须用人称代词。）",
              },
              {
                en: "Common Mistakes 3: If I knew the answer, I wouldn't be asking, ______? A. didn't I B. did I C. would I D. wouldn't I",
                zh: "要是我知道答案，我就不会问，不是吗？答案 C。（前一部分的主句是否定式，后一部分用肯定式；主语、助动词和主句保持一致。）",
              },
              {
                en: "Common Mistakes 4: A: You don't come from England, do you? B: ______. I come from America. How do you know that? A. No, I do B. Yes, I do C. Yes, I don't D. No, I don't",
                zh: "A：你不是来自英国，对吗？B：是的，我不是。我来自美国。答案 D。（反意疑问句的答语要根据实际情况回答，yes 译为“不”，no 译为“是的”，省略答语要与 yes 或 no 一致。）",
              },
            ],
          },
          {
            type: "list",
            items: [
              "实力测验·按要求改变句型（原题，答案未在图片中给出）：1. Li Ming did some shopping yesterday.（改为一般疑问句）",
              "2. You will join the army in two months.（改为反意疑问句）",
              "3. He likes neither apples nor pears.（改为反意疑问句）",
              "4. They have been there twice.（改为反意疑问句）",
              "5. You dislike this kind of books.（改为反意疑问句）",
              "实力测验·对画线部分提问：1. Mr Jankins is Mabel's husband. →",
              "2. Peter rides his bike today because he's a little late. →",
              "3. They will come back in two weeks. →",
              "4. I've lived here for over fifteen years. →",
              "5. They met each other at the gate of our school. →",
              "6. He is talking to his deskmate. →",
              "实力测验·汉译英：1. A: 英语和汉语，你喜欢哪一科？B: 哪一科我也不喜欢。2. A: 你几乎没有钱，是吗？B: 不，我有许多钱。",
            ],
          },
        ],
      },
    ],
    extras: {
      forms: [
        { name: "一般疑问句（be 动词）", pattern: "Be 动词 + 主语 + ……？", note: "Is he your close friend? —— Yes, he is. / No, he isn't." },
        { name: "一般疑问句（情态动词）", pattern: "情态动词 + 主语 + 动词原形 + ……？", note: "Can you bring me some lemons?" },
        { name: "一般疑问句（行为动词）", pattern: "Do / Does / Did + 主语 + 动词原形 + ……？", note: "Did he do morning exercises yesterday?" },
        { name: "一般疑问句（完成时）", pattern: "Have / Has / Had + 主语 + 过去分词 + ……？", note: "Have you known her since your childhood?" },
        { name: "选择疑问句", pattern: "一般疑问句 + or + 被选择的情况？／特殊疑问句，A or B？", note: "Are you a teacher or a student? —— I'm a student." },
        { name: "反意疑问句（前肯后否）", pattern: "陈述句, isn't / don't / didn't / can't + 人称代词？", note: "It's a nice day, isn't it?" },
        { name: "反意疑问句（前否后肯）", pattern: "否定陈述句, is / do / did + 人称代词？", note: "Mr Smith isn't Austrian, is he?" },
      ],
      points: [
        {
          title: "特殊疑问词作主语时用陈述句语序",
          desc: "what、who、which 在疑问句中作主语时，句子语序仍是陈述句语序，不再倒装。",
          good: ["Who broke the window? — Li Ming did.", "What is in the room? — There are a lot of chairs in it."],
          bad: ["Who did break the window?"],
        },
        {
          title: "what、whose、which 可作形容词，后接名词",
          desc: "这三个疑问词后跟名词时起形容词作用，可对主语、表语和宾语提问。",
          good: ["Whose pens are these?", "What size shoes do you take?", "Which book did you read?"],
          bad: [],
        },
        {
          title: "when 不能与完成时连用",
          desc: "when 询问具体时间，问“多久”要用 how long。",
          good: ["How long have you been here?", "When did you come here?"],
          bad: ["When have you been here?"],
        },
        {
          title: "反意疑问句的答语与汉语习惯不同",
          desc: "根据实际情况回答：事实是肯定的用 Yes + 肯定结构，事实是否定的用 No + 否定结构。",
          good: ["A: You're not ready, are you? B: Yes, I am.（不，我准备好了。）", "A: Mr Smith isn't Austrian, is he? B: No, he isn't.（是的，他不是。）"],
          bad: [],
        },
        {
          title: "祈使句与 Let's 的反意问句",
          desc: "肯定祈使句后用 will you? / won't you? 等；Let's… 后用 shall we?，Let us / me / him… 后用 will you?；否定祈使句后只用 will you?。",
          good: ["Speak louder, will you?", "Let's go and see a film, shall we?", "Don't be late, will you?"],
          bad: ["Let us wait for you in the reading room, shall we?"],
        },
      ],
      contrasts: [
        {
          title: "how 词组补充（身高、年龄、距离等）",
          head: ["疑问词", "提问内容", "典型例句"],
          rows: [
            ["How old", "岁数", "How old are you?"],
            ["How tall", "人、树等的高度", "How tall is that tree?"],
            ["How high", "山等的高度", "How high is Mt Fuji?"],
            ["How far", "距离", "How far is it from A to B?"],
            ["How long", "长度", "How long is the rope?"],
          ],
        },
        {
          title: "两种特殊疑问句的语序",
          head: ["疑问词在句中的成分", "语序", "例句"],
          rows: [
            ["作主语", "疑问词 + 谓语 + ……（陈述句语序）", "Who broke the window? / What is in the room?"],
            ["作宾语/状语等", "疑问词 + 助动词/be + 主语 + 动词……", "What do you want to be? / When were you born?"],
          ],
        },
      ],
      pitfalls: [
        "“Can you…?”与“Can't you…?”口气不同：后者带惊讶、责难、反问意味，不表示委婉请求。",
        "反意疑问句的简短问句必须用缩略形式，主语必须用人称代词（不能用名词）。",
        "陈述部分含 never / seldom / hardly / few / little / nobody / nothing / neither 等否定意义词时，疑问部分用肯定式。",
        "含 I think / believe / suppose / imagine 等宾语从句的复合句，反意疑问部分随从句的谓语动词和主语。",
        "动词 have 表“有”时反意疑问句两种形式均可（hasn't he? / doesn't he?）；表“经历、开会、吃”等时只能用 do 的相应形式。",
      ],
      examTips: [
        "看到选项里出现 or 连接两种情况，先想到选择疑问句，答语不能用 yes / no。",
        "反意疑问句先判断前一部分的肯/否，再“前肯后否、前否后肯”，并检查人称代词与缩略形式。",
        "答语类题目按事实回答：事实肯定用 Yes，事实否定用 No，注意与汉语“是的/不”的语序差异。",
      ],
      memoryCard: [
        "四类疑问句：一般、特殊、选择、反意。",
        "前肯后否，前否后肯；答语按事实。",
        "Let's 用 shall we，Let us 用 will you。",
      ],
    },
    notes: [
      "图片 微信图片_20260927154058_562_66.jpg 为第 20 章章首页（名人名言页），无语法正文，已记录其名言与译文。",
      "其余 16 张图片（563—578）内容清晰，均可逐字转写；无不可识别图片。",
      "与 topics.js 现有 g-questions 内容（how long / how often / how soon / how much / how many 辨析与答语反推法）不重复，本文件只补充分类、构成、疑问代词/副词用法、选择疑问句、反意疑问句与答语规则。",
    ],
  },
];
