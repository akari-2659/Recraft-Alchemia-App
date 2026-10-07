
'use strict';

const APP_NAME = 'recraft_alchemia_v4';
const GAS_URL_KEY = APP_NAME + '.gas.url';
// GitHub Pagesで毎回URLを入力しない運用にする場合は、ここにApps Scriptの /exec URLを入れてください。
const DEFAULT_GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxNQYC7-aBE23cliuD1Zdze18xHh-q45P1qpBgwCCg0dYgxd1b8A-R63eGjzMtgOxMT/exec';
const EQUIPMENT_CATEGORY_CACHE_KEY = APP_NAME + '.equipmentCategories';
const EQUIPMENT_CATEGORY_CACHE_META_KEY = APP_NAME + '.equipmentCategories.meta';
const CS_ITEM_CACHE_KEY = APP_NAME + '.characterSheetItems';
let CS_ITEM_MASTER = [];
let DB_EQUIPMENT_CATEGORY_MASTER = [];
let DB_INITIAL_ITEM_MASTER = [];
let DB_INITIAL_ITEM_MASTER_INDEX = { byId:new Map(), byPublicId:new Map(), byName:new Map() };
let DB_INITIAL_SPELL_MASTER = [];
let DB_RECIPE_MASTER = [];
let DB_SKILL_MASTER = [];
let lastAppliedCharacterSheetMasterRef = null;

/* GM_ALL_ITEM_CATALOG_V1 */
const GM_ALL_ITEM_CATALOG_MODE = true;
let gmMasterVirtualCache = { source:null, rows:[], byLookup:new Map(), byName:new Map() };
function gmMasterVirtualRows(){
  if(!GM_ALL_ITEM_CATALOG_MODE)return [];
  const source=DB_INITIAL_ITEM_MASTER||[];
  if(gmMasterVirtualCache.source===source)return gmMasterVirtualCache.rows;
  const rows=[];const byLookup=new Map(),byName=new Map();const seen=new Set();
  for(const raw of source){
    try{
      if(typeof enabledLike==='function'&&!enabledLike(raw?.enabled))continue;
      if(typeof csItemVisible==='function'&&!csItemVisible(raw||{}))continue;
      const item=dbItemToInventoryItem(raw||{});
      const identity=String(item.masterId||item.id||item.publicId||item.name||'').trim();
      if(!identity||seen.has(identity))continue;seen.add(identity);
      const maxStack=Math.max(1,Number(raw?.maxStack||item?.spellSlots||99)||99);
      const row=normalizeInventoryItem({...item,count:Math.max(9999,maxStack)});
      row.__gmCatalog=true;
      rows.push(row);
      for(const value of [inventoryItemKey(row),row.id,row.masterId,String(row.publicId||'').trim().toUpperCase()]){const key=String(value||'').trim();if(key&&!byLookup.has(key))byLookup.set(key,row);}
      const name=String(row.name||'').trim();if(name&&!byName.has(name))byName.set(name,row);
    }catch(_){ }
  }
  gmMasterVirtualCache={source,rows,byLookup,byName};
  return rows;
}
function gmMasterVirtualFind(itemId='',itemName=''){
  gmMasterVirtualRows();
  const id=String(itemId||'').trim();
  if(id){return gmMasterVirtualCache.byLookup.get(id)||gmMasterVirtualCache.byLookup.get(id.toUpperCase())||null;}
  const name=String(itemName||'').trim();return name?(gmMasterVirtualCache.byName.get(name)||null):null;
}
function gmMasterVirtualHasName(name=''){return !!gmMasterVirtualFind('',name);}

let skillGachaState = null;
let skillWarehouseFilter = { category:'全て', weaponType:'全て', search:'' };


function setReadOnly(readOnly) {
  const ids = ['charName','charGender','charAge','playerKey','newPlayerKey','charMemo','currentHp','currentMp','hpBonus','mpBonus','fatigueLevel','equipmentMemo','bagSelect'];
  for (const id of ids) if ($(id)) $(id).disabled = readOnly;
  for (const stat of STAT_ORDER) if ($('stat_' + stat)) $('stat_' + stat).disabled = readOnly;
  for (const a of ABILITIES) if ($('ability_' + a.key)) $('ability_' + a.key).disabled = readOnly;
  for (const c of SKILL_CATEGORIES) if ($('manualBonus_' + c.key)) $('manualBonus_' + c.key).disabled = readOnly;
  if($('supportEligible'))$('supportEligible').disabled=readOnly;
  for(const el of document.querySelectorAll('[data-support-setting-input],[data-support-skill-mode]'))el.disabled=readOnly;
  for (const key of Object.keys(SKILL_BY_KEY)) {
    if ($('skill_cat_' + key)) $('skill_cat_' + key).disabled = readOnly;
    if ($('skill_free_' + key)) $('skill_free_' + key).disabled = readOnly;
    if ($('skill_other_' + key)) $('skill_other_' + key).disabled = readOnly;
  }
  for (const el of document.querySelectorAll('[data-equipment-input]')) el.disabled = readOnly;
  for (const btn of [$('createHistoryBtn')]) if(btn) btn.disabled=readOnly;
  for (const el of document.querySelectorAll('[data-inventory-input]')) {
    const quiverSlot = el.dataset?.quiverAmmoCount || '';
    const quiverState = quiverSlot ? normalizeQuiverAmmoSlotState(quiverAmmoSlotsState[quiverSlot]) : null;
    el.disabled = readOnly || (!!quiverSlot && !quiverState?.warehouseAllocated);
  }
  for (const btn of document.querySelectorAll('[data-inventory-action]')) btn.disabled = readOnly && btn.dataset.inventoryAction !== 'detail';
  for (const el of document.querySelectorAll('[data-skill-crystal-input]')) el.disabled = readOnly;
  for (const el of document.querySelectorAll('[data-loadout-preset-input],[data-loadout-preset-action]')) el.disabled = readOnly;
  for (const el of document.querySelectorAll('[data-craft-goal-runs],[data-craft-goal-make],[data-craft-goal-reduce],[data-craft-favorite-remove]')) el.disabled = readOnly;
  if ($('sortInventoryItemBtn')) $('sortInventoryItemBtn').disabled = readOnly;
  if ($('addInitialWeaponSetBtn')) $('addInitialWeaponSetBtn').disabled = readOnly;
  const editOnly = ['saveBtn','rollBtn'];
  for (const id of editOnly) if ($(id)) $(id).disabled = readOnly;
  if($('autoSaveToggle')) $('autoSaveToggle').disabled=readOnly;
  for (const btn of document.querySelectorAll('[data-reroll-ability]')) btn.disabled = readOnly;
  updateEquipmentHandLocks(false);
  $('toggleViewEditBtn').style.display = readOnly ? '' : 'none';
}
function setView(name) {
  const target = $(name + 'View');
  if (!target) {
    console.error('画面IDが見つかりません:', name + 'View');
    showToast('画面切替に失敗しました。', 'error');
    return false;
  }
  for (const v of document.querySelectorAll('.view')) {
    const active = v === target;
    v.classList.toggle('active', active);
    // class反映が遅れる/壊れる環境でも確実に切り替えるため、displayも直接同期する。
    v.style.display = active ? 'block' : 'none';
  }
  document.body.classList.toggle('editor-active', name === 'editor');
  return true;
}
function storageLabel() { return 'クラウド保存'; }
function prepareListView() {
  $('listTitle').textContent = 'クラウド保存：作成リスト';
  $('listSub').textContent = 'プレイヤーキーに紐づくキャラクターだけを表示します。';
  if ($('characterList')) $('characterList').innerHTML = '';
  if ($('listStatus')) {
    $('listStatus').className = 'status-box';
    $('listStatus').textContent = 'クラウドの作成リストを読み込み中です。';
  }
  setView('list');
}
async function openList() {
  prepareListView();
  await refreshList();
}
async function startCloudList(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); if (event.stopImmediatePropagation) event.stopImmediatePropagation(); }
  const btn = $('chooseCloudBtn');
  try {
    setGasUrl(gasUrl());
    currentCloudPlayerKey = ($('cloudPlayerKeyInput')?.value || '').trim();
    if (!gasUrl()) { $('homeStatus').className = 'status-box error'; $('homeStatus').textContent = '固定クラウド接続先が未設定です。'; showToast('固定クラウド接続先が未設定です。', 'error'); return false; }
    if (!currentCloudPlayerKey) { $('homeStatus').className = 'status-box error'; $('homeStatus').textContent = '作成リストの表示にはプレイヤーキーが必要です。'; showToast('プレイヤーキーを入力してください。', 'error'); return false; }
    if (btn) btn.disabled = true;
    if ($('homeStatus')) { $('homeStatus').className = 'status-box'; $('homeStatus').textContent = 'クラウドの作成リストへ移動します。'; }
    prepareListView();
    await refreshList();
  } catch (e) {
    prepareListView();
    $('listStatus').className = 'status-box error';
    $('listStatus').textContent = e.message || 'クラウド作成リストへの移行に失敗しました。';
    showToast($('listStatus').textContent, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
  return false;
}
function openEditor(mode, data=null) {
  autoSaveReady=false;
  clearAutoSaveTimer();
  currentMode = mode;
  if(mode==='new'){ cloudCharacterRevision=0; cloudCharacterRowHint=0; cloudCharacterFolderReady=false; characterLastHistoryAt=0; }
  applyData(data || emptyCharacter());
  const publicShareView = mode === 'view' && typeof isPublicViewMode === 'function' && isPublicViewMode();
  const title = mode === 'new' ? '新規作成' : mode === 'view' ? (publicShareView ? '共有キャラクター閲覧' : 'キャラクター閲覧') : 'キャラクター編集';
  $('editorTitle').textContent = title;
  $('editorSub').textContent = `${storageLabel()} / ID: ${currentCharacter.id}`;
  setReadOnly(mode === 'view');
  $('editorStatus').className = 'status-box';
  $('editorStatus').textContent = mode === 'view'
    ? (publicShareView ? '共有用の閲覧ページです。キャラクターシート内容を、倉庫一覧を除いて表示します。' : '閲覧モードです。編集する場合は「編集に切替」を押してください。')
    : (autoSaveEnabled ? '編集中です。変更は自動保存されます。' : '編集中です。自動保存はOFFです。');
  setActionBarCollapsed(false);
  showEditorTab('ability');
  setView('editor');
  setCharacterSheetMasterSourceStatus(lastCharacterSheetMasterResult, {loading:!lastCharacterSheetMasterResult});
  initializeAutoSaveForEditor(mode);
  scheduleInitialInventorySyncForEditor(mode);
}



function setActionBarCollapsed(collapsed=true) {
  const bar = $('editorActionBar');
  const btn = $('actionBarToggleBtn');
  if (!bar) return;
  bar.classList.toggle('collapsed', !!collapsed);
  if (btn) {
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    btn.textContent = collapsed ? '操作を開く' : '操作を閉じる';
  }
}

function bindEvents() {
  try { localStorage.removeItem(APP_NAME + '.master.adminKey'); } catch(e) {}
  try { setGasUrl(gasUrl()); } catch(e) {}
  if ($('loadEquipmentCategoriesBtn')) $('loadEquipmentCategoriesBtn').addEventListener('click', async () => { try { await loadEquipmentCategoriesFromDb({force:true}); } catch (e) { showToast(e.message, 'error'); const st=$('equipmentCategoryStatus'); if(st) st.textContent=e.message; } });
  if($('saveEquipmentPresetBtn'))$('saveEquipmentPresetBtn').addEventListener('click',()=>openLoadoutPresetDialog('create','equipment'));
  if($('saveCarryPresetBtn'))$('saveCarryPresetBtn').addEventListener('click',()=>openLoadoutPresetDialog('create','carry'));
  if($('loadoutPresetDialogPrimaryBtn'))$('loadoutPresetDialogPrimaryBtn').addEventListener('click',handleLoadoutPresetDialogPrimary);
  if($('loadoutPresetDialogCloseBtn'))$('loadoutPresetDialogCloseBtn').addEventListener('click',closeLoadoutPresetDialog);
  if($('loadoutPresetDialog')){
    $('loadoutPresetDialog').addEventListener('click',e=>{if(e.target===$('loadoutPresetDialog'))closeLoadoutPresetDialog();});
    $('loadoutPresetDialog').addEventListener('close',()=>{loadoutPresetDialogContext={mode:'',type:'equipment',id:''};});
  }
  document.addEventListener('click',e=>{const btn=e.target.closest?.('[data-loadout-preset-action]');if(!btn||['save-equipment','save-carry'].includes(btn.dataset.loadoutPresetAction||''))return;const type=btn.dataset.presetType||'',id=btn.dataset.presetId||'',action=btn.dataset.loadoutPresetAction||'';if(['apply','overwrite','delete'].includes(action))openLoadoutPresetDialog(action,type,id);});
  $('chooseCloudBtn').addEventListener('click', startCloudList);
  $('backHomeBtn').addEventListener('click', () => setView('home'));
  $('changeCloudKeyBtn').addEventListener('click', async () => {
    const next = prompt('表示するクラウドキャラクターのプレイヤーキーを入力してください。', currentCloudPlayerKey || '') || '';
    if (!next.trim()) { showToast('プレイヤーキーが未入力です。', 'warn'); return; }
    currentCloudPlayerKey = next.trim();
    if ($('cloudPlayerKeyInput')) $('cloudPlayerKeyInput').value = currentCloudPlayerKey;
    await refreshList();
    showToast('プレイヤーキーを変更しました。', 'ok');
  });
  $('refreshListBtn').addEventListener('click', refreshList);
  $('newCharacterBtn').addEventListener('click', () => openEditor('new', emptyCharacter()));
  $('backListBtn').addEventListener('click', async () => {
    const canLeave=await flushAutoSaveBeforeLeave();
    if(!canLeave)return;
    autoSaveReady=false;
    clearAutoSaveTimer();
    setView('list');
    refreshList();
  });
  $('toggleViewEditBtn').addEventListener('click', () => {
    currentMode='edit';
    setReadOnly(false);
    $('editorTitle').textContent='キャラクター編集';
    $('editorStatus').className='status-box';
    $('editorStatus').textContent=autoSaveEnabled?'編集モードに切り替えました。変更は自動保存されます。':'編集モードに切り替えました。自動保存はOFFです。';
    initializeAutoSaveForEditor('edit');
    showToast('編集モードに切り替えました。','ok');
    scheduleInitialInventorySyncForEditor('edit');
  });
  $('saveBtn').addEventListener('click', onSave);
  if($('autoSaveToggle')) $('autoSaveToggle').addEventListener('change', async e => {
    await setAutoSaveEnabled(!!e.target.checked);
    if($('editorStatus') && currentMode!=='view'){
      $('editorStatus').className='status-box';
      $('editorStatus').textContent=autoSaveEnabled
        ? '編集中です。このキャラクターは自動保存ONです。'
        : '編集中です。このキャラクターは自動保存OFFです。';
    }
  });
  $('rollBtn').addEventListener('click', rollAllConvertedAbilities);
  $('abilityOutput').addEventListener('click', e => { const btn = e.target.closest('[data-reroll-ability]'); if (!btn) return; rerollOneAbility(btn.dataset.rerollAbility); });
  $('outputBtn').addEventListener('click', () => openOutputDialog(collectData(false)));
  $('shareBtn').addEventListener('click', copyShareData);
  $('actionBarToggleBtn').addEventListener('click', () => setActionBarCollapsed(!$('editorActionBar').classList.contains('collapsed')));

  
document.querySelectorAll('[data-craft-list-view]').forEach(btn=>btn.addEventListener('click',()=>{craftListView=btn.dataset.craftListView==='favorites'?'favorites':'goals';renderCraftLists();}));
$('craftListArea')?.addEventListener('click',async e=>{const favOpen=e.target.closest('[data-craft-favorite-open]');if(favOpen){openCraftCreateDialog(Number(favOpen.dataset.craftFavoriteOpen));return;}const favRemove=e.target.closest('[data-craft-favorite-remove]');if(favRemove){const i=Number(favRemove.dataset.craftFavoriteRemove),entry=craftListsState.favorites[i];if(entry&&window.confirm(`「${craftResolvedEntry(entry).resultName}」をお気に入りから削除しますか？`)){craftListsState.favorites.splice(i,1);renderCraftLists();autoSaveDraftSoon('craftLists');}return;}const reduce=e.target.closest('[data-craft-goal-reduce]');if(reduce){const i=Number(reduce.dataset.craftGoalReduce),entry=craftListsState.goals[i];if(!entry)return;const current=Math.max(1,Number(entry.targetRuns)||1),value=window.prompt(`減らす作成回数を入力してください。\n現在の残り：${current}回\n全て削除する場合は ${current} を入力してください。`,'1');if(value===null)return;const n=Math.floor(Number(value)||0);if(n<1||n>current){showToast('1～残り回数の範囲で入力してください。','error');return;}entry.targetRuns=current-n;if(entry.targetRuns<=0)craftListsState.goals.splice(i,1);renderCraftLists();autoSaveDraftSoon('craftLists');return;}const make=e.target.closest('[data-craft-goal-make]');if(make){const i=Number(make.dataset.craftGoalMake),entry=craftListsState.goals[i],input=$('craftListArea')?.querySelector(`[data-craft-goal-runs="${i}"]`),runs=Math.max(1,Math.min(Number(entry?.targetRuns)||1,Math.floor(Number(input?.value)||1)));await craftExecute(entry,runs,{goalIndex:i});return;}});
$('craftCreateRuns')?.addEventListener('input',updateCraftCreateDialog);
$('craftCreateCloseBtn')?.addEventListener('click',()=>{$('craftCreateDialog')?.close();craftDialogContext=null;}); $('craftCreateDialog')?.addEventListener('click',e=>{if(e.target===$('craftCreateDialog')){$('craftCreateDialog').close();craftDialogContext=null;}});
$('craftCreateConfirmBtn')?.addEventListener('click',async()=>{if(!craftDialogContext)return;const entry=craftListsState.favorites[craftDialogContext.index],runs=Math.max(1,Math.floor(Number($('craftCreateRuns')?.value)||1));if(await craftExecute(entry,runs)){$('craftCreateDialog')?.close();craftDialogContext=null;}});

document.querySelectorAll('.editor-tab-btn').forEach(btn => btn.addEventListener('click', () => {
  showEditorTab(btn.dataset.editorTab);
  if(btn.dataset.editorTab==='dataMaintenance'){renderIntegrityCheck();refreshCharacterHistory();}
}));
$('runIntegrityCheckBtn')?.addEventListener('click',renderIntegrityCheck);
$('refreshHistoryBtn')?.addEventListener('click',refreshCharacterHistory);
$('createHistoryBtn')?.addEventListener('click',createCharacterHistoryNow);
$('integrityList')?.addEventListener('click',e=>{const b=e.target.closest('[data-integrity-toggle]');if(!b)return;const d=document.querySelector(`[data-integrity-detail="${b.dataset.integrityToggle}"]`);if(d)d.hidden=!d.hidden;});
$('historyList')?.addEventListener('click',e=>{const countBtn=e.target.closest('[data-history-count-restore]');if(countBtn){restoreCharacterInventoryCounts(countBtn.dataset.historyCountRestore);return;}const b=e.target.closest('[data-history-restore]');if(b)restoreCharacterHistory(b.dataset.historyRestore);});
  document.addEventListener('toggle', e => {
    const d=e.target;
    if(!(d instanceof HTMLDetailsElement)) return;
    if(d.matches('#inventoryArea details.inventory-card[data-inventory-stable-key]')){
      inventoryCardOpenState.set(String(d.dataset.inventoryStableKey||''), !!d.open);
      if(d.open && d.hasAttribute('data-inventory-row')) hydrateInventoryCardDetail(d);
    }
  }, true);

  if ($('skillCrystalStageSelect')) $('skillCrystalStageSelect').addEventListener('change',e=>{
    const state=normalizeSkillGachaState(skillGachaState||{}),oldSlots=state.crystalSlots,nextSlots=crystalSlotNumber(e.target.value,oldSlots);
    if(nextSlots===oldSlots)return;
    const removed=state.equippedSkillIds.slice(nextSlots).filter(Boolean).length;
    state.crystalSlots=nextSlots;
    state.equippedSkillIds=state.equippedSkillIds.slice(0,nextSlots);
    while(state.equippedSkillIds.length<nextSlots)state.equippedSkillIds.push('');
    skillGachaState=normalizeSkillGachaState(state);
    renderSkillCrystalPanel();updateAll();if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('skillGacha');
    if($('editorStatus')){$('editorStatus').className='status-box ok';$('editorStatus').textContent=`スキルクリスタルを${nextSlots}枠へ変更しました。${removed?`外れたスキル${removed}件はスキル倉庫に残っています。`:''}`;}
  });
  if ($('skillCrystalSlots')) $('skillCrystalSlots').addEventListener('change',e=>{const sel=e.target.closest('[data-skill-crystal-slot]');if(!sel)return;const state=normalizeSkillGachaState(skillGachaState||{}),i=Number(sel.dataset.skillCrystalSlot),old=state.equippedSkillIds[i]||'',next=sel.value||'';if(next&&state.equippedSkillIds.some((v,j)=>j!==i&&v===next)){sel.value=old;if($('editorStatus')){$('editorStatus').className='status-box error';$('editorStatus').textContent='同じスキルを複数枠へ装着できません。';}return;}state.equippedSkillIds[i]=next;skillGachaState=state;renderSkillCrystalPanel();updateAll();if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('skillGacha');});

  $('makeTokenOutputBtn').addEventListener('click', () => copyOutput('token'));
  $('makePaletteOutputBtn').addEventListener('click', () => copyOutput('palette'));
  $('closeOutputDialogBtn').addEventListener('click', () => $('outputDialog').close()); if ($('outputDialog')) $('outputDialog').addEventListener('click',e=>{if(e.target===$('outputDialog'))$('outputDialog').close();});
  if ($('addByPublicIdPasteBtn')) $('addByPublicIdPasteBtn').addEventListener('click', addInventoryByPublicIdPaste);
  if ($('publicIdInput')) $('publicIdInput').addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); addInventoryByPublicIdPaste(); } });
  if ($('clearPublicIdPasteBtn')) $('clearPublicIdPasteBtn').addEventListener('click', () => { if($('publicIdInput')) $('publicIdInput').value=''; if($('publicIdCountInput')) $('publicIdCountInput').value='1'; if($('publicIdPasteStatus')) { $('publicIdPasteStatus').className='status-box'; $('publicIdPasteStatus').textContent='登録IDを入力してください。'; } });
  if ($('addInitialWeaponSetBtn')) $('addInitialWeaponSetBtn').addEventListener('click', addInitialWeaponSet);
  if ($('sortInventoryItemBtn')) $('sortInventoryItemBtn').addEventListener('click', sortInventoryItems);
  if ($('inventorySearchInput')) $('inventorySearchInput').addEventListener('input', e => setInventoryFilter('search', e.target.value || ''));
  if ($('inventoryFormKind')) $('inventoryFormKind').addEventListener('change', updateInventoryFormVisibility);
  if ($('inventoryFormCategory')) $('inventoryFormCategory').addEventListener('input', refreshInventoryFormContextOptions);
  if ($('bagSelect')) $('bagSelect').addEventListener('change', e => { selectedBagId = e.target.value || ''; applyBagCapacityToEquipmentSlots(); updateSummary(); });
  if ($('saveInventoryDialogBtn')) $('saveInventoryDialogBtn').addEventListener('click', saveInventoryDialog);
  if ($('cancelInventoryDialogBtn')) $('cancelInventoryDialogBtn').addEventListener('click', () => $('inventoryDialog')?.close()); if ($('inventoryDialog')) $('inventoryDialog').addEventListener('click',e=>{if(e.target===$('inventoryDialog'))$('inventoryDialog').close();});
  if ($('closeItemDetailViewBtn')) $('closeItemDetailViewBtn').addEventListener('click', () => $('itemDetailViewDialog')?.close());
  if ($('itemDetailViewDialog')) $('itemDetailViewDialog').addEventListener('click', e => { if(e.target===$('itemDetailViewDialog')){$('itemDetailViewDialog').close();return;}const learnRecipe=e.target.closest('[data-detail-learn-recipe]');if(learnRecipe){const index=Number(learnRecipe.dataset.detailLearnRecipe);learnRecipeFromInventory(index);inventoryDisplayMode='learned';learnedContentType='recipe';renderInventory({refreshLinked:false});$('itemDetailViewDialog')?.close();return;}const learnScroll=e.target.closest('[data-detail-learn-scroll]');if(learnScroll){learnSpellFromScrollInventory(Number(learnScroll.dataset.detailLearnScroll));return;}const apply=e.target.closest('[data-apply-named-processing]');if(apply){applyNamedProcessingAtIndex(Number(itemDetailViewContext.index),apply.dataset.applyNamedProcessing||'');return;}const clear=e.target.closest('[data-clear-named-processing]');if(clear){clearNamedProcessingAtIndex(Number(itemDetailViewContext.index),clear.dataset.clearNamedProcessing||'');return;} });
  document.addEventListener('click', e => { const b=e.target.closest('[data-carry-item-detail]');if(!b)return;const slotKey=b.dataset.carryItemDetail||'';const select=$(`equip_${slotKey}_itemSelect`);const cache=inventoryDerived();const row=cache.rowByLookup.get(String(select?.value||''))||cache.equipmentByKey.get(String(select?.value||''))||null;if(row){const idx=inventoryIndexByLookup(row.id||row.masterId||row.publicId,row.name);openCharacterItemDetail(row,row.count||1,idx);}else showToast('アイテムを選択してください。','warn'); });
  document.addEventListener('click', e => { const b=e.target.closest('[data-quiver-item-detail]');if(!b)return;const key=String(b.dataset.quiverItemDetail||'');const cache=inventoryDerived();const row=cache.rowByLookup.get(key)||cache.equipmentByKey.get(key)||null;if(row){const idx=inventoryIndexByLookup(row.id||row.masterId||row.publicId,row.name);openCharacterItemDetail(row,row.count||1,idx);}else showToast('矢弾の詳細を取得できませんでした。','warn'); });
  if ($('inventoryArea')) $('inventoryArea').addEventListener('click', e => {
    const unlearnBtn=e.target.closest('[data-unlearn-recipe]');
    if(unlearnBtn){e.preventDefault();e.stopPropagation();unlearnRecipeByKey(unlearnBtn.dataset.unlearnRecipe||'');return;}
    const skillBtn=e.target.closest('[data-skill-remove]');
    if(skillBtn){e.preventDefault();e.stopPropagation();removeSkillFromWarehouse(skillBtn.dataset.skillRemove||'');return;}
    const catalogDetail=e.target.closest('[data-gm-catalog-detail]');
    if(catalogDetail){e.preventDefault();e.stopPropagation();const row=gmCatalogFindByKey(catalogDetail.dataset.gmCatalogDetail||'');if(row)openCharacterItemDetail(row,1,-1);return;}
    const catalogAdd=e.target.closest('[data-gm-catalog-add]');
    if(catalogAdd){e.preventDefault();e.stopPropagation();const key=catalogAdd.dataset.gmCatalogAdd||'';const input=$('inventoryArea')?.querySelector(`[data-gm-catalog-count="${CSS.escape(key)}"]`);addGmCatalogItemToWarehouse(key,Number(input?.value||1));return;}
    const btn = e.target.closest('[data-inventory-action]'); if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const index = Number(btn.dataset.index || 0);
    if (btn.dataset.inventoryAction === 'detail') { if(inventoryItemsState[index])openCharacterItemDetail(inventoryItemsState[index],inventoryItemsState[index].count,index); return; }
        if (btn.dataset.inventoryAction === 'edit') { openInventoryDialog(index); return; }
    if (btn.dataset.inventoryAction === 'learn-recipe') { learnRecipeFromInventory(index); return; }
    if (btn.dataset.inventoryAction === 'delete') deleteInventoryItem(index);
    if (btn.dataset.inventoryAction === 'duplicate') duplicateInventoryItem(index);
  });
  if ($('inventoryModeTabs')) $('inventoryModeTabs').addEventListener('click', e => {
    const btn=e.target.closest('[data-inventory-mode]'); if(!btn)return;
    setInventoryDisplayMode(btn.dataset.inventoryMode || 'warehouse');
  });
  if ($('learnedKindTabs')) $('learnedKindTabs').addEventListener('click', e => {
    const btn=e.target.closest('[data-learned-kind]'); if(!btn)return;
    setLearnedContentType(btn.dataset.learnedKind || 'spell');
  });
  if ($('openLearnedKindPickerBtn')) $('openLearnedKindPickerBtn').addEventListener('click', () => { renderLearnedKindTabs(); $('learnedKindDialog')?.showModal(); });
  if ($('closeLearnedKindDialogBtn')) $('closeLearnedKindDialogBtn').addEventListener('click', () => $('learnedKindDialog')?.close());
  if ($('learnedKindDialog')) $('learnedKindDialog').addEventListener('click', e => {
    if(e.target===$('learnedKindDialog')){ $('learnedKindDialog').close(); return; }
    const btn=e.target.closest('[data-learned-kind-choice]'); if(!btn)return;
    setLearnedContentType(btn.dataset.learnedKindChoice || 'spell');
    $('learnedKindDialog').close();
  });
  if ($('inventoryLocationTabs')) $('inventoryLocationTabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-inventory-filter="location"]'); if (!btn) return;
    setInventoryFilter('location', btn.dataset.value || '全て');
  });
  if ($('inventoryKindTabs')) $('inventoryKindTabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-inventory-filter="itemType"]'); if (!btn) return;
    setInventoryFilter('itemType', btn.dataset.value || '全て');
  });
  if ($('inventoryCategoryTabs')) $('inventoryCategoryTabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-inventory-filter="category"]'); if (!btn) return;
    setInventoryFilter('category', btn.dataset.value || '全て');
  });
  $('characterList').addEventListener('click', async e => {
    const btn = e.target.closest('button[data-action]'); if (!btn) return;
    const action = btn.dataset.action, id = btn.dataset.id;
    try {
      if (action === 'delete') {
        if (!confirm('このキャラクターを削除しますか？')) return;
        await deleteItem(id); await refreshList(); showToast('削除しました。', 'ok'); return;
      }
      if (action === 'share') { await copyShareUrlForListItem(id); return; }
      if ($('listStatus')) { $('listStatus').className = 'status-box'; $('listStatus').textContent = action === 'export' ? '出力データを読み込み中です。' : '編集画面を開いています。'; }
      const itemEl=btn.closest('.list-item');
      const data = await loadItem(id,{expectedRevision:Number(itemEl?.dataset?.revision||0)||0,rowHint:Number(itemEl?.dataset?.storageRow||0)||0});
      if (action === 'export') { openOutputDialog(data); return; }
      openEditor(action === 'view' ? 'view' : 'edit', data);
    } catch (err) {
      $('listStatus').className = 'status-box error';
      $('listStatus').textContent = err.message;
      showToast(err.message, 'error');
    }
  });
  document.addEventListener('input', e => {
    if (e.target.matches('#charName,#charGender,#charAge,#playerKey,#newPlayerKey,#charMemo')) { updateSummary(); return; }
    if (e.target.classList?.contains('spell-slot-select')) {
      // 選択中のselect自身をupdateAll()で再生成せず、選択値だけを反映する。
      const slotKey = e.target.dataset.slotKey || '';
      syncSpellSetHidden(slotKey);
      syncEquippedSpellSetToInventoryItem(slotKey);
      updateSpellSlotDetails(slotKey);
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
    if (e.target.closest?.('[data-upgrade-row]')) {
      const row = e.target.closest('[data-upgrade-row]');
      const slotRoot = row?.closest('[id$="_upgradeSlots"]');
      const slotKey = slotRoot ? slotRoot.id.replace(/^equip_/, '').replace(/_upgradeSlots$/, '') : '';
      if(e.target.matches('[data-upgrade-content]')&&slotKey){
        const index=Number(row.dataset.upgradeRow||0);
        const entries=collectUpgradeEntries(slotKey);
        const next=normalizeUpgradeEntry(entries[index]||{});
        next.content=normalizeUpgradeContentName(e.target.value||'');
        const maxSlotCost=Math.max(0,Number(row.dataset.upgradeMaxCost)||equipmentUpgradeLimit(slotKey));
        next.slotCost=!next.content?0:(next.content==='素材固有効果'?Math.min(2,maxSlotCost):standardUpgradeSlotCostForSelection(slotKey,next.content,maxSlotCost));
        next.specialEffectName='';next.specialEffectDetail='';next.sourceMaterialId='';next.sourceMaterialPublicId='';next.sourceMaterialName='';next.sourceMaterialTarget='';next.legacyEffectAmount=0;next.legacyEffectDetail='';
        entries[index]=next;
        renderEquipmentUpgradeSlots(slotKey,entries);
      }else if(e.target.matches('[data-upgrade-special-select]')&&slotKey){
        applySpecialUpgradeSelection(row,slotKey,Math.max(0,Number(row.dataset.upgradeMaxCost)||equipmentUpgradeLimit(slotKey)));
        renderEquipmentUpgradeSlots(slotKey,collectUpgradeEntries(slotKey));
      }
      if(slotKey) syncEquipmentUpgradeHidden(slotKey);
      updateAll();
      return;
    }
    if (e.target.dataset.equipmentInput) { updateAll(); return; }
    if (e.target.dataset.inventoryInput) { applyInventoryFilters(); updateSummary(); return; }
    if (e.target.id?.startsWith('stat_') || e.target.dataset.abilityInput || e.target.dataset.skillInput || e.target.id?.startsWith('manualBonus_') || ['currentHp','currentMp','hpBonus','mpBonus','fatigueLevel'].includes(e.target.id)) updateAll();
  });
  document.addEventListener('change', e => {
    if(e.target.id==='supportEligible'||e.target.dataset?.supportSkillMode!==undefined){updateSupportSettingsSummary();return;}
    if(e.target.matches('[data-inventory-count-index]')){
      const index=Number(e.target.dataset.inventoryCountIndex);
      if(Number.isInteger(index)&&index>=0&&inventoryItemsState[index]){
        const current=normalizeInventoryItem(inventoryItemsState[index]);
        if(inventoryKindUsesIndividualRecord(current.kind)){
          inventoryItemsState[index]=normalizeInventoryItem({...current,count:1});
          e.target.value='1';
          showToast('武器・防具は1個体ずつ管理します。複数個は別々の個体として登録してください。','warn');
        }else{
          inventoryItemsState[index]=normalizeInventoryItem({...current,count:clampInt(e.target.value||0,0,9999)});
          e.target.value=String(inventoryItemsState[index].count);
        }
        invalidateInventoryDerivedCache();
        refreshWarehouseQuantityViews();
        if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('inventory');
      }
      return;
    }
    if (e.target.classList?.contains('spell-slot-select')) {
      const slotKey = e.target.dataset.slotKey || '';
      syncSpellSetHidden(slotKey);
      updateSpellSlotDetails(slotKey);
      updateSpellSlotHints();
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
    if (e.target.id?.startsWith('equip_') && e.target.id.endsWith('_setSpells')) {
      const slotKey = e.target.id.replace(/^equip_/, '').replace(/_setSpells$/, '');
      enforceSpellSetLimit(slotKey);
      syncEquippedSpellSetToInventoryItem(slotKey);
      updateSpellSlotDetails(slotKey);
      updateSpellSlotHints();
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
    if (e.target.id?.startsWith('equip_') && e.target.id.endsWith('_itemSelect')) {
      const slotKey = e.target.id.replace(/^equip_/, '').replace(/_itemSelect$/, '');
      applyCsItemToEquipmentSlot(slotKey);
      return;
    }
    if (e.target.id?.startsWith('equip_') && e.target.id.endsWith('_count')) {
      const slotKey = e.target.id.replace(/^equip_/, '').replace(/_count$/, '');
      if (isCarrySlotKey(slotKey)) {
        updateCarryWarehouseAllocationCount(slotKey, e.target.value);
        return;
      }
    }
    if (e.target.id?.startsWith('equip_') && e.target.id.endsWith('_type')) {
      const slotKey = e.target.id.replace(/^equip_/, '').replace(/_type$/, '');
      if(!isCarrySlotKey(slotKey)) {
        const previousItemKey=$('equip_' + slotKey + '_itemSelect')?.dataset.previousItemKey || '';
        syncEquipmentModifiersToInventoryItem(slotKey, previousItemKey);
        syncEquipmentUpgradeToInventoryItem(slotKey, previousItemKey);
        syncEquippedSpellSetToInventoryItem(slotKey, previousItemKey);
      }
      if (isCarrySlotKey(slotKey)) releaseCarryWarehouseAllocation(slotKey, {refresh:true});
      const itemSelect = $('equip_' + slotKey + '_itemSelect');
      if (itemSelect) itemSelect.value = '';
      applyEquipmentPreset(slotKey);
      refreshSpellSetSelect(slotKey, spellContainerKind($('equip_' + slotKey + '_type')?.value || 'なし'));
      if (slotKey === 'rightHand' || slotKey === 'leftHand') updateEquipmentHandLocks(true);
      updateCombatStats();
      updateSpellSlotHints();
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
    if (e.target.id?.startsWith('equip_') && e.target.id.endsWith('_upgradeLimit')) {
      const slotKey = e.target.id.replace(/^equip_/, '').replace(/_upgradeLimit$/, '');
      renderEquipmentUpgradeSlots(slotKey);
      syncEquipmentUpgradeToInventoryItem(slotKey);
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
    if (e.target.closest?.('[data-upgrade-row]')) {
      const row = e.target.closest('[data-upgrade-row]');
      const slotRoot = row?.closest('[id$="_upgradeSlots"]');
      const slotKey = slotRoot ? slotRoot.id.replace(/^equip_/, '').replace(/_upgradeSlots$/, '') : '';
      if(slotKey) syncEquipmentUpgradeHidden(slotKey);
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
  });
  document.addEventListener('input', e => { const section=autoSaveSectionForTarget(e.target); if(section)autoSaveDraftSoon(section); });
  document.addEventListener('change', e => { const section=autoSaveSectionForTarget(e.target); if(section)autoSaveDraftSoon(section); });
  document.addEventListener('focusin', e => refreshSelectionListsForTarget(e.target));
  document.addEventListener('pointerdown', e => {
    const target = e.target;
    if(target && target.tagName === 'SELECT') refreshSelectionListsForTarget(target);
  }, true);
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState==='hidden' && autoSaveEnabled && autoSaveReady && autoSaveDirty && currentMode!=='view'){
      clearAutoSaveTimer();
      saveCharacterNow({automatic:true,force:false});
    }
  });
  window.addEventListener('beforeunload', e => {
    if(autoSaveEnabled && autoSaveReady && autoSaveDirty && currentMode!=='view'){
      e.preventDefault();
      e.returnValue='';
    }
  });
}

function init() {
  try {
    // 装備カテゴリのキャッシュ反映は装備欄DOM生成後に行う。
    // 先に反映すると、キャッシュあり環境で装備UI更新が未生成DOMへ走り初期化失敗の原因になる。
    renderStatic();
    loadCachedEquipmentCategories();
    loadCachedCsItems();
    bindEvents();
    // ホーム画面の裏で空キャラの倉庫・装備を全描画しない。エディタを開いた瞬間にapplyDataする。
    currentCharacter=emptyCharacter();
    inventoryItemsState=[];
    learnedRecipesState=[];
    invalidateInventoryDerivedCache();
    autoSaveEnabled=true;
    syncAutoSaveToggle();
    setAutoSaveStatus('自動保存：ON（キャラクターごとに保存）','ok');
    setView('home');
    // 一覧取得と4MB級固定マスター取得を競合させない。ホーム描画後のアイドル時間にウォームする。
    const warmMaster=()=>{ Promise.resolve(autoSyncEquipmentCategoriesFromDb()).catch(console.error); };
    if(typeof requestIdleCallback==='function')requestIdleCallback(warmMaster,{timeout:1500});
    else window.setTimeout(warmMaster,500);
  } catch (e) {
    console.error('キャラシHTMLの初期化に失敗しました。', e);
    const st = $('homeStatus') || $('listStatus') || $('editorStatus');
    if (st) {
      st.className = 'status-box error';
      st.textContent = 'キャラシHTMLの初期化に失敗しました：' + (e && e.message ? e.message : e);
    }
    try { setView('home'); } catch (_) {}
  }
}
init();

document.addEventListener('change', (ev) => {
  const target = ev.target;
  if (target && target.id === 'quiverSelect') {
    releaseAllQuiverAmmoSlots();
    selectedQuiverId = target.value || '';
    refreshWarehouseQuantityViews();
    if (typeof autoSaveDraftSoon === 'function') autoSaveDraftSoon(['inventory','equipment']);
  }
  if (target && target.dataset && target.dataset.quiverAmmoSlot) {
    selectQuiverAmmoForSlot(target.dataset.quiverAmmoSlot, target.value || '');
    if (typeof autoSaveDraftSoon === 'function') autoSaveDraftSoon(['inventory','equipment']);
  }
  if (target && target.dataset && target.dataset.quiverAmmoCount) {
    updateQuiverAmmoSlotCount(target.dataset.quiverAmmoCount, target.value);
    if (typeof autoSaveDraftSoon === 'function') autoSaveDraftSoon(['inventory','equipment']);
  }
});

