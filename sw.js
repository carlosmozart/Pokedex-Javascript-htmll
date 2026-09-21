const CACHE_NAME = 'pokedex-cache-v2';
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
    './data/shared/offline-manifest.json',
    './images/miss.png'
];

const expandOfflineManifest = manifest => Object.values(manifest.geracoes || {})
    .flatMap(generation => Object.values(generation)
        .flatMap(section => Object.entries(section.arquivos || {})
            .flatMap(([directory, files]) => files.map(file => `./${directory}/${file}`))));

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(async cache => {
            await cache.addAll(ASSETS_TO_CACHE);
            const response = await fetch('./data/shared/offline-manifest.json');
            const manifest = await response.json();
            const offlineAssets = expandOfflineManifest(manifest);
            // Cacheia apenas dados locais; imagens e sons grandes continuam sob demanda.
            await cache.addAll(offlineAssets.filter(url => url.endsWith('.json')));
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    // Only cache requests for same origin and static files (avoid caching data API aggressively if we don't want to)
    if (event.request.url.includes('pokeapi.co')) return;

    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Se encontrar no cache, retorna. Senão, faz fetch normal.
            return response || fetch(event.request).then(fetchRes => {
                if (!fetchRes.ok) return fetchRes;
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, fetchRes.clone());
                    return fetchRes;
                });
            });
        }).catch(() => {
            // Em caso de falha offline completa
            const accept = event.request.headers.get('accept') || '';
            if (accept.includes('text/html')) {
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
