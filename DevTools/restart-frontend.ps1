# Lab Manager - Restart Frontend
# PowerShell script that runs in VS Code terminal

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Lab Manager - Restart Frontend" -ForegroundColor Cyan  
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Killing existing frontend processes..." -ForegroundColor Yellow
try {
    $viteProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*vite*" }
    if ($viteProcesses) {
        $viteProcesses | Stop-Process -Force
        Write-Host "✓ Killed Vite processes" -ForegroundColor Green
    }
    else {
        Write-Host "✓ No Vite processes found" -ForegroundColor Gray
    }
}
catch {
    Write-Host "✓ No frontend processes to kill" -ForegroundColor Gray
}

Start-Sleep -Seconds 1

Write-Host "[2/2] Starting frontend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\scripts\lab_dashboard\client"
npm run dev
