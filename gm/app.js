(()=>{'use strict';
const APP_VERSION='0.28.0';
const role=sessionStorage.getItem('ra-proto-role')||'';
const app=document.querySelector('#gmApp'),authError=document.querySelector('#authError');if(role!=='gm'){authError.classList.remove('hidden');return;}app.classList.remove('hidden');
const sidebar=document.querySelector('#sidebar'),backdrop=document.querySelector('#backdrop'),mobileTitle=document.querySelector('#mobileTitle');
const views=[...document.querySelectorAll('.view')],nav=[...document.querySelectorAll('.nav-btn')];
const frames={progress:document.querySelector('#progressFrame'),database:document.querySelector('#databaseFrame'),help:document.querySelector('#helpFrame')};
let swRegistration=null;const timers=new Map();

  const THEME_STORAGE_KEY='ra-app-theme-color';
  const THEMES={
    red:{label:"レッド",bg:"#eadfdd",paper:"#fff8f5",paper2:"#f3e3de",ink:"#352426",muted:"#786164",line:"#d8b5ae",accent:"#9d4149",accent2:"#c79650",deep:"#341e26",active:"#7a323b",hover:"#57272f",theme:"#7a323b",soft:"#edcec6",secondary:"#536a7d",secondaryText:"#ffffff",input:"#fffdf9",topbar:"#f8ece7",highlight:"#f1d3a4"},
    blue:{label:"ブルー",bg:"#dfe8f0",paper:"#f8fbff",paper2:"#e7eff6",ink:"#213041",muted:"#607184",line:"#b9cadb",accent:"#396d9f",accent2:"#b78350",deep:"#1c3047",active:"#315d87",hover:"#274a6b",theme:"#315d87",soft:"#d3e2ef",secondary:"#4d8089",secondaryText:"#ffffff",input:"#fcfeff",topbar:"#eaf2f8",highlight:"#ead5bd"},
    green:{label:"グリーン",bg:"#e3ebe1",paper:"#fbfcf7",paper2:"#e8efe3",ink:"#25342a",muted:"#647267",line:"#becdb8",accent:"#497253",accent2:"#b08a48",deep:"#21372a",active:"#3d6247",hover:"#304d38",theme:"#3d6247",soft:"#d5e3ce",secondary:"#6b778d",secondaryText:"#ffffff",input:"#fdfef9",topbar:"#edf3e9",highlight:"#e4d4ad"},
    purple:{label:"パープル",bg:"#e8e2ee",paper:"#fdf9ff",paper2:"#eee6f2",ink:"#31283a",muted:"#70647a",line:"#c9b8d3",accent:"#72528a",accent2:"#b97886",deep:"#32243e",active:"#604470",hover:"#493555",theme:"#604470",soft:"#dfd2e5",secondary:"#8a7549",secondaryText:"#ffffff",input:"#fffcff",topbar:"#f1eaf5",highlight:"#e8c8cf"},
    orange:{label:"オレンジ",bg:"#eee3d9",paper:"#fff9f3",paper2:"#f4e6d8",ink:"#39291f",muted:"#79695d",line:"#d7bfa8",accent:"#b76531",accent2:"#3e8082",deep:"#43291b",active:"#8e522b",hover:"#6a3e24",theme:"#8e522b",soft:"#edd4bc",secondary:"#3f7b80",secondaryText:"#ffffff",input:"#fffdf9",topbar:"#f7ebe0",highlight:"#cce0dd"},
    yellow:{label:"イエロー",bg:"#ebe6d2",paper:"#fffdf3",paper2:"#f3ebcd",ink:"#373121",muted:"#746d58",line:"#d5c58e",accent:"#98791f",accent2:"#4b6784",deep:"#37321f",active:"#755f1d",hover:"#58491c",theme:"#755f1d",soft:"#e9dda9",secondary:"#4b6784",secondaryText:"#ffffff",input:"#fffef8",topbar:"#f5efda",highlight:"#d6dfed"},
    pink:{label:"ピンク",bg:"#eee1e8",paper:"#fff9fc",paper2:"#f3e5ec",ink:"#39272f",muted:"#79646f",line:"#d5b7c5",accent:"#a95177",accent2:"#737ea4",deep:"#432736",active:"#86405e",hover:"#633047",theme:"#86405e",soft:"#ebceda",secondary:"#6f7899",secondaryText:"#ffffff",input:"#fffdfd",topbar:"#f7eaf0",highlight:"#dce1ef"},
    cyan:{label:"シアン",bg:"#dcebed",paper:"#f7fdfe",paper2:"#e3f0f1",ink:"#213538",muted:"#607579",line:"#b4d0d2",accent:"#37838a",accent2:"#7767a0",deep:"#17383d",active:"#2e6c72",hover:"#24545a",theme:"#2e6c72",soft:"#cee5e7",secondary:"#6c6093",secondaryText:"#ffffff",input:"#fbffff",topbar:"#e7f3f4",highlight:"#ded8ed"},
    navy:{label:"ネイビー",bg:"#dde2e9",paper:"#f8fafc",paper2:"#e6ebf1",ink:"#222d3b",muted:"#626d7c",line:"#bac2ce",accent:"#405a80",accent2:"#b28a50",deep:"#172339",active:"#334a6e",hover:"#283a55",theme:"#334a6e",soft:"#d2dae6",secondary:"#677487",secondaryText:"#ffffff",input:"#fcfdff",topbar:"#e9edf3",highlight:"#eadcc1"},
    brown:{label:"ブラウン",bg:"#eee6da",paper:"#fff9ef",paper2:"#f4ead7",ink:"#34251d",muted:"#74665c",line:"#d8c5a8",accent:"#8c542f",accent2:"#597872",deep:"#2f231d",active:"#5b3c2a",hover:"#493128",theme:"#6c432f",soft:"#e8d5b8",secondary:"#5a7770",secondaryText:"#ffffff",input:"#fffdf8",topbar:"#f6eddf",highlight:"#d4e0da"}
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
    '--theme-secondary':theme.secondary,'--theme-secondary-text':theme.secondaryText,'--theme-input':theme.input,'--theme-topbar':theme.topbar,'--theme-highlight':theme.highlight,
    '--ra-desk':theme.deep,'--ra-desk-2':theme.hover,'--ra-page':theme.paper,'--ra-page-2':theme.paper2,'--ra-page-3':theme.soft,
    '--ra-ink':theme.ink,'--ra-muted':theme.muted,'--ra-line':theme.line,'--ra-line-soft':theme.line,'--ra-line-dark':theme.hover,
    '--ra-navy':theme.accent,'--ra-navy-2':theme.deep,'--ra-burgundy':theme.accent,'--ra-burgundy-2':theme.deep,
    '--ra-brass':theme.accent2,'--ra-brass-light':theme.highlight
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
        body.ra-app{color:var(--ink)!important;background:linear-gradient(145deg,var(--bg),color-mix(in srgb,var(--bg) 74%,var(--app-deep) 26%))!important}
        body.ra-app>header,body.ra-app header{background:color-mix(in srgb,var(--theme-topbar) 94%,transparent)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app>main{background:var(--paper)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app :is(.panel,.big-section,.card,.mini-card,.status-box,.resource-card,.choice-card,.help-card,.compact-storage-panel,.facility-work-block,.facility-summary,.autosave-panel,.dialog-inner,.weapon-modal-dialog,.branch-controls,.branch-graph-scroll,.catalog-rank-controls,.inventory-filter-panel,.inventory-search-panel,.tab-block,.subnav-block,.progress-fold,.community-manager-card,.weather-manager,.day-stat,.event-card,.result,.drop-row,.monster-combobox-menu,.facility-product,.facility-card,.record-list-search,.admin-global-search-panel,.admin-global-search-card,.table-pagination){border-color:var(--line)!important;background:var(--paper)!important;color:var(--ink)!important;box-shadow:0 8px 22px color-mix(in srgb,var(--app-deep) 10%,transparent)!important}
        body.ra-app :is(.tab-nav,.tabs,.subtabs,.buttons,.quest-tools,.quest-category-bar,.toolbar,.section-actions,.filter-actions,.facility-actions,.help-actions,.monster-output-actions,.modal-foot,.facility-inner-tabs,.facility-weapon-category-tabs){background:var(--paper2)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app :is(input,select,textarea){background:var(--theme-input)!important;color:var(--ink)!important;border-color:var(--line)!important;box-shadow:inset 0 1px 2px color-mix(in srgb,var(--app-deep) 8%,transparent)!important}
        body.ra-app :is(input,select,textarea):focus{border-color:var(--accent)!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent)!important}
        body.ra-app button:not(.ghost):not(.danger):not(.secondary),body.ra-app :is(.tab,.subtab,.tab-btn,.editor-tab-btn,.quest-category-btn,.facility-inner-tab,.facility-weapon-category-tab).active{background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 82%,#fff 18%),var(--accent))!important;border-color:color-mix(in srgb,var(--accent) 78%,var(--app-deep) 22%)!important;color:#fff!important;box-shadow:0 2px 0 color-mix(in srgb,var(--accent) 62%,#000 38%),0 5px 12px color-mix(in srgb,var(--accent) 22%,transparent)!important;text-shadow:0 1px 0 rgba(0,0,0,.18)!important}
        body.ra-app button.secondary,body.ra-app :is(.tab,.subtab,.tab-btn,.editor-tab-btn,.quest-category-btn,.facility-inner-tab,.facility-weapon-category-tab):not(.active){background:linear-gradient(180deg,color-mix(in srgb,var(--theme-secondary) 82%,#fff 18%),var(--theme-secondary))!important;border-color:color-mix(in srgb,var(--theme-secondary) 76%,var(--app-deep) 24%)!important;color:var(--theme-secondary-text)!important;box-shadow:0 2px 0 color-mix(in srgb,var(--theme-secondary) 62%,#000 38%),0 4px 10px color-mix(in srgb,var(--theme-secondary) 18%,transparent)!important;text-shadow:0 1px 0 rgba(0,0,0,.16)!important}
        body.ra-app button.ghost{background:var(--paper)!important;border-color:var(--accent)!important;color:var(--accent)!important;box-shadow:none!important;text-shadow:none!important}
        body.ra-app button.danger{background:linear-gradient(180deg,#b45656,#8e3333)!important;border-color:#6b2727!important;color:#fff!important}
        body.ra-app :is(.badge,.pill,.quest-pill){background:var(--paper2)!important;border-color:var(--line)!important;color:var(--muted)!important}
        body.ra-app :is(.progress-fold>summary,.ra-progress-load-fold>summary,.ra-admin-fold>summary){background:color-mix(in srgb,var(--paper2) 82%,var(--theme-highlight) 18%)!important;color:var(--ink)!important;border-color:var(--line)!important}
        body.ra-app :is(.progress-wrap,.community-manager-progress){background:color-mix(in srgb,var(--paper2) 80%,var(--line) 20%)!important;border-color:var(--line)!important}
        body.ra-app :is(.progress-bar,.community-manager-progress span){background:linear-gradient(90deg,var(--accent),var(--accent2))!important}
        body.ra-app :is(.section-title,.big-section>h2,.panel>h2,.panel>h3,.summary-line h2,h1,h2,h3){color:var(--ink)!important;border-color:color-mix(in srgb,var(--line) 78%,var(--accent2) 22%)!important}
        body.ra-app :is(.muted,.hint,.subtitle,.version,.small,.notice){color:var(--muted)!important}
        body.ra-app .ra-build-info,body.ra-app .build{background:var(--paper2)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app .tab-nav#progressTabNav{background:color-mix(in srgb,var(--paper2) 92%,var(--theme-highlight) 8%)!important;border-color:var(--line)!important}
        body.ra-app .status.good,body.ra-app .event-card.random{background:color-mix(in srgb,var(--paper) 82%,#bfe2c9 18%)!important}
        body.ra-app .status.bad{background:color-mix(in srgb,var(--paper) 84%,#e8b8b3 16%)!important}
        body.ra-app .status.warn,body.ra-app .event-card.fixed{background:color-mix(in srgb,var(--paper) 82%,var(--theme-highlight) 18%)!important}
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
