function renderMonsterDropCards(value){
  const rows = parseMonsterDrops(value);
  if(!rows.length) return '<div class="monster-empty-note">ドロップは未登録です。</div>';
  return `<div class="monster-mini-table">${rows.map(r=>{
    const material = materialDetailForDrop(r);
    const name = r.itemName || r.itemId || material?.name || '素材名未設定';
    const chips = [r.materialType || material?.materialType, r.materialCategory || material?.materialCategory, material?.rank ? playerRankLabel(material.rank) : '', material?.sellPrice ? `売値:${material.sellPrice}G` : '', r.rate ? `確率:${r.rate}` : '', r.count ? `個数:${r.count}` : ''].filter(Boolean);
    const idText = r.itemId && r.itemId !== r.itemName ? `<div class="monster-drop-sub">ID: ${escapeHtml(r.itemId)}</div>` : '';
    const detailHtml = dropMaterialDetailHtml(material);
    return `<div class="monster-drop-card"><div class="monster-drop-main"><span>${escapeHtml(name)}</span>${chips.map(c=>`<span class="monster-badge">${escapeHtml(c)}</span>`).join('')}</div>${idText}${detailHtml}</div>`;
  }).join('')}</div>`;
}

function compactMonsterText(value){
  return String(value ?? '').trim();
}
function numberOrString(value, fallback=0){
  const raw = String(value ?? '').trim();
  if(!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : raw;
}
function monsterAffinityParamEntries(row={}){
  const entries = [
    ['物', row.physicalAffinity], ['火', row.fireAffinity], ['水', row.waterAffinity], ['風', row.windAffinity],
    ['雷', row.thunderAffinity], ['光', row.lightAffinity], ['闇', row.darkAffinity], ['無', row.neutralAffinity]
  ];
  return entries.map(([label,value])=>({label, value: compactMonsterText(value || '-')})).filter(p=>p.value !== '');
}
function monsterStatusEntry(label, value, maxValue){
  const v = numberOrString(value, 0);
  const out = {label, value:v};
  if(maxValue !== undefined) out.max = numberOrString(maxValue, v);
  return out;
}
function monsterMemo(row={}){
  // ココフォリア駒のキャラクターメモは、耐性・説明・ドロップなどのネタバレになりやすい情報を入れない。
  // ドロップや詳細説明は管理HTML側で確認する。
  return '';
}
const MONSTER_STATUS_DEFINITIONS = RAMonsterRules.definitions;
const MONSTER_STATUS_PATTERNS = {
  '毒状態': /毒状態/,
  '汚染': /汚染(?:状態|I|II|III|Ⅰ|Ⅱ|Ⅲ|を|が|へ)/,
  '呪い': /呪い(?:状態|I|II|III|Ⅰ|Ⅱ|Ⅲ|を|が|へ)/
};
function monsterStatusNotesFromText(text=''){return RAMonsterRules.notesFromText(text);}
function monsterActionStatusNotes(action={}){
  return monsterStatusNotesFromText(`${action.name || ''} ${action.effect || ''}`);
}
function monsterRowStatusNotes(row={}){
  const actions = parseMonsterActions(row.actions || '');
  const source = [row.passiveName || '', row.passiveEffect || '', ...actions.flatMap(action=>[action.name || '', action.effect || ''])].join(' ');
  return [...new Set(monsterStatusNotesFromText(source))];
}
function monsterStatusNotesHtml(row={}){
  const notes = monsterRowStatusNotes(row);
  if(!notes.length) return '';
  return `<section class="monster-section"><h4>状態・フィールド</h4><div class="monster-mini-table">${notes.map(note=>`<div class="monster-action-card"><div class="monster-action-sub">${escapeHtml(note)}</div></div>`).join('')}</div></section>`;
}
function monsterActionRange(action={}){ return normalizeMonsterActionRange(action); }
function monsterActionTarget(action={}){
  return compactMonsterText(action.target) || '対象未設定';
}
function monsterActionCheckCommand(row={}, action={}){
  const parsed = parseCheckType(action.checkType || '');
  if(!parsed.raw || parsed.left === 'なし') return '';
  const right = parsed.right || '目標値';
  const baseValue = normalizeMonsterActionBaseValue(action.baseValue);
  if(baseValue==='') return '';
  return `2D6+${baseValue}+{補正}>=${right} 【${action.name || '魔物行動'}】`;
}
function monsterDamageCommand(action={}){
  let power = compactMonsterText(action.power);
  if(!power || power === 'なし' || power === '-') return '';
  const actionType = normalizeMonsterActionType(action);
  const effect = String(action.effect || '');
  const isRecovery = actionType === '回復' || /回復$/.test(power) || (['補助','防御'].includes(actionType) && /HP.*回復/.test(effect));
  if(isRecovery){
    power = power.replace(/回復$/,'');
    return `${power} 【${action.name || '魔物行動'}・回復】`;
  }
  return `${power} 【${action.name || '魔物行動'}ダメージ】`;
}
function monsterChatPalette(row={}){
  const name = compactMonsterText(row.name) || '名称未設定の魔物';
  const actions = parseMonsterActions(row.actions);
  const lines = [];
  if(row.pullRule) lines.push(`// 引き寄せ：${row.pullRule}`);
  const behaviorAI = compactMonsterText(row.behaviorAI);
  if(behaviorAI){
    lines.push('// 【固有行動AI】');
    lines.push(`// ${behaviorAI}`);
  }
  if(row.passiveName || row.passiveEffect){
    lines.push(`// 【固有パッシブ：${row.passiveName || '名称未設定'}】`);
    if(row.passiveEffect) lines.push(`// ${compactMonsterText(row.passiveEffect, 500)}`);
  }
  if(actions.length){
    const actionNames = actions.map(a=>compactMonsterText(a.name) || '名称未設定').filter(Boolean);
    const isConditionalAction = action=>/(のみ使用|HPが半分以下|HP半分以下|次の行動で|戦闘中1回|1戦闘1回)/.test(`${action.effect || ''} ${action.power || ''}`);
    const normalActionNames = actions.filter(a=>!isConditionalAction(a)).map(a=>compactMonsterText(a.name) || '名称未設定').filter(Boolean);
    if(normalActionNames.length && normalActionNames.length < actionNames.length) lines.push(`choice[${normalActionNames.join(',')}]`);
    if(actionNames.length) lines.push(`choice[${actionNames.join(',')}]`);
    lines.push(`// ${name}`);
    actions.forEach(action=>{
      const actionName = action.name || '魔物行動';
      const range = monsterActionRange(action);
      const target = monsterActionTarget(action);
      const element = compactMonsterText(action.element);
      const check = monsterActionCheckCommand(row, action);
      const damage = monsterDamageCommand(action);
      const effect = compactMonsterText(action.effect);
      const actionType = normalizeMonsterActionType(action);
      lines.push(`// 【${actionName}】 種別：${actionType}／距離：${range}／対象：${target}${element ? `／属性：${element}` : ''}`);
      if(check) lines.push(check);
      if(damage){ lines.push(damage); if(damage.includes('・回復】')){ const alt=effect.match(/代わりに([0-9D+]+)回復/); if(alt) lines.push(`${alt[1]} 【${actionName}・条件成立時の回復】`); }}
      if(effect) lines.push(`// 効果：${effect}`);
      if(!check && !damage && !effect) lines.push(`// ${actionName}`);
    });
    const statusNotes = monsterRowStatusNotes(row);
    if(statusNotes.length){
      lines.push('// 【状態・フィールド】');
      statusNotes.forEach(note=>lines.push(`// ${note}`));
      lines.push(...RAMonsterRules.fieldCommands([row.passiveEffect||'',...actions.map(a=>a.effect||'')].join(' ')));
    }
  }else{
    lines.push(`// ${name}`);
    lines.push('// 行動は未登録です。');
  }
  return lines.join('\n');
}
function cocofoliaMonsterToken(row={}){
  const name = compactMonsterText(row.name) || '名称未設定の魔物';
  const hp = compactMonsterText(row.hp);
  const mp = compactMonsterText(row.mp);
  const statuses = [];
  if(hp) statuses.push(monsterStatusEntry('HP', hp, hp));
  if(mp) statuses.push(monsterStatusEntry('MP', mp, mp));
  statuses.push(monsterStatusEntry('補正', 0, 0));
  statuses.push(monsterStatusEntry('回避', row.evasionValue, row.evasionValue));
  statuses.push(monsterStatusEntry('抵抗', row.resistValue, row.resistValue));
  statuses.push(monsterStatusEntry('防御', row.defenseValue, row.defenseValue));
  const params = monsterAffinityParamEntries(row);
  return {
    kind:'character',
    data:{
      name,
      memo: monsterMemo(row),
      initiative: numberOrString(row.initiative, 0),
      status: statuses,
      statuses: statuses,
      params,
      commands: monsterChatPalette(row),
      active: true,
      secret: false,
      invisible: false,
      hideStatus: false
    }
  };
}
async function copyAdminTextDirect(text){
  if(!text){ toast('コピーする内容がありません', 'warn'); return false; }
  try{
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
    }else{
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if(!ok) throw new Error('copy failed');
    }
    return true;
  }catch(e){
    toast('クリップボードへのコピーに失敗しました。ブラウザの権限設定を確認してください。', 'warn');
    return false;
  }
}
async function outputMonsterToken(idx){
  const row = (state.monsters || [])[idx];
  if(!row){ toast('魔物データが見つかりません', 'error'); return; }
  const text = JSON.stringify(cocofoliaMonsterToken(row), null, 2);
  if(await copyAdminTextDirect(text)) toast(`${row.name || '魔物'}の駒をコピーしました`);
}
async function outputMonsterPalette(idx){
  const row = (state.monsters || [])[idx];
  if(!row){ toast('魔物データが見つかりません', 'error'); return; }
  if(await copyAdminTextDirect(monsterChatPalette(row))) toast(`${row.name || '魔物'}のチャットパレットをコピーしました`);
}

function monsterCardHtml(row, idx){
  const editKey = 'monsters';
  const title = monsterFieldValue(row, 'name', '名称未設定の魔物');
  const id = monsterFieldValue(row, 'id', '');
  const badges = [
    monsterBadge('種別', row.monsterType),
    monsterBadge('特性', row.monsterTraits),
    monsterBadge('ランク', playerRankLabel(row.rank)),
    monsterBadge('引き寄せ', row.pullRule || '可'),
    monsterBadge('固定選出', row.fixedActionNames),
    monsterBadge('パッシブ専用', row.passiveOnlyActionNames),
    monsterBadge('候補条件', row.actionSelectionRules)
  ].filter(Boolean).join('');
  const statHtml = [
    monsterStat('HP', row.hp), monsterStat('MP', row.mp), monsterStat('回避', row.evasionValue),
    monsterStat('抵抗', row.resistValue), monsterStat('防御', row.defenseValue), monsterStat('先制', row.initiative), monsterStat('遭遇', row.encounterValue), monsterStat('解体', row.dismantleDifficulty)
  ].join('');
  const affinityHtml = [
    ['物', row.physicalAffinity], ['火', row.fireAffinity], ['水', row.waterAffinity], ['風', row.windAffinity],
    ['雷', row.thunderAffinity], ['光', row.lightAffinity], ['闇', row.darkAffinity], ['無', row.neutralAffinity]
  ].map(([label,value])=>monsterAffinity(label,value)).join('');
  return `<details class="monster-card">
    <summary>
      <div class="monster-card-head">
        <div class="monster-title"><b>${escapeHtml(title)}</b>${id ? `<span class="monster-id">${escapeHtml(id)}</span>` : ''}</div>
        <div class="monster-card-actions">
          <button type="button" class="secondary" data-row-save="${editKey}:${idx}">個別DB登録</button>
          <button type="button" class="danger" data-row-replace="${editKey}:${idx}">個別DB置換</button>
          <button type="button" class="secondary" data-monster-token="${idx}">駒コピー</button>
          <button type="button" class="ghost" data-monster-palette="${idx}">パレットコピー</button>
          <button type="button" class="ghost" data-edit-row="${editKey}:${idx}">編集</button>
          <button type="button" class="ghost" data-dup="${editKey}:${idx}">複製</button>
          <button type="button" class="danger" data-del="${editKey}:${idx}">削除</button>
        </div>
      </div>
      <div class="monster-badges">${badges || '<span class="monster-badge">分類未設定</span>'}</div>
      <div class="monster-card-summary">${statHtml}</div>
    </summary>
    <div class="monster-card-body">
      <section class="monster-section"><h4>耐性</h4><div class="monster-affinities">${affinityHtml}</div></section>
      ${row.passiveName || row.passiveEffect ? `<section class="monster-section"><h4>固有パッシブ</h4><div class="monster-line-card"><b>${escapeHtml(row.passiveName || '名称未設定')}</b><span>${escapeHtml(row.passiveEffect || '効果未設定')}</span></div></section>` : ''}
      <section class="monster-section"><h4>行動</h4>${renderMonsterActionCards(row.actions)}</section>
      ${monsterStatusNotesHtml(row)}
      <section class="monster-section"><h4>ドロップ</h4>${renderMonsterDropCards(row.drops)}</section>
      ${monsterTextSection('習性', row.habit)}
      ${monsterTextSection('説明', row.description)}
      ${monsterTextSection('メモ', row.notes)}
    </div>
  </details>`;
}

function monsterNameTokens(value){
  return String(value || '').split(/[、,，\n\/／]+/).map(v=>v.trim()).filter(Boolean);
}
function monsterFirstAppearanceMap(){
  const map=new Map();
  (state.exploration_areas || []).forEach((area,index)=>{
    monsterNameTokens(area.mainMonsters).forEach(name=>{
      if(!map.has(name)) map.set(name,{name:area.name || area.areaName || 'エリア名未設定',order:index});
    });
  });
  return map;
}
function monsterIsAreaBoss(row={}){
  return String(row.monsterTraits || '').split(/[,、，]/).map(v=>v.trim()).filter(Boolean).includes('ボス');
}
function groupMonsterRowsByFirstArea(rows){
  const firstMap=monsterFirstAppearanceMap();
  const groups=new Map();
  rows.forEach(item=>{
    const info=firstMap.get(String(item.row?.name || '').trim()) || {name:'初回出現エリア未設定',order:9999};
    const key=`${info.order}:${info.name}`;
    if(!groups.has(key)) groups.set(key,{areaName:info.name,order:info.order,items:[]});
    groups.get(key).items.push(item);
  });
  const out=[...groups.values()].sort((a,b)=>a.order-b.order || a.areaName.localeCompare(b.areaName,'ja'));
  out.forEach(group=>{
    group.items=group.items.map((item,pos)=>({item,pos})).sort((a,b)=>{
      const bossDiff=Number(monsterIsAreaBoss(a.item.row))-Number(monsterIsAreaBoss(b.item.row));
      return bossDiff || a.pos-b.pos;
    }).map(x=>x.item);
  });
  return out;
}

function renderMonsterCardsTable(key){
  renderFilterControls(key);
  const table=$('table-'+key);
  if(!table) return;
  table.className='card-table';
  const filter=($('filter-'+key)?.value||'').toLowerCase().trim();
  const totalRows=indexedRowsForTable(key);
  let rows=totalRows.filter(({row})=>{
    const textOk=rowMatchesTextQuery(row,filter,key);
    return textOk && rowMatchesAdvancedFilters(key,row);
  });
  const {sortField, sortDir}=tableUiState[key];
  if(sortField){
    rows.sort((a,b)=>{
      const c=compareValues(a.row[sortField], b.row[sortField]);
      return sortDir==='asc' ? c : -c;
    });
  }
  const filteredCount=rows.length;
  rows=paginateTableRows(key,rows,totalRows.length);
  const count=$('filtered-count-'+key);
  if(count) count.textContent = `表示 ${rows.length} / ${filteredCount}（全${totalRows.length}）`;
  const sortNote = sortField ? `初回出現エリア別 / 各エリア内: ${escapeHtml(LABELS[sortField]||sortField)} ${sortDir==='asc'?'昇順':'降順'}` : '初回出現エリア順';
  const groups=groupMonsterRowsByFirstArea(rows);
  const cards = groups.length ? groups.map(group=>`<section class="monster-area-group"><div class="monster-area-head"><b>${escapeHtml(group.areaName)}</b><span>${group.items.length}体</span></div><div class="monster-card-list">${group.items.map(({row,idx})=>monsterCardHtml(row,idx)).join('')}</div></section>`).join('') : '<div class="monster-empty-note">条件に一致する魔物がありません。</div>';
  table.innerHTML = `<tbody><tr><td class="monster-list-cell"><div class="monster-area-groups" aria-label="初回出現エリア別魔物一覧">${cards}</div></td></tr></tbody>`;
  const bar=$('advanced-filter-'+key);
  if(bar){
    const status=bar.querySelector('.filter-status');
    if(status && !status.querySelector('[data-monster-card-view]')){
      status.insertAdjacentHTML('beforeend', `<span class="pill" data-monster-card-view>カード表示 / ソート: ${sortNote}</span>`);
    }
  }
}


function compactText(value, limit=80){
  const s = String(value || '').replace(/\s+/g, ' ').trim();
  return s.length > limit ? s.slice(0, limit) + '…' : s;
}
function questListFixedEventHtml(text){
  const rows = parseQuestFixedEventsEditor(text || '');
  if(!rows.length) return '<div class="muted small">固定イベントなし</div>';
  return `<div class="monster-line-list">${rows.map((r,i)=>{
    const p = String(r.progress || '').trim() || '未設定%';
    const t = String(r.title || '').trim() || `固定イベント${i+1}`;
    const d = compactText(r.detail || '', 120) || '内容未入力';
    return `<div class="monster-line-card"><b>${escapeHtml(p)} ${escapeHtml(t)}</b><span>${escapeHtml(d)}</span></div>`;
  }).join('')}</div>`;
}
function questCardHtml(row, idx){
  const title = row.name || '名称未設定のクエスト';
  const id = row.id || '';
  const fixedCount = parseQuestFixedEventsEditor(row.fixedEvents || '').length;
  const important=String(row.questCategory||'').trim()==='重要';
  const location=String(row.questLocation||((row.requestKind==='拠点内依頼'||row.requestKind==='納品依頼')?'拠点':row.areaName)||'').trim();
  const badges = [monsterBadge('分類', important?'重要クエスト':row.requestKind), monsterBadge('内容', row.questType), monsterBadge('ランク', playerRankLabel(row.rank)), monsterBadge('実施場所', location), Number(row.battleRoundLimit)>0?monsterBadge('戦闘制限',`${row.battleRoundLimit}R`):''].filter(Boolean).join('');
  const summary = [
    monsterStat('進行', row.progressStep || '25%'),
    monsterStat('固定イベント', `${fixedCount}件`),
    monsterStat('報酬金', row.rewardMoney),
    monsterStat('ボス/達成', row.bossMonster)
  ].join('');
  return `<details class="monster-card">
    <summary>
      <div class="monster-card-head">
        <div class="monster-title"><b>${escapeHtml(title)}</b>${id ? `<span class="monster-id">${escapeHtml(id)}</span>` : ''}</div>
        <div class="monster-card-actions">
          <button type="button" class="secondary" data-row-save="quests:${idx}">個別DB登録</button><button type="button" class="danger" data-row-replace="quests:${idx}">個別DB置換</button><button type="button" class="ghost" data-edit-row="quests:${idx}">編集</button>
          <button type="button" class="ghost" data-dup="quests:${idx}">複製</button>
          <button type="button" class="danger" data-del="quests:${idx}">削除</button>
        </div>
      </div>
      <div class="monster-badges">${badges || '<span class="monster-badge">分類未設定</span>'}</div>
      <div class="monster-card-summary">${summary}</div>
    </summary>
    <div class="monster-card-body">
      <section class="monster-section"><h4>固定イベント</h4>${questListFixedEventHtml(row.fixedEvents)}</section>
      ${monsterTextSection('クリア条件', row.clearCondition)}
      ${monsterTextSection('報酬アイテム', row.rewardItems)}
      ${monsterTextSection('説明', row.description)}
      ${monsterTextSection('メモ', row.notes)}
    </div>
  </details>`;
}
function renderQuestCardsTable(key){
  renderFilterControls(key);
  const table=$('table-'+key); if(!table) return;
  table.className='card-table';
  const filter=($('filter-'+key)?.value||'').toLowerCase().trim();
  const totalRows=indexedRowsForTable(key);
  let rows=totalRows.filter(({row})=>{
    const textOk=rowMatchesTextQuery(row,filter,key);
    return textOk && rowMatchesAdvancedFilters(key,row);
  });
  const {sortField, sortDir}=tableUiState[key];
  if(sortField){ rows.sort((a,b)=>{const c=compareValues(a.row[sortField], b.row[sortField]); return sortDir==='asc'?c:-c;}); }
  const filteredCount=rows.length;
  rows=paginateTableRows(key,rows,totalRows.length);
  const count=$('filtered-count-'+key); if(count) count.textContent=`表示 ${rows.length} / ${filteredCount}（全${totalRows.length}）`;
  const cards = rows.length ? rows.map(({row,idx})=>questCardHtml(row,idx)).join('') : '<div class="monster-empty-note">条件に一致するクエストがありません。</div>';
  table.innerHTML = `<tbody><tr><td class="monster-list-cell"><div class="monster-card-list" aria-label="クエスト一覧">${cards}</div></td></tr></tbody>`;
}
function adminEventEncounterText(row={}){
  const formation = String(row.encounterFormation || '').trim();
  const composition = String(row.encounterComposition || '').trim();
  return formation || composition || '';
}
function adminEventConditionText(row={}){
  const type = String(row.conditionType || '').trim();
  const value = String(row.conditionValue || '').trim();
  if(!type || type === 'なし') return 'なし';
  return value ? `${type}：${value}` : type;
}
function adminIsBaseRandomEvent(row={}){
  const eventType=String(row.eventType||'').trim();
  const conditionType=String(row.conditionType||'').trim()||'なし';
  if(eventType==='宿屋の噂') return false;
  if(conditionType==='クエスト固有' || eventType.includes('クエスト固有')) return false;
  return conditionType==='なし';
}
function eventRowCardHtml(row, idx){
  const title = row.eventName || '名称未設定イベント';
  const check = row.checkType ? `${row.checkType}${row.targetValue ? ` / 目標値:${row.targetValue}` : ''}` : '判定なし';
  const badges = [monsterBadge('種別', row.eventType), monsterBadge('前提', adminEventConditionText(row)), row.timeSlots?monsterBadge('時間',row.timeSlots):'', row.rumorScope?monsterBadge('噂範囲',row.rumorScope):'', monsterBadge('配置', adminEventEncounterText(row)), monsterBadge('判定', check)].filter(Boolean).join('');
  return `<details class="monster-card">
    <summary>
      <div class="monster-card-head">
        <div class="monster-title"><b>${escapeHtml(title)}</b>${row.id ? `<span class="monster-id">${escapeHtml(row.id)}</span>` : ''}</div>
        <div class="monster-card-actions">
          <button type="button" class="secondary" data-row-save="event_tables:${idx}">個別DB登録</button><button type="button" class="danger" data-row-replace="event_tables:${idx}">個別DB置換</button><button type="button" class="ghost" data-edit-row="event_tables:${idx}">編集</button>
          <button type="button" class="ghost" data-dup="event_tables:${idx}">複製</button>
          <button type="button" class="danger" data-del="event_tables:${idx}">削除</button>
        </div>
      </div>
      <div class="monster-badges">${badges || '<span class="monster-badge">イベント</span>'}</div>
      <div class="monster-card-summary">
        ${monsterStat('表ID', row.tableId)}${monsterStat('エリア', row.areaName)}${monsterStat('前提条件', adminEventConditionText(row))}${monsterStat('目標値', row.targetValue)}${monsterStat('宝箱表', row.treasureTableId)}
      </div>
    </summary>
    <div class="monster-card-body">
      ${monsterTextSection('結果', row.result)}
      ${monsterTextSection('効果/補足', row.progressEffect)}
      ${monsterTextSection('宝箱表ID', row.treasureTableId)}
      ${monsterTextSection('メモ', row.notes)}
    </div>
  </details>`;
}
function renderEventAreaCardsTable(key){
  renderFilterControls(key);
  const table=$('table-'+key); if(!table) return;
  table.className='card-table';
  const filter=($('filter-'+key)?.value||'').toLowerCase().trim();
  const totalRows=indexedRowsForTable(key);
  let rows=totalRows.filter(({row})=>{
    const textOk=rowMatchesTextQuery(row,filter,key);
    return textOk && rowMatchesAdvancedFilters(key,row);
  });
  const {sortField, sortDir}=tableUiState[key];
  if(sortField){ rows.sort((a,b)=>{const c=compareValues(a.row[sortField], b.row[sortField]); return sortDir==='asc'?c:-c;}); }
  const filteredCount=rows.length;
  rows=paginateTableRows(key,rows,totalRows.length);
  const count=$('filtered-count-'+key); if(count) count.textContent=`表示 ${rows.length} / ${filteredCount}（全${totalRows.length}）`;
  const groups = new Map();
  rows.forEach(item=>{
    const row=item.row;
    const gkey = `${row.areaName || 'エリア未設定'} / ${row.tableId || '表ID未設定'}`;
    if(!groups.has(gkey)) groups.set(gkey, []);
    groups.get(gkey).push(item);
  });
  const html = rows.length ? [...groups.entries()].map(([g,items])=>{
    const cards = items.map(({row,idx})=>eventRowCardHtml(row,idx)).join('');
    const randomCount=items.filter(({row})=>adminIsBaseRandomEvent(row)).length;
    const auxiliaryCount=items.length-randomCount;
    const countText=`通常ランダム候補 ${randomCount}件${auxiliaryCount?` / 補助データ ${auxiliaryCount}件`:''}`;
    return `<details class="monster-card" open><summary><div class="monster-card-head"><div class="monster-title"><b>${escapeHtml(g)}</b><span class="monster-id">${escapeHtml(countText)}</span></div><div class="monster-card-actions"><button type="button" class="secondary" data-add="event_tables">イベント追加</button></div></div><div class="monster-badges"><span class="monster-badge">通常ランダム候補から均等抽選</span></div></summary><div class="monster-card-body"><div class="monster-card-list">${cards}</div></div></details>`;
  }).join('') : '<div class="monster-empty-note">条件に一致するイベントがありません。</div>';
  table.innerHTML=`<tbody><tr><td class="monster-list-cell"><div class="monster-card-list" aria-label="エリア別イベント一覧">${html}</div></td></tr></tbody>`;
}

function parseAdminEquipmentEffects(value){
  if(Array.isArray(value)) return value.map(v=>normalizeAdminEquipmentEffect(v)).filter(Boolean);
  if(value && typeof value==='object') return [normalizeAdminEquipmentEffect(value)].filter(Boolean);
  const raw=String(value??'').trim();
  if(!raw) return [];
  try{
    const parsed=JSON.parse(raw);
    const rows=Array.isArray(parsed)?parsed:(parsed&&typeof parsed==='object'?[parsed]:[]);
    return rows.map(v=>normalizeAdminEquipmentEffect(v)).filter(Boolean);
  }catch(_){ return []; }
}
function normalizeAdminEquipmentEffect(value={}){
  if(!value || typeof value!=='object') return null;
  const name=String(value.name??'').trim();
  const summary=String(value.summary??'').trim();
  const detail=String(value.detail??value.effect??'').trim();
  if(!name && !summary && !detail) return null;
  return {name,summary,detail};
}
function adminEquipmentEffectsDisplayText(value){
  const effects=parseAdminEquipmentEffects(value);
  if(!effects.length) return '';
  return effects.map(e=>`《${e.name||'名称未設定'}》 ${e.summary||e.detail||'詳細未設定'}`).join(' / ');
}
function equipmentEffectsLegacyText(value){
  return parseAdminEquipmentEffects(value).map(e=>String(e.detail||'').trim()).filter(Boolean).join('');
}
function parseAdminNamedProcessingOptions(value){
  if(Array.isArray(value)) return value.filter(v=>v&&typeof v==='object');
  if(value && typeof value==='object') return [value];
  const raw=String(value??'').trim();
  if(!raw) return [];
  try{
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(v=>v&&typeof v==='object') : (parsed&&typeof parsed==='object'?[parsed]:[]);
  }catch(_){ return []; }
}
function adminNamedProcessingDisplayText(value){
  const options=parseAdminNamedProcessingOptions(value);
  if(!options.length) return '';
  return options.map(o=>{
    const named=String(o.namedMonster||o.name||'').trim();
    const before=String(o.fullBefore||o.before||'').trim();
    const after=String(o.fullAfter||o.after||'').trim();
    const req=String(o.requiredMaterials||'').trim();
    return ['異名加工可能', named, (before||after)?`${before||'未設定'} → ${after||'未設定'}`:'', req?`必要素材: ${req}`:''].filter(Boolean).join(' / ');
  }).join(' | ');
}
function displayFieldValue(row={}, field='', key=''){
  if(field === 'modifiers') return adminModifierDisplayText(row.modifiers || '');
  if(field === 'equipmentEffects') return adminEquipmentEffectsDisplayText(row.equipmentEffects);
  if(field === 'intrinsicEffects') return adminEquipmentEffectsDisplayText(row.intrinsicEffects);
  if(field === 'namedProcessingOptions') return adminNamedProcessingDisplayText(row.namedProcessingOptions);
  if(field==='rank' && isStructuredNumericRankRecord(baseKeyForTable(key),row)) return adminRankLabel(row.rank);
  if(baseKeyForTable(key)==='material_ranks' && field==='name') return adminRankLabel(row.name);
  if(['toolRank','upgradeMaterialMinRank','guaranteeUpgradeMaxRank'].includes(field) && String(row[field]??'').trim()) return ['toolRank','guaranteeUpgradeMaxRank'].includes(field) ? `${playerRankLabel(row[field])}以下` : adminRankLabel(row[field]);
  if(isStructuredNumericSubRank(baseKeyForTable(key),field)) return adminRankLabel(row[field]);
  const base=baseKeyForTable(key);
  if(base==='items' && field==='buyPrice'){const raw=String(row[field]??'').trim();return raw&&Number(raw)>0?`${raw}G`:'購入不可';}
  if(base==='items' && field==='sellPrice'){const raw=String(row[field]??'').trim();return raw&&Number(raw)!==0?`${raw}G`:'売却不可';}
  if(base==='recipes' && field==='recipePrice'){const raw=String(row[field]??'').trim();return raw&&Number(raw)>0?`${raw}G`:'購入不可';}
  if(base==='recipes' && field==='recipeSellPrice'){const raw=String(row[field]??'').trim();return raw&&Number(raw)!==0?`${raw}G`:'売却不可';}
  if(base==='recipes' && field==='price'){const raw=String(row[field]??'').trim();return raw?`${raw}G`:'';}
  return String(row[field] ?? '').trim();
}
function recordFieldHtml(row={}, field='', key=''){
  const raw = displayFieldValue(row, field, key);
  const baseKey=baseKeyForTable(key);
  const isMonsterMaterialSource = field==='source' && (baseKey==='materials' || baseKey==='items') && String(row.materialType||'').trim()==='魔物素材';
  const label = isMonsterMaterialSource ? 'ドロップ元' : fieldLabelFor(key, field);
  const value = raw.trim() || '未設定';
  const emptyClass = raw.trim() ? '' : ' record-field-empty';
  return `<div class="record-field${emptyClass}"><span class="record-field-label">${escapeHtml(label)}</span><div class="record-field-value">${escapeHtml(value)}</div></div>`;
}
function recordCardTitle(row={}, key=''){
  return row.name || row.eventName || row.resultItem || row.tableId || row.id || `${labelKey(key)}未設定`;
}
function recordCardBadges(row={}, key=''){
  const candidates = [
    row.publicId ? ['公開ID', row.publicId] : null,
    row.dataKind ? ['登録種別', row.dataKind] : null,
    row.itemType ? ['種別', row.itemType] : null,
    row.itemCategory ? ['カテゴリ', row.itemCategory] : null,
    row.materialType ? ['素材種別', row.materialType] : null,
    row.materialCategory ? ['素材カテゴリ', row.materialCategory] : null,
    row.craftType ? ['製作', row.craftType] : null,
    row.type ? ['種別', row.type] : null,
    key==='exploration_areas' && row.unlockOrder ? ['解放順', row.unlockOrder] : null,
    key==='exploration_areas' && row.areaType ? ['エリア種別', row.areaType] : null,
    row.rank ? ['ランク', adminRankLabel(row.rank)] : null
  ].filter(Boolean);
  return candidates.map(([label,value])=>monsterBadge(label, value)).join('');
}
function recordCardSummary(row={}, key=''){
  const summaryFieldsByKey = {
    items: ['buyPrice','sellPrice','equipSlot','power','offhandBonus','reloadTurns','spellSlots','modifiers','upgradeLimit','upgradeMaterialMinRank','mpCost','target','checkType','element','maxStack'],
    materials: ['buyPrice','sellPrice','rank','materialType','materialCategory','source','equipmentUpgradeEffect','equipmentUpgradeDetail','maxStack'],
    recipes: ['rank','price','recipePrice','recipeSellPrice','craftType','category','resultItem','resultKind','resultCount','requiredMaterials','difficulty'],
    spells: ['rank','mpCost','target','checkType','element','power','role','scrollPrice','setItem'],
    skills: ['publicId','rank','category','weaponType','timing','cost','ct','drawWeight','balanceTier','enabled'],
    exploration_areas: ['unlockKey','unlockOrder','unlockCondition','areaType','difficulty','progressStep','eventTableId']
  };
  const fields = (summaryFieldsByKey[key] || []).filter(f=>f!=='upgradeLimit' || isUpgradeableEquipmentRow(row,key));
  return fields.filter(f=>displayFieldValue(row, f, key)).slice(0, 12).map(f=>monsterStat(fieldLabelFor(key,f), displayFieldValue(row, f, key))).join('');
}
function recordCardHtml(row={}, idx=0, key=''){
  const editKey = baseKeyForTable(key);
  const title = recordCardTitle(row, key);
  const id = row.id || '';
  const fields = schemaForTable(key).filter(f=>(f!=='limitedRecipePrice')&&(f!=='upgradeLimit' || isUpgradeableEquipmentRow(row,key)));
  const body = `<div class="record-field-grid">${fields.map(f=>recordFieldHtml(row,f,key)).join('')}</div>`;
  const summary = recordCardSummary(row, key);
  const badges = recordCardBadges(row, key);
  return `<details class="monster-card">
    <summary>
      <div class="monster-card-head">
        <div class="monster-title"><b>${escapeHtml(title)}</b>${id ? `<span class="monster-id">${escapeHtml(id)}</span>` : ''}</div>
        <div class="monster-card-actions">
          ${key==='exploration_areas' ? `<button type="button" class="secondary" data-copy-unlock-key="${idx}">解放キーコピー</button>` : `<button type="button" class="secondary" data-copy-card="${key}:${idx}">情報コピー</button>${idOnlyCopyButtonHtml(key,idx)}`}
          <button type="button" class="secondary" data-row-save="${key}:${idx}">個別DB登録</button>
          <button type="button" class="danger" data-row-replace="${key}:${idx}">個別DB置換</button>
          <button type="button" class="ghost" data-edit-row="${editKey}:${idx}">編集</button>
          <button type="button" class="ghost" data-dup="${editKey}:${idx}">複製</button>
          <button type="button" class="danger" data-del="${editKey}:${idx}">削除</button>
        </div>
      </div>
      <div class="monster-badges">${badges || '<span class="monster-badge">登録情報</span>'}</div>
      ${summary ? `<div class="monster-card-summary">${summary}</div>` : ''}
    </summary>
    <div class="monster-card-body">
      <section class="monster-section"><h4>登録情報すべて</h4>${body}</section>
    </div>
  </details>`;
}
function renderRecordCardsTable(key){
  if(key==='recipes') updateRecipeViewUi();
  renderFilterControls(key);
  const table=$('table-'+key);
  if(!table) return;
  table.className='card-table';
  const filter=($('filter-'+key)?.value||'').toLowerCase().trim();
  const totalRows=indexedRowsForTable(key);
  let rows=totalRows.filter(({row})=>{
    const textOk=rowMatchesTextQuery(row,filter,key);
    const recipeOk = key !== 'recipes' || rowMatchesRecipeView(row);
    const itemCategoryOk = key!=='items' || currentItemCategoryView==='全て' || adminItemInternalCategory(row,currentItemTypeView)===currentItemCategoryView;
    const materialCategoryOk = key!=='materials' || currentMaterialCategoryView==='全て' || (String(row.itemType||'').trim()==='食材' ? String(row.itemCategory||'').trim() : String(row.materialCategory||'').trim())===currentMaterialCategoryView;
    return textOk && recipeOk && itemCategoryOk && materialCategoryOk && rowMatchesAdvancedFilters(key,row);
  });
  const {sortField, sortDir}=tableUiState[key];
  if(sortField){
    rows.sort((a,b)=>{
      const c=compareValues(a.row[sortField], b.row[sortField]);
      return sortDir==='asc' ? c : -c;
    });
  }
  const filteredCount=rows.length;
  rows=paginateTableRows(key,rows,totalRows.length);
  const count=$('filtered-count-'+key);
  if(count) count.textContent = `表示 ${rows.length} / ${filteredCount}（全${totalRows.length}）`;
  const cards = rows.length ? rows.map(({row,idx})=>recordCardHtml(row,idx,key)).join('') : `<div class="monster-empty-note">条件に一致する${escapeHtml(labelKey(key))}がありません。</div>`;
  table.innerHTML = `<tbody><tr><td class="monster-list-cell"><div class="monster-card-list" aria-label="${escapeHtml(labelKey(key))}一覧">${cards}</div></td></tr></tbody>`;
}

function renderTable(key){
  if(key==='monsters'){ renderMonsterCardsTable(key); return; }
  if(key==='quests'){ renderQuestCardsTable(key); return; }
  if(key==='event_tables'){ renderEventAreaCardsTable(key); return; }
  if(RECORD_CARD_KEYS.has(key)){ renderRecordCardsTable(key); return; }
  if(key==='recipes') updateRecipeViewUi();
  renderFilterControls(key);
  const table=$('table-'+key);
  if(!table) return;
  table.className='responsive-data-table';
  const filter=($('filter-'+key)?.value||'').toLowerCase().trim();
  const headers=visibleHeadersForTable(key);
  const totalRows=indexedRowsForTable(key);
  let rows=totalRows.filter(({row})=>{
    const textOk=rowMatchesTextQuery(row,filter,key);
    const recipeOk = key !== 'recipes' || rowMatchesRecipeView(row);
    return textOk && recipeOk && rowMatchesAdvancedFilters(key,row);
  });
  const {sortField, sortDir}=tableUiState[key];
  if(sortField){
    rows.sort((a,b)=>{
      const c=compareValues(a.row[sortField], b.row[sortField]);
      return sortDir==='asc' ? c : -c;
    });
  }
  const filteredCount=rows.length;
  rows=paginateTableRows(key,rows,totalRows.length);
  const count=$('filtered-count-'+key);
  if(count) count.textContent = `表示 ${rows.length} / ${filteredCount}（全${totalRows.length}）`;
  let html='<thead><tr><th class="controls">操作</th>'+headers.map(h=>{
    const active=sortField===h;
    const mark=active ? `<span class="sort-mark">${sortDir==='asc'?'▲':'▼'}</span>` : '<span class="sort-mark">↕</span>';
    return `<th class="sortable" data-sort="${key}:${h}" title="クリックでソート">${escapeHtml(fieldLabelFor(key,h))}${mark}</th>`;
  }).join('')+'</tr></thead><tbody>';
  if(rows.length===0){
    html+=`<tr class="empty-row"><td colspan="${headers.length+1}">条件に一致する行がありません</td></tr>`;
  }
  rows.forEach(({row,idx})=>{
    const editKey=baseKeyForTable(key);
    html+=`<tr><td class="controls" data-label="操作"><div class="row-actions"><button class="secondary" data-copy-card="${key}:${idx}">情報コピー</button>${idOnlyCopyButtonHtml(key,idx)}<button class="secondary" data-row-save="${key}:${idx}">個別DB登録</button><button class="danger" data-row-replace="${key}:${idx}">個別DB置換</button><button class="ghost" data-edit-row="${editKey}:${idx}">編集</button><button class="ghost" data-dup="${editKey}:${idx}">複製</button><button class="danger" data-del="${editKey}:${idx}">削除</button></div></td>`;
    headers.forEach(h=>{
      const cls = FORM_LONG_FIELDS.has(h) ? 'readonly-cell long' : 'readonly-cell';
      html+=`<td class="${cls}" data-label="${escapeHtml(fieldLabelFor(key,h))}">${escapeHtml(displayFieldValue(row, h))}</td>`;
    });
    html+='</tr>';
  });
  html+='</tbody>'; table.innerHTML=html;
}
