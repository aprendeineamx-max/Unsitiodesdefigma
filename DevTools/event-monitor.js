#!/usr/bin/env node

/**
 * Lab Manager Event Monitor
 * 
 * Real-time TUI dashboard showing all events and system state
 */

const blessed = require('blessed');
const io = require('socket.io-client');
const ax axios = require('axios');

const API_URL = 'http://localhost:3000';
const socket = io(API_URL);

// Create screen
const screen = blessed.screen({
    smartCSR: true,
    title: 'Lab Manager Event Monitor'
});

// State box (top-left)
const stateBox = blessed.box({
    top: 0,
    left: 0,
    width: '50%',
    height: '50%',
    content: '{center}Connecting to Lab Manager...{/center}',
    tags: true,
    border: {
        type: 'line'
    label: 'State',
        scrollable: true,
        alwaysScroll: true,
        mouse: true,
        keys: true,
        vi: true,
        style: {
            fg: 'white',
            border: {
                fg: 'cyan'
            }
        }
    });

// Stats box (top-right)
const statsBox = blessed.box({
    top: 0,
    left: '50%',
    width: '50%',
    height: '50%',
    content: '',
    tags: true,
    border: {
        type: 'line'
    },
    label: 'System Stats',
    scrollable: true,
    style: {
        fg: 'white',
        border: {
            fg: 'green'
        }
    }
});

// Log box (bottom)
const logBox = blessed.log({
    top: '50%',
    left: 0,
    width: '100%',
    height: '50%',
    border: {
        type: 'line'
    },
    label: 'Real-time Logs',
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    mouse: true,
    keys: true,
    vi: true,
    scrollbar: {
        ch: ' ',
        inverse: true
    },
    style: {
        fg: 'white',
        border: {
            fg: 'yellow'
        }
    }
});

// Help text (bottom-right corner)
const helpText = blessed.text({
    bottom: 0,
    right: 0,
    content: ' [q]uit [c]lear ',
    tags: true,
    style: {
        fg: 'gray'
    }
});

screen.append(stateBox);
screen.append(statsBox);
screen.append(logBox);
screen.append(helpText);

// Quit on Escape, q, or Control-C
screen.key(['escape', 'q', 'C-c'], () => {
    return process.exit(0);
});

// Clear logs on 'c'
screen.key(['c'], () => {
    logBox.setContent('');
    logBox.screen.render();
});

// Focus management
screen.key(['tab'], () => {
    if (screen.focused === stateBox) {
        logBox.focus();
    } else {
        stateBox.focus();
    }
    screen.render();
});

stateBox.focus();

// WebSocket Event Handlers
socket.on('connect', () => {
    logBox.log('{green-fg}✅ Connected to Lab Manager{/green-fg}');
    screen.render();
    updateState();
    updateStats();
});

socket.on('disconnect', () => {
    logBox.log('{red-fg}❌ Disconnected from Lab Manager{/red-fg}');
    screen.render();
});

socket.on('state-update', (data) => {
    updateStateDisplay(data);
});

socket.on('log', (log) => {
    const colorMap = {
        success: 'green',
        error: 'red',
        warn: 'yellow',
        info: 'cyan'
    };
    const color = colorMap[log.type] || 'white';
    logBox.log(`{${color}-fg}[${log.versionId}] ${log.text}{/${color}-fg}`);
    screen.render();
});

socket.on('stats-update', (stats) => {
    updateStatsDisplay(stats);
});

socket.on('action', (action) => {
    logBox.log(`{magenta-fg}🔔 ${action.type}: ${action.versionId || 'system'}{/magenta-fg}`);
    screen.render();
});

// Update functions
async function updateState() {
    try {
        const { data } = await axios.get(`${API_URL}/api/versions`);
        updateStateDisplay(data);
    } catch (err) {
        stateBox.setContent(`{red-fg}Error: ${err.message}{/red-fg}`);
        screen.render();
    }
}

function updateStateDisplay(versions) {
    if (!Array.isArray(versions)) return;

    let content = '{bold}ZIPs:{/bold}\n\n';

    versions.forEach(v => {
        const statusIcon = {
            running: '{green-fg}🟢{/green-fg}',
            starting: '{yellow-fg}🟡{/yellow-fg}',
            stopped: '{gray-fg}⚫{/gray-fg}',
            installing: '{blue-fg}🔵{/blue-fg}'
        }[v.status] || '⚪';

        content += `${statusIcon} {bold}${v.id}{/bold}\n`;
        content += `   Status: ${v.status}\n`;
        if (v.port) content += `   Port: ${v.port}\n`;
        if (v.pid) content += `   PID: ${v.pid}\n`;
        content += '\n';
    });

    stateBox.setContent(content);
    screen.render();
}

async function updateStats() {
    try {
        const { data } = await axios.get(`${API_URL}/api/system/info`);
        updateStatsDisplay(data);
    } catch (err) {
        statsBox.setContent(`{red-fg}Error: ${err.message}{/red-fg}`);
        screen.render();
    }

    // Update every 5 seconds
    setTimeout(updateStats, 5000);
}

function updateStatsDisplay(info) {
    if (!info) return;

    let content = '{bold}System:{/bold}\n\n';

    if (info.system) {
        content += `Uptime: ${info.system.uptime}\n`;
        content += `Memory: ${info.system.memory.used} / ${info.system.memory.total}\n`;
        content += `Node: ${info.system.nodeVersion}\n`;
        content += `Platform: ${info.system.platform}\n\n`;
    }

    if (info.zips) {
        content += `{bold}ZIPs:{/bold}\n`;
        content += `Total: ${info.zips.total}\n`;
        content += `{green-fg}Active: ${info.zips.active}{/green-fg}\n`;
        content += `{gray-fg}Stopped: ${info.zips.stopped}{/gray-fg}\n`;
        content += `{blue-fg}Archived: ${info.zips.archived}{/blue-fg}\n`;
        content += `{yellow-fg}Trash: ${info.zips.trash}{/yellow-fg}\n\n`;
    }

    if (info.processes) {
        content += `{bold}Processes:{/bold}\n`;
        content += `Running: ${info.processes.running}\n`;
    }

    statsBox.setContent(content);
    screen.render();
}

// Initial render
screen.render();

logBox.log('{cyan-fg}🚀 Lab Manager Event Monitor v1.0.0{/cyan-fg}');
logBox.log('{gray-fg}Press [tab] to switch focus, [c] to clear logs, [q] to quit{/gray-fg}');
screen.render();
