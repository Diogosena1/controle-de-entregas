const CACHE_NAME = 'controle-entregas-cache-v7'; // <--- INCREMENTE PARA V6! Sempre que mudar o SW, incremente.
const urlsToCache = [
    '/controle-de-entregas/', // O caminho raiz do seu aplicativo no GitHub Pages
    '/controle-de-entregas/index.html',
    '/controle-de-entregas/script.js',
    '/controle-de-entregas/manifest.json',
    // Agora, todos os ícones e a logo estão em 'icons/' e são .png
    '/controle-de-entregas/icons/r_grande_dividido.png', // Logo principal
    '/controle-de-entregas/icons/icon-192.png', // Ícone 192x192
    '/controle-de-entregas/icons/icon-512.png'  // Ícone 512x512
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Força o novo SW a ativar imediatamente
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deletando cache antigo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => clients.claim()) // Garante que o SW controle as páginas existentes
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Retorna do cache se encontrado
                }
                return fetch(event.request).then(
                    function(response) {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        var responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});
