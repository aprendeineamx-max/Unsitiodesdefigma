@echo off
:: ============================================================
:: Lab Dashboard - Portable Launcher
:: One-click start for any Windows PC
:: ============================================================
title Lab Dashboard Portable Launcher
color 0A

echo.
echo  ========================================
echo    LAB DASHBOARD - PORTABLE LAUNCHER
echo  ========================================
echo.

:: Check if Node is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Node.js no detectado en el sistema.
    echo [!] Ejecutando instalador automatico...
    echo.
    call "%~dp0DevTools\install-node.bat"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] No se pudo instalar Node.js
        echo Por favor instala Node.js manualmente desde https://nodejs.org
        pause
        exit /b 1
    )
)

:: Verify Node version
echo [OK] Node.js detectado:
node --version
echo.

:: Navigate to script directory
cd /d "%~dp0"

:: Check if node_modules exist for server
if not exist "scripts\lab_dashboard\server\node_modules" (
    echo [*] Instalando dependencias del servidor...
    cd scripts\lab_dashboard\server
    call npm install --legacy-peer-deps
    cd /d "%~dp0"
    echo.
)

:: Check if node_modules exist for client
if not exist "scripts\lab_dashboard\client\node_modules" (
    echo [*] Instalando dependencias del cliente...
    cd scripts\lab_dashboard\client
    call npm install --legacy-peer-deps
    cd /d "%~dp0"
    echo.
)

:: Find available port
set PORT=5175
echo [*] Verificando puerto %PORT%...

:: Check if .env exists, create if not
if not exist "scripts\lab_dashboard\server\.env" (
    echo [!] Archivo .env no encontrado.
    echo [!] Ejecuta primero: configure-storage.bat
    echo.
    echo Puedes continuar sin Object Storage (modo local)
    echo o configurar las credenciales de Vultr S3.
    echo.
    choice /C YN /M "Continuar sin Object Storage"
    if errorlevel 2 (
        echo.
        echo Ejecuta: configure-storage.bat
        pause
        exit /b 0
    )
    :: Create minimal .env
    echo # Lab Dashboard Environment > scripts\lab_dashboard\server\.env
    echo VULTR_ACCESS_KEY= >> scripts\lab_dashboard\server\.env
    echo VULTR_SECRET_KEY= >> scripts\lab_dashboard\server\.env
    echo VULTR_BUCKET_NAME=lab-backups >> scripts\lab_dashboard\server\.env
    echo VULTR_ENDPOINT=ewr1.vultrobjects.com >> scripts\lab_dashboard\server\.env
)

echo.
echo  ========================================
echo    INICIANDO LAB DASHBOARD
echo  ========================================
echo.
echo [*] El navegador se abrira automaticamente...
echo [*] Para detener: Cierra esta ventana
echo.

:: Start with DevTools script
call "%~dp0DevTools\dev-start.bat"

pause
