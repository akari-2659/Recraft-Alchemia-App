function updateJsonBox(force=false){ if(!force)return; const box=$('jsonBox'); if(box)box.value=JSON.stringify(state,null,2); }
function fromJsonBox(){
  const data=JSON.parse($('jsonBox').value);
  for(const key of DATA_KEYS){ if(!Array.isArray(data[key])) throw new Error(key+' が配列ではありません'); }
  state=normalizeStateData(data); markDirty('*'); renderAll(); toast('JSONを読み込みました');
}
function newBlankRow(key){
  const row={}; SCHEMA[key].forEach(h=>row[h]='');
  row.id = `${key}_${Date.now()}`;
  row.updatedAt=nowIso(); row.ownerKey=''; row.createdBy='';
  if(SCHEMA[key].includes('enabled')) row.enabled='TRUE';
  return row;
}
function addRow(key){ openForm(key, null, 'new'); }
function addRowWithKind(kind){ openForm('items', null, 'new', kind); }
function addCurrentItemType(){ const type=currentItemTypeView==='全て' ? '' : (currentItemTypeView==='収納具' ? (['バッグ','矢筒'].includes(currentItemCategoryView)?currentItemCategoryView:'バッグ') : currentItemTypeView); openForm('items', null, 'new', 'アイテム', type); }
function updateMaterialViewUi(){
  const add=$('materialViewAddButton');
  if(add) add.textContent=currentMaterialTypeView==='食材' ? '食材を新規登録' : '素材を新規登録';
}
function addCurrentMaterial(){
  if(currentMaterialTypeView==='食材') openForm('items', null, 'new', 'アイテム', '食材');
  else openForm('items', null, 'new', '素材', '');
}

function addRecipeWithCraft(craftType){
  const requested=String(craftType||'').trim();
  const view=activeRecipeCraftType();
  const meta=RECIPE_VIEW_META[view]||{};
  const concrete=requested || String(meta.defaultCraftType||'').trim();
  openForm('recipes', null, 'new', concrete);
}
function duplicateRow(key, idx){
  const row={...state[key][idx]}; row.id = `${row.id || key}_${Date.now()}`; row.name = row.name ? row.name+' コピー' : 'コピー'; row.updatedAt=nowIso(); row.ownerKey=''; row.createdBy='';
  state[key].splice(idx+1,0,row); markDirty(key); rerenderTableGroup(key); updateCounts(); updateJsonBox();
}
function deleteRow(key, idx){
  if(!confirm('この行を削除する？')) return;
  state[key].splice(idx,1); markDirty(key); rerenderTableGroup(key); updateCounts(); updateJsonBox();
}
function resetKey(key){
  if(!initialDataLoaded){ toast('先に初期データJSONを読み込んでください', 'error'); return; }
  if(!confirm('この表を初期データに戻す？ 画面上の編集内容は消えるよ。')) return;
  state[key]=unifyEffectNotesForDisplayRows({[key]:raDeepClone(DEFAULTS[key]||[])})[key]; markDirty(key); rerenderTableGroup(key); updateCounts(); updateJsonBox();
}


const CHECK_LEFT_OPTIONS = ['なし','技能値','命中','近接','射撃','魔法','祈祷','調合','採取','細工','防御','回避','抵抗','集中','知識','交渉','共感','社交','鼓舞','操作','探索','感知','追跡','力業','運動'];
const CHECK_RIGHT_OPTIONS = ['回避値','抵抗値','防御','目標値','10','なし'];
function normalizeCheckLeftSkill(value){
  const raw = String(value || '').trim();
  if(!raw) return '';
  if(raw === 'なし') return 'なし';
  if(raw.includes('射撃')) return '射撃';
  if(raw.includes('近接')) return '近接';
  if(raw.includes('魔法')) return '魔法';
  if(raw.includes('祈祷')) return '祈祷';
  if(raw.includes('調合')) return '調合';
  for(const opt of CHECK_LEFT_OPTIONS){ if(opt !== 'なし' && raw.includes(opt)) return opt; }
  return CHECK_LEFT_OPTIONS.includes(raw) ? raw : raw;
}
function inferCheckLeftFromRow(key, row={}, fallback=''){
  const skill = normalizeCheckLeftSkill(row.skill || row.checkSkill || row.type || '');
  const itemCategory = String(row.itemCategory || row.category || '').trim();
  const itemType = String(row.itemType || '').trim();
  const equipSlot = String(row.equipSlot || '').trim();
  const eventType = String(row.eventType || '').trim();
  const type = String(row.type || '').trim();
  if(key === 'spells') return /祈祷|聖|神/.test(type) ? '祈祷' : '魔法';
  if(key === 'items' || key === 'equipment_categories'){
    if(/弓|クロスボウ|矢弾|射撃/.test(itemCategory + itemType + equipSlot + skill)) return '射撃';
    if(/魔導|魔法/.test(itemCategory + itemType + type + skill)) return '魔法';
    if(/祈祷|聖/.test(itemCategory + itemType + type + skill)) return '祈祷';
    if(/調合|爆弾|薬|消耗/.test(itemCategory + itemType + skill)) return '調合';
    if(itemCategory === '武器' || /右手|左手|両手/.test(equipSlot) || skill === '近接') return '近接';
    if(skill) return skill;
  }
  if(key === 'event_tables'){
    if(eventType.includes('採取')) return '採取';
    if(eventType.includes('魔物') || eventType.includes('戦闘')) return '近接';
    if(eventType.includes('障害')) return '運動';
    if(eventType.includes('発見')) return '探索';
  }
  if(key === 'monsters'){
    const parsedFallback = parseCheckType(fallback).left;
    if(parsedFallback === 'なし') return 'なし';
    // 魔物は本体共通の命中値を持たず、各行動に設定した基礎技能値で判定する。
    // 行動種別は判定値ではなく、その行動の性質だけを表す。
    return '技能値';
  }
  return normalizeCheckLeftSkill(skill || parseCheckType(fallback).left || fallback);
}

function checkTypeForRow(key, row={}){
  const parsed = parseCheckType(row.checkType || '');
  const left = inferCheckLeftFromRow(key, row, parsed.raw || row.checkType || '');
  return composeCheckType(left, parsed.right || '');
}
function normalizeRowCheckType(key, row={}){
  if(!row || row.checkType === undefined) return row;
  if(key==='items' && String(row.itemType || '').trim()==='武器'){
    row.skill=canonicalWeaponUsageSkill(row);
    row.checkType='';
    return row;
  }
  row.checkType = checkTypeForRow(key, row);
  return row;
}
function isWeaponLikeEquipment(row={}){
  const itemCategory = String(row.itemCategory || row.category || '').trim();
  const skill = String(row.skill || '').trim();
  const name = String(row.name || '').trim();
  if(/魔導書|祈祷書|魔印|聖印/.test(name + itemCategory)) return false;
  if(itemCategory === '武器') return true;
  if(/近接|射撃/.test(skill) && !/魔法|祈祷/.test(skill)) return true;
  return false;
}
function ensurePhysicalElementForWeapon(row={}){
  if(row && isWeaponLikeEquipment(row) && !String(row.element || '').trim()) row.element = '物';
  return row;
}

function normalizeCheckTypeValue(value){
  let raw = String(value || '').trim();
  if(!raw) return '';
  raw = raw.replace(/＞＝/g, '>=').replace(/≧/g, '>=').replace(/\s+/g, '');
  const m = raw.match(/^(.+?)>=(.+)$/);
  if(m){
    const left = normalizeCheckLeftSkill(m[1]);
    const right = m[2].trim();
    return `${left}>=${right}`;
  }
  return normalizeCheckLeftSkill(raw);
}
function normalizeMonsterActionCheckType(row={}){
  const normalized = normalizeCheckTypeValue(row.checkType);
  if(!normalized || normalized === 'なし') return normalized;
  const parsed = parseCheckType(normalized);
  const effect = String(row.effect || '').trim();
  const power = String(row.power || '').trim();
  const noDamage = !power || power === 'なし' || power === '-';
  const resistanceEffect = /抵抗に失敗/.test(effect)
    || (noDamage && /(毒|拘束|萎縮|泥まみれ|胞子|粘着|視界不良|体勢崩れ|汚染|呪い|麻痺|睡眠)状態/.test(effect));
  const right = resistanceEffect ? '抵抗値' : (parsed.right || '');
  return right ? `技能値>=${right}` : '技能値';
}
function parseCheckType(value){
  const raw = normalizeCheckTypeValue(value);
  const m = raw.match(/^(.+?)>=(.+)$/);
  if(m) return {left:m[1].trim(), right:m[2].trim(), raw};
  return {left:raw, right:'', raw};
}
function composeCheckType(left, right){
  const l = normalizeCheckLeftSkill(left);
  const r = String(right || '').trim();
  if(!l) return '';
  if(l === 'なし') return 'なし';
  if(r && r !== 'なし') return normalizeCheckTypeValue(`${l}>=${r}`);
  return l;
}
function checkBuilderHtml(value, fieldAttr='data-form-field="checkType"', context={}){
  const parsed = parseCheckType(value);
  const row = context.row || {};
  const forcedLeft = inferCheckLeftFromRow(context.key || formState.key || '', row, parsed.raw || value) || parsed.left || '';
  const rightOptions = [...CHECK_RIGHT_OPTIONS];
  if(parsed.right && !rightOptions.includes(parsed.right)) rightOptions.unshift(parsed.right);
  const label = forcedLeft || '未設定';
  const left = `<div class="check-left-fixed" title="カテゴリ/種別から自動設定">${escapeHtml(label)}</div><input type="hidden" data-check-left-value value="${escapeHtml(forcedLeft)}">`;
  const right = `<input data-check-right list="checkRightOptions" value="${escapeHtml(parsed.right || '')}" placeholder="回避値/抵抗値/任意">`;
  const hiddenValue = composeCheckType(forcedLeft, parsed.right);
  return `<div class="check-builder" data-check-builder>${left}<span class="check-sep">>=</span>${right}<input type="hidden" ${fieldAttr} value="${escapeHtml(hiddenValue)}"></div>`;
}
function syncCheckBuilder(builder){
  if(!builder) return;
  const left = builder.querySelector('[data-check-left-value]')?.value || builder.querySelector('[data-check-left]')?.value || '';
  const right = builder.querySelector('[data-check-right]')?.value || '';
  const hidden = builder.querySelector('[data-form-field="checkType"], [data-monster-action-field="checkType"]');
  if(hidden) hidden.value = composeCheckType(left, right);
}
function syncAllCheckBuilders(root=document){
  root.querySelectorAll('[data-check-builder]').forEach(syncCheckBuilder);
}

function formOptionValues(key, field){
  const values = new Set();
  (state[key]||[]).forEach(r=>{ if(r && r[field] !== undefined && r[field] !== null && String(r[field]).trim()) values.add(String(r[field]).trim()); });
  if(field==='dataKind') ['アイテム','素材'].forEach(v=>values.add(v));
  if(field==='csVisible') ['TRUE','FALSE'].forEach(v=>values.add(v));
  if(field==='itemType') state.item_types.forEach(r=>{ if(r.name && String(r.enabled||'TRUE').toUpperCase()!=='FALSE') values.add(String(r.name)); });
  if(field==='itemCategory') {
    const selectedType = currentFormValue('itemType');
    state.item_categories.forEach(r=>{ if(r.name && String(r.enabled||'TRUE').toUpperCase()!=='FALSE' && (!selectedType || String(r.itemType||'')===selectedType)) values.add(String(r.name)); });
  }
  if(field==='materialType') state.material_types.forEach(r=>{ if(r.name && String(r.enabled||'TRUE').toUpperCase()!=='FALSE') values.add(String(r.name)); });
  if(field==='materialCategory') {
    const selectedType = currentFormValue('materialType');
    state.material_categories.forEach(r=>{ if(r.name && String(r.enabled||'TRUE').toUpperCase()!=='FALSE' && (!selectedType || String(r.materialType||'')===selectedType)) values.add(String(r.name)); });
  }
  if(field==='equipSlot') ['なし','右手/左手','両手','鎧','装飾品','所持品'].forEach(v=>values.add(v));
  if(field==='skill') ['近接','射撃','魔法','祈祷','調合','採取','細工','防御','回避','操作','射撃または調合'].forEach(v=>values.add(v));
  if(field==='craftSkill') ['なし','調合','細工','設計'].forEach(v=>values.add(v));
  if(field==='rank'){
    values.clear();
    if(['items','materials','recipes','spells','skills'].includes(key)) knownToolRanks(...(state[baseKeyForTable(key)]||[]).map(r=>r.rank)).forEach(v=>values.add(String(v)));
    else (state[key]||[]).forEach(r=>{ if(r && String(r[field]||'').trim()) values.add(String(r[field]).trim()); });
  }
  if(['toolRank','upgradeMaterialMinRank'].includes(field)) knownToolRanks().forEach(v=>values.add(String(v)));
  if(field==='type') ['魔法','祈祷'].forEach(v=>values.add(v));
  if(key==='skills' && field==='category') ['武器専用','汎用戦闘','探索系'].forEach(v=>values.add(v));
  if(key==='skills' && field==='weaponType') ['短剣','片手剣','片手斧','片手槌','片手槍','杖','鞭','大鎌','ガントレット','両手剣','大槌','長槍','弓','クロスボウ','ヘヴィクロスボウ','魔導書','祈祷書','汎用','探索'].forEach(v=>values.add(v));
  if(key==='skills' && field==='balanceTier') ['限定的','標準','強め','強力','最上位'].forEach(v=>values.add(v));
  if(field==='enabled') ['TRUE','FALSE'].forEach(v=>values.add(v));
  if(field==='individualValueEnabled') ['TRUE','FALSE'].forEach(v=>values.add(v));
  if(field==='checkType') ['近接>=回避値','射撃>=回避値','魔法>=回避値','魔法>=抵抗値','祈祷>=10','祈祷>=回避値','祈祷>=抵抗値','調合>=回避値','採取','なし'].forEach(v=>values.add(v));
  if(field==='element') ['物','火','水','風','雷','光','闇','無','矢弾依存'].forEach(v=>values.add(v));
  if(field==='enchantTarget') ['武器','防具・盾','装飾品','装備'].forEach(v=>values.add(v));
  if(field==='enchantEffectType') ['属性付与','ダメージ補正','防御補正','回避補正','耐性付与','特殊効果'].forEach(v=>values.add(v));
  if(field==='enchantDuration') ['次の攻撃終了まで','次にダメージを受けるまで','戦闘終了まで','ラウンド制','シーン終了まで','手動解除'].forEach(v=>values.add(v));
  if(field==='enchantStackRule') ['同じ装備は1つ・新しい効果で上書き','重複可'].forEach(v=>values.add(v));
  if(field==='hasLock' || field==='hasTrap') ['なし','あり'].forEach(v=>values.add(v));
  if(field==='equipmentUpgradeTarget') ['武器','防具','盾','装飾品','魔導書','祈祷書','武器・防具','防具・盾','魔導書・祈祷書','武器・魔導書・祈祷書'].forEach(v=>values.add(v));
  if(field==='equipmentUpgradeEffect') ['威力強化','威力固定強化','命中強化','防御強化','防御行動強化','回避強化','抵抗強化','副手追撃強化','術式枠拡張','術式省力化','回復量強化','回復量固定強化','最大スタック拡張','HP強化','MP強化','力業補助','魔法補助','祈祷補助','水属性軽減','水耐性付与','光耐性付与','風属性強化','風属性軽減','風属性増幅'].forEach(v=>values.add(v));
  if(field==='craftType') ['調合','料理','鍛冶','細工','仕掛け製作','武器派生','防具製作','装飾品製作','装飾品強化','バッグ製作','クリスタル強化'].forEach(v=>values.add(v));
  if(field==='baseItem') (state.items || []).forEach(r=>{ const type=String(r.itemType || '').trim(); const cat=String(r.itemCategory || '').trim(); if(String(r.dataKind || '').trim() !== '素材' && ((type==='武器' && ['魔導書','祈祷書'].includes(cat)) || type==='武器' || (type==='術式装備' && ['魔導書','祈祷書'].includes(cat))) && r.name) values.add(String(r.name)); });
  if(field==='branchType') (state.recipes||[]).forEach(r=>{ const v=String(r.branchType||'').trim(); if(v) values.add(v); });
  if(field==='resultKind') ['アイテム','素材','武器','防具','バッグ','矢筒','調合品','食材','スクロール'].forEach(v=>values.add(v));
  if(['physicalAffinity','fireAffinity','waterAffinity','windAffinity','thunderAffinity','lightAffinity','darkAffinity','neutralAffinity'].includes(field)) ['-','耐','無','反','吸','弱'].forEach(v=>values.add(v));
  if(field==='pullRule') ['可','不可'].forEach(v=>values.add(v));
  if(field==='scale') ['1PCあたり','パーティ全体','小規模','標準','大規模','高難度'].forEach(v=>values.add(v));
  if(field==='requestKind') ['拠点内依頼','エリア依頼','納品依頼'].forEach(v=>values.add(v));
  if(field==='questType') ['チュートリアル','エリア開放','施設解放','採取','討伐','二つ名討伐','護衛','調査','探索','復興','納品','自由依頼'].forEach(v=>values.add(v));
  if(field==='rewardScope') ['各PC','パーティー共通'].forEach(v=>values.add(v));
  if(field==='unlockAreaKey') state.exploration_areas.forEach(r=>{ if(r.id) values.add(String(r.id)); });
  if(field==='areaName') state.exploration_areas.forEach(r=>{ if(r.name) values.add(String(r.name)); });
  if(field==='bossMonster') state.monsters.forEach(r=>{ if(r.name) values.add(String(r.name)); });
  if(field==='areaType') ['草原','森','水辺','洞窟','街道','遺跡','市街地'].forEach(v=>values.add(v));
  if(field==='difficulty') ['チュートリアル','初級','中級','上級','高難度'].forEach(v=>values.add(v));
  if(field==='eventType') ['採取','障害/採取','発見','発見/細工','発見/宝箱','採取/魔物遭遇','発見/魔物','魔物遭遇','休息地点','レアポイント','宿屋の噂','噂イベント','ボス遭遇','拠点イベント'].forEach(v=>values.add(v));
  if(field==='conditionType') ['なし','噂話','解放エリア','天気'].forEach(v=>values.add(v));
  if(field==='rumorScope') ['','一日','時間帯'].forEach(v=>values.add(v));
  if(field==='encounterCountRule') ['','固定','半数切上','人数同数','ランダム編成'].forEach(v=>values.add(v));
  if(field==='conditionValue'){
    (state.event_tables || []).forEach(r=>{ if(String(r.eventType||'').trim()==='宿屋の噂' && r.eventName) values.add(String(r.eventName)); });
    (state.exploration_areas||[]).forEach(a=>{
      if(a.id)values.add(String(a.id));
      String(a.weatherProfiles||'').split(/\n+/).forEach(line=>{const name=String(line||'').split('\t')[0]?.trim();if(name)values.add(name);});
    });
  }
  if(field==='treasureTableId') (state.treasure_tables || []).filter(r=>String(r.tablePurpose||'').trim()!=='入手アイテム').forEach(r=>{ if(r.tableId) values.add(String(r.tableId)); });
  if(field==='rewardTableId') (state.treasure_tables || []).filter(r=>String(r.tablePurpose||'').trim()==='入手アイテム').forEach(r=>{ if(r.tableId) values.add(String(r.tableId)); });
  if(field==='entryType') ['通貨','換金品','アイテム','素材','レシピ','未鑑定スクロール'].forEach(v=>values.add(v));
  if(field==='entryName') (state.items || []).forEach(r=>{ if(r.name) values.add(String(r.name)); });
  if(field==='entryPublicId') (state.items || []).forEach(r=>{ if(r.publicId) values.add(String(r.publicId)); });
  if(field==='recipeName') (state.recipes || []).forEach(r=>{ if(r.name) values.add(String(r.name)); });
  if(field==='scrollRank') [1,2,3,4].forEach(v=>values.add(String(v)));
  if(field==='treasureRank') [1,2,3,4,5].forEach(v=>values.add(String(v)));
  if(field==='facilityName') ['宿屋','工房','鑑定所'].forEach(v=>values.add(v));
  if(field==='spellType') ['魔法','祈祷'].forEach(v=>values.add(v));
  if(field==='spellRank') [1,2,3,4].forEach(v=>values.add(String(v)));
  if(field==='tableId') state.event_tables.forEach(r=>{ if(r.tableId) values.add(String(r.tableId)); });
  if(field==='monsterType') ['粘体','獣','虫','植物','爬虫','水棲','軟体','霊体','造魔','竜','異界'].forEach(v=>values.add(v));
  return [...values].sort((a,b)=>compareValues(a,b));
}
function currentFormValue(field){
  const el = $('editModal')?.querySelector(`[data-form-field="${field}"]`);
  return String(el?.value || '').trim();
}
function shouldShowQuickCategoryButton(key, field){
  return key==='items' && (['itemType','itemCategory','materialType','materialCategory'].includes(field) || (field==='rank' && (currentFormValue('dataKind')==='素材' || formState.defaultDataKind==='素材')));
}
function quickButtonLabel(field){
  return {itemType:'＋アイテム種別', itemCategory:'＋アイテムカテゴリ', materialType:'＋素材種別', materialCategory:'＋素材カテゴリ', rank:'＋素材ランク'}[field] || '＋作成';
}

const ELEMENT_VALUES = ['物','火','水','風','雷','光','闇','無','なし'];
const AFFINITY_VALUES = ['-','耐','無','反','吸','弱'];
const MONSTER_ACTION_TYPE_VALUES = ['近接攻撃','遠距離攻撃','防御','補助','回復','特殊'];
const MONSTER_ACTION_RANGE_VALUES = ['近距離','遠距離','自身'];
function splitMonsterLine(line, size){
  const cols = String(line || '').split('\t');
  while(cols.length < size) cols.push('');
  return cols.slice(0, size);
}
function inferMonsterActionType(row={}){
  const parsed = parseCheckType(row.checkType || '');
  if(parsed.left === '近接') return '近接攻撃';
  if(parsed.left === '射撃') return '遠距離攻撃';
  if(parsed.left === '魔法' || parsed.left === '祈祷') return String(row.power||'').trim() && !['なし','-'].includes(String(row.power||'').trim()) ? '遠距離攻撃' : '特殊';
  const name = String(row.name || '').trim();
  const power = String(row.power || '').trim();
  if(/回復/.test(power) || ['泥の再生'].includes(name)) return '回復';
  if(['ぷるぷる防御','跳躍回避','身を固める','潜り込み','樹皮の守り','木登り退避','泥中跳躍','泥の鎧','甲殻封鎖'].includes(name)) return '防御';
  if(['角の構え','根脈の隆起','沼底の脈動','鏡界の収束'].includes(name)) return '補助';
  return '特殊';
}
function normalizeMonsterActionType(row={}){
  const type = String(row.actionType || '').trim();
  return MONSTER_ACTION_TYPE_VALUES.includes(type) ? type : inferMonsterActionType(row);
}
function inferMonsterActionRange(row={}){
  const target=String(row.target||'').trim();
  if(target.includes('自身')) return '自身';
  const type=normalizeMonsterActionType(row);
  if(type==='近接攻撃') return '近距離';
  if(type==='遠距離攻撃') return '遠距離';
  if(target.includes('自身')) return '自身';
  return '遠距離';
}
function normalizeMonsterActionRange(row={}){
  let range=String(row.range||row.distance||'').trim();
  if(range==='近接') range='近距離';
  if(range==='特殊') range=(String(row.target||'').includes('自身')?'自身':'遠距離');
  return MONSTER_ACTION_RANGE_VALUES.includes(range) ? range : inferMonsterActionRange(row);
}
function normalizeMonsterActionBaseValue(value){
  const raw=String(value ?? '').trim();
  if(raw==='') return '';
  const n=Number(raw);
  return Number.isInteger(n) && n>=0 ? n : '';
}
function normalizeLegacyMonsterActionHitMod(value){
  const raw=String(value ?? '').trim();
  if(raw==='') return 0;
  const n=Number(raw);
  return Number.isInteger(n) && n>=-2 && n<=2 ? n : 0;
}
function parseMonsterActions(value, legacyHitValue=''){
  const raw = String(value || '').trim();
  if(!raw) return [];
  const legacyHitRaw=String(legacyHitValue ?? '').trim();
  const legacyHit=legacyHitRaw!=='' && Number.isFinite(Number(legacyHitRaw)) ? Number(legacyHitRaw) : null;
  const resolveBase=(row,lastValue)=>{
    const explicit=normalizeMonsterActionBaseValue(row && row.baseValue);
    if(explicit!=='') return explicit;
    if(legacyHit!==null){
      const legacyMod=normalizeLegacyMonsterActionHitMod(row && row.hitMod!==undefined ? row.hitMod : lastValue);
      return legacyHit + legacyMod;
    }
    return normalizeMonsterActionBaseValue(lastValue);
  };
  try{
    const arr = JSON.parse(raw);
    if(Array.isArray(arr)) return arr.map(r=>({
      name:r.name||'', actionType:normalizeMonsterActionType(r), range:normalizeMonsterActionRange(r), checkType:r.checkType||'', target:r.target||'', element:r.element||'', power:r.power||'', effect:r.effect||'', flags:r.flags||r.actionFlags||'',
      baseValue:resolveBase(r, r.baseValue)
    }));
  }catch(e){}
  return raw.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    const rawCols = String(line || '').split('\t');
    if(rawCols.length >= 9){
      const cols = splitMonsterLine(line, Math.min(10,rawCols.length));
      const row = {name:cols[0], actionType:cols[1], checkType:cols[2], target:cols[3], element:cols[4], power:cols[5], effect:cols[6], range:cols[8], flags:cols[9]||''};
      row.baseValue=resolveBase({}, cols[7]);
      row.actionType = normalizeMonsterActionType(row);
      row.range = normalizeMonsterActionRange(row);
      return row;
    }
    if(rawCols.length >= 8){
      const cols = splitMonsterLine(line, 8);
      const row = {name:cols[0], actionType:cols[1], checkType:cols[2], target:cols[3], element:cols[4], power:cols[5], effect:cols[6]};
      row.baseValue=resolveBase({}, cols[7]);
      row.actionType = normalizeMonsterActionType(row);
      row.range = normalizeMonsterActionRange(row);
      return row;
    }
    if(rawCols.length >= 7){
      const cols = splitMonsterLine(line, 7);
      const row = {name:cols[0], actionType:cols[1], checkType:cols[2], target:cols[3], element:cols[4], power:cols[5], effect:cols[6]};
      row.baseValue=legacyHit!==null ? legacyHit : '';
      row.actionType = normalizeMonsterActionType(row);
      row.range = normalizeMonsterActionRange(row);
      return row;
    }
    if(rawCols.length >= 6){
      const cols = splitMonsterLine(line, 6);
      const row = {name:cols[0], checkType:cols[1], target:cols[2], element:cols[3], power:cols[4], effect:cols[5]};
      row.baseValue=legacyHit!==null ? legacyHit : '';
      row.actionType = inferMonsterActionType(row);
      row.range = normalizeMonsterActionRange(row);
      return row;
    }
    const m = line.match(/^([^：:]+)[：:](.*)$/);
    const row = {name:m ? m[1].trim() : '', checkType:'', target:'', element:'物', power:'', effect:m ? m[2].trim() : line, baseValue:''};
    row.actionType = inferMonsterActionType(row);
    row.range = normalizeMonsterActionRange(row);
    return row;
  });
}
function serializeMonsterActions(rows){
  return (rows || []).map(r=>({
    name:String(r.name||'').trim(), actionType:normalizeMonsterActionType(r), range:normalizeMonsterActionRange(r), checkType:normalizeMonsterActionCheckType(r), target:String(r.target||'').trim(), element:String(r.element||'').trim(), power:String(r.power||'').trim(), effect:String(r.effect||'').trim(), baseValue:normalizeMonsterActionBaseValue(r.baseValue), flags:String(r.flags||'').trim()
  })).filter(r=>r.name || r.actionType || r.checkType || r.target || r.element || r.power || r.effect || r.flags)
    .map(r=>[r.name,r.actionType,r.checkType,r.target,r.element,r.power,r.effect,(r.checkType && r.checkType!=='なし') ? String(r.baseValue) : '',r.range,r.flags].join('\t')).join('\n');
}
function parseMonsterDrops(value){
  const raw = String(value || '').trim();
  if(!raw) return [];
  try{
    const arr = JSON.parse(raw);
    if(Array.isArray(arr)) return arr.map(r=>normalizeMonsterDropRow(r));
  }catch(e){}
  return raw.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    const rawCols = String(line || '').split('\t');
    if(line.includes('\t')){
      if(rawCols.length >= 6) return normalizeMonsterDropRow({materialType:rawCols[0], materialCategory:rawCols[1], itemId:rawCols[2], itemName:rawCols[3], rate:rawCols[4], count:rawCols[5]});
      const cols = splitMonsterLine(line, 4);
      return normalizeMonsterDropRow({itemId:cols[0], itemName:cols[1], rate:cols[2], count:cols[3]});
    }
    const m = line.match(/^([^：:]+)[：:]?\s*([^（(]+)?[（(]?([^）)]*)?[）)]?$/);
    return normalizeMonsterDropRow({itemName:m ? m[1].trim() : line, rate:m && m[2] ? m[2].trim() : '', count:m && m[3] ? m[3].trim() : ''});
  });
}
function normalizeMonsterDropRow(row={}){
  const out = {
    materialType:canonicalMaterialTypeName(row.materialType || row.type || ''),
    materialCategory:String(row.materialCategory || row.category || '').trim(),
    itemId:String(row.itemId || row.id || '').trim(),
    itemName:String(row.itemName || row.name || '').trim(),
    rate:String(row.rate || '').trim(),
    count:String(row.count || '').trim()
  };
  const matched = findMaterialForDrop(out);
  if(matched){
    // ドロップ元ではなく、選択された素材マスター自身の分類を正とする。
    // 魔物が採取素材・特殊素材を落とす場合も、それぞれの分類を維持する。
    out.materialType = canonicalMaterialTypeName(matched.materialType);
    out.materialCategory = String(matched.materialCategory || '').trim();
    out.itemId = String(matched.id || matched.name || out.itemId || '').trim();
    out.itemName = String(matched.name || out.itemName || out.itemId || '').trim();
  }
  return out;
}
function serializeMonsterDrops(rows){
  return (rows || []).map(normalizeMonsterDropRow)
    .filter(r=>r.materialType || r.materialCategory || r.itemId || r.itemName || r.rate || r.count)
    .map(r=>[r.materialType,r.materialCategory,r.itemId,r.itemName,r.rate,r.count].join('\t')).join('\n');
}
function materialRowsForDrop(materialType='', materialCategory=''){
  const type = canonicalMaterialTypeName(materialType);
  const category = String(materialCategory || '').trim();
  return (state.items || []).filter(r=>{
    if(String(r.dataKind || '').trim() !== '素材') return false;
    const mt = canonicalMaterialTypeName(r.materialType);
    const mc = String(r.materialCategory || '').trim();
    if(type && mt !== type) return false;
    if(category && mc !== category) return false;
    return mt === '魔物素材' || mt === '採取素材' || type || category;
  });
}
function findMaterialForDrop(row={}){
  const id = String(row.itemId || '').trim();
  const name = String(row.itemName || '').trim();
  const type = canonicalMaterialTypeName(row.materialType);
  const category = String(row.materialCategory || '').trim();
  const rows = materialRowsForDrop(type, category);
  return rows.find(r=>id && String(r.id || r.name || '').trim() === id)
    || rows.find(r=>name && String(r.name || '').trim() === name)
    || (state.items || []).find(r=>String(r.dataKind || '').trim() === '素材' && id && String(r.id || r.name || '').trim() === id)
    || (state.items || []).find(r=>String(r.dataKind || '').trim() === '素材' && name && String(r.name || '').trim() === name)
    || null;
}
function materialTypeOptionsForDrop(current=''){
  const set = new Set(['魔物素材','採取素材']);
  (state.items || []).forEach(r=>{ if(String(r.dataKind || '').trim()==='素材'){ const type=canonicalMaterialTypeName(r.materialType); if(type) set.add(type); } });
  const currentType=canonicalMaterialTypeName(current);
  if(currentType) set.add(currentType);
  return [...set].filter(Boolean);
}
function materialCategoryOptionsForDrop(materialType='', current=''){
  const type = canonicalMaterialTypeName(materialType);
  const set = new Set();
  (state.material_categories || []).forEach(r=>{ if(!type || canonicalMaterialTypeName(r.materialType) === type) { const v=String(r.name || '').trim(); if(v) set.add(v); } });
  (state.items || []).forEach(r=>{ if(String(r.dataKind || '').trim()==='素材' && (!type || canonicalMaterialTypeName(r.materialType)===type)){ const v=String(r.materialCategory || '').trim(); if(v) set.add(v); } });
  if(current) set.add(current);
  return [...set].filter(Boolean).sort((a,b)=>compareValues(a,b));
}
function monsterMaterialRows(){
  return materialRowsForDrop('','').filter(r=>['魔物素材','採取素材'].includes(canonicalMaterialTypeName(r.materialType)));
}
function optionHtml(values, current, empty='未選択'){
  const cur = String(current || '');
  const list = [...values];
  if(cur && !list.includes(cur)) list.unshift(cur);
  return `<option value="">${escapeHtml(empty)}</option>` + list.map(v=>`<option value="${escapeHtml(v)}" ${v===cur?'selected':''}>${escapeHtml(v)}</option>`).join('');
}
function monsterActionRowHtml(row={}, idx=0){
  const hasCheck=String(row.checkType||'').trim() && String(row.checkType||'').trim()!=='なし';
  const baseValue=normalizeMonsterActionBaseValue(row.baseValue);
  return `<div class="monster-line-row" data-monster-action-row>
    <input data-monster-action-field="name" value="${escapeHtml(row.name||'')}" placeholder="行動名">
    <select data-monster-action-field="actionType">${optionHtml(MONSTER_ACTION_TYPE_VALUES, normalizeMonsterActionType(row), '行動種別')}</select>
    <select data-monster-action-field="range">${optionHtml(MONSTER_ACTION_RANGE_VALUES, normalizeMonsterActionRange(row), '距離')}</select>
    <input data-monster-action-field="flags" value="${escapeHtml(row.flags||'')}" placeholder="行動フラグ（例：妨害不可）">
    ${checkBuilderHtml(row.checkType, 'data-monster-action-field="checkType"', {key:'monsters', row})}
    <input type="number" min="0" step="1" data-monster-action-field="baseValue" title="この行動固有の基礎技能値。妨害・バフ等は{補正}へ後から加算します。" value="${hasCheck ? escapeHtml(baseValue) : ''}" placeholder="基礎値" ${hasCheck?'':'disabled'}>
    <input data-monster-action-field="target" value="${escapeHtml(row.target||'')}" placeholder="対象">
    <select data-monster-action-field="element">${optionHtml(ELEMENT_VALUES, row.element || '物')}</select>
    <input data-monster-action-field="power" value="${escapeHtml(row.power||'')}" placeholder="威力">
    <input data-monster-action-field="effect" value="${escapeHtml(row.effect||'')}" placeholder="効果">
    <button type="button" class="ghost" data-monster-action-remove>削除</button>
  </div>`;
}
function monsterDropRowHtml(row={}, idx=0){
  const normalized = normalizeMonsterDropRow(row);
  const uid = 'monsterMaterial_' + Math.random().toString(36).slice(2);
  const typeOptions = optionHtml(materialTypeOptionsForDrop(normalized.materialType), normalized.materialType, '大カテゴリ');
  const categoryOptions = optionHtml(materialCategoryOptionsForDrop(normalized.materialType, normalized.materialCategory), normalized.materialCategory, '小カテゴリ');
  const materials = materialRowsForDrop(normalized.materialType, normalized.materialCategory);
  const listOptions = materials.map(m=>{
    const id = String(m.id || m.name || '').trim();
    const name = String(m.name || id).trim();
    return `<option value="${escapeHtml(name)}" data-id="${escapeHtml(id)}"></option>`;
  }).join('');
  return `<div class="monster-line-row" data-monster-drop-row>
    <select data-monster-drop-field="materialType">${typeOptions}</select>
    <select data-monster-drop-field="materialCategory">${categoryOptions}</select>
    <input data-monster-drop-field="itemName" list="${uid}" value="${escapeHtml(normalized.itemName)}" placeholder="素材名を検索">
    <datalist id="${uid}" data-monster-material-list>${listOptions}</datalist>
    <input type="hidden" data-monster-drop-field="itemId" value="${escapeHtml(normalized.itemId)}">
    <input data-monster-drop-field="rate" value="${escapeHtml(normalized.rate)}" placeholder="確率">
    <input data-monster-drop-field="count" value="${escapeHtml(normalized.count)}" placeholder="個数">
    <button type="button" class="ghost" data-monster-drop-remove>削除</button>
  </div>`;
}
function monsterActionsEditor(value){
  const rows = parseMonsterActions(value);
  const body = rows.length ? rows.map(monsterActionRowHtml).join('') : monsterActionRowHtml({element:'物'});
  return `<div class="monster-line-editor" data-monster-actions-editor><textarea data-form-field="actions" class="hidden-monster-raw internal-raw-field" hidden aria-hidden="true" tabindex="-1" style="display:none!important">${escapeHtml(serializeMonsterActions(rows))}</textarea><div class="form-help">行動は1行動ずつ入力します。通常魔物は役割に必要な数だけ登録し、選択可能な行動が4個以上なら遭遇時に3個だけ選出します。3個なら全て使用します。ただし「固定選出技」に指定した0～2技は必ず採用し、残り枠だけをランダム選出します。固有パッシブが特定行動を参照する場合も必須枠として扱います。二つ名個体も役割に必要な数だけ登録し、3～4個なら全て使用します。選択可能な行動が5個以上なら遭遇時に4個だけ選出できます。ボスは4個固定です。固有パッシブは技数に含めません。エリアボスは、前衛が残っていても後衛へ直接ダメージを与えられる行動を最低1つ必ず持たせます。判定を行う行動には、その行動固有の基礎技能値を0以上の整数で設定します。判定式は「2D6+基礎技能値+{補正}>=回避値/抵抗値/固定値」です。{補正}には妨害-2、行動・パッシブによる一時的な強化など、戦闘中に変動する補正だけを加算します。防御・補助・回復も自動成功にはせず、基礎技能値を使う固定値判定を設定します。直接ダメージ式はD6を必ず含め、最大構成はxD6+yD2～D5+z、補助ダイス個数y<=D6個数x、固定値zは0以上です。条件成立時の追加ダメージや継続ダメージは基礎式制限から除外します。行動種別は近接攻撃・遠距離攻撃・防御・補助・回復・特殊から選択します。術式・祈祷は魔物の行動種別には使用しません。直接ダメージを与える行動は近接攻撃または遠距離攻撃、敵へ状態異常・弱体だけを与える行動は特殊、自身・味方の能力を変える行動は補助、自身・味方を回復する行動は回復です。距離は行動種別とは別軸で近距離・遠距離・自身を指定します。近距離は敵前衛のみ、遠距離は敵前衛・敵後衛を対象にできます。近接攻撃は行動時に前衛へ移動します。遠距離攻撃は自身以外の味方前衛がいる場合は後衛へ移動し、いない場合は前衛で行動します。防御・補助・回復・特殊は原則その場で処理し、自身以外の味方前衛がいない場合だけ前衛へ移動します。前衛限定の遠距離攻撃は『距離：近距離／対象：敵○体』で表現し、距離：遠距離と対象：敵前衛○体を重複させません。重複狙い可能な多段攻撃は対象を『敵1体×2回』『敵1体×3回』のように表記します。各回で対象を選び直せるため、同じPCへ集中しても別々のPCへ振り分けても構いません。 効果欄には通常成功を示す「成功時：」「命中時：」は付けず、効果本文だけを入力してください。</div><div class="monster-line-head action-head"><span>行動名</span><span>行動種別</span><span>距離</span><span>判定</span><span>基礎技能値</span><span>対象</span><span>属性</span><span>威力</span><span>効果</span><span></span></div><div data-monster-action-list>${body}</div><button type="button" class="secondary" data-monster-action-add>行動を追加</button></div>`;
}
function monsterDropsEditor(value){
  const rows = parseMonsterDrops(value);
  const body = rows.length ? rows.map(monsterDropRowHtml).join('') : monsterDropRowHtml({});
  return `<div class="monster-line-editor" data-monster-drops-editor><textarea data-form-field="drops" class="hidden-monster-raw internal-raw-field" hidden aria-hidden="true" tabindex="-1" style="display:none!important">${escapeHtml(serializeMonsterDrops(rows))}</textarea><div class="form-help">ドロップは1行ずつ入力します。大カテゴリ・小カテゴリで絞り込み、素材名は検索入力できます。</div><div class="monster-line-head drop-head"><span>大カテゴリ</span><span>小カテゴリ</span><span>素材名</span><span>確率</span><span>個数</span><span></span></div><div data-monster-drop-list>${body}</div><button type="button" class="secondary" data-monster-drop-add>ドロップを追加</button></div>`;
}
function readMonsterActionRows(editor){
  return Array.from(editor.querySelectorAll('[data-monster-action-row]')).map(row=>{
    const get=f=>row.querySelector(`[data-monster-action-field="${f}"]`)?.value || '';
    return {name:get('name'), actionType:get('actionType'), range:get('range'), flags:get('flags'), checkType:get('checkType'), baseValue:get('baseValue'), target:get('target'), element:get('element'), power:get('power'), effect:get('effect')};
  });
}
function readMonsterDropRows(editor){
  return Array.from(editor.querySelectorAll('[data-monster-drop-row]')).map(row=>{
    const get=f=>row.querySelector(`[data-monster-drop-field="${f}"]`)?.value || '';
    const type = get('materialType');
    const category = get('materialCategory');
    const itemName = get('itemName');
    const matched = findMaterialForDrop({materialType:type, materialCategory:category, itemName});
    const itemId = matched ? String(matched.id || matched.name || '').trim() : get('itemId');
    const hidden = row.querySelector('[data-monster-drop-field="itemId"]');
    if(hidden) hidden.value = itemId;
    return normalizeMonsterDropRow({materialType:type, materialCategory:category, itemId, itemName, rate:get('rate'), count:get('count')});
  });
}
function syncMonsterActionEditor(editor){
  editor.querySelectorAll('[data-monster-action-row]').forEach(row=>{
    const check=row.querySelector('[data-monster-action-field="checkType"]')?.value||'';
    const base=row.querySelector('[data-monster-action-field="baseValue"]');
    if(base){ const enabled=!!check && check!=='なし'; base.disabled=!enabled; if(!enabled) base.value=''; }
  });
  const hidden = editor.querySelector('[data-form-field="actions"]');
  if(hidden) hidden.value = serializeMonsterActions(readMonsterActionRows(editor));
}
function syncMonsterDropEditor(editor){
  const hidden = editor.querySelector('[data-form-field="drops"]');
  if(hidden) hidden.value = serializeMonsterDrops(readMonsterDropRows(editor));
}
function syncAllMonsterEditors(){
  document.querySelectorAll('[data-monster-actions-editor]').forEach(syncMonsterActionEditor);
  document.querySelectorAll('[data-monster-drops-editor]').forEach(syncMonsterDropEditor);
}


function getNumFromText(text, fallback=0){
  const m = String(text ?? '').match(/-?\d+(?:\.\d+)?/);
  const n = m ? Number(m[0]) : NaN;
  return Number.isFinite(n) ? n : fallback;
}
const QUEST_PROGRESS_STEPS = ['1%','5%','10%','20%','25%','50%','100%'];
function normalizeQuestProgressStep(value){
  const n = getNumFromText(value, 25);
  const allowed = [1,5,10,20,25,50,100];
  return allowed.includes(n) ? n : 25;
}
function questProgressStepSelect(value){
  const current = `${normalizeQuestProgressStep(value)}%`;
  return `<select class="quest-progress-select" data-form-field="progressStep">${QUEST_PROGRESS_STEPS.map(v=>`<option value="${escapeHtml(v)}" ${v===current?'selected':''}>${escapeHtml(v)}ずつ上昇</option>`).join('')}</select>`;
}
function questFixedEventPercentOptions(stepValue, currentValue=''){
  const step = normalizeQuestProgressStep(stepValue);
  const nums = [0];
  for(let n=step; n<=100; n+=step) nums.push(n);
  if(!nums.includes(100)) nums.push(100);
  const cur = getNumFromText(currentValue, NaN);
  if(Number.isFinite(cur) && cur >= 0 && cur <= 100 && !nums.includes(cur)) nums.unshift(cur);
  return [...new Set(nums)].sort((a,b)=>a-b);
}
function parseQuestFixedEventsEditor(value){
  const raw = String(value || '').trim();
  if(!raw) return [];
  try{
    const arr = JSON.parse(raw);
    if(Array.isArray(arr)) return arr.map((r,i)=>({
      progress: String(r.progress ?? r.percent ?? r.fixedThreshold ?? '').replace(/%$/,'') + (String(r.progress ?? r.percent ?? r.fixedThreshold ?? '').trim().endsWith('%')?'':'%'),
      title: String(r.title ?? r.eventName ?? r.name ?? `固定イベント${i+1}`).trim(),
      detail: String(r.detail ?? r.result ?? r.description ?? '').trim()
    }));
  }catch(e){}
  return raw.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map((line,idx)=>{
    let parts=line.split('\t');
    if(parts.length<3) parts=line.split(/[｜|]/);
    if(parts.length<3) parts=line.split(/\s*,\s*/);
    const progress = String(parts[0] || '').trim();
    return {
      progress: progress.endsWith('%') ? progress : `${getNumFromText(progress, 0)}%`,
      title: String(parts[1] || `固定イベント${idx+1}`).trim(),
      detail: String(parts.slice(2).join(' / ') || '').trim()
    };
  });
}
function serializeQuestFixedEvents(rows){
  return (rows || []).map(r=>{
    const n = getNumFromText(r.progress, NaN);
    const progress = Number.isFinite(n) ? `${Math.max(0, Math.min(100, n))}%` : String(r.progress||'').trim();
    return {progress, title:String(r.title||'').trim(), detail:String(r.detail||'').trim()};
  }).filter(r=>r.progress || r.title || r.detail)
    .sort((a,b)=>getNumFromText(a.progress,999)-getNumFromText(b.progress,999))
    .map(r=>`${r.progress}\t${r.title || '固定イベント'}\t${r.detail}`)
    .join('\n');
}
function questFixedEventSummary(row, idx){
  const p = String(row.progress || '').trim() || '未設定%';
  const t = String(row.title || '').trim() || `固定イベント${idx+1}`;
  const d = String(row.detail || '').trim();
  const short = d ? d.slice(0,42) + (d.length>42 ? '…' : '') : '内容未入力';
  return `<span>${escapeHtml(p)}　${escapeHtml(t)}</span><span class="quest-event-mini"><b>内容</b>${escapeHtml(short)}</span>`;
}
function questFixedEventRowHtml(row={}, stepValue='25%', idx=0){
  const progress = String(row.progress || '').trim() || `${normalizeQuestProgressStep(stepValue)}%`;
  const opts = questFixedEventPercentOptions(stepValue, progress).map(n=>`${n}%`);
  const current = progress.endsWith('%') ? progress : `${getNumFromText(progress, normalizeQuestProgressStep(stepValue))}%`;
  const optionHtmls = opts.map(v=>`<option value="${escapeHtml(v)}" ${v===current?'selected':''}>${escapeHtml(v)}</option>`).join('');
  const openAttr = (!String(row.title||'').trim() && !String(row.detail||'').trim()) ? ' open' : '';
  return `<details class="quest-event-row" data-quest-fixed-event-row${openAttr}>
    <summary data-quest-fixed-event-summary>${questFixedEventSummary({progress:current,title:row.title,detail:row.detail}, idx)}</summary>
    <div class="quest-event-body">
      <div class="quest-event-grid">
        <div class="field"><label>発生進行度</label><select data-quest-fixed-field="progress">${optionHtmls}</select></div>
        <div class="field"><label>イベント名</label><input data-quest-fixed-field="title" value="${escapeHtml(row.title||'')}" placeholder="採取確認地点"></div>
        <div class="field wide"><label>内容</label><textarea data-quest-fixed-field="detail" placeholder="発生内容・処理・戦闘内容など">${escapeHtml(row.detail||'')}</textarea></div>
      </div>
      <div class="quest-event-actions"><button type="button" class="ghost" data-quest-fixed-event-remove>削除</button></div>
    </div>
  </details>`;
}
function nextQuestFixedEventPercent(rows, stepValue){
  const step = normalizeQuestProgressStep(stepValue);
  const used = new Set((rows||[]).map(r=>getNumFromText(r.progress, NaN)).filter(Number.isFinite));
  if(!used.has(0)) return '0%';
  for(let n=step;n<=100;n+=step){ if(!used.has(n)) return `${n}%`; }
  return '100%';
}
function questFixedEventsEditor(value, rowContext={}){
  const step = rowContext.progressStep || currentFormValue('progressStep') || '25%';
  const rows = parseQuestFixedEventsEditor(value);
  const body = rows.map((r,i)=>questFixedEventRowHtml(r, step, i)).join('');
  return `<div class="quest-event-editor" data-quest-fixed-events-editor>
    <textarea data-form-field="fixedEvents" class="hidden-quest-fixed-raw">${escapeHtml(serializeQuestFixedEvents(rows))}</textarea>
    <div class="form-help">固定で発生させたい進行区切りだけ登録します。固定イベントを置かない区切り（0%を含む）は対象エリアのランダムイベントを使います。発生進行度は区切りに合わせて選択できます。</div>
    <div class="quest-event-list" data-quest-fixed-event-list>${body || '<div class="muted small" data-quest-fixed-empty>固定イベントはまだありません。</div>'}</div>
    <button type="button" class="secondary" data-quest-fixed-event-add>固定イベントを追加</button>
  </div>`;
}
function readQuestFixedEventRows(editor){
  return Array.from(editor.querySelectorAll('[data-quest-fixed-event-row]')).map(row=>{
    const get=f=>row.querySelector(`[data-quest-fixed-field="${f}"]`)?.value || '';
    return {progress:get('progress'), title:get('title'), detail:get('detail')};
  });
}
function syncQuestFixedEventSummaries(editor){
  Array.from(editor.querySelectorAll('[data-quest-fixed-event-row]')).forEach((row,idx)=>{
    const get=f=>row.querySelector(`[data-quest-fixed-field="${f}"]`)?.value || '';
    const summary=row.querySelector('[data-quest-fixed-event-summary]');
    if(summary) summary.innerHTML=questFixedEventSummary({progress:get('progress'), title:get('title'), detail:get('detail')}, idx);
  });
}
function syncQuestFixedEventsEditor(editor){
  const hidden = editor.querySelector('[data-form-field="fixedEvents"]');
  if(hidden) hidden.value = serializeQuestFixedEvents(readQuestFixedEventRows(editor));
  syncQuestFixedEventSummaries(editor);
}
function refreshQuestFixedEventPercentOptions(editor){
  const rows = readQuestFixedEventRows(editor);
  const step = currentFormValue('progressStep') || '25%';
  const list = editor.querySelector('[data-quest-fixed-event-list]');
  if(list) list.innerHTML = rows.length ? rows.map((r,i)=>questFixedEventRowHtml(r, step, i)).join('') : '<div class="muted small" data-quest-fixed-empty>固定イベントはまだありません。</div>';
  syncQuestFixedEventsEditor(editor);
}
function syncAllQuestFixedEventEditors(){
  document.querySelectorAll('[data-quest-fixed-events-editor]').forEach(syncQuestFixedEventsEditor);
}

const MODIFIER_TARGET_OPTIONS = [
  ['ability:body','能力：体力'], ['ability:dexterity','能力：器用'], ['ability:sense','能力：感覚'], ['ability:intellect','能力：知性'], ['ability:will','能力：意志'], ['ability:charm','能力：魅力'],
  ['hit','命中（装備種別に応じて近接/射撃）'], ['skill:melee','技能：近接'], ['skill:shoot','技能：射撃'], ['skill:guard','技能：防御'], ['skill:evade','技能：回避'], ['skill:resist','技能：抵抗'], ['skill:craft','技能：細工'],
  ['combat:defense','戦闘：防御値'], ['combat:guardAction','戦闘：防御行動値'], ['combat:evasion','戦闘：回避値'], ['skill:detect','技能：感知'], ['resource:maxHp','最大HP'], ['resource:maxMp','最大MP'],
  ['damage:melee','装飾品：近接ダメージ'], ['damage:alchemyAttack','装飾品：攻撃調合品ダメージ'], ['damage:trap','装飾品：罠ダメージ'], ['healing:alchemy','装飾品：回復調合品回復量']
];
function adminModifierTargetOptions(selected=''){
  const groups=[
    ['能力', [
      ['ability:body','体力'], ['ability:dexterity','器用'], ['ability:sense','感覚'], ['ability:intellect','知性'], ['ability:will','意志'], ['ability:charm','魅力']
    ]],
    ['技能', [
      ['skill:athletics','運動'], ['skill:force','力業'], ['skill:melee','近接'], ['skill:guard','防御'],
      ['skill:gather','採取'], ['skill:craft','細工'], ['skill:shoot','射撃'], ['skill:operate','操作'],
      ['skill:search','探索'], ['skill:detect','感知'], ['skill:evade','回避'], ['skill:track','追跡'],
      ['skill:alchemy','調合'], ['skill:appraise','鑑定'], ['skill:knowledge','知識'], ['skill:design','設計'],
      ['skill:resist','抵抗'], ['skill:focus','集中'], ['skill:magic','魔法'], ['skill:prayer','祈祷'],
      ['skill:negotiate','交渉'], ['skill:service','共感'], ['skill:art','社交'], ['skill:leadership','鼓舞']
    ]],
    ['戦闘', [
      ['hit','命中'], ['combat:defense','防御値'], ['combat:guardAction','防御行動値'], ['combat:evasion','回避値']
    ]],
    ['リソース', [
      ['resource:maxHp','最大HP'], ['resource:maxMp','最大MP']
    ]],
    ['装飾品固有補正', [
      ['damage:melee','近接ダメージ'], ['damage:alchemyAttack','攻撃調合品ダメージ'], ['damage:trap','罠ダメージ'], ['healing:alchemy','回復調合品回復量']
    ]]
  ];
  let html='<option value="">選択してください</option>';
  for(const [label, items] of groups){
    html += `<optgroup label="${escapeHtml(label)}">`;
    for(const [value, name] of items) html += `<option value="${escapeHtml(value)}"${value===selected?' selected':''}>${escapeHtml(name)}</option>`;
    html += '</optgroup>';
  }
  return html;
}

function adminModifierTargetDisplayName(target=''){
  const key=normalizeModifierTargetAlias(target);
  const names={
    'hit':'命中','combat:defense':'防御','combat:guardAction':'防御行動値','combatGuardAction':'防御行動値','guardAction':'防御行動値','combat:evasion':'回避','skill:detect':'感知','combat:initiative':'感知',
    'resource:maxHp':'最大HP','resource:maxMp':'最大MP','damage:melee':'近接ダメージ','damage:alchemyAttack':'攻撃調合品ダメージ','damage:trap':'罠ダメージ','healing:alchemy':'回復調合品回復量',
    'ability:body':'体力','ability:dexterity':'器用','ability:sense':'感覚','ability:intellect':'知性','ability:will':'意志','ability:charm':'魅力',
    'skill:athletics':'運動','skill:force':'力業','skill:melee':'近接','skill:guard':'防御',
    'skill:gather':'採取','skill:craft':'細工','skill:shoot':'射撃','skill:operate':'操作',
    'skill:search':'探索','skill:evade':'回避','skill:track':'追跡',
    'skill:alchemy':'調合','skill:appraise':'鑑定','skill:knowledge':'知識','skill:design':'設計',
    'skill:resist':'抵抗','skill:focus':'集中','skill:magic':'魔法','skill:prayer':'祈祷',
    'skill:negotiate':'交渉','skill:service':'共感','skill:art':'社交','skill:leadership':'鼓舞',
    'skill:throw':'投擲','skill:empathy':'共感','skill:social':'社交','skill:encourage':'鼓舞'
  };
  return names[key] || key;
}
function adminModifierDisplayText(value=''){
  return parseModifierEditorRows(value).map(row=>`${adminModifierTargetDisplayName(row.target)} ${String(row.value||'')}`).filter(Boolean).join(' / ');
}

function normalizeModifierEditorRow(row={}){
  const target=normalizeModifierTargetAlias(row.target||row.key||row.name||'');
  const value=String(row.value??row.mod??row.amount??'').trim();
  return target||value ? {target,value} : null;
}
function parseModifierEditorRows(value){
  if(Array.isArray(value)) return value.map(normalizeModifierEditorRow).filter(Boolean);
  const raw=String(value||'').trim();
  if(!raw) return [];
  try{ const arr=JSON.parse(raw); if(Array.isArray(arr)) return arr.map(normalizeModifierEditorRow).filter(Boolean); }catch(e){}
  return raw.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    let parts=line.split('\t'); if(parts.length<2) parts=line.split(/[｜|]/); if(parts.length<2) parts=line.split(/\s*,\s*/);
    return normalizeModifierEditorRow({target:parts[0]||'', value:parts[1]||''});
  }).filter(Boolean);
}
function serializeModifierEditorRows(rows){ return (rows||[]).map(normalizeModifierEditorRow).filter(Boolean).map(r=>`${r.target}\t${r.value}`).join('\n'); }

function normalizeModifierTargetAlias(target=''){
  const raw=String(target||'').trim();
  const aliases={
    '命中':'hit','命中補正':'hit','hitMod':'hit','hit':'hit',
    '常時防御':'combat:defense','防御値':'combat:defense','防御':'combat:defense','alwaysDefense':'combat:defense','defense':'combat:defense',
    '防御行動':'combat:guardAction','防御行動値':'combat:guardAction','guardValue':'combat:guardAction','guard':'combat:guardAction',
    '回避':'skill:evade','回避補正':'skill:evade','evasionMod':'skill:evade','evade':'skill:evade',
    '知識':'skill:knowledge',
    'monsterKnowledge':'skill:knowledge','materialKnowledge':'skill:knowledge','elementKnowledge':'skill:knowledge',
    'skill:monsterKnowledge':'skill:knowledge','skill:materialKnowledge':'skill:knowledge','skill:elementKnowledge':'skill:knowledge',
    '体力':'ability:body','器用':'ability:dexterity','感覚':'ability:sense','知性':'ability:intellect','意志':'ability:will','魅力':'ability:charm',
    '最大HP':'resource:maxHp','HP':'resource:maxHp','最大MP':'resource:maxMp','MP':'resource:maxMp','先制':'skill:detect','先制値':'skill:detect','combat:initiative':'skill:detect','鍛冶':'skill:craft','細工':'skill:craft',
    '近接ダメージ':'damage:melee','攻撃調合品ダメージ':'damage:alchemyAttack','罠ダメージ':'damage:trap','回復調合品回復量':'healing:alchemy'
  };
  if(/^知識[:：]/.test(raw)) return 'skill:knowledge';
  return aliases[raw] || raw;
}
function isZeroModifierText(value){ return /^[+-]?0$/.test(String(value||'').trim()); }
function legacyModifierRowsFromRow(row={}){
  const first=(...keys)=>{ for(const key of keys){ const v=row && row[key]; if(v!==undefined && v!==null && String(v).trim()!=='') return String(v).trim(); } return ''; };
  const rows=[];
  const hit=first('hitMod','hit'); if(hit && !isZeroModifierText(hit)) rows.push({target:'hit', value:hit});
  const defense=first('alwaysDefense','defense'); if(defense && !isZeroModifierText(defense)) rows.push({target:'combat:defense', value:defense});
  const guard=first('guardValue','guard'); if(guard && !isZeroModifierText(guard)) rows.push({target:'combat:guardAction', value:guard});
  const evade=first('evasionMod','evade'); if(evade && !isZeroModifierText(evade)) rows.push({target:'skill:evade', value:evade});
  return rows;
}
function mergeModifierEditorRows(existing=[], legacy=[]){
  const out=[]; const seen=new Set();
  for(const row of [...(existing||[]), ...(legacy||[])]){
    const r=normalizeModifierEditorRow(row); if(!r) continue;
    const key=`${r.target}\t${r.value}`;
    if(seen.has(key)) continue;
    out.push(r); seen.add(key);
  }
  return out;
}
function migrateLegacyModifierFields(row={}){
  const out={...(row||{})};
  out.modifiers = serializeModifierEditorRows(mergeModifierEditorRows(parseModifierEditorRows(out.modifiers || out.modifierRows || out.bonuses || ''), legacyModifierRowsFromRow(out)));
  return out;
}

function equipmentCategoryModifierTextForItemRow(row={}, allData=state){
  const category = String(row.itemCategory || row.category || row.type || '').trim();
  if(!category) return '';
  const cats = (allData && allData.equipment_categories) || [];
  const found = cats.find(c => String(c.name || '').trim() === category || String(c.itemCategory || '').trim() === category);
  if(!found) return '';
  const migrated = migrateLegacyModifierFields(found);
  return migrated.modifiers || '';
}
function canonicalWeaponUsageSkill(row={}){
  const category=String(row.itemCategory || row.category || row.type || '').trim();
  if(['弓','クロスボウ','ヘヴィクロスボウ'].includes(category)) return '射撃';
  if(category==='魔導書') return '魔法';
  if(category==='祈祷書') return '祈祷';
  return '近接';
}
function ensureItemModifierFromCategory(row={}, allData=state){
  const out=migrateLegacyModifierFields(row || {});
  if(String(out.itemType || '').trim()==='武器'){
    out.skill=canonicalWeaponUsageSkill(out);
    out.checkType='';
  }
  if(!String(out.modifiers || '').trim()){
    const fallback = equipmentCategoryModifierTextForItemRow(out, allData);
    if(String(fallback || '').trim()) out.modifiers = fallback;
  }
  return out;
}
function ensureItemCategoryModifiersInData(dataObj){
  if(!dataObj || !Array.isArray(dataObj.items)) return dataObj;
  dataObj.items = dataObj.items.map(row => ensureItemModifierFromCategory(row, dataObj));
  return dataObj;
}


function modifierEditorRowHtml(row={}, idx=0){
  const r=normalizeModifierEditorRow(row)||{target:'',value:''};
  return `<div class="monster-action-row" data-modifier-row>
    <div class="field"><select aria-label="補正" data-modifier-field="target">${adminModifierTargetOptions(r.target)}</select></div>
    <div class="field"><input aria-label="補正値" data-modifier-field="value" value="${escapeHtml(r.value)}" placeholder="例：+1 / -1"></div>
    <div class="field"><button type="button" class="ghost" data-modifier-remove>削除</button></div>
  </div>`;
}
function modifierRowsEditor(value){
  const rows=parseModifierEditorRows(value);
  return `<div class="monster-actions-editor" data-modifier-editor>
    <textarea data-form-field="modifiers" class="hidden-monster-raw internal-raw-field" hidden aria-hidden="true" tabindex="-1" style="display:none!important">${escapeHtml(serializeModifierEditorRows(rows))}</textarea>
    <div class="form-help">補正値を1行ずつ登録します。</div>
    <div data-modifier-list>${rows.length ? rows.map(modifierEditorRowHtml).join('') : '<div class="muted small" data-modifier-empty>補正値はまだありません。</div>'}</div>
    <button type="button" class="secondary" data-modifier-add>補正値を追加</button>
  </div>`;
}
function readModifierEditorRows(editor){ return Array.from(editor.querySelectorAll('[data-modifier-row]')).map(row=>{
  const get=f=>row.querySelector(`[data-modifier-field="${f}"]`)?.value||'';
  return normalizeModifierEditorRow({target:get('target'), value:get('value')});
}).filter(Boolean); }
function syncModifierEditor(editor){ const hidden=editor?.querySelector('[data-form-field="modifiers"]'); if(hidden) hidden.value=serializeModifierEditorRows(readModifierEditorRows(editor)); }
function syncAllModifierEditors(){ document.querySelectorAll('[data-modifier-editor]').forEach(syncModifierEditor); }

function adminEquipmentEffectRowHtml(row={}, idx=0){
  const e=normalizeAdminEquipmentEffect(row)||{name:'',summary:'',detail:''};
  return `<div class="monster-action-row" data-equipment-effect-row style="grid-template-columns:minmax(150px,.65fr) minmax(220px,1fr) minmax(320px,1.6fr) auto;align-items:start">
    <div class="field"><label>効果名</label><input data-equipment-effect-field="name" value="${escapeHtml(e.name)}" placeholder="例：枝王の茨"></div>
    <div class="field"><label>一覧用短文</label><input data-equipment-effect-field="summary" value="${escapeHtml(e.summary)}" placeholder="例：命中した敵へ継続ダメージを付与"></div>
    <div class="field"><label>詳細全文</label><textarea data-equipment-effect-field="detail" placeholder="プレイヤー詳細・チャットパレットへ出す全文">${escapeHtml(e.detail)}</textarea></div>
    <div class="field"><label>&nbsp;</label><button type="button" class="ghost" data-equipment-effect-remove>削除</button></div>
  </div>`;
}
function adminEquipmentEffectsEditor(value, fieldName='equipmentEffects'){
  const rows=parseAdminEquipmentEffects(value);
  const label=fieldName==='intrinsicEffects'?'武器種そのものが持つ能力です。装備個別の固有効果とは分けて表示されます。':'1効果＝1名称で登録します。一覧には短文、詳細とチャットパレットには全文を使います。';
  return `<div class="monster-actions-editor" data-equipment-effects-editor data-effect-field-name="${escapeHtml(fieldName)}">
    <textarea data-form-field="${escapeHtml(fieldName)}" class="hidden-monster-raw internal-raw-field" hidden aria-hidden="true" tabindex="-1" style="display:none!important">${escapeHtml(JSON.stringify(rows))}</textarea>
    <div class="form-help">${escapeHtml(label)}</div>
    <div data-equipment-effect-list>${rows.length?rows.map(adminEquipmentEffectRowHtml).join(''):'<div class="muted small" data-equipment-effect-empty>効果はまだありません。</div>'}</div>
    <button type="button" class="secondary" data-equipment-effect-add>効果を追加</button>
  </div>`;
}
function readAdminEquipmentEffectsEditor(editor){
  return Array.from(editor?.querySelectorAll('[data-equipment-effect-row]')||[]).map(row=>{
    const get=k=>row.querySelector(`[data-equipment-effect-field="${k}"]`)?.value??'';
    return normalizeAdminEquipmentEffect({name:get('name'),summary:get('summary'),detail:get('detail')});
  }).filter(Boolean);
}
function syncAdminEquipmentEffectsEditor(editor){
  const fieldName=editor?.dataset.effectFieldName||'equipmentEffects';
  const hidden=editor?.querySelector(`[data-form-field="${fieldName}"]`);
  if(hidden) hidden.value=JSON.stringify(readAdminEquipmentEffectsEditor(editor));
}
function syncAllAdminEquipmentEffectsEditors(){ document.querySelectorAll('[data-equipment-effects-editor]').forEach(syncAdminEquipmentEffectsEditor); }

function adminNamedProcessingEditor(value){
  const options=parseAdminNamedProcessingOptions(value);
  const o=options[0]||null;
  const hidden=escapeHtml(JSON.stringify(options));
  const field=(name,val='',placeholder='')=>`<div class="field"><label>${escapeHtml(name)}</label><input data-named-process-field="${escapeHtml(val.key||'')}" value="${escapeHtml(val.value??'')}" placeholder="${escapeHtml(placeholder)}"></div>`;
  const textarea=(name,key,val='')=>`<div class="field wide"><label>${escapeHtml(name)}</label><textarea data-named-process-field="${escapeHtml(key)}">${escapeHtml(val??'')}</textarea></div>`;
  const body=o?`<div data-named-process-body class="monster-action-row" style="grid-template-columns:repeat(2,minmax(0,1fr));align-items:start">
      <input type="hidden" data-named-process-field="id" value="${escapeHtml(o.id||'')}">
      <input type="hidden" data-named-process-field="areaKey" value="${escapeHtml(o.areaKey||'')}">
      <input type="hidden" data-named-process-field="areaName" value="${escapeHtml(o.areaName||'')}">
      <input type="hidden" data-named-process-field="applyKind" value="${escapeHtml(o.applyKind||'')}">
      <input type="hidden" data-named-process-field="applyTarget" value="${escapeHtml(o.applyTarget||'')}">
      <input type="hidden" data-named-process-field="applyBefore" value="${escapeHtml(o.applyBefore??'')}">
      <input type="hidden" data-named-process-field="applyAfter" value="${escapeHtml(o.applyAfter??'')}">
      ${field('対応二つ名',{key:'namedMonster',value:o.namedMonster||''},'例：坑声を裂くレゾナバット')}
      ${field('二つ名固有素材',{key:'material',value:o.material||''},'例：坑声共鳴骨')}
      ${field('製作技能',{key:'craftSkill',value:o.craftSkill||''},'例：鍛冶')}
      ${field('施設加工費G',{key:'facilityFeeG',value:o.facilityFeeG??''},'例：300')}
      ${field('難易度',{key:'difficulty',value:o.difficulty??''},'例：10')}
      ${textarea('加工前（全文）','fullBefore',o.fullBefore||o.before||'')}
      ${textarea('加工後（全文）','fullAfter',o.fullAfter||o.after||'')}
      ${textarea('必要素材','requiredMaterials',o.requiredMaterials||'')}
      <div class="field wide"><button type="button" class="ghost" data-named-process-remove>異名加工データを削除</button></div>
    </div>`:`<div class="muted small" data-named-process-empty>異名加工は未設定です。</div>`;
  return `<div class="monster-actions-editor" data-named-process-editor>
    <textarea data-form-field="namedProcessingOptions" class="hidden-monster-raw internal-raw-field" hidden aria-hidden="true" tabindex="-1" style="display:none!important">${hidden}</textarea>
    <div class="form-help">異名加工は1装備につき1種類まで。プレイヤー向けには加工前後の全文と必要素材のみを表示します。</div>
    <div data-named-process-list>${body}</div>
    ${o?'':'<button type="button" class="secondary" data-named-process-add>異名加工を追加</button>'}
  </div>`;
}
function readAdminNamedProcessingEditor(editor){
  const body=editor?.querySelector('[data-named-process-body]');
  if(!body) return [];
  const get=key=>body.querySelector(`[data-named-process-field="${key}"]`)?.value??'';
  const before=get('fullBefore'); const after=get('fullAfter');
  return [{
    id:get('id')||`named_process_${Date.now().toString(36)}`,
    namedMonster:get('namedMonster'), material:get('material'), changeLabel:'',
    before, after, fullBefore:before, fullAfter:after,
    requiredMaterials:get('requiredMaterials'), facilityFeeG:get('facilityFeeG'), difficulty:get('difficulty'), craftSkill:get('craftSkill'),
    areaKey:get('areaKey'), areaName:get('areaName'), applyKind:get('applyKind'), applyTarget:get('applyTarget'), applyBefore:get('applyBefore'), applyAfter:get('applyAfter')
  }];
}
function syncAdminNamedProcessingEditor(editor){
  const hidden=editor?.querySelector('[data-form-field="namedProcessingOptions"]');
  if(hidden) hidden.value=JSON.stringify(readAdminNamedProcessingEditor(editor));
}
function syncAllAdminNamedProcessingEditors(){ document.querySelectorAll('[data-named-process-editor]').forEach(syncAdminNamedProcessingEditor); }
