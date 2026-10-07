function emptyCharacter() {
  const stats = Object.fromEntries(STAT_ORDER.map(k => [k, '']));
  const abilities = Object.fromEntries(ABILITIES.map(a => [a.key, 0]));
  return { id: uuid(), name: '', gender: '', age: '', stats, abilities, skills: defaultSkillAlloc(), supportSettings:defaultSupportSettings(), manualCategoryBonuses: emptyCategoryBonus(), resources: { hpBonus:0, mpBonus:0, currentHp:'', currentMp:'', fatigue:0 }, equipment: defaultEquipment(), inventory: defaultInventory(), loadoutPresets:defaultLoadoutPresets(), skillGacha:defaultSkillGachaState(), craftLists:normalizeCraftLists(), autoSaveEnabled:true, memo: '', createdAt: nowIso(), updatedAt: nowIso() };
}

function collectData(updateTime=true) {
  const base = currentCharacter || emptyCharacter();
  syncAllEquipmentUpgradesToInventory();
  syncAllEquipmentSpellSetsToInventory();
  const equipment = getEquipmentState();
  const baseAbilities = getAbilityValues();
  const abilities = computeEffectiveAbilities(baseAbilities, equipment);
  return {
    ...base,
    name: $('charName').value.trim(),
    gender: $('charGender').value.trim(),
    age: $('charAge').value.trim(),
    stats: getStats(),
    abilities: baseAbilities,
    effectiveAbilities: abilities,
    skills: getSkillAlloc(),
    supportSettings: getSupportSettings(),
    manualCategoryBonuses: getManualCategoryBonuses(),
    resources: computeResources(abilities, getResourceState(), equipment),
    equipment,
    inventory: getInventoryState(),
    loadoutPresets: normalizeLoadoutPresets(loadoutPresetsState),
    skillGacha: getSkillGachaState(),
    craftLists: getCraftListsState(),
    combatStats: computeCombatStats(abilities, getSkillAlloc(), equipment),
    autoSaveEnabled: autoSaveEnabled!==false,
    memo: $('charMemo').value,
    updatedAt: updateTime ? nowIso() : base.updatedAt,
  };
}
function applyData(data) {
  const rawSupportSettings=data&&typeof data==='object'?data.supportSettings:null;
  currentCharacter = { ...emptyCharacter(), ...(data || {}) };
  currentCharacter.autoSaveEnabled=currentCharacter.autoSaveEnabled!==false;
  autoSaveEnabled=currentCharacter.autoSaveEnabled;
  $('charName').value = currentCharacter.name || '';
  $('charGender').value = currentCharacter.gender || '';
  $('charAge').value = currentCharacter.age || '';
  if ($('playerKey')) $('playerKey').value = currentCloudPlayerKey;
  if ($('newPlayerKey')) $('newPlayerKey').value = '';
  setStats(currentCharacter.stats || {}, false);
  setAbilityValues(currentCharacter.abilities || computeAbilitiesFromStats(currentCharacter.stats || {}));
  setSkillAlloc(currentCharacter.skills || {});
  setSupportSettings(rawSupportSettings,currentCharacter.id||'');
  currentCharacter.supportSettings=getSupportSettings();
  setManualCategoryBonuses(currentCharacter.manualCategoryBonuses || {});
  setResourceState(currentCharacter.resources || {});
  legacyEquipmentUpgradeMigrationCount=0;
  // v90.8.457: 倉庫→装備→倉庫表示の順に1回だけ構築する。
  // 旧処理は setInventoryState 内で全倉庫を描画した直後、setEquipmentState が同じ候補群を再構築していた。
  setInventoryState(currentCharacter.inventory || {}, {render:false});
  markInventoryUiDirty();
  loadoutPresetsState = normalizeLoadoutPresets(currentCharacter.loadoutPresets || {});
  setEquipmentState(currentCharacter.equipment || {});
  // 倉庫カードと所持品補助UIは対応タブを初めて開くまでDOMを作らない。
  // inventoryItemsState / count / 装備・所持割当など保存データそのものはここまでで完全復元済み。
  resetDeferredCharacterUi();
  setSkillGachaState(currentCharacter.skillGacha || {});
  setCraftListsState(currentCharacter.craftLists || {});
  if(legacyEquipmentUpgradeMigrationCount>0){
    setTimeout(()=>showToast(`旧形式の装備強化${legacyEquipmentUpgradeMigrationCount}件を新形式へ引き継ぎました。次回保存時に確定します。`,'ok'),0);
  }
  $('charMemo').value = currentCharacter.memo || '';
  updateAll();
}
