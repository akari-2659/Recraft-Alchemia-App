(()=>{
  'use strict';
  const $=s=>document.querySelector(s);

  const THEME_STORAGE_KEY='ra-app-theme-color';
  const PORTAL_THEMES={
    red:["#eadfdd","#fff8f5","#f3e3de","#352426","#786164","#d8b5ae","#9d4149","#c79650","#341e26","#7a323b","#57272f","#edcec6"],
    blue:["#dfe8f0","#f8fbff","#e7eff6","#213041","#607184","#b9cadb","#396d9f","#b78350","#1c3047","#315d87","#274a6b","#d3e2ef"],
    green:["#e3ebe1","#fbfcf7","#e8efe3","#25342a","#647267","#becdb8","#497253","#b08a48","#21372a","#3d6247","#304d38","#d5e3ce"],
    purple:["#e8e2ee","#fdf9ff","#eee6f2","#31283a","#70647a","#c9b8d3","#72528a","#b97886","#32243e","#604470","#493555","#dfd2e5"],
    orange:["#eee3d9","#fff9f3","#f4e6d8","#39291f","#79695d","#d7bfa8","#b76531","#3e8082","#43291b","#8e522b","#6a3e24","#edd4bc"],
    yellow:["#ebe6d2","#fffdf3","#f3ebcd","#373121","#746d58","#d5c58e","#98791f","#4b6784","#37321f","#755f1d","#58491c","#e9dda9"],
    pink:["#eee1e8","#fff9fc","#f3e5ec","#39272f","#79646f","#d5b7c5","#a95177","#737ea4","#432736","#86405e","#633047","#ebceda"],
    cyan:["#dcebed","#f7fdfe","#e3f0f1","#213538","#607579","#b4d0d2","#37838a","#7767a0","#17383d","#2e6c72","#24545a","#cee5e7"],
    navy:["#dde2e9","#f8fafc","#e6ebf1","#222d3b","#626d7c","#bac2ce","#405a80","#b28a50","#172339","#334a6e","#283a55","#d2dae6"],
    brown:["#eee6da","#fff9ef","#f4ead7","#34251d","#74665c","#d8c5a8","#8c542f","#597872","#2f231d","#5b3c2a","#493128","#e8d5b8"]
  };
  (function applyStoredPortalTheme(){let key=localStorage.getItem(THEME_STORAGE_KEY)||'brown';if(key==='classic')key='brown';if(key==='violet')key='purple';if(key==='amber')key='orange';const a=PORTAL_THEMES[key]||PORTAL_THEMES.brown;const names=['--bg','--paper','--paper2','--ink','--muted','--line','--accent','--accent2','--app-deep','--app-active','--app-hover','--theme-soft'];names.forEach((n,i)=>document.documentElement.style.setProperty(n,a[i]));document.documentElement.dataset.raTheme=key;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',a[9]);})();

  let role='player',loginPlayerKey='';
  const loginBox=$('#loginBox'),keySetup=$('#keySetup'),launcher=$('#launcher');
  const accountBindingKey=key=>`ra-proto-bind-account-${encodeURIComponent(String(key||'').trim())}`;
  function readAccountBinding(){if(!loginPlayerKey)return null;try{return JSON.parse(localStorage.getItem(accountBindingKey(loginPlayerKey))||'null')}catch(_){return null}}
  function hasBinding(){const b=readAccountBinding();return !!(b&&String(b.charKey||'').trim()&&String(b.facilityKey||'').trim())}
  function detectRole(key){return String(key||'').trim()==='akari'?'gm':'player'}
  function setSession(){sessionStorage.setItem('ra-proto-login-player-key',loginPlayerKey);sessionStorage.setItem('ra-proto-role',role)}
  function enterAfterLogin(){
    setSession();
    if(role==='gm')showLauncher();
    else location.href='player/';
  }
  function start(key){
    loginPlayerKey=String(key||'').trim();
    if(!loginPlayerKey){alert('プレイヤーキーを入力してください。');return;}
    role=detectRole(loginPlayerKey);setSession();loginBox.classList.add('hidden');launcher.classList.add('hidden');
    if(hasBinding())enterAfterLogin();else keySetup.classList.remove('hidden');
  }
  function showLauncher(){
    loginBox.classList.add('hidden');keySetup.classList.add('hidden');launcher.classList.remove('hidden');
    $('#roleBadge').textContent='GM';$('#gmLaunch').classList.remove('hidden');setSession();
  }
  $('#loginBtn').onclick=()=>start($('#loginPlayerKey').value);
  $('#loginPlayerKey').addEventListener('keydown',e=>{if(e.key==='Enter')start(e.currentTarget.value)});
  $('#bindKeys').onclick=()=>{
    const a=$('#charKey').value.trim(),b=$('#facilityKey').value.trim();
    if(!a||!b){alert('初回紐づけ用の2つの既存プレイヤーキーを入力してください。');return;}
    const binding={charKey:a,facilityKey:b,loginPlayerKey,role};
    localStorage.setItem(accountBindingKey(loginPlayerKey),JSON.stringify(binding));
    localStorage.setItem('ra-proto-bind-'+role,JSON.stringify(binding));
    if(role==='player')localStorage.setItem('ra-proto-bind-player',JSON.stringify(binding));
    enterAfterLogin();
  };
  $('#logout').onclick=()=>{sessionStorage.removeItem('ra-proto-role');sessionStorage.removeItem('ra-proto-login-player-key');location.reload()};
})();
