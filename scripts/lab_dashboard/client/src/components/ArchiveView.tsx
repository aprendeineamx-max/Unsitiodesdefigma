import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderOpen, Archive as ArchiveIcon, LayoutGrid, List, RefreshCw as RefreshCwIcon } from 'lucide-react';

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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() =>
        (localStorage.getItem('archive-view-mode') as 'grid' | 'list') || 'grid'
    );

    useEffect(() => {
        localStorage.setItem('archive-view-mode', viewMode);
    }, [viewMode]);

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
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={loadArchives}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                            <RefreshCwIcon className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
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
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {archives.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg group-hover:scale-110 transition-transform">
                                                <FolderOpen className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                                            </div>
                                            <button
                                                onClick={() => handleUnarchive(item.id)}
                                                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition-colors"
                                                title="Restore"
                                            >
                                                <ArchiveIcon className="w-5 h-5 rotate-180" />
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 truncate" title={item.id}>{item.id}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Archived: {new Date(item.archivedAt || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Name</th>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Archived Date</th>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {archives.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                    <FolderOpen className="w-4 h-4 text-cyan-500" />
                                                    {item.id}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                    {new Date(item.archivedAt || Date.now()).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleUnarchive(item.id)}
                                                        className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 rounded-md text-xs font-semibold hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors"
                                                    >
                                                        Restore
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
