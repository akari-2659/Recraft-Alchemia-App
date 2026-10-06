function areaForQuest(q){
  if(!q)return null;
  return state.areas.find(a=>sameText(a.name,q.areaName)||sameText(a.id,q.areaId)||sameText(a.eventTableId,q.eventTableId))||null;
}
function tableIdForQuest(q){
  const area=areaForQuest(q);
  return String((q&&q.eventTableId)|| (area&&area.eventTableId) || '').trim();
}
function eventThreshold(row){
  if(row && row.fixedThreshold!==undefined && row.fixedThreshold!==null) return Number(row.fixedThreshold);
  const src=String(row&&row.roll||row&&row.progressEffect||row&&row.progress||'');
  const m=src.match(/(\d+)\s*%/);
  return m?Number(m[1]):null;
}
function parseQuestFixedEvents(text){
  return String(text||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map((line,idx)=>{
    let parts=line.split('	');
    if(parts.length<3) parts=line.split(/[｜|]/);
    if(parts.length<3) parts=line.split(/\s*,\s*/);
    const progress=String(parts[0]||'').trim();
    const fixedThreshold=eventThreshold({progress}) ?? getNumFromText(progress, 0);
    const eventName=String(parts[1]||`固定イベント${idx+1}`).trim();
    const result=String(parts.slice(2).join(' / ')||'').trim();
    return {fixedThreshold, eventName, eventType:'固定イベント', result, raw:line};
  }).filter(e=>Number.isFinite(e.fixedThreshold));
}
function questBoundEvents(q){
  if(!q)return [];
  const qid=String(q.id||'').trim();
  const qname=String(q.name||'').trim();
  return (state.events||[]).filter(e=>{
    if(eventConditionType(e)!=='クエスト固有' && !String(e.eventType||'').includes('クエスト固有')) return false;
    const cond=String(e.conditionValue||'');
    return (qid && cond.includes(qid)) || (qname && cond.includes(qname));
  }).map(e=>Object.assign({},e,{fixedThreshold:eventThreshold(e)??getNumFromText(e.conditionValue,100)}));
}
function questSpecificEvents(q){
  const bound=questBoundEvents(q);
  const boundKeys=new Set(bound.map(e=>`${eventThreshold(e)??''}:${String(e.eventName||'').trim()}`));
  const textRows=parseQuestFixedEvents(q && q.fixedEvents).filter(e=>!boundKeys.has(`${eventThreshold(e)??''}:${String(e.eventName||'').trim()}`)).map(e=>Object.assign({},e,{areaName:String(q?.areaName||q?.questLocation||'').trim(),__questName:String(q?.name||'').trim()}));
  return [...bound,...textRows].sort((a,b)=>(eventThreshold(a)??999)-(eventThreshold(b)??999));
}
function isBaseQuest(q={}){return String(q.requestKind||'').trim()==='拠点内依頼';}
function questRandomEventLabel(q={}){return isBaseQuest(q)?'拠点内イベント':'エリアイベント';}
function questRandomEvents(q){
  if(isBaseQuest(q))return baseEventRows();
  const area=areaForQuest(q),tableId=tableIdForQuest(q);
  if(!tableId)return [];
  return state.events.filter(e=>{
    if(String(e.tableId||'').trim()!==tableId||isRumorEvent(e)||isQuestSpecificEvent(e)||isBossEvent(e))return false;
    if(!eventMatchesTime(e,area))return false;
    const type=eventConditionType(e);
    if(type==='天気')return eventMatchesWeather(e,area);
    return type==='なし';
  });
}
function isDeliveryQuest(q={}){return String(q.requestKind||'').trim()==='納品依頼';}
function isImportantQuest(q={}){return questCategoryFor(q)==='重要';}
function questLocationText(q={}){return String(q.questLocation||((q.requestKind==='拠点内依頼'||q.requestKind==='納品依頼')?'拠点':q.areaName)||'未設定').trim();}
function questBattleRoundLimit(q={}){const n=Number(q.battleRoundLimit);return Number.isFinite(n)&&n>0?Math.floor(n):0;}
function questSpecialConditionLabel(q={}){
  const type=String(q.questType||'').trim(),n=questBattleRoundLimit(q);
  if(type==='制限戦闘')return n?`時間制限（${n}ラウンド以内）`:'時間制限';
  if(type==='継続行動')return n?`継続作業（${n}ラウンド以内）`:'継続作業';
  if(type==='運搬保護'){
    const fail=String(q.battleRoundFailure||q.clearCondition||'');
    return fail.includes('命中')?'運搬保護（命中失敗）':'運搬保護（被ダメージ失敗）';
  }
  if(q.battleRoundSuccess||q.battleRoundFailure)return n?`特殊戦闘（${n}ラウンド以内）`:'特殊戦闘';
  return '';
}
function questBattleRoundLines(q={}){const label=questSpecialConditionLabel(q);if(!label)return[];return [`特殊条件：${label}`,q.battleRoundSuccess?`達成条件：${q.battleRoundSuccess}`:'',q.battleRoundFailure?`失敗条件：${q.battleRoundFailure}`:''].filter(Boolean);}
function isWorkQuest(q={}){return String(q.questType||'').trim()==='継続行動';}
function questWorkEvent(q={}){return questSpecificEvents(q).find(e=>Number(eventThreshold(e))===100)||null;}
function questBattleInternalCheckInfo(q={},e={}){
  const result=String(e?.result||'');
  if(!/戦闘発生/.test(result))return null;
  const action=(result.match(/主行動《([^》]+)》/)||[])[1]||'';
  if(!action)return null;
  const inline=inlineEventCheckInfo(result);
  if(!inline.expr)return null;
  const parts=eventCheckExpressionParts(inline.expr);
  if(!parts.length)return null;
  const targets=[...new Set(parts.map(v=>String(v.target||'')).filter(Boolean))];
  const line=targets.length===1
    ?`${parts.map(v=>v.skill).join('・')} / 達成値：${targets[0]}`
    :parts.map(v=>`${v.skill}（達成値：${v.target||'?'}）`).join('・');
  return{action,expr:inline.expr,line};
}
function questBattleInternalCheckCopyText(q={},e={}){
  const info=questBattleInternalCheckInfo(q,e);if(!info)return'';
  return `【戦闘内判定：${info.action}】\n${info.line}`;
}
function questBattleInternalCheckDisplayText(q={},e={}){const info=questBattleInternalCheckInfo(q,e);return info?info.line:'';}
function fixedBattlePerceptionLines(groups=[]){
  const highest=encounterHighestInitiative(groups);
  if(highest===null)return [];
  const composition=(groups||[]).map(g=>`${publicEncounterMonsterName(g.name)}×${Math.max(1,Math.floor(Number(g.count)||1))}`).join('・');
  return [composition?`感知/達成値：${highest}/${composition}`:`感知/達成値：${highest}`];
}
function questFixedEventCheckCopyText(q={},e={},resolvedEncounter=null){
  const internal=questBattleInternalCheckInfo(q,e);
  const battleMode=eventBattleCopyMode(e);
  const hasBattle=!!battleMode||!!internal;
  const size=effectiveQuestPartySize(q);
  if(hasBattle){
    const groups=eventEncounterGroupsForFixedCheck(e,size,resolvedEncounter);
    const detect=fixedBattlePerceptionLines(groups);
    if(detect.length){
      // 固定戦闘も他の戦闘判定と同じ1行形式に統一する。
      // 成否で戦闘へ分岐する場合だけ、元判定と戦闘発生時の感知を2行で併記する。
      if(battleMode==='戦闘予感'){
        const base=eventCheckInfo(e)?.copy||'';
        return [base,`戦闘発生時：${detect[0]}`].filter(Boolean).join('\n');
      }
      return detect[0];
    }
  }
  // 非戦闘固定イベントもイベント名・エリア名・描写を付けず判定情報だけコピーする。
  return eventCheckCopyText(e,true);
}
function areaFixedEventCheckCopyText(area={},e={},resolvedEncounter=null){
  const battleMode=eventBattleCopyMode(e);
  if(!battleMode)return eventCheckCopyText(e,true);
  const groups=eventEncounterGroupsForFixedCheck(e,selectedPartySize(),resolvedEncounter);
  const detect=fixedBattlePerceptionLines(groups);
  if(!detect.length)return eventCheckCopyText(e,true);
  if(battleMode==='戦闘予感'){
    const base=eventCheckInfo(e)?.copy||'';
    return [base,`戦闘発生時：${detect[0]}`].filter(Boolean).join('\n');
  }
  return detect[0];
}
function questWorkCheckText(q={}){const e=questWorkEvent(q);return e?questBattleInternalCheckDisplayText(q,e):'';}
function workQuestReinforcementProfile(q={},size=effectiveQuestPartySize(q)){
  const n=normalizePartySize(size),area=String(q.areaName||'').trim();
  const minMap={1:1,2:1,3:2,4:2,5:2,6:3,7:3};
  const count=minMap[n]||2;
  const areaBonus=Math.max(0,Number(AREA_ENCOUNTER_BUDGET_BONUS[area]||0));
  const budget=Math.max(count,Math.ceil(n*.75)+Math.floor(areaBonus/2));
  return {partySize:n,budgetOverride:budget,minCount:count,exactCount:count,minSpent:Math.min(budget,count)};
}
function generateQuestWorkReinforcement(q={}){
  if(!isWorkQuest(q))return null;
  return generateRandomEncounter(String(q.areaName||''),workQuestReinforcementProfile(q));
}
function mergeEncounterGroups(groups=[]){
  const map=new Map();
  normalizeEncounterFrontline(groups).forEach(g=>{
    const formation=String(g.formation||g.position||'前衛').trim()||'前衛';
    const name=String(g.name||'').trim();if(!name)return;
    const key=`${formation}\t${name}`;
    const prev=map.get(key)||{name,formation,position:formation,count:0};prev.count+=Math.max(1,Math.floor(Number(g.count)||1));map.set(key,prev);
  });
  return [...map.values()];
}
function appendEncounterForDrops(label='',areaName='',groups=[]){
  const clean=normalizeEncounterFrontline((groups||[]).map(g=>({name:g.name,count:g.count,formation:g.formation||g.position||''}))).map(g=>({name:g.name,count:g.count,formation:g.formation||g.position||''}));if(!clean.length)return;
  const current=(state.lastEncounter&&Array.isArray(state.lastEncounter.groups))?state.lastEncounter.groups:[],existingInstances=(state.lastEncounter&&Array.isArray(state.lastEncounter.instances))?state.lastEncounter.instances:[];
  const bountyEligible=state.lastEncounter?.bountyEligible!==false;
  const added=encounterInstanceRows(clean,{fixedIv:false,areaName:String(areaName||'').trim()}),mergedGroups=mergeEncounterGroups([...current,...clean]),instances=[...existingInstances,...added];
  state.lastEncounter={label:String(label||state.lastEncounter?.label||'戦闘').trim(),areaName:String(areaName||state.lastEncounter?.areaName||'').trim(),groups:mergedGroups,instances,bountyEligible,bountyG:bountyEligible?instances.reduce((sum,row)=>sum+Math.max(0,Number(row.bountyG)||0),0):0,fixedIv:false};
  const extra=added.map(row=>({uid:dropInstanceUid(),monsterId:row.monsterId,name:row.name,formation:row.formation,dismantleSuccess:false}));state.dropEncounterInstances=normalizeDropInstances([...(state.dropEncounterInstances||[]),...extra]);setDropMode('encounter');renderEncounterDropList();saveState(false);
}
function addQuestWorkReinforcement(){
  const q=selected($('questSelect'),state.quests);if(!q||!isWorkQuest(q)){addLog('継続作業クエストを選択してください。');return;}
  const progress=progressObj('quests',q.id||q.name);if(clamp(progress.value)<100){addLog('継続作業の100%イベント到達後に増援を追加してください。');return;}
  const resolution=generateQuestWorkReinforcement(q);if(!resolution||!resolution.groups?.length){addLog('増援編成を生成できませんでした。');return;}
  const key=String(q.id||q.name||'work');state.questWorkReinforcementCounts=state.questWorkReinforcementCounts||{};const wave=(Number(state.questWorkReinforcementCounts[key])||0)+1;state.questWorkReinforcementCounts[key]=wave;
  const groups=encounterGroupsForDrop({},resolution,effectiveQuestPartySize(q));
  setTokenExportEncounter(`${q.name||q.id}（増援${wave}）`,q.areaName||'',groups,'quest');
  appendEncounterForDrops(`${q.name||q.id}（増援含む）`,q.areaName||'',groups);
  state.lastQuestReinforcementText=[`増援${wave}：`,encounterResolutionBlock(resolution),encounterInitiativeText(groups),'アイテムドロップ欄へ各個体を追加済み。増援も通常どおり解体判定・ドロップ判定を行う。'].filter(Boolean).join('\n');
  saveState(false);renderQuestWorkReinforcementPanel(q);addLog(`継続作業の増援${wave}を追加：${encounterResolutionText(resolution)}`);
}
function renderQuestWorkReinforcementPanel(q=selected($('questSelect'),state.quests)){
  const panel=$('questWorkReinforcementPanel');if(!panel)return;
  if(!q||!isWorkQuest(q)||clamp(progressObj('quests',q.id||q.name).value)<100){panel.classList.add('hidden');panel.innerHTML='';return;}
  const check=questWorkCheckText(q);
  panel.classList.remove('hidden');
  panel.innerHTML=`<div class="event-section-title">継続作業：増援処理</div><div class="muted small">${check?`作業判定：${esc(check)}<br>`:''}作業未完了のまま敵が全滅した時だけ、ラウンド終了時に増援を発生させます。作業完了後は増援しません。追加した増援はアイテムドロップ欄へ個体単位で追記されます。</div>${state.lastQuestReinforcementText?`<div class="card muted" style="margin-top:8px">${esc(state.lastQuestReinforcementText).replace(/\n/g,'<br>')}</div>`:''}<div class="buttons" style="margin-top:8px"><button id="addQuestWorkReinforcementBtn" type="button">増援を追加</button></div>`;
  $('addQuestWorkReinforcementBtn')?.addEventListener('click',addQuestWorkReinforcement);
}
function questStepAmount(q){
  if(isDeliveryQuest(q))return 0;
  const n=getNumFromText(q&&q.progressStep,10);
  return Math.max(1, Math.min(100, Number.isFinite(n)?n:10));
}
function areaStepAmount(a){
  const n=getNumFromText(a&&a.progressStep,25);
  return Math.max(1, Math.min(100, Number.isFinite(n)?n:25));
}
function nextQuestEvent(q,current){
  return questSpecificEvents(q).find(e=>(eventThreshold(e)??101)>clamp(current));
}
function questProgressEventAt(q,percent){
  if(!q)return 'なし';
  if(isDeliveryQuest(q))return 'なし（納品確認）';
  const target=clamp(percent);
  const fixed=questSpecificEvents(q).find(e=>(eventThreshold(e)??-1)===target);
  return fixed?`固定：${target}% ${fixed.eventName||'名称未設定'}`:`${target}% ${questRandomEventLabel(q)}（ランダム抽選）`;
}
function questProgressEventForAdvance(q,current,nextValue){
  if(!q||isDeliveryQuest(q))return 'なし';
  const fixed=questSpecificEvents(q).find(e=>{const th=eventThreshold(e);return Number.isFinite(th)&&th>clamp(current)&&th<=clamp(nextValue);});
  return fixed?`固定：${eventThreshold(fixed)}% ${fixed.eventName||'名称未設定'}`:`${clamp(nextValue)}% ${questRandomEventLabel(q)}（ランダム抽選）`;
}
function renderQuestStepInfo(q,p){
  const box=$('questStepInfo');
  if(!box)return;
  if(!q){box.textContent='クエストを選択してください。'; return;}
  const step=questStepAmount(q);
  const current=clamp(p&&p.value);
  if(isDeliveryQuest(q)){box.innerHTML=`<div class="kv"><b>進行方式</b><span>納品確認で完了</span><b>納品物</b><span>${esc(q.deliveryItems||q.clearCondition||'未設定')}</span><b>現在</b><span>${current>=100?'完了':'未完了'}</span></div><p class="muted small">納品依頼は進行イベントを使用しません。指定された品を受け取った後、「納品完了にする」を押してください。</p>`;return;}
  const nextValue=clamp(current+step);
  const currentPlan=questProgressEventAt(q,current);
  const nextPlan=questProgressEventForAdvance(q,current,nextValue);
  box.innerHTML=`<div class="kv"><b>現在</b><span>${current}%</span><b>現在地点のイベント</b><span>${esc(currentPlan)}</span><b>1回の進行</b><span>+${step}%</span><b>進行後</b><span>${nextValue}%</span><b>次のイベント</b><span>${esc(nextPlan)}</span></div><p class="muted small">クエストは固定イベントとランダムイベントを混在させます。固定イベントが登録されていない進行区切り（0%を含む）は、エリア依頼では対象エリアのイベント、拠点内依頼では拠点内ランダムイベントを使用します。${questTimeSlots(q).length?`このクエストは${esc(questTimeRestrictionText(q))}のみ進行できます。`:''}</p>`;
}
function eventCheckSkillName(checkType=''){
  const raw=String(checkType||'').trim();
  if(!raw||raw==='なし')return '';
  return raw.replace(/\s*>=\s*目標値.*$/,'').trim();
}
function eventCheckExpressionRelation(expr=''){
  const raw=String(expr||'').trim();
  if(/(?:かつ|＋)/.test(raw))return 'and';
  if(/または/.test(raw))return 'or';
  return 'single';
}
function eventCheckExpressionParts(expr=''){
  const raw=String(expr||'').trim();
  if(!raw)return [];
  return raw.split(/\s*(?:または|かつ|＋)\s*/).map(v=>v.trim()).filter(Boolean).map(part=>{
    const m=part.match(/^(.+?)\s*>=\s*(\d+(?:\.\d+)?)$/);
    return m?{skill:m[1].trim(),target:m[2],penalty:0}:null;
  }).filter(Boolean);
}
function eventCheckExpressionDisplay(expr=''){
  const parsed=eventCheckExpressionParts(expr);
  if(!parsed.length)return '';
  const relation=eventCheckExpressionRelation(expr);
  const targets=[...new Set(parsed.map(v=>v.target))];
  const prefix=relation==='and'?'複合判定':'使用技能';
  if(targets.length===1)return `${prefix}：${parsed.map(v=>v.skill).join('・')} / 達成値：${targets[0]}`;
  return `${prefix}：${parsed.map(v=>`${v.skill}（達成値：${v.target}）`).join('・')}`;
}
function inlineEventCheckInfo(text=''){
  const raw=String(text||'');
  // 固定イベントでは「必要素材：…。」などの前置きの後に判定が書かれる場合もある。
  // 判定句の位置に依存せず抽出し、表示本文からは判定句だけを除去する。
  const m=raw.match(/(?:^|。)\s*判定：([^。]+)。?/);
  if(!m)return {display:'',text:raw,expr:''};
  const display=eventCheckExpressionDisplay(m[1]);
  if(!display)return {display:'',text:raw,expr:''};
  const start=(m.index||0)+(m[0].startsWith('。')?1:0);
  const len=m[0].length-(m[0].startsWith('。')?1:0);
  const cleaned=(raw.slice(0,start)+raw.slice(start+len)).replace(/^\s+|\s+$/g,'').replace(/^。/,'');
  return {display,text:cleaned,expr:m[1]};
}
function eventSubstituteCheckSkills(e={}){
  const text=String(e.result||'');
  const rows=[];
  const re=/([^\s、。：「」()（）]+?)で代用可能（判定\s*([+-]\d+)）/g;
  let m;
  while((m=re.exec(text))){
    const skill=String(m[1]||'').trim(),penalty=Number(m[2]);
    if(skill&&!rows.some(r=>r.skill===skill))rows.push({skill,penalty:Number.isFinite(penalty)?penalty:0});
  }
  return rows;
}
function eventSkillSuccessSegment(text='',skill=''){
  if(!skill)return '';
  const raw=String(text||'');
  const safe=String(skill).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const patterns=[
    new RegExp(`${safe}成功\\s*[：:]`),
    new RegExp(`判定成功\\s*[：:]`)
  ];
  let match=null;
  for(const re of patterns){
    const m=raw.match(re);
    if(m){match=m;break;}
  }
  if(!match)return '';
  const start=(match.index||0)+match[0].length;
  const tail=raw.slice(start);
  const boundaries=[
    /。[^。]*?で代用可能（判定\s*[+-]\d+）/,
    /。失敗\s*[：:]/,
    /。(?:判定)?成功\s*[：:]/,
    /。\s*戦闘発生\s*[：。]/
  ];
  let cut=tail.length;
  boundaries.forEach(re=>{
    const m=tail.match(re);
    if(m&&Number.isFinite(m.index)&&m.index<cut)cut=m.index;
  });
  return tail.slice(0,cut).trim();
}
function normalizeEventOutcome(text=''){
  return String(text||'').replace(/^同じ(?:結果|抽選結果|宝箱表)?\s*/,'').replace(/^同様に\s*/,'').replace(/[、，,\s]/g,'').trim();
}
function eventItemOutcomeSignature(outcome=''){
  let text=String(outcome||'').trim();
  if(!text||/^(?:入手なし|追加素材なし|抽選なし|効果なし|補正なし|安全に通過|安全に迂回|安全な位置へ移動|危険な空気を避ける)/.test(text))return 'NONE';

  const parts=[];

  const tableMatches=[...text.matchAll(/宝箱表「([^」]+)」/g)];
  tableMatches.forEach(m=>parts.push(`TABLE:${m[1]}`));

  const drawMatches=[...text.matchAll(/(?:入手アイテム表の)?(?:同じ)?抽選結果(?:の)?\s*(\d+)\s*枠/g)];
  drawMatches.forEach(m=>parts.push(`DRAW:${m[1]}`));
  if(/抽選結果の1枠目のみ/.test(text))parts.push('DRAW:1');

  const itemMatches=[...text.matchAll(/([一-龠々ぁ-んァ-ヶーA-Za-z0-9・]+)×([0-9D+d+-]+)/g)];
  itemMatches.forEach(m=>{
    const name=String(m[1]||'').trim();
    if(name&&!/^(?:前衛|後衛|味方|敵)$/.test(name))parts.push(`ITEM:${name}×${m[2]}`);
  });

  if(/換金品[^。]*数量[^。]*1個/.test(text))parts.push('MOD:換金品数量1');
  if(/追加で入手|追加素材/.test(text)){
    const extra=[...text.matchAll(/([一-龠々ぁ-んァ-ヶーA-Za-z0-9・]+)×([0-9D+d+-]+)[^。]*追加/g)];
    extra.forEach(m=>parts.push(`EXTRA:${m[1]}×${m[2]}`));
  }

  if(!parts.length){
    if(/入手アイテム表|抽選結果|宝箱表|を入手|を回収|を発見/.test(text))return `ITEMTEXT:${normalizeEventOutcome(text)}`;
    return 'NONE';
  }
  return [...new Set(parts)].sort().join('|');
}
function eventCheckContentMode(e={},skills=[]){
  if((skills||[]).length<2)return '';
  const text=String(e.result||'');
  const segments=skills.map(row=>eventSkillSuccessSegment(text,row.skill));
  const signatures=segments.map(seg=>eventItemOutcomeSignature(seg));
  const primary=signatures[0]||'NONE';
  const primaryTableOnly=primary.split('|').filter(v=>v.startsWith('TABLE:')).join('|')||'NONE';
  const normalized=signatures.map((sig,index)=>{
    if(index===0)return primary;
    const seg=String(segments[index]||'');
    if(/^同じ宝箱表/.test(seg)){
      const mods=[];
      if(/換金品[^。]*数量[^。]*1個/.test(seg))mods.push('MOD:換金品数量1');
      return [primaryTableOnly,...mods].filter(v=>v&&v!=='NONE').sort().join('|')||'NONE';
    }
    return sig||'NONE';
  });
  return normalized.slice(1).some(sig=>sig!==primary)?'内容変化':'内容同一';
}
function eventBattleCopyMode(e={}){
  const text=String(e.result||'').trim();
  if(!text)return '';

  // 「次にボスへ挑む戦闘」など、将来の戦闘を示すだけの記述は現在イベントの戦闘扱いにしない。
  const actualBattle=/(?:戦闘発生|戦闘が発生|との戦闘(?:が発生)?|人数対応戦闘|ランダム編成との戦闘)/;
  if(!actualBattle.test(text))return '';

  // 文頭、または独立した文として「戦闘発生」が置かれている場合は判定結果にかかわらず戦闘。
  if(/^\s*戦闘発生\s*[：。]/.test(text)||/。\s*戦闘発生\s*[：。]/.test(text))return '戦闘発生';

  // 成功側で「戦闘前」と明記され、失敗側でも戦闘が発生するものも確定戦闘。
  if(/成功\s*[：:][^。]*戦闘前/.test(text)&&/失敗\s*[：:][^。]*(?:戦闘発生|戦闘が発生|との戦闘|人数対応戦闘)/.test(text))return '戦闘発生';

  // 成否など一部の結果でのみ戦闘になる。
  return '戦闘予感';
}
function eventFailureSegment(text=''){
  const raw=String(text||'');
  const m=raw.match(/失敗\s*[：:]/);
  if(!m)return '';
  return raw.slice((m.index||0)+m[0].length).trim();
}
function eventHasCrisisOutcome(e={}){
  const failure=eventFailureSegment(e.result||'');
  if(!failure)return false;
  // 戦闘そのものは戦闘タグで示すため、ここでは直接ダメージ・状態異常・不利効果を対象にする。
  return /(?:HPを?\s*\d+点?減少|\d+D\d+(?:[+-]\d+)?(?:無属性|火|水|風|雷|光|闇)?ダメージ|ダメージを受け|ダメージを与え|疲労度(?:が|を)?\s*\d+増加|火傷|毒|麻痺|睡眠|汚染|呪い|呪縛|拘束|転倒|行動不能|回避[-－−]\d+|抵抗[-－−]\d+|防御[-－−]\d+|判定[-－−]\d+|最初の判定[-－−]\d+)/.test(failure);
}
function eventHasMaterialOutcome(e={}){
  const type=String(e.eventType||'');
  const result=String(e.result||'');
  if(type.includes('採取'))return true;
  const mats=(state.items||[]).filter(row=>String(row.dataKind||'').trim()==='素材'&&String(row.name||'').trim());
  return mats.some(row=>{
    const name=String(row.name||'').trim();
    if(!name||!result.includes(name))return false;
    const safe=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp(`${safe}[^。]{0,24}(?:×[0-9D+d+-]+)?[^。]{0,20}(?:入手|回収|採取)`).test(result)
      || new RegExp(`(?:入手|回収|採取)[^。]{0,20}${safe}`).test(result);
  });
}
function eventHasTreasureOutcome(e={}){
  const type=String(e.eventType||'');
  const result=String(e.result||'');
  return type.includes('宝箱')||!!String(e.treasureTableId||'').trim()||/宝箱表「[^」]+」/.test(result);
}
function eventOutcomeCopyTags(e={}){
  // 確実に戦闘が起きる場合は、タグではなく同じ行へ実際の出現構成を表示する。
  // 結果次第で戦闘になる場合だけ、従来どおり /戦闘予感 を残す。
  const battle=eventBattleCopyMode(e);
  if(battle==='戦闘発生')return [];
  if(battle==='戦闘予感')return ['戦闘予感'];

  const tags=[];
  const treasure=eventHasTreasureOutcome(e);
  if(treasure)tags.push('宝箱発見');
  else if(eventHasMaterialOutcome(e))tags.push('素材入手');
  if(eventHasCrisisOutcome(e))tags.push('危機回避');
  return [...new Set(tags)];
}
function isNamedIndividualMonster(row={}){
  const traits=String(row.monsterTraits||'').split(/[,、，]/).map(v=>v.trim()).filter(Boolean);
  return traits.includes('二つ名')||String(row.id||'').startsWith('mon_named_');
}
function publicEncounterMonsterName(name=''){
  const raw=String(name||'').trim();
  const row=(state.monsters||[]).find(m=>String(m.name||'').trim()===raw);
  if(!row||!isNamedIndividualMonster(row))return raw;
  const base=String(row.baseMonsterName||'').trim();
  return `${base||raw}？`;
}
function eventEncounterGroupsForCopy(e={},partySize=selectedPartySize()){
  const resolved=Array.isArray(e.__resolvedEncounterGroups)?e.__resolvedEncounterGroups:null;
  const groups=resolved&&resolved.length?resolved:encounterCompositionGroups(e,partySize);
  return (groups||[]).map(g=>({name:String(g.name||'').trim(),count:Math.max(1,Math.floor(Number(g.count)||1)),formation:String(g.formation||g.position||'').trim()})).filter(g=>g.name);
}
function eventEncounterInlineComposition(e={},partySize=selectedPartySize()){
  return eventEncounterGroupsForCopy(e,partySize).map(g=>`${publicEncounterMonsterName(g.name)}×${g.count}`).join('・');
}
function eventEncounterGroupsFromResultText(e={},partySize=selectedPartySize()){
  const text=resolveEncounterTokensInText(String(e.result||''),partySize);
  if(!text||!/戦闘/.test(text))return [];
  const groups=[];
  const monsters=[...(state.monsters||[])].filter(m=>String(m.name||'').trim()).sort((a,b)=>String(b.name||'').length-String(a.name||'').length);
  monsters.forEach(monster=>{
    const name=String(monster.name||'').trim();
    const safe=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp(`(?:(前衛|後衛)に)?${safe}\\s*×\\s*(\\d+)`,'g');
    let m;
    while((m=re.exec(text))){
      const count=Math.max(0,Math.floor(Number(m[2])||0));if(count<1)continue;
      groups.push({name,count,formation:String(m[1]||'前衛').trim()||'前衛'});
    }
  });
  const map=new Map();
  groups.forEach(g=>{const key=`${g.formation}\t${g.name}`,prev=map.get(key)||{name:g.name,count:0,formation:g.formation,position:g.formation};prev.count+=g.count;map.set(key,prev);});
  return normalizeEncounterFrontline([...map.values()]);
}
function eventEncounterGroupsForFixedCheck(e={},partySize=selectedPartySize(),resolvedEncounter=null){
  if(resolvedEncounter){
    const groups=encounterGroupsForDrop({},resolvedEncounter,partySize);
    if(groups.length)return groups;
  }
  const configured=eventEncounterGroupsForCopy(e,partySize);
  if(configured.length)return configured;
  return eventEncounterGroupsFromResultText(e,partySize);
}
function eventCheckInfo(e={}){
  let expr='';
  const raw=String(e.checkType||'').trim();
  const target=String(e.targetValue||'').trim();
  const battleMode=eventBattleCopyMode(e);
  const guaranteedBattle=battleMode==='戦闘発生';
  if(raw&&raw!=='なし')expr=raw.replace(/目標値/g,target||'目標値');
  else expr=inlineEventCheckInfo(e.result||'').expr;
  // 戦闘だけが確実に起き、別の判定が登録されていない場合は感知を振る。
  // 達成値は実際に出現する敵の中で最も高い先制値を使用する。
  if(!expr&&guaranteedBattle){
    const highest=encounterHighestInitiative(eventEncounterGroupsForCopy(e),e.areaName||'');
    if(highest!==null)expr=`感知>=${highest}`;
  }
  const skills=eventCheckExpressionParts(expr);
  if(!skills.length)return null;
  eventSubstituteCheckSkills(e).forEach(sub=>{
    if(!skills.some(row=>row.skill===sub.skill))skills.push({skill:sub.skill,target:skills[0]?.target||target,penalty:sub.penalty});
  });
  const targets=[...new Set(skills.map(row=>String(row.target||'')).filter(Boolean))];
  const skillText=skills.map(row=>`${row.skill}${row.penalty?`${row.penalty>0?'+':''}${row.penalty}`:''}`).join('・');
  const relation=eventCheckExpressionRelation(expr);
  const contentMode=relation==='and'?'複合判定':eventCheckContentMode(e,skills);
  const outcomeTags=eventOutcomeCopyTags(e);
  let line='';
  if(targets.length===1)line=`${skillText} / 達成値：${targets[0]}`;
  else line=skills.map(row=>`${row.skill}${row.penalty?`${row.penalty>0?'+':''}${row.penalty}`:''}（達成値：${row.target||'?'}）`).join('・');
  if(contentMode)line+=` /${contentMode}`;
  if(guaranteedBattle){
    const composition=eventEncounterInlineComposition(e);
    if(composition)line+=` / ${composition}`;
  }else outcomeTags.forEach(tag=>{line+=` /${tag}`;});
  return {skills,targets,mode:contentMode,outcomeTags,copy:line,display:`使用技能：${line}`};
}
function eventCheckDisplayText(e={}){
  return eventCheckInfo(e)?.display||'';
}
function eventIntroNarrative(e={}){
  const name=String(e.eventName||'').trim();
  const type=String(e.eventType||'').trim();
  // PLへ渡す描写にはエリア名・イベント名・DBの名称入りdescriptionを使用しない。
  // eventNameは分類判定にだけ使い、出力文には埋め込まない。
  if(/採集|採取|群生|露頭|鉱脈|晶|茸|草|苔|根|藻/.test(name)||/採取|食材/.test(type))return '足元や周囲に、素材として使えそうなものが見つかる。状態を見極めて丁寧に探せば、傷めずに持ち帰れそうだ。';
  if(/確認|手がかり|記録|読み|測定|観測|調査|選鉱/.test(name)||/発見|探索/.test(type))return '周囲とは少し違う痕跡が残っている。状態を一つずつ確かめれば、見落とされていた手掛かりまで辿れそうだ。';
  if(/点検|交換|繕|清掃|封緘|固定|打ち|作り|再同期|安定化|封鎖|洗浄|塗り|清書|再固定|締め|手入れ|補修|整備|運搬|仕分|選別|調整|修理|整理/.test(name)||/操作/.test(type))return '手を入れる必要のある箇所が残っている。状態と手順を見極めれば、安全に作業を進められそうだ。';
  if(/戦闘|遭遇|影|気配|羽音|足音|声/.test(name)||/魔物|遭遇|強敵|ボス|二つ名|戦闘/.test(type))return '不穏な気配が近くにある。音や痕跡を追えば、接触する前に相手の位置を掴めそうだ。';
  if(/橋|足場|斜面|扉|隔壁|昇降機|風|雷|噴気|支柱/.test(name)||/障害|危険|異界現象|異常/.test(type))return '進路や周囲に注意を要する箇所がある。状態と動きを見極めれば、安全に抜ける方法を探せそうだ。';
  if(/休息/.test(type))return '周囲の危険が薄い場所がある。安全を確かめれば、しばらく身体を休められそうだ。';
  return '周囲に普段とは少し違う変化が見られる。状態を確かめれば、どう対処すべきか判断できそうだ。';
}
function eventCheckCopyText(e={},fixed=false){
  const line=eventCheckInfo(e)?.copy||'';
  if(!line)return '';
  if(fixed)return line;
  const name=String(e.eventName||'名称未設定').trim()||'名称未設定',intro=eventIntroNarrative(e);
  return [`【${name}】`,intro,'',line].filter((v,i,a)=>v!==''||i===2).join('\n');
}
function eventDetailText(e,q=null){
  const partySize=q?effectiveQuestPartySize(q):selectedPartySize();
  const internal=q?questBattleInternalCheckInfo(q,e):null;
  return [
    publicEventTypeName(e)?`種別：${publicEventTypeName(e)}`:'',
    e.description?`描写：${e.description}`:'',
    internal?`戦闘内判定：${internal.line}`:eventCheckDisplayText(e),
    e.result?`結果：${eventResultTextForDisplay(e,partySize)}`:'',
    e.progressEffect?`進行効果：${e.progressEffect}`:'',
    e.notes?`メモ：${e.notes}`:''
  ].filter(Boolean).join('\n');
}
function eventDetailHtml(e, cls='', prefix='', kind='fixed',q=null){
  const th=eventThreshold(e);
  const badge = kind==='random' ? '<span class="badge random">ランダム</span>' : '<span class="badge fixed">固定</span>';
  const threshold = th!==null ? `進行度${th}%：` : '';
  return `<div class="event-card ${kind} ${cls}"><div class="event-title">${badge} ${esc(prefix)}${threshold}${esc(e.eventName||'名称未設定')}</div><div class="muted small">${esc(eventDetailText(e,q)).replace(/\n/g,'<br>')}</div></div>`;
}
function renderQuestEvents(){
  const box=$('questEventDetail');
  const q=selected($('questSelect'),state.quests);
  if(!box || !q){ if(box) box.textContent='クエストデータがありません。'; return; }
  const delivery=isDeliveryQuest(q);
  const p=progressObj('quests',q.id||q.name);
  const fixedRows=questSpecificEvents(q);
  const randomRows=questRandomEvents(q);
  const current=clamp(p.value);
  const parts=[];
  parts.push('<div class="event-section"><div class="event-section-title"><span class="badge fixed">固定</span> クエスト固定イベント</div><div class="muted small">クエスト登録時に入力した固定イベントです。進行度が指定値に到達したら、GMが内容を確認して発生させます。ランダム抽選ではありません。</div>');
  if(state.lastQuestFixedEventText){
    parts.push(`<div class="event-card fixed active"><div class="event-title"><span class="badge fixed">固有</span> 直近の発生結果</div><div class="muted small">${esc(state.lastQuestFixedEventText).replace(/\n/g,'<br>')}</div></div>`);
  }
  if(fixedRows.length){
    parts.push(fixedRows.map(e=>{
      const th=eventThreshold(e)??0;
      const cls = th<=current ? 'active' : 'next';
      const prefix = th<=current ? '到達済み：' : '未到達：';
      return eventDetailHtml(e,cls,prefix,'fixed',q);
    }).join(''));
  }else{
    parts.push('<div class="muted small">このクエストには固定イベントが登録されていません。</div>');
  }
  parts.push('</div>');
  if(!delivery){
    const randomSourceText=isBaseQuest(q)?'解放済みエリアに応じて候補へ入る拠点内ランダムイベント':'選択中クエストの対象エリアに設定されたランダムイベント';
    parts.push(`<div class="event-section"><div class="event-section-title"><span class="badge random">ランダム</span> クエストランダムイベント</div><div class="muted small">${randomSourceText}です。「エリアイベント」を押した時だけ結果が出ます。戦闘イベントは登録済みの出現構成をそのまま使用します。候補数：${randomRows.length}件</div>`);
    if(state.lastQuestEventText){
      parts.push(`<div class="event-card random"><div class="event-title"><span class="badge random">ランダム</span> 直近の抽選結果</div><div class="muted small">${esc(state.lastQuestEventText).replace(/\n/g,'<br>')}</div></div>`);
    }else{
      parts.push('<div class="muted small">ランダムイベント結果はまだありません。</div>');
    }
    parts.push('</div>');
  }else{
    parts.push('<div class="muted small" style="margin-top:10px">納品依頼は進行イベントを使用しません。指定された納品物の受け渡しだけを確認します。</div>');
  }
  box.innerHTML=parts.join('');
  renderEventRewardPanel('quest');
  resetImportantUsePanel('quest');
  renderQuestWorkReinforcementPanel(q);
  renderTokenExportPanels();
  renderRecipeMerchantPanel();
  // 固定イベント自動表示後も、通常イベントと同じコピー操作状態へ必ず同期する。
  updateEventCheckCopyButtons();
  updateEventContentCopyButtons();
}
function eventUniqueKey(row){return String(row && (row.id || `${row.tableId || ''}:${row.areaName || ''}:${row.eventName || ''}:${row.eventType || ''}`) || '');}
const importantUseCopyState={event:'',base:'',quest:''};
function importantUseElementId(scope,suffix){const head=scope==='base'?'base':scope==='quest'?'quest':'event';return `${head}ImportantUse${suffix}`;}
function currentRandomEventForImportantUse(scope='event'){
  const key=scope==='base'?state.lastBaseEventKey:scope==='quest'?state.lastQuestEventKey:state.lastEventKey;
  if(!key)return null;
  return (state.events||[]).find(row=>eventUniqueKey(row)===String(key))||null;
}
function crossoverImportantSpec(row={}){
  const notes=String(row.notes||'');
  const m=notes.match(/【越境対応】item=([^;\s]+);consume=(\d+);table=([^;\s]+)/);
  return m?{publicId:String(m[1]||'').trim().toUpperCase(),consume:Math.max(1,Number(m[2])||1),tableId:String(m[3]||'').trim()}:null;
}
function findImportantItemByPublicId(publicId=''){
  const upper=String(publicId||'').trim().toUpperCase();if(!upper)return null;
  return (state.items||[]).find(row=>String(row.itemType||'').trim()==='重要アイテム'&&String(row.publicId||'').trim().toUpperCase()===upper)||null;
}
function resetImportantUsePanel(scope='event'){
  importantUseCopyState[scope]='';
  const panel=$(importantUseElementId(scope,'Panel')),result=$(importantUseElementId(scope,'Result'));
  const target=$(importantUseElementId(scope,'Target')),consume=$(importantUseElementId(scope,'Consume'));
  const action=$(importantUseElementId(scope,'ActionBtn'));
  const row=currentRandomEventForImportantUse(scope),spec=row?crossoverImportantSpec(row):null;
  const item=spec?findImportantItemByPublicId(spec.publicId):null;
  if(target)target.textContent=spec?(item?`《${item.name||'重要アイテム'}》`:'対応品をDBから確認できません'):'—';
  if(consume)consume.textContent=spec?`${spec.consume}個`:'—';
  if(result){result.textContent='';result.classList.add('hidden');}
  if(action){action.classList.remove('hidden');action.disabled=!(spec&&item);}
  const copy=panel?.querySelector(`[data-important-use-copy="${scope}"]`);if(copy)copy.disabled=true;
  if(panel)panel.classList.toggle('hidden',!(row&&spec));
}
function resolveDeclaredImportantItem(scope='event'){
  const row=currentRandomEventForImportantUse(scope),result=$(importantUseElementId(scope,'Result'));
  const showResult=text=>{if(result){result.textContent=String(text||'');result.classList.remove('hidden');}};
  if(!row){showResult('先にランダムイベントを抽選してください。');return;}
  const spec=crossoverImportantSpec(row);
  if(!spec){showResult('このイベントには対応する越境アイテムがありません。');return;}
  const item=findImportantItemByPublicId(spec.publicId);
  if(!item){importantUseCopyState[scope]='';showResult('対応する越境アイテムをDBから確認できません。');const b=$(importantUseElementId(scope,'Panel'))?.querySelector(`[data-important-use-copy="${scope}"]`);if(b)b.disabled=true;return;}
  const reward=rollRewardItemTable(spec.tableId,1,row.areaName||'',row.eventName||'イベント');
  const consumeLine=`消費：《${item.name||'重要アイテム'}》×${spec.consume}`;
  const display=[`【越境アイテム使用】${row.eventName||'イベント'}`,consumeLine,reward.displayText||'変化結果を決定できませんでした。'].filter(Boolean).join('\n\n');
  const copy=[`【越境アイテム使用】${row.eventName||'イベント'}`,consumeLine,reward.copyText||''].filter(Boolean).join('\n\n');
  importantUseCopyState[scope]=copy;
  showResult(display);
  const b=$(importantUseElementId(scope,'Panel'))?.querySelector(`[data-important-use-copy="${scope}"]`);if(b)b.disabled=!copy;
  addLog(`越境アイテム使用：${row.eventName||'イベント'} / ${item.name||'重要アイテム'}${reward.items?.length?` → ${reward.items.map(x=>x.name).join('、')}`:''}`);
}
function renderImportantUsePanels(){['event','base','quest'].forEach(resetImportantUsePanel);}
function pickRandomEvent(rows, lastKey=''){
  const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
  if(!list.length) return null;
  const filtered = list.length > 1 ? list.filter(r=>eventUniqueKey(r)!==lastKey) : list;
  const pool = filtered.length ? filtered : list;
  return pool[Math.floor(Math.random()*pool.length)];
}
function rollQuestEvent(){
  const q=selected($('questSelect'),state.quests);
  clearTokenExportEncounter('quest');
  state.lastQuestCheckCopyText='';
  state.lastQuestBattleCheckCopyText='';
  state.lastQuestOutcomeKey='';
  resetQuestEventItemCopyState();clearRecipeMerchantOffers();
  if(!q){state.lastQuestEventText='クエストが選択されていません。'; renderQuestEvents(); updateTreasureCopyButtons(); return;}
  if(!questMatchesTime(q)){state.lastQuestEventText=`【クエストランダムイベント】${q.name||q.id}\nこのクエストは${questTimeRestrictionText(q)}のみ進行できます。現在は${selectedTimeSlot()}です。`;renderQuestEvents();updateTreasureCopyButtons();return;}
  const baseQuest=isBaseQuest(q);
  const tableId=baseQuest?'evt_base_random':tableIdForQuest(q);
  const questArea=areaForQuest(q);
  const rows=questRandomEvents(q);
  if(!rows.length){state.lastQuestEventText=`【クエストランダムイベント】${q.name||q.id}
${baseQuest?'拠点内ランダムイベント':'該当エリアのランダムイベント'}候補がありません。`; renderQuestEvents(); updateTreasureCopyButtons(); return;}
  const picked=baseQuest?pickRandomEvent(rows,state.lastQuestEventKey):pickAreaEvent(rows,state.lastQuestEventKey,questArea,{rumor:null});
  state.lastQuestEventKey=eventUniqueKey(picked);
  state.lastQuestOutcomeKey=eventUniqueKey(picked);
  state.lastQuestBattleCheckCopyText='';
  state.lastQuestCheckCopyText=eventCheckCopyText(picked);
  const sourceArea=baseQuest?(state.areas||[]).find(a=>String(a.id||a.name||'')===String(picked.conditionValue||'')):questArea;
  const baseText=baseQuest
    ? [
        `【クエストランダムイベント】${q.name||q.id}`,
        '発生場所：拠点',
        sourceArea?`候補追加元：${sourceArea.name||sourceArea.id}`:'',
        picked.eventName?`イベント：${picked.eventName}`:'',
        publicEventTypeName(picked)?`種別：${publicEventTypeName(picked)}`:'',
        eventCheckDisplayText(picked),
        picked.result?`結果：${eventResultTextForDisplay(picked,effectiveQuestPartySize(q))}`:'',
        picked.progressEffect?`補足：${picked.progressEffect}`:''
      ].filter(Boolean).join('\n')
    : formatEventOutput(`【クエストランダムイベント】${q.name||q.id}`,picked,questArea,tableId,['戦闘イベントは表示された出現構成を使用し、追加の魔物抽選は行いません。'],effectiveQuestPartySize(q),'quest');
  state.lastQuestCheckCopyText=eventCheckCopyText(picked);
  if(baseQuest){const baseGroups=encounterGroupsForDrop(picked,null,effectiveQuestPartySize(q));if(baseGroups.length)setTokenExportEncounter(picked.eventName||q.name||'クエスト戦闘',sourceArea?.name||picked.areaName||'',baseGroups,'quest');}
  const treasureBundle=resolveEventTreasures(picked,sourceArea?.name||picked.areaName||'',false);
  state.lastQuestEventRewardState=buildEventRewardState(picked);
  const rewardSpec=eventRewardTableSpec(picked,sourceArea?.name||picked.areaName||'');
  const maxSlots=Math.max(rewardSpec.drawCount,eventRewardMaxTableSlots(picked));
  const tableReward=rollRewardItemTable(rewardSpec.tableId,maxSlots,sourceArea?.name||picked.areaName||'',picked.eventName||'イベント');
  setEventTableRewardState('quest',tableReward);syncEventTableRewardCopyState('quest');
  if(isRecipeMerchantEvent(picked))drawRecipeMerchantOffers(sourceArea||questArea||{},'quest',picked.eventName||'レシピ商人との遭遇');
  state.lastQuestEventText=[baseText,treasureBundle.displayText,tableReward.displayText,isRecipeMerchantEvent(picked)?recipeMerchantOfferDisplayText():''].filter(Boolean).join('\n\n');
  setEventTreasureResults('quest',treasureBundle.results);
  updateQuestEventItemCopyButton();
  updateEventCheckCopyButtons();
  updateTreasureCopyButtons();
  renderQuestEvents();
  addLog(`クエストランダムイベント：${q.name||q.id} / ${picked.eventName||'名称未設定'}${baseQuest?'（拠点内イベント）':''}${treasureBundle.results.length?` / 宝箱${treasureBundle.results.length}件を同時決定`:''}${tableReward.items?.length?` / 入手アイテム${tableReward.items.length}種`:''}`);
}

function triggerQuestSpecificEvents(q,before,after){
  if(!q)return [];
  const area=areaForQuest(q);
  const rows=questSpecificEvents(q).filter(e=>{
    const th=eventThreshold(e);
    const from=Number.isFinite(Number(before))?Number(before):-1;
    return Number.isFinite(th) && th>from && th<=clamp(after);
  });
  const fired=[];
  rows.forEach(e=>{
    clearTokenExportEncounter('quest');
    const key=`${String(q.id||q.name||'')}:${eventUniqueKey(e)}:${eventThreshold(e)??''}`;
    if(state.triggeredQuestEvents[key]) return;
    // 固有イベント発生時は、直前のランダムイベント履歴とその戦闘ドロップ状態を破棄する。
    // 固定イベント側の結果だけを新しいコンテキストとして扱う。
    clearQuestRandomEventHistory();
    state.triggeredQuestEvents[key]=true;
    state.lastQuestFixedEventKey=key;
    state.lastQuestOutcomeKey=eventUniqueKey(e);
    state.lastQuestBattleCheckCopyText='';
    const effectiveSize=effectiveQuestPartySize(q);
    const resolvedEncounter=resolveQuestFixedEncounter(q,e,false);
    state.lastQuestBattleCheckCopyText=questBattleInternalCheckCopyText(q,e);
    state.lastQuestCheckCopyText=questFixedEventCheckCopyText(q,e,resolvedEncounter);
    const fixedDropGroups=eventEncounterGroupsForFixedCheck(e,effectiveSize,resolvedEncounter);
    if(isWorkQuest(q)&&Number(eventThreshold(e))===100){const workKey=String(q.id||q.name||'work');state.questWorkReinforcementCounts=state.questWorkReinforcementCounts||{};state.questWorkReinforcementCounts[workKey]=0;state.lastQuestReinforcementText='';}
    const extraLines=['このイベントはクエスト進行度による確定発生です。ランダム抽選ではありません。'];
    const supportNote=questPartyAdjustmentNote(q);if(supportNote)extraLines.push(supportNote);
    if(resolvedEncounter){const resolvedGroups=encounterGroupsForDrop({},resolvedEncounter,effectiveSize);extraLines.push(encounterResolutionBlock(resolvedEncounter));extraLines.push(encounterInitiativeText(resolvedGroups,area?.name||e.areaName||q.areaName||q.questLocation||''));extraLines.push(...questBattleRoundLines(q));}
    state.lastQuestFixedEventText=formatEventOutput(
      `【クエスト固有イベント】${e.eventName||'名称未設定'}`,
      e,
      area,
      String(e.tableId||tableIdForQuest(q)||''),
      extraLines,
      effectiveSize,
      'quest',
      {fixedIv:isImportantQuest(q),bountyEligible:false,resolvedGroups:fixedDropGroups,forceRecordEncounter:true}
    );
    if(fixedDropGroups.length)setTokenExportEncounter(e.eventName||q.name||'クエスト戦闘',area?.name||q.areaName||'',fixedDropGroups,'quest');
    if(e.treasureTableId){
      const treasureBundle=resolveEventTreasures(e,area?.name||e.areaName||'',true);
      state.lastQuestFixedEventText=[state.lastQuestFixedEventText,treasureBundle.displayText].filter(Boolean).join('\n\n');
      setEventTreasureResults('quest',treasureBundle.results);
      updateTreasureCopyButtons();
    }
    state.lastQuestEventRewardState=buildEventRewardState(e);
    syncEventTreasureCopyState('quest');
    const fixedRewardSpec=eventRewardTableSpec(e,area?.name||e.areaName||'');
    if(fixedRewardSpec.tableId){const fixedTableReward=rollRewardItemTable(fixedRewardSpec.tableId,Math.max(fixedRewardSpec.drawCount,eventRewardMaxTableSlots(e)),area?.name||e.areaName||'',e.eventName||'イベント');setEventTableRewardState('quest',fixedTableReward);syncEventTableRewardCopyState('quest');state.lastQuestFixedEventText=[state.lastQuestFixedEventText,fixedTableReward.displayText].filter(Boolean).join('\n\n');}
    updateQuestEventItemCopyButton();
    updateEventCheckCopyButtons();
    renderEventRewardPanel('quest');
    addLog(`クエスト固有イベント：${q.name||q.id} / ${e.eventName||'名称未設定'}`);
    fired.push(e);
  });
  return fired;
}
function questUsesRandomEncounter(q={}){const marker=String(q.questBossComposition||'').trim();return marker.startsWith('ランダム編成')||marker.startsWith('指定対象＋ランダム随伴');}
function rerollSelectedQuestEncounter(){const q=selected($('questSelect'),state.quests);if(!q||!questUsesRandomEncounter(q))return;resolveQuestPreviewEncounter(q,true);renderQuest();saveState(false);addLog(`クエスト固定戦闘編成を再抽選：${q.name||q.id}`);}
function renderQuest(){
  const q=selected($('questSelect'),state.quests);
  renderTimeControls();
  if(!q){
    $('questDetail').textContent='クエストデータがありません。';
    $('questBar').style.width='0%';
    $('questLabel').textContent='0%';
    $('questAdvanceBtn').textContent='進行度を進める';
    $('rollQuestEventBtn').disabled=false;
    renderQuestStepInfo(null,null);
    renderQuestEvents();
    return;
  }
  const p=progressObj('quests',q.id||q.name);
  if(clamp(p.value)===0) triggerQuestSpecificEvents(q,-1,0);
  const delivery=isDeliveryQuest(q);
  $('questNote').value=p.note||'';
  $('questBar').style.width=clamp(p.value)+'%';
  $('questLabel').textContent=delivery?(clamp(p.value)>=100?'完了':'未完了'):clamp(p.value)+'%';
  $('questAdvanceBtn').textContent=delivery?'納品完了にする':'進行度を進める';
  $('rollQuestEventBtn').disabled=delivery;
  const randomFormation=questUsesRandomEncounter(q);
  const important=isImportantQuest(q);
  const kindRow=important?'':`<b>依頼区分</b><span>${esc(q.requestKind||'未設定')}</span>`;
  const skillRow=!delivery&&q.recommendedSkills?`<b>推奨技能</b><span>${esc(q.recommendedSkills)}</span>`:'';
  $('questDetail').innerHTML=`<div class="kv"><b>分類</b><span>${esc(questCategoryFor(q))}${!questEnabled(q)?'<span class="quest-pill off">OFF</span>':'<span class="quest-pill">ON</span>'}</span>${kindRow}<b>内容種別</b><span>${esc(q.questType||'')}</span>${skillRow}<b>報酬範囲</b><span>${esc(q.rewardScope||'各PC')}</span>${q.deliveryItems?`<b>納品物</b><span>${esc(q.deliveryItems)}</span>`:''}<b>ランク</b><span>${esc(progressPlayerRank(q.rank)||'')}</span><b>実施場所</b><span>${esc(questLocationText(q))}</span><b>時間帯</b><span>${esc(questTimeRestrictionText(q))}</span>${(!isBaseQuest(q)&&!isDeliveryQuest(q)&&areaUsesWorldCycle(areaForQuest(q)))?`<b>現在の時間帯</b><span>${esc(selectedTimeSlot())}</span>`:''}<b>進行上昇値</b><span>${delivery?'納品確認':`+${questStepAmount(q)}%`}</span><b>固定イベント数</b><span>${questSpecificEvents(q).length}件</span><b>クエストボス</b><span>${esc(questBossText(q))}</span><b>構成</b><span>${esc(questBossFormationText(q))}${randomFormation?' <button id="rerollQuestEncounterBtn" type="button" class="secondary" style="margin-left:8px;padding:5px 9px">編成を再抽選</button>':''}</span>${questSpecialConditionLabel(q)?`<b>特殊条件</b><span>${esc(questSpecialConditionLabel(q))}</span><b>達成条件</b><span>${esc(q.battleRoundSuccess||q.clearCondition||'')}</span><b>失敗条件</b><span>${esc(q.battleRoundFailure||'なし')}</span>`:`<b>クリア条件</b><span>${esc(q.clearCondition||'')}</span>`}<b>報酬</b><span>${esc([q.rewardMoney,questRewardItemDisplay(q),Number(q.bonusPoints||0)>0?`ボーナスポイント${Number(q.bonusPoints)}点`:'' ].filter(Boolean).join(' / '))}（${esc(q.rewardScope||'各PC')}）</span></div>${randomFormation?'<p class="muted small">表示中の構成は固定イベント用の確定プレビューです。固定イベント発生時にはこの構成をそのまま使用し、「編成を再抽選」で更新できます。</p>':''}${q.description?`<p class="muted">${esc(q.description)}</p>`:''}`;
  $('rerollQuestEncounterBtn')?.addEventListener('click',rerollSelectedQuestEncounter);
  renderQuestStepInfo(q,p);
  renderQuestEvents();
}
