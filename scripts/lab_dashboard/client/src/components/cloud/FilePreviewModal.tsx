import React, { useEffect, useState } from 'react';
import { X, Download, Loader2, FileText, ExternalLink } from 'lucide-react';


interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileKey: string | null;
    fileName: string | null;
    fileType?: string; // crude type 'image', 'code', etc
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, fileKey, fileName }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<string | null>(null); // For text content
    const [contentType, setContentType] = useState<'image' | 'pdf' | 'text' | 'video' | 'unknown'>('unknown');

    useEffect(() => {
        if (isOpen && fileKey) {
            loadPreview();
        } else {
            setPreviewUrl(null);
            setContent(null);
            setError(null);
        }
    }, [isOpen, fileKey]);

    const loadPreview = async () => {
        if (!fileKey) return;
        setLoading(true);
        setError(null);

        // Determine type based on extension
        const ext = fileKey.split('.').pop()?.toLowerCase();
        let type: typeof contentType = 'unknown';

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) type = 'image';
        else if (['pdf'].includes(ext || '')) type = 'pdf';
        else if (['mp4', 'webm', 'mov'].includes(ext || '')) type = 'video';
        else if (['js', 'jsx', 'ts', 'tsx', 'json', 'css', 'html', 'md', 'txt', 'py', 'yml', 'xml'].includes(ext || '')) type = 'text';

        setContentType(type);

        try {
            // Fetch Signed URL
            const res = await fetch(`/api/cloud/preview/${encodeURIComponent(fileKey)}`);
            if (!res.ok) throw new Error('Failed to get preview URL');
            const data = await res.json();

            setPreviewUrl(data.url);

            // If text, fetch the content to display
            if (type === 'text') {
                const textRes = await fetch(data.url);
                if (textRes.ok) {
                    const text = await textRes.text();
                    setContent(text);
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error loading preview');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (previewUrl) {
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = fileName || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-5xl h-[85vh] flex flex-col bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-[#333] flex flex-row items-center justify-between shrink-0 bg-[#1e1e1e]">
                    <h2 className="text-lg font-semibold text-white truncate pr-8">{fileName}</h2>
                    <div className="flex items-center gap-2">
                        {previewUrl && (
                            <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-md">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative bg-[#0f0f0f] flex items-center justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span>Loading preview...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center p-4">
                            <p className="mb-2">⚠️ {error}</p>
                            {previewUrl && (
                                <button onClick={handleDownload} className="mt-4 px-4 py-2 border border-[#333] rounded hover:bg-[#333] text-white transition-colors">
                                    Download to View
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {contentType === 'image' && previewUrl && (
                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                            )}

                            {contentType === 'video' && previewUrl && (
                                <video controls className="max-w-full max-h-full">
                                    <source src={previewUrl} />
                                    Your browser does not support video.
                                </video>
                            )}

                            {contentType === 'pdf' && previewUrl && (
                                <iframe src={previewUrl} className="w-full h-full border-none" title="PDF Preview" />
                            )}

                            {contentType === 'text' && (
                                <div className="w-full h-full overflow-auto p-8 bg-[#1e1e1e]">
                                    <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap font-[Consolas,Monaco,monospace]">
                                        {content || 'Loading text...'}
                                    </pre>
                                </div>
                            )}

                            {contentType === 'unknown' && (
                                <div className="text-center text-gray-400">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="mb-4">Preview not available for this file type.</p>
                                    <button onClick={handleDownload} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                                        Download File
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
