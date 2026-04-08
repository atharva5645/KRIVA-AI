$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[dev] $msg" -ForegroundColor Cyan }
function Write-WarnMsg($msg) { Write-Host "[dev] $msg" -ForegroundColor Yellow }
function Write-ErrMsg($msg) { Write-Host "[dev] $msg" -ForegroundColor Red }

$backendDir = Split-Path -Parent $PSScriptRoot
Set-Location $backendDir

function Test-PortOpen {
    param(
        [string]$HostName = "127.0.0.1",
        [int]$Port = 3306
    )
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect($HostName, $Port, $null, $null)
        $ok = $iar.AsyncWaitHandle.WaitOne(1000, $false)
        if (-not $ok) {
            $client.Close()
            return $false
        }
        $client.EndConnect($iar) | Out-Null
        $client.Close()
        return $true
    } catch {
        return $false
    }
}

Write-Info "Checking local database availability on port 3306..."
$portOpen = Test-PortOpen

if (-not $portOpen) {
    $dbServices = Get-Service | Where-Object {
        $_.Name -match "mysql|maria" -or $_.DisplayName -match "mysql|maria"
    }

    if ($dbServices.Count -gt 0) {
        $running = $dbServices | Where-Object { $_.Status -eq "Running" }
        if ($running.Count -eq 0) {
            foreach ($svc in $dbServices) {
                try {
                    Write-Info "Starting database service: $($svc.Name)"
                    Start-Service -Name $svc.Name -ErrorAction Stop
                } catch {
                    Write-WarnMsg "Could not start service '$($svc.Name)'. Try running terminal as Administrator."
                }
            }
        }
        Start-Sleep -Seconds 2
        $portOpen = Test-PortOpen
    }
}

if (-not $portOpen) {
    $mysqldCandidates = @(
        "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe",
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe",
        "C:\xampp\mysql\bin\mysqld.exe"
    ) | Where-Object { Test-Path $_ }

    if ($mysqldCandidates.Count -gt 0) {
        $mysqld = $mysqldCandidates[0]
        $dataDir = if (Test-Path "C:\mysql-data") { "C:\mysql-data" } else { $null }
        try {
            Write-Info "Trying direct MySQL startup via: $mysqld"
            if ($dataDir) {
                Start-Process -FilePath $mysqld -ArgumentList "--datadir=$dataDir", "--port=3306" -WindowStyle Hidden
            } else {
                Start-Process -FilePath $mysqld -ArgumentList "--port=3306" -WindowStyle Hidden
            }
            Start-Sleep -Seconds 3
            $portOpen = Test-PortOpen
        } catch {
            Write-WarnMsg "Direct MySQL startup failed. You may need Administrator terminal for first-time setup."
        }
    }
}

if (-not $portOpen) {
    Write-ErrMsg "Database is still not reachable on localhost:3306."
    Write-Host ""
    Write-Host "Permanent fix (run once in Administrator PowerShell):"
    Write-Host "  cd `"C:\Program Files\MySQL\MySQL Server 8.4\bin`""
    Write-Host "  .\mysqld --install MySQL80 --datadir=C:\mysql-data"
    Write-Host "  Start-Service MySQL80"
    Write-Host ""
    Write-Host "Then run this again in your normal terminal: npm run dev"
    exit 1
}

Write-Info "Database port is open. Starting frontend + backend..."
npm run dev:stack
