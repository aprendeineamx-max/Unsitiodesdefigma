import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
    LayoutDashboard, Monitor, Terminal, Upload, Settings,
    Shield, Menu, ChevronLeft, Sun, Moon, Search,
    Play, Square, ExternalLink, Activity, FolderOpen, GitBranch
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ResourceMonitor } from './components/ResourceMonitor';
import { FileExplorer } from './components/FileExplorer';
import { ConsoleLogs } from './components/ConsoleLogs';
import { GitControl } from './components/GitControl';

// Helper for classes
function cn(...inputs: any[]) {
    return twMerge(clsx(inputs));
}

const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

// ==========================================
// TYPES
// ==========================================
interface Version {
    id: string;
    path: string;
    type: 'lab' | 'legacy';
    status: 'running' | 'stopped';
    port: number | null;
    pid: number | null;
}

interface Log {
    versionId: string;
    text: string;
    type: 'info' | 'error' | 'success' | 'warn';
    timestamp: string;
}

interface ProcessStats {
    [versionId: string]: {
        cpu: number;
        memory: number;
        elapsed: number;
        timestamp: number;
    };
}

type AdminPage = 'dashboard' | 'logs' | 'settings' | 'explorer' | 'git';

// ==========================================
// APP COMPONENT
// ==========================================
function App() {
    // Layout State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

    // Dashboard Logic State
    const [versions, setVersions] = useState<Version[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [stats, setStats] = useState<ProcessStats>({});
    const [uploading, setUploading] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const socketRef = useRef<any>(null);

    // Initialize Socket
    useEffect(() => {
        socketRef.current = io(SOCKET_URL);
        socketRef.current.on('state-update', (data: Version[]) => setVersions(data));
        socketRef.current.on('stats-update', (data: ProcessStats) => setStats(data));
        socketRef.current.on('log', (log: any) => setLogs(prev => [...prev.slice(-99), log]));
        return () => { socketRef.current?.disconnect(); };
    }, []);

    // Actions
    const handleStart = async (id: string, port: number) => {
        try { await axios.post(`${API_URL}/start`, { id, port }); } catch (err) { alert('Failed to start'); }
    };
    const handleStop = async (id: string) => {
        try { await axios.post(`${API_URL}/stop`, { id }); } catch (err) { alert('Failed to stop'); }
    };
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        setUploading(true);
        try { await axios.post(`${API_URL}/upload`, formData); }
        catch (err) { alert('Upload failed'); }
        finally { setUploading(false); e.target.value = ''; }
    };

    // Derived State
    const filteredVersions = versions.filter(v => v.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredLogs = selectedVersion ? logs.filter(l => l.versionId === selectedVersion) : logs;

    // Render Helpers
    const renderExplorer = () => (
        <div className="h-full animate-in fade-in duration-300">
            <FileExplorer
                versionId={selectedVersion}
                versions={versions}
                onSelectVersion={setSelectedVersion}
            />
        </div>
    );

    const renderLogs = () => (
        <div className="h-full animate-in fade-in duration-300">
            <ConsoleLogs
                logs={filteredLogs}
                versionId={selectedVersion}
                versions={versions}
                onSelectVersion={setSelectedVersion}
            />
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* System Pulse */}
            <div className="animate-in slide-in-from-top-4 duration-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    System Pulse
                </h2>
                <ResourceMonitor stats={stats} selectedVersion={selectedVersion} />
            </div>


            {/* Upload Zone */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-60 transition duration-500 blur"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center border-dashed border-2 hover:border-purple-500 transition-colors">
                    <Upload className={`w-12 h-12 text-gray-400 dark:text-slate-500 mb-4 ${uploading ? 'animate-bounce' : ''}`} />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {uploading ? 'Importing Project...' : 'Drop Figma ZIP Here'}
                    </h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 text-center">
                        Automatically extracts, installs dependencies, and prepares environment.
                    </p>
                    <input
                        type="file"
                        accept=".zip"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <button disabled={uploading} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-purple-900/20">
                        Select ZIP File
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <Monitor className="w-5 h-5 text-indigo-500" />
                    Active Environments
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVersions.map((v) => (
                        <div
                            key={v.id}
                            onClick={() => { setSelectedVersion(v.id); setCurrentPage('logs'); }}
                            className={cn(
                                "p-6 rounded-xl border transition-all cursor-pointer relative overflow-hidden group hover:shadow-xl",
                                v.status === 'running'
                                    ? "bg-slate-50 dark:bg-slate-800/80 border-indigo-200 dark:border-indigo-500/30"
                                    : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800"
                            )}
                        >
                            {v.status === 'running' && (
                                <div className="absolute top-3 right-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("p-3 rounded-lg", v.type === 'legacy' ? "bg-orange-100 dark:bg-orange-500/20" : "bg-blue-100 dark:bg-blue-500/20")}>
                                    {v.type === 'legacy' ? <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" /> : <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{v.id}</h3>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-mono">{v.type}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-slate-700/50">
                                <div className="text-sm">
                                    <span className="text-gray-400 dark:text-slate-500 block text-xs">Port</span>
                                    <span className="font-mono font-bold text-gray-700 dark:text-slate-200">{v.port || '---'}</span>
                                </div>

                                <div className="flex gap-2">
                                    {v.status === 'stopped' ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStart(v.id, v.id.includes('v19') ? 5173 : 5174); }}
                                            className="px-3 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30 text-green-700 dark:text-green-400 rounded-md font-semibold text-sm transition-colors flex items-center gap-1"
                                        >
                                            <Play className="w-3 h-3" /> Start
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStop(v.id); }}
                                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 rounded-md font-semibold text-sm transition-colors flex items-center gap-1"
                                        >
                                            <Square className="w-3 h-3 fill-current" /> Stop
                                        </button>
                                    )}
                                </div>
                            </div>

                            {v.status === 'running' && (
                                <div className="mt-4">
                                    <a
                                        href={`http://localhost:${v.port}`}
                                        target="_blank"
                                        className="block w-full text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Open Browser <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Menu Items Config
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
        { id: 'logs', label: 'Console Logs', icon: Terminal, color: 'text-green-500' },
        { id: 'explorer', label: 'File Explorer', icon: FolderOpen, color: 'text-yellow-500' },
        { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'
                }`}>
                {/* Logo */}
                <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900 dark:text-white text-sm">Lab Manager</h1>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Environment System</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                    )}

                    {isSidebarOpen && (
                        <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Menu */}
                <nav className="p-3 space-y-1 mt-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentPage(item.id as AdminPage)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all",
                                currentPage === item.id
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/20"
                                    : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                            title={!isSidebarOpen ? item.label : undefined}
                        >
                            <item.icon className={cn("w-5 h-5 flex-shrink-0", currentPage === item.id ? "text-white" : item.color)} />
                            {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* Toggle Sidebar (Mini) */}
                {!isSidebarOpen && (
                    <button onClick={() => setIsSidebarOpen(true)} className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 hover:bg-gray-800 rounded-lg">
                        <Menu className="w-5 h-5 text-gray-400" />
                    </button>
                )}
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 flex flex-col min-h-screen ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>

                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 px-6 flex items-center justify-between">

                    {/* Search */}
                    {/* User & Theme */}
                    <div className="flex items-center gap-4 ml-4">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
                        </button>

                        <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Lab Admin</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Super User</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                                LA
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Area */}
                <main className="flex-1 p-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                    <div className="flex items-center justify-between mb-6 animate-in slide-in-from-left-2 duration-300 shrink-0">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currentPage === 'dashboard' ? 'Overview' :
                                (currentPage === 'logs' || currentPage === 'explorer' || currentPage === 'git') ? 'Environment Details' : 'Settings'}
                        </h1>

                        {/* Environment Tabs */}
                        {(currentPage === 'logs' || currentPage === 'explorer' || currentPage === 'git') && (
                            <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                <button
                                    onClick={() => setCurrentPage('logs')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                        currentPage === 'logs'
                                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                                            : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                                    )}
                                >
                                    <Terminal className="w-4 h-4" />
                                    Terminal
                                </button>
                                <button
                                    onClick={() => setCurrentPage('explorer')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                        currentPage === 'explorer'
                                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                                            : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                                    )}
                                >
                                    <FolderOpen className="w-4 h-4" />
                                    Files
                                </button>
                                <button
                                    onClick={() => setCurrentPage('git')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                        currentPage === 'git'
                                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                                            : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                                    )}
                                >
                                    <GitBranch className="w-4 h-4" />
                                    Source Control
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {currentPage === 'dashboard' && <div className="h-full overflow-y-auto pr-2">{renderDashboard()}</div>}
                        {currentPage === 'logs' && renderLogs()}
                        {currentPage === 'explorer' && renderExplorer()}
                        {currentPage === 'git' && <div className="h-full animate-in fade-in duration-300"><GitControl versionId={selectedVersion} /></div>}
                        {currentPage === 'settings' && <div className="text-slate-500">Settings implementation pending...</div>}
                    </div>
                </main>

            </div>
        </div>
    );
}

export default App;
