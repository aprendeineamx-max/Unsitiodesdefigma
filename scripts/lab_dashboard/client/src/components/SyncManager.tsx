import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Plus, Trash2, Folder, Activity, CheckCircle, XCircle } from 'lucide-react';
import { SystemBrowser } from './SystemBrowser';

const API_URL = 'http://localhost:3000';

export const SyncManager: React.FC = () => {
    const [paths, setPaths] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [showBrowser, setShowBrowser] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadPaths();
    }, []);

    const loadPaths = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/sync`);
            setPaths(res.data);
        } catch (err) {
            console.error('Failed to load sync paths', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPath = async (path: string) => {
        setAdding(true);
        setShowBrowser(false);
        try {
            await axios.post(`${API_URL}/api/sync`, { path });
            loadPaths();
            alert(`✅ Now watching: ${path}`);
        } catch (err: any) {
            alert('Failed to add path: ' + (err.response?.data?.error || err.message));
        } finally {
            setAdding(false);
        }
    };

    const handleRemovePath = async (path: string) => {
        if (!confirm(`Stop syncing ${path}? Files already in cloud will remain.`)) return;
        try {
            await axios.delete(`${API_URL}/api/sync`, { data: { path } });
            loadPaths();
        } catch (err: any) {
            alert('Failed to remove path');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
            {showBrowser && (
                <SystemBrowser
                    onUpload={handleAddPath} // Reuse upload callback for "Select Folder" logic if possible? 
                    // Wait, SystemBrowser onUpload expects a FILE path usually.
                    // But we want a FOLDER. 
                    // SystemBrowser current logic might need adjustment or we just pick a file and strip filename?
                    // Actually SystemBrowser allows navigating. If I select a folder in it... 
                    // Current SystemBrowser only selects FILES.
                    // I might need to update SystemBrowser to allow folder selection or just pick any file in format "Backup C:/Folder".
                    // For now, let's assume user picks a file inside the folder they want? No that's bad UX.
                    // Let's UPDATE SystemBrowser to have a "Select Current Folder" button.
                    onClose={() => setShowBrowser(false)}
                />
            )}

            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Real-Time Sync Engine</h2>
                </div>
                <button
                    onClick={() => setShowBrowser(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Sync Folder
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">Loading...</div>
                ) : paths.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                        <Folder className="w-12 h-12 mb-2 opacity-50" />
                        <p>No folders are being watched.</p>
                        <p className="text-sm">Add a folder to start real-time backup.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {paths.map(path => (
                            <div key={path} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-mono text-sm text-gray-700 dark:text-gray-200">{path}</h3>
                                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <Activity className="w-3 h-3" /> Active / Watching
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemovePath(path)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-100 dark:border-yellow-900/30 text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Current Constraints:</strong> System Files (Windows, Program Files, AppData) are automatically ignored for safety. Large directories may take time to initial scan.
            </div>
        </div>
    );
};
