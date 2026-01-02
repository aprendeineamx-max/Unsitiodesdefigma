import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { X, Terminal, Activity, Zap, ZapOff } from 'lucide-react';

interface LogEntry {
    timestamp: string;
    service: string;
    message: string;
    type: 'info' | 'error' | 'warn' | 'success';
}

export const SystemOps: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [nativeEnabled, setNativeEnabled] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch Initial Config
        axios.get('/api/cloud/settings/mount')
            .then(res => setNativeEnabled(res.data.useNativeMount))
            .catch(console.error);

        // Connect Sync Stream
        const newSocket = io('/', { path: '/socket.io' });

        newSocket.on('connect', () => {
            setLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                service: 'system',
                message: 'Connected to System Ops Stream',
                type: 'success'
            }]);
        });

        newSocket.on('sys:log', (entry: LogEntry) => {
            setLogs(prev => [...prev, entry].slice(-100));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const toggleNative = async () => {
        try {
            const newVal = !nativeEnabled;
            // Optimistic update
            setNativeEnabled(newVal);
            setLogs(p => [...p, {
                timestamp: new Date().toISOString(),
                service: 'ui',
                message: `Switching Native Mount: ${newVal ? 'ON' : 'OFF'}...`,
                type: 'info'
            }]);

            const res = await axios.post('/api/cloud/settings/mount', { enabled: newVal });

            if (res.data.success) {
                setLogs(p => [...p, {
                    timestamp: new Date().toISOString(),
                    service: 'system',
                    message: `Native Mount is now ${newVal ? 'ACTIVE' : 'DISABLED'}`,
                    type: newVal ? 'success' : 'warn'
                }]);
            }
        } catch (err: any) {
            setNativeEnabled(!nativeEnabled); // Revert
            setLogs(p => [...p, {
                timestamp: new Date().toISOString(),
                service: 'error',
                message: `Failed to toggle: ${err.message}`,
                type: 'error'
            }]);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-[500px] h-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden z-[100] font-mono text-xs">
            {/* Header */}
            <div className="bg-slate-800 p-2 flex items-center justify-between border-b border-slate-700 handle cursor-move select-none">
                <div className="flex items-center gap-2 text-slate-200">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="font-bold">System Ops Console (V11)</span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Native Mount Toggle */}
                    <button
                        onClick={toggleNative}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${nativeEnabled
                            ? 'bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50'
                            : 'bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50'
                            }`}
                        title={nativeEnabled ? "Using Rclone Native Mount" : "Using Legacy S3 API"}
                    >
                        {nativeEnabled ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
                        <span className="font-bold">{nativeEnabled ? 'NATIVE' : 'LEGACY'}</span>
                    </button>

                    <div className="w-px h-4 bg-slate-700 mx-1"></div>

                    <button onClick={() => setLogs([])} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Clear Logs">
                        <Activity className="w-3 h-3" />
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400" title="Close">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Build Info Panel */}
            <div className="bg-slate-800/50 p-3 border-b border-slate-700">
                <div className="bg-slate-900 border border-slate-700 rounded p-2 text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 uppercase tracking-widest font-bold">Build Information</span>
                        <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            <span className="text-green-400 font-bold">LIVE</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-0.5 text-slate-300">
                        <span className="text-slate-500">VERSION</span>
                        <span className="font-mono text-blue-400">v11.2.0 (Stable)</span>

                        <span className="text-slate-500">DATE</span>
                        <span className="font-mono text-purple-300">
                            {new Date().toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>

                        <span className="text-slate-500">COMMIT</span>
                        <span className="font-mono text-amber-400 flex items-center gap-1">
                            31e377b7
                            <span className="text-slate-600 px-1 bg-slate-800 rounded text-[9px]">LATEST</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Logs Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 bg-black/50 font-mono scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                        <Activity className="w-8 h-8 opacity-20" />
                        <span className="italic">Waiting for system logs...</span>
                    </div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2 break-all leading-tight hover:bg-slate-900/50 px-1 -mx-1 rounded">
                        <span className="text-slate-600 shrink-0 select-none">
                            {log.timestamp.split('T')[1].split('.')[0]}
                        </span>
                        <div className={`flex-1 ${log.type === 'error' ? 'text-red-400' :
                            log.type === 'warn' ? 'text-amber-400' :
                                log.type === 'success' ? 'text-green-400' :
                                    'text-slate-300'
                            }`}>
                            <span className={`font-bold mr-2 px-1 rounded text-[10px] uppercase tracking-wider ${log.service === 'rclone' ? 'bg-blue-900/30 text-blue-300' :
                                log.service === 'ui' ? 'bg-purple-900/30 text-purple-300' :
                                    'bg-slate-800 text-slate-400'
                                }`}>
                                {log.service}
                            </span>
                            {log.message}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
