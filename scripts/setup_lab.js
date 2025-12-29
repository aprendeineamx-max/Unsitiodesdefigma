const fs = require('fs');
const path = require('path');

const JSON_SOURCE = path.join(__dirname, '../temp_figma_v23/figma-complete-1766996975291.json');
const TARGET_DIR = path.join(__dirname, '../Figma_Lab');

function setupLab() {
    console.log('🏗️  Montando Figma Lab...');

    if (fs.existsSync(TARGET_DIR)) {
        console.log('🧹 Limpiando directorio anterior...');
        fs.rmSync(TARGET_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TARGET_DIR, { recursive: true });

    const files = JSON.parse(fs.readFileSync(JSON_SOURCE, 'utf8'));

    // Detectar prefijo común (ej: "Unsitio-Figma/") para eliminarlo
    const firstPath = files[0].path;
    const rootDir = firstPath.includes('/') ? firstPath.split('/')[0] : '';
    const hasCommonRoot = rootDir && files.every(f => f.path.startsWith(rootDir + '/'));

    console.log(`📂 Origen: ${files.length} archivos`);
    if (hasCommonRoot) console.log(`✂️  Removiendo prefijo raíz: "${rootDir}/"`);

    files.forEach(file => {
        let relativePath = file.path;
        if (hasCommonRoot) {
            relativePath = relativePath.substring(rootDir.length + 1);
        }

        const fullPath = path.join(TARGET_DIR, relativePath);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        if (file.isBinary) {
            fs.writeFileSync(fullPath, Buffer.from(file.content, 'base64'));
        } else {
            fs.writeFileSync(fullPath, file.content, 'utf8');
        }
    });

    console.log(`✅ Figma Lab listo en: ${TARGET_DIR}`);
    console.log('🚀 Siguiente paso: npm install && npm run dev');
}

setupLab();
