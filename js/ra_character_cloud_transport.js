function stripRuntimeOnlyData(data) {
  // 送信時にJSON化されるため、ここで巨大な倉庫をdeep cloneする必要はない。
  const clone = { ...(data || {}) };
  delete clone.playerKey;
  delete clone.newPlayerKey;
  return clone;
}
function getCloudAuth() {
  return {
    playerKey: ($('playerKey')?.value || currentCloudPlayerKey || '').trim(),
    newPlayerKey: ($('newPlayerKey')?.value || '').trim(),
  };
}
function buildShareUrl(id) {
  const raw = gasUrl();
  if (!raw) throw new Error('共有URLの発行にはクラウド接続先が必要です。');
  const u = new URL(raw);
  u.searchParams.set('view', id);
  return u.toString();
}
function gasUrl() { return (DEFAULT_GAS_WEB_APP_URL || '').trim(); }
function setGasUrl(url) { localStorage.setItem(GAS_URL_KEY, gasUrl()); }
function masterAdminKey() { return ''; }
function setMasterAdminKey(key) { /* v37: カテゴリ系マスタは管理キーに関係なく参照する */ }
function equipmentScopeKey() { return 'global'; }
const CLOUD_JSONP_ACTIONS = new Set(['list','load','historyList','equipmentCategories','equipmentCategoriesMeta','characterSheetMaster','resolveRegistrationId']);
function cloudJsonpRequest(action, payload={}) {
  return new Promise((resolve,reject)=>{
    const raw = gasUrl();
    if (!raw) { reject(new Error('GAS WebアプリURLが未設定です。')); return; }
    const callback = 'recraftCharDbCb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script');
    const timer = setTimeout(()=>{
      cleanup(); reject(new Error('DB読み込みに時間がかかっています。'));
    }, 26000);
    function cleanup(){
      clearTimeout(timer);
      try { delete window[callback]; } catch(e) { window[callback] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    window[callback] = (json)=>{ cleanup(); resolve(json); };
    try {
      const u = new URL(raw);
      u.searchParams.set('api','1');
      u.searchParams.set('action', action);
      u.searchParams.set('callback', callback);
      u.searchParams.set('_t', Date.now());
      Object.entries(payload || {}).forEach(([k,v])=>{
        if (v === undefined || v === null) return;
        if (typeof v === 'object') u.searchParams.set(k, JSON.stringify(v));
        else u.searchParams.set(k, String(v));
      });
      script.onerror = ()=>{ cleanup(); reject(new Error('DB読み込みに失敗しました。WebアプリURL・公開設定・GASコードを確認してください。')); };
      script.src = u.toString();
      document.head.appendChild(script);
    } catch(e) { cleanup(); reject(e); }
  });
}
async function cloudNoCorsPost(action, payload={}) {
  const url = gasUrl();
  if (!url) throw new Error('GAS WebアプリURLが未設定です。');
  const body = new URLSearchParams();
  body.set('action', action);
  body.set('payload', JSON.stringify(payload));
  await fetch(url, { method: 'POST', mode: 'no-cors', body });
  return { ok: true, sentNoCors: true };
}
function cloudPostMessageRequest(action, payload={}, timeoutMs=18000) {
  return new Promise((resolve,reject)=>{
    const url=gasUrl();
    if(!url){reject(new Error('GAS WebアプリURLが未設定です。'));return;}
    const token='charpost_'+Date.now()+'_'+Math.random().toString(36).slice(2),frames=[];
    let settled=false,retryTimer=0,timeoutTimer=0,attemptNo=0;
    function cleanup(){
      if(retryTimer)clearInterval(retryTimer);
      if(timeoutTimer)clearTimeout(timeoutTimer);
      window.removeEventListener('message',onMessage);
      frames.forEach(frame=>setTimeout(()=>{try{frame.remove();}catch(_){}},0));
    }
    function finishResolve(value){if(settled)return;settled=true;cleanup();resolve(value);}
    function finishReject(error){
      if(settled)return;
      settled=true;
      try{error.postToken=token;}catch(_){}
      cleanup();reject(error);
    }
    function onMessage(event){
      const data=event.data||{};if(data.type!=='recraft-db-post-result'||String(data.token||'')!==token)return;
      const result=data.result||{ok:false,error:'クラウド保存結果が空です。'};
      if(result.ok===false){const error=new Error(result.error||'クラウド保存に失敗しました。');error.cloudAcknowledged=true;finishReject(error);return;}
      finishResolve({...result,acknowledged:true});
    }
    function submitAttempt(){
      if(settled)return;
      attemptNo++;
      const frame=document.createElement('iframe');
      frame.name='recraftCharPost_'+Date.now()+'_'+attemptNo+'_'+Math.random().toString(36).slice(2);
      frame.style.display='none';frame.setAttribute('aria-hidden','true');
      document.body.appendChild(frame);frames.push(frame);
      try{
        // v1.0.99: 外側documentにformを置いてtarget名でiframeへ飛ばす方式を廃止。
        // about:blank のiframe自身のdocument内にformを作り、target未指定でそのiframeだけを遷移させる。
        // target解決競合でGAS画面がキャラシ本体へ露出する経路を物理的に無くす。
        const doc=frame.contentDocument||frame.contentWindow?.document;
        if(!doc)throw new Error('保存用通信フレームを初期化できませんでした。');
        if(!doc.body){doc.open();doc.write('<!doctype html><html><body></body></html>');doc.close();}
        const form=doc.createElement('form');
        const actionUrl=new URL(url);actionUrl.searchParams.set('action',action);actionUrl.searchParams.set('responseMode','postMessage');actionUrl.searchParams.set('token',token);
        form.method='POST';form.action=actionUrl.toString();form.enctype='application/x-www-form-urlencoded';form.acceptCharset='UTF-8';
        const field=doc.createElement('input');field.type='hidden';field.name='payload';field.value=JSON.stringify({...payload,token});form.appendChild(field);
        doc.body.appendChild(form);form.submit();
      }catch(error){
        try{frame.remove();}catch(_){}
        const idx=frames.indexOf(frame);if(idx>=0)frames.splice(idx,1);
        if(attemptNo===1)finishReject(error);
      }
    }
    // 同じ保存要求を応答待ち中に何度も再送しない。
    // 応答が取れない場合は短時間で互換経路へ切り替え、上位の保存確認で実データを検証する。
    window.addEventListener('message',onMessage);submitAttempt();
    if(settled)return;
    timeoutTimer=setTimeout(
      ()=>finishReject(new Error('クラウド保存の応答を確認できなかったため、互換経路へ切り替えます。')),
      Math.max(8000,Number(timeoutMs)||18000)
    );
  });
}
async function cloudRequest(action, payload={}) {
  const url = gasUrl();
  if (!url) throw new Error('GAS WebアプリURLが未設定です。');

  // 外部HTML / GitHub Pages / file:// から Apps Script の ContentService を読むと、
  // CORS制限で POST の返答を取得できず Failed to fetch になることがあります。
  // 読み込み系はJSONP、保存/削除系は no-cors POST に寄せて回避します。
  if (CLOUD_JSONP_ACTIONS.has(action)) {
    const isCharacterLoad=action==='load';
    const attempts=action==='list'?3:1;
    let lastError=null,attempt=0;
    while(isCharacterLoad || attempt<attempts){
      attempt++;
      try{
        const json = await cloudJsonpRequest(action, payload);
        if (!json.ok) {
          const error=new Error(json.error || 'DB読み込みに失敗しました。');
          error.cloudLogical=true;
          throw error;
        }
        return json;
      }catch(error){
        lastError=error;
        // A server response that explicitly rejects the request is not a timeout/network retry case.
        if(error?.cloudLogical)throw error;
        if(!isCharacterLoad && attempt>=attempts)break;
        // Character load keeps reconnecting until one request completes successfully.
        const delay=Math.min(8000,700*Math.pow(1.7,Math.min(attempt-1,6)));
        await sleepMs(delay);
      }
    }
    throw lastError||new Error('DB読み込みに失敗しました。');
  }
  if (action === 'save' || action === 'savePatch' || action === 'delete' || action === 'historyCreate' || action === 'historyRestore' || action === 'historyRestoreInventoryCounts') {
    // v90.8.594: 1回の応答付きPOSTで完了する。旧no-cors経路は互換フォールバックのみ。
    try{
      return await cloudPostMessageRequest(action,payload);
    }catch(postError){
      // GASが応答を返したうえでエラーになった場合は、同じ保存をno-corsで再送しない。
      // 通信経路そのものが失敗した時だけ互換フォールバックを使う。
      if(postError&&postError.cloudAcknowledged)throw postError;
      console.warn('acknowledged cloud POST failed; fallback to no-cors POST',postError);
      return await cloudNoCorsPost(action,postError?.postToken?{...payload,token:postError.postToken}:payload);
    }
  }

  const body = new URLSearchParams();
  body.set('action', action);
  body.set('payload', JSON.stringify(payload));
  try {
    const res = await fetch(url, { method: 'POST', body });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'クラウド処理に失敗しました。');
    return json;
  } catch (e) {
    throw e;
  }
}
