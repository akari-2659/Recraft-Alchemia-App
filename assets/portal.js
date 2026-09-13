(()=>{
 const $=s=>document.querySelector(s); let role='player',loginPlayerKey='';
 const loginBox=$('#loginBox'), keySetup=$('#keySetup'), launcher=$('#launcher');
 const accountBindingKey=key=>`ra-proto-bind-account-${encodeURIComponent(String(key||'').trim())}`;
 function readAccountBinding(){if(!loginPlayerKey)return null;try{return JSON.parse(localStorage.getItem(accountBindingKey(loginPlayerKey))||'null')}catch(_){return null}}
 function hasBinding(){return !!readAccountBinding()}
 function detectRole(key){const normalized=String(key||'').trim();return normalized==='akari'?'gm':'player'}
 function start(key){
   loginPlayerKey=String(key||'').trim();
   if(!loginPlayerKey){alert('プレイヤーキーを入力してください。');return;}
   role=detectRole(loginPlayerKey);
   sessionStorage.setItem('ra-proto-login-player-key',loginPlayerKey);
   sessionStorage.setItem('ra-proto-role',role);
   loginBox.classList.add('hidden');
   if(hasBinding())showLauncher();else keySetup.classList.remove('hidden');
 }
 function showLauncher(){
   keySetup.classList.add('hidden');launcher.classList.remove('hidden');
   $('#roleBadge').textContent=role==='gm'?'GM（仮判定）':'Player（仮判定）';
   $('#gmLaunch').classList.toggle('hidden',role!=='gm');
   sessionStorage.setItem('ra-proto-role',role);
   sessionStorage.setItem('ra-proto-login-player-key',loginPlayerKey);
 }
 $('#loginBtn').onclick=()=>start($('#loginPlayerKey').value);
 $('#loginPlayerKey').addEventListener('keydown',e=>{if(e.key==='Enter')start(e.currentTarget.value)});
 $('#bindKeys').onclick=()=>{
   const a=$('#charKey').value.trim(),b=$('#facilityKey').value.trim();
   if(!a||!b){alert('初回紐づけ用の2つの既存プレイヤーキーを入力してください。');return;}
   const binding={charKey:a,facilityKey:b,loginPlayerKey,role};
   localStorage.setItem(accountBindingKey(loginPlayerKey),JSON.stringify(binding));
   /* 旧試作からの互換用。Playerアプリ側もアカウント単位を優先する。 */
   localStorage.setItem('ra-proto-bind-'+role,JSON.stringify(binding));
   showLauncher();
 };
 $('#logout').onclick=()=>{sessionStorage.removeItem('ra-proto-role');sessionStorage.removeItem('ra-proto-login-player-key');location.reload()};
})();
