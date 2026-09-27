// web/js/grammar/yufan/adverbs.js
// 来源：yufan/副词（教材第 6 章扫描 21 张，微信图片_20260927093231_326_66.jpg ~ 微信图片_20260927093618_346_66.jpg）
// 由 yufan 图片讲义整理，供 GrammarView 「语法专题」页面渲染。
// 自检：node --check web/js/grammar/yufan/adverbs.js

export default [
  {
    topicId: "g-adj-adv",
    newTopic: false,
    title: "副词",
    sourceDirs: ["yufan/副词"],
    imagesRead: 21,
    summary: "副词修饰动词、形容词、副词或整个句子，按意义分方式、程度、地点、时间、频度、疑问等类别，位置和比较等级都有固定规则。",
    intro: "按教材第 6 章顺序整理：种类与句法功能 → 位置 → 比较等级 → 常见副词辨析 → 形容词与副词的区别 → 章末常见失分陷阱。",
    notes: "第 19—21 张（微信图片_20260927093558_344_66.jpg、…345_66.jpg、…346_66.jpg）为章末「实力测验」，共 4 组练习（词形变换、用括号中适当的词填空、改写句子、选择填空），原书未附答案，未录入正文。",
    sections: [
      {
        heading: "1 副词的功能与种类",
        blocks: [
          {
            type: "text",
            text: "副词和形容词一样，也具有修饰功能。形容词修饰名词，副词则可以修饰动词、形容词、副词或整个句子。副词按词汇意义可分为方式副词、程度副词、地点副词、时间副词、频度副词、疑问副词等，分别用于表示状态、程度、场所、时间等。副词也具有比较等级的变化。",
          },
          {
            type: "examples",
            items: [
              { en: "He speaks well.", zh: "他说得好。（副词修饰动词）" },
              { en: "The house is very big.", zh: "房子非常大。（副词修饰形容词）" },
              { en: "He works very hard.", zh: "他工作非常努力。（副词修饰副词）" },
            ],
          },
          {
            type: "table",
            head: ["类别", "例词"],
            rows: [
              ["方式副词", "carefully 小心地、properly 适当地、softly 温柔地、warmly 热情地"],
              ["程度副词", "so 很、quite 相当、very 非常、much 很、almost 几乎"],
              ["地点副词", "here 这里、there 那里、outside 在外面、home 在家"],
              ["时间副词", "now 现在、then 那时、early 早、yesterday 昨天"],
              ["频度副词", "always 总是、usually 通常、often 常常、never 从来不、sometimes 有时、seldom 很少、once 一度、曾经"],
              ["疑问副词", "how 怎样、when 什么时候、where 什么地方、why 为什么"],
              ["其他副词", "also 也、either 也、only 仅仅、perhaps 也许、too 也"],
            ],
          },
          {
            type: "text",
            text: "一般将形容词词尾加 -ly，即成为副词，但也有例外：有的形容词与副词同形，有的变化特殊。",
          },
          {
            type: "table",
            head: ["词类", "规则变换", "同形", "特殊变换"],
            rows: [
              ["形容词", "careful、slow", "hard、fast", "good"],
              ["副词", "carefully、slowly", "hard、fast", "well"],
            ],
          },
        ],
      },
      {
        heading: "2 副词的句法功能",
        blocks: [
          {
            type: "text",
            text: "副词作状语：可以修饰动词、形容词、副词，也可以修饰整个句子。",
          },
          {
            type: "examples",
            items: [
              { en: "He works hard.", zh: "他努力工作。（副词修饰动词）" },
              { en: "It's very nice of you.", zh: "你真好。（副词修饰形容词）" },
              { en: "He parked the car very easily.", zh: "他很容易就把汽车停放好了。（副词修饰副词）" },
              { en: "Unfortunately he was out.", zh: "很不巧，他出去了。（副词修饰整个句子）" },
            ],
          },
          {
            type: "text",
            text: "副词作定语：少数地点副词和时间副词可以作定语，放在所修饰词的后面。",
          },
          {
            type: "examples",
            items: [
              { en: "The students here are all from Tianjin.", zh: "这儿的学生都来自天津。" },
              { en: "I met him on my way home.", zh: "我在回家的路上遇见了他。" },
            ],
          },
          {
            type: "tip",
            text: "副词作定语和介词短语作定语时一样，一律后置。",
          },
          {
            type: "text",
            text: "副词作表语：作表语的副词多数是表示位置的，如 in、out、on、back、down、up、off、upstairs 等。",
          },
          {
            type: "examples",
            items: [
              { en: "Is he in?", zh: "他在家吗？" },
              { en: "He's in / out.", zh: "他在家 / 他出去了。" },
              { en: "What's on this evening?", zh: "今晚演什么节目？" },
              { en: "When will she be back?", zh: "她什么时候回来？" },
              { en: "My mother has been away for a week.", zh: "我母亲出门已有一个星期了。" },
            ],
          },
          {
            type: "text",
            text: "副词作宾语补足语。",
          },
          {
            type: "examples",
            items: [
              { en: "Let them in.", zh: "让他们进来。" },
              { en: "We saw her off two days ago.", zh: "两天前我们为她送行。" },
              { en: "I went to see her only to find her out.", zh: "我去看她，不料她不在家。" },
            ],
          },
        ],
      },
      {
        heading: "3 副词的位置",
        blocks: [
          {
            type: "text",
            text: "地点副词、时间副词和方式副词一般位于句尾。有时为了强调时间，可以把时间副词放在句首。",
          },
          {
            type: "examples",
            items: [
              { en: "They live here.", zh: "他们住在这儿。（地点副词）" },
              { en: "I'll meet him at the station tomorrow. = Tomorrow I'll meet him at the station.", zh: "明天我将去车站接他。（时间副词可提前以示强调）" },
              { en: "The boy runs quickly.", zh: "这个男孩子跑得快。（方式副词）" },
              { en: "They did their experiments carefully in the lab yesterday.", zh: "昨天他们在实验室认真地做实验。（方式副词 + 地点副词 + 时间副词）" },
              { en: "The students all worked well here last week.", zh: "上周这些学生在这里都工作得很好。（方式副词 + 地点副词 + 时间副词）" },
            ],
          },
          {
            type: "tip",
            text: "句末同时有几个副词时，它们的基本顺序是：方式副词 + 地点副词 + 时间副词。",
          },
          {
            type: "text",
            text: "频度副词在句中的位置：① 位于 be 动词、情态动词及第一个助动词之后；② 位于行为动词之前；③ 有时为了强调，可放在句首。",
          },
          {
            type: "examples",
            items: [
              { en: "She is always kind to us.", zh: "她对我们总是很好。（be 动词 + 频度副词）" },
              { en: "I can never forget the day.", zh: "我永远不会忘记这一天。（情态动词 + 频度副词）" },
              { en: "He has never been abroad.", zh: "他从没出过国。（第一个助动词 + 频度副词）" },
              { en: "He often goes to school early.", zh: "他常常早去学校。（频度副词 + 行为动词）" },
              { en: "Sometimes I stay at home during the weekend.", zh: "有时周末我待在家里。（频度副词置于句首表示强调）" },
            ],
          },
          {
            type: "text",
            text: "程度副词在句中的位置：修饰动词时位置与频度副词相似；修饰形容词、副词时，位于它所修饰的词的前面。",
          },
          {
            type: "examples",
            items: [
              { en: "He is almost forty years old.", zh: "他快 40 岁了。" },
              { en: "He can hardly understand you.", zh: "他几乎听不懂你的话。" },
              { en: "I quite like the boy.", zh: "我相当喜欢这个男孩子。" },
              { en: "He studies much harder now.", zh: "现在他学习努力多了。" },
              { en: "The room is big enough to hold fifty persons.", zh: "房间足够大，可以容纳 50 人。（修饰形容词）" },
              { en: "He runs fast enough.", zh: "他跑得足够快。（修饰副词）" },
            ],
          },
          {
            type: "tip",
            text: "very 和 much 的区别：very 用于加强原级的程度（very big 很大）；much 用于加强比较级的程度（much bigger 大得多）。",
          },
          {
            type: "pitfall",
            text: "只有 enough 这个词，要置于它所修饰的形容词和副词的后面（big enough、fast enough）。",
          },
          {
            type: "text",
            text: "疑问副词位于句首。",
          },
          {
            type: "examples",
            items: [
              { en: "When do you get up every day?", zh: "你每天什么时候起床？" },
              { en: "Where is my bag?", zh: "我的书包在哪儿？" },
            ],
          },
        ],
      },
      {
        heading: "4 副词的比较等级",
        blocks: [
          {
            type: "text",
            text: "副词比较等级的构成和意义类似于形容词的比较等级。一般可在词后加后缀 -er、-est 构成，还可借助 more、most 构成比较级和最高级。少数副词的比较级是不规则的。",
          },
          {
            type: "table",
            head: ["原级", "比较级", "最高级"],
            rows: [
              ["hard 努力、困难", "harder", "hardest"],
              ["loud 高声", "louder", "loudest"],
              ["early 早", "earlier", "earliest"],
              ["high 高", "higher", "highest"],
              ["fast 快", "faster", "fastest"],
            ],
          },
          {
            type: "table",
            head: ["原级（借助 more / most）", "比较级", "最高级"],
            rows: [
              ["slowly 慢慢地", "more slowly", "most slowly"],
              ["clearly 明显地", "more clearly", "most clearly"],
              ["warmly 热情地", "more warmly", "most warmly"],
              ["easily 容易地", "more easily", "most easily"],
              ["beautifully 漂亮地", "more beautifully", "most beautifully"],
            ],
          },
          {
            type: "table",
            head: ["原级", "比较级", "最高级"],
            rows: [
              ["well 好", "better", "best"],
              ["badly 坏", "worse", "worst"],
              ["much 多", "more", "most"],
              ["little 少", "less", "least"],
              ["far 远", "farther 较远（只指距离更远）、further 进一步（表示抽象含义，指程度更深入一步）", "farthest 最远地（只指距离最远）、furthest 最大程度地（表示抽象含义，指程度最深）"],
              ["late 迟", "later 更迟、latter 后者", "latest 最近（表时间）、last 最后（表顺序）"],
            ],
          },
          {
            type: "pitfall",
            text: "有些副词没有比较等级变化，如 now 现在、never 从不、then 那时、here 这里、always 总是、how 如何。",
          },
          {
            type: "text",
            text: "副词的原级：A + 动词（行为动词）+ as + 副词的原级 + as + B，表示「A 和 B 一样……」。",
          },
          {
            type: "examples",
            items: [
              { en: "She speaks English as fluently as you.", zh: "她英语说得像你一样流利。" },
              { en: "The little girl loves the school as much as her own home.", zh: "这个小女孩爱校如家。" },
              { en: "I can't speak as fast as you. = I can't speak so fast as you.", zh: "我没法说得像你这么决。" },
              { en: "Do you eat as fast as we do?", zh: "你吃得和我们一样快吗？" },
              { en: "I'll arrive as early as I can. = I'll arrive as early as possible.", zh: "我将尽可能快地到达。" },
              { en: "I will write you back as quickly as I can. = I will write you back as quickly as possible.", zh: "我将尽可能快地给你回复。" },
            ],
          },
          {
            type: "tip",
            text: "as...as...can 和 as...as possible 这两种搭配都表示「尽可能……」，应用比较广泛。",
          },
          {
            type: "text",
            text: "副词的比较级句型：A + 动词（行为动词）+ 副词的比较级 + than B，表示「A 比 B 更……」。",
          },
          {
            type: "examples",
            items: [
              { en: "Tom works harder than John.", zh: "汤姆比约翰工作更努力。" },
              { en: "I got up earlier than my mother this morning.", zh: "今天早晨，我起得比我妈妈早。" },
              { en: "I can run faster than she.", zh: "我能跑得比她快。" },
              { en: "She was received more warmly than she had expected.", zh: "她受到的欢迎比她预料的热烈。" },
              { en: "She drives more carefully than her husband.", zh: "她开车比她丈夫小心。" },
            ],
          },
          {
            type: "text",
            text: "表示「和 B 比起来，更喜欢 A」时，要用 well 的比较级 better，句型：...like A better than B。",
          },
          {
            type: "examples",
            items: [
              { en: "I like spring better than winter.", zh: "和冬天相比，我更喜欢春天。" },
              { en: "I like Chinese better than English.", zh: "和英语相比，我更喜欢中文。" },
              { en: "Which do you like better, red or blue? — I like red better (than blue).", zh: "红的和蓝的，你更喜欢哪一个？——我更喜欢红色的。" },
              { en: "Who do you like better, Li Ming or Zhang Hua? — I like Li Ming better.", zh: "李明和张华，你更喜欢谁？——我更喜欢李明。" },
            ],
          },
          {
            type: "tip",
            text: "句型 prefer A to B 表示「喜欢 A 胜于 B」，上述例句还可改写为：I prefer spring to winter.",
          },
          {
            type: "text",
            text: "比较级的句型转换：① 比较级 ↔ 比较级（用反义词）；② 比较级 ↔ not...as + 副词的原级 + as...",
          },
          {
            type: "examples",
            items: [
              { en: "Li Ming runs faster than my brother. → My brother runs more slowly than Li Ming.", zh: "李明跑得比我兄弟快。→ 我兄弟跑得比李明慢。" },
              { en: "I get up earlier than you. → You get up later than I.", zh: "我起得比你早。→ 你起得比我晚。" },
              { en: "You sing better than she. → She doesn't sing as well as you.", zh: "你唱得比她好。→ 她唱得没你好。" },
              { en: "She studies harder than you. → You don't study as hard as she.", zh: "她学习比你努力。→ 你学习没她努力。" },
            ],
          },
          {
            type: "text",
            text: "副词的最高级句型：A + 动词（行为动词）+ (the) 副词的最高级 + in / of...，表示「A 在 in / of…范围内最……」。副词的最高级前面可以加定冠词 the，也可以省略。",
          },
          {
            type: "examples",
            items: [
              { en: "My sister gets up (the) earliest in my family.", zh: "我家里我姐姐起床最早。" },
              { en: "He runs (the) fastest in my class.", zh: "他在他们班跑得最快。" },
              { en: "I jumped (the) farthest in my class.", zh: "我在我们班跳得最远。" },
              { en: "Who can jump (the) highest of the three?", zh: "这三个人中谁跳得最高？" },
              { en: "He likes English (the) best of all the subjects.", zh: "在所有的学科中，他最喜欢英语。" },
              { en: "I like this story (the) best of all.", zh: "在所有的故事中，我最喜欢这个。" },
            ],
          },
          {
            type: "examples",
            items: [
              { en: "Which season do you like (the) best, spring, summer or autumn? — I like autumn (the) best (of the three).", zh: "春天、夏天和秋天，你最喜欢哪一个季节？——我最喜欢秋天。" },
            ],
          },
          {
            type: "tip",
            text: "which 和 what 的比较：当在一定数目的范围内作选择时用 which，在不定数目中作选择时用 what。Which newspaper do you like best of the three?（在特定的三种报纸内选，用 which）/ What newspaper do you like best?（泛泛地问，在所有的报纸中选，用 what）",
          },
        ],
      },
      {
        heading: "5 常见副词的用法辨析",
        blocks: [
          {
            type: "text",
            text: "very 和 much（非常）、too 和 either（也）、ago 和 before（以前）是英语中常见的几对副词；never（绝不）、always（总是）、hardly（几乎不）也是英语中常见的频度副词。它们的用法各不相同。",
          },
          {
            type: "text",
            text: "① very, much 非常：very 修饰形容词、副词的原级，而 much 修饰它们的比较级；very much 修饰动词。",
          },
          {
            type: "examples",
            items: [
              { en: "The dishes don't smell very nice to me.", zh: "这些菜我闻着并不很香。" },
              { en: "You finished your English composition very quickly.", zh: "你的英语作文完成得非常快。" },
              { en: "It's much better.", zh: "好多了。" },
              { en: "I like English very much.", zh: "我非常喜欢英语。" },
            ],
          },
          {
            type: "pitfall",
            text: "不能按汉语表达的语序说成 (×) I very much like English.",
          },
          {
            type: "text",
            text: "② too, either 也：too 当「也」讲时一般用于肯定句，通常放在句末，前面有逗号隔开；否定句中用 either。also（也）是比 too 更为正式的用语，它在句中的位置和频度副词的位置一样。",
          },
          {
            type: "examples",
            items: [
              { en: "You're a singer. She is a singer, too.", zh: "你是歌手，她也是歌手。" },
              { en: "You aren't a doctor. I am not a doctor, either.", zh: "你不是医生，我也不是。" },
              { en: "She also wants to learn English.", zh: "她也想要学习英语。" },
              { en: "A: His elder sister studies English. B: I study it, too. / I also study it.", zh: "A：他的姐姐学习英语。B：我也学英语。" },
              { en: "He didn't come. His brother didn't, either.", zh: "他没来，他弟弟也没来。" },
            ],
          },
          {
            type: "text",
            text: "③ ago, before 以前：ago 是以现在为基准，指「距今若干时间以前」，不能单独使用，如 three days / weeks / years ago，并且和动词的过去式连用。",
          },
          {
            type: "examples",
            items: [
              { en: "I met our teacher an hour ago.", zh: "一小时前，我遇到了我们老师。" },
              { en: "His grandmother died ten years ago.", zh: "他的奶奶十年前去世了。" },
            ],
          },
          {
            type: "text",
            text: "before 之前有「若干时间」时，指「距过去若干时间以前」，常在间接引语中和过去完成时连用；前面没有「若干时间」而单独使用时泛指「以前」，时间不确切，常和现在完成时连用。",
          },
          {
            type: "examples",
            items: [
              { en: "He said he had finished the work two days before.", zh: "他说他两天前就把工作做完了。（若主句中没有表示过去时间的动词 said，则应为 He finished the work two days ago.）" },
              { en: "He said that he had worked in Shanghai one year before.", zh: "他说他一年前在上海工作。" },
              { en: "I have seen the film before.", zh: "我以前看过这部电影。（○ 表示以前看过）" },
              { en: "I bought the bike three years ago.", zh: "我三年前买的这辆自行车。（只指出买的时间，和现在无关，用过去时）" },
              { en: "I have bought the bike before.", zh: "我以前买的这辆自行车。（before 泛指，时间不确切，与现在有关，用现在完成时）" },
            ],
          },
          {
            type: "tip",
            text: "before 后接其他词时（如 before dinner、before class），before 就是介词而不是副词。",
          },
          {
            type: "text",
            text: "④ 常用的频度副词：seldom（很少）、never（绝不）、always（总是）、often（常常）、frequently（时常）、sometimes（有时）、hardly（几乎不）。其中 seldom、never、hardly 在句中用于表示否定，使句子成为不带否定词 not 的否定句。",
          },
          {
            type: "examples",
            items: [
              { en: "He seldom watches TV in the daytime, does he?", zh: "他很少在白天看电视，是吗？（○ 反意疑问句用肯定形式）" },
              { en: "The work has never been done, has it?", zh: "工作还从未做过，是吗？（○）" },
              { en: "I'll never go to see him.", zh: "我再也不会去看他了。（含感情色彩）" },
              { en: "I won't go to see him.", zh: "我不去看他了。（不含感情色彩）" },
              { en: "He is always careless.", zh: "他总是马马虎虎。（be 动词 + 频度副词）" },
              { en: "They have hardly seen such wonderful pictures before.", zh: "他们以前很少看到 / 几乎看不到这么好的画。" },
            ],
          },
          {
            type: "tip",
            text: "频度副词的频率从小到大依次为：never（从不，绝不）0% → hardly（几乎不）10% → rarely / seldom（很少）15% → sometimes（有时）20% → frequently（经常）50% → often（经常、常常）75% → usually（通常）85% → always（总是、始终）100%。never 比 not 否定的语气更强烈。",
          },
        ],
      },
      {
        heading: "6 形容词和副词的区别",
        blocks: [
          {
            type: "text",
            text: "形容词和副词容易混淆，因为它们除了原级形式外都有比较级和最高级，有些单词既可作形容词又可作副词，在形式上没有区别。可以从作用、构词、位置、谓语动词等几方面来区分。",
          },
          {
            type: "text",
            text: "从在句中的作用看：形容词修饰名词和代词，说明其性质和特征，用来回答 which one、what kind、how many 等引导的问题；副词修饰动词、形容词和副词，有时还可修饰整个句子，表示时间、地点、状态、程度等。",
          },
          {
            type: "table",
            head: ["疑问副词", "用来回答的副词"],
            rows: [
              ["when（表示时间）", "now、yesterday..."],
              ["where（表示地点）", "here、outside、away..."],
              ["how（表示状态）", "slowly、quickly..."],
              ["how often / how long", "never、twice、sometimes..."],
              ["how much", "a little、more..."],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "A: There are three bags. Which one is yours? B: The red one is mine.", zh: "A：这里有三个包，哪个是你的？B：红色的是我的。" },
              { en: "A: How often do you go swimming? B: Twice a week.", zh: "A：你多长时间游一次泳？B：一周去两次。" },
            ],
          },
          {
            type: "text",
            text: "从构词方式看：① 名词→形容词；② 形容词→副词；③ 副词加 -ly 后变为另一个副词。",
          },
          {
            type: "list",
            items: [
              "名词加 -y 变为形容词：cloud→cloudy 多云的、snow→snowy 多雪的、rain→rainy 多雨的、wind→windy 多风的。",
              "名词加 -ful / -less 变为形容词：care→careful 仔细的 / careless 粗心的、hope→hopeful 充满希望的 / hopeless 无望的、help→helpful 有用的 / helpless 无助的。",
              "形容词加 -ly 变为副词：helpful→helpfully、careful→carefully、slow→slowly、quick→quickly、quiet→quietly、real→really、sure→surely、kind→kindly、tender→tenderly、usual→usually。",
              "词尾为 y 的形容词变副词时，要先将 y 变成 i，然后在词尾加 -ly：easy→easily、angry→angrily、busy→busily、happy→happily。",
            ],
          },
          {
            type: "pitfall",
            text: "有些 -ly 结尾的词并不是副词，而是形容词，如 friendly 友好的、sisterly 姐妹般的、brotherly 亲兄弟般的、oily 多油的、lonely 独自的、lovely 可爱的。",
          },
          {
            type: "table",
            head: ["原词", "同形副词 / 派生副词的差异", "例句"],
            rows: [
              ["hard", "hard 努力地（与形容词同形）；hardly 几乎不", "His parents hit him hard. 他的父母狠狠地揍了他。/ His parents hardly hit him. 他的父母几乎从不打他。"],
              ["high", "high 高高地（与形容词同形）；highly 高度地、非常", "Hold your head high. 高昂着头。/ He highly recommended it. 他高度称赞了它。"],
              ["close", "close 靠近地（与形容词同形）；closely 密切地", "Lily and Anna sit close together. 莉莉和安娜紧挨着坐在一起。/ Lily and Anna are closely related. 莉莉和安娜的关系非常亲密。"],
            ],
          },
          {
            type: "text",
            text: "形容词和副词同形：要看该词在句子中具体修饰什么词来判断它到底是形容词还是副词。",
          },
          {
            type: "table",
            head: ["单词", "作形容词", "作副词"],
            rows: [
              ["hard", "This kind of wood is hard. 这种木材硬。", "He studies hard. 他学习很努力。"],
              ["early", "He's in his early twenties. 他二十岁出头。", "I knew quite early that I wanted to marry her. 我很早就知道我想娶她。"],
              ["high", "I flew past a high tower. 我飞过一座高塔。", "I flew high in the sky. 我在空中飞得很高。"],
              ["deep", "The boy was in a deep sleep. 小男孩在熟睡。", "The boy dived deep into the water. 小男孩深深地潜入了水底。"],
              ["close", "We are close friends. 我们是亲密的朋友。", "Sit close to me. 坐得离我近一些。"],
              ["right / wrong", "That's the right / wrong answer. 那是正确 / 错误的答案。", "He said I spelled it right / wrong. 他说我拼写对了 / 错了。"],
              ["late", "Don't be late again. 不要再迟到了。", "I got up late this morning. 今天早上我很晚才起。"],
              ["straight", "Draw a straight line. 画一条直线。", "Go straight to your room. 直接回到你的房间去。"],
              ["well", "He looks well. 他看起来身体不错。（well 作形容词只表示身体健康）", "He works well. 他工作得很好。"],
            ],
          },
          {
            type: "text",
            text: "从在句中的位置看：形容词作定语修饰名词时放在名词前面；修饰 something、anything、nothing 等复合不定代词时需后置。地点、时间、方式副词一般放在句末；频度副词和程度副词则放在 be 动词、情态动词和第一个助动词之后，或者放在行为动词之前。",
          },
          {
            type: "examples",
            items: [
              { en: "The bright room is mine.", zh: "这间明亮的房间是我的。" },
              { en: "I've something / nothing important to tell you.", zh: "我有 / 没有重要的事情要告诉你。" },
              { en: "We hope to prevent anything unpleasant from happening.", zh: "我们希望防止任何不愉快的事发生。" },
              { en: "Katherine usually spells words carelessly, but she spelt very carefully there yesterday.", zh: "通常凯瑟琳拼写单词都非常马虎，但昨天她在那儿拼写得非常认真。" },
            ],
          },
          {
            type: "tip",
            text: "enough 作形容词修饰名词时，既可以放在名词前，又可以放在名词后（enough money / money enough）；作副词修饰形容词和副词时，均放在所修饰词的后面（soft enough、slowly enough）。",
          },
          {
            type: "text",
            text: "从句中的谓语动词看：如果谓语动词是系动词，后面的表语一定要用形容词而不能用副词；如果是行为动词，则一定要用副词。",
          },
          {
            type: "examples",
            items: [
              { en: "The child seems healthy. / I am hungry.", zh: "这孩子看起来很健康。 / 我饿了。（系动词 + 形容词）" },
              { en: "She dances well.", zh: "她跳舞跳得好。（行为动词 + 副词）" },
              { en: "She appears unhappy. / It feels good to be home.", zh: "她显得不高兴。 / 回家的感觉真好。（系动词 + 形容词）" },
              { en: "The dish tastes delicious. My little brother tasted the dish deliciously.", zh: "这道菜真好吃。我的小弟弟吃得很香。（系动词 + 形容词 / 行为动词 + 副词）" },
            ],
          },
          {
            type: "list",
            items: [
              "常见的系动词：be（is、am、are、was、were、will be、have / has been...）、taste 尝起来、sound 听起来、smell 闻起来、feel 觉得、摸起来、look 看起来、seem 似乎是、appear 显得、get 变得、become 变得、turn 变得、grow 变得。",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "I am really sure that this is a real diamond, not a fake.", zh: "我确信这是真的钻石而不是仿造的。（○ 修饰 sure 用副词 really，修饰 diamond 用形容词 real）" },
              { en: "I did well on the exam and got a good grade.", zh: "我考得不错，取得了好成绩。（○ 修饰动词 did 用副词 well，修饰名词 grade 用形容词 good）" },
              { en: "Only the bad singer performed badly.", zh: "只有那个蹩脚的歌手演唱得糟透了。（○ 修饰名词 singer 用形容词 bad，修饰动词 perform 用副词 badly）" },
              { en: "A: What kind of singer is he? B: He's perfect. / A: How did the singer perform? B: He did great.", zh: "回答 What kind（性质特征）的问题要用形容词；回答 How 要用副词。" },
            ],
          },
        ],
      },
      {
        heading: "7 常见失分陷阱（章末 Common Mistakes）",
        blocks: [
          {
            type: "pitfall",
            text: "【天津中考】What do you think of the football match? — Wonderful. They have never played ______. ——「否定词 + better 结构」表示「不能比……更好」，「否定词 + worse 结构」表示「不能比……更糟糕」。由句意可知回答是肯定的，只能用 better。",
          },
          {
            type: "pitfall",
            text: "【江西中考】I didn't know you take a bus to school. — Oh, I ______ take a bus, but it is snowing today. —— 由 but 表转折可知只有在恶劣天气下才乘公交车；hardly 意为「几乎不」，符合「很少乘公交车」的语义。",
          },
          {
            type: "pitfall",
            text: "【山东中考】I am not sure which tie to wear for the party. — God! I have no idea, ______. —— too 用于肯定句句末，either 用于否定句句末，also 用于句中，neither 表示「两者都不」。由回答可知是否定句，答案选 either。",
          },
          {
            type: "pitfall",
            text: "______ will you be back to China? — In two months. —— how long 表示「多长时间」，答语用一段时间；how far 表示「多远」，问距离；how often 表示「多长时间一次」，问频率；how soon 表示「多久」，答语为 in + 一段时间，用于一般将来时。答案选 how soon。",
          },
        ],
      },
    ],
    extras: {
      forms: [
        { name: "副词原级", pattern: "as + 副词原级 + as", note: "表示「A 和 B 一样……」；否定用 not so / as ... as。" },
        { name: "副词比较级", pattern: "副词的比较级 + than", note: "表示「A 比 B 更……」。" },
        { name: "副词最高级", pattern: "(the) + 副词最高级 + in / of...", note: "副词最高级前的 the 可以省略。" },
        { name: "越……越……", pattern: "the + 比较级 ..., the + 比较级 ...", note: "如 The busier he is, the happier he feels." },
        { name: "尽可能……", pattern: "as + 副词原级 + as one can / as possible", note: "两种搭配都表示「尽可能……」。" },
      ],
      points: [
        {
          title: "句末多个副词的顺序",
          desc: "句末同时出现几个副词时，基本顺序是：方式副词 + 地点副词 + 时间副词。",
          good: ["They did their experiments carefully in the lab yesterday.", "The students all worked well here last week."],
          bad: [],
        },
        {
          title: "频度副词与程度副词的位置",
          desc: "频度副词与修饰动词的程度副词，位于 be 动词、情态动词和第一个助动词之后；位于行为动词之前。",
          good: ["She is always kind to us.", "He has never been abroad.", "I quite like the boy."],
          bad: ["She always is kind to us.", "He never has been abroad."],
        },
        {
          title: "系动词后用形容词，行为动词后用副词",
          desc: "be、taste、sound、smell、feel、look、seem、appear、get、become、turn、grow 等系动词后接形容词；行为动词用副词修饰。",
          good: ["The dish tastes delicious.", "She dances well.", "I did well on the exam and got a good grade."],
          bad: ["The dish tastes deliciously.", "She dances good.", "I did good on the exam."],
        },
      ],
      contrasts: [
        {
          title: "形容词 vs 副词",
          head: ["比较项", "形容词", "副词"],
          rows: [
            ["作用", "修饰名词和代词，回答 which one / what kind / how many", "修饰动词、形容词、副词或整个句子，回答 when / where / how / how often / how much"],
            ["构词", "名词 + -y / -ful / -less", "形容词 + -ly；y 结尾先变 i 再加 -ly"],
            ["位置", "名词前；修饰复合不定代词时后置", "句末（地点、时间、方式）；be / 情态 / 助动词后或行为动词前（频度、程度）"],
            ["谓语动词", "系动词后作表语", "行为动词后作状语"],
          ],
        },
        {
          title: "too / either / also / neither",
          head: ["词", "用于", "位置"],
          rows: [
            ["too", "肯定句", "句末，前面常用逗号隔开"],
            ["either", "否定句", "句末"],
            ["also", "肯定句（较正式）", "句中，与频度副词位置相同"],
            ["neither", "表示「两者都不」", "可置于句首引起倒装"],
          ],
        },
        {
          title: "ago vs before",
          head: ["词", "基准", "常连用的时态 / 场景"],
          rows: [
            ["ago", "以现在为基准，指「距今若干时间以前」，不能单独使用", "一般过去时（three days ago）"],
            ["before（+ 若干时间）", "以过去为基准，指「距过去若干时间以前」", "间接引语中的过去完成时"],
            ["before（单独使用）", "泛指「以前」，时间不确切", "现在完成时"],
          ],
        },
      ],
      pitfalls: [
        "seldom、never、hardly 本身表示否定，句子不再用 not，反意疑问句要用肯定形式：He seldom watches TV in the daytime, does he?",
        "hardly 意为「几乎不」，与 hard（努力地）完全不同：His parents hardly hit him.",
        "very 修饰原级，much 修饰比较级；不能按汉语语序说 I very much like English.",
        "enough 修饰形容词、副词时要后置：big enough、fast enough。",
        "回答 How（怎么样）要用副词，回答 What kind（什么样的）要用形容词。",
        "-ly 结尾不一定都是副词：friendly、lonely、lovely、oily 是形容词。",
      ],
      examTips: [
        "副词的比较等级与形容词同步考查：看到 than 用比较级，看到 in / of + 范围用最高级。",
        "how long / how soon / how often / how far 的辨析、too / either / also 的辨析是中考常见陷阱。",
        "形容词还是副词的判断先看谓语动词：系动词后用形容词，行为动词后用副词。",
      ],
      memoryCard: [
        "修饰动词、形容词、副词、句子——副词四用。",
        "方式 + 地点 + 时间：句末副词的基本顺序。",
        "频度、程度副词：be 后、情态后、助动词后；行为动词前。",
        "enough 永远后置。",
        "hard 努力 / hardly 几乎不；high 高 / highly 高度地。",
      ],
    },
  },
];