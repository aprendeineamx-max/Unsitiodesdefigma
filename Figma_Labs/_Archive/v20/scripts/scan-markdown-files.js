#!/usr/bin/env node

/**
 * MARKDOWN FILES SCANNER - AUTO-DISCOVERY SYSTEM
 * Build-time script para escanear todos los archivos .md del proyecto
 * Genera un manifest JSON que será usado por el auto-discovery service
 * 
 * IMPORTANTE: Este script se ejecuta automáticamente en cada build (prebuild)
 * Basado en: /DOCUMENTATION_CENTER_BEST_PRACTICES.md y /ROADMAP_DOCUMENTATION_CENTER.md
 */

const fs = require('fs');
const path = require('path');

// Directorios a ignorar
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.vite',
  'coverage',
];

// Extensiones a buscar
const MARKDOWN_EXTENSIONS = ['.md', '.markdown'];

// Documentos de control que deben existir
const CONTROL_DOCUMENTS = [
  '/DOCUMENTATION_CENTER_BEST_PRACTICES.md',
  '/ROADMAP_DOCUMENTATION_CENTER.md',
];

/**
 * Verificar si un directorio debe ser ignorado
 */
function shouldIgnoreDir(dirName) {
  return IGNORE_DIRS.some(ignore => dirName.includes(ignore));
}

/**
 * Verificar si un archivo es markdown
 */
function isMarkdownFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return MARKDOWN_EXTENSIONS.includes(ext);
}

/**
 * Escanear directorio recursivamente
 */
function scanDirectory(dir, baseDir = dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldIgnoreDir(item)) {
          // Recursión en subdirectorios
          files.push(...scanDirectory(fullPath, baseDir));
        }
      } else if (stat.isFile() && isMarkdownFile(item)) {
        // Archivo markdown encontrado
        const relativePath = path.relative(baseDir, fullPath);
        const webPath = '/' + relativePath.replace(/\\/g, '/');
        
        files.push({
          path: webPath,
          filename: item,
          size: stat.size,
          modified: stat.mtime.toISOString(),
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Verificar que los documentos de control existan
 */
function verifyControlDocuments(files) {
  const filePaths = files.map(f => f.path);
  const missing = [];
  
  for (const controlDoc of CONTROL_DOCUMENTS) {
    if (!filePaths.includes(controlDoc)) {
      missing.push(controlDoc);
    }
  }
  
  if (missing.length > 0) {
    console.warn('\n⚠️  ADVERTENCIA: Documentos de control faltantes:');
    missing.forEach(doc => console.warn(`   - ${doc}`));
    console.warn('   Estos documentos son críticos para el sistema de auto-discovery.\n');
  }
  
  return missing.length === 0;
}

/**
 * Main
 */
function main() {
  console.log('🔍 Escaneando archivos Markdown...\n');
  
  const projectRoot = path.resolve(__dirname, '..');
  const files = scanDirectory(projectRoot);
  
  // Ordenar por path
  files.sort((a, b) => a.path.localeCompare(b.path));
  
  // Verificar documentos de control
  const controlDocsOk = verifyControlDocuments(files);
  
  // Estadísticas
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
  
  // Generar manifest
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    totalSize: totalSize,
    controlDocumentsValid: controlDocsOk,
    files: files.map(f => f.path),
    details: files,
  };
  
  // Guardar manifest
  const outputPath = path.join(projectRoot, 'src', 'app', 'data', 'markdown-files.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  
  // Reporte
  console.log('✅ Scan completado!\n');
  console.log(`📊 Estadísticas:`);
  console.log(`   Total archivos: ${files.length}`);
  console.log(`   Tamaño total: ${sizeInMB}MB`);
  console.log(`   Documentos de control: ${controlDocsOk ? '✅ OK' : '⚠️  FALTANTES'}`);
  console.log(`   Manifest guardado en: ${path.relative(projectRoot, outputPath)}`);
  console.log('\n📝 Archivos encontrados:');
  
  // Agrupar por categoría para mejor visualización
  const byCategory = {};
  files.forEach(file => {
    const name = file.filename.toUpperCase();
    let category = 'Otros';
    
    if (name.startsWith('ROADMAP')) category = 'Roadmaps';
    else if (name.includes('_GUIDE') || name.includes('GUIA')) category = 'Guías';
    else if (name.includes('DOCUMENTATION') || name.includes('_API')) category = 'API & Docs';
    else if (name.includes('TUTORIAL') || name.includes('INSTRUCCIONES')) category = 'Tutoriales';
    else if (name.includes('BEST_PRACTICES') || name.includes('BEST-PRACTICES')) category = 'Best Practices';
    
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push(file);
  });
  
  Object.entries(byCategory).forEach(([category, docs]) => {
    console.log(`\n   ${category} (${docs.length}):`);
    docs.forEach(file => {
      const sizeKB = (file.size / 1024).toFixed(1);
      console.log(`      • ${file.path} (${sizeKB}KB)`);
    });
  });
  
  console.log('\n🎉 ¡Listo! El manifest ha sido generado.');
  console.log('💡 Tip: Este script se ejecuta automáticamente en cada build (npm run prebuild)');
  
  // Exit code basado en validación de documentos de control
  if (!controlDocsOk) {
    console.error('\n❌ ADVERTENCIA: Algunos documentos de control están faltantes.');
    console.error('   El sistema funcionará pero algunos documentos críticos no estarán disponibles.');
    // No hacemos exit(1) para no romper el build, solo advertencia
  }
}

main();