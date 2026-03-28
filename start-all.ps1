param(
    [switch]$NoEngine = $false,
    [switch]$NoWeb = $false,
    [switch]$NoBrowser = $false
)

$ErrorActionPreference = "Stop"
$rootPath = "D:\My work\flowholt"
$enginePath = Join-Path $rootPath "flowholt-engine"
$webPath = Join-Path $rootPath "flowholt-web"

function Resolve-PythonCommand {
    $venvPython = Join-Path $enginePath ".venv\Scripts\python.exe"
    if (Test-Path $venvPython) {
        return '"' + $venvPython + '"'
    }

    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCmd) {
        return "python"
    }

    $pyCmd = Get-Command py -ErrorAction SilentlyContinue
    if ($pyCmd) {
        return "py -3"
    }

    throw "Python was not found. Install Python or create flowholt-engine\\.venv first."
}

function Stop-ProcessOnPort {
    param([int]$Port)

    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if (-not $connections) {
            return
        }

        $connections |
            Select-Object -ExpandProperty OwningProcess -Unique |
            ForEach-Object {
                if ($_ -and $_ -gt 0) {
                    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
                }
            }
        Start-Sleep -Seconds 1
    } catch {
    }
}

if (-not (Test-Path $enginePath)) {
    throw "Engine path not found: $enginePath"
}

if (-not (Test-Path $webPath)) {
    throw "Web path not found: $webPath"
}

$pythonCommand = Resolve-PythonCommand

Stop-ProcessOnPort -Port 3000
Stop-ProcessOnPort -Port 8000

if (-not $NoEngine) {
    $engineCmd = "Set-Location '$enginePath'; $pythonCommand -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $engineCmd | Out-Null
}

if (-not $NoWeb) {
    $webCmd = "Set-Location '$webPath'; npm run dev:local"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $webCmd | Out-Null
}

Write-Host "FlowHolt local services starting..." -ForegroundColor Green
Write-Host "Web:    http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host "Engine: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Cyan

if (-not $NoBrowser) {
    Start-Sleep -Seconds 2
    Start-Process "http://127.0.0.1:3000"
}
