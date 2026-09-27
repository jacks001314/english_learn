// web/js/grammar/yufan/reported-speech.js
// 来源：yufan/直接引语与间接引语（教材第二十三章扫描件 15 张，微信图片_20260927174857_629_66.jpg ~ 微信图片_20260927175147_643_66.jpg 的压缩镜像 yufan-ds/直接引语与间接引语）
// 由 yufan 图片讲义整理，供 GrammarView「语法专题」页面渲染。
// g-object-clause（宾语从句）是 topics.js 中已有专题，本文件按契约只写增量补充（sections + extras），不复述已有内容。
// 自检：import('file:///.../reported-speech.js')

export default [
  {
    topicId: "g-object-clause",
    newTopic: false,
    title: "直接引语与间接引语",
    sourceDirs: ["yufan/直接引语与间接引语"],
    imagesRead: 15,
    summary: "把别人的话转述出来要用间接引语：去掉逗号、冒号、引号，调整人称与时态，变化时间/地点状语和指示代词，并按陈述句、疑问句、祈使句、感叹句四类句型分别改造，转述后大多构成一个宾语从句。",
    intro: "教材第二十三章·直接引语与间接引语共三大块：1 直接引语与间接引语的构成；2 直接引语与间接引语的转化（人称、时态、时间/地点状语和指示代词、四类句型）；3 直接引语与间接引语需注意的事项（时态不变、人称不变、主句动词、情态动词、请求句）。以下按图片原顺序整理为讲义。",
    notes: "第 13—15 张（_641_ / _642_ / _643_）为章末「实力测验 Final Check」练习页，原书未附答案，未录入正文；第 1 张（_629_）为章节扉页（仅页眉页脚与章标题），无知识点。其余 11 张均已逐条转写。",
    sections: [
      {
        heading: "1 直接引语与间接引语的构成",
        blocks: [
          {
            type: "text",
            text: "当我们引用别人的话时，我们可以用别人的原话，也可以用自己的话把别人的意思转述出来。当直接引用的句子为不同类型时，间接引用时的句式变化很大，本章中会一一解析。",
          },
          {
            type: "table",
            head: ["类别", "教材定义"],
            rows: [
              ["直接引语", "当我们引用别人的话语时，若引用的是原话，被引用的部分叫做直接引语。"],
              ["间接引语", "当我们引用别人的话语时，也可以用自己的话把意思转述出来，这种转述的别人说话的部分叫做间接引语。"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "She said, \"I like English very much.\"", zh: "她说：“我非常喜欢英语。”（直接引语）" },
              { en: "She said she liked English very much.", zh: "她说她非常喜欢英语。（间接引语）" },
            ],
          },
          { type: "text", text: "1）直接引语的构成（4 条）：" },
          {
            type: "list",
            items: [
              "将原话放在引号之中，不作任何改动。",
              "不必考虑时态呼应的问题。",
              "引用的原话前用逗号“，”（汉语中多用冒号“：”）。",
              "直接引语的最后按其类别加句号“.”或问号“?”等。",
            ],
          },
          {
            type: "tip",
            text: "引号内直接引语第一个单词的第一个字母要大写。当“主语（人）+ 引述动词”放在引语之后时，在后的引号之前必须加逗号；但如果引语以问号或感叹号结尾时，则不用逗号。",
          },
          {
            type: "examples",
            items: [
              { en: "The teacher asked, \"Do you like English?\"", zh: "老师问：“你们喜欢英语吗？”" },
              { en: "Mary said to me, \"I lost my cell phone.\"", zh: "玛丽对我说：“我把我的手机弄丢了。”" },
              { en: "\"You gave the book to me yourself,\" she said.", zh: "她说：“是你自己把这本书给我的。”" },
            ],
          },
          { type: "text", text: "2）间接引语的构成（4 条）：" },
          {
            type: "list",
            items: [
              "句中不含逗号、冒号、引号。",
              "要考虑到人称的变化（人称的变化与汉语是一致的）。",
              "要考虑时态的变化。",
              "要考虑时间状语、地点状语和指示代词的变化。",
            ],
          },
          {
            type: "tip",
            text: "间接引语不需要加引号，而且在多数情况下都能构成一个宾语从句。间接引语一般都要由引述动词引导。",
          },
          {
            type: "examples",
            items: [
              { en: "She said that I had given the book to her myself.", zh: "她说是我自己把那本书给她的。" },
              { en: "The teacher asked us whether we liked English.", zh: "老师问我们是否喜欢英语。" },
              { en: "Mary told me that she had lost her cell phone.", zh: "玛丽告诉我她把她的手机弄丢了。" },
              { en: "Ben asked me if I wanted to go swimming that day.", zh: "本问我那天是否想去游泳。" },
            ],
          },
        ],
      },
      {
        heading: "2 人称的变化",
        blocks: [
          {
            type: "text",
            text: "直接引语转化为间接引语时，间接引语中的人称会发生相应的变化，而且这种变化与汉语的变化是一致的。",
          },
          {
            type: "examples",
            items: [
              { en: "John said, \"I've been late again.\" → John said that he had been late again.", zh: "约翰说：“我又迟到了。” → 约翰说他又迟到了。" },
              { en: "Mary said, \"I'll finish the work this afternoon.\" → Mary said that she would finish the work that afternoon.", zh: "玛丽说：“我将在今天下午完成工作。” → 玛丽说她将在那天下午完成工作。" },
              { en: "He said, \"I'll be seeing you off on the 10 o'clock train.\" → He said that he would be seeing me off on the 10 o'clock train.", zh: "他说：“我将送你乘 10 点钟的火车离开。” → 他说他将送我乘 10 点钟的火车离开。" },
            ],
          },
          {
            type: "tip",
            text: "人称变化“与汉语的变化是一致的”：汉语怎么说，英语就怎么调（如“我说他……”中“他”不变，“他说我……”中“我”要随说话对象调整），不必额外记口诀。",
          },
        ],
      },
      {
        heading: "3 时态的变化",
        blocks: [
          {
            type: "text",
            text: "直接引语转化为间接引语时，主句动词的时态若是过去时，间接引语中的时态要变为相应的过去时态。",
          },
          {
            type: "table",
            head: ["直接引语中的时态", "间接引语中的时态"],
            rows: [
              ["一般现在时", "一般过去时"],
              ["一般过去时，现在完成时", "过去完成时"],
              ["过去完成时", "过去完成时（不变）"],
              ["一般将来时", "过去将来时"],
              ["现在进行时", "过去进行时"],
              ["现在完成进行时", "过去完成进行时"],
              ["shall", "should"],
              ["should", "should（不变）"],
              ["will", "would"],
              ["would", "would（不变）"],
              ["may", "might"],
              ["might", "might（不变）"],
              ["can", "could"],
              ["could", "could（不变）"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "She said, \"I like maths very much.\" → She said that she liked maths very much.", zh: "她说：“我非常喜欢数学。”（一般现在时） → 她说她非常喜欢数学。（一般过去时）" },
              { en: "He said, \"I've never seen this man.\" → He said that he had never seen that man.", zh: "他说：“我从没见过这个男人。”（现在完成时） → 他说他从没见过那个男人。（过去完成时）" },
              { en: "Joe said, \"I am listening to music in my room.\" → Joe said that he was listening to music in his room.", zh: "乔说：“我正在我的房间听音乐。”（现在进行时） → 乔说他正在他的房间听音乐。（过去进行时）" },
            ],
          },
          {
            type: "tip",
            text: "教材漫画提示：直接引语中要用 shall，间接引语中就用 should。",
          },
        ],
      },
      {
        heading: "4 时间状语、地点状语和指示代词的变化",
        blocks: [
          {
            type: "text",
            text: "直接引语转化为间接引语时，间接引语中的时间状语、地点状语和指示代词都会发生相应的变化。",
          },
          {
            type: "table",
            head: ["直接引语中的状语、指示代词", "间接引语中的状语、指示代词"],
            rows: [
              ["today 今天", "that day 当天"],
              ["yesterday 昨天", "the day before 前一天"],
              ["tomorrow 明天", "the next day / the following day 第二天"],
              ["next week / month / year... 下周 / 下个月 / 明年……", "the next week / month / year... 第二周 / 月 / 年……"],
              ["last week / month / year... 上周 / 上个月 / 去年……", "the week / month / year...before 前一周 / 月 / 年……"],
              ["ago 以前", "before 以前"],
              ["three / four / ...years ago 三年 / 四年 / ……年前", "three / four / ...years before 三年 / 四年 / ……年前"],
              ["in 2008 在 2008 年", "in 2008 在 2008 年（不变）"],
              ["now 现在", "then 那时"],
              ["so far 目前", "by then 到那时"],
              ["here 这里", "there 那里"],
              ["this 这个", "that 那个"],
              ["these 这些", "those 那些"],
            ],
          },
          {
            type: "tip",
            text: "表示具体年份的时间状语（如 in 2008）转化为间接引语时不变，是这张表里唯一的例外项。",
          },
        ],
      },
      {
        heading: "5 引用的句子是陈述句时",
        blocks: [
          {
            type: "text",
            text: "陈述句转述为间接引语时，句型、语序没有变化，只是要在陈述句前加连词 that，它不在句子中担任成分，常常被省略。",
          },
          {
            type: "examples",
            items: [
              { en: "The girl said to me, \"Pocket money can give a kid a sense of independence.\" → The girl told me (that) pocket money could give a kid a sense of independence.", zh: "这个女孩对我说：“零用钱能给孩子以独立感。” → 这个女孩告诉我零用钱能给孩子以独立感。" },
              { en: "Paul said, \"I haven't heard a complaint yet.\" → Paul said (that) he hadn't heard a complaint yet.", zh: "保罗说：“我还没听到一句抱怨。” → 保罗说他还没听到一句抱怨。" },
            ],
          },
          {
            type: "tip",
            text: "转述陈述句时，主句引述动词常由 say to sb 变为 tell sb（如 said to me → told me）。",
          },
        ],
      },
      {
        heading: "6 引用的句子是疑问句时",
        blocks: [
          {
            type: "text",
            text: "疑问句转述为间接引语时，句型、语序要有相应的变化，并注意要以疑问词或 if、whether 等词引导。",
          },
          { type: "text", text: "1）引用的句子是特殊疑问句时：语序要转化为陈述句语序，并以疑问词开头（注意此时不能用 that）。" },
          {
            type: "examples",
            items: [
              { en: "Mary asked me, \"What is she doing here?\" → Mary asked me what she was doing there.", zh: "玛丽问我：“她在这儿做什么呢？” → 玛丽问我她在那儿做什么呢。" },
              { en: "Wang Fang asked Lily, \"How have you managed to finish painting so soon?\" → Wang Fang asked Lily how she had managed to finish painting so soon.", zh: "王芳问莉莉：“你是怎么做到那么快完成绘画的？” → 王芳问莉莉她是怎么做到那么快完成绘画的。" },
              { en: "My teacher asked me, \"How long have you spent in practising these days?\" → My teacher asked me how long I had spent in practising those days.", zh: "我的老师问我：“这些天你用了多长时间练习？” → 我的老师问我那些日子花了多长时间练习。" },
            ],
          },
          {
            type: "tip",
            text: "特殊疑问句转述时两处同时变：时态由一般现在时变一般过去时，语序由疑问句语序变陈述句语序，标点由问号变句号——因为实际上这是个宾语从句，主句是陈述句而不是问句。",
          },
          { type: "text", text: "2）引用的句子是一般疑问句时：要把一般疑问句句型转化为陈述句句型，同时在句子前面加上 if 或者 whether。" },
          {
            type: "examples",
            items: [
              { en: "I asked her, \"Did you visit the museum two days ago?\" → I asked her if / whether she had visited the museum two days before.", zh: "我问她：“两天前你去参观博物馆了吗？” → 我问她两天前是不是参观过博物馆了。" },
              { en: "My friend Lily asked me, \"Do you want to go swimming today?\" → My friend Lily asked (me) if / whether I wanted to go swimming that day.", zh: "我的朋友莉莉问我：“你今天想去游泳吗？” → 我的朋友莉莉问我那天是否想去游泳。" },
            ],
          },
          {
            type: "tip",
            text: "if 和 whether 一般可通用，但 whether 可以和 or not 连用，if 不能。ask 常用来转述疑问句，且 ask 后既可带间接的人称宾语，也可省略不带。",
          },
          { type: "text", text: "3）引用的句子是反意疑问句时：要把它看成是一般疑问句——即句型为陈述句，在句子前面加 if 或 whether，往往后面还要加上 or not，常用 whether...or not。" },
          {
            type: "examples",
            items: [
              { en: "She asked, \"You have made a big mistake, haven't you?\" → She asked whether I had made a big mistake or not.", zh: "她问道：“你犯了个大错，不是吗？” → 她问我是不是犯了个大错。" },
            ],
          },
          {
            type: "pitfall",
            text: "补充：直接引语如果是选择疑问句，转述为间接引语时其关联词应用 whether...or...。如 He asked me, \"Do you like apples or bananas?\" → He asked me whether I like apples or bananas.（他问我是喜欢苹果还是香蕉。）",
          },
        ],
      },
      {
        heading: "7 引用的句子是祈使句、感叹句时",
        blocks: [
          {
            type: "text",
            text: "祈使句转述为间接引语时，间接引语要改用动词不定式表示。引述动词根据原意可以用 ask、tell、want、order 等表示，原祈使句改为不定式。",
          },
          {
            type: "list",
            items: ["肯定句：ask / tell ... sb to do sth", "否定句：ask / tell ... sb not to do sth"],
          },
          {
            type: "examples",
            items: [
              { en: "Miss Green said to Jane, \"Please sit down.\" → Miss Green asked Jane to sit down.", zh: "格林小姐对简说：“请坐。” → 格林小姐请简坐下。" },
              { en: "The teacher said, \"Pay attention to your spelling.\" → The teacher told us to pay attention to our spelling.", zh: "老师说：“注意你们的拼写。” → 老师告诉我们注意拼写。" },
              { en: "Joe said, \"Don't make so much noise, boys.\" → Joe ordered the boys not to make so much noise.", zh: "乔说：“男孩们，别那么吵。” → 乔让男孩们别那么吵。" },
            ],
          },
          {
            type: "tip",
            text: "若直接引语表示请求语气，间接引语的引述动词用 ask；若直接引语表示命令语气，间接引语的引述动词用 tell 或 order。",
          },
          {
            type: "text",
            text: "感叹句转述为间接引语时，间接引语可以仍然使用 how、what 等词，语序不变；也可使用 that 把原来的感叹句改为宾语从句，动词 say 可改为 cry、shout 等词。",
          },
          {
            type: "examples",
            items: [
              { en: "He said, \"What a clever boy he is!\" → He said what a clever boy he was. / He cried that he was a clever boy.", zh: "他说：“多么聪明的男孩啊！” → 他说他是一个聪明的男孩。" },
              { en: "She said, \"How interesting the film is!\" → She said how interesting the film was. / She shouted that the film was interesting.", zh: "她说：“多么有趣的电影啊！” → 她说这是一部非常有趣的电影。" },
            ],
          },
          {
            type: "tip",
            text: "感叹句转述为间接引语时，可以加上适当的修饰语，如 with delight（高兴地）、with a sigh（长叹一声）等。如 He said, \"What a fine day!\" → He cried with delight that it was a fine day.（他高兴地叫道天气多好啊。）",
          },
        ],
      },
      {
        heading: "8 间接引语中时态不改变的情况",
        blocks: [
          {
            type: "text",
            text: "主句的动词是过去的时态时，引语中的时态就要做相应的变化。但在以下一些情况下，间接引语中的时态仍保持不变。",
          },
          { type: "text", text: "① 当主句的动词时态是现在的时态（一般现在时、现在进行时、现在完成时）或将来时，间接引语中的时态不变。" },
          {
            type: "examples",
            items: [
              { en: "He says, \"I'm tired.\" → He says he is tired.", zh: "他说：“我累了。” → 他说他累了。" },
              { en: "He will say, \"The girl was very beautiful.\" → He will tell you that the girl was very beautiful.", zh: "他将会说：“这个女孩过去很漂亮。” → 他将会告诉你这个女孩过去很漂亮。" },
            ],
          },
          { type: "text", text: "② 当引语表示一般真理或客观事实时，转化为间接引语时时态不变，并且要使用一般现在时。" },
          {
            type: "examples",
            items: [
              { en: "He asked, \"Which star is the biggest?\" → He asked which star is the biggest.", zh: "他问：“哪颗星星最大？” → 他问哪颗星星最大。" },
              { en: "My father told me, \"It's important for kids to learn how to manage money.\" → My father told me (that) it is important for kids to learn how to manage money.", zh: "我父亲告诉我：“让孩子学习怎么处理金钱是很重要的。” → 我父亲告诉我让孩子学习怎么处理金钱是很重要的。" },
            ],
          },
          { type: "text", text: "③ 当引语强调动作或状态现在仍存在时，转化为间接引语时时态可不变，其他相应状语也可不变，尤其是在口语中。" },
          {
            type: "examples",
            items: [
              { en: "John said, \"My son is ill today.\" → John told me that his son is ill today.", zh: "约翰说：“我的儿子今天生病了。” → 约翰告诉我，他儿子今天病了。" },
              { en: "He asked, \"Where has Li Ming gone?\" → He asked where Li Ming has gone. / He asked where Li Ming had gone.", zh: "他问：“李明去哪儿了？” → 他问李明去哪儿了。（用 has gone 表示李明未回来；用 had gone 表示李明已回来）" },
            ],
          },
          {
            type: "tip",
            text: "补充：如果没有特定的情况说明是今天（today）发生的事，“John said, 'My son is ill today.'”这句应改为 John told me that his son was ill that day / yesterday.——时态和状语是否后退，取决于“当时说的情况现在是否仍然如此”。",
          },
          { type: "text", text: "④ 过去完成时在间接引语中仍为过去完成时，与之联系使用的动词过去时不变。" },
          {
            type: "examples",
            items: [
              { en: "Mr Green said, \"My son had gone to America before he graduated.\" → Mr Green said that his son had gone to America before he graduated.", zh: "格林先生说：“我儿子还没毕业就去美国了。” → 格林先生说，他儿子还没毕业就去美国了。" },
              { en: "She said, \"I had lived here for 10 years by the end of last year.\" → She said that she had lived there for 10 years by the end of last year.", zh: "她说：“到去年底，我已经在这儿住了 10 年了。” → 她说到去年底，她已经在那儿住了 10 年了。" },
            ],
          },
          {
            type: "tip",
            text: "将直接引语变成间接引语时，时态通常要往回移：现在时变成过去时，过去时变成过去完成时。若直接引语中动词已为过去完成时，再转述为间接引语时就不变了，因为已不可能再往回移了。",
          },
          { type: "text", text: "⑤ 当直接引语中的一般过去时与表示过去特定时间的状语连用时，转化为间接引语时时态不变。" },
          {
            type: "examples",
            items: [
              { en: "He said, \"I was born in 1990 and joined the army in 2008.\" → He said that he was born in 1990 and joined the army in 2008.", zh: "他说：“我 1990 年出生，2008 年参军。” → 他说他 1990 年出生，2008 年参军。" },
            ],
          },
        ],
      },
      {
        heading: "9 其他需注意的情况：人称不变、主句动词、情态动词与请求句",
        blocks: [
          { type: "text", text: "1）间接引语中人称不改变的情况：主句中动词的主语是第一人称时，引语中的人称代词保持不变。" },
          {
            type: "examples",
            items: [
              { en: "I said, \"He can speak English very well.\" → I said that he could speak English very well.", zh: "我说：“他的英语说得很好。” → 我说他的英语说得很好。" },
              { en: "We said, \"You did quite well yesterday.\" → We said that you had done quite well the day before.", zh: "我们说：“昨天你们做得相当不错。” → 我们说你们那天做得相当不错。" },
            ],
          },
          {
            type: "text",
            text: "2）主句动词的使用：用间接引语时，主句的引述动词除了用 say、tell、ask 外，只要意思上允许，尽可能用别的动词，如 admit 承认、agree 同意、greet 打招呼、request 要求、order 命令、declare 声明、reply 回答、explain 解释、wonder 想知道、promise 答应。",
          },
          {
            type: "examples",
            items: [
              { en: "\"Really, it is my fault,\" he said. → He admitted that it was really his fault.", zh: "他说：“的确，那是我的错。” → 他承认那的确是他的错。" },
              { en: "\"Your idea sounds good,\" the Sales Manager said. → The Sales Manager agreed that my idea sounded good.", zh: "销售部经理说：“你的主意听起来不错。” → 销售部经理赞同我的主意不错。" },
            ],
          },
          {
            type: "text",
            text: "3）要保留情态动词的意义：注意间接引语中要保留原来直接引语中包含的情态动词的意义（如 must 在间接引语中常用 had to 表示“必须”）。",
          },
          {
            type: "examples",
            items: [
              { en: "\"I must do my homework now,\" said Tom. → Tom said that he had to do his homework then.", zh: "汤姆说：“我现在必须做作业。” → 汤姆说那时他必须做作业。" },
            ],
          },
          {
            type: "text",
            text: "4）“Would you please...?” 如何变为间接引语：“Would you please...?” 虽然是个一般疑问句，但它表示的是“请求”，变为间接引语时，一般用动词不定式来表示。",
          },
          { type: "list", items: ["句型公式：主语 + ask / invite + 宾语 + 不定式"] },
          {
            type: "examples",
            items: [
              { en: "\"Would you please have lunch with me tomorrow?\" Mr Zhu asked me. → Mr Zhu asked / invited me to have lunch with him the next day.", zh: "朱先生问我：“明天你和我一起吃午饭好吗？” → 朱先生让 / 请我明天和他一起吃午饭。" },
              { en: "\"Would you please pass me your dictionary?\" she said to me. → She asked me to pass her my dictionary.", zh: "她跟我说：“劳驾你能把你的字典递给我吗？” → 她让我把我的字典递给她。" },
            ],
          },
        ],
      },
    ],
    extras: {
      forms: [
        { name: "陈述句转述", pattern: "主句 + (that) + 陈述句", note: "句型、语序不变；that 不作成分，常省略。" },
        { name: "特殊疑问句转述", pattern: "主句 + 疑问词 + 陈述语序", note: "语序变陈述语序，句末用句号；不能用 that。" },
        { name: "一般疑问句转述", pattern: "主句 + if / whether + 陈述语序", note: "把一般疑问句句型转化为陈述句句型，前置 if 或 whether。" },
        { name: "反意疑问句 / 选择疑问句转述", pattern: "主句 + whether + 陈述句 + or not", note: "答语常用 whether...or not；选择疑问句用 whether...or...。" },
        { name: "祈使句转述", pattern: "ask / tell / order sb (not) to do sth", note: "改用动词不定式；肯定 sb to do sth，否定 sb not to do sth。" },
        { name: "感叹句转述", pattern: "how / what 引导，或 that + 宾语从句", note: "how / what 时语序不变；用 that 时 say 可改为 cry、shout。" },
      ],
      points: [
        {
          title: "宾语从句（间接引语）必须用陈述语序",
          desc: "特殊疑问句转述时，疑问语序要改为陈述语序，句末问号改句号。",
          good: ["Mary asked me what she was doing there.", "My teacher asked me how long I had spent in practising those days."],
          bad: ["Mary asked me what was she doing there.", "My teacher asked me how long had I spent in practising those days."],
        },
        {
          title: "主句是过去时，从句时态要后退",
          desc: "一般现在时→一般过去时；一般过去时/现在完成时→过去完成时；一般将来时→过去将来时；现在进行时→过去进行时。",
          good: ["She said that she liked maths very much.", "He said that he had never seen that man.", "Joe said that he was listening to music in his room."],
          bad: ["She said that she likes maths very much.", "He said that he has never seen that man."],
        },
        {
          title: "人称与时间、地点状语、指示代词同步变化",
          desc: "人称按汉语习惯调整；today→that day，yesterday→the day before，tomorrow→the next day，here→there，this→that，these→those。",
          good: ["Ben asked me if I wanted to go swimming that day.", "Joe said that he was listening to music in his room."],
          bad: ["Ben asked me if I wanted to go swimming today.", "Joe said that he was listening to music in my room."],
        },
        {
          title: "情态动词必须保留原意",
          desc: "间接引语中要保留原来直接引语里情态动词的意义，must 常改用 had to。",
          good: ["Tom said that he had to do his homework then."],
          bad: ["Tom said that he must did his homework then."],
        },
      ],
      contrasts: [
        {
          title: "四类句型转述速查",
          head: ["引用的句子", "引导词 / 形式", "语序与要点"],
          rows: [
            ["陈述句", "that（常省略）", "句型、语序不变"],
            ["一般疑问句", "if / whether", "转为陈述句句型，前置 if/whether"],
            ["特殊疑问句", "疑问词开头（不用 that）", "转为陈述语序，句末用句号"],
            ["反意疑问句", "whether ... or not", "先看成一般疑问句；选择疑问句用 whether...or..."],
            ["祈使句", "ask/tell/order sb (not) to do", "改为动词不定式"],
            ["感叹句", "how / what，或 that 从句", "how/what 时语序不变；say 可改 cry、shout"],
          ],
        },
        {
          title: "时态变化对照",
          head: ["直接引语", "间接引语"],
          rows: [
            ["一般现在时", "一般过去时"],
            ["一般过去时 / 现在完成时", "过去完成时"],
            ["过去完成时", "过去完成时（不变）"],
            ["一般将来时", "过去将来时"],
            ["现在进行时", "过去进行时"],
            ["现在完成进行时", "过去完成进行时"],
            ["can / may / shall / will", "could / might / should / would"],
            ["could / might / should / would", "不变"],
          ],
        },
      ],
      pitfalls: [
        "特殊疑问句转述后仍写成疑问语序（what is she doing→应为 what she was doing），是最常见失分点。",
        "主句是过去时，从句时态忘记后退（he said he is tired 应为 he said he was tired）。",
        "一般疑问句转述忘记加 if / whether；句末问号未改句号。",
        "祈使句转述忘记用不定式，或否定式漏掉 not（应为 tell sb not to do sth）。",
        "时间/地点状语与指示代词忘记同步变化（today→that day，here→there，this→that）。",
      ],
      examTips: [
        "【长沙中考】答语“他问我今天早上汤姆什么时候到的学校”→ 特殊疑问句转述：疑问词 + 陈述语序，选 when Tom got to school。",
        "【成都中考】“警察询问这个孩子住在哪里”→ 由题意判断是“住在哪里”，用 where he lived（陈述语序）。",
        "主句 said 是过去时：Tom said he ___ back in a week，直接引语中 will 要变为 would，选 would come。",
        "一般疑问句转述：John asked me ___ to visit his uncle's farm，句型为陈述句且前面加 if/whether，选 whether I would like。",
      ],
      memoryCard: [
        "去引号、调人称、退时态、换状语——间接引语四步走。",
        "疑问句转述一律用陈述语序，句末问号变句号。",
        "一般疑问句加 if / whether；祈使句用 ask/tell/order sb (not) to do sth。",
        "主句现在时/将来时、客观真理、动作现在仍存在——这三种情况时态不变。",
      ],
    },
  },
];