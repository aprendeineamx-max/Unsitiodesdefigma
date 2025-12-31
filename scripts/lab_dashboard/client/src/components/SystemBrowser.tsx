import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    HardDrive, Folder, File, Upload, ChevronRight,
    Loader2, AlertCircle, Home
} from 'lucide-react';

interface FileItem {
    name: string;
    isDirectory: boolean;
    path: string;
    size: number;
}

interface SystemBrowserProps {
    onUpload: (path: string) => Promise<void>;
    onClose: () => void;
    mode?: 'file' | 'folder'; // 'file' (default) or 'folder'
}

const API_URL = 'http://localhost:3000';

export const SystemBrowser: React.FC<SystemBrowserProps> = ({ onUpload, onClose, mode = 'file' }) => {
    const [drives, setDrives] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

    useEffect(() => {
        loadDrives();
    }, []);

    const loadDrives = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/system/drives`);
            setDrives(res.data);
            if (res.data.length > 0) {
                // Determine root drive (C:)
                const cDrive = res.data.find((d: string) => d.includes('C:')) || res.data[0];
                loadPath(cDrive + '\\'); // Start at root
            }
        } catch (err: any) {
            setError('Failed to load drives: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadPath = async (path: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/api/system/files`, {
                params: { path }
            });
            setFiles(res.data.files);
            setCurrentPath(res.data.path);
            setSelectedFile(null);
        } catch (err: any) {
            setError(`Cannot access ${path}: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (item: FileItem) => {
        if (item.isDirectory) {
            loadPath(item.path);
        } else {
            if (mode === 'file') setSelectedFile(item);
        }
    };

    const handleBreadcrumbClick = (index: number) => {
        // Simple logic for Windows paths C:\Users\Admin
        const parts = currentPath.split('\\').filter(p => p);
        const newPath = parts.slice(0, index + 1).join('\\') + '\\';
        loadPath(newPath);
    };

    const pathParts = currentPath.split('\\').filter(p => p);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-900/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <HardDrive className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">System Browser</h2>
                            <p className="text-xs text-gray-500">
                                {mode === 'folder' ? 'Select a FOLDER to watch' : 'Select a FILE to backup'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        ✕
                    </button>
                </div>

                {/* Toolbar / Breadcrumbs */}
                <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
                    <button onClick={loadDrives} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                        <Home className="w-4 h-4 text-gray-500" />
                    </button>
                    {pathParts.map((part, i) => (
                        <React.Fragment key={i}>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <button
                                onClick={() => handleBreadcrumbClick(i)}
                                className="px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                            >
                                {part}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* Loading / Error */}
                {loading && (
                    <div className="absolute inset-0 top-32 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                )}

                {error && (
                    <div className="m-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* File List */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {files.map((file) => (
                            <div
                                key={file.path}
                                onClick={() => handleNavigate(file)}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                    ${(mode === 'file' && selectedFile?.path === file.path)
                                        ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-500/50'
                                        : 'bg-white border-gray-200 hover:border-indigo-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600'}
                                    ${(mode === 'folder' && !file.isDirectory) ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {file.isDirectory
                                    ? <Folder className="w-8 h-8 text-yellow-500 fill-yellow-500/20" />
                                    : <File className="w-8 h-8 text-gray-400" />
                                }
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>{file.name}</h4>
                                    <p className="text-xs text-gray-500">{file.isDirectory ? 'Folder' : 'File'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 rounded-b-xl flex justify-between items-center">
                    <div className="text-sm text-gray-500 flex-1 truncate mr-4">
                        {mode === 'folder'
                            ? `Current: ${currentPath}`
                            : (selectedFile ? `Selected: ${selectedFile.name}` : 'Select a file to upload')
                        }
                    </div>
                    {mode === 'folder' ? (
                        <button
                            onClick={() => onUpload(currentPath)}
                            disabled={loading || !currentPath}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            <Upload className="w-4 h-4" />
                            Watch This Folder
                        </button>
                    ) : (
                        <button
                            onClick={() => selectedFile && onUpload(selectedFile.path)}
                            disabled={!selectedFile || loading}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            <Upload className="w-4 h-4" />
                            Backup Selected File
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
