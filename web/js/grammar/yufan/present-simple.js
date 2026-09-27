// web/js/grammar/yufan/present-simple.js
// 来源：yufan/动词/动词时态/一般现在时（15 张教材扫描图片）→ 第11章 动词的一般现在时
export default [
  {
    topicId: "g-present-simple",
    newTopic: false,
    title: "一般现在时",
    sourceDirs: ["yufan/动词/动词时态/一般现在时"],
    imagesRead: 15,
    summary:
      "第11章把一般现在时拆成 be 动词与行为动词两套句式：be 动词按主语的人称和数选用 am/is/are，行为动词除第三人称单数加 -s/-es 外都用原形；否定与疑问分别由 be 动词或 do/does 承担。",
    intro:
      "本章先讲 be 动词的一般现在时（肯定句、否定句、一般疑问句、特殊疑问句、there be 句型），再讲行为动词的一般现在时（三单变化、否定与疑问句式），最后归纳一般现在时的五种基本用法与中考失分陷阱。",
    sections: [
      {
        heading: "一、本章导览：be 动词与行为动词是两套句式",
        blocks: [
          {
            type: "text",
            text: "本章把一般现在时分为两大部分：1 be 动词的一般现在时；2 行为动词的一般现在时。",
          },
          {
            type: "text",
            text: "be 动词是系动词的一种，表示“是”。现在时有 am、is、are 三种形式，其原形动词都是 be，所以把它们称为 be 动词。行为动词又称实义动词，其意义完整，可独立用作谓语，如 go（走）、make（做）等。",
          },
          {
            type: "text",
            text: "由于 be 动词和行为动词在构成疑问句和否定句时的句型并不相同，因此本章分别详细说明这两者的区别。",
          },
          {
            type: "examples",
            items: [
              { en: "She is my classmate.", zh: "她是我的同学。" },
              { en: "He speaks English.", zh: "他说英语。" },
            ],
          },
          {
            type: "tip",
            text: "be 动词之后可接不同词性的词（名词、形容词、副词、介词短语）；be 动词除了有“是”之意，还表示“在”。",
          },
        ],
      },
      {
        heading: "二、be 动词的一般现在时",
        blocks: [
          {
            type: "text",
            text: "be 动词常与名词、形容词或其他词类一起表示主语的性质、状态、身份、特点等。be 动词的一般现在时有 am、is、are 三种形式，由主语的人称和数决定用哪一种。",
          },
          {
            type: "table",
            head: ["人称", "数", "主语", "be 动词"],
            rows: [
              ["第一人称", "单数", "I（我）", "am"],
              ["第一人称", "复数", "we（我们）", "are"],
              ["第二人称", "单数", "you（你）", "are"],
              ["第二人称", "复数", "you（你们）", "are"],
              ["第三人称", "单数（男性）", "he（他）", "is"],
              ["第三人称", "单数（女性）", "she（她）", "is"],
              ["第三人称", "单数（其他）", "it（它）", "is"],
              ["第三人称", "复数", "they（他/她/它们）", "are"],
            ],
          },
          {
            type: "text",
            text: "1 be 动词一般现在时的肯定句：主语 + be 动词的一般现在时（am/is/are）+ ……",
          },
          {
            type: "examples",
            items: [
              { en: "I am thirteen years old.", zh: "我13岁。" },
              { en: "Mary is a student.", zh: "玛丽是一名学生。" },
              { en: "We are classmates.", zh: "我们是同班同学。" },
              { en: "I am a teacher.", zh: "我是一个老师。" },
              { en: "Sophia is young.", zh: "索菲娅很年轻。" },
              { en: "Nora is out.", zh: "诺拉不在家。" },
              { en: "They are from China.", zh: "他们来自中国。" },
            ],
          },
          {
            type: "text",
            text: "2 be 动词一般现在时的否定句：主语 + be 动词的一般现在时（am/is/are）+ not + ……",
          },
          {
            type: "examples",
            items: [
              { en: "I am not outgoing.", zh: "我性格内向。" },
              { en: "It is not a seed.", zh: "它不是一颗种子。" },
              { en: "You are not smart.", zh: "你不是很聪明。" },
            ],
          },
          {
            type: "list",
            items: [
              "I am not... 缩写为 I'm not...（没有 I amn't 这种形式）。",
              "is not 缩写为 isn't，读作 [ˈɪznt]。",
              "are not 缩写为 aren't，读作 [ɑːnt]。",
              "缩写记号要放在被省略的词的上方。",
            ],
          },
          {
            type: "text",
            text: "3 be 动词一般现在时的一般疑问句：Be 动词的一般现在时（Am/Is/Are）+ 主语 + ……?",
          },
          {
            type: "examples",
            items: [
              { en: "Am I on the guest list?", zh: "我在客人名单里吗？" },
              { en: "Is his father an English teacher?", zh: "他父亲是一位英语老师吗？" },
              { en: "Is your key on the table? — Yes, it is.", zh: "你的钥匙在桌子上吗？—— 是的，它在。" },
              { en: "Are you an Australian? — No, I'm not.", zh: "你是澳大利亚人吗？—— 不，我不是。" },
            ],
          },
          {
            type: "text",
            text: "肯定回答：Yes, 主语 + be 动词.；否定回答：No, 主语 + be 动词 + not.",
          },
          {
            type: "tip",
            text: "回答一般疑问句时，主语要用人称代词代替（Is your key...? → Yes, it is.）；问句中的 you 回答时改为 I（Are you...? → No, I'm not.）。",
          },
          {
            type: "text",
            text: "4 be 动词一般现在时的特殊疑问句：疑问词 + be 动词 + 主语 + ……? 回答时不能用 yes 或 no，be 动词要视主语的情况决定用 is 或 are。",
          },
          {
            type: "examples",
            items: [
              { en: "What is the date today?", zh: "今天几月几号？" },
              { en: "Where are you from?", zh: "你来自哪里？" },
              { en: "Who is he?", zh: "他是谁？" },
              { en: "What is the time now? — It is seven o'clock.", zh: "现在几点了？—— 7点钟了。" },
            ],
          },
        ],
      },
      {
        heading: "三、there be 句型",
        blocks: [
          {
            type: "text",
            text: "there be 句型表示“某地（场所）有/存在某物”，它的基本用法见下表。",
          },
          {
            type: "table",
            head: ["主语", "句型"],
            rows: [
              ["单数可数名词", "There is + 单数可数名词 + 表示场所的词或短语"],
              ["不可数名词", "There is + 不可数名词 + 表示场所的词或短语"],
              ["复数名词", "There are + 复数名词 + 表示场所的词或短语"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "There is a pineapple there.", zh: "那儿有一个菠萝。" },
              { en: "There is still some juice in the cup.", zh: "杯子里还有一些果汁。" },
              { en: "There are many eggs in the kitchen.", zh: "厨房里有很多鸡蛋。" },
            ],
          },
          {
            type: "tip",
            text: "there be 中的 there 不是“那里”的意思；当要明确地表达“在那里有……”时，必须在最后重复使用 there。",
          },
          {
            type: "text",
            text: "there be 句型的否定句是在 be 的后面加 not；一般疑问句是将 be 调到 there 的前面；特殊疑问句是在其一般疑问句前加相应的疑问词。",
          },
          {
            type: "examples",
            items: [
              { en: "There is not a computer on the desk.", zh: "桌子上没有电脑。" },
              { en: "There are not any students on the playground.", zh: "操场上没有学生。" },
              { en: "Is there a computer on the desk?", zh: "桌子上有电脑吗？" },
              { en: "Are there any students on the playground?", zh: "操场上有学生吗？" },
              { en: "How many people are there in your family? — There are five.", zh: "你们家有几口人？—— 有五口人。" },
            ],
          },
          {
            type: "pitfall",
            text: "问“某地有……”时用 What's...? 或 What is...? 提问，答语仍用 there be：What's on the table? — There are some boxes on it.",
          },
        ],
      },
      {
        heading: "四、行为动词的一般现在时",
        blocks: [
          {
            type: "text",
            text: "除 be 动词（am、is、are）、助动词、情态动词以外的动词全部称为行为动词。",
          },
          {
            type: "text",
            text: "1 行为动词一般现在时的肯定句。主语为第一人称 I/we、第二人称 you 或第三人称复数时，谓语动词没有形式变化：主语（除第三人称单数外）+ 行为动词（原形）+ ……；主语为第三人称单数时，动词要加 -s/-es：主语（第三人称单数）+ 行为动词(-s/-es) + ……",
          },
          {
            type: "examples",
            items: [
              { en: "I play baseball every Sunday.", zh: "我每个星期日都打棒球。" },
              { en: "She usually does her homework at school.", zh: "她通常在学校做作业。" },
              { en: "I go to school every day.", zh: "我每天去上学。" },
              { en: "We have three children.", zh: "我们有三个孩子。" },
              { en: "He always wears (in) black.", zh: "他总是穿黑色的衣服。" },
              { en: "She often gets up at half past six.", zh: "她经常六点半起床。" },
              { en: "Nancy goes to the movies every weekend.", zh: "南希每周末都去看电影。" },
            ],
          },
          {
            type: "text",
            text: "2 行为动词一般现在时的否定句：主语（除第三人称单数外）+ do not + 行为动词原形；主语（第三人称单数）+ does not + 行为动词原形。",
          },
          {
            type: "examples",
            items: [
              { en: "I don't watch TV at home.", zh: "我在家不看电视。" },
              { en: "He doesn't study hard.", zh: "他不用功学习。" },
              { en: "She does not speak Chinese.", zh: "她不说汉语。" },
              { en: "Amy doesn't like to eat eggplant.", zh: "艾米不喜欢吃茄子。" },
            ],
          },
          {
            type: "table",
            head: ["主语", "肯定句", "否定句"],
            rows: [
              ["第一人称单数", "I speak English.", "I do not / don't speak English."],
              ["第二人称单数", "You speak English.", "You do not / don't speak English."],
              ["第三人称单数", "He / She / It speaks English.", "He / She / It does not / doesn't speak English."],
              ["所有人称复数", "We / You / They speak English.", "We / You / They do not / don't speak English."],
            ],
          },
          {
            type: "tip",
            text: "do not 的缩写为 don't，does not 的缩写为 doesn't；do not 和 does not 后面的动词必须是原形。do 和 does 用于行为动词的否定句和疑问句中，称为助动词。",
          },
          {
            type: "text",
            text: "3 行为动词一般现在时的一般疑问句：Do/Does + 主语 + 动词原形 + ……? 肯定回答 Yes, 主语 + do/does.；否定回答 No, 主语 + do not/does not.",
          },
          {
            type: "examples",
            items: [
              { en: "Do you go to school today?", zh: "你今天去上学吗？" },
              { en: "Does she come from Australia?", zh: "她来自澳大利亚吗？" },
              { en: "Do you like rock climbing?", zh: "你喜欢攀岩吗？" },
              { en: "Does he walk to school?", zh: "他走路上学吗？" },
            ],
          },
          {
            type: "table",
            head: ["主语", "一般疑问句", "简略答语"],
            rows: [
              ["第一人称单数", "Do I speak English?", "Yes, you do. / No, you do not / don't."],
              ["第二人称单数", "Do you speak English?", "Yes, I do. / No, I do not / don't."],
              ["第三人称单数", "Does he / she speak English?", "Yes, he / she does. / No, he / she doesn't."],
              ["所有人称复数", "Do they speak English?", "Yes, they do. / No, they do not / don't."],
            ],
          },
          {
            type: "text",
            text: "4 行为动词一般现在时的特殊疑问句：疑问词 + 一般疑问句?",
          },
          {
            type: "examples",
            items: [
              { en: "Where do you live?", zh: "你住在哪儿？" },
              { en: "How does he go to school?", zh: "他怎么上学？" },
              { en: "When do they have lunch?", zh: "他们什么时候吃午饭？" },
              { en: "How many pairs of sneakers does she have?", zh: "她有多少双运动鞋？" },
              { en: "Where does her father work? — He works in an iron factory.", zh: "她父亲在哪儿工作？—— 他在一家铁制品厂工作。" },
            ],
          },
          {
            type: "tip",
            text: "特殊疑问句一般是将疑问词放在句首，后面用倒装句语序；但如果是对主语提问，则为“疑问词 + 谓语 + 其他成分”的语序：Who looks after the baby?。回答时不能用 yes/no，且因问句中用了 do/does，回答时动词要视主语而决定是否用第三人称单数。",
          },
        ],
      },
      {
        heading: "五、一般现在时的基本用法",
        blocks: [
          {
            type: "text",
            text: "1 表示经常、习惯性发生的动作或存在的状态，可以和 always（总是）、usually（通常）、often（经常）、sometimes（有时）、every day（每天）、every week（每周）等表示时间的状语连用。",
          },
          {
            type: "examples",
            items: [
              { en: "Helen always smiles at us.", zh: "海伦总是对我们微笑。" },
              { en: "I usually do my homework in the evening.", zh: "我通常晚上做作业。" },
              { en: "Eric often drives to travel.", zh: "埃里克经常开车去旅行。" },
              { en: "Sometimes they play football on the playground.", zh: "有时他们在操场上踢球。" },
              { en: "He goes to work every day.", zh: "他每天去上班。" },
              { en: "We go to school from Monday to Friday.", zh: "我们周一到周五上学。" },
            ],
          },
          {
            type: "text",
            text: "2 表示普遍真理和特征。由于普遍真理和特征是众所周知的客观事实，所以要用一般现在时陈述，而且一般不用时间状语。",
          },
          {
            type: "examples",
            items: [
              { en: "The earth is round.", zh: "地球是圆的。" },
              { en: "Birds fly in the sky.", zh: "鸟儿在空中飞翔。" },
              { en: "The sun is bigger than the earth.", zh: "太阳比地球大。" },
            ],
          },
          {
            type: "text",
            text: "3 表示知觉、态度、感情等。常用相关动词有 wonder（想知道）、like（喜欢）、forget（忘记）、believe（相信）、hope（希望）、doubt（怀疑）、remember（记住）、know（知道）、prefer（宁愿；更喜欢）。",
          },
          {
            type: "examples",
            items: [
              { en: "I want your help.", zh: "我想要你的帮助。" },
              { en: "I don't think you are wrong.", zh: "我觉得你没错。" },
              { en: "I suppose everything will be all right.", zh: "我料想一切都会好的。" },
              { en: "I love you.", zh: "我爱你。" },
              { en: "A: We live in difficult times. B: I agree.", zh: "我们生活在艰难时世中。—— 我同意。" },
            ],
          },
          {
            type: "text",
            text: "4 在时间、条件状语从句中表示将来的动作。",
          },
          {
            type: "examples",
            items: [
              { en: "When he gets to Europe, he will email me.", zh: "他到欧洲后就给我发电子邮件。" },
              { en: "If it doesn't rain tomorrow, we'll go to the Summer Palace.", zh: "如果明天不下雨，我们就去颐和园。" },
            ],
          },
          {
            type: "tip",
            text: "主句是一般将来时时，if/when 引导的时间、条件状语从句要用一般现在时代替一般将来时：从句用 doesn't rain / gets，不能用 won't rain。",
          },
          {
            type: "text",
            text: "5 表示已经预先计划或安排的肯定将要发生的动作。主要用于含有 come、go、start、begin、leave、return、stop 等终止性动词（又叫点动词）的句子，且句中常有表示将来时间的状语。",
          },
          {
            type: "examples",
            items: [
              { en: "The train leaves at seven and arrives in New York at three tomorrow morning.", zh: "火车7点出发，将于明天凌晨3点到达纽约。" },
              { en: "Our holidays begin in a week.", zh: "我们的假期一周后开始。" },
              { en: "The plane takes off at two this afternoon.", zh: "飞机将于今天下午2点起飞。" },
            ],
          },
          {
            type: "text",
            text: "此外，用 be about to do 表示马上就要发生的事情。",
          },
          {
            type: "examples",
            items: [
              { en: "The plane is at the end of the runway. It's about to take off.", zh: "飞机已经滑行到机场跑道的尽头，它马上就要起飞了。" },
              { en: "Li Ming is nearly reaching the finishing line now. He is about to win the race.", zh: "李明差点儿就到终点线了，他马上就要赢得这场比赛了。" },
            ],
          },
          {
            type: "pitfall",
            text: "be about to 表示最近的将来，与 will、be going to 不同，它不与表示将来的时间状语连用。",
          },
        ],
      },
      {
        heading: "六、失分陷阱（中考例题）",
        blocks: [
          {
            type: "text",
            text: "本章“失分陷阱”共 4 道中考例题，分别考查 if 引导的条件状语从句、一般现在时的基本用法、as soon as 引导的时间状语从句和动名词作主语。",
          },
          {
            type: "examples",
            items: [
              {
                en: "All the students in Class 5 will climb the mountain if it doesn't rain tomorrow.",
                zh: "【绵阳中考】考查 if 引导的条件状语从句的时态：主句是一般将来时，从句用一般现在时代替将来时；从句主语 it 是第三人称单数，用 doesn't。答案 D（doesn't）。",
              },
              {
                en: "Mid-Autumn Day usually comes in September or October every year.",
                zh: "【北京中考】考查一般现在时的基本用法：传统节日在固定的某月份到来，用一般现在时。答案 B（comes）。",
              },
              {
                en: "Please ask him to call me as soon as he returns.",
                zh: "【成都中考】as soon as 意为“一……就……”，引导时间状语从句；表示将来发生的事情时，从句用一般现在时。答案 B（returns）。",
              },
              {
                en: "I think playing computer games has a bad effect on teenagers.",
                zh: "【宿迁中考】答语中 playing computer games 作主语，谓语用第三人称单数；由肯定答语可知答者认为玩电脑游戏对青少年有不良影响。答案 C（has a bad effect）。",
              },
            ],
          },
        ],
      },
      {
        heading: "七、实力测验（第216—219页）考点速览",
        blocks: [
          {
            type: "text",
            text: "本章“实力测验”共 6 种题型：1 用括号中适当的词填空；2 用括号中动词的适当形式填空；3 选择填空；4 选择适当的词并用其正确的形式填空（watch、wear、visit、have、trust、send、play、stay、warn、download）；5 按要求变换句型；6 汉译英。",
          },
          {
            type: "list",
            items: [
              "第 1 题集中考 be 动词与助动词的选择：用 am/is/are 或 do/does/did 填空。",
              "动词适当形式填空集中考第三人称单数 -s/-es 与 there be 的主谓一致，如 There ___ (be) some glasses on it.、Everybody ___ (have) a chance to win.",
              "状语从句中的时态：If he ___ (be) free tomorrow, he ___ (go) with us. 与 As soon as they ___ (get) there next month, he ___ (call) me. 都考“主将从现”。",
              "句型变换考查否定句、一般疑问句、对画线部分提问和反意疑问句（如 Sometimes you have a meeting on Sunday. → 变为反意疑问句）。",
              "汉译英考查 be 动词表职业/身份、频率副词位置与时间状语（如“我父亲每周末都打网球”“我每天早上7点钟离开家去上学”）。",
            ],
          },
        ],
      },
    ],
    extras: {
      forms: [
        {
          name: "there be 句型",
          pattern: "There is + 单数可数名词/不可数名词 + 地点；There are + 复数名词 + 地点",
          note: "表示某地有/存在某物。",
        },
        {
          name: "计划安排（点动词）",
          pattern: "主语 + 点动词的一般现在时 + 表示将来的时间状语",
          note: "come/go/start/begin/leave/return/stop 等表示按计划将要发生的动作。",
        },
        {
          name: "be about to do",
          pattern: "主语 + be about to + 动词原形",
          note: "表示马上就要发生的事情，不与将来时间状语连用。",
        },
      ],
      points: [
        {
          title: "be 动词按主语的人称和数选用 am/is/are",
          desc: "I 用 am；he/she/it 及单数名词用 is；you 及复数用 are。",
          good: ["I am thirteen years old.", "Mary is a student.", "They are from China."],
          bad: ["I is thirteen years old.", "They is from China."],
        },
        {
          title: "时间、条件状语从句中用一般现在时表示将来",
          desc: "if/when/as soon as 引导的从句用一般现在时，主句用一般将来时。",
          good: [
            "All the students in Class 5 will climb the mountain if it doesn't rain tomorrow.",
            "When he gets to Europe, he will email me.",
          ],
          bad: ["All the students in Class 5 will climb the mountain if it won't rain tomorrow."],
        },
        {
          title: "表示知觉、态度、感情的动词常用一般现在时",
          desc: "wonder、like、believe、hope、know、prefer 等词常与一般现在时连用。",
          good: ["I believe him to be honest.", "I don't think you are wrong."],
          bad: ["I am believing him to be honest."],
        },
        {
          title: "表示普遍真理和特征时不用时间状语",
          desc: "客观事实用一般现在时陈述。",
          good: ["The sun is bigger than the earth.", "Birds fly in the sky."],
          bad: [],
        },
      ],
      contrasts: [
        {
          title: "be 动词 vs 行为动词的一般现在时",
          head: ["对比项", "be 动词", "行为动词"],
          rows: [
            ["第三人称单数形式", "is（He is a student.）", "动词加 -s/-es（He plays.）"],
            ["否定句", "主语 + be + not（He isn't a student.）", "主语 + don't/doesn't + 动词原形（He doesn't play.）"],
            ["一般疑问句", "Am/Is/Are + 主语（Is he a student?）", "Do/Does + 主语（Does he play?）"],
          ],
        },
      ],
      pitfalls: [
        "do not 和 does not 后面的动词必须是原形：× He doesn't studies hard.",
        "有 be 动词的句子变否定句、疑问句时不再借助 do/does：× Does he is a student?",
        "there be 句型中 be 的单复数由其后名词决定：There is a pineapple there. / There are many eggs in the kitchen.",
        "点动词用一般现在时表将来时，句中要有表示将来的时间状语；be about to 则相反，不能与将来时间状语连用。",
      ],
      examTips: [
        "看到 if / when / as soon as 引导的从句，先想“主将从现”：从句用一般现在时、主句用一般将来时。",
        "第三人称单数主语后动词必须加 -s/-es：usually comes / goes / has。",
      ],
      memoryCard: [
        "be 动词三兄弟：I 用 am，he/she/it 用 is，you 和复数用 are。",
        "行为动词：除第三人称单数加 -s/-es 外一律用原形，否定和疑问靠 do/does。",
        "if/when 从句现在时，主句将来时。",
      ],
    },
    notes: [
      "微信图片_20260927101828_426_66.jpg 与 微信图片_20260927101847_428_66.jpg 右侧的“说明/补充/注意”窄栏有一部分被裁切，正文可读，已按可识别内容转写。",
      "微信图片_20260927143336_439_66.jpg 的“汉译英”题干完整可读，答案栏为空白（练习页），未编造答案。",
    ],
  },
];
