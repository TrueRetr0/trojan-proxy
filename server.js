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

// Proxy endpoint - fetches URLs and returns content
app.get('/api/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        
        if (!targetUrl) {
            return res.status(400).json({ error: 'URL parameter required' });
        }

        // Use dynamic import for node-fetch
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            redirect: 'follow'
        });

        const contentType = response.headers.get('content-type') || 'text/html';
        const body = await response.text();

        // Rewrite URLs in HTML to go through proxy
        let processedBody = body;
        if (contentType.includes('text/html')) {
            processedBody = body
                .replace(/href="\/\//g, 'href="https://')
                .replace(/src="\/\//g, 'src="https://')
                .replace(/href="\//g, `href="/api/proxy?url=${encodeURIComponent(new URL(targetUrl).origin)}/`)
                .replace(/src="\//g, `src="/api/proxy?url=${encodeURIComponent(new URL(targetUrl).origin)}/`);
        }

        res.setHeader('Content-Type', contentType);
        res.send(processedBody);

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
        console.log(`✨ Created by Kiaan Iyer`);
    });
}
