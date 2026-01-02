const AWS = require('aws-sdk');

const configs = [
    {
        region: 'ewr1',
        accessKeyId: '4BW2T0AX55SN0V0C14UN',
        secretAccessKey: '8Hjed5xmFILX0buJ5H7BB4NPaxrC1liKM9WIoRNB'
    },
    {
        region: 'sjc1',
        accessKeyId: '3Y3MFSZPD8XCC5IMGZWH',
        secretAccessKey: 'lq95CVjRWqM3CPSXp1Y7P0S8W76bQKz37CtplahX'
    }
];

async function list() {
    for (const conf of configs) {
        console.log(`Checking Region: ${conf.region}`);
        const s3 = new AWS.S3({
            endpoint: `https://${conf.region}.vultrobjects.com`,
            accessKeyId: conf.accessKeyId,
            secretAccessKey: conf.secretAccessKey,
            s3ForcePathStyle: true
        });
        try {
            const data = await s3.listBuckets().promise();
            console.log('Buckets:', data.Buckets.map(b => b.Name));
        } catch (e) {
            console.log('Error:', e.message);
        }
        console.log('---');
    }
}

list();
