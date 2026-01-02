export interface Backup {
    key: string;
    size: number;
    lastModified: string;
    versionId: string;
    etag: string;
}

export interface BackupJob {
    jobId: string;
    target: string;
    filesUploaded: number;
    bytesUploaded: number;
    currentFile: string;
    status: 'running' | 'completed' | 'error' | 'canceled';
    error?: string;
}

export interface PendingJob {
    jobId: string;
    sourcePath: string;
    targetPrefix: string;
    startedAt: string;
    lastActivity: string;
    status: string;
    progress: {
        filesUploaded: number;
        bytesUploaded: number;
    };
    uploadedKeys: string[];
}

export interface TreeFolder {
    key: string;
    name: string;
    type: 'folder';
    folderCount: number | null;
    fileCount: number | null;
    totalCount: number | null;
    isLoading: boolean;
    isComplete: boolean;
}

export interface TreeFile {
    key: string;
    name: string;
    size: number;
    lastModified: string;
    type: 'file';
    etag: string;
}

export interface TreeData {
    prefix: string;
    folders: TreeFolder[];
    files: TreeFile[];
    cacheStatus: {
        isLoading: boolean;
        isReady: boolean;
        totalFiles: number | null;
    };
}

// Unified item for display (Grid/List)
export interface CloudItem {
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
