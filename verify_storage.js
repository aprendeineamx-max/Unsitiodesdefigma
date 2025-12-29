import https from 'https';

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMDI1OSwiZXhwIjoyMDgyMDk2MjU5fQ.h7UOc0Kd0ofFJz6YQYs4hgSvLkxl0-grfJS1VuzSPoo';

const options = {
    hostname: 'bntwyvwavxgspvcvelay.supabase.co',
    path: '/storage/v1/object/list/documentation',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
    }
};

const body = JSON.stringify({
    prefix: 'docs',
    limit: 100
});

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Files in docs/:');
        const files = JSON.parse(data);
        if (Array.isArray(files)) {
            files.forEach(f => {
                console.log(`  - ${f.name} (${f.metadata?.size || 0} bytes, created: ${f.created_at})`);
            });
            console.log(`\nTotal: ${files.length} files`);
        } else {
            console.log('Response:', data);
        }
    });
});

req.on('error', e => console.error('Error:', e));
req.write(body);
req.end();
