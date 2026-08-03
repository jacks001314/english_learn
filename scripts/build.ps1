[CmdletBinding()]
param(
    [string]$OutputDirectory = "dist/english-learn",
    [switch]$SkipTests,
    [switch]$StrictWordCheck
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputPath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $OutputDirectory))
$goCache = Join-Path $projectRoot ".tmp/go-build"
$mergedDatabase = Join-Path $projectRoot ".tmp/english-learn-merged.db"

function Invoke-Step([string]$Title, [scriptblock]$Action) {
    Write-Host "`n==> $Title" -ForegroundColor Cyan
    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "$Title failed with exit code $LASTEXITCODE"
    }
}

if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    throw "Go was not found. Install Go 1.26.5 or a compatible version and add it to PATH."
}

$resolvedRoot = [System.IO.Path]::GetFullPath($projectRoot)
if (-not $outputPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Output directory must be inside the project root: $resolvedRoot"
}

Push-Location $projectRoot
try {
    $env:GOCACHE = $goCache
    if (-not $SkipTests) {
        Invoke-Step "Run unit tests" { go test ./... }
        Invoke-Step "Run static checks" { go vet ./... }
    }

    Invoke-Step "Sync curated content patches" { go run ./cmd/synccontent -root $projectRoot }
    Invoke-Step "Reuse reviewed duplicate-word examples" { go run ./cmd/reusecontent }

    $wordCheckArgs = @("run", "./cmd/wordcheck", "-output", "reports/word-quality.md")
    if ($StrictWordCheck) { $wordCheckArgs += "-fail-on=warning" }
    Invoke-Step "Check word data quality" { & go $wordCheckArgs }
    Invoke-Step "Audit content completeness" { go run ./cmd/contentaudit -output reports/content-completeness.json -max-missing-phonetic 755 -max-missing-examples 2658 }
    Invoke-Step "Generate content completion tasks" { go run ./cmd/contenttasks -output reports/content-tasks.json }

    # Data lives independently from a particular release directory. Merge all
    # known databases before replacing the output so switching builds keeps
    # users, progress, settings, edited content, deletion markers and audits.
    $databaseSources = @()
    $rootDatabase = Join-Path $projectRoot "english_learn.db"
    if (Test-Path -LiteralPath $rootDatabase) { $databaseSources += (Get-Item -LiteralPath $rootDatabase) }
    $distRoot = Join-Path $projectRoot "dist"
    if (Test-Path -LiteralPath $distRoot) {
        $databaseSources += Get-ChildItem -LiteralPath $distRoot -Filter "english_learn.db" -File -Recurse -ErrorAction SilentlyContinue
    }
    $databaseSources = $databaseSources | Sort-Object FullName -Unique
    if ($databaseSources.Count -gt 0) {
        $mergeArgs = @("run", "./cmd/mergedb", "-target", $mergedDatabase) + @($databaseSources.FullName)
        try {
            Invoke-Step "Merge existing application data ($($databaseSources.Count) database(s))" { & go $mergeArgs }
        } catch {
            throw "Cannot safely read the existing application database. Close every running English Learn release, then run the build again. Existing data was not changed. Details: $($_.Exception.Message)"
        }
    }

    if (Test-Path -LiteralPath $outputPath) {
        try {
            Remove-Item -LiteralPath $outputPath -Recurse -Force
        } catch {
            throw "Cannot replace $outputPath. Stop the running english-learn.exe or use -OutputDirectory with a new directory. Details: $($_.Exception.Message)"
        }
    }
    New-Item -ItemType Directory -Path $outputPath -Force | Out-Null

    Invoke-Step "Build server" { go build -buildvcs=false -trimpath -ldflags "-s -w" -o (Join-Path $outputPath "english-learn.exe") ./cmd/server }
    Copy-Item -LiteralPath (Join-Path $projectRoot "backend") -Destination $outputPath -Recurse
    Copy-Item -LiteralPath (Join-Path $projectRoot "web") -Destination $outputPath -Recurse
    Copy-Item -LiteralPath (Join-Path $projectRoot "README.md") -Destination $outputPath
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot "start.ps1") -Destination $outputPath
    if (Test-Path -LiteralPath $mergedDatabase) {
        Copy-Item -LiteralPath $mergedDatabase -Destination (Join-Path $outputPath "english_learn.db") -Force
        Write-Host "Application data copied to the new release." -ForegroundColor Green
    }

    $version = (Get-Date).ToString("yyyyMMdd-HHmmss")
    Set-Content -LiteralPath (Join-Path $outputPath "VERSION") -Value $version -Encoding UTF8
    Write-Host "`nBuild completed: $outputPath" -ForegroundColor Green
} finally {
    Pop-Location
}
