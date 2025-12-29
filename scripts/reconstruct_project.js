const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../extracted_project');
const TEMP_DIR = path.join(__dirname, '../temp_figma_v23');

// Archivos a procesar
const batchFiles = [
    'figma-zip-batch-1.json',
    'figma-zip-batch-2.json',
    'figma-zip-batch-3.json',
    'figma-zip-batch-4.json',
    'figma-zip-final.json'
];

function recreateProject() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    let totalFiles = 0;

    console.log('🚀 Iniciando reconstrucción del proyecto...\n');

    batchFiles.forEach(file => {
        const filePath = path.join(TEMP_DIR, file);
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️ Archivo no encontrado: ${file}`);
            return;
        }

        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`📦 Procesando ${file}: ${data.length} archivos`);

            data.forEach(item => {
                // Limpiar ruta (quitar prefijos si existen)
                const relativePath = item.path.replace(/^\//, '');
                const fullPath = path.join(OUTPUT_DIR, relativePath);
                const dirName = path.dirname(fullPath);

                // Crear directorios
                if (!fs.existsSync(dirName)) fs.mkdirSync(dirName, { recursive: true });

                // Escribir archivo
                // Si es base64 (isBinary=true), decodificar
                let content = item.content;
                if (item.isBinary) {
                    fs.writeFileSync(fullPath, Buffer.from(content, 'base64'));
                } else {
                    fs.writeFileSync(fullPath, content, 'utf8');
                }

                totalFiles++;
            });

        } catch (err) {
            console.error(`❌ Error procesando ${file}:`, err.message);
        }
    });

    console.log(`\n🎉 Reconstrucción completada!`);
    console.log(`📁 Total archivos restaurados: ${totalFiles}`);
    console.log(`📍 Ubicación: ${OUTPUT_DIR}`);

    // Verificar archivos críticos
    const critical = ['package.json', 'src/app/App.tsx', 'vite.config.ts'];
    console.log('\n🔍 Verificando archivos críticos:');
    critical.forEach(f => {
        const exists = fs.existsSync(path.join(OUTPUT_DIR, f));
        console.log(` - ${f}: ${exists ? '✅ OK' : '❌ FALTA'}`);
    });
}

recreateProject();
