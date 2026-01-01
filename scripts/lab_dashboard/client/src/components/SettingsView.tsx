import React, { useState } from 'react';
import axios from 'axios';
import { ResourceMonitor } from './ResourceMonitor';
import { Settings as SettingsIcon, Activity, Trash2, AlertTriangle, Shield, Loader2, CheckCircle } from 'lucide-react';

interface SettingsViewProps {
    stats: any;
    selectedVersion: string | null;
}

export function SettingsView({ stats, selectedVersion }: SettingsViewProps) {
    const [purging, setPurging] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [purgeResult, setPurgeResult] = useState<{ success: boolean; count: number } | null>(null);

    const handlePurge = async () => {
        if (confirmText !== 'PURGE') {
            alert('Please type PURGE to confirm.');
            return;
        }

        setPurging(true);
        setPurgeResult(null);

        try {
            // First stop all active jobs and clean
            await axios.post('/api/cloud/jobs/stop-all', { clean: true });

            // Then purge the entire bucket
            const res = await axios.post('/api/cloud/purge');
            setPurgeResult({ success: true, count: res.data.deletedCount });
            setShowConfirm(false);
            setConfirmText('');
        } catch (err: any) {
            alert('Purge failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setPurging(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 space-y-8 relative">
            {/* Fullscreen Purge Overlay */}
            {purging && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-md">
                        <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Purging Storage...</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-center">
                            Deleting all files from Object Storage. This may take a few minutes.
                            <br />
                            <strong>Do not close this page.</strong>
                        </p>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <SettingsIcon className="w-6 h-6 text-gray-500" />
                    Settings
                </h2>
            </div>

            {/* System Pulse */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    System Pulse
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Real-time monitoring of active ZIP processes and system resources
                </p>
                <ResourceMonitor stats={stats} selectedVersion={selectedVersion} />
            </div>

            {/* Danger Zone */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                </h3>

                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
                            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-red-700 dark:text-red-300 mb-1">
                                Purge All Cloud Storage
                            </h4>
                            <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                                This will <strong>permanently delete ALL files</strong> from your Object Storage bucket.
                                This action cannot be undone. All backups, uploads, and mirrored data will be lost forever.
                            </p>

                            {purgeResult && (
                                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-green-700 dark:text-green-300 font-medium">
                                        Successfully deleted {purgeResult.count} objects. Storage is now empty.
                                    </span>
                                </div>
                            )}

                            {!showConfirm ? (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Everything
                                </button>
                            ) : (
                                <div className="space-y-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-red-300 dark:border-red-700">
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                                        <Shield className="w-5 h-5" />
                                        Confirmation Required
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Type <code className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded font-mono font-bold">PURGE</code> to confirm:
                                    </p>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder="Type PURGE here..."
                                        className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        disabled={purging}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handlePurge}
                                            disabled={purging || confirmText !== 'PURGE'}
                                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {purging ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Purging...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    Confirm Purge
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => { setShowConfirm(false); setConfirmText(''); }}
                                            disabled={purging}
                                            className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Other Settings */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h3>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-gray-500 dark:text-gray-400">
                        Additional settings coming soon...
                    </p>
                </div>
            </div>
        </div>
    );
}
