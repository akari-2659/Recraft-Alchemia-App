const APP_VERSION='1.0.138';
const CACHE=`ra-gm-player-app-v${APP_VERSION}`;
const PREFIX='ra-gm-player-app-v';
const APP_FILES=[
  './','./index.html','./app.css','./app.js','./ra_startup_overlay.js','./manifest.webmanifest',
  '../assets/common.css','../assets/account.js','../assets/ra_magic_loader.js','../icons/player-app-v4-180.png','../icons/player-app-v4-192.png','../icons/player-app-v4-512.png','../icons/player-app-v4.ico',
  './modules/character/character.html','./modules/facility/facility.html'
];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(APP_FILES.map(async path=>{
      try{const req=new Request(path,{cache:'reload'});const res=await fetch(req);if(res.ok)await cache.put(req,res.clone());}catch(_error){}
    }));
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(url.pathname.endsWith('/gm-player/version.json')){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
  const isAppCode=event.request.mode==='navigate'||/\.(?:html|js|css)$/.test(url.pathname);
  if(isAppCode){
    // v1.0.110: 現在使用中のApp版をセッション中に混在させない。
    // 新版は別CACHEへ事前取得し、ユーザーが「アプリを更新」を選ぶまで現行CACHEを優先する。
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const cached=await cache.match(event.request,{ignoreSearch:true});
      if(cached)return cached;
      const response=await fetch(event.request,{cache:'no-cache'});
      if(response.ok)await cache.put(event.request,response.clone());
      return response;
    })());
    return;
  }
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request,{ignoreSearch:true});if(cached)return cached;
    try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}
    catch(error){const fallback=await caches.match(event.request,{ignoreSearch:true});if(fallback)return fallback;throw error;}
  })());
});
