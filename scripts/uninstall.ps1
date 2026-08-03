[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$InstallDirectory = "",
    [switch]$KeepData
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($InstallDirectory)) {
    $InstallDirectory = Join-Path $env:LOCALAPPDATA "EnglishLearn"
}
$installPath = [System.IO.Path]::GetFullPath($InstallDirectory)
if (-not (Test-Path -LiteralPath $installPath)) {
    Write-Host "Install directory does not exist: $installPath"
    return
}
if ($KeepData) {
    $dataPath = Join-Path $installPath "english_learn.db"
    $savedPath = Join-Path (Split-Path -Parent $installPath) "EnglishLearn-data.db"
    if (Test-Path -LiteralPath $dataPath) { Copy-Item -LiteralPath $dataPath -Destination $savedPath -Force }
    Write-Host "Learning data was saved to: $savedPath"
}
if ($PSCmdlet.ShouldProcess($installPath, "Uninstall English Learn")) {
    Remove-Item -LiteralPath $installPath -Recurse -Force
    Write-Host "Uninstall completed." -ForegroundColor Green
}
