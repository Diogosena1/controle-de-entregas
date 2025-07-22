if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/controle-de-entregas/service-worker.js')
      .then(reg => console.log('Service Worker registrado com sucesso.'))
      .catch(err => console.error('Falha ao registrar Service Worker:', err));
  });
}
