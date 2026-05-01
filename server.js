const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PEDIDOS_FILE = 'pedidos.json';
const MENSAJES_FILE = 'mensajes.json';

if (!fs.existsSync(PEDIDOS_FILE)) fs.writeFileSync(PEDIDOS_FILE, '[]');
if (!fs.existsSync(MENSAJES_FILE)) fs.writeFileSync(MENSAJES_FILE, '[]');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.png': 'image/png'
};

const server = http.createServer((req, res) => {
    // API Pedidos
    if (req.url === '/api/pedidos' && req.method === 'GET') {
        try {
            const data = fs.readFileSync(PEDIDOS_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch(e) { res.end('[]'); }
        return;
    }
    
    if (req.url === '/api/pedidos' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE, 'utf8'));
                pedidos.unshift({ id: Date.now(), ...data, fecha: new Date().toISOString(), estado: 'pendiente' });
                fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch(e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error' }));
            }
        });
        return;
    }
    
    if (req.url === '/api/pedidos' && req.method === 'DELETE') {
        fs.writeFileSync(PEDIDOS_FILE, '[]');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }
    
    // API Mensajes
    if (req.url === '/api/mensajes' && req.method === 'GET') {
        try {
            const data = fs.readFileSync(MENSAJES_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch(e) { res.end('[]'); }
        return;
    }
    
    if (req.url === '/api/mensajes' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const mensajes = JSON.parse(fs.readFileSync(MENSAJES_FILE, 'utf8'));
                mensajes.unshift({ id: Date.now(), ...data, fecha: new Date().toISOString() });
                fs.writeFileSync(MENSAJES_FILE, JSON.stringify(mensajes, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch(e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error' }));
            }
        });
        return;
    }
    
    if (req.url === '/api/mensajes' && req.method === 'DELETE') {
        fs.writeFileSync(MENSAJES_FILE, '[]');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }
    
    // Archivos estáticos
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log('Servidor: http://localhost:' + PORT);
});
