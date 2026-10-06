function partyEncounterProfile(size=selectedPartySize()){
  const n=normalizePartySize(size);
  const minimums={1:2,2:2,3:3,4:3,5:4,6:4,7:5};
  return {baseBudget:n+1,minCount:minimums[n]||3};
}
function randomInt(min,max){const lo=Math.ceil(Number(min)||0),hi=Math.floor(Number(max)||lo);return lo+Math.floor(Math.random()*Math.max(1,hi-lo+1));}
function randomRow(rows=[]){return rows.length?rows[Math.floor(Math.random()*rows.length)]:null;}
function monsterEncounterValue(name=''){
  const target=String(name||'').trim();
  const row=(state.monsters||[]).find(m=>String(m.name||'').trim()===target);
  const value=Math.floor(Number(row?.encounterValue));
  if(Number.isFinite(value)&&value>=1)return value;
  return ENCOUNTER_DEFAULT_VALUES[target]||1;
}
function encounterPoolForArea(areaName='', excludeNames=[]){
  const name=String(areaName||'').trim();
  const area=(state.areas||[]).find(a=>String(a.name||'').trim()===name || String(a.id||'').trim()===name);
  // 通常遭遇候補はエリアデータの「主な魔物」を正とする。
  // 固定配列は旧データや読み込み途中のフォールバックにだけ使用し、エリア追加時の登録漏れを防ぐ。
  const configured=area?monsterNameTokens(area.mainMonsters):[];
  const names=configured.length?configured:(AREA_ENCOUNTER_POOLS[name]||[]);
  const available=new Set((state.monsters||[]).filter(m=>!String(m.monsterTraits||'').split(/[,、，]/).map(v=>v.trim()).includes('ボス')).map(m=>String(m.name||'').trim()));
  const excluded=new Set((excludeNames||[]).map(v=>String(v||'').trim()).filter(Boolean));
  return [...new Set(names)].filter(n=>available.has(n)&&!excluded.has(n));
}
function nativeEncounterPoolForArea(areaName='',excludeNames=[]){
  const name=String(areaName||'').trim();
  const area=(state.areas||[]).find(a=>String(a.name||'').trim()===name||String(a.id||'').trim()===name);
  if(!area)return [];
  const currentOrder=Number(area.unlockOrder);
  const earlier=new Set();
  (state.areas||[]).forEach(other=>{
    if(other===area)return;
    const order=Number(other.unlockOrder);
    if(Number.isFinite(currentOrder)&&Number.isFinite(order)&&order<currentOrder){
      monsterNameTokens(other.mainMonsters).forEach(monsterName=>earlier.add(monsterName));
    }
  });
  const available=new Set((state.monsters||[]).filter(m=>!String(m.monsterTraits||'').split(/[,、，]/).map(v=>v.trim()).includes('ボス')).map(m=>String(m.name||'').trim()));
  const excluded=new Set((excludeNames||[]).map(v=>String(v||'').trim()).filter(Boolean));
  return [...new Set(monsterNameTokens(area.mainMonsters))]
    .filter(monsterName=>available.has(monsterName)&&!earlier.has(monsterName)&&!excluded.has(monsterName));
}
function normalizeEncounterFrontline(groups=[]){
  const rows=(groups||[]).map(group=>{
    const name=String(group?.name||'').trim();
    const count=Math.max(0,Math.floor(Number(group?.count)||0));
    const rawPosition=String(group?.formation??group?.position??'').trim();
    const position=rawPosition.startsWith('後衛')?'後衛':'前衛';
    return Object.assign({},group,{name,count,formation:position,position});
  }).filter(group=>group.name&&group.count>0);
  const total=rows.reduce((sum,group)=>sum+group.count,0);
  if(total===1){
    rows.forEach(group=>{group.formation='前衛';group.position='前衛';});
  }else if(total>=2&&!rows.some(group=>group.formation==='前衛')){
    const frontIndex=rows.reduce((best,row,index)=>{
      if(best<0)return index;
      const rate=ENCOUNTER_BACKLINE_RATE[row.name]??.25;
      const bestRate=ENCOUNTER_BACKLINE_RATE[rows[best].name]??.25;
      return rate<bestRate?index:best;
    },-1);
    const target=rows[frontIndex];
    if(target.count>1){
      target.count-=1;
      rows.push(Object.assign({},target,{count:1,formation:'前衛',position:'前衛'}));
    }else{
      target.formation='前衛';
      target.position='前衛';
    }
  }
  const merged=new Map();
  rows.forEach(group=>{
    const key=`${group.formation}\t${group.name}`;
    if(!merged.has(key))merged.set(key,Object.assign({},group));
    else merged.get(key).count+=group.count;
  });
  return [...merged.values()];
}
function groupEncounterPicks(picks=[]){
  const map=new Map();
  picks.forEach(name=>map.set(name,(map.get(name)||0)+1));
  const groups=[...map.entries()].map(([name,count])=>({
    name,count,
    formation:Math.random()<(ENCOUNTER_BACKLINE_RATE[name]??.25)?'後衛':'前衛',
    cost:monsterEncounterValue(name)
  }));
  return normalizeEncounterFrontline(groups);
}
function enumerateEncounterAdditions(pool=[],maxSlots=0,maxCost=0){
  const rows=[...new Set(pool)].map(name=>({name,cost:monsterEncounterValue(name)})).filter(r=>r.cost>=1).sort((a,b)=>a.cost-b.cost||a.name.localeCompare(b.name,'ja'));
  const out=[];
  function walk(start,picks,cost){
    out.push({picks:[...picks],cost});
    if(picks.length>=maxSlots)return;
    for(let i=start;i<rows.length;i++){
      const row=rows[i];
      if(cost+row.cost>maxCost)continue;
      picks.push(row.name);
      walk(i,picks,cost+row.cost);
      picks.pop();
    }
  }
  walk(0,[],0);
  return out;
}
function encounterPatternMatches(picks=[],pattern='混成遭遇'){
  const groups=[...new Set(picks)];
  const values=picks.map(monsterEncounterValue);
  if(pattern==='単一種の群れ')return groups.length===1;
  if(pattern==='強敵＋取り巻き')return groups.length>=2&&Math.max(...values)>=2&&Math.max(...values)>Math.min(...values);
  return groups.length>=2;
}
function weightedEncounterRow(rows=[],weightFn=()=>1){
  if(!rows.length)return null;
  const weighted=rows.map(row=>({row,weight:Math.max(0.0001,Number(weightFn(row))||0.0001)}));
  let roll=Math.random()*weighted.reduce((sum,entry)=>sum+entry.weight,0);
  for(const entry of weighted){roll-=entry.weight;if(roll<=0)return entry.row;}
  return weighted.at(-1)?.row||null;
}
function chooseEncounterCandidate(candidates=[],pattern='混成遭遇',budget=0,featuredName='',areaName=''){
  if(!candidates.length)return null;
  const matched=candidates.filter(c=>encounterPatternMatches(c.picks,pattern));
  let source=matched.length?matched:candidates;
  // 候補魔物を1種だけ先に均等抽選し、その魔物を含む編成を優先する。低遭遇値魔物だけへ偏るのを防ぐ。
  const featured=String(featuredName||'').trim();
  if(featured){
    const inPattern=source.filter(c=>(c.picks||[]).includes(featured));
    if(inPattern.length)source=inPattern;
    else{const any=candidates.filter(c=>(c.picks||[]).includes(featured));if(any.length)source=any;}
  }
  // 単一種は遭遇値1の魔物だけが予算を使い切る候補へ偏らないよう、魔物種を先に均等抽選する。
  if(pattern==='単一種の群れ'){
    const byMonster=new Map();
    source.forEach(candidate=>{
      const name=String(candidate.picks?.[0]||'').trim();
      if(!name)return;
      const current=byMonster.get(name);
      const currentGap=current?Math.abs(Number(budget||0)-Number(current.spent||0)):Infinity;
      const nextGap=Math.abs(Number(budget||0)-Number(candidate.spent||0));
      if(!current||nextGap<currentGap||(nextGap===currentGap&&candidate.picks.length>current.picks.length))byMonster.set(name,candidate);
    });
    const rows=[...byMonster.values()];
    if(rows.length)return weightedPick(rows,row=>encounterMonsterWeight(areaName,String(row.picks?.[0]||'')));
  }
  return weightedEncounterRow(source,candidate=>{
    const gap=Math.max(0,Number(budget||0)-Number(candidate.spent||0));
    const diversity=new Set(candidate.picks||[]).size;
    let weight=(1/(1+gap*.75))*(1+.75*Math.max(0,diversity-1));
    if(candidate.picks?.length){
      const factors=candidate.picks.map(name=>encounterMonsterWeight(areaName,name));
      if(factors.some(v=>v<=0))return 0.0001;
      const weatherFactor=Math.pow(factors.reduce((product,v)=>product*Math.max(.01,v),1),1/factors.length);
      weight*=weatherFactor;
    }
    if(pattern==='強敵＋取り巻き')weight*=1.5;
    return weight;
  });
}
function generateRandomEncounter(areaName='', options={}){
  const size=normalizePartySize(options.partySize||selectedPartySize());
  const profile=partyEncounterProfile(size);
  const reserved=Array.isArray(options.reservedGroups)?options.reservedGroups:[];
  const reservedPicks=[];
  reserved.forEach(g=>{for(let i=0;i<Math.max(0,Number(g.count)||0);i++)reservedPicks.push(String(g.name||'').trim());});
  const excluded=[...(options.excludeNames||[])];
  const nativeAll=nativeEncounterPoolForArea(areaName,[]);
  const nativeSet=new Set(nativeAll);
  const reservedHasNative=reservedPicks.some(name=>nativeSet.has(name));
  if(!reservedHasNative){
    const nativeAvailable=nativeEncounterPoolForArea(areaName,excluded);
    if(nativeAvailable.length){
      const requiredNative=weightedPick(nativeAvailable,name=>encounterMonsterWeight(areaName,name))||nativeAvailable[0];
      reservedPicks.push(requiredNative);
    }
  }
  const pool=encounterPoolForArea(areaName,excluded);
  const reservedCost=reservedPicks.reduce((sum,n)=>sum+monsterEncounterValue(n),0);
  const areaBonus=Number(AREA_ENCOUNTER_BUDGET_BONUS[String(areaName||'').trim()]||0);
  const requestedBudget=Number(options.budgetOverride);
  const baseBudget=Number.isFinite(requestedBudget)&&requestedBudget>0?Math.floor(requestedBudget):profile.baseBudget+areaBonus;
  const exactCountRaw=Math.floor(Number(options.exactCount));
  const exactCount=Number.isFinite(exactCountRaw)&&exactCountRaw>=reservedPicks.length?exactCountRaw:null;
  const minCount=exactCount!==null?exactCount:Math.max(reservedPicks.length,Number(options.minCount)||profile.minCount);
  const minPoolCost=pool.length?Math.min(...pool.map(monsterEncounterValue)):0;
  const requiredSlots=Math.max(0,minCount-reservedPicks.length);
  // 個体数の上限は設けない。必要最低数を満たせるだけの予算を確保し、
  // 実際に入り得る最大数は「予算 ÷ 最低遭遇値」から自然に決まる。
  const budget=Math.max(reservedCost,baseBudget,reservedCost+(requiredSlots*minPoolCost));
  const requestedMinSpent=Number(options.minSpent);
  const defaultMinSpent=Math.max(reservedCost,Math.max(1,budget-1));
  const minSpent=Math.min(budget,Math.max(reservedCost,Number.isFinite(requestedMinSpent)&&requestedMinSpent>0?Math.floor(requestedMinSpent):defaultMinSpent));
  if(!pool.length&&!reservedPicks.length)return null;
  const naturalAdditionalCap=minPoolCost>0?Math.max(0,Math.floor((budget-reservedCost)/minPoolCost)):0;
  const additionSlots=exactCount!==null?Math.max(0,exactCount-reservedPicks.length):naturalAdditionalCap;
  const additions=enumerateEncounterAdditions(pool,additionSlots,Math.max(0,budget-reservedCost));
  const candidates=additions.map(a=>({picks:[...reservedPicks,...a.picks],spent:reservedCost+a.cost}))
    .filter(c=>{
      if(!encounterPicksStrongCompositionValid(c.picks,size))return false;
      const strongCount=c.picks.filter(monsterIsStrongEnemy).length;
      const strongOnly=strongCount>=2&&strongCount===c.picks.length;
      const countOk=strongOnly?true:(exactCount!==null?c.picks.length===exactCount:c.picks.length>=minCount);
      const spentOk=strongOnly?c.spent<=budget:(c.spent>=minSpent&&c.spent<=budget);
      return countOk&&spentOk;
    });
  const roll=Math.random();
  let pattern=options.pattern||(roll<.28?'単一種の群れ':roll<.76?'混成遭遇':'強敵＋取り巻き');
  const featuredName=pool.length?(weightedPick(pool,name=>encounterMonsterWeight(areaName,name))||pool[0]):(reservedPicks[0]||'');
  let chosen=chooseEncounterCandidate(candidates,pattern,budget,featuredName,areaName);
  if(!chosen){
    const fallback=[...reservedPicks];
    let fallbackSpent=fallback.reduce((sum,n)=>sum+monsterEncounterValue(n),0);
    const wantedCount=exactCount!==null?exactCount:minCount;
    const naturalTotalCap=reservedPicks.length+naturalAdditionalCap;
    while((fallback.length<wantedCount||fallbackSpent<minSpent)&&pool.length&&fallback.length<naturalTotalCap){
      const feasible=pool.filter(name=>fallbackSpent+monsterEncounterValue(name)<=budget&&encounterPicksStrongCompositionValid([...fallback,name],size));
      if(!feasible.length)break;
      const picked=weightedPick(feasible,name=>encounterMonsterWeight(areaName,name))||feasible[0];fallback.push(picked);fallbackSpent+=monsterEncounterValue(picked);
    }
    if(exactCount!==null){
      while(fallback.length<exactCount&&pool.length&&fallback.length<naturalTotalCap){
        const feasible=pool.filter(name=>fallbackSpent+monsterEncounterValue(name)<=budget&&encounterPicksStrongCompositionValid([...fallback,name],size));
        if(!feasible.length)break;
        const picked=weightedPick(feasible,name=>encounterMonsterWeight(areaName,name))||feasible[0];fallback.push(picked);fallbackSpent+=monsterEncounterValue(picked);
      }
    }
    if(!fallback.length&&pool.length){const picked=weightedPick(pool,name=>encounterMonsterWeight(areaName,name))||pool[0];fallback.push(picked);fallbackSpent=monsterEncounterValue(picked);}
    chosen={picks:fallback,spent:fallbackSpent};
  }
  if(encounterPatternMatches(chosen.picks,'単一種の群れ'))pattern='単一種の群れ';
  else if(encounterPatternMatches(chosen.picks,'強敵＋取り巻き'))pattern='強敵＋取り巻き';
  else pattern='混成遭遇';
  let groups=groupEncounterPicks(chosen.picks);
  // 必須枠に配置指定がある場合は、その配置を優先する。必須枠と同名の追加抽選は除外されるため安全に上書きできる。
  reserved.forEach(reservedGroup=>{
    const name=String(reservedGroup?.name||'').trim();
    const formation=String(reservedGroup?.formation||reservedGroup?.position||'').trim();
    if(!name||!formation)return;
    const target=groups.find(group=>String(group.name||'').trim()===name);
    if(target){target.formation=formation.startsWith('後衛')?'後衛':'前衛';target.position=target.formation;}
  });
  groups=normalizeEncounterFrontline(groups);
  const weather=currentAreaWeather((state.areas||[]).find(a=>String(a.name||'').trim()===String(areaName||'').trim()||String(a.id||'').trim()===String(areaName||'').trim())||{}); return {areaName,partySize:size,baseBudget,budget,spent:groups.reduce((s,g)=>s+g.cost*g.count,0),pattern,groups,total:chosen.picks.length,minCount,minSpent,featuredName,weatherName:weather?.name||''};
}
function encounterResolutionText(resolution){
  if(!resolution||!resolution.groups?.length)return '';
  return resolution.groups.map(g=>`${g.formation}：${g.name} ×${g.count}`).join(' / ');
}
function encounterResolutionBlock(resolution){
  if(!resolution||!resolution.groups?.length)return '';
  return ['出現構成：',...resolution.groups.map(g=>`${g.formation}：${g.name} ×${g.count}`)].join('\n');
}
function questEncounterGenerationOptions(q={},size=effectiveQuestPartySize(q)){
  if(questCategoryFor(q)!=='デイリー')return {partySize:size};
  const areaName=String(q.areaName||'').trim();
  const areaBonus=Number(AREA_ENCOUNTER_BUDGET_BONUS[areaName]||0);
  const minBySize={1:1,2:2,3:2,4:3,5:3,6:4,7:4};
  // 制限戦闘は通常のエリア依頼より編成予算を1だけ重くする。
  // 攻撃失敗そのものを難易度の主因にせず、時間内に敵全体を処理する行動配分を要求する。
  const limitedBattle=String(q.questType||'').trim()==='制限戦闘';
  const limitBudgetBonus=limitedBattle?1:0;
  return {
    partySize:size,
    budgetOverride:Math.max(1,size+Math.max(0,areaBonus-1)+limitBudgetBonus),
    minCount:minBySize[size]||2
  };
}
function resolveQuestEncounter(q={},force=false,cacheSuffix='boss'){
  const marker=String(q.questBossComposition||'').trim();
  if(!marker.startsWith('ランダム編成')&&!marker.startsWith('指定対象＋ランダム随伴'))return null;
  const size=effectiveQuestPartySize(q);
  const key=`${ENCOUNTER_RULE_VERSION}::${q.id||q.name||'quest'}::${cacheSuffix}::${size}`;
  state.questEncounterCache=state.questEncounterCache||{};
  if(!force&&state.questEncounterCache[key])return state.questEncounterCache[key];
  const parts=marker.split(/,|，/).map(v=>v.trim());
  const options=questEncounterGenerationOptions(q,size);
  let resolved=null;
  if(parts[0]==='ランダム編成'){
    resolved=generateRandomEncounter(parts[1]||q.areaName||'',options);
  }else{
    const target=parts[1]||String(q.bossMonster||'').split('/')[0].trim();
    const count=Math.max(1,Number(parts[2])||1);
    resolved=generateRandomEncounter(parts[3]||q.areaName||'',Object.assign({},options,{reservedGroups:[{name:target,count}],excludeNames:[target],pattern:'混成遭遇'}));
  }
  if(resolved){state.questEncounterCache[key]=resolved;saveState(false);}
  return resolved;
}
function transportStrongEnemyFromFixedEvent(e={}){
  const result=String(e.result||'');
  const match=result.match(/(?:前衛|後衛)に([^×\n。、]+)×1を必ず含める/);
  return match?String(match[1]||'').trim():'';
}
function resolveTransportStrongEncounter(q={},e={},force=false,suffix='transport-strong'){
  if(String(q.questType||'').trim()!=='運搬保護')return null;
  if(Number(eventThreshold(e))!==100)return null;
  const target=transportStrongEnemyFromFixedEvent(e);
  if(!target)return null;
  const size=effectiveQuestPartySize(q);
  const key=`${ENCOUNTER_RULE_VERSION}::${q.id||q.name||'quest'}::${suffix}::${size}::${target}`;
  state.questEncounterCache=state.questEncounterCache||{};
  if(!force&&state.questEncounterCache[key])return state.questEncounterCache[key];
  const targetCost=monsterEncounterValue(target);
  let resolved=null;
  if(size===1){
    const groups=normalizeEncounterFrontline([{name:target,count:1,formation:'前衛',position:'前衛',cost:targetCost}]);
    resolved={
      areaName:String(q.areaName||''),partySize:size,baseBudget:targetCost,budget:targetCost,spent:targetCost,
      pattern:'強敵単体',groups,total:1,minCount:1,minSpent:targetCost,featuredName:target
    };
  }else{
    const areaName=String(q.areaName||'');
    const options=questEncounterGenerationOptions(q,size);
    resolved=generateRandomEncounter(areaName,Object.assign({},options,{
      reservedGroups:[{name:target,count:1}],
      excludeNames:[target],
      minCount:Math.max(2,Number(options.minCount)||2),
      pattern:'強敵＋取り巻き'
    }));
    if(resolved){
      const strong=resolved.groups.find(group=>String(group.name||'').trim()===target);
      if(strong){strong.formation='前衛';strong.position='前衛';}
      resolved.groups=normalizeEncounterFrontline(resolved.groups);
      resolved.pattern='強敵＋取り巻き';
      resolved.featuredName=target;
      resolved.spent=resolved.groups.reduce((sum,group)=>sum+monsterEncounterValue(group.name)*group.count,0);
      resolved.total=resolved.groups.reduce((sum,group)=>sum+group.count,0);
    }
  }
  if(resolved){state.questEncounterCache[key]=resolved;saveState(false);}
  return resolved;
}
function resolveQuestFixedEncounter(q={},e={},force=false){
  const result=String(e.result||'');
  if(!eventBattleCopyMode(e)&&!questBattleInternalCheckInfo(q,e))return null;
  const suffix=`fixed-${eventThreshold(e)??''}-${e.eventName||''}`;
  const transportStrong=resolveTransportStrongEncounter(q,e,force,suffix);
  if(transportStrong)return transportStrong;
  if(/人数対応|ランダム編成/.test(result)){
    const random=resolveQuestEncounter(q,force,suffix);
    if(random)return random;
  }
  if(Number(eventThreshold(e))!==100)return null;
  const size=effectiveQuestPartySize(q);
  const groups=encounterCompositionGroups({encounterComposition:q.questBossComposition},size).map(group=>({
    name:group.name,count:group.count,formation:group.position,cost:monsterEncounterValue(group.name)
  }));
  if(!groups.length)return null;
  return {
    areaName:String(q.areaName||''),partySize:size,baseBudget:0,budget:0,
    spent:groups.reduce((sum,group)=>sum+group.cost*group.count,0),
    pattern:'固定編成',groups,total:groups.reduce((sum,group)=>sum+group.count,0),
    minCount:groups.reduce((sum,group)=>sum+group.count,0),maxCount:groups.reduce((sum,group)=>sum+group.count,0)
  };
}
function clampEncounterCount(n, min=1, max=7){
  const lo=Math.max(1,Number(min)||1),hi=Math.min(8,Math.max(lo,Number(max)||8));
  return Math.max(lo,Math.min(hi,Math.floor(Number(n)||lo)));
}
function encounterCountForEvent(row={}, partySize=selectedPartySize()){
  const rule=String(row.encounterCountRule||'').trim();
  if(!rule||rule==='ランダム編成')return '';
  const min=row.encounterCountMin||1,max=row.encounterCountMax||(rule==='人数同数'?7:4);
  if(rule==='固定')return clampEncounterCount(row.encounterCountMin||row.encounterCountMax||1,min,max);
  if(rule==='人数同数')return clampEncounterCount(partySize,min,max);
  if(rule==='半数切上')return clampEncounterCount(Math.ceil(partySize/2),min,max);
  return '';
}
function resolveEncounterCountToken(token='',partySize=selectedPartySize()){
  const raw=String(token||'').trim();if(!raw)return '';
  if(/^\d+$/.test(raw))return raw;
  const specified=raw.match(/^人数別\[([^\]]+)\]$/);
  if(specified){
    const size=normalizePartySize(partySize);
    const entries=[];
    specified[1].split('/').forEach(part=>{
      const pair=part.split(':').map(v=>String(v||'').trim());
      if(pair.length!==2)return;
      const value=Math.max(0,Math.floor(Number(pair[1])||0));
      const range=pair[0].match(/^(\d+)(?:-(\d+))?$/);
      if(!range)return;
      entries.push({min:Number(range[1]),max:Number(range[2]||range[1]),value});
    });
    const exact=entries.find(e=>size>=e.min&&size<=e.max);
    if(exact)return String(exact.value);
    if(entries.length){
      entries.sort((a,b)=>a.min-b.min);
      const lower=[...entries].reverse().find(e=>size>=e.min);
      return String((lower||entries[0]).value);
    }
    return '0';
  }
  if(raw==='人数同数')return String(clampEncounterCount(partySize,1,7));
  if(raw==='人数半数切上')return String(clampEncounterCount(Math.ceil(partySize/2),1,4));
  if(raw==='人数半数切捨')return String(Math.max(0,Math.min(4,Math.floor(normalizePartySize(partySize)/2))));
  return raw;
}
function encounterCompositionGroups(row={},partySize=selectedPartySize()){
  const raw=String(row.encounterComposition||'').trim();
  if(!raw)return [];
  const groups=raw.split(/\n+|;|；/).map(line=>{
    const cols=line.split(/\t|,|，|、/).map(v=>String(v||'').trim()).filter(Boolean);
    if(cols.length<3)return null;
    const resolved=resolveEncounterCountToken(cols[2],partySize);
    const count=Number(resolved);
    if(!Number.isFinite(count)||count<1)return null;
    return {position:cols[0],name:cols[1],count:Math.floor(count)};
  }).filter(Boolean);
  return normalizeEncounterFrontline(groups);
}

function monsterIsStrongEnemy(name=''){
  const target=String(name||'').trim();
  const monster=(state.monsters||[]).find(row=>String(row.name||'').trim()===target);
  return String(monster?.monsterTraits||'').split(/[,、，]/).map(v=>v.trim()).includes('強敵');
}
function strongEnemyLimitForParty(partySize=selectedPartySize()){
  const size=normalizePartySize(partySize);
  if(size<=3)return 1;
  if(size<=5)return 2;
  return 3;
}
function encounterStrongCompositionValid(groups=[],partySize=selectedPartySize()){
  const normalized=normalizeEncounterFrontline(groups||[]);
  const total=normalized.reduce((sum,g)=>sum+Math.max(0,Math.floor(Number(g.count)||0)),0);
  const strong=normalized.reduce((sum,g)=>sum+(monsterIsStrongEnemy(g.name)?Math.max(0,Math.floor(Number(g.count)||0)):0),0);
  if(strong>strongEnemyLimitForParty(partySize))return false;
  // 強敵が2体以上いる編成は、通常魔物を混ぜず強敵だけで完結させる。
  if(strong>=2&&strong!==total)return false;
  return true;
}
function encounterPicksStrongCompositionValid(picks=[],partySize=selectedPartySize()){
  const groups=[...new Set((picks||[]).map(v=>String(v||'').trim()).filter(Boolean))].map(name=>({
    name,
    count:(picks||[]).filter(v=>String(v||'').trim()===name).length,
    formation:'前衛'
  }));
  return encounterStrongCompositionValid(groups,partySize);
}
function eventEncounterVariantRows(row={},partySize=selectedPartySize()){
  const raw=String(row.encounterVariantTable||'').trim();
  if(!raw)return [];
  const size=normalizePartySize(partySize);
  return raw.split(/\n+/).map((line,index)=>{
    const cols=String(line||'').split('\t');
    if(cols.length<3)return null;
    const range=String(cols.shift()||'').trim();
    const weight=Math.max(.01,Number(cols.shift())||1);
    const composition=cols.join('\t').trim();
    const match=range.match(/^(\d+)(?:-(\d+))?$/);
    if(!match||!composition)return null;
    const min=Number(match[1]),max=Number(match[2]||match[1]);
    if(size<min||size>max)return null;
    const groups=encounterCompositionGroups({encounterComposition:composition},size);
    if(!groups.length||!encounterStrongCompositionValid(groups,size))return null;
    return {index,min,max,weight,composition,groups};
  }).filter(Boolean);
}
function resolveEventEncounterVariant(row={},partySize=selectedPartySize()){
  const size=normalizePartySize(partySize);
  const rows=eventEncounterVariantRows(row,size);
  if(!rows.length)return null;
  const picked=weightedPick(rows,r=>r.weight)||rows[0];
  const groups=normalizeEncounterFrontline(picked.groups||[]);
  const total=groups.reduce((sum,g)=>sum+g.count,0);
  const spent=groups.reduce((sum,g)=>sum+monsterEncounterValue(g.name)*g.count,0);
  return {
    areaName:String(row.areaName||'').trim(),
    partySize:size,
    baseBudget:spent,
    budget:spent,
    spent,
    pattern:'イベント編成表',
    groups,
    total,
    minCount:total,
    minSpent:spent,
    featuredName:String(groups[0]?.name||'')
  };
}
function encounterCompositionText(row={},partySize=selectedPartySize()){
  const groups=encounterCompositionGroups(row,partySize);
  if(groups.length)return ['出現構成：',...groups.map(group=>`${group.position}：${publicEncounterMonsterName(group.name)} ×${group.count}`)].join('\n');
  const formation=String(row.encounterFormation||'').trim();return formation?`配置：${formation}`:'';
}
function encounterCompositionTotal(row={},partySize=selectedPartySize()){
  const groups=encounterCompositionGroups(row,partySize);
  return groups.length?groups.reduce((sum,group)=>sum+group.count,0):'';
}
function resolveEncounterTokensInText(text='',partySize=selectedPartySize()){
  return String(text||'')
    .replace(/人数別\[[^\]]+\]/g,token=>resolveEncounterCountToken(token,partySize))
    .replace(/人数半数切上/g,resolveEncounterCountToken('人数半数切上',partySize))
    .replace(/人数半数切捨/g,resolveEncounterCountToken('人数半数切捨',partySize))
    .replace(/人数同数/g,resolveEncounterCountToken('人数同数',partySize));
}
function encounterCountText(row={},resolution=null){
  if(resolution)return `出現数：${resolution.total}体（パーティー${resolution.partySize}人 / 遭遇値${resolution.spent} / ${resolution.pattern}）`;
  const compositionTotal=encounterCompositionTotal(row);
  if(compositionTotal!=='')return `出現数：${compositionTotal}体（パーティー${selectedPartySize()}人 / 出現構成から算出）`;
  const count=encounterCountForEvent(row);return count?`出現数：${count}体（パーティー${selectedPartySize()}人 / ${row.encounterCountRule||'指定なし'}）`:'';
}

function eventHasTreasure(row={}){const result=String(row.result||'');return !!String(row.treasureTableId||'').trim()||/宝箱表「[^」]+」|通常宝箱表|希少宝箱表/.test(result);}
function eventResultTextForDisplay(row={},partySize=selectedPartySize()){
  let text=resolveEncounterTokensInText(row.result||'',partySize);
  const inline=inlineEventCheckInfo(text);
  if(inline.display)text=inline.text;
  // 二つ名の正体は戦闘前のイベント表示では伏せ、通常種名＋「？」で示す。
  if(isNamedEncounterEvent(row)){
    (state.monsters||[]).filter(isNamedIndividualMonster).forEach(monster=>{
      const full=String(monster.name||'').trim();if(!full)return;
      text=String(text||'').split(full).join(publicEncounterMonsterName(full));
    });
  }
  // 代用技能は「使用技能」へ集約する。結果欄には成功時の差だけを残す。
  text=String(text||'').replace(/[^\s、。：「」()（）]+?で代用可能（判定\s*[+-]\d+）[。]?\s*/g,'');
  // 固定イベント等の自由記述に旧式「技能>=目標値」が残っていても、画面には式を出さない。
  text=String(text||'').replace(/([^\s、。：「」]+)\s*>=\s*(\d+(?:\.\d+)?)/g,'$1（達成値$2以上）');
  if(!eventHasTreasure(row))return text;
  return String(text||'')
    .replace(/宝箱表「[^」]+」を1回抽選して/g,'下記の宝箱を確認して')
    .replace(/宝箱表「[^」]+」を1回抽選し/g,'下記の宝箱を確認し')
    .replace(/宝箱表「[^」]+」を1回抽選する/g,'下記の宝箱を確認する')
    .replace(/通常宝箱表を1回引く/g,'下記の通常宝箱を確認する')
    .replace(/希少宝箱表を1回引く/g,'下記の希少宝箱を確認する')
    .replace(/宝箱表を1回引く/g,'下記の宝箱を確認する');
}
function requiredEncounterGroupsFromResult(row={},partySize=selectedPartySize()){
  const text=String(row.result||'');
  const groups=[];
  (state.monsters||[]).forEach(monster=>{
    const name=String(monster?.name||'').trim();if(!name)return;
    const safe=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp(`(?:(前衛|後衛)に)?${safe}×(人数半数切上|人数半数切捨|人数同数|\\d+)を必ず含`);
    const m=text.match(re);if(!m)return;
    const resolved=resolveEncounterCountToken(String(m[2]||''),partySize);
    const count=Math.max(1,Math.floor(Number(resolved)||1));
    groups.push({name,count,formation:String(m[1]||'').trim()});
  });
  return groups;
}
function randomEncounterOptionsForEvent(row={},partySize=selectedPartySize()){
  const size=normalizePartySize(partySize);
  const profile=partyEncounterProfile(size);
  const configuredMin=Math.floor(Number(row.encounterCountMin));
  const minCount=Number.isFinite(configuredMin)&&configuredMin>0?Math.max(1,configuredMin):profile.minCount;
  // ランダム編成で encounterComposition が指定されている場合、その魔物は必須枠として先に確保する。
  // DB側の必須枠が欠けていても、結果文の「○○×Nを必ず含む」から補完して表示内容と結果を一致させる。
  let reservedGroups=encounterCompositionGroups(row,size).map(group=>({
    name:group.name,count:group.count,formation:group.position||group.formation||''
  }));
  // 結果文に「必ず含む」がある場合はDB設定と突き合わせ、欠けている必須個体を必ず補完する。
  requiredEncounterGroupsFromResult(row,size).forEach(required=>{
    const current=reservedGroups.find(group=>String(group.name||'').trim()===String(required.name||'').trim());
    if(current){current.count=Math.max(Number(current.count)||1,Number(required.count)||1);if(!current.formation&&required.formation)current.formation=required.formation;}
    else reservedGroups.push(required);
  });
  const excludeNames=[...new Set(reservedGroups.map(group=>String(group.name||'').trim()).filter(Boolean))];
  // ランダム編成には個体数上限を設けない。encounterCountMax は固定・人数指定系イベントだけで使用する。
  return {partySize:size,minCount:Math.max(minCount,reservedGroups.reduce((sum,g)=>sum+Math.max(1,Number(g.count)||1),0)),reservedGroups,excludeNames};
}
const INDIVIDUAL_RANK_BOUNTY={hp:{D:-15,C:-7,B:0,A:7,S:15},evasion:{D:-15,C:-6,B:0,A:6,S:15},resist:{D:-10,C:-4,B:0,A:4,S:10}};
const INDIVIDUAL_ATTACK_BOUNTY={'精密III':9,'精密II':6,'精密I':3,'標準':0,'強打I':3,'強打II':6,'強打III':9};
function individualRollRank(width=3,allowed=null){
  const weights={D:10,C:20,B:40,A:20,S:10},pool=Array.isArray(allowed)&&allowed.length?allowed:INDIVIDUAL_RANK_ORDER;return individualWeightedPick(weights,pool);
}
function individualRankDelta(rank='B',width=3){
  const edge=Number(width)>=3?3:Number(width)>=2?2:1;
  return({D:-edge,C:-1,B:0,A:1,S:edge})[rank]||0;
}
function individualStatWidth(monster={},kind='evasion'){
  if(kind==='hp')return 3;
  const value=Number(kind==='resist'?monster.resistValue:monster.evasionValue)||0;
  return value>=8?3:2;
}
function individualAttackWidth(monster={}){return Number(monster.encounterValue)>=2?3:2;}
const INDIVIDUAL_RANK_ORDER=['D','C','B','A','S'];
const INDIVIDUAL_ATTACK_ORDER=['精密III','精密II','精密I','標準','強打I','強打II','強打III'];
function individualParseProfile(raw){if(!raw)return{};if(raw&&typeof raw==='object')return raw;try{const parsed=JSON.parse(String(raw||''));return parsed&&typeof parsed==='object'?parsed:{};}catch(_e){return{};}}
function individualRuleList(value){return Array.isArray(value)?value:String(value||'').split(/[,、，]/).map(v=>v.trim()).filter(Boolean);}
function individualRuleMatches(rule={},context={}){
  const areas=individualRuleList(rule.areaNames),times=individualRuleList(rule.timeSlots),weather=individualRuleList(rule.weather||rule.weatherNames);
  if(areas.length&&!areas.includes(String(context.areaName||'')))return false;
  if(times.length&&!times.includes(String(context.timeSlot||'')))return false;
  if(weather.length&&!weather.includes(String(context.weatherName||'')))return false;
  return true;
}
function individualProfileSelection(raw={},context={}){
  const config=individualParseProfile(raw),base=(config.default&&typeof config.default==='object')?{...config.default}:{},rules=Array.isArray(config.rules)?config.rules:[];
  const matched=rules.map((rule,index)=>({rule,index,priority:Number(rule?.priority)||0,specificity:(individualRuleList(rule?.areaNames).length?1:0)+(individualRuleList(rule?.timeSlots).length?1:0)+(individualRuleList(rule?.weather||rule?.weatherNames).length?1:0)})).filter(x=>individualRuleMatches(x.rule,context)).sort((a,b)=>b.priority-a.priority||b.specificity-a.specificity||a.index-b.index)[0];
  const selected=matched?{...base,...matched.rule}:base;
  return{profile:selected,label:String(selected.label||'').trim(),hint:String(selected.hint||'').trim()};
}
function individualEnvironmentContext(areaName='',options={}){
  const name=String(areaName||options?.conditionContext?.areaName||'').trim(),area=(state.areas||[]).find(row=>String(row.name||row.id||'').trim()===name)||null;
  if(options?.conditionContext)return{areaName:name,timeSlot:String(options.conditionContext.timeSlot||''),weatherName:String(options.conditionContext.weatherName||''),areaProfile:options.conditionContext.areaProfile||area?.monsterConditionProfile||''};
  if(!area||!areaUsesWorldCycle(area))return{areaName:name,timeSlot:'',weatherName:'',areaProfile:area?.monsterConditionProfile||''};
  const weather=currentAreaWeather(area);
  return{areaName:name,timeSlot:normalizeTimeSlot(options.timeSlot||selectedTimeSlot()),weatherName:String(options.weatherName||weather?.name||''),areaProfile:area?.monsterConditionProfile||''};
}
function individualResolveConditionProfile(monster={},context={}){
  const areaSel=individualProfileSelection(context.areaProfile||'',context),monsterSel=individualProfileSelection(monster.individualConditionProfile||'',context),merged={...areaSel.profile,...monsterSel.profile};
  const labels=[areaSel.label,monsterSel.label].filter(Boolean),hints=[areaSel.hint,monsterSel.hint].filter(Boolean);
  return{...merged,labels:[...new Set(labels)],hints:[...new Set(hints)]};
}
function individualRangePool(spec='',order=[],fallback=[]){
  if(Array.isArray(spec)){const out=spec.map(String).filter(v=>order.includes(v));return out.length?out:fallback.slice();}
  const raw=String(spec||'').trim();if(!raw)return fallback.slice();
  const direct=raw.split(/[,、，]/).map(v=>v.trim()).filter(v=>order.includes(v));if(direct.length>1)return direct;
  const normalized=raw.replace(/～/g,'-'),parts=normalized.split('-').map(v=>v.trim()).filter(Boolean);
  if(parts.length===2&&order.includes(parts[0])&&order.includes(parts[1])){const a=order.indexOf(parts[0]),b=order.indexOf(parts[1]),lo=Math.min(a,b),hi=Math.max(a,b);return order.slice(lo,hi+1);}
  if(order.includes(raw))return[raw];return fallback.slice();
}
function individualWeightedPick(weights={},allowed=[]){
  const rows=allowed.map(key=>({key,weight:Math.max(0,Number(weights[key])||0)})).filter(x=>x.weight>0);if(!rows.length)return allowed[0]||'';
  const total=rows.reduce((sum,row)=>sum+row.weight,0);let roll=Math.random()*total;for(const row of rows){roll-=row.weight;if(roll<0)return row.key;}return rows[rows.length-1].key;
}
function individualRankAllowed(profile={},kind='hp',width=3){return individualRangePool(profile[kind]||'',INDIVIDUAL_RANK_ORDER,INDIVIDUAL_RANK_ORDER);}
function individualAttackAllowed(profile={},width=3){const base=Number(width)>=3?INDIVIDUAL_ATTACK_ORDER:INDIVIDUAL_ATTACK_ORDER.slice(1,-1),configured=individualRangePool(profile.attack||'',INDIVIDUAL_ATTACK_ORDER,base);const filtered=configured.filter(v=>base.includes(v));return filtered.length?filtered:base;}
function individualRollAttackTendency(width=3,allowed=null){
  const weights=Number(width)>=3?{'精密III':8,'精密II':12,'精密I':15,'標準':30,'強打I':15,'強打II':12,'強打III':8}:{'精密II':10,'精密I':20,'標準':40,'強打I':20,'強打II':10};
  const base=Number(width)>=3?INDIVIDUAL_ATTACK_ORDER:INDIVIDUAL_ATTACK_ORDER.slice(1,-1),pool=Array.isArray(allowed)&&allowed.length?allowed.filter(v=>base.includes(v)):base;return individualWeightedPick(weights,pool.length?pool:base);
}
function individualPrecisionPower(power='',steps=1){
  const raw=String(power||'').trim();if(!raw||raw==='なし'||raw==='-')return raw;
  const terms=raw.replace(/\s+/g,'').split('+').filter(Boolean),dice=[],fixed=[];
  terms.forEach((term,ti)=>{let m=term.match(/^(\d+)D(\d+)$/i);if(m){for(let i=0;i<Number(m[1]);i++)dice.push({sides:Number(m[2]),order:ti});}else if(/^\d+$/.test(term))fixed.push(Number(term));});
  if(!dice.length)return raw;
  let fixedValue=fixed.reduce((a,b)=>a+b,0);
  for(let n=0;n<Math.max(0,Number(steps)||0);n++){
    if(fixedValue>0){fixedValue-=1;continue;}
    const candidates=dice.filter(d=>d.sides>2).sort((a,b)=>b.sides-a.sides||a.order-b.order);
    if(!candidates.length)break;
    candidates[0].sides=Math.max(2,candidates[0].sides-2);
  }
  const counts=new Map();dice.forEach(d=>counts.set(d.sides,(counts.get(d.sides)||0)+1));
  const out=[...counts.entries()].sort((a,b)=>b[0]-a[0]).map(([sides,count])=>`${count}D${sides}`);if(fixedValue>0)out.push(String(fixedValue));return out.join('+')||raw;
}
function individualApplyAttackTendency(monster={},tendency='標準'){
  const copy=JSON.parse(JSON.stringify(monster));if(tendency==='標準')return copy;
  const precision=({'精密I':1,'精密II':2,'精密III':3})[tendency]||0;
  const strongPower=({'強打I':1,'強打II':2,'強打III':3})[tendency]||0;
  const strongHit=({'強打I':1,'強打II':2,'強打III':2})[tendency]||0;
  const offensiveTypes=new Set(['近接攻撃','遠距離攻撃']);
  const actions=tokenParseActions(copy.actions||'');
  actions.forEach(action=>{
    const power=String(action.power||'').trim();
    const target=String(action.target||'').trim();
    const direct=offensiveTypes.has(String(action.actionType||'').trim())&&target!=='自身'&&power&&power!=='なし'&&power!=='-'&&/\d/.test(power);
    if(!direct)return;
    const base=Number(action.baseValue);if(Number.isFinite(base))action.baseValue=String(base+precision-strongHit);
    if(precision)action.power=individualPrecisionPower(power,precision);
    if(strongPower){const m=power.match(/^(.*?)(?:\+(\d+))?$/);const current=m&&m[2]?Number(m[2]):0;action.power=current?`${m[1]}+${current+strongPower}`:`${power}+${strongPower}`;}
  });
  copy.actions=actions.map(a=>[a.name,a.actionType,a.checkType,a.target,a.element,a.power,a.effect,a.baseValue,tokenNormalizeActionRange(a),a.flags||''].join('\t')).join('\n');
  return copy;
}
function individualBounty(base=0,ranks={},tendency='標準'){
  const baseValue=Math.max(0,Number(base)||0);if(!baseValue)return 0;
  let pct=(INDIVIDUAL_RANK_BOUNTY.hp[ranks.hp]||0)+(INDIVIDUAL_RANK_BOUNTY.evasion[ranks.evasion]||0)+(INDIVIDUAL_RANK_BOUNTY.resist[ranks.resist]||0)+(INDIVIDUAL_ATTACK_BOUNTY[tendency]||0);
  pct=Math.max(-30,Math.min(35,pct));let value=Math.round((baseValue*(1+pct/100))/5)*5;
  if(pct>0&&value===baseValue)value=baseValue+5;if(pct<0&&value===baseValue)value=Math.max(0,baseValue-5);return value;
}
function monsterAreaVariant(monster={},areaName=''){
  const raw=String(monster.areaVariants||'').trim(),name=String(areaName||'').trim();let base=null;
  if(raw&&name){try{const map=JSON.parse(raw);base=map&&typeof map==='object'?map[name]||null:null;}catch(_e){base=null;}}
  return globalThis.RAMonsterRules?.mergeAreaVariant?.(monster,name,base)??base;
}
function monsterVariantPower(power='',delta=0){
  const raw=String(power||'').trim(),d=Math.trunc(Number(delta)||0);if(!d||!raw||raw==='なし'||raw==='-'||!/\d+D\d+/i.test(raw))return raw;
  const m=raw.match(/^(.*?)(?:\+(\d+))?$/);if(!m)return raw;
  const base=String(m[1]||raw).replace(/\+$/,''),fixed=Number(m[2]||0)+d;return fixed>0?`${base}+${fixed}`:base;
}
function monsterApplyAreaVariant(monster={},areaName=''){
  const variant=monsterAreaVariant(monster,areaName);if(!variant)return JSON.parse(JSON.stringify(monster));
  const out=JSON.parse(JSON.stringify(monster));['hp','mp','evasionValue','resistValue','defenseValue','initiative','encounterValue'].forEach(k=>{if(variant[k]!==undefined&&variant[k]!==null&&variant[k]!=='')out[k]=String(variant[k]);});
  const skillDelta=Math.trunc(Number(variant.offenseSkillDelta)||0),damageDelta=Math.trunc(Number(variant.damageFixedDelta)||0);
  if((skillDelta||damageDelta)&&out.actions){out.actions=String(out.actions).split(/\r?\n/).filter(Boolean).map(line=>{const c=line.split('\t');while(c.length<9)c.push('');const type=String(c[1]||''),check=String(c[2]||'');if(skillDelta&&['近接攻撃','遠距離攻撃','特殊'].includes(type)&&/(回避値|抵抗値)/.test(check)&&c[7]!==''&&!Number.isNaN(Number(c[7])))c[7]=String(Number(c[7])+skillDelta);if(damageDelta&&['近接攻撃','遠距離攻撃'].includes(type))c[5]=monsterVariantPower(c[5],damageDelta);return c.join('\t');}).join('\n');}
  out.areaVariantName=String(areaName||'').trim();return out;
}
function encounterMonsterIsFixed(monster={}){return String(monster.individualValueEnabled||'').toUpperCase()==='FALSE'||String(monster.id||'').startsWith('mon_named_')||String(monster.monsterTraits||'').split(/[,、，]/).map(v=>v.trim()).includes('ボス');}
function generateEncounterIndividual(monster={},options={}){
  const fixed=encounterMonsterIsFixed(monster)||String(monster.individualValueEnabled||'').toUpperCase()!=='TRUE';
  if(fixed){
    const bounty=Math.max(0,Number(monster.bountyG)||0),variant=JSON.parse(JSON.stringify(monster));
    const selected=encounterSelectedActionSet(variant,options.selectionContext||{});
    {const keep=new Set([...(selected.actions||[]),...(selected.passiveOnlyActions||[])].map(a=>String(a.name||'').trim()));variant.actions=encounterSerializeActions(tokenParseActions(variant.actions||'').filter(a=>keep.has(String(a.name||'').trim())));}
    return{monster:variant,iv:{fixed:true,hp:'B',evasion:'B',resist:'B',attack:'標準'},bountyG:bounty,selectedActionNames:selected.selectedNames||[],selectedFixedActionNames:selected.fixedSelectedNames||[],actionPoolSize:selected.poolSize,eligibleActionPoolSize:selected.eligiblePoolSize??selected.poolSize,validLoadoutCount:selected.validLoadoutCount||1};
  }
  const forced=!!options.fixedIv,conditionContext=individualEnvironmentContext(options.areaName||monster.areaVariantName||'',options),conditionProfile=forced?{labels:[],hints:[]}:individualResolveConditionProfile(monster,conditionContext);
  const ranks={hp:forced?'B':individualRollRank(individualStatWidth(monster,'hp'),individualRankAllowed(conditionProfile,'hp',individualStatWidth(monster,'hp'))),evasion:forced?'B':individualRollRank(individualStatWidth(monster,'evasion'),individualRankAllowed(conditionProfile,'evasion',individualStatWidth(monster,'evasion'))),resist:forced?'B':individualRollRank(individualStatWidth(monster,'resist'),individualRankAllowed(conditionProfile,'resist',individualStatWidth(monster,'resist')))};
  const attackWidth=individualAttackWidth(monster),attack=forced?'標準':individualRollAttackTendency(attackWidth,individualAttackAllowed(conditionProfile,attackWidth));
  let variant=individualApplyAttackTendency(monster,attack);
  if(conditionProfile.labels?.length){variant.conditionProfileLabel=conditionProfile.labels.join(' / ');variant.conditionProfileHint=(conditionProfile.hints||[]).join(' / ');}
  const selected=encounterSelectedActionSet(variant,{...(options.selectionContext||{}),individual:{...ranks,attack}});
  {const keep=new Set([...(selected.actions||[]),...(selected.passiveOnlyActions||[])].map(a=>String(a.name||'').trim()));variant.actions=encounterSerializeActions(tokenParseActions(variant.actions||'').filter(a=>keep.has(String(a.name||'').trim())));}
  const baseHp=Math.max(1,Number(monster.hp)||1),hpPct=({D:-25,C:-12,B:0,A:12,S:25})[ranks.hp]||0;
  variant.hp=String(Math.max(1,Math.round(baseHp*(1+hpPct/100))));
  variant.evasionValue=String(Math.max(0,(Number(monster.evasionValue)||0)+individualRankDelta(ranks.evasion,individualStatWidth(monster,'evasion'))));
  variant.resistValue=String(Math.max(0,(Number(monster.resistValue)||0)+individualRankDelta(ranks.resist,individualStatWidth(monster,'resist'))));
  const bounty=individualBounty(monster.baseBountyG,ranks,attack);
  return{monster:variant,iv:{fixed:false,...ranks,attack,environmentLabel:(conditionProfile.labels||[]).join(' / '),timeSlot:conditionContext.timeSlot||'',weatherName:conditionContext.weatherName||''},bountyG:bounty,selectedActionNames:selected.selectedNames,selectedFixedActionNames:selected.fixedSelectedNames||[],actionPoolSize:selected.poolSize,eligibleActionPoolSize:selected.eligiblePoolSize??selected.poolSize,validLoadoutCount:selected.validLoadoutCount};
}
function encounterInstanceRows(groups=[],options={}){
  const rows=[],normalizedGroups=tokenNormalizeGroups(groups||[]);
  normalizedGroups.forEach(group=>{
    const baseMaster=(state.monsters||[]).find(row=>String(row.name||'').trim()===String(group.name||'').trim())||null;if(!baseMaster)return;const master=monsterApplyAreaVariant(baseMaster,options.areaName||'');
    const selectionContext=encounterSelectionContext(normalizedGroups,{name:group.name,formation:group.formation});
    for(let i=0;i<Math.max(1,Math.floor(Number(group.count)||1));i++){
      const generated=generateEncounterIndividual(master,{...options,selectionContext});
      rows.push({uid:`enc_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,monsterId:String(master.id||''),name:String(master.name||group.name||''),formation:String(group.formation||group.position||''),monster:generated.monster,iv:generated.iv,bountyG:generated.bountyG,selectedActionNames:generated.selectedActionNames||[],selectedFixedActionNames:generated.selectedFixedActionNames||[],actionPoolSize:Number(generated.actionPoolSize)||0,eligibleActionPoolSize:Number(generated.eligibleActionPoolSize)||Number(generated.actionPoolSize)||0,validLoadoutCount:Number(generated.validLoadoutCount)||1});
    }
  });return rows;
}
function encounterBountyTotal(encounter=state.lastEncounter){if(encounter?.bountyEligible===false)return 0;return (encounter?.instances||[]).reduce((sum,row)=>sum+Math.max(0,Number(row.bountyG)||0),0);}
function encounterIvLabel(row={}){const iv=row.iv||{};if(iv.fixed)return '固定個体';const env=String(iv.environmentLabel||'').trim();return `HP:${iv.hp||'B'} / 回避:${iv.evasion||'B'} / 抵抗:${iv.resist||'B'} / 攻撃:${iv.attack||'標準'}${env?` / 環境:${env}`:''}`;}
function recordLastEncounter(label='',areaName='',groups=[],options={}){
  const clean=(groups||[]).map(group=>({name:String(group.name||'').trim(),count:Math.max(1,Math.floor(Number(group.count)||1)),formation:String(group.formation||group.position||'').trim()})).filter(group=>group.name);
  if(!clean.length)return;
  const instances=encounterInstanceRows(clean,{...options,areaName:String(areaName||'').trim()});
  const bountyEligible=options.bountyEligible!==false;
  state.lastEncounter={label:String(label||'戦闘').trim(),areaName:String(areaName||'').trim(),groups:clean,instances,bountyEligible,bountyG:bountyEligible?instances.reduce((sum,row)=>sum+Math.max(0,Number(row.bountyG)||0),0):0,fixedIv:!!options.fixedIv};
  state.dropEncounterInstances=normalizeDropInstances(instances.map(row=>({uid:dropInstanceUid(),monsterId:row.monsterId,name:row.name,formation:row.formation,dismantleSuccess:false})));
  saveState(false);renderEncounterDropList();
}
function encounterGroupsForDrop(row={},resolution=null,partySize=selectedPartySize()){
  if(resolution&&Array.isArray(resolution.groups))return resolution.groups.map(g=>({name:g.name,count:g.count,formation:g.formation||g.position||''}));
  return encounterCompositionGroups(row,partySize).map(g=>({name:g.name,count:g.count,formation:g.position||''}));
}
function encounterHighestInitiative(groups=[],areaName=''){
  const values=(groups||[]).map(group=>{
    const name=String(group?.name||'').trim();
    const base=(state.monsters||[]).find(row=>String(row.name||'').trim()===name);
    const monster=base?monsterApplyAreaVariant(base,areaName):null;
    const value=Number(monster?.initiative);
    return Number.isFinite(value)?value:null;
  }).filter(value=>value!==null);
  return values.length?Math.max(...values):null;
}
function encounterInitiativeText(groups=[],areaName=''){
  const highest=encounterHighestInitiative(groups,areaName);
  return highest===null?'':`先制値：${highest}`;
}
function eventEncounterBranch(row={}){
  if(isBossEvent(row))return 'challenge';
  const mode=eventBattleCopyMode(row);
  if(mode==='戦闘発生')return 'always';
  if(mode!=='戦闘予感')return '';
  const text=String(row.result||'');
  const actual=/(?:戦闘発生|戦闘が発生|との戦闘(?:が発生)?|人数対応戦闘|ランダム編成との戦闘|ランダム編成で[^。]*戦闘)/;
  const failure=eventFailureSegment(text);
  if(failure&&actual.test(failure))return 'failure';
  const successMatch=text.match(/(?:判定)?成功\s*[：:]([^]*?)(?=失敗\s*[：:]|$)/);
  if(successMatch&&actual.test(String(successMatch[1]||'')))return 'success';
  return 'conditional';
}
function eventEncounterHeading(row={}){
  const branch=eventEncounterBranch(row);
  if(branch==='failure')return '失敗時戦闘：';
  if(branch==='success')return '成功時戦闘：';
  if(branch==='challenge')return '挑戦時戦闘：';
  if(branch==='conditional')return '条件成立時戦闘：';
  return '';
}
function formatEventOutput(prefix,picked,area,tableId,extraLines=[],partySizeOverride=null,tokenScope='',encounterOptions={}){
  const partySize=partySizeOverride===null?selectedPartySize():normalizePartySize(partySizeOverride);
  const condition=eventConditionType(picked)==='なし'?'':`前提：${eventConditionType(picked)}${picked.conditionValue?` / ${picked.conditionValue}`:''}`;
  const resolvedGroups=Array.isArray(encounterOptions.resolvedGroups)?encounterOptions.resolvedGroups:[];
  const variant=resolvedGroups.length?null:resolveEventEncounterVariant(picked,partySize);
  const random=variant||(String(picked.encounterCountRule||'').trim()==='ランダム編成'?generateRandomEncounter(area?.name||picked.areaName||'',randomEncounterOptionsForEvent(picked,partySize)):null);
  const encounter=encounterCountText(picked,random);
  const composition=random?encounterResolutionBlock(random):encounterCompositionText(picked,partySize);
  const dropGroups=(resolvedGroups.length?resolvedGroups:encounterGroupsForDrop(picked,random,partySize)).map(g=>({name:g.name,count:g.count,formation:g.formation||g.position||''}));
  picked.__resolvedEncounterGroups=dropGroups.map(g=>({name:g.name,count:g.count,formation:g.formation||g.position||''}));
  const initiative=encounterInitiativeText(dropGroups,area?.name||picked.areaName||'');
  const encounterHeading=dropGroups.length?eventEncounterHeading(picked):'';
  if(dropGroups.length&&(!isBossEvent(picked)||encounterOptions.forceRecordEncounter))recordLastEncounter(picked.eventName||prefix,area?.name||picked.areaName||'',dropGroups,encounterOptions);
  if(dropGroups.length&&tokenScope)setTokenExportEncounter(picked.eventName||prefix,area?.name||picked.areaName||'',dropGroups,tokenScope);
  const weather=area?currentAreaWeather(area):null; const time=areaUsesWorldCycle(area)?selectedTimeSlot():''; return [prefix,area?`エリア：${area.name||area.id}`:'',time?`時間帯：${time}`:'',weather?`天気：${weather.name}`:'',weather?.detail?`天気詳細：${weather.detail}`:'',area&&area.fieldEffect&&area.fieldEffect!=='なし'?`フィールド効果：${area.fieldEffect}`:'',`表：${tableId}`,picked.eventName?`イベント：${picked.eventName}`:'',publicEventTypeName(picked)?`種別：${publicEventTypeName(picked)}`:'',condition,encounterHeading,encounter,composition,initiative,eventCheckDisplayText(picked),picked.result?`結果：${eventResultTextForDisplay(picked,partySize)}`:'',picked.progressEffect?`補足：${picked.progressEffect}`:'',...extraLines].filter(Boolean).join('\n');
}
let bossRumorChoiceContext=null;
function bossRumorDisplayName(boss={}){
  const first=String(boss.encounterComposition||'').split(/\r?\n|;/)[0].split(',');
  if(first.length>=2&&String(first[1]||'').trim())return String(first[1]).trim();
  const m=String(boss.result||'').match(/エリアボス「([^」]+)」/);
  return m?m[1]:String(boss.eventName||'ボス');
}
function ensureBossRumorChoiceModal(){
  let modal=$('bossRumorChoiceModal');if(modal)return modal;
  modal=v738CreateModal('bossRumorChoiceModal','bossRumorChoiceModalTitle',1600);modal.classList.add('boss-rumor-choice-modal');
  modal.querySelector('.progress-modal-body').innerHTML='<p class="boss-rumor-question">噂を追いますか？</p>';
  const foot=modal.querySelector('.progress-modal-foot');
  foot.append(v738Button('bossRumorChaseBtn','噂を追う'),v738Button('bossRumorNormalBtn','通常イベント','secondary'));
  $('bossRumorChaseBtn')?.addEventListener('click',()=>resolveBossRumorChoice(true));
  $('bossRumorNormalBtn')?.addEventListener('click',()=>resolveBossRumorChoice(false));
  return modal;
}
function resolveBossRumorEncounter(area,rumor,boss){
  clearTokenExportEncounter('event');
  state.lastEventCheckCopyText='';state.lastEventOutcomeKey='';resetAreaEventItemCopyState();clearRecipeMerchantOffers();
  state.lastEventKey=eventUniqueKey(boss);state.lastEventOutcomeKey=eventUniqueKey(boss);
  const tableId=String(area?.eventTableId||boss.tableId||'').trim();
  const baseText=formatEventOutput(`【ボス噂を追跡】${boss.eventName||'ボス遭遇'}`,boss,area,tableId,[`今日の噂：${rumor.eventName||''}`,`探索進行度100%：噂を追って確定遭遇`],null,'event',{forceRecordEncounter:true});
  state.lastEventCheckCopyText=eventCheckCopyText(boss);
  const treasureBundle=resolveEventTreasures(boss,area?.name||boss.areaName||'',false);
  state.lastEventRewardState=buildEventRewardState(boss);
  const rewardSpec=eventRewardTableSpec(boss,area?.name||boss.areaName||'');
  const maxSlots=Math.max(rewardSpec.drawCount,eventRewardMaxTableSlots(boss));
  const tableReward=rollRewardItemTable(rewardSpec.tableId,maxSlots,area?.name||boss.areaName||'',boss.eventName||'ボス遭遇');
  setEventTableRewardState('event',tableReward);syncEventTableRewardCopyState('event');
  state.lastEventText=[baseText,treasureBundle.displayText,tableReward.displayText].filter(Boolean).join('\n\n');
  setEventTreasureResults('event',treasureBundle.results);renderEventRewardPanel('event');resetImportantUsePanel('event');
  updateTreasureCopyButtons();updateAreaEventItemCopyButton();updateEventCheckCopyButtons();updateEventContentCopyButtons();
  state.areaBossEncountered[areaEventKey(area)]=true;
  if($('eventResult'))$('eventResult').textContent=state.lastEventText;
  const rollBtn=$('rollEventBtn');if(rollBtn)rollBtn.textContent='イベント再抽選';
  if(typeof progressUiV738!=='undefined'&&progressUiV738.areaActive){progressUiV738.slotResolved.event=true;v738UpdateProgressControls();}
  saveState(false);addLog(`ボス噂を追跡：${boss.eventName||'ボス遭遇'}へ確定遭遇。`);
  return true;
}
function resolveBossRumorChoice(chase){
  const ctx=bossRumorChoiceContext;if(!ctx)return;
  bossRumorChoiceContext=null;v738SetModalOpen('bossRumorChoiceModal',false);
  if(chase){resolveBossRumorEncounter(ctx.area,ctx.rumor,ctx.boss);return;}
  addLog(`ボス噂「${ctx.rumor.eventName||''}」を追わず、100%イベントを通常抽選。`);
  if(typeof progressUiV738!=='undefined'&&progressUiV738.areaActive){progressUiV738.slotResolved.event=false;v738UpdateProgressControls();}
  rollEvent();
}
function triggerAreaClearRumorEvent(area){
  if(!areaUsesWorldCycle(area))return false;
  const rumor=selectedRumor();
  const boss=bossEventForRumor(area,rumor);
  if(!boss)return false;
  bossRumorChoiceContext={area,rumor,boss};
  const modal=ensureBossRumorChoiceModal();
  $('bossRumorChoiceModalTitle').textContent=`ボス噂：${bossRumorDisplayName(boss)}`;
  v738SetModalOpen('bossRumorChoiceModal',true);
  return true;
}
function fillEventTables(){
  const area=selected($('areaSelect'),state.areas); const prefer=area&&area.eventTableId?String(area.eventTableId):'';
  const ids=[...new Set(state.events.map(e=>String(e.tableId||'').trim()).filter(Boolean))];
  const rows=ids.map(id=>{
    const all=state.events.filter(e=>String(e.tableId||'').trim()===id);
    return {id, count:all.filter(isBaseRandomEvent).length, auxiliary:all.filter(e=>!isBaseRandomEvent(e)).length};
  });
  const sel=$('eventTableSelect'); sel.innerHTML=''; rows.forEach((r,i)=>{const o=document.createElement('option'); o.value=r.id; o.textContent=`${r.id}（通常ランダム候補${r.count}件）`; sel.appendChild(o);});
  if(!rows.length){const o=document.createElement('option'); o.value=''; o.textContent='イベント表なし'; sel.appendChild(o);} else if(prefer){sel.value=prefer;}
}
function rollEvent(){
  clearTokenExportEncounter('event');
  state.lastEventKey='';
  const area=selected($('areaSelect'),state.areas);
  const tableId=String((area&&area.eventTableId)||$('eventTableSelect').value||'').trim();
  const rumor=areaUsesWorldCycle(area)?selectedRumor():null;
  let rows=eventRowsForArea(area,{rumor});
  state.lastEventCheckCopyText='';
  state.lastEventOutcomeKey='';
  resetAreaEventItemCopyState();clearRecipeMerchantOffers();
  if(!rows.length){state.lastEventOutcomeKey='';state.lastEventText='このエリアに登録されたランダムイベント候補がありません。前提条件付きイベントは、今日の噂が一致した時だけ候補に入ります。';$('eventResult').textContent=state.lastEventText;renderEventRewardPanel('event');updateAreaEventItemCopyButton();return;}
  const picked=pickAreaEvent(rows,state.lastEventKey,area,{rumor});
  state.lastEventKey=eventUniqueKey(picked);
  state.lastEventOutcomeKey=eventUniqueKey(picked);
  const rumorLine=rumor ? [`今日の噂：${rumor.eventName||''}${rumorScope(rumor)==='時間帯'?`（${eventTimeSlots(rumor).join('・')}のみ有効）`:''}`] : [];
  const baseText=formatEventOutput(`【ランダムイベント】${picked.eventName||'名称未設定'}`, picked, area, tableId, rumorLine,null,'event');
  state.lastEventCheckCopyText=eventCheckCopyText(picked);
  const treasureBundle=resolveEventTreasures(picked,area?.name||picked.areaName||'',false);
  state.lastEventRewardState=buildEventRewardState(picked);
  const rewardSpec=eventRewardTableSpec(picked,area?.name||picked.areaName||'');
  const maxSlots=Math.max(rewardSpec.drawCount,eventRewardMaxTableSlots(picked));
  const tableReward=rollRewardItemTable(rewardSpec.tableId,maxSlots,area?.name||picked.areaName||'',picked.eventName||'イベント');
  setEventTableRewardState('event',tableReward);syncEventTableRewardCopyState('event');
  state.lastEventText=[baseText,treasureBundle.displayText,tableReward.displayText].filter(Boolean).join('\n\n');
  setEventTreasureResults('event',treasureBundle.results);
  if(isRecipeMerchantEvent(picked))drawRecipeMerchantOffers(area,'event',picked.eventName||'レシピ商人との遭遇');else renderRecipeMerchantPanel();
  renderEventRewardPanel('event');
  // 抽選直後に越境対応欄も更新し、対応品名・消費数・使用ボタンをその場で表示する。
  resetImportantUsePanel('event');
  updateTreasureCopyButtons();updateAreaEventItemCopyButton();updateEventCheckCopyButtons();updateEventContentCopyButtons();
  if(isBossEvent(picked)) state.areaBossEncountered[areaEventKey(area)]=true;
  $('eventResult').textContent=state.lastEventText;
  const rollBtn=$('rollEventBtn');if(rollBtn)rollBtn.textContent='イベント再抽選';
  saveState(false);
  addLog(`イベント抽選：${picked.eventName||'名称未設定'}${treasureBundle.results.length?` / 宝箱${treasureBundle.results.length}件を同時決定`:''}${isRecipeMerchantEvent(picked)?' / レシピ商人の販売品4件を決定':''}`);
}
