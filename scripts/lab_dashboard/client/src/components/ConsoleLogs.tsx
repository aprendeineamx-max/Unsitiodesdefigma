import { useRef, useEffect, useState } from 'react';
import { Terminal, RefreshCw, Trash2, Copy, Download, Search, Filter } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
    return twMerge(clsx(inputs));
}

interface Log {
    versionId: string;
    text: string;
    type: 'info' | 'error' | 'success' | 'warn';
    timestamp: string;
}

interface ConsoleLogsProps {
    logs: Log[];
    versionId: string | null;
    versions: any[];
    onSelectVersion: (id: string) => void;
}

export function ConsoleLogs({ logs, versionId, versions, onSelectVersion }: ConsoleLogsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [showTimestamps, setShowTimestamps] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'info' | 'error' | 'warn' | 'success'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Auto-scroll to bottom
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    const handleClearLogs = () => {
        if (confirm('Clear all logs?')) {
            // Would need to implement clear logs in parent
            alert('Clear logs functionality needs parent implementation');
        }
    };

    const handleCopyLogs = () => {
        const text = filteredLogs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.type.toUpperCase()}: ${l.text}`).join('\n');
        navigator.clipboard.writeText(text);
        alert('Logs copied to clipboard!');
    };

    const handleDownloadLogs = () => {
        const text = filteredLogs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.type.toUpperCase()}: ${l.text}`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredLogs = logs
        .filter(log => filterType === 'all' || log.type === filterType)
        .filter(log => searchTerm === '' || log.text.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-[calc(100vh-140px)] shadow-xl overflow-hidden">
            {/* Header / Toolbar */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-white font-mono text-sm">Terminal Output</span>
                    <span className="text-xs text-gray-500">({filteredLogs.length} logs)</span>
                </div>

                {/* Toolbar Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleClearLogs}
                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Clear logs"
                    >
                        <Trash2 className="w-3 h-3" />
                        Clear
                    </button>
                    <button
                        onClick={handleCopyLogs}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Copy logs"
                    >
                        <Copy className="w-3 h-3" />
                        Copy
                    </button>
                    <button
                        onClick={handleDownloadLogs}
                        className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Download logs"
                    >
                        <Download className="w-3 h-3" />
                        Download
                    </button>

                    {/* Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-2 py-1 bg-slate-700 text-white rounded text-xs border border-slate-600"
                    >
                        <option value="all">All Types</option>
                        <option value="info">Info</option>
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="success">Success</option>
                    </select>

                    {/* Toggles */}
                    <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showTimestamps}
                            onChange={e => setShowTimestamps(e.target.checked)}
                            className="w-3 h-3"
                        />
                        Time
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={e => setAutoScroll(e.target.checked)}
                            className="w-3 h-3"
                        />
                        Auto
                    </label>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b border-slate-800 bg-slate-950/30">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search logs..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Env Tabs */}
            <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/30 overflow-x-auto">
                <div className="flex items-center gap-1">
                    {versions.slice(0, 10).map(v => (
                        <button
                            key={v.id}
                            onClick={() => onSelectVersion(v.id)}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                                versionId === v.id
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            )}
                        >
                            {v.id}
                        </button>
                    ))}
                    {versions.length > 10 && (
                        <span className="text-xs text-gray-500 px-2">+{versions.length - 10} more</span>
                    )}
                </div>
            </div>

            {/* Logs Container */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-sm scroll-smooth"
            >
                {filteredLogs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <Terminal className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No logs to display</p>
                            {searchTerm && <p className="text-xs mt-1">Try different search terms</p>}
                        </div>
                    </div>
                ) : (
                    filteredLogs.map((log, idx) => (
                        <div
                            key={`${log.versionId}-${idx}`}
                            className={cn(
                                "px-3 py-1.5 rounded mb-1 border-l-2 flex gap-2",
                                log.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-300' :
                                    log.type === 'warn' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300' :
                                        log.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-300' :
                                            'bg-blue-500/10 border-blue-500 text-blue-200'
                            )}
                        >
                            {showTimestamps && (
                                <span className="text-gray-500 text-xs flex-shrink-0">
                                    [{new Date(log.timestamp).toLocaleTimeString()}]
                                </span>
                            )}
                            <span className="flex-1 whitespace-pre-wrap break-all">{log.text}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}


return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-[calc(100vh-140px)] shadow-xl overflow-hidden">
        {/* Header / Toolbar */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 gap-4">
            <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-green-400" />
                <span className="font-bold text-white font-mono text-sm hidden sm:inline">Terminal Output</span>
            </div>

            {/* Env Tabs */}
            <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                    {versions.map(v => (
                        <button
                            key={v.id}
                            onClick={() => onSelectVersion(v.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-xs font-mono transition-all border flex items-center gap-2",
                                versionId === v.id
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50"
                                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                            )}
                        >
                            <span className={cn("w-2 h-2 rounded-full", v.status === 'running' ? "bg-green-500 animate-pulse" : "bg-slate-600")} />
                            {v.id}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status Badge */}
            <div className="w-24 flex justify-end">
                {versionId && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Live
                    </div>
                )}
            </div>
        </div>

        {/* Logs Area */}
        <div
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 scrollbar-thin scrollbar-thumb-slate-700 bg-[#0c0c0c] select-text"
        >
            {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                    <Terminal className="w-8 h-8 opacity-20" />
                    <p>No active logs for this session.</p>
                    {!versionId && <p className="text-[10px]">Select an environment to filter.</p>}
                </div>
            ) : (
                logs.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/5 p-0.5 rounded group">
                        <span className="text-slate-600 select-none w-20 shrink-0 text-right group-hover:text-slate-500 transition-colors">
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        <span className={cn(
                            "break-all whitespace-pre-wrap",
                            log.type === 'error' ? "text-red-400 font-bold" :
                                log.type === 'success' ? "text-green-400 font-bold" :
                                    log.type === 'warn' ? "text-yellow-400" :
                                        "text-slate-300"
                        )}>
                            {log.text}
                        </span>
                    </div>
                ))
            )}
        </div>
    </div>
);
}
