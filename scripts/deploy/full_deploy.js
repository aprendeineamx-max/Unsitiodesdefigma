const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// CONFIG
const VPS_INFO_PATH = path.join(__dirname, 'vps_info.json');
const ROOT_DIR = path.resolve(__dirname, '../../');
const BUNDLE_NAME = 'deployment_bundle.tar.gz';
const REMOTE_DIR = '/app';

async function main() {
    console.log('🚀 Starting FULL DEPLOYMENT SEQUENCE...');

    // 1. Load Credentials
    if (!fs.existsSync(VPS_INFO_PATH)) {
        console.error('❌ vps_info.json missing.');
        process.exit(1);
    }
    const vps = JSON.parse(fs.readFileSync(VPS_INFO_PATH, 'utf8'));
    console.log(`🎯 Target: ${vps.main_ip} (root)`);

    // 2. Archive Project
    console.log('📦 Archiving project...');
    await createBundle(path.join(ROOT_DIR, BUNDLE_NAME));

    // 3. Connect & Deploy
    const conn = new Client();

    conn.on('ready', () => {
        console.log('🔌 SSH Connected!');

        // Sequence: Install Docker -> Upload -> Unzip -> Deploy
        installDocker(conn, () => {
            uploadBundle(conn, path.join(ROOT_DIR, BUNDLE_NAME), () => {
                deployRemote(conn);
            });
        });
    }).connect({
        host: vps.main_ip,
        port: 22,
        username: 'root',
        password: vps.default_password,
        readyTimeout: 30000 // 30s timeout
    });
}

function createBundle(outputPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('tar', { gzip: true });

        output.on('close', () => {
            console.log(`📦 Bundle created: ${archive.pointer()} total bytes`);
            resolve();
        });
        archive.on('error', (err) => reject(err));
        archive.pipe(output);

        // FILES TO INCLUDE
        // Docker config
        archive.file(path.join(ROOT_DIR, 'Dockerfile'), { name: 'Dockerfile' });
        archive.file(path.join(ROOT_DIR, 'docker-compose.prod.yml'), { name: 'docker-compose.yml' }); // Rename to default
        archive.file(path.join(ROOT_DIR, 'nginx.conf'), { name: 'nginx.conf' });

        // Code (Backend) - Exclude node_modules
        archive.directory(path.join(ROOT_DIR, 'scripts/lab_dashboard/server'), 'scripts/lab_dashboard/server', (entry) => {
            return entry.name.includes('node_modules') ? false : entry;
        });

        // Code (Frontend) - Exclude node_modules & dist (will build on server)
        archive.directory(path.join(ROOT_DIR, 'scripts/lab_dashboard/client'), 'scripts/lab_dashboard/client', (entry) => {
            if (entry.name.includes('node_modules')) return false;
            // if (entry.name.includes('dist')) return false; // Maybe keep dist if built? No, Docker builds it.
            return entry;
        });

        archive.finalize();
    });
}

function installDocker(conn, next) {
    console.log('🐳 Checking/Installing Docker...');
    // We combine commands to ensure flow
    const cmd = `
        if ! command -v docker &> /dev/null; then
            echo "Installing Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            apt-get install -y docker-compose
        else
            echo "Docker already installed"
        fi
        mkdir -p ${REMOTE_DIR}
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log(`🐳 Docker Setup Complete (Code: ${code})`);
            next();
        }).on('data', (data) => process.stdout.write(data.toString()))
            .stderr.on('data', (data) => process.stderr.write(data.toString()));
    });
}

function uploadBundle(conn, localPath, next) {
    console.log('⬆️ Uploading bundle (SFTP)...');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        const remotePath = `${REMOTE_DIR}/${BUNDLE_NAME}`;

        // Fast upload
        sftp.fastPut(localPath, remotePath, {
            step: (transferred, chunk, total) => {
                const percent = Math.round((transferred / total) * 100);
                if (percent % 10 === 0) process.stdout.write(` ${percent}% `);
            }
        }, (err) => {
            if (err) throw err;
            console.log('\n✅ Upload Complete!');
            next();
        });
    });
}

function deployRemote(conn) {
    console.log('🚀 Executing Deployment...');
    const cmd = `
        cd ${REMOTE_DIR}
        echo "Extracting..."
        tar -xzf ${BUNDLE_NAME}
        
        echo "Updating .env..."
        # Inject ENV vars if needed, or use default from file?
        # docker-compose.prod.yml expects VULTR_... env vars.
        # We can write a .env file here.
        
        echo "Building & Starting Containers..."
        docker-compose up -d --build
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log(`\n🎉 DEPLOYMENT FINISHED! (Code: ${code})`);
            console.log('🌐 Check your site: https://micuenta.shop');
            conn.end();
        }).on('data', (data) => process.stdout.write(data.toString()))
            .stderr.on('data', (data) => process.stderr.write(data.toString()));
    });
}

main();
