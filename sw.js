// محرك الخدمة لتنشيط خاصية التثبيت الفوري PWA
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // تمرير البيانات المباشرة بدون تأخير
  e.respondWith(fetch(e.request));
});
