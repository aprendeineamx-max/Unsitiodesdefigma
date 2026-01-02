import React from 'react';
import {
    Plus, File as FileIcon, Folder as FolderIcon, Upload,
    Cloud, HardDrive, Activity, Check, Terminal
} from 'lucide-react';
import { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';

interface CloudSidebarProps {
    storageInfo: { used: number; total: number };
    storagePercent: number;
    activeTab: 'drive' | 'sync';
    setActiveTab: (tab: 'drive' | 'sync') => void;
    filter: 'all' | 'backups' | 'uploads';
    setFilter: (filter: 'all' | 'backups' | 'uploads') => void;
    versionId: string | null;
    loading: boolean;
    uploading: boolean;
    snapshot: { id: string; path: string } | null;
    handleCreateSnapshot: () => void;
    handleDeleteSnapshot: () => void;
    handleFullMirror: () => void;
    getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
    getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
    setShowSystemBrowser: (show: boolean) => void;
    setMirrorMode: (mode: boolean) => void;
    setBrowserMode: (mode: 'file' | 'folder') => void;
    handleCreateVersionBackup: () => void;
    onLocalUpload: (files: File[]) => void;
    onToggleOps: () => void;
}

const CloudSidebar: React.FC<CloudSidebarProps> = ({
    storageInfo, storagePercent, activeTab, setActiveTab,
    filter, setFilter, versionId, loading, uploading,
    snapshot, handleCreateSnapshot, handleDeleteSnapshot,
    handleFullMirror, getRootProps, getInputProps,
    setShowSystemBrowser, setMirrorMode, setBrowserMode,
    handleCreateVersionBackup, onLocalUpload, onToggleOps
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const folderInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('[CloudSidebar] handleFileChange triggered');
        console.log('[CloudSidebar] Files selected:', e.target.files?.length || 0);

        if (e.target.files && e.target.files.length > 0) {
            console.log('[CloudSidebar] Passing', e.target.files.length, 'files to onLocalUpload');
            onLocalUpload(Array.from(e.target.files));
        } else {
            console.error('[CloudSidebar] No files enumerated from input - check browser permissions');
            alert('No se pudieron enumerar los archivos. El navegador puede haber bloqueado el acceso a la carpeta.');
        }

        // Reset input so same folder can be selected again
        e.target.value = '';
    };

    return (
        <div className="w-64 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
            <div className="p-4">
                <button {...getRootProps()} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                    <input {...getInputProps()} />
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">New Upload</span>
                </button>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={() => fileInputRef.current?.click()} className="py-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl font-medium text-xs hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-colors flex flex-col items-center justify-center gap-1">
                        <FileIcon className="w-4 h-4" />
                        File Upload
                    </button>
                    <button onClick={() => folderInputRef.current?.click()} className="py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl font-medium text-xs hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors flex flex-col items-center justify-center gap-1">
                        <FolderIcon className="w-4 h-4" />
                        Folder Upload
                    </button>
                    {/* Hidden Native Inputs */}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} multiple />
                    <input type="file" ref={folderInputRef} className="hidden" onChange={handleFileChange} {...({ webkitdirectory: "", directory: "" } as any)} />
                </div>

                <div className="mt-2">
                    {/* Mirror Disabled for Web */}
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

                {/* Sync Disabled for Web Logic */}
                <button disabled className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-slate-900`}>
                    <Activity className="w-4 h-4" /> Real-Time Sync (Desktop Only)
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
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onToggleOps} className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline">
                        <Terminal className="w-3 h-3" /> System Ops
                    </button>
                </div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Storage Used <span className="ml-1 px-1 bg-green-100 text-green-700 rounded text-[10px]">v3.1</span></span>
                    <span className="text-xs text-gray-400">{storageInfo.used.toFixed(1)}MB / 1TB Plan</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${storagePercent}%` }} />
                </div>
            </div>
        </div>
    );
};

export default CloudSidebar;
