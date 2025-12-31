import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { SystemBrowser } from './SystemBrowser';
import {
    Cloud, Upload, Download, Trash2, RefreshCw, HardDrive,
    File, Folder, Clock, Check, AlertCircle, Search, Grid, List,
    FileArchive, ArrowUpFromLine, Plus
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Backup {
    key: string;
    size: number;
    lastModified: string;
    versionId: string;
    etag: string;
}

interface CloudBackupProps {
    versionId: string | null;
    versions: any[];
}

const API_URL = 'http://localhost:3000';

export const CloudBackup: React.FC<CloudBackupProps> = ({ versionId, versions }) => {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [storageInfo, setStorageInfo] = useState({ used: 0, total: 25000 }); // Default 25GB for Vultr Object Storage
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'backups' | 'uploads'>('all');
    const [showSystemBrowser, setShowSystemBrowser] = useState(false);

    useEffect(() => {
        checkConnection();
        loadBackups();
    }, [versionId]);

    const checkConnection = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/cloud/status`);
            setConnected(res.data.connected);
        } catch (err) {
            setConnected(false);
        }
    };

    const loadBackups = async () => {
        setLoading(true);
        try {
            // If version selected, we could filter by version, but User wants "Google Drive" experience
            // So we list ALL files and let sidebar/filter handle view
            // Actually, let's list all if no version selected, or just version if selected?
            // User query: "Subir archivos desde mi PC... subir zips... poder elegir documentos en nube"
            // Suggests global view is better.

            const endpoint = versionId
                ? `${API_URL}/api/cloud/list/${versionId}`
                : `${API_URL}/api/cloud/list`;

            const res = await axios.get(endpoint);
            setBackups(res.data);

            // Calculate storage
            const totalSize = res.data.reduce((acc: number, b: Backup) => acc + b.size, 0);
            setStorageInfo(prev => ({ ...prev, used: totalSize / (1024 * 1024) }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Generic file upload
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);
        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                await axios.post(`${API_URL}/api/cloud/upload`, formData);
            } catch (err: any) {
                console.error(`Failed to upload ${file.name}`, err);
                alert(`Failed to upload ${file.name}`);
            }
        }
        setUploading(false);
        loadBackups();
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    // Handle System Browser Upload (Server-Side)
    const handleSystemUpload = async (sourcePath: string) => {
        setUploading(true);
        setShowSystemBrowser(false);
        try {
            alert(`Started background upload for ${sourcePath}`);
            await axios.post(`${API_URL}/api/cloud/transfer`, { sourcePath });
            loadBackups();
            alert('✅ Upload saved to Cloud successfully');
        } catch (err: any) {
            alert('System Upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    // Version-specific Backup (if version selected)

    // Version-specific Backup (if version selected)
    const handleCreateVersionBackup = async () => {
        if (!versionId) return;
        setUploading(true);
        try {
            await axios.post(`${API_URL}/api/cloud/backup/${versionId}`);
            loadBackups();
            alert('✅ Backup created successfully');
        } catch (err: any) {
            alert('Backup failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    // Import ZIP to Workspace
    const handleImportToWorkspace = async (key: string) => {
        if (!confirm(`Import "${key}" to your local workspace? This will create a new project.`)) return;

        try {
            const res = await axios.post(`${API_URL}/api/cloud/import`, { key });
            alert(`✅ Project imported as "${res.data.versionId}"`);
            // Trigger global refresh? App.tsx handles socket 'ZIP_RESTORED'/'state-update' events, so it should auto refresh sidebar
        } catch (err: any) {
            alert('Import failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (backupKey: string) => {
        if (!confirm('Delete this file permanently from Cloud?')) return;

        try {
            await axios.delete(`${API_URL}/api/cloud/delete`, {
                data: { backupKey }
            });
            loadBackups();
        } catch (err: any) {
            alert('Delete failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const filteredBackups = backups.filter(b => {
        const matchesSearch = b.key.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        if (filter === 'uploads') return b.key.includes('uploads/');
        if (filter === 'backups') return !b.key.includes('uploads/');
        return true;
    });

    const storagePercent = Math.min((storageInfo.used / storageInfo.total) * 100, 100);

    return (
        <div className="flex h-full bg-white dark:bg-slate-900 overflow-hidden relative">
            {showSystemBrowser && (
                <SystemBrowser
                    onUpload={handleSystemUpload}
                    onClose={() => setShowSystemBrowser(false)}
                />
            )}
            {/* Sidebar / Filter Panel */}
            <div className="w-64 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                <div className="p-4">
                    <button
                        {...getRootProps()}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        <input {...getInputProps()} />
                        <Plus className="w-5 h-5" />
                        <span className="text-sm">New Upload</span>
                    </button>

                    <button
                        onClick={() => setShowSystemBrowser(true)}
                        className="mt-2 w-full py-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl font-medium text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-colors flex items-center justify-center gap-2"
                    >
                        <HardDrive className="w-4 h-4" />
                        Browse PC System
                    </button>
                    {versionId && (
                        <button
                            onClick={handleCreateVersionBackup}
                            disabled={uploading}
                            className="mt-3 w-full py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Cloud className="w-4 h-4" />
                            Backup Current
                        </button>
                    )}
                </div>

                <nav className="flex-1 px-2 space-y-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                    >
                        <HardDrive className="w-4 h-4" /> All Files
                    </button>
                    <button
                        onClick={() => setFilter('uploads')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'uploads' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                    >
                        <Upload className="w-4 h-4" /> Uploads
                    </button>
                    <button
                        onClick={() => setFilter('backups')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'backups' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                    >
                        <Cloud className="w-4 h-4" /> Lab Backups
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Storage Used</span>
                        <span className="text-xs text-gray-400">{storageInfo.used.toFixed(1)}MB / 25GB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${storagePercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col">
                {/* Header Actions */}
                <div className="h-16 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-4 text-gray-400">
                        <Search className="w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search in Cloud..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 w-64"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-400'}`}><Grid className="w-4 h-4" /></button>
                        </div>
                        <button onClick={loadBackups} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
                    </div>
                </div>

                {isDragActive && (
                    <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-blue-500 border-dashed m-4 rounded-xl">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl flex flex-col items-center">
                            <Upload className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Drop files to upload to Cloud</h3>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {filteredBackups.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Cloud className="w-24 h-24 mb-6 opacity-20" />
                            <h3 className="text-xl font-semibold mb-2">Drive is empty</h3>
                            <p className="text-sm">Drag and drop files here or use the "New Upload" button</p>
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredBackups.map(item => (
                                    <div key={item.key} className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-4 transition-all hover:shadow-lg relative">
                                        <div className="aspect-square bg-gray-50 dark:bg-slate-900 rounded-lg mb-3 flex items-center justify-center text-gray-300 dark:text-slate-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors">
                                            {item.key.endsWith('.zip') ? <FileArchive className="w-12 h-12" /> : <File className="w-12 h-12" />}
                                        </div>
                                        <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm mb-1" title={item.key}>{item.key.split('/').pop()}</h4>
                                        <p className="text-xs text-gray-500 mb-4">{formatSize(item.size)}</p>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 right-4 bg-white dark:bg-slate-800 shadow-lg p-1 rounded-lg border border-gray-100 dark:border-slate-700">
                                            {item.key.endsWith('.zip') && (
                                                <button onClick={() => handleImportToWorkspace(item.key)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 rounded" title="Import to Workspace">
                                                    <ArrowUpFromLine className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(item.key)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Size</th>
                                        <th className="px-6 py-3">Modified</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {filteredBackups.map(item => (
                                        <tr key={item.key} className="bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 group">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                                {item.key.endsWith('.zip') ? <FileArchive className="w-4 h-4 text-orange-500" /> : <File className="w-4 h-4 text-blue-500" />}
                                                {item.key.split('/').pop()}
                                            </td>
                                            <td className="px-6 py-4">{formatSize(item.size)}</td>
                                            <td className="px-6 py-4">{new Date(item.lastModified).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                                                    {item.key.endsWith('.zip') && (
                                                        <button onClick={() => handleImportToWorkspace(item.key)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 rounded">
                                                            Import
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(item.key)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
