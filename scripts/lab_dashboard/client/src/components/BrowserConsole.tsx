import { useEffect, useState, useRef } from 'react';
import { Copy, Trash2, Terminal } from 'lucide-react';

interface ConsoleLog {
    id: number;
    type: 'log' | 'error' | 'warn' | 'info';
    message: string;
    timestamp: string;
    stack?: string;
}

export function BrowserConsole() {
    const [logs, setLogs] = useState<ConsoleLog[]>([]);
    const [copied, setCopied] = useState(false);
    const consoleEndRef = useRef<HTMLDivElement>(null);
    let logId = useRef(0);

    useEffect(() => {
        // Save original console methods
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        const addLog = (type: ConsoleLog['type'], args: any[]) => {
            const message = args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch {
                        return String(arg);
                    }
                }
                return String(arg);
            }).join(' ');

            const newLog: ConsoleLog = {
                id: logId.current++,
                type,
                message,
                timestamp: new Date().toLocaleTimeString(),
                stack: type === 'error' ? new Error().stack : undefined
            };

            setLogs(prev => [...prev, newLog]);
        };

        // Override console methods
        console.log = (...args: any[]) => {
            originalLog(...args);
            addLog('log', args);
        };

        console.error = (...args: any[]) => {
            originalError(...args);
            addLog('error', args);
        };

        console.warn = (...args: any[]) => {
            originalWarn(...args);
            addLog('warn', args);
        };

        console.info = (...args: any[]) => {
            originalInfo(...args);
            addLog('info', args);
        };

        // Capture unhandled errors
        const errorHandler = (event: ErrorEvent) => {
            addLog('error', [`${event.message} at ${event.filename}:${event.lineno}:${event.colno}`]);
        };

        window.addEventListener('error', errorHandler);

        // Cleanup
        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
            console.info = originalInfo;
            window.removeEventListener('error', errorHandler);
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleCopy = () => {
        const text = logs.map(log => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        setLogs([]);
    };

    const getLogColor = (type: ConsoleLog['type']) => {
        switch (type) {
            case 'error': return 'text-red-400 bg-red-500/10 border-l-2 border-red-500';
            case 'warn': return 'text-yellow-400 bg-yellow-500/10 border-l-2 border-yellow-500';
            case 'info': return 'text-blue-400 bg-blue-500/10 border-l-2 border-blue-500';
            default: return 'text-gray-300 bg-gray-500/10 border-l-2 border-gray-500';
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-white">Browser Console</h3>
                    <span className="text-xs text-gray-400">({logs.length} logs)</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy All'}
                    </button>
                    <button
                        onClick={handleClear}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear
                    </button>
                </div>
            </div>

            {/* Console Output */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2">
                {logs.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No console output yet...
                    </div>
                ) : (
                    logs.map(log => (
                        <div
                            key={log.id}
                            className={`p-2 rounded ${getLogColor(log.type)}`}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-xs text-gray-500 shrink-0">{log.timestamp}</span>
                                <span className="text-xs font-bold shrink-0">[{log.type.toUpperCase()}]</span>
                                <pre className="whitespace-pre-wrap break-words flex-1">{log.message}</pre>
                            </div>
                            {log.stack && (
                                <pre className="text-xs text-gray-500 mt-1 ml-20 whitespace-pre-wrap">{log.stack}</pre>
                            )}
                        </div>
                    ))
                )}
                <div ref={consoleEndRef} />
            </div>
        </div>
    );
}
