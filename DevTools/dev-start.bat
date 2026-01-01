@echo off
echo ================================================
echo    Lab Manager - DEV MODE (Hot Reload)
echo ================================================
echo.
echo [1/3] Killing existing processes...
taskkill /F /IM node.exe >nul 2>&1
echo.

echo [2/3] Starting Backend API (Port 3000)...
cd scripts/lab_dashboard
start /B node server/server.js
echo.

echo [3/3] Starting Vite Frontend (Port 5175)...
echo       Please wait for the browser to open...
cd client
call npm run dev
pause
