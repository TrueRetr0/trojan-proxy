const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Use official Scramjet instance
const SCRAMJET_INSTANCE = 'https://scramjet.mercurywork.shop';

// Scramjet URL encoding (Base64 with URL encoding)
function encodeScramjetUrl(url) {
    return encodeURIComponent(btoa(url));
}

// Proxy endpoint that routes through Scramjet
app.get('/api/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        
        if (!targetUrl) {
            return res.status(400).json({ error: 'URL parameter required' });
        }

        // Encode URL for Scramjet
        const encodedUrl = encodeScramjetUrl(targetUrl);
        const proxyUrl = `${SCRAMJET_INSTANCE}/scramjet/${encodedUrl}`;

        // Use dynamic import for node-fetch
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(proxyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': SCRAMJET_INSTANCE
            },
            redirect: 'follow'
        });

        const contentType = response.headers.get('content-type') || 'text/html';
        const body = await response.buffer();

        res.setHeader('Content-Type', contentType);
        res.send(body);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Proxy request failed', 
            message: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'online',
        service: 'Trojan Proxy',
        backend: 'Scramjet (MercuryWorkshop)',
        instance: SCRAMJET_INSTANCE,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        creator: 'Kiaan Iyer'
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export for Vercel
module.exports = app;

// Local development
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🛡️ Trojan Proxy Server Running on port ${PORT}`);
        console.log(`⚡ Using Scramjet backend for bypass`);
        console.log(`✨ Created by Kiaan Iyer`);
    });
}
