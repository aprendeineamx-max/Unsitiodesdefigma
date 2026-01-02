const S3Service = require('./S3Service');

class CloudCache {
    constructor() {
        this.cache = {
            data: null,
            timestamp: 0,
            loading: false,
            loadPromise: null
        };
        this.partialCache = {
            data: [],
            folderCounts: new Map()
        };
        this.dependencies = null;
        this.CACHE_TTL_MS = 5 * 60 * 1000; // 5 mins
    }

    init(dependencies) {
        this.dependencies = dependencies;
    }

    getStatus() {
        return {
            isLoading: this.cache.loading,
            isReady: !!this.cache.data,
            totalFiles: this.cache.data ? this.cache.data.length : (this.partialCache.data.length || 0),
            age: this.cache.timestamp > 0 ? Math.round((Date.now() - this.cache.timestamp) / 1000) : null,
            ttl: Math.round(this.CACHE_TTL_MS / 1000)
        };
    }

    async getFiles(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh && this.cache.data && (now - this.cache.timestamp) < this.CACHE_TTL_MS) {
            return this.cache.data;
        }

        if (this.cache.loading && this.cache.loadPromise) {
            return await this.cache.loadPromise;
        }

        this.startBackgroundLoad();

        // If we have no data, we might want to wait, or return partial?
        // Current logic waits if called explicitly for "list", but "tree" triggers bg load and returns immediately.
        if (forceRefresh || !this.cache.data) {
            return await this.cache.loadPromise;
        }
        return this.cache.data;
    }

    startBackgroundLoad() {
        if (this.cache.loading || (this.cache.data && (Date.now() - this.cache.timestamp) < this.CACHE_TTL_MS)) {
            return;
        }

        this.cache.loading = true;
        this.partialCache = { data: [], folderCounts: new Map() };

        this.cache.loadPromise = this._loadFromS3()
            .then(data => {
                this.cache.data = data;
                this.cache.timestamp = Date.now();
                this.cache.loading = false;
                this.cache.loadPromise = null;
                this.partialCache = { data: [], folderCounts: new Map() };

                if (this.dependencies?.io) {
                    this.dependencies.io.emit('cache:ready', { totalFiles: data.length });
                }
                return data;
            })
            .catch(err => {
                this.cache.loading = false;
                this.cache.loadPromise = null;
                console.error('[CloudCache] Background load failed:', err);
                throw err;
            });
    }

    async _loadFromS3() {
        console.log('[CloudCache] Starting full scan...');
        const s3 = S3Service.getClient();
        let allContents = [];
        let continuationToken = null;

        do {
            const params = { Bucket: S3Service.bucketName, MaxKeys: 1000 };
            if (continuationToken) params.ContinuationToken = continuationToken;

            const data = await s3.listObjectsV2(params).promise();

            if (data.Contents) {
                const batch = data.Contents.map(item => ({
                    key: item.Key,
                    size: item.Size,
                    lastModified: item.LastModified,
                    etag: item.ETag
                }));

                allContents = allContents.concat(batch);
                this.partialCache.data = allContents;

                // Calculate and emit stats
                this._emitProgress(allContents, !data.IsTruncated);
            }

            continuationToken = data.IsTruncated ? data.NextContinuationToken : null;
        } while (continuationToken);

        console.log(`[CloudCache] Scan complete: ${allContents.length} files`);
        return allContents;
    }

    _emitProgress(allContents, isComplete) {
        if (!this.dependencies?.io) return;

        // Calculate folder stats efficiently
        // We only really need to re-calc stats for what changed, but typically we just re-calc all for simplicity in partial updates
        // Optimization: For huge buckets this might be slow loop.

        const folderStats = {};

        // Simple aggregation map
        // Optimization: Assume we only care about root-level folders or 1-level deep for the UI spinners?
        // The UI uses recursion. Let's stick to the previous robust logic but optimized.

        // Actually, the UI expects stats for ANY folder we are looking at.
        // We can't pre-calculate EVERY folder combo easily.
        // BUT, the `cloud.js` logic was calculating stats for ROOT folders mostly or just generally.
        // Let's just emit raw count for now or use the previous logic if it was working.
        // The previous logic was specifically parsing root folders.

        // Let's implement a smarter on-demand calc or just the root ones.
        // Replicating previous logic for safety:

        const statsMap = new Map();

        for (const file of allContents) {
            const parts = file.key.split('/');
            // Walk the path
            let currentPath = '';
            for (let i = 0; i < parts.length - 1; i++) {
                currentPath += parts[i] + '/';

                if (!statsMap.has(currentPath)) {
                    statsMap.set(currentPath, { folderCount: 0, fileCount: 0, totalCount: 0, folders: new Set() });
                }

                const stat = statsMap.get(currentPath);
                stat.totalCount++;

                // Is the next item a file or folder?
                // If i+1 is last item, it's a file
                if (i + 1 === parts.length - 1) {
                    stat.fileCount++;
                } else {
                    // It's a subfolder
                    const nextFolder = parts[i + 1];
                    if (!stat.folders.has(nextFolder)) {
                        stat.folders.add(nextFolder);
                        stat.folderCount++;
                    }
                }
            }
        }

        const emittedStats = {};
        for (const [key, val] of statsMap.entries()) {
            emittedStats[key] = {
                folderCount: val.folderCount,
                fileCount: val.fileCount,
                totalCount: val.totalCount,
                isComplete: isComplete
            };
        }

        this.dependencies.io.emit('cache:progress', {
            totalLoaded: allContents.length,
            folderStats: emittedStats,
            isComplete: isComplete
        });
    }

    // Get stats for a specific folder from cache/partial
    getFolderStats(folderKey) {
        const source = this.cache.data || (this.partialCache.data.length > 0 ? this.partialCache.data : null);
        if (!source) return { folderCount: null, fileCount: null, totalCount: null, isComplete: false };

        // Filter items in this folder
        const items = source.filter(f => f.key.startsWith(folderKey));

        // Direct children stats
        let fileCount = 0;
        const subfolders = new Set();

        for (const item of items) {
            const rel = item.key.slice(folderKey.length);
            const slash = rel.indexOf('/');
            if (slash === -1) fileCount++;
            else subfolders.add(rel.substring(0, slash));
        }

        return {
            folderCount: subfolders.size,
            fileCount: fileCount,
            totalCount: items.length,
            isComplete: !!this.cache.data
        };
    }
}

module.exports = new CloudCache();
