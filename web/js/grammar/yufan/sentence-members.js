// web/js/grammar/yufan/sentence-members.js
// 来源：yufan/句子成分和基本句型（第 18 章，15 张教材扫描图）
// 契约见同目录 README.md；本文件为纯数据 ES Module。

export default [
  {
    topicId: "g-sentence-members",
    newTopic: true,
    title: "句子的成分和基本句型",
    sourceDirs: ["yufan/句子成分和基本句型"],
    imagesRead: 15,
    category: "句法",
    difficulty: 3,
    summary:
      "句子由主语、谓语、表语、宾语、宾语补足语、定语、状语构成；按这些成分的组合方式分为 S+V、S+V+O、S+V+P、S+V+IO+DO、S+V+O+OC 五种基本句型。",
    intro:
      "本章先逐个讲清七种句子成分，再把它们组合成五种基本句型。判断宾语后面是“双宾语”还是“复合宾语”，就看宾语与后一个成分能否构成逻辑上的主谓关系。",
    forms: [
      { name: "S + V", pattern: "主语 + 谓语（不及物动词）（+ 状语）", note: "Birds fly. / He runs in the park." },
      { name: "S + V + O", pattern: "主语 + 谓语（及物动词）+ 宾语（+ 状语）", note: "She likes English. / I bought a dictionary yesterday." },
      { name: "S + V + P", pattern: "主语 + 系动词 + 表语（+ 状语）", note: "They are honest. / It gets dark." },
      { name: "S + V + IO + DO", pattern: "主语 + 谓语（及物动词）+ 间接宾语 + 直接宾语（+ 状语）", note: "He gave Tom a present." },
      { name: "S + V + O + OC", pattern: "主语 + 谓语（及物动词）+ 宾语 + 宾语补足语（+ 状语）", note: "They made her happy. / I saw her dance." },
    ],
    points: [
      {
        title: "不定式作主语，常用 it 作形式主语",
        desc: "不定式（短语）作主语时，句子常用形式主语 it 句型，真正的主语放到后面。",
        good: ["To teach them English is my job.", "It is my job to teach them English."],
        bad: ["To teach them English is my job. 不能说成 It is my job teach them English.（it 作形式主语时，真正主语的不定式仍要带 to）"],
      },
      {
        title: "谓语和主语在人称和数上必须一致",
        desc: "谓语是说明主语“做什么、是什么、怎么样”的成分，位置通常在主语之后；助动词、情态动词要与实义动词一起构成谓语。",
        good: ["David's hobby is writing.", "We have finished the work.", "He can speak English."],
        bad: ["We has finished the work.（谓语与主语的人称和数不一致）"],
      },
      {
        title: "表语位于系动词之后",
        desc: "名词、代词、形容词、副词、介词短语、不定式等都可以作表语。",
        good: ["We are friends.", "You look younger than before.", "The two countries are at war now."],
        bad: ["We are friends. 不能说成 We are friend.（系动词后必须接表语，表语与主语在数上要一致）"],
      },
      {
        title: "“宾语 + 宾语补足语”是复合宾语",
        desc: "只有宾语还不能表达完整意思时，要在宾语后加宾语补足语；名词、形容词、副词、介词短语、不定式、现在分词、过去分词都能作宾补。",
        good: ["Leave the door open.", "Make yourself at home.", "The boss kept him working all day."],
        bad: ["Leave the door open. 不能说成 Leave the door opens.（宾补用形容词，不随宾语变位）"],
      },
      {
        title: "用逻辑主谓关系区分双宾语和复合宾语",
        desc: "宾语与后一成分能构成逻辑上的主谓关系，该成分是宾补（复合宾语）；不能构成，则是双宾语。",
        good: ["He calls me Tom.（me 与 Tom 可理解为“我是汤姆”→ 复合宾语）", "She bought me a pen.（me 与 a pen 不构成主谓关系 → 双宾语）"],
        bad: ["He calls me Tom. 不能当成双宾语来分析（me 与 Tom 是逻辑上的主谓关系）。"],
      },
      {
        title: "感官、使役动词后作宾补的不定式省 to，变被动要还原",
        desc: "see / watch / look at / listen to / hear / feel / let / make / have（使得）后的宾补若由不定式担任，则省去 to；变被动语态时 to 要还原。",
        good: ["He saw the pianist play the piano.", "The pianist was seen to play the piano."],
        bad: ["I saw her to enter the shopping mall.（see 后作宾补的不定式要省略 to）"],
      },
    ],
    pitfalls: [
      "双宾语与复合宾语容易混淆：先试加“be”看宾语和后面成分能否构成逻辑主谓关系。",
      "see / watch / hear / make / let 等后的宾补不定式省略 to，但句变为被动语态时 to 必须还原。",
      "形容词作定语修饰由 every-、some-、any-、no- 以及 -thing、-body、-one 构成的合成词时须后置：anyone famous。",
      "不定式修饰名词时一般后置：I have something to do. / She is a nice person to work with.",
      "不及物动词后面不能直接带宾语，但加上介词后可相当于及物动词：You must listen to me.",
    ],
    examTips: [
      "判断句型先找谓语动词：不及物→S+V；及物后带一个宾语→S+V+O；系动词→S+V+P。",
      "宾语后还有一个名词/形容词/分词时，先判断是双宾语还是复合宾语（逻辑主谓关系）。",
      "非谓语动词作定语、宾补、状语是中考常见考点：注意主动/被动关系，以及不定式是否省 to。",
    ],
    memoryCard: [
      "五种句型：S+V、S+V+O、S+V+P、S+V+IO+DO、S+V+O+OC。",
      "双宾语看“给谁/为谁”，复合宾语看“逻辑主谓”。",
      "感官使役省 to，变被动要还原。",
    ],
    sections: [
      {
        heading: "一、句子与句子成分",
        blocks: [
          {
            type: "text",
            text:
              "句子是由词按照一定的语法结构组成的，是能表达一个完整概念的语言单位。句子开头的第一个字母必须大写，结尾要有句号“.”、问号“?”或感叹号“!”。组成句子的各个部分叫做句子的成分。句子成分主要包括：主语、谓语、表语、宾语、宾语补足语、定语和状语。",
          },
          {
            type: "text",
            text:
              "组成句子的各个部分叫做句子的成分。主语和谓语是句子的主体部分，表语、宾语和补语是连带成分，定语和状语是附加成分。句子依其各成分的组合方式可分为五种句型，这五种句型基本涵盖了英语中出现的所有句子形式。",
          },
          {
            type: "examples",
            items: [
              { en: "1. Birds fly.（主语 + 谓语）", zh: "鸟飞。" },
              { en: "2. She likes English.（主语 + 谓语 + 宾语）", zh: "她喜欢英语。" },
              { en: "3. They are honest.（主语 + 系动词 + 表语）", zh: "他们是诚实的。" },
              { en: "4. He gave Tom a present.（主语 + 谓语 + 间接宾语 + 直接宾语）", zh: "他给了汤姆一件礼物。" },
              { en: "5. I saw her dance.（主语 + 谓语 + 宾语 + 宾语补足语）", zh: "我看见她跳舞了。" },
            ],
          },
          {
            type: "list",
            items: [
              "S: Subject（主语）",
              "V: Verb（动词）",
              "O: Object（宾语）",
              "P: Predicative（表语）",
              "IO: Indirect Object（间接宾语，简称间宾）",
              "DO: Direct Object（直接宾语，简称直宾）",
              "OC: Object Complement（宾语补足语，简称宾补）",
            ],
          },
          {
            type: "tip",
            text: "章首页名人名言（M. A. Stodart）：All that you do, do with your might; things done by halves, are never done right. —— 凡事需尽力而为；半途而废者一事无成。",
          },
        ],
      },
      {
        heading: "二、主语、谓语、表语",
        blocks: [
          {
            type: "text",
            text:
              "主语是在句子中说明全句中心主题的部分，一般由名词、代词、不定式或相当于名词的词或短语来充当，一般位于句首。谓语说明主语“做什么”“是什么”或“怎么样”，是对主语的叙述，谓语和主语在人称和数两方面必须一致，通常在主语后面。表语说明主语“是什么”或者“怎么样”，一般由名词、代词、形容词、副词、介词短语、不定式、从句等担任，位于系动词之后。",
          },
          {
            type: "examples",
            items: [
              { en: "David is a musician.", zh: "戴维是一位音乐家。（名词作主语）" },
              { en: "We study in No. 1 Middle School.", zh: "我们在一中学习。（代词作主语）" },
              { en: "Swimming is good for you.", zh: "游泳对你有好处。（动名词作主语）" },
              { en: "To teach them English is my job.", zh: "教他们英语是我的工作。（不定式作主语）" },
              { en: "David's hobby is writing.", zh: "戴维的业余爱好是写作。（系表结构作谓语）" },
              { en: "We study hard.", zh: "我们努力学习。（实义动词作谓语）" },
              { en: "We have finished the work.", zh: "我们已经完成了这项工作。（助动词和实义动词一起作谓语）" },
              { en: "He can speak English.", zh: "他会说英语。（情态动词和实义动词一起作谓语）" },
              { en: "We are friends.", zh: "我们是朋友。（名词作表语）" },
              { en: "You look younger than before.", zh: "你看起来比以前年轻。（形容词作表语）" },
              { en: "He isn't in.", zh: "他不在。（副词作表语）" },
              { en: "The two countries are at war now.", zh: "这两个国家现在正在交战。（介词短语作表语）" },
              { en: "My job is to teach them English.", zh: "我的工作是教他们英语。（不定式短语作表语）" },
            ],
          },
          {
            type: "tip",
            text: "不定式作主语时常用形式主语 it 句型，“To teach them English is my job.”可改为“It is my job to teach them English.”。",
          },
        ],
      },
      {
        heading: "三、宾语",
        blocks: [
          {
            type: "text",
            text:
              "宾语是动作、行为的对象，一般由名词、代词、数词、不定式、从句或相当于名词的词、短语来担任，它和及物动词一起说明主语做什么。宾语常常位于谓语之后。宾语分直接宾语和间接宾语，合称双宾语。",
          },
          {
            type: "examples",
            items: [
              { en: "She is playing the piano now.", zh: "现在她正在弹钢琴。（名词作宾语）" },
              { en: "He often helps me.", zh: "他常常帮助我。（代词作宾语）" },
              { en: "We enjoy living in China.", zh: "我们喜欢住在中国。（动名词作宾语）" },
              { en: "I started to talk with other students.", zh: "我开始和其他学生交谈。（不定式作宾语）" },
              { en: "I know him.", zh: "我了解他。（代词作宾语）" },
              { en: "They want to go.", zh: "他们想走。（不定式作宾语）" },
              { en: "He stopped writing.", zh: "他停下了笔。（动名词作宾语）" },
            ],
          },
          {
            type: "tip",
            text: "“疑问词 + 不定式”可作直接宾语：He taught me how to read the word. / She asked me which way to go. / I told him what to do. / He asked me why to sing this song.",
          },
        ],
      },
      {
        heading: "四、宾语补足语（复合宾语）",
        blocks: [
          {
            type: "text",
            text:
              "在英语中，有些句子里只有宾语并不能表达完整的意思，还必须在宾语后面加上宾语补足语才能表达完整的意思。我们把“宾语 + 宾语补足语”称为复合宾语，它表达的意思相当于一个句子。名词、形容词、副词、介词短语、不定式、现在分词、过去分词都可以作宾语补足语，宾语补足语通常位于宾语之后。",
          },
          {
            type: "examples",
            items: [
              { en: "If you let me go, I'll make you king.", zh: "如果你放了我，我就让你当国王。（名词作宾补）" },
              { en: "Leave the door open.", zh: "让门开着吧。（形容词作宾补）" },
              { en: "We found Li Ming out when we arrived.", zh: "我们到达时发现李明不在家。（副词作宾补）" },
              { en: "Make yourself at home.", zh: "请随便，不要拘束。（介词短语作宾补）" },
              { en: "The manager asked him to wait.", zh: "经理要他等。（不定式作宾补）" },
              { en: "I saw her enter the shopping mall.", zh: "我看见她进了购物中心。（不定式作宾补，省略 to）" },
              { en: "The boss kept him working all day.", zh: "老板让他整天干活。（现在分词作宾补）" },
              { en: "Yesterday he got his leg broken.", zh: "昨天他把腿弄断了。（过去分词作宾补）" },
              { en: "They made her happy.", zh: "他们使她感觉幸福。" },
              { en: "He left the window open.", zh: "他让这个窗户开着。" },
              { en: "I found the movie interesting.", zh: "我觉得这部电影很有意思。" },
              { en: "I will make you captain.", zh: "我将让你当船长。（名词作宾补）" },
            ],
          },
          {
            type: "list",
            items: ["常跟复合宾语的动词有：call、name、make、think、find、leave 等。"],
          },
          {
            type: "pitfall",
            text: "在 see、watch、look at、listen to、hear、feel、let、make / have（使得）这些动词后的宾语补足语如果由不定式担当，则省去 to；但变为被动语态时，to 要还原：He saw the pianist play the piano. → The pianist was seen to play the piano.",
          },
          {
            type: "tip",
            text: "“leave + 名词 + 形容词”意为“听任……，使……仍处于某种状态之中”：He will never leave the work unfinished.（他从不半途而废。）",
          },
        ],
      },
      {
        heading: "五、状语与定语",
        blocks: [
          {
            type: "text",
            text:
              "状语用来修饰动词、形容词或副词，表示行为发生的时间、地点、目的、方式、原因、程度等意义，一般由副词、介词短语、不定式、从句等担任，一般放在句末，但有时可以放在句首、句中。定语用来修饰名词或代词，形容词、副词、代词、数词、名词或名词所有格、介词短语、不定式、从句等都可以担任定语；因为定语是修饰名词或代词的，而名词和代词可以作主语、表语和宾语，所以定语的位置很灵活。",
          },
          {
            type: "examples",
            items: [
              { en: "He did the work carefully.", zh: "他认真地做这项工作。（副词作方式状语）" },
              { en: "They want to see her very badly.", zh: "他们很想见到她。（副词作程度状语）" },
              { en: "He is playing football happily.", zh: "他高兴地踢着足球。（副词作状语）" },
              { en: "Without his help, we couldn't work out the problem in time.", zh: "如果没有他的帮助，我们不可能及时解决这个问题。（介词短语作条件状语）" },
              { en: "(In order) to catch up with my classmates, I must study harder.", zh: "为了赶上我的同班同学，我必须更努力地学习。（不定式作目的状语）" },
              { en: "The black bike is mine.", zh: "这辆黑色的自行车是我的。（形容词作定语）" },
              { en: "Have you ever met anyone famous?", zh: "你曾经遇到过名人吗？（形容词作后置定语）" },
              { en: "They made paper flowers.", zh: "他们制作了纸花。（名词作定语）" },
              { en: "The boys in the room are in Class Three, Grade One.", zh: "房间里的男孩们是一年级三班的。（介词短语作定语）" },
              { en: "I have something to do.", zh: "我还有一些事要去做。（不定式作后置定语）" },
              { en: "She bought three books.", zh: "她买了三本书。（数词作定语）" },
            ],
          },
          {
            type: "tip",
            text: "状语的位置：副词作状语时位置较灵活，可置于句首、句末或句中；介词短语作状语时多置于句首或句末；不定式作状语时多置于句末，但为加强语气、突出目的（尤其 in order to do）可放句首。",
          },
          {
            type: "tip",
            text: "当形容词修饰由 every-、some-、any-、no- 以及与 -thing、-body、-one 构成的合成词时须后置。不定式修饰名词时一般放在名词后面作后置定语：She is a nice person to work with.",
          },
        ],
      },
      {
        heading: "六、五种基本句型速查",
        blocks: [
          {
            type: "table",
            head: ["种类", "句型", "主语 S", "谓语动词 V", "表语 P", "宾语 O", "宾补 OC"],
            rows: [
              ["第1种", "S + V", "We", "work.（不及物）", "", "", ""],
              ["第2种", "S + V + O", "He", "plays（及物）", "", "the piano.", ""],
              ["第3种", "S + V + P", "We", "are（系动词）", "students.", "", ""],
              ["第4种", "S + V + IO + DO", "She", "gave（及物）", "", "me a pen.", ""],
              ["第5种", "S + V + O + OC", "He", "made（及物）", "", "the boy", "laugh."],
            ],
          },
          {
            type: "text",
            text:
              "第 1 种 S + V：此句型中“主语 + 不及物动词”构成句子的主体部分。不及物动词后面不能直接带宾语，但是可以有状语来修饰（如 He runs in the park. 中的 in the park 是地点状语）。",
          },
          {
            type: "examples",
            items: [
              { en: "Birds fly.", zh: "鸟飞。（fly 是不及物动词）" },
              { en: "Class begins.", zh: "开始上课。（begin 是不及物动词）" },
              { en: "He runs in the park.", zh: "他在公园里跑步。" },
              { en: "We begin our class at 8.", zh: "我们 8 点钟开始上课。（begin 也可作及物动词）" },
            ],
          },
          {
            type: "list",
            items: [
              "一般只能作不及物动词的词：arrive 到达、come 来、go 去、laugh 笑、sleep 睡觉、stay 停留/留下、swim 游泳、walk 步行、work 工作、happen / take place 发生。",
            ],
          },
          {
            type: "text",
            text:
              "第 2 种 S + V + O：可以直接带宾语的动词是及物动词，可作宾语的有名词、代词、不定式、动名词等。有些不及物动词后面加上介词就相当于一个及物动词，后面就可以跟宾语了，如 You must listen to me.（listen 是不及物动词，但加 to 之后相当于一个及物动词。）",
          },
          {
            type: "examples",
            items: [
              { en: "She likes English.", zh: "她喜欢英语。（名词作宾语）" },
              { en: "He made a speech in the conference room.", zh: "他在会议室发表了演讲。" },
              { en: "I bought a dictionary yesterday.", zh: "我昨天买了一本字典。" },
            ],
          },
          {
            type: "text",
            text:
              "第 3 种 S + V + P：be 动词和 become 是英语中常见的系动词，后面必须接表语，才能用来说明主语，表示“……是……”“……变成……”等意思。表语通常是名词或形容词等。除 be 和 become 外，还有一些行为动词在表示状态存在或状态变化时也可以作系动词：keep 保持、feel 觉得、look 看起来、smell 闻起来、sound 听起来、taste 尝起来、grow / get / go / turn 变得。",
          },
          {
            type: "examples",
            items: [
              { en: "They are honest.", zh: "他们是诚实的。" },
              { en: "He became a scientist.", zh: "他成为了一位科学家。" },
              { en: "It gets dark.", zh: "天变黑了。" },
              { en: "My sister is out now.", zh: "我姐姐现在出去了。" },
            ],
          },
        ],
      },
      {
        heading: "七、双宾语（S + V + IO + DO）详解",
        blocks: [
          {
            type: "text",
            text:
              "有些动词除了带直接宾语外，还要带一个间接宾语。直接宾语是及物动词的直接对象；间接宾语是及物动词的动作所及的人或物，指动作是对谁做的、为谁做的，所以只能由名词或宾格代词担当。间接宾语通常位于直接宾语之前：主语 + 谓语 + 间接宾语 + 直接宾语。当直接宾语是人称代词、间接宾语是名词时，或两个宾语都是人称代词时，间接宾语位于直接宾语之后，这时必须在间接宾语前加 to 或 for，即：主语 + 谓语 + 直接宾语 + to / for + 间接宾语。",
          },
          {
            type: "examples",
            items: [
              { en: "He gave Tom a present yesterday.", zh: "昨天他给了汤姆一件礼物。" },
              { en: "Give me the book.", zh: "把那本书给我。" },
              { en: "Give it to me.", zh: "把它给我。" },
              { en: "I passed it to my mother.", zh: "我把它递给了我妈妈。（直宾是人称代词，间宾是名词）" },
              { en: "She threw them to me.", zh: "她把它们扔给了我。（直宾和间宾都是人称代词）" },
              { en: "I found spare tickets for him.", zh: "我为他找到了多余的票。" },
              { en: "Give the book to me.", zh: "把这本书给我。（为了强调间接宾语）" },
              { en: "He gave me a pen. = He gave a pen to me.", zh: "他给了我一支钢笔。" },
              { en: "He will buy me some books. = He will buy some books for me.", zh: "他将给我买一些书。" },
              { en: "She made me a cake. = She made a cake for me.", zh: "她给我做了一个蛋糕。" },
            ],
          },
          {
            type: "text",
            text:
              "常带双宾语的动词分为三类：A 类动词构成句型“主语 + 谓语 + 直接宾语 + to + 间接宾语”；B 类动词构成句型“主语 + 谓语 + 直接宾语 + for + 间接宾语”；C 类动词构成句型“主语 + 谓语 + 直接宾语 + to / for + 间接宾语”。",
          },
          {
            type: "list",
            items: [
              "A 类（用 to）：post 邮给……、show 给……看、return 把……还给……、sell 卖、send 寄出/派遣、write 给……写信、take 拿/取、bring 带……给某人、throw 扔、feed 喂、read 读、promise 答应、offer 提供、pass 递给……、refuse 拒绝、teach 教、hand 交给……、lend 借给……、give 给……、tell 告诉。",
              "B 类（用 for）：cook 烹调、buy 买、choose 选择、pick 捡起、get 得到、find 为……找到、save 为……节约、order 为……订购、book 为……预订、make 生产/制造、leave 留下/剩下、call 为……叫、fetch 为/替……取来。",
              "C 类（用 to 或 for）：sing 为某人而唱歌、play 为某人而演奏。",
            ],
          },
          {
            type: "tip",
            text: "由 to 或 for 引起的短语意思上没什么差别：A 类动词后的间接宾语基本上都可以换为由 to 引起的短语；B 类动词后的间接宾语一般都可以换为由 for 引起的短语。",
          },
        ],
      },
      {
        heading: "八、句型辨析与常见错误",
        blocks: [
          {
            type: "examples",
            items: [
              { en: "He gave me a book.", zh: "他给了我一本书。（间宾 + 直宾 = 双宾语）" },
              { en: "He calls me Tom.", zh: "他叫我汤姆。（宾语 + 宾补 = 复合宾语）" },
              { en: "He made the boy laugh.", zh: "他使男孩笑了。（the boy 与 laugh 是逻辑主谓关系 → laugh 是宾补）" },
              { en: "She bought me a pen.", zh: "她给我买了一支笔。（me 与 a pen 不能构成逻辑主谓关系 → 双宾语）" },
            ],
          },
          {
            type: "text",
            text:
              "例“He calls me Tom.”中的宾语 me（我）和宾语补足语 Tom（汤姆）可以形成逻辑上的主谓关系，即“我是汤姆”；而“He gave me a book.”中的间接宾语 me（我）和直接宾语 a book（一本书）不存在逻辑上的主谓关系，不能想象为“我是一本书”。凭这一点就可以把双宾语和复合宾语区分开。",
          },
          {
            type: "examples",
            items: [
              {
                en:
                  "Common Mistakes 1: The murderer was brought in, with his hands ______ behind his back. A. being tied B. having tied C. to be tied D. tied",
                zh: "杀人犯被带了进来，手被绑在背后。答案 D。（“with + 宾语 + 宾语补足语”结构作伴随状语；“手”与“绑”是动宾关系，用过去分词。）",
              },
              {
                en:
                  "Common Mistakes 2: If the building project ______ by the end of this month is delayed, the construction company ______ fined. A. will be completed; is to be B. to be completed; will be C. being completed; will be D. completed; was",
                zh: "楼房建筑项目计划在本月底完成，如果延迟了，建筑公司将要被罚款。答案 B。（第一个空用不定式作后置定语，第二个空用将来时。）",
              },
              {
                en:
                  "Common Mistakes 3: He loves parties. He is always the first ______ and the last ______. A. to come; to leave B. coming; leaving C. comes; leaves D. come; leave",
                zh: "他喜欢参加晚会，总是第一个来，最后一个走。答案 A。（不定式短语作定语，修饰 the first 和 the last。）",
              },
              {
                en:
                  "Common Mistakes 4: You will see this product ______ wherever you go. A. to be advertised B. advertised C. advertise D. advertising",
                zh: "无论你到哪里，都能发现这个产品在做广告。答案 B。（非谓语动词作宾补；“产品”是动作的承受者，用过去分词。）",
              },
            ],
          },
        ],
      },
      {
        heading: "九、实力测验（原题摘录，答案未在图片中给出）",
        blocks: [
          {
            type: "list",
            items: [
              "一、选择填空 1. A: Daniel, try this strawberry cake. B: It ______ delicious. I'd like to have some more.（A. smells B. feels C. tastes D. looks）",
              "2. A: Can you give me some ______ on learning English well? B: Sure. Watching English programmes is a good way.（A. news B. advice C. decisions D. messages）",
              "3. The teachers used to ______ key points on the blackboard, but now they are getting used to ______ them through PPTs.（A. write; showing B. writing; show C. write; show）",
              "4. It's reported that China plans ______ astronauts to the moon before 2030.（A. send B. sending C. to send）",
              "5. A: How amazing ChatGPT is! B: Yes. The new invention makes it quite ______ for people to write papers and stories.（A. late B. simple C. natural D. difficult）",
              "二、用所给的单词组成句子 1. to, the, box, I, want, take, to, room, heavy, the",
              "2. look, things, the, after, boys, their, must",
              "3. here, all, are, you",
              "4. today, who, duty, is, on",
              "5. Miss, them, 3 years ago, Wang, taught, Japanese",
              "6. is, rice, bag, in, there, much, the",
              "三、根据中文提示完成句子 1. Have you ever been to ______（最远的小岛）?",
              "2. We must ______ our classroom ______（保持清洁）.",
              "3. They ______ and ______ ______（每两小时，必须坐下休息）two hours.",
              "4. After work he always ______（感到有点儿累）.",
              "5. There is ______（有点儿毛病）with Linda's cat's eyes.",
              "6. I can see ______（没有异常之物）in the tree.",
              "7. Mr Fang is ______（去拜访）his aunt.",
              "四、下列句子均有错误，请将正确的写在横线上 1. Look! The boys play football on the playground.",
              "2. Send emails through the Internet is the basic skill you should master.",
              "3. The students are interesting in learning drawing.",
              "4. It took me some times to work out these physics problems.",
              "5. It's time for supper now. Let's stop to work now.",
              "6. How many did you pay for the colour TV set?",
              "7. What do your father want you to do when you grow up?",
              "8. There are some tea left at the bottom of the cup.",
            ],
          },
        ],
      },
    ],
    notes: [
      "图片 微信图片_20260927152929_534_66.jpg 为第 18 章章首页（名人名言页），无语法正文，已按图片内容记录其名言与译文。",
      "其余 14 张图片（535—548）内容清晰，均可逐字转写；无不可识别图片。",
    ],
  },
];
