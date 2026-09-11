(()=>{
 const sidebar=document.querySelector('#sidebar'),backdrop=document.querySelector('#backdrop');
 const views=[...document.querySelectorAll('.view')]; const nav=[...document.querySelectorAll('.nav-btn')];
 function closeDrawer(){sidebar.classList.remove('open');backdrop.classList.remove('show')}
 function show(name){views.forEach(v=>v.classList.toggle('active',v.id==='view-'+name));nav.forEach(b=>b.classList.toggle('active',b.dataset.view===name));closeDrawer();scrollTo({top:0,behavior:'instant'})}
 function openChar(id){document.querySelector('#characterName').textContent='キャラクター'+['','A','B','C'][id];document.querySelector('#portraitLetter').textContent=['','A','B','C'][id];show('character')}
 document.querySelector('#menuBtn').onclick=()=>{sidebar.classList.toggle('open');backdrop.classList.toggle('show')};backdrop.onclick=closeDrawer;
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));document.querySelectorAll('[data-char],[data-charcard],[data-charquick]').forEach(b=>b.onclick=()=>openChar(b.dataset.char||b.dataset.charcard||b.dataset.charquick));
 if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{})}
})();
