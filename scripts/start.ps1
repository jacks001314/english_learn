[CmdletBinding()]
param([string]$Address = ":8080")

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$executable = Join-Path $root "english-learn.exe"
if (-not (Test-Path -LiteralPath $executable)) {
    throw "english-learn.exe was not found. Run the build or install script first."
}
$env:ENGLISH_LEARN_ROOT = $root
Write-Host "English Learn is starting at http://localhost$Address" -ForegroundColor Green
& $executable -addr $Address
