async function listItems() {
  if (!currentCloudPlayerKey) throw new Error('作成リストの表示にはプレイヤーキーが必要です。プレイヤーキー入力画面で入力してください。');
  const res = await cloudRequest('list', { playerKey: currentCloudPlayerKey });
  return { items: res.items || [] };
}

const CHARACTER_DATA_CACHE_DB='recraft_alchemia_character_data_cache_v1';
const CHARACTER_DATA_CACHE_STORE='characters';
const CHARACTER_DATA_CACHE_TIMEOUT_MS=900;
function characterDataCacheKey(playerKey,id){return `${String(playerKey||'').trim()}::${String(id||'').trim()}`;}
function characterDataCacheOpen(){return new Promise(resolve=>{if(!('indexedDB'in window)){resolve(null);return;}let done=false,req;const finish=v=>{if(done){try{v?.close?.();}catch(_){}return;}done=true;clearTimeout(timer);resolve(v||null);};const timer=setTimeout(()=>finish(null),CHARACTER_DATA_CACHE_TIMEOUT_MS);try{req=indexedDB.open(CHARACTER_DATA_CACHE_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(CHARACTER_DATA_CACHE_STORE))db.createObjectStore(CHARACTER_DATA_CACHE_STORE);};req.onsuccess=()=>finish(req.result);req.onerror=req.onblocked=()=>finish(null);}catch(_){finish(null);}});}
async function characterDataCacheGet(playerKey,id){const key=characterDataCacheKey(playerKey,id);if(!key||key==='::')return null;let db=null;try{db=await characterDataCacheOpen();if(!db)return null;return await new Promise(resolve=>{let done=false;const finish=v=>{if(done)return;done=true;clearTimeout(timer);resolve(v||null);};const timer=setTimeout(()=>finish(null),CHARACTER_DATA_CACHE_TIMEOUT_MS);try{const tx=db.transaction(CHARACTER_DATA_CACHE_STORE,'readonly'),req=tx.objectStore(CHARACTER_DATA_CACHE_STORE).get(key);req.onsuccess=()=>finish(req.result||null);req.onerror=()=>finish(null);tx.onabort=()=>finish(null);}catch(_){finish(null);}});}finally{try{db?.close();}catch(_){}}}
async function characterDataCachePut(playerKey,data,revision=0,storageRow=0){const id=String(data?.id||'').trim(),key=characterDataCacheKey(playerKey,id);if(!id||!String(playerKey||'').trim())return false;let db=null;try{db=await characterDataCacheOpen();if(!db)return false;const record={id,playerKey:String(playerKey||'').trim(),revision:Number(revision||0)||0,storageRow:Number(storageRow||0)||0,cachedAt:Date.now(),data:stripRuntimeOnlyData(data)};const saved=await new Promise(resolve=>{let done=false;const finish=v=>{if(done)return;done=true;clearTimeout(timer);resolve(!!v);};const timer=setTimeout(()=>finish(false),CHARACTER_DATA_CACHE_TIMEOUT_MS);try{const tx=db.transaction(CHARACTER_DATA_CACHE_STORE,'readwrite');tx.objectStore(CHARACTER_DATA_CACHE_STORE).put(record,key);tx.oncomplete=()=>finish(true);tx.onerror=tx.onabort=()=>finish(false);}catch(_){finish(false);}});if(saved)setTimeout(()=>characterDataCachePrune(playerKey,8),0);return saved;}finally{try{db?.close();}catch(_){}}}
async function characterDataCacheDelete(playerKey,id){let db=null;try{db=await characterDataCacheOpen();if(!db)return;await new Promise(resolve=>{try{const tx=db.transaction(CHARACTER_DATA_CACHE_STORE,'readwrite');tx.objectStore(CHARACTER_DATA_CACHE_STORE).delete(characterDataCacheKey(playerKey,id));tx.oncomplete=tx.onerror=tx.onabort=()=>resolve();}catch(_){resolve();}});}finally{try{db?.close();}catch(_){}}}
async function characterDataCachePrune(playerKey,maxEntries=8){let db=null;try{db=await characterDataCacheOpen();if(!db)return;const rows=await new Promise(resolve=>{try{const tx=db.transaction(CHARACTER_DATA_CACHE_STORE,'readonly'),req=tx.objectStore(CHARACTER_DATA_CACHE_STORE).getAll();req.onsuccess=()=>resolve(Array.isArray(req.result)?req.result:[]);req.onerror=()=>resolve([]);}catch(_){resolve([]);}});const own=rows.filter(r=>String(r?.playerKey||'')===String(playerKey||'')).sort((a,b)=>Number(b?.cachedAt||0)-Number(a?.cachedAt||0));if(own.length<=maxEntries)return;await new Promise(resolve=>{try{const tx=db.transaction(CHARACTER_DATA_CACHE_STORE,'readwrite'),store=tx.objectStore(CHARACTER_DATA_CACHE_STORE);own.slice(maxEntries).forEach(r=>store.delete(characterDataCacheKey(playerKey,r.id)));tx.oncomplete=tx.onerror=tx.onabort=()=>resolve();}catch(_){resolve();}});}finally{try{db?.close();}catch(_){}}}
async function prefetchCharacterData(id,{expectedRevision=0,rowHint=0}={}){
  if(!currentCloudPlayerKey||!id)return false;const cached=await characterDataCacheGet(currentCloudPlayerKey,id);
  if(Number(expectedRevision||0)>0&&Number(cached?.revision||0)===Number(expectedRevision||0))return true;
  try{const res=await cloudRequest('load',{id,playerKey:currentCloudPlayerKey,rowHint:Number(rowHint||cached?.storageRow||0)||0});if(res?.data){await characterDataCachePut(currentCloudPlayerKey,res.data,res.revision,res.storageRow);return true;}}catch(_){}return false;
}
async function loadItem(id,{expectedRevision=0,rowHint=0,force=false}={}) {
  if (!currentCloudPlayerKey) throw new Error('クラウド読み込みにはプレイヤーキーが必要です。');
  const cached=force?null:await characterDataCacheGet(currentCloudPlayerKey,id);
  const wantedRevision=Number(expectedRevision||0)||0;
  if(cached?.data&&wantedRevision>0&&Number(cached.revision||0)===wantedRevision){
    cloudCharacterRevision=Number(cached.revision||0)||0;cloudCharacterRowHint=Number(cached.storageRow||rowHint||0)||0;return cached.data;
  }
  const res = await cloudRequest('load', { id, playerKey: currentCloudPlayerKey, rowHint:Number(rowHint||cached?.storageRow||0)||0 });
  cloudCharacterRevision=Number(res.revision||0)||0;
  cloudCharacterRowHint=Number(res.storageRow||0)||0;
  cloudCharacterFolderReady=!!res.folderReady;
  if(res?.data)characterDataCachePut(currentCloudPlayerKey,res.data,cloudCharacterRevision,cloudCharacterRowHint);
  if(res&&res.migratedToDrive){showToast('旧スプレッドシート保存をGoogle Driveへ移行しました。','ok');}
  return res.data;
}
async function deleteItem(id) {
  const playerKey = currentCloudPlayerKey || prompt('削除用のプレイヤーキーを入力してください。') || '';
  if (!String(playerKey).trim()) throw new Error('削除にはプレイヤーキーが必要です。');
  await cloudRequest('delete', { id, playerKey });
  characterDataCacheDelete(playerKey,id);
}
function sleepMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function verifyCloudCharacterSave(data, playerKey) {
  const expectedHash=autoSaveContentHash(data);
  for(let attempt=0;attempt<10;attempt++){
    if(attempt>0)await sleepMs(Math.min(4000,650+attempt*250));
    try{
      const res=await cloudRequest('load',{id:data.id,playerKey});
      const loaded=res&&res.data?res.data:null;
      if(loaded&&autoSaveContentHash(loaded)===expectedHash)return res;
    }catch(_){}
  }
  throw new Error('保存要求は送信されましたが、クラウド上の保存完了を確認できませんでした。再読み込みして内容を確認してください。');
}
async function saveItem(data) {
  const auth = getCloudAuth();
  if (!auth.playerKey && !auth.newPlayerKey) throw new Error('クラウド保存にはプレイヤーキーが必要です。');
  const cleanData = stripRuntimeOnlyData(data);
  const effectivePlayerKey = auth.newPlayerKey || auth.playerKey;
  const saveResult=await cloudRequest('save', { data: cleanData, playerKey: auth.playerKey, newPlayerKey: auth.newPlayerKey, baseRevision:cloudCharacterRevision, rowHint:cloudCharacterRowHint, saveApiVersion:CHARACTER_SAVE_API_VERSION });
  assertCharacterSaveApiCompatibility(saveResult);
  // 応答付きPOSTならGASの保存完了応答をそのまま採用し、再読込確認を省略する。
  // no-cors互換フォールバック時だけ従来の読込確認を行う。
  if(saveResult&&saveResult.sentNoCors){
    const verified=await verifyCloudCharacterSave(cleanData,effectivePlayerKey);
    cloudCharacterRevision=Number(verified?.revision||cloudCharacterRevision)||0;
    cloudCharacterRowHint=Number(verified?.storageRow||cloudCharacterRowHint)||0;
  }else if(saveResult&&saveResult.revision!==undefined){
    cloudCharacterRevision=Number(saveResult.revision||0)||0;
    cloudCharacterRowHint=Number(saveResult.storageRow||cloudCharacterRowHint)||0;
  }
  if (auth.newPlayerKey) {
    currentCloudPlayerKey = auth.newPlayerKey;
    if ($('playerKey')) $('playerKey').value = auth.newPlayerKey;
    if ($('newPlayerKey')) $('newPlayerKey').value = '';
    if ($('cloudPlayerKeyInput')) $('cloudPlayerKeyInput').value = auth.newPlayerKey;
  }
  characterDataCachePut(effectivePlayerKey,cleanData,cloudCharacterRevision,cloudCharacterRowHint);
  if(auth.newPlayerKey&&auth.playerKey&&auth.playerKey!==auth.newPlayerKey)characterDataCacheDelete(auth.playerKey,cleanData.id);
  return { saved:true, cloudSaved:true, verified:true, acknowledged:!!(saveResult&&saveResult.acknowledged) };
}
async function verifyCloudCharacterPatch(id, patch, playerKey) {
  for(let attempt=0;attempt<10;attempt++){
    if(attempt>0)await sleepMs(Math.min(4000,650+attempt*250));
    try{
      const verify=await cloudRequest('load',{id,playerKey});
      const loaded=verify?.data||{};
      const mismatch=Object.entries(patch||{}).find(([key,value])=>key!=='updatedAt'&&JSON.stringify(loaded[key])!==JSON.stringify(value));
      if(!mismatch)return verify;
    }catch(_){}
  }
  throw new Error('差分保存要求は送信されましたが、クラウド上の反映を確認できませんでした。再読み込みして内容を確認してください。');
}
async function savePatchItem(id,patch={}){
  const auth=getCloudAuth();
  if(!auth.playerKey&&!auth.newPlayerKey)throw new Error('クラウド保存にはプレイヤーキーが必要です。');
  const cleanPatch=stripRuntimeOnlyData(patch||{});
  const effectivePlayerKey=auth.newPlayerKey||auth.playerKey;
  // v1.0.52: 差分保存なのに毎回送っていたキャラ全体snapshotを廃止。
  // GAS側はCharactersシートへ累積差分を永続化するため、通常編集ではpatchだけで足りる。
  const localSnapshot=stripRuntimeOnlyData({...(currentCharacter||{}),...cleanPatch,id});
  const saveResult=await cloudRequest('savePatch',{id,patch:cleanPatch,playerKey:auth.playerKey,newPlayerKey:auth.newPlayerKey,baseRevision:cloudCharacterRevision,rowHint:cloudCharacterRowHint,saveApiVersion:CHARACTER_SAVE_API_VERSION});
  assertCharacterSaveApiCompatibility(saveResult);
  if(saveResult&&saveResult.sentNoCors){
    const verify=await verifyCloudCharacterPatch(id,cleanPatch,effectivePlayerKey);
    cloudCharacterRevision=Number(verify?.revision||cloudCharacterRevision)||0;
    cloudCharacterRowHint=Number(verify?.storageRow||cloudCharacterRowHint)||0;
  }else if(saveResult&&saveResult.revision!==undefined){
    cloudCharacterRevision=Number(saveResult.revision||0)||0;
    cloudCharacterRowHint=Number(saveResult.storageRow||cloudCharacterRowHint)||0;
  }
  if(auth.newPlayerKey){currentCloudPlayerKey=auth.newPlayerKey;if($('playerKey'))$('playerKey').value=auth.newPlayerKey;if($('newPlayerKey'))$('newPlayerKey').value='';if($('cloudPlayerKeyInput'))$('cloudPlayerKeyInput').value=auth.newPlayerKey;}
  characterDataCachePut(effectivePlayerKey,localSnapshot,cloudCharacterRevision,cloudCharacterRowHint);
  if(auth.newPlayerKey&&auth.playerKey&&auth.playerKey!==auth.newPlayerKey)characterDataCacheDelete(auth.playerKey,id);
  return {saved:true,patched:true,stagedPatch:!!saveResult?.stagedPatch,acknowledged:!!(saveResult&&saveResult.acknowledged)};
}

async function refreshList() {
  $('characterList').innerHTML = '';
  $('listStatus').className = 'status-box';
  $('listStatus').textContent = 'リストを読み込み中です。';
  try {
    const listResult = await listItems();
    const items = Array.isArray(listResult) ? listResult : (listResult.items || []);
    $('listSub').textContent = 'プレイヤーキー設定済み：このキーに紐づくキャラクターだけを表示中';
    if (!items.length) {
      $('listStatus').className = 'status-box warn';
      $('listStatus').textContent = '保存済みキャラクターはありません。新規作成できます。';
      return;
    }
    $('listStatus').className = 'status-box ok';
    $('listStatus').textContent = `${items.length}件のキャラクターがあります。`;
    $('characterList').innerHTML = items.map(item => `
      <div class="list-item" data-id="${esc(item.id)}" data-revision="${Number(item.revision||0)||0}" data-storage-row="${Number(item.storageRow||0)||0}">
        <div class="list-title">${esc(item.name || '無名のキャラクター')}</div>
        <div class="list-meta">更新：${formatDate(item.updatedAt)} / ID: ${esc(item.id)}</div>
        <div class="button-row">
          <button data-action="edit" data-id="${esc(item.id)}">編集</button>
          <button class="blue" data-action="view" data-id="${esc(item.id)}">閲覧</button>
          <button class="secondary" data-action="export" data-id="${esc(item.id)}">出力</button>
          <button class="blue" data-action="share" data-id="${esc(item.id)}">共有</button>
          <button class="danger" data-action="delete" data-id="${esc(item.id)}">削除</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    $('listStatus').className = 'status-box error';
    $('listStatus').textContent = e.message;
  }
}
