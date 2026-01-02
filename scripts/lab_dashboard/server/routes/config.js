const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // CONFIGURATION MANAGEMENT
    const CONFIG_PATH = path.join(LABS_DIR, 'config.json');

    // Assuming .env is in the project root, 2 dirs up from LABS_DIR if LABS_DIR is scripts/lab_dashboard/labs
    // Or if LABS_DIR is scripts/lab_dashboard, then 2 dirs up?
    // Let's try to locate .env dynamically or assume root.
    // Usually scripts/lab_dashboard/../../.env -> root/.env
    const ENV_PATH = path.resolve(LABS_DIR, '../../.env');

    router.get('/', (req, res) => {
        try {
            if (fs.existsSync(CONFIG_PATH)) {
                const config = fs.readJsonSync(CONFIG_PATH);
                res.json(config);
            } else {
                res.json({});
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/', (req, res) => {
        try {
            fs.writeJsonSync(CONFIG_PATH, req.body, { spaces: 2 });
            broadcastLog('system', 'Configuration updated', 'success');
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- VULTR CREDENTIALS ---

    router.get('/vultr', (req, res) => {
        try {
            if (!fs.existsSync(ENV_PATH)) return res.json({});

            const envContent = fs.readFileSync(ENV_PATH, 'utf8');
            const lines = envContent.split('\n');
            const config = {};

            lines.forEach(line => {
                const parts = line.split('=');
                const key = parts[0]?.trim();
                // Join rest in case value has =
                const val = parts.slice(1).join('=').trim();

                if (['VULTR_ENDPOINT', 'VULTR_ACCESS_KEY', 'VULTR_SECRET_KEY', 'VULTR_BUCKET_NAME'].includes(key)) {
                    config[key] = val;
                }
            });

            res.json(config);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/vultr', (req, res) => {
        try {
            const updates = req.body; // { VULTR_ENDPOINT: '...', ... }
            let envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
            let lines = envContent.split(/\r?\n/);

            Object.keys(updates).forEach(key => {
                const val = updates[key];
                const regex = new RegExp(`^${key}=.*`);
                let found = false;

                lines = lines.map(line => {
                    if (line.match(regex)) {
                        found = true;
                        return `${key}=${val}`;
                    }
                    return line;
                });

                if (!found) {
                    lines.push(`${key}=${val}`);
                }
            });

            fs.writeFileSync(ENV_PATH, lines.join('\n'));
            broadcastLog('system', 'Vultr credentials updated in .env', 'success');
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/open-env', (req, res) => {
        try {
            // Use 'start' on windows to open file with default editor
            require('child_process').exec(`start "" "${ENV_PATH}"`);
            broadcastLog('system', 'Opening .env file...', 'info');
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
