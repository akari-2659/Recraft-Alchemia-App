const SKILL_CATEGORY_ORDER=['全て','武器専用','汎用戦闘','探索系'];
const INVENTORY_LOCATION_FILTERS = ['全て'];
const INVENTORY_LOCATION_OPTIONS = ['倉庫'];
const INVENTORY_KIND_OPTIONS = ['アイテム','素材','武器','防具','装飾品','バッグ','矢筒','術式','レシピ','重要品','その他'];
const INVENTORY_KIND_TOKEN = { '武器':'weapon', '防具':'armor', '装飾品':'accessory', 'アイテム':'item', '素材':'material', 'バッグ':'bag', '矢筒':'quiver', '術式':'spell', 'レシピ':'recipe', '重要品':'important', 'その他':'other' };
const INVENTORY_SMALL_CATEGORY_ORDER = ['武器','防具','盾','装飾品','調合品','道具','特殊矢弾','収納具','素材','スクロール','換金品','レシピ','術式','スキル','重要アイテム','重要品','その他'];
const INVENTORY_MATERIAL_TYPE_ORDER = ['食材','魔物素材','採取素材','加工素材','特殊素材'];
function canonicalInventoryMaterialType(value=''){
  const raw=String(value||'').trim();
  if(['モンスタードロップ','魔物ドロップ','敵素材'].includes(raw)) return '魔物素材';
  return raw;
}
function rebuildInventoryMasterClassificationIndex(){
  const byId=new Map(), byPublicId=new Map(), byName=new Map();
  for(const row of (DB_INITIAL_ITEM_MASTER||[])){
    const id=String(row.id||'').trim();
    const publicId=String(row.publicId||'').trim().toUpperCase();
    const name=canonicalInventoryItemName(row.name||'');
    if(id) byId.set(id,row);
    if(publicId) byPublicId.set(publicId,row);
    if(name) byName.set(name,row);
  }
  DB_INITIAL_ITEM_MASTER_INDEX={byId,byPublicId,byName};
}
function inventoryMasterRowForClassification(item={}){
  const index=DB_INITIAL_ITEM_MASTER_INDEX||{};
  const masterId=String(item.masterId||item.masterID||item.sourceId||item.sourceID||'').trim();
  const ownId=String(item.id||'').trim();
  const publicId=String(item.publicId||item.publicID||'').trim().toUpperCase();
  const name=canonicalInventoryItemName(item.name||'');
  return (masterId && index.byId?.get(masterId))
    || (ownId && index.byId?.get(ownId))
    || (publicId && index.byPublicId?.get(publicId))
    || (name && index.byName?.get(name))
    || null;
}
const LEGACY_WEAPON_NAME_ALIASES = Object.freeze({"魔導書":"グリモア","アルカナ・コーデックス":"アルカナコーデックス","祈祷書":"ミサル","ウィンドラス・クロスボウ":"ウィンドラスクロスボウ","バグ・ナク":"バグナク","グラスホーン・アンカー":"グラスホーンアンカー","サルヴェ・ミサル":"サルヴェミサル","イージス・リタニー":"イージスリタニー","アクア・リフレイン":"アクアリフレイン","ヴォイド・レクイエム":"ヴォイドレクイエム","ミラー・グリモア":"ミラーグリモア","アストラル・コーデックス":"アストラルコーデックス","リフレクト・ミサル":"リフレクトミサル","アビサル・リタニー":"アビサルリタニー","ミラージュ・ボルター":"ミラージュボルター","ファントム・ピアサー":"ファントムピアサー","リフト・デストロイヤー":"リフトデストロイヤー","アビス・スコーピオン":"アビススコーピオン","アビス・リーパー":"アビスリーパー","シルフィード・アーチ":"シルフィードアーチ","フェザー・ハント":"フェザーハント","シェル・ブレイカー":"シェルブレイカー","ゼファー・ボルター":"ゼファーボルター","フォートレス・アーバレスト":"フォートレスアーバレスト","マイア・カノン":"マイアカノン","マイセリア・グリモア":"マイセリアグリモア","シルヴァン・ミサル":"シルヴァンミサル","ヴェルデ・スティング":"ヴェルデスティング","シルヴァ・エッジ":"シルヴァエッジ","マイア・スティング":"マイアスティング","ホーン・レガリア":"ホーンレガリア","シルヴァン・ガード":"シルヴァンガード","マイア・セイバー":"マイアセイバー","グラス・クリーヴァ":"グラスクリーヴァ","エルダー・ハチェット":"エルダーハチェット","ボグ・クリーヴァ":"ボグクリーヴァ","ホーン・クラッシャー":"ホーンクラッシャー","ウッドランド・メイス":"ウッドランドメイス","マイア・クラッシャー":"マイアクラッシャー","ヴェルデ・ランサー":"ヴェルデランサー","マイア・スピア":"マイアスピア","ホーン・セプター":"ホーンセプター","シルヴァン・ロッド":"シルヴァンロッド","ミアズマ・ロッド":"ミアズマロッド","ヴェルデ・ストライド":"ヴェルデストライド","エルダー・リーフ":"エルダーリーフ","マレア・リフレイン":"マレアリフレイン","ヴェルデ・ボルター":"ヴェルデボルター","グリーン・ワーデン":"グリーンワーデン","マレア・ボルター":"マレアボルター","グランド・ホーン":"グランドホーン","フォレスト・バスティオン":"フォレストバスティオン","マイア・バリスタ":"マイアバリスタ","マイア・ランサー":"マイアランサー","グラス・テンペスト":"グラステンペスト","エルダー・ガード":"エルダーガード","ボグ・クレイモア":"ボグクレイモア","ハートウッド・モール":"ハートウッドモール","マイア・モール":"マイアモール","アイヴィ・サイス":"アイヴィサイス","ミアズマ・サイス":"ミアズマサイス","ホーン・ブレイサー":"ホーンブレイサー","シルヴァン・グリーヴ":"シルヴァングリーヴ","ボグ・ブレイサー":"ボグブレイサー","アイヴィ・ウィップ":"アイヴィウィップ","ミアズマ・ウィップ":"ミアズマウィップ","ヴェルダント・グリモア":"ヴェルダントグリモア","シルヴァン・コーデックス":"シルヴァンコーデックス","マイア・グリモア":"マイアグリモア","ヴェルダント・ミサル":"ヴェルダントミサル","マイア・リタニー":"マイアリタニー","クリスタル・リタニー":"クリスタルリタニー","黒鉄の短剣":"クロガネスティレット","黒鉄の剣":"クロガネセイバー","岩割りの斧":"ロックハチェット","山鳴りの槌":"ロアメイス","岩貫きの槍":"ロックピアサー","燐晶の杖":"リンショウスタッフ","鉄弦の弓":"アイアンストリング","岩穿ちのクロスボウ":"ロックボーラー","坑道破りの大クロスボウ":"トンネルブレイカー","地脈の長槍":"レイラインパイク","黒鉄の大剣":"クロガネクレイモア","断岩の大槌":"ロックブレイカーモール","鉱脈の大鎌":"ヴェインサイズ","黒鉄の拳甲":"クロガネナックル","鋼線の鞭":"スチールワイヤー","燐晶の魔導書":"リンショウグリモア","地脈の祈祷書":"レイラインミサル","苔守りの長槍":"モスガードパイク","水走りの拳甲":"アクアランナーナックル","穿王の牙":"グランドファング","地脈の剣":"レイラインセイバー","穿岩の斧":"ロックリーヴァ","地鳴りの槌":"クエイクメイス","穿王の短槍":"グランドピアサー","地脈晶の杖":"ジオクリスタルロッド","山鳴りの弓":"エコーストリング","穿岩のクロスボウ":"ロックドリラー","穿王の大クロスボウ":"グランドバリスタ","穿王の長槍":"グランドランサー","地割れの大剣":"リフトクレイモア","穿王の大槌":"グランドモール","地層断ちの大鎌":"ストラタサイズ","穿王の拳甲":"グランドナックル","地脈の鋼鞭":"レイラインチェイン","地脈晶の魔導書":"ジオクリスタルグリモア","山守りの祈祷書":"ガーディアンミサル"});
function canonicalInventoryItemName(name){
  const raw = String(name || '').trim();
  return LEGACY_WEAPON_NAME_ALIASES[raw] || raw;
}
let inventoryViewFilter = { location:'全て', itemType:'全て', category:'全て', search:'' };
let inventoryItemsState = [];
let learnedRecipesState = [];
let inventoryDisplayMode = 'warehouse';
let inventoryUiDirty = true;
function inventoryTabIsActive(){ const el=$('tabInventory'); return !!el && el.classList.contains('active'); }
function markInventoryUiDirty(){ inventoryUiDirty=true; }
let learnedContentType = 'spell';
const inventoryCardOpenState = new Map();
let selectedBagId = '';
let selectedQuiverId = '';
let quiverAmmoSlotsState = {};
let carryWarehouseAllocationState = {};
let loadoutPresetsState = { equipment:[], carry:[] };
let inventoryMasterSyncVersion = '';

// v90.8.457: 倉庫派生データを1回だけ作り、同じ操作内で何度も全件normalize/filterしない。
let inventoryStateRevision = 0;
let inventoryDerivedCache = null;
function invalidateInventoryDerivedCache(){
  inventoryStateRevision++;
  inventoryDerivedCache = null;
}
function inventoryDerived(){
  if(inventoryDerivedCache && inventoryDerivedCache.revision===inventoryStateRevision && inventoryDerivedCache.masterSource===DB_INITIAL_ITEM_MASTER) return inventoryDerivedCache;
  const rows=(inventoryItemsState||[]).map((raw,index)=>{
    const normalized=normalizeInventoryItem(raw||{});
    if(inventoryItemsState[index]!==normalized) inventoryItemsState[index]=normalized;
    return normalized;
  });
  const virtualRows=gmMasterVirtualRows(); // 「全アイテム」カタログ専用。装備・倉庫候補には混ぜない。
  const indexByLookup=new Map(), rowByLookup=new Map(), rowByName=new Map();
  const equipmentRows=[], equipmentBySlotKind={hand:[],armor:[],accessory:[],carry:[]};
  const equipmentByKey=new Map(), equipmentByName=new Map();
  const bags=[], quivers=[], ammoRows=[], warehouseRows=[];
  const internalByType=new Map(), smallPresent=new Set();
  const addLookup=(value,index,row,{actual=true}={})=>{
    const key=String(value||'').trim();
    if(!key)return;
    if(actual&&!indexByLookup.has(key))indexByLookup.set(key,index);
    if(!rowByLookup.has(key))rowByLookup.set(key,row);
  };
  const addCandidateRow=(row,index,{actual=true}={})=>{
    const itemKey=inventoryItemKey(row);
    addLookup(itemKey,index,row,{actual});
    addLookup(row.id,index,row,{actual});
    addLookup(row.masterId,index,row,{actual});
    addLookup(String(row.publicId||'').trim().toUpperCase(),index,row,{actual});
    const name=String(row.name||'').trim();
    if(name&&!rowByName.has(name))rowByName.set(name,row);
    if(isBagInventoryItem(row)) bags.push(row);
    if(isQuiverInventoryItem(row)) quivers.push(row);
    if(isQuiverAmmoInventoryItem(row)) ammoRows.push(row);
    if(row.name && row.kind!=='レシピ' && row.kind!=='バッグ' && !isSpellInventoryItem(row)){
      equipmentRows.push(row);
      const slotKind=slotKindForCsItem(row);
      if(equipmentBySlotKind[slotKind])equipmentBySlotKind[slotKind].push(row);
      if(itemKey&&!equipmentByKey.has(itemKey))equipmentByKey.set(itemKey,row);
      if(name&&!equipmentByName.has(name))equipmentByName.set(name,row);
    }
  };
  rows.forEach((row,index)=>{
    addCandidateRow(row,index,{actual:true});
    const learnedSpell=isSpellInventoryItem(row) && inventorySmallCategory(row)==='術式';
    if(!learnedSpell){
      warehouseRows.push(row);
      const small=inventorySmallCategory(row);
      const internal=inventoryInternalCategory(row);
      if(small)smallPresent.add(small);
      if(small&&internal){
        if(!internalByType.has(small))internalByType.set(small,new Set());
        internalByType.get(small).add(internal);
      }
    }
  });
  // 共通DBは「全アイテム」タブから倉庫へ追加した後にだけ、装備・バッグ・矢筒・矢弾候補になる。
  inventoryDerivedCache={
    revision:inventoryStateRevision,masterSource:DB_INITIAL_ITEM_MASTER, rows, virtualRows, warehouseRows, warehouseCount:warehouseRows.length,
    indexByLookup,rowByLookup,rowByName,equipmentRows,equipmentBySlotKind,equipmentByKey,equipmentByName,
    bags,quivers,ammoRows,smallPresent,internalByType
  };
  return inventoryDerivedCache;
}
function inventoryIndexByLookup(itemId='',itemName=''){
  const cache=inventoryDerived();
  const id=String(itemId||'').trim();
  if(id){
    if(cache.indexByLookup.has(id))return cache.indexByLookup.get(id);
    const upper=id.toUpperCase();
    if(cache.indexByLookup.has(upper))return cache.indexByLookup.get(upper);
  }
  const name=String(itemName||'').trim();
  if(name){
    const row=cache.rowByName.get(name);
    if(row){
      const key=inventoryItemKey(row);
      if(cache.indexByLookup.has(key))return cache.indexByLookup.get(key);
    }
  }
  return -1;
}

function defaultLoadoutPresets(){ return { equipment:[], carry:[] }; }
function normalizeLoadoutPresetEntry(raw={}, type='equipment'){
  const presetType = type === 'carry' ? 'carry' : 'equipment';
  const id = String(raw.id || '').trim() || uuid();
  const name = String(raw.name || '').trim().slice(0,40) || (presetType === 'carry' ? '所持品プリセット' : '装備プリセット');
  return { id, name, updatedAt:String(raw.updatedAt || nowIso()), data:(raw.data && typeof raw.data === 'object') ? raw.data : {} };
}
function normalizeLoadoutPresets(value={}){
  const src = value && typeof value === 'object' ? value : {};
  return {
    equipment:(Array.isArray(src.equipment) ? src.equipment : []).filter(Boolean).map(v=>normalizeLoadoutPresetEntry(v,'equipment')),
    carry:(Array.isArray(src.carry) ? src.carry : []).filter(Boolean).map(v=>normalizeLoadoutPresetEntry(v,'carry'))
  };
}
function equipmentPresetSnapshot(){
  syncAllEquipmentSpellSetsToInventory();
  const eq=getEquipmentState();
  const slots={};
  for(const slot of BASE_EQUIPMENT_SLOTS){
    const row=eq[slot.key]||{};
    slots[slot.key]={ itemId:String(row.itemId||'').trim(), name:String(row.name||'').trim(), setSpells:String(row.setSpells||'').trim() };
  }
  return { slots };
}
function carryPresetSnapshot(){
  const eq=getEquipmentState();
  const slots={};
  for(const slot of EQUIPMENT_SLOTS){
    if(slot.kind!=='carry')continue;
    const row=eq[slot.key]||{};
    const allocation=carryWarehouseAllocationState[slot.key]||{};
    if(!row.name&&!allocation.warehouseAllocated)continue;
    slots[slot.key]={ itemId:String(allocation.warehouseItemId||row.itemId||'').trim(), name:String(row.name||'').trim(), count:clampInt(allocation.count||row.count||1,1,99) };
  }
  const ammo={};
  for(const [key,raw] of Object.entries(quiverAmmoSlotsState||{})){
    const row=normalizeQuiverAmmoSlotState(raw); if(!row||!row.itemId)continue;
    ammo[key]={ itemId:String(row.itemId||'').trim(), name:String(row.name||'').trim(), count:clampInt(row.count||1,1,9999) };
  }
  const bag=selectedBagItem(), quiver=selectedQuiverItem();
  return { bagId:String(selectedBagId||'').trim(), bagName:String(bag?.name||'').trim(), quiverId:String(selectedQuiverId||'').trim(), quiverName:String(quiver?.name||'').trim(), slots, quiverAmmoSlots:ammo };
}
function presetSummaryText(type='equipment', data={}){
  if(type==='carry'){
    const carryCount=Object.keys(data.slots||{}).length, ammoCount=Object.keys(data.quiverAmmoSlots||{}).length;
    return `所持品${carryCount}枠 / 矢弾${ammoCount}枠${data.bagId||data.bagName?' / バッグ登録':''}${data.quiverId||data.quiverName?' / 矢筒登録':''}`;
  }
  const rows=Object.values(data.slots||{}); const equipped=rows.filter(v=>String(v?.itemId||v?.name||'').trim()).length;
  const spells=rows.reduce((sum,v)=>sum+splitFormulaList(v?.setSpells||'').length,0);
  return `装備${equipped}枠 / セット術式${spells}件`;
}
function loadoutPresetTypeLabel(type='equipment'){return type==='carry'?'所持品プリセット':'装備プリセット';}
function renderLoadoutPresetList(type='equipment'){
  const isCarry=type==='carry', area=$(isCarry?'carryPresetList':'equipmentPresetList'); if(!area)return;
  const rows=(loadoutPresetsState?.[type]||[]);
  if(!rows.length){area.innerHTML='<div class="loadout-preset-empty">まだプリセットは登録されていません。</div>';return;}
  area.innerHTML=rows.map(p=>`<div class="loadout-preset-row" data-loadout-preset-row="${esc(p.id)}" data-loadout-preset-type="${type}"><div class="loadout-preset-name">${esc(p.name)}</div><div class="button-row"><button type="button" data-loadout-preset-action="apply" data-preset-id="${esc(p.id)}" data-preset-type="${type}">呼び出す</button><button type="button" class="secondary" data-loadout-preset-action="overwrite" data-preset-id="${esc(p.id)}" data-preset-type="${type}">更新</button><button type="button" class="danger" data-loadout-preset-action="delete" data-preset-id="${esc(p.id)}" data-preset-type="${type}">削除</button></div><div class="loadout-preset-meta">${esc(presetSummaryText(type,p.data||{}))}</div></div>`).join('');
  if(currentMode==='view')area.querySelectorAll('button').forEach(el=>el.disabled=true);
}
function renderLoadoutPresets(){ renderLoadoutPresetList('equipment'); renderLoadoutPresetList('carry'); }
function findLoadoutPreset(type='', id=''){return (loadoutPresetsState?.[type]||[]).find(p=>String(p.id||'')===String(id||''))||null;}
function presetInventoryRow(ref={}, predicate=null){
  const id=String(ref.itemId||ref.id||ref.masterId||'').trim(), name=String(ref.name||'').trim();
  let row=id?warehouseItemByKey(id,name):null;
  if(!row&&name)row=inventoryDerived().rows.find(v=>String(v.name||'').trim()===name)||null;
  if(row&&predicate&&!predicate(row))return null;
  return row;
}
function presetSameInventoryRow(row={}, ref={}){
  const key=String(inventoryItemKey(row)||'').trim();
  const ids=new Set([key,row.id,row.masterId,String(row.publicId||'').trim().toUpperCase()].filter(Boolean).map(String));
  const refIds=[ref.itemId,ref.id,ref.masterId,String(ref.publicId||'').trim().toUpperCase()].filter(Boolean).map(String);
  if(refIds.some(v=>ids.has(v)))return true;
  return !!(ref.name&&String(row.name||'').trim()===String(ref.name||'').trim());
}
function presetTotalOwnedCount(row={}){
  let total=Number(row.count||0);
  for(const allocation of Object.values(carryWarehouseAllocationState||{})){
    if(!allocation?.warehouseAllocated||Number(allocation.count||0)<=0)continue;
    if(presetSameInventoryRow(row,{itemId:allocation.warehouseItemId}))total+=Number(allocation.count||0);
  }
  for(const raw of Object.values(quiverAmmoSlotsState||{})){
    const state=rawQuiverAmmoSlotState(raw);if(!state?.warehouseAllocated||Number(state.count||0)<=0)continue;
    if(presetSameInventoryRow(row,state))total+=Number(state.count||0);
  }
  return Math.max(0,total);
}
function presetLearnedSpellNames(){
  const names=new Set();
  for(const row of inventoryDerived().rows){if(isSpellInventoryItem(row)&&String(row.name||'').trim())names.add(String(row.name||'').trim());}
  for(const row of (DB_INITIAL_SPELL_MASTER||[])){
    try{if(hasInitialMasterToken(row)&&String(row.name||'').trim())names.add(String(row.name||'').trim());}catch(_){ }
  }
  return names;
}
function collectEquipmentPresetShortages(preset){
  const shortages=[], reqs=new Map(), data=preset?.data||{};
  for(const slot of BASE_EQUIPMENT_SLOTS){
    const saved=data.slots?.[slot.key]||{};if(!String(saved.itemId||saved.name||'').trim())continue;
    const row=presetInventoryRow(saved,r=>['武器','防具','装飾品'].includes(normalizeInventoryKind(r.kind||'')));
    const key=row?`row:${inventoryItemKey(row)}`:`missing:${saved.itemId||saved.name}`;
    const entry=reqs.get(key)||{row,ref:saved,name:String(saved.name||row?.name||saved.itemId||'装備').trim(),required:0};entry.required++;reqs.set(key,entry);
  }
  for(const entry of reqs.values()){
    const available=entry.row?presetTotalOwnedCount(entry.row):0;
    if(available<entry.required)shortages.push({name:entry.name,required:entry.required,available,kind:'装備',message:`${entry.name}が不足しています。（必要${entry.required} / 所持${available}）`});
  }
  const learned=presetLearnedSpellNames(), spellNames=new Set();
  for(const saved of Object.values(data.slots||{}))for(const name of splitFormulaList(saved?.setSpells||'')){const n=String(name||'').trim();if(n)spellNames.add(n);}
  for(const name of spellNames)if(!learned.has(name))shortages.push({name,required:1,available:0,kind:'術式',message:`${name}が不足しています。（未習得の術式）`});
  return shortages;
}
function carryPresetRequiredCapacity(data={}){
  let max=0;
  for(const key of Object.keys(data.slots||{})){const slot=EQUIPMENT_SLOTS.find(v=>v.key===key&&v.kind==='carry');if(slot)max=Math.max(max,Number(slot.carryIndex||0));}
  return max;
}
function quiverPresetRequiredCapacity(data={}){
  let max=0;for(const key of Object.keys(data.quiverAmmoSlots||{})){max=Math.max(max,Number(String(key).replace(/\D/g,''))||0);}return max;
}
function collectCarryPresetShortages(preset){
  const shortages=[], data=preset?.data||{}, reqs=new Map();
  const bagRef={itemId:data.bagId||'',name:data.bagName||''};
  const quiverRef={itemId:data.quiverId||'',name:data.quiverName||''};
  const bag=String(bagRef.itemId||bagRef.name).trim()?presetInventoryRow(bagRef,isBagInventoryItem):null;
  const quiver=String(quiverRef.itemId||quiverRef.name).trim()?presetInventoryRow(quiverRef,isQuiverInventoryItem):null;
  if(String(bagRef.itemId||bagRef.name).trim()&&!bag)shortages.push({name:data.bagName||data.bagId||'バッグ',required:1,available:0,kind:'バッグ',message:`${data.bagName||data.bagId||'バッグ'}が不足しています。`});
  if(String(quiverRef.itemId||quiverRef.name).trim()&&!quiver)shortages.push({name:data.quiverName||data.quiverId||'矢筒',required:1,available:0,kind:'矢筒',message:`${data.quiverName||data.quiverId||'矢筒'}が不足しています。`});
  const carryCap=bag?parseBagCapacity(bag):0, carryNeed=carryPresetRequiredCapacity(data);
  if(carryNeed>carryCap)shortages.push({name:'所持品枠',required:carryNeed,available:carryCap,kind:'容量',message:`所持品枠が不足しています。（必要${carryNeed}枠 / 使用可能${carryCap}枠）`});
  const quiverCap=quiver?parseQuiverCapacity(quiver):0, quiverNeed=quiverPresetRequiredCapacity(data);
  if(quiverNeed>quiverCap)shortages.push({name:'矢筒の収納枠',required:quiverNeed,available:quiverCap,kind:'容量',message:`矢筒の収納枠が不足しています。（必要${quiverNeed}種 / 収納可能${quiverCap}種）`});
  const addReq=(saved={},kind='所持品',predicate=null)=>{
    const required=clampInt(saved.count||1,1,9999), row=presetInventoryRow(saved,predicate);
    const key=row?`row:${inventoryItemKey(row)}`:`missing:${saved.itemId||saved.name}:${kind}`;
    const entry=reqs.get(key)||{row,ref:saved,name:String(saved.name||row?.name||saved.itemId||kind).trim(),required:0,kind};entry.required+=required;reqs.set(key,entry);
  };
  for(const saved of Object.values(data.slots||{}))if(saved)addReq(saved,'所持品',r=>!isSpellInventoryItem(r));
  for(const saved of Object.values(data.quiverAmmoSlots||{}))if(saved)addReq(saved,'矢弾',isQuiverAmmoInventoryItem);
  for(const entry of reqs.values()){
    const available=entry.row?presetTotalOwnedCount(entry.row):0;
    if(available<entry.required)shortages.push({name:entry.name,required:entry.required,available,kind:entry.kind,message:`${entry.name}が不足しています。（必要${entry.required} / 所持${available}）`});
  }
  return shortages;
}
function collectLoadoutPresetShortages(type='equipment',preset=null){return type==='carry'?collectCarryPresetShortages(preset):collectEquipmentPresetShortages(preset);}
let loadoutPresetDialogContext={mode:'',type:'equipment',id:''};
function closeLoadoutPresetDialog(){const dialog=$('loadoutPresetDialog');if(dialog?.open)dialog.close();loadoutPresetDialogContext={mode:'',type:'equipment',id:''};}
function loadoutPresetDialogStatus(text='',kind=''){
  const status=$('loadoutPresetDialogStatus');if(!status)return;status.className='status-box'+(kind?` ${kind}`:'');status.textContent=text||'内容を確認してください。';
}
function openLoadoutPresetDialog(mode='create',type='equipment',id=''){
  if(currentMode==='view')return;
  const dialog=$('loadoutPresetDialog'),title=$('loadoutPresetDialogTitle'),body=$('loadoutPresetDialogBody'),primary=$('loadoutPresetDialogPrimaryBtn');if(!dialog||!title||!body||!primary)return;
  const preset=findLoadoutPreset(type,id), label=loadoutPresetTypeLabel(type);loadoutPresetDialogContext={mode,type,id};
  if(mode==='create'){
    const summary=presetSummaryText(type,type==='carry'?carryPresetSnapshot():equipmentPresetSnapshot());
    title.textContent=`${label}を登録`;
    body.innerHTML=`<p class="hint">現在の状態を新しいプリセットとして登録します。</p><div class="field"><label for="loadoutPresetDialogName">プリセット名</label><input id="loadoutPresetDialogName" type="text" maxlength="40" placeholder="${type==='carry'?'例：通常探索、採取遠征':'例：対ボス用、探索用'}"></div><div class="loadout-preset-modal-summary"><b>登録内容</b><br>${esc(summary)}</div>`;
    primary.textContent='登録する';primary.className='';primary.disabled=false;loadoutPresetDialogStatus('プリセット名を入力して登録してください。');
  }else if(mode==='overwrite'&&preset){
    const summary=presetSummaryText(type,type==='carry'?carryPresetSnapshot():equipmentPresetSnapshot());
    title.textContent=`${label}を更新`;
    body.innerHTML=`<p class="hint">現在の状態でプリセット内容を更新します。名称もここで変更できます。</p><div class="field"><label for="loadoutPresetDialogName">プリセット名</label><input id="loadoutPresetDialogName" type="text" maxlength="40" value="${esc(preset.name)}"></div><div class="loadout-preset-modal-summary"><b>更新後の内容</b><br>${esc(summary)}</div>`;
    primary.textContent='現在の状態で更新';primary.className='';primary.disabled=false;loadoutPresetDialogStatus(`「${preset.name}」を更新します。`);
  }else if(mode==='apply'&&preset){
    const shortages=collectLoadoutPresetShortages(type,preset);
    title.textContent=`${label}を呼び出す`;
    const shortageHtml=shortages.length?`<div class="loadout-preset-shortages">${shortages.map(x=>`<div class="loadout-preset-shortage">${esc(x.message)}</div>`).join('')}</div>`:`<div class="loadout-preset-ok">不足している装備・アイテム・術式はありません。</div>`;
    body.innerHTML=`<div class="loadout-preset-modal-summary"><b>${esc(preset.name)}</b><br>${esc(presetSummaryText(type,preset.data||{}))}</div>${shortageHtml}<p class="hint" style="margin-top:10px;">${shortages.length?'不足しているものは設定せず、用意できる内容だけで呼び出せます。呼び出しますか？':'このプリセットを呼び出しますか？'}</p>`;
    primary.textContent=shortages.length?'不足分を除いて呼び出す':'呼び出す';primary.className=shortages.length?'danger':'';primary.disabled=false;loadoutPresetDialogStatus(shortages.length?`${shortages.length}件の不足があります。確認後も呼び出し可能です。`:'不足はありません。','');
  }else if(mode==='delete'&&preset){
    title.textContent=`${label}を削除`;
    body.innerHTML=`<div class="loadout-preset-modal-summary"><b>${esc(preset.name)}</b><br>${esc(presetSummaryText(type,preset.data||{}))}</div><p class="hint" style="margin-top:10px;">このプリセットを削除します。元に戻せません。</p>`;
    primary.textContent='削除する';primary.className='danger';primary.disabled=false;loadoutPresetDialogStatus(`「${preset.name}」を削除します。`,'warn');
  }else{return;}
  dialog.showModal();queueMicrotask(()=>body.querySelector('input')?.focus());
}
function registerLoadoutPresetFromDialog(){
  const {type}=loadoutPresetDialogContext,input=$('loadoutPresetDialogName');const name=String(input?.value||'').trim().slice(0,40);if(!name){loadoutPresetDialogStatus('プリセット名を入力してください。','warn');input?.focus();return;}
  const rows=loadoutPresetsState[type]||(loadoutPresetsState[type]=[]);if(rows.some(p=>String(p.name||'').trim()===name)){loadoutPresetDialogStatus('同じ名称のプリセットがあります。既存プリセットの「更新」から変更してください。','warn');return;}
  const data=type==='carry'?carryPresetSnapshot():equipmentPresetSnapshot();rows.push({id:uuid(),name,updatedAt:nowIso(),data});renderLoadoutPresetList(type);updateSummary();closeLoadoutPresetDialog();showToast(`「${name}」を登録しました。`,'ok');
}
function overwriteLoadoutPresetFromDialog(){
  const {type,id}=loadoutPresetDialogContext,p=findLoadoutPreset(type,id),input=$('loadoutPresetDialogName');if(!p)return;
  const name=String(input?.value||'').trim().slice(0,40);if(!name){loadoutPresetDialogStatus('プリセット名を入力してください。','warn');input?.focus();return;}
  if((loadoutPresetsState[type]||[]).some(row=>row.id!==id&&String(row.name||'').trim()===name)){loadoutPresetDialogStatus('同じ名称のプリセットがあります。別の名称を指定してください。','warn');return;}
  p.name=name;p.data=type==='carry'?carryPresetSnapshot():equipmentPresetSnapshot();p.updatedAt=nowIso();renderLoadoutPresetList(type);updateSummary();closeLoadoutPresetDialog();showToast(`「${name}」を現在の状態で更新しました。`,'ok');
}
function deleteLoadoutPresetFromDialog(){
  const {type,id}=loadoutPresetDialogContext,p=findLoadoutPreset(type,id);if(!p)return;
  loadoutPresetsState[type]=(loadoutPresetsState[type]||[]).filter(row=>row.id!==id);renderLoadoutPresetList(type);updateSummary();closeLoadoutPresetDialog();showToast(`「${p.name}」を削除しました。`,'ok');
}
function applyEquipmentLoadoutPreset(preset){
  const data=preset?.data||{}, current=getEquipmentState(), defaults=defaultEquipment(), missing=[], remaining=new Map(), usedRestricted=new Set();
  for(const slot of BASE_EQUIPMENT_SLOTS){
    const saved=data.slots?.[slot.key]||{};
    const row=saved.itemId||saved.name ? presetInventoryRow(saved, r=>['武器','防具','装飾品'].includes(normalizeInventoryKind(r.kind||''))) : null;
    const key=row?inventoryItemKey(row):'';
    const restrictedKey=row?duplicateRestrictedEquipmentIdentity(row):'';
    const duplicateRestricted=!!restrictedKey&&usedRestricted.has(restrictedKey);
    if(row&&!remaining.has(key))remaining.set(key,Math.max(0,presetTotalOwnedCount(row)));
    const canUse=!!row&&Number(remaining.get(key)||0)>0&&!duplicateRestricted;
    if((saved.itemId||saved.name)&&!canUse)missing.push(duplicateRestricted?`${saved.name||saved.itemId}（同一品重複）`:(saved.name||saved.itemId));
    if(canUse){
      remaining.set(key,Number(remaining.get(key)||0)-1);
      if(restrictedKey)usedRestricted.add(restrictedKey);
    }
    current[slot.key]={...defaults[slot.key],itemId:canUse?key:'',name:canUse?row.name:'',setSpells:canUse?String(saved.setSpells||''):''};
  }
  setEquipmentState(current);
  const applied=getEquipmentState(), learned=presetLearnedSpellNames();
  for(const slot of BASE_EQUIPMENT_SLOTS){
    const saved=data.slots?.[slot.key]||{}, equipped=applied[slot.key]||{};if(!String(saved.setSpells||'').trim()||!String(equipped.itemId||equipped.name||'').trim())continue;
    const validSpells=splitFormulaList(saved.setSpells||'').filter(name=>learned.has(String(name||'').trim()));
    if(validSpells.length<splitFormulaList(saved.setSpells||'').length)missing.push('セット術式');
    setSpellSelectValues(slot.key,validSpells);syncEquippedSpellSetToInventoryItem(slot.key);
  }
  updateAll();renderLoadoutPresets();
  if(missing.length)showToast(`「${preset.name}」を不足分を除いて呼び出しました。`,'warn');
  else showToast(`「${preset.name}」を呼び出しました。`,'ok');
}
function applyCarryLoadoutPreset(preset){
  const data=preset?.data||{}, missing=[];
  for(const slot of EQUIPMENT_SLOTS){if(slot.kind!=='carry')continue;releaseCarryWarehouseAllocation(slot.key);clearCarrySlotFields(slot.key);}
  releaseAllQuiverAmmoSlots();
  const bag=(data.bagId||data.bagName)?inventoryDerived().bags.find(row=>[inventoryItemKey(row),row.id,row.masterId].map(String).includes(String(data.bagId))||String(row.name||'')===String(data.bagName||'')):null;
  selectedBagId=bag&&Number(bag.count||0)>0?inventoryItemKey(bag):'';if((data.bagId||data.bagName)&&!selectedBagId)missing.push(data.bagName||data.bagId);renderBagSelect();
  const quiver=(data.quiverId||data.quiverName)?inventoryDerived().quivers.find(row=>[inventoryItemKey(row),row.id,row.masterId].map(String).includes(String(data.quiverId))||String(row.name||'')===String(data.quiverName||'')):null;
  selectedQuiverId=quiver&&Number(quiver.count||0)>0?inventoryItemKey(quiver):'';if((data.quiverId||data.quiverName)&&!selectedQuiverId)missing.push(data.quiverName||data.quiverId);renderQuiverControls();
  refreshEquipmentItemSelects();
  const cap=selectedBagCapacity();
  for(const slot of EQUIPMENT_SLOTS){
    if(slot.kind!=='carry')continue;const saved=data.slots?.[slot.key];if(!saved)continue;
    if((slot.carryIndex||0)>cap){missing.push(saved.name||saved.itemId);continue;}
    const row=presetInventoryRow(saved, r=>!isSpellInventoryItem(r));if(!row||Number(row.count||0)<=0){missing.push(saved.name||saved.itemId);continue;}
    const select=$('equip_'+slot.key+'_itemSelect');if(select)select.value=inventoryItemKey(row);
    applyWarehouseItemToCarrySlot(slot.key,row);updateCarryWarehouseAllocationCount(slot.key,saved.count||1);
    const allocation=carryWarehouseAllocationState[slot.key]||{};if(Number(allocation.count||0)<Number(saved.count||1))missing.push(saved.name||saved.itemId);
  }
  const qcap=selectedQuiverCapacity();
  for(const [key,saved] of Object.entries(data.quiverAmmoSlots||{})){
    const idx=Number(String(key).replace(/\D/g,''))||0;if(idx<1||idx>qcap){missing.push(saved.name||saved.itemId);continue;}
    const row=presetInventoryRow(saved,isQuiverAmmoInventoryItem);if(!row||Number(row.count||0)<=0){missing.push(saved.name||saved.itemId);continue;}
    selectQuiverAmmoForSlot(key,inventoryItemKey(row));updateQuiverAmmoSlotCount(key,saved.count||1);
    const state=rawQuiverAmmoSlotState(quiverAmmoSlotsState[key]);if(Number(state?.count||0)<Number(saved.count||1))missing.push(saved.name||saved.itemId);
  }
  renderQuiverControls();applyBagCapacityToEquipmentSlots();refreshWarehouseQuantityViews();updateAll();renderLoadoutPresets();
  if(missing.length)showToast(`「${preset.name}」を不足分を除いて呼び出しました。`,'warn');
  else showToast(`「${preset.name}」を呼び出しました。`,'ok');
}
function applyLoadoutPresetConfirmed(type='',id=''){
  const p=findLoadoutPreset(type,id);if(!p)return;if(type==='carry')applyCarryLoadoutPreset(p);else applyEquipmentLoadoutPreset(p);updateSummary();closeLoadoutPresetDialog();
}
function handleLoadoutPresetDialogPrimary(){
  const {mode,type,id}=loadoutPresetDialogContext;
  if(mode==='create')registerLoadoutPresetFromDialog();
  else if(mode==='overwrite')overwriteLoadoutPresetFromDialog();
  else if(mode==='apply')applyLoadoutPresetConfirmed(type,id);
  else if(mode==='delete')deleteLoadoutPresetFromDialog();
}

function defaultInventory() {
  const basicBag = { id:'bag_simple', masterId:'', masterSheet:'', masterSync:'', name:'簡素なバッグ', kind:'バッグ', itemType:'バッグ', category:'バッグ', itemCategory:'バッグ', count:1, capacity:8, bagCapacity:8, location:'倉庫', rank:1, price:'100', equipSlot:'', power:'', hit:'', defense:'', guard:'', evade:'', offhand:'', spellSlots:'', target:'', element:'', cost:'', checkType:'', role:'', source:'初期支給 / 鍛冶屋', tags:'バッグ,初期倉庫', setItem:'', description:'冒険に必要な最低限の荷物を入れられる簡素なバッグ。', effect:'所持品枠8。', recipeResult:'', materials:'', note:'' };
  return { items: [basicBag], learnedRecipes:[], bagId:'bag_simple', quiverId:'', quiverAmmoSlots:{}, masterVersion:'' };
}

function ensureDefaultBagItem() {
  if (!Array.isArray(inventoryItemsState)) inventoryItemsState = [];
  const exists = inventoryItemsState.some(item => {
    const row = normalizeInventoryItem(item);
    return isBagInventoryItem(row) && (
      inventoryItemKey(row) === 'bag_simple' ||
      row.id === 'bag_simple' ||
      row.masterId === 'bag_simple' ||
      row.name === '簡素なバッグ'
    );
  });
  if (exists) return;
  inventoryItemsState.unshift(normalizeInventoryItem({
    id:'bag_simple',
    masterId:'',
    masterSheet:'',
    masterSync:'',
    name:'簡素なバッグ',
    kind:'バッグ',
    itemType:'バッグ',
    category:'バッグ',
    itemCategory:'バッグ',
    count:1,
    capacity:8,
    bagCapacity:8,
    location:'倉庫',
    rank:1,
    price:'100',
    equipSlot:'',
    power:'',
    hit:'',
    defense:'',
    guard:'',
    evade:'',
    offhand:'',
    spellSlots:'',
    target:'',
    element:'',
    cost:'',
    checkType:'',
    role:'',
    source:'初期支給 / 鍛冶屋',
    tags:'バッグ,初期倉庫',
    setItem:'',
    description:'冒険に必要な最低限の荷物を入れられる簡素なバッグ。',
    effect:'所持品枠8。',
    recipeResult:'',
    materials:'',
    note:''
  }));
  invalidateInventoryDerivedCache();
}

function expandIndividualEquipmentInventoryRows(rows=[]) {
  const out = [];
  const usedIds = new Set();
  for (const raw of (Array.isArray(rows) ? rows : [])) {
    if (!raw) continue;
    const rawCount = clampInt(raw.count ?? raw.quantity ?? 1, 0, 9999);
    const normalized = normalizeInventoryItem({ ...raw, count:rawCount, location:'倉庫' });
    if (!inventoryKindUsesIndividualRecord(normalized.kind)) {
      out.push(normalized);
      continue;
    }
    // 骨董個体は登録ID自体が個体IDなので、壊れた旧データにcount>1があっても複製しない。
    const copies = isAntiqueIndividualItem(normalized) ? (rawCount > 0 ? 1 : 0) : rawCount;
    for (let i=0; i<copies; i++) {
      let id = i === 0 ? String(normalized.id || '').trim() : '';
      if (!id || usedIds.has(id)) id = newInventoryInstanceId();
      usedIds.add(id);
      out.push(normalizeInventoryItem({ ...normalized, id, count:1, location:'倉庫' }));
    }
  }
  return out;
}
function normalizeInventoryState(inventory) {
  const src = Array.isArray(inventory)
    ? inventory
    : (Array.isArray(inventory?.items)
      ? inventory.items
      : (Array.isArray(inventory?.warehouse)
        ? inventory.warehouse
        : (Array.isArray(inventory?.storage) ? inventory.storage : [])));
  const learnedSrc = inventory && !Array.isArray(inventory)
    ? (Array.isArray(inventory.learnedRecipes) ? inventory.learnedRecipes : (Array.isArray(inventory.knownRecipes) ? inventory.knownRecipes : []))
    : [];
  return {
    items: expandIndividualEquipmentInventoryRows(src.filter(Boolean)),
    learnedRecipes: learnedSrc.filter(Boolean).map(item => normalizeInventoryItem({ ...item, kind:'レシピ', count:1, location:'倉庫' })),
    bagId:String(inventory && !Array.isArray(inventory) ? (inventory.bagId || inventory.selectedBagId || inventory.selectedBag || '') : '').trim(),
    quiverId:String(inventory && !Array.isArray(inventory) ? (inventory.quiverId || inventory.selectedQuiverId || inventory.selectedQuiver || '') : '').trim(),
    quiverAmmoSlots:inventory && !Array.isArray(inventory) ? (inventory.quiverAmmoSlots || inventory.ammoSlots || {}) : {},
    masterVersion:String(inventory && !Array.isArray(inventory) ? (inventory.masterVersion || inventory.masterSyncVersion || '') : '').trim()
  };
}
function defaultInventoryLocation() { return '倉庫'; }
function defaultInventoryKind() {
  const selected = String(inventoryViewFilter.itemType || '').trim();
  const internal = String(inventoryViewFilter.category || '').trim();
  if (selected === '収納具') return internal === '矢筒' ? '矢筒' : 'バッグ';
  if (selected === '素材') return internal === '食材' ? 'アイテム' : '素材';
  if (['武器','防具','装飾品','術式','レシピ','重要品','その他'].includes(selected)) return selected;
  return 'アイテム';
}
function normalizeInventoryLocation(location) { return '倉庫'; }
function inventoryKindSupportsUpgradeLimit(kind='') {
  return ['武器','防具'].includes(String(kind || '').trim());
}
// 武器・防具は強化内容を個体ごとに保持するため、常に「1個体=1レコード」で保存する。
function inventoryKindUsesIndividualRecord(kind='') {
  return ['武器','防具'].includes(String(kind || '').trim());
}
let inventoryInstanceSequence = 0;
function newInventoryInstanceId() {
  inventoryInstanceSequence = (inventoryInstanceSequence + 1) % 1679616;
  return 'inv_' + Date.now().toString(36) + '_' + inventoryInstanceSequence.toString(36).padStart(4,'0') + '_' + Math.random().toString(36).slice(2,7);
}
function normalizeInventoryKind(kind) {
  const raw = String(kind || '').trim();
  if (raw === '武器/防具') return '武器';
  if (raw.includes('バッグ') || raw.includes('鞄') || raw.toLowerCase() === 'bag') return 'バッグ';
  if (raw.includes('術式') || ['魔法','祈祷','魔術','聖術'].includes(raw)) return '術式';
  return INVENTORY_KIND_OPTIONS.includes(raw) ? raw : 'アイテム';
}
function mergeTextUnique(...values) {
  const seen = new Set();
  const parts = [];
  values.forEach(value => {
    String(value ?? '').split(/\n+/).map(v => v.trim()).filter(Boolean).forEach(line => {
      if (!seen.has(line)) { seen.add(line); parts.push(line); }
    });
  });
  return parts.join('\n');
}
function inferEquipSlotForInventory(item={}) {
  const explicit = String(item.equipSlot || '').trim();
  if (explicit) return explicit;
  const kind = normalizeInventoryKind(item.kind || 'アイテム');
  if (kind === '武器') return '右手/左手';
  if (kind === '防具') return '鎧';
  if (kind === '装飾品') return '装飾品';
  return '';
}
function isBagLikeFields(item={}) {
  const kind = String(item.kind || item.itemType || '').trim();
  const category = String(item.category || item.itemCategory || '').trim();
  const tags = String(item.tags || item.usageTags || '').trim();
  if (kind === 'バッグ' || /^bag$/i.test(kind)) return true;
  if (['バッグ','背負い袋','工具鞄','道具鞄'].includes(category)) return true;
  return /(?:^|[,、\s])バッグ(?:$|[,、\s])/.test(tags) || /\bbag\b/i.test(tags);
}
function parseBagCapacity(itemOrValue={}) {
  if (typeof itemOrValue !== 'object' || itemOrValue === null) {
    const n = parseInt(String(itemOrValue || '').replace(/[^0-9-]/g, ''), 10);
    return Number.isFinite(n) ? clampInt(n, 0, 99) : 0;
  }
  const direct = itemOrValue.capacity ?? itemOrValue.bagCapacity ?? itemOrValue.capacitySlots ?? itemOrValue.slotCapacity;
  if (direct !== undefined && direct !== null && String(direct).trim() !== '') return clampInt(direct, 0, 99);
  const text = [itemOrValue.power, itemOrValue.effect, itemOrValue.description, itemOrValue.note, itemOrValue.notes, itemOrValue.tags].map(v => String(v || '')).join(' ');
  const m = text.match(/(?:容量|所持品枠|所持枠|枠数|枠)\s*[:：]?\s*(\d{1,2})/);
  return m ? clampInt(m[1], 0, 99) : 0;
}
function selectedBagItem() {
  const key = String(selectedBagId || '').trim();
  if (!key) return null;
  return inventoryDerived().bags.find(item => inventoryItemKey(item) === key || String(item.id || '').trim() === key || String(item.masterId || '').trim() === key) || null;
}
function selectedBagCapacity() {
  const bag = selectedBagItem();
  return bag ? clampInt(bag.capacity || 0, 0, CARRY_SLOT_MAX) : 0;
}

function isQuiverLikeFields(item={}) {
  const text = [item.kind, item.itemType, item.category, item.itemCategory, item.name, item.tags, item.usageTags].map(v => String(v || '')).join(' ');
  return /矢筒/.test(text);
}
function parseQuiverCapacity(itemOrValue) {
  const direct = itemOrValue?.quiverCapacity ?? itemOrValue?.arrowSlotCapacity ?? itemOrValue?.capacity ?? '';
  if (direct !== '' && direct != null && !Number.isNaN(Number(direct))) return clampInt(direct, 0, 9);
  const text = [itemOrValue.effect, itemOrValue.description, itemOrValue.note, itemOrValue.notes, itemOrValue.tags].map(v => String(v || '')).join(' ');
  const m = text.match(/(?:収納(?:可能)?種類数|矢弾種類数|種類数|収納)\s*[:：]?\s*(\d{1,2})/);
  return m ? clampInt(m[1], 0, 9) : 0;
}
const QUIVER_AMMO_KINDS = new Set(['矢','ボルト','大型ボルト']);
function isQuiverAmmoInventoryItem(item={}) {
  const kind = normalizeInventoryKind(item.kind || 'アイテム');
  const itemType = String(item.itemType || '').trim();
  const itemCategory = String(item.itemCategory || item.category || '').trim();
  const ammoKind = String(item.ammoKind || '').trim();
  return kind === 'アイテム'
    && itemType === '特殊矢弾'
    && itemCategory === '矢弾'
    && QUIVER_AMMO_KINDS.has(ammoKind);
}
function inventoryAmmoRows() {
  return inventoryDerived().ammoRows;
}
function inventoryStackLimit(item={}) {
  const value = Number(item.maxStack || item.spellSlots || item.stackLimit || 0);
  return value > 0 ? clampInt(value, 1, 9999) : 99;
}
function warehouseItemIndex(itemId='', itemName='') {
  return inventoryIndexByLookup(itemId,itemName);
}
function warehouseItemByKey(itemId='', itemName='') {
  const index = warehouseItemIndex(itemId, itemName);
  return index >= 0 ? inventoryItemsState[index] : null;
}
function adjustWarehouseItemCount(itemId='', delta=0, itemName='') {
  const index = warehouseItemIndex(itemId, itemName);
  if (index < 0) return false;
  const row = inventoryItemsState[index];
  const next = Number(row.count || 0) + Number(delta || 0);
  if (next < 0) return false;
  inventoryItemsState[index] = normalizeInventoryItem({ ...row, count:clampInt(next, 0, 9999) });
  invalidateInventoryDerivedCache();
  return true;
}
function syncInventoryQuantityDom() {
  document.querySelectorAll('[data-inventory-count-index]').forEach(input => {
    const index = Number(input.dataset.inventoryCountIndex);
    if (!Number.isInteger(index) || index < 0 || !inventoryItemsState[index]) return;
    const next = String(inventoryItemsState[index].count ?? 0);
    if (input.value !== next) input.value = next;
  });
  document.querySelectorAll('[data-inventory-quick-index]').forEach(el=>{
    const index=Number(el.dataset.inventoryQuickIndex);
    if(!Number.isInteger(index)||index<0||!inventoryItemsState[index])return;
    const text=inventoryWarehouseQuickText(inventoryItemsState[index]);
    el.textContent=text?` / ${text}`:'';
  });
}
function refreshWarehouseQuantityViews({quiver=true}={}) {
  // 個数変更だけで倉庫一覧を再構築しない。所持品枠だけ候補数を更新する。
  syncInventoryQuantityDom();
  refreshEquipmentItemSelects({slotKinds:['carry']});
  if (quiver) renderQuiverControls();
  updateSummary();
}
function rawQuiverAmmoSlotState(value) {
  if (!value) return null;
  if (typeof value === 'string') return { itemId:'', name:String(value).trim(), count:0, maxStack:99, warehouseAllocated:false };
  const itemId = String(value.itemId || value.id || value.masterId || '').trim();
  const name = String(value.name || '').trim();
  if (!itemId && !name) return null;
  return {
    itemId,
    name,
    count:clampInt(value.count || value.quantity || 0, 0, 9999),
    maxStack:clampInt(value.maxStack || 99, 1, 9999),
    warehouseAllocated:!!value.warehouseAllocated
  };
}
function normalizeQuiverAmmoSlotState(value) {
  const raw = rawQuiverAmmoSlotState(value);
  if (!raw) return null;
  const row = warehouseItemByKey(raw.itemId, raw.name);
  if (!row || !isQuiverAmmoInventoryItem(row)) return null;
  return {
    itemId:raw.itemId || inventoryItemKey(row),
    name:raw.name || row.name || '',
    count:raw.count,
    maxStack:clampInt(raw.maxStack || inventoryStackLimit(row), 1, inventoryStackLimit(row)),
    warehouseAllocated:raw.warehouseAllocated
  };
}
function normalizeQuiverAmmoSlotsState(slots={}, {restoreInvalid=false}={}) {
  const result = {};
  for (const [key, value] of Object.entries(slots || {})) {
    const raw = rawQuiverAmmoSlotState(value);
    const normalized = normalizeQuiverAmmoSlotState(value);
    if (normalized) {
      result[key] = normalized;
      continue;
    }
    if (restoreInvalid && raw?.warehouseAllocated && raw.count > 0) {
      adjustWarehouseItemCount(raw.itemId, raw.count, raw.name);
    }
  }
  return result;
}
function selectedQuiverItem() {
  const key = String(selectedQuiverId || '').trim();
  if (!key) return null;
  return inventoryDerived().quivers.find(item => inventoryItemKey(item) === key || String(item.id || '').trim() === key || String(item.masterId || '').trim() === key) || null;
}
function selectedQuiverCapacity() {
  const q = selectedQuiverItem();
  return q ? clampInt(q.quiverCapacity || 0, 0, 9) : 0;
}
function isQuiverInventoryItem(item={}) {
  const normalizedKind = normalizeInventoryKind(item.kind || '');
  return normalizedKind === '矢筒' || isQuiverLikeFields(item);
}

function isBagInventoryItem(item={}) {
  const normalizedKind = normalizeInventoryKind(item.kind || '');
  return normalizedKind === 'バッグ' || isBagLikeFields(item);
}
function carrySlotHasContent(slotKey) {
  const name = $('equip_' + slotKey + '_name')?.value?.trim() || '';
  const type = $('equip_' + slotKey + '_type')?.value || 'なし';
  const desc = $('equip_' + slotKey + '_description')?.value?.trim() || '';
  const note = $('equip_' + slotKey + '_note')?.value?.trim() || '';
  const count = clampInt($('equip_' + slotKey + '_count')?.value || 0, 0, 99);
  return !!(name || desc || note || (type && type !== 'なし') || count > 1);
}

function releaseQuiverAmmoSlot(slotKey, {refresh=false}={}) {
  const state = normalizeQuiverAmmoSlotState(quiverAmmoSlotsState[slotKey]);
  if (state?.warehouseAllocated && state.count > 0) adjustWarehouseItemCount(state.itemId, state.count, state.name);
  delete quiverAmmoSlotsState[slotKey];
  if (refresh) refreshWarehouseQuantityViews();
}
function releaseAllQuiverAmmoSlots({refresh=false}={}) {
  for (const key of Object.keys(quiverAmmoSlotsState || {})) releaseQuiverAmmoSlot(key);
  quiverAmmoSlotsState = {};
  if (refresh) refreshWarehouseQuantityViews();
}
function selectQuiverAmmoForSlot(slotKey, itemId='') {
  const oldState = normalizeQuiverAmmoSlotState(quiverAmmoSlotsState[slotKey]);
  const nextId = String(itemId || '').trim();
  if (oldState?.warehouseAllocated && oldState.itemId === nextId) return;
  releaseQuiverAmmoSlot(slotKey);
  if (!nextId) {
    refreshWarehouseQuantityViews();
    return;
  }
  const row = warehouseItemByKey(nextId);
  const available = Number(row?.count || 0);
  if (!row || !isQuiverAmmoInventoryItem(row)) {
    showToast('矢筒には矢・ボルト・大型ボルトだけを収納できます。', 'warn');
    refreshWarehouseQuantityViews();
    return;
  }
  if (available <= 0) {
    showToast('倉庫に残っている矢弾がありません。', 'warn');
    refreshWarehouseQuantityViews();
    return;
  }
  const maxStack = inventoryStackLimit(row);
  const count = Math.min(maxStack, available);
  if (!adjustWarehouseItemCount(nextId, -count, row.name)) return;
  quiverAmmoSlotsState[slotKey] = { itemId:nextId, name:row.name, count, maxStack, warehouseAllocated:true };
  refreshWarehouseQuantityViews();
}
function updateQuiverAmmoSlotCount(slotKey, rawValue) {
  const state = normalizeQuiverAmmoSlotState(quiverAmmoSlotsState[slotKey]);
  if (!state?.warehouseAllocated) return;
  const warehouse = warehouseItemByKey(state.itemId, state.name);
  const available = Number(warehouse?.count || 0);
  const desired = clampInt(rawValue || 1, 1, state.maxStack || 99);
  const allowed = Math.min(desired, state.count + available);
  const delta = allowed - state.count;
  if (delta > 0) adjustWarehouseItemCount(state.itemId, -delta, state.name);
  if (delta < 0) adjustWarehouseItemCount(state.itemId, -delta, state.name);
  quiverAmmoSlotsState[slotKey] = { ...state, count:allowed };
  if (allowed !== desired) showToast(`倉庫在庫の範囲で${allowed}個に調整しました。`, 'warn');
  refreshWarehouseQuantityViews();
}

let itemDetailViewContext={index:-1};
function characterNamedProcessDiffPair(before='',after=''){
  const a=String(before||''),b=String(after||'');let p=0;while(p<a.length&&p<b.length&&a[p]===b[p])p++;let tail=0;while(tail<a.length-p&&tail<b.length-p&&a[a.length-1-tail]===b[b.length-1-tail])tail++;
  const render=(text,start,end)=>`${esc(text.slice(0,start))}${end>start?`<mark class="named-process-diff">${esc(text.slice(start,end))}</mark>`:''}${esc(text.slice(end))}`;
  return{before:render(a,p,a.length-tail),after:render(b,p,b.length-tail)};
}
function characterNamedProcessingHtml(options=[],appliedId='',index=-1){
  const rows=Array.isArray(options)?options:[];if(!rows.length)return'';
  return `<div class="named-process-list">${rows.map(opt=>{const applied=String(appliedId||'')===String(opt.id||'');const diff=characterNamedProcessDiffPair(opt.fullBefore||opt.before||'変更前',opt.fullAfter||opt.after||'変更後');const actions=(currentMode!=='view'&&index>=0)?`<div class="named-process-actions">${applied?`<button type="button" class="ghost" data-clear-named-processing="${esc(opt.id||'')}">異名加工登録を解除</button>`:`<button type="button" data-apply-named-processing="${esc(opt.id||'')}">異名加工を適用</button>`}</div>`:'';return `<div class="named-process-card"><div><span class="named-process-chip ${applied?'applied':''}">${applied?'異名加工済':'異名加工可'}</span> <b>${esc(opt.namedMonster||opt.material||'異名加工')}</b></div>${opt.changeLabel?`<div class="small"><b>加工効果：</b>${esc(opt.changeLabel)}</div>`:''}<div class="named-process-full"><div class="named-process-text"><b>加工前</b>${diff.before}</div><div class="named-process-text after"><b>加工後</b>${diff.after}</div></div><div class="small">二つ名素材：${esc(opt.material||'')}</div><div class="small">必要素材：${esc(opt.requiredMaterials||'')}</div><div class="small">施設依頼：${esc(String(opt.facilityFeeG||0))}G${opt.difficulty?` / 基礎作成難易度 ${esc(opt.difficulty)}`:''}</div>${actions}</div>`}).join('')}</div>`;
}
function characterSpellMasterForScroll(item={}){
  const row=normalizeInventoryItem(item||{});
  const itemType=String(row.itemType||row.category||'').trim();
  const name=String(row.name||'').trim();
  if(!/スクロール/.test(itemType+' '+name)||/未鑑定/.test(itemType+' '+name))return null;
  const rawId=String(row.masterId||row.id||'').trim();
  const spellId=rawId.startsWith('scroll_spell_')?rawId.slice('scroll_spell_'.length):'';
  let spell=(DB_INITIAL_SPELL_MASTER||[]).find(r=>spellId&&String(r.id||'').trim()===spellId)||null;
  if(!spell){
    const spellName=name.replace(/のスクロール$/,'').trim();
    if(spellName&&spellName!==name)spell=(DB_INITIAL_SPELL_MASTER||[]).find(r=>String(r.name||'').trim()===spellName)||null;
  }
  return spell;
}
function characterHasLearnedSpellMaster(spell={}){
  const sid=String(spell.id||'').trim(),pid=String(spell.publicId||'').trim().toUpperCase(),name=String(spell.name||'').trim();
  return learnedSpellRowsForInventory().some(row=>
    (sid&&String(row.masterId||row.id||'').trim()===sid)||
    (pid&&String(row.publicId||'').trim().toUpperCase()===pid)||
    (name&&String(row.name||'').trim()===name)
  );
}
function characterItemDetailLearnActionHtml(row={},index=-1){
  if(currentMode==='view'||index<0)return'';
  if(row.kind==='レシピ'){
    const learned=isRecipeLearned(row);
    return `<div class="button-row item-detail-learn-actions">${learned?'<button type="button" disabled>習得済み</button>':`<button type="button" data-detail-learn-recipe="${index}">このレシピを習得</button>`}</div>`;
  }
  const spell=characterSpellMasterForScroll(row);
  if(spell){
    const learned=characterHasLearnedSpellMaster(spell);
    return `<div class="button-row item-detail-learn-actions">${learned?'<button type="button" disabled>術式習得済み</button>':`<button type="button" data-detail-learn-scroll="${index}">術式化して習得</button>`}</div>`;
  }
  return'';
}
function learnSpellFromScrollInventory(index){
  if(currentMode==='view')return false;
  const row=inventoryItemsState[index]?normalizeInventoryItem(inventoryItemsState[index]):null;
  if(!row)return false;
  const spell=characterSpellMasterForScroll(row);
  if(!spell){showToast('このスクロールから習得できる術式を特定できません。','error');return false;}
  if(characterHasLearnedSpellMaster(spell)){showToast(`「${spell.name}」はすでに習得済みです。`,'warn');return false;}
  if(!window.confirm(`術式化の判定・必要素材の処理を解決済みとして「${spell.name}」を習得します。\nスクロールを1個消費します。続行しますか？`))return false;
  const count=Math.max(1,Number(row.count)||1);
  if(count>1)inventoryItemsState[index]=normalizeInventoryItem({...row,count:count-1});
  else inventoryItemsState.splice(index,1);
  const spellItem=dbSpellToInventoryItem(spell);
  inventoryItemsState.push(spellItem);
  invalidateInventoryDerivedCache();
  inventoryDisplayMode='learned';learnedContentType='spell';
  renderInventory({refreshLinked:false});inventoryLinkedRefreshForItems(row,spellItem);updateSummary();
  $('itemDetailViewDialog')?.close();
  if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon(['inventory','equipment']);
  showToast(`術式を習得しました：${spell.name}`,'ok');
  return true;
}

function openCharacterItemDetail(item={},count='',index=null){
  const row=normalizeInventoryItem(item||{});if(!row?.name)return;
  const resolvedIndex=Number.isInteger(index)?index:inventoryIndexByLookup(row.id||row.masterId||row.publicId,row.name);
  itemDetailViewContext={index:resolvedIndex};
  const dlg=$('itemDetailViewDialog');if(!dlg)return;
  $('itemDetailViewTitle').textContent=`${row.name}${row.rank?`　${inventoryRankLabel(row)}`:''}`;
  $('itemDetailViewBody').innerHTML=ownedItemDetailHtml(row,count)+characterNamedProcessingHtml(row.namedProcessingOptions,row.appliedNamedProcessingId,resolvedIndex)+characterItemDetailLearnActionHtml(row,resolvedIndex);
  dlg.showModal();
}
function ownedItemDetailHtml(item={}, count='') {
  const row = item ? normalizeInventoryItem(item) : null;
  if (!row || !String(row.name || '').trim()) return '<div class="small">アイテムを選択すると詳細を表示します。</div>';
  const lines = [];
  const add = (label, value) => { const text=String(value ?? '').trim(); if(text) lines.push(`<div class="owned-item-detail-line"><b>${esc(label)}</b><span>${esc(text)}</span></div>`); };
  add('名称', row.name);
  if (count !== '' && count !== null && count !== undefined) add('個数', String(count));
  add('分類', [row.kind, row.itemType, row.materialType, row.category || row.itemCategory || row.materialCategory].map(v=>String(v||'').trim()).filter((v,i,a)=>v&&a.indexOf(v)===i).join(' / '));
  if (row.rank) add('ランク', inventoryRankLabel(row));
  add('登録ID', row.publicId);
  add('買値', inventoryBuyPriceText(row.buyPrice));
  const sell = inventorySellPriceText(row.price); if (sell) add('売値', sell);
  add('装備/使用枠', row.equipSlot);
  add('属性', row.element);
  add('対象', row.target);
  add('使用技能', row.checkType || row.skill);
  add('威力', row.power);
  add('命中補正', row.hit);
  add('防御値', row.defense);
  add('防御行動値', row.guard);
  add('回避補正', row.evade);
  add('副手追撃値', row.offhand);
  add('補正', row.modifiers);
  add('術式枠補正', row.spellSlots ? `+${row.spellSlots}` : '');
  add('消費/コスト', row.cost);
  add('役割', row.role);
  add('矢弾種別', row.ammoKind);
  add('対応武器種', row.compatibleWeaponTypes);
  add('最大スタック数', row.maxStack);
  add('矢筒収納種類数', row.quiverCapacity);
  add('バッグ容量', row.bagCapacity || row.capacity);
  add('完成品', row.recipeResult);
  add('必要素材', row.materials);
  if (inventoryKindSupportsUpgradeLimit(row.kind)) {
    const savedUpgradeEntries=parseUpgradeLines(row.upgradeEntries||row.upgradeLines||'');
    const usedSlots=equipmentUpgradeUsedSlots(savedUpgradeEntries);
    const limit=resolvedEquipmentUpgradeLimit(row)||0;
    add('強化枠', `${usedSlots} / ${limit}`);
    add('強化素材最低ランク', row.upgradeMaterialMinRank ? characterPlayerRankLabel(row.upgradeMaterialMinRank) : '');
    add('保存済み強化内容', serializeUpgradeEntries(savedUpgradeEntries));
  }
  add('説明', row.description);
  add('効果', row.effect);
  add('備考', row.note);
  add(row.materialType==='魔物素材'?'ドロップ元':'入手先', row.source);
  if (row.equipmentUpgradeEffect) {
    add('装備強化内容', row.equipmentUpgradeEffect);
    add('消費強化枠', row.equipmentUpgradeSlotCost ? `${row.equipmentUpgradeSlotCost}枠` : '');
    add('強化対象', row.equipmentUpgradeTarget);
    add('強化効果説明', row.equipmentUpgradeDetail);
  }
  add('タグ', row.tags);
  const effects=equipmentEffectSectionsHtml(row);
  return (lines.join('')+effects) || '<div class="small">表示できる詳細情報がありません。</div>';
}
function parseNamedProcessingMaterials(text=''){
  return String(text||'').split(/[,、\n]+/u).map(v=>String(v||'').trim()).filter(Boolean).map(part=>{const m=part.match(/^(.*?)[×xX*]\s*(\d+)\s*$/u);return{name:String(m?m[1]:part).trim(),count:Math.max(1,Number(m?m[2]:1)||1)}}).filter(v=>v.name);
}
function inventoryCountByName(name=''){
  const target=String(name||'').trim();
  return (inventoryItemsState||[]).reduce((sum,raw)=>sum+(String(raw?.name||'').trim()===target?Math.max(0,Number(raw.count||0)):0),0);
}
function consumeInventoryByName(name='',amount=0){
  let remain=Math.max(0,Number(amount)||0),target=String(name||'').trim();
  for(let i=0;i<inventoryItemsState.length&&remain>0;i++){
    const raw=inventoryItemsState[i];if(String(raw?.name||'').trim()!==target)continue;
    const have=Math.max(0,Number(raw.count||0)),take=Math.min(have,remain);if(!take)continue;
    inventoryItemsState[i]=normalizeInventoryItem({...raw,count:have-take});remain-=take;
  }
  return remain<=0;
}
function isForbiddenArmorNamedDefenseProcessing(item={},option={}){
  return String(item?.itemType||'').trim()==='防具'
    && String(option?.applyKind||'').trim()==='modifier'
    && String(option?.applyTarget||'').trim()==='combat:defense';
}
function applyNamedProcessingAtIndex(index,optionId=''){
  if(currentMode==='view')return;
  if(!Number.isInteger(index)||index<0||!inventoryItemsState[index])return;
  const raw=inventoryItemsState[index],row=normalizeInventoryItem(raw),opt=(row.namedProcessingOptions||[]).find(x=>String(x.id||'')===String(optionId||''));if(!opt)return;
  if(isForbiddenArmorNamedDefenseProcessing(row,opt)){showToast('防具の異名加工では防御値を上げられません。','warn');return;}
  if(row.appliedNamedProcessingId){showToast('この装備にはすでに異名加工が登録されています。','warn');return;}
  const req=parseNamedProcessingMaterials(opt.requiredMaterials||'');const missing=req.filter(x=>inventoryCountByName(x.name)<x.count);
  if(missing.length){showToast(`必要素材が不足しています：${missing.map(x=>`${x.name}×${x.count}`).join('、')}`,'warn');return;}
  const fee=Number(opt.facilityFeeG||0)||0;
  if(!confirm(`必要素材を消費して異名加工を登録します。${fee?`\n施設依頼費 ${fee}G はキャラシでは自動減算しません。`:''}`))return;
  req.forEach(x=>consumeInventoryByName(x.name,x.count));
  let targetIndex=index,targetRaw={...raw};
  const count=Math.max(1,Number(raw.count||1));
  if(count>1){inventoryItemsState[index]=normalizeInventoryItem({...raw,count:count-1});targetRaw={...raw,id:'inv_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),count:1};targetIndex=inventoryItemsState.length;inventoryItemsState.push(targetRaw);}
  const baseRow=normalizeInventoryItem({...targetRaw,appliedNamedProcessingId:'',namedProcessingBase:null});
  const base={power:baseRow.power,modifiers:baseRow.modifiers,effect:baseRow.effect,spellSlots:baseRow.spellSlots};
  inventoryItemsState[targetIndex]=normalizeInventoryItem({...targetRaw,count:1,appliedNamedProcessingId:String(opt.id||''),namedProcessingBase:base});
  invalidateInventoryDerivedCache();markInventoryUiDirty();renderInventory({refreshLinked:true});updateSummary();if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon(['inventory','equipment']);
  showToast(`異名加工を登録しました：${row.name}`,'ok');openCharacterItemDetail(inventoryItemsState[targetIndex],1,targetIndex);
}
function clearNamedProcessingAtIndex(index,optionId=''){
  if(currentMode==='view')return;if(!Number.isInteger(index)||index<0||!inventoryItemsState[index])return;
  const raw=inventoryItemsState[index],row=normalizeInventoryItem(raw);if(String(row.appliedNamedProcessingId||'')!==String(optionId||''))return;
  if(!confirm('異名加工の登録を解除します。消費した素材は戻りません。'))return;
  const base=(raw.namedProcessingBase&&typeof raw.namedProcessingBase==='object')?raw.namedProcessingBase:{};
  inventoryItemsState[index]=normalizeInventoryItem({...raw,power:base.power??raw.power,modifiers:base.modifiers??raw.modifiers,effect:base.effect??raw.effect,spellSlots:base.spellSlots??raw.spellSlots,appliedNamedProcessingId:'',namedProcessingBase:null});
  invalidateInventoryDerivedCache();markInventoryUiDirty();renderInventory({refreshLinked:true});updateSummary();if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon(['inventory','equipment']);showToast(`異名加工の登録を解除しました：${row.name}`,'ok');openCharacterItemDetail(inventoryItemsState[index],inventoryItemsState[index].count,index);
}
function renderQuiverControls() {
  quiverAmmoSlotsState = normalizeQuiverAmmoSlotsState(quiverAmmoSlotsState, {restoreInvalid:true});
  const select = $('quiverSelect');
  const status = $('quiverCapacityStatus');
  const area = $('quiverAmmoSlots');
  if (!select || !status || !area) return;
  const quivers = inventoryDerived().quivers;
  const current = String(selectedQuiverId || '').trim();
  select.innerHTML = '<option value="">矢筒未装備</option>' + quivers.map(q => {
    const key = inventoryItemKey(q);
    const cap = clampInt(q.quiverCapacity || 0, 0, 9);
    return `<option value="${esc(key)}" ${key === current ? 'selected' : ''}>${esc(q.name)}（${cap}種類）</option>`;
  }).join('');
  const cap = selectedQuiverCapacity();
  const q = selectedQuiverItem();
  if (!q || cap <= 0) {
    status.textContent = '倉庫から矢筒を装備してください。';
    area.innerHTML = '';
    return;
  }
  status.textContent = `${q.name}：矢弾スタック${cap}枠。同じ矢弾を複数枠へ分けて収納できます。`;
  const ammo = inventoryAmmoRows();
  area.innerHTML = Array.from({length:cap}, (_,idx) => {
    const key = `slot${idx+1}`;
    const state = normalizeQuiverAmmoSlotState(quiverAmmoSlotsState[key]);
    const selectedId = state?.itemId || '';
    const selectedRow = ammo.find(a => {
      const id = inventoryItemKey(a);
      return id === selectedId || String(a.id || '').trim() === selectedId || String(a.masterId || '').trim() === selectedId;
    }) || null;
    const options = ammo.map(a => {
      const id = inventoryItemKey(a);
      return `<option value="${esc(id)}" ${id === selectedId ? 'selected' : ''}>${esc(a.name)} / 倉庫${esc(a.count)}</option>`;
    }).join('');
    const count = state?.count || 1;
    const maxStack = state?.maxStack || 99;
    const effectText = String(selectedRow?.effect || selectedRow?.note || '').trim();
    return `<div class="quiver-slot-card">
      <div class="quiver-slot-fields">
        <div>
          <label class="small">矢弾</label>
          <select data-inventory-input="1" data-quiver-ammo-slot="${key}">
            <option value="">未設定（倉庫へ戻す）</option>${options}
          </select>
        </div>
        <div>
          <label class="small">個数</label>
          <input data-inventory-input="1" type="number" min="1" max="${esc(maxStack)}" value="${esc(count)}" data-quiver-ammo-count="${key}" ${state?.warehouseAllocated ? '' : 'disabled'} />
        </div>
      </div>
      ${selectedRow ? `<button type="button" class="ghost public-view-allowed" data-quiver-item-detail="${esc(inventoryItemKey(selectedRow))}">矢弾の詳細</button>` : ''}
    </div>`;
  }).join('');
}

function applyBagCapacityToEquipmentSlots() {
  const cap = selectedBagCapacity();
  const over = [];
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind !== 'carry') continue;
    const card = document.querySelector(`[data-equipment-card="${slot.key}"]`);
    if (!card) continue;
    const used = carrySlotHasContent(slot.key);
    const inRange = (slot.carryIndex || 0) <= cap;
    card.classList.toggle('carry-slot-hidden', !inRange && !used);
    card.classList.toggle('carry-over-capacity', !inRange && used);
    for (const el of card.querySelectorAll('[data-equipment-input]')) el.disabled = (currentMode === 'view') || (!inRange && !used);
    if (!inRange && used) over.push(slot.key);
  }
  const status = $('bagCapacityStatus');
  if (status) {
    const bag = selectedBagItem();
    const label = bag ? `${bag.name}：所持品枠${cap}` : 'バッグ未選択：所持品枠0';
    status.classList.toggle('warning', !!over.length || !bag);
    status.textContent = over.length ? `${label}
容量を超えた所持品が${over.length}件あります。倉庫へ戻すか、容量の大きいバッグを選択してください。` : `${label}
共通DBアイテムは登録不要です。冒険へ持ち出す所持品だけバッグ容量の制限を受けます。`;
  }
}
function renderBagSelect() {
  const select = $('bagSelect');
  if (!select) return;
  const current = selectedBagId || select.value || '';
  const bags = inventoryDerived().bags.filter(item => item.name);
  const opts = ['<option value="">バッグ未選択</option>'].concat(bags.map(item => {
    const key = inventoryItemKey(item) || item.id || item.name;
    const cap = clampInt(item.capacity || 0, 0, 99);
    return `<option value="${esc(key)}">${esc(item.name)} / 容量${cap}</option>`;
  }));
  select.innerHTML = opts.join('');
  const exists = current && bags.some(item => (inventoryItemKey(item) || item.id || item.name) === current);
  selectedBagId = exists ? current : '';
  select.value = selectedBagId;
  applyBagCapacityToEquipmentSlots();
}
function inventoryManualClassification(kind='', category='') {
  const top = String(inventoryViewFilter.itemType || '全て').trim();
  const internal = String(inventoryViewFilter.category || '全て').trim();
  if (top === '素材') {
    if (internal === '食材') return { kind:'アイテム', itemType:'食材', itemCategory:category, materialType:'', materialCategory:'' };
    const materialType = INVENTORY_MATERIAL_TYPE_ORDER.includes(internal) ? internal : '';
    return { kind:'素材', itemType:'', itemCategory:'', materialType, materialCategory:category };
  }
  if (top === '収納具') {
    const itemType = internal === '矢筒' ? '矢筒' : 'バッグ';
    return { kind:itemType, itemType, itemCategory:itemType, materialType:'', materialCategory:'' };
  }
  const normalizedKind = normalizeInventoryKind(kind || defaultInventoryKind());
  if (top && top !== '全て') return { kind:normalizedKind, itemType:top, itemCategory:category, materialType:'', materialCategory:'' };
  const inferred = inferInventoryItemType({ kind:normalizedKind, category }, normalizedKind);
  return { kind:normalizedKind, itemType:inferred === 'その他' ? '' : inferred, itemCategory:category, materialType:'', materialCategory:'' };
}
function emptyInventoryItem() {
  const cls = inventoryManualClassification(defaultInventoryKind(), '');
  return { id:'inv_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6), masterId:'', masterSheet:'', masterSync:'', name:'', kind:cls.kind, itemType:cls.itemType, itemCategory:cls.itemCategory, materialType:cls.materialType, materialCategory:cls.materialCategory, category:'', count:1, capacity:'', location:'倉庫', rank:'', price:'', equipSlot:'', skill:'', power:'', offhand:'', reloadTurns:'', modifiers:'', upgradeLimit:'', upgradeMaterialMinRank:'', upgradeLines:'', upgradeEntries:[], equipmentUpgradeEffect:'', equipmentUpgradeSlotCost:'', equipmentUpgradeDetail:'', equipmentUpgradeTarget:'', namedProcessingOptions:[], appliedNamedProcessingId:'', namedProcessingBase:null, spellSlots:'', setSpells:'', target:'', element:'', enchantTarget:'', enchantEffectType:'', enchantValue:'', enchantDuration:'', enchantRounds:'', enchantStackRule:'', cost:'', checkType:'', role:'', source:'', tags:'', setItem:'', description:'', effect:'', recipeResult:'', materials:'', note:'' };
}
function inferInventoryItemType(item={}, kind='') {
  const explicit = String(item.itemType || '').trim();
  if (explicit) return explicit;
  const functionalKind = String(kind || item.kind || '').trim();
  const cat = String(item.itemCategory || item.category || item.type || '').trim();
  const materialType = String(item.materialType || '').trim();
  const materialCategory = String(item.materialCategory || '').trim();
  const tagText = [item.tags,item.usageTags,item.description].map(v => String(v || '')).join(' ');
  if (materialType || materialCategory || /(?:^|[,、\s])素材(?:$|[,、\s])/.test(tagText)) return '素材';
  if (functionalKind === '術式' && ['魔導書','祈祷書'].includes(cat)) return '武器';
  if (functionalKind === '術式' && (/スクロール/.test(cat) || /スクロール/.test(String(item.name || '')))) return 'スクロール';
  if (cat === '盾') return '盾';
  if (cat === '換金品') return '換金品';
  if (['回復','解除','補助','攻撃','妨害'].includes(cat)) return '調合品';
  if (['戦闘','調合','鍛冶','罠','細工','その他'].includes(cat)) return '道具';
  if (cat === '矢弾' || String(item.ammoKind || '').trim()) return '特殊矢弾';
  if (/食材|料理専用/.test(tagText)) return '食材';
  if (/スクロール/.test(cat) || /スクロール/.test(String(item.name || ''))) return 'スクロール';
  if (functionalKind && functionalKind !== 'アイテム') return functionalKind;
  return 'その他';
}
function isInventoryMaterialLike(item={}, kind='', type='') {
  const normalizedKind = normalizeInventoryKind(kind || item.kind || item.itemType || 'アイテム');
  const inferredType = String(type || inferInventoryItemType(item, normalizedKind) || '').trim();
  const explicitType = String(item.itemType || '').trim();
  const materialType = String(item.materialType || '').trim();
  const materialCategory = String(item.materialCategory || '').trim();
  const tagText = [item.tags,item.usageTags,item.description,item.effect].map(v => String(v || '')).join(' ');
  if (normalizedKind === '素材' || ['素材','食材'].includes(inferredType) || ['素材','食材'].includes(explicitType)) return true;
  if (materialType) return true;
  if (materialCategory && !explicitType && normalizedKind === 'アイテム') return true;
  return !explicitType && normalizedKind === 'アイテム' && /(?:^|[,、\s])素材(?:$|[,、\s])|食材|料理専用/.test(tagText);
}
function inventorySmallCategory(item={}) {
  const kind = normalizeInventoryKind(item.kind || item.itemType || 'アイテム');
  const type = inferInventoryItemType(item, kind);
  if (kind === 'バッグ' || kind === '矢筒' || type === 'バッグ' || type === '矢筒') return '収納具';
  if (isInventoryMaterialLike(item, kind, type)) return '素材';
  if (kind === 'レシピ') return 'レシピ';
  if (kind === '重要品') return '重要品';
  if (type === '術式装備') return ['魔導書','祈祷書'].includes(String(item.itemCategory || item.category || '').trim()) ? '武器' : 'スクロール';
  return type || (kind === 'アイテム' ? 'その他' : kind);
}
function inventoryInternalCategory(item={}) {
  const top = inventorySmallCategory(item);
  const kind = normalizeInventoryKind(item.kind || item.itemType || 'アイテム');
  const type = inferInventoryItemType(item, kind);
  if (top === '収納具') return (kind === '矢筒' || type === '矢筒' || isQuiverLikeFields(item)) ? '矢筒' : 'バッグ';
  if (top === '素材') {
    if (type === '食材') return '食材';
    return String(item.materialType || '').trim() || '素材';
  }
  return String(item.itemCategory || item.materialCategory || item.category || item.type || '').trim() || '未分類';
}
function ownedSkillRowsForInventory(){
  const state=normalizeSkillGachaState(skillGachaState||{});
  return state.acquiredSkillIds.map(characterSkillById).filter(Boolean).sort((a,b)=>String(a.category||'').localeCompare(String(b.category||''),'ja')||String(a.weaponType||'').localeCompare(String(b.weaponType||''),'ja')||String(a.name||'').localeCompare(String(b.name||''),'ja'));
}
function isLearnedSpellInventoryRow(item={}) {
  // inventoryItemsStateは読み込み・変更時に正規化済み。表示判定のたびに再正規化しない。
  const row = item || {};
  return isSpellInventoryItem(row) && inventorySmallCategory(row) === '術式';
}
function inventorySmallCategories() {
  const present = inventoryDerived().smallPresent;
  const ordered = INVENTORY_SMALL_CATEGORY_ORDER.filter(v => present.has(v));
  [...present].filter(v => !ordered.includes(v)).sort((a,b)=>a.localeCompare(b,'ja',{numeric:true})).forEach(v=>ordered.push(v));
  return ['全て', ...ordered];
}
function inventoryInternalCategories(selectedType='') {
  if (!selectedType || selectedType === '全て') return [];
  const present = inventoryDerived().internalByType.get(selectedType) || new Set();
  if (selectedType === '素材') return ['全て', ...INVENTORY_MATERIAL_TYPE_ORDER.filter(v => present.has(v))];
  if (selectedType === '収納具') return ['全て', ...['バッグ','矢筒'].filter(v => present.has(v))];
  return ['全て', ...[...present].sort((a,b)=>a.localeCompare(b,'ja',{numeric:true}))];
}
function canonicalWeaponUsageSkill(item={}) {
  const category=String(item.itemCategory || item.category || item.type || '').trim();
  if(['弓','クロスボウ','ヘヴィクロスボウ'].includes(category)) return '射撃';
  if(category==='魔導書') return '魔法';
  if(category==='祈祷書') return '祈祷';
  return '近接';
}
/* RA_PATCH_CARRY_PALETTE_MASTER_FALLBACK_V90_8_572 */
function parseNamedProcessingOptions(value){if(Array.isArray(value))return value;if(typeof value==='string'&&value.trim()){try{const parsed=JSON.parse(value);return Array.isArray(parsed)?parsed:[];}catch(_){return[];}}return[];}
function parseEquipmentEffects(value){if(Array.isArray(value))return value.map(v=>({name:String(v?.name||'固有効果').trim()||'固有効果',summary:String(v?.summary||'').trim(),detail:String(v?.detail||'').trim()})).filter(v=>v.detail||v.summary);if(typeof value==='string'&&value.trim()){try{return parseEquipmentEffects(JSON.parse(value));}catch(_){return[];}}return [];}
function equipmentIntrinsicEffectsForItem(item={}){const category=String(item.itemCategory||item.category||item.type||'').trim();const row=(DB_EQUIPMENT_CATEGORY_MASTER||[]).find(v=>String(v?.name||'').trim()===category);if(!row)return[];const structured=parseEquipmentEffects(row.intrinsicEffects);if(structured.length)return structured;const detail=String(row.effect||'').trim();if(!detail)return[];return[{name:category==='鞭'?'引き寄せ':'武器種固有',summary:category==='鞭'?'後衛の敵を前衛へ引き寄せる':detail.split('。')[0],detail}];}
function equipmentEffectsForItem(item={}){const structured=parseEquipmentEffects(item.equipmentEffects);if(structured.length)return structured;const detail=String(item.effect||'').trim();return detail?[{name:'固有効果',summary:detail.split('。')[0],detail}]:[];}
function equipmentEffectSectionsHtml(item={}){const intrinsic=equipmentIntrinsicEffectsForItem(item),unique=equipmentEffectsForItem(item);const section=(title,rows)=>rows.length?`<section class="equipment-effect-section"><h4>${esc(title)}</h4>${rows.map(effect=>{const name=String(effect.name||'固有効果').trim()||'固有効果',detail=String(effect.detail||effect.summary||'').trim();return `<div class="equipment-effect-entry"><div class="equipment-effect-name">${esc(name)}</div>${detail?`<div class="equipment-effect-detail">${esc(detail)}</div>`:''}</div>`;}).join('')}</section>`:'';return intrinsic.length||unique.length?`<div class="equipment-effect-sections">${section('武器種固有',intrinsic)}${section('効果',unique)}</div>`:'';}
function normalizeInventoryItem(item={}) {
  const masterRow = inventoryMasterRowForClassification(item);
  const masterIsMaterial = String(masterRow?.dataKind || '').trim()==='素材';
  const masterIsFood = !masterIsMaterial && String(masterRow?.itemType || '').trim()==='食材';
  const resolvedMaterialType = masterIsMaterial
    ? canonicalInventoryMaterialType(masterRow?.materialType)
    : canonicalInventoryMaterialType(item.materialType);
  const resolvedMaterialCategory = masterIsMaterial
    ? String(masterRow?.materialCategory || '').trim()
    : String(item.materialCategory || '').trim();
  const rawCategory = String(item.category || item.type || item.itemCategory || resolvedMaterialCategory || '').trim();
  const rawCheckType = String(item.checkType || item['判定'] || '').trim();
  const rawMasterSheet = String(item.masterSheet || item.sourceSheet || '').trim().toLowerCase();
  const explicitItemType = String(masterRow?.itemType || item.itemType || '').trim();
  const scrollLike = explicitItemType === 'スクロール' || /スクロール/.test(rawCategory) || /スクロール/.test(String(item.name || ''));
  const categoryLooksSpell = !scrollLike && (rawCategory.includes('術式') || ['魔法','祈祷','魔術','聖術','神聖術','攻撃魔法'].includes(rawCategory) || /^魔法\s*>=|^祈祷\s*>=/.test(rawCheckType) || rawMasterSheet === 'spells' || rawMasterSheet === 'spell');
  let kind = normalizeInventoryKind(masterIsMaterial ? '素材' : (masterIsFood ? 'アイテム' : (item.kind || item.itemType || (categoryLooksSpell ? '術式' : 'アイテム'))));
  if (kind === 'アイテム' && categoryLooksSpell) kind = '術式';
  if (isBagLikeFields({ ...item, kind, category:rawCategory })) kind = 'バッグ';
  if (isQuiverLikeFields({ ...item, kind, category:rawCategory })) kind = '矢筒';
  if (masterIsMaterial || (kind === 'アイテム' && (resolvedMaterialType || resolvedMaterialCategory || /(?:^|[,、\s])素材(?:$|[,、\s])/.test(String(item.tags || item.usageTags || ''))))) kind = '素材';
  const oldDescription = item['fla' + 'vor' + 'Text'];
  const rawUpgradeLimit = inventoryKindSupportsUpgradeLimit(kind) ? String(item.upgradeLimit || item.upgradeCount || item.upgradeSlots || '').trim() : '';
  const rawSavedUpgradeEntries = inventoryKindSupportsUpgradeLimit(kind) ? parseUpgradeLines(item.upgradeEntries || item.upgradeLines || '') : [];
  const inferredUpgradeLimit = rawSavedUpgradeEntries.length ? equipmentUpgradeUsedSlots(rawSavedUpgradeEntries) : 0;
  const normalizedUpgradeLimit = clampInt(rawUpgradeLimit || inferredUpgradeLimit || 0, 0, 9);
  // 魔物素材などの強化定義はマスターDBを正とする。
  // 旧キャラクターデータや一部の登録経路で強化項目が保存されていなくても、
  // ID・登録ID・名称のいずれかでマスターを特定できれば最新定義を倉庫表示へ補完する。
  const masterUpgradeEffect = String(masterRow?.equipmentUpgradeEffect || '').trim();
    const masterUpgradeSlotCost = String(masterRow?.equipmentUpgradeSlotCost || '').trim();
  const masterUpgradeDetail = String(masterRow?.equipmentUpgradeDetail || '').trim();
  const masterUpgradeTarget = String(masterRow?.equipmentUpgradeTarget || '').trim();
  // 強化枠を持たない装備へ、別装備の強化内容を残さない。
  const normalizedUpgradeEntries = normalizedUpgradeLimit > 0
    ? trimUpgradeEntriesToSlotLimit(rawSavedUpgradeEntries, normalizedUpgradeLimit).map(upgradeEntryForStorage)
    : [];
  const namedProcessingOptions = parseNamedProcessingOptions(masterRow?.namedProcessingOptions ?? item.namedProcessingOptions);
  const appliedNamedProcessingId = String(item.appliedNamedProcessingId || '').trim();
  const appliedNamedProcessingCandidate = appliedNamedProcessingId ? (namedProcessingOptions.find(opt=>String(opt?.id||'')===appliedNamedProcessingId) || null) : null;
  // 防具の異名加工で防御値そのものを伸ばすことは禁止。旧/不正データが来ても性能へ反映しない。
  const appliedNamedProcessing = appliedNamedProcessingCandidate && !isForbiddenArmorNamedDefenseProcessing(item,appliedNamedProcessingCandidate) ? appliedNamedProcessingCandidate : null;
  const baseSnapshot = (item.namedProcessingBase && typeof item.namedProcessingBase === 'object') ? item.namedProcessingBase : {};
  const useCanonicalBase = !!appliedNamedProcessing;
  const basePower = String((useCanonicalBase ? (masterRow?.power ?? baseSnapshot.power) : null) ?? item.power ?? item.damage ?? item.damageValue ?? masterRow?.power ?? '').trim();
  const baseModifierText = String((useCanonicalBase ? (masterRow?.modifiers ?? baseSnapshot.modifiers) : null) ?? migratedModifierTextForItem(item) ?? '').trim();
  const baseEffect = String((useCanonicalBase ? (masterRow?.effect ?? baseSnapshot.effect) : null) ?? item.effect ?? item['効果'] ?? masterRow?.effect ?? '').trim();
  const baseSpellSlots = String((useCanonicalBase ? (masterRow?.spellSlots ?? baseSnapshot.spellSlots) : null) ?? item.spellSlots ?? item.slotCount ?? item.registerSlots ?? item.maxStack ?? '').trim();
  let effectivePower=basePower, effectiveEffect=baseEffect, effectiveSpellSlots=baseSpellSlots;
  let normalizedModifierRows = migrateLegacyDefenseActionRows(parseModifierRows(baseModifierText), item);
  if(appliedNamedProcessing){
    const kind=String(appliedNamedProcessing.applyKind||'').trim(), target=String(appliedNamedProcessing.applyTarget||'').trim();
    if(kind==='power') effectivePower=String(appliedNamedProcessing.applyAfter||effectivePower).trim();
    else if(kind==='modifier'){
      const idx=normalizedModifierRows.findIndex(row=>String(row.target||'')===target);
      if(idx>=0) normalizedModifierRows[idx]={...normalizedModifierRows[idx],value:String(appliedNamedProcessing.applyAfter||normalizedModifierRows[idx].value).trim()};
      else if(target) normalizedModifierRows.push({target,value:String(appliedNamedProcessing.applyAfter||'').trim()});
    }else if(kind==='effect') effectiveEffect=String(appliedNamedProcessing.applyAfter||appliedNamedProcessing.fullAfter||effectiveEffect).trim();
    else if(kind==='spellSlots'){
      effectiveSpellSlots=String(appliedNamedProcessing.applyAfter||effectiveSpellSlots).trim();
      if(appliedNamedProcessing.fullAfter) effectiveEffect=String(appliedNamedProcessing.fullAfter).trim();
    }
  }
  let equipmentEffects=parseEquipmentEffects(masterRow?.equipmentEffects ?? item.equipmentEffects);
  if(!equipmentEffects.length&&effectiveEffect)equipmentEffects=[{name:'固有効果',summary:String(effectiveEffect).split('。')[0],detail:effectiveEffect}];
  if(appliedNamedProcessing&&String(appliedNamedProcessing.applyKind||'').trim()==='effect'){
    const before=String(appliedNamedProcessing.applyBefore||'').trim(),after=String(appliedNamedProcessing.applyAfter||appliedNamedProcessing.fullAfter||'').trim();
    if(before&&after)equipmentEffects=equipmentEffects.map(effect=>String(effect.detail||'').includes(before)?{...effect,detail:String(effect.detail||'').replace(before,after)}:effect);
    if(equipmentEffects.length===1&&after)equipmentEffects[0]={...equipmentEffects[0],detail:after};
  }
  const normalizedModifiers = serializeModifierRows(normalizedModifierRows);
  const firstModifierText = target => String(normalizedModifierRows.find(row => row.target === target)?.value || '').trim();
  return {
    id: item.id || ('inv_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6)),
    publicId: String(item.publicId || item.publicID || '').trim(),
    masterId: String(item.masterId || item.masterID || item.sourceId || item.sourceID || '').trim(),
    masterSheet: String(item.masterSheet || item.sourceSheet || '').trim(),
    masterSync: String(item.masterSync || item.syncRole || '').trim(),
    name: canonicalInventoryItemName(item.name || ''),
    kind,
    itemType: masterIsMaterial ? '' : (masterIsFood ? '食材' : inferInventoryItemType(item, kind)),
    itemCategory: masterIsMaterial ? '' : String(masterRow?.itemCategory || item.itemCategory || item.category || item.type || '').trim(),
    materialType: resolvedMaterialType,
    materialCategory: resolvedMaterialCategory || String(((kind === '素材' || ['素材','食材'].includes(String(item.itemType || '').trim()) || resolvedMaterialType) ? (item.category || item.type || '') : '')).trim(),
    category: String(item.category || item.type || item.itemCategory || item.materialCategory || '').trim(),
    count: inventoryKindUsesIndividualRecord(kind) ? 1 : clampInt(item.count ?? item.quantity ?? 1, 0, 9999),
    capacity: kind === 'バッグ' ? parseBagCapacity(item) : 0,
    bagCapacity: kind === 'バッグ' ? parseBagCapacity(item) : '',
    quiverCapacity: kind === '矢筒' ? parseQuiverCapacity(item) : '',
    ammoKind: String(item.ammoKind || item.ammoType || '').trim(),
    compatibleWeaponTypes: String(item.compatibleWeaponTypes || item.compatibleWeapons || '').trim(),
    location: '倉庫',
    rank: String(item.rank || masterRow?.rank || 1).trim(),
    buyPrice: String(String(item.buyPrice ?? '').trim() || String(masterRow?.buyPrice ?? '').trim()).trim(),
    price: String(String(item.price ?? '').trim() || String(masterRow?.sellPrice ?? '').trim()).trim(),
    equipSlot: inferEquipSlotForInventory({ ...item, kind }),
    skill: kind === '武器' ? canonicalWeaponUsageSkill(item) : String(item.skill || '').trim(),
    power: effectivePower,
    hit: String(item.hit || item.hitMod || firstModifierText('hit')).trim(),
    defense: String(item.defense || item.alwaysDefense || firstModifierText('combat:defense')).trim(),
    guard: String(item.guard || item.guardValue || firstModifierText('combat:guardAction')).trim(),
    evade: String(item.evade || item.evasionMod || firstModifierText('skill:evade') || firstModifierText('combat:evasion')).trim(),
    offhand: String(item.offhand || item.offhandBonus || '').trim(),
    reloadTurns: String(item.reloadTurns || item.reloadTurn || item.reload || '').trim(),
    modifiers: normalizedModifiers,
    upgradeLimit: normalizedUpgradeLimit > 0 ? String(normalizedUpgradeLimit) : '',
    upgradeMaterialMinRank: inventoryKindSupportsUpgradeLimit(kind) ? String(item.upgradeMaterialMinRank || item.rank || '').trim() : '',
    equipmentUpgradeEffect: masterIsMaterial ? (masterUpgradeEffect || String(item.equipmentUpgradeEffect || '').trim()) : String(item.equipmentUpgradeEffect || '').trim(),
    equipmentUpgradeSlotCost: masterIsMaterial ? (masterUpgradeSlotCost || String(item.equipmentUpgradeSlotCost || '').trim()) : String(item.equipmentUpgradeSlotCost || '').trim(),
    equipmentUpgradeDetail: masterIsMaterial ? (masterUpgradeDetail || String(item.equipmentUpgradeDetail || '').trim()) : String(item.equipmentUpgradeDetail || '').trim(),
    equipmentUpgradeTarget: masterIsMaterial ? (masterUpgradeTarget || String(item.equipmentUpgradeTarget || '').trim()) : String(item.equipmentUpgradeTarget || '').trim(),
    namedProcessingOptions,
    equipmentEffects,
    appliedNamedProcessingId: appliedNamedProcessing ? appliedNamedProcessingId : '',
    namedProcessingBase: appliedNamedProcessing ? {power:basePower,modifiers:baseModifierText,effect:baseEffect,spellSlots:baseSpellSlots} : null,
    upgradeEntries: normalizedUpgradeEntries,
    upgradeLines: serializeUpgradeEntries(normalizedUpgradeEntries),
    spellSlots: kind === 'バッグ' ? '' : effectiveSpellSlots,
    setSpells: splitFormulaList(item.setSpells || item.selectedSpells || '').join('\n'),
    target: String(item.target || item['対象'] || masterRow?.target || '').trim(),
    element: String(item.element || item.attribute || item.attributeType || item.elementName || item['属性'] || item['属性種別'] || item['攻撃属性'] || item['ダメージ属性'] || masterRow?.element || defaultElementForEquipmentRow(item) || '').trim(),
    enchantTarget: String(item.enchantTarget || '').trim(),
    enchantEffectType: String(item.enchantEffectType || '').trim(),
    enchantValue: String(item.enchantValue || '').trim(),
    enchantDuration: String(item.enchantDuration || '').trim(),
    enchantRounds: String(item.enchantRounds || '').trim(),
    enchantStackRule: String(item.enchantStackRule || '').trim(),
    cost: String(item.cost || item.mpCost || item['MP'] || item['コスト'] || '').trim(),
    checkType: kind === '武器' ? '' : normalizeCheckExpression(item.checkType || item['判定'] || masterRow?.checkType || ''),
    role: String(item.role || item['役割'] || '').trim(),
    source: String(item.source || masterRow?.source || '').trim(),
    tags: String(item.tags || '').trim(),
    setItem: String(item.setItem || '').trim(),
    description: mergeTextUnique(item.description, item['説明'], oldDescription, masterRow?.description),
    effect: effectiveEffect,
    recipeResult: String(item.recipeResult || item.resultItem || '').trim(),
    materials: String(item.materials || item.requiredMaterials || '').trim(),
    note: String(item.note || item.notes || '').trim()
  };
}

function isSpellInventoryItem(row={}) {
  const kind = normalizeInventoryKind(row.kind || '');
  const rawKind = String(row.kind || '').trim();
  const masterSheet = String(row.masterSheet || row.sourceSheet || '').trim().toLowerCase();
  const category = String(row.category || row.type || '').trim();
  const itemType = String(row.itemType || '').trim();
  const checkType = String(row.checkType || row['判定'] || '').trim();
  const spellText = [row.setItem, row.tags, row.role, row.description, row.effect].map(v => String(v || '')).join(' / ');
  if (itemType === 'スクロール' || /スクロール/.test(category) || /スクロール/.test(String(row.name || ''))) return false;
  if (kind === '術式') return true;
  if (masterSheet === 'spells' || masterSheet === 'spell') return true;
  if (rawKind.includes('術式') || ['魔法','祈祷','魔術','聖術','神聖術'].includes(rawKind)) return true;
  if ((category.includes('術式') || ['魔法','祈祷','魔術','聖術','神聖術','攻撃魔法'].includes(category)) && !['武器','防具','装飾品'].includes(kind)) return true;
  if (/^魔法\s*>=|^祈祷\s*>=/.test(checkType) && !['武器','防具','装飾品'].includes(kind)) return true;
  if (/魔導書|祈祷書|魔印|聖印|スクロール/.test(spellText) && /魔法|祈祷|術式|魔術|聖術|神聖/.test([category, rawKind, checkType, spellText].join(' / ')) && !['武器','防具','装飾品'].includes(kind)) return true;
  return false;
}
function findSpellInventoryItemByIdOrName(item={}) {
  const id = String(item.itemId || item.id || item.masterId || '').trim();
  const name = String(item.name || '').trim();
  if (!id && !name) return null;
  const cache=inventoryDerived();
  if(id){
    const direct=cache.rowByLookup.get(id) || cache.rowByLookup.get(id.toUpperCase());
    if(direct && isSpellInventoryItem(direct)) return direct;
  }
  if(name){
    const direct=cache.rowByName.get(name);
    if(direct && isSpellInventoryItem(direct)) return direct;
  }
  return null;
}
function carryEquipmentLooksLikeSpell(item={}) {
  const type = String(item.type || item.category || '').trim();
  const kind = String(item.kind || '').trim();
  if (kind.includes('術式') || type.includes('術式')) return true;
  return !!findSpellInventoryItemByIdOrName(item);
}
function resetCarryEquipmentItem(base) {
  Object.assign(base, { itemId:'', name:'', type:'なし', count:1, element:'', description:'', note:'', warehouseAllocated:false, warehouseItemId:'' });
}

function isCarrySlotKey(slotKey) {
  const slot = EQUIPMENT_SLOTS.find(s => s.key === slotKey);
  return !!slot && slot.kind === 'carry';
}
function learnedRecipeKey(item={}) {
  const row = normalizeInventoryItem(item);
  return String(row.publicId || row.masterId || row.id || canonicalInventoryItemName(row.name || '')).trim().toUpperCase();
}
function normalizeLearnedRecipes(rows=[]) {
  const seen = new Set();
  const out = [];
  for (const raw of (Array.isArray(rows) ? rows : [])) {
    const row = normalizeInventoryItem({ ...raw, kind:'レシピ', count:1, location:'倉庫' });
    const key = learnedRecipeKey(row);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}
function isRecipeLearned(item={}) {
  const key = learnedRecipeKey(item);
  return !!key && (learnedRecipesState || []).some(row => learnedRecipeKey(row) === key);
}
function getInventoryState() {
  // collectData側で装備強化・術式セットの同期は済ませる。倉庫全件の再normalizeもしない。
  const items = inventoryDerived().rows.filter(item => item.name || item.category || item.power || item.description || item.effect || item.capacity || item.count > 0);
  const learnedRecipes = normalizeLearnedRecipes(learnedRecipesState);
  return { items, learnedRecipes, bagId:selectedBagId || '', quiverId:selectedQuiverId || '', quiverAmmoSlots:normalizeQuiverAmmoSlotsState(quiverAmmoSlotsState), masterVersion:inventoryMasterSyncVersion || '' };
}
function setInventoryState(inventory=defaultInventory(), {render=true,refreshLinked=true}={}) {
  const normalized = normalizeInventoryState(inventory);
  inventoryItemsState = normalized.items;
  invalidateInventoryDerivedCache();
  learnedRecipesState = normalizeLearnedRecipes(normalized.learnedRecipes || []);
  selectedBagId = normalized.bagId || '';
  selectedQuiverId = normalized.quiverId || '';
  quiverAmmoSlotsState = normalizeQuiverAmmoSlotsState(normalized.quiverAmmoSlots || {}, {restoreInvalid:true});
  inventoryMasterSyncVersion = normalized.masterVersion || '';
  ensureDefaultBagItem();
  if (!selectedBagId) {
    const defaultBag = inventoryDerived().bags.find(item => inventoryItemKey(item) === 'bag_simple' || item.id === 'bag_simple' || item.name === '簡素なバッグ');
    if (defaultBag) selectedBagId = inventoryItemKey(defaultBag) || defaultBag.id || defaultBag.name;
  }
  // キャラクター読込中は装備状態の反映が終わるまで倉庫DOMを作らない。
  if(render){
    renderInventory({refreshLinked});
    renderQuiverControls();
  }
}
function renderInventoryTabs() {
  const locationArea = $('inventoryLocationTabs');
  const kindArea = $('inventoryKindTabs');
  const categoryArea = $('inventoryCategoryTabs');
  const categoryRow = $('inventoryCategoryFilterRow');
  if (locationArea) {
    locationArea.innerHTML = INVENTORY_LOCATION_FILTERS.map(v => `<button type="button" class="ghost ${inventoryViewFilter.location === v ? 'active' : ''}" data-inventory-filter="location" data-value="${esc(v)}">${esc(v)}</button>`).join('');
  }
  const catalogSets = inventoryDisplayMode==='catalog' ? gmCatalogCategorySets() : null;
  const smallCategories = catalogSets ? ['全て', ...INVENTORY_SMALL_CATEGORY_ORDER.filter(v=>catalogSets.small.has(v)), ...[...catalogSets.small].filter(v=>!INVENTORY_SMALL_CATEGORY_ORDER.includes(v)).sort((a,b)=>a.localeCompare(b,'ja',{numeric:true}))] : inventorySmallCategories();
  if (!smallCategories.includes(inventoryViewFilter.itemType)) {
    inventoryViewFilter.itemType = '全て';
    inventoryViewFilter.category = '全て';
  }
  if (kindArea) {
    kindArea.innerHTML = smallCategories.map(v => `<button type="button" class="ghost ${inventoryViewFilter.itemType === v ? 'active' : ''}" data-inventory-filter="itemType" data-value="${esc(v)}">${esc(v)}</button>`).join('');
  }
  const internal = catalogSets ? (inventoryViewFilter.itemType==='全て' ? [] : ['全て', ...[...(catalogSets.internal.get(inventoryViewFilter.itemType)||new Set())].sort((a,b)=>a.localeCompare(b,'ja',{numeric:true}))]) : inventoryInternalCategories(inventoryViewFilter.itemType);
  if (!internal.includes(inventoryViewFilter.category)) inventoryViewFilter.category = '全て';
  if (categoryRow) categoryRow.hidden = internal.length <= 1;
  if (categoryArea) {
    categoryArea.innerHTML = internal.map(v => `<button type="button" class="ghost ${inventoryViewFilter.category === v ? 'active' : ''}" data-inventory-filter="category" data-value="${esc(v)}">${esc(v)}</button>`).join('');
  }
}
function applyInventoryFilters() {
  if (inventoryDisplayMode === 'learned') { applyLearnedKnowledgeSearch(); return; }
  const rows = Array.from(document.querySelectorAll('#inventoryArea [data-inventory-row]'));
  const search = String(inventoryViewFilter.search || $('inventorySearchInput')?.value || '').trim().toLowerCase();
  let visible = 0;
  for (const card of rows) {
    const loc = normalizeInventoryLocation(card.dataset.inventoryLocation || '倉庫');
    const itemType = String(card.dataset.inventoryItemType || 'その他').trim() || 'その他';
    const category = String(card.dataset.inventoryCategory || '未分類').trim() || '未分類';
    const haystack = String(card.dataset.inventorySearch || '').toLowerCase();
    const locationOk = inventoryViewFilter.location === '全て' || loc === inventoryViewFilter.location;
    const itemTypeOk = inventoryViewFilter.itemType === '全て' || itemType === inventoryViewFilter.itemType;
    const categoryOk = inventoryViewFilter.category === '全て' || category === inventoryViewFilter.category;
    const searchOk = !search || haystack.includes(search);
    const show = locationOk && itemTypeOk && categoryOk && searchOk;
    card.classList.toggle('inventory-hidden', !show);
    if (show) visible++;
  }
  const filterStatus = $('inventoryFilterStatus');
  if (filterStatus) {
    const type = inventoryViewFilter.itemType === '全て' ? '全小カテゴリ' : inventoryViewFilter.itemType;
    const category = inventoryViewFilter.category === '全て' ? '' : ` / ${inventoryViewFilter.category}`;
    const searchText = search ? ` / 検索「${search}」` : '';
    filterStatus.textContent = `${inventoryDisplayMode==='catalog'?'全アイテム':'倉庫'} / ${type}${category}${searchText}：${visible}件表示（全${rows.length}件）`;
  }
  if ($('inventoryEmptyStatus')) $('inventoryEmptyStatus').style.display = rows.length ? 'none' : '';
}
function setInventoryFilter(type, value) {
  if (type === 'location') inventoryViewFilter.location = value || '全て';
  if (type === 'itemType') {
    inventoryViewFilter.itemType = value || '全て';
    inventoryViewFilter.category = '全て';
  }
  if (type === 'category') inventoryViewFilter.category = value || '全て';
  if (type === 'search') inventoryViewFilter.search = value || '';
  if (inventoryDisplayMode !== 'learned') renderInventoryTabs();
  applyInventoryFilters();
}
function inventoryOptions(value, list) {
  return list.map(v => `<option value="${esc(v)}" ${String(value || '') === v ? 'selected' : ''}>${esc(v)}</option>`).join('');
}
function inventoryManualEquipSlotChoices(kind='', category='') {
  const k=String(kind||'').trim(),cat=String(category||'').trim();
  if(k==='武器'){
    if(TWO_HAND_TYPES.has(normalizeEquipmentType(cat)))return ['両手'];
    return ['右手/左手','両手'];
  }
  if(k==='防具'){
    if(['盾','大盾'].includes(normalizeEquipmentType(cat))||/盾/.test(cat))return ['右手/左手'];
    return ['鎧','右手/左手'];
  }
  if(k==='装飾品')return ['装飾品'];
  return [];
}
function inventoryManualElementChoices(kind='', category='') {
  const k=String(kind||'').trim(),cat=normalizeEquipmentType(String(category||'').trim());
  if(k==='術式')return ['','火','水','風','雷','光','闇','無'];
  if(k==='武器'&&['弓','クロスボウ','ヘヴィクロスボウ'].includes(cat))return ['','矢弾依存'];
  if(k==='武器')return ['','物','火','水','風','雷','光','闇','無','可変'];
  if(k==='アイテム')return ['','物','火','水','風','雷','光','闇','無','可変'];
  return [''];
}
function setSimpleSelectOptions(select, values=[], current='', emptyLabel='未選択') {
  if(!select)return;
  const list=[...new Set(values.map(v=>String(v??'')))];
  select.innerHTML=list.map(v=>`<option value="${esc(v)}">${esc(v||emptyLabel)}</option>`).join('');
  select.value=list.includes(String(current||''))?String(current||''):(list[0]||'');
}
function refreshInventoryFormContextOptions() {
  const kind=$('inventoryFormKind')?.value||'アイテム';
  const category=String($('inventoryFormCategory')?.value||'').trim();
  const equip=$('inventoryFormEquipSlot');
  if(equip){
    const previous=equip.value||'';
    const slots=inventoryManualEquipSlotChoices(kind,category);
    setSimpleSelectOptions(equip,slots.length?slots:[''],previous,'なし');
  }
  const element=$('inventoryFormElement');
  if(element){
    const previous=element.value||'';
    setSimpleSelectOptions(element,inventoryManualElementChoices(kind,category),previous,'未選択');
  }
  const ammoLike=kind==='アイテム'&&(/矢弾|矢$|ボルト|大型ボルト/.test(category)||String($('inventoryFormAmmoKind')?.value||'').trim()||String($('inventoryFormCompatibleWeaponTypes')?.value||'').trim());
  document.querySelectorAll('[data-inventory-context-field="ammo"]').forEach(el=>{el.style.display=ammoLike?'':'none';});
}
function characterUpgradeDisplayName(item={}){
  return String(item.equipmentUpgradeEffect||'').trim();
}
function rememberInventoryCardOpenStates() {
  document.querySelectorAll('#inventoryArea details.inventory-card[data-inventory-stable-key]').forEach(card => {
    inventoryCardOpenState.set(String(card.dataset.inventoryStableKey || ''), !!card.open);
  });
}
function restoreInventoryCardOpenStates() {
  document.querySelectorAll('#inventoryArea details.inventory-card[data-inventory-stable-key]').forEach(card => {
    const key = String(card.dataset.inventoryStableKey || '');
    if (inventoryCardOpenState.has(key)) card.open = !!inventoryCardOpenState.get(key);
  });
}
function learnedRecipeCardHtml(item, index) {
  const row = normalizeInventoryItem(item);
  const key = learnedRecipeKey(row);
  const title = row.name || '名称未設定のレシピ';
  const rank = inventoryRankLabel(row) || '—';
  const category = row.category || row.itemCategory || 'レシピ';
  const recipeMeta = [row.recipeResult ? '完成品：' + row.recipeResult : '', row.materials ? '必要素材：' + row.materials : ''].filter(Boolean).join('\n');
  const searchText = [title, rank, category, row.recipeResult, row.materials, row.description, row.effect, row.publicId].filter(Boolean).join(' ');
  return `<details class="inventory-card learned-recipe-card" data-inventory-row="learned-recipe-${index}" data-inventory-stable-key="learned-recipe:${esc(key)}" data-learned-search="${esc(searchText)}">
    <summary class="inventory-card-head"><div><div class="inventory-title">${esc(title)}</div><div class="small">習得済み / レシピ / ${esc(category)}</div></div></summary>
    <div class="inventory-card-meta">
      ${row.publicId ? `<div class="meta-item"><span class="meta-label">登録ID</span>${esc(row.publicId)}</div>` : ''}
      <div class="meta-item"><span class="meta-label">ランク</span>${esc(rank)}</div>
      <div class="meta-item"><span class="meta-label">カテゴリ</span>${esc(category)}</div>
      <div class="meta-item"><span class="meta-label">買値</span>${esc(inventoryBuyPriceText(row.buyPrice))}</div>
      <div class="meta-item"><span class="meta-label">売値</span>${esc(inventorySellPriceText(row.price)||'—')}</div>
      ${recipeMeta ? `<div class="meta-item meta-wide"><span class="meta-label">レシピ</span><div class="inventory-note">${esc(recipeMeta)}</div></div>` : ''}
      ${row.description ? `<div class="meta-item meta-wide"><span class="meta-label">説明</span><div class="inventory-note">${esc(row.description)}</div></div>` : ''}
      ${row.effect ? `<div class="meta-item meta-wide"><span class="meta-label">効果</span><div class="inventory-note">${esc(row.effect)}</div></div>` : ''}
      <div class="meta-item meta-wide"><div class="button-row" style="margin:0"><button type="button" class="danger" data-unlearn-recipe="${esc(key)}">習得済みから外す</button></div></div>
    </div>
  </details>`;
}
function learnedSpellKey(item={}) {
  const row = normalizeInventoryItem(item);
  return String(row.publicId || row.masterId || row.id || canonicalInventoryItemName(row.name || '')).trim().toUpperCase();
}
function learnedSpellRowsForInventory() {
  const seen = new Set();
  const rows = [];
  for (const row of inventoryDerived().rows) {
    if (!isLearnedSpellInventoryRow(row)) continue;
    const key = learnedSpellKey(row);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  return rows.sort((a,b)=>String(a.category||'').localeCompare(String(b.category||''),'ja')||String(a.name||'').localeCompare(String(b.name||''),'ja'));
}
function learnedSpellCardHtml(item, index) {
  const row = normalizeInventoryItem(item);
  const key = learnedSpellKey(row);
  const title = row.name || '名称未設定の術式';
  const category = row.category || row.itemCategory || '術式';
  const rank = inventoryRankLabel(row) || '—';
  const spellMeta = [
    row.element ? '属性：' + row.element : '',
    row.cost ? '消費：' + row.cost : '',
    row.target ? '対象：' + row.target : '',
    row.power ? 'ダメージ/威力：' + row.power : '',
    row.checkType ? '判定：' + checkExpressionDisplay(row.checkType) : '',
    row.role ? '役割：' + row.role : ''
  ].filter(Boolean).join(' / ');
  const searchText = [title, category, rank, row.element, row.cost, row.target, row.power, row.checkType, row.role, row.description, row.effect, row.publicId].filter(Boolean).join(' ');
  return `<details class="inventory-card learned-spell-card" data-inventory-row="learned-spell-${index}" data-inventory-stable-key="learned-spell:${esc(key)}" data-learned-search="${esc(searchText)}">
    <summary class="inventory-card-head"><div><div class="inventory-title">${esc(title)}</div><div class="small">習得済み / 術式 / ${esc(category)}</div></div></summary>
    <div class="inventory-card-meta">
      ${row.publicId ? `<div class="meta-item"><span class="meta-label">登録ID</span>${esc(row.publicId)}</div>` : ''}
      <div class="meta-item"><span class="meta-label">ランク</span>${esc(rank)}</div>
      <div class="meta-item"><span class="meta-label">種別</span>${esc(category)}</div>
      ${spellMeta ? `<div class="meta-item meta-wide"><span class="meta-label">術式データ</span><div class="inventory-note">${esc(spellMeta)}</div></div>` : ''}
      ${row.description ? `<div class="meta-item meta-wide"><span class="meta-label">説明</span><div class="inventory-note">${esc(row.description)}</div></div>` : ''}
      ${row.effect ? `<div class="meta-item meta-wide"><span class="meta-label">効果</span><div class="inventory-note">${esc(row.effect)}</div></div>` : ''}
    </div>
  </details>`;
}
function learnedSkillCardHtml(skill, index) {
  const s = skill || {};
  const category = String(s.category || '未分類').trim() || '未分類';
  const searchText = [s.name,s.publicId,s.rank,s.category,s.weaponType,s.timing,s.cost,s.ct,s.effect,s.description].filter(Boolean).join(' ');
  return `<details class="inventory-card learned-skill-card" data-inventory-row="learned-skill-${index}" data-inventory-stable-key="learned-skill:${esc(s.id || s.publicId || s.name || index)}" data-learned-search="${esc(searchText)}">
    <summary class="inventory-card-head"><div><div class="inventory-title">${esc(s.name || '名称未設定のスキル')} <span class="skill-badge">★${esc(s.rank||1)}</span></div><div class="small">習得済み / スキル / ${esc(category)}</div></div></summary>
    <div class="inventory-card-meta">
      <div class="meta-item"><span class="meta-label">カテゴリ</span>${esc(category)}</div>
      ${s.weaponType ? `<div class="meta-item"><span class="meta-label">武器種</span>${esc(s.weaponType)}</div>` : ''}
      ${s.publicId ? `<div class="meta-item"><span class="meta-label">登録ID</span>${esc(s.publicId)}</div>` : ''}
      <div class="meta-item"><span class="meta-label">ランク</span>★${esc(s.rank||1)}</div>
      ${s.timing ? `<div class="meta-item meta-wide"><span class="meta-label">タイミング</span><div class="inventory-note">${esc(s.timing)}</div></div>` : ''}
      ${s.cost ? `<div class="meta-item"><span class="meta-label">消費</span>${esc(s.cost)}</div>` : ''}
      ${s.ct ? `<div class="meta-item"><span class="meta-label">CT</span>${esc(s.ct)}</div>` : ''}
      ${s.effect ? `<div class="meta-item meta-wide"><span class="meta-label">効果</span><div class="inventory-note">${esc(s.effect)}</div></div>` : (s.description ? `<div class="meta-item meta-wide"><span class="meta-label">概要</span><div class="inventory-note">${esc(s.description)}</div></div>` : '')}
    </div>
  </details>`;
}
function learnedContentLabel(type=learnedContentType) {
  return type === 'skill' ? 'スキル' : (type === 'recipe' ? 'レシピ' : '術式');
}
function learnedContentRows(type=learnedContentType) {
  if (type === 'skill') return ownedSkillRowsForInventory();
  if (type === 'recipe') return normalizeLearnedRecipes(learnedRecipesState);
  return learnedSpellRowsForInventory();
}
function renderLearnedKindTabs() {
  const counts = {
    spell: learnedSpellRowsForInventory().length,
    skill: ownedSkillRowsForInventory().length,
    recipe: normalizeLearnedRecipes(learnedRecipesState).length
  };
  const tabs = $('learnedKindTabs');
  if (tabs) tabs.querySelectorAll('[data-learned-kind]').forEach(btn => {
    const type = btn.dataset.learnedKind || 'spell';
    btn.classList.toggle('active', type === learnedContentType);
    btn.textContent = `${learnedContentLabel(type)}（${counts[type] || 0}）`;
  });
  const label = `${learnedContentLabel()}（${counts[learnedContentType] || 0}）`;
  if ($('learnedKindPickerLabel')) $('learnedKindPickerLabel').textContent = label;
  const list=$('learnedKindDialogList');
  if(list) list.innerHTML=['spell','skill','recipe'].map(type=>`<button type="button" class="ghost public-view-allowed ${type===learnedContentType?'active':''}" data-learned-kind-choice="${type}">${learnedContentLabel(type)}（${counts[type]||0}）</button>`).join('');
}
function applyLearnedKnowledgeSearch() {
  const search = String(inventoryViewFilter.search || $('inventorySearchInput')?.value || '').trim().toLowerCase();
  const cards = Array.from(document.querySelectorAll('#inventoryArea [data-learned-search]'));
  let visible = 0;
  cards.forEach(card => {
    const show = !search || String(card.dataset.learnedSearch || '').toLowerCase().includes(search);
    card.classList.toggle('inventory-hidden', !show);
    if (show) visible++;
  });
  const label = learnedContentLabel();
  if ($('inventoryFilterStatus')) $('inventoryFilterStatus').textContent = `習得済み${label}：${visible}件表示（全${cards.length}件）${search ? ` / 検索「${search}」` : ''}`;
  if ($('inventoryEmptyStatus')) {
    $('inventoryEmptyStatus').style.display = cards.length ? 'none' : '';
    $('inventoryEmptyStatus').textContent = learnedContentType === 'recipe'
      ? '覚えたレシピはまだありません。所持品（倉庫）のレシピから「覚える」を押すと登録できます。'
      : `習得済みの${label}はまだありません。`;
  }
}
function updateInventoryModeUi() {
  document.querySelectorAll('#inventoryModeTabs [data-inventory-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.inventoryMode === inventoryDisplayMode));
  const learned = inventoryDisplayMode === 'learned';
  const catalog = inventoryDisplayMode === 'catalog';
  const label = learnedContentLabel();
  if ($('learnedKindTabs')) $('learnedKindTabs').hidden = true;
  if ($('learnedKindPickerWrap')) $('learnedKindPickerWrap').hidden = !learned;
  if (learned) renderLearnedKindTabs();
  if ($('inventoryListTitle')) $('inventoryListTitle').textContent = learned ? `習得済み${label}` : (catalog ? '全アイテム一覧' : '所持品（倉庫）一覧');
  if ($('inventoryListHint')) $('inventoryListHint').textContent = learned
    ? `習得済みの${label}だけを表示します。「習得内容を選択」から切り替えられます。`
    : (catalog ? '共通DBのアイテムから数量を指定して、このキャラクター固有の倉庫へ追加します。' : '倉庫に所持している物を表示します。所持レシピもここで確認できます。');
  if ($('sortInventoryItemBtn')) $('sortInventoryItemBtn').hidden = learned || catalog;
  if ($('inventoryFilterPanel')) $('inventoryFilterPanel').hidden = learned;
  const registration = document.querySelector('.inventory-registration-card');
  if (registration) registration.hidden = learned || catalog;
}
function setInventoryDisplayMode(mode='warehouse') {
  inventoryDisplayMode = ['learned','catalog'].includes(mode) ? mode : 'warehouse';
  inventoryViewFilter.itemType='全て'; inventoryViewFilter.category='全て';
  if(inventoryDisplayMode==='catalog') inventoryViewFilter.location='全て';
  renderInventory({refreshLinked:false});
}
function setLearnedContentType(type='spell') {
  learnedContentType = ['spell','skill','recipe'].includes(type) ? type : 'spell';
  renderInventory({refreshLinked:false});
}
function learnRecipeFromInventory(index) {
  if (currentMode === 'view') return;
  const row = inventoryItemsState[index] ? normalizeInventoryItem(inventoryItemsState[index]) : null;
  if (!row || row.kind !== 'レシピ') return;
  if (isRecipeLearned(row)) { showToast('このレシピはすでに覚えています。', 'warn'); return; }
  learnedRecipesState = normalizeLearnedRecipes([...(learnedRecipesState || []), row]);
  renderInventory({refreshLinked:false});
  if (typeof autoSaveDraftSoon === 'function') autoSaveDraftSoon('inventory');
  showToast(`レシピを覚えました：${row.name || '名称未設定'}`, 'ok');
}
function unlearnRecipeByKey(key='') {
  if (currentMode === 'view') return;
  const target = String(key || '').trim().toUpperCase();
  learnedRecipesState = normalizeLearnedRecipes(learnedRecipesState).filter(row => learnedRecipeKey(row) !== target);
  renderInventory({refreshLinked:false});
  if (typeof autoSaveDraftSoon === 'function') autoSaveDraftSoon('inventory');
}
function inventoryWarehouseCardSearchText(item={}){
  const displayType=inventorySmallCategory(item),displayCategory=inventoryInternalCategory(item);
  const categoryDisplay=displayType==='素材'
    ? [item.materialType||'素材',item.materialCategory||item.category||''].filter(Boolean).join(' / ')
    : (item.category||displayCategory||'—');
  return [
    item.name,displayType,displayCategory,categoryDisplay,item.itemType,item.itemCategory,item.materialType,item.materialCategory,
    item.kind,item.category,item.rank,item.buyPrice,item.price,item.equipSlot,item.skill,item.power,item.hit,item.defense,item.guard,item.evade,
    item.offhand,item.upgradeLimit,item.upgradeMaterialMinRank,item.equipmentUpgradeEffect,item.equipmentUpgradeSlotCost,
    item.equipmentUpgradeDetail,item.equipmentUpgradeTarget,item.spellSlots,item.capacity,item.bagCapacity,item.quiverCapacity,
    item.ammoKind,item.compatibleWeaponTypes,item.target,item.element,item.enchantTarget,item.enchantEffectType,item.enchantValue,
    item.enchantDuration,item.enchantRounds,item.enchantStackRule,item.cost,item.description,item.effect,item.checkType,item.role,
    item.source,item.tags,item.recipeResult,item.materials,item.upgradeLines,item.publicId
  ].filter(Boolean).join(' ');
}
function inventoryWarehouseQuickText(item={}){
  return [
    `個数 ${item.count??0}`,
    inventoryRankLabel(item)||'',
    inventorySellPriceText(item.price)?`売値 ${inventorySellPriceText(item.price)}`:''
  ].filter(Boolean).join(' / ');
}
function inventoryWarehouseCardHtml(item,index){
  if(isLearnedSpellInventoryRow(item))return '';
  const title=item.name||'未設定アイテム';
  const displayType=inventorySmallCategory(item);
  const displayCategory=inventoryInternalCategory(item);
  const quick=inventoryWarehouseQuickText(item);
  const stable=`item:${inventoryItemKey(item)||learnedRecipeKey(item)||String(index)}`;
  const namedOptions=parseNamedProcessingOptions(item.namedProcessingOptions);const namedApplied=!!String(item.appliedNamedProcessingId||'').trim();const namedClass=namedApplied?' named-process-applied':(namedOptions.length?' named-process-available':'');const namedBadge=namedApplied?'<span class="named-process-inline-badge applied">異名加工済</span>':(namedOptions.length?'<span class="named-process-inline-badge">異名加工可</span>':'');
  return `<article class="inventory-card inventory-card-static${namedClass}" data-inventory-row="${index}" data-inventory-stable-key="${esc(stable)}" data-inventory-id="${esc(item.id||'')}" data-inventory-location="倉庫" data-inventory-kind="${esc(item.kind||'アイテム')}" data-inventory-item-type="${esc(displayType)}" data-inventory-category="${esc(displayCategory)}" data-inventory-search="${esc(inventoryWarehouseCardSearchText(item))}">
    <div class="inventory-card-head">
      <div><div class="inventory-title">${esc(title)}</div>${namedBadge?`<div class="named-process-badge-row">${namedBadge}</div>`:''}<div class="small">倉庫 / ${esc(displayType)} / ${esc(displayCategory)}<span data-inventory-quick-index="${index}">${quick?` / ${esc(quick)}`:''}</span></div></div>
      <div class="button-row" style="margin:0;">
        ${item.kind==='レシピ'?`<button type="button" class="secondary" data-inventory-action="learn-recipe" data-index="${index}" ${isRecipeLearned(item)?'disabled':''}>${isRecipeLearned(item)?'習得済み':'覚える'}</button>`:''}
        <button type="button" class="ghost inventory-detail-btn public-view-allowed" data-inventory-action="detail" data-index="${index}">詳細</button>
        <button type="button" class="secondary" data-inventory-action="edit" data-index="${index}">編集</button>
        <button type="button" class="ghost" data-inventory-action="duplicate" data-index="${index}">複製</button>
        <button type="button" class="danger" data-inventory-action="delete" data-index="${index}">削除</button>
      </div>
    </div>
  </article>`;
}
function inventoryWarehouseDetailHtml(item,index){
  const title=item.name||'未設定アイテム';
  const description=item.description||'';
  const effectText=item.effect||'';
  const equipMeta=[item.equipSlot?'装備/使用枠：'+item.equipSlot:'',item.kind==='武器'&&item.skill?'使用技能：'+item.skill:'',item.element?'属性：'+item.element:'',item.power?'威力：'+item.power:'',item.hit?'命中補正：'+item.hit:'',item.defense?'防御値：'+item.defense:'',item.guard?'防御行動値：'+item.guard:'',item.evade?'回避補正：'+item.evade:'',item.offhand?'副手追撃値：'+item.offhand:'',inventoryKindSupportsUpgradeLimit(item.kind)&&item.upgradeLimit?'強化枠上限：'+item.upgradeLimit:'',inventoryKindSupportsUpgradeLimit(item.kind)&&item.upgradeMaterialMinRank?'強化素材最低ランク：'+characterPlayerRankLabel(item.upgradeMaterialMinRank):''].filter(Boolean).join(' / ')||'—';
  const spellMeta=item.kind==='術式'?[item.category?'種別：'+item.category:'',item.element?'属性：'+item.element:'',item.cost?'コスト：'+item.cost:'',item.target?'対象：'+item.target:'',item.power?'ダメージ/威力：'+item.power:'',item.checkType?'判定：'+checkExpressionDisplay(item.checkType):'',item.role?'役割：'+item.role:''].filter(Boolean).join(' / '):'';
  const recipeMeta=item.kind==='レシピ'?[item.recipeResult?'完成品：'+item.recipeResult:'',item.materials?'必要素材：'+item.materials:''].filter(Boolean).join('\n'):'';
  const itemUseMeta=['アイテム','素材','矢筒','バッグ'].includes(item.kind)?[item.target?'対象：'+item.target:'',item.element?'属性：'+item.element:'',item.power?'威力：'+item.power:'',item.cost?'コスト：'+item.cost:'',item.checkType?'判定：'+checkExpressionDisplay(item.checkType):'',item.ammoKind?'矢弾種別：'+item.ammoKind:'',item.compatibleWeaponTypes?'対応武器種：'+item.compatibleWeaponTypes:'',item.spellSlots?'最大スタック数：'+item.spellSlots:'',item.quiverCapacity?'矢筒収納種類数：'+item.quiverCapacity:'',item.bagCapacity?'バッグ容量：'+item.bagCapacity:'',item.source?'入手先：'+item.source:'',item.tags?'タグ：'+item.tags:''].filter(Boolean).join(' / '):'';
  const spellSlotMeta=item.spellSlots&&['武器','防具','装飾品','術式'].includes(item.kind)?`術式枠補正：+${item.spellSlots}`:'';
  const savedUpgradeEntries=parseUpgradeLines(item.upgradeEntries||item.upgradeLines||'');
  const savedUpgradeMeta=serializeUpgradeEntries(savedUpgradeEntries);
  const materialUpgradeDetail=String(item.equipmentUpgradeDetail||standardUpgradeDetailText({content:item.equipmentUpgradeEffect})).trim();
  const materialUpgradeMeta=item.kind==='素材'&&item.equipmentUpgradeEffect?[
    `内容：${characterUpgradeDisplayName(item)}`,
    `消費強化枠：${Number(item.equipmentUpgradeSlotCost)||1}枠`,
    item.equipmentUpgradeTarget?`強化対象：${item.equipmentUpgradeTarget}`:'',
    materialUpgradeDetail?`効果説明：${materialUpgradeDetail}`:''
  ].filter(Boolean).join('\n'):'';
  const bagMeta=item.kind==='バッグ'?`バッグ容量：${clampInt(item.capacity||0,0,99)}`:'';
  const displayType=inventorySmallCategory(item),displayCategory=inventoryInternalCategory(item);
  const categoryDisplay=displayType==='素材'
    ? [item.materialType||'素材',item.materialCategory||item.category||''].filter(Boolean).join(' / ')
    : (item.category||displayCategory||'—');
  const disabled=currentMode==='view'?'disabled':'';
  const individualRecord=inventoryKindUsesIndividualRecord(item.kind);
  const countDisabled=(currentMode==='view'||individualRecord)?'disabled':'';
  return `<div class="inventory-card-meta">
    <div class="meta-item"><span class="meta-label">カテゴリ</span>${esc(categoryDisplay)}</div>
    ${item.publicId?`<div class="meta-item"><span class="meta-label">登録ID</span>${esc(item.publicId)}</div>`:''}
    <div class="meta-item"><span class="meta-label">個数</span><div class="inventory-count-editor"><input type="number" min="${individualRecord?'1':'0'}" max="${individualRecord?'1':'9999'}" inputmode="numeric" value="${esc(individualRecord?1:(item.count??0))}" data-inventory-count-index="${index}" aria-label="${esc(title)}の個数" ${countDisabled}/>${individualRecord?'<span class="small">個体管理</span>':''}</div></div>
    ${bagMeta?`<div class="meta-item"><span class="meta-label">バッグ容量</span>${esc(item.capacity||0)}</div>`:''}
    <div class="meta-item"><span class="meta-label">ランク</span>${esc(inventoryRankLabel(item)||'—')}</div>
    ${(!isAntiqueIndividualItem(item)&&sameNameEquipmentCount(item)>1)?`<div class="meta-item"><span class="meta-label">個体識別</span>${esc(inventoryIndividualShortId(item))}</div>`:''}
    <div class="meta-item"><span class="meta-label">買値</span>${esc(inventoryBuyPriceText(item.buyPrice))}</div>
    <div class="meta-item"><span class="meta-label">売値</span>${esc(inventorySellPriceText(item.price)||'—')}</div>
    <div class="meta-item meta-wide"><span class="meta-label">装備/使用データ</span><div class="inventory-note">${esc([equipMeta,spellSlotMeta].filter(Boolean).join('\n'))}</div></div>
    ${savedUpgradeMeta?`<div class="meta-item meta-wide"><span class="meta-label">保存済み強化内容</span><div class="inventory-note">${esc(savedUpgradeMeta)}</div></div>`:''}
    ${materialUpgradeMeta?`<div class="meta-item meta-wide"><span class="meta-label">装備強化素材</span><div class="inventory-note">${esc(materialUpgradeMeta)}</div></div>`:''}
    ${itemUseMeta?`<div class="meta-item meta-wide"><span class="meta-label">使用データ</span><div class="inventory-note">${esc(itemUseMeta)}</div></div>`:''}
    ${spellMeta?`<div class="meta-item meta-wide"><span class="meta-label">術式データ</span><div class="inventory-note">${esc(spellMeta)}</div></div>`:''}
    ${recipeMeta?`<div class="meta-item meta-wide"><span class="meta-label">レシピ</span><div class="inventory-note">${esc(recipeMeta)}</div></div>`:''}
    ${description?`<div class="meta-item meta-wide"><span class="meta-label">説明</span><div class="inventory-note">${esc(description)}</div></div>`:''}
    ${equipmentEffectSectionsHtml(item)}
  </div>`;
}
function hydrateInventoryCardDetail(card){
  if(!card||card.dataset.inventoryHydrated==='1')return;
  const index=Number(card.dataset.inventoryRow);
  if(!Number.isInteger(index)||index<0||!inventoryItemsState[index])return;
  const detail=card.querySelector('[data-inventory-detail-index]');
  if(!detail)return;
  detail.innerHTML=inventoryWarehouseDetailHtml(inventoryItemsState[index],index);
  card.dataset.inventoryHydrated='1';
}
function hydrateOpenInventoryCards(){
  document.querySelectorAll('#inventoryArea details.inventory-card[open][data-inventory-row]').forEach(hydrateInventoryCardDetail);
}
function refreshInventoryCardAt(index,{appendIfMissing=false}={}){
  if(inventoryDisplayMode!=='warehouse')return false;
  const area=$('inventoryArea');
  if(!area||!inventoryItemsState[index])return false;
  const item=inventoryItemsState[index];
  if(isLearnedSpellInventoryRow(item))return false;
  const selector=`.inventory-card[data-inventory-row="${index}"]`;
  const existing=area.querySelector(selector);
  const html=inventoryWarehouseCardHtml(item,index);
  if(existing){
    existing.insertAdjacentHTML('afterend',html);
    existing.remove();
  }else if(appendIfMissing && index===inventoryItemsState.length-1){
    area.insertAdjacentHTML('beforeend',html);
  }else{
    return false;
  }
  renderInventoryTabs();
  applyInventoryFilters();
  return true;
}
function inventoryLinkedRefreshForItems(...items){
  const slotKinds=new Set();
  let spell=false,bag=false,quiver=false;
  for(const raw of items){
    if(!raw)continue;
    const item=raw;
    const slotKind=slotKindForCsItem(item);
    if(['hand','armor','accessory','carry'].includes(slotKind))slotKinds.add(slotKind);
    if(isSpellInventoryItem(item))spell=true;
    if(isBagInventoryItem(item))bag=true;
    if(isQuiverInventoryItem(item)||isQuiverAmmoInventoryItem(item))quiver=true;
  }
  if(slotKinds.size)refreshEquipmentItemSelects({slotKinds:[...slotKinds]});
  if(spell)refreshSpellSetSelects({activeOnly:true});
  if(bag)renderBagSelect();
  if(quiver)renderQuiverControls();
}
function gmCatalogRows(){
  return gmMasterVirtualRows().slice().sort((a,b)=>String(inventorySmallCategory(a)||'').localeCompare(String(inventorySmallCategory(b)||''),'ja')||String(a.name||'').localeCompare(String(b.name||''),'ja',{numeric:true}));
}
function gmCatalogCategorySets(){
  const small=new Set(), internal=new Map();
  for(const row of gmCatalogRows()){
    const s=inventorySmallCategory(row), c=inventoryInternalCategory(row);
    if(s)small.add(s);
    if(s&&c){if(!internal.has(s))internal.set(s,new Set());internal.get(s).add(c);}
  }
  return {small,internal};
}
function gmCatalogCardHtml(item,index){
  const key=String(inventoryItemKey(item)||item.id||item.masterId||item.publicId||item.name||index);
  const small=inventorySmallCategory(item)||'その他', category=inventoryInternalCategory(item)||'未分類';
  const rank=inventoryRankLabel(item)||'';
  const sell=inventorySellPriceText(item.price);
  const meta=['全アイテム',small,category,rank,sell?`売値 ${sell}`:''].filter(Boolean);
  const search=[item.name,small,category,item.publicId,item.description,item.effect,item.source,item.tags,item.power,item.element].filter(Boolean).join(' ');
  return `<article class="inventory-card inventory-card-static gm-catalog-card" data-inventory-row="catalog-${index}" data-inventory-location="倉庫" data-inventory-item-type="${esc(small)}" data-inventory-category="${esc(category)}" data-inventory-search="${esc(search)}" data-gm-catalog-key="${esc(key)}"><div class="gm-catalog-main"><div class="gm-catalog-name">${esc(item.name||'名称未設定')}</div><div class="gm-catalog-meta">${esc(meta.join(' / '))}</div></div><div class="gm-catalog-actions"><input type="number" min="1" max="9999" value="1" inputmode="numeric" aria-label="${esc(item.name||'アイテム')}の追加数" data-gm-catalog-count="${esc(key)}"><button type="button" class="ghost public-view-allowed" data-gm-catalog-detail="${esc(key)}">詳細</button><button type="button" data-gm-catalog-add="${esc(key)}">倉庫へ追加</button></div></article>`;
}
function renderGmCatalog(){
  const area=$('inventoryArea'); if(!area)return;
  const rows=gmCatalogRows();
  area.innerHTML=rows.map(gmCatalogCardHtml).join('');
  if($('inventoryEmptyStatus')){$('inventoryEmptyStatus').textContent='共通DBに表示できるアイテムがありません。';$('inventoryEmptyStatus').style.display=rows.length?'none':'';}
  renderInventoryTabs(); applyInventoryFilters(); setReadOnly(currentMode==='view');
}
function gmCatalogFindByKey(key=''){
  const raw=String(key||'').trim();
  return gmMasterVirtualFind(raw,'')||gmCatalogRows().find(row=>String(inventoryItemKey(row)||row.id||row.masterId||row.publicId||row.name||'').trim()===raw)||null;
}
function addGmCatalogItemToWarehouse(key='',amount=1){
  if(currentMode==='view')return;
  const source=gmCatalogFindByKey(key); if(!source){showToast('追加元のアイテムが見つかりません。','warn');return;}
  const add=clampInt(amount,1,9999);
  const masterId=String(source.masterId||source.id||'').trim(), publicId=String(source.publicId||'').trim().toUpperCase(), name=String(source.name||'').trim();
  let index=(inventoryItemsState||[]).findIndex(raw=>{const row=normalizeInventoryItem(raw||{});return !isAntiqueIndividualItem(row)&&((masterId&&String(row.masterId||'').trim()===masterId)||(publicId&&String(row.publicId||'').trim().toUpperCase()===publicId)||(!masterId&&!publicId&&name&&String(row.name||'').trim()===name));});
  if(index>=0){inventoryItemsState[index]=mergePublicIdInventoryItem(inventoryItemsState[index],source,add);}else{
    const localId='inv_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
    const preset={...source}; delete preset.__gmCatalog;
    inventoryItemsState.push(normalizeInventoryItem({...preset,id:localId,masterId:masterId||String(source.id||'').trim(),count:add,location:'倉庫'}));
    index=inventoryItemsState.length-1;
  }
  invalidateInventoryDerivedCache();
  inventoryLinkedRefreshForItems(inventoryItemsState[index]); updateSummary();
  if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('inventory');
  showToast(`${name||'アイテム'}を倉庫へ${add}個追加しました。`,'ok');
}
function renderInventory({refreshLinked=true}={}) {
  const area=$('inventoryArea');
  if(!area)return;
  inventoryUiDirty=false;
  rememberInventoryCardOpenStates();
  // 状態の正規化はrevisionごとに一度だけ。以後は派生キャッシュを再利用する。
  const cache=inventoryDerived();
  learnedRecipesState=normalizeLearnedRecipes(learnedRecipesState);
  updateInventoryModeUi();
  if(inventoryDisplayMode==='catalog'){ renderGmCatalog(); return; }
  if(inventoryDisplayMode==='learned'){
    const rows=learnedContentRows();
    if(learnedContentType==='recipe')area.innerHTML=rows.map(learnedRecipeCardHtml).join('');
    else if(learnedContentType==='skill')area.innerHTML=rows.map(learnedSkillCardHtml).join('');
    else area.innerHTML=rows.map(learnedSpellCardHtml).join('');
    restoreInventoryCardOpenStates();
    setReadOnly(currentMode==='view');
    applyLearnedKnowledgeSearch();
    return;
  }
  if($('inventoryEmptyStatus'))$('inventoryEmptyStatus').textContent='まだ所持品が登録されていません。';
  // 詳細はモーダルで開くため、倉庫カード本体は常時コンパクト表示する。
  area.innerHTML=cache.rows.map(inventoryWarehouseCardHtml).join('');
  if($('inventoryEmptyStatus'))$('inventoryEmptyStatus').style.display=cache.warehouseCount?'none':'';
  restoreInventoryCardOpenStates();
  hydrateOpenInventoryCards();
  setReadOnly(currentMode==='view');
  renderInventoryTabs();
  applyInventoryFilters();
  if(refreshLinked){
    refreshEquipmentItemSelects();
    refreshSpellSetSelects({activeOnly:true});
    renderBagSelect();
  }
}

function fillInventoryDialogOptions(item) {
  if ($('inventoryFormKind')) $('inventoryFormKind').innerHTML = inventoryOptions(item.kind, INVENTORY_KIND_OPTIONS);
  if ($('inventoryFormCategory')) $('inventoryFormCategory').value = item.category || '';
  refreshInventoryFormContextOptions();
  if ($('inventoryFormEquipSlot')) {
    const select=$('inventoryFormEquipSlot');
    const saved=String(item.equipSlot||'').trim();
    if(saved&&Array.from(select.options).some(o=>o.value===saved))select.value=saved;
  }
}
function updateInventoryFormVisibility() {
  const kind = $('inventoryFormKind')?.value || 'アイテム';
  const token = INVENTORY_KIND_TOKEN[kind] || 'item';
  for (const el of document.querySelectorAll('[data-inventory-kind-field]')) {
    const show = String(el.dataset.inventoryKindField || '').split(/\s+/).includes(token);
    el.style.display = show ? '' : 'none';
  }
  const countInput=$('inventoryFormCount');
  if(countInput){
    const editing=Number($('inventoryEditIndex')?.value??-1)>=0;
    const individual=inventoryKindUsesIndividualRecord(kind);
    countInput.min=individual?'1':'0';
    countInput.max=individual?(editing?'1':'9999'):'9999';
    countInput.disabled=individual&&editing;
    if(individual&&editing)countInput.value='1';
    countInput.title=individual?(editing?'装備個体は1レコード1個で管理します。':'入力した個数ぶん、別々の装備個体として追加します。'):'';
  }
  refreshInventoryFormContextOptions();
}
function openInventoryDialog(index=-1) {
  if (currentMode === 'view') return;
  const existing = index >= 0 ? inventoryItemsState[index] : null;
  const item = normalizeInventoryItem(existing || emptyInventoryItem());
  if ($('inventoryEditIndex')) $('inventoryEditIndex').value = String(index);
  if ($('inventoryDialogTitle')) $('inventoryDialogTitle').textContent = index>=0?'倉庫アイテムを編集':'倉庫アイテムを追加';
  fillInventoryDialogOptions(item);
  if ($('inventoryFormName')) $('inventoryFormName').value = item.name || '';
  if ($('inventoryFormCount')) $('inventoryFormCount').value = item.count ?? 1;
  if ($('inventoryFormCapacity')) $('inventoryFormCapacity').value = item.capacity || 8;
  if ($('inventoryFormQuiverCapacity')) $('inventoryFormQuiverCapacity').value = Math.max(2, Number(item.quiverCapacity)||2);
  if ($('inventoryFormAmmoKind')) $('inventoryFormAmmoKind').value = item.ammoKind || '';
  if ($('inventoryFormCompatibleWeaponTypes')) $('inventoryFormCompatibleWeaponTypes').value = item.compatibleWeaponTypes || '';
  if ($('inventoryFormRank')) $('inventoryFormRank').value = item.rank || '';
  if ($('inventoryFormPrice')) $('inventoryFormPrice').value = item.price || '';
  if ($('inventoryFormCategory')) $('inventoryFormCategory').value = item.category || '';
  if ($('inventoryFormEquipSlot')) $('inventoryFormEquipSlot').value = item.equipSlot || '';
  if ($('inventoryFormSkill')) $('inventoryFormSkill').value = item.kind === '武器' ? canonicalWeaponUsageSkill(item) : (item.skill || '');
  if ($('inventoryFormPower')) $('inventoryFormPower').value = item.power || '';
  if ($('inventoryFormOffhand')) $('inventoryFormOffhand').value = item.offhand || '';
  if ($('inventoryFormReloadTurns')) $('inventoryFormReloadTurns').value = item.reloadTurns || '';
  if ($('inventoryFormModifiers')) $('inventoryFormModifiers').value = item.modifiers || '';
  renderModifierReadOnly('inventoryFormModifierRows', item.modifiers || '');
  if ($('inventoryFormUpgradeLimit')) { $('inventoryFormUpgradeLimit').value = item.upgradeLimit || ''; $('inventoryFormUpgradeLimit').disabled=isAntiqueIndividualItem(item); }
  if ($('inventoryFormSpellSlots')) $('inventoryFormSpellSlots').value = item.spellSlots || '';
  if ($('inventoryFormTarget')) $('inventoryFormTarget').value = item.target || '';
  if ($('inventoryFormCheckType')) $('inventoryFormCheckType').value = item.checkType || '';
  if ($('inventoryFormElement')) $('inventoryFormElement').value = item.element || '';
  if ($('inventoryFormEnchantTarget')) $('inventoryFormEnchantTarget').value = item.enchantTarget || '';
  if ($('inventoryFormEnchantEffectType')) $('inventoryFormEnchantEffectType').value = item.enchantEffectType || '';
  if ($('inventoryFormEnchantValue')) $('inventoryFormEnchantValue').value = item.enchantValue || '';
  if ($('inventoryFormEnchantDuration')) $('inventoryFormEnchantDuration').value = item.enchantDuration || '';
  if ($('inventoryFormEnchantRounds')) $('inventoryFormEnchantRounds').value = item.enchantRounds || '';
  if ($('inventoryFormEnchantStackRule')) $('inventoryFormEnchantStackRule').value = item.enchantStackRule || '同じ装備は1つ・新しい効果で上書き';
  if ($('inventoryFormCost')) $('inventoryFormCost').value = item.cost || '';
  if ($('inventoryFormDescription')) $('inventoryFormDescription').value = item.description || '';
  if ($('inventoryFormEffect')) $('inventoryFormEffect').value = item.effect || '';
  if ($('inventoryFormRecipeResult')) $('inventoryFormRecipeResult').value = item.recipeResult || '';
  if ($('inventoryFormMaterials')) $('inventoryFormMaterials').value = item.materials || '';
  updateInventoryFormVisibility();
  if ($('inventoryDialogStatus')) { $('inventoryDialogStatus').className = 'status-box'; $('inventoryDialogStatus').textContent = isAntiqueIndividualItem(item)?'骨董個体の基礎性能・強化枠・固定強化内容は抽選結果から変更できません。':'必要項目を入力してください。'; }
  $('inventoryDialog')?.showModal();
}
function collectInventoryDialogItem() {
  const countValue = $('inventoryFormCount')?.value;
  const categoryValue = $('inventoryFormCategory')?.value || '';
  const cls = inventoryManualClassification($('inventoryFormKind')?.value || defaultInventoryKind(), categoryValue);
  const kind = cls.kind;
  const manualEquipment = ['武器','防具','装飾品'].includes(kind);
  const manualAmmo = kind === 'アイテム' && (/矢弾|矢$|ボルト|大型ボルト/.test(String(categoryValue||'').trim()));
  return normalizeInventoryItem({
    id: '',
    name: $('inventoryFormName')?.value || '',
    kind: cls.kind,
    itemType: cls.itemType,
    itemCategory: cls.itemCategory,
    materialType: cls.materialType,
    materialCategory: cls.materialCategory,
    category: categoryValue,
    count: countValue === '' || countValue == null ? 1 : countValue,
    capacity: $('inventoryFormCapacity')?.value || '',
    bagCapacity: $('inventoryFormCapacity')?.value || '',
    quiverCapacity: $('inventoryFormQuiverCapacity')?.value || '',
    ammoKind: manualAmmo ? ($('inventoryFormAmmoKind')?.value || '') : '',
    compatibleWeaponTypes: manualAmmo ? ($('inventoryFormCompatibleWeaponTypes')?.value || '') : '',
    location: '倉庫',
    rank: $('inventoryFormRank')?.value || '',
    price: $('inventoryFormPrice')?.value || '',
    equipSlot: manualEquipment ? ($('inventoryFormEquipSlot')?.value || '') : '',
    skill: kind === '武器' ? canonicalWeaponUsageSkill({ itemCategory:$('inventoryFormCategory')?.value || '', category:$('inventoryFormCategory')?.value || '' }) : '',
    power: $('inventoryFormPower')?.value || '',
    offhand: $('inventoryFormOffhand')?.value || '',
    reloadTurns: $('inventoryFormReloadTurns')?.value || '',
    modifiers: $('inventoryFormModifiers')?.value || '',
    upgradeLimit: inventoryKindSupportsUpgradeLimit(kind) ? ($('inventoryFormUpgradeLimit')?.value || '') : '',
    spellSlots: $('inventoryFormSpellSlots')?.value || '',
    target: $('inventoryFormTarget')?.value || '',
    checkType: kind === '武器' ? '' : ($('inventoryFormCheckType')?.value || ''),
    element: $('inventoryFormElement')?.value || '',
    enchantTarget: $('inventoryFormEnchantTarget')?.value || '',
    enchantEffectType: $('inventoryFormEnchantEffectType')?.value || '',
    enchantValue: $('inventoryFormEnchantValue')?.value || '',
    enchantDuration: $('inventoryFormEnchantDuration')?.value || '',
    enchantRounds: $('inventoryFormEnchantRounds')?.value || '',
    enchantStackRule: $('inventoryFormEnchantStackRule')?.value || '',
    cost: $('inventoryFormCost')?.value || '',
    description: $('inventoryFormDescription')?.value || '',
    effect: $('inventoryFormEffect')?.value || '',
    recipeResult: $('inventoryFormRecipeResult')?.value || '',
    materials: $('inventoryFormMaterials')?.value || '',
    note: ''
  });
}
function saveInventoryDialog() {
  const index = Number($('inventoryEditIndex')?.value ?? -1);
  const requestedCount=clampInt($('inventoryFormCount')?.value||1,1,9999);
  const item = collectInventoryDialogItem();
  if (!item.name && !item.category && !item.description && !item.effect) {
    if ($('inventoryDialogStatus')) { $('inventoryDialogStatus').className = 'status-box error'; $('inventoryDialogStatus').textContent = '名称・カテゴリ・説明・効果のいずれかを入力してください。'; }
    return;
  }
  let targetIndex=index;
  let previous=null;
  if (index >= 0 && inventoryItemsState[index]) {
    previous = inventoryItemsState[index];
    const oldItem = inventoryItemsState[index];
    item.id = oldItem.id || item.id || newInventoryInstanceId();
    item.publicId = oldItem.publicId || item.publicId || '';
    item.masterId = oldItem.masterId || item.masterId || '';
    item.masterSheet = oldItem.masterSheet || item.masterSheet || '';
    item.masterSync = oldItem.masterSync || item.masterSync || '';
    item.source = oldItem.source || item.source || '';
    item.buyPrice = oldItem.buyPrice || item.buyPrice || '';
    item.tags = oldItem.tags || item.tags || '';
    item.modifiers = oldItem.modifiers || '';
    if(isAntiqueIndividualItem(oldItem)){item.power=oldItem.power||'';item.element=oldItem.element||'';item.upgradeLimit=oldItem.upgradeLimit||'';item.modifiers=oldItem.modifiers||'';}
    item.upgradeEntries = oldItem.upgradeEntries || [];
    item.upgradeLines = oldItem.upgradeLines || serializeUpgradeEntries(oldItem.upgradeEntries || []);
    item.count=inventoryKindUsesIndividualRecord(item.kind)?1:item.count;
    inventoryItemsState[index] = normalizeInventoryItem(item);
  } else if(inventoryKindUsesIndividualRecord(item.kind)) {
    // 新規の武器・防具は入力個数ぶん、独立した強化データを持つ個体として追加する。
    const copies=Math.max(1,requestedCount);
    for(let i=0;i<copies;i++){
      inventoryItemsState.push(normalizeInventoryItem({...item,id:newInventoryInstanceId(),count:1}));
    }
    targetIndex=inventoryItemsState.length-1;
  } else {
    item.id = item.id || newInventoryInstanceId();
    inventoryItemsState.push(normalizeInventoryItem(item));
    targetIndex=inventoryItemsState.length-1;
  }
  invalidateInventoryDerivedCache();
  const updated=inventoryItemsState[targetIndex];
  renderInventory({refreshLinked:false});
  inventoryLinkedRefreshForItems(previous,updated);
  updateSummary();
  $('inventoryDialog')?.close();
}
function addInventoryItem(item=null) {
  if (item) {
    const rawCount=clampInt(item.count??item.quantity??1,0,9999);
    const probe=normalizeInventoryItem({...item,count:1});
    const rows=inventoryKindUsesIndividualRecord(probe.kind)
      ? expandIndividualEquipmentInventoryRows([{...item,count:rawCount}])
      : [normalizeInventoryItem(item)];
    inventoryItemsState.push(...rows);
    invalidateInventoryDerivedCache();
    renderInventory({refreshLinked:false});
    rows.forEach(row=>inventoryLinkedRefreshForItems(row));
    updateSummary();
    return rows.length===1?rows[0]:rows;
  }
  openInventoryDialog(-1);
}

function hasMasterToken(row, token) {
  const hay = [row && row.tags, row && row.usageTags, row && row.notes, row && row.effect].map(v => String(v || '')).join(',');
  return hay.split(/[、,，\s]+/).map(v => v.trim()).includes(token);
}
const INITIAL_MASTER_TOKEN = '初期倉庫';
const LEGACY_INITIAL_MASTER_TOKEN = '初期' + '所持品';
function hasInitialMasterToken(row) { return hasMasterToken(row, INITIAL_MASTER_TOKEN) || hasMasterToken(row, LEGACY_INITIAL_MASTER_TOKEN); }
function isInitialMasterSync(value) { const v = String(value || '').trim(); return v === INITIAL_MASTER_TOKEN || v === LEGACY_INITIAL_MASTER_TOKEN; }
function formatMpCost(value) {
  const s = String(value ?? '').trim();
  if (!s) return '';
  if (/^MP\s*/i.test(s)) return s.replace(/^MP\s*/i, 'MP');
  return 'MP' + s;
}
function dbItemTypeToInventoryKind(row) {
  const type = String(row && (row.itemType || row.dataKind) || '').trim();
  const cat = String(row && row.itemCategory || '').trim();
  if (type === 'バッグ' || cat === 'バッグ' || isBagLikeFields({ ...row, category:cat, kind:type })) return 'バッグ';
  if (['魔導書','祈祷書'].includes(cat)) return '武器';
  if (type === '術式装備') return cat === 'スクロール' ? 'スクロール' : '武器';
  if (type === '武器') return '武器';
  if (type === '防具' || type === '盾') return '防具';
  if (type === '装飾品') return '装飾品';
  if (type === '素材') return '素材';
  return 'アイテム';
}
const INITIAL_FULL_STACK_ITEM_IDS = new Set(['ammo_arrow_normal', 'ammo_bolt_normal']);
function initialInventoryCountForMasterRow(row={}) {
  const id = String(row.id || '').trim();
  if (!hasInitialMasterToken(row) || !INITIAL_FULL_STACK_ITEM_IDS.has(id)) return 1;
  return Math.max(1, Math.floor(Number(row.maxStack) || 1));
}
function dbItemToInventoryItem(row) {
  const kind = dbItemTypeToInventoryKind(row);
  const mappedCategory = row.itemCategory || row.materialCategory || row.itemType || '';
  return normalizeInventoryItem({
    id: row.id || row.name,
    publicId: row.publicId || '',
    masterId: row.id || row.name || '',
    masterSheet: 'items',
    masterSync: hasInitialMasterToken(row) ? INITIAL_MASTER_TOKEN : '',
    name: row.name || '',
    kind,
    itemType: row.itemType || '',
    itemCategory: row.itemCategory || '',
    materialType: row.materialType || '',
    materialCategory: row.materialCategory || '',
    category: mappedCategory,
    count: initialInventoryCountForMasterRow(row),
    capacity: isBagLikeFields(row) ? parseBagCapacity(row.bagCapacity || row.capacity || row.effect || row.description || '') : 0,
    bagCapacity: row.bagCapacity || '',
    quiverCapacity: row.quiverCapacity || '',
    ammoKind: row.ammoKind || '',
    compatibleWeaponTypes: row.compatibleWeaponTypes || '',
    rank: row.rank || '',
    buyPrice: row.buyPrice || '',
    price: row.sellPrice || '',
    equipSlot: row.equipSlot || '',
    skill: row.skill || '',
    power: row.power || '',
    offhand: row.offhandBonus || '',
    upgradeLimit: row.upgradeLimit || '',
    upgradeMaterialMinRank: row.upgradeMaterialMinRank || row.rank || '',
    equipmentUpgradeEffect: row.equipmentUpgradeEffect || '',
    equipmentUpgradeSlotCost: row.equipmentUpgradeSlotCost || '',
    equipmentUpgradeDetail: row.equipmentUpgradeDetail || '',
    equipmentUpgradeTarget: row.equipmentUpgradeTarget || '',
    spellSlots: ['武器', '防具', '装飾品'].includes(kind) ? (row.spellSlots || '') : (row.maxStack || row.spellSlots || ''),
    target: row.target || '',
    element: row.element || row.attribute || row.attributeType || row.elementName || row['属性'] || row['属性種別'] || row['攻撃属性'] || row['ダメージ属性'] || '',
    enchantTarget: row.enchantTarget || '',
    enchantEffectType: row.enchantEffectType || '',
    enchantValue: row.enchantValue || '',
    enchantDuration: row.enchantDuration || '',
    enchantRounds: row.enchantRounds || '',
    enchantStackRule: row.enchantStackRule || '',
    cost: formatMpCost(row.mpCost || row.cost || ''),
    checkType: row.checkType || '',
    role: row.role || '',
    source: row.source || '',
    tags: row.tags || row.usageTags || '',
    setItem: row.setItem || '',
    description: mergeTextUnique(row.description, row['fla' + 'vor' + 'Text']),
    effect: String(row.effect || '').trim(),
    modifiers: migratedModifierTextForItem(row),
    note: row.notes || ''
  });
}
function dbAntiqueInstanceToInventoryItem(row={}) {
  let upgrades=[];
  try{const parsed=JSON.parse(String(row.upgradeEntries||'[]'));if(Array.isArray(parsed))upgrades=parsed;}catch(_){upgrades=[];}
  return normalizeInventoryItem({
    id:row.id||row.publicId||row.name,publicId:row.publicId||'',masterId:row.id||'',masterSheet:'antique_instances',masterSync:'',
    name:row.name||'',kind:dbItemTypeToInventoryKind(row),itemType:row.itemType||'',itemCategory:row.itemCategory||'',
    category:row.itemCategory||row.itemType||'',count:1,rank:row.rank||'',equipSlot:row.equipSlot||'',skill:row.skill||'',
    power:row.power||'',offhand:row.offhandBonus||'',element:row.element||'',modifiers:row.modifiers||'',upgradeLimit:row.upgradeLimit||'',
    upgradeMaterialMinRank:row.upgradeMaterialMinRank||row.rank||'',upgradeEntries:upgrades,upgradeLines:'',
    description:row.description||'',effect:row.effect||'',source:row.source||'骨董屋（骨董装備ガチャ）',
    tags:mergeTextUnique(row.tags||'','骨董屋,骨董装備,骨董個体,骨董強化固定')
  });
}

function dbSpellToInventoryItem(row) {
  return normalizeInventoryItem({
    id: row.id || row.name,
    publicId: row.publicId || '',
    masterId: row.id || row.name || '',
    masterSheet: 'spells',
    masterSync: hasInitialMasterToken(row) ? INITIAL_MASTER_TOKEN : '',
    name: row.name || '',
    kind: '術式',
    category: row.type || '',
    count: 1,
    capacity: isBagLikeFields(row) ? parseBagCapacity(row.bagCapacity || row.capacity || row.effect || row.description || '') : 0,
    rank: row.rank || '',
    price: row.scrollPrice || '',
    target: row.target || '',
    cost: formatMpCost(row.mpCost || row.cost || ''),
    element: row.element || row.attribute || row.attributeType || row.elementName || row['属性'] || row['属性種別'] || row['攻撃属性'] || row['ダメージ属性'] || '',
    power: row.power || row.damage || row.damageValue || '',
    checkType: row.checkType || '',
    role: row.role || '',
    source: row.source || '',
    tags: row.tags || row.usageTags || '',
    setItem: row.setItem || '',
    description: mergeTextUnique(row.description, row['fla' + 'vor' + 'Text']),
    effect: String(row.effect || '').trim(),
    note: row.notes || ''
  });
}
function dbRecipeToInventoryItem(row) {
  const resultName=String(row.resultItem||row.name||'').trim();
  const displayName=String(row.name||'').includes('レシピ') ? row.name : `${resultName||row.name||'名称未設定'}のレシピ`;
  return normalizeInventoryItem({
    id: row.id || row.name,
    publicId: row.publicId || '',
    masterId: row.id || row.name || '',
    masterSheet: 'recipes',
    masterSync: '',
    name: displayName,
    kind: 'レシピ',
    category: row.craftType || row.category || 'レシピ',
    count: 1,
    rank: row.rank || '',
    buyPrice: row.recipePrice || '',
    price: row.recipeSellPrice || '',
    source: row.recipeSource || row.unlockFacility || '',
    tags: row.tags || '',
    description: row.description || '',
    effect: [row.effect, characterCraftingSelfText(row), `施設依頼：レシピ不要${row.price ? ' / '+row.price+'G' : ''}`].filter(Boolean).join('\n'),
    recipeResult: [resultName, row.resultCount ? `×${row.resultCount}` : ''].filter(Boolean).join(' '),
    materials: row.requiredMaterials || '',
    note: row.notes || ''
  });
}
const GITHUB_COMMON_DB_BASE =
  new URL('../../../data/public/',window.location.href).toString();
let githubCharacterSheetMasterPromise = null;
function characterGithubBaseCandidates(){
  // キャラシ側の複製data/publicは参照しない。Appの共通GitHub DBを唯一の正本にする。
  return [GITHUB_COMMON_DB_BASE];
}
function characterManifestMasterInfo(manifest={}){
  const preferred=manifest&&manifest.files&&(manifest.files.character||manifest.files.master);
  const nestedObject=preferred&&typeof preferred==='object'?preferred:{};
  return{
    file:String(nestedObject.file||nestedObject.path||(typeof preferred==='string'?preferred:'')||manifest.master||'').trim(),
    sha256:String(nestedObject.sha256||manifest.sha256||'').trim()
  };
}
let lastCharacterSheetMasterResult = null;

function setCharacterSheetMasterSourceStatus(res=null, options={}) {
  const el = $('masterSourceStatus');
  if (!el) return;
  if (options.loading) {
    el.className = 'status-box master-source-status';
    el.textContent = '固定マスター：GitHub共通DBを確認中です。';
    return;
  }
  if (!res) {
    el.className = 'status-box master-source-status warn';
    el.textContent = '固定マスター：まだ読込結果を確認できていません。';
    return;
  }
  if (res.__source === 'github') {
    const version = res.__version ? ` v${res.__version}` : '';
    el.className = 'status-box master-source-status' + (res.__versionWarning ? ' warn' : ' ok');
    el.textContent = `固定マスター：GitHub共通DB${version}を使用中${res.__versionWarning ? '（更新反映待ち）' : ''}`;
    return;
  }
  el.className = 'status-box master-source-status warn';
  el.textContent =
    '固定マスター：GASフォールバックを使用中' +
    `${res.__githubError ? ' / GitHub取得失敗：' + res.__githubError : ''}`;
}

function githubCommonDbEnabled(row={}) {
  return String(row.enabled ?? 'TRUE').trim().toUpperCase() !== 'FALSE';
}
function githubCommonDbVisibleInCharacterSheet(row={}) {
  const value = String(row.csVisible ?? 'TRUE').trim().toUpperCase();
  return !['FALSE','0','NO','N','非表示'].includes(value);
}
function buildCharacterSheetMasterFromGithub(masterDocument={}, manifest={}) {
  const data = masterDocument && typeof masterDocument === 'object'
    ? (masterDocument.data && typeof masterDocument.data === 'object' ? masterDocument.data : masterDocument)
    : {};
  const equipmentRows = (Array.isArray(data.equipment_categories) ? data.equipment_categories : [])
    .filter(githubCommonDbEnabled)
    .sort((a,b) => Number(a.sortOrder || 9999) - Number(b.sortOrder || 9999));
  const enabledRows = key => (Array.isArray(data[key]) ? data[key] : []).filter(githubCommonDbEnabled);
  const csItems = (Array.isArray(data.items) ? data.items : [])
    .filter(githubCommonDbEnabled)
    .filter(row => githubCommonDbVisibleInCharacterSheet(row) || String(row.publicId || '').trim());

  if (!equipmentRows.length || !csItems.length) {
    throw new Error('GitHub共通DBのキャラシ用マスターが空です。');
  }

  return {
    equipment_categories: equipmentRows,
    item_types: enabledRows('item_types'),
    item_categories: enabledRows('item_categories'),
    material_types: enabledRows('material_types'),
    material_categories: enabledRows('material_categories'),
    material_ranks: enabledRows('material_ranks'),
    equipment_categories_meta: {
      ...buildEquipmentCategoryLocalMeta(equipmentRows),
      source: 'github',
      version: String(manifest.version || masterDocument.version || ''),
      masterFile: characterManifestMasterInfo(manifest).file
    },
    cs_items: csItems,
    recipes: enabledRows('recipes'),
    spells: enabledRows('spells'),
    skills: enabledRows('skills'),
    __source: 'github',
    __version: String(manifest.version || masterDocument.version || ''),
    __masterFile: characterManifestMasterInfo(manifest).file
  };
}
function characterGithubDelay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
// v90.8.457: 共通DB全体(数MB)を毎回JSON.parseし直さないため、キャラシ用に変換済みのマスターをIndexedDBへ保存する。
const CHARACTER_MASTER_CACHE_DB='recraft_alchemia_character_master_cache_v1';
const CHARACTER_MASTER_CACHE_STORE='masters';
// IndexedDBはブラウザ設定や旧タブのversionchange待ちでイベントが返らない場合がある。
// 共通DB読込そのものを止めないため、変換済みキャッシュは短時間で諦めてHTTP取得へ進む。
const CHARACTER_MASTER_CACHE_TIMEOUT_MS=1200;
function characterMasterCacheOpen(timeoutMs=CHARACTER_MASTER_CACHE_TIMEOUT_MS){
  return new Promise(resolve=>{
    if(!('indexedDB' in window)){resolve(null);return;}
    let settled=false,req=null;
    const finish=value=>{if(settled){try{value?.close?.();}catch(_){}return;}settled=true;clearTimeout(timer);resolve(value||null);};
    const timer=setTimeout(()=>finish(null),Math.max(250,Number(timeoutMs)||CHARACTER_MASTER_CACHE_TIMEOUT_MS));
    try{
      req=indexedDB.open(CHARACTER_MASTER_CACHE_DB,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(CHARACTER_MASTER_CACHE_STORE))db.createObjectStore(CHARACTER_MASTER_CACHE_STORE);};
      req.onsuccess=()=>finish(req.result);
      req.onerror=()=>finish(null);
      req.onblocked=()=>finish(null);
    }catch(_){finish(null);}
  });
}
async function characterMasterCacheGet(key=''){
  if(!key)return null;
  let db=null;
  try{
    db=await characterMasterCacheOpen();
    if(!db)return null;
    return await new Promise(resolve=>{
      let settled=false;
      const finish=value=>{if(settled)return;settled=true;clearTimeout(timer);resolve(value||null);};
      const timer=setTimeout(()=>finish(null),CHARACTER_MASTER_CACHE_TIMEOUT_MS);
      try{
        const tx=db.transaction(CHARACTER_MASTER_CACHE_STORE,'readonly');
        const req=tx.objectStore(CHARACTER_MASTER_CACHE_STORE).get(key);
        req.onsuccess=()=>finish(req.result||null);req.onerror=()=>finish(null);
        tx.onabort=()=>finish(null);
      }catch(_){finish(null);}
    });
  }catch(_){return null;}finally{try{db?.close();}catch(_){}}
}
async function characterMasterCachePut(key='',value=null){
  if(!key||!value)return false;
  let db=null;
  try{
    db=await characterMasterCacheOpen();
    if(!db)return false;
    const saved=await new Promise(resolve=>{
      let settled=false;
      const finish=value=>{if(settled)return;settled=true;clearTimeout(timer);resolve(!!value);};
      const timer=setTimeout(()=>finish(false),CHARACTER_MASTER_CACHE_TIMEOUT_MS);
      try{
        const tx=db.transaction(CHARACTER_MASTER_CACHE_STORE,'readwrite');
        const store=tx.objectStore(CHARACTER_MASTER_CACHE_STORE);
        // 常に最新1件だけを残してDB肥大化を防ぐ。
        store.clear();store.put(value,key);
        tx.oncomplete=()=>finish(true);tx.onerror=()=>finish(false);tx.onabort=()=>finish(false);
      }catch(_){finish(false);}
    });
    return saved;
  }catch(_){return false;}finally{try{db?.close();}catch(_){}}
}
function characterMasterCacheKey(manifest={},info={}){
  const version=String(manifest.version||'').trim();
  const fingerprint=String(info.sha256||version||info.file||'').trim();
  return fingerprint?`${String(info.file||'recraft_alchemia_master.json')}::${fingerprint}`:'';
}
async function characterFetchGithubJson(url,{fresh=false,timeoutMs=15000,cacheMode=''}={}) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),Math.max(1000,Number(timeoutMs)||15000));
  const mode=cacheMode||(fresh?'no-cache':'force-cache');
  try{
    const response=await fetch(url,{cache:mode,signal:controller.signal});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }catch(error){
    if(error&&error.name==='AbortError')throw new Error(`GitHub共通DBの取得がタイムアウトしました（${Math.round((Number(timeoutMs)||15000)/1000)}秒）`);
    throw error;
  }finally{clearTimeout(timer);}
}
function characterGithubMasterResult(masterDocument, manifest={}) {
  const manifestVersion = String(manifest.version || '').trim();
  const masterVersion = String(masterDocument && masterDocument.version || '').trim();
  const result = buildCharacterSheetMasterFromGithub(masterDocument, manifest);
  result.__version = masterVersion || manifestVersion;
  const normalizeVersion=value=>String(value||'').trim().replace(/^v/i,'');
  result.__versionWarning = manifestVersion && masterVersion && normalizeVersion(manifestVersion) !== normalizeVersion(masterVersion)
    ? `manifest ${manifestVersion} / master ${masterVersion}` : '';
  return result;
}
async function fetchGithubCharacterSheetMaster({force=false}={}) {
  if (githubCharacterSheetMasterPromise && !force) return githubCharacterSheetMasterPromise;
  const task = (async () => {
    const errors=[];
    let usableMismatch=null;
    for(const base of characterGithubBaseCandidates()){
      let lastError=null;
      for(let attempt=0;attempt<2;attempt++){
        try{
          const manifestUrl=new URL('manifest.json',base);
          const manifest=await characterFetchGithubJson(manifestUrl.toString(),{timeoutMs:6000,cacheMode:'no-cache'});
          const info=characterManifestMasterInfo(manifest);
          if(!info.file||info.file.includes('..')||info.file.includes('\\'))throw new Error('GitHub共通DBのmanifestに有効なmasterファイル名がありません。');
          const cacheKey=characterMasterCacheKey(manifest,info);
          if(!force&&!attempt&&cacheKey){
            const cached=await characterMasterCacheGet(cacheKey);
            if(cached&&typeof cached==='object'){
              cached.__source='github';
              cached.__version=String(cached.__version||manifest.version||'');
              cached.__masterFile=info.file;
              cached.__versionWarning='';
              return cached;
            }
          }
          const masterUrlObject=new URL(info.file,base);
          masterUrlObject.searchParams.set('_ra',info.sha256||String(manifest.version||'master'));
          const masterCacheMode=(force||attempt>0)?'reload':'force-cache';
          const result=characterGithubMasterResult(await characterFetchGithubJson(masterUrlObject.toString(),{timeoutMs:15000,cacheMode:masterCacheMode}),manifest);
          if(!result.__versionWarning){if(cacheKey)characterMasterCachePut(cacheKey,result);return result;}
          usableMismatch=result;
          lastError=new Error(`GitHub共通DBの更新反映待ちです（${result.__versionWarning}）。`);
        }catch(error){lastError=error;}
        if(attempt<1)await characterGithubDelay(300);
      }
      try{
        const directUrl=new URL('recraft_alchemia_character_master.json',base);
        return characterGithubMasterResult(await characterFetchGithubJson(directUrl.toString(),{timeoutMs:12000,cacheMode:'no-cache'}),{files:{character:{file:'recraft_alchemia_character_master.json'}}});
      }catch(characterDirectError){
        try{
          const directUrl=new URL('recraft_alchemia_master.json',base);
          return characterGithubMasterResult(await characterFetchGithubJson(directUrl.toString(),{timeoutMs:15000,cacheMode:'no-cache'}),{master:'recraft_alchemia_master.json'});
        }catch(directError){
          errors.push(`${base}: ${[lastError&&lastError.message,characterDirectError&&characterDirectError.message,directError&&directError.message].filter(Boolean).join(' / ')}`);
        }
      }
    }
    if(usableMismatch)return usableMismatch;
    throw new Error(errors.join(' / ')||'GitHub共通DBを取得できませんでした。');
  })();
  githubCharacterSheetMasterPromise=task;
  try{return await task;}
  catch(error){if(githubCharacterSheetMasterPromise===task)githubCharacterSheetMasterPromise=null;throw error;}
}

async function loadCharacterSheetMasterWithFallback({force=false}={}) {
  setCharacterSheetMasterSourceStatus(null, {loading:true});
  try {
    const result = await fetchGithubCharacterSheetMaster({force});
    lastCharacterSheetMasterResult = result;
    setCharacterSheetMasterSourceStatus(result);
    return result;
  } catch (githubError) {
    console.warn('GitHub共通DBを取得できないためGASへ切り替えます。', githubError);
    const gasResult = await cloudRequest('characterSheetMaster', {});
    const result = {
      ...(gasResult || {}),
      __source: 'gas',
      __version: '',
      __githubError: githubError && githubError.message ? githubError.message : String(githubError)
    };
    lastCharacterSheetMasterResult = result;
    setCharacterSheetMasterSourceStatus(result);
    return result;
  }
}
function characterSheetMasterSourceLabel(res={}) {
  if (res.__source === 'github') {
    return `GitHub共通DB${res.__version ? ' v' + res.__version : ''}`;
  }
  return 'GASフォールバック';
}
function setDbCharacterSheetMaster(res={}, {force=false,refreshUi=true}={}){
  // fetchGithubCharacterSheetMaster は同一オブジェクトをキャッシュする。
  // 登録ID追加のたびに同じ3MBマスターを再適用・倉庫再描画しない。
  if(!force && lastAppliedCharacterSheetMasterRef===res)return false;
  lastAppliedCharacterSheetMasterRef=res;
  DB_INITIAL_ITEM_MASTER = Array.isArray(res.cs_items) ? res.cs_items : [];
  gmMasterVirtualCache={source:null,rows:[],byLookup:new Map(),byName:new Map()};
  rebuildInventoryMasterClassificationIndex();
  DB_INITIAL_SPELL_MASTER = Array.isArray(res.spells) ? res.spells : [];
  DB_RECIPE_MASTER = Array.isArray(res.recipes) ? res.recipes : [];
  DB_SKILL_MASTER = Array.isArray(res.skills) ? res.skills : [];
  // マスター分類が変わるため派生キャッシュだけ無効化。同期処理中はここで倉庫全件を再normalize/再描画しない。
  invalidateInventoryDerivedCache();
  if(!refreshUi)return true;

  try{ if(inventoryItemsState?.length){ markInventoryUiDirty(); if(inventoryTabIsActive())renderInventory({refreshLinked:false}); } }catch(_){ }
  try{
    for(const slot of EQUIPMENT_SLOTS){
      if(slot.kind!=='carry') renderEquipmentUpgradeSlots(slot.key);
    }
  }catch(_){ }
  renderSkillCrystalPanel();
  // 手動再読込など、即時UI更新が必要な経路だけ候補群を更新する。
  try {
    refreshEquipmentItemSelects();
    refreshSpellSetSelects();
    updateSpellSlotHints();
    renderBagSelect();
    renderQuiverControls();
  } catch (_) {}
  return true;
}
async function loadCharacterSheetMasterFromDbForInitial() {
  const res = await loadCharacterSheetMasterWithFallback();
  // 直後のsyncInitialInventoryFromDbが一括同期・必要時だけ描画するため、ここではUIを触らない。
  setDbCharacterSheetMaster(res || {}, {refreshUi:false});
  return res || {};
}
const CHARACTER_MASTER_INITIAL_PRESET_CACHE = new WeakMap();
const CHARACTER_MASTER_PRESET_MAP_CACHE = new WeakMap();
function getInitialPresetsFromMaster(master={}) {
  if(master && typeof master==='object' && CHARACTER_MASTER_INITIAL_PRESET_CACHE.has(master))return CHARACTER_MASTER_INITIAL_PRESET_CACHE.get(master);
  const itemRows = (master.cs_items || []).filter(row => hasInitialMasterToken(row));
  const spellRows = (master.spells || []).filter(row => hasInitialMasterToken(row));
  const presets=itemRows.map(dbItemToInventoryItem).concat(spellRows.map(dbSpellToInventoryItem));
  if(master && typeof master==='object')CHARACTER_MASTER_INITIAL_PRESET_CACHE.set(master,presets);
  return presets;
}

function getInventoryMasterPresetsFromMaster(master={}) {
  const presets = [];
  for (const row of (master.cs_items || [])) presets.push(dbItemToInventoryItem(row));
  for (const row of (master.spells || [])) presets.push(dbSpellToInventoryItem(row));
  for (const row of (master.recipes || [])) presets.push(dbRecipeToInventoryItem(row));
  return presets.filter(item => String(item.masterId || item.id || '').trim() && String(item.masterSheet || '').trim());
}
function masterPresetMapFromMaster(master={}) {
  if(master && typeof master==='object' && CHARACTER_MASTER_PRESET_MAP_CACHE.has(master))return CHARACTER_MASTER_PRESET_MAP_CACHE.get(master);
  const map = new Map();
  for (const preset of getInventoryMasterPresetsFromMaster(master)) {
    map.set(inventoryMasterKey(preset), preset);
  }
  if(master && typeof master==='object')CHARACTER_MASTER_PRESET_MAP_CACHE.set(master,map);
  return map;
}
function inventoryMasterKey(item={}) {
  const mid = String(item.masterId || item.id || '').trim();
  const sheet = String(item.masterSheet || '').trim();
  return (sheet ? sheet + ':' : '') + mid;
}
function sameInitialMasterItem(item={}, preset={}) {
  const normalized = normalizeInventoryItem(item);
  const presetNorm = normalizeInventoryItem(preset);
  const presetId = String(presetNorm.masterId || presetNorm.id || '').trim();
  const itemMasterId = String(normalized.masterId || '').trim();
  if (itemMasterId && presetId && itemMasterId === presetId) return true;
  if (String(normalized.id || '').trim() && presetId && String(normalized.id || '').trim() === presetId) return true;
  return false;
}
function mergeInitialPresetIntoInventoryItem(existing={}, preset={}) {
  const oldItem = normalizeInventoryItem(existing);
  const base = normalizeInventoryItem(preset);
  return normalizeInventoryItem({
    ...oldItem,
    ...base,
    id: oldItem.id || base.id,
    masterId: base.masterId || base.id || oldItem.masterId || '',
    masterSheet: base.masterSheet || oldItem.masterSheet || '',
    masterSync: INITIAL_MASTER_TOKEN,
    count: oldItem.count !== undefined && oldItem.count !== null ? oldItem.count : (base.count || 1),
    upgradeEntries: oldItem.upgradeEntries || [],
    upgradeLines: oldItem.upgradeLines || serializeUpgradeEntries(oldItem.upgradeEntries || []),
    setSpells: oldItem.setSpells || '',
    location: '倉庫',
  });
}

function mergeMasterPresetIntoInventoryItem(existing={}, preset={}) {
  const oldItem = normalizeInventoryItem(existing);
  const base = normalizeInventoryItem(preset);
  const isInitial = isInitialMasterSync(oldItem.masterSync) || isInitialMasterSync(base.masterSync);
  return normalizeInventoryItem({
    ...oldItem,
    ...base,
    id: oldItem.id || base.id,
    masterId: base.masterId || base.id || oldItem.masterId || '',
    masterSheet: base.masterSheet || oldItem.masterSheet || '',
    masterSync: isInitial ? INITIAL_MASTER_TOKEN : (oldItem.masterSync || base.masterSync || ''),
    count: oldItem.count !== undefined && oldItem.count !== null ? oldItem.count : (base.count || 1),
    upgradeEntries: oldItem.upgradeEntries || [],
    upgradeLines: oldItem.upgradeLines || serializeUpgradeEntries(oldItem.upgradeEntries || []),
    setSpells: oldItem.setSpells || '',
    location: '倉庫',
  });
}
function isSameInventoryCore(a={}, b={}) {
  const aa = normalizeInventoryItem(a);
  const bb = normalizeInventoryItem(b);
  const keys = ['publicId','masterId','masterSheet','masterSync','name','kind','itemType','itemCategory','materialType','materialCategory','category','rank','price','equipSlot','skill','power','hit','defense','guard','evade','offhand','upgradeLimit','upgradeMaterialMinRank','equipmentUpgradeEffect','equipmentUpgradeSlotCost','equipmentUpgradeDetail','equipmentUpgradeTarget','spellSlots','setSpells','target','element','cost','description','effect','checkType','role','source','tags','setItem','recipeResult','materials'];
  return keys.every(k => String(aa[k] ?? '') === String(bb[k] ?? '')) && Number(aa.count || 0) === Number(bb.count || 0);
}

const LEGACY_PUBLIC_ID_ALIASES = Object.freeze({
  'RCA-CARA-001':'RCA-KEDC-9UQU',
  'RCA-FLHW-001':'RCA-2K6U-TN73',
  'RCA-FOOD-0FBBB094':'RCA-0FBB-B094',
  'RCA-FOOD-1CD40241':'RCA-1CD4-0241',
  'RCA-FOOD-2A108DF0':'RCA-2A10-8DF0',
  'RCA-FOOD-5B3B3389':'RCA-5B3B-3389',
  'RCA-FOOD-63E63F24':'RCA-63E6-3F24',
  'RCA-FOOD-65BD1F90':'RCA-65BD-1F90',
  'RCA-FOOD-69ECDFC8':'RCA-69EC-DFC8',
  'RCA-FOOD-7894EA4D':'RCA-7894-EA4D',
  'RCA-FOOD-A3310FAD':'RCA-A331-0FAD',
  'RCA-FOOD-AC2DB957':'RCA-AC2D-B957',
  'RCA-FOOD-AC37C227':'RCA-AC37-C227',
  'RCA-FOOD-AE861876':'RCA-AE86-1876',
  'RCA-FOOD-B78AE54A':'RCA-B78A-E54A',
  'RCA-FOOD-C52976FD':'RCA-C529-76FD',
  'RCA-FOOD-CA6AFA19':'RCA-CA6A-FA19',
  'RCA-FOOD-CB760E46':'RCA-CB76-0E46',
  'RCA-FOOD-E5E1FA98':'RCA-E5E1-FA98',
  'RCA-FOOD-E7DCC431':'RCA-E7DC-C431',
  'RCA-FOOD-F0212364':'RCA-F021-2364',
  'RCA-FOOD-FD96B18B':'RCA-FD96-B18B',
  'RCA-GKHO-001':'RCA-5Q8D-S9QU',
  'RCA-LORD-001':'RCA-UHV9-XQEE',
  'RCA-MEAL-10654498':'RCA-1065-4498',
  'RCA-MEAL-2160E8D3':'RCA-2160-E8D3',
  'RCA-MEAL-2B4AEFF1':'RCA-2B4A-EFF1',
  'RCA-MEAL-562CE0EE':'RCA-562C-E0EE',
  'RCA-MEAL-5928B126':'RCA-5928-B126',
  'RCA-MEAL-5B9E886C':'RCA-5B9E-886C',
  'RCA-MEAL-5E727F33':'RCA-5E72-7F33',
  'RCA-MEAL-62669DA9':'RCA-6266-9DA9',
  'RCA-MEAL-68731442':'RCA-6873-1442',
  'RCA-MEAL-6FBBDEDA':'RCA-6FBB-DEDA',
  'RCA-MEAL-6FDAEC49':'RCA-6FDA-EC49',
  'RCA-MEAL-ADEED2BF':'RCA-ADEE-D2BF',
  'RCA-MEAL-B61EB61E':'RCA-B61E-B61E',
  'RCA-MEAL-CD92E5D4':'RCA-CD92-E5D4',
  'RCA-MEAL-D9DE999A':'RCA-D9DE-999A',
  'RCA-MEAL-DE349D79':'RCA-DE34-9D79',
  'RCA-MEAL-F1C7EC6F':'RCA-F1C7-EC6F',
  'RCA-MEAL-FBCC1D6D':'RCA-FBCC-1D6D',
  'RCA-MEAL-FCFB6515':'RCA-FCFB-6515',
  'RCA-MEAL-FE1F7E7A':'RCA-FE1F-7E7A',
  'RCA-MUCU-001':'RCA-YEQU-W88X',
  'RCA-MUDH-001':'RCA-Q73F-Z3F3',
  'RCA-RCP-ACID':'RCA-RCPX-ACID',
  'RCA-RCP-ANTI':'RCA-RCPX-ANTI',
  'RCA-RCP-ARRW':'RCA-RCPX-ARRW',
  'RCA-RCP-BAGS':'RCA-RCPX-BAGS',
  'RCA-RCP-BOLT':'RCA-RCPX-BOLT',
  'RCA-RCP-CBOW':'RCA-RCPX-CBOW',
  'RCA-RCP-DAGG':'RCA-RCPX-DAGG',
  'RCA-RCP-FLAM':'RCA-RCPX-FLAM',
  'RCA-RCP-FLSH':'RCA-RCPX-FLSH',
  'RCA-RCP-FOCI':'RCA-RCPX-FOCI',
  'RCA-RCP-GAUN':'RCA-RCPX-GAUN',
  'RCA-RCP-GHAM':'RCA-RCPX-GHAM',
  'RCA-RCP-GSWD':'RCA-RCPX-GSWD',
  'RCA-RCP-HARD':'RCA-RCPX-HARD',
  'RCA-RCP-HAXE':'RCA-RCPX-HAXE',
  'RCA-RCP-HBLT':'RCA-RCPX-HBLT',
  'RCA-RCP-HCBW':'RCA-RCPX-HCBW',
  'RCA-RCP-HMNP':'RCA-RCPX-HMNP',
  'RCA-RCP-ICEB':'RCA-RCPX-ICEB',
  'RCA-RCP-LSPR':'RCA-RCPX-LSPR',
  'RCA-RCP-MANP':'RCA-RCPX-MANP',
  'RCA-RCP-MBAG':'RCA-RCPX-MBAG',
  'RCA-RCP-MGBK':'RCA-RCPX-MGBK',
  'RCA-RCP-PRBK':'RCA-RCPX-PRBK',
  'RCA-RCP-QHNT':'RCA-RCPX-QHNT',
  'RCA-RCP-QSIM':'RCA-RCPX-QSIM',
  'RCA-RCP-QTRV':'RCA-RCPX-QTRV',
  'RCA-RCP-SBOW':'RCA-RCPX-SBOW',
  'RCA-RCP-SCYT':'RCA-RCPX-SCYT',
  'RCA-RCP-SMOK':'RCA-RCPX-SMOK',
  'RCA-RCP-SSPR':'RCA-RCPX-SSPR',
  'RCA-RCP-STAF':'RCA-RCPX-STAF',
  'RCA-RCP-SWIF':'RCA-RCPX-SWIF',
  'RCA-RCP-SWRD':'RCA-RCPX-SWRD',
  'RCA-RCP-THNB':'RCA-RCPX-THNB',
  'RCA-RCP-WHAM':'RCA-RCPX-WHAM',
  'RCA-RCP-WHIP':'RCA-RCPX-WHIP',
  'RCA-ROOT-001':'RCA-6V5N-TT45',
  'RCA-SPOR-001':'RCA-V9H2-9GQK',
  'RCA-WING-001':'RCA-3YDC-2RAS'
});
function canonicalRegistrationId(value=''){
  const id=String(value||'').trim().toUpperCase();
  return LEGACY_PUBLIC_ID_ALIASES[id] || id;
}

function parsePublicIdPasteEntries(text=''){
  const raw = String(text || '').trim();
  if(!raw) return [];
  const ids = [...raw.matchAll(/RCA-[A-Z0-9]{3,4}-[A-Z0-9]{3,8}/gi)].map(m=>({id:canonicalRegistrationId(m[0]), index:m.index}));
  if(!ids.length) return [];
  return ids.map((entry, i)=>{
    const start = Math.max(0, raw.lastIndexOf('\n\n', entry.index));
    const end = i + 1 < ids.length ? Math.max(entry.index, raw.lastIndexOf('\n\n', ids[i+1].index)) : raw.length;
    const block = raw.slice(start, end).trim();
    let count = 1;
    const countMatch = block.match(/(?:個数|数量|count|x|×)\s*[：:=]?\s*(\d+)/i) || block.match(new RegExp(entry.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\d\\n]*(\\d+)', 'i'));
    if(countMatch){
      const parsedCount = Number(countMatch[1]);
      count = Number.isFinite(parsedCount) ? clampInt(parsedCount, 0, 9999) : 1;
    }
    return { publicId:entry.id, count, raw:block || entry.id };
  });
}
const CHARACTER_MASTER_PUBLIC_ID_INDEX_CACHE = new WeakMap();
function characterMasterPublicIdIndex(master={}){
  if(master && typeof master==='object' && CHARACTER_MASTER_PUBLIC_ID_INDEX_CACHE.has(master))return CHARACTER_MASTER_PUBLIC_ID_INDEX_CACHE.get(master);
  const index=new Map();
  for(const row of (Array.isArray(master.cs_items)?master.cs_items:[])){
    const id=canonicalRegistrationId(row.publicId||'');if(id)index.set(id,{kind:'item',row});
  }
  for(const row of (Array.isArray(master.spells)?master.spells:[])){
    const id=canonicalRegistrationId(row.publicId||'');if(id)index.set(id,{kind:'spell',row});
  }
  for(const row of (Array.isArray(master.recipes)?master.recipes:[])){
    const id=canonicalRegistrationId(row.publicId||'');if(id)index.set(id,{kind:'recipe',row});
  }
  if(master && typeof master==='object')CHARACTER_MASTER_PUBLIC_ID_INDEX_CACHE.set(master,index);
  return index;
}
function findPresetByPublicId(master={}, publicId=''){
  const id=canonicalRegistrationId(publicId);
  if(!id)return null;
  const hit=characterMasterPublicIdIndex(master).get(id);
  if(!hit)return null;
  if(hit.kind==='item')return dbItemToInventoryItem(hit.row);
  if(hit.kind==='spell')return dbSpellToInventoryItem(hit.row);
  return dbRecipeToInventoryItem(hit.row);
}
function mergePublicIdInventoryItem(existing={}, preset={}, addCount=1){
  const oldItem = normalizeInventoryItem(existing);
  const base = normalizeInventoryItem(preset);
  const total = clampInt(Number(oldItem.count || 0) + Number(addCount || 0), 0, 9999);
  return normalizeInventoryItem({
    ...oldItem,
    ...base,
    id: oldItem.id || base.id,
    publicId: base.publicId || oldItem.publicId || '',
    masterId: base.masterId || base.id || oldItem.masterId || '',
    masterSheet: base.masterSheet || oldItem.masterSheet || '',
    count: total,
    upgradeEntries: oldItem.upgradeEntries || [],
    upgradeLines: oldItem.upgradeLines || serializeUpgradeEntries(oldItem.upgradeEntries || []),
    setSpells: oldItem.setSpells || '',
    location: '倉庫'
  });
}
function isAntiqueIndividualItem(item={}){item=item||{};return /(?:^|[,、\s])骨董個体(?:$|[,、\s])/.test(String(item.tags||''))||String(item.source||'').includes('骨董装備ガチャ')||String(item.id||'').startsWith('antq_');}
function antiqueIndividualShortId(item={}){item=item||{};const pid=canonicalRegistrationId(item.publicId||'');if(pid)return pid;const id=String(item.id||'').replace(/^antq_/,'');return id?`#${id.slice(-6).toUpperCase()}`:'';}
function inventoryIndividualShortId(item={}){item=item||{};if(isAntiqueIndividualItem(item)){const pid=canonicalRegistrationId(item.publicId||'');if(pid)return pid;}const id=String(item.id||item.masterId||'').replace(/^antq_/,'');return id?`#${id.slice(-6).toUpperCase()}`:'';}
function sameNameEquipmentCount(item={}){item=item||{};const name=String(item.name||'').trim(),kind=normalizeInventoryKind(item.kind||item.itemType||'');if(!name||!['武器','防具'].includes(kind))return 0;return (inventoryItemsState||[]).filter(raw=>{const row=normalizeInventoryItem(raw||{});return normalizeInventoryKind(row.kind||row.itemType||'')===kind&&String(row.name||'').trim()===name;}).length;}
function antiqueIndividualEnhancementSummary(item={}){item=item||{};const rows=parseUpgradeLines(item.upgradeEntries||item.upgradeLines||'');if(!rows.length)return '強化なし';return rows.map(e=>e.content==='素材固有効果'?(e.specialEffectName||'固有強化'):(e.content||'強化')).join('・');}
function base64UrlToUtf8(value=''){let b64=String(value||'').replace(/-/g,'+').replace(/_/g,'/');while(b64.length%4)b64+='=';const bin=atob(b64),bytes=Uint8Array.from(bin,ch=>ch.charCodeAt(0));return new TextDecoder().decode(bytes);}
function parseAntiqueGearCode(text=''){
  const m=String(text||'').match(/RCA-ANTQ:([A-Za-z0-9_-]+)/);if(!m)return null;
  try{const payload=JSON.parse(base64UrlToUtf8(m[1]));if(payload?.type!=='antiqueGear'||!payload.item)return null;return payload;}catch(_){return null;}
}
function addAntiqueGearCodeToWarehouse(rawText=''){
  const payload=parseAntiqueGearCode(rawText);if(!payload)throw new Error('骨董装備コードを読み取れません。');
  const raw=payload.item||{},localId='antq_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
  const kind=dbItemTypeToInventoryKind(raw),item=normalizeInventoryItem({...raw,id:localId,masterId:'',publicId:'',masterSheet:'',masterSync:'',kind,count:1,location:'倉庫',source:'骨董屋（骨董装備ガチャ）',tags:mergeTextUnique(raw.tags||'','骨董屋,骨董装備,骨董個体')});
  item.id=localId;item.masterId='';item.publicId='';item.masterSheet='';item.masterSync='';item.count=1;inventoryItemsState.push(item);invalidateInventoryDerivedCache();const index=inventoryItemsState.length-1;if(!refreshInventoryCardAt(index,{appendIfMissing:true}))renderInventory({refreshLinked:false});inventoryLinkedRefreshForItems(item);updateSummary();if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('inventory');return item;
}
async function addInventoryByPublicIdPaste(){
  if(currentMode === 'view') return;
  const idInput = $('publicIdInput');
  const countInput = $('publicIdCountInput');
  const status = $('publicIdPasteStatus');
  const rawInput = String(idInput?.value || '').trim();
  if(/RCA-ANTQ:/i.test(rawInput)){try{const item=addAntiqueGearCodeToWarehouse(rawInput);if(status){status.className='status-box ok';status.textContent=`骨董装備を追加しました：${item.name} ${antiqueIndividualShortId(item)}`;}if(idInput)idInput.value='';if(countInput)countInput.value='1';}catch(e){if(status){status.className='status-box error';status.textContent=String(e?.message||e);}}return;}
  const rawId = rawInput.toUpperCase();
  const idMatch = rawId.match(/RCA-[A-Z0-9]{3,4}-[A-Z0-9]{3,8}/i);
  const publicId = canonicalRegistrationId(idMatch ? idMatch[0] : rawId);
  const rawCount = countInput?.value;
  const count = clampInt(rawCount === '' || rawCount == null ? 1 : rawCount, 0, 9999);
  if(!publicId || !/^RCA-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(publicId)){
    if(status){ status.className='status-box warn'; status.textContent='登録IDを RCA-XXXX-XXXX 形式で入力してください。'; }
    return;
  }
  const skill=characterSkillByPublicId(publicId);
  if(skill){
    const state=normalizeSkillGachaState(skillGachaState||{}),copies=Math.max(1,count),rank=Math.max(1,Math.floor(Number(skill.rank)||1));
    let fragmentCount=0;
    if(state.acquiredSkillIds.includes(skill.id))fragmentCount=copies;
    else{state.acquiredSkillIds.push(skill.id);fragmentCount=Math.max(0,copies-1);}
    if(fragmentCount)addSkillDuplicateFragments(state,rank,fragmentCount);
    skillGachaState=state;renderSkillCrystalPanel();updateAll();
    if(status){status.className='status-box ok';status.textContent=fragmentCount?`スキルを追加・変換しました：${skill.name} / 獲得：★${rank}共鳴片×${fragmentCount}`:`スキルを追加しました：${skill.name}`;}
    if(idInput)idInput.value='';if(countInput)countInput.value='1';
    if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('skillGacha');
    return;
  }
  // 既に読み込んだ固定マスターがあればネットワーク処理なしで即検索する。
  let master=lastCharacterSheetMasterResult;
  if(!master){
    try{
      master = await loadCharacterSheetMasterFromDbForInitial();
    }catch(e){
      if(status){ status.className='status-box error'; status.textContent='DB読み込みに失敗しました：' + e.message; }
      return;
    }
  }
  if(lastAppliedCharacterSheetMasterRef!==master || !DB_SKILL_MASTER.length){
    setDbCharacterSheetMaster(master||{}, {refreshUi:false});
  }
  const loadedSkill=characterSkillByPublicId(publicId);
  if(loadedSkill){
    const state=normalizeSkillGachaState(skillGachaState||{}),copies=Math.max(1,count),rank=Math.max(1,Math.floor(Number(loadedSkill.rank)||1));
    let fragmentCount=0;
    if(state.acquiredSkillIds.includes(loadedSkill.id))fragmentCount=copies;
    else{state.acquiredSkillIds.push(loadedSkill.id);fragmentCount=Math.max(0,copies-1);}
    if(fragmentCount)addSkillDuplicateFragments(state,rank,fragmentCount);
    skillGachaState=state;renderSkillCrystalPanel();updateAll();
    if(status){status.className='status-box ok';status.textContent=fragmentCount?`スキルを追加・変換しました：${loadedSkill.name} / 獲得：★${rank}共鳴片×${fragmentCount}`:`スキルを追加しました：${loadedSkill.name}`;}
    if(idInput)idInput.value='';if(countInput)countInput.value='1';
    if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('skillGacha');
    return;
  }
  let preset = findPresetByPublicId(master, publicId);
  if(!preset){
    try{
      const resolved=await cloudRequest('resolveRegistrationId',{publicId});
      if(resolved?.found&&resolved?.kind==='antiqueGear'&&resolved?.row)preset=dbAntiqueInstanceToInventoryItem(resolved.row);
    }catch(e){console.warn('骨董個体登録IDの照会に失敗しました',e);}
  }
  if(!preset){
    if(status){ status.className='status-box warn'; status.textContent='DBに登録IDが見つかりません：' + publicId; }
    return;
  }
  const equipmentInstance=['武器','防具'].includes(normalizeInventoryKind(preset.kind||dbItemTypeToInventoryKind(preset)));
  if(isAntiqueIndividualItem(preset)&&inventoryItemsState.some(x=>String(x.publicId||'').trim().toUpperCase()===publicId)){
    if(status){status.className='status-box warn';status.textContent=`この骨董個体は既に倉庫へ登録されています：${publicId}`;}return;
  }
  let idx=-1,existed=false,previous=null,updated=null;
  if(equipmentInstance){
    const copies=Math.max(1,count);for(let i=0;i<copies;i++){const instanceId=newInventoryInstanceId();inventoryItemsState.push(normalizeInventoryItem({...preset,id:instanceId,count:1,location:'倉庫'}));idx=inventoryItemsState.length-1;}
    invalidateInventoryDerivedCache();updated=inventoryItemsState[idx];renderInventory({refreshLinked:false});inventoryLinkedRefreshForItems(updated);updateSummary();if(status){status.className='status-box ok';status.textContent=`装備を個体として追加しました：${preset.name} x${copies}`;}
  }else{
    const pid = String(preset.publicId || '').trim().toUpperCase();const mid = String(preset.masterId || preset.id || '').trim();idx = pid ? inventoryIndexByLookup(pid,'') : -1;if(idx<0 && mid)idx=inventoryIndexByLookup(mid,'');existed=idx>=0;previous=existed?inventoryItemsState[idx]:null;
    if(existed)inventoryItemsState[idx] = mergePublicIdInventoryItem(inventoryItemsState[idx], preset, count);else{inventoryItemsState.push(normalizeInventoryItem({...preset, count, location:'倉庫'}));idx=inventoryItemsState.length-1;}
    invalidateInventoryDerivedCache();updated=inventoryItemsState[idx];if(!refreshInventoryCardAt(idx,{appendIfMissing:true}))renderInventory({refreshLinked:false});inventoryLinkedRefreshForItems(previous,updated);updateSummary();if(status){status.className='status-box ok';status.textContent = existed ? `加算しました：${preset.name} x${count}` : `追加しました：${preset.name} x${count}`;}
  }
  if(idInput) idInput.value = '';
  if(countInput) countInput.value = '1';
}


// 初期矢弾は倉庫にだけ同期します。所持品枠へは自動配置しません。

async function syncInitialInventoryFromDb(options={}) {
  const silent = !!options.silent;
  if (currentMode === 'view' && options.skipView) return { added:0, updated:0, replaced:0, synced:0, source:'', version:'' };
  let master;
  try {
    master = lastCharacterSheetMasterResult || await loadCharacterSheetMasterFromDbForInitial();
    // lastCharacterSheetMasterResultだけが先にあるケースでも、マスター配列が未適用なら一度だけ適用する。
    if(lastAppliedCharacterSheetMasterRef!==master)setDbCharacterSheetMaster(master||{}, {refreshUi:false});
  } catch (e) {
    if (!silent) showToast('初期倉庫アイテムのDB読み込みに失敗しました：' + e.message, 'error');
    return { added:0, updated:0, replaced:0 };
  }
  const presets = getInitialPresetsFromMaster(master);
  const masterVersion=String(master && master.__version || '').trim();
  if (!presets.length) {
    if (!silent) showToast('DBに初期倉庫タグ付きのアイテム/術式が見つかりません。既存DBの旧タグも読み取り対象です。統合DB管理ツールで必要な表をDB登録してください。', 'warn');
    return {
      added:0, updated:0, replaced:0, synced:0,
      source: master && master.__source ? master.__source : '',
      version: masterVersion
    };
  }

  // v90.8.457: 同じ固定マスターバージョンで再びキャラを開いた場合、
  // 全倉庫×全マスターの再同期を省き、初期配布品の欠落だけO(初期品数)で確認する。
  if(masterVersion && inventoryMasterSyncVersion===masterVersion && !options.force){
    let added=0;
    for(const preset of presets){
      const pid=String(preset.publicId||'').trim().toUpperCase();
      const mid=String(preset.masterId||preset.id||'').trim();
      let idx=pid?inventoryIndexByLookup(pid,''):-1;
      if(idx<0&&mid)idx=inventoryIndexByLookup(mid,'');
      if(idx<0){
        inventoryItemsState.push(normalizeInventoryItem(preset));
        invalidateInventoryDerivedCache();
        added++;
      }
    }
    if(added){
      markInventoryUiDirty();
      if(inventoryTabIsActive())renderInventory();
      updateSummary();
    }
    if(!silent)showToast(added?`初期倉庫アイテム${added}件を補充しました。`:'初期倉庫アイテムは固定マスターと同期済みです。',added?'ok':'warn');
    return {added,updated:0,replaced:0,synced:0,source:master.__source||'',version:masterVersion};
  }

  const masterMap = masterPresetMapFromMaster(master);
  const oldPlaceholderNames = new Set(['短剣','片手剣','片手斧','片手槌','片手槍','杖','弓','クロスボウ','両手剣','大槌','長槍']);
  let rows=inventoryDerived().rows.slice();
  const beforeCleanup = rows.length;
  rows = rows.filter(normalized => {
    const name = String(normalized.name || '').trim();
    const category = String(normalized.category || '').trim();
    const isOldPlaceholder = oldPlaceholderNames.has(name) && (!category || category === name || ['片手武器','射撃武器','両手武器'].includes(category));
    return !isOldPlaceholder;
  });
  const replaced = beforeCleanup - rows.length;
  let added = 0;
  let updated = 0;
  let synced = 0;

  rows = rows.map(normalized => {
    const key = inventoryMasterKey(normalized);
    const masterPreset = key ? masterMap.get(key) : null;
    if (!masterPreset) return normalized;
    const merged = mergeMasterPresetIntoInventoryItem(normalized, masterPreset);
    if (!isSameInventoryCore(normalized, merged)) synced++;
    return merged;
  });

  // 初期品検索用の索引を一度だけ作る。旧実装の findIndex×初期品数 を避ける。
  const initialIndex=new Map();
  const addInitialLookup=(item,index)=>{
    for(const value of [item.masterId,item.id,String(item.publicId||'').trim().toUpperCase()]){
      const key=String(value||'').trim();
      if(key&&!initialIndex.has(key))initialIndex.set(key,index);
    }
  };
  rows.forEach(addInitialLookup);
  for (const preset of presets) {
    const keys=[String(preset.masterId||preset.id||'').trim(),String(preset.id||'').trim(),String(preset.publicId||'').trim().toUpperCase()].filter(Boolean);
    let idx=-1;
    for(const key of keys){if(initialIndex.has(key)){idx=initialIndex.get(key);break;}}
    if (idx >= 0) {
      const merged = mergeInitialPresetIntoInventoryItem(rows[idx], preset);
      if (!isSameInventoryCore(rows[idx], merged)) updated++;
      rows[idx] = merged;
    } else {
      const normalized=normalizeInventoryItem(preset);
      rows.push(normalized);
      idx=rows.length-1;
      addInitialLookup(normalized,idx);
      added++;
    }
  }

  const previousMasterVersion=inventoryMasterSyncVersion;
  inventoryItemsState=rows;
  inventoryMasterSyncVersion=masterVersion||previousMasterVersion;
  invalidateInventoryDerivedCache();
  const visualChanged=added||updated||replaced||synced;
  const versionChanged=!!masterVersion && previousMasterVersion!==masterVersion;
  if (visualChanged) { markInventoryUiDirty(); if(inventoryTabIsActive())renderInventory(); }
  if (visualChanged || versionChanged) updateSummary();

  if (!silent) {
    const parts = [];
    if (replaced) parts.push(`旧初期装備${replaced}件を整理`);
    if (synced) parts.push(`DB由来倉庫アイテム${synced}件を同期`);
    if (added) parts.push(`初期倉庫アイテム${added}件を追加`);
    if (updated) parts.push(`初期倉庫アイテム${updated}件をDB内容に更新`);
    showToast(parts.length ? parts.join('、') + 'しました。' : '初期倉庫アイテムはDB内容と一致しています。', parts.length ? 'ok' : 'warn');
  }
  return {
    added, updated, replaced, synced,
    source: master && master.__source ? master.__source : '',
    version: masterVersion
  };
}
async function addInitialWeaponSet() {
  await syncInitialInventoryFromDb({ silent:false });
}
function scheduleInitialInventorySyncForEditor(mode) {
  if (mode === 'view') return;
  // エディタの初回描画を先に返し、3MB級固定マスターの変換・同期はアイドル時間へ回す。
  const run=async()=>{
    const result = await syncInitialInventoryFromDb({ silent:true });
    if (lastCharacterSheetMasterResult) setCharacterSheetMasterSourceStatus(lastCharacterSheetMasterResult);
    if (result && (result.added || result.updated || result.replaced || result.synced)) {
      const st = $('editorStatus');
      if (st && mode !== 'view') {
        const sourceLabel = result.source === 'github'
          ? `GitHub共通DB${result.version ? ' v' + result.version : ''}`
          : result.source === 'gas'
            ? 'GASフォールバック'
            : '固定マスター';
        st.className = result.source === 'gas' ? 'status-box warn' : 'status-box ok';
        st.textContent =
          `${sourceLabel}から倉庫アイテムを同期しました。` +
          `追加${result.added}件 / 初期更新${result.updated}件 / DB由来更新${result.synced || 0}件。` +
          `初期矢弾は倉庫にのみ同期します。保存すると反映されます。`;
      }
    }
  };
  if(typeof requestIdleCallback==='function')requestIdleCallback(()=>run().catch(console.error),{timeout:700});
  else window.setTimeout(()=>run().catch(console.error),32);
}

function duplicateInventoryItem(index) {
  const src = inventoryItemsState[index];
  if (!src) return;
  inventoryItemsState.splice(index + 1, 0, normalizeInventoryItem({ ...src, id:'inv_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6), name: src.name || '' }));
  invalidateInventoryDerivedCache();
  renderInventory();
  updateSummary();
}
function deleteInventoryItem(index) {
  const deleting = inventoryItemsState[index] ? normalizeInventoryItem(inventoryItemsState[index]) : null;
  const deletingId = deleting ? inventoryItemKey(deleting) : '';
  const usedInCarry = deletingId && Object.values(carryWarehouseAllocationState || {}).some(v => v?.warehouseAllocated && v.warehouseItemId === deletingId);
  const usedInQuiver = deletingId && Object.values(quiverAmmoSlotsState || {}).some(v => {
    const state = normalizeQuiverAmmoSlotState(v);
    return state?.warehouseAllocated && state.itemId === deletingId;
  });
  if (usedInCarry || usedInQuiver) {
    showToast('所持品または矢筒へ移している分を倉庫へ戻してから削除してください。', 'warn');
    return;
  }
  if (deleting && selectedBagId && (inventoryItemKey(deleting) === selectedBagId || String(deleting.id || '').trim() === selectedBagId || String(deleting.masterId || '').trim() === selectedBagId)) selectedBagId = '';
  inventoryItemsState.splice(index, 1);
  invalidateInventoryDerivedCache();
  renderInventory();
  updateSummary();
}
function sortInventoryItems() {
  inventoryItemsState.sort((a,b) => String(a.kind || '').localeCompare(String(b.kind || ''), 'ja') || String(a.name || '').localeCompare(String(b.name || ''), 'ja'));
  invalidateInventoryDerivedCache();
  renderInventory();
  updateSummary();
}

function normalizeCraftLists(raw={}){
  const src=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  const normalizeRef=(entry={})=>({
    recipeId:String(entry.recipeId||entry.id||'').trim(),publicId:String(entry.publicId||'').trim(),resultName:String(entry.resultName||entry.resultItem||entry.name||'').trim(),craftType:String(entry.craftType||'').trim(),resultKind:String(entry.resultKind||entry.itemType||'').trim(),resultCount:Math.max(1,Math.floor(Number(entry.resultCount)||1)),requiredMaterials:String(entry.requiredMaterials||'').trim(),addedAt:String(entry.addedAt||'').trim()
  });
  const goals=[];for(const entry of (Array.isArray(src.goals)?src.goals:[])){const ref=normalizeRef(entry);if(!ref.resultName)continue;ref.targetRuns=Math.max(1,Math.floor(Number(entry.targetRuns||entry.runs)||1));goals.push(ref);}
  const favorites=[];const seen=new Set();for(const entry of (Array.isArray(src.favorites)?src.favorites:[])){const ref=normalizeRef(entry);if(!ref.resultName)continue;const key=craftListEntryKey(ref);if(seen.has(key))continue;seen.add(key);favorites.push(ref);}
  return {goals,favorites};
}
function craftListEntryKey(entry={}){return String(entry.recipeId||entry.publicId||`${entry.craftType||''}::${entry.resultName||''}`).trim();}
let craftListsState=normalizeCraftLists();
let craftListView='goals';
let craftDialogContext=null;
function getCraftListsState(){craftListsState=normalizeCraftLists(craftListsState);return JSON.parse(JSON.stringify(craftListsState));}
function setCraftListsState(raw={}){craftListsState=normalizeCraftLists(raw);renderCraftLists();}
function parseCraftRequiredMaterials(text=''){
  return String(text||'').split(/[,、\n]+/).map(v=>v.trim()).filter(Boolean).map(part=>{const m=part.match(/^(.*?)\s*×\s*(\d+)\s*$/);return m?{name:m[1].trim(),count:Math.max(0,Number(m[2])||0)}:null;}).filter(Boolean);
}
function craftRecipeForEntry(entry={}){
  const recipes=Array.isArray(DB_RECIPE_MASTER)?DB_RECIPE_MASTER:[];
  const rid=String(entry.recipeId||'').trim(),pid=String(entry.publicId||'').trim().toUpperCase(),name=String(entry.resultName||'').trim(),type=String(entry.craftType||'').trim();
  return recipes.find(r=>rid&&String(r.id||'').trim()===rid)||recipes.find(r=>pid&&String(r.publicId||'').trim().toUpperCase()===pid)||recipes.find(r=>String(r.resultItem||r.name||'').trim()===name&&(!type||String(r.craftType||'').trim()===type))||null;
}
function craftResolvedEntry(entry={}){const r=craftRecipeForEntry(entry)||{};return {...entry,recipeId:String(r.id||entry.recipeId||''),publicId:String(r.publicId||entry.publicId||''),resultName:String(r.resultItem||entry.resultName||r.name||''),craftType:String(r.craftType||entry.craftType||''),resultKind:String(r.resultKind||r.itemType||entry.resultKind||''),resultCount:Math.max(1,Math.floor(Number(r.resultCount||entry.resultCount)||1)),requiredMaterials:String(r.requiredMaterials||entry.requiredMaterials||'')};}
function craftInventoryCountByName(name=''){const target=String(name||'').trim();return (inventoryItemsState||[]).reduce((sum,raw)=>sum+(String(raw?.name||'').trim()===target?Math.max(0,Number(raw.count||0)):0),0);}
function craftRequirementState(entry={},runs=1){const ref=craftResolvedEntry(entry),mult=Math.max(1,Math.floor(Number(runs)||1));return parseCraftRequiredMaterials(ref.requiredMaterials).map(row=>{const need=row.count*mult,have=craftInventoryCountByName(row.name);return {...row,need,have,met:have>=need};});}
function craftMaterialRowsHtml(rows=[]){return rows.map(row=>`<div class="craft-material-row ${row.met?'met':'missing'}"><span>${row.met?'✓':'不足'} ${esc(row.name)}</span><span class="craft-material-count">${esc(String(row.have))} / ${esc(String(row.need))}</span></div>`).join('');}
function craftCanMake(entry={},runs=1){const rows=craftRequirementState(entry,runs);return rows.length>0&&rows.every(x=>x.met);}
function craftMaxRuns(entry={},cap=999){const ref=craftResolvedEntry(entry),req=parseCraftRequiredMaterials(ref.requiredMaterials);if(!req.length)return 0;let max=Infinity;for(const row of req)max=Math.min(max,Math.floor(craftInventoryCountByName(row.name)/Math.max(1,row.count)));return Math.max(0,Math.min(Math.floor(Number(cap)||999),Number.isFinite(max)?max:0));}
