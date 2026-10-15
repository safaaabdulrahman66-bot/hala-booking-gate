const CACHE_NAME = 'hala-clinic-v6'; // تم تحديث الإصدار لإجبار المتصفح على التحديث
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// التثبيت وحفظ الملفات الأساسية
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// تفعيل السيرفس وركر وحذف الكاش القديم فوراً
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية النتوورك أولاً (Network-First) لمنع تعليق الكاش القديم
self.addEventListener('fetch', (e) => {
  // نطبق الاستراتيجية فقط على طلبات الموقع الأساسية (وثائق الـ HTML)
  if (e.request.mode === 'navigate' || e.request.url.includes('index.html')) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          // تحديث الكاش بالنسخة الجديدة القادمة من السيرفر
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // إذا فضل الإنترنت (أوفلاين) نفتح الكاش المخزن
          return caches.match(e.request);
        })
    );
  } else {
    // باقي الملفات (الصور أو المانيفست) نأتي بها من الكاش أو النتوورك بشكل اعتيادي
    e.respondWith(
      caches.match(e.request).then((res) => res || fetch(e.request))
    );
  }
});
