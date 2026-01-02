const AWS = require('aws-sdk');

class S3Service {
    constructor() {
        this.bucketName = process.env.VULTR_BUCKET_NAME || 'lab-backups';
        this.endpoint = process.env.VULTR_ENDPOINT || 'ewr1.vultrobjects.com';

        this.s3 = new AWS.S3({
            endpoint: `https://${this.endpoint}`,
            accessKeyId: process.env.VULTR_ACCESS_KEY,
            secretAccessKey: process.env.VULTR_SECRET_KEY,
            s3ForcePathStyle: true,
            signatureVersion: 'v4'
        });
    }

    async ensureBucket() {
        try {
            await this.s3.headBucket({ Bucket: this.bucketName }).promise();
            return { exists: true, created: false };
        } catch (err) {
            if (err.code === 'NotFound' || err.statusCode === 404) {
                await this.s3.createBucket({ Bucket: this.bucketName }).promise();
                return { exists: true, created: true };
            }
            throw err;
        }
    }

    async uploadStream(key, stream, contentType, metadata = {}) {
        return this.s3.upload({
            Bucket: this.bucketName,
            Key: key,
            Body: stream,
            ContentType: contentType,
            Metadata: metadata
        }).promise();
    }

    async uploadBuffer(key, buffer, contentType, metadata = {}) {
        return this.s3.upload({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            Metadata: metadata
        }).promise();
    }

    async deleteObject(key) {
        return this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: key
        }).promise();
    }

    async deleteObjects(keys) {
        // S3 limit is 1000 per partial
        if (keys.length === 0) return;
        return this.s3.deleteObjects({
            Bucket: this.bucketName,
            Delete: { Objects: keys.map(k => ({ Key: k })) }
        }).promise();
    }

    getReadStream(key) {
        return this.s3.getObject({
            Bucket: this.bucketName,
            Key: key
        }).createReadStream();
    }

    async listObjects(prefix = '', delimiter = null, maxKeys = 1000) {
        const params = {
            Bucket: this.bucketName,
            Prefix: prefix,
            MaxKeys: maxKeys
        };
        if (delimiter) params.Delimiter = delimiter;
        return this.s3.listObjectsV2(params).promise();
    }

    // NEW: For File Preview
    async getSignedUrl(key, expiresInSeconds = 900) {
        return this.s3.getSignedUrlPromise('getObject', {
            Bucket: this.bucketName,
            Key: key,
            Expires: expiresInSeconds
        });
    }

    getClient() {
        return this.s3;
    }
}

module.exports = new S3Service();
