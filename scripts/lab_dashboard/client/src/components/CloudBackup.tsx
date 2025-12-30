import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cloud, UploadCloud, Database, AlertCircle, Check, Archive } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CloudBackupProps {
    versionId: string | null;
}

export const CloudBackup: React.FC<CloudBackupProps> = ({ versionId }) => {
    const [buckets, setBuckets] = useState<any[]>([]);
    const [selectedBucket, setSelectedBucket] = useState('');
    const [loading, setLoading] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastBackup, setLastBackup] = useState<string | null>(null);

    useEffect(() => {
        fetchBuckets();
    }, []);

    const fetchBuckets = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/storage/buckets');
            setBuckets(res.data.buckets || []);
            if (res.data.buckets?.length > 0) {
                setSelectedBucket(res.data.buckets[0].Name);
            }
        } catch (err: any) {
            console.error(err);
            setError('Failed to list buckets. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        if (!versionId || !selectedBucket) return;
        setBackingUp(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:3000/api/storage/backup', {
                versionId,
                bucketName: selectedBucket
            });
            setLastBackup(res.data.file);
            alert(`Backup successful: ${res.data.file}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Backup failed');
        } finally {
            setBackingUp(false);
        }
    };

    if (!versionId) {
        return (
            <div className="flex h-full items-center justify-center text-slate-500">
                <p>Select an environment to manage backups</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-slate-300">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-[#252526]">
                <div className="flex items-center gap-2">
                    <Cloud className="text-purple-400" size={20} />
                    <span className="font-medium text-slate-200">Vultr Object Storage</span>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-8">

                {/* Bucket Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Target Bucket</label>
                    {loading ? (
                        <div className="h-10 bg-slate-800 rounded animate-pulse"></div>
                    ) : (
                        <select
                            value={selectedBucket}
                            onChange={(e) => setSelectedBucket(e.target.value)}
                            className="w-full bg-[#3c3c3c] border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        >
                            {buckets.map(b => (
                                <option key={b.Name} value={b.Name}>{b.Name}</option>
                            ))}
                            {buckets.length === 0 && <option value="">No buckets found</option>}
                        </select>
                    )}
                </div>

                {/* Main Action Card */}
                <div className="bg-[#252526] rounded-xl p-6 border border-slate-700/50 flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-purple-500/10 rounded-full">
                        <Archive size={48} className="text-purple-400" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-slate-100">Backup {versionId}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Compresses the entire lab directory and uploads it to Vultr.
                        </p>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {lastBackup && (
                        <div className="text-green-400 text-sm bg-green-500/10 px-4 py-2 rounded flex items-center gap-2">
                            <Check size={16} /> Last Backup: {lastBackup}
                        </div>
                    )}

                    <button
                        onClick={handleBackup}
                        disabled={backingUp || !selectedBucket}
                        className="w-full max-w-sm flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-bold shadow-lg shadow-purple-900/20"
                    >
                        {backingUp ? (
                            <UploadCloud className="animate-bounce" size={20} />
                        ) : (
                            <Cloud size={20} />
                        )}
                        {backingUp ? 'Uploading to Cloud...' : 'Start Cloud Backup'}
                    </button>

                    <p className="text-xs text-slate-500">
                        This action may take a few minutes depending on the lab size.
                    </p>
                </div>
            </div>
        </div>
    );
};
