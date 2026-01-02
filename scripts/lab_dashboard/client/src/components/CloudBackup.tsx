import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useDropzone } from 'react-dropzone';
// Components
import { SystemBrowser } from './SystemBrowser';
import { SyncManager } from './SyncManager';
import CloudSidebar from './cloud/CloudSidebar';
import CloudFileList from './cloud/CloudFileList';
import CloudTransferPanel from './cloud/CloudTransferPanel';
import ResumeUploadsBar from './cloud/ResumeUploadsBar';
import FilePreviewModal from './cloud/FilePreviewModal';
// Types
import { Backup, BackupJob, PendingJob, TreeData, TreeFile, CloudItem } from '../types/cloud';

interface CloudBackupProps {
    versionId: string | null;
    versions: any[];
}

// NOTE: Ensure your backend serves this endpoint correctly
const API_URL = '';

export const CloudBackup: React.FC<CloudBackupProps> = ({ versionId, versions }) => {
    // --- State ---
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [storageInfo, setStorageInfo] = useState({ used: 0, total: 1000000 });

    // UI State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'backups' | 'uploads'>('all');
    const [browserMode, setBrowserMode] = useState<'file' | 'folder'>('file');
    const [showSystemBrowser, setShowSystemBrowser] = useState(false);
    const [activeTab, setActiveTab] = useState<'drive' | 'sync'>('drive');
    const [panelMinimized, setPanelMinimized] = useState(false);
    const [showResumeBar, setShowResumeBar] = useState(true);

    // Feature State
    const [snapshot, setSnapshot] = useState<{ id: string; path: string } | null>(null);
    const [mirrorMode, setMirrorMode] = useState(false);
    const [activeJobs, setActiveJobs] = useState<BackupJob[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
    const [previewFile, setPreviewFile] = useState<{ key: string, name: string } | null>(null);

    // Navigation & Tree
    const [currentPath, setCurrentPath] = useState<string>('');
    const [treeData, setTreeData] = useState<TreeData | null>(null);
    const [cacheReady, setCacheReady] = useState(false);
    // const [useTreeMode, setUseTreeMode] = useState(true); // Always true now

    // --- Effects ---

    // Initialize Socket
    useEffect(() => {
        const newSocket = io(window.location.origin);
        setSocket(newSocket);
        newSocket.on('connect', () => console.log('[CloudBackup] Socket connected'));
        return () => { newSocket.disconnect(); };
    }, []);

    // Socket Events
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

        const onFileUploaded = (fileInfo: any) => {
            // Update tree data if in current path
            if (treeData && fileInfo.key.startsWith(currentPath)) {
                const fileName = fileInfo.key.replace(currentPath, '').split('/')[0];
                if (!fileName.includes('/')) {
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

        const onCacheProgress = (data: any) => {
            if (treeData && currentPath === '') {
                setTreeData(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        folders: prev.folders.map(folder => {
                            const stats = data.folderStats[folder.key];
                            if (stats) {
                                return {
                                    ...folder,
                                    folderCount: stats.folderCount,
                                    fileCount: stats.fileCount,
                                    totalCount: stats.totalCount,
                                    isLoading: !stats.isComplete,
                                    isComplete: stats.isComplete
                                };
                            }
                            return folder;
                        }),
                        cacheStatus: {
                            ...prev.cacheStatus,
                            totalFiles: data.totalLoaded,
                            isLoading: true
                        }
                    };
                });
            }
        };

        const onCacheReady = (data: any) => {
            console.log(`[CloudBackup] Full cache ready: ${data.totalFiles} files`);
            setCacheReady(true);
            loadTreeData(currentPath);
        };

        socket.on('backup:progress', onProgress);
        socket.on('backup:complete', onComplete);
        socket.on('backup:error', onError);
        socket.on('backup:canceled', onCanceled);
        socket.on('file:uploaded', onFileUploaded);
        socket.on('cache:progress', onCacheProgress);
        socket.on('cache:ready', onCacheReady);

        return () => {
            socket.off('backup:progress', onProgress);
            socket.off('backup:complete', onComplete);
            socket.off('backup:error', onError);
            socket.off('backup:canceled', onCanceled);
            socket.off('file:uploaded', onFileUploaded);
            socket.off('cache:progress', onCacheProgress);
            socket.off('cache:ready', onCacheReady);
        };
    }, [socket, currentPath, treeData]);

    // Load Data on mount and when path changes
    useEffect(() => {
        checkConnection();
        loadTreeData(currentPath);
        loadPendingJobs();
    }, [currentPath]);

    // --- Actions ---

    const loadPendingJobs = async () => {
        try {
            const res = await axios.get('/api/cloud/jobs/pending');
            setPendingJobs(res.data);
            if (res.data.length > 0) setShowResumeBar(true);
        } catch (err) { console.error('Failed to load pending jobs', err); }
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
        } catch (err: any) { alert('Resume failed: ' + (err.response?.data?.error || err.message)); }
    };

    const checkConnection = async () => {
        try {
            const res = await axios.get('/api/cloud/status');
            setConnected(res.data.connected);
        } catch { setConnected(false); }
    };

    const loadTreeData = async (prefix: string = '') => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/cloud/list/tree?prefix=${encodeURIComponent(prefix)}`);
            setTreeData(res.data);
            setCacheReady(res.data.cacheStatus?.isReady || false);
            const totalSize = res.data.files.reduce((acc: number, f: TreeFile) => acc + f.size, 0);
            setStorageInfo(prev => ({ ...prev, used: totalSize / (1024 * 1024) }));
        } catch (err) { console.error('Failed to load tree data', err); }
        finally { setLoading(false); }
    };

    const loadBackups = async () => {
        // Fallback or refresh
        await loadTreeData(currentPath);
    };

    // --- Navigation ---
    const navigateToFolder = (folderKey: string) => setCurrentPath(folderKey);
    const navigateUp = () => {
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        setCurrentPath(parts.length > 0 ? parts.join('/') + '/' : '');
    };
    const navigateToBreadcrumb = (index: number) => {
        const parts = currentPath.split('/').filter(Boolean).slice(0, index + 1);
        setCurrentPath(parts.join('/') + '/');
    };

    // --- Upload Handlers ---
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setUploading(true);
        const batchId = `batch-${Date.now()}`;
        const totalFiles = acceptedFiles.length;

        // UI Feedback
        setActiveJobs(prev => [...prev, {
            jobId: batchId,
            target: totalFiles > 1 ? `Batch Upload (${totalFiles} files)` : acceptedFiles[0].name,
            filesUploaded: 0,
            bytesUploaded: 0,
            currentFile: 'Starting...',
            status: 'running'
        }]);

        let completed = 0;
        let errors = 0;
        const BATCH_SIZE = 20; // V4.1: Reduced for stability

        // Create Chunks
        const chunks: File[][] = [];
        for (let i = 0; i < acceptedFiles.length; i += BATCH_SIZE) {
            chunks.push(acceptedFiles.slice(i, i + BATCH_SIZE));
        }

        const processChunk = async (chunk: File[]) => {
            const formData = new FormData();
            const paths: string[] = [];

            formData.append('batchId', batchId);

            chunk.forEach(file => {
                const relPath = (file as any).webkitRelativePath;
                // If relPath exists but we are at root, it's just folder/file. 
                // If it's empty (single file drag), use name.
                paths.push(relPath || file.name);
                formData.append('files', file);
            });

            // Send structural data
            formData.append('paths', JSON.stringify(paths));

            try {
                const res = await axios.post('/api/cloud/upload/batch', formData);

                completed += (res.data.uploaded || chunk.length);
                errors += (res.data.failed || 0);

                // Update UI
                setActiveJobs(prev => prev.map(j => j.jobId === batchId ? {
                    ...j,
                    filesUploaded: completed,
                    currentFile: `Uploading batch... (${completed}/${totalFiles})`
                } : j));

            } catch (err) {
                console.error('Batch Failed', err);
                errors += chunk.length;
            }
        };

        // Concurrency Limit (2 chunks = 40 files parallel net ops)
        const CONCURRENCY = 2;
        const queue = [...chunks];
        const workers: Promise<void>[] = [];

        const next = async () => {
            while (queue.length > 0) {
                const chunk = queue.shift();
                if (chunk) await processChunk(chunk);
            }
        };

        for (let i = 0; i < CONCURRENCY; i++) workers.push(next());
        await Promise.all(workers);

        setUploading(false);
        loadTreeData(currentPath);

        // V4.1: Persist error state - do not auto-clear if errors occurred
        if (errors > 0) {
            setActiveJobs(prev => prev.map(j => j.jobId === batchId ? {
                ...j,
                status: 'error',
                currentFile: `Failed: ${errors} files. Click X to dismiss.`
            } : j));
            alert(`Upload finished with ${errors} errors out of ${totalFiles} files.`);
        } else {
            setActiveJobs(prev => prev.map(j => j.jobId === batchId ? { ...j, status: 'completed' } : j));
            setTimeout(() => { setActiveJobs(prev => prev.filter(j => j.jobId !== batchId)); }, 5000);
        }

    }, [currentPath]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    // --- Operations ---
    const handleCreateSnapshot = async () => {
        try {
            setLoading(true);
            const res = await axios.post('/api/system/snapshot/create');
            setSnapshot(res.data.snapshot);
            alert('✅ System Snapshot Created!');
        } catch (err: any) { alert('Snapshot failed: ' + (err.message)); }
        finally { setLoading(false); }
    };

    const handleDeleteSnapshot = async () => {
        if (!snapshot) return;
        try {
            setLoading(true);
            await axios.post('/api/system/snapshot/delete', { id: snapshot.id });
            setSnapshot(null);
            alert('Snapshot Deleted');
        } catch (err: any) { alert('Delete failed: ' + err.message); }
        finally { setLoading(false); }
    };

    const handleFullMirror = async () => {
        if (!snapshot) { alert('Please create a VSS Snapshot first.'); return; }
        if (!confirm('WARNING: Upload entire C: Drive?')) return;
        try {
            const res = await axios.post('/api/cloud/mirror', { sourcePath: snapshot.path, snapshotMode: true });
            setActiveJobs(prev => [...prev, { jobId: res.data.jobId, target: res.data.target, filesUploaded: 0, bytesUploaded: 0, currentFile: 'Starting...', status: 'running' }]);
        } catch (err: any) { alert('Mirror failed: ' + err.message); }
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
        } catch (err: any) { alert('Mirror failed: ' + err.message); }
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
            loadTreeData(currentPath);
            alert('✅ Upload complete');
        } catch (err: any) { alert('Upload failed: ' + err.message); }
        finally { setUploading(false); }
    };

    const handleCancelJob = async (jobId: string, clean: boolean) => {
        try { await axios.post('/api/cloud/job/cancel', { jobId, clean }); }
        catch (err) { console.error('Cancel failed', err); }
    };

    const handleCreateVersionBackup = async () => {
        if (!versionId) return;
        setUploading(true);
        try {
            await axios.post('/api/cloud/backup', { versionId });
            loadTreeData(currentPath);
            alert('✅ Backup created');
        } catch (err: any) { alert('Backup failed: ' + err.message); }
        finally { setUploading(false); }
    };

    const handleDelete = async (key: string) => {
        if (!confirm('Delete this file?')) return;
        try { await axios.post('/api/cloud/delete', { key }); loadTreeData(currentPath); }
        catch (err: any) { alert('Delete failed: ' + err.message); }
    };

    const handleImportToWorkspace = async (key: string) => {
        if (!confirm('Import this project?')) return;
        setUploading(true);
        try { await axios.post('/api/cloud/import', { key }); alert('✅ Imported'); }
        catch (err: any) { alert('Import failed: ' + err.message); }
        finally { setUploading(false); }
    };

    const handlePreview = (item: CloudItem) => {
        if (item.type === 'file') {
            setPreviewFile({ key: item.key, name: item.name });
        }
    };

    // --- Data Preparation for Child Components ---
    const getItemsAtPath = (): CloudItem[] => {
        if (treeData && !searchTerm) {
            const items: CloudItem[] = [];
            // Folders
            for (const folder of treeData.folders) {
                if (filter === 'uploads' && !folder.key.startsWith('uploads/')) continue;
                if (filter === 'backups' && !folder.key.startsWith('backups/')) continue;
                items.push({
                    type: 'folder', key: folder.key, name: folder.name,
                    folderCount: folder.folderCount, fileCount: folder.fileCount, totalCount: folder.totalCount,
                    isLoading: folder.isLoading, isComplete: folder.isComplete
                });
            }
            // Files
            for (const file of treeData.files) {
                if (filter === 'uploads' && !file.key.startsWith('uploads/')) continue;
                if (filter === 'backups' && !file.key.startsWith('backups/')) continue;
                items.push({
                    type: 'file', key: file.key, name: file.name,
                    size: file.size, lastModified: file.lastModified
                });
            }
            return items.sort((a, b) => {
                if (a.type === 'folder' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
            });
        }
        // Fallback for search (search logic is simplified here as we mainly use tree now)
        // If searching, we'd need a search endpoint or flat list.
        // Assuming search is disabled or handled by backend later.
        // Returning empty if no tree data or if search term exists but not handled (todo).
        return [];
    };

    const currentItems = getItemsAtPath();
    const breadcrumbParts = currentPath.split('/').filter(p => p.length > 0);
    const storagePercent = (storageInfo.used / storageInfo.total) * 100;

    return (
        <div className="flex h-full bg-white dark:bg-slate-900 overflow-hidden relative">
            {/* Overlays */}
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

            <ResumeUploadsBar
                pendingJobs={pendingJobs}
                showResumeBar={showResumeBar}
                setShowResumeBar={setShowResumeBar}
                handleResumeJob={handleResumeJob}
            />

            <CloudTransferPanel
                activeJobs={activeJobs}
                panelMinimized={panelMinimized}
                setPanelMinimized={setPanelMinimized}
                handleCancelJob={handleCancelJob}
            />

            <FilePreviewModal
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                fileKey={previewFile?.key || null}
                fileName={previewFile?.name || null}
            />

            {/* Sidebar */}
            <CloudSidebar
                storageInfo={storageInfo}
                storagePercent={storagePercent}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filter={filter}
                setFilter={setFilter}
                versionId={versionId}
                loading={loading}
                uploading={uploading}
                snapshot={snapshot}
                handleCreateSnapshot={handleCreateSnapshot}
                handleDeleteSnapshot={handleDeleteSnapshot}
                handleFullMirror={handleFullMirror}
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                setShowSystemBrowser={setShowSystemBrowser}
                setMirrorMode={setMirrorMode}
                setBrowserMode={setBrowserMode}
                handleCreateVersionBackup={handleCreateVersionBackup}
                onLocalUpload={onDrop}
            />

            {/* Main Area */}
            {activeTab === 'sync' ? (
                <div className="flex-1 flex flex-col">
                    <SyncManager />
                </div>
            ) : (
                <CloudFileList
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    loading={loading}
                    loadBackups={loadBackups}
                    isDragActive={isDragActive}
                    currentPath={currentPath}
                    setCurrentPath={setCurrentPath}
                    breadcrumbParts={breadcrumbParts}
                    navigateToBreadcrumb={navigateToBreadcrumb}
                    navigateUp={navigateUp}
                    currentItems={currentItems}
                    navigateToFolder={navigateToFolder}
                    handlePreview={handlePreview}
                    handleDelete={handleDelete}
                    handleImport={handleImportToWorkspace}
                />
            )}
        </div>
    );
};
