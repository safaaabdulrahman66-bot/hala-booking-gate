const CACHE_NAME='hala-sec-v9';
const assets=['secretary.html','manifest_secretary.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(assets)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>{if(k!==CACHE_NAME)return caches.delete(k);}))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'){e.respondWith(fetch(e.request));return;}
const rUrl=new URL(e.request.url);if(rUrl.pathname.endsWith('secretary.html')||e.request.mode==='navigate'){e.respondWith(caches.match('secretary.html').then(res=>res||fetch(e.request)));}else{e.respondWith(caches.match(e.request).then(res=>res||fetch(e.request)));}});
