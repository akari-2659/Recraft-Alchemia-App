const APP_VERSION='1.0.25';
const CACHE=`ra-gm-app-v${APP_VERSION}`;
const PREFIX='ra-gm-app-v';
const APP_FILES=["../js/ra_monster_rules.js", "./", "./index.html", "./app.css", "./app.js", "./manifest.webmanifest", "../assets/common.css", "../assets/account.js", "../icons/gm-app-v4-180.png", "../icons/gm-app-v4-192.png", "../icons/gm-app-v4-512.png", "../icons/gm-app-v4.ico", "./modules/manager/database_admin.html", "./modules/manager/progress_manager.html", "./modules/manager/help.html", "./modules/manager/data/recraft_alchemia_initial_data.json", "./modules/manager/data/public/manifest.json", "./modules/manager/data/public/recraft_alchemia_master.json", "./modules/manager/assets/vendor/jszip.min.js", "./modules/manager/assets/vendor/JSZip_LICENSE.md"];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_FILES.map(path=>new Request(path,{cache:'reload'})))));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(url.pathname.endsWith('/gm/version.json')){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const response=await fetch(event.request);
      if(response.ok)cache.put(event.request,response.clone());
      return response;
    }catch(error){
      const fallback=await caches.match(event.request,{ignoreSearch:true});
      if(fallback)return fallback;
      throw error;
    }
  })());
});
