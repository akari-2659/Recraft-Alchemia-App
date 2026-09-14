(()=>{'use strict';
const APP_VERSION='0.25.0';
const role=sessionStorage.getItem('ra-proto-role')||'';
const app=document.querySelector('#gmApp'),authError=document.querySelector('#authError');if(role!=='gm'){authError.classList.remove('hidden');return;}app.classList.remove('hidden');
const sidebar=document.querySelector('#sidebar'),backdrop=document.querySelector('#backdrop'),mobileTitle=document.querySelector('#mobileTitle');
const views=[...document.querySelectorAll('.view')],nav=[...document.querySelectorAll('.nav-btn')];
const frames={progress:document.querySelector('#progressFrame'),database:document.querySelector('#databaseFrame'),help:document.querySelector('#helpFrame')};
let swRegistration=null;const timers=new Map();

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

function closeDrawer(){sidebar.classList.remove('open');backdrop.classList.remove('show')}
function loading(name,text='読み込み中'){const f=frames[name],w=f?.closest('.module-frame-wrap');if(!w)return;w.classList.remove('loaded','load-error');const l=w.querySelector('.frame-loading-text');if(l)l.textContent=text;clearTimeout(timers.get(name));timers.set(name,setTimeout(()=>{if(w.classList.contains('loaded'))return;w.classList.add('load-error');if(l)l.textContent='読み込みがタイムアウトしました。再読み込みできます。';},45000));}
function ready(name){const f=frames[name],w=f?.closest('.module-frame-wrap');if(!w)return;clearTimeout(timers.get(name));timers.delete(name);w.classList.remove('load-error');w.classList.add('loaded');applyThemeToFrame(f,THEMES[currentTheme()]);}
function reloadFrame(name){const f=frames[name];if(!f)return;const base=f.dataset.src||f.getAttribute('src')||'';if(!base)return;f.dataset.loaded='1';loading(name,'再読み込み中');try{const u=new URL(base,location.href);u.searchParams.set('retry',String(Date.now()));f.src=u.toString();}catch(_){f.src=base+(base.includes('?')?'&':'?')+'retry='+Date.now();}}
function ensure(name){const f=frames[name];if(!f||f.dataset.loaded==='1')return;f.dataset.loaded='1';loading(name);f.addEventListener('load',()=>{ready(name);applyThemeToFrame(f,THEMES[currentTheme()]);});f.addEventListener('error',()=>{const w=f.closest('.module-frame-wrap');w?.classList.add('load-error');const l=w?.querySelector('.frame-loading-text');if(l)l.textContent='読み込みに失敗しました';},{once:true});f.src=f.dataset.src;}
function show(name,{writeHash=true}={}){if(!document.querySelector('#view-'+name))name='home';views.forEach(v=>v.classList.toggle('active',v.id==='view-'+name));nav.forEach(b=>b.classList.toggle('active',b.dataset.view===name));mobileTitle.textContent=document.querySelector('#view-'+name)?.dataset.title||'GM';ensure(name);closeDrawer();if(writeHash&&location.hash!=='#'+name)history.pushState(null,'','#'+name);}
document.querySelector('#menuBtn').onclick=()=>{sidebar.classList.toggle('open');backdrop.classList.toggle('show')};backdrop.onclick=closeDrawer;nav.forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>show(b.dataset.jump));document.querySelectorAll('[data-retry-frame]').forEach(button=>button.addEventListener('click',()=>reloadFrame(button.dataset.retryFrame)));addEventListener('popstate',()=>show((location.hash||'#home').slice(1),{writeHash:false}));
document.querySelector('#themeColorSelect')?.addEventListener('change',e=>applyTheme(e.currentTarget.value));applyTheme(currentTheme(),{persist:false});
const notice=document.querySelector('#updateNotice'),noticeText=notice.querySelector('span'),applyUpdateBtn=document.querySelector('#applyUpdate'),dismissUpdateBtn=document.querySelector('#dismissUpdate');
const versionState=document.querySelector('#gmVersionState'),currentVersionLabel=document.querySelector('#gmCurrentVersion'),LAST_RUN_VERSION_KEY='ra-gm-prototype-last-run-version';if(currentVersionLabel)currentVersionLabel.textContent=APP_VERSION;
function setVersionState(text,kind=''){if(!versionState)return;versionState.textContent=text;versionState.dataset.state=kind;}
function showAvailableUpdate(version){notice.dataset.mode='available';noticeText.textContent=`GMアプリの新しいバージョン ${version} があります（現在 ${APP_VERSION}）。`;applyUpdateBtn.hidden=false;dismissUpdateBtn.textContent='あとで';notice.hidden=false;setVersionState(`v${version}あり`,'update');}
function showAppliedUpdate(previous){notice.dataset.mode='applied';noticeText.textContent=previous?`GMアプリを ${APP_VERSION} へ更新しました（前回 ${previous}）。`:`GMアプリ ${APP_VERSION} を読み込みました。`;applyUpdateBtn.hidden=true;dismissUpdateBtn.textContent='閉じる';notice.hidden=false;setVersionState('最新版','current');}
async function checkVersion(){setVersionState('確認中','checking');try{const r=await fetch('./version.json?t='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'}});if(!r.ok){setVersionState('確認失敗','error');return;}const d=await r.json(),p=String(d.version||'').trim();if(p&&p!==APP_VERSION){showAvailableUpdate(p);await swRegistration?.update().catch(()=>{});return;}setVersionState('最新版','current');}catch(_){setVersionState('確認失敗','error');}}
async function applyUpdate(){applyUpdateBtn.disabled=true;applyUpdateBtn.textContent='アプリ更新中…';try{if(swRegistration){await swRegistration.update();if(swRegistration.waiting){swRegistration.waiting.postMessage({type:'SKIP_WAITING'});return;}const w=swRegistration.installing;if(w){w.addEventListener('statechange',()=>{if(w.state==='installed')(swRegistration.waiting||w).postMessage({type:'SKIP_WAITING'});});return;}}}catch(_){}location.reload();}
applyUpdateBtn.onclick=applyUpdate;dismissUpdateBtn.onclick=()=>notice.hidden=true;const previousRunVersion=localStorage.getItem(LAST_RUN_VERSION_KEY)||'';if(previousRunVersion&&previousRunVersion!==APP_VERSION)showAppliedUpdate(previousRunVersion);localStorage.setItem(LAST_RUN_VERSION_KEY,APP_VERSION);
if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').then(reg=>{swRegistration=reg;if(reg.waiting&&navigator.serviceWorker.controller){showAvailableUpdate('更新準備済み');}reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller){noticeText.textContent='GMアプリ一式の新しいバージョンを取得しました。更新して切り替えられます。';applyUpdateBtn.hidden=false;dismissUpdateBtn.textContent='あとで';notice.hidden=false;setVersionState('更新あり','update');}});});reg.update().catch(()=>{});}).catch(()=>setVersionState('SW未登録','error'));let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});}
addEventListener('focus',checkVersion);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkVersion()});setInterval(checkVersion,2*60*1000);show((location.hash||'#home').slice(1),{writeHash:false});checkVersion();
})();
