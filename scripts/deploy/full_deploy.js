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

        // Sequence: Upload -> Unzip -> Deploy
        console.log('⚡ Skipping Docker Check for speed.');
        uploadBundle(conn, path.join(ROOT_DIR, BUNDLE_NAME), () => {
            deployRemote(conn);
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
        console.log('   - Creating write stream...');
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('tar', { gzip: true });

        output.on('close', () => {
            console.log(`\n📦 Bundle created: ${archive.pointer()} total bytes`);
            resolve();
        });

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') console.warn('   ! Warning:', err);
            else reject(err);
        });

        archive.on('error', (err) => {
            console.error('   ! Archiver Error:', err);
            reject(err);
        });

        archive.pipe(output);

        console.log('   - Adding files...');

        // FILES TO INCLUDE
        console.log('   - Adding Dockerfile (Optimized)...');
        if (fs.existsSync(path.join(ROOT_DIR, 'Dockerfile.deploy'))) {
            archive.file(path.join(ROOT_DIR, 'Dockerfile.deploy'), { name: 'Dockerfile' });
        } else {
            console.warn('   ! Dockerfile.deploy not found, falling back to Dockerfile');
            archive.file(path.join(ROOT_DIR, 'Dockerfile'), { name: 'Dockerfile' });
        }

        archive.file(path.join(ROOT_DIR, 'docker-compose.prod.yml'), { name: 'docker-compose.yml' });
        archive.file(path.join(ROOT_DIR, 'nginx.conf'), { name: 'nginx.conf' });

        console.log('   - Adding Backend dir...');
        archive.directory(path.join(ROOT_DIR, 'scripts/lab_dashboard/server'), 'scripts/lab_dashboard/server', (entry) => {
            return entry.name.includes('node_modules') ? false : entry;
        });

        console.log('   - Adding Frontend dir (including dist)...');
        const distPath = path.join(ROOT_DIR, 'scripts/lab_dashboard/client/dist');
        if (!fs.existsSync(distPath)) {
            throw new Error('CLIENT DIST MISSING! Run "npm run build" in client first.');
        }

        archive.directory(path.join(ROOT_DIR, 'scripts/lab_dashboard/client'), 'scripts/lab_dashboard/client', (entry) => {
            if (entry.name.includes('node_modules')) return false;
            return entry;
        });

        console.log('   - Finalizing archive...');
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
        
        echo "Configuring Environment..."
        if [ -f scripts/lab_dashboard/server/.env ]; then
            cp scripts/lab_dashboard/server/.env .env
            echo "✅ .env found and copied to root."
        else
            echo "⚠️  WARNING: .env not found in bundle!"
        fi

        echo "Building & Starting Containers..."
        docker-compose down --remove-orphans || true
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
