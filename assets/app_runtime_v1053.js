(()=>{
'use strict';
const FROM='1.0.52',TO='1.0.53';
const url=new URL('app.js',location.href);
url.searchParams.set('v',TO);
fetch(url.toString(),{cache:'no-store'})
.then(r=>{if(!r.ok)throw new Error('app.js '+r.status);return r.text();})
.then(code=>{
 const from=`const APP_VERSION='${FROM}';`;
 const to=`const APP_VERSION='${TO}';`;
 if(!code.includes(from))throw new Error('APP_VERSION marker not found');
 (0,eval)(code.replace(from,to));
})
.catch(err=>{
 console.error('[RA App 1.0.53] app bootstrap failed',err);
 const auth=document.querySelector('#authError');
 const app=document.querySelector('#playerApp')||document.querySelector('#gmApp');
 if(app)app.classList.add('hidden');
 if(auth){
   auth.classList.remove('hidden');
   const note=auth.querySelector('.note');
   if(note)note.textContent='アプリ本体の読み込みに失敗しました。再読み込みしてください。';
 }
});
})();
