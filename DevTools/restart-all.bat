@echo off
REM Restart Full Lab Manager System
REM Kills and restarts both backend and frontend

echo ================================================
echo    Lab Manager - Full System Restart
echo ================================================
echo.

echo [1/4] Killing backend...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)
timeout /t 1 /nobreak >nul

echo [2/4] Killing frontend...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *npm*" 2>nul
timeout /t 1 /nobreak >nul

echo [3/4] Starting backend...
cd "%~dp0..\scripts\lab_dashboard\server"
start "Lab Manager Backend" cmd /k "node server.js"
timeout /t 2 /nobreak >nul

echo [4/4] Starting frontend...
cd "%~dp0..\scripts\lab_dashboard\client"
start "Lab Manager Frontend" cmd /k "npm run dev"

echo.
echo ✅ Full system restarted!
echo    Backend:  http://localhost:3000
echo    Frontend: http://localhost:5175
echo.
pause
