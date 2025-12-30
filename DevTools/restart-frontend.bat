@echo off
REM Restart Lab Manager Frontend
REM Kills existing frontend and starts fresh

echo ================================================
echo    Lab Manager - Restart Frontend
echo ================================================
echo.

echo [1/2] Killing existing frontend process...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *npm*" 2>nul
timeout /t 1 /nobreak >nul

echo [2/2] Starting frontend...
cd "%~dp0..\scripts\lab_dashboard\client"
start "Lab Manager Frontend" cmd /k "npm run dev"

echo.
echo ✅ Frontend restarted!
echo    Running on: http://localhost:5175
echo.
pause
