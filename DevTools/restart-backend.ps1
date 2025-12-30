# Lab Manager - Restart Backend
# PowerShell script that runs in VS Code terminal

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Lab Manager - Restart Backend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Killing existing backend process..." -ForegroundColor Yellow
try {
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($port3000) {
        taskkill /F /PID $port3000.OwningProcess 2>$null
        Write-Host "Killed process on port 3000" -ForegroundColor Green
    }
    else {
        Write-Host "No process found on port 3000" -ForegroundColor Gray
    }
}
catch {
    Write-Host "Port 3000 is free" -ForegroundColor Gray
}

Start-Sleep -Seconds 1

Write-Host "[2/2] Starting backend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\scripts\lab_dashboard\server"
node server.js
