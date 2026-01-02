const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_INFO_PATH = path.join(__dirname, 'vps_info.json');
const vps = JSON.parse(fs.readFileSync(VPS_INFO_PATH, 'utf8'));

const conn = new Client();

conn.on('ready', () => {
    console.log('CONNECTED to ' + vps.main_ip);

    // Command to list files recursively in /app and check docker-compose
    const cmd = `
        echo "=== CHEKING APP STRUCTURE ==="
        ls -F /app
        echo "--- /app/scripts/lab_dashboard/server ---"
        ls -F /app/scripts/lab_dashboard/server
        echo "--- /app/scripts/lab_dashboard/client ---"
        ls -F /app/scripts/lab_dashboard/client
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Command finished with code ' + code);
            conn.end();
        }).on('data', (data) => {
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}).connect({
    host: vps.main_ip,
    username: 'root',
    password: vps.default_password
});
