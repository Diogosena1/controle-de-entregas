const CACHE_NAME = 'controle-entregas-cache-v3'; // ATENÇÃO: Mude 'v1' para 'v2', 'v3', etc., a cada nova versão do seu app!
const urlsToCache = [
  '/controle-de-entregas/', // Se o index.html for o padrão da pasta
  '/controle-de-entregas/index.html',
  // Aqui você vai listar todos os arquivos ESTÁTICOS que seu app precisa para funcionar offline.
  // Ajuste os caminhos se eles não estiverem na raiz de 'controle-de-entregas'.
  '/controle-de-entregas/style.css',
  // Se você separar seu JS do HTML, o arquivo .js iria aqui:
  // '/controle-de-entregas/script.js', 
  '/controle-de-entregas/manifest.json',
  '/controle-de-entregas/icons/icon-192.png',
  '/controle-de-entregas/icons/icon-512.png'
  // Adicione outros arquivos importantes, como imagens, fontes, etc.
];

// Evento de Instalação: Ocorre quando o Service Worker é registrado pela primeira vez ou quando uma nova versão é detectada.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache aberto, adicionando URLs.');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Falha ao adicionar URLs ao cache:', error);
      })
  );
});

// Evento de Ativação: Ocorre após a instalação, e é onde limpamos caches antigos.
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Apagando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Garante que o Service Worker comece a controlar as páginas imediatamente
  return self.clients.claim();
});

// Evento Fetch: Intercepta todas as requisições de rede.
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET (como POST, PUT, etc.) ou que não são http/https
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se o recurso estiver no cache, retorna-o
        if (response) {
          console.log('[Service Worker] Servindo do cache:', event.request.url);
          return response;
        }

        // Se não estiver no cache, faz a requisição à rede
        console.log('[Service Worker] Buscando na rede:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Tenta adicionar a resposta da rede ao cache para usos futuros
            return caches.open(CACHE_NAME).then((cache) => {
              // Clona a resposta porque a resposta original pode ser lida apenas uma vez
              if (networkResponse.ok) { // Apenas cacheia respostas bem-sucedidas
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          })
          .catch((error) => {
            console.error('[Service Worker] Falha na requisição de rede para:', event.request.url, error);
            // Você pode retornar uma página offline aqui, se tiver uma
            // Ex: return caches.match('/offline.html');
          });
      })
  );
});