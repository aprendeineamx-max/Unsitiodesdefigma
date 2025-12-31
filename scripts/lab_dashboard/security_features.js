
// ==========================================
// SECURITY FEATURES
// ==========================================
const rateLimit = new Map();

// Middleware: Path Traversal Protection
app.use((req, res, next) => {
    // Check params and body for traversal attempts
    const check = (str) => str && str.includes && (str.includes('..') || str.includes('~'));

    if (req.params) {
        for (const val of Object.values(req.params)) {
            if (check(val)) return res.status(403).json({ error: 'Security Block: Path Traversal Detected' });
        }
    }
    if (req.body) {
        for (const val of Object.values(req.body)) {
            if (check(val)) return res.status(403).json({ error: 'Security Block: Path Traversal Detected' });
        }
    }
    next();
});

// Middleware: Auth (Simple Bearer)
app.use((req, res, next) => {
    // Allow public health check or static?
    // For now, strict mode: everything needs auth EXCEPT specific public endpoints
    if (req.path === '/api/health/v_atom' || req.path === '/api/system/info') return next();

    // Check Header
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Missing Auth Header' });
    if (auth !== 'Bearer LAB_SECRET_KEY') return res.status(403).json({ error: 'Invalid Token' });

    next();
});


// Middleware: Rate Limiting (Simple)
app.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    if (!rateLimit.has(ip)) rateLimit.set(ip, []);

    const requests = rateLimit.get(ip);
    // Remove old > 1 sec
    while (requests.length > 0 && requests[0] < now - 1000) requests.shift();

    if (requests.length > 50) return res.status(429).json({ error: 'Rate Limit Exceeded' });

    requests.push(now);
    next();
});
