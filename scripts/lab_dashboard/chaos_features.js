
// CHAOS MIDDLEWARE & ENDPOINTS
app.use((req, res, next) => {
    const chaosDelay = req.headers['x-chaos-delay'];
    if (chaosDelay) {
        console.log(`🔥 CNS Chaos: Installing ${chaosDelay}ms latency...`);
        setTimeout(next, parseInt(chaosDelay));
    } else {
        next();
    }
});

app.post('/api/chaos/stress', (req, res) => {
    const duration = req.body.duration || 1000;
    const start = Date.now();
    let computed = 0;
    console.log(`🔥 CNS Chaos: CPU Stress for ${duration}ms...`);
    // Block Event Loop
    while (Date.now() - start < duration) {
        computed = Math.sqrt(Math.random() * Math.random());
    }
    res.json({ success: true, computed });
});
