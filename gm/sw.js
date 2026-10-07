const APP_VERSION='1.0.155';
const CACHE=`ra-gm-app-v${APP_VERSION}`;
const PREFIX='ra-gm-app-v';
const APP_FILES=["../js/ra_monster_rules.js","./","./index.html","./app.css","./app.js","./manifest.webmanifest","../assets/common.css","../assets/account.js","../assets/ra_magic_loader.js","../icons/gm-app-v4-180.png","../icons/gm-app-v4-192.png","../icons/gm-app-v4-512.png","../icons/gm-app-v4.ico","./modules/manager/database_admin.html","./modules/manager/progress_manager.html","./modules/manager/bestiary_manager.html","./modules/manager/help.html","./modules/manager/data/recraft_alchemia_initial_data.json","./modules/manager/data/public/manifest.json","./modules/manager/data/public/recraft_alchemia_master.json","./modules/manager/data/public/recraft_alchemia_character_master.json","./modules/manager/data/public/recraft_alchemia_facility_master.json","./modules/manager/assets/vendor/jszip.min.js","./modules/manager/assets/vendor/JSZip_LICENSE.md","./modules/manager/database_admin_main.css","./modules/manager/database_loader.js","./modules/manager/database_facility.js","./modules/manager/database_table.js","./modules/manager/database_monster_cards.js","./modules/manager/database_editors.js","./modules/manager/database_form.js","./modules/manager/database_validation.js","./modules/manager/database_api.js","./modules/manager/database_admin_main.js","./modules/manager/progress_manager_main.css","./modules/manager/progress_day.js","./modules/manager/progress_quest.js","./modules/manager/progress_world.js","./modules/manager/progress_encounter.js","./modules/manager/progress_merchant.js","./modules/manager/progress_treasure.js","./modules/manager/progress_drops.js","./modules/manager/progress_ui.js","./modules/manager/progress_session.js","./modules/manager/progress_manager_main.js"];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    // 1ファイルの404や一時通信失敗でSW更新全体を失敗させない。
    await Promise.allSettled(APP_FILES.map(async path=>{
      try{
        const request=new Request(path,{cache:'reload'});
        const response=await fetch(request);
        if(response.ok)await cache.put(request,response.clone());
      }catch(_error){}
    }));
    // v1.0.110: 新版はwaitingに保持し、「アプリを更新」を押した時だけSKIP_WAITINGする。
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
  if(url.pathname.endsWith('/gm/version.json')){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}

  const isAppCode=event.request.mode==='navigate'||/\.(?:html|js|css)$/.test(url.pathname);
  const isPackagedData=/\/modules\/manager\/data\/(?:public\/)?[^/]+\.json$/.test(url.pathname);
  if(isAppCode||isPackagedData){
    // v1.0.110: 「あとで」選択中に旧UIと新版モジュール/同梱DBが混ざらないよう、
    // 有効中のApp版CACHEを優先。新版CACHEへの切替はSKIP_WAITING後だけ行う。
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
    const cached=await cache.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const response=await fetch(event.request);
      if(response.ok)await cache.put(event.request,response.clone());
      return response;
    }catch(error){
      const fallback=await caches.match(event.request,{ignoreSearch:true});
      if(fallback)return fallback;
      throw error;
    }
  })());
});
