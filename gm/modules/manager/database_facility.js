function textHasFacility(row, facilityName){
  const hay = [row.source, row.unlockFacility, row.tags, row.usageTags].map(v=>String(v||'')).join(' / ');
  return hay.includes(facilityName);
}
function facilityRankLevel(rank){
  const numeric=numericRankValue(rank,'');
  if(numeric) return numeric;
  const raw=String(rank||'').trim();
  if(Object.prototype.hasOwnProperty.call(LEGACY_MATERIAL_GRADE_TO_NUMERIC_RANK, raw)) return LEGACY_MATERIAL_GRADE_TO_NUMERIC_RANK[raw];
  return null;
}
function facilityRankLimitLabel(){
  const n=numericRankValue(currentFacilityRankLimit,'');
  return n ? `★${n}以下（表示確認用）` : '全ランク';
}
function facilityRankVisible(row){
  const limitRaw=String(currentFacilityRankLimit||'').trim();
  if(limitRaw==='') return true;
  const limit=Number(limitRaw);
  const level=facilityRankLevel(row?.rank);
  return level !== null && level <= limit;
}
function facilityProductType(row){
  if(String(row?.__facilityProductType||'').trim()) return String(row.__facilityProductType).trim();
  if(String(row?.craftType||'').trim() || String(row?.requiredMaterials||'').trim()) return 'recipe';
  return 'item';
}
function facilityProducts(facilityName){
  const branchResults = new Set((state.recipes||[])
    .filter(r=>String(r.craftType||'').trim()==='武器派生')
    .map(r=>String(r.resultItem||'').trim()).filter(Boolean));
  const itemRows=(state.items||[])
    .filter(row=>{
      if(!row || !String(row.name||'').trim() || !textHasFacility(row, facilityName) || !facilityRankVisible(row)) return false;
      if(String(row.itemType||'').trim()==='装飾品'&&!['白環の聖印','蒼刻の魔印'].includes(String(row.name||'').trim())) return false;
      if(facilityName==='鍛冶屋' && branchResults.has(String(row.name||'').trim())) return false;
      if(String(row.materialType||'').trim()==='加工素材' && ![row.tags,row.usageTags,row.source].map(v=>String(v||'')).join(' ').includes('常設販売')) return false;
      if(facilityName==='骨董屋' && (String(row.itemCategory||'').includes('未鑑定スクロール') || String(row.tags||'').includes('ランダム販売'))) return false;
      if(!(Number(row.buyPrice)||0)) return false;
      return true;
    })
    .map(row=>({...row, __facilityProductType:'item'}));
  const recipeRows=(state.recipes||[])
    .filter(row=>{
      const source=String(row.recipeSource||'').trim();
      const price=Number(String(row.recipePrice||'').trim());
      return /店売り/u.test(source) && source.includes(facilityName) && Number.isFinite(price) && price>0 && facilityRankVisible(row);
    })
    .map(row=>({...row,__facilityProductType:'recipe'}));
  return itemRows.concat(recipeRows).sort((a,b)=>{
      const at=facilityProductType(a)==='recipe'?'レシピ':(a.itemType||a.dataKind||''), bt=facilityProductType(b)==='recipe'?'レシピ':(b.itemType||b.dataKind||'');
      const af=compareValues(at,bt); if(af) return af;
      const al=facilityRankLevel(a.rank), bl=facilityRankLevel(b.rank);
      if(al!==null && bl!==null && al!==bl) return al-bl;
      return compareValues(facilityProductDisplayName(a),facilityProductDisplayName(b));
    });
}
function productPriceText(row){
  const raw=facilityProductType(row)==='recipe' ? row.recipePrice : (row.buyPrice);
  const p=String(raw ?? '').trim();
  return p ? `${p}G` : '価格未設定';
}
function productKindText(row){
  if(facilityProductType(row)==='recipe'){
    const parts=['レシピ'];
    if(row.craftType) parts.push(row.craftType);
    if(row.category) parts.push(row.category);
    return parts.filter(Boolean).join(' / ');
  }
  const parts=[];
  if(String(row.dataKind||'').trim()==='素材') parts.push('素材');
  else if(row.itemType) parts.push(row.itemType);
  if(row.itemCategory) parts.push(row.itemCategory);
  if(row.materialType) parts.push(row.materialType);
  if(row.materialCategory) parts.push(row.materialCategory);
  return parts.filter(Boolean).join(' / ') || '分類未設定';
}
function facilityProductDisplayName(row){
  return facilityProductType(row)==='recipe' ? `${row.resultItem || row.name || '名称未設定'}のレシピ` : (row.name || '名称未設定');
}
function facilityProductLine(row){
  const bits=[productKindText(row)];
  if(String(row.rank||'').trim()) bits.push(playerRankLabel(row.rank));
  if(String(row.equipSlot||'').trim()) bits.push(`枠:${row.equipSlot}`);
  if(String(row.bagCapacity||'').trim()) bits.push(`容量:${row.bagCapacity}`);
  return `- ${facilityProductDisplayName(row)}（${bits.join('・')}） ${productPriceText(row)}`;
}
function facilityServiceLine(service){
  return `- ${service.name}（${service.price || '価格未設定'}）：${service.description || ''}`;
}

const GUILD_SUPPORT_SKILL_LABELS = {
  athletics:'運動',force:'力業',melee:'近接',guard:'防御',
  gather:'採取',craft:'細工',shoot:'射撃',operate:'操作',
  search:'探索',detect:'感知',evade:'回避',track:'追跡',
  alchemy:'調合',appraise:'鑑定',knowledge:'知識',design:'設計',
  resist:'抵抗',focus:'集中',magic:'魔法',prayer:'祈祷',
  negotiate:'交渉',service:'共感',art:'社交',leadership:'鼓舞'
};
function guildSupportDateLabel(){
  const d=new Date();
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
}
function guildSupportCharacterUrl(id=''){
  const base=apiBaseUrl();
  if(!base || !id)return '';
  try{
    const u=new URL(base);
    u.search='';
    u.searchParams.set('view',String(id));
    return u.toString();
  }catch(e){
    return `${base}?view=${encodeURIComponent(String(id))}`;
  }
}
function guildSupportEquipmentText(char={}){
  const eq=char.equipment||{};
  const parts=[];
  const push=(label,key)=>{
    const row=eq[key]||{};
    const name=String(row.name||'').trim();
    const type=String(row.type||'').trim();
    if(name)parts.push(`${label}:${name}`);
    else if(type && type!=='なし')parts.push(`${label}:${type}`);
  };
  push('右手','rightHand');
  push('左手','leftHand');
  push('鎧','armor');
  return parts.join(' / ')||'未設定';
}
function guildSupportSeedValue(text=''){
  let seed=2166136261;
  for(const ch of String(text)){seed^=ch.charCodeAt(0);seed=Math.imul(seed,16777619);}
  return seed>>>0;
}
function guildSupportSeededSample(rows=[],count=3,salt=''){
  const list=[...(rows||[])];
  let seed=guildSupportSeedValue(`${guildSupportTodayKey()}|${currentGuildSupportPlayerKey}|${salt}`);
  for(let i=list.length-1;i>0;i--){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const j=seed%(i+1);
    [list[i],list[j]]=[list[j],list[i]];
  }
  return list.slice(0,Math.min(Math.max(0,count),list.length));
}
function guildSupportSelectedCharacters(){
  const rows=currentGuildSupportCharacters||[];
  if(!rows.length)return [];
  const target=Math.min(Math.max(1,currentGuildSupportCount),rows.length);
  const map=new Map(rows.map(row=>[String(row.id||''),row]));
  const picked=(currentGuildSupportIds||[])
    .map(id=>map.get(String(id)))
    .filter(Boolean)
    .slice(0,target);

  if(picked.length<target){
    const used=new Set(picked.map(row=>String(row.id||'')));
    picked.push(...guildSupportSeededSample(
      rows.filter(row=>!used.has(String(row.id||''))),
      target-picked.length,
      'initial'
    ));
  }

  const ids=picked.map(row=>String(row.id||''));
  if(JSON.stringify(ids)!==JSON.stringify(currentGuildSupportIds||[])){
    currentGuildSupportIds=ids;
    saveGuildSupportState();
  }
  return picked;
}
function guildSupportCharacterCardHtml(char={}){
  const url=guildSupportCharacterUrl(char.id||'');
  const gender=String(char.gender||'').trim();
  const age=String(char.age||'').trim();
  const skillGroups=guildSupportSkillGroups(char);
  const meta=[gender,age?`${age}歳`:''].filter(Boolean);
  return `<div class="guild-support-card">
    <div class="guild-support-card-head">
      <span class="guild-support-card-name">${escapeHtml(char.name||'名称未設定')}</span>
      <span class="guild-support-card-meta">${meta.map(v=>`<span class="facility-chip">${escapeHtml(v)}</span>`).join('')}</span>
    </div>
    <div class="guild-support-card-line"><b>主な装備：</b>${escapeHtml(guildSupportEquipmentText(char))}</div>
    <div class="guild-support-card-line"><b>戦闘技能：</b>${escapeHtml(skillGroups.battle.length?skillGroups.battle.join('・'):'未設定')}</div>
    <div class="guild-support-card-line"><b>探索技能：</b>${escapeHtml(skillGroups.exploration.length?skillGroups.exploration.join('・'):'未設定')}</div>
    ${url?`<div class="guild-support-card-actions"><a class="guild-support-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">キャラクターシートを開く</a></div>`:''}
  </div>`;
}
function guildSupportPanelHtml(){
  const selected=guildSupportSelectedCharacters();
  const status=currentGuildSupportLoading
    ? 'akariキーからキャラクター候補を読み込んでいます。'
    : currentGuildSupportError
      ? currentGuildSupportError
      : currentGuildSupportCharacters.length
        ? `選出対象${currentGuildSupportCharacters.length}人から、本日${selected.length}人を選出しています。`
        : currentGuildSupportLoaded
          ? 'GMキャラシで「サポート選出対象」がONになっているキャラクターはいません。'
          : 'akariキーから候補を読み込んでください。';
  const disabled=currentGuildSupportLoading?' disabled':'';
  return `<section class="guild-quest-section">
    <h4>本日のサポート可能キャラクター <span class="view-mode-chip">${selected.length}人</span></h4>
    <p class="table-toolbar-note">プレイヤーキー「akari」に保存され、GMキャラシで「サポート選出対象」がONになっているキャラクターだけを候補にします。技能表示もGMキャラシ側の戦闘・探索設定を使用します。選出結果は日付ごとに保存されます。</p>
    <div class="guild-support-controls">
      <label>表示人数
        <select data-guild-support-count>${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option value="${n}"${n===currentGuildSupportCount?' selected':''}>${n}人</option>`).join('')}</select>
      </label>
      <button class="secondary" type="button" data-guild-support-load${disabled}>候補を再読み込み</button>
      <button class="secondary" type="button" data-guild-support-reroll${disabled}>本日のメンバーを再選出</button>
      <button class="ghost" type="button" data-guild-support-copy${disabled}>現在の一覧をコピー</button>
    </div>
    <div class="guild-support-status${currentGuildSupportError?' is-error':''}">${escapeHtml(status)}</div>
    ${selected.length?`<div class="guild-support-list">${selected.map(guildSupportCharacterCardHtml).join('')}</div>`:'<p class="notice">選出済みのサポートキャラクターはまだいません。</p>'}
  </section>`;
}
async function loadGuildSupportCharacters(showMessage=true){
  const key=GUILD_SUPPORT_PLAYER_KEY;
  currentGuildSupportPlayerKey=key;
  currentGuildSupportLoading=true;
  currentGuildSupportError='';
  saveGuildSupportState();
  renderFacilitiesPanel();
  try{
    const listRes=await jsonpApi({action:'list',playerKey:key});
    if(!listRes?.ok)throw new Error(listRes?.error||'キャラクター一覧の読み込みに失敗しました。');
    const items=Array.isArray(listRes.items)?listRes.items:[];
    const loaded=await Promise.all(items.map(async item=>{
      try{
        const res=await jsonpApi({action:'load',id:item.id,playerKey:key});
        if(!res?.ok)throw new Error(res?.error||'load failed');
        return {...(res.data||{}),id:String(res.data?.id||item.id||''),name:String(res.data?.name||item.name||'名称未設定')};
      }catch(e){
        console.warn('support character load failed',item?.id,e);
        return {id:String(item?.id||''),name:String(item?.name||'名称未設定'),updatedAt:item?.updatedAt||''};
      }
    }));
    currentGuildSupportCharacters=loaded.filter(row=>String(row.id||'').trim()&&guildSupportIsEligible(row)).sort((a,b)=>compareValues(a.name||'',b.name||''));
    currentGuildSupportLoaded=true;
    const valid=new Set(currentGuildSupportCharacters.map(row=>String(row.id||'')));
    currentGuildSupportIds=(currentGuildSupportIds||[]).filter(id=>valid.has(String(id)));
    guildSupportSelectedCharacters();
    saveGuildSupportState();
    if(showMessage)toast(`akariキーからサポート選出対象を${currentGuildSupportCharacters.length}人読み込みました`);
  }catch(e){
    currentGuildSupportCharacters=[];
    currentGuildSupportLoaded=true;
    currentGuildSupportError=String(e?.message||e||'キャラクター候補の読み込みに失敗しました。');
    if(showMessage)toast(currentGuildSupportError,'error');
  }finally{
    currentGuildSupportLoading=false;
    renderFacilitiesPanel();
  }
}
function rerollGuildSupportCharacters(){
  const rows=currentGuildSupportCharacters||[];
  if(!rows.length){
    loadGuildSupportCharacters(false);
    return;
  }
  const target=Math.min(Math.max(1,currentGuildSupportCount),rows.length);
  // 再選出では現在表示中のメンバーも候補へ戻す。
  // そのため、同じキャラクターが再び選ばれることもある。
  const pool=[...rows];
  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  currentGuildSupportIds=pool.slice(0,target).map(row=>String(row.id||''));
  saveGuildSupportState();
  renderFacilitiesPanel();
  toast(`本日のサポートキャラクターを${currentGuildSupportIds.length}人再選出しました`);
}
function guildSupportWeaponCategories(char={}){
  const eq=char.equipment||{};
  const excluded=new Set(['','なし','盾','防具','鎧','装飾品','バッグ','矢筒','道具']);
  const values=[];
  ['rightHand','leftHand'].forEach(key=>{
    const row=eq[key]||{};
    const category=String(
      row.weaponType || row.itemCategory || row.category || row.type || ''
    ).trim();
    if(category && !excluded.has(category))values.push(category);
  });
  return [...new Set(values)];
}
const GUILD_SUPPORT_LEGACY_SKILL_KEYS = Object.freeze({
  // v1.0.90移行用。supportSettings未保存の既存8人だけ旧設定を仮引継ぎする。
  ch_mrfspilf_0vcslwu:['prayer','appraise'],
  ch_mrhjv1ai_wspdju4:['melee','guard','leadership'],
  ch_mrskymwf_iavpdvu:['magic','melee','knowledge'],
  ch_mrw7p6l1_axpi8a6:['shoot','gather','search','detect'],
  ch_mrw7zexz_zg21ivd:['force','melee'],
  ch_mrw8dq1l_5yhss8s:['melee','craft','design','negotiate'],
  ch_msw12ot0_s1sdol0:['melee'],
  ch_mswidjjf_9w14r50:['alchemy','craft','design']
});
function guildSupportNormalizeMode(value='none'){
  const raw=String(value||'none').trim().toLowerCase();
  if(['battle','戦闘'].includes(raw))return 'battle';
  if(['exploration','探索'].includes(raw))return 'exploration';
  if(['both','どちらも','両方'].includes(raw))return 'both';
  return 'none';
}
function guildSupportHasExplicitSettings(char={}){
  const value=char&&char.supportSettings;
  return !!(value&&typeof value==='object'&&(Object.prototype.hasOwnProperty.call(value,'eligible')||(value.skillModes&&typeof value.skillModes==='object')));
}
function guildSupportNormalizedSettings(char={}){
  const explicit=guildSupportHasExplicitSettings(char);
  const raw=explicit?char.supportSettings:null;
  const skillModes=Object.fromEntries(Object.keys(GUILD_SUPPORT_SKILL_LABELS).map(key=>[key,'none']));
  if(explicit){
    const source=raw&&typeof raw.skillModes==='object'?raw.skillModes:{};
    for(const key of Object.keys(skillModes))skillModes[key]=guildSupportNormalizeMode(source[key]);
    return {eligible:raw?.eligible===true,skillModes,legacy:false};
  }
  const legacy=GUILD_SUPPORT_LEGACY_SKILL_KEYS[String(char.id||'').trim()]||[];
  legacy.forEach(key=>{if(key in skillModes)skillModes[key]='both';});
  return {eligible:legacy.length>0,skillModes,legacy:legacy.length>0};
}
function guildSupportIsEligible(char={}){return guildSupportNormalizedSettings(char).eligible===true;}
function guildSupportSkillGroups(char={}){
  const settings=guildSupportNormalizedSettings(char),battle=[],exploration=[];
  for(const [key,label] of Object.entries(GUILD_SUPPORT_SKILL_LABELS)){
    const mode=guildSupportNormalizeMode(settings.skillModes?.[key]);
    if(mode==='battle'||mode==='both')battle.push(label);
    if(mode==='exploration'||mode==='both')exploration.push(label);
  }
  return {battle,exploration};
}
function guildSupportCharacterText(char={}){
  const categories=guildSupportWeaponCategories(char);
  const skillGroups=guildSupportSkillGroups(char);
  return [
    `・${char.name||'名称未設定'}(${categories.length?categories.join('・'):'武器カテゴリ未設定'})`,
    `戦闘技能：${skillGroups.battle.length?skillGroups.battle.join('・'):'未設定'}`,
    `探索技能：${skillGroups.exploration.length?skillGroups.exploration.join('・'):'未設定'}`
  ].join('\n');
}
function guildSupportListText(){
  const rows=guildSupportSelectedCharacters();
  return [
    '【本日のサポート可能キャラクター】',
    '',
    rows.length?rows.map(guildSupportCharacterText).join('\n\n'):'・本日の選出はありません'
  ].join('\n');
}
function copyistRecipeKey(row={}){return String(row.id||row.publicId||row.name||row.resultItem||'').trim();}
function copyistAreaRows(){return mealAreaRows();}
function copyistAreaForRecipe(row={}){
  const key=String(row.unlockAreaKey||'').trim();
  return copyistAreaRows().find(area=>[area.id,area.unlockKey,area.name].map(v=>String(v||'').trim()).includes(key))||null;
}
function copyistIsBossTreasureRow(row={}){
  const tableId=String(row.tableId||'').trim();
  const chestName=String(row.chestName||'').trim();
  return /(?:^|_)(?:lord|boss)(?:_|$)/i.test(tableId) || /(?:戦利品箱|隠し宝箱|淵主の宝箱)$/.test(chestName);
}
function copyistNonBossTreasureRecipeKeys(){
  const keys=new Set();
  (state.treasure_tables||[]).forEach(row=>{
    if(String(row.enabled??'TRUE')==='FALSE')return;
    if(String(row.entryType||'').trim()!=='レシピ')return;
    if(copyistIsBossTreasureRow(row))return;
    [row.entryPublicId,row.recipeName,row.entryName].forEach(value=>{
      const key=String(value||'').trim();
      if(key)keys.add(key);
    });
  });
  return keys;
}
function copyistDailyPoolRows(){
  const nonBossKeys=copyistNonBossTreasureRecipeKeys();
  return (state.recipes||[]).filter(row=>{
    if(String(row.enabled??'TRUE')==='FALSE')return false;
    const source=String(row.recipeSource||'');
    const tags=String(row.tags||'');
    const permanent=/店売り/u.test(source);
    const initialUnlocked=/初期解放/u.test(source)||/初期解放/u.test(tags)||/通常弾/u.test(tags);
    if(permanent||initialUnlocked)return false;
    const recipeKeys=[row.publicId,row.id,row.name,`${String(row.resultItem||row.name||'').trim()}のレシピ`]
      .map(value=>String(value||'').trim()).filter(Boolean);
    if(!recipeKeys.some(key=>nonBossKeys.has(key)))return false;
    return Boolean(copyistAreaForRecipe(row));
  }).slice().sort((a,b)=>{
    const aa=copyistAreaForRecipe(a),ba=copyistAreaForRecipe(b);
    const ao=Number(aa?.unlockOrder)||1,bo=Number(ba?.unlockOrder)||1;
    if(ao!==bo)return ao-bo;
    const ar=Number(a.rank)||1,br=Number(b.rank)||1;
    if(ar!==br)return ar-br;
    return compareValues(a.name||a.resultItem||'',b.name||b.resultItem||'');
  });
}
function copyistSalePrice(row={}){
  const explicit=Number(String(row.recipePrice||'').trim());
  if(Number.isFinite(explicit)&&explicit>0)return Math.ceil(explicit/10)*10;
  const rank=Math.max(1,Number(row.rank)||1);
  const sell=Math.max(0,Number(row.recipeSellPrice)||0);
  const rankFloor=rank<=1?900:rank===2?1400:rank===3?2200:rank===4?3200:4600;
  return Math.ceil(Math.max(rankFloor,sell*5)/50)*50;
}
function ensureCopyistAreaState(){
  const areas=copyistAreaRows();
  if(!areas.length){currentCopyistUnlockedAreaIds=[];currentCopyistSpecifiedAreaId='';return areas;}
  const valid=new Set(areas.map(mealAreaId));
  currentCopyistUnlockedAreaIds=currentCopyistUnlockedAreaIds.filter(id=>valid.has(id));
  const initial=areas.find(area=>Number(area.unlockOrder)===1)||areas[0];
  const initialId=mealAreaId(initial);
  if(initialId&&!currentCopyistUnlockedAreaIds.includes(initialId))currentCopyistUnlockedAreaIds.unshift(initialId);
  if(!currentCopyistSpecifiedAreaId||!currentCopyistUnlockedAreaIds.includes(currentCopyistSpecifiedAreaId))currentCopyistSpecifiedAreaId=currentCopyistUnlockedAreaIds[0]||initialId;
  return areas;
}
function copyistSelectedRows(){
  const byKey=new Map(copyistDailyPoolRows().map(row=>[copyistRecipeKey(row),row]));
  return currentCopyistSelectedIds.map(id=>byKey.get(String(id))).filter(Boolean);
}
function randomPickWithoutReplacement(rows=[],count=1){
  const pool=rows.slice();
  const out=[];
  while(pool.length&&out.length<count){
    const idx=Math.floor(Math.random()*pool.length);
    out.push(pool.splice(idx,1)[0]);
  }
  return out;
}
function drawCopyistDailyRows(){
  ensureCopyistAreaState();
  const unlocked=new Set(currentCopyistUnlockedAreaIds);
  const pool=copyistDailyPoolRows().filter(row=>{
    const area=copyistAreaForRecipe(row);
    return area&&unlocked.has(mealAreaId(area));
  });
  const specifiedPool=pool.filter(row=>mealAreaId(copyistAreaForRecipe(row))===currentCopyistSpecifiedAreaId);
  if(!specifiedPool.length){toast('指定エリアに日替わり販売候補がありません','error');return false;}
  const specified=randomPickWithoutReplacement(specifiedPool,1)[0];
  const remaining=pool.filter(row=>copyistRecipeKey(row)!==copyistRecipeKey(specified));
  const randomRows=randomPickWithoutReplacement(remaining,COPYIST_DAILY_COUNT-1);
  const selected=[specified,...randomRows];
  currentCopyistSelectedIds=selected.map(copyistRecipeKey);
  currentCopyistSelectionDate=copyistTokyoDateKey();
  saveCopyistDailyState();
  return selected.length===COPYIST_DAILY_COUNT;
}
function copyistAreaCheckboxesHtml(areas=[],selectedIds=currentCopyistUnlockedAreaIds){
  const initial=areas.find(area=>Number(area.unlockOrder)===1)||areas[0];
  const initialId=mealAreaId(initial||{});
  const selected=new Set((selectedIds||[]).map(String));
  return areas.map(area=>{
    const id=mealAreaId(area),checked=selected.has(id)||id===initialId,fixed=id===initialId;
    return `<label class="copyist-area-check"><input type="checkbox" data-copyist-area-modal-check value="${escapeHtml(id)}" ${checked?'checked':''} ${fixed?'disabled':''}><span>${escapeHtml(area.name||id)}${String(area.areaType||'').trim()==='異界'?'（任意）':''}${fixed?'<small> / 初期解放</small>':''}</span></label>`;
  }).join('');
}
function renderCopyistAreaModal(){
  const grid=$('copyistAreaModalGrid');if(!grid)return;
  grid.innerHTML=copyistAreaCheckboxesHtml(ensureCopyistAreaState(),copyistAreaModalDraftIds)||'<p class="muted">エリアデータがありません。</p>';
}
function openCopyistAreaModal(){
  ensureCopyistAreaState();copyistAreaModalDraftIds=[...currentCopyistUnlockedAreaIds];renderCopyistAreaModal();
  const modal=$('copyistAreaModal');if(modal){modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');}
}
function closeCopyistAreaModal(){
  const modal=$('copyistAreaModal');if(modal){modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');if($('editModal')?.classList.contains('hidden')&&$('antiqueGearAreaModal')?.classList.contains('hidden'))document.body.classList.remove('modal-open');}
}
function applyCopyistAreaModal(){
  const areas=copyistAreaRows(),initial=areas.find(area=>Number(area.unlockOrder)===1)||areas[0],initialId=mealAreaId(initial||{});
  const next=[...new Set(copyistAreaModalDraftIds.map(String))];if(initialId&&!next.includes(initialId))next.unshift(initialId);
  const before=currentCopyistUnlockedAreaIds.slice().sort().join('|'),after=next.slice().sort().join('|');
  currentCopyistUnlockedAreaIds=next;ensureCopyistAreaState();
  if(before!==after){currentCopyistSelectedIds=[];currentCopyistSelectionDate='';}
  saveCopyistDailyState();closeCopyistAreaModal();renderFacilitiesPanel();if(before!==after)toast('レシピ販売の解放エリアを更新しました');
}
function copyistResultCardHtml(row={},index=0){
  const area=copyistAreaForRecipe(row);
  const specified=index===0;
  return `<article class="facility-product copyist-result-card"><div class="copyist-result-head"><span class="facility-chip">${specified?'指定エリア枠':'完全ランダム枠'}</span><span class="facility-chip">${escapeHtml(area?.name||row.unlockAreaKey||'エリア未設定')}</span></div><h4>${escapeHtml(row.name||row.resultItem||'名称未設定')}</h4><div class="facility-product-meta"><span class="facility-chip">${escapeHtml(playerRankLabel(row.rank)||'ランク未設定')}</span><span class="facility-chip">${escapeHtml(row.craftType||'製作区分未設定')}</span><span class="facility-chip">販売 ${copyistSalePrice(row)}G</span></div><div><b>完成品：</b>${escapeHtml(row.resultItem||row.name||'未設定')}</div><div><b>通常入手先：</b>${escapeHtml(row.recipeSource||'未設定')}</div></article>`;
}
function copyistRecipeCopyName(row={}){
  const raw=String(row.resultItem||row.name||'名称未設定').trim();
  return /レシピ$/.test(raw)?raw:`${raw}のレシピ`;
}
function copyistDailyText(){
  ensureCopyistAreaState();
  const rows=copyistSelectedRows();
  if(!rows.length)return '【コハクのレシピショップ】\n品揃え未選出';
  const lines=['【コハクのレシピショップ】'];
  lines.push(...rows.map(row=>`${copyistRecipeCopyName(row)} / ${playerRankLabel(row.rank)||'★?'} / ${copyistSalePrice(row)}G`));
  return lines.join('\n');
}
function renderCopyistDailyPool(){
  const areas=ensureCopyistAreaState();
  const unlockedSet=new Set(currentCopyistUnlockedAreaIds);
  const pool=copyistDailyPoolRows().filter(row=>{
    const area=copyistAreaForRecipe(row);
    return area&&unlockedSet.has(mealAreaId(area));
  });
  const specifiedOptions=areas.filter(area=>unlockedSet.has(mealAreaId(area))).map(area=>`<option value="${escapeHtml(mealAreaId(area))}" ${mealAreaId(area)===currentCopyistSpecifiedAreaId?'selected':''}>${escapeHtml(area.name||mealAreaId(area))}</option>`).join('');
  const rows=copyistSelectedRows();
  return `<div class="copyist-manager">
    <p class="notice">施設HTMLでは自動選出しません。ここで販売する6枠を決めてコピーします。1枠は指定エリアから、残り5枠はチェックした解放済みエリア全体から完全ランダムで選出します。候補は、常設店売りされず、通常・希少などボス以外の宝箱から実際に入手できるレシピだけです。料理・装備強化・装飾品強化・クリスタル強化・ボス専用レシピは候補に入りません。</p>
    <div class="copyist-control-grid">
      <section class="copyist-area-panel"><b>解放済みエリア</b><div class="copyist-area-summary">${escapeHtml(areas.filter(area=>unlockedSet.has(mealAreaId(area))).map(area=>area.name||mealAreaId(area)).join('、')||'未設定')}（${unlockedSet.size}エリア）</div><button type="button" class="secondary" data-copyist-area-open>解放エリアを選択</button></section>
      <label class="copyist-specified-field"><b>指定エリア枠</b><select data-copyist-specified-area>${specifiedOptions}</select></label>
      <div class="copyist-action-stack"><button type="button" data-copyist-draw>${rows.length?'販売品を再抽選':'販売品を選出'}</button><button type="button" class="ghost" data-copyist-copy ${rows.length?'':'disabled'}>選出結果をコピー</button></div>
    </div>
    <div class="copyist-stat-row"><span class="facility-chip">全候補 ${copyistDailyPoolRows().length}件</span><span class="facility-chip">解放範囲の候補 ${pool.length}件</span></div>
    <div class="copyist-result-grid">${rows.length?rows.map(copyistResultCardHtml).join(''):'<p class="muted">まだ販売品を選出していません。</p>'}</div>
  </div>`;
}
function facilityDisplayCount(facilityName){
  if(facilityName==='ギルド')return (FACILITY_DEFS.find(f=>f.name==='ギルド')?.services||[]).length;
  if(facilityName==='食事処')return mealRecipeRowsAll().length;
  if(facilityName==='レシピ販売')return copyistDailyPoolRows().length;
  return facilityProducts(facilityName).length;
}
function facilityDisplayLabel(facilityName){
  if(facilityName==='ギルド')return 'サービス';
  if(facilityName==='食事処')return '料理';
  if(facilityName==='レシピ販売')return '日替わり候補';
  return '販売商品';
}

function antiqueAreaRows(){
  return (state.exploration_areas||[]).filter(a=>String(a.enabled??'TRUE')!=='FALSE'&&String(a.areaType||'').trim()!=='隠しエリア'&&String(a.isHiddenArea||'').trim().toUpperCase()!=='TRUE').slice().sort((a,b)=>(Number(a.unlockOrder)||999)-(Number(b.unlockOrder)||999)||compareValues(a.name||a.id||'',b.name||b.id||''));
}
function antiqueAreaId(area={}){return String(area.id||area.name||'').trim();}
function antiqueEnsureGearAreaState(){
  const areas=antiqueAreaRows();
  if(!areas.length){currentAntiqueGearUnlockedAreaIds=[];return areas;}
  const valid=new Set(areas.map(antiqueAreaId));
  currentAntiqueGearUnlockedAreaIds=currentAntiqueGearUnlockedAreaIds.filter(id=>valid.has(String(id)));
  const initial=areas.find(a=>Number(a.unlockOrder)===1)||areas[0],initialId=antiqueAreaId(initial);
  if(initialId&&!currentAntiqueGearUnlockedAreaIds.includes(initialId))currentAntiqueGearUnlockedAreaIds.unshift(initialId);
  return areas;
}
function antiqueSelectedAreaSet(){antiqueEnsureGearAreaState();return new Set(currentAntiqueGearUnlockedAreaIds.map(String));}
function antiqueAreaLabel(area={}){return `${area.name||antiqueAreaId(area)}${String(area.areaType||'').trim()==='異界'?'（異界）':''}`;}
function antiqueGearAreaCheckboxesHtml(areas=[],selectedIds=currentAntiqueGearUnlockedAreaIds){
  const initial=areas.find(a=>Number(a.unlockOrder)===1)||areas[0],initialId=antiqueAreaId(initial||{}),selected=new Set((selectedIds||[]).map(String));
  return areas.map(area=>{
    const id=antiqueAreaId(area),fixed=id===initialId,checked=selected.has(id)||fixed;
    return `<label class="copyist-area-check"><input type="checkbox" data-antique-gear-area-modal-check value="${escapeHtml(id)}" ${checked?'checked':''} ${fixed?'disabled':''}><span>${escapeHtml(antiqueAreaLabel(area))}${fixed?'<small> / 初期解放</small>':''}</span></label>`;
  }).join('');
}
function renderAntiqueGearAreaModal(){
  const grid=$('antiqueGearAreaModalGrid');if(!grid)return;
  grid.innerHTML=antiqueGearAreaCheckboxesHtml(antiqueEnsureGearAreaState(),antiqueGearAreaModalDraftIds)||'<p class="muted">エリアデータがありません。</p>';
}
function openAntiqueGearAreaModal(){
  antiqueEnsureGearAreaState();antiqueGearAreaModalDraftIds=[...currentAntiqueGearUnlockedAreaIds];renderAntiqueGearAreaModal();
  const modal=$('antiqueGearAreaModal');if(modal){modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');}
}
function closeAntiqueGearAreaModal(){
  const modal=$('antiqueGearAreaModal');if(modal){modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');if($('editModal')?.classList.contains('hidden')&&$('copyistAreaModal')?.classList.contains('hidden'))document.body.classList.remove('modal-open');}
}
function applyAntiqueGearAreaModal(){
  const areas=antiqueEnsureGearAreaState(),valid=new Set(areas.map(antiqueAreaId)),initial=areas.find(a=>Number(a.unlockOrder)===1)||areas[0],initialId=antiqueAreaId(initial||{});
  const next=[...new Set(antiqueGearAreaModalDraftIds.map(String).filter(id=>valid.has(id)))];if(initialId&&!next.includes(initialId))next.unshift(initialId);
  const before=currentAntiqueGearUnlockedAreaIds.slice().sort().join('|'),after=next.slice().sort().join('|');
  currentAntiqueGearUnlockedAreaIds=next;currentAntiqueGearArea='';
  if(before!==after){currentAntiqueGearRows=[];currentAntiqueGearDate='';}
  saveAntiqueGearAreaState();closeAntiqueGearAreaModal();syncAntiqueGearSelectors();renderAntiqueGearStock(false);if(before!==after)toast('骨董装備の解放済みエリアを更新しました');
}
function antiqueBossMonsterNames(){
  const names=new Set();
  (state.event_tables||[]).filter(e=>String(e.eventType||'').trim()==='ボス遭遇').forEach(e=>{
    String(e.encounterComposition||'').split(/\n+/).forEach(line=>{
      const parts=line.split(',').map(v=>v.trim());if(parts[1])names.add(parts[1]);
    });
    const result=String(e.result||'');
    const m=result.match(/エリアボス[「\"]([^」\"]+)[」\"]/);if(m?.[1])names.add(m[1]);
  });
  return [...names].filter(Boolean);
}
function antiqueRowHasDirectBossOrigin(row={}){
  const text=[row.source,row.tags,row.usageTags,row.notes,row.branchType,row.name].map(v=>String(v||'')).join(' ');
  if(/ボス専用|ボス装備|ボス素材|エリアボス/.test(text))return true;
  const source=String(row.source||'');
  return antiqueBossMonsterNames().some(name=>source.includes(name));
}
function antiqueBossMaterialNames(){
  return (state.items||[]).filter(row=>String(row.dataKind||'').trim()==='素材'&&antiqueRowHasDirectBossOrigin(row)).map(row=>String(row.name||'').trim()).filter(Boolean);
}
function antiqueEquipmentUsesBossMaterial(row={}){
  const resultName=String(row.name||'').trim();if(!resultName)return false;
  const bossMaterials=antiqueBossMaterialNames();if(!bossMaterials.length)return false;
  return (state.recipes||[]).some(recipe=>{
    if(String(recipe.resultItem||'').trim()!==resultName)return false;
    const required=String(recipe.requiredMaterials||'');
    return bossMaterials.some(name=>required.includes(name));
  });
}
function antiqueRowIsBossOrigin(row={}){
  if(antiqueRowHasDirectBossOrigin(row))return true;
  if(['武器','防具','盾'].includes(String(row.itemType||'').trim())&&antiqueEquipmentUsesBossMaterial(row))return true;
  return false;
}
function antiqueRowWithinSelectedAreas(row={},selectedSet=antiqueSelectedAreaSet()){
  const key=String(row.unlockAreaKey||'').trim();
  if(!key)return false;
  return selectedSet.has(key);
}
const ANTIQUE_EXCLUSIVE_UPGRADE_RATE=20;
const ANTIQUE_WEAPON_CATEGORIES=['短剣','片手剣','片手斧','片手槌','片手槍','杖','鞭','ガントレット','両手剣','大槌','大鎌','長槍','弓','クロスボウ','ヘヴィクロスボウ','魔導書','祈祷書'];
const ANTIQUE_ARMOR_CATEGORIES=['軽装','中装','重装','魔導衣','祈祷衣'];
const ANTIQUE_FIXED_AMMO_ELEMENT=new Set(['弓','クロスボウ','ヘヴィクロスボウ']);
const ANTIQUE_BOOK_CATEGORIES=new Set(['魔導書','祈祷書']);
const ANTIQUE_ATTRIBUTE_WEIGHTS=[['物',44],['火',8],['水',8],['風',8],['雷',8],['光',8],['闇',8],['無',8]];
const ANTIQUE_GEAR_COST_BY_RANK=Object.freeze({2:15,3:30,4:45,5:60,6:75,7:90});
const ANTIQUE_AREA_MAX_RANK={
  武器:{area_outskirts_grass:1,area_nearby_forest:2,area_waterside_wetland:2,area_foothill_old_mine:3,area_reflection_water_garden:3,area_wind_swept_highland:4,area_ashcrown_volcanic_canyon:5},
  防具:{area_outskirts_grass:1,area_nearby_forest:2,area_waterside_wetland:2,area_foothill_old_mine:3,area_reflection_water_garden:3,area_wind_swept_highland:3,area_ashcrown_volcanic_canyon:4},
  盾:{area_outskirts_grass:1,area_nearby_forest:2,area_waterside_wetland:2,area_foothill_old_mine:3,area_reflection_water_garden:3,area_wind_swept_highland:3,area_ashcrown_volcanic_canyon:4}
};
const ANTIQUE_EXCLUSIVE_UPGRADES=[
  {id:'old_balance',name:'古式重心',slotCost:1,itemTypes:['武器'],excludeCategories:['魔導書','祈祷書'],target:'武器',detail:'移動を行わなかった手番に、この装備を使用する通常攻撃で与えるダメージ+1D2。1回の攻撃につき1回だけ適用する。同名効果は重複しない。'},
  {id:'worn_pierce',name:'磨耗穿ち',slotCost:1,itemTypes:['武器'],excludeCategories:['魔導書','祈祷書'],target:'武器',detail:'戦闘中1回、この装備を使用する通常攻撃が命中した時、その攻撃のダメージ+1D3。ダメージ算出前に宣言する。同名効果は重複しない。'},
  {id:'old_margin',name:'古書の余白',slotCost:1,itemTypes:['武器'],categories:['魔導書','祈祷書'],target:'魔導書・祈祷書',detail:'2枠目以降にセットした術式・祈祷を使用する場合、戦闘中1回だけその判定+2。判定前に宣言する。同名効果は重複しない。'},
  {id:'old_circuit',name:'旧式導環',slotCost:2,itemTypes:['武器'],categories:['杖','魔導書','祈祷書'],target:'杖・魔導書・祈祷書',detail:'戦闘中1回、この装備を使用して行う魔法・祈祷の消費MPを2点軽減する（最低1）。同名効果は重複しない。'},
  {id:'worn_lining',name:'馴染み革',slotCost:1,itemTypes:['防具'],target:'防具',detail:'戦闘中、自分を対象とする最初の攻撃判定に対して回避値+2。判定の解決後に解除する。同名効果は重複しない。'},
  {id:'patched_reinforce',name:'継ぎ当て補強',slotCost:2,itemTypes:['防具'],target:'防具',detail:'現在HPが最大HPの半分以下の間、防御値+1、防御行動中はさらに防御行動値+1。同名効果は重複しない。'},
  {id:'old_guard_rim',name:'古守の縁金',slotCost:1,itemTypes:['盾'],target:'盾',detail:'防御行動中、その防御行動中に最初に受けるダメージを2点軽減する。1回の防御行動につき1回だけ適用する。同名効果は重複しない。'},
  {id:'familiar_grip',name:'握り癖',slotCost:2,itemTypes:['盾'],target:'盾',detail:'《かばう》に成功して自分が受けるダメージを2点軽減する。1ラウンドにつき1回だけ適用する。同名効果は重複しない。'}
];
function antiqueExclusiveCompatible(def={},equipment={}){
  const type=String(equipment.itemType||'').trim(),cat=String(equipment.itemCategory||'').trim();
  if((def.itemTypes||[]).length&&!def.itemTypes.includes(type))return false;
  if((def.categories||[]).length&&!def.categories.includes(cat))return false;
  if((def.excludeCategories||[]).includes(cat))return false;
  return true;
}
function antiqueExclusiveEntry(def={},equipment={}){
  return {id:`antique_exclusive_${def.id}`,name:`骨董限定：${def.name}`,rank:equipment.rank||'',equipmentUpgradeEffect:def.name,equipmentUpgradeSlotCost:def.slotCost,equipmentUpgradeDetail:def.detail,equipmentUpgradeTarget:def.target,antiqueExclusive:true};
}
function antiqueGearExclusivePool(equipment={}){return ANTIQUE_EXCLUSIVE_UPGRADES.filter(def=>antiqueExclusiveCompatible(def,equipment)).map(def=>antiqueExclusiveEntry(def,equipment));}
function antiqueGearSelectedKind(){return String($('facilityAntiqueGearKind')?.value||'武器').trim()||'武器';}
function antiqueGearCategoryOptions(kind=antiqueGearSelectedKind()){
  if(kind==='武器')return ANTIQUE_WEAPON_CATEGORIES.slice();
  if(kind==='防具')return ANTIQUE_ARMOR_CATEGORIES.slice();
  return ['盾'];
}
function antiqueGearMaxRank(kind=antiqueGearSelectedKind(),selectedSet=antiqueSelectedAreaSet()){
  const map=ANTIQUE_AREA_MAX_RANK[kind]||ANTIQUE_AREA_MAX_RANK.武器;
  let max=1;for(const id of selectedSet)max=Math.max(max,Number(map[String(id)]||0));return Math.max(1,max);
}
function syncAntiqueGearSelectors(){
  const kind=antiqueGearSelectedKind(),catSel=$('facilityAntiqueGearCategory'),rankSel=$('facilityAntiqueGearRank');
  if(catSel){const current=String(catSel.value||'');const cats=antiqueGearCategoryOptions(kind);catSel.innerHTML=cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');catSel.value=cats.includes(current)?current:(cats[0]||'');}
  if(rankSel){const max=antiqueGearMaxRank(kind);const current=Math.max(2,Number(rankSel.value)||Math.max(2,max));if(max<2){rankSel.innerHTML='<option value="2">★2（未解放）</option>';rankSel.value='2';rankSel.disabled=true;}else{rankSel.disabled=false;rankSel.innerHTML=Array.from({length:max-1},(_,i)=>`<option value="${i+2}">★${i+2}</option>`).join('');rankSel.value=String(Math.min(max,current));}}
  const rank=Math.max(2,Number(rankSel?.value)||2),count=Math.max(1,Math.min(5,Number($('facilityAntiqueGearCount')?.value||1)||1));
  const cost=ANTIQUE_GEAR_COST_BY_RANK[rank]||Math.max(15,(rank-1)*15);
  if($('facilityAntiqueGearCost'))$('facilityAntiqueGearCost').textContent=`必要魔物素材★合計：${cost*count}（1回 ${cost}）`;
}
function antiqueGearReferenceRows(kind='',category='',rank=1,selectedSet=antiqueSelectedAreaSet()){
  const type=kind==='盾'?'盾':kind;
  const all=(state.items||[]).filter(row=>String(row.itemType||'').trim()===type&&String(row.itemCategory||'').trim()===category&&!antiqueRowIsBossOrigin(row)&&antiqueRowWithinSelectedAreas(row,selectedSet)&&!/骨董装備|骨董個体/.test([row.tags,row.usageTags,row.source].map(v=>String(v||'')).join(' ')));
  const exact=all.filter(row=>Number(row.rank||0)===Number(rank));if(exact.length)return exact;
  const lower=all.filter(row=>Number(row.rank||0)<=Number(rank)).sort((a,b)=>Number(b.rank||0)-Number(a.rank||0));if(lower.length){const best=Number(lower[0].rank||0);return lower.filter(row=>Number(row.rank||0)===best);}
  return all.slice().sort((a,b)=>Number(a.rank||999)-Number(b.rank||999)).slice(0,3);
}
function antiqueDiceAverage(expr=''){
  let text=String(expr||'').replace(/\s+/g,''),sum=0,matched=false;
  text=text.replace(/([+-]?)(\d*)D(?:\((\d+)[～~\-](\d+)\)|(\d+))/gi,(m,sg,c,a,b,s)=>{matched=true;const count=Number(c||1),faces=s?Number(s):(Number(a)+Number(b))/2;sum+=(sg==='-'?-1:1)*count*(faces+1)/2;return '';});
  const nums=text.match(/[+-]?\d+(?:\.\d+)?/g)||[];nums.forEach(n=>sum+=Number(n)||0);return matched||nums.length?sum:0;
}
function antiquePowerCandidates(rows=[]){
  const map=new Map();for(const row of rows){const p=String(row.power||'').trim();if(p&&!map.has(p))map.set(p,antiqueDiceAverage(p));}
  return [...map].map(([power,avg])=>({power,avg})).sort((a,b)=>a.avg-b.avg);
}
function antiqueShiftPower(expr='',delta=0){
  const text=String(expr||'').trim();const d=Math.trunc(Number(delta)||0);if(!text||!d)return text;
  const m=text.match(/([+-])(\d+)$/);if(m){const old=(m[1]==='-'?-1:1)*Number(m[2]||0),next=old+d,base=text.slice(0,m.index);if(next===0)return base;return `${base}${next>0?'+':''}${next}`;}
  return `${text}${d>0?'+':''}${d}`;
}
function antiquePercentileRow(rows=[],p=.5){if(!rows.length)return null;return rows[Math.max(0,Math.min(rows.length-1,Math.round((rows.length-1)*p)))];}
function antiqueRollQuality(){const r=Math.random()*100;return r<40?'low':r<92?'standard':'jackpot';}
function antiqueRollSlotTier(){const r=Math.random()*100;return r<35?-1:r<90?0:1;}
function antiqueMedianNumber(values=[],fallback=0){const a=values.map(Number).filter(Number.isFinite).sort((x,y)=>x-y);return a.length?a[Math.floor((a.length-1)/2)]:fallback;}
function antiqueModifierMap(text=''){const out=new Map();String(text||'').split(/\n+/).forEach(line=>{const [k,v]=line.split(/\t+/);if(String(k||'').trim())out.set(String(k).trim(),String(v||'').trim());});return out;}
function antiqueModifierText(map=new Map()){return [...map.entries()].filter(([,v])=>String(v).trim()!=='').map(([k,v])=>`${k}\t${v}`).join('\n');}
function antiqueRollIntrinsicModifierSlotCount(){
  // 骨董本体補正は「補正なし」が最も多く、1枠、2枠の順に希少。
  // 0枠 50% / 1枠 35% / 2枠 15%
  const r=Math.random()*100;
  return r<50?0:r<85?1:2;
}
function antiqueModifierTypeWeights(kind='',category=''){
  const cat=String(category||'').trim();
  if(kind==='武器'){
    switch(cat){
      case '短剣': return {hit:4,'skill:evade':4,'skill:search':2,'skill:craft':1,'combat:defense':1};
      case '片手剣': return {hit:3,'combat:defense':3,'combat:guardAction':3,'skill:evade':1,'skill:detect':1};
      case '片手斧': return {hit:5,'combat:defense':2,'combat:guardAction':1,'skill:gather':2};
      case '片手槌': return {hit:3,'combat:guardAction':4,'combat:defense':2,'skill:craft':2};
      case '片手槍': return {hit:5,'combat:guardAction':2,'combat:defense':1,'skill:detect':2};
      case '杖': return {hit:2,'skill:evade':2,'resource:maxMp':3,'skill:magic':2,'skill:detect':2,'skill:search':2};
      case '鞭': return {hit:5,'skill:evade':2,'skill:detect':2,'skill:search':2};
      case 'ガントレット': return {hit:4,'skill:evade':2,'combat:defense':2,'combat:guardAction':2,'skill:athletics':2};
      case '両手剣': return {hit:5,'skill:evade':2,'combat:defense':1,'skill:athletics':2};
      case '大槌': return {hit:5,'combat:guardAction':2,'skill:evade':1,'skill:craft':2};
      case '大鎌': return {hit:5,'skill:evade':2,'skill:detect':1,'skill:gather':2};
      case '長槍': return {hit:5,'skill:detect':2,'skill:evade':1,'skill:search':2};
      case '弓': return {hit:5,'skill:detect':3,'skill:evade':1,'skill:search':2};
      case 'クロスボウ': return {hit:5,'skill:detect':2,'skill:evade':1,'skill:search':2};
      case 'ヘヴィクロスボウ': return {hit:5,'combat:defense':2,'combat:guardAction':1,'skill:detect':1};
      case '魔導書': return {'skill:magic':5,'resource:maxMp':5,'skill:knowledge':2,'skill:appraise':2};
      case '祈祷書': return {'skill:prayer':5,'resource:maxMp':5,'skill:knowledge':2,'skill:empathy':2};
      default: return {hit:4,'skill:evade':2,'skill:detect':1,'skill:search':1};
    }
  }
  if(kind==='防具'){
    switch(cat){
      case '軽装': return {'skill:evade':5,'combat:defense':2,'combat:guardAction':2,'resource:maxHp':1};
      case '中装': return {'combat:defense':4,'combat:guardAction':4,'skill:evade':1,'resource:maxHp':2};
      case '重装': return {'combat:defense':5,'combat:guardAction':5,'skill:evade':2,'resource:maxHp':2};
      case '魔導衣': return {'resource:maxMp':5,'skill:evade':2,'combat:defense':2,'combat:guardAction':2};
      case '祈祷衣': return {'resource:maxMp':4,'resource:maxHp':2,'combat:defense':2,'combat:guardAction':3};
      default: return {'combat:defense':4,'combat:guardAction':4,'skill:evade':1,'resource:maxHp':1};
    }
  }
  return {'combat:defense':5,'combat:guardAction':5,'skill:evade':2,'resource:maxHp':1};
}
const ANTIQUE_SIGNATURE_MODIFIER_KEYS=Object.freeze({
  '武器':Object.freeze({
    '短剣':Object.freeze(['hit','skill:evade']),
    '片手剣':Object.freeze(['combat:defense','combat:guardAction']),
    '片手槍':Object.freeze(['hit']),
    '杖':Object.freeze(['skill:evade']),
    'ガントレット':Object.freeze(['hit']),
    '長槍':Object.freeze(['hit','skill:detect','skill:search']),
    '弓':Object.freeze(['hit','skill:detect']),
    'クロスボウ':Object.freeze(['hit','skill:detect']),
    'ヘヴィクロスボウ':Object.freeze(['combat:defense']),
    '魔導書':Object.freeze(['resource:maxMp','skill:knowledge','skill:appraise']),
    '祈祷書':Object.freeze(['resource:maxMp','skill:knowledge','skill:empathy'])
  }),
  '防具':Object.freeze({
    '軽装':Object.freeze(['skill:evade']),
    '中装':Object.freeze(['combat:defense','combat:guardAction']),
    '重装':Object.freeze(['combat:defense','combat:guardAction']),
    '魔導衣':Object.freeze(['resource:maxMp']),
    '祈祷衣':Object.freeze(['resource:maxHp','resource:maxMp'])
  }),
  '盾':Object.freeze({'盾':Object.freeze(['combat:defense','combat:guardAction'])})
});
function antiqueIsSignatureModifier(kind='',category='',key=''){
  const type=kind==='盾'?'盾':String(kind||'').trim(),cat=String(category||'').trim();
  const list=ANTIQUE_SIGNATURE_MODIFIER_KEYS[type]?.[cat]||[];
  return list.includes(String(key||'').trim());
}
function antiqueNormalPositiveModifierMax(kind='',category='',key='',rank=1){
  const type=kind==='盾'?'盾':String(kind||'').trim(),cat=String(category||'').trim(),targetRank=Math.max(1,Number(rank)||1),values=[];
  for(const row of (state.items||[])){
    if(String(row.itemType||'').trim()!==type||String(row.itemCategory||'').trim()!==cat)continue;
    if(Number(row.rank||0)>targetRank||antiqueRowIsBossOrigin(row))continue;
    if(/骨董装備|骨董個体/.test([row.tags,row.usageTags,row.source].map(v=>String(v||'')).join(' ')))continue;
    const raw=String(antiqueModifierMap(row.modifiers).get(key)||'').trim();
    if(!/^\+?\d+$/.test(raw))continue;
    const n=Number(raw);if(n>0)values.push(n);
  }
  return values.length?Math.max(...values):0;
}
function antiqueModifierRange(kind='',category='',key='',rank=1){
  const type=kind==='盾'?'盾':String(kind||'').trim(),cat=String(category||'').trim(),k=String(key||'').trim(),r=Math.max(1,Number(rank)||1);
  let neg=1,pos=1;

  // HP/MPは1点の価値が命中・回避等と異なるため、★帯に応じた専用幅を持つ。
  if(k==='resource:maxHp'){neg=r<=2?2:r<=4?3:4;pos=neg;}
  if(k==='resource:maxMp'){neg=r<=2?1:r<=4?2:3;pos=neg;}

  if(type==='武器'){
    // 武器のHP/MP補正は、得意補正として明示されたもの以外は大きく上振れさせない。
    // HP/MPは単位が異なるためマイナス幅だけ★帯差を残し、プラス側は通常+1を基準にする。
    if(k==='resource:maxHp'||k==='resource:maxMp')pos=1;
    const negativeBias={
      '短剣':{'hit':2,'skill:evade':2},
      '片手剣':{'combat:guardAction':2},
      '片手斧':{'hit':2},
      '片手槌':{'skill:evade':2},
      '片手槍':{'hit':2},
      '杖':{'skill:evade':2},
      'ガントレット':{'hit':2},
      '両手剣':{'skill:evade':2},
      '大槌':{'hit':2,'skill:evade':2},
      '大鎌':{'hit':2},
      '長槍':{'hit':2,'skill:detect':2},
      'クロスボウ':{'hit':2},
      'ヘヴィクロスボウ':{'hit':2}
    };
    neg=Math.max(neg,Number(negativeBias[cat]?.[k]||1));

    // 得意補正だけ、通常同系統で実際に付く最大プラス値+1程度まで上振れ可能。
    // 通常側にその補正が無い場合は、不得意補正として共通上限を超えて伸ばさない。
    if(antiqueIsSignatureModifier(type,cat,k)){
      const normalMax=antiqueNormalPositiveModifierMax(type,cat,k,r);
      if(normalMax>0)pos=normalMax+1;
    }
  }else if(type==='防具'){
    if(cat==='軽装'&&k==='skill:evade'){
      neg=r>=3?2:1;
      const normalMax=antiqueNormalPositiveModifierMax(type,cat,k,r);
      pos=Math.max(2,normalMax>0?normalMax+1:2);
    }else if(cat==='中装'){
      if(k==='combat:defense'||k==='combat:guardAction'){neg=1;pos=2;}
      else if(k==='skill:evade'){neg=2;pos=1;}
    }else if(cat==='重装'){
      if(k==='combat:defense'||k==='combat:guardAction'){neg=2;pos=2;}
      else if(k==='skill:evade'){neg=2;pos=1;}
    }else if(cat==='魔導衣'){
      if(k==='resource:maxMp')pos=(r<=2?2:r<=4?3:4);
      else if(k==='skill:evade'){neg=2;pos=1;}
    }else if(cat==='祈祷衣'){
      if(k==='resource:maxHp')pos=(r<=2?3:r<=4?4:5);
      else if(k==='resource:maxMp')pos=(r<=2?2:r<=4?3:4);
    }
  }else if(type==='盾'){
    if(k==='combat:defense'||k==='combat:guardAction'){neg=1;pos=2;}
    else if(k==='skill:evade'){neg=2;pos=1;}
  }

  // 骨董補正を持つ場合、0は候補に含めない。必ず実効的なプラスまたはマイナスになる。
  return {min:-Math.max(1,Math.trunc(neg)),max:Math.max(1,Math.trunc(pos))};
}
function antiqueSignedModifierValue(kind='',category='',key='',rank=1){
  const range=antiqueModifierRange(kind,category,key,rank),min=Math.trunc(range.min),max=Math.trunc(range.max);
  const candidates=[];
  for(let n=min;n<=max;n++)if(n!==0)candidates.push(n);
  const n=candidates.length?candidates[Math.floor(Math.random()*candidates.length)]:(Math.random()<.5?-1:1);
  return `${n>0?'+':''}${n}`;
}
function antiqueWeightedModifierTypes(kind='',category='',count=0){
  const weights=antiqueModifierTypeWeights(kind,category),pool=Object.entries(weights).map(([key,weight])=>({key,weight:Math.max(.01,Number(weight)||1)})),out=[];
  while(out.length<count&&pool.length){
    let roll=Math.random()*pool.reduce((s,x)=>s+x.weight,0),index=pool.length-1;
    for(let i=0;i<pool.length;i++){roll-=pool[i].weight;if(roll<=0){index=i;break;}}
    out.push(pool[index].key);pool.splice(index,1);
  }
  return out;
}
function antiqueRollIntrinsicModifiers(kind='',category='',rank=1){
  const slotCount=antiqueRollIntrinsicModifierSlotCount();
  const types=antiqueWeightedModifierTypes(kind,category,slotCount);
  const map=new Map();
  types.forEach(key=>map.set(key,antiqueSignedModifierValue(kind,category,key,rank)));
  return {slotCount,map,text:antiqueModifierText(map)};
}
const ANTIQUE_MODIFIER_LABELS=Object.freeze({'hit':'命中','skill:evade':'回避','combat:defense':'防御','combat:guardAction':'防御行動値','skill:detect':'感知','skill:magic':'魔法','skill:prayer':'祈祷','resource:maxMp':'最大MP','resource:maxHp':'最大HP'});
function antiqueIntrinsicModifierText(eq={}){
  const source=String(eq.antiqueBonusModifiers!==undefined?eq.antiqueBonusModifiers:(String(eq.itemType||'').trim()==='武器'?eq.modifiers:''));
  const map=antiqueModifierMap(source),parts=[];
  for(const [key,val] of map.entries()){
    if(!String(val||'').trim())continue;
    const value=String(val).trim();parts.push(`${ANTIQUE_MODIFIER_LABELS[key]||key}${value.startsWith('-')||value.startsWith('+')?'':'+'}${value}`);
  }
  return parts.join(' / ');
}
function antiqueGuardCandidate(rows=[]){
  const vals=[];for(const row of rows){const map=antiqueModifierMap(row.modifiers);const g=String(map.get('combat:guardAction')||'').replace(/^\+/,'').trim();if(g)vals.push({guard:g,avg:antiqueDiceAverage(g)});}return vals.sort((a,b)=>a.avg-b.avg);
}
function antiqueDefenseCandidate(rows=[]){return antiqueMedianNumber(rows.map(row=>Number(String(antiqueModifierMap(row.modifiers).get('combat:defense')||'0').replace(/^\+/,''))),0);}
function antiqueFixedModifierSource(kind='',category='',rows=[]){
  const all=(state.items||[]).filter(row=>String(row.itemType||'').trim()===(kind==='盾'?'盾':kind)&&String(row.itemCategory||'').trim()===category&&!antiqueRowIsBossOrigin(row));
  if(kind==='盾')return all.find(row=>String(row.name||'').trim()==='小盾')||rows[0]||all[0]||{};
  return all.slice().sort((a,b)=>Number(a.rank||999)-Number(b.rank||999))[0]||rows[0]||{};
}
const ANTIQUE_ONE_HAND_OFFHAND_RANGE=Object.freeze({
  '短剣':[1,3],
  '片手剣':[1,3],
  '片手斧':[2,4],
  '片手槌':[1,3],
  '片手槍':[1,3],
  '杖':[1,2],
  '鞭':[1,3]
});
function antiqueRollOffhandBonus(category=''){
  const cat=String(category||'').trim(),range=ANTIQUE_ONE_HAND_OFFHAND_RANGE[cat];
  if(!Array.isArray(range)||range.length<2)return '';
  const min=Math.max(0,Math.trunc(Number(range[0])||0)),max=Math.max(min,Math.trunc(Number(range[1])||min));
  return String(min+Math.floor(Math.random()*(max-min+1)));
}
function antiqueGarmentBaseResourceModifiers(category='',rank=1){
  const cat=String(category||'').trim(),r=Math.max(1,Math.trunc(Number(rank)||1)),out=new Map();
  if(cat==='魔導衣'){
    // 魔導衣はMP特化またはHP/MP混成。通常装備の固有効果を持たない骨董個体なので、
    // 同★通常装備の補正をコピーせず、★だけを使って骨董専用の基礎リソースを生成する。
    if(Math.random()<.55){
      const mp=Math.max(4,Math.round(r*1.5+1));
      out.set('resource:maxMp',`+${mp}`);
    }else{
      const hp=Math.max(3,r),mp=r>=3?r+1:2;
      out.set('resource:maxHp',`+${hp}`);out.set('resource:maxMp',`+${mp}`);
    }
  }else if(cat==='祈祷衣'){
    // 祈祷衣はHP特化を中心に、HP/MP混成・MP特化も生成する。
    const roll=Math.random();
    if(roll<.45){
      const hp=Math.max(5,r*2+1);out.set('resource:maxHp',`+${hp}`);
    }else if(roll<.75){
      const hp=Math.max(4,r+2),mp=Math.max(2,r);out.set('resource:maxHp',`+${hp}`);out.set('resource:maxMp',`+${mp}`);
    }else{
      const mp=Math.max(4,r+2);out.set('resource:maxMp',`+${mp}`);
    }
  }
  return out;
}
function antiqueApplyIntrinsicRoll(baseMap=new Map(),rollMap=new Map(),kind='武器'){
  const out=new Map(baseMap);
  for(const [key,value] of rollMap.entries()){
    if(kind!=='武器'&&key==='combat:defense'){
      const base=Number(String(out.get(key)||'0').replace(/^\+/,''))||0,delta=Number(value)||0;
      out.set(key,String(Math.max(0,base+delta)));continue;
    }
    if(kind!=='武器'&&key==='combat:guardAction'){
      out.set(key,antiqueShiftPower(String(out.get(key)||'0'),Number(value)||0));continue;
    }
    if(kind!=='武器'&&(key==='resource:maxHp'||key==='resource:maxMp')){
      const base=Number(String(out.get(key)||'0').replace(/^\+/,''))||0,delta=Number(value)||0,next=Math.max(0,base+delta);
      if(next>0)out.set(key,`+${next}`);else out.delete(key);
      continue;
    }
    out.set(key,String(value));
  }
  return out;
}
function antiqueRandomAttribute(category=''){
  if(ANTIQUE_FIXED_AMMO_ELEMENT.has(category))return '矢弾依存';
  if(ANTIQUE_BOOK_CATEGORIES.has(category))return '';
  const total=ANTIQUE_ATTRIBUTE_WEIGHTS.reduce((s,x)=>s+x[1],0);let r=Math.random()*total;for(const [name,w] of ANTIQUE_ATTRIBUTE_WEIGHTS){r-=w;if(r<=0)return name;}return '物';
}
function antiqueGearBaseProfile(kind='',category='',rank=1,selectedSet=antiqueSelectedAreaSet()){
  const refs=antiqueGearReferenceRows(kind,category,rank,selectedSet),quality=antiqueRollQuality(),source=antiqueFixedModifierSource(kind,category,refs),slotBase=Math.max(1,Math.round(antiqueMedianNumber(refs.map(r=>Number(r.upgradeLimit||0)).filter(Boolean),Math.max(2,rank+1))));
  const slotDelta=antiqueRollSlotTier();
  const upgradeLimit=Math.max(1,Math.min(9,slotBase+slotDelta));
  const intrinsic=antiqueRollIntrinsicModifiers(kind,category,rank);
  const profile={quality,slotDelta,upgradeLimit,source,refs,power:'',element:'',modifiers:'',defense:'',guard:'',offhandBonus:'',intrinsicSlotCount:intrinsic.slotCount,intrinsicModifiers:intrinsic.text};
  if(kind==='武器'){
    if(!ANTIQUE_BOOK_CATEGORIES.has(category)){
      const powers=antiquePowerCandidates(refs),base=antiquePercentileRow(powers,.50)?.power||String(source.power||'');
      profile.power=antiqueShiftPower(base,quality==='low'?-1:quality==='jackpot'?1:0);
    }
    profile.element=antiqueRandomAttribute(category);
    profile.offhandBonus=antiqueRollOffhandBonus(category);
    profile.modifiers=antiqueModifierText(antiqueApplyIntrinsicRoll(new Map(),intrinsic.map,'武器'));
  }else{
    const def0=antiqueDefenseCandidate(refs),guards=antiqueGuardCandidate(refs),g0=antiquePercentileRow(guards,.5)?.guard||'';
    let defense=def0,guard=g0;
    if(quality==='low'){
      if(Math.random()<.5)defense=Math.max(0,defense-1);else guard=antiqueShiftPower(guard,-1);
    }else if(quality==='jackpot'){
      if(Math.random()<.5)defense=defense+1;else guard=antiqueShiftPower(guard,1);
    }
    const baseMap=new Map();baseMap.set('combat:defense',String(defense));if(guard)baseMap.set('combat:guardAction',String(guard));
    for(const [key,value] of antiqueGarmentBaseResourceModifiers(category,rank).entries())baseMap.set(key,value);
    const finalMap=antiqueApplyIntrinsicRoll(baseMap,intrinsic.map,kind);
    profile.modifiers=antiqueModifierText(finalMap);
    profile.defense=String(finalMap.get('combat:defense')||0);profile.guard=String(finalMap.get('combat:guardAction')||'');
  }
  return profile;
}
function antiqueGearMaterialCompatible(mat={},equipment={}){
  const targets=String(mat.equipmentUpgradeTarget||'').split(/[・、,，／/|]+/).map(v=>v.trim()).filter(Boolean);
  const type=String(equipment.itemType||'').trim(),category=String(equipment.itemCategory||'').trim();
  if(type==='武器')return targets.includes('武器')||targets.includes(category);
  if(type==='防具')return targets.includes('防具');
  if(type==='盾')return targets.includes('盾')||targets.includes('防具');
  return false;
}
function antiqueGearUpgradePool(equipment={},selectedSet=antiqueSelectedAreaSet()){
  const minRank=Number(equipment.rank||1);
  return (state.items||[]).filter(mat=>{
    if(String(mat.dataKind||'').trim()!=='素材'||String(mat.materialType||'').trim()!=='魔物素材')return false;
    if(!String(mat.equipmentUpgradeEffect||'').trim())return false;
    if(antiqueRowIsBossOrigin(mat))return false;
    if(!antiqueRowWithinSelectedAreas(mat,selectedSet))return false;
    if(numericRankValueIncludingLegacyMaterialGrade(mat.rank,1)<minRank)return false;
    if(String(equipment.itemCategory||'').trim()==='魔導書'&&/回復量/.test(String(mat.equipmentUpgradeEffect||'')))return false;
    const category=String(equipment.itemCategory||'').trim(),element=String(equipment.element||'').trim(),detail=String(mat.equipmentUpgradeDetail||'');
    if(!['杖','魔導書','祈祷書'].includes(category)&&!ANTIQUE_FIXED_AMMO_ELEMENT.has(category)){
      const requiredAttrs=[...new Set([...detail.matchAll(/([物火水風雷光闇無])属性/g)].map(m=>m[1]))];
      if(requiredAttrs.length&&!requiredAttrs.includes(element))return false;
    }
    return antiqueGearMaterialCompatible(mat,equipment);
  });
}
function antiqueWeightedPick(rows=[],weightFn=()=>1){
  if(!rows.length)return null;const weighted=rows.map(row=>({row,w:Math.max(.01,Number(weightFn(row))||1)}));let roll=Math.random()*weighted.reduce((s,x)=>s+x.w,0);for(const x of weighted){roll-=x.w;if(roll<=0)return x.row;}return weighted[weighted.length-1].row;
}
function antiqueDesiredUpgradeCount(profile={}){
  const r=Math.random()*100;return r<25?0:r<75?1:r<95?2:3;
}
function antiqueGearEnhancements(equipment={},selectedSet=antiqueSelectedAreaSet(),profile={}){
  const desired=antiqueDesiredUpgradeCount(profile),limit=Math.max(0,Number(equipment.upgradeLimit||0)),maxUsed=limit;if(!desired||!maxUsed)return [];
  const normalPool=antiqueGearUpgradePool(equipment,selectedSet),exclusivePool=antiqueGearExclusivePool(equipment),picked=[],effects=new Set();let used=0;
  while(picked.length<desired){
    const legal=pool=>pool.filter(mat=>{const cost=upgradeSlotCostForMaterial(mat),effect=String(mat.equipmentUpgradeEffect||'').trim();return cost>0&&used+cost<=maxUsed&&!effects.has(effect);});
    const normal=legal(normalPool),exclusive=legal(exclusivePool);if(!normal.length&&!exclusive.length)break;let mat=null;
    if(exclusive.length&&(!normal.length||Math.random()*100<ANTIQUE_EXCLUSIVE_UPGRADE_RATE))mat=antiqueWeightedPick(exclusive,m=>1/Math.max(1,upgradeSlotCostForMaterial(m)));else mat=antiqueWeightedPick(normal,m=>1/Math.max(1,upgradeSlotCostForMaterial(m)));
    if(!mat)break;picked.push(mat);effects.add(String(mat.equipmentUpgradeEffect||'').trim());used+=upgradeSlotCostForMaterial(mat);
  }
  return picked;
}
const ANTIQUE_GEAR_NAMES=Object.freeze({
  '短剣':'レリクトダガー','片手剣':'レリクトソード','片手斧':'レリクトアクス','片手槌':'レリクトハンマー','片手槍':'レリクトスピア',
  '杖':'レリクトロッド','鞭':'レリクトウィップ','ガントレット':'レリクトガントレット','両手剣':'レリクトグレートソード',
  '大槌':'レリクトモール','大鎌':'レリクトサイス','長槍':'レリクトランス','弓':'レリクトボウ','クロスボウ':'レリクトクロスボウ',
  'ヘヴィクロスボウ':'レリクトヘヴィクロスボウ','魔導書':'レリクトグリモア','祈祷書':'レリクトリタニー',
  '軽装':'レリクトジャケット','中装':'レリクトメイル','重装':'レリクトプレート','魔導衣':'レリクトローブ','祈祷衣':'レリクトヴェスメント','盾':'レリクトシールド'
});
function antiqueGeneratedName(kind='',category=''){return ANTIQUE_GEAR_NAMES[String(category||'').trim()]||ANTIQUE_GEAR_NAMES[String(kind||'').trim()]||'レリクトギア';}
function antiqueTemporaryInstanceId(){
  const bytes=new Uint8Array(6);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(bytes);else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256);
  return `antq_tmp_${Date.now().toString(36)}_${[...bytes].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
}
function antiqueInstanceId(publicId=''){const token=String(publicId||'').replace(/^RCA-/i,'').replace(/-/g,'').toLowerCase();return token?`antq_${token}`:antiqueTemporaryInstanceId();}
function antiqueGearEnhancementStorageEntry(m={}){
  const effect=String(m.equipmentUpgradeEffect||'').trim();return {content:effect,rank:m.rank||'',slotCost:Math.max(1,upgradeSlotCostForMaterial(m)),specialEffectName:m.antiqueExclusive?effect:'',specialEffectDetail:String(m.equipmentUpgradeDetail||'').trim(),sourceMaterialId:m.antiqueExclusive?'':String(m.id||m.masterId||'').trim(),sourceMaterialPublicId:m.antiqueExclusive?'':String(m.publicId||'').trim(),sourceMaterialName:m.antiqueExclusive?'':String(m.name||'').trim(),sourceMaterialTarget:String(m.equipmentUpgradeTarget||'').trim()};
}
function antiqueGearBuildRow(kind='',category='',rank=1,selectedSet=antiqueSelectedAreaSet(),publicId=''){
  const profile=antiqueGearBaseProfile(kind,category,rank,selectedSet),src=profile.source||{},id=antiqueInstanceId(publicId),itemType=kind==='盾'?'盾':kind;
  const equipment={id,publicId,name:antiqueGeneratedName(kind,category),itemType,itemCategory:category,rank,equipSlot:String(src.equipSlot||((kind==='防具')?'鎧':'右手/左手')),skill:kind==='武器'?String(src.skill||''):String(src.skill||''),power:profile.power,offhandBonus:profile.offhandBonus||'',element:profile.element,modifiers:profile.modifiers,antiqueBonusModifiers:profile.intrinsicModifiers||'',upgradeLimit:String(profile.upgradeLimit),upgradeMaterialMinRank:String(rank),effect:'',description:`骨董屋に持ち込まれた来歴不詳の${category}。固有効果は持たず、個体ごとに基礎性能・本体補正・強化枠・強化内容が異なる。抽選後の強化追加・変更はできない。`,source:'骨董屋（骨董装備ガチャ）',tags:`骨董屋,骨董装備,骨董個体,骨董強化固定,${category},★${rank}`};
  const enhancements=antiqueGearEnhancements(equipment,selectedSet,profile),usedSlots=enhancements.reduce((s,m)=>s+upgradeSlotCostForMaterial(m),0);
  return {equipment,enhancements:enhancements.map(x=>({...x})),usedSlots,quality:profile.quality,slotDelta:profile.slotDelta,intrinsicModifierSlots:profile.intrinsicSlotCount,rollId:id};
}
function antiqueGearSelectedAreaLabels(){const selected=antiqueSelectedAreaSet();return antiqueAreaRows().filter(a=>selected.has(antiqueAreaId(a))).map(antiqueAreaLabel);}
function antiqueGearEnhancementLabel(m={}){return `${equipmentUpgradeDisplayName(m)}${m.antiqueExclusive?'［骨董限定］':''}`;}
function antiqueUtf8ToBase64Url(text=''){const bytes=new TextEncoder().encode(String(text));let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function antiqueGearDbRow(entry={}){
  const eq=entry.equipment||{};
  return {
    id:eq.id||'',publicId:eq.publicId||'',name:eq.name||'',itemType:eq.itemType||'',itemCategory:eq.itemCategory||'',rank:eq.rank||'',
    equipSlot:eq.equipSlot||'',skill:eq.skill||'',power:eq.power||'',offhandBonus:eq.offhandBonus||'',element:eq.element||'',modifiers:eq.modifiers||'',upgradeLimit:eq.upgradeLimit||'',
    upgradeMaterialMinRank:eq.upgradeMaterialMinRank||'',description:eq.description||'',effect:eq.effect||'',source:eq.source||'',tags:eq.tags||'',
    upgradeEntries:JSON.stringify((entry.enhancements||[]).map(antiqueGearEnhancementStorageEntry)),createdAt:new Date().toISOString()
  };
}
function antiqueGenerateRegistrationIds(count=1){
  const ids=[],reserved=new Set(allRegistrationIds());
  (currentAntiqueGearRows||[]).forEach(entry=>{const id=String(entry?.equipment?.publicId||'').trim().toUpperCase();if(id)reserved.add(id);});
  for(let i=0;i<count;i++){
    let id='';
    for(let attempt=0;attempt<80;attempt++){
      const candidate=generateRegistrationId();
      if(reserved.has(candidate))continue;
      id=candidate;break;
    }
    if(!id)throw new Error('骨董装備の登録IDを発行できませんでした。');
    reserved.add(id);ids.push(id);
  }
  return ids;
}
async function antiquePersistGeneratedEntries(entries=[]){
  const rows=(entries||[]).map(antiqueGearDbRow);
  if(!rows.length)throw new Error('骨董個体の登録データがありません。');
  // v90.8.594: 骨董ID発行は通常1件なので、共通の軽量upsert経路へ送る。
  // 小さい個体登録では圧縮・分割・仮シート・commitを一切使わない。
  if(!isGasMode()&&canUseDirectPostUpload()&&rows.length===1&&String(rows[0].publicId||'').trim()){
    const token=uploadToken('antq','antique_instances');
    const res=await directPostForm('upsert',{sheetKey:'antique_instances',token,rows,dataKindScope:'',returnRows:false},DIRECT_CHUNK_POST_TIMEOUT_MS,antiqueRegistrationProbe(rows[0].publicId));
    if(!res||!res.ok)throw new Error((res&&res.error)||'骨董個体DBへの登録に失敗しました。');
    return res;
  }
  const res=await upsertSheetRowsByJsonp('antique_instances',rows,'');
  if(!res||!res.ok)throw new Error((res&&res.error)||'骨董個体DBへの登録に失敗しました。');
  return res;
}
async function antiqueIssueRegistrationId(index=-1){
  const entry=currentAntiqueGearRows?.[index];if(!entry)return;
  const eq=entry.equipment||{};
  if(String(eq.publicId||'').trim()){toast(`登録ID発行済み：${eq.publicId}`);return;}
  const button=document.querySelector(`[data-antique-gear-issue-id="${index}"]`);if(button)button.disabled=true;
  try{
    await assertServerVersion();
    const [publicId]=antiqueGenerateRegistrationIds(1);
    eq.publicId=publicId;eq.id=antiqueInstanceId(publicId);entry.rollId=eq.id;
    await antiquePersistGeneratedEntries([entry]);
    renderAntiqueGearStock(false);
    toast(`登録IDを発行しました：${publicId}`);
  }catch(e){
    eq.publicId='';eq.id=antiqueTemporaryInstanceId();entry.rollId=eq.id;
    renderAntiqueGearStock(false);toast(String(e?.message||e),'error');
  }finally{const next=document.querySelector(`[data-antique-gear-issue-id="${index}"]`);if(next)next.disabled=false;}
}
function antiqueGearStatsText(eq={}){
  if(String(eq.itemType||'')==='武器')return [eq.power?`ダメージ:${eq.power}`:'',eq.offhandBonus?`副手追撃値:${eq.offhandBonus}`:'',eq.element?`属性:${eq.element}`:''].filter(Boolean).join(' / ')||'基礎攻撃値なし';
  const map=antiqueModifierMap(eq.modifiers),parts=[`防御値:${String(map.get('combat:defense')||0).replace(/^\+/,'')}`,`防御行動値:${String(map.get('combat:guardAction')||'0').replace(/^\+/,'')}`];
  const hp=String(map.get('resource:maxHp')||'').trim(),mp=String(map.get('resource:maxMp')||'').trim();
  if(hp)parts.push(`最大HP:${hp.startsWith('-')||hp.startsWith('+')?hp:`+${hp}`}`);if(mp)parts.push(`最大MP:${mp.startsWith('-')||mp.startsWith('+')?mp:`+${mp}`}`);
  return parts.join(' / ');
}
function antiqueGearCopyText(){
  const rank=Math.max(2,Number($('facilityAntiqueGearRank')?.value)||2);
  const lines=['【骨董屋・骨董装備ガチャ】',''];
  if(!(currentAntiqueGearRows||[]).length){lines.push('- 未抽選');return lines.join('\n');}
  currentAntiqueGearRows.forEach((entry,i)=>{
    const eq=entry.equipment||{},enh=entry.enhancements||[];
    lines.push(`${i+1}. ${eq.name||'名称未設定'} / ★${eq.rank||rank}`);
    lines.push(`   ${antiqueGearStatsText(eq)}`);
    const intrinsic=antiqueIntrinsicModifierText(eq);lines.push(`   補正枠：${entry.intrinsicModifierSlots||0}/2`);if(intrinsic)lines.push(`   本体補正：${intrinsic}`);else lines.push('   本体補正：なし');
    lines.push(`   強化枠：${entry.usedSlots||0}/${eq.upgradeLimit||0}`);
    lines.push(`   強化：${enh.length?enh.map(m=>`${antiqueGearEnhancementLabel(m)}（${upgradeSlotCostForMaterial(m)}枠）`).join(' / '):'なし'}`);
    enh.forEach(m=>{if(String(m.equipmentUpgradeDetail||'').trim())lines.push(`   ・${antiqueGearEnhancementLabel(m)}：${String(m.equipmentUpgradeDetail).trim()}`);});
    lines.push(`   登録ID：${eq.publicId||'未発行'}`);
    lines.push('');
  });
  return lines.join('\n').trim();
}
async function drawAntiqueGearStock(){
  const result=$('facilityAntiqueGearResult');if(!result)return;antiqueEnsureGearAreaState();syncAntiqueGearSelectors();const selected=antiqueSelectedAreaSet();if(!selected.size){result.textContent='解放済みエリアを1つ以上選択してください。';return;}
  const kind=antiqueGearSelectedKind(),category=String($('facilityAntiqueGearCategory')?.value||''),rank=Math.max(2,Number($('facilityAntiqueGearRank')?.value)||2),maxRank=antiqueGearMaxRank(kind,selected);if(maxRank<2){result.textContent='骨董装備ガチャは★2から解放されます。';return;}if(rank>maxRank){result.textContent=`現在の解放状況では${kind}の★${rank}骨董装備は抽選できません。`;return;}
  const count=Math.max(1,Math.min(5,Number($('facilityAntiqueGearCount')?.value||1)||1));if(!category){result.textContent='武器種 / 防具種を選択してください。';return;}
  const button=document.querySelector('[data-facility-antique-gear-draw]');if(button)button.disabled=true;
  result.textContent='骨董装備を抽選しています…';
  try{
    const generated=Array.from({length:count},()=>antiqueGearBuildRow(kind,category,rank,selected,''));
    currentAntiqueGearRows=generated;currentAntiqueGearArea='';currentAntiqueGearDate=new Date().toLocaleDateString('ja-JP');renderAntiqueGearStock(false);
    toast(`骨董装備${count}件を抽選しました（未登録）`);
  }catch(e){currentAntiqueGearRows=[];result.textContent=String(e?.message||e);toast(String(e?.message||e),'error');}
  finally{if(button)button.disabled=false;}
}
function renderAntiqueGearStock(){
  const result=$('facilityAntiqueGearResult');if(!result)return;antiqueEnsureGearAreaState();syncAntiqueGearSelectors();const areas=antiqueAreaRows(),selected=antiqueSelectedAreaSet(),labels=areas.filter(a=>selected.has(antiqueAreaId(a))).map(antiqueAreaLabel),kind=antiqueGearSelectedKind(),category=String($('facilityAntiqueGearCategory')?.value||''),rank=Math.max(2,Number($('facilityAntiqueGearRank')?.value)||2),count=Math.max(1,Math.min(5,Number($('facilityAntiqueGearCount')?.value||1)||1)),cost=ANTIQUE_GEAR_COST_BY_RANK[rank]||0;
  const summary=$('facilityAntiqueGearAreaSummary');if(summary)summary.textContent=`${labels.join('、')||'未設定'}（${selected.size}エリア）`;
  if(!(currentAntiqueGearRows||[]).length){result.classList.add('muted');result.innerHTML=`<div><b>骨董装備ガチャ</b></div><div>${escapeHtml(kind)} / ${escapeHtml(category||'未選択')} / ★${rank}。1回につき魔物素材★合計${cost}。基礎性能・属性（対応武器のみ）・本体補正枠数（0～2）・補正種類と±値・強化枠数・固定強化内容を個体ごとに独立抽選します。平均は同★帯相当以下、大当たりでも同★帯より少し上までに抑えます。抽選済みの強化は完成時固定で、空き枠があっても後から追加・変更できません。基礎性能大当たりと強化枠+1は独立抽選のため、極低確率で両方を引く個体もあります。</div>`;return;}
  result.classList.remove('muted');result.innerHTML=`<div><b>骨董装備ガチャ・抽選結果</b></div><div class="muted small">正式に残す個体だけ「ID発行」を押してください。</div>`+currentAntiqueGearRows.map((entry,index)=>{const eq=entry.equipment||{},enh=entry.enhancements||[],issued=!!String(eq.publicId||'').trim(),chips=[`★${eq.rank||rank}`,antiqueGearStatsText(eq),`補正枠:${entry.intrinsicModifierSlots||0}/2`,antiqueIntrinsicModifierText(eq)?`本体補正:${antiqueIntrinsicModifierText(eq)}`:'本体補正:なし',`強化枠:${entry.usedSlots||0}/${eq.upgradeLimit||0}`].filter(Boolean),enhHtml=enh.length?enh.map(m=>`<div><b>${escapeHtml(equipmentUpgradeDisplayName(m))}</b>${m.antiqueExclusive?' <span class="facility-chip">骨董限定</span>':''}（${escapeHtml(String(upgradeSlotCostForMaterial(m)))}枠）${m.equipmentUpgradeDetail?`：${escapeHtml(m.equipmentUpgradeDetail)}`:''}</div>`).join(''):'<div>固定強化：なし</div>',idHtml=issued?`<div class="small"><b>登録ID：${escapeHtml(eq.publicId)}</b> <span class="facility-chip">発行済</span></div>`:`<div class="small muted">登録ID：未発行（DB未登録）</div><div style="margin-top:8px"><button type="button" class="secondary" data-antique-gear-issue-id="${index}">ID発行</button></div>`;return `<div class="facility-product"><div class="facility-product-body"><div><b>${escapeHtml(eq.name||'名称未設定')}</b></div><div class="facility-product-meta">${chips.map(c=>`<span class="facility-chip">${escapeHtml(c)}</span>`).join('')}</div>${enhHtml}${idHtml}</div></div>`;}).join('');
}
function antiqueRandomStockText(){
  const lines=['【骨董屋・未鑑定スクロール販売】',`選出範囲：${currentAntiqueRandomArea||'未設定'}`,''];
  if(!(currentAntiqueRandomRows||[]).length){
    lines.push('- ランダム販売は未選出');
    return lines.join('\n');
  }
  currentAntiqueRandomRows.forEach(row=>{
    const name=row.name||`未鑑定の${unidentifiedScrollType(row)||'術式'}スクロール：${playerRankLabel(row.rank)||'ランク未設定'}`;
    lines.push(`- ${name} ${(row.buyPrice)?(row.buyPrice)+'G':'価格未設定'}`);
  });
  return lines.join('\n');
}

function renderFacilityProductDetails(row){
  if(facilityProductType(row)==='recipe'){
    const chips=['レシピ',row.rank?playerRankLabel(row.rank):'',row.craftType||'',row.craftSkill?`技能:${row.craftSkill}`:''].filter(Boolean);
    return `<details class="facility-product"><summary><span class="facility-product-title"><span>${escapeHtml(facilityProductDisplayName(row))}</span>${chips.slice(0,2).map(c=>`<span class="facility-chip">${escapeHtml(c)}</span>`).join('')}</span><span class="facility-product-price">${escapeHtml(productPriceText(row))}</span></summary><div class="facility-product-body"><div class="facility-product-meta">${chips.map(c=>`<span class="facility-chip">${escapeHtml(c)}</span>`).join('')}</div><div><b>完成品：</b>${escapeHtml(row.resultItem||row.name||'未設定')}</div><div><b>必要素材：</b>${escapeHtml(row.requiredMaterials||'未設定')}</div>${adminCraftingRouteHtml(row)}<div><b>入手先：</b>${escapeHtml(row.recipeSource||'未設定')}</div></div></details>`;
  }
  const chips=[productKindText(row), row.rank ? playerRankLabel(row.rank) : '', row.equipSlot ? `枠:${row.equipSlot}` : '', row.bagCapacity ? `バッグ容量:${row.bagCapacity}` : '', row.maxStack ? `1枠数:${row.maxStack}` : ''].filter(Boolean);
  const desc=String(row.description||'').trim();
  const effect=String(row.effect||'').trim();
  const source=String(row.source||'').trim();
  const unlock=String(row.unlockFacility||'').trim();
  return `<details class="facility-product">\n    <summary><span class="facility-product-title"><span>${escapeHtml(row.name)}</span>${chips.slice(0,2).map(c=>`<span class="facility-chip">${escapeHtml(c)}</span>`).join('')}</span><span class="facility-product-price">${escapeHtml(productPriceText(row))}</span></summary>\n    <div class="facility-product-body">\n      <div class="facility-product-meta">${chips.map(c=>`<span class="facility-chip">${escapeHtml(c)}</span>`).join('')}</div>\n      ${desc ? `<div><b>説明：</b>${escapeHtml(desc)}</div>` : ''}\n      ${effect ? `<div><b>効果：</b>${escapeHtml(effect)}</div>` : ''}\n      ${source ? `<div><b>入手先：</b>${escapeHtml(source)}</div>` : ''}\n      ${unlock ? `<div><b>解放施設：</b>${escapeHtml(unlock)}</div>` : ''}\n    </div>\n  </details>`;
}
function renderFacilitiesPanel(){
  const summary=$('facilitySummary');
  const cards=$('facilityCards');
  if(!summary || !cards) return;
  const defs=facilityActiveDefs();
  const rankSelect=$('facilityRankLimitSelect');
  if(rankSelect && rankSelect.value!==String(currentFacilityRankLimit||'')) rankSelect.value=String(currentFacilityRankLimit||'');
  summary.innerHTML=FACILITY_DEFS.map(f=>{
    const count=facilityDisplayCount(f.name);
    const label=facilityDisplayLabel(f.name);
    const range=f.name==='ギルド'?'常設':facilityRankLimitLabel();
    return `<div class="facility-summary-card ${f.name===currentFacilityView?'active':''}"><b>${count}</b><span>${escapeHtml(f.name)}の${escapeHtml(label)} / ${escapeHtml(range)}</span></div>`;
  }).join('');
  cards.innerHTML=defs.map(f=>{
    const active=activeFacilitySection(f.name);
    const tabs=facilitySectionDefs(f.name);
    const tabHtml=`<div class="facility-inner-tabs">${tabs.map(([id,label])=>`<button type="button" class="facility-inner-tab ${id===active?'active':''}" data-facility-section="${escapeHtml(id)}">${escapeHtml(label)}</button>`).join('')}</div>`;
    let body='';
    if(active==='sales'){
      const rows=facilityProducts(f.name);
      body=rows.length?`<div class="facility-product-list">${rows.map(renderFacilityProductDetails).join('')}</div>`:'<p class="notice">この条件に一致する常設販売商品はありません。</p>';
    }else if(active==='recommendations') body=`<div class="facility-actions"><button class="ghost" type="button" data-meal-recommend-copy>おすすめ3品をコピー</button></div>${renderFacilityMealRecommendations()}`;
    else if(active==='meals') body=renderFacilityMealRows();
    else if(active==='branches') body=renderFacilityRecipeGroup('武器派生');
    else if(active==='armor') body=renderFacilityRecipeGroup('防具製作');
    else if(active==='smith') body=renderFacilityRecipeGroup('鍛冶');
    else if(active==='traps') body=renderFacilityRecipeGroup('細工');
    else if(active==='accessory') body=renderFacilityAccessoryUpgradeCards();
    else if(active==='materials') body=renderFacilityProcessingGroup();
    else if(active==='crystal') body=renderFacilityCrystalUpgradeCards();
    else if(active==='skill_gacha') body='<p class="notice">下のスキルガチャ欄で進行段階・ランク・抽選回数を選び、抽選結果を確認します。</p>';
    else if(active==='daily'&&f.name==='レシピ販売') body=renderCopyistDailyPool();
    else if(active==='support') body=guildSupportPanelHtml();
    else if(active==='services') body=`<ul class="facility-service-list">${(f.services||[]).map(s=>`<li><b>${escapeHtml(s.name)}</b> <span class="facility-chip">${escapeHtml(s.price||'価格未設定')}</span><br>${escapeHtml(s.description||'')}</li>`).join('')}</ul>`;
    else body='<p class="notice">下の施設作業欄で内容を確認してください。</p>';
    return `<section class="facility-card">
      <div class="facility-card-head"><div><h3>${escapeHtml(f.name)}</h3><p class="facility-role">${escapeHtml(f.role)}</p></div></div>
      ${tabHtml}<div class="facility-tab-panel">${body}</div>
    </section>`;
  }).join('');
  renderFacilityWorkPanel();
  // 初期選択値が画面上ですでに選択済みでも、連動候補は初回描画で必ず生成する。
  requestAnimationFrame(()=>{
    if(facilityWorkKind()==='smithy'){
      renderFacilityUpgradeEquipmentSelect();
      renderFacilityUpgradeLookupList();
      renderFacilityGuaranteeSelect();
      renderFacilityUpgradeResult($('facilityUpgradeMaterialInput')?.value||'');
      renderFacilityRemovalCalculator();
    }
    if(facilityWorkKind()==='antique-antique_gear') syncAntiqueGearSelectors();
  });
}

const ADMIN_ITEM_TYPE_PREFERRED_ORDER = ['武器','防具','盾','装飾品','調合品','道具','特殊矢弾','収納具','重要アイテム','スクロール','換金品','その他'];
const ADMIN_MATERIAL_TYPE_PREFERRED_ORDER = ['食材','魔物素材','採取素材','加工素材','特殊素材'];
