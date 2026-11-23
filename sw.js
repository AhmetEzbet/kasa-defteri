const C='kasa-v3';const D=['./','./index.html','./manifest.webmanifest','./icon-192.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(D)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||e.request.method!=='GET')return;
const ag=new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('zaman')),6000);fetch(e.request,{cache:'no-store'}).then(r=>{clearTimeout(t);if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}res(r)},err=>{clearTimeout(t);rej(err)})});
e.respondWith(ag.catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./',{ignoreSearch:true}))))});
