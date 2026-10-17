// ====================================================================
// اسم الملف: sw.js - المعماري السحابي المطور لحفظ استقلالية السكرتير والمريض بدون إنترنت
// ====================================================================
const CACHE_NAME = 'hala-clinic-v8'; // رفع الإصدار لـ v8 لفرض التحديث وتجاوز كاش الهواتف القديم فوراً

// 🚀 [تأمين الأصول الكاملة أوفلاين]: إدراج وحفظ ملف السكرتير بذاكرة الكاش ليعمل بدون إنترنت بثبات تكراري تام
const ASSETS = [
  '/',
  'index.html',
  'secretary.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// التثبيت وحفظ الملفات الأساسية في ذاكرة الهاتف الكاش
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// تفعيل السيرفس وركر وحذف الكاش القديم فوراً لمنع تعليق البكسلات والملفات
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

// استراتيجية النتوورك أولاً (Network-First) المحدثة لحظر الخلط والتداخل التجاري
self.addEventListener('fetch', (e) => {
  // 🚀 [حماية الضخ السحابي الصامت للـ Firebase]: 
  // استثناء كافة طرق الإرسال السحابية (PUT للمزامنة، POST للحقن، DELETE للحذف) لحظر تخزينها بذاكرة الكاش ومنع أخطاء الشبكة بالعيادة
  if (e.request.method !== 'GET') {
    e.respondWith(fetch(e.request));
    return;
  }

  const requestUrl = e.request.url;

  // تطبيق استراتيجية التحقق السريع والتنقل الذكي أوفلاين دون خلط الواجهات
  if (e.request.mode === 'navigate' || requestUrl.includes('.html') || requestUrl === self.location.origin + '/') {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          // تحديث الكاش فوراً بالنسخة الحية الجديدة القادمة من جيت هاب
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // 🚀 [الفصل الهيكلي والإنقاذ الذكي عند انقطاع الإنترنت التام]:
          // إذا انقطع الإنترنت عن السكرتير، يفتح له نسخة السكرتير المخزنة، وإذا انقطع عن المريض يفتح له نسخة المريض دون أي تداخل
          if (requestUrl.includes('secretary.html')) {
            return caches.match('secretary.html');
          }
          return caches.match('index.html') || caches.match(e.request);
        })
    );
  } else {
    // باقي ملفات الـ PWA (المانيفست والأيقونات والصور) نأتي بها من الكاش لتسريع العمل وتوفير البيانات
    e.respondWith(
      caches.match(e.request).then((res) => res || fetch(e.request))
    );
  }
});
