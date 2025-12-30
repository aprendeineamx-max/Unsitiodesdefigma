const detect = require('detect-port');

console.log('Type of detect:', typeof detect);
console.log('Keys:', Object.keys(detect));
console.log('detect.default:', typeof detect.default);

(async () => {

    try {
        console.log('Checking port 5173...');
        const port = await detect(5173);
        console.log('Available port:', port);
    } catch (err) {
        console.error('Error detecting port:', err);
    }
})();
