const express = require('express');
const { createBareServer } = require('@tomphttp/bare-server-node');
const path = require('path');
const { createServer } = require('http');

const app = express();
const server = createServer();

let bareServer;
try {
    bareServer = createBareServer('/bare/');
} catch (err) {
    console.error('Bare server init error:', err);
}

// Serve static files (your frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Serve Ultraviolet files - try to load from node_modules
try {
    const uvPath = require.resolve('@titaniumnetwork-dev/ultraviolet');
    const uvDir = path.dirname(uvPath);
    app.use('/uv/', express.static(uvDir));
} catch (err) {
    console.log('UV not in node_modules, serving from public');
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Trojan Proxy is running!',
        timestamp: new Date().toISOString()
    });
});

// Bare server handling
if (bareServer) {
    server.on('request', (req, res) => {
        if (bareServer.shouldRoute(req)) {
            bareServer.routeRequest(req, res);
        } else {
            app(req, res);
        }
    });

    server.on('upgrade', (req, socket, head) => {
        if (bareServer.shouldRoute(req)) {
            bareServer.routeUpgrade(req, socket, head);
        } else {
            socket.end();
        }
    });
} else {
    server.on('request', app);
}

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For Vercel, export the app
module.exports = app;

// For local development
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`🛡️  Trojan Proxy Server Running`);
        console.log(`📡 Server: http://localhost:${PORT}`);
        console.log(`✨ Created by Kiaan Iyer`);
    });
}
