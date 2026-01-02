import React from 'react';
import { Activity, Square, X } from 'lucide-react';

interface BackupJob {
    jobId: string;
    target: string;
    filesUploaded: number;
    bytesUploaded: number;
    currentFile: string;
    status: 'running' | 'completed' | 'error' | 'canceled';
    error?: string;
}

interface CloudTransferPanelProps {
    activeJobs: BackupJob[];
    panelMinimized: boolean;
    setPanelMinimized: (min: boolean) => void;
    handleCancelJob: (jobId: string, clean: boolean) => void;
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const CloudTransferPanel: React.FC<CloudTransferPanelProps> = ({
    activeJobs, panelMinimized, setPanelMinimized, handleCancelJob
}) => {
    if (activeJobs.length === 0) return null;

    return (
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
    );
};

export default CloudTransferPanel;
