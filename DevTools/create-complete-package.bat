@echo off
:: ============================================================
:: Create Complete Portable Package WITH Credentials
:: Ready to run on any PC without any configuration
:: ============================================================
title Create Complete Portable Package
color 0E

echo.
echo  ==================================================
echo    CREAR PAQUETE PORTABLE COMPLETO (CON CREDENCIALES)
echo  ==================================================
echo.

cd /d "%~dp0.."

:: Check if .env exists
if not exist "scripts\lab_dashboard\server\.env" (
    echo [ERROR] No existe archivo .env con credenciales
    echo Por favor primero configura las credenciales:
    echo     DevTools\configure-storage.bat
    pause
    exit /b 1
)

:: Set package name with date
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "DATE=%dt:~0,8%"
set "TIME=%dt:~8,4%"
set "PACKAGE_NAME=LabDashboard-COMPLETO-%DATE%_%TIME%"

echo [OK] Archivo .env encontrado - Se incluiran las credenciales
echo.
echo [*] Nombre del paquete: %PACKAGE_NAME%.zip
echo.

:: Create output directory
if not exist "C:\PortablePackages" mkdir "C:\PortablePackages"

echo [*] Comprimiendo proyecto completo...
echo [*] (Esto puede tomar varios minutos)
echo.

:: Create a PowerShell script to do proper exclusions
powershell -Command "& { $ErrorActionPreference = 'SilentlyContinue'; $source = '%CD%'; $tempDir = Join-Path $env:TEMP 'LabDashboardTemp'; if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }; New-Item -ItemType Directory -Path $tempDir | Out-Null; $excludeDirs = @('.git', 'node_modules'); $excludeFiles = @('*.log', '*.pdb', 'jobs.json'); Write-Host '[*] Copiando archivos...'; robocopy $source $tempDir /E /XD .git node_modules /XF *.log *.pdb jobs.json /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null; Write-Host '[*] Creando ZIP...'; $dest = 'C:\PortablePackages\%PACKAGE_NAME%.zip'; if (Test-Path $dest) { Remove-Item $dest }; Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $dest -CompressionLevel Optimal; Remove-Item -Recurse -Force $tempDir; Write-Host '[OK] Paquete creado!' }"

if exist "C:\PortablePackages\%PACKAGE_NAME%.zip" (
    echo.
    echo  ==================================================
    echo    PAQUETE COMPLETO CREADO EXITOSAMENTE!
    echo  ==================================================
    echo.
    echo Ubicacion: C:\PortablePackages\%PACKAGE_NAME%.zip
    echo.
    echo CONTENIDO DEL PAQUETE:
    echo   [x] Codigo fuente completo
    echo   [x] Credenciales Vultr S3 (.env)
    echo   [x] Scripts de inicio
    echo.
    echo INSTRUCCIONES PARA NUEVA PC:
    echo   1. Copia el ZIP a la nueva PC
    echo   2. Extrae el contenido
    echo   3. Ejecuta START-LAB.bat
    echo   4. Se instalara Node.js automaticamente
    echo   5. Se instalaran dependencias automaticamente
    echo   6. El navegador se abrira automaticamente
    echo.
    echo   LISTO! Ya podras hacer backup de esa PC
    echo.
    explorer "C:\PortablePackages"
) else (
    echo [ERROR] No se pudo crear el paquete
)

echo.
pause
