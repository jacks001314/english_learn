[CmdletBinding()]
param(
    [string]$HostName = "www.gbw3bao.com",
    [string]$UserName = "root",
    [string]$Password = "Shage070338",
    [string]$HostKeyFingerprint = "SHA256:9zDhgiaK64b7V65PyAAhHaevAteyPkdyLURgGb055CY",
    [string]$RemoteRoot = "/opt/english-learn",
    [string]$ServiceName = "english-learn",
    [string]$ListenAddress = ":8081",
    [string]$StagingDirectory = ".tmp/deploy",
    [string]$PuttyDirectory = "",
    [string]$NginxProxyConfig = "scripts/english-learn.nginx.conf",
    [switch]$InstallNginxProxy,
    [switch]$SkipBuild,
    [switch]$SkipAudioSync,
    [switch]$SkipDeploy,
    [switch]$SkipRestart
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$stagingPath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $StagingDirectory))
$resolvedRoot = [System.IO.Path]::GetFullPath($projectRoot)
if (-not $stagingPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Staging directory must be inside the project root: $resolvedRoot"
}

function Invoke-Step([string]$Title, [scriptblock]$Action) {
    Write-Host "`n==> $Title" -ForegroundColor Cyan
    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "$Title failed with exit code $LASTEXITCODE"
    }
}

function Get-PuttyTool([string]$Name) {
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $toolDir = if ([string]::IsNullOrWhiteSpace($PuttyDirectory)) {
        Join-Path $projectRoot ".tmp/putty"
    } else {
        [System.IO.Path]::GetFullPath($PuttyDirectory)
    }
    New-Item -ItemType Directory -Path $toolDir -Force | Out-Null
    $toolPath = Join-Path $toolDir $Name
    if (-not (Test-Path -LiteralPath $toolPath)) {
        $url = "https://the.earth.li/~sgtatham/putty/latest/w64/$Name"
        Write-Host "Downloading $Name from $url" -ForegroundColor Yellow
        Invoke-WebRequest -Uri $url -OutFile $toolPath
    }
    if (-not (Test-Path -LiteralPath $toolPath)) {
        throw "$Name was not found. Install PuTTY tools or provide -PuttyDirectory with plink.exe and pscp.exe."
    }
    return $toolPath
}

function Test-RemoteConnection([string]$Plink) {
    Write-Host "Checking SSH connection to $UserName@$HostName ..." -ForegroundColor Cyan
    $previousErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = & $Plink -batch -hostkey $HostKeyFingerprint -pw $Password "$UserName@$HostName" "exit" 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0) {
            throw "Cannot connect to $UserName@$HostName. Check host, credentials, and network. Output: $output"
        }
    } finally {
        $ErrorActionPreference = $previousErrorAction
    }
}

function Invoke-Remote([string]$Plink, [string]$Command) {
    $previousErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = & $Plink -batch -hostkey $HostKeyFingerprint -pw $Password "$UserName@$HostName" $Command 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0) {
            throw "Remote command failed: $Command`n$output"
        }
        return $output
    } finally {
        $ErrorActionPreference = $previousErrorAction
    }
}

function Send-RemoteFile([string]$Pscp, [string]$LocalPath, [string]$RemotePath) {
    $previousErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = & $Pscp -batch -hostkey $HostKeyFingerprint -pw $Password $LocalPath "${UserName}@${HostName}:$RemotePath" 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0) {
            throw "Upload failed: $LocalPath -> $RemotePath`n$output"
        }
    } finally {
        $ErrorActionPreference = $previousErrorAction
    }
}

# Windows bsdtar crashes (0xC0000005) on non-ASCII archive members such as the
# IPA phoneme files in web/audio/phonemes, so prefer Python's tarfile module.
function New-DeploymentArchive([string]$SourceDirectory, [string]$ArchivePath, [string[]]$Items) {
    $python = Get-Command "python" -ErrorAction SilentlyContinue
    if (-not $python) {
        $python = Get-Command "python3" -ErrorAction SilentlyContinue
    }

    if ($python) {
        $scriptPath = Join-Path ([System.IO.Path]::GetTempPath()) "english-learn-archive.py"
        $script = @'
import os
import sys
import tarfile

source, archive = sys.argv[1], sys.argv[2]
items = sys.argv[3:]


def normalize(info):
    info.uid = 0
    info.gid = 0
    info.uname = "root"
    info.gname = "root"
    info.mtime = int(info.mtime)
    return info


with tarfile.open(archive, "w:gz") as bundle:
    for item in items:
        bundle.add(os.path.join(source, item), arcname=item, filter=normalize)
'@
        Set-Content -LiteralPath $scriptPath -Value $script -Encoding UTF8
        & $python.Source $scriptPath $SourceDirectory $ArchivePath @Items
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create $ArchivePath with Python tarfile (exit code $LASTEXITCODE)."
        }
        return
    }

    Write-Host "Python was not found; falling back to the system tar command." -ForegroundColor Yellow
    Push-Location $SourceDirectory
    try {
        & tar -czf $ArchivePath @Items
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create $ArchivePath with tar (exit code $LASTEXITCODE)."
        }
    } finally {
        Pop-Location
    }
}

if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    throw "Go was not found. Install Go 1.26.5 or a compatible version and add it to PATH."
}

Push-Location $projectRoot
try {
    if (Test-Path -LiteralPath $stagingPath) {
        Remove-Item -LiteralPath $stagingPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $stagingPath -Force | Out-Null

    # Refresh the served recordings from the raw audio folder before staging so
    # the deployed bundle always carries the current textbook audio.
    if (-not $SkipAudioSync) {
        Invoke-Step "Sync textbook audio (audio_7 -> web/audio/7)" { & (Join-Path $PSScriptRoot "import-audio.ps1") }
    }

    if (-not $SkipBuild) {
        Invoke-Step "Cross-compile server for linux/amd64" {
            $env:GOOS = "linux"
            $env:GOARCH = "amd64"
            $env:CGO_ENABLED = "0"
            go build -buildvcs=false -trimpath -ldflags "-s -w" -o (Join-Path $stagingPath "english-learn") ./cmd/server
        }
    } else {
        if (-not (Test-Path -LiteralPath (Join-Path $stagingPath "english-learn"))) {
            throw "SkipBuild was set but $stagingPath\english-learn does not exist. Build once first or remove -SkipBuild."
        }
    }

    Copy-Item -LiteralPath (Join-Path $projectRoot "web") -Destination $stagingPath -Recurse
    Copy-Item -LiteralPath (Join-Path $projectRoot "backend") -Destination $stagingPath -Recurse
    Copy-Item -LiteralPath (Join-Path $projectRoot "chuzhong") -Destination $stagingPath -Recurse
    Copy-Item -LiteralPath (Join-Path $projectRoot "README.md") -Destination $stagingPath

    $stagedAudio = Join-Path $stagingPath "web/audio/7"
    if (-not (Test-Path -LiteralPath $stagedAudio -PathType Container)) {
        throw "Textbook audio was not staged: $stagedAudio. Run scripts/import-audio.ps1 first."
    }
    $stagedAudioFiles = @(Get-ChildItem -LiteralPath $stagedAudio -Recurse -File -Filter *.mp3)
    if ($stagedAudioFiles.Count -eq 0) {
        throw "Textbook audio directory is empty: $stagedAudio"
    }
    $stagedAudioMb = [math]::Round((($stagedAudioFiles | Measure-Object -Property Length -Sum).Sum / 1MB), 1)
    Write-Host "Packaged textbook audio: $($stagedAudioFiles.Count) file(s), $stagedAudioMb MB" -ForegroundColor Green

    $version = Get-Date -Format "yyyyMMdd-HHmmss"
    Set-Content -LiteralPath (Join-Path $stagingPath "VERSION") -Value $version -Encoding Ascii

    $serviceFile = Join-Path $stagingPath "$ServiceName.service"
    $serviceContent = @"
[Unit]
Description=English Learn
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=$RemoteRoot
Environment=ENGLISH_LEARN_ROOT=$RemoteRoot
ExecStart=$RemoteRoot/english-learn -addr $ListenAddress
Restart=always
RestartSec=3
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
"@
    Set-Content -LiteralPath $serviceFile -Value $serviceContent -Encoding Ascii

    $archivePath = Join-Path $stagingPath "english-learn-linux-amd64.tar.gz"
    Invoke-Step "Create deployment archive" {
        New-DeploymentArchive $stagingPath $archivePath @("english-learn", "web", "backend", "chuzhong", "README.md", "VERSION")
    }

    Write-Host "Staging package ready: $archivePath" -ForegroundColor Green
    if ($SkipDeploy) {
        Write-Host "SkipDeploy was set. Files are staged but not uploaded." -ForegroundColor Yellow
        return
    }

    $plink = Get-PuttyTool "plink.exe"
    $pscp = Get-PuttyTool "pscp.exe"
    Test-RemoteConnection $plink

    Invoke-Remote $plink "command -v tar >/dev/null 2>&1 && command -v systemctl >/dev/null 2>&1 || (echo 'tar/systemctl are required on the remote host' >&2; exit 1)"
    Invoke-Remote $plink "mkdir -p '$RemoteRoot' '$RemoteRoot/backups'"

    Invoke-Remote $plink "if [ -f '$RemoteRoot/english_learn.db' ]; then cp -a '$RemoteRoot/english_learn.db' '$RemoteRoot/backups/english_learn-$version.db'; fi"

    Send-RemoteFile $pscp $archivePath "$RemoteRoot/english-learn-linux-amd64.tar.gz"
    Send-RemoteFile $pscp $serviceFile "/etc/systemd/system/$ServiceName.service"

    if (-not $SkipRestart) {
        Invoke-Remote $plink "systemctl stop '$ServiceName' 2>/dev/null || true"
    }

    Invoke-Remote $plink "rm -rf '$RemoteRoot/web' '$RemoteRoot/backend' '$RemoteRoot/chuzhong' && rm -f '$RemoteRoot/english-learn' && tar -xzf '$RemoteRoot/english-learn-linux-amd64.tar.gz' -C '$RemoteRoot' && chmod +x '$RemoteRoot/english-learn'"
    Invoke-Remote $plink "systemctl daemon-reload && systemctl enable '$ServiceName' 2>/dev/null || true"

    if (-not $SkipRestart) {
        Invoke-Remote $plink "systemctl restart '$ServiceName'"
        Start-Sleep -Seconds 2
        $healthPort = ($ListenAddress -split ":")[-1]
        if ([string]::IsNullOrWhiteSpace($healthPort)) { $healthPort = "8080" }
        Invoke-Remote $plink "if command -v curl >/dev/null 2>&1; then curl -fsS 'http://127.0.0.1:$healthPort/api/health'; else echo 'curl not found; skipped health check'; fi"
        Invoke-Remote $plink "if command -v curl >/dev/null 2>&1; then curl -fsS -o /dev/null -w 'audio http %{http_code}, %{size_download} bytes\n' 'http://127.0.0.1:$healthPort/audio/7/unit1/vocab.mp3'; else echo 'curl not found; skipped audio check'; fi"
    }

    if ($InstallNginxProxy) {
        $nginxConfigPath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $NginxProxyConfig))
        if (-not (Test-Path -LiteralPath $nginxConfigPath)) {
            throw "Nginx proxy config was not found: $nginxConfigPath"
        }
        Send-RemoteFile $pscp $nginxConfigPath "/etc/nginx/conf.d/$ServiceName.conf"
        Invoke-Remote $plink "nginx -t && systemctl reload nginx"
        Write-Host "Nginx proxy installed and reloaded." -ForegroundColor Green
    }

    Write-Host "`nDeployment completed." -ForegroundColor Green
    Write-Host "Service: $ServiceName" -ForegroundColor Green
    Write-Host "Remote root: $RemoteRoot" -ForegroundColor Green
    Write-Host "Deployed version: $version" -ForegroundColor Green
} finally {
    Pop-Location
}
