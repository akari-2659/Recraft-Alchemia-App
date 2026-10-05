function assertCharacterSaveApiCompatibility(result){
  if(!result||typeof result!=='object')return;
  const min=Number(result.saveApiMinSupported||0)||0,max=Number(result.saveApiMaxSupported||result.saveApiVersion||0)||0;
  if((min&&CHARACTER_SAVE_API_VERSION<min)||(max&&CHARACTER_SAVE_API_VERSION>max)){
    throw new Error(`保存API互換性エラー：このキャラシの保存形式(v${CHARACTER_SAVE_API_VERSION})は現在のGAS（対応 v${min||'?'}～${max||'?'}）と互換性がありません。アプリを更新してください。`);
  }
}

function setManualSaveBusy(busy){
  const btn=$('saveBtn');
  if(!btn)return;
  if(busy){
    if(!btn.dataset.idleLabel)btn.dataset.idleLabel=btn.textContent||'保存';
    btn.disabled=true;btn.classList.add('is-saving');btn.setAttribute('aria-busy','true');btn.textContent='保存中…';
  }else{
    btn.classList.remove('is-saving');btn.removeAttribute('aria-busy');btn.textContent=btn.dataset.idleLabel||'保存';btn.disabled=currentMode==='view';
  }
}
function setAutoSaveStatus(message='', state=''){
  const el=$('autoSaveStatus');
  if(!el)return;
  el.className='autosave-status' + (state ? ` is-${state}` : '');
  el.textContent=message;
}
function autoSaveTimeLabel(){
  return new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function characterSaveProgressText(percent=0,{automatic=false,usePatch=false}={}){
  const p=Math.max(0,Math.min(100,Math.floor(Number(percent)||0)));
  if(p<=10)return automatic?'自動保存データを準備中（10%）':'保存データを準備中（10%）';
  if(p<=30){
    if(automatic)return usePatch?'変更部分だけクラウドへ自動保存中（30%）':'クラウドへ自動保存中（30%）';
    return usePatch?'変更部分だけクラウドへ保存中（30%）':'クラウドへ保存中（30%）';
  }
  if(p<=90)return automatic?'クラウド保存完了・反映中（90%）':'クラウド保存完了・反映中（90%）';
  return automatic?'自動保存処理完了（100%）':'保存処理完了（100%）';
}
function setCharacterSaveProgress(percent=0,{automatic=false,usePatch=false}={}){
  const text=characterSaveProgressText(percent,{automatic,usePatch});
  if(automatic){
    setAutoSaveStatus(text,'saving');
    return;
  }
  const el=$('editorStatus');
  if(!el)return;
  el.className='status-box';
  el.textContent=text;
}
async function yieldCharacterSaveProgressFrame(){
  await new Promise(resolve=>{
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>requestAnimationFrame(resolve));
    else setTimeout(resolve,0);
  });
}
function autoSaveContentHash(data){
  // v90.8.457: 自動保存の変更判定は1回のJSON走査だけで行う。
  // 旧実装は deep clone → strip → deep clone → stringify と巨大な倉庫を複数回走査していた。
  const omit = new Set(['updatedAt','effectiveAbilities','combatStats','playerKey','newPlayerKey']);
  return JSON.stringify(data||{}, (key,value)=>omit.has(key)?undefined:value);
}
function currentAutoSaveHash(){
  if(!currentCharacter)return '';
  return autoSaveContentHash(collectData(false));
}
function clearAutoSaveTimer(){
  if(autoSaveTimer){
    clearTimeout(autoSaveTimer);
    autoSaveTimer=null;
  }
}
function syncAutoSaveToggle(){
  const toggle=$('autoSaveToggle');
  if(toggle){
    toggle.checked=!!autoSaveEnabled;
    toggle.disabled=currentMode==='view';
  }
}
function initializeAutoSaveForEditor(mode=currentMode){
  clearAutoSaveTimer();
  autoSavePending=false;
  autoSaveDirty=false;
  autoSaveDirtySections.clear();
  autoSaveEnabled=currentCharacter?.autoSaveEnabled!==false;
  autoSaveReady=mode!=='view';
  syncAutoSaveToggle();
  let hash='';
  try{hash=currentAutoSaveHash();}catch(_){}
  autoSaveLastSavedHash=hash;
  if(mode==='view'){
    setAutoSaveStatus('閲覧モードでは自動保存しません。','warn');
  }else if(autoSaveEnabled){
    setAutoSaveStatus('自動保存：ON（このキャラクターの設定）','ok');
  }else{
    setAutoSaveStatus('自動保存：OFF（このキャラクターの設定）','warn');
  }
}
async function waitForAutoSaveIdle(){
  while(autoSaveBusy){
    await new Promise(resolve=>setTimeout(resolve,80));
  }
}
async function setAutoSaveEnabled(enabled){
  const previous=autoSaveEnabled;
  autoSaveEnabled=!!enabled;
  if(currentCharacter)currentCharacter.autoSaveEnabled=autoSaveEnabled;
  syncAutoSaveToggle();
  clearAutoSaveTimer();
  autoSavePending=false;

  if(currentMode==='view'){
    setAutoSaveStatus('閲覧モードでは設定を変更できません。','warn');
    return;
  }

  // 新規キャラはまだDrive/index行がないので、最初の通常保存へ同梱する。
  if(!currentCharacter?.name || cloudCharacterRowHint<2){
    setAutoSaveStatus(
      autoSaveEnabled
        ? '自動保存：ON（キャラクター初回保存時に設定も保存）'
        : '自動保存：OFF（キャラクター初回保存時に設定も保存）',
      autoSaveEnabled?'ok':'warn'
    );
    return;
  }

  setAutoSaveStatus('自動保存設定をキャラクターへ保存中…','saving');
  try{
    await waitForAutoSaveIdle();
    const patch={autoSaveEnabled:autoSaveEnabled!==false,updatedAt:nowIso()};
    await savePatchItem(currentCharacter.id,patch);
    currentCharacter={...(currentCharacter||{}),...patch};
    autoSaveLastSavedHash=currentAutoSaveHash();
    setAutoSaveStatus(
      autoSaveEnabled
        ? '自動保存：ON（このキャラクターに保存済み）'
        : '自動保存：OFF（このキャラクターに保存済み）',
      autoSaveEnabled?'ok':'warn'
    );
    if(autoSaveEnabled&&autoSaveDirtySections.size)autoSaveDraftSoon([...autoSaveDirtySections]);
  }catch(e){
    autoSaveEnabled=previous;
    if(currentCharacter)currentCharacter.autoSaveEnabled=previous;
    syncAutoSaveToggle();
    setAutoSaveStatus(`自動保存設定の保存に失敗しました：${e.message||e}`,'error');
  }
}

function autoSaveDraftSoon(section='all'){
  if(!autoSaveReady || currentMode==='view' || !currentCharacter)return;
  const sections=(Array.isArray(section)?section:[section]).filter(Boolean).map(value=>String(value));
  sections.forEach(value=>autoSaveDirtySections.add(value));
  if(autoSaveDirtySections.has('all')) autoSaveDirtySections=new Set(['all']);
  // 自動保存OFFでも変更区分は記録する。手動保存中に追加編集された場合も、
  // 保存完了前の追送対象として取りこぼさないために使う。
  if(autoSaveDirtySections.size===0)return;
  autoSaveDirty=true;
  clearAutoSaveTimer();
  if(!autoSaveEnabled){
    if(!autoSaveBusy)setAutoSaveStatus('未保存の変更があります。','warn');
    return;
  }
  if(!autoSaveBusy)setAutoSaveStatus('変更を検出しました。差分自動保存を待機中…','warn');
  autoSaveTimer=setTimeout(()=>{
    autoSaveTimer=null;
    saveCharacterNow({automatic:true,force:false});
  },AUTO_SAVE_DELAY_MS);
}
function autoSaveSectionForTarget(target){
  if(!target)return '';
  const id=String(target.id||'');
  if(['charName','charGender','charAge'].includes(id))return 'identity';
  if(id==='charMemo')return 'memo';
  if(id.startsWith('stat_'))return ['stats','abilities','resources'];
  if(id.startsWith('ability_')||target.dataset?.abilityInput!==undefined)return ['abilities','resources'];
  if(id.startsWith('skill_')||target.dataset?.skillInput!==undefined)return 'skills';
  if(id.startsWith('manualBonus_'))return 'manualCategoryBonuses';
  if(['currentHp','currentMp','hpBonus','mpBonus','fatigueLevel'].includes(id))return 'resources';
  if(id.startsWith('equip_')||target.dataset?.equipmentInput!==undefined||id==='equipmentMemo'||id==='bagSelect')return ['equipment','inventory'];
  if(target.dataset?.inventoryInput!==undefined||target.dataset?.inventoryCountIndex!==undefined||id.startsWith('inventory')||id==='quiverSelect'||target.dataset?.quiverAmmoSlot!==undefined||target.dataset?.quiverAmmoCount!==undefined)return ['inventory','equipment'];
  if(target.dataset?.skillCrystalSlot!==undefined||id.startsWith('skillCrystal'))return 'skillGacha';
  if(id.startsWith('loadout')||target.dataset?.loadoutPreset!==undefined)return 'loadoutPresets';
  if(id==='autoSaveToggle')return 'settings';
  return '';
}
function buildAutoSavePatch(sectionsSet=autoSaveDirtySections){
  const sections=new Set(sectionsSet||[]);
  if(sections.has('all')){
    const full=stripRuntimeOnlyData(collectData(true));
    delete full.id; delete full.createdAt;
    return full;
  }
  const patch={updatedAt:nowIso()};
  let equipmentCache=null,baseAbilitiesCache=null,effectiveAbilitiesCache=null;
  const equipment=()=>equipmentCache||(equipmentCache=getEquipmentState());
  const baseAbilities=()=>baseAbilitiesCache||(baseAbilitiesCache=getAbilityValues());
  const effectiveAbilities=()=>effectiveAbilitiesCache||(effectiveAbilitiesCache=computeEffectiveAbilities(baseAbilities(),equipment()));
  if(sections.has('identity')){patch.name=$('charName').value.trim();patch.gender=$('charGender').value.trim();patch.age=$('charAge').value.trim();}
  if(sections.has('stats'))patch.stats=getStats();
  if(sections.has('abilities'))patch.abilities=baseAbilities();
  if(sections.has('skills'))patch.skills=getSkillAlloc();
  if(sections.has('manualCategoryBonuses'))patch.manualCategoryBonuses=getManualCategoryBonuses();
  if(sections.has('resources'))patch.resources=computeResources(effectiveAbilities(),getResourceState(),equipment());
  if(sections.has('equipment')||sections.has('inventory')){
    syncAllEquipmentUpgradesToInventory();syncAllEquipmentSpellSetsToInventory();equipmentCache=getEquipmentState();
    // 装備個体の強化・術式セットは倉庫個体にも保存されるため、この2区分は必ず同時にpatchする。
    patch.equipment=equipmentCache;patch.inventory=getInventoryState();
  }
  if(sections.has('loadoutPresets'))patch.loadoutPresets=normalizeLoadoutPresets(loadoutPresetsState);
  if(sections.has('skillGacha'))patch.skillGacha=getSkillGachaState();
  if(sections.has('craftLists'))patch.craftLists=getCraftListsState();
  if(sections.has('settings'))patch.autoSaveEnabled=autoSaveEnabled!==false;
  if(sections.has('memo'))patch.memo=$('charMemo').value;
  return patch;
}

function setCharacterSpecialSaveStatus(message,{automatic=false}={}){
  if(automatic){setAutoSaveStatus(String(message||''),'saving');return;}
  const el=$('editorStatus');if(!el)return;el.className='status-box';el.textContent=String(message||'');
}
async function characterCreateHistoryBeforeSave({automatic=false,force=false}={}){
  if(currentMode==='new'||!currentCharacter?.id||cloudCharacterRowHint<2)return;
  const due=!automatic||force||!characterLastHistoryAt||(Date.now()-characterLastHistoryAt>=10*60*1000);
  if(!due)return;
  setCharacterSpecialSaveStatus('復元ポイントを作成しています…',{automatic});
  try{
    const auth=getCloudAuth();
    const result=await cloudRequest('historyCreate',{id:currentCharacter.id,playerKey:auth.playerKey,rowHint:cloudCharacterRowHint,kind:automatic?'auto':'manual'});
    characterLastHistoryAt=Date.now();
    if(Number(result?.trimmed||0)>0){
      setCharacterSpecialSaveStatus('古い復元履歴を整理しています…',{automatic});
      await yieldCharacterSaveProgressFrame();
    }
  }catch(error){
    setCharacterSpecialSaveStatus('復元ポイントの作成に失敗しました。保存処理は続行します…',{automatic});
    await yieldCharacterSaveProgressFrame();
  }
}

async function drainQueuedCharacterChanges({automatic=false}={}){
  let passes=0;
  while(true){
    // 保存通信中の連続入力を少しまとめる。Dirty通知だけでなく画面全体ハッシュも比較し、
    // 何らかの編集通知漏れがあっても「保存済み」と誤認しない。
    await new Promise(resolve=>setTimeout(resolve,180));
    let sections=new Set(autoSaveDirtySections);
    if(!sections.size){
      let liveHash='',savedHash='';
      try{liveHash=currentAutoSaveHash();savedHash=currentCharacter?autoSaveContentHash(stripRuntimeOnlyData(currentCharacter)):'';}catch(_){}
      if(liveHash===savedHash)break;
      sections=new Set(['all']);
    }
    if(sections.has('all'))autoSaveDirtySections.clear();
    else sections.forEach(key=>autoSaveDirtySections.delete(key));
    autoSaveDirty=autoSaveDirtySections.size>0;
    const useFull=sections.has('all')||currentMode==='new'||cloudCharacterRowHint<2;
    const patch=useFull?null:buildAutoSavePatch(sections);
    const data=useFull?collectData(true):null;
    const name=useFull?data?.name:(Object.prototype.hasOwnProperty.call(patch||{},'name')?patch.name:currentCharacter?.name);
    if(!name){
      sections.forEach(key=>autoSaveDirtySections.add(key));
      autoSaveDirty=true;
      throw new Error('キャラクター名を入力してください。');
    }
    if(useFull||sections.has('skills')||sections.has('manualCategoryBonuses')){
      const skillData=useFull?data:{skills:patch.skills||currentCharacter?.skills,manualCategoryBonuses:patch.manualCategoryBonuses||currentCharacter?.manualCategoryBonuses};
      const check=validateSkills(skillData.skills,skillData.manualCategoryBonuses||emptyCategoryBonus());
      if(check.errors.length){
        sections.forEach(key=>autoSaveDirtySections.add(key));
        autoSaveDirty=true;
        throw new Error('技能ポイントに問題があるため保存できません。\n'+check.errors.join('\n'));
      }
    }
    setCharacterSpecialSaveStatus(automatic?'保存中の追加変更を自動保存しています…':'保存中の変更を検出しました。最新状態を再送信しています…',{automatic});
    try{
      if(useFull){
        await saveItem(data);
        currentCharacter=data;
        autoSaveLastSavedHash=autoSaveContentHash(data);
      }else{
        await savePatchItem(currentCharacter.id,patch);
        currentCharacter={...(currentCharacter||{}),...patch};
        autoSaveLastSavedHash=autoSaveContentHash(stripRuntimeOnlyData(currentCharacter));
      }
    }catch(error){
      if(useFull)autoSaveDirtySections.add('all');
      else sections.forEach(key=>autoSaveDirtySections.add(key));
      autoSaveDirty=true;
      throw error;
    }
    passes++;
    if(passes>100)throw new Error('保存中の編集が長時間続いているため、最新状態の確定保存を完了できませんでした。編集を止めてもう一度保存してください。');
  }
  autoSaveDirty=false;
  autoSaveLastSavedHash=currentCharacter?autoSaveContentHash(stripRuntimeOnlyData(currentCharacter)):'';
}

async function saveCharacterNow({automatic=false,force=false}={}){
  if(autoSaveBusy){
    // 保存中に同じ保存要求が重なっても、未送信のDirtyが無ければ再保存は不要。
    if(autoSaveDirtySections.size>0)autoSavePending=true;
    return {saved:false,pending:true};
  }
  // 自動保存は既存キャラなら差分保存を使う。手動保存はforce=trueで全体保存し、
  // 保存中に加わった編集だけを後続の追送で反映する。
  const usePatch=!force&&currentMode!=='new'&&cloudCharacterRowHint>=2&&autoSaveDirtySections.size>0;
  try{
    await characterCreateHistoryBeforeSave({automatic,force});
  }catch(sequenceError){
    if(automatic)setAutoSaveStatus(`保存前処理に失敗しました：${sequenceError.message||sequenceError}`,'error');
    else{$('editorStatus').className='status-box error';$('editorStatus').textContent=sequenceError.message||String(sequenceError);}
    return {saved:false,reason:'pre-save',error:sequenceError};
  }
  setCharacterSaveProgress(10,{automatic,usePatch});
  const patch=usePatch?buildAutoSavePatch(autoSaveDirtySections):null;
  const data=usePatch?null:collectData(true);
  const name=usePatch?(Object.prototype.hasOwnProperty.call(patch,'name')?patch.name:currentCharacter?.name):data?.name;
  if(!name){
    if(automatic){autoSaveDirty=true;setAutoSaveStatus('キャラクター名の入力後に自動保存します。','warn');}
    else{$('editorStatus').className='status-box error';$('editorStatus').textContent='キャラクター名を入力してください。';showToast('キャラクター名を入力してください。','error');}
    return {saved:false,reason:'name'};
  }
  if(!usePatch || autoSaveDirtySections.has('skills') || autoSaveDirtySections.has('manualCategoryBonuses')){
    const skillData=usePatch?{skills:patch.skills||currentCharacter.skills,manualCategoryBonuses:patch.manualCategoryBonuses||currentCharacter.manualCategoryBonuses}:data;
    const check=validateSkills(skillData.skills,skillData.manualCategoryBonuses||emptyCategoryBonus());
    if(check.errors.length){
      if(automatic){autoSaveDirty=true;setAutoSaveStatus('技能ポイントに問題があるため、自動保存を保留しています。','error');}
      else{$('editorStatus').className='status-box error';$('editorStatus').textContent='技能ポイントに問題があるため保存前に確認してください。\n'+check.errors.join('\n');showToast('技能ポイントに問題があるため保存できません。','error');}
      return {saved:false,reason:'skills',errors:check.errors};
    }
  }
  if(!usePatch){
    const hash=autoSaveContentHash(data);
    if(!force&&hash===autoSaveLastSavedHash){autoSaveDirty=false;autoSaveDirtySections.clear();setAutoSaveStatus('自動保存済み','ok');return {saved:false,unchanged:true};}
  }
  const wasNewCharacter=currentMode==='new';
  const previousCharacterName=String(currentCharacter?.name||'');
  const savingSections=new Set(autoSaveDirtySections);
  // 送信対象を現在のDirty集合から切り離す。await中に同じ区分が再編集された場合は、新しいDirtyとして残す。
  if(savingSections.has('all')) autoSaveDirtySections.clear();
  else savingSections.forEach(key=>autoSaveDirtySections.delete(key));
  autoSaveDirty=autoSaveDirtySections.size>0;
  autoSaveBusy=true;autoSavePending=false;
  let saveFailed=false;
  setCharacterSaveProgress(30,{automatic,usePatch});
  try{
    const result=usePatch?await savePatchItem(currentCharacter.id,patch):await saveItem(data);
    setCharacterSaveProgress(90,{automatic,usePatch});
    cloudCharacterFolderReady=true;
    if(usePatch){currentCharacter={...(currentCharacter||{}),...patch};}
    else{currentCharacter=data;autoSaveLastSavedHash=autoSaveContentHash(data);}
    currentMode='edit';
    // await中に編集された内容も、この保存操作の一部として最新状態まで追送する。
    // 自動保存OFFでも手動保存中の変更は取りこぼさない。
    await drainQueuedCharacterChanges({automatic});
    const listMayHaveChanged=wasNewCharacter||previousCharacterName!==String(currentCharacter?.name||'');
    try{if(window.parent&&window.parent!==window)window.parent.postMessage({type:'RA_CHARACTER_SAVED',id:String(currentCharacter?.id||''),name:String(currentCharacter?.name||''),updatedAt:String(currentCharacter?.updatedAt||patch?.updatedAt||''),revision:Number(cloudCharacterRevision||0)||0,storageRow:Number(cloudCharacterRowHint||0)||0},location.origin)}catch(_){}
    if(listMayHaveChanged){try{if(window.parent&&window.parent!==window)window.parent.postMessage({type:'RA_CHARACTER_LIST_CHANGED'},location.origin)}catch(_){}}
    autoSaveDirty=autoSaveDirtySections.size>0;
    syncAutoSaveToggle();
    setCharacterSaveProgress(100,{automatic,usePatch});
    await yieldCharacterSaveProgressFrame();
    if(automatic)setAutoSaveStatus(`差分自動保存しました（${autoSaveTimeLabel()}）`,'ok');
    else{$('editorStatus').className=result?.reason?'status-box warn':'status-box ok';$('editorStatus').textContent='クラウドへ保存しました。';setAutoSaveStatus(autoSaveEnabled?`保存しました（${autoSaveTimeLabel()}）`:'自動保存：OFF','ok');showToast('クラウドへ保存しました。','ok');}
    return {saved:true,result};
  }catch(e){
    saveFailed=true;
    // 失敗した送信対象をDirtyへ戻し、次回保存で取りこぼさない。
    // フル保存失敗は全体未保存として保持する。
    if(usePatch)savingSections.forEach(key=>autoSaveDirtySections.add(key));
    else autoSaveDirtySections.add('all');
    autoSaveDirty=true;
    if(automatic)setAutoSaveStatus(`自動保存に失敗しました：${e.message||e}（未保存の変更は保持中。次の編集または「保存」で再試行します）`,'error');
    else{$('editorStatus').className='status-box error';$('editorStatus').textContent=e.message;showToast(e.message,'error');}
    return {saved:false,reason:'error',error:e};
  }finally{
    autoSaveBusy=false;
    const queuedSections=[...autoSaveDirtySections];
    autoSavePending=false;
    // 保存失敗をトリガーに自動で自分自身を再予約しない。
    // 成功中にユーザーが追加編集した場合だけ、残ったDirtyを次の1回へ回す。
    if(!saveFailed&&queuedSections.length&&autoSaveEnabled)autoSaveDraftSoon(queuedSections);
  }
}
async function flushAutoSaveBeforeLeave(){
  clearAutoSaveTimer();
  if(!autoSaveEnabled || !autoSaveReady || currentMode==='view' || !autoSaveDirty)return true;
  const result=await saveCharacterNow({automatic:true,force:false});
  if(result.saved || result.unchanged)return true;
  return confirm('自動保存できていない変更があります。このままリストへ戻りますか？');
}
