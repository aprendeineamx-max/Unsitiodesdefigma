module.exports = (deps) => {
    const { io, fs, path, LABS_DIR, LEGACY_DIR, activeProcesses } = deps;

    function getVersionsState() {
        const versions = [];
        try {
            if (fs.existsSync(LABS_DIR)) {
                const items = fs.readdirSync(LABS_DIR);
                items.forEach(item => {
                    const fullPath = path.join(LABS_DIR, item);
                    if (item.startsWith('.')) return;
                    if (item.startsWith('_')) return; // Skip _Archive, _Trash

                    try {
                        if (fs.statSync(fullPath).isDirectory()) {
                            const proc = activeProcesses.get(item);
                            versions.push({
                                id: item,
                                path: fullPath,
                                type: 'lab',
                                status: proc ? (proc.status || 'running') : 'stopped',
                                port: proc ? proc.port : null,
                                pid: proc ? proc.pid : null
                            });
                        }
                    } catch (e) { }
                });
            }
        } catch (err) {
            console.error('Error scanning directories:', err);
        }
        return versions;
    }

    function broadcastState() {
        const data = getVersionsState();
        io.emit('state-update', data);
    }

    function broadcastLog(versionId, text, type = 'info') {
        const logEntry = {
            versionId,
            text,
            type,
            timestamp: new Date().toISOString()
        };
        io.emit('log', logEntry);

        // Console fallback
        if (versionId === 'system') console.log(`[SYSTEM] ${text}`);
    }

    return {
        getVersionsState,
        broadcastState,
        broadcastLog
    };
};
