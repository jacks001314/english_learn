// web/js/grammar/yufan/adjectives.js
// 来源：yufan/形容词（教材第 5 章扫描 15 张，微信图片_20260927092418_311_66.jpg ~ 微信图片_20260927093025_325_66.jpg）
// 由 yufan 图片讲义整理，供 GrammarView 「语法专题」页面渲染。
// 自检：node --check web/js/grammar/yufan/adjectives.js

export default [
  {
    topicId: "g-adj-adv",
    newTopic: false,
    title: "形容词",
    sourceDirs: ["yufan/形容词"],
    imagesRead: 15,
    summary: "形容词修饰名词，说明人或事物的性质与特征；分性质形容词、叙述形容词和其他形容词，可作定语、表语和宾语补足语，并具有比较等级的变化。",
    intro: "按教材第 5 章顺序整理：种类与位置 → 比较等级的构成 → 原级、比较级、最高级的句型 → 章末常见失分陷阱。",
    notes: "第 15 张（微信图片_20260927093025_325_66.jpg）为章末「实力测验」，12 题选词填空 + 6 题汉译英，原书未附答案，未录入正文。",
    sections: [
      {
        heading: "1 形容词的种类",
        blocks: [
          {
            type: "text",
            text: "形容词用来修饰名词，说明人或事物的性质或特征。通常形容词可以分成性质形容词和叙述形容词两类，其位置不一定都在名词前面。多数性质形容词有比较等级的变化，可分为原级、比较级和最高级三种基本形式，用来表示事物的等级差别。",
          },
          {
            type: "examples",
            items: [
              { en: "I have a lovely sister.", zh: "我有一个可爱的妹妹。" },
              { en: "It is sunny in Beijing today.", zh: "今天北京天气晴朗。" },
            ],
          },
          {
            type: "table",
            head: ["类别", "特点", "例词"],
            rows: [
              ["性质形容词", "直接说明事物的性质或特征；有比较级和最高级变化；可用程度副词修饰；在句中可作定语、表语和补语", "fat 胖的、foolish 笨的、glad 高兴的、hot 热的、interesting 有趣的、beautiful 美丽的"],
              ["叙述形容词", "主要作表语或后置定语，又叫表语形容词；没有级的变化，也不能用程度副词修饰；大多数以 a 开头", "afraid 害怕的、alive 活着的、alone 单独的、asleep 睡着的、awake 醒着的、ill 病的"],
              ["其他形容词", "说明事物间的关系、用途、时间、方位；通常没有级的变化，也不能用程度副词修饰", "Chinese 中国的、permanent 永久的、western 西方的"],
            ],
          },
          {
            type: "text",
            text: "性质形容词通过句法位置体现三种功能：作定语、作表语、作宾语补足语。",
          },
          {
            type: "examples",
            items: [
              { en: "It is a very funny comedy.", zh: "这是一出非常有趣的喜剧。（funny 作定语）" },
              { en: "The comedy is very funny.", zh: "这出喜剧很有趣。（funny 作表语）" },
              { en: "All of us will try our best to make this comedy funny.", zh: "我们所有人将尽力使这出喜剧有趣。（funny 作宾语补足语）" },
            ],
          },
          {
            type: "tip",
            text: "「形容词 + 名词」可改为「主语 + be 动词 + 形容词」：This is an old book. → This book is old.",
          },
          {
            type: "examples",
            items: [
              { en: "The boy is afraid of his father.", zh: "这个男孩怕他爸爸。" },
              { en: "There were thousands of fish alive in the lake ten years ago.", zh: "十年前，这个湖里有成千上万条鱼。" },
              { en: "The sick man was afraid of death.", zh: "这个病人害怕死亡。（○ 作定语用 sick）" },
            ],
          },
          {
            type: "pitfall",
            text: "ill 只作表语，不能作定语，所以不能说 the ill man，要说 the sick man。",
          },
          {
            type: "tip",
            text: "「make + 名词 + 形容词」意为「使……显得……」：The dress makes my mother much younger.（这件衣服使我妈妈显得年轻多了。）",
          },
        ],
      },
      {
        heading: "2 形容词的位置：前置、后置与作状语",
        blocks: [
          {
            type: "text",
            text: "形容词作定语修饰名词时，要放在名词的前边；但如果修饰以 -thing 结尾的复合不定代词（something、anything、nothing 等），要放在这些词语之后。",
          },
          {
            type: "examples",
            items: [
              { en: "There is something wrong with this watch.", zh: "这只手表出了点儿故障。" },
              { en: "Is there anything important in the newspaper?", zh: "报纸上有什么重要新闻吗？" },
              { en: "We saw something white in the dark.", zh: "我们在黑暗中看到了一些白色的东西。" },
              { en: "He wants to do something different this time.", zh: "这一次他想做一些与众不同的事情。" },
            ],
          },
          {
            type: "text",
            text: "如果形容词所修饰的名词同时还被冠词（a、an、the）或代词（my、this、that…）修饰，词序为：冠词 / 代词 + 形容词 + 名词。",
          },
          {
            type: "examples",
            items: [
              { en: "a beautiful girl", zh: "一个漂亮的女孩" },
              { en: "an excellent musician", zh: "一位卓越的音乐家" },
              { en: "your favourite music", zh: "你最喜欢的音乐" },
            ],
          },
          {
            type: "list",
            items: [
              "A 名词前面有表示量度的词或词组时，形容词要放在所修饰的名词后面。",
              "B 带有表示量度的词或词组作表语时，形容词也要后置。",
              "C 一些形容词或形容词词组常放在句首或句尾，作状语。",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "London is a city about two thousand years old.", zh: "伦敦是一个大约有两千年历史的城市。" },
              { en: "Last year we built a building thirteen storeys high.", zh: "去年，我们盖了一栋十三层的高楼。" },
              { en: "The bridge is a hundred metres long.", zh: "这座桥长达一百米。" },
              { en: "The building is thirteen storeys high.", zh: "这座建筑有十三层高。" },
              { en: "He returned home, tired and hungry.", zh: "他又累又饿地回到了家。" },
              { en: "Cold and hungry, he walked in the street.", zh: "他走在街道上，又冷又饿。" },
            ],
          },
          {
            type: "tip",
            text: "当量度词组与形容词一起构成合成词，并在句子中作定语时，需要放在名词前面：a thirteen-storey-high building。",
          },
          {
            type: "table",
            head: ["位置", "条件", "例句"],
            rows: [
              ["名词前", "一般定语", "a beautiful girl"],
              ["名词后", "修饰 something / anything / nothing 等复合不定代词", "something wrong"],
              ["名词后", "名词前有表示量度的词或词组", "a city about two thousand years old"],
              ["句首或句尾", "形容词（词组）作状语", "Cold and hungry, he walked in the street."],
            ],
          },
        ],
      },
      {
        heading: "3 the + 形容词：表示一类人或事物",
        blocks: [
          {
            type: "text",
            text: "有些形容词可以和定冠词 the 连用，表示一类人或事物。这时它相当于一个名词，可以作主语或宾语。表示一类人时，看作复数；表示一类事物时，看作单数。",
          },
          {
            type: "examples",
            items: [
              { en: "Robin hated the rich and loved the poor.", zh: "罗宾憎恨富人，怜爱穷人。" },
              { en: "The wounded / old are well looked after.", zh: "伤员 / 老人们受到很好的照顾。" },
              { en: "We all love the beautiful.", zh: "我们都喜欢美丽的东西 / 事物。" },
            ],
          },
          {
            type: "list",
            items: [
              "the young 年轻人",
              "the aged 老人",
              "the sick 病人",
              "the deaf 聋人",
              "the blind 盲人",
              "the smooth 顺利的事",
              "the impossible 不可能的事",
            ],
          },
        ],
      },
      {
        heading: "4 形容词比较等级的构成",
        blocks: [
          {
            type: "text",
            text: "大多数性质形容词有比较等级的变化，即原级、比较级和最高级，用来表示事物的等级差别。原级即形容词的原形，比较级和最高级有规则变化和不规则变化两种。规则变化分别是在词尾加 -er、-est，或在词前加 more、most。",
          },
          {
            type: "table",
            head: ["构成法", "原级", "比较级", "最高级"],
            rows: [
              ["一般单音节词和部分双音节词在词尾加 -er / -est", "high 高的、great 巨大的、slow 慢的、near 附近的", "higher、greater、slower、nearer", "highest、greatest、slowest、nearest"],
              ["以不发音的 e 结尾的单音节词和少数以 le 结尾的双音节词，只在词尾加 -r / -st", "nice 好的、large 大的、able 有能力的、late 晚的", "nicer、larger、abler、later", "nicest、largest、ablest、latest"],
              ["以「辅音字母 + y」结尾的双音节词，将词尾的 y 改为 i，再加 -er / -est", "easy 容易的、busy 忙的、early 早的、happy 快乐的", "easier、busier、earlier、happier", "easiest、busiest、earliest、happiest"],
              ["重读闭音节词，只有一个辅音字母结尾时，双写该辅音字母再加 -er / -est", "big 大的、hot 热的、thin 细的、瘦的、wet 湿的", "bigger、hotter、thinner、wetter", "biggest、hottest、thinnest、wettest"],
              ["部分双音节词和多音节词，在词前加 more / most", "interesting 有趣的、beautiful 漂亮的、stupid 愚蠢的、common 一般的", "more interesting、more beautiful、more stupid、more common", "most interesting、most beautiful、most stupid、most common"],
            ],
          },
          {
            type: "list",
            items: [
              "有些形容词的比较级和最高级用两种方法表示均可：early→earlier, earliest / more early, most early；friendly→friendlier, friendliest / more friendly, most friendly；solid→solider, solidest / more solid, most solid；cruel→crueler, cruelest / more cruel, most cruel。",
              "少数以 -er、-ow 结尾的双音节词在末尾加 -er、-est：clever→cleverer, cleverest；narrow→narrower, narrowest。",
            ],
          },
          {
            type: "table",
            head: ["原级", "比较级", "最高级"],
            rows: [
              ["good 好的、well 健康的、好的", "better 较好的", "best 最好的"],
              ["bad 坏的、ill 有病的", "worse 更坏的、更差的", "worst 最坏的、最糟的"],
              ["many 多、much 多", "more 更多的", "most 最多的"],
              ["far 远", "farther 较远的、further 进一步的", "farthest 最远的、furthest 最深的"],
              ["little 少", "less 较少的", "least 最少的"],
              ["old 老的", "older 较老的、elder 年长的", "oldest 最老的、eldest 最年长的"],
            ],
          },
          {
            type: "tip",
            text: "elder 和 eldest 主要用于表示家庭成员之间的长幼关系（elder sister 姐姐、elder brother 哥哥；Mary is my elder sister. Joe is the eldest of my cousins.）；older 和 oldest 则用于表示年龄大小（Karl looks older than Jack.）。",
          },
        ],
      },
      {
        heading: "5 形容词原级的用法",
        blocks: [
          {
            type: "table",
            head: ["形式", "含义", "结构"],
            rows: [
              ["原级", "……和……相同", "as + 原级 + as"],
              ["比较级", "……比……较为……", "比较级 + than"],
              ["最高级", "在……中最为……", "the + 最高级 + of / in"],
            ],
          },
          {
            type: "text",
            text: "肯定句句型：A + be 动词 + as + 形容词原级 + as + B. 该句型表示「A 和 B 两者比较，程度相同」。",
          },
          {
            type: "examples",
            items: [
              { en: "Liu Ying is as good at sports as her sister.", zh: "刘英和她姐姐一样擅长运动。" },
              { en: "Her skin is as white as snow.", zh: "她肌肤如雪。" },
              { en: "My dog is as old as that one.", zh: "我的狗和那只狗一样大。" },
              { en: "This jacket is as cheap as that one.", zh: "这件夹克和那件一样便宜。" },
              { en: "It is as warm as yesterday.", zh: "今天和昨天一样暖和。" },
            ],
          },
          {
            type: "tip",
            text: "为了避免重复，常用 that、those 和 one 一类的代词代替 as 后重复出现的名词。",
          },
          {
            type: "text",
            text: "否定句句型：A + be 动词 + not + so / as + 形容词原级 + as + B. 该句型表示「A 不如 B 那么……」。",
          },
          {
            type: "examples",
            items: [
              { en: "He is not so / as careful as I. = I am more careful than he / him.", zh: "他不如我细心。（可以看出这个句型还可用比较级表示）" },
              { en: "The weather in Beijing is not so / as hot as that in Wuhan.", zh: "北京的天气不如武汉热。" },
              { en: "There are not so / as many books in our library as in yours.", zh: "我们图书馆的书没有你们的那么多。" },
              { en: "It is not so / as warm as yesterday.", zh: "今天不如昨天暖和。" },
            ],
          },
          {
            type: "pitfall",
            text: "not as...as 这一句型不表示「与……不同」，而表示「不如……那样；不像……那样」。",
          },
          {
            type: "text",
            text: "一般疑问句句型：Be 动词 + A + as + 形容词原级 + as + B? 表示「A 如 B 那么……吗？」",
          },
          {
            type: "examples",
            items: [
              { en: "Is he as busy as before?", zh: "他还像以前那么忙吗？" },
              { en: "Is there as much water in this glass as in that one?", zh: "这个杯子里的水和那个杯子里的一样多吗？" },
              { en: "Is it as warm as yesterday?", zh: "今天和昨天一样暖和吗？" },
            ],
          },
          {
            type: "text",
            text: "表示倍数：...times + as + 形容词原级 + as。",
          },
          {
            type: "examples",
            items: [
              { en: "This garden is ten times as large as that one.", zh: "这个花园是那个的十倍大。" },
              { en: "There are now twice as many parks in the city as in 2000.", zh: "这个城市现有的公园数量是 2000 年时的两倍。" },
              { en: "This ruler is three times as long as that one.", zh: "这把尺子的长度是那把尺子的三倍。" },
            ],
          },
          {
            type: "tip",
            text: "once 表示一倍；twice 表示两倍；three、four...times 表示三倍、四倍……",
          },
          {
            type: "text",
            text: "表示半数：half as + 形容词原级 + as。",
          },
          {
            type: "examples",
            items: [
              { en: "My handwriting is not half as good as yours.", zh: "我的书法还不如你的一半好。" },
              { en: "This pole is half as tall as that tree.", zh: "这根杆子只有那棵树的一半高。" },
            ],
          },
          {
            type: "text",
            text: "表示「尽可能……」：as + 形容词原级 + as possible。",
          },
          {
            type: "examples",
            items: [
              { en: "I will make it as beautiful as possible.", zh: "我将使它尽可能的漂亮。" },
              { en: "You should keep your teeth as healthy as possible.", zh: "你应该尽可能保持牙齿健康。" },
            ],
          },
        ],
      },
      {
        heading: "6 形容词比较级的用法",
        blocks: [
          {
            type: "text",
            text: "基本句型：A + 动词 + 形容词比较级 + than + B. 该句型表示「A 比 B 更……一些」。",
          },
          {
            type: "examples",
            items: [
              { en: "His brother is younger than I / me.", zh: "他兄弟比我小。" },
              { en: "She is more beautiful than her elder sister.", zh: "她比她姐姐更漂亮。" },
              { en: "This tree is taller than that one.", zh: "这棵树比那棵树高。" },
              { en: "You look younger today.", zh: "今天你看起来比较年轻。（省略了 than before）" },
            ],
          },
          {
            type: "tip",
            text: "than 后面接代词时一般用主格，但在口语中也可用宾格。",
          },
          {
            type: "examples",
            items: [
              { en: "You look younger today than you looked (young) before.", zh: "这个句子只是帮助理解，实际应用中应表达为：You look younger than before." },
              { en: "Are you feeling better?", zh: "你现在感觉好些了吗？（当比较的对象显而易见时，往往会将 than 从句省略）" },
            ],
          },
          {
            type: "text",
            text: "用修饰词加强语气：在形容词比较级前还可以用 much、even、far、a lot、still、a little 等来修饰，表示「……得多」「……一些」。",
          },
          {
            type: "examples",
            items: [
              { en: "Your room is much larger than mine.", zh: "你的房间比我的大多了。" },
              { en: "Our city is much more beautiful than yours.", zh: "我们的城市比你们的漂亮得多。" },
              { en: "Diamond is even harder than steel.", zh: "钻石甚至比钢还硬。" },
              { en: "He is even slower than before.", zh: "他甚至比以前更慢了。" },
              { en: "Japan is a little larger than Germany.", zh: "日本只比德国大一点儿。" },
            ],
          },
          {
            type: "text",
            text: "表示倍数：...times + 形容词比较级 + than...，表示「比……大 / 长 / 多……（N-1）倍」。",
          },
          {
            type: "examples",
            items: [
              { en: "Your room is three times larger than mine.", zh: "你的房间比我的大两倍。" },
              { en: "This river is ten times longer than that river.", zh: "这条河比那条河长九倍。" },
            ],
          },
          {
            type: "text",
            text: "表示「大几岁」「高几厘米」等：表示数、量的词 + 形容词比较级 + than...",
          },
          {
            type: "examples",
            items: [
              { en: "I'm two years older than you.", zh: "我比你大两岁。" },
              { en: "She is a head taller than I / me.", zh: "她比我高一头。" },
            ],
          },
          {
            type: "text",
            text: "表示「比其他任何……都……」：比较级 + than any other + 单数名词。该句型用比较级形式表达最高级的含义。",
          },
          {
            type: "examples",
            items: [
              { en: "He is better than any other student in the class. = He is the best in the class.", zh: "他在班里比其他任何一个学生都好。（他是最好的）" },
              { en: "This watch is more expensive than any other watch in the shop. = This watch is the most expensive one in the shop.", zh: "在这个店里，这只表比其他任何一只表都贵。（这只表是最贵的）" },
              { en: "He is taller than any other boy in his class.", zh: "在班上，他比其他任何男孩子都高。" },
            ],
          },
          {
            type: "pitfall",
            text: "any other 后要加单数名词，可以译成「其他任何一个」。",
          },
          {
            type: "text",
            text: "表示「越来越……」：比较级 + and + 比较级。",
          },
          {
            type: "examples",
            items: [
              { en: "The weather is getting warmer and warmer.", zh: "天气变得越来越暖和。" },
              { en: "Our city is becoming more and more beautiful.", zh: "我们的城市变得越来越美丽。" },
            ],
          },
          {
            type: "tip",
            text: "多音节形容词用此句型时，要用 more and more + 形容词原级。",
          },
          {
            type: "text",
            text: "表示「越……就越……」：the + 比较级 + ..., the + 比较级 + ...",
          },
          {
            type: "examples",
            items: [
              { en: "The busier he is, the happier he feels.", zh: "他越忙就越高兴。" },
              { en: "The sooner, the better.", zh: "越快越好。" },
              { en: "The higher the ground (is), the thinner the air becomes.", zh: "地势越高，空气就越稀薄。" },
            ],
          },
          {
            type: "text",
            text: "表示「两个中比较……的」：the + 比较级 + of the two。",
          },
          {
            type: "examples",
            items: [
              { en: "This watch is the cheaper of the two.", zh: "这只手表是两只中比较便宜的。" },
              { en: "He is the better of the two.", zh: "他是这两个人中比较好的。" },
              { en: "Of the two girls, Lynn is the more diligent.", zh: "丽恩是这两个女孩中比较勤奋的。" },
            ],
          },
          {
            type: "text",
            text: "表示「（比较 A 和 B）哪一个更……？」：Which is + 比较级, A or B? 如果是人与人相比较时，可用 who 代替 which。",
          },
          {
            type: "examples",
            items: [
              { en: "Which one is more popular, the radio or the movie?", zh: "广播和电影，哪一个更受欢迎？" },
            ],
          },
        ],
      },
      {
        heading: "7 形容词最高级的用法",
        blocks: [
          {
            type: "text",
            text: "三者或三者以上（人或事物）相比较，其中有一个在某一方面超过其他几个时，用最高级。最高级前面一般要加定冠词 the，后面可带 of / in 短语来说明比较的范围。句型：A + 动词 + 形容词最高级 + of / in...",
          },
          {
            type: "examples",
            items: [
              { en: "Spring is the best season of the year.", zh: "春天是一年中最好的季节。" },
              { en: "She is the youngest in the class.", zh: "她是班里年纪最小的。" },
            ],
          },
          {
            type: "tip",
            text: "of 和 in 短语的区别：of 常用于同一类事物范围内进行比较；in 常用于一定的地域空间或场所内进行比较。",
          },
          {
            type: "text",
            text: "表示「是最……之一」：one of the + 形容词最高级 + 可数名词复数。",
          },
          {
            type: "examples",
            items: [
              { en: "Shanghai is one of the most charming cities in China.", zh: "上海是中国最具魅力的城市之一。" },
            ],
          },
          {
            type: "pitfall",
            text: "「one of the + 形容词最高级」后面要用名词的复数形式。",
          },
          {
            type: "text",
            text: "表示「大多数，大部分的……」：most + 复数名词 / most of the + 复数名词 / most of + 代词。",
          },
          {
            type: "examples",
            items: [
              { en: "Most people like apples.", zh: "大多数人喜欢苹果。" },
              { en: "Most of the boys are good at football.", zh: "大多数的男孩都擅长踢足球。" },
              { en: "Most of us went camping yesterday.", zh: "我们中的大多数人昨天都去露营了。" },
            ],
          },
          {
            type: "text",
            text: "表示「哪一个（人）最为……呢？」：Which / Who is + the + 形容词最高级...? 该句型用于三个或三个以上的事物或人的比较。",
          },
          {
            type: "examples",
            items: [
              { en: "Which is the biggest of the five apples?", zh: "这五个苹果中哪一个最大？" },
              { en: "Who is the tallest boy in your class?", zh: "你们班哪个男孩最高？" },
            ],
          },
          {
            type: "text",
            text: "补充：我们可以用原级、比较级、最高级三种形式来表达最高级。",
          },
          {
            type: "examples",
            items: [
              { en: "She is the best in her class.", zh: "她是她们班最好的学生。（最高级）" },
              { en: "She is better than any other student in her class.", zh: "她比班里其他任何学生都好。（比较级）" },
              { en: "No other student in her class is better than she.", zh: "班里没有别的学生比她更好。（比较级）" },
              { en: "No other student in her class is as good as she.", zh: "班里没有别的学生像她一样好。（原级）" },
            ],
          },
        ],
      },
      {
        heading: "8 常见失分陷阱（章末 Common Mistakes）",
        blocks: [
          {
            type: "pitfall",
            text: "【福州中考】Is there ______ in today's newspaper? —— 肯定句中用 something，疑问句和否定句中用 anything；形容词修饰不定代词应后置。由回答可知问句询问的是事而不是人，答案选 anything new。",
          },
          {
            type: "pitfall",
            text: "【上海中考】He has made ______ progress this term than before. —— little 的比较级是 less，修饰不可数名词；few 修饰可数名词。因为是现在和过去进行比较，要用比较级，只能用 less。",
          },
          {
            type: "pitfall",
            text: "Peter is sixteen and his sister is two years ______, but she is in a higher grade. —— 本题考查「表示数量的词 + 形容词比较级」；由 but 表示转折可知妹妹比他小，答案选 younger。只看后一分句容易误选 older。",
          },
          {
            type: "pitfall",
            text: "She is ______ than any other student in her class. —— 由 than 可知应选比较级：比较级 + than + any other + 名词，或 no other + 名词 + 谓语动词 + 比较级 + than。答案选 better。",
          },
        ],
      },
    ],
    extras: {
      forms: [
        { name: "倍数与半数（原级）", pattern: "...times / half + as + 形容词原级 + as", note: "倍数表示「是……的几倍」，half 表示「是……的一半」。" },
        { name: "越……越……", pattern: "the + 比较级 + ..., the + 比较级 + ...", note: "表示后者随前者变化。" },
        { name: "两者中较……的", pattern: "the + 比较级 + of the two", note: "此时比较级前要加 the。" },
        { name: "比其他任何……都……", pattern: "比较级 + than any other + 单数名词", note: "用比较级形式表达最高级含义；any other 后接单数名词。" },
      ],
      points: [
        {
          title: "形容词修饰复合不定代词时要后置",
          desc: "something、anything、nothing 等复合不定代词被形容词修饰时，形容词放在后面。",
          good: ["There is something wrong with this watch.", "Is there anything important in the newspaper?"],
          bad: ["There is wrong something with this watch."],
        },
        {
          title: "the + 形容词表示一类人或事物",
          desc: "the young / old / rich / poor 等作主语时看作复数；the beautiful / impossible 等表示一类事物时看作单数。",
          good: ["Robin hated the rich and loved the poor.", "The wounded / old are well looked after."],
          bad: [],
        },
        {
          title: "量度在前，形容词要后置",
          desc: "名词前有量度词组，或量度词组作表语时，形容词放在后面。",
          good: ["London is a city about two thousand years old.", "The bridge is a hundred metres long."],
          bad: ["London is a city about two-thousand-year old."],
        },
      ],
      contrasts: [
        {
          title: "三种形式表达同一个最高级含义",
          head: ["形式", "结构", "例句"],
          rows: [
            ["最高级", "the + 最高级 + in / of", "She is the best in her class."],
            ["比较级", "比较级 + than any other + 单数名词", "She is better than any other student in her class."],
            ["比较级（否定式）", "no other + 名词 + be + 比较级 + than", "No other student in her class is better than she."],
            ["原级（否定式）", "no other + 名词 + be + as + 原级 + as", "No other student in her class is as good as she."],
          ],
        },
        {
          title: "形容词位置速查",
          head: ["位置", "条件", "例句"],
          rows: [
            ["名词前", "一般定语（冠词 / 代词 + 形容词 + 名词）", "a beautiful girl"],
            ["名词后", "修饰复合不定代词", "something wrong"],
            ["名词后", "名词前有量度的词或词组", "a building thirteen storeys high"],
            ["句首或句尾", "形容词（词组）作状语", "Cold and hungry, he walked in the street."],
          ],
        },
      ],
      pitfalls: [
        "修饰 something / anything / nothing 等复合不定代词的形容词必须后置：something new，不是 new something。",
        "疑问句和否定句中用 anything，肯定句中用 something。",
        "ill 只作表语，作定语要用 sick（the sick man）。",
        "half、times 等倍数、半数结构后面接原级：three times as long as。",
        "最高级前的 the 不能丢，one of the + 最高级 后面的名词必须用复数。",
      ],
      examTips: [
        "形容词比较等级是各地中考单项填空的固定考点：看到 than 或「两者」选比较级，看到 one of / in + 范围选最高级。",
        "复合不定代词 + 形容词后置、倍数 / 半数结构、any other + 单数名词是近年中考的高频陷阱（福州、上海等）。",
        "题干出现 but、than 之类的信号词时，先确定比较对象和比较方向，再决定形式。",
      ],
      memoryCard: [
        "两两比较用 than，三者以上加 the。",
        "something / anything 后面才放形容词。",
        "倍数、半数都接原级：three times as long as。",
        "the + 形容词 = 一类人（看作复数）。",
      ],
    },
  },
];