const fs = require('fs');
const path = require('path');

const zipFile = path.join(__dirname, '../temp_figma_v23/figma-zip-final.json');
const data = JSON.parse(fs.readFileSync(zipFile, 'utf8'));

const filesToCheck = ['package.json', 'App.tsx', 'AdminPage.tsx', 'vite.config.ts'];
const found = {};
const paths = data.map(f => f.path);

filesToCheck.forEach(f => {
    // Check if any path ends with the filename
    found[f] = paths.some(p => p.endsWith(f));
});

console.log('ZIP Check Results:', found);
console.log('Total ZIP files:', data.length);
console.log('Sample paths:', paths.slice(0, 10));
