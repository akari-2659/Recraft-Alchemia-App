function isRecipeMerchantEvent(row={}){return String(row.eventType||'').trim()==='レシピ商人';}
function recipeMerchantIsBossTreasureRow(row={}){
  const tableId=String(row.tableId||'').trim(),chest=String(row.chestName||'').trim();
  return /(?:^|_)(?:lord|boss)(?:_|$)/i.test(tableId)||/(?:戦利品箱|隠し宝箱|淵主の宝箱)$/.test(chest);
}
function recipeMerchantRecipeKey(row={}){return String(row.id||row.publicId||row.name||row.resultItem||'').trim();}
function recipeMerchantRecipeForTreasure(row={}){
  const pid=String(row.entryPublicId||'').trim(),name=String(row.recipeName||'').trim(),entry=String(row.entryName||'').trim();
  return (state.recipes||[]).find(r=>pid&&String(r.publicId||'').trim()===pid)
      ||(state.recipes||[]).find(r=>name&&String(r.name||'').trim()===name)
      ||(state.recipes||[]).find(r=>entry&&[`${String(r.resultItem||r.name||'').trim()}のレシピ`,String(r.name||'').trim()].includes(entry))
      ||null;
}
function recipeMerchantIsRegularShopRecipe(row={}){
  return /店売り/u.test(String(row.recipeSource||''));
}
function recipeMerchantIsInitialUnlockedRecipe(row={}){
  const source=String(row.recipeSource||''),tags=String(row.tags||'');
  return /初期解放/u.test(source)||/初期解放/u.test(tags)||/通常弾/u.test(tags);
}
function recipeMerchantIsRecipeItem(row={}){
  const sell=Number(String(row.recipeSellPrice||'').trim());
  return Number.isFinite(sell)&&sell>0;
}
function recipeMerchantPool(areaName=''){
  const name=String(areaName||'').trim(),map=new Map();
  (state.recipes||[]).forEach(recipe=>{
    if(!enabledRow(recipe))return;
    if(!recipeMerchantIsRecipeItem(recipe))return;
    if(recipeMerchantIsRegularShopRecipe(recipe)||recipeMerchantIsInitialUnlockedRecipe(recipe))return;
    if(!treasureUnlockAreaAllowed(recipe.unlockAreaKey,name))return;
    const key=recipeMerchantRecipeKey(recipe);if(key&&!map.has(key))map.set(key,recipe);
  });
  return [...map.values()];
}
function recipeMerchantNormalPrice(row={}){
  {
    const n=Number(String(row.recipePrice||'').trim());if(Number.isFinite(n)&&n>0)return Math.ceil(n/10)*10;
  }
  const rank=Math.max(1,Number(row.rank)||1),sell=Math.max(0,Number(row.recipeSellPrice)||0);
  const floor=rank<=1?900:rank===2?1400:rank===3?2200:rank===4?3200:4600;
  return Math.ceil(Math.max(floor,sell*5)/50)*50;
}
function recipeMerchantPrice(row={}){
  const base=recipeMerchantNormalPrice(row);return Math.max(10,Math.floor((base*0.75)/10)*10);
}
function randomRowsWithoutReplacement(rows=[],count=4){
  const pool=rows.slice(),out=[];while(pool.length&&out.length<count){const i=Math.floor(Math.random()*pool.length);out.push(pool.splice(i,1)[0]);}return out;
}
function kohakuItemKey(row={}){return String(row.publicId||row.id||row.name||'').trim();}
function kohakuMaterialValue(row={}){const sell=Number(String(row.sellPrice||'').trim());if(Number.isFinite(sell)&&sell>0)return sell;const rank=Math.max(1,Number(row.rank)||1);return rank*10;}
function kohakuBossMonsterNames(){
  const out=new Set();(state.events||[]).filter(e=>String(e.eventType||'').trim()==='ボス遭遇').forEach(e=>{String(e.encounterComposition||'').split(/[;\n]+/).forEach(part=>{const cols=part.split(',').map(v=>v.trim());if(cols[1])out.add(cols[1]);});});return out;
}
function kohakuIsRecipeOrScroll(row={}){const type=String(row.itemType||'').trim(),cat=String(row.itemCategory||'').trim(),kind=String(row.dataKind||'').trim();return type==='スクロール'||cat.includes('スクロール')||type==='レシピ'||cat==='レシピ'||kind==='レシピ';}
function kohakuIsCrossBorderItem(row={}){return String(row.itemType||'').trim()==='重要アイテム'||String(row.id||'').startsWith('imp_')||/越境/.test(`${row.source||''} ${row.itemCategory||''} ${row.notes||''}`);}
function kohakuIsNamedMaterial(row={}){return /^mat_named_/i.test(String(row.id||'').trim());}
function kohakuIsBossMaterial(row={}){if(String(row.materialType||'').trim()!=='魔物素材')return false;const source=String(row.source||'').trim();return [...kohakuBossMonsterNames()].some(name=>name&&source.includes(name));}
function kohakuIsValuableOnly(row={}){return String(row.itemType||'').trim()==='換金品'||String(row.itemCategory||'').trim()==='換金品';}
function kohakuExcludedSpecial(row={}){return !row||kohakuIsRecipeOrScroll(row)||kohakuIsCrossBorderItem(row)||kohakuIsNamedMaterial(row)||kohakuIsBossMaterial(row);}
function kohakuEligibleOfferRow(row={}){return !!row&&enabledRow(row)&&!kohakuExcludedSpecial(row)&&!kohakuIsValuableOnly(row);}
function kohakuEligiblePaymentRow(row={}){return !!row&&enabledRow(row)&&!kohakuExcludedSpecial(row);}
function kohakuAreaMainMaterialNames(area={}){return String(area.mainMaterials||'').split(/[、,，/／\n]+/).map(v=>v.trim()).filter(Boolean);}
function kohakuAreaMonsterNames(area={}){return String(area.mainMonsters||'').split(/[、,，/／\n]+/).map(v=>v.trim()).filter(Boolean);}
function kohakuAreaAvailabilityPool(area={}){
  const map=new Map(),areaName=String(area.name||'').trim(),tableId=String(area.eventTableId||'').trim();
  const add=(row,weight=1,source='')=>{if(!row||!enabledRow(row))return;const key=kohakuItemKey(row);if(!key)return;const cur=map.get(key);if(cur){cur.weight=Math.max(cur.weight,Number(weight)||1);if(source)cur.sources.add(source);return;}map.set(key,{row,weight:Number(weight)||1,sources:new Set(source?[source]:[])});};
  // エリアの正式な入手アイテム表。加工素材・消耗品などもここから対象になる。
  const rewardTableId=rewardItemTableIdForArea(areaName);rewardItemRows(rewardTableId).forEach(r=>add(findItemByNameOrId(r.entryName,r.entryPublicId),5,'入手アイテム表'));
  // エリア説明上の主素材。
  kohakuAreaMainMaterialNames(area).forEach(name=>add(findItemByNameOrId(name,''),5,'主素材'));
  // エリア固有イベントの直接報酬と、そこで参照される宝箱表の中身。
  const areaEvents=(state.events||[]).filter(e=>String(e.tableId||'').trim()===tableId||String(e.areaName||'').trim()===areaName);
  areaEvents.forEach(e=>{
    String(e.result||'').split(/[。\n]+/).forEach(clause=>eventRewardItemsFromClause(clause).forEach(item=>add(item.row||findItemByNameOrId(item.selectedName||item.name,''),4,'エリアイベント')));
    const tid=String(e.treasureTableId||'').trim();if(tid)eligibleTreasureRows(tid,areaName).forEach(tr=>{if(String(tr.entryType||'').trim()==='通貨')return;add(findItemByNameOrId(tr.entryName,tr.entryPublicId),3,'宝箱');});
  });
  // そのエリアに通常出現する魔物のドロップ。ボス素材・二つ名素材は後段で除外。
  const monsterByName=new Map((state.monsters||[]).map(m=>[String(m.name||'').trim(),m]));
  kohakuAreaMonsterNames(area).forEach(name=>{const mon=monsterByName.get(name);if(!mon)return;parseDrops(mon.drops||'').forEach(d=>add(findDropMaterial(d),4,'魔物ドロップ'));});
  return [...map.values()];
}
function kohakuAreaAllowedKeySet(area={}){return new Set(kohakuAreaAvailabilityPool(area).map(x=>kohakuItemKey(x.row)).filter(Boolean));}
function kohakuOfferPool(area={}){return kohakuAreaAvailabilityPool(area).filter(entry=>kohakuEligibleOfferRow(entry.row));}
function kohakuLedger(){return progressUiV738.kohakuMaterials||{areaId:'',seq:0,currentEventToken:'',sources:{}};}
function kohakuResetLedger(area={}){progressUiV738.kohakuMaterials={areaId:String(area.id||area.name||''),seq:0,currentEventToken:'',sources:{}};state.lastRecipeMerchantTrades=[];}
function kohakuCurrentTradeArea(){const name=String(state.lastRecipeMerchantContext?.areaName||'').trim();return (state.areas||[]).find(a=>String(a.name||a.id||'').trim()===name)||selectedExplorationArea()||{};}
function kohakuAggregateMaterials(area=kohakuCurrentTradeArea()){
  const map=new Map(),ledger=kohakuLedger(),allowed=kohakuAreaAllowedKeySet(area);Object.values(ledger.sources||{}).forEach(rows=>(rows||[]).forEach(item=>{const row=item.row||findItemByNameOrId(item.name,item.publicId);if(!kohakuEligiblePaymentRow(row))return;const key=kohakuItemKey(row)||String(item.name||'');if(!key||!allowed.has(key))return;const cur=map.get(key)||{name:row?.name||item.name,row,count:0};cur.count+=Math.max(0,Number(item.count)||0);map.set(key,cur);}));return[...map.values()].filter(x=>x.count>0);
}
function kohakuSetMaterialSource(sourceKey='',items=[]){
  const key=String(sourceKey||'').trim();if(!key)return;const ledger=kohakuLedger();const map=new Map();(items||[]).forEach(item=>{const row=item.row||findItemByNameOrId(item.name,item.publicId);if(!row)return;const k=kohakuItemKey(row)||String(item.name||'');if(!k)return;const cur=map.get(k)||{name:row?.name||item.name,row,count:0};cur.count+=Math.max(0,Number(item.count)||0);map.set(k,cur);});ledger.sources[key]=[...map.values()];progressUiV738.kohakuMaterials=ledger;
}
function kohakuTreasureSelectedItems(scope='event'){
  const out=[];eventTreasureResults(scope).filter(r=>eventTreasureAllowedBySelectedOutcome(scope,r)).forEach(result=>{const picked=result?.picked;if(!picked)return;const row=findItemByNameOrId(picked.entryName||picked.recipeName,picked.entryPublicId);if(!row)return;const m=String(result.quantity||'1').match(/\d+/),count=Math.max(1,Number(m?.[0]||1));out.push({name:row.name,row,count});});return out;
}
function kohakuCurrentEventMaterialItems(){return [...eventRewardCombinedSelectedItems('event'),...kohakuTreasureSelectedItems('event')];}
function kohakuDiscardCurrentEventMaterials(){const ledger=kohakuLedger(),token=String(ledger.currentEventToken||'').trim();if(!token)return;Object.keys(ledger.sources||{}).forEach(key=>{if(key===`event:${token}`||key.startsWith(`drop:${token}:`))delete ledger.sources[key];});ledger.currentEventToken='';progressUiV738.kohakuMaterials=ledger;}
function kohakuCommitCurrentAreaEventMaterials(){
  if(!progressUiV738.areaActive||progressUiV738.areaMode!=='normal')return;const ledger=kohakuLedger(),token=String(ledger.currentEventToken||'').trim(),row=v738CurrentEventRow('event');if(!token)return;if(row&&!isRecipeMerchantEvent(row))kohakuSetMaterialSource(`event:${token}`,kohakuCurrentEventMaterialItems());ledger.currentEventToken='';progressUiV738.kohakuMaterials=ledger;
}
function kohakuEncounterSignature(instances=[]){const label=String(state.lastEncounter?.label||'encounter').trim();const body=(instances||[]).map(x=>`${String(x.monsterId||x.name||'')}:${String(x.formation||'')}`).sort().join('|');return `${label}::${body||'encounter'}`;}
function kohakuCommitDropMaterials(aggregate,instances=[]){
  if(!progressUiV738.areaActive||progressUiV738.areaMode!=='normal')return;const ledger=kohakuLedger(),token=String(ledger.currentEventToken||'').trim();if(!token)return;const rows=[];aggregate.forEach(v=>{const row=v.material||findDropMaterial(v.d||{});if(row)rows.push({name:row.name,row,count:Number(v.count)||0});});kohakuSetMaterialSource(`drop:${token}:${kohakuEncounterSignature(instances)}`,rows);
}
function kohakuWeightedPick(entries=[]){const rows=(entries||[]).filter(x=>Number(x.weight)>0);if(!rows.length)return null;const total=rows.reduce((s,x)=>s+Number(x.weight||1),0);let r=Math.random()*total;for(const x of rows){r-=Number(x.weight||1);if(r<=0)return x;}return rows.at(-1)||null;}
function kohakuTradeCandidates(area={}){
  const payments=kohakuAggregateMaterials(area),offers=kohakuOfferPool(area),out=[];
  payments.forEach(pay=>{const payValue=kohakuMaterialValue(pay.row),valuablePayment=kohakuIsValuableOnly(pay.row),maxPay=valuablePayment?Math.min(Math.max(0,Math.floor(Number(pay.count)||0)),1):Math.min(Math.max(0,Math.floor(Number(pay.count)||0)),8);if(!payValue||!maxPay)return;
    offers.forEach(entry=>{const give=entry.row;if(!give||kohakuItemKey(give)===kohakuItemKey(pay.row))return;const giveValue=kohakuMaterialValue(give);if(!giveValue)return;
      for(let giveQty=1;giveQty<=5;giveQty++){
        const giveTotal=giveValue*giveQty,needQty=valuablePayment?1:Math.ceil(giveTotal/payValue);if(needQty<1||needQty>maxPay)continue;const needTotal=payValue*needQty,spread=needTotal/giveTotal;if(spread<0.999||spread>1.35)continue;
        const closeness=spread<=1.12?2.0:spread<=1.22?1.45:1.0;const stock=Math.min(2,0.75+Math.sqrt(Math.max(1,pay.count))/2);out.push({give,giveQty,need:pay.row,needQty,giveValue:giveTotal,needValue:needTotal,weight:Number(entry.weight||1)*closeness*stock});
      }
    });
  });return out;
}
function drawKohakuMaterialTrades(area={},count=5){
  if(String(state.lastRecipeMerchantContext?.scope||'event')!=='event'){state.lastRecipeMerchantTrades=[];return;}
  const pool=kohakuTradeCandidates(area),offers=[],work=pool.slice();while(offers.length<count&&work.length){const picked=kohakuWeightedPick(work);if(!picked)break;offers.push({...picked});const i=work.indexOf(picked);if(i>=0)work.splice(i,1);}while(offers.length<count&&pool.length){const picked=kohakuWeightedPick(pool);if(!picked)break;offers.push({...picked});}state.lastRecipeMerchantTrades=offers;
}
function kohakuTradeLine(t={}){return `${t.give?.name||'素材'}×${Number(t.giveQty)||1} ← ${t.need?.name||'素材'}×${Number(t.needQty)||1}`;}
function kohakuTradeListCopyText(){const rows=state.lastRecipeMerchantTrades||[],lines=['【コハクの素材交換】'];if(!rows.length){lines.push('交換候補なし');return lines.join('\n');}rows.forEach(r=>lines.push(`・${kohakuTradeLine(r)}`));return lines.join('\n');}
function kohakuLedgerSummary(){const rows=kohakuAggregateMaterials(kohakuCurrentTradeArea());return rows.length?rows.map(x=>`${x.name}×${x.count}`).join('、'):'なし';}
function clearRecipeMerchantOffers(){
  state.lastRecipeMerchantOffers=[];state.lastRecipeMerchantTrades=[];state.selectedRecipeMerchantId='';state.lastRecipeMerchantContext={scope:'',areaName:'',eventName:''};renderRecipeMerchantPanel();
}
function drawRecipeMerchantOffers(area={},scope='event',eventName=''){
  const areaName=String(area?.name||area?.id||'').trim();
  const pool=recipeMerchantPool(areaName);
  state.lastRecipeMerchantOffers=randomRowsWithoutReplacement(pool,4);
  state.selectedRecipeMerchantId=recipeMerchantRecipeKey(state.lastRecipeMerchantOffers[0]||{});
  state.lastRecipeMerchantContext={scope:String(scope||'event'),areaName,eventName:String(eventName||'レシピ商人との遭遇')};
  drawKohakuMaterialTrades(area,5);renderRecipeMerchantPanel();
}
function selectedRecipeMerchantRow(){
  const key=String(state.selectedRecipeMerchantId||'');return (state.lastRecipeMerchantOffers||[]).find(r=>recipeMerchantRecipeKey(r)===key)||state.lastRecipeMerchantOffers?.[0]||null;
}
function recipeMerchantListCopyText(){
  const rows=state.lastRecipeMerchantOffers||[];
  const lines=['【コハクのレシピショップ】'];
  if(!rows.length){lines.push('販売商品なし');return lines.join('\n');}
  rows.forEach(r=>{
    const raw=String(r.resultItem||r.name||'名称未設定').trim();
    const recipeName=/レシピ$/.test(raw)?raw:`${raw}のレシピ`;
    lines.push(`・${recipeName}/${progressPlayerRank(r.rank)||'★?'}/${recipeMerchantPrice(r)}G(${recipeMerchantNormalPrice(r)}G)`);
  });
  return lines.join('\n');
}
function recipeMerchantInfoCopyText(row={}){
  if(!row)return'';
  return [
    '【レシピ情報】',
    `レシピ名：${row.name||row.resultItem||'名称未設定'}`,
    `ランク：${progressPlayerRank(row.rank)||'未設定'}`,
    `製作区分：${row.craftType||'未設定'}`,
    `遭遇販売価格：${recipeMerchantPrice(row)}G`,
    `通常販売価格：${recipeMerchantNormalPrice(row)}G`,
    `完成品：${row.resultItem||row.name||'未設定'}`,
    row.requiredMaterials?`必要素材：${row.requiredMaterials}`:'',
    row.difficulty?`難度：${row.difficulty}`:'',
    row.effect?`効果：${row.effect}`:'',
    row.description?`説明：${row.description}`:''
  ].filter(Boolean).join('\n');
}
function recipeMerchantOfferDisplayText(){
  const ctx=state.lastRecipeMerchantContext||{},rows=state.lastRecipeMerchantOffers||[];
  if(!rows.length)return'';
  return ['【レシピ商人・抽選販売品】',ctx.areaName?`エリア：${ctx.areaName}`:'',...rows.map((r,i)=>`${i+1}. ${r.name||r.resultItem||'名称未設定'} / ${progressPlayerRank(r.rank)||'ランク未設定'} / ${recipeMerchantPrice(r)}G`)].filter(Boolean).join('\n');
}
function sanitizeRecipeMerchantOffers(){
  const ctx=state.lastRecipeMerchantContext||{},areaName=String(ctx.areaName||'').trim();
  const valid=new Map(recipeMerchantPool(areaName).map(r=>[recipeMerchantRecipeKey(r),r]));
  state.lastRecipeMerchantOffers=(state.lastRecipeMerchantOffers||[]).map(r=>valid.get(recipeMerchantRecipeKey(r))).filter(Boolean);
  if(!state.lastRecipeMerchantOffers.some(r=>recipeMerchantRecipeKey(r)===String(state.selectedRecipeMerchantId||''))){
    state.selectedRecipeMerchantId=recipeMerchantRecipeKey(state.lastRecipeMerchantOffers[0]||{});
  }
}
function renderRecipeMerchantPanel(){
  sanitizeRecipeMerchantOffers();
  const areaPanel=$('recipeMerchantPanel'),questPanel=$('questRecipeMerchantPanel');
  [areaPanel,questPanel].forEach(panel=>{if(panel){panel.classList.add('hidden');panel.innerHTML='';}});
  const rows=state.lastRecipeMerchantOffers||[],trades=state.lastRecipeMerchantTrades||[];if(!rows.length&&!trades.length)return;
  const scope=String(state.lastRecipeMerchantContext?.scope||'event');
  const panel=scope==='quest'?questPanel:areaPanel;if(!panel)return;
  panel.classList.remove('hidden');
  if(rows.length&&!rows.some(r=>recipeMerchantRecipeKey(r)===state.selectedRecipeMerchantId))state.selectedRecipeMerchantId=recipeMerchantRecipeKey(rows[0]);
  const cards=rows.map(r=>`<article class="recipe-merchant-card"><h4>${esc(r.name||r.resultItem||'名称未設定')}</h4><div>${esc(progressPlayerRank(r.rank)||'ランク未設定')} / ${esc(r.craftType||'製作区分未設定')}</div><div class="recipe-merchant-price">${recipeMerchantPrice(r)}G <span class="recipe-merchant-normal">通常${recipeMerchantNormalPrice(r)}G</span></div></article>`).join('');
  const opts=rows.map(r=>`<option value="${esc(recipeMerchantRecipeKey(r))}" ${recipeMerchantRecipeKey(r)===state.selectedRecipeMerchantId?'selected':''}>${esc(r.name||r.resultItem||'名称未設定')}</option>`).join('');
  const recipeHtml=rows.length?`<section class="card"><h3>レシピ商人の販売品</h3><p class="muted small">常設店売りレシピを除き、この進行段階までに解放されるレシピ全体から4件抽選しています。宝箱限定・ボス由来を含みます。遭遇価格は通常販売価格の75%（10G単位切り捨て）です。</p><div class="recipe-merchant-grid">${cards}</div><div class="buttons"><button type="button" class="secondary" id="copyRecipeMerchantListBtn">販売商品リストをコピー</button></div><div class="recipe-merchant-tools"><label>情報コピーするレシピ<select id="recipeMerchantSelect">${opts}</select></label><button type="button" class="secondary" id="copyRecipeMerchantInfoBtn">選択レシピ情報をコピー</button></div></section>`:'';
  let tradeHtml='';if(scope==='event'){
    const tradeCards=trades.map(t=>`<article class="kohaku-trade-card"><b>${esc(kohakuTradeLine(t))}</b></article>`).join('');
    tradeHtml=`<section class="card kohaku-trade-block"><h3>素材交換</h3><p class="muted small">受取 ← 要求。受取はこのエリアで通常入手できる品から、要求はこの探索中に実際に入手した同エリア入手品から選ばれます。レシピ・スクロール・越境品・ボス素材・二つ名素材は対象外。換金品は要求側のみ使用でき、要求数は原則1個です。</p>${trades.length?`<div class="kohaku-trade-grid">${tradeCards}</div><div class="buttons"><button type="button" class="secondary" id="copyRecipeMerchantTradeListBtn">交換リストをコピー</button></div>`:'<div class="muted small">この探索中に交換へ使える対象品がまだありません。</div>'}<div class="muted small kohaku-trade-ledger">記録中：${esc(kohakuLedgerSummary())}</div></section>`;
  }
  panel.innerHTML=recipeHtml+tradeHtml;
}
function clearEncounterDropState(){
  state.lastEncounter=null;
  state.dropEncounterInstances=[];
  state.lastDropText='';
  state.lastDropSuccessText='';
  renderEncounterDropList();
  const result=$('dropResult');
  if(result)result.textContent='ドロップ結果がここに表示されます。';
}
function clearQuestRandomEventHistory(){
  clearTokenExportEncounter('quest');
  state.lastQuestEventText='';
  state.lastQuestEventKey='';
  state.lastQuestCheckCopyText='';
  state.lastQuestBattleCheckCopyText='';
  state.lastQuestOutcomeKey='';
  resetQuestEventItemCopyState();
  if(state.lastRecipeMerchantContext?.scope==='quest')clearRecipeMerchantOffers();
  clearEncounterDropState();
}
function clearAreaRandomEventHistory(){
  clearTokenExportEncounter('event');
  state.lastEventText='';
  state.lastEventKey='';
  state.lastEventCheckCopyText='';
  state.lastEventOutcomeKey='';
  resetAreaEventItemCopyState();
  if(state.lastRecipeMerchantContext?.scope==='event')clearRecipeMerchantOffers();
  clearEncounterDropState();
}
function resetQuestEventItemCopyState(){
  state.lastQuestTreasureCopyText='';
  state.lastQuestTreasureResults=[];
  state.lastQuestHasTreasure=false;
  state.lastQuestEventTableRewardText='';
  state.lastQuestEventTableRewardCopyText='';
  state.lastQuestEventTableRewardState=null;
  state.lastQuestEventRewardState=null;
}
function resetAreaEventItemCopyState(){
  state.lastEventTreasureCopyText='';
  state.lastEventTreasureResults=[];
  state.lastEventTableRewardText='';
  state.lastEventTableRewardCopyText='';
  state.lastEventTableRewardState=null;
  state.lastEventRewardState=null;
}
function mergeEventItemCopyParts(parts=[]){
  const bodies=parts.map(x=>String(x||'').trim()).filter(Boolean);
  // 「入手なし」は実アイテムのコピー内容と同時に出さない。
  // 入手アイテムは既存のデータブロックをそのまま連結し、イベント用の見出しは足さない。
  const isNoRewardBody=body=>/^(?:入手なし|追加素材なし)[。．]?$/.test(String(body||'').trim());
  const hasActualReward=bodies.some(body=>!isNoRewardBody(body));
  const mergedBodies=hasActualReward?bodies.filter(body=>!isNoRewardBody(body)):bodies;
  return mergedBodies.join('\n\n');
}
function questEventItemCopyText(){
  const parts=[];
  const rewardRows=eventRewardSelectedItems('quest');
  if(eventRewardState('quest'))parts.push(eventRewardCopyText('quest'));
  const tableText=eventTableRewardCopyText('quest');if(String(tableText||'').trim())parts.push(tableText);
  if(String(state.lastQuestTreasureCopyText||'').trim())parts.push(state.lastQuestTreasureCopyText);
  return mergeEventItemCopyParts(parts);
}
function updateQuestEventItemCopyButton(){updateEventContentCopyButtons();}
function updateEventCheckCopyButtons(){
  const q=$('copyQuestCheckBtn');if(q)q.disabled=!String(state.lastQuestCheckCopyText||'').trim();
  const qb=$('copyQuestBattleCheckBtn');if(qb){const has=!!String(state.lastQuestBattleCheckCopyText||'').trim();qb.disabled=!has;qb.classList.toggle('hidden',!has);}
  const a=$('copyEventCheckBtn');if(a)a.disabled=!String(state.lastEventCheckCopyText||'').trim();
  const b=$('copyBaseEventCheckBtn');if(b)b.disabled=!String(state.lastBaseCheckCopyText||'').trim();
}
function areaEventItemCopyText(){
  const parts=[];
  const rewardRows=eventRewardSelectedItems('event');
  if(eventRewardState('event'))parts.push(eventRewardCopyText('event'));
  const tableText=eventTableRewardCopyText('event');if(String(tableText||'').trim())parts.push(tableText);
  if(String(state.lastEventTreasureCopyText||'').trim())parts.push(state.lastEventTreasureCopyText);
  return mergeEventItemCopyParts(parts);
}
function updateAreaEventItemCopyButton(){updateEventContentCopyButtons();}
function baseEventItemCopyText(){
  const parts=[];if(eventRewardState('base'))parts.push(eventRewardCopyText('base'));const tableText=eventTableRewardCopyText('base');if(String(tableText||'').trim())parts.push(tableText);return mergeEventItemCopyParts(parts);
}
function updateBaseEventItemCopyButton(){updateEventContentCopyButtons();}

function enabledRow(row){return String(row && row.enabled || 'TRUE').trim().toUpperCase() !== 'FALSE';}
