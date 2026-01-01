@echo off
:: ============================================================
:: Create Portable Distribution Package
:: Creates a ZIP file ready to transfer to another PC
:: ============================================================
title Create Portable Package
color 0E

echo.
echo  ========================================
echo    CREAR PAQUETE PORTABLE
echo  ========================================
echo.

cd /d "%~dp0.."

:: Set package name with date
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "DATE=%dt:~0,8%"
set "PACKAGE_NAME=LabDashboard-Portable-%DATE%"

echo [*] Nombre del paquete: %PACKAGE_NAME%.zip
echo.

:: Create output directory
if not exist "C:\PortablePackages" mkdir "C:\PortablePackages"

:: Files to exclude
echo [*] Preparando archivos...
echo.

:: Create a temporary file list to exclude
(
echo node_modules
echo .git
echo *.log
echo .env
echo .DS_Store
echo Thumbs.db
echo *.pdb
echo jobs.json
) > "%TEMP%\exclude.txt"

echo [*] Comprimiendo... (esto puede tomar unos minutos)
echo.

:: Use PowerShell to create ZIP (excluding patterns)
powershell -Command "& { $source = '%CD%'; $dest = 'C:\PortablePackages\%PACKAGE_NAME%.zip'; $excludePatterns = @('*\node_modules\*', '*\.git\*', '*.log', '*.pdb', '*\jobs.json'); $files = Get-ChildItem -Path $source -Recurse -File | Where-Object { $match = $false; foreach ($pattern in $excludePatterns) { if ($_.FullName -like $pattern) { $match = $true; break } }; -not $match }; Write-Host 'Archivos a incluir:' $files.Count; Compress-Archive -Path ($files.FullName | Select-Object -First 5000) -DestinationPath $dest -Force }"

if %ERRORLEVEL% equ 0 (
    echo.
    echo  ========================================
    echo    PAQUETE CREADO EXITOSAMENTE!
    echo  ========================================
    echo.
    echo Ubicacion: C:\PortablePackages\%PACKAGE_NAME%.zip
    echo.
    echo INSTRUCCIONES PARA NUEVA PC:
    echo 1. Copia el archivo ZIP a la nueva PC
    echo 2. Extrae el contenido
    echo 3. Ejecuta START-LAB.bat
    echo.
    echo Abriendo carpeta de salida...
    explorer "C:\PortablePackages"
) else (
    echo [ERROR] No se pudo crear el paquete
)

echo.
pause
