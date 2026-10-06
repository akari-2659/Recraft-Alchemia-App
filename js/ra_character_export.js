function rollSet() {
  const set = {};
  for (const stat of STAT_ORDER) set[stat] = roll(diceExpr(stat));
  return set;
}


function generateTokenExport(data=collectData(false)) {
  const abilities = resolveAbilities(data);
  const skills = data.skills || defaultSkillAlloc();
  const equipment = data.equipment || getEquipmentState();
  const res = computeResources(abilities, data.resources || getResourceState(), equipment);
  const combat = computeCombatStats(abilities, skills, equipment);
  const totals = skillTotals(abilities, skills, equipment);
  const defense = Number(combat.constantDamageReduction) || 0;
  const evasion = Number(combat.evasionTotal) || 0;
  const resistance = Number(combat.resistanceTotal) || 0;
  const initiative = 0; // PCには先制値が存在しないため、ココフォリア互換欄は0固定。
  const params = ABILITIES.map(a => ({ label:a.name, value:String(abilities[a.key] ?? 0) }));
  params.push({label:'疲労度',value:String(res.fatigue||0)},{label:'疲労判定補正',value:String(res.fatiguePenalty||0)});

  // ココフォリアの CharacterClipboardData 形式。
  const token = {
    kind: 'character',
    data: {
      name: data.name || '無名のキャラクター',
      memo: '',
      initiative,
      externalUrl: '',
      status: [
        { label:'HP', value:Number(res.currentHp) || 0, max:Number(res.maxHp) || 0 },
        { label:'MP', value:Number(res.currentMp) || 0, max:Number(res.maxMp) || 0 },
        { label:'防御', value:defense, max:defense },
        { label:'回避', value:evasion, max:evasion },
        { label:'抵抗', value:resistance, max:resistance },
      ],
      params,
      iconUrl: null,
      faces: [],
      angle: 0,
      width: 4,
      height: 4,
      secret: false,
      invisible: false,
      hideStatus: false,
      color: '#888888',
      commands: generatePaletteExport(data),
    },
  };
  return JSON.stringify(token);
}
function makeSummaryFromData(data) {
  const abilities = resolveAbilities(data);
  const totals = skillTotals(abilities, data.skills || defaultSkillAlloc(), data.equipment || {});
  const res = computeResources(abilities, data.resources || {}, data.equipment || {});
  const lines = [];
  lines.push(`【リクラフト・アルケミア キャラクター】`);
  lines.push(`名前：${data.name || '未設定'}`);
  if (data.gender || data.age) lines.push(`性別：${data.gender || ''} / 年齢：${data.age || ''}`);
  lines.push('');
  lines.push('■ 能力値');
  lines.push(ABILITIES.map(a => `${a.name}:${abilities[a.key]}`).join(' / '));
  lines.push('');
  lines.push('■ HP・MP');
  lines.push(`HP:${res.currentHp}/${res.maxHp}（HPボーナス${res.hpBonus}点） / MP:${res.currentMp}/${res.maxMp}（MPボーナス${res.mpBonus}点）`);
  lines.push(`疲労度:${res.fatigue} / すべての判定:${res.fatiguePenalty||'補正なし'}`);
  const combat = computeCombatStats(abilities, data.skills || defaultSkillAlloc(), data.equipment || {});
  lines.push(`防御値:${combat.defenseValue} / 防御技能軽減:${combat.defenseSkillPoints} / 常時軽減:${combat.constantDamageReduction} / 防御行動値:${combat.guardActionValue} / 回避:${combat.evasionTotal} / 抵抗:${combat.resistanceTotal}`);
  if (combat.dualWield?.available) lines.push(`二刀攻撃:${combat.dualWield.rightMain} / ${combat.dualWield.leftMain}`);
  lines.push('');
  lines.push('■ 装備');
  pushEquipmentSummaryLines(lines, data.equipment || {});
  lines.push('');
  lines.push('■ 技能値');
  for (const cat of SKILL_CATEGORIES) {
    lines.push(`［${cat.name}］`);
    for (const sk of cat.skills) {
      const t = totals[sk.key];
      lines.push(`${sk.name}: ${t.total}`);
    }
  }
  pushInventorySummaryLines(lines, data.inventory || {});
  if (data.memo) { lines.push(''); lines.push('■ メモ'); lines.push(data.memo); }
  return lines.join('\n');
}

const CHECK_SKILL_NAME_TO_KEY = (() => {
  const pairs = [];
  for (const cat of SKILL_CATEGORIES) for (const sk of cat.skills) pairs.push([sk.name, sk.key]);
  return Object.fromEntries(pairs);
})();
function normalizeCheckExpression(value) {
  let raw = String(value || '').trim();
  if (!raw) return '';
  raw = raw.replace(/＞＝/g, '>=').replace(/≧/g, '>=').replace(/\s+/g, '');
  const m = raw.match(/^(.+?)>=(.+)$/);
  if (!m) return raw;
  let left = m[1].trim();
  let right = m[2].trim();
  if (left === '魔法' && right === '抵抗値') right = '回避値';
  return `${left}>=${right}`;
}
function parseCheckExpression(value) {
  const raw = normalizeCheckExpression(value);
  const m = raw.match(/^(.+?)>=(.+)$/);
  if (!m) return { skillName: raw, right: '', raw };
  return { skillName: m[1].trim(), right: m[2].trim(), raw };
}
function checkExpressionRightDisplay(value, defaultRight='') {
  const raw = normalizeCheckExpression(value || '');
  if (!raw || raw === 'なし') return defaultRight || '';
  const parsed = parseCheckExpression(raw);
  if (parsed.right) return parsed.right;
  if (CHECK_SKILL_NAME_TO_KEY[String(parsed.skillName || '').trim()]) return defaultRight || '';
  return parsed.skillName || defaultRight || '';
}
function forceCheckExpressionLeft(value, defaultSkill='', defaultRight='目標値') {
  const skill = String(defaultSkill || '').trim();
  const right = checkExpressionRightDisplay(value, String(defaultRight || '').trim());
  if (!skill) return normalizeCheckExpression(value || '');
  if (right) return normalizeCheckExpression(`${skill}>=${right}`);
  return skill;
}

function checkExpressionDisplay(value) {
  return normalizeCheckExpression(value);
}
function skillTotalByName(totals, skillName) {
  const key = CHECK_SKILL_NAME_TO_KEY[String(skillName || '').trim()];
  if (!key) return null;
  return totals[key]?.total || 0;
}
function paletteSkillValueParts(totals={}, skillName='') {
  const key=CHECK_SKILL_NAME_TO_KEY[String(skillName||'').trim()];
  if(!key)return null;
  const row=totals?.[key]||{};
  const total=Number(row.total||0),equipment=Number(row.equipmentOther||0);
  return {total,equipment,base:total-equipment,key};
}
function paletteCheckLineFromExpression(checkType, label, totals, extraMod='', globalMod=0) {
  const parsed = parseCheckExpression(checkType);
  if (!parsed.skillName || !parsed.right || parsed.skillName === 'なし') return '';
  const parts=paletteSkillValueParts(totals,parsed.skillName);
  if (!parts) return '';
  const mod = String(extraMod || '').trim();
  const rhs = parsed.right || '目標値';
  return `2D6+${paletteSkillFormulaValue(parts,[mod,signedNumberText(globalMod)])}>=${rhs} 【${label}】`;
}
function fatiguePenaltyForData(data={}){
  const fatigue=Math.max(0,Number(data?.resources?.fatigue)||0);
  return -2*fatigue;
}
function checkFormulaValue(base=0, parts=[]){
  const extras=(parts||[]).map(v=>String(v||'').trim()).filter(v=>v && v!=='0' && v!=='+0' && v!=='-0');
  return `${base}${extras.join('')}`;
}
function paletteSkillFormulaValue(parts={}, extras=[]){
  const equipment=Number(parts?.equipment||0);
  return checkFormulaValue(Number(parts?.base||0),[equipment?signedNumberText(equipment):'',...(extras||[])]);
}
function signedHitFormulaPart(value=0) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n === 0) return '+0';
  return signedNumberText(n);
}
function paletteWeaponCheckLineFromExpression(checkType, handLabel, totals, hitMod=0, globalMod=0) {
  const parsed = parseCheckExpression(checkType);
  if (!parsed.skillName || !parsed.right || parsed.skillName === 'なし') return '';
  const parts=paletteSkillValueParts(totals,parsed.skillName);
  if (!parts) return '';
  const rhs = parsed.right || '回避値';
  return `2D6+${paletteSkillFormulaValue(parts,[signedHitFormulaPart(hitMod),signedNumberText(globalMod)])}>=${rhs} 【${handLabel}命中(${parsed.skillName})】`;
}
function weaponPaletteSkillNames(defaultSkill='') {
  const skill = String(defaultSkill || '').trim();
  if (skill === '近接') return ['近接','力業'];
  if (skill === '射撃') return ['射撃'];
  return skill ? [skill] : [];
}
function checkTypeOrDefault(item={}, defaultSkill='', defaultRight='目標値') {
  const raw = normalizeCheckExpression(item.checkType || '');
  if (defaultSkill) return forceCheckExpressionLeft(raw, defaultSkill, defaultRight);
  if (raw && raw !== 'なし') return raw;
  return '';
}

function stripSkillPointTerms(value) {
  return String(value || '')
    .replace(/\+?\s*(魔法|祈祷)\s*(ポイント|P)\s*/g, '')
    .replace(/\s*\+\s*$/g, '')
    .replace(/^\s*\+\s*/g, '')
    .replace(/\+\s*\+/g, '+')
    .trim();
}
function normalizePaletteFormula(value) {
  return stripSkillPointTerms(value)
    .replace(/[ｄＤ]/g, 'D').replace(/d/g, 'D')
    .replace(/＋/g, '+').replace(/－/g, '-').replace(/[ｘＸ]/g, '×');
}
function paletteInventoryItems(data={}) {
  return normalizeInventoryState(data.inventory || {}).items || [];
}
function paletteItemKey(item={}) {
  return String(item.id || item.masterId || item.name || '').trim();
}
function findPaletteInventoryItem(items=[], item={}) {
  const id = String(item.itemId || '').trim();
  const name = String(item.name || '').trim();
  if (id) {
    const byId = items.find(row => paletteItemKey(row) === id || String(row.id || '').trim() === id || String(row.masterId || '').trim() === id);
    if (byId) return byId;
  }
  if (name) return items.find(row => String(row.name || '').trim() === name) || null;
  return null;
}
function isPaletteTwoHandEquipment(item={}, source=null) {
  const type = normalizeEquipmentType(item.type || source?.category || 'なし');
  const slotText = String(source?.equipSlot || item.equipSlot || '').trim();
  return slotText === '両手' || slotText.includes('両手') || TWO_HAND_TYPES.has(type);
}

function paletteDamageSkillKeyForItem(item={}, slotKey='') {
  const skillName = defaultSkillForEquipmentItem(item, slotKey);
  if (skillName === '射撃') return 'shoot';
  if (skillName === '近接') return 'melee';
  return '';
}
function paletteDamageSkillBonus(totals={}, skillKey='') {
  const row = totals?.[skillKey] || {};
  return (Number(row.cat) || 0) + (Number(row.free) || 0);
}
/* RA_PATCH_CHARACTER_OFFHAND_DAMAGE_ORDER_V90_8_398_FIX1 */
function paletteOffhandBonusForItem(item={}, source=null) {
  const type = normalizeEquipmentType(item.type || source?.category || source?.kind || 'なし');
  const preset = EQUIPMENT_PRESETS[type] || {};
  const base = parseFlatBonus(item.offhand || source?.offhandBonus || source?.offhand || preset.offhand || '');
  const upgradeStage = Math.max(
    equipmentUpgradeStage(item, [/^副手追撃強化$/]),
    equipmentUpgradeStage(source || {}, [/^副手追撃強化$/])
  );
  return base + upgradeStage;
}
function paletteDamageFormulaWithBonus(formula='', skillBonus=0, offhandBonus=0, powerTerm='', fixedPowerTerm='') {
  return formulaWithSeparatedTerms(formula,[Number(offhandBonus)||'',Number(skillBonus)||'',powerTerm,fixedPowerTerm]);
}

function addOnePrimaryDamageDie(formula='') {
  const text=String(formula||'');
  return text.replace(/(\d*)D(\d+)/i,(m,count,sides)=>`${(Number(count)||1)+1}D${sides}`);
}
function collectWeaponDamagePaletteLines(data={}, totals={}) {
  const equipment = data.equipment || {};
  const items = paletteInventoryItems(data);
  const result = [];
  const used = new Set();
  const handSpecs = [{ key:'rightHand', label:'右手', otherKey:'leftHand' }, { key:'leftHand', label:'左手', otherKey:'rightHand' }];
  for (const spec of handSpecs) {
    const item = equipment[spec.key] || {};
    const source = findPaletteInventoryItem(items, item);
    const merged = normalizeInventoryItem({ ...(source || {}), ...(item || {}) });
    const type = normalizeEquipmentType(merged.type || merged.category || merged.kind || 'なし');
    if (!merged.name && (!type || type === 'なし')) continue;
    if (spellContainerKind(type) || ['盾','大盾'].includes(type)) continue;
    const power = merged.power || source?.power || item.power || '';
    if (!normalizePaletteFormula(power)) continue;
    const twoHand = isPaletteTwoHandEquipment(merged, source);
    const skillKey = paletteDamageSkillKeyForItem(merged, spec.key);
    const skillBonus = paletteDamageSkillBonus(totals, skillKey);
    let offhandBonus = 0;
    if (!twoHand) {
      const other = equipment[spec.otherKey] || {};
      const otherSource = findPaletteInventoryItem(items, other);
      const otherMerged = normalizeInventoryItem({ ...(otherSource || {}), ...(other || {}) });
      if (canUseAsDualWeapon(otherMerged) && !isPaletteTwoHandEquipment(otherMerged, otherSource)) {
        offhandBonus = paletteOffhandBonusForItem(otherMerged, otherSource);
      }
    }
    const powerStage=equipmentUpgradeStageFromSources([/^威力強化$/],source,item,merged);
    const fixedPowerStage=equipmentUpgradeStageFromSources([/^威力固定強化$/],source,item,merged);
    const accessoryDamageBonus=skillKey==='melee'?equipmentContextModifierTotal(equipment,'damage:melee'):0;
    const effectiveElement = merged.element||source?.element||item.element||'物';
    const formula = formulaWithSeparatedTerms(power,[offhandBonus||'',skillBonus||'',stagedDiceUpgradeFormula(powerStage),fixedUpgradeFormula(fixedPowerStage),accessoryDamageBonus||'']);
    if (!formula) continue;
    const skillLabel = skillKey === 'shoot' ? '射撃' : (skillKey === 'melee' ? '近接' : '');
    const elementLabel = effectiveElement ? ` / ${effectiveElement}` : '';
    const label = twoHand ? `両手武器ダメージ${skillLabel ? '(' + skillLabel + ')' : ''}${elementLabel}` : `${spec.label}武器ダメージ${skillLabel ? '(' + skillLabel + ')' : ''}${elementLabel}`;
    const key = label + '::' + formula;
    if (used.has(key)) continue;
    used.add(key);
    result.push(`${formula} 【${label}】`);
    if (skillKey === 'shoot') {
      const focusedFormula=addOnePrimaryDamageDie(formula);
      if(focusedFormula&&focusedFormula!==formula) result.push(`${focusedFormula} 【${twoHand?'両手':spec.label}集中攻撃ダメージ(射撃${elementLabel})】`);
    }
    if (twoHand) break;
  }
  return result;
}
function findPaletteSpellByName(items=[], name='') {
  const target = String(name || '').trim();
  if (!target) return null;
  const normalizedItems = (items || []).map(row => normalizeInventoryItem(row));
  const owned = normalizedItems.find(row => isSpellInventoryItem(row) && String(row.name || '').trim() === target);
  if (owned) return owned;
  const dbSpell = (DB_INITIAL_SPELL_MASTER || []).map(row => dbSpellToInventoryItem(row)).find(row => String(row.name || '').trim() === target);
  return dbSpell || null;
}
function equipmentUpgradeNumericBonus(item={}, patterns=[]){return parseUpgradeLines(item.upgradeLines||item.upgradeEntries||'').reduce((sum,e)=>patterns.some(p=>p.test(String(e.content||'')))?sum+upgradeEffectAmount(e):sum,0);}
function spellBookPowerStage(item={}){return equipmentUpgradeStage(item,[/^威力強化$/]);}
function spellBookFixedPowerStage(item={}){return equipmentUpgradeStage(item,[/^威力固定強化$/]);}
function spellBookHitBonus(item={}){return equipmentUpgradeNumericBonus(item,[/^命中強化$/]);}
function spellBookCostReduction(item={}){return equipmentUpgradeNumericBonus(item,[/^術式省力化$/]);}
function spellBookHealStage(item={}){return equipmentUpgradeStage(item,[/^回復量強化$/]);}
function spellBookFixedHealStage(item={}){return equipmentUpgradeStage(item,[/^回復量固定強化$/]);}
function paletteSpellPointKey(spell={}, containerType='') {
  const text = [spell.category, spell.kind, spell.tags, spell.checkType, containerType]
    .map(v => String(v || ''))
    .join('/');
  if (/祈祷|聖術|神聖|聖印|祈祷書/.test(text)) return 'prayer';
  if (/魔法|魔術|魔導|魔印|魔導書/.test(text)) return 'magic';
  return spellContainerKind(containerType)?.pointKey || '';
}
function paletteSpellHasScalablePower(spell={}, formula='') {
  const normalized = normalizePaletteFormula(formula);
  if (!/\d*D\d+/i.test(normalized)) return false;
  const text = [spell.effect, spell.role, spell.tags, spell.description]
    .map(v => String(v || ''))
    .join('/');
  return /ダメージ|攻撃|回復|HP/.test(text);
}
function paletteSpellIsHealing(spell={}) {
  const text = [spell.effect, spell.role, spell.tags, spell.description]
    .map(v => String(v || ''))
    .join('/');
  return /回復|HP/.test(text) && !/ダメージ/.test(text);
}
function paletteSpellFormulaWithSeparatedBonuses(formula='', skillBonus=0, variableTerm='', fixedTerm='') {
  return formulaWithSeparatedTerms(formula,[Number(skillBonus)||'',variableTerm,fixedTerm]);
}
function paletteSpellCostText(spell={}, container={}) {
  const raw = formatMpCost(spell.cost || spell.mpCost || '');
  if (!raw) return '—';
  const reduction = Math.max(0, Number(spellBookCostReduction(container)) || 0);
  const m = raw.match(/^MP\s*(\d+)$/i);
  if (!m || !reduction) return raw;
  return `MP${Math.max(1, Number(m[1]) - reduction)}`;
}
function paletteSpellMetaLine(spell={}, container={}) {
  const name = String(spell.name || '名称未設定').trim();
  const cost = paletteSpellCostText(spell, container);
  const element = String(spell.element || '—').trim() || '—';
  const target = String(spell.target || '—').trim() || '—';
  return `// 【${name}】 コスト：${cost} / 属性：${element} / 対象：${target}`;
}
function paletteSpellEffectLine(spell={}) {
  const effect = String(spell.effect || spell.additionalEffect || '').trim().replace(/\s*\n+\s*/g, ' ');
  if (!effect || effect === 'なし' || effect === '—') return '';
  return `// 効果：${effect}`;
}
function collectSetSpellDamagePaletteLines(data={}) {
  const equipment = data.equipment || {};
  const alloc = data.skills || defaultSkillAlloc();
  const items = paletteInventoryItems(data);
  const result = [];
  const used = new Set();
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind === 'carry') continue;
    const item = equipment[slot.key] || {};
    const type = normalizeEquipmentType(item.type || 'なし');
    if (!spellContainerKind(type)) continue;
    const names = splitFormulaList(item.setSpells || item.knownSpells || '');
    for (const name of names) {
      const spell = findPaletteSpellByName(items, name) || normalizeInventoryItem({ name, kind:'術式' });
      const rawFormula = normalizePaletteFormula(spell.power || spell.damage || '');
      if (!rawFormula) continue;
      const scalable = paletteSpellHasScalablePower(spell, rawFormula);
      const pointKey = paletteSpellPointKey(spell, type);
      const skillPointBonus = scalable && pointKey ? allocatedSkillPoints(pointKey, alloc) : 0;
      const healing=paletteSpellIsHealing(spell);
      const variableStage=scalable?(healing?spellBookHealStage(item):spellBookPowerStage(item)):0;
      const fixedStage=scalable?(healing?spellBookFixedHealStage(item):spellBookFixedPowerStage(item)):0;
      const parts = paletteSpellDamageFormulaParts(rawFormula, skillPointBonus, stagedDiceUpgradeFormula(variableStage), fixedUpgradeFormula(fixedStage));
      const label = String(spell.name || name).trim();
      const key = label + '::' + parts.primary + '::' + parts.secondary;
      if (used.has(key)) continue;
      used.add(key);
      if(parts.primary)result.push(`${parts.primary} 【${label}】`);
      if(parts.secondary)result.push(`${parts.secondary} 【${label}・継続ダメージ（${parts.secondaryNote}）】`);
    }
  }
  return result;
}

function collectSetSpellPaletteLines(data={}, totals={}) {
  const equipment = data.equipment || {};
  const alloc = data.skills || defaultSkillAlloc();
  const items = paletteInventoryItems(data);
  const globalMod = fatiguePenaltyForData(data);
  const result = [];
  const used = new Set();
  for (const slot of EQUIPMENT_SLOTS) {
    if (slot.kind === 'carry') continue;
    const containerRaw = equipment[slot.key] || {};
    const containerSource = findPaletteInventoryItem(items, containerRaw);
    const container = normalizeInventoryItem({ ...(containerSource || {}), ...(containerRaw || {}) });
    const type = normalizeEquipmentType(container.type || container.category || 'なし');
    if (!spellContainerKind(type)) continue;
    const attackHitBonus = paletteAttackHitModifier(equipment,slot.key,container);
    const names = splitFormulaList(container.setSpells || container.knownSpells || '');
    for (const name of names) {
      const spell = findPaletteSpellByName(items, name) || normalizeInventoryItem({ name, kind:'術式' });
      const label = String(spell.name || name).trim();
      if (!label || used.has(label)) continue;
      used.add(label);
      const block = [paletteSpellMetaLine(spell, container)];
      const effectLine = paletteSpellEffectLine(spell);
      if (effectLine) block.push(effectLine);
      const spellKind = String(spell.category || spell.kind || type || '').trim();
      const defaultSkill = /祈祷|聖|神/.test(spellKind) ? '祈祷' : '魔法';
      const rawFormula = normalizePaletteFormula(spell.power || spell.damage || '');
      const focusEligible = defaultSkill==='魔法' && !!rawFormula && paletteSpellHasScalablePower(spell,rawFormula) && !paletteSpellIsHealing(spell);
      const checkLine = paletteCheckLineFromExpression(
        checkTypeOrDefault(spell, defaultSkill, defaultSkill === '魔法' ? '回避値' : '目標値'),
        label,
        totals,
        signedNumberText(attackHitBonus),
        globalMod
      );
      if (checkLine) block.push(checkLine);
      if(focusEligible){
        const baseCheck=checkTypeOrDefault(spell,'魔法','回避値');
        const focusCheck=forceCheckExpressionLeft(baseCheck,'集中',checkExpressionRightDisplay(baseCheck,'回避値')||'回避値');
        const focusedCheckLine=paletteCheckLineFromExpression(focusCheck,`${label}・集中攻撃`,totals,signedNumberText(attackHitBonus+2),globalMod);
        if(focusedCheckLine)block.push(focusedCheckLine);
      }
      if (rawFormula) {
        const scalable = paletteSpellHasScalablePower(spell, rawFormula);
        const pointKey = paletteSpellPointKey(spell, type);
        const skillPointBonus = scalable && pointKey ? allocatedSkillPoints(pointKey, alloc) : 0;
        const healing = paletteSpellIsHealing(spell);
        const variableStage = scalable ? (healing ? spellBookHealStage(container) : spellBookPowerStage(container)) : 0;
        const fixedStage = scalable ? (healing ? spellBookFixedHealStage(container) : spellBookFixedPowerStage(container)) : 0;
        const parts = paletteSpellDamageFormulaParts(rawFormula, skillPointBonus, stagedDiceUpgradeFormula(variableStage), fixedUpgradeFormula(fixedStage));
        if (parts.primary) block.push(`${parts.primary} 【${label}】`);
        if (focusEligible && parts.primary) {
          const focusedPrimary=addOnePrimaryDamageDie(parts.primary);
          if(focusedPrimary&&focusedPrimary!==parts.primary)block.push(`${focusedPrimary} 【${label}・集中攻撃】`);
        }
        if (parts.secondary) block.push(`${parts.secondary} 【${label}・継続ダメージ（${parts.secondaryNote}）】`);
      }
      appendPaletteBlock(result, block);
    }
  }
  return result;
}

function signedModForPalette(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === '0') return '';
  if (/^[+-]/.test(raw)) return raw;
  return '+' + raw;
}
function hitModifierValueForItem(item={}) {
  const rows = activeEquipmentModifierRows(item);
  return rows.filter(row => row.target === 'hit').reduce((sum,row)=>sum + modifierValue(row), 0);
}
function signedHitModifierForPalette(item={}) {
  const n = hitModifierValueForItem(item);
  return n ? signedNumberText(n) : '';
}
function paletteOtherEquipmentHitModifier(equipment={}, activeSlotKey='') {
  let total=0;
  for(const slot of EQUIPMENT_SLOTS){
    if(slot.kind==='carry'||slot.key===activeSlotKey)continue;
    // もう一方の手に持つ武器・書物の命中補正は、現在使う攻撃へ横流ししない。
    if(HAND_SLOT_KEYS.includes(slot.key))continue;
    const item=(equipment||{})[slot.key]||{};
    if(!equipmentItemIsActive(item))continue;
    total+=activeEquipmentModifierRows(item)
      .filter(row=>String(row.target||'')==='hit')
      .reduce((sum,row)=>sum+modifierValue(row),0);
  }
  return total;
}
function paletteAttackHitModifier(equipment={}, activeSlotKey='', item={}) {
  return hitModifierValueForItem(item)+paletteOtherEquipmentHitModifier(equipment,activeSlotKey);
}
function defaultSkillForEquipmentItem(item={}, slotKey='') {
  const type = normalizeEquipmentType(item.type || item.category || item.kind || 'なし');
  if (['弓','クロスボウ','ヘヴィクロスボウ'].includes(type)) return '射撃';
  if (spellContainerKind(type)) return '';
  if (type && type !== 'なし' && !['盾','大盾'].includes(type)) return '近接';
  return '';
}
function isNonWeaponEquipmentPaletteItem(row={}) {
  const kind = normalizeInventoryKind(row.kind || '');
  const equipSlot = String(row.equipSlot || row.slot || '').trim();
  return ['防具','装飾品','バッグ','矢筒'].includes(kind)
    || /^(鎧|防具|装飾品|バッグ|矢筒|盾|大盾)$/.test(equipSlot);
}
function appendPaletteBlock(result=[], block=[]) {
  const clean=(block||[]).map(line=>String(line??''));
  while(clean.length&&!clean[0].trim())clean.shift();while(clean.length&&!clean[clean.length-1].trim())clean.pop();
  if(!clean.length)return;
  if(result.length&&result[result.length-1] !== '')result.push('');
  result.push(...clean);
}
function collectCheckPaletteLines(data={}, totals={}) {
  const globalMod=fatiguePenaltyForData(data);
  const equipment = data.equipment || {};
  const items = paletteInventoryItems(data);
  const result = [];
  const used = new Set();
  const pushWeaponLine = (checkType, handLabel, hitMod=0) => {
    const line = paletteWeaponCheckLineFromExpression(checkType, handLabel, totals, hitMod, globalMod);
    if (!line || used.has(line)) return;
    used.add(line);
    result.push(line);
  };

  for (const spec of [{ key:'rightHand', label:'右手' }, { key:'leftHand', label:'左手' }]) {
    const eq = equipment[spec.key] || {};
    const source = findPaletteInventoryItem(items, eq);
    const merged = normalizeInventoryItem({ ...(source || {}), ...(eq || {}) });
    const type = normalizeEquipmentType(merged.type || merged.category || 'なし');
    if (!merged.name && (!type || type === 'なし')) continue;
    if (spellContainerKind(type) || ['盾','大盾'].includes(type)) continue;
    const defaultSkill = defaultSkillForEquipmentItem(merged, spec.key);
    const rhs = checkExpressionRightDisplay(merged.checkType || '', '回避値') || '回避値';
    const handLabel = isPaletteTwoHandEquipment(merged, source) ? '両手' : spec.label;
    const hitMod = paletteAttackHitModifier(equipment,spec.key,merged);
    for (const skillName of weaponPaletteSkillNames(defaultSkill)) {
      pushWeaponLine(`${skillName}>=${rhs}`, handLabel, hitMod);
    }
    if(defaultSkill==='射撃') {
      const focusParts=paletteSkillValueParts(totals,'集中');
      if(focusParts){
        const focusLine=`2D6+${paletteSkillFormulaValue(focusParts,[signedHitFormulaPart(hitMod),'+2',signedNumberText(globalMod)])}>=${rhs} 【${handLabel}集中攻撃命中】`;
        if(!used.has(focusLine)){used.add(focusLine);result.push(focusLine);}
      }
    }
    if (isPaletteTwoHandEquipment(merged, source)) break;
  }

  return result;
}

function paletteCarryItemType(item={}){return String(item.itemType||item.kind||'').trim();}
function paletteCarryItemCategory(item={}){return String(item.itemCategory||item.category||'').trim();}
function paletteItemHasDirectDamage(item={}){
  const type=paletteCarryItemType(item),cat=paletteCarryItemCategory(item);
  const power=normalizePaletteFormula(item.power||'');
  if(type==='調合品'&&cat==='攻撃')return /\d*D\d+/i.test(power);
  if(type==='道具'&&cat==='罠')return /\d*D\d+/i.test(power);
  return false;
}
function paletteContextBonusLabel(target=''){
  return modifierTargetDisplayName(target)||target;
}
function paletteCarryCheckParts(checkType='', defaultRight='目標値'){
  const raw=normalizeCheckExpression(checkType||'');
  if(!raw||raw==='なし')return {options:[],right:''};
  const m=raw.match(/^(.+?)>=(.+)$/);
  const left=(m?m[1]:raw).trim();
  const right=String(m?m[2]:defaultRight||'目標値').trim()||'目標値';
  const options=left.split(/(?:または|\/|／)/).map(v=>v.trim()).filter(Boolean).map(token=>{
    const mm=token.match(/^(.+?)([+-]\d+)?$/);
    if(!mm)return null;
    const skillName=String(mm[1]||'').trim();
    if(!CHECK_SKILL_NAME_TO_KEY[skillName])return null;
    return {skillName,modifier:Number(mm[2]||0)||0};
  }).filter(Boolean);
  return {options,right};
}
function paletteCarryCheckLines(item={},totals={},globalMod=0){
  const name=String(item.name||item.category||'判定').trim()||'判定';
  const defaultRight=paletteItemHasDirectDamage(item)?'回避値':'目標値';
  const parsed=paletteCarryCheckParts(item.checkType||'',defaultRight);
  const multiple=parsed.options.length>1;
  return parsed.options.map(option=>{
    const parts=paletteSkillValueParts(totals,option.skillName);
    if(!parts)return '';
    const label=multiple?`${name}（${option.skillName}）`:name;
    return `2D6+${paletteSkillFormulaValue(parts,[signedNumberText(option.modifier),signedNumberText(globalMod)])}>=${parsed.right} 【${label}】`;
  }).filter(Boolean);
}
function paletteCarryItemMetaLine(item={}){
  const name=String(item.name||'名称未設定').trim()||'名称未設定';
  const target=String(item.target||'').trim();
  const element=String(item.element||'').trim();
  const power=String(item.power||'').trim();
  const meta=[];
  if(target)meta.push(`対象：${target}`);
  if(element)meta.push(`属性：${element}`);
  if(power)meta.push(`威力：${power}`);
  return `// 【${name}】${meta.length?` / ${meta.join(' / ')}`:''}`;
}
function paletteCarryItemEffectLine(item={}){
  const effect=String(item.effect||'').trim().replace(/\s*\n+\s*/g,' ');
  return `// 効果：${effect||'なし'}`;
}
function collectCarryItemPaletteLines(data={},totals={}){
  const equipment=data.equipment||{},items=paletteInventoryItems(data),result=[],seen=new Set();
  const globalMod=fatiguePenaltyForData(data);
  const bonusMap={alchemyAttack:'damage:alchemyAttack',trap:'damage:trap',alchemyHeal:'healing:alchemy'};
  for(const slot of EQUIPMENT_SLOTS){
    if(slot.kind!=='carry')continue;
    const eq=equipment[slot.key]||{},source=findPaletteInventoryItem(items,eq);
    const item=normalizeInventoryItem({...(source||{}),...(eq||{})});
    const name=String(item.name||'').trim();if(!name)continue;
    const identity=String(source?inventoryItemKey(source):(eq.itemId||item.masterId||item.publicId||name)).trim()||name;
    if(seen.has(identity))continue;seen.add(identity);

    const type=paletteCarryItemType(item),cat=paletteCarryItemCategory(item);
    let context='';
    if(type==='調合品'&&cat==='攻撃'&&paletteItemHasDirectDamage(item))context='alchemyAttack';
    else if(type==='道具'&&cat==='罠'&&paletteItemHasDirectDamage(item))context='trap';
    else if(type==='調合品'&&cat==='回復')context='alchemyHeal';
    const target=context?bonusMap[context]:'';
    const bonus=target?equipmentContextModifierTotal(equipment,target):0;
    const rawPower=normalizePaletteFormula(item.power||'');
    const formula=rawPower?formulaWithSeparatedTerms(rawPower,[bonus||'']):'';

    const block=[paletteCarryItemMetaLine(item),paletteCarryItemEffectLine(item)];
    if(item.checkType&&item.checkType!=='なし')block.push(...paletteCarryCheckLines(item,totals,globalMod));

    if(formula&&/\d*D\d+/i.test(formula)){
      if(context==='alchemyAttack'||context==='trap'){
        block.push(`${formula} 【${name}/${String(item.element||'無').trim()||'無'}】`);
      }else if(context==='alchemyHeal'){
        block.push(`${formula} 【${name}/回復】`);
      }else{
        block.push(`${formula} 【${name}】`);
      }
    }
    if(bonus){
      const sources=equipmentContextModifierSources(equipment,target).map(row=>`${row.name||row.slotLabel}${signedNumberText(row.value)}`).join('、');
      block.push(`// 装飾品補正：${paletteContextBonusLabel(target)} ${signedNumberText(bonus)}${sources?`（${sources}）`:''}`);
    }
    appendPaletteBlock(result,block);
  }
  return result;
}

function resolvePaletteSpecialUpgradeDetail(entry={},items=[]){
  const e=normalizeUpgradeEntry(entry);if(e.specialEffectDetail)return e.specialEffectDetail;
  const name=String(e.specialEffectName||'').trim();if(!name)return '';
  const rows=(items||[]).concat((DB_INITIAL_ITEM_MASTER||[])).map(row=>normalizeInventoryItem(row));
  const found=rows.find(item=>item.kind==='素材'&&specialUpgradeEffectNameForMaterial(item)===name&&String(item.equipmentUpgradeDetail||'').trim());
  return String(found?.equipmentUpgradeDetail||'').trim();
}
function aggregatePaletteModifierRows(rows=[]){
  const order=[];
  const grouped=new Map();
  for(const raw of rows||[]){
    const row=normalizeModifierRow(raw);if(!row)continue;
    const target=String(row.target||'').trim();if(!target)continue;
    if(!grouped.has(target)){grouped.set(target,[]);order.push(target);}
    grouped.get(target).push(row);
  }
  const out=[];
  for(const target of order){
    const same=grouped.get(target)||[];
    if(target==='combat:guardAction'){
      const value=combineGuardActionValues(same.map(row=>String(row.value||'').trim()).filter(Boolean));
      if(value&&value!=='0')out.push({target,value});
      continue;
    }
    const numeric=same.map(row=>String(row.value??'').trim()).every(value=>/^[+-]?\d+$/.test(value));
    if(numeric){
      const value=same.reduce((sum,row)=>sum+modifierValue(row),0);
      if(value)out.push({target,value:String(value)});
      continue;
    }
    // 数値補正以外の未知形式は壊さず、同一文字列だけ重複除去する。
    const values=[...new Set(same.map(row=>String(row.value??'').trim()).filter(Boolean))];
    values.forEach(value=>out.push({target,value}));
  }
  return out;
}
function collectEquipmentEffectPaletteLines(data={}){
  const equipment=data.equipment||{},items=paletteInventoryItems(data),result=[],seen=new Set();
  for(const slot of EQUIPMENT_SLOTS){
    if(slot.kind==='carry')continue;
    const eq=equipment[slot.key]||{},source=findPaletteInventoryItem(items,eq);
    const merged=normalizeInventoryItem({...(source||{}),...(eq||{})});
    const name=String(merged.name||eq.name||'').trim();if(!name)continue;
    const identity=String(source?inventoryItemKey(source):eq.itemId||`${slot.key}:${name}`);if(seen.has(identity))continue;seen.add(identity);
    const intrinsic=equipmentIntrinsicEffectsForItem(merged),unique=equipmentEffectsForItem(merged);
    const modifierRows=aggregatePaletteModifierRows(activeEquipmentModifierRows(merged));
    const upgrades=parseUpgradeLines(source?.upgradeEntries||eq.upgradeEntries||source?.upgradeLines||eq.upgradeLines||'').filter(entry=>normalizeUpgradeEntry(entry).content==='素材固有効果');
    if(!intrinsic.length&&!unique.length&&!modifierRows.length&&!upgrades.length)continue;
    if(result.length&&result[result.length-1] !== '')result.push('');
    result.push(name,'');
    if(modifierRows.length){result.push(`補正：${modifierRows.map(row=>`${modifierTargetDisplayName(row.target)} ${signedNumberText(row.value)||row.value}`).join(' / ')}`,'');}
    intrinsic.forEach(effect=>{const name=String(effect.name||'武器種固有').trim()||'武器種固有',detail=String(effect.detail||effect.summary||'').trim();if(detail)result.push(`武器種効果：${name}`,detail,'');});
    unique.forEach(effect=>{const name=String(effect.name||'固有効果').trim()||'固有効果',detail=String(effect.detail||effect.summary||'').trim();if(detail)result.push(`効果：${name}`,detail,'');});
    const seenUpgrade=new Set();upgrades.forEach(raw=>{const entry=normalizeUpgradeEntry(raw),effectName=entry.specialEffectName||'名称未設定';if(seenUpgrade.has(effectName))return;seenUpgrade.add(effectName);const detail=resolvePaletteSpecialUpgradeDetail(entry,items);result.push(`強化特殊効果：${effectName}`,`${effectName}：${detail||'詳細未設定'}`,'');});
    while(result.length&&result[result.length-1]==='')result.pop();
  }
  return result;
}
function collectSkillCrystalPaletteLines(data={}){
  const state=normalizeSkillGachaState(data.skillGacha||{}),result=[];
  state.equippedSkillIds.forEach(id=>{
    const skill=characterSkillById(id);if(!skill)return;
    const block=[`// 【${skill.name}】`];
    if(skill.timing)block.push(`// タイミング：${skill.timing}`);
    const resource=[skill.cost?`消費：${skill.cost}`:'',skill.ct?`CT：${skill.ct}`:''].filter(Boolean).join(' / ');if(resource)block.push(`// ${resource}`);
    if(skill.effect)block.push(`// 効果：${skill.effect}`);else if(skill.description)block.push(`// 効果：${skill.description}`);
    appendPaletteBlock(result,block);
  });
  return result;
}
function generatePaletteExport(data=collectData(false)) {
  const abilities = resolveAbilities(data);
  const totals = skillTotals(abilities, data.skills || defaultSkillAlloc(), data.equipment || {});
  const lines = [];
  const explanationLines = [];
  const fatiguePenalty=fatiguePenaltyForData(data);

  for (const cat of SKILL_CATEGORIES) {
    for (const sk of cat.skills) {
      const row=totals[sk.key]||{};
      const parts=paletteSkillValueParts(totals,sk.name)||{base:Number(row.total||0),equipment:0};
      lines.push(`2D6+${paletteSkillFormulaValue(parts,[signedNumberText(fatiguePenalty)])}>=目標値 【${sk.name}】`);
    }
  }

  const checkLines = collectCheckPaletteLines(data, totals);
  if (checkLines.length) appendPaletteBlock(lines, checkLines);

  const combat = computeCombatStats(abilities, data.skills || defaultSkillAlloc(), data.equipment || {});
  if (combat.guardActionValue && combat.guardActionValue !== '0') {
    appendPaletteBlock(lines, [`${combat.guardActionValue} 【防御行動値】`]);
    explanationLines.push(`// 常時軽減：防御値${combat.defenseValue}＋防御技能${combat.defenseSkillPoints}＝${combat.constantDamageReduction}`);
  }

  const weaponDamageLines = collectWeaponDamagePaletteLines(data, totals);
  if (weaponDamageLines.length) appendPaletteBlock(lines, weaponDamageLines);

  const spellLines = collectSetSpellPaletteLines(data, totals);
  if (spellLines.length) appendPaletteBlock(lines, spellLines);

  const carryItemLines=collectCarryItemPaletteLines(data,totals);
  if(carryItemLines.length)appendPaletteBlock(lines,carryItemLines);

  explanationLines.push('// 集中攻撃：主行動で集中し、次の自分のターン開始まで1点以上のダメージを受けなければ、射撃武器またはダメージ魔法を集中技能+2で判定する。命中時は通常ダメージにダメージダイス+1個。射撃・魔法の配分ポイント、後衛狙い-2、矢弾・MP消費は通常どおり。');
  if (fatiguePenalty) explanationLines.unshift(`// 疲労度${Math.max(0,Number(data?.resources?.fatigue)||0)}：すべての判定${fatiguePenalty}`);
  const equipmentEffectLines=collectEquipmentEffectPaletteLines(data);
  const crystalSkillLines=collectSkillCrystalPaletteLines(data);
  const bottom=[];
  if(explanationLines.length)appendPaletteBlock(bottom,explanationLines);
  if(equipmentEffectLines.length)appendPaletteBlock(bottom,equipmentEffectLines);
  if(crystalSkillLines.length)appendPaletteBlock(bottom,crystalSkillLines);
  if(bottom.length)appendPaletteBlock(lines,bottom);

  while(lines.length&&lines[lines.length-1]==='')lines.pop();
  return lines.join('\n');
}
