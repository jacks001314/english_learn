// web/js/grammar/yufan/nonfinite-verbs.js
// 来源：yufan/动词/非谓语动词（17 张教材扫描图片，压缩镜像 yufan-ds/动词/非谓语动词）→ 第17章 非谓语动词（第304—319页）
export default [
  {
    topicId: "g-nonfinite-verbs",
    newTopic: true,
    title: "非谓语动词",
    category: "动词",
    difficulty: 4,
    sourceDirs: ["yufan/动词/非谓语动词"],
    imagesRead: 17,
    summary:
      "非谓语动词包括动词不定式（to do）、动词-ing 形式（现在分词与动名词）和过去分词（done）三种。它们没有人称和数的变化，不受主语人称和谓语动词时态的干扰，但不能单独作谓语，仍保留动词特点（可带自己的宾语和状语）。",
    intro:
      "本章分三块：动词不定式的类型、句法功能、时态语态与重要句型；动词-ing 形式作主语、宾语、表语、宾语补足语、定语、状语；过去分词作定语、表语、宾语补足语、状语（含与被动语态、定语从句的区分），最后是中考易错陷阱与实力测验。",
    forms: [
      { name: "动词不定式·一般式", pattern: "to + 动词原形", note: "不定式的动作发生在谓语动作之后，或与谓语动作同时发生。" },
      { name: "动词不定式·否定式", pattern: "not to + 动词原形", note: "否定需在 to 前加 not：Mum often tells Tom not to play football in the street." },
      { name: "动词不定式·完成式", pattern: "to have + 过去分词", note: "表示不定式的动作发生在谓语的动作之前：I am sorry to have kept you waiting for a long time." },
      { name: "动词不定式·进行式", pattern: "to be + 现在分词", note: "表示不定式的动作与谓语的动作同时进行：He seems to be worrying about it." },
      { name: "动词不定式·被动语态", pattern: "to be + 过去分词", note: "表示被动关系：The sick man will need to be taken to a hospital." },
      { name: "疑问词 + 动词不定式", pattern: "疑问词 + to + 动词原形", note: "常可与宾语从句互换：I don't know what to do. = I don't know what I should do." },
      { name: "动词-ing 形式", pattern: "动词原形 + -ing", note: "包括现在分词和动名词两种，可作主语、宾语、表语、宾语补足语、定语、状语。" },
      { name: "过去分词", pattern: "动词 + -ed（不规则动词需逐一记忆）", note: "可作定语、表语、宾语补足语、状语，表示被动或完成。" },
      { name: "省略 to 的不定式", pattern: "make / let / have / see / hear / watch / feel / notice / listen to + 宾语 + 动词原形", note: "口诀：一感二听三让四观看；用于被动语态时被省略的 to 要还原。" },
    ],
    points: [
      {
        title: "不定式作主语时常用形式主语 it",
        desc: "带 to 的不定式作主语时，常用形式主语 it 代替，其作表语的形容词有 important、easy、difficult、hard、good、bad、right 等。",
        good: ["To learn a foreign language is not easy.", "It is too hard for him to work out such a difficult problem.", "It's useless arguing with him."],
        bad: ["It is too hard for him work out such a difficult problem."],
      },
      {
        title: "感官动词与使役动词后的不定式省略 to（被动要还原）",
        desc: "make、let、have 等使役动词和 hear、see、notice 等感官动词后的不定式省略 to；但用于被动语态时，被省略的 to 需要还原。口诀：一感 feel；二听 hear, listen to；三让 let, have, make；四观看 observe, see, watch, look at。",
        good: ["The boss made Tom's father work all day.", "I saw him go into the classroom just now.", "He was made to do the job at once."],
        bad: ["He was made do the job at once.", "I saw him to go into the classroom just now."],
      },
      {
        title: "只接 -ing 作宾语的动词与只接不定式的动词要分清",
        desc: "enjoy、finish、mind、practise、keep、consider、miss、avoid、suggest、give up、put off、cannot help 等只能接动词-ing 形式作宾语；want、hope、wish、agree、decide、manage、refuse、pretend 等只接不定式作宾语。",
        good: ["Good news keeps on coming.", "I am considering selling my house to collect money.", "He wants to buy some stamps."],
        bad: ["I am considering to sell my house to collect money."],
      },
      {
        title: "remember / forget / stop 等接 to do 与 -ing 意思不同",
        desc: "有些动词（短语）既能接动词-ing 形式，又能接不定式作宾语，但意义不一样：remember、forget 等后接不定式时表动作尚未发生，接动词-ing 形式时表动作已经完成；like、love、hate、start、begin、need、go on、try 等前后意义区别较大（前者没有多大区别）。",
        good: ["Oh, I forgot to turn it off.（忘记去做，还没做）", "I remembered closing the door.（记得做过）", "Mr Brown asked us to stop talking, and we stopped to listen to him at once."],
        bad: ["I forgot turning it off 用于“我忘了是关过灯的”这个意思之外会造成歧义。"],
      },
      {
        title: "过去分词作表语与被动语态的区别",
        desc: "过去分词作表语表示主语的特点或所处的状态，被动语态则表示一个被动的动作；过去分词作表语还可用于 get、become、grow、turn 等词后面，而被动语态没有此种用法。",
        good: ["The cup is broken.（过去分词表状态）", "The cup was broken by my brother.（被动语态表动作）", "We became / got excited.", "We were excited by the news."],
        bad: ["We became / got excited by the news."],
      },
      {
        title: "have / get + 宾语 + 过去分词表示“让别人做某事”或“遭遇”",
        desc: "使役动词 keep、leave、get、make 的宾语后面常带过去分词作宾语补足语，表示“使……处于某种状态”，分词和宾语之间是被动关系。",
        good: ["I must have my hair cut tomorrow.", "Mary got the car washed.", "Jane had her purse stolen on the bus yesterday.", "We mustn't leave the work unfinished."],
        bad: ["I must have my hair cut tomorrow 若写成 I must cut my hair 则意为自己剪，含义不同。"],
      },
    ],
    pitfalls: [
      "感官动词、使役动词后省略 to，但在被动语态中必须还原 to：He was made to do the job at once.",
      "不定式的否定式是在 to 前面加 not（not to do），不能说 don't to do。",
      "只能接动词-ing 形式作宾语的动词（enjoy、finish、mind、practise、keep、consider、avoid、cannot help 等）后不能接不定式。",
      "不定式作定语或状语时，若不定式是不及物动词，或所修饰的名词是不定式动作的地点、工具，必须加上相应的介词：a big room to live in、a knife to cut the bread with、The pen is good to write with.",
      "be dressed in 表示“某人穿着（某种颜色）衣服”，dress 作及物动词后接人；Dressed in a white uniform, he looks more like a cook than a doctor.",
      "过去分词作状语时，其逻辑主语必须与主句主语一致，且为被动关系；连词 + 分词是状语从句的省略形式（When completed = When the museum is completed）。",
      "过去分词与现在分词作定语、状语时要分清主动与被动、进行与完成：The dancing girl（主动进行）vs a broken window（被动完成）。",
    ],
    examTips: [
      "感官动词后接 -ing 表示动作正在进行，接不带 to 的不定式表示动作的全过程：I heard Mum talking with Dad at ten last night.（那一刻正在）",
      "forget / remember / stop / go on / try 后用 to do 还是 -ing 是中考高频考点：前者表未做，后者表已做。",
      "It is + 形容词 + of sb to do sth（形容人的品格）与 It is + 形容词 + for sb to do sth（形容事情）要会选：It is necessary for us to protect wildlife.",
      "定语位置要判断：time allowed（= that had been allowed）用过去分词；the meeting to attend 用不定式。",
      "can't help doing（禁不住）与 can't help but do（不得不）要区分。",
    ],
    memoryCard: [
      "非谓语三兄弟：to do（不定式）、doing（-ing 形式）、done（过去分词）。",
      "非谓语不能单独作谓语，但可带自己的宾语和状语。",
      "一感二听三让四观看，后省 to；被动还原 to。",
      "疑问词 + to do 常可改写成宾语从句。",
      "过去分词 = 被动 + 完成；现在分词 = 主动 + 进行。",
    ],
    sections: [
      {
        heading: "一、本章导览：三种非谓语形式",
        blocks: [
          {
            type: "text",
            text: "非谓语动词包括动词不定式、动词-ing 形式和过去分词。非谓语动词没有人称和数的变化，不受主语人称和谓语动词的时态变化干扰，但是有时态和语态的变化。非谓语动词在句中不能单独作谓语，但仍保留动词的特点，即可以有自己的宾语和状语。",
          },
          {
            type: "examples",
            items: [
              { en: "To hear your voice is so nice.", zh: "听到你的声音真高兴。（动词不定式作主语）" },
              { en: "Reading books makes one wise.", zh: "读书使人明智。（动词-ing 形式作主语）" },
              { en: "This is a book written by Balzac.", zh: "这是巴尔扎克写的一本书。（过去分词作定语）" },
            ],
          },
        ],
      },
      {
        heading: "二、动词不定式的类型与句法功能",
        blocks: [
          { type: "text", text: "动词不定式是一种动词的非谓语形式，可在句中充当多种成分，是初中英语学习中必须掌握的重要语法项目。" },
          { type: "text", text: "1 动词不定式的类型：动词不定式有两种表现形式，一种是“to + 动词原形”，另一种是“疑问词 + to + 动词原形”。" },
          { type: "text", text: "2 动词不定式的句法功能：" },
          {
            type: "list",
            items: [
              "A 动词不定式作主语：To learn a foreign language is not easy.（学习外语不是一件容易的事。）",
              "B 动词不定式作表语：Her job is to look after the children.（她的工作就是照顾孩子。）",
              "C 动词不定式作宾语：He wants to buy some stamps.（他想买一些邮票。）",
              "D 动词不定式作宾语补足语：The doctor told me to have a rest.（医生叫我休息一下。）",
              "E 动词不定式作定语：I want something to eat.（我想要一些吃的。）",
              "F 动词不定式作状语：Yesterday they came to visit us.（昨天他们来拜访我们。）",
            ],
          },
        ],
      },
      {
        heading: "三、动词不定式的时态和语态",
        blocks: [
          {
            type: "table",
            head: ["形式", "结构", "含义", "例句"],
            rows: [
              ["一般式", "to do", "不定式的动作发生在谓语的动作之后，或同时发生", "I want to visit my teacher.（之后）I believe him to be a good student.（同时）"],
              ["完成式", "to have done", "不定式的动作发生在谓语的动作之前", "I am sorry to have kept you waiting for a long time."],
              ["进行式", "to be doing", "不定式的动作与谓语的动作同时进行", "He seems to be worrying about it."],
              ["被动语态", "to be done", "表示被动关系", "The sick man will need to be taken to a hospital."],
            ],
          },
        ],
      },
      {
        heading: "四、动词不定式的重点、难点与注意事项",
        blocks: [
          { type: "text", text: "1 疑问词 + to + 动词原形：(A) 该句型常可与宾语从句互换；(B) 疑问词在不定式中充当成分时，疑问代词作宾语，疑问副词作状语。" },
          {
            type: "examples",
            items: [
              { en: "I don't know what to do. = I don't know what I should do.", zh: "我不知道应该做什么。（what 是疑问代词，作宾语，不能说 I don't know what to do it）" },
              { en: "I don't know how to do it.", zh: "我不知道怎么做。（how 是疑问副词，作状语）" },
            ],
          },
          { type: "text", text: "2 动词不定式作定语：(A) 动词不定式要放在所修饰的名词、代词之后；(B) 动词不定式与所修饰的名词、代词构成逻辑上的动宾关系，因此若不定式前的动词是不及物动词，或者不定式所修饰的名词或代词是不定式动作的地点、工具等，不定式后面就要加上相应的介词。" },
          {
            type: "examples",
            items: [
              { en: "He has an important meeting to attend.", zh: "他有一个重要的会议要参加。（定语）" },
              { en: "They want a big room to live in.", zh: "他们想要一个大房间住。" },
              { en: "Pass me a knife to cut the bread with.", zh: "递给我一把刀切面包。" },
            ],
          },
          { type: "text", text: "3 动词不定式作状语：当动词不定式修饰表语形容词作状语时，它和主语构成动宾关系。同样，如果不定式中的动词是不及物动词时，要加相应的介词。" },
          {
            type: "examples",
            items: [
              { en: "The house is very comfortable to live in.", zh: "这房子住起来非常舒服。" },
              { en: "The pen is good to write with.", zh: "这支钢笔写起来很好用。" },
            ],
          },
          { type: "text", text: "4 使用动词不定式的注意事项：" },
          { type: "text", text: "A 有些动词后的不定式省略 to：(1) 使役动词如 make、let、have；(2) 感官动词如 hear、see、notice；(3) 用于被动语态时，被省略的 to 需要还原。" },
          {
            type: "examples",
            items: [
              { en: "The boss made Tom's father work all day.", zh: "老板让汤姆的爸爸整天工作。" },
              { en: "I saw him go into the classroom just now.", zh: "我看到他刚才进了教室。" },
              { en: "He was made to do the job at once.", zh: "他被迫立刻做这个工作。" },
            ],
          },
          { type: "tip", text: "不定式省略 to 的口诀：一感 feel；二听 hear, listen to；三让 let, have, make；四观看 observe, see, watch, look at。" },
          { type: "text", text: "B 动词不定式的否定需在 to 前加 not。" },
          { type: "examples", items: [{ en: "Mum often tells Tom not to play football in the street.", zh: "妈妈经常叫汤姆不要在街上踢足球。" }] },
          { type: "text", text: "C 作简略回答或为避免不必要的重复时，不定式常可省略 to 后面的动词，只保留 to。动词 make、let、see、hear 等后面的词可全部省略。" },
          {
            type: "examples",
            items: [
              { en: "A: Did you go to see the Great Wall? B: Yes, I went to.", zh: "A：你去长城了吗？ B：是的，我去了。（省略了 see the Great Wall）" },
              { en: "A: Did Mary go there with you? B: No, her mother didn't let her.", zh: "A：玛丽是和你一起去的那里吗？ B：不，她妈妈没有让她去。" },
            ],
          },
          {
            type: "list",
            items: [
              "D 接不定式作宾语的动词有 want、wish、hope、decide 等。",
              "E 接带 to 的不定式作宾补的动词有 ask、tell、get、wish、want、like、teach 等。",
              "F 接不带 to 的不定式作宾补的动词有 let、make、have、see、watch、feel、listen to 等。",
              "G 接不定式作状语的形容词有 happy、sorry、afraid、able、sure 等。",
              "H 带 to 的不定式作主语时，常用形式主语 it 代替，其作表语的形容词有 important、easy、difficult、hard、good、bad、right 等：It is too hard for him to work out such a difficult problem.",
              "I 既可接不定式，又可接动词-ing 形式的动词有 like、love、hate、start、begin、need 和 stop、remember、forget、go on、try 等，前者意义没有多大的区别，后者区别较大。",
              "J 带 to 的不定式和疑问词连用，相当于一个名词作宾语或宾补，这种句式可把不定式转换为复合句，这类动词有 know、decide、tell、ask、find、hear、learn、think 等。",
              "K 带 to 的不定式作定语的动词有 have、there be：I have a few letters to write.（我有一些信要写。）",
              "L 不定式在一些情态动词或助动词及一些表“意愿”的动词之后代替上文提到的动词。这类动词有 have、be able、be going、hope、like、love、try 等：A: Would you like to go with me? B: Yes, I'd like to.",
            ],
          },
          {
            type: "table",
            head: ["只接不定式作宾语的常用特殊谓语动词", "含义"],
            rows: [
              ["want", "想要"],
              ["hope", "希望"],
              ["wish", "想做（某事）"],
              ["agree", "同意"],
              ["decide", "决定"],
              ["manage", "设法做成"],
              ["refuse", "拒绝"],
              ["pretend", "假装"],
            ],
          },
        ],
      },
      {
        heading: "五、动词不定式的几个重要句型",
        blocks: [
          { type: "text", text: "A 疑问词 + 动词不定式：My teacher didn't tell me what to do next.（我的老师没有告诉我下一步要做什么。）" },
          {
            type: "examples",
            items: [
              { en: "They are too shy to speak English.", zh: "他们太害羞了，以至于不能说英语。" },
              { en: "He is old enough to take care of himself.", zh: "他已经不小了，能照顾自己了。" },
              { en: "He is not old enough to take care of himself.", zh: "他还不小了，还不能照顾自己。" },
              { en: "The box is too heavy for him to lift.", zh: "这个箱子太沉了，他搬不动。（too...to 可与 so...that 转换）" },
            ],
          },
          { type: "text", text: "B too...to... / enough to...：too...to... 意为“太……而不能……”，可与 so...that... 转换；enough to... 意为“足够……能……”。The box is too heavy for him to lift. = The box is so heavy that he can't lift it. / He runs fast enough to get there first. = He runs so fast that he can get there first." },
          {
            type: "examples",
            items: [
              { en: "It was clever of him to do it like that.", zh: "他那样做很聪明。（形容人的品格，of sb 可转换为句子主语）" },
              { en: "It was hard for him to say goodbye.", zh: "对他来说，说声再见是很难的。" },
              { en: "It is very kind of you to help me.", zh: "你帮助我真是太好了。" },
            ],
          },
          { type: "tip", text: "C It is / was + 形容词 + of sb to do sth：形容 sb 的品格，of sb 可转换为句子主语；It is / was + 形容词 + for sb to do sth：用于说明事情的性质，for sb 不能转换为句子主语。" },
          {
            type: "list",
            items: [
              "D Why (not) do? 为什么（不）……？A: Let's go out to eat tonight. B: Yes, why not?",
              "E There be...to do 有……要做：There are some clothes to wash.（有一些衣服要洗。）There is a room to clean.（有一间屋子要打扫。）",
              "F be about to do sth 正要做……；将要做……：I was about to go to bed when the policeman knocked at the door.（当警察敲门的时候我刚要睡觉。）",
              "G had better do sth 最好……；had better not do sth 最好不要……：You had better not eat too much.（你最好不要吃太多。）",
              "H so as to... 为了：so as to... 一般不能放在句首，意思相当于 in order to。He got up early so as to meet his parents at the airport.（他很早就起床是为了到机场接他的父母。）",
            ],
          },
        ],
      },
      {
        heading: "六、动词-ing 形式",
        blocks: [
          { type: "text", text: "动词-ing 形式是动词的另一种非限定形式，包括现在分词和动名词两种，由动词原形加 -ing 构成。动词-ing 形式可以作主语、宾语、表语、宾语补足语、定语、状语等。" },
          { type: "text", text: "1 动词-ing 形式作主语：动词-ing 形式作主语，有时也可用 it 作形式主语，而把动词-ing 形式放在后面。" },
          {
            type: "examples",
            items: [
              { en: "Reading poetry brings people from different places and different times together.", zh: "朗诵诗歌可以使人跨越时空聚在一起。" },
              { en: "It's useless arguing with him.", zh: "和他争辩是没有用的。（it 作形式主语）" },
            ],
          },
          { type: "text", text: "2 动词-ing 形式作动词宾语：在 mind、enjoy、finish、practise、consider、keep、miss、appreciate 等词后常接动词-ing 形式作宾语。" },
          {
            type: "examples",
            items: [
              { en: "She looks forward to walking in the flower-lined garden every spring.", zh: "她期待每个春天在这百花争妍的花园里走一走。" },
              { en: "I am considering selling my house to collect money.", zh: "我正考虑卖掉房子筹款。" },
              { en: "Good news keeps on coming.", zh: "好消息接踵而至。" },
              { en: "The girl was told to practise playing the piano for three hours every day.", zh: "这个女孩被告知每天要练习弹3个小时钢琴。" },
            ],
          },
          {
            type: "table",
            head: ["只能用动词-ing 形式作宾语的动词（词组）", "含义"],
            rows: [
              ["enjoy", "喜欢"],
              ["give up", "放弃"],
              ["object to", "反对"],
              ["mind", "介意"],
              ["admit", "承认"],
              ["suggest", "建议"],
              ["put off", "推迟"],
              ["consider", "考虑"],
              ["risk", "冒险"],
              ["imagine", "想象"],
              ["escape", "逃脱"],
              ["permit", "允许"],
              ["practise", "练习"],
              ["keep (on)", "继续"],
              ["miss", "错过"],
              ["deny", "否认"],
              ["delay", "耽误"],
              ["avoid", "避免"],
              ["finish", "完成"],
              ["cannot help", "禁不住"],
            ],
          },
          { type: "text", text: "3 动词-ing 形式放在系动词后作表语" },
          {
            type: "examples",
            items: [
              { en: "His favourite sport is hiking.", zh: "他最喜欢的体育项目是徒步旅行。" },
              { en: "My job is playing all kinds of musical instruments.", zh: "我的工作是演奏各种乐器。" },
            ],
          },
          { type: "text", text: "4 动词-ing 形式在一些动词后作宾语补足语：动词-ing 形式在 listen to、see、hear、watch、notice、feel、find、leave、look at、have 等动词后作宾语补足语，表示动作正在进行。" },
          {
            type: "examples",
            items: [
              { en: "They left the fire burning all day long.", zh: "他们让火烧了一天。" },
              { en: "Do you notice him writing something there?", zh: "你注意到他在那里写什么吗？" },
              { en: "The policeman caught him stealing the bike.", zh: "警察抓住他正在偷自行车。" },
              { en: "I hear him singing in the next room.", zh: "我听见他在隔壁房间里唱歌。" },
            ],
          },
          { type: "text", text: "5 动词-ing 形式作定语：(A) 动名词作定语，用来修饰无生命的名词，且只能前置；这类定语不能改为定语从句。(B) 现在分词作定语，多用来修饰有生命的名词（有时也可用来修饰无生命的名词）。如果动词-ing 形式是单独修饰名词，常前置；如果动词-ing 短语修饰名词，则常后置。不管前置还是后置，它们都可以被改为定语从句。" },
          {
            type: "table",
            head: ["动名词作定语（只能前置）", "含义"],
            rows: [
              ["a teaching building", "教学楼"],
              ["a swimming pool", "游泳池"],
              ["a smiling face", "笑脸"],
              ["a walking stick", "拐杖"],
              ["a sleeping bag", "睡袋"],
              ["a reading room", "阅览室"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "The dancing girl (= The girl who is dancing) is my classmate.", zh: "那个跳舞的女孩是我的同班同学。" },
              { en: "The new hospital being built (= which is being built) is just near our school.", zh: "正在建造的新医院就在我们学校附近。" },
            ],
          },
          { type: "text", text: "6 动词-ing 形式作状语：这类结构常用来表示时间、原因、条件、结果。它相当于一个状语从句，其逻辑主语就是主句的主语；也可置于句尾，表示伴随、补充说明。" },
          {
            type: "examples",
            items: [
              { en: "Hearing the good news (= When they heard the good news), the students were wild with joy.", zh: "听到这个好消息，同学们高兴极了。（时间）" },
              { en: "Having watered the vegetables (= After they had watered the vegetables), they went back home for breakfast.", zh: "他们浇过菜之后，就回家吃早饭了。（时间）" },
              { en: "Being so poor in those days (= As we were so poor in those days), we couldn't afford to send the boy to the hospital.", zh: "由于那时太穷了，我们没有能力送孩子去医院。（原因）" },
              { en: "Having already seen the film twice (= As we had already seen the film twice), we didn't go to the cinema.", zh: "因为这部电影我们已经看过两次了，所以我们没有去电影院。（原因）" },
              { en: "Standing on the top of the tower (= If we stand on the top of the tower), we can see as far as the Yangtze River.", zh: "如果我们站在塔顶上就能看到长江。（条件）" },
              { en: "Her husband died in 1942, leaving five children with her (= and left five children with her).", zh: "1942年她丈夫死了，给她丢下5个孩子。（结果）" },
              { en: "Every evening they sat on the sofa watching TV (= and watched TV).", zh: "他们每天晚上坐在沙发上看电视。（伴随或补充说明）" },
            ],
          },
        ],
      },
      {
        heading: "七、过去分词",
        blocks: [
          { type: "text", text: "过去分词的基本形式是“动词 + ed”，但也有不规则的形式。动词的不规则过去分词需要逐一记忆。过去分词可以作定语、表语、宾语补足语、状语等。" },
          { type: "text", text: "1 过去分词作定语：(A) 单个的过去分词或带副词的单个过去分词作定语时，放在所修饰词的前面，为前置定语，具有形容词的特点。(B) 有时为了强调，过去分词作定语时要置于被修饰的名词之后，作后置定语，此时过去分词既有形容词的特征，又有动词的特征。" },
          {
            type: "table",
            head: ["前置定语", "含义"],
            rows: [
              ["a broken window", "一扇打碎了的窗户"],
              ["a recently-built house", "一栋最近建造的房子"],
              ["a newly-married couple", "一对新婚夫妇"],
            ],
          },
          { type: "examples", items: [{ en: "He is a man loved and respected by all.", zh: "他是一个受到大家爱戴和尊敬的人。（后置定语）" }] },
          { type: "text", text: "2 过去分词作定语与定语从句的关系：及物动词的过去分词可以改为动词为被动形式的定语从句；部分不及物动词的过去分词作定语时，可改为动词为完成式或动词为表示状态的定语从句。" },
          {
            type: "examples",
            items: [
              { en: "a returned scholar (= a scholar who has returned)", zh: "一个归国学者（不及物动词）" },
              { en: "The first textbooks written for teaching English (= which were written for teaching English) as a foreign language came out in the 18th century.", zh: "首批把英语作为外语教学的教科书在18世纪出版。" },
              { en: "The computer centre opened last year (= which was opened last year) is very popular among the students in this school.", zh: "去年开办的计算机中心很受这个学校学生的欢迎。" },
            ],
          },
          { type: "text", text: "3 过去分词作表语：过去分词作表语通常表示主语所处的状态。" },
          {
            type: "examples",
            items: [
              { en: "He was terrified at seeing this scene.", zh: "看到这个场景他很害怕。" },
              { en: "The door remained unlocked.", zh: "门仍然没锁。" },
            ],
          },
          { type: "text", text: "4 过去分词作表语与被动语态的区别：(A) 过去分词作表语表示主语的特点或所处的状态，被动语态则表示一个被动的动作。(B) 过去分词作表语除用于系动词后面外，还可用于 get、become、grow、turn 等词后面，而被动语态没有此种用法。" },
          {
            type: "examples",
            items: [
              { en: "The cup is broken.", zh: "杯子是破的。（过去分词表状态）" },
              { en: "The cup was broken by my brother.", zh: "这个杯子是我弟弟打破的。（被动语态表动作）" },
              { en: "(○) We became / got excited.", zh: "我们变得很兴奋。" },
              { en: "(○) We were excited by the news.", zh: "听到这个消息我们很兴奋。" },
              { en: "(×) We became / got excited by the news.", zh: "被动语态不能用于 become / get 之后。" },
            ],
          },
          { type: "text", text: "5 过去分词作宾语补足语：过去分词作宾语补足语时，宾语与过去分词之间为被动关系，表示被动意义和完成意义。(A) 使役动词 keep、leave、get、make 的宾语后面经常带过去分词作宾语补足语，表示“使……处于某种状态”，分词和宾语之间是被动关系，而“have / get + 宾语 + 过去分词”表示“让别人做某事”或“遭遇到某种情况”。" },
          {
            type: "examples",
            items: [
              { en: "He raised his voice in order to make himself heard by the audience.", zh: "他提高了声音，以便能让观众听到。" },
              { en: "I must have my hair cut tomorrow.", zh: "明天我得理发了。" },
              { en: "Jane had her purse stolen on the bus yesterday.", zh: "昨天在公共汽车上，简的钱包被偷了。" },
              { en: "Mary got the car washed.", zh: "玛丽请人给她洗了车。" },
              { en: "We mustn't leave the work unfinished.", zh: "我们不能让工作半途而废。" },
            ],
          },
          { type: "text", text: "(B) 表示感觉的动词所带的宾语后面都可以接过去分词作宾语补足语。及物动词作宾语补足语通常表示被动和完成，不及物动词一般只表示完成。(C) 动词 want、wish、like、expect 及介词 with 后面可用过去分词作宾语补足语。" },
          {
            type: "examples",
            items: [
              { en: "I saw a girl knocked down by a truck.", zh: "我看见一个女孩被一辆卡车撞倒了。" },
              { en: "I once heard the song sung in German.", zh: "我曾经听过这首歌被用德语唱过。" },
              { en: "When she woke up, she found her mother gone.", zh: "她醒来时发现她妈妈已经走了。" },
              { en: "We wished the problem settled at once!", zh: "我们希望问题马上得到解决！" },
              { en: "He was thinking for a while with his eyes closed.", zh: "他闭着眼睛思考了片刻。" },
            ],
          },
          { type: "text", text: "6 过去分词作状语：(A) 过去分词作状语可以表示时间、原因、条件及伴随情况等。过去分词的逻辑主语必须和主句的主语保持一致，并且必须是被动关系，通常可以转换成相应的状语从句（过去分词表示伴随情况时可以将其转换成并列句）。(B) “连词 + 分词”作状语是状语从句的一种省略形式。当状语从句中过去分词的逻辑主语和主句的主语一致，并且有动词 be 时，常将逻辑主语和动词 be 省略。" },
          {
            type: "examples",
            items: [
              { en: "Asked (= When he was asked) how he broke into the room, he made no answer.", zh: "当有人质问他怎么闯进屋里来的时候，他一声不吭。（时间）" },
              { en: "Deeply moved (= As we were deeply moved) by the film, we all cried.", zh: "由于被电影深深打动了，我们都哭了。（原因）" },
              { en: "Given (= If we had been given) more help, we could have done the work better.", zh: "如果给我们的帮助多一些，我们原本能做得更好的。（条件）" },
              { en: "The teacher sat there, (= and was) surrounded by his students.", zh: "那位老师坐在那儿，他的学生围在周围。（伴随情况）" },
              { en: "When completed (= When the museum is completed), the museum will be open to the public next year.", zh: "博物馆竣工后，将于第二年向公众开放。" },
              { en: "The research is so designed that once begun (= once the research is begun) nothing can be done to change it.", zh: "此项研究被设计成，一旦开展，将无可改变。" },
            ],
          },
        ],
      },
      {
        heading: "八、易错陷阱与实力测验",
        blocks: [
          { type: "text", text: "Common Mistakes（失分陷阱）：" },
          {
            type: "pitfall",
            text: "陷阱例题1 I heard Mum ______ with Dad in the next room at ten last night. A. talk B. talking C. to talk D. is talking → 答案 B。本题考查非谓语动词中动词不定式与动词-ing 形式的用法区别，容易误选：感官动词后可以接不带 to 的动词不定式或动词-ing 作宾语补足语；前者指动作的全过程，后者强调动作正在进行。本题关键为 ten 这一时间点，正确答案为 B。",
          },
          {
            type: "pitfall",
            text: "陷阱例题2 A: The light in the office is still on. B: Oh, I forgot ______. A. turning it off B. turn it off C. to turn it off D. having turned it off → 答案 C。本题考查 forget 后接动词-ing 形式和接动词不定式的区别：有些动词（短语）既能接动词-ing 形式，又能接不定式作宾语，但意义不一样，如 remember、forget 等，当它们后接不定式时表动作尚未发生，接动词-ing 形式时表动作已经完成。",
          },
          {
            type: "pitfall",
            text: "陷阱例题3 ______ in a white uniform, he looks more like a cook than a doctor. A. Dressed B. To dress C. Dressing D. Having dressed → 答案 A。本题考查过去分词短语作状语的用法：固定短语 be dressed in (+ 衣服/颜色) 意为“某人穿着（某种颜色）衣服”，dress 作及物动词后接人；B 项表示目的，不符合语境。",
          },
          {
            type: "pitfall",
            text: "陷阱例题4 We finished the run in less than half the time ______. A. allowing B. to allow C. allowed D. allows → 答案 C。本题考查动词不定式、动词-ing 形式和过去分词作后置定语的区别，容易误选：allow 与 time 之间是动宾关系，故用 allowed 作定语修饰 time，相当于 that had been allowed 的省略。",
          },
          { type: "text", text: "实力测验（第316—319页）题型速览：" },
          {
            type: "list",
            items: [
              "选择填空共 40 题，覆盖不定式作宾语/宾语补足语/定语/主语、动词-ing 形式作宾语与宾补、过去分词作定语与状语、疑问词 + 不定式、It is + 形容词 + for/of sb to do sth、can't help but do、comfortable to sit on 等考点。",
              "典型考点示例：I advise you ______ a diary in English every day.（keeping）；Alice has been working for an hour and now she stops ______ on the sofa.（to rest）；I usually forget ______ the door, but I remembered ______ it when I left yesterday.（to close; closing）；Mr Brown asked us to stop ______, and we stopped ______ to him at once.（talking; to listen）；It's raining hard. I cannot help but ______ at home.（stay）；The chair looks hard, but in fact, it is very comfortable to ______.（sit on）",
            ],
          },
          { type: "tip", text: "练习页（第316—319页）的答案栏在教材原图中为空白，此处只转写题型与考点，未编造答案。" },
        ],
      },
    ],
    notes: [
      "第304—319页均为清晰的教材正文页；第316—319页“实力测验”的答案栏为空白，只转写题型与考点，未编造答案。",
    ],
  },
];
