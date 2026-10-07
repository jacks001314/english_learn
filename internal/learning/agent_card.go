package learning

import (
	"encoding/json"
	"strconv"
	"strings"
)

// 结构化教学卡片。
//
// 助教的讲解不再是一段散文，而是一张固定结构的卡片：结论 → 要点 → 例句 → 30 秒自测 →
// 生词 → 行动。模型按要求输出 JSON，服务端解析、裁剪并做一致性兜底；解析失败时返回
// nil，由前端回落到原来的 Markdown 渲染，保证任何情况下都不会白屏。
//
// 两条硬规则：
//  1. verdict（本题判定）永远由服务端依据学习记录填写，不采信模型输出；
//  2. words 里的生词只有在词库中查得到、或确实出现在讲解正文里时才保留，避免编造。

const (
	agentCardMaxPoints        = 4
	agentCardMaxWords         = 4
	agentCardHeadlineMaxRunes = 60
	agentCardPointLabelRunes  = 14
	agentCardPointTextRunes   = 140
	agentCardExampleRunes     = 200
	agentCardCheckRunes       = 160
	agentCardWordMeaningRunes = 24
	agentCardActionTextRunes  = 120
)

// AgentCardPoint 是卡片里的一条要点（带小标题）。
type AgentCardPoint struct {
	Label string `json:"label"`
	Text  string `json:"text"`
}

// AgentCardExample 是卡片里的可迁移例句。
type AgentCardExample struct {
	En string `json:"en,omitempty"`
	Zh string `json:"zh,omitempty"`
}

// AgentCardCheck 是卡片里的 30 秒自测。
type AgentCardCheck struct {
	Prompt string `json:"prompt"`
	Answer string `json:"answer,omitempty"`
}

// AgentCardWord 是卡片里可以点读、可以入册的生词。
type AgentCardWord struct {
	Word    string `json:"word"`
	Meaning string `json:"meaning,omitempty"`
	Level   string `json:"level,omitempty"`
	ID      string `json:"id,omitempty"`
}

// AgentCardAction 是卡片底部的行动条。
type AgentCardAction struct {
	Label string `json:"label,omitempty"`
	Text  string `json:"text"`
	Kind  string `json:"kind,omitempty"`
}

// AgentCard is one teaching card rendered by the assistant panel.
type AgentCard struct {
	Kind     string            `json:"kind,omitempty"`
	Headline string            `json:"headline"`
	Verdict  string            `json:"verdict,omitempty"`
	Points   []AgentCardPoint  `json:"points,omitempty"`
	Example  *AgentCardExample `json:"example,omitempty"`
	Check    *AgentCardCheck   `json:"check,omitempty"`
	Words    []AgentCardWord   `json:"words,omitempty"`
	Action   *AgentCardAction  `json:"action,omitempty"`
}

// AgentReceiptItem 是「助教已读」里的一个标签。
type AgentReceiptItem struct {
	Key   string `json:"key"`
	Label string `json:"label"`
	OK    bool   `json:"ok"`
}

// AgentReceipt 告诉学生这次回答到底读了哪些数据，让「它知道你在干什么」可核对。
type AgentReceipt struct {
	Items []AgentReceiptItem `json:"items"`
	Stale bool               `json:"stale,omitempty"`
	Text  string             `json:"text,omitempty"`
}

// agentCardInstruction is appended to the system prompt when the caller asks for
// a structured card. It deliberately overrides the "350 字以内" rule of the
// common rules above, because a card is short by construction.
func agentCardInstruction(scene string) string {
	guide := agentSceneGuides[scene]
	if guide == "" {
		guide = agentSceneGuides["general"]
	}
	var b strings.Builder
	b.WriteString("输出格式（本节规则优先于上面的字数要求）：你要返回的是一张「教学卡片」的数据，不是散文。")
	b.WriteString("只输出一个合法 JSON 对象，禁止 Markdown 代码围栏，禁止出现 JSON 之外的任何解释文字。\n")
	b.WriteString("字段与限制：\n")
	b.WriteString("- kind: explain | mistake | compare | reading | general，按当前场景选择\n")
	b.WriteString("- headline: 一句话结论，≤" + strconv.Itoa(agentCardHeadlineMaxRunes) + " 字，必填\n")
	b.WriteString("- points: 数组，1–" + strconv.Itoa(agentCardMaxPoints) + " 条，每条 {\"label\":\"≤" +
		strconv.Itoa(agentCardPointLabelRunes) + " 字的小标题\",\"text\":\"≤" + strconv.Itoa(agentCardPointTextRunes) + " 字\"}\n")
	b.WriteString("- example: {\"en\":\"英文例句\",\"zh\":\"中文翻译\"}，必须与当前词条或考点相关\n")
	b.WriteString("- check: {\"prompt\":\"30 秒内能完成的自测\",\"answer\":\"参考答案\"}\n")
	b.WriteString("- words: 数组，0–" + strconv.Itoa(agentCardMaxWords) +
		" 条，{\"word\":\"生词\",\"meaning\":\"中文释义\"}，只列本次讲解里真正出现的词\n")
	b.WriteString("- action: {\"label\":\"30 秒小动作\",\"text\":\"一句马上能做的动作\",\"kind\":\"read|drill|review\"}\n")
	b.WriteString("不要输出 verdict 字段（由系统依据学习记录填写）。不要编造词库里不存在的单词、释义或例句。\n")
	b.WriteString("整张卡片必须短：headline ≤40 字，每个 point 正文 ≤70 字，example ≤80 字符，" +
		"check ≤60 字，words 最多 2 条；总共不超过 300 字，超出会被服务商的输出预算截断。\n")
	b.WriteString("场景要点：" + guide)
	return b.String()
}

// parseAgentCard turns a model reply into a card, or returns nil when the reply
// is not a usable card (the caller then keeps the plain text answer).
func (s *Store) parseAgentCard(message string, snapshot AgentSnapshot) *AgentCard {
	raw, err := extractJSONObject(message)
	if err != nil {
		// 线上实测：服务商给这张卡片的输出预算是有限的（deepseek-flash 截在 512 token），
		// 模型写到一半就被掐断时，上面那步必然失败。这里把「模型已经写完的那部分」
		// 抢救成一张卡片，而不是把半段 JSON 原文甩到学生脸上。
		if repaired := repairTruncatedJSON(message); repaired != nil {
			raw = repaired
		} else {
			return nil
		}
	}
	var card AgentCard
	if err := json.Unmarshal(raw, &card); err != nil {
		return nil
	}
	card.Kind = normalizeAgentCardKind(card.Kind, snapshot.Scene)
	card.Headline = truncateRunes(strings.TrimSpace(card.Headline), agentCardHeadlineMaxRunes)
	if len([]rune(card.Headline)) < 2 {
		return nil
	}

	points := make([]AgentCardPoint, 0, agentCardMaxPoints)
	for _, point := range card.Points {
		label := truncateRunes(strings.TrimSpace(point.Label), agentCardPointLabelRunes)
		text := truncateRunes(strings.TrimSpace(point.Text), agentCardPointTextRunes)
		if text == "" {
			continue
		}
		if label == "" {
			label = "要点"
		}
		points = append(points, AgentCardPoint{Label: label, Text: text})
		if len(points) >= agentCardMaxPoints {
			break
		}
	}
	card.Points = points

	if example := card.Example; example != nil {
		example.En = truncateRunes(strings.TrimSpace(example.En), agentCardExampleRunes)
		example.Zh = truncateRunes(strings.TrimSpace(example.Zh), agentCardExampleRunes)
		if example.En == "" && example.Zh == "" {
			card.Example = nil
		}
	}
	if check := card.Check; check != nil {
		check.Prompt = truncateRunes(strings.TrimSpace(check.Prompt), agentCardCheckRunes)
		check.Answer = truncateRunes(strings.TrimSpace(check.Answer), agentCardCheckRunes)
		if check.Prompt == "" {
			card.Check = nil
		} else {
			s.agentCardCheckConsistent(check, snapshot)
		}
	}
	if action := card.Action; action != nil {
		action.Text = truncateRunes(strings.TrimSpace(action.Text), agentCardActionTextRunes)
		action.Label = truncateRunes(strings.TrimSpace(action.Label), agentCardPointLabelRunes)
		if action.Text == "" {
			card.Action = nil
		} else {
			if action.Label == "" {
				action.Label = "30 秒小动作"
			}
			action.Kind = normalizeAgentCardActionKind(action.Kind)
		}
	}
	if len(card.Points) == 0 && card.Example == nil {
		// 只剩一个标题的卡片没有信息量，交给文本回落更诚实。
		return nil
	}

	card.Verdict = agentCardVerdict(snapshot)
	card.Words = s.agentCardWords(card.Words, card, snapshot)
	return &card
}

func normalizeAgentCardKind(value, scene string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "explain", "mistake", "compare", "reading", "general":
		return strings.ToLower(strings.TrimSpace(value))
	}
	switch scene {
	case "mistake":
		return "mistake"
	case "reading":
		return "reading"
	case "meaning", "quiz", "drill", "tongbu", "homework", "exam":
		return "explain"
	}
	return "general"
}

func normalizeAgentCardActionKind(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "read", "drill", "review":
		return strings.ToLower(strings.TrimSpace(value))
	}
	return "read"
}

// agentCardVerdict is the one line the learner can always trust: it is written
// from the library record, never from the model.
func agentCardVerdict(snapshot AgentSnapshot) string {
	item := snapshot.Current
	if item == nil || !item.Answered || item.CorrectAnswer == "" {
		return ""
	}
	if item.IsCorrect {
		return "答对了：" + item.CorrectAnswer
	}
	if item.SelectedAnswer == "" {
		return "正确答案是「" + item.CorrectAnswer + "」"
	}
	return "你选了「" + item.SelectedAnswer + "」，正确答案是「" + item.CorrectAnswer + "」"
}

// agentCardCheckConsistent stops a self-test from contradicting the answer key:
// when the question is about the word on screen and the model answered with one
// of the wrong options, the library answer wins.
func (s *Store) agentCardCheckConsistent(check *AgentCardCheck, snapshot AgentSnapshot) {
	item := snapshot.Current
	if item == nil || item.CorrectAnswer == "" || check.Answer == "" {
		return
	}
	if !strings.Contains(strings.ToLower(check.Prompt), strings.ToLower(item.Spelling)) {
		return
	}
	for _, option := range item.Options {
		if strings.EqualFold(strings.TrimSpace(option), check.Answer) && !strings.EqualFold(check.Answer, item.CorrectAnswer) {
			check.Answer = item.CorrectAnswer
			return
		}
	}
}

// agentCardWords keeps only words that can be backed by the library, or that the
// explanation really mentions; everything else is dropped as fabricated.
func (s *Store) agentCardWords(words []AgentCardWord, card AgentCard, snapshot AgentSnapshot) []AgentCardWord {
	if len(words) == 0 {
		return nil
	}
	level := quizScopeAll
	if snapshot.Current != nil && snapshot.Current.Level != "" {
		level = snapshot.Current.Level
	}
	text := strings.ToLower(agentCardPlainText(card))
	out := make([]AgentCardWord, 0, agentCardMaxWords)
	for _, entry := range words {
		word := strings.TrimSpace(entry.Word)
		if word == "" {
			continue
		}
		// 词库一致性兜底要按「id 或拼写」两级查：词库里的 id 并不总是拼写
		// （"Netherlands" → "country-netherlands"，"American" → "american adj"），
		// 只按 id 查会让模型从题目里拿来的词丢掉 id，学生就没法一键入册。
		found, ok := s.findWordInScope(level, strings.ToLower(word))
		if !ok {
			found, ok = s.findWordBySpelling(level, word)
		}
		// 兜底要跨学段再查一次：题池可能混着另一个学段的词（小学阶段的干扰项可能来自初中词库），
		// 只按本题学段查会让这种词丢掉 id，学生看到的就是一个点不动的生词。
		if !ok && !isQuizScopeAll(level) {
			found, ok = s.findWordInScope(quizScopeAll, strings.ToLower(word))
			if !ok {
				found, ok = s.findWordBySpelling(quizScopeAll, word)
			}
		}
		if ok {
			entry.Word = found.Word
			entry.Level = found.Level
			entry.ID = found.ID
			if strings.TrimSpace(entry.Meaning) == "" {
				entry.Meaning = found.Meaning
			}
		} else if !strings.Contains(text, strings.ToLower(word)) {
			continue
		}
		entry.Meaning = truncateRunes(strings.TrimSpace(entry.Meaning), agentCardWordMeaningRunes)
		out = append(out, entry)
		if len(out) >= agentCardMaxWords {
			break
		}
	}
	return out
}

func agentCardPlainText(card AgentCard) string {
	parts := []string{card.Headline}
	for _, point := range card.Points {
		parts = append(parts, point.Label, point.Text)
	}
	if card.Example != nil {
		parts = append(parts, card.Example.En, card.Example.Zh)
	}
	if card.Check != nil {
		parts = append(parts, card.Check.Prompt)
	}
	if card.Action != nil {
		parts = append(parts, card.Action.Text)
	}
	return strings.Join(parts, " ")
}

// agentCardDigest is what gets stored as the tutor note: the card's substance
// without JSON punctuation, so the next explanation can continue the story.
func agentCardDigest(card *AgentCard) string {
	if card == nil {
		return ""
	}
	parts := []string{card.Headline}
	for _, point := range card.Points {
		parts = append(parts, point.Label+"："+point.Text)
	}
	if card.Example != nil && card.Example.En != "" {
		parts = append(parts, "例句："+card.Example.En)
	}
	return strings.Join(parts, " ")
}

// buildAgentReceipt lists what the assistant actually read for this answer.
// Only dimensions that could apply to this page are listed, so the chips stay
// honest: a practice page shows whether the current item and the learner's
// history were read, a reading page shows the paragraph, and an empty context
// produces no receipt at all.
func buildAgentReceipt(snapshot AgentSnapshot, snapshotText string) *AgentReceipt {
	items := make([]AgentReceiptItem, 0, 8)
	add := func(key, label string, ok bool) {
		items = append(items, AgentReceiptItem{Key: key, Label: label, OK: ok})
	}
	if _, ok := agentPageFields[snapshot.Scene]; ok || agentSceneGuides[snapshot.Scene] != "" && snapshot.Scene != "general" {
		add("current", "本题", snapshot.Current != nil)
	}
	if item := snapshot.Current; item != nil {
		add("history", "该词历史", item.History != nil && item.History.Seen > 0)
	}
	if snapshot.Session != nil {
		add("session", "练习进度", snapshot.Session.Answered > 0)
	}
	if len(snapshot.PageMap) > 0 {
		add("page", "本页全景", true)
	}
	if len(snapshot.Weak) > 0 {
		add("weak", "薄弱词", true)
	}
	if snapshot.Student != nil {
		add("review", "今日到期", snapshot.Student.DueCount > 0)
	}
	if snapshot.Reading != nil {
		add("reading", "阅读段落", snapshot.Reading.Sentence != "" || snapshot.Reading.Paragraph > 0)
	}
	if snapshot.Page != nil {
		add("page-scene", agentSceneLabel(snapshot.Page.Kind), len(snapshot.Page.Items) > 0)
	}
	if len(items) == 0 {
		return nil
	}
	return &AgentReceipt{Items: items, Text: snapshotText}
}

// repairTruncatedJSON 是「输出被截断」的抢救：模型写到一半就被服务商的 token 预算掐断时
// （线上实测 deepseek-flash 会截在 512 token），整段文本不是合法 JSON，但它写完的那部分仍然是。
// 这里只做两件事：找到「最后一个完整值」的位置，以及补上此处仍然张开的括号——
// 绝不编造任何字段值，所以抢救出来的卡片就是模型真正写完的内容。
// 找不到任何可用的前缀时返回 nil，调用方照旧回落到纯文本。
func repairTruncatedJSON(text string) json.RawMessage {
	raw := []byte(text)
	start := -1
	for i, c := range raw {
		if c == '{' {
			start = i
			break
		}
	}
	if start < 0 {
		return nil
	}
	raw = raw[start:]

	stack := make([]byte, 0, 8)
	cuts := make([]int, 0, 16)
	snaps := make([][]byte, 0, 16)
	inString := false
	escaped := false
	record := func(end int) {
		snap := make([]byte, len(stack))
		copy(snap, stack)
		cuts = append(cuts, end)
		snaps = append(snaps, snap)
	}
	for i := 0; i < len(raw); i++ {
		c := raw[i]
		if inString {
			switch {
			case escaped:
				escaped = false
			case c == '\\':
				escaped = true
			case c == '"':
				inString = false
				record(i + 1)
			}
			continue
		}
		switch {
		case c == '"':
			inString = true
		case c == '{' || c == '[':
			stack = append(stack, c)
		case c == '}' || c == ']':
			if len(stack) == 0 {
				return nil
			}
			stack = stack[:len(stack)-1]
			record(i + 1)
		case c == ',' || c == ':' || c == ' ' || c == '\t' || c == '\r' || c == '\n':
			// 分隔符本身不是「完整值」的结尾
		default:
			j := i
			for j+1 < len(raw) && jsonLiteralByte(raw[j+1]) {
				j++
			}
			i = j
			record(j + 1)
		}
	}

	for k := len(cuts) - 1; k >= 0; k-- {
		body := make([]byte, cuts[k])
		copy(body, raw[:cuts[k]])
		for len(body) > 0 {
			switch body[len(body)-1] {
			case ',', ':', ' ', '\t', '\r', '\n':
				body = body[:len(body)-1]
				continue
			}
			break
		}
		for m := len(snaps[k]) - 1; m >= 0; m-- {
			if snaps[k][m] == '{' {
				body = append(body, '}')
			} else {
				body = append(body, ']')
			}
		}
		if json.Valid(body) {
			return json.RawMessage(body)
		}
	}
	return nil
}

// jsonLiteralByte reports whether c can appear inside a JSON number / true / false / null.
func jsonLiteralByte(c byte) bool {
	switch {
	case c >= '0' && c <= '9', c >= 'a' && c <= 'z', c >= 'A' && c <= 'Z', c == '.', c == '+', c == '-':
		return true
	}
	return false
}
