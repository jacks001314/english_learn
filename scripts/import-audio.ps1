[CmdletBinding()]
param(
    [string]$SourceDirectory = "audio_7",
    [string]$DestinationDirectory = "web/audio/7",
    [string]$FfmpegPath = "",
    [switch]$NoPrune
)

# Copies the textbook recordings from the raw audio folder into web/audio/7
# with stable ASCII names so the site (and the build / install / deploy
# scripts) can serve them from /audio/7/...
#
# Layout produced:
#   web/audio/7/appendix/pronunciation-guide.mp3, proper-nouns.mp3
#   web/audio/7/starter/ vocab.mp3, reading.mp3, listening-1..3.mp3
#   web/audio/7/unitN/   vocab.mp3, reading.mp3, speaking.mp3, writing.mp3,
#                        listening-1..3.mp3, phonetics.mp3
#
# The mapping must stay in sync with the URLs stored in
# chuzhong/<book>/units/*.json and chuzhong/<book>/book.json;
# `go test ./internal/learning` fails when a referenced file is missing.
#
# web/audio/7 is fully generated from the source folder: files that the mapping
# no longer produces are pruned, so do not add hand-made files there.
# Use -NoPrune to keep them, or -SourceDirectory/-DestinationDirectory to
# sync a different book.

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

function Resolve-ProjectPath([string]$Path) {
    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }
    return [System.IO.Path]::GetFullPath((Join-Path $projectRoot $Path))
}

$sourcePath = Resolve-ProjectPath $SourceDirectory
$destinationPath = Resolve-ProjectPath $DestinationDirectory
$resolvedRoot = [System.IO.Path]::GetFullPath($projectRoot)
if (-not $destinationPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Destination directory must be inside the project root: $resolvedRoot"
}

if (-not (Test-Path -LiteralPath $sourcePath -PathType Container)) {
    Write-Host "Audio source not found: $sourcePath" -ForegroundColor Yellow
    Write-Host "Skipped audio sync. Pass -SourceDirectory to point at the raw recordings." -ForegroundColor Yellow
    exit 0
}

function Get-AudioTarget([string]$RelativePath) {
    $parts = $RelativePath -split '[\\/]'
    if ($parts.Count -lt 2) { return $null }
    $top = $parts[0]
    $folder = ""
    if ($parts.Count -gt 2) { $folder = $parts[1] }
    $base = [System.IO.Path]::GetFileNameWithoutExtension($parts[-1]).TrimEnd([char[]]@('.', ' '))

    if ($top -eq "Proper nouns") { return @{ Slug = "appendix"; Name = "proper-nouns" } }
    if ($top -eq "pronounciation guide") { return @{ Slug = "appendix"; Name = "pronunciation-guide" } }

    $slug = ""
    if ($top -eq "Starter") {
        $slug = "starter"
    } elseif ($top -match '^Unit ([0-9]+)$') {
        $slug = "unit" + $Matches[1]
    } else {
        return $null
    }

    if ($top -eq "Starter") {
        if ($folder -eq "Words and expressions") { return @{ Slug = $slug; Name = "vocab" } }
        if ($folder -eq "Know your school") { return @{ Slug = $slug; Name = "reading" } }
        $number = ($base -split '\s+')[0]
        $starterMap = @{ "2" = "listening-1"; "3" = "listening-2"; "10" = "listening-3" }
        if ($starterMap.ContainsKey($number)) { return @{ Slug = $slug; Name = $starterMap[$number] } }
        return $null
    }

    if ($folder -eq "Words and expressions") { return @{ Slug = $slug; Name = "vocab" } }
    if ($folder -eq "Understanding ideas") {
        if ($base -like "2 *") { return @{ Slug = $slug; Name = "reading" } }
        return @{ Slug = $slug; Name = "speaking" }
    }
    if ($folder -eq "Developing ideas") {
        if ($base -like "Phonetics in use*") { return @{ Slug = $slug; Name = "phonetics" } }
        if ($parts.Count -gt 3 -and $parts[2] -eq "Reading for writing") {
            return @{ Slug = $slug; Name = "writing" }
        }
        $number = ($base -split '\s+')[0]
        if ($number -match '^[0-9]+$') { return @{ Slug = $slug; Name = "listening-" + $number } }
        return $null
    }
    return $null
}

$ffmpeg = ""
if (-not [string]::IsNullOrWhiteSpace($FfmpegPath)) {
    $ffmpeg = $FfmpegPath
} else {
    $command = Get-Command "ffmpeg" -ErrorAction SilentlyContinue
    if ($command) { $ffmpeg = $command.Source }
}

$produced = @{}
$copied = 0
$converted = 0
$skipped = New-Object System.Collections.Generic.List[string]

foreach ($file in (Get-ChildItem -LiteralPath $sourcePath -Recurse -File | Sort-Object FullName)) {
    $relative = $file.FullName.Substring($sourcePath.Length).TrimStart([char[]]@('\', '/'))
    $target = Get-AudioTarget $relative
    if (-not $target) {
        $skipped.Add($relative)
        continue
    }
    $extension = $file.Extension.ToLowerInvariant()
    if ($extension -ne ".mp3" -and $extension -ne ".wav") {
        $skipped.Add($relative)
        continue
    }

    $targetDirectory = Join-Path $destinationPath $target.Slug
    New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
    $targetFile = Join-Path $targetDirectory ($target.Name + ".mp3")

    if ($extension -eq ".wav") {
        if ([string]::IsNullOrWhiteSpace($ffmpeg)) {
            throw "ffmpeg is required to convert $relative. Install ffmpeg or pass -FfmpegPath."
        }
        & $ffmpeg -y -loglevel error -i $file.FullName -ac 1 -b:a 96k $targetFile
        if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed to convert $relative" }
        $converted++
    } else {
        Copy-Item -LiteralPath $file.FullName -Destination $targetFile -Force
        $copied++
    }
    $produced[$targetFile] = $true
}

if (-not $NoPrune -and (Test-Path -LiteralPath $destinationPath -PathType Container)) {
    foreach ($existing in (Get-ChildItem -LiteralPath $destinationPath -Recurse -File)) {
        if (-not $produced.ContainsKey($existing.FullName)) {
            Remove-Item -LiteralPath $existing.FullName -Force
            Write-Host "Removed stale audio: $($existing.FullName.Substring($destinationPath.Length).TrimStart([char[]]@('\', '/')))" -ForegroundColor Yellow
        }
    }
}

$totalSize = 0
foreach ($path in $produced.Keys) { $totalSize += (Get-Item -LiteralPath $path).Length }
Write-Host ("Synced textbook audio: {0} copied, {1} converted, {2} file(s), {3} MB -> {4}" -f $copied, $converted, $produced.Count, [math]::Round($totalSize / 1MB, 1), $destinationPath) -ForegroundColor Green
if ($skipped.Count -gt 0) {
    Write-Host "Ignored $($skipped.Count) file(s) outside the known layout:" -ForegroundColor Yellow
    foreach ($item in ($skipped | Select-Object -First 10)) { Write-Host "  $item" -ForegroundColor Yellow }
}
exit 0
