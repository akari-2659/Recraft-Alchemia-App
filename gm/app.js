(()=>{'use strict';
const APP_VERSION='0.11.0';
const role=sessionStorage.getItem('ra-proto-role')||'';
const app=document.querySelector('#gmApp'),authError=document.querySelector('#authError');
if(role!=='gm'){authError.classList.remove('hidden');return;}app.classList.remove('hidden');
const sidebar=document.querySelector('#sidebar'),backdrop=document.querySelector('#backdrop'),mobileTitle=document.querySelector('#mobileTitle');
const views=[...document.querySelectorAll('.view')],nav=[...document.querySelectorAll('.nav-btn')];
const frames={progress:document.querySelector('#progressFrame'),database:document.querySelector('#databaseFrame'),help:document.querySelector('#helpFrame')};
let swRegistration=null;const timers=new Map();
function closeDrawer(){sidebar.classList.remove('open');backdrop.classList.remove('show')}
function loading(name,text='読み込み中'){const f=frames[name],w=f?.closest('.module-frame-wrap');if(!w)return;w.classList.remove('loaded','load-error');const l=w.querySelector('.frame-loading-text');if(l)l.textContent=text;clearTimeout(timers.get(name));timers.set(name,setTimeout(()=>{if(w.classList.contains('loaded'))return;w.classList.add('load-error');if(l)l.textContent='読み込みに時間がかかっています';},45000));}
function ready(name){const f=frames[name],w=f?.closest('.module-frame-wrap');if(!w)return;clearTimeout(timers.get(name));timers.delete(name);w.classList.remove('load-error');w.classList.add('loaded');}
function ensure(name){const f=frames[name];if(!f||f.dataset.loaded==='1')return;f.dataset.loaded='1';loading(name);f.addEventListener('load',()=>ready(name),{once:true});f.addEventListener('error',()=>{const w=f.closest('.module-frame-wrap');w?.classList.add('load-error');const l=w?.querySelector('.frame-loading-text');if(l)l.textContent='読み込みに失敗しました';},{once:true});f.src=f.dataset.src;}
function show(name,{writeHash=true}={}){if(!document.querySelector('#view-'+name))name='home';views.forEach(v=>v.classList.toggle('active',v.id==='view-'+name));nav.forEach(b=>b.classList.toggle('active',b.dataset.view===name));mobileTitle.textContent=document.querySelector('#view-'+name)?.dataset.title||'GM';ensure(name);closeDrawer();if(writeHash&&location.hash!=='#'+name)history.pushState(null,'','#'+name);}
document.querySelector('#menuBtn').onclick=()=>{sidebar.classList.toggle('open');backdrop.classList.toggle('show')};backdrop.onclick=closeDrawer;nav.forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>show(b.dataset.jump));addEventListener('popstate',()=>show((location.hash||'#home').slice(1),{writeHash:false}));
const notice=document.querySelector('#updateNotice'),noticeText=notice.querySelector('span');
async function checkVersion(){try{const r=await fetch('./version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const d=await r.json();const p=String(d.version||'');if(p&&p!==APP_VERSION){noticeText.textContent=`新しい試作版 ${p} があります（現在 ${APP_VERSION}）。`;notice.hidden=false;await swRegistration?.update().catch(()=>{});}}catch(_){}}
async function applyUpdate(){try{if(swRegistration){await swRegistration.update();if(swRegistration.waiting){swRegistration.waiting.postMessage({type:'SKIP_WAITING'});return;}const w=swRegistration.installing;if(w){w.addEventListener('statechange',()=>{if(w.state==='installed')(swRegistration.waiting||w).postMessage({type:'SKIP_WAITING'});});return;}}}catch(_){}location.reload();}
document.querySelector('#applyUpdate').onclick=applyUpdate;document.querySelector('#dismissUpdate').onclick=()=>notice.hidden=true;
if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').then(reg=>{swRegistration=reg;if(reg.waiting&&navigator.serviceWorker.controller)notice.hidden=false;reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)notice.hidden=false;});});reg.update().catch(()=>{});}).catch(()=>{});let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});}
addEventListener('focus',checkVersion);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkVersion()});setInterval(checkVersion,5*60*1000);
show((location.hash||'#home').slice(1),{writeHash:false});checkVersion();
})();
