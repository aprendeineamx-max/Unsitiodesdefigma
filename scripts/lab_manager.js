const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const AdmZip = require('adm-zip');

const BASE_LAB_DIR = path.join(__dirname, '../Figma_Labs');
const TEMP_DIR = path.join(__dirname, '../temp_lab_processing');

// Asegurar directorios base
if (!fs.existsSync(BASE_LAB_DIR)) fs.mkdirSync(BASE_LAB_DIR, { recursive: true });

const action = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

function log(msg, type = 'info') {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', task: '🏗️' };
    console.log(`${icons[type] || ''} ${msg}`);
}

async function importVersion(zipPath, versionName) {
    log(`Iniciando importación de versión: ${versionName}`, 'task');

    // 1. Validar ZIP
    if (!fs.existsSync(zipPath)) {
        log(`No se encuentra el archivo ZIP: ${zipPath}`, 'error');
        return;
    }

    const targetDir = path.join(BASE_LAB_DIR, versionName);
    if (fs.existsSync(targetDir)) {
        log(`La versión ${versionName} ya existe. Eliminando para re-importar...`, 'info');
        fs.rmSync(targetDir, { recursive: true, force: true });
    }

    // 2. Extraer a Temp
    log('Descomprimiendo ZIP...', 'info');
    if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    try {
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(TEMP_DIR, true);

        // 3. Normalizar estructura (Eliminar carpeta raíz si existe)
        // A veces los zips vienen como "Carpeta/contenido", queremos "contenido"
        const files = fs.readdirSync(TEMP_DIR);
        let sourceDir = TEMP_DIR;

        if (files.length === 1 && fs.lstatSync(path.join(TEMP_DIR, files[0])).isDirectory()) {
            log(`Detectada carpeta raíz contenedora: ${files[0]}`, 'info');
            sourceDir = path.join(TEMP_DIR, files[0]);
        }

        // 4. Mover a Destino Final
        log(`Instalando en ${targetDir}...`, 'task');
        fs.cpSync(sourceDir, targetDir, { recursive: true });

        // 5. Instalar Dependencias
        log('Instalando dependencias (npm install)... esto puede tardar.', 'task');
        execSync('npm install', { cwd: targetDir, stdio: 'inherit' });

        log(`Versión ${versionName} importada y lista.`, 'success');

        // Limpieza
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });

    } catch (err) {
        log(`Error crítico: ${err.message}`, 'error');
        if (err.stack) console.error(err.stack);
    }
}

function listVersions() {
    log('Versiones disponibles en Figma_Labs:', 'info');
    if (!fs.existsSync(BASE_LAB_DIR)) {
        console.log('  (Ninguna)');
        return;
    }
    const versions = fs.readdirSync(BASE_LAB_DIR).filter(f => fs.lstatSync(path.join(BASE_LAB_DIR, f)).isDirectory());
    versions.forEach(v => {
        console.log(`  - 📦 ${v}`);
    });
}

function runVersion(versionName, port = 5173) {
    const targetDir = path.join(BASE_LAB_DIR, versionName);
    if (!fs.existsSync(targetDir)) {
        log(`Versión ${versionName} no encontrada.`, 'error');
        return;
    }

    log(`Levantando ${versionName} en puerto ${port}...`, 'success');

    // En Windows, npm run dev spawns a shell
    const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const args = ['run', 'dev', '--', '--port', port.toString()];

    const child = spawn(cmd, args, { cwd: targetDir, stdio: 'inherit' });

    child.on('error', (err) => log(`Error al iniciar: ${err.message}`, 'error'));
}

// Router de comandos
switch (action) {
    case 'import':
        if (!arg1 || !arg2) {
            console.log('Uso: node lab_manager.js import <ruta_zip> <nombre_version>');
        } else {
            importVersion(arg1, arg2);
        }
        break;
    case 'list':
        listVersions();
        break;
    case 'run':
        if (!arg1) {
            console.log('Uso: node lab_manager.js run <nombre_version> [puerto]');
        } else {
            runVersion(arg1, arg2 || 5173);
        }
        break;
    default:
        console.log(`
🤖 Figma Lab Manager
-------------------
Comandos:
  import <zip> <version>   -> Importa un nuevo ZIP como una versión aislada
  list                     -> Lista versiones instaladas
  run <version> [port]     -> Ejecuta una versión en un puerto específico
        `);
}
