function githubCommonDbBaseCandidates(){
  // 公開共通DBへフォールバックする場合も、Appの公開DBだけを正本として参照する。
  return [GITHUB_COMMON_DB_REMOTE_BASE];
}
let githubCommonMasterPromise = null;
let DEFAULTS = createEmptyDataSet();
let initialDataLoaded = false;
let initialDataSource = '';
let state = createEmptyDataSet();

function createEmptyDataSet(){
  return Object.fromEntries(DATA_KEYS.map(key => [key, []]));
}
function initialDataRowCount(data){
  return DATA_KEYS.reduce((sum,key)=>sum+(Array.isArray(data?.[key]) ? data[key].length : 0),0);
}
function extractInitialDataPayload(raw){
  if(!raw || typeof raw !== 'object') throw new Error('表示用マスターJSONの形式が正しくありません');
  const acceptedFormats = [INITIAL_DATA_FORMAT, GITHUB_COMMON_DATA_FORMAT, 'recraft-alchemia-public-master'];
  if(raw.format && !acceptedFormats.includes(raw.format)) throw new Error(`対応していない表示用マスター形式です: ${raw.format}`);
  return raw.data && typeof raw.data === 'object' ? raw.data : raw;
}
function normalizeInitialDataPayload(raw){
  const source = extractInitialDataPayload(raw);
  const out = createEmptyDataSet();
  for(const key of DATA_KEYS){
    if(source[key] !== undefined && !Array.isArray(source[key])) throw new Error(`${key} が配列ではありません`);
    out[key] = Array.isArray(source[key]) ? source[key].map(row=>({...row})) : [];
  }
  return unifyEffectNotesForDisplayRows(out);
}
function updateInitialDataStatus(){
  const el = $('initialDataStatus');
  if(!el) return;
  if(initialDataLoaded){
    el.className = 'status-box ok';
    el.textContent = `初期復元元：${initialDataSource || '表示用マスター'}（${initialDataRowCount(DEFAULTS)}件）`;
  }else{
    el.className = 'status-box warn';
    el.textContent = 'GitHub共通DBを確認しています。';
  }
}
function applyInitialData(raw, sourceLabel='表示用マスター'){
  const source = extractInitialDataPayload(raw);
  const loaded = normalizeInitialDataPayload(raw);
  window.RA_SKILL_MASTER = { skills: Array.isArray(loaded.skills) ? loaded.skills : [] };
  if(initialDataRowCount(loaded) === 0) throw new Error('表示用マスターに登録データがありません');
  DEFAULTS = loaded;
  initialDataLoaded = true;
  initialDataSource = sourceLabel;
  state = unifyEffectNotesForDisplayRows(raDeepClone(DEFAULTS));
  renderAll();
  updateInitialDataStatus();
  toast(`表示用マスターを読み込みました（${initialDataRowCount(DEFAULTS)}件）`);
}
function managerGithubDelay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function managerMasterDataRowCount(master){
  const data=master&&master.data&&typeof master.data==='object'?master.data:master;
  if(!data||typeof data!=='object')return 0;
  return DATA_KEYS.reduce((sum,key)=>sum+(Array.isArray(data[key])?data[key].length:0),0);
}
function validateManagerCommonMaster(master){
  const data=master&&master.data&&typeof master.data==='object'?master.data:master;
  if(!data||typeof data!=='object')throw new Error('共通DB本体が不正です。');
  for(const key of DATA_KEYS){
    if(data[key]!==undefined&&!Array.isArray(data[key]))throw new Error(`共通DB ${key} が配列ではありません。`);
  }
  const monsters=Array.isArray(data.monsters)?data.monsters:[],ids=new Set();
  monsters.forEach((row,index)=>{
    const id=String(row?.id||'').trim();if(!id)throw new Error(`共通DB 魔物 ${index+1}件目にIDがありません。`);
    if(ids.has(id))throw new Error(`共通DB 魔物IDが重複しています：${id}`);ids.add(id);
  });
  const byId=new Map(monsters.map(row=>[String(row.id||''),row]));
  const affinityFields=['physicalAffinity','fireAffinity','waterAffinity','windAffinity','thunderAffinity','lightAffinity','darkAffinity','neutralAffinity'];
  monsters.filter(row=>/^mon_named_/.test(String(row.id||''))).forEach(row=>{
    const base=byId.get(String(row.baseMonsterId||''));
    if(!base)throw new Error(`二つ名個体 ${row.id} のbaseMonsterIdが不正です。`);
    const mismatch=affinityFields.find(field=>String(row[field]||'')!==String(base[field]||''));
    if(mismatch)throw new Error(`二つ名個体 ${row.id} の耐性が通常個体と一致していません：${mismatch}`);
  });
  assertSkillProgressionRows(Array.isArray(data.skills)?data.skills:[]);
  assertSkillCrystalProgressionRows(Array.isArray(data.recipes)?data.recipes:[]);
  return true;
}
async function managerFetchGithubJson(url,{timeoutMs=15000,cacheMode='force-cache'}={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),Math.max(1000,Number(timeoutMs)||15000));
  try{
    const response=await fetch(url,{cache:cacheMode,signal:controller.signal});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }catch(error){
    if(error&&error.name==='AbortError')throw new Error(`GitHub共通DBの取得がタイムアウトしました（${Math.round((Number(timeoutMs)||15000)/1000)}秒）`);
    throw error;
  }finally{clearTimeout(timer);}
}
async function fetchGithubCommonMaster({force=false}={}){
  if(githubCommonMasterPromise&&!force)return githubCommonMasterPromise;
  const task=(async()=>{
    const errors=[];
    for(const base of githubCommonDbBaseCandidates()){
      let manifest=null;
      try{
        const manifestUrl=new URL('manifest.json',base);
        manifest=await managerFetchGithubJson(manifestUrl.toString(),{timeoutMs:6000,cacheMode:'no-cache'});
      }catch(error){
        // manifestは小さいので1回だけ再試行。巨大なmaster本体は再取得しない。
        try{
          await managerGithubDelay(250);
          const manifestUrl=new URL('manifest.json',base);
          manifest=await managerFetchGithubJson(manifestUrl.toString(),{timeoutMs:6000,cacheMode:'reload'});
        }catch(second){errors.push(`${base}: manifest ${second.message||second}`);}
      }
      if(manifest){
        try{
          const nested=manifest?.files?.master,info=nested&&typeof nested==='object'?nested:{};
          const masterFile=String(manifest.master||info.file||info.path||(typeof nested==='string'?nested:'')||'').trim();
          if(!masterFile||masterFile.includes('..')||masterFile.includes(String.fromCharCode(92)))throw new Error('manifestのmasterファイル名が不正です');
          const cacheKey=String(manifest.sha256||info.sha256||manifest.version||'master').trim();
          const masterUrl=new URL(masterFile,base);masterUrl.searchParams.set('_ra',cacheKey);
          const master=await managerFetchGithubJson(masterUrl.toString(),{timeoutMs:20000,cacheMode:force?'reload':'force-cache'});
          validateManagerCommonMaster(master);
          const rows=managerMasterDataRowCount(master);if(!rows)throw new Error('共通DBの更新データが空です');
          const manifestVersion=String(manifest.version||'').trim(),masterVersion=String(master.version||'').trim();
          return{manifest,master,version:masterVersion||manifestVersion,base,versionWarning:manifestVersion&&masterVersion&&manifestVersion.replace(/^v/i,'')!==masterVersion.replace(/^v/i,'')?`manifest ${manifestVersion} / master ${masterVersion}`:''};
        }catch(error){errors.push(`${base}: master ${error.message||error}`);}
      }
      // manifest経路が使えない場合だけdirectを1回試す。masterを何度も落とさない。
      try{
        const directUrl=new URL('recraft_alchemia_master.json',base);
        const master=await managerFetchGithubJson(directUrl.toString(),{timeoutMs:20000,cacheMode:force?'reload':'force-cache'});
        validateManagerCommonMaster(master);
        const rows=managerMasterDataRowCount(master);if(!rows)throw new Error('共通DBの更新データが空です');
        return{manifest:{master:'recraft_alchemia_master.json'},master,version:String(master.version||''),base,versionWarning:''};
      }catch(error){errors.push(`${base}: direct ${error.message||error}`);}
    }
    throw new Error(errors.join(' / ')||'GitHub共通DBの取得先がありません');
  })();
  githubCommonMasterPromise=task;
  try{return await task;}
  catch(error){if(githubCommonMasterPromise===task)githubCommonMasterPromise=null;throw error;}
}

async function loadBundledInitialData(){
  const url=new URL(INITIAL_DATA_PATH,window.location.href);
  url.searchParams.set('v',RECRAFT_DB_VERSION);
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const res = await fetch(url.toString(), {cache:'force-cache',signal:controller.signal});
    if(!res.ok) throw new Error(`同梱JSON HTTP ${res.status}`);
    return await res.json();
  }catch(error){
    if(error&&error.name==='AbortError')throw new Error('管理用同梱DBの取得がタイムアウトしました（8秒）');
    throw error;
  }finally{clearTimeout(timer);}
}
async function loadManagerDisplayData({force=false}={}){
  const status = $('initialDataStatus');
  if(status){
    status.className = 'status-box warn';
    status.textContent = 'GitHub共通DBを読み込んでいます。';
  }
  try{
    // 画面の説明どおり、起動時・再読込ともManagerの公開共通DBを正本として直接読む。
    const result = await fetchGithubCommonMaster({force});
    applyInitialData(
      result.master,
      `GitHub共通DB${result.version ? ' v' + result.version : ''}`
    );
    return {source:'github', version:result.version};
  }catch(githubError){
    console.warn('GitHub共通DBを取得できないため管理用同梱DBへ切り替えます。', githubError);
    if(status){
      status.className = 'status-box warn';
      status.textContent = 'GitHub共通DB取得失敗。管理用同梱DBへ切り替えています。';
    }
    try{
      const bundled = await loadBundledInitialData();
      validateManagerCommonMaster(bundled);
      applyInitialData(bundled, '管理用同梱DB（GitHub共通DBフォールバック）');
      if(status){
        status.className = 'status-box warn';
        status.textContent =
          `初期復元元：管理用同梱DB（GitHub共通DB取得失敗：${githubError.message || githubError}）` +
          `（${initialDataRowCount(DEFAULTS)}件）`;
      }
      toast('GitHub共通DBを取得できなかったため、管理用同梱DBを読み込みました。', 'warn');
      return {source:'bundled', version:String(bundled?.version||''), error:githubError};
    }catch(bundledError){
      if(status){
        status.className = 'status-box bad';
        status.textContent =
          `表示用マスター読込失敗：GitHub=${githubError.message || githubError} / 同梱=${bundledError.message || bundledError}`;
      }
      toast('GitHub共通DBと管理用同梱DBの両方を読み込めませんでした。', 'error');
      return {source:'error', error:githubError, bundledError};
    }
  }
}
function clearWorkingData(){
  if(!confirm('画面上のデータを空にしますか？\nDB上のデータは変更されません。')) return;
  state = createEmptyDataSet();
  renderAll();
  toast('画面上のデータを空にしました');
}

function raDeepClone(obj){
  if(typeof globalThis.structuredClone==='function') return globalThis.structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}
function mergeTextUnique(...values){
  const seen = new Set();
  const parts = [];
  values.forEach(value => {
    String(value ?? '').split(/\n+/).map(v => v.trim()).filter(Boolean).forEach(line => {
      if(!seen.has(line)){ seen.add(line); parts.push(line); }
    });
  });
  return parts.join('\n');
}
function unifyEffectNotesForDisplayRows(data){
  const out = data || {};
  // 旧版互換: 過去の flavorText 列だけ説明へ移す。
  // メモを効果へ混ぜる処理は廃止し、説明と効果を別々に保持する。
  ['equipment_categories','items','spells','recipes'].forEach(key => {
    if(!Array.isArray(out[key])) return;
    out[key].forEach(row => {
      if(!row) return;
      const oldDescription = row['fla' + 'vor' + 'Text'];
      if(!String(row.description || '').trim() && String(oldDescription || '').trim()) row.description = oldDescription;
      delete row['fla' + 'vor' + 'Text'];
      if(!String(row.description || '').trim() && String(row['説明'] || '').trim()) row.description = row['説明'];
      if(!String(row.effect || '').trim() && String(row['効果'] || '').trim()) row.effect = row['効果'];
      delete row['説明']; delete row['効果'];
    });
  });
  return out;
}
function $(id){ return document.getElementById(id); }
const raDirtyTables=new Set();
function updateDirtyStateBadge(){
  const badge=$('dirtyStateBadge');if(!badge)return;
  const dirty=raDirtyTables.size>0;
  badge.classList.toggle('is-dirty',dirty);
  badge.textContent=dirty?`未保存の変更あり${raDirtyTables.has('*')?'':`（${raDirtyTables.size}表）`}`:'保存済み';
}
function markDirty(tableKey='*'){raDirtyTables.add(tableKey||'*');updateDirtyStateBadge();}
function clearDirty(tableKey='*'){
  if(tableKey==='*')raDirtyTables.clear();
  else{raDirtyTables.delete(tableKey);if(raDirtyTables.has('*'))raDirtyTables.delete('*');}
  updateDirtyStateBadge();
}
window.addEventListener('beforeunload',e=>{if(!raDirtyTables.size)return;e.preventDefault();e.returnValue='';});
function nowIso(){ return new Date().toISOString(); }
const LEGACY_NUMERIC_RANKS = {'初期':1,'初級':1,'チュートリアル':1,'小規模':1,'中級':2,'通常':2,'標準':2,'上級':3,'大規模':3,'特級':4,'強敵':4,'ボス':4,'高難度':4,'最上級':5};
const LEGACY_MATERIAL_GRADE_TO_NUMERIC_RANK = {'低級':1,'普通':2,'良質':3,'希少':4,'高級':5};
function numericRankValue(value, fallback=''){
  if(typeof value === 'number' && Number.isFinite(value) && value >= 1) return Math.floor(value);
  const raw=String(value ?? '').trim();
  if(!raw) return fallback;
  if(Object.prototype.hasOwnProperty.call(LEGACY_NUMERIC_RANKS, raw)) return LEGACY_NUMERIC_RANKS[raw];
  const m=raw.match(/(?:★|Rank\s*[:：]?\s*)?(\d+)/i);
  const n=m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}
function numericRankValueIncludingLegacyMaterialGrade(value, fallback=''){
  const raw=String(value ?? '').trim();
  if(Object.prototype.hasOwnProperty.call(LEGACY_MATERIAL_GRADE_TO_NUMERIC_RANK, raw)) return LEGACY_MATERIAL_GRADE_TO_NUMERIC_RANK[raw];
  return numericRankValue(value, fallback);
}
function playerRankLabel(value){ const n=numericRankValue(value,''); return n ? `★${n}` : String(value ?? '').trim(); }

function adminCraftingRequiredToolRank(rank){
  const n=Math.max(1,Number(rank)||1);
  return Math.ceil(n/3)*3;
}
function adminCraftingDifficultyRows(rank,difficulty){
  const base=Number(String(difficulty??'').trim());
  if(!Number.isFinite(base)) return [];
  const required=adminCraftingRequiredToolRank(rank);
  return [0,1,2].map(step=>({
    toolRank:required+step*3,
    reduction:step*2,
    finalDifficulty:base-step*2
  }));
}
function adminCraftingDifficultySummary(rank,difficulty){
  const rows=adminCraftingDifficultyRows(rank,difficulty);
  if(!rows.length) return String(difficulty||'未設定');
  return rows.map((r,i)=>`★${r.toolRank}対応：${r.finalDifficulty}${i?`（－${r.reduction}）`:'（基礎）'}`).join(' / ')+' / 以降1段階ごとに－2';
}
function adminCraftingToolName(craftSkill='',craftType=''){
  const skill=String(craftSkill||'').trim();
  const type=String(craftType||'').trim();
  if(skill==='調合'||type==='調合') return '調合道具';
  if(type==='細工'||type==='仕掛け製作'||skill==='設計') return '細工道具';
  if(['武器派生','防具製作','盾製作','装飾品製作','装飾品強化','バッグ製作','矢筒製作','鍛冶製作','鍛冶'].includes(type)) return '鍛冶道具';
  if(skill==='細工') return '細工道具';
  return '対応道具';
}
const ADMIN_CRAFT_SUPPORT_REDUCTION=2;
function adminCraftSupportName(row={}){
  const skill=String(row.craftSkill||row.processingSkill||'').trim();
  const type=String(row.craftType||'').trim();
  if(skill==='調合'||type==='調合')return '調合安定剤';
  if(skill==='設計')return '機巧調整剤';
  if(skill==='細工'){
    if(type==='武器派生')return '武装融和剤';
    if(type==='鍛冶'){
      const result=String(row.resultItem||row.name||'').trim();
      const item=(state.items||[]).find(x=>String(x.name||'').trim()===result)||{};
      if(String(item.itemType||'').trim()==='武器')return '武装融和剤';
    }
    return '工作定着剤';
  }
  return '';
}
function adminCraftSupportText(row={}){
  const name=adminCraftSupportName(row);return name?`${name}（自作時のみ・任意個数）／1個につき作成難易度－${ADMIN_CRAFT_SUPPORT_REDUCTION}`:'';
}
function adminCraftingRouteLines(row={}){
  const difficulty=String(row.difficulty??'').trim();
  const rows=adminCraftingDifficultyRows(row.rank,difficulty);
  if(!rows.length) return difficulty ? [`作成難易度：${difficulty}`] : [];
  const skill=String(row.craftSkill||recipeSkillForCraftType(row.craftType)||'細工').trim();
  const lines=[
    `使用技能：${skill}`,
    `使用道具：${adminCraftingToolName(skill,row.craftType)}`,
    `基礎作成難易度：${difficulty}`,
    `道具使用時：${adminCraftingDifficultySummary(row.rank,difficulty)}`
  ];
  const supportText=adminCraftSupportText(row);if(supportText)lines.push(`任意の作成補助材：${supportText}`);
  return lines;
}
function adminCraftingRouteHtml(row={}){
  return adminCraftingRouteLines(row).map(line=>{
    const idx=line.indexOf('：');
    const k=idx>=0?line.slice(0,idx):'';
    const v=idx>=0?line.slice(idx+1):line;
    return `<div><b>${escapeHtml(k)}：</b>${escapeHtml(v)}</div>`;
  }).join('');
}
function adminRankLabel(value){ return playerRankLabel(value); }
function isStructuredNumericRankRecord(key,row={}){
  return ['items','recipes','spells','skills','quest_rewards','quests','monsters'].includes(key);
}
function isStructuredNumericSubRank(key,field){
  return (key==='treasure_tables' && ['treasureRank','scrollRank'].includes(field))
    || (key==='appraisal_rules' && ['scrollRank','spellRank'].includes(field))
    || (key==='items' && field==='guaranteeUpgradeMaxRank');
}
function isEquipmentItemRow(row={}){
  return String(row.dataKind || 'アイテム').trim() !== '素材' && ['武器','防具','盾'].includes(String(row.itemType || '').trim());
}
function equipmentUpgradeMinimumRank(row={}){
  const own=numericRankValueIncludingLegacyMaterialGrade(row.rank,1);
  return numericRankValueIncludingLegacyMaterialGrade(row.upgradeMaterialMinRank,own);
}

function stripSkillPointTerms(value){
  return String(value || '')
    .replace(/\+?\s*(魔法|祈祷)\s*(ポイント|P)\s*/g, '')
    .replace(/\s*\+\s*$/g, '')
    .replace(/^\s*\+\s*/g, '')
    .replace(/\+\s*\+/g, '+')
    .trim();
}
function normalizePowerForDb(key, value){
  return key === 'spells' ? stripSkillPointTerms(value) : String(value || '').trim();
}
function currentAdminKey(){ return ''; }
function currentCreatedBy(){ return ''; }
function markRowOwnership(row){
  if(!row) return row;
  // ownerKey / createdBy は旧DB互換列としてのみ残し、管理画面では使用しない。
  row.ownerKey = '';
  row.createdBy = '';
  return row;
}

function normalizeStoredEncounterComposition(raw=''){
  const text=String(raw||'').trim();
  if(!text || /^(ランダム編成|指定対象＋ランダム随伴)/.test(text)) return text;
  const lines=text.split(/\n+|;|；/).map(line=>line.trim()).filter(Boolean);
  const parsed=lines.map(line=>line.split(/\t|,|，|、/).map(value=>String(value||'').trim()).filter(Boolean));
  if(!parsed.length || parsed.some(cols=>cols.length<3)) return text;
  parsed.forEach(cols=>{ cols[0]=String(cols[0]||'').startsWith('後衛')?'後衛':'前衛'; });
  if(!parsed.some(cols=>cols[0]==='前衛')) parsed[0][0]='前衛';
  return parsed.map(cols=>cols.join(',')).join(';');
}
function normalizeEncounterPlacementRow(key,row={}){
  if(!row) return row;
  if(key==='event_tables' && String(row.encounterComposition||'').trim()){
    row.encounterComposition=normalizeStoredEncounterComposition(row.encounterComposition);
  }
  if(key==='quests' && String(row.questBossComposition||'').trim()){
    const formation=String(row.questBossFormation||'').trim();
    let composition=String(row.questBossComposition||'').trim();
    // 表示上「指定対象＋ランダム随伴」なのに固定編成として保存される事故を防ぐ。
    if(formation.includes('ランダム随伴') && !composition.startsWith('指定対象＋ランダム随伴')){
      const first=composition.split(/\n+|;|；/).map(v=>v.trim()).filter(Boolean)[0]||'';
      const cols=first.split(/\t|,|，|、/).map(v=>String(v||'').trim()).filter(Boolean);
      const target=cols[1]||String(row.bossMonster||'').split('/')[0].trim();
      const count=Math.max(1,Number(cols[2])||1);
      const area=cols[3]||String(row.areaName||'').trim();
      if(target&&area) composition=`指定対象＋ランダム随伴,${target},${count},${area}`;
    }else if(formation.includes('ランダム編成') && !composition.startsWith('ランダム編成')){
      const area=String(row.areaName||'').trim();
      if(area) composition=`ランダム編成,${area}`;
    }
    row.questBossComposition=normalizeStoredEncounterComposition(composition);
  }
  return row;
}

function normalizeStateData(data){
  const out = data || {};
  // 旧版DBからの移行: material_groups は material_types へ寄せる。
  if(!Array.isArray(out.material_types) && Array.isArray(out.material_groups)) out.material_types = out.material_groups.map(r=>({id:String(r.id||'').replace('matgrp_','mtype_'), name:r.name||'', description:r.description||'', sortOrder:r.sortOrder||'', enabled:r.enabled||'TRUE', notes:r.notes||'', updatedAt:r.updatedAt||'', ownerKey:r.ownerKey||'', createdBy:r.createdBy||''}));
  DATA_KEYS.forEach(key=>{ if(!Array.isArray(out[key])) out[key]=[]; });

  const addUnique=(key,row,fields)=>{
    const sig=fields.map(f=>String(row[f]||'').trim()).join('|');
    if(!sig.replace(/\|/g,'')) return;
    if(!out[key].some(r=>fields.map(f=>String(r[f]||'').trim()).join('|')===sig)) out[key].push(row);
  };



  // 旧データ対策: 「素材ランク」を素材カテゴリ扱いで登録していた行は、素材ランク表へ移してアイテム一覧から除外する。
  const migratedRankIds = new Set();
  (out.items||[]).forEach(row=>{
    if(!row) return;
    if(String(row.dataKind||'').trim()==='素材' && String(row.materialCategory||'').trim()==='素材ランク'){
      const rankName = String(row.rank || row.name || '').trim();
      if(rankName){
        addUnique('material_ranks',{id:String(row.id||'').replace(/^mat_/,'mrank_'), name:rankName, price:row.price||'', description:row.effect||row.notes||'', sortOrder:'', enabled:'TRUE', notes:row.notes||'', updatedAt:row.updatedAt||'', ownerKey:'', createdBy:row.createdBy||''}, ['name']);
        if(row.id) migratedRankIds.add(String(row.id));
        row.__deleteAfterMigration = true;
      }
    }
  });
  out.items = (out.items||[]).filter(row=>!row.__deleteAfterMigration);

  // 旧アイテムカテゴリから新しいアイテム種別/カテゴリ/素材カテゴリへ移行。
  if(Array.isArray(data && data.item_categories)){
    const oldCats = data.item_categories;
    const byId = Object.fromEntries(oldCats.map(r=>[String(r.id||''), r]));
    oldCats.forEach(row=>{
      if(!row) return;
      if(row.name === 'モンスタードロップ') row.name = '魔物素材';
      const isMaterial = String(row.materialGroup||'').trim() || String(row.categoryType||'').includes('素材');
      if(isMaterial){
        addUnique('material_categories',{id:String(row.id||'').replace(/^cat_/,'mcat_'), name:row.name||'', materialType:row.materialGroup||'特殊素材', description:row.description||'', sortOrder:row.sortOrder||'', enabled:row.enabled||'TRUE', notes:row.notes||'', updatedAt:row.updatedAt||'', ownerKey:row.ownerKey||'', createdBy:row.createdBy||''}, ['materialType','name']);
      }else if(String(row.categoryType||'')==='大分類' && row.name && row.name!=='素材'){
        addUnique('item_types',{id:String(row.id||'').replace(/^cat_/,'itype_'), name:row.name||'', description:row.description||'', sortOrder:row.sortOrder||'', enabled:row.enabled||'TRUE', notes:row.notes||'', updatedAt:row.updatedAt||'', ownerKey:row.ownerKey||'', createdBy:row.createdBy||''}, ['name']);
      }else if(row.name){
        const parent = byId[String(row.parentId||'')] || {};
        addUnique('item_categories',{id:String(row.id||'').replace(/^cat_/,'icat_'), name:row.name||'', itemType:parent.name||row.itemType||'', description:row.description||'', sortOrder:row.sortOrder||'', enabled:row.enabled||'TRUE', notes:row.notes||'', updatedAt:row.updatedAt||'', ownerKey:row.ownerKey||'', createdBy:row.createdBy||''}, ['itemType','name']);
      }
    });
  }

  (out.items||[]).forEach(row=>{
    if(!row) return;
    if(row.category==='素材' || row.materialGroup || row.materialType || row.materialCategory){
      row.dataKind = row.dataKind || '素材';
      row.materialType = row.materialType || row.materialGroup || '';
      row.materialCategory = row.materialCategory || row.subcategory || '';
    }else{
      row.dataKind = row.dataKind || 'アイテム';
      row.itemType = row.itemType || row.category || '';
      row.itemCategory = row.itemCategory || row.subcategory || '';
      if(!String(row.csVisible || '').trim()) row.csVisible = 'TRUE';
    }
    if(row.category==='素材' && row.subcategory==='モンスタードロップ') row.subcategory='魔物素材';
    if(String(row.dataKind||'').trim()==='素材' || row.materialType || row.materialCategory){
      row.materialType = canonicalMaterialTypeName(row.materialType);
    }
  });

  (out.material_ranks || []).forEach(row=>{ if(row) row.name = numericRankValueIncludingLegacyMaterialGrade(row.name, 1); });
  (out.items || []).forEach(row=>{
    if(!row) return;
    row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1);
    if(String(row.toolRank ?? '').trim()) row.toolRank = numericRankValueIncludingLegacyMaterialGrade(row.toolRank, 1);
    if(String(row.guaranteeUpgradeMaxRank ?? '').trim()) row.guaranteeUpgradeMaxRank = numericRankValueIncludingLegacyMaterialGrade(row.guaranteeUpgradeMaxRank, 1);
    if(String(row.toolRank ?? '').trim()) row.rank = row.toolRank;
    if(isEquipmentItemRow(row)) row.upgradeMaterialMinRank = equipmentUpgradeMinimumRank(row);
    else { row.upgradeLimit = '0'; row.upgradeMaterialMinRank = ''; }
  });
  (out.recipes || []).forEach(row=>{
    if(!row) return;
    if(!String(row.recipePrice??'').trim() && String(row.limitedRecipePrice??'').trim()) row.recipePrice=row.limitedRecipePrice;
    row.limitedRecipePrice='';
    row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1);
  });
  (out.spells || []).forEach(row=>{ if(row) row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1); });
  (out.quest_rewards || []).forEach(row=>{ if(row) row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1); });
  (out.quests || []).forEach(row=>{ if(row){ row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1); normalizeEncounterPlacementRow('quests',row); } });
  (out.monsters || []).forEach(row=>{ if(row) row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1); });
  (out.treasure_tables || []).forEach(row=>{ if(!row) return; row.treasureRank = numericRankValueIncludingLegacyMaterialGrade(row.treasureRank, 1); if(String(row.scrollRank ?? '').trim()) row.scrollRank = numericRankValue(row.scrollRank, 1); });
  (out.appraisal_rules || []).forEach(row=>{ if(!row) return; if(String(row.scrollRank ?? '').trim()) row.scrollRank = numericRankValue(row.scrollRank, 1); if(String(row.spellRank ?? '').trim()) row.spellRank = numericRankValue(row.spellRank, 1); });

  (out.equipment_categories || []).forEach((row,idx,arr)=>{ if(row){ arr[idx]=migrateLegacyModifierFields(row); ensurePhysicalElementForWeapon(arr[idx]); } });
  (out.items || []).forEach((row,idx,arr)=>{ if(row){ if(!String(row.sellPrice??'').trim() && String(row.price??'').trim()) row.sellPrice=row.price; delete row.price; arr[idx]=ensureItemModifierFromCategory(row, out); ensurePhysicalElementForWeapon(arr[idx]); normalizeRowCheckType('items', arr[idx]); } });
  (out.recipes || []).forEach(row=>{
    if(!row) return;
    const recipeText = [row.category, row.tags, row.unlockFacility, row.description, row.effect].map(v=>String(v||'')).join(' ');
    if(!String(row.craftType || '').trim()){
      if(/武器|派生|強化/.test(recipeText)) row.craftType = '武器派生';
      else if(/鍛冶|防具|バッグ|金属|装備/.test(recipeText)) row.craftType = '鍛冶';
      else row.craftType = '調合';
    }
    if(row.baseItem === undefined || row.baseItem === null) row.baseItem = '';
    if(row.branchType === undefined || row.branchType === null) row.branchType = '';
  });
  (out.spells || []).forEach(row=>{ if(row){ row.power = normalizePowerForDb('spells', row.power); normalizeRowCheckType('spells', row); } });
  (out.event_tables || []).forEach(row=>{ if(row){ normalizeRowCheckType('event_tables', row); normalizeEncounterPlacementRow('event_tables',row); } });
  (out.monsters || []).forEach(row=>{
    if(!row) return;
    if(row.actions !== undefined) row.actions = serializeMonsterActions(parseMonsterActions(row.actions, row.hitValue));
    delete row.hitValue;
  });

  // 最新スキーマにない過去版の分類項目は画面状態から除外する。
  DATA_KEYS.forEach(key=>{
    out[key]=(out[key]||[]).map(row=>{
      const clean={};
      (SCHEMA[key]||[]).forEach(h=>clean[h]=row && row[h] !== undefined && row[h] !== null ? row[h] : '');
      return clean;
    });
  });
  return unifyEffectNotesForDisplayRows(out);
}
function prepareRowsBeforeSave(key){
  state[key].forEach(r=>{
    if(key === 'equipment_categories') Object.assign(r, migrateLegacyModifierFields(r));
    if(key === 'items') Object.assign(r, ensureItemModifierFromCategory(r, state));
    if((key === 'items' || key === 'spells' || key === 'equipment_categories')){
      r.power = normalizePowerForDb(key, r.power);
    }
    if(!String(r.description || '').trim() && String(r['説明'] || '').trim()) r.description = r['説明'];
    if(!String(r.effect || '').trim() && String(r['効果'] || '').trim()) r.effect = r['効果'];
    delete r['説明']; delete r['効果'];
    r.updatedAt=nowIso(); markRowOwnership(r);
  });
}
function toast(msg, type='ok'){
  const t=$('toast'); t.textContent=msg; t.className='toast show '+type;
  clearTimeout(window.__toastTimer); window.__toastTimer=setTimeout(()=>t.className='toast',3200);
}
function escapeHtml(s){ return String(s ?? '').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

const FACILITY_DEFS = [
  {
    id:'smithy', name:'鍛冶屋',
    role:'炉と作業台を備えた鍛冶職人の店。武器や防具の製作から素材加工、装備強化まで幅広く請け負う。',
    services:[
      {name:'鍛冶施設利用', price:'レシピ依存', description:'備え付けの炉と道具を借りて作業できるほか、素材と依頼費を渡せば職人に製作を任せられる。'},
      {name:'仕掛け製作', price:'レシピ依存', description:'細工道具を使う戦闘用の仕掛けを作る。素材と依頼費を渡して職人へ製作を頼むこともできる。'},
      {name:'装備強化', price:'素材ランク・強化回数依存', description:'素材の性質を武具へ馴染ませ、性能を引き上げる。依頼時は素材に応じた加工費が必要。'},
      {name:'装備強化の全解除', price:'装備ランク・消費枠・効果依存', description:'武具に馴染ませた強化を一度にすべて外し、再び強化できる状態へ戻す。'},
      {name:'クリスタル強化', price:'段階別', description:'必要な素材を使ってスキルクリスタルを調整し、装着できる力の枠を広げる。'}
    ]
  },
  {
    id:'pharmacy', name:'薬屋',
    role:'薬草の香りが漂う小さな店。薬品や調合素材を扱い、持ち込まれた素材の調合も請け負う。',
    services:[
      {name:'調合施設利用', price:'レシピ依存', description:'店の調合器具を借りて自分で作るか、素材と依頼費を渡して調合を任せられる。'}
    ]
  },
  {
    id:'eatery', name:'食事処',
    role:'店主マリエッタが旅人の腹を満たす食事処。各地で得た食材を生かした料理が日ごとに並ぶ。',
    services:[
      {name:'今日のおすすめ', price:'料理別', description:'その日に用意できる食材から三品が並ぶ。食材の持ち込みは不要で、料理ごとの代金を支払う。'},
      {name:'食材持ち込み調理', price:'料理別', description:'必要な食材を持ち込めば、少額の調理代で指定した料理に仕立ててもらえる。'}
    ]
  },
  {
    id:'inn', name:'宿屋',
    role:'旅人が身体を休め、街や周辺の噂を集められる宿。冒険者向けの情報も自然と集まってくる。',
    services:[
      {name:'宿泊', price:'45G', description:'一晩ゆっくり休み、翌朝にはHPとMPを全回復し、疲労も取り除く。'},
      {name:'休息', price:'30G', description:'短い休息を取り、HPとMPを全回復する。日付は進まず、疲労はそのまま残る。'},
      {name:'噂を聞く', price:'0〜10G', description:'旅人や宿の者から、依頼・探索地・素材・魔物にまつわる噂を聞く。'}
    ]
  },
  {
    id:'antique', name:'骨董屋',
    role:'古い巻物や術式用品、不思議な結晶に加え、魔物素材を用いた骨董装備ガチャも扱う骨董屋。価値の分からない品の鑑定も引き受ける。',
    services:[
      {name:'スクロール鑑定', price:'★1 150G〜', description:'未鑑定の巻物を調べ、その内側に封じられた術式を明らかにする。鑑定具を使って自分で見極めることもできる。'},
      {name:'集中術式化', price:'施設依頼不可', description:'鑑定済みの巻物へ魔導インクや祈祷紙を用い、自ら集中して術式として定着させる。'},
      {name:'骨董装備ガチャ', price:'魔物素材の★合計', description:'武器種・防具種と★帯を指定し、来歴不詳の骨董装備を抽選する。個体ごとに基礎性能・属性・強化枠・固定強化内容が異なる。抽選後の強化追加・変更は不可。'},
      {name:'スキルガチャ', price:'共鳴用素材の★合計', description:'共鳴する素材を結晶へ捧げ、その時点で扱える力の中から一つを引き出す。'}
    ]
  },
  {
    id:'copyist', name:'レシピ販売',
    role:'各地で見つかった書付や職人の写本を扱う小さな店。日ごとに六つのレシピが店先へ並ぶ。',
    services:[
      {name:'日替わりレシピ販売', price:'レシピ別', description:'その日の仕入れから六つのレシピが並ぶ。常設の店では見かけない、宝箱から見つかるような珍しい写本も扱う。'}
    ]
  },
  {
    id:'guild', name:'ギルド',
    role:'冒険者向けの依頼が集まる受付所。クエストの表示・抽選・進行操作は進行管理HTMLに集約している。',
    services:[
      {name:'重要クエスト受付', price:'0G', description:'街や探索地の先へつながる、重要な一度きりの依頼を受け付ける。'},
      {name:'デイリークエスト掲示', price:'0G', description:'その日に持ち込まれた拠点内の仕事、探索地の依頼、納品の頼み事を掲示する。'}
    ]
  }
];
const ADMIN_FORTUNE_ROWS=[
 {from:1,to:4,name:'星巡りの幸運',oracle:'遠い星々が、今日はあなたの歩みに寄り添っているようです。',effect:'1日1回、判定前に宣言して任意の判定+2。'},
 {from:5,to:7,name:'双星の祝福',oracle:'二つの星が同じ道を照らしています。小さな幸運を分けて使うとよいでしょう。',effect:'1日2回、判定前に宣言して任意の判定+1。'},
 {from:8,to:10,name:'運命輪の巡り',oracle:'止まっていた輪が、ほんの少しだけあなたの方へ回り始めました。',effect:'1日1回、失敗した判定を振り直す。振り直した結果を採用する。'},
 {from:11,to:16,name:'剣星の導き',oracle:'刃の先に細い光が見えます。狙いを定めるなら今日でしょう。',effect:'1日2回、命中判定+1。'},
 {from:17,to:22,name:'隠者の灯火',oracle:'見落としていた足跡を、小さな灯りが照らしてくれそうです。',effect:'1日2回、探索・感知・追跡のいずれかの判定+1。'},
 {from:23,to:28,name:'豊穣杯の恵み',oracle:'満ちた杯は、手を伸ばした者へ少し多くの実りを返します。',effect:'1日2回、採取判定+1。'},
 {from:29,to:34,name:'魔術師の指先',oracle:'今日は道具がよく手になじむ日。細かな仕事ほど冴えるでしょう。',effect:'1日2回、調合・細工・設計のいずれかの判定+1。'},
 {from:35,to:39,name:'獅子座の加護',oracle:'胸の奥に力が満ちています。身体を使う仕事なら追い風になるでしょう。',effect:'1日2回、力業・運動のいずれかの判定+1。'},
 {from:40,to:45,name:'梟書の啓示',oracle:'閉じた頁の間から、必要な答えだけが覗いています。',effect:'1日2回、知識判定+1。'},
 {from:46,to:54,name:'暁星の兆し',oracle:'最初の一歩だけ、夜明けの星が強く照らしてくれます。',effect:'その日の最初に行う判定+1。'},
 {from:55,to:62,name:'均衡の天秤',oracle:'わずかな傾きが結果を変える日。最後のひと押しを見逃さないで。',effect:'1日1回、判定後・成否確定前に達成値+1。'},
 {from:63,to:70,name:'幸運の残り火',oracle:'小さな火は消えにくいもの。役目を果たすまで手元に残るでしょう。',effect:'1日1回、判定前に宣言して判定+1。その判定に失敗した場合、この運勢の使用回数を消費しない。'},
 {from:71,to:78,name:'薄雲の影',oracle:'薄い雲が一度だけ光を遮ります。避けるより、軽いうちに通り過ぎるのがよさそうです。',effect:'その日のうち1回、任意の判定に-1を適用しなければならない。未消費のまま1日を終えた場合、翌日の最初の判定に-1を強制適用する。'},
 {from:79,to:84,name:'絡み糸の兆し',oracle:'細い糸が二度、足元へ絡みます。大事な場面まで残さない方がよいでしょう。',effect:'その日のうち2回、任意の判定に-1を適用しなければならない。未消費分が残ったまま1日を終えた場合、残り回数を翌日に持ち越し、翌日の最初の判定から1回ずつ-1を強制適用する。'},
 {from:85,to:89,name:'欠けた杯',oracle:'器の縁に小さな欠けがあります。今日は手仕事と採集に少し注意を。',effect:'その日のうち1回、調合・細工・採取のいずれかの判定に-2を適用しなければならない。未消費のまま1日を終えた場合、翌日の最初の判定に-2を強制適用する。'},
 {from:90,to:95,name:'迷い月の囁き',oracle:'月の光が道を二つに見せています。手掛かりを追う時ほど迷いが入りそうです。',effect:'その日のうち1回、探索・感知・追跡のいずれかの判定に-2を適用しなければならない。未消費のまま1日を終えた場合、翌日の最初の判定に-2を強制適用する。'},
 {from:96,to:98,name:'黒星の宣告',oracle:'黒い星がひとつ落ちています。避け切るより、受ける場所を選ぶべき日です。',effect:'その日のうち1回、任意の判定に-2を適用しなければならない。未消費のまま1日を終えた場合、翌日の最初の判定に-2を強制適用する。'},
 {from:99,to:100,name:'崩塔の凶兆',oracle:'高く積み上げたものほど、小さな揺らぎを恐れるもの。今日は足元をよくご覧なさい。',effect:'その日のうち3回、任意の判定に-1を適用しなければならない。未消費分が残ったまま1日を終えた場合、残り回数を翌日に持ち越し、翌日の最初の判定から1回ずつ-1を強制適用する。'}
];
let currentAdminFortune=null;
function adminFortuneCopyText(row=currentAdminFortune){
  if(!row)return '';
  return `【今日の運勢】
${row.name}
${row.effect}`;
}
function renderAdminFortuneResult(){
  const box=$('facilityFortuneResult');
  const copy=document.querySelector('[data-fortune-copy]');
  if(!box)return;
  if(!currentAdminFortune){box.innerHTML='<span class="muted">まだ運勢を振っていません。</span>';if(copy)copy.disabled=true;return;}
  const row=currentAdminFortune;
  box.innerHTML=`<div class="fortune-roll">1D100：${row.roll}</div><div class="fortune-name">${escapeHtml(row.name)}</div><div class="fortune-oracle">${escapeHtml(row.oracle)}</div><div><b>効果：</b>${escapeHtml(row.effect)}</div>`;
  if(copy)copy.disabled=false;
}
function rollAdminFortune(){
  const roll=Math.floor(Math.random()*100)+1;
  const row=ADMIN_FORTUNE_ROWS.find(r=>roll>=r.from&&roll<=r.to)||ADMIN_FORTUNE_ROWS[ADMIN_FORTUNE_ROWS.length-1];
  currentAdminFortune={...row,roll};
  renderAdminFortuneResult();
  return currentAdminFortune;
}


const SYSTEM_HELP = [
  {
    "title": "施設",
    "tags": [
      "鍛冶屋",
      "薬屋",
      "宿屋",
      "NPC"
    ],
    "body": [
      "基本施設は鍛冶屋、薬屋、食事処、宿屋、骨董屋、レシピ販売、ギルド。",
      "鍛冶屋は武器、盾、防具、バッグ、矢筒、鍛冶素材、戦闘用罠、細工道具、鍛冶・仕掛け製作施設利用を扱う。",
      "薬屋はポーション系、薬品系調合品、調合素材、調合施設利用を扱う。",
      "食事処は、パーティーの解放エリアに応じた今日のおすすめ3品と、必要食材を持ち込んで作る料理を扱う。今日のおすすめは食材不要で、管理HTMLから再抽選できる。",
      "レシピ販売の本日の品揃えは管理HTMLで選出・コピーする。選出6枠のうち1枠は指定エリア、残り5枠は選択した解放済みエリア全体から完全ランダムで選ぶ。候補は常設店売りされず、ボス以外の宝箱から実際に入手できるレシピだけとし、料理・装備強化・装飾品強化・クリスタル強化・ボス専用レシピは含めない。",
      "料理は各エリア5品を基本とし、その5品を持ち込み料理と今日のおすすめ候補の両方に使用する。",
      "料理材料は食材カテゴリに限定せず、丸茸など用途タグが「食用可能」の採取素材・魔物素材も使用できる。",
      "宿屋は宿泊45G、休息30G、噂、クエスト情報を扱う。休息は1行動を消費してHP/MPを全回復し、宿泊は一日を終了してHP/MP全回復・疲労度0にする。",
      "骨董屋は未鑑定スクロールの高額ランダム販売、施設鑑定、魔物素材を使う骨董装備ガチャ、魔導インク・祈祷紙・術式鑑定具・聖印・魔印の常設販売を扱う。骨董装備ガチャは管理HTMLのモーダルで解放済み通常エリア・異界を指定し、装備区分・武器種/防具種・★帯を選んで骨董屋専用個体を抽選する。既存装備を素体にはせず、個体ごとに基礎性能・属性（対応武器のみ）・強化枠・固定強化内容が変化し、抽選後の強化追加・変更はできない。通常強化に加えて骨董品限定強化が低確率で付く。ボス装備・ボス素材は候補外とし、店頭では未鑑定スクロールの中身を公開しない。",
      "重要クエストの戦闘は4人を基準にし、サポートを含む2人相当を下限として出現数を調整する。人数は公開クエスト本文には表示しない。",
      "戦闘デイリーは1人から受注でき、重要クエストより軽い人数補正を使う。採取・納品・調査などの非戦闘デイリーは人数で条件を増減させない。",
      "スクロール鑑定は鑑定技能で行う。術式化の自力判定は集中で行う。",
      "魔法スクロールの術式化には魔導インクを、祈祷スクロールの術式化には祈祷紙を使う。術式化は集中技能のみで行い、施設へは依頼できない。",
      "雑貨屋は現時点では使用しない。",
      "施設NPCは、リネット、ガルド・ヴェルナー、マリエッタ・ロゼル、ミレイユ・オルセーヌ、ロジーナ・エルメル。",
      "リネットは拠点と工房の案内役。",
      "ガルド・ヴェルナーは鍛冶屋担当。",
      "ミレイユ・オルセーヌは薬屋担当。",
      "ロジーナ・エルメルは宿屋担当。"
    ]
  },
  {
    "title": "倉庫・所持品・バッグ",
    "tags": [
      "倉庫",
      "所持品",
      "バッグ"
    ],
    "body": [
      "旧所持品は倉庫。旧携行品は所持品。",
      "倉庫は保管上限なし。スタック数や枠数を気にせず最大限所持できる。",
      "冒険中に使用できるのは所持品に入っているアイテムのみ。",
      "バッグは倉庫内アイテムから選択する。",
      "バッグに設定された容量に応じて、キャラシート側の所持品枠数が変化する。",
      "初期バッグは簡素なバッグ。バッグ容量は8。",
      "採取袋は使用しない。袋カテゴリも使用しない。"
    ]
  },
  {
    "title": "道具カテゴリ",
    "tags": [
      "道具",
      "調合",
      "鍛冶"
    ],
    "body": [
      "道具カテゴリは戦闘、調合、鍛冶、その他。",
      "調合道具と鍛冶道具は細かく分割しない。",
      "調合と鍛冶は施設を借りられる前提。",
      "採取道具セット、採掘道具セット、探索道具セットは現時点では使用しない。",
      "武器と防具の破損、修理ルールは現時点では扱わない。",
      "調合道具と鍛冶道具は、アイテムランクと使用可能上限ランクを分けて登録する。",
      "素材を含むランクは1以上の数値で管理し、プレイヤー表示は★Nとする。",
      "調合道具は旅薬師の乳鉢具、硝子秤の調合具、晶瓶の調合具、星滴の蒸留具、月環の錬成具。",
      "鍛冶道具は野鍛冶の槌箱、焼入れ金床具、鋼噛み火ばさみ具、星鉄火ばさみ具、竜炉の鍛冶具。",
      "道具は★3、★6、★9、★12、★15以下のように複数ランクをまとめて扱う。レシピ側に要求道具ランクは設定しない。",
      "作成するレシピまたは装備強化に使う素材のランクが、道具の使用可能上限以下なら使用できる。上位道具による難易度軽減は通常の作成・加工・装備強化に適用する。",
      "装備強化は、強化回数で自作目標値と施設依頼成功率を算出する。施設依頼価格は素材基準価格・今回消費枠・装備ランク・現在の使用済み枠から算出する。自作用の道具補正は施設依頼成功率へ適用しない。",
      "作成補助材は対応する自作判定で任意個数を追加消費し、1個につき作成難易度－2。調合安定剤＝調合、機巧調整剤＝設計、工作定着剤＝武装・装備強化以外の細工、武装融和剤＝武器作成・武器派生、強化定着剤＝装備強化。道具軽減と重複し、施設依頼には適用しない。",
      "調合道具は薬屋、鍛冶道具は鍛冶屋で扱う。"
    ]
  },
  {
    "title": "店売り・初期販売",
    "tags": [
      "店売り",
      "初期武器",
      "防具",
      "矢筒"
    ],
    "body": [
      "鍛冶屋では、DB上の初期所持品タグ付き武器を購入可能にする。",
      "初期販売武器はショートダガー、ロングソード、ハンドアックス、ウォーハンマー、ショートスピア、ウッドスタッフ、ショートボウ、クロスボウ、ヘヴィクロスボウ、ロングスピア、グレートソード、グレートハンマー。",
      "鍛冶屋販売枠としてバトルサイズ、アイアンガントレットも扱う。",
      "防具の商品名はカテゴリ名をそのまま使わない。",
      "初期販売防具は、旅風のジャケット、鉄紐のベスト、鋲打ちの胴衣、星糸のケープ、祈り布のストール。",
      "普段着は0Gの初期装備扱い。店売り防具にはしない。",
      "矢筒は初期配布しない。鍛冶屋販売品にする。"
    ]
  },
  {
    "title": "矢弾・矢筒",
    "tags": [
      "遠距離武器",
      "矢弾",
      "矢筒",
      "スタック"
    ],
    "body": [
      "遠距離武器は通常攻撃でも矢弾を1つ消費する。",
      "矢弾がない場合、対応する遠距離武器で攻撃できない。",
      "矢弾は種類ごとに管理する。",
      "矢弾は種類ごとに最大スタック数を持つ。",
      "矢弾を矢筒に入れない場合、1種類につき所持品枠を1枠使う。",
      "初期遠距離武器を選んだ場合、対応する通常矢弾を最大スタック数分だけ初期支給する。",
      "通常矢は最大20。通常ボルトは最大20。大型ボルトは最大10。",
      "特殊矢弾の最大スタック数は効果に応じて個別に設定する。",
      "矢筒は装備枠『矢筒』に装備する。",
      "矢筒自体は所持品枠を消費しない。",
      "矢筒に入れた矢弾は所持品枠を消費しない。",
      "簡素な矢筒は2種類、旅人の矢筒は3種類、狩人の矢筒は4種類の矢弾を収納できる。",
      "キャラシート側では、矢筒を装備した場合、収納種類数ぶんの矢弾枠を入力する。"
    ]
  },
  {
    "title": "レシピ・武器派生",
    "tags": [
      "レシピ",
      "武器派生",
      "鍛冶"
    ],
    "body": [
      "レシピはDB上では1表で管理する。",
      "管理HTML上では、調合レシピ、鍛冶レシピ、仕掛け製作、武器派生、防具製作、バッグ製作、素材加工に分けて表示する。プレイヤー施設の武器派生は武器種選択モーダルの横書きボタンで選択し、「全て」も選べる。武器種ボタンを押した時点で表示を切り替え、素材系統を縦、★ランクを横にした派生図で表示する。順当強化と分岐は派生元から矢印で接続し、素材やエリアだけを理由に派生名を増やさず、分岐は派生元の直下へ配置する。同じ★ランクでの順当強化は連続2個までとし、別派生へ降りた後に元の派生列へ戻る接続は作らない。草角・樹心・沼核・穿王・反照のボス素材武器は、素手を除く全17武器カテゴリへ必ず用意する。",
      "各エリアボスには、ボス素材を使う防具または装飾品も必ず用意する。通常魔物素材の★2派生は横方向の選択肢として追加し、ボス派生の必須前提にはしない。",
      "武器派生の魔物素材要求量は、★2で合計1～2個、★3で合計2～3個を目安とする。既存の複合素材派生は維持してよい。",
      "★3以降は複数の魔物素材を要求してよいが、ボス固有素材は原則1個のままとし、大量周回を前提にしない。",
      "鉱石を主題とする鉱山鋼派生などは、魔物素材を要求しない例外にしてよい。",
      "武器上位化は、初期武器や基礎武器から素材で派生する方式。",
      "武器派生はモンハンに近い素材派生として扱う。",
      "武器派生を含む作成可能品には対応レシピを用意する。",
      "自作ではレシピ、素材、道具、製作判定が必要。施設依頼ではレシピ不要。",
      "属性派生を全属性分作る方針にはしない。物属性派生は基礎火力を維持し、属性を持つ派生は同格の物属性派生より基礎威力を少し低くする。",
      "弓・クロスボウ・ヘヴィクロスボウの攻撃属性は矢弾依存とし、一部の派生だけが特定属性の矢・ボルトへ命中・ダメージなどの適性を持つ。武器の属性は派生武器自体の性能として設定し、魔物素材による後付けの属性付与は行わない。攻撃属性は物・火・水・風・雷・光・闇・無の8種のみとし、可変属性は使用しない。武器の効果文言は同じ処理なら同じ表現へ統一し、外観説明は現武器単体の素材・形状・意匠を中心に書いて派生元武器名を安易に入れない。"
    ]
  },
  {
    "title": "魔物素材・装備強化",
    "tags": [
      "魔物素材",
      "装備強化",
      "武器",
      "防具",
      "equipmentUpgradeEffect"
    ],
    "body": [
      "魔物素材には、装備強化に使用した際の効果名と効果説明を専用項目へ設定する。一般の効果欄には重複記載しない。",
      "魔物素材はすべて何かしらの装備強化内容を持つ。",
      "魔物素材は装備強化内容・効果説明・強化対象の3項目を必須とし、未設定のまま保存またはDB送信できない。",
      "効果が複数の素材で重複しても問題ない。",
      "威力強化・命中強化・防御強化などの通常強化は、同名でも同一装備へ複数付与でき、段階数または合計値として累積する。",
      "同名効果の重複不可は素材固有の特殊効果だけに適用する。",
      "装備強化内容は選択式の項目『equipmentUpgradeEffect / 装備強化内容』で管理する。",
      "装備強化は『equipmentUpgradeEffect / 装備強化内容』へ効果名を、『equipmentUpgradeDetail / 効果説明』へ実際の処理を記録する。独立した数値項目は使用しない。",
      "装備強化内容は、直接補正の名称、属性効果、特殊効果、その他に分類する。",
      "武器用の例：威力強化、威力固定強化、命中強化、術式枠拡張、術式省力化、回復量強化、回復量固定強化、特殊効果。武器には魔導書・祈祷書を含む。",
      "防具用の例：防御値(防具)、防御行動値(防具)、回避補正(防具)、属性効果、特殊効果(防具)。",
      "防具の防御系強化は、キャラシのステータス名に準拠して防御値と防御行動値を分ける。",
      "防御値(防具)は、通常時から適用されるダメージ軽減値を上げる。",
      "防御行動値(防具)は、行動として防御した時の追加軽減値を上げる。",
      "回避補正(防具)は、装備による回避値の補正を上げる。",
      "防御値(防具)は強力な強化として扱い、低ランク素材では原則付与しない。",
      "低ランク素材の防具強化は、防御行動値、回避補正、属性効果、特殊効果を基本とする。",
      "硬い甲殻や金属殻など、常時の硬さを明確に表す素材だけ防御値(防具)を持たせる。",
      "強化内容は、何が上がるのか、何が付与されるのかを表す。",
      "補正値・属性・耐性・固有効果は、効果名と効果説明の組み合わせで表す。",
      "例：装備強化内容『威力強化』、効果説明『1段階は+1、2段階は+1D2、3段階は+1D3としてダメージへ追加する。』。",
      "武器へ属性を後付けする強化内容は使用しない。",
      "例：装備強化内容『防御行動強化』、効果説明『防御行動中のみ防御行動値+1。』。",
      "例：装備強化内容『回避強化』、効果説明『回避値+1。』。",
      "例：装備強化内容『水耐性付与』、効果説明『水属性に「耐」を得る。』。",
      "武器は素材による派生や強化に反映する。",
      "防具は派生式ではなく、購入または作成した防具を後から強化する方式。",
      "制作と購入の両方が可能な商品は、店頭購入価格を必要素材の価格合計＋施設制作費より高く設定する。",
      "実際の攻撃属性は、物、火、水、風、雷、光、闇、無の8種だけを使用する。『可変』は使用禁止。弓・クロスボウ・ヘヴィクロスボウのみ、使用する矢・ボルトで決まる表示補助『矢弾依存』を使用する。",
      "採取素材・加工素材・特殊素材など、魔物素材ではない素材は装備強化内容・消費強化枠・効果説明・強化対象をすべて空欄にし、一般の効果欄にも装備強化内容を記載しない。",
      "魔物素材の特徴が装備性能に出るように、素材ごとに分かりやすい装備強化名と効果説明を設定する。",
      "ドロップ判定やドロップ入手の出力では、素材の説明、効果、売値などを表示してよい。",
      "ドロップ出力では、装備強化内容と効果説明は表示しない。",
      "装備強化内容・効果説明・強化対象は、施設タブの強化項目と素材の情報コピーで確認できる。",
      "特殊効果を付与する魔物素材は、発動条件・対象・補正値・持続または解除条件・重複可否を特殊効果詳細へ具体的に記載し、施設表示と情報コピーへ出す。"
    ]
  },
  {
    "title": "魔物データ",
    "tags": [
      "魔物",
      "属性耐性",
      "ドロップ",
      "行動"
    ],
    "body": [
      "魔物は物、火、水、風、雷、光、闇、無の8属性に対する相性を持つ。",
      "魔物種別は粘体・獣・虫・植物・爬虫・水棲・軟体・霊体・造魔・竜・異界の大分類で管理する。飛行・甲殻・異界・鉱質などは魔物特性へ分ける。",
      "魔物素材カテゴリは魔物種別と同じ大分類を使用し、派生候補を種別から探せるようにする。",
      "属性相性は、通常、耐、無、反、吸、弱で管理する。",
      "山麓の旧鉱山以降に初登場する通常魔物の魔物素材は、基本ドロップを★3、ドロップ率20%のレア固有素材だけ★4にする。20%以外の通常素材を★4にしない。エリアボス固有素材は対象外。",
      "耐はダメージ半減。",
      "無はダメージ0、属性効果なし。",
      "反はダメージ0、受けるはずだったダメージを攻撃者へ返す。",
      "吸はダメージ0、受けるはずだったダメージ分だけHPを回復する。",
      "弱はダメージ2倍。",
      "魔物の行動は1行動1行で管理する。",
      "魔物本体には共通の命中値を持たせず、判定を行う各行動ごとに固有の基礎技能値を設定する。チャットパレットは「2D6+基礎技能値+{補正}>=参照値」の形で出力し、{補正}には妨害・バフ・デバフ・一時的なパッシブ効果など戦闘中に変動する値だけを加算する。",
      "行動ごとの基礎技能値と威力は独立して評価する。基礎技能値だけを理由にダメージを機械的に上下させず、エリア難易度・対象数・追加効果・防御貫通・予告の有無・期待値と振れ幅を合わせて個別に決める。高技能低威力・低技能高威力・抵抗参照だけ低技能など、役割に応じて個別設定してよい。",
      "魔物の基礎直接ダメージ式と武器の基礎ダメージ式はD6を必須とし、最大構成をxD6+yD2～D5+zとする。D2～D5はD6へ追加する補助ダイスとしてのみ使用でき、補助ダイスを含む場合はy<=xを必須とする。固定値zは0以上のみとし、ダメージ式へのマイナス固定値は禁止。D2～D5だけの基礎ダメージ式は禁止。毒などの継続ダメージと、条件成立時に別途加算される追加ダメージはこの式制限の対象外。D2～D5の使用自体は強制せず、D2は小さい振れ幅、D3は軽～中程度、D4は標準的な補助、D5は大きめの振れ幅を持たせたい攻撃に使い分ける。",
      "防御・補助・回復行動も自動成功にせず、行動ごとの基礎技能値を使う『技能値>=固定達成値』判定を設定する。失敗時はその行動の防御・強化・回復・準備効果を適用しない。妨害などの変動補正は{補正}へ加算し、この判定にも適用する。",
      "通常魔物は役割に必要な行動だけを登録し、選択可能な行動が4個以上なら遭遇時に3個を選出する。3個なら全て使用する。二つ名個体も3～4個なら全て使用し、選択可能な行動が5個以上なら遭遇時に4個を選出してよい。ボスは4個固定。固有パッシブは技数に含めない。固定選出技は戦闘コンセプトの成立に不可欠な場合だけ指定し、固有パッシブ参照技を一律に固定しない。準備・連携などで別行動を明示参照する場合は、参照関係が成立する組み合わせだけを選出候補にする。",
      "エリアボスは、前衛が残っている状態でも後衛へ直接ダメージを与えられる行動を最低1つ必ず持つ。後衛へ届くかは行動種別ではなく距離で判定し、原則として距離：遠距離の直接ダメージ行動を用意する。通常は距離：近距離だが固有パッシブや事前効果で後衛まで対象拡張される行動をこの条件へ含める場合は、その拡張条件を効果文へ明記する。状態異常や弱体だけの行動はこの条件を満たさない。",
      "準備と次ターンの大技で構成される予告攻撃は、2段階を1つの技として同じ行に登録する。",
      "魔物行動は行動種別と距離を別々に管理する。種別は近接攻撃、遠距離攻撃、防御、補助、回復、特殊。術式・祈祷は魔物の種別には使用しない。距離は近距離、遠距離、自身。近距離は敵前衛のみ、遠距離は敵前衛・敵後衛を対象にできる。近接攻撃は前衛へ出て行動する。遠距離攻撃は自身以外の味方前衛がいれば後衛へ下がり、いなければ前衛で行動する。攻撃以外は原則その場で処理し、自身以外の味方前衛がいない場合だけ前衛へ移動する。",
      "魔物の判定は行動種別にかかわらず、その行動に設定された基礎技能値を使用する。判定欄は『技能値>=回避値』『技能値>=抵抗値』『技能値>=固定達成値』で参照先を示す。",
      "ドロップはメモ式ではなく行単位で管理する。",
      "ドロップ素材は魔物素材カテゴリから選択する。"
    ]
  },
  {
    "title": "戦闘の基本",
    "tags": [
      "戦闘",
      "行動",
      "ダメージ"
    ],
    "body": [
      "戦闘中は移動だけが行動を消費せず、それ以外の攻撃、力業、術式、祈祷、防御、かばう、妨害、鼓舞、解析、道具使用などはターンを消費する。",
      "通常は移動後に、ターンを消費する行動を1回行う。装備効果だけで追加の攻撃行動や反撃行動を発生させない。",
      "戦闘後処理として、採取やドロップチェックを扱う。",
      "防御と回避は別処理。",
      "防御は攻撃を受け止めてダメージを減らす行動。",
      "回避は攻撃を避ける判定。"
    ]
  },
  {
    "title": "防御",
    "tags": [
      "防御",
      "防御値",
      "防御行動値",
      "防御技能"
    ],
    "body": [
      "防御値は、通常時にも適用されるダメージ軽減値。",
      "防御行動値は、行動として防御を選んだ時にだけ使う追加軽減値。",
      "防御行動値が1D6なら、防御行動時に1D6点ダメージを軽減する。",
      "防御技能に振り分けたポイントは、防御行動の有無にかかわらず常時ダメージを軽減する。",
      "通常時の最終ダメージは、受けるダメージ - 防御値 - 防御技能ポイント。",
      "防御行動時の最終ダメージは、受けるダメージ - 防御行動値 - 防御技能ポイント - 防御値。",
      "防御行動そのものに判定は行わない。",
      "防御は回避ではない。攻撃を受け止めてダメージを減らす行動。",
      "最終ダメージは0未満にならない。"
    ]
  },
  {
    "title": "かばう",
    "tags": [
      "かばう",
      "防御技能",
      "先制値"
    ],
    "body": [
      "かばうは、味方への攻撃に割り込んで自分が攻撃を引き受ける行動。",
      "かばう判定は、防御技能 >= 敵の先制値。",
      "成功した場合、攻撃対象を自分に変更する。",
      "成功後、自分が防御行動を取ったものとしてダメージを軽減する。",
      "かばう成功時の最終ダメージは、受けるダメージ - 防御行動値 - 防御技能ポイント - 防御値。",
      "単体攻撃はかばえる。",
      "複数対象攻撃は、対象のうち1人分だけかばえる。",
      "範囲攻撃は状況次第で1人だけかばえる。",
      "全体攻撃は原則かばえない。",
      "攻撃行動ごとにかばう難易度は変えない。成功難易度は敵の先制値で決める。"
    ]
  },
  {
    "title": "妨害",
    "tags": [
      "妨害",
      "先制値",
      "判定補正"
    ],
    "body": [
      "妨害は、敵の攻撃、移動、詠唱、道具使用、逃走などを邪魔する行動。",
      "妨害判定は、使用技能 >= 敵の先制値。",
      "使用技能は妨害内容に応じて決める。",
      "武器で牽制する場合は近接または射撃。",
      "押さえ込む、突き飛ばす場合は力業。",
      "詠唱や術式を邪魔する場合は魔法、知識、状況に合う技能。",
      "注意を引く、挑発する場合は交渉、社交、鼓舞など。",
      "妨害成功時、攻撃、術式、祈祷などの判定に-2を与える。",
      "移動、逃走、準備行動、道具使用など、-2しても意味が薄い行動は、GM判断で中断、停止、遅延にする。",
      "妨害失敗時、敵は通常通り行動する。",
      "妨害失敗時の追加ペナルティは基本なし。"
    ]
  },
  {
    "title": "武器攻撃・力業攻撃",
    "tags": [
      "武器攻撃",
      "力業",
      "近接",
      "射撃"
    ],
    "body": [
      "通常の近接武器攻撃は近接を使う。",
      "通常の遠距離武器攻撃は射撃を使う。",
      "力業攻撃は、近接武器攻撃の命中で近接の代わりに力業を使う攻撃。",
      "力業攻撃に命中した場合、武器ダメージのダイスを+1個する。",
      "力業攻撃のダメージ計算は、通常の武器攻撃と同じ。",
      "ダメージに加算する技能ポイントは近接を参照する。",
      "力業ポイントはダメージ加算には使わない。",
      "力業攻撃を行った場合、成否に関わらず次ターン行動不可。",
      "さらに次ターン終了まで防御-2。",
      "このデメリットは、力任せの大振りによって体勢が崩れることを表す。"
    ]
  },
  {
    "title": "術式・祈祷",
    "tags": [
      "術式",
      "祈祷",
      "属性",
      "防御判定"
    ],
    "body": [
      "初期魔法術式は魔力弾のみ。",
      "初期祈祷は癒しの祈りのみ。",
      "初期魔法術式と初期祈祷は全員が取得する。",
      "術式と祈祷には属性を設定する。",
      "魔導書のセット術式枠は、1 + 魔法に割り振ったポイント。",
      "祈祷書のセット術式枠は、1 + 祈祷に割り振ったポイント。",
      "セット術式とセット祈祷は、所持している術式データから選択する。",
      "火球、氷槍、雷撃、光弾、闇弾、爆発範囲などの攻撃・投射・範囲系魔法は回避で防ぐ。",
      "毒・汚染・呪い・火傷などの状態異常系効果は抵抗または各行動に指定された判定で防ぐ。敵からPCへの状態異常は蓄積せず、1回の判定で付与する。魔物が後衛を対象にできる行動では、PC側の後衛狙い判定-2を適用しない。状態異常の説明には、その状態そのものの効果と自然解除条件だけを書く。解除できるアイテム名・祈祷名・その他の回復手段は列挙しない。解除手段は各アイテム・祈祷・行動側の効果文で管理する。同一個体の行動は、威力・命中・対象範囲・追加効果・貫通・自己強化/自己リスクを合わせて評価し、実質上位互換を作らない。差別化のために弱い側の直接ダメージを安易に上げず、命中・効果・対象・貫通・条件で差を作るか、強い側の直接火力を下げて調整する。毒はラウンド終了時に1D3の無属性・防御無視ダメージ、火傷はラウンド終了時に1D3の火属性・防御無視ダメージを受け、どちらも戦闘終了後に解除する。汚染はHP回復量-2、呪いは攻撃・魔法・祈祷判定-1。状態名が同じという理由だけで一律に重複禁止にはせず、同一の技・行動から付与された同じ効果は重複しない。別の技・行動による同種効果は、個別に重複禁止が指定されていない限り別枠で扱う。",
      "魔物行動も同じ基準とし、攻撃・投射・範囲攻撃は回避、身体・精神・状態異常系効果は抵抗を達成値にする。",
      "効果文に「抵抗に失敗」とある魔物行動は、必ず抵抗値を使用する。"
    ]
  },
  {
    "title": "技能の戦闘利用",
    "tags": [
      "採取",
      "知識",
      "鼓舞",
      "魅力"
    ],
    "body": [
      "採取は、魔物撃破後の採取判定に成功するとドロップチェックに+1する。",
      "知識カテゴリは魔物、素材、属性。",
      "魔物知識に成功した場合、選んだ属性1つの耐性、弱点、無効、反射、吸収などを確認できる。",
      "魔物知識で全属性を一度に開示しない。",
      "鼓舞は、成功すると対象の次の判定に+2する。",
      "鼓舞の対象は、戦闘中または難しい場面の味方。",
      "魅力系技能は、交渉、共感、社交、鼓舞。"
    ]
  },
  {
    "title": "判定式",
    "tags": [
      "判定",
      "対抗",
      "カスタムチェック"
    ],
    "body": [
      "対抗式の表記は『○○vs○○』ではなく『○○>=○○』に統一する。",
      "左側はカテゴリに合う技能を使う。",
      "右側は任意入力、または選択肢から設定する。",
      "非術式系のチェックも、必要なものは同じ形式に統一する。",
      "カスタムチェックは保存と読込を可能にする。"
    ]
  },
  {
    "title": "キャラクター出力",
    "tags": [
      "チャットパレット",
      "ココフォリア",
      "出力"
    ],
    "body": [
      "武器ダメージ出力は、片手武器の場合『【左手(右手)武器ダメージ】』形式にする。",
      "両手武器のダメージ出力は『【両手武器ダメージ】』形式にする。",
      "術式の出力名は『【術式名】』形式にする。",
      "武器ダメージが設定されている武器のみ出力する。",
      "防御値の出力ラベルは『防御』。",
      "回避値の出力ラベルは『回避』。"
    ]
  },
  {
    "title": "魔物出力",
    "tags": [
      "魔物",
      "チャットパレット",
      "出力"
    ],
    "body": [
      "魔物出力はJSONではなく、クリップボードコピー形式にする。",
      "魔物出力にキャラクターメモは含めない。",
      "魔物出力にドロップは含めない。",
      "チャットパレットは『choice[技名1,技名2,…]』から始める。",
      "ラウンド開始時にプレイヤーへ公開するのは使用予定の行動名だけ。対象となるPC・対象列・距離・威力・効果は事前公開しない。対象PC・対象列は、その魔物の行動を実際に解決する時点で選ぶ。",
      "GM用チャットパレットには行動種別、対象、距離（近距離／遠距離／自身）、ダメージ、効果を表示する。",
      "行動効果欄には付与条件・状態名・固有の期限だけを記載する。具体的な状態・フィールドの定義は、チャットパレット末尾の【状態・フィールド】へ使用するものだけ1回ずつ表示する。段階制は全段階をまとめて表示する。",
      "ダイスのない効果も技能セクションに入れる。"
    ]
  },
  {
    "title": "管理HTML",
    "tags": [
      "管理",
      "検索",
      "コピー"
    ],
    "body": [
      "アイテム、素材、装備カテゴリなどの一覧では名前検索を常時表示する。",
      "詳細フィルターとソート情報は折り畳み式の『絞り込み・ソート』にまとめる。",
      "各行の情報コピーから、プレイヤーに渡すアイテム情報と登録IDをコピーできる。",
      "情報コピーには、内部ID、登録者、解放施設を含めない。魔物素材では装備強化内容・消費強化枠・効果説明・強化対象を表示する。",
      "情報コピーは、プレイヤーが読んで分かる範囲のアイテム情報と登録IDを出す。",
      "素材は、名称、登録ID、個数、ランク、分類、売値、説明を基本に出す。魔物素材は装備強化内容・消費強化枠・効果説明・強化対象を追加する。",
      "武器、防具、術式、道具、矢弾などは、使用に必要なコスト、対象、判定、属性、威力、最大スタックなどを追加で出す。"
    ]
  },
  {
    "title": "公開ID・貼り付け登録",
    "tags": [
      "公開ID",
      "倉庫",
      "ドロップ",
      "ネタバレ対策"
    ],
    "body": [
      "公開IDは、プレイヤーに渡しても内容を推測しにくい規則性のないID。",
      "キャラクターシートの倉庫では、貼り付けられた登録IDと個数を読み取り、DBから必要情報を自動登録する。",
      "プレイヤーは未入手アイテム一覧を検索しない。",
      "貼り付け登録では装備強化内容と効果説明を表示・登録しない。",
      "プレイヤーに渡す情報は、未入手一覧ではなく、入手したアイテムごとの情報と登録IDにする。",
      "装備強化内容、効果説明、内部ID、登録者、解放施設などの内部管理情報は表示しない。"
    ]
  },
  {
    "title": "初期矢弾",
    "tags": [
      "初期所持品",
      "矢弾",
      "所持品"
    ],
    "body": [
      "初期武器の選択に関係なく、通常矢、通常ボルト、大型ボルトをそれぞれ1スタック分、初期所持品に入れる。",
      "通常矢と通常ボルトは20個、大型ボルトは10個を1スタックとする。",
      "矢筒は初期支給しない。矢弾は所持品枠を使用する。"
    ]
  },
  {
    "title": "装飾品段階強化",
    "tags": [
      "装飾品",
      "固有名称",
      "段階強化",
      "5セット"
    ],
    "body": [
      "段階強化型装飾品は、通常の装備強化枠とは別に『装飾品強化』で上位段階へ置き換え、固有効果そのものを強くする。",
      "装飾品強化は、強化元の装飾品1個と必要素材を使い、上位段階の装飾品へ置き換える。施設依頼は判定不要、自作は細工で判定する。",
      "装飾品は種類を問わず通常の装備強化枠を持たない。性能成長は『装飾品強化』による段階強化・派生だけで扱い、素材強化との二重取りをしない。",
      "進行の大区切りは『通常エリア3つ＋異界1つ』を1セットとし、5セットで1区切りとして装飾品の最大段階を設計する。",
      "低負荷の数値型（最大HP・最大MPなど）は最大5段階を目安にし、1セットごとに伸ばしてよい。",
      "技能補正型は最大3段階程度を目安にし、+1、+2、+3のように伸ばす。段階間隔は数値型より広くしてよい。",
      "回復調合品補助など対象が限定される効果は3～4段階程度まで許可し、適用範囲が広いほど段階数を減らす。攻撃調合品の直接ダメージ補助は、複数対象にも各対象へ適用されるため回復補助より段階数を少なめにする。",
      "罠の直接ダメージ補助も装飾品固有効果として扱い、継続ダメージ・状態異常由来のダメージには適用しない。水辺の湿地で『刻歯の指輪（罠直接ダメージ+1）』、山麓の旧鉱山で『震牙の指輪（罠直接ダメージ+2）』へ段階強化する。",
      "装飾品による技能・能力・最大HP/MP・近接ダメージ・攻撃調合品ダメージ・罠ダメージ・回復調合品回復量などの数値補正は、効果文だけでなく補正値データへ別項として登録する。キャラシでは技能値・ダメージ式・回復式へ+Xの別項として加算し、チャットパレットには装飾品名・補正値・効果詳細を併記する。",
      "後衛狙い補正の緩和、回数制の強力効果、複数効果を持つ特殊装飾品なども通常の装備強化枠は持たせず、必要な成長は専用の段階強化・派生で扱う。",
      "異界由来の特殊装飾品は通常エリアの数値型と同じ速度で伸ばさず、必要な場合のみ後続異界で専用の段階強化・派生を追加する。",
      "異界産の装飾品を段階強化する場合、強化段階の解放先も異界とする。異界外の素材や通常加工素材を副材料として要求してよいが、強化先の異界由来素材を必ず主材料とし、必要個数の合計は異界外素材より多くする。異界に生息する魔物・異界ボスのドロップ素材は、その異界由来素材として数える。",
      "未定義の将来エリア名や解放キーは先に作らない。現在実装済みのエリアだけ実データ化し、残りの段階は5セット設計に沿って後続エリア実装時に追加する。",
      "装飾品では、武器・防具の素材強化で扱う威力・命中・防御値・防御行動値の単純な焼き直しより、技能、最大HP/MP、調合品効率、状態対策、探索補助など装飾品固有の役割を優先する。"
    ]
  },
  {
    "title": "装備強化",
    "tags": [
      "装備",
      "強化",
      "素材"
    ],
    "body": [
      "強化枠上限を持つのは武器・鎧・盾だけとする。魔導書・祈祷書は武器に含む。装飾品・バッグ・矢筒・道具・消耗品・素材などには強化枠を設定しない。",
      "★1の武器・防具・盾は原則2枠の強化枠上限を持つ。",
      "装飾品の性能成長は通常の素材強化ではなく、専用の『装飾品強化』による段階強化・派生で扱う。",
      "魔導書と祈祷書は武器として、対応する武器ランクの強化枠ルールを適用する。",
      "素手、普段着、装飾品、バッグ、矢筒、素材、調合品、道具、矢弾、スクロールには強化枠上限を表示しない。",
      "実際に適用した強化内容はキャラクターシートの装備欄で、1強化1行で記録する。"
    ]
  }
];
SYSTEM_HELP.push({title:'状態・フィールドの共通定義',tags:['魔物','状態','フィールド'],body:[...RAMonsterRules.common,...Object.values(RAMonsterRules.definitions).flat()]});
function buildSystemHelpText(){
  return SYSTEM_HELP.map(section=>{
    const tagText = (section.tags||[]).length ? `【${section.tags.join(' / ')}】\n` : '';
    return `■ ${section.title}\n${tagText}${(section.body||[]).map(line=>`・${line}`).join('\n')}`;
  }).join('\n\n');
}
function renderHelpPanel(){
  const wrap=$('helpCards');
  if(!wrap) return;
  wrap.innerHTML = SYSTEM_HELP.map((section,idx)=>`<details class="help-card" ${idx===0?'open':''}>
    <summary>${escapeHtml(section.title)}</summary>
    <div class="help-card-body">
      ${(section.tags||[]).length ? `<div class="help-mini">${section.tags.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      <ul>${(section.body||[]).map(line=>`<li>${escapeHtml(line)}</li>`).join('')}</ul>
    </div>
  </details>`).join('');
}
async function copySystemHelp(){
  const text = buildSystemHelpText();
  const out=$('helpTextOutput');
  if(out){ out.value=text; out.classList.remove('hidden'); }
  await copyAdminTextDirect(text);
  toast('ヘルプ全文コピーしました');
}
