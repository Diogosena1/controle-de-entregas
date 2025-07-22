self.addEventListener('install', function(e) {
  console.log('Service Worker instalado');
  e.waitUntil(
    caches.open('app-cache').then(function(cache) {
      return cache.addAll([
        '/controle-de-entregas/',
        '/controle-de-entregas/index.html',
        '/controle-de-entregas/manifest.json',
        '/controle-de-entregas/style.css',
        '/controle-de-entregas/script.js',
        '/controle-de-entregas/icons/icon-192.png',
        '/controle-de-entregas/icons/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
