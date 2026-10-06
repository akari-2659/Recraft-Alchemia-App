function canonicalMaterialTypeName(value=''){
  const raw=String(value||'').trim();
  if(['モンスタードロップ','魔物ドロップ','敵素材'].includes(raw)) return '魔物素材';
  return raw;
}
function adminBroadItemType(row={}){
  const type=String(row.itemType||'').trim();
  if(type==='バッグ'||type==='矢筒') return '収納具';
  if(type==='術式装備') return ['魔導書','祈祷書'].includes(String(row.itemCategory||'').trim()) ? '武器' : 'スクロール';
  return type;
}
function adminItemInternalCategory(row={}, view=currentItemTypeView){
  if(view==='収納具') return String(row.itemType||'').trim() || '収納具';
  return String(row.itemCategory||'').trim() || '未分類';
}
function adminAllItemTypes(){
  const names = new Set();
  (state.item_types || []).filter(r=>String(r.enabled ?? 'TRUE') !== 'FALSE').forEach(r=>{ const n=String(r.name||'').trim(); if(n && !['術式装備','バッグ','矢筒','食材'].includes(n)) names.add(n); });
  (state.items || []).filter(r=>String(r.dataKind||'アイテム').trim()!=='素材' && String(r.itemType||'').trim()!=='食材').forEach(r=>{ const n=adminBroadItemType(r); if(n) names.add(n); });
  if((state.items||[]).some(r=>['バッグ','矢筒'].includes(String(r.itemType||'').trim()))) names.add('収納具');
  const ordered=ADMIN_ITEM_TYPE_PREFERRED_ORDER.filter(v=>names.has(v));
  [...names].filter(v=>!ordered.includes(v)).sort((a,b)=>a.localeCompare(b,'ja',{numeric:true})).forEach(v=>ordered.push(v));
  return ordered;
}
function adminItemCategories(itemType=currentItemTypeView){
  const names=new Set();
  if(itemType==='収納具'){
    (state.items||[]).filter(r=>String(r.dataKind||'アイテム').trim()!=='素材' && ['バッグ','矢筒'].includes(String(r.itemType||'').trim())).forEach(r=>names.add(String(r.itemType).trim()));
  }else if(itemType==='全て'){
    (state.item_categories||[]).filter(r=>String(r.enabled??'TRUE')!=='FALSE').forEach(r=>{const n=String(r.name||'').trim();if(n)names.add(n);});
    (state.items||[]).filter(r=>String(r.dataKind||'アイテム').trim()!=='素材' && String(r.itemType||'').trim()!=='食材').forEach(r=>{const n=adminItemInternalCategory(r,'全て');if(n)names.add(n);});
  }else{
    (state.item_categories||[]).filter(r=>String(r.itemType||'').trim()===itemType && String(r.enabled??'TRUE')!=='FALSE').forEach(r=>{const n=String(r.name||'').trim();if(n)names.add(n);});
    (state.items||[]).filter(r=>String(r.dataKind||'アイテム').trim()!=='素材' && String(r.itemType||'').trim()!=='食材' && adminBroadItemType(r)===itemType).forEach(r=>{const n=adminItemInternalCategory(r,itemType);if(n)names.add(n);});
  }
  return [...names].sort((a,b)=>a.localeCompare(b,'ja',{numeric:true}));
}
function adminMaterialTypes(){
  const names=new Set(['食材']);
  (state.material_types||[]).filter(r=>String(r.enabled??'TRUE')!=='FALSE').forEach(r=>{const n=String(r.name||'').trim();if(n)names.add(n);});
  (state.items||[]).filter(r=>String(r.dataKind||'').trim()==='素材').forEach(r=>{const n=canonicalMaterialTypeName(r.materialType);if(n)names.add(n);});
  const ordered=ADMIN_MATERIAL_TYPE_PREFERRED_ORDER.filter(v=>names.has(v));
  [...names].filter(v=>!ordered.includes(v)).sort((a,b)=>a.localeCompare(b,'ja',{numeric:true})).forEach(v=>ordered.push(v));
  return ordered;
}
function adminMaterialCategories(materialType=currentMaterialTypeView){
  const names=new Set();
  if(materialType==='食材'){
    (state.items||[]).filter(r=>String(r.dataKind||'アイテム').trim()!=='素材' && String(r.itemType||'').trim()==='食材').forEach(r=>{const n=String(r.itemCategory||'').trim();if(n)names.add(n);});
  }else{
    (state.material_categories||[]).filter(r=>(materialType==='全て'||canonicalMaterialTypeName(r.materialType)===materialType) && String(r.enabled??'TRUE')!=='FALSE').forEach(r=>{const n=String(r.name||'').trim();if(n)names.add(n);});
    (state.items||[]).filter(r=>String(r.dataKind||'').trim()==='素材' && (materialType==='全て'||canonicalMaterialTypeName(r.materialType)===materialType)).forEach(r=>{const n=String(r.materialCategory||'').trim();if(n)names.add(n);});
    if(materialType==='全て') (state.items||[]).filter(r=>String(r.itemType||'').trim()==='食材').forEach(r=>{const n=String(r.itemCategory||'').trim();if(n)names.add(n);});
  }
  return [...names].sort((a,b)=>a.localeCompare(b,'ja',{numeric:true}));
}
function adminModalSelectHtml(id, dataAttr, values, current, ariaLabel){
  const opts=[...new Set(values.map(v=>String(v||'').trim()).filter(Boolean))];
  return `<select id="${escapeHtml(id)}" ${dataAttr} aria-label="${escapeHtml(ariaLabel)}">${opts.map(v=>`<option value="${escapeHtml(v)}" ${v===current?'selected':''}>${escapeHtml(v)}</option>`).join('')}</select>`;
}
function renderRecordItemTypeTabs(){
  const area=$('recordItemTypeTabs'); if(!area)return;
  const types=['全て',...adminAllItemTypes()];
  if(!types.includes(currentItemTypeView)) currentItemTypeView='全て';
  area.innerHTML=adminModalSelectHtml('recordItemTypeSelect','data-record-item-type-select',types,currentItemTypeView,'アイテム種別を選択');
}
function renderRecordInternalCategoryTabs(){
  const block=$('recordInternalCategoryBlock');
  const typeArea=$('recordMaterialTypeTabs');
  const categoryArea=$('recordInternalCategoryTabs');
  const label=$('recordInternalCategoryLabel');
  if(!block||!typeArea||!categoryArea)return;
  const isItems=currentMainTab==='items';
  const isMaterials=currentMainTab==='materials';
  block.classList.toggle('hidden', !(isItems||isMaterials));
  if(!(isItems||isMaterials)) return;
  if(isItems){
    typeArea.innerHTML='';
    categoryArea.classList.remove('hidden');
    const categories=adminItemCategories(currentItemTypeView);
    if(currentItemCategoryView!=='全て'&&!categories.includes(currentItemCategoryView))currentItemCategoryView='全て';
    label.textContent=`${currentItemTypeView==='全て'?'アイテム':currentItemTypeView} / 小カテゴリ`;
    categoryArea.innerHTML=adminModalSelectHtml('recordItemCategorySelect','data-record-item-category-select',['全て',...categories],currentItemCategoryView,'アイテム小カテゴリを選択');
  }else{
    const types=adminMaterialTypes();
    if(currentMaterialTypeView!=='全て'&&!types.includes(currentMaterialTypeView))currentMaterialTypeView='全て';
    const categories=adminMaterialCategories(currentMaterialTypeView);
    if(currentMaterialCategoryView!=='全て'&&!categories.includes(currentMaterialCategoryView))currentMaterialCategoryView='全て';
    label.textContent='素材種別 / 小カテゴリ';
    typeArea.innerHTML=adminModalSelectHtml('recordMaterialTypeSelect','data-record-material-type-select',['全て',...types],currentMaterialTypeView,'素材種別を選択');
    categoryArea.classList.remove('hidden');
    categoryArea.innerHTML=adminModalSelectHtml('recordMaterialCategorySelect','data-record-material-category-select',['全て',...categories],currentMaterialCategoryView,'素材小カテゴリを選択');
  }
}
function updateItemViewUi(){
  const allTypes=currentItemTypeView==='全て';
  const title=$('itemViewTitle'); if(title) title.textContent=allTypes?'アイテム':(currentItemTypeView||'未分類');
  const desc=$('itemViewDescription'); if(desc) desc.textContent=currentItemCategoryView==='全て' ? `${allTypes?'アイテム':currentItemTypeView}をすべて表示しています。` : `${allTypes?'全アイテム':currentItemTypeView} / ${currentItemCategoryView}だけを表示しています。`;
  const add=$('itemViewAddButton'); if(add) add.textContent=allTypes?'アイテムを新規登録':`${currentItemTypeView}を新規登録`;
}
function updateCounts(){
  const it=state.item_types.length, ic=state.item_categories.length, mt=state.material_types.length, mc=state.material_categories.length, mr=state.material_ranks.length;
  const ec=state.equipment_categories.length;
  const itemCount=state.items.filter(r=>String(r.dataKind||'アイテム').trim()!=='素材' && String(r.itemType||'').trim()!=='食材').length;
  const materialCount=state.items.filter(r=>String(r.dataKind||'').trim()==='素材' || String(r.itemType||'').trim()==='食材').length;
  const rc=(state.recipes||[]).length, sp=state.spells.length, sk=(state.skills||[]).length, qr=state.quest_rewards.length;
  const q=(state.quests||[]).length, ar=(state.exploration_areas||[]).length, ev=(state.event_tables||[]).length, mo=(state.monsters||[]).length;
  $('countItemTypes').textContent=it; $('countItemCategories').textContent=ic; $('countMaterialTypes').textContent=mt; $('countMaterialCategories').textContent=mc; if($('countMaterialRanks')) $('countMaterialRanks').textContent=mr;
  $('countEquipCategories').textContent=ec; $('countItems').textContent=itemCount; if($('countMaterials')) $('countMaterials').textContent=materialCount; if($('countRecipes')) $('countRecipes').textContent=rc; $('countSpells').textContent=sp; if($('countSkills')) $('countSkills').textContent=sk; $('countRewards').textContent=qr;
  if($('countQuests')) $('countQuests').textContent=q; if($('countAreas')) $('countAreas').textContent=ar; if($('countEvents')) $('countEvents').textContent=ev; if($('countMonsters')) $('countMonsters').textContent=mo;
  $('countTotal').textContent=it+ic+mt+mc+mr+ec+itemCount+materialCount+rc+sp+sk+qr+q+ar+ev+mo;
}
function recalculateSkillProbabilities(){
  const rows=Array.isArray(state.skills)?state.skills:[];
  const totals={};
  rows.forEach(row=>{const rank=Math.max(1,Number(row.rank)||1);if(String(row.enabled??'TRUE').toUpperCase()==='FALSE')return;totals[rank]=(totals[rank]||0)+Math.max(0,Number(row.drawWeight)||0);});
  rows.forEach(row=>{const rank=Math.max(1,Number(row.rank)||1);const total=totals[rank]||0;row.probability=total>0?Number(((Math.max(0,Number(row.drawWeight)||0)/total)*100).toFixed(6)):0;});
}
function renderCurrentPanel(){
  if(currentMainTab==='categories'){
    const key=currentCategoryTab||'item_types';
    applySharedSearchToKey(key);
    renderTable(key);
    return;
  }
  if(TABLE_KEYS.includes(currentMainTab)){
    applySharedSearchToKey(currentMainTab);
    renderTable(currentMainTab);
    return;
  }
  if(currentMainTab==='facilities'){ renderFacilitiesPanel(); return; }
  if(currentMainTab==='help'){ renderHelpPanel(); }
}
function renderAll(){
  recalculateSkillProbabilities();
  window.RA_SKILL_MASTER={skills:Array.isArray(state.skills)?state.skills:[]};
  renderRecordItemTypeTabs();
  renderRecordInternalCategoryTabs();
  updateItemViewUi();
  updateMaterialViewUi();
  updateCounts();
  renderCurrentPanel();
  renderGlobalDataSearch();
}
function normalizeCellValue(v){ return String(v ?? '').trim(); }
function compareValues(a,b){
  const av=normalizeCellValue(a), bv=normalizeCellValue(b);
  const an=Number(String(av).replace(/^\+/,'')), bn=Number(String(bv).replace(/^\+/,''));
  const aIsNum=av!=='' && !Number.isNaN(an), bIsNum=bv!=='' && !Number.isNaN(bn);
  if(aIsNum && bIsNum) return an-bn;
  return av.localeCompare(bv, 'ja', {numeric:true, sensitivity:'base'});
}
function baseKeyForTable(key){ return key==='materials' ? 'items' : key; }
function schemaForTable(key){ return SCHEMA[baseKeyForTable(key)] || []; }
function dataKindForTable(key){ return key==='materials' ? '素材' : (key==='items' ? 'アイテム' : ''); }
function indexedRowsForTable(key){
  const base=baseKeyForTable(key);
  const want=dataKindForTable(key);
  return (state[base]||[]).map((row,idx)=>({row,idx})).filter(({row})=>{
    if(!want) return true;
    const kind=String(row.dataKind||'アイテム').trim() || 'アイテム';
    if(want==='素材'){
      const isMaterial=kind==='素材';
      const isFood=kind!=='素材' && String(row.itemType||'').trim()==='食材';
      if(!isMaterial && !isFood) return false;
      if(currentMaterialTypeView==='食材') return isFood;
      if(currentMaterialTypeView!=='全て') return isMaterial && canonicalMaterialTypeName(row.materialType)===currentMaterialTypeView;
      return true;
    }
    if(kind==='素材' || String(row.itemType||'').trim()==='食材') return false;
    if(currentItemTypeView && currentItemTypeView!=='全て' && adminBroadItemType(row)!==currentItemTypeView) return false;
    return true;
  });
}
function rerenderTableGroup(key){
  const base=baseKeyForTable(key);
  if(base==='items'){
    renderRecordItemTypeTabs();
    renderRecordInternalCategoryTabs();
    updateItemViewUi();
    updateMaterialViewUi();
    if(currentMainTab==='items') renderTable('items');
    else if(currentMainTab==='materials') renderTable('materials');
    else if(currentMainTab==='facilities') renderFacilitiesPanel();
  }else{
    const visibleTable=(currentMainTab==='categories'&&currentCategoryTab===key)||currentMainTab===key;
    if(visibleTable) renderTable(key);
    else if(currentMainTab==='facilities' && ['recipes','spells','skills','quest_rewards','quests','exploration_areas','event_tables','treasure_tables','appraisal_rules'].includes(key)) renderFacilitiesPanel();
  }
  if(currentMainTab==='help') renderHelpPanel();
}
function uniqueOptions(key, field){
  const set=new Set();
  indexedRowsForTable(key).forEach(({row})=>{
    const v=normalizeCellValue(row[field]);
    if(v) set.add(v);
  });
  return [...set].sort((a,b)=>compareValues(a,b));
}



function fieldText(row={}, field){
  return String(row[field] ?? '').trim();
}
function warehouseKindForRow(row={}, key=''){
  if(baseKeyForTable(key)==='spells') return '術式';
  const dataKind = fieldText(row,'dataKind');
  const itemType = fieldText(row,'itemType');
  const materialType = fieldText(row,'materialType');
  if(key === 'materials' || dataKind === '素材' || materialType) return '素材';
  if(itemType === '武器') return '武器';
  if(['防具','盾','装飾品'].includes(itemType)) return itemType;
  if(itemType === 'バッグ') return 'バッグ';
  if(itemType === '矢筒') return '矢筒';
  if(itemType === '術式装備') return ['魔導書','祈祷書'].includes(String(row.itemCategory||'')) ? '武器' : 'スクロール';
  if(itemType === '食材') return '食材';
  if(itemType === '重要アイテム') return '重要アイテム';
  if(itemType === '調合品' || itemType === '道具' || itemType === '特殊矢弾') return 'アイテム';
  return dataKind || itemType || 'アイテム';
}
function warehouseCategoryForRow(row={}, key=''){
  return fieldText(row,'itemCategory') || fieldText(row,'materialCategory') || fieldText(row,'category');
}
function warehouseCopyLine(label, value){
  const v = String(value ?? '').trim();
  return v ? `${label}：${v}` : '';
}
function adminItemSellPriceText(value){
  const raw=String(value ?? '').trim();
  if(!raw) return '';
  const n=Number(raw);
  return Number.isFinite(n)&&n===0 ? '売却不可' : `${raw}G`;
}
function isUpgradeableEquipmentRow(row={}, key=''){
  const kind = warehouseKindForRow(row, key);
  if(!['武器','防具','盾'].includes(kind)) return false;
  return true;
}
const STANDARD_UPGRADE_EFFECT_NAMES=new Set(['威力強化','威力固定強化','命中強化','防御強化','防御行動強化','回避強化','抵抗強化','副手追撃強化','術式枠拡張','術式省力化','回復量強化','回復量固定強化','最大スタック拡張','HP強化','MP強化','力業補助','魔法補助','祈祷補助']);
function isSpecialUpgradeMaterial(row={}){
  const effect=fieldText(row,'equipmentUpgradeEffect');
  return !!effect&&!STANDARD_UPGRADE_EFFECT_NAMES.has(effect);
}
function equipmentUpgradeDisplayName(row={}){
  return fieldText(row,'equipmentUpgradeEffect');
}
function facilityUpgradeSearchText(row={}){
  return [row.name,row.id,row.publicId,row.dataKind,row.itemType,row.itemCategory,row.materialType,row.materialCategory,row.rank,row.skill,row.power,row.element,row.description,row.effect,row.equipmentUpgradeEffect,row.equipmentUpgradeDetail,row.equipmentUpgradeTarget,row.tags,row.usageTags].filter(Boolean).join(' ').toLowerCase();
}
function facilityUpgradeSearchMatches(row={},query=''){
  const q=String(query||'').trim().toLowerCase();
  return !q || q.split(/\s+/).filter(Boolean).every(word=>facilityUpgradeSearchText(row).includes(word));
}
function buildPlayerItemInfoText(row={}, key='', count='1'){
  const name = fieldText(row,'name') || fieldText(row,'id') || '名称未設定';
  const kind = warehouseKindForRow(row, key);
  const category = warehouseCategoryForRow(row, key);
  const publicId = fieldText(row,'publicId');
  const lines = [];
  lines.push(`【${name}】`);
  lines.push(warehouseCopyLine('登録ID', publicId));
  lines.push(warehouseCopyLine('個数', count || '1'));
  lines.push(warehouseCopyLine('ランク', playerRankLabel(row.rank)));
  const categoryLabel = kind === '素材'
    ? [fieldText(row,'materialType') || '素材', category].filter(Boolean).join(' / ')
    : [kind, category].filter(Boolean).join(' / ');
  lines.push(warehouseCopyLine('分類', categoryLabel));
  lines.push(warehouseCopyLine('買値', fieldText(row,'buyPrice') ? fieldText(row,'buyPrice')+'G' : ''));
  lines.push(warehouseCopyLine('売値', adminItemSellPriceText(fieldText(row,'sellPrice'))));

  const useInfo = [];
  if(['武器','防具','盾','装飾品','バッグ','矢筒','術式'].includes(kind)){
    if(fieldText(row,'equipSlot')) useInfo.push(`装備枠 ${fieldText(row,'equipSlot')}`);
  }
  if(fieldText(row,'power')) useInfo.push(`威力 ${fieldText(row,'power')}`);
  const modifierSummary = adminModifierDisplayText(fieldText(row,'modifiers'));
  if(modifierSummary) useInfo.push(`補正 ${modifierSummary}`);
  if(fieldText(row,'offhandBonus') || fieldText(row,'offhand')) useInfo.push(`副手追撃 ${fieldText(row,'offhandBonus') || fieldText(row,'offhand')}`);
  if(fieldText(row,'reloadTurns')) useInfo.push(`装填 ${fieldText(row,'reloadTurns')}ターン`);
  if(isUpgradeableEquipmentRow(row,key) && fieldText(row,'upgradeLimit')) useInfo.push(`強化枠上限 ${fieldText(row,'upgradeLimit')}`);
  if(fieldText(row,'mpCost') || fieldText(row,'cost')) useInfo.push(`コスト ${fieldText(row,'mpCost') || fieldText(row,'cost')}`);
  if(fieldText(row,'target')) useInfo.push(`対象 ${fieldText(row,'target')}`);
  if(fieldText(row,'checkType')) useInfo.push(`判定 ${fieldText(row,'checkType')}`);
  if(fieldText(row,'element')) useInfo.push(`属性 ${fieldText(row,'element')}`);
  if(fieldText(row,'role')) useInfo.push(`役割 ${fieldText(row,'role')}`);
  if(fieldText(row,'setItem')) useInfo.push(`必要装備 ${fieldText(row,'setItem')}`);
  if(fieldText(row,'ammoKind')) useInfo.push(`矢弾種別 ${fieldText(row,'ammoKind')}`);
  if(fieldText(row,'compatibleWeaponTypes')) useInfo.push(`対応武器種 ${fieldText(row,'compatibleWeaponTypes')}`);
  if(fieldText(row,'maxStack')) useInfo.push(`最大スタック ${fieldText(row,'maxStack')}`);
  if(fieldText(row,'quiverCapacity')) useInfo.push(`矢筒収納 ${fieldText(row,'quiverCapacity')}種類`);
  if(fieldText(row,'bagCapacity')) useInfo.push(`バッグ容量 ${fieldText(row,'bagCapacity')}`);
  if(useInfo.length) lines.push('性能：' + useInfo.join(' / '));

  lines.push(warehouseCopyLine('説明', fieldText(row,'description')));
  const isMonsterMaterial = kind === '素材' && fieldText(row,'materialType') === '魔物素材';
  if(isMonsterMaterial){
    lines.push(warehouseCopyLine('強化対象', fieldText(row,'equipmentUpgradeTarget')));
    lines.push(warehouseCopyLine('装備強化内容', equipmentUpgradeDisplayName(row)));
    lines.push(warehouseCopyLine('消費強化枠', fieldText(row,'equipmentUpgradeSlotCost') ? fieldText(row,'equipmentUpgradeSlotCost')+'枠' : ''));
    lines.push(warehouseCopyLine('効果説明', fieldText(row,'equipmentUpgradeDetail')));
  }else{
    lines.push(warehouseCopyLine('効果', fieldText(row,'effect')));
  }
  return lines.filter(Boolean).join('\n');
}

function buildRecipeInfoText(row={}){
  const name = fieldText(row,'resultItem') || fieldText(row,'name') || fieldText(row,'id') || '名称未設定';
  const resultKind = fieldText(row,'resultKind');
  const category = fieldText(row,'category');
  const lines = [];
  lines.push(`【${name}のレシピ】`);
  lines.push(warehouseCopyLine('登録ID', fieldText(row,'publicId')));
  lines.push(warehouseCopyLine('完成数', fieldText(row,'resultCount') || '1'));
  lines.push(warehouseCopyLine('ランク', playerRankLabel(row.rank)));
  lines.push(warehouseCopyLine('販売価格', fieldText(row,'recipePrice') ? fieldText(row,'recipePrice')+'G' : ''));
  lines.push(warehouseCopyLine('売値', fieldText(row,'recipeSellPrice') ? fieldText(row,'recipeSellPrice')+'G' : ''));
  lines.push(warehouseCopyLine('レシピ入手先', fieldText(row,'recipeSource')));
  lines.push(warehouseCopyLine('製作区分', fieldText(row,'craftType')));
  lines.push(warehouseCopyLine('分類', [resultKind, category].filter(Boolean).join(' / ')));
  lines.push(warehouseCopyLine('使用技能', fieldText(row,'craftSkill') || recipeSkillForCraftType(fieldText(row,'craftType'))));
  lines.push(warehouseCopyLine('素材', fieldText(row,'requiredMaterials')));
  adminCraftingRouteLines(row).forEach(line=>lines.push(line));
  lines.push('自作：レシピ必須');
  lines.push(warehouseCopyLine('施設依頼', fieldText(row,'price') ? `レシピ不要 / ${fieldText(row,'price')}G` : 'レシピ不要'));
  lines.push(warehouseCopyLine('説明', fieldText(row,'description')));
  lines.push(warehouseCopyLine('効果', fieldText(row,'effect')));
  return lines.filter(Boolean).join('\n');
}
function buildCopyCardText(row={}, key=''){
  if(baseKeyForTable(key)==='recipes') return buildRecipeInfoText(row);
  return buildPlayerItemInfoText(row, key, '1');
}
async function copyRowCard(key, idx){
  const base = baseKeyForTable(key);
  const row = (state[base] || [])[idx];
  if(!row){ toast('コピー対象が見つかりません', 'error'); return; }
  const text = buildCopyCardText(row, key);
  if(await copyAdminTextDirect(text)) toast(`${row.name || 'データ'}のプレイヤー向け情報をコピーしました`);
}

async function copyRowPublicId(key, idx){
  const base=baseKeyForTable(key);
  const row=(state[base]||[])[idx];
  if(!row){toast('コピー対象が見つかりません','error');return;}
  const publicId=fieldText(row,'publicId');
  if(!publicId){toast(`${row.name||'データ'}には登録IDがありません`,'warn');return;}
  if(await copyAdminTextDirect(publicId))toast(`${row.name||'データ'}の登録IDだけをコピーしました`);
}
function idOnlyCopyButtonHtml(key,idx){
  return ['items','materials'].includes(key)?`<button type="button" class="secondary" data-copy-public-id="${key}:${idx}">IDのみコピー</button>`:'';
}



function normalizeAdminSearchText(value){
  return String(value??'').normalize('NFKC').toLowerCase().replace(/[　\s]+/g,' ').trim();
}
function adminSearchTokens(query){
  return normalizeAdminSearchText(query).split(' ').filter(Boolean);
}
function adminRowSearchText(key,row={}){
  const rank=String(row.rank??'').trim();
  const extras=[labelKey(key),rank?`★${rank}`:'',row.name,row.publicId,row.id,row.itemType,row.itemCategory,row.materialType,row.materialCategory,row.craftType,row.category,row.baseItem,row.resultItem,row.areaName,row.questCategory,row.questType,row.eventName,row.tableId,row.monsterType,row.unlockAreaKey,row.unlockFacility];
  return normalizeAdminSearchText(`${extras.filter(Boolean).join(' ')} ${JSON.stringify(row)}`);
}
function rowMatchesTextQuery(row,query,key=''){
  const tokens=adminSearchTokens(query);
  if(!tokens.length)return true;
  const hay=adminRowSearchText(key,row);
  return tokens.every(token=>hay.includes(token));
}
function renderFilterControls(key){
  const panel=$('panel-'+key);
  if(!panel) return;
  let bar=$('advanced-filter-'+key);
  if(!bar){
    bar=document.createElement('details');
    bar.id='advanced-filter-'+key;
    bar.className='advanced-filters';
    const toolbar=panel.querySelector('.toolbar');
    toolbar.insertAdjacentElement('afterend', bar);
  }
  const ui=tableUiState[key];
  const filters=ADVANCED_FILTERS[key]||[];
  const controls=filters.map(f=>{
    const current=ui.filters[f.field] || '';
    const opts=uniqueOptions(key, f.field);
    return `<div><label>${escapeHtml(f.label || LABELS[f.field] || f.field)}</label><select data-adv-filter="${key}:${f.field}"><option value="">全て</option>${opts.map(v=>`<option value="${escapeHtml(v)}" ${v===current?'selected':''}>${escapeHtml(['rank','treasureRank','scrollRank','spellRank','toolRank','upgradeMaterialMinRank','guaranteeUpgradeMaxRank'].includes(f.field)?playerRankLabel(v):v)}</option>`).join('')}</select></div>`;
  }).join('');
  const activeFilterCount=Object.values(ui.filters || {}).filter(Boolean).length;
  const sortLabel=ui.sortField ? `${LABELS[ui.sortField]||ui.sortField} ${ui.sortDir==='asc'?'昇順':'降順'}` : '未指定';
  const shouldOpen = activeFilterCount > 0 || !!ui.sortField || bar.open;
  bar.open = !!shouldOpen;
  bar.innerHTML = `
    <summary>
      <span>絞り込み・ソート</span>
      <span class="filter-status">
        <span class="pill" id="filtered-count-${key}">表示 0 / 0</span>
        <span class="pill">絞り込み:${activeFilterCount}件</span>
        <span class="pill">ソート:${escapeHtml(sortLabel)}</span>
      </span>
    </summary>
    <div class="advanced-filter-body">
      <div class="filter-grid">${controls || '<span class="notice">この表には追加フィルターはありません。</span>'}</div>
      <div class="filter-actions">
        <button class="ghost" data-clear-filters="${key}">絞り込み解除</button>
        <button class="ghost" data-clear-sort="${key}">ソート解除</button>
        <span class="notice">検索語はこの一覧だけに適用します。分類をまたいで探す場合は画面上部の「全データ横断検索」を使ってください。</span>
      </div>
    </div>`;
}
function renderTablePagination(key, filteredCount, totalCount){
  const panel=$('panel-'+key); if(!panel)return;
  let bar=$('pagination-'+key);
  if(!bar){
    bar=document.createElement('div');
    bar.id='pagination-'+key;
    bar.className='table-pagination';
    const wrap=panel.querySelector('.table-wrap');
    if(wrap)wrap.insertAdjacentElement('beforebegin',bar);
  }
  const ui=tableUiState[key];
  const size=Math.max(1,Number(ui.pageSize)||100);
  const pages=Math.max(1,Math.ceil(filteredCount/size));
  ui.page=Math.min(Math.max(1,Number(ui.page)||1),pages);
  const start=filteredCount?(ui.page-1)*size+1:0;
  const end=Math.min(filteredCount,ui.page*size);
  bar.innerHTML=`<span class="notice">表示 ${start}–${end} / ${filteredCount}件（全${totalCount}件）</span><button type="button" class="ghost" data-table-page="${key}:prev" ${ui.page<=1?'disabled':''}>前へ</button><span>${ui.page} / ${pages}</span><button type="button" class="ghost" data-table-page="${key}:next" ${ui.page>=pages?'disabled':''}>次へ</button>`;
}
function paginateTableRows(key, rows, totalCount){
  const ui=tableUiState[key];
  const size=Math.max(1,Number(ui.pageSize)||100);
  const pages=Math.max(1,Math.ceil(rows.length/size));
  ui.page=Math.min(Math.max(1,Number(ui.page)||1),pages);
  renderTablePagination(key,rows.length,totalCount);
  const start=(ui.page-1)*size;
  return rows.slice(start,start+size);
}
function resetTablePage(key){ if(tableUiState[key])tableUiState[key].page=1; }
function rowMatchesAdvancedFilters(key, row){
  const filters=tableUiState[key].filters || {};
  return Object.entries(filters).every(([field,value])=> !value || normalizeCellValue(row[field]) === value);
}
function activeRecipeCraftType(){
  return currentRecipeView || '全て';
}
function recipeViewKeyForCraftType(craftType){
  const type=normalizeCellValue(craftType);
  for(const [key,meta] of Object.entries(RECIPE_VIEW_META)){
    if(Array.isArray(meta.types) && meta.types.map(normalizeCellValue).includes(type)) return key;
  }
  return 'その他';
}
function rowMatchesRecipeView(row){
  const view = activeRecipeCraftType();
  const meta = RECIPE_VIEW_META[view];
  if(!meta || !Array.isArray(meta.types)) return true;
  const type=normalizeCellValue(row.craftType);
  return meta.types.map(normalizeCellValue).includes(type);
}
function updateRecipeViewUi(){
  const view = activeRecipeCraftType();
  const meta = RECIPE_VIEW_META[view] || {title:view||'レシピ',description:'レシピを管理します。',defaultCraftType:''};
  const title = $('recipeViewTitle'); if(title) title.textContent = meta.title;
  const desc = $('recipeViewDescription'); if(desc) desc.textContent = meta.description;
  const add = $('recipeAddButton');
  if(add){
    const defaultType=String(meta.defaultCraftType||'');
    add.dataset.addRecipeCraft = defaultType;
    add.textContent = view==='全て' ? 'レシピを新規登録' : `${meta.title}を新規登録`;
  }
}
function visibleHeadersForTable(key){
  const primary = FORM_PRIMARY_FIELDS[key] || FORM_PRIMARY_FIELDS[baseKeyForTable(key)] || [];
  const schema = schemaForTable(key);
  const fixed = ['id', ...primary, 'updatedAt'];
  return [...new Set(fixed)].filter(h=>schema.includes(h));
}

function monsterFieldValue(row, field, empty='-'){
  const v = row && row[field] !== undefined && row[field] !== null ? String(row[field]).trim() : '';
  return v || empty;
}
function monsterBadge(label, value){
  const v = String(value || '').trim();
  return v ? `<span class="monster-badge">${escapeHtml(label)} ${escapeHtml(v)}</span>` : '';
}
function monsterStat(label, value){
  return `<div class="monster-stat"><span>${escapeHtml(label)}</span><b>${escapeHtml(String(value || '-'))}</b></div>`;
}
function monsterAffinity(label, value){
  const v = String(value || '').trim() || '-';
  return `<span class="monster-affinity"><span>${escapeHtml(label)}</span>${escapeHtml(v)}</span>`;
}
function monsterTextSection(title, value){
  const v = String(value || '').trim();
  if(!v) return '';
  return `<section class="monster-section"><h4>${escapeHtml(title)}</h4><div class="monster-text-block">${escapeHtml(v)}</div></section>`;
}
function renderMonsterActionCards(value){
  const rows = parseMonsterActions(value);
  if(!rows.length) return '<div class="monster-empty-note">行動は未登録です。</div>';
  return `<div class="monster-mini-table">${rows.map(r=>{
    const title = r.name || '名称未設定の行動';
    const hasCheck=String(r.checkType||'').trim() && String(r.checkType||'').trim()!=='なし';
    const chips = [r.actionType ? `種別:${r.actionType}` : '', r.range ? `距離:${normalizeMonsterActionRange(r)}` : '', r.flags ? `特性:${r.flags}` : '', r.checkType, hasCheck ? `基礎技能:${normalizeMonsterActionBaseValue(r.baseValue)}` : '', r.target ? `対象:${r.target}` : '', r.element ? `属性:${r.element}` : '', r.power ? `威力:${r.power}` : ''].filter(Boolean);
    return `<div class="monster-action-card"><div class="monster-action-main"><span>${escapeHtml(title)}</span>${chips.map(c=>`<span class="monster-badge">${escapeHtml(c)}</span>`).join('')}</div>${r.effect ? `<div class="monster-action-sub">${escapeHtml(r.effect)}</div>` : ''}</div>`;
  }).join('')}</div>`;
}

function materialDetailForDrop(row={}){
  return findMaterialForDrop(row);
}
function productPriceNumberText(row={}){
  const p = String(row.sellPrice ?? '').trim();
  if(!p) return '';
  return `${p}G`;
}
function dropMaterialDetailText(material){
  if(!material) return [];
  const lines = [];
  const rank = playerRankLabel(material.rank);
  const type = String(material.materialType || '').trim();
  const category = String(material.materialCategory || '').trim();
  const price = productPriceNumberText(material);
  const desc = String(material.description || '').trim();
  const effect = String(material.effect || '').trim();
  if(rank || type || category || price) lines.push(['ランク:' + rank, type, category, price ? '売値:' + price : ''].filter(v=>v && !v.endsWith(':')).join(' / '));
  if(desc) lines.push('説明：' + desc);
  if(effect) lines.push('効果：' + effect);
  return lines;
}
function dropMaterialDetailHtml(material){
  const lines = dropMaterialDetailText(material);
  if(!lines.length) return '';
  return `<div class="monster-drop-detail">${lines.map(line=>`<div>${escapeHtml(line)}</div>`).join('')}</div>`;
}
function dropMaterialOutputBlock(row={}){
  const material = materialDetailForDrop(row);
  const name = row.itemName || row.itemId || material?.name || '名称未設定';
  const count = row.count ? ` ${row.count}` : '';
  const base = `- ${name}${count}`;
  const detail = dropMaterialDetailText(material);
  return [base, ...detail.map(line=>'  ' + line)].join('\n');
}
const ITEM_RANKS = []; // 数値ランクは1以上で上限なし。
const UPGRADE_STEP_RULES = [
  {step:1, usedSlots:0, label:'現在0枠使用'},
  {step:2, usedSlots:1, label:'現在1枠使用'},
  {step:3, usedSlots:2, label:'現在2枠使用'},
  {step:4, usedSlots:3, label:'現在3枠使用'},
  {step:5, usedSlots:4, label:'現在4枠使用'},
  {step:6, usedSlots:5, label:'現在5枠以上使用'}
];
const UPGRADE_COUNT_RULES = [
  {value:0,label:'まだ強化していない'},
  {value:1,label:'現在1回強化済み'},
  {value:2,label:'現在2回強化済み'},
  {value:3,label:'現在3回強化済み'},
  {value:4,label:'現在4回強化済み'},
  {value:5,label:'現在5回以上強化済み'}
];
function materialRankDifficulty(rank=''){
  const n=numericRankValueIncludingLegacyMaterialGrade(rank,'');
  return n ? 5 + n * 2 : '';
}
function knownToolRanks(...extra){
  const values=new Set();
  (state.items||[]).forEach(r=>{const n=numericRankValueIncludingLegacyMaterialGrade(r.toolRank,'');if(n)values.add(n);});
  extra.forEach(v=>{const n=numericRankValueIncludingLegacyMaterialGrade(v,'');if(n)values.add(n);});
  if(!values.size)[3,6,9,12,15].forEach(v=>values.add(v));
  return [...values].sort((a,b)=>a-b);
}
function normalizeToolRank(value='', fallback=3){
  return numericRankValueIncludingLegacyMaterialGrade(value,fallback);
}
function toolRowsForSelect(id=''){
  const category=String(id).includes('Alchemy')?'調合':String(id).includes('Smith')?'鍛冶':'';
  return (state.items||[]).filter(r=>String(r.itemType||'').trim()==='道具' && (!category || String(r.itemCategory||'').trim()===category) && String(r.toolRank??'').trim()).sort((a,b)=>normalizeToolRank(a.toolRank,999)-normalizeToolRank(b.toolRank,999));
}
function toolRankOptionsHtml(selected=3,id=''){
  const current=normalizeToolRank(selected,3), rows=toolRowsForSelect(id);
  if(rows.length)return rows.map(r=>{const cap=normalizeToolRank(r.toolRank,3);return `<option value="${cap}" ${cap===current?'selected':''}>${escapeHtml(r.name||'道具')}（${escapeHtml(playerRankLabel(cap))}以下）</option>`;}).join('');
  return knownToolRanks(current).map(r=>`<option value="${r}" ${r===current?'selected':''}>${escapeHtml(playerRankLabel(r))}以下</option>`).join('');
}
function renderToolRankSelect(id='', selected=3){
  const sel=$(id); if(!sel)return;
  const rows=toolRowsForSelect(id), fallback=rows.length?normalizeToolRank(rows[0].toolRank,3):3;
  const prev=normalizeToolRank(sel.value || selected,fallback);
  sel.innerHTML=toolRankOptionsHtml(prev,id);
  sel.value=[...sel.options].some(o=>o.value===String(prev))?String(prev):(sel.options[0]?.value||String(fallback));
  syncFacilityUpgradePickerButton(sel);
}
function selectedToolText(id=''){
  const sel=$(id); return sel?.selectedOptions?.[0]?.textContent || `${playerRankLabel(normalizeToolRank(sel?.value,3))}以下`;
}
function toolCapabilityCheck(targetRank=1, toolMaxRank=3){
  const target=normalizeToolRank(targetRank,1), max=normalizeToolRank(toolMaxRank,3);
  return {usable:max>=target,targetRank:target,maxRank:max};
}
function toolDifficultyReduction(targetRank=1,toolMaxRank=3){
  const required=adminCraftingRequiredToolRank(targetRank);
  const max=normalizeToolRank(toolMaxRank,3);
  if(max<required) return {usable:false,requiredRank:required,maxRank:max,reduction:0};
  return {usable:true,requiredRank:required,maxRank:max,reduction:Math.max(0,Math.floor((max-required)/3)*2)};
}
function finalDifficultyText(baseDifficulty='', ...mods){
  const raw=String(baseDifficulty||'').trim(), base=Number(raw);
  if(raw==='')return '未設定';
  if(!Number.isFinite(base))return raw;
  const total=mods.reduce((sum,m)=>sum+(Number(m)||0),base);
  return String(Math.max(1,Math.ceil(total)));
}
function upgradeStepRule(stepValue='1'){
  const n=Number(String(stepValue||'1').trim());
  return UPGRADE_STEP_RULES.find(r=>r.step===n)||UPGRADE_STEP_RULES[0];
}
function renderUpgradeStepSelect(selected='1'){
  const sel=$('facilityUpgradeStepInput'); if(!sel)return;
  const current=String(selected||sel.value||'1');
  sel.innerHTML=UPGRADE_STEP_RULES.map(r=>`<option value="${r.step}" ${String(r.step)===current?'selected':''}>${escapeHtml(r.label)}</option>`).join('');
  syncFacilityUpgradePickerButton(sel);
}
function renderUpgradeCountSelect(selected='0'){
  const sel=$('facilityUpgradeCountInput'); if(!sel)return;
  const current=String(selected??sel.value??'0');
  sel.innerHTML=UPGRADE_COUNT_RULES.map(r=>`<option value="${r.value}" ${String(r.value)===current?'selected':''}>${escapeHtml(r.label)}</option>`).join('');
  syncFacilityUpgradePickerButton(sel);
}
function rankBasePrice(rank=''){
  const n=normalizeToolRank(rank,1);
  const found=(state.material_ranks||[]).find(row=>normalizeToolRank(row.name,'')===n);
  const price=Number(String(found?.price||'').trim());
  return Number.isFinite(price)&&price>0?price:0;
}
function equipmentRankPriceMultiplier(rank){
  const n=numericRankValueIncludingLegacyMaterialGrade(rank,'');
  if(!n)return 0;
  if(n===1)return 1;
  if(n===2)return 2;
  if(n===3)return 4;
  if(n===4)return 8;
  return 12+Math.max(0,n-5)*4;
}
function selectedUpgradeEquipment(){
  const name=String($('facilityUpgradeEquipmentSelect')?.value||'').trim();
  if(!name)return null;
  return (state.items||[]).find(r=>String(r.name||'').trim()===name)||null;
}
function upgradeDifficultyPenalty(materialRank,minimumRank){return Math.max(0,Number(materialRank||1)-Number(minimumRank||1));}
function upgradeTargetValue(equipmentRank,upgradeCount){return 7+Math.max(1,Number(equipmentRank)||1)+Math.max(0,Number(upgradeCount)||0);}
function upgradeSlotCostForMaterial(mat={}){const explicit=Math.max(0,Number(mat.equipmentUpgradeSlotCost||0));if(explicit)return explicit;return typeof recommendedEquipmentUpgradeSlotCost==='function'?recommendedEquipmentUpgradeSlotCost(mat):1;}
function facilityUpgradeSuccessRate(target,difficulty){return Math.max(20,Math.min(95,100-Math.max(0,Number(target||8)-8)*5-Math.max(0,Number(difficulty||0))*10));}
function facilityGuaranteeItems(){return (state.items||[]).filter(r=>Number(r.guaranteeUpgradeMaxRank||0)>0);}
function renderFacilityGuaranteeSelect(){const sel=$('facilityUpgradeGuaranteeItem');if(!sel)return;const prev=sel.value;sel.innerHTML='<option value="">使用しない</option>'+facilityGuaranteeItems().sort((a,b)=>Number(a.guaranteeUpgradeMaxRank)-Number(b.guaranteeUpgradeMaxRank)).map(r=>`<option value="${escapeHtml(r.name||r.id||'')}">${escapeHtml(r.name||r.id||'名称未設定')}（${escapeHtml(playerRankLabel(r.guaranteeUpgradeMaxRank))}以下）</option>`).join('');if([...sel.options].some(o=>o.value===prev))sel.value=prev;syncFacilityUpgradePickerButton(sel);}
function selectedFacilityGuaranteeItem(){const name=String($('facilityUpgradeGuaranteeItem')?.value||'').trim();return name?(state.items||[]).find(r=>String(r.name||r.id||'').trim()===name)||null:null;}

function upgradeWorkPrice(material={}, rule=UPGRADE_STEP_RULES[0], equipment=null){
  const materialPrice=Number(String(material.sellPrice||'').trim());
  const base=Number.isFinite(materialPrice)&&materialPrice>0?materialPrice:rankBasePrice(material.rank);
  const rank=numericRankValueIncludingLegacyMaterialGrade(equipment?.rank,'');
  const currentSlots=Math.max(0,Number(rule.usedSlots||0));
  const slotCost=Math.max(1,upgradeSlotCostForMaterial(material));
  if(!base||!rank)return {base,total:0,rank,currentSlots,slotCost,raw:0};
  const raw=(base*slotCost+50*Math.max(1,rank))*(1+0.2*currentSlots);
  return {base,total:Math.ceil(raw/10)*10,rank,currentSlots,slotCost,raw};
}

const UPGRADE_REMOVAL_BASE_G=20;
const UPGRADE_REMOVAL_BASIC_EFFECTS=new Set(['威力強化','命中強化','防御行動強化','回避強化','抵抗強化','副手追撃強化','回復量強化','最大スタック拡張','HP強化','MP強化']);
const UPGRADE_REMOVAL_ADVANCED_EFFECTS=new Set(['威力固定強化','回復量固定強化','防御強化','術式枠拡張','術式省力化','力業補助','魔法補助','祈祷補助']);
function facilityRemovalMaterialId(row={}){return String(row.id||row.publicId||row.name||'').trim();}
function facilityRemovalMaterialById(id=''){const key=String(id||'').trim();return key?(state.items||[]).find(r=>facilityRemovalMaterialId(r)===key)||null:null;}
function facilityRemovalEffectRate(row={}){
  const effect=String(row.equipmentUpgradeEffect||'').trim();
  if(UPGRADE_REMOVAL_BASIC_EFFECTS.has(effect))return 1;
  if(UPGRADE_REMOVAL_ADVANCED_EFFECTS.has(effect))return 1.25;
  return 1.5;
}
function facilityRemovalEffectClass(row={}){const rate=facilityRemovalEffectRate(row);return rate>=1.5?'特殊効果':rate>=1.25?'高度強化':'基礎強化';}
function facilityRemovalCandidateRows(){
  if(!selectedUpgradeEquipment())return [];
  return (state.items||[]).filter(row=>{
    if(String(row.dataKind||'').trim()!=='素材')return false;
    if(!String(row.equipmentUpgradeEffect||'').trim())return false;
    return facilityUpgradeMaterialCompatible(row);
  }).sort((a,b)=>String(a.equipmentUpgradeEffect||'').localeCompare(String(b.equipmentUpgradeEffect||''),'ja')||numericRankValueIncludingLegacyMaterialGrade(a.rank,1)-numericRankValueIncludingLegacyMaterialGrade(b.rank,1)||String(a.name||'').localeCompare(String(b.name||''),'ja'));
}
function renderFacilityRemovalMaterialSelect(){
  const sel=$('facilityRemovalMaterialSelect');if(!sel)return;
  const prev=sel.value,equipment=selectedUpgradeEquipment(),rows=facilityRemovalCandidateRows();
  if(!equipment){sel.innerHTML='<option value="">先に装備を選択</option>';sel.disabled=true;return;}
  sel.disabled=false;
  sel.innerHTML='<option value="">現在付いている強化を選択</option>'+rows.map(row=>{
    const effect=String(row.equipmentUpgradeEffect||'').trim()||'強化内容未設定';
    const slots=upgradeSlotCostForMaterial(row),cls=facilityRemovalEffectClass(row);
    return `<option value="${escapeHtml(facilityRemovalMaterialId(row))}">${escapeHtml(effect)}（${escapeHtml(row.name||'素材名未設定')} / ${slots}枠 / ${cls}）</option>`;
  }).join('');
  if([...sel.options].some(o=>o.value===prev))sel.value=prev;
  syncFacilityUpgradePickerButton(sel);
}
function facilityRemovalConfiguredRows(){return facilityRemovalEntryIds.map(facilityRemovalMaterialById).filter(Boolean);}
function facilityRemovalPriceResult(){
  const equipment=selectedUpgradeEquipment(),rows=facilityRemovalConfiguredRows();
  if(!equipment)return {equipment:null,rows:[],rank:0,rankRate:0,total:0};
  const rank=numericRankValueIncludingLegacyMaterialGrade(equipment.rank,1),rankRate=equipmentRankPriceMultiplier(rank);
  const priced=rows.map((row,index)=>{
    const slots=upgradeSlotCostForMaterial(row),rate=facilityRemovalEffectRate(row),price=UPGRADE_REMOVAL_BASE_G*rankRate*slots*rate;
    return {row,index,slots,rate,classLabel:facilityRemovalEffectClass(row),price};
  });
  const total=priced.length?Math.ceil(priced.reduce((sum,x)=>sum+x.price,0)/10)*10:0;
  return {equipment,rows:priced,rank,rankRate,total};
}
function renderFacilityRemovalCalculator(){
  renderFacilityRemovalMaterialSelect();
  const rowsEl=$('facilityRemovalRows'),resultEl=$('facilityRemovalResult');if(!rowsEl||!resultEl)return;
  const result=facilityRemovalPriceResult();
  if(!result.equipment){rowsEl.innerHTML='<div class="muted small">上の「強化する装備」を選択してください。</div>';resultEl.textContent='全解除料金：装備と現在の強化を設定してください。';return;}
  if(!result.rows.length){rowsEl.innerHTML='<div class="muted small">登録済みの強化はありません。</div>';resultEl.textContent=`全解除料金：解除対象なし（${result.equipment.name||'装備名未設定'} / ${adminRankLabel(result.rank)}）`;return;}
  rowsEl.innerHTML=result.rows.map(x=>`<div class="facility-removal-row"><div class="facility-removal-row-main"><b>${escapeHtml(x.row.equipmentUpgradeEffect||'強化内容未設定')}</b> <span class="small">／ ${escapeHtml(x.row.name||'素材名未設定')}</span><div class="facility-removal-row-meta">${escapeHtml(x.classLabel)} ×${x.rate.toFixed(2)} ／ ${x.slots}枠 ／ 解除額 ${Math.ceil(x.price)}G</div></div><button class="ghost" type="button" data-facility-removal-remove="${x.index}">削除</button></div>`).join('');
  const detail=result.rows.map(x=>`${String(x.row.equipmentUpgradeEffect||'強化内容未設定')} ${x.slots}枠×${x.rate.toFixed(2)}＝${Math.ceil(x.price)}G`).join(' / ');
  resultEl.innerHTML=`<div>全解除料金：<strong>${result.total}G</strong></div><div class="small">${escapeHtml(result.equipment.name||'装備名未設定')} / ${escapeHtml(adminRankLabel(result.rank))}・ランク倍率×${result.rankRate}</div><div class="facility-removal-breakdown">${escapeHtml(detail)}</div>`;
}
function addFacilityRemovalEntry(){
  const sel=$('facilityRemovalMaterialSelect'),row=facilityRemovalMaterialById(sel?.value||'');
  if(!selectedUpgradeEquipment()){toast('先に強化を外す装備を選択してください');return;}
  if(!row){toast('現在付いている強化を選択してください');return;}
  const effect=String(row.equipmentUpgradeEffect||'').trim();
  if(isSpecialUpgradeMaterial(row)&&facilityRemovalConfiguredRows().some(existing=>String(existing.equipmentUpgradeEffect||'').trim()===effect)){
    toast('特殊効果は重複不可のため、同じ効果を複数登録できません');return;
  }
  facilityRemovalEntryIds.push(facilityRemovalMaterialId(row));
  if(sel)sel.value='';
  renderFacilityRemovalCalculator();
}
function facilityActiveDefs(){
  return FACILITY_DEFS.filter(f=>!currentFacilityView || f.name === currentFacilityView);
}


const FACILITY_SECTION_DEFS = {
  '鍛冶屋':[
    ['sales','販売商品'],['branches','武器派生'],['armor','防具製作'],['smith','鍛冶製作'],['traps','仕掛け製作'],['accessory','装飾品作成・強化'],['materials','素材加工'],['upgrade','装備強化'],['crystal','クリスタル強化'],['services','サービス']
  ],
  '薬屋':[['sales','販売商品'],['alchemy','調合'],['materials','素材加工'],['services','サービス']],
  '食事処':[['recommendations','今日のおすすめ'],['meals','持ち込み料理'],['services','サービス']],
  '宿屋':[['services','サービス']],
  '骨董屋':[['sales','常設販売'],['antique_gear','骨董装備ガチャ'],['random','未鑑定スクロール'],['appraisal','鑑定'],['transcribe','集中術式化'],['skill_gacha','スキルガチャ'],['services','サービス']],
  'レシピ販売':[['daily','日替わりレシピ選出'],['services','サービス']],
  'ギルド':[['support','サポートキャラクター'],['services','サービス']]
};
function facilitySectionDefs(name=currentFacilityView){ return FACILITY_SECTION_DEFS[name] || [['services','サービス']]; }
function mealAreaRows(){
  return (state.exploration_areas||[]).filter(row=>String(row.enabled??'TRUE')!=='FALSE'&&String(row.areaType||'').trim()!=='隠しエリア'&&String(row.isHiddenArea||'').trim().toUpperCase()!=='TRUE').slice().sort((a,b)=>{
    const ao=Number(a.unlockOrder),bo=Number(b.unlockOrder);
    if(Number.isFinite(ao)&&Number.isFinite(bo)&&ao!==bo)return ao-bo;
    return compareValues(a.name||a.id||'',b.name||b.id||'');
  });
}
function mealAreaId(row={}){ return String(row.id||row.unlockKey||row.name||'').trim(); }
function facilityGeneralAreaRows(){return mealAreaRows();}
function facilityGeneralInitialAreaId(){const rows=facilityGeneralAreaRows();const initial=rows.find(a=>Number(a.unlockOrder)===1)||rows[0];return mealAreaId(initial||{});}
function ensureFacilityGeneralAreaState(){
  const rows=facilityGeneralAreaRows(),valid=new Set(rows.map(mealAreaId).filter(Boolean)),initialId=facilityGeneralInitialAreaId();
  let next=[...new Set((currentFacilityGeneralUnlockedAreaIds||[]).map(String).filter(id=>valid.has(id)))];
  if(currentMealRecommendationAreaId&&valid.has(String(currentMealRecommendationAreaId))&&!next.length)next.push(String(currentMealRecommendationAreaId));
  if(initialId&&!next.includes(initialId))next.unshift(initialId);
  currentFacilityGeneralUnlockedAreaIds=next;
  return next;
}
function facilityGeneralSelectedSet(){return new Set(ensureFacilityGeneralAreaState());}
function facilityGeneralAreaMatchesKey(area={},key=''){const wanted=String(key||'').trim();if(!wanted)return false;return [area.id,area.unlockKey,area.name].map(v=>String(v||'').trim()).includes(wanted);}
function facilityGeneralAreaUnlockedKey(key=''){
  const wanted=String(key||'').trim();if(!wanted)return true;
  const selected=facilityGeneralSelectedSet();
  return facilityGeneralAreaRows().some(area=>selected.has(mealAreaId(area))&&facilityGeneralAreaMatchesKey(area,wanted));
}
function facilityGeneralSelectedAreas(){const selected=facilityGeneralSelectedSet();return facilityGeneralAreaRows().filter(area=>selected.has(mealAreaId(area)));}
function facilityGeneralSelectedNames(){return facilityGeneralSelectedAreas().map(area=>String(area.name||mealAreaId(area))).filter(Boolean);}
function syncFacilityGeneralAreaSummaries(){
  const names=facilityGeneralSelectedNames(),text=`${names.join('、')||'未設定'}（${names.length}エリア）`;
  document.querySelectorAll('[data-facility-general-area-summary]').forEach(el=>{el.textContent=text;});
}
function renderFacilityGeneralAreaModal(){
  const grid=$('facilityGeneralAreaModalGrid');if(!grid)return;
  const rows=facilityGeneralAreaRows(),selected=new Set(facilityGeneralAreaModalDraftIds.map(String)),initialId=facilityGeneralInitialAreaId();
  grid.innerHTML=rows.length?rows.map(area=>{const id=mealAreaId(area),fixed=id===initialId,checked=selected.has(id)||fixed;return `<label class="copyist-area-check"><input type="checkbox" data-facility-general-area-check="${escapeHtml(id)}" ${checked?'checked':''} ${fixed?'disabled':''}><span><b>${escapeHtml(area.name||id)}</b><br><span class="muted small">${escapeHtml(String(area.areaType||'通常エリア'))}${fixed?' / 初期解放':''}</span></span></label>`;}).join(''):'<p class="muted">エリアデータがありません。</p>';
}
function openFacilityGeneralAreaModal(){
  facilityGeneralAreaModalDraftIds=[...ensureFacilityGeneralAreaState()];renderFacilityGeneralAreaModal();
  const modal=$('facilityGeneralAreaModal');if(modal){modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');}
}
function closeFacilityGeneralAreaModal(){
  const modal=$('facilityGeneralAreaModal');if(modal){modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');if($('editModal')?.classList.contains('hidden')&&$('copyistAreaModal')?.classList.contains('hidden')&&$('antiqueGearAreaModal')?.classList.contains('hidden'))document.body.classList.remove('modal-open');}
}
function applyFacilityGeneralAreaModal(){
  const initialId=facilityGeneralInitialAreaId(),valid=new Set(facilityGeneralAreaRows().map(mealAreaId));
  const next=[...new Set(facilityGeneralAreaModalDraftIds.map(String).filter(id=>valid.has(id)))];if(initialId&&!next.includes(initialId))next.unshift(initialId);
  const before=ensureFacilityGeneralAreaState().slice().sort().join('|'),after=next.slice().sort().join('|');
  currentFacilityGeneralUnlockedAreaIds=next;currentMealRecommendationAreaId='';currentMealRecommendationIds=[];saveFacilityGeneralAreaState();saveMealRecommendationState();closeFacilityGeneralAreaModal();syncFacilityGeneralAreaSummaries();renderFacilitiesPanel();
  if(before!==after)toast('施設の解放済みエリアを更新しました');
}
function ensureMealRecommendationArea(){
  ensureFacilityGeneralAreaState();
  return facilityGeneralSelectedAreas().slice().sort((a,b)=>(Number(b.unlockOrder)||0)-(Number(a.unlockOrder)||0))[0]||null;
}
function mealMaterialCandidateRows(){
  return (state.items||[]).filter(row=>{
    const name=String(row.name||'').trim();
    if(!name)return false;
    if(String(row.dataKind||'').trim()==='アイテム' && String(row.itemType||'').trim()==='食材')return true;
    if(String(row.dataKind||'').trim()!=='素材')return false;
    const marker=[row.usageTags,row.tags].filter(Boolean).join(',');
    return /(?:^|[,、\s])(食用可能|食材|料理)(?:$|[,、\s])/.test(marker);
  }).slice().sort((a,b)=>{
    const ar=numericRankValueIncludingLegacyMaterialGrade(a.rank,999),br=numericRankValueIncludingLegacyMaterialGrade(b.rank,999);
    if(ar!==br)return ar-br;
    return compareValues(a.name||'',b.name||'');
  });
}
function renderMealMaterialCandidateButtons(){
  const rows=mealMaterialCandidateRows();
  if(!rows.length)return '<div class="form-help">料理材料候補がありません。食材、または素材の用途タグへ「食用可能」を設定してください。</div>';
  return `<div class="form-help">料理材料候補：食材と、用途タグが「食用可能」の素材を表示しています。クリックすると必要素材へ×1で追加します。<div class="meal-material-candidate-list">${rows.map(row=>`<button type="button" class="ghost" data-add-meal-material="${escapeHtml(row.name)}">${escapeHtml(row.name)}</button>`).join('')}</div></div>`;
}
function mealRecipeRowsAll(){
  return (state.recipes||[]).filter(row=>
    String(row.craftType||'').trim()==='料理' &&
    (!String(row.unlockFacility||'').trim() || textHasFacility(row,'食事処')) &&
    facilityRankVisible(row)
  ).slice().sort((a,b)=>{
    const ao=mealRecipeUnlockOrder(a),bo=mealRecipeUnlockOrder(b);
    if(ao!==bo)return ao-bo;
    return compareValues(a.resultItem||a.name||'',b.resultItem||b.name||'');
  });
}
function mealRecipeArea(row={}){
  const key=String(row.unlockAreaKey||'').trim();
  return mealAreaRows().find(area=>[area.id,area.unlockKey,area.name].map(v=>String(v||'').trim()).includes(key))||null;
}
function mealRecipeUnlockOrder(row={}){
  const area=mealRecipeArea(row);
  const order=Number(area?.unlockOrder);
  if(Number.isFinite(order))return order;
  return numericRankValueIncludingLegacyMaterialGrade(row.rank,999);
}
function mealRecommendedPrice(row={}){
  const match=String(row.tags||'').match(/おすすめ価格[:：](\d+)/);
  return match?Number(match[1]):Math.max(40,(Number(row.price)||0)+25);
}
function mealCandidateRows(){
  ensureFacilityGeneralAreaState();
  const all=mealRecipeRowsAll();
  const unlocked=all.filter(row=>facilityGeneralAreaUnlockedKey(row.unlockAreaKey));
  const marked=unlocked.filter(row=>String(row.tags||'').includes('おすすめ候補'));
  return marked.length?marked:unlocked;
}
function shuffledRows(rows=[]){
  const copy=rows.slice();
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
}
function drawMealRecommendations(){
  const rows=mealCandidateRows();
  if(!rows.length){currentMealRecommendationIds=[];saveMealRecommendationState();return [];}
  const previous=currentMealRecommendationIds.join('|');
  let chosen=[];
  for(let attempt=0;attempt<12;attempt++){
    chosen=[];
    const rest=shuffledRows(rows);
    const categories=new Set(),areas=new Set();
    rest.forEach(row=>{
      if(chosen.length>=3)return;
      const category=String(row.category||'').trim(),area=String(row.unlockAreaKey||'').trim();
      if((category&&!categories.has(category))||(area&&!areas.has(area))){chosen.push(row);if(category)categories.add(category);if(area)areas.add(area);}
    });
    rest.forEach(row=>{if(chosen.length<3&&!chosen.includes(row))chosen.push(row);});
    const next=chosen.slice(0,3).map(row=>String(row.id||row.name||row.resultItem||'')).join('|');
    if(next!==previous||rows.length<=3)break;
  }
  currentMealRecommendationIds=chosen.slice(0,3).map(row=>String(row.id||row.name||row.resultItem||''));
  saveMealRecommendationState();
  return chosen.slice(0,3);
}
function currentMealRecommendations(){
  const candidates=mealCandidateRows();
  const byId=new Map(candidates.map(row=>[String(row.id||row.name||row.resultItem||''),row]));
  const rows=currentMealRecommendationIds.map(id=>byId.get(String(id))).filter(Boolean);
  if(rows.length!==3)return drawMealRecommendations();
  return rows;
}
function mealAreaName(row={}){return mealRecipeArea(row)?.name||row.unlockAreaKey||'解放エリア未設定';}
function openFacilityMealAreaModal(){openFacilityGeneralAreaModal();}
function renderFacilityMealCard(row={},recommended=false){
  const name=row.resultItem||row.name||'名称未設定';
  const price=recommended?mealRecommendedPrice(row):Number(row.price)||0;
  const materials=recommended?'食材不要':(row.requiredMaterials||'未設定');
  const priceLabel=recommended?'おすすめ価格':'調理代';
  const chips=[row.rank?playerRankLabel(row.rank):'',row.category||'',mealAreaName(row)].filter(Boolean);
  return `<div class="facility-recipe-card">
    <h5>${escapeHtml(name)}</h5>
    <div class="facility-product-meta">${chips.map(v=>`<span class="facility-chip">${escapeHtml(v)}</span>`).join('')}</div>
    <div><b>必要食材：</b>${escapeHtml(materials)}</div>
    <div><b>${escapeHtml(priceLabel)}：</b>${price?`${escapeHtml(String(price))}G`:'価格未設定'}</div>
    ${row.effect?`<div><b>食事効果：</b>${escapeHtml(row.effect)}</div>`:''}
    ${row.description?`<div><b>説明：</b>${escapeHtml(row.description)}</div>`:''}
  </div>`;
}
function renderFacilityMealRows(){
  const rows=mealRecipeRowsAll();
  if(!rows.length)return '<p class="notice">持ち込み料理の登録データはありません。</p>';
  const groups=new Map();
  rows.forEach(row=>{const key=mealAreaName(row);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);});
  return `<p class="notice">施設一覧に載せるのは、食材持ち込みで作れる料理だけです。必要食材と調理代を確認できます。</p><div class="facility-recipe-grid">${[...groups.entries()].map(([area,list],idx)=>`<details class="facility-product" ${idx===0?'open':''}><summary><span class="facility-product-title"><span>${escapeHtml(area)}</span><span class="facility-chip">${list.length}品</span></span></summary><div class="facility-product-body"><div class="facility-recipe-grid">${list.map(row=>renderFacilityMealCard(row,false)).join('')}</div></div></details>`).join('')}</div>`;
}
function renderFacilityMealRecommendations(){
  const areas=mealAreaRows();ensureFacilityGeneralAreaState();
  if(!areas.length)return '<p class="notice">探索エリアが登録されていないため、おすすめを抽選できません。</p>';
  const rows=currentMealRecommendations(),selectedNames=facilityGeneralSelectedNames();
  return `<div class="input-action-row">
    <section class="copyist-area-panel"><b>解放済みエリア</b><div class="copyist-area-summary" data-facility-general-area-summary>${escapeHtml(selectedNames.join('、')||'未設定')}（${selectedNames.length}エリア）</div><button class="secondary" type="button" data-facility-general-area-open>解放エリアを選択</button></section>
    <button class="secondary" type="button" data-meal-reroll>おすすめ3品を再抽選</button>
  </div>
  <p class="notice">チェックした解放済みエリアの料理だけを候補にして3品を抽選します。通常エリアの進行順から自動推測せず、異界も個別の解放状態として扱います。可能な限り効果分類・エリアが偏らないように選びます。</p>
  <div class="facility-recipe-grid">${rows.map(row=>renderFacilityMealCard(row,true)).join('')}</div>`;
}
function mealRecommendationCopyBlock(row={}){
  const name=row.resultItem||row.name||'名称未設定';
  const description=String(row.description||'未設定')
    .replace(/\r\n?/g,'\n')
    .split('\n')
    .map((line,index)=>index===0?line:`  ${line}`)
    .join('\n');
  return `- ${name}（${mealRecommendedPrice(row)}G / ${row.category||'分類未設定'}）\n  効果：${row.effect||'未設定'}\n  説明：${description}`;
}
function mealRecommendationsText(){
  const rows=currentMealRecommendations(),names=facilityGeneralSelectedNames();
  const dishes=rows.length
    ? rows.map(row=>mealRecommendationCopyBlock(row)).join('\n\n')
    : '- おすすめ料理なし';
  return [
    '【食事処・今日のおすすめ】',
    `解放済みエリア：${names.join('、')||'未設定'}`,
    '',
    dishes
  ].join('\n');
}
function mealCarryInText(){
  const rows=mealRecipeRowsAll();
  return ['【食事処・持ち込み料理】','',...(rows.length?rows.map(row=>`- ${row.resultItem||row.name||'名称未設定'}（調理代 ${Number(row.price)||0}G）\n  必要食材：${String(row.requiredMaterials||'未設定').replace(/\n/g,' / ')}\n  効果：${row.effect||'未設定'}`):['- 持ち込み料理なし'])].join('\n');
}
function activeFacilitySection(name=currentFacilityView){
  const defs=facilitySectionDefs(name);
  const current=currentFacilitySectionByName[name];
  return defs.some(([id])=>id===current) ? current : defs[0][0];
}
function facilityIsRecipeBasedSpecialProcessing(row={}){return ['recipe_magic_ink','recipe_prayer_paper'].includes(String(row.id||''));}
function facilityProcessingRows(){
  const ordinary=(state.items||[]).filter(row=>
    String(row.materialType||'').trim()==='加工素材' &&
    String(row.processingRequiredMaterials||'').trim() &&
    facilityRankVisible(row) && textHasFacility(row,currentFacilityView)
  );
  const special=(state.recipes||[]).filter(row=>facilityIsRecipeBasedSpecialProcessing(row)&&facilityRankVisible(row)&&textHasFacility(row,currentFacilityView))
    .map(row=>({...row,isProcessingRecipe:true,name:row.resultItem||row.name||'',materialCategory:'術式素材'}));
  return ordinary.concat(special).sort((a,b)=>facilityRankLevel(a.rank)-facilityRankLevel(b.rank)||compareValues(a.name||'',b.name||''));
}
function renderFacilityProcessingCard(row={}){
  if(row.isProcessingRecipe){
    const item=facilityItemByName(row.resultItem||row.name||'')||{};
    return `<div class="facility-recipe-card">
      <h5>${escapeHtml(row.resultItem||row.name||'名称未設定')}</h5>
      <div class="facility-product-meta">${[row.rank?playerRankLabel(row.rank):'','素材加工','術式素材'].filter(Boolean).map(v=>`<span class="facility-chip">${escapeHtml(v)}</span>`).join('')}</div>
      <div><b>レシピ：</b>必要</div>
      <div><b>必要素材：</b>${escapeHtml(row.requiredMaterials||'未設定')}</div>
      <div><b>完成数：</b>${escapeHtml(String(row.resultCount||1))}</div>
      <div><b>施設加工依頼費：</b>${escapeHtml(String(Number(row.price)||0))}G</div>
      <div><b>施設依頼：</b>レシピ不要・判定不要</div>
      <div><b>加工技能：</b>${escapeHtml(row.craftSkill||'調合')}</div>
      <div><b>基礎作成難易度：</b>${escapeHtml(row.difficulty||'未設定')}</div>
      <div><b>任意の作成補助材：</b>${escapeHtml(adminCraftSupportText({craftSkill:row.craftSkill||'調合',craftType:'素材加工'})||'なし')}</div>
      ${facilityItemDescriptionHtml(item,row)}
    </div>`;
  }
  const tool=String(row.processingToolType||'対応道具').trim();
  const toolRank=String(row.processingToolRank||'?').trim();
  return `<div class="facility-recipe-card">
    <h5>${escapeHtml(row.name||'名称未設定')}</h5>
    <div class="facility-product-meta">${[row.rank?playerRankLabel(row.rank):'','素材加工',row.materialCategory||'加工素材'].filter(Boolean).map(v=>`<span class="facility-chip">${escapeHtml(v)}</span>`).join('')}</div>
    <div><b>レシピ：</b>不要</div>
    <div><b>必要素材：</b>${escapeHtml(row.processingRequiredMaterials||'未設定')}</div>
    <div><b>完成数：</b>${escapeHtml(String(row.processingResultCount||1))}</div>
    <div><b>施設加工依頼費：</b>${escapeHtml(String(Number(row.processingFee)||0))}G</div>
    <div><b>施設依頼：</b>判定不要</div>
    <div><b>加工技能：</b>${escapeHtml(row.processingSkill||'未設定')}</div>
    <div><b>対応道具：</b>${escapeHtml(tool)}（★${escapeHtml(toolRank)}以上）</div>
    <div><b>基礎作成難易度：</b>${escapeHtml(row.processingDifficulty||'未設定')}</div>
    <div><b>任意の作成補助材：</b>${escapeHtml(adminCraftSupportText({craftSkill:row.processingSkill||'',craftType:'素材加工'})||'なし')}</div>
    ${facilityItemDescriptionHtml(row,{})}
  </div>`;
}
function renderFacilityProcessingGroup(){
  const rows=facilityProcessingRows();
  if(!rows.length) return '<p class="notice">この施設で加工できる素材はありません。</p>';
  const groups=new Map();rows.forEach(row=>{const key=row.materialCategory||'加工素材';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);});
  return `<p class="notice">一般の加工素材はレシピ不要です。薬屋の魔導インク・祈祷紙だけは対応レシピが必要な特殊加工です。施設依頼はいずれもレシピ不要・判定不要です。</p><div class="facility-recipe-grid">${[...groups.entries()].map(([label,list],idx)=>`<details class="facility-product" ${idx===0?'open':''}><summary><span class="facility-product-title"><span>${escapeHtml(label)}</span><span class="facility-chip">${list.length}件</span></span></summary><div class="facility-product-body"><div class="facility-recipe-grid">${list.map(renderFacilityProcessingCard).join('')}</div></div></details>`).join('')}</div>`;
}
function facilityProcessingCopyText(facilityName=''){
  const ordinary=(state.items||[]).filter(row=>String(row.materialType||'').trim()==='加工素材'&&String(row.processingRequiredMaterials||'').trim()&&textHasFacility(row,facilityName)&&facilityRankVisible(row));
  const special=(state.recipes||[]).filter(row=>facilityIsRecipeBasedSpecialProcessing(row)&&textHasFacility(row,facilityName)&&facilityRankVisible(row));
  const lines=[];
  ordinary.forEach(row=>lines.push(`- ${row.name||'名称未設定'}（${playerRankLabel(row.rank)} / 施設加工依頼${Number(row.processingFee)||0}G）
  レシピ：不要
  必要素材：${row.processingRequiredMaterials||'未設定'}
  完成数：${row.processingResultCount||1}
  加工技能：${row.processingSkill||'未設定'}
  対応道具：${row.processingToolType||'対応道具'}（★${row.processingToolRank||'?'}以上）
  基礎作成難易度：${row.processingDifficulty||'未設定'}
  任意の作成補助材：${adminCraftSupportText({craftSkill:row.processingSkill||'',craftType:'素材加工'})||'なし'}`));
  special.forEach(row=>lines.push(`- ${row.resultItem||row.name||'名称未設定'}（${playerRankLabel(row.rank)} / 施設加工依頼${Number(row.price)||0}G）
  レシピ：必要
  必要素材：${row.requiredMaterials||'未設定'}
  完成数：${row.resultCount||1}
  加工技能：${row.craftSkill||'調合'}
  基礎作成難易度：${row.difficulty||'未設定'}
  任意の作成補助材：${adminCraftSupportText({craftSkill:row.craftSkill||'調合',craftType:'素材加工'})||'なし'}`));
  return lines.length?lines.join('\n'):'- 加工可能な素材はありません';
}
function facilityRecipeRows(craftType){
  return (state.recipes||[]).filter(r=>
    String(r.craftType||'').trim()===craftType &&
    !facilityIsRecipeBasedSpecialProcessing(r) &&
    facilityRankVisible(r) &&
    (!String(r.unlockFacility||'').trim() || textHasFacility(r,currentFacilityView))
  );
}
function facilityPerformanceRows(item={}){
  const out=[];
  const add=(label,value,suffix='')=>{const t=String(value??'').trim();if(!t||t==='0'||t.toUpperCase()==='FALSE')return;out.push([label,t+suffix]);};
  if(String(item.power||'').trim()) add(String(item.itemType||'')==='武器'?'ダメージ':'威力',item.power);
  parseModifierEditorRows(item.modifiers||'').forEach(m=>add(adminModifierTargetDisplayName(m.target),m.value));
  add('使用技能',item.skill);add('対象',item.target);if(String(item.itemType||'').trim()!=='武器')add('判定',String(item.checkType||'').replace(/回避値/g,'回避').replace(/抵抗値/g,'抵抗').replace(/常時防御値/g,'防御'));add('属性',item.element);add('副手追撃',item.offhandBonus);
  add('装填ターン',item.reloadTurns,'ターン');add('最大スタック',item.maxStack);add('矢弾消費',item.ammoUse);add('矢弾種別',item.ammoKind);add('対応武器種',item.compatibleWeaponTypes);
  add('矢筒収納種類数',item.quiverCapacity);add('所持品枠',item.bagCapacity);
  if(String(item.toolRank||'').trim()) add('使用可能上限',playerRankLabel(item.toolRank)+'以下');
  if(String(item.guaranteeUpgradeMaxRank||'').trim()) add('強化確定上限',playerRankLabel(item.guaranteeUpgradeMaxRank)+'以下');
  if(String(item.spellSlots||'').trim()) add('術式追加枠','+'+String(item.spellSlots));
  return out;
}
function facilityPerformanceHtml(item={}){const rows=facilityPerformanceRows(item);return rows.length?`<div class="facility-product-meta">${rows.map(([k,v])=>`<span class="facility-chip">${escapeHtml(k)} ${escapeHtml(v)}</span>`).join('')}</div>`:'';}
function facilityItemDescriptionHtml(item={},fallback={}){
  const desc=String(item.description||fallback.description||'').trim();const effect=String(item.effect||fallback.effect||'').trim();
  return `${desc?`<div><b>説明：</b>${escapeHtml(desc)}</div>`:''}${effect?`<div><b>効果：</b>${escapeHtml(effect)}</div>`:''}`;
}
function renderFacilityRecipeCard(row={}){
  const price=String(row.price??'').trim();
  const skill=String(row.craftSkill||recipeSkillForCraftType(row.craftType)||'未設定').trim();
  const item=facilityItemByName(row.resultItem||row.name||'')||{};
  return `<div class="facility-recipe-card">
    <h5>${escapeHtml(row.resultItem||row.name||'名称未設定')}</h5>
    <div class="facility-product-meta">
      ${[row.rank?playerRankLabel(row.rank):'',row.craftType||'',item.itemCategory||row.category||'',row.branchType?`系統:${row.branchType}`:''].filter(Boolean).map(v=>`<span class="facility-chip">${escapeHtml(v)}</span>`).join('')}
    </div>
    ${facilityPerformanceHtml(item)}
    ${row.baseItem && String(row.craftType||'').trim()!=='武器派生'?`<div><b>派生元：</b>${escapeHtml(row.baseItem)}</div>`:''}
    <div><b>必要素材：</b>${escapeHtml(row.requiredMaterials||'未設定')}</div>
    ${String(row.resultCount||'').trim()?`<div><b>完成数：</b>${escapeHtml(row.resultCount)}</div>`:''}
    <div class="facility-work-route"><b>自作</b><span>レシピ必須</span>${adminCraftingRouteLines(row).map(line=>`<span>${escapeHtml(line)}</span>`).join('')}</div>
    <div class="facility-work-route"><b>施設依頼</b><span>レシピ不要</span><span>${price?`${escapeHtml(price)}G`:'価格未設定'}</span></div>
    ${facilityItemDescriptionHtml(item,row)}
  </div>`;
}
function recipeSkillForCraftType(craftType=''){
  const type=String(craftType||'').trim();
  if(type==='調合') return '調合';
  if(type==='料理') return 'なし';
  if(type==='細工'||type==='仕掛け製作') return '設計';
  return '細工';
}
const FACILITY_WEAPON_CATEGORY_ORDER=['短剣','片手剣','片手斧','片手槌','片手槍','杖','弓','クロスボウ','ヘヴィクロスボウ','長槍','両手剣','大槌','大鎌','ガントレット','鞭','魔導書','祈祷書'];
function facilityItemByName(name=''){return (state.items||[]).find(i=>String(i.name||'').trim()===String(name||'').trim())||null;}
function facilityWeaponCategoryForName(name='',fallback=''){
  const item=facilityItemByName(name);
  const tags=String(item?.tags||item?.usageTags||'');
  if(String(item?.name||name).includes('ガントレット') || tags.includes('格闘')) return 'ガントレット';
  if(String(item?.itemType||'')==='術式装備' && ['魔導書','祈祷書'].includes(String(item?.itemCategory||''))) return String(item.itemCategory);
  return String(item?.itemCategory||fallback||'未分類').trim()||'未分類';
}
function facilityBranchPaths(startRow,childrenMap,visited=new Set()){
  const name=String(startRow?.resultItem||startRow?.name||'').trim();
  if(!name || visited.has(name)) return [];
  const nextVisited=new Set(visited); nextVisited.add(name);
  const next=(childrenMap.get(name)||[]).slice().sort((a,b)=>compareValues(a.resultItem||'',b.resultItem||''));
  if(!next.length) return [[startRow]];
  return next.flatMap(child=>facilityBranchPaths(child,childrenMap,nextVisited).map(path=>[startRow,...path]));
}
function renderFacilityBranchBase(rootName='',direct=[]){
  const item=facilityItemByName(rootName)||{};
  return `<details class="facility-product"><summary><span class="facility-product-title"><span>初期武器：${escapeHtml(rootName)}</span><span class="facility-chip">${escapeHtml(item.rank?playerRankLabel(item.rank):'')}</span></span></summary><div class="facility-product-body">${facilityPerformanceHtml(item)}${facilityItemDescriptionHtml(item,{})}<div><b>派生起点：</b>${escapeHtml(direct.map(r=>r.resultItem||r.name||'未設定').join(' / ')||'なし')}</div></div></details>`;
}
function renderFacilityWeaponBranches(rows=[]){
  if(!rows.length) return '<p class="notice">武器派生の登録データはありません。</p>';
  const norm=v=>String(v||'').normalize('NFKC').toLocaleLowerCase('ja').replace(/\s+/g,'');
  const query=norm(currentFacilityWeaponBranchSearch);
  const categoryMap=new Map();
  rows.forEach(r=>{
    const hay=norm([r.branchType,r.resultItem,r.name,r.baseItem,r.requiredMaterials].filter(Boolean).join(' '));
    if(query && !hay.includes(query)) return;
    const category=facilityWeaponCategoryForName(r.resultItem||'',r.category||facilityWeaponCategoryForName(r.baseItem||''));
    if(!categoryMap.has(category)) categoryMap.set(category,[]);
    categoryMap.get(category).push(r);
  });
  const categories=[...categoryMap.keys()].sort((a,b)=>{
    const ai=FACILITY_WEAPON_CATEGORY_ORDER.indexOf(a),bi=FACILITY_WEAPON_CATEGORY_ORDER.indexOf(b);
    if(ai>=0||bi>=0) return (ai<0?999:ai)-(bi<0?999:bi);
    return compareValues(a,b);
  });
  const search=`<div class="facility-branch-search"><label for="facilityWeaponBranchSearch">派生名・武器名・素材名検索</label><input id="facilityWeaponBranchSearch" type="search" value="${escapeHtml(currentFacilityWeaponBranchSearch)}" placeholder="例：反照、ショートダガー、甲殻板"></div>`;
  if(!categories.length) return search+'<p class="notice">検索条件に一致する武器派生はありません。</p>';
  if(!categories.includes(currentFacilityWeaponCategory)) currentFacilityWeaponCategory=categories[0]||'';
  const tabs=`<div class="facility-weapon-category-tabs">${categories.map(c=>{
    const count=new Set((categoryMap.get(c)||[]).map(r=>String(r.branchType||'').trim()).filter(Boolean)).size;
    return `<button type="button" class="facility-weapon-category-tab ${c===currentFacilityWeaponCategory?'active':''}" data-facility-weapon-category="${escapeHtml(c)}">${escapeHtml(c)}<span class="count">${count}</span></button>`;
  }).join('')}</div>`;
  const selectedRows=categoryMap.get(currentFacilityWeaponCategory)||[];
  const allResultNames=new Set(selectedRows.map(r=>String(r.resultItem||'').trim()).filter(Boolean));
  const rootNames=[...new Set(selectedRows.map(r=>String(r.baseItem||'').trim()).filter(n=>n&&!allResultNames.has(n)))];
  const baseCards=rootNames.map(root=>renderFacilityBranchBase(root,selectedRows.filter(r=>String(r.baseItem||'').trim()===root))).join('');
  const byBranch=new Map();
  selectedRows.forEach(r=>{
    const label=String(r.branchType||'').trim()||'未分類';
    if(!byBranch.has(label)) byBranch.set(label,[]);
    byBranch.get(label).push(r);
  });
  const groups=[...byBranch.entries()].sort((a,b)=>compareValues(a[0],b[0])).map(([label,groupRows],groupIndex)=>{
    const resultNames=new Set(groupRows.map(r=>String(r.resultItem||'').trim()).filter(Boolean));
    const roots=[...new Set(groupRows.map(r=>String(r.baseItem||'').trim()).filter(n=>n&&!resultNames.has(n)))];
    const childrenMap=new Map();
    groupRows.forEach(r=>{const k=String(r.baseItem||'').trim();if(!childrenMap.has(k))childrenMap.set(k,[]);childrenMap.get(k).push(r);});
    const lines=roots.flatMap(rootName=>(childrenMap.get(rootName)||[]).slice().sort((a,b)=>compareValues(a.resultItem||'',b.resultItem||'')).flatMap(first=>facilityBranchPaths(first,childrenMap)));
    const stageCount=new Set(groupRows.map(r=>String(r.resultItem||'').trim()).filter(Boolean)).size;
    return `<details class="facility-product" ${groupIndex===0?'open':''}><summary><span class="facility-product-title"><span>${escapeHtml(label)}派生</span><span class="facility-chip">${stageCount}段階</span></span></summary><div class="facility-product-body facility-branch-chain">${lines.map(chain=>`<div class="facility-branch-root-group"><div class="facility-branch-chain">${chain.map((row,idx)=>(idx?'<div class="facility-branch-arrow">↓</div>':'')+renderFacilityRecipeCard(row)).join('')}</div></div>`).join('')}</div></details>`;
  }).join('');
  return search+tabs+baseCards+`<div class="facility-branch-tree">${groups}</div>`;
}

function facilityRecipeCategoryLabel(row={}){
  const item=facilityItemByName(row.resultItem||row.name||'')||{};
  const type=String(item.itemType||row.itemType||'').trim(), cat=String(item.itemCategory||row.category||'').trim();
  if(type==='武器'||type==='術式装備')return '武器';
  if(type==='防具'||type==='盾')return '防具・盾';
  if(type==='装飾品')return '装飾品';
  if(type==='バッグ'||type==='矢筒')return 'バッグ・矢筒';
  if(type==='道具')return '道具・仕掛け';
  if(type==='調合品')return cat||'調合品';
  return cat||type||'その他';
}
function renderFacilityRecipeCategories(rows=[]){
  const groups=new Map();rows.forEach(row=>{const key=facilityRecipeCategoryLabel(row);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);});
  return `<div class="facility-recipe-grid">${[...groups.entries()].map(([label,list],idx)=>`<details class="facility-product" ${idx===0?'open':''}><summary><span class="facility-product-title"><span>${escapeHtml(label)}</span><span class="facility-chip">${list.length}件</span></span></summary><div class="facility-product-body"><div class="facility-recipe-grid">${list.map(renderFacilityRecipeCard).join('')}</div></div></details>`).join('')}</div>`;
}
function renderFacilityRecipeGroup(craftType){
  const rows=facilityRecipeRows(craftType);
  if(!rows.length) return `<p class="notice">${escapeHtml(craftType)}の登録データはありません。</p>`;
  if(craftType==='武器派生') return renderFacilityWeaponBranches(rows);
  return renderFacilityRecipeCategories(rows);
}
function accessoryUpgradeRows(){
  return (state.recipes||[]).filter(row=>['装飾品製作','装飾品強化'].includes(String(row.craftType||'').trim())&&facilityRankVisible(row));
}
function renderFacilityAccessoryUpgradeCards(){
  const rows=accessoryUpgradeRows().slice().sort((a,b)=>{
    const ao=Number((state.exploration_areas||[]).find(x=>String(x.id||'')===String(a.unlockAreaKey||''))?.unlockOrder)||0;
    const bo=Number((state.exploration_areas||[]).find(x=>String(x.id||'')===String(b.unlockAreaKey||''))?.unlockOrder)||0;
    if(ao!==bo)return ao-bo;
    if(Number(a.rank||0)!==Number(b.rank||0))return Number(a.rank||0)-Number(b.rank||0);
    return compareValues(a.resultItem||a.name||'',b.resultItem||b.name||'');
  });
  if(!rows.length)return '<p class="notice">装飾品強化データがありません。</p>';
  return `<div class="facility-recipe-grid">${rows.map(row=>{
    const isUpgrade=String(row.craftType||'').trim()==='装飾品強化';
    const item=facilityItemByName(row.resultItem||row.name||'')||{};
    const area=(state.exploration_areas||[]).find(a=>String(a.id||'')===String(row.unlockAreaKey||''));
    return `<div class="facility-recipe-card">
      <h5>${escapeHtml(row.resultItem||row.name||'名称未設定')}</h5>
      <div class="facility-product-meta">
        <span class="facility-chip">${escapeHtml(playerRankLabel(row.rank)||'ランク未設定')}</span>
        <span class="facility-chip">${isUpgrade?'段階強化':'新規製作'}</span>
        <span class="facility-chip">解放:${escapeHtml(area?.name||row.unlockAreaKey||'初期')}</span>
      </div>
      ${isUpgrade?`<div><b>強化段階：</b>${escapeHtml(row.baseItem||'?')} → ${escapeHtml(row.resultItem||'?')}</div>`:`<div><b>完成品：</b>${escapeHtml(row.resultItem||row.name||'未設定')}</div>`}
      <div><b>必要素材：</b>${escapeHtml(row.requiredMaterials||'未設定')}</div>
      <div><b>施設依頼：</b>${escapeHtml(String(row.price||0))}G・判定不要</div>
      <div><b>自作：</b>${escapeHtml(row.craftSkill||'細工')} / 基礎作成難易度 ${escapeHtml(row.difficulty||'未設定')}</div>
      ${facilityItemDescriptionHtml(item,row)}
    </div>`;
  }).join('')}</div>`;
}
const APPRAISAL_FEES = {1:150,2:400,3:1000,4:2000};
const TRANSCRIPTION_DIFFICULTIES = {1:7,2:10,3:13,4:16};
const TRANSCRIPTION_MATERIAL_COUNTS = {1:1,2:2,3:3,4:4};
const SCROLL_RANK_DIFFICULTIES = {1:6,2:9,3:12,4:15};
const SCROLL_RANK_ORDER = [1,2,3,4];
const AREA_SCROLL_MAX_RANK = {'街はずれの草原':0,'近郊の森':1,'水辺の湿地':2,'反照の水庭':2,'山麓の旧鉱山':3,'風渡りの高原':3,'灰冠の火山峡谷':3};
function appraisalFee(rank=1){ return APPRAISAL_FEES[numericRankValue(rank,1)] || 150; }
function transcriptionDifficulty(rank=1){ return TRANSCRIPTION_DIFFICULTIES[numericRankValue(rank,1)] || 7; }
function transcriptionMaterialCount(rank=1){ return TRANSCRIPTION_MATERIAL_COUNTS[numericRankValue(rank,1)] || 1; }
function scrollRankDifficulty(rank=1){ return SCROLL_RANK_DIFFICULTIES[numericRankValue(rank,1)] || 6; }
function maxScrollRankForUnlockedArea(area='街はずれの草原'){
  const selected=String(area||'').trim();
  return Object.prototype.hasOwnProperty.call(AREA_SCROLL_MAX_RANK,selected)?AREA_SCROLL_MAX_RANK[selected]:0;
}
function scrollRankAllowed(rank=1,area='街はずれの草原'){
  const maxRank=maxScrollRankForUnlockedArea(area);
  return numericRankValue(rank,1)<=numericRankValue(maxRank,1);
}
function maxScrollRankForUnlockedAreas(){
  const names=facilityGeneralSelectedNames();
  return names.reduce((max,name)=>Math.max(max,maxScrollRankForUnlockedArea(name)),0);
}
function scrollRankAllowedForUnlockedAreas(rank=1){return numericRankValue(rank,1)<=numericRankValue(maxScrollRankForUnlockedAreas(),0);}
function isUnidentifiedScrollRow(row={}){
  const text=[row.name,row.itemCategory,row.tags,row.usageTags].map(v=>String(v||'')).join(' ');
  return text.includes('未鑑定') && text.includes('スクロール');
}
function unidentifiedScrollType(row={}){
  const text=[row.name,row.itemCategory,row.tags,row.usageTags].map(v=>String(v||'')).join(' ');
  if(text.includes('祈祷')) return '祈祷';
  if(text.includes('魔法')) return '魔法';
  return '';
}
function antiqueScrollRows(){
  return (state.items || []).filter(isUnidentifiedScrollRow)
    .filter(row=>textHasFacility(row, '骨董屋') || String(row.source || '').includes('骨董屋') || String(row.unlockFacility || '').includes('骨董屋'));
}
function shuffleRows(rows=[]){
  const out = [...rows];
  for(let i=out.length-1;i>0;i--){
    const j = Math.floor(Math.random() * (i+1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function antiqueAppraisalRule(type='魔法',rank=1){
  const wantedRank=numericRankValue(rank,1);
  return (state.appraisal_rules||[]).find(row=>
    String(row.enabled??'TRUE').trim().toUpperCase()!=='FALSE' &&
    (!String(row.facilityName||'').trim() || String(row.facilityName||'').includes('骨董屋')) &&
    String(row.spellType||'').trim()===String(type||'').trim() &&
    numericRankValue(row.scrollRank||row.spellRank,1)===wantedRank
  )||null;
}
function antiqueAppraisalCandidates(type='魔法',rank=1,rule=null){
  const wantedType=String(type||'').trim();
  const wantedRank=numericRankValue(rule?.spellRank||rank,1);
  const requiredTags=String(rule?.candidateTags||'').split(/[,、\n]/).map(v=>v.trim()).filter(Boolean);
  return (state.spells||[]).filter(spell=>{
    if(String(spell.type||'').trim()!==wantedType) return false;
    if(numericRankValue(spell.rank,1)!==wantedRank) return false;
    const tags=String(spell.tags||'');
    return !requiredTags.length || requiredTags.every(tag=>tags.includes(tag));
  });
}
function antiqueScrollItemForSpell(spell={}){
  const name=`${String(spell.name||'').trim()}のスクロール`;
  return (state.items||[]).find(row=>String(row.name||'').trim()===name)||null;
}
function antiqueAppraisalOutputText(type,rank,difficulty,fee,candidates,spell,scroll){
  // プレイヤーへ渡すコピーは「鑑定手順」ではなく、入手した鑑定後スクロールの情報だけを出す。
  // キャラシの貼り付け登録に必要な公開IDはスクロール側の登録IDだけを残し、術式IDや候補数などの管理情報は出さない。
  const scrollName=String(scroll?.name||`${spell.name}のスクロール`).trim();
  const lines=[`【${scrollName}】`];
  if(scroll?.publicId) lines.push(`登録ID：${scroll.publicId}`);
  lines.push('個数：1');
  lines.push(`ランク：${playerRankLabel(scroll?.rank||spell.rank||rank)}`);
  lines.push('分類：スクロール / 術式スクロール');
  const sell=String(scroll?.sellPrice??'').trim();
  if(sell) lines.push(`売値：${Number(sell)===0?'売却不可':`${sell}G`}`);
  const description=String(scroll?.description||'').trim();
  const effect=String(scroll?.effect||'').trim();
  if(description) lines.push(`説明：${description}`);
  lines.push(`効果：${effect||`使用すると術式「${spell.name}」をコスト消費なしで1回発動し、このスクロールを消費する。`}`);
  return lines.filter(Boolean).join('\n');
}
function renderAntiqueAppraisalResult(roll=false){
  const result = $('facilityAppraisalResult');
  if(!result) return;
  const type = $('facilityAppraisalTypeInput')?.value || '魔法';
  const rank = numericRankValue($('facilityAppraisalRankInput')?.value, 1);
  const rule=antiqueAppraisalRule(type,rank);
  const difficulty = numericRankValue(rule?.difficulty,'')||scrollRankDifficulty(rank);
  const fee=appraisalFee(rank);
  const candidates=antiqueAppraisalCandidates(type,rank,rule);
  result.classList.remove('muted');
  if(!roll){
    currentAntiqueAppraisalText='';
    result.innerHTML = `<div><b>スクロール鑑定</b></div>
      <div class="facility-product-meta"><span class="facility-chip">対象:未鑑定の${escapeHtml(type)}スクロール・${escapeHtml(playerRankLabel(rank))}</span><span class="facility-chip">判定:鑑定技能</span><span class="facility-chip">鑑定料:${escapeHtml(String(fee))}G</span><span class="facility-chip">候補:${escapeHtml(String(candidates.length))}件</span></div>
      <div><b>鑑定難易度：</b>${escapeHtml(String(difficulty))}</div>
      <div><b>道具鑑定：</b>術式鑑定具を使用し、2D6+鑑定技能&gt;=${escapeHtml(String(difficulty))}</div>
      <div><b>施設鑑定：</b>${escapeHtml(String(fee))}Gを支払えば自動成功</div>
      <div><b>結果決定：</b>「鑑定結果を決定」を押すと、${escapeHtml(type)}・${escapeHtml(playerRankLabel(rank))}の候補から術式を1件ランダムに選びます。</div>`;
    return;
  }
  if(!candidates.length){
    currentAntiqueAppraisalText=['【骨董屋・スクロール鑑定】',`対象：未鑑定の${type}スクロール：${playerRankLabel(rank)}`,'鑑定結果：該当する術式が登録されていません。'].join('\n');
    result.innerHTML=`<div><b>スクロール鑑定</b></div><div class="notice">${escapeHtml(type)}・${escapeHtml(playerRankLabel(rank))}に一致する術式が登録されていません。術式一覧へ同じ種別・ランクの候補を登録してください。</div>`;
    return;
  }
  const spell=candidates[Math.floor(Math.random()*candidates.length)];
  const scroll=antiqueScrollItemForSpell(spell);
  currentAntiqueAppraisalText=antiqueAppraisalOutputText(type,rank,difficulty,fee,candidates,spell,scroll);
  result.innerHTML=`<div><b>スクロール鑑定結果</b></div>
    <div class="facility-product-meta"><span class="facility-chip">${escapeHtml(type)}</span><span class="facility-chip">${escapeHtml(playerRankLabel(rank))}</span><span class="facility-chip">候補:${escapeHtml(String(candidates.length))}件</span></div>
    <div><b>鑑定結果：</b>${escapeHtml(spell.name||'名称未設定')}（${escapeHtml(spell.type||type)}・${escapeHtml(playerRankLabel(spell.rank||rank))}）</div>
    ${spell.publicId?`<div><b>術式登録ID：</b>${escapeHtml(spell.publicId)}</div>`:''}
    <div><b>鑑定後スクロール：</b>${escapeHtml(spell.name||'名称未設定')}のスクロール</div>
    ${scroll?.publicId?`<div><b>スクロール登録ID：</b>${escapeHtml(scroll.publicId)}</div>`:'<div class="notice">対応する鑑定済みスクロールが未登録です。</div>'}
    <div class="facility-product-meta">${[spell.element?`属性:${spell.element}`:'',String(spell.mpCost??'').trim()?`コスト:${spell.mpCost}`:'',spell.target?`対象:${spell.target}`:'',spell.checkType?`判定:${spell.checkType}`:'',spell.power?`ダメージ／効果値:${spell.power}`:''].filter(Boolean).map(v=>`<span class="facility-chip">${escapeHtml(v)}</span>`).join('')}</div>
    ${spell.description?`<div><b>説明：</b>${escapeHtml(spell.description)}</div>`:''}
    ${spell.effect?`<div><b>効果：</b>${escapeHtml(spell.effect)}</div>`:''}
    <div><b>使用：</b>このスクロールを消費すると、術式「${escapeHtml(spell.name||'')}」をコスト消費なしで1回発動できます。</div>`;
}
function renderAntiqueTranscriptionResult(){
  const result = $('facilityTranscribeResult');
  if(!result) return;
  const type = $('facilityTranscribeTypeInput')?.value || '魔法';
  const rank = numericRankValue($('facilityTranscribeRankInput')?.value, 1);
  const difficulty = transcriptionDifficulty(rank);
  const count=transcriptionMaterialCount(rank);
  const materialName = type === '祈祷' ? '祈祷紙' : '魔導インク';
  const book = type === '祈祷' ? '祈祷書' : '魔導書';
  result.classList.remove('muted');
  result.innerHTML = `<div><b>集中術式化</b></div>
    <div class="facility-product-meta"><span class="facility-chip">種別:${escapeHtml(type)}</span><span class="facility-chip">ランク:${escapeHtml(playerRankLabel(rank))}</span><span class="facility-chip">判定:集中</span></div>
    <div><b>消費：</b>鑑定済み${escapeHtml(type)}スクロール×1、${escapeHtml(materialName)}×${escapeHtml(String(count))}</div>
    <div class="facility-work-route"><b>自分で術式化</b><span>専用道具：不要</span><span>判定式：2D6+集中&gt;=${escapeHtml(String(difficulty))}</span><span>施設依頼：不可</span></div>
    <div><b>結果：</b>${escapeHtml(book)}へ登録できる術式として定着します。</div>`;
}
function renderAntiqueRandomStock(){
  const result = $('facilityAntiqueStockResult');
  if(!result) return;
  ensureFacilityGeneralAreaState();syncFacilityGeneralAreaSummaries();
  const count = Math.max(1, Number($('facilityAntiqueStockCount')?.value || 3) || 3);
  const names=facilityGeneralSelectedNames(),maxRank=maxScrollRankForUnlockedAreas();
  const candidates = antiqueScrollRows().filter(row=>scrollRankAllowedForUnlockedAreas(row.rank||1));
  const rows = [];
  for(let i=0;i<count && candidates.length;i++) rows.push(candidates[Math.floor(Math.random()*candidates.length)]);
  currentAntiqueRandomRows=rows.map(r=>({...r}));
  currentAntiqueRandomArea=names.join('、');
  if(!rows.length){
    result.classList.add('muted');
    result.innerHTML = 'チェックした解放済みエリアでは販売可能な未鑑定スクロールがありません。';
    return;
  }
  result.classList.remove('muted');
  result.innerHTML = `<div><b>骨董屋ランダム販売枠</b></div><div class="muted small">解放済み：${escapeHtml(names.join('、')||'未設定')} / 上限:${escapeHtml(playerRankLabel(maxRank))} / 重複あり / 中身は鑑定まで非公開</div>` + rows.map(row=>{
    const label=String(row.name||'').trim() || `未鑑定の${unidentifiedScrollType(row)||'術式'}スクロール：${playerRankLabel(row.rank)||'ランク未設定'}`;
    const salePrice = row.buyPrice; const chips = [salePrice ? '価格:' + salePrice + 'G' : '', '内容:非公開'].filter(Boolean);
    return `<div class="facility-product-meta"><b>${escapeHtml(label)}</b>${chips.map(c=>`<span class="facility-chip">${escapeHtml(c)}</span>`).join('')}</div>`;
  }).join('');
}



function crystalSlotNumber(value){const m=String(value||'').match(/(\d+)/);return m?Math.max(2,Number(m[1])||2):2;}
function crystalUpgradeRows(){return facilityRecipeRows('クリスタル強化').slice().sort((a,b)=>crystalSlotNumber(a.resultItem)-crystalSlotNumber(b.resultItem));}
function crystalUnlockAreaName(row={}){if(String(row.unlockCondition||'').trim())return String(row.unlockCondition).trim();const key=String(row.unlockAreaKey||'').trim();const area=(state.exploration_areas||[]).find(a=>[a.id,a.unlockKey,a.name].map(v=>String(v||'').trim()).includes(key));return area?.name||key||'初期';}
function crystalRequiredOrder(row={}){const explicit=Number(row.unlockOrder);if(Number.isFinite(explicit)&&explicit>0)return explicit;const key=String(row.unlockAreaKey||'').trim();const area=(state.exploration_areas||[]).find(a=>String(a.id||'')===key);return Number(area?.unlockOrder)||1;}
function renderFacilityCrystalUpgradeCards(){
  const rows=crystalUpgradeRows();
  if(!rows.length)return '<p class="notice">クリスタル強化データがありません。</p>';
  return `<div class="crystal-upgrade-list">${rows.map(row=>`<div class="crystal-upgrade-card"><h5>${escapeHtml(row.name||'クリスタル強化')}</h5><div class="facility-product-meta"><span class="facility-chip">${escapeHtml(row.baseItem||'?')} → ${escapeHtml(row.resultItem||'?')}</span><span class="facility-chip">解放:${escapeHtml(crystalUnlockAreaName(row))}</span><span class="facility-chip">${escapeHtml(String(row.price||0))}G</span></div><div><b>必要素材：</b>${escapeHtml(row.requiredMaterials||'未設定')}</div>${row.effect?`<div><b>効果：</b>${escapeHtml(row.effect)}</div>`:''}</div>`).join('')}</div>`;
}
let currentSkillProgressAreaId='area_outskirts_grass'; // 旧単一選択との互換用
const SKILL_RANK_UNLOCK_RULES=Object.freeze({
  1:{stage:'1-2',areaKey:'area_nearby_forest',label:'1-2：近郊の森'},
  2:{stage:'3-2',areaKey:'area_sector3_2_tbd',label:'3-2通常エリア（未実装）'},
  3:{stage:'5-2',areaKey:'area_sector5_2_tbd',label:'5-2通常エリア（未実装）'},
  4:{stage:'7-2',areaKey:'area_sector7_2_tbd',label:'7-2通常エリア（未実装）'},
  5:{stage:'9-2',areaKey:'area_sector9_2_tbd',label:'9-2通常エリア（未実装）'}
});
const SKILL_CRYSTAL_UPGRADE_STAGE_BY_RANK=Object.freeze({2:'3-1',3:'5-1',4:'7-1',5:'9-1'});
function skillProgressAreas(){return facilityGeneralAreaRows();}
function syncSkillProgressFields(){ensureFacilityGeneralAreaState();syncFacilityGeneralAreaSummaries();}
function skillProgressOrder(){return facilityGeneralSelectedAreas().reduce((max,row)=>Math.max(max,Number(row.unlockOrder)||1),1);}
function skillRankUnlockRule(rank){return SKILL_RANK_UNLOCK_RULES[Math.max(1,Math.min(5,Number(rank)||1))]||null;}
function skillRankUnlockLabel(rank){const rule=skillRankUnlockRule(rank);return rule?`${rule.label}（★${Number(rank)}スキルガチャ解放）`:'未設定';}
function skillRankIsUnlocked(rank){const rule=skillRankUnlockRule(rank);return !!(rule&&facilityGeneralAreaUnlockedKey(rule.areaKey));}
function skillMaster(){ return {skills:Array.isArray(state.skills)?state.skills:[]}; }
function skillById(id=''){return (state.skills||[]).find(s=>String(s.id)===String(id))||null;}
function setSkillStatus(message='',type='ok'){
  currentSkillStatusMessage=message;currentSkillStatusType=type;
  ['facilitySkillGachaStatus','facilityCrystalStatus'].forEach(id=>{const el=$(id);if(!el)return;el.textContent=message;el.className='skill-admin-status '+type;});
}
function selectedSkillGachaRank(){return Math.max(1,Math.min(5,Number($('facilitySkillGachaRank')?.value||1)||1));}
function renderSkillProbabilityTable(){
  const body=$('facilitySkillGachaProbBody');if(!body||!window.RASkillGachaCore)return;
  const rank=selectedSkillGachaRank();const rows=RASkillGachaCore.probabilityRows(skillMaster(),rank).slice().sort((a,b)=>a.drawWeight-b.drawWeight||compareValues(a.name,b.name));
  body.innerHTML=rows.length?rows.map(s=>`<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.weaponType||s.category||'')}</td><td>${escapeHtml(String(s.drawWeight))}</td><td>${escapeHtml((s.probability*100).toFixed(4))}%</td></tr>`).join(''):`<tr><td colspan="4">★${rank}スキルはまだ登録されていません。</td></tr>`;
  if($('facilitySkillGachaRateSummary'))$('facilitySkillGachaRateSummary').textContent=`★${rank}排出率`;
}
function renderSkillGachaManagement(){
  syncSkillProgressFields();
  const rankSel=$('facilitySkillGachaRank');
  if(rankSel){[...rankSel.options].forEach(o=>o.disabled=!skillRankIsUnlocked(Number(o.value)));if(!skillRankIsUnlocked(Number(rankSel.value)))rankSel.value='1';}
  renderSkillProbabilityTable();
  const rank=selectedSkillGachaRank(),count=Math.max(1,Math.min(10,Number($('facilitySkillGachaCount')?.value||1)||1));
  if($('facilitySkillGachaCount'))$('facilitySkillGachaCount').value=String(count);
  if($('facilitySkillGachaCost'))$('facilitySkillGachaCost').textContent=`必要★合計：${(RASkillGachaCore?.COST_BY_RANK?.[rank]||0)*count} / 解放：${skillRankUnlockLabel(rank)}`;
  const pool=RASkillGachaCore?.enabledPool?.(skillMaster(),rank)||[];
  const drawBtn=document.querySelector('[data-skill-gacha-draw]');if(drawBtn)drawBtn.disabled=!skillRankIsUnlocked(rank)||!pool.length;
  const results=$('facilitySkillGachaResults');
  if(results)results.innerHTML=currentSkillDrawResults.length?currentSkillDrawResults.map(x=>`<details class="skill-result-card new"><summary>${escapeHtml(x.name||'名称未設定')}</summary><div class="skill-result-detail"><div><b>登録ID：</b>${escapeHtml(x.publicId||'未設定')}</div><div><b>ランク：</b>★${escapeHtml(String(x.rank||''))}</div><div><b>分類：</b>${escapeHtml(x.category||'未設定')}</div><div><b>武器種：</b>${escapeHtml(x.weaponType||'未設定')}</div><div><b>タイミング：</b>${escapeHtml(x.timing||'未設定')}</div><div><b>消費：</b>${escapeHtml(x.cost||'なし')}</div><div><b>CT：</b>${escapeHtml(x.ct||'なし')}</div><div class="skill-result-effect"><b>効果：</b>${escapeHtml(x.effect||'未設定')}</div></div></details>`).join(''):'<div class="skill-result-card"><div class="skill-result-detail">抽選結果はここに表示されます。</div></div>';
  const copyBtn=document.querySelector('[data-skill-gacha-copy]');if(copyBtn)copyBtn.disabled=!currentSkillDrawResults.length;
  setSkillStatus(skillRankIsUnlocked(rank)?'抽選結果だけを表示します。キャラクターの読込・保存は行いません。':`★${rank}スキルガチャは${skillRankUnlockLabel(rank)}で解放されます。`,skillRankIsUnlocked(rank)?'ok':'warn');
}
function renderCrystalManagement(){
  syncSkillProgressFields();
  const box=$('facilityCrystalUpgradeSummary');if(!box)return;
  const rows=crystalUpgradeRows();
  if(!rows.length){box.innerHTML='<div class="crystal-upgrade-card">クリスタル強化データがありません。</div>';return;}
  box.innerHTML=rows.map(row=>{
    const unlocked=facilityGeneralAreaUnlockedKey(row.unlockAreaKey);
    return `<div class="crystal-upgrade-card ${unlocked?'is-next':''}"><h5>${escapeHtml(row.name||'クリスタル強化')}</h5><div class="facility-product-meta"><span class="facility-chip">${escapeHtml(row.baseItem||'?')} → ${escapeHtml(row.resultItem||'?')}</span><span class="facility-chip">${escapeHtml(String(row.price||0))}G</span><span class="facility-chip">解放:${escapeHtml(crystalUnlockAreaName(row))}</span><span class="facility-chip">${unlocked?'表示対象':'未解放'}</span></div><div><b>必要素材：</b>${escapeHtml(row.requiredMaterials||'未設定')}</div>${row.effect?`<div><b>効果：</b>${escapeHtml(row.effect)}</div>`:''}</div>`;
  }).join('');
  setSkillStatus('チェックした解放済みエリアを個別に参照して、必要素材・金額・解放条件を表示します。異界も独立して判定します。','ok');
}
function renderSkillManagementPanels(){renderSkillGachaManagement();renderCrystalManagement();}
function skillGachaResultCopyText(){
  return currentSkillDrawResults.map((x,index)=>[
    `スキル名：${x.name||'名称未設定'}`,
    `登録ID：${x.publicId||'未設定'}`,
    `ランク：★${x.rank||''}`,
    `分類：${x.category||'未設定'}`,
    `武器種：${x.weaponType||'未設定'}`,
    `タイミング：${x.timing||'未設定'}`,
    `消費：${x.cost||'なし'}`,
    `CT：${x.ct||'なし'}`,
    `効果：${x.effect||'未設定'}`
  ].join('\n')).join('\n\n');
}
async function copySkillGachaResults(){
  if(!currentSkillDrawResults.length){toast('先に抽選結果を出してください');return;}
  const ok=await copyAdminTextDirect(skillGachaResultCopyText());
  if(ok)toast('スキルガチャ結果をコピーしました');
}

function executeSkillGacha(){
  try{
    const rank=selectedSkillGachaRank();
    if(!skillRankIsUnlocked(rank))throw new Error(`★${rank}スキルガチャは${skillRankUnlockLabel(rank)}で解放されます。`);
    const count=Math.max(1,Math.min(10,Number($('facilitySkillGachaCount')?.value||1)||1));
    const pool=RASkillGachaCore.enabledPool(skillMaster(),rank);
    if(!pool.length)throw new Error(`★${rank}の抽選対象がありません。`);
    currentSkillDrawResults=Array.from({length:count},()=>({...RASkillGachaCore.weightedPick(pool),rank}));
    renderSkillGachaManagement();
  }catch(e){setSkillStatus(String(e?.message||e),'bad');}
}

function facilityWorkKind(){
  const section=activeFacilitySection();
  if(currentFacilityView==='鍛冶屋' && section==='upgrade') return 'smithy';
  if(currentFacilityView==='鍛冶屋' && section==='crystal') return 'crystal';
  if(currentFacilityView==='薬屋' && section==='alchemy') return 'alchemy';
  if(currentFacilityView==='骨董屋' && ['antique_gear','random','appraisal','transcribe','skill_gacha'].includes(section)) return `antique-${section}`;
  return 'none';
}
function facilityAlchemyRecipeRows(kind='調合'){
  return (state.recipes || []).filter(r=>String(r.craftType || '').trim() === kind && String(r.resultItem || r.name || '').trim());
}
function findRecipeBySelectValue(value=''){
  const key = String(value || '').trim();
  if(!key) return null;
  const rows = facilityAlchemyRecipeRows('調合');
  return rows.find((r,i)=>String(i)===key)
    || rows.find(r=>String(r.resultItem || '').trim() === key)
    || rows.find(r=>String(r.name || '').trim() === key)
    || null;
}
function renderFacilityAlchemyLookupList(){
  const sel = $('facilityAlchemyRecipeSelect');
  if(!sel) return;
  const rows = facilityAlchemyRecipeRows('調合');
  const prev = sel.value;
  sel.innerHTML = rows.length
    ? `<option value="">作成するアイテムを選択してください</option>` + rows.map((r,i)=>`<option value="${i}">${escapeHtml(r.resultItem || r.name || '名称未設定')}</option>`).join('')
    : '<option value="">調合レシピがありません</option>';
  if(prev && [...sel.options].some(o=>o.value===prev)) sel.value = prev;
}
function renderFacilityAlchemyResult(recipeKey=''){
  const result = $('facilityAlchemyResult');
  if(!result) return;
  const row = findRecipeBySelectValue(recipeKey || $('facilityAlchemyRecipeSelect')?.value || '');
  const toolMax = normalizeToolRank($('facilityAlchemyToolRankInput')?.value || '3', 3);
  if(!row){
    result.classList.add('muted');
    result.innerHTML = '作成するアイテムを選択してください。';
    return;
  }
  const recipeRank = numericRankValueIncludingLegacyMaterialGrade(row.rank,1);
  const tool = toolDifficultyReduction(recipeRank, toolMax);
  const baseDifficulty=Number(String(row.difficulty||'').trim());
  const numericDifficulty=Number.isFinite(baseDifficulty);
  const finalDifficulty = tool.usable && numericDifficulty ? baseDifficulty-tool.reduction : (tool.usable ? String(row.difficulty||'未設定') : '使用不可');
  result.classList.remove('muted');
  const chips = [playerRankLabel(recipeRank), row.category ? '分類:' + row.category : '', row.resultCount ? '完成数:' + row.resultCount : '', row.requiredMaterials ? '必要素材あり' : ''].filter(Boolean);
  result.innerHTML = `<div><b>${escapeHtml(row.resultItem || row.name || '名称未設定')}</b></div>
    <div class="facility-product-meta">${chips.map(c=>`<span class="facility-chip">${escapeHtml(c)}</span>`).join('')}</div>
    <div><b>作成ランク：</b>${escapeHtml(playerRankLabel(recipeRank))}</div>
    <div><b>使用道具：</b>${escapeHtml(selectedToolText('facilityAlchemyToolRankInput'))} / ${tool.usable ? '使用可能' : '対応上限超過'}</div>
    <div><b>基礎作成難易度：</b>${escapeHtml(row.difficulty||'未設定')}</div>
    <div><b>道具による軽減：</b>${tool.usable&&numericDifficulty?`－${escapeHtml(String(tool.reduction))}`:'適用不可'}</div>
    <div><b>最終作成難易度：</b>${escapeHtml(finalDifficulty)}</div>
    ${row.requiredMaterials ? `<div><b>必要素材：</b>${escapeHtml(row.requiredMaterials)}</div>` : ''}
    ${row.description ? `<div><b>説明：</b>${escapeHtml(row.description)}</div>` : ''}`;
}
function renderFacilityWorkPanel(){
  const kind=facilityWorkKind();
  const panel=$('facilityWorkPanel');
  const title=$('facilityWorkTitle'), notice=$('facilityWorkNotice');
  const smithy=$('facilitySmithyWork'), crystal=$('facilityCrystalWork'), alchemy=$('facilityAlchemyWork'), antique=$('facilityAntiqueWork'), none=$('facilityNoWork');
  const show=kind!=='none'&&kind!=='smithy';
  if(panel) panel.classList.toggle('hidden',!show);
  if(smithy) smithy.classList.toggle('hidden',kind!=='smithy');
  if(crystal) crystal.classList.toggle('hidden',kind!=='crystal');
  if(alchemy) alchemy.classList.toggle('hidden',kind!=='alchemy');
  if(antique) antique.classList.toggle('hidden',!kind.startsWith('antique-'));
  if(none) none.classList.add('hidden');
  if(!show) return;
  if(kind==='smithy'){
    if(title) title.textContent='装備強化';
    if(notice) notice.textContent='自作は鍛冶道具＋素材、施設依頼は素材＋表示価格で行います。施設依頼の成功率には自作側の道具補正を適用しません。';
    renderUpgradeCountSelect($('facilityUpgradeCountInput')?.value||'0'); renderUpgradeStepSelect($('facilityUpgradeStepInput')?.value||'1'); renderToolRankSelect('facilitySmithToolRankInput',$('facilitySmithToolRankInput')?.value||'3'); renderFacilityUpgradeEquipmentSelect(); renderFacilityUpgradeLookupList(); renderFacilityGuaranteeSelect(); renderFacilityUpgradeResult($('facilityUpgradeMaterialInput')?.value||''); renderFacilityRemovalCalculator();
  }else if(kind==='crystal'){
    if(title) title.textContent='スキルクリスタル強化';
    if(notice) notice.textContent='選択した進行段階で利用できる強化について、必要素材・金額・解放条件を確認します。';
    renderCrystalManagement();
  }else if(kind==='alchemy'){
    if(title) title.textContent='調合';
    if(notice) notice.textContent='必要素材・作成ランク・難易度・施設依頼価格を確認します。';
    renderFacilityAlchemyLookupList(); renderToolRankSelect('facilityAlchemyToolRankInput',$('facilityAlchemyToolRankInput')?.value||'3'); renderFacilityAlchemyResult($('facilityAlchemyRecipeSelect')?.value||'');
  }else{
    const section=activeFacilitySection();
    if(title) title.textContent=section==='antique_gear'?'骨董装備ガチャ':section==='random'?'未鑑定スクロール':section==='appraisal'?'スクロール鑑定':section==='transcribe'?'集中術式化':'スキルガチャ';
    if(notice) notice.textContent=section==='antique_gear'?'魔物素材を使い、装備区分・武器種/防具種・★帯を指定して骨董屋専用装備を抽選します。個体ごとに基礎性能・属性・強化枠・固定強化内容が変化し、抽選後の強化追加・変更はできません。抽選だけではDBへ登録せず、採用する個体の「ID発行」を押した時だけ通常形式の登録ID（RCA-XXXX-XXXX）を発行して骨董個体DBへ保存します。通常装備を恒常的に上回らない範囲で生成します。':section==='random'?'未鑑定スクロールのランダム販売枠を抽選します。':section==='appraisal'?'種別とランクに一致する術式から鑑定結果をランダムに決定します。':section==='transcribe'?'対応素材と集中技能による術式化難易度を確認します。施設依頼はできません。':'進行段階とランクに応じた個別ウェイト抽選を行い、結果だけを表示します。';
    $('facilityAntiqueGearWork')?.classList.toggle('hidden',section!=='antique_gear');
    $('facilityAntiqueStockWork')?.classList.toggle('hidden',section!=='random');
    $('facilityAntiqueAppraisalWork')?.classList.toggle('hidden',section!=='appraisal');
    $('facilityAntiqueTranscribeWork')?.classList.toggle('hidden',section!=='transcribe');
    $('facilityAntiqueSkillGachaWork')?.classList.toggle('hidden',section!=='skill_gacha');
    if(section==='antique_gear') renderAntiqueGearStock();
    if(section==='appraisal') renderAntiqueAppraisalResult();
    if(section==='transcribe') renderAntiqueTranscriptionResult();
    if(section==='skill_gacha') renderSkillGachaManagement();
  }
}
function facilityUpgradeEquipmentRows(){
  let type=String($('facilityUpgradeEquipmentType')?.value||'武器').trim();
  if(type==='魔導書'||type==='祈祷書'){type='武器';if($('facilityUpgradeEquipmentType'))$('facilityUpgradeEquipmentType').value='武器';}
  return (state.items||[]).filter(r=>{
    if(String(r.dataKind||'').trim()!=='アイテム') return false;
    if(Number(r.upgradeLimit||0)<=0) return false;
    const itemType=String(r.itemType||'').trim();
    const itemCategory=String(r.itemCategory||'').trim();
    let typeMatch=false;
    if(type==='魔導書'||type==='祈祷書') typeMatch=(itemType==='武器'||itemType==='術式装備') && itemCategory===type;
    else if(type==='防具・盾') typeMatch=itemType==='防具'||itemType==='盾';
    else typeMatch=itemType===type;
    return typeMatch;
  });
}
function syncFacilityUpgradePickerButton(sel){
  if(!sel)return;
  const btn=sel.parentElement?.querySelector(':scope > .ra-manager-picker-button');
  const label=btn?.querySelector('[data-ra-manager-label]');
  if(label)label.textContent=String(sel.selectedOptions?.[0]?.textContent||'未選択').trim()||'未選択';
}
function renderFacilityUpgradeEquipmentSelect(){
  const sel=$('facilityUpgradeEquipmentSelect'); if(!sel)return;
  const prev=sel.value;
  const rows=facilityUpgradeEquipmentRows().slice().sort((a,b)=>numericRankValueIncludingLegacyMaterialGrade(a.rank,1)-numericRankValueIncludingLegacyMaterialGrade(b.rank,1)||String(a.name||'').localeCompare(String(b.name||''),'ja'));
  sel.innerHTML='<option value="">装備を選択</option>'+rows.map(r=>`<option value="${escapeHtml(r.name||r.id||'')}">${escapeHtml(r.name||r.id||'名称未設定')}（${escapeHtml(adminRankLabel(r.rank)||'ランク未設定')} / 最低素材${escapeHtml(playerRankLabel(equipmentUpgradeMinimumRank(r))) }）</option>`).join('');
  if([...sel.options].some(o=>o.value===prev)) sel.value=prev;
  syncFacilityUpgradePickerButton(sel);
}
function upgradeMaterialTarget(mat){
  const explicit=String(mat?.equipmentUpgradeTarget||'').trim(); if(explicit)return explicit;
  const e=String(mat?.equipmentUpgradeEffect||'');
  if(/防御|回避|耐性/.test(e)) return '防具';
  return e ? '武器' : '';
}
function upgradeMaterialTargetTypes(mat){
  const target=upgradeMaterialTarget(mat);
  return String(target||'').split(/[・、,，／/|]+/).map(v=>v.trim()).filter(Boolean);
}
function facilityUpgradeEquipmentTargetTokens(){
  const equipment=selectedUpgradeEquipment();
  let pickerType=String($('facilityUpgradeEquipmentType')?.value||'武器').trim();
  if(pickerType==='魔導書'||pickerType==='祈祷書')pickerType='武器';
  const tokens=new Set();
  if(equipment){
    const itemType=String(equipment.itemType||'').trim();
    const itemCategory=String(equipment.itemCategory||'').trim();
    if(itemType==='防具') tokens.add('防具');
    else if(itemType==='盾') tokens.add('盾');
    else if(itemType==='武器'||itemType==='術式装備'){
      // 魔導書・祈祷書も武器強化の対象。専用対象と汎用「武器」の両方を受ける。
      tokens.add('武器');
      if(itemCategory) tokens.add(itemCategory);
      if(itemCategory==='クロスボウ') tokens.add('クロスボウ');
      if(itemCategory==='ヘヴィクロスボウ') tokens.add('ヘヴィクロスボウ');
    }
  }else{
    // 装備未選択時は大分類だけで候補を作り、選択後に実装備へ絞り込む。
    if(pickerType==='防具・盾'){tokens.add('防具');tokens.add('盾');}
    else if(pickerType==='魔導書'||pickerType==='祈祷書'){tokens.add('武器');tokens.add(pickerType);}
    else tokens.add(pickerType);
  }
  return tokens;
}
function facilityUpgradeMaterialCompatible(mat){
  const targets=upgradeMaterialTargetTypes(mat);
  if(!targets.length)return true;
  const tokens=facilityUpgradeEquipmentTargetTokens();
  return targets.some(target=>tokens.has(target));
}
function facilityUpgradeMaterials({respectMinimum=true}={}){
  const equipment=selectedUpgradeEquipment();
  const minRank=equipment ? equipmentUpgradeMinimumRank(equipment) : 1;
  return (state.items||[]).filter(r=>{
    if(String(r.dataKind||'').trim()!=='素材'||String(r.materialType||'').trim()!=='魔物素材'||!String(r.equipmentUpgradeEffect||'').trim()||!facilityUpgradeMaterialCompatible(r)) return false;
    if(respectMinimum&&equipment&&numericRankValueIncludingLegacyMaterialGrade(r.rank,1)<minRank)return false;
    return true;
  });
}
function findUpgradeMaterialByName(name=''){
  const q=String(name||'').trim(); if(!q)return null;
  const rows=facilityUpgradeMaterials({respectMinimum:false});
  const norm=v=>String(v||'').trim().toLowerCase(), nq=norm(q);
  return rows.find(r=>norm(r.name)===nq)||rows.find(r=>norm(r.id)===nq)||rows.find(r=>norm(r.publicId)===nq)||rows.find(r=>norm(r.name).includes(nq))||rows.find(r=>norm(r.id).includes(nq))||rows.find(r=>norm(r.publicId).includes(nq))||null;
}
function renderFacilityUpgradeLookupList(){
  const input=$('facilityUpgradeMaterialInput');
  if(!input)return;
  const prev=input.value, equipment=selectedUpgradeEquipment();
  const minRank=equipment?equipmentUpgradeMinimumRank(equipment):1;
  let rows=facilityUpgradeMaterials({respectMinimum:true});
  if(prev&&!rows.some(r=>String(r.name||r.id||'').trim()===prev)){
    const selected=facilityUpgradeMaterials({respectMinimum:true}).find(r=>String(r.name||r.id||'').trim()===prev);
    if(selected)rows=[selected,...rows];
  }
  rows=rows.slice().sort((a,b)=>numericRankValueIncludingLegacyMaterialGrade(a.rank,1)-numericRankValueIncludingLegacyMaterialGrade(b.rank,1)||String(a.name||'').localeCompare(String(b.name||''),'ja'));
  const placeholder=equipment
    ?(rows.length?`${playerRankLabel(minRank)}以上の強化素材を選択`:`${playerRankLabel(minRank)}以上の対応素材がありません`)
    :'先に強化する装備を選択';
  input.innerHTML=`<option value="">${escapeHtml(placeholder)}</option>`+rows.map(m=>{
    const name=String(m.name||m.id||'').trim();
    const slotCost=upgradeSlotCostForMaterial(m);
    const effectName=equipmentUpgradeDisplayName(m);
    const label=[playerRankLabel(m.rank),`消費${slotCost}枠`,effectName,'対象:'+(upgradeMaterialTarget(m)||'未設定'),m.materialCategory||''].filter(Boolean).join(' / ');
    return `<option value="${escapeHtml(name)}">${escapeHtml(name)}（${escapeHtml(label)}）</option>`;
  }).join('');
  if(prev&&[...input.options].some(o=>o.value===prev))input.value=prev;
  syncFacilityUpgradePickerButton(input);
}
function renderFacilityUpgradeResult(materialName=''){
  const result=$('facilityUpgradeResult'); if(!result)return;
  const equipment=selectedUpgradeEquipment();
  if(!equipment){result.classList.add('muted');result.innerHTML='先に強化する装備を選択してください。';return;}
  const mat=findUpgradeMaterialByName(materialName||$('facilityUpgradeMaterialInput')?.value||'');
  if(!mat){result.classList.add('muted');result.innerHTML=`${escapeHtml(equipment.name||'選択装備')}の強化には${escapeHtml(playerRankLabel(equipmentUpgradeMinimumRank(equipment)))}以上の対応素材が必要です。`;return;}
  const equipmentName=String(equipment.name||'').trim();
  const equipmentType=String(equipment.itemType||equipment.itemCategory||$('facilityUpgradeEquipmentType')?.value||'武器').trim();
  const effect=String(mat.equipmentUpgradeEffect||'').trim(), detail=String(mat.equipmentUpgradeDetail||'').trim(), effectDisplay=equipmentUpgradeDisplayName(mat);
  const materialRank=numericRankValueIncludingLegacyMaterialGrade(mat.rank,1), minimumRank=equipmentUpgradeMinimumRank(equipment);
  const equipmentRank=numericRankValueIncludingLegacyMaterialGrade(equipment.rank,1);
  const rankAllowed=materialRank>=minimumRank;
  const rule=upgradeStepRule($('facilityUpgradeStepInput')?.value||'1');
  const difficulty=upgradeDifficultyPenalty(materialRank,minimumRank);
  const usedSlots=Math.max(0,Number(rule.usedSlots||0));
  const upgradeCount=Math.max(0,Number($('facilityUpgradeCountInput')?.value||0));
  const slotCost=upgradeSlotCostForMaterial(mat);
  const afterSlots=usedSlots+slotCost;
  const slotLimit=Math.max(0,Number(equipment.upgradeLimit||0));
  const capacityAllowed=!slotLimit||afterSlots<=slotLimit;
  const target=upgradeTargetValue(equipmentRank,upgradeCount);
  const toolMax=normalizeToolRank($('facilitySmithToolRankInput')?.value||'3',3);
  const tool=toolDifficultyReduction(materialRank,toolMax), price=upgradeWorkPrice(mat,rule,equipment);
  const toolReduction=tool.usable?tool.reduction:0;
  const supportCount=Math.max(0,Math.floor(Number($('facilityUpgradeSupportCountInput')?.value||0)));
  const supportReduction=supportCount*2;
  const finalTarget=target-toolReduction-supportReduction;
  const selfCraftUsable=rankAllowed&&tool.usable&&capacityAllowed;
  const facilityUsable=rankAllowed&&capacityAllowed;
  const guarantee=selectedFacilityGuaranteeItem();
  const guaranteeCap=Number(guarantee?.guaranteeUpgradeMaxRank||0);
  const guaranteeUsable=!!guarantee && guaranteeCap>=materialRank && facilityUsable;
  const successRate=facilityUpgradeSuccessRate(target,difficulty);
  result.classList.remove('muted');
  result.innerHTML=`<div><b>${escapeHtml(mat.name||mat.id||'素材名未設定')}</b></div>
    <div class="facility-product-meta">${[playerRankLabel(materialRank),'対象:'+(upgradeMaterialTarget(mat)||'未設定'),mat.materialCategory||'',mat.sellPrice?'素材売値:'+mat.sellPrice+'G':''].filter(Boolean).map(c=>`<span class="facility-chip">${escapeHtml(c)}</span>`).join('')}</div>
    <div><b>強化する装備：</b>${escapeHtml(equipmentName)}（${escapeHtml(equipmentType)} / ${escapeHtml(adminRankLabel(equipmentRank))}）</div>
    <div><b>必要素材最低ランク：</b>${escapeHtml(playerRankLabel(minimumRank))}以上</div>
    <div><b>選択素材ランク：</b>${escapeHtml(playerRankLabel(materialRank))}${rankAllowed?' / 使用可能':' / ランク不足'}</div>
    <div><b>強化難度：</b>${escapeHtml(String(difficulty))}（素材${escapeHtml(playerRankLabel(materialRank))}－最低${escapeHtml(playerRankLabel(minimumRank))}）</div>
    <div><b>現在の強化回数：</b>${escapeHtml(String(upgradeCount))}回（今回の強化は${escapeHtml(String(upgradeCount+1))}回目）</div>
    <div><b>現在の使用済み強化枠：</b>${escapeHtml(String(usedSlots))} / ${escapeHtml(String(slotLimit||'上限未設定'))}</div>
    <div><b>今回消費する強化枠：</b>${escapeHtml(String(slotCost))}（強化後 ${escapeHtml(String(afterSlots))}枠）${capacityAllowed?'':' / 枠不足'}</div>
    <div><b>基礎作成難易度：</b>${escapeHtml(String(target))}（7＋装備ランク${escapeHtml(String(equipmentRank))}＋現在の強化回数${escapeHtml(String(upgradeCount))}）</div>
    <div><b>道具による軽減：</b>－${escapeHtml(String(toolReduction))}</div>
    <div><b>任意の作成補助材：</b>強化定着剤（自作時のみ・任意個数）／1個につき作成難易度－2</div>
    <div><b>強化定着剤による軽減：</b>－${escapeHtml(String(supportReduction))}（${escapeHtml(String(supportCount))}個消費）</div>
    <div><b>最終作成難易度：</b>${escapeHtml(String(finalTarget))}</div>
    <div><b>自作判定：</b>${selfCraftUsable?`2D6＋細工－${escapeHtml(String(difficulty))} &gt;= ${escapeHtml(String(finalTarget))}`:'使用する鍛冶道具の対応上限不足、素材ランク不足、または強化枠不足'}</div>
    <div><b>使用する鍛冶道具（自作）：</b>${escapeHtml(selectedToolText('facilitySmithToolRankInput'))} / ${tool.usable?'使用可能':'素材ランクが対応上限を超過'}</div>
    <div><b>施設依頼成功率：</b>${facilityUsable?(guaranteeUsable?'100%（確定成功アイテム使用）':escapeHtml(String(successRate))+'%'):'強化不可'}</div>
    <div><b>確定成功アイテム：</b>${guarantee?`${escapeHtml(guarantee.name||'名称未設定')}（${escapeHtml(playerRankLabel(guaranteeCap))}以下） / ${guaranteeUsable?'使用可能':'対応上限外または他条件未達'}`:'使用しない'}</div>
    <div><b>施設依頼価格：</b>${facilityUsable?(price.total?`${escapeHtml(String(price.total))}G`:'未設定'):'素材ランク不足または強化枠不足のため算出対象外'}</div>
    <div><b>装備強化内容：</b>${escapeHtml(effectDisplay||'未設定')}</div>
    <div><b>効果説明：</b>${escapeHtml(detail||'未設定')}</div>`;
}
