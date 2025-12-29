const fs = require('fs');
const path = require('path');

const MAP_FILE = path.join(__dirname, '../temp_figma_v23/Figma_FileSystem_2025-12-29T06-42-31-999Z.md');
const ZIP_CONTENT_FILE = path.join(__dirname, '../temp_figma_v23/figma-content-complete-1766991834717.json');
const OUTPUT_FILE = path.join(__dirname, '../temp_figma_v23/clean_file_map.json');

function parseMarkdownMap(content) {
    const lines = content.split('\n');
    const files = new Set();
    const structure = [];

    // Stack para mantener el contexto de carpetas
    // [ { indent: 0, path: '' } ]
    const stack = [{ indent: -1, path: '' }];

    lines.forEach(line => {
        // Ignorar encabezados y líneas vacías
        if (!line.trim().startsWith('-') || !line.includes('📄')) return;

        // Calcular indentación para saber profundidad
        const indent = line.search('-');
        const name = line.split('📄')[1].trim();

        // Encontrar el padre correcto basado en indentación
        // (Nota: esta lógica es simple, para un mapa plano quizás solo necesitamos el nombre si es único)
        // Pero dado el formato duplicado, mejor extraemos solo los nombres de archivos únicos por ahora
        // ya que la estructura de carpetas se infiere

        // Extracción simple basada en el nombre del archivo
        // Asumimos que los nombres son únicos o suficientemente descriptivos
        // Si necesitamos rutas completas, tendríamos que parsear mejor el árbol

        // Revisando el formato del archivo:
        // - 📁 src
        //   - 📁 app
        //     - 📄 App.tsx

        // Mejor enfoque: Extraer solo las líneas de archivos y limpiar duplicados
        files.add(name);
    });

    return Array.from(files).sort();
}

function analyzeCoverage() {
    try {
        // 1. Leer el mapa sucio
        console.log('📖 Leyendo mapa original...');
        const mapContent = fs.readFileSync(MAP_FILE, 'utf8');
        const mapFiles = parseMarkdownMap(mapContent);
        console.log(`✅ Mapa analizado: ${mapFiles.length} archivos únicos encontrados.`);

        // 2. Leer archivos ya extraídos (ZIP)
        console.log('📦 Leyendo contenido del ZIP...');
        let zipFiles = [];
        if (fs.existsSync(ZIP_CONTENT_FILE)) {
            const zipData = JSON.parse(fs.readFileSync(ZIP_CONTENT_FILE, 'utf8'));
            zipFiles = zipData.map(f => path.basename(f.path)); // Usar basename para comparar
        }
        console.log(`✅ ZIP contiene: ${zipFiles.length} archivos.`);

        // 3. Comparar
        const missingFiles = mapFiles.filter(f => !zipFiles.includes(f));

        console.log('\n📊 REPORTE DE ESTADO REAL:');
        console.log('---------------------------');
        console.log(`📁 Total Archivos en Proyecto: ${mapFiles.length}`);
        console.log(`💾 Archivos que YA tenías (ZIP): ${zipFiles.length}`);
        console.log(`🚨 Archivos que TE FALTAN:     ${missingFiles.length}`);

        console.log('\n🔍 Archivos faltantes críticos (ejemplos):');
        missingFiles.filter(f => f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('json')).slice(0, 10).forEach(f => console.log(` - ${f}`));

        // 4. Guardar lista limpia para el extractor
        const outputData = {
            totalUnique: mapFiles.length,
            missingCount: missingFiles.length,
            missingFiles: missingFiles,
            allFiles: mapFiles
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
        console.log(`\n✅ Lista limpia guardada en: ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

analyzeCoverage();
