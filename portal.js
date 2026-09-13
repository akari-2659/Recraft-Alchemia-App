(()=>{
 const $=s=>document.querySelector(s); let role='player';
 const loginBox=$('#loginBox'), keySetup=$('#keySetup'), launcher=$('#launcher');
 function hasBinding(r){return !!localStorage.getItem('ra-proto-bind-'+r)}
 function start(r){role=r; loginBox.classList.add('hidden'); if(hasBinding(r)){showLauncher()}else{keySetup.classList.remove('hidden')}}
 function showLauncher(){keySetup.classList.add('hidden');launcher.classList.remove('hidden');$('#roleBadge').textContent=role==='gm'?'GMアカウント（仮）':'Playerアカウント（仮）';$('#gmLaunch').classList.toggle('hidden',role!=='gm');sessionStorage.setItem('ra-proto-role',role)}
 $('#demoPlayer').onclick=()=>start('player'); $('#demoGm').onclick=()=>start('gm');
 $('#loginBtn').onclick=()=>{const id=$('#loginId').value.trim().toLowerCase(); start(id.includes('gm')?'gm':'player')};
 $('#bindKeys').onclick=()=>{const a=$('#charKey').value.trim(),b=$('#facilityKey').value.trim();if(!a||!b){alert('試作では2つのキーを入力してください。');return}localStorage.setItem('ra-proto-bind-'+role,JSON.stringify({charKey:a,facilityKey:b}));showLauncher()};
 $('#logout').onclick=()=>{sessionStorage.removeItem('ra-proto-role');location.reload()};
})();
