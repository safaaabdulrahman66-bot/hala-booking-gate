const CACHE_NAME = 'hala-clinic-v7'; // تم رفع الإصدار لـ v7 لفرض التحديث الفوري على الهواتف
const ASSETS = [
  '/',
  'index.html',
  'manifest.json'
];

// التثبيت وحفظ الملفات الأساسية في ذاكرة الهاتف
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// تفعيل السيرفس وركر وحذف الكاش القديم فوراً لمنع تعليق البكسلات
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('حذف الكاش القديم المكتشف:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية النتوورك أولاً (Network-First) الصارمة والمصححة
self.addEventListener('fetch', (e) => {
  // استثناء طلبات الـ POST الخاصة بحجوزات الـ Firebase لمنع معالجتها بالكاش وحدوث أخطاء شبكة
  if (e.request.method !== 'GET') {
    e.respondWith(fetch(e.request));
    return;
  }

  // نطبق الاستراتيجية على طلبات الموقع الأساسية (وثائق الـ HTML والتنقل)
  if (e.request.mode === 'navigate' || e.request.url.includes('index.html')) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          // تحديث الكاش فوراً بالنسخة الحية الجديدة القادمة من السيرفر
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // في حال غياب الإنترنت التام، نفتح النسخة الاحتياطية المستقرة من الكاش
          return caches.match('index.html') || caches.match(e.request);
        })
    );
  } else {
    // باقي ملفات الـ PWA (المانيفست والأيقونات) نأتي بها من الكاش أو النتوورك بشكل اعتيادي
    e.respondWith(
      caches.match(e.request).then((res) => res || fetch(e.request))
    );
  }
});
