// Ultraviolet Service Worker
importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts(__uv$config.sw || '/uv/uv.sw.js');

const uv = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
    event.respondWith(
        (async () => {
            if (uv.route(event.request)) {
                return await uv.fetch(event.request);
            }
            return await fetch(event.request);
        })()
    );
});
