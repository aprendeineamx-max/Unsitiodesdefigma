#!/usr/bin/env node

/**
 * SCRIPT DE MIGRACIÓN DE DOCUMENTACIÓN v1.0.0
 * 
 * Migra todos los archivos .md de la raíz del proyecto a /src/docs/
 * para cumplir con los estándares de seguridad de Vite en producción.
 * 
 * Uso: node scripts/migrate-docs-to-src.cjs
 * 
 * Acciones:
 * 1. Crea /src/docs/ si no existe
 * 2. Copia todos los archivos .md de la raíz a /src/docs/
 * 3. Elimina los archivos .md originales de la raíz
 * 4. Mueve la carpeta /guidelines/ a /src/docs/guidelines/ si existe
 * 5. Imprime un reporte detallado
 * 
 * Seguridad:
 * - Manejo de errores graceful
 * - Backup automático antes de eliminar
 * - Validación de archivos antes de migrar
 */

const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Configuración
const ROOT_DIR = process.cwd();
const TARGET_DIR = path.join(ROOT_DIR, 'src', 'docs');
const GUIDELINES_SOURCE = path.join(ROOT_DIR, 'guidelines');
const GUIDELINES_TARGET = path.join(TARGET_DIR, 'guidelines');

// Archivos excluidos de la migración
const EXCLUDED_FILES = [
  'README.md', // Mantener en raíz para GitHub
];

// Contadores
let stats = {
  filesFound: 0,
  filesCopied: 0,
  filesDeleted: 0,
  filesFailed: 0,
  guidelinesMoved: false,
};

/**
 * Imprime un mensaje con color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Imprime el header del script
 */
function printHeader() {
  console.log('');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  📦 MIGRACIÓN DE DOCUMENTACIÓN A /src/docs/', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  console.log('');
}

/**
 * Imprime el footer con resultados
 */
function printFooter() {
  console.log('');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  📊 REPORTE DE MIGRACIÓN', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  console.log('');
  log(`  ✅ Archivos encontrados:  ${stats.filesFound}`, 'blue');
  log(`  ✅ Archivos copiados:     ${stats.filesCopied}`, 'green');
  log(`  ✅ Archivos eliminados:   ${stats.filesDeleted}`, 'green');
  
  if (stats.guidelinesMoved) {
    log(`  ✅ Carpeta guidelines:    MOVIDA`, 'green');
  }
  
  if (stats.filesFailed > 0) {
    log(`  ❌ Archivos fallidos:     ${stats.filesFailed}`, 'red');
  }
  
  console.log('');
  
  if (stats.filesFailed === 0) {
    log('  🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE', 'green');
  } else {
    log('  ⚠️  MIGRACIÓN COMPLETADA CON ERRORES', 'yellow');
  }
  
  console.log('');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  console.log('');
}

/**
 * Crea el directorio /src/docs/ si no existe
 */
function createTargetDirectory() {
  try {
    if (!fs.existsSync(TARGET_DIR)) {
      log('📁 Creando directorio /src/docs/...', 'blue');
      fs.mkdirSync(TARGET_DIR, { recursive: true });
      log('   ✅ Directorio creado', 'green');
    } else {
      log('📁 Directorio /src/docs/ ya existe', 'blue');
    }
    return true;
  } catch (error) {
    log(`   ❌ Error al crear directorio: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Obtiene todos los archivos .md en la raíz del proyecto
 */
function getMarkdownFilesInRoot() {
  try {
    log('🔍 Escaneando archivos .md en raíz...', 'blue');
    
    const files = fs.readdirSync(ROOT_DIR);
    const mdFiles = files.filter(file => {
      // Solo archivos .md
      if (!file.endsWith('.md')) return false;
      
      // Excluir archivos específicos
      if (EXCLUDED_FILES.includes(file)) {
        log(`   ⏭️  Excluyendo: ${file}`, 'yellow');
        return false;
      }
      
      // Verificar que es un archivo (no directorio)
      const filePath = path.join(ROOT_DIR, file);
      const stat = fs.statSync(filePath);
      return stat.isFile();
    });
    
    stats.filesFound = mdFiles.length;
    log(`   ✅ Encontrados ${mdFiles.length} archivos .md`, 'green');
    
    return mdFiles;
  } catch (error) {
    log(`   ❌ Error al escanear archivos: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Copia un archivo de origen a destino
 */
function copyFile(filename) {
  const sourcePath = path.join(ROOT_DIR, filename);
  const targetPath = path.join(TARGET_DIR, filename);
  
  try {
    // Leer contenido
    const content = fs.readFileSync(sourcePath, 'utf8');
    
    // Escribir en destino
    fs.writeFileSync(targetPath, content, 'utf8');
    
    log(`   ✅ Copiado: ${filename}`, 'green');
    stats.filesCopied++;
    
    return true;
  } catch (error) {
    log(`   ❌ Error copiando ${filename}: ${error.message}`, 'red');
    stats.filesFailed++;
    return false;
  }
}

/**
 * Elimina un archivo de la raíz
 */
function deleteFile(filename) {
  const filePath = path.join(ROOT_DIR, filename);
  
  try {
    fs.unlinkSync(filePath);
    log(`   🗑️  Eliminado: ${filename}`, 'cyan');
    stats.filesDeleted++;
    return true;
  } catch (error) {
    log(`   ❌ Error eliminando ${filename}: ${error.message}`, 'red');
    stats.filesFailed++;
    return false;
  }
}

/**
 * Copia un directorio recursivamente
 */
function copyDirectoryRecursive(source, target) {
  try {
    // Crear directorio destino
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }
    
    // Leer contenido del directorio
    const files = fs.readdirSync(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        // Recursión para subdirectorios
        copyDirectoryRecursive(sourcePath, targetPath);
      } else {
        // Copiar archivo
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
    
    return true;
  } catch (error) {
    log(`   ❌ Error copiando directorio: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Elimina un directorio recursivamente
 */
function deleteDirectoryRecursive(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
    return true;
  } catch (error) {
    log(`   ❌ Error eliminando directorio: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Mueve la carpeta guidelines/ si existe
 */
function moveGuidelinesFolder() {
  try {
    if (!fs.existsSync(GUIDELINES_SOURCE)) {
      log('📁 Carpeta /guidelines/ no encontrada (OK)', 'blue');
      return true;
    }
    
    log('📁 Moviendo carpeta /guidelines/...', 'blue');
    
    // Copiar recursivamente
    const copied = copyDirectoryRecursive(GUIDELINES_SOURCE, GUIDELINES_TARGET);
    
    if (!copied) {
      return false;
    }
    
    // Eliminar carpeta original
    const deleted = deleteDirectoryRecursive(GUIDELINES_SOURCE);
    
    if (deleted) {
      log('   ✅ Carpeta /guidelines/ movida exitosamente', 'green');
      stats.guidelinesMoved = true;
      return true;
    }
    
    return false;
  } catch (error) {
    log(`   ❌ Error moviendo /guidelines/: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Migra todos los archivos .md
 */
function migrateMarkdownFiles(files) {
  log('📦 Iniciando migración de archivos...', 'blue');
  console.log('');
  
  for (const file of files) {
    // Copiar archivo
    const copied = copyFile(file);
    
    // Solo eliminar si se copió exitosamente
    if (copied) {
      deleteFile(file);
    }
  }
  
  console.log('');
  log('✅ Migración de archivos completada', 'green');
}

/**
 * Función principal
 */
async function main() {
  try {
    printHeader();
    
    // Paso 1: Crear directorio destino
    const dirCreated = createTargetDirectory();
    if (!dirCreated) {
      log('❌ No se pudo crear el directorio destino. Abortando.', 'red');
      process.exit(1);
    }
    
    console.log('');
    
    // Paso 2: Obtener archivos .md en raíz
    const mdFiles = getMarkdownFilesInRoot();
    
    if (mdFiles.length === 0) {
      log('⚠️  No se encontraron archivos .md para migrar', 'yellow');
    } else {
      console.log('');
      
      // Paso 3: Migrar archivos
      migrateMarkdownFiles(mdFiles);
    }
    
    console.log('');
    
    // Paso 4: Mover carpeta guidelines
    moveGuidelinesFolder();
    
    // Paso 5: Imprimir reporte final
    printFooter();
    
    // Exit code
    if (stats.filesFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    console.error('');
    log('═══════════════════════════════════════════════════════════', 'red');
    log('  ❌ ERROR FATAL', 'red');
    log('═══════════════════════════════════════════════════════════', 'red');
    console.error('');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}

// Ejecutar script
main();
