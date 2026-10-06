function buildFieldInput(key, field, value, rowContext={}){
  const label = fieldLabelFor(key, field);
  const ph = key==='quests' && field==='areaName' ? '受注候補へ出る解放段階。例：街はずれの草原' : (FIELD_PLACEHOLDERS[field] || '');
  const isWide = FORM_LONG_FIELDS.has(field) || ['id','updatedAt','ownerKey','createdBy'].includes(field);
  const id = `form-${field}`;
  const common = `id="${id}" data-form-field="${field}"`;
  let input = '';
  if(field==='modifiers'){
    input = modifierRowsEditor(value);
  }else if(field==='equipmentEffects' && key==='items'){
    input = adminEquipmentEffectsEditor(value,'equipmentEffects');
  }else if(field==='intrinsicEffects' && key==='equipment_categories'){
    input = adminEquipmentEffectsEditor(value,'intrinsicEffects');
  }else if(field==='namedProcessingOptions' && key==='items'){
    input = adminNamedProcessingEditor(value);
  }else if(key==='monsters' && field==='actions'){
    input = monsterActionsEditor(value);
  }else if(key==='monsters' && field==='drops'){
    input = monsterDropsEditor(value);
  }else if((key==='quests' || key==='exploration_areas') && field==='progressStep'){
    input = questProgressStepSelect(value);
  }else if((key==='quests' || key==='exploration_areas') && field==='fixedEvents'){
    input = questFixedEventsEditor(value, rowContext);
  }else if(field==='checkType' && key==='items' && String(rowContext.itemType || '').trim()==='武器'){
    input = `<input ${common} value="" readonly placeholder="武器は「使用技能」で管理します">`;
  }else if(field==='checkType'){
    input = checkBuilderHtml(value, `id="${id}" data-form-field="${field}"`, {key, row: rowContext});
  }else if(field==='unlockKey' && key==='exploration_areas'){
    input = `<div class="input-action-row unlock-key-input-row"><input ${common} value="${escapeHtml(value ?? '')}" placeholder="${escapeHtml(ph)}" autocomplete="off" spellcheck="false"><button type="button" class="ghost" data-copy-form-unlock-key>コピー</button><button type="button" class="secondary" data-generate-form-unlock-key>ランダム生成</button></div>`;
  }else if(FORM_LONG_FIELDS.has(field)){
    input = `<textarea ${common} placeholder="${escapeHtml(ph)}">${escapeHtml(value ?? '')}</textarea>`;
  }else if(key==='skills' && field==='probability'){
    input = `<input ${common} value="${escapeHtml(value ?? '')}" readonly title="排出ウェイトから自動計算">`;
  }else if(baseKeyForTable(key)==='items' && field==='sellPrice'){
    const priceValue=String(value ?? '').trim();
    input = `<input type="number" min="0" step="1" inputmode="numeric" required ${common} value="${escapeHtml(priceValue)}" placeholder="必須・売却不可は0">`;
  }else if(baseKeyForTable(key)==='items' && field==='buyPrice'){
    const priceValue=String(value ?? '').trim();
    input = `<input type="number" min="1" step="1" inputmode="numeric" ${common} value="${escapeHtml(priceValue)}" placeholder="店売り品のみ・1以上">`;
  }else if(key==='treasure_tables' && field==='trapDetectDifficulty'){
    const difficultyValue=numericRankValue(value,'');
    input = `<input type="number" min="1" step="1" inputmode="numeric" required ${common} value="${escapeHtml(difficultyValue)}" placeholder="必須・1以上">`;
  }else if((field==='rank' && isStructuredNumericRankRecord(key,rowContext)) || isStructuredNumericSubRank(key,field) || ['toolRank','upgradeMaterialMinRank','guaranteeUpgradeMaxRank'].includes(field) || (key==='material_ranks' && field==='name') || field==='unlockOrder'){
    const rankValue=numericRankValueIncludingLegacyMaterialGrade(value,1);
    input = `<input type="number" min="1" step="1" inputmode="numeric" ${common} value="${escapeHtml(rankValue)}" placeholder="1以上">`;
  }else if(FORM_SELECT_FIELDS.has(field)){
    const opts = formOptionValues(key, field);
    const current = String(value ?? '');
    const allOpts = current && !opts.includes(current) ? [current, ...opts] : opts;
    const select = `<select ${common}><option value="">未選択</option>${allOpts.map(v=>`<option value="${escapeHtml(v)}" ${v===current?'selected':''}>${escapeHtml(v)}</option>`).join('')}</select>`;
    if(shouldShowQuickCategoryButton(key, field)){
      input = `<div class="input-action-row">${select}<button type="button" class="ghost" data-quick-category-field="${field}">${quickButtonLabel(field)}</button></div>`;
    }else{
      input = select;
    }
  }else{
    input = `<input ${common} value="${escapeHtml(value ?? '')}" placeholder="${escapeHtml(ph)}">`;
  }
  let help = '';
  if(field==='csVisible') help += '<div class="form-help">TRUEならキャラシHTML側のDB装備/アイテム候補に表示。FALSEならDBには残りますが、キャラシ候補には出ません。</div>';
  if(field==='effect' && key==='items' && String(rowContext.dataKind || '').trim()==='素材') help += '<div class="form-help">素材そのものの一般効果だけを入力します。装備強化内容はここへ書かず、魔物素材の場合のみ専用の装備強化項目へ設定します。</div>';
  if(field==='effect' && key==='items' && ['武器','防具','盾'].includes(String(rowContext.itemType||'').trim())) help += '<div class="form-help">互換用の全文です。通常は「固有効果」の詳細全文から保存時に自動生成します。</div>';
  if(field==='ownerKey') help += '<div class="form-help">空欄なら全員に見える公開データ。入力すると同じ管理キーの人だけ読めます。</div>';
  if(field==='id') help += '<div class="form-help">種別では任意IDを決められます。カテゴリやアイテムは空欄でも自動生成されます。</div>';
  if(field==='publicId') help += '<div class="form-help">プレイヤーへ渡す登録IDです。空欄で保存すると RCA-XXXX-XXXX 形式で自動生成します。</div>';
  if(key==='skills' && field==='probability') help += '<div class="form-help">同ランクの排出ウェイト合計から自動計算されます。直接編集しません。</div>';
  if(key==='skills' && field==='drawWeight') help += '<div class="form-help">同ランク内の相対ウェイトです。大きいほど排出率が高くなります。</div>';
  if(field==='itemType') help += '<div class="form-help">アイテム用の親分類です。候補は「アイテム種別」で管理します。</div>';
  if(field==='itemCategory') help += '<div class="form-help">選んだアイテム種別に紐づくカテゴリだけ表示します。</div>';
  if(field==='materialType') help += '<div class="form-help">素材用の親分類です。魔物素材だけが専用の装備強化項目を持ち、ほかの素材には装備強化内容を設定しません。</div>';
  if(field==='materialCategory') help += '<div class="form-help">選んだ素材種別に紐づくカテゴリだけ表示します。</div>';
  if(field==='rank') help += '<div class="form-help">魔物・素材・装備・道具・レシピ・術式・クエストなど、ランクを持つデータは1以上の数値で管理し、すべての画面で★Nと表示します。</div>';
  if(field==='buyPrice' && baseKeyForTable(key)==='items') help += '<div class="form-help">プレイヤーが店で購入する買値です。店売り品と武器派生の完成品には必ず設定します。既存の買値を販売価格の基準として維持し、価格差の調整は原則として売値側で行います。</div>';
  if(field==='sellPrice' && baseKeyForTable(key)==='items') help += '<div class="form-help">プレイヤーが売却するときの売値です。加工素材および調合・細工・設計の自作品は、1回の完成品売却総額を『消費素材の売値合計＋施設依頼費の50%』として計算し、複数個完成時は完成数で割って1G未満を切り捨てます。完成品に買値がある場合は買値の80%以下、全必要素材を店頭購入できる場合は完成品売却総額を素材購入総額未満にします。アイテム価格はbuyPrice・sellPriceの2項目だけで管理します。</div>';
  if(field==='recipePrice' && key==='recipes') help += '<div class="form-help">レシピの買値です。常設店売りとレシピショップで共通して使います。入手先に「店売り」が含まれるレシピは常設店、それ以外の販売対象レシピはレシピショップにだけ出ます。</div>';
  if(field==='recipeSellPrice') help += '<div class="form-help">宝箱などで既習レシピと重複した場合に売却できる価格です。販売価格や施設依頼費とは別に管理します。</div>';
  if(field==='price' && key==='recipes') help += '<div class="form-help">施設へ製作を依頼するときの費用です。レシピの販売価格・売値とは別で、施設依頼ではレシピ不要です。</div>';
  if(field==='toolRank') help += '<div class="form-help">この道具で扱えるレシピ・素材の上限ランクです。道具本体のランクも同じ値に揃えます。値は飛び番でも構いません。</div>';
  if(field==='unlockAreaKey') help += '<div class="form-help">この商品・作成・派生を公開するために必要な探索エリアIDです。ランクでは解放しません。</div>';
  if(field==='unlockKey') help += '<div class="form-help">プレイヤー施設HTMLへ追加登録する個別キーです。入力したキーに一致するエリアだけを解放し、プレイヤーキー単位で保存します。管理画面だけに表示し、プレイヤーへ渡す時はコピーして使用します。</div>';
  if(field==='unlockOrder') help += '<div class="form-help">エリアの表示順・通常進行上の目安です。施設HTMLでは解放キーを個別保存するため、この数値だけで前後のエリアを自動解放しません。</div>';
  if(field==='upgradeMaterialMinRank') help += '<div class="form-help">この装備へ使用できる強化素材の最低ランクです。未設定時は装備自身のランクを自動設定します。</div>';
  if(field==='bagCapacity') help += '<div class="form-help">バッグ専用の所持品枠数です。倉庫のスタック数や1枠数とは別項目です。</div>';
  if(key==='treasure_tables' && ['unlockDifficulty','trapDetectDifficulty','trapDisarmDifficulty'].includes(field)) help += '<div class="form-help">宝箱表単位の基準値です。実際の解錠・感知・解除難易度は、中身より先に基準値－1～＋1から個別抽選されます。鍵なしなら解錠難易度は表示せず、罠がなくても感知難易度は必ず表示し、罠なしなら解除難易度だけ表示しません。</div>';
  if(field==='monsterType') help += '<div class="form-help">素材派生へ流用しやすい大分類です。粘体・獣・虫・植物・爬虫・水棲・軟体・霊体・造魔・竜・異界から選びます。</div>';
  if(field==='monsterTraits') help += '<div class="form-help">飛行・甲殻・異界・鉱質など、大分類だけでは表せない特徴をカンマ区切りで入力します。</div>';
  if(field==='encounterValue') help += '<div class="form-help">通常魔物は1～3で設定します。1＝小型・軽量、2＝標準、3＝強敵。エリアが後半かどうかではなく、その魔物自身の能力と行動で決めます。ボスは通常遭遇から除外されるため空欄で構いません。</div>';
  if(field==='equipmentUpgradeTarget') help += '<div class="form-help">この素材で強化できる装備種別です。対象は武器（魔導書・祈祷書を含む）・鎧・盾だけです。複数対象は「・」で区切ります。装飾品・バッグ・矢筒・道具などは指定できません。</div>';
  if(field==='equipmentUpgradeEffect') help += '<div class="form-help">効果名だけで内容を判別できる名称を設定します。例：威力強化、威力固定強化、回復量強化、回復量固定強化、水属性軽減、抵抗妨害。独立した数値欄は使用しません。</div>';
  if(field==='equipmentUpgradeDetail') help += '<div class="form-help">すべての強化で必須です。補正値・対象・条件・持続・解除条件・重複可否まで具体的に入力します。通常強化は同名でも重複して累積し、同名重複不可は素材固有の特殊効果だけです。</div>';
  if(field==='enchantTarget') help += '<div class="form-help">使用時に選べる装備範囲です。武器は右手・左手の通常武器、防具・盾は鎧と盾、装飾品は装飾品枠を対象にします。</div>';
  if(field==='enchantEffectType') help += '<div class="form-help">属性付与とダメージ補正はチャットパレットへ反映します。その他の効果もキャラシ上で期限付き効果として管理できます。</div>';
  if(field==='enchantValue') help += '<div class="form-help">属性付与なら火・水など、数値補正なら+1・-1などを入力します。</div>';
  if(field==='enchantDuration') help += '<div class="form-help">ラウンド制を選んだ場合は「持続ラウンド」も入力します。戦闘終了などはキャラシ側の解除ボタンで管理します。</div>';
  if(field==='enchantStackRule') help += '<div class="form-help">通常は同じ装備へ1つだけとし、後から使用した効果で上書きします。</div>';
  if(field==='craftType') help += '<div class="form-help">調合・鍛冶・武器派生など、製作データの用途を選びます。管理画面ではこの区分ごとに分割表示します。</div>';
  if(field==='baseItem') help += '<div class="form-help">武器派生の派生元です。武器に加えて、魔導書・祈祷書も候補へ表示します。</div>';
  if(field==='branchType') help += '<div class="form-help">鉱石・獣牙・植生・甲殻・異界など、大枠の素材系統を入力します。素材が1種類変わるたびに新しい系統を作らず、同じ素材群を主に使う順当強化では同じ名称を使います。ボス武器は草角・樹心・沼核・穿岩・鏡淵・嵐翼など、素材や特徴を表す固有系統を設定します。プレイヤー施設では末尾へ「派生」を付けて表示します。</div>';
  if(field==='offhandBonus') help += '<div class="form-help">二刀攻撃で副手にした時に追加する固定値。短剣/片手剣/槌/片手槍は2、片手斧は3、杖は1が目安です。</div>';
  if(field==='checkType' && key==='items' && String(rowContext.itemType || '').trim()==='武器') help += '<div class="form-help">武器は「使用技能」で管理します。回避値との比較は攻撃処理・チャットパレット側で扱うため、武器データには判定式を保存しません。</div>';
  else if(field==='checkType') help += '<div class="form-help">左側は対応技能、右側は目標値です。右側は候補から選ぶほか、数値や任意の名称を直接入力できます。</div>';
  if(field==='fixedEvents') help += '<div class="form-help">固定イベント欄の「追加」から、発生%・イベント名・内容を1件ずつ登録します。</div>';
  if(field==='requiredMaterials' && key==='recipes' && String(rowContext.craftType || activeRecipeCraftType()).trim()==='料理') help += renderMealMaterialCandidateButtons();
  if(shouldShowQuickCategoryButton(key, field)) help += '<div class="field-inline-help">候補にない場合は横のボタンから作成できます。</div>';
  return `<div class="field ${isWide?'wide':''} ${shouldShowQuickCategoryButton(key, field)?'with-action':''}"><label>${escapeHtml(label)}</label>${input}${help}</div>`;
}
function generateOpaqueAreaUnlockKey(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const groups=[];
  for(let g=0;g<5;g++){
    let part='';
    for(let i=0;i<4;i++){
      let n=0;
      if(globalThis.crypto?.getRandomValues){
        const a=new Uint32Array(1); crypto.getRandomValues(a); n=a[0]%chars.length;
      }else n=Math.floor(Math.random()*chars.length);
      part+=chars[n];
    }
    groups.push(part);
  }
  return groups.join('-');
}
async function copyExplorationUnlockKey(idx){
  const row=(state.exploration_areas||[])[Number(idx)];
  const key=String(row?.unlockKey||'').trim();
  if(!key){ toast('このエリアには解放キーが設定されていません','error'); return; }
  if(await copyAdminTextDirect(key)) toast(`${row.name||'探索エリア'}の解放キーをコピーしました`);
}
async function copyFormExplorationUnlockKey(){
  const input=$('editModal')?.querySelector('[data-form-field="unlockKey"]');
  const key=String(input?.value||'').trim();
  if(!key){ toast('解放キーが空です','error'); return; }
  if(await copyAdminTextDirect(key)) toast('解放キーをコピーしました');
}
function generateFormExplorationUnlockKey(){
  const input=$('editModal')?.querySelector('[data-form-field="unlockKey"]');
  if(!input) return;
  const current=String(input.value||'').trim();
  if(current && !confirm('現在の解放キーを新しいランダムキーに置き換える？')) return;
  input.value=generateOpaqueAreaUnlockKey();
  input.dispatchEvent(new Event('input',{bubbles:true}));
  toast('推測しにくい解放キーを生成しました');
}

function slugLike(text){
  const raw = String(text||'').trim().toLowerCase();
  const ascii = raw.replace(/[\s　]+/g,'_').replace(/[^a-z0-9_\-]/g,'');
  return ascii || Date.now().toString(36);
}
function findByName(key, name, parentField, parentName){
  const n=String(name||'').trim(); if(!n) return null;
  return (state[key]||[]).find(r=>String(r.name||'').trim()===n && (!parentField || String(r[parentField]||'').trim()===String(parentName||'').trim())) || null;
}
function quickCreateCategory(field){
  const {key}=formState;
  if(key!=='items') return;
  const target=$('editModal').querySelector(`[data-form-field="${field}"]`);
  if(!target) return;
  const defaultName = String(target.value||'').trim();
  const name = prompt(`${quickButtonLabel(field).replace('＋','')}名を入力してね。`, defaultName);
  if(name===null) return;
  const cleanName = name.trim();
  if(!cleanName){ toast('名称が空です','error'); return; }
  let listKey='', parentField='', parentName='', idPrefix='';
  if(field==='itemType'){ listKey='item_types'; idPrefix='itype'; }
  if(field==='itemCategory'){ listKey='item_categories'; parentField='itemType'; parentName=currentFormValue('itemType'); idPrefix='icat'; if(!parentName){ toast('先にアイテム種別を選んでね','error'); return; } }
  if(field==='materialType'){ listKey='material_types'; idPrefix='mtype'; }
  if(field==='materialCategory'){ listKey='material_categories'; parentField='materialType'; parentName=currentFormValue('materialType'); idPrefix='mcat'; if(!parentName){ toast('先に素材種別を選んでね','error'); return; } }
  if(field==='rank'){ listKey='material_ranks'; idPrefix='mrank'; }
  const existing=findByName(listKey, cleanName, parentField, parentName);
  if(existing){ target.value=existing.name; toast(`既存候補「${existing.name}」を選択しました`); return; }
  const row={}; SCHEMA[listKey].forEach(h=>row[h]='');
  row.id = `${idPrefix}_${slugLike(cleanName)}_${Date.now().toString(36)}`;
  row.name = cleanName;
  if(parentField) row[parentField]=parentName;
  row.description = '';
  row.sortOrder = '';
  row.enabled = 'TRUE';
  row.updatedAt = nowIso();
  row.ownerKey = '';
  row.createdBy = '';
  state[listKey].push(row);
  markDirty(listKey);
  quickCategoryDirty = true;
  target.value = cleanName;
  renderFilterControls(listKey); renderTable(listKey); updateCounts(); updateJsonBox();
  toast(`「${cleanName}」を画面に追加しました`);
}
function currentFormRowSnapshot(){
  syncAllCheckBuilders($('editModal'));
  if(formState.key==='monsters') syncAllMonsterEditors();
  if(formState.key==='quests') syncAllQuestFixedEventEditors();
  syncAllModifierEditors();
  syncAllAdminEquipmentEffectsEditors();
  syncAllAdminNamedProcessingEditors();
  const row = formState.key ? (formState.idx===null ? newBlankRow(formState.key) : {...state[formState.key][formState.idx]}) : {};
  if(formState.key==='items' && !row.dataKind) row.dataKind = formState.defaultDataKind || 'アイテム';
  if(formState.key==='items' && row.dataKind!=='素材' && !row.itemType) row.itemType = formState.defaultItemType || currentItemTypeView || '';
  $('editModal')?.querySelectorAll('[data-form-field]').forEach(el=>{ row[el.dataset.formField]=el.value ?? ''; });
  if(formState.key==='items'){
    row.equipmentEffects=parseAdminEquipmentEffects(row.equipmentEffects);
    row.namedProcessingOptions=parseAdminNamedProcessingOptions(row.namedProcessingOptions);
    if(['武器','防具','盾','装飾品'].includes(String(row.itemType||'').trim()) && row.equipmentEffects.length) row.effect=equipmentEffectsLegacyText(row.equipmentEffects);
  }
  if(formState.key==='equipment_categories'){
    row.intrinsicEffects=parseAdminEquipmentEffects(row.intrinsicEffects);
    if(row.intrinsicEffects.length) row.effect=equipmentEffectsLegacyText(row.intrinsicEffects);
  }
  return row;
}
function itemFormFields(row){
  const kind = String(row.dataKind || 'アイテム').trim() || 'アイテム';
  if(kind==='素材'){
    const fields=['materialType','materialCategory','name','publicId','rank','sellPrice'];
    if(String(row.materialType||'').trim()==='加工素材') fields.push('processingSkill','processingToolType','processingToolRank','processingRequiredMaterials','processingResultCount','processingDifficulty','processingFee');
    fields.push('source','usageTags','equipmentUpgradeEffect','equipmentUpgradeSlotCost','equipmentUpgradeDetail','equipmentUpgradeTarget','description','effect','unlockAreaKey','unlockOrder','unlockCondition','unlockFacility','tags','notes');
    return fields;
  }
  const itemType = String(row.itemType || '').trim();
  if(itemType === '道具') return ['itemType','itemCategory','name','publicId','csVisible','buyPrice','sellPrice','rank','toolRank','guaranteeUpgradeMaxRank','equipSlot','maxStack','description','effect','unlockAreaKey','unlockOrder','unlockCondition','unlockFacility','tags','notes'];
  if(itemType === '重要アイテム') return ['itemType','itemCategory','name','publicId','csVisible','sellPrice','equipSlot','maxStack','description','effect','source','tags','notes'];
  if(itemType === 'バッグ'){
    return ['itemType','itemCategory','name','publicId','csVisible','buyPrice','sellPrice','rank','bagCapacity','description','effect','unlockAreaKey','unlockOrder','unlockCondition','unlockFacility','tags','notes'];
  }
  if(itemType === '矢筒'){
    return ['itemType','itemCategory','name','publicId','csVisible','buyPrice','sellPrice','rank','quiverCapacity','description','effect','unlockAreaKey','unlockOrder','unlockCondition','unlockFacility','tags','notes'];
  }
  if(itemType === '食材'){
    return ['itemType','itemCategory','name','publicId','csVisible','buyPrice','sellPrice','rank','maxStack','description','effect','unlockAreaKey','unlockOrder','unlockCondition','unlockFacility','tags','notes'];
  }
  if(itemType === '調合品' && String(row.itemCategory || '').trim() === 'エンチャント'){
    return ['itemType','itemCategory','name','publicId','csVisible','buyPrice','sellPrice','rank','equipSlot','maxStack','target','element','enchantTarget','enchantEffectType','enchantValue','enchantDuration','enchantRounds','enchantStackRule','description','effect','unlockAreaKey','unlockOrder','unlockCondition','unlockFacility','tags','notes'];
  }
  const common=['itemType','itemCategory','name','publicId','csVisible','buyPrice','sellPrice','rank','equipSlot','skill','power','maxStack','offhandBonus','reloadTurns','spellSlots','modifiers','upgradeLimit','upgradeMaterialMinRank','mpCost','target','checkType','element','description','effect'];
  if(['武器','防具','盾','装飾品'].includes(itemType)) common.push('equipmentEffects');
  if(['武器','防具','盾'].includes(itemType) || parseAdminNamedProcessingOptions(row.namedProcessingOptions).length) common.push('namedProcessingOptions');
  return [...common,'unlockAreaKey','unlockOrder','unlockCondition','unlockFacility','tags','notes'];
}
function recipeFormFields(row){
  const craftType = String(row.craftType || activeRecipeCraftType() || '調合').trim();
  if(craftType === '武器派生'){
    return ['name','publicId','rank','recipePrice','recipeSellPrice','recipeSource','price','craftSkill','craftType','baseItem','branchType','resultItem','resultKind','resultCount','requiredMaterials','difficulty','description','effect','unlockAreaKey','unlockOrder','unlockCondition','unlockFacility','tags','notes'];
  }
  return ['name','publicId','rank','recipePrice','recipeSellPrice','recipeSource','price','craftSkill','craftType','category','resultItem','resultKind','resultCount','requiredMaterials','difficulty','description','effect','unlockAreaKey','unlockOrder','unlockCondition','unlockFacility','tags','notes'];
}
function formFieldsFor(key,row){
  if(key==='items') return [...new Set(['id','updatedAt', ...itemFormFields(row)])].filter(f=>SCHEMA[key].includes(f));
  if(key==='recipes') return [...new Set(['id','updatedAt', ...recipeFormFields(row)])].filter(f=>SCHEMA[key].includes(f));
  const primary = FORM_PRIMARY_FIELDS[key] || [];
  const hiddenButEditable = ['id','updatedAt'].filter(f=>SCHEMA[key].includes(f));
  const unusedManagementFields = new Set(['ownerKey','createdBy']);
  return [...new Set([...hiddenButEditable, ...primary, ...SCHEMA[key].filter(f=>!unusedManagementFields.has(f) && !hiddenButEditable.includes(f) && !primary.includes(f))])];
}
function openForm(key, idx=null, mode='new', defaultDataKind='', defaultItemType=''){
  formState={key,idx,mode,defaultDataKind,defaultItemType};
  const row = idx===null ? newBlankRow(key) : {...state[key][idx]};
  if(key==='recipes' && idx===null && defaultDataKind){ row.craftType = defaultDataKind; }
  if(key==='items' && !row.dataKind) row.dataKind = defaultDataKind || 'アイテム';
  if(key==='items' && row.dataKind !== '素材' && !String(row.itemType || '').trim()) row.itemType = defaultItemType || (currentItemTypeView==='全て'?'':currentItemTypeView) || '';
  if(key==='items' && row.dataKind !== '素材' && !String(row.csVisible || '').trim()) row.csVisible = 'TRUE';
  row.ownerKey='';
  row.createdBy='';
  row.updatedAt = row.updatedAt || nowIso();
  const title = `${labelKey(key)} ${idx===null?'新規登録':'編集'}`;
  $('modalTitle').textContent = title;
  $('modalSubtitle').textContent = key==='items'
    ? (row.dataKind==='素材' ? '素材用の項目だけを表示しています。' : 'アイテム用の項目だけを表示しています。')
    : (key==='recipes'
      ? (String(row.craftType || activeRecipeCraftType()).trim()==='武器派生' ? '自作には対応レシピが必要です。施設依頼ではレシピ不要です。' : '製作区分ごとに必要な項目だけを表示しています。')
      : (idx===null ? 'フォームに入力して「保存」または「保存してDB反映」を押してください。' : '内容を変更して登録すると、一覧に反映されます。'));
  const fields = formFieldsFor(key,row);
  const quickCount = key==='items' ? 6 : 4;
  $('formQuickArea').innerHTML = fields.slice(0,quickCount).map(f=>buildFieldInput(key,f,row[f],row)).join('');
  $('editForm').innerHTML = fields.slice(quickCount).map(f=>buildFieldInput(key,f,row[f],row)).join('');
  $('formDangerZone').classList.toggle('hidden', idx===null);
  $('editModal').classList.remove('hidden');
  $('editModal').setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  syncAllCheckBuilders($('editModal'));
  setTimeout(()=>{ const first = $('editModal').querySelector('[data-form-field="name"], [data-form-field="dataKind"], input, select, textarea'); if(first) first.focus(); }, 30);
}
function rerenderCurrentForm(){
  const snap=currentFormRowSnapshot();
  openForm(formState.key, formState.idx, formState.mode, snap.dataKind || formState.defaultDataKind || '', snap.itemType || formState.defaultItemType || '');
  $('editModal')?.querySelectorAll('[data-form-field]').forEach(el=>{ if(snap[el.dataset.formField] !== undefined) el.value = snap[el.dataset.formField]; });
}
function closeForm(){
  $('editModal').classList.add('hidden'); $('editModal').setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  formState={key:null,idx:null,mode:'new',defaultDataKind:''};
}
function allRegistrationIds(){
  return new Set(['items','spells','recipes','skills'].flatMap(k=>(state[k]||[]).map(r=>String(r.publicId||'').trim().toUpperCase())).filter(Boolean));
}
function generateRegistrationId(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const used=allRegistrationIds();
  for(let attempt=0;attempt<100;attempt++){
    const bytes=new Uint8Array(8);
    if(window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else for(let i=0;i<bytes.length;i++) bytes[i]=Math.floor(Math.random()*256);
    const token=[...bytes].map(v=>chars[v%chars.length]).join('');
    const id=`RCA-${token.slice(0,4)}-${token.slice(4,8)}`;
    if(!used.has(id)) return id;
  }
  const fallback=Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g,'').padEnd(8,'X').slice(-8);
  return `RCA-${fallback.slice(0,4)}-${fallback.slice(4,8)}`;
}
function registrationIdConflict(key,row,pid){
  const target=String(pid||'').trim().toUpperCase();
  if(!target) return false;
  return ['items','spells','recipes','skills'].some(section=>(state[section]||[]).some(other=>{
    if(section===key && String(other.id||'')===String(row.id||'')) return false;
    return String(other.publicId||'').trim().toUpperCase()===target;
  }));
}
function ensurePlayerFacingPublicId(key,row){
  if(!['items','spells','recipes','skills'].includes(key)) return row;
  let pid=String(row.publicId||'').trim().toUpperCase();
  if(!/^RCA-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(pid) || registrationIdConflict(key,row,pid)) pid=generateRegistrationId();
  row.publicId=pid;
  return row;
}
