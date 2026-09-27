// web/js/grammar/yufan/conjunctions.js
// 数据来源：yufan/连词（19 张教材扫描图片，第 8 章「连词」，p.148—p.165）
// 契约见同目录 README.md。自检：node --check web/js/grammar/yufan/conjunctions.js

export default [
  {
    topicId: "g-conjunctions",
    newTopic: false,
    title: "连词（讲义精讲）",
    sourceDirs: ["yufan/连词"],
    imagesRead: 19,
    summary:
      "连词是虚词，起连接词与词、短语与短语、句子与句子的作用，不能独立担任句子成分。本章把并列连词（and/or/but/so/for 及 both...and、either...or、neither...nor、not only...but also、as well as）与从属连词（that、when/while/since、till/until、because、if、though/although、so...that）分开梳理。",
    intro:
      "连接并列关系用并列连词，引导从句用从属连词。判断时先看前后两部分是什么关系（并列、转折、因果、选择），再注意两个高频细节：主谓一致的就近原则，以及 because 与 so、though/although 与 but 不能同时出现。",
    sections: [
      {
        heading: "一、连词的分类与作用",
        blocks: [
          {
            type: "text",
            text: "连词是虚词，起着连接词与词、短语与短语、句子与句子的作用，所以连词不能独立担任句子的成分。连词包括并列连词和从属连词。",
          },
          {
            type: "text",
            text: "并列连词用来连接并列关系的词、词组或分句：and、or、but、so、for、both...and、either...or、neither...nor、not only...but also 等都是并列连词。从属连词用来引导从句：that、when、till、until、after、before、since、because、if、whether、though、although、so...that、so that、in order that、as soon as、as...as 等都是从属连词。",
          },
          {
            type: "examples",
            items: [
              { en: "Li Lei and Jim are good friends.", zh: "李雷和吉姆是好朋友。（and 是并列连词）" },
              { en: "I think that he is sleepy.", zh: "我想他困了。（that 是从属连词）" },
            ],
          },
        ],
      },
      {
        heading: "二、并列连词 and / or / but 的用法与特殊句型",
        blocks: [
          {
            type: "text",
            text: "1. and 意为「和」「而且」，用来连接对等关系的词与词、短语与短语、句子与句子。",
          },
          {
            type: "examples",
            items: [
              { en: "I like basketball, football and table tennis.", zh: "我喜欢篮球、足球和乒乓球。" },
              { en: "My brother and I went to the bookstore yesterday.", zh: "我和哥哥昨天去了书店。" },
              { en: "He stood up and put on his hat.", zh: "他站起来，戴上帽子。（and 连接两个动词短语）" },
              {
                en: "I went to the Summer Palace and he went to the Forbidden City.",
                zh: "我去了颐和园，他去了紫禁城。（and 连接两个句子）",
              },
            ],
          },
          {
            type: "tip",
            text: "如果是连接三个或三个以上的单词或词组，and 一般放在最后一个单词或词组前；and 在译成中文时，不一定非要翻译出「和」来。",
          },
          {
            type: "text",
            text: "and 的特殊用法：and 用在祈使句中，句型为「祈使句，and...」，相当于「If you..., you'll...」。",
          },
          {
            type: "examples",
            items: [
              {
                en: "Use your head, and you'll find a way. = If you use your head, you'll find a way.",
                zh: "动动脑筋，你就会想出办法来。",
              },
              {
                en: "Hurry up, and you'll catch the bus. = If you hurry up, you'll catch the bus.",
                zh: "快点儿，你就会赶上公共汽车。",
              },
            ],
          },
          {
            type: "text",
            text: "2. or 意为「或」，用于从两者之中选择一个的时候；also「否则」；否定句中并列用 or 代替 and。",
          },
          {
            type: "examples",
            items: [
              { en: "Is Li Ming from Beijing or from Shanghai?", zh: "李明来自北京还是来自上海？" },
              { en: "He never smokes or drinks.", zh: "他从不吸烟，也不喝酒。" },
              { en: "Tom or I am right.", zh: "汤姆或者我是对的。" },
              { en: "Are you coming or not?", zh: "你来还是不来？" },
              { en: "Would you like coffee or tea?", zh: "你想要咖啡还是茶？" },
            ],
          },
          {
            type: "tip",
            text: "「A or B」作主语时，谓语动词随 or 后面的词（B）而定，因此 Tom or I am right. 中的谓语动词服从 I，用 am。",
          },
          {
            type: "text",
            text: "or 的特殊用法：or 用于祈使句中，句型为「祈使句，or... = If you don't..., you'll...」，意为「请……，否则……」，有转折的意思。",
          },
          {
            type: "examples",
            items: [
              {
                en: "Hurry up, or you'll miss the bus. = If you don't hurry up, you'll miss the bus.",
                zh: "快点儿吧，否则你就会误了这班公共汽车。",
              },
              {
                en: "Turn the heat down, or the food will burn. = If you don't turn the heat down, the food will burn.",
                zh: "请把炉火开小些，否则食物就烧焦了。",
              },
              {
                en: "Study hard, or you'll fail the exam. = If you don't study hard, you'll fail the exam.",
                zh: "好好学吧，否则你就会考试不及格。",
              },
            ],
          },
          {
            type: "text",
            text: "3. but 意为「但是，可是，而」，表示转折关系；but 还可表示「除了……以外」。",
          },
          {
            type: "examples",
            items: [
              { en: "He is old, but he looks very young.", zh: "他年纪大了，但他看起来还年轻。" },
              {
                en: "They came here not for money but for life.",
                zh: "他们到这儿来，不是为了钱，而是为了生活。",
              },
              {
                en: "Li Li likes the violin but doesn't like the piano.",
                zh: "李莉喜欢小提琴，（但是）不喜欢钢琴。（but 后面省略了主语 Li Li，因为与前面的主语成分相同）",
              },
              {
                en: "Mary likes the violin, but Tom doesn't.",
                zh: "玛丽喜欢小提琴，而汤姆不喜欢。（doesn't 后面省略了 like the violin，因为与前面的成分相同）",
              },
              { en: "He isn't a teacher but a doctor.", zh: "他不是老师，而是医生。" },
              { en: "No one but she knew about it exactly.", zh: "除了她之外，没有人确切地知道那件事。" },
            ],
          },
          {
            type: "pitfall",
            text: "图片「重要」框：but 和 although 不能在一起连用。It was raining hard, but they went on working. = Although it was raining hard, they went on working.（虽然下着大雨，但是他们仍继续工作。）",
          },
          {
            type: "tip",
            text: "在 but 所连接的句子中，如果 but 后面的某些成分与前面相同，则可以省略。",
          },
        ],
      },
      {
        heading: "三、并列连词 so 和 for",
        blocks: [
          {
            type: "examples",
            items: [
              { en: "It began to rain, so we had to stay here.", zh: "开始下雨了，所以我们不得不待在这儿。" },
              { en: "We can't go, for it's raining.", zh: "我们不能走，因为正在下雨。" },
            ],
          },
          {
            type: "text",
            text: "1. so 作连词意为「所以，因此；于是」；作副词时还可表示「非常；也，同样」。",
          },
          {
            type: "examples",
            items: [
              { en: "I had a headache, so I went to see a doctor.", zh: "我头疼，因此我去看医生了。" },
              { en: "It was too dark, so I couldn't see anything.", zh: "天太黑了，所以我什么也看不见。" },
            ],
          },
          {
            type: "tip",
            text: "so 作副词时的两种意思：①代替上面所说的事情，意思是「如此，如是」——A: I hope you can pass the exam. B: I hope so.（我希望如此。）②表示达到某种程度，意思是「这么，那么」——Don't walk so fast.（别走得这么快。）",
          },
          {
            type: "text",
            text: "2. for 作连词意为「因为」，用来说明、解释，从某一现象推断出某一结果。",
          },
          {
            type: "examples",
            items: [
              { en: "I soon went to sleep, for I was tired.", zh: "我很快就入睡了，因为我太累了。" },
              {
                en: "We expected his coming, for he would bring good news.",
                zh: "我们盼望他的到来，因为他会带来好消息。",
              },
              {
                en: "I do not believe him, for he never tells the truth.",
                zh: "我不相信他，因为他从来不说真话。",
              },
            ],
          },
          {
            type: "table",
            head: ["连词", "作用", "说明"],
            rows: [
              [
                "for",
                "只表示说明、解释",
                "从某一现象推断出某一结果，前后并不存在因果关系：The sun has risen, for the birds are singing.（太阳升起来了，因为小鸟在唱歌。）",
              ],
              [
                "because",
                "解释某事的原因、动机",
                "强调因果关系，可用于回答 why 引导的问句：Why shouldn't I come? — Because you're too busy.",
              ],
            ],
          },
        ],
      },
      {
        heading: "四、并列连词短语：both...and / either...or / neither...nor / not only...but also / as well as",
        blocks: [
          {
            type: "text",
            text: "1. both...and 意为「和；既……也……」，由 both...and 构成的词组作主语时，谓语动词要用复数形式；在「both...and」句型中，and 所连接的词或词组要对等。",
          },
          {
            type: "examples",
            items: [
              {
                en: "He can play both the violin and the piano.",
                zh: "他既会拉小提琴，又会弹钢琴。",
              },
              {
                en: "Both Beijing and New York have traffic problems.",
                zh: "北京和纽约都有交通问题。",
              },
              {
                en: "It's known that both Li Ming and Li Li are good students.",
                zh: "大家知道李明和李莉都是好学生。（Li Ming 和 Li Li 都是人名，两者对等）",
              },
            ],
          },
          {
            type: "text",
            text: "both...and 的否定句表示部分否定：",
          },
          {
            type: "examples",
            items: [
              {
                en: "He can't play both the violin and the piano.",
                zh: "他会拉小提琴或者会弹钢琴。（表示这两者不会全）",
              },
              {
                en: "Both Li Ming and Li Li are not good students.",
                zh: "李明和李莉不都是好学生。（表示其中一个好学生）",
              },
            ],
          },
          {
            type: "tip",
            text: "两者用 both，三者以上用 all：They are all fine, too.（他们也都很好。）",
          },
          {
            type: "text",
            text: "2. either...or 意为「或……或……；不是……就是……」；neither...nor 意为「既不……也不……」。二者作主语时，谓语动词都遵循就近原则，or / nor 前后的词性必须一致。",
          },
          {
            type: "examples",
            items: [
              { en: "I want to visit either Tianjin or Shanghai.", zh: "我想去天津或者上海游玩。" },
              { en: "Either you or he is right.", zh: "不是你就是他是对的。" },
              { en: "Either my sister or my mother comes.", zh: "不是我妹妹就是我母亲过来。" },
              { en: "Can you speak either Chinese or English?", zh: "你会说汉语或英语吗？（名词 + 名词，词性一致）" },
              { en: "Either you or he has to clean the room.", zh: "不是你就是他必须打扫房间。（代词主格 + 代词主格）" },
              { en: "I like neither Chinese nor English.", zh: "中文和英文我全不喜欢。" },
              { en: "Neither he nor I speak a foreign language.", zh: "他和我都不会说外语。" },
              {
                en: "Neither you nor he was selected for the job.",
                zh: "你和他都没有被选上做这个工作。",
              },
              { en: "He can neither read nor write.", zh: "他既不会读也不会写。（动词 + 动词）" },
            ],
          },
          {
            type: "pitfall",
            text: "either...or 的否定句是完全否定：Either you or he isn't right. / I don't want to visit either Tianjin or Shanghai. 而 neither...nor 本身是全否定，故不能再加 not：(○) Neither you nor I am right.（你和我都不对。）(×) Neither you nor I am not right.",
          },
          {
            type: "tip",
            text: "either...or... 用于选择两者之中的一者，但有时候也用于在三者之中作出选择：You can have either coffee, tea or juice.（你可以要咖啡、茶或者果汁。）",
          },
          {
            type: "table",
            head: ["句型", "含义", "例句"],
            rows: [
              ["肯定句：I like both A and B.", "A 和 B 都喜欢", "I like both coffee and tea."],
              [
                "否定句：I don't like both A and B. = I like either A or B.",
                "只喜欢其中之一",
                "I like either coffee or tea. = I don't like both coffee and tea.",
              ],
              [
                "否定句：I don't like either A or B. = I like neither A nor B.",
                "A 和 B 都不喜欢",
                "I don't like either coffee or tea. = I like neither coffee nor tea.",
              ],
            ],
          },
          {
            type: "text",
            text: "3. not only...but also 意为「不但……而且……」，它构成的词组担任主语时，谓语动词随邻近 but also 后面的主语而定；not only...but also 连接对等的词或词组。",
          },
          {
            type: "examples",
            items: [
              {
                en: "Not only you but also your father is coming.",
                zh: "不但你，而且你父亲也要来。",
              },
              { en: "Jane is not only beautiful but also kind.", zh: "简不但漂亮，而且人也非常好。" },
              {
                en: "Not only the students but also the teacher was against the plan.",
                zh: "不但学生们，而且老师也反对这个计划。",
              },
              {
                en: "Not only the teacher but also the students were against the plan.",
                zh: "不但老师，而且学生们也反对这个计划。",
              },
              {
                en: "I not only play tennis but also practise shooting.",
                zh: "我不仅打网球，而且还练习射击。（动词短语 + 动词短语）",
              },
              {
                en: "He plays not only the piano but also the violin.",
                zh: "他不仅弹钢琴，而且还拉小提琴。（名词 + 名词）",
              },
              {
                en: "They speak English not only in class but also in the dormitory.",
                zh: "他们不仅在课堂上，而且在宿舍也说英语。（介词短语 + 介词短语）",
              },
            ],
          },
          {
            type: "text",
            text: "not only...but also 句型可以和 as well as 互换：not only A but also B = B as well as A，但前者强调的重点 B 在 but also 之后，后者强调的重点 B 在 as well as 之前。英译汉时，要先译 as well as 后面的词。",
          },
          {
            type: "examples",
            items: [
              {
                en: "The child is not only healthy but also lively. = The child is lively as well as healthy.",
                zh: "这孩子既健康又活泼。",
              },
              {
                en: "It concerns not only me but also you. = It concerns you as well as me.",
                zh: "这件事不但与我有关，而且与你有关。",
              },
              {
                en: "Not only you but also my brother is going to visit the museum again. = My brother as well as you is going to visit the museum again.",
                zh: "不但你，而且我哥哥也打算再去参观一下这个博物馆。（注意 you 和 my brother 的位置）",
              },
              {
                en: "Not only the sons but also their father likes playing computer games. = The father as well as his sons likes playing computer games.",
                zh: "不但他的儿子们，连他也喜欢玩电脑游戏。",
              },
              {
                en: "Not only Mr Lin but also his parents are going to the party.",
                zh: "不但林先生，而且他的父母也要参加宴会。",
              },
              {
                en: "Mr Lin as well as his parents is going to the party.",
                zh: "不但林先生的父母，而且林先生也要参加宴会。（注意这两句的谓语动词形式）",
              },
            ],
          },
          {
            type: "pitfall",
            text: "not only...but also 句型的谓语动词随 but also 后面的主语而定，而 as well as 的谓语动词随 as well as 前面的主语而定；both...and... 的反义词组为 neither...nor..., either...or,，意为「不……也不……」。",
          },
          {
            type: "table",
            head: ["词组", "含义", "例句"],
            rows: [
              [
                "not only...but also",
                "不但……而且……",
                "This book is not only interesting but (also) instructive.（有时 but also 中的 also 可以省略）",
              ],
              ["as well as", "又，不但……而且……", "This book is instructive as well as interesting."],
              ["both...and", "既……又……", "This book is both interesting and instructive."],
            ],
          },
          {
            type: "tip",
            text: "图片「重要」框：not only A but also B = B as well as A = both A and B，都表示「不仅……而且……」；这三个词组有时可以通用，但也有细微差别。",
          },
        ],
      },
      {
        heading: "五、从属连词 that（引导宾语从句）",
        blocks: [
          {
            type: "text",
            text: "that 引导名词性从句（主语从句、表语从句、宾语从句和同位语从句）和定语从句。这里只讲解 that 引导宾语从句。",
          },
          {
            type: "examples",
            items: [
              { en: "I think (that) he likes football.", zh: "我认为他喜欢足球。" },
              { en: "He said (that) he would come.", zh: "他说他要来。" },
            ],
          },
          {
            type: "text",
            text: "1. that 在宾语从句、间接引语中可以省略，主句与从句的时态一致。",
          },
          {
            type: "examples",
            items: [
              {
                en: "I think (that) he is tired. / I thought (that) he was tired.",
                zh: "我认为他累了。（主句现在是→从句现在时；主句过去时→从句过去时）",
              },
              {
                en: "He says (that) he is late. / He said (that) he was late.",
                zh: "他说他迟到了。",
              },
            ],
          },
          {
            type: "pitfall",
            text: "要特别注意主句与从句时态的呼应。如果主句是过去时，从句也用过去时。",
          },
          {
            type: "text",
            text: "2. 如果主句的动词是 think、believe 等，主句的主语是第一人称，变为否定句时，要否定主句，但译成中文时，则要译为否定从句。",
          },
          {
            type: "examples",
            items: [
              { en: "I believe (that) you will leave here.", zh: "我相信你会离开这儿的。" },
              {
                en: "I don't believe (that) you will leave here.",
                zh: "我相信你不会离开这儿的。",
              },
            ],
          },
          {
            type: "list",
            items: [
              "常见省略 that 的宾语从句：I hope (that) ... 我希望…… / I think (that) ... 我认为…… / I say (that) ... 我说…… / I know (that) ... 我知道……",
              "be sure (that) ... 确信…… / be glad / happy (that) ... 很高兴…… / be worried (that) ... 担心…… / be afraid (that) ... 恐怕……",
            ],
          },
        ],
      },
      {
        heading: "六、时间状语从句连词：when / while / since / after / before / as / as soon as / till / until",
        blocks: [
          {
            type: "text",
            text: "when、while、since、after、before、as、as soon as 等是连接时间状语从句的从属连词。在时间状语从句中要特别注意时态的搭配：当主句是将来时，从句要用一般现在时。",
          },
          {
            type: "examples",
            items: [
              {
                en: "When he arrives there, he will call you.",
                zh: "他到达那儿以后，会给你打电话。",
              },
              { en: "When I arrived there, it was raining.", zh: "当我到那儿时，天正在下雨。" },
              {
                en: "I entered the room when / while Li Ming was talking with her.",
                zh: "我进屋时，李明正在和她谈话。",
              },
              { en: "While I read, she sang.", zh: "我在看书时，她在唱歌。" },
              {
                en: "I have learned more than two thousand English words since I began learning English two years ago.",
                zh: "自从两年前我开始学习英语以来，我已经学习了两千多个英语单词。",
              },
              {
                en: "He came to China after the war was over. = The war was over before he came to China. = The war had been over before he came to China.",
                zh: "战争结束后，他来到中国。",
              },
              { en: "I saw her as I was shopping.", zh: "我购物的时候看见了她。" },
            ],
          },
          {
            type: "tip",
            text: "while 所引导的从句的谓语动词只能是延续性动词，不能用终止性动词如 begin、stop 等。",
          },
          {
            type: "tip",
            text: "since 引导的是一个过去时的句子，说明自当时以来到现在（自从两年前以来），主句一般要用现在完成时。比较：He had been in China before the war was over.（战争结束前，他已经在中国了。）",
          },
          {
            type: "text",
            text: "till / until：既可以是连词，也可以是介词；它们后面可以跟一个句子，也可以跟名词或词组。另外，句中（如果是主从复合句，则主句）的动词若是终止性动词，则要用否定式。",
          },
          {
            type: "examples",
            items: [
              {
                en: "He stayed there till / until his mother came back.",
                zh: "他一直待在那里直到他妈妈回来。",
              },
              {
                en: "He didn't finish his homework till / until his mother came back.",
                zh: "直到他妈妈回来，他才做完作业。",
              },
              { en: "Can you wait till / until I come back?", zh: "你能等到我回来吗？" },
              {
                en: "We won't work until / till our teacher teaches us how to do it.",
                zh: "老师教给我们如何做这个工作之后，我们才会开始做。",
              },
              {
                en: "I didn't go to sleep until / till I finished my homework.",
                zh: "直到我做完作业，我才上床睡觉。",
              },
              {
                en: "It didn't stop raining till / until midnight.",
                zh: "直到午夜，雨才停。（这是一个简单句，till 和 until 是介词，stop 是终止性动词，故用否定式）",
              },
            ],
          },
          {
            type: "pitfall",
            text: "上例1中的 till / until 是连词，句中的 stay 是延续性动词，隐含意思是「他妈妈回来之前他一直在等」，亦即「他妈妈一回来他就不等了」；上例2中的 till / until 连接从句 his mother came back，因为 finish 是终止性动词，故用否定式，隐含意思是「他妈妈回来之前他没完成作业」。",
          },
        ],
      },
      {
        heading: "七、原因、条件、让步与结果连词：because / if / though(although) / so...that",
        blocks: [
          {
            type: "text",
            text: "1. because 意为「因为」，可用来连接原因状语从句。",
          },
          {
            type: "examples",
            items: [
              { en: "She didn't go there, because she was ill.", zh: "因为她病了，所以没去那儿。" },
              {
                en: "I did it because my mother told me to.",
                zh: "因为妈妈吩咐我去做这件事，所以我才做的。",
              },
              {
                en: "Why are you late? — Because I had a traffic accident on my way here.",
                zh: "你为什么迟到？——因为在来这儿的路上，我遇到了交通事故。",
              },
              {
                en: "As it is raining, let's stay at home.",
                zh: "因为下雨，我们就留在家里吧。（as 用于表示理由是已知的，多用于句首）",
              },
              {
                en: "I'll follow his advice, for he is a doctor.",
                zh: "我会听从他的劝告，因为他是医生。（for 不用于句首，而用于主句之后，补充说明理由）",
              },
            ],
          },
          {
            type: "pitfall",
            text: "回答 Why 问句时，只能用 because，不能用 for 或 as。另外，在汉语中我们经常说「因为……所以……」，但在英文中有了 because 就不能再用 so：(○) Because he was tired, he couldn't walk there. (×) Because he was tired, so he couldn't walk there.",
          },
          {
            type: "text",
            text: "2. if 意为「如果」，引导条件状语从句；though / although 意为「虽然」，引导让步状语从句。",
          },
          {
            type: "examples",
            items: [
              { en: "If anyone calls, tell them I am not at home.", zh: "如果有人打电话来，就说我不在家。" },
              { en: "Though I was tired, I still worked hard.", zh: "虽然我很累，可是我仍然努力地工作。" },
              { en: "If it is necessary I will come at once.", zh: "如果有必要，我会马上来。" },
              {
                en: "You will pass the exam if you work hard.",
                zh: "如果你努力学习，你会通过考试的。",
              },
              {
                en: "Though / Although I live near the sea, I'm not a good swimmer.",
                zh: "虽然我住在海边，可是我游泳游得并不好。",
              },
              {
                en: "(○) I live near the sea, but I'm not a good swimmer.",
                zh: "（正确）虽然我住在海边，可是我游泳游得并不好。",
              },
              {
                en: "(×) Though / Although I live near the sea, but I'm not a good swimmer.",
                zh: "（错误）如果句子中用了 though 或 although（虽然），就不能再用 but（但是）。",
              },
            ],
          },
          {
            type: "tip",
            text: "注意时态一致：和时间状语从句一样，如果主句是将来时，从句要用一般现在时。",
          },
          {
            type: "text",
            text: "3. so...that 意为「如此/太……以至于……」，that 引导结果状语从句。若 that 后面的从句是否定句的话，也可以转换为 too...to 句型。",
          },
          {
            type: "examples",
            items: [
              {
                en: "He is so old that he can't work. = He is too old to work.",
                zh: "他太老了，不能工作。",
              },
              {
                en: "The box is so heavy that I can't lift it. = The box is too heavy for me to lift.",
                zh: "箱子太沉了，我抬不起来。",
              },
              {
                en: "The girl is so beautiful that everybody likes her.",
                zh: "这个女孩太漂亮了，每个人都喜欢她。",
              },
            ],
          },
        ],
      },
      {
        heading: "八、常见失分陷阱（中考真题）",
        blocks: [
          {
            type: "examples",
            items: [
              {
                en: "Not only Tom but also Mary speaks good Chinese, so they can communicate with these Chinese students very well. (Not only; but also)",
                zh: "【江西中考】汤姆和玛丽都能说很流利的汉语，所以他们能够很好地和这些中国学生交流。not only...but also 构成的词组担任主语时，谓语动词随 but also 后面的部分而定，故选 B 而非 Both; and（本句谓语是单数 speaks）。",
              },
              {
                en: "Though Switzerland is very small, it is the land of watch and it is very rich. (Though; /)",
                zh: "【D】虽然瑞士很小，但它却是手表之国，非常富有。在表达「尽管……但是……」时，though 与 but 两者不能同时使用，故不能选 Though; but。",
              },
              {
                en: "The baby is only one year old, so he can't speak or write. (or)",
                zh: "【B】这个婴儿才一岁大，所以他不会说也不会写。在否定句中，要用 or 代替 and，如果不清楚这种用法，就会选错答案。",
              },
              {
                en: "I'm going to Hangzhou for a holiday this weekend. — While you are there, can you buy me some green tea? (While)",
                zh: "【B】这周末我要去杭州度假。——你在那儿的时候可以帮我买些绿茶吗？if 表示假设；while 引导时间状语从句。根据题意可知，正确答案为 While。",
              },
            ],
          },
          {
            type: "tip",
            text: "同组图片（p.162—165）的「实力测验」为练习部分：用括号中适当的连词填空、用适当的词填空、改错、汉译英，考点均落在本章的并列连词与从属连词范围；题目原文未在此逐题转录。",
          },
        ],
      },
    ],
    notes: [
      "yufan/连词 目录共 19 张图，已逐张查看：p.148—165（含章节扉页 p.147 的名人名言页）。",
      "p.162—p.165 的「实力测验（Final Check）」为填空/改错/汉译英练习，仅作说明、未逐题转录；讲解性内容已全部提取。",
      "p.153、p.154 的「例」「比较」小框内容已分别转写为 tip 与 table block，个别小框右下角文字在图片边缘被轻微裁切，不影响语义判断。",
    ],
    extras: {
      forms: [
        { name: "并列（和）", pattern: "and", note: "连接对等的词、短语或句子；三个以上并列时 and 放在最后一项前。" },
        { name: "选择/否则", pattern: "or", note: "选择；否定句中代替 and；祈使句 + or = If you don't..., you'll..." },
        { name: "转折", pattern: "but", note: "前后相反；还可表示「除了……以外」，与 although 不能连用。" },
        { name: "因果（结果）", pattern: "so", note: "so 后接结果；也可作副词（I hope so. / Don't walk so fast.）。" },
        { name: "因果（说明）", pattern: "for", note: "只用于说明、解释，不用于句首，不能与 because 互换使用场景。" },
        { name: "并列短语", pattern: "both...and / either...or / neither...nor / not only...but also", note: "作主语时 either...or、neither...nor、not only...but also 遵循就近原则；both...and 用复数谓语。" },
        { name: "从属（时间）", pattern: "when / while / since / after / before / as / as soon as / till / until", note: "主将从现；while 从句谓语需延续性动词；终止性动词与 until 连用要用否定式。" },
        { name: "从属（原因/条件/让步/结果）", pattern: "because / if / though / although / so...that", note: "because 不能与 so 连用，though / although 不能与 but 连用。" },
      ],
      points: [
        {
          title: "祈使句 + and / or",
          desc: "祈使句 + and 相当于 If you..., you'll...；祈使句 + or 相当于 If you don't..., you'll...。",
          good: [
            "Use your head, and you'll find a way. = If you use your head, you'll find a way.",
            "Hurry up, or you'll miss the bus. = If you don't hurry up, you'll miss the bus.",
          ],
          bad: [],
        },
        {
          title: "否定句中并列用 or 代替 and",
          desc: "在否定句中连接并列成分要用 or。",
          good: ["He never smokes or drinks.", "The baby is only one year old, so he can't speak or write."],
          bad: ["The baby is only one year old, so he can't speak and write."],
        },
        {
          title: "neither...nor 本身是全否定",
          desc: "neither...nor 已含否定意义，不能再加 not。",
          good: ["Neither you nor I am right."],
          bad: ["Neither you nor I am not right."],
        },
        {
          title: "because 与 so 不能同时出现",
          desc: "汉语的「因为……所以……」在英语中只能选一个连词。",
          good: ["Because he was tired, he couldn't walk there."],
          bad: ["Because he was tired, so he couldn't walk there."],
        },
        {
          title: "though / although 与 but 不能同时出现",
          desc: "用了 though 或 although（虽然），就不能再用 but（但是）。",
          good: ["Though I was tired, I still worked hard.", "I live near the sea, but I'm not a good swimmer."],
          bad: ["Though I was tired, but I still worked hard."],
        },
        {
          title: "not only...but also 与 as well as 的主谓一致",
          desc: "not only...but also 的谓语随 but also 后的主语而定；as well as 的谓语随其前面的主语而定。",
          good: ["Not only Mr Lin but also his parents are going to the party.", "Mr Lin as well as his parents is going to the party."],
          bad: [],
        },
      ],
      contrasts: [
        {
          title: "for 与 because",
          head: ["连词", "作用", "例句"],
          rows: [
            ["for", "只表示说明、解释（从现象推断结果），不用于句首", "The sun has risen, for the birds are singing."],
            ["because", "解释原因、动机，强调因果关系，可回答 why", "Why shouldn't I come? — Because you're too busy."],
          ],
        },
        {
          title: "both...and / either...or / neither...nor 的肯否转换",
          head: ["句型", "含义", "例句"],
          rows: [
            ["I like both A and B.", "两者都喜欢", "I like both coffee and tea."],
            ["I don't like both A and B. = I like either A or B.", "只喜欢其中之一", "I like either coffee or tea."],
            ["I don't like either A or B. = I like neither A nor B.", "两者都不喜欢", "I like neither coffee nor tea."],
          ],
        },
        {
          title: "not only...but also / as well as / both...and",
          head: ["词组", "含义", "例句"],
          rows: [
            ["not only...but also", "不但……而且……（重点在 but also 之后）", "This book is not only interesting but (also) instructive."],
            ["as well as", "又，不但……而且……（重点在 as well as 之前）", "This book is instructive as well as interesting."],
            ["both...and", "既……又……", "This book is both interesting and instructive."],
          ],
        },
      ],
      pitfalls: [
        "not only...but also 作主语时谓语随 but also 后的主语而定；as well as 作主语时谓语随其前面的主语而定（Not only Mr Lin but also his parents are... / Mr Lin as well as his parents is...）。",
        "both...and 的否定句是部分否定：Both Li Ming and Li Li are not good students. 意为「不都是好学生」。",
        "either...or 的否定句是完全否定；neither...nor 本身已是全否定，不能再加 not。",
        "either...or、neither...nor 中 or / nor 前后的词性必须一致（名词 + 名词、代词主格 + 代词主格、动词 + 动词）。",
        "while 引导的从句谓语只能用延续性动词，不能用 begin、stop 等终止性动词。",
        "since 引导的时间状语从句用过去时，主句一般要用现在完成时。",
        "that 引导的宾语从句中，主句是过去时则从句也要用过去时（时态呼应）；think / believe 等第一人称主句变否定句时要否定主句、译成汉语时否定从句。",
        "在否定句中连接并列成分要用 or 代替 and。",
        "till / until 与终止性动词连用时要用否定式，译成「直到……才……」。",
      ],
      examTips: [
        "连词是中考单项填空的固定考点：先判断空前后两句话是并列、转折、因果还是选择关系，再选词。",
        "涉及 both...and / either...or / neither...nor / not only...but also 作主语时，先看谓语是单数还是复数，用就近原则反推连词。",
        "「不能同时用」是高频陷阱：because...so... 与 though/although...but... 都是典型错误选项。",
      ],
      memoryCard: [
        "and 顺，or 选（否定用 or），but 转，so 果，for 说明。",
        "祈使句 + and = 就会……；祈使句 + or = 否则……。",
        "both...and 用复数；either...or / neither...nor / not only...but also 就近原则。",
        "because 与 so 不同现，though / although 与 but 不同现。",
        "主将从现：主句将来时，时间/条件状语从句用一般现在时。",
        "延续性动词 + until 用肯定式，终止性动词 + until 用否定式。",
      ],
    },
  },
];
