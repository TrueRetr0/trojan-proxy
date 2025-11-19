import express from 'express';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const bareServer = createBareServer('/bare/');

// Serve static files (your frontend)
app.use(express.static('public'));

// Serve Ultraviolet files
app.use('/uv/', express.static(uvPath));

// Bare server upgrade handling
server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

// Handle bare requests
server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Trojan Proxy is running!' });
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🛡️  Trojan Proxy Server Running`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🔒 Bare Server: /bare/`);
    console.log(`⚡ Ultraviolet: /uv/`);
    console.log(`\n✨ Created by Kiaan Iyer`);
});
