const CACHE_NAME = 'hala-clinic-patient-v8'; 

// 🚀 [تأمين الأصول النظيفة للبوابة]: إدراج وحفظ ملفات بوابة المراجعين والأيقونات الرسمية فقط لمنع التداخل والتعليق
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// التثبيت وحفظ الملفات الأساسية في ذاكرة الهاتف الكاش للمرضى
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
            console.log('حذف الكاش القديم المكتشف بنجاح:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية النتوورك أولاً (Network-First) الذكية لبوابة المرضى
self.addEventListener('fetch', (e) => {
  // استثناء كافة طرق الإرسال السحابية لـ Firebase
  if (e.request.method !== 'GET') {
    e.respondWith(fetch(e.request));
    return;
  }

  const requestUrl = e.request.url;

  // تطبيق استراتيجية التحقق السريع والتنقل الذكي أوفلاين دون تداخل
  if (e.request.mode === 'navigate' || requestUrl.includes('.html')) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // فتح نسخة المريض التلقائية عند انقطاع الشبكة
          return caches.match('index.html') || caches.match(e.request);
        })
    );
  } else {
    // باقي ملفات الـ PWA نأتي بها من الكاش لتسريع العمل وتوفير البيانات
    e.respondWith(
      caches.match(e.request).then((res) => res || fetch(e.request))
    );
  }
});
