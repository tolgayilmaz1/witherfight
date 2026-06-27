const CACHE = 'witherfight-v2-fast';
const CORE_FILES = [
  '/witherfight/',
  '/witherfight/index.html',
  '/witherfight/manifest.json',
  '/witherfight/icon-192.png',
  '/witherfight/icon-512.png'
];
const RUNTIME_AUDIO = [
  '/witherfight/menu.ogg',
  '/witherfight/game.ogg',
  '/witherfight/baris.ogg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const path = url.pathname;

  if (RUNTIME_AUDIO.includes(path)) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => cached || fetch(e.request).then(res => {
          cache.put(e.request, res.clone());
          return res;
        }))
      )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (e.request.method === 'GET' && res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
