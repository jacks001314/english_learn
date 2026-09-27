// web/js/grammar/yufan/present-continuous.js
// 来源：yufan/动词/动词时态/进行时（15 张教材扫描图片）→ 第13章 动词的进行时
export default [
  {
    topicId: "g-present-continuous",
    newTopic: false,
    title: "现在进行时",
    sourceDirs: ["yufan/动词/动词时态/进行时"],
    imagesRead: 15,
    summary:
      "第13章把进行时分成现在进行时和过去进行时：构成都是“主语 + be 动词 + 现在分词”，区别只在 be 的形式（am/is/are 或 was/were）；此外还讲了进行时的四种基本用法和“不用于进行时的动词”。",
    intro:
      "本章先讲进行时的肯定句、否定句、一般疑问句和特殊疑问句（现在进行时与过去进行时对照），再讲现在进行时、过去进行时的基本用法，并给出常用动词的现在分词表和不用于进行时的动词表。",
    sections: [
      {
        heading: "一、进行时的构成与本章结构",
        blocks: [
          {
            type: "text",
            text: "动词的进行时表示动作在“某时”正在进行。“某时”如果是指现在，则用现在进行时；“某时”如果是指过去，则用过去进行时。进行时的构成是：主语 + be 动词 + 现在分词。",
          },
          {
            type: "text",
            text: "本章从进行时的肯定句、否定句和疑问句来详细讲解进行时在不同句式中的构成，进行时的各种基本用法也是本章的讲解重点。",
          },
          {
            type: "examples",
            items: [
              { en: "He plays tennis every day.", zh: "他每天都打网球。（一般现在时：表示习惯性动作）" },
              { en: "He is playing tennis now.", zh: "他现在正在打网球。（现在进行时：表示他现在正在打网球）" },
              { en: "He was playing tennis at ten yesterday morning.", zh: "昨天上午10点，他正在打网球。（过去进行时：表示他昨天上午10点在打网球）" },
            ],
          },
        ],
      },
      {
        heading: "二、进行时的肯定句",
        blocks: [
          {
            type: "text",
            text: "1 现在进行时的肯定句：主语 + be(am/is/are) + 现在分词 + ……",
          },
          {
            type: "table",
            head: ["主语", "be 动词", "现在分词"],
            rows: [
              ["I（第一人称单数）", "am", "V.（动词）+ ing"],
              ["he, she, it（第三人称单数）", "is", "V.（动词）+ ing"],
              ["you（第二人称单、复数）", "are", "V.（动词）+ ing"],
              ["we, they（第一、三人称复数）", "are", "V.（动词）+ ing"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "I am watching TV now.", zh: "我现在正在看电视。" },
              { en: "I am speaking with him on the phone.", zh: "我正在和他通电话。" },
              { en: "They are travelling in Europe now.", zh: "他们现在正在欧洲旅行。" },
              { en: "Look! He is riding a roller coaster.", zh: "看！他正在乘坐过山车。" },
            ],
          },
          {
            type: "text",
            text: "2 过去进行时的肯定句：主语 + be(was/were) + 现在分词 + ……",
          },
          {
            type: "table",
            head: ["主语", "be 动词", "现在分词"],
            rows: [
              ["I（第一人称单数）", "was", "V.（动词）+ ing"],
              ["he, she, it（第三人称单数）", "was", "V.（动词）+ ing"],
              ["you（第二人称单、复数）", "were", "V.（动词）+ ing"],
              ["we, they（第一、三人称复数）", "were", "V.（动词）+ ing"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "He was strolling around the park at this time yesterday.", zh: "昨天这个时候，他正在公园散步。" },
              { en: "I was watching TV then.", zh: "那时我正在看电视。" },
              { en: "She was playing the piano when the bell rang.", zh: "当铃声响时，她正在弹钢琴。" },
              { en: "When I came home, they were cooking in the kitchen.", zh: "当我回家时，他们正在厨房做饭。" },
            ],
          },
        ],
      },
      {
        heading: "三、进行时的否定句",
        blocks: [
          {
            type: "text",
            text: "现在进行时的否定句：主语 + be(am/is/are) + not + 现在分词 + ……；过去进行时的否定句：主语 + be(was/were) + not + 现在分词 + ……",
          },
          {
            type: "table",
            head: ["主语", "be 动词", "否定词 not", "现在分词"],
            rows: [
              ["I（第一人称单数）", "am", "not", "V.（动词）+ ing"],
              ["he, she, it（第三人称单数）", "is", "not", "V.（动词）+ ing"],
              ["you（第二人称单、复数）", "are", "not", "V.（动词）+ ing"],
              ["we, they（第一、三人称复数）", "are", "not", "V.（动词）+ ing"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "I am not studying.", zh: "我不是在学习。" },
              { en: "She isn't playing the guitar.", zh: "她没在弹吉他。" },
              { en: "Joe isn't running in the park.", zh: "乔没在公园跑步。" },
              { en: "We aren't enjoying our trip.", zh: "我们的旅行不愉快。" },
              { en: "They are not playing football.", zh: "他们没在踢足球。" },
              { en: "He wasn't taking a bath then.", zh: "那时他没在洗澡。" },
              { en: "I wasn't watching TV at nine o'clock last night.", zh: "昨天晚上9点钟，我没在看电视。" },
              { en: "He wasn't reading when I came home.", zh: "我回家时他没在看书。" },
              { en: "When he knocked at the door, we weren't doing our homework.", zh: "当他敲门时，我们没在写作业。" },
              { en: "They weren't having supper then.", zh: "那时他们没在吃晚饭。" },
            ],
          },
          {
            type: "tip",
            text: "“be 动词 + not”的常用缩略式：isn't = is not，wasn't = was not，aren't = are not，weren't = were not。",
          },
        ],
      },
      {
        heading: "四、进行时的疑问句",
        blocks: [
          {
            type: "text",
            text: "1 现在进行时的一般疑问句：Be(Is/Are) + 主语 + 现在分词 + ……?；过去进行时的一般疑问句：Be(Was/Were) + 主语 + 现在分词 + ……?",
          },
          {
            type: "examples",
            items: [
              { en: "Are they playing tennis now?", zh: "现在他们正在打网球吗？" },
              { en: "A: Is she still studying abroad? B: Yes, she is. / No, she isn't.", zh: "她还在国外读书吗？—— 是的。（不，她不在国外读书了。）" },
              { en: "A: Look! Is a bird flying in the sky? B: Yes, it is. / No, it isn't.", zh: "看，天空中有只鸟在飞吗？—— 是的。（不，没有鸟在飞。）" },
              { en: "Were you cooking at that time?", zh: "那时你在做饭吗？" },
              { en: "A: Was he singing then? B: Yes, he was. / No, he wasn't.", zh: "那时他正在唱歌吗？—— 是的。（不，他那时没在唱歌。）" },
              { en: "A: Were you listening to music last night? B: Yes, I was. / No, I wasn't.", zh: "昨天晚上你在听音乐吗？—— 是的。（不，我没有在听音乐。）" },
            ],
          },
          {
            type: "text",
            text: "2 现在进行时的特殊疑问句：疑问词 + be(is/are) + 主语 + 现在分词 + ……?；过去进行时的特殊疑问句：疑问词 + be(was/were) + 主语 + 现在分词 + ……?",
          },
          {
            type: "examples",
            items: [
              { en: "What are you reading now?", zh: "你现在读什么书呢？" },
              { en: "A: What are you doing now? B: I'm observing the structure of the plane.", zh: "你现在正在做什么？—— 我在观察飞机的构造。" },
              { en: "A: What course are you taking at weekends? B: I'm taking a fencing course.", zh: "周末你在学什么课程？—— 我在学击剑。" },
              { en: "What was he doing when I called you?", zh: "我给你打电话时他在做什么？" },
              { en: "A: What was he doing at the time of the fire yesterday? B: He was studying at the library then.", zh: "昨天起火时，他在做什么呢？—— 那时他正在图书馆学习。" },
              { en: "A: When were you dancing yesterday? B: I was / We were dancing at ten last night.", zh: "你（们）昨天什么时候在跳舞？—— 昨天晚上10点钟我（们）在跳舞。" },
            ],
          },
          {
            type: "tip",
            text: "对主语提问的特殊疑问句用“Who + 谓语 + ……?”的语序：Nancy is singing. → Who is singing?（回答：Nancy is.）",
          },
        ],
      },
      {
        heading: "五、现在进行时的基本用法",
        blocks: [
          {
            type: "text",
            text: "1 表示说话时正在进行的动作：现在进行时表示说话时正在进行的动作，常和 now 连用；有时也会用一个动词如 look（看）、listen（听）等来表示 now（现在）这一时间概念。",
          },
          {
            type: "examples",
            items: [
              { en: "Look! A train is coming.", zh: "看！火车来了。" },
              { en: "Listen! He is playing the piano.", zh: "听！他在弹钢琴。" },
            ],
          },
          {
            type: "text",
            text: "2 表示现阶段正在进行的动作：现在进行时表示的动作不一定是说话时正在进行的，也可以是现阶段正在进行的。此时常和 at present（目前）、this week（本周）、these days（这几天）等时间状语连用。",
          },
          {
            type: "examples",
            items: [
              { en: "Which lesson are you studying this week?", zh: "你们这周学哪一课了？（说话时并不在学）" },
              { en: "He is attending an international conference in Beijing these days.", zh: "这几天他正在北京出席一个国际会议。（说话时不一定在开会）" },
            ],
          },
          {
            type: "text",
            text: "3 表示最近按计划或安排要进行的动作：现在进行时有时可表示一个在最近按计划或安排要进行的动作，也就是说可以用来代替将来时；但此时一般要与表示将来的时间状语连用，而且仅限于下列少数动词：go 去、come 来、leave 离开、start 开始、arrive 到达、return 返回、sleep 睡觉。",
          },
          {
            type: "examples",
            items: [
              { en: "Are you going to Tianjin tomorrow?", zh: "你明天要去天津吗？" },
              { en: "How many of you are coming to the party next week?", zh: "下周你们有多少人要来参加聚会？" },
            ],
          },
          {
            type: "tip",
            text: "如果没有表示将来时间的状语，此类句子就可能指现在或现阶段的动作：Where are you going?（你现在去哪儿？）；有 next week（下周）等表示将来的时间状语时，用现在进行时表示将来：Where are you going next week?（下周你计划去哪儿？）",
          },
          {
            type: "text",
            text: "4 be going to + 动词原形：这一句型表示即将发生的事或打算（准备）做的事，本章把它归在了将来时里。",
          },
          {
            type: "examples",
            items: [
              { en: "She isn't going to speak at the class meeting.", zh: "她不打算在班会上发言。" },
              { en: "We are going to sing this song together.", zh: "我们打算一起唱这首歌。" },
            ],
          },
          {
            type: "pitfall",
            text: "区分进行时与将来时：I'm going to the park.（现在进行时，to 之后须加名词）／ I'm going to go to the park.（将来时，to 之后须加动词原形）。",
          },
          {
            type: "text",
            text: "5 现在进行时和一般现在时的区别：一般现在时表示经常性的动作，而现在进行时表示暂时性的动作。",
          },
          {
            type: "examples",
            items: [
              { en: "He walks to work.", zh: "他步行上班。（表示习惯、经常性的动作）" },
              { en: "He's walking to work because his bike is being repaired.", zh: "他现在走着去上班，因为他的自行车正在修理。（只是暂时的情况）" },
              { en: "Where does he live?", zh: "他住在哪儿？（询问一般的情况）" },
              { en: "Where is he living / staying?", zh: "他（现在暂时）住在哪儿？（询问暂时一段时间的情况）" },
            ],
          },
          {
            type: "text",
            text: "6 现在进行时代替一般现在时的情况：现在进行时有时可用来代替一般现在时，表达说话人的某种感情，使句子有强烈的感情色彩，常与 always（总是）、forever（永远）等词连用。",
          },
          {
            type: "examples",
            items: [
              { en: "You are always forgetting the important thing.", zh: "你总是把重要的事情忘掉。（表达出不满的情绪）" },
              { en: "Mary is doing pretty well at school.", zh: "玛丽在学校表现很不错。（比 Mary does pretty well at school 更富有赞许的意思）" },
            ],
          },
        ],
      },
      {
        heading: "六、过去进行时的基本用法",
        blocks: [
          {
            type: "text",
            text: "1 表示过去某个时刻或某一阶段正在进行的动作。常和表示过去时间的状语连用：then 那时/当时、at this / that time 在这时/那时、last night 昨晚、yesterday 昨天等。",
          },
          {
            type: "examples",
            items: [
              { en: "What were you doing at nine last night?", zh: "昨晚9点的时候，你在做什么？" },
              { en: "I was playing volleyball with my friends yesterday afternoon.", zh: "我昨天下午在和朋友们打排球。" },
            ],
          },
          {
            type: "text",
            text: "有些情况下，句子中没有明确表示时间的状语，但从句子的上下文中可以得知这是在过去某一时间内正在进行的动作。",
          },
          {
            type: "examples",
            items: [
              { en: "We didn't go shopping as it was raining heavily.", zh: "我们没去购物，因为雨下得很大。" },
              { en: "It was a very cold night and a terrible wind was blowing.", zh: "那是个寒冷的夜晚，而且还刮着猛烈的大风。" },
            ],
          },
          {
            type: "text",
            text: "2 与表示过去的时间状语从句连用：当两个持续性动作在过去某个时间同时发生时，且存在并列或对比关系，则这两个持续性动作都可用过去进行时表达。",
          },
          {
            type: "examples",
            items: [
              { en: "When I was cleaning the windows, my brother was sweeping the floor.", zh: "当我在擦窗户的时候，我弟弟在扫地。" },
              { en: "Some students were playing football, while others were running round the track.", zh: "一些学生在踢足球，同时别的学生正在沿着跑道跑步。" },
            ],
          },
          {
            type: "text",
            text: "当持续性和短暂性的两个动作在过去某个时间同时发生时，用过去进行时表示持续性动作；过去进行时可用于主句中，也可用于从句中。",
          },
          {
            type: "examples",
            items: [
              { en: "It was raining hard when I left my office.", zh: "当我离开办公室时，雨下得正大。" },
              { en: "When you called, I was having my lunch.", zh: "你打电话时，我正在吃午饭。" },
              { en: "We were walking along the river when (suddenly) it rained.", zh: "我们正沿着河边散步，突然下起雨来。" },
              { en: "They were watching TV when the lights went out.", zh: "他们正在看电视，突然停电了。" },
            ],
          },
          {
            type: "tip",
            text: "此时句中的 when 是连词，与上面几例不同，只能用于句子中间。",
          },
          {
            type: "text",
            text: "3 表示过去将要发生的动作：现在进行时可以表示将来的动作，同样，过去进行时也可以表示从过去某时间看来将要发生的动作，常用在间接引语中。",
          },
          {
            type: "examples",
            items: [
              { en: "She went to see David. He was leaving early the next morning.", zh: "她去看了戴维。他第二天一早就要离开此地了。" },
              { en: "She asked him whether he was coming back for lunch.", zh: "她问他是否准备回来吃午饭。" },
            ],
          },
          {
            type: "text",
            text: "4 过去进行时和一般过去时的区别：一般过去时只表示一个完成的动作，而过去进行时表示过去某时正在进行的动作，也就是说，用一般过去时只是表示有过这件事，用过去进行时则强调了动作的连续性。",
          },
          {
            type: "examples",
            items: [
              { en: "The children watched TV yesterday evening.", zh: "昨天晚上孩子们看电视了。（只说明了昨晚孩子们看过电视，但至于看电视看了多长时间并不知道）" },
              { en: "The children were watching TV yesterday evening.", zh: "昨晚孩子们整晚都在看电视。（不仅是陈述昨晚孩子们看电视这一事实，更强调他们看电视的时间贯穿昨晚整个时间段）" },
              { en: "Li Ming washed the dishes last Sunday.", zh: "上周日李明洗过盘子了。" },
              { en: "Li Ming was washing the dishes when his mother came home.", zh: "当他妈妈回来时，李明正在洗盘子。" },
              { en: "I read a comic book this morning.", zh: "今天上午我看了一本漫画书。（已经看完了）" },
              { en: "I was reading a comic book this morning.", zh: "今天上午我在看漫画书。（可能没看完）" },
            ],
          },
        ],
      },
      {
        heading: "七、常用动词的现在分词与不用于进行时的动词",
        blocks: [
          {
            type: "text",
            text: "必背：常用动词的现在分词变化（原形 — 现在分词），见下表。表中 cut—cutting、run—running、sit—sitting、swim—swimming、stop—stopping 都双写了末尾字母；come—coming、drive—driving、live—living、make—making、move—moving、take—taking、write—writing 都去掉末尾的 e 再加 -ing。",
          },
          {
            type: "table",
            head: ["原形", "现在分词"],
            rows: [
              ["arrive（到达）", "arriving"],
              ["come（来）", "coming"],
              ["cook（烹调）", "cooking"],
              ["cut（砍）", "cutting"],
              ["drive（驾驶）", "driving"],
              ["live（住）", "living"],
              ["make（做）", "making"],
              ["look（看）", "looking"],
              ["move（移动）", "moving"],
              ["play（玩）", "playing"],
              ["run（跑）", "running"],
              ["sit（坐）", "sitting"],
              ["speak（说）", "speaking"],
              ["study（学习）", "studying"],
              ["swim（游泳）", "swimming"],
              ["stop（停止）", "stopping"],
              ["take（取）", "taking"],
              ["write（写）", "writing"],
            ],
          },
          {
            type: "text",
            text: "不用于进行时的动词：表示状态、思想、感情和感觉的动词不能表示正在进行的动作，因此这类动词一般不能用于进行时态。",
          },
          {
            type: "table",
            head: ["类别", "动词"],
            rows: [
              ["感官动词", "hear, see, notice, feel, taste"],
              ["表示态度、感情的动词", "like, love, hate, desire, wish, mind, appreciate, fear, envy"],
              ["表示心理状态的动词", "know, realise, understand, recognise, believe, feel, suppose, want, expect, prefer"],
              ["表示存在状态和持续的动词", "seem, look, appear, cost, owe, weigh, be, exist, continue"],
              ["表示占有的动词", "belong to, own, possess, have"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "I hear the sound.（○）／ I am hearing the sound.（×）", zh: "感官动词 hear 表示“听见”时不用进行时。" },
              { en: "Do you hear the noise of a plane?（○）／ Are you hearing the noise of a plane?（×）", zh: "询问“你听到飞机的声音了吗”用一般现在时。" },
              { en: "They are hearing an English lecture.", zh: "如果 hear 不表示“听见”而表示“听”的意思时，可用进行时：他们在听一个英语讲座。" },
              { en: "I hate smoking.（○）／ I'm hating smoking.（×）", zh: "表示态度、感情的动词不用进行时。" },
              { en: "I believe him to be honest.（○）／ I'm believing him to be honest.（×）", zh: "表示心理状态的动词不用进行时。" },
              { en: "He looks tired.（○）／ He is looking tired.（×）", zh: "表示存在状态或持续的动词不用进行时。" },
              { en: "The battle continued for a week.（○）／ The battle was continuing for a week.（×）", zh: "表示持续的动词不用进行时。" },
              { en: "I have a lot of books.（○）／ I'm having a lot of books.（×）", zh: "表示占有的动词不用进行时。" },
              { en: "I was having dinner when you called me up.", zh: "如果 have/has 表示“吃饭、开会、玩得愉快”等意思时，可用进行时。" },
              { en: "I'm hoping you will go with us.", zh: "现代英语中，为了使语气更加委婉、客气，want、hope、expect 往往用于进行时（对比：I hope you will go with us.）。" },
            ],
          },
        ],
      },
      {
        heading: "八、失分陷阱与实力测验",
        blocks: [
          {
            type: "text",
            text: "本章“失分陷阱”共 4 道中考例题，考查现在进行时表示暂态、根据情境选择过去进行时以及 when 引导的时间状语从句。",
          },
          {
            type: "examples",
            items: [
              {
                en: "A: It's nice to see you again. Have you changed jobs? B: No, I'm visiting my cousin here.",
                zh: "【盐城中考】现在进行时表示某种状态，强调情况的暂时性。A 项是一般将来时，C 项是一般过去时，D 项是过去完成时，只有 B 项符合语境。答案 B。",
              },
              {
                en: "A: Did you see a boy in white pass by just now? B: No, sir. I was listening to music.",
                zh: "【黄石中考】问句用一般过去时提问，答语应用过去进行时表达当时正在做某事。答案 A。",
              },
              {
                en: "I first met Lisa three years ago when we were working at a radio station together.",
                zh: "【兰州中考】when 引导的时间状语从句中，主句用一般过去时，从句要用过去进行时表示当时正在发生的事。答案 C。",
              },
              {
                en: "When I got there, he was teaching them to dance.",
                zh: "【宁夏中考】时间状语从句中用一般过去时，主句用过去进行时表示当时正在发生的事。答案 C。",
              },
            ],
          },
          {
            type: "text",
            text: "本章“实力测验”共 5 种题型：1 用括号中动词的适当形式填空（20 题）；2 按要求变换句型；3 改错（每句只有一处错误）；4 汉译英；5 选择填空。",
          },
          {
            type: "list",
            items: [
              "动词适当形式填空集中考：现在进行时 be + doing（Look! They are running along the street.）、过去进行时 was/were + doing（What was he doing at nine o'clock last night?）以及 when/while 从句的配合。",
              "改错题高频错误：× We are liking music very much.（状态动词不用进行时）；× Listen! Li Ming playing the piano there.（缺 be 动词）；× I was finishing my work and went home.（连续动作用一般过去时 finished）。",
              "选择填空考查语境判断：at this time yesterday afternoon 用 was watching；at that time 用 was playing。",
              "汉译英考查“正在做某事”结构和 when 从句的时间关系（如“昨晚你打电话给我时，我正在看电视”）。",
            ],
          },
        ],
      },
    ],
    extras: {
      forms: [
        {
          name: "过去进行时",
          pattern: "was / were + 动词 -ing",
          note: "I/he/she/it 用 was；you/we/they 用 were。",
        },
        {
          name: "be going to + 动词原形",
          pattern: "主语 + be going to + 动词原形",
          note: "表示即将发生的事或打算（准备）做的事（本章归入将来时）。",
        },
      ],
      points: [
        {
          title: "持续性与短暂性动作同时发生时的分工",
          desc: "用过去进行时表示持续性动作，用一般过去时表示突然插入的短暂性动作。",
          good: [
            "We were walking along the river when it rained.",
            "They were watching TV when the lights went out.",
            "When you called, I was having my lunch.",
          ],
          bad: ["We walked along the river when it rained."],
        },
        {
          title: "过去进行时可表示过去将来",
          desc: "从过去某一时间看来将要发生的动作，常用在间接引语中。",
          good: [
            "She went to see David. He was leaving early the next morning.",
            "She asked him whether he was coming back for lunch.",
          ],
          bad: [],
        },
        {
          title: "现在进行时可代替一般现在时表示感情色彩",
          desc: "常与 always、forever 连用，表达不满或赞许。",
          good: ["You are always forgetting the important thing.", "Mary is doing pretty well at school."],
          bad: ["You always forget the important thing.（不表达不满的情绪）"],
        },
        {
          title: "状态动词一般不用进行时",
          desc: "表示状态、思想、感情和感觉的动词不用进行时；但 have 表“吃饭、开会”等或 hear 表“听”时可用进行时。",
          good: ["I hear the sound.", "I was having dinner when you called me up.", "They are hearing an English lecture."],
          bad: ["I am hearing the sound.", "I'm having a lot of books.", "We are liking music very much."],
        },
      ],
      contrasts: [
        {
          title: "过去进行时 vs 一般过去时",
          head: ["对比项", "一般过去时", "过去进行时"],
          rows: [
            ["含义", "表示一个完成的动作，只说明有过这件事", "表示过去某时正在进行的动作，强调动作的连续性"],
            ["例句", "The children watched TV yesterday evening.（看过电视，不知看了多久）", "The children were watching TV yesterday evening.（整晚都在看电视）"],
            ["搭配", "when + 短暂性动作（came home, went out）", "when / while + 持续性动作（was cleaning, were playing）"],
          ],
        },
      ],
      pitfalls: [
        "be 动词不能丢：× Listen! Li Ming playing the piano there.（应为 is playing）。",
        "状态动词不用进行时：× We are liking music very much.／× I'm having a lot of books.／× He is looking tired.",
        "现在进行时表将来时须有表示将来的时间状语，且仅限 go、come、leave、start、arrive、return、sleep 等少数动词。",
        "现在进行时与一般现在时区别在“暂时”与“经常”：He walks to work.（习惯）／He's walking to work because his bike is being repaired.（暂时）。",
      ],
      examTips: [
        "题干出现 at nine last night、at this time yesterday、at that time 等过去时间点时，用过去进行时。",
        "when 从句用一般过去时、主句表示当时正在进行，主句用过去进行时（When I got there, he was teaching them to dance.）。",
        "看到 now、look、listen 提示正在发生，用现在进行时。",
      ],
      memoryCard: [
        "进行时 = be + doing；现在时用 am/is/are，过去时用 was/were。",
        "持续用进行，打断用过去：were doing... when did。",
        "状态动词（like/know/have 表占有）不进进行时。",
      ],
    },
    notes: [
      "微信图片_20260927143932_465_66.jpg 右侧“说明/补充”窄栏被部分裁切，正文可读，已按可识别内容转写。",
      "微信图片_20260927143942_466_66.jpg、微信图片_20260927143947_467_66.jpg 为练习与例题页，右侧题号栏边角被裁切，题干可读；练习答案栏为空白，未编造答案。",
    ],
  },
];
