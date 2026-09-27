// web/js/grammar/yufan/verbs-overview.js —— 由 yufan 教材扫描图片整理的语法讲义数据
// 契约见同目录 README.md。自检：node -e "import('./web/js/grammar/yufan/verbs-overview.js').then(m=>console.log(m.default.length,m.default[0].imagesRead,m.default[0].sections.length))"

export default [
  {
    "topicId": "g-verbs-overview",
    "newTopic": true,
    "title": "动词概说",
    "category": "动词",
    "difficulty": 2,
    "sourceDirs": [
      "yufan/动词/动词概说"
    ],
    "imagesRead": 15,
    "summary": "动词是句子的重心，说明主语“是什么”或“做什么”，从动词的变化能看出句子是现在、过去还是将来。本章综述动词的种类（行为动词、系动词、助动词、情态动词）、动词的基本形式（原形、第三人称单数、过去式、过去分词、现在分词）、动词的十二种时态形式以及短语动词。",
    "intro": "本章是全书的动词总纲：先讲动词的种类，再讲系动词与行为动词的区分，然后给出动词五种基本形式的构成规则（含不规则动词变化表），最后用 study 为例列出动词十二种时态的形式，为后面各章的具体时态打基础。",
    "forms": [
      {
        "name": "行为动词·及物动词(vt.)",
        "pattern": "vt. + 宾语",
        "note": "后面要跟名词或代词作宾语，如 see a film、watch TV。"
      },
      {
        "name": "行为动词·不及物动词(vi.)",
        "pattern": "vi.（+ 介词 + 宾语）",
        "note": "不能直接跟宾语；“不及物动词 + 介词”相当于一个及物动词，如 look at the picture。"
      },
      {
        "name": "系动词(link v.)",
        "pattern": "link v. + 表语",
        "note": "不能单独作谓语，必须和表语一起构成合成谓语，如 I'm a student."
      },
      {
        "name": "助动词(aux.v.)",
        "pattern": "aux.v. + 动词原形/过去分词",
        "note": "本身没有意义，帮助主要动词构成疑问、否定、时态、语态，如 have had、is made。"
      },
      {
        "name": "情态动词(mod.v.)",
        "pattern": "mod.v. + 动词原形",
        "note": "表示说话者的态度，没有人称和数的变化，如 You must study hard."
      },
      {
        "name": "动词的时态",
        "pattern": "动词词形变化 或 加助动词 be/have/has",
        "note": "用动词本身的词形变化或加相关助动词表示动作发生的时间和状态。"
      }
    ],
    "points": [
      {
        "title": "动词是句子的重心",
        "desc": "每个句子都必须有一个动词来担当谓语，说明主语“是什么”或“做什么”；从动词的变化可以看出该句是现在时、过去时还是将来时。",
        "good": [
          "I am his elder sister.",
          "You study English.",
          "The sun is red."
        ],
        "bad": []
      },
      {
        "title": "及物动词后面必须有宾语",
        "desc": "及物动词后跟名词或代词作宾语；及物动词与不及物动词的区分是初中最容易忽略的语法点。",
        "good": [
          "I want to see a film.",
          "Tom is watching TV.",
          "In fact, Scout doesn't like her."
        ],
        "bad": [
          "We love peace 少了宾语 peace 时不成立。"
        ]
      },
      {
        "title": "同一个动词可以两用（及物/不及物、行为动词/系动词）",
        "desc": "英语中很多动词既是及物又是不及物；look、feel 等既可是行为动词，也可是系动词，要看它后面跟的是宾语还是表语。",
        "good": [
          "Let's begin.（begin 不及物）",
          "We'll begin our class in an hour.（begin 及物）",
          "The girl looks careful.（look 系动词）",
          "The girl looks at the picture carefully.（look 行为动词）"
        ],
        "bad": [
          "The girl looks carefully.（若想说“看起来细心”应为 The girl looks careful.）"
        ]
      },
      {
        "title": "系动词后面跟表语而不是宾语",
        "desc": "系动词不能单独作谓语，必须和其后的表语（形容词、名词、动名词、不定式、介词短语及副词充当）一起构成合成谓语。",
        "good": [
          "He feels cold.",
          "Steel feels hard.",
          "Silk feels soft and comfortable.",
          "Our dream has come true at last."
        ],
        "bad": [
          "She is look happy 之类把系动词与行为动词混用。"
        ]
      },
      {
        "title": "助动词与情态动词的判别",
        "desc": "助动词本身没有意义，只帮助主要动词构成谓语；情态动词有词义但不完整，后面一定跟不带 to 的不定式（动词原形，ought to 除外），且没有人称和数的变化。",
        "good": [
          "It is made in China.",
          "I haven't had my breakfast yet.",
          "He can speak English.",
          "He speaks English well."
        ],
        "bad": [
          "He cans speak English.",
          "You must to study hard."
        ]
      }
    ],
    "pitfalls": [
      "汉语中没有及物动词与不及物动词之分，很多同学因此忽略这一点，容易出现“缺宾语/多宾语”的错误。",
      "以 a- 开头的形容词（afraid、asleep、alone、alive、awake）常与系动词连用作表语，不能作前置定语：可以用 The boy asleep is my little brother.，不能用 the asleep boy（应用 the sleeping boy）。",
      "情态动词后要跟动词原形，不能在 can 后加 -s，也不能写成 must to do。",
      "不规则动词要逐组背熟：lie—lay—lain（躺）、lay—laid—laid（放）、lie—lied—lied（说谎）三组最易混。",
      "延续性动词才能和时间段连用（had 可与 for two weeks 搭配，bought 不能）。",
      "词尾 -ed 的读音分三种：清辅音后读[t]，元音和浊辅音后读[d]，辅音 t、d 后读[id]。"
    ],
    "examTips": [
      "中考常考动词辨义：turn off（关掉）/ turn on（打开）/ turn over（打翻、移交）/ turn down（拒绝、调小）。",
      "spend / pay / take / cost 的辨析：spend...doing sth.、pay sb. for sth.、take 的主语一般是 it 或物。",
      "延续性动词与非延续性动词：How long 提问要用 had 这类延续性动词，不能用 bought。",
      "及物与不及物：arrive / go / get 是不及物动词，要加介词（arrive in/at、go to、get to）；reach 是及物动词，后面直接接地点。"
    ],
    "memoryCard": [
      "动词是句子的重心，看动词变化定时间。",
      "及物带宾语，不及物加介词。",
      "系动词后跟表语，不单独作谓语。",
      "情态动词后跟原形，没有人称和数的变化。",
      "三单一 -s，过去/过去分词 -ed，现在分词 -ing。"
    ],
    "sections": [
      {
        "heading": "一、本章导览：动词是句子的重心",
        "blocks": [
          {
            "type": "text",
            "text": "在英语中，每个句子都必须有一个动词来担当谓语，说明主语“是什么”或“做什么”。动词是一个句子的重心，因此从动词的变化可以看出该句是现在时、过去时还是将来时。所以，了解动词的时态，在英语学习中相当重要。本章还将综述动词的种类、动词的基本形式、动词的时态、短语动词等内容，帮助大家对动词有一个大致的了解。"
          },
          {
            "type": "examples",
            "items": [
              {
                "en": "I am his elder sister.",
                "zh": "我是他的姐姐。"
              },
              {
                "en": "You study English.",
                "zh": "你学习英语。"
              },
              {
                "en": "The sun is red.",
                "zh": "太阳是红的。"
              }
            ]
          },
          {
            "type": "text",
            "text": "说明：典型例句中的 am、study、is 是动词，study 作句子的谓语；am、is 和后面的表语一起担当谓语。"
          }
        ]
      },
      {
        "heading": "二、动词的种类",
        "blocks": [
          {
            "type": "text",
            "text": "在英语中，动词可以分为以下几类："
          },
          {
            "type": "table",
            "head": [
              "类别（英文缩写）",
              "特点",
              "举例"
            ],
            "rows": [
              [
                "行为动词·及物动词(vt.)",
                "跟宾语",
                "We love peace.（我们热爱和平。）"
              ],
              [
                "行为动词·不及物动词(vi.)",
                "不能直接跟宾语",
                "Classes begin.（开始上课。）"
              ],
              [
                "系动词(link v.)",
                "跟表语",
                "I'm a student.（我是一个学生。）"
              ],
              [
                "助动词(aux.v.)",
                "跟动词原形或过去分词（无特殊意义）",
                "I have had my breakfast.（我已经吃过早饭了。）"
              ],
              [
                "情态动词(mod.v.)",
                "跟动词原形（表示说话者的态度）",
                "You must study hard.（你必须用功学习。）"
              ]
            ]
          }
        ]
      },
      {
        "heading": "三、行为动词：及物动词、不及物动词与短语动词",
        "blocks": [
          {
            "type": "text",
            "text": "1 及物动词：及物动词的后面要跟一个名词或代词等作它的宾语。行为动词又称实义动词（work、study、run、walk 等），词义完整，可以单独作谓语使用。"
          },
          {
            "type": "examples",
            "items": [
              {
                "en": "I want to see a film.",
                "zh": "我想去看电影。"
              },
              {
                "en": "Tom is watching TV.",
                "zh": "汤姆正在看电视。"
              },
              {
                "en": "In fact, Scout doesn't like her.",
                "zh": "实际上，斯考特并不喜欢她。"
              }
            ]
          },
          {
            "type": "tip",
            "text": "see 是一个及物动词，a film 是动词 see 的宾语。"
          },
          {
            "type": "text",
            "text": "2 不及物动词：不及物动词后面一定不能直接跟宾语，但可以跟一个介词构成一个短语动词，然后跟介词宾语，实际上“不及物动词 + 介词”就相当于一个及物动词了。"
          },
          {
            "type": "examples",
            "items": [
              {
                "en": "She is looking at the picture.",
                "zh": "她正在看照片。（look 是不及物动词，the picture 是介词 at 的宾语）"
              },
              {
                "en": "Zhu Tao always laughs at his brother.",
                "zh": "朱涛总是嘲笑他的兄弟。"
              }
            ]
          },
          {
            "type": "text",
            "text": "必背：不及物动词和不同的介词搭配，就构成了许多词组来表达不同的意思，比如下面这些由“look + 介词”构成的词组，需要平时多积累并掌握。"
          },
          {
            "type": "list",
            "items": [
              "look at 看",
              "look for 寻找",
              "look round 四处打量，看看",
              "look up 查出，找出",
              "look forward to 盼望",
              "look after 照看，照顾",
              "look over 检查，翻阅",
              "look through 看一遍，过一遍",
              "look down on / upon 看不起"
            ]
          },
          {
            "type": "text",
            "text": "3 关于行为动词的注意事项：要注意，英语中很多动词既可以是及物动词，又可以是不及物动词。"
          },
          {
            "type": "examples",
            "items": [
              {
                "en": "Let's begin.",
                "zh": "咱们开始吧。（begin 是不及物动词，后面不跟宾语）"
              },
              {
                "en": "We'll begin our class in an hour.",
                "zh": "一个小时后我们开始上课。（begin 是及物动词，后面跟宾语 our class）"
              }
            ]
          },
          {
            "type": "pitfall",
            "text": "汉语中没有及物动词与不及物动词之分，很多同学初学英语时往往忽略了这点，而这一点恰恰是很重要的，只要掌握了它，就可以避免许多不该出现的错误。"
          },
          {
            "type": "text",
            "text": "4 短语动词：动词加一个（或两个）介词或副词构成词组后，在意义上和原来的动词不同，这种词组叫短语动词或成语动词。英语里这种词组很多，而且非常有用。"
          },
          {
            "type": "list",
            "items": [
              "begin with 以……开始",
              "catch up with 赶上",
              "climb up 爬上去",
              "come back 回来",
              "come from 来自……",
              "come on 加油",
              "come out 开花",
              "come round 来，前来",
              "cross out 画叉，删除",
              "do with 处理……",
              "fall behind 落后",
              "fall off 掉下，减少",
              "fight about 为……而斗争",
              "find out 弄清楚",
              "fly away 飞走",
              "fly up 高飞",
              "get back 回来，回到……",
              "get off (the bus) 下（公共汽车）",
              "get on (the bus) 上（公共汽车）",
              "get out of (the lift, car...) 从（电梯、小汽车……）中走出来",
              "go along 沿着……走",
              "go on 继续下去",
              "go out 出去",
              "go over 仔细检查",
              "go through 经受，经历",
              "grow up 长大",
              "hear of 听说",
              "hold on (for a moment) 稍等一下（打电话用语）",
              "jump into 跳入",
              "laugh at 嘲笑",
              "learn from... 向……学习",
              "listen to 听……，注意听……",
              "look after 照顾，关照",
              "look around 参观",
              "look for 寻找",
              "look like 看起来像",
              "look over 检查，浏览",
              "make out 看出，辨认出",
              "make up 化妆",
              "move away 移走",
              "pass on sth. to sb. 传递某物给某人",
              "pass on 传递（某物）",
              "pay for 为……付钱",
              "pick up 拾起来",
              "pull up 拉上来",
              "put on (the suit, a cap) 穿（衣服），戴（帽子）",
              "sell out 卖完，卖光",
              "send for 派人去请……",
              "send up 射出，发送",
              "take off 脱掉（衣服）；（飞机）起飞",
              "take out 拿出",
              "thanks to 多亏了；由于，因为",
              "turn off (the radio, gas...) 关上（收音机、煤气……）",
              "turn on (the radio, gas...) 打开（收音机、煤气……）",
              "turn round 转身",
              "turn to 翻到……页，转向……",
              "wait for 等待",
              "wake up 醒来",
              "worry about... 为……而担心",
              "write down 写下来"
            ]
          },
          {
            "type": "examples",
            "items": [
              {
                "en": "Can you find out what time the plane leaves?",
                "zh": "你能弄清楚飞机几点起飞吗？"
              },
              {
                "en": "You should listen to the teacher if you want to learn well.",
                "zh": "如果你想学好的话，你必须注意听老师讲。"
              },
              {
                "en": "Jane is looking after the baby.",
                "zh": "简在照看这个宝宝。"
              },
              {
                "en": "Be quiet! Try not to wake the little baby up.",
                "zh": "安静！别把这个小宝宝吵醒了。"
              }
            ]
          },
          {
            "type": "text",
            "text": "【对比表】及物动词 vs 不及物动词（以 begin 为例）："
          },
          {
            "type": "table",
            "head": [
              "用法",
              "例句",
              "说明"
            ],
            "rows": [
              [
                "不及物",
                "Let's begin.",
                "后面不跟宾语"
              ],
              [
                "及物",
                "We'll begin our class in an hour.",
                "后面跟宾语 our class"
              ]
            ]
          }
        ]
      },
      {
        "heading": "四、系动词",
        "blocks": [
          {
            "type": "text",
            "text": "汉语语法中并没有系动词这一概念，所以同学们在运用系动词时会感到困难。对于系动词，重要的是要掌握这一点：它不能单独作谓语，必须和其后的表语（由形容词、名词、动名词、不定式、介词短语及副词充当）一起构成合成谓语。最常用的系动词是 be，在句中有时译为“是”，有时不必译出。"
          },
          {
            "type": "text",
            "text": "1 常用的系动词：有一些动词既可以作行为动词，又可以作系动词，这类动词主要是表示感受的感官动词和表示“保持某种状态”或“变成某种状态”的词。学习时，要注意其后的表语部分。"
          },
          {
            "type": "table",
            "head": [
              "类别",
              "动词",
              "含义"
            ],
            "rows": [
              [
                "感官动词",
                "look / taste / smell / sound / feel",
                "看起来 / 尝起来 / 闻起来 / 听起来 / 摸起来"
              ],
              [
                "表示状态的词",
                "become / remain / keep / prove",
                "变成 / 保持 / 保持 / 证明"
              ],
              [
                "表示变化或似乎",
                "get / turn / grow / appear / seem",
                "变得 / 变得 / 变得 / 好像是 / 好像是"
              ]
            ]
          },
          {
            "type": "examples",
            "items": [
              {
                "en": "The girl looks careful.",
                "zh": "这个女孩看起来很细心。（look 译为“看起来”，是系动词，与后面的形容词一起作表语）"
              },
              {
                "en": "The girl looks at the picture carefully.",
                "zh": "这个女孩认真地看这幅画。（look 为行为动词，是不及物动词，加一个介词 at，构成短语动词，可以跟介词宾语）"
              },
              {
                "en": "He feels cold.",
                "zh": "他觉得冷。"
              },
              {
                "en": "Steel feels hard.",
                "zh": "钢摸起来很硬。"
              },
              {
                "en": "Silk feels soft and comfortable.",
                "zh": "丝绸摸起来既柔软又舒服。"
              }
            ]
          },
          {
            "type": "tip",
            "text": "以上三句中的 feel 均是系动词，后面要跟形容词。"
          },
          {
            "type": "text",
            "text": "重要：feel + ...do / doing / done，意为“感觉到……正在/被”。如 He felt his heart beating faster.（他感觉到他的心跳正在加快。）此句中的 feel 是一个行为动词（实义动词）。"
          },
          {
            "type": "text",
            "text": "2 常用的系动词词组："
          },
          {
            "type": "table",
            "head": [
              "词组",
              "含义",
              "例句"
            ],
            "rows": [
              [
                "come true",
                "实现",
                "Our dream has come true at last.（我们的梦想终于实现了。）What Mary had hoped all came true.（玛丽希望实现的都实现了。）"
              ],
              [
                "get dressed",
                "穿衣服",
                "He is old enough to get dressed by himself.（他长大了，已经会自己穿衣服了。）"
              ],
              [
                "get / be married",
                "结婚",
                "What did you do before you got married?（你结婚之前做什么工作？）Mary has been married for five years.（玛丽已经结婚5年了。）"
              ],
              [
                "get / become lost",
                "迷失，迷路",
                "Sorry. I'm late for the meeting. I became / got lost.（对不起，我开会迟到了，因为我迷路了。）The little girl went for a walk and got lost.（小女孩出去散步，迷路了。）"
              ],
              [
                "seem / appear to be",
                "似乎是……，好像……",
                "The student seems to be a very kind and thoughtful person.（这个学生似乎是个善良且体贴的人。）It appears to be an excellent opportunity for Caroline to get more experience.（对于卡罗琳来说，这似乎是一个获得更多经验的绝好的机会。）"
              ]
            ]
          },
          {
            "type": "tip",
            "text": "seem 和 appear 的后面常常跟不定式 to be。"
          },
          {
            "type": "text",
            "text": "3 关于系动词后接表语的注意事项：绝大多数以 a- 开头的形容词常与系动词连用作表语，而不能作前置定语，但可以在名词后面作后置定语。以 a- 开头的常见形容词：afraid 害怕、asleep 入睡、alone 独自、alive 活（着）的、awake 醒着的。"
          },
          {
            "type": "examples",
            "items": [
              {
                "en": "He isn't asleep.",
                "zh": "他没睡着。"
              },
              {
                "en": "The boy asleep is my little brother.",
                "zh": "那个睡着了的小男孩是我弟弟。（一定不能用 the asleep boy，但可以用 the sleeping boy）"
              }
            ]
          },
          {
            "type": "text",
            "text": "【对比表】行为动词 vs 系动词（以 look / feel 为例）："
          },
          {
            "type": "table",
            "head": [
              "用法",
              "例句",
              "说明"
            ],
            "rows": [
              [
                "系动词",
                "The girl looks careful.",
                "look 后跟形容词作表语，译“看起来”"
              ],
              [
                "行为动词",
                "The girl looks at the picture carefully.",
                "look 为不及物动词，加介词 at 后跟介词宾语"
              ],
              [
                "系动词",
                "He feels cold.",
                "feel 后跟形容词，译“觉得/摸起来”"
              ],
              [
                "行为动词",
                "I feel the plane move strongly.",
                "feel 后跟“宾语 + 补足语”，是实义动词"
              ]
            ]
          }
        ]
      },
      {
        "heading": "五、助动词与情态动词（概述）",
        "blocks": [
          {
            "type": "text",
            "text": "助动词：助动词本身并没有意义，它只是帮助主要动词构成谓语，表示疑问、否定、时态、语态等。英语中有些单词并不是固定的助动词，如动词 be、have、do 等在句子中与主要动词一起构成各种时态、语态、否定句、疑问句时，才担当起助动词的作用。"
          },
          {
            "type": "examples",
            "items": [
              {
                "en": "It is made in China.",
                "zh": "它是中国制造的。（is 是助动词，帮助主要动词 made 构成一般现在时的被动语态）"
              },
              {
                "en": "I haven't had my breakfast yet.",
                "zh": "我还没吃早饭呢。（have 是助动词，帮助主要动词 had 构成现在完成时的否定句）"
              }
            ]
          },
          {
            "type": "text",
            "text": "情态动词：情态动词表示说话人对某一动作或状态的态度，认为“可能”“应当”“必要”等。情态动词有词义，但词义不完整，其后一定要跟不带 to 的动词不定式（即动词原形，ought to 除外）。另外，情态动词没有人称和数的变化。"
          },
          {
            "type": "examples",
            "items": [
              {
                "en": "He can speak English.",
                "zh": "他会说英语。（主语是第三人称单数，也不能在 can 后加 s）"
              },
              {
                "en": "He speaks English well.",
                "zh": "他英语说得很好。（时态是一般现在时，主语是第三人称单数，行为动词 speak 后要加 s）"
              }
            ]
          },
          {
            "type": "tip",
            "text": "常用的情态动词：can / could、may / might、must、need、have to、ought to。助动词和情态动词的详细用法参见第十章《助动词和情态动词》。"
          }
        ]
      },
      {
        "heading": "六、动词的基本形式",
        "blocks": [
          {
            "type": "text",
            "text": "动词有以下几种基本形式：动词原形、动词第三人称单数、过去式、过去分词和现在分词。"
          },
          {
            "type": "text",
            "text": "1 动词第三人称单数的构成"
          },
          {
            "type": "table",
            "head": [
              "构成法",
              "例词",
              "读法"
            ],
            "rows": [
              [
                "词尾加 -s",
                "help→helps；know→knows；get→gets；ride→rides",
                "s 在清辅音后读[s]，在浊辅音或元音后读[z]；在 t 后读[ts]，在 d 后读[dz]"
              ],
              [
                "以字母 s / x / ch / sh 结尾的动词加 -es",
                "guess→guesses；fix→fixes；wash→washes",
                "es 读[iz]"
              ],
              [
                "以 o 结尾的动词加 -es",
                "go→goes；do→does",
                "es 读[z]"
              ],
              [
                "以“辅音字母 + y”结尾的动词，先变 y 为 i，再加 -es",
                "fly→flies；study→studies",
                "es 读[z]"
              ]
            ]
          },
          {
            "type": "text",
            "text": "2 动词的过去式及过去分词的构成 / (1) 规则动词的变化"
          },
          {
            "type": "table",
            "head": [
              "构成法",
              "例词"
            ],
            "rows": [
              [
                "一般加 -ed",
                "work→worked, worked"
              ],
              [
                "以 e 结尾的词加 -d",
                "live→lived, lived"
              ],
              [
                "以“辅音字母 + y”结尾的词，改 y 为 i，再加 -ed",
                "study→studied, studied；cry→cried, cried"
              ],
              [
                "以“元音字母 + y”结尾的词，直接加 -ed",
                "play→played, played"
              ],
              [
                "以重读闭音节或 r 音节结尾，末尾只有一个辅音字母的词，要双写这个辅音字母，再加 -ed",
                "stop→stopped, stopped；prefer→preferred, preferred"
              ]
            ]
          },
          {
            "type": "tip",
            "text": "注意：词尾 -ed 在清辅音后读[t]；在元音和浊辅音后读[d]；在辅音 t、d 后读[id]。"
          },
          {
            "type": "text",
            "text": "(2) 不规则动词的变化（参见本章不规则动词变化表）："
          },
          {
            "type": "table",
            "head": [
              "现在式",
              "过去式",
              "过去分词"
            ],
            "rows": [
              [
                "beat 打，敲",
                "beat",
                "beaten"
              ],
              [
                "become 成为",
                "became",
                "become"
              ],
              [
                "begin 开始",
                "began",
                "begun"
              ],
              [
                "bite 咬",
                "bit",
                "bitten / bit"
              ],
              [
                "blow 吹",
                "blew",
                "blown"
              ],
              [
                "break 打破",
                "broke",
                "broken"
              ],
              [
                "bring 携带",
                "brought",
                "brought"
              ],
              [
                "build 建造",
                "built",
                "built"
              ],
              [
                "burn 燃烧",
                "burned / burnt",
                "burned / burnt"
              ],
              [
                "buy 买",
                "bought",
                "bought"
              ],
              [
                "catch 抓住",
                "caught",
                "caught"
              ],
              [
                "choose 选择",
                "chose",
                "chosen"
              ],
              [
                "come 来",
                "came",
                "come"
              ],
              [
                "drink 喝",
                "drank",
                "drunk"
              ],
              [
                "drive 驾驶",
                "drove",
                "driven"
              ],
              [
                "eat 吃",
                "ate",
                "eaten"
              ],
              [
                "fall 落下",
                "fell",
                "fallen"
              ],
              [
                "feed 喂",
                "fed",
                "fed"
              ],
              [
                "feel 觉得",
                "felt",
                "felt"
              ],
              [
                "fight 打斗",
                "fought",
                "fought"
              ],
              [
                "find 找",
                "found",
                "found"
              ],
              [
                "fly 飞",
                "flew",
                "flown"
              ],
              [
                "leave 离开",
                "left",
                "left"
              ],
              [
                "lend 借出",
                "lent",
                "lent"
              ],
              [
                "let 让",
                "let",
                "let"
              ],
              [
                "lie 躺",
                "lay",
                "lain"
              ],
              [
                "lose 遗失",
                "lost",
                "lost"
              ],
              [
                "make 做",
                "made",
                "made"
              ],
              [
                "meet 遇见",
                "met",
                "met"
              ],
              [
                "pay 支付",
                "paid",
                "paid"
              ],
              [
                "read 读",
                "read",
                "read"
              ],
              [
                "rise 上升",
                "rose",
                "risen"
              ],
              [
                "run 跑",
                "ran",
                "run"
              ],
              [
                "say 说",
                "said",
                "said"
              ],
              [
                "see 看见",
                "saw",
                "seen"
              ],
              [
                "sell 售卖",
                "sold",
                "sold"
              ],
              [
                "send 送",
                "sent",
                "sent"
              ],
              [
                "shine 照耀 / 擦去、磨光",
                "shone / shined",
                "shone / shined"
              ],
              [
                "shoot 发射",
                "shot",
                "shot"
              ],
              [
                "sing 唱歌",
                "sang",
                "sung"
              ],
              [
                "sit 坐下",
                "sat",
                "sat"
              ],
              [
                "sleep 睡觉",
                "slept",
                "slept"
              ],
              [
                "smell 嗅，闻",
                "smelt / smelled",
                "smelt / smelled"
              ],
              [
                "speak 说",
                "spoke",
                "spoken"
              ],
              [
                "spell 拼写",
                "spelt / spelled",
                "spelt / spelled"
              ]
            ]
          },
          {
            "type": "table",
            "head": [
              "现在式",
              "过去式",
              "过去分词"
            ],
            "rows": [
              [
                "forget 忘记",
                "forgot",
                "forgotten / forgot"
              ],
              [
                "forgive 原谅",
                "forgave",
                "forgiven"
              ],
              [
                "get 获得",
                "got",
                "gotten / got"
              ],
              [
                "give 给",
                "gave",
                "given"
              ],
              [
                "go 去",
                "went",
                "gone"
              ],
              [
                "grow 生长",
                "grew",
                "grown"
              ],
              [
                "hang 挂",
                "hung",
                "hung"
              ],
              [
                "hear 听",
                "heard",
                "heard"
              ],
              [
                "hit 击打",
                "hit",
                "hit"
              ],
              [
                "hold 持",
                "held",
                "held"
              ],
              [
                "hurt 伤害",
                "hurt",
                "hurt"
              ],
              [
                "keep 保持",
                "kept",
                "kept"
              ],
              [
                "know 知道",
                "knew",
                "known"
              ],
              [
                "lay 放置",
                "laid",
                "laid"
              ],
              [
                "lead 引导",
                "led",
                "led"
              ],
              [
                "learn 学习",
                "learned / learnt",
                "learned / learnt"
              ],
              [
                "spend 花费",
                "spent",
                "spent"
              ],
              [
                "stand 站立",
                "stood",
                "stood"
              ],
              [
                "steal 偷窃",
                "stole",
                "stolen"
              ],
              [
                "sweep 扫除",
                "swept",
                "swept"
              ],
              [
                "swim 游泳",
                "swam",
                "swum"
              ],
              [
                "swing 摇摆",
                "swung",
                "swung"
              ],
              [
                "take 拿，握，抓",
                "took",
                "taken"
              ],
              [
                "teach 教",
                "taught",
                "taught"
              ],
              [
                "tear 撕",
                "tore",
                "torn"
              ],
              [
                "tell 告诉",
                "told",
                "told"
              ],
              [
                "think 想",
                "thought",
                "thought"
              ],
              [
                "throw 投",
                "threw",
                "thrown"
              ],
              [
                "understand 了解",
                "understood",
                "understood"
              ],
              [
                "wear 穿",
                "wore",
                "worn"
              ],
              [
                "win 赢",
                "won",
                "won"
              ],
              [
                "write 写",
                "wrote",
                "written"
              ]
            ]
          },
          {
            "type": "text",
            "text": "3 动词的现在分词的构成"
          },
          {
            "type": "table",
            "head": [
              "构成法",
              "例词"
            ],
            "rows": [
              [
                "一般加 -ing",
                "work→working；study→studying"
              ],
              [
                "以 e 结尾的动词去 e 后加 -ing",
                "live→living"
              ],
              [
                "以重读闭音节或 r 音节结尾，末尾只有一个辅音字母的词，要双写这个辅音字母，再加 -ing",
                "stop→stopping；refer→referring"
              ],
              [
                "以 ie 结尾的重读开音节词，改 ie 为 y，再加 -ing",
                "die→dying"
              ]
            ]
          },
          {
            "type": "tip",
            "text": "注意：以 y 结尾的动词变为现在分词时，y 不变，直接加上 -ing。如 play→playing；study→studying。"
          }
        ]
      },
      {
        "heading": "七、动词的时态",
        "blocks": [
          {
            "type": "text",
            "text": "1 动词时态概述：时态是表示动作与时间相互关系的语法范畴。正确使用时态能反映一个人的英语基本功。对中国学生来说，英语的时态是相当困难的一个语法项目，原因之一是中文动词没有时态形式的变化：中文动词不是用词形的变化，而是用特定的词语（如“现在”“将来”“过去”“正在”“经常”“了”“过”“已经”等）来说明动作发生的时间，动词本身并无变化。在英语中，则用动词本身的词形变化或加助动词表示动作的时间。"
          },
          {
            "type": "examples",
            "items": [
              {
                "en": "She reads newspapers every day.",
                "zh": "她每天看报纸。（句中有 every day，所以用现在时）"
              },
              {
                "en": "She read the newspaper yesterday.",
                "zh": "她昨天看了这张报纸。（句中有 yesterday，所以用过去时）"
              },
              {
                "en": "She will read the newspaper tomorrow.",
                "zh": "她明天看这张报纸。（句中有 tomorrow，所以用将来时）"
              },
              {
                "en": "She is reading the newspaper now.",
                "zh": "她正在看报纸。（句中有 now，所以用现在进行时）"
              },
              {
                "en": "She has read the newspaper.",
                "zh": "她已经读过这张报纸了。（句中虽没有标识性的时间状语，但因为表示的是“过去的动作对现在的影响”，所以要用现在完成时）"
              }
            ]
          },
          {
            "type": "text",
            "text": "2 动词十二种时态的形式：英语动词共有十六种时态，一般语法书列出的要求掌握的时态为“现在”“过去”和“将来”三大类，每类中又分为“一般”“进行”“完成”“完成进行”四种，共十二种。下面以 study 为例列表说明。"
          },
          {
            "type": "table",
            "head": [
              "时间",
              "一般时",
              "进行时",
              "完成时",
              "完成进行时"
            ],
            "rows": [
              [
                "现在",
                "I study.\nYou study.\nHe studies.\nWe study.\nThey study.",
                "I am studying.\nYou are studying.\nHe is studying.\nWe are studying.\nThey are studying.",
                "I have studied.\nYou have studied.\nHe has studied.\nWe have studied.\nThey have studied.",
                "I have been studying.\nYou have been studying.\nHe has been studying.\nWe have been studying.\nThey have been studying."
              ],
              [
                "过去",
                "I studied.\nYou studied.\nHe studied.\nWe studied.\nThey studied.",
                "I was studying.\nYou were studying.\nHe was studying.\nWe were studying.\nThey were studying.",
                "I had studied.\nYou had studied.\nHe had studied.\nWe had studied.\nThey had studied.",
                "I had been studying.\nYou had been studying.\nHe had been studying.\nWe had been studying.\nThey had been studying."
              ],
              [
                "将来",
                "I shall study.\nYou will study.\nHe will study.\nWe shall study.\nThey will study.",
                "I shall be studying.\nYou will be studying.\nHe will be studying.\nWe shall be studying.\nThey will be studying.",
                "I shall have studied.\nYou will have studied.\nHe will have studied.\nWe shall have studied.\nThey will have studied.",
                "I shall have been studying.\nYou will have been studying.\nHe will have been studying.\nWe shall have been studying.\nThey will have been studying."
              ]
            ]
          },
          {
            "type": "tip",
            "text": "初中阶段最常用的时态有 5 种，即一般现在时、一般过去时、现在进行时、一般将来时和现在完成时。下面的几章将分别讲述各种时态的具体用法。"
          }
        ]
      },
      {
        "heading": "八、易错陷阱与实力测验",
        "blocks": [
          {
            "type": "text",
            "text": "Common Mistakes（失分陷阱，例题均取自各地中考）："
          },
          {
            "type": "pitfall",
            "text": "陷阱例题1（北京中考）Don't ______ the radio. The baby is sleeping. A. turn off B. turn on C. turn over D. turn down → 答案 B。句意提示：不要打开收音机，婴儿正在睡觉。turn off 意为“关掉，（使某人）不高兴”；turn on 意为“打开，启动”；turn over 意为“打翻，移交给，变换电视频道”；turn down 意为“拒绝，把……调低，关小”。"
          },
          {
            "type": "pitfall",
            "text": "陷阱例题2（北京中考）I'm interested in animals, so I ______ every Saturday working in an animal hospital. A. pay B. get C. take D. spend → 答案 D。spend 常用于“spend...doing sth.”句型，意为“花费……做……”；pay 常用于固定搭配“pay sb. for sth.”，表示“付钱给某人”；take 的主语一般为 it 或物。"
          },
          {
            "type": "pitfall",
            "text": "陷阱例题3（哈尔滨中考）A: How long have you ______ the motorbike? B: For about two weeks. A. bought B. had C. borrowed D. lent → 答案 B。本题考查延续性动词和非延续性动词用法的区别：延续性动词可以同一段时间连用，而非延续性动词则不可以。由题意可知是询问一段时间，四个选项中只有 had 是延续性动词。"
          },
          {
            "type": "pitfall",
            "text": "陷阱例题4（天津中考）With the help of the Internet, news can ______ every corner of the world. A. arrive B. reach C. go D. get → 答案 B。本题考查及物动词和不及物动词的用法区别：arrive、go、get 为不及物动词，需跟介词才能接地点名词，如 arrive in/at、go to、get to；reach 为及物动词，后面可直接连接地点，表示“到达……”。"
          },
          {
            "type": "text",
            "text": "实力测验（第180—181页）题型速览："
          },
          {
            "type": "list",
            "items": [
              "1 选用下列动词的适当形式填空：smell, sound, taste, go, get, become, grow, seem, look, feel, turn, stay（共 15 题，考查系动词后接形容词表语等）。",
              "2 选择括号中的正确答案填空：receive/accept、allow/agree、with/to、Work/Working、have taken/have been taken、reading/to read、posting/to post 等（考查易混动词与固定搭配）。",
              "3 选用每组中合适的动词并用其正确形式填空：A. match, fit, suit；B. pay, take, spend, cost；C. lie（躺，lay, lain, lying）、lie（说谎，lied, lied, lying）、lay（放，laid, laid, laying）；D. raise, rise。"
            ]
          },
          {
            "type": "tip",
            "text": "练习页（第180—181页）的答案栏在教材原图中为空白，此处只转写题型与考点，未编造答案。"
          }
        ]
      }
    ],
    "notes": [
      "第170—171页、第176—177页为跨页大表（系动词、系动词词组、不规则动词变化表），拍照有轻微倾斜，文字清晰可辨，已按表结构逐格还原。",
      "第180—181页“实力测验”的答案栏在教材原图中为空白，只转写题型与考点，未编造答案。"
    ]
  }
];
