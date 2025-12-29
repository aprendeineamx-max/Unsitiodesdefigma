// ==UserScript==
// @name         Figma Code FileSystem Mapper
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Extrae y mapea el sistema de archivos del Panel de Código de Figma (Fix Scoping)
// @author       Antigravity Agent
// @match        https://www.figma.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        scanDelay: 600,
        basePadding: 8,
        indentStep: 16,
    };

    const SELECTORS = {
        fileItem: '[data-testid="code-file-item"]',
        folderItem: '[data-folder-item="true"]',
        folderName: '[data-testid="code-folder-name"]',
        fileName: '[data-testid="code-file-name-input"]',
        paddingElement: '[style*="--x-paddingLeft"]',
        expandButton: 'button[aria-expanded="false"]',
        // XPath proporcionado por el usuario para el contenedor exacto
        containerXPath: '/html/body/div[2]/div/div/div/div[1]/div/div/div[1]/div[8]/div/div/div[2]/div/div/div/div/div[2]/div/div[1]'
    };

    let isScanning = false;

    // --- UTILS ---
    function getElementByXPath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    // --- UI ---
    function createUI() {
        if (document.getElementById('figma-fs-mapper-btn')) return;

        const container = document.createElement('div');
        container.id = 'figma-fs-mapper-ui';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '10000',
            display: 'flex',
            gap: '10px',
            flexDirection: 'column',
            alignItems: 'flex-end'
        });

        const btnStyle = {
            padding: '10px 16px',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif'
        };

        const mapBtn = document.createElement('button');
        mapBtn.id = 'figma-fs-mapper-btn';
        mapBtn.innerText = "📂 Mapear FileSystem";
        Object.assign(mapBtn.style, { ...btnStyle, backgroundColor: '#10b981' });
        mapBtn.onclick = startMappingProcess;

        const expandBtn = document.createElement('button');
        expandBtn.innerText = "⬇️ Expandir Todo (Área Restringida)";
        Object.assign(expandBtn.style, { ...btnStyle, backgroundColor: '#3b82f6', fontSize: '12px' });
        expandBtn.onclick = expandAllFolders;

        const debugBtn = document.createElement('button');
        debugBtn.innerText = "🎯 Marcar Área de Trabajo";
        Object.assign(debugBtn.style, { ...btnStyle, backgroundColor: '#8b5cf6', fontSize: '12px' });
        debugBtn.onclick = highlightWorkingArea;

        container.appendChild(debugBtn);
        container.appendChild(expandBtn);
        container.appendChild(mapBtn);
        document.body.appendChild(container);
    }

    // --- CORE SCOPING ---
    function getWorkingContainer() {
        // Intento 1: XPath exacto del usuario
        let container = getElementByXPath(SELECTORS.containerXPath);

        // Intento 2: Buscar el contenedor 'Files' que suele tener un header específico o estructura
        if (!container) {
            // Buscamos un item conocido y subimos
            const exampleItem = document.querySelector(SELECTORS.fileItem);
            if (exampleItem) {
                // Navegar hacia arriba hasta encontrar el contenedor scrollable inmediato
                let parent = exampleItem.parentElement;
                while (parent && parent !== document.body) {
                    const style = window.getComputedStyle(parent);
                    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                        container = parent;
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
        }

        return container;
    }

    function highlightWorkingArea() {
        const container = getWorkingContainer();
        if (container) {
            container.style.outline = "4px solid red";
            container.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
            setTimeout(() => {
                container.style.outline = "";
                container.style.backgroundColor = "";
            }, 2000);
            return true;
        } else {
            alert("❌ No se encontró el contenedor de archivos. Usa el XPath o abre el panel de código.");
            return false;
        }
    }

    // --- LOGICA MAPEO ---
    function getDepth(element) {
        const styleNode = element.querySelector(SELECTORS.paddingElement);
        if (!styleNode) return 0;
        const style = styleNode.getAttribute('style');
        const match = style.match(/--x-paddingLeft:\s*(\d+)px/);
        if (match && match[1]) {
            const px = parseInt(match[1], 10);
            return Math.max(0, Math.round((px - CONFIG.basePadding) / CONFIG.indentStep));
        }
        return 0;
    }

    function parseRow(row) {
        const isFolder = row.getAttribute('data-folder-item') === 'true';
        const isFile = row.getAttribute('data-testid') === 'code-file-item';
        if (!isFolder && !isFile) return null;

        let name = "UNKNOWN";
        let type = isFolder ? 'folder' : 'file';
        let depth = getDepth(row);

        if (isFolder) {
            const nameEl = row.querySelector(SELECTORS.folderName);
            if (nameEl) name = nameEl.innerText;
            if (depth === 0) {
                const btn = row.querySelector('button');
                if (btn && btn.querySelector(SELECTORS.paddingElement)) depth = getDepth(btn);
            }
        } else {
            const inputEl = row.querySelector(SELECTORS.fileName);
            if (inputEl) name = inputEl.value || inputEl.getAttribute('value');

            if (!name || name === "undefined") {
                const parentBtn = row.closest('button');
                if (parentBtn && parentBtn.getAttribute('aria-label')) {
                    const ariaLabel = parentBtn.getAttribute('aria-label');
                    const match = ariaLabel.match(/Archivo "(.*)"/);
                    name = match ? match[1] : ariaLabel;
                }
            }
        }
        return { type, name, depth, id: `${type}-${name}-${depth}` };
    }

    async function startMappingProcess() {
        if (isScanning) return;

        const scroller = getWorkingContainer();
        if (!scroller) {
            alert("❌ No se encontró el panel de archivos.");
            return;
        }

        // Asegurarnos que es el scroller real
        let realScroller = scroller;
        if (window.getComputedStyle(scroller).overflowY !== 'auto' && window.getComputedStyle(scroller).overflowY !== 'scroll') {
            // Si el XPath apunta al contenedor wrapper pero no al scroll, buscar hijo scrollable
            const childScroller = Array.from(scroller.querySelectorAll('div')).find(div => {
                const s = window.getComputedStyle(div);
                return s.overflowY === 'auto' || s.overflowY === 'scroll';
            });
            if (childScroller) realScroller = childScroller;
        }

        isScanning = true;
        const btn = document.getElementById('figma-fs-mapper-btn');
        const originalText = btn.innerText;
        btn.innerText = "⏳ Escaneando...";
        btn.style.backgroundColor = '#f59e0b';

        realScroller.scrollTop = 0;
        await new Promise(r => setTimeout(r, 600));

        window.allSnapshots = [];
        let lastScrollTop = -1;
        let noMoveCount = 0;

        while (true) {
            // Importante: Query scoped to realScroller
            const rows = realScroller.querySelectorAll(`${SELECTORS.folderItem}, ${SELECTORS.fileItem}`);
            const currentSnapshot = Array.from(rows).map(parseRow).filter(Boolean);
            if (currentSnapshot.length > 0) window.allSnapshots.push(currentSnapshot);

            const maxScroll = realScroller.scrollHeight - realScroller.clientHeight;
            if (Math.abs(realScroller.scrollTop - lastScrollTop) < 2 || realScroller.scrollTop >= maxScroll - 2) {
                noMoveCount++;
                if (noMoveCount > 1) break;
            } else {
                noMoveCount = 0;
            }

            lastScrollTop = realScroller.scrollTop;
            realScroller.scrollBy(0, 400);
            await new Promise(r => setTimeout(r, CONFIG.scanDelay));
            btn.innerText = `⏳ Pasos: ${window.allSnapshots.length}`;
        }

        const finalFlatList = stitchSnapshots(window.allSnapshots);
        const fileSystem = buildTree(finalFlatList);
        downloadData(fileSystem, finalFlatList);

        isScanning = false;
        btn.innerText = "✅ Listo";
        btn.style.backgroundColor = '#10b981';
        setTimeout(() => btn.innerText = originalText, 3000);
    }

    function stitchSnapshots(snapshots) {
        if (!snapshots || snapshots.length === 0) return [];
        let merged = [...snapshots[0]];
        for (let i = 1; i < snapshots.length; i++) {
            const nextChunk = snapshots[i];
            const tail = merged.slice(-50);
            let bestOverlap = 0;
            for (let len = Math.min(tail.length, nextChunk.length); len > 0; len--) {
                const tailSlice = tail.slice(-len);
                const headSlice = nextChunk.slice(0, len);
                if (JSON.stringify(tailSlice) === JSON.stringify(headSlice)) {
                    bestOverlap = len;
                    break;
                }
            }
            if (bestOverlap > 0) merged = merged.concat(nextChunk.slice(bestOverlap));
            else merged = merged.concat(nextChunk);
        }
        return merged.filter((item, index, arr) => {
            if (index === 0) return true;
            return item.id !== arr[index - 1].id;
        });
    }

    function buildTree(flatList) {
        const root = { name: "root", type: "folder", children: [], depth: -1 };
        const stack = [root];
        flatList.forEach(item => {
            while (stack.length > 1 && stack[stack.length - 1].depth >= item.depth) stack.pop();
            const parent = stack[stack.length - 1];
            const newItem = { name: item.name, type: item.type, depth: item.depth, children: item.type === 'folder' ? [] : undefined };
            parent.children.push(newItem);
            if (item.type === 'folder') stack.push(newItem);
        });
        return root.children;
    }

    async function expandAllFolders() {
        const container = getWorkingContainer();
        if (!container) {
            alert("❌ Contenedor no encontrado.");
            return;
        }

        highlightWorkingArea(); // Visual feedback
        await new Promise(r => setTimeout(r, 500));

        const btn = document.querySelector('#figma-fs-mapper-ui button:nth-child(2)');
        const originalText = btn.innerText;
        btn.innerText = "⏳ Expandiendo...";

        let totalExpanded = 0;
        let retries = 0;

        while (retries < 15) {
            // Query STRICTLY scoped to container
            const allExpandBtns = Array.from(container.querySelectorAll(SELECTORS.expandButton));

            // Filtro adicional de seguridad: aseguremos que parecen carpetas de código
            const validBtns = allExpandBtns.filter(b => {
                // Verificar si está dentro de un item de carpeta conocido o si su estructura interna coincide
                // La estructura de Figma para botones de carpeta suele tener ciertos SVGs
                // Check simple: ¿Está dentro de container? (Ya garantizado por querySelectorAll en container)
                return true;
            });

            if (validBtns.length === 0) {
                // Intentar scroll para revelar más
                if (container.scrollHeight > container.clientHeight && container.scrollTop < (container.scrollHeight - container.clientHeight)) {
                    container.scrollBy(0, 500);
                    await new Promise(r => setTimeout(r, 500));
                    continue;
                }
                break;
            }

            const batch = validBtns.slice(0, 10);
            for (const b of batch) {
                b.click(); // Click nativo
                totalExpanded++;
            }

            await new Promise(r => setTimeout(r, 800)); // Esperar carga
            retries++;
        }

        btn.innerText = `✅ ${totalExpanded} Hecho`;
        setTimeout(() => btn.innerText = originalText, 3000);
    }

    function downloadData(tree, flat) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const jsonBlob = new Blob([JSON.stringify(tree, null, 2)], { type: 'application/json' });
        saveBlob(jsonBlob, `Figma_FileSystem_${timestamp}.json`);
        let md = `# Figma FS Map\nScan Date: ${new Date().toLocaleString()}\nCount: ${flat.length}\n\n`;
        const printNode = (node, p = "") => {
            md += `${p}- ${node.type === 'folder' ? '📁' : '📄'} ${node.name}\n`;
            if (node.children) node.children.forEach(c => printNode(c, p + "  "));
        };
        tree.forEach(n => printNode(n));
        const mdBlob = new Blob([md], { type: 'text/markdown' });
        saveBlob(mdBlob, `Figma_FileSystem_${timestamp}.md`);
    }

    function saveBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const observer = new MutationObserver(() => createUI());
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(createUI, 2000);

})();
