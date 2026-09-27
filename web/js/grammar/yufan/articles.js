// web/js/grammar/yufan/articles.js
// 来源：yufan/冠词/（教材“第三章 冠词”扫描页 062—073，共 13 张）
// 目标专题：g-articles（已存在，本次为增量补充）

export default [
  {
    topicId: "g-articles",
    newTopic: false,
    title: "冠词",
    sourceDirs: ["yufan/冠词"],
    imagesRead: 13,
    summary: "冠词是虚词，本身无词义也不能单独使用，用在名词前帮助指明名词的含义；分为不定冠词 a/an 和定冠词 the。",
    intro: "不定冠词仅用在单数可数名词前面，表示“一”的意义，但不强调数目观念；定冠词表示特定的一个或一类人、事物，在可数名词的单、复数及不可数名词前都可以使用。",
    sections: [
      {
        heading: "一、不定冠词的形式",
        blocks: [
          { type: "text", text: "不定冠词仅用在单数可数名词前面，表示“一”的意义，但不强调数目观念，只表示某类人或物中不确定的一个。" },
          { type: "examples", items: [
            { en: "This is a poster of an action movie.", zh: "这是一张动作电影的海报。" },
            { en: "Beijing is a beautiful city.", zh: "北京是一座美丽的城市。" },
          ] },
          { type: "list", items: [
            "不定冠词有 a [ə] 和 an [ən] 两种形式。a 用于以辅音音素（不是辅音字母）开头的单词前，an 用于以元音音素（不是元音字母）开头的单词前。",
          ] },
          { type: "table", head: ["用 a", "用 an"], rows: [
            ["a European country", "an elephant"],
            ["a boy", "an island"],
            ["a university", "an onion"],
            ["—", "an honour"],
            ["—", "an umbrella（u 读 [ʌ]，前面也要用 an）"],
            ["—", "an hour"],
          ] },
          { type: "tip", text: "注意辨识是否是元音：e 和 u 虽是元音字母，但 European、university 的音标是 [j]、[ju:]，不是元音而是辅音，故用 a。" },
          { type: "pitfall", text: "注意 h 不发音：h 是辅音字母，但它不发音。hour 开头的音标是 [au]，是元音，故用 an。" },
          { type: "text", text: "形容词修饰名词时，不定冠词要放在形容词前，用 a 还是 an 取决于形容词的读音。" },
          { type: "table", head: ["原词组", "加形容词后"], rows: [
            ["a bike", "an old bike 一辆旧自行车"],
            ["an island", "a large island 一个巨大的岛"],
            ["a boy", "an honest boy 一个诚实的男孩"],
            ["an elephant", "a white elephant 一头白象"],
          ] },
        ],
      },
      {
        heading: "二、不定冠词的用法",
        blocks: [
          { type: "text", text: "1 用在可数名词的单数形式前面。" },
          { type: "list", items: [
            "A 表示一类事物或人中任意一个：There is an island over there. / Be sure to bring me a dictionary. / He works six days a week. / I found a small girl crying in the corner.",
            "B 表示一类事物或人，a/an 在此处不必翻译：An ear is an organ for listening. / A tiger is a wild animal. / A pig has a thin tail. / An owl can see in the dark.",
          ] },
          { type: "examples", items: [
            { en: "There is an island over there.", zh: "那儿有一个岛。" },
            { en: "Be sure to bring me a dictionary.", zh: "一定要给我带一本字典来。" },
            { en: "He works six days a week.", zh: "他一周工作六天。" },
            { en: "I found a small girl crying in the corner.", zh: "我发现一个小女孩在拐角处哭泣。" },
            { en: "An ear is an organ for listening.", zh: "耳朵是听觉器官。" },
            { en: "A tiger is a wild animal.", zh: "老虎是一种野生动物。" },
            { en: "A pig has a thin tail.", zh: "猪有条细尾巴。" },
            { en: "An owl can see in the dark.", zh: "猫头鹰能在黑暗中看见东西。" },
          ] },
          { type: "tip", text: "a/an 表示“一”：用在 hundred、thousand、million 等词前，具有 one 的意思，一般译成“一”。" },
          { type: "tip", text: "a 表示“一类”：a 在这里只表示某一类，实际上它的意义和 “Tigers are wild animals.” 一样。" },
          { type: "text", text: "2 用在专有名词前面，表示“一个”“一种”“一类”或“一个类似……的”。" },
          { type: "examples", items: [
            { en: "There was a Mr White living in that old house last year.", zh: "去年有个怀特先生住在那个老房子里。" },
            { en: "That city is a Venice in China.", zh: "那个城市是中国的威尼斯。" },
          ] },
        ],
      },
      {
        heading: "三、必背：含有 a 的词组",
        blocks: [
          { type: "table", head: ["词组", "含义", "词组", "含义"], rows: [
            ["have a word with sb", "和某人谈话", "have a drink", "喝点儿什么"],
            ["have a bath / a shower", "洗澡，淋浴", "have a swim", "游泳"],
            ["have a look (at)", "看一看", "have a talk", "谈话"],
            ["have a fever", "发烧", "have / take a walk", "散步"],
            ["have a good time", "过得愉快", "have a nice trip", "旅途愉快"],
            ["give a lesson", "授课", "have a rest", "休息一下"],
            ["in a word", "总之（一句话）", "many a", "（后接单数名词）许多"],
          ] },
        ],
      },
      {
        heading: "四、定冠词的发音",
        blocks: [
          { type: "text", text: "定冠词 the 只有一种书写形式，但发音有两种：它在辅音音素（不是辅音字母）开头的词前弱读为 [ðə]，在元音音素开头的词前重读为 [ði]。" },
          { type: "table", head: ["词组", "读音", "译文"], rows: [
            ["the situation", "weak [ðəˌsɪtʃu'eɪʃn]", "这种形势"],
            ["the big onion", "weak [ðə bɪɡ 'ʌnjən]", "这个大大的洋葱"],
            ["the Americans", "strong [ði ə'merɪkənz]", "这些美国人"],
            ["the old people", "strong [ði əʊld 'piːpl]", "这些老年人"],
          ] },
        ],
      },
      {
        heading: "五、定冠词的基本用法",
        blocks: [
          { type: "text", text: "定冠词表示特定的一个或一类人、事物，表示“这”“那”“这些”“那些”的意思，在可数名词的单、复数及不可数名词前都可以使用。" },
          { type: "examples", items: [
            { en: "This is the watch I borrowed yesterday.", zh: "这就是我昨天借的那只手表。" },
            { en: "The people I met there were very friendly.", zh: "我在那里遇到的人很友善。" },
          ] },
          { type: "list", items: [
            "1 用在带有定语的名词前面，特指某（些）人或某（些）事物：The students in that room are all from America. / Show me the photo of your family.",
            "2 用在重新提到的人或事物前面：He wrote a book last year. The book is about gardening. / I have a beautiful wallet, but the wallet was stolen yesterday.",
            "3 用在谈话双方都知道的人或事物前面：Please fill in the form and sign it. / Oh, you mean the boys. Open the window and you can see them.",
            "4 用在单数可数名词前面，表示某一类人或事物：The tiger is a wild animal.",
          ] },
          { type: "tip", text: "表示某一类人或事物时，可以用以下三种方法：The dog is a useful animal.（dog 前用定冠词）→ A dog is a useful animal.（dog 前用不定冠词）→ Dogs are useful animals.（dog 本身用复数）。" },
        ],
      },
      {
        heading: "六、定冠词的特殊用法",
        blocks: [
          { type: "text", text: "1 用在世界上独一无二的事物或方位名词前面。" },
          { type: "table", head: ["词组", "含义", "词组", "含义", "词组", "含义"], rows: [
            ["the east", "东方", "the west", "西方", "the south", "南方"],
            ["the north", "北方", "the left", "左边", "the right", "右边"],
            ["the world", "世界", "the universe", "宇宙", "the earth", "地球"],
            ["the Mars", "火星", "the moon", "月亮", "the sun", "太阳"],
          ] },
          { type: "examples", items: [
            { en: "We have friends all over the world.", zh: "我们的朋友遍天下。" },
            { en: "I live to the west of the Summer Palace.", zh: "我住在颐和园的西边。" },
          ] },
          { type: "list", items: [
            "2 用在序数词、形容词最高级及 only 所修饰的名词前面。",
            "3 用在江河、湖海、山脉、岛屿等地理专有名词前面。",
            "4 用在由普通名词构成的专有名词前面。",
            "5 用在姓氏的复数形式前面，表示全家人或这一姓的夫妇二人。",
            "6 用在乐器名词前面。",
            "7 和某些形容词连用，表示某一类人或事物。",
          ] },
          { type: "examples", items: [
            { en: "It's the second country that they will visit in Asia.", zh: "这是他们在亚洲要访问的第二个国家。" },
            { en: "Autumn is the best season in Beijing.", zh: "秋天是北京最好的季节。" },
            { en: "He is the only student who didn't pass the exam.", zh: "他是唯一一个没通过考试的学生。" },
            { en: "The Yangtze River is longer than the Yellow River.", zh: "长江比黄河长。" },
            { en: "The Taylors were having dinner when I came in.", zh: "当我进来时，泰勒全家人／泰勒夫妇正在吃饭。" },
            { en: "Don't forget to invite the Greens.", zh: "别忘了邀请格林夫妇。" },
            { en: "He can play the violin well, but he can't play the piano.", zh: "他小提琴拉得很好，可他不会弹钢琴。" },
            { en: "The poor are against the plan, but the rich are for it.", zh: "穷人们反对这个计划，而富人们赞成。" },
            { en: "She devoted her life to helping the poor.", zh: "她毕生都在帮助穷人。" },
          ] },
          { type: "table", head: ["用法", "例"], rows: [
            ["地理专有名词", "the English Channel 英吉利海峡；the Yangtze River 长江；the North China Plain 华北平原；the Yellow River 黄河"],
            ["普通名词构成的专有名词", "the Great Wall 长城；the United Nations / the UN 联合国；the People's Republic of China 中华人民共和国"],
            ["乐器名词", "play the flute 吹笛子；play the guitar 弹吉他；play the violin 拉小提琴；play the piano 弹钢琴"],
            ["the + 形容词", "the rich 富人；the poor 穷人；the deaf 聋人；the blind 盲人；the young 年轻人；the old 老人"],
          ] },
          { type: "tip", text: "the Taylors 有两种译法：可译为泰勒全家，也可译为泰勒夫妇。" },
          { type: "pitfall", text: "“the + 形容词”表示某一类人时，谓语动词需用复数形式（The poor are against the plan.）。" },
          { type: "pitfall", text: "一般情况下，专有名词前不用冠词，所以 China 之前不用冠词。" },
        ],
      },
      {
        heading: "七、必背：含有 the 的词组及句型",
        blocks: [
          { type: "table", head: ["词组", "含义", "词组", "含义"], rows: [
            ["in the daytime", "在白天", "at / in the beginning", "开始"],
            ["in the middle of…", "在……中间", "in the end", "最后，终于"],
            ["by the way", "顺便说一下", "the same as…", "同……一样"],
            ["in / at the front of…", "在某物的前部", "on the right / left", "在右边／左边"],
            ["the day before yesterday", "前天", "the day after tomorrow", "后天"],
            ["in the morning / afternoon / evening", "在上午／下午／晚上", "on the night of March 12th", "在 3 月 12 日的夜晚"],
          ] },
          { type: "text", text: "句型 1：What's the matter with…? = What's wrong with…?（……怎么了？）" },
          { type: "examples", items: [
            { en: "What's the matter with you? = What's wrong with you?", zh: "你怎么了？" },
          ] },
          { type: "text", text: "句型 2：the + 比较级……, the + 比较级……（越……越……）" },
          { type: "examples", items: [
            { en: "The sooner, the better.", zh: "越快越好。" },
            { en: "The more you eat, the fatter you get.", zh: "你吃得越多就越胖。" },
          ] },
        ],
      },
      {
        heading: "八、不用冠词的情况",
        blocks: [
          { type: "text", text: "1 专有名词、物质名词和抽象名词前不用冠词。" },
          { type: "table", head: ["类别", "例"], rows: [
            ["专有名词（人名、地名、节日、月份、国名等）", "Tom 汤姆；Shanghai 上海；German 德语；New Year's Day 元旦；Hyde Park 海德公园；Tian'anmen Square 天安门广场；May 五月；Friday 星期五；China 中国"],
          ] },
          { type: "examples", items: [
            { en: "Paper is made from bamboo.", zh: "纸是竹子做的。（物质名词，表示泛指）" },
            { en: "A fish can't live without water.", zh: "鱼儿离不开水。" },
            { en: "We love peace.", zh: "我们热爱和平。（抽象名词，表示一般概念）" },
            { en: "Don't give up hope.", zh: "不要放弃希望。" },
          ] },
          { type: "text", text: "2 表示一类人或事物的复数名词前不用冠词。" },
          { type: "examples", items: [
            { en: "We are all students.", zh: "我们都是学生。" },
            { en: "I like seeing films.", zh: "我喜欢看电影。" },
          ] },
          { type: "text", text: "3 有物主代词、指示代词、不定代词或名词所有格修饰的名词前不用冠词。" },
          { type: "table", head: ["正确（○）", "错误（×）"], rows: [
            ["his / my / her…schoolbag", "a / the his schoolbag"],
            ["this / that schoolbag", "a / the that schoolbag"],
            ["these / those schoolbags", "the both / all schoolbags"],
            ["both / all / (a) few schoolbags", "—"],
            ["Mike's school is over there.", "The Mike's school is over there."],
          ] },
          { type: "tip", text: "限定词不能连用：冠词对名词起限定作用，因此又称冠词为限定词；my、this 等也是限定词中的一种。在英语中，不能把两个限定词连起来使用。" },
          { type: "text", text: "4 表示特别含义的名词前不用冠词：在表示三餐、球类、棋类、游戏、季节、学科的名词前一般不用冠词。" },
          { type: "examples", items: [
            { en: "He usually has (his) supper at home.", zh: "通常他都在家里吃晚饭。" },
            { en: "Neither volleyball nor basketball is a hundred years old.", zh: "排球和篮球都没有一百年的历史。" },
            { en: "We like eating watermelons in summer.", zh: "夏天我们喜欢吃西瓜。" },
            { en: "Little Tom goes to school in September. He likes all subjects except chemistry.", zh: "小汤姆九月份去上学了，除了化学之外，他喜欢所有的学科。" },
          ] },
          { type: "text", text: "5 家庭成员的名称、称呼语或只有一个人担任的职务名词前不用冠词。" },
          { type: "examples", items: [
            { en: "If you promise me, I'll make you king.", zh: "如果你答应我，我会让你当上国王。" },
            { en: "Dad is on business in Shanghai.", zh: "爸爸在上海出差。" },
            { en: "Sir, please show me another one.", zh: "先生，请给我看看另外一个。" },
          ] },
          { type: "tip", text: "家庭成员名称的表示：这时家庭成员名称即使不在句首，其首字母也要大写；如果有必要，可以在家庭成员的名称前加 my、our 等物主代词。" },
          { type: "text", text: "6 与 by 连用的交通工具名称前（表示方式时）不用冠词：by car 乘汽车、by taxi 乘出租车、by bike 骑自行车、by mail 邮寄、by land 由陆路、by sea 由水路。" },
          { type: "text", text: "7 两个相同或相对的名词构成的平行结构前不用冠词。两个关系密切、经常成对使用的单数可数名词，或者由介词或连词连结成的平行结构，其前面的冠词经常省略。" },
          { type: "table", head: ["词组", "含义", "词组", "含义"], rows: [
            ["day and night", "日夜", "from head to foot", "从头到脚"],
            ["heart and soul", "全心全意地", "from right to left", "从右到左"],
            ["man and boy", "从小到大", "face to face", "面对面"],
            ["father and son", "父子", "arm in arm", "臂挽着臂"],
            ["husband and wife", "夫妻", "day after day", "日复一日"],
            ["pen and ink", "笔墨", "inch by inch", "一点点地"],
            ["knife and fork", "刀叉", "side by side", "肩并肩"],
          ] },
          { type: "examples", items: [
            { en: "The workers built the bridge day and night.", zh: "工人们日夜不停地修建桥梁。" },
            { en: "I want pen and ink.", zh: "我需要笔墨。" },
          ] },
          { type: "text", text: "8 在有些词组中，有无冠词含义不同。" },
          { type: "table", head: ["形式", "含义"], rows: [
            ["go to school (to study)", "去上学"],
            ["go to bed (to sleep)", "就寝"],
            ["go to market (to buy or sell)", "去市场"],
            ["go to church (to pray)", "去做礼拜"],
            ["go to the bed", "到床跟前去"],
            ["go to the church", "去教堂"],
          ] },
          { type: "tip", text: "school、church、market、bed 等为表示“处所”的名词，当它们只是指与这些“处所”的用途或功能有关的活动，而不是指具体地点时，其前面通常不加冠词；当指明地点，或是为其他目的去这些地方时，它们前面就要加上冠词。" },
        ],
      },
      {
        heading: "九、必背：不带冠词的词组",
        blocks: [
          { type: "table", head: ["词组", "含义"], rows: [
            ["go to hospital", "去医院看病"],
            ["go to prison", "进监狱（成为犯人）"],
            ["go to church", "做礼拜"],
            ["go to market", "去市场（买／卖东西）"],
            ["go to college", "上大学（读书）"],
            ["catch fire", "着火"],
            ["by bus / train / plane / air / sea / water", "乘公共汽车／火车／飞机／轮船"],
            ["by bike", "骑自行车"],
            ["on foot", "步行"],
          ] },
        ],
      },
      {
        heading: "十、Common Mistakes 常见失分陷阱",
        blocks: [
          { type: "table", head: ["例题", "考点与解析", "答案"], rows: [
            ["A: Do you play ____ piano in your free time? B: No, I like sports. I often play ____ soccer with my friends.（福州中考）", "乐器名词前要用定冠词 the，球类名词前不用冠词。", "B (the; /)"],
            ["Mary has a bad cold. She has to stay in ____ bed.（长沙中考）", "stay in bed 是固定短语，不用冠词，表示“待在床上休息”。", "B (/)"],
            ["What ____ useful book! And ____ book is popular with students.（达州中考）", "useful 以辅音音素开头用 a；第二个空考查第二次提到的事物用 the。", "D (a; the)"],
            ["I usually have an egg, some bread and ____ cup of milk for ____ breakfast.（成都中考）", "a cup of milk 中 a 表示数量“一”；三餐名词前一般不用冠词。", "C (a; /)"],
          ] },
          { type: "pitfall", text: "乐器名词前用 the，球类运动名词前不用冠词，是最容易出错的地方。另：专有名词前一般不用冠词，但民间节日前要加 the（the Spring Festival 春节、the Mid-Autumn Festival 中秋节）。" },
        ],
      },
      {
        heading: "十一、实力测验（Final Check）",
        blocks: [
          { type: "text", text: "教材本章末“实力测验”含三部分（第 071—073 页）：1 用适当的冠词（a/an, the）填空，不需要填冠词时用“/”表示（21 小题）；2 用适当的冠词填写下列短文（2 段对话/短文，共 27 空）；3 选择填空（12 小题）。原书未附答案，此处只记录考点分布。" },
          { type: "list", items: [
            "填空部分集中考查：go to school by bus、in an hour、go to bed、on the second floor、have a shower、the name of the theatre、at the airport、turn off the lights、have dinner in a restaurant、£15 an hour、arrive in Paris on the third of August、the same street、a teacher in a school 等。",
            "选择填空集中考查：a/an 的读音判断（useful/egg）、the + 序数词、乐器前 the 与球类前零冠词、go to school on foot、take a walk、after school、a good habit、a useful one。",
          ] },
          { type: "tip", text: "做题流程：先判断名词是可数还是不可数、是特指还是泛指，再看读音（辅音音素用 a，元音音素用 an），最后检查是否属于“不用冠词”的固定结构。" },
        ],
      },
    ],
    extras: {
      forms: [
        { name: "不定冠词选择 a 还是 an", pattern: "看紧跟其后的那个词的读音：辅音音素前用 a，元音音素前用 an", note: "a university；an hour；an honest boy；a European country" },
        { name: "定冠词 the 的读音", pattern: "辅音音素前弱读 [ðə]；元音音素前重读 [ði]", note: "the situation [ðə]；the old people [ði]" },
        { name: "the + 比较级…, the + 比较级…", pattern: "表示“越……越……”", note: "The more you eat, the fatter you get." },
        { name: "the + 形容词", pattern: "表示某一类人，谓语动词用复数", note: "the rich / the poor / the blind / the young" },
      ],
      points: [
        {
          title: "定冠词用于“重新提到”的事物",
          desc: "第一次提到用不定冠词，第二次提到（特指前面那个）用定冠词。",
          good: ["He wrote a book last year. The book is about gardening.", "I have a beautiful wallet, but the wallet was stolen yesterday."],
          bad: ["I have a beautiful wallet, but a wallet was stolen yesterday.（特指前面那个钱包应用 the）"],
        },
        {
          title: "有无冠词含义不同",
          desc: "go to school / church / market / bed 指与处所功能有关的活动时不加冠词；指具体地点或因其他目的前往时要加 the。",
          good: ["go to school (to study) 去上学；go to bed (to sleep) 就寝", "go to the church 去教堂；go to the bed 到床跟前去"],
          bad: ["go to the school（表示“去上学”时不用 the）"],
        },
        {
          title: "姓氏复数前用 the 表示全家或夫妇",
          desc: "the + 姓氏复数 = 全家人或这一姓的夫妇二人。",
          good: ["The Taylors were having dinner when I came in.", "Don't forget to invite the Greens."],
          bad: ["Taylors were having dinner when I came in."],
        },
      ],
      contrasts: [
        { title: "a/an · the · 零冠词 速判", head: ["形式", "核心含义", "典型例"], rows: [
          ["a / an", "泛指某类中不确定的一个", "a tiger is a wild animal；an hour"],
          ["the", "特指（独一无二、上文提过、带定语、序数词/最高级/乐器/方位）", "the sun；the book I bought；play the piano"],
          ["零冠词", "专有名词、物质/抽象名词、复数泛指、三餐/球类/学科/季节、by + 交通工具、平行结构", "China；We love peace.；play soccer；by bus；day and night"],
        ] },
        { title: "有无冠词含义不同", head: ["不用冠词（功能）", "用冠词（地点/其他目的）"], rows: [
          ["go to school 去上学", "go to the school 到那所学校去"],
          ["go to church 做礼拜", "go to the church 去教堂"],
          ["go to bed 就寝", "go to the bed 到床跟前去"],
        ] },
      ],
      pitfalls: [
        "判断 a/an 看的是读音不是字母：a university、a European country，但 an hour、an honest boy。",
        "形容词修饰名词时，冠词放在形容词前，a/an 由形容词的读音决定（a bike → an old bike）。",
        "“the + 形容词”表示一类人时，谓语动词用复数：The poor are against the plan.",
        "民间节日前用定冠词（the Spring Festival、the Mid-Autumn Festival），但专有名词、月份、星期前不用冠词。",
        "限定词不能连用：不能说 a his schoolbag / the both schoolbags。",
      ],
      examTips: [
        "中考冠词的考查集中在三件事：a 还是 an（看读音）、用不用 the（特指 / 独一无二 / 序数词 / 最高级 / 乐器）、该不该用冠词（三餐、球类、学科、by + 交通工具、固定短语）。",
        "乐器前用 the、球类前不用冠词，是最高频的失分点。",
      ],
      memoryCard: [
        "a 辅音音素，an 元音音素；看读音，不看字母。",
        "乐器要加 the，球类不加冠词。",
        "第一次 a，第二次 the。",
        "the poor / the rich 作主语，谓语用复数。",
      ],
    },
    notes: "yufan/冠词 共 13 张全部查看（289—301）。其中 298（Common Mistakes）、299—301（实力测验）为习题页，原书未附答案；本讲义对 Common Mistakes 记录了教材给出的正确解析与答案，对实力测验仅记录考点分布，未编造答案。",
  },
];