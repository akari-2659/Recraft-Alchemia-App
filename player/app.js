(()=>{
  'use strict';
  const APP_VERSION='0.14.0';
  const GAS_URL='https://script.google.com/macros/s/AKfycbxNQYC7-aBE23cliuD1Zdze18xHh-q45P1qpBgwCCg0dYgxd1b8A-R63eGjzMtgOxMT/exec';
  const sidebar=document.querySelector('#sidebar');
  const backdrop=document.querySelector('#backdrop');
  const views=[...document.querySelectorAll('.view')];
  const nav=[...document.querySelectorAll('.nav-btn')];
  const mobileTitle=document.querySelector('#mobileTitle');
  const characterCategory=document.querySelector('#characterCategory');
  const characterToggle=document.querySelector('#characterCategoryToggle');
  const characterNavList=document.querySelector('#characterNavList');
  const characterViewName=document.querySelector('#characterViewName');
  const frames={character:document.querySelector('#characterFrame'),facility:document.querySelector('#facilityFrame')};
  let characters=[];
  let selectedCharacterId='';
  let swRegistration=null;
  let waitingWorker=null;

  function readBinding(){
    const role=sessionStorage.getItem('ra-proto-role')||'player';
    const raw=localStorage.getItem('ra-proto-bind-'+role)||localStorage.getItem('ra-proto-bind-player')||'';
    try{return raw?JSON.parse(raw):{};}catch(_){return{}}
  }
  const binding=readBinding();
  window.RA_PLAYER_CONTEXT={charKey:String(binding.charKey||'').trim(),facilityKey:String(binding.facilityKey||'').trim(),characterId:''};

  function closeDrawer(){sidebar.classList.remove('open');backdrop.classList.remove('show')}
  function characterButtons(){return [...document.querySelectorAll('.character-nav-btn')]}
  const frameTimers=new Map();
  function setFrameLoading(name,text='読み込み中'){
    const frame=frames[name],wrap=frame?.closest('.module-frame-wrap');if(!wrap)return;
    wrap.classList.remove('loaded','load-error');
    const label=wrap.querySelector('.frame-loading-text');if(label)label.textContent=text||'読み込み中';
    clearTimeout(frameTimers.get(name));
    frameTimers.set(name,setTimeout(()=>{
      if(wrap.classList.contains('loaded'))return;
      wrap.classList.add('load-error');
      const late=wrap.querySelector('.frame-loading-text');if(late)late.textContent='読み込みに時間がかかっています';
    },45000));
  }
  function setFrameReady(name){
    const frame=frames[name],wrap=frame?.closest('.module-frame-wrap');if(!wrap)return;
    clearTimeout(frameTimers.get(name));frameTimers.delete(name);
    wrap.classList.remove('load-error');wrap.classList.add('loaded');
  }
  function setFrameError(name,text='読み込みに失敗しました'){
    const frame=frames[name],wrap=frame?.closest('.module-frame-wrap');if(!wrap)return;
    clearTimeout(frameTimers.get(name));frameTimers.delete(name);
    wrap.classList.remove('loaded');wrap.classList.add('load-error');
    const label=wrap.querySelector('.frame-loading-text');if(label)label.textContent=text;
  }
  function ensureFrame(name){
    const frame=frames[name];
    if(!frame||frame.dataset.loaded==='1')return;
    frame.dataset.loaded='1';setFrameLoading(name,'読み込み中');
    frame.addEventListener('load',()=>{const wrap=frame.closest('.module-frame-wrap');if(!wrap?.classList.contains('loaded')){const label=wrap?.querySelector('.frame-loading-text');if(label)label.textContent='データを読み込み中';}}, {once:true});
    frame.src=frame.dataset.src;
  }
  function show(name,{writeHash=true}={}){
    if(!document.querySelector('#view-'+name))name='home';
    views.forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
    nav.forEach(b=>b.classList.toggle('active',b.dataset.view===name));
    if(name!=='character')characterButtons().forEach(b=>b.classList.remove('active'));
    const active=document.querySelector('#view-'+name);
    mobileTitle.textContent=active?.dataset.title||'Recraft Alchemia';
    ensureFrame(name);
    closeDrawer();
    if(writeHash&&location.hash!=='#'+name)history.pushState(null,'','#'+name);
  }

  function jsonp(action,payload={}){
    return new Promise((resolve,reject)=>{
      const cb='raPlayerProtoCb_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      const timer=setTimeout(()=>{cleanup();reject(new Error('キャラクター一覧の取得がタイムアウトしました。'));},20000);
      function cleanup(){clearTimeout(timer);try{delete window[cb]}catch(_){window[cb]=undefined}script.remove()}
      window[cb]=json=>{cleanup();if(!json||json.ok===false)reject(new Error(json?.error||'キャラクター一覧を取得できませんでした。'));else resolve(json)};
      try{
        const u=new URL(GAS_URL);u.searchParams.set('api','1');u.searchParams.set('action',action);u.searchParams.set('callback',cb);
        Object.entries(payload).forEach(([k,v])=>{if(v!==undefined&&v!==null)u.searchParams.set(k,typeof v==='object'?JSON.stringify(v):String(v))});
        script.onerror=()=>{cleanup();reject(new Error('キャラクター一覧の取得に失敗しました。'));};
        script.src=u.toString();document.head.appendChild(script);
      }catch(e){cleanup();reject(e)}
    });
  }

  function renderCharacterNav(){
    if(!characterNavList)return;
    if(!characters.length){characterNavList.innerHTML='<div class="character-nav-status empty">保存済みキャラクターはありません。</div>';return;}
    characterNavList.innerHTML=characters.map(c=>`<button class="character-nav-btn" type="button" data-character-id="${escapeHtml(c.id)}">${escapeHtml(c.name||'無名のキャラクター')}</button>`).join('');
    characterButtons().forEach(btn=>btn.addEventListener('click',()=>selectCharacterById(btn.dataset.characterId)));
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  async function loadCharacterList(){
    const key=window.RA_PLAYER_CONTEXT.charKey;
    if(!key){
      characterNavList.innerHTML='<div class="character-nav-status error">ログイン時のキャラクターシート用プレイヤーキー紐づけが見つかりません。</div>';
      return;
    }
    characterNavList.innerHTML='<div class="character-nav-status loading"><span class="mini-spinner" aria-hidden="true"></span><span>読み込み中</span></div>';
    try{
      const res=await jsonp('list',{playerKey:key});
      characters=Array.isArray(res)?res:(Array.isArray(res.items)?res.items:(Array.isArray(res.data?.items)?res.data.items:[]));
      renderCharacterNav();
      routeFromHash();
    }catch(e){
      characterNavList.innerHTML=`<div class="character-nav-status error">${escapeHtml(e.message)}</div>`;
    }
  }

  function selectCharacterById(id,{writeHash=true}={}){
    const character=characters.find(c=>String(c.id)===String(id));
    if(!character)return;
    selectedCharacterId=String(character.id);
    window.RA_PLAYER_CONTEXT.characterId=selectedCharacterId;
    characterButtons().forEach(b=>b.classList.toggle('active',String(b.dataset.characterId)===selectedCharacterId));
    characterViewName.textContent=character.name||'無名のキャラクター';
    show('character',{writeHash:false});
    mobileTitle.textContent=character.name||'キャラクター';
    ensureFrame('character');
    try{frames.character?.contentWindow?.postMessage({type:'RA_OPEN_CHARACTER',characterId:selectedCharacterId},location.origin)}catch(_){}
    if(writeHash)history.pushState(null,'','#character/'+encodeURIComponent(selectedCharacterId));
  }


  window.addEventListener('message',ev=>{
    if(ev.origin!==location.origin)return;
    const name=Object.entries(frames).find(([,frame])=>frame?.contentWindow===ev.source)?.[0];
    if(!name)return;
    const type=String(ev.data?.type||'');
    if(type==='RA_MODULE_LOADING')setFrameLoading(name,String(ev.data?.text||'読み込み中'));
    else if(type==='RA_MODULE_READY')setFrameReady(name);
    else if(type==='RA_MODULE_ERROR')setFrameError(name,String(ev.data?.text||'読み込みに失敗しました'));
  });

  characterToggle?.addEventListener('click',()=>{
    const open=characterCategory.classList.toggle('open');
    characterToggle.setAttribute('aria-expanded',String(open));
  });
  document.querySelector('#menuBtn').onclick=()=>{sidebar.classList.toggle('open');backdrop.classList.toggle('show')};
  backdrop.onclick=closeDrawer;
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));

  function routeFromHash(){
    const raw=(location.hash||'#home').slice(1);
    if(raw.startsWith('character/')){
      const id=decodeURIComponent(raw.slice('character/'.length));
      if(characters.length&&characters.some(c=>String(c.id)===id))return selectCharacterById(id,{writeHash:false});
      return;
    }
    show(raw,{writeHash:false});
  }
  addEventListener('popstate',routeFromHash);

  // Explicit update check. This does not rely only on the browser noticing a Service Worker change.
  const notice=document.querySelector('#updateNotice');
  const noticeText=notice?.querySelector('span');
  async function checkPublishedVersion(){
    try{
      const res=await fetch('./version.json?t='+Date.now(),{cache:'no-store'});
      if(!res.ok)return;
      const data=await res.json();
      const published=String(data.version||'');
      if(published&&published!==APP_VERSION){
        if(noticeText)noticeText.textContent=`Playerアプリの新しいバージョン ${published} があります（現在 ${APP_VERSION}）。`;
        notice.hidden=false;
        await swRegistration?.update().catch(()=>{});
      }
    }catch(_){}
  }
  async function applyUpdate(){
    try{
      if(swRegistration){
        await swRegistration.update();
        if(swRegistration.waiting){swRegistration.waiting.postMessage({type:'SKIP_WAITING'});return;}
        const worker=swRegistration.installing;
        if(worker){
          worker.addEventListener('statechange',()=>{if(worker.state==='installed') (swRegistration.waiting||worker).postMessage({type:'SKIP_WAITING'});});
          return;
        }
      }
    }catch(_){}
    location.reload();
  }
  document.querySelector('#applyUpdate').onclick=applyUpdate;
  document.querySelector('#dismissUpdate').onclick=()=>{notice.hidden=true};

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').then(reg=>{
      swRegistration=reg;
      if(reg.waiting&&navigator.serviceWorker.controller){waitingWorker=reg.waiting;notice.hidden=false;}
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed'&&navigator.serviceWorker.controller){waitingWorker=reg.waiting||worker;notice.hidden=false;}
        });
      });
      reg.update().catch(()=>{});
    }).catch(()=>{});
    let reloading=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});
  }
  addEventListener('focus',checkPublishedVersion);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkPublishedVersion()});
  setInterval(checkPublishedVersion,5*60*1000);

  routeFromHash();
  loadCharacterList();
  checkPublishedVersion();
})();
