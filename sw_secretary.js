const CACHE_NAME = 'hala-sec-cache-v1';

// 🚀 [تأمين وحقن مصفوفة الأصول الكاملة]: إضافة الأيقونات الحتمية المطلوبة لمعيار PWA لمنع انهيار اختبارات GitHub
const assets = [
  'secretary.html',
  'manifest_secretary.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Hala Secretary Cache Pre-installed Successfully.');
      return cache.addAll(assets);
    })
  );
});

// محرك تفعيل التحديث الفوري وتطهير الكاش القديم عند إعادة تشغيل المنظومة
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', e => {
  const requestUrl = new URL(e.request.url);

  // 🔒 [تفكيك وعزل معلمات الرابط]: إذا كان الطلب موجهاً لصفحة السكرتير، يتم مطابقتها بالملف الأساسي النظيف دون الالتفات للمعلمات الممررة ?c= أو &d=
  if (requestUrl.pathname.endsWith('secretary.html')) {
    e.respondWith(
      caches.match('secretary.html').then(cachedResponse => {
        return cachedResponse || fetch(e.request);
      })
    );
  } else {
    // معالجة بقية الأصول والأيقونات بصيغة الحفظ والطلب المرن المستقر
    e.respondWith(
      caches.match(e.request).then(res => {
        return res || fetch(e.request);
      })
    );
  }
});
