(()=>{
  'use strict';
  const APP_VERSION='0.25.0';
  const GAS_URL='https://script.google.com/macros/s/AKfycbxNQYC7-aBE23cliuD1Zdze18xHh-q45P1qpBgwCCg0dYgxd1b8A-R63eGjzMtgOxMT/exec';
  const sidebar=document.querySelector('#sidebar'),backdrop=document.querySelector('#backdrop');
  const views=[...document.querySelectorAll('.view')],nav=[...document.querySelectorAll('.nav-btn')];
  const mobileTitle=document.querySelector('#mobileTitle'),characterCategory=document.querySelector('#characterCategory'),characterToggle=document.querySelector('#characterCategoryToggle');
  const characterNavList=document.querySelector('#characterNavList'),characterViewName=document.querySelector('#characterViewName');
  const frames={character:document.querySelector('#characterFrame'),facility:document.querySelector('#facilityFrame')};
  let characters=[],selectedCharacterId='',swRegistration=null,waitingWorker=null;
  const moduleState={character:{ready:false,lastCharacterId:''},facility:{ready:false}};

  const THEME_STORAGE_KEY='ra-app-theme-color';
  const THEMES={
    red:{label:'レッド',bg:'#f2e7e5',paper:'#fff9f7',paper2:'#f8ebe7',ink:'#352425',muted:'#796263',line:'#dab8b4',accent:'#9b4347',accent2:'#c8756d',deep:'#3a2125',active:'#7d363d',hover:'#5c2b30',theme:'#7d363d',soft:'#efd3cf'},
    blue:{label:'ブルー',bg:'#e8eff6',paper:'#f9fcff',paper2:'#eaf2f9',ink:'#202d3b',muted:'#607080',line:'#b9cadb',accent:'#4273a2',accent2:'#79a7cc',deep:'#1d3046',active:'#345f87',hover:'#284a69',theme:'#345f87',soft:'#d5e5f2'},
    green:{label:'グリーン',bg:'#e9f1e9',paper:'#fbfdf9',paper2:'#eaf3e8',ink:'#26342a',muted:'#657367',line:'#bfd0bd',accent:'#4b7757',accent2:'#82a978',deep:'#23392a',active:'#40674a',hover:'#31513a',theme:'#40674a',soft:'#d8e7d4'},
    purple:{label:'パープル',bg:'#eee9f3',paper:'#fdfaff',paper2:'#f0e9f5',ink:'#30273a',muted:'#70657a',line:'#cbbbd5',accent:'#74558a',accent2:'#aa8cbb',deep:'#33263e',active:'#604771',hover:'#4b3858',theme:'#604771',soft:'#e2d6e8'},
    orange:{label:'オレンジ',bg:'#f5ebe1',paper:'#fffaf5',paper2:'#f7e9da',ink:'#39291f',muted:'#7c695c',line:'#dcc3aa',accent:'#b56b32',accent2:'#d6965d',deep:'#44291b',active:'#8d522a',hover:'#6b3f24',theme:'#8d522a',soft:'#f0d8bd'},
    yellow:{label:'イエロー',bg:'#f5f0dc',paper:'#fffdf4',paper2:'#f6efd2',ink:'#393321',muted:'#78705b',line:'#d9c991',accent:'#9a791e',accent2:'#c9a84c',deep:'#403720',active:'#765f1d',hover:'#5a491d',theme:'#765f1d',soft:'#eee1ae'},
    pink:{label:'ピンク',bg:'#f5e9ef',paper:'#fffafd',paper2:'#f7e9f0',ink:'#39272f',muted:'#7d6671',line:'#dabcca',accent:'#aa5278',accent2:'#d18aa6',deep:'#452838',active:'#88415f',hover:'#663248',theme:'#88415f',soft:'#f0d3df'},
    cyan:{label:'シアン',bg:'#e5f2f3',paper:'#f9feff',paper2:'#e7f4f4',ink:'#223436',muted:'#62777a',line:'#b7d3d5',accent:'#38868d',accent2:'#78b7bb',deep:'#183a3f',active:'#2e6e75',hover:'#25565c',theme:'#2e6e75',soft:'#d2e9ea'},
    navy:{label:'ネイビー',bg:'#e7ebf1',paper:'#f9fbfe',paper2:'#e9edf4',ink:'#222c3b',muted:'#626c7c',line:'#bac3d1',accent:'#405a82',accent2:'#7f94b2',deep:'#18243a',active:'#334b70',hover:'#283a56',theme:'#334b70',soft:'#d6deea'},
    brown:{label:'ブラウン',bg:'#f5eee4',paper:'#fff9ef',paper2:'#fbf1df',ink:'#34251d',muted:'#76685e',line:'#ddcbb0',accent:'#8f542d',accent2:'#b98643',deep:'#30231c',active:'#5a3b29',hover:'#4a3326',theme:'#6f442d',soft:'#ecd9bd'}
  };
  const LEGACY_THEME_KEYS={classic:'brown',violet:'purple',amber:'orange'};
  function currentTheme(){
    let key=localStorage.getItem(THEME_STORAGE_KEY)||'brown';
    if(LEGACY_THEME_KEYS[key]){key=LEGACY_THEME_KEYS[key];try{localStorage.setItem(THEME_STORAGE_KEY,key)}catch(_){}}
    return THEMES[key]?key:'brown';
  }
  function themePairs(theme){return {
    '--bg':theme.bg,'--paper':theme.paper,'--paper2':theme.paper2,'--ink':theme.ink,'--muted':theme.muted,'--line':theme.line,
    '--accent':theme.accent,'--accent2':theme.accent2,'--app-deep':theme.deep,'--app-active':theme.active,'--app-hover':theme.hover,'--theme-soft':theme.soft,
    '--ra-desk':theme.deep,'--ra-desk-2':theme.hover,'--ra-page':theme.paper,'--ra-page-2':theme.paper2,'--ra-page-3':theme.soft,
    '--ra-ink':theme.ink,'--ra-muted':theme.muted,'--ra-line':theme.line,'--ra-line-soft':theme.line,'--ra-line-dark':theme.hover,
    '--ra-navy':theme.accent,'--ra-navy-2':theme.deep,'--ra-burgundy':theme.accent,'--ra-burgundy-2':theme.deep,
    '--ra-brass':theme.accent2,'--ra-brass-light':theme.soft
  }}
  function applyThemeToFrame(frame,theme,key=currentTheme()){
    try{
      const doc=frame?.contentDocument;if(!doc)return;
      const root=doc.documentElement,body=doc.body;root.dataset.raTheme=key;if(body)body.dataset.raTheme=key;
      Object.entries(themePairs(theme)).forEach(([k,v])=>{root.style.setProperty(k,v);body?.style.setProperty(k,v)});
      let style=doc.getElementById('raAppFullThemeV025');
      if(!style){style=doc.createElement('style');style.id='raAppFullThemeV025';doc.head?.appendChild(style)}
      style.textContent=`
        html,body{background:var(--bg)!important;color:var(--ink)!important}
        body.ra-app{color:var(--ink)!important;background:linear-gradient(145deg,var(--bg),color-mix(in srgb,var(--bg) 72%,var(--app-deep) 28%))!important}
        body.ra-app>main,body.ra-app main{color:var(--ink)}
        body.ra-app>main{background-color:var(--paper)!important;border-color:var(--line)!important}
        body.ra-app :is(.panel,.big-section,.card,.mini-card,.status-box,.resource-card,.choice-card,.help-card,.compact-storage-panel,.facility-work-block,.facility-summary,.autosave-panel,.dialog-inner,.weapon-modal-dialog,.branch-controls,.branch-graph-scroll,.catalog-rank-controls,.inventory-filter-panel,.inventory-search-panel,.tab-block,.subnav-block){border-color:var(--line)!important;background-color:var(--paper)!important;color:var(--ink)!important}
        body.ra-app :is(.notice,.hint,.muted,.version,.build,.small,.subtitle){color:var(--muted)!important}
        body.ra-app :is(input,select,textarea){background-color:var(--paper)!important;color:var(--ink)!important;border-color:var(--line)!important}
        body.ra-app :is(.tabs,.subtabs,.section-subtabs,.facility-inner-tabs,.facility-weapon-category-tabs,.toolbar-screen-actions,.toolbar-db-actions,.global-db-maintenance,.global-db-write){border-color:var(--line)!important}
        body.ra-app :is(.tab,.subtab,.tab-btn,.editor-tab-btn,.quest-category-btn).active{background:var(--accent)!important;border-color:var(--app-deep)!important}
        body.ra-app .ra-build-info,body.ra-app .build{background:var(--paper2)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app .modal-backdrop{background:color-mix(in srgb,var(--app-deep) 58%,transparent)!important}
      `;
    }catch(_){ }
  }
  function applyTheme(key,{persist=true}={}){
    key=LEGACY_THEME_KEYS[key]||key;const theme=THEMES[key]||THEMES.brown;key=THEMES[key]?key:'brown';
    if(persist)localStorage.setItem(THEME_STORAGE_KEY,key);
    const root=document.documentElement;root.dataset.raTheme=key;document.body?.setAttribute('data-ra-theme',key);
    Object.entries(themePairs(theme)).forEach(([k,v])=>root.style.setProperty(k,v));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme.theme);
    const select=document.querySelector('#themeColorSelect');if(select&&select.value!==key)select.value=key;
    Object.values(frames||{}).forEach(frame=>applyThemeToFrame(frame,theme,key));
  }

  function readBinding(){const role=sessionStorage.getItem('ra-proto-role')||'player';const loginKey=String(sessionStorage.getItem('ra-proto-login-player-key')||'').trim();const accountKey=loginKey?`ra-proto-bind-account-${encodeURIComponent(loginKey)}`:'';const raw=(accountKey?localStorage.getItem(accountKey):'')||localStorage.getItem('ra-proto-bind-'+role)||localStorage.getItem('ra-proto-bind-player')||'';try{return raw?JSON.parse(raw):{};}catch(_){return{}}}
  const binding=readBinding();window.RA_PLAYER_CONTEXT={charKey:String(binding.charKey||'').trim(),facilityKey:String(binding.facilityKey||'').trim(),characterId:''};
  function closeDrawer(){sidebar.classList.remove('open');backdrop.classList.remove('show')}
  function characterButtons(){return [...document.querySelectorAll('.character-nav-btn')]}
  const frameTimers=new Map();
  function setFrameLoading(name,text='読み込み中'){
    const frame=frames[name],wrap=frame?.closest('.module-frame-wrap');if(!wrap)return;if(moduleState[name])moduleState[name].ready=false;wrap.classList.remove('loaded','load-error');
    const label=wrap.querySelector('.frame-loading-text');if(label)label.textContent=text||'読み込み中';clearTimeout(frameTimers.get(name));
    const timeout=name==='character'?120000:45000;
    frameTimers.set(name,setTimeout(()=>{if(wrap.classList.contains('loaded'))return;if(name==='character'){if(label)label.textContent='通信を再試行しています…';return;}wrap.classList.add('load-error');if(label)label.textContent='読み込みがタイムアウトしました。再読み込みできます。';},timeout));
  }
  function setFrameReady(name){const frame=frames[name],wrap=frame?.closest('.module-frame-wrap');if(!wrap)return;if(moduleState[name])moduleState[name].ready=true;clearTimeout(frameTimers.get(name));frameTimers.delete(name);wrap.classList.remove('load-error');wrap.classList.add('loaded');applyThemeToFrame(frame,THEMES[currentTheme()]);}
  function setFrameError(name,text='読み込みに失敗しました'){const frame=frames[name],wrap=frame?.closest('.module-frame-wrap');if(!wrap)return;clearTimeout(frameTimers.get(name));frameTimers.delete(name);wrap.classList.remove('loaded');wrap.classList.add('load-error');const label=wrap.querySelector('.frame-loading-text');if(label)label.textContent=text;}
  function reloadFrame(name){const frame=frames[name];if(!frame)return;const base=frame.dataset.src||frame.getAttribute('src')||'';if(!base)return;frame.dataset.loaded='1';if(moduleState[name])moduleState[name].ready=false;if(name==='character')moduleState.character.lastCharacterId='';setFrameLoading(name,'再読み込み中');try{const u=new URL(base,location.href);u.searchParams.set('retry',String(Date.now()));frame.src=u.toString();}catch(_){frame.src=base+(base.includes('?')?'&':'?')+'retry='+Date.now();}}
  function ensureFrame(name){const frame=frames[name];if(!frame||frame.dataset.loaded==='1')return;frame.dataset.loaded='1';setFrameLoading(name);frame.addEventListener('load',()=>{applyThemeToFrame(frame,THEMES[currentTheme()]);const wrap=frame.closest('.module-frame-wrap');if(!wrap?.classList.contains('loaded')){const label=wrap?.querySelector('.frame-loading-text');if(label)label.textContent='データを読み込み中';}});frame.src=frame.dataset.src;}
  function show(name,{writeHash=true}={}){if(!document.querySelector('#view-'+name))name='home';views.forEach(v=>v.classList.toggle('active',v.id==='view-'+name));nav.forEach(b=>b.classList.toggle('active',b.dataset.view===name));if(name!=='character')characterButtons().forEach(b=>b.classList.remove('active'));const active=document.querySelector('#view-'+name);mobileTitle.textContent=active?.dataset.title||'Recraft Alchemia';ensureFrame(name);closeDrawer();if(writeHash&&location.hash!=='#'+name)history.pushState(null,'','#'+name);}
  function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
  function jsonpOnce(action,payload={},timeoutMs=24000){return new Promise((resolve,reject)=>{const cb='raPlayerProtoCb_'+Date.now()+'_'+Math.random().toString(36).slice(2),script=document.createElement('script');const timer=setTimeout(()=>{cleanup();reject(new Error('キャラクター一覧の取得に時間がかかっています。'));},timeoutMs);function cleanup(){clearTimeout(timer);try{delete window[cb]}catch(_){window[cb]=undefined}script.remove()}window[cb]=json=>{cleanup();if(!json||json.ok===false)reject(new Error(json?.error||'キャラクター一覧を取得できませんでした。'));else resolve(json)};try{const u=new URL(GAS_URL);u.searchParams.set('api','1');u.searchParams.set('action',action);u.searchParams.set('callback',cb);u.searchParams.set('_t',Date.now());Object.entries(payload).forEach(([k,v])=>{if(v!==undefined&&v!==null)u.searchParams.set(k,typeof v==='object'?JSON.stringify(v):String(v))});script.onerror=()=>{cleanup();reject(new Error('キャラクター一覧の通信に失敗しました。'));};script.src=u.toString();document.head.appendChild(script);}catch(e){cleanup();reject(e)}})}
  async function jsonp(action,payload={}){let last;for(let i=0;i<3;i++){try{return await jsonpOnce(action,payload,24000+i*6000)}catch(e){last=e;if(i<2)await sleep([700,1800][i])}}throw last||new Error('キャラクター一覧を取得できませんでした。')}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function listCacheKey(){return 'ra-char-list-cache:'+window.RA_PLAYER_CONTEXT.charKey}
  function readListCache(){try{const v=JSON.parse(sessionStorage.getItem(listCacheKey())||'null');return Array.isArray(v?.items)?v.items:null}catch(_){return null}}
  function saveListCache(items){try{sessionStorage.setItem(listCacheKey(),JSON.stringify({at:Date.now(),items}))}catch(_){}}
  function renderCharacterNav(){if(!characterNavList)return;if(!characters.length){characterNavList.innerHTML='<div class="character-nav-status empty">保存済みキャラクターはありません。</div>';return;}characterNavList.innerHTML=characters.map(c=>`<button class="character-nav-btn" type="button" data-character-id="${escapeHtml(c.id)}">${escapeHtml(c.name||'無名のキャラクター')}</button>`).join('');characterButtons().forEach(btn=>btn.addEventListener('click',()=>selectCharacterById(btn.dataset.characterId)));}
  async function loadCharacterList({background=false}={}){const key=window.RA_PLAYER_CONTEXT.charKey;if(!key){characterNavList.innerHTML='<div class="character-nav-status error">ログイン時のキャラクターシート用プレイヤーキー紐づけが見つかりません。</div>';return;}const cached=readListCache();if(cached&&!characters.length){characters=cached;renderCharacterNav();}if(!background&&!characters.length)characterNavList.innerHTML='<div class="character-nav-status loading"><span class="mini-spinner" aria-hidden="true"></span><span>読み込み中</span></div>';try{const res=await jsonp('list',{playerKey:key});characters=Array.isArray(res)?res:(Array.isArray(res.items)?res.items:(Array.isArray(res.data?.items)?res.data.items:[]));saveListCache(characters);renderCharacterNav();routeFromHash();}catch(e){if(characters.length)return;characterNavList.innerHTML=`<div class="character-nav-status error"><div>${escapeHtml(e.message)}</div><button class="character-nav-retry" type="button">一覧を再読み込み</button></div>`;characterNavList.querySelector('.character-nav-retry')?.addEventListener('click',()=>loadCharacterList());}}
  function postCharacter(message){try{frames.character?.contentWindow?.postMessage(message,location.origin)}catch(_){}}
  function selectCharacterById(id,{writeHash=true}={}){const character=characters.find(c=>String(c.id)===String(id));if(!character)return;const nextId=String(character.id),sameCharacter=selectedCharacterId===nextId;selectedCharacterId=nextId;window.RA_PLAYER_CONTEXT.characterId=selectedCharacterId;characterButtons().forEach(b=>b.classList.toggle('active',String(b.dataset.characterId)===selectedCharacterId));characterViewName.textContent=character.name||'無名のキャラクター';show('character',{writeHash:false});mobileTitle.textContent=character.name||'キャラクター';ensureFrame('character');if(!sameCharacter||moduleState.character.lastCharacterId!==selectedCharacterId){moduleState.character.lastCharacterId=selectedCharacterId;postCharacter({type:'RA_OPEN_CHARACTER',characterId:selectedCharacterId,force:false});}if(writeHash)history.pushState(null,'','#character/'+encodeURIComponent(selectedCharacterId));}
  function openNewCharacter({writeHash=true}={}){selectedCharacterId='';window.RA_PLAYER_CONTEXT.characterId='__new__';characterButtons().forEach(b=>b.classList.remove('active'));characterViewName.textContent='新規キャラクター';show('character',{writeHash:false});mobileTitle.textContent='新規キャラクター';ensureFrame('character');moduleState.character.lastCharacterId='';postCharacter({type:'RA_NEW_CHARACTER'});if(writeHash&&location.hash!=='#character/new')history.pushState(null,'','#character/new');}
  window.addEventListener('message',ev=>{if(ev.origin!==location.origin)return;const name=Object.entries(frames).find(([,frame])=>frame?.contentWindow===ev.source)?.[0];if(!name)return;const type=String(ev.data?.type||'');if(type==='RA_MODULE_LOADING')setFrameLoading(name,String(ev.data?.text||'読み込み中'));else if(type==='RA_MODULE_READY'){setFrameReady(name);if(name==='character'&&window.RA_PLAYER_CONTEXT.characterId&&!String(window.RA_PLAYER_CONTEXT.characterId).startsWith('__'))moduleState.character.lastCharacterId=String(window.RA_PLAYER_CONTEXT.characterId);}else if(type==='RA_MODULE_ERROR')setFrameError(name,String(ev.data?.text||'読み込みに失敗しました'));else if(type==='RA_CHARACTER_LIST_CHANGED')loadCharacterList({background:true});});
  characterToggle?.addEventListener('click',()=>{const open=characterCategory.classList.toggle('open');characterToggle.setAttribute('aria-expanded',String(open));});document.querySelector('#menuBtn').onclick=()=>{sidebar.classList.toggle('open');backdrop.classList.toggle('show')};backdrop.onclick=closeDrawer;document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelectorAll('[data-open-view]').forEach(b=>b.onclick=()=>show(b.dataset.openView));document.querySelectorAll('[data-retry-frame]').forEach(button=>button.addEventListener('click',()=>reloadFrame(button.dataset.retryFrame)));document.querySelector('#newCharacterNavBtn')?.addEventListener('click',()=>openNewCharacter());
  document.querySelectorAll('[data-player-maintenance]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.playerMaintenance;if(action==='character-db'||action==='initial-stock'){ensureFrame('character');postCharacter({type:action==='character-db'?'RA_RELOAD_CHARACTER_DB':'RA_SYNC_INITIAL_WAREHOUSE'});}else if(action==='facility-db'){ensureFrame('facility');try{frames.facility?.contentWindow?.postMessage({type:'RA_RELOAD_FACILITY_DB'},location.origin)}catch(_){}}}));
  document.querySelector('#themeColorSelect')?.addEventListener('change',e=>applyTheme(e.currentTarget.value));applyTheme(currentTheme(),{persist:false});
  function routeFromHash(){const raw=(location.hash||'#home').slice(1);if(raw==='character/new')return openNewCharacter({writeHash:false});if(raw.startsWith('character/')){const id=decodeURIComponent(raw.slice('character/'.length));if(characters.length&&characters.some(c=>String(c.id)===id))return selectCharacterById(id,{writeHash:false});return;}show(raw,{writeHash:false});}
  addEventListener('popstate',routeFromHash);
  const notice=document.querySelector('#updateNotice'),noticeText=notice?.querySelector('span');
  async function checkPublishedVersion(){try{const res=await fetch('./version.json?t='+Date.now(),{cache:'no-store'});if(!res.ok)return;const data=await res.json(),published=String(data.version||'');if(published&&published!==APP_VERSION){if(noticeText)noticeText.textContent=`Playerアプリの新しいバージョン ${published} があります（現在 ${APP_VERSION}）。`;notice.hidden=false;await swRegistration?.update().catch(()=>{});}}catch(_){}}
  async function applyUpdate(){try{if(swRegistration){await swRegistration.update();if(swRegistration.waiting){swRegistration.waiting.postMessage({type:'SKIP_WAITING'});return;}const worker=swRegistration.installing;if(worker){worker.addEventListener('statechange',()=>{if(worker.state==='installed')(swRegistration.waiting||worker).postMessage({type:'SKIP_WAITING'});});return;}}}catch(_){}location.reload();}
  document.querySelector('#applyUpdate').onclick=applyUpdate;document.querySelector('#dismissUpdate').onclick=()=>{notice.hidden=true};
  if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').then(reg=>{swRegistration=reg;if(reg.waiting&&navigator.serviceWorker.controller){waitingWorker=reg.waiting;notice.hidden=false;}reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller){waitingWorker=reg.waiting||worker;notice.hidden=false;}});});reg.update().catch(()=>{});}).catch(()=>{});let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});}
  addEventListener('focus',checkPublishedVersion);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkPublishedVersion()});setInterval(checkPublishedVersion,5*60*1000);
  routeFromHash();loadCharacterList();checkPublishedVersion();
})();
