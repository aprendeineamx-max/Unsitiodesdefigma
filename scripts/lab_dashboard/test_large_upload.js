
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

(async () => {
    try {
        const form = new FormData();
        form.append('zipFile', fs.createReadStream('large_valid.zip'));

        console.log("Attempting upload of 50MB Valid Zip...");
        const start = Date.now();
        const res = await axios.post('http://localhost:3000/api/upload', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': 'Bearer LAB_SECRET_KEY'
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });
        const elapsed = (Date.now() - start) / 1000;
        console.log(`Upload Result: ${res.status} in ${elapsed}s`);
        console.log("Data:", res.data);
    } catch (e) {
        console.log("Upload Failed:", e.message);
        if (e.response) {
            console.log("Status:", e.response.status);
            console.log("Data:", e.response.data);
        }
    }
})();
