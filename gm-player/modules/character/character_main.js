
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

const STAT_ORDER = ['STR','CON','POW','DEX','APP','SIZ','INT','EDU'];
const STAT_MAX = { STR:18, CON:18, POW:18, DEX:18, APP:18, SIZ:18, INT:18, EDU:21 };
const STAT_LABEL = { STR:'STR', CON:'CON', POW:'POW', DEX:'DEX', APP:'APP', SIZ:'SIZ', INT:'INT', EDU:'EDU' };

const ABILITIES = [
  { key:'body', name:'体力', desc:'力仕事・耐久・近接・防御' },
  { key:'dexterity', name:'器用', desc:'採取・細工・射撃・操作' },
  { key:'sense', name:'感覚', desc:'探索・感知・回避・追跡' },
  { key:'intellect', name:'知性', desc:'調合・鑑定・知識・設計' },
  { key:'will', name:'意志', desc:'抵抗・集中・魔法・祈祷' },
  { key:'charm', name:'魅力', desc:'交渉・共感・社交・鼓舞' },
];
const ABILITY_NAMES = Object.fromEntries(ABILITIES.map(a => [a.key, a.name]));


const SKILL_CATEGORIES = [
  { key:'body', name:'体力系', ability:'body', skills:[
    { key:'athletics', name:'運動', desc:'身体行動', detail:'走る、登る、泳ぐ、跳ぶなど、身体を大きく動かす判定に使用します。足場の悪い場所の移動、障害物の突破、落下や転倒を避ける場面でも使います。' },
    { key:'force', name:'力業', desc:'力任せの作業・大振り攻撃', detail:'重い物を動かす、押す、引く、壊す、こじ開けるなど、純粋な力で状況を動かす判定に使用します。戦闘中は近接の代わりに力業で武器攻撃を行えます。命中時、通常の武器ダメージに加えて武器ダメージのダイスを+1個し、対象の防御値の半分（切り捨て）を無視します。無視するのは防御値のみで、防御技能ポイント、防御行動値、追加軽減、耐性は無視しません。ただし追加ダメージに使う技能ポイントは近接を参照します。成否に関わらず、次の自分のターンは行動できず、次の自分のターン開始時まで防御-2を受けます。' },
    { key:'melee', name:'近接', desc:'近接攻撃', detail:'素手や近接武器で攻撃する時の命中に使用します。命中した場合、装備している武器ダメージに、近接へ振り分けたポイント分のダメージを追加します。' },
    { key:'guard', name:'防御', desc:'常時軽減・防御行動・かばう', detail:'防御技能に振り分けたポイントは、防御行動の有無にかかわらず受けるダメージを減らします。防御行動時は、装備の防御行動値も追加で適用します。かばう判定にも使用します。' },
  ]},
  { key:'dexterity', name:'器用系', ability:'dexterity', skills:[
    { key:'gather', name:'採取', desc:'素材採取・ドロップ補助', detail:'薬草、鉱石、魔物素材などを傷つけずに集める判定に使用します。素材の品質維持、希少部位の回収、採取量の増加に関わります。魔物の討伐時、採取判定に成功することでドロップ判定を+1します。' },
    { key:'craft', name:'細工', desc:'精密作業', detail:'細かな手作業、修理、分解、罠解除、鍵開けなどの判定に使用します。道具や素材を精密に扱う作業に関わります。' },
    { key:'shoot', name:'射撃', desc:'射撃攻撃', detail:'弓、クロスボウ、投擲武器などで攻撃する時の命中に使用します。命中した場合、装備している武器ダメージに、射撃へ振り分けたポイント分のダメージを追加します。' },
    { key:'operate', name:'操作', desc:'装置・道具の扱い', detail:'道具、装置、乗り物、工房設備などを扱う判定に使用します。複雑な機械の起動、調整、操縦、作業設備の使用に関わります。' },
  ]},
  { key:'sense', name:'感覚系', ability:'sense', skills:[
    { key:'search', name:'探索', desc:'場所を調べる', detail:'周囲を調べ、手がかり、隠し通路、素材の群生地、違和感のある物品などを見つける判定に使用します。場所を調べる時の基本技能です。' },
    { key:'detect', name:'感知', desc:'危険や異変に気づく', detail:'気配、罠、危険、異変、接近してくる存在などに気づく判定に使用します。奇襲の察知、不自然な音や匂い、魔力や空気の変化に気づく場面で使います。' },
    { key:'evade', name:'回避', desc:'回避値の基準', detail:'攻撃、落石、罠、爆発、崩落などを避ける判定に使用します。PCが自分から行う回避判定は2D6＋回避技能合計（装備の回避補正込み）で行います。敵の行動から参照される回避値は、その回避技能合計に+5し、回避値専用補正があればさらに加算します。' },
    { key:'track', name:'追跡', desc:'痕跡を辿る', detail:'足跡、痕跡、匂い、魔力の流れなどを辿る判定に使用します。逃げた魔物や人物を追う、移動経路を推測する、痕跡から進行方向を読む場面で使います。' },
  ]},
  { key:'intellect', name:'知性系', ability:'intellect', skills:[
    { key:'alchemy', name:'調合', desc:'アイテム作成', detail:'素材を組み合わせ、アイテム・薬品・道具などを作成する判定に使用します。調合の成功、品質の向上、追加効果の付与などに関わります。' },
    { key:'appraise', name:'鑑定', desc:'価値や性質を見極める', detail:'アイテム、素材、装備、魔物素材などの性質や価値を見極める判定に使用します。未知の素材や特殊なアイテムの効果、危険性、売却価値を調べる場面で使います。' },
    { key:'knowledge', name:'知識', desc:'魔物・素材・属性', detail:'魔物、素材、属性について知っているかを確認する判定に使用します。魔物の特徴、素材の性質、属性の相性などを思い出す場面で使います。魔物に対して使用する場合、成功すると指定した1つの耐性・弱点・無効属性などを知ることができます。' },
    { key:'design', name:'設計', desc:'罠の仕組みを組む', detail:'罠の構造を考え、作成・調整する判定に使用します。現状、武器作成・武器派生・武器強化には使用せず、それらは細工で判定します。' },
  ]},
  { key:'will', name:'意志系', ability:'will', skills:[
    { key:'resist', name:'抵抗', desc:'状態異常や精神干渉に耐える', detail:'毒・汚染・呪い・麻痺・睡眠や精神干渉、弱体化などに耐える基準です。PCが自分から行う抵抗判定は2D6＋抵抗技能合計（装備の抵抗補正込み）で行います。敵の行動から参照される抵抗値は、その抵抗技能合計に+5し、抵抗値専用補正があればさらに加算します。' },
    { key:'focus', name:'集中', desc:'維持・集中攻撃', detail:'長時間の作業、高難度の調合、儀式、継続的な魔力操作など、精神を乱さずに行動を続ける判定に使用します。戦闘中は主行動を使用して集中状態になれます。集中開始後から次の自分のターン開始までに1点以上のダメージを受けると集中は解除されます。維持したまま次の自分のターンを迎えた場合、射撃武器による攻撃またはダメージを与える魔法を1回行えます。その攻撃は本来の射撃・魔法の代わりに集中技能で判定し、判定に+2します。命中時は通常どおり射撃または魔法へ割り振ったポイントをダメージへ加え、さらにダメージダイスを1個追加します。単体・複数・列・範囲を問わず適用し、複数対象では各対象のダメージロールへ適用します。敵前衛がいる状態で射撃武器から後衛を狙う-2補正は通常どおり受けます。矢弾・MPなどの消費は攻撃1回分のみで、攻撃後に集中状態を解除します。祈祷には使用できません。' },
    { key:'magic', name:'魔法', desc:'魔法術式', detail:'魔法術式を使用する時の判定に使用します。魔法術式でダメージを与える場合、術式ダメージに魔法へ振り分けたポイント分のダメージを追加します。' },
    { key:'prayer', name:'祈祷', desc:'祈祷術式', detail:'祈祷術式を使用する時の判定に使用します。祈祷術式でダメージや回復を行う場合、術式の効果量に祈祷へ振り分けたポイント分を追加します。浄化、加護、回復、精神支援にも関わります。' },
  ]},
  { key:'charm', name:'魅力系', ability:'charm', skills:[
    { key:'negotiate', name:'交渉', desc:'条件交渉', detail:'相手と話し合い、条件を整える判定に使用します。値引き、依頼、説得、情報交換、取引、相手の態度を和らげる場面で使います。' },
    { key:'service', name:'共感', desc:'感情や本心を読む', detail:'相手の感情や本心を読み取り、寄り添う判定に使用します。不安を落ち着かせる、嘘や隠し事に気づく、相手の悩みや望みを察する場面で使います。' },
    { key:'art', name:'社交', desc:'場の空気と人付き合い', detail:'礼儀、場の空気、集団内での立ち回りに関わる判定に使用します。人脈作り、評判の確認、貴族・商人・町人などとの交流、集まりの中で自然に情報を得る場面で使います。' },
    { key:'leadership', name:'鼓舞', desc:'次の判定+2', detail:'仲間を励まし、士気を高める判定に使用します。戦闘中や困難な場面で成功すると、対象の次の判定に+2します。' },
  ]},
];
const HAND_TYPE_OPTIONS = ['なし','短剣','片手剣','片手斧','片手槌','片手槍','鞭','杖','盾','大盾','魔導書','祈祷書','両手剣','大槌','長槍','弓','クロスボウ','ヘヴィクロスボウ','大鎌'];
const TWO_HAND_TYPES = new Set(['両手剣','大槌','長槍','弓','クロスボウ','ヘヴィクロスボウ','大鎌']);
const ELEMENT_TYPES = ['','物','火','水','風','雷','光','闇','無','可変','矢弾依存'];
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
  for (const btn of document.querySelectorAll('[data-skill-remove],#addSkillByPublicIdBtn,#clearSkillPublicIdBtn')) btn.disabled = readOnly || (btn.dataset.skillRemove && normalizeSkillGachaState(skillGachaState||{}).equippedSkillIds.includes(btn.dataset.skillRemove));
  if ($('addInventoryItemBtn')) $('addInventoryItemBtn').disabled = readOnly;
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
$('craftCreateCloseBtn')?.addEventListener('click',()=>{$('craftCreateDialog')?.close();craftDialogContext=null;});
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

  if ($('addSkillByPublicIdBtn')) $('addSkillByPublicIdBtn').addEventListener('click', addSkillByPublicIds);
  if ($('clearSkillPublicIdBtn')) $('clearSkillPublicIdBtn').addEventListener('click',()=>{if($('skillPublicIdInput'))$('skillPublicIdInput').value='';if($('skillPublicIdStatus')){$('skillPublicIdStatus').className='status-box';$('skillPublicIdStatus').textContent='登録IDを入力してください。';}});
  if ($('skillWarehouseSearch')) $('skillWarehouseSearch').addEventListener('input',e=>{skillWarehouseFilter.search=e.target.value||'';renderSkillWarehouse();});
  if ($('skillCategoryTabs')) $('skillCategoryTabs').addEventListener('click',e=>{const b=e.target.closest('[data-skill-category]');if(!b)return;skillWarehouseFilter.category=b.dataset.skillCategory||'全て';if(skillWarehouseFilter.category!=='全て'&&skillWarehouseFilter.category!=='武器専用')skillWarehouseFilter.weaponType='全て';renderSkillWarehouse();});
  if ($('skillWeaponTabs')) $('skillWeaponTabs').addEventListener('click',e=>{const b=e.target.closest('[data-skill-weapon]');if(!b)return;skillWarehouseFilter.weaponType=b.dataset.skillWeapon||'全て';renderSkillWarehouse();});
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
  if ($('skillWarehouseArea')) $('skillWarehouseArea').addEventListener('click',e=>{const b=e.target.closest('[data-skill-remove]');if(!b)return;removeSkillFromWarehouse(b.dataset.skillRemove||'');});

  $('makeTokenOutputBtn').addEventListener('click', () => copyOutput('token'));
  $('makePaletteOutputBtn').addEventListener('click', () => copyOutput('palette'));
  $('closeOutputDialogBtn').addEventListener('click', () => $('outputDialog').close());
  if ($('addInventoryItemBtn')) $('addInventoryItemBtn').addEventListener('click', () => addInventoryItem());
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
  if ($('cancelInventoryDialogBtn')) $('cancelInventoryDialogBtn').addEventListener('click', () => $('inventoryDialog')?.close());
  if ($('closeItemDetailViewBtn')) $('closeItemDetailViewBtn').addEventListener('click', () => $('itemDetailViewDialog')?.close());
  if ($('itemDetailViewDialog')) $('itemDetailViewDialog').addEventListener('click', e => { if(e.target===$('itemDetailViewDialog'))$('itemDetailViewDialog').close(); });
  if ($('itemDetailViewDialog')) $('itemDetailViewDialog').addEventListener('click', e => { const learnRecipe=e.target.closest('[data-detail-learn-recipe]');if(learnRecipe){const index=Number(learnRecipe.dataset.detailLearnRecipe);learnRecipeFromInventory(index);inventoryDisplayMode='learned';learnedContentType='recipe';renderInventory({refreshLinked:false});$('itemDetailViewDialog')?.close();return;}const learnScroll=e.target.closest('[data-detail-learn-scroll]');if(learnScroll){learnSpellFromScrollInventory(Number(learnScroll.dataset.detailLearnScroll));return;}const apply=e.target.closest('[data-apply-named-processing]');if(apply){applyNamedProcessingAtIndex(Number(itemDetailViewContext.index),apply.dataset.applyNamedProcessing||'');return;}const clear=e.target.closest('[data-clear-named-processing]');if(clear){clearNamedProcessingAtIndex(Number(itemDetailViewContext.index),clear.dataset.clearNamedProcessing||'');return;} });
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

