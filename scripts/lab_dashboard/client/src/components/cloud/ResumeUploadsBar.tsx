import React from 'react';
import { RefreshCw, X } from 'lucide-react';

interface PendingJob {
    jobId: string;
    progress: {
        filesUploaded: number;
        bytesUploaded: number;
    };
}

interface ResumeUploadsBarProps {
    pendingJobs: PendingJob[];
    showResumeBar: boolean;
    setShowResumeBar: (show: boolean) => void;
    handleResumeJob: (jobId: string) => void;
}

const ResumeUploadsBar: React.FC<ResumeUploadsBarProps> = ({
    pendingJobs, showResumeBar, setShowResumeBar, handleResumeJob
}) => {
    if (pendingJobs.length === 0 || !showResumeBar) return null;

    const handleResumeAll = () => {
        pendingJobs.forEach(j => handleResumeJob(j.jobId));
    };

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
            <div className="bg-amber-500 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full animate-pulse">
                        <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold">Interrupted Uploads Detected</h3>
                        <p className="text-sm text-amber-100">
                            {pendingJobs.length} backup{pendingJobs.length > 1 ? 's' : ''} can be resumed •
                            {pendingJobs.reduce((acc, j) => acc + j.progress.filesUploaded, 0)} files already uploaded
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleResumeAll}
                        className="px-4 py-2 bg-white text-amber-600 font-bold rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Resume All
                    </button>
                    <button
                        onClick={() => setShowResumeBar(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Dismiss"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeUploadsBar;
