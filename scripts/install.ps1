[CmdletBinding()]
param(
    [string]$InstallDirectory = "",
    [switch]$SkipBuild,
    [switch]$SkipTests
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$packagePath = Join-Path $projectRoot "dist/english-learn"
if ([string]::IsNullOrWhiteSpace($InstallDirectory)) {
    $InstallDirectory = Join-Path $env:LOCALAPPDATA "EnglishLearn"
}
$installPath = [System.IO.Path]::GetFullPath($InstallDirectory)

if (-not $SkipBuild) {
    & (Join-Path $PSScriptRoot "build.ps1") -SkipTests:$SkipTests
    if ($LASTEXITCODE -ne 0) { throw "Build failed. Installation canceled." }
}
if (-not (Test-Path -LiteralPath (Join-Path $packagePath "english-learn.exe"))) {
    throw "Build output not found. Run scripts/build.ps1 first."
}

Write-Host "Installing to: $installPath" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $installPath -Force | Out-Null
$databasePath = Join-Path $installPath "english_learn.db"
$backupPath = $null
if (Test-Path -LiteralPath $databasePath) {
    $backupPath = Join-Path ([System.IO.Path]::GetTempPath()) ("english-learn-db-" + [guid]::NewGuid() + ".db")
    Copy-Item -LiteralPath $databasePath -Destination $backupPath
}

Get-ChildItem -LiteralPath $packagePath | ForEach-Object {
    $destination = Join-Path $installPath $_.Name
    if (Test-Path -LiteralPath $destination) { Remove-Item -LiteralPath $destination -Recurse -Force }
    Copy-Item -LiteralPath $_.FullName -Destination $destination -Recurse
}
if ($backupPath) {
    Copy-Item -LiteralPath $backupPath -Destination $databasePath -Force
    Remove-Item -LiteralPath $backupPath -Force
}

Write-Host "Installation completed. Start with:" -ForegroundColor Green
Write-Host "powershell -ExecutionPolicy Bypass -File `"$(Join-Path $installPath 'start.ps1')`""
