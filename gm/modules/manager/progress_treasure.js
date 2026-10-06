function uniqueTreasureTables(){
  const map=new Map();
  (state.treasures||[]).filter(r=>enabledRow(r)&&String(r.tablePurpose||'').trim()!=='入手アイテム').forEach(r=>{
    const id=String(r.tableId||'').trim();
    if(!id)return;
    if(!map.has(id)) map.set(id,{id, area:r.areaName||'', chestName:r.chestName||'', rank:r.treasureRank||'', count:0, row:r});
    map.get(id).count++;
  });
  return [...map.values()].sort((a,b)=>String(a.area||'').localeCompare(String(b.area||''),'ja')||String(a.chestName||a.id).localeCompare(String(b.chestName||b.id),'ja'));
}
function fillTreasureTables(prefer=''){
  const sel=$('treasureTableSelect');
  if(!sel)return;
  const rows=uniqueTreasureTables();
  sel.innerHTML='';
  if(!rows.length){
    const o=document.createElement('option'); o.value=''; o.textContent='宝箱表なし'; sel.appendChild(o); return;
  }
  rows.forEach(r=>{
    const o=document.createElement('option');
    o.value=r.id;
    o.textContent=`【${r.area||'エリア未設定'}】${r.chestName||r.id} / ${r.id} / ${progressPlayerRank(r.rank)||'ランク未設定'}（${r.count}件）`;
    sel.appendChild(o);
  });
  if(prefer && [...sel.options].some(o=>o.value===prefer)) sel.value=prefer;
  renderTreasureTrapInfo();
}
const TREASURE_AREA_PROFILES={
  '街はずれの草原':{
    lockChance:20, trapChance:20, emptyChance:10, detect:[5,7], disarm:[5,7], unlock:[5,7],
    traps:[
      {name:'飛び出す針',effect:'開封者に1D6ダメージ。'},
      {name:'指挟みのばね',effect:'開封者に1D6ダメージ。'},
      {name:'粉塵袋',effect:'開封者に1D3の物属性ダメージ。'},
      {name:'転倒索',effect:'開封者に1D6の物属性ダメージ。'}
    ]
  },
  '近郊の森':{
    lockChance:35, trapChance:35, emptyChance:10, detect:[7,9], disarm:[7,10], unlock:[7,9],
    traps:[
      {name:'毒針',effect:'開封者に1D6の無属性・防御無視ダメージ。'},
      {name:'絡み蔓',effect:'開封者に1D6の物属性ダメージ。'},
      {name:'胞子の噴出',effect:'開封者はMPを1D3失う。'},
      {name:'粘着樹液',effect:'開封者に1D3の物属性ダメージ。'},
      {name:'胞子煙筒',effect:'開封者に1D6の無属性・防御無視ダメージ。'},
      {name:'樹脂捕縛帯',effect:'開封者に1D6+1の物属性ダメージ。'}
    ]
  },
  '水辺の湿地':{
    lockChance:45, trapChance:45, emptyChance:10, detect:[9,11], disarm:[9,12], unlock:[8,11],
    traps:[
      {name:'毒液噴射',effect:'開封者に1D6+1ダメージを与え、さらに1D3の無属性・防御無視ダメージ。'},
      {name:'泥の噴出',effect:'開封者に1D3の物属性ダメージ。'},
      {name:'腐食液',effect:'開封者に1D6+1の物属性ダメージ。'},
      {name:'沼ガス',effect:'開封者に1D6の無属性ダメージ。'},
      {name:'腐蝕泥槽',effect:'開封者に1D6+2の無属性ダメージ。'},
      {name:'霧針散布器',effect:'開封者に1D6+1の無属性・防御無視ダメージ。'}
    ]
  },
  '山麓の旧鉱山':{
    lockChance:55, trapChance:60, emptyChance:8, detect:[10,13], disarm:[10,13], unlock:[10,13],
    traps:[
      {name:'落石ばね',effect:'開封者に2D6ダメージ。'},
      {name:'粉塵筒',effect:'開封者に1D6の無属性ダメージ。'},
      {name:'錆びた拘束具',effect:'開封者に1D6+2の物属性ダメージ。'},
      {name:'魔晶の閃光',effect:'開封者はMPを1D6失う。'},
      {name:'磁着拘束具',effect:'開封者に1D6+1の物属性ダメージ。'},
      {name:'鉱震杭',effect:'開封者に2D6+2の物属性ダメージ。このダメージは防御値を2点まで無視する。'}
    ]
  },
  '反照の水庭':{
    lockChance:60, trapChance:60, emptyChance:8, detect:[11,14], disarm:[11,14], unlock:[11,14],
    traps:[
      {name:'反転水鏡',effect:'開封者に1D6+2の無属性ダメージ。'},
      {name:'位相の裂け目',effect:'開封者に2D6の無属性・防御無視ダメージ。'},
      {name:'虚ろな手',effect:'開封者に1D6+2の物属性ダメージ。'},
      {name:'逆流する術式',effect:'開封者はMPを1D3失う。'},
      {name:'鏡返しの印',effect:'開封者はMPを1D6失う。'},
      {name:'裂界刃線',effect:'開封者に2D6の無属性・防御無視ダメージ。'}
    ]
  },
  '風渡りの高原':{
    lockChance:60, trapChance:65, emptyChance:8, detect:[13,15], disarm:[13,15], unlock:[12,15],
    traps:[
      {name:'風刃の封',effect:'開封者に2D6の風属性ダメージ。'},
      {name:'雷糸の留め金',effect:'開封者に1D6+2の無属性ダメージ。'},
      {name:'浮石の崩落',effect:'開封者に2D6ダメージ。'},
      {name:'逆巻く気流',effect:'開封者に1D6+2の物属性ダメージ。'},
      {name:'風圧跳弾',effect:'開封者に2D6+1の風属性ダメージ。'},
      {name:'雷導捕縛網',effect:'開封者に2D6の雷属性ダメージ。'}
    ]
  },
  '灰冠の火山峡谷':{
    lockChance:65, trapChance:65, emptyChance:7, detect:[14,16], disarm:[14,16], unlock:[14,16],
    traps:[
      {name:'噴気弁',effect:'開封者に2D6+2の火属性ダメージ。'},
      {name:'黒曜片ばね',effect:'開封者に2D6+2の物属性ダメージ。'},
      {name:'灰煙筒',effect:'開封者に1D6の無属性ダメージ。'},
      {name:'熱膨張留め金',effect:'開封者に1D6+2の物属性ダメージ。'},
      {name:'焼締拘束輪',effect:'開封者に2D6の無属性ダメージ。'},
      {name:'火脈晶の破裂',effect:'開封者に2D6+1D4の火属性ダメージ。このダメージは常時防御値を1点まで無視する。'}
    ]
  }
};
function selectedTreasureMeta(){ return treasureRows($('treasureTableSelect')?.value||'')[0]||null; }
function treasureAreaName(tableId, explicit=''){
  const direct=String(explicit||'').trim();
  if(direct)return direct;
  const row=treasureRows(tableId)[0];
  return String(row?.areaName||'').trim();
}
const RECIPE_CACHE_EMPTY_CHANCE=25;
function treasureProfile(areaName){
  return TREASURE_AREA_PROFILES[areaName] || TREASURE_AREA_PROFILES['街はずれの草原'];
}
function isRecipeCacheTable(tableId=''){return /_recipe_cache$/i.test(String(tableId||''));}
function treasureEmptyChance(tableId='',areaName='',questFixed=false){
  if(questFixed)return 0;
  const base=Number(treasureProfile(areaName).emptyChance||0);
  return isRecipeCacheTable(tableId)?Math.max(base,RECIPE_CACHE_EMPTY_CHANCE):base;
}
function positiveTreasureDifficulty(value,fallback=1){
  const n=Number(String(value??'').trim());
  return Number.isInteger(n)&&n>=1?n:Math.max(1,Number(fallback)||1);
}
function treasureDifficultyRange(value,fallbackRange){
  const nums=(String(value??'').match(/\d+/g)||[]).map(Number).filter(n=>Number.isInteger(n)&&n>=1);
  if(nums.length>=2)return [Math.min(nums[0],nums[1]),Math.max(nums[0],nums[1])];
  if(nums.length===1)return [Math.max(1,nums[0]-1),nums[0]+1];
  const min=positiveTreasureDifficulty(fallbackRange?.[0],1),max=positiveTreasureDifficulty(fallbackRange?.[1],min);
  return [Math.min(min,max),Math.max(min,max)];
}
function configuredTreasureDifficulty(row,field,range){
  const [min,max]=treasureDifficultyRange(row?.[field],range);
  return Math.round((min+max)/2);
}
function rolledTreasureDifficulty(row,field,range){
  const [min,max]=treasureDifficultyRange(row?.[field],range);
  return randomInt(min,max);
}
function configuredTrapDetectDifficulty(row,profile){return configuredTreasureDifficulty(row,'trapDetectDifficulty',profile?.detect);}
function configuredUnlockDifficulty(row,profile){return configuredTreasureDifficulty(row,'unlockDifficulty',profile?.unlock);}
function configuredTrapDisarmDifficulty(row,profile){return configuredTreasureDifficulty(row,'trapDisarmDifficulty',profile?.disarm);}
function rolledTrapDetectDifficulty(row,profile){return rolledTreasureDifficulty(row,'trapDetectDifficulty',profile?.detect);}
function rolledUnlockDifficulty(row,profile){return rolledTreasureDifficulty(row,'unlockDifficulty',profile?.unlock);}
function rolledTrapDisarmDifficulty(row,profile){return rolledTreasureDifficulty(row,'trapDisarmDifficulty',profile?.disarm);}

function normalizeTreasureSetup(setup){
  if(!setup)return setup;
  if(setup.bossReward){setup.hasLock=false;setup.hasTrap=false;setup.unlockDifficulty='';setup.trapDetectDifficulty='';setup.trapDisarmDifficulty='';setup.trapName='';setup.trapEffect='';setup.emptyChance=0;return setup;}
  if(setup.questFixed){setup.hasLock=false;setup.hasTrap=false;setup.unlockDifficulty='';setup.trapDetectDifficulty='';setup.trapDisarmDifficulty='';setup.trapName='';setup.trapEffect='';setup.emptyChance=0;return setup;}
  const row=treasureRows(setup.tableId||'')[0]||{};
  const profile=treasureProfile(setup.areaName||row.areaName||'');
  if(setup.hasLock) setup.unlockDifficulty=positiveTreasureDifficulty(setup.unlockDifficulty,configuredUnlockDifficulty(row,profile));
  else setup.unlockDifficulty='';
  // 罠が実際に存在するかどうかにかかわらず、罠感知判定は必ず行う。
  setup.trapDetectDifficulty=positiveTreasureDifficulty(setup.trapDetectDifficulty,configuredTrapDetectDifficulty(row,profile));
  if(setup.hasTrap){
    setup.trapDisarmDifficulty=positiveTreasureDifficulty(setup.trapDisarmDifficulty,configuredTrapDisarmDifficulty(row,profile));
  }else{
    setup.trapDisarmDifficulty='';
    setup.trapName='';
    setup.trapEffect='';
  }
  return setup;
}
function setTreasureContext(tableId, areaName='', mode='normal'){
  const id=String(tableId||'').trim();
  state.treasureContext={tableId:id,areaName:treasureAreaName(id,areaName),mode:String(mode||'normal')};
  state.treasureSetup=null;
  state.lastTreasureText='';
  state.lastTreasureCopyText='';
  renderTreasureTrapInfo();
  updateTreasureCopyButtons();
  saveState(false);
  return state.treasureContext;
}
function buildTreasureSetup(tableId, areaName='', questFixed=false){
  const row=treasureRows(tableId)[0]||null;
  if(!row)return null;
  const area=treasureAreaName(tableId,areaName);
  const profile=treasureProfile(area);
  if(isBossTreasureTable(tableId)){return normalizeTreasureSetup({tableId:String(tableId||''),areaName:area,chestName:row.chestName||row.tableId||'エリアボスの褒賞箱',bossReward:true,questFixed:false,hasLock:false,hasTrap:false,emptyChance:0});}
  if(questFixed){
    return normalizeTreasureSetup({
      tableId:String(tableId||''),areaName:area,chestName:row.chestName||row.tableId||'クエスト固有宝箱',
      questFixed:true,hasLock:false,hasTrap:false,emptyChance:0,
      trapDetectDifficulty:''
    });
  }
  const hasLock=Math.random()*100<profile.lockChance;
  const hasTrap=Math.random()*100<profile.trapChance;
  const trap=hasTrap?profile.traps[Math.floor(Math.random()*profile.traps.length)]:null;
  return normalizeTreasureSetup({
    tableId:String(tableId||''),areaName:area,chestName:row.chestName||row.tableId||'宝箱',
    hasLock,hasTrap,questFixed:false,emptyChance:treasureEmptyChance(tableId,area,false),
    unlockDifficulty:hasLock?rolledUnlockDifficulty(row,profile):'',
    trapDetectDifficulty:rolledTrapDetectDifficulty(row,profile),
    trapDisarmDifficulty:hasTrap?rolledTrapDisarmDifficulty(row,profile):'',
    trapName:trap?.name||'',trapEffect:trap?.effect||''
  });
}
function generateTreasureSetup(tableId, areaName=''){
  state.treasureSetup=buildTreasureSetup(tableId,areaName,false);
  renderTreasureTrapInfo(); saveState(false); return state.treasureSetup;
}
function currentTreasureSetup(){
  const tableId=$('treasureTableSelect')?.value||'';
  if(!tableId || !state.treasureSetup)return null;
  if(String(state.treasureSetup.tableId||'')!==String(tableId))return null;
  return normalizeTreasureSetup(state.treasureSetup);
}
function prepareTreasureEvent(tableId, areaName=''){
  fillTreasureTables(tableId);
  setTreasureContext(tableId,areaName,'normal');
  const result=resolveTreasureTable(tableId,areaName,{questFixed:false});
  applyTreasureResultToStandalone(result);
  addLog(`宝箱イベント自動決定：${treasureAreaName(tableId,areaName)||'エリア未設定'} / ${result?.contentLabel||'中身なし'}`);
  return result;
}
function prepareQuestFixedTreasure(tableId, areaName=''){
  fillTreasureTables(tableId);
  state.treasureContext={tableId:String(tableId||''),areaName:treasureAreaName(tableId,areaName),mode:'quest-fixed'};
  state.treasureSetup=buildTreasureSetup(tableId,areaName,true);
  renderTreasureTrapInfo(); saveState(false);
  return state.treasureSetup;
}
function treasureSetupLines(setup={}){
  if(setup.bossReward)return [`宝箱：${setup.chestName||setup.tableId||'エリアボスの褒賞箱'}`,`宝箱表：${setup.tableId||'未設定'}`,`エリア：${setup.areaName||'未設定'}`,'鍵：なし','罠：なし','採取・解体判定：なし','補足：エリアボスが実力を認めたPCへ授ける褒賞箱。'];
  const lines=[
    `宝箱：${setup.chestName||setup.tableId||'宝箱'}`,
    `宝箱表：${setup.tableId||'未設定'}`,
    `エリア：${setup.areaName||'未設定'}`,
    `鍵：${setup.hasLock?'あり':'なし'}`,
    `解錠難易度（細工）：${setup.hasLock?setup.unlockDifficulty:'—'}`,
    `罠：${setup.hasTrap?'あり':'なし'}`,
    `罠感知難易度（感知）：${setup.questFixed?'—':setup.trapDetectDifficulty}`,
    `罠解除難易度（細工）：${setup.hasTrap?setup.trapDisarmDifficulty:'—'}`,
    `空箱率：${Number(setup.emptyChance||0)}%${isRecipeCacheTable(setup.tableId)?'（レシピ箱）':''}`
  ];
  if(setup.hasTrap){
    if(setup.trapName)lines.push(`罠内容：${setup.trapName}`);
    if(setup.trapEffect)lines.push(`罠の効果：${setup.trapEffect}`);
  }
  if(setup.questFixed)lines.push('鍵・罠の有無：クエスト固定');
  return lines;
}
function renderTreasureTrapInfo(){
 const box=$('treasureTrapInfo'); if(!box)return;
 const r=currentTreasureSetup();
 const tableId=$('treasureTableSelect')?.value||'';
 if(!r){
   box.textContent=tableId?'宝箱を決定すると、鍵・罠・感知／解除難易度・中身をまとめて表示します。':'宝箱表を選択してください。';
   return;
 }
 box.textContent=treasureSetupLines(r).join('\n');
}
function trapDetectText(){const r=currentTreasureSetup(); if(!r)return '宝箱の状態はまだ決定されていません。'; if(r.bossReward)return 'エリアボスの褒賞箱には罠がないため、感知判定は行いません。'; if(r.questFixed)return 'このクエスト固有宝箱では罠感知判定を行いません。'; return `【罠感知判定】\n2D6+{感知}>=${r.trapDetectDifficulty}`;}
function trapDisarmText(){const r=currentTreasureSetup(); if(!r)return '宝箱の状態はまだ決定されていません。'; if(r.bossReward)return 'エリアボスの褒賞箱には罠がありません。'; if(r.questFixed)return 'このクエスト固有宝箱では罠解除判定を行いません。'; return r.hasTrap?`【罠解除判定】\n2D6+{細工}>=${r.trapDisarmDifficulty}`:'この宝箱に罠はありません。';}
function unlockText(){const r=currentTreasureSetup(); if(!r)return '宝箱の状態はまだ決定されていません。'; if(r.bossReward)return 'エリアボスの褒賞箱には鍵がありません。'; if(r.questFixed)return 'このクエスト固有宝箱では解錠判定を行いません。'; return r.hasLock?`【鍵の解除判定】\n2D6+{細工}>=${r.unlockDifficulty}`:'この宝箱に鍵はありません。';}
const LEGACY_PROGRESS_NUMERIC_RANKS={'初期':1,'初級':1,'低級':1,'チュートリアル':1,'小規模':1,'中級':2,'普通':2,'通常':2,'標準':2,'上級':3,'良質':3,'大規模':3,'特級':4,'希少':4,'強敵':4,'ボス':4,'高難度':4,'最上級':5,'高級':5};
function progressNumericRank(value,fallback=''){
  if(typeof value==='number'&&Number.isFinite(value)&&value>=1)return Math.floor(value);
  const raw=String(value??'').trim(); if(!raw)return fallback;
  if(Object.prototype.hasOwnProperty.call(LEGACY_PROGRESS_NUMERIC_RANKS,raw))return LEGACY_PROGRESS_NUMERIC_RANKS[raw];
  const m=raw.match(/(?:★|Rank\s*[:：]?\s*)?(\d+)/i),n=m?Number(m[1]):NaN;
  return Number.isFinite(n)&&n>=1?Math.floor(n):fallback;
}
function progressPlayerRank(value){const n=progressNumericRank(value,'');return n?`★${n}`:String(value??'').trim();}
const APPRAISAL_FEES={1:150,2:400,3:1000,4:2000};
const TRANSCRIPTION_DIFFICULTIES={1:7,2:10,3:13,4:16};
const TRANSCRIPTION_MATERIAL_COUNTS={1:1,2:2,3:3,4:4};
function appraisalFee(rank=1){return APPRAISAL_FEES[progressNumericRank(rank,1)]||150;}
function transcriptionDifficulty(rank=1){return TRANSCRIPTION_DIFFICULTIES[progressNumericRank(rank,1)]||7;}
function transcriptionMaterialCount(rank=1){return TRANSCRIPTION_MATERIAL_COUNTS[progressNumericRank(rank,1)]||1;}
function fillAppraisalRules(){
  const sel=$('appraisalRuleSelect');
  if(!sel)return;
  const rows=(state.appraisalRules||[]).filter(enabledRow);
  sel.innerHTML='';
  if(!rows.length){
    const o=document.createElement('option'); o.value=''; o.textContent='鑑定ルールなし'; sel.appendChild(o); return;
  }
  rows.forEach((r,i)=>{
    const o=document.createElement('option');
    o.value=String(i);
    o.textContent=`${r.facilityName||'施設未設定'} / 未鑑定の${r.spellType||'術式'}スクロール：${progressPlayerRank(r.scrollRank)||'ランク未設定'} / 道具判定 2D6+鑑定>=${r.difficulty||'?'} / 施設鑑定 ${appraisalFee(r.scrollRank)}G`;
    sel.appendChild(o);
  });
}
function treasureRows(tableId){
  const id=String(tableId||'').trim();
  return (state.treasures||[]).filter(r=>enabledRow(r) && String(r.tableId||'').trim()===id);
}
function rollDiceText(raw){
  const s=String(raw||'1').trim();
  const m=s.match(/^(\d*)[dDＤｄ](\d+)([+-]\d+)?$/);
  if(!m)return {text:s||'1', detail:''};
  const n=Number(m[1]||1), d=Number(m[2]), add=Number(m[3]||0);
  let rolls=[]; for(let i=0;i<n;i++) rolls.push(1+Math.floor(Math.random()*d));
  const total=rolls.reduce((a,b)=>a+b,0)+add;
  return {text:String(total), detail:`${s} → ${rolls.join(',')}${add?`${add>0?'+':''}${add}`:''} = ${total}`};
}
function rewardItemRows(tableId){
  const id=String(tableId||'').trim();
  return (state.treasures||[]).filter(r=>enabledRow(r)&&String(r.tableId||'').trim()===id&&String(r.tablePurpose||'').trim()==='入手アイテム');
}
function rewardItemTableIdForArea(areaName=''){
  const area=String(areaName||'').trim();if(!area)return'';
  const row=(state.treasures||[]).find(r=>enabledRow(r)&&String(r.tablePurpose||'').trim()==='入手アイテム'&&String(r.areaName||'').trim()===area&&String(r.tableId||'').trim());
  return String(row?.tableId||'').trim();
}
function eventRewardTableSlotsFromClause(clause=''){
  const text=String(clause||'');
  let m=text.match(/入手アイテム表[^。\n]*?抽選結果(?:を)?\s*(\d+)\s*枠/);
  if(m)return Math.max(0,Number(m[1])||0);
  m=text.match(/(?:同じ)?抽選結果\s*(\d+)\s*枠(?:を)?\s*入手/);
  if(m)return Math.max(0,Number(m[1])||0);
  m=text.match(/抽選結果(?:の)?\s*(\d+)\s*枠目(?:まで)?(?:のみ)?\s*入手/);
  if(m)return Math.max(0,Number(m[1])||0);
  return 0;
}
function eventRewardMaxTableSlots(row={}){
  const clauses=String(row.result||'').split(/[。\n]+/).map(x=>x.trim()).filter(Boolean);
  let currentBranchKey='',lastSuccessBranchKey='';
  const groups=clauses.map(clause=>{
    let trigger=typeof eventRewardTrigger==='function'?eventRewardTrigger(clause,currentBranchKey):{kind:'always',value:0,branchKey:''};
    if(trigger.kind==='threshold'&&!String(trigger.branchKey||''))trigger={...trigger,branchKey:lastSuccessBranchKey||'判定'};
    if(trigger.kind==='success'){currentBranchKey=String(trigger.branchKey||'判定');lastSuccessBranchKey=currentBranchKey;}
    else if(trigger.kind==='failure'||trigger.kind==='victory')currentBranchKey='';
    return {trigger,clause,tableSlots:eventRewardTableSlotsFromClause(clause)};
  }).filter(g=>g.tableSlots>0);
  const inferred=typeof eventRewardTableSlotCountForGroups==='function'?eventRewardTableSlotCountForGroups(groups):Math.max(0,...groups.map(g=>Number(g.tableSlots)||0));
  return Math.max(0,Number(row.rewardDrawCount)||0,inferred);
}
function eventRewardTableSpec(row={},areaName=''){
  const result=String(row.result||'');
  let tableId=String(row.rewardTableId||'').trim();
  if(!tableId&&/(?:入手アイテム表|抽選結果)/.test(result))tableId=rewardItemTableIdForArea(areaName||row.areaName||'');
  let drawCount=eventRewardMaxTableSlots(row);
  if(!drawCount&&tableId){const matches=[...result.matchAll(/抽選結果(?:を)?\s*(\d+)\s*枠/g)].map(m=>Number(m[1])||0);drawCount=matches.length?Math.max(...matches):1;}
  return{tableId,drawCount:Math.max(1,Math.min(10,drawCount||1))};
}
function acquisitionItemCopyBlock(row={},count='1'){
  const monsterMaterial=String(row?.materialType||'').trim()==='魔物素材';
  if(monsterMaterial)return dropPlayerInfoBlock({name:row.name||row.id||'',id:row.id||'',publicId:row.publicId||'',count:`${count}個`,material:row});
  return buildTreasureItemCopyText(row,count);
}
function rewardItemCopyBlock(item={}){
  const row=item.row||findItemByNameOrId(item.name,item.publicId);
  if(row)return acquisitionItemCopyBlock(row,String(item.count||1));
  const fallback={entryName:item.name||'名称未設定',entryPublicId:item.publicId||'',entryType:item.entryType||'アイテム'};
  return treasureContentCopyText(fallback,String(item.count||1));
}
function rollRewardItemTable(tableId,drawCount=1,areaName='',eventName=''){
  const id=String(tableId||'').trim(),rows=rewardItemRows(id),count=Math.max(1,Math.min(10,Number(drawCount)||1));
  if(!id||!rows.length)return {tableId:id,eventName,slots:[],items:[],draws:[],displayText:id?`【入手アイテム抽選】\n表：${id}\n候補がありません。`:'',copyText:''};
  const map=new Map(),draws=[],slots=[];
  for(let i=0;i<count;i++){
    const picked=weightedPick(rows);if(!picked)continue;
    const q=rollDiceText(picked.quantity||'1'),n=Math.max(1,Number(q.text)||1),name=String(picked.entryName||'名称未設定');
    const itemRow=findItemByNameOrId(picked.entryName,picked.entryPublicId);
    const slot={slot:i+1,name,publicId:picked.entryPublicId||itemRow?.publicId||'',entryType:picked.entryType||'アイテム',count:n,row:itemRow||null,detail:q.detail||''};
    slots.push(slot);
    const key=String(slot.publicId||name),cur=map.get(key)||{name,publicId:slot.publicId,entryType:slot.entryType,row:itemRow||null,count:0};cur.count+=n;map.set(key,cur);
    draws.push(`${i+1}枠目：${name}×${n}${q.detail?`（${q.detail}）`:''}`);
  }
  const items=[...map.values()];
  const displayText=['【入手アイテム抽選】',areaName?`エリア系統：${areaName}`:'',`表：${id}`,...draws,`合計：${items.map(x=>`${x.name}×${x.count}`).join('、')||'なし'}`].filter(Boolean).join('\n');
  const copyText=items.length?items.map(rewardItemCopyBlock).join('\n\n'):'';
  return {tableId:id,eventName,slots,items,draws,displayText,copyText};
}
function eventTableRewardState(scope='event'){
  if(scope==='quest')return state.lastQuestEventTableRewardState;
  if(scope==='base')return state.lastBaseEventTableRewardState;
  return state.lastEventTableRewardState;
}
function setEventTableRewardState(scope='event',value=null){
  if(scope==='quest')state.lastQuestEventTableRewardState=value;
  else if(scope==='base')state.lastBaseEventTableRewardState=value;
  else state.lastEventTableRewardState=value;
}
function eventRewardSelectedTableSlots(scope='event'){
  const reward=eventRewardState(scope),table=eventTableRewardState(scope);
  if(!reward)return Math.max(0,Number(table?.slots?.length)||0);
  const groups=reward.groups.filter(g=>g.selected||g.trigger.kind==='always');
  return typeof eventRewardTableSlotCountForGroups==='function'?eventRewardTableSlotCountForGroups(groups):Math.max(0,...groups.map(g=>Number(g.tableSlots)||0));
}
function eventTableRewardSelectedItems(scope='event'){
  const table=eventTableRewardState(scope),limit=eventRewardSelectedTableSlots(scope);if(!table?.slots?.length||!limit)return[];
  const map=new Map();table.slots.slice(0,limit).forEach(slot=>{const row=slot.row||findItemByNameOrId(slot.name,slot.publicId),key=String(row?.publicId||slot.publicId||row?.id||slot.name),cur=map.get(key)||{name:slot.name,row,count:0};cur.count+=Number(slot.count)||0;map.set(key,cur);});return[...map.values()];
}
function eventTableRewardCopyText(scope='event'){
  const table=eventTableRewardState(scope),rows=eventTableRewardSelectedItems(scope);if(!table||!rows.length)return'';
  return rows.map(item=>item.row?acquisitionItemCopyBlock(item.row,String(item.count||1)):dropPlayerInfoBlock({name:item.name,count:`${item.count||1}個`})).join('\n\n');
}
function eventRewardCombinedSelectedItems(scope='event'){
  const map=new Map();
  [...eventRewardSelectedItems(scope),...eventTableRewardSelectedItems(scope)].forEach(item=>{const key=String(item.row?.publicId||item.row?.id||item.name),cur=map.get(key)||{name:item.name,row:item.row,count:0};cur.count+=Number(item.count)||0;map.set(key,cur);});
  return [...map.values()];
}
function syncEventTableRewardCopyState(scope='event'){
  const text=eventTableRewardCopyText(scope),table=eventTableRewardState(scope),slots=eventRewardSelectedTableSlots(scope);
  if(scope==='quest'){state.lastQuestEventTableRewardCopyText=text;state.lastQuestEventTableRewardText=table?.displayText||'';}
  else if(scope==='base'){state.lastBaseRewardCopyText=text;state.lastBaseRewardText=table?.displayText||'';}
  else{state.lastEventTableRewardCopyText=text;state.lastEventTableRewardText=table?.displayText||'';}
  return slots;
}
function questRandomRewardKey(q={}){return `${Number(state.dayState?.day)||1}:${String(q.id||q.name||'')}`;}
function questRandomReward(q={}){
  const tableId=String(q.rewardTableId||'').trim();if(!tableId)return null;
  const key=questRandomRewardKey(q);state.questRewardCache=state.questRewardCache||{};
  if(!state.questRewardCache[key]){const r=rollRewardItemTable(tableId,Number(q.rewardDrawCount)||1,q.areaName||'');state.questRewardCache[key]={tableId:r.tableId,items:r.items,displayText:r.displayText,copyText:r.copyText};saveState(false);}
  return state.questRewardCache[key];
}
function questRewardDisplay(q={}){const r=questRandomReward(q);return r?.items?.length?r.items.map(x=>`${x.name}×${x.count}`).join('、'):'';}
function questHasRandomReward(q={}){return !!String(q.rewardTableId||'').trim();}
function questRewardItemDisplay(q={}){
  const itemText=questRewardDisplay(q)||String(q.rewardItems||'').trim();
  if(!questHasRandomReward(q))return itemText;
  const draws=Math.max(1,Number(q.rewardDrawCount)||1);
  return `ランダム報酬（${draws}枠）：${itemText||'抽選結果なし'}`;
}

function findItemByNameOrId(name,id){
  const n=String(name||'').trim(), pid=String(id||'').trim();
  return (state.items||[]).find(r=>pid && String(r.publicId||'').trim()===pid)
      || (state.items||[]).find(r=>n && String(r.name||'').trim()===n)
      || null;
}
function findRecipeByTreasureRow(row={}){
  const pid=String(row.entryPublicId||'').trim();
  const recipeName=String(row.recipeName||'').trim();
  const entryName=String(row.entryName||'').replace(/のレシピ$/,'').trim();
  return (state.recipes||[]).find(r=>pid && String(r.publicId||'').trim()===pid)
      || (state.recipes||[]).find(r=>recipeName && String(r.name||'').trim()===recipeName)
      || (state.recipes||[]).find(r=>entryName && String(r.resultItem||'').trim()===entryName)
      || null;
}
function treasureAreaByName(areaName=''){
  return (state.areas||[]).find(a=>String(a.name||'').trim()===String(areaName||'').trim())||null;
}
function treasureAreaById(areaId=''){
  return (state.areas||[]).find(a=>String(a.id||'').trim()===String(areaId||'').trim())||null;
}
function treasureAreaOrder(areaName=''){
  const n=Number(treasureAreaByName(areaName)?.unlockOrder);
  return Number.isFinite(n)?n:Infinity;
}
function treasureAreaIsOtherworld(area={}){
  return String(area&&area.areaType||'').trim()==='異界';
}
function treasureUnlockAreaAllowed(unlockAreaKey='',chestAreaName=''){
  const key=String(unlockAreaKey||'').trim();
  if(!key)return true;
  const required=treasureAreaById(key),chest=treasureAreaByName(chestAreaName);
  if(!required||!chest)return false;
  const requiredOtherworld=treasureAreaIsOtherworld(required),chestOtherworld=treasureAreaIsOtherworld(chest);
  if(requiredOtherworld)return chestOtherworld&&String(required.id||'')===String(chest.id||'');
  const requiredOrder=Number(required.unlockOrder),chestOrder=Number(chest.unlockOrder);
  if(chestOtherworld){
    // 任意異界は自身の固有品と、その分岐元までの通常エリア品だけを再抽選できる。
    return Number.isFinite(requiredOrder)&&requiredOrder<=3;
  }
  return Number.isFinite(requiredOrder)&&Number.isFinite(chestOrder)&&requiredOrder<=chestOrder;
}
function isBossTreasureTable(tableId=''){return /(?:lord|boss|storm_lord)/i.test(String(tableId||''));}
function isRareTreasureTable(tableId=''){return /rare/i.test(String(tableId||''));}
function treasureSourceAreaMatches(source='',areaName=''){
  const text=String(source||'').trim();
  if(!text||text==='宝箱')return true;
  const named=(state.areas||[]).filter(a=>text.includes(String(a.name||''))).map(a=>String(a.name||''));
  return !named.length||named.includes(String(areaName||''));
}
function treasureRecipeMaterialNames(text=''){
  return String(text||'').split(/[\n,、]+/u).map(part=>String(part||'').trim().replace(/\s*[×xX]\s*\d+.*$/u,'').trim()).filter(Boolean);
}
function treasureRecipeMaterialsAvailable(recipe={},areaName=''){
  return treasureRecipeMaterialNames(recipe.requiredMaterials).every(name=>{
    const item=(state.items||[]).find(row=>String(row.name||'').trim()===name);
    return !item||(enabledRow(item)&&treasureUnlockAreaAllowed(item.unlockAreaKey,areaName));
  });
}
function treasureRowEligible(row={},tableId='',areaName=''){
  const area=String(areaName||row.areaName||'').trim();
  const tableOrder=treasureAreaOrder(area);
  const type=String(row.entryType||'').trim();
  if(type==='レシピ'){
    const recipe=findRecipeByTreasureRow(row);
    if(!recipe||!enabledRow(recipe))return false;
    if(!treasureUnlockAreaAllowed(recipe.unlockAreaKey,area))return false;
    if(!treasureRecipeMaterialsAvailable(recipe,area))return false;
    const source=String(recipe.recipeSource||'').trim();
    const bossRecipe=String(recipe.branchClass||'').trim()==='ボス派生'||/討伐後|勝利後|戦利品箱|褒賞箱|ボス報酬|授けられる/.test(source);
    if(bossRecipe&&!isBossTreasureTable(tableId))return false;
    if(source.includes('希少宝箱')&&!isRareTreasureTable(tableId))return false;
    if(!treasureSourceAreaMatches(source,area))return false;
  }else if(type!=='通貨'){
    const item=findItemByNameOrId(row.entryName,row.entryPublicId);
    if(item){
      if(!enabledRow(item))return false;
      if(!treasureUnlockAreaAllowed(item.unlockAreaKey,area))return false;
    }
  }
  const scrollRank=progressNumericRank(row.scrollRank,'');
  if(scrollRank>=3&&tableOrder<5)return false;
  if(scrollRank>=4)return false;
  return true;
}
function eligibleTreasureRows(tableId,areaName=''){
  const area=treasureAreaName(tableId,areaName);
  return treasureRows(tableId).filter(row=>treasureRowEligible(row,tableId,area));
}
function treasureFieldText(row={},field){return String(row[field]??'').trim();}
function treasureCopyLine(label,value){const v=String(value??'').trim();return v?`${label}：${v}`:'';}
function treasureSellPriceText(value){const raw=String(value??'').trim();if(!raw)return '';const n=Number(raw);return Number.isFinite(n)&&n===0?'売却不可':`${raw}G`;}
function treasureItemKind(row={}){
  const dataKind=treasureFieldText(row,'dataKind'),itemType=treasureFieldText(row,'itemType'),materialType=treasureFieldText(row,'materialType');
  if(dataKind==='素材'||materialType)return '素材';
  if(itemType==='武器')return '武器';
  if(['防具','盾','装飾品'].includes(itemType))return itemType;
  if(itemType==='バッグ')return 'バッグ';
  if(itemType==='矢筒')return '矢筒';
  if(itemType==='術式装備')return ['魔導書','祈祷書'].includes(String(row.itemCategory||''))?'武器':'スクロール';
  if(itemType==='食材')return '食材';
  if(itemType==='重要アイテム')return '重要アイテム';
  if(itemType==='調合品'||itemType==='道具'||itemType==='特殊矢弾')return 'アイテム';
  return dataKind||itemType||'アイテム';
}
function treasureItemCategory(row={}){return treasureFieldText(row,'itemCategory')||treasureFieldText(row,'materialCategory')||treasureFieldText(row,'category');}
function treasureNormalizeModifierTarget(target=''){
  const raw=String(target||'').trim();
  const aliases={'命中':'hit','命中補正':'hit','hitMod':'hit','hit':'hit','常時防御':'combat:defense','防御値':'combat:defense','防御':'combat:defense','alwaysDefense':'combat:defense','defense':'combat:defense','防御行動':'combat:guardAction','防御行動値':'combat:guardAction','guardValue':'combat:guardAction','guard':'combat:guardAction','回避':'skill:evade','回避補正':'skill:evade','evasionMod':'skill:evade','evade':'skill:evade','知識':'skill:knowledge','体力':'ability:body','器用':'ability:dexterity','感覚':'ability:sense','知性':'ability:intellect','意志':'ability:will','魅力':'ability:charm','最大HP':'resource:maxHp','HP':'resource:maxHp','最大MP':'resource:maxMp','MP':'resource:maxMp','先制':'skill:detect','先制値':'skill:detect','combat:initiative':'skill:detect'};
  return aliases[raw]||raw;
}
function treasureModifierRows(value){
  const normalize=row=>{const target=treasureNormalizeModifierTarget(row.target||row.key||row.name||''),v=String(row.value??row.mod??row.amount??'').trim();return target||v?{target,value:v}:null;};
  if(Array.isArray(value))return value.map(normalize).filter(Boolean);
  const raw=String(value||'').trim();if(!raw)return [];
  try{const arr=JSON.parse(raw);if(Array.isArray(arr))return arr.map(normalize).filter(Boolean);}catch(e){}
  return raw.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{let parts=line.split('\t');if(parts.length<2)parts=line.split(/[｜|]/);if(parts.length<2)parts=line.split(/\s*,\s*/);return normalize({target:parts[0]||'',value:parts[1]||''});}).filter(Boolean);
}
function treasureModifierName(target=''){
  const key=treasureNormalizeModifierTarget(target);
  const names={'hit':'命中','combat:defense':'防御','combat:guardAction':'防御行動値','combatGuardAction':'防御行動値','guardAction':'防御行動値','combat:evasion':'回避','skill:detect':'感知','combat:initiative':'感知','resource:maxHp':'最大HP','resource:maxMp':'最大MP','ability:body':'体力','ability:dexterity':'器用','ability:sense':'感覚','ability:intellect':'知性','ability:will':'意志','ability:charm':'魅力','skill:force':'力業','skill:melee':'近接','skill:guard':'防御','skill:shoot':'射撃','skill:throw':'投擲','skill:evade':'回避','skill:resist':'抵抗','skill:magic':'魔法','skill:prayer':'祈祷','skill:alchemy':'調合','skill:appraise':'鑑定','skill:knowledge':'知識','skill:design':'設計','skill:blacksmith':'鍛冶','skill:negotiate':'交渉','skill:empathy':'共感','skill:social':'社交','skill:encourage':'鼓舞'};
  return names[key]||key;
}
function treasureModifierDisplay(value=''){return treasureModifierRows(value).map(row=>`${treasureModifierName(row.target)} ${String(row.value||'')}`).filter(Boolean).join(' / ');}
function treasureIsUpgradeable(row={}){return ['武器','防具','盾'].includes(treasureItemKind(row));}
function treasureIsSpecialMaterial(row={}){return treasureFieldText(row,'equipmentUpgradeEffect')==='特殊効果';}
function treasureUpgradeDisplayName(row={}){return treasureFieldText(row,'equipmentUpgradeEffect');}
function buildTreasureItemCopyText(row={},count='1'){
  const name=treasureFieldText(row,'name')||treasureFieldText(row,'id')||'名称未設定';
  const kind=treasureItemKind(row),category=treasureItemCategory(row),lines=[];
  lines.push(`【${name}】`);
  lines.push(treasureCopyLine('登録ID',treasureFieldText(row,'publicId')));
  lines.push(treasureCopyLine('個数',count||'1'));
  lines.push(treasureCopyLine('ランク',progressPlayerRank(row.rank)));
  const categoryLabel=kind==='素材'?[treasureFieldText(row,'materialType')||'素材',category].filter(Boolean).join(' / '):[kind,category].filter(Boolean).join(' / ');
  lines.push(treasureCopyLine('分類',categoryLabel));
  lines.push(treasureCopyLine('売値',treasureSellPriceText(treasureFieldText(row,'sellPrice'))));
  const useInfo=[];
  if(['武器','防具','盾','装飾品','バッグ','矢筒','術式'].includes(kind)&&treasureFieldText(row,'equipSlot'))useInfo.push(`装備枠 ${treasureFieldText(row,'equipSlot')}`);
  if(treasureFieldText(row,'power'))useInfo.push(`威力 ${treasureFieldText(row,'power')}`);
  const modifierSummary=treasureModifierDisplay(treasureFieldText(row,'modifiers'));if(modifierSummary)useInfo.push(`補正 ${modifierSummary}`);
  if(treasureFieldText(row,'offhandBonus')||treasureFieldText(row,'offhand'))useInfo.push(`副手追撃 ${treasureFieldText(row,'offhandBonus')||treasureFieldText(row,'offhand')}`);
  if(treasureFieldText(row,'reloadTurns'))useInfo.push(`装填 ${treasureFieldText(row,'reloadTurns')}ターン`);
  if(treasureIsUpgradeable(row)&&treasureFieldText(row,'upgradeLimit'))useInfo.push(`強化枠上限 ${treasureFieldText(row,'upgradeLimit')}`);
  if(treasureFieldText(row,'mpCost')||treasureFieldText(row,'cost'))useInfo.push(`コスト ${treasureFieldText(row,'mpCost')||treasureFieldText(row,'cost')}`);
  if(treasureFieldText(row,'target'))useInfo.push(`対象 ${treasureFieldText(row,'target')}`);
  if(treasureFieldText(row,'checkType'))useInfo.push(`判定 ${treasureFieldText(row,'checkType')}`);
  if(treasureFieldText(row,'element'))useInfo.push(`属性 ${treasureFieldText(row,'element')}`);
  if(treasureFieldText(row,'role'))useInfo.push(`役割 ${treasureFieldText(row,'role')}`);
  if(treasureFieldText(row,'setItem'))useInfo.push(`必要装備 ${treasureFieldText(row,'setItem')}`);
  if(treasureFieldText(row,'ammoKind'))useInfo.push(`矢弾種別 ${treasureFieldText(row,'ammoKind')}`);
  if(treasureFieldText(row,'compatibleWeaponTypes'))useInfo.push(`対応武器種 ${treasureFieldText(row,'compatibleWeaponTypes')}`);
  if(treasureFieldText(row,'maxStack'))useInfo.push(`最大スタック ${treasureFieldText(row,'maxStack')}`);
  if(treasureFieldText(row,'quiverCapacity'))useInfo.push(`矢筒収納 ${treasureFieldText(row,'quiverCapacity')}種類`);
  if(treasureFieldText(row,'bagCapacity'))useInfo.push(`バッグ容量 ${treasureFieldText(row,'bagCapacity')}`);
  if(useInfo.length)lines.push('性能：'+useInfo.join(' / '));
  lines.push(treasureCopyLine('説明',treasureFieldText(row,'description')));
  const monsterMaterial=kind==='素材'&&treasureFieldText(row,'materialType')==='魔物素材';
  if(monsterMaterial){
    lines.push(treasureCopyLine('強化対象',treasureFieldText(row,'equipmentUpgradeTarget')));
    lines.push(treasureCopyLine('装備強化内容',treasureUpgradeDisplayName(row)));
    lines.push(treasureCopyLine('消費強化枠',treasureFieldText(row,'equipmentUpgradeSlotCost')?treasureFieldText(row,'equipmentUpgradeSlotCost')+'枠':''));
    lines.push(treasureCopyLine('効果説明',treasureFieldText(row,'equipmentUpgradeDetail')));
  }else lines.push(treasureCopyLine('効果',treasureFieldText(row,'effect')));
  return lines.filter(Boolean).join('\n');
}
function treasureRecipeSkill(craftType=''){const type=String(craftType||'').trim();if(type==='調合')return '調合';if(type==='料理')return 'なし';if(type==='細工')return '細工';return '鍛冶';}
function buildTreasureRecipeCopyText(row={}){
  const name=treasureFieldText(row,'resultItem')||treasureFieldText(row,'name')||treasureFieldText(row,'id')||'名称未設定';
  const lines=[`【${name}のレシピ】`,treasureCopyLine('登録ID',treasureFieldText(row,'publicId')),treasureCopyLine('完成数',treasureFieldText(row,'resultCount')||'1'),treasureCopyLine('ランク',progressPlayerRank(row.rank)),treasureCopyLine('販売価格',treasureFieldText(row,'recipePrice')?treasureFieldText(row,'recipePrice')+'G':''),treasureCopyLine('売値',treasureFieldText(row,'recipeSellPrice')?treasureFieldText(row,'recipeSellPrice')+'G':''),treasureCopyLine('レシピ入手先',treasureFieldText(row,'recipeSource')),treasureCopyLine('製作区分',treasureFieldText(row,'craftType')),treasureCopyLine('分類',[treasureFieldText(row,'resultKind'),treasureFieldText(row,'category')].filter(Boolean).join(' / ')),treasureCopyLine('製作技能',treasureFieldText(row,'craftSkill')||treasureRecipeSkill(treasureFieldText(row,'craftType'))),treasureCopyLine('素材',treasureFieldText(row,'requiredMaterials')),treasureCopyLine('難度',treasureFieldText(row,'difficulty')),'自作：レシピ必須',treasureCopyLine('施設依頼',treasureFieldText(row,'price')?`レシピ不要 / ${treasureFieldText(row,'price')}G`:'レシピ不要'),treasureCopyLine('説明',treasureFieldText(row,'description')),treasureCopyLine('効果',treasureFieldText(row,'effect'))];
  return lines.filter(Boolean).join('\n');
}
function treasureContentCopyText(row={},quantity='1'){
  if(!row)return '';
  if(String(row.entryType||'')==='通貨'){
    const currencyMatch=String(row.entryName||'').match(/(\d+)\s*G/i),count=Number(quantity)||1;
    return currencyMatch?`獲得金額：${Number(currencyMatch[1]||0)*count}G`:String(row.entryName||'');
  }
  if(String(row.entryType||'')==='レシピ'){
    const recipe=findRecipeByTreasureRow(row);
    if(recipe)return buildTreasureRecipeCopyText(recipe);
  }
  const item=findItemByNameOrId(row.entryName,row.entryPublicId);
  if(item)return buildTreasureItemCopyText(item,quantity);
  return [`【${row.entryName||row.recipeName||'名称未設定'}】`,treasureCopyLine('登録ID',row.entryPublicId),treasureCopyLine('個数',quantity),treasureCopyLine('分類',row.entryType),treasureCopyLine('説明',row.description)].filter(Boolean).join('\n');
}
function treasureContentLines(row={},q={text:'1',detail:''}){
  if(!row)return ['中身：なし'];
  const lines=[`中身：${row.entryName||row.recipeName||'名称未設定'}${String(row.entryType||'')==='通貨'?'':`×${q.text}`}`];
  if(q.detail)lines.push(`個数抽選：${q.detail}`);
  if(row.entryPublicId)lines.push(`登録ID：${row.entryPublicId}`);
  if(row.entryType)lines.push(`中身種別：${row.entryType}`);
  if(row.scrollRank)lines.push(`スクロールランク：${progressPlayerRank(row.scrollRank)}`);
  if(row.description)lines.push(`中身説明：${row.description}`);
  if(String(row.entryType||'')==='通貨'){
    const currencyMatch=String(row.entryName||'').match(/(\d+)\s*G/i),count=Number(q.text)||1;
    if(currencyMatch)lines.push(`獲得金額：${Number(currencyMatch[1]||0)*count}G`);
  }
  return lines;
}
function bossMonsterForTreasureTable(tableId=''){
  const evt=(state.events||[]).find(e=>isBossEvent(e)&&String(e.treasureTableId||'').trim()===String(tableId||'').trim());
  if(!evt)return null;
  const text=[evt.encounterComposition,evt.encounterFormation,evt.result].map(v=>String(v||'')).join(' / ');
  return (state.monsters||[]).filter(isAreaBossMonster).find(m=>text.includes(String(m.name||'')))||null;
}
function resolveBossRewardChest(tableId,areaName=''){
  const area=treasureAreaName(tableId,areaName),setup=buildTreasureSetup(tableId,area,false),boss=bossMonsterForTreasureTable(tableId);
  if(!boss)return {tableId,setup,picked:null,isEmpty:true,displayText:`【エリアボス褒賞箱】\n宝箱表：${tableId}\n対応するエリアボスを特定できません。`,copyText:'',contentLabel:'ボス未特定'};
  const drops=parseDrops(boss.drops),dropNames=new Set(drops.map(d=>String(d.name||'').trim()));
  const materialLines=[],copyBlocks=[];
  drops.forEach(d=>{const roll=1+Math.floor(Math.random()*100),rate=rateNum(d.rate),ok=roll<=rate;let qtyText=String(d.count||'1個');if(ok){const q=dropQuantityRoll(d.count||'1');qtyText=q.detail;copyBlocks.push(dropPlayerInfoBlock({...d,count:`${q.count}個`}));}materialLines.push(`${ok?'○':'×'} ${d.name||d.id||'名称未設定'} ${ok?qtyText:String(d.count||'1個')}（${rate}% / 出目${roll}）`);});
  const rewards=eligibleTreasureRows(tableId,area).filter(row=>!dropNames.has(String(row.entryName||'').trim()));
  const picked=rewards.length?weightedPick(rewards):null,q=picked?rollDiceText(picked.quantity||'1'):null;
  if(picked)copyBlocks.push(treasureContentCopyText(picked,q.text));
  const display=['【エリアボス褒賞箱】',...treasureSetupLines(setup),`授与者：${boss.name||boss.id}`,'','〔ボス固有素材：採取・解体不要／各確率を独立判定〕',...(materialLines.length?materialLines:['設定なし']),'','〔ランダム報酬：1枠〕',...(picked?treasureContentLines(picked,q):['中身：なし'])].join('\n');
  return {tableId,setup,picked,quantity:q?.text||'',quantityDetail:q?.detail||'',isEmpty:false,displayText:display,copyText:copyBlocks.filter(Boolean).join('\n\n'),contentLabel:`${boss.name}の褒賞箱`};
}
function resolveTreasureTable(tableId,areaName='',options={}){
  if(isBossTreasureTable(tableId)&&!options.randomOnly)return resolveBossRewardChest(tableId,areaName);
  const rows=eligibleTreasureRows(tableId,areaName),questFixed=!!options.questFixed,forceNonEmpty=!!options.forceNonEmpty;
  if(!rows.length)return {tableId,setup:buildTreasureSetup(tableId,areaName,questFixed),picked:null,isEmpty:true,displayText:`【宝箱】\n宝箱表：${tableId}\nこの解放段階で有効な中身候補がありません。`,copyText:'',contentLabel:'中身候補なし'};
  const setup=buildTreasureSetup(tableId,areaName,questFixed);
  if(forceNonEmpty&&setup)setup.emptyChance=0;
  const isEmpty=!questFixed&&!forceNonEmpty&&Math.random()*100<Number(setup?.emptyChance||0);
  if(isEmpty){
    const displayText=['【宝箱】',...treasureSetupLines(setup),'中身：なし','補足：鍵・罠・中身は独立して決定されます。'].join('\n');
    return {tableId,setup,picked:null,isEmpty:true,displayText,copyText:'',contentLabel:'中身なし'};
  }
  const picked=weightedPick(rows),q=rollDiceText(picked.quantity||'1');
  const displayText=['【宝箱】',...treasureSetupLines(setup),...treasureContentLines(picked,q)].join('\n');
  return {tableId,setup,picked,quantity:q.text,quantityDetail:q.detail,isEmpty:false,displayText,copyText:treasureContentCopyText(picked,q.text),contentLabel:picked.entryName||picked.recipeName||picked.entryType||'中身'};
}
function treasureResultCopyText(result={}){
  const direct=String(result?.copyText||'').trim();
  if(direct)return direct;
  if(result?.picked)return treasureContentCopyText(result.picked,String(result.quantity||'1'));
  // 宝箱を決定した後は、空箱でも「コピーできない」状態にしない。
  // 中身がないこと自体を結果として卓へ貼れるようにする。
  if(result?.isEmpty&&/中身[：:]なし/.test(String(result?.displayText||'')))return '中身：なし';
  return '';
}
function applyTreasureResultToStandalone(result){
  if(!result)return;
  const tableId=String(result.tableId||'');
  fillTreasureTables(tableId);
  state.treasureContext={tableId,areaName:result.setup?.areaName||'',mode:result.setup?.questFixed?'quest-fixed':'normal'};
  state.treasureSetup=result.setup||null;
  state.lastTreasureText=result.displayText||'';
  state.lastTreasureCopyText=treasureResultCopyText(result);
  renderTreasureTrapInfo();
  if($('treasureResult'))$('treasureResult').textContent=state.lastTreasureText||'宝箱結果がありません。';
  updateTreasureCopyButtons();
  saveState(false);
}
function treasureConditionLabel(sentence=''){
  const text=String(sentence||'');
  if(text.includes('失敗'))return '失敗時';
  const threshold=text.match(/目標値\s*[+＋]\s*(\d+)\s*以上/);
  if(threshold)return `目標値+${Number(threshold[1])}以上`;
  if(text.includes('勝利後'))return '勝利後';
  if(text.includes('判定成功')||/^成功/.test(text))return '成功時';
  return '';
}
function treasureTableForAreaKind(areaName='',kind='common'){
  const area=String(areaName||'').trim();
  const ids=[...new Set((state.treasures||[]).filter(r=>enabledRow(r)&&String(r.areaName||'').trim()===area).map(r=>String(r.tableId||'').trim()).filter(Boolean))];
  const words=kind==='rare'?['rare','希少']:kind==='lord'?['lord','boss','主']:['common','通常'];
  return ids.find(id=>words.some(w=>id.toLowerCase().includes(String(w).toLowerCase())))||'';
}
function eventTreasurePlans(row={},areaName=''){
  if(!eventHasTreasure(row))return [];
  const plans=[];
  const add=(tableId,label='')=>{const id=String(tableId||'').trim();if(!id)return;const found=plans.find(p=>p.tableId===id);if(found){if(label&&!found.labels.includes(label))found.labels.push(label);}else plans.push({tableId:id,labels:label?[label]:[]});};
  const sentences=String(row.result||'').split('。').map(v=>v.trim()).filter(Boolean);
  sentences.forEach(sentence=>{
    const label=treasureConditionLabel(sentence);
    const explicit=[...sentence.matchAll(/宝箱表「([^」]+)」/g)].map(m=>m[1]);
    explicit.forEach(id=>add(id,label));
    if(sentence.includes('通常宝箱表'))add(treasureTableForAreaKind(areaName,'common'),label);
    if(sentence.includes('希少宝箱表'))add(treasureTableForAreaKind(areaName,'rare'),label);
  });
  add(row.treasureTableId,isBossEvent(row)?'勝利後':'');
  return plans;
}
function eventTreasureConditionKind(label=''){
  const text=String(label||'');
  if(text.includes('失敗'))return'failure';
  if(/目標値\s*[+＋]\s*\d+\s*以上/.test(text))return'threshold';
  if(text.includes('成功'))return'success';
  if(text.includes('勝利後'))return'victory';
  return'other';
}
function eventTreasureThresholdValue(label=''){
  const m=String(label||'').match(/目標値\s*[+＋]\s*(\d+)\s*以上/);
  return m?Math.max(0,Number(m[1])||0):0;
}
function eventTreasureHasOutcomeSplit(results=[]){
  const kinds=new Set((results||[]).map(r=>eventTreasureConditionKind(r.conditionLabel)));
  return (kinds.has('success')||kinds.has('threshold'))&&kinds.has('failure');
}
function eventTreasureHasConditionalOutcome(results=[]){
  return (results||[]).some(r=>['success','failure','threshold','victory'].includes(eventTreasureConditionKind(r.conditionLabel)));
}
function eventTreasureResults(scope='event'){
  if(scope==='base')return[];
  return scope==='quest'?(state.lastQuestTreasureResults||[]):(state.lastEventTreasureResults||[]);
}
function eventSelectedOutcomeState(scope='event'){
  const reward=eventRewardState(scope);if(!reward)return{kind:'',threshold:0};
  const selected=(reward.groups||[]).filter(g=>g.selected||g.trigger?.kind==='always');
  if(selected.some(g=>g.trigger?.kind==='failure'))return{kind:'failure',threshold:0};
  const thresholds=selected.filter(g=>g.trigger?.kind==='threshold').map(g=>Number(g.trigger?.value)||0);
  if(thresholds.length)return{kind:'threshold',threshold:Math.max(...thresholds)};
  if(selected.some(g=>g.trigger?.kind==='success'))return{kind:'success',threshold:0};
  if(selected.some(g=>g.trigger?.kind==='victory'))return{kind:'victory',threshold:0};
  return{kind:'',threshold:0};
}
function eventSelectedOutcomeKind(scope='event'){return eventSelectedOutcomeState(scope).kind;}
function eventTreasureAllowedBySelectedOutcome(scope='event',result={}){
  const kind=eventTreasureConditionKind(result.conditionLabel),outcome=eventSelectedOutcomeState(scope);
  if(!outcome.kind||kind==='other')return true;
  if(kind==='success')return outcome.kind==='success'||outcome.kind==='threshold';
  if(kind==='threshold')return outcome.kind==='threshold'&&outcome.threshold>=eventTreasureThresholdValue(result.conditionLabel);
  if(kind==='failure')return outcome.kind==='failure';
  if(kind==='victory')return outcome.kind==='victory';
  return true;
}
function selectedEventTreasureCopyText(scope='event'){
  return eventTreasureResults(scope)
    .filter(r=>r.selected!==false&&eventTreasureAllowedBySelectedOutcome(scope,r))
    .map(r=>treasureResultCopyText(r))
    .filter(Boolean)
    .join('\n\n');
}
function syncEventTreasureCopyState(scope='event'){
  const results=eventTreasureResults(scope),text=selectedEventTreasureCopyText(scope);
  if(scope==='quest'){
    state.lastQuestTreasureCopyText=text;
    state.lastQuestHasTreasure=results.length>0&&!!String(text||'').trim();
  }else state.lastEventTreasureCopyText=text;
  return text;
}
function syncEventTreasureSelectionForOutcome(scope='event'){
  const rows=eventTreasureResults(scope),outcome=eventSelectedOutcomeState(scope);if(!rows.length||!outcome.kind)return rows;
  rows.forEach(r=>{const kind=eventTreasureConditionKind(r.conditionLabel);if(kind!=='other')r.selected=eventTreasureAllowedBySelectedOutcome(scope,{...r,selected:true});});
  return rows;
}
function setEventTreasureResults(scope='event',results=[]){
  const rows=(results||[]).map(r=>({...r})),outcome=eventSelectedOutcomeState(scope),split=eventTreasureHasOutcomeSplit(rows);
  if(outcome.kind){
    rows.forEach(r=>{const kind=eventTreasureConditionKind(r.conditionLabel);r.selected=kind==='other'||eventTreasureAllowedBySelectedOutcome(scope,{...r,selected:true});});
  }else if(split){
    let picked=false;
    rows.forEach(r=>{
      const kind=eventTreasureConditionKind(r.conditionLabel);
      r.selected=!picked&&kind==='success';
      if(r.selected)picked=true;
    });
  }else rows.forEach(r=>r.selected=eventTreasureConditionKind(r.conditionLabel)!=='threshold');
  if(scope==='quest')state.lastQuestTreasureResults=rows;
  else state.lastEventTreasureResults=rows;
  syncEventTreasureCopyState(scope);
  return rows;
}
function updateEventTreasureSelection(scope='event',index=0,checked=false){
  const rows=eventTreasureResults(scope),target=rows[Number(index)];if(!target)return;
  const kind=eventTreasureConditionKind(target.conditionLabel);
  target.selected=!!checked;
  if(checked&&kind==='failure')rows.forEach((r,i)=>{if(i!==Number(index)&&['success','threshold'].includes(eventTreasureConditionKind(r.conditionLabel)))r.selected=false;});
  if(checked&&['success','threshold'].includes(kind))rows.forEach(r=>{if(eventTreasureConditionKind(r.conditionLabel)==='failure')r.selected=false;});
  if(checked)applyTreasureResultToStandalone(target);
  syncEventTreasureCopyState(scope);
  renderEventRewardPanel(scope);
  if(scope==='quest')updateQuestEventItemCopyButton();else updateAreaEventItemCopyButton();
  updateTreasureCopyButtons();saveState(false);
}
function eventTreasureSelectionHtml(scope='event'){
  const rows=eventTreasureResults(scope),split=eventTreasureHasOutcomeSplit(rows),conditional=eventTreasureHasConditionalOutcome(rows);
  if(!conditional)return'';
  const body=rows.map((r,i)=>{
    const label=r.conditionLabel||`宝箱${i+1}`;
    const chest=r.setup?.chestName||r.tableId||'宝箱';
    const content=r.isEmpty?'中身なし':(r.contentLabel||'中身決定済み');
    const outcomeBlocked=!eventTreasureAllowedBySelectedOutcome(scope,{...r,selected:true});
    return `<article class="event-reward-row"><label class="event-reward-check"><input type="checkbox" data-event-treasure-check="${i}" ${r.selected&&!outcomeBlocked?'checked':''} ${outcomeBlocked?'disabled':''}><span><b>${esc(label)}</b><br><span class="muted small">${esc(chest)} / ${esc(content)}${outcomeBlocked?' / 現在の成否では入手不可':''}</span></span></label></article>`;
  }).join('');
  const note=split?'成功・失敗で宝箱が分かれるイベントです。目標値+○以上の宝箱は、その達成時だけ成功側へ追加されます。':'成否によって宝箱を開けられるかが変わるイベントです。宝箱を開けられなかった場合はチェックを外してください。';
  return `<section class="card event-reward-card"><h3>宝箱の成立結果</h3><p class="muted small">${note} 「内容コピー」には、実際に成立した宝箱の中身だけを反映します。</p><div class="event-reward-list">${body}</div></section>`;
}
function resolveEventTreasures(row={},areaName='',questFixed=false){
  const plans=eventTreasurePlans(row,areaName),results=[];
  const hasSuccess=plans.some(p=>p.labels.some(label=>['success','threshold'].includes(eventTreasureConditionKind(label))));
  const hasFailure=plans.some(p=>p.labels.some(label=>eventTreasureConditionKind(label)==='failure'));
  const outcomeSplit=hasSuccess&&hasFailure;
  plans.forEach(plan=>{
    const conditionLabel=plan.labels.join('／');
    const forceNonEmpty=outcomeSplit&&['success','threshold'].includes(eventTreasureConditionKind(conditionLabel));
    const result=resolveTreasureTable(plan.tableId,areaName,{questFixed,forceNonEmpty});
    result.conditionLabel=conditionLabel;
    results.push(result);
  });
  if(results.length)applyTreasureResultToStandalone(results[0]);
  const displayText=results.map(result=>{
    const label=result.conditionLabel?`【${result.conditionLabel}の宝箱】`:'【イベント宝箱】';
    return result.displayText.replace(/^【宝箱】/,label);
  }).join('\n\n');
  const copyText=results.map(r=>r.copyText).filter(Boolean).join('\n\n');
  return {results,displayText,copyText};
}
function updateTreasureCopyButtons(){
  const setup=currentTreasureSetup(),treasureBtn=$('copyTreasureBtn');
  if(treasureBtn)treasureBtn.disabled=!state.lastTreasureCopyText;
  const detectBtn=$('copyTrapDetectBtn'),disarmBtn=$('copyTrapDisarmBtn'),unlockBtn=$('copyUnlockBtn');
  if(detectBtn)detectBtn.disabled=!setup||!!setup.bossReward||!!setup.questFixed;
  if(disarmBtn)disarmBtn.disabled=!setup||!!setup.bossReward||!!setup.questFixed||!setup.hasTrap;
  if(unlockBtn)unlockBtn.disabled=!setup||!!setup.bossReward||!!setup.questFixed||!setup.hasLock;
  updateQuestEventItemCopyButton();updateAreaEventItemCopyButton();
}
function rollTreasure(){
  const tableId=$('treasureTableSelect')?.value||'';
  if(!eligibleTreasureRows(tableId,treasureAreaName(tableId)).length){$('treasureResult').textContent='この解放段階で有効な中身候補がありません。宝箱表の入手時期・ボス区分・公開IDを確認してください。';return;}
  const context=(state.treasureContext&&String(state.treasureContext.tableId||'')===String(tableId))?state.treasureContext:{tableId,areaName:treasureAreaName(tableId),mode:'normal'};
  const result=resolveTreasureTable(tableId,context.areaName||'',{questFixed:context.mode==='quest-fixed'});
  applyTreasureResultToStandalone(result);
  addLog(`宝箱決定：${tableId} / 鍵${result.setup?.hasLock?'あり':'なし'} / 罠${result.setup?.hasTrap?'あり':'なし'} / ${result.contentLabel}`);
}
function selectedAppraisalRule(){
  const sel=$('appraisalRuleSelect'); if(!sel)return null;
  const idx=Number(sel.value);
  const rows=(state.appraisalRules||[]).filter(enabledRow);
  return Number.isFinite(idx) ? (rows[idx] || null) : null;
}
function spellMatchesRule(spell, rule){
  if(!spell || !rule)return false;
  const type=String(spell.type||'').trim();
  const wantType=String(rule.spellType||'').trim();
  const typeOk=!wantType || type===wantType || (wantType==='魔法術式' && type==='魔法');
  const rankOk=!rule.spellRank || progressNumericRank(spell.rank,'')===progressNumericRank(rule.spellRank,'');
  const tags=String(rule.candidateTags||'').split(/[,\n、]/).map(s=>s.trim()).filter(Boolean);
  const spellTags=String(spell.tags||'');
  const tagOk=!tags.length || tags.every(t=>spellTags.includes(t));
  return typeOk && rankOk && tagOk;
}
function findScrollItemForSpell(spell){
  const name=`${spell.name}のスクロール`;
  return (state.items||[]).find(r=>String(r.name||'').trim()===name) || null;
}
function rollAppraisal(){
  const rule=selectedAppraisalRule();
  if(!rule){$('appraisalResult').textContent='鑑定ルールがありません。'; return;}
  const candidates=(state.spells||[]).filter(s=>spellMatchesRule(s,rule));
  if(!candidates.length){
    state.lastAppraisalCopyText='';
    state.lastAppraisalText='鑑定候補がありません。術式データと鑑定条件を確認してください。';
    $('appraisalResult').textContent=state.lastAppraisalText;updateAppraisalCopyButton();return;
  }
  const spell=candidates[Math.floor(Math.random()*candidates.length)];
  const scroll=findScrollItemForSpell(spell);
  state.lastAppraisalCopyText=scroll
    ? buildTreasureItemCopyText(scroll,'1')
    : [`【${spell.name}のスクロール】`,spell.publicId?`術式登録ID：${spell.publicId}`:'','個数：1',`ランク：${progressPlayerRank(spell.rank||rule.scrollRank)}`,`分類：スクロール / 術式スクロール`,`効果：使用すると術式「${spell.name}」をコスト消費なしで1回発動し、このスクロールを消費する。`].filter(Boolean).join('\n');
  state.lastAppraisalText=state.lastAppraisalCopyText;
  $('appraisalResult').textContent=state.lastAppraisalText;
  updateAppraisalCopyButton();
  addLog(`スクロール鑑定：${progressPlayerRank(rule.scrollRank)} → ${spell.name}`);
}
function updateAppraisalCopyButton(){
  const btn=$('copyAppraisalBtn');
  if(btn)btn.disabled=!String(state.lastAppraisalCopyText||'').trim();
}
function resetAppraisalResult(){
  state.lastAppraisalText='';
  state.lastAppraisalCopyText='';
  const result=$('appraisalResult');
  if(result)result.textContent='鑑定結果がここに表示されます。';
  updateAppraisalCopyButton();
}
