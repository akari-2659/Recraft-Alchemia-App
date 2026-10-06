function payload(action, extra={}){
  return {action, ...extra};
}
function isGasMode(){ return typeof google !== 'undefined' && google.script && google.script.run; }
const JSONP_ACTIONS = new Set(['ping','schema','setup','list','listAll','getEquipmentCategories','characterSheetMaster','resolveRegistrationId','dedupeAll','dedupe','cleanupUploadTemps','repairAll','repairSheet','dbHashes','beginUpload','putUploadChunk','putUploadTextChunk','putUploadGzipChunk','putUploadCell','commitUpload','abortUpload','upsert','replaceSheet','beginDirectChunkUpload','directChunkUploadStatus','antiqueRegistrationStatus','putDirectRowsChunk','finishDirectChunkUpload','beginRepairSheetChunked','repairSheetChunkStatus','repairSheetRowsChunk','finishRepairSheetChunked','validateItemRecipePrices']);
function apiBaseUrl(){
  return (DEFAULT_GAS_WEB_APP_URL || '').trim();
}
function jsonpTimeoutMs(action){
  const a = String(action || '').trim();
  // Apps Scriptの1実行上限(6分)より先にブラウザ側だけが諦めないよう、書込系は約380秒待つ。
  if (['commitUpload','beginUpload','putUploadChunk','putUploadTextChunk','putUploadGzipChunk','putUploadCell','abortUpload','upsert','replaceSheet','repairSheet','repairAll','dedupe','dedupeAll','setup','beginDirectChunkUpload','directChunkUploadStatus','antiqueRegistrationStatus','putDirectRowsChunk','finishDirectChunkUpload','beginRepairSheetChunked','repairSheetChunkStatus','repairSheetRowsChunk','finishRepairSheetChunked'].includes(a)) return 380000;
  if (['list','listAll','characterSheetMaster','getEquipmentCategories','dbHashes'].includes(a)) return 45000;
  return 25000;
}
function jsonpActionLabel(action){
  const a = String(action || '').trim();
  if (['beginUpload','putUploadChunk','putUploadTextChunk','putUploadGzipChunk','putUploadCell','commitUpload','abortUpload','upsert','replaceSheet','beginDirectChunkUpload','directChunkUploadStatus','antiqueRegistrationStatus','putDirectRowsChunk','finishDirectChunkUpload','beginRepairSheetChunked','repairSheetChunkStatus','repairSheetRowsChunk','finishRepairSheetChunked'].includes(a)) return 'DB送信/反映';
  return 'DB読み込み';
}
const PERSISTENT_JSONP_WRITE_ACTIONS=new Set([
  'setup','cleanupUploadTemps','dedupe','dedupeAll','repairSheet','repairAll',
  'beginUpload','putUploadChunk','putUploadTextChunk','putUploadGzipChunk','putUploadCell','commitUpload','abortUpload',
  'upsert','replaceSheet',
  'beginDirectChunkUpload','directChunkUploadStatus','putDirectRowsChunk','finishDirectChunkUpload',
  'beginRepairSheetChunked','repairSheetChunkStatus','repairSheetRowsChunk','finishRepairSheetChunked',
  'antiqueRegistrationStatus','dbHashes','validateItemRecipePrices',
  'guildSupportSave','mealRecommendationSave','copyistDailySave','antiqueGearAreaSave','facilityGeneralAreaSave'
]);
function jsonpApi(data){
  return new Promise((resolve,reject)=>{
    const base=apiBaseUrl();
    if(!base){ reject(new Error('ローカルHTMLからDB読み込み/送信する場合はWeb App URLを入力してください。')); return; }
    const action=String(data&&data.action||'').trim(),actionLabel=jsonpActionLabel(action),persistent=PERSISTENT_JSONP_WRITE_ACTIONS.has(action);
    let settled=false,activeScript=null,activeCallback='',retryTimer=0;
    function cleanupCurrent(){
      if(retryTimer){clearTimeout(retryTimer);retryTimer=0;}
      if(activeCallback){try{delete window[activeCallback];}catch(_){window[activeCallback]=undefined;}activeCallback='';}
      if(activeScript&&activeScript.parentNode)activeScript.parentNode.removeChild(activeScript);
      activeScript=null;
    }
    function finishResolve(res){if(settled)return;settled=true;cleanupCurrent();resolve(res);}
    function finishReject(err){if(settled)return;settled=true;cleanupCurrent();reject(err);}
    function scheduleRetry(){if(settled)return;cleanupCurrent();retryTimer=setTimeout(send,800);}
    function send(){
      if(settled)return;
      cleanupCurrent();
      const callback='recraftDbCb_'+Date.now()+'_'+Math.random().toString(36).slice(2),script=document.createElement('script');
      activeCallback=callback;activeScript=script;
      window[callback]=(res)=>finishResolve(res);
      try{
        const u=new URL(base);u.searchParams.set('api','1');u.searchParams.set('callback',callback);
        Object.entries(data||{}).forEach(([k,v])=>{if(v===undefined||v===null)return;if(typeof v==='object')u.searchParams.set(k,JSON.stringify(v));else u.searchParams.set(k,String(v));});
        script.onerror=()=>{if(persistent)scheduleRetry();else finishReject(new Error(`${actionLabel}に失敗しました。WebアプリURL・公開設定・デプロイ版を確認してください。`));};
        script.src=u.toString();document.head.appendChild(script);
        retryTimer=setTimeout(()=>{
          if(settled)return;
          if(persistent)scheduleRetry();
          else finishReject(new Error(`${actionLabel}の応答を確認できませんでした。`));
        },jsonpTimeoutMs(action));
      }catch(e){if(persistent)scheduleRetry();else finishReject(e);}
    }
    send();
  });
}
function estimateJsonpUrlLength(data){
  const base=apiBaseUrl() || 'https://example.invalid/exec';
  const u=new URL(base);
  u.searchParams.set('api','1');
  u.searchParams.set('callback','recraftDbCb_ESTIMATE');
  Object.entries(data||{}).forEach(([k,v])=>{
    if(v===undefined || v===null) return;
    if(typeof v==='object') u.searchParams.set(k, JSON.stringify(v));
    else u.searchParams.set(k, String(v));
  });
  return u.toString().length;
}


const UPLOAD_RESUME_STORAGE_KEY = 'recraft_alchemia_upload_resume_v90_8_110';
const ALL_DB_RESUME_STORAGE_KEY = 'recraft_alchemia_all_db_resume_v90_8_110';
function uploadResumeLoad(){
  try{return JSON.parse(localStorage.getItem(UPLOAD_RESUME_STORAGE_KEY)||'null');}catch(e){return null;}
}
function uploadResumeSave(v){
  try{localStorage.setItem(UPLOAD_RESUME_STORAGE_KEY,JSON.stringify(v||{}));}catch(e){console.warn('upload resume save failed',e);}
}
function uploadResumeClear(){try{localStorage.removeItem(UPLOAD_RESUME_STORAGE_KEY);}catch(e){}}
function uploadResumeFingerprint(key,mode,dataKindScope,rows){
  const text=JSON.stringify((rows||[]).map(cleanUploadRow));
  let h=2166136261;
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
  return [key,mode,dataKindScope||'',(rows||[]).length,text.length,(h>>>0).toString(16)].join('|');
}
function allDbResumeLoad(){try{return JSON.parse(localStorage.getItem(ALL_DB_RESUME_STORAGE_KEY)||'null');}catch(e){return null;}}
function allDbResumeSave(v){try{localStorage.setItem(ALL_DB_RESUME_STORAGE_KEY,JSON.stringify(v||{}));}catch(e){}}
function allDbResumeClear(){try{localStorage.removeItem(ALL_DB_RESUME_STORAGE_KEY);}catch(e){}}
let __uploadProgress = {active:false, startedAt:0, title:'', totalRows:0, logs:[], displayedPercent:0};
function formatUploadBytes(n){
  const v=Number(n||0);
  if(v>=1024*1024) return (v/(1024*1024)).toFixed(2)+'MB';
  if(v>=1024) return (v/1024).toFixed(1)+'KB';
  return Math.round(v)+'B';
}
function formatUploadTime(ms){
  const v=Number(ms||0);
  if(v>=1000) return (v/1000).toFixed(1)+'秒';
  return Math.round(v)+'ms';
}
function uploadProgressElements(){
  return {
    panel:$('uploadProgressPanel'),
    title:$('uploadProgressTitle'),
    percent:$('uploadProgressPercent'),
    bar:$('uploadProgressBar'),
    meta:$('uploadProgressMeta'),
    log:$('uploadProgressLog')
  };
}
function uploadProgressStart(title,totalRows){
  __uploadProgress={active:true,startedAt:performance.now(),title:String(title||'DB送信'),totalRows:Number(totalRows||0),logs:[],displayedPercent:0};
  const el=uploadProgressElements();
  if(el.panel) el.panel.classList.remove('hidden');
  uploadProgressUpdate({phase:title||'DB送信を開始します',percent:0,currentRows:0,totalRows,detail:'準備中です。'});
  uploadProgressLog(`${title||'DB送信'}を開始します。対象${totalRows||0}行。`);
}
function uploadProgressUpdate(info={}){
  const el=uploadProgressElements();
  const requestedPercent=Math.max(0,Math.min(100,Number(info.percent||0)));
  const percent=info.allowBacktrack ? requestedPercent : Math.max(Number(__uploadProgress.displayedPercent||0), requestedPercent);
  __uploadProgress.displayedPercent=percent;
  const elapsed=__uploadProgress.startedAt ? performance.now()-__uploadProgress.startedAt : 0;
  if(el.title) el.title.textContent=info.phase || __uploadProgress.title || 'DB送信中';
  if(el.percent) el.percent.textContent=`${percent.toFixed(0)}%`;
  if(el.bar) el.bar.style.width=percent+'%';
  const lines=[];
  if(info.currentRows!==undefined || info.totalRows!==undefined){
    lines.push(`行数：${Number(info.currentRows||0)} / ${Number(info.totalRows||__uploadProgress.totalRows||0)}行`);
  }
  if(info.chunks!==undefined) lines.push(`チャンク：${info.chunks}`);
  if(info.parts!==undefined) lines.push(`送信パーツ：${info.parts}`);
  if(info.rawChars!==undefined || info.sentChars!==undefined){
    const raw=Number(info.rawChars||0);
    const sent=Number(info.sentChars||0);
    const ratio=raw ? Math.round((sent/raw)*100) : 0;
    lines.push(`サイズ：元JSON ${formatUploadBytes(raw)} / 送信目安 ${formatUploadBytes(sent)} / 約${ratio}%`);
  }
  lines.push(`経過：${formatUploadTime(elapsed)}`);
  if(info.detail) lines.push(String(info.detail));
  if(percent>0 && percent<100 && /推定/.test(String(info.detail||''))) lines.push('※ %は推定値です。完了判定はGASの応答で確定します。');
  if(el.meta) el.meta.textContent=lines.filter(Boolean).join('\n');
}
function uploadProgressLog(line){
  const text=`[${new Date().toLocaleTimeString('ja-JP',{hour12:false})}] ${line}`;
  __uploadProgress.logs.push(text);
  __uploadProgress.logs=__uploadProgress.logs.slice(-40);
  const el=uploadProgressElements();
  if(el.log) el.log.textContent=__uploadProgress.logs.join('\n');
}
function uploadProgressHeartbeat(infoFn, intervalMs=700){
  let ticks=0;
  return setInterval(()=>{
    ticks++;
    try{
      const info = typeof infoFn === 'function' ? infoFn(ticks) : {};
      uploadProgressUpdate(info || {});
      if(ticks % 5 === 0 && info && info.detail) uploadProgressLog(info.detail);
    }catch(e){
      console.warn('upload progress heartbeat failed', e);
    }
  }, intervalMs);
}
function uploadProgressSmoothHeartbeat(config={}){
  const start=Math.max(0,Math.min(99,Number(config.start||5)));
  const cap=Math.max(start,Math.min(99,Number(config.cap||94)));
  const interval=Math.max(180,Number(config.interval||360));
  const softness=Math.max(8,Number(config.softness||34));
  const phase=String(config.phase||'DB送信・反映中');
  const detail=String(config.detail||'送信後、Apps Script側の反映完了を待っています。進捗率は処理段階から算出した推定値です。');
  let ticks=0;
  uploadProgressUpdate({...config,start:undefined,cap:undefined,interval:undefined,softness:undefined,percent:start,phase,detail});
  return setInterval(()=>{
    ticks++;
    const eased=1-Math.exp(-ticks/softness);
    const percent=Math.min(cap,start+(cap-start)*eased);
    uploadProgressUpdate({...config,start:undefined,cap:undefined,interval:undefined,softness:undefined,percent,phase,detail});
  },interval);
}
function uploadProgressStopHeartbeat(timer){ if(timer) clearInterval(timer); }

function uploadProgressDone(result={}){
  const elapsed=__uploadProgress.startedAt ? performance.now()-__uploadProgress.startedAt : 0;
  const raw=Number(result.rawChars||0);
  const sent=Number(result.gzipBase64Chars ? result.gzipBase64Chars*0.75 : 0);
  uploadProgressUpdate({
    phase:'DB送信が完了しました',
    percent:100,
    currentRows:result.sentRows||__uploadProgress.totalRows||0,
    totalRows:__uploadProgress.totalRows||result.sentRows||0,
    chunks:result.sentChunks||0,
    parts:result.sentParts||0,
    rawChars:raw||undefined,
    sentChars:sent||undefined,
    detail:`完了しました。処理時間：${formatUploadTime(elapsed)} / 方式：${result.uploadEncoding||'text'}`
  });
  uploadProgressLog(`完了：${result.sentRows||0}行 / ${result.sentChunks||0}チャンク / ${result.sentParts||0}パーツ / ${formatUploadTime(elapsed)}`);
}
function uploadProgressFail(err){
  uploadProgressUpdate({phase:'DB送信に失敗しました',percent:100,detail:String(err && err.message ? err.message : err)});
  uploadProgressLog('失敗：'+String(err && err.message ? err.message : err));
}

function utf8ToBase64(str){
  const text = String(str ?? '');
  return btoa(unescape(encodeURIComponent(text)));
}
function bytesToBase64(bytes){
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let binary = '';
  const step = 0x8000;
  for(let i=0; i<arr.length; i+=step){
    binary += String.fromCharCode(...arr.subarray(i, i + step));
  }
  return btoa(binary);
}
function uploadToken(prefix, key){
  return `${prefix}_${key}_${Date.now()}_${Math.random().toString(36).slice(2)}`.replace(/[^A-Za-z0-9_-]/g,'').slice(0,48);
}
function cleanUploadRow(row){
  const out={};
  Object.entries(row || {}).forEach(([k,v])=>{
    if(!k || k === '__ui') return;
    out[k] = v == null ? '' : v;
  });
  return out;
}
function utf8ByteLength(text){ return typeof TextEncoder==='function' ? new TextEncoder().encode(String(text||'')).byteLength : unescape(encodeURIComponent(String(text||''))).length; }

const DIRECT_POST_TIMEOUT_MS = 90000;
const DIRECT_CHUNK_POST_TIMEOUT_MS = 120000;
const REPAIR_CHUNK_ROWS = 20;

function dbHashScopeCode(scope){
  const s=String(scope||'').trim();
  if(s==='素材') return 'materials';
  if(s==='アイテム') return 'items';
  return 'all';
}
function dbHashPublicKey(mode,key,scope=''){
  return `${mode||'upsert'}|${key||''}|${dbHashScopeCode(scope)}`;
}
async function sha256HexText(text){
  if(!(window.crypto && crypto.subtle && typeof TextEncoder==='function')) throw new Error('SHA-256を利用できないブラウザです。');
  const bytes=new TextEncoder().encode(String(text||''));
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
}
function directPostForm(action,payloadObject,timeoutMs=DIRECT_POST_TIMEOUT_MS,probeOptions=null){
  return new Promise((resolve,reject)=>{
    const base=apiBaseUrl();
    if(!base){reject(new Error('Web App URLが設定されていません。'));return;}
    const token=String(payloadObject&&payloadObject.token||''),frames=[];
    let settled=false,probeTimer=0,probeStarter=0,retryTimer=0,timeoutTimer=0,probing=false,attemptNo=0;
    function cleanup(){
      if(probeStarter)clearTimeout(probeStarter);if(probeTimer)clearInterval(probeTimer);if(retryTimer)clearInterval(retryTimer);if(timeoutTimer)clearTimeout(timeoutTimer);
      window.removeEventListener('message',onMessage);frames.forEach(frame=>setTimeout(()=>{try{frame.remove();}catch(_){}},0));
    }
    function finishResolve(value){if(settled)return;settled=true;cleanup();resolve(value);}
    function finishReject(error){if(settled)return;settled=true;cleanup();reject(error);}
    function onMessage(event){
      const data=event.data||{};if(data.type!=='recraft-db-post-result'||String(data.token||'')!==token)return;
      const result=data.result||{ok:false,error:'DB送信結果が空です。'};
      if(result.ok===false){finishReject(new Error(result.error||'DB更新に失敗しました'));return;}
      finishResolve(result);
    }
    async function runProbe(){if(settled||probing||!probeOptions||typeof probeOptions.check!=='function')return;probing=true;try{const value=await probeOptions.check();if(value)finishResolve(value);}catch(_){}finally{probing=false;}}
    function submitAttempt(){
      if(settled)return;attemptNo++;
      const frame=document.createElement('iframe');frame.name='recraftDbPost_'+Date.now()+'_'+attemptNo+'_'+Math.random().toString(36).slice(2);frame.style.display='none';frame.setAttribute('aria-hidden','true');document.body.appendChild(frame);frames.push(frame);
      try{const doc=frame.contentDocument||frame.contentWindow?.document;if(!doc)throw new Error('DB送信用通信フレームを初期化できませんでした。');const form=doc.createElement('form'),actionUrl=new URL(base);actionUrl.searchParams.set('action',String(action||''));actionUrl.searchParams.set('responseMode','postMessage');actionUrl.searchParams.set('token',token);form.method='POST';form.action=actionUrl.toString();form.enctype='application/x-www-form-urlencoded';form.acceptCharset='UTF-8';const field=doc.createElement('input');field.type='hidden';field.name='payload';field.value=JSON.stringify(payloadObject||{});form.appendChild(field);doc.body.appendChild(form);form.submit();}
      catch(error){try{frame.remove();}catch(_){}const idx=frames.indexOf(frame);if(idx>=0)frames.splice(idx,1);if(attemptNo===1)finishReject(error);}
    }
    if(probeOptions&&typeof probeOptions.check==='function'){const delay=Math.max(250,Number(probeOptions.delayMs||700)),interval=Math.max(300,Number(probeOptions.intervalMs||700));probeStarter=setTimeout(()=>{if(settled)return;runProbe();probeTimer=setInterval(runProbe,interval);},delay);}
    window.addEventListener('message',onMessage);submitAttempt();if(settled)return;
    retryTimer=setInterval(()=>{runProbe();submitAttempt();},Math.max(10000,Math.min(20000,Math.floor((Number(timeoutMs)||DIRECT_POST_TIMEOUT_MS)/4))));
    timeoutTimer=setTimeout(()=>finishReject(new Error('DB送信の応答確認がタイムアウトしました。')),Math.max(15000,Number(timeoutMs)||DIRECT_POST_TIMEOUT_MS));
  });
}

function directChunkStatusProbe(token,minimumNextChunk=0){
  return {
    delayMs:650,intervalMs:650,
    check:async()=>{
      const status=await jsonpApi(payload('directChunkUploadStatus',{token}));
      if(!status||!status.ok||!status.found)return null;
      if(Number(status.nextChunk||0)<Number(minimumNextChunk||0))return null;
      return {...status,ok:true,acknowledgedByStatus:true};
    }
  };
}
function repairChunkStatusProbe(sheetKey,minimumProcessedRows=0){
  return {
    delayMs:650,intervalMs:650,
    check:async()=>{
      const status=await jsonpApi(payload('repairSheetChunkStatus',{sheetKey}));
      if(!status||!status.ok||!status.found)return null;
      if(Number(status.processedRows||0)<Number(minimumProcessedRows||0))return null;
      return {...status,ok:true,acknowledgedByStatus:true};
    }
  };
}
function antiqueRegistrationProbe(publicId){
  return {
    delayMs:450,intervalMs:500,
    check:async()=>{
      const status=await jsonpApi(payload('antiqueRegistrationStatus',{publicId}));
      if(!status||!status.ok||!status.found)return null;
      return {...status,ok:true,acknowledgedByStatus:true,inserted:1,updated:0,total:1};
    }
  };
}
function canUseDirectPostUpload(){
  return !!apiBaseUrl()
    && (isGasMode() || (typeof document!=='undefined' && typeof HTMLFormElement!=='undefined'));
}
async function loadServerDbHashes(){
  const res=await callApi(payload('dbHashes'));
  if(!res||!res.ok) throw new Error((res&&res.error)||'DBハッシュの取得に失敗しました');
  return res.hashes||{};
}

const UPLOAD_JSONP_URL_LIMIT = 2200;
const UPLOAD_PART_CHAR_STEP = 260;
const UPLOAD_GZIP_B64_PART_STEP = 1150;
const UPLOAD_GZIP_RAW_BYTES_PER_CHUNK = 32768;
const UPLOAD_GZIP_MAX_ROWS_PER_CHUNK = 40;
const UPLOAD_GZIP_COMPRESSION_SCHEMA = 'gzipUtf8Bytes32kRows40_v90_8_385';
// v90.8.599: 大量DBは無圧縮・直接分割書込を標準にする。
// v90.8.678: 実測タイムアウト対策として、実データPOSTだけを最大25行/約64KBへ縮小。
// begin/status/finish/abortなどデータ本体を含まない制御命令はJSONP/google.script.runへ分離する。
// GAS側は開始時に既存キーを1回だけ索引化し、各データチャンクでは対象行だけ更新/appendする。
const DIRECT_CHUNK_MAX_ROWS = 25;
const DIRECT_CHUNK_MAX_BYTES = 65536;
const DIRECT_SMALL_UPSERT_ROWS = 25;
// v90.8.678: 小さい表まで一括処理のchecksum付き経路でPOSTへ送らない。
// JSONP分割ならWebアプリのPOST/iframe応答に依存せず、カテゴリ類を確実に処理できる。
const JSONP_SMALL_UPLOAD_MAX_ROWS = 80;
const JSONP_SMALL_UPLOAD_MAX_BYTES = 65536;
function shouldUseSmallJsonpUpload(rows){
  const list=(rows||[]).map(cleanUploadRow);
  if(list.length>JSONP_SMALL_UPLOAD_MAX_ROWS)return false;
  return utf8ByteLength(JSON.stringify(list))<=JSONP_SMALL_UPLOAD_MAX_BYTES;
}
function uploadPartPayload(token, chunkIndex, partIndex, textPart){
  return payload('putUploadChunk', {
    token,
    chunkIndex,
    partIndex,
    valueB64: utf8ToBase64(textPart)
  });
}
function uploadGzipPartPayload(token, chunkIndex, partIndex, gzipBase64Part){
  return payload('putUploadGzipChunk', {
    token,
    chunkIndex,
    partIndex,
    valueB64: String(gzipBase64Part || '')
  });
}
function isUploadPartUrlSafe(token, chunkIndex, partIndex, textPart){
  return estimateJsonpUrlLength(uploadPartPayload(token, chunkIndex, partIndex, textPart)) <= UPLOAD_JSONP_URL_LIMIT;
}
function isGzipPartUrlSafe(token, chunkIndex, partIndex, gzipBase64Part){
  return estimateJsonpUrlLength(uploadGzipPartPayload(token, chunkIndex, partIndex, gzipBase64Part)) <= UPLOAD_JSONP_URL_LIMIT;
}
function splitTextForJsonpUpload(token, chunkIndex, text){
  const s = String(text ?? '');
  if(!s.length) return [''];
  const parts=[];
  let pos=0;
  while(pos < s.length){
    let size = Math.min(UPLOAD_PART_CHAR_STEP, s.length - pos);
    let part = s.slice(pos, pos + size);
    while(size > 1 && !isUploadPartUrlSafe(token, chunkIndex, parts.length, part)){
      size = Math.max(1, Math.floor(size * 0.72));
      part = s.slice(pos, pos + size);
    }
    if(size <= 1 && !isUploadPartUrlSafe(token, chunkIndex, parts.length, part)){
      throw new Error('1文字でも送信URLが長すぎます。WebアプリURLが異常に長い可能性があります。');
    }
    parts.push(part);
    pos += size;
  }
  return parts;
}
function splitGzipBase64ForJsonpUpload(token, chunkIndex, gzipBase64){
  const s = String(gzipBase64 || '');
  if(!s.length) return [''];
  const parts=[];
  let pos=0;
  while(pos < s.length){
    let size = Math.min(UPLOAD_GZIP_B64_PART_STEP, s.length - pos);
    let part = s.slice(pos, pos + size);
    while(size > 1 && !isGzipPartUrlSafe(token, chunkIndex, parts.length, part)){
      size = Math.max(1, Math.floor(size * 0.72));
      part = s.slice(pos, pos + size);
    }
    if(size <= 1 && !isGzipPartUrlSafe(token, chunkIndex, parts.length, part)){
      throw new Error('圧縮済みデータ1文字分でも送信URLが長すぎます。WebアプリURLが異常に長い可能性があります。');
    }
    parts.push(part);
    pos += size;
  }
  return parts;
}
function canUseGzipUpload(){
  return typeof CompressionStream === 'function'
    && typeof TextEncoder === 'function'
    && typeof Response === 'function'
    && typeof Uint8Array === 'function';
}
async function gzipBase64FromText(text){
  // readable側を同時に消費するpipeThrough方式にする。
  // 旧方式は大きめの入力でbackpressureが発生し、圧縮中のまま止まることがあった。
  const source = new Blob([String(text ?? '')]).stream();
  const compressed = source.pipeThrough(new CompressionStream('gzip'));
  const buffer = await new Response(compressed).arrayBuffer();
  return bytesToBase64(new Uint8Array(buffer));
}
function estimateRowsChunkUrlSafe(token, chunkIndex, rows){
  const text = JSON.stringify(rows || []);
  return isUploadPartUrlSafe(token, chunkIndex, 0, text);
}
function makeUploadRowChunks(token, rows){
  const list = (rows || []).map(cleanUploadRow);
  const chunks=[];
  let current=[];
  for(const row of list){
    const attempt = current.concat([row]);
    if(attempt.length && estimateRowsChunkUrlSafe(token, chunks.length, attempt)){
      current = attempt;
      continue;
    }
    if(current.length){
      chunks.push(current);
      current=[];
    }
    // 1行だけでも長い場合は、この1行だけのチャンクにして、送信時に文字列分割する。
    current=[row];
    if(!estimateRowsChunkUrlSafe(token, chunks.length, current)){
      chunks.push(current);
      current=[];
    }
  }
  if(current.length) chunks.push(current);
  return chunks;
}
function makeGzipUploadRowChunks(rows){
  const list = (rows || []).map(cleanUploadRow);
  const encoder = new TextEncoder();
  const chunks=[];
  let current=[];
  let currentBytes=2; // []
  for(const row of list){
    const rowText = JSON.stringify(row || {});
    const addBytes = encoder.encode(rowText).byteLength + (current.length ? 1 : 0);
    if(current.length && (currentBytes + addBytes > UPLOAD_GZIP_RAW_BYTES_PER_CHUNK || current.length >= UPLOAD_GZIP_MAX_ROWS_PER_CHUNK)){
      chunks.push(current);
      current=[];
      currentBytes=2;
    }
    current.push(row);
    currentBytes += addBytes;
  }
  if(current.length) chunks.push(current);
  return chunks;
}
function yieldUploadUi(){
  return new Promise(resolve=>{
    if(typeof requestAnimationFrame==='function') requestAnimationFrame(()=>setTimeout(resolve,0));
    else setTimeout(resolve,0);
  });
}

function makeDirectRowChunks(rows){
  const list=(rows||[]).map(cleanUploadRow);
  const chunks=[];
  let current=[];
  let currentBytes=2;
  for(const row of list){
    const rowText=JSON.stringify(row||{});
    const addBytes=utf8ByteLength(rowText)+(current.length?1:0);
    if(current.length && (current.length>=DIRECT_CHUNK_MAX_ROWS || currentBytes+addBytes>DIRECT_CHUNK_MAX_BYTES)){
      chunks.push(current); current=[]; currentBytes=2;
    }
    current.push(row); currentBytes+=addBytes;
  }
  if(current.length)chunks.push(current);
  return chunks;
}


async function uploadRowsByTextChunks(key, rows, mode, dataKindScope='', options={}){
  const token = uploadToken(mode === 'replace' ? 'rp' : 'up', key);
  const list = rows || [];
  uploadProgressStart(`${labelKey(key)}の通常DB送信`, list.length);
  const begin = await callApi(payload('beginUpload', {sheetKey:key, mode, token, uploadEncoding:'text', dataKindScope, checksum:String(options.checksum||''), deferPriceCrossValidation:!!options.deferPriceCrossValidation}));
  if(!begin.ok) throw new Error(begin.error || `${labelKey(key)}のDB送信準備に失敗しました`);
  let sentChunks = 0;
  let sentParts = 0;
  let rawChars = 0;
  try{
    const chunks = makeUploadRowChunks(token, list);
    uploadProgressLog(`通常送信用に${chunks.length}チャンクへ分割しました。`);
    for(let c=0; c<chunks.length; c++){
      const text = JSON.stringify(chunks[c]);
      rawChars += text.length;
      const parts = splitTextForJsonpUpload(token, c, text);
      uploadProgressLog(`チャンク${c+1}/${chunks.length}：${chunks[c].length}行 / ${parts.length}パーツ送信`);
      for(let p=0; p<parts.length; p++){
        const res = await callApi(uploadPartPayload(token, c, p, parts[p]));
        if(!res.ok) throw new Error(res.error || `${labelKey(key)}のDB送信に失敗しました`);
        sentParts++;
        uploadProgressUpdate({
          phase:`${labelKey(key)}を通常送信中`,
          percent:Math.min(88, ((c + (p+1)/parts.length) / Math.max(1,chunks.length)) * 88),
          currentRows:chunks.slice(0,c).reduce((sum,rows)=>sum+rows.length,0),
          totalRows:list.length,
          chunks:`${c+1}/${chunks.length}`,
          parts:sentParts,
          rawChars,
          sentChars:rawChars,
          detail:`チャンク${c+1}の${p+1}/${parts.length}パーツを送信しました。`
        });
      }
      sentChunks++;
      if(chunks.length > 3) await sleep(15);
    }
    uploadProgressUpdate({phase:'DB反映中',percent:92,currentRows:list.length,totalRows:list.length,chunks:`${sentChunks}/${chunks.length}`,parts:sentParts,rawChars,sentChars:rawChars,detail:'Apps Script側でシートへ一括反映しています。'});
    uploadProgressLog('Apps Script側でDB反映を開始します。');
    const commit = await callApi(payload('commitUpload', {token}));
    if(!commit.ok) throw new Error(commit.error || `${labelKey(key)}のDB反映に失敗しました`);
    const result={...commit, uploadEncoding:'text', sentRows:list.length, sentChunks, sentParts, rawChars};
    uploadProgressDone(result);
    return result;
  }catch(e){
    uploadProgressFail(e);
    try{ await callApi(payload('abortUpload', {token})); }catch(abortErr){ console.warn('upload abort failed', abortErr); }
    throw e;
  }
}
async function uploadRowsByGzipChunks(key, rows, mode, dataKindScope='', options={}){
  const list = rows || [];
  const fingerprint = uploadResumeFingerprint(key,mode,dataKindScope,list);
  const previous = uploadResumeLoad();
  const canResume = previous && previous.encoding==='gzipBase64'
    && previous.chunkSchema===UPLOAD_GZIP_COMPRESSION_SCHEMA
    && previous.fingerprint===fingerprint && previous.token
    && !!previous.deferPriceCrossValidation===!!options.deferPriceCrossValidation;
  if(previous && previous.token && !canResume){
    try{await callApi(payload('abortUpload',{token:previous.token}));}catch(e){console.warn('old upload session cleanup failed',e);}
    uploadResumeClear();
  }
  const token = canResume ? previous.token : uploadToken(mode === 'replace' ? 'gzrp' : 'gzup', key);
  uploadProgressStart(`${labelKey(key)}の圧縮分割DB送信${canResume?'（続きから）':''}`, list.length);
  if(!canResume){
    const begin = await callApi(payload('beginUpload', {sheetKey:key, mode, token, uploadEncoding:'gzipBase64', chunkSchema:UPLOAD_GZIP_COMPRESSION_SCHEMA, dataKindScope, checksum:String(options.checksum||''), deferPriceCrossValidation:!!options.deferPriceCrossValidation}));
    if(!begin.ok) throw new Error(begin.error || `${labelKey(key)}のDB圧縮送信準備に失敗しました`);
  }else uploadProgressLog(`保存済み位置から再開します：チャンク${Number(previous.nextChunk||0)+1} / パーツ${Number(previous.nextPart||0)+1}`);
  let sentChunks = Number(canResume ? previous.nextChunk||0 : 0);
  let sentParts = Number(canResume ? previous.sentParts||0 : 0);
  let rawChars = 0;
  let gzipBase64Chars = 0;
  const chunks = makeGzipUploadRowChunks(list);
  let startChunk = Math.min(chunks.length, Number(canResume ? previous.nextChunk||0 : 0));
  let startPart = Math.max(0, Number(canResume ? previous.nextPart||0 : 0));
  try{
    uploadProgressLog(`圧縮単位：未圧縮UTF-8最大${formatUploadBytes(UPLOAD_GZIP_RAW_BYTES_PER_CHUNK)}・最大${UPLOAD_GZIP_MAX_ROWS_PER_CHUNK}行。全${chunks.length}チャンクを個別に圧縮します。`);
    let sentRows = chunks.slice(0,startChunk).reduce((n,r)=>n+r.length,0);
    for(let c=startChunk; c<chunks.length; c++){
      const text = JSON.stringify(chunks[c]); rawChars += text.length;
      uploadProgressUpdate({phase:`${labelKey(key)}を圧縮中`,percent:10+Math.min(20,(c/Math.max(1,chunks.length))*20),currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:sentParts,detail:`チャンク${c+1}を圧縮しています。`});
      await yieldUploadUi();
      const gzipBase64 = await gzipBase64FromText(text);
      await yieldUploadUi();
      gzipBase64Chars += gzipBase64.length;
      const parts = splitGzipBase64ForJsonpUpload(token,c,gzipBase64);
      const p0 = c===startChunk ? Math.min(startPart,parts.length) : 0;
      uploadProgressLog(`チャンク${c+1}/${chunks.length}：${chunks[c].length}行 / ${parts.length}パーツ（${p0?`${p0+1}から再開`:'先頭から'}）`);
      for(let p=p0;p<parts.length;p++){
        const res=await callApi(uploadGzipPartPayload(token,c,p,parts[p]));
        if(!res.ok) throw new Error(res.error||`${labelKey(key)}のDB圧縮送信に失敗しました`);
        sentParts++;
        const nextPart=p+1;
        const checkpoint=nextPart>=parts.length
          ? {nextChunk:c+1,nextPart:0}
          : {nextChunk:c,nextPart:nextPart};
        uploadResumeSave({encoding:'gzipBase64',chunkSchema:UPLOAD_GZIP_COMPRESSION_SCHEMA,fingerprint,token,key,mode,dataKindScope,deferPriceCrossValidation:!!options.deferPriceCrossValidation,sentParts,...checkpoint,updatedAt:new Date().toISOString()});
        uploadProgressUpdate({phase:`${labelKey(key)}を圧縮分割送信中`,percent:30+Math.min(60,((c+(p+1)/parts.length)/Math.max(1,chunks.length))*60),currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:sentParts,rawChars,sentChars:gzipBase64Chars*.75,detail:`チャンク${c+1}の${p+1}/${parts.length}パーツを送信しました。`});
      }
      sentChunks=c+1; sentRows+=chunks[c].length; startPart=0;
      if(chunks.length>1) await sleep(15);
    }
    uploadProgressUpdate({phase:'DB反映中',percent:94,currentRows:list.length,totalRows:list.length,chunks:`${sentChunks}/${chunks.length}`,parts:sentParts,detail:'Apps Script側で復元してDBへ反映しています。'});
    const commit=await callApi(payload('commitUpload',{token}));
    if(!commit.ok) throw new Error(commit.error||`${labelKey(key)}のDB反映に失敗しました`);
    uploadResumeClear();
    const result={...commit,uploadEncoding:'gzipBase64',sentRows:list.length,sentChunks, sentParts,rawChars,gzipBase64Chars};
    uploadProgressDone(result); return result;
  }catch(e){
    uploadProgressFail(e);
    uploadProgressLog('送信位置を保存しました。「続きから再開」を選ぶと未送信パーツから再開します。');
    throw e;
  }
}
async function uploadRowsByTextPostChunks(key, rows, mode, dataKindScope='', options={}){
  const list=(rows||[]).map(cleanUploadRow);
  const token=uploadToken(mode==='replace'?'txtrp':'txtup',key);
  const maxBytes=262144;
  const chunks=[];
  let current=[];
  let currentBytes=2;
  for(const row of list){
    const rowText=JSON.stringify(row||{});
    const addBytes=utf8ByteLength(rowText)+(current.length?1:0);
    if(current.length && currentBytes+addBytes>maxBytes){ chunks.push(current); current=[]; currentBytes=2; }
    current.push(row); currentBytes+=addBytes;
  }
  if(current.length)chunks.push(current);
  uploadProgressStart(`${labelKey(key)}の無圧縮分割POST送信`,list.length);
  const begin=await callApi(payload('beginUpload',{sheetKey:key,mode,token,uploadEncoding:'text',dataKindScope,deferPriceCrossValidation:!!options.deferPriceCrossValidation}));
  if(!begin||!begin.ok)throw new Error((begin&&begin.error)||`${labelKey(key)}の送信準備に失敗しました`);
  let sentRows=0, rawBytes=0;
  try{
    for(let c=0;c<chunks.length;c++){
      const text=JSON.stringify(chunks[c]);
      const bytes=utf8ByteLength(text);rawBytes+=bytes;
      const res=await directPostForm('putUploadTextChunk',{token,chunkIndex:c,partIndex:0,jsonPart:text},90000);
      if(!res||!res.ok)throw new Error((res&&res.error)||`${labelKey(key)}の無圧縮分割POST送信に失敗しました`);
      sentRows+=chunks[c].length;
      uploadProgressUpdate({phase:`${labelKey(key)}を無圧縮分割POST送信中`,percent:Math.min(90,((c+1)/Math.max(1,chunks.length))*90),currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:c+1,rawChars:rawBytes,sentChars:rawBytes,detail:`${formatUploadBytes(bytes)}を無圧縮で送信しました。`});
      if(chunks.length>1)await sleep(10);
    }
    uploadProgressUpdate({phase:'DB反映中',percent:94,currentRows:list.length,totalRows:list.length,chunks:`${chunks.length}/${chunks.length}`,parts:chunks.length,detail:'Apps Script側で受信済みデータをDBへ反映しています。'});
    const commit=await callApi(payload('commitUpload',{token}));
    if(!commit||!commit.ok)throw new Error((commit&&commit.error)||`${labelKey(key)}のDB反映に失敗しました`);
    const result={...commit,uploadEncoding:'text-post-chunks',sentRows:list.length,sentChunks:chunks.length,sentParts:chunks.length,rawChars:rawBytes};
    uploadProgressDone(result);return result;
  }catch(e){
    uploadProgressFail(e);
    try{await callApi(payload('abortUpload',{token}));}catch(_e){}
    throw e;
  }
}

async function uploadRowsByGzipPostChunks(key, rows, mode, dataKindScope='', options={}){
  const list = rows || [];
  const fingerprint = uploadResumeFingerprint(key,mode,dataKindScope,list);
  const previous = uploadResumeLoad();
  const canResume = previous && previous.encoding==='gzipBase64'
    && previous.chunkSchema===UPLOAD_GZIP_COMPRESSION_SCHEMA
    && previous.fingerprint===fingerprint && previous.token
    && !!previous.deferPriceCrossValidation===!!options.deferPriceCrossValidation;
  if(previous && previous.token && !canResume){
    try{await callApi(payload('abortUpload',{token:previous.token}));}catch(e){console.warn('old upload session cleanup failed',e);}
    uploadResumeClear();
  }
  const token = canResume ? previous.token : uploadToken(mode === 'replace' ? 'gzpostrp' : 'gzpostup', key);
  uploadProgressStart(`${labelKey(key)}の圧縮分割POST送信${canResume?'（続きから）':''}`, list.length);
  if(!canResume){
    const begin = await callApi(payload('beginUpload', {sheetKey:key, mode, token, uploadEncoding:'gzipBase64', chunkSchema:UPLOAD_GZIP_COMPRESSION_SCHEMA, dataKindScope, deferPriceCrossValidation:!!options.deferPriceCrossValidation}));
    if(!begin.ok) throw new Error(begin.error || `${labelKey(key)}のDB圧縮送信準備に失敗しました`);
  }else uploadProgressLog(`保存済み位置から再開します：チャンク${Number(previous.nextChunk||0)+1}`);
  const chunks = makeGzipUploadRowChunks(list);
  let startChunk = Math.min(chunks.length, Number(canResume ? previous.nextChunk||0 : 0));
  let sentChunks = startChunk;
  let sentParts = Number(canResume ? previous.sentParts||0 : 0);
  let rawChars = 0;
  let gzipBase64Chars = 0;
  try{
    uploadProgressLog(`圧縮単位：未圧縮UTF-8最大${formatUploadBytes(UPLOAD_GZIP_RAW_BYTES_PER_CHUNK)}・最大${UPLOAD_GZIP_MAX_ROWS_PER_CHUNK}行。全${chunks.length}チャンクを個別圧縮してPOST送信します。`);
    let sentRows = chunks.slice(0,startChunk).reduce((n,r)=>n+r.length,0);
    for(let c=startChunk;c<chunks.length;c++){
      const text=JSON.stringify(chunks[c]);
      rawChars+=text.length;
      uploadProgressUpdate({
        phase:`${labelKey(key)}を圧縮中`,
        percent:10+Math.min(20,(c/Math.max(1,chunks.length))*20),
        currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:sentParts,
        detail:`チャンク${c+1}を圧縮しています。`
      });
      await yieldUploadUi();
      const gzipBase64=await gzipBase64FromText(text);
      await yieldUploadUi();
      gzipBase64Chars+=gzipBase64.length;
      uploadProgressLog(`チャンク${c+1}/${chunks.length}：${chunks[c].length}行 / ${formatUploadBytes(gzipBase64.length*.75)}をPOST送信`);
      const res=await directPostForm('putUploadGzipChunk',{
        token,chunkIndex:c,partIndex:0,valueB64:gzipBase64
      },90000);
      if(!res.ok)throw new Error(res.error||`${labelKey(key)}のDB圧縮分割POST送信に失敗しました`);
      sentChunks=c+1;
      sentParts++;
      sentRows+=chunks[c].length;
      uploadResumeSave({
        encoding:'gzipBase64',transport:'post',chunkSchema:UPLOAD_GZIP_COMPRESSION_SCHEMA,fingerprint,token,key,mode,dataKindScope,deferPriceCrossValidation:!!options.deferPriceCrossValidation,
        sentParts,nextChunk:c+1,nextPart:0,updatedAt:new Date().toISOString()
      });
      uploadProgressUpdate({
        phase:`${labelKey(key)}を圧縮分割POST送信中`,
        percent:30+Math.min(60,((c+1)/Math.max(1,chunks.length))*60),
        currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:sentParts,
        rawChars,sentChars:gzipBase64Chars*.75,
        detail:`チャンク${c+1}/${chunks.length}を送信しました。`
      });
      if(chunks.length>1)await sleep(15);
    }
    uploadProgressUpdate({
      phase:'DB反映中',percent:94,currentRows:list.length,totalRows:list.length,
      chunks:`${sentChunks}/${chunks.length}`,parts:sentParts,
      detail:'Apps Script側で復元してDBへ反映しています。'
    });
    const commit=await callApi(payload('commitUpload',{token}));
    if(!commit.ok)throw new Error(commit.error||`${labelKey(key)}のDB反映に失敗しました`);
    uploadResumeClear();
    const result={...commit,uploadEncoding:'gzipBase64-post-chunks',sentRows:list.length,sentChunks,sentParts,rawChars,gzipBase64Chars};
    uploadProgressDone(result);
    return result;
  }catch(e){
    uploadProgressFail(e);
    uploadProgressLog('送信位置を保存しました。再実行時は未送信チャンクから再開します。');
    throw e;
  }
}

async function uploadRowsSmallDirectPost(key, rows, mode, dataKindScope=''){
  const list=(rows||[]).map(cleanUploadRow);
  const token=uploadToken(mode==='replace'?'smallrp':'smallup',key);
  const rawBytes=utf8ByteLength(JSON.stringify(list));
  uploadProgressStart(`${labelKey(key)}の軽量直接送信`,list.length);
  const started=performance.now();
  const action=mode==='replace'?'replaceSheet':'upsert';
  const res=await directPostForm(action,{sheetKey:key,token,rows:list,dataKindScope,returnRows:false},DIRECT_CHUNK_POST_TIMEOUT_MS);
  if(!res||!res.ok)throw new Error((res&&res.error)||`${labelKey(key)}の直接DB送信に失敗しました`);
  const elapsed=performance.now()-started;
  uploadProgressLog(`直接POST：${list.length}行 / 通信+GAS ${formatUploadTime(elapsed)}${res.elapsedMs!==undefined?` / GAS ${formatUploadTime(res.elapsedMs)}`:''}`);
  const result={...res,uploadEncoding:'direct-small-raw-post',sentRows:list.length,sentChunks:1,sentParts:1,rawChars:rawBytes};
  uploadProgressDone(result);return result;
}

async function uploadRowsByDirectChunks(key, rows, mode, dataKindScope='', options={}){
  const list=(rows||[]).map(cleanUploadRow);
  const fingerprint=uploadResumeFingerprint(key,mode,dataKindScope,list);
  const previous=uploadResumeLoad();
  const chunks=makeDirectRowChunks(list);
  const canResume=previous && previous.encoding==='directRowsV661' && previous.fingerprint===fingerprint && previous.token && !!previous.deferPriceCrossValidation===!!options.deferPriceCrossValidation;
  if(previous && previous.token && !canResume){
    try{await callApi(payload('abortUpload',{token:previous.token}));}catch(e){console.warn('old direct upload session cleanup failed',e);}
    uploadResumeClear();
  }
  const token=canResume?previous.token:uploadToken(mode==='replace'?'drp':'dup',key);
  const checksum=String(options.checksum||'').trim();
  uploadProgressStart(`${labelKey(key)}の無圧縮・直接分割書込${canResume?'（続きから）':''}`,list.length);
  let nextChunk=0;
  if(canResume){
    try{
      const status=await callApi(payload('directChunkUploadStatus',{token}));
      if(status&&status.ok&&status.found) nextChunk=Math.min(chunks.length,Number(status.nextChunk||0));
      else throw new Error('保存済み送信セッションがサーバー側にありません。');
      uploadProgressLog(`サーバー側の実績位置から再開します：${nextChunk}/${chunks.length}チャンク。`);
    }catch(statusError){
      uploadProgressLog(`保存済みセッションを確認できないため、この表を最初から開始します：${statusError.message||statusError}`);
      uploadResumeClear();
      return uploadRowsByDirectChunks(key,list,mode,dataKindScope,{...options,forceNewSession:true});
    }
  }else{
    uploadProgressUpdate({phase:`${labelKey(key)}の送信開始処理中`,percent:0,currentRows:0,totalRows:list.length,chunks:`0/${chunks.length}`,parts:0,detail:'接続確認と置換対象の初期化を行っています。ここで長時間止まる場合はPOST応答またはGAS開始処理の異常です。'});
    await yieldUploadUi();
    const started=performance.now();
    const begin=await callApi(payload('beginDirectChunkUpload',{sheetKey:key,mode,token,dataKindScope,rowCount:list.length,totalChunks:chunks.length,checksum,deferPriceCrossValidation:!!options.deferPriceCrossValidation}));
    const elapsed=performance.now()-started;
    if(!begin||!begin.ok)throw new Error((begin&&begin.error)||`${labelKey(key)}の直接分割書込準備に失敗しました`);
    nextChunk=Math.min(chunks.length,Number(begin.nextChunk||0));
    uploadProgressLog(`開始処理：${formatUploadTime(elapsed)}${begin.elapsedMs!==undefined?` / GAS ${formatUploadTime(begin.elapsedMs)}`:''}。${mode==='replace'?`対象${begin.resetRemoved||0}行を初期化。`:''}`);
  }
  let sentRows=chunks.slice(0,nextChunk).reduce((n,c)=>n+c.length,0);
  let rawBytes=chunks.slice(0,nextChunk).reduce((n,c)=>n+utf8ByteLength(JSON.stringify(c)),0);
  uploadResumeSave({encoding:'directRowsV661',fingerprint,token,key,mode,dataKindScope,deferPriceCrossValidation:!!options.deferPriceCrossValidation,nextChunk,sentRows,totalChunks:chunks.length,updatedAt:new Date().toISOString()});
  try{
    for(let c=nextChunk;c<chunks.length;c++){
      const chunk=chunks[c];
      const bytes=utf8ByteLength(JSON.stringify(chunk));
      uploadProgressUpdate({phase:`${labelKey(key)}をDBへ直接書込中`,percent:chunks.length?Math.min(96,(sentRows/list.length)*96):96,currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:c,rawChars:rawBytes,sentChars:rawBytes,detail:`次の${chunk.length}行だけをPOST送信します。開始・状態確認・完了命令はPOSTを使いません。`});
      const started=performance.now();
      const res=await directPostForm('putDirectRowsChunk',{token,chunkIndex:c,rows:chunk},DIRECT_CHUNK_POST_TIMEOUT_MS,directChunkStatusProbe(token,c+1));
      const elapsed=performance.now()-started;
      if(!res||!res.ok)throw new Error((res&&res.error)||`${labelKey(key)}の直接分割書込に失敗しました`);
      const confirmedNext=Math.max(c+1,Number(res.nextChunk||c+1));
      if(res.alreadyApplied){
        sentRows=chunks.slice(0,confirmedNext).reduce((n,x)=>n+x.length,0);
      }else sentRows+=chunk.length;
      rawBytes+=bytes;
      uploadProgressLog(`チャンク${c+1}/${chunks.length}：${chunk.length}行 / ${formatUploadBytes(bytes)} / 通信+GAS ${formatUploadTime(elapsed)}${res.elapsedMs!==undefined?` / GAS ${formatUploadTime(res.elapsedMs)}`:''}${res.alreadyApplied?'（既に反映済み）':''}`);
      uploadResumeSave({encoding:'directRowsV661',fingerprint,token,key,mode,dataKindScope,deferPriceCrossValidation:!!options.deferPriceCrossValidation,nextChunk:confirmedNext,sentRows,totalChunks:chunks.length,updatedAt:new Date().toISOString()});
      uploadProgressUpdate({phase:`${labelKey(key)}をDBへ直接書込中`,percent:list.length?Math.min(96,(sentRows/list.length)*96):96,currentRows:sentRows,totalRows:list.length,chunks:`${confirmedNext}/${chunks.length}`,parts:confirmedNext,rawChars:rawBytes,sentChars:rawBytes,detail:`${sentRows}/${list.length}行までDB反映済みです。%は実件数ベースです。`});
      if(chunks.length>1)await sleep(10);
    }
    uploadProgressUpdate({phase:'DB送信結果を確定中',percent:98,currentRows:list.length,totalRows:list.length,chunks:`${chunks.length}/${chunks.length}`,parts:chunks.length,detail:'チャンクごとの全件走査は行いません。必要な全件整合性確認だけを最後に1回実行します。'});
    const finishStarted=performance.now();
    const finish=await callApi(payload('finishDirectChunkUpload',{token,checksum}));
    const finishElapsed=performance.now()-finishStarted;
    if(!finish||!finish.ok)throw new Error((finish&&finish.error)||`${labelKey(key)}の直接分割書込完了確認に失敗しました`);
    uploadProgressLog(`完了確認：${formatUploadTime(finishElapsed)}${finish.elapsedMs!==undefined?` / GAS ${formatUploadTime(finish.elapsedMs)}`:''}。全件再書込なし / ${finish.finalValidation||'行単位検証'}。`);
    if(finish.timing)uploadProgressLog(`GASチャンク実測：平均 ${formatUploadTime(finish.timing.averageMs||0)} / 最大 ${formatUploadTime(finish.timing.maxMs||0)} / 合計 ${formatUploadTime(finish.timing.totalMs||0)}`);
    uploadResumeClear();
    const result={...finish,uploadEncoding:'direct-raw-row-chunks',sentRows:list.length,sentChunks:chunks.length,sentParts:chunks.length,rawChars:rawBytes};
    uploadProgressDone(result);return result;
  }catch(e){
    uploadProgressFail(e);
    uploadProgressLog('直接書込済み位置はサーバー側にも記録されています。再実行すると未反映チャンクから再開します。');
    throw e;
  }
}

async function uploadRowsByChunksFallback(key, rows, mode, dataKindScope='', options={}){
  const list=rows||[];
  // direct POSTを使えない古い環境だけ、v598以前の仮シート分割経路を互換用として残す。
  if(canUseGzipUpload()){
    try{return await uploadRowsByGzipChunks(key,list,mode,dataKindScope,options);}
    catch(gzipError){const saved=uploadResumeLoad();if(saved)throw gzipError;}
  }
  return await uploadRowsByTextChunks(key,list,mode,dataKindScope,options);
}
async function uploadRowsByChunks(key, rows, mode, dataKindScope='', options={}){
  await assertServerVersion();
  const list=(rows||[]).map(cleanUploadRow);

  // v90.8.678: 一括登録/置換ではchecksumが付くため、644までは2KB程度のitem_typesまで
  // direct POST経路へ入り、POST/iframe応答が不調な環境では最初の表で止まっていた。
  // 小規模表はmode/checksumに関係なくJSONP分割へ固定する。
  if(shouldUseSmallJsonpUpload(list)){
    if(canUseGzipUpload()) return uploadRowsByGzipChunks(key,list,mode,dataKindScope,options);
    return uploadRowsByTextChunks(key,list,mode,dataKindScope,options);
  }

  if(canUseDirectPostUpload()){
    try{
      // 大量データは従来どおり無圧縮の直接分割POSTを優先する。
      return await uploadRowsByDirectChunks(key,list,mode,dataKindScope,options);
    }catch(postError){
      const message=String(postError&&postError.message||postError||'');
      // POST経路そのものが応答不能なら、処理全体を止めずJSONP分割へ退避する。
      // upsertは同一キー更新、replaceは再初期化されるため、途中反映後でも再送可能。
      if(/Failed to fetch|NetworkError|Load failed|接続できません/i.test(message)){
        uploadProgressLog(`POST経路で失敗したためJSONP分割送信へ切り替えます：${message}`);
        const saved=uploadResumeLoad();
        if(saved&&saved.token){
          try{await callApi(payload('abortUpload',{token:saved.token}));}catch(abortError){console.warn('direct upload fallback cleanup failed',abortError);}
          uploadResumeClear();
        }
        return uploadRowsByChunksFallback(key,list,mode,dataKindScope,options);
      }
      throw postError;
    }
  }
  return uploadRowsByChunksFallback(key,list,mode,dataKindScope,options);
}
function callApi(data){
  return new Promise((resolve,reject)=>{
    if(isGasMode()){
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(err=>reject(new Error(err && err.message ? err.message : String(err || 'GAS呼び出しに失敗しました'))))
        .api(data);
      return;
    }
    const url=apiBaseUrl();
    if(!url){ reject(new Error('ローカルHTMLから送信する場合はWeb App URLを入力してください。')); return; }
    jsonpApi(data).then(resolve).catch(reject);
  });
}
const NO_POST_CONTROL_WRITE_ACTIONS = new Set([
  'cleanupUploadTemps','setup','dedupe','dedupeAll','repairSheet','repairAll',
  'beginUpload','commitUpload','abortUpload',
  'beginDirectChunkUpload','directChunkUploadStatus','finishDirectChunkUpload',
  'beginRepairSheetChunked','repairSheetChunkStatus','repairSheetRowsChunk','finishRepairSheetChunked','validateItemRecipePrices'
]);
async function writeApi(data){
  await assertServerVersion();
  const action=String(data&&data.action||'').trim();
  if(NO_POST_CONTROL_WRITE_ACTIONS.has(action)) return callApi(data);
  if(!isGasMode() && canUseDirectPostUpload()){
    const token=uploadToken('cmd',action||'write');
    const timeoutMs=DIRECT_POST_TIMEOUT_MS;
    const res=await directPostForm(action,{...(data||{}),token},timeoutMs);
    if(!res||res.ok===false)throw new Error((res&&res.error)||'DB更新に失敗しました');
    return res;
  }
  return callApi(data);
}

async function upsertSheetRowsByJsonp(key, rows, dataKindScope='', options={}){
  return uploadRowsByChunks(key, rows || [], 'upsert', dataKindScope, options);
}
async function replaceSheetRowsByJsonp(key, rows, dataKindScope='', options={}){
  return uploadRowsByChunks(key, rows || [], 'replace', dataKindScope, options);
}
let __serverVersionChecked = false;
function parseVersionParts(value){
  return String(value || '')
    .replace(/^v/i, '')
    .split('.')
    .map(part => {
      const m = String(part).match(/\d+/);
      return m ? Number(m[0]) : 0;
    });
}
function compareVersions(a, b){
  const av = parseVersionParts(a);
  const bv = parseVersionParts(b);
  const len = Math.max(av.length, bv.length, 3);
  for(let i=0; i<len; i++){
    const ai = av[i] || 0;
    const bi = bv[i] || 0;
    if(ai > bi) return 1;
    if(ai < bi) return -1;
  }
  return 0;
}
async function assertServerVersion(){
  if(isGasMode()) return true;
  if(__serverVersionChecked) return true;
  const res = await jsonpApi(payload('ping'));
  const actual = String(res && res.version || '').trim();
  const required = typeof RECRAFT_DB_REQUIRED_SERVER_VERSION !== 'undefined' ? RECRAFT_DB_REQUIRED_SERVER_VERSION : RECRAFT_DB_VERSION;
  if(!actual || compareVersions(actual, required) < 0){
    throw new Error(`Apps Script側のCode.gsが古い可能性があります。必要サーバー版=${required} 実際=${actual || '不明'}
Code.gsを差し替えて保存し、既存デプロイを新バージョンで更新してから、管理ツールを開き直してください。`);
  }
  __serverVersionChecked = true;
  return true;
}
function sleep(ms){ return new Promise(resolve=>setTimeout(resolve, ms)); }
const VERIFY_SAVE_FIELDS = {
  equipment_categories: ['element','power','modifiers','description','effect','intrinsicEffects','skill','itemCategory','equipSlot'],
  items: ['dataKind','itemType','itemCategory','materialType','materialCategory','name','rank','toolRank','guaranteeUpgradeMaxRank','power','modifiers','upgradeLimit','upgradeMaterialMinRank','mpCost','target','checkType','element','description','effect','equipmentEffects','namedProcessingOptions'],
  spells: ['type','name','rank','mpCost','target','checkType','element','power','description','effect'],
  recipes: ['rank','recipePrice','recipeSellPrice','recipeSource','craftSkill','price','craftType','category','baseItem','branchType','resultItem','requiredMaterials','difficulty','description','effect'],
  quest_rewards: ['rank','rewardMin','rewardMax','rewardAvg','scale'],
  quests: ['rank','questCategory','requestKind','questType','areaName','questLocation','recommendedSkills','rewardScope','deliveryItems','progressStep','fixedEvents','clearCondition'],
  treasure_tables: ['treasureRank','scrollRank','entryType','entryName','quantity','weight'],
  monsters: ['rank','monsterType','monsterTraits','physicalAffinity','fireAffinity','waterAffinity','windAffinity','thunderAffinity','lightAffinity','darkAffinity','neutralAffinity','behaviorAI','fixedActionNames','passiveOnlyActionNames','actionSelectionRules','actions','drops','modifiers']
};
function verifyRowKey(row){
  return String(row && row.id || '').trim();
}
function verifyValue(v){
  return String(v ?? '').replace(/\r\n/g,'\n').trim();
}
function verifyDataMatches(expectedData, actualData, keys){
  const issues=[];
  (keys||DATA_KEYS).forEach(key=>{
    const expectedRows = expectedData[key] || [];
    const actualRows = actualData[key] || [];
    const actualById = new Map(actualRows.map(r=>[verifyRowKey(r), r]).filter(([id])=>id));
    expectedRows.forEach(row=>{
      const id = verifyRowKey(row);
      if(!id) return;
      const actual = actualById.get(id);
      if(!actual){ issues.push(`${labelKey(key)}:${id} がDB読込結果にありません`); return; }
      const fields = (VERIFY_SAVE_FIELDS[key] || []).filter(f => (SCHEMA[key]||[]).includes(f));
      fields.forEach(field=>{
        const ev = verifyValue(row[field]);
        const av = verifyValue(actual[field]);
        if(ev !== av) issues.push(`${labelKey(key)}:${id}.${field} 期待=${ev || '(空)'} 実際=${av || '(空)'}`);
      });
    });
  });
  return issues;
}
async function loadSheets(keys){
  const actual = {};
  for (const key of keys) {
    const res = await callApi(payload('list', { sheetKey: key }));
    if(!res.ok) throw new Error(res.error || `${labelKey(key)}のDB読込に失敗しました`);
    actual[key] = res.rows || [];
  }
  return normalizeStateData({ ...Object.fromEntries(DATA_KEYS.map(key=>[key, []])), ...actual });
}
async function verifyRemoteSaved(keys){
  // JSONP書き込み後に、対象シートだけを再読込して実データを照合する。
  const targetKeys = (keys && keys.length) ? keys : DATA_KEYS;
  let issues = [];
  for(let i=0; i<8; i++){
    await sleep(600 + i * 250);
    const actual = await loadSheets(targetKeys);
    issues = verifyDataMatches(state, actual, targetKeys);
    if(!issues.length) return actual;
  }
  throw new Error('DB反映確認に失敗しました。\n' + issues.slice(0,12).join('\n') + (issues.length>12 ? `\nほか${issues.length-12}件` : ''));
}
async function setup(){
  try{
    await assertServerVersion();
    const res=await callApi(payload('setup'));
    if(!res.ok) throw new Error(res.error||'失敗');
    toast('DBシートを作成/確認しました。一時シート整理は専用ボタンからのみ実行します。');
  }catch(e){ toast(e.message,'error'); }
}
async function cleanupUploadTemps(){
  if(!confirm('旧DB送信で残った __recraft_upload_* 一時シートを削除します。\n現行の無圧縮直接分割送信では使用しません。\nよろしいですか？')) return;
  try{
    await assertServerVersion();
    const res=await writeApi(payload('cleanupUploadTemps'));
    if(!res||!res.ok) throw new Error((res&&res.error)||'一時シート整理に失敗しました');
    const names=Array.isArray(res.deletedTempSheets)?res.deletedTempSheets:[];
    toast(names.length?`一時シートを${names.length}枚削除しました`:'削除対象の一時シートはありませんでした');
    alert(names.length?`一時シート整理\n${names.length}枚削除しました。\n${names.join('\n')}`:'一時シート整理\n削除対象はありませんでした。');
  }catch(e){ toast(e.message,'error'); }
}
async function diagnoseSheets(){
  try{
    await assertServerVersion();
    const res = await callApi(payload('diagnoseSheets'));
    if(!res.ok) throw new Error(res.error || 'DB列診断に失敗しました');
    const lines = Object.entries(res.results || {}).map(([key,r])=>{
      if(!r.exists) return `${labelKey(key)}: シートなし`;
      const status = r.ok ? (r.orderOk ? 'OK' : '列順') : '不足あり';
      const missing = (r.missing||[]).length ? ` / 不足:${r.missing.join(',')}` : '';
      const extra = (r.extra||[]).length ? ` / 旧列・余分:${r.extra.join(',')}` : '';
      return `${labelKey(key)}: ${status} / ${r.rows||0}行${missing}${extra}`;
    });
    alert('DB列診断 v90.3\n' + lines.join('\n'));
    toast('DB列診断を表示しました');
  }catch(e){ toast(e.message,'error'); }
}
async function repairHeaders(){
  if(!confirm('DB列を標準ヘッダー順に修復します。\n最初に列だけを診断し、修復が必要なシートだけを行分割して書き直します。\nよろしいですか？')) return;
  try{
    await assertServerVersion();
    const diag=await callApi(payload('diagnoseSheets'));
    if(!diag||!diag.ok)throw new Error((diag&&diag.error)||'DB列診断に失敗しました');
    const targets=Object.entries(diag.results||{}).filter(([key,r])=>!r.exists||!r.ok||!r.orderOk);
    if(!targets.length){
      toast('DB列はすべて正常です。修復は不要です。');
      alert('DB列修復\n修復が必要なシートはありませんでした。');
      return;
    }
    const totalRows=targets.reduce((n,[,r])=>n+Math.max(0,Number(r.rows||0)),0);
    uploadProgressStart('DB列修復',totalRows||targets.length);
    const lines=[];
    let globalDone=0;
    for(let i=0;i<targets.length;i++){
      const [key,diagRow]=targets[i];
      uploadProgressLog(`${labelKey(key)}：分割修復を開始します（${Number(diagRow.rows||0)}行）。`);
      const beginStarted=performance.now();
      const repairToken=uploadToken('repair',key);
      const beginPayload=payload('beginRepairSheetChunked',{sheetKey:key,token:repairToken});
      const begin=await callApi(beginPayload);
      const beginElapsed=performance.now()-beginStarted;
      if(!begin||!begin.ok)throw new Error((begin&&begin.error)||`${labelKey(key)}のDB列修復準備に失敗しました`);
      if(begin.skipped){
        lines.push(`${labelKey(key)}: ${begin.rows||0}行（変更なし）`);
        uploadProgressLog(`${labelKey(key)}：変更不要 / ${formatUploadTime(beginElapsed)}`);
        continue;
      }
      let nextRow=Math.max(2,Number(begin.nextDataRow||2));
      let done=Math.max(0,Number(begin.processedRows||0));
      const sheetTotal=Math.max(0,Number(begin.totalRows||diagRow.rows||0));
      if(done) globalDone+=done;
      while(done<sheetTotal){
        const count=Math.min(REPAIR_CHUNK_ROWS,sheetTotal-done);
        const started=performance.now();
        const rowPayload=payload('repairSheetRowsChunk',{sheetKey:key,startRow:nextRow,rowCount:count});
        const res=await callApi(rowPayload);
        const elapsed=performance.now()-started;
        if(!res||!res.ok)throw new Error((res&&res.error)||`${labelKey(key)}のDB列修復に失敗しました`);
        const beforeDone=done;
        nextRow=Math.max(nextRow+count,Number(res.nextDataRow||nextRow+count));
        done=Math.max(done+count,Number(res.processedRows||done+count));
        globalDone+=Math.max(0,done-beforeDone);
        const pct=totalRows?Math.min(96,(globalDone/totalRows)*96):Math.min(96,((i+done/Math.max(1,sheetTotal))/targets.length)*96);
        uploadProgressUpdate({phase:`${labelKey(key)}の列を分割修復中`,percent:pct,currentRows:globalDone,totalRows:totalRows||targets.length,chunks:`${i+1}/${targets.length}`,parts:Math.ceil(done/REPAIR_CHUNK_ROWS),detail:`${labelKey(key)}：${done}/${sheetTotal}行修復済み。実件数ベースです。`});
        uploadProgressLog(`${labelKey(key)} ${done}/${sheetTotal}行：通信+GAS ${formatUploadTime(elapsed)}${res.elapsedMs!==undefined?` / GAS ${formatUploadTime(res.elapsedMs)}`:''}`);
      }
      const finish=await callApi(payload('finishRepairSheetChunked',{sheetKey:key}));
      if(!finish||!finish.ok)throw new Error((finish&&finish.error)||`${labelKey(key)}のDB列修復完了処理に失敗しました`);
      if(finish.timing)uploadProgressLog(`${labelKey(key)} GAS実測：平均 ${formatUploadTime(finish.timing.averageMs||0)} / 最大 ${formatUploadTime(finish.timing.maxMs||0)}`);
      lines.push(`${labelKey(key)}: ${finish.rows||sheetTotal}行（分割修復）`);
    }
    uploadProgressDone({sentRows:totalRows||targets.length,sentChunks:targets.length,sentParts:targets.length,uploadEncoding:'chunked-column-repair'});
    alert('DB列修復\n' + lines.join('\n'));
    toast('必要なDB列だけ分割修復しました');
  }catch(e){ uploadProgressFail(e); toast(e.message,'error'); }
}
function rowsForTableForSave(tableKey){
  const base = baseKeyForTable(tableKey);
  const rows = state[base] || [];
  const want = dataKindForTable(tableKey);
  if(base !== 'items' || !want) return rows;
  return rows.filter(row=>{
    const kind = String(row.dataKind || 'アイテム').trim() || 'アイテム';
    return want === '素材' ? kind === '素材' : kind !== '素材';
  });
}
function assertMonsterPassiveDesignRows(rows){
  const bad=[];
  const affinityFields={物:'physicalAffinity',火:'fireAffinity',水:'waterAffinity',風:'windAffinity',雷:'thunderAffinity',光:'lightAffinity',闇:'darkAffinity',無:'neutralAffinity'};
  const strong=new Set(['耐','無','反','吸']);
  (rows||[]).forEach(row=>{
    const p=String(row?.passiveEffect||'').trim();
    if(!p)return;
    if(/PCが前衛から後衛へ移動した時|PCが後衛から前衛へ移動した時|前衛・後衛を移動した直後/.test(p)){
      bad.push(`${row.name||row.id||'魔物'}：PCの任意の前後移動だけを起点・解除条件にした固有パッシブは登録できません。`);
    }
    Object.entries(affinityFields).forEach(([label,field])=>{
      if(strong.has(String(row?.[field]||'').trim()) && new RegExp(`(?:自身が|自身へ|自身に)[^。\n]{0,40}${label}属性(?:ダメージ)?を受け`).test(p)){
        bad.push(`${row.name||row.id||'魔物'}：${label}属性へ${row?.[field]}を持つのに、その属性を受けることだけを主要発動条件にした固有パッシブは登録できません。`);
      }
    });
  });
  if(bad.length)throw new Error(`固有パッシブの発動条件に、通常攻略で恒常的に無視できる条件が含まれています。\n${bad.slice(0,12).join('\n')}${bad.length>12?`\nほか${bad.length-12}件`:''}`);
}

function assertMonsterActionRangeRows(rows){
  const bad=[];
  (rows||[]).forEach(row=>{
    const passive=String(row?.passiveEffect||'');
    const randomPassiveStates=[...passive.matchAll(/([ぁ-んァ-ヶ一-龠A-Za-z0-9]+状態)/g)].map(m=>m[1]);
    const randomMarking=/(ランダム|行動可能なPC|各PC|全PC)/.test(passive);
    parseMonsterActions(row?.actions||'').forEach(action=>{
      const type=normalizeMonsterActionType(action), range=normalizeMonsterActionRange(action), target=String(action.target||'').trim();
      const effect=String(action.effect||'').trim();
      const effectRearReach=/(?:前衛[^。\n]{0,50}(?:いる|残って)[^。\n]{0,50}後衛[^。\n]{0,35}(?:対象|狙)|前衛の有無[^。\n]{0,50}後衛[^。\n]{0,35}(?:対象|狙)|後衛にいても[^。\n]{0,35}(?:対象|狙)|すでに後衛)/.test(effect);
      const passivePayoff=randomMarking && randomPassiveStates.some(state=>effect.includes(state));
      if((/敵(?:後衛|1列|全体)/.test(target) || effectRearReach || passivePayoff) && range==='近接'){
        bad.push(`${row.name||row.id||'魔物'} / ${action.name||'行動'}：特性・対象・効果文が後衛到達を前提としているため、距離「近接」では成立しません。距離を「遠距離」、条件付きなら「特殊」にしてください。`);
      }
    });
  });
  if(bad.length)throw new Error(`魔物行動の対象・効果文と距離に矛盾があります。\n${bad.slice(0,12).join('\n')}${bad.length>12?`\nほか${bad.length-12}件`:''}`);
}

function assertMonsterSelfMoveConditionRows(rows){
  const bad=[];
  const movePerf=/(?:この|自身の)?手番[^\n]{0,30}移動[^\n]{0,50}(?:判定|命中|ダメージ|回避値|防御値|抵抗値|最終ダメージ)|移動してから使用した場合|移動していない場合|この手番に移動した場合/;
  (rows||[]).forEach(row=>{
    const actions=String(row?.actions||'').split(/\r?\n/).filter(Boolean);
    actions.forEach(line=>{const c=line.split('\t');const effect=String(c[6]||'');if(movePerf.test(effect))bad.push(`${row.name||row.id||'魔物'} / ${c[0]||'行動'}：${effect}`);});
  });
  if(bad.length)throw new Error(`魔物自身の通常移動を条件に、命中・ダメージ・回避・防御・抵抗などの性能を変化させる行動は登録できません。位置条件、対象条件、または行動そのものの効果として設計してください。\n${bad.slice(0,12).join('\n')}${bad.length>12?`\nほか${bad.length-12}件`:''}`);
}

function cloneRowsForSave(baseKey, rows){
  if(baseKey==='skills') recalculateSkillProbabilities();
  if(['items','recipes','spells','skills','material_ranks','quest_rewards','quests','treasure_tables','monsters'].includes(baseKey)) assertNumericRankRows(baseKey,rows||[]);
  if(baseKey==='skills') assertSkillProgressionRows(rows||[]);
  if(baseKey==='treasure_tables') assertTreasureDifficultyRows(rows||[]);
  if(baseKey==='items'){ assertItemPriceRows(rows||[]); assertItemClassificationRows(rows||[]); assertWeaponKatakanaNames(rows||[]); assertWeaponBaseDamageDieRows(rows||[]); assertUpgradeSlotScopeRows(rows||[]); assertUpgradeMaterialTargetScopeRows(rows||[]); assertEquipmentUpgradeMinimumRows(rows||[]); assertMonsterMaterialUpgradeRows(rows || []); assertSpecialUpgradeNonStackRows(rows || []); assertNoDefenseIgnoreUpgradeRows(rows || []); assertMaterialUpgradeSlotCostRows(rows || []); assertMaterialUpgradeSeparationRows(rows || []); assertProcessedMaterialRows(rows || []); assertMonsterMaterialDescriptionRows(rows || []); assertLateAreaMonsterMaterialRankRows(rows || []); }
  if(baseKey==='recipes'){ assertSkillCrystalProgressionRows(rows||[]); assertWeaponBranchMaterialRows(rows || []); assertOtherworldAccessoryUpgradeMaterialRows(rows || []); assertItemPriceRows(state.items||[], rows||[]); }
  if(baseKey==='monsters'){ assertMonsterEffectClarityRows(rows||[]); assertMonsterPassiveDesignRows(rows || []); assertMonsterActionRangeRows(rows || []); assertMonsterSelfMoveConditionRows(rows || []); assertMonsterFixedActionSelectionRows(rows || []); assertMonsterPassiveOnlyActionRows(rows || []); assertMonsterLoadoutViabilityRows(rows || []); assertMonsterActionCountRows(rows || []); assertMonsterActionTypeSemanticsRows(rows || []); assertNamedBacklineAttackRows(rows || []); assertAreaBossBacklineAttackRows(rows || []); assertMonsterActionBaseValueRows(rows || []); assertMonsterActionCheckSourceRows(rows || []); assertMonsterSupportActionCheckRows(rows || []); assertMonsterDirectDamageDieRows(rows || []); }
  return (rows || []).map(src=>{
    const r = {...(src || {})};
    normalizeEncounterPlacementRow(baseKey,r);
    if(baseKey==='material_ranks') r.name=numericRankValueIncludingLegacyMaterialGrade(r.name,1);
    if(baseKey==='items'){ delete r.price; r.rank=numericRankValueIncludingLegacyMaterialGrade(r.rank,1); if(String(r.toolRank??'').trim()){r.toolRank=numericRankValueIncludingLegacyMaterialGrade(r.toolRank,1);r.rank=r.toolRank;} if(String(r.guaranteeUpgradeMaxRank??'').trim())r.guaranteeUpgradeMaxRank=numericRankValueIncludingLegacyMaterialGrade(r.guaranteeUpgradeMaxRank,1); if(isEquipmentItemRow(r))r.upgradeMaterialMinRank=numericRankValueIncludingLegacyMaterialGrade(r.upgradeMaterialMinRank,r.rank); else { r.upgradeLimit='0'; r.upgradeMaterialMinRank=''; } }
    if(baseKey==='recipes'){ if(!String(r.recipePrice??'').trim()&&String(r.limitedRecipePrice??'').trim())r.recipePrice=r.limitedRecipePrice; r.limitedRecipePrice=''; r.rank=numericRankValueIncludingLegacyMaterialGrade(r.rank,1); }
    if(baseKey==='spells' || baseKey==='skills') r.rank=numericRankValueIncludingLegacyMaterialGrade(r.rank,1);
    if(['quest_rewards','quests','monsters'].includes(baseKey)) r.rank=numericRankValueIncludingLegacyMaterialGrade(r.rank,1);
    if(baseKey==='treasure_tables'){ r.treasureRank=numericRankValueIncludingLegacyMaterialGrade(r.treasureRank,1); r.trapDetectDifficulty=numericRankValue(r.trapDetectDifficulty,''); if(String(r.scrollRank??'').trim())r.scrollRank=numericRankValue(r.scrollRank,1); }
    if((baseKey === 'items' || baseKey === 'spells' || baseKey === 'equipment_categories')){
      r.power = normalizePowerForDb(baseKey, r.power);
    }
    if(r.checkType !== undefined) r.checkType = normalizeCheckTypeValue(r.checkType);
    if(r.actions !== undefined) r.actions = serializeMonsterActions(parseMonsterActions(r.actions));
    if(!String(r.description || '').trim() && String(r['説明'] || '').trim()) r.description = r['説明'];
    if(!String(r.effect || '').trim() && String(r['効果'] || '').trim()) r.effect = r['効果'];
    delete r['説明']; delete r['効果'];
    r.updatedAt = nowIso();
    markRowOwnership(r);
    return r;
  });
}
async function verifyRowsSaved(baseKey, expectedRows){
  let issues = [];
  for(let i=0; i<8; i++){
    await sleep(600 + i * 250);
    const actual = await loadSheets([baseKey]);
    const expected = {...state, [baseKey]: expectedRows || []};
    issues = verifyDataMatches(expected, actual, [baseKey]);
    if(!issues.length) return actual;
  }
  throw new Error('DB反映確認に失敗しました。\n' + issues.slice(0,12).join('\n') + (issues.length>12 ? `\nほか${issues.length-12}件` : ''));
}
async function tryVerifyRowsSaved(baseKey, expectedRows, tableKey){
  try{
    return await verifyRowsSaved(baseKey, expectedRows);
  }catch(e){
    console.warn('DB反映後の確認用再読込に失敗しました:', e);
    toast(`${labelKey(tableKey || baseKey)}をDBへ反映しました。更新後データの取得に失敗しました。Code.gsと管理HTMLをv90で揃えてください。`, 'warn');
    return null;
  }
}


const MANAGEMENT_PRIVATE_FIELDS = [];

async function hydratePrivateFieldsForWrite(baseKey,rows=[]){
  // ownerKey / createdBy は廃止。旧シート列との互換性のため空欄で送る。
  return (rows||[]).map(source=>({...source, ownerKey:'', createdBy:''}));
}

function applySavedRowsToState(tableKey, rows, mode){
  const base = baseKeyForTable(tableKey);
  const nextRows = cloneRowsForSave(base, rows || []);
  if(base === 'items' && mode !== 'replaceAllBase'){
    const want = dataKindForTable(tableKey);
    const prev = state[base] || [];
    const preserved = prev.filter(row=>{
      const kind = String(row.dataKind || 'アイテム').trim() || 'アイテム';
      return want === '素材' ? kind !== '素材' : kind === '素材';
    });
    state = normalizeStateData({ ...state, [base]: preserved.concat(nextRows) });
  }else{
    state = normalizeStateData({ ...state, [base]: nextRows });
  }
}

async function loadSheet(tableKey){
  const base = baseKeyForTable(tableKey);
  try{
    toast(`${labelKey(tableKey)}のDB読込を開始します`, 'warn');
    const res = await callApi(payload('list', { sheetKey: base }));
    if(!res.ok) throw new Error(res.error || `${labelKey(tableKey)}のDB読込に失敗しました`);
    state = normalizeStateData({ ...state, [base]: res.rows || [] });
    clearDirty(tableKey);
    rerenderTableGroup(tableKey);
    updateCounts();
    updateJsonBox();
    toast(`${labelKey(tableKey)}をDBから読み込みました`);
  }catch(e){toast(e.message,'error')}
}
async function saveSheetInternal(tableKey, options={}){
  const base = baseKeyForTable(tableKey);
  const preparedRows = cloneRowsForSave(base, rowsForTableForSave(tableKey));
  const rows = await hydratePrivateFieldsForWrite(base, preparedRows);
  const res = await upsertSheetRowsByJsonp(base, rows, dataKindForTable(tableKey));
  if(!res || !res.ok){
    throw new Error((res && res.error) || `${labelKey(tableKey)}のDB登録に失敗しました`);
  }
  applySavedRowsToState(tableKey, rows, 'upsert');
  clearDirty(tableKey);
  rerenderTableGroup(tableKey);
  updateCounts();
  updateJsonBox();
  if(!options.silent) toast(`${labelKey(tableKey)}をDB登録しました`);
  return res;
}
async function saveSheet(tableKey){
  try{
    toast(`${labelKey(tableKey)}のDB登録を開始します`, 'warn');
    await saveSheetInternal(tableKey);
  }catch(e){toast(e.message,'error')}
}
function rowForSingleDbSave(tableKey, idx){
  const base = baseKeyForTable(tableKey);
  const row = (state[base] || [])[idx];
  if(!row) throw new Error(`${labelKey(tableKey)}の対象行が見つかりません`);
  const cloned = cloneRowsForSave(base, [row])[0];
  if(!cloned) throw new Error(`${labelKey(tableKey)}の対象行をDB送信用に変換できません`);
  return cloned;
}
async function saveSingleRow(tableKey, idx, mode='upsert'){
  const base = baseKeyForTable(tableKey);
  const preparedRow = rowForSingleDbSave(tableKey, idx);
  const label = mode === 'replace' ? '個別DB置換' : '個別DB登録';
  const name = preparedRow.name || preparedRow.eventName || preparedRow.tableId || preparedRow.id || labelKey(tableKey);
  if(mode === 'replace' && !confirm(`「${name}」だけをDB置換します。\n同じ表の他データは保持します。\nよろしいですか？`)) return;
  try{
    toast(`${labelKey(tableKey)}「${name}」の${label}を開始します`, 'warn');
    const row = (await hydratePrivateFieldsForWrite(base, [preparedRow]))[0];
    const res = await upsertSheetRowsByJsonp(base, [row], dataKindForTable(tableKey));
    if(!res || !res.ok) throw new Error((res && res.error) || `${name}の${label}に失敗しました`);
    rerenderTableGroup(tableKey);
    updateCounts();
    updateJsonBox();
    toast(`${labelKey(tableKey)}「${name}」を${label}しました`);
  }catch(e){
    toast(e.message, 'error');
  }
}
function setAllPageButtonsDisabled(disabled){
  ['btnSavePages','btnReplacePages','btnDiagnoseSheets','btnRepairHeaders'].forEach(id=>{ const b=$(id); if(b) b.disabled = disabled; });
  document.querySelectorAll('[data-save],[data-replace],[data-load],[data-reset],[data-row-save],[data-row-replace]').forEach(b=>{ b.disabled = disabled; });
}
function showTablePageForOperation(tableKey){
  if(CATEGORY_KEYS.includes(tableKey)){
    setGroupActive('categories');
    showCategorySubpanel(tableKey);
    return;
  }
  setGroupActive(inferGroupFromPanel(tableKey));
  showPanel(tableKey);
}
function fullDbLabel(key){
  return key === 'items' ? 'アイテム・素材' : labelKey(key);
}
async function writeFullDbKeyInternal(dbKey, mode, options={}){
  const preparedRows = cloneRowsForSave(dbKey, state[dbKey] || []);
  const rows = await hydratePrivateFieldsForWrite(dbKey, preparedRows);
  const cleanRows = rows.map(cleanUploadRow);
  const serializedRows = JSON.stringify(cleanRows);
  const checksum = await sha256HexText(serializedRows);
  const uploadMode = mode === 'replace' ? 'replace' : 'upsert';
  const hashKey = dbHashPublicKey(uploadMode, dbKey, '');
  const remoteHashes = options.remoteHashes || {};
  if(remoteHashes[hashKey] === checksum){
    return {ok:true,skipped:true,sheetKey:dbKey,total:rows.length,checksum,hashKey,message:'変更なし'};
  }
  const uploadOptions={checksum,serializedRows,deferPriceCrossValidation:!!options.deferPriceCrossValidation};
  const res = uploadMode === 'replace'
    ? await replaceSheetRowsByJsonp(dbKey, rows, '', uploadOptions)
    : await upsertSheetRowsByJsonp(dbKey, rows, '', uploadOptions);
  if(!res || !res.ok){
    throw new Error((res && res.error) || `${fullDbLabel(dbKey)}のDB${uploadMode === 'replace' ? '置換' : '登録'}に失敗しました`);
  }
  remoteHashes[hashKey]=checksum;
  state = normalizeStateData({ ...state, [dbKey]: rows });
  rerenderTableGroup(dbKey);
  updateCounts();
  updateJsonBox();
  return {...res,checksum,hashKey};
}
async function runAllPages(mode){
  if(window.__recraftAllPageRunning){toast('全データ処理中です。','warn');return;}
  const rowCount = initialDataRowCount(state);
  if(rowCount === 0){ toast('画面上のデータが空です。初期データJSONまたはDBデータを読み込んでください。', 'error'); return; }
  const isReplace=mode==='replace'; const actionLabel=isReplace?'DB置換':'DB登録'; const total=FULL_DB_KEYS.length;
  try{
    const failures=[];
    for(const dbKey of FULL_DB_KEYS){
      try{ cloneRowsForSave(dbKey,state[dbKey]||[]); }
      catch(e){ failures.push(`${fullDbLabel(dbKey)}：${String(e?.message||e||'規定違反')}`); }
    }
    if(failures.length)throw new Error(`全DBの事前規定チェックで問題が見つかりました。送信はまだ開始していません。\n\n${failures.join('\n\n')}`);
  }catch(e){
    alert(String(e?.message||e));
    toast('DB規定チェックに失敗しました。送信前にデータを修正してください。','error');
    return;
  }
  const savedAll=allDbResumeLoad();
  let index=0;
  if(savedAll && savedAll.mode===mode && Number(savedAll.index||0)<total){
    const resume=confirm(`前回の全データ${actionLabel}が「${fullDbLabel(FULL_DB_KEYS[Number(savedAll.index||0)])}」の途中で停止しています。\n\nOK：続きから再開\nキャンセル：最初からやり直す`);
    if(resume) index=Number(savedAll.index||0); else {allDbResumeClear();uploadResumeClear();}
  }else if(!confirm(`全データ${actionLabel}を開始します。\n変更のないDBは送信を省略します。\n途中で失敗した場合は、続きから再開できます。\nよろしいですか？`)) return;
  toast(`全データ${actionLabel}${index?'を続きから再開':'を開始'}します`,'warn');
  window.__recraftAllPageRunning=true; setAllPageButtonsDisabled(true);
  let remoteHashes={};
  let skipped=0;
  try{
    try{
      remoteHashes=await loadServerDbHashes();
    }catch(hashError){
      console.warn('DB hash load failed; upload all databases',hashError);
      toast('変更判定を取得できなかったため、全DBを送信します。','warn');
    }
    while(index<total){
      const dbKey=FULL_DB_KEYS[index];
      allDbResumeSave({mode,index,dbKey,updatedAt:new Date().toISOString()});
      showTablePageForOperation(dbKey);
      toast(`${index+1}/${total} ${fullDbLabel(dbKey)}を確認中...`,'warn');
      try{
        const pairPriceTable = dbKey==='items' || dbKey==='recipes';
        const res=await writeFullDbKeyInternal(dbKey,isReplace?'replace':'upsert',{remoteHashes,deferPriceCrossValidation:pairPriceTable});
        if(res&&res.skipped){
          skipped++;
          toast(`${index+1}/${total} ${fullDbLabel(dbKey)}は変更なし：送信を省略`);
        }
        if(dbKey==='recipes'){
          toast('Items＋Recipesの価格整合性を最終確認中...','warn');
          const priceCheck=await callApi(payload('validateItemRecipePrices'));
          if(!priceCheck||!priceCheck.ok) throw new Error((priceCheck&&priceCheck.error)||'Items＋Recipesの価格整合性確認に失敗しました');
          uploadProgressLog(`価格整合性：Items ${Number(priceCheck.items||0)}件 / Recipes ${Number(priceCheck.recipes||0)}件 OK`);
        }
        index++; allDbResumeSave({mode,index,dbKey:FULL_DB_KEYS[index]||'',updatedAt:new Date().toISOString()});
      }catch(e){
        const retry=confirm(`${fullDbLabel(dbKey)}の${actionLabel}中に失敗しました。\n${e.message||e}\n\nOK：この表を再試行\nキャンセル：全データ処理を中止（次回はこの表から再開できます）`);
        if(retry) continue;
        const sess=uploadResumeLoad();
        if(sess&&sess.token){try{await callApi(payload('abortUpload',{token:sess.token}));}catch(_){} }
        uploadResumeClear();
        toast(`全データ${actionLabel}を中止しました。次回は${fullDbLabel(dbKey)}から再開できます。`,'warn');
        return;
      }
    }
    allDbResumeClear();uploadResumeClear();
    clearDirty('*');
    toast(`全データ${actionLabel}が完了しました（送信${total-skipped}／省略${skipped}）`);
  }finally{window.__recraftAllPageRunning=false;setAllPageButtonsDisabled(false);}
}
async function saveAll(){
  return runAllPages('save');
}
async function dedupeAll(){
  if(!confirm('DB内の重複行を整理します。\n同じIDの行は後ろにある行を最新として残します。IDが空の場合は、名称・分類などから重複判定します。')) return;
  try{
    const res=await writeApi(payload('dedupeAll'));
    if(!res.ok) throw new Error(res.error||'失敗');
    const removed = Object.values(res.results||{}).reduce((sum,r)=>sum+Number(r.removed||0),0);
    toast(`DB重複整理が完了しました\n削除した重複行:${removed}`);
    await loadAll();
  }catch(e){toast(e.message,'error')}
}
async function replaceSheetInternal(tableKey, options={}){
  const base = baseKeyForTable(tableKey);
  const preparedRows = cloneRowsForSave(base, rowsForTableForSave(tableKey));
  const rows = await hydratePrivateFieldsForWrite(base, preparedRows);
  const dataKindScope = dataKindForTable(tableKey);
  // アイテムと素材は同じDBシートを共有するが、反対側のデータは送らない。
  // GAS側がdataKindScope外の既存行を保持して部分置換する。
  const res = await replaceSheetRowsByJsonp(base, rows, dataKindScope);
  if(!res || !res.ok){
    throw new Error((res && res.error) || `${labelKey(tableKey)}のDB置換に失敗しました`);
  }
  applySavedRowsToState(tableKey, rows, 'replace');
  clearDirty(tableKey);
  rerenderTableGroup(tableKey);
  updateCounts();
  updateJsonBox();
  if(!options.silent) toast(`${labelKey(tableKey)}をDB置換しました`);
  return res;
}

async function replaceSheet(tableKey){
  if(!confirm(`${labelKey(tableKey)}だけを、画面上の内容でDB置換します。
他の表には触りません。よろしいですか？`)) return;
  try{
    toast(`${labelKey(tableKey)}のDB置換を開始します`, 'warn');
    await replaceSheetInternal(tableKey);
  }catch(e){toast(e.message,'error')}
}
async function replaceAll(){
  return runAllPages('replace');
}
async function loadAll(){
  try{
    toast('全データDB読込を開始します', 'warn');
    const nextState = {};
    for (const key of DATA_KEYS) {
      const res = await callApi(payload('list', { sheetKey: key }));
      if(!res.ok) throw new Error(res.error || `${labelKey(key)}のDB読込に失敗しました`);
      nextState[key] = res.rows || [];
    }
    state = normalizeStateData(nextState);
    clearDirty('*');
    renderAll(); toast('DBから分割読み込みしました');
  }catch(e){toast(e.message,'error')}
}
function labelKey(key){ if(key==='items') return currentItemTypeView || '登録データ'; return {item_types:'アイテム種別',item_categories:'アイテムカテゴリ',material_types:'素材種別',material_categories:'素材カテゴリ',material_ranks:'素材ランク',equipment_categories:'装備カテゴリ',materials:'素材',recipes:'レシピ',spells:'術式',skills:'スキル',quest_rewards:'依頼報酬', quests:'クエスト', exploration_areas:'探索エリア', event_tables:'イベント表', treasure_tables:'宝箱表', appraisal_rules:'鑑定ルール', monsters:'魔物'}[key]||key}
function downloadJson(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='recraft_alchemia_master_data.json'; a.click(); URL.revokeObjectURL(a.href);
}

const GITHUB_PUBLIC_DB_VERSION = String(RECRAFT_DB_VERSION||'').trim().replace(/^v/i,'');
const GITHUB_PUBLIC_DB_UPDATED_AT = new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'});
const GITHUB_PUBLIC_DB_MASTER_FILENAME = 'recraft_alchemia_master.json';
const GITHUB_PUBLIC_DB_CHARACTER_FILENAME = 'recraft_alchemia_character_master.json';
const GITHUB_PUBLIC_DB_FACILITY_FILENAME = 'recraft_alchemia_facility_master.json';
const GITHUB_PUBLIC_GM_ALL_UNLOCK_KEY_HASH = '99c441f2f2479e89671c1835c55014048c0ddf8cb58fc3af013ecb65129c39cb';
const GITHUB_PUBLIC_DB_OMIT_FIELDS = new Set([
  'ownerKey','createdBy','adminKey','playerKey','masterKey',
  'managementKey','githubToken','accessToken','apiToken',
  'password','secret','unlockKey'
]);

function setGithubPublicDbStatus(message='', stateName=''){
  const el=$('githubPublicDbStatus');
  if(!el)return;
  el.className='github-public-db-status'+(stateName?` is-${stateName}`:'');
  el.textContent=message;
}

function sanitizeGithubPublicValue(value){
  if(Array.isArray(value)) return value.map(sanitizeGithubPublicValue);
  if(value && typeof value==='object'){
    const out={};
    Object.entries(value).forEach(([key,rowValue])=>{
      if(GITHUB_PUBLIC_DB_OMIT_FIELDS.has(key))return;
      out[key]=sanitizeGithubPublicValue(rowValue);
    });
    return out;
  }
  return value;
}

function githubPublicSkillRows(){
  const rows=Array.isArray(state.skills)?state.skills:[];
  return sanitizeGithubPublicValue(rows);
}
function normalizeGithubPublicUnlockKey(value=''){
  return String(value||'').normalize('NFKC').toUpperCase().replace(/[‐‑‒–—―−－]/g,'-').replace(/[\s\u200B-\u200D\uFEFF]/g,'');
}
async function buildGithubPublicMaster(){
  const source=normalizeStateData(raDeepClone(state||{}));
  const data={};
  for(const key of DATA_KEYS){
    const rows=Array.isArray(source[key])?source[key]:[];
    if(key==='exploration_areas'){
      data[key]=[];
      for(const row of rows){
        const clean=sanitizeGithubPublicValue(row);
        delete clean.unlockKey;
        const normalized=normalizeGithubPublicUnlockKey(row.unlockKey||'');
        if(normalized)clean.unlockKeyHash=await githubPublicSha256Hex(normalized);
        data[key].push(clean);
      }
    }else data[key]=sanitizeGithubPublicValue(rows);
  }
  data.skills=githubPublicSkillRows();
  return {
    format:'recraft-alchemia-github-master',
    version:GITHUB_PUBLIC_DB_VERSION,
    updatedAt:GITHUB_PUBLIC_DB_UPDATED_AT,
    encoding:'UTF-8',
    sourceRepository:'akari-2659/Recraft-Alchemia-App',
    description:'Recraft-Alchemiaのキャラシ・施設・管理画面で共通参照する静的マスターデータ。エリア解放キーは平文を含めず、照合用SHA-256のみ収録する。',
    gmAllUnlockKeyHash:GITHUB_PUBLIC_GM_ALL_UNLOCK_KEY_HASH,
    recordCount:Object.values(data).reduce((sum,rows)=>sum+(Array.isArray(rows)?rows.length:0),0),
    data
  };
}
function buildGithubPublicSpecializedMaster(master,kind='character'){
  const source=master?.data&&typeof master.data==='object'?master.data:{};
  const keys=kind==='facility'
    ? ['items','recipes','exploration_areas','monsters','event_tables','equipment_categories','material_ranks']
    : ['item_types','item_categories','material_types','material_categories','material_ranks','equipment_categories','recipes','spells','skills','items'];
  const data={};
  for(const key of keys){
    let rows=Array.isArray(source[key])?source[key]:[];
    if(kind==='character'&&key==='skills')rows=rows.filter(row=>String(row?.enabled??'').trim().toUpperCase()!=='FALSE');
    data[key]=raDeepClone(rows);
  }
  return {
    format:kind==='facility'?'recraft-alchemia-facility-master':'recraft-alchemia-character-master',
    version:String(master?.version||GITHUB_PUBLIC_DB_VERSION),
    encoding:'UTF-8',
    description:String(master?.description||''),
    updatedAt:String(master?.updatedAt||GITHUB_PUBLIC_DB_UPDATED_AT),
    generatedAt:new Date().toISOString(),
    data
  };
}
function githubPublicRecordCount(doc={}){
  const data=doc?.data&&typeof doc.data==='object'?doc.data:{};
  return Object.values(data).reduce((sum,rows)=>sum+(Array.isArray(rows)?rows.length:0),0);
}
async function githubPublicFileInfo(filename,text,doc){
  const bytes=new TextEncoder().encode(text).length;
  return {file:filename,sha256:await githubPublicSha256Hex(text),bytes,recordCount:githubPublicRecordCount(doc),dataKeys:Object.keys(doc?.data||{})};
}
async function githubPublicSha256Hex(textValue=''){
  if(!globalThis.crypto?.subtle)return '';
  const bytes=new TextEncoder().encode(String(textValue));
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
}

function githubZipCrc32(bytes){
  if(!githubZipCrc32.table){
    githubZipCrc32.table=Array.from({length:256},(_,n)=>{
      let c=n;
      for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);
      return c>>>0;
    });
  }
  let crc=0xFFFFFFFF;
  for(const b of bytes)crc=githubZipCrc32.table[(crc^b)&0xFF]^(crc>>>8);
  return (crc^0xFFFFFFFF)>>>0;
}

function githubZipU16(value){
  return new Uint8Array([value&255,(value>>>8)&255]);
}
function githubZipU32(value){
  return new Uint8Array([value&255,(value>>>8)&255,(value>>>16)&255,(value>>>24)&255]);
}
function githubZipConcat(parts){
  const size=parts.reduce((sum,p)=>sum+p.length,0);
  const out=new Uint8Array(size);
  let offset=0;
  parts.forEach(p=>{out.set(p,offset);offset+=p.length;});
  return out;
}
function githubZipDosDateTime(date=new Date()){
  const year=Math.max(1980,date.getFullYear());
  return {
    time:((date.getHours()&31)<<11)|((date.getMinutes()&63)<<5)|((Math.floor(date.getSeconds()/2))&31),
    date:(((year-1980)&127)<<9)|(((date.getMonth()+1)&15)<<5)|(date.getDate()&31)
  };
}
function createGithubStoredZip(files=[]){
  const encoder=new TextEncoder();
  const localParts=[];
  const centralParts=[];
  let offset=0;
  const stamp=githubZipDosDateTime(new Date());

  files.forEach(file=>{
    const nameBytes=encoder.encode(file.name);
    const dataBytes=typeof file.content==='string'?encoder.encode(file.content):file.content;
    const crc=githubZipCrc32(dataBytes);

    const local=githubZipConcat([
      githubZipU32(0x04034b50),
      githubZipU16(20),githubZipU16(0x0800),githubZipU16(0),
      githubZipU16(stamp.time),githubZipU16(stamp.date),
      githubZipU32(crc),githubZipU32(dataBytes.length),githubZipU32(dataBytes.length),
      githubZipU16(nameBytes.length),githubZipU16(0),
      nameBytes,dataBytes
    ]);
    localParts.push(local);

    const central=githubZipConcat([
      githubZipU32(0x02014b50),
      githubZipU16(20),githubZipU16(20),githubZipU16(0x0800),githubZipU16(0),
      githubZipU16(stamp.time),githubZipU16(stamp.date),
      githubZipU32(crc),githubZipU32(dataBytes.length),githubZipU32(dataBytes.length),
      githubZipU16(nameBytes.length),githubZipU16(0),githubZipU16(0),
      githubZipU16(0),githubZipU16(0),githubZipU32(0),githubZipU32(offset),
      nameBytes
    ]);
    centralParts.push(central);
    offset+=local.length;
  });

  const localData=githubZipConcat(localParts);
  const centralData=githubZipConcat(centralParts);
  const end=githubZipConcat([
    githubZipU32(0x06054b50),githubZipU16(0),githubZipU16(0),
    githubZipU16(files.length),githubZipU16(files.length),
    githubZipU32(centralData.length),githubZipU32(localData.length),
    githubZipU16(0)
  ]);
  return new Blob([localData,centralData,end],{type:'application/zip'});
}

function downloadGithubBlob(blob,filename){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}

async function exportGithubPublicDb(){
  const button=$('btnExportGithubPublicDb');
  if(button)button.disabled=true;
  setGithubPublicDbStatus('公開JSONを生成しています…','saving');
  try{
    const master=await buildGithubPublicMaster();
    if(!master.recordCount)throw new Error('管理画面にデータが読み込まれていません。');
    const characterMaster=buildGithubPublicSpecializedMaster(master,'character');
    const facilityMaster=buildGithubPublicSpecializedMaster(master,'facility');
    const masterText=JSON.stringify(master,null,2)+'\n';
    const characterText=JSON.stringify(characterMaster,null,2)+'\n';
    const facilityText=JSON.stringify(facilityMaster,null,2)+'\n';
    const masterInfo=await githubPublicFileInfo(GITHUB_PUBLIC_DB_MASTER_FILENAME,masterText,master);
    const characterInfo=await githubPublicFileInfo(GITHUB_PUBLIC_DB_CHARACTER_FILENAME,characterText,characterMaster);
    const facilityInfo=await githubPublicFileInfo(GITHUB_PUBLIC_DB_FACILITY_FILENAME,facilityText,facilityMaster);
    const manifest={
      format:'recraft-alchemia-public-manifest',
      version:GITHUB_PUBLIC_DB_VERSION,
      updatedAt:new Date().toISOString(),
      files:{master:masterInfo,character:characterInfo,facility:facilityInfo},
      sha256:masterInfo.sha256,
      bytes:masterInfo.bytes,
      recordCount:masterInfo.recordCount
    };
    const manifestText=JSON.stringify(manifest,null,2)+'\n';
    const instructions=[
      'Recraft-Alchemia GitHub共通DB 配置手順',
      '',
      '1. このZIPを展開します。',
      '2. Recraft-Alchemia-Appリポジトリを開きます。',
      '3. ZIP内の data/public/ にある4ファイルを、リポジトリの data/public/ へアップロードします。',
      '4. 既存のmanifest.jsonは上書きします。',
      '5. GitHub Pages反映後、次のURLを開いてversionを確認します。',
      '   https://akari-2659.github.io/Recraft-Alchemia-App/data/public/manifest.json',
      '',
      `公開DBバージョン: ${GITHUB_PUBLIC_DB_VERSION}`,
      `収録件数: ${master.recordCount}件`,
      '',
      '注意:',
      '- このZIPは、ボタンを押した時点で管理画面に読み込まれていたデータから生成されます。',
      '- DBを変更した後は、スプレへ保存したうえで再度書き出してください。',
      '- キャラクターデータ、プレイヤーキー、管理キー、平文のエリア解放キーは収録しません。',
      '- エリア解放キーとGM全エリア解放キーはSHA-256ハッシュだけを収録し、施設HTML内で照合します。'
    ].join('\n')+'\n';

    const zip=createGithubStoredZip([
      {name:'data/public/manifest.json',content:manifestText},
      {name:`data/public/${GITHUB_PUBLIC_DB_MASTER_FILENAME}`,content:masterText},
      {name:`data/public/${GITHUB_PUBLIC_DB_CHARACTER_FILENAME}`,content:characterText},
      {name:`data/public/${GITHUB_PUBLIC_DB_FACILITY_FILENAME}`,content:facilityText},
      {name:'UPLOAD_INSTRUCTIONS.txt',content:instructions}
    ]);
    downloadGithubBlob(zip,`recraft_alchemia_github_public_db_v${GITHUB_PUBLIC_DB_VERSION}.zip`);
    setGithubPublicDbStatus(
      `書き出しました：v${GITHUB_PUBLIC_DB_VERSION} / ${master.recordCount}件\n管理GitHubの data/public/ へアップロードしてください。`,
      'ok'
    );
    toast('GitHub共通DB一式を書き出しました');
  }catch(e){
    setGithubPublicDbStatus(`書き出しに失敗しました：${e.message||e}`,'error');
    toast(e.message||String(e),'error');
  }finally{
    if(button)button.disabled=false;
  }
}
