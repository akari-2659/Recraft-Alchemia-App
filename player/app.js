(()=>{
  const sidebar=document.querySelector('#sidebar');
  const backdrop=document.querySelector('#backdrop');
  const views=[...document.querySelectorAll('.view')];
  const nav=[...document.querySelectorAll('.nav-btn')];
  const mobileTitle=document.querySelector('#mobileTitle');
  const characterCategory=document.querySelector('#characterCategory');
  const characterToggle=document.querySelector('#characterCategoryToggle');
  const characterButtons=[...document.querySelectorAll('.character-nav-btn')];
  const characterViewName=document.querySelector('#characterViewName');
  const frames={
    character:document.querySelector('#characterFrame'),
    facility:document.querySelector('#facilityFrame')
  };

  function closeDrawer(){sidebar.classList.remove('open');backdrop.classList.remove('show')}
  function ensureFrame(name){
    const frame=frames[name];
    if(!frame||frame.dataset.loaded==='1')return;
    frame.dataset.loaded='1';
    frame.addEventListener('load',()=>frame.closest('.module-frame-wrap')?.classList.add('loaded'),{once:true});
    frame.src=frame.dataset.src;
  }
  function show(name,{writeHash=true}={}){
    if(!document.querySelector('#view-'+name))name='home';
    views.forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
    nav.forEach(b=>b.classList.toggle('active',b.dataset.view===name));
    if(name!=='character')characterButtons.forEach(b=>b.classList.remove('active'));
    const active=document.querySelector('#view-'+name);
    mobileTitle.textContent=active?.dataset.title||'Recraft Alchemia';
    ensureFrame(name);
    closeDrawer();
    if(writeHash&&location.hash!=='#'+name)history.pushState(null,'','#'+name);
    if(name==='home')document.querySelector('.main')?.scrollTo({top:0,behavior:'instant'});
  }

  function selectCharacter(button,{writeHash=true}={}){
    characterButtons.forEach(b=>b.classList.toggle('active',b===button));
    const name=button?.textContent?.trim()||'キャラクター';
    if(characterViewName)characterViewName.textContent=name;
    show('character',{writeHash:false});
    mobileTitle.textContent=name;
    closeDrawer();
    if(writeHash)history.pushState(null,'','#character/'+encodeURIComponent(button?.dataset.characterId||''));
  }

  characterToggle?.addEventListener('click',()=>{
    const open=characterCategory.classList.toggle('open');
    characterToggle.setAttribute('aria-expanded',String(open));
  });
  characterButtons.forEach(button=>button.addEventListener('click',()=>selectCharacter(button)));

  document.querySelector('#menuBtn').onclick=()=>{sidebar.classList.toggle('open');backdrop.classList.toggle('show')};
  backdrop.onclick=closeDrawer;
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
  function routeFromHash(){
    const raw=(location.hash||'#home').slice(1);
    if(raw.startsWith('character/')){
      const id=decodeURIComponent(raw.split('/')[1]||'');
      const button=characterButtons.find(b=>b.dataset.characterId===id)||characterButtons[0];
      if(button)return selectCharacter(button,{writeHash:false});
    }
    show(raw,{writeHash:false});
  }
  addEventListener('popstate',routeFromHash);

  // PWA update: do not force a reload during play. Ask first, then activate the waiting worker.
  if('serviceWorker' in navigator){
    let waitingWorker=null;
    const notice=document.querySelector('#updateNotice');
    const showUpdate=worker=>{waitingWorker=worker;notice.hidden=false};
    navigator.serviceWorker.register('./sw.js').then(reg=>{
      if(reg.waiting&&navigator.serviceWorker.controller)showUpdate(reg.waiting);
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate(reg.waiting||worker);
        });
      });
    }).catch(()=>{});
    document.querySelector('#applyUpdate').onclick=()=>waitingWorker?.postMessage({type:'SKIP_WAITING'});
    document.querySelector('#dismissUpdate').onclick=()=>{notice.hidden=true};
    let reloading=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});
  }

  routeFromHash();
})();
