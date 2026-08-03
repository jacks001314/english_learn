[CmdletBinding()]
param([string]$InstallDirectory = "dist/english-learn")

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$installPath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $InstallDirectory))
$running = Get-Process -Name "english-learn" -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path.StartsWith($installPath, [System.StringComparison]::OrdinalIgnoreCase) }
if ($running) {
    throw "English Learn is still running from $installPath. Close the program first, then run this upgrade again. Your database has not been changed."
}

$database = Join-Path $installPath "english_learn.db"
$backup = Join-Path $projectRoot ".tmp/upgrade-current.db"
if (Test-Path -LiteralPath $database) {
    New-Item -ItemType Directory -Path (Split-Path -Parent $backup) -Force | Out-Null
    Copy-Item -LiteralPath $database -Destination $backup -Force
    Write-Host "Backed up current application data." -ForegroundColor Cyan
}

& (Join-Path $PSScriptRoot "build.ps1") -OutputDirectory $InstallDirectory
if ($LASTEXITCODE -ne 0) { throw "Build failed. Existing data backup remains at $backup" }

if (Test-Path -LiteralPath $backup) {
    $builtDatabase = Join-Path $installPath "english_learn.db"
    if (-not (Test-Path -LiteralPath $builtDatabase)) {
        Copy-Item -LiteralPath $backup -Destination $builtDatabase -Force
    }
}

Write-Host "Upgrade completed. Start with:" -ForegroundColor Green
Write-Host "powershell -ExecutionPolicy Bypass -File `"$(Join-Path $installPath 'start.ps1')`""
