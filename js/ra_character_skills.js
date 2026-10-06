function normalizeSkillGachaState(raw={}){
  if(window.RASkillGachaCore?.normalizeState)return window.RASkillGachaCore.normalizeState(raw||{});
  const slots=Math.max(2,Math.min(6,Number(raw.crystalSlots)||2));
  const acquired=[...new Set((Array.isArray(raw.acquiredSkillIds)?raw.acquiredSkillIds:[]).map(String).filter(Boolean))];
  const equipped=(Array.isArray(raw.equippedSkillIds)?raw.equippedSkillIds:[]).slice(0,slots).map(v=>String(v||''));
  while(equipped.length<slots)equipped.push('');
  const fragments={};for(let r=1;r<=5;r++)fragments[String(r)]=Math.max(0,Number(raw.resonanceFragments?.[String(r)])||0);
  return {version:1,crystalSlots:slots,acquiredSkillIds:acquired,equippedSkillIds:equipped,resonanceFragments:fragments,drawHistory:Array.isArray(raw.drawHistory)?raw.drawHistory.slice(-200):[]};
}
function defaultSkillGachaState(){return normalizeSkillGachaState({crystalSlots:2,acquiredSkillIds:[],equippedSkillIds:['',''],resonanceFragments:{}});}
function getSkillGachaState(){skillGachaState=normalizeSkillGachaState(skillGachaState||{});return JSON.parse(JSON.stringify(skillGachaState));}
function setSkillGachaState(raw={}){skillGachaState=normalizeSkillGachaState(raw||{});renderSkillCrystalPanel();}
function skillMasterRows(){return (Array.isArray(DB_SKILL_MASTER)?DB_SKILL_MASTER:[]).filter(r=>r&&String(r.enabled??'TRUE').trim().toUpperCase()!=='FALSE');}
function characterSkillById(id=''){return skillMasterRows().find(s=>String(s.id||'')===String(id||''))||null;}
function characterSkillByPublicId(value=''){const key=String(value||'').trim().toUpperCase();return skillMasterRows().find(s=>String(s.publicId||'').trim().toUpperCase()===key)||null;}
function resonanceFragmentMasterRow(rank=1){
  const r=Math.max(1,Math.floor(Number(rank)||1));
  const id=`mat_resonance_fragment_rank${r}`,name=`★${r}共鳴片`;
  const rows=[...(Array.isArray(DB_INITIAL_ITEM_MASTER)?DB_INITIAL_ITEM_MASTER:[]),...(Array.isArray(CS_ITEM_MASTER)?CS_ITEM_MASTER:[])];
  return rows.find(row=>String(row?.id||'').trim()===id||String(row?.name||'').trim()===name)||null;
}
function addResonanceFragmentsToInventory(rank=1,count=1){
  const r=Math.max(1,Math.floor(Number(rank)||1)),amount=Math.max(0,Math.floor(Number(count)||0));
  if(!amount)return 0;
  const master=resonanceFragmentMasterRow(r);
  const preset=master?dbItemToInventoryItem(master):normalizeInventoryItem({
    id:`mat_resonance_fragment_rank${r}`,masterId:`mat_resonance_fragment_rank${r}`,masterSheet:'items',name:`★${r}共鳴片`,kind:'素材',materialType:'特殊素材',materialCategory:'共鳴素材',category:'共鳴素材',count:1,rank:r,price:0,source:`★${r}スキルガチャ（習得済みスキル重複時）`,tags:`素材,特殊素材,共鳴素材,スキル,スキルガチャ,重複,★${r}`,description:`習得済みの★${r}スキルが重複した際に残る共鳴の結晶片。`,effect:`習得済みの★${r}スキルが重複したとき、重複した1件につき1個獲得する。`,location:'倉庫'
  });
  const masterId=String(preset.masterId||preset.id||'').trim(),name=String(preset.name||'').trim();
  let index=masterId?inventoryIndexByLookup(masterId,''):-1;
  if(index<0&&name)index=inventoryIndexByLookup('',name);
  const previous=index>=0?inventoryItemsState[index]:null;
  if(index>=0){
    const current=inventoryItemsState[index];
    inventoryItemsState[index]=normalizeInventoryItem({...current,...preset,id:current.id||preset.id,masterId:preset.masterId||preset.id||current.masterId,count:clampInt(Number(current.count||0)+amount,0,9999),location:'倉庫'});
  }else{
    inventoryItemsState.push(normalizeInventoryItem({...preset,count:amount,location:'倉庫'}));
    index=inventoryItemsState.length-1;
  }
  invalidateInventoryDerivedCache();
  if(!refreshInventoryCardAt(index,{appendIfMissing:true})&&inventoryDisplayMode==='warehouse')renderInventory({refreshLinked:false});
  inventoryLinkedRefreshForItems(previous,inventoryItemsState[index]);
  return amount;
}
function addSkillDuplicateFragments(state,rank=1,count=1){
  const r=String(Math.max(1,Math.floor(Number(rank)||1))),amount=Math.max(0,Math.floor(Number(count)||0));
  if(!amount)return 0;
  state.resonanceFragments=state.resonanceFragments||{};
  state.resonanceFragments[r]=Math.max(0,Number(state.resonanceFragments[r])||0)+amount;
  return addResonanceFragmentsToInventory(Number(r),amount);
}
function resonanceFragmentAwardText(awards={}){
  return Object.entries(awards).filter(([,count])=>Number(count)>0).sort((a,b)=>Number(a[0])-Number(b[0])).map(([rank,count])=>`★${rank}共鳴片×${count}`).join('、');
}
function crystalUpgradeStageRows(){return (DB_RECIPE_MASTER||[]).filter(r=>String(r.craftType||'').trim()==='クリスタル強化').slice().sort((a,b)=>(Number(String(a.resultItem||'').match(/\d+/)?.[0])||0)-(Number(String(b.resultItem||'').match(/\d+/)?.[0])||0));}
function crystalSlotNumber(value,fallback=2){
  const match=String(value||'').match(/(\d+)/);
  const parsed=match?Number(match[1]):Number(fallback);
  return Math.max(2,Math.min(6,Number.isFinite(parsed)?parsed:2));
}
function skillCrystalStageOptions(state){
  const rows=crystalUpgradeStageRows();
  const options=[{slots:2,label:'未強化（2枠）',row:null}];
  rows.forEach((row,index)=>{
    const from=crystalSlotNumber(row.baseItem,2),to=crystalSlotNumber(row.resultItem,from+1);
    const label=`${String(row.name||`スキルクリスタル強化${index+1}`).trim()}（${to}枠）`;
    if(!options.some(option=>option.slots===to))options.push({slots:to,label,row});
  });
  const current=crystalSlotNumber(state?.crystalSlots,2);
  if(!options.some(option=>option.slots===current))options.push({slots:current,label:`設定済み（${current}枠）`,row:null});
  return options.sort((a,b)=>a.slots-b.slots);
}
function renderSkillCrystalStageSelector(state){
  const select=$('skillCrystalStageSelect'),current=$('skillCrystalCurrent'),note=$('skillCrystalStageNote');
  if(!select)return;
  const options=skillCrystalStageOptions(state),slots=crystalSlotNumber(state.crystalSlots,2);
  select.innerHTML=options.map(option=>`<option value="${option.slots}">${esc(option.label)}</option>`).join('');
  select.value=String(slots);
  if(current)current.textContent=`現在の装着枠：${slots}枠`;
  const selected=options.find(option=>option.slots===slots),row=selected?.row;
  if(note){
    note.textContent=row
      ? `${row.unlockCondition||row.unlockAreaKey||'解放条件未設定'}／${String(row.price||0)}G／必要素材：${row.requiredMaterials||'未設定'}`
      : slots===2?'未強化の状態です。':'現在保存されている枠数です。';
  }
}
function renderSkillCrystalStages(state){
  const area=$('skillCrystalStages');if(!area)return;const rows=crystalUpgradeStageRows();
  area.innerHTML=rows.length?rows.map(row=>{const from=crystalSlotNumber(row.baseItem,2),to=crystalSlotNumber(row.resultItem,from+1);const cls=state.crystalSlots===to?'current':state.crystalSlots>to?'done':state.crystalSlots===from?'next':'';return `<div class="skill-stage-card ${cls}"><h4>${esc(row.name||`クリスタル強化 ${to}枠`)}</h4><div class="skill-meta"><span class="skill-badge">${from}枠 → ${to}枠</span><span class="skill-badge">${esc(String(row.price||0))}G</span><span class="skill-badge">${esc(row.unlockCondition||row.unlockAreaKey||'初期')}</span></div><div class="skill-detail-lines"><div><b>必要素材：</b>${esc(row.requiredMaterials||'未設定')}</div>${row.effect?`<div><b>効果：</b>${esc(row.effect)}</div>`:''}</div></div>`;}).join(''):'<div class="skill-stage-card">クリスタル強化データがありません。</div>';
}
function renderSkillSlots(state){
  const box=$('skillCrystalSlots');if(!box)return;const owned=state.acquiredSkillIds.map(characterSkillById).filter(Boolean).sort((a,b)=>String(a.category||'').localeCompare(String(b.category||''),'ja')||String(a.weaponType||'').localeCompare(String(b.weaponType||''),'ja')||String(a.name||'').localeCompare(String(b.name||''),'ja'));
  const options='<option value="">未設定</option>'+owned.map(s=>`<option value="${esc(s.id)}">★${esc(s.rank||1)} ${esc(s.name)}（${esc(s.weaponType||s.category||'')}）</option>`).join('');
  box.innerHTML=Array.from({length:state.crystalSlots},(_,i)=>`<div class="skill-slot-row"><b>枠${i+1}</b><select data-skill-crystal-slot="${i}" data-skill-crystal-input="1">${options}</select></div>`).join('');
  box.querySelectorAll('[data-skill-crystal-slot]').forEach((el,i)=>el.value=state.equippedSkillIds[i]||'');
}
function renderEquippedSkillView(state){
  const area=$('equippedSkillView');if(!area)return;
  const rows=state.equippedSkillIds.map((id,index)=>({index,skill:characterSkillById(id)})).filter(row=>row.skill);
  area.innerHTML=rows.length?rows.map(({index,skill:s})=>`<article class="skill-warehouse-card"><h4>枠${index+1}：${esc(s.name)} <span class="skill-badge">★${esc(s.rank||1)}</span></h4><div class="skill-meta"><span class="skill-badge">${esc(s.category||'')}</span>${s.weaponType?`<span class="skill-badge">${esc(s.weaponType)}</span>`:''}</div><div class="skill-public-id">登録ID：${esc(s.publicId||'未設定')}</div><div class="skill-detail-lines">${s.timing?`<div><b>タイミング：</b>${esc(s.timing)}</div>`:''}${s.cost?`<div><b>消費：</b>${esc(s.cost)}</div>`:''}${s.ct?`<div><b>CT：</b>${esc(s.ct)}</div>`:''}${s.effect?`<div><b>効果：</b>${esc(s.effect)}</div>`:(s.description?`<div><b>概要：</b>${esc(s.description)}</div>`:'')}</div></article>`).join(''):'<div class="status-box">設定中のスキルはありません。</div>';
}
function renderSkillCrystalPanel(){
  const state=normalizeSkillGachaState(skillGachaState||{});skillGachaState=state;
  renderSkillCrystalStageSelector(state);
  renderSkillCrystalStages(state);
  renderSkillSlots(state);
  renderEquippedSkillView(state);
  // スキル変更だけで巨大な倉庫一覧を再描画しない。
  if(inventoryDisplayMode==='learned'&&learnedContentType==='skill')renderInventory({refreshLinked:false});
  else if(inventoryDisplayMode==='learned')renderLearnedKindTabs();
}
function removeSkillFromWarehouse(id=''){
  const state=normalizeSkillGachaState(skillGachaState||{});if(state.equippedSkillIds.includes(id))return;state.acquiredSkillIds=state.acquiredSkillIds.filter(v=>v!==id);skillGachaState=state;renderSkillCrystalPanel();updateAll();if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('skillGacha');
}
