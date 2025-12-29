const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3001;

// Configuración
app.use(cors({ origin: 'https://www.figma.com' }));
app.use(express.json({ limit: '50mb' }));

// Crear directorio de datos si no existe
const DATA_DIR = path.join(__dirname, 'extraction-data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'figma-content.db');

let db = null;

// Inicializar SQLite
async function initDatabase() {
    const SQL = await initSqlJs();

    // Cargar base de datos existente o crear nueva
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
        console.log('✅ Base de datos cargada desde archivo');
    } else {
        db = new SQL.Database();
        console.log('✅ Nueva base de datos creada');
    }

    // Crear tabla si no existe
    db.run(`
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT UNIQUE NOT NULL,
            content TEXT,
            is_binary INTEGER DEFAULT 0,
            mime_type TEXT,
            size INTEGER,
            hash TEXT,
            extracted_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_path ON files(path)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_extracted_at ON files(extracted_at)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_is_binary ON files(is_binary)`);

    console.log('✅ Esquema de base de datos inicializado');
}

// Guardar base de datos en disco
function saveDatabase() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// Auto-guardar cada 30 segundos
setInterval(saveDatabase, 30000);

// Endpoints

// POST /api/store - Almacenar archivo
app.post('/api/store', (req, res) => {
    try {
        const { path, content, isBinary, mimeType, size, hash } = req.body;

        if (!path) {
            return res.status(400).json({ error: 'Path es requerido' });
        }

        db.run(
            `INSERT OR REPLACE INTO files (path, content, is_binary, mime_type, size, hash, extracted_at)
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [path, content, isBinary ? 1 : 0, mimeType, size, hash]
        );

        saveDatabase(); // Guardar inmediatamente

        res.json({
            success: true,
            message: `Archivo ${path} almacenado correctamente`
        });
    } catch (error) {
        console.error('Error al almacenar archivo:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/store-batch - Almacenar múltiples archivos
app.post('/api/store-batch', (req, res) => {
    try {
        const { files } = req.body;

        if (!Array.isArray(files)) {
            return res.status(400).json({ error: 'Se esperaba un array de archivos' });
        }

        db.run('BEGIN TRANSACTION');

        for (const file of files) {
            db.run(
                `INSERT OR REPLACE INTO files (path, content, is_binary, mime_type, size, hash, extracted_at)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
                [file.path, file.content, file.isBinary ? 1 : 0, file.mimeType, file.size, file.hash]
            );
        }

        db.run('COMMIT');
        saveDatabase();

        res.json({
            success: true,
            message: `${files.length} archivos almacenados correctamente`
        });
    } catch (error) {
        db.run('ROLLBACK');
        console.error('Error al almacenar batch:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/stats - Obtener estadísticas
app.get('/api/stats', (req, res) => {
    try {
        const result = db.exec(`
            SELECT 
                COUNT(*) as total_files,
                SUM(CASE WHEN is_binary = 1 THEN 1 ELSE 0 END) as binary_files,
                SUM(CASE WHEN is_binary = 0 THEN 1 ELSE 0 END) as text_files,
                SUM(size) as total_size,
                MAX(extracted_at) as last_extraction
            FROM files
        `);

        if (result.length > 0 && result[0].values.length > 0) {
            const row = result[0].values[0];
            res.json({
                total_files: row[0],
                binary_files: row[1],
                text_files: row[2],
                total_size: row[3],
                last_extraction: row[4]
            });
        } else {
            res.json({
                total_files: 0,
                binary_files: 0,
                text_files: 0,
                total_size: 0,
                last_extraction: null
            });
        }
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/file/:path - Obtener archivo específico
app.get('/api/file/*', (req, res) => {
    try {
        const filePath = req.params[0];
        const result = db.exec('SELECT * FROM files WHERE path = ?', [filePath]);

        if (result.length === 0 || result[0].values.length === 0) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        const columns = result[0].columns;
        const values = result[0].values[0];
        const file = {};
        columns.forEach((col, i) => {
            file[col] = values[i];
        });

        res.json(file);
    } catch (error) {
        console.error('Error al obtener archivo:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/export - Exportar toda la base de datos como JSON
app.get('/api/export', (req, res) => {
    try {
        const result = db.exec('SELECT * FROM files ORDER BY path');

        if (result.length === 0) {
            return res.json({ metadata: { exportedAt: new Date().toISOString(), totalFiles: 0 }, files: {} });
        }

        const columns = result[0].columns;
        const rows = result[0].values;

        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                totalFiles: rows.length
            },
            files: {}
        };

        rows.forEach(row => {
            const file = {};
            columns.forEach((col, i) => {
                file[col] = row[i];
            });

            exportData.files[file.path] = {
                content: file.content,
                isBinary: Boolean(file.is_binary),
                mimeType: file.mime_type,
                size: file.size,
                hash: file.hash,
                extractedAt: file.extracted_at
            };
        });

        res.json(exportData);
    } catch (error) {
        console.error('Error al exportar:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /health - Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════╗
║   🚀 Figma Extraction Server                          ║
║   📡 Puerto: ${PORT}                                      ║
║   💾 Base de datos: figma-content.db                  ║
║   🌐 CORS habilitado para: https://www.figma.com     ║
╚════════════════════════════════════════════════════════╝

Endpoints disponibles:
  POST   /api/store          - Almacenar archivo individual
  POST   /api/store-batch    - Almacenar múltiples archivos
  GET    /api/stats          - Obtener estadísticas
  GET    /api/file/:path     - Obtener archivo específico
  GET    /api/export         - Exportar toda la BD como JSON
  GET    /health             - Health check

Presiona Ctrl+C para detener el servidor.
        `);
    });
}).catch(err => {
    console.error('❌ Error al inicializar base de datos:', err);
    process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    saveDatabase();
    console.log('✅ Base de datos guardada');
    process.exit(0);
});

process.on('exit', () => {
    saveDatabase();
});
