import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GitBranch, Upload, Check, RefreshCw, Play, AlertCircle, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface GitStatus {
    isRepo: boolean;
    currentBranch?: string;
    status?: {
        not_added: string[];
        created: string[];
        deleted: string[];
        modified: string[];
        renamed: string[];
        staged: string[];
    };
}

interface GitControlProps {
    versionId: string | null;
}

export const GitControl: React.FC<GitControlProps> = ({ versionId }) => {
    const [status, setStatus] = useState<GitStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [commitMessage, setCommitMessage] = useState('');
    const [pushing, setPushing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        if (!versionId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`http://localhost:3000/api/git/status?versionId=${versionId}`);
            setStatus(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to fetch git status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [versionId]);

    const handleInit = async () => {
        if (!versionId) return;
        try {
            await axios.post('http://localhost:3000/api/git/init', { versionId });
            fetchStatus();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Init failed');
        }
    };

    const handleCommit = async () => {
        if (!versionId || !commitMessage) return;
        try {
            await axios.post('http://localhost:3000/api/git/commit', {
                versionId,
                message: commitMessage
            });
            setCommitMessage('');
            fetchStatus();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Commit failed');
        }
    };

    const handlePush = async () => {
        if (!versionId) return;
        setPushing(true);
        try {
            await axios.post('http://localhost:3000/api/git/push', { versionId });
            alert('Push successful!');
        } catch (err: any) {
            alert('Push failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setPushing(false);
        }
    };

    if (!versionId) {
        return (
            <div className="flex h-full items-center justify-center text-slate-500">
                <p>Select an environment to view Git controls</p>
            </div>
        );
    }

    if (loading && !status) {
        return <div className="p-8 text-center text-slate-400">Loading Git status...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-400 mb-2 flex items-center justify-center gap-2">
                    <AlertCircle size={20} /> {error}
                </div>
                <button onClick={fetchStatus} className="text-blue-400 hover:underline">Retry</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-slate-300">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-[#252526]">
                <div className="flex items-center gap-2">
                    <GitBranch className="text-blue-400" size={20} />
                    <span className="font-medium text-slate-200">Source Control</span>
                    {status?.isRepo && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                            {status.currentBranch}
                        </span>
                    )}
                </div>
                <button
                    onClick={fetchStatus}
                    className="p-1.5 hover:bg-slate-700 rounded-md transition-colors"
                    title="Refresh Status"
                >
                    <RefreshCw size={16} className={clsx({ 'animate-spin': loading })} />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
                {!status?.isRepo ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                        <div className="p-4 bg-slate-800 rounded-full">
                            <GitBranch size={48} className="text-slate-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-slate-200">Not a Git Repository</h3>
                            <p className="text-sm text-slate-500 mt-1">Initialize git to track changes.</p>
                        </div>
                        <button
                            onClick={handleInit}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors font-medium"
                        >
                            <Play size={16} /> Initialize Repository
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Changes List */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500 px-1">
                                <span>Changes</span>
                                <span className="bg-slate-700 px-1.5 rounded text-slate-300">
                                    {(status.status?.modified.length || 0) + (status.status?.not_added.length || 0)}
                                </span>
                            </div>

                            <div className="bg-[#252526] rounded-lg border border-slate-700/50 overflow-hidden">
                                {status.status?.modified.map(file => (
                                    <div key={file} className="flex items-center px-3 py-2 border-b border-slate-700/50 last:border-0 text-sm hover:bg-slate-700/30">
                                        <span className="text-yellow-400 w-4 font-bold">M</span>
                                        <span className="truncate flex-1">{file}</span>
                                    </div>
                                ))}
                                {status.status?.not_added.map(file => (
                                    <div key={file} className="flex items-center px-3 py-2 border-b border-slate-700/50 last:border-0 text-sm hover:bg-slate-700/30">
                                        <span className="text-green-400 w-4 font-bold">U</span>
                                        <span className="truncate flex-1">{file}</span>
                                    </div>
                                ))}
                                {status.status?.deleted.map(file => (
                                    <div key={file} className="flex items-center px-3 py-2 border-b border-slate-700/50 last:border-0 text-sm hover:bg-slate-700/30">
                                        <span className="text-red-400 w-4 font-bold">D</span>
                                        <span className="truncate flex-1">{file}</span>
                                    </div>
                                ))}

                                {(!status.status?.modified.length && !status.status?.not_added.length && !status.status?.deleted.length) && (
                                    <div className="p-4 text-center text-slate-500 italic text-sm">
                                        No changes to commit (working tree clean)
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4 border-t border-slate-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={commitMessage}
                                    onChange={e => setCommitMessage(e.target.value)}
                                    placeholder="Message (e.g. 'Fix login bug')"
                                    className="flex-1 bg-[#3c3c3c] border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={handleCommit}
                                    disabled={!commitMessage}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors text-sm font-medium flex items-center gap-1"
                                >
                                    <Check size={16} />
                                    Commit
                                </button>
                            </div>

                            <button
                                onClick={handlePush}
                                disabled={pushing}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0d47a1] hover:bg-blue-700 text-white rounded-md transition-colors font-medium border border-blue-500/30"
                            >
                                {pushing ? (
                                    <RefreshCw className="animate-spin" size={16} />
                                ) : (
                                    <Upload size={16} />
                                )}
                                {pushing ? 'Pushing...' : 'Push to Origin'}
                            </button>
                            <p className="text-xs text-center text-slate-500">
                                Pushes current branch to 'origin' using configured token.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
