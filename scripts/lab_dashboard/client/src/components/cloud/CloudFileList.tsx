import React from 'react';
import {
    Search, Grid, List, RefreshCw, Upload, Cloud,
    Folder as FolderIcon, File as FileIcon, FileArchive,
    Loader2, Trash2, ArrowUpFromLine
} from 'lucide-react';

interface CloudItem {
    type: 'folder' | 'file';
    key: string;
    name: string;
    size?: number;
    lastModified?: string;
    folderCount?: number | null;
    fileCount?: number | null;
    totalCount?: number | null;
    isLoading?: boolean;
    isComplete?: boolean;
}

interface CloudFileListProps {
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    loading: boolean;
    loadBackups: () => void;
    isDragActive: boolean;
    currentPath: string;
    setCurrentPath: (path: string) => void;
    breadcrumbParts: string[];
    navigateToBreadcrumb: (index: number) => void;
    navigateUp: () => void;
    currentItems: CloudItem[];
    navigateToFolder: (key: string) => void;
    handlePreview: (item: CloudItem) => void;
    handleDelete: (key: string) => void;
    handleImport: (key: string) => void;
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const CloudFileList: React.FC<CloudFileListProps> = ({
    viewMode, setViewMode, searchTerm, setSearchTerm,
    loading, loadBackups, isDragActive, currentPath,
    setCurrentPath, breadcrumbParts, navigateToBreadcrumb,
    navigateUp, currentItems, navigateToFolder, handlePreview,
    handleDelete, handleImport
}) => {
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Toolbar */}
            <div className="h-16 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 shrink-0">
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
                    <button onClick={loadBackups} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Drag & Drop Overlay */}
            {isDragActive && (
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-blue-500 border-dashed m-4 rounded-xl pointer-events-none">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl flex flex-col items-center">
                        <Upload className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Drop files to upload</h3>
                    </div>
                </div>
            )}

            {/* Breadcrumbs */}
            {currentPath && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2 text-sm shrink-0">
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

            {/* Main Content */}
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
                                className={`group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-4 transition-all hover:shadow-lg relative ${item.type === 'folder' ? 'cursor-pointer' : 'cursor-pointer'}`}
                                onClick={() => item.type === 'folder' && navigateToFolder(item.key)}
                                onDoubleClick={() => handlePreview(item)}
                            >
                                {/* Loading indicator */}
                                {item.type === 'folder' && item.isLoading && (item.folderCount === null || item.folderCount === undefined) && (
                                    <div className="absolute top-2 right-2 z-10 group/loading" title="Loading folder contents...">
                                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
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
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    {item.type === 'folder'
                                        ? (item.folderCount !== null && item.folderCount !== undefined
                                            ? <>
                                                {item.folderCount} folders, {item.fileCount} files
                                                {!item.isComplete && item.isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-400 inline ml-1" />}
                                            </>
                                            : (item.isLoading ? 'Loading...' : 'Folder'))
                                        : formatSize(item.size || 0)}
                                </p>
                                {item.type === 'file' && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 right-4 bg-white dark:bg-slate-800 shadow-lg p-1 rounded-lg border border-gray-100 dark:border-slate-700">
                                        {item.name.endsWith('.zip') && (
                                            <button onClick={(e) => { e.stopPropagation(); handleImport(item.key); }} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 rounded" title="Import"><ArrowUpFromLine className="w-4 h-4" /></button>
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
                                    className={`bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 group ${item.type === 'folder' ? 'cursor-pointer' : 'cursor-pointer'}`}
                                    onClick={() => item.type === 'folder' && navigateToFolder(item.key)}
                                    onDoubleClick={() => handlePreview(item)}
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
                                        <span className="flex items-center gap-1">
                                            {item.type === 'folder'
                                                ? (item.folderCount !== null && item.folderCount !== undefined
                                                    ? <>
                                                        {item.folderCount} folders, {item.fileCount} files
                                                        {!item.isComplete && item.isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
                                                    </>
                                                    : (item.isLoading ? 'Loading...' : 'Folder'))
                                                : formatSize(item.size || 0)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.type === 'file' && item.lastModified ? new Date(item.lastModified).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.type === 'file' && (
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                                                {item.name.endsWith('.zip') && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleImport(item.key); }} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 rounded">Import</button>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.key); }} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded">Delete</button>
                                            </div>
                                        )}
                                        {/* Click to open text for folders */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CloudFileList;
