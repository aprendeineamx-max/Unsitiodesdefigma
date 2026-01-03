import React, { useState, useEffect } from 'react';
import { Activity, RefreshCcw, Server, History, X, ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';

interface DeployLog {
    timestamp: string;
    message: string;
}

interface BuildInfo {
    buildDate: string;
    commit: string;
    deployId: string;
}

const FloatingOps: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [minimized, setMinimized] = useState(true);
    const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
    const [deployHistory, setDeployHistory] = useState<DeployLog[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [purgingCloudflare, setPurgingCloudflare] = useState(false);

    useEffect(() => {
        // Fetch Static Build Info
        fetch('/version.json')
            .then(res => res.json())
            .then(data => setBuildInfo(data))
            .catch(() => console.log('No version.json found (Dev Mode?)'));
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await axios.get('/api/system/deploy-history');
            setDeployHistory(res.data);
        } catch (err) {
            console.error('Failed to load history', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleHardReload = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    registration.unregister();
                }
            });
        }
        caches.keys().then(names => {
            for (let name of names) caches.delete(name);
        });
        window.location.reload();
    };

    const handlePurgeCloudflare = async () => {
        if (!confirm('¿Purgar TODO el caché de Cloudflare? Esto forzará la descarga de TODOS los recursos estáticos.')) return;
        setPurgingCloudflare(true);
        try {
            const res = await axios.post('/api/cloudflare/purge');
            if (res.data.success) {
                alert('✅ Caché de Cloudflare purgado. Recargar la página en 3 segundos...');
                setTimeout(() => window.location.reload(), 3000);
            } else {
                alert('❌ Error: ' + (res.data.error || 'Unknown error'));
            }
        } catch (err: any) {
            alert('❌ Error al purgar Cloudflare: ' + (err.response?.data?.error || err.message));
        } finally {
            setPurgingCloudflare(false);
        }
    };

    const toggleOpen = () => {
        if (!isOpen) fetchHistory();
        setIsOpen(!isOpen);
        setMinimized(false);
    };

    if (minimized) {
        return (
            <button
                onClick={toggleOpen}
                className="fixed bottom-4 right-4 z-[9999] p-3 bg-slate-800 text-white rounded-full shadow-2xl hover:bg-slate-700 transition-all border border-slate-600"
                title="Ops & QA"
            >
                <Activity className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-[9999] w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden text-slate-200 font-sans text-xs">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span className="font-bold">System Ops</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setMinimized(true)} className="p-1 hover:bg-slate-700 rounded">
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    {isOpen ? (
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-700 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={() => setIsOpen(true)} className="p-1 hover:bg-slate-700 rounded">
                            <ChevronUp className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {isOpen && (
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {/* Build Info */}
                    <div className="space-y-1">
                        <p className="font-semibold text-slate-400">Current Build</p>
                        {buildInfo ? (
                            <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] text-green-400">
                                <p>Date: {buildInfo.buildDate}</p>
                                <p>Commit: {buildInfo.commit}</p>
                                <p>ID: {buildInfo.deployId}</p>
                            </div>
                        ) : (
                            <div className="bg-amber-900/20 p-2 rounded border border-amber-800 text-amber-500">
                                No Version Info (Dev?)
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                        <button
                            onClick={handlePurgeCloudflare}
                            disabled={purgingCloudflare}
                            className="w-full py-2 bg-orange-900/30 hover:bg-orange-900/50 border border-orange-800 text-orange-200 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCcw className={`w-3 h-3 ${purgingCloudflare ? 'animate-spin' : ''}`} />
                            {purgingCloudflare ? 'Purgando...' : '🔥 Purge Cloudflare Cache'}
                        </button>
                        <button
                            onClick={handleHardReload}
                            className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-200 rounded flex items-center justify-center gap-2 transition-colors"
                        >
                            <RefreshCcw className="w-3 h-3" />
                            Hard Refresh (Clear Cache)
                        </button>
                    </div>

                    {/* Validations */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-400">Deploy History</p>
                            <button onClick={fetchHistory} className="text-[10px] hover:text-white">Refresh</button>
                        </div>

                        {loadingHistory ? (
                            <div className="text-center py-2 text-slate-500">Loading...</div>
                        ) : (
                            <div className="bg-slate-950 rounded border border-slate-800 overflow-hidden">
                                {deployHistory.length === 0 ? (
                                    <div className="p-2 text-center text-slate-600">No logs found</div>
                                ) : (
                                    deployHistory.slice(0, 5).map((log, i) => (
                                        <div key={i} className="p-2 border-b border-slate-900 last:border-0 hover:bg-slate-900/50">
                                            <p className="text-[10px] text-slate-500">{log.timestamp}</p>
                                            <p className="text-slate-300 truncate" title={log.message}>{log.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingOps;
