package learning

import "encoding/json"

type Word struct {
	ID                 string             `json:"id"`
	Word               string             `json:"word"`
	Phonetic           string             `json:"phonetic"`
	Pos                string             `json:"pos"`
	Meaning            string             `json:"meaning"`
	Letter             string             `json:"letter"`
	Level              string             `json:"level"`
	Example            string             `json:"example,omitempty"`
	ExampleTranslation string             `json:"exampleTranslation,omitempty"`
	Topic              string             `json:"topic,omitempty"`
	Grade              string             `json:"grade,omitempty"`
	Unit               string             `json:"unit,omitempty"`
	Senses             []WordSenseContent `json:"senses,omitempty"`
	Status             string             `json:"status,omitempty"`
	UpdatedAt          string             `json:"updatedAt,omitempty"`
	UpdatedBy          string             `json:"updatedBy,omitempty"`
}

type WordSenseContent struct {
	ID                 string `json:"id"`
	Meaning            string `json:"meaning"`
	Example            string `json:"example"`
	ExampleTranslation string `json:"exampleTranslation"`
}

// Content resources are stored independently and linked by stable IDs.
// Word remains the API read model while the content library is migrated.
type WordEntry struct {
	ID           string      `json:"id"`
	Text         string      `json:"text"`
	Meaning      string      `json:"meaning"`
	PartOfSpeech string      `json:"partOfSpeech,omitempty"`
	Letter       string      `json:"letter"`
	Topic        string      `json:"topic,omitempty"`
	Grade        string      `json:"grade,omitempty"`
	Unit         string      `json:"unit,omitempty"`
	Senses       []WordSense `json:"senses"`
}

type WordSense struct {
	ID           string `json:"id"`
	Meaning      string `json:"meaning"`
	PartOfSpeech string `json:"partOfSpeech,omitempty"`
}

type Pronunciation struct {
	ID       string `json:"id"`
	WordID   string `json:"wordId"`
	Dialect  string `json:"dialect,omitempty"`
	Phonetic string `json:"phonetic,omitempty"`
	AudioURL string `json:"audioUrl,omitempty"`
	Source   string `json:"source,omitempty"`
}

type ExampleSentence struct {
	ID          string `json:"id"`
	WordID      string `json:"wordId"`
	SenseID     string `json:"senseId"`
	Text        string `json:"text"`
	Translation string `json:"translation,omitempty"`
	Difficulty  string `json:"difficulty,omitempty"`
	Source      string `json:"source,omitempty"`
}

type Article struct {
	ID           string             `json:"id"`
	Title        string             `json:"title"`
	ChineseTitle string             `json:"chineseTitle,omitempty"`
	Content      string             `json:"content,omitempty"`
	Translation  string             `json:"translation,omitempty"`
	Level        string             `json:"level,omitempty"`
	Grade        string             `json:"grade,omitempty"`
	Difficulty   string             `json:"difficulty,omitempty"`
	Topic        string             `json:"topic,omitempty"`
	Collection   string             `json:"collection,omitempty"`
	Intro        string             `json:"intro,omitempty"`
	Minutes      int                `json:"minutes,omitempty"`
	Paragraphs   []ArticleParagraph `json:"paragraphs,omitempty"`
	Words        [][]string         `json:"words,omitempty"`
	Quote        string             `json:"quote,omitempty"`
	QuoteZh      string             `json:"quoteZh,omitempty"`
	WordIDs      []string           `json:"wordIds,omitempty"`
	Status       string             `json:"status,omitempty"`
	UpdatedAt    string             `json:"updatedAt,omitempty"`
	UpdatedBy    string             `json:"updatedBy,omitempty"`
}

type ArticleParagraph struct {
	English string `json:"en"`
	Chinese string `json:"zh"`
}

type ArticlePage struct {
	Items []Article `json:"items"`
	Total int       `json:"total"`
}

type WordFilter struct {
	Level        string
	Query        string
	Topic        string
	Grade        string
	Unit         string
	Letter       string
	PartOfSpeech string
	Sort         string
	Seed         int
	Page         int
}

type WordFacets struct {
	Topics        []string        `json:"topics"`
	Grades        []string        `json:"grades"`
	Units         []string        `json:"units"`
	Letters       []CategoryCount `json:"letters"`
	PartsOfSpeech []CategoryCount `json:"partsOfSpeech"`
}

type CategoryCount struct {
	Value string `json:"value"`
	Label string `json:"label"`
	Count int    `json:"count"`
}

type Progress struct {
	Seen         int                   `json:"seen"`
	Mastered     bool                  `json:"mastered"`
	SetMastered  *bool                 `json:"setMastered,omitempty"`
	Correct      int                   `json:"correct"`
	Wrong        int                   `json:"wrong"`
	Resolved     bool                  `json:"resolved"`
	Review       bool                  `json:"review,omitempty"`
	ReviewCount  int                   `json:"reviewCount"`
	ReviewStreak int                   `json:"reviewStreak"`
	IntervalDays int                   `json:"intervalDays"`
	LastSeen     string                `json:"lastSeen"`
	LastReviewed string                `json:"lastReviewed"`
	NextReview   string                `json:"nextReview"`
	QuizResults  map[string]QuizResult `json:"quizResults,omitempty"`
}

type QuizResult struct {
	Correct int `json:"correct"`
	Wrong   int `json:"wrong"`
}

type LearningItem struct {
	Word     Word     `json:"word"`
	Progress Progress `json:"progress"`
}

type ReviewQueue struct {
	Items     []LearningItem `json:"items"`
	Total     int            `json:"total"`
	Completed int            `json:"completed"`
	Goal      int            `json:"goal"`
}

type Dashboard struct {
	TodayLearned   int            `json:"todayLearned"`
	TodayPractices int            `json:"todayPractices"`
	TodayGoal      int            `json:"todayGoal"`
	StreakDays     int            `json:"streakDays"`
	ReviewDue      int            `json:"reviewDue"`
	Mistakes       int            `json:"mistakes"`
	Recent         []LearningItem `json:"recent"`
	Weakest        []LearningItem `json:"weakest"`
}

type LearningEvent struct {
	ID          string         `json:"id"`
	UserID      string         `json:"userId"`
	Type        string         `json:"type"`
	ContentType string         `json:"contentType"`
	ContentID   string         `json:"contentId"`
	Level       string         `json:"level,omitempty"`
	Correct     int            `json:"correct,omitempty"`
	Wrong       int            `json:"wrong,omitempty"`
	Source      string         `json:"source,omitempty"`
	Details     map[string]any `json:"details,omitempty"`
	CreatedAt   string         `json:"createdAt"`
}

type KnowledgeMastery struct {
	ID           string   `json:"id"`
	Label        string   `json:"label"`
	Kind         string   `json:"kind"`
	Level        string   `json:"level,omitempty"`
	Topic        string   `json:"topic,omitempty"`
	Score        int      `json:"score"`
	Confidence   int      `json:"confidence"`
	Correct      int      `json:"correct"`
	Wrong        int      `json:"wrong"`
	ReviewStreak int      `json:"reviewStreak"`
	Reason       string   `json:"reason"`
	Tags         []string `json:"tags"`
	LastActivity string   `json:"lastActivity,omitempty"`
	NextReview   string   `json:"nextReview,omitempty"`
	Word         *Word    `json:"word,omitempty"`
}

type MasteryDimension struct {
	ID        string `json:"id"`
	Label     string `json:"label"`
	Score     int    `json:"score"`
	Coverage  int    `json:"coverage"`
	Practiced int    `json:"practiced"`
	Weak      int    `json:"weak"`
}

type LearningProfile struct {
	Level        string             `json:"level"`
	OverallScore int                `json:"overallScore"`
	Confidence   int                `json:"confidence"`
	Practiced    int                `json:"practiced"`
	Mastered     int                `json:"mastered"`
	Developing   int                `json:"developing"`
	Weak         int                `json:"weak"`
	Due          int                `json:"due"`
	Strongest    []KnowledgeMastery `json:"strongest"`
	Weakest      []KnowledgeMastery `json:"weakest"`
	Dimensions   []MasteryDimension `json:"dimensions"`
	RecentEvents []LearningEvent    `json:"recentEvents"`
	UpdatedAt    string             `json:"updatedAt"`
}

type LearningPlanAction struct {
	View      string `json:"view"`
	Level     string `json:"level,omitempty"`
	ContentID string `json:"contentId,omitempty"`
	Word      *Word  `json:"word,omitempty"`
}

type SmartPlanTask struct {
	ID          string             `json:"id"`
	Type        string             `json:"type"`
	Title       string             `json:"title"`
	Description string             `json:"description"`
	Reason      string             `json:"reason"`
	Minutes     int                `json:"minutes"`
	Count       int                `json:"count,omitempty"`
	Priority    int                `json:"priority"`
	Action      LearningPlanAction `json:"action"`
	Completed   bool               `json:"completed"`
	CompletedAt string             `json:"completedAt,omitempty"`
}

type SmartLearningPlan struct {
	ID               string          `json:"id"`
	UserID           string          `json:"userId"`
	Date             string          `json:"date"`
	Level            string          `json:"level"`
	TargetMinutes    int             `json:"targetMinutes"`
	EstimatedMinutes int             `json:"estimatedMinutes"`
	CompletedMinutes int             `json:"completedMinutes"`
	CompletedTasks   int             `json:"completedTasks"`
	Summary          string          `json:"summary"`
	Focus            []string        `json:"focus"`
	Tasks            []SmartPlanTask `json:"tasks"`
	GeneratedAt      string          `json:"generatedAt"`
	UpdatedAt        string          `json:"updatedAt"`
}

type LearningSettings struct {
	DailyReviewGoal int `json:"dailyReviewGoal"`
}

type WordPage struct {
	Items        []Word         `json:"items"`
	Total        int            `json:"total"`
	Page         int            `json:"page"`
	Size         int            `json:"size"`
	StatusCounts map[string]int `json:"statusCounts,omitempty"`
}

type Quiz struct {
	Word    Word     `json:"word"`
	Options []string `json:"options"`
	Type    string   `json:"type"`
	Prompt  string   `json:"prompt"`
	Answer  string   `json:"answer"`
}

type QuizAnswer struct {
	Level  string `json:"level"`
	WordID string `json:"wordId"`
	Type   string `json:"type"`
	Answer string `json:"answer"`
}

type QuizFeedback struct {
	Correct  bool     `json:"correct"`
	Answer   string   `json:"answer"`
	Message  string   `json:"message"`
	Progress Progress `json:"progress"`
}

type Stats struct {
	Total    int `json:"total"`
	Seen     int `json:"seen"`
	Mastered int `json:"mastered"`
	Accuracy int `json:"accuracy"`
	Mistakes int `json:"mistakes"`
}

type ContentStatus struct {
	File                  string `json:"file"`
	Words                 int    `json:"words"`
	MissingPhonetic       int    `json:"missingPhonetic"`
	MissingAudio          int    `json:"missingAudio"`
	MissingExamples       int    `json:"missingExamples"`
	MultipleSenses        int    `json:"multipleSenses"`
	SensesWithoutExamples int    `json:"sensesWithoutExamples"`
}

type User struct {
	ID                 string `json:"id"`
	Username           string `json:"username"`
	DisplayName        string `json:"displayName"`
	Role               string `json:"role"`
	Active             bool   `json:"active"`
	CreatedAt          string `json:"createdAt"`
	LastLoginAt        string `json:"lastLoginAt,omitempty"`
	MustChangePassword bool   `json:"mustChangePassword,omitempty"`
	PasswordHash       string `json:"-"`
}

type AuthRequest struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	DisplayName string `json:"displayName,omitempty"`
}
type AuthResponse struct {
	User User `json:"user"`
}
type UserPage struct {
	Items []User `json:"items"`
	Total int    `json:"total"`
}
type UserUpdate struct {
	DisplayName string `json:"displayName"`
	Role        string `json:"role"`
	Active      *bool  `json:"active"`
}
type AdminPasswordReset struct {
	NewPassword string `json:"newPassword"`
}
type AdminContentPage struct {
	Items        any            `json:"items"`
	Total        int            `json:"total"`
	Page         int            `json:"page"`
	Size         int            `json:"size"`
	StatusCounts map[string]int `json:"statusCounts,omitempty"`
}

type ContentVersion struct {
	ID          string          `json:"id"`
	ContentType string          `json:"contentType"`
	ContentID   string          `json:"contentId"`
	Level       string          `json:"level,omitempty"`
	Version     int             `json:"version"`
	Status      string          `json:"status"`
	Action      string          `json:"action"`
	Snapshot    json.RawMessage `json:"snapshot"`
	CreatedAt   string          `json:"createdAt"`
	CreatedBy   string          `json:"createdBy"`
}

type PasswordChange struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}
type ArticleProgress struct {
	ArticleID string `json:"articleId"`
	Completed bool   `json:"completed"`
	Memorized bool   `json:"memorized"`
	UpdatedAt string `json:"updatedAt"`
}
type PlatformStats struct {
	Users       int `json:"users"`
	ActiveUsers int `json:"activeUsers"`
	Admins      int `json:"admins"`
	Words       int `json:"words"`
	Articles    int `json:"articles"`
	Sessions    int `json:"sessions"`
}
type AuditLog struct {
	ID        string `json:"id"`
	UserID    string `json:"userId"`
	Username  string `json:"username"`
	Action    string `json:"action"`
	Detail    string `json:"detail"`
	CreatedAt string `json:"createdAt"`
}

type ExamPaper struct {
	ID                 string        `json:"id"`
	Title              string        `json:"title"`
	Year               int           `json:"year"`
	Region             string        `json:"region"`
	Subject            string        `json:"subject"`
	DurationMinutes    int           `json:"durationMinutes"`
	TotalScore         float64       `json:"totalScore"`
	Status             string        `json:"status"`
	SourceURL          string        `json:"sourceUrl,omitempty"`
	AttachmentURL      string        `json:"attachmentUrl,omitempty"`
	FileSHA256         string        `json:"fileSha256,omitempty"`
	PageCount          int           `json:"pageCount,omitempty"`
	SourceOrganization string        `json:"sourceOrganization,omitempty"`
	SourceType         string        `json:"sourceType,omitempty"`
	CopyrightNote      string        `json:"copyrightNote,omitempty"`
	Instructions       string        `json:"instructions,omitempty"`
	Sections           []ExamSection `json:"sections"`
	UpdatedAt          string        `json:"updatedAt,omitempty"`
	UpdatedBy          string        `json:"updatedBy,omitempty"`
}
type ExamSection struct {
	ID           string         `json:"id"`
	Title        string         `json:"title"`
	Type         string         `json:"type"`
	Instructions string         `json:"instructions,omitempty"`
	Questions    []ExamQuestion `json:"questions"`
}
type ExamQuestion struct {
	ID          string   `json:"id"`
	Type        string   `json:"type"`
	Prompt      string   `json:"prompt"`
	Passage     string   `json:"passage,omitempty"`
	Options     []string `json:"options,omitempty"`
	Answer      any      `json:"answer"`
	Explanation string   `json:"explanation,omitempty"`
	Score       float64  `json:"score"`
	Tags        []string `json:"tags,omitempty"`
}
type ExamPaperPage struct {
	Items []ExamPaper `json:"items"`
	Total int         `json:"total"`
}
type ExamSubmission struct {
	PaperID   string         `json:"paperId"`
	Answers   map[string]any `json:"answers"`
	StartedAt string         `json:"startedAt,omitempty"`
}
type QuestionResult struct {
	QuestionID  string  `json:"questionId"`
	Correct     bool    `json:"correct"`
	Score       float64 `json:"score"`
	MaxScore    float64 `json:"maxScore"`
	Answer      any     `json:"answer"`
	Expected    any     `json:"expected"`
	Explanation string  `json:"explanation,omitempty"`
}
type ExamAttempt struct {
	ID              string           `json:"id"`
	UserID          string           `json:"userId"`
	PaperID         string           `json:"paperId"`
	PaperTitle      string           `json:"paperTitle"`
	Score           float64          `json:"score"`
	TotalScore      float64          `json:"totalScore"`
	Accuracy        int              `json:"accuracy"`
	StartedAt       string           `json:"startedAt"`
	SubmittedAt     string           `json:"submittedAt"`
	DurationSeconds int              `json:"durationSeconds"`
	Results         []QuestionResult `json:"results"`
}
