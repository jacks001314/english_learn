# Project Analysis · Lingo Bloom (english_learn)

- Date: 2026-09-28
- Analyst: syntropy (general agent)
- Scope: whole project home `C:\...\workspaces\agents\syntropy-f1c95c07\project`
- Method: static reading of docs/config/source + local build/vet/test execution

---

## 1. What this project is

A self-hosted English vocabulary learning web app for Chinese primary- and middle-school students
("英语学习乐园" / brand shown in the UI as "Lingo Bloom").

It covers the full loop: browse words -> practice -> record progress -> mistakes / review / reports,
plus a large grammar-lecture module, textbook "synchronised training" (同步训练), a reading library,
and an AI content factory for admins. It is already deployed to a real host
(see `reports/deploy-server-20260928.md`).

## 2. Stack

| Layer | Choice | Evidence |
| --- | --- | --- |
| Language | Go 1.26.5 | `go.mod`, `go version` = go1.26.5 windows/amd64 |
| HTTP | Iris v12.2.11 | `go.mod` |
| Storage | BoltDB (bbolt v1.4.3) | `internal/learning/repository.go:72` |
| Auth | session cookie + bcrypt | `internal/learning/auth.go` |
| Frontend | Vue 3 global build + ES modules, no bundler | `web/index.html`, `web/vendor/vue.global.prod.js` |
| AI | Codex Core + Claude Code SDK | `internal/learning/agent.go`, `go.mod:102` |

Note: `go.mod` has `replace codex_core => D:/qax/reagent/dev/codex_core` (an absolute local path).
The build only works where that directory exists.

## 3. Repository layout

| Path | Role | Size evidence |
| --- | --- | --- |
| `cmd/` | 10 CLI entry points (server, wordcheck, contentaudit, synccontent, mergedb, ...) | 10 files |
| `internal/learning/` | Core domain: model, repository, service, controller, router, auth, exam, homework, agent, content factory | 44 files |
| `internal/{wordcheck,contentaudit,contenttasks,enrichment,autofill}` | Content quality / enrichment tooling | 10 files |
| `backend/*.json` | Primary (1,331) + middle (2,895) words, 40 articles, exam banks | 2.76 MB |
| `chuzhong/` | Textbook data: catalogue, 6 vocab books, 54 original texts, real-教材 unit JSON | 1.06 MB |
| `web/` | Frontend SPA, 29 Vue components, 23 CSS files, audio | 22.19 MB |
| `audio_7/` -> `web/audio/7/` | Grade-7 textbook recordings (generated, not hand-edited) | 53 files, 18 MB |
| `yufan/`, `kewen_7/`, `tongbu_7/` | Source scan/screenshot images for the grammar lectures | 417 + 172 + 49 JPGs, 426 MB |
| `scripts/` | PowerShell build/install/deploy + Node.js grammar/CSS audit scripts | 19 files |
| `docs/` | Design docs: content DB, platform, AI factory, grammar redesign | 5 files |
| `reports/` | 38 agent-produced audit/verification reports | - |

Code volume: 54 Go files / ~9,255 lines; 96 frontend JS files / ~27,336 lines; 23 CSS files / ~3,161 lines.
Tests: 66 Go test functions.

## 4. Backend architecture

- Layered: `model.go` -> `repository.go` -> `service.go` -> `controller.go`, routes in `router.go`.
- 82 route registrations: public `/api/*`, `/api/admin/*` behind `requireAdmin`, everything else behind `requireAuth`.
- Content/learning separation: content buckets (`words`, `pronunciations`, `examples`, `articles`, `article_words`)
  vs. user data (`users`, `sessions`, `progress`, ...), documented in `docs/database-design.md`.
- Startup re-imports `backend/*.json` into BoltDB (idempotent upsert) - observed as 2,321 `words` value refreshes
  during the last deploy, with no key churn.

## 5. Content assets

- Words: 1,331 primary + 2,895 middle = 4,226 entries (matches 4,226 pronunciations in the live DB).
- Articles: 40.
- Textbook catalogue: 6 books (grades 7-9, two volumes each), 54 original texts, grade-7 real-textbook units.
- Grammar: 22 curated base topics + yufan lecture topics => 31 topics reported in production; 26 yufan lecture modules.
- Synchronised training: 20 exercise sets (Starter + Units 1-3).
- Audio: 53 grade-7 recordings, generated from `audio_7/` by `scripts/import-audio.ps1`.

## 6. Frontend

- Single-page app: `web/index.html` mounts `#app`, loads Vue from `web/vendor/`, then `web/js/main.js` (ES module).
- 29 components under `web/js/components/` (GrammarView 38.9 KB, ExamWorkbench 34.7 KB, HomeworkAdminView 26.8 KB, ...).
- Grammar lectures are lazy-loaded (`import()` on topic selection) - a deliberate fix after the yufan 413 incident.
- Cache-busting is manual via `?v=` query strings in `index.html` and JS imports (a repeated source of stale-asset bugs).

## 7. Verification performed in this analysis

| Check | Command | Result |
| --- | --- | --- |
| Build | `go build ./...` | PASS (exit 0) |
| Static analysis | `go vet ./...` | PASS (exit 0) |
| Tests | `go test ./...` | **FAIL** - 1 of 6 test packages fails (see 8.1) |

`internal/learning` fails on `TestCourseLoadsTextbookContent`:

```
course_test.go:113: appendix 1: audio file missing for
/audio/7/appendix/pronunciation-guide.mp3: ... The system cannot find the file specified.
```

## 8. Findings (ranked)

### 8.1 [High] No code freeze / reproducible build without developer machine state
- `go test ./...` is red on a clean checkout.
- Root cause chain is fully local and verifiable:
  1. `chuzhong/真实教材/七年级上册/book.json:6` references `/audio/7/appendix/pronunciation-guide.mp3`.
  2. `scripts/import-audio.ps1:60` maps a source folder named `pronounciation guide` (sic) to that target.
  3. `audio_7/` contains no such folder (only `Proper nouns`, `Starter`, `Unit 1..6`).
  4. So the file can never be produced; the test correctly flags a real content gap.
- Impact: any CI / "build then ship" flow that runs tests will block; the last deploy had to continue with
  a documented residual risk (`reports/deploy-server-20260928.md` section 7, item 2).
- Fix: supply the missing recording, or replace the reference with a synthesised/browser-TTS fallback.

### 8.2 [High] Build depends on an absolute local path
`go.mod:102` `replace codex_core => D:/qax/reagent/dev/codex_core`. No vendoring, no CI-usable substitute.
The project is not reproducible on another machine or on the Linux deploy host without that tree.

### 8.3 [Medium] Package-level mutable DB/store state
`internal/learning/repository.go:55` `openStore` writes a package-level handle. `plan.md:87` already lists this
as a risk: it prevents parallel tests and multi-instance runs. Not yet fixed.

### 8.4 [Medium] Windows MAX_PATH breaks the audio pipeline
`scripts/import-audio.ps1` fails on a 265-character source path (`Copy-Item` "Cannot find path"),
which is why the last deploy used `-SkipAudioSync`. `-LiteralPath` is used but the long-path prefix (`\\?\`)
is not, so the defect persists.

### 8.5 [Medium] Content-quality debt is known but not closed
`reports/word-quality.md` (23 KB) and `reports/content-tasks.json` exist; `plan.md` still has open items for
missing phonetics / per-sense examples and the strict publish gate is not yet enabled.

### 8.6 [Low] Asset version numbers are maintained by hand
`web/index.html` carries ~25 `?v=` values; the yufan retro (`reports/yufan-multi-agent-retro.md`) records a
second occurrence of a stale `grammar.css` version. The retro already recommends enforcing consistency in a script.

### 8.7 [Low] No VCS in the project home
There is no `.git` directory. `reports/archive/*.bak` files are a manual substitute for version control,
and `reports/deploy-server-20260928.md` notes the last deploy kept no previous binary, so a code-level
rollback is currently impossible.

## 9. Strengths worth preserving

1. Real production deployment with an evidence chain (service status, MD5 parity, DB key-by-key diff).
2. Content and learning data are modelled separately and documented (`docs/database-design.md`).
3. Quality tooling is first-class: `wordcheck`, `contentaudit`, `contenttasks`, `synccontent` are all CLI-runnable
   and already wired into the build script.
4. Structured self-audit culture: 38 reports, blackboard findings, an explicit multi-agent retrospective with
   reusable rules.
5. Tests exist for the tricky parts (spaced repetition, level isolation, word sorting, course audio references).

## 10. Recommended next steps (ordered)

1. Close 8.1: decide on the appendix audio (supply the file or drop the reference), then get `go test ./...` green.
2. Make the build portable (8.2): vendor or remove the `codex_core` replace directive, or gate it behind a build tag.
3. Fix the long-path defect and add a pre-overwrite binary backup in `deploy.ps1` (8.4, 8.7).
4. Move BoltDB/store to injected repositories (8.3) - the single highest-leverage refactor for testability.
5. Automate `?v=` consistency checks in the build (8.6).

## 11. Open questions

- Is `D:/qax/reagent/dev/codex_core` intended to be shipped with the project, or is it a transient dev dependency?
- Should the appendix pronunciation guide exist as a real recording, or is browser TTS acceptable (as it is for words)?
- Is the ~426 MB of source scan images meant to stay in the deliverable, or only in a separate asset store?
- Which plan.md milestone is the current priority: multi-user/student profiles, or content completeness?