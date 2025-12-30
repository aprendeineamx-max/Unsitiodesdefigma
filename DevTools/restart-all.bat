@echo off
REM Restart Full Lab Manager System
REM Kills and restarts backend and BOTH frontends

echo ================================================
echo    Lab Manager - Full System Restart
echo ================================================
echo.

echo [1/4] Killing all node processes...
taskkill /F /IM node.exe 2>NUL
ping 127.0.0.1 -n 3 > NUL

echo [2/4] Starting backend (port 3000)...
cd "%~dp0..\scripts\lab_dashboard\server"
start "Lab Manager Backend" cmd /k "node server.js"
ping 127.0.0.1 -n 3 > NUL

echo [3/4] Starting frontend dev (port 5175)...
cd "%~dp0..\scripts\lab_dashboard\client"
start "Lab Manager Frontend Dev" cmd /k "npm run dev"
ping 127.0.0.1 -n 3 > NUL

echo [4/4] Starting frontend preview (port 4173)...
start "Lab Manager Frontend Preview" cmd /k "npm run preview"

echo.
echo ================================================
echo ✅ Full system restarted!
echo ================================================
echo.
echo Available URLs:
echo   - Backend API:      http://localhost:3000
echo   - Frontend Dev:     http://localhost:5175  (hot reload)
echo   - Frontend Preview: http://localhost:4173  (production)
echo.
echo Use 5175 for development (hot reload)
echo Use 4173 for testing production build
echo.
pause
