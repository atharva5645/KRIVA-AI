param(
    [switch]$WithAI,
    [switch]$Install
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Ensure-NpmDependencies {
    param([string]$Directory)

    $nodeModulesPath = Join-Path $Directory "node_modules"
    if ($Install -or -not (Test-Path $nodeModulesPath)) {
        Write-Host "Installing dependencies in $Directory ..."
        Push-Location $Directory
        npm install
        Pop-Location
    }
}

$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$aiDir = Join-Path $root "ai_module"

Ensure-NpmDependencies -Directory $backendDir
Ensure-NpmDependencies -Directory $frontendDir

Write-Host "Starting backend on http://localhost:5000 ..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendDir'; npm run dev"
)

Write-Host "Starting frontend on http://localhost:5173 ..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontendDir'; npm run dev"
)

if ($WithAI) {
    $pythonExe = Join-Path $root ".venv\Scripts\python.exe"
    if (Test-Path $pythonExe) {
        Write-Host "Starting AI service on http://localhost:5001 ..."
        Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command",
            "Set-Location '$aiDir'; & '$pythonExe' ai_service.py"
        )
    } else {
        Write-Host "AI service not started: Python executable not found at $pythonExe"
    }
}

Write-Host ""
Write-Host "All requested services have been launched in separate terminals."
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:5000/api/health"
if ($WithAI) {
    Write-Host "AI:       http://localhost:5001/predict-market?commodity=Tomato"
}
