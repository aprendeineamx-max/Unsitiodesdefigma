
const AWS = require('aws-sdk');
require('dotenv').config({ path: '../.env' });

const s3 = new AWS.S3({
    endpoint: `https://${process.env.VULTR_ENDPOINT}`,
    accessKeyId: process.env.VULTR_ACCESS_KEY,
    secretAccessKey: process.env.VULTR_SECRET_KEY,
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
});

const BUCKET_NAME = process.env.VULTR_BUCKET_NAME || 'lab-backups';

async function clearBucket() {
    try {
        console.log(`Listing objects in ${BUCKET_NAME}...`);
        const listedObjects = await s3.listObjectsV2({ Bucket: BUCKET_NAME }).promise();

        if (listedObjects.Contents.length === 0) {
            console.log('Bucket is already empty.');
            return;
        }

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Delete: { Objects: [] }
        };

        listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });

        console.log(`Deleting ${listedObjects.Contents.length} objects...`);
        await s3.deleteObjects(deleteParams).promise();
        console.log('Successfully deleted all objects.');

        if (listedObjects.IsTruncated) await clearBucket();
    } catch (err) {
        console.error('Error clearing bucket:', err);
    }
}

clearBucket();
