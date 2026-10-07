package learning

import (
	"strings"
	"testing"
)

func agentCardBool(value bool) *bool { return &value }

// agentCardFixture is the "看词选义" state used by the card tests: the learner
// picked 毛衣 for a cold, and the library says 感冒.
func agentCardFixture() AgentSnapshot {
	return AgentSnapshot{
		Scene:    "meaning",
		Mode:     "meaning",
		QuizType: "en-zh",
		Current: &AgentCurrentItem{
			Level: "primary", WordID: "a cold", Spelling: "a cold", Meaning: "感冒",
			Options:       []string{"感冒", "毛衣", "不但……而且……", "几乎，接近"},
			CorrectAnswer: "感冒", SelectedAnswer: "毛衣", Answered: true, IsCorrect: false,
		},
	}
}

func TestParseAgentCardBuildsStructuredCard(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	reply := "```json\n" + `{
  "kind": "explain",
  "headline": "a cold = 感冒（表示生病，不是“冷”）",
  "verdict": "模型自己编的判定，应该被服务端覆盖",
  "points": [
    {"label": "记忆线索", "text": "cold 单独用是“寒冷”，加 a 变成名词短语 a cold 就是感冒。"},
    {"label": "易混对比", "text": "chill 是“发冷”，a cold 已经是名词了。"},
    {"label": "", "text": "空标题应该补成“要点”。"}
  ],
  "example": {"en": "I have a cold.", "zh": "我感冒了。"},
  "check": {"prompt": "a cold 和 cold 有什么区别？", "answer": "感冒"},
  "words": [
    {"word": "cold", "meaning": ""},
    {"word": "chill", "meaning": "发冷"},
    {"word": "freezing", "meaning": "极冷的"}
  ],
  "action": {"label": "", "text": "把例句读两遍，再造一句。", "kind": "read"}
}` + "\n```"

	card := store.parseAgentCard(reply, agentCardFixture())
	if card == nil {
		t.Fatal("结构化回答应该被解析成卡片")
	}
	if card.Kind != "explain" {
		t.Fatalf("kind = %q", card.Kind)
	}
	if !strings.Contains(card.Headline, "a cold") {
		t.Fatalf("headline 丢失：%q", card.Headline)
	}
	if len(card.Points) != 3 || card.Points[2].Label != "要点" {
		t.Fatalf("points 处理不正确：%+v", card.Points)
	}
	if card.Example == nil || card.Example.En != "I have a cold." {
		t.Fatalf("example 丢失：%+v", card.Example)
	}
	if card.Check == nil || card.Check.Answer != "感冒" {
		t.Fatalf("check 丢失：%+v", card.Check)
	}
	if card.Action == nil || card.Action.Label != "30 秒小动作" || card.Action.Kind != "read" {
		t.Fatalf("action 处理不正确：%+v", card.Action)
	}
}

func TestParseAgentCardVerdictComesFromLibrary(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	reply := `{"headline":"a cold 是感冒","verdict":"我答对了","points":[{"label":"要点","text":"cold 加 a 变成名词。"}]}`
	card := store.parseAgentCard(reply, agentCardFixture())
	if card == nil {
		t.Fatal("卡片应该解析成功")
	}
	want := "你选了「毛衣」，正确答案是「感冒」"
	if card.Verdict != want {
		t.Fatalf("verdict 必须由服务端依据学习记录填写，得到 %q，想要 %q", card.Verdict, want)
	}
}

func TestParseAgentCardCheckNeverContradictsAnswerKey(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	reply := `{"headline":"a cold 是感冒","points":[{"label":"要点","text":"cold 加 a 变成名词。"}],
	  "check":{"prompt":"a cold 是什么意思？","answer":"毛衣"}}`
	card := store.parseAgentCard(reply, agentCardFixture())
	if card == nil || card.Check == nil {
		t.Fatal("卡片应该解析成功")
	}
	if card.Check.Answer != "感冒" {
		t.Fatalf("自测答案与词库冲突时应以词库为准，得到 %q", card.Check.Answer)
	}
}

func TestParseAgentCardDropsFabricatedWords(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	reply := `{"headline":"a cold 是感冒","points":[{"label":"对比","text":"chill 表示发冷。"}],
	  "words":[{"word":"cold"},{"word":"chill","meaning":"发冷"},{"word":"freezing","meaning":"极冷的"}]}`
	card := store.parseAgentCard(reply, agentCardFixture())
	if card == nil {
		t.Fatal("卡片应该解析成功")
	}
	if len(card.Words) != 2 {
		t.Fatalf("没有依据的生词应被丢弃，得到 %+v", card.Words)
	}
	if card.Words[0].Word != "cold" || card.Words[0].Level != "primary" || card.Words[0].ID != "cold" {
		t.Fatalf("词库命中的生词应补全 level/id/释义：%+v", card.Words[0])
	}
	if card.Words[0].Meaning != "寒冷的" {
		t.Fatalf("模型没给释义时应回填词库释义，得到 %q", card.Words[0].Meaning)
	}
	for _, word := range card.Words {
		if word.Word == "freezing" {
			t.Fatalf("编造的生词不应保留：%+v", card.Words)
		}
	}
}

// The library id is not always the spelling: the country word the learner is being
// quizzed on is stored as "country-netherlands", and "American" as "american adj".
// The card must still be able to back such a word with its library entry, otherwise
// the chip shows up with no id and "加入今日复习" has nothing to attach to.
// (Caught by the live 线上测试 on 2026-10-06: the card word list came back as
// Netherlands / nether / Holland / Dutch, all without ids.)
func TestParseAgentCardResolvesWordBySpelling(t *testing.T) {
	store := withTestLibrary(t, []Word{
		{ID: "country-netherlands", Word: "Netherlands", Meaning: "荷兰", Pos: "noun", Level: "primary", Topic: "国家", Status: "published"},
	})
	reply := `{"headline":"Netherlands 是专有名词，意思是「荷兰」",
	  "points":[{"label":"词性","text":"Netherlands 是专有名词。"},{"label":"搭配","text":"in the Netherlands"}],
	  "words":[{"word":"Netherlands","meaning":""}]}`
	card := store.parseAgentCard(reply, agentCardFixture())
	if card == nil {
		t.Fatal("卡片应该解析成功")
	}
	if len(card.Words) != 1 {
		t.Fatalf("应保留 1 个生词，得到 %+v", card.Words)
	}
	if card.Words[0].ID != "country-netherlands" {
		t.Fatalf("拼写命中词库时应补全 id，得到 %+v", card.Words[0])
	}
	if card.Words[0].Level != "primary" {
		t.Fatalf("拼写命中词库时应补全 level，得到 %+v", card.Words[0])
	}
	if card.Words[0].Meaning != "荷兰" {
		t.Fatalf("模型没给释义时应回填词库释义，得到 %q", card.Words[0].Meaning)
	}
}

// 线上实测（2026-10-06 深夜）：学生做的是小学题，干扰项却来自初中词库
// （「物体，目标，物品」只存在于 middle 的 object）。这种词按本题学段查不到，
// 就会丢掉 id，生词芯片点不动；兜底必须跨学段再查一次。
func TestParseAgentCardResolvesWordFromOtherStage(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	object := Word{ID: "object", Word: "object", Meaning: "物体，目标，物品", Pos: "n.", Level: "middle", Status: "published"}
	store.datasets["middle"] = []Word{object}
	store.wordIndex[progressKey("middle", object.ID)] = object
	reply := `{"headline":"a cold 是感冒，不是「物体，目标，物品」",
	  "points":[{"label":"易混","text":"object 是「物体」，和 a cold 是两回事。"},{"label":"记忆","text":"cold 单独用是「寒冷」。"}],
	  "words":[{"word":"object","meaning":""}]}`
	card := store.parseAgentCard(reply, agentCardFixture())
	if card == nil {
		t.Fatal("卡片应该解析成功")
	}
	if len(card.Words) != 1 {
		t.Fatalf("应保留 1 个生词，得到 %+v", card.Words)
	}
	if card.Words[0].ID != "object" {
		t.Fatalf("跨学段命中词库时应补全 id，得到 %+v", card.Words[0])
	}
	if card.Words[0].Level != "middle" {
		t.Fatalf("level 应跟随词库所在学段，得到 %+v", card.Words[0])
	}
	if card.Words[0].Meaning != "物体，目标，物品" {
		t.Fatalf("模型没给释义时应回填词库释义，得到 %q", card.Words[0].Meaning)
	}
}

// 线上实测（2026-10-06 深夜）：服务商给这张卡片的输出预算有限（deepseek-flash 截在 512
// token），模型写到一半就被掐断，整段不是合法 JSON，但前面写完的字段仍然是。
// 抢救逻辑必须保住「已经写完的那部分」，而不是把半段 JSON 原文甩给学生。
func TestParseAgentCardSalvagesTruncatedReply(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	reply := `{"kind":"explain","headline":"colour 表示「颜色」，也可作动词「给…着色」",
	  "points":[{"label":"词性与核心义","text":"colour 主要是名词，意思是「颜色」。"},
	  {"label":"常见搭配","text":"What colour…? 问颜色；favourite colour 最喜欢的颜色；in`
	card := store.parseAgentCard(reply, agentCardFixture())
	if card == nil {
		t.Fatal("被截断的回答应被抢救成卡片，而不是回落纯文本")
	}
	if !strings.Contains(card.Headline, "colour") {
		t.Fatalf("抢救出来的卡片应保留已写完的 headline，得到 %q", card.Headline)
	}
	if len(card.Points) != 1 {
		t.Fatalf("只应保留写完的要点（没写完的那条要被丢掉），得到 %+v", card.Points)
	}
	if card.Points[0].Label != "词性与核心义" {
		t.Fatalf("要点内容不对：%+v", card.Points[0])
	}
}

// 半段 JSON 里连一个完整字段都没有时，抢救应当放弃并回落纯文本，绝不凭空造卡片。
func TestParseAgentCardSalvageGivesUpWithoutCompleteFields(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	if card := store.parseAgentCard(`{"headline":"被截断在标题里`, agentCardFixture()); card != nil {
		t.Fatalf("没有完整字段时不应造出卡片，得到 %+v", card)
	}
}

func TestParseAgentCardRejectsUnusableReplies(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	cases := map[string]string{
		"普通文本":   "先看词性，再看搭配，最后记例句。",
		"坏 JSON": `{"headline": "a cold", "points": [`,
		"标题为空":   `{"headline":"", "points":[{"label":"要点","text":"内容"}]}`,
		"没有内容":   `{"headline":"a cold 是感冒","points":[]}`,
	}
	for name, reply := range cases {
		if card := store.parseAgentCard(reply, agentCardFixture()); card != nil {
			t.Fatalf("%s：应该拒绝并回落到文本，得到 %+v", name, card)
		}
	}
}

func TestParseAgentCardKindFallsBackToScene(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	snapshot := agentCardFixture()
	snapshot.Scene = "mistake"
	reply := `{"headline":"错因是词义混淆","points":[{"label":"错因","text":"把种类和相似混为一谈。"}]}`
	card := store.parseAgentCard(reply, snapshot)
	if card == nil || card.Kind != "mistake" {
		t.Fatalf("kind 缺省时应跟随场景，得到 %+v", card)
	}
}

func TestAgentWantsCardDefaults(t *testing.T) {
	cases := []struct {
		name        string
		format      string
		hasSnapshot bool
		want        bool
	}{
		{name: "有上下文默认卡片", hasSnapshot: true, want: true},
		{name: "没有上下文默认文本", hasSnapshot: false, want: false},
		{name: "显式要求卡片", format: "card", hasSnapshot: false, want: true},
		{name: "显式要求文本", format: "text", hasSnapshot: true, want: false},
		{name: "未知取值跟随上下文", format: "weird", hasSnapshot: true, want: true},
	}
	for _, item := range cases {
		got := agentWantsCard(AgentChatRequest{Format: item.format}, item.hasSnapshot)
		if got != item.want {
			t.Fatalf("%s：agentWantsCard(%q, %v) = %v，想要 %v", item.name, item.format, item.hasSnapshot, got, item.want)
		}
	}
}

func TestAgentCardInstructionDemandsJSON(t *testing.T) {
	text := agentCardInstruction("meaning")
	for _, want := range []string{"headline", "points", "example", "check", "action", "禁止 Markdown 代码围栏"} {
		if !strings.Contains(text, want) {
			t.Fatalf("卡片指令缺少 %q：%s", want, text)
		}
	}
	if !strings.Contains(text, "词性与核心义项") {
		t.Fatalf("卡片指令应该带上场景要点：%s", text)
	}
}

func TestAgentCardDigestKeepsSubstance(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	reply := `{"headline":"a cold 是感冒","points":[{"label":"记忆线索","text":"cold 加 a 变成名词。"}],
	  "example":{"en":"I have a cold.","zh":"我感冒了。"}}`
	card := store.parseAgentCard(reply, agentCardFixture())
	digest := agentCardDigest(card)
	if strings.Contains(digest, "{") || strings.Contains(digest, "headline") {
		t.Fatalf("记忆沉淀应该是可读摘要而不是 JSON：%s", digest)
	}
	if !strings.Contains(digest, "a cold 是感冒") || !strings.Contains(digest, "I have a cold.") {
		t.Fatalf("摘要应该保留结论与例句：%s", digest)
	}
}

func TestBuildAgentReceiptListsWhatWasRead(t *testing.T) {
	snapshot := agentCardFixture()
	snapshot.Current.History = &AgentWordHistory{Seen: 5, Correct: 1, Wrong: 4}
	snapshot.Session = &AgentSessionInfo{Answered: 7, Correct: 6}
	snapshot.PageMap = []AgentPageMapItem{{Spelling: "a bit", Correct: agentCardBool(false)}}
	receipt := buildAgentReceipt(snapshot, "【当前题目】a cold")
	if receipt == nil {
		t.Fatal("应该有条目")
	}
	got := map[string]bool{}
	for _, item := range receipt.Items {
		got[item.Key] = item.OK
	}
	for _, key := range []string{"current", "history", "session", "page"} {
		if !got[key] {
			t.Fatalf("%s 应该标记为已读：%+v", key, receipt.Items)
		}
	}
	if got["review"] {
		t.Fatalf("没有到期复习时不应该声称读到：%+v", receipt.Items)
	}
	if receipt.Text != "【当前题目】a cold" {
		t.Fatalf("回执应带走快照原文：%q", receipt.Text)
	}
	if buildAgentReceipt(AgentSnapshot{}, "") != nil {
		t.Fatal("空快照不应该产生回执")
	}
}

func TestPageMapRendersRecentMistakesAsFacts(t *testing.T) {
	snapshot := AgentSnapshot{
		Scene: "meaning",
		Mode:  "meaning",
		PageMap: []AgentPageMapItem{
			{Spelling: "a bit", Correct: agentCardBool(false)},
			{Spelling: "a few", Correct: agentCardBool(true)},
			{Spelling: "warm"},
		},
	}
	text := renderAgentSnapshot(snapshot)
	if !strings.Contains(text, "【本页全景】本页 3 题：已答 2、错 1（a bit）") {
		t.Fatalf("本页全景渲染不正确：\n%s", text)
	}
}

func TestAgentSnapshotCarriesNonQuestionPages(t *testing.T) {
	store := withTestLibrary(t, agentDrillWords())
	now := agentTestNow()
	snapshot := store.buildAgentSnapshot(User{ID: "student-1"}, AgentChatRequest{
		Mode: "tongbu",
		Context: map[string]any{
			"scene": "tongbu", "setTitle": "Starter Unit 1", "unitIndex": "4/20",
		},
	}, now)
	if snapshot.Page == nil || snapshot.Page.Kind != "tongbu" {
		t.Fatalf("同步训练页应该有位置信息：%+v", snapshot.Page)
	}
	text := renderAgentSnapshot(snapshot)
	if !strings.Contains(text, "【同步训练】套题：Starter Unit 1 · 进度：4/20") {
		t.Fatalf("页面位置渲染不正确：\n%s", text)
	}
	if strings.Contains(text, "页面没有提供具体题目") {
		t.Fatalf("有页面位置时不应该说自己没有题目：\n%s", text)
	}
}

func TestSceneFromModeCoversNewPages(t *testing.T) {
	cases := map[string]string{
		"meaning": "meaning", "quiz": "quiz", "reading": "reading", "mistake": "mistake",
		"exam": "exam", "homework": "homework", "tongbu": "tongbu", "course": "course",
		"drill": "drill", "grammar": "grammar", "unknown": "general",
	}
	for mode, want := range cases {
		if got := agentSceneFromMode(mode); got != want {
			t.Fatalf("agentSceneFromMode(%q) = %q，想要 %q", mode, got, want)
		}
	}
}

func TestNewScenesHaveGuides(t *testing.T) {
	for _, scene := range []string{"tongbu", "homework", "course", "drill", "grammar"} {
		guide := agentSceneGuides[scene]
		if strings.TrimSpace(guide) == "" {
			t.Fatalf("场景 %s 缺少教学指令", scene)
		}
		if !strings.Contains(guide, "当前场景") {
			t.Fatalf("场景 %s 的指令格式不一致：%s", scene, guide)
		}
	}
}
