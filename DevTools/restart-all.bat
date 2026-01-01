@echo off
REM Restart Full Lab Manager System
REM New Unified Architecture (Port 3000)

echo ================================================
echo    Lab Manager - Unified Server Restart
echo ================================================
echo.

echo [1/2] Killing all node processes...
taskkill /F /IM node.exe 2>NUL
ping 127.0.0.1 -n 3 > NUL

echo [2/2] Starting Unified Server (Backend + Frontend)...
cd "%~dp0..\scripts\lab_dashboard"
start "Lab Manager Unified Server" cmd /k "node server/server.js"
ping 127.0.0.1 -n 3 > NUL

echo.
echo ================================================
echo ✅ Unified Server Restarted!
echo ================================================
echo.
echo URL: http://localhost:3000 (Backend API + Frontend)
echo.
echo Note: This script now launches a SINGLE process.
echo Files are served statically from /client/dist.
echo.
pause
