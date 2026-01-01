@echo off
:: ============================================================
:: Node.js Portable Installer for Windows
:: Downloads and installs Node.js LTS if not present
:: ============================================================
title Node.js Installer
color 0E

echo.
echo  ========================================
echo    NODE.JS AUTOMATIC INSTALLER
echo  ========================================
echo.

:: Check if already installed
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js ya esta instalado:
    node --version
    echo.
    exit /b 0
)

echo [*] Descargando Node.js LTS...
echo.

:: Create temp directory
if not exist "%TEMP%\node-installer" mkdir "%TEMP%\node-installer"

:: Download Node.js using PowerShell
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi' -OutFile '%TEMP%\node-installer\node-installer.msi' }"

if %ERRORLEVEL% neq 0 (
    echo [ERROR] No se pudo descargar Node.js
    echo Por favor descarga manualmente desde https://nodejs.org
    exit /b 1
)

echo [*] Instalando Node.js (requiere permisos de administrador)...
echo.

:: Install Node.js silently
msiexec /i "%TEMP%\node-installer\node-installer.msi" /qn /norestart

if %ERRORLEVEL% neq 0 (
    echo [!] Instalacion silenciosa fallo.
    echo [*] Abriendo instalador interactivo...
    start /wait "" "%TEMP%\node-installer\node-installer.msi"
)

:: Update PATH for current session
set "PATH=%PATH%;C:\Program Files\nodejs"

:: Verify installation
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo.
    echo [OK] Node.js instalado correctamente:
    node --version
    echo.
    exit /b 0
) else (
    echo.
    echo [!] Es posible que necesites reiniciar la terminal.
    echo [!] Node.js se instalo pero PATH no se actualizo.
    echo.
    exit /b 0
)
