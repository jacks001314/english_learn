// web/js/grammar/yufan/prepositions.js
// 数据来源：yufan/介词（23 张教材扫描图片，第 7 章「介词」，p.124—p.145）
// 契约见同目录 README.md。自检：node --check web/js/grammar/yufan/prepositions.js

export default [
  {
    topicId: "g-prepositions",
    newTopic: false,
    title: "介词（讲义精讲）",
    sourceDirs: ["yufan/介词"],
    imagesRead: 23,
    summary:
      "介词是虚词，必须与名词、代词等构成介词短语才能担任句子成分。本章按「介词种类 → 时间介词 → 场所/方向介词 → 其他介词 → 介词固定搭配」系统梳理，并补充 by/until、for/during、in/within、from/since 等易混对比。",
    intro:
      "介词数量不多，但每个介词常具有多种意思，使用频率很高。学习时先抓「介词短语的四种句法功能」，再按时间、场所、方向三条线索分类记忆，最后集中突破动词、形容词与介词的固定搭配。",
    sections: [
      {
        heading: "一、介词的种类和介词短语的用法",
        blocks: [
          {
            type: "text",
            text: "介词是一种虚词。它不能单独在句子中担任成分，需要和名词、代词或相当于名词的其他词类、短语、从句构成介词短语，担任句子的成分。介词的数量并不多，但每个介词常具有多种意思，并且使用频率较高，所以学好介词很关键。",
          },
          {
            type: "table",
            head: ["类型", "说明", "例词"],
            rows: [
              ["简单介词", "只是一个单词", "in, on, after, before, at, by, for, from, above, over, under"],
              ["短语介词", "由两个或两个以上的单词集合而成", "out of, in front of, because of, instead of"],
            ],
          },
          {
            type: "text",
            text: "「介词 + 名词/代词」形成介词短语，可以作定语、状语、表语和宾语补足语，其中作定语时一律后置。",
          },
          {
            type: "list",
            items: [
              "作定语：The mobile phone on the desk is mine.（桌子上的手机是我的。）",
              "作状语：Classes begin at eight.（八点钟开始上课。）",
              "作表语：He is in danger.（他处于危险之中。）",
              "作宾语补足语：Make yourself at home.（随意一些，就和在你自己家一样。）",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "The girl with long hair is my elder sister.", zh: "那个长头发的女孩是我姐姐。" },
              { en: "Nancy put her book on the desk.", zh: "南希把她的书放在了桌上。" },
              { en: "He bought a villa with fine scenery.", zh: "他买了一栋风景优美的别墅。" },
              { en: "A gentleman in white came into the hall.", zh: "一个穿白衣服的绅士走进了大厅。" },
              { en: "Jane looks younger for her age.", zh: "简看起来比她的实际年龄年轻。" },
              { en: "To my surprise, Li Ming passed the exam at all.", zh: "让我感到惊讶的是，李明居然考试及格了。" },
              { en: "We made Brian out of danger.", zh: "我们使布莱恩脱离了危险。" },
            ],
          },
          {
            type: "tip",
            text: "图片「比较」框提示：介词短语作定语与形容词作定语不同——a book on the desk（介词短语修饰名词，后置）与 an interesting book（形容词修饰名词，前置）；介词短语作状语与副词作状语也不同——stand on the hill（介词短语修饰动词）与 stand there（副词修饰动词）。",
          },
          {
            type: "tip",
            text: "介词的两条分类线索（图片小结）：按意义可分为时间介词（at）、地点介词（on、at、in 等）、方式介词（by）和原因介词（because of）等。",
          },
        ],
      },
      {
        heading: "二、表示时间的介词：总表与 at / on / in",
        blocks: [
          {
            type: "table",
            head: ["类别", "举例"],
            rows: [
              ["表示年、月、日、时刻", "at, on, in"],
              ["表示时间的前后", "before, after"],
              ["表示期限", "by, until, till"],
              ["表示期间", "for, during, through"],
              ["表示时间的起点", "from, since"],
              ["表示时间的经过", "in, within"],
            ],
          },
          {
            type: "text",
            text: "1. at 用于表示时刻、时间的某一点。",
          },
          {
            type: "list",
            items: [
              "at lunch 在午餐时 / at noon 正午时 / at night 在夜间 / at dawn 在黎明",
              "at present 目前 / at that time 那时 / at the moment 此刻，目前 / at the same time 同时",
              "at first 起初，开始的时候 / at last 最后 / at times 偶尔，有时 / at nine (o'clock) 在9点钟",
              "at the Spring Festival 在春节 / at the Lantern Festival 在元宵节 / at the end of (the) year 在年末 / at this time of (the) year 在一年中的这个时候",
              "at / on the weekend 在周末",
            ],
          },
          {
            type: "examples",
            items: [{ en: "We usually have lunch at twelve.", zh: "我们通常12点吃午饭。" }],
          },
          {
            type: "text",
            text: "2. on 用于表示某天、某一天的上、下午（指具体的某一天时，一律用 on）。",
          },
          {
            type: "list",
            items: [
              "on Monday 在周一 / on Tuesday morning 在周二早上 / on your birthday 在你生日那天",
              "on August 8, 2008 在2008年8月8日 / on a fine morning 在一个晴朗的早晨 / on a cold night 在一个寒冷的夜晚",
              "on the New Year's Eve 在除夕 / on the morning of National Day 在国庆节的上午 / on Children's Day 在儿童节那天 / on the night of July (the) first 在7月1日的夜晚",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "We didn't listen to the lecture on Wednesday afternoon.", zh: "周三下午我们没去听演讲。" },
            ],
          },
          {
            type: "text",
            text: "3. in 用于表示月、季节、年和泛指的上、下午、晚上（指在一段时间内）。",
          },
          {
            type: "list",
            items: [
              "in January 在一月 / in March 在三月 / in May 在五月 / in November 在十一月",
              "in the morning 在上午 / in the afternoon 在下午 / in the evening 在晚上",
              "in spring 在春季 / in summer 在夏季 / in autumn 在秋季 / in winter 在冬季",
              "in 2010 在2010年 / in September, 2018 在2018年9月 / in the 21st century 在21世纪",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "People go skating in winter.", zh: "人们冬天去滑冰。" },
              { en: "I will come in the evening.", zh: "我晚上会过来。" },
            ],
          },
          {
            type: "tip",
            text: "图片「切记」框：泛指一般的上午、下午时用 in（in the morning 在早上）；特指某日的上午、下午时用 on（on Sunday morning 在周日早上）。",
          },
          {
            type: "pitfall",
            text: "图片「注意」框：在 this、last、next、every 等词前面不能再加其他介词——this morning 今天上午、last Friday 上周五、next Sunday 下周日、every Monday / week / spring 每周一/每星期/每个春季。例：They had a bad harvest that year.（他们那年的收成很差。）",
          },
        ],
      },
      {
        heading: "三、时间介词的细分用法（before/after、by/until、for/during/through、from/since、in/within）",
        blocks: [
          {
            type: "text",
            text: "1. before / after：既可作介词，又可作连词。",
          },
          {
            type: "examples",
            items: [
              {
                en: "All passengers must arrive at the airport two hours before the departure time.",
                zh: "所有的乘客必须在登机前两个小时到达机场。（before 作介词）",
              },
              {
                en: "He will call me before he leaves here / before ten o'clock.",
                zh: "他离开这儿/10点之前，将给我打电话。（前一空 before 作连词，后一空作介词）",
              },
              {
                en: "The nights start after half past five in winter.",
                zh: "在冬天下午五点半以后夜晚就开始降临了。（after 作介词）",
              },
              {
                en: "Please close the door after you leave the room.",
                zh: "离开房间后请把门关上。（after 作连词）",
              },
            ],
          },
          {
            type: "text",
            text: "2. by 表示「在……前（时间）；截止到……」；until / till 表示「直到……为止（时间）」。",
          },
          {
            type: "list",
            items: [
              "by the end of 在……底（之前） / by then 到那时 / by the time + 从句 在……之前",
              "by six o'clock 在6点之前 / by next Friday 在下周五之前",
            ],
          },
          {
            type: "examples",
            items: [
              {
                en: "How many English books had you read by the end of last year?",
                zh: "到去年年底以前你看过多少本英文书？",
              },
              { en: "Ada had left by the time I arrived.", zh: "我到时/之前艾达已经走了。" },
              {
                en: "They won't come back until / till the end of the year.",
                zh: "他们到年底才会回来。（come 是终止性动词，所以用否定式）",
              },
              {
                en: "I'll wait for him until he comes here.",
                zh: "我将在这儿一直等到他来。（wait 是延续性动词，所以用肯定式）",
              },
            ],
          },
          {
            type: "pitfall",
            text: "until 和 till 可以通用，二者还可以作从属连词、引导时间状语从句，而 by 不能。by seven o'clock 是「截至7点钟」（一般和完成时连用）；until seven o'clock 是「直到7点（7点以前）」。",
          },
          {
            type: "text",
            text: "3. for 表示「达……之久（表示经过了多少时间）」；during 表示「在……期间」；through 表示「一直……（从开始到结束）」。for 可以和一般现在时、过去时、将来时连用，但最常和完成时连用。",
          },
          {
            type: "examples",
            items: [
              { en: "He has lived in Los Angeles for 50 years.", zh: "他在洛杉矶已经住了50年了。" },
              {
                en: "Oh! We have to stay here for an hour. What a waste of time!",
                zh: "啊！我们要在这儿待一个小时。太浪费时间了！",
              },
              { en: "Where will you go during the summer?", zh: "今年夏天你打算去哪儿？" },
              {
                en: "They are going to have a good rest during the winter holidays.",
                zh: "寒假中他们打算好好休息一下。",
              },
              { en: "They played cards through the night.", zh: "他们打了一整夜的牌。" },
              { en: "Paul stayed in London through the winter.", zh: "保罗整个冬天都待在伦敦。" },
            ],
          },
          {
            type: "table",
            head: ["介词", "含义", "说明与常用短语"],
            rows: [
              [
                "for",
                "达……之久",
                "for 之后大多跟表示时间、具体天数等的数字名词：for a year, for a few days, for twenty weeks",
              ],
              [
                "during",
                "在……期间",
                "during 后不接表示数字的名词：during the lesson 上课期间, during the war / the night 战争期间/夜间",
              ],
              ["through", "一直……（从开始到结束）", "表示自始至终贯穿整个时间段"],
            ],
          },
          {
            type: "text",
            text: "4. from 表示「从……（时间）起」；since 表示「自从……以来（表示从以前某时一直到现在仍在继续）」。",
          },
          {
            type: "examples",
            items: [
              { en: "The meeting will be held from eight to ten.", zh: "会议将从8点开到10点。" },
              { en: "The meeting will be held at eight.", zh: "会议将从8点钟开始。" },
              {
                en: "I have played the piano since 2006.",
                zh: "我从2006年开始弹钢琴。（强调一直弹到现在）",
              },
              {
                en: "The doctor has saved a lot of lives since he became a doctor.",
                zh: "这个医生自行医以来已经挽救了许多人的生命。（since 作连词，引导时间状语从句）",
              },
            ],
          },
          {
            type: "table",
            head: ["介词", "用法", "说明"],
            rows: [
              [
                "from",
                "从……（时间）起",
                "表示「从……开始」时一般用词组 from...to...，而单纯表示确切的「从几点开始」时用 at；from 用于现在时、过去时及将来时态，只能作介词",
              ],
              [
                "since",
                "自从……以来",
                "表示时间时一般只用于完成时的句子；since 还可以作连词",
              ],
            ],
          },
          {
            type: "text",
            text: "5. in 表示「过……之后（未来时间）」；within 表示「不超过……的范围」。in 大多用于将来时（一般将来时和过去将来时）。",
          },
          {
            type: "list",
            items: [
              "in an hour 一小时之后 / in a week or so 大约一星期之后",
              "within 3 hours 3个小时之内 / within a week 一周之内",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "He will be back in five hours.", zh: "他5个小时之后回来。" },
              { en: "They said they would arrive here in a week.", zh: "他们说一周后到达。" },
              {
                en: "I must finish painting the cat within five minutes.",
                zh: "我必须在5分钟之内画好这只猫。",
              },
              {
                en: "They worked hard. They finished the work within 2 days at last.",
                zh: "他们工作很努力，终于在两天之内完成了这项工作。",
              },
            ],
          },
          {
            type: "pitfall",
            text: "in 以现在为基准，指「从现在起……之后」，所以一般只用于将来时；within 强调「在……范围之内」，没有时态限制。用过去时表示「过后」时要用 after：She went to Nanjing in May, and she came back after a month.（去年5月她去了南京，一个月之后她又回来了。）",
          },
        ],
      },
      {
        heading: "四、表示场所、方向的介词",
        blocks: [
          {
            type: "text",
            text: "表示场所的介词：at、in、on、under、by、near、between、around、opposite 等；表示方向的介词：into、out of、along、across、through、up、down、past 等。",
          },
          {
            type: "table",
            head: ["介词", "用法", "常用搭配"],
            rows: [
              [
                "at",
                "在某地点（表示比较狭窄的场所）",
                "at the school gate 在学校门口 / at home 在家 / at 2 Baker Street 在贝克街2号 / at the door 在门边 / at the bottom of 在……下面（底部）/ at the back of 在……后边 / at the head of 在……排头 / at the crossroads 在十字路口 / at the bus stop 在公共汽车站 / at my desk 在我的书桌旁",
              ],
              [
                "in",
                "在某地（表示比较宽敞的场所）",
                "in Beijing 在北京 / in China 在中国 / in the yard 在院子里 / in the middle 在中部 / in the air 在空中 / in the world 在世界上 / in the street 在街上 / in a room 在房间里 / in the open air 在户外",
              ],
              [
                "on",
                "在……上面（有接触面）；在靠近……的地方",
                "on the desk 在桌子上面 / on the map 在地图上 / on the right 在右边 / on the river 在河边",
              ],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "I'll meet him at the Beijing railway station.", zh: "我将去北京站接他。" },
              {
                en: "Shenzhen is a very crowded city in the south of China.",
                zh: "深圳是中国南方一个非常拥挤的城市。",
              },
              { en: "There are two maps on the wall.", zh: "墙上有两幅地图。" },
            ],
          },
          {
            type: "text",
            text: "图片「比较」框：英语中有些词组有没有定冠词 the，意义区别很大。",
          },
          {
            type: "table",
            head: ["词组（无 the）", "含义", "词组（有 the）", "含义"],
            rows: [
              ["at table", "在进餐", "at the table", "在桌旁"],
              ["in hospital", "在医院（住院）", "in the hospital", "在医院（工作或探望……）"],
              ["in / at church", "在做礼拜", "in / at the church", "在教堂里"],
              ["in prison", "在监狱（服刑）", "in the prison", "在监狱（工作或探望……）"],
            ],
          },
          {
            type: "examples",
            items: [
              {
                en: "His brother is in prison. He was arrested two years ago.",
                zh: "他哥哥两年前被捕的，现在在监狱服刑。",
              },
              { en: "Mike works in the prison.", zh: "迈克在监狱工作。" },
            ],
          },
          {
            type: "text",
            text: "on / above / over / under / below 的方位分工：",
          },
          {
            type: "table",
            head: ["介词", "含义", "例句"],
            rows: [
              ["on", "在……上面（有接触面）；也指在靠近……的地方", "There are two maps on the wall."],
              [
                "above",
                "在……上方（位置高于，不一定是正上方；below 的反义词）",
                "The sun rose above the horizon. / Our plane flew above the clouds.",
              ],
              [
                "over",
                "在……正上方（under 的反义词）；还有「遍及、超过、越过」等含义",
                "There is a light over Li Ming. / There is a stone arch bridge over the river. / over the world, over 40 books, over the wall",
              ],
              ["under", "在……下面（正下方）", "The dog is under the tree."],
              [
                "below",
                "在……下面（不一定是正下方）",
                "There are a lot of fishes below the surface of the water. / Don't write your answer below this line.",
              ],
            ],
          },
          {
            type: "text",
            text: "near 表示「在……附近；靠近」，还可以修饰时间，如 in the near future 表示「在不久的将来」；by 表示「在……旁边」，距离比 near 要近，「在……旁边」有时也可以用 beside 表示。",
          },
          {
            type: "examples",
            items: [
              { en: "Do you live near here?", zh: "你住在这附近吗？" },
              { en: "Is there a bus stop near here?", zh: "这附近有公共汽车站吗？" },
              { en: "The boy is standing by the window.", zh: "这个男孩正站在窗户旁边。" },
            ],
          },
          {
            type: "text",
            text: "between 表示「在两者之间」；among 表示「在三者或更多的人或事物之中」；around 表示「环绕，在……周围，在……四周」。",
          },
          {
            type: "examples",
            items: [
              { en: "Our teacher is sitting between Tom and Mike.", zh: "我们的老师正坐在汤姆和迈克之间。" },
              { en: "What's the difference between A and B?", zh: "A和B之间有什么区别？" },
              { en: "There is a beautiful castle among the trees.", zh: "树林中有座漂亮的城堡。" },
              { en: "He is very popular among the students.", zh: "他在学生之中很受欢迎。" },
              { en: "We sat around the table.", zh: "我们围坐在桌旁。" },
              { en: "The earth moves around the sun.", zh: "地球围绕太阳转。" },
            ],
          },
          {
            type: "text",
            text: "in front of 表示「在……的前面（强调外部）」；in the front of 表示「在……的前部（强调内部）」；behind 表示「在……后面」（in front of 的反义词，可用 at the back of 替换）；opposite 表示「在……对面」。",
          },
          {
            type: "examples",
            items: [
              {
                en: "There is a tree in front of the classroom.",
                zh: "在教室前面有一棵树。（强调外部）",
              },
              {
                en: "There is a big desk for the teacher in the front of the classroom.",
                zh: "在教室的前部有一张给老师用的大讲桌。（强调内部）",
              },
              {
                en: "There is a cherry tree behind my house. = There is a cherry tree at the back of my house.",
                zh: "我家房子后面有一棵樱桃树。（可以用 at the back of 替换 behind）",
              },
              { en: "Our school is opposite a university.", zh: "我们学校在一所大学的对面。" },
              { en: "He stood opposite me.", zh: "他站在我对面。" },
            ],
          },
          {
            type: "pitfall",
            text: "in front of 与 before 都表示「在……之前」，但表示场所时要用 in front of 而不用 before；before 用于表示时间、名单或次序等。",
          },
          {
            type: "text",
            text: "in 表示静止的位置（在……之内）；into 表示「进入」，表示有特定终点的运动方向，通常用于 go、come 等动作动词之后；out of 表示「出来」，也表示有一定的运动方向；up 表示「向上，向高处」。",
          },
          {
            type: "examples",
            items: [
              { en: "The students are in the classroom.", zh: "学生们在教室里。" },
              {
                en: "I could feel the air of tension in the room.",
                zh: "我可以感觉到房间里的紧张气氛。",
              },
              { en: "The students ran into the classroom.", zh: "学生们跑进了教室。" },
              { en: "He jumped into the water.", zh: "他跳入了水中。" },
              {
                en: "The students rushed out of the room excitedly.",
                zh: "学生们兴奋地冲出了房间。",
              },
              { en: "The children climbed up that tree.", zh: "孩子们爬上了那棵树。" },
              { en: "We climbed slowly up the hill.", zh: "我们缓慢地爬上了山。" },
            ],
          },
          {
            type: "pitfall",
            text: "out of 与 from 的区别：out of 表示「由内往外」的动作，from 表示「从……（起点）起」（Tom went out of the room with Li Ming. / The train is from Boston.）。out of 还可表示「在……范围之外」「用……（材料）」「没有、缺少」：Don't lean out of the window! / He has been out of work for a year.",
          },
          {
            type: "text",
            text: "along 表示「沿着，沿着……的边缘」；across 表示「横过，穿过，越过；在对面」；past 表示「经过，越过」；through 表示「贯穿，通过」。",
          },
          {
            type: "examples",
            items: [
              {
                en: "I was walking along the river when it began to rain.",
                zh: "我正沿着河边散步，突然下起雨来了。",
              },
              { en: "He often swims across the river.", zh: "他经常游泳横渡这条河。" },
              {
                en: "She went across the street to do some shopping.",
                zh: "她去街对面购物了。",
              },
              {
                en: "The hospital is a kilometre past the post office.",
                zh: "医院就在过了邮局一千米处。",
              },
              { en: "Every day he runs past the city hall.", zh: "他每天跑步经过市政厅。" },
              { en: "The Seine River flows through the city.", zh: "塞纳河穿过这个城市。" },
              {
                en: "The sun shone through the clouds.",
                zh: "阳光穿过云层照射下来。",
              },
            ],
          },
          {
            type: "text",
            text: "to 表示「到达……地点（目的地）或方向」；for 表示目的地时，一般是和固定动词搭配（leave for 动身去…… / start for 出发去……）；from 表示「从……起（表示起点）」。",
          },
          {
            type: "examples",
            items: [
              {
                en: "How long does it take to get to the airport?",
                zh: "到机场要用多长时间？",
              },
              {
                en: "Jeffery has never been to another country.",
                zh: "杰弗瑞还没有去过别的国家。",
              },
              {
                en: "I am going on a study trip to Hong Kong.",
                zh: "我打算去香港做一次学习旅行。",
              },
              {
                en: "What time does your plane leave for America tomorrow?",
                zh: "明天你的航班何时启程去美国？",
              },
              {
                en: "It takes about thirty minutes to get to the zoo from the bus stop on foot.",
                zh: "从车站到动物园步行大约需30分钟。",
              },
              { en: "How far is it from Beijing to Hong Kong?", zh: "从北京到香港有多远？" },
            ],
          },
          {
            type: "pitfall",
            text: "to 与 towards 的区别：to 表示到达某地，一般指目的地；towards 指方向、朝向，而不是目的地。He walked towards the gate of the park.（他朝着公园大门走去。——大门不是目的地）",
          },
        ],
      },
      {
        heading: "五、其他常用介词（方式、材料、其他）",
        blocks: [
          {
            type: "text",
            text: "with 的三种用法：(1) 和……在一起；(2) 具有，带有；(3) 用某种工具或方法。",
          },
          {
            type: "examples",
            items: [
              {
                en: "I am going on a package tour to Beijing with my mother.",
                zh: "我打算与妈妈参加全包旅游去北京。",
              },
              {
                en: "He was a handsome boy with large bright eyes.",
                zh: "他是一个英俊的男孩，有着一双明亮的大眼睛。",
              },
              { en: "Lily cut her hand with a knife.", zh: "莉莉用刀把手弄破了。" },
              { en: "I see with my eyes.", zh: "我用眼睛看。" },
              {
                en: "What will you buy with the gift money?",
                zh: "你会用压岁钱买什么？",
              },
              {
                en: "With the teacher's help I have made great progress.",
                zh: "在老师的帮助下，我取得了巨大进步。（with one's help 表示「在某人的帮助下」）",
              },
            ],
          },
          {
            type: "tip",
            text: "图片「说明」框：「with（+形容词）+名词」构成的介词短语可以作定语，放在所修饰名词后面，表示名词的特征。",
          },
          {
            type: "text",
            text: "in 表示用什么材料（如墨水、铅笔等），或用什么语言，或表示衣着、声调特点。",
          },
          {
            type: "examples",
            items: [
              { en: "She wrote a letter in black ink.", zh: "她用黑色的墨水写信。" },
              { en: "Don't write it in pencil but in ink.", zh: "别用铅笔写，用钢笔写。" },
              { en: "Can you speak in English?", zh: "你能用英语说吗？" },
            ],
          },
          {
            type: "table",
            head: ["介词", "搭配要求", "例子"],
            rows: [
              [
                "with",
                "后面的名词要加上冠词或代词",
                "with my ears 用我的耳朵 / with a pencil 用一支铅笔",
              ],
              ["in", "后面加物质名词，不能加冠词", "in ink 用墨水（钢笔）/ in pencil 用铅笔"],
            ],
          },
          {
            type: "text",
            text: "by 表示「通过……方法/手段」；表示搭乘交通工具时，名词前不加冠词，用 in 表示时后面要用冠词或代词。",
          },
          {
            type: "list",
            items: [
              "He goes to school by bicycle.（他骑自行车上学。）/ Please send the letter by airmail.（这封信请用航空邮寄。）",
              "by bicycle 骑自行车 / by bus 坐公共汽车 / by plane / by air 坐飞机 / by train 坐火车 / by car 坐小汽车 / by taxi 坐出租车 / by ship 坐船",
              "You can go there by ship. 用 in 表示时：in the / a bus 坐公共汽车",
            ],
          },
          {
            type: "text",
            text: "of 表示「（属于）……的（表示数量或种类）」；from 表示「来自（某地、某人）；以……（时间或地点）起始」。",
          },
          {
            type: "examples",
            items: [
              { en: "This is a map of China.", zh: "这是一幅中国地图。" },
              { en: "Will you please give me a cup of tea?", zh: "请您给我一杯茶好吗？" },
              { en: "I'm from Nanjing.", zh: "我来自南京。" },
              {
                en: "I have got an email from my friend.",
                zh: "我收到了一封我朋友发来的电子邮件。",
              },
              { en: "We work from Monday to Friday.", zh: "我们从星期一到星期五上班。" },
            ],
          },
          {
            type: "text",
            text: "without 表示「没有」（with 的反义词）；like 表示「像……一样」；as 表示「作为」。",
          },
          {
            type: "examples",
            items: [
              {
                en: "I cannot finish the work without her help.",
                zh: "没有她的帮助，我不能完成这项工作。",
              },
              {
                en: "I can't read this English essay without using a dictionary.",
                zh: "不用字典，我看不了这篇英语短文。",
              },
              {
                en: "Please give me a cup of coffee without milk.",
                zh: "请给我一杯不加奶的咖啡。",
              },
              { en: "Nancy is just like her mother.", zh: "南希和她的妈妈一样。" },
              { en: "It's not like you to take offence.", zh: "你不像会发脾气的人。" },
              {
                en: "Steven Hawking is famous as a scientist.",
                zh: "史蒂芬·霍金作为一位科学家而闻名。",
              },
              { en: "They treated me as a hero.", zh: "他们像对待英雄那样对待我。" },
              {
                en: "The room is clean and tidy as usual.",
                zh: "这个房间像平时一样干净整洁。",
              },
            ],
          },
          {
            type: "tip",
            text: "be like 表示性格、脾气、言行等方面的相像；look like 强调外表相像——Nancy looks like her mother.（南希长得很像她的妈妈。）常用介词短语：be famous as 作为……而闻名；treat... as... 把……当作……；as usual 照常，照例。",
          },
          {
            type: "text",
            text: "against 表示「反对；靠着」；about 表示「(1) 关于；各处；身旁；(2) 询问某人/某物的情况或提出建议」。",
          },
          {
            type: "examples",
            items: [
              { en: "He is against the plan.", zh: "他反对这个计划。" },
              {
                en: "The teacher is standing against the blackboard.",
                zh: "老师正靠着黑板站着。",
              },
              { en: "Tell me something about your life.", zh: "告诉我你的生活情况。" },
              { en: "He looked about himself.", zh: "他向四处张望。" },
              { en: "I have no money about / with me.", zh: "我身上没带钱。" },
              { en: "What about your elder sister?", zh: "你姐姐情况如何？" },
              {
                en: "How about going to the Disneyland theme park?",
                zh: "去迪士尼主题公园怎么样？",
              },
            ],
          },
        ],
      },
      {
        heading: "六、介词与其他词类的固定搭配",
        blocks: [
          {
            type: "text",
            text: "介词和动词、形容词、名词等一起构成介词短语。介词短语可以作定语、状语、表语、宾语补足语。介词与其他词类的搭配关系如下：",
          },
          {
            type: "table",
            head: ["类型", "例词"],
            rows: [
              ["动词 + 介词", "talk about, look at, look for, wait for, hear from"],
              ["be动词 + 形容词 + 介词", "be kind to, be fond of, be good at, be afraid of"],
              ["介词 + 名词", "at home, on foot, in English, by the way"],
            ],
          },
          {
            type: "text",
            text: "1. 动词 + 介词（图片 1—12 组）",
          },
          {
            type: "list",
            items: [
              "look for 找，寻找：He is looking for his bike. / I looked for my Mickey watch everywhere, but I didn't find it.",
              "play with sth 玩（耍）：Don't play with fire.（别玩火。）",
              "think of 想起，想到：When I saw him, I thought of my father. / I can't think of his name at the moment.",
              "hear from sb 收到某人的来信：He heard from his mother last week. = He got a letter from his mother last week.",
              "talk about sth 谈论某事：We are talking about Chinese and Western festivals at an international winter camp.",
              "talk to / with sb 和某人谈论：Don't talk to your deskmate, Li Ming. / The teacher is talking with Tom's parents.",
              "look at 注视：She looked at the blackboard, but saw nothing. / I looked at that fancy poster for about five minutes.",
              "listen to 倾听：I like listening to the radio. / I listened to him, but heard nothing.",
              "call on sb 拜访某人：I called on my uncle yesterday. / He called on me yesterday morning.",
              "arrive at / in 到达：We arrived at the Beijing station at noon. / When will Mr Zhou arrive in India? / We arrived in Shanghai this morning.",
              "take care of 照顾：The old are taken good care of in this city. / Who's taking care of the dog while you're away?",
              "wait for 等待：I'll wait for you until eight o'clock. / I've been waiting for the bus for half an hour.",
            ],
          },
          {
            type: "tip",
            text: "think of 常用在 What do you think of...? 这一句型中，意思是「你认为……怎么样？」；hear from 后跟某人（如 his mother），而不能跟 his mother's letter，但可以说 He got his mother's letter.；listen 表示有意识地听，强调听的动作，后面常跟介词 to，hear 不一定是有意识地听，强调听的结果。",
          },
          {
            type: "tip",
            text: "arrive at / in 中的介词 at 用于较小的地方，in 用于较大的地方；口语中常用 get to 代替 arrive at / in——I'll get to the factory at three.（我将在3点钟到工厂。）",
          },
          {
            type: "table",
            head: ["搭配", "含义"],
            rows: [
              ["pay for", "为……而付出钱/代价"],
              ["suffer from", "忍受……（痛苦等）"],
              ["look like", "看起来像"],
              ["look into", "调查"],
              ["move to", "搬家，移动到……"],
              ["hear of / about", "听到，听说，获知"],
              ["jump into", "跳进"],
              ["look forward to", "期待，盼望"],
              ["look down on", "轻视，瞧不起"],
              ["run away from", "从……跑开，离开"],
              ["look after", "照看，照料"],
              ["learn from", "向……学习"],
              ["think about", "考虑"],
              ["laugh at", "嘲笑"],
              ["get on / get off", "上车 / 下车"],
              ["get into", "上车（小汽车、卧车等）"],
              ["knock at / on", "敲……"],
              ["fall off", "跌下，从……掉下来"],
              ["look up to", "尊敬，仰慕"],
              ["believe in", "相信，信仰"],
              ["apologise to sb (for sth)", "（因某事）向某人道歉"],
              ["deal with / do with", "处理"],
              ["die of (cancer)", "死于（癌症）"],
              ["die from (a wound)", "死于（重伤）"],
              ["set through", "完成，结束；接通电话"],
              ["write to sb", "给某人写信"],
              ["lend sth to sb", "把……借给某人"],
              ["thank sb for sth", "因为某事而感谢某人"],
              ["talk to / with sb about sth", "和某人谈论某事"],
              ["ask for", "向……要求"],
              ["worry about", "为……而担心"],
              ["borrow sth from sb", "从某人处借到某物"],
              ["belong to", "属于"],
              ["agree with sb", "同意某人的意见"],
            ],
          },
          {
            type: "text",
            text: "2. be动词 + 形容词 + 介词：be kind to 对……亲切；be good at 在……方面做得好、擅长……；be late for 迟到；be afraid of 害怕；be sorry for sth 为……感到抱歉。",
          },
          {
            type: "examples",
            items: [
              { en: "His stepmother was kind to him.", zh: "他的继母对他很好。" },
              {
                en: "Would you be a little kind to this poor puppy?",
                zh: "你能不能对这个可怜的小狗好一点儿？",
              },
              { en: "Are you good at speaking English?", zh: "你英语说得好吗？" },
              {
                en: "A good executive must be good at decision-making.",
                zh: "优秀的领导者必须善于决策。",
              },
              { en: "He is always late for school.", zh: "他上学总是迟到。" },
              { en: "Most animals are afraid of fire.", zh: "大多数动物都怕火。" },
              {
                en: "Don't be afraid of my dog, because it wouldn't hurt a fly.",
                zh: "不要害怕我的狗，它很温驯（连只苍蝇都不会伤害）。",
              },
              { en: "I'm sorry for being late again.", zh: "抱歉，我又迟到了。" },
              {
                en: "He was sorry for her and tried to cheer her up.",
                zh: "他为她感到难过，并试图使她振作起来。",
              },
            ],
          },
          {
            type: "tip",
            text: "「be动词+形容词+介词」的同义替换：be good at = can do... well（He is good at swimming. = He can swim well.）；be full of = be filled with（The box is full of lemons. = The box is filled with lemons.）其他重要的介词短语：be absent from 缺席；be proud of 以……自豪；be different from 和……不同；be famous for 因……而著名；be fond of 爱好，喜欢；be pleased with 乐于……；be busy with 忙于……",
          },
          {
            type: "text",
            text: "3. 介词 + 名词：「介词+名词」的搭配，大多作为状语使用。",
          },
          {
            type: "table",
            head: ["介词", "常用短语"],
            rows: [
              [
                "at + 名词",
                "at home 在家 / at school 在学校 / at last 最后，终于 / at present 目前 / at first 起初 / at once 立刻 / at least 至少，起码 / at night 在夜晚 / at work 在工作",
              ],
              [
                "on + 名词",
                "on foot 步行 / on time 按时，准时 / on a trip 旅行 / on TV 在电视上 / on show 展览 / on fire 着火 / on business 出差 / on the train 坐火车 / on purpose 故意 / on one's way 在……的路上 / on the radio / the phone / the Internet 用收音机/电话/互联网",
              ],
              [
                "for + 名词",
                "for a while 一会儿 / for some reason 由于某种原因 / for hours / days / years 有好几小时/天/年 / for example 例如",
              ],
              [
                "in + 名词",
                "in English 用英语 / in class 课上 / in my opinion 据我看来 / in the end 终于 / in time 及时 / in those days 在那些日子里",
              ],
              [
                "by + 名词",
                "by the way 顺便说 / by mistake 错误地 / by credit card 用信用卡 / by nature 天生地 / by the end of 截至 / by chance 偶然 / by air / plane 坐飞机 / by sea / ship 坐船 / by bus / train 坐公交车/火车",
              ],
              ["其他介词 + 名词", "after school 放学后 / of course 当然 / with pleasure 高兴"],
            ],
          },
        ],
      },
      {
        heading: "七、常见失分陷阱（中考真题）",
        blocks: [
          {
            type: "examples",
            items: [
              {
                en: "Do you know about Florence Nightingale? — Yes, she was well-known as a nurse in England for her kindness to the sick and wounded soldiers. (as; for)",
                zh: "【黄冈中考】你了解弗洛伦丝·南丁格尔吗？——是的，她是英国的一名护士，因她对病人及受伤的战士的关爱而闻名。as 表示「作为……」；for 在此处引出原因。如辨别不清介词的意义及在固定搭配中的用法，则容易在此类题目中误选。",
              },
              {
                en: "Now many children like surfing on the Internet, but at the same time they should know that there is something unhealthy on it. (at)",
                zh: "【太原中考】现在很多孩子喜欢上网，但同时他们也应该知道网络上有一些不健康的东西。at the same time 是固定搭配，意为「与此同时」。四个选项均可用于表示时间，如辨别不清意义及用法则容易误选。",
              },
              {
                en: "Can you see the hole in the wall? — Yes, I can see it clearly. (in)",
                zh: "【河南中考】你能看见墙上的那个洞吗？——是的，我能清楚地看见。同一个名词与不同的介词搭配，意义有很大区别：on 强调「在……表面上」，in 强调「在……内；在……中」。in the wall 意为「在墙里面」，on the wall 意为「在墙面上」。",
              },
              {
                en: "China lies in the east of Asia and to the north of Australia. (in; to)",
                zh: "【天津中考】中国位于亚洲的东部，澳大利亚的北部。表示方位时，主语被包含在某一范围之中用 in；表示两地互相接壤用 on；主语在某一范围之外用 to。中国是亚洲的一部分用 in，中国和澳大利亚不接壤用 to。",
              },
            ],
          },
          {
            type: "tip",
            text: "同组图片（p.144—145）的「实力测验」为练习部分：用括号中适当的介词填空、用适当的介词填空，各题均可用本章表格中的搭配直接判断；题目原文未在此逐题转录。",
          },
        ],
      },
    ],
    notes: [
      "yufan/介词 目录共 23 张图，已逐张查看：p.124—145（含章节扉页 p.123 的名人名言页）。",
      "p.144—p.145 的「实力测验（Final Check）」为填空练习，仅作说明、未逐题转录；讲解性内容已全部提取。",
      "p.126 左页「注释」小框与 p.132—134 的示意图（on/above/over/under/below、between/among/around、in/into/out of）已转为表格/文字说明，图内箭头示意文字按原图表述。",
    ],
    extras: {
      forms: [
        {
          name: "期限（截止）",
          pattern: "by + 时间点",
          note: "表示「截止到……」，一般和完成时连用：by the end of last year, by next Friday。",
        },
        {
          name: "直到……为止",
          pattern: "until / till + 时间点/从句",
          note: "延续性动词用肯定式（I'll wait for him until he comes here.）；终止性动词要用否定式（They won't come back until the end of the year.）。",
        },
        {
          name: "一段时间",
          pattern: "for + 时间段 / during + 期间名词 / through + 时间段",
          note: "for 后跟表示时间、具体天数等的数字名词；during 后不接数字名词；through 表示从开始到结束。",
        },
        {
          name: "起点",
          pattern: "from + 时间点 / since + 时间点或从句",
          note: "from 可用于各种时态且只能作介词；since 一般只用于完成时的句子，还可作连词。",
        },
        {
          name: "未来「之后」",
          pattern: "in + 时间段",
          note: "以现在为基准，多用于将来时：He will be back in five hours.",
        },
        {
          name: "范围之内",
          pattern: "within + 时间段",
          note: "强调「不超过……的范围」，无时态限制：within five minutes.",
        },
      ],
      points: [
        {
          title: "否定句中……才（not... until）",
          desc: "终止性动词与 until / till 连用要用否定式，译成「直到……才……」。",
          good: [
            "I didn't go to sleep until / till I finished my homework.（直到我做完作业，我才上床睡觉。）",
            "It didn't stop raining till / until midnight.（直到午夜，雨才停。）",
          ],
          bad: [],
        },
        {
          title: "by 与 until / till 的区别",
          desc: "by 表示截止到某个时间点，until / till 表示动作持续到某个时间点；只有 until / till 能作从属连词引导从句。",
          good: ["Ada had left by the time I arrived.", "He stayed there till / until his mother came back."],
          bad: [],
        },
        {
          title: "for 与 during 的区别",
          desc: "for 之后大多跟表示时间、具体天数等的数字名词；during 后不接表示数字的名词。",
          good: ["He has lived in Los Angeles for 50 years.", "Where will you go during the summer?"],
          bad: [],
        },
        {
          title: "in 与 within 的区别",
          desc: "in 以现在为基准指「从现在起……之后」，多用于将来时；within 强调「在……范围之内」，没有时态限制。",
          good: ["He will be back in five hours.", "They finished the work within 2 days at last."],
          bad: [],
        },
        {
          title: "with 与 in 表工具/材料",
          desc: "用 with 时后面的名词要加冠词或代词；用 in 时后面加物质名词，不能加冠词。",
          good: ["with my ears 用我的耳朵 / with a pencil 用一支铅笔", "in ink 用墨水（钢笔）/ in pencil 用铅笔"],
          bad: [],
        },
        {
          title: "in front of 与 in the front of",
          desc: "in front of 强调外部，in the front of 强调内部。",
          good: [
            "There is a tree in front of the classroom.（强调外部）",
            "There is a big desk for the teacher in the front of the classroom.（强调内部）",
          ],
          bad: [],
        },
      ],
      contrasts: [
        {
          title: "时间介词易混对比",
          head: ["介词", "含义", "例句"],
          rows: [
            ["for", "达……之久（+ 数字名词）", "He has lived in Los Angeles for 50 years."],
            ["during", "在……期间（不接数字名词）", "They are going to have a good rest during the winter holidays."],
            ["through", "一直……（从开始到结束）", "Paul stayed in London through the winter."],
            ["from", "从……起（可作介词，不用于完成时限定）", "The meeting will be held from eight to ten."],
            ["since", "自从……以来（多用于完成时，可作连词）", "I have played the piano since 2006."],
            ["in", "过……之后（未来时间）", "He will be back in five hours."],
            ["within", "不超过……的范围", "I must finish painting the cat within five minutes."],
          ],
        },
        {
          title: "有无定冠词 the 的词组辨义",
          head: ["词组（无 the）", "含义", "词组（有 the）", "含义"],
          rows: [
            ["at table", "在进餐", "at the table", "在桌旁"],
            ["in hospital", "在医院（住院）", "in the hospital", "在医院（工作或探望……）"],
            ["in / at church", "在做礼拜", "in / at the church", "在教堂里"],
            ["in prison", "在监狱（服刑）", "in the prison", "在监狱（工作或探望……）"],
          ],
        },
        {
          title: "方位介词 in / on / to",
          head: ["介词", "含义", "例句"],
          rows: [
            ["in", "在某一范围之中（主语被包含在内）", "China lies in the east of Asia."],
            ["on", "表示两地互相接壤", "Canada lies on the north of the USA."],
            ["to", "在某一范围之外", "China lies to the north of Australia."],
          ],
        },
      ],
      pitfalls: [
        "终止性动词与 until / till 连用要用否定式：They won't come back until the end of the year.（不用 by）",
        "by 与 until / till 不能互换：by seven o'clock 是「截至7点钟」（多与完成时连用），until seven o'clock 是「直到7点（7点以前）」。",
        "英语中有无定冠词 the 意思差别很大：at table 在进餐 / at the table 在桌旁；in prison 在监狱（服刑）/ in the prison 在监狱（工作或探望……）。",
        "in front of 与 before 都可译作「在……之前」，但表示场所时要用 in front of，before 只用于时间、名单或次序等。",
        "表示方位时不能混用 in / on / to：范围内用 in，接壤用 on，范围外用 to。",
        "be famous as（作为……而闻名）与 be famous for（因……而闻名）要区分：He is famous as a scientist. / He is famous for his songs.",
        "hear from 后面跟人，不能跟信：He heard from his mother. = He got a letter from his mother.",
        "listen 强调听的动作（常跟介词 to），hear 强调听的结果：I listened to him, but heard nothing.",
        "在 this、last、next、every 等词前面不能再加介词：this morning / last Friday / next Sunday。",
      ],
      examTips: [
        "介词是中考单项填空的高频小词：by / until 的搭配、for / during 与 in / within 的区别、有无 the 的词组辨义（at table / at the table）都常考。",
        "方位介词 in / on / to 是经典易错点：先判断句子的主语在范围内、接壤，还是在范围之外。",
      ],
      memoryCard: [
        "by 截止（多完成时），until / till 直到；延续性动词用肯定式，终止性动词用否定式。",
        "for 后接时间段数字，during 后接期间名词，through 表示自始至终。",
        "in 以现在为基准（……之后），within 强调在……范围之内。",
        "有 the 是具体场所，没 the 是本义：at table 吃饭，at the table 在桌旁。",
        "范围内 in，接壤 on，范围外 to。",
      ],
    },
  },
];
