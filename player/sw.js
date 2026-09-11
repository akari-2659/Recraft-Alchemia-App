const CACHE='ra-player-prototype-v2';
const SHELL=['./','./index.html','./app.css','./app.js','../assets/common.css','./manifest.webmanifest','../icons/player-192.png','../icons/player-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&key.startsWith('ra-player-prototype')).map(key=>caches.delete(key))))) });
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  const isModule=url.pathname.includes('/player/modules/');
  if(isModule){
    event.respondWith(caches.open(CACHE).then(async cache=>{
      const cached=await cache.match(event.request);
      const fresh=fetch(event.request).then(response=>{if(response.ok)cache.put(event.request,response.clone());return response}).catch(()=>cached);
      return cached||fresh;
    }));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
