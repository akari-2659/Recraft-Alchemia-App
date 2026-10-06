function integrityMasterItemIndex(){
  const rows=[...(DB_INITIAL_ITEM_MASTER||[])],byId=new Map(),byPublic=new Map();
  rows.forEach(r=>{if(r.id)byId.set(String(r.id),r);if(r.publicId)byPublic.set(String(r.publicId),r);});
  return{rows,byId,byPublic};
}
function characterIntegrityIssues(){
  const data=collectData(false),issues=[],inv=Array.isArray(data?.inventory?.items)?data.inventory.items:[],index=integrityMasterItemIndex();
  const add=(severity,title,where,reason,detail='')=>issues.push({severity,title,where,reason,detail});
  const ids=new Map();
  inv.forEach((raw,i)=>{
    const item=normalizeInventoryItem(raw),id=String(item.id||'').trim();
    if(id){if(ids.has(id))add('error','装備・倉庫個体IDが重複しています',`倉庫 ${ids.get(id)+1}件目 / ${i+1}件目`,`1つのキャラクター内で個体IDは一意である必要があります。`,`重複ID：${id}`);else ids.set(id,i);}
    if(inventoryKindUsesIndividualRecord(item.kind)&&Number(raw.count||1)!==1)add('warn','個体管理装備の個数が1ではありません',`倉庫：${item.name||'名称未設定'}`,`武器・防具は個体ごとに別レコードで管理するため、1レコードの個数は1である必要があります。`,`保存値：${raw.count}`);
    const used=equipmentUpgradeUsedSlots(parseUpgradeLines(item.upgradeEntries||item.upgradeLines||'')),limit=Math.max(0,Number(item.upgradeLimit||0));
    if(limit&&used>limit)add('error','装備強化枠を超過しています',`倉庫：${item.name||'名称未設定'}`,`使用中の強化枠が装備の上限を超えています。`,`使用 ${used}枠 / 上限 ${limit}枠`);
    const masterId=String(item.masterId||'').trim(),publicId=String(item.publicId||'').trim(),antique=/antique/i.test(String(item.masterSheet||''))||/^antique/i.test(id);
    if(masterId&&!index.byId.has(masterId)&&!antique)add('warn','共通DBに存在しないアイテムIDを参照しています',`倉庫：${item.name||'名称未設定'}`,`保存されているmasterIdが現在の共通DBに見つかりません。古いデータまたは削除済みデータの可能性があります。`,`masterId：${masterId}`);
    if(publicId&&!index.byPublic.has(publicId)&&!antique)add('warn','共通DBに存在しない登録IDを参照しています',`倉庫：${item.name||'名称未設定'}`,`登録IDが現在の共通DBに見つかりません。個別発行品でない場合は確認してください。`,`登録ID：${publicId}`);
  });
  const eq=data.equipment||{},a=normalizeInventoryItem(eq.rightHand||{}),b=normalizeInventoryItem(eq.leftHand||{});
  if(String(a.name||'').trim()&&String(b.name||'').trim()){
    const ai=duplicateRestrictedEquipmentIdentity(a),bi=duplicateRestrictedEquipmentIdentity(b);
    if(ai&&bi&&ai===bi)add('error','左右手の装備ルールに違反しています','装備 > 右手 / 左手','同時装備できない組み合わせが保存されています。',`${a.name} / ${b.name}`);
    if(isTwoHandCsItem(a)||isTwoHandCsItem(b))add('error','両手装備と副手装備が同時設定されています','装備 > 右手 / 左手','両手装備を使用している間、反対の手には装備できません。',`${a.name} / ${b.name}`);
  }
  const sg=normalizeSkillGachaState(data.skillGacha||{}),skillIds=new Set((DB_SKILL_MASTER||[]).map(r=>String(r.id||'')));
  sg.acquiredSkillIds.forEach(id=>{if(id&&!skillIds.has(String(id)))add('warn','存在しないスキルを所持しています','スキルクリスタル > 倉庫','取得済みスキルIDが現在の共通DBに見つかりません。',`ID：${id}`);});
  sg.equippedSkillIds.filter(Boolean).forEach(id=>{if(!skillIds.has(String(id)))add('error','存在しないスキルを装着しています','スキルクリスタル > 設定スキル','装着中のスキルIDが現在の共通DBに見つかりません。',`ID：${id}`);});
  const setIds=sg.equippedSkillIds.filter(Boolean);if(new Set(setIds).size!==setIds.length)add('error','同じスキルが複数枠に設定されています','スキルクリスタル > 設定スキル','同一スキルを複数の装着枠へ設定することはできません。');
  const presets=Array.isArray(data.loadoutPresets)?data.loadoutPresets:Object.values(data.loadoutPresets||{});
  presets.forEach((preset,pi)=>Object.values(preset?.data?.slots||preset?.slots||{}).forEach(slot=>{const itemId=String(slot?.itemId||'').trim();if(itemId&&!inv.some(r=>String(r.id||'')===itemId))add('warn','装備プリセットが存在しない倉庫個体を参照しています',`装備プリセット ${pi+1}`,'プリセット保存後に対象装備が削除された可能性があります。',`itemId：${itemId}`);}));
  return issues;
}
function renderIntegrityCheck(){
  const list=$('integrityList'),summary=$('integritySummary');if(!list||!summary)return;
  const issues=characterIntegrityIssues(),errors=issues.filter(x=>x.severity==='error').length,warns=issues.filter(x=>x.severity==='warn').length;
  summary.innerHTML=issues.length?`<span>${errors?`エラー ${errors}件 / `:''}警告 ${warns}件</span><span class="pill">${issues.length}件</span>`:`<span>問題は見つかりませんでした。</span><span class="pill">OK</span>`;
  list.innerHTML=issues.length?issues.map((x,i)=>`<div class="integrity-item ${esc(x.severity)}"><button type="button" data-integrity-toggle="${i}"><span>${x.severity==='error'?'⚠':'△'} ${esc(x.title)}</span><span>${esc(x.where)}</span></button><div class="integrity-detail" data-integrity-detail="${i}" hidden><b>検出箇所：</b>${esc(x.where)}\n<b>理由：</b>${esc(x.reason)}${x.detail?`\n<b>詳細：</b>${esc(x.detail)}`:''}</div></div>`).join(''):`<div class="integrity-item ok"><button type="button" disabled><span>✓ データ整合性に問題はありません。</span></button></div>`;
}
async function refreshCharacterHistory(){
  const status=$('historyStatus'),list=$('historyList');if(!status||!list)return;
  if(currentMode==='new'||!currentCharacter?.id){status.className='status-box warn';status.textContent='新規キャラクターは初回保存後に履歴を利用できます。';list.innerHTML='';return;}
  status.className='status-box';status.textContent='復元履歴を読み込み中です。';list.innerHTML='';
  try{
    const auth=getCloudAuth(),res=await cloudRequest('historyList',{id:currentCharacter.id,playerKey:auth.playerKey,rowHint:cloudCharacterRowHint}),items=res.items||[];
    cloudCharacterFolderReady=!!res.folderReady;
    status.className='status-box ok';
    status.textContent=!res.folderReady?'次回保存時に既存キャラクターデータを新しいフォルダ構成へ移行します。復元履歴は移行後から利用できます。':(items.length?`${items.length}件の復元ポイントがあります。`:'復元ポイントはまだありません。');
    list.innerHTML=items.map(row=>{const d=new Date(row.createdAt),label=Number.isNaN(d.getTime())?row.createdAt:d.toLocaleString('ja-JP');return `<div class="history-row"><div><b>${esc(label)}</b><div class="history-meta">${row.kind==='manual'?'手動保存':'自動復元ポイント'} / revision ${esc(row.revision||0)}</div></div><div class="history-actions"><button type="button" class="ghost" data-history-count-restore="${esc(row.fileId)}">倉庫個数だけ復元</button><button type="button" class="secondary" data-history-restore="${esc(row.fileId)}">この時点へ復元</button></div></div>`;}).join('');
  }catch(e){status.className='status-box error';status.textContent=e.message||String(e);}
}
async function createCharacterHistoryNow(){
  if(currentMode==='new'||!currentCharacter?.id)return;
  const status=$('historyStatus');try{if(status){status.className='status-box';status.textContent='復元ポイントを作成しています…';}const auth=getCloudAuth();await cloudRequest('historyCreate',{id:currentCharacter.id,playerKey:auth.playerKey,rowHint:cloudCharacterRowHint,kind:'manual'});characterLastHistoryAt=Date.now();await refreshCharacterHistory();}catch(e){if(status){status.className='status-box error';status.textContent=e.message||String(e);}}
}
async function restoreCharacterHistory(fileId){
  if(!fileId||!currentCharacter?.id)return;
  if(!confirm('この時点へ復元しますか？\n現在の状態は復元直前バックアップとして保存してから復元します。'))return;
  const status=$('historyStatus');
  try{
    if(status){status.className='status-box';status.textContent='現在状態をバックアップして復元しています…';}
    const auth=getCloudAuth(),res=await cloudRequest('historyRestore',{id:currentCharacter.id,historyFileId:fileId,playerKey:auth.playerKey,rowHint:cloudCharacterRowHint});
    cloudCharacterRevision=Number(res.revision||cloudCharacterRevision)||0;cloudCharacterRowHint=Number(res.storageRow||cloudCharacterRowHint)||0;cloudCharacterFolderReady=true;
    applyData(res.data||{});autoSaveDirty=false;autoSaveDirtySections.clear();autoSaveLastSavedHash=autoSaveContentHash(res.data||{});
    showToast('復元しました。','ok');await refreshCharacterHistory();renderIntegrityCheck();
  }catch(e){if(status){status.className='status-box error';status.textContent=e.message||String(e);}showToast(e.message||String(e),'error');}
}
async function restoreCharacterInventoryCounts(fileId){
  if(!fileId||!currentCharacter?.id)return;
  if(!confirm('この履歴の倉庫個数だけを復元しますか？\n現在の倉庫に存在する同一アイテムの個数だけを履歴の値へ戻します。\nアイテムの追加・削除、装備、技能、所持金などは変更しません。\n現在状態は復元直前バックアップとして保存します。'))return;
  const status=$('historyStatus');
  try{
    if(status){status.className='status-box';status.textContent='現在状態をバックアップして、倉庫個数だけ復元しています…';}
    const auth=getCloudAuth(),res=await cloudRequest('historyRestoreInventoryCounts',{id:currentCharacter.id,historyFileId:fileId,playerKey:auth.playerKey,rowHint:cloudCharacterRowHint});
    cloudCharacterRevision=Number(res.revision||cloudCharacterRevision)||0;cloudCharacterRowHint=Number(res.storageRow||cloudCharacterRowHint)||0;cloudCharacterFolderReady=true;
    applyData(res.data||{});autoSaveDirty=false;autoSaveDirtySections.clear();autoSaveLastSavedHash=autoSaveContentHash(res.data||{});
    const changed=Number(res.changedCount||0)||0,matched=Number(res.matchedCount||0)||0;
    if(changed){showToast(`倉庫個数を${changed}件復元しました。`,'ok');if(status){status.className='status-box ok';status.textContent=`倉庫個数を${changed}件復元しました（照合 ${matched}件）。`;}}
    else{showToast('この履歴から変更できる倉庫個数はありませんでした。','ok');if(status){status.className='status-box ok';status.textContent=`変更対象はありませんでした（照合 ${matched}件）。`;}}
    await refreshCharacterHistory();renderIntegrityCheck();
  }catch(e){if(status){status.className='status-box error';status.textContent=e.message||String(e);}showToast(e.message||String(e),'error');}
}
