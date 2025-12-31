import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
    Folder, FolderOpen, FileCode,
    ChevronRight, ChevronDown, Save, RefreshCw
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'dir';
    size: number;
}

interface FileExplorerProps {
    versionId: string | null;
    versions: any[];
    onSelectVersion: (id: string) => void;
}

export function FileExplorer({ versionId, versions, onSelectVersion }: FileExplorerProps) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [originalCode, setOriginalCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleRefresh = () => setRefreshKey(prev => prev + 1);

    const handleFileClick = async (path: string) => {
        if (!versionId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/files/read`, { params: { versionId, path } });
            setCode(res.data.content);
            setOriginalCode(res.data.content);
            setCurrentFile(path);
        } catch (err) {
            alert('Error reading file');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!versionId || !currentFile) return;
        setSaving(true);
        try {
            await axios.post(`${API_URL}/api/files/write`, {
                versionId,
                path: currentFile,
                content: code
            });
            setOriginalCode(code);
        } catch (err) {
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (!versionId && versions.length === 0) return (
        <div className="flex items-center justify-center h-full text-slate-500">
            Loading environments...
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-140px)] border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl">

            {/* Sidebar Tree */}
            <div className="w-64 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                <div className="p-3 border-b border-gray-200 dark:border-slate-800 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span>Explorer</span>
                        <button onClick={handleRefresh} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded" title="Refresh">
                            <RefreshCw className="w-3 h-3" />
                        </button>
                    </div>

                    <select
                        value={versionId || ''}
                        onChange={(e) => onSelectVersion(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md py-1 px-2 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                        <option value="" disabled>Select Environment</option>
                        {versions.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.id} ({v.status})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {!versionId ? (
                        <div className="text-center p-4 text-xs text-slate-400">
                            Select an environment to view files.
                        </div>
                    ) : (
                        <RecursiveTree
                            key={`${versionId}-${refreshKey}`}
                            versionId={versionId}
                            path=""
                            level={0}
                            onFileClick={handleFileClick}
                            selectedFile={currentFile}
                        />
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col">
                {currentFile ? (
                    <>
                        {/* Editor Header */}
                        <div className="h-10 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900">
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-200 flex items-center gap-2">
                                <FileCode className="w-4 h-4 text-blue-500" />
                                {currentFile}
                                {code !== originalCode && <span className="w-2 h-2 rounded-full bg-yellow-500" />}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={code === originalCode || saving}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${code !== originalCode
                                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                                        : "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>

                        {/* Monaco */}
                        <div className="flex-1 relative">
                            {loading && <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center">Loading...</div>}
                            <Editor
                                height="100%"
                                defaultLanguage="javascript" // TODO: Detect language
                                path={currentFile} // Helps Monaco infer language
                                theme="vs-dark"
                                value={code}
                                onChange={(val) => setCode(val || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 16 },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <FileCode className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a file to edit</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Recursive Tree Component
function RecursiveTree({ versionId, path, level, onFileClick, selectedFile }: any) {
    const [items, setItems] = useState<FileNode[]>([]);
    const [expanded, setExpanded] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Initial load for root
    useEffect(() => {
        if (level === 0) loadItems();
    }, [versionId]); // path?

    const loadItems = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/files`, { params: { versionId, path } });
            setItems(res.data.items);
            setLoaded(true);
        } catch (e) {
            console.error("Load items failed:", e);
            setLoaded(true); // Stop loading spinner even on error
        }
    };

    const toggleExpand = async () => {
        if (!expanded && !loaded) await loadItems();
        setExpanded(!expanded);
    };

    if (level === 0 && !loaded) return <div className="p-2 text-xs">Loading...</div>;

    return (
        <div className={`pl-${level === 0 ? 0 : 4}`}> {/* Indentation logic needs better CSS or manual padding */}
            {/* If Root, just render items. If dir, render toggle. */}
            {level === 0 ? (
                items.map(item => (
                    <FileTreeItem
                        key={item.name}
                        item={item}
                        versionId={versionId}
                        level={level}
                        onFileClick={onFileClick}
                        selectedFile={selectedFile}
                    />
                ))
            ) : null}
        </div>
    );
}

// Single Item
function FileTreeItem({ item, versionId, level, onFileClick, selectedFile }: any) {
    const [expanded, setExpanded] = useState(false);
    const [children, setChildren] = useState<FileNode[]>([]);
    const [loaded, setLoaded] = useState(false);

    const isDir = item.type === 'dir';
    const isSelected = selectedFile === item.path;

    const handleExpand = async (e: any) => {
        e.stopPropagation();
        if (isDir) {
            if (!expanded && !loaded) {
                const res = await axios.get(`${API_URL}/api/files`, { params: { versionId, path: item.path } });
                setChildren(res.data.items);
                setLoaded(true);
            }
            setExpanded(!expanded);
        } else {
            onFileClick(item.path);
        }
    };

    return (
        <div className="">
            <div
                onClick={handleExpand}
                className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer text-sm select-none transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                    }`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                {isDir ? (
                    expanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />
                ) : (
                    <span className="w-4" /> // Spacer
                )}

                {isDir ? (
                    expanded ? <FolderOpen className="w-4 h-4 text-blue-400" /> : <Folder className="w-4 h-4 text-blue-400" />
                ) : (
                    <FileCode className="w-4 h-4 text-gray-400" />
                )}

                <span className="truncate">{item.name}</span>
            </div>

            {isDir && expanded && (
                <div>
                    {children.map(child => (
                        <FileTreeItem
                            key={child.name}
                            item={child}
                            versionId={versionId}
                            level={level + 1}
                            onFileClick={onFileClick}
                            selectedFile={selectedFile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
