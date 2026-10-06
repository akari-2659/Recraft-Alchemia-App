function boolLike(value) {
  const s = String(value ?? '').trim().toUpperCase();
  return s === 'TRUE' || s === '1' || s === 'YES' || s === 'Y' || s === '両手' || s === '有効';
}
function enabledLike(value) {
  const s = String(value ?? '').trim().toUpperCase();
  return s !== 'FALSE' && s !== '0' && s !== 'NO' && s !== 'N' && s !== '無効';
}

function defaultElementForEquipmentRow(row={}) {
  const explicit = String(row && (row.element || row.attribute || row.attributeType || row.elementName || row['属性'] || row['属性種別'] || row['攻撃属性'] || row['ダメージ属性']) || '').trim();
  if (explicit) return explicit;
  const text = [
    row && row.name,
    row && row.kind,
    row && row.category,
    row && row.itemCategory,
    row && row.equipSlot,
    row && row.slotKind,
    row && row.type
  ].map(v => String(v || '').trim()).filter(Boolean).join(' / ');
  if (!text) return '';
  if (/魔導書|祈祷書|魔印|聖印/.test(text)) return '';
  if (/弓|クロスボウ|クロスボウ|バリスタ/.test(text)) return '矢弾依存';
  if (/盾|大盾/.test(text) && !/剣|斧|槌|杖|槍|弓|クロスボウ|短剣/.test(text)) return '';
  const slotKind = (typeof equipmentSlotKind === 'function') ? equipmentSlotKind(row) : '';
  if (slotKind === 'hand' && /武器|近接|射撃|短剣|剣|斧|槌|杖|槍|鞭|弓|クロスボウ/.test(text)) return '物';
  if (/武器|近接武器|射撃武器/.test(text)) return '物';
  return '';
}

if (typeof window !== 'undefined') window.defaultElementForEquipmentRow = defaultElementForEquipmentRow;
function equipmentSlotKind(row) {
  const explicit = String(row && row.slotKind || '').trim();
  if (['hand','armor','accessory','carry'].includes(explicit)) return explicit;
  const slot = String(row && row.equipSlot || '').trim();
  if (slot.includes('鎧')) return 'armor';
  if (slot.includes('装飾')) return 'accessory';
  if (slot.includes('携' + '行') || slot.includes('所持')) return 'carry';
  if (slot.includes('なし')) return 'none';
  return 'hand';
}
function isTwoHandEquipment(row) {
  const slot = String(row && row.equipSlot || '').trim();
  const cat = String(row && row.itemCategory || '').trim();
  const h = String(row && row.hands || '').trim();
  return slot === '両手' || cat.includes('両手') || h === '2' || h === '両手' || boolLike(row && row.isTwoHand);
}
function uniqueNames(rows, slotKind) {
  const names = rows
    .filter(row => equipmentSlotKind(row) === slotKind && enabledLike(row.enabled))
    .sort((a,b) => Number(a.sortOrder || 9999) - Number(b.sortOrder || 9999))
    .map(row => String(row.name || '').trim())
    .filter(Boolean);
  const result = [];
  for (const name of names) if (!result.includes(name)) result.push(name);
  if (!result.includes('なし')) result.unshift('なし');
  return result;
}

function csItemVisible(row) {
  const s = String(row && row.csVisible !== undefined ? row.csVisible : 'TRUE').trim().toUpperCase();
  return s !== 'FALSE' && s !== '0' && s !== 'NO' && s !== 'N' && s !== '非表示';
}
function csItemKey(row) {
  return String(row && (row.id || row.name) || '').trim();
}
function inventoryItemKey(row) { return csItemKey(row); }
function equipmentCandidateRows() {
  return inventoryDerived().equipmentRows;
}
function findCsItemById(id) {
  const key = String(id || '').trim();
  if (!key) return null;
  return inventoryDerived().equipmentByKey.get(key) || null;
}
function findCsItemIdByName(name) {
  const n = String(name || '').trim();
  if (!n) return '';
  const row = inventoryDerived().equipmentByName.get(n);
  return row ? inventoryItemKey(row) : '';
}
function slotKindForCsItem(row) {
  const kind = normalizeInventoryKind(row && row.kind || 'アイテム');
  const slot = String(row && row.equipSlot || '').trim();
  if (isSpellInventoryItem(row) || kind === '術式' || kind === 'バッグ') return 'none';
  if (kind === '防具' && slot.includes('鎧')) return 'armor';
  if (kind === '装飾品' || slot.includes('装飾')) return 'accessory';
  if (slot.includes('携' + '行') || slot.includes('所持') || ['アイテム','素材','バッグ','重要品','その他'].includes(kind)) return 'carry';
  if (kind === '武器' || kind === '防具') return 'hand';
  return 'none';
}
function isTwoHandCsItem(row) {
  return String(row && row.equipSlot || '').trim() === '両手';
}
function itemMatchesEquipmentSlot(row, slot) {
  if (!row || !slot) return false;
  const kind = slotKindForCsItem(row);
  if (slot.kind === 'hand') return kind === 'hand';
  return kind === slot.kind;
}
function applyCsItemMaster(rows, {save=false, silent=false}={}) {
  // v50: 装備・所持品の候補はDBアイテムではなくキャラクターの倉庫から生成する。
  CS_ITEM_MASTER = [];
  if (save) localStorage.removeItem(CS_ITEM_CACHE_KEY);
  refreshEquipmentItemSelects();
  return true;
}
function loadCachedCsItems() { /* v50: 倉庫を候補にするためDBアイテム候補キャッシュは使いません。 */ }

function duplicateRestrictedEquipmentIdentity(row={}){
  const kind=normalizeInventoryKind(row.kind||row.itemType||row.itemCategory||row.category||'');
  const name=String(row.name||'').trim().normalize('NFKC');

  // 装飾品の既存「同一品2個同時装備不可」は維持する。
  if(kind==='装飾品'){
    const master=String(row.masterId||'').trim();
    const publicId=String(row.publicId||'').trim().toUpperCase();
    const fallbackId=String(row.id||'').trim();
    const identity=master||publicId||name||fallbackId;
    return identity?`装飾品:${identity}`:'';
  }

  // 左右手の制限対象は片手装備だけ。両手装備は既存の両手ロックで処理する。
  if(slotKindForCsItem(row)!=='hand'||isTwoHandCsItem(row))return '';

  if(isAntiqueIndividualItem(row)){
    // 骨董は個体名ではなく武器種/盾種単位。同じカテゴリの骨董を左右へ2つ持てない。
    const category=String(normalizeEquipmentType(row.itemCategory||row.category||row.type||'')).trim().normalize('NFKC');
    return category?`手装備:骨董:${category}`:(name?`手装備:骨董:${name}`:'');
  }

  // 通常の片手武器・盾は「同名」だけ禁止。別名の同武器種は左右同時装備可。
  return name?`手装備:通常:${name}`:'';
}
function duplicateRestrictedEquipmentMessage(row={},otherSlot=null){
  const name=String(row?.name||'').trim()||'名称未設定';
  if(slotKindForCsItem(row)==='hand'){
    if(isAntiqueIndividualItem(row)){
      const category=String(normalizeEquipmentType(row.itemCategory||row.category||row.type||'')).trim()||'同武器種';
      return `骨董装備は同じ武器種・盾種「${category}」を右手・左手へ同時に装備できません。`;
    }
    return `同名の片手武器・盾「${name}」は右手・左手へ同時に装備できません。`;
  }
  return `同じ装飾品「${name}」は2つ同時に装備できません。`;
}
function duplicateRestrictedEquipmentOtherSlot(slotKey='',row={}){
  const key=duplicateRestrictedEquipmentIdentity(row);
  if(!key)return null;
  for(const slot of BASE_EQUIPMENT_SLOTS){
    if(slot.key===slotKey)continue;
    const selectedKey=String($('equip_'+slot.key+'_itemSelect')?.value||'').trim();
    if(!selectedKey)continue;
    const selected=findCsItemById(selectedKey);
    if(selected&&duplicateRestrictedEquipmentIdentity(selected)===key)return slot;
  }
  return null;
}
function enforceUniqueWeaponAccessoryEquipment({notify=false}={}){
  const seen=new Map(), cleared=[];
  for(const slot of BASE_EQUIPMENT_SLOTS){
    const select=$('equip_'+slot.key+'_itemSelect');
    const selectedKey=String(select?.value||'').trim();
    if(!selectedKey)continue;
    const row=findCsItemById(selectedKey);
    const key=row?duplicateRestrictedEquipmentIdentity(row):'';
    if(!key)continue;
    if(seen.has(key)){
      cleared.push({slot,row,first:seen.get(key)});
      if(select){select.value='';select.dataset.previousItemKey='';}
      clearEquipmentSlotFields(slot.key,{keepSelection:true});
      if(typeof window.raSyncEquipmentPickerTrigger==='function'&&select)window.raSyncEquipmentPickerTrigger(select);
      continue;
    }
    seen.set(key,slot);
  }
  if(cleared.length&&notify){
    showToast('左右手の装備制限、または同一装飾品の制限により、重複分を外しました。','warn');
  }
  return cleared;
}

function refreshEquipmentItemSelects({slotKinds=null,slotKeys=null}={}) {
  const cache=inventoryDerived();
  const allowed=slotKinds ? new Set(Array.isArray(slotKinds)?slotKinds:[slotKinds]) : null;
  const allowedKeys=slotKeys ? new Set(Array.isArray(slotKeys)?slotKeys:[slotKeys]) : null;
  for (const slot of EQUIPMENT_SLOTS) {
    if(allowed && !allowed.has(slot.kind))continue;
    if(allowedKeys && !allowedKeys.has(slot.key))continue;
    const select = $('equip_' + slot.key + '_itemSelect');
    if (!select) continue;
    const current = select.value || '';
    const items = cache.equipmentBySlotKind[slot.kind] || [];
    const nameCounts=new Map();
    for(const item of items){const n=String(item.name||'').trim();if(n)nameCounts.set(n,(nameCounts.get(n)||0)+1);}
    const options = [`<option value="">${slot.kind === 'carry' ? '未選択（倉庫へ戻す）' : '未選択'}</option>`].concat(items.map(row => {
      const key = inventoryItemKey(row);
      const duplicateSlot = slot.kind!=='carry' ? duplicateRestrictedEquipmentOtherSlot(slot.key,row) : null;
      const multi=(nameCounts.get(String(row.name||'').trim())||0)>1;const individual=isAntiqueIndividualItem(row)||multi;const instance=individual?inventoryIndividualShortId(row):'';const individualStats=individual?[row.power?`威力:${row.power}`:'',row.defense?`防御:${row.defense}`:'',row.guard?`防御行動:${row.guard}`:'',`${isAntiqueIndividualItem(row)?'固定枠':'枠'}:${equipmentUpgradeUsedSlots(parseUpgradeLines(row.upgradeEntries||row.upgradeLines||''))}/${resolvedEquipmentUpgradeLimit(row)||0}`,antiqueIndividualEnhancementSummary(row)].filter(Boolean).join(' / '):'';
      const sourceLabel=slot.kind === 'carry' ? '倉庫:' + row.count : '';
      const label = [row.name,instance,row.kind,row.category,sourceLabel,row.element ? '属性:' + row.element : '',individualStats,duplicateSlot ? `${duplicateSlot.name}に装備中` : ''].filter(Boolean).join(' / ');
      return `<option value="${esc(key)}"${duplicateSlot?' disabled':''}>${esc(label)}</option>`;
    }));
    select.innerHTML = options.join('');
    let fallbackId='';
    if(!current){
      const name=String($('equip_' + slot.key + '_name')?.value || '').trim();
      const fallbackRow=name ? items.find(item=>String(item.name||'').trim()===name) : null;
      fallbackId=fallbackRow ? inventoryItemKey(fallbackRow) : '';
    }
    const nextValue = current || fallbackId;
    select.value = nextValue && Array.from(select.options).some(o=>o.value===nextValue) ? nextValue : '';
    // 候補再描画だけで切替前キーを上書きしない。実際の装備反映後に更新する。
    if(!String(select.dataset.previousItemKey || '').trim()) select.dataset.previousItemKey = select.value || '';
    if (typeof window.raSyncEquipmentPickerTrigger === 'function') {
      window.raSyncEquipmentPickerTrigger(select);
    }
  }
}
function setTypeSelectValue(slotKey, value) {
  const select = $('equip_' + slotKey + '_type');
  if (!select) return;
  const v = normalizeEquipmentType(value || 'なし');
  if (![...select.options].some(o => o.value === v)) {
    select.insertAdjacentHTML('beforeend', `<option value="${esc(v)}">${esc(v)}</option>`);
  }
  select.value = v;
}
function releaseCarryWarehouseAllocation(slotKey, {refresh=false}={}) {
  const allocation = carryWarehouseAllocationState[slotKey] || {};
  if (allocation.warehouseAllocated && allocation.count > 0) {
    adjustWarehouseItemCount(allocation.warehouseItemId, allocation.count);
  }
  carryWarehouseAllocationState[slotKey] = { warehouseAllocated:false, warehouseItemId:'', count:0, maxStack:99 };
  if (refresh) refreshWarehouseQuantityViews({quiver:false});
}
function clearCarrySlotFields(slotKey) {
  const select = $('equip_' + slotKey + '_itemSelect');
  if (select) select.value = '';
  if ($('equip_' + slotKey + '_name')) $('equip_' + slotKey + '_name').value = '';
  setTypeSelectValue(slotKey, 'なし');
  if ($('equip_' + slotKey + '_count')) {
    $('equip_' + slotKey + '_count').value = '1';
    $('equip_' + slotKey + '_count').max = '99';
  }
  if ($('equip_' + slotKey + '_description')) $('equip_' + slotKey + '_description').value = '';
  if ($('equip_' + slotKey + '_note')) $('equip_' + slotKey + '_note').value = '';
}
function applyWarehouseItemToCarrySlot(slotKey, row=null) {
  const nextId = row ? inventoryItemKey(row) : '';
  const old = carryWarehouseAllocationState[slotKey] || {};
  if (row && old.warehouseAllocated && old.warehouseItemId === nextId) return;
  releaseCarryWarehouseAllocation(slotKey);
  if (!row) {
    clearCarrySlotFields(slotKey);
    refreshWarehouseQuantityViews({quiver:false});
    updateEquipmentSummaries();
    applyBagCapacityToEquipmentSlots();
    return;
  }
  const available = Number(row.count || 0);
  if (available <= 0) {
    clearCarrySlotFields(slotKey);
    refreshWarehouseQuantityViews({quiver:false});
    showToast('倉庫に残っている個数がありません。', 'warn');
    return;
  }
  const maxStack = inventoryStackLimit(row);
  const count = Math.min(maxStack, available, 99);
  if (!adjustWarehouseItemCount(nextId, -count, row.name)) return;
  carryWarehouseAllocationState[slotKey] = { warehouseAllocated:true, warehouseItemId:nextId, count, maxStack };
  if ($('equip_' + slotKey + '_name')) $('equip_' + slotKey + '_name').value = row.name || '';
  setTypeSelectValue(slotKey, row.category || row.kind || 'なし');
  if ($('equip_' + slotKey + '_count')) {
    $('equip_' + slotKey + '_count').value = String(count);
    $('equip_' + slotKey + '_count').max = String(Math.min(maxStack, 99));
  }
  if ($('equip_' + slotKey + '_description')) $('equip_' + slotKey + '_description').value = row.description || '';
  if ($('equip_' + slotKey + '_note')) $('equip_' + slotKey + '_note').value = row.effect || '';
  refreshWarehouseQuantityViews({quiver:false});
  updateEquipmentSummaries();
  applyBagCapacityToEquipmentSlots();
}
function updateCarryWarehouseAllocationCount(slotKey, rawValue) {
  const allocation = carryWarehouseAllocationState[slotKey] || {};
  if (!allocation.warehouseAllocated) return;
  const warehouse = warehouseItemByKey(allocation.warehouseItemId);
  const available = Number(warehouse?.count || 0);
  const desired = clampInt(rawValue || 1, 1, Math.min(allocation.maxStack || 99, 99));
  const allowed = Math.min(desired, Number(allocation.count || 0) + available);
  const delta = allowed - Number(allocation.count || 0);
  if (delta > 0) adjustWarehouseItemCount(allocation.warehouseItemId, -delta);
  if (delta < 0) adjustWarehouseItemCount(allocation.warehouseItemId, -delta);
  carryWarehouseAllocationState[slotKey] = { ...allocation, count:allowed };
  const input = $('equip_' + slotKey + '_count');
  if (input) input.value = String(allowed);
  if (allowed !== desired) showToast(`倉庫在庫の範囲で${allowed}個に調整しました。`, 'warn');
  refreshWarehouseQuantityViews({quiver:false});
  updateEquipmentSummaries();
  applyBagCapacityToEquipmentSlots();
}
function applyCsItemToEquipmentSlot(slotKey) {
  const select = $('equip_' + slotKey + '_itemSelect');
  const previousItemKey = String(select?.dataset.previousItemKey || '').trim();
  const nextItemKey = String(select?.value || '').trim();
  const row = findCsItemById(nextItemKey);
  if(row&&!isCarrySlotKey(slotKey)){
    const duplicateSlot=duplicateRestrictedEquipmentOtherSlot(slotKey,row);
    if(duplicateSlot){
      if(select){
        select.value=previousItemKey&&Array.from(select.options).some(o=>o.value===previousItemKey)?previousItemKey:'';
        if(typeof window.raSyncEquipmentPickerTrigger==='function')window.raSyncEquipmentPickerTrigger(select);
      }
      showToast(duplicateRestrictedEquipmentMessage(row,duplicateSlot),'warn');
      const slotKind=EQUIPMENT_SLOTS.find(v=>v.key===slotKey)?.kind;
      if(slotKind)refreshEquipmentItemSelects({slotKinds:[slotKind]});
      return;
    }
  }
  if (previousItemKey && previousItemKey !== nextItemKey) {
    syncEquipmentModifiersToInventoryItem(slotKey, previousItemKey);
    syncEquipmentUpgradeToInventoryItem(slotKey, previousItemKey);
    syncEquippedSpellSetToInventoryItem(slotKey, previousItemKey);
  }
  if (isCarrySlotKey(slotKey)) {
    if (row && isSpellInventoryItem(row)) {
      if (select) select.value = '';
      showToast('所持品には術式を直接選択できません。魔導書/祈祷書などの術式枠から選択してください。', 'warn');
      return;
    }
    applyWarehouseItemToCarrySlot(slotKey, row);
    updateSummary();
    return;
  }
  if (!row) {
    // 倉庫装備を外したときは、旧武器の表示値・補正値・強化内容を装備枠へ残さない。
    // 装備枠の表示値は倉庫で選択した装備からのみ読み込む。
    if (previousItemKey) clearEquipmentSlotFields(slotKey, {keepSelection:true});
    if(select) select.dataset.previousItemKey='';
    const emptiedSlot=EQUIPMENT_SLOTS.find(v=>v.key===slotKey);
    if(emptiedSlot&&['hand','accessory'].includes(emptiedSlot.kind))refreshEquipmentItemSelects({slotKinds:[emptiedSlot.kind]});
    updateEquipmentHandLocks(true);
    updateCombatStats();
    updateSpellSlotHints();
    updateEquipmentSummaries();
    updateSummary();
    return;
  }
  const typeValue = row.category || row.kind || 'なし';
  if ($('equip_' + slotKey + '_name')) $('equip_' + slotKey + '_name').value = row.name || '';
  setTypeSelectValue(slotKey, typeValue);
  if ($('equip_' + slotKey + '_count')) $('equip_' + slotKey + '_count').value = Math.min(Number(row.count) || 1, 99);
  // 切替前装備の表示値を先に完全クリアし、選択した装備個体の値だけを読み込む。
  for (const suffix of ['element','power','offhand','reloadTurns','target','upgradeLimit','upgradeLines']) {
    const el = $('equip_' + slotKey + '_' + suffix);
    if (el) el.value = '';
  }
  renderEquipmentUpgradeSlots(slotKey, []);
  const map = { element:'element', power:'power', offhand:'offhand', reloadTurns:'reloadTurns', target:'target', upgradeLimit:'upgradeLimit' };
  const selectedItemFallbacks = {};
  for (const [suffix, field] of Object.entries(map)) {
    const el = $('equip_' + slotKey + '_' + suffix);
    if (!el) continue;
    const value = field==='upgradeLimit' ? resolvedEquipmentUpgradeLimit(row) : row[field];
    el.value = value !== undefined && value !== null && String(value).trim() !== '' ? value : (selectedItemFallbacks[field] || '');
  }
  const usageSkillEl=$('equip_' + slotKey + '_checkType');
  if(usageSkillEl) usageSkillEl.value = (!['盾','大盾'].includes(typeValue)) ? canonicalWeaponUsageSkill(row) : '';
  const restoredModifiers = serializeModifierRows(equipmentModifierRows(row));
  if ($('equip_' + slotKey + '_modifiers')) $('equip_' + slotKey + '_modifiers').value = restoredModifiers;
  renderModifierReadOnly('equip_' + slotKey + '_modifierRows', restoredModifiers);
  renderEquipmentUpgradeSlots(slotKey, row.upgradeEntries || row.upgradeLines || []);
  const description = row.description || '';
  const effectText = row.effect || '';
  if ($('equip_' + slotKey + '_description')) $('equip_' + slotKey + '_description').value = description;
  if ($('equip_' + slotKey + '_note')) $('equip_' + slotKey + '_note').value = effectText;
  if (!spellContainerKind(typeValue)) {
    if ($('equip_' + slotKey + '_knownSpells')) $('equip_' + slotKey + '_knownSpells').value = '';
    setSpellSelectValues(slotKey, []);
  } else {
    setSpellSelectValues(slotKey, row.setSpells || '');
    refreshSpellSetSelect(slotKey, spellContainerKind(typeValue));
  }
  if (select) select.dataset.previousItemKey = select.value || '';
  const equippedSlot=EQUIPMENT_SLOTS.find(v=>v.key===slotKey);
  if(equippedSlot&&['hand','accessory'].includes(equippedSlot.kind))refreshEquipmentItemSelects({slotKinds:[equippedSlot.kind]});
  updateEquipmentHandLocks(true);
  // 装備変更は回避などの技能「その他」にも影響するため、派生値をまとめて更新する。
  updateAll();
}
function selectedCsItemIsTwoHand(slotKey) {
  const row = findCsItemById($('equip_' + slotKey + '_itemSelect')?.value || '');
  return !!(row && isTwoHandCsItem(row));
}

function applyEquipmentCategoryMaster(rows, {save=false, silent=false, meta=null, auto=false}={}) {
  if (!Array.isArray(rows) || !rows.length) return false;
  const active = rows.filter(row => row && row.name && enabledLike(row.enabled));
  if (!active.length) return false;
  DB_EQUIPMENT_CATEGORY_MASTER=active.map(row=>({...row,intrinsicEffects:parseEquipmentEffects(row.intrinsicEffects)}));
  const namesByKind = {
    hand: uniqueNames(active, 'hand'),
    armor: uniqueNames(active, 'armor'),
    accessory: uniqueNames(active, 'accessory'),
    carry: uniqueNames(active, 'carry')
  };
  for (const slot of EQUIPMENT_SLOTS) {
    if (namesByKind[slot.kind] && namesByKind[slot.kind].length) slot.typeOptions = namesByKind[slot.kind];
  }
  TWO_HAND_TYPES.clear();
  for (const row of active) {
    const name = String(row.name || '').trim();
    if (!name || name === 'なし') continue;
    EQUIPMENT_PRESETS[name] = {
      element: row.element || defaultElementForEquipmentRow(row),
      power: row.power || '',
      offhand: row.offhandBonus || '',
      reloadTurns: row.reloadTurns || '',
      modifiers: migratedModifierTextForItem(row),
      description: row.description || row['fla' + 'vor' + 'Text'] || '',
      note: row.effect || ''
    };
    if (isTwoHandEquipment(row)) TWO_HAND_TYPES.add(name);
  }
  const cacheMeta = { ...(meta || buildEquipmentCategoryLocalMeta(active)), scopeKey: equipmentScopeKey() };
  if (save) {
    localStorage.setItem(EQUIPMENT_CATEGORY_CACHE_KEY, JSON.stringify({ rows: active, meta: cacheMeta }));
    localStorage.setItem(EQUIPMENT_CATEGORY_CACHE_META_KEY, JSON.stringify(cacheMeta));
  }
  refreshEquipmentTypeSelects();
  const status = $('equipmentCategoryStatus');
  if (status) {
    const suffix = auto ? ' / 自動更新済み' : '';
    status.textContent = `倉庫から選択カテゴリ：${active.length}件反映済み${suffix}`;
  }
  if (!silent) showToast(auto ? `倉庫から選択カテゴリを自動更新しました（${active.length}件）` : `倉庫から選択カテゴリを反映しました（${active.length}件）`, 'ok');
  return true;
}
function refreshEquipmentTypeSelects() {
  for (const slot of EQUIPMENT_SLOTS) {
    const select = $('equip_' + slot.key + '_type');
    if (!select) continue;
    const current = normalizeEquipmentType(select.value || 'なし');
    select.innerHTML = slot.typeOptions.map(op => `<option value="${esc(op)}">${esc(op)}</option>`).join('');
    select.value = slot.typeOptions.includes(current) ? current : 'なし';
  }
  updateEquipmentHandLocks(false);
  updateCombatStats();
}

function buildEquipmentCategoryLocalMeta(rows) {
  const compact = (rows || []).map(row => ({
    id: row.id || '', name: row.name || '', itemCategory: row.itemCategory || '', equipSlot: row.equipSlot || '',
    skill: row.skill || '', power: row.power || '', offhandBonus: row.offhandBonus || '', reloadTurns: row.reloadTurns || '', modifiers: row.modifiers || '',
    description: row.description || row['fla' + 'vor' + 'Text'] || '', effect: row.effect || '', sortOrder: row.sortOrder || '', enabled: row.enabled || ''
  }));
  return { hash: simpleHash(JSON.stringify(compact)), count: rows.length, generatedAt: nowIso(), source: 'local', scopeKey: equipmentScopeKey() };
}
function simpleHash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  return String(h >>> 0);
}
function readCachedEquipmentCategoryPayload() {
  try {
    const raw = localStorage.getItem(EQUIPMENT_CATEGORY_CACHE_KEY);
    if (!raw) return { rows: [], meta: null };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const meta = JSON.parse(localStorage.getItem(EQUIPMENT_CATEGORY_CACHE_META_KEY) || 'null');
      return { rows: parsed, meta };
    }
    const meta = parsed.meta || JSON.parse(localStorage.getItem(EQUIPMENT_CATEGORY_CACHE_META_KEY) || 'null');
    return { rows: parsed.rows || [], meta };
  } catch (e) {
    localStorage.removeItem(EQUIPMENT_CATEGORY_CACHE_KEY);
    localStorage.removeItem(EQUIPMENT_CATEGORY_CACHE_META_KEY);
    return { rows: [], meta: null };
  }
}

function loadCachedEquipmentCategories() {
  const cached = readCachedEquipmentCategoryPayload();
  if (!Array.isArray(cached.rows) || !cached.rows.length) return false;
  try {
    return applyEquipmentCategoryMaster(cached.rows, {silent:true, meta:cached.meta});
  } catch (e) {
    // 旧版・破損キャッシュが初期化そのものを止めないよう破棄して続行する。
    try { localStorage.removeItem(EQUIPMENT_CATEGORY_CACHE_KEY); } catch (_) {}
    try { localStorage.removeItem(EQUIPMENT_CATEGORY_CACHE_META_KEY); } catch (_) {}
    console.warn('装備カテゴリのキャッシュ反映に失敗したため破棄しました。', e);
    return false;
  }
}
async function loadEquipmentCategoriesFromDb({silent=false, auto=false, force=false}={}) {
  const res = await loadCharacterSheetMasterWithFallback({force});
  setDbCharacterSheetMaster(res || {});
  const rows = res.equipment_categories || [];
  if (!rows.length) throw new Error('共通DBとGASの装備カテゴリが空です。');
  applyEquipmentCategoryMaster(rows, {save:true, silent:true, auto, meta:res.equipment_categories_meta || res.meta});
  applyCsItemMaster(res.cs_items || [], {save:true, silent:true});
  const sourceLabel = characterSheetMasterSourceLabel(res);
  const status = $('equipmentCategoryStatus');
  if (status) {
    status.textContent =
      `${sourceLabel}${auto ? ' / 自動更新済み' : ''}` +
      `${res.__source === 'gas' && res.__githubError ? ' / GitHub取得失敗のため切替' : ''}`;
  }
  if (!silent) {
    showToast(
      res.__source === 'github'
        ? 'GitHub共通DBを再読込しました。'
        : 'GitHub共通DBを取得できなかったためGASから読み込みました。',
      res.__source === 'github' ? 'ok' : 'warn'
    );
  }
  return {
    rows,
    items: res.cs_items || [],
    meta: res.equipment_categories_meta || res.meta || null,
    source: res.__source || ''
  };
}
async function autoSyncEquipmentCategoriesFromDb() {
  const status = $('equipmentCategoryStatus');
  try {
    if (status) status.textContent = 'GitHub共通DBを確認中…';
    await loadEquipmentCategoriesFromDb({silent:true, auto:true});
  } catch (e) {
    if (status) status.textContent = '共通DBとGASの自動確認に失敗：' + e.message;
  }
}


async
