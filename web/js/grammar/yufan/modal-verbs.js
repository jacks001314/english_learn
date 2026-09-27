// web/js/grammar/yufan/modal-verbs.js
// 来源：yufan/动词/助动词和情态动词（21 张教材扫描图片，压缩镜像 yufan-ds/动词/助动词和情态动词）→ 第10章 助动词和情态动词（第184—203页）
export default [
  {
    topicId: "g-modal-verbs",
    newTopic: false,
    title: "助动词和情态动词",
    sourceDirs: ["yufan/动词/助动词和情态动词"],
    imagesRead: 21,
    summary:
      "助动词 be / have / shall·will / do 本身没有词义，只帮助主要动词构成时态、语态、否定与疑问；情态动词 can、may、must、need、should、ought to、had better、have to 等有词义但不能单独作谓语，后面跟动词原形（ought to 除外），没有人称和数的变化。",
    intro:
      "本章先讲助动词的种类与作用，再按 can(could)、may(might)、must、need、should/ought to/had better、have to 依次讲情态动词的肯定句、否定句、疑问句与回答，最后归纳 can/could/may/might/must 表示推测（含对过去的推测 must have done）以及 Will you / Would you like / Shall I / Shall we 等句型。",
    sections: [
      {
        heading: "一、本章导览：助动词与情态动词的分工与基本句型",
        blocks: [
          {
            type: "text",
            text: "在英语中，助动词一般都没有具体词义，主要包括 be、have、do、will 和 shall；而情态动词有具体的词义，但是它们都不能单独作谓语，必须和其他动词一起构成谓语。本章从情态动词（如 can、may、must 等）的用法讲解入手，再深入到句子，如对 Will you... 和 Shall I... 等句型的解析。",
          },
          {
            type: "examples",
            items: [
              { en: "He is listening to music.", zh: "他正在听音乐。" },
              { en: "I can speak English fluently.", zh: "我会讲一口流利的英语。" },
            ],
          },
          { type: "text", text: "1 助动词和情态动词的定义：在英语中，助动词一般没有词义，主要帮助构成谓语，可用来表示时态、语态、构成疑问及否定形式或加强语气。情态动词与助动词不同，它有词义，但它也和助动词一样不能单独作谓语，必须和其他动词一起构成谓语。另外重要的一点是情态动词没有人称和数的变化，其后必须跟动词原形。" },
          {
            type: "examples",
            items: [
              { en: "His brother doesn't like playing basketball.", zh: "他哥哥不喜欢打篮球。（表示否定）" },
              { en: "I did go to see him, but he wasn't in.", zh: "我确实去看望他了，但他不在家。（加强语气）" },
              { en: "Have you seen the film?", zh: "你看这部电影了吗？（表示时态）" },
              { en: "(○) Maria types well. / (○) Maria can type well. / (×) Maria cans type well. / (×) Maria can types well.", zh: "玛丽亚打字打得很好。（当主语是第三人称单数如 Maria 时，can 不能加 s；也不能在行为动词后加 s，必须用动词原形）" },
            ],
          },
          { type: "text", text: "英语的情态动词主要有 can、could、may、might、must、have to、will、would、shall、should、ought to、had better、need、dare 等，用来表示请求、义务、劝告、推测、建议、征求对方意见或许可等。" },
          {
            type: "table",
            head: ["句型", "结构"],
            rows: [
              ["肯定句", "主语 + can / may / must + 动词原形 + ……"],
              ["否定句", "主语 + can / may / must + not + 动词原形 + ……"],
              ["疑问句", "Can / May / Must + 主语 + 动词原形 + ……?"],
            ],
          },
          { type: "tip", text: "can、may、must 是三个最重要的情态动词，它们的基本句型如上表；情态动词也可以作情态动词用的还有 need、dare 等，一般用于否定句和疑问句中。" },
        ],
      },
      {
        heading: "二、助动词的种类",
        blocks: [
          {
            type: "table",
            head: ["助动词（形式）", "作用", "例句"],
            rows: [
              ["be (am, is, are, was, were, been, being)", "与现在分词结合构成进行时；与过去分词结合构成被动语态", "Carl is playing badminton with Linda.（卡尔正在和琳达打羽毛球。）Many people were killed in the 1976 Tangshan Earthquake.（许多人在1976年的唐山地震中丧生。）"],
              ["have (has, had, having)", "与过去分词结合构成完成时态", "I have read today's newspaper.（我已经读过今天的报纸了。）Ketty has seen the Backstreet Boys in a concert in Beijing.（凯蒂已在北京的一场音乐会上见过后街男孩了。）"],
              ["shall (should), will (would)", "与动词结合构成将来时", "We shall be very happy to see you.（我们见到你会很高兴的。）I will make Charlie a chocolate cake tomorrow.（我明天将为查理制作一块儿巧克力蛋糕。）"],
              ["do (does, did)", "与其他动词结合构成否定句和疑问句", "I don't like having a barbecue in hot weather.（我不喜欢在炎热的天气吃烧烤。）Do you always forget to bring your bus card?（你经常忘记带公交卡吗？）"],
            ],
          },
        ],
      },
      {
        heading: "三、can（could）的用法",
        blocks: [
          { type: "text", text: "1 can 的肯定句：can 表示能力、许可、可能性。表示能力时一般译为“能；会”，通常指体力、知识、技能等方面的能力。" },
          {
            type: "examples",
            items: [
              { en: "Vince can speak English and a little German.", zh: "文斯会说英语和一点儿德语。" },
              { en: "Tommy can play the trumpet and draw pictures.", zh: "汤米会吹小号和画画。" },
              { en: "A robot can do many different things.", zh: "机器人能做许多不同的事情。" },
              { en: "They can do some shopping in Pedestrian Street of Nanjing Road.", zh: "他们可以在南京路步行街购物。" },
              { en: "Butterflies can see more colours than humans can.", zh: "蝴蝶比人类能看到更多的颜色。" },
            ],
          },
          { type: "text", text: "重要：can 只有现在式 can 和过去式 could，在表示其他时态时，可以用 be able to 来代替。" },
          {
            type: "examples",
            items: [
              { en: "I could (= was able to) send e-cards before having the computer lessons.", zh: "在学计算机课之前我就会发送电子贺卡。（过去时）" },
              { en: "He has been able to make a homepage and shop online.", zh: "他已经会在互联网上制作主页和进行网上购物了。（现在完成时）" },
              { en: "Perhaps people will be able to live on the moon in the future.", zh: "将来人们可能会在月球上生活。（将来时）" },
              { en: "I can (= am able to) use the microwave oven and the toaster.", zh: "我会用微波炉和烤箱。" },
            ],
          },
          { type: "tip", text: "比较：can / could 表示能力时，可用 be able to 代替；can 只有现在式和过去式，而 be able to 可以用于各种时态。" },
          { type: "text", text: "2 can 的否定句：can 的否定式是 can + not，一般写成 cannot，缩写为 can't，读作[ka:nt]，译为“不会；不能；不可能”。" },
          {
            type: "examples",
            items: [
              { en: "She can't play basketball.", zh: "她不会打篮球。" },
              { en: "He can't be a bad man.", zh: "他不可能是个坏人。（can 表示怀疑或不肯定时，用于否定句及疑问句中）" },
              { en: "He couldn't be a bad man.", zh: "他不大可能是坏人。（could 有时只表示怀疑、推测程度，不表示时态）" },
            ],
          },
          { type: "text", text: "3 can 的疑问句：句型 Can + 主语 + 动词原形 + ……?（……可以/会/能……吗？）；肯定回答 Yes, ...can.；否定回答 No, ...can't." },
          {
            type: "examples",
            items: [
              { en: "A: Can you play the piano? B: Yes, I can. / No, I can't.", zh: "A：你会弹钢琴吗？ B：是的，我会。/ 不，我不会。" },
              { en: "Can I join the team?", zh: "我可以加入这个团队吗？" },
              { en: "Could they win the game?", zh: "他们可能赢这场比赛吗？（could 在这里表示推测，不表示过去时）" },
            ],
          },
        ],
      },
      {
        heading: "四、may（might）的用法",
        blocks: [
          { type: "text", text: "1 may 的肯定句：may 谈论可能性，表示推测，译为“可能；或许”。may 的过去式为 might，一般用于肯定句。" },
          {
            type: "examples",
            items: [
              { en: "I may go to Vienna one day.", zh: "将来有一天我可能去维也纳。" },
              { en: "He asked if he might leave fifteen minutes earlier.", zh: "他问他是否可以提前15分钟离开。（此句中的 might 是 may 的过去式）" },
              { en: "You might like to buy a railcard to travel around the country.", zh: "说不定你愿意买张火车优惠卡环游该国。（might 在这里表示推测，不表示过去时）" },
            ],
          },
          { type: "tip", text: "might 表示的可能性比 may 要小。" },
          { type: "text", text: "2 may 的否定句：may not 也可以表示“不可以”，但单独使用的情况并不多，大多数情况下用于回答疑问句。" },
          {
            type: "examples",
            items: [
              { en: "A: May I come in? B: No, you may not. = No, you mustn't.", zh: "A：我可以进来吗？ B：不，你不可以进来。" },
            ],
          },
          { type: "text", text: "3 may 的疑问句：句型 May + 主语 + 动词原形 + ……?（……可以……吗？）；肯定回答 Yes, ...may. / Sure. / Certainly.；否定回答 No, ...may not. / No, ...mustn't.（……绝对不可以。）" },
          {
            type: "examples",
            items: [
              { en: "A: May I turn on the light? B: Yes, you may. / Yes, please. / Certainly. / Sure. B: No, you may not. / I don't think you can.", zh: "A：我可以开灯吗？ B：是的，可以。/ 可以，请打开。/ 当然可以。B：不，不行。/ 我想不行。" },
              { en: "A: May / Might I watch TV? B: Yes, sure. B: No, you mustn't.", zh: "A：我可以看电视吗？ B：当然可以。B：不，绝对不行。（口气坚决）" },
              { en: "A: May / Might I ask a question now? B: No, you may not. / No, you'd better not.", zh: "A：我现在可以问个问题吗？ B：不可以。/ 不，你现在最好别问。" },
            ],
          },
          { type: "list", items: ["Yes, of course.（是的，当然可以了。）", "Yes, certainly.（是的，当然可以了。）", "Sure.（当然。）", "No, you must not.（不，不行。）（具有强烈禁止的意味）", "No, you can't.（不，不行。）（口语中多采用此句型）"] },
          { type: "tip", text: "比较：当表示请求许可时，can 不如 may 正式；could 比 can 更加客气，此时 could 不表示过去时；与 can、could 一样，有时为了使语气更加婉转，在疑问句中用 might 代替 may，此时 might 不是过去式。" },
        ],
      },
      {
        heading: "五、must 的用法与 must / have to 的区别",
        blocks: [
          { type: "text", text: "1 must 表示有做某一动作的必要或义务，译为“必须；应该”。" },
          {
            type: "examples",
            items: [
              { en: "You must cut off the electricity before you change the bulb.", zh: "换灯泡前你应该切断电源。" },
              { en: "You must put the meat in the fridge in summer.", zh: "夏天你必须把肉放进冰箱里。" },
              { en: "You must climb mountains with a partner.", zh: "你必须和一位搭档一块儿爬山。" },
            ],
          },
          { type: "tip", text: "You must... 句型的意思与祈使句相同。You must turn left. = Turn left.（你必须向左转。）" },
          { type: "text", text: "2 must 表示有把握的判断或推测，译为“一定；准是”，这种情况一般只用于肯定句中。" },
          {
            type: "examples",
            items: [
              { en: "The hair band must belong to Caroline.", zh: "这根发带一定是卡罗琳的。" },
              { en: "The notebook must be Kathy's. It has her name on it.", zh: "这个笔记本肯定是凯西的，上面有她的名字。（表示推测时，must 的语气比 may 和 might 要肯定得多）" },
            ],
          },
          { type: "text", text: "3 must 的否定句：must 的否定式是 must + not，缩写为 mustn't，读作['mʌsnt]，译为“不可以；一定不……”，表示强烈的语气。" },
          {
            type: "examples",
            items: [
              { en: "You mustn't smoke here. It's too dangerous.", zh: "太危险了，你绝不能在这儿吸烟。" },
              { en: "You mustn't switch it off.", zh: "你们不要把它关掉。" },
              { en: "They mustn't take any book out of the room.", zh: "他们不可以从房间里拿走任何书。" },
            ],
          },
          { type: "tip", text: "You must not... 句型的意思和否定的祈使句的意思一致。You mustn't break anything. = Don't break anything.（千万不要打破东西。）" },
          { type: "text", text: "4 must 的疑问句：句型 Must + 主语 + 动词原形 + ……?（……必须……吗？）；肯定回答 Yes, ...must.；否定回答 No, ...needn't. / ...don't have to.（不，不必了。）" },
          {
            type: "examples",
            items: [
              { en: "A: Must I give the baby a bath now? B: Yes, you must. B: No, you needn't. / No, you don't have to.", zh: "A：我现在必须给这个婴儿洗澡吗？ B：是的，你必须。B：不，不必了。" },
            ],
          },
          { type: "text", text: "5 must 和 have to 的区别：must 侧重于个人意愿和主观上的必要，have to 侧重于客观上的必要。" },
          {
            type: "table",
            head: ["对比项", "must", "have to"],
            rows: [
              ["必要性的来源", "主观上的必要（强调个人意愿）", "客观上的必要（表示客观情况）"],
              ["例句", "I know I must study hard.（我知道我必须努力学习。）", "The last bus has gone. We have to take a taxi.（末班车已经走了，我们只能乘出租车了。）"],
              ["形式与时态", "只有一种形式", "有较多的形式，可用于各种时态；如果 must 用于过去时态或将来时态时，则要用 have to 来代替"],
              ["过去时替换", "He said that they must work hard.（用于间接引语中表示过去的必要或义务）", "My brother was badly ill, so I had to call the doctor at midnight.（一般过去时）I haven't got any money with me, so I'll have to borrow some from my friend.（一般将来时）"],
            ],
          },
        ],
      },
      {
        heading: "六、need、should / ought to / had better、have to 及请求句型",
        blocks: [
          { type: "text", text: "1 need 的用法：need 意为“需要”，既可作情态动词，也可作行为动词。need 作情态动词时主要用在否定句和疑问句中；need 作行为动词时可用于肯定句、否定句和疑问句中。" },
          {
            type: "examples",
            items: [
              { en: "You needn't finish that work today.", zh: "你今天不必把那项工作做完。（need 是情态动词）" },
              { en: "Do you need any help?", zh: "你需要帮助吗？（need 是行为动词）" },
              { en: "You needn't worry about him. He has grown up.", zh: "你不必为他担心，他已经长大了。" },
              { en: "A: Need I stay here any longer? B: Yes, you must. B: No, you needn't.", zh: "A：我还有必要留在这儿吗？ B：是的，你必须。B：不，你不必。" },
              { en: "I guess Anna just needs to talk to somebody sometimes.", zh: "我想安娜有时仅仅是需要和人聊聊天罢了。（行为动词 need 后接不定式）" },
              { en: "We needn't wait too long, need we?", zh: "我们不必等太久，是吧？（反意疑问句中前后一致）" },
            ],
          },
          { type: "text", text: "2 should 的用法：should 是 shall 的过去式，没有缩略形式。它作为情态动词时，可用于所有人称，表示劝告、建议或有责任、义务去做某事，通常译为“必须，应该”。" },
          {
            type: "examples",
            items: [
              { en: "You should put the rubbish in the bin.", zh: "你应该把垃圾扔进垃圾箱里。" },
              { en: "You should wash the dress by hand in cool water.", zh: "你应该用凉水手洗这条裙子。" },
              { en: "We shouldn't keep all the lights in our house on all night.", zh: "我们不应该让房子里所有的灯整晚都亮着。" },
            ],
          },
          { type: "text", text: "3 ought to 的用法：ought to 也可以表示劝告、建议，译为“应该”。一般情况下，ought to 可和 should 通用，但 ought to 语气更强烈些。另外，ought to (do sth) 是唯一一个带不定式 to 的情态动词。" },
          {
            type: "examples",
            items: [
              { en: "My parents are getting older and older. I ought to / should visit them more often.", zh: "我父母年纪越来越大了，我应该更多地去看望他们。" },
              { en: "I enjoy his first play, so I think the new one ought to / should be good.", zh: "我欣赏他的第一个剧本，所以我认为这部新剧应该也不错。" },
              { en: "It's too cold. You ought not to make a snowman outside.", zh: "天气太冷了，你不应该在堆雪人。" },
              { en: "A: Ought I to put on my coat? B: Yes, you ought (to). B: No, you ought not (to).", zh: "A：我要穿外套吗？ B：是的，你要（穿上）。B：不，你不必（穿上）。" },
            ],
          },
          { type: "text", text: "4 had better 的用法：had better 译为“最好”，它后面要跟动词原形。had better 只有一种形式，没有 have / has better 这类形式；它的否定式是在后面加 not。" },
          {
            type: "examples",
            items: [
              { en: "We had better check the condition of the car before starting our journey.", zh: "上路前我们最好先检查一下车况。" },
              { en: "He'd (= He had) better go now, or he'll be late.", zh: "他最好现在就走，要不然该迟到了。" },
              { en: "You'd better eat these bananas before they go bad.", zh: "你最好趁这些香蕉还没坏之前把它们吃掉。" },
              { en: "You'd better not eat so many sweets.", zh: "你最好别吃那么多的糖果。" },
            ],
          },
          { type: "text", text: "5 have to 的用法：当句子是现在时，主语为第一、二人称以及第三人称复数时用 have to...，主语为第三人称单数时用 has to...；当句子是过去时的时候用 had to...；当句子是将来时的时候用 will have to...。要注意 to 后面接动词原形。" },
          {
            type: "table",
            head: ["时态", "肯定", "否定", "疑问与回答"],
            rows: [
              ["现在", "have / has to", "don't / doesn't have to", "Do you / Does he have to...? Yes, I do / he does. No, I don't / he doesn't."],
              ["过去", "had to", "didn't have to", "Did you / he have to...? Yes, I / he did. No, I / he didn't."],
              ["将来", "will have to", "won't have to", "Will you / he have to...? Yes, I / he will. No, I / he won't."],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "We have to stay there for three hours.", zh: "我们不得不在那儿待上3个小时。" },
              { en: "Mary has to wear sports shoes for gym class.", zh: "玛丽体育课必须穿运动鞋。" },
              { en: "I had to get up at 5 a.m. yesterday.", zh: "我昨天早晨不得不5点钟起床。" },
              { en: "Take it easy. You don't have to be so nervous.", zh: "放轻松些，你没有必要这么紧张。" },
              { en: "Emily doesn't have to go to the Children's Palace to practise the guitar every day.", zh: "埃米莉不必每天都去少年宫练习吉他。" },
              { en: "A: Do we have to wear the school uniform? B: Yes, we do. B: No, we don't (have to).", zh: "A：我们必须穿校服吗？ B：是的，我们必须穿。B：不，我们没有必要穿。" },
              { en: "A: Does Jason have to practise English and Japanese every day? B: Yes, he does. B: No, he doesn't (have to).", zh: "A：贾森必须要每天练习英语和日语吗？ B：是的，他必须每天练习。B：不，他没有必要每天练习。" },
            ],
          },
          { type: "tip", text: "don't have to do... 意为“不必做……”。（表示没有必要）" },
          { type: "text", text: "6 “Will you...?” 的用法：Will you (please) + 动词原形 + ……? 表示询问对方的意愿、请求对方做某事，是比较客气的用语；在表示请求时语气更为客气。" },
          {
            type: "examples",
            items: [
              { en: "Will you help me with my homework?", zh: "请你辅导我做作业好吗？" },
              { en: "Will you show me some pens?", zh: "把笔给我看看好吗？（请求对方做某事）" },
              { en: "Will you have some rice dumplings?", zh: "请吃点儿粽子好吗？（客气的说法）" },
              { en: "Will you please take off your hat?", zh: "劳驾，把你的帽子摘掉好吗？" },
              { en: "A: Will you open the window? B: All right.", zh: "A：请打开窗户好吗？ B：好吧。" },
              { en: "A: Will you have a piece of pizza? B: Yes, please.", zh: "A：吃块儿比萨好吗？ B：好的，请来一块儿。" },
              { en: "A: Will you pass me the book? B: No, I won't. / I'm sorry. I can't.", zh: "A：请把那本书递给我好吗？ B：不，不行。/ 对不起，不行。" },
              { en: "A: Will you have some Pepsi cola? B: No, thank you.", zh: "A：喝点儿百事可乐好吗？ B：不用了，谢谢。" },
            ],
          },
          {
            type: "table",
            head: ["肯定回答", "否定回答"],
            rows: [
              ["Yes, I will.（是的，可以。）", "No, I won't.（不，不行。）"],
              ["Sure.（当然了。）", "I'm sorry. I can't.（对不起，不行。）"],
              ["Certainly.（好啊。当然了。）", "No, thank you.（不用了，谢谢。）"],
              ["Yes, please.（好的，请。）（被建议做某事时）", "——"],
            ],
          },
          { type: "tip", text: "表示请求和劝说时，用“Won't you...?”这一句型比“Will you...?”还要客气。如 Won't you come to my house?（难道你不要来我家坐一坐吗？）Won't you forgive Alan?（你不原谅艾伦吗？）在“Will you...?”（表示请求、劝说）的疑问句中，一般使用 some，而不用 any。" },
          { type: "text", text: "7 “Would you (like)...?” 的用法：would 是 will 的过去式，“Would you...?” 句型表示“可以请你……吗？”，语气比“Will you...?” 句型更为婉转。" },
          {
            type: "examples",
            items: [
              { en: "Would you have a cup of oolong tea?", zh: "可以请你喝杯乌龙茶吗？" },
              { en: "Would you tell me the way to the Exhibition Centre?", zh: "劳驾，您能告诉我去展览中心怎么走吗？（回答同“Will you...?” 句型）" },
              { en: "A: Would you like to chat with me at lunch time? B: I'd like to.", zh: "A：午餐时你愿意和我聊聊天吗？ B：我愿意。" },
              { en: "B: Sorry, I'm afraid I can't.", zh: "对不起，我恐怕不能和你聊天。" },
              { en: "A: Would you like some caviar and mustard? B: Yes, please. / No, thanks.", zh: "A：你需要些鱼子酱和芥末吗？ B：是的，请给我一些吧。/ 不用了，谢谢。" },
              { en: "A: Would you like me to interpret for you? B: Yes, that's nice of you. / No, thanks.", zh: "A：要不要我来帮你翻译？ B：需要，你真是太好了。/ 不用了，谢谢。" },
            ],
          },
          { type: "tip", text: "说明：句型“主语 + would like to...” 表示“……想要……”，与“...want to...” 意思一样，但比较客气。I'd like to ask you a question. = I want to ask you a question.（我想问你一个问题。）" },
          { type: "text", text: "8 “Shall I / we...?” 的用法：“Shall I...?” 用来提出自己的建议，并询问对方是否赞成这一建议，译为“我要……吗？”；“Shall we...?” 用来向对方提出建议、邀请，并询问对方是否赞成，译为“我们一起做……好吗？”。" },
          {
            type: "examples",
            items: [
              { en: "A: Shall I drive you to the airport? B: No, thanks.", zh: "A：我要开车送你们去机场吗？ B：不用了，谢谢。" },
              { en: "A: Shall I wind the car window down? B: Yes, please.", zh: "A：我要把车窗摇下来吗？ B：好的。" },
              { en: "A: Shall we take a boat together now? B: That's fine with me.", zh: "A：我们现在一起去坐船好吗？ B：行，没有问题。" },
              { en: "A: Shall we go to see the famous Oriental Pearl TV Tower? B: Good idea.", zh: "A：我们一起去看看著名的东方明珠电视塔好吗？ B：好主意。" },
              { en: "A: Shall we make a model house? B: Sorry, I'm afraid I can't.", zh: "A：我们一起制作一个房子模型好吗？ B：对不起，恐怕不能。" },
            ],
          },
          { type: "list", items: ["“Shall I...?” 的回答：Yes, please.（好的，请……）/ No, thanks.（不，谢谢。）", "“Shall we...?” 的回答：All right.（好吧。）/ Good idea.（好主意。）/ That's fine with me.（行，没有问题。）/ Sorry, I'm afraid I can't.（对不起，恐怕不能。）"] },
          { type: "tip", text: "“Shall we...?” 意思上与“Let's...” 相近。Let's take a boat now.（咱们现在去坐船吧！）" },
        ],
      },
      {
        heading: "七、can / could / may / might / must 表示推测",
        blocks: [
          { type: "text", text: "它们都可表示对发生或存在的事情的推测。这里 could 和 might 不是过去时，推测的语气不如 can、may 强；must 表示推测时语气最强，意为“肯定，断定”。" },
          { type: "text", text: "1 表示对现在及将来状态、动作的推测：(A) 当表示对现在及将来状态的推测时，一般用 can / could / may / might / must + 动词原形。(B) 当对现在及将来正在发生的动作进行推测时，一般用 can / could / may / might / must + be + doing（动词的进行式）。(C) 它们的推测程度为：may / might 表示“有可能；大概”，might 的语气比 may 要弱，相当于 perhaps；can / could 表示“或许”，其可能性比 may / might 要小，相当于 possibly；must 的可能性最强，语气较肯定。" },
          {
            type: "table",
            head: ["情态动词", "含义", "推测强度"],
            rows: [
              ["must", "一定；准是", "最强，语气较肯定（一般只用于肯定句）"],
              ["may / might", "有可能；大概（might 相当于 perhaps）", "较强；might 比 may 弱"],
              ["can / could", "或许（could 相当于 possibly）", "比 may / might 小；can 表示怀疑或不肯定时用于否定句及疑问句"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "Monica can't be in the classroom.", zh: "莫妮卡不可能在教室。" },
              { en: "You may come here whenever you like.", zh: "你想什么时候来就什么时候来。" },
              { en: "A: Where's Cindy? B: It's a fine day. She may / might be enjoying the sunshine on the lawn.", zh: "A：辛迪在哪儿呢？ B：今天天气好，她很可能在草坪上晒太阳呢。" },
              { en: "Your sister can't be touring Nanjing. I saw her just now.", zh: "你姐姐根本不可能在南京旅游，我刚刚还看见她呢。" },
              { en: "Our football team plays better than before. It could win.", zh: "我们的足球队踢得比以前好些，它可能会赢。（把握不大）" },
              { en: "The news could be true.", zh: "这消息也许是真的。" },
              { en: "The earrings might be a present for her mother.", zh: "这对耳环可能是给她妈妈的礼物。" },
              { en: "I don't know if I'll get a gift. I might get it.", zh: "我不知道我能否得到一份礼物。可能会吧。" },
              { en: "She isn't answering the phone. She must be out.", zh: "她没接电话。她肯定是出去了。" },
              { en: "Each Olympic medal must be at least 3 millimetres thick and 60 millimetres in diameter.", zh: "每块奥运奖牌必须至少3毫米厚，直径至少60毫米。" },
            ],
          },
          { type: "tip", text: "表示现在或将来的可能性，可用 may / might + 动词原形，might 的可能性比 may 要小些。can 在肯定句中表示比较一般的可能性，不表示实际上正在发生的具体可能性，这种可能性要用 may 来表示。" },
          { type: "text", text: "2 表示对过去的状态、动作的推测：(A) 当表示对过去的状态、动作的推测时，must / may / might 可用在肯定句中表示肯定的推测，一般用 must / may / might + have done（现在完成时）表示；(B) can / could 用在否定句中表示否定的推测，一般用 can / could + not + have done（现在完成时）表示对过去的状态、动作的推测。此外，can / could 还可在疑问句中表示推测。" },
          {
            type: "examples",
            items: [
              { en: "The boy may have got lost. It isn't easy to find this place.", zh: "这个男孩子可能迷路了，这个地方不好找。" },
              { en: "She may have missed the bus.", zh: "她也许错过公共汽车了。" },
              { en: "My watch says it's only ten past two. It must have stopped.", zh: "我的表现在才2点10分，它肯定停了。" },
              { en: "The road is wet. It must have rained last night.", zh: "路是湿的，昨天晚上肯定下雨了。" },
              { en: "Jack has got the highest mark in this exam. He must have studied hard.", zh: "杰克这次考试得分最高，他肯定用功学习了。" },
              { en: "He can't have forgotten. We talked about it this morning.", zh: "他不可能忘了，我们今天早上还说起这事了。" },
              { en: "There isn't any water on the road. It can't / couldn't have rained last night.", zh: "路上一滴水都没有，昨天夜里不可能下雨了。" },
            ],
          },
          { type: "tip", text: "表示推测过去的可能性时，可以用 may / might + have + 过去分词；但 might 的可能性比 may 小些，且 might 可用 could 代替。" },
        ],
      },
      {
        heading: "八、易错陷阱与实力测验",
        blocks: [
          { type: "text", text: "Common Mistakes（失分陷阱，例题均取自各地中考）：" },
          {
            type: "pitfall",
            text: "陷阱例题1（江西中考）A: Can I help you? B: I bought this watch here yesterday, but it ______ work. A. won't B. didn't C. doesn't D. wouldn't → 答案 C。本题考查助动词的时态运用：助动词一般没有词义，主要帮助构成谓语，表示时态、语态或构成疑问及否定形式；根据上下文可知要用一般现在时来表达现在的状态。",
          },
          {
            type: "pitfall",
            text: "陷阱例题2（临沂中考）A: Must I answer this question in English? B: No, you ______. A. mustn't B. needn't C. can't D. shouldn't → 答案 B。本题考查以 must 提问的一般疑问句的否定回答，容易误选 A：以 must 提问的一般疑问句的否定回答常用 needn't 或者 don't have to，而不用 mustn't。",
          },
          {
            type: "pitfall",
            text: "陷阱例题3（成都中考）A: What would you send to your sister as the Christmas gift? B: I haven't decided yet. I ______ send her a hand bag. A. shall B. may C. must → 答案 B。本题考查情态动词 may 的基本用法，容易误选 A：由上下文可知，此处 may 表示推测或客观可能性。",
          },
          {
            type: "pitfall",
            text: "陷阱例题4 Alice, please be quiet! The others ______ hear clearly. A. can't B. mustn't C. shouldn't → 答案 A。本题考查 can 的一般用法：can't 表示“不能”，mustn't 表示“不允许”，shouldn't 表示“不应该”，根据题意可知选 A。",
          },
          { type: "text", text: "实力测验（第201—203页）题型速览：" },
          {
            type: "list",
            items: [
              "1 用适当的动词和情态动词填空（Must I wait...? / No, you ___; You ___ not make so much noise...; Can you ride a bike? / No, I ___; Need I go home now? / No. You ___ stay here. 等，共 10 题）。",
              "2 改写句子，保持句意不变（You must wash the dishes. = You ___ ___ wash the dishes.；They couldn't find any secrets. = They ___ not ___ to find any secrets. 等，共 5 题）。",
              "3 选择填空（needn't / mustn't / can't / may not；must be waiting / should be waiting；had better / should；had better not 等，共 15 题）。",
              "4 英译汉（She must be the headmaster. / I need some help. / Their plane may arrive soon. / Difficulties can and must be overcome. / He didn't like the job because he had to wear a uniform. / They ought to join the army. / Shall I open the window? / Will you have another cup of tea? 共 8 题）。",
              "5 改错（每句只有一处错误）：Will you please to pass me the dictionary? / We'd better to stay at home. / I haven't to go there. / You don't need write such a note.",
            ],
          },
          { type: "tip", text: "练习页（第201—203页）的答案栏在教材原图中为空白，此处只转写题型与考点，未编造答案。" },
        ],
      },
    ],
    extras: {
      forms: [
        { name: "can / could 与 be able to", pattern: "can / could + 动词原形；be able to 可用于各种时态", note: "can 只有现在式 can 和过去式 could，其他时态用 be able to：He has been able to make a homepage and shop online. / Perhaps people will be able to live on the moon in the future." },
        { name: "must 的疑问句与回答", pattern: "Must + 主语 + 动词原形...? Yes, ...must. / No, ...needn't. / ...don't have to.", note: "以 must 提问时，否定回答用 needn't 或 don't have to，不用 mustn't。" },
        { name: "must / may / might + have done", pattern: "must / may / might + have + 过去分词", note: "表示对过去的状态、动作的肯定推测：It must have rained last night. / She may have missed the bus." },
        { name: "can / could + not + have done", pattern: "can't / couldn't + have + 过去分词", note: "表示对过去的否定推测：He can't have forgotten. / It can't have rained last night." },
        { name: "can / could / may / might / must + be + doing", pattern: "对现在及将来正在发生的动作进行推测", note: "She may / might be enjoying the sunshine on the lawn." },
        { name: "should / ought to", pattern: "should + 动词原形；ought to + 动词原形", note: "ought to 语气比 should 更强烈，是唯一带不定式 to 的情态动词。" },
        { name: "had better", pattern: "had better + 动词原形；否定：had better not + 动词原形", note: "只有一种形式，没有 have / has better 这类形式。" },
        { name: "have to 的时态变化", pattern: "have / has to → had to → will have to；否定 don't / doesn't / didn't / won't have to", note: "主语为第三人称单数用 has to；疑问句用 Do / Does / Did / Will + 主语 + have to...?" },
        { name: "Will you / Would you (like) / Shall I / Shall we", pattern: "Will you (please) + 动词原形...? / Would you (like) + 动词原形...? / Shall I / we + 动词原形...?", note: "Would you 比 Will you 更婉转；“Would you like...” 表示“你想/愿意……吗？”；Shall I 提出建议，Shall we 提出建议或邀请。" },
      ],
      points: [
        {
          title: "must 与 have to 的区别：主观必要 vs 客观必要",
          desc: "must 侧重于个人意愿和主观上的必要；have to 侧重于客观上的必要。must 只有一种形式，have to 有较多形式、可用于各种时态，must 用于过去时或将来时要用 have to 代替；must 也可用于间接引语中表示过去的必要或义务。",
          good: ["I know I must study hard.", "The last bus has gone. We have to take a taxi.", "My brother was badly ill, so I had to call the doctor at midnight.", "He said that they must work hard."],
          bad: ["My brother was badly ill, so I must call the doctor at midnight at that time."],
        },
        {
          title: "can / could / may / might / must 表示推测的程度不同",
          desc: "may / might 表示“有可能；大概”，might 比 may 弱，相当于 perhaps；can / could 表示“或许”，可能性比 may / might 小，相当于 possibly；must 可能性最强，语气较肯定，一般只用于肯定句。",
          good: ["She must be out.", "The news could be true.", "The earrings might be a present for her mother.", "Monica can't be in the classroom."],
          bad: ["She mustn't be out.（表示“肯定不在”，应用 can't be out）"],
        },
        {
          title: "need 的情态动词与行为动词用法",
          desc: "need 意为“需要”，作情态动词时主要用于否定句和疑问句（needn't / Need I...?），作行为动词时可用于肯定句、否定句和疑问句（needs to do / Do you need...?），还可用在反意疑问句中，前后保持一致。",
          good: ["You needn't finish that work today.", "Do you need any help?", "I guess Anna just needs to talk to somebody sometimes.", "We needn't wait too long, need we?"],
          bad: ["You don't need finish that work today.= You don't need to finish that work today."],
        },
        {
          title: "请求与征求对方意见的句型",
          desc: "Will you...? 请（为我）做某事好吗；Would you...? 可以请你……吗（更婉转）；Would you like...? 你想要……吗（用于请人吃东西、征询意见或询问意向）；Shall I...? 我要……吗（提出建议）；Shall we...? 我们一起做……好吗（提出建议、邀请）。",
          good: ["Will you please take off your hat?", "Would you tell me the way to the Exhibition Centre?", "Would you like to chat with me at lunch time?", "Shall I wind the car window down?", "Shall we take a boat together now?"],
          bad: ["Will you please to take off your hat?"],
        },
      ],
      contrasts: [
        {
          title: "must vs have to",
          head: ["对比项", "must", "have to"],
          rows: [
            ["必要性来源", "主观上的必要（个人意愿）", "客观上的必要（客观情况）"],
            ["形式", "只有一种形式", "有较多形式，可用于各种时态"],
            ["过去/将来", "用于间接引语中表示过去的必要或义务", "一般过去时用 had to；一般将来时用 will have to"],
            ["否定含义", "mustn't 不可以、禁止", "don't have to 不必（没有必要）"],
          ],
        },
        {
          title: "can / could vs be able to",
          head: ["对比项", "can / could", "be able to"],
          rows: [
            ["时态", "只有现在式 can 和过去式 could", "可用于各种时态"],
            ["表示能力", "I can use the microwave oven and the toaster.", "I could send e-cards before having the computer lessons.（过去时）"],
            ["现在完成时", "×", "He has been able to make a homepage and shop online."],
            ["将来时", "×", "Perhaps people will be able to live on the moon in the future."],
          ],
        },
        {
          title: "对现在/将来的推测 vs 对过去的推测",
          head: ["时间", "结构", "例句"],
          rows: [
            ["现在/将来（状态、动作）", "can / could / may / might / must + 动词原形", "She must be out. / The news could be true."],
            ["现在/将来（正在发生）", "can / could / may / might / must + be + doing", "She may / might be enjoying the sunshine on the lawn."],
            ["过去（肯定推测）", "must / may / might + have + 过去分词", "It must have rained last night. / She may have missed the bus."],
            ["过去（否定推测）", "can / could + not + have + 过去分词", "He can't have forgotten. / It can't have rained last night."],
          ],
        },
      ],
      pitfalls: [
        "以 must 提问的一般疑问句，否定回答用 needn't 或 don't have to，不能用 mustn't（mustn't 表示禁止）。",
        "can't 表示“不能/不可能”，mustn't 表示“不允许（禁止）”，shouldn't 表示“不应该”，三者不能混用。",
        "must 表推测一般只用于肯定句；表示“肯定不/不可能”要用 can't。",
        "had better 后跟动词原形（had better do），不能说 had better to do；no better 形式变化（没有 have better / has better）。",
        "ought to 是唯一带 to 的情态动词，其否定式是 ought not to do。",
        "will / would 后接动词原形：Will you please to pass me the dictionary? 是错的（应用 pass）。",
        "used to 与 be used to 不同；don't have to 表示“不必”，mustn't 表示“禁止”。",
      ],
      examTips: [
        "看到 Must I...? / Must I...? 的否定回答，优先选 needn't 或 don't have to。",
        "看到表示请求许可的语境，can / may / could 均可，但 can 不如 may 正式，could 更客气（不表示过去）。",
        "看到“还不确定、可能”的语境选 may；看到“肯定、准是”选 must；看到“绝不可能”选 can't。",
        "看到 yesterday / last night 等过去时间且表示推测，用 must have done / may have done / can't have done。",
        "看到 it ______ work 这类助动词时态填空，先看时间状语再定时态（如 but it doesn't work 表现在的状态）。",
      ],
      memoryCard: [
        "助动词无词义：be 进行/被动，have 完成，will/shall 将来，do 否定疑问。",
        "情态动词后跟原形，没有人称和数的变化（ought to 除外）。",
        "must 提问，needn't 回答。",
        "must 主观，have to 客观；mustn't 禁止，needn't 不必。",
        "may / might 可能，could 也许，must 一定；对过去用 have done。",
      ],
    },
    notes: [
      "第186页（can/may/must/need 基本句型页）拍摄时整体旋转 90°，文字清晰可辨，已按可识别内容完整转写。",
      "第201—203页“实力测验”的答案栏在教材原图中为空白，只转写题型与考点，未编造答案。",
    ],
  },
];
