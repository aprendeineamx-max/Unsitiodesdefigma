// ==UserScript==
// @name         Figma Complete File Extractor v2.0
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Extrae archivos faltantes simulando navegación en Figma
// @author       Antigravity Agent
// @match        https://www.figma.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        scanInterval: 1000, // Tiempo de espera tras clic
        saveInterval: 20,   // Guardar cada 20 archivos
        serverUrl: 'http://localhost:3001',
    };

    let state = {
        isExtracting: false,
        filesToExtract: [], // Lista de nombres de archivos
        currentIndex: 0,
        extractedData: [],
        missingFiles: [],
        currentBatch: 0,
        domSelectors: {
            fileTreeItem: '[data-testid^="file-tree-item"]', // Selector hipotético
            codeEditor: '.monaco-editor',                  // Selector hipotético
            codeContent: '.view-lines'                     // Selector hipotético
        }
    };

    // ==================== LOGGING ====================
    function log(type, message, data = null) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const icons = { info: '📘', success: '✅', error: '❌', warn: '⚠️', debug: '🔍' };
        const icon = icons[type] || '📝';
        console.log(`${icon} [${timestamp}] ${message}`, data || '');
        updateLogUI({ timestamp, type, message });
        updateStatus(`${icon} ${message}`);
    }

    // ==================== UI ====================
    function createUI() {
        if (document.getElementById('figma-extractor-v2')) return;

        const container = document.createElement('div');
        container.id = 'figma-extractor-v2';
        Object.assign(container.style, {
            position: 'fixed', top: '80px', right: '20px', width: '400px',
            backgroundColor: '#1e1e1e', color: '#fff', borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: '99999',
            fontFamily: 'sans-serif', fontSize: '12px'
        });

        container.innerHTML = `
            <div style="padding: 10px; background: #667eea; border-radius: 8px 8px 0 0; font-weight: bold;">
                ⚡ Figma Extractor v2.0 (DOM Scraper)
            </div>
            <div style="padding: 15px;">
                <div style="margin-bottom: 10px;">
                    <label>1. Cargar Lista de Faltantes (JSON):</label>
                    <input type="file" id="json-input" accept=".json" style="width: 100%; margin-top: 5px;">
                </div>
                
                <div id="status-box" style="background: #333; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                    Esperando lista...
                </div>

                <button id="btn-start" disabled style="width: 100%; padding: 10px; background: #4caf50; border: none; color: white; cursor: pointer;">
                    🚀 Iniciar Extracción Automática
                </button>
                
                <div style="margin-top: 10px; border-top: 1px solid #444; padding-top: 5px;">
                    Logs:
                    <div id="log-container" style="height: 150px; overflow-y: auto; background: #111; padding: 5px; font-family: monospace;"></div>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        document.getElementById('json-input').addEventListener('change', handleFileUpload);
        document.getElementById('btn-start').addEventListener('click', startExtraction);
    }

    function updateLogUI(entry) {
        const div = document.createElement('div');
        div.textContent = `[${entry.timestamp}] ${entry.message}`;
        div.style.color = entry.type === 'error' ? '#ff6b6b' : entry.type === 'success' ? '#51cf66' : '#ccc';
        const container = document.getElementById('log-container');
        if (container) {
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }
    }

    function updateStatus(msg) {
        const el = document.getElementById('status-box');
        if (el) el.textContent = msg;
    }

    // ==================== LOGICA PRINCIPAL ====================

    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                // Esperamos formato { missingFiles: [...] } o array directo
                state.filesToExtract = data.missingFiles || data;
                log('info', `Lista cargada: ${state.filesToExtract.length} archivos a extraer.`);
                document.getElementById('btn-start').disabled = false;
                document.getElementById('status-box').textContent = `Listo para extraer ${state.filesToExtract.length} archivos.`;
            } catch (err) {
                log('error', 'Error leyendo JSON: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    async function startExtraction() {
        if (state.isExtracting) return;
        state.isExtracting = true;
        state.currentIndex = 0;

        log('info', 'Iniciando secuencia de extracción...');

        processNextFile();
    }

    async function processNextFile() {
        if (state.currentIndex >= state.filesToExtract.length) {
            finishExtraction();
            return;
        }

        const fileName = state.filesToExtract[state.currentIndex];
        log('info', `[${state.currentIndex + 1}/${state.filesToExtract.length}] Buscando: ${fileName}`);

        try {
            // 1. Encontrar archivo en el árbol
            const fileElement = findFileInTree(fileName);

            if (fileElement) {
                // 2. Hacer click
                fileElement.click();

                // 3. Esperar a que cargue el editor
                await wait(1500); // Ajustable

                // 4. Extraer contenido
                const content = extractContentFromEditor();

                if (content) {
                    saveFile(fileName, content);
                    log('success', `Contenido extraído: ${fileName} (${content.length} chars)`);
                } else {
                    log('warn', `No se pudo leer contenido de: ${fileName}`);
                    state.missingFiles.push(fileName);
                }
            } else {
                log('warn', `No encontrado en árbol: ${fileName}`);
                state.missingFiles.push(fileName);
            }

        } catch (err) {
            log('error', `Error procesando ${fileName}: ${err.message}`);
            state.missingFiles.push(fileName);
        }

        state.currentIndex++;
        setTimeout(processNextFile, 500);
    }

    // ==================== HELPERS DOM ====================

    function findFileInTree(fileName) {
        // Estrategia: Buscar elementos que contengan el texto del nombre del archivo
        // Esto es genérico porque las clases de Figma son ofuscadas
        const allDivs = Array.from(document.querySelectorAll('div, span, p'));
        return allDivs.find(el =>
            el.textContent.trim() === fileName &&
            el.offsetParent !== null // Visible
        );
    }

    function extractContentFromEditor() {
        // Estrategia: Intentar copiar del Monaco Editor
        // Opción A: Buscar líneas de código en el DOM
        const lines = Array.from(document.querySelectorAll('.view-lines .view-line'));
        if (lines.length > 0) {
            return lines.map(l => l.innerText).join('\n');
        }

        // Opción B: Buscar cualquier bloque de código visible
        const codeBlock = document.querySelector('code, pre');
        if (codeBlock) return codeBlock.innerText;

        // Opción C: Fallback - Clipboard approach (requiere permisos, difícil en userscript sin interacción)
        // Por ahora confiamos en el DOM scraping del editor

        return null;
    }

    function saveFile(path, content) {
        state.extractedData.push({ path, content });

        // Guardar batch cada cierto tiempo
        if (state.extractedData.length >= CONFIG.saveInterval) {
            const batch = [...state.extractedData];
            state.extractedData = [];
            state.currentBatch++;
            downloadJSON(batch, `figma-extracted-batch-${state.currentBatch}.json`);
        }
    }

    function finishExtraction() {
        state.isExtracting = false;
        if (state.extractedData.length > 0) {
            downloadJSON(state.extractedData, 'figma-extracted-final.json');
        }

        log('success', '--- PROCESO COMPLETADO ---');
        log('info', `Fallidos: ${state.missingFiles.length}`);
        if (state.missingFiles.length > 0) {
            downloadJSON(state.missingFiles, 'missing-files-report.json');
        }
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // Init
    setTimeout(createUI, 2000);

})();
