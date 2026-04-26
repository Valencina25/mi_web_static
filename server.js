const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PEDIDOS_FILE = 'pedidos.json';

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.png': 'image/png'
};

if (!fs.existsSync(PEDIDOS_FILE)) {
    fs.writeFileSync(PEDIDOS_FILE, '[]');
}

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (req.url === '/api/pedidos' && req.method === 'GET') {
                try {
                    const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE, 'utf-8'));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(pedidos));
                } catch { res.end('[]'); }
                return;
            }
            
            if (req.url === '/api/pedidos' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const data = JSON.parse(body);
                    const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE, 'utf-8'));
                    pedidos.unshift({ id: Date.now(), ...data, fecha: new Date().toISOString(), estado: 'pendiente' });
                    fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                });
                return;
            }
            
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`Admin: http://localhost:${PORT}/admin.html`);
});