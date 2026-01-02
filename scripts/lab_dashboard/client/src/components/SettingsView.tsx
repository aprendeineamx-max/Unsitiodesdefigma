import React, { useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ResourceMonitor } from './ResourceMonitor';
import { Settings as SettingsIcon, Activity, Trash2, AlertTriangle, Shield, Loader2, CheckCircle, Eye, EyeOff, Save, FileText, Key, Server, Database, Rocket, Terminal } from 'lucide-react';

interface SettingsViewProps {
    stats: any;
    selectedVersion: string | null;
}

export function SettingsView({ stats, selectedVersion }: SettingsViewProps) {
    const [purging, setPurging] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [purgeResult, setPurgeResult] = useState<{ success: boolean; count: number } | null>(null);

    // Deployment State
    const [deploying, setDeploying] = useState(false);
    const [deployLogs, setDeployLogs] = useState<string[]>([]);
    const logsEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const socket = io(); // Connect to same host

        socket.on('deploy-log', (msg: string) => {
            setDeployLogs(prev => [...prev, msg]);
        });

        socket.on('deploy-status', (stat: any) => {
            if (stat.status === 'success') {
                setDeployLogs(prev => [...prev, '\n✅ Deployment Successful!']);
                setDeploying(false);
            } else {
                setDeployLogs(prev => [...prev, '\n❌ Deployment Failed.']);
                setDeploying(false);
            }
        });

        return () => { socket.disconnect(); };
    }, []);

    // Scroll to bottom of logs
    React.useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [deployLogs]);

    const handleDeploy = async () => {
        if (!confirm('Are you sure you want to deploy to PRODUCTION? This will overwrite the live server.')) return;
        setDeploying(true);
        setDeployLogs(['Initiating Deployment Sequence...']);
        try {
            await axios.post('/api/system/deploy'); // Updated route
        } catch (err: any) {
            setDeployLogs(prev => [...prev, `❌ Error starting deploy: ${err.message}`]);
            setDeploying(false);
        }
    };

    // Vultr State
    const [vultrConfig, setVultrConfig] = useState({
        VULTR_ENDPOINT: '',
        VULTR_ACCESS_KEY: '',
        VULTR_SECRET_KEY: '',
        VULTR_BUCKET_NAME: ''
    });
    const [loadingVultr, setLoadingVultr] = useState(false);
    const [savingVultr, setSavingVultr] = useState(false);
    const [showSecrets, setShowSecrets] = useState(false);

    React.useEffect(() => {
        loadVultrConfig();
    }, []);

    const loadVultrConfig = async () => {
        setLoadingVultr(true);
        try {
            const res = await axios.get('/api/config/vultr');
            setVultrConfig(prev => ({ ...prev, ...res.data }));
        } catch (err) { console.error(err); }
        finally { setLoadingVultr(false); }
    };

    const handleSaveVultr = async () => {
        setSavingVultr(true);
        try {
            await axios.post('/api/config/vultr', vultrConfig);
            alert('✅ Credentials updated! You may need to restart the server for changes to take effect.');
        } catch (err: any) {
            alert('Update failed: ' + err.message);
        } finally {
            setSavingVultr(false);
        }
    };

    const handleOpenEnv = async () => {
        try {
            await axios.post('/api/config/open-env');
        } catch (err) { console.error(err); }
    };

    const handleVultrChange = (key: string, value: string) => {
        setVultrConfig(prev => ({ ...prev, [key]: value }));
    };

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

            {/* Vultr Credentials Section */}
            <div className="space-y-4">
                VULTR_ENDPOINT: '',
                VULTR_ACCESS_KEY: '',
                VULTR_SECRET_KEY: '',
                VULTR_BUCKET_NAME: ''
    });
                const [loadingVultr, setLoadingVultr] = useState(false);
                const [savingVultr, setSavingVultr] = useState(false);
                const [showSecrets, setShowSecrets] = useState(false);

    React.useEffect(() => {
                    loadVultrConfig();
    }, []);

    const loadVultrConfig = async () => {
                    setLoadingVultr(true);
                try {
            const res = await axios.get('/api/config/vultr');
            setVultrConfig(prev => ({...prev, ...res.data }));
        } catch (err) {console.error(err); }
                finally {setLoadingVultr(false); }
    };

    const handleSaveVultr = async () => {
                    setSavingVultr(true);
                try {
                    await axios.post('/api/config/vultr', vultrConfig);
                alert('✅ Credentials updated! You may need to restart the server for changes to take effect.');
        } catch (err: any) {
                    alert('Update failed: ' + err.message);
        } finally {
                    setSavingVultr(false);
        }
    };

    const handleOpenEnv = async () => {
        try {
                    await axios.post('/api/config/open-env');
        } catch (err) {console.error(err); }
    };

    const handleVultrChange = (key: string, value: string) => {
                    setVultrConfig(prev => ({ ...prev, [key]: value }));
    };

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
                setPurgeResult({success: true, count: res.data.deletedCount });
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

                    {/* One-Click Deployment Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Rocket className="w-5 h-5 text-purple-600" />
                            One-Click Production Deployment
                        </h3>

                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-purple-900/50 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Live Status</h4>
                                    <p className="text-sm text-gray-500">Deploy current "Hot Reload" state to micuenta.shop</p>
                                </div>
                                <button
                                    onClick={handleDeploy}
                                    disabled={deploying}
                                    className={`px-6 py-3 font-bold text-white rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 ${deploying ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'}`}
                                >
                                    {deploying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                                    {deploying ? 'Deploying...' : 'Deploy to PROD 🚀'}
                                </button>
                            </div>

                            {/* Terminal Window */}
                            <div className="bg-slate-950 rounded-lg border border-slate-700 font-mono text-xs md:text-sm p-4 h-64 overflow-y-auto shadow-inner custom-scrollbar">
                                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-800">
                                    <Terminal className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-400 font-semibold">Deployment Console</span>
                                </div>
                                <div className="space-y-1">
                                    {deployLogs.length === 0 && (
                                        <div className="text-slate-600 italic">Ready to deploy... Logs will appear here.</div>
                                    )}
                                    {deployLogs.map((log, i) => (
                                        <div key={i} className="text-green-400 whitespace-pre-wrap">{log}</div>
                                    ))}
                                    <div ref={logsEndRef} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vultr Credentials Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-amber-500" />
                                Cloud Storage Credentials (Vultr)
                            </h3>
                            <button onClick={handleOpenEnv} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors">
                                <FileText className="w-4 h-4" />
                                Open .env File
                            </button>
                        </div>

                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-4 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Endpoint URL</label>
                                    <div className="relative">
                                        <Server className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <input
                                            className="w-full pl-9 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="ewr1.vultrobjects.com"
                                            value={vultrConfig.VULTR_ENDPOINT}
                                            onChange={e => handleVultrChange('VULTR_ENDPOINT', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bucket Name</label>
                                    <div className="relative">
                                        <Database className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <input
                                            className="w-full pl-9 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="my-bucket"
                                            value={vultrConfig.VULTR_BUCKET_NAME}
                                            onChange={e => handleVultrChange('VULTR_BUCKET_NAME', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Access Key</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <input
                                            className="w-full pl-9 pr-10 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            type={showSecrets ? 'text' : 'password'}
                                            value={vultrConfig.VULTR_ACCESS_KEY}
                                            onChange={e => handleVultrChange('VULTR_ACCESS_KEY', e.target.value)}
                                        />
                                        <button onClick={() => setShowSecrets(!showSecrets)} className="absolute right-3 top-2.5 text-gray-400 hover:text-white">
                                            {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Secret Key</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <input
                                            className="w-full pl-9 pr-10 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            type={showSecrets ? 'text' : 'password'}
                                            value={vultrConfig.VULTR_SECRET_KEY}
                                            onChange={e => handleVultrChange('VULTR_SECRET_KEY', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-slate-700">
                                <button onClick={handleSaveVultr} disabled={savingVultr} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                                    {savingVultr ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Credentials
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                );
}
