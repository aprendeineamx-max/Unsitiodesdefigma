import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderOpen, Archive as ArchiveIcon } from 'lucide-react';

const API_URL = 'http://localhost:3000';

interface ArchiveItem {
    id: string;
    path: string;
    archivedAt: string;
}

interface ArchiveViewProps {
    onRefresh?: () => void;
    lastUpdate?: number;
}

export function ArchiveView({ onRefresh, lastUpdate }: ArchiveViewProps) {
    const [archives, setArchives] = useState<ArchiveItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadArchives = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/archive/list`);
            setArchives(res.data);
        } catch (err) {
            console.error('Failed to load archives:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArchives();
    }, [lastUpdate]);

    const handleUnarchive = async (id: string) => {
        if (!confirm(`Restore ${id} from archive?`)) return;
        try {
            await axios.post(`${API_URL}/api/archive/restore`, { version: id });
            alert(`✅ ${id} restored from archive`);
            loadArchives();
            onRefresh?.();
        } catch (err: any) {
            console.error('Unarchive failed:', err);
            alert(`❌ Unarchive failed: ${err.response?.data?.error || err.message}`);
        }
    };

    return (
        <div className="h-full bg-white dark:bg-slate-900 p-6 overflow-auto animate-in fade-in duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <ArchiveIcon className="w-8 h-8 text-cyan-500" />
                            Archive
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-2">
                            Archived ZIP projects
                        </p>
                    </div>
                    <button
                        onClick={loadArchives}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors"
                    >
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 dark:text-slate-400 mt-4">Loading archives...</p>
                    </div>
                ) : archives.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <ArchiveIcon className="w-16 h-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Archived Projects</h3>
                        <p className="text-gray-500 dark:text-slate-400">Archived ZIPs will appear here</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {archives.map((item) => (
                            <div
                                key={item.id}
                                className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg">
                                            <FolderOpen className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.id}</h3>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                                Archived: {new Date(item.archivedAt || Date.now()).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnarchive(item.id)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
                                    >
                                        📤 Restore
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
