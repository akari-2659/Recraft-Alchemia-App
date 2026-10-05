function modifierTargetOptionsHtml(selected='') {
  const groups = [
    ['能力', [
      ['ability:body','体力'], ['ability:dexterity','器用'], ['ability:sense','感覚'], ['ability:intellect','知性'], ['ability:will','意志'], ['ability:charm','魅力']
    ]],
    ['技能', SKILL_CATEGORIES.flatMap(cat => cat.skills.map(sk => ['skill:' + sk.key, sk.name]))],
    ['戦闘', [
      ['hit','命中'], ['combat:defense','防御値'], ['combat:guardAction','防御行動値'], ['combat:evasion','回避値'], ['combat:resistance','抵抗値']
    ]],
    ['リソース', [
      ['resource:maxHp','最大HP'], ['resource:maxMp','最大MP']
    ]],
    ['装飾品固有補正', [
      ['damage:melee','近接ダメージ'], ['damage:alchemyAttack','攻撃調合品ダメージ'], ['damage:trap','罠ダメージ'], ['healing:alchemy','回復調合品回復量']
    ]]
  ];
  let html = '<option value="">選択してください</option>';
  for (const [label, items] of groups) {
    html += `<optgroup label="${esc(label)}">`;
    for (const [value, name] of items) html += `<option value="${esc(value)}"${value === selected ? ' selected' : ''}>${esc(name)}</option>`;
    html += '</optgroup>';
  }
  return html;
}

function modifierTargetDisplayName(target='') {
  const key = String(target || '').trim();
  if(!key) return '';
  if(key === 'hit') return '命中';
  if(key === 'combat:defense') return '防御値';
  if(key === 'combat:guardAction') return '防御行動値';
  if(key === 'combat:evasion') return '回避値';
  if(key === 'combat:resistance') return '抵抗値';
  if(key === 'combat:initiative') return '感知';
  if(key === 'resource:maxHp') return '最大HP';
  if(key === 'resource:maxMp') return '最大MP';
  if(key === 'damage:melee') return '近接ダメージ';
  if(key === 'damage:alchemyAttack') return '攻撃調合品ダメージ';
  if(key === 'damage:trap') return '罠ダメージ';
  if(key === 'healing:alchemy') return '回復調合品回復量';
  if(['skill:monsterKnowledge','skill:materialKnowledge','skill:elementKnowledge'].includes(key)) return '知識';
  if(key.startsWith('ability:')) return ABILITY_NAMES[key.replace('ability:', '')] || key;
  if(key.startsWith('skill:')) {
    const skill = SKILL_BY_KEY[key.replace('skill:', '')];
    return skill?.name || (key.replace('skill:', '') === 'knowledge' ? '知識' : key);
  }
  return key;
}
function modifierDisplayText(value='') {
  return parseModifierRows(value).map(row => `${modifierTargetDisplayName(row.target)} ${signedNumberText(row.value) || row.value}`).filter(Boolean).join(' / ');
}
function renderModifierReadOnly(listId, value='') {
  const list = $(listId);
  if (!list) return;
  const rows = parseModifierRows(value);
  list.innerHTML = rows.length
    ? rows.map(row => `<span class="pill">${esc(modifierTargetDisplayName(row.target))} ${esc(signedNumberText(row.value) || row.value)}</span>`).join(' ')
    : '<span class="pill empty">補正なし</span>';
}

function normalizeModifierRow(row={}) {
  const rawTarget = String(row.target || row.key || row.name || '').trim();
  const value = String(row.value ?? row.mod ?? row.amount ?? '').trim();
  const aliases = {
    '命中':'hit', '命中補正':'hit', 'hitMod':'hit', 'hit':'hit',
    '防御':'combat:defense', '防御値':'combat:defense', '常時防御':'combat:defense', '常時防御値':'combat:defense', 'alwaysDefense':'combat:defense', 'defense':'combat:defense',
    '回避値':'combat:evasion', '抵抗値':'combat:resistance',
    '回避':'skill:evade', '回避補正':'skill:evade', 'evasionMod':'skill:evade', 'evade':'skill:evade',
    '抵抗':'skill:resist', '抵抗補正':'skill:resist', 'resistanceMod':'skill:resist', 'resist':'skill:resist',
    '防御行動':'combat:guardAction', '防御行動値':'combat:guardAction', 'guardValue':'combat:guardAction', 'guard':'combat:guardAction',
    '知識':'skill:knowledge',
    'monsterKnowledge':'skill:knowledge', 'materialKnowledge':'skill:knowledge', 'elementKnowledge':'skill:knowledge',
    'skill:monsterKnowledge':'skill:knowledge', 'skill:materialKnowledge':'skill:knowledge', 'skill:elementKnowledge':'skill:knowledge',
    '体力':'ability:body', '器用':'ability:dexterity', '感覚':'ability:sense', '知性':'ability:intellect', '意志':'ability:will', '魅力':'ability:charm',
    '最大HP':'resource:maxHp', 'HP':'resource:maxHp', '最大MP':'resource:maxMp', 'MP':'resource:maxMp', '先制':'skill:detect', '先制値':'skill:detect', 'combat:initiative':'skill:detect',
    '近接ダメージ':'damage:melee', '攻撃調合品ダメージ':'damage:alchemyAttack', '罠ダメージ':'damage:trap', '回復調合品回復量':'healing:alchemy'
  };
  const target = /^知識[:：]/.test(rawTarget) ? 'skill:knowledge' : (aliases[rawTarget] || rawTarget);
  return target || value ? { target, value } : null;
}
function parseModifierRows(value) {
  if(Array.isArray(value)) return value.map(normalizeModifierRow).filter(Boolean);
  const raw = String(value || '').trim();
  if(!raw) return [];
  try{
    const parsed = JSON.parse(raw);
    if(Array.isArray(parsed)) return parsed.map(normalizeModifierRow).filter(Boolean);
  }catch(e){}
  return raw.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    let parts = line.split('\t');
    if(parts.length < 2) parts = line.split(/[｜|]/);
    if(parts.length < 2) parts = line.split(/\s*,\s*/);
    return normalizeModifierRow({ target: parts[0] || '', value: parts[1] || '' });
  }).filter(Boolean);
}
function serializeModifierRows(rows) {
  return (rows || []).map(normalizeModifierRow).filter(Boolean).map(r => `${r.target}\t${r.value}`).join('\n');
}
function mergeModifierRows(existing=[], legacy=[]){
  const out=[]; const seen=new Set();
  for(const row of [...(existing||[]), ...(legacy||[])]){
    const r=normalizeModifierRow(row); if(!r) continue;
    const key=`${r.target}\t${r.value}`;
    if(seen.has(key)) continue;
    out.push(r); seen.add(key);
  }
  return out;
}
function isZeroModifierText(value){ return /^[+-]?0$/.test(String(value||'').trim()); }
function legacyModifierRowsFromEquipment(item={}) {
  const first=(...keys)=>{ for(const key of keys){ const v=item && item[key]; if(v!==undefined && v!==null && String(v).trim()!=='') return String(v).trim(); } return ''; };
  const rows = [];
  const hit=first('hit','hitMod'); if(hit && !isZeroModifierText(hit)) rows.push({target:'hit', value:hit});
  const defense=first('defense','alwaysDefense'); if(defense && !isZeroModifierText(defense)) rows.push({target:'combat:defense', value:defense});
  const guard=first('guard','guardValue'); if(guard && !isZeroModifierText(guard)) rows.push({target:'combat:guardAction', value:guard});
  const evade=first('evade','evasionMod'); if(evade && !isZeroModifierText(evade)) rows.push({target:'skill:evade', value:evade});
  const resist=first('resist','resistanceMod'); if(resist && !isZeroModifierText(resist)) rows.push({target:'skill:resist', value:resist});
  return rows;
}
function migratedModifierTextForItem(item={}){
  return serializeModifierRows(mergeModifierRows(parseModifierRows(item.modifiers || item.modifierRows || item.bonuses || ''), legacyModifierRowsFromEquipment(item)));
}
function migrateLegacyEquipmentModifierFields(item={}) {
  const out={...(item||{})};
  out.modifiers = migratedModifierTextForItem(out);
  return out;
}

function presetModifierTextForType(type='') {
  const preset = EQUIPMENT_PRESETS[normalizeEquipmentType(type || 'なし')] || null;
  return preset ? migratedModifierTextForItem(preset) : '';
}
function equipmentModifierIsBoundToInventoryItem(item={}) {
  if (String(item.itemId || '').trim()) return true;
  const kind = normalizeInventoryKind(item.kind || item.itemType || '');
  return !!String(item.id || item.masterId || '').trim() && ['武器','防具','装飾品'].includes(kind);
}
function itemModifierTextWithPresetFallback(item={}) {
  const own = migratedModifierTextForItem(item || {});
  // 倉庫の装備個体や、倉庫から選択中の装備では、空欄もその装備固有の設定として扱う。
  // 旧保存データで装備個体が特定できない場合だけカテゴリプリセットを使用する。
  if (equipmentModifierIsBoundToInventoryItem(item || {})) return own;
  if(String(own || '').trim()) return own;
  return presetModifierTextForType(item.type || item.category || item.kind || item.itemCategory || '');
}

function isDefenseEquipmentItem(item={}) {
  const text = [item.kind, item.type, item.category, item.itemType, item.itemCategory, item.equipSlot, item.name]
    .map(v => String(v || ''))
    .join('/');
  return /防具|盾|軽装|中装|重装|魔導衣|祈祷衣|普段着|ジャケット|ベスト|胴衣|ケープ|ストール/.test(text);
}
function migrateLegacyDefenseActionRows(rows=[], item={}) {
  const defenseEquipment = isDefenseEquipmentItem(item);
  return (rows || []).map(row => {
    const r = normalizeModifierRow(row);
    if (!r) return null;
    // v90.8.138以前は防具・盾の防御行動値が skill:guard に混在していた。
    if (defenseEquipment && r.target === 'skill:guard') return { ...r, target:'combat:guardAction' };
    return r;
  }).filter(Boolean);
}
function sanitizeKnownEquipmentModifierRows(rows=[], item={}) {
  const id = String(item.itemId || item.masterId || item.id || '').trim();
  const name = String(item.name || '').trim();
  // 小盾・魔導盾には回避低下がない。旧保存データや古いカテゴリ補正が
  // 残っていても、現在の装備仕様を優先して除外する。
  if (id === 'shd_small' || id === 'shd_magic' || name === '小盾' || name === '魔導盾') {
    return (rows || []).filter(row => !['skill:evade', 'combat:evasion'].includes(String(row && row.target || '')));
  }
  return rows || [];
}
function equipmentModifierRows(item={}) {
  const rows = migrateLegacyDefenseActionRows(parseModifierRows(itemModifierTextWithPresetFallback(item || {})), item || {});
  return sanitizeKnownEquipmentModifierRows(rows, item || {});
}
function modifierValue(row={}) { return parseFlatBonus(row.value); }
function sumModifierRows(rows=[], predicate=()=>false) {
  return rows.reduce((sum,row)=> predicate(row) ? sum + modifierValue(row) : sum, 0);
}
function upgradeEntryModifierRow(entry={}) {
  const e=normalizeUpgradeEntry(entry),content=e.content,value=String(upgradeEffectAmount(e)||'').trim();
  if(!content||!value||isZeroModifierText(value))return null;
  const aliases={'命中強化':'hit','防御強化':'combat:defense','回避強化':'skill:evade','抵抗強化':'skill:resist','防御行動強化':'combat:guardAction','HP強化':'resource:maxHp','MP強化':'resource:maxMp','力業補助':'skill:force','魔法補助':'skill:magic','祈祷補助':'skill:prayer'};
  const target=aliases[content]||'';return target?normalizeModifierRow({target,value}):null;
}
function equipmentUpgradeModifierRows(item={}) {
  return parseUpgradeLines(item.upgradeLines || item.upgradeEntries || '').map(upgradeEntryModifierRow).filter(Boolean);
}
function equipmentItemIsActive(item={}) {
  const type = normalizeEquipmentType(item.type || item.category || item.kind || 'なし');
  return !!String(item.itemId || item.name || '').trim() || (!!type && type !== 'なし');
}
function activeEquipmentModifierRows(item={}) {
  if (!equipmentItemIsActive(item || {})) return [];
  return equipmentModifierRows(item).concat(equipmentUpgradeModifierRows(item));
}
function equipmentContextModifierSources(equipment=getEquipmentState(), target='') {
  const out=[];
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind === 'carry') continue;
    const item=(equipment||{})[slot.key]||{};
    if(!equipmentItemIsActive(item)) continue;
    const value=activeEquipmentModifierRows(item)
      .filter(row=>String(row.target||'')===String(target||''))
      .reduce((sum,row)=>sum+modifierValue(row),0);
    if(value) out.push({slotKey:slot.key,slotLabel:slot.name,name:String(item.name||'').trim(),value});
  }
  return out;
}
function equipmentContextModifierTotal(equipment=getEquipmentState(), target='') {
  return equipmentContextModifierSources(equipment,target).reduce((sum,row)=>sum+Number(row.value||0),0);
}

function isDualOneHandWeaponSetup(equipment=getEquipmentState()) {
  const right = equipment?.rightHand || {};
  const left = equipment?.leftHand || {};
  return canUseAsDualWeapon(right) && canUseAsDualWeapon(left);
}
function halfRoundSigned(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n === 0) return 0;
  return Math.sign(n) * Math.ceil(Math.abs(n) / 2);
}
function shouldHalfHandWeaponModifiers(slotKey, equipment=getEquipmentState()) {
  return HAND_SLOT_KEYS.includes(slotKey) && isDualOneHandWeaponSetup(equipment);
}
function addDualAdjustedModifier(targetSums, target, value) {
  if(!target) return;
  const n = Number(value || 0);
  if(!Number.isFinite(n) || n === 0) return;
  targetSums[target] = (targetSums[target] || 0) + n;
}
function applyDualAdjustedModifierSums(targetSums={}, addFn=()=>{}) {
  Object.entries(targetSums).forEach(([target,sum])=>{
    const value = halfRoundSigned(sum);
    if(value) addFn(target, value);
  });
}
function equipmentHitModifierStats(equipment=getEquipmentState()) {
  const right = equipment?.rightHand || {};
  const left = equipment?.leftHand || {};
  const rightType = normalizeEquipmentType(right.type || right.category || right.kind || 'なし');
  const leftType = normalizeEquipmentType(left.type || left.category || left.kind || 'なし');
  const rightTwoHand = right.name && (TWO_HAND_TYPES.has(rightType) || String(right.equipSlot || '').includes('両手'));
  const leftTwoHand = left.name && (TWO_HAND_TYPES.has(leftType) || String(left.equipSlot || '').includes('両手'));
  if(rightTwoHand) return { mode:'twoHand', right:0, left:0, twoHand:hitModifierValueForItem(right) };
  if(leftTwoHand) return { mode:'twoHand', right:0, left:0, twoHand:hitModifierValueForItem(left) };
  return { mode:'dualOrSingle', right:hitModifierValueForItem(right), left:hitModifierValueForItem(left), twoHand:0 };
}
function computeEquipmentAbilityModifiers(equipment=getEquipmentState()) {
  const mods = {};
  const dualHandSums = {};
  const add = (key, value) => { mods[key] = (mods[key] || 0) + value; };
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind === 'carry') continue;
    const item = (equipment || {})[slot.key] || {};
    for (const row of activeEquipmentModifierRows(item)) {
      const target = String(row.target || '');
      if (!target.startsWith('ability:')) continue;
      const key = target.replace('ability:', '');
      const value = modifierValue(row);
      if (shouldHalfHandWeaponModifiers(slot.key, equipment)) addDualAdjustedModifier(dualHandSums, key, value);
      else add(key, value);
    }
  }
  applyDualAdjustedModifierSums(dualHandSums, add);
  return mods;
}

function parseGuardActionExpression(value='') {
  const raw = String(value || '').trim().toUpperCase().replace(/Ｄ/g, 'D').replace(/＋/g, '+').replace(/－/g, '-').replace(/\s+/g, '');
  if (!raw) return { dice:new Map(), flat:0, unknown:[] };
  const out = { dice:new Map(), flat:0, unknown:[] };
  const tokens = raw.match(/[+-]?(?:\d*D\d+|\d+)/g) || [];
  if (!tokens.length || tokens.join('') !== raw) {
    out.unknown.push(raw);
    return out;
  }
  for (const token of tokens) {
    const dm = token.match(/^([+-]?)(\d*)D(\d+)$/);
    if (dm) {
      const sign = dm[1] === '-' ? -1 : 1;
      const count = Number(dm[2] || 1) * sign;
      const sides = Number(dm[3]);
      out.dice.set(sides, (out.dice.get(sides) || 0) + count);
      continue;
    }
    const n = Number(token);
    if (Number.isFinite(n)) out.flat += n;
    else out.unknown.push(token);
  }
  return out;
}
function combineGuardActionValues(values=[]) {
  const dice = new Map();
  let flat = 0;
  const unknown = [];
  for (const value of values || []) {
    const parsed = parseGuardActionExpression(value);
    for (const [sides, count] of parsed.dice.entries()) dice.set(sides, (dice.get(sides) || 0) + count);
    flat += parsed.flat;
    unknown.push(...parsed.unknown);
  }
  const parts = [];
  for (const [sides, count] of Array.from(dice.entries()).sort((a,b)=>b[0]-a[0])) {
    if (!count) continue;
    const sign = count < 0 ? '-' : (parts.length ? '+' : '');
    parts.push(`${sign}${Math.abs(count)}D${sides}`);
  }
  if (flat) parts.push(`${flat > 0 && parts.length ? '+' : ''}${flat}`);
  for (const value of unknown) parts.push(`${parts.length ? '+' : ''}(${value})`);
  return parts.join('') || '0';
}

function computeEquipmentCombatModifiers(equipment=getEquipmentState()) {
  const mods = { defense:0, evasion:0, resistance:0, maxHp:0, maxMp:0, guardActionValue:'0', guardActionTerms:[] };
  const dualHandSums = {};
  const guardActionTerms = [];
  const add = (key, value) => { if(key in mods && key !== 'guardActionValue' && key !== 'guardActionTerms') mods[key] += value; };
  const targetToKey = target => {
    if (target === 'combat:defense') return 'defense';
    if (target === 'combat:evasion') return 'evasion';
    if (target === 'combat:resistance') return 'resistance';
    if (target === 'combat:initiative') return ''; // 旧データはnormalizeModifierRowで感知へ移行
    if (target === 'resource:maxHp') return 'maxHp';
    if (target === 'resource:maxMp') return 'maxMp';
    return '';
  };
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind === 'carry') continue;
    const item = (equipment || {})[slot.key] || {};
    for (const row of activeEquipmentModifierRows(item)) {
      const target = String(row.target || '');
      if (target === 'combat:guardAction') {
        const value = String(row.value || '').trim();
        if (value && !isZeroModifierText(value)) guardActionTerms.push(value);
        continue;
      }
      const key = targetToKey(target);
      if (!key) continue;
      const value = modifierValue(row);
      if (shouldHalfHandWeaponModifiers(slot.key, equipment)) addDualAdjustedModifier(dualHandSums, key, value);
      else add(key, value);
    }
  }
  applyDualAdjustedModifierSums(dualHandSums, add);
  mods.guardActionTerms = guardActionTerms;
  mods.guardActionValue = combineGuardActionValues(guardActionTerms);
  return mods;
}
function computeEffectiveAbilities(base=getAbilityValues(), equipment=getEquipmentState()) {
  const mods = computeEquipmentAbilityModifiers(equipment);
  const out = {};
  for (const a of ABILITIES) out[a.key] = Math.max(0, (Number(base[a.key]) || 0) + (mods[a.key] || 0));
  return out;
}


function getPresetForItem(item={}) {
  return EQUIPMENT_PRESETS[normalizeEquipmentType(item.type || 'なし')] || EQUIPMENT_PRESETS['なし'];
}
function hasSelectedInventoryEquipmentItem(item={}) {
  return !!String(item && item.itemId || '').trim();
}
function equipmentFlatValueForCombat(item={}, field, fallback='0') {
  const own = item && item[field];
  if (own !== undefined && own !== null && String(own).trim() !== '') return own;
  // 倉庫アイテムから選択した装備は、そのアイテム行の値を正とする。
  // 空欄の場合に装備カテゴリのプリセット値へ戻すと、
  // 例：命中+1の武器なのにカテゴリ側の回避+1までステータスに乗る、という誤反映が起きる。
  if (hasSelectedInventoryEquipmentItem(item)) return fallback;
  const preset = getPresetForItem(item);
  const presetValue = preset && preset[field];
  return presetValue !== undefined && presetValue !== null && String(presetValue).trim() !== '' ? presetValue : fallback;
}
function computeEquipmentDefense(equipment=getEquipmentState()) {
  return computeEquipmentCombatModifiers(equipment).defense;
}
function computeEquipmentEvade(equipment=getEquipmentState()) {
  return computeEquipmentCombatModifiers(equipment).evasion;
}

function signedNumberText(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const n = Number(raw.replace(/^\+/, ''));
  if (Number.isFinite(n)) return (n >= 0 ? '+' : '') + n;
  return raw;
}
function parseFlatBonus(value) {
  const n = Number(String(value ?? '').trim().replace(/^\+/, ''));
  return Number.isFinite(n) ? n : 0;
}
const RANGED_EQUIPMENT_TYPES = new Set(['弓','クロスボウ','ヘヴィクロスボウ','大鎌']);
function equipmentHitSkillKey(item={}) {
  const type = normalizeEquipmentType(item.type || item.category || item.kind || 'なし');
  if (!type || type === 'なし') return '';
  if (spellContainerKind(type)) return '';
  if (['盾','大盾'].includes(type)) return '';
  if (RANGED_EQUIPMENT_TYPES.has(type)) return 'shoot';
  return 'melee';
}
function addEquipmentSkillModifier(mods, key, value) {
  const n = Number(value || 0);
  if (!key || !Number.isFinite(n) || n === 0) return;
  mods[key] = (mods[key] || 0) + n;
}
function setBestEquipmentHitModifier(mods, key, value) {
  const n = Number(value || 0);
  if (!key || !Number.isFinite(n) || n === 0) return;
  if (mods[key] === undefined) mods[key] = n;
  else mods[key] = Math.max(mods[key], n);
}
function computeEquipmentSkillModifiers(equipment=getEquipmentState()) {
  const mods = {};
  const dualHandSums = {};
  const add = (key, value) => addEquipmentSkillModifier(mods, key, value);
  // 両手武器装備時に無効になるのは反対側の手だけ。
  // 旧処理は両手武器を見つけた時点でループ自体をbreakしていたため、
  // 右手に大鎌・両手剣などを装備すると、その後ろの鎧・装飾品の
  // 回避補正を含む skill:* 補正がすべて集計から抜けていた。
  const twoHandSlotKey = HAND_SLOT_KEYS.find(key => isPaletteTwoHandEquipment((equipment || {})[key] || {}, null)) || '';
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind === 'carry') continue;
    if (twoHandSlotKey && HAND_SLOT_KEYS.includes(slot.key) && slot.key !== twoHandSlotKey) continue;
    const item = (equipment || {})[slot.key] || {};
    const type = normalizeEquipmentType(item.type || 'なし');
    if (!item.name && (!type || type === 'なし')) continue;
    for (const row of activeEquipmentModifierRows(item)) {
      const target = String(row.target || '');
      if (!target.startsWith('skill:')) continue;
      const key = target.replace('skill:', '');
      const value = modifierValue(row);
      if (shouldHalfHandWeaponModifiers(slot.key, equipment)) addDualAdjustedModifier(dualHandSums, key, value);
      else add(key, value);
    }
  }
  applyDualAdjustedModifierSums(dualHandSums, add);
  return mods;
}

function canUseAsDualWeapon(item) {
  const type = normalizeEquipmentType(item?.type || 'なし');
  if (!type || type === 'なし' || TWO_HAND_TYPES.has(type)) return false;
  return parseFlatBonus(item?.offhand) > 0;
}
function computeDualWieldStats(equipment=getEquipmentState()) {
  const right = equipment?.rightHand || {};
  const left = equipment?.leftHand || {};
  const rightOk = canUseAsDualWeapon(right);
  const leftOk = canUseAsDualWeapon(left);
  if (!rightOk || !leftOk) return { available:false };
  const leftBonus = signedNumberText(left.offhand || EQUIPMENT_PRESETS[normalizeEquipmentType(left.type)]?.offhand || '');
  const rightBonus = signedNumberText(right.offhand || EQUIPMENT_PRESETS[normalizeEquipmentType(right.type)]?.offhand || '');
  return {
    available:true,
    rightMain:`右手主武器：命中${signedNumberText(hitModifierValueForItem(right) - 1)} / 副手追撃${leftBonus}`,
    leftMain:`左手主武器：命中${signedNumberText(hitModifierValueForItem(left) - 1)} / 副手追撃${rightBonus}`,
    bestOffhandBonus: Math.max(parseFlatBonus(left.offhand), parseFlatBonus(right.offhand))
  };
}
function allocatedSkillPoints(skillKey, alloc=getSkillAlloc()) {
  const row = alloc?.[skillKey] || {};
  return (Number(row.cat) || 0) + (Number(row.free) || 0);
}
function computeCombatStats(abilities=computeEffectiveAbilities(getAbilityValues(), getEquipmentState()), alloc=getSkillAlloc(), equipment=getEquipmentState()) {
  const totals = skillTotals(abilities, alloc, equipment);
  const combatMods = computeEquipmentCombatModifiers(equipment);
  const defenseValue = combatMods.defense;
  const defenseSkillPoints = allocatedSkillPoints('guard', alloc);
  const constantDamageReduction = defenseValue + defenseSkillPoints;
  const guardActionValue = combatMods.guardActionValue || '0';
  const evadeSkill = totals.evade?.total || 0;
  const evadeModifier = (totals.evade?.equipmentOther || 0) + combatMods.evasion;
  const evasionTotal = 5 + evadeSkill + combatMods.evasion;
  const resistSkill = totals.resist?.total || 0;
  const resistModifier = (totals.resist?.equipmentOther || 0) + combatMods.resistance;
  const resistanceTotal = 5 + resistSkill + combatMods.resistance;
  return { defenseTotal:defenseValue, defenseValue, defenseSkillPoints, constantDamageReduction, guardActionValue, evasionTotal, evadeSkill, evadeModifier, resistanceTotal, resistSkill, resistModifier, combatMods, hitMods: equipmentHitModifierStats(equipment), dualWield: computeDualWieldStats(equipment) };
}
function updateCombatStats() {
  const combat = computeCombatStats(computeEffectiveAbilities(getAbilityValues(), getEquipmentState()), getSkillAlloc(), getEquipmentState());
  const hitCards = combat.hitMods?.mode === 'twoHand'
    ? `<div class="ability-card computed-card"><div class="ability-name">両手命中補正</div><div class="computed-value big">${signedNumberText(combat.hitMods.twoHand || 0) || '0'}</div></div>`
    : `<div class="ability-card computed-card"><div class="ability-name">右手命中補正</div><div class="computed-value big">${signedNumberText(combat.hitMods?.right || 0) || '0'}</div></div>
       <div class="ability-card computed-card"><div class="ability-name">左手命中補正</div><div class="computed-value big">${signedNumberText(combat.hitMods?.left || 0) || '0'}</div></div>`;
  const el = $('derivedCombatStats');
  if (el) {
    el.innerHTML = `
      <div class="ability-card computed-card">
        <div class="ability-name">防御値</div>
        <div class="computed-value big">${combat.defenseValue}</div>
      </div>
      <div class="ability-card computed-card">
        <div class="ability-name">防御技能軽減</div>
        <div class="computed-value big">${combat.defenseSkillPoints}</div>
      </div>
      <div class="ability-card computed-card">
        <div class="ability-name">常時軽減合計</div>
        <div class="computed-value big">${combat.constantDamageReduction}</div>
      </div>
      <div class="ability-card computed-card">
        <div class="ability-name">防御行動値</div>
        <div class="computed-value big">${esc(combat.guardActionValue)}</div>
      </div>
      <div class="ability-card computed-card">
        <div class="ability-name">回避値</div>
        <div class="computed-value big">${combat.evasionTotal}</div>
      </div>
      <div class="ability-card computed-card">
        <div class="ability-name">抵抗値</div>
        <div class="computed-value big">${combat.resistanceTotal}</div>
      </div>
      ${hitCards}
      ${combat.dualWield?.available ? `
      <div class="ability-card computed-card">
        <div class="ability-name">二刀攻撃</div>
        <div class="small">${esc(combat.dualWield.rightMain)}<br>${esc(combat.dualWield.leftMain)}</div>
      </div>` : ''}
    `;
  }
  return combat;
}

function computeResources(abilities=computeEffectiveAbilities(getAbilityValues(), getEquipmentState()), resources=getResourceState(), equipment=getEquipmentState()) {
  const hpBonusPoints = Math.max(0, resources.hpBonus || 0);
  const mpBonusPoints = Math.max(0, resources.mpBonus || 0);
  const combatMods = computeEquipmentCombatModifiers(equipment);
  const maxHp = Math.max(1, 10 + (abilities.body || 0) * 3 + (abilities.will || 0) + hpBonusPoints * 3 + (combatMods.maxHp || 0));
  const maxMp = Math.max(0, 8 + (abilities.will || 0) * 3 + (abilities.intellect || 0) + mpBonusPoints * 2 + (combatMods.maxMp || 0));
  return {
    maxHp,
    maxMp,
    currentHp: resources.currentHp || maxHp,
    currentMp: resources.currentMp || maxMp,
    hpBonus: hpBonusPoints,
    mpBonus: mpBonusPoints,
    fatigue: Math.max(0, Number(resources.fatigue)||0),
    fatiguePenalty: -2*Math.max(0, Number(resources.fatigue)||0),
    resourceModifiers: { maxHp: combatMods.maxHp || 0, maxMp: combatMods.maxMp || 0 },
  };
}
function updateResources() {
  const res = computeResources(computeEffectiveAbilities(getAbilityValues(), getEquipmentState()), getResourceState(), getEquipmentState());
  if ($('maxHp')) $('maxHp').textContent = res.maxHp;
  if ($('maxMp')) $('maxMp').textContent = res.maxMp;
  if ($('currentHp') && !$('currentHp').value) $('currentHp').value = res.maxHp;
  if ($('currentMp') && !$('currentMp').value) $('currentMp').value = res.maxMp;
  if ($('fatiguePenalty')) $('fatiguePenalty').textContent = res.fatiguePenalty ? String(res.fatiguePenalty) : '0';
  return res;
}

function updateSummary() {
  /* 出力欄はボタンから開くため常時表示しない。保存変更検知は入力元/操作元で区分管理する。 */
}
function updateAll() { updateAbilities(); updateResources(); updateSkills(); updateCombatStats(); updateSpellSlotHints(); updateEquipmentSummaries(); applyBagCapacityToEquipmentSlots();
  renderQuiverControls(); updateSummary(); }

function spellContainerKind(type) {
  const t = normalizeEquipmentType(type || 'なし');
  if (t === '魔導書') return { kind:'magic', label:'魔法', pointKey:'magic', baseSlots:1, growsWithPoint:true };
  if (t === '祈祷書') return { kind:'prayer', label:'祈祷', pointKey:'prayer', baseSlots:1, growsWithPoint:true };
  if (t === '魔印') return { kind:'magic', label:'魔法', pointKey:'magic', baseSlots:1, growsWithPoint:false };
  if (t === '聖印') return { kind:'prayer', label:'祈祷', pointKey:'prayer', baseSlots:1, growsWithPoint:false };
  return null;
}
function getSkillPointTotal(skillKey, alloc=getSkillAlloc()) {
  const row = alloc?.[skillKey] || {};
  return (Number(row.cat) || 0) + (Number(row.free) || 0) + (Number(row.other) || 0);
}
function selectedSpellSlotBonus(slotKey='') {
  if (!slotKey) return 0;
  const row = findCsItemById($('equip_' + slotKey + '_itemSelect')?.value || '');
  const n = Number(row && row.spellSlots);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}
function spellSlotUpgradeBonus(slotKey='') {
  if (!slotKey) return 0;
  return collectUpgradeEntries(slotKey).reduce((sum, entry) => {
    const content = String(entry?.content || '').trim();
    if (!/術式登録枠|術式枠増加|術式枠|術式枠/.test(content)) return sum;
    const parsed = Number(String(entry?.value || '').replace(/[^0-9+.-]/g,''));
    return sum + (Number.isFinite(parsed) && parsed !== 0 ? Math.max(0, Math.floor(parsed)) : 1);
  }, 0);
}
function spellSlotLimitForType(type, alloc=getSkillAlloc(), slotKey='') {
  const info = spellContainerKind(type);
  if (!info) return 0;
  // 魔導書・祈祷書：基本1 + 対応技能P + 装備固有枠補正 + 強化枠補正。
  // 魔印・聖印：基本1 + 装備固有枠補正 + 強化枠補正。
  const base = info.baseSlots || 0;
  const skillPoint = info.growsWithPoint ? getSkillPointTotal(info.pointKey, alloc) : 0;
  const equipmentBonus = selectedSpellSlotBonus(slotKey);
  return Math.max(0, base + skillPoint + equipmentBonus + spellSlotUpgradeBonus(slotKey));
}
function splitFormulaList(text) {
  return String(text || '').split(/[\n,、，\/]+/).map(v => v.trim()).filter(Boolean);
}
function selectedSpellNames(slotKey) {
  const list = $('equip_' + slotKey + '_spellSlotList');
  if (list) {
    return Array.from(list.querySelectorAll('select.spell-slot-select'))
      .map(sel => sel.value)
      .filter(Boolean);
  }
  const el = $('equip_' + slotKey + '_setSpells');
  if (!el) return [];
  if (el.tagName === 'SELECT') return Array.from(el.selectedOptions || []).map(o => o.value).filter(Boolean);
  return splitFormulaList(el.value || el.dataset.pendingSpells || '');
}
function spellTypeAliases(label) {
  if (label === '魔法') return ['魔法','魔法術式','魔術','攻撃魔法'];
  if (label === '祈祷') return ['祈祷','祈祷術式','聖術','神聖術'];
  return [label];
}
const LEGACY_CHARACTER_NUMERIC_RANKS = {'初期':1,'初級':1,'低級':1,'中級':2,'普通':2,'上級':3,'良質':3,'特級':4,'希少':4,'最上級':5,'高級':5};
function inventoryRankLabel(item={}){
  const masterRow=inventoryMasterRowForClassification(item||{});
  return characterPlayerRankLabel(item?.rank || masterRow?.rank || 1);
}
function spellDisplayMeta(item={}) {
  const row = normalizeInventoryItem(item || {});
  return [
    row.category ? '種別 ' + row.category : '',
    row.element ? '属性 ' + row.element : '',
    row.cost ? 'コスト ' + row.cost : '',
    row.power ? 'ダメージ/威力 ' + row.power : '',
    row.target ? '対象 ' + row.target : '',
    row.checkType ? '判定 ' + checkExpressionDisplay(row.checkType) : '',
    row.rank ? 'ランク ' + characterPlayerRankLabel(row.rank) : ''
  ].filter(Boolean);
}
function spellDetailHtml(item, {open=false}={}) {
  const row = normalizeInventoryItem(item || {});
  if (!row.name) return '<div class="spell-detail-empty">術式を選択すると、ここに詳細を表示します。</div>';
  const meta = spellDisplayMeta(row);
  const description = row.description || '';
  const effect = row.effect || '';
  const role = row.role || '';
  const body = [
    meta.length ? `<div class="spell-detail-meta">${meta.map(v => `<span class="spell-detail-pill">${esc(v)}</span>`).join('')}</div>` : '',
    description ? `<div class="spell-detail-text"><strong>説明：</strong>${esc(description)}</div>` : '',
    effect ? `<div class="spell-detail-text"><strong>効果：</strong>${esc(effect)}</div>` : '',
    role ? `<div class="spell-detail-text"><strong>役割：</strong>${esc(role)}</div>` : ''
  ].filter(Boolean).join('') || '<div class="spell-detail-empty">この術式には詳細が登録されていません。</div>';
  return `<details class="spell-detail" ${open ? 'open' : ''}><summary>${esc(row.name)} の詳細</summary><div class="spell-detail-body">${body}</div></details>`;
}
function findOwnedSpellByName(name, info=null) {
  const target = String(name || '').trim();
  if (!target) return null;
  const rows = info ? ownedSpellRowsForInfo(info) : inventoryDerived().rows.filter(item => item.kind === '術式');
  return rows.find(row => String(row.name || '').trim() === target) || null;
}
function updateSpellSlotDetails(slotKey) {
  const type = $('equip_' + slotKey + '_type')?.value || 'なし';
  const info = spellContainerKind(type);
  const list = $('equip_' + slotKey + '_spellSlotList');
  if (!list) return;
  for (const sel of Array.from(list.querySelectorAll('select.spell-slot-select'))) {
    const detail = sel.closest('.spell-slot-row')?.querySelector('.spell-slot-detail-box');
    if (!detail) continue;
    const row = findOwnedSpellByName(sel.value, info);
    detail.innerHTML = row ? spellDetailHtml(row) : '<div class="spell-detail-empty">術式を選択すると、ここに説明・効果を表示します。</div>';
  }
}
function spellTextForTypeDetection(row={}) {
  return [row.category, row.kind, row.type, row.itemType, row.masterSheet, row.setItem, row.tags, row.checkType, row.role, row.source, row.description, row.effect]
    .map(v => String(v || '').trim())
    .filter(Boolean)
    .join(' / ');
}
function spellRowMatchesContainerInfo(row={}, info=null) {
  if (!info) return true;
  const text = spellTextForTypeDetection(row);
  const cat = String(row.category || row.type || '').trim();
  const aliases = spellTypeAliases(info.label);
  if (aliases.includes(cat)) return true;
  if (info.label === '魔法') return /魔法|魔術|魔導|魔印/.test(text) || /^魔法\s*>=/.test(String(row.checkType || ''));
  if (info.label === '祈祷') return /祈祷|聖術|神聖|聖印/.test(text) || /^祈祷\s*>=/.test(String(row.checkType || ''));
  return false;
}
function ownedSpellRowsForInfo(info) {
  if (!info) return [];
  // 倉庫内の術式を正としつつ、DB同期直後の一瞬だけ候補が空にならないよう、
  // DB上の「初期倉庫」術式もフォールバック候補へ含める。
  const fallbackRows = (DB_INITIAL_SPELL_MASTER || [])
    .filter(row => hasInitialMasterToken(row))
    .map(row => dbSpellToInventoryItem(row));
  const inventoryRows = inventoryDerived().rows;
  const byKey = new Map();
  for (const item of fallbackRows.concat(inventoryRows)) {
    if (!item.name || !isSpellInventoryItem(item) || !spellRowMatchesContainerInfo(item, info)) continue;
    const key = String(item.masterId || item.id || item.name || '').trim() || String(item.name || '').trim();
    byKey.set(key, item); // 後から入る倉庫データを優先する。
  }
  return Array.from(byKey.values()).sort((a,b) => (characterNumericRankValue(a.rank,9999)-characterNumericRankValue(b.rank,9999)) || String(a.name || '').localeCompare(String(b.name || ''), 'ja'));
}
function spellOptionLabel(item) {
  const row = normalizeInventoryItem(item || {});
  const meta = [row.element ? '属性 ' + row.element : '', row.cost ? 'コスト ' + row.cost : '', row.target ? '対象 ' + row.target : '', row.power ? 'ダメージ/威力 ' + row.power : ''].filter(Boolean).join(' / ');
  return meta ? `${row.name}（${meta}）` : row.name;
}
function syncSpellSetHidden(slotKey) {
  const hidden = $('equip_' + slotKey + '_setSpells');
  if (!hidden) return;
  const names = selectedSpellNames(slotKey);
  hidden.value = names.join('\n');
  hidden.dataset.pendingSpells = hidden.value;
}
function syncEquippedSpellSetToInventoryItem(slotKey='', itemKey='') {
  const key = String(itemKey || $('equip_' + slotKey + '_itemSelect')?.value || '').trim();
  if (!key) return false;
  const index = inventoryIndexByLookup(key,'');
  if (index < 0) return false;
  const item = inventoryItemsState[index];
  const type = normalizeEquipmentType(item.itemCategory || item.category || item.type || $('equip_' + slotKey + '_type')?.value || 'なし');
  if (!spellContainerKind(type)) return false;
  const setSpells=selectedSpellNames(slotKey).join('\n');
  if(String(item.setSpells||'')===setSpells)return false;
  inventoryItemsState[index] = normalizeInventoryItem({ ...item, setSpells });
  invalidateInventoryDerivedCache();
  return true;
}
function syncAllEquipmentSpellSetsToInventory() {
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind !== 'carry') syncEquippedSpellSetToInventoryItem(slot.key);
  }
}
const EQUIPMENT_UPGRADE_OPTIONS = ['','威力強化','威力固定強化','命中強化','防御強化','防御行動強化','回避強化','抵抗強化','副手追撃強化','術式枠拡張','術式省力化','回復量強化','回復量固定強化','最大スタック拡張','HP強化','MP強化','力業補助','魔法補助','祈祷補助','素材固有効果'];
const EQUIPMENT_UPGRADE_OPTION_LABELS = {'素材固有効果':'特殊効果'};
const EQUIPMENT_UPGRADE_DEFINITIONS={
  '威力強化':{amount:1,slotCost:1,detail:'同じ装備に付与された威力強化の段階に応じて、この装備による武器攻撃・魔法・祈祷のダメージへ追加する。1段階は+1、2段階は+1D2、3段階は+1D3、以後同様。'},
  '威力固定強化':{amount:1,slotCost:2,detail:'同じ装備に付与された威力固定強化の段階に応じて、この装備による武器攻撃・魔法・祈祷のダメージへ固定値を追加する。1段階は+1、2段階は+2、3段階は+3、以後同様。'},
  '命中強化':{amount:1,slotCost:1,detail:'この武器を使用する攻撃判定+1。'},
  '防御強化':{amount:1,slotCost:2,detail:'防御値+1。'},
  '防御行動強化':{amount:1,slotCost:1,detail:'防御行動中のみ防御行動値+1。'},
  '回避強化':{amount:1,slotCost:1,detail:'回避値+1。'},
  '抵抗強化':{amount:1,slotCost:1,detail:'抵抗値+1。'},
  '副手追撃強化':{amount:1,slotCost:1,detail:'副手追撃値+1。'},
  '術式枠拡張':{amount:1,slotCost:2,detail:'この魔導書・祈祷書の術式枠+1。'},
  '術式省力化':{amount:1,slotCost:2,detail:'この装備から使用する術式の消費MPを1点軽減する（最低1）。'},
  '回復量強化':{amount:1,slotCost:1,detail:'同じ装備に付与された回復量強化の段階に応じて、この装備から使用する魔法・祈祷のHP回復量へ追加する。1段階は+1、2段階は+1D2、3段階は+1D3、以後同様。'},
  '回復量固定強化':{amount:1,slotCost:2,detail:'同じ装備に付与された回復量固定強化の段階に応じて、この装備から使用する魔法・祈祷のHP回復量へ固定値を追加する。1段階は+1、2段階は+2、3段階は+3、以後同様。'},
  '最大スタック拡張':{amount:1,slotCost:1,detail:'最大スタック数+1。'},
  'HP強化':{amount:1,slotCost:1,detail:'最大HP+1。'},
  'MP強化':{amount:1,slotCost:1,detail:'最大MP+1。'},
  '力業補助':{amount:1,slotCost:2,detail:'この武器を使用する力業判定+1。'},
  '魔法補助':{amount:1,slotCost:2,detail:'この装備から使用する魔法判定+1。'},
  '祈祷補助':{amount:1,slotCost:2,detail:'この装備から使用する祈祷判定+1。'}
};
const LEGACY_UPGRADE_NAME_MAP={
  '威力':'威力強化','威力+1':'威力強化','武器威力':'威力強化','命中':'命中強化','命中補正':'命中強化',
  '防御貫通':'威力固定強化','装甲貫通':'威力固定強化','雷脈貫通':'威力固定強化','天雷貫通':'威力固定強化',
  '防御':'防御強化','防御値':'防御強化','防御行動':'防御行動強化','防御行動値':'防御行動強化',
  '回避':'回避強化','回避補正':'回避強化','抵抗':'抵抗強化','抵抗値':'抵抗強化','抵抗補正':'抵抗強化','副手追撃値':'副手追撃強化','術式枠':'術式枠拡張',
  '消費コスト軽減':'術式省力化','コスト軽減':'術式省力化','回復量':'回復量固定強化','回復強化':'回復量固定強化',
  '最大スタック数':'最大スタック拡張','HP':'HP強化','最大HP':'HP強化','MP':'MP強化','最大MP':'MP強化',
  '力業':'力業補助','魔法':'魔法補助','祈祷':'祈祷補助'
};
function isStandardUpgradeEffectName(content=''){return !!EQUIPMENT_UPGRADE_DEFINITIONS[String(content||'').trim()];}
function normalizeUpgradeContentName(content='',legacyValue=''){
  const raw=String(content||'').trim();
  if(!raw)return '';
  if(raw==='特殊効果'||raw==='属性効果'||raw==='その他'||raw==='素材固有効果')return '素材固有効果';
  if(raw.startsWith('特殊効果：')||raw.startsWith('特殊効果:')||raw.startsWith('属性効果：')||raw.startsWith('属性効果:')||raw.startsWith('素材固有効果：')||raw.startsWith('素材固有効果:'))return '素材固有効果';
  return LEGACY_UPGRADE_NAME_MAP[raw]||raw;
}
function upgradeDefaultSlotCost(content=''){return Math.max(1,Number(EQUIPMENT_UPGRADE_DEFINITIONS[normalizeUpgradeContentName(content)]?.slotCost)||1);}
function legacyUpgradeMagnitude(value='',fallback=0){
  const match=String(value||'').trim().match(/[+-]?\d+(?:\.\d+)?/);
  const n=match?Math.abs(Number(match[0])):0;
  return Number.isFinite(n)&&n>0?n:fallback;
}
function standardUpgradeDetailForAmount(content='',amount=1){
  const name=normalizeUpgradeContentName(content),n=Math.max(1,Number(amount)||1);
  switch(name){
    case '威力強化':return `威力強化${n}として扱う。ダメージへの追加は、1段階なら+1、2段階なら+1D2、3段階なら+1D3、以後同様。`;
    case '威力固定強化':return `威力固定強化${n}として扱い、この装備による武器攻撃・魔法・祈祷のダメージ+${n}。`;
    case '命中強化':return `この武器を使用する攻撃判定+${n}。`;
    case '防御強化':return `防御値+${n}。`;
    case '防御行動強化':return `防御行動中のみ防御行動値+${n}。`;
    case '回避強化':return `回避値+${n}。`;
    case '抵抗強化':return `抵抗値+${n}。`;
    case '副手追撃強化':return `副手追撃値+${n}。`;
    case '術式枠拡張':return `この魔導書・祈祷書の術式枠+${n}。`;
    case '術式省力化':return `この装備から使用する術式の消費MPを${n}点軽減する（最低1）。`;
    case '回復量強化':return `回復量強化${n}として扱う。HP回復量への追加は、1段階なら+1、2段階なら+1D2、3段階なら+1D3、以後同様。`;
    case '回復量固定強化':return `回復量固定強化${n}として扱い、この装備から使用する魔法・祈祷のHP回復量+${n}。`;
    case '最大スタック拡張':return `最大スタック数+${n}。`;
    case 'HP強化':return `最大HP+${n}。`;
    case 'MP強化':return `最大MP+${n}。`;
    case '力業補助':return `この武器を使用する力業判定+${n}。`;
    case '魔法補助':return `この装備から使用する魔法判定+${n}。`;
    case '祈祷補助':return `この装備から使用する祈祷判定+${n}。`;
    default:return String(EQUIPMENT_UPGRADE_DEFINITIONS[name]?.detail||'');
  }
}
function upgradeEffectAmount(entry={}){
  const e=typeof entry==='string'?{content:entry}:entry;
  const inherited=Math.max(0,Number(e.legacyEffectAmount||0)||0);
  return inherited||Number(EQUIPMENT_UPGRADE_DEFINITIONS[normalizeUpgradeContentName(e.content)]?.amount)||0;
}
function standardUpgradeDetailText(entry={}){
  const e=typeof entry==='string'?{content:entry}:entry;
  const inheritedDetail=String(e.legacyEffectDetail||'').trim();
  if(inheritedDetail&&!/防御貫通|装甲貫通/.test(inheritedDetail))return inheritedDetail;
  return standardUpgradeDetailForAmount(e.content,upgradeEffectAmount(e)||1);
}
function normalizeUpgradeEntry(entry={}){
  let rawContent=String(entry.content||entry.type||entry.name||entry.label||'').trim();
  let legacyValue=String(entry.value||entry.amount||'').trim();
  let rank=String(entry.rank||entry.materialRank||'').trim();
  let specialEffectName=String(entry.specialEffectName||entry.effectName||'').trim();
  let specialEffectDetail=String(entry.specialEffectDetail||entry.effectDetail||entry.abilityDetail||'').trim();
  let sourceMaterialId=String(entry.sourceMaterialId||entry.materialId||'').trim();
  let sourceMaterialPublicId=String(entry.sourceMaterialPublicId||entry.materialPublicId||'').trim();
  let sourceMaterialName=String(entry.sourceMaterialName||entry.materialName||'').trim();
  let sourceMaterialTarget=String(entry.sourceMaterialTarget||entry.materialTarget||'').trim();
  let legacyEffectAmount=Math.max(0,Number(entry.legacyEffectAmount||entry.resolvedAmount||0)||0);
  let legacyEffectDetail=String(entry.legacyEffectDetail||entry.effectDetailOverride||'').trim();
  let slotCost=Math.max(0,Number(entry.slotCost||entry.upgradeSlotCost||0)||0);
  const slotPattern=/(?:\s*(?:\/|／|\||｜)\s*)?(?:消費枠|slotCost)\s*[：:=]\s*(\d+)/i;
  const legacyAmountPattern=/(?:\s*(?:\/|／|\||｜)\s*)?(?:引継量|旧効果量|legacyAmount)\s*[：:=]\s*([+-]?\d+(?:\.\d+)?)/i;
  const rankPattern=/(?:\s*(?:\/|／|\||｜)\s*)?(?:素材ランク|ランク|rank)\s*[：:=]\s*([^\/／\|｜\n]+)/i;
  const stripMeta=(text='')=>{
    let cleaned=String(text||'').trim(),m=cleaned.match(slotPattern);
    if(m){if(!slotCost)slotCost=Math.max(1,Number(m[1])||1);cleaned=cleaned.replace(m[0],' ').trim();}
    m=cleaned.match(rankPattern);
    if(m){if(!rank)rank=String(m[1]||'').trim();cleaned=cleaned.replace(m[0],' ').trim();}
    m=cleaned.match(legacyAmountPattern);
    if(m){if(!legacyEffectAmount)legacyEffectAmount=Math.max(0,Math.abs(Number(m[1])||0));cleaned=cleaned.replace(m[0],' ').trim();}
    return cleaned.replace(/\s*(?:\/|／|\||｜)\s*$/,'').trim();
  };
  rawContent=stripMeta(rawContent);legacyValue=stripMeta(legacyValue);
  let explicitSpecial=rawContent.match(/^(?:特殊効果|属性効果|素材固有効果)(?:[：:]\s*(.+))?$/);
  if(!explicitSpecial){
    const pair=rawContent.match(/^([^：:]+)[：:]\s*(.+)$/);
    if(pair){
      const left=String(pair[1]||'').trim(),right=String(pair[2]||'').trim(),normalizedLeft=normalizeUpgradeContentName(left,right);
      if(isStandardUpgradeEffectName(normalizedLeft)||['特殊効果','属性効果','素材固有効果','その他'].includes(left)){
        rawContent=left;if(!legacyValue)legacyValue=right;
      }
    }
    explicitSpecial=rawContent.match(/^(?:特殊効果|属性効果|素材固有効果)(?:[：:]\s*(.+))?$/);
  }
  if(explicitSpecial&&!specialEffectName)specialEffectName=String(explicitSpecial[1]||legacyValue||'').trim();
  const legacyPenetrationName=['防御貫通','装甲貫通','雷脈貫通','天雷貫通'].includes(rawContent);
  let content=normalizeUpgradeContentName(rawContent,legacyValue);
  const legacyPenetrationSpecial=content==='素材固有効果'&&(LEGACY_UPGRADE_NAME_MAP[specialEffectName]==='威力固定強化'||/防御貫通|装甲貫通/.test(specialEffectDetail));
  if(legacyPenetrationSpecial){content='威力固定強化';slotCost=2;specialEffectName='';specialEffectDetail='';sourceMaterialId='';sourceMaterialPublicId='';sourceMaterialName='';sourceMaterialTarget='';legacyEffectDetail='';}
  if(legacyPenetrationName&&content==='威力固定強化')slotCost=2;
  if(content&&!isStandardUpgradeEffectName(content)&&content!=='素材固有効果'){
    if(!specialEffectName)specialEffectName=content;
    content='素材固有効果';
  }
  if(!slotCost)slotCost=upgradeDefaultSlotCost(content);
  if(['威力固定強化','回復量固定強化'].includes(content)&&slotCost<2)slotCost=2;
  if(content==='威力固定強化'&&/防御貫通|装甲貫通/.test(legacyEffectDetail))legacyEffectDetail='';
  if(content==='素材固有効果'){
    if(!specialEffectName)specialEffectName=legacyValue;
    if(slotCost===1)slotCost=2;
    legacyEffectAmount=0;legacyEffectDetail='';
  }else{
    const defaultAmount=Number(EQUIPMENT_UPGRADE_DEFINITIONS[content]?.amount)||0;
    const parsedLegacyAmount=legacyUpgradeMagnitude(legacyValue,0);
    if(!legacyEffectAmount&&parsedLegacyAmount>0&&parsedLegacyAmount!==defaultAmount)legacyEffectAmount=parsedLegacyAmount;
    if(legacyEffectAmount===defaultAmount)legacyEffectAmount=0;
    if(legacyEffectAmount&&!legacyEffectDetail)legacyEffectDetail=standardUpgradeDetailForAmount(content,legacyEffectAmount);
    specialEffectName='';specialEffectDetail='';sourceMaterialId='';sourceMaterialPublicId='';sourceMaterialName='';sourceMaterialTarget='';
  }
  return {content,rank,slotCost,specialEffectName,specialEffectDetail,sourceMaterialId,sourceMaterialPublicId,sourceMaterialName,sourceMaterialTarget,legacyEffectAmount,legacyEffectDetail};
}
function upgradeEntryForStorage(entry={}){const e=normalizeUpgradeEntry(entry);return {...e};}
function parseUpgradeLines(value=''){
  if(Array.isArray(value))return value.map(normalizeUpgradeEntry).filter(e=>e.content||e.specialEffectName||e.rank);
  const rawText=String(value||'').trim();if(!rawText)return [];
  try{const parsed=JSON.parse(rawText);if(Array.isArray(parsed))return parsed.map(normalizeUpgradeEntry).filter(e=>e.content||e.specialEffectName||e.rank);}catch(_){}
  return rawText.split(/\n+/).map(line=>normalizeUpgradeEntry({content:String(line||'').trim()})).filter(e=>e.content||e.specialEffectName||e.rank);
}
function serializeUpgradeEntries(entries=[]){
  return (entries||[]).map(normalizeUpgradeEntry).filter(e=>e.content||e.specialEffectName||e.rank).map(e=>{
    const rankPart=e.rank?` / ランク：${characterPlayerRankLabel(e.rank)}`:'';
    const slotPart=` / 消費枠：${e.slotCost||1}`;
    const legacyPart=e.legacyEffectAmount?` / 引継量：${e.legacyEffectAmount}`:'';
    if(e.content==='素材固有効果')return `素材固有効果：${e.specialEffectName||'名称未設定'}${rankPart}${slotPart}`;
    return `${e.content||'未設定'}${rankPart}${slotPart}${legacyPart}`;
  }).join('\n');
}
function collectUpgradeEntries(slotKey){
  const list=$('equip_'+slotKey+'_upgradeSlots');
  if(!list)return parseUpgradeLines($('equip_'+slotKey+'_upgradeLines')?.value||'');
  return Array.from(list.querySelectorAll('[data-upgrade-row]')).map(row=>normalizeUpgradeEntry({
    content:row.querySelector('[data-upgrade-content]')?.value||'',
    slotCost:row.querySelector('[data-upgrade-slot-cost]')?.value||'',
    specialEffectName:row.querySelector('[data-upgrade-special-name-value]')?.value||'',
    specialEffectDetail:row.querySelector('[data-upgrade-special-detail-value]')?.value||'',
    sourceMaterialId:row.querySelector('[data-upgrade-special-material-id]')?.value||'',
    sourceMaterialPublicId:row.querySelector('[data-upgrade-special-material-public-id]')?.value||'',
    sourceMaterialName:row.querySelector('[data-upgrade-special-material-name]')?.value||'',
    sourceMaterialTarget:row.querySelector('[data-upgrade-special-material-target]')?.value||'',
    legacyEffectAmount:row.querySelector('[data-upgrade-legacy-amount]')?.value||'',
    legacyEffectDetail:row.querySelector('[data-upgrade-legacy-detail]')?.value||''
  })).filter(e=>e.content||e.specialEffectName||e.rank);
}
function equipmentUpgradeLimit(slotKey){
  return clampInt($('equip_' + slotKey + '_upgradeLimit')?.value || 0, 0, 9);
}
function equipmentUpgradeUsedSlots(entries=[]){return parseUpgradeLines(entries).reduce((sum,e)=>sum+Math.max(1,Number(e.slotCost)||1),0);}
function trimUpgradeEntriesToSlotLimit(entries=[],limit=0){
  const out=[],seenSpecialEffects=new Set();let used=0;
  for(const raw of parseUpgradeLines(entries)){
    const e=normalizeUpgradeEntry(raw),cost=Math.max(1,Number(e.slotCost)||1);
    if(e.content==='素材固有効果'&&e.specialEffectName){
      const effectName=String(e.specialEffectName||'').trim();
      if(seenSpecialEffects.has(effectName))continue;
      seenSpecialEffects.add(effectName);
    }
    if(used+cost>limit)break;
    out.push(e);used+=cost;
  }
  return out;
}
function upgradeOptionHtml(slotKey='',selected='',maxSlotCost=Infinity){
  const current=normalizeUpgradeContentName(selected||'');
  const standardEffects=new Set(standardUpgradeMaterialCandidates(slotKey,'',maxSlotCost).map(c=>c.effectName));
  const hasSpecial=specialUpgradeMaterialCandidates(slotKey,null,maxSlotCost).length>0;
  const base=[''].concat(EQUIPMENT_UPGRADE_OPTIONS.filter(v=>v&&((v==='素材固有効果'&&hasSpecial)||standardEffects.has(v))));
  const options=base.map(v=>{
    let label=EQUIPMENT_UPGRADE_OPTION_LABELS[v]||v||'未選択';
    if(v&&v!=='素材固有効果'){
      const candidates=standardUpgradeMaterialCandidates(slotKey,v,maxSlotCost);
      const names=[...new Set(candidates.map(c=>c.materialName).filter(Boolean))];
      const cost=standardUpgradeSlotCostForSelection(slotKey,v,maxSlotCost);
      if(names.length)label+=`（${cost}枠 / ${names[0]}${names.length>1?` ほか${names.length-1}種`:''}）`;
    }else if(v==='素材固有効果'){
      const candidates=specialUpgradeMaterialCandidates(slotKey,null,maxSlotCost);
      if(candidates.length)label+=`（${candidates.length}件）`;
    }
    return `<option value="${esc(v)}" ${v===current?'selected':''}>${esc(label)}</option>`;
  });
  if(current&&!base.includes(current)){
    const label=(EQUIPMENT_UPGRADE_OPTION_LABELS[current]||current)+`（保存済み）`;
    options.push(`<option value="${esc(current)}" selected>${esc(label)}</option>`);
  }
  return options.join('');
}
function specialUpgradeTargetTokensForSlot(slotKey=''){
  const index=inventoryItemIndexForEquipmentSlot(slotKey);
  const item=index>=0?(inventoryItemsState[index]||null):null;
  const type=normalizeEquipmentType(item?.itemCategory||item?.category||$('equip_'+slotKey+'_type')?.value||'なし');
  const kind=String(item?.kind||'').trim();
  const tokens=new Set();
  if(['盾','大盾'].includes(type)||String(item?.itemType||'')==='盾'){tokens.add('防具');tokens.add('盾');}
  else if(kind==='防具'||slotKey==='armor')tokens.add('防具');
  else if(kind==='装飾品'||/^accessory/.test(slotKey))return tokens;
  else if(spellContainerKind(type)){
    if(/祈祷/.test(type))tokens.add('祈祷書');
    else tokens.add('魔導書');
  }else if(type&&type!=='なし'){
    tokens.add('武器');tokens.add(type);
    if(type==='クロスボウ')tokens.add('クロスボウ');
    if(type==='ヘヴィクロスボウ')tokens.add('ヘヴィクロスボウ');
  }
  return tokens;
}
function specialUpgradeTargetMatches(target='',tokens=new Set()){
  const parts=String(target||'').split(/[・、,，\/／\s]+/u).map(v=>v.trim()).filter(Boolean);
  return !parts.length||parts.some(part=>tokens.has(part));
}
function selectedEquipmentInventoryItemForUpgrade(slotKey=''){
  const index=inventoryItemIndexForEquipmentSlot(slotKey);
  return index>=0?(inventoryItemsState[index]||null):null;
}
function equipmentUpgradeMaterialMinimumRank(slotKey=''){
  const item=selectedEquipmentInventoryItemForUpgrade(slotKey);
  return Math.max(0,Number(characterNumericRankValue(item?.upgradeMaterialMinRank||item?.rank,0))||0);
}
function equipmentUpgradeMaterialRankEligible(item={},slotKey=''){
  const minRank=equipmentUpgradeMaterialMinimumRank(slotKey);
  if(minRank<=0)return true;
  const materialRank=Number(characterNumericRankValue(item.rank,0))||0;
  return materialRank>=minRank;
}
function equipmentUpgradeMasterMaterialCandidates(slotKey=''){
  const tokens=specialUpgradeTargetTokensForSlot(slotKey);
  const minRank=equipmentUpgradeMaterialMinimumRank(slotKey);
  const byKey=new Map();
  for(const raw of (DB_INITIAL_ITEM_MASTER||[])){
    const item=normalizeInventoryItem(dbItemToInventoryItem(raw));
    const effect=String(item.equipmentUpgradeEffect||'').trim();
    if(item.kind!=='素材'||!effect)continue;
    const materialRank=Number(characterNumericRankValue(item.rank,0))||0;
    if(minRank>0&&materialRank<minRank)continue;
    if(!specialUpgradeTargetMatches(item.equipmentUpgradeTarget,tokens))continue;
    const key=String(item.masterId||item.id||item.publicId||item.name||'').trim();
    if(key&&!byKey.has(key))byKey.set(key,item);
  }
  return [...byKey.values()];
}
function standardUpgradeMaterialCandidates(slotKey='',effectName='',maxSlotCost=Infinity){
  const requested=normalizeUpgradeContentName(effectName||'');
  return equipmentUpgradeMasterMaterialCandidates(slotKey).filter(item=>{
    const effect=normalizeUpgradeContentName(item.equipmentUpgradeEffect||'');
    const cost=Math.max(1,Math.min(3,Number(item.equipmentUpgradeSlotCost)||upgradeDefaultSlotCost(effect)));
    return isStandardUpgradeEffectName(effect)&&(!requested||effect===requested)&&cost<=Number(maxSlotCost||Infinity);
  }).map(item=>({
    key:String(item.id||item.masterId||item.publicId||item.name||''),
    effectName:normalizeUpgradeContentName(item.equipmentUpgradeEffect||''),
    detail:String(item.equipmentUpgradeDetail||'').trim()||standardUpgradeDetailText({content:item.equipmentUpgradeEffect}),
    materialId:String(item.id||item.masterId||'').trim(),materialPublicId:String(item.publicId||'').trim(),
    materialName:String(item.name||'').trim(),target:String(item.equipmentUpgradeTarget||'').trim(),
    rank:characterPlayerRankLabel(item.rank),slotCost:Math.max(1,Math.min(3,Number(item.equipmentUpgradeSlotCost)||upgradeDefaultSlotCost(item.equipmentUpgradeEffect)))
  })).sort((a,b)=>a.effectName.localeCompare(b.effectName,'ja')||characterNumericRankValue(a.rank,9999)-characterNumericRankValue(b.rank,9999)||a.materialName.localeCompare(b.materialName,'ja'));
}
function standardUpgradeSlotCostForSelection(slotKey='',effectName='',maxSlotCost=Infinity){
  const costs=standardUpgradeMaterialCandidates(slotKey,effectName,maxSlotCost).map(c=>Number(c.slotCost)||upgradeDefaultSlotCost(effectName));
  return costs.length?Math.min(...costs):upgradeDefaultSlotCost(effectName);
}
function standardUpgradeAvailabilityText(slotKey='',entry={}){
  const e=normalizeUpgradeEntry(entry),candidates=standardUpgradeMaterialCandidates(slotKey,e.content);
  const detail=String(candidates[0]?.detail||standardUpgradeDetailText(e)||'').trim();
  const materials=[...new Map(candidates.map(c=>[`${c.materialName}::${c.rank}`,`${c.materialName}${c.rank?`（${c.rank}）`:''}`])).values()];
  const minRank=equipmentUpgradeMaterialMinimumRank(slotKey);
  const lines=[detail?`能力詳細：${detail}`:''];
  if(materials.length)lines.push(`対応素材：${materials.join('、')}`);
  else lines.push(`対応素材：${minRank?`★${minRank}以上で`:''}この装備に使用可能な素材がありません。`);
  return lines.filter(Boolean).join('\n');
}
function specialUpgradeEffectNameForMaterial(item={}){
  const effect=String(item.equipmentUpgradeEffect||'').trim();
  return effect&&!isStandardUpgradeEffectName(effect)?effect:'';
}
function specialUpgradeMaterialCandidates(slotKey='',blockedEffectNames=null,maxSlotCost=Infinity){
  const blocked=blockedEffectNames instanceof Set?blockedEffectNames:new Set(blockedEffectNames||[]);
  return equipmentUpgradeMasterMaterialCandidates(slotKey).filter(item=>{
    const effectName=specialUpgradeEffectNameForMaterial(item);
    const cost=Math.max(1,Math.min(3,Number(item.equipmentUpgradeSlotCost)||2));
    return !!effectName&&!blocked.has(effectName)&&cost<=Number(maxSlotCost||Infinity);
  }).map(item=>({
    key:String(item.id||item.masterId||item.publicId||item.name||''),effectName:specialUpgradeEffectNameForMaterial(item),
    detail:String(item.equipmentUpgradeDetail||'').trim(),materialId:String(item.id||item.masterId||'').trim(),
    materialPublicId:String(item.publicId||'').trim(),materialName:String(item.name||'').trim(),target:String(item.equipmentUpgradeTarget||'').trim(),
    rank:characterPlayerRankLabel(item.rank),slotCost:Math.max(1,Math.min(3,Number(item.equipmentUpgradeSlotCost)||2))
  })).sort((a,b)=>a.effectName.localeCompare(b.effectName,'ja')||characterNumericRankValue(a.rank,9999)-characterNumericRankValue(b.rank,9999)||a.materialName.localeCompare(b.materialName,'ja'));
}
function specialUpgradeBlockedEffectNames(entries=[],currentIndex=-1){
  const blocked=new Set();
  parseUpgradeLines(entries).forEach((raw,index)=>{
    if(index===currentIndex)return;
    const entry=normalizeUpgradeEntry(raw);
    if(entry.content==='素材固有効果'&&entry.specialEffectName)blocked.add(String(entry.specialEffectName).trim());
  });
  return blocked;
}
function specialUpgradeEffectNamesInOtherRows(slotKey='',currentRow=null){
  const list=$('equip_'+slotKey+'_upgradeSlots'),blocked=new Set();if(!list)return blocked;
  list.querySelectorAll('[data-upgrade-row]').forEach(row=>{
    if(row===currentRow)return;
    const name=String(row.querySelector('[data-upgrade-special-name-value]')?.value||'').trim();
    if(name)blocked.add(name);
  });
  return blocked;
}
function specialUpgradeCandidateForEntry(slotKey='',entry={}){
  const e=normalizeUpgradeEntry(entry),candidates=specialUpgradeMaterialCandidates(slotKey);
  return candidates.find(c=>e.sourceMaterialId&&(c.materialId===e.sourceMaterialId||c.key===e.sourceMaterialId))
    ||candidates.find(c=>e.sourceMaterialPublicId&&c.materialPublicId===e.sourceMaterialPublicId)
    ||candidates.find(c=>c.effectName===e.specialEffectName&&(!e.specialEffectDetail||c.detail===e.specialEffectDetail))||null;
}
function specialUpgradeCandidateByKey(slotKey='',key='',maxSlotCost=Infinity){return specialUpgradeMaterialCandidates(slotKey,null,maxSlotCost).find(c=>c.key===String(key||''))||null;}
function specialUpgradeDetailText(candidate=null,entry={}){
  const e=normalizeUpgradeEntry(entry),name=String(candidate?.effectName||e.specialEffectName||'').trim(),detail=String(candidate?.detail||e.specialEffectDetail||'').trim(),material=String(candidate?.materialName||e.sourceMaterialName||'').trim(),target=String(candidate?.target||e.sourceMaterialTarget||'').trim();
  return [name?`効果名：${name}`:'',detail?`能力詳細：${detail}`:'',material?`付与素材：${material}`:'',target?`強化対象：${target}`:''].filter(Boolean).join('\n');
}
function specialUpgradeSelectorHtml(slotKey='',entry={},blockedEffectNames=null,maxSlotCost=Infinity){
  const e=normalizeUpgradeEntry(entry),selected=specialUpgradeCandidateForEntry(slotKey,e),selectedKey=selected?.key||'',blocked=blockedEffectNames instanceof Set?blockedEffectNames:new Set(blockedEffectNames||[]),candidates=specialUpgradeMaterialCandidates(slotKey,blocked,maxSlotCost),hasSaved=!!e.specialEffectName&&!selected;
  const options=[`<option value="">特殊効果を選択</option>`].concat(candidates.map(c=>`<option value="${esc(c.key)}" ${c.key===selectedKey?'selected':''}>${esc(c.effectName)}（${esc(c.materialName)}${c.rank?` / ${esc(c.rank)}`:''} / ${c.slotCost}枠）</option>`));
  if(hasSaved)options.push(`<option value="__saved__" selected>${esc(e.specialEffectName)}（保存済み）</option>`);
  const resolved=selected||null,effectName=resolved?.effectName||e.specialEffectName||'',detail=resolved?.detail||e.specialEffectDetail||'',materialId=resolved?.materialId||e.sourceMaterialId||'',materialPublicId=resolved?.materialPublicId||e.sourceMaterialPublicId||'',materialName=resolved?.materialName||e.sourceMaterialName||'',target=resolved?.target||e.sourceMaterialTarget||'';
  return `<div class="field"><label>特殊効果名</label><select data-upgrade-special-select data-equipment-input="1">${options.join('')}</select>
    <input type="hidden" data-upgrade-special-name-value value="${esc(effectName)}" /><input type="hidden" data-upgrade-special-detail-value value="${esc(detail)}" />
    <input type="hidden" data-upgrade-special-material-id value="${esc(materialId)}" /><input type="hidden" data-upgrade-special-material-public-id value="${esc(materialPublicId)}" />
    <input type="hidden" data-upgrade-special-material-name value="${esc(materialName)}" /><input type="hidden" data-upgrade-special-material-target value="${esc(target)}" />
  </div>`;
}
function applySpecialUpgradeSelection(row,slotKey='',maxSlotCost=Infinity){
  const select=row?.querySelector('[data-upgrade-special-select]');if(!select)return;
  let candidate=select.value&&select.value!=='__saved__'?specialUpgradeCandidateByKey(slotKey,select.value,maxSlotCost):null;
  const blocked=specialUpgradeEffectNamesInOtherRows(slotKey,row);
  if(candidate&&blocked.has(candidate.effectName)){
    select.value='';candidate=null;
    if(typeof showToast==='function')showToast('同じ特殊効果は同一装備へ重複して付与できません。','error');
  }
  const set=(selector,value)=>{const el=row.querySelector(selector);if(el)el.value=String(value||'');};
  if(candidate){set('[data-upgrade-special-name-value]',candidate.effectName);set('[data-upgrade-special-detail-value]',candidate.detail);set('[data-upgrade-special-material-id]',candidate.materialId);set('[data-upgrade-special-material-public-id]',candidate.materialPublicId);set('[data-upgrade-special-material-name]',candidate.materialName);set('[data-upgrade-special-material-target]',candidate.target);const slot=row.querySelector('[data-upgrade-slot-cost]');if(slot)slot.value=String(candidate.slotCost);const badge=row.querySelector('[data-upgrade-slot-badge]');if(badge)badge.textContent=`使用枠：${candidate.slotCost}枠`;}
  else if(!select.value){['[data-upgrade-special-name-value]','[data-upgrade-special-detail-value]','[data-upgrade-special-material-id]','[data-upgrade-special-material-public-id]','[data-upgrade-special-material-name]','[data-upgrade-special-material-target]'].forEach(s=>set(s,''));}
  const entry=normalizeUpgradeEntry({content:'素材固有効果',slotCost:row.querySelector('[data-upgrade-slot-cost]')?.value||'',specialEffectName:row.querySelector('[data-upgrade-special-name-value]')?.value||'',specialEffectDetail:row.querySelector('[data-upgrade-special-detail-value]')?.value||'',sourceMaterialName:row.querySelector('[data-upgrade-special-material-name]')?.value||'',sourceMaterialTarget:row.querySelector('[data-upgrade-special-material-target]')?.value||''});
  const view=row.querySelector('[data-upgrade-special-detail-view]');if(view)view.textContent=specialUpgradeDetailText(candidate,entry)||'この装備に使用できる特殊効果から選択してください。';
}
function renderEquipmentUpgradeSlots(slotKey, sourceEntries=null){
  const list=$('equip_'+slotKey+'_upgradeSlots'),hidden=$('equip_'+slotKey+'_upgradeLines'),details=$('equip_'+slotKey+'_upgradeDetails');if(!list)return;
  const selectedItem=selectedEquipmentInventoryItemForUpgrade(slotKey),antiqueLocked=isAntiqueIndividualItem(selectedItem);
  const limit=equipmentUpgradeLimit(slotKey),rawEntries=sourceEntries!==null?parseUpgradeLines(sourceEntries):collectUpgradeEntries(slotKey),entries=trimUpgradeEntriesToSlotLimit(rawEntries,limit),usage=$('equip_'+slotKey+'_upgradeUsage');
  const used=equipmentUpgradeUsedSlots(entries),remaining=Math.max(0,limit-used),limitInput=$('equip_'+slotKey+'_upgradeLimit');
  if(antiqueLocked){
    if(limitInput)limitInput.disabled=true;
    if(usage)usage.textContent=`固定済み強化枠：${used} / ${limit}（追加・変更不可）`;
    if(details)details.style.display=limit>0?'':'none';
    if(limit<=0){list.innerHTML='<div class="small">固定強化なし（追加・変更不可）</div>';if(hidden)hidden.value='';return;}
    list.innerHTML=entries.length?entries.map((rawEntry,i)=>{const entry=normalizeUpgradeEntry(rawEntry||{});const name=entry.content==='素材固有効果'?(entry.specialEffectName||'固有強化'):(entry.content||'強化');const detail=entry.content==='素材固有効果'?entry.specialEffectDetail:standardUpgradeDetailText(entry);return `<div class="equipment-upgrade-row"><div><b>固定強化 ${i+1}：${esc(name)}</b></div><div class="equipment-upgrade-slot-badge">使用枠：${Math.max(1,Number(entry.slotCost)||1)}枠</div>${detail?`<div class="equipment-upgrade-effect-detail">${esc(detail)}</div>`:''}</div>`;}).join(''):'<div class="small">固定強化なし（追加・変更不可）</div>';
    if(hidden)hidden.value=serializeUpgradeEntries(entries);return;
  }
  if(limitInput)limitInput.disabled=currentMode==='view';
  if(usage)usage.textContent=`使用済み強化枠：${used} / ${limit}（残り${remaining}枠）`;if(details)details.style.display=limit>0?'':'none';
  if(limit<=0){list.innerHTML='<div class="small">この装備は強化できません。</div>';if(hidden)hidden.value='';return;}
  const rowEntries=entries.slice();if(remaining>0)rowEntries.push(normalizeUpgradeEntry({}));
  list.innerHTML=rowEntries.map((rawEntry,i)=>{
    const entry=normalizeUpgradeEntry(rawEntry||{}),currentCost=entry.content?Math.max(1,Number(entry.slotCost)||1):0,maxSlotCost=Math.max(0,limit-(used-currentCost));
    const special=entry.content==='素材固有効果',blockedSpecialEffects=specialUpgradeBlockedEffectNames(entries,i);
    const effectField=special?specialUpgradeSelectorHtml(slotKey,entry,blockedSpecialEffects,maxSlotCost):`<input type="hidden" data-upgrade-legacy-amount value="${esc(entry.legacyEffectAmount||'')}" /><input type="hidden" data-upgrade-legacy-detail value="${esc(entry.legacyEffectDetail||'')}" /><div class="equipment-upgrade-effect-detail" data-upgrade-effect-detail>${esc(entry.content?standardUpgradeAvailabilityText(slotKey,entry):'この装備に使用できる強化内容を選択してください。')}</div>`;
    const specialDetail=special?specialUpgradeDetailText(specialUpgradeCandidateForEntry(slotKey,entry),entry):'';
    const slotCost=entry.content?Math.max(1,Number(entry.slotCost)||upgradeDefaultSlotCost(entry.content)):0;
    return `<div class="equipment-upgrade-row" data-upgrade-row="${i}" data-upgrade-max-cost="${maxSlotCost}"><div class="field"><label>強化内容 ${i+1}</label><select data-upgrade-content data-equipment-input="1">${upgradeOptionHtml(slotKey,entry.content,maxSlotCost)}</select></div>${effectField}<input type="hidden" data-upgrade-slot-cost value="${slotCost||''}" /><div class="equipment-upgrade-slot-badge" data-upgrade-slot-badge>${slotCost?`使用枠：${slotCost}枠`:'未選択'}</div>${special?`<div class="equipment-upgrade-special-detail" data-upgrade-special-detail-view>${esc(specialDetail||'この装備に使用できる特殊効果から選択してください。')}</div>`:''}</div>`;
  }).join('')||'<div class="small">強化枠をすべて使用しています。</div>';
  if(hidden)hidden.value=serializeUpgradeEntries(entries);if(typeof updateEquipmentFieldAvailability==='function')updateEquipmentFieldAvailability();
}
function inventoryItemIndexForEquipmentKey(itemKey=''){
  const selectedKey = String(itemKey || '').trim();
  if(!selectedKey) return -1;
  return inventoryIndexByLookup(selectedKey,'');
}
function inventoryItemIndexForEquipmentSlot(slotKey=''){
  const selectedKey = String($('equip_' + slotKey + '_itemSelect')?.value || '').trim();
  return inventoryItemIndexForEquipmentKey(selectedKey);
}
function syncEquipmentModifiersToInventoryItem(slotKey='', itemKey=''){
  // 装備補正は装備固有の読取専用値。プレイヤー側の装備枠から倉庫個体へ書き戻さない。
  return false;
}
function syncAllEquipmentModifiersToInventory(){
  // 装備補正は読取専用のため同期処理なし。
}
function syncEquipmentUpgradeToInventoryItem(slotKey='', itemKey=''){
  const selectedKey = String(itemKey || $('equip_' + slotKey + '_itemSelect')?.value || '').trim();
  const index = inventoryItemIndexForEquipmentKey(selectedKey);
  if(index < 0) return false;
  const current = inventoryItemsState[index];
  if(!['武器','防具','装飾品'].includes(current.kind)) return false;
  if(isAntiqueIndividualItem(current)) return false;
  const limit = equipmentUpgradeLimit(slotKey);
  const entries = trimUpgradeEntriesToSlotLimit(collectUpgradeEntries(slotKey),limit).map(upgradeEntryForStorage);
  const upgradeLimit=String($('equip_' + slotKey + '_upgradeLimit')?.value || '').trim();
  const upgradeLines=serializeUpgradeEntries(entries);
  if(String(current.upgradeLimit||'')===upgradeLimit && String(current.upgradeLines||'')===upgradeLines)return false;
  inventoryItemsState[index] = normalizeInventoryItem({
    ...current,
    upgradeLimit,
    upgradeEntries: entries,
    upgradeLines
  });
  invalidateInventoryDerivedCache();
  return true;
}
function syncAllEquipmentUpgradesToInventory(){
  for(const slot of EQUIPMENT_SLOTS){
    if(slot.kind !== 'carry') syncEquipmentUpgradeToInventoryItem(slot.key);
  }
}
function syncEquipmentUpgradeHidden(slotKey){
  const hidden = $('equip_' + slotKey + '_upgradeLines');
  if(hidden) hidden.value = serializeUpgradeEntries(trimUpgradeEntriesToSlotLimit(collectUpgradeEntries(slotKey), equipmentUpgradeLimit(slotKey)));
  syncEquipmentUpgradeToInventoryItem(slotKey);
}
function refreshSelectionListsForTarget(target=null){
  if(target && target.id?.startsWith('equip_') && target.id.endsWith('_itemSelect')) {
    const slotKey = target.id.replace(/^equip_/, '').replace(/_itemSelect$/, '');
    const itemKey = String(target.dataset.previousItemKey || target.value || '').trim();
    if(itemKey){
      syncEquipmentModifiersToInventoryItem(slotKey, itemKey);
      syncEquipmentUpgradeToInventoryItem(slotKey, itemKey);
      syncEquippedSpellSetToInventoryItem(slotKey, itemKey);
    }
    refreshEquipmentItemSelects({slotKeys:[slotKey]});
  }
  if(target && target.id?.startsWith('equip_') && target.id.endsWith('_type')) refreshEquipmentTypeSelects();
  // 術式セレクトはクリック直前に作り直さない。
  // pointerdown / focusin 中にDOMを置換すると、ブラウザのプルダウンが開かず選択不能になる。
  if(target && target.classList?.contains('spell-slot-select')) return;
  if(target && target.id === 'bagSelect') renderBagSelect();
  if(target && target.id === 'quiverSelect') renderQuiverControls();
}

function setSpellSelectValues(slotKey, values) {
  const hidden = $('equip_' + slotKey + '_setSpells');
  const names = Array.isArray(values) ? values : splitFormulaList(values || '');
  if (hidden) {
    hidden.value = names.join('\n');
    hidden.dataset.pendingSpells = hidden.value;
  }
  const list = $('equip_' + slotKey + '_spellSlotList');
  if (list) {
    list.dataset.pendingSpells = names.join('\n');
    const selects = Array.from(list.querySelectorAll('select.spell-slot-select'));
    if (selects.length) {
      selects.forEach((sel, i) => { sel.value = names[i] || ''; });
      syncSpellSetHidden(slotKey);
    }
    return;
  }
  const el = hidden;
  if (!el) return;
  if (el.tagName === 'SELECT') {
    const set = new Set(names);
    Array.from(el.options || []).forEach(opt => { opt.selected = set.has(opt.value); });
  }
}
function refreshSpellSetSelect(slotKey, info=null) {
  const hidden = $('equip_' + slotKey + '_setSpells');
  const list = $('equip_' + slotKey + '_spellSlotList');
  if (!hidden && !list) return;
  const type = $('equip_' + slotKey + '_type')?.value || 'なし';
  const spellInfo = info || spellContainerKind(type);
  const current = selectedSpellNames(slotKey);
  const pending = splitFormulaList((hidden && (hidden.value || hidden.dataset.pendingSpells)) || (list && list.dataset.pendingSpells) || '');
  const keep = current.length ? current : pending;
  if (!spellInfo) {
    if (list) list.innerHTML = '';
    if (hidden) { hidden.value = ''; hidden.dataset.pendingSpells = ''; }
    return;
  }
  const limit = spellSlotLimitForType(type, getSkillAlloc(), slotKey);
  const rows = ownedSpellRowsForInfo(spellInfo);
  const safeLimit = Math.max(0, Number(limit) || 0);
  if (list) {
    if (!safeLimit) {
      list.innerHTML = '<div class="small">この装備にはセットできる術式枠がありません。</div>';
      if (hidden) { hidden.value = ''; hidden.dataset.pendingSpells = ''; }
      return;
    }
    const selectedBySlot = keep.slice(0, safeLimit);
    const rowOptions = rows.map(row => ({ value: String(row.name || ''), label: spellOptionLabel(row) })).filter(o => o.value);
    list.innerHTML = Array.from({ length: safeLimit }, (_, i) => {
      const selectedValue = selectedBySlot[i] || '';
      const options = ['<option value="">術式を選択してください</option>'].concat(rowOptions.map(opt =>
        `<option value="${esc(opt.value)}" ${opt.value === selectedValue ? 'selected' : ''}>${esc(opt.label)}</option>`
      ));
      const detailRow = findOwnedSpellByName(selectedValue, spellInfo);
      return `<div class="spell-slot-row"><label>${i + 1}枠目</label><select class="spell-slot-select" data-slot-key="${esc(slotKey)}" data-slot-index="${i}" data-equipment-input="1">${options.join('')}</select><div class="spell-slot-detail-box">${detailRow ? spellDetailHtml(detailRow) : '<div class="spell-detail-empty">術式を選択すると、ここに説明・効果を表示します。</div>'}</div></div>`;
    }).join('');
    if (!rows.length) list.insertAdjacentHTML('beforeend', '<div class="small">倉庫に対応する術式がありません。</div>');
    list.dataset.pendingSpells = selectedBySlot.join('\n');
    syncSpellSetHidden(slotKey);
    updateSpellSlotDetails(slotKey);
    updateEquipmentFieldAvailability();
    return;
  }
  const el = hidden;
  if (!el || el.tagName !== 'SELECT') return;
  const options = rows.map(row => `<option value="${esc(row.name)}">${esc(spellOptionLabel(row))}</option>`);
  el.innerHTML = options.length ? options.join('') : '<option value="" disabled>倉庫に対応する術式がありません</option>';
  const keepSet = new Set(keep.slice(0, safeLimit));
  Array.from(el.options || []).forEach(opt => { opt.selected = keepSet.has(opt.value); });
  el.dataset.pendingSpells = Array.from(keepSet).join('\n');
}
function refreshSpellSetSelects({activeOnly=false}={}) {
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind === 'carry') continue;
    if(activeOnly){
      const type=$('equip_' + slot.key + '_type')?.value || 'なし';
      if(!spellContainerKind(type))continue;
    }
    refreshSpellSetSelect(slot.key);
  }
}
function enforceSpellSetLimit(slotKey) {
  const type = $('equip_' + slotKey + '_type')?.value || 'なし';
  const limit = spellSlotLimitForType(type, getSkillAlloc(), slotKey);
  const names = selectedSpellNames(slotKey);
  if (!limit) {
    setSpellSelectValues(slotKey, []);
    return;
  }
  if (names.length > limit) {
    setSpellSelectValues(slotKey, names.slice(0, limit));
    showToast(`セットできる術式は${limit}件までです。`, 'warn');
  } else {
    syncSpellSetHidden(slotKey);
  }
}
function updateSpellSlotHints() {
  const alloc = getSkillAlloc();
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind === 'carry') continue;
    const type = $('equip_' + slot.key + '_type')?.value || 'なし';
    const info = spellContainerKind(type);
    const box = $('equip_' + slot.key + '_spellFields');
    if (!box) continue;
    box.classList.toggle('active', !!info);
    refreshSpellSetSelect(slot.key, info);
    const label = $('equip_' + slot.key + '_spellLabel');
    const help = $('equip_' + slot.key + '_spellHelp');
    if (info && label) {
      const limit = spellSlotLimitForType(type, alloc, slot.key);
      const used = selectedSpellNames(slot.key).length;
      const skillPoint = info.growsWithPoint ? getSkillPointTotal(info.pointKey, alloc) : 0;
      const base = info.baseSlots || 0;
      const equipmentBonus = selectedSpellSlotBonus(slot.key);
      const upgrade = spellSlotUpgradeBonus(slot.key);
      const formula = info.growsWithPoint
        ? `基本${base}+${info.label}P${skillPoint}+装備${equipmentBonus}+強化${upgrade}`
        : `基本${base}+装備${equipmentBonus}+強化${upgrade}`;
      label.textContent = `${info.label}枠 ${limit}（${formula}） / セット${used}件`;
      label.classList.toggle('warning', used > limit);
      if (help) help.textContent = ownedSpellRowsForInfo(info).length ? `倉庫の${info.label}術式から選択してください。` : `倉庫に${info.label}術式がありません。倉庫タブで術式を登録してください。`;
    }
  }
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind !== 'carry') updateSpellSlotDetails(slot.key);
  }
  updateEquipmentFieldAvailability();
}
function equipmentUpgradeEntriesForStage(item={}){
  const entries=Array.isArray(item?.upgradeEntries)&&item.upgradeEntries.length
    ? item.upgradeEntries
    : (item?.upgradeLines||item?.upgradeEntries||'');
  return parseUpgradeLines(entries);
}
function equipmentUpgradeStage(item={},patterns=[]){
  return equipmentUpgradeEntriesForStage(item).reduce((sum,e)=>{
    if(!patterns.some(p=>p.test(String(e.content||''))))return sum;
    const inherited=Math.max(0,Math.floor(Number(e.legacyEffectAmount)||0));
    return sum+(inherited||1);
  },0);
}
function equipmentUpgradeStageFromSources(patterns=[],...sources){
  for(const source of sources){
    if(!source)continue;
    const entries=equipmentUpgradeEntriesForStage(source);
    if(!entries.length)continue;
    return entries.reduce((sum,e)=>{
      if(!patterns.some(p=>p.test(String(e.content||''))))return sum;
      const inherited=Math.max(0,Math.floor(Number(e.legacyEffectAmount)||0));
      return sum+(inherited||1);
    },0);
  }
  return 0;
}
function stagedDiceUpgradeFormula(stage=0){
  const n=Math.max(0,Math.floor(Number(stage)||0));
  if(!n)return '';
  return n===1?'1':`1D${n}`;
}
function fixedUpgradeFormula(stage=0){
  const n=Math.max(0,Math.floor(Number(stage)||0));
  return n?String(n):'';
}
function formulaWithSeparatedTerms(formula='',terms=[]){
  const base=normalizePaletteFormula(formula);if(!base)return '';
  const clean=(terms||[]).map(v=>normalizePaletteFormula(String(v??'')).trim()).filter(v=>v&&v!=='0'&&v!=='+0'&&v!=='-0');
  if(!clean.length)return base;
  const repeated=base.match(/^(.+?)([×xX*]\s*\d+\s*回)$/);
  const combine=parts=>parts.join('+').replace(/\+\-/g,'-').replace(/\+{2,}/g,'+');
  if(repeated)return `(${combine([repeated[1].trim(),...clean])})${repeated[2].replace(/[xX*]/,'×')}`;
  return combine([base,...clean]);
}
function splitPaletteIndependentRepeatedEffect(formula=''){
  const base=normalizePaletteFormula(formula);
  const m=base.match(/^(.+?)\+\s*(防御値無視|防御無視)\s*(.+?[×xX*]\s*\d+\s*回)$/);
  if(!m)return null;
  return {primary:m[1].trim(),secondary:m[3].trim().replace(/[xX*]/,'×'),secondaryNote:'防御値無視'};
}
function paletteSpellDamageFormulaParts(rawFormula='',skillBonus=0,variableTerm='',fixedTerm=''){
  const split=splitPaletteIndependentRepeatedEffect(rawFormula);
  if(!split)return {primary:paletteSpellFormulaWithSeparatedBonuses(rawFormula,skillBonus,variableTerm,fixedTerm),secondary:'',secondaryNote:''};
  return {primary:paletteSpellFormulaWithSeparatedBonuses(split.primary,skillBonus,variableTerm,fixedTerm),secondary:split.secondary,secondaryNote:split.secondaryNote};
}
function equipmentDamageDisplayInfo(slotKey='',equipment=getEquipmentState(),alloc=getSkillAlloc()){
  const eq=equipment?.[slotKey]||{},source=findCsItemById(eq.itemId||'');
  const item=normalizeInventoryItem({...(source||{}),...(eq||{}),type:eq.type||source?.itemCategory||source?.category||''});
  const type=normalizeEquipmentType(eq.type||item.itemCategory||item.category||'なし');
  if(!eq.name||spellContainerKind(type)||['盾','大盾'].includes(type))return {formula:'',breakdown:''};
  const base=normalizePaletteFormula(eq.power||item.power||'');if(!base)return {formula:'',breakdown:''};
  const skillKey=paletteDamageSkillKeyForItem({...item,type},slotKey);
  const skillName=skillKey==='shoot'?'射撃':skillKey==='melee'?'近接':'';
  const skillBonus=skillKey?allocatedSkillPoints(skillKey,alloc):0;
  const powerStage=equipmentUpgradeStageFromSources([/^威力強化$/],source,eq,item);
  const fixedPowerStage=equipmentUpgradeStageFromSources([/^威力固定強化$/],source,eq,item);
  const powerTerm=stagedDiceUpgradeFormula(powerStage),fixedPowerTerm=fixedUpgradeFormula(fixedPowerStage);
  const accessoryDamageBonus=skillKey==='melee'?equipmentContextModifierTotal(equipment,'damage:melee'):0;
  let offhandBonus=0;
  const twoHand=isPaletteTwoHandEquipment({...item,type},source);
  if(!twoHand&&HAND_SLOT_KEYS.includes(slotKey)){
    const otherKey=slotKey==='rightHand'?'leftHand':'rightHand',other=equipment?.[otherKey]||{},otherSource=findCsItemById(other.itemId||'');
    const otherMerged=normalizeInventoryItem({...(otherSource||{}),...(other||{}),type:other.type||otherSource?.itemCategory||otherSource?.category||''});
    if(canUseAsDualWeapon(otherMerged)&&!isPaletteTwoHandEquipment(otherMerged,otherSource))offhandBonus=paletteOffhandBonusForItem(otherMerged,otherSource);
  }
  const formula=formulaWithSeparatedTerms(base,[offhandBonus||'',skillBonus||'',powerTerm,fixedPowerTerm,accessoryDamageBonus||'']);
  const breakdown=[`武器ダメージ ${base}`,offhandBonus?`副手攻撃値 ${signedNumberText(offhandBonus)}`:'',skillName&&skillBonus?`${skillName} +${skillBonus}`:'',powerTerm?`威力強化${powerStage} +${powerTerm}`:'',fixedPowerTerm?`威力固定強化${fixedPowerStage} +${fixedPowerTerm}`:'',accessoryDamageBonus?`装飾品 +${accessoryDamageBonus}`:''].filter(Boolean).join(' / ');
  return {formula,breakdown};
}
function setEquipmentDisplayText(id,value='—'){const el=$(id);if(el)el.textContent=(value===undefined||value===null)?'—':String(value);}
function updateEquipmentReadOnlyDisplays(){
  const equipment=getEquipmentState(),alloc=getSkillAlloc();
  for(const slot of EQUIPMENT_SLOTS){
    if(slot.kind==='carry')continue;
    const eq=equipment[slot.key]||{},type=normalizeEquipmentType(eq.type||'なし');
    setEquipmentDisplayText('equip_'+slot.key+'_typeDisplay',type&&type!=='なし'?type:'—');
    setEquipmentDisplayText('equip_'+slot.key+'_elementDisplay',eq.element||'—');
    setEquipmentDisplayText('equip_'+slot.key+'_offhandDisplay',eq.offhand||'—');
    setEquipmentDisplayText('equip_'+slot.key+'_reloadTurnsDisplay',eq.reloadTurns!==''?`${eq.reloadTurns}ターン`:'—');
    setEquipmentDisplayText('equip_'+slot.key+'_targetDisplay',eq.target||'—');
    setEquipmentDisplayText('equip_'+slot.key+'_checkTypeDisplay',eq.checkType||canonicalWeaponUsageSkill({itemCategory:type})||'—');
    const damage=equipmentDamageDisplayInfo(slot.key,equipment,alloc);
    setEquipmentDisplayText('equip_'+slot.key+'_powerDisplay',damage.formula||'—');
    setEquipmentDisplayText('equip_'+slot.key+'_powerBreakdown',damage.breakdown||'');
    setEquipmentDisplayText('equip_'+slot.key+'_descriptionDisplay',eq.description||'—');
    setEquipmentDisplayText('equip_'+slot.key+'_noteDisplay',eq.note||'—');
  }
  for(const slot of EQUIPMENT_SLOTS.filter(s=>s.kind==='carry')){
    const eq=equipment[slot.key]||{};
    setEquipmentDisplayText('equip_'+slot.key+'_descriptionDisplay',eq.description||'—');
    setEquipmentDisplayText('equip_'+slot.key+'_noteDisplay',eq.note||'—');
    const detail=$('equip_'+slot.key+'_itemDetail');
    if(detail){
      const source=findCsItemById(eq.itemId||'') || warehouseItemByKey(eq.itemId||'',eq.name||'');
      detail.innerHTML=ownedItemDetailHtml(source || {...eq,kind:'アイテム'}, eq.count || 1);
    }
  }
}
function updateEquipmentSummaries() {
  for (const slot of EQUIPMENT_SLOTS) {
    const el = $('equip_' + slot.key + '_summary');
    if (!el) continue;
    const name = $('equip_' + slot.key + '_name')?.value?.trim() || '';
    const type = $('equip_' + slot.key + '_type')?.value || 'なし';
    const count = $('equip_' + slot.key + '_count')?.value || '';
    if (slot.kind === 'carry') {
      el.textContent = name ? `${name}${count ? ' ×' + count : ''}` : '未設定';
      const effectEl = $('equip_' + slot.key + '_effectPreview');
      const effect = $('equip_' + slot.key + '_note')?.value?.trim()
        || $('equip_' + slot.key + '_description')?.value?.trim()
        || '';
      if (effectEl) {
        effectEl.textContent = effect ? `効果：${effect}` : '';
        effectEl.hidden = !effect;
      }
      continue;
    }
    const spellCount = selectedSpellNames(slot.key).length;
    const parts = [];
    if (name) parts.push(name);
    if (type && type !== 'なし') parts.push(type);
    const element = $('equip_' + slot.key + '_element')?.value || '';
    if (element) parts.push('属性:' + element);
    const target = $('equip_' + slot.key + '_target')?.value?.trim() || '';
    const usageSkill = canonicalWeaponUsageSkill({ itemCategory:type, category:type });
    if (target) parts.push('対象:' + target);
    if (usageSkill && !['盾','大盾'].includes(type)) parts.push('使用技能:' + usageSkill);
    if (spellCount) parts.push('術式' + spellCount + '件');
    el.textContent = parts.length ? parts.join(' / ') : '未設定';
  }
  updateEquipmentReadOnlyDisplays();
}
function defaultEquipment() {
  const equipment = {};
  for (const slot of EQUIPMENT_SLOTS) {
    equipment[slot.key] = slot.kind === 'carry'
      ? { itemId:'', name:'', type:'なし', count:1, element:'', description:'', note:'', warehouseAllocated:false, warehouseItemId:'' }
      : { itemId:'', name:'', type:'なし', element:'', power:'', offhand:'', reloadTurns:'', modifiers:'', upgradeLimit:'', upgradeMaterialMinRank:'', upgradeLines:'', upgradeEntries:[], equipmentUpgradeEffect:'', equipmentUpgradeSlotCost:'', equipmentUpgradeDetail:'', equipmentUpgradeTarget:'', knownSpells:'', setSpells:'', description:'', target:'', checkType:'', role:'', source:'', tags:'', setItem:'', note:'' };
  }
  equipment.memo = '';
  return equipment;
}
function getEquipmentState() {
  const equipment = defaultEquipment();
  for (const slot of EQUIPMENT_SLOTS) {
    const base = equipment[slot.key];
    base.itemId = $('equip_' + slot.key + '_itemSelect')?.value || '';
    base.name = $('equip_' + slot.key + '_name')?.value?.trim() || '';
    base.type = $('equip_' + slot.key + '_type')?.value || 'なし';
    base.element = $('equip_' + slot.key + '_element')?.value || '';
    base.description = $('equip_' + slot.key + '_description')?.value || '';
    base.note = $('equip_' + slot.key + '_note')?.value || '';
    if (slot.kind === 'carry') {
      if (carryEquipmentLooksLikeSpell(base)) {
        resetCarryEquipmentItem(base);
        continue;
      }
      base.count = clampInt($('equip_' + slot.key + '_count')?.value || 1, 0, 99);
      const allocation = carryWarehouseAllocationState[slot.key] || {};
      base.warehouseAllocated = !!allocation.warehouseAllocated;
      base.warehouseItemId = allocation.warehouseItemId || (base.warehouseAllocated ? base.itemId : '');
    } else {
      const isBook = isSpellBookType(base.type);
      base.power = isBook ? '' : ($('equip_' + slot.key + '_power')?.value?.trim() || '');
      base.offhand = isBook ? '' : ($('equip_' + slot.key + '_offhand')?.value?.trim() || '');
      base.reloadTurns = isBook ? '' : ($('equip_' + slot.key + '_reloadTurns')?.value?.trim() || '');
      base.target = isBook ? '' : ($('equip_' + slot.key + '_target')?.value?.trim() || '');
      base.checkType = '';
      const selectedInventoryItem = base.itemId ? findCsItemById(base.itemId) : null;
      base.modifiers = selectedInventoryItem
        ? serializeModifierRows(equipmentModifierRows(selectedInventoryItem))
        : ($('equip_' + slot.key + '_modifiers')?.value?.trim() || '');
      if(slot.kind==='accessory'){
        base.upgradeLimit='';
        base.upgradeEntries=[];
        base.upgradeLines='';
      }else{
        base.upgradeLimit = $('equip_' + slot.key + '_upgradeLimit')?.value?.trim() || '';
        base.upgradeEntries = collectUpgradeEntries(slot.key).slice(0, equipmentUpgradeLimit(slot.key)).map(upgradeEntryForStorage);
        base.upgradeLines = serializeUpgradeEntries(base.upgradeEntries);
      }
      if (spellContainerKind(base.type)) {
        base.knownSpells = '';
        base.setSpells = selectedSpellNames(slot.key).join('\n');
      } else {
        base.knownSpells = '';
        base.setSpells = '';
      }
    }
  }
  equipment.memo = $('equipmentMemo')?.value || '';
  return equipment;
}
let legacyEquipmentUpgradeMigrationCount=0;
function migrateLegacyEquippedUpgradesToInventoryItem(selectedId='',equipmentItem={}){
  const key=String(selectedId||'').trim();
  if(!key)return null;
  const index=inventoryItemIndexForEquipmentKey(key);
  if(index<0)return null;
  const current=normalizeInventoryItem(inventoryItemsState[index]||{});
  if(!inventoryKindSupportsUpgradeLimit(current.kind))return current;
  const currentEntries=parseUpgradeLines(current.upgradeEntries||current.upgradeLines||'');
  const legacyEntries=parseUpgradeLines(equipmentItem.upgradeEntries||equipmentItem.upgradeLines||'').map(upgradeEntryForStorage);
  if(currentEntries.length||!legacyEntries.length)return current;
  const requiredLimit=equipmentUpgradeUsedSlots(legacyEntries);
  const targetLimit=clampInt(Math.max(Number(current.upgradeLimit||0)||0,Number(equipmentItem.upgradeLimit||0)||0,requiredLimit),0,9);
  if(targetLimit<=0)return current;
  const migrated=trimUpgradeEntriesToSlotLimit(legacyEntries,targetLimit).map(upgradeEntryForStorage);
  if(!migrated.length)return current;
  inventoryItemsState[index]=normalizeInventoryItem({
    ...inventoryItemsState[index],
    upgradeLimit:String(targetLimit),
    upgradeEntries:migrated,
    upgradeLines:serializeUpgradeEntries(migrated)
  });
  invalidateInventoryDerivedCache();
  legacyEquipmentUpgradeMigrationCount+=migrated.length;
  return normalizeInventoryItem(inventoryItemsState[index]);
}
function resolvedEquipmentUpgradeLimit(item={}) {
  const kind=String(item?.kind||dbItemTypeToInventoryKind(item||{})||'').trim();
  if(!inventoryKindSupportsUpgradeLimit(kind)){
    if(item&&typeof item==='object'){item.upgradeLimit='';item.upgradeEntries=[];item.upgradeLines='';item.upgradeMaterialMinRank='';}
    return '0';
  }
  const own=String(item&&item.upgradeLimit||'').trim();
  const same=(a,b)=>String(a??'').trim()&&String(a??'').trim()===String(b??'').trim();
  let master=typeof inventoryMasterRowForClassification==='function'?inventoryMasterRowForClassification(item):null;
  if(!master){
    const pools=[];
    try{if(Array.isArray(DB_INITIAL_ITEM_MASTER))pools.push(...DB_INITIAL_ITEM_MASTER)}catch(_){}
    try{if(Array.isArray(CS_ITEM_MASTER))pools.push(...CS_ITEM_MASTER)}catch(_){}
    master=pools.find(row=>same(row?.id,item?.masterId)||same(row?.id,item?.id)||same(row?.publicId,item?.publicId)||same(row?.name,item?.name))||null;
  }
  // 装備個体に残った空欄・旧値より、現在の共通DBマスターを優先する。
  const masterValue=String(master&&(master.upgradeLimit||master.upgradeSlotLimit||master.upgradeSlots)||'').trim();
  const value=masterValue||own;
  if(masterValue&&item&&typeof item==='object'&&own!==masterValue){
    item.upgradeLimit=masterValue;
    try{
      const key=typeof inventoryItemKey==='function'?String(inventoryItemKey(item)||''):'';
      let index=inventoryIndexByLookup(key,String(item.name||''));
      if(index<0)index=inventoryIndexByLookup(String(item.masterId||item.id||item.publicId||''),String(item.name||''));
      if(index>=0){inventoryItemsState[index]=normalizeInventoryItem({...inventoryItemsState[index],upgradeLimit:masterValue});invalidateInventoryDerivedCache();}
    }catch(_){}
  }
  return value;
}
function setEquipmentState(equipment={}) {
  refreshEquipmentTypeSelects();
  // キャラを開く時点では全倉庫×全装備枠の<option>を生成しない。各枠は現在装備だけの軽量表示で開始する。
  for(const slot of EQUIPMENT_SLOTS){
    const select=$('equip_'+slot.key+'_itemSelect');
    if(select)select.innerHTML=`<option value="">${slot.kind==='carry'?'未選択（倉庫へ戻す）':'未選択'}</option>`;
  }
  carryWarehouseAllocationState = {};
  const defaults = defaultEquipment();
  const eq = { ...defaults, ...(equipment || {}) };
  for (const slot of EQUIPMENT_SLOTS) {
    let item = migrateLegacyEquipmentModifierFields({ ...defaults[slot.key], ...(eq[slot.key] || {}) });
    let selectedRow = null;
    if (slot.kind === 'carry' && carryEquipmentLooksLikeSpell(item)) {
      item = { ...defaults[slot.key] };
    }
    if ($('equip_' + slot.key + '_itemSelect')) {
      // 保存済みの装備IDが倉庫側の再保存・移行で変わっていても、名称から現在の個体を再照合する。
      // 旧IDが残っているだけで未選択へ落とすと、ダメージ式などのスナップショットだけが残るため、
      // ID照合に失敗した場合に限って名称フォールバックを行う。
      let selectedId = String(item.itemId || '').trim();
      selectedRow = selectedId ? findCsItemById(selectedId) : null;
      if (!selectedRow && item.name) {
        const fallbackId = findCsItemIdByName(item.name || '');
        if (fallbackId) {
          selectedId = fallbackId;
          selectedRow = findCsItemById(fallbackId);
        }
      }
      if(slot.kind!=='carry'&&selectedRow){
        selectedRow=migrateLegacyEquippedUpgradesToInventoryItem(selectedId,item)||selectedRow;
      }
      if (slot.kind === 'carry' && selectedRow && isSpellInventoryItem(selectedRow)) selectedId = '';
      if (slot.kind !== 'carry' && selectedRow) {
        // 保存済み装備枠のスナップショットではなく、現在の倉庫装備個体を表示元にする。
        item = {
          ...item,
          itemId: inventoryItemKey(selectedRow),
          name: selectedRow.name || '',
          type: selectedRow.category || selectedRow.itemCategory || selectedRow.kind || 'なし',
          element: selectedRow.element || '',
          power: selectedRow.power || '',
          offhand: selectedRow.offhand || '',
          reloadTurns: selectedRow.reloadTurns || '',
          target: selectedRow.target || '',
          modifiers: selectedRow.modifiers || '',
          upgradeLimit: resolvedEquipmentUpgradeLimit(selectedRow),
          upgradeEntries: selectedRow.upgradeEntries || [],
          upgradeLines: selectedRow.upgradeLines || '',
          setSpells: selectedRow.setSpells || '',
          description: selectedRow.description || '',
          note: selectedRow.effect || selectedRow.note || ''
        };
      }
      const initialSelect=$('equip_' + slot.key + '_itemSelect');
      if(initialSelect && selectedId){
        const existing=Array.from(initialSelect.options).some(o=>o.value===selectedId);
        if(!existing){
          const opt=document.createElement('option');
          opt.value=selectedId;
          opt.textContent=selectedRow?.name || item.name || selectedId;
          initialSelect.appendChild(opt);
        }
      }
      if(initialSelect)initialSelect.value = selectedId && Array.from(initialSelect.options).some(o=>o.value===selectedId) ? selectedId : '';
      if(initialSelect)initialSelect.dataset.previousItemKey = initialSelect.value || '';
      if (typeof window.raSyncEquipmentPickerTrigger === 'function') {
        window.raSyncEquipmentPickerTrigger($('equip_' + slot.key + '_itemSelect'));
      }
    }
    if ($('equip_' + slot.key + '_name')) $('equip_' + slot.key + '_name').value = item.name || '';
    if ($('equip_' + slot.key + '_type')) $('equip_' + slot.key + '_type').value = normalizeEquipmentType(item.type || 'なし');
    if ($('equip_' + slot.key + '_element')) $('equip_' + slot.key + '_element').value = item.element || '';
    if ($('equip_' + slot.key + '_description')) $('equip_' + slot.key + '_description').value = item.description || '';
    if ($('equip_' + slot.key + '_note')) $('equip_' + slot.key + '_note').value = item.note || '';
    if (slot.kind === 'carry') {
      if ($('equip_' + slot.key + '_count')) $('equip_' + slot.key + '_count').value = item.count ?? 1;
      carryWarehouseAllocationState[slot.key] = {
        warehouseAllocated:!!item.warehouseAllocated,
        warehouseItemId:String(item.warehouseItemId || (item.warehouseAllocated ? item.itemId : '') || '').trim(),
        count:clampInt(item.count || 1, 0, 9999),
        maxStack:selectedRow ? inventoryStackLimit(selectedRow) : 99
      };
      const countInput = $('equip_' + slot.key + '_count');
      if (countInput) countInput.max = String(carryWarehouseAllocationState[slot.key].maxStack || 99);
    } else {
      const isBook = isSpellBookType(normalizeEquipmentType(item.type || 'なし'));
      if ($('equip_' + slot.key + '_power')) $('equip_' + slot.key + '_power').value = item.power || '';
      if ($('equip_' + slot.key + '_offhand')) $('equip_' + slot.key + '_offhand').value = item.offhand || '';
      if ($('equip_' + slot.key + '_reloadTurns')) $('equip_' + slot.key + '_reloadTurns').value = item.reloadTurns || '';
      if ($('equip_' + slot.key + '_target')) $('equip_' + slot.key + '_target').value = item.target || '';
      if ($('equip_' + slot.key + '_checkType')) $('equip_' + slot.key + '_checkType').value = (!['盾','大盾'].includes(normalizeEquipmentType(item.type || 'なし'))) ? canonicalWeaponUsageSkill({ itemCategory:normalizeEquipmentType(item.type || 'なし') }) : '';
      // 倉庫から選択した装備は、その装備個体に登録された補正だけを使用する。
      const modifierSourceItem = selectedRow || item;
      const restoredModifiers = serializeModifierRows(equipmentModifierRows(modifierSourceItem));
      if ($('equip_' + slot.key + '_modifiers')) $('equip_' + slot.key + '_modifiers').value = restoredModifiers;
      renderModifierReadOnly('equip_' + slot.key + '_modifierRows', restoredModifiers);
      // 強化内容も装備個体単位。選択中の倉庫装備がある場合は装備枠の旧値を一切引き継がない。
      const upgradeSource = slot.kind==='accessory' ? [] : (selectedRow ? (selectedRow.upgradeEntries || selectedRow.upgradeLines || []) : (item.upgradeEntries || item.upgradeLines || []));
      const upgradeLimitValue = slot.kind==='accessory' ? '' : (selectedRow ? resolvedEquipmentUpgradeLimit(selectedRow) : (item.upgradeLimit || ''));
      if ($('equip_' + slot.key + '_upgradeLimit')) $('equip_' + slot.key + '_upgradeLimit').value = upgradeLimitValue;
      if ($('equip_' + slot.key + '_upgradeLines')) $('equip_' + slot.key + '_upgradeLines').value = serializeUpgradeEntries(parseUpgradeLines(upgradeSource));
      renderEquipmentUpgradeSlots(slot.key, upgradeSource);
      if ($('equip_' + slot.key + '_knownSpells')) $('equip_' + slot.key + '_knownSpells').value = '';
      const savedBookSpells = selectedRow?.setSpells || item.setSpells || '';
      setSpellSelectValues(slot.key, savedBookSpells);
      if (selectedRow && item.setSpells && !selectedRow.setSpells) syncEquippedSpellSetToInventoryItem(slot.key, inventoryItemKey(selectedRow));
      const hasManualDetail = !!(item.element || item.power || item.offhand || item.reloadTurns || item.target || item.checkType || item.modifiers || item.upgradeLimit || item.upgradeLines || (item.upgradeEntries || []).length || item.setSpells || item.description || item.note);
      if (!hasManualDetail && normalizeEquipmentType(item.type || 'なし') !== 'なし') applyEquipmentPreset(slot.key);
    }
  }
  if ($('equipmentMemo')) $('equipmentMemo').value = eq.memo || '';
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind === 'carry') continue;
    const card = document.querySelector(`[data-equipment-card="${slot.key}"]`);
    if (!card) continue;
    const item = eq[slot.key] || {};
    card.open = !!String(item.name || item.itemId || '').trim();
  }
  enforceUniqueWeaponAccessoryEquipment({notify:true});
  updateEquipmentHandLocks(false);
  updateSpellSlotHints();
  updateEquipmentSummaries();
}
function normalizeEquipmentType(type) {
  return type === '槍' ? '片手槍' : (type || 'なし');
}
function applyEquipmentPreset(slotKey) {
  const typeEl = $('equip_' + slotKey + '_type');
  if (!typeEl) return;
  const normalized = normalizeEquipmentType(typeEl.value);
  if (typeEl.value !== normalized) typeEl.value = normalized;
  const preset = EQUIPMENT_PRESETS[normalized] || EQUIPMENT_PRESETS['なし'];
  for (const key of ['element','power','offhand','reloadTurns','target','checkType','modifiers','description','note']) {
    const el = $('equip_' + slotKey + '_' + key);
    if (el) el.value = preset[key] || '';
  }
  const usageSkillEl=$('equip_' + slotKey + '_checkType');
  if(usageSkillEl) usageSkillEl.value = (!['なし','盾','大盾'].includes(normalized)) ? canonicalWeaponUsageSkill({itemCategory:normalized}) : '';
  if (!spellContainerKind(normalized)) {
    const known = $('equip_' + slotKey + '_knownSpells');
    if (known) known.value = '';
    setSpellSelectValues(slotKey, []);
  }
  renderModifierReadOnly('equip_' + slotKey + '_modifierRows', preset.modifiers || '');
  renderEquipmentUpgradeSlots(slotKey);
  updateEquipmentFieldAvailability();
  updateSpellSlotHints();
}
function clearEquipmentSlotFields(slotKey, {keepSelection=false}={}) {
  const select = $('equip_' + slotKey + '_itemSelect');
  if (select && !keepSelection) select.value = '';
  for (const suffix of ['name','element','power','offhand','reloadTurns','target','checkType','modifiers','upgradeLimit','upgradeLines','knownSpells','setSpells','description','note']) {
    const el = $('equip_' + slotKey + '_' + suffix);
    if (el) el.value = '';
  }
  const typeEl = $('equip_' + slotKey + '_type');
  if (typeEl) typeEl.value = 'なし';
  renderModifierReadOnly('equip_' + slotKey + '_modifierRows', '');
  renderEquipmentUpgradeSlots(slotKey, []);
  setSpellSelectValues(slotKey, []);
  if (select) select.dataset.previousItemKey = select.value || '';
}
function clearHandSlot(slotKey) {
  const select = $('equip_' + slotKey + '_itemSelect');
  const itemKey = String(select?.value || select?.dataset?.previousItemKey || '').trim();
  if (itemKey) {
    syncEquipmentModifiersToInventoryItem(slotKey, itemKey);
    syncEquipmentUpgradeToInventoryItem(slotKey, itemKey);
    syncEquippedSpellSetToInventoryItem(slotKey, itemKey);
  }
  clearEquipmentSlotFields(slotKey);
}
function setHandSlotDisabled(slotKey, disabled) {
  const card = document.querySelector(`[data-equipment-card="${slotKey}"]`);
  if (card) card.classList.toggle('hand-disabled', disabled && currentMode !== 'view');
  for (const suffix of ['itemSelect','name','type','element','power','offhand','reloadTurns','target','checkType','modifiers','upgradeLimit','knownSpells','setSpells','description','note']) {
    const el = $('equip_' + slotKey + '_' + suffix);
    if (el) el.disabled = disabled || currentMode === 'view';
  }
  const upgradeList = $('equip_' + slotKey + '_upgradeSlots');
  if (upgradeList) upgradeList.querySelectorAll('select,input').forEach(el => { el.disabled = disabled || currentMode === 'view'; });
}
function isSpellBookType(type) {
  const t = normalizeEquipmentType(type || 'なし');
  return t === '魔導書' || t === '祈祷書';
}
function setEquipmentFieldVisible(card, fieldName, visible) {
  const wrap=card?.querySelector(`[data-equipment-field="${fieldName}"]`);
  if(wrap)wrap.hidden=!visible;
}
function updateEquipmentFieldAvailability() {
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind === 'carry') continue;
    const type = normalizeEquipmentType($('equip_' + slot.key + '_type')?.value || 'なし');
    const card = document.querySelector(`[data-equipment-card="${slot.key}"]`);
    const baseDisabled = currentMode === 'view' || !!card?.classList.contains('hand-disabled');
    const antiqueLocked=isAntiqueIndividualItem(selectedEquipmentInventoryItemForUpgrade(slot.key));
    const book = isSpellBookType(type);
    const shield = type==='盾' || type==='大盾';
    const weapon = slot.kind==='hand' && type!=='なし' && !book && !shield;
    const reloadWeapon = type==='クロスボウ' || type==='ヘヴィクロスボウ';
    const offhandWeapon = weapon && !TWO_HAND_TYPES.has(type);

    setEquipmentFieldVisible(card,'type',type!=='なし');
    setEquipmentFieldVisible(card,'element',weapon);
    setEquipmentFieldVisible(card,'power',weapon);
    setEquipmentFieldVisible(card,'offhand',offhandWeapon);
    setEquipmentFieldVisible(card,'reload',reloadWeapon);
    setEquipmentFieldVisible(card,'target',weapon);
    setEquipmentFieldVisible(card,'check',weapon);
    const combatGroup=card?.querySelector('[data-equipment-combat-group]');
    if(combatGroup)combatGroup.hidden=!weapon;

    for (const suffix of ['itemSelect','name','type','element','upgradeLimit','description','note']) {
      const el = $('equip_' + slot.key + '_' + suffix);
      if (el) el.disabled = baseDisabled || (antiqueLocked&&suffix==='upgradeLimit');
    }
    for (const suffix of ['power','offhand','reloadTurns','target','checkType','modifiers']) {
      const el = $('equip_' + slot.key + '_' + suffix);
      if (!el) continue;
      const hidden=!!el.closest('[hidden]');
      el.disabled = baseDisabled || book || hidden;
      el.closest('.field')?.classList.toggle('field-disabled-by-type', book);
      if (book && currentMode !== 'view' && ['power','offhand','reloadTurns','target','checkType'].includes(suffix)) el.value = '';
    }
    const setEl = $('equip_' + slot.key + '_setSpells');
    const spellDisabled = baseDisabled || !spellContainerKind(type);
    if (setEl) setEl.disabled = spellDisabled;
    const spellList = $('equip_' + slot.key + '_spellSlotList');
    if (spellList) spellList.querySelectorAll('select.spell-slot-select').forEach(sel => { sel.disabled = spellDisabled; });
    const upgradeList = $('equip_' + slot.key + '_upgradeSlots');
    if (upgradeList) upgradeList.querySelectorAll('select,input').forEach(el => { el.disabled = baseDisabled || antiqueLocked; });
  }
}
function updateEquipmentHandLocks(clearOpposite=true) {
  const rightType = normalizeEquipmentType($('equip_rightHand_type')?.value || 'なし');
  const leftType = normalizeEquipmentType($('equip_leftHand_type')?.value || 'なし');
  const rightTwo = selectedCsItemIsTwoHand('rightHand') || TWO_HAND_TYPES.has(rightType);
  const leftTwo = selectedCsItemIsTwoHand('leftHand') || TWO_HAND_TYPES.has(leftType);
  if (rightTwo) {
    if (clearOpposite) clearHandSlot('leftHand');
    setHandSlotDisabled('rightHand', false);
    setHandSlotDisabled('leftHand', true);
  } else if (leftTwo) {
    if (clearOpposite) clearHandSlot('rightHand');
    setHandSlotDisabled('leftHand', false);
    setHandSlotDisabled('rightHand', true);
  } else {
    setHandSlotDisabled('rightHand', false);
    setHandSlotDisabled('leftHand', false);
  }
  updateEquipmentFieldAvailability();
}
function showEditorTab(tab) {
  const map = { ability:'tabAbility', skills:'tabSkills', skillCrystal:'tabSkillCrystal', equipment:'tabEquipment', carry:'tabCarry', inventory:'tabInventory', craftList:'tabCraftList',dataMaintenance:'tabDataMaintenance' };
  const target = $(map[tab] || 'tabAbility');
  if (!target) return;
  // 倉庫は初回表示時だけDOMを構築する。キャラを開く瞬間の数百件カード生成を避ける。
  if (tab === 'inventory' && inventoryUiDirty) renderInventory({refreshLinked:false});
  if (tab === 'craftList') renderCraftLists();
  if (target.classList.contains('active')) return;
  for (const page of document.querySelectorAll('.editor-tab-page')) page.classList.toggle('active', page === target);
  for (const btn of document.querySelectorAll('.editor-tab-btn')) btn.classList.toggle('active', btn.dataset.editorTab === tab);
}
