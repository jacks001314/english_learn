// web/js/grammar/yufan/nouns.js
// 来源：yufan/名词（教材第 1 章扫描件 15 张，微信图片_20260927084031_243_66.jpg ~ 微信图片_20260927085100_257_66.jpg）
// 由 yufan 图片讲义整理，供 GrammarView「语法专题」页面渲染。
// g-nouns 是 topics.js 中已有专题，本文件按契约只写增量补充（sections + extras），不复述已有内容。
// 自检：import('file:///.../nouns.js')

export default [
  {
    topicId: "g-nouns",
    newTopic: false,
    title: "名词与主谓一致",
    sourceDirs: ["yufan/名词"],
    imagesRead: 15,
    summary: "名词先按「专有 / 普通」两分，普通名词再分个体、集体、物质、抽象四类；讲义按「种类 → 数 → 量 → 所有格 → 句法功能」五步系统展开。",
    intro: "教材第 1 章·名词用四个部分讲名词：一、名词的种类；二、名词的数（可数名词和不可数名词）；三、名词的所有格（构成及用法）；四、名词的用法。以下按图片原顺序整理为讲义。",
    notes: "第 13—15 张（微信图片_20260927085022_255_66.jpg / 微信图片_20260927085051_256_66.jpg / 微信图片_20260927085100_257_66.jpg）为章末「实力测验 Final Check」练习页（用括号中名词的适当形式填空、用括号中适当的词填空、改错、选择填空），原书未附答案，未录入正文。",
    sections: [
      {
        heading: "1 名词的种类：专有名词与普通名词",
        blocks: [
          {
            type: "text",
            text: "在我们身边存在着形形色色的人与物，他们都有自己的称呼。Sydney（悉尼）、door（门）、family（家庭）、air（空气）等，用来称呼它们的词就是名词。概括来说，表示人、事物、地方、现象或抽象概念等名称的词都叫名词。",
          },
          {
            type: "table",
            head: ["大类", "小类", "含义与例词"],
            rows: [
              ["专有名词", "—", "Wendy 温迪，Canada 加拿大，China 中国，Beijing 北京，the United Nations 联合国"],
              ["普通名词（可数）", "个体名词", "表示某类人或事物中的个体：taxi 出租车，rubber 橡皮，bowl 碗，basketball 篮球"],
              ["普通名词（可数）", "集体名词", "表示若干个体组成的集合体：family 家庭，army 军队，class 班，team 队"],
              ["普通名词（不可数）", "物质名词", "表示无法分为个体的物质或实物：ice 冰，juice 果汁，meat 肉，wind 风"],
              ["普通名词（不可数）", "抽象名词", "表示动作、状态、品质、感情等抽象概念：health 健康，power 能量，music 音乐，honesty 诚实"],
            ],
          },
          {
            type: "tip",
            text: "普通名词中，个体名词和集体名词大多属于可数名词；物质名词和抽象名词多属于不可数名词。",
          },
          {
            type: "examples",
            items: [
              { en: "Li Bai is a poet.", zh: "李白是一位诗人。（专有名词 Li Bai）" },
              { en: "This is a pen.", zh: "这是一支笔。（普通名词 a pen）" },
              { en: "The plane flew to the west.", zh: "飞机朝西飞去。（普通名词 the west）" },
            ],
          },
        ],
      },
      {
        heading: "2 专有名词的五类与冠词处理",
        blocks: [
          {
            type: "text",
            text: "专有名词是指人、地方、团体、机构等特有的名称。它的第一个字母必须大写。专有名词前一般不加冠词。",
          },
          {
            type: "list",
            items: [
              "表示人名、尊称和头衔的专有名词：Einstein 爱因斯坦，Chairman Xi 习主席，President Obama 奥巴马总统，Mr Brown 布朗先生，Doctor Lin 林博士 / 林医生，Queen Elizabeth II 伊丽莎白女王二世",
              "表示国名、地名、山河名的专有名词：South Korea 韩国，Thailand 泰国，Egypt 埃及，Paris 巴黎，Los Angeles 洛杉矶，Chinatown 唐人街，Pacific Ocean 太平洋，Mississippi River 密西西比河，Caribbean 加勒比海，Mount Qomolangma 珠穆朗玛峰",
              "表示团体、机构和报刊的专有名词：Museum of Postal History 邮政博物馆，Sydney Opera House 悉尼歌剧院，Friends of the Earth 地球之友（机构名），China Daily 中国日报，Reuters 路透社，Harvard University 哈佛大学",
              "表示星期、月份和节日的专有名词：Wednesday 星期三，Sunday 星期天，March 三月，Labour Day 劳动节，National Day 国庆节，Father's Day 父亲节",
              "由普通名词构成的专有名词：the North Pole 北极，the Nile River 尼罗河，the Bund 上海外滩，the Great Wall 长城，the Forbidden City 紫禁城，the Temple of Heaven 天坛，the White House 白宫，the Terracotta Warriors 兵马俑",
            ],
          },
          {
            type: "tip",
            text: "人名前面若有尊称或头衔，如 Mr（先生）、President（总统）等时，其第一个字母也要大写。",
          },
          {
            type: "pitfall",
            text: "由普通名词构成的专有名词前要用定冠词 the，但它的首字母不大写（the Great Wall、the White House）。这与「专有名词前一般不加冠词」并不矛盾，需要单独记住这一类。",
          },
        ],
      },
      {
        heading: "3 普通名词的四类，以及物质/抽象名词转可数",
        blocks: [
          {
            type: "text",
            text: "普通名词是指一类人或事物或一个抽象的名称。它可以进一步分为个体名词、集体名词、物质名词和抽象名词四类。",
          },
          {
            type: "table",
            head: ["小类", "含义", "例词"],
            rows: [
              ["个体名词", "表示某类人或事物中的个体", "author 作家，boss 老板，city 城市，cook 厨师，engineer 工程师，laundry 洗衣店，robot 机器人，tent 帐篷"],
              ["集体名词", "表示若干个体组成的集合体", "army 军队，audience 听众，committee 委员会，crowd 人群，family 家庭，government 政府，people 人民，police 警察，public 公众"],
              ["物质名词", "表示无法分为个体的物质或实物", "air 空气，lightning 闪电，water 水，oxygen 氧气，fire 火，coffee 咖啡，rain 雨，iron 铁，tea 茶，snow 雪，wood 木材，milk 牛奶"],
              ["抽象名词", "表示动作、状态、品质、感情等抽象的概念", "love 爱，envy 嫉妒，sadness 悲伤，strength 力量，truth 真理，peace 和平，beauty 美，respect 尊敬，courage 勇气，temperature 温度，youth 青春，responsibility 责任"],
            ],
          },
          {
            type: "pitfall",
            text: "物质名词不可数，但表示具体的东西时则变为可数名词，意思上也随之变化：glass 玻璃 → a glass 一个玻璃杯；fish 鱼肉 → a fish / two fish 一条 / 两条鱼；room 空间 → a room 一个房间；chicken 鸡肉 → a chicken 一只鸡。",
          },
          {
            type: "tip",
            text: "抽象名词不可数，但在一些固定词组中可用作可数名词：have a cold 感冒；have a rest 休息。",
          },
        ],
      },
      {
        heading: "4 名词的数（一）：单数可数名词与 a / an",
        blocks: [
          {
            type: "text",
            text: "英语中的普通名词按照其所表示的事物的性质可分为可数名词与不可数名词。表示可以计算数目的人或物的名词称为可数名词；可数名词分为单数可数名词和复数可数名词。单数可数名词前面一般要用不定冠词 a / an；复数可数名词是在单数名词后面加 -s 或 -es，且前面不能用不定冠词 a / an；复数名词表示泛指时不加定冠词 the。",
          },
          {
            type: "table",
            head: ["单数", "复数"],
            rows: [
              ["a book 一本书", "two books 两本书"],
              ["a dog 一只狗", "three dogs 三只狗"],
              ["an apple 一个苹果", "many apples 许多苹果"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "This is a desk.", zh: "这是一张书桌。" },
              { en: "There is an orange on the table.", zh: "桌上有一个橘子。" },
            ],
          },
          {
            type: "pitfall",
            text: "a / an 后面直接跟的不是单数名词，而是「a / an + 形容词 + 单数名词」的形式。判断用 a 还是 an 表示「一个」时，要看紧跟其后的那个形容词开头字母的发音，而不是看名词。",
          },
          {
            type: "examples",
            items: [
              { en: "a fresh orange", zh: "一个新鲜的橘子（正确：fresh 以辅音音素开头，用 a）" },
              { en: "an impolite soldier", zh: "一名无礼的士兵（正确：impolite 以元音音素开头，用 an）" },
            ],
          },
          {
            type: "tip",
            text: "英语中没有量词，所以 a book（一本书）、a knife（一把刀）、a bus（一辆公共汽车）都只用 a，但翻译成汉语时要用不同的量词。",
          },
        ],
      },
      {
        heading: "5 名词复数（二）：规则变化的七种情况与读音",
        blocks: [
          {
            type: "table",
            head: ["规则", "例词（含读音）"],
            rows: [
              ["(1) 一般情况下词尾加 -s；清辅音后读 [s]，浊辅音、元音及其他情况后读 [z]", "book→books [bʊks] 书本；pet→pets [pets] 宠物；cup→cups [kʌps] 杯子；bed→beds [bedz] 床"],
              ["(2) 以 s、x、sh、ch 结尾的词，词尾加 -es，读 [ɪz]", "glass→glasses [ˈɡlɑːsɪz] 玻璃杯；brush→brushes [ˈbrʌʃɪz] 刷子；fox→foxes [ˈfɒksɪz] 狐狸；match→matches [ˈmætʃɪz] 火柴"],
              ["(3) 以 f 或 fe 结尾的词，先将 f 或 fe 变成 v，再加 -es，读 [vz]", "shelf→shelves [ʃelvz] 架子；leaf→leaves [liːvz] 树叶；wife→wives [waɪvz] 妻子；thief→thieves [θiːvz] 小偷；knife→knives [naɪvz] 刀；life→lives [laɪvz] 生命"],
              ["(4) 以 o 结尾的词，词尾加 -es 或 -s，读 [z]", "hero→heroes 英雄；mango→mangoes 杧果；potato→potatoes 土豆；tomato→tomatoes 西红柿；bamboo→bamboos 竹子；piano→pianos 钢琴；radio→radios 收音机；photo→photos 照片；zoo→zoos 动物园"],
              ["(5) 以辅音字母加 y 结尾的词，先将 y 改为 i 再加 -es，读 [ɪz]", "baby→babies 婴儿；city→cities 城市；factory→factories 工厂；family→families 家庭"],
              ["(6) 以元音字母加 y 结尾的词，词尾加 -s，读 [z]", "day→days 白天；toy→toys 玩具；boy→boys 男孩；way→ways 方法"],
              ["(7) 以 th 结尾的词，词尾加 -s，读 [ðz] 或 [θs]", "mouth→mouths [maʊðz] 嘴；month→months [mʌnθs] 月；path→paths [pæðz] 小路；death→deaths [deθs] 死亡"],
            ],
          },
          {
            type: "tip",
            text: "第 (3) 条的例外：有时以 f 或 fe 结尾的词变复数时不需将 f 或 fe 变成 v，只需在词尾直接加 -s——belief→beliefs 信仰；roof→roofs 屋顶；chief→chiefs 领导人；safe→safes 保险箱。另外还有一种特殊情况：个别以 f 或 fe 结尾的词会有两种复数形式，如 handkerchief→handkerchiefs / handkerchieves 手帕。",
          },
        ],
      },
      {
        heading: "6 名词复数（三）：不规则变化与只有复数形式的名词",
        blocks: [
          {
            type: "table",
            head: ["类型", "例词"],
            rows: [
              ["(1) 元音发生变化", "man→men 男人；woman→women 女人；foot→feet 脚；tooth→teeth 牙；mouse→mice 老鼠；goose→geese 鹅"],
              ["(2) 单、复数形式相同", "deer→deer 鹿；sheep→sheep 绵羊；fish→fish 鱼；means→means 方法；spacecraft→spacecraft 宇宙飞船；Chinese→Chinese 中国人；Japanese→Japanese 日本人"],
              ["(3) 词尾发生变化", "child→children 孩子；ox→oxen 公牛"],
              ["(4) 有些名词只有复数形式", "clothes 衣服；glasses 眼镜；scissors 剪子；compasses 圆规；scales 天平；trousers 裤子"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "Your trousers are over there.", zh: "你的裤子在那儿。" },
              { en: "I bought some new clothes.", zh: "我买了一些新衣服。" },
              { en: "There are three sheep in the fields. Which sheep do you like best?", zh: "田野里有三只绵羊，你最喜欢哪一只？" },
            ],
          },
          {
            type: "tip",
            text: "单、复数形式相同的可数名词，无论是表示一只绵羊，还是表示多只绵羊，都用 sheep。",
          },
          {
            type: "pitfall",
            text: "只有复数形式的名词（trousers、clothes、glasses、scissors 等）前面不可以直接加 a / an，也不能直接加数词；表示数量时需用「a / an / 数词 + 单位词 + of + 名词」的结构：a pair of trousers，two pairs of trousers。",
          },
        ],
      },
      {
        heading: "7 以 -s 结尾却作单数的名词，以及复合名词的复数",
        blocks: [
          {
            type: "text",
            text: "有些名词虽然是以 s 结尾，但它们不是名词的复数形式，而是单词本身词尾为 s。表示学科的名称中许多属于此类名词，应把它们作为名词单数来看待。",
          },
          {
            type: "list",
            items: [
              "maths 数学；physics 物理；politics 政治",
              "means 方法；goods 商品、货物；works 作品",
            ],
          },
          {
            type: "examples",
            items: [
              { en: "Physics is very difficult for me.", zh: "物理对我来说很难。" },
            ],
          },
          {
            type: "table",
            head: ["复合名词复数类型", "例词"],
            rows: [
              ["(1) 第一个词或最后一个词变为复数形式：把复合词中起主导作用的主体名词变为复数形式", "passer-by→passers-by 过路人；son-in-law→sons-in-law 女婿；girlfriend→girlfriends 女朋友；grown-up→grown-ups 成年人；highway→highways 公路"],
              ["(2) 构成复合名词的两个词都要变为复数形式（多为 man、woman 构成的复合名词）", "man doctor→men doctors 男医生；woman teacher→women teachers 女教师；man servant→men servants 男仆人"],
            ],
          },
          {
            type: "tip",
            text: "如果没有主体名词，就把复数词尾加在最后一个词上。",
          },
        ],
      },
      {
        heading: "8 不可数名词的量：确切数量与不确切数量",
        blocks: [
          {
            type: "text",
            text: "表示不能计算数目的人或物的名词，称为不可数名词。不可数名词前面不能用不定冠词 a / an，也没有复数形式。不可数名词的量的表达方式和可数名词有很大区别。",
          },
          {
            type: "text",
            text: "确切数量的表达方式：通常可在不可数名词前面加上表示数量的单位词。表示「一袋 / 杯……」时，单位词要用单数形式；表示「两袋 / 杯……」时，单位词要用复数形式。",
          },
          {
            type: "list",
            items: [
              "a glass of water 一杯水；a jar of jam 一罐果酱；a packet of sweet 一袋糖",
              "two tubes of toothpaste 两管牙膏；two bags of rice 两袋米；three cups of coffee 三杯咖啡",
              "four pieces of advice 四条建议 / 劝告；four cartons of milk 四盒牛奶；five kilos of meat 五千克肉",
            ],
          },
          {
            type: "tip",
            text: "一些可数名词也可加单位词表示量：a box of matches 一盒火柴；four pounds of tomatoes 四磅西红柿；a bowl of beans 一碗豆子。",
          },
          {
            type: "table",
            head: ["不确切数量的单词 / 短语", "意义"],
            rows: [
              ["not (any) / no", "没有"],
              ["little", "几乎没有"],
              ["a little / some", "一些"],
              ["most", "大部分"],
              ["all", "全部"],
              ["a lot of / lots of", "许多"],
              ["plenty of", "许多"],
              ["much", "许多"],
              ["a great deal of", "许多"],
            ],
          },
          {
            type: "examples",
            items: [
              { en: "Fortunately, I had a little time to spare.", zh: "很幸运，我有一点儿空闲时间。" },
              { en: "Do you have much money to travel?", zh: "你有许多钱去旅游吗？" },
              { en: "A great deal of my work is unpaid.", zh: "我的许多工作都是没有报酬的。" },
            ],
          },
          {
            type: "tip",
            text: "修饰可数名词复数的词有：some、(a) few、a lot of、lots of、plenty of、many。",
          },
        ],
      },
      {
        heading: "9 名词的所有格",
        blocks: [
          {
            type: "text",
            text: "英语中表示所属关系常用以下两种方式：一是在一些名词之后加 's；另一种是「of + 名词」结构。前者多用来表示有生命物的名词所有格，后者多用来表示无生命物的名词所有格。",
          },
          {
            type: "list",
            items: [
              "A 单数名词词尾加 's；复数名词词尾如没有 s，也要加 's：Ivan's home 伊凡的家；Mary's nose 玛丽的鼻子；Alice's wishes 艾丽斯的愿望；children's school bags 孩子们的书包；Tom's cap 汤姆的帽子；Bob's hobby 鲍勃的爱好；women's smile 妇女们的笑",
              "B 名词已有复数词尾，词尾只加 ' 即可：Students' Union 学生会；the workers' struggle 工人们的斗争；the teachers' reading room 教师阅览室",
            ],
          },
          {
            type: "table",
            head: ["一个人的一件东西", "多个人的多件东西"],
            rows: [
              ["the boy's jacket 男孩的夹克", "the boys' jackets 男孩们的夹克"],
              ["my parent's car 我父亲 / 母亲的车", "my parents' cars 我父母的车"],
              ["my boss's hat 我老板的帽子", "my bosses' hats 我老板们的帽子"],
              ["the woman's dress 妇女的衣服", "the women's dresses 妇女们的衣服"],
              ["the child's toy 孩子的玩具", "the children's toys 孩子们的玩具"],
            ],
          },
          {
            type: "pitfall",
            text: "当并列名词表示各自所属时，在两个名词之后都要加 's；当表示共同所属时，在最后一个名词后加 's。This is Tom and his brother's room.（这是汤姆和他哥哥的房间——两人共有一个房间）These are Tom's and his brother's rooms.（这是汤姆的房间和他哥哥的房间——两人有各自的房间）",
          },
          {
            type: "list",
            items: [
              "A 表示无生命物的所有关系多用「of + 名词」结构：the title of the novel 小说的名字；the end of the road 路的尽头；the window of the house 房子的窗户；the subject of the sentence 句子的主语",
              "B 有些表示时间、距离、国家、城市等无生命物的名词，也可以加 's 来构成所有格：one month's vacation 一个月的假期；ten minutes' walk 十分钟的步行路程；New York's population 纽约的人口",
              "C 有时 's 结构可以转换成「of + 名词」结构以示强调：the girl's skirt = the skirt of the girl 女孩的裙子；my uncle's tractor = the tractor of my uncle 我叔叔的拖拉机",
            ],
          },
        ],
      },
      {
        heading: "10 名词的用法：句法功能与作定语",
        blocks: [
          {
            type: "text",
            text: "名词在句子中可担任除谓语外的任何成分，即主语、表语、宾语（动词宾语和介词宾语）、宾语补足语、状语、定语。此外，名词所有格也可作定语。注意名词作定语与形容词作定语时的区别。",
          },
          {
            type: "examples",
            items: [
              { en: "Students should make enough time for the hobbies.", zh: "（名词作主语）学生应该为自己的爱好留出足够的时间。" },
              { en: "Audrey Hepburn is an actress.", zh: "（名词作表语）奥黛丽·赫本是名女演员。" },
              { en: "My mother grows vegetables herself.", zh: "（名词作动词宾语）我妈妈自己种蔬菜。" },
              { en: "He drives to school every day.", zh: "（名词作介词宾语）他每天开车去学校。" },
              { en: "They named their son Mike.", zh: "（名词作宾语补足语）他们给儿子取名叫迈克。" },
              { en: "You should study English step by step.", zh: "（名词作状语）你们应该循序渐进地学习英语。" },
              { en: "She is well known in the art circle.", zh: "（名词作定语）她在艺术圈很有名。" },
              { en: "Ten minutes' walk isn't long.", zh: "（名词所有格作定语）十分钟的步行路程不算长。" },
            ],
          },
          {
            type: "list",
            items: [
              "名词作定语的常见搭配（必背）：income tax 收入税；a paper tiger 纸老虎；the street lights 路灯；the star sign 星座；the soap opera 肥皂剧；science fiction 科幻小说；the city centre 市中心",
              "a goods train 货车；summer vacation 暑假；a clothes brush 一把衣服刷子；a department store 百货商店；the action film 动作片；the football field 足球场；the health problem 健康问题",
            ],
          },
          {
            type: "table",
            head: ["名词作定语", "形容词作定语"],
            rows: [
              ["colour TV 彩电", "colourful flowers 五颜六色的花"],
              ["gold chain 金链子", "golden fish 金鱼"],
              ["history lesson 历史课", "historical film 历史题材的影片"],
              ["rain drops 雨点", "rainy season 多雨的季节"],
            ],
          },
        ],
      },
      {
        heading: "11 章末常见失分陷阱（Common Mistakes）",
        blocks: [
          {
            type: "pitfall",
            text: "【福州中考】The professor gave him one of the best ______ after class.（A. piece of advice  B. pieces of advices  C. piece of advices  D. pieces of advice）答案 D。advice 是不可数名词，所以「一条建议」要说 a piece of advice；若要表示「好几条建议」，复数的概念可以在 piece 上表现出来，即 some pieces of advice。表达「最好的建议中的一条」，piece 要用复数形式。",
          },
          {
            type: "pitfall",
            text: "【黄冈中考】Go straight, ______ and you'll find a sign for the toilet.（A. three minutes' away  B. three minutes' walk  C. three minute's away  D. three minute's walk）答案 B。away 为副词，前面不能用所有格；表示时间、距离、金钱、价值等的名词可以用所有格形式。名词 minute 已有复数词尾，其所有格只加 ' 即可。",
          },
          {
            type: "pitfall",
            text: "【内蒙古中考】The woman over there is ______ mother.（A. Lily's and Lucy's  B. Lily's and Lucy  C. Lily and Lucy's  D. Lily and Lucy）答案 C。表示两者或两者以上共有，只在最后一个名字后加 's。应仔细审题，辨别清楚是「共有」还是「各自所有」的关系。句中 mother 是单数形式，由此可知她是两个孩子共同的母亲。",
          },
          {
            type: "pitfall",
            text: "Move along and make ______ for me.（A. a room  B. room  C. chair  D. tables）答案 B。本题考查可数名词与不可数名词的用法及意义。A 选项中的 room 是可数名词，a room 意为「一个房间」；B 选项中的 room 是不可数名词，表示「空间」的意思。",
          },
        ],
      },
    ],
    extras: {
      forms: [
        {
          name: "名词所有格（'s / '）",
          pattern: "单数名词 + 's；已有复数词尾的名词 + '",
          note: "Tom's cap；the workers' struggle；并列名词共有只在最后一个后加 's。",
        },
        {
          name: "复合名词复数",
          pattern: "主体名词变复数（passer-by→passers-by）；man / woman 构成的复合名词两个词都变（man doctor→men doctors）",
          note: "没有主体名词时，复数词尾加在最后一个词上。",
        },
        {
          name: "不可数名词的确切数量",
          pattern: "a / an / 数词 + 单位词 + of + 不可数名词",
          note: "a glass of water；two bags of rice；单位词随数量变成复数。",
        },
        {
          name: "名词作定语",
          pattern: "名词 + 名词",
          note: "colour TV、gold chain、history lesson、rain drops；与形容词作定语（colourful flowers、golden fish）区分。",
        },
      ],
      points: [
        {
          title: "a / an 看紧跟其后的词的首音",
          desc: "a / an 后面若接「形容词 + 单数名词」，判断用 a 还是 an 要看紧跟的形容词开头字母的发音，而不是看名词。",
          good: ["a fresh orange", "an impolite soldier"],
          bad: ["an fresh orange", "a impolite soldier"],
        },
        {
          title: "以 s 结尾并不等于复数",
          desc: "maths、physics、politics、means、goods、works 等虽以 s 结尾，但是单词本身词尾为 s，应作单数看待。",
          good: ["Physics is very difficult for me."],
          bad: ["Physics are very difficult for me."],
        },
        {
          title: "只有复数形式的名词要借单位词计数",
          desc: "trousers、clothes、glasses、scissors 等只有复数形式，不能直接加 a / an 或数词，要用「数词 + 单位词 + of」。",
          good: ["I want to buy two pairs of trousers."],
          bad: ["I want to buy two trousers."],
        },
        {
          title: "并列名词所有格：共有还是各自所有",
          desc: "表示各自所属时，两个名词之后都要加 's；表示共同所属时，只在最后一个名词之后加 's。",
          good: ["This is Tom and his brother's room.（两人共有一个房间）", "These are Tom's and his brother's rooms.（两人有各自的房间）"],
          bad: [],
        },
      ],
      contrasts: [
        {
          title: "名词作定语 vs 形容词作定语",
          head: ["名词作定语", "形容词作定语"],
          rows: [
            ["colour TV 彩电", "colourful flowers 五颜六色的花"],
            ["gold chain 金链子", "golden fish 金鱼"],
            ["history lesson 历史课", "historical film 历史题材的影片"],
            ["rain drops 雨点", "rainy season 多雨的季节"],
          ],
        },
        {
          title: "修饰可数名词复数与不可数名词的词",
          head: ["修饰可数名词复数", "修饰不可数名词"],
          rows: [
            ["some", "not (any) / no"],
            ["(a) few", "little"],
            ["many", "a little / some"],
            ["a lot of / lots of / plenty of", "much / a great deal of"],
          ],
        },
      ],
      pitfalls: [
        "a / an 的选择要看紧跟其后的形容词首音：a fresh orange（√）、an impolite soldier（√）。",
        "handkerchief 有两种复数形式：handkerchiefs / handkerchieves。",
        "clothes、glasses、scissors、trousers 等只有复数形式，不能用 a / an 或数词直接修饰，要用 a pair of 之类单位词。",
        "并列名词所有格要辨清「共有」还是「各自所有」：Tom and his brother's room 指两人共有一个房间。",
        "由普通名词构成的专有名词要加 the（the Great Wall、the White House），但首字母不大写。",
      ],
      examTips: [
        "名词所有格与不可数名词是本章两个高频陷阱：看到「几分钟 / 几天的路程」用 minutes' / days' walk；看到 advice、information、room（空间）先判定为不可数。",
        "「名词 + 名词」作定语的固定搭配（income tax、the city centre、a goods train）常在完形与语篇题中出现，不要按汉语语序改写。",
      ],
      memoryCard: [
        "a / an 看紧跟词的音，不看名词本身。",
        "f / fe 变复数：多数变 v 加 -es，belief / roof / chief / safe 直接加 -s。",
        "以 s 结尾不等于复数：maths、physics、politics 作单数。",
        "无生命物表所属以 of 结构为主；时间、距离、国家、城市可用 's。",
      ],
    },
  },
];