// محرك الخدمة الصارم والمستقر لتفعيل خاصية التثبيت الفوري الفوري PWA
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // تمرير الطلبات الفورية صامتاً ومباشرة للشبكة لضمان سرعة حقن البيانات
  e.respondWith(fetch(e.request));
});
