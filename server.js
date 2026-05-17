const http = require('http');
const fs = require('fs');
const path = require('path');
let Pool;
let pool = null;

try {
    Pool = require('pg').Pool;
    pool = new Pool({
        connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&sslmode=verify-full' : '?sslmode=verify-full') : null,
        ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false
    });
} catch(e) {
    console.log('pg module not found, using file storage');
}

const PORT = process.env.PORT || 3000;
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.png': 'image/png'
};

// Crear tablas si no existen
async function initDB() {
    if (!pool) {
        console.log('No pool available, usando archivos locales');
        if (!fs.existsSync('pedidos.json')) fs.writeFileSync('pedidos.json', '[]');
        if (!fs.existsSync('mensajes.json')) fs.writeFileSync('mensajes.json', '[]');
        return;
    }
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id SERIAL PRIMARY KEY,
                data JSONB,
                fecha TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS mensajes (
                id SERIAL PRIMARY KEY,
                data JSONB,
                fecha TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Base de datos inicializada');
    } catch(e) {
        console.error('Error DB:', e.message);
    }
}

initDB();

const server = http.createServer(async (req, res) => {
    // API Pedidos
    if (req.url === '/api/pedidos' && req.method === 'GET') {
        try {
            if (process.env.DATABASE_URL) {
                const result = await pool.query('SELECT data FROM pedidos ORDER BY fecha DESC');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows.map(r => r.data)));
            } else {
                const data = fs.readFileSync('pedidos.json', 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        } catch(e) {
            res.end('[]');
        }
        return;
    }

    if (req.url === '/api/pedidos' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const pedido = { ...data, fecha: new Date().toISOString(), estado: 'pendiente' };
                if (process.env.DATABASE_URL) {
                    await pool.query('INSERT INTO pedidos(data) VALUES($1)', [JSON.stringify(pedido)]);
                } else {
                    const pedidos = JSON.parse(fs.readFileSync('pedidos.json', 'utf8'));
                    pedidos.unshift(pedido);
                    fs.writeFileSync('pedidos.json', JSON.stringify(pedidos, null, 2));
                }
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
        try {
            if (process.env.DATABASE_URL) {
                await pool.query('DELETE FROM pedidos');
            } else {
                fs.writeFileSync('pedidos.json', '[]');
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch(e) {
            res.end(JSON.stringify({ error: 'Error' }));
        }
        return;
    }

    // API Mensajes
    if (req.url === '/api/mensajes' && req.method === 'GET') {
        try {
            if (process.env.DATABASE_URL) {
                const result = await pool.query('SELECT data FROM mensajes ORDER BY fecha DESC');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows.map(r => r.data)));
            } else {
                const data = fs.readFileSync('mensajes.json', 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        } catch(e) {
            res.end('[]');
        }
        return;
    }

    if (req.url === '/api/mensajes' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const mensaje = { ...data, fecha: new Date().toISOString() };
                if (process.env.DATABASE_URL) {
                    await pool.query('INSERT INTO mensajes(data) VALUES($1)', [JSON.stringify(mensaje)]);
                } else {
                    const mensajes = JSON.parse(fs.readFileSync('mensajes.json', 'utf8'));
                    mensajes.unshift(mensaje);
                    fs.writeFileSync('mensajes.json', JSON.stringify(mensajes, null, 2));
                }
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
        try {
            if (process.env.DATABASE_URL) {
                await pool.query('DELETE FROM mensajes');
            } else {
                fs.writeFileSync('mensajes.json', '[]');
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch(e) {
            res.end(JSON.stringify({ error: 'Error' }));
        }
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
