const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const s3Client = new S3Client({
    region: process.env.VULTR_REGION || 'ewr1',
    endpoint: process.env.VULTR_ENDPOINT,
    credentials: {
        accessKeyId: process.env.VULTR_ACCESS_KEY,
        secretAccessKey: process.env.VULTR_SECRET_KEY
    },
    forcePathStyle: false // Vultr support
});

async function listBuckets() {
    const data = await s3Client.send(new ListBucketsCommand({}));
    return data.Buckets;
}

async function uploadFileStream(bucketName, key, filePath) {
    const fileStream = fs.createReadStream(filePath);

    // Use lib-storage Upload helper for better large file support
    const parallelUploads3 = new Upload({
        client: s3Client,
        params: {
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
        },
    });

    parallelUploads3.on('httpUploadProgress', (progress) => {
        console.log(`Upload progress: ${progress.loaded} / ${progress.total}`);
    });

    await parallelUploads3.done();
    return `https://${process.env.VULTR_ENDPOINT.replace('https://', '')}/${bucketName}/${key}`;
}

module.exports = {
    s3Client,
    listBuckets,
    uploadFileStream
};
