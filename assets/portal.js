(()=>{
  'use strict';
  const $=s=>document.querySelector(s);

  const THEME_STORAGE_KEY='ra-app-theme-color';
  const PORTAL_THEMES={
    red:['#f2e7e5','#fff9f7','#f8ebe7','#352425','#796263','#dab8b4','#9b4347','#c8756d','#3a2125','#7d363d','#5c2b30','#efd3cf'],
    blue:['#e8eff6','#f9fcff','#eaf2f9','#202d3b','#607080','#b9cadb','#4273a2','#79a7cc','#1d3046','#345f87','#284a69','#d5e5f2'],
    green:['#e9f1e9','#fbfdf9','#eaf3e8','#26342a','#657367','#bfd0bd','#4b7757','#82a978','#23392a','#40674a','#31513a','#d8e7d4'],
    purple:['#eee9f3','#fdfaff','#f0e9f5','#30273a','#70657a','#cbbbd5','#74558a','#aa8cbb','#33263e','#604771','#4b3858','#e2d6e8'],
    orange:['#f5ebe1','#fffaf5','#f7e9da','#39291f','#7c695c','#dcc3aa','#b56b32','#d6965d','#44291b','#8d522a','#6b3f24','#f0d8bd'],
    yellow:['#f5f0dc','#fffdf4','#f6efd2','#393321','#78705b','#d9c991','#9a791e','#c9a84c','#403720','#765f1d','#5a491d','#eee1ae'],
    pink:['#f5e9ef','#fffafd','#f7e9f0','#39272f','#7d6671','#dabcca','#aa5278','#d18aa6','#452838','#88415f','#663248','#f0d3df'],
    cyan:['#e5f2f3','#f9feff','#e7f4f4','#223436','#62777a','#b7d3d5','#38868d','#78b7bb','#183a3f','#2e6e75','#25565c','#d2e9ea'],
    navy:['#e7ebf1','#f9fbfe','#e9edf4','#222c3b','#626c7c','#bac3d1','#405a82','#7f94b2','#18243a','#334b70','#283a56','#d6deea'],
    brown:['#f5eee4','#fff9ef','#fbf1df','#34251d','#76685e','#ddcbb0','#8f542d','#b98643','#30231c','#5a3b29','#4a3326','#ecd9bd']
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
