import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Cloud, Upload, Download, Trash2, RefreshCw, HardDrive,
    File, Folder, Clock, Check, AlertCircle, Search, Grid, List
} from 'lucide-react';

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

export const CloudBackup: React.FC<CloudBackupProps> = ({ versionId, versions }) => {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [storageInfo, setStorageInfo] = useState({ used: 0, total: 1000 });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [selectedBackups, setSelectedBackups] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        checkConnection();
        if (versionId) loadBackups();
    }, [versionId]);

    const checkConnection = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/cloud/status');
            setConnected(res.data.connected);
        } catch (err) {
            setConnected(false);
        }
    };

    const loadBackups = async () => {
        if (!versionId) return;
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/api/cloud/list/${versionId}`);
            setBackups(res.data);

            // Calculate storage
            const totalSize = res.data.reduce((acc: number, b: Backup) => acc + b.size, 0);
            setStorageInfo({ used: totalSize / (1024 * 1024), total: 1000 });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        if (!versionId) return;
        setUploading(true);
        try {
            await axios.post(`http://localhost:3000/api/cloud/backup/${versionId}`);
            loadBackups();
        } catch (err: any) {
            alert('Backup failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleRestore = async (backupKey: string) => {
        if (!confirm('Restore this backup? Current version will be replaced.')) return;

        try {
            await axios.post('http://localhost:3000/api/cloud/restore', {
                backupKey,
                targetName: `${versionId}_restored_${Date.now()}`
            });
            alert('Backup restored successfully!');
        } catch (err: any) {
            alert('Restore failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (backupKey: string) => {
        if (!confirm('Delete this backup permanently?')) return;

        try {
            await axios.delete('http://localhost:3000/api/cloud/delete', {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const filteredBackups = backups.filter(b =>
        b.key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const storagePercent = (storageInfo.used / storageInfo.total) * 100;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <Cloud className={`${connected ? 'text-green-500' : 'text-red-500'}`} size={24} />
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Vultr Cloud Storage</h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                            {connected ? '✅ Connected' : '❌ Disconnected'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadBackups}
                        disabled={!versionId}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <RefreshCw size={18} className="text-gray-600 dark:text-slate-400" />
                    </button>
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
                    </button>
                </div>
            </div>

            {/* Storage Bar */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <HardDrive size={16} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Storage Usage</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                        {storageInfo.used.toFixed(2)} MB / {storageInfo.total} MB
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${storagePercent}%` }}
                    />
                </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                <button
                    onClick={handleBackup}
                    disabled={!versionId || uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                    {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                    {uploading ? 'Uploading...' : 'Create Backup'}
                </button>

                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search backups..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Backups List */}
            <div className="flex-1 overflow-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <RefreshCw className="animate-spin text-purple-600" size={32} />
                    </div>
                ) : filteredBackups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500">
                        <Cloud size={64} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No backups yet</p>
                        <p className="text-sm">Create your first backup to get started</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}>
                        {filteredBackups.map((backup) => (
                            <div
                                key={backup.key}
                                className={`
                                    ${viewMode === 'grid' ? 'p-4' : 'p-3'}
                                    bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                                    rounded-lg hover:shadow-md transition-shadow
                                `}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <File className="text-purple-600 dark:text-purple-400" size={20} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {backup.key.split('/').pop()}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-1">
                                                <Clock size={12} />
                                                {formatDate(backup.lastModified)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
                                        {formatSize(backup.size)}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleRestore(backup.key)}
                                            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600 dark:text-green-400"
                                            title="Restore"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(backup.key)}
                                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
