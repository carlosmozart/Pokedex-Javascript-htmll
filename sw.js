const CACHE_NAME = 'pokedex-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/main.js',
    './js/api.js',
    './js/ui.js',
    './js/config.js',
    './js/state.js',
    './js/utils.js',
    './manifest.json',
    './images/miss.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', event => {
    // Only cache requests for same origin and static files (avoid caching data API aggressively if we don't want to)
    if (event.request.url.includes('pokeapi.co')) return;

    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Se encontrar no cache, retorna. Senão, faz fetch normal.
            return response || fetch(event.request).then(fetchRes => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request.url, fetchRes.clone());
                    return fetchRes;
                });
            });
        }).catch(() => {
            // Em caso de falha offline completa
            if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('./index.html');
            }
        })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
