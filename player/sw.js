const CACHE='ra-player-prototype-v10';
const SHELL=['./','./index.html','./app.css','./app.js','./manifest.webmanifest','../assets/common.css','../icons/player-192.png','../icons/player-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&key.startsWith('ra-player-prototype')).map(key=>caches.delete(key)))),
  self.clients.claim()
]))});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(url.pathname.endsWith('/player/version.json')){
    event.respondWith(fetch(event.request,{cache:'no-store'}));return;
  }
  const isModule=url.pathname.includes('/player/modules/');
  if(isModule){
    event.respondWith(fetch(event.request).then(response=>{const clone=response.clone();caches.open(CACHE).then(c=>c.put(event.request,clone));return response}).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(c=>c.put(event.request,response.clone()));return response})));
});
