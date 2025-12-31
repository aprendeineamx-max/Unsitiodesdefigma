
const { spawn } = require('child_process');

console.log("Starting 5 concurrent uploads...");
for (let i = 0; i < 5; i++) {
    const p = spawn('node', ['test_large_upload.js'], { stdio: 'inherit' });
    p.on('close', code => console.log(`Proc ${i} finished: ${code}`));
}
