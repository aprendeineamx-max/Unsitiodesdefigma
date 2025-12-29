// ==UserScript==
// @name         Figma ZIP Content Extractor v3.2 (Debug Mode)
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Extractor con sistema de logging completo para debugging
// @author       Antigravity Agent
// @match        https://www.figma.com/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        serverUrl: 'http://localhost:3001',
        useJSON: true,
        useIndexedDB: true,
        useSQLite: true,
        batchSize: 100,
        autoIntercept: true
    };

    let state = {
        isProcessing: false,
        totalFiles: 0,
        processedFiles: 0,
        extractedData: [],
        startTime: null,
        db: null,
        uiMinimized: false,
        uiPosition: { x: null, y: null },
        logs: [] // Nuevo: almacenar logs
    };

    // ==================== SISTEMA DE LOGGING ====================

    function log(type, message, data = null) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const logEntry = {
            timestamp,
            type, // 'info', 'success', 'error', 'warn'
            message,
            data
        };

        state.logs.push(logEntry);

        // Limitar a últimos 100 logs
        if (state.logs.length > 100) {
            state.logs.shift();
        }

        // Iconos por tipo
        const icons = {
            info: '📘',
            success: '✅',
            error: '❌',
            warn: '⚠️',
            debug: '🔍'
        };

        const icon = icons[type] || '📝';
        const consoleMsg = `${icon} [${timestamp}] ${message}`;

        // Console log
        if (type === 'error') {
            console.error(consoleMsg, data || '');
        } else if (type === 'warn') {
            console.warn(consoleMsg, data || '');
        } else {
            console.log(consoleMsg, data || '');
        }

        // Actualizar UI de logs
        updateLogUI(logEntry);

        // También actualizar el status principal
        updateStatus(`${icon} ${message}`);
    }

    function updateLogUI(logEntry) {
        const logContainer = document.getElementById('zip-log-container');
        if (!logContainer) return;

        const logLine = document.createElement('div');
        logLine.style.cssText = `
            font-size: 10px;
            color: ${logEntry.type === 'error' ? '#ef4444' : logEntry.type === 'warn' ? '#f59e0b' : '#888'};
            padding: 2px 0;
            font-family: 'Consolas', monospace;
        `;
        logLine.textContent = `[${logEntry.timestamp}] ${logEntry.message}`;

        logContainer.appendChild(logLine);

        // Auto-scroll al final
        logContainer.scrollTop = logContainer.scrollHeight;

        // Limitar líneas visibles
        while (logContainer.children.length > 20) {
            logContainer.removeChild(logContainer.firstChild);
        }
    }

    // ==================== INTERCEPTOR AUTOMÁTICO ====================

    if (CONFIG.autoIntercept) {
        log('info', 'Iniciando interceptor automático...');

        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url, ...args) {
            this._url = url;
            return originalOpen.apply(this, [method, url, ...args]);
        };

        XMLHttpRequest.prototype.send = function (...args) {
            this.addEventListener('load', function () {
                if (this._url && this._url.includes('download') && this.response instanceof Blob) {
                    if (this.response.type === 'application/zip' || this._url.includes('.zip')) {
                        log('success', 'ZIP detectado vía XMLHttpRequest!', this._url);
                        processZipFile(this.response);
                    }
                }
            });
            return originalSend.apply(this, args);
        };

        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
            const response = await originalFetch.apply(this, args);
            const clonedResponse = response.clone();

            try {
                const contentType = clonedResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/zip')) {
                    const blob = await clonedResponse.blob();
                    log('success', 'ZIP detectado vía fetch!');
                    processZipFile(blob);
                }
            } catch (e) {
                // Ignorar
            }

            return response;
        };

        log('success', 'Interceptor automático activado');
    }

    // ==================== INDEXEDDB ====================

    async function initIndexedDB() {
        log('info', 'Inicializando IndexedDB...');
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FigmaContentDB', 1);
            request.onerror = () => {
                log('error', 'Error abriendo IndexedDB', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                state.db = request.result;
                log('success', 'IndexedDB inicializada');
                resolve(state.db);
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('files')) {
                    const store = db.createObjectStore('files', { keyPath: 'path' });
                    store.createIndex('extractedAt', 'extractedAt', { unique: false });
                    log('info', 'Esquema de IndexedDB creado');
                }
            };
        });
    }

    async function saveBatchToIndexedDB(files) {
        if (!CONFIG.useIndexedDB || !state.db) return;
        log('debug', `Guardando ${files.length} archivos en IndexedDB...`);
        return new Promise((resolve, reject) => {
            const transaction = state.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            files.forEach(file => store.put(file));
            transaction.oncomplete = () => {
                log('success', `${files.length} archivos guardados en IndexedDB`);
                resolve();
            };
            transaction.onerror = () => {
                log('error', 'Error guardando en IndexedDB', transaction.error);
                reject(transaction.error);
            };
        });
    }

    // ==================== SQLITE ====================

    async function saveBatchToSQLite(files) {
        if (!CONFIG.useSQLite) return;
        log('debug', `Enviando ${files.length} archivos a SQLite...`);
        try {
            const response = await fetch(`${CONFIG.serverUrl}/api/store-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files })
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            log('success', `${files.length} archivos guardados en SQLite`);
        } catch (error) {
            log('warn', 'SQLite no disponible', error.message);
        }
    }

    // ==================== UTILIDADES ====================

    function calculateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    function detectMimeType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            'tsx': 'text/typescript', 'ts': 'text/typescript',
            'jsx': 'text/javascript', 'js': 'text/javascript',
            'cjs': 'text/javascript', 'mjs': 'text/javascript',
            'css': 'text/css', 'md': 'text/markdown',
            'json': 'application/json', 'html': 'text/html',
            'svg': 'image/svg+xml', 'png': 'image/png',
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'gif': 'image/gif', 'webp': 'image/webp',
            'sql': 'application/sql', 'txt': 'text/plain'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    function isBinaryFile(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'woff', 'woff2', 'ttf'].includes(ext);
    }

    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
    }

    function downloadJSON(data, filename) {
        log('info', `Descargando ${filename}...`);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        log('success', `${filename} descargado`);
    }

    // ==================== PROCESAMIENTO ZIP ====================

    async function processZipFile(zipFile) {
        if (state.isProcessing) {
            log('warn', 'Ya hay un procesamiento en curso');
            return;
        }

        log('info', `Iniciando procesamiento de ZIP (${(zipFile.size / 1024 / 1024).toFixed(2)} MB)`);
        state.isProcessing = true;
        state.startTime = Date.now();
        state.processedFiles = 0;
        state.extractedData = [];

        updateUI();

        try {
            // Verificar JSZip
            if (typeof JSZip === 'undefined') {
                throw new Error('JSZip no está cargado. Verifica la conexión a CDN.');
            }
            log('success', 'JSZip disponible');

            if (CONFIG.useIndexedDB) {
                await initIndexedDB();
            }

            log('info', 'Descomprimiendo ZIP...');
            const zip = await JSZip.loadAsync(zipFile);
            const files = Object.keys(zip.files).filter(name => !zip.files[name].dir);
            state.totalFiles = files.length;

            log('success', `ZIP descomprimido: ${state.totalFiles} archivos encontrados`);
            updateUI();

            const batchPromises = [];

            for (let i = 0; i < files.length; i++) {
                const filename = files[i];
                const file = zip.files[filename];
                const isBinary = isBinaryFile(filename);

                try {
                    let content;
                    if (isBinary) {
                        const arrayBuffer = await file.async('arraybuffer');
                        const bytes = new Uint8Array(arrayBuffer);
                        content = btoa(String.fromCharCode.apply(null, bytes));
                    } else {
                        content = await file.async('string');
                    }

                    const fileData = {
                        path: filename,
                        content: content,
                        isBinary: isBinary,
                        mimeType: detectMimeType(filename),
                        size: content.length,
                        hash: calculateHash(content),
                        extractedAt: new Date().toISOString()
                    };

                    state.extractedData.push(fileData);
                    state.processedFiles++;

                    if (state.processedFiles % 50 === 0) {
                        log('info', `Progreso: ${state.processedFiles} / ${state.totalFiles}`);
                    }

                    if (state.extractedData.length >= CONFIG.batchSize) {
                        const batch = [...state.extractedData];
                        state.extractedData = [];

                        if (CONFIG.useIndexedDB) batchPromises.push(saveBatchToIndexedDB(batch));
                        if (CONFIG.useSQLite) batchPromises.push(saveBatchToSQLite(batch));
                        if (CONFIG.useJSON) {
                            const batchNum = Math.floor(state.processedFiles / CONFIG.batchSize);
                            downloadJSON(batch, `figma-zip-batch-${batchNum}.json`);
                        }
                    }

                    if (state.processedFiles % 10 === 0) updateUI();

                } catch (fileError) {
                    log('error', `Error en archivo ${filename}`, fileError.message);
                }
            }

            // Guardar restantes
            if (state.extractedData.length > 0) {
                const batch = [...state.extractedData];

                if (CONFIG.useIndexedDB) await saveBatchToIndexedDB(batch);
                if (CONFIG.useSQLite) await saveBatchToSQLite(batch);
                if (CONFIG.useJSON) downloadJSON(batch, `figma-zip-final.json`);
            }

            await Promise.all(batchPromises);

            const elapsed = Date.now() - state.startTime;
            log('success', `Procesamiento completado en ${formatTime(elapsed)}`);
            updateUI();

        } catch (error) {
            log('error', `Error crítico: ${error.message}`, error.stack);
            alert(`❌ Error procesando ZIP:\n\n${error.message}\n\nRevisa la consola (F12) y los logs en el panel.`);
        } finally {
            state.isProcessing = false;
            updateUI();
            log('info', 'Procesamiento finalizado');
        }
    }

    // ==================== UI MEJORADA CON LOGS ====================

    function createUI() {
        if (document.getElementById('figma-zip-ui')) return;

        const container = document.createElement('div');
        container.id = 'figma-zip-ui';

        const savedPos = state.uiPosition;
        Object.assign(container.style, {
            position: 'fixed',
            top: savedPos.y || '80px',
            right: savedPos.x || '20px',
            width: '400px',
            maxHeight: '600px',
            backgroundColor: '#1e1e1e',
            color: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            zIndex: '10000',
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontSize: '12px',
            overflow: 'hidden'
        });

        container.innerHTML = `
            <div id="zip-header" style="
                padding: 12px 15px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px 10px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
            ">
                <div style="font-weight: 600; font-size: 13px;">⚡ ZIP Extractor (Debug)</div>
                <div style="display: flex; gap: 8px;">
                    <button id="zip-minimize" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">−</button>
                </div>
            </div>
            <div id="zip-body" style="padding: 15px; max-height: 500px; overflow-y: auto;">
                <div id="zip-status" style="margin-bottom: 12px; color: #aaa; font-size: 11px;">
                    🎯 Auto-interceptor activo
                </div>
                <div id="zip-drop-zone" style="
                    border: 2px dashed #555;
                    border-radius: 6px;
                    padding: 30px 15px;
                    text-align: center;
                    cursor: pointer;
                    background: #2a2a2a;
                    margin-bottom: 12px;
                    transition: all 0.2s;
                ">
                    <div style="font-size: 36px; margin-bottom: 8px;">📦</div>
                    <div style="color: #aaa; font-size: 11px;">Arrastra ZIP o descárgalo</div>
                </div>
                <div id="zip-progress" style="display: none; margin-bottom: 12px;">
                    <div style="background: #333; height: 4px; border-radius: 2px; overflow: hidden;">
                        <div id="zip-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.3s;"></div>
                    </div>
                    <div id="zip-progress-text" style="margin-top: 5px; font-size: 10px; color: #888; text-align: center;">0 / 0</div>
                </div>
                <div id="zip-stats" style="font-size: 10px; color: #888; line-height: 1.6; margin-bottom: 12px;">
                    <div>⏱️ <span id="zip-stat-time">--</span> | ⚡ <span id="zip-stat-speed">--</span></div>
                </div>
                <div style="border-top: 1px solid #333; padding-top: 12px;">
                    <div style="font-size: 11px; color: #aaa; margin-bottom: 8px; font-weight: 600;">📋 Logs en Tiempo Real:</div>
                    <div id="zip-log-container" style="
                        background: #0a0a0a;
                        border: 1px solid #333;
                        border-radius: 4px;
                        padding: 8px;
                        max-height: 200px;
                        overflow-y: auto;
                        font-family: 'Consolas', monospace;
                    "></div>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Drag to move
        makeDraggable(container, document.getElementById('zip-header'));

        // Minimize
        document.getElementById('zip-minimize').onclick = (e) => {
            e.stopPropagation();
            state.uiMinimized = !state.uiMinimized;
            const body = document.getElementById('zip-body');
            if (state.uiMinimized) {
                body.style.display = 'none';
                container.style.width = '200px';
                document.getElementById('zip-minimize').textContent = '+';
            } else {
                body.style.display = 'block';
                container.style.width = '400px';
                document.getElementById('zip-minimize').textContent = '−';
            }
        };

        // Drop zone
        const dropZone = document.getElementById('zip-drop-zone');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.zip';
        fileInput.style.display = 'none';

        dropZone.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                log('info', `Archivo seleccionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                processZipFile(file);
            }
        };

        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#667eea';
            dropZone.style.background = '#2a2a3a';
        };

        dropZone.ondragleave = () => {
            dropZone.style.borderColor = '#555';
            dropZone.style.background = '#2a2a2a';
        };

        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#555';
            dropZone.style.background = '#2a2a2a';
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.zip')) {
                log('info', `ZIP arrastrado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                processZipFile(file);
            } else {
                log('warn', 'Archivo no válido - debe ser .zip');
            }
        };

        document.body.appendChild(fileInput);

        log('success', 'UI inicializada correctamente');
    }

    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.right = "auto";
            element.style.left = (element.offsetLeft - pos1) + "px";

            state.uiPosition = { x: element.style.left, y: element.style.top };
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function updateUI() {
        const progress = state.totalFiles > 0 ? (state.processedFiles / state.totalFiles) * 100 : 0;
        const elapsed = state.startTime ? Date.now() - state.startTime : 0;
        const speed = elapsed > 0 ? (state.processedFiles / (elapsed / 1000)).toFixed(0) : 0;

        const progressBar = document.getElementById('zip-progress-bar');
        const progressText = document.getElementById('zip-progress-text');
        const progressDiv = document.getElementById('zip-progress');
        const timeEl = document.getElementById('zip-stat-time');
        const speedEl = document.getElementById('zip-stat-speed');

        if (!progressBar || !progressText || !progressDiv || !timeEl || !speedEl) {
            setTimeout(updateUI, 100);
            return;
        }

        if (state.isProcessing) {
            progressDiv.style.display = 'block';
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${state.processedFiles} / ${state.totalFiles}`;
        } else {
            progressDiv.style.display = 'none';
        }

        timeEl.textContent = formatTime(elapsed);
        speedEl.textContent = `${speed} f/s`;
    }

    function updateStatus(text) {
        const statusEl = document.getElementById('zip-status');
        if (statusEl) statusEl.textContent = text;
    }

    // Inicializar
    const observer = new MutationObserver(() => createUI());
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
        createUI();
        log('info', 'Script cargado y listo');
    }, 2000);

})();
