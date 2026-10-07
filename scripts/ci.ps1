# scripts/ci.ps1 —— 一键质量门禁（本地与 CI 共用，plan.md「P2：工程质量与交付」）
# ---------------------------------------------------------------------------
# 用法：
#   powershell -ExecutionPolicy Bypass -File .\scripts\ci.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\ci.ps1 -SkipFrontend
#   powershell -ExecutionPolicy Bypass -File .\scripts\ci.ps1 -Only Go
#   powershell -ExecutionPolicy Bypass -File .\scripts\ci.ps1 -StrictGrammar
#
# 覆盖：
#   Go：格式检查（gofmt，有输出即失败）、静态检查（go vet）、测试（go test，含 HTTP 接口集成
#       测试 internal/learning/http_integration_test.go）
#   词库：go run ./cmd/wordcheck（默认 warning 级阻断：重复词形已由 dedup 批次清零，
#       -LooseWords 可放宽到 error）、
#       go run ./cmd/contentaudit（音标 / 例句 / 音频缺口审计）
#   前端：全部 web/js 的语法检查（node --check；无构建链，语法错误必须在这里拦住）、
#       主侧栏 hash 解析自检、语法模块信息架构自检、语法内容重复体检、
#       助教页面上下文契约守门（scripts/check-agent-context-contract.mjs，字段须先在
#       docs/agent-ux-implementation-contract.md §5 登记）
#       前端静态资源缓存版本串守门（scripts/check-agent-asset-version.mjs；文件字节变了就必须改引用处的 ?v=，否则线上一直吃旧缓存）
# 语法重复体检默认只报告：当前 27 处命中都判定为「部分覆盖，保留」，所以默认不阻断；
# 内容清理完成后加 -StrictGrammar 让它变成硬门禁。
# 退出码：任一步失败、或有步骤没跑到，都返回 1；全部通过返回 0。
[CmdletBinding()]
param(
    [switch]$SkipGo,
    [switch]$SkipFrontend,
    [ValidateSet("All", "Go", "Frontend")]
    [string]$Only = "All",
    [switch]$StrictGrammar,
    # 给定服务地址时，额外跑前端核心流程端到端测试（scripts/e2e-practice-flow.mjs，
    # 以及语法相关的 e2e-primary-grammar.mjs / e2e-grammar-entry.mjs）。
    # 例：-E2EBase http://127.0.0.1:8099
    [string]$E2EBase = "",
    # 词库校验默认按 warning 级阻断（cmd/wordcheck -fail-on=warning）：重复词形警告已由
    # dedup 批次清零，警告再次出现即视为回归；需要临时放宽时加 -LooseWords（只让 error
    # 阻断）。-StrictWords 保留为兼容参数。
    [switch]$StrictWords,
    [switch]$LooseWords
)

$ErrorActionPreference = "Continue"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$runGo = (-not $SkipGo) -and ($Only -in @("All", "Go"))
$runFrontend = (-not $SkipFrontend) -and ($Only -in @("All", "Frontend"))
$scriptsDir = Join-Path $root "scripts"

$results = New-Object System.Collections.ArrayList

function Add-Result([string]$Area, [string]$Name, [bool]$Ok, [string]$Detail) {
    [void]$results.Add([pscustomobject]@{ Area = $Area; Step = $Name; Passed = $Ok; Detail = $Detail })
    $mark = if ($Ok) { "PASS" } else { "FAIL" }
    $suffix = if ($Detail) { " : " + $Detail } else { "" }
    Write-Host ("[{0}] {1} - {2}{3}" -f $mark, $Area, $Name, $suffix)
}

function Invoke-Step([string]$Area, [string]$Name, [string]$Command, [string[]]$Arguments) {
    $output = & $Command @Arguments 2>&1 | Out-String
    $code = $LASTEXITCODE
    $detail = (($output.Trim() -split "`n") | Where-Object { $_ -ne "" } | Select-Object -Last 1)
    Add-Result $Area $Name ($code -eq 0) $detail
    if ($code -ne 0) { Write-Host $output.Trim() }
}

Write-Host "==> Lingo Bloom CI 质量门禁"
Write-Host ("    root: {0}" -f $root)
Push-Location $root
try {
    if ($runGo) {
        try {
            $fmt = & gofmt -l internal cmd 2>&1 | Out-String
            $fmtClean = [string]::IsNullOrWhiteSpace($fmt)
            $fmtDetail = if ($fmtClean) { "格式干净" } else { "需要 gofmt：" + ($fmt.Trim() -replace "`r?`n", ", ") }
            Add-Result "Go" "gofmt -l internal cmd" $fmtClean $fmtDetail
        }
        catch { Add-Result "Go" "gofmt -l internal cmd" $false $_.Exception.Message }

        try { Invoke-Step "Go" "go vet ./..." "go" @("vet", "./...") }
        catch { Add-Result "Go" "go vet ./..." $false $_.Exception.Message }

        try { Invoke-Step "Go" "go test ./... -count=1" "go" @("test", "./...", "-count=1") }
        catch { Add-Result "Go" "go test ./... -count=1" $false $_.Exception.Message }

        # 词库质量校验：默认按 error 级阻断（cmd/wordcheck 的默认值），报告落盘便于人工复核。
        $wordArgs = @("run", "./cmd/wordcheck", "-output", "reports/word-quality.md")
        $wordName = "go run ./cmd/wordcheck（error 级阻断）"
        $strictWords = $StrictWords -or (-not $LooseWords)
        if ($strictWords) { $wordArgs = @("run", "./cmd/wordcheck", "-fail-on=warning", "-output", "reports/word-quality.md"); $wordName = "go run ./cmd/wordcheck（warning 级阻断）" }
        try { Invoke-Step "Go" $wordName "go" $wordArgs }
        catch { Add-Result "Go" $wordName $false $_.Exception.Message }

        # 内容完整性审计：音标 / 例句 / 音频缺口，输出 JSON 供后续任务清单消费。
        try { Invoke-Step "Go" "go run ./cmd/contentaudit" "go" @("run", "./cmd/contentaudit", "-output", "reports/content-completeness.json") }
        catch { Add-Result "Go" "go run ./cmd/contentaudit" $false $_.Exception.Message }
    }

    if ($runFrontend) {
        try {
            $jsFiles = @()
            $jsFiles += Get-ChildItem (Join-Path $root "web/js") -Filter *.js -File
            $jsFiles += Get-ChildItem (Join-Path $root "web/js/components") -Filter *.js -File
            $jsFiles += Get-ChildItem (Join-Path $root "web/js/grammar") -Filter *.js -File
            $bad = @()
            foreach ($file in $jsFiles) {
                & node --check $file.FullName 2>&1 | Out-Null
                if ($LASTEXITCODE -ne 0) { $bad += $file.Name }
            }
            $checkDetail = if ($bad.Count) { "语法错误：" + ($bad -join ", ") } else { "全部通过" }
            Add-Result "Frontend" ("node --check（" + $jsFiles.Count + " 个文件）") ($bad.Count -eq 0) $checkDetail
        }
        catch { Add-Result "Frontend" "node --check" $false $_.Exception.Message }

        foreach ($script in @("check-nav-hash.mjs", "check-grammar-ia.mjs", "check-agent-context-contract.mjs", "check-agent-asset-version.mjs")) {
            try { Invoke-Step "Frontend" $script "node" @((Join-Path $scriptsDir $script)) }
            catch { Add-Result "Frontend" $script $false $_.Exception.Message }
        }

        $dupArgs = @((Join-Path $scriptsDir "check-grammar-duplication.mjs"))
        $dupName = "check-grammar-duplication.mjs"
        if ($StrictGrammar) { $dupArgs += "--strict"; $dupName = $dupName + " --strict" }
        try { Invoke-Step "Frontend" $dupName "node" $dupArgs }
        catch { Add-Result "Frontend" $dupName $false $_.Exception.Message }
    }

    if ($E2EBase -ne "") {
        $e2eArgs = @((Join-Path $scriptsDir "e2e-practice-flow.mjs"), "--base", $E2EBase, "--shots", (Join-Path $root ".tmp/e2e-ci"))
        try { Invoke-Step "E2E" "e2e-practice-flow.mjs" "node" $e2eArgs }
        catch { Add-Result "E2E" "e2e-practice-flow.mjs" $false $_.Exception.Message }

        $cardArgs = @((Join-Path $scriptsDir "e2e-primary-grammar.mjs"), "--base", $E2EBase, "--shots", (Join-Path $root ".tmp/e2e-ci-primary-grammar"))
        try { Invoke-Step "E2E" "e2e-primary-grammar.mjs" "node" $cardArgs }
        catch { Add-Result "E2E" "e2e-primary-grammar.mjs" $false $_.Exception.Message }

        $grammarArgs = @((Join-Path $scriptsDir "e2e-grammar-entry.mjs"), "--base", $E2EBase, "--shots", (Join-Path $root ".tmp/e2e-ci-grammar"))
        try { Invoke-Step "E2E" "e2e-grammar-entry.mjs" "node" $grammarArgs }
        catch { Add-Result "E2E" "e2e-grammar-entry.mjs" $false $_.Exception.Message }
    }
}
finally {
    Pop-Location
}

$expected = 0
if ($runGo) { $expected += 5 }
if ($runFrontend) { $expected += 6 }
if ($E2EBase -ne "") { $expected += 3 }
if ($results.Count -lt $expected) {
    Add-Result "CI" "门禁步骤完整性" $false ("计划 " + $expected + " 步，实际执行 " + $results.Count + " 步")
}

$passed = @($results | Where-Object { $_.Passed }).Count
$failed = @($results | Where-Object { -not $_.Passed })
Write-Host ""
Write-Host ("==> 结果：" + $passed + " 步通过 / " + $failed.Count + " 步失败")
if ($failed.Count -gt 0) {
    $failed | ForEach-Object { Write-Host ("    FAIL: " + $_.Area + " - " + $_.Step) }
    exit 1
}
Write-Host "所有质量门禁通过。"
exit 0
