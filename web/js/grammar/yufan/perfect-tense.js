// web/js/grammar/yufan/perfect-tense.js —— 由 yufan 教材扫描图片整理的语法讲义数据
// 来源目录：yufan/动词/动词时态/完成时（教材第 15 章，P269—P285，共 17 张）
// 契约见同目录 README.md。自检：node --check web/js/grammar/yufan/perfect-tense.js

export default [
  {
    topicId: "g-present-perfect",
    newTopic: false,
    title: "动词的完成时",
    sourceDirs: ["yufan/动词/动词时态/完成时"],
    imagesRead: 17,
    summary:
      "完成时包括现在完成时和过去完成时：现在完成时 have / has + 过去分词，强调过去与现在的联系；过去完成时 had + 过去分词，表示「过去的过去」，常用于宾语从句和间接引语。",
    intro:
      "本章（教材第 15 章，P269—P285）在现有「现在完成时」专题之外，补充了现在完成时的完整句型（含特殊疑问句）、过去分词的三种用法、影响/结束/继续/经历四种用法、与一般过去时的辨析、终止性动词、have got、have been to 与 have gone to，以及整个「过去完成时」体系。",
    sections: [
      {
        heading: "一、概述：现在完成时与过去完成时",
        blocks: [
          {
            type: "text",
            text:
              "动词的完成时包括现在完成时和过去完成时。现在完成时是一种既涉及过去又联系现在的时态。与现在完成时所不同的是，过去完成时将时间推移到过去某一时间之前，即所谓的「过去的过去」。",
          },
          {
            type: "examples",
            items: [
              { en: "He has lived in Beijing for ten years.", zh: "他住在北京 10 年了。" },
              { en: "He said he had lived in Beijing ten years before.", zh: "他说他 10 年前在北京住。" },
            ],
          },
          {
            type: "text",
            text:
              "典型例句 1 是现在完成时，表示他在北京住了 10 年了，现在仍住在北京，是从过去到现在的一种持续状态；典型例句 2 是过去完成时，表示他 10 年前在北京住过，但现在已经不住在北京了，是过去的某一时间之前发生的事情。",
          },
        ],
      },
      {
        heading: "二、现在完成时的构成",
        blocks: [
          {
            type: "text",
            text:
              "现在完成时的形式是「have / has + 过去分词」，一般表示影响、结束、继续和经历四种意思。否定句是在 have / has 后面直接加上 not；一般疑问句是将 have / has 置于主语之前；特殊疑问句是将疑问词置于一般疑问句之前。",
          },
          {
            type: "list",
            items: [
              "肯定句：主语（第一、二人称单、复数）+ have + 过去分词 + ……",
              "肯定句：主语（第三人称单数）+ has + 过去分词 + ……",
              "肯定句：主语（第三人称复数）+ have + 过去分词 + ……",
              "否定句：主语 + have / has + not + 过去分词 + ……（haven't = have not，hasn't = has not）",
              "一般疑问句：Have / Has + 主语 + 过去分词 + ……?",
              "特殊疑问句：特殊疑问词 + have / has + 主语 + 过去分词 + ……?",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "I have bought lots of books about Western customs.", zh: "我买了许多有关西方风俗的书。" },
              { en: "He has been to the Great Wall.", zh: "他去过长城。" },
              { en: "They have already seen the film.", zh: "他们已经看过这部电影了。" },
              { en: "The Simpsons haven't been to Canada since the day they left.", zh: "从离开那天起，辛普森一家就再也没去过加拿大。" },
              { en: "Eric hasn't got his plane tickets yet.", zh: "埃里克还没有买到飞机票。" },
              { en: "A: Have you read Sherlock Holmes? B: Yes, I have. / No, I haven't.", zh: "你看《福尔摩斯》这本书了吗？——是的，我已经看了。/ 不，我还没看过。" },
              { en: "A: Has the huntsman killed Snow White? B: Yes, he has. / No, he hasn't.", zh: "猎人杀死白雪公主了吗？——是的，他把她杀了。/ 不，他没有杀死她。" },
            ],
          },
          {
            type: "examples",
            items: [
              { en: "How long have you been here?", zh: "你到这儿多久了？" },
              { en: "How many times have you been to the Great Wall?", zh: "你去过长城几次？" },
              { en: "A: Which book have you read? B: Snow White and the Seven Dwarfs.", zh: "你读过哪本书？——《白雪公主和七个小矮人》。" },
            ],
          },
          {
            type: "list",
            items: [
              "过去分词的用法 1：构成现在完成时或过去完成时，即 have / has + 过去分词 或 had + 过去分词。如 I have already written the letter.（我已经写完这封信了。）/ I had reached the British Museum by nine o'clock.（9 点钟的时候我已经到达大英博物馆了。）",
              "过去分词的用法 2：构成被动语态，即 be + 过去分词。如 My dog was taken care of by Alice while I was away.（我不在时，我的狗是由艾丽斯照看的。）",
              "过去分词的用法 3：用作形容词，作定语。如 This is a broken chair.（这是一张被损坏的椅子。）",
            ],
          },
          {
            type: "tip",
            text:
              "一个一般过去时的句子和一个一般现在时的句子合并后，可改成一个现在完成时的句子。如 He was busy then. He is still busy. → He has been busy since then.（他从那时起一直很忙。）",
          },
        ],
      },
      {
        heading: "三、现在完成时的用法：影响结束、继续、经历",
        blocks: [
          {
            type: "list",
            items: [
              "影响、结束：表示在过去不确定的时间里发生过或者未发生过的动作对现在产生的结果和影响；或者表示开始于过去的动作最近刚结束。",
              "继续：表示开始于过去并继续到现在的动作或状态（也许还会继续下去）。",
              "经历：表示从过去某时到现在的经历。",
            ],
          },
          {
            type: "text",
            text:
              "1 影响、结束之「表示过去的动作对现在产生的结果和影响」：现在完成时表示过去某个时间曾经做过的、发生过的事情对目前的某种影响，这时一般不用时间状语；也可以表示到目前为止没有发生或经历的事情。",
          },
          {
            type: "examples",
            items: [
              { en: "The tickets have sold out.", zh: "票已售空。" },
              { en: "I have tried Italian food. It's delicious!", zh: "我已经尝过意大利美食了。美味啊！" },
              { en: "Simon has seen the concert. He doesn't want to see it again.", zh: "西蒙已经看过这场演唱会，不想再看了。" },
              { en: "I have never visited San Francisco in the USA.", zh: "我从没去过美国的旧金山。（说明过去没有去过，现在仍没去过）" },
            ],
          },
          {
            type: "text",
            text:
              "2 影响、结束之「表示开始于过去的动作最近刚结束」：现在完成时表示开始于过去的动作刚刚结束时，常和以下时间状语连用：just 刚刚、already 已经、ever 曾经、recently 最近、never 从未、yet 还，迄今（用于否定句）；已经（用于疑问句）。",
          },
          {
            type: "examples",
            items: [
              { en: "I have just heard the news that our school will set up a press club.", zh: "我刚听到消息说我们学校要成立一个记者俱乐部。" },
              { en: "They have just started to explore other planets.", zh: "他们才刚刚开始探索其他星球。" },
              { en: "The scientists haven't discovered any intelligent life on other planets yet.", zh: "科学家们还没有在其他星球上发现有智力的生命。" },
            ],
          },
          {
            type: "text",
            text:
              "3 继续：现在完成时表示过去开始，持续到现在，而且还可能继续下去的动作或状态，常和表示一段时间的状语连用。",
          },
          {
            type: "list",
            items: [
              "this week / month 这周 / 这个月；these days 这些天；since then 自那时起；so far 迄今为止；up to now 直到现在；in the past few days 在过去的几天；during the last two weeks 在过去的两周",
              "lately 最近，近来；since... 自从……；since two days ago 从两天前；for a long time 很长一段时间；till / until now 直到现在",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "I've known Grace since my childhood.", zh: "我从小就认识格雷斯。（表示现在还继续往来）" },
              { en: "Catherine has learned drawing since 2008.", zh: "凯瑟琳从 2008 年起学的画画。（表示现在还在学）" },
              { en: "He has lived in Beijing for thirty years.", zh: "他住在北京 30 年了。（表示现在还住在北京）" },
              { en: "I have known him for ten years.", zh: "我认识他 10 年了。" },
              { en: "I have stayed in the hotel for two weeks so far.", zh: "迄今为止，我已经在这个旅馆住了两周了。" },
              { en: "How long have you studied English?", zh: "你学英语多久了？（表示现在仍在学）" },
            ],
          },
          {
            type: "tip",
            text:
              "「since + 时间点」表示「从……开始」；「for + 一段时间」表示「在……期间」。询问做某事「多久了」时，通常用 How long...?",
          },
          {
            type: "text",
            text:
              "4 经历：现在完成时表示从过去到现在之间曾经经历过的事情，常和以下词语连用：often 经常、never 从不、ever 曾经、once 一次，曾经、twice 两次、since 自从、before 之前、three times 三次。",
          },
          {
            type: "examples",
            items: [
              { en: "He has never been abroad in his life.", zh: "他一生中从未出过国。" },
              { en: "I have been to the Summer Palace twice.", zh: "我曾经去过颐和园两次。" },
              { en: "We have visited the Louvre Museum before.", zh: "我们以前曾参观过卢浮宫。（表示是过去的经历，但现在依然记得）" },
              { en: "A: Have you ever been to the Forbidden City before? B: Yes, I have.", zh: "你以前去过紫禁城吗？——是的，我去过。" },
            ],
          },
        ],
      },
      {
        heading: "四、使用现在完成时需注意事项",
        blocks: [
          {
            type: "text",
            text:
              "现在完成时强调的是在时间上与现在的联系，因此它不能和表示确定的过去时间状语连用，如 ago（以前）、yesterday（昨日）、last week（上周）、three years ago（三年前）、in 2001（2001 年）以及以 when 为首的疑问句等。在现在完成时的句子中，终止性动词（也叫点动词）一般不能与表示延续的时间状语连用。",
          },
          {
            type: "text",
            text:
              "1 现在完成时与一般过去时：两者都表示在过去做的动作，但现在完成时强调这一动作与现在的关系，如对现在产生的结果、影响等；一般过去时则只表示过去的事实，不表示和现在的关系。所以，一些表示过去的固定时间状语只能与一般过去时连用，如 ago、last 或由 when（何时）引起的问句都不能与现在完成时连用。",
          },
          {
            type: "examples",
            items: [
              { en: "I have just cleaned my room.", zh: "我刚打扫过房间。（现在完成时）" },
              { en: "I cleaned my room yesterday.", zh: "我昨天打扫了房间。（一般过去时）" },
              { en: "(○) I visited your school three weeks ago.", zh: "三周前我参观了你们学校。（此句只能用一般过去时）" },
              { en: "(○) I have already visited your school. / (○) I have visited your school before. / (×) I have visited your school three weeks ago.", zh: "我已经参观过你们学校了。/ 以前我参观过你们学校。/ 误：带 three weeks ago 时不能用现在完成时。" },
              { en: "(○) I bought a teddy bear last Sunday. / (○) I have just bought a teddy bear. / (×) I have bought a teddy bear last Sunday.", zh: "上周日我买了一个泰迪熊。/ 我刚买了一个泰迪熊。/ 误：要用现在完成时，就要去掉 last Sunday。" },
              { en: "(○) I went shopping yesterday morning. / (×) I have gone shopping yesterday morning.", zh: "我昨天早上去逛街了。/ 误：yesterday morning 不能与现在完成时连用。" },
              { en: "I saw her yesterday (morning / evening). I haven't seen her so far.", zh: "我昨天（早上 / 晚上）看见过她。我至今没见过她。" },
            ],
          },
          {
            type: "list",
            items: [
              "能与一般过去时连用的时间状语：a week ago 一周前、the other day 几天前、last week 上周、just now 刚刚、in 2009 在 2009 年、during the night 在夜里、earlier this month 本月初",
              "能与现在完成时连用的时间状语：up to now 直到现在、till / until now 直到现在、since last week 从上周以来、recently 最近、for a long time 很长一段时间、these days 近日、in the past few days 过去的几天",
            ],
          },
          {
            type: "text",
            text:
              "用法比较：一般过去时 He closed the window.（他关了这扇窗户。）只叙述他过去做过这个动作；现在完成时 He has closed the window.（他关上了窗户。）包含两层意思：一是他曾经关了这扇窗户，二是强调动作与现在的关系，即现在这扇窗户是关着的。同样，I bought a red car.（我买过一辆红色小汽车。）只叙述这一过去发生的事实，与现在无关；I have bought a red car.（我买了一辆红色小汽车。）既叙述了过去发生的动作，又强调了与现在的关系，即我现在正在使用着。",
          },
          {
            type: "text",
            text:
              "2 when 不能和现在完成时连用：(○) When did you buy the red car?（你什么时候买的这辆红色小汽车？）(×) When have you bought the red car? 句中有 ago、last 或 when 引导的问句都不能与完成时连用；句中有 ever、already、for three days、just、never、yet 等词时要用完成时。",
          },
          {
            type: "examples",
            items: [
              { en: "A: Have you ever met Alice? B: Yes, I have. A: When did you meet her? B: Last week. A: Oh. She has already been here.", zh: "你遇见艾丽斯了吗？——是的。你什么时候遇见她的？——上周。哦，她已经来了啊。" },
              { en: "B: Have you borrowed it from our library? A: Yes, I have. B: When did you borrow it? A: Two days ago. B: So you have kept it for three days.", zh: "你是从我们的图书馆借的吗？——是的。你什么时候借的？——两天前。也就是说你已经借了三天了。" },
              { en: "B: When will you return it? A: I'll return it as soon as I have read it. = ... as soon as I have finished reading it. = ... as soon as I finish it.", zh: "你什么时候还啊？——我一看完就还。" },
              { en: "A: I've just seen a horrible accident. B: Oh. What happened? A: A truck ran into a car.", zh: "我刚才目睹了一场可怕的事故。噢，怎么啦？一辆卡车撞了一辆小汽车。" },
            ],
          },
          {
            type: "tip",
            text:
              "此句中的 have kept 不能用 have borrowed 替代，因为 borrow 是短暂性动词，不能与表示一段时间的时间状语连用。从句中用现在完成时强调读完这本书，因为 finish（完成）这个词本身就是「读完」的意思，所以用一般现在时也可以。",
          },
          {
            type: "text",
            text:
              "3 终止性动词（也叫点动词）表示动作有一个终点，到了终点就不能再延续。因此在现在完成时句子中，这种动词不能与表示延续的时间状语连用。常用的终止性动词有：arrive 到达、begin 开始、borrow 借、buy 买、come 来、die 去世、go 去、join 参加、leave 离开、lose 失去、finish 完成、stop 停止。",
          },
          {
            type: "examples",
            items: [
              { en: "(○) I've been away from Shanghai for 3 days. / (○) I left Shanghai 3 days ago. / (○) It is / has been 3 days since I left Shanghai.", zh: "我离开上海已经三天了。" },
              { en: "(×) I've left Shanghai for 3 days.", zh: "误：此时要把终止性动词变为延续性动词。" },
              { en: "Tony hasn't left home for a month.", zh: "托尼已经有一个月没有出门了。（表示「足不出户」这一状态）" },
              { en: "I haven't seen you for a long time.", zh: "我已经好久没有看到你了。（表示「不常见」这一状态）" },
            ],
          },
          {
            type: "tip",
            text:
              "如果现在完成时的谓语动词是终止性动词的否定式，则一般可以和表示一段时间的短语连用，因为终止性动词的这种否定构成一种可以持续的状态。",
          },
          {
            type: "text",
            text:
              "4 have / has got：形式上是现在完成时，实际上和一般现在时的 have / has 的意思相同，如 He has got a slight headache. = He has a slight headache.「have / has got + 不定式」表示「必须」，如 I've got to go.（我得走了。）You have got to use your imagination.（你得运用自己的想象力。）",
          },
          {
            type: "examples",
            items: [
              { en: "(○) Ronald has been to Hong Kong Disney theme park twice.", zh: "罗纳德以前去过香港的迪士尼主题公园两次。（现在不在该公园）" },
              { en: "(○) Ronald has gone to Hong Kong Disney theme park.", zh: "罗纳德已经去了香港的迪士尼主题公园。（现在就在该公园）" },
              { en: "(×) Ronald has gone to Hong Kong Disney theme park twice.", zh: "误：have / has gone to 不能与表示次数的 twice 连用。" },
            ],
          },
        ],
      },
      {
        heading: "五、过去完成时的构成与用法",
        blocks: [
          {
            type: "text",
            text:
              "过去完成时的形式是「had + 过去分词」，一般表示过去某一时间或某一动作之前发生的事情、完成的动作或存在的状态。它的否定句是在 had 后面直接加上 not；一般疑问句是将 had 置于主语之前；特殊疑问句是将疑问词置于一般疑问句之前。",
          },
          {
            type: "list",
            items: [
              "肯定句：主语（所有人称）+ had + 过去分词 + ……",
              "否定句：主语（所有人称）+ had + not + 过去分词 + ……",
              "一般疑问句：Had + 主语 + 过去分词 + ……? 回答：Yes, ... had. / No, ... hadn't.",
              "特殊疑问句：疑问词 + had + 主语 + 过去分词 + ……?",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "By 2006 Kevin had already graduated from the junior high school.", zh: "截止到 2006 年，凯文已经从初中毕业了。" },
              { en: "In 2006 Kevin graduated from the junior high school.", zh: "凯文 2006 年从初中毕业。（表示凯文初中毕业是发生在 2006 年的事）" },
              { en: "When I got there, he had left.", zh: "当我到那儿时，他已经走了。" },
              { en: "She told me she hadn't had supper.", zh: "她告诉我她还没吃晚饭呢。" },
              { en: "By nine o'clock yesterday evening Justin hadn't got home.", zh: "昨天直到晚上 9 点，贾斯廷还没到家。" },
              { en: "A: Had you known anything about our school before you came here? B: Yes, I had. / No, I hadn't.", zh: "你来这儿之前就了解我们学校了吗？——是的，我了解。/ 不，我不了解。" },
              { en: "A: Had he stopped talking when he heard the ring? = Did he stop talking when he heard the ring?", zh: "他听见铃声时就不谈话了吗？（两个动作时间很近，也可用过去时）" },
              { en: "What had you completed before I called you?", zh: "我给你打电话之前，你都完成什么了？" },
              { en: "How long had Lynn studied French by the time she was 16?", zh: "到 16 岁时，林恩已经学了多长时间法语了？" },
            ],
          },
          {
            type: "tip",
            text:
              "Had you known... before you came here? 是一个由 before 引导的时间状语从句：在对其主句提问时，只需将过去完成时的主句改用一般疑问句的倒装语序，从句维持陈述语序不变，但从句句末要加问号。",
          },
          {
            type: "text",
            text:
              "过去完成时常与下列词语或结构连用：already、just、ever、yet（表示过去的过去）；by then（截止到那时）、by 9 o'clock（直到 9 点之前）、by the end of...（到……时候为止）、by the time...（到……时候）、up till then（直到那时）；以及 when、before、after、as soon as、till / until 等引导的时间状语从句（强调动作发生的时间先后）。",
          },
          {
            type: "examples",
            items: [
              { en: "Robert told me his team had already won.", zh: "罗伯特告诉我他们队已经赢了。" },
              { en: "I heard that the president had just arrived here.", zh: "我听说院长刚刚到达。" },
              { en: "By the end of 2007 many buildings had been built in the city.", zh: "截止到 2007 年年底，这座城市已高楼林立。" },
              { en: "By the time Henry came here he had been a famous doctor.", zh: "亨利到这儿之前就已经是位名医了。" },
              { en: "When she got home, her children had slept.", zh: "她到家时孩子们已经入睡了。（孩子们入睡的动作在前，她到家的动作在后）" },
              { en: "When she had finished her job, she went to sleep.", zh: "当她把所有的事情做完之后，她就去睡觉了。" },
              { en: "I stood there until the plane had disappeared in the sky.", zh: "我站在那儿直到飞机在天空中消失。" },
            ],
          },
          {
            type: "tip",
            text:
              "与状语从句连用时，如果不强调动作的先后则有时可用一般过去时来表示，尤其是由 as soon as、until 引导从句时；但若要表示强调，则用过去完成时。如 As soon as I received the letter, I wrote to you.（两个动作几乎同时发生，用一般过去时即可）/ He didn't leave here until Mary arrived.",
          },
          {
            type: "examples",
            items: [
              { en: "I didn't know what he had done it for.", zh: "我以前不知道他究竟为什么这么做。" },
              { en: "I asked him how many students had attended the meeting.", zh: "我问他有多少学生去开会了。" },
            ],
          },
          {
            type: "text",
            text:
              "比较：by 2007 截止到 2007 年；by the end of 2007 截止到 2007 年年底。president 除「总统」外，还有「校长」「（公司等的）总经理、总裁、董事长」等意思。",
          },
        ],
      },
      {
        heading: "六、使用过去完成时需注意事项",
        blocks: [
          {
            type: "text",
            text:
              "1 过去完成时与现在完成时的比较：两者用法基本相同，但现在完成时是以现在的时间为基点；过去完成时则是以过去的时间为基点，与现在无关，即过去的过去。",
          },
          {
            type: "examples",
            items: [
              { en: "I have known Neil for three years.", zh: "我认识尼尔三年了。" },
              { en: "I had known Neil when I was a student.", zh: "当我还是个学生时，就已经认识尼尔了。" },
              { en: "I have finished my experiment.", zh: "我已经做完实验了。（表示现在说话时已经做完实验）" },
              { en: "By six o'clock, I had finished my experiment.", zh: "在 6 点以前，我就已经做完实验了。（表示在过去的某一时间 six o'clock 以前已经做完，与现在无关）" },
            ],
          },
          {
            type: "tip",
            text:
              "just、already、yet、ever 等词可以和现在完成时连用，也可以和过去完成时连用。如 Dora has just finished the work.（朵拉刚做完这项工作。）/ Dora said that she had just finished the work.（朵拉说她刚做完这项工作。）",
          },
          {
            type: "text",
            text:
              "2 过去完成时表示未能实现的愿望或希望：表示意向的动词如 hope、wish、expect、think、intend、mean、suppose 等，用过去完成时表示想做而未做的事，意为「原本……，而未能……」。",
          },
          {
            type: "examples",
            items: [
              { en: "We had hoped that you would come, but you didn't.", zh: "我们原本以为你会来，但是你却没有来。" },
              { en: "They had been supposed to be able to arrive by ten.", zh: "他们本来应该能在 10 点之前到达。" },
            ],
          },
        ],
      },
      {
        heading: "七、易错点（Common Mistakes）与实力测验",
        blocks: [
          {
            type: "pitfall",
            text:
              "陷阱例题 1：A: Are you going to help John with his Chinese this evening? B: No. He ______ to England. He will be back next month.（A. returned B. has returned C. returns D. will return）——由答语可知他现在仍在英国，应用现在完成时，答案为 B。",
          },
          {
            type: "pitfall",
            text:
              "陷阱例题 2：A: Good evening. I ______ to see Miss Mary. B: Oh, good evening. I'm sorry, but she is not in.（A. have come B. come C. came D. had come）——「我」已经来到这里，且来这里的目的是看望玛丽，动作对现在产生影响，用现在完成时，答案为 A。",
          },
          {
            type: "pitfall",
            text:
              "陷阱例题 3：I ______ English in that school since I came to the city.（A. have taught B. am teaching C. will teach D. taught）——由 since 引导的时间状语从句可知应用现在完成时（表示过去已经开始、持续到现在并可能继续下去），答案为 A。",
          },
          {
            type: "pitfall",
            text:
              "陷阱例题 4：A: What are you doing here? B: Jane ______. I'm waiting for her.（A. came back B. has come back C. hasn't come back）——由「我正在等她」可知她还没有回来，用现在完成时，答案为 C。",
          },
          {
            type: "list",
            items: [
              "实力测验（P283—P285）题型：1 用括号中动词的适当形式填空（20 题）；2 按要求变换句型；3 选择填空；4 汉译英；5 改错。",
              "综合考查点：把 appear / join / buy / leave / go / come 等放进上下文判断该用一般过去时还是现在完成时，例如 By 2023 the book has been translated into about twelve languages、When have you been to your hometown（when 不能与完成时连用，应改为 When did you go to your hometown）等。",
            ],
          },
        ],
      },
    ],
    extras: {
      forms: [
        { name: "现在完成时·特殊疑问句", pattern: "疑问词 + have / has + 主语 + 过去分词 + ……?", note: "How long have you been here? / How many times have you been to the Great Wall?" },
        { name: "过去完成时", pattern: "had + 过去分词", note: "表示「过去的过去」，否定句在 had 后加 not，疑问句把 had 提到主语之前。" },
        { name: "have / has got", pattern: "have / has got + 名词；have / has got + 不定式", note: "形式上是现在完成时，实际与一般现在时的 have / has 意思相同；接不定式表示「必须」。" },
      ],
      points: [
        {
          title: "现在完成时与过去完成时的基点不同",
          desc: "现在完成时以现在的时间为基点；过去完成时以过去的时间为基点，与现在无关，即「过去的过去」。",
          good: [
            "I have known Neil for three years.",
            "I had known Neil when I was a student.",
            "By six o'clock, I had finished my experiment.",
          ],
          bad: [],
        },
        {
          title: "终止性动词要与延续性表达互换",
          desc: "终止性动词（点动词）不能与表示延续的时间状语连用，要换成延续性表达或改用 ago / since 句型。",
          good: [
            "(○) I've been away from Shanghai for 3 days.",
            "(○) I left Shanghai 3 days ago.",
            "(○) It is / has been 3 days since I left Shanghai.",
          ],
          bad: ["(×) I've left Shanghai for 3 days.", "(×) So you have borrowed it for three days.（应为 have kept）"],
        },
        {
          title: "have / has been to 与 have / has gone to",
          desc: "have / has been to 表示去过某地（人已回来，现在不在那里）；have / has gone to 表示去了某地（人已在途中或在那里），不能与表示次数的词连用。",
          good: [
            "(○) Ronald has been to Hong Kong Disney theme park twice.",
            "(○) Ronald has gone to Hong Kong Disney theme park.",
          ],
          bad: ["(×) Ronald has gone to Hong Kong Disney theme park twice."],
        },
        {
          title: "过去完成时表示未能实现的愿望",
          desc: "hope、wish、expect、think、intend、mean、suppose 等表示意向的动词用过去完成时，表示想做而未做的事，意为「原本……，而未能……」。",
          good: ["We had hoped that you would come, but you didn't.", "They had been supposed to be able to arrive by ten."],
          bad: [],
        },
      ],
      contrasts: [
        {
          title: "现在完成时 vs 过去完成时",
          head: ["项目", "现在完成时", "过去完成时"],
          rows: [
            ["构成", "have / has + 过去分词", "had + 过去分词"],
            ["时间基点", "以现在为基点", "以过去某一时间为基点"],
            ["含义", "过去发生，与现在有联系", "过去的过去"],
            ["例子", "I have finished my experiment.", "By six o'clock, I had finished my experiment."],
          ],
        },
        {
          title: "have / has been to vs have / has gone to",
          head: ["结构", "含义", "例子"],
          rows: [
            ["have / has been to", "去过（人已回来，现在不在此地）", "Ronald has been to Hong Kong Disney theme park twice."],
            ["have / has gone to", "去了（人不在此地）", "Ronald has gone to Hong Kong Disney theme park."],
          ],
        },
      ],
      pitfalls: [
        "终止性动词（arrive、begin、borrow、buy、come、die、go、join、leave、lose、finish、stop 等）不能与表示延续的时间状语连用；但其否定式构成的是一种可以持续的状态，可以与一段时间连用。",
        "have / has gone to 不能与表示次数的词（twice、three times 等）连用。",
        "have / has got 形式上是现在完成时，意思却等于一般现在时的 have / has，不要按「完成」去理解。",
      ],
      examTips: [
        "句中出现 ever、already、for three days、just、never、yet 等词时要用完成时；出现 ago、last 或由 when 引导的问句时不能与完成时连用。",
        "语境判断题先看「现在是否仍有影响」：答语提示现在仍住在英国、现在还在等她时选现在完成时，只叙述过去事实时选一般过去时。",
        "见到 since 引导的时间状语从句，主句用现在完成时；见到 by then、by the end of、by the time 等，考虑过去完成时。",
      ],
      memoryCard: [
        "现在完成 = have / has + 过去分词；过去完成 = had + 过去分词。",
        "确定的过去时间（ago、last week、when...）只配一般过去时；不确定的过去时间（ever、already、yet、just、never）才配现在完成时。",
        "过去的过去用过去完成时；终止性动词要变延续性表达。",
      ],
    },
  },
];
