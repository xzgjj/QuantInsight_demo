param(
    [ValidateSet("stage1", "all")]
    [string]$Phase = "stage1",
    [switch]$SkipInstall,
    [switch]$SkipDocker,
    [switch]$WithServices,
    [switch]$RunMigrations
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

function Run-Step($Name, $ScriptBlock) {
    Write-Host "==> $Name" -ForegroundColor Cyan
    try {
        & $ScriptBlock
    }
    catch {
        Write-Host "FAILED: $Name" -ForegroundColor Red
        throw
    }
}

function Write-WarningLine($Message) {
    Write-Host "WARN: $Message" -ForegroundColor Yellow
}

function Assert-Command($Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $Name"
    }
}

function Get-CommandOutput($Command, $Arguments) {
    $output = & $Command @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "$Command $($Arguments -join ' ') failed: $output"
    }
    return ($output | Out-String).Trim()
}

function Invoke-Native($Command, $Arguments) {
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Command $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

function Test-NodeLts($VersionText) {
    if ($VersionText -match "v(\d+)\.") {
        $major = [int]$Matches[1]
        return ($major -eq 22 -or $major -eq 24)
    }
    return $false
}

Run-Step "Toolchain detection" {
    Assert-Command "py"
    Assert-Command "node"
    Assert-Command "pnpm"

    $pythonVersion = Get-CommandOutput "py" @("-3.11", "--version")
    $nodeVersion = Get-CommandOutput "node" @("--version")
    $pnpmVersion = Get-CommandOutput "pnpm" @("--version")

    Write-Host "Python: $pythonVersion"
    Write-Host "Node: $nodeVersion"
    Write-Host "pnpm: $pnpmVersion"

    if (-not (Test-NodeLts $nodeVersion)) {
        Write-WarningLine "Node $nodeVersion is not the project baseline. Prefer Node 22 LTS or 24 LTS."
    }
}

if (-not $SkipDocker) {
    Run-Step "Docker daemon" {
        Assert-Command "docker"
        Invoke-Native "docker" @("info")
    }

    Run-Step "Docker Compose config" {
        Push-Location $Root
        Invoke-Native "docker" @("compose", "config", "--quiet")
        Pop-Location
    }
}

if ($WithServices) {
    Run-Step "Docker Compose services" {
        Push-Location $Root
        Invoke-Native "docker" @("compose", "up", "-d", "--wait", "postgres", "redis", "minio")
        Pop-Location
    }
}

Run-Step "Backend environment and tests" {
    Push-Location (Join-Path $Root "backend")
    if (-not (Test-Path ".venv")) {
        Invoke-Native "py" @("-3.11", "-m", "venv", ".venv")
    }
    if (-not $SkipInstall) {
        Invoke-Native ".\.venv\Scripts\python.exe" @("-m", "pip", "install", "--upgrade", "pip")
        Invoke-Native ".\.venv\Scripts\python.exe" @("-m", "pip", "install", "-r", "requirements-dev.txt")
    }
    Invoke-Native ".\.venv\Scripts\python.exe" @("-m", "ruff", "check", "app", "tests")
    Invoke-Native ".\.venv\Scripts\python.exe" @("-m", "pytest")
    Pop-Location
}

if ($RunMigrations) {
    Run-Step "Database migrations" {
        Push-Location $Root
        Invoke-Native ".\backend\.venv\Scripts\python.exe" @("-m", "alembic", "upgrade", "head")
        Invoke-Native ".\backend\.venv\Scripts\python.exe" @("-m", "alembic", "downgrade", "base")
        Invoke-Native ".\backend\.venv\Scripts\python.exe" @("-m", "alembic", "upgrade", "head")
        Pop-Location
    }
}

Run-Step "Frontend checks" {
    Push-Location (Join-Path $Root "frontend")
    if (-not $SkipInstall) {
        if ((Test-Path "pnpm-lock.yaml") -and ($env:CI -eq "true")) {
            Invoke-Native "pnpm" @("install", "--frozen-lockfile")
        }
        else {
            Invoke-Native "pnpm" @("install")
        }
    }
    Invoke-Native "pnpm" @("lint")
    Invoke-Native "pnpm" @("test")
    Invoke-Native "pnpm" @("build")
    Pop-Location
}

Run-Step "Validation summary" {
    Write-Host "Phase '$Phase' validation completed." -ForegroundColor Green
}
