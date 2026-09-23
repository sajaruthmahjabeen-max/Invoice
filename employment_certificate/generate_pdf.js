const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = 'c:/Users/shame/kms/employment_certificate';
const profileDir = 'c:/Users/shame/kms/employment_certificate/temp_profile';

if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
}

const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(dir, reqPath);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        return res.end('Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.css': 'text/css',
        '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(8989, () => {
    console.log('Server running on http://localhost:8989');
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const outPdf = path.join(dir, 'KMS_Pharmaceuticals_Employment_Certificate_Aligned.pdf');
    const cmd = `"${chromePath}" --headless=new --user-data-dir="${profileDir}" --no-first-run --no-default-browser-check --disable-sync --disable-background-networking --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outPdf}" http://localhost:8989/index.html`;
    try {
        console.log('Running Chrome print...');
        execSync(cmd, { stdio: 'inherit', timeout: 20000 });
        console.log('Chrome finished.');
    } catch (e) {
        console.error('Error running chrome:', e.message);
    } finally {
        server.close();
        console.log('Server stopped.');
    }
});
