import React, { useEffect, useState } from 'react';
import { X, Download, Loader2, FileText, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[85vh] flex flex-col bg-[#1e1e1e] border-[#333] text-white p-0">
                <DialogHeader className="px-6 py-4 border-b border-[#333] flex flex-row items-center justify-between shrink-0">
                    <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
                    <div className="flex items-center gap-2">
                        {previewUrl && (
                            <Button variant="ghost" size="sm" onClick={handleDownload} className="text-gray-400 hover:text-white">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-[#333]">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </DialogHeader>

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
                                <Button onClick={handleDownload} variant="outline" className="mt-4 border-[#333]">
                                    Download to View
                                </Button>
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
                                    <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                                        Download File
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FilePreviewModal;
