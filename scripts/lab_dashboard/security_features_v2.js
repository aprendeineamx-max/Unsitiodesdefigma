
// ==========================================
// SECURITY FEATURES
// ==========================================
const rateLimit = new Map();

// Middleware: Path Traversal Protection
app.use((req, res, next) => {
    const check = (str) => typeof str === 'string' && (str.includes('..') || str.includes('~'));

    if (req.params) {
        for (const val of Object.values(req.params)) {
            if (check(val)) return res.status(403).json({ error: 'Security Block: Path Traversal Detected' });
        }
    }
    if (req.body) {
        // Recursive check for nested objects? For now simple shallow check
        for (const val of Object.values(req.body)) {
            if (check(val)) return res.status(403).json({ error: 'Security Block: Path Traversal Detected' });
        }
    }
    next();
});

// Middleware: Command Injection Protection
app.use((req, res, next) => {
    if (req.path === '/api/terminal/exec' && req.body.command) {
        const cmd = req.body.command;
        // Block chaining operators
        if (/([;&|])/.test(cmd)) {
            return res.status(403).json({ error: 'Security Block: Command Injection Detected' });
        }
    }
    next();
});

// Middleware: Auth (Simple Bearer)
app.use((req, res, next) => {
    // Allow public health check or static?
    const publicPaths = ['/api/health/v_atom', '/api/system/info', '/api/versions'];
    if (publicPaths.includes(req.path)) return next();

    // Check Header
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Missing Auth Header' });
    if (auth !== 'Bearer LAB_SECRET_KEY') return res.status(403).json({ error: 'Invalid Token' });

    next();
});


// Middleware: Rate Limiting (Simple)
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    if (!rateLimit.has(ip)) rateLimit.set(ip, []);

    const requests = rateLimit.get(ip);
    // Remove old > 1 sec
    while (requests.length > 0 && requests[0] < now - 1000) requests.shift();

    if (requests.length > 50) return res.status(429).json({ error: 'Rate Limit Exceeded' });

    requests.push(now);
    next();
});
