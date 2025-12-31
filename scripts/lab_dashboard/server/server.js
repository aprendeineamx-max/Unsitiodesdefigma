// Load environment variables
require('dotenv').config();

console.log('DEBUG: Starting Lab Manager Server...');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');
const treeKill = require('tree-kill');
const pidusage = require('pidusage');
const simpleGit = require('simple-git');
const detectLib = require('detect-port');
const detect = detectLib.default || detectLib;

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '../../../');
const LABS_DIR = path.join(PROJECT_ROOT, 'Figma_Labs');
const LEGACY_DIR = path.join(PROJECT_ROOT, 'Figma_Lab');

// Setup Express & Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// State
const activeProcesses = new Map();

// Ensure Labs Dir
if (!fs.existsSync(LABS_DIR)) fs.mkdirSync(LABS_DIR, { recursive: true });

// Shared dependencies for all modules
const dependencies = {
    LABS_DIR,
    LEGACY_DIR,
    activeProcesses,
    io,
    fs,
    path,
    spawn,
    treeKill,
    pidusage,
    detect,
    simpleGit,
    AdmZip,
    multer
};

// Load Core Modules
const helpers = require('./core/helpers')(dependencies);
const { broadcastLog, broadcastState, getVersionsState } = helpers;
dependencies.broadcastLog = broadcastLog;
dependencies.broadcastState = broadcastState;
dependencies.getVersionsState = getVersionsState;

const processManager = require('./core/process-manager')(dependencies);
const { startProcess, stopProcess } = processManager;
dependencies.startProcess = startProcess;
dependencies.stopProcess = stopProcess;

const monitoring = require('./core/monitoring')(dependencies);

// Mount Route Modules
app.use('/api/upload', require('./routes/upload')(dependencies));
app.use('/api', require('./routes/versions')(dependencies));
app.use('/api', require('./routes/management')(dependencies));
app.use('/api/trash', require('./routes/trash')(dependencies));
app.use('/api/archive', require('./routes/archive')(dependencies));
app.use('/api/bulk', require('./routes/bulk')(dependencies));
app.use('/api/health', require('./routes/health')(dependencies));
app.use('/api/git', require('./routes/git')(dependencies));
app.use('/api/files', require('./routes/files')(dependencies));
app.use('/api/snapshots', require('./routes/snapshots')(dependencies));
app.use('/api/config', require('./routes/config')(dependencies));
app.use('/api/cloud', require('./routes/cloud')(dependencies));
// automation disabled
// system disabled

// Start Server
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`LAB MANAGER API running on http://localhost:${PORT}`);
    console.log(`Modular architecture loaded successfully`);
});
