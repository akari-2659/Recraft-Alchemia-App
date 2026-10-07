
'use strict';
const VERSION='v90.8.834';
const GAS_URL='https://script.google.com/macros/s/AKfycbxNQYC7-aBE23cliuD1Zdze18xHh-q45P1qpBgwCCg0dYgxd1b8A-R63eGjzMtgOxMT/exec';
const GITHUB_COMMON_DB_BASE=new URL('../../../data/public/',window.location.href).toString();
function progressGithubBaseCandidates(){
  // 共通DBは公開GitHub Pagesを正本として最優先する。
  // 配置階層によって存在しない ./data/public/ を先に待たない。
  return [GITHUB_COMMON_DB_BASE];
}
function progressManifestMasterInfo(manifest={}){
  const nested=manifest&&manifest.files&&manifest.files.master;
  const nestedObject=nested&&typeof nested==='object'?nested:{};
  return{file:String(manifest.master||nestedObject.file||nestedObject.path||(typeof nested==='string'?nested:'')||'').trim(),sha256:String(manifest.sha256||nestedObject.sha256||'').trim()};
}
const PROGRESS_MASTER_KEYS=['quests','exploration_areas','event_tables','monsters','items','treasure_tables','appraisal_rules','spells','recipes'];
function progressMasterDataRowCount(data={}){
  return PROGRESS_MASTER_KEYS.reduce((sum,key)=>sum+(Array.isArray(data?.[key])?data[key].length:0),0);
}
function normalizeProgressMaster(raw={},meta={}){
  const envelope=raw&&typeof raw==='object'?raw:{};
  const source=envelope.data&&typeof envelope.data==='object'?envelope.data:envelope;
  if(!source||typeof source!=='object')throw new Error('共通DB本体が不正です。');
  const data={...source};
  for(const key of PROGRESS_MASTER_KEYS){
    if(source[key]!==undefined&&!Array.isArray(source[key]))throw new Error(`共通DB ${key} が配列ではありません。`);
    data[key]=Array.isArray(source[key])?source[key]:[];
  }
  if(!progressMasterDataRowCount(data))throw new Error('進行管理用の共通DBデータが空です。');
  const version=String(meta.version||envelope.version||'').trim();
  return{data,version,versionWarning:String(meta.versionWarning||'').trim()};
}
function progressDelay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function progressFetchJson(url,{timeoutMs=15000,cacheMode='force-cache'}={}){
  const controller=new AbortController();
  const timeout=Math.max(1000,Number(timeoutMs)||15000);
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const response=await fetch(url,{cache:cacheMode,signal:controller.signal});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }catch(error){
    if(error&&error.name==='AbortError')throw new Error(`GitHub共通DBの取得がタイムアウトしました（${Math.round(timeout/1000)}秒）`);
    throw error;
  }finally{clearTimeout(timer);}
}
async function fetchGithubProgressMaster(){
  const errors=[];
  for(const base of progressGithubBaseCandidates()){
    let manifest=null;
    try{
      manifest=await progressFetchJson(new URL('manifest.json',base).toString(),{timeoutMs:6000,cacheMode:'no-cache'});
    }catch(firstError){
      try{
        await progressDelay(250);
        manifest=await progressFetchJson(new URL('manifest.json',base).toString(),{timeoutMs:6000,cacheMode:'reload'});
      }catch(secondError){
        errors.push(`${base}: manifest ${secondError.message||secondError}`);
      }
    }
    if(manifest){
      try{
        const info=progressManifestMasterInfo(manifest);
        if(!info.file||info.file.includes('..')||info.file.includes('\\'))throw new Error('共通DBのmanifestに有効なmasterファイル名がありません。');
        const masterUrl=new URL(info.file,base);
        masterUrl.searchParams.set('_ra',info.sha256||String(manifest.version||'master'));
        const master=await progressFetchJson(masterUrl.toString(),{timeoutMs:20000,cacheMode:'force-cache'});
        const manifestVersion=String(manifest.version||'').trim(),masterVersion=String(master?.version||'').trim();
        const versionWarning=manifestVersion&&masterVersion&&manifestVersion.replace(/^v/i,'')!==masterVersion.replace(/^v/i,'')?`manifest ${manifestVersion} / master ${masterVersion}`:'';
        return normalizeProgressMaster(master,{version:masterVersion||manifestVersion,versionWarning});
      }catch(error){
        errors.push(`${base}: master ${error.message||error}`);
      }
    }else{
      // manifestが取得できない時だけdirectを1回試す。巨大なmaster本体の二重取得を避ける。
      try{
        const master=await progressFetchJson(new URL('recraft_alchemia_master.json',base).toString(),{timeoutMs:20000,cacheMode:'force-cache'});
        return normalizeProgressMaster(master,{version:String(master?.version||'')});
      }catch(error){
        errors.push(`${base}: direct ${error.message||error}`);
      }
    }
  }
  throw new Error(errors.join(' / ')||'GitHub共通DBを取得できませんでした。');
}
const STORE_KEY='recraft_alchemia_progress_manager_v1';
const GUILD_DAILY_STORAGE_KEY='recraft_alchemia_guild_daily_selection_v1';
const GUILD_DAILY_CHANNEL_NAME='recraft_alchemia_guild_daily_channel';
const GUILD_DAILY_REQUEST_KINDS=['拠点内依頼','エリア依頼','納品依頼'];
const MASTER_CACHE_KEY=STORE_KEY+'_master_cache_v1';
let deferredSavedProgressState=null;
function savedProgressSnapshotHasActiveSession(data={}){
  const ui=data&&typeof data.progressUiState==='object'&&data.progressUiState?data.progressUiState:{};
  return !!(ui.questActive||ui.areaActive||ui.hidden?.active);
}
function savedProgressSnapshotHasProgress(data={}){
  const boxes=data&&typeof data.progress==='object'&&data.progress?data.progress:{};
  return ['quests','areas'].some(type=>Object.values(boxes[type]||{}).some(row=>{
    const value=Number(row?.value)||0,note=String(row?.note||'').trim();
    return value!==0||!!note;
  }));
}
function savedProgressSnapshotIsRestorable(data={}){
  return savedProgressSnapshotHasActiveSession(data)||savedProgressSnapshotHasProgress(data);
}
function updateRestoreStateButton(){
  const btn=$('restoreStateBtn');if(!btn)return;
  const has=!!deferredSavedProgressState&&savedProgressSnapshotIsRestorable(deferredSavedProgressState);
  btn.disabled=!has;
  btn.title=has?'保存された進行状態を復元します。':'復元できる保存済み進行状態はありません。';
}
function discardDeferredSavedProgressState(){deferredSavedProgressState=null;updateRestoreStateButton();}
const $=id=>document.getElementById(id);
const state={quests:[],areas:[],events:[],monsters:[],items:[],treasures:[],appraisalRules:[],spells:[],recipes:[],progress:{quests:{},areas:{}},dayState:{day:1,fatigue:0,usedActions:0,awaitingEnd:false},lastEventText:'',lastEventKey:'',lastEventCheckCopyText:'',lastEventTreasureCopyText:'',lastEventTreasureResults:[],lastQuestEventText:'',lastQuestEventKey:'',lastQuestCheckCopyText:'',lastQuestBattleCheckCopyText:'',lastQuestFixedEventText:'',lastQuestFixedEventKey:'',lastQuestTreasureCopyText:'',lastQuestTreasureResults:[],lastQuestHasTreasure:false,lastQuestEventTableRewardText:'',lastQuestEventTableRewardCopyText:'',triggeredQuestEvents:{},baseUnlockedAreaIds:[],lastBaseEventText:'',lastBaseEventKey:'',lastBaseCheckCopyText:'',lastBaseRewardText:'',lastBaseRewardCopyText:'',lastBaseEventRewardState:null,lastBaseEventTableRewardState:null,questRewardCache:{},lastEventTableRewardText:'',lastEventTableRewardCopyText:'',lastEventTableRewardState:null,lastQuestEventTableRewardState:null,lastRecipeMerchantOffers:[],lastRecipeMerchantTrades:[],selectedRecipeMerchantId:'',lastRecipeMerchantContext:{scope:'',areaName:'',eventName:''},lastRumorText:'',lastRumorKey:'',lastTreasureText:'',lastTreasureCopyText:'',lastAppraisalText:'',lastAppraisalCopyText:'',lastDropText:'',lastDropSuccessText:'',lastDailyQuestText:'',lastDailyQuestKeys:[],lastDailyQuestKeysByKind:{'拠点内依頼':[],'エリア依頼':[],'納品依頼':[]},dailyQuestUnlockedAreaId:'',dailyQuestUnlockedAreaIds:[],questEncounterCache:{},partySize:4,areaBossEncountered:{},treasureSetup:null,treasureContext:null,lastEncounter:null,dropEncounterInstances:[],dropMode:'encounter',lastEventRewardState:null,lastQuestEventRewardState:null,lastEventOutcomeKey:'',lastQuestOutcomeKey:'',lastBaseOutcomeKey:'',lastQuestReinforcementText:'',questWorkReinforcementCounts:{},tokenExportEncounter:null,areaWeatherById:{},timeSlot:'朝',log:[]};
let currentQuestCategory='重要';
const CCFOLIA_MONSTER_IMAGE_BASE=new URL('../../../assets/monsters/',window.location.href).toString();
const CCFOLIA_MONSTER_IMAGE_SUBDIR=Object.freeze({
  mon_petit_slime:'outskirts_grass',mon_raffin_rat:'outskirts_grass',mon_rapithorn:'outskirts_grass',mon_vespat:'outskirts_grass',mon_carapace_beetle:'outskirts_grass',mon_grauworm:'outskirts_grass',mon_grass_horn_king_ragvel:'outskirts_grass',
  mon_rascreil:'nearby_forest',mon_myconid:'nearby_forest',mon_roothound:'nearby_forest',mon_branchling:'nearby_forest',mon_mossback:'nearby_forest',mon_whisperowl:'nearby_forest',mon_forest_branch_lord_vildran:'nearby_forest',
  mon_mudhopper:'waterside_wetland',mon_bubble_slime:'waterside_wetland',mon_dromarl:'waterside_wetland',mon_miasma_leech:'waterside_wetland',mon_mist_mosquito:'waterside_wetland',mon_reed_lizard:'waterside_wetland',mon_swamp_lord_glaboros:'waterside_wetland',
  mon_mirror_slime:'reflection_water_garden',mon_phase_moth:'reflection_water_garden',mon_glass_ray:'reflection_water_garden',mon_echo_reed:'reflection_water_garden',mon_rift_crab:'reflection_water_garden',mon_void_hound:'reflection_water_garden',mon_nereive:'reflection_water_garden',
  mon_resona_bat:'foothill_old_mine',mon_pick_mole:'foothill_old_mine',mon_ore_scale:'foothill_old_mine',mon_lumina_wisp:'foothill_old_mine',mon_mine_golem:'foothill_old_mine',mon_rust_mite:'foothill_old_mine',boss_dolgan:'foothill_old_mine',
  mon_breeze_hop:'wind_swept_highland',mon_crag_ram:'wind_swept_highland',mon_kite_beak:'wind_swept_highland',mon_sonora_bloom:'wind_swept_highland',mon_glide_scale:'wind_swept_highland',mon_bolt_bison:'wind_swept_highland',mon_velgrat:'wind_swept_highland'
});
const MONSTER_TOKEN_SIZE_OVERRIDES=Object.freeze({
  mon_grass_horn_king_ragvel:8,mon_forest_branch_lord_vildran:8,mon_swamp_lord_glaboros:7,boss_dolgan:7,mon_nereive:8,
  mon_mine_golem:4,mon_crag_ram:4,mon_glide_scale:4,mon_bolt_bison:4,mon_velgrat:8
});
const TOKEN_STATUS_DEFINITIONS = RAMonsterRules.definitions;
const TOKEN_STATUS_PATTERNS={'毒状態':/毒状態/,'汚染':/汚染(?:状態|I|II|III|Ⅰ|Ⅱ|Ⅲ|を|が|へ)/,'呪い':/呪い(?:状態|I|II|III|Ⅰ|Ⅱ|Ⅲ|を|が|へ)/};
function tokenCompact(value){return String(value??'').trim();}
function tokenNumberOrString(value,fallback=0){const raw=String(value??'').trim();if(!raw)return fallback;const n=Number(raw);return Number.isFinite(n)?n:raw;}
function tokenStatusEntry(label,value,maxValue){const v=tokenNumberOrString(value,0);return{label,value:v,max:tokenNumberOrString(maxValue===undefined?v:maxValue,v)};}
function tokenAffinityParams(row={}){return [['物',row.physicalAffinity],['火',row.fireAffinity],['水',row.waterAffinity],['風',row.windAffinity],['雷',row.thunderAffinity],['光',row.lightAffinity],['闇',row.darkAffinity],['無',row.neutralAffinity]].map(([label,value])=>({label,value:tokenCompact(value||'-')}));}
function tokenParseCheckType(value=''){const raw=tokenCompact(value);const m=raw.match(/^(.+?)>=(.+)$/);return m?{left:m[1].trim(),right:m[2].trim(),raw}:{left:raw,right:'',raw};}
function tokenInferActionType(row={}){const parsed=tokenParseCheckType(row.checkType||'');if(parsed.left==='近接')return'近接攻撃';if(parsed.left==='射撃')return'遠距離攻撃';if(parsed.left==='魔法')return'術式';if(parsed.left==='祈祷')return'祈祷';const name=tokenCompact(row.name),power=tokenCompact(row.power);if(/回復/.test(power)||['泥の再生'].includes(name))return'回復';if(['ぷるぷる防御','跳躍回避','身を固める','潜り込み','樹皮の守り','木登り退避','泥中跳躍','泥の鎧','甲殻封鎖'].includes(name))return'防御';if(['角の構え','根脈の隆起','沼底の脈動','鏡界の収束'].includes(name))return'補助';return'特殊';}
function tokenNormalizeActionType(row={}){let type=tokenCompact(row.actionType);if(type==='術式'||type==='祈祷'){const power=tokenCompact(row.power);type=(power&&power!=='なし'&&power!=='-')?'遠距離攻撃':'特殊';}return['近接攻撃','遠距離攻撃','防御','補助','回復','特殊'].includes(type)?type:tokenInferActionType(row);}function tokenInferActionRange(row={}){const target=tokenCompact(row.target);if(target.includes('自身'))return'自身';const type=tokenNormalizeActionType(row);if(type==='近接攻撃')return'近距離';if(type==='遠距離攻撃')return'遠距離';return'遠距離';}function tokenNormalizeActionRange(row={}){let range=tokenCompact(row.range||row.distance);if(range==='近接')range='近距離';if(range==='特殊')range=tokenCompact(row.target).includes('自身')?'自身':'遠距離';return['近距離','遠距離','自身'].includes(range)?range:tokenInferActionRange(row);}
function tokenParseActions(value=''){const raw=tokenCompact(value);if(!raw)return[];try{const arr=JSON.parse(raw);if(Array.isArray(arr))return arr.map(r=>({name:r.name||'',actionType:tokenNormalizeActionType(r),range:tokenNormalizeActionRange(r),checkType:r.checkType||'',target:r.target||'',element:r.element||'',power:r.power||'',effect:r.effect||'',baseValue:tokenCompact(r.baseValue),flags:r.flags||r.actionFlags||''}));}catch(_e){}return raw.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{const cols=line.split('\t');while(cols.length<10)cols.push('');const row={name:cols[0],actionType:cols[1],checkType:cols[2],target:cols[3],element:cols[4],power:cols[5],effect:cols[6],baseValue:cols[7],range:cols[8],flags:cols[9]};row.actionType=tokenNormalizeActionType(row);row.range=tokenNormalizeActionRange(row);return row;});}
function encounterSerializeActions(actions=[]){return(actions||[]).map(a=>[a.name||'',a.actionType||'',a.checkType||'',a.target||'',a.element||'',a.power||'',a.effect||'',a.baseValue??'',tokenNormalizeActionRange(a),a.flags||''].join('\t')).join('\n');}
function encounterActionIsDirectDamage(action={}){
  const type=tokenNormalizeActionType(action),power=tokenCompact(action.power);
  return['近接攻撃','遠距離攻撃'].includes(type)&&!!power&&power!=='なし'&&power!=='-';
}
function encounterActionReferencedNames(text='',actionNames=new Set()){
  const source=String(text||''),refs=[];
  for(const match of source.matchAll(/[《「]([^》」]+)[》」]/g)){const name=String(match[1]||'').trim();if(name&&actionNames.has(name)&&!refs.includes(name))refs.push(name);}
  return refs;
}
function encounterActionCombinations(actions=[],count=3){
  const out=[],pick=[];
  function walk(start){if(pick.length===count){out.push(pick.slice());return;}for(let i=start;i<actions.length;i++){pick.push(actions[i]);walk(i+1);pick.pop();}}
  if(count>0&&actions.length>=count)walk(0);
  return out;
}
function encounterFixedActionNames(monster={},actionNames=new Set()){
  return [...new Set(String(monster.fixedActionNames||'').split(/[,、，\n]+/).map(v=>v.trim()).filter(Boolean))].filter(name=>actionNames.has(name));
}
function encounterPassiveOnlyActionNames(monster={},actionNames=new Set()){
  return [...new Set(String(monster.passiveOnlyActionNames||'').split(/[,、，\n]+/).map(v=>v.trim()).filter(Boolean))].filter(name=>actionNames.has(name));
}
function encounterActionSelectionRules(monster={}){
  const rules=new Map();
  String(monster.actionSelectionRules||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean).forEach(line=>{
    const cols=line.split('\t');
    const actionName=String(cols[0]||'').trim(),condition=String(cols[1]||'').trim();
    if(actionName&&condition)rules.set(actionName,condition);
  });
  return rules;
}
function encounterSelectionContext(groups=[],actor={}){
  const normalized=tokenNormalizeGroups(groups||[]);
  let total=0,front=0,rear=0;
  normalized.forEach(group=>{const count=Math.max(1,Math.floor(Number(group.count)||1));total+=count;if(group.formation==='後衛')rear+=count;else front+=count;});
  let sameName=0,strong=0;const actorName=String(actor.name||'').trim();normalized.forEach(group=>{const count=Math.max(1,Math.floor(Number(group.count)||1));if(String(group.name||'').trim()===actorName)sameName+=count;const master=(state.monsters||[]).find(row=>String(row.name||'').trim()===String(group.name||'').trim());const traits=String(master?.monsterTraits||'').split(/[,、，]/).map(v=>v.trim()).filter(Boolean);if(traits.includes('強敵'))strong+=count;});return{total,front,rear,sameName,strong,actorName,actorFormation:String(actor.formation||'').trim()};
}
function encounterActionSelectionEligible(condition='',context={}){
  const parts=String(condition||'').split(/[&＆]/).map(v=>v.trim()).filter(Boolean);
  if(!parts.length)return true;
  return parts.every(part=>{
    if(part==='味方あり')return Number(context.total||0)>1;
    if(part==='前衛後衛あり')return Number(context.front||0)>0&&Number(context.rear||0)>0;
    if(part==='前衛あり')return Number(context.front||0)>0;
    if(part==='後衛あり')return Number(context.rear||0)>0;
    if(part==='強敵不在')return Number(context.strong||0)===0;
    {const m=part.match(/^同名(\d+)体未満$/);if(m)return Number(context.sameName||0)<Number(m[1]);}
    {const m=part.match(/^(HP|回避|抵抗):(D|C|B|A|S)(以上|以下)?$/);if(m){const key=m[1]==='HP'?'hp':m[1]==='回避'?'evasion':'resist',order={D:0,C:1,B:2,A:3,S:4},actual=String(context.individual?.[key]||'B'),want=m[2],dir=m[3]||'';if(dir==='以上')return order[actual]>=order[want];if(dir==='以下')return order[actual]<=order[want];return actual===want;}}
    if(part==='攻撃:精密')return String(context.individual?.attack||'標準').startsWith('精密');
    if(part==='攻撃:強打')return String(context.individual?.attack||'標準').startsWith('強打');
    {const m=part.match(/^攻撃:(精密|強打)(I|II|III)以上$/);if(m){const actual=String(context.individual?.attack||'標準'),am=actual.match(/^(精密|強打)(I|II|III)$/);if(!am||am[1]!==m[1])return false;const lv={I:1,II:2,III:3};return lv[am[2]]>=lv[m[2]];}}
    return true;
  });
}
function encounterSelectedActionSet(monster={},selectionContext={}){
  const fullPool=tokenParseActions(monster.actions||'');
  const actionNames=new Set(fullPool.map(a=>String(a.name||'').trim()).filter(Boolean));
  const passiveOnlyNames=new Set(encounterPassiveOnlyActionNames(monster,actionNames));
  const passiveOnlyActions=fullPool.filter(action=>passiveOnlyNames.has(String(action.name||'').trim()));
  const selectionRules=encounterActionSelectionRules(monster);
  const pool=fullPool.filter(action=>!passiveOnlyNames.has(String(action.name||'').trim())).filter(action=>encounterActionSelectionEligible(selectionRules.get(String(action.name||'').trim())||'',selectionContext));
  const isNamed=String(monster.id||'').startsWith('mon_named_')||String(monster.monsterTraits||'').split(/[,、，]/).map(v=>v.trim()).includes('二つ名');
  const normalSelectable=String(monster.individualValueEnabled||'').toUpperCase()==='TRUE'&&pool.length>3;
  const namedSelectable=isNamed&&pool.length>4;
  const selectCount=namedSelectable?4:Math.min(3,pool.length);
  if((!normalSelectable&&!namedSelectable)||pool.length<=selectCount)return{poolSize:fullPool.length,eligiblePoolSize:pool.length,actions:pool.slice(),passiveOnlyActions,selectedNames:pool.map(a=>a.name).filter(Boolean),fixedSelectedNames:[],validLoadoutCount:1};
  const explicitFixed=encounterFixedActionNames(monster,actionNames);
  const mandatory=new Set(explicitFixed);
  const individualAttack=String(selectionContext?.individual?.attack||'標準');
  const strongIndividual=individualAttack.startsWith('強打');
  const directPool=pool.filter(encounterActionIsDirectDamage);
  const maxDirectBase=directPool.reduce((max,action)=>{const value=Number(action.baseValue);return Number.isFinite(value)?Math.max(max,value):max;},-Infinity);
  const candidates=encounterActionCombinations(pool,selectCount).filter(combo=>{
    const selected=new Set(combo.map(a=>String(a.name||'').trim()));
    if([...mandatory].some(name=>!selected.has(name)))return false;
    if(!combo.some(encounterActionIsDirectDamage))return false;
    if(strongIndividual&&Number.isFinite(maxDirectBase)&&!combo.some(action=>encounterActionIsDirectDamage(action)&&Number(action.baseValue)===maxDirectBase))return false;
    for(const action of combo){
      const refs=encounterActionReferencedNames(action.effect||'',actionNames);
      if(refs.some(name=>!selected.has(name)))return false;
    }
    return true;
  });
  const fallback=()=>{
    const chosen=pool.filter(a=>mandatory.has(String(a.name||'').trim()));
    const rest=pool.filter(a=>!mandatory.has(String(a.name||'').trim()));
    for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
    for(const action of rest){if(chosen.length>=selectCount)break;chosen.push(action);}
    if(!chosen.some(encounterActionIsDirectDamage)){const damage=pool.find(encounterActionIsDirectDamage);if(damage&&!chosen.includes(damage)){if(chosen.length>=selectCount)chosen[chosen.length-1]=damage;else chosen.push(damage);}}
    return chosen.slice(0,selectCount);
  };
  const chosen=candidates.length?candidates[Math.floor(Math.random()*candidates.length)]:fallback();
  const selectedNames=chosen.map(a=>String(a.name||'').trim()).filter(Boolean);
  const fixedSelectedNames=selectedNames.filter(name=>mandatory.has(name));
  return{poolSize:fullPool.length,eligiblePoolSize:pool.length,actions:chosen,passiveOnlyActions,selectedNames,fixedSelectedNames,validLoadoutCount:candidates.length||1};
}

function tokenStatusNotesFromText(text=''){return RAMonsterRules.notesFromText(text);}
function tokenMonsterRowStatusNotes(row={}){const actions=tokenParseActions(row.actions||''),source=[row.passiveName||'',row.passiveEffect||'',...actions.flatMap(a=>[a.name||'',a.effect||''])].join(' ');return[...new Set(tokenStatusNotesFromText(source))];}
function tokenActionRange(action={}){return tokenNormalizeActionRange(action);}
function tokenActionCheckCommand(action={}){const parsed=tokenParseCheckType(action.checkType||'');if(!parsed.raw||parsed.left==='なし')return'';const base=tokenCompact(action.baseValue);if(base==='')return'';return`2D6+${base}+{補正}>=${parsed.right||'目標値'} 【${action.name||'魔物行動'}】`;}
function tokenDamageCommand(action={}){let power=tokenCompact(action.power);if(!power||power==='なし'||power==='-')return'';const type=tokenNormalizeActionType(action),effect=String(action.effect||''),isRecovery=type==='回復'||/回復$/.test(power)||(['補助','防御'].includes(type)&&/HP.*回復/.test(effect));if(isRecovery){power=power.replace(/回復$/,'');return`${power} 【${action.name||'魔物行動'}・回復】`;}return`${power} 【${action.name||'魔物行動'}ダメージ】`;}
function tokenMonsterChatPalette(row={}){const name=tokenCompact(row.name)||'名称未設定の魔物',actions=tokenParseActions(row.actions),lines=[];if(row.pullRule)lines.push(`// 引き寄せ：${row.pullRule}`);const conditionLabel=tokenCompact(row.conditionProfileLabel);if(conditionLabel)lines.push(`// 【環境個体：${conditionLabel}】`);const behaviorAI=tokenCompact(row.behaviorAI),behaviorPriority=tokenCompact(row.behaviorPriority)||'優先';if(behaviorAI){lines.push(`// 【固有行動AI：${behaviorPriority}】`);lines.push(`// ${behaviorAI}`);lines.push(behaviorPriority==='最優先'?'// 処理：条件該当PCだけを対象候補にし、複数なら等確率で抽選。':'// 処理：条件該当PCの抽選重み3、非該当PCの抽選重み1。');}if(row.passiveName||row.passiveEffect){lines.push(`// 【固有パッシブ：${row.passiveName||'名称未設定'}】`);if(row.passiveEffect)lines.push(`// ${tokenCompact(row.passiveEffect)}`);}if(actions.length){const passiveOnly=new Set(String(row.passiveOnlyActionNames||'').split(/[,、，\n]+/).map(v=>v.trim()).filter(Boolean)),selectable=actions.filter(a=>!passiveOnly.has(tokenCompact(a.name))),actionNames=selectable.map(a=>tokenCompact(a.name)||'名称未設定').filter(Boolean),conditional=a=>/(のみ使用|HPが半分以下|HP半分以下|次の行動で|戦闘中1回|1戦闘1回)/.test(`${a.effect||''} ${a.power||''}`),normal=selectable.filter(a=>!conditional(a)).map(a=>tokenCompact(a.name)||'名称未設定').filter(Boolean);if(normal.length&&normal.length<actionNames.length)lines.push(`choice[${normal.join(',')}]`);if(actionNames.length)lines.push(`choice[${actionNames.join(',')}]`);lines.push(`// ${name}`);actions.forEach(action=>{const actionName=action.name||'魔物行動',type=tokenNormalizeActionType(action),range=tokenActionRange(action),flags=tokenCompact(action.flags),target=tokenCompact(action.target)||'対象未設定',element=tokenCompact(action.element),check=tokenActionCheckCommand(action),damage=tokenDamageCommand(action),effect=tokenCompact(action.effect);if(passiveOnly.has(tokenCompact(action.name)))lines.push(`// 【パッシブ専用技】`);lines.push(`// 【${actionName}】 種別：${type}／距離：${range}${flags?` / ${flags}`:''}／対象：${target}${element?`／属性：${element}`:''}`);if(check)lines.push(check);if(damage){lines.push(damage);if(damage.includes('・回復】')){const alt=effect.match(/代わりに([0-9D+]+)回復/);if(alt)lines.push(`${alt[1]} 【${actionName}・条件成立時の回復】`);}}if(effect)lines.push(`// 効果：${effect}`);if(!check&&!damage&&!effect)lines.push(`// ${actionName}`);});const notes=tokenMonsterRowStatusNotes(row);if(notes.length){lines.push('// 【状態・フィールド】');notes.forEach(note=>lines.push(`// ${note}`));lines.push(...RAMonsterRules.fieldCommands([row.passiveEffect||'',...actions.map(a=>a.effect||'')].join(' ')));}}else{lines.push(`// ${name}`);lines.push('// 行動は未登録です。');}return lines.join('\n');}
function tokenMonsterByName(name=''){const target=String(name||'').trim();return(state.monsters||[]).find(row=>String(row.name||'').trim()===target)||null;}
function tokenMonsterSize(row={}){const imageId=String(row.baseMonsterId||row.id||'');const size=Number(MONSTER_TOKEN_SIZE_OVERRIDES[imageId])||3;return{width:size,height:size};}
function tokenNormalizeGroups(groups=[]){return normalizeEncounterFrontline((groups||[]).map(group=>({name:group?.name,count:group?.count,formation:group?.formation||group?.position||''}))).map(group=>({name:group.name,count:Math.max(1,Math.floor(Number(group.count)||1)),formation:group.formation||group.position||'前衛'}));}
function encounterGroupsSignature(groups=[]){return tokenNormalizeGroups(groups).map(g=>`${g.formation}|${g.name}|${g.count}`).sort().join('||');}
function setTokenExportEncounter(label='',areaName='',groups=[],scope='event'){
  const clean=tokenNormalizeGroups(groups);if(!clean.length){clearTokenExportEncounter(scope);return;}
  const last=state.lastEncounter,matched=last&&Array.isArray(last.instances)&&last.instances.length&&encounterGroupsSignature(last.groups||[])===encounterGroupsSignature(clean);
  const instances=matched?last.instances.map(x=>JSON.parse(JSON.stringify(x))):encounterInstanceRows(clean,{areaName:String(areaName||'').trim()});
  state.tokenExportEncounter={label:String(label||'戦闘').trim(),areaName:String(areaName||'').trim(),scope:scope==='quest'?'quest':'event',groups:clean,instances,reinforcementInstances:[]};renderTokenExportPanels();
}
function clearTokenExportEncounter(scope=''){if(scope&&state.tokenExportEncounter?.scope!==scope)return;state.tokenExportEncounter=null;renderTokenExportPanels();}
function tokenExportPanelId(scope){return scope==='quest'?'questTokenExportPanel':'eventTokenExportPanel';}
function tokenEncounterTotal(encounter){return(encounter?.groups||[]).reduce((sum,g)=>sum+Math.max(1,Math.floor(Number(g.count)||1)),0);}
function tokenReinforcementTableSummary(table=[]){
  const options=(table||[]).map(option=>(option.groups||[]).map(group=>`${group.formation||'前衛'}：${group.name} ×${Math.max(1,Number(group.count)||1)}`).join(' / ')).filter(Boolean);
  return [...new Set(options)].join(' または ');
}
function tokenReinforcementActionRows(encounter={}){
  const sources=[...(Array.isArray(encounter.instances)?encounter.instances:[]),...(Array.isArray(encounter.reinforcementInstances)?encounter.reinforcementInstances:[])],rows=[];
  sources.forEach(source=>{
    const uid=String(source.uid||'').trim();if(!uid)return;
    const used=new Set(Array.isArray(source.usedReinforcementActions)?source.usedReinforcementActions:[]);
    tokenParseActions(source.monster?.actions||'').forEach(action=>{
      const match=String(action.effect||'').match(/増援表「([^」]+)」/);if(!match||used.has(String(action.name||'')))return;
      const tableName=match[1],table=RAMonsterRules.reinforcementTable(tableName);if(!table?.length)return;
      rows.push({source,uid,actionName:String(action.name||'増援呼び'),tableName,summary:tokenReinforcementTableSummary(table)});
    });
  });
  return rows;
}
function renderTokenExportPanels(){['quest','event'].forEach(scope=>{const panel=$(tokenExportPanelId(scope));if(!panel)return;const encounter=state.tokenExportEncounter;if(!encounter||encounter.scope!==scope||!encounter.groups?.length){panel.classList.add('hidden');panel.innerHTML='';return;}const summary=encounter.groups.map(g=>`${g.formation||'前衛'}：${g.name} ×${g.count}`).join(' / '),reinforcements=tokenReinforcementActionRows(encounter),reinforcementHtml=reinforcements.length?`<div class="token-reinforcement-list"><div class="token-export-title" style="margin-top:10px">増援呼び</div>${reinforcements.map(row=>`<div class="token-export-meta" data-token-reinforcement-row="${esc(row.uid)}|${esc(row.actionName)}"><b>${esc(row.source.name||row.source.monster?.name||'魔物')}《${esc(row.actionName)}》</b><br>${esc(row.summary||row.tableName)}<div class="buttons" style="margin-top:6px"><button type="button" data-token-reinforcement="${scope}" data-source-uid="${esc(row.uid)}" data-action-name="${esc(row.actionName)}" data-table-name="${esc(row.tableName)}">増援ZIP出力</button></div></div>`).join('')}</div>`:'';panel.classList.remove('hidden');panel.innerHTML=`<div class="token-export-title">戦闘用の敵駒</div><div class="token-export-meta">${esc(encounter.label||'戦闘')}${encounter.areaName?` / ${esc(encounter.areaName)}`:''}<br>${esc(summary)}</div><div class="buttons"><button type="button" data-token-export="${scope}">駒出力</button><button type="button" data-token-export-folder="${scope}">ZIP保存先設定</button><span class="token-export-status" data-token-export-status="${scope}"></span></div>${reinforcementHtml}`;});tokenRefreshExportDirectoryUi();}
const TOKEN_EXPORT_DIRECTORY_DB='recraft-alchemia-token-export-directory-v1';
const TOKEN_EXPORT_DIRECTORY_STORE='handles';
const TOKEN_EXPORT_DIRECTORY_KEY='monsterTokenZipDirectory';
let tokenExportDirectoryHandleCache=null;
let tokenExportDirectoryHandleLoaded=false;
let tokenExportDirectoryHandleLoadPromise=null;
function tokenDirectoryPickerSupported(){return !!(window.isSecureContext&&window.showDirectoryPicker&&window.indexedDB);}
function tokenOpenDirectoryDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(TOKEN_EXPORT_DIRECTORY_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(TOKEN_EXPORT_DIRECTORY_STORE))db.createObjectStore(TOKEN_EXPORT_DIRECTORY_STORE);};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('ZIP保存先の保存領域を開けませんでした。'));});}
async function tokenLoadExportDirectoryHandle(){if(tokenExportDirectoryHandleLoaded)return tokenExportDirectoryHandleCache;if(tokenExportDirectoryHandleLoadPromise)return tokenExportDirectoryHandleLoadPromise;tokenExportDirectoryHandleLoadPromise=(async()=>{try{if(!tokenDirectoryPickerSupported())return null;const db=await tokenOpenDirectoryDb();const handle=await new Promise((resolve,reject)=>{const tx=db.transaction(TOKEN_EXPORT_DIRECTORY_STORE,'readonly'),req=tx.objectStore(TOKEN_EXPORT_DIRECTORY_STORE).get(TOKEN_EXPORT_DIRECTORY_KEY);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});db.close();tokenExportDirectoryHandleCache=handle&&handle.kind==='directory'?handle:null;return tokenExportDirectoryHandleCache;}catch(_e){tokenExportDirectoryHandleCache=null;return null;}finally{tokenExportDirectoryHandleLoaded=true;tokenExportDirectoryHandleLoadPromise=null;}})();return tokenExportDirectoryHandleLoadPromise;}
async function tokenStoreExportDirectoryHandle(handle){tokenExportDirectoryHandleCache=handle||null;tokenExportDirectoryHandleLoaded=true;if(!tokenDirectoryPickerSupported()||!handle)return;const db=await tokenOpenDirectoryDb();await new Promise((resolve,reject)=>{const tx=db.transaction(TOKEN_EXPORT_DIRECTORY_STORE,'readwrite');tx.objectStore(TOKEN_EXPORT_DIRECTORY_STORE).put(handle,TOKEN_EXPORT_DIRECTORY_KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error('ZIP保存先を保存できませんでした。'));tx.onabort=()=>reject(tx.error||new Error('ZIP保存先の保存が中断されました。'));});db.close();}
async function tokenDirectoryPermission(handle,request=false){if(!handle)return'denied';const options={mode:'readwrite'};try{let permission=typeof handle.queryPermission==='function'?await handle.queryPermission(options):'prompt';if(permission==='granted')return permission;if(request&&typeof handle.requestPermission==='function')permission=await handle.requestPermission(options);return permission;}catch(_e){return'denied';}}
async function tokenRefreshExportDirectoryUi(){const buttons=[...document.querySelectorAll('[data-token-export-folder]')];if(!buttons.length)return;if(!tokenDirectoryPickerSupported()){buttons.forEach(button=>{button.textContent='ZIP保存先：通常DL';button.title='このブラウザでは保存先フォルダの固定に対応していません。';});return;}const handle=await tokenLoadExportDirectoryHandle();buttons.forEach(button=>{button.textContent=handle?.name?`ZIP保存先：${handle.name}`:'ZIP保存先設定';button.title=handle?.name?`現在の保存先：${handle.name}（クリックで変更）`:'ZIP保存先フォルダを選択';});}
async function tokenChooseExportDirectory(scope='event'){if(!tokenDirectoryPickerSupported()){setTokenExportStatus(scope,'このブラウザでは保存先固定に対応していません。駒出力時は通常ダウンロードします。','warn');return null;}try{const handle=await window.showDirectoryPicker({id:'ra-monster-token-zip',mode:'readwrite'});const permission=await tokenDirectoryPermission(handle,true);if(permission!=='granted'){setTokenExportStatus(scope,'選択したフォルダへの書き込みが許可されませんでした。','bad');return null;}try{await tokenStoreExportDirectoryHandle(handle);}catch(_e){tokenExportDirectoryHandleCache=handle;tokenExportDirectoryHandleLoaded=true;setTokenExportStatus(scope,`保存先：${handle.name}（このセッションのみ保持）`,'warn');await tokenRefreshExportDirectoryUi();return handle;}setTokenExportStatus(scope,`ZIP保存先：${handle.name}`,'good');await tokenRefreshExportDirectoryUi();return handle;}catch(e){if(e?.name==='AbortError'){setTokenExportStatus(scope,'保存先の変更をキャンセルしました。');return null;}setTokenExportStatus(scope,e?.message||String(e),'bad');return null;}}
async function tokenResolveExportDestination(scope='event'){if(!tokenDirectoryPickerSupported())return{mode:'download',handle:null};let handle=await tokenLoadExportDirectoryHandle();if(!handle){handle=await tokenChooseExportDirectory(scope);if(!handle)return{mode:'cancel',handle:null};return{mode:'directory',handle};}const permission=await tokenDirectoryPermission(handle,true);if(permission==='granted')return{mode:'directory',handle};setTokenExportStatus(scope,`ZIP保存先「${handle.name||'選択済みフォルダ'}」への書き込み許可が必要です。［ZIP保存先］から再設定してください。`,'bad');return{mode:'cancel',handle:null};}
async function tokenSaveZipBlob(blob,filename,destination){if(destination?.mode==='directory'&&destination.handle){const fileHandle=await destination.handle.getFileHandle(filename,{create:true});const writable=await fileHandle.createWritable();let closed=false;try{await writable.write(blob);await writable.close();closed=true;}finally{if(!closed){try{await writable.abort();}catch(_e){}}}return{mode:'directory',name:destination.handle.name||''};}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return{mode:'download',name:''};}
function setTokenExportStatus(scope,text='',type=''){const el=document.querySelector(`[data-token-export-status="${scope}"]`);if(!el)return;el.textContent=String(text||'');el.className=`token-export-status${type?` ${type}`:''}`;}
function tokenAlphaSuffix(index){let n=Math.max(0,Math.floor(Number(index)||0))+1,out='';while(n>0){n-=1;out=String.fromCharCode(65+n%26)+out;n=Math.floor(n/26);}return out;}
function tokenRoundCoord(value){return Math.round(Number(value)*100)/100;}
function tokenPackZone(items=[],zone={left:-19,top:-6.5,width:8,height:7.5}){const n=items.length;if(!n)return;let cols=Math.max(1,Math.ceil(Math.sqrt(n*(zone.width/zone.height))));cols=Math.min(n,cols);let rows=Math.ceil(n/cols);while(rows>3&&cols<n){cols+=1;rows=Math.ceil(n/cols);}const cellW=zone.width/cols,cellH=zone.height/rows;items.forEach((item,index)=>{const col=index%cols,row=Math.floor(index/cols),w=item.width||3,h=item.height||3;item.x=tokenRoundCoord((zone.left+col*cellW+Math.max(0,(cellW-w)/2))*10);item.y=tokenRoundCoord((zone.top+row*cellH+Math.max(0,(cellH-h)/2))*10);});}
function tokenAssignPositions(instances=[]){if(instances.length===1&&instances[0].isBoss){const item=instances[0],zone={left:-19,top:-6.5,width:18,height:7.5};item.x=tokenRoundCoord((zone.left+(zone.width-item.width)/2)*10);item.y=tokenRoundCoord((zone.top+(zone.height-item.height)/2)*10);return;}const rear=instances.filter(x=>x.formation==='後衛'),front=instances.filter(x=>x.formation!=='後衛');tokenPackZone(rear,{left:-19,top:-6.5,width:8,height:7.5});tokenPackZone(front,{left:-9,top:-6.5,width:8,height:7.5});}
function tokenBuildInstances(encounter){
  const stored=Array.isArray(encounter?.instances)?encounter.instances:[];
  if(!stored.length&&encounter?.groups?.length){encounter.instances=encounterInstanceRows(encounter.groups,{fixedIv:!!encounter.fixedIv,areaName:encounter.areaName||''});return tokenBuildInstances(encounter);}
  const totals=new Map();(encounter.groups||[]).forEach(g=>totals.set(g.name,(totals.get(g.name)||0)+g.count));
  const seen=new Map(),instances=[];
  if(stored.length){
    stored.forEach((storedRow,sourceIndex)=>{
      const baseName=String(storedRow.name||storedRow.monster?.name||'').trim();
      const master=tokenMonsterByName(baseName);if(!master)return;
      const monster=storedRow.monster?JSON.parse(JSON.stringify(storedRow.monster)):master;
      const masterIndex=(state.monsters||[]).indexOf(master),size=tokenMonsterSize(master),traits=String(master.monsterTraits||'').split(/[,、，]/).map(v=>v.trim());
      const index=seen.get(baseName)||0;seen.set(baseName,index+1);
      instances.push({monster,masterIndex,sourceIndex,formation:storedRow.formation||'前衛',displayName:(totals.get(baseName)||0)>1?`${baseName}${tokenAlphaSuffix(index)}`:baseName,baseInitiative:Number(master.initiative)||0,width:size.width,height:size.height,isBoss:traits.includes('ボス')});
    });
  }else{
    (encounter.groups||[]).forEach(group=>{const monster=tokenMonsterByName(group.name);if(!monster)throw new Error(`${group.name} の魔物データを確認できません。`);const masterIndex=(state.monsters||[]).indexOf(monster),size=tokenMonsterSize(monster),traits=String(monster.monsterTraits||'').split(/[,、，]/).map(v=>v.trim());for(let i=0;i<group.count;i++){const index=seen.get(group.name)||0;seen.set(group.name,index+1);instances.push({monster,masterIndex,sourceIndex:instances.length,formation:group.formation||'前衛',displayName:(totals.get(group.name)||0)>1?`${group.name}${tokenAlphaSuffix(index)}`:group.name,baseInitiative:Number(monster.initiative)||0,width:size.width,height:size.height,isBoss:traits.includes('ボス')});}});
  }
  instances.sort((a,b)=>b.baseInitiative-a.baseInitiative||a.masterIndex-b.masterIndex||a.sourceIndex-b.sourceIndex);const byInitiative=new Map();instances.forEach(item=>{const key=String(item.baseInitiative);if(!byInitiative.has(key))byInitiative.set(key,[]);byInitiative.get(key).push(item);});byInitiative.forEach(list=>{const regular=list.filter(item=>!item.isBoss),digits=Math.max(1,String(regular.length).length),scale=10**digits;regular.forEach((item,index)=>{item.initiative=item.baseInitiative+(index+1)/scale;});list.filter(item=>item.isBoss).forEach(item=>{item.initiative=item.baseInitiative;});});tokenAssignPositions(instances);return instances;
}
function tokenCharacterId(){const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',bytes=new Uint8Array(20);crypto.getRandomValues(bytes);return Array.from(bytes,b=>chars[b%chars.length]).join('');}
function tokenCharacterData(instance,imageName,order){const row=instance.monster,hp=tokenCompact(row.hp),mp=tokenCompact(row.mp),status=[];if(hp!=='')status.push(tokenStatusEntry('HP',hp,hp));if(mp!=='')status.push(tokenStatusEntry('MP',mp,mp));status.push(tokenStatusEntry('補正',0,0),tokenStatusEntry('回避',row.evasionValue,row.evasionValue),tokenStatusEntry('抵抗',row.resistValue,row.resistValue),tokenStatusEntry('防御',row.defenseValue,row.defenseValue));return{name:instance.displayName,playerName:'',memo:'',initiative:instance.initiative,externalUrl:'',status,params:tokenAffinityParams(row),iconUrl:imageName,faces:[],x:instance.x,y:instance.y,z:0,angle:0,width:instance.width,height:instance.height,active:false,secret:false,invisible:false,hideStatus:false,color:'#888888',roomId:null,commands:tokenMonsterChatPalette(row),speaking:false,diceSkin:{},order};}
async function tokenSha256Hex(bytes){const view=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes),hash=await crypto.subtle.digest('SHA-256',view);return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');}
async function tokenFetchMonsterImage(monster){const id=String(monster?.baseMonsterId||monster?.id||'').trim();if(!id)throw new Error(`${monster?.name||'魔物'} の画像IDを確認できません。`);const filename=`${id}.png`,subdir=tokenCompact(CCFOLIA_MONSTER_IMAGE_SUBDIR[id]||''),urls=[];if(subdir)urls.push(`${CCFOLIA_MONSTER_IMAGE_BASE}${subdir}/${filename}`);urls.push(`${CCFOLIA_MONSTER_IMAGE_BASE}${filename}`);let lastError='';for(const url of [...new Set(urls)]){try{const response=await fetch(url,{cache:'no-cache'});if(!response.ok){lastError=`HTTP ${response.status}`;continue;}return new Uint8Array(await response.arrayBuffer());}catch(e){lastError=e?.message||String(e);}}throw new Error(`${monster.name||id} の駒画像を取得できませんでした。${lastError?`（${lastError}）`:''}`);}
function tokenSafeFilename(text='戦闘'){return String(text||'戦闘').replace(/[\\/:*?"<>|]/g,'_').replace(/\s+/g,' ').trim().slice(0,60)||'戦闘';}
function tokenTimestamp(){const d=new Date(),pad=n=>String(n).padStart(2,'0');return`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;}
async function exportEncounterTokens(encounter,scope='event',button=null){
  if(!encounter||!encounter.groups?.length){setTokenExportStatus(scope,'出力できる戦闘編成がありません。','bad');return false;}
  if(typeof JSZip==='undefined'){setTokenExportStatus(scope,'ZIP生成ライブラリを読み込めませんでした。','bad');return false;}
  const original=button?.textContent||'駒出力';
  if(button){button.disabled=true;button.textContent='作成中…';}
  try{
    const destination=await tokenResolveExportDestination(scope);
    if(destination.mode==='cancel')return false;
    setTokenExportStatus(scope,'魔物画像を取得しています…');
    const instances=tokenBuildInstances(encounter),uniqueMonsters=[...new Map(instances.map(x=>[x.monster.id,x.monster])).values()],imageInfo=new Map();
    for(let i=0;i<uniqueMonsters.length;i++){
      const monster=uniqueMonsters[i];
      setTokenExportStatus(scope,`魔物画像を取得中 ${i+1} / ${uniqueMonsters.length}`);
      const bytes=await tokenFetchMonsterImage(monster),hash=await tokenSha256Hex(bytes),filename=`${hash}.png`;
      imageInfo.set(monster.id,{bytes,filename});
    }
    const characters={},resources={},orderBase=Date.now()*1000;
    instances.forEach((instance,index)=>{const info=imageInfo.get(instance.monster.id);characters[tokenCharacterId()]=tokenCharacterData(instance,info.filename,orderBase+index);});
    imageInfo.forEach(info=>{resources[info.filename]={type:'image/png'};});
    const data={meta:{version:'1.1.0'},entities:{room:{},items:{},decks:{},notes:{},characters,effects:{},scenes:{},savedatas:{},snapshots:{}},resources},jsonText=JSON.stringify(data),jsonBytes=new TextEncoder().encode(jsonText),token=`0.${await tokenSha256Hex(jsonBytes)}`,zip=new JSZip();
    zip.file('__data.json',jsonBytes);zip.file('.token',token);imageInfo.forEach(info=>zip.file(info.filename,info.bytes));
    setTokenExportStatus(scope,'ZIPを生成しています…');
    const blob=await zip.generateAsync({type:'blob',compression:'STORE'}),source=tokenSafeFilename(encounter.label||encounter.areaName||'戦闘'),filename=`RA_駒_${source}_${tokenTimestamp()}.zip`;
    const saved=await tokenSaveZipBlob(blob,filename,destination);
    const destinationText=saved.mode==='directory'?` / 保存先：${saved.name}`:' / 通常ダウンロード';
    setTokenExportStatus(scope,`出力完了：敵${instances.length}体 / 画像${uniqueMonsters.length}枚${destinationText}`,'good');
    addLog(`駒出力：${encounter.label||'戦闘'} / 敵${instances.length}体 / 画像${uniqueMonsters.length}枚${destinationText}`);
    return true;
  }catch(e){
    const message=e?.message||String(e);
    setTokenExportStatus(scope,message,'bad');
    addLog(`駒出力失敗：${message}`);
    return false;
  }finally{
    if(button){button.disabled=false;button.textContent=original;}
  }
}
async function exportCurrentEncounterTokens(scope='event',button=null){
  const encounter=state.tokenExportEncounter;
  if(!encounter||encounter.scope!==scope||!encounter.groups?.length){setTokenExportStatus(scope,'出力できる戦闘編成がありません。','bad');return false;}
  return exportEncounterTokens(encounter,scope,button);
}
function tokenPickReinforcementOption(table=[]){
  const rows=(table||[]).filter(row=>Array.isArray(row.groups)&&row.groups.length);if(!rows.length)return null;
  const total=rows.reduce((sum,row)=>sum+Math.max(0,Number(row.weight)||0),0);if(total<=0)return rows[Math.floor(Math.random()*rows.length)];
  let roll=Math.random()*total;for(const row of rows){roll-=Math.max(0,Number(row.weight)||0);if(roll<0)return row;}return rows[rows.length-1];
}
async function exportReinforcementTokens(scope='event',sourceUid='',actionName='',tableName='',button=null){
  const encounter=state.tokenExportEncounter;if(!encounter||encounter.scope!==scope)return false;
  const sources=[...(Array.isArray(encounter.instances)?encounter.instances:[]),...(Array.isArray(encounter.reinforcementInstances)?encounter.reinforcementInstances:[])];
  const source=sources.find(row=>String(row.uid||'')===String(sourceUid||''));if(!source){setTokenExportStatus(scope,'増援を呼ぶ個体を確認できません。','bad');return false;}
  const used=new Set(Array.isArray(source.usedReinforcementActions)?source.usedReinforcementActions:[]);if(used.has(actionName)){renderTokenExportPanels();return false;}
  const action=tokenParseActions(source.monster?.actions||'').find(row=>String(row.name||'')===String(actionName||''));if(!action){setTokenExportStatus(scope,'この個体には現在その増援技が選出されていません。','bad');renderTokenExportPanels();return false;}
  const match=String(action.effect||'').match(/増援表「([^」]+)」/),resolvedTable=String(tableName||match?.[1]||'').trim(),table=RAMonsterRules.reinforcementTable(resolvedTable),picked=tokenPickReinforcementOption(table);
  if(!picked){setTokenExportStatus(scope,`増援表「${resolvedTable||'未設定'}」を解決できません。`,'bad');return false;}
  const groups=tokenNormalizeGroups(picked.groups||[]),instances=encounterInstanceRows(groups,{areaName:encounter.areaName||''}),label=`${source.name||source.monster?.name||'魔物'}《${actionName}》の増援`,reinforcementEncounter={label,areaName:encounter.areaName||'',scope,groups,instances,reinforcementInstances:[]};
  const success=await exportEncounterTokens(reinforcementEncounter,scope,button);if(!success)return false;
  source.usedReinforcementActions=[...used,actionName];
  if(!Array.isArray(encounter.reinforcementInstances))encounter.reinforcementInstances=[];
  encounter.reinforcementInstances.push(...instances);
  saveState(false);renderTokenExportPanels();
  addLog(`増援処理：${source.name||source.monster?.name||'魔物'}《${actionName}》 → ${groups.map(g=>`${g.formation||'前衛'}：${g.name}×${g.count}`).join(' / ')}`);
  return true;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function clamp(n){return Math.max(0,Math.min(100,Number(n)||0));}
function now(){return new Date().toLocaleString('ja-JP',{hour12:false});}
function addLog(text){state.log.unshift(`[${now()}] ${text}`); state.log=state.log.slice(0,80); renderLog(); saveState(false);}
function renderLog(){ $('log').innerHTML = state.log.length ? state.log.map(x=>`<div>${esc(x)}</div>`).join('') : '<div class="muted">ログはまだありません。</div>'; }
function setStatus(type,msg){const el=$('dbStatus'); el.className='status '+(type||''); el.textContent=msg;}
function saveState(show=true){
  if(show)discardDeferredSavedProgressState();
  const currentPayload={progress:state.progress, log:state.log, questEncounterCache:state.questEncounterCache||{}, areaBossEncountered:state.areaBossEncountered||{}, partySize:selectedPartySize(), lastQuestFixedEventText:state.lastQuestFixedEventText||'', lastQuestFixedEventKey:state.lastQuestFixedEventKey||'', lastQuestCheckCopyText:state.lastQuestCheckCopyText||'', lastQuestBattleCheckCopyText:state.lastQuestBattleCheckCopyText||'', lastEventCheckCopyText:state.lastEventCheckCopyText||'', lastEventText:state.lastEventText||'', lastEventKey:state.lastEventKey||'', lastEventOutcomeKey:state.lastEventOutcomeKey||'', lastEventRewardState:state.lastEventRewardState||null, lastEventTableRewardText:state.lastEventTableRewardText||'', lastEventTableRewardCopyText:state.lastEventTableRewardCopyText||'', lastEventTableRewardState:state.lastEventTableRewardState||null, lastEventTreasureCopyText:state.lastEventTreasureCopyText||'', lastEventTreasureResults:state.lastEventTreasureResults||[], lastQuestEventText:state.lastQuestEventText||'', lastQuestEventKey:state.lastQuestEventKey||'', lastQuestOutcomeKey:state.lastQuestOutcomeKey||'', lastQuestEventRewardState:state.lastQuestEventRewardState||null, lastQuestEventTableRewardText:state.lastQuestEventTableRewardText||'', lastQuestEventTableRewardCopyText:state.lastQuestEventTableRewardCopyText||'', lastQuestEventTableRewardState:state.lastQuestEventTableRewardState||null, lastQuestTreasureCopyText:state.lastQuestTreasureCopyText||'', lastQuestTreasureResults:state.lastQuestTreasureResults||[], lastBaseCheckCopyText:state.lastBaseCheckCopyText||'', lastBaseOutcomeKey:state.lastBaseOutcomeKey||'', triggeredQuestEvents:state.triggeredQuestEvents||{}, baseUnlockedAreaIds:state.baseUnlockedAreaIds||[], lastBaseEventText:state.lastBaseEventText||'', lastBaseEventKey:state.lastBaseEventKey||'', lastBaseRewardText:state.lastBaseRewardText||'', lastBaseRewardCopyText:state.lastBaseRewardCopyText||'', lastBaseEventRewardState:state.lastBaseEventRewardState||null, lastBaseEventTableRewardState:state.lastBaseEventTableRewardState||null, questRewardCache:state.questRewardCache||{}, treasureSetup:state.treasureSetup||null, treasureContext:state.treasureContext||null, dayState:state.dayState||{day:1,fatigue:0,usedActions:0,awaitingEnd:false}, lastEncounter:state.lastEncounter||null, dropEncounterInstances:state.dropEncounterInstances||[], dropMode:state.dropMode||'single', lastQuestReinforcementText:state.lastQuestReinforcementText||'', questWorkReinforcementCounts:state.questWorkReinforcementCounts||{}, tokenExportEncounter:state.tokenExportEncounter||null, areaWeatherById:state.areaWeatherById||{}, lastRumorText:state.lastRumorText||'', lastRumorKey:state.lastRumorKey||'', selectedRumorEventKey:typeof rumorSelectionEventKey==='function'?rumorSelectionEventKey():'', importantApplied:progressUiV738.importantApplied||{quest:null,event:null,base:null}, progressUiState:typeof v738SerializableUiState==='function'?v738SerializableUiState():null, timeSlot:selectedTimeSlot(), lastTreasureText:state.lastTreasureText||'', lastTreasureCopyText:state.lastTreasureCopyText||'', lastAppraisalText:state.lastAppraisalText||'', lastAppraisalCopyText:state.lastAppraisalCopyText||'', lastDropText:state.lastDropText||'', lastDropSuccessText:state.lastDropSuccessText||'', lastQuestHasTreasure:!!state.lastQuestHasTreasure, lastRecipeMerchantOffers:state.lastRecipeMerchantOffers||[], selectedRecipeMerchantId:state.selectedRecipeMerchantId||'', lastRecipeMerchantContext:state.lastRecipeMerchantContext||{scope:'',areaName:'',eventName:''}, lastRecipeMerchantTrades:state.lastRecipeMerchantTrades||[]};
  // 起動直後は進行度を自動復元しないが、「保存済み進行を復元」用の
  // セッションスナップショットは、明示保存・新規開始・初期化まで保護する。
  const currentWorld={
    dayState:currentPayload.dayState,
    timeSlot:currentPayload.timeSlot,
    partySize:currentPayload.partySize,
    areaWeatherById:currentPayload.areaWeatherById,
    lastRumorText:currentPayload.lastRumorText,
    lastRumorKey:currentPayload.lastRumorKey,
    selectedRumorEventKey:currentPayload.selectedRumorEventKey,
    baseUnlockedAreaIds:currentPayload.baseUnlockedAreaIds
  };
  const payload=deferredSavedProgressState
    ?{...deferredSavedProgressState,log:currentPayload.log,currentWorld}
    :currentPayload;
  localStorage.setItem(STORE_KEY,JSON.stringify(payload));
  if(show) addLog('進行状態を保存しました。');
}
function loadState(){
  // 起動時は「日付・時間帯・天候・噂・解放範囲」など世界側の継続情報だけ自動復元する。
  // クエスト/探索の進行度、イベント結果、戦闘編成、宝箱、商人などのセッション途中状態は
  // deferredSavedProgressState に保持し、「保存済み進行を復元」を押した時だけ展開する。
  try{
    const raw=localStorage.getItem(STORE_KEY);if(!raw)return;
    const data=JSON.parse(raw);deferredSavedProgressState=savedProgressSnapshotIsRestorable(data)?data:null;
    const world=(data.currentWorld&&typeof data.currentWorld==='object')?data.currentWorld:data;
    state.log=Array.isArray(data.log)?data.log:[];
    state.baseUnlockedAreaIds=Array.isArray(world.baseUnlockedAreaIds)?world.baseUnlockedAreaIds:[];
    setPartySize(world.partySize||4);
    state.areaWeatherById=(world.areaWeatherById&&typeof world.areaWeatherById==='object')?world.areaWeatherById:{};
    state.lastRumorText=String(world.lastRumorText||'');
    state.lastRumorKey=String(world.lastRumorKey||'');
    state.savedRumorEventKey=String(world.selectedRumorEventKey||'');
    state.timeSlot=normalizeTimeSlot(world.timeSlot||'朝');
    state.dayState=normalizeDayState(world.dayState);
  }catch(e){}
}
function restoreSavedState(){
  try{
    const raw=localStorage.getItem(STORE_KEY);
    if(!raw){addLog('復元できる保存済み進行状態がありません。'); return;}
    // deferred 保存中の現在世界状態は currentWorld に分離して保持する。
    // 「保存済み進行を復元」では、セッションが成立していた保存時点の世界条件ごと戻す。
    const data=JSON.parse(raw);
    const hasSaved=key=>Object.prototype.hasOwnProperty.call(data,key);
    const savedText=(key,fallback='')=>hasSaved(key)?String(data[key]??''):fallback;
    const savedNullable=(key,fallback=null)=>hasSaved(key)?(data[key]??null):fallback;
    const savedObject=(key,fallback={})=>(hasSaved(key)&&data[key]&&typeof data[key]==='object'&&!Array.isArray(data[key]))?data[key]:fallback;
    const savedArray=(key,fallback=[])=>hasSaved(key)&&Array.isArray(data[key])?data[key]:fallback;

    state.progress=hasSaved('progress')&&data.progress&&typeof data.progress==='object'?data.progress:{quests:{},areas:{}};
    state.log=savedArray('log',state.log||[]);
    state.questEncounterCache=savedObject('questEncounterCache',state.questEncounterCache||{});
    state.areaBossEncountered=savedObject('areaBossEncountered',state.areaBossEncountered||{});
    state.lastQuestFixedEventText=savedText('lastQuestFixedEventText',state.lastQuestFixedEventText||'');
    state.lastQuestFixedEventKey=savedText('lastQuestFixedEventKey',state.lastQuestFixedEventKey||'');
    state.lastQuestCheckCopyText=savedText('lastQuestCheckCopyText',state.lastQuestCheckCopyText||'');
    state.lastQuestBattleCheckCopyText=savedText('lastQuestBattleCheckCopyText',state.lastQuestBattleCheckCopyText||'');
    state.lastEventCheckCopyText=savedText('lastEventCheckCopyText',state.lastEventCheckCopyText||'');

    state.lastEventText=savedText('lastEventText',state.lastEventText||'');
    state.lastEventKey=savedText('lastEventKey',state.lastEventKey||'');
    state.lastEventOutcomeKey=savedText('lastEventOutcomeKey',state.lastEventOutcomeKey||'');
    state.lastEventRewardState=savedNullable('lastEventRewardState',state.lastEventRewardState||null);
    state.lastEventTableRewardText=savedText('lastEventTableRewardText',state.lastEventTableRewardText||'');
    state.lastEventTableRewardCopyText=savedText('lastEventTableRewardCopyText',state.lastEventTableRewardCopyText||'');
    state.lastEventTableRewardState=savedNullable('lastEventTableRewardState',state.lastEventTableRewardState||null);
    state.lastEventTreasureCopyText=savedText('lastEventTreasureCopyText',state.lastEventTreasureCopyText||'');
    state.lastEventTreasureResults=savedArray('lastEventTreasureResults',state.lastEventTreasureResults||[]);

    state.lastQuestEventText=savedText('lastQuestEventText',state.lastQuestEventText||'');
    state.lastQuestEventKey=savedText('lastQuestEventKey',state.lastQuestEventKey||'');
    state.lastQuestOutcomeKey=savedText('lastQuestOutcomeKey',state.lastQuestOutcomeKey||'');
    state.lastQuestEventRewardState=savedNullable('lastQuestEventRewardState',state.lastQuestEventRewardState||null);
    state.lastQuestEventTableRewardText=savedText('lastQuestEventTableRewardText',state.lastQuestEventTableRewardText||'');
    state.lastQuestEventTableRewardCopyText=savedText('lastQuestEventTableRewardCopyText',state.lastQuestEventTableRewardCopyText||'');
    state.lastQuestEventTableRewardState=savedNullable('lastQuestEventTableRewardState',state.lastQuestEventTableRewardState||null);
    state.lastQuestTreasureCopyText=savedText('lastQuestTreasureCopyText',state.lastQuestTreasureCopyText||'');
    state.lastQuestTreasureResults=savedArray('lastQuestTreasureResults',state.lastQuestTreasureResults||[]);

    state.lastBaseCheckCopyText=savedText('lastBaseCheckCopyText',state.lastBaseCheckCopyText||'');
    state.lastBaseOutcomeKey=savedText('lastBaseOutcomeKey',state.lastBaseOutcomeKey||'');
    state.triggeredQuestEvents=savedObject('triggeredQuestEvents',state.triggeredQuestEvents||{});
    state.baseUnlockedAreaIds=savedArray('baseUnlockedAreaIds',state.baseUnlockedAreaIds||[]);
    state.lastBaseRewardText=savedText('lastBaseRewardText',state.lastBaseRewardText||'');
    state.lastBaseRewardCopyText=savedText('lastBaseRewardCopyText',state.lastBaseRewardCopyText||'');
    state.lastBaseEventRewardState=savedNullable('lastBaseEventRewardState',state.lastBaseEventRewardState||null);
    state.lastBaseEventTableRewardState=savedNullable('lastBaseEventTableRewardState',state.lastBaseEventTableRewardState||null);
    state.questRewardCache=savedObject('questRewardCache',state.questRewardCache||{});
    state.lastBaseEventText=savedText('lastBaseEventText',state.lastBaseEventText||'');
    state.lastBaseEventKey=savedText('lastBaseEventKey',state.lastBaseEventKey||'');

    state.treasureSetup=savedNullable('treasureSetup',state.treasureSetup||null);
    state.treasureContext=savedNullable('treasureContext',state.treasureContext||null);
    state.lastEncounter=savedNullable('lastEncounter',state.lastEncounter||null);
    state.dropEncounterInstances=savedArray('dropEncounterInstances',state.dropEncounterInstances||[]);
    state.dropMode=hasSaved('dropMode')?(data.dropMode==='encounter'?'encounter':'single'):(state.dropMode||'single');
    state.lastQuestReinforcementText=savedText('lastQuestReinforcementText',state.lastQuestReinforcementText||'');
    state.questWorkReinforcementCounts=savedObject('questWorkReinforcementCounts',state.questWorkReinforcementCounts||{});
    state.tokenExportEncounter=savedNullable('tokenExportEncounter',state.tokenExportEncounter||null);
    state.areaWeatherById=savedObject('areaWeatherById',state.areaWeatherById||{});
    state.lastRumorText=savedText('lastRumorText',state.lastRumorText||'');
    state.lastRumorKey=savedText('lastRumorKey',state.lastRumorKey||'');
    const savedRumorEventKey=savedText('selectedRumorEventKey','');
    if(hasSaved('importantApplied')){
      const applied=savedObject('importantApplied',{});
      progressUiV738.importantApplied={quest:applied.quest||null,event:applied.event||null,base:applied.base||null};
    }
    state.dayState=normalizeDayState(hasSaved('dayState')?data.dayState:state.dayState);
    state.timeSlot=normalizeTimeSlot(hasSaved('timeSlot')?data.timeSlot:(state.timeSlot||'朝'));
    state.lastTreasureText=savedText('lastTreasureText',state.lastTreasureText||'');
    state.lastTreasureCopyText=savedText('lastTreasureCopyText',state.lastTreasureCopyText||'');
    state.lastAppraisalText=savedText('lastAppraisalText',state.lastAppraisalText||'');
    state.lastAppraisalCopyText=savedText('lastAppraisalCopyText',state.lastAppraisalCopyText||'');
    state.lastDropText=savedText('lastDropText',state.lastDropText||'');
    state.lastDropSuccessText=savedText('lastDropSuccessText',state.lastDropSuccessText||'');
    state.lastQuestHasTreasure=hasSaved('lastQuestHasTreasure')?!!data.lastQuestHasTreasure:!!state.lastQuestHasTreasure;
    state.lastRecipeMerchantOffers=savedArray('lastRecipeMerchantOffers',state.lastRecipeMerchantOffers||[]);
    state.selectedRecipeMerchantId=savedText('selectedRecipeMerchantId',state.selectedRecipeMerchantId||'');
    state.lastRecipeMerchantContext=savedObject('lastRecipeMerchantContext',state.lastRecipeMerchantContext||{scope:'',areaName:'',eventName:''});
    state.lastRecipeMerchantTrades=savedArray('lastRecipeMerchantTrades',state.lastRecipeMerchantTrades||[]);
    setPartySize(hasSaved('partySize')?data.partySize:(state.partySize||4));
    // 先に通常UIと噂を復元し、その後で進行中セッションを戻す。
    // 100%地点のボス噂再開では、セッション復元時点で選択中の噂が必要。
    renderAll();
    if(typeof restoreRumorSelectionByEventKey==='function')restoreRumorSelectionByEventKey(savedRumorEventKey);
    // renderAll() 内のデイリー同期は、まだ active セッション復元前なので
    // 保存済みデイリーの戦闘編成キャッシュを整理対象と誤認し得る。
    // セッションUIを戻す直前に、保存スナップショットの編成キャッシュを再投入する。
    state.questEncounterCache=savedObject('questEncounterCache',state.questEncounterCache||{});
    if(typeof v738RestoreSavedSessionUi==='function')v738RestoreSavedSessionUi(data.progressUiState||{});
    discardDeferredSavedProgressState();
    addLog('保存済み進行状態を復元しました。');
  }catch(e){addLog('保存済み進行状態の復元に失敗しました：'+e.message);}
}
function optText(row){return row ? `${row.name||row.eventName||row.id||'名称未設定'}` : '未選択';}
function fillSelect(sel, rows, labelFn){ sel.innerHTML=''; rows.forEach((r,i)=>{const o=document.createElement('option'); o.value=String(i); o.textContent=labelFn?labelFn(r):optText(r); sel.appendChild(o);}); if(!rows.length){const o=document.createElement('option'); o.value=''; o.textContent='データなし'; sel.appendChild(o);} }


function questBossText(q={}){
  const name=String(q.questBossName || '').trim();
  const monsters=String(q.bossMonster || '').trim();
  if(name && monsters) return `${name}（${monsters}）`;
  return name || monsters || '';
}
function questPrimaryFixedBattleEvent(q={}){
  const rows=questSpecificEvents(q).filter(e=>/戦闘発生|戦闘が発生|との戦闘/.test(String(e.result||'')));
  return rows.find(e=>Number(eventThreshold(e))===100)||rows.at(-1)||null;
}
function resolveQuestPreviewEncounter(q={},force=false){
  const fixed=questPrimaryFixedBattleEvent(q);
  if(fixed){
    const resolved=resolveQuestFixedEncounter(q,fixed,force);
    if(resolved)return resolved;
  }
  return resolveQuestEncounter(q,force);
}
function questBossFormationText(q={}){
  const marker=String(q.questBossComposition||'').trim();
  if(marker.startsWith('ランダム編成') || marker.startsWith('指定対象＋ランダム随伴')){
    const resolved=resolveQuestPreviewEncounter(q);
    return resolved ? encounterResolutionText(resolved) : String(q.questBossFormation||'人数対応ランダム編成').trim();
  }
  if(marker){
    const groups=encounterCompositionGroups({encounterComposition:marker},effectiveQuestPartySize(q));
    if(groups.length)return groups.map(g=>`${g.position}：${g.name} ×${g.count}`).join(' / ');
  }
  return String(q.questBossFormation || marker || '').trim();
}

function questCategoryFor(row={}){
  const raw=String(row.questCategory || '').trim();
  if(raw) return raw;
  const type=String(row.questType || '').trim();
  return type.includes('デイリー') ? 'デイリー' : '重要';
}
function questEnabled(row={}){
  return String(row.enabled ?? 'TRUE').trim().toUpperCase() !== 'FALSE';
}
function questRowsForCurrentCategory(){
  const showOff = !!$('questShowDisabledImportant')?.checked;
  return (state.quests || []).filter(q=>{
    const cat = questCategoryFor(q);
    if(cat !== currentQuestCategory) return false;
    if(cat === '重要'){
      const key=String(q.id||q.name||''),selectedKey=String($('questSelect')?.value||'');
      const isCurrentActive=!!progressUiV738.questActive&&selectedKey===key;
      if(questIsCleared(q)&&!isCurrentActive)return false;
      // 進行中の重要クエストは表示OFFにしてもセッション終了までは選択を維持する。
      if(!showOff&&!questEnabled(q)&&!isCurrentActive)return false;
    }
    if(cat === 'デイリー'){
      const key=String(q.id||q.name||''),selectedKey=String($('questSelect')?.value||'');
      const isCurrentActive=!!progressUiV738.questActive&&selectedKey===key;
      if(!questEnabled(q)&&!isCurrentActive)return false;
      const selectedKeys=new Set(state.lastDailyQuestKeys||[]);
      return isCurrentActive||selectedKeys.has(key);
    }
    return true;
  });
}
function fillQuestSelect(prefer=''){
  const sel=$('questSelect');
  if(!sel)return;
  const rows=questRowsForCurrentCategory();
  const prev=String(prefer || sel.value || '').trim();
  sel.innerHTML='';
  if(!rows.length){
    const o=document.createElement('option');
    o.value='';
    o.textContent=currentQuestCategory==='重要' ? '表示できる重要クエストがありません' : '表示できるデイリークエストがありません';
    sel.appendChild(o);
    return;
  }
  rows.forEach(q=>{
    const o=document.createElement('option');
    o.value=String(q.id || q.name || '');
    const off = !questEnabled(q) ? ' [OFF]' : '';
    const unlock = q.unlockResult ? ` / ${q.unlockResult}` : '';
    o.textContent=`${q.name||q.id}${off} / ${progressPlayerRank(q.rank)||''}${unlock}`;
    sel.appendChild(o);
  });
  if(prev && [...sel.options].some(o=>o.value===prev)) sel.value=prev;
}
function clearQuestSelectionContext(){
  clearQuestRandomEventHistory();
  state.lastQuestFixedEventText='';state.lastQuestFixedEventKey='';
  state.lastQuestReinforcementText='';
  progressUiV738.importantApplied.quest=null;
  progressUiV738.slotResolved.quest=false;
}
function clearAreaSelectionContext(){
  clearAreaRandomEventHistory();
  progressUiV738.importantApplied.event=null;
  progressUiV738.slotResolved.event=false;
}
function setQuestCategory(cat='重要',options={}){
  const before=String($('questSelect')?.value||'');
  currentQuestCategory = cat === 'デイリー' ? 'デイリー' : '重要';
  document.querySelectorAll('[data-quest-category]').forEach(btn=>btn.classList.toggle('active', btn.dataset.questCategory===currentQuestCategory));
  const showWrap=$('questShowOffWrap');
  if(showWrap) showWrap.classList.toggle('hidden', currentQuestCategory !== '重要');
  const dailySelection=$('dailyQuestSelectionPanel');
  if(dailySelection) dailySelection.classList.toggle('hidden', currentQuestCategory !== 'デイリー');
  const dailyTools=$('dailyQuestTools');
  if(dailyTools) dailyTools.classList.toggle('hidden', currentQuestCategory !== 'デイリー');
  fillQuestSelect();
  const after=String($('questSelect')?.value||'');
  if(options.resetContext!==false&&before&&after!==before){clearQuestSelectionContext();if(options.save!==false)saveState(false);}
  if(options.render!==false)renderQuest();
}
function questIsCleared(q={}){
  if(questCategoryFor(q)!=='重要') return false;
  const key=String(q.id||q.name||'');
  const p=(state.progress&&state.progress.quests&&state.progress.quests[key])||{};
  if(clamp(p.value)<100)return false;
  // 進行中の100%地点は、最終イベント解決前ならまだ未クリア。
  const selectedKey=String($('questSelect')?.value||'');
  if(progressUiV738.questActive&&selectedKey===key)return !!progressUiV738.slotResolved.quest;
  return true;
}
function questListMemoForCategory(category='重要'){
  const cat=category==='デイリー'?'デイリー':'重要';
  const showOff=!!$('questShowDisabledImportant')?.checked;
  const rows=(state.quests||[]).filter(q=>{
    if(questCategoryFor(q)!==cat) return false;
    if(cat==='重要'){
      if(questIsCleared(q)) return false;
      if(!showOff && !questEnabled(q)) return false;
      return true;
    }
    return questEnabled(q) && new Set(state.lastDailyQuestKeys||[]).has(String(q.id||q.name||''));
  });
  const title=cat==='重要' ? '【未クリア重要クエスト一覧】' : '【現在のデイリークエスト一覧】';
  if(!rows.length)return `${title}\n表示できるクエストはありません。`;
  return [title, rows.map(q=>questPublicInfoLines(q).join('\n')).join('\n\n')].join('\n');
}
function questListMemo(){
  return questListMemoForCategory(currentQuestCategory);
}
function sortedQuestAreas(){
  return [...(state.areas||[])].sort((a,b)=>{
    const ao=Number(a.unlockOrder),bo=Number(b.unlockOrder);
    if(Number.isFinite(ao)&&Number.isFinite(bo)&&ao!==bo)return ao-bo;
    if(Number.isFinite(ao)!==Number.isFinite(bo))return Number.isFinite(ao)?-1:1;
    return String(a.name||a.id||'').localeCompare(String(b.name||b.id||''),'ja');
  });
}
function emptyDailyQuestKeysByKind(){
  return Object.fromEntries(GUILD_DAILY_REQUEST_KINDS.map(kind=>[kind,[]]));
}
function readFacilityDailyQuestState(){
  try{
    const raw=localStorage.getItem(GUILD_DAILY_STORAGE_KEY);
    if(!raw)return null;
    const data=JSON.parse(raw);
    const keysByKind=emptyDailyQuestKeysByKind();
    if(data.keysByKind&&typeof data.keysByKind==='object'){
      GUILD_DAILY_REQUEST_KINDS.forEach(kind=>{
        keysByKind[kind]=Array.isArray(data.keysByKind[kind])?data.keysByKind[kind].map(String):[];
      });
    }else{
      const allKeys=Array.isArray(data.keys)?data.keys.map(String):[];
      const questMap=new Map((state.quests||[]).map(q=>[String(q.id||q.name||''),q]));
      allKeys.forEach(key=>{
        const kind=String(questMap.get(String(key))?.requestKind||'').trim();
        if(GUILD_DAILY_REQUEST_KINDS.includes(kind))keysByKind[kind].push(String(key));
      });
    }
    const areaId=String(data.areaId||'');
    const unlockedAreaIds=Array.isArray(data.unlockedAreaIds)
      ? [...new Set(data.unlockedAreaIds.map(String).filter(Boolean))]
      : (areaId?[areaId]:[]);
    return {
      keys:GUILD_DAILY_REQUEST_KINDS.flatMap(kind=>keysByKind[kind]),
      keysByKind,
      countsByKind:(data.countsByKind&&typeof data.countsByKind==='object')?data.countsByKind:{},
      areaId,
      unlockedAreaIds,
      updatedAt:String(data.updatedAt||'')
    };
  }catch(e){
    console.warn('facility daily quest state load failed',e);
    return null;
  }
}
function syncDailyQuestSelectionFromFacility({render=false,log=false}={}){
  const activeQuestBefore=progressUiV738.questActive?selected($('questSelect'),state.quests):null;
  const activeDailyId=activeQuestBefore&&questCategoryFor(activeQuestBefore)==='デイリー'?String(activeQuestBefore.id||activeQuestBefore.name||''):'';
  const dailyQuestIds=new Set((state.quests||[]).filter(q=>questCategoryFor(q)==='デイリー').map(q=>String(q.id||q.name||'')));
  const cacheEntries=Object.entries(state.questEncounterCache||{});
  const nonDailyEncounterCache=Object.fromEntries(cacheEntries.filter(([key])=>!dailyQuestIds.has(String(key).split('::')[1]||'')));
  const activeEncounterCache=activeDailyId
    ?Object.fromEntries(cacheEntries.filter(([key])=>String(key).includes(`::${activeDailyId}::`)))
    :{};
  const shared=readFacilityDailyQuestState();
  state.questEncounterCache={...nonDailyEncounterCache,...activeEncounterCache};
  if(!shared){
    state.lastDailyQuestKeys=[];
    state.lastDailyQuestKeysByKind=emptyDailyQuestKeysByKind();
    state.lastDailyQuestText='【ギルド・デイリークエスト】\nデイリークエストがまだ選出されていません。';
    state.dailyQuestUnlockedAreaId='';
    state.dailyQuestUnlockedAreaIds=[];
    progressUiV738.dailyCounts={...GUILD_DAILY_DEFAULT_COUNTS_V738};
  }else{
    state.lastDailyQuestKeys=shared.keys;
    state.lastDailyQuestKeysByKind=shared.keysByKind;
    state.dailyQuestUnlockedAreaId=shared.areaId;
    state.dailyQuestUnlockedAreaIds=shared.unlockedAreaIds||[];
    progressUiV738.dailyCounts=Object.fromEntries(GUILD_DAILY_REQUEST_KINDS.map(kind=>[kind,v740NormalizeDailyCount(shared.countsByKind?.[kind],GUILD_DAILY_DEFAULT_COUNTS_V738[kind])]));
    state.lastDailyQuestText=dailyQuestTextFor(selectedFacilityDailyQuestRowsByKind());
  }
  v740SyncDailyCountControls();
  ensureWeatherForUnlockedAreas(false);
  saveState(false);
  if(render){
    renderWeatherManager();
    const selectedQuestId=String($('questSelect')?.value||'').trim();
    renderDailyQuestResult();
    if(currentQuestCategory==='デイリー'){
      const availableKeys=new Set((state.lastDailyQuestKeys||[]).map(String));
      const preferredQuestId=activeDailyId
        || (selectedQuestId&&availableKeys.has(selectedQuestId)?selectedQuestId:String(state.lastDailyQuestKeys[0]||''));
      fillQuestSelect(preferredQuestId);
      if(activeDailyId){
        const sel=$('questSelect');
        let opt=[...(sel?.options||[])].find(o=>o.value===activeDailyId);
        if(!opt&&activeQuestBefore&&sel){
          opt=document.createElement('option');
          opt.value=activeDailyId;
          opt.textContent=`${activeQuestBefore.name||activeDailyId} / 進行中`;
          opt.dataset.activeDailySession='1';
          sel.appendChild(opt);
        }
        if(opt)sel.value=activeDailyId;
      }
      renderQuest();
    }
  }
  if(log)addLog(shared?'保存済みのデイリークエスト選出を再読込しました。':'保存済みのデイリークエスト選出が見つかりません。');
  return shared;
}
function selectedFacilityDailyQuestRowsByKind(){
  const map=new Map((state.quests||[]).filter(q=>questCategoryFor(q)==='デイリー'&&questEnabled(q)).map(q=>[String(q.id||q.name||''),q]));
  const out=emptyDailyQuestKeysByKind();
  GUILD_DAILY_REQUEST_KINDS.forEach(kind=>{
    out[kind]=(state.lastDailyQuestKeysByKind?.[kind]||[]).map(k=>map.get(String(k))).filter(Boolean);
  });
  return out;
}
function selectedFacilityDailyQuestRows(){
  const grouped=selectedFacilityDailyQuestRowsByKind();
  return GUILD_DAILY_REQUEST_KINDS.flatMap(kind=>grouped[kind]||[]);
}
function dailyQuestTextFor(grouped={}){
  const lines=['【ギルド・デイリークエスト】'];
  let total=0;
  GUILD_DAILY_REQUEST_KINDS.forEach(kind=>{
    const rows=Array.isArray(grouped[kind])?grouped[kind]:[];
    total+=rows.length;
    lines.push('',`■${kind}`);
    lines.push(rows.length?rows.map(q=>questPublicInfoLines(q).join('\n')).join('\n\n'):'選出なし');
  });
  if(!total)return '【ギルド・デイリークエスト】\n選出されているデイリークエストはありません。';
  return lines.join('\n');
}
function ensureDailyQuestSelection(){
  const shared=readFacilityDailyQuestState();
  if(shared){
    state.lastDailyQuestKeys=shared.keys;
    state.lastDailyQuestKeysByKind=shared.keysByKind;
    state.dailyQuestUnlockedAreaId=shared.areaId;
    state.dailyQuestUnlockedAreaIds=shared.unlockedAreaIds||[];
  }else{
    state.lastDailyQuestKeys=[];
    state.lastDailyQuestKeysByKind=emptyDailyQuestKeysByKind();
    state.dailyQuestUnlockedAreaId='';
    state.dailyQuestUnlockedAreaIds=[];
  }
  const grouped=selectedFacilityDailyQuestRowsByKind();
  state.lastDailyQuestText=dailyQuestTextFor(grouped);
  return GUILD_DAILY_REQUEST_KINDS.flatMap(kind=>grouped[kind]||[]);
}
function renderDailyQuestResult(){
  const box=$('dailyQuestResult');
  if(!box)return;
  const shared=readFacilityDailyQuestState();
  ensureDailyQuestSelection();
  if(!shared){
    box.innerHTML='<b>まだ選出されていません。</b><br>上の個別抽選または全体抽選を使用してください。';
    return;
  }
  const counts=GUILD_DAILY_REQUEST_KINDS.map(kind=>`${kind} ${state.lastDailyQuestKeysByKind?.[kind]?.length||0}件`).join('／');
  const synced=shared.updatedAt ? `<br><span class="muted">更新：${esc(new Date(shared.updatedAt).toLocaleString('ja-JP',{hour12:false}))}</span>` : '';
  box.innerHTML=`<b>現在の選出</b><br>${esc(counts)}${synced}<hr>${esc(state.lastDailyQuestText).replace(/\n/g,'<br>')}`;
}


function monsterNameTokens(value){return String(value||'').split(/[、,，\n\/／]+/).map(v=>v.trim()).filter(Boolean);}
function sortedDropAreas(){
  return [...(state.areas||[])].sort((a,b)=>Number(a.unlockOrder||999999)-Number(b.unlockOrder||999999) || String(a.name||a.id||'').localeCompare(String(b.name||b.id||''),'ja'));
}
function fillDropAreaSelect(prefer=''){
  const sel=$('dropAreaSelect'); if(!sel)return;
  const rows=sortedDropAreas();
  const prev=String(prefer||sel.value||'').trim();
  sel.innerHTML='';
  rows.forEach(a=>{const o=document.createElement('option');o.value=String(a.id||a.name||'');o.textContent=String(a.name||a.id||'');sel.appendChild(o);});
  if(!rows.length){const o=document.createElement('option');o.value='';o.textContent='エリアデータなし';sel.appendChild(o);return;}
  sel.value=[...sel.options].some(o=>o.value===prev)?prev:String(rows[0].id||rows[0].name||'');
}
function selectedDropArea(){
  const key=String($('dropAreaSelect')?.value||'').trim();
  return (state.areas||[]).find(a=>String(a.id||a.name||'')===key) || null;
}
function eventMonsterNamesForArea(area={}){
  const names=new Set();
  const tableId=String(area.eventTableId||'').trim();
  const areaName=String(area.name||area.areaName||'').trim();
  const known=[...(state.monsters||[])].map(m=>String(m.name||'').trim()).filter(Boolean).sort((a,b)=>b.length-a.length);
  (state.events||[]).filter(e=>(tableId&&String(e.tableId||e.eventTableId||'').trim()===tableId) || (areaName&&String(e.areaName||'').trim()===areaName)).forEach(e=>{
    const text=[e.encounterComposition,e.encounterFormation,e.result,e.eventName].map(v=>String(v||'')).join(' / ');
    known.forEach(name=>{if(text.includes(name))names.add(name);});
  });
  return [...names];
}
function dropAreaMonsterRows(){
  const area=selectedDropArea(); if(!area)return [];
  const names=[...new Set([...monsterNameTokens(area.mainMonsters),...eventMonsterNamesForArea(area)])];
  const byName=new Map((state.monsters||[]).map(m=>[String(m.name||'').trim(),m]));
  const rows=names.map(name=>byName.get(name)).filter(m=>m&&!isAreaBossMonster(m));
  const missing=(state.monsters||[]).filter(m=>!isAreaBossMonster(m)&&String(m.areaName||'').trim()===String(area.name||'').trim() && !rows.includes(m));
  return rows.concat(missing);
}
function monsterOptionLabel(m={}){
  return [m.rank?progressPlayerRank(m.rank):'',m.monsterType||'',m.monsterTraits?`特性:${m.monsterTraits}`:'',m.hp?`HP:${m.hp}`:''].filter(Boolean).join(' / ');
}
function dropMonsterKey(m={}){return String(m.id||m.name||'').trim();}
function selectedDropMonster(){
  const rows=dropAreaMonsterRows();
  const key=String($('monsterSelectValue')?.value||'').trim();
  if(!key)return null;
  return rows.find(m=>dropMonsterKey(m)===key) || rows.find(m=>String(m.name||'').trim()===key) || null;
}
function setSelectedDropMonster(monster,options={}){
  const input=$('monsterSelect');
  const hidden=$('monsterSelectValue');
  if(!input||!hidden)return;
  if(!monster){hidden.value='';if(options.clearInput!==false)input.value='';return;}
  hidden.value=dropMonsterKey(monster);
  input.value=String(monster.name||monster.id||'');
}
let suppressMonsterFocusOpen=false;
function closeMonsterMenu(){const menu=$('monsterSelectMenu');const input=$('monsterSelect');if(menu)menu.hidden=true;if(input)input.setAttribute('aria-expanded','false');}
function openMonsterMenu(query=''){const menu=$('monsterSelectMenu');const input=$('monsterSelect');if(!menu||!input)return;renderMonsterMenu(query);menu.hidden=false;input.setAttribute('aria-expanded','true');}
function renderMonsterMenu(query=''){
  const menu=$('monsterSelectMenu'); if(!menu)return;
  const q=String(query||'').trim().toLowerCase();
  const selectedKey=String($('monsterSelectValue')?.value||'').trim();
  const rows=dropAreaMonsterRows().filter(m=>!q || [m.name,m.id,m.monsterType,m.monsterTraits].join(' ').toLowerCase().includes(q));
  menu.innerHTML=rows.length?rows.map(m=>{
    const key=dropMonsterKey(m);
    const active=key===selectedKey;
    return `<div class="monster-option${active?' active':''}" role="option" tabindex="-1" aria-selected="${active?'true':'false'}" data-monster-id="${esc(key)}"><span class="monster-option-name">${esc(m.name||m.id||'名称未設定')}</span><span class="monster-option-meta">${esc(monsterOptionLabel(m)||'登録情報なし')}</span></div>`;
  }).join(''):'<div class="monster-option-empty">条件に一致する魔物がありません。</div>';
}
function fillMonsterSearch(prefer=''){
  const input=$('monsterSelect');
  const hidden=$('monsterSelectValue');
  if(!input||!hidden)return;
  const rows=dropAreaMonsterRows();
  const prev=String(prefer||hidden.value||input.value||'').trim();
  const matched=rows.find(m=>dropMonsterKey(m)===prev) || findBySearchValue(prev,rows) || rows[0] || null;
  setSelectedDropMonster(matched);
  input.placeholder=rows.length?'魔物名を検索・選択':'このエリアに魔物が登録されていません';
  renderMonsterMenu('');
}
function refreshDropMonsterSelection(prefer=''){
  fillMonsterSearch(prefer);
  closeMonsterMenu();
  renderMonster();
}
function jsonp(params, timeoutMs=45000){
  return new Promise((resolve,reject)=>{
    const cb='rca_cb_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    const script=document.createElement('script');
    const q=new URLSearchParams(); Object.entries(params||{}).forEach(([k,v])=>{if(v!==undefined&&v!==null)q.set(k,String(v));}); q.set('callback',cb);
    const timer=setTimeout(()=>cleanup(()=>reject(new Error('DB応答がタイムアウトしました'))),timeoutMs);
    function cleanup(done){clearTimeout(timer); delete window[cb]; script.remove(); done&&done();}
    window[cb]=data=>cleanup(()=> data&&data.ok!==false ? resolve(data) : reject(new Error(data&&data.error?data.error:'DB処理に失敗しました')));
    script.onerror=()=>cleanup(()=>reject(new Error('DBへ接続できませんでした')));
    script.src=GAS_URL+'?'+q.toString(); document.body.appendChild(script);
  });
}
function progressNoCorsPostAction(action,params={}){
  const body=new URLSearchParams();body.set('action',action);body.set('payload',JSON.stringify(params||{}));
  return fetch(GAS_URL,{method:'POST',mode:'no-cors',body}).then(()=>({ok:true,sentNoCors:true}));
}
function progressPostAction(action,params={},timeoutMs=30000){
  return new Promise((resolve,reject)=>{
    const token='rca_post_'+Date.now()+'_'+Math.random().toString(36).slice(2),frames=[];
    let settled=false,retryTimer=0,timeoutTimer=0,attemptNo=0;
    function cleanup(){if(retryTimer)clearInterval(retryTimer);if(timeoutTimer)clearTimeout(timeoutTimer);window.removeEventListener('message',onMessage);frames.forEach(frame=>setTimeout(()=>{try{frame.remove();}catch(_){}},0));}
    function finishResolve(value){if(settled)return;settled=true;cleanup();resolve(value);}
    function finishReject(error){if(settled)return;settled=true;cleanup();reject(error);}
    function onMessage(event){const data=event.data||{};if(data.type!=='recraft-db-post-result'||String(data.token||'')!==token)return;const result=data.result||{ok:false,error:'DB保存結果が空です。'};if(result.ok===false){finishReject(new Error(result.error||'DB保存に失敗しました'));return;}finishResolve(result);}
    function submitAttempt(){
      if(settled)return;attemptNo++;
      const frame=document.createElement('iframe');frame.name='rcaPostFrame_'+Date.now()+'_'+attemptNo+'_'+Math.random().toString(36).slice(2);frame.style.display='none';frame.setAttribute('aria-hidden','true');document.body.appendChild(frame);frames.push(frame);
      try{const doc=frame.contentDocument||frame.contentWindow?.document;if(!doc)throw new Error('進行保存用通信フレームを初期化できませんでした。');const form=doc.createElement('form'),actionUrl=new URL(GAS_URL);actionUrl.searchParams.set('action',action);actionUrl.searchParams.set('responseMode','postMessage');actionUrl.searchParams.set('token',token);form.method='POST';form.action=actionUrl.toString();form.enctype='application/x-www-form-urlencoded';form.acceptCharset='UTF-8';const field=doc.createElement('input');field.type='hidden';field.name='payload';field.value=JSON.stringify({...params,token});form.appendChild(field);doc.body.appendChild(form);form.submit();}
      catch(error){try{frame.remove();}catch(_){}const idx=frames.indexOf(frame);if(idx>=0)frames.splice(idx,1);if(attemptNo===1)finishReject(error);}
    }
    window.addEventListener('message',onMessage);submitAttempt();if(settled)return;
    retryTimer=setInterval(submitAttempt,Math.max(8000,Math.min(15000,Math.floor((Number(timeoutMs)||30000)/3))));
    timeoutTimer=setTimeout(()=>finishReject(new Error('進行データ保存の応答確認がタイムアウトしました。')),Math.max(15000,Number(timeoutMs)||30000));
  });
}
async function verifyCommunityGatheringSave(facilityId,values){
  for(let attempt=0;attempt<10;attempt++){
    if(attempt>0)await new Promise(resolve=>setTimeout(resolve,Math.min(4000,700+attempt*250)));
    try{
      const result=await jsonp({action:'communityGatheringState'},20000);
      const row=(result.facilities||[]).find(x=>String(x.id||'')===String(facilityId||''));
      if(row){
        const actual=Object.fromEntries((row.requirements||[]).map(req=>[String(req.name||''),Math.max(0,Math.floor(Number(req.current)||0))]));
        const expected=Object.fromEntries(Object.entries(values||{}).map(([k,v])=>[String(k),Math.max(0,Math.floor(Number(v)||0))]));
        if(Object.entries(expected).every(([k,v])=>actual[k]===v))return result;
      }
    }catch(_){}
  }
  throw new Error('共同採取設備の保存完了を確認できませんでした。再読み込みして確認してください。');
}
let communityGatheringManagerState={facilities:[]};
function renderCommunityGatheringManager(){
  const host=$('communityManagerCards');
  if(!host)return;
  const rows=Array.isArray(communityGatheringManagerState?.facilities)?communityGatheringManagerState.facilities:[];
  if(!rows.length){host.innerHTML='<div class="card muted">共同採取設備の共有進捗はありません。</div>';return;}
  host.innerHTML=rows.map(row=>{
    const requirements=Array.isArray(row.requirements)?row.requirements:[];
    const reqHtml=requirements.map(req=>{
      const name=String(req.name||'');
      const required=Math.max(0,Math.floor(Number(req.required)||0));
      const current=Math.min(required,Math.max(0,Math.floor(Number(req.current)||0)));
      return `<label class="community-manager-row"><span>${esc(name)} <small>${current}/${required}</small></span><input type="number" min="0" max="${required}" step="1" value="${current}" data-community-facility="${esc(String(row.id||''))}" data-community-material="${esc(name)}"><span>${required}</span></label>`;
    }).join('');
    const output=row.output&&typeof row.output==='object'?`${row.output.name||''}${row.output.amount?` ${row.output.amount}`:''}`:'';
    return `<article class="community-manager-card"><h3>${esc(row.name||row.id||'共同採取設備')}</h3><div class="community-manager-meta">${esc(row.areaName||'')}${row.updatedAt?` / 更新：${esc(row.updatedAt)}`:''}</div>${row.description?`<p>${esc(row.description)}</p>`:''}<div class="community-manager-progress"><span style="width:${Math.max(0,Math.min(100,Number(row.percent)||0))}%"></span></div><div class="muted small">進捗 ${Math.max(0,Math.min(100,Number(row.percent)||0))}%${row.complete?' / 完成':''}</div>${reqHtml}${output?`<div class="muted small">完成後：${esc(output)}${row.usage?` / ${esc(row.usage)}`:''}</div>`:''}<div class="buttons"><button type="button" class="secondary" data-community-send="${esc(String(row.id||''))}">現在値を保存</button></div></article>`;
  }).join('');
}
async function loadCommunityGatheringManager(){
  const status=$('communityStatus');
  if(status){status.className='status warn';status.textContent='共有進捗を読み込んでいます。';}
  try{
    const result=await jsonp({action:'communityGatheringState'},20000);
    if(!result||result.ok===false)throw new Error(result?.error||'共有進捗を取得できませんでした。');
    communityGatheringManagerState={facilities:Array.isArray(result.facilities)?result.facilities:[]};
    renderCommunityGatheringManager();
    if(status){status.className='status ok';status.textContent=`共有進捗を読み込みました（${communityGatheringManagerState.facilities.length}設備）。`;}
  }catch(error){
    communityGatheringManagerState={facilities:[]};renderCommunityGatheringManager();
    if(status){status.className='status bad';status.textContent=`共有進捗の読込に失敗しました：${error?.message||error}`;}
  }
}
async function saveCommunityGatheringFacility(facilityId){
  const status=$('communityStatus');
  const row=(communityGatheringManagerState.facilities||[]).find(x=>String(x.id||'')===String(facilityId||''));if(!row)return;
  const values={};
  document.querySelectorAll(`[data-community-facility="${CSS.escape(String(facilityId))}"]`).forEach(input=>{values[input.dataset.communityMaterial]=Math.max(0,Math.floor(Number(input.value)||0));});
  if(status){status.className='status warn';status.textContent=`${row.name}の現在値を送信しています。`;}
  try{
    let result=await progressPostAction('communityGatheringUpdate',{facilityId,values},20000);
    if(result?.sentNoCors)result=await verifyCommunityGatheringSave(facilityId,values);
    communityGatheringManagerState={facilities:Array.isArray(result.facilities)?result.facilities:[]};renderCommunityGatheringManager();
    if(status){status.className='status ok';status.textContent=`${row.name}の共有進捗を保存しました。`;}
  }catch(error){if(status){status.className='status bad';status.textContent=`保存に失敗しました：${error.message||error}`;}}
}
function saveMasterCache(data,version=''){
  try{localStorage.setItem(MASTER_CACHE_KEY,JSON.stringify({savedAt:Date.now(),version,data}));}catch(_e){}
}
function loadMasterCache(){
  try{
    const raw=localStorage.getItem(MASTER_CACHE_KEY);if(!raw)return null;
    const cache=JSON.parse(raw);return normalizeProgressMaster(cache.data||cache,{version:String(cache.version||'')});
  }catch(_e){return null;}
}
async function loadBundledProgressMaster(){
  // 起動時はネットワーク上の大容量masterを待たず、同梱DBで先に画面を使用可能にする。
  const candidates=[
    new URL('./data/recraft_alchemia_initial_data.json',window.location.href),
    new URL('../../../data/recraft_alchemia_initial_data.json',window.location.href)
  ];
  const errors=[];
  for(const bundledUrl of candidates){
    try{
      bundledUrl.searchParams.set('_ra',VERSION);
      const raw=await progressFetchJson(bundledUrl.toString(),{timeoutMs:6000,cacheMode:'force-cache'});
      return normalizeProgressMaster(raw,{version:String(raw?.version||'')});
    }catch(error){errors.push(`${bundledUrl.pathname}: ${error.message||error}`);}
  }
  throw new Error(errors.join(' / ')||'同梱共通DBを取得できませんでした。');
}
async function acquireProgressMaster(){
  try{
    const github=await fetchGithubProgressMaster();
    saveMasterCache(github.data,github.version);
    return {...github,source:'GitHub共通DB'};
  }catch(githubError){
    console.warn('GitHub共通DBを利用できません。',githubError);
    const cached=loadMasterCache();
    if(cached)return {...cached,source:'前回キャッシュ',warning:githubError.message||String(githubError)};
    try{
      const bundled=await loadBundledProgressMaster();
      saveMasterCache(bundled.data,bundled.version);
      return {...bundled,source:'同梱共通DB',warning:githubError.message||String(githubError)};
    }catch(bundledError){
      console.warn('同梱DBも利用できないためGASへ切り替えます。',bundledError);
      try{
        const gas=await jsonp({action:'progressMaster'},20000);
        const normalized=normalizeProgressMaster(gas,{version:String(gas?.version||'')});
        saveMasterCache(normalized.data,normalized.version||'');
        return {...normalized,source:'GASフォールバック',warning:[githubError.message,bundledError.message].filter(Boolean).join(' / ')};
      }catch(gasError){
        throw new Error(`共通DBの読込に失敗しました：${[githubError.message,bundledError.message,gasError.message].filter(Boolean).join(' / ')}`);
      }
    }
  }
}
const PROGRESS_IMMEDIATE_EVENT_RESULT_PATCHES={
  evt_wetland_09:'感知成功：水面の反射に紛れた採取物を見つけ、入手アイテム表の抽選結果1枠を入手。目標値+3以上：澄んだ水×1を追加で入手。失敗：入手なし。',
  evt_wetland_38:'判定成功：浅い場所を見分けて安全に通過する。失敗：足場を読み違え、PC全員は1D3の物属性ダメージ。',
  evt_otherworld_19:'判定成功：歪みの境界を見分けて安全に通過する。失敗：境界の揺らぎに巻き込まれ、PC全員は1D3の無属性ダメージ。',
  evt_otherworld_21:'集中成功：遅れて返る音を分離し、反響が集まる地点から入手アイテム表の抽選結果1枠を入手。感知で代用可能（判定-2）。感知成功：同じ抽選結果1枠を入手。失敗：反響に感覚を乱され、PC全員はMPを1点失う。',
  evt_otherworld_23:'魔法成功：揺らぐ魔力を打ち消し、偽の足場の下に残った素材から入手アイテム表の抽選結果1枠を入手。探索で代用可能（判定-2）。探索成功：同じ抽選結果1枠を入手。失敗：偽の足場を踏み抜き、PC全員は1D3の無属性・防御無視ダメージ。',
  evt_otherworld_29:'判定成功：観測杭の印を読み取り、虚ろ雫×1を入手。失敗：印を読み取れない。',
  evt_mine_01:'成功：安全な足場を見つけ、その周辺から鉄鉱石×1を入手。失敗：味方全員は1D3ダメージ。',
  evt_mine_15:'操作成功：制御盤を復旧して下層の整備足場へ移動し、残された資材から入手アイテム表の抽選結果1枠を入手。目標値+3以上：鉄鉱石×1を追加で入手。失敗：復旧に手間取り、判定したPCの疲労度+1。',
  evt_mine_18:'成功：反響から先の地形を読み、空洞に残った魔晶石×1を入手。失敗：反響に感覚を乱され、判定したPCはMPを1点失う。',
  evt_mine_29:'成功：対岸へ渡り、崩れた橋桁の周辺から鉄鉱石×1を入手。失敗：味方1人は2D6ダメージ。',
  evt_mine_30:'鑑定成功：旧測量刻印のうち有効な印を見抜き、銀鉱石×1を入手。設計で代用可能（判定-2）。設計成功：刻印の構造を読み解き、鉄鉱石×1を入手。失敗：入手なし。',
  evt_mine_39:'成功：坑奥の穿王の移動経路を特定し、穿王ドルガンの行動傾向を1つ開示する。失敗：追加情報なし。',
  evt_highland_18:'探索成功：崖陰の補給箱から使える物を選び、入手アイテム表の抽選結果2枠を入手。目標値+3以上：風紋草×1を追加で入手。失敗：入手なし。',
  evt_highland_21:'探索成功：風穴の奥に吹き寄せられた素材から入手アイテム表の抽選結果1枠と風紋草×1を入手。失敗：入手なし。',
  evt_highland_22:'両方成功：風道と地形の対応を把握し、天空露×1を入手。どちらか一方のみ成功：安全な進路を把握する。両方失敗：地形を読み切れず、入手なし。',
  evt_highland_26:'射撃成功：遠くの損傷した留め具だけを撃ち外し、安全な索道を確保する。細工で代用可能（判定-2）。細工成功：風に耐えながら索を補修し、安全な索道を確保する。失敗：味方1人が1D6ダメージ。',
  evt_highland_28:'集中成功：風の乱れに姿勢を合わせ、安全に通過する。感知で代用可能（判定-2）。感知成功：風向きの変化を見切り、安全に通過する。失敗：風に振り回され、判定したPCの疲労度+1。防風香油使用中は、この疲労度+1を無効化する。',
  evt_highland_30:'集中成功：共鳴に影響されず、風紋草×1を入手。祈祷で代用可能（判定-2）。祈祷成功：共鳴を鎮め、風紋草×2を入手。失敗：共鳴に感覚を乱され、判定したPCの疲労度+1。',
  evt_highland_31:'両方成功：風向きと地形を照合して迷わず抜ける。どちらか一方のみ成功：遠回りせず抜ける。両方失敗：方向を見失い、味方1人の疲労度+1。',
  evt_highland_35:'成功：ヴェルグラートの飛行経路を特定し、嵐翼獣ヴェルグラートの行動傾向を1つ開示する。失敗：追加情報なし。',
  evt_ashcrown_12:'両方成功：灰煙の流れを読み、吸い込まず短時間で谷間を抜ける。どちらか一方のみ成功：灰煙を少し吸い込み、判定したPCの疲労度+1。両方失敗：灰煙をまともに吸い込み、判定したPCの疲労度+1に加えて1D3の無属性ダメージ。防灰濾布使用中は、灰煙を原因とするこの疲労度増加とダメージを無効化する。',
  evt_ashcrown_18:'成功：ウルガナの移動経路を特定し、灰嶺の大蛇ウルガナの行動傾向を1つ開示する。失敗：追加情報なし。',
  evt_weather_mine_wind_01:'感知成功：風音の反響から安全な坑道を見つけ、周辺から鉄鉱石×1を入手。失敗：効果なし。',
  evt_weather_highland_fog_01:'探索成功：霧越しに風標の並びを読み、風紋草×1を入手。失敗：入手なし。',
  evt_weather_ashcrown_ashrain_01:'両方成功：灰雨の弱まる場所を見極め、灰冠苔×1D2を入手し、黒曜片×1を追加で入手。どちらか一方のみ成功：灰冠苔×1を入手。両方失敗：採取を断念し、判定したPCの疲労度+1。防灰濾布使用中は、灰雨を原因とするこの疲労度+1を無効化する。'
};
function progressImmediatePatchedEvents(rows=[]){
  return (rows||[]).map(row=>Object.prototype.hasOwnProperty.call(PROGRESS_IMMEDIATE_EVENT_RESULT_PATCHES,String(row?.id||''))?{...row,result:PROGRESS_IMMEDIATE_EVENT_RESULT_PATCHES[String(row.id)]}:row);
}
function progressImmediatePatchedQuests(rows=[]){
  return (rows||[]).map(row=>String(row?.id||'')==='quest_daily_return_route'?{...row,fixedEvents:'100%\t帰路の歪み\t判定：知識>=11または細工>=11。成功：歪みの状態を確認して安全に帰還し、クエストクリア。失敗：帰還時に消耗し、味方全員の疲労度+1。'}:row);
}
function applyProgressMaster(master){
  const rumorKeyBeforeMaster=(typeof rumorSelectionEventKey==='function'?rumorSelectionEventKey():'')||String(state.savedRumorEventKey||'');
  const data=master.data||master;
  const quests=progressImmediatePatchedQuests(data.quests||[]);
  const areas=data.exploration_areas||[];
  const events=progressImmediatePatchedEvents(data.event_tables||[]);
  const monsters=data.monsters||[];
  const items=data.items||[];
  const treasures=data.treasure_tables||[];
  const appraisalRules=data.appraisal_rules||[];
  const spells=data.spells||[];
  const recipes=data.recipes||[];
  state.quests=quests; state.areas=areas; state.events=events; state.monsters=monsters; state.items=items; state.treasures=treasures; state.appraisalRules=appraisalRules; state.spells=spells; state.recipes=recipes;
  fillQuestSelect();
  fillSelect($('areaSelect'),areas,r=>`${r.name||r.id} / ${r.areaType||''}`);
  normalizeBaseUnlockedAreaIds();
  renderBaseEventControls();
  fillEventTables(); fillRumorSelect(); fillRumorAreas(); fillInnRumorSelect(); fillTreasureTables(); fillAppraisalRules();
  renderAll();
  if(typeof restoreRumorSelectionByEventKey==='function')restoreRumorSelectionByEventKey(rumorKeyBeforeMaster);
  state.savedRumorEventKey=rumorKeyBeforeMaster;
  return {quests,areas,events,monsters,items,treasures,appraisalRules};
}
let progressDbLoadSerial=0;
function progressMasterStatusText(master,counts,suffix=''){
  return `${master.source||'共通DB'}${master.version?' '+master.version:''}：クエスト${counts.quests.length}件 / エリア${counts.areas.length}件 / イベント${counts.events.length}件 / 宝箱${counts.treasures.length}件 / 鑑定${counts.appraisalRules.length}件 / 魔物${counts.monsters.length}件 / アイテム・素材${counts.items.length}件${suffix}`;
}
async function loadDb(options={}){
  const auto=!!options.auto,serial=++progressDbLoadSerial,button=$('loadDbBtn');
  setStatus('warn',auto?'共通DBを読み込んでいます。':'共通DBを再読込しています。');
  if(button)button.disabled=true;
  if(auto){
    // 起動時はGitHubの応答を待たない。同梱DB（失敗時は前回キャッシュ）を先に適用する。
    let startupMaster=null;
    try{
      try{startupMaster={...(await loadBundledProgressMaster()),source:'同梱共通DB'};}
      catch(bundledError){
        console.warn('同梱共通DBの起動読込に失敗しました。',bundledError);
        const cached=loadMasterCache();
        if(cached)startupMaster={...cached,source:'前回キャッシュ',warning:bundledError.message||String(bundledError)};
      }
      if(startupMaster){
        if(serial!==progressDbLoadSerial)return;
        const counts=applyProgressMaster(startupMaster);
        saveMasterCache(startupMaster.data,startupMaster.version);
        setStatus('good',progressMasterStatusText(startupMaster,counts,' / 読込完了・GitHub更新確認中'));
        addLog(`${startupMaster.source}からDBを読み込みました。`);
        if(button)button.disabled=false;
        // GitHub正本はバックグラウンド確認。失敗しても読み込んだDBを捨てない。
        fetchGithubProgressMaster().then(github=>{
          if(serial!==progressDbLoadSerial)return;
          saveMasterCache(github.data,github.version);
          const sameVersion=String(github.version||'').replace(/^v/i,'')===String(startupMaster.version||'').replace(/^v/i,'');
          const githubMaster={...github,source:'GitHub共通DB'};
          const finalCounts=sameVersion?counts:applyProgressMaster(githubMaster);
          setStatus(github.versionWarning?'warn':'good',progressMasterStatusText(githubMaster,finalCounts,github.versionWarning?` / ${github.versionWarning}`:''));
          if(!sameVersion)addLog(`GitHub共通DB ${github.version||''} へ更新しました。`);
        }).catch(error=>{
          if(serial!==progressDbLoadSerial)return;
          console.warn('GitHub共通DBのバックグラウンド確認に失敗しました。',error);
          setStatus('good',progressMasterStatusText(startupMaster,counts,' / 読込完了（GitHub更新確認は失敗）'));
        });
        return;
      }
    }catch(startupError){console.warn('起動用共通DBの適用に失敗しました。',startupError);}
  }
  try{
    const master=await acquireProgressMaster();
    if(serial!==progressDbLoadSerial)return;
    const counts=applyProgressMaster(master);
    const warning=master.warning?` / ${master.source}を使用`:master.versionWarning?` / ${master.versionWarning}`:'';
    setStatus(master.source==='GitHub共通DB'&&!master.versionWarning?'good':'warn',progressMasterStatusText(master,counts,warning));
    addLog(`${master.source}からDBを読み込みました。`);
  }catch(e){if(serial===progressDbLoadSerial)setStatus('bad',e.message||String(e));}
  finally{if(serial===progressDbLoadSerial&&button)button.disabled=false;}
}
function findBySearchValue(value, rows){
  const q=String(value || '').trim();
  if(!q) return null;
  const norm=v=>String(v || '').trim().toLowerCase();
  const nq=norm(q);
  return (rows || []).find(r=>norm(r.name)===nq)
    || (rows || []).find(r=>norm(r.id)===nq)
    || (rows || []).find(r=>norm(r.publicId)===nq)
    || (rows || []).find(r=>norm(r.name).includes(nq))
    || (rows || []).find(r=>norm(r.id).includes(nq))
    || null;
}
function selected(sel, rows){
  if(!sel) return null;
  const raw=String(sel.value ?? '').trim();
  if(/^\d+$/.test(raw)){ const i=Number(raw); if(rows[i]) return rows[i]; }
  return findBySearchValue(raw, rows) || null;
}
function progressObj(type,id){if(!id)return {value:0,note:''}; const box=state.progress[type]||(state.progress[type]={}); if(!box[id]) box[id]={value:0,note:''}; return box[id];}
const BASE_DAILY_ACTIONS=4;
function bindTabs(){
  document.querySelectorAll('[data-tab-target]').forEach(btn=>btn.addEventListener('click',()=>switchProgressTab(btn.dataset.tabTarget)));
  switchProgressTab(localStorage.getItem(STORE_KEY+'_tab') || 'quest');
}
function bind(){
  setupProgressModalUi();
  $('fixedUrlLabel').textContent='GitHub共通DB（失敗時のみGAS）'; bindTabs(); bindV738ProgressUi(); setPartySize(state.partySize||4); setTimeSlot(state.timeSlot||'朝',{reset:false,render:false,save:false}); setQuestCategory('重要'); if(typeof loadCommunityGatheringManager==='function')$('communityReloadBtn')?.addEventListener('click',loadCommunityGatheringManager); document.addEventListener('click',e=>{const b=e.target.closest('[data-community-send]');if(b)saveCommunityGatheringFacility(b.dataset.communitySend||'');}); $('loadDbBtn').addEventListener('click',()=>loadDb({auto:false})); $('saveStateBtn').addEventListener('click',()=>saveState(true)); $('restoreStateBtn').addEventListener('click',restoreSavedState); updateRestoreStateButton(); $('clearStateBtn').addEventListener('click',()=>{if(confirm('進行状態を初期化しますか？')){localStorage.removeItem(STORE_KEY); discardDeferredSavedProgressState(); state.progress={quests:{},areas:{}}; state.dayState={day:1,fatigue:0,usedActions:0,awaitingEnd:false}; state.triggeredQuestEvents={}; state.lastQuestFixedEventText=''; state.lastQuestCheckCopyText=''; state.lastQuestBattleCheckCopyText=''; state.lastEventCheckCopyText=''; state.lastBaseCheckCopyText=''; state.baseUnlockedAreaIds=defaultBaseUnlockedAreaIds(); state.lastBaseEventText=''; state.lastBaseEventKey=''; state.lastBaseRewardText=''; state.lastBaseRewardCopyText=''; state.questRewardCache={}; state.questEncounterCache={}; state.areaBossEncountered={}; state.lastRumorText=''; state.lastRumorKey=''; state.savedRumorEventKey=''; state.treasureSetup=null; state.treasureContext=null; state.lastEncounter=null; state.dropEncounterInstances=[]; state.dropMode='encounter'; state.lastQuestReinforcementText=''; state.questWorkReinforcementCounts={}; state.tokenExportEncounter=null; state.dailyQuestUnlockedAreaIds=[]; state.areaWeatherById={}; state.timeSlot='朝'; state.log=[]; progressUiV738.importantApplied={quest:null,event:null,base:null}; progressUiV738.slotResolved={quest:false,event:false,base:false}; progressUiV738.seen={quest:new Set(),event:new Set(),base:new Set()}; progressUiV738.questActive=false; progressUiV738.areaActive=false; progressUiV738.areaMode='normal'; progressUiV738.hidden={active:false,snapshot:null,originScope:'',areaId:''}; progressUiV738.kohakuMaterials={areaId:'',seq:0,currentEventToken:'',sources:{}}; clearQuestRandomEventHistory(); clearAreaRandomEventHistory(); state.lastQuestFixedEventText=''; state.lastQuestFixedEventKey=''; state.lastBaseEventText=''; state.lastBaseEventKey=''; state.lastBaseCheckCopyText=''; state.lastBaseOutcomeKey=''; state.lastBaseRewardText=''; state.lastBaseRewardCopyText=''; state.lastBaseEventRewardState=null; state.lastBaseEventTableRewardState=null; state.lastTreasureText=''; state.lastTreasureCopyText=''; state.lastAppraisalText=''; state.lastAppraisalCopyText=''; state.lastDropText=''; state.lastDropSuccessText=''; state.lastQuestHasTreasure=false; clearRecipeMerchantOffers(); ['questProgressModal','areaProgressModal','hiddenProgressModal','dropProgressModal','bossRumorChoiceModal'].forEach(id=>v738SetModalOpen(id,false)); renderAll(); addLog('進行状態を初期化しました。');}});
  document.querySelectorAll('[data-quest-category]').forEach(btn=>btn.addEventListener('click',()=>setQuestCategory(btn.dataset.questCategory)));
  $('questShowDisabledImportant')?.addEventListener('change',()=>{const before=String($('questSelect')?.value||'');fillQuestSelect();const after=String($('questSelect')?.value||'');if(before&&after!==before){clearQuestSelectionContext();saveState(false);}renderQuest();});
  $('questSelect').addEventListener('change',()=>{clearQuestSelectionContext();renderEventRewardPanel('quest');updateTreasureCopyButtons();const q=selected($('questSelect'),state.quests);if(q&&questUsesRandomEncounter(q))resolveQuestPreviewEncounter(q,true);renderQuest();saveState(false);});
  $('areaSelect').addEventListener('change',()=>{clearAreaSelectionContext();renderEventRewardPanel('event');updateTreasureCopyButtons();fillEventTables();renderArea();saveState(false);});
  $('markAllDismantleSuccessBtn')?.addEventListener('click',()=>{state.dropEncounterInstances=(state.dropEncounterInstances||[]).map(row=>({...row,dismantleSuccess:true}));renderEncounterDropList();saveState(false);});
  $('markAllDismantleFailBtn')?.addEventListener('click',()=>{state.dropEncounterInstances=(state.dropEncounterInstances||[]).map(row=>({...row,dismantleSuccess:false}));renderEncounterDropList();saveState(false);});
  $('rollEncounterDropBtn')?.addEventListener('click',rollEncounterDrops);
  $('encounterDropList')?.addEventListener('change',e=>{const input=e.target.closest('[data-encounter-dismantle]');if(!input)return;state.dropEncounterInstances=(state.dropEncounterInstances||[]).map(row=>String(row.uid)===String(input.dataset.encounterDismantle)?({...row,dismantleSuccess:input.checked}):row);saveState(false);});
$('rumorAreaSelect').addEventListener('change',()=>{fillInnRumorSelect(); renderRumorResult();}); $('rumorSelectForInn').addEventListener('change',()=>applyRumorIndex($('rumorSelectForInn').value,true)); $('rumorSelect').addEventListener('change',()=>{const hadRandom=!!state.lastEventKey;clearAreaRandomEventHistory();progressUiV738.importantApplied.event=null;if(progressUiV738.areaActive&&progressUiV738.areaMode==='normal'&&hadRandom){const a=selectedExplorationArea();if(a&&clamp(progressObj('areas',a.id||a.name).value)<100)progressUiV738.slotResolved.event=false;}renderEventRewardPanel('event');updateTreasureCopyButtons();renderRumorDetail();fillInnRumorSelect();renderRumorResult(selectedRumor(),'apply');state.savedRumorEventKey=typeof rumorSelectionEventKey==='function'?rumorSelectionEventKey():'';renderArea();saveState(false);}); $('partySizeSelect')?.addEventListener('change',e=>handlePartySizeChange(e.target.value)); $('questPartySizeSelect')?.addEventListener('change',e=>handlePartySizeChange(e.target.value)); $('areaTimeSlotSelect')?.addEventListener('change',e=>setTimeSlot(e.target.value)); $('questTimeSlotSelect')?.addEventListener('change',e=>setTimeSlot(e.target.value));
  $('rerollAreaWeatherBtn')?.addEventListener('click',()=>{const a=selected($('areaSelect'),state.areas);if(a)rerollAreaWeather(a);});
  $('copyUnlockedWeatherBtn')?.addEventListener('click',()=>copyText(weatherCopyText(),'weatherCopyNote'));
  document.addEventListener('click',e=>{const b=e.target.closest('[data-weather-reroll]');if(!b)return;const a=weatherAreaByKey(b.dataset.weatherReroll||'');if(a)rerollAreaWeather(a);});
  $('questAdvanceBtn').addEventListener('click',advanceQuestProgress); $('areaAdvanceBtn').addEventListener('click',advanceAreaProgress); $('manualActionBtn')?.addEventListener('click',()=>consumeDailyAction('その他の行動')); $('undoActionBtn')?.addEventListener('click',undoDailyAction); $('innRestBtn')?.addEventListener('click',restAtInn); $('innStayBtn')?.addEventListener('click',()=>advanceToNextDay(true)); $('endDayWithoutInnBtn')?.addEventListener('click',()=>{if(confirm('宿泊せず一日を終了しますか？ 疲労度が1増加します。'))advanceToNextDay(false);});
  $('questResetBtn').addEventListener('click',()=>{const q=selected($('questSelect'),state.quests);if(!q)return;const qkey=String(q.id||q.name||'');progressObj('quests',qkey).value=0;Object.keys(state.triggeredQuestEvents||{}).forEach(k=>{if(k.startsWith(qkey+':'))delete state.triggeredQuestEvents[k];});clearQuestSelectionContext();if(state.questWorkReinforcementCounts)delete state.questWorkReinforcementCounts[qkey];renderEventRewardPanel('quest');updateTreasureCopyButtons();saveState(false);renderQuest();});
  $('areaResetBtn').addEventListener('click',()=>{const a=selected($('areaSelect'),state.areas);if(!a)return;const akey=String(a.id||a.name||'');progressObj('areas',akey).value=0;delete state.areaBossEncountered[areaEventKey(a)];clearAreaSelectionContext();if(!isHiddenAreaRow(a))kohakuResetLedger(a);renderEventRewardPanel('event');updateTreasureCopyButtons();saveState(false);renderArea();});
  $('questNote').addEventListener('input',()=>{const q=selected($('questSelect'),state.quests); if(q){progressObj('quests',q.id||q.name).note=$('questNote').value; saveState(false);}}); $('areaNote').addEventListener('input',()=>{const a=selected($('areaSelect'),state.areas); if(a){progressObj('areas',a.id||a.name).note=$('areaNote').value; saveState(false);}});
  $('copyImportantQuestListBtn')?.addEventListener('click',()=>copyText(questListMemoForCategory('重要'),'questCopyNote')); $('copyDailyQuestListBtn')?.addEventListener('click',()=>{ensureDailyQuestSelection();copyText(state.lastDailyQuestText,'questCopyNote');}); $('refreshDailyQuestsBtn')?.addEventListener('click',()=>syncDailyQuestSelectionFromFacility({render:true,log:true})); $('rollBaseEventBtn')?.addEventListener('click',rollBaseEvent); $('copyBaseEventCheckBtn')?.addEventListener('click',()=>copyText(state.lastBaseCheckCopyText,'baseEventCopyNote')); $('copyBaseEventContentBtn')?.addEventListener('click',()=>copyText(eventContentCopyText('base'),'baseEventCopyNote')); $('openBaseAreaModalBtn')?.addEventListener('click',openBaseAreaModal); $('closeBaseAreaModalBtn')?.addEventListener('click',closeBaseAreaModal); $('cancelBaseAreaModalBtn')?.addEventListener('click',closeBaseAreaModal); $('applyBaseAreaModalBtn')?.addEventListener('click',applyBaseAreaModal);
  $('rollQuestEventBtn').addEventListener('click',rollQuestEvent); $('copyQuestCheckBtn')?.addEventListener('click',()=>copyText(state.lastQuestCheckCopyText,'questCopyNote')); $('copyQuestBattleCheckBtn')?.addEventListener('click',()=>copyText(state.lastQuestBattleCheckCopyText,'questCopyNote')); $('copyQuestContentBtn')?.addEventListener('click',()=>copyText(eventContentCopyText('quest'),'questCopyNote'));
  $('rollRumorBtn').addEventListener('click',rollRumor); $('applyRumorBtn').addEventListener('click',()=>applyRumorIndex($('rumorSelectForInn').value,true)); $('clearRumorBtn').addEventListener('click',clearRumor); $('copyRumorBtn').addEventListener('click',()=>copyText(state.lastRumorText,'rumorCopyNote'));
  $('rollEventBtn').addEventListener('click',rollEvent); $('copyEventCheckBtn')?.addEventListener('click',()=>copyText(state.lastEventCheckCopyText,'eventCopyNote')); $('copyEventContentBtn')?.addEventListener('click',()=>copyText(eventContentCopyText('event'),'eventCopyNote'));
  $('treasureTableSelect').addEventListener('change',()=>{const tableId=$('treasureTableSelect').value; setTreasureContext(tableId,treasureAreaName(tableId),'normal'); $('treasureResult').textContent=isBossTreasureTable(tableId)?'「宝箱の中身を決定」を押すと、ボス固有素材の確率抽選とランダム報酬1枠をまとめて決定します。鍵・罠・採取判定はありません。':'「宝箱の中身を決定」を押すと、鍵・罠・各難易度・中身をまとめて決定します。';}); $('copyTrapDetectBtn').addEventListener('click',()=>copyText(trapDetectText(),'treasureCopyNote')); $('copyTrapDisarmBtn').addEventListener('click',()=>copyText(trapDisarmText(),'treasureCopyNote')); $('copyUnlockBtn').addEventListener('click',()=>copyText(unlockText(),'treasureCopyNote')); $('rollTreasureBtn').addEventListener('click',rollTreasure); $('copyTreasureBtn').addEventListener('click',()=>copyText(state.lastTreasureCopyText,'treasureCopyNote'));
  $('rollAppraisalBtn').addEventListener('click',rollAppraisal); $('copyAppraisalBtn').addEventListener('click',()=>copyText(state.lastAppraisalCopyText,'appraisalCopyNote')); $('appraisalRuleSelect').addEventListener('change',resetAppraisalResult); updateAppraisalCopyButton(); updateTreasureCopyButtons();

  window.addEventListener('storage',e=>{if(e.key===GUILD_DAILY_STORAGE_KEY)syncDailyQuestSelectionFromFacility({render:true});});
  try{
    const dailyChannel=new BroadcastChannel(GUILD_DAILY_CHANNEL_NAME);
    dailyChannel.addEventListener('message',()=>syncDailyQuestSelectionFromFacility({render:true}));
  }catch(_e){}

  document.addEventListener('change',e=>{
    const baseAreaCheck=e.target.closest('[data-base-area-modal-check]');if(baseAreaCheck){handleBaseAreaModalCheck(baseAreaCheck);return;}
    const check=e.target.closest('[data-event-reward-check]');if(check){const panel=check.closest('#questEventRewardPanel,#eventRewardPanel,#baseEventRewardPanel');const scope=panel?.id==='questEventRewardPanel'?'quest':panel?.id==='baseEventRewardPanel'?'base':'event';updateEventRewardSelection(scope,check.dataset.eventRewardCheck,check.checked);return;}
    const treasureCheck=e.target.closest('[data-event-treasure-check]');if(treasureCheck){const panel=treasureCheck.closest('#questEventRewardPanel,#eventRewardPanel');const scope=panel?.id==='questEventRewardPanel'?'quest':'event';updateEventTreasureSelection(scope,treasureCheck.dataset.eventTreasureCheck,treasureCheck.checked);return;}
    const choice=e.target.closest('[data-event-reward-choice]');if(choice){const panel=choice.closest('#questEventRewardPanel,#eventRewardPanel,#baseEventRewardPanel'),scope=panel?.id==='questEventRewardPanel'?'quest':panel?.id==='baseEventRewardPanel'?'base':'event',reward=eventRewardState(scope),group=reward?.groups.find(g=>String(g.uid)===String(choice.dataset.eventRewardChoice)),item=group?.items.find(x=>String(x.uid)===String(choice.dataset.eventRewardItem));if(item)item.selectedName=choice.value;syncEventTableRewardCopyState(scope);renderEventRewardPanel(scope);if(scope==='base')updateBaseEventItemCopyButton();else if(scope==='quest')updateQuestEventItemCopyButton();else updateAreaEventItemCopyButton();saveState(false);}
  });
  document.addEventListener('click',e=>{
    const tokenExportFolder=e.target.closest('[data-token-export-folder]');if(tokenExportFolder){tokenChooseExportDirectory(tokenExportFolder.dataset.tokenExportFolder||'event');return;}
    const tokenReinforcement=e.target.closest('[data-token-reinforcement]');if(tokenReinforcement){exportReinforcementTokens(tokenReinforcement.dataset.tokenReinforcement||'event',tokenReinforcement.dataset.sourceUid||'',tokenReinforcement.dataset.actionName||'',tokenReinforcement.dataset.tableName||'',tokenReinforcement);return;}
    const tokenExport=e.target.closest('[data-token-export]');if(tokenExport){exportCurrentEncounterTokens(tokenExport.dataset.tokenExport||'event',tokenExport);return;}
    const importantResolve=e.target.closest('[data-important-use-resolve]');if(importantResolve){resolveDeclaredImportantItem(importantResolve.dataset.importantUseResolve||'event');return;}
    const reroll=e.target.closest('[data-event-reward-reroll]');if(reroll){rerollEventReward(reroll.dataset.eventRewardReroll);return;}
    if(e.target.closest('#copyRecipeMerchantListBtn')){const note=state.lastRecipeMerchantContext?.scope==='quest'?'questCopyNote':'eventCopyNote';copyText(recipeMerchantListCopyText(),note);return;}
    if(e.target.closest('#copyRecipeMerchantInfoBtn')){const note=state.lastRecipeMerchantContext?.scope==='quest'?'questCopyNote':'eventCopyNote';copyText(recipeMerchantInfoCopyText(selectedRecipeMerchantRow()),note);return;}
    if(e.target.closest('#copyRecipeMerchantTradeListBtn')){copyText(kohakuTradeListCopyText(),'eventCopyNote');return;}
  });
  $('copyDropSuccessBtn')?.addEventListener('click',()=>copyText(state.lastDropSuccessText,'dropCopyNote'));
  $('copyLogBtn').addEventListener('click',()=>copyText(state.log.slice().reverse().join('\n'))); $('clearLogBtn').addEventListener('click',()=>{state.log=[]; renderLog(); saveState(false);});
}
tokenLoadExportDirectoryHandle().then(()=>tokenRefreshExportDirectoryUi()).catch(()=>{});
loadState(); renderLog(); setStatus('warn','共通DBを読み込んでいます。'); loadDb({auto:true}); try{bind();}catch(error){console.error('進行管理UIの初期化でエラーが発生しました。',error);} if(typeof loadCommunityGatheringManager==='function')loadCommunityGatheringManager();
