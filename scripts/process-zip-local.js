const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Configuración
const ZIP_PATH = process.argv[2] || path.join(__dirname, '../temp_figma_v23/Unsitiodesdefigma.zip');
const OUTPUT_DIR = path.join(__dirname, 'extracted-content');
const SERVER_URL = 'http://localhost:3001';

console.log('🚀 Iniciando extracción de ZIP...');
console.log(`📦 Archivo: ${ZIP_PATH}`);

if (!fs.existsSync(ZIP_PATH)) {
    console.error(`❌ No se encontró el archivo ZIP: ${ZIP_PATH}`);
    console.log('\n💡 Uso: node process-zip-local.js <ruta-al-zip>');
    process.exit(1);
}

// Crear directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function processZip() {
    try {
        console.log('📂 Leyendo ZIP...');
        const zip = new AdmZip(ZIP_PATH);
        const zipEntries = zip.getEntries();

        const files = zipEntries.filter(entry => !entry.isDirectory);
        console.log(`✅ ${files.length} archivos encontrados`);

        const extractedData = [];
        let processedCount = 0;

        for (const entry of files) {
            const filename = entry.entryName;
            const isBinary = /\.(png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)$/i.test(filename);

            let content;
            if (isBinary) {
                // Binarios en Base64
                const buffer = entry.getData();
                content = buffer.toString('base64');
            } else {
                // Texto plano
                content = entry.getData().toString('utf8');
            }

            const fileData = {
                path: filename,
                content: content,
                isBinary: isBinary,
                mimeType: getMimeType(filename),
                size: content.length,
                hash: simpleHash(content),
                extractedAt: new Date().toISOString()
            };

            extractedData.push(fileData);
            processedCount++;

            if (processedCount % 50 === 0) {
                console.log(`📊 Progreso: ${processedCount} / ${files.length}`);
            }

            // Guardar en batches de 100
            if (extractedData.length >= 100) {
                await saveBatch(extractedData.splice(0, 100), Math.floor(processedCount / 100));
            }
        }

        // Guardar restantes
        if (extractedData.length > 0) {
            await saveBatch(extractedData, 'final');
        }

        console.log(`\n✅ Procesamiento completado: ${processedCount} archivos`);
        console.log(`📁 Archivos JSON guardados en: ${OUTPUT_DIR}`);

        // Exportar todo en un solo archivo
        const allData = files.map(entry => {
            const filename = entry.entryName;
            const isBinary = /\.(png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)$/i.test(filename);
            const content = isBinary ? entry.getData().toString('base64') : entry.getData().toString('utf8');

            return {
                path: filename,
                content,
                isBinary,
                mimeType: getMimeType(filename),
                size: content.length,
                extractedAt: new Date().toISOString()
            };
        });

        const completePath = path.join(OUTPUT_DIR, `figma-complete-${Date.now()}.json`);
        fs.writeFileSync(completePath, JSON.stringify(allData, null, 2));
        console.log(`💾 Archivo completo: ${completePath}`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

async function saveBatch(batch, batchNum) {
    // Guardar JSON local
    const filename = path.join(OUTPUT_DIR, `batch-${batchNum}.json`);
    fs.writeFileSync(filename, JSON.stringify(batch, null, 2));
    console.log(`💾 Guardado: batch-${batchNum}.json`);

    // Intentar enviar al servidor SQLite
    try {
        const response = await fetch(`${SERVER_URL}/api/store-batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: batch })
        });

        if (response.ok) {
            console.log(`✅ Batch ${batchNum} enviado a SQLite`);
        }
    } catch (error) {
        console.warn(`⚠️ No se pudo enviar al servidor: ${error.message}`);
    }
}

function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.tsx': 'text/typescript',
        '.ts': 'text/typescript',
        '.jsx': 'text/javascript',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.md': 'text/markdown',
        '.json': 'application/json',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Ejecutar
processZip();
