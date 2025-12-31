import { useState, useEffect } from 'react';
import axios from 'axios';
import { RotateCcw, Trash as TrashIcon, AlertTriangle, LayoutGrid, List } from 'lucide-react';

const API_URL = 'http://localhost:3000';

interface TrashedZip {
    id: string;
}

interface TrashViewProps {
    lastUpdate?: number;
}

export function TrashView({ lastUpdate }: TrashViewProps) {
    const [trashedZips, setTrashedZips] = useState<TrashedZip[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() =>
        (localStorage.getItem('trash-view-mode') as 'grid' | 'list') || 'grid'
    );

    useEffect(() => {
        localStorage.setItem('trash-view-mode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        loadTrashedZips();
    }, [lastUpdate]);

    const loadTrashedZips = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/trash/list`);
            setTrashedZips(res.data);
        } catch (err) {
            console.error('Failed to load trash:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id: string) => {
        if (!confirm(`Restore ${id} from Trash?`)) return;
        try {
            await axios.post(`${API_URL}/api/trash/restore`, { version: id });
            loadTrashedZips();
        } catch (err: any) {
            console.error('Failed to restore:', err);
            alert('Restore failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleEmptyTrash = async () => {
        if (!confirm('⚠️ Empty trash? This will PERMANENTLY delete all trashed ZIPs!')) return;
        if (!confirm('Are you absolutely sure? This cannot be undone!')) return;
        try {
            await axios.post(`${API_URL}/api/trash/empty`);
            setTrashedZips([]);
        } catch (err: any) {
            console.error('Failed to empty trash:', err);
            alert('Failed to empty trash: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrashIcon className="w-6 h-6 text-yellow-500" />
                        Trash
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {trashedZips.length} item{trashedZips.length !== 1 ? 's' : ''} in trash
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-yellow-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-200'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-yellow-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-200'}`}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    {trashedZips.length > 0 && (
                        <button
                            onClick={handleEmptyTrash}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Empty Trash ({trashedZips.length})
                        </button>
                    )}
                </div>
            </div>

            {trashedZips.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <TrashIcon className="w-20 h-20 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Trash is empty</p>
                    <p className="text-sm mt-2">Deleted ZIPs will appear here</p>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {trashedZips.map(zip => (
                                <div
                                    key={zip.id}
                                    className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate" title={zip.id}>{zip.id}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Trashed ZIP</p>
                                        </div>
                                        <TrashIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                    </div>
                                    <button
                                        onClick={() => handleRestore(zip.id)}
                                        className="w-full px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Restore
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-slate-200">Name</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-slate-200 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {trashedZips.map((zip) => (
                                        <tr key={zip.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                                <TrashIcon className="w-4 h-4 text-yellow-500" />
                                                {zip.id}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleRestore(zip.id)}
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
    );
}
