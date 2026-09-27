// web/js/grammar/yufan/pronouns.js
// 由 yufan/代词 目录下 31 张教材扫描图片整理（教材第 2 章《代词》，第 030—059 页）。
// 字段与 block 类型遵循 web/js/grammar/yufan/README.md 契约。

export default [
  {
    topicId: "g-pronouns",
    newTopic: false,
    title: "代词",
    sourceDirs: ["yufan/代词"],
    imagesRead: 31,
    summary:
      "代词是代替名词的一种词类。本章按「人称代词—物主代词—指示代词—反身代词—相互代词—不定代词—疑问代词和关系代词」建立体系，并重点辨析 it / one / that、some / any / no / none、other / another / others 等高频易混词。",
    intro:
      "整理自教材第 2 章《代词》（第 030—059 页）：先建立代词的分类框架，再逐类掌握变化表与句法功能，最后用中考真题陷阱题与自测题检验。",
    sections: [
      {
        heading: "一、代词概说与分类",
        blocks: [
          {
            type: "text",
            text: "代词是代替名词的一种词类。大多数代词具有名词和形容词的功能。代词在英语中的使用是很频繁的，这是因为在英语语言习惯中，第二次提到一些名词时，一般用代词代替这些名词。",
          },
          {
            type: "examples",
            items: [
              { en: "David bought a skateboard.", zh: "戴维买了一个滑板。" },
              { en: "He is playing on it now.", zh: "他现在正在玩滑板。" },
            ],
          },
          {
            type: "text",
            text: "典型例句中：第一句的名词 David 在第二句中用代词 He 代替；a skateboard 则用代词 it 代替。",
          },
          {
            type: "text",
            text: "英语中的代词，按其意义、特征以及在句子中的作用可分为：人称代词、物主代词、指示代词、反身代词、相互代词、不定代词、疑问代词和关系代词。",
          },
        ],
      },
      {
        heading: "二、人称代词：变化表与基本用法",
        blocks: [
          {
            type: "text",
            text: "人称代词是指代人、动物或事物的代词，如表示「我」「你」「他」「她」「它」「我们」「你们」「他们」的词。人称代词有人称、数和格的变化。",
          },
          {
            type: "table",
            head: ["人称", "数", "主格", "所有格", "宾格"],
            rows: [
              ["第一人称", "单数", "I", "my", "me"],
              ["第一人称", "复数", "we", "our", "us"],
              ["第二人称", "单数", "you", "your", "you"],
              ["第二人称", "复数", "you", "your", "you"],
              ["第三人称", "单数", "he", "his", "him"],
              ["第三人称", "单数", "she", "her", "her"],
              ["第三人称", "单数", "it", "its", "it"],
              ["第三人称", "复数", "they", "their", "them"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "She is my friend.", zh: "她是我的朋友。" },
              { en: "It's me.", zh: "是我。" },
              { en: "My baby likes him very much.", zh: "我家宝宝非常喜欢他。" },
            ],
          },
          {
            type: "list",
            items: [
              "作主语用主格：I like playing basketball. / She is a good student.",
              "作表语在口语中常用宾格：A: Who is there? B: It's me.",
              "作宾语用宾格：Do you know her? / Come with me. / I saw him in the supermarket.",
            ],
          },
          {
            type: "tip",
            text: "并列人称的顺序：如果有几个不同的人称同时作主语，且用 and、or 连接，习惯顺序是——单数 you, he and I；复数 we, you and they。若是表示做错事、承担责任时，有时说话的人会把 I（我）放在第一位：A: Who broke the window? B: I and Li Ming.",
          },
          {
            type: "tip",
            text: "人称代词作表语时，若其后跟有 who 或 that 引导的从句，则可用主格表示强调：It was I who made the cake for my mother.（是我为妈妈做的蛋糕。）",
          },
          {
            type: "pitfall",
            text: "I（我）无论放在句首、句中或句尾，都一定要大写：She is more excellent than I.",
          },
        ],
      },      {
        heading: "三、人称代词的特殊用法（it 与 we / you / they）",
        blocks: [
          {
            type: "examples",
            items: [
              { en: "It will snow tomorrow.", zh: "明天会下雪。" },
              { en: "They drink wine at meals in France.", zh: "在法国，人们吃饭时喝葡萄酒。" },
            ],
          },
          {
            type: "text",
            text: "1. it 的特殊用法（A）：一般情况下，it 表示人以外的动物或东西，是单数名词的代词，译为「它」。A: Where is your bike? B: It is over there.",
          },
          {
            type: "text",
            text: "it 有时也可指人：It's me. Open the door, please.（是我，请开门。）",
          },
          {
            type: "text",
            text: "2. it 的特殊用法（B）：指天气、时间、距离等时，可用 it 来代替，此时 it 并不译为「它」，而是作为无实际含义的主语，构成无人称句。",
          },
          {
            type: "list",
            items: [
              "指天气：It was raining this morning.（今天上午一直在下雨。）",
              "指气候：It's warm in this room.（这个房间很暖和。）",
              "指时间：A: What time is it? B: It's ten thirty.（几点了？十点半了。）",
              "指距离：A: How far is it from here to the bank? B: It's about three miles.（从这儿到银行有多远？大约三英里。）",
            ],
          },
          {
            type: "text",
            text: "3. we、you、they 的特殊用法：we、you、they 有时并非指特定的人，不必译出「我们」「你们」「她们」「他们」。",
          },
          {
            type: "examples",
            items: [
              { en: "We had a heavy snow yesterday.", zh: "昨天下了一场大雪。" },
              { en: "You don't see many foreigners there.", zh: "在那儿，人们见不到很多外国人。" },
              { en: "They speak English in Canada.", zh: "在加拿大，人们说英语。" },
            ],
          },
          {
            type: "tip",
            text: "they 用来表示泛指：此句中的 They 用来泛指，但不泛指一切人，而指不包括说话人在内的那些「人们」。",
          },
        ],
      },
      {
        heading: "四、物主代词",
        blocks: [
          {
            type: "text",
            text: "表示所有关系的代词叫物主代词，也可叫代词所有格。物主代词分形容词性物主代词和名词性物主代词两种，有人称和数的变化。",
          },
          {
            type: "table",
            head: ["种类", "第一人称单数", "第二人称单数", "第三人称单数", "第一人称复数", "第二人称复数", "第三人称复数"],
            rows: [
              ["形容词性物主代词", "my", "your", "his / her / its", "our", "your", "their"],
              ["名词性物主代词", "mine", "yours", "his / hers / its", "ours", "yours", "theirs"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "Olivia is my foreign teacher.", zh: "奥利维亚是我的外教。" },
              { en: "A: Is that car yours?", zh: "那辆车是你的吗？" },
              { en: "B: Yes, it's mine.", zh: "是的，是我的。" },
            ],
          },
          {
            type: "list",
            items: [
              "形容词性物主代词只可作定语，后面一定要跟上一个名词：I like his car.（我喜欢他的车。）「形容词性物主代词 + 名词」可改写为名词性物主代词：This is her doll. = This doll is hers.",
              "名词性物主代词可作主语：Our house is here, and theirs is there.（我们的房子在这儿，他们的在那儿。）",
              "名词性物主代词可作表语：A: Whose car is this? B: It's hers (= her car).",
              "名词性物主代词可作宾语：Let's clean their room first and ours (= our room) later. / I have lost my dictionary. Would you please lend me yours?",
            ],
          },
          {
            type: "text",
            text: "双重所有格句型：a / an / this / that / some / no 等 + 名词 + of + 名词性物主代词。",
          },
          {
            type: "examples",
            items: [
              { en: "They like this lovely child of yours.", zh: "他们喜欢你家的这个小宝贝。" },
              { en: "A friend of ours is coming soon.", zh: "我们的一个朋友马上就来。" },
              { en: "That watch of hers is beautiful.", zh: "她的那块表很漂亮。（暗示她有许多块表）" },
            ],
          },
          {
            type: "pitfall",
            text: "冠词 a 之后不能加所有格。「冠词 a / an / the 和 this、that、some 等词后不能加所有格」：a friend of mine（我的一位朋友）是对的，a my friend 是错的。",
          },
          {
            type: "tip",
            text: "比较：This is my book.（my 后面必须加名词）/ This book is mine.（mine 后面不可加名词）",
          },
        ],
      },      {
        heading: "五、指示代词",
        blocks: [
          {
            type: "text",
            text: "表示「这个」「那个」「这些」「那些」等指示概念的代词叫指示代词。指示代词有 this、that、these、those 等。",
          },
          {
            type: "table",
            head: ["指示代词", "复数形式", "含义"],
            rows: [
              ["this", "these", "是指在时间上或空间上离说话的人较近的人或物"],
              ["that", "those", "是指在时间上或空间上离说话的人较远的人或物"],
            ],
          },
          {
            type: "text",
            text: "指示代词在句子中可作主语、表语、宾语和定语。This is my doll. That is Mary's.",
          },
          {
            type: "list",
            items: [
              "作主语：This is a good idea. = This idea is good.",
              "作表语：What he wants is that / this.",
              "作宾语：You like this but I like that.",
              "作定语：What is the use of those books?",
            ],
          },
          {
            type: "text",
            text: "特殊用法：that、those 的替代——为了避免重复，可用 that、those 代替前面提到过的事物，但是 this、these 一般不可用于这种代替。",
          },
          {
            type: "examples",
            items: [
              { en: "The weather in Kunming is better than that (= the weather) in Beijing.", zh: "北京的天气不如昆明好。" },
              { en: "The radios made in Shanghai are as good as those (= the radios) made in Tianjin.", zh: "上海生产的收音机和天津生产的一样好。" },
              { en: "His interests are different from those (= the interests) of his childhood.", zh: "他的兴趣和童年时代不同了。" },
            ],
          },
          {
            type: "text",
            text: "this、that 有时可代替句子或句中的一部分。She was ill. That's why she didn't come here.（句中的 that 作主语，代替前面讲到的原因，即 She was ill.）He broke the window, and that cost him 15 dollars.",
          },
          {
            type: "tip",
            text: "this 和 these 一般用来指下面将要讲到的事物：Don't be too excited when you hear this.（听了这个你不要激动。）",
          },
        ],
      },
      {
        heading: "六、反身代词",
        blocks: [
          {
            type: "text",
            text: "表示「我自己」「你自己」「她自己」「他自己」「我们自己」「你们自己」「她们自己」和「他们自己」等的代词，叫反身代词。",
          },
          {
            type: "table",
            head: ["人称", "单数", "复数"],
            rows: [
              ["第一人称", "myself", "ourselves"],
              ["第二人称", "yourself", "yourselves"],
              ["第三人称", "himself / herself / itself", "themselves"],
            ],
          },
          {
            type: "text",
            text: "构成规律：第一、二人称是「形容词性物主代词 + self（或 selves）」；第三人称是「人称代词的宾格 + self（或 selves）」。",
          },
          {
            type: "examples",
            items: [
              { en: "You may go and ask the teacher himself.", zh: "你可以去问老师本人。" },
              { en: "Gloria learned how to protect herself in diving.", zh: "格洛丽亚学会了如何在潜水时保护自己。" },
            ],
          },
          {
            type: "list",
            items: [
              "作同位语，以加强语气，表示强调「本人，自己」，位置较灵活：He cooked it himself. = He himself cooked it. / I spoke to the boss himself.",
              "作宾语，表示动作返回到动作执行者本身：Jane saw herself in the mirror. / Einstein taught himself advanced maths.",
              "作表语：His friend is not quite himself today.（他的朋友今天情绪有点儿反常。）",
              "介词 + 反身代词：Lucy said to herself, \"Where am I?\" / I went to the supermarket by myself.",
            ],
          },
          {
            type: "tip",
            text: "by oneself 相当于 alone 或 without help，意思是「独自一个人在没有别人的帮助下去的那儿」。比较：I went to the supermarket myself.（强调不要别人去，我自己去的）",
          },
          {
            type: "pitfall",
            text: "如果是人称代词的宾格作宾语，则主语和宾语不是指同一个人或物：Jane saw her in the mirror.（her 指另外一个人）",
          },
          {
            type: "list",
            items: [
              "反身代词短语 say to oneself：心里想着；自言自语",
              "反身代词短语 by oneself：独自地；独立",
              "反身代词短语 for oneself：为自己",
            ],
          },
        ],
      },
      {
        heading: "七、相互代词",
        blocks: [
          {
            type: "text",
            text: "相互代词表示一个动作在它所涉及的各个对象间是相互存在的。",
          },
          {
            type: "table",
            head: ["相互代词", "主格 / 宾格", "所有格"],
            rows: [
              ["each other", "each other", "each other's"],
              ["one another", "one another", "one another's"],
            ],
          },
          {
            type: "list",
            items: [
              "作宾语：We help each other / one another. / Don't talk to each other / one another. / Tom and Paul are passing to each other. / We don't often see each other now.",
              "所有格形式作定语：We should point out each other's / one another's shortcomings. / They know each other's favourite(s).",
            ],
          },
          {
            type: "tip",
            text: "在当代英语中，each other 和 one another 都指代两个或两个以上的人或物，可以互换使用。",
          },
          {
            type: "pitfall",
            text: "有些中文在字面上没有「互相」「彼此」等字，但译成英语时需要用 each other（互相、彼此）。",
          },
        ],
      },      {
        heading: "八、不定代词（一）：one / ones 及 it、one、that 的辨析",
        blocks: [
          {
            type: "text",
            text: "不指明代替任何特定名词的代词叫不定代词。常见的不定代词有 all、both、each、every、some、any、many、much、(a) few、(a) little、one、ones、either、neither、other、another、no、none 以及含有 some-、any-、no- 等的复合不定代词（如 something、anybody、nobody）。这些不定代词大都可以代替名词和形容词，在句中作主语、宾语、表语和定语；但是 none 和由 some-、any-、no-、every + thing / body / one 构成的复合不定代词（如 somebody 等）只能作主语、宾语或表语。",
          },
          {
            type: "text",
            text: "one 具有名词和形容词性质，表示「一个」的意思；既可指人，也可指物。one 在句中可用作主语、宾语、表语或定语。one 的复数形式是 ones，所有格是 one's，反身代词是 oneself。",
          },
          {
            type: "examples",
            items: [
              { en: "One should try one's best to serve the people.", zh: "一个人应该尽最大努力为人民服务。" },
              { en: "A: Look at that boy! B: Which one? A: The one wearing a blue sweater.", zh: "看那个男孩！哪一个？穿着蓝色毛衣的那个。" },
              { en: "Which boxes are bigger, these ones (= these boxes) or those ones?", zh: "哪些盒子更大一些，这些还是那些？" },
              { en: "I've been looking for a pencil, but I can't find one.", zh: "我一直在找一支铅笔，可是找不到。" },
            ],
          },
          {
            type: "text",
            text: "one 和 ones 可用来代替前面出现过的可数名词（单数或复数），以避免重复：Which one (= picture) do you like best? / I have an old bike, and she has a new one.",
          },
          {
            type: "text",
            text: "one 的前面可用 the、this、that、which 等词修饰，同时 one 和 ones 还可以用形容词来修饰：There are three packs, which one is yours, this one or that one or the one in the trunk? / The highlighter is blue. Will you please give me a red one? / The highlighters are blue. Will you please pass me some red ones?",
          },
          {
            type: "tip",
            text: "one 和 ones 指的都是同类异物：one 代替单数，ones 代替复数。own 后面不用 one：My shoes don't fit you; you'd better wear your own.",
          },
          {
            type: "text",
            text: "数词 one 与代词 one 的区别：数词 one 指数字「一」，代词 one 代替前面提到过的人或物。I have one present, but she has three. It's unfair.（数词）/ This is not the one I want.（代词）",
          },
          {
            type: "table",
            head: ["代词", "含义", "例句"],
            rows: [
              ["it", "指特定的东西，指代同类同物，复数形式用 they 或 them", "May I use your basketball? — Sure, you can use it (= the basketball)."],
              ["one", "代替前面提到过的人或物，不表示特指；特指需加限定词 the、this 等", "Can you lend me your pen? — I'm sorry, I haven't got one. (= a pen)"],
              ["that", "代表一个对等部分，复数形式用 those", "The weather in Beijing is colder than that (= the weather) in Guangzhou."],
            ],
          },
          {
            type: "pitfall",
            text: "指天气的 weather 是不可数名词，只能用单数 that。one 泛指时是同类（钢笔）但不同物；特指时用 the one / this one。",
          },
          {
            type: "tip",
            text: "只有当 one 作主语时，句子中才能使用 one's 或 oneself：One must do one's duty. / One should look after oneself.",
          },
        ],
      },
      {
        heading: "九、不定代词（二）：some / any / no / none 及合成词",
        blocks: [
          {
            type: "examples",
            items: [
              { en: "I have some money in my pocket, but it is not enough. Do you have any?", zh: "我口袋里有一些钱，但不够。你还有些吗？" },
            ],
          },
          {
            type: "text",
            text: "some、any 可与复数可数名词和不可数名词连用，表示「一些」。some 一般用于肯定句中，any 一般用于否定句、疑问句和条件句中。",
          },
          {
            type: "list",
            items: [
              "I have some story books. / There is some milk in the glass.",
              "条件句：You can ask me if you have any questions.",
              "I haven't any money. (= I have no money.) Do you have any?",
              "There aren't any lemons on the table. = There are no lemons on the table.",
              "I don't want any of you to get lost.",
            ],
          },
          {
            type: "tip",
            text: "not...any = no...。any 在否定句、疑问句中不必译出来。",
          },
          {
            type: "text",
            text: "由 some、any 构成的合成词的用法：I have something important to tell you. / There isn't anything wrong with the computer. / He doesn't know anything about it. = He knows nothing about it. / Anybody can do it.",
          },
          {
            type: "pitfall",
            text: "something、anything、nothing 有形容词修饰时，形容词要放在它们的后面；anybody 在肯定句中加强了语气，意为「不论谁，任何人」。",
          },
          {
            type: "text",
            text: "some、any 的特殊用法（A）：在疑问句中，一般不用 some。只有当问句表示一种邀请或者请求，或期待一个肯定的回答时才能用 some。",
          },
          {
            type: "examples",
            items: [
              { en: "Will you have some coffee?", zh: "你想喝咖啡吗？（表示邀请）" },
              { en: "Haven't you forgotten something?", zh: "你难道没忘记什么事吗？（问者肯定被问者忘了什么）" },
              { en: "Did somebody call me this morning?", zh: "今天上午有人给我打电话吧？（问者猜测应该有人打过）" },
            ],
          },
          {
            type: "text",
            text: "比较：Is there anything to eat?（不知道有没有，只是问一问）／ Is there something to eat?（希望有，而且断定会有）",
          },
          {
            type: "text",
            text: "在否定句中，some 表示部分否定，any 表示全部否定。He doesn't know some of you.（他只认识你们中的一些人，表示不全认识）／ He doesn't know any of you.（他不认识你们，表示全都不认识）",
          },
          {
            type: "pitfall",
            text: "some 和 any 不能直接与人称代词连用，需要先加介词 of，再跟人称代词宾格。some 用于单数可数名词前时表示「某个」，而不是「一些」；any 有时也可用于肯定句中，表示「任何一个」：This morning some girl asked for you. / You can buy this kind of chocolate at any big store.",
          },
          {
            type: "text",
            text: "no 后面可跟可数名词和不可数名词，表示否定，相当于 not + any 或者 not + a 等。We've no good friends here. = We've not any good friends here. = We've not a good friend here.",
          },
          {
            type: "examples",
            items: [
              { en: "So far, no man has travelled farther than the moon.", zh: "到目前为止，没人到过比月球还远的地方。" },
              { en: "There are no mangoes on the desk. = There is no mango on the desk. = There aren't any mangoes on the desk.", zh: "桌子上没有杧果。（可数名词，可用四种句式表示同一含义）" },
              { en: "There is no water in it. = There isn't any water in it.", zh: "里面没有水。（不可数名词，只能用这两种句式表示）" },
            ],
          },
          {
            type: "pitfall",
            text: "「any + 名词」作主语不能构成否定句；「no + 名词」本身就是否定，所以不能再用否定词。",
          },
          {
            type: "text",
            text: "none 的用法：与 no 不同，none 后面不能直接跟名词，它可以单独使用（主要用于回答 How many 或 How much 问句），也常和 of 连用；none 既可指人也可指物。A: How much bread is there? — B: None. = No bread. / A: How many students went there? — B: None. = No students. = Not a student.",
          },
          {
            type: "list",
            items: [
              "None of them / the shoes were the right size.",
              "English is the first language in none of these countries. = English isn't the first language in any of these countries.",
              "none 可以指人或物；no one = nobody，只能指人：A: Who does he like? B: No one. / None.",
            ],
          },
          {
            type: "pitfall",
            text: "None of the T-shirts is clean. 是对的；No one of the T-shirts is clean. 是错的。Nothing is serious. = There is nothing serious. = There isn't anything serious.（Anything isn't serious. 是错的）",
          },
          {
            type: "table",
            head: ["合成词", "等价形式", "指代"],
            rows: [
              ["nothing", "not + anything", "指物"],
              ["nobody", "not + anybody", "指人"],
              ["no one", "not + anyone", "指人"],
            ],
          },
          {
            type: "list",
            items: [
              "no 及其合成词 nobody、nothing 是否定词，表示否定含义：Nobody remembered his name. / He said nothing.",
              "some 及 somebody、something 表示肯定含义时，用在肯定句中；但表示请求、客气的询问时，也可用在疑问句中：There is somebody who wants to speak to you. / Would you like something to eat?",
              "any 及其合成词 anybody、anything 一般用在否定句、疑问句和条件句中：Does anybody else want to go? / Do you have anything else to say?",
              "由 no、some 和 any 构成的合成词 nothing、nobody、no one、something、somebody、someone、anything、anybody、anyone 等可与不定式连用：She has nothing to do and has nobody to talk to. / I've something important to do. / Does he have anything to say?",
            ],
          },
          {
            type: "tip",
            text: "some、any 和 no 构成的复合词与形容词连用时，形容词要放在这些复合词之前：There is nothing interesting here.",
          },
        ],
      },      {
        heading: "十、不定代词（三）：other / another、all / both、each / every、either / neither、many / much / few / little",
        blocks: [
          {
            type: "table",
            head: ["种类", "单数", "复数"],
            rows: [
              ["泛指", "another = an other", "other boys"],
              ["特指", "the other", "the other boys = the rest boys / others = the rest"],
              ["功能", "作主语、宾语、定语", "作定语 / 作主语、宾语"],
              ["搭配", "one...the other...", "some...other + n. / some...the others..."],
            ],
          },
          {
            type: "text",
            text: "the other 表示两个中的一个，常与 one 连用，即 one...the other...。He has two pairs of sneakers; one is Nike shoes, (and) the other is Adidas. / There are only two baseball caps left. I don't like this one. Will you please show me the other?",
          },
          {
            type: "list",
            items: [
              "「other + 名词」相当于 others，意为「别的……」：What other things (= others) can you see? / Some boys are reading books, other boys (= others) are watching TV.",
              "「the other + 名词」相当于 the others，意为「其余的……」：There are thirty students in our class. Twenty are girls. The other students (= The others) are boys.",
              "只有男孩或女孩两种选择时，只能用 the other + 名词 (= the others)。",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "Some of the colour pencils are red. The others (= The other colour pencils) are blue.", zh: "有些彩色铅笔是红的，其余的都是蓝的。（the others 表示除了红和蓝，没有别的颜色）" },
              { en: "Some of the pencils are orange, others (= other pencils) are blue.", zh: "有些铅笔是橘色的，还有一些是蓝色的。（others 表示可能还有一些笔是别的颜色，如绿色、黄色等）" },
              { en: "He may fall behind the other students (= the others / the rest) when he comes back.", zh: "当他回来时，他可能落在最后面了。（表明他可能落在所有其他同学的后面，是最后一名）" },
              { en: "He may fall behind other students (= others) when he comes back.", zh: "当他回来时，他可能落在后面了。（表明他只是落后，不一定是最后一名）" },
              { en: "Eight of us have passed the test. The others haven't.", zh: "我们之中八人考试及格，其余的人都没及格。（只有及格、不及格两种可能）" },
            ],
          },
          {
            type: "text",
            text: "another (= an other) 意为「别的、另一个」，泛指众多中的一个，可单独使用，也可后接单数名词或代词 one，前面不能加定冠词。This book is too difficult for him. Will you please give him another one (= another book)? / I don't like this one. Show me another. / I got three books: one is a dictionary, another is a grammar book, and the third is a self-help book.",
          },
          {
            type: "tip",
            text: "有时 another 可用在「数词 + 复数名词」前，译为「再、又」：You may stay for another three days. another 是指「许多中的另外一个」，而 the other 是指「两个或两部分中的另外一个或另外一部分」。They all looked at a big and noisy machine in another corner of the machine shop.（房间里有两个以上的角落，用 another corner 表示其中的任意一个）/ Now China can send its TV and radio programmes to the other side of the world.（只指只有两边，用 the other side）",
          },
          {
            type: "examples",
            items: [
              { en: "It's another way of saying fast.", zh: "这是另外一种说得快的方法。（指有许多种说得快的方法，这只是其中一种，所以用 another）" },
              { en: "Make new friends but keep the old. One is silver and the other is gold.", zh: "结识新朋友，不忘老朋友。一方是银，另一方是金。（指新老两种朋友，所以只能用 the other）" },
            ],
          },
          {
            type: "list",
            items: [
              "all 代表或修饰三个或三个以上的人或事物，也可以代表或修饰不可数名词，可以作主语、宾语、表语、同位语和定语：All of us like to eat apples. = We all like to eat apples. / All the oil has been used up. / You haven't eaten all (of) the ice cream.",
              "both 是指「两者都……」，可以作主语、宾语、同位语和定语：Both of his children have blue eyes. / They both want to go to the zoo.",
            ],
          },
          {
            type: "pitfall",
            text: "「all of + 人称代词宾格」中的 of 不能省略，即 all 的后面不能直接跟人称代词。all、both 的位置和频度副词一样，要放在 be 动词、情态动词及助动词之后；如有多个助动词，则放在第一个助动词之后、行为动词（实义动词）之前：They all / both went there. / They were both waiting outside the gate.",
          },
          {
            type: "table",
            head: ["比较项", "each 的用法", "every 的用法"],
            rows: [
              ["修饰对象", "可修饰人或物", "与 each 相同"],
              ["作主语时的谓语", "用单数形式（作同位语时例外）", "与 each 相同"],
              ["指代范围", "指两个或两个以上中的一个", "指两个（不含两个）以上中的一个"],
              ["侧重点", "侧重于个体、个别", "侧重于全体，意思上等同于 all"],
              ["能否单独使用", "可单独使用，作定语时后面要用单数", "不可单独使用，后面必须加名词（只能在句中作定语），名词用单数"],
              ["与 of 连用", "可以和 of 连用", "不可以和 of 连用，但 every one（分开写）可以和 of 连用"],
              ["句法功能", "可作同位语、主语、宾语", "只能作定语，后面必须跟名词单数"],
              ["合成词", "没有合成词", "与 one / body / thing 组成合成词，合成词作主语、宾语、表语，但不能作定语，作主语时谓语动词要用单数形式"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "He has balls on each hand.", zh: "他的每个手中都有球。（人有两只手，只能用 each；on every hand 是错的）" },
              { en: "There are flowers on each / every side of the square.", zh: "广场的四边都是花。（广场有四边，each、every 都可以，side 要用单数）" },
              { en: "There are many trees on each side of the street.", zh: "街道两侧有许多树。（街只有两边，只能用 each，不能用 every）" },
              { en: "Each of the rooms is big and bright.", zh: "每一个房间都宽敞明亮。（Every of the rooms... 是错的）" },
              { en: "Of course, everyone / everybody likes presents.", zh: "当然了，每个人都喜欢礼物。" },
            ],
          },
          {
            type: "pitfall",
            text: "everyone 在意义上代表复数，相当于「大家」「所有的人」，但在句中作主语时谓语动词要用单数形式；合成词 everyone / everybody 等词后不能再加名词。each 作同位语时位置较灵活：We each are praised. = We are praised each.",
          },
          {
            type: "text",
            text: "比较 all、every 和 each：All countries in Asia are against the plan. = Every country in Asia is against the plan. = Each country (= Each of the countries) in Asia is against the plan.",
          },          {
            type: "table",
            head: ["用法 / 代词", "both", "either", "neither"],
            rows: [
              ["含义", "两者都（肯定）", "两者之中的任意一个", "两者都不（全部否定）"],
              ["作主语时的谓语动词", "用复数形式", "用单数形式", "用单数形式"],
              ["作定语修饰名词时", "名词要用复数", "名词要用单数", "名词要用单数"],
              ["常用搭配", "both...and...", "either...or...", "neither...nor..."],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "Either of the movies is good.", zh: "两部电影中任何一部都不错。" },
              { en: "Neither of the movies is good.", zh: "两部电影都不好。" },
              { en: "Both of the movies are good.", zh: "两部电影都好。" },
              { en: "Neither cup is clean, is it?", zh: "两个杯子没有一个是干净的，不是吗？（前半部分是否定句，反意疑问句要用肯定形式）" },
              { en: "Both my brother and your sister have passed the exam.", zh: "我哥哥和你姐姐（他们两个）都通过了考试。" },
              { en: "Either my brother or your sister has passed the exam.", zh: "不是我哥哥就是你姐姐考试及格了。" },
              { en: "Neither my brother nor your sister has passed the exam.", zh: "我哥哥和你姐姐（他们两个）都没通过考试。" },
            ],
          },
          {
            type: "table",
            head: ["代词", "使用范围 / 意义"],
            rows: [
              ["both, either, neither", "用于二者之间"],
              ["all, any, none", "用于三者或三者以上之间"],
              ["both, all", "表示肯定。后如跟名词，要跟复数名词，谓语动词也用复数形式"],
              ["neither, none", "表示全部否定"],
              ["neither, either", "如跟名词，要跟单数名词，谓语动词也用单数形式"],
            ],
          },
          {
            type: "tip",
            text: "both...and、either...or 和 neither...nor 是固定搭配，后面两个固定搭配的谓语动词符合就近原则。all 与 none 的用法一样：后跟单数名词时，谓语动词用单数形式；后跟复数名词时，谓语动词用复数。Neither of them is right. / Both of them are right. / None of them are right.",
          },
          {
            type: "table",
            head: ["代词", "搭配对象", "句法功能与说明"],
            rows: [
              ["many", "只能和复数可数名词连用", "可作主语、宾语、表语和定语"],
              ["much", "只能和不可数名词连用", "主要用于否定句和疑问句中"],
              ["a few（肯定）/ few（否定）", "只能和可数名词连用", "可作主语、宾语、定语等"],
              ["a little（肯定）/ little（否定）", "只能和不可数名词连用", "可作主语、宾语、定语等"],
            ],
          },
          {
            type: "list",
            items: [
              "many、a few、few 修饰可数名词；much、a little、little 修饰不可数名词。",
              "many、much、a few、a little 表示肯定的意思；few、little 组成的句子在形式上是肯定的，不能再加否定词 not，但在语法上它们属于否定句，表示否定的意思。",
              "many = a lot (of) 许多；a few = some but not many 一些；a little = some but not much 一点儿。",
              "much = a lot (of) 许多；few = nearly no 几乎没有；little = nearly nothing 几乎没有。",
              "在肯定句中也可用 a lot (of) 或 lots of 代替 many 和 much，既可修饰可数名词，也可修饰不可数名词。",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "We saw many old things on show in the museum. = We saw a lot of / lots of old things on show in the museum.", zh: "我们在博物馆里看到很多古老的东西。" },
              { en: "But they have a few small differences, too.", zh: "但是他们也有一些不同。（表示有区别）" },
              { en: "We have few differences.", zh: "我们几乎没有不同。（表示没区别）" },
              { en: "There is a little water in the glass. / There is little water in the glass.", zh: "玻璃杯里有一点水。／玻璃杯里几乎没有水。" },
              { en: "There are a few minutes left, aren't there? Don't worry!", zh: "还有几分钟，不是吗？别着急！" },
              { en: "There are few minutes left, are there? Hurry up!", zh: "没有时间了，是吗？快点儿！" },
            ],
          },
          {
            type: "pitfall",
            text: "only、even、quite、just 等词可以和 a few、a little 连用，而不能和 few、little 连用：If you learn even a little English, you'll find it useful after you leave school.",
          },
        ],
      },
      {
        heading: "十一、疑问代词和关系代词",
        blocks: [
          {
            type: "examples",
            items: [
              { en: "Who / Whom are you waiting for?", zh: "你在等谁？" },
              { en: "The student who / that came first is Mary.", zh: "第一个来的学生是玛丽。" },
            ],
          },
          {
            type: "text",
            text: "说明：例 1 中的 who / whom 是用来指代人的疑问代词，构成特殊疑问句，在句中作主语。例 2 中的关系代词 who / that 引导定语从句。",
          },
          {
            type: "list",
            items: [
              "疑问代词有 who、whom、whose、what 和 which 等，在句子中用来构成特殊疑问句。（参见〈第二十章 疑问句〉）",
              "疑问代词都可用作连接代词，引导名词性从句（主语从句、宾语从句和表语从句）。（参见〈第二十一章 句子的结构〉）",
              "关系代词 who、whom、whose、that、which 用来引导定语从句。（参见〈第二十一章 句子的结构〉中的定语从句部分）",
            ],
          },
        ],
      },
      {
        heading: "十二、中考真题陷阱题精析",
        blocks: [
          {
            type: "examples",
            items: [
              { en: "Don't tell others about it. It's only between ____. A. you and I  B. you and me  C. I and our  D. me and your【南京中考】", zh: "不要告诉别人这件事，这件事就你我知道。正确答案为 B。" },
              { en: "We decided to go for a field trip with some friends of ____. A. us  B. our  C. ours  D. ourselves【黄冈中考】", zh: "我们决定与我们的一些朋友一起到野外旅行。正确答案为 C。" },
              { en: "Don't worry about the children. They can take care of ____. A. ourselves  B. themselves  C. yourself  D. yourselves", zh: "别担心那些孩子，他们会照顾好自己的。正确答案为 B。" },
              { en: "You may drop in or just give me a call. ____ will do. A. Either  B. Each  C. Neither  D. All", zh: "你可以顺便过来或给我打电话，随便怎样都可以。正确答案为 A。" },
            ],
          },
          {
            type: "list",
            items: [
              "人称代词作介词宾语时，要用宾格形式；第一人称代词和第二人称代词作并列宾语时，第二人称在前，第一人称在后：between you and me。",
              "「……名词 + of + 名词性物主代词」表示双重所有格：some friends of ours。",
              "反身代词必须与相应的名词或代词保持人称和数的一致：They can take care of themselves.",
              "不定代词 either 表示「二者中任意一个」，具有肯定意义。要判断语境中的信息是「二者」还是「三者或三者以上」，是「肯定意义」还是「否定意义」。",
            ],
          },
        ],
      },
      {
        heading: "十三、本章自测要点（实力测验）",
        blocks: [
          {
            type: "list",
            items: [
              "人称代词与物主代词的选用：We like him very much. / Is this guitar yours? / Her name is Li Li. / It's mine.",
              "反身代词：look after himself / I made it myself. / We enjoyed ourselves.",
              "it 作无人称主语：It is very cold today.",
              "主谓一致：Each of the students has an email address. / Her parents are both teachers.",
              "few / a few / little / a little 与可数、不可数名词的搭配：There are a few new words in it.",
              "some / any 与 one / ones 的搭配：I want some bananas. Give me these big ones.",
              "some / any / every / many 的选用与 There be 句式的否定：There isn't any fruit in the refrigerator.",
              "复合不定代词与形容词的位置：I always believe that there isn't anything difficult if we set our mind to do it.",
              "情景对话中的不定代词：Either end will do. / Both my parents are from Xi'an.",
            ],
          },
        ],
      },    ],
    notes:
      "第 057 页「实力测验」第 25 题括号内的备选词被手指部分遮挡，按可见内容（something, anything, nothing）记录，存在不确定性；第 057 页第 19、20 题跨页续到第 058 页，第 058 页第 8 题选项续到第 059 页，已按续页内容合并。",
    extras: {
      contrasts: [
        {
          title: "it / one / that 的辨析",
          head: ["代词", "含义", "例句"],
          rows: [
            ["it", "指代同类同物，复数用 they / them", "May I use your basketball? — Sure, you can use it."],
            ["one", "泛指同类异物，不特指；特指用 the one / this one", "I haven't got one. (= a pen)"],
            ["that", "代表一个对等部分，复数用 those", "The weather in Beijing is colder than that in Guangzhou."],
          ],
        },
        {
          title: "形容词性物主代词 vs 名词性物主代词",
          head: ["属性", "能否单独使用", "例句"],
          rows: [
            ["形容词性", "不能，后面必须加名词", "This is my book."],
            ["名词性", "能，后面不可加名词", "This book is mine."],
          ],
        },
        {
          title: "some 与 any 的用法分工",
          head: ["代词", "适用句式", "特例"],
          rows: [
            ["some", "肯定句", "表示邀请、请求或期待肯定回答的疑问句中也可用 some"],
            ["any", "否定句、疑问句和条件句", "肯定句中可表示「任何一个」"],
          ],
        },
        {
          title: "other 家族一览",
          head: ["形式", "含义", "例句"],
          rows: [
            ["other + 名词", "别的……（= others）", "other boys (= others) are watching TV"],
            ["the other + 名词", "其余的……（= the others = the rest）", "The other students (= The others) are boys."],
            ["another", "许多中的另外一个（= an other）", "Show me another."],
            ["the other", "两者中的另外一个", "one is Nike shoes, and the other is Adidas"],
          ],
        },
      ],
      points: [
        {
          title: "all、both 的位置",
          desc: "all、both 的位置和频度副词一样，要放在 be 动词、情态动词及助动词之后，行为动词（实义动词）之前。",
          good: ["They all / both went there.", "They were both waiting outside the gate."],
          bad: [],
        },
        {
          title: "none 不能直接跟名词",
          desc: "none 后面不能直接跟名词，可以单独使用或与 of 连用；no one = nobody，只能指人。",
          good: ["None of the students went there.", "None of the T-shirts is clean."],
          bad: ["None students.", "No one of the T-shirts is clean."],
        },
        {
          title: "复合不定代词与形容词的位置",
          desc: "something、anything、nothing 等有形容词修饰时，形容词要放在它们的后面。",
          good: ["I have something important to tell you.", "There is nothing interesting here."],
          bad: ["Anything isn't serious."],
        },
        {
          title: "either / neither / both 的谓语一致",
          desc: "either、neither 作主语时谓语用单数，both 作主语时谓语用复数；作定语时 neither、either 后接单数名词，both 后接复数名词。",
          good: ["Neither of the movies is good.", "Both of the movies are good.", "Both teachers often answer the questions."],
          bad: [],
        },
      ],
      pitfalls: [
        "人称代词作介词宾语要用宾格，且并列时第二人称在前、第一人称在后：between you and me。",
        "双重所有格用「名词 + of + 名词性物主代词」：some friends of ours。",
        "反身代词必须与相应的名词或代词保持人称和数的一致：They can take care of themselves.",
        "冠词 a / an / the 和 this、that、some 等词后不能加所有格：a friend of mine（正确），a my friend（错误）。",
        "everyone / everybody 作主语时谓语动词用单数，且合成词后不能再加名词。",
        "few、little 形式肯定而意义否定，不能再加 not。",
        "I（我）无论在句首、句中还是句尾都要大写。",
      ],
      memoryCard: [
        "代词八类：人称、物主、指示、反身、相互、不定、疑问、关系。",
        "主格作主语，宾格作宾语；形容词性物主代词后必有名词，名词性物主代词后必无名词。",
        "some 用于肯定句与表邀请、请求的疑问句；any 用于否定句、疑问句和条件句。",
        "other 泛指复数用 others，特指其余用 the others（= the rest）。",
        "it 指同类同物，one 指同类异物，that 指对等部分。",
        "all / both 放 be 动词、助动词、情态动词之后，实义动词之前。",
      ],
    },
  },
];