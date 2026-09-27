// web/js/grammar/yufan/numerals.js
// 来源：yufan/数词/（教材“第四章 数词”扫描页 076—083，共 9 张）
// 目标专题：g-numerals（已存在，本次为增量补充）

export default [
  {
    topicId: "g-numerals",
    newTopic: false,
    title: "数词",
    sourceDirs: ["yufan/数词"],
    imagesRead: 9,
    summary: "数词分基数词与序数词：表示数目多少的叫基数词，表示顺序次序的叫序数词；数词的用法相当于名词或形容词。",
    intro: "数词既有名词性质，又有形容词性质：相当于名词时在句中作主语、表语、宾语；相当于形容词时在句中作定语；基数词还能作同位语。",
    sections: [
      {
        heading: "一、数词的词形（基数词）",
        blocks: [
          { type: "text", text: "英语中的数词有两种，即基数词和序数词，它们是互相对应的。" },
          { type: "table", head: ["基数词", "序数词", "基数词", "序数词"], rows: [
            ["one 1", "first", "eight 8", "eighth"],
            ["two 2", "second", "nine 9", "ninth"],
            ["three 3", "third", "ten 10", "tenth"],
            ["four 4", "fourth", "eleven 11", "eleventh"],
            ["five 5", "fifth", "twelve 12", "twelfth"],
            ["six 6", "sixth", "thirteen 13", "thirteenth"],
            ["seven 7", "seventh", "twenty 20", "twentieth"],
          ] },
          { type: "list", items: [
            "A 1—12 的表示法见上表。",
            "B 13—19 的基数词，在个位数上加后缀 -teen 构成，并有两个重音：thirteen [ˌθɜː'tiːn] 13、eighteen [ˌeɪ'tiːn] 18、fifteen [ˌfɪf'tiːn] 15、nineteen [ˌnaɪn'tiːn] 19。",
            "C 20—90 各整十位数的基数词都以 -ty 结尾：twenty ['twenti] 20、thirty ['θɜːti] 30。",
            "D 在 21—99 之间的非整十位数的基数词要在十位和个位之间加连字符“-”：twenty-one 21、forty-five 45。",
            "E 三位数的基数词要在百位和十位（若无十位则和个位）之间加 and：one hundred and fifty-six 156、two hundred and four 204、eight hundred and ten 810。",
            "F 1000 以上的数字，从后向前数，每三位数加一个分节号“,”；第一个分节号前为 thousand（千），第二个分节号前为 million（百万），以此类推：two thousand (and) eight 2,008；thirty-five thousand, four hundred (and) fifty-six 35,456。",
          ] },
          { type: "table", head: ["形式", "规则", "例"], rows: [
            ["hundred / thousand / million 前有具体数字", "要用单数", "two thousand 两千"],
            ["后面有 of（泛指，不表示确切数字）", "要用复数，且前面不能再加具体数字", "thousands of 成千上万；hundreds of 成百上千"],
          ] },
          { type: "examples", items: [
            { en: "Hundreds of children lost their lives in the war.", zh: "成百上千名儿童在战争中丧生。" },
          ] },
        ],
      },
      {
        heading: "二、数词的词形（序数词）",
        blocks: [
          { type: "list", items: [
            "A 序数词除了 first（第一）、second（第二）、third（第三）外，4—19 的序数词都是在基数词后加词尾 -th 构成，th 读作 [θ]。注意第五、第八、第九、第十二这几个词：fifth 第五、eighth 第八、ninth 第九、twelfth 第十二。",
            "B 20—90 各整十位数的序数词是将其相应基数词词尾 -ty 改写成 -tieth：twentieth 第二十、thirtieth 第三十、fortieth 第四十、fiftieth 第五十、eightieth 第八十、ninetieth 第九十。",
            "C 其他的序数词是将个位数改成序数词，而十、百、千等位上的数仍然用基数词：(the) thirty-first 第三十一、(the) forty-second 第四十二、(the) fifty-third 第五十三、(the) ninety-ninth 第九十九、(the) one hundred (and) first 第一百零一。",
            "D 序数词在实际应用中经常以缩写形式出现：1st、2nd、3rd、11th、21st、32nd、44th、63rd、89th、101st、1,000th、1,002nd。",
          ] },
          { type: "table", head: ["需要特别记忆的数字", "说明"], rows: [
            ["nine 九", "基数词"],
            ["the ninth 第九", "序数词（去 e 加 th）"],
            ["nineteen 十九", "基数词"],
            ["ninety 九十", "基数词（注意与 nineteen 区分）"],
          ] },
          { type: "pitfall", text: "fifth / eighth / ninth / twelfth 是拼写最易错的四个序数词；整十位的序数词是 -ty → -tieth（twentieth），不要写成 twentith。" },
        ],
      },
      {
        heading: "三、数词的基本用法（充当句子成分）",
        blocks: [
          { type: "text", text: "数词既有名词性质，又有形容词性质。数词相当于名词时，在句中作主语、表语和宾语；数词相当于形容词时，在句中作定语。基数词还能作同位语。" },
          { type: "table", head: ["成分", "例句", "译文"], rows: [
            ["1 作主语", "Thirty of them are Party members.", "他们中的 30 人是党员。"],
            ["1 作主语", "Do you see those cups on the desk? The second is Mary's.", "你看到桌子上的那些茶杯了吗？第二个是玛丽的。"],
            ["2 作表语", "Two times four is eight.", "2 乘以 4 等于 8。"],
            ["2 作表语", "He was the fourth to arrive.", "他是第四个到的。"],
            ["3 作宾语", "There are ten footballs and you may borrow three of them.", "这儿有 10 个足球，你可以借 3 个。"],
            ["3 作宾语", "Please pass me the second.", "请递给我第二个。"],
            ["4 作定语", "The nine boys are from Tianjin.", "这九个男孩都来自天津。"],
            ["4 作定语", "The ninth boy is from Tianjin.", "第九个男孩来自天津。"],
            ["5 作同位语（只限基数词）", "We two will go with you.", "我们两个将和你一起去。"],
            ["5 作同位语（只限基数词）", "Can you help us three with our maths?", "你可以帮我们三个学数学吗？"],
          ] },
          { type: "tip", text: "序数词作定语时，前面要用定冠词 the 来修饰。" },
        ],
      },
      {
        heading: "四、数词的实际应用（1）表示排列顺序",
        blocks: [
          { type: "table", head: ["中文", "英文", "读法说明"], rows: [
            ["第一章", "Chapter One / the first chapter", "章节可用基数词，也可用序数词，还可直接用阿拉伯数字 Chapter 1"],
            ["第二节", "Section Two / the second section", "同上"],
            ["第三课", "Lesson Three / the third lesson", "同上"],
            ["第 463 页", "page four six three", "页码过长时，可把数字拆开，一个个用基数词表示，读时一个个分开读"],
            ["第 507 页", "page five o [əu] / zero seven", "0 可读 o 或 zero"],
            ["第 2 564 页", "page two five six four = page twenty-five sixty-four", "两种读法均可"],
            ["305 房间", "Room three o / zero five", "房间号逐位读"],
            ["长安街 76 号", "seventy-six Chang'an Street", "门牌号用基数词"],
            ["11 路公共汽车", "Bus (No.) eleven / No. 11 bus", "用 No.(number) 表示数字时，用基数词"],
          ] },
        ],
      },
      {
        heading: "五、数词的实际应用（2）表示年龄",
        blocks: [
          { type: "list", items: [
            "A 表示某人的年龄，一般情况下直接用基数词。",
            "B 当表示一个人有三十多岁、四十多岁时，要用下列固定短语：in one's thirties 在某人三十几岁时；in one's forties 在某人四十几岁时。",
          ] },
          { type: "examples", items: [
            { en: "A: How old is your sister? B: She is seven.", zh: "——你妹妹多大了？——她 7 岁了。" },
            { en: "At thirty years old, he had already earned £400,000 a year.", zh: "他 30 岁的时候，已拿到 40 万英镑的年薪了。" },
            { en: "Our English teacher is in her forties.", zh: "我们的英语老师四十多岁。" },
          ] },
        ],
      },
      {
        heading: "六、数词的实际应用（3）表示年代、日期和时刻",
        blocks: [
          { type: "list", items: [
            "A 年代是四位数字时，各分成两位来表示：公元 2025 年 2025 (= twenty twenty-five)；公元 2000 年 2000 (= the year two thousand)。",
            "B 日期通常用序数词来表示：5 月 10 日 May 10th (= May the tenth)；7 月 1 日 July 1st (= July the first)；12 月 2 日 December 2nd (= December the second)。",
            "C 时刻通常用基数词来表示：9 点整 9:00 (= nine o'clock)；8 点 45 分 8:45 (= eight forty-five)；11 点 26 分 11:26 (= eleven twenty-six)；2 点 2 分 2:02 (= two two)。",
          ] },
          { type: "table", head: ["表达", "含义", "例"], rows: [
            ["past", "过了半点，用 past", "7 点 12 分：twelve past seven"],
            ["to", "反之，未到半点（差多少分到几点），用 to", "12 点 48 分（差 12 分到 1 点）：twelve to one"],
            ["a quarter", "四分之一", "15 分钟：a quarter"],
            ["a half", "二分之一", "半小时：a half"],
          ] },
        ],
      },
      {
        heading: "七、数词的实际应用（4）表示电话号码",
        blocks: [
          { type: "examples", items: [
            { en: "10086: one double zero eight six", zh: "1 0 0 8 6" },
            { en: "204-2244: two zero four two two four four", zh: "204-2244" },
            { en: "2358867: two three five double eight six seven", zh: "2358867" },
            { en: "13120081697: one three one two double zero eight one six nine seven", zh: "13120081697" },
          ] },
          { type: "tip", text: "数字 0 可以读作 [əu] 或 zero；两个相同数字重叠，如 22、44，可以读作 double two、double four。" },
        ],
      },
      {
        heading: "八、数词的实际应用（5）表示小数、分数和百分数",
        blocks: [
          { type: "list", items: [
            "A 小数：小数点前的数按照基数词读，小数点读作 point。小数点后的词，按照个位基数词顺序读出。",
            "B 分数：分数的分子用基数词表示，分母用序数词表示，读分数时要先读分子然后再读分母。分子超过 1，则分母的序数词要加 s。如果一个分数有整数部分，整数和分数之间要加 and。",
            "C 百分数：符号 % 读作 percent [pə'sent]。",
          ] },
          { type: "table", head: ["形式", "英文读法"], rows: [
            ["4.96", "four point nine six"],
            ["34.08", "thirty-four point zero eight"],
            ["178.6", "one hundred and seventy-eight point six"],
            ["1,001.54", "one thousand and one point five four"],
            ["1/4", "one fourth = a quarter"],
            ["4/5", "four fifths"],
            ["7 5/8", "seven and five eighths"],
            ["2 1/2", "two and a half"],
            ["5%", "five percent"],
            ["100%", "a hundred percent"],
            ["0.36%", "zero point three six percent"],
            ["126%", "one hundred and twenty-six percent"],
          ] },
          { type: "examples", items: [
            { en: "We have finished eighty percent of it.", zh: "我们已完成了 80%。" },
          ] },
          { type: "tip", text: "表达分数时，基数词与序数词之间也可加“-”，如 four-fifths。" },
        ],
      },
      {
        heading: "九、数词的实际应用（6）表示数学运算",
        blocks: [
          { type: "table", head: ["运算", "英文表达"], rows: [
            ["加", "plus / and"],
            ["减", "minus"],
            ["乘", "times / multiplied by"],
            ["除", "divided by（亦可用 over 表达）"],
          ] },
          { type: "examples", items: [
            { en: "A: How much is two plus / and two? B: Two plus / and two is four.", zh: "——2 加 2 等于多少？——2 加 2 等于 4。" },
            { en: "A: How much is ten minus five? B: Ten minus five is equal to five.", zh: "——10 减 5 等于多少？——10 减 5 等于 5。" },
            { en: "A: How much is twenty-five times four? B: Twenty-five times four is equal to one hundred.", zh: "——25 乘 4 等于多少？——25 乘 4 等于 100。" },
            { en: "A: How much is one hundred divided by ten? B: One hundred divided by ten is equal to ten.", zh: "——100 除以 10 等于多少？——100 除以 10 等于 10。" },
            { en: "A: How much is one hundred over ten? B: One hundred over ten is equal to ten.", zh: "用 over 表达除法的说法。" },
          ] },
        ],
      },
      {
        heading: "十、数词的实际应用（7）表示次数",
        blocks: [
          { type: "text", text: "当我们表达“一次”的概念时，用 once；“两次”用 twice；“三次以上”用“基数词 + times”，如 nine times（九次）。" },
          { type: "examples", items: [
            { en: "I usually go to see my aunt twice a month. But last month I visited her four times, for she was ill.", zh: "我通常每个月去看望我姑姑两次。但是上个月她生病了，因此我去看望了她四次。" },
            { en: "He has tried once and he wants to try a second time. = He has tried once and he wants to try again.", zh: "他试了一次，他想再试一次。" },
          ] },
          { type: "tip", text: "“a + 序数词”表示再一次，相当于 again。另：表示“每逢”“每隔”用 every + 序数词 + 单数名词（every second day = every two days 每隔一天/每两天）或 every + 基数词 + 复数名词（every two weeks 每两周）。" },
          { type: "examples", items: [
            { en: "I go to the supermarket every second day. = I go to the supermarket every two days.", zh: "我每隔一天去一次超市。" },
            { en: "We visit our parents every two weeks.", zh: "我们每两周看望一次父母。" },
          ] },
        ],
      },
      {
        heading: "十一、Common Mistakes 常见失分陷阱",
        blocks: [
          { type: "text", text: "教材“注意！失分陷阱”专栏的 4 道例题（来源：上海、河北、重庆、福州中考）：" },
          { type: "table", head: ["例题", "考点与解析", "答案"], rows: [
            ["Now children, turn to page ____ and look at the ____ picture in Lesson Two.", "序数词与基数词的位置：数字在前用序数词，数字在后用基数词。page twenty（第 20 页）、the first picture（第一幅画）。", "D (twenty; first)"],
            ["The doctor worked for ____ after twelve o'clock.", "another 修饰数词时要放在数词前；more 修饰数词时要放在数词之后；D 项中 hour 应用复数。", "A (two more hours)"],
            ["Our summer holiday is coming. Two ____ the students in our school will go to the beach.", "hundred/thousand/million 表示确定数目时不用复数形式，200 个学生是确定数目，hundred 不加 s。", "C (hundred of)"],
            ["If you go out at night, you'll be able to see ____ stars.", "“hundreds / thousands / millions + of + 复数名词”表示“数以百/千/百万计的（成千上万的）”。", "B (thousands of)"],
          ] },
          { type: "pitfall", text: "数字在前用序数词、数字在后用基数词（the first picture / page twenty）；another、more 修饰数词时位置相反（two more hours / another two hours）。" },
        ],
      },
      {
        heading: "十二、实力测验（Final Check）",
        blocks: [
          { type: "text", text: "教材本章末“实力测验”含选择填空与汉译英两部分，可作为本章综合检测（题目见教材第 083 页，原书未附答案）。" },
          { type: "list", items: [
            "选择填空考查：基数词与序数词混用（eight/third）、forty 与 fortieth、分数 a quarter / one third、Row Five 编号表达、millions of、two-hundred-word composition（合成形容词用单数）。",
            "汉译英考查：一个半小时、在三楼、一个五个月大的婴儿、210 房间、第 22 路公共汽车、一篇 500 字的作文。",
          ] },
          { type: "tip", text: "“一篇 500 字的作文”用合成形容词：a five-hundred-word composition（数词 + 名词单数，用连字符连接）。" },
        ],
      },
    ],
    extras: {
      forms: [
        { name: "基数词整十位", pattern: "20—90 以 -ty 结尾；21—99 十位与个位之间加连字符", note: "twenty, thirty, twenty-one, forty-five" },
        { name: "基数词三位数及以上", pattern: "百位与十位之间加 and；1000 以上每三位加逗号，thousand / million", note: "one hundred and fifty-six；two thousand (and) eight" },
        { name: "序数词构成", pattern: "4—19 加 -th；整十位 -ty 改 -tieth；其他只把个位数改成序数词", note: "fifth, eighth, ninth, twelfth, twentieth, thirty-first" },
        { name: "序数词缩写", pattern: "1st / 2nd / 3rd / 11th / 21st / 32nd / 44th / 63rd", note: "1、2、3 用 st/nd/rd，其余用 th" },
        { name: "每逢 / 每隔", pattern: "every + 序数词 + 单数名词 = every + 基数词 + 复数名词", note: "every second day = every two days" },
      ],
      points: [
        {
          title: "基数词可作同位语",
          desc: "数词作同位语只限基数词，用来补充说明前面的代词或名词。",
          good: ["We two will go with you.", "Can you help us three with our maths?"],
          bad: ["We second will go with you."],
        },
        {
          title: "“a + 序数词”表示再一次",
          desc: "序数词前有时加不定冠词 a，表示再一次，相当于 again。",
          good: ["He wants to try a second time. = He wants to try again."],
          bad: ["He wants to try the second time.（表再一次时不用 the）"],
        },
        {
          title: "another / more 修饰数词的位置",
          desc: "another 修饰数词时放在数词前；more 修饰数词时放在数词之后；数词后的名词用复数。",
          good: ["another two hours", "two more hours"],
          bad: ["two another hours", "more two hours"],
        },
      ],
      contrasts: [
        { title: "数字在前 vs 数字在后", head: ["表达", "规则", "例"], rows: [
          ["数字在前", "用序数词", "the first picture（第一幅画）"],
          ["数字在后", "用基数词", "page twenty（第 20 页）"],
        ] },
        { title: "确定数目 vs 泛指", head: ["形式", "含义", "例"], rows: [
          ["hundred/thousand/million（单数）", "确定数目", "two hundred students"],
          ["hundreds/thousands/millions + of", "不确切数目", "thousands of stars"],
        ] },
      ],
      pitfalls: [
        "小数、分数读法：小数点读 point，小数点后逐位读基数词；分数“分子基数词 + 分母序数词”，分子超过 1 分母加 s。",
        "时刻表达：过了半点用 past，未到半点用 to；15 分 a quarter，30 分 a half。",
        "年龄“三十多岁、四十多岁”用 in one's thirties / forties，不能用 in one's thirty。",
        "序数词作定语一般要加 the；但“a + 序数词”表示“再一次”。",
      ],
      examTips: [
        "中考对数词的考查集中在：基数词与序数词的区分、hundred/thousand/million 的单复数与 of、分数与百分数、编号与时刻表达。",
        "记住口诀：有数字不加 s，没数字加 s 接 of。",
      ],
      memoryCard: [
        "“数字在前用序数，数字在后用基数”：the first picture / page twenty。",
        "数词修饰语位置：another two hours = two more hours。",
        "the ninth / the twelfth / the twentieth 是拼写高危词。",
      ],
    },
    notes: "yufan/数词 共 9 张全部查看（302—310）。其中 309（Common Mistakes）与 310（实力测验）为习题页，原书未附答案，本讲义只客观记录题干考点与解析要点，未编造答案。",
  },
];