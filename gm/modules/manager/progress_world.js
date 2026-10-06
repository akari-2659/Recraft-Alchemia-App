function areaBossEventForRumor(a,rumor=selectedRumor()){
  // v90.8.834: ボス噂は100%到達時に任意選択。追う場合のみ対応ボスへ確定遭遇し、追わない場合は通常抽選。
  return null;
}
function defaultBaseUnlockedAreaIds(){
  const initial=(state.areas||[]).filter(a=>String(a.unlockCondition||'').includes('初期解放')).map(a=>String(a.id||a.name||'')).filter(Boolean);
  if(initial.length)return initial;
  const first=(state.areas||[])[0];return first?[String(first.id||first.name||'')]:[];
}
function normalizeBaseUnlockedAreaIds(){
  const valid=new Set((state.areas||[]).map(a=>String(a.id||a.name||'')).filter(Boolean));
  let ids=Array.isArray(state.baseUnlockedAreaIds)?state.baseUnlockedAreaIds.map(String).filter(id=>valid.has(id)):[];
  const required=defaultBaseUnlockedAreaIds();
  required.forEach(id=>{if(valid.has(id)&&!ids.includes(id))ids.push(id);});
  if(!ids.length)ids=required;
  state.baseUnlockedAreaIds=[...new Set(ids)];
  return state.baseUnlockedAreaIds;
}

const TIME_SLOTS=['朝','昼','夕','夜'];
function normalizeTimeSlot(value='朝'){const v=String(value||'').trim();return TIME_SLOTS.includes(v)?v:'朝';}
function selectedTimeSlot(){return normalizeTimeSlot(state.timeSlot||$('areaTimeSlotSelect')?.value||$('questTimeSlotSelect')?.value||'朝');}
function setTimeSlot(value,options={}){
  const slot=normalizeTimeSlot(value);state.timeSlot=slot;
  ['areaTimeSlotSelect','questTimeSlotSelect'].forEach(id=>{const el=$(id);if(el)el.value=slot;});
  if(options.reset!==false){state.lastEventText='';state.lastEventKey='';state.lastEventCheckCopyText='';state.lastQuestEventText='';state.lastQuestEventKey='';state.lastQuestCheckCopyText='';state.lastQuestBattleCheckCopyText='';clearTokenExportEncounter();}
  renderTimeControls();
  if(options.render!==false){renderArea();renderQuest();}
  if(options.save!==false)saveState(false);
  return slot;
}
function areaUsesWorldCycle(area={}){return !!area && String(area.areaType||'').trim()!=='異界';}
function parseAreaTimeProfiles(area={}){
  if(!areaUsesWorldCycle(area))return [];
  return String(area.timeProfiles||'').split(/\n+/).map(line=>{
    const [slot,detail,up,down,off]=String(line||'').split('\t');
    const name=normalizeTimeSlot(slot);if(!TIME_SLOTS.includes(String(slot||'').trim()))return null;
    const list=v=>String(v||'').split(/[,、，]/).map(x=>x.trim()).filter(Boolean);
    return {slot:name,detail:String(detail||'').trim(),monsterUp:list(up),monsterDown:list(down),monsterOff:list(off)};
  }).filter(Boolean);
}
function currentAreaTimeProfile(area={}){if(!areaUsesWorldCycle(area))return null;const slot=selectedTimeSlot();return parseAreaTimeProfiles(area).find(p=>p.slot===slot)||{slot,detail:'時間帯による大きな変化なし',monsterUp:[],monsterDown:[],monsterOff:[]};}
function eventTimeSlots(row={}){return String(row.timeSlots||'').split(/[,、，\/／]/).map(v=>v.trim()).filter(v=>TIME_SLOTS.includes(v));}
function questTimeSlots(q={}){return String(q.timeSlots||'').split(/[,、，\/／]/).map(v=>v.trim()).filter(v=>TIME_SLOTS.includes(v));}
function questMatchesTime(q={}){const area=areaForQuest(q);if(!areaUsesWorldCycle(area))return true;const slots=questTimeSlots(q);return !slots.length||slots.includes(selectedTimeSlot());}
function questTimeRestrictionText(q={}){const slots=questTimeSlots(q);return slots.length?slots.join('・'):'制限なし';}
function eventMatchesTime(row={},area={}){if(!areaUsesWorldCycle(area))return true;const slots=eventTimeSlots(row);return !slots.length||slots.includes(selectedTimeSlot());}
function eventTimeWeight(row={},area={}){if(!areaUsesWorldCycle(area))return 1;const spec=String(row.timeWeights||'').trim();if(!spec)return 1;const map={};spec.split(/[;；\n]+/).forEach(chunk=>{const m=String(chunk||'').trim().match(/^(.+?)[:：]\s*([0-9.]+)$/);if(m)map[m[1].trim()]=Number(m[2]);});const value=map[selectedTimeSlot()];return Number.isFinite(value)?Math.max(0,value):1;}
function rumorScope(row={}){return String(row.rumorScope||'').trim()==='時間帯'?'時間帯':'一日';}
function rumorActiveForTime(row={},area={}){if(!row||!areaUsesWorldCycle(area))return false;if(rumorScope(row)!=='時間帯')return true;const slots=eventTimeSlots(row);return !slots.length||slots.includes(selectedTimeSlot());}
function timeMonsterWeight(areaName='',monsterName=''){
  const area=(state.areas||[]).find(a=>String(a.name||'').trim()===String(areaName||'').trim()||String(a.id||'').trim()===String(areaName||'').trim());
  const profile=area?currentAreaTimeProfile(area):null;const name=String(monsterName||'').trim();if(!profile||!name)return 1;
  if(profile.monsterOff?.includes(name))return 0;if(profile.monsterUp?.includes(name))return 1.8;if(profile.monsterDown?.includes(name))return .5;return 1;
}
function encounterMonsterWeight(areaName='',monsterName=''){return weatherMonsterWeight(areaName,monsterName)*timeMonsterWeight(areaName,monsterName);}
function renderTimeControls(){
  const area=selected($('areaSelect'),state.areas),q=selected($('questSelect'),state.quests),qa=areaForQuest(q);
  const areaActive=areaUsesWorldCycle(area),questActive=!!q&&!isBaseQuest(q)&&!isDeliveryQuest(q)&&areaUsesWorldCycle(qa);
  const aw=$('areaTimeSlotWrap');if(aw)aw.classList.toggle('hidden',!areaActive);
  const qw=$('questTimeSlotWrap');if(qw)qw.classList.toggle('hidden',!questActive);
  ['areaTimeSlotSelect','questTimeSlotSelect'].forEach(id=>{const el=$(id);if(el)el.value=selectedTimeSlot();});
  const box=$('areaTimeDetail');if(box){if(!areaActive){box.classList.add('hidden');box.textContent='';}else{box.classList.remove('hidden');const t=currentAreaTimeProfile(area);box.innerHTML=`<div class="kv"><b>時間帯</b><span>${esc(t?.slot||selectedTimeSlot())}</span><b>遭遇傾向</b><span>${esc([t?.monsterUp?.length?`出やすい ${t.monsterUp.join('・')}`:'',t?.monsterDown?.length?`出にくい ${t.monsterDown.join('・')}`:''].filter(Boolean).join(' / ')||'大きな変化なし')}</span></div>${t?.detail?`<p class="muted small">${esc(t.detail)}</p>`:''}`;}}
  const wm=$('weatherManager');if(wm)wm.classList.toggle('hidden',!!area&&!areaActive);
}
function parseAreaWeatherProfiles(area={}){
  return String(area.weatherProfiles||'').split(/\n+/).map(line=>{
    const [name,weight,detail,up,down,off]=String(line||'').split('\t');
    const n=String(name||'').trim();if(!n)return null;
    const list=v=>String(v||'').split(/[,、，]/).map(x=>x.trim()).filter(Boolean);
    return {name:n,weight:Math.max(1,Number(weight)||1),detail:String(detail||'').trim(),monsterUp:list(up),monsterDown:list(down),monsterOff:list(off)};
  }).filter(Boolean);
}
function weatherAreaKey(area={}){return String(area.id||area.name||'').trim();}
function weatherAreaByKey(key=''){return (state.areas||[]).find(a=>weatherAreaKey(a)===String(key||'').trim()||String(a.name||'').trim()===String(key||'').trim())||null;}
function weightedPick(rows=[],weightFn=row=>row?.weight??1){
  if(!Array.isArray(rows)||!rows.length)return null;
  const getWeight=typeof weightFn==='function'?weightFn:(row=>row?.weight??1);
  const entries=rows.map(row=>{
    let raw;
    try{raw=getWeight(row);}catch(_){raw=1;}
    if(typeof raw==='string')raw=raw.trim().replace(/[^\d.+-]/g,'');
    let weight=Number(raw);
    if(!Number.isFinite(weight))weight=1;
    return {row,weight:Math.max(0,weight)};
  }).filter(x=>x.weight>0);
  if(!entries.length)return rows[Math.floor(Math.random()*rows.length)]||null;
  let roll=Math.random()*entries.reduce((sum,x)=>sum+x.weight,0);
  for(const entry of entries){roll-=entry.weight;if(roll<=0)return entry.row;}
  return entries[entries.length-1].row;
}
function ensureAreaWeather(area={},force=false){
  if(!areaUsesWorldCycle(area))return null;
  const key=weatherAreaKey(area);if(!key)return null;
  state.areaWeatherById=(state.areaWeatherById&&typeof state.areaWeatherById==='object')?state.areaWeatherById:{};
  const day=Math.max(1,Number(state.dayState?.day)||1);
  const current=state.areaWeatherById[key];
  const profiles=parseAreaWeatherProfiles(area);
  if(!profiles.length)return null;
  if(!force&&current&&Number(current.day)===day&&profiles.some(p=>p.name===current.weatherName))return current;
  const picked=weightedPick(profiles,p=>p.weight)||profiles[0];
  const next={day,weatherName:picked.name};
  state.areaWeatherById[key]=next;
  return next;
}
function currentAreaWeather(area={}){
  const stateRow=ensureAreaWeather(area,false);if(!stateRow)return null;
  const profile=parseAreaWeatherProfiles(area).find(p=>p.name===stateRow.weatherName)||null;
  return profile?{...stateRow,...profile}:stateRow;
}
function weatherUnlockedAreaIds(){
  const valid=new Set((state.areas||[]).map(a=>weatherAreaKey(a)).filter(Boolean));
  const ids=new Set(normalizeBaseUnlockedAreaIds().map(String).filter(id=>valid.has(id)));
  const shared=readFacilityDailyQuestState();
  const guildIds=(shared?.unlockedAreaIds?.length?shared.unlockedAreaIds:(shared?.areaId?[shared.areaId]:state.dailyQuestUnlockedAreaIds||[]));
  (guildIds||[]).map(String).filter(id=>valid.has(id)).forEach(id=>ids.add(id));
  defaultBaseUnlockedAreaIds().forEach(id=>{if(valid.has(String(id)))ids.add(String(id));});
  return [...ids];
}
function unlockedWeatherAreas(){
  const ids=new Set(weatherUnlockedAreaIds());
  return [...(state.areas||[])].filter(a=>areaUsesWorldCycle(a)&&ids.has(weatherAreaKey(a))).sort((a,b)=>Number(a.unlockOrder||999)-Number(b.unlockOrder||999)||String(a.name||'').localeCompare(String(b.name||''),'ja'));
}
function ensureWeatherForUnlockedAreas(force=false){unlockedWeatherAreas().forEach(a=>ensureAreaWeather(a,force));}
function rerollAreaWeather(area={}){
  const row=ensureAreaWeather(area,true);if(!row)return;
  state.lastEventText='';state.lastEventKey='';state.lastEventCheckCopyText='';state.lastEventRewardState=null;
  saveState(false);renderArea();renderWeatherManager();addLog(`${area.name||area.id} の天気を再抽選：${row.weatherName}`);
}
function rerollUnlockedWeatherForNewDay(){
  ensureWeatherForUnlockedAreas(true);
  state.lastEventText='';state.lastEventKey='';state.lastEventCheckCopyText='';state.lastEventRewardState=null;
}
function weatherCopyText(){
  ensureWeatherForUnlockedAreas(false);
  const rows=unlockedWeatherAreas();
  return ['【今日の天気】',...rows.flatMap((area,index)=>{
    const w=currentAreaWeather(area);
    const block=[`・${area.name||area.id}：${w?.name||'未設定'}`,w?.detail||'天気詳細なし'];
    return index<rows.length-1?[...block,'']:block;
  })].join('\n');
}
function weatherMonsterWeight(areaName='',monsterName=''){
  const area=(state.areas||[]).find(a=>String(a.name||'').trim()===String(areaName||'').trim()||String(a.id||'').trim()===String(areaName||'').trim());
  const weather=area?currentAreaWeather(area):null;
  const name=String(monsterName||'').trim();if(!weather||!name)return 1;
  if(weather.monsterOff?.includes(name))return 0;
  if(weather.monsterUp?.includes(name))return 1.8;
  if(weather.monsterDown?.includes(name))return .5;
  return 1;
}
function weatherEventWeight(row={},area={}){
  const weather=currentAreaWeather(area);if(!weather)return 1;
  const spec=String(row.weatherWeights||'').trim();if(!spec)return 1;
  const map={};
  spec.split(/[;；\n]+/).forEach(chunk=>{const m=String(chunk||'').trim().match(/^(.+?)[:：]\s*([0-9.]+)$/);if(m)map[m[1].trim()]=Number(m[2]);});
  const value=map[weather.name];
  return Number.isFinite(value)?Math.max(0,value):1;
}
function eventMatchesWeather(row={},area={}){
  const type=eventConditionType(row);
  if(type!=='天気')return true;
  const weather=currentAreaWeather(area);if(!weather)return false;
  const allowed=String(row.conditionValue||'').split(/[,、，\/／]/).map(v=>v.trim()).filter(Boolean);
  return allowed.includes(weather.name);
}
function isCrossBorderSourceEvent(row={}){
  return /^evt_xbrd_source_/.test(String(row.id||'').trim()) || String(row.notes||'').includes('越境起点。');
}
function areaExplorationDrawCount(area={}){
  const step=Math.max(1,areaStepAmount(area));
  // 進行度0%でもイベントが1回発生し、その後に進行するため、25%進行なら0/25/50/75/100の5回。
  return Math.max(1,Math.ceil(100/step)+1);
}
function crossBorderSourcePerDrawChance(area={}){
  const draws=areaExplorationDrawCount(area);
  return 1-Math.pow(0.95,1/draws);
}
const NAMED_ENCOUNTER_PER_DRAW_CHANCE=0.05;
const HIDDEN_NAMED_ENCOUNTER_PER_DRAW_CHANCE=0.25;
const RUMOR_DEFAULT_TOTAL_WEIGHT=6;
const RUMOR_TIMED_TOTAL_WEIGHT=8;
function rumorConfiguredWeight(rumor={},fallback=RUMOR_DEFAULT_TOTAL_WEIGHT){
  const m=String(rumor&&rumor.notes||'').match(/【噂抽選重み】\s*([0-9.]+)/);
  const n=m?Number(m[1]):NaN;
  return Number.isFinite(n)&&n>0?n:fallback;
}
function rumorExplicitTargetIds(rumor={}){
  const notes=String(rumor&&rumor.notes||'');
  const m=notes.match(/【噂対象イベントID】\s*([^\n【]+)/);
  return m?m[1].split(/[,、，;；\s]+/).map(v=>v.trim()).filter(Boolean):[];
}
function rumorWeightContext(rows=[],rumor=null,area={}){
  if(!rumor||!rumorActiveForTime(rumor,area)||isBossRumor(rumor))return {active:false,condition:new Set(),explicit:new Set(),conditionEach:1,explicitEach:1};
  const list=(rows||[]).filter(Boolean);
  const condition=list.filter(row=>eventConditionType(row)==='噂話'&&eventMatchesRumor(row,rumor));
  const explicitIds=new Set(rumorExplicitTargetIds(rumor));
  const explicit=list.filter(row=>explicitIds.has(String(row.id||'').trim()));
  const configured=rumorConfiguredWeight(rumor,rumorScope(rumor)==='時間帯'?RUMOR_TIMED_TOTAL_WEIGHT:RUMOR_DEFAULT_TOTAL_WEIGHT);
  // 1つの噂が複数イベントに対応しても、噂全体の抽選質量が膨らみすぎないよう合計重みを分配する。
  const each=(total,count)=>count?Math.max(1,total/count):1;
  return {active:true,condition:new Set(condition),explicit:new Set(explicit),conditionEach:each(configured,condition.length),explicitEach:each(configured,explicit.length)};
}
function rumorEventWeight(row={},ctx={}){
  if(!ctx.active)return 1;
  if(ctx.explicit&&ctx.explicit.has(row))return ctx.explicitEach;
  if(ctx.condition&&ctx.condition.has(row))return ctx.conditionEach;
  return 1;
}
function pickAreaEvent(rows=[],lastKey='',area={},options={}){
  const list=(rows||[]).filter(Boolean);if(!list.length)return null;
  const filtered=list.length>1?list.filter(r=>eventUniqueKey(r)!==lastKey):list;
  // 隠しエリアでは二つ名再遭遇を許可するため、直前イベントの除外は行わない。
  // 非戦闘イベントの重複は v738 の seen 管理で別途防止する。
  const pool=isHiddenAreaRow(area)?list:(filtered.length?filtered:list);
  const rumor=options.rumor||null;
  const rumorCtx=rumorWeightContext(pool,rumor,area);
  const namedRows=pool.filter(isNamedEncounterEvent);
  const sourceRows=pool.filter(row=>isCrossBorderSourceEvent(row)&&!isNamedEncounterEvent(row));
  const normalRows=pool.filter(row=>!isCrossBorderSourceEvent(row)&&!isNamedEncounterEvent(row));
  // 二つ名と越境起点は通常候補数へ混ぜず、それぞれ独立した低確率枠として扱う。
  // 1回の抽選で両方へ当選しないよう、同じ乱数上に割り当てる。
  const namedChance=namedRows.length?(isHiddenAreaRow(area)?HIDDEN_NAMED_ENCOUNTER_PER_DRAW_CHANCE:NAMED_ENCOUNTER_PER_DRAW_CHANCE):0;
  const sourceChance=sourceRows.length?crossBorderSourcePerDrawChance(area):0;
  const specialRoll=Math.random();
  if(namedRows.length&&specialRoll<namedChance){
    return weightedPick(namedRows,row=>weatherEventWeight(row,area)*eventTimeWeight(row,area)*rumorEventWeight(row,rumorCtx));
  }
  if(sourceRows.length&&specialRoll<namedChance+sourceChance){
    return weightedPick(sourceRows,row=>weatherEventWeight(row,area)*eventTimeWeight(row,area)*rumorEventWeight(row,rumorCtx));
  }
  const normalPool=normalRows.length?normalRows:pool.filter(row=>!isNamedEncounterEvent(row));
  return weightedPick(normalPool,row=>weatherEventWeight(row,area)*eventTimeWeight(row,area)*rumorEventWeight(row,rumorCtx));
}
function renderWeatherManager(){
  const selectedArea=selected($('areaSelect'),state.areas);
  renderTimeControls();
  const currentBox=$('selectedAreaWeather'),list=$('unlockedWeatherList');
  if(currentBox){
    if(!selectedArea)currentBox.textContent='エリアが選択されていません。';
    else{
      const weather=currentAreaWeather(selectedArea);
      currentBox.innerHTML=weather?`<div class="weather-current-name">${esc(weather.name)}</div><div>${esc(weather.detail||'')}</div><div class="muted small">遭遇傾向：${esc([weather.monsterUp?.length?`出やすい ${weather.monsterUp.join('・')}`:'',weather.monsterDown?.length?`出にくい ${weather.monsterDown.join('・')}`:''].filter(Boolean).join(' / ')||'大きな変化なし')}</div>`:'天気設定なし';
    }
  }
  if(list){
    ensureWeatherForUnlockedAreas(false);
    const rows=unlockedWeatherAreas();
    list.innerHTML=rows.length?rows.map(area=>{
      const w=currentAreaWeather(area);
      return `<div class="weather-area-row"><b>${esc(area.name||area.id)}</b><span class="weather-name">${esc(w?.name||'未設定')}</span><span class="weather-desc">${esc(w?.detail||'')}</span><button class="ghost" type="button" data-weather-reroll="${esc(weatherAreaKey(area))}">再抽選</button></div>`;
    }).join(''):'<div class="muted small">解放済みエリアがありません。</div>';
  }
}
let baseAreaModalDraftIds=[];
function baseEventRows(){
  const unlocked=new Set(normalizeBaseUnlockedAreaIds());
  return (state.events||[]).filter(e=>String(e.tableId||'').trim()==='evt_base_random'&&String(e.eventType||'').trim()==='拠点イベント'&&eventConditionType(e)==='解放エリア'&&unlocked.has(String(e.conditionValue||'').trim()));
}
function baseAreaNames(ids=[]){
  const set=new Set((ids||[]).map(String));
  return (state.areas||[]).filter(a=>set.has(String(a.id||a.name||''))).map(a=>String(a.name||a.id||'')).filter(Boolean);
}
function renderDailyUnlockedAreaControl(){
  const summary=$('dailyUnlockedAreaSummary');if(!summary)return;
  const ids=normalizeBaseUnlockedAreaIds();
  const names=baseAreaNames(ids);
  summary.textContent=names.length?`抽選対象：${names.join('、')}`:'抽選対象の解放エリアがありません。';
}
function renderBaseAreaModal(){
  const modal=$('baseAreaModal'),list=$('baseUnlockedAreaModalList');if(!modal||!list)return;
  const selected=new Set(baseAreaModalDraftIds.map(String));
  const required=new Set(defaultBaseUnlockedAreaIds());
  list.innerHTML=(state.areas||[]).map(a=>{
    const id=String(a.id||a.name||''),checked=selected.has(id)||required.has(id),fixed=required.has(id);
    return `<label class="base-unlock-item"><input type="checkbox" data-base-area-modal-check="${esc(id)}"${checked?' checked':''}${fixed?' disabled':''}><span>${esc(a.name||id)}<small>${esc(a.areaType||'エリア')} / 解放順 ${esc(a.unlockOrder??'-')}${fixed?' / 初期解放':''}</small></span></label>`;
  }).join('')||'<div class="muted small">エリアデータがありません。</div>';
}
function openBaseAreaModal(){
  baseAreaModalDraftIds=[...normalizeBaseUnlockedAreaIds()];renderBaseAreaModal();
  const modal=$('baseAreaModal');if(modal){modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');document.body.classList.add('area-select-modal-open');}
}
function closeBaseAreaModal(){
  const modal=$('baseAreaModal');if(modal){modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');document.body.classList.remove('area-select-modal-open');}
}
function applyBaseAreaModal(){
  const required=defaultBaseUnlockedAreaIds();const next=[...new Set([...required,...baseAreaModalDraftIds.map(String)])];
  const before=normalizeBaseUnlockedAreaIds().slice().sort().join('|'),after=next.slice().sort().join('|');
  state.baseUnlockedAreaIds=next;
  if(before!==after){
    state.lastBaseEventText='';state.lastBaseEventKey='';state.lastBaseCheckCopyText='';state.lastBaseOutcomeKey='';state.lastBaseRewardText='';state.lastBaseRewardCopyText='';state.lastBaseEventRewardState=null;state.lastBaseEventTableRewardState=null;
    const q=selected($('questSelect'),state.quests);
    if(isBaseQuest(q)){state.lastQuestEventText='';state.lastQuestEventKey='';state.lastQuestCheckCopyText='';state.lastQuestBattleCheckCopyText='';state.lastQuestTreasureCopyText='';state.lastQuestEventTableRewardText='';state.lastQuestEventTableRewardCopyText='';state.lastQuestEventRewardState=null;}
  }
  ensureWeatherForUnlockedAreas(false);saveState(false);closeBaseAreaModal();renderBaseEventControls();renderDailyUnlockedAreaControl();renderWeatherManager();renderQuest();updateTreasureCopyButtons();
}
function handleBaseAreaModalCheck(input){
  const id=String(input?.dataset?.baseAreaModalCheck||'');if(!id)return;
  const set=new Set(baseAreaModalDraftIds.map(String));if(input.checked)set.add(id);else set.delete(id);
  defaultBaseUnlockedAreaIds().forEach(v=>set.add(v));baseAreaModalDraftIds=[...set];
}
function renderBaseEventControls(){
  const summary=$('baseUnlockedAreaSummary'),info=$('baseEventPoolInfo'),result=$('baseEventResult');
  if(!info)return;
  const unlocked=normalizeBaseUnlockedAreaIds();
  const rows=baseEventRows();
  const names=baseAreaNames(unlocked);
  if(summary)summary.textContent=names.length?`選択中：${names.join('、')}（${names.length}エリア）`:'選択中のエリアはありません。';
  const sourceNames=[...new Set(rows.map(e=>{const a=(state.areas||[]).find(x=>String(x.id||x.name||'')===String(e.conditionValue||''));return a?.name||e.conditionValue||'';}).filter(Boolean))];
  info.innerHTML=`<div class="kv"><b>解放済み</b><span>${unlocked.length}エリア</span><b>現在の候補</b><span>${rows.length}件</span><b>候補追加元</b><span>${esc(sourceNames.join('、')||'なし')}</span></div>`;
  if(result)result.textContent=state.lastBaseEventText||'拠点内イベント結果がここに表示されます。';
  const rewardBox=$('baseEventRewardResult');if(rewardBox)rewardBox.textContent=state.lastBaseRewardText||'入手アイテム抽選結果がここに表示されます。';
  renderEventRewardPanel('base');resetImportantUsePanel('base');updateBaseEventItemCopyButton();updateEventCheckCopyButtons();renderDailyUnlockedAreaControl();
  const btn=$('rollBaseEventBtn');if(btn)btn.textContent=state.lastBaseEventText?'拠点内イベント再抽選':'拠点内イベント抽選';
}
function rollBaseEvent(){
  const rows=baseEventRows();
  if(!rows.length){state.lastBaseEventText='解放済みエリアに対応する拠点内イベント候補がありません。';state.lastBaseCheckCopyText='';state.lastBaseOutcomeKey='';state.lastBaseRewardText='';state.lastBaseRewardCopyText='';state.lastBaseEventRewardState=null;state.lastBaseEventTableRewardState=null;renderBaseEventControls();return;}
  const picked=pickRandomEvent(rows,state.lastBaseEventKey);state.lastBaseEventKey=eventUniqueKey(picked);state.lastBaseOutcomeKey=eventUniqueKey(picked);state.lastBaseCheckCopyText=eventCheckCopyText(picked);
  const source=(state.areas||[]).find(a=>String(a.id||a.name||'')===String(picked.conditionValue||''));
  state.lastBaseEventRewardState=buildEventRewardState(picked);
  const rewardSpec=eventRewardTableSpec(picked,source?.name||picked.areaName||'');
  const maxSlots=Math.max(rewardSpec.drawCount,eventRewardMaxTableSlots(picked));
  const reward=rollRewardItemTable(rewardSpec.tableId,maxSlots,source?.name||picked.areaName||'',picked.eventName||'イベント');
  setEventTableRewardState('base',reward);syncEventTableRewardCopyState('base');
  state.lastBaseEventText=[
    '【拠点内ランダムイベント】',
    source?`追加元エリア：${source.name||source.id}`:'',
    picked.eventName?`イベント：${picked.eventName}`:'',
    eventCheckDisplayText(picked),
    picked.result?`結果：${eventResultTextForDisplay(picked)}`:'',
    picked.rewardTableId?`入手アイテム表：${picked.rewardTableId}`:'',
    picked.progressEffect?`補足：${picked.progressEffect}`:''
  ].filter(Boolean).join('\n');
  renderEventRewardPanel('base');updateBaseEventItemCopyButton();saveState(false);renderBaseEventControls();addLog(`拠点内ランダムイベント：${picked.eventName||'名称未設定'}${source?` / ${source.name||source.id}解放分`:''}${reward.items?.length?` / 入手候補${reward.items.length}種`:''}`);
}
function renderArea(){
  const a=selected($('areaSelect'),state.areas);
  if(!a){$('areaDetail').textContent='エリアデータがありません。';$('areaBar').style.width='0%';$('areaLabel').textContent='0%';return;}
  const p=progressObj('areas',a.id||a.name);
  $('areaNote').value=p.note||''; renderTimeControls(); renderWeatherManager();$('areaBar').style.width=clamp(p.value)+'%';$('areaLabel').textContent=clamp(p.value)+'%';
  $('areaDetail').innerHTML=`<div class="kv"><b>種別</b><span>${esc(a.areaType||'')}</span><b>難度</b><span>${esc(a.difficulty||'')}</span><b>イベント表</b><span>${esc(a.eventTableId||'')}</span><b>探索進行上昇</b><span>+${areaStepAmount(a)}%</span><b>主な素材</b><span>${esc(a.mainMaterials||'')}</span><b>主な魔物</b><span>${esc(a.mainMonsters||'')}</span><b>フィールド効果</b><span>${esc(a.fieldEffect||'なし')}</span>${areaUsesWorldCycle(a)?`<b>時間帯</b><span>${esc(selectedTimeSlot())}</span>`:''}</div>${a.description?`<p class="muted">${esc(a.description)}</p>`:''}`;
  const step=areaStepAmount(a),current=clamp(p.value),rumor=areaUsesWorldCycle(a)?selectedRumor():null;
  const rumorText=rumor?(isBossRumor(rumor)?'100%到達時にボス追跡を選択可能':(rumorActiveForTime(rumor,a)?'選択中の噂に対応するイベントの抽選重みが上昇':'選択中の噂は現在の時間帯では無効')):'噂補正なし';
  $('areaStepInfo').innerHTML=`<div class="kv"><b>現在</b><span>${current}%</span><b>1回の進行</b><span>+${step}%</span><b>進行後</b><span>${clamp(current+step)}%</span><b>噂補正</b><span>${esc(rumorText)}</span></div><p class="muted small">ボス噂は100%到達時に「噂を追う／通常イベント」を選択します。その他の噂は対応イベントの抽選重みを上げます。ランダムイベント結果では進行度を自動変更しません。</p>`;
  fillEventTables();
  resetImportantUsePanel('event');
  const roll=$('rollEventBtn');if(roll)roll.textContent=state.lastEventText?'イベント再抽選':'イベント抽選';updateEventCheckCopyButtons();
}
function renderMonster(){
  const m=selectedDropMonster(); if(!m){$('monsterDetail').textContent=dropAreaMonsterRows().length?'候補から魔物を選択してください。':'このエリアで選択できる魔物がありません。'; return;}
  $('monsterDetail').innerHTML=`<div class="kv"><b>HP</b><span>${esc(m.hp||'')}</span><b>回避</b><span>${esc(m.evasionValue||'')}</span><b>抵抗</b><span>${esc(m.resistValue||'')}</span><b>防御</b><span>${esc(m.defenseValue||'')}</span><b>先制</b><span>${esc(m.initiative||'')}</span><b>解体難易度</b><span>${esc(m.dismantleDifficulty||'未設定')}</span><b>解体判定</b><span>採取技能 &gt;= ${esc(m.dismantleDifficulty||'解体難易度')}</span></div>${m.habit?`<p class="muted"><b>習性：</b>${esc(m.habit)}</p>`:''}`;
}
function renderAll(){updateEventCheckCopyButtons();updateEventContentCopyButtons();renderDayStatus();renderTimeControls(); ensureWeatherForUnlockedAreas(false); syncDailyQuestSelectionFromFacility(); ensureDailyQuestSelection(); fillQuestSelect($('questSelect')?.value || ''); fillEventTables(); fillRumorSelect(); fillRumorAreas(); fillInnRumorSelect(); fillTreasureTables(); fillAppraisalRules(); renderQuest(); renderArea(); renderBaseEventControls(); renderDropMode(); renderEncounterDropList(); renderEventRewardPanel('event'); renderEventRewardPanel('quest'); renderEventRewardPanel('base'); renderRecipeMerchantPanel(); updateAreaEventItemCopyButton(); renderRumorResult(); renderDailyQuestResult(); renderWeatherManager(); renderTokenExportPanels(); renderLog();}
function getNumFromText(s, fallback=0){const m=String(s||'').match(/[+-]?\d+/); return m?Number(m[0]):fallback;}
function advanceQuestProgress(){
  const q=selected($('questSelect'),state.quests); if(!q)return;
  const p=progressObj('quests',q.id||q.name); const add=questStepAmount(q); const before=clamp(p.value);
  if(isDeliveryQuest(q)){p.value=100; saveState(false); renderQuest(); addLog(`${q.name||q.id} の納品を完了しました。`); return;}
  if(!questMatchesTime(q)){
    const msg=`${q.name||q.id} は ${questTimeRestrictionText(q)} の時間帯のみ進行できます。現在は ${selectedTimeSlot()} です。`;
    addLog(msg); alert(msg); renderQuest(); return;
  }
  p.value=clamp(before+add); const fired=triggerQuestSpecificEvents(q,before,p.value); saveState(false); renderQuest();
  addLog(`${q.name||q.id} の進行度を +${add}% しました。${before}% → ${p.value}%（行動回数は変更していません）`);
  if(fired.length && fired[0].treasureTableId){addLog(`確定入手：未鑑定の魔法または祈祷スクロール：★1×1（${fired[0].eventName||'クエスト固有イベント'}）`);}
}
function advanceAreaProgress(){const a=selected($('areaSelect'),state.areas); if(!a)return; const p=progressObj('areas',a.id||a.name); const add=areaStepAmount(a); const before=clamp(p.value); p.value=clamp(before+add); saveState(false); renderArea(); addLog(`${a.name||a.id} の探索進行度を +${add}% しました。${before}% → ${p.value}%（行動回数は変更していません）`); if(before<100 && p.value>=100) triggerAreaClearRumorEvent(a);}

function isRumorEvent(row){return String(row && row.eventType || '').trim()==='宿屋の噂';}
function eventConditionType(row){return String(row && row.conditionType || '').trim() || 'なし';}
function selectedRumor(){
  const sel=$('rumorSelect');
  if(!sel)return null;
  const raw=String(sel.value ?? '').trim();
  if(raw==='') return null;
  const rows=rumorRows();
  const i=Number(raw);
  return Number.isInteger(i) && i>=0 ? (rows[i] || null) : null;
}
function rumorRows(){return state.events.filter(isRumorEvent);}
function fillRumorSelect(){
  const sel=$('rumorSelect');
  if(!sel)return;
  const prev=String(sel.value ?? '').trim();
  const rows=rumorRows();
  sel.innerHTML='';
  const none=document.createElement('option');
  none.value='';
  none.textContent='なし';
  sel.appendChild(none);
  rows.forEach((r,i)=>{
    const o=document.createElement('option');
    o.value=String(i);
    o.textContent=`${r.eventName||'噂'}${r.areaName?` / ${r.areaName}`:''}${rumorScope(r)==='時間帯'?` / ${eventTimeSlots(r).join('・')||'時間限定'}`:''}`;
    sel.appendChild(o);
  });
  if(prev && [...sel.options].some(o=>o.value===prev)) sel.value=prev;
  else sel.value='';
  renderRumorDetail();
  if($('rumorSelectForInn')) fillInnRumorSelect();
}
function renderRumorDetail(){
  const box=$('rumorDetail');
  if(!box)return;
  const r=selectedRumor();
  if(!r){
    box.textContent='噂なし。前提条件なしの通常イベントだけが候補に入ります。';
    return;
  }
  const scope=rumorScope(r),slots=eventTimeSlots(r);const active=rumorActiveForTime(r,selected($('areaSelect'),state.areas));const bossRumor=isBossRumor(r);box.innerHTML=`<div class="kv"><b>噂</b><span>${esc(r.eventName||'')}</span><b>対象エリア</b><span>${esc(r.areaName||'')}</span><b>有効範囲</b><span>${esc(scope==='時間帯'?`${slots.join('・')||'指定時間'}のみ`:'一日全体')}${scope==='時間帯'&&!active?'（現在は時間外）':''}</span><b>探索中効果</b><span>${esc(r.progressEffect||'')}</span></div>${r.result?`<p class="muted">${esc(r.result)}</p>`:''}<p class="muted small">${bossRumor?'ボス噂は探索途中の抽選率を変えません。探索進行度100%到達時に「噂を追う」を選んだ場合だけ、対応ボスへ確定遭遇します。追わなければ通常イベントです。':'この噂はエリア探索時だけ、対応イベントの抽選重みを上げます。探索度100%のイベントは固定せず、クエスト報酬・依頼報酬も増減しません。'}</p>`;
}
function fillRumorAreas(){
  const sel=$('rumorAreaSelect');
  if(!sel)return;
  const prev=String(sel.value ?? '').trim();
  sel.innerHTML='';
  const all=document.createElement('option');
  all.value=''; all.textContent='全エリア'; sel.appendChild(all);
  (state.areas || []).forEach(a=>{
    const name=String(a.name || a.id || '').trim();
    if(!name)return;
    const o=document.createElement('option');
    o.value=name;
    o.textContent=`${name}${a.eventTableId?` / 表:${a.eventTableId}`:''}`;
    sel.appendChild(o);
  });
  if([...sel.options].some(o=>o.value===prev)) sel.value=prev;
}
function innRumorRows(){
  const areaName=String($('rumorAreaSelect')?.value || '').trim();
  const rows=rumorRows();
  if(!areaName) return rows;
  const area=state.areas.find(a=>String(a.name || '').trim()===areaName || String(a.id || '').trim()===areaName);
  const names=[areaName, String(area?.name || '').trim(), String(area?.id || '').trim()].filter(Boolean);
  return rows.filter(r=>!String(r.areaName || '').trim() || names.includes(String(r.areaName || '').trim()));
}
function fillInnRumorSelect(){
  const sel=$('rumorSelectForInn');
  if(!sel)return;
  const prev=String(sel.value ?? '').trim();
  const all=rumorRows();
  const rows=innRumorRows();
  sel.innerHTML='';
  const none=document.createElement('option');
  none.value=''; none.textContent='なし'; sel.appendChild(none);
  rows.forEach(r=>{
    const i=all.indexOf(r);
    if(i<0)return;
    const o=document.createElement('option');
    o.value=String(i);
    o.textContent=`${r.eventName||'噂'}${r.areaName?` / ${r.areaName}`:''}${rumorScope(r)==='時間帯'?` / ${eventTimeSlots(r).join('・')||'時間限定'}`:''}`;
    sel.appendChild(o);
  });
  if(prev && [...sel.options].some(o=>o.value===prev)) sel.value=prev;
  else sel.value='';
}
function applyRumorIndex(raw, fromInn=false){
  const value=String(raw ?? '').trim();
  const main=$('rumorSelect');
  const inn=$('rumorSelectForInn');
  if(main){main.value=value; renderRumorDetail();}
  if(inn && !fromInn){
    if([...inn.options].some(o=>o.value===value)) inn.value=value;
    else inn.value='';
  }
  const rows=rumorRows();
  const r=value==='' ? null : rows[Number(value)];
  renderRumorResult(r, value==='' ? 'clear' : 'apply');
  renderArea();
  return r || null;
}
function renderRumorResult(row=null, mode=''){
  const box=$('rumorResult');
  if(!box)return;
  let r=row;
  if(!r){
    const raw=String($('rumorSelectForInn')?.value ?? $('rumorSelect')?.value ?? '').trim();
    const rows=rumorRows();
    if(raw!=='') r=rows[Number(raw)] || null;
  }
  if(!r){
    state.lastRumorText = mode==='clear' ? '【宿屋の噂】\n今日は特定の噂を適用しません。' : state.lastRumorText;
    box.textContent = state.lastRumorText || '宿屋の噂結果がここに表示されます。';
    return;
  }
  const lines=[
    `【宿屋の噂】${r.eventName||'噂'}`,
    r.areaName?`対象エリア：${r.areaName}`:'対象エリア：全体',
    `有効範囲：${rumorScope(r)==='時間帯'?`${eventTimeSlots(r).join('・')||'指定時間'}のみ`:'一日全体'}`,
    r.progressEffect?`探索中効果：${r.progressEffect}`:'',
    r.result?`内容：${r.result}`:'',
    isBossRumor(r)?'補足：探索進行度100%到達時に噂を追えば対応ボスへ確定遭遇します。追わなければ通常イベントを抽選します。':'補足：この噂はエリア探索中の対応イベントを出やすくします。探索度100%の結果は固定しません。'
  ].filter(Boolean);
  state.lastRumorText=lines.join('\n');
  box.textContent=state.lastRumorText;
}
function rollRumor(){
  fillInnRumorSelect();
  const rows=innRumorRows();
  if(!rows.length){
    state.lastRumorText='【宿屋の噂】\n選択条件に該当する噂がありません。';
    renderRumorResult();
    return;
  }
  const all=rumorRows();
  const keyOf=r=>eventUniqueKey(r);
  const pool=rows.length>1 ? rows.filter(r=>keyOf(r)!==state.lastRumorKey) : rows;
  const picked=pool[Math.floor(Math.random()*pool.length)] || rows[0];
  state.lastRumorKey=keyOf(picked);
  const idx=all.indexOf(picked);
  if(idx>=0){
    const raw=String(idx);
    if($('rumorSelectForInn')) $('rumorSelectForInn').value=raw;
    applyRumorIndex(raw, true);
  }else{
    renderRumorResult(picked);
  }
  addLog(`宿屋の噂を選出：${picked.eventName||'噂'}`);
}
function clearRumor(){
  if($('rumorSelectForInn')) $('rumorSelectForInn').value='';
  if($('rumorSelect')) $('rumorSelect').value='';
  state.lastRumorKey='';
  state.lastRumorText='【宿屋の噂】\n今日は特定の噂を適用しません。';
  renderRumorDetail();
  renderRumorResult(null,'clear');
  addLog('今日の噂をなしにしました。');
}
function eventMatchesRumor(row, rumor){
  const type=eventConditionType(row);
  if(!type || type==='なし') return true;
  if(type==='噂話'){
    if(!rumor) return false;
    const area=(state.areas||[]).find(a=>String(a.name||'').trim()===String(row.areaName||'').trim()||String(a.eventTableId||'').trim()===String(row.tableId||'').trim())||selected($('areaSelect'),state.areas);
    if(!rumorActiveForTime(rumor,area))return false;
    const want=String(row.conditionValue || '').trim();
    const gotName=String(rumor.eventName || '').trim();
    const gotId=String(rumor.id || '').trim();
    return !!want && (want===gotName || want===gotId);
  }
  return false;
}
function isBossEvent(row){return String(row && row.eventType || '').trim()==='ボス遭遇';}
function isNamedEncounterEvent(row={}){return String(row.eventType||'').trim()==='二つ名遭遇'||String(row.id||'').startsWith('evt_named_');}
function publicEventTypeName(row={}){return isNamedEncounterEvent(row)?'魔物遭遇':String(row.eventType||'').trim();}
function isAreaBossMonster(row={}){return String(row.monsterTraits||'').split(',').map(v=>v.trim()).includes('ボス');}
function isQuestSpecificEvent(row){
  return eventConditionType(row)==='クエスト固有' || String(row && row.eventType || '').includes('クエスト固有');
}
function isBaseRandomEvent(row){
  return !isRumorEvent(row) && !isQuestSpecificEvent(row) && !isNamedEncounterEvent(row) && eventConditionType(row)==='なし';
}

function areaEventKey(area){
  return String(area && (area.id || area.name || area.eventTableId) || '').trim();
}
function bossRumorId(row){
  const m=String(row && row.notes || '').match(/(?:対応|確定遭遇)噂ID\s*[:：=]\s*([^\s,、;；]+)/);
  return m ? String(m[1] || '').trim() : '';
}
function bossMatchesSelectedRumor(row, rumor){
  const required=bossRumorId(row);
  return !!required && required===String(rumor && rumor.id || '').trim();
}
function isBossRumor(rumor={}){
  if(!rumor)return false;
  if(String(rumor.notes||'').includes('【噂種別】ボス'))return true;
  return (state.events||[]).some(row=>isBossEvent(row)&&bossMatchesSelectedRumor(row,rumor));
}
function bossEventForRumor(area={},rumor={}){
  if(!area||!rumor||!isBossRumor(rumor))return null;
  const tableId=String(area.eventTableId||'').trim();
  return (state.events||[]).find(row=>String(row.tableId||'').trim()===tableId&&isBossEvent(row)&&bossMatchesSelectedRumor(row,rumor))||null;
}
function eventRowsForArea(area, options={}){
  const tableId=String((area&&area.eventTableId)||$('eventTableSelect')?.value||'').trim();
  const rumor=options.rumor===undefined ? selectedRumor() : options.rumor;
  const includeEncounteredBoss=!!options.includeEncounteredBoss;
  const encountered=!!state.areaBossEncountered[areaEventKey(area)];
  return state.events.filter(e=>{
    if(String(e.tableId||'').trim()!==tableId) return false;
    if(isRumorEvent(e) || isQuestSpecificEvent(e)) return false;
    if(isBossEvent(e) && encountered && !includeEncounteredBoss) return false;
    if(!eventMatchesWeather(e,area)) return false;
    if(!eventMatchesTime(e,area)) return false;
    const type=eventConditionType(e);
    if(type==='天気')return true;
    return eventMatchesRumor(e, rumor);
  });
}

function normalizePartySize(value){
  const n=Number(value||4);
  return Math.min(7,Math.max(1,Number.isFinite(n)?Math.floor(n):4));
}
function setPartySize(value){
  const size=normalizePartySize(value);
  state.partySize=size;
  ['partySizeSelect','questPartySizeSelect'].forEach(id=>{const el=$(id);if(el)el.value=String(size);});
  return size;
}
function selectedPartySize(){
  return normalizePartySize(state.partySize || $('questPartySizeSelect')?.value || $('partySizeSelect')?.value || 4);
}
function effectiveQuestPartySize(q={}){
  const size=selectedPartySize();
  return questCategoryFor(q)==='重要' ? Math.max(2,size) : size;
}
function questPartyAdjustmentNote(q={}){
  return questCategoryFor(q)==='重要' && selectedPartySize()<2 ? 'PCが1人のため、サポートを加えた2人編成として処理します。' : '';
}
function handlePartySizeChange(value){
  setPartySize(value);
  state.lastEventText=''; state.lastEventKey=''; state.lastEventCheckCopyText='';
  state.lastQuestEventText=''; state.lastQuestEventKey=''; state.lastQuestCheckCopyText=''; state.lastQuestBattleCheckCopyText=''; state.lastQuestTreasureCopyText=''; state.lastQuestTreasureResults=[]; state.lastQuestEventTableRewardText=''; state.lastQuestEventTableRewardCopyText=''; state.lastQuestEventRewardState=null;
  state.lastQuestFixedEventText=''; state.lastQuestFixedEventKey='';
  clearTokenExportEncounter();
  renderQuest(); renderQuestEvents();
  saveState(false);
}
const ENCOUNTER_RULE_VERSION='v90.8.735-fixed-action-loadout-1';
const ENCOUNTER_DEFAULT_VALUES={
  'プチスライム':1,'ラフィンラット':1,'ヴェスパット':1,
  'ラピットホーン':2,'カラパスビートル':2,'グラウワーム':2,'ラスクレイル':2,'マイコニド':2,'ブランチリング':2,
  'マッドホッパー':2,'バブルスライム':2,'ミストモスキート':2,
  'ルートハウンド':3,'モスバック':2,'ウィスパウル':1,'ドロマール':3,'リードリザード':2,'ミアズマリーチ':1,
  'ミラースライム':2,'エコーリード':2,'フェイズモス':3,'グラスレイ':3,'ミラード':3,'ヴェイル':3,
  'レゾナバット':1,'ピックモール':2,'オアスケイル':2,'ラストマイト':1,'マインゴーレム':3,'ルミナウィスプ':2,
  'ブリーズホップ':2,'クラッグラム':3,'カイトビーク':2,'ソノラブルーム':2,'グライドスケイル':3,'ボルトバイソン':3,
  'スコリアゲッコー':3,'シンダースライム':2,'サルファマーモット':1,'サーマルカイト':3,'グラスケイル':3,'ヴェインサラマンダー':3,'アッシュバイソン':3
};
const AREA_ENCOUNTER_POOLS={
  '街はずれの草原':['プチスライム','ラフィンラット','ラピットホーン','ヴェスパット','カラパスビートル','グラウワーム'],
  '近郊の森':['ラフィンラット','ラピットホーン','ヴェスパット','カラパスビートル','ラスクレイル','マイコニド','ルートハウンド','ブランチリング','モスバック','ウィスパウル'],
  '水辺の湿地':['プチスライム','グラウワーム','マイコニド','マッドホッパー','バブルスライム','ミストモスキート','ドロマール','リードリザード','ミアズマリーチ'],
  '山麓の旧鉱山':['ラフィンラット','グラウワーム','マイコニド','ミアズマリーチ','レゾナバット','ピックモール','オアスケイル','ラストマイト','マインゴーレム','ルミナウィスプ'],
  '反照の水庭':['ミラースライム','フェイズモス','グラスレイ','エコーリード','ミラード','ヴェイル'],
  '風渡りの高原':['ブリーズホップ','クラッグラム','カイトビーク','ソノラブルーム','グライドスケイル','ボルトバイソン'],
  '灰冠の火山峡谷':['クラッグラム','グライドスケイル','スコリアゲッコー','シンダースライム','サルファマーモット','サーマルカイト','グラスケイル','ヴェインサラマンダー','アッシュバイソン']
};
const ENCOUNTER_BACKLINE_RATE={
  'プチスライム':.15,'ラフィンラット':.10,'ラピットホーン':.10,'ヴェスパット':.60,'カラパスビートル':.10,'グラウワーム':.10,
  'ラスクレイル':.50,'マイコニド':.55,'ルートハウンド':.20,'ブランチリング':.30,'モスバック':.10,'ウィスパウル':.65,'マッドホッパー':.15,'バブルスライム':.50,
  'ミストモスキート':.60,'ドロマール':.10,'リードリザード':.15,'ミアズマリーチ':.10,
  'レゾナバット':.65,'ピックモール':.15,'オアスケイル':.10,'ラストマイト':.25,'マインゴーレム':.05,'ルミナウィスプ':.65,
  'ミラースライム':.30,'フェイズモス':.55,'グラスレイ':.30,'エコーリード':.50,'ミラード':.15,'ヴェイル':.35,
  'ブリーズホップ':.10,'クラッグラム':.05,'カイトビーク':.65,'ソノラブルーム':.70,'グライドスケイル':.15,'ボルトバイソン':.05,
  'スコリアゲッコー':.10,'シンダースライム':.30,'サルファマーモット':.35,'サーマルカイト':.70,'グラスケイル':.05,'ヴェインサラマンダー':.20,'アッシュバイソン':.05
};
// エリア差は魔物自身の遭遇値ではなく、編成全体の予算へ一度だけ加算する。
const AREA_ENCOUNTER_BUDGET_BONUS={
  '街はずれの草原':0,
  '近郊の森':1,
  '水辺の湿地':2,
  '山麓の旧鉱山':3,
  '反照の水庭':3,
  '風渡りの高原':4,
  '灰冠の火山峡谷':6
};
