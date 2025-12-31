
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

(async () => {
    try {
        const form = new FormData();
        form.append('zipFile', fs.createReadStream('large_corrupt.zip'));

        console.log("Attempting upload of 50MB CORRUPT Zip...");
        const res = await axios.post('http://localhost:3000/api/upload', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': 'Bearer LAB_SECRET_KEY'
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            validateStatus: () => true // Accept all codes
        });
        console.log("Upload Result:", res.status, res.data);
    } catch (e) {
        console.log("Network Error:", e.message);
    }
})();
