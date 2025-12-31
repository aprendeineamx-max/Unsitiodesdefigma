module.exports = (deps) => {
    const { spawn, treeKill, detect, fs, path, LABS_DIR, activeProcesses, broadcastLog, broadcastState } = deps;

    async function startProcess(versionId, preferredPort) {
        if (activeProcesses.has(versionId)) return;

        const cwd = path.join(LABS_DIR, versionId);
        if (!fs.existsSync(cwd)) {
            broadcastLog(versionId, `Directory not found: ${cwd}`, 'error');
            return;
        }

        // Install if needed
        if (!fs.existsSync(path.join(cwd, 'node_modules'))) {
            broadcastLog(versionId, `Installing dependencies...`, 'warn');
            try {
                await new Promise((resolve, reject) => {
                    const p = spawn('npm.cmd', ['install'], { cwd, shell: true });
                    p.on('close', c => c === 0 ? resolve() : reject());
                });
            } catch (e) {
                broadcastLog(versionId, `Install failed`, 'error');
                return;
            }
        }

        const basePort = preferredPort === 0 ? 5174 : preferredPort;
        const port = await detect(basePort);

        broadcastLog(versionId, `Starting on port ${port}...`, 'success');

        const child = spawn('npm.cmd', ['run', 'dev', '--', '--port', port, '--host'], {
            cwd,
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true
        });

        activeProcesses.set(versionId, {
            pid: child.pid,
            port: port,
            status: 'starting',
            startTime: new Date()
        });
        broadcastState();

        child.stdout.on('data', d => {
            const str = d.toString();
            if (str.includes('Local:')) {
                const proc = activeProcesses.get(versionId);
                if (proc) {
                    proc.status = 'running';
                    broadcastState();
                    broadcastLog(versionId, `Server ready at http://localhost:${port}`, 'success');
                }
            }
        });

        child.stderr.on('data', d => broadcastLog(versionId, d.toString(), 'info'));

        child.on('close', code => {
            activeProcesses.delete(versionId);
            broadcastState();
            broadcastLog(versionId, `Exited code ${code}`, 'warn');
        });
    }

    function stopProcess(versionId) {
        const proc = activeProcesses.get(versionId);
        if (!proc) return;

        treeKill(proc.pid, 'SIGKILL', (err) => {
            activeProcesses.delete(versionId);
            broadcastState();
            broadcastLog(versionId, 'Stopped', 'success');
        });
    }

    return { startProcess, stopProcess };
};
