#!/usr/bin/env node

/**
 * Lab Manager CLI - Interactive Command Line Interface
 * 
 * Control Lab Manager from terminal with real-time event monitoring
 */

const io = require('socket.io-client');
const axios = require('axios');
const readline = require('readline');
const chalk = require('chalk');

const API_URL = 'http://localhost:3000';
const socket = io(API_URL);

console.log(chalk.cyan('🚀 Lab Manager CLI v1.0.0\n'));

// Connect to WebSocket
socket.on('connect', () => {
    console.log(chalk.green('✅ Connected to Lab Manager\n'));
    showHelp();
    startPrompt();
});

socket.on('disconnect', () => {
    console.log(chalk.red('❌ Disconnected from Lab Manager'));
});

// Real-time event listeners
socket.on('log', (log) => {
    const colorMap = {
        success: chalk.green,
        error: chalk.red,
        warn: chalk.yellow,
        info: chalk.blue
    };
    const color = colorMap[log.type] || chalk.white;
    console.log(color(`[${log.versionId}] ${log.text}`));
});

socket.on('state-update', (data) => {
    // Silently update internal state, don't spam console
});

socket.on('action', (action) => {
    console.log(chalk.magenta(`🔔 Action: ${action.type} - ${action.versionId || 'system'}`));
});

// Command definitions
const commands = {
    async list() {
        try {
            const { data } = await axios.get(`${API_URL}/api/versions`);
            console.log(chalk.cyan('\n📦 Available ZIPs:\n'));
            data.forEach(v => {
                const statusIcon = {
                    running: '🟢',
                    starting: '🟡',
                    stopped: '⚫',
                    installing: '🔵'
                }[v.status] || '⚪';
                console.log(`${statusIcon} ${chalk.bold(v.id)} - ${v.status}${v.port ? ` (port ${v.port})` : ''}`);
            });
            console.log('');
        } catch (err) {
            console.error(chalk.red('❌ Error:'), err.message);
        }
    },

    async start(version, port = '0') {
        try {
            console.log(chalk.yellow(`⏳ Starting ${version}...`));
            await axios.post(`${API_URL}/api/start`, { version, port: parseInt(port) });
            console.log(chalk.green('✅ Start command sent\n'));
        } catch (err) {
            console.error(chalk.red('❌ Error:'), err.message);
        }
    },

    async stop(version) {
        try {
            console.log(chalk.yellow(`⏳ Stopping ${version}...`));
            await axios.post(`${API_URL}/api/stop`, { version });
            console.log(chalk.green('✅ Stop command sent\n'));
        } catch (err) {
            console.error(chalk.red('❌ Error:'), err.message);
        }
    },

    async archive(version) {
        try {
            console.log(chalk.yellow(`⏳ Archiving ${version}...`));
            await axios.post(`${API_URL}/api/archive`, { version });
            console.log(chalk.green('✅ Archived\n'));
        } catch (err) {
            console.error(chalk.red('❌ Error:'), err.message);
        }
    },

    async trash(version) {
        try {
            console.log(chalk.yellow(`⏳ Moving ${version} to trash...`));
            await axios.post(`${API_URL}/api/trash`, { version });
            console.log(chalk.green('✅ Moved to trash\n'));
        } catch (err) {
            console.error(chalk.red('❌ Error:'), err.message);
        }
    },

    async delete(version) {
        try {
            console.log(chalk.red(`⚠️  Permanently deleting ${version}...`));
            await axios.post(`${API_URL}/api/delete`, { version });
            console.log(chalk.green('✅ Deleted\n'));
        } catch (err) {
            console.error(chalk.red('❌ Error:'), err.message);
        }
    },

    async info() {
        try {
            const { data } = await axios.get(`${API_URL}/api/system/info`);
            console.log(chalk.cyan('\n📊 System Information:\n'));
            console.log(chalk.white('Uptime:'), data.system.uptime);
            console.log(chalk.white('Memory:'), data.system.memory.used, '/', data.system.memory.total);
            console.log(chalk.white('Node:'), data.system.nodeVersion);
            console.log(chalk.white('\nZIPs:'));
            console.log(`  Total: ${data.zips.total}`);
            console.log(`  Active: ${chalk.green(data.zips.active)}`);
            console.log(`  Stopped: ${chalk.gray(data.zips.stopped)}`);
            console.log(`  Archived: ${chalk.blue(data.zips.archived)}`);
            console.log(`  Trash: ${chalk.yellow(data.zips.trash)}`);
            console.log('');
        } catch (err) {
            console.error(chalk.red('❌ Error:'), err.message);
        }
    },

    async docs() {
        try {
            const { data } = await axios.get(`${API_URL}/api/docs`);
            console.log(chalk.cyan('\n📚 API Documentation:\n'));
            console.log(chalk.white('Version:'), data.version);
            console.log(chalk.white('Base URL:'), data.baseUrl);
            console.log(chalk.white('WebSocket:'), data.websocket.url);
            console.log(chalk.white('\nAvailable Endpoints:'), Object.keys(data.endpoints).length);
            console.log(chalk.gray('Use "docs <endpoint>" for details or visit http://localhost:3000/api/docs\n'));
        } catch (err) {
            console.error(chalk.red('❌ Error:'), err.message);
        }
    },

    help: showHelp,

    exit() {
        console.log(chalk.cyan('👋 Goodbye!'));
        process.exit(0);
    }
};

function showHelp() {
    console.log(chalk.cyan('📖 Available Commands:\n'));
    console.log(chalk.white('  list') + chalk.gray(' - List all ZIPs'));
    console.log(chalk.white('  start <version> [port]') + chalk.gray(' - Start a ZIP (port optional, 0 for auto)'));
    console.log(chalk.white('  stop <version>') + chalk.gray(' - Stop a ZIP'));
    console.log(chalk.white('  archive <version>') + chalk.gray(' - Archive a ZIP'));
    console.log(chalk.white('  trash <version>') + chalk.gray(' - Move ZIP to trash'));
    console.log(chalk.white('  delete <version>') + chalk.gray(' - Permanently delete ZIP'));
    console.log(chalk.white('  info') + chalk.gray(' - Show system information'));
    console.log(chalk.white('  docs') + chalk.gray(' - Show API documentation'));
    console.log(chalk.white('  help') + chalk.gray(' - Show this help'));
    console.log(chalk.white('  exit') + chalk.gray(' - Exit CLI'));
    console.log('');
}

function startPrompt() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.green('lab> ')
    });

    rl.prompt();

    rl.on('line', async (line) => {
        const [cmd, ...args] = line.trim().split(' ');

        if (commands[cmd]) {
            await commands[cmd](...args);
        } else if (cmd) {
            console.log(chalk.red(`Unknown command: ${cmd}`));
            console.log(chalk.gray('Type "help" for available commands\n'));
        }

        rl.prompt();
    });

    rl.on('close', () => {
        commands.exit();
    });
}
