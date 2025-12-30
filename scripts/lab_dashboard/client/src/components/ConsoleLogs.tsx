import { useRef, useEffect } from 'react';
import { Terminal, RefreshCw } from 'lucide-react';
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

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

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
