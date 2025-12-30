@echo off
REM Restart Lab Manager Backend
REM Kills existing backend and starts fresh

echo ================================================
echo    Lab Manager - Restart Backend
echo ================================================
echo.

echo [1/2] Killing existing backend process...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)
timeout /t 1 /nobreak >nul

echo [2/2] Starting backend...
cd "%~dp0..\scripts\lab_dashboard\server"
start "Lab Manager Backend" cmd /k "node server.js"

echo.
echo ✅ Backend restarted!
echo    Running on: http://localhost:3000
echo.
pause
