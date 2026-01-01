@echo off
:: ============================================================
:: Quick Start - Minimal Launcher
:: For when dependencies are already installed
:: ============================================================
title Lab Dashboard
color 0A

cd /d "%~dp0"

echo.
echo  LAB DASHBOARD - Starting...
echo.

:: Start server and client
start "Lab Server" cmd /c "cd scripts\lab_dashboard\server && npm start"

:: Wait for server to start
timeout /t 3 /nobreak >nul

:: Start client with open browser
start "Lab Client" cmd /c "cd scripts\lab_dashboard\client && npm run dev -- --open"

echo.
echo [OK] Lab Dashboard iniciado!
echo [*] El navegador se abrira en unos segundos...
echo.
echo Para detener: Cierra las ventanas de terminal abiertas
echo.

exit
