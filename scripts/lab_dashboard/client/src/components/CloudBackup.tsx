import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { SystemBrowser } from './SystemBrowser';
import { SyncManager } from './SyncManager';
import {
    Cloud, Upload, Download, Trash2, RefreshCw, HardDrive,
    File as FileIcon, Folder as FolderIcon, Clock, Check, AlertCircle, Search, Grid, List,
    FileArchive, ArrowUpFromLine, Plus, Activity, Square, X, Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Backup {
    key: string;
    size: number;
    lastModified: string;
    versionId: string;
    etag: string;
}

interface BackupJob {
    jobId: string;
    target: string;
    filesUploaded: number;
    bytesUploaded: number;
    currentFile: string;
    status: 'running' | 'completed' | 'error' | 'canceled';
    error?: string;
}

interface PendingJob {
    jobId: string;
    sourcePath: string;
    targetPrefix: string;
    startedAt: string;
    lastActivity: string;
    status: string;
    progress: {
        filesUploaded: number;
        bytesUploaded: number;
    };
    uploadedKeys: string[];
}

// NEW: Tree-based navigation types
interface TreeFolder {
    key: string;
    name: string;
    type: 'folder';
    isLoading: boolean;
}

interface TreeFile {
    key: string;
    name: string;
    size: number;
    lastModified: string;
    type: 'file';
    etag: string;
}

interface TreeData {
    prefix: string;
    folders: TreeFolder[];
    files: TreeFile[];
    cacheStatus: {
        isLoading: boolean;
        isReady: boolean;
        totalFiles: number | null;
    };
}

interface CloudBackupProps {
    versionId: string | null;
    versions: any[];
}

const API_URL = '';

export const CloudBackup: React.FC<CloudBackupProps> = ({ versionId, versions }) => {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [storageInfo, setStorageInfo] = useState({ used: 0, total: 1000000 });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'backups' | 'uploads'>('all');
    const [browserMode, setBrowserMode] = useState<'file' | 'folder'>('file');
    const [showSystemBrowser, setShowSystemBrowser] = useState(false);
    const [activeTab, setActiveTab] = useState<'drive' | 'sync'>('drive');
    const [snapshot, setSnapshot] = useState<{ id: string; path: string } | null>(null);
    const [mirrorMode, setMirrorMode] = useState(false);
    const [activeJobs, setActiveJobs] = useState<BackupJob[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [panelMinimized, setPanelMinimized] = useState(false);
    const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
    const [showResumeBar, setShowResumeBar] = useState(true);
    const [currentPath, setCurrentPath] = useState<string>(''); // For folder navigation

    // NEW: Progressive loading states
    const [treeData, setTreeData] = useState<TreeData | null>(null);
    const [cacheReady, setCacheReady] = useState(false);
    const [useTreeMode, setUseTreeMode] = useState(true); // Use fast tree mode by default

    // Initialize Socket
    useEffect(() => {
        const newSocket = io(window.location.origin);
        setSocket(newSocket);
        newSocket.on('connect', () => console.log('[CloudBackup] Socket connected'));
        return () => { newSocket.disconnect(); };
    }, []);

    // Socket: Multi-Job Events
    useEffect(() => {
        if (!socket) return;

        const onProgress = (stats: any) => {
            setActiveJobs(prev => {
                const existing = prev.find(j => j.jobId === stats.jobId);
                if (existing) {
                    return prev.map(j => j.jobId === stats.jobId ? { ...j, ...stats, status: 'running' } : j);
                }
                return [...prev, { ...stats, status: 'running', target: stats.jobId?.slice(0, 8) || 'Job' }];
            });
        };

        const onComplete = (stats: any) => {
            setActiveJobs(prev => prev.map(j => j.jobId === stats.jobId ? { ...j, ...stats, status: 'completed' } : j));
            setTimeout(() => {
                setActiveJobs(prev => prev.filter(j => j.jobId !== stats.jobId));
                loadTreeData(currentPath); // Reload current tree level
            }, 5000);
        };

        const onError = (data: any) => {
            setActiveJobs(prev => prev.map(j => j.jobId === data.jobId ? { ...j, status: 'error', error: data.error } : j));
        };

        const onCanceled = (data: any) => {
            setActiveJobs(prev => prev.filter(j => j.jobId !== data.jobId));
        };

        // Real-time file list updates
        const onFileUploaded = (fileInfo: any) => {
            // Also update tree data if in current path
            if (treeData && fileInfo.key.startsWith(currentPath)) {
                const fileName = fileInfo.key.replace(currentPath, '').split('/')[0];
                if (!fileName.includes('/')) { // It's a file in current level
                    setTreeData(prev => prev ? {
                        ...prev,
                        files: [{
                            key: fileInfo.key,
                            name: fileName,
                            size: fileInfo.size,
                            lastModified: fileInfo.lastModified,
                            type: 'file',
                            etag: ''
                        }, ...prev.files]
                    } : prev);
                }
            }
            // Update storage info
            setStorageInfo(prev => ({
                ...prev,
                used: prev.used + (fileInfo.size / (1024 * 1024))
            }));
        };

        // NEW: Cache ready event - full scan completed in background
        const onCacheReady = (data: { totalFiles: number }) => {
            console.log(`[CloudBackup] Full cache ready: ${data.totalFiles} files`);
            setCacheReady(true);
            // Reload tree data to update folder loading indicators
            loadTreeData(currentPath);
        };

        socket.on('backup:progress', onProgress);
        socket.on('backup:complete', onComplete);
        socket.on('backup:error', onError);
        socket.on('backup:canceled', onCanceled);
        socket.on('file:uploaded', onFileUploaded);
        socket.on('cache:ready', onCacheReady);

        return () => {
            socket.off('backup:progress', onProgress);
            socket.off('backup:complete', onComplete);
            socket.off('backup:error', onError);
            socket.off('backup:canceled', onCanceled);
            socket.off('file:uploaded', onFileUploaded);
            socket.off('cache:ready', onCacheReady);
        };
    }, [socket, currentPath, treeData]);

    // Load tree data when path changes
    useEffect(() => {
        checkConnection();
        loadTreeData(currentPath);
        loadPendingJobs();
    }, [versionId, currentPath]);

    const loadPendingJobs = async () => {
        try {
            const res = await axios.get('/api/cloud/jobs/pending');
            setPendingJobs(res.data);
            if (res.data.length > 0) setShowResumeBar(true);
        } catch (err) {
            console.error('Failed to load pending jobs', err);
        }
    };

    const handleResumeJob = async (jobId: string) => {
        try {
            const res = await axios.post('/api/cloud/jobs/resume', { jobId });
            if (res.data.success) {
                setPendingJobs(prev => prev.filter(j => j.jobId !== jobId));
                setActiveJobs(prev => [...prev, {
                    jobId: jobId,
                    target: res.data.target || 'Resuming...',
                    filesUploaded: res.data.alreadyUploaded || 0,
                    bytesUploaded: 0,
                    currentFile: 'Resuming...',
                    status: 'running'
                }]);
            }
        } catch (err: any) {
            alert('Resume failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDismissPendingJob = async (jobId: string) => {
        try {
            await axios.delete(`/api/cloud/jobs/${jobId}`);
            setPendingJobs(prev => prev.filter(j => j.jobId !== jobId));
        } catch (err) {
            console.error('Failed to dismiss job', err);
        }
    };

    const checkConnection = async () => {
        try {
            const res = await axios.get('/api/cloud/status');
            setConnected(res.data.connected);
        } catch { setConnected(false); }
    };

    // NEW: Fast tree loading - loads only one level at a time using S3 Delimiter
    const loadTreeData = async (prefix: string = '') => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/cloud/list/tree?prefix=${encodeURIComponent(prefix)}`);
            setTreeData(res.data);
            setCacheReady(res.data.cacheStatus?.isReady || false);

            // Calculate storage from files in current view (rough estimate)
            const totalSize = res.data.files.reduce((acc: number, f: TreeFile) => acc + f.size, 0);
            setStorageInfo(prev => ({ ...prev, used: totalSize / (1024 * 1024) }));
        } catch (err) {
            console.error('Failed to load tree data', err);
        }
        finally { setLoading(false); }
    };

    // Navigate into a folder
    const navigateToFolder = (folderKey: string) => {
        setCurrentPath(folderKey);
    };

    // Navigate up one level
    const navigateUp = () => {
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        setCurrentPath(parts.length > 0 ? parts.join('/') + '/' : '');
    };

    // Get breadcrumb path segments
    const getBreadcrumbs = () => {
        if (!currentPath) return [];
        const parts = currentPath.split('/').filter(Boolean);
        return parts.map((part, index) => ({
            name: part,
            path: parts.slice(0, index + 1).join('/') + '/'
        }));
    };

    // OLD: Load all backups (for backward compatibility, unused in tree mode)
    const loadBackups = async () => {
        setLoading(true);
        try {
            const endpoint = versionId ? `/api/cloud/list/${versionId}` : '/api/cloud/list';

            // For the general list, handle paginated response
            if (!versionId) {
                let allFiles: Backup[] = [];
                let page = 1;
                let hasMore = true;

                // Load all pages (with high pageSize to minimize requests)
                while (hasMore) {
                    const res = await axios.get(`${endpoint}?page=${page}&pageSize=1000`);

                    // Handle new paginated response format
                    if (res.data.files) {
                        allFiles = allFiles.concat(res.data.files);
                        hasMore = res.data.pagination?.hasMore || false;
                        page++;
                    } else {
                        // Fallback for old format (array directly)
                        allFiles = res.data;
                        hasMore = false;
                    }
                }

                setBackups(allFiles);
                const totalSize = allFiles.reduce((acc: number, b: Backup) => acc + b.size, 0);
                setStorageInfo(prev => ({ ...prev, used: totalSize / (1024 * 1024) }));
            } else {
                // For version-specific list, keep old behavior
                const res = await axios.get(endpoint);
                const files = res.data.files || res.data; // Handle both formats
                setBackups(files);
                const totalSize = files.reduce((acc: number, b: Backup) => acc + b.size, 0);
                setStorageInfo(prev => ({ ...prev, used: totalSize / (1024 * 1024) }));
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);
        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            try { await axios.post('/api/cloud/upload', formData); }
            catch (err: any) { console.error(`Failed to upload ${file.name}`, err); alert(`Failed: ${file.name}`); }
        }
        setUploading(false);
        loadBackups();
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    // VSS Handlers
    const handleCreateSnapshot = async () => {
        try {
            setLoading(true);
            const res = await axios.post('/api/system/snapshot/create');
            setSnapshot(res.data.snapshot);
            alert('✅ System Snapshot Created!');
        } catch (err: any) { alert('Snapshot failed: ' + (err.response?.data?.error || err.message)); }
        finally { setLoading(false); }
    };

    const handleDeleteSnapshot = async () => {
        if (!snapshot) return;
        try {
            setLoading(true);
            await axios.post('/api/system/snapshot/delete', { id: snapshot.id });
            setSnapshot(null);
            alert('Snapshot Deleted');
        } catch (err: any) { alert('Delete failed: ' + (err.response?.data?.error || err.message)); }
        finally { setLoading(false); }
    };

    // Mirror Functions
    const handleFullMirror = async () => {
        if (!snapshot) { alert('Please create a VSS Snapshot first.'); return; }
        if (!confirm('WARNING: Upload entire C: Drive?')) return;
        try {
            const res = await axios.post('/api/cloud/mirror', { sourcePath: snapshot.path, snapshotMode: true });
            setActiveJobs(prev => [...prev, { jobId: res.data.jobId, target: res.data.target, filesUploaded: 0, bytesUploaded: 0, currentFile: 'Starting...', status: 'running' }]);
        } catch (err: any) { alert('Mirror failed: ' + (err.response?.data?.error || err.message)); }
    };

    const handleMirrorSpecificFolder = async (folderPath: string) => {
        setShowSystemBrowser(false);
        let source = folderPath;
        if (snapshot && confirm('Use VSS Snapshot for this backup?')) {
            const relativePath = folderPath.replace(/^[a-zA-Z]:/, '');
            source = `${snapshot.path}${relativePath}`;
        }
        try {
            const res = await axios.post('/api/cloud/mirror', { sourcePath: source, snapshotMode: false });
            setActiveJobs(prev => [...prev, { jobId: res.data.jobId, target: res.data.target, filesUploaded: 0, bytesUploaded: 0, currentFile: 'Starting...', status: 'running' }]);
        } catch (err: any) { alert('Mirror failed: ' + (err.response?.data?.error || err.message)); }
    };

    const handleSystemUpload = async (sourcePath: string) => {
        setUploading(true);
        setShowSystemBrowser(false);
        try {
            const payload: any = { sourcePath };
            if (snapshot) {
                const relativePath = sourcePath.replace(/^[a-zA-Z]:/, '');
                payload.readPath = `${snapshot.path}${relativePath}`;
            }
            await axios.post('/api/cloud/transfer', payload);
            loadBackups();
            alert('✅ Upload complete');
        } catch (err: any) { alert('Upload failed: ' + (err.response?.data?.error || err.message)); }
        finally { setUploading(false); }
    };

    const handleCancelJob = async (jobId: string, clean: boolean) => {
        try {
            await axios.post('/api/cloud/job/cancel', { jobId, clean });
        } catch (err) { console.error('Cancel failed', err); }
    };

    const handleCreateVersionBackup = async () => {
        if (!versionId) return;
        setUploading(true);
        try {
            await axios.post('/api/cloud/backup', { versionId });
            loadBackups();
            alert('✅ Backup created');
        } catch (err: any) { alert('Backup failed: ' + (err.response?.data?.error || err.message)); }
        finally { setUploading(false); }
    };

    const handleDelete = async (key: string) => {
        if (!confirm('Delete this file?')) return;
        try { await axios.post('/api/cloud/delete', { key }); loadBackups(); }
        catch (err: any) { alert('Delete failed: ' + (err.response?.data?.error || err.message)); }
    };

    const handleImportToWorkspace = async (key: string) => {
        if (!confirm('Import this project?')) return;
        setUploading(true);
        try { await axios.post('/api/cloud/import', { key }); alert('✅ Imported'); }
        catch (err: any) { alert('Import failed: ' + (err.response?.data?.error || err.message)); }
        finally { setUploading(false); }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const storagePercent = (storageInfo.used / storageInfo.total) * 100;

    // Build virtual folder structure - NOW uses treeData from fast endpoint
    const getItemsAtPath = () => {
        // If we have treeData from fast endpoint, use it directly
        if (treeData && !searchTerm) {
            const items: { type: 'folder' | 'file'; key: string; name: string; size?: number; lastModified?: string; childCount?: number; isLoading?: boolean }[] = [];

            // Add folders with loading indicator
            for (const folder of treeData.folders) {
                // Apply filter
                if (filter === 'uploads' && !folder.key.startsWith('uploads/')) continue;
                if (filter === 'backups' && !folder.key.startsWith('backups/')) continue;

                items.push({
                    type: 'folder',
                    key: folder.key,
                    name: folder.name,
                    childCount: (folder as any).childCount, // From server cache
                    isLoading: folder.isLoading // From server
                });
            }

            // Add files
            for (const file of treeData.files) {
                // Apply filter
                if (filter === 'uploads' && !file.key.startsWith('uploads/')) continue;
                if (filter === 'backups' && !file.key.startsWith('backups/')) continue;

                items.push({
                    type: 'file',
                    key: file.key,
                    name: file.name,
                    size: file.size,
                    lastModified: file.lastModified
                });
            }

            // Sort: folders first, then files, alphabetically
            return items.sort((a, b) => {
                if (a.type === 'folder' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
            });
        }

        // FALLBACK: Build from flat backups list (for search or if treeData not available)
        let filtered = backups.filter(b => {
            if (filter === 'uploads' && !b.key.startsWith('uploads/')) return false;
            if (filter === 'backups' && !b.key.startsWith('backups/')) return false;
            if (searchTerm && !b.key.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });

        // If searching, show flat results
        if (searchTerm) {
            return filtered.map(b => ({ type: 'file' as const, key: b.key, name: b.key.split('/').pop() || b.key, size: b.size, lastModified: b.lastModified }));
        }

        // Build folder/file structure for current path
        const items: { type: 'folder' | 'file'; key: string; name: string; size?: number; lastModified?: string; childCount?: number; isLoading?: boolean }[] = [];
        const seenFolders = new Set<string>();

        for (const backup of filtered) {
            // Check if this item is within current path
            if (!backup.key.startsWith(currentPath)) continue;

            // Get the part after current path
            const relativePath = backup.key.slice(currentPath.length);
            const parts = relativePath.split('/').filter(p => p.length > 0);

            if (parts.length === 0) continue;

            if (parts.length === 1) {
                // Direct file at this level
                items.push({ type: 'file', key: backup.key, name: parts[0], size: backup.size, lastModified: backup.lastModified });
            } else {
                // This is inside a subfolder
                const folderName = parts[0];
                const folderKey = currentPath + folderName + '/';
                if (!seenFolders.has(folderKey)) {
                    seenFolders.add(folderKey);
                    // Count children in this folder
                    const childCount = filtered.filter(b => b.key.startsWith(folderKey)).length;
                    items.push({ type: 'folder', key: folderKey, name: folderName, childCount, isLoading: false });
                }
            }
        }

        // Sort: folders first, then files, alphabetically
        return items.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
    };

    const currentItems = getItemsAtPath();

    // Breadcrumb parts
    const breadcrumbParts = currentPath.split('/').filter(p => p.length > 0);

    const navigateToBreadcrumb = (index: number) => {
        const parts = breadcrumbParts.slice(0, index + 1);
        setCurrentPath(parts.join('/') + '/');
    };

    return (
        <div className="flex h-full bg-white dark:bg-slate-900 overflow-hidden relative">
            {showSystemBrowser && (
                <SystemBrowser
                    onUpload={async (path) => {
                        if (mirrorMode) { handleMirrorSpecificFolder(path); }
                        else { handleSystemUpload(path); }
                        setMirrorMode(false);
                    }}
                    onClose={() => { setShowSystemBrowser(false); setMirrorMode(false); }}
                    mode={browserMode}
                />
            )}

            {/* Resume Interrupted Uploads Banner */}
            {pendingJobs.length > 0 && showResumeBar && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
                    <div className="bg-amber-500 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full animate-pulse">
                                <RefreshCw className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold">Interrupted Uploads Detected</h3>
                                <p className="text-sm text-amber-100">
                                    {pendingJobs.length} backup{pendingJobs.length > 1 ? 's' : ''} can be resumed •
                                    {pendingJobs.reduce((acc, j) => acc + j.progress.filesUploaded, 0)} files already uploaded
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => pendingJobs.forEach(j => handleResumeJob(j.jobId))}
                                className="px-4 py-2 bg-white text-amber-600 font-bold rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Resume All
                            </button>
                            <button
                                onClick={() => setShowResumeBar(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="Dismiss"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {/* Individual job cards if more than one */}
                    {pendingJobs.length > 1 && (
                        <div className="mt-2 space-y-2">
                            {pendingJobs.map(job => (
                                <div key={job.jobId} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 flex items-center justify-between border border-amber-200 dark:border-amber-800">
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.sourcePath}</p>
                                        <p className="text-xs text-gray-500">{job.progress.filesUploaded} files • Last: {new Date(job.lastActivity).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                        <button onClick={() => handleResumeJob(job.jobId)} className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded hover:bg-amber-600">Resume</button>
                                        <button onClick={() => handleDismissPendingJob(job.jobId)} className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-300 dark:hover:bg-slate-600">Dismiss</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Active Transfers Panel */}
            {activeJobs.length > 0 && (
                <div className={`fixed bottom-6 right-6 ${panelMinimized ? 'w-64' : 'w-96'} bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 transition-all duration-300`}>
                    <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setPanelMinimized(!panelMinimized)}>
                        <h3 className="font-medium flex items-center gap-2">
                            <Activity className="w-4 h-4 animate-pulse" />
                            Active Transfers ({activeJobs.length})
                        </h3>
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors" title={panelMinimized ? 'Expand' : 'Minimize'}>
                            {panelMinimized ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            )}
                        </button>
                    </div>
                    {!panelMinimized && (
                        <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                            {activeJobs.map(job => (
                                <div key={job.jobId} className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="overflow-hidden flex-1">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={job.target}>{job.target?.split('/').pop() || 'Job'}</h4>
                                            <p className="text-xs text-gray-500 truncate">{job.currentFile?.split('\\').pop()}</p>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleCancelJob(job.jobId, false); }} className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600 rounded" title="Stop (Keep Files)">
                                                <Square className="w-3 h-3" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleCancelJob(job.jobId, true); }} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded" title="Stop & Undo (Delete Files)">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>{job.filesUploaded} files</span>
                                        <span>{formatSize(job.bytesUploaded)}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${job.status === 'error' ? 'bg-red-500' : job.status === 'completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} style={{ width: '100%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                <div className="p-4">
                    <button {...getRootProps()} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                        <input {...getInputProps()} />
                        <Plus className="w-5 h-5" />
                        <span className="text-sm">New Upload</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <button onClick={() => { setBrowserMode('file'); setShowSystemBrowser(true); }} className="py-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl font-medium text-xs hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-colors flex flex-col items-center justify-center gap-1">
                            <FileIcon className="w-4 h-4" />
                            File Backup
                        </button>
                        <button onClick={() => { setBrowserMode('folder'); setShowSystemBrowser(true); }} className="py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl font-medium text-xs hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors flex flex-col items-center justify-center gap-1">
                            <FolderIcon className="w-4 h-4" />
                            Folder Zip
                        </button>
                    </div>

                    <div className="mt-2">
                        <button onClick={() => { setBrowserMode('folder'); setMirrorMode(true); setShowSystemBrowser(true); }} className="w-full py-2 bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 rounded-xl font-medium text-xs hover:bg-pink-200 dark:hover:bg-pink-900/40 transition-colors flex items-center justify-center gap-2" title="Recursively mirror a folder to Cloud">
                            <Upload className="w-4 h-4" />
                            Mirror Any Folder
                        </button>
                    </div>

                    {versionId && (
                        <button onClick={handleCreateVersionBackup} disabled={uploading} className="mt-3 w-full py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                            <Cloud className="w-4 h-4" />
                            Backup Current
                        </button>
                    )}
                </div>

                <nav className="flex-1 px-2 space-y-1">
                    <button onClick={() => { setActiveTab('drive'); setFilter('all'); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'drive' && filter === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                        <HardDrive className="w-4 h-4" /> All Files
                    </button>
                    <button onClick={() => { setActiveTab('drive'); setFilter('uploads'); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'drive' && filter === 'uploads' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                        <Upload className="w-4 h-4" /> Uploads
                    </button>
                    <button onClick={() => { setActiveTab('drive'); setFilter('backups'); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'drive' && filter === 'backups' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                        <Cloud className="w-4 h-4" /> Lab Backups
                    </button>

                    <div className="pt-4 pb-2"><div className="w-full border-t border-gray-200 dark:border-slate-800"></div></div>

                    <button onClick={() => setActiveTab('sync')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'sync' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                        <Activity className="w-4 h-4" /> Real-Time Sync
                    </button>

                    <div className="pt-4 pb-2">
                        <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
                        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">System Protection (VSS)</p>
                    </div>

                    {!snapshot ? (
                        <button onClick={handleCreateSnapshot} disabled={loading} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                            <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded"><HardDrive className="w-3 h-3" /></div>
                            Create Snapshot
                        </button>
                    ) : (
                        <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-2 mb-1">
                                <Check className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Snapshot Active</span>
                            </div>
                            <p className="text-[10px] text-amber-600/80 break-all mb-2 leading-tight">ID: ...{snapshot.id.slice(-6)}</p>
                            <button onClick={handleDeleteSnapshot} disabled={loading} className="w-full py-1 bg-white dark:bg-slate-800 text-xs font-medium text-red-500 border border-red-200 dark:border-red-900 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                Delete Snapshot
                            </button>
                            <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                                <button onClick={handleFullMirror} className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded shadow-sm hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2">
                                    <Cloud className="w-3 h-3" />
                                    Full Drive Mirror
                                </button>
                            </div>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Storage Used <span className="ml-1 px-1 bg-green-100 text-green-700 rounded text-[10px]">v3.1</span></span>
                        <span className="text-xs text-gray-400">{storageInfo.used.toFixed(1)}MB / 1TB Plan</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${storagePercent}%` }} />
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col">
                {activeTab === 'sync' ? (
                    <SyncManager />
                ) : (
                    <>
                        <div className="h-16 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-4 text-gray-400">
                                <Search className="w-5 h-5" />
                                <input type="text" placeholder="Search in Cloud..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 w-64" />
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
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Drop files to upload</h3>
                                </div>
                            </div>
                        )}

                        {/* Breadcrumbs */}
                        {currentPath && (
                            <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2 text-sm">
                                <button onClick={() => setCurrentPath('')} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                    🏠 Root
                                </button>
                                {breadcrumbParts.map((part, i) => (
                                    <span key={i} className="flex items-center gap-2">
                                        <span className="text-gray-400">/</span>
                                        <button
                                            onClick={() => navigateToBreadcrumb(i)}
                                            className={`${i === breadcrumbParts.length - 1 ? 'text-gray-900 dark:text-white font-semibold' : 'text-blue-600 dark:text-blue-400 hover:underline'}`}
                                        >
                                            {part}
                                        </button>
                                    </span>
                                ))}
                                {currentPath && (
                                    <button onClick={navigateUp} className="ml-auto px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-slate-600 flex items-center gap-1">
                                        ⬅️ Back
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex-1 overflow-auto p-6">
                            {currentItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <Cloud className="w-24 h-24 mb-6 opacity-20" />
                                    <h3 className="text-xl font-semibold mb-2">{currentPath ? 'Folder is empty' : 'Drive is empty'}</h3>
                                    <p className="text-sm">{currentPath ? 'No files in this folder' : 'Drag and drop files or use "New Upload"'}</p>
                                    {currentPath && (
                                        <button onClick={navigateUp} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                            ⬅️ Go Back
                                        </button>
                                    )}
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {currentItems.map(item => (
                                        <div
                                            key={item.key}
                                            className={`group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-4 transition-all hover:shadow-lg relative ${item.type === 'folder' ? 'cursor-pointer' : ''}`}
                                            onClick={() => item.type === 'folder' && navigateToFolder(item.key)}
                                        >
                                            {/* Loading indicator for folders still being indexed */}
                                            {item.type === 'folder' && item.isLoading && (
                                                <div
                                                    className="absolute top-2 right-2 z-10 group/loading"
                                                    title="Loading folder contents..."
                                                >
                                                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                                    <div className="absolute right-0 top-6 hidden group-hover/loading:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                                        Loading contents...
                                                    </div>
                                                </div>
                                            )}
                                            <div className={`aspect-square bg-gray-50 dark:bg-slate-900 rounded-lg mb-3 flex items-center justify-center ${item.type === 'folder' ? 'text-amber-500' : 'text-gray-300 dark:text-slate-600'} group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors`}>
                                                {item.type === 'folder' ? (
                                                    <FolderIcon className="w-12 h-12" />
                                                ) : item.name.endsWith('.zip') ? (
                                                    <FileArchive className="w-12 h-12" />
                                                ) : (
                                                    <FileIcon className="w-12 h-12" />
                                                )}
                                            </div>
                                            <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm mb-1" title={item.name}>{item.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                {item.type === 'folder'
                                                    ? (item.childCount !== null && item.childCount !== undefined
                                                        ? `${item.childCount.toLocaleString()} items`
                                                        : (item.isLoading ? 'Loading...' : 'Folder'))
                                                    : formatSize(item.size || 0)}
                                            </p>
                                            {item.type === 'file' && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 right-4 bg-white dark:bg-slate-800 shadow-lg p-1 rounded-lg border border-gray-100 dark:border-slate-700">
                                                    {item.name.endsWith('.zip') && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleImportToWorkspace(item.key); }} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 rounded" title="Import"><ArrowUpFromLine className="w-4 h-4" /></button>
                                                    )}
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.key); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Size / Items</th>
                                            <th className="px-6 py-3">Modified</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                        {currentItems.map(item => (
                                            <tr
                                                key={item.key}
                                                className={`bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 group ${item.type === 'folder' ? 'cursor-pointer' : ''}`}
                                                onClick={() => item.type === 'folder' && navigateToFolder(item.key)}
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                                    {item.type === 'folder' ? (
                                                        <FolderIcon className="w-4 h-4 text-amber-500" />
                                                    ) : item.name.endsWith('.zip') ? (
                                                        <FileArchive className="w-4 h-4 text-orange-500" />
                                                    ) : (
                                                        <FileIcon className="w-4 h-4 text-blue-500" />
                                                    )}
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.type === 'folder'
                                                        ? (item.childCount !== null && item.childCount !== undefined
                                                            ? `${item.childCount.toLocaleString()} items`
                                                            : (item.isLoading ? 'Loading...' : 'Folder'))
                                                        : formatSize(item.size || 0)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.type === 'file' && item.lastModified ? new Date(item.lastModified).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {item.type === 'file' && (
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                                                            {item.name.endsWith('.zip') && (
                                                                <button onClick={(e) => { e.stopPropagation(); handleImportToWorkspace(item.key); }} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 rounded">Import</button>
                                                            )}
                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.key); }} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded">Delete</button>
                                                        </div>
                                                    )}
                                                    {item.type === 'folder' && (
                                                        <span className="text-gray-400 text-xs">Click to open →</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
