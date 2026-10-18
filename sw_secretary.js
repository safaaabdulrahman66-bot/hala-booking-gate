const CACHE_NAME = 'hala-sec-cache-v1';
const assets = ['secretary.html', 'manifest_secretary.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
