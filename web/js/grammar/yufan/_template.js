// web/js/grammar/yufan/<slug>.js —— 由 yufan 教材扫描图片整理的语法讲义数据
// 契约见同目录 README.md；本文件仅为格式示例，交付时请写真实内容。
// 自检：node --check web/js/grammar/yufan/<slug>.js

export default [
  {
    topicId: "g-example",           // 目标专题 id（见 README §6 映射表）
    newTopic: false,                // true 时需补 category / difficulty / forms / points / pitfalls / examTips / memoryCard
    title: "示例专题",
    sourceDirs: ["yufan/示例"],
    imagesRead: 0,                  // 必须等于你实际看过的图片数量
    summary: "一句话概述。",
    intro: "讲义导语（可选）。",
    sections: [
      {
        heading: "一、小节标题",
        blocks: [
          { type: "text", text: "讲解段落。" },
          { type: "list", items: ["要点一", "要点二"] },
          { type: "table", head: ["列1", "列2"], rows: [["a", "b"], ["c", "d"]] },
          { type: "examples", items: [{ en: "This is an example.", zh: "这是一个例句。" }] },
          { type: "tip", text: "小提示。" },
          { type: "pitfall", text: "易错提醒。" },
        ],
      },
    ],
    extras: {
      // forms: [{ name: "", pattern: "", note: "" }],
      // points: [{ title: "", desc: "", good: [], bad: [] }],
      // contrasts: [{ title: "", head: [], rows: [[]] }],
      // pitfalls: [""],
      // examTips: [""],
      // memoryCard: [""],
    },
  },
];