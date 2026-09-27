// web/js/grammar/yufan/passive-voice.js —— 由 yufan 教材扫描图片整理的语法讲义数据
// 来源目录：yufan/动词/被动语态（教材第 16 章，P287—P301，共 15 张）
// 契约见同目录 README.md。自检：node --check web/js/grammar/yufan/passive-voice.js

export default [
  {
    topicId: "g-passive-voice",
    newTopic: false,
    title: "被动语态",
    sourceDirs: ["yufan/动词/被动语态"],
    imagesRead: 15,
    summary:
      "被动语态由「be 动词 + 过去分词」构成，时态通过 be 的变化体现，共有十种时态形式；主动变被动时，宾语提到句首作主语，原主语用 by 引出。",
    intro:
      "本章（教材第 16 章，P287—P301）在现有「被动语态」专题之外，补充了十种时态的被动形式总表、四种句型的被动、主动变被动的完整步骤，以及 SVO / SVOO / SVOC / 短语动词 / 情态动词 / be going to / 祈使句等各类被动结构，并辨析了被动语态与系表结构。",
    sections: [
      {
        heading: "一、概述：语态与被动语态的构成",
        blocks: [
          {
            type: "text",
            text:
              "语态是动词的一种形式，用来说明句中主语和谓语动词的关系。如果主语是动作的执行者，则使用主动语态；如果主语是动作的承受者，则使用被动语态。被动语态的句子以「be 动词 + 过去分词」的形式来表达。主动语态变为被动语态时，将主动语态的宾语变为被动语态的主语，将主动谓语变为被动谓语，将主动语态的主语变为 by 短语。",
          },
          {
            type: "examples",
            items: [
              { en: "Many people speak English.", zh: "许多人说英语。（主动语态）" },
              { en: "English is spoken by many people.", zh: "英语被许多人说。（被动语态）" },
            ],
          },
          {
            type: "text",
            text:
              "被动语态由「be 动词 + 过去分词」构成，如果要特别强调动作或行为的执行者时，句子后面需接 by...，译为「被 / 由……」。其中 be 动词要根据人称、数和时态发生变化，be 动词后面的过去分词不变。",
          },
        ],
      },
      {
        heading: "二、被动语态的十种时态",
        blocks: [
          {
            type: "text",
            text:
              "被动语态的各种时态是通过 be 动词的时态变化来体现的，be 动词是什么时态，全句就是什么时态。以动词 give 为例，其被动语态的十种时态的构成如下表：",
          },
          {
            type: "table",
            head: ["时", "一般", "进行", "完成"],
            rows: [
              ["现在", "am / is / are + given", "am / is / are + being given", "has / have + been given"],
              ["过去", "was / were + given", "was / were + being given", "had been given"],
              ["将来", "shall / will + be given", "—", "shall / will + have been given"],
              ["过去将来", "should / would + be given", "—", "should / would + have been given"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "(A) History is made by the people.", zh: "（一般现在时）历史是人民创造的。" },
              { en: "(A) Confucius' works are still read by many people today.", zh: "（一般现在时）今天孔子的论著仍被许多人阅读。" },
              { en: "(B) The abacus was invented in the sixth century.", zh: "（一般过去时）算盘发明于 6 世纪。" },
              { en: "(B) The Eiffel Tower was completed in 1889.", zh: "（一般过去时）埃菲尔铁塔建成于 1889 年。" },
              { en: "(C) He will also be asked to appear in advertisements and films.", zh: "（一般将来时）他也将被邀请去拍广告和电影。" },
              { en: "(C) More subway lines will be built in the future.", zh: "（一般将来时）将来会建造更多的地铁线路。" },
              { en: "(D) Toby said the new hotel would be built in six months.", zh: "（过去将来时）托比说 6 个月后新旅馆就会建好的。" },
              { en: "(E) A new railway is being built.", zh: "（现在进行时）一条新的铁路正在修建中。" },
              { en: "(F) The roads were being widened then.", zh: "（过去进行时）路那时正在拓宽。" },
              { en: "(G) These plants have been grown without the use of any chemicals.", zh: "（现在完成时）种植这些植物未使用任何化学物质。" },
              { en: "(H) A new hotel had been built when I got there.", zh: "（过去完成时）我到那儿时，一座新旅馆已经建好了。" },
              { en: "(I) Many new stadiums and gyms will have been built in London by next year.", zh: "（将来完成时）到明年许多新的体育场馆将在伦敦建成。" },
              { en: "(J) The day was drawing near when the reservoir would have been completed.", zh: "（过去将来完成时）离水库完工的日子不远了。" },
            ],
          },
          {
            type: "list",
            items: [
              "将来完成时被动表示在将来某一时间之前完成的动作，并常常会对将来某一时间产生一定影响。",
              "过去将来完成时被动表示从过去某时刻预计将来某一时间前完成的动作，并常会对那时产生一定影响。",
            ],
          },
        ],
      },
      {
        heading: "三、被动语态的四种句型",
        blocks: [
          {
            type: "list",
            items: [
              "肯定句：主语 + be + 过去分词 + (by...).",
              "否定句：主语 + be not + 过去分词 + (by...).",
              "一般疑问句：Be + 主语 + 过去分词 + (by...)?",
              "特殊疑问句：疑问词 + be + 主语 + 过去分词 + (by...)?",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "The child is well loved by people.", zh: "（肯定句）这个孩子很招人喜爱。" },
              { en: "People in the world are influenced by Confucius' thoughts.", zh: "（肯定句）世界上的人们受到孔子思想的影响。" },
              { en: "Mark Twain isn't known as a great thinker.", zh: "（否定句）马克·吐温并不是作为伟大的思想家而闻名于世的。" },
              { en: "The battery wasn't charged yesterday.", zh: "（否定句）电池昨天没有充电。" },
              { en: "Was The Adventures of Tom Sawyer written by Mark Twain?", zh: "（一般疑问句）《汤姆·索亚历险记》是马克·吐温写的吗？" },
              { en: "A: Were Spider-man and Batman made into television plays? B: Yes, they were. / No, they weren't.", zh: "（一般疑问句）《蜘蛛侠》和《蝙蝠侠》都被制作成了电视剧吗？——是的。/ 不，不是的。" },
              { en: "A: What language is spoken in China? B: Chinese.", zh: "（特殊疑问句）在中国讲什么语言？——汉语。" },
              { en: "A: Who was the flying saucer invented by? B: It was invented by college students.", zh: "（特殊疑问句）飞碟是由谁发明的？——它是由大学生发明的。" },
              { en: "A: When was the telephone invented? B: It was invented in 1876.", zh: "（特殊疑问句）电话是什么时候被发明的？——它是 1876 年被发明的。" },
            ],
          },
        ],
      },
      {
        heading: "四、主动语态变为被动语态",
        blocks: [
          {
            type: "text",
            text:
              "被动语态由「be 动词 + 过去分词」构成，过去分词保持不变，所有的变化即人称、数、时态的变化，都体现在 be 动词的变化上。如果能够掌握好 be 动词的变化，就很容易掌握被动语态。",
          },
          {
            type: "examples",
            items: [
              { en: "主动句：The naughty boy broke the window yesterday.", zh: "昨天这个淘气的男孩打破了这扇窗户。" },
              { en: "被动句：The window was broken by the naughty boy yesterday.", zh: "昨天这扇窗户被这个淘气的男孩打破了。" },
              { en: "主动句：He sold some of the fish yesterday.", zh: "昨天他卖掉了一部分鱼。" },
              { en: "被动句：Some of the fish were sold by him yesterday.", zh: "昨天一部分鱼被他卖掉了。" },
              { en: "主动句：They don't use the room.", zh: "他们未使用这个房间。" },
              { en: "被动句：The room is not used by them.", zh: "这个房间未被他们使用。" },
              { en: "主动句：Did Tom use it?", zh: "汤姆用过它吗？" },
              { en: "被动句：Was it used by Tom?", zh: "它被汤姆用过吗？" },
              { en: "主动句：Where did you make that dress?", zh: "你在哪儿做的那件衣服？" },
              { en: "被动句：Where was that dress made (by you)?", zh: "那件衣服是在哪儿做的？" },
            ],
          },
          {
            type: "tip",
            text:
              "把主动语态改写为被动语态时，be 动词的人称和数要根据新主语的人称和数变化，但时态要与主动语态一样。",
          },
        ],
      },
      {
        heading: "五、被动语态的几种类型",
        blocks: [
          {
            type: "text",
            text:
              "1 由及物动词构成的被动语态之「有一个宾语的句子 (SVO)」：主动句 S（主）+ V（谓）+ O（宾）；被动句 S（原宾语）+ be + 过去分词 + by + O（原主语的宾格形式）。",
          },
          {
            type: "examples",
            items: [
              { en: "Farmers grow rice in spring. → Rice is grown by farmers in spring.", zh: "农民们在春天种植水稻。→ 水稻在春天被农民们种植。" },
              { en: "Thousands of tourists will visit Kunming this year. → Kunming will be visited by thousands of tourists this year.", zh: "今年将会有成千上万的旅客游览昆明。→ 今年昆明将会被成千上万的旅客游览。" },
            ],
          },
          {
            type: "text",
            text:
              "2 之「有两个宾语的句子 (SVOO)」：主动句 S + V + IO（间接宾语）+ DO（直接宾语）；被动句 S（原 IO）+ be + 过去分词 + 原 DO + by + 原主语的宾格，或 S（原 DO）+ be + 过去分词 + 介词 + 原 IO + by + 原主语的宾格。用直接宾语作被动语态的主语时，保留下来的宾语之前要加一个适当的介词，如 to、for、of 等。",
          },
          {
            type: "examples",
            items: [
              { en: "Lenin showed the guard his pass. → The guard was shown the pass (by Lenin). / The pass was shown to the guard (by Lenin).", zh: "列宁把通行证给卫兵看了。→ 卫兵看了通行证。/ 通行证给卫兵看了。" },
              { en: "His mother bought him a new coat. → He was bought a new coat (by his mother). / A new coat was bought for him (by his mother).", zh: "他妈妈给他买了一件新外套。→ 他收到了一件新外套。/ 这件新外套是他妈妈买给他的。" },
              { en: "He lent me a bike. → A bike was lent to me (by him). / I was lent a bike (by him).", zh: "他借给我一辆自行车。→ 一辆自行车被（他）借给我了。/ 我被（他）借给了一辆自行车。" },
            ],
          },
          {
            type: "list",
            items: [
              "A 可有两种被动语态的动词：award 奖励；颁奖、buy 买、give 给、leave 离开、lend 借给、offer 提供、pay 支付、teach 教授、tell 告诉、show 展示；指示；引导。",
              "B 通常用直接宾语作被动语态主语的动词：bring 拿来；带来、do 做；制作、make 制作、pass 传递、sell 出售；卖、send 送；寄、sing 唱歌、sew 缝制、write 写（信）。如 He wrote her a letter. → A letter was written to her by him.（符合习惯）/ She was written a letter by him.（不合习惯）。My aunt sewed me a skirt. → A skirt was sewed for me by my aunt.（符合习惯）/ I was made a skirt by my aunt.（不合习惯）",
              "C 通常用间接宾语作被动语态主语的动词：answer 回答、deny 否认；拒绝、envy 嫉妒；羡慕、refuse 拒绝；谢绝、save 解救；节省；保存、spare 节约；分出。如 I refused him the invitation. → He was refused the invitation by me.（符合习惯）/ The invitation was refused him by me.（不合习惯）。The authorities refused James a passport. → James was refused a passport by the authorities.（符合习惯）/ A passport was refused James by the authorities.（不合习惯）",
              "口诀·经常接双宾语的动词：allow、ask、award、buy、do、give、make、offer、pass、pay、promise、sell、send、sew、show、sing、teach、tell、write。",
            ],
          },
          {
            type: "text",
            text:
              "3 之「含有宾语补足语的句子 (SVOC)」：主动句 S + V + O（宾）+ C（宾语补足语）；被动句 S（原宾语）+ be + 过去分词 + C + by + O（原主语的宾格形式）。有宾语补足语的主动语态改为被动语态时，补足语放在过去分词之后，其位置虽然保持不变，但语法功能变了——此时的补足语不再是宾语补足语，而变成了主语补足语。",
          },
          {
            type: "examples",
            items: [
              { en: "We call her a beauty. → She is called a beauty (by us).", zh: "我们叫她「美女」。→ 她被（我们）称为「美女」。" },
              { en: "They will make Beijing more beautiful. → Beijing will be made more beautiful (by them).", zh: "他们将会把北京建设得更美丽。→ 北京将会被建设得更美丽。" },
              { en: "Children saw the balloons rising. → The balloons were seen rising (by children).", zh: "孩子们看着气球升上去了。→ 气球被看着升上去了。" },
              { en: "He saw a thief steal something from the room. → A thief was seen to steal something from the room.", zh: "他看见一个小偷从屋子里偷了东西。→ 一个小偷被看见从屋子里偷了东西。" },
            ],
          },
          {
            type: "pitfall",
            text:
              "所有带不定式宾语补足语的动词，在变为被动语态时，不定式前都要加 to，特别是感官动词（see、watch、look at、observe、listen to、hear、feel 等）和使役动词（make、have 等）：在主动语态的句子中宾语补足语前省略 to，变为被动语态时主语补足语前一律加 to。但含有 let 的句子在变为被动语态时，to 可以省略。",
          },
          {
            type: "text",
            text:
              "4 由短语动词构成的被动语态：一般情况下，只有及物动词后面能跟宾语，而不及物动词后面不能跟宾语，所以只有及物动词有被动语态，不及物动词则没有。但有些不及物动词后面跟上介词或副词后，变成一个短语动词，相当于一个及物动词，这时它就可以有被动语态。主动句 S + V（不及物动词）+ 介词 + O（宾）；被动句 S（原宾语）+ be + 过去分词 + 介词 + by + O（原主语的宾格形式）。在短语动词结构中，动词和介词的关系非常密切，已经形成固定的搭配，介词的位置是固定的，不能随意变动。",
          },
          {
            type: "examples",
            items: [
              { en: "She looks after her grandmother. → Her grandmother is looked after (by her).", zh: "她照顾她的奶奶。→ 她的奶奶被（她）照顾。" },
              { en: "A truck is running over a bag. → A bag is being run over (by a truck).", zh: "卡车正辗过一个袋子。→ 一个袋子正被（卡车）辗过。" },
            ],
          },
          {
            type: "list",
            items: [
              "必背·由「动词 + 介词」构成的短语动词：agree on 达成协议、agree to 同意、arrive at / in 到达、call on 号召、depend on 依靠、dream of 梦到、fire at 向……开火、get to 到达、hear of 听说、improve upon 改进、insist on 坚持、laugh at 嘲笑、listen to 听、look after 照看；照顾、look at 看、look down upon 看不起、operate on 给（某人）动手术、pay attention to 注意、run over 辗过、send for 请；召唤、take care of 关心；照顾、talk about 谈论、wait for 等待。",
              "由被动语态形成的动词短语本身即是被动语态的形式，不需再加 by...：be covered with 用……覆盖着、be interested in 对……感兴趣、be made of / from 用……制造的、be surprised at 对……感到惊奇。",
            ],
          },
          {
            type: "text",
            text:
              "5 由情态动词构成的被动语态：含有情态动词的句子变为被动语态时，在情态动词后面直接加上 be 动词即可。肯定句：主语 + 情态动词（can、may、must 等）+ be（原形）+ 过去分词 + ……；否定句：主语 + 情态动词 + not + be + 过去分词 + ……；疑问句：情态动词（Can、May、Must 等）+ 主语 + be + 过去分词 + ……?",
          },
          {
            type: "examples",
            items: [
              { en: "The person must be taken care of by his son.", zh: "这个人一定要由他儿子照顾。" },
              { en: "We can make the strawberries into jam. → The strawberries can be made into jam.", zh: "我们可以把这些草莓做成果酱。→ 这些草莓可以做成果酱。" },
              { en: "You mustn't touch the exhibits in the museum. → The exhibits in the museum mustn't be touched.", zh: "你不可以触摸博物馆里的展览品。→ 博物馆里的展览品不可以被触摸。" },
              { en: "We should show our individuality in our behaviour and studies. → Our individuality should be shown in our behaviour and studies.", zh: "我们应该在我们的行为举止和学习上体现个性。→ 我们的个性应该体现在我们的行为举止和学习上。" },
              { en: "She ought to tidy up her bedroom. → Her bedroom ought to be tidied up.", zh: "她应该整理卧室。→ 她的卧室应该被整理。" },
              { en: "They needn't look after the little child. → The little child needn't be looked after (by them).", zh: "他们不必照看这个小孩。→ 这个小孩不必被（他们）照看。" },
              { en: "Can you see an exhibition about ancient technology? → Can an exhibition about ancient technology be seen?", zh: "你能看到关于古代科技的展览吗？→ 关于古代科技的展览能够被看到吗？" },
              { en: "Dare you catch that hedgehog? → Dare that hedgehog be caught (by you)?", zh: "你敢去抓那只刺猬吗？→ 那只刺猬（你）敢去抓吗？" },
            ],
          },
          {
            type: "tip",
            text:
              "「be going to + 动词原形」句型变为被动语态时，我们把 be going to 看成一个词，就如同情态动词 can 一样，因此它的被动语态应该是「be going to be + 过去分词」。如 He is going to check his email. → His email is going to be checked (by him). / She is going to see a movie this evening. → A movie is going to be seen this evening (by her). / Are you going to wash all these glasses? → Are all these glasses going to be washed (by you)?",
          },
          {
            type: "list",
            items: [
              "常见的情态动词：can、may、must、need、should、dare、ought to。",
              "祈使句的被动语态 1（肯定祈使句）：主动句 V（原形）+ O（宾）→ 被动句 Let + O（原宾语）+ be（原形）+ 过去分词。如 Empty the rubbish bin at once! → Let the rubbish bin be emptied at once!（立刻清空垃圾桶！）",
              "祈使句的被动语态 2（否定祈使句）：主动句 Don't + V（原形）+ O（宾）→ 被动句 Don't let + O（原宾语）+ be（原形）+ 过去分词。如 Don't tell the truth to him. → Don't let the truth be told to him.（别告诉他事情的真相。）",
            ],
          },
        ],
      },
      {
        heading: "六、被动语态的注意事项",
        blocks: [
          {
            type: "text",
            text:
              "1 适用于被动语态的情况：① 不知道或无需知道谁是动作的执行者时，使用被动语态；② 需要突出或强调动作的承受者时，使用被动语态。",
          },
          {
            type: "examples",
            items: [
              { en: "Plato's works are called The Dialogues of Plato.", zh: "柏拉图的著作被称为《对话录》。" },
              { en: "The book was written for Chinese children.", zh: "这本书是为中国儿童编写的。" },
              { en: "Printing was developed greatly at the beginning of the 11th century.", zh: "印刷术在 11 世纪初期有了很大发展。" },
              { en: "Liu Xiang's skill at hurdling was noticed by his coach Sun Haiping.", zh: "刘翔在跨栏赛跑方面的技能被他的教练孙海平注意到了。" },
              { en: "Basketball was invented by an American teacher named James Naismith.", zh: "篮球运动是由一位名叫詹姆斯·奈史密斯的美国老师发明的。" },
            ],
          },
          {
            type: "text",
            text:
              "2 主动语态不能变为被动语态的情况：当宾语是反身代词或当谓语是表状态的及物动词时，主动语态是不能变为被动语态的。① 当宾语是反身代词时，如 The man introduced himself as Mr. Parker.（那个人自我介绍说他是帕克先生。）/ I found myself in the park.（我不知不觉来到公园里。）② 当谓语是表状态的及物动词时，如 Does the pair of new shoes suit you?（那双新鞋你穿着合适吗？）/ We will have a meeting.（我们将开个会。）",
          },
          {
            type: "pitfall",
            text:
              "have 是表状态的及物动词，不能变为被动语态；而如果该句用了 hold，则可变为被动语态：(○) A meeting will be held. / (×) A meeting will be had.",
          },
          {
            type: "text",
            text:
              "3 被动语态与系表结构的区别：「be + 过去分词」可能是被动语态，也可能是系表结构，其主要区别是：被动语态表示以主语为承受者的动作，而系表结构则表示主语的特点或所处的状态。",
          },
          {
            type: "examples",
            items: [
              { en: "The letter was written yesterday.", zh: "信是昨天写的。（动作）" },
              { en: "The letter is written in English.", zh: "这封信是用英文写的。（特点）" },
              { en: "The store was closed at five.", zh: "这个商店 5 点钟关门。（动作）" },
              { en: "The store is closed today.", zh: "这个商店今天不开门。（状态）" },
            ],
          },
          {
            type: "tip",
            text: "为了明确说明该被动语态是表示动作的，可用 get 来代替 be 动词。如 My bike got stolen.（我的自行车被偷了。）（got 代替 was）",
          },
        ],
      },
      {
        heading: "七、易错点（Common Mistakes）与实力测验",
        blocks: [
          {
            type: "pitfall",
            text:
              "陷阱例题 1：A: Mum, can I go out to play basketball? B: Sure. But your homework ______ first.（A. must be finished B. must finish C. will finish D. finish）——主语 your homework 是谓语 finish 的承受者，所以用「情态动词 + be + 过去分词」结构，答案为 A。",
          },
          {
            type: "pitfall",
            text:
              "陷阱例题 2：A: Would you like to go to the movie with me? B: Sorry, I ______ to go out tonight.（A. won't be allowed B. am allowed C. don't allow D. will allow）——be allowed to do sth. 意为「被允许做某事」；一般将来时被动语态的否定结构是 will not be + 过去分词，答案为 A。",
          },
          {
            type: "pitfall",
            text:
              "陷阱例题 3：Mike, you ______ on the phone.（A. is wanted B. want C. are wanting D. are wanted）——主语 you 是谓语 want 的承受者，所以用被动语态，答案为 D。",
          },
          {
            type: "pitfall",
            text:
              "陷阱例题 4：A number of trees ______ around Beijing every year. Our environment is getting better and better.（A. are plant B. are planted C. are planting D. were planted）——由 every year 可知用一般现在时，由主语 a number of trees 是谓语动词的承受者可知用被动语态，答案为 B。",
          },
          {
            type: "list",
            items: [
              "实力测验（P301）题型：1 用括号中动词的适当形式填空（10 题）；2 变换句型。",
              "变换句型考查点：Miss Ding teaches us English. → English ______ ______ by Miss Ding.；We saw a stranger enter the room. → A stranger ______ ______ ______ ______ the room by us.（感官动词被动要还原 to）；When did they make these cars? → When ______ these cars made?；My uncle gave me some English books. → Some English books ______ ______ to me by my uncle. / I ______ ______ some English books by my uncle.；People called him 「clever」 Hans. → He ______ ______ 「clever」 Hans.",
            ],
          },
        ],
      },
    ],
    extras: {
      forms: [
        { name: "现在进行时被动", pattern: "am / is / are + being + 过去分词", note: "A new railway is being built." },
        { name: "过去进行时被动", pattern: "was / were + being + 过去分词", note: "The roads were being widened then." },
        { name: "现在完成时被动", pattern: "have / has + been + 过去分词", note: "These plants have been grown without the use of any chemicals." },
        { name: "过去完成时被动", pattern: "had been + 过去分词", note: "A new hotel had been built when I got there." },
        { name: "将来完成时被动", pattern: "will / shall have been + 过去分词", note: "Many new stadiums and gyms will have been built in London by next year." },
        { name: "过去将来时被动", pattern: "would / should be + 过去分词", note: "Toby said the new hotel would be built in six months." },
        { name: "双宾语被动 (SVOO)", pattern: "The guard was shown the pass. / The pass was shown to the guard.", note: "用直接宾语作主语时，保留的间接宾语前要加 to / for / of 等介词。" },
        { name: "be going to 被动", pattern: "be going to be + 过去分词", note: "His email is going to be checked (by him)." },
        { name: "祈使句被动", pattern: "Let + 原宾语 + be + 过去分词", note: "Empty the rubbish bin at once! → Let the rubbish bin be emptied at once!" },
      ],
      points: [
        {
          title: "双宾语动词的两种被动语态",
          desc: "间接宾语作被动语态主语时，直接宾语保留在后面；直接宾语作主语时，保留下来的间接宾语前要加 to、for、of 等介词。有些动词习惯上只用某一种改写方式。",
          good: [
            "The guard was shown the pass (by Lenin).",
            "The pass was shown to the guard (by Lenin).",
            "A skirt was sewed for me by my aunt.（符合习惯）",
            "James was refused a passport by the authorities.（符合习惯）",
          ],
          bad: [
            "She was written a letter by him.（不合习惯）",
            "The invitation was refused him by me.（不合习惯）",
          ],
        },
        {
          title: "含宾语补足语的句子变被动：补足语变主语补足语",
          desc: "宾语补足语放在过去分词之后，位置不变但功能变成主语补足语；感官动词和使役动词后原本省略的 to 要还原（let 例外）。",
          good: [
            "We call her a beauty. → She is called a beauty (by us).",
            "He saw a thief steal something from the room. → A thief was seen to steal something from the room.",
          ],
          bad: [],
        },
        {
          title: "短语动词的被动语态：介词不能丢",
          desc: "不及物动词加介词或副词后构成短语动词，相当于及物动词，可以有被动语态；介词位置固定，被动语态中不能省略。",
          good: [
            "She looks after her grandmother. → Her grandmother is looked after (by her).",
            "A truck is running over a bag. → A bag is being run over (by a truck).",
          ],
          bad: ["Her grandmother is looked after.（介词 after 不能丢，否则意思完全改变）"],
        },
        {
          title: "祈使句的被动语态",
          desc: "肯定祈使句用 Let + 原宾语 + be + 过去分词；否定祈使句用 Don't let + 原宾语 + be + 过去分词。",
          good: [
            "Empty the rubbish bin at once! → Let the rubbish bin be emptied at once!",
            "Don't tell the truth to him. → Don't let the truth be told to him.",
          ],
          bad: [],
        },
      ],
      contrasts: [
        {
          title: "被动语态 vs 系表结构",
          head: ["结构", "含义", "例子"],
          rows: [
            ["被动语态", "表示以主语为承受者的动作", "The letter was written yesterday. / The store was closed at five."],
            ["系表结构", "表示主语的特点或所处的状态", "The letter is written in English. / The store is closed today."],
          ],
        },
      ],
      pitfalls: [
        "感官动词（see、watch、look at、observe、listen to、hear、feel 等）和使役动词（make、have 等）变被动后，主语补足语前一律加 to；但含 let 的句子变被动时 to 可以省略。",
        "宾语是反身代词（introduce oneself、find oneself）或谓语是表状态的及物动词（have、suit）时，主动语态不能变为被动语态。",
        "双宾语动词变被动时有习惯用法限制：「She was written a letter by him.」「The invitation was refused him by me.」都不合习惯。",
        "由被动语态形成的动词短语（be covered with、be interested in、be made of / from、be surprised at）本身就是被动形式，不需再加 by...。",
      ],
      examTips: [
        "先判断主语是动作的执行者还是承受者：物作主语且动作由人发出，基本就是被动。",
        "看到 homework、room 等作主语且需要「完成」，用「情态动词 + be + 过去分词」，如 must be finished。",
        "be allowed to do sth. 意为「被允许做某事」；一般将来时被动语态的否定结构是 will not be + 过去分词。",
        "每次应/每年发生（every year）提示一般现在时；a number of trees 作主语且是动作承受者时用 are planted。",
      ],
      memoryCard: [
        "被动 = be + 过去分词；时态看 be，动词用分词。",
        "双宾语被动：人作主语直接跟过去分词，物作主语要加 to / for。",
        "感官、使役动词变被动要还 to（let 例外）；短语动词的介词不能丢。",
      ],
    },
  },
];
