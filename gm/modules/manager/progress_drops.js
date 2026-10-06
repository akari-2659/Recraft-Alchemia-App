function parseDrops(text){
  return String(text||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    const p=line.split('\t'); if(p.length>=6) return {large:p[0],small:p[1],id:p[2],name:p[3],rate:p[4],count:p[5]};
    const m=line.match(/^(.+?)[:：]\s*(\d+)%\s*[（(]?(.+?)?[）)]?$/); return m?{name:m[1],rate:m[2]+'%',count:m[3]||'1個'}:{name:line,rate:'100%',count:'1個'};
  });
}
function rateNum(s){const m=String(s||'').match(/\d+(?:\.\d+)?/); return m?Number(m[0]):100;}

function materialRows(){
  return (state.items || []).filter(r=>String(r.dataKind || '').trim()==='素材');
}
function findDropMaterial(d={}){
  const id = String(d.id || d.itemId || '').trim();
  const name = String(d.name || d.itemName || '').trim();
  const large = String(d.large || d.materialType || '').trim();
  const small = String(d.small || d.materialCategory || '').trim();
  const rows = materialRows().filter(r=>{
    if(large && String(r.materialType || '').trim() !== large) return false;
    if(small && String(r.materialCategory || '').trim() !== small) return false;
    return true;
  });
  return rows.find(r=>id && String(r.id || r.name || '').trim() === id)
    || rows.find(r=>name && String(r.name || '').trim() === name)
    || materialRows().find(r=>id && String(r.id || r.name || '').trim() === id)
    || materialRows().find(r=>name && String(r.name || '').trim() === name)
    || null;
}
function dropDetailLines(material, options={}){
  if(!material) return [];
  const lines = [];
  const rank = progressPlayerRank(material.rank);
  const cat = String(material.materialCategory || material.itemCategory || '').trim();
  const price = String(material.sellPrice ?? '').trim();
  const desc = String(material.description || '').trim();
  const effect = String(material.effect || '').trim();
  const isMonsterMaterial = String(material.materialType || '').trim() === '魔物素材';
  const forCopy = !!options.forCopy;
  if(rank) lines.push('ランク：' + rank);
  if(cat) lines.push('分類：' + (cat.endsWith('素材') ? cat : cat + '素材'));
  if(price) lines.push('売値：' + price + 'G');
  if(desc) lines.push('説明：' + desc);
  if(effect && !(forCopy && isMonsterMaterial)) lines.push('効果：' + effect);
  return lines;
}

function dropDetailHtml(material){
  const lines = dropDetailLines(material);
  if(!lines.length) return '';
  return `<div class="muted small">${lines.map(esc).join('<br>')}</div>`;
}
function dropPublicId(material, d={}){
  return String(material?.publicId || d.publicId || '').trim();
}
function dropCountText(d={}){
  const raw = String(d.count || '1').trim();
  const m = raw.match(/\d+/);
  return m ? m[0] : '1';
}
function dropPlayerInfoBlock(d={}){
  const material = findDropMaterial(d);
  const name = d.name || d.id || material?.name || '名称未設定';
  const publicId = dropPublicId(material, d);
  const count = dropCountText(d);
  const lines = [];
  lines.push(`【${name}】`);
  lines.push(`登録ID：${publicId || '公開ID未設定'}`);
  lines.push(`個数：${count}`);
  const details = dropDetailLines(material, {forCopy:true});
  if(details.length) lines.push(...details);
  return lines.join('\n');
}
function dropOutputBlock(d={}){
  return dropPlayerInfoBlock(d);
}

function eventRewardUid(){return `reward_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;}
function eventRewardItemRows(){return(state.items||[]).filter(row=>String(row.name||'').trim()).slice().sort((a,b)=>String(b.name||'').length-String(a.name||'').length);}
function eventRewardTrigger(clause='',branchKey=''){
  const text=String(clause||'').trim();const threshold=text.match(/目標値\s*\+\s*(\d+)\s*以上/);
  if(threshold)return{kind:'threshold',value:Number(threshold[1]),label:`目標値+${Number(threshold[1])}以上`,branchKey:String(branchKey||'')};
  if(/勝利後/.test(text))return{kind:'victory',value:0,label:'戦闘勝利後',branchKey:''};
  if(/^失敗\s*[：:]/.test(text)||/^判定失敗\s*[：:]/.test(text))return{kind:'failure',value:0,label:'失敗',branchKey:''};
  const skillFailure=text.match(/^([^：:。]{1,24}?)失敗\s*[：:]/);
  if(skillFailure&&!/^クエスト/.test(String(skillFailure[1]||'').trim())){const key=String(skillFailure[1]||'').trim()||'判定';return{kind:'failure',value:0,label:key==='判定'?'失敗':`${key}失敗`,branchKey:key};}
  const skillSuccess=text.match(/^([^：:。]{1,24}?)成功\s*[：:]/);
  if(skillSuccess){const key=String(skillSuccess[1]||'').trim()||'判定';return{kind:'success',value:0,label:key==='判定'?'判定成功':`${key}成功`,branchKey:key};}
  if(/^判定成功\s*[：:]/.test(text)||/^成功\s*[：:]/.test(text))return{kind:'success',value:0,label:'判定成功',branchKey:'判定'};
  // 固定イベント内の条件付きクエスト成否は、GM内部ルールではなく成立結果として手動選択できるようにする。
  if(/クエストクリア/.test(text))return{kind:'questClear',value:0,label:'クエストクリア',branchKey:'questOutcome'};
  if(/クエスト失敗/.test(text)||/(?:なら|場合は)失敗$/.test(text))return{kind:'questFailure',value:0,label:'クエスト失敗',branchKey:'questOutcome'};
  return{kind:'always',value:0,label:'条件なし',branchKey:''};
}
function eventRewardRoll(expr='1'){
  const raw=String(expr||'1').trim().toUpperCase();const dice=raw.match(/^(\d+)D(\d+)$/);
  if(dice){let total=0;const rolls=[];for(let i=0;i<Number(dice[1]);i++){const v=1+Math.floor(Math.random()*Number(dice[2]));rolls.push(v);total+=v;}return{expr:raw,count:total,detail:`${raw}→${total}${rolls.length>1?`（${rolls.join('+')}）`:''}`};}
  const fixed=Math.max(1,Math.floor(Number((raw.match(/\d+/)||['1'])[0]))||1);return{expr:String(fixed),count:fixed,detail:String(fixed)};
}
function eventRewardMentions(clause=''){
  const text=String(clause||'');const found=[];
  eventRewardItemRows().forEach(row=>{const name=String(row.name||'').trim();let from=0;while(name){const at=text.indexOf(name,from);if(at<0)break;const end=at+name.length;if(!found.some(x=>at<x.end&&end>x.start))found.push({row,name,start:at,end});from=end;}});
  return found.sort((a,b)=>a.start-b.start);
}
function eventRewardItemsFromClause(clause='',previousItemName=''){
  const text=String(clause||'');if(/入手なし|追加素材なし/.test(text))return[];const mentions=eventRewardMentions(text);
  if(!mentions.length){const unnamed=text.match(/(\d+)\s*個\s*(?:を)?\s*追加/);if(unnamed&&previousItemName){const row=eventRewardItemRows().find(x=>String(x.name||'').trim()===previousItemName)||null;return[{uid:eventRewardUid(),name:previousItemName,row,alternatives:[],selectedName:previousItemName,...eventRewardRoll(unnamed[1])}];}return[];}
  if(/または/.test(text)&&mentions.length>=2){const tail=text.slice(mentions.at(-1).end);const count=(tail.match(/^\s*×\s*(\d+D\d+|\d+)/i)||text.match(/×\s*(\d+D\d+|\d+)/i)||[])[1]||'1';const alternatives=mentions.map(m=>m.name);return[{uid:eventRewardUid(),name:alternatives[0],row:mentions[0].row,alternatives,selectedName:alternatives[0],...eventRewardRoll(count)}];}
  return mentions.map((m,index)=>{const until=mentions[index+1]?.start??text.length;const local=text.slice(m.end,until);const count=(local.match(/^\s*×\s*(\d+D\d+|\d+)/i)||[])[1]||'1';return{uid:eventRewardUid(),name:m.name,row:m.row,alternatives:[],selectedName:m.name,...eventRewardRoll(count)};});
}
function eventVictoryHasMeaningfulPostBattle(clause=''){
  const text=String(clause||'').replace(/^勝利後\s*[、,:：]?\s*/,'');
  if(!/ドロップ判定/.test(text))return true;
  // 「ドロップ判定を行ってクエストクリア」のように同一節へ後続結果が続く場合、
  // ドロップ判定部分を貪欲に削ってクエストクリアまで消してはいけない。
  return /クエストクリア|解放|入手|回収|獲得|補正|回復|進行|解除|発見|追加報酬|報酬|帰還|到達|完了|達成|運搬|巡回|続ける/.test(text);
}
// v90.8.735: 『○○を入手してクエストクリア』のような結果文は内容コピー対象から落とさない。
function eventClauseIsOperationalRule(clause='',row={}){
  const text=String(clause||'').trim();if(!text)return false;
  // 判定・戦闘構成・特殊戦闘の進行管理など、GMが処理するためのルール文は内容コピーへ出さない。
  const rulePatterns=[
    /^判定\s*[：:]/,/^戦闘発生\s*[：:]/,/^人数別構成(?:は)?\s*[、,:：]?/,
    /^(?:前衛|後衛).*(?:との)?戦闘が発生(?:する)?$/,/^エリアボス[「『].+[」』]と遭遇する$/,
    /^戦闘開始時/,/^作業役/,/^運搬役/,/^回収時に運搬役/,/^この時点から.*条件/,/^各自が判定/,
    /^主行動《/,/^判定成功で/,/^判定失敗で/,/^\d+回連続成功/,/^作業完了/,/^作業未完了/,
    /^最終ダメージ/,/^ダメージが0/,/^防御などで最終ダメージ/,/^毒などの継続ダメージ/,/^HPコスト/,
    /^増援/,/^第\d+ラウンド/,/^特殊条件\s*[：:]/,/^随伴を含めて/,/^1人パーティーでは/,
    /^必要素材\s*[：:]/,/作成時に消費/,/作成できず.*(?:未達成|失敗)/,
    /^クエスト(?:クリア|失敗)$/,/途中変更はできない/,/連続成功回数/,/リセットしない/,/0に戻/,
    /解体・ドロップ判定の対象/,/^(?:出現した)?各魔物のドロップ判定(?:を)?(?:1回ずつ)?行う$/,/^二つ名個体のドロップ判定(?:を)?(?:1回ずつ)?行う$/,/採取・解体判定は行わず/,/宝箱表「[^」]+」から.*抽選/,
    /全員を後衛には配置しない/,/人数対応.*(?:編成|随伴)/,
    /^[^：:。]{1,24}?で代用可能（判定\s*[+\-−－]?\d+）$/,
    /^(?:前衛|後衛)に.+(?:×|との戦闘)/,/^PCはこの場で挑むか/,/^挑む場合のみ/,
    /^判定後に解除(?:する)?$/,/^休息(?:を選ぶ|しない)\s*[：:]/
  ];
  return rulePatterns.some(re=>re.test(text));
}
function eventAlwaysClauseHasMeaningfulContent(clause='',row={}){
  const text=String(clause||'').trim();
  if(!text||eventClauseIsOperationalRule(text,row))return false;
  // ドロップ判定だけの後処理・単独の成否ラベルは、卓へ貼る「内容」ではない。
  if(/^勝利後.*ドロップ判定(?:を)?(?:1回ずつ)?行う$/.test(text))return false;
  if(/^クエスト(?:クリア|失敗)$/.test(text))return false;
  // 固定イベントではクエスト専用アイテム、次イベントへの補正、条件付きクリア等が
  // 共通アイテムDBに載らないことがある。内部処理文でなければ成立結果として保持する。
  return true;
}
function buildEventRewardState(row={}){
  const clauses=String(row.result||'').split(/[。\n]+/).map(x=>x.trim()).filter(Boolean);const groups=[];let previousItemName='',currentBranchKey='',lastSuccessBranchKey='';
  clauses.forEach(clause=>{
    let trigger=eventRewardTrigger(clause,currentBranchKey);
    if(trigger.kind==='threshold'&&!String(trigger.branchKey||''))trigger={...trigger,branchKey:lastSuccessBranchKey||'判定'};
    if(trigger.kind==='success'){currentBranchKey=String(trigger.branchKey||'判定');lastSuccessBranchKey=currentBranchKey;}else if(trigger.kind==='failure'||trigger.kind==='victory')currentBranchKey='';
    const questOutcome=['questClear','questFailure'].includes(trigger.kind);
    // クエスト成否を含む節は、文頭が「作業完了後」「運搬役…」など内部ルールの形でも成立結果として残す。
    const operational=eventClauseIsOperationalRule(clause,row)&&!questOutcome;
    const items=operational?[]:eventRewardItemsFromClause(clause,previousItemName),tableSlots=operational?0:eventRewardTableSlotsFromClause(clause),explicitNoReward=!operational&&/入手なし|追加素材なし/.test(clause);
    const branch=['success','failure','threshold','victory','questClear','questFailure'].includes(trigger.kind),meaningfulBranch=!operational&&branch&&(trigger.kind!=='victory'||eventVictoryHasMeaningfulPostBattle(clause));
    const meaningfulAlways=!operational&&trigger.kind==='always'&&eventAlwaysClauseHasMeaningfulContent(clause,row);
    if(!items.length&&!tableSlots&&!explicitNoReward&&!meaningfulBranch&&!meaningfulAlways)return;
    if(items.length)previousItemName=items.at(-1).selectedName||previousItemName;
    if(trigger.kind==='always')trigger={...trigger,label:(items.length||tableSlots)?'入手':'描写'};
    const hasSelectedSuccess=groups.some(g=>g.trigger.kind==='success'&&g.selected);
    const hasSelectedQuestOutcome=groups.some(g=>['questClear','questFailure'].includes(g.trigger.kind)&&g.selected);
    const selected=trigger.kind==='always'||(trigger.kind==='success'&&!hasSelectedSuccess)||(trigger.kind==='victory'&&!groups.some(g=>['success','failure','threshold'].includes(g.trigger.kind)))||(trigger.kind==='questClear'&&!hasSelectedQuestOutcome);
    groups.push({uid:eventRewardUid(),trigger,clause,items,tableSlots,selected});
  });
  return groups.length?{eventName:String(row.eventName||row.name||'イベント'),row:{...row},groups}:null;
}
function eventRewardState(scope='event'){if(scope==='quest')return state.lastQuestEventRewardState;if(scope==='base')return state.lastBaseEventRewardState;return state.lastEventRewardState;}
function eventRewardPanelId(scope='event'){if(scope==='quest')return'questEventRewardPanel';if(scope==='base')return'baseEventRewardPanel';return'eventRewardPanel';}
function eventRewardSelectedItems(scope='event'){
  const reward=eventRewardState(scope),map=new Map();if(!reward)return[];
  reward.groups.filter(g=>g.selected||g.trigger.kind==='always').forEach(g=>g.items.forEach(item=>{const name=item.selectedName||item.name;const row=eventRewardItemRows().find(x=>String(x.name||'').trim()===name)||item.row||null;const key=String(row?.publicId||row?.id||name),cur=map.get(key)||{name,row,count:0};cur.count+=Number(item.count)||0;map.set(key,cur);}));return[...map.values()];
}
function eventRewardHasSelectedNoReward(scope='event'){
  const reward=eventRewardState(scope);if(!reward)return false;
  return reward.groups.some(group=>{
    if(!(group.selected||group.trigger.kind==='always'))return false;
    if((group.items||[]).length)return false;
    return /入手なし|追加素材なし/.test(String(group.clause||''));
  });
}
function eventRewardCopyText(scope='event'){
  const reward=eventRewardState(scope);if(!reward)return'';const rows=eventRewardSelectedItems(scope);
  if(!rows.length)return'';
  return rows.map(item=>{const count=String(item.count||1);return item.row?acquisitionItemCopyBlock(item.row,count):dropPlayerInfoBlock({name:item.name,id:item.row?.id||'',publicId:item.row?.publicId||'',count:`${count}個`});}).join('\n\n');
}
function eventRewardGroupText(group={}){const parts=[];const itemText=(group.items||[]).map(item=>`${item.selectedName||item.name}×${item.count}${/D/i.test(item.expr||'')?`（${item.expr}）`:''}`).join('、');if(itemText)parts.push(itemText);if(Number(group.tableSlots)>0)parts.push(`入手アイテム表：${Number(group.tableSlots)}枠`);if(parts.length)return parts.join(' / ');return String(group.clause||'').replace(/^目標値\s*\+\s*\d+\s*以上\s*[：:]\s*/,'').replace(/^勝利後\s*[：:]?\s*/,'').replace(/^失敗\s*[：:]\s*/,'').replace(/^判定失敗\s*[：:]\s*/,'').replace(/^[^：:。]{1,24}?失敗\s*[：:]\s*/,'').replace(/^判定成功\s*[：:]\s*/,'').replace(/^[^：:。]{1,24}?成功\s*[：:]\s*/,'')||'結果を選択';}
function eventOutcomeKey(scope='event'){
  if(scope==='quest')return String(state.lastQuestOutcomeKey||'');
  if(scope==='base')return String(state.lastBaseOutcomeKey||'');
  return String(state.lastEventOutcomeKey||'');
}
function eventOutcomeRow(scope='event'){
  const key=eventOutcomeKey(scope);if(!key)return null;
  const common=(state.events||[]).find(row=>eventUniqueKey(row)===key);
  if(common)return common;
  // クエスト本文から生成された固定イベントは state.events に存在しないため、
  // 選択中クエストの固定イベントからも解決する。
  if(scope==='quest'){
    const q=selected($('questSelect'),state.quests);
    const fixed=(q?questSpecificEvents(q):[]).find(row=>eventUniqueKey(row)===key);
    if(fixed)return fixed;
  }
  const reward=eventRewardState(scope);
  return reward?.row||null;
}
function eventOutcomePartySize(scope='event'){
  if(scope==='quest'){const q=selected($('questSelect'),state.quests);return q?effectiveQuestPartySize(q):selectedPartySize();}
  return selectedPartySize();
}
function eventOutcomeBranches(row={}){
  const clauses=String(row.result||'').split(/[。\n]+/).map(x=>x.trim()).filter(Boolean),groups=[];
  let currentBranchKey='',lastSuccessBranchKey='';
  clauses.forEach(clause=>{
    let trigger=eventRewardTrigger(clause,currentBranchKey);
    if(trigger.kind==='threshold'&&!String(trigger.branchKey||''))trigger={...trigger,branchKey:lastSuccessBranchKey||'判定'};
    if(trigger.kind==='success'){currentBranchKey=String(trigger.branchKey||'判定');lastSuccessBranchKey=currentBranchKey;}
    else if(trigger.kind==='failure'||trigger.kind==='victory')currentBranchKey='';
    if(['success','failure','threshold','victory'].includes(trigger.kind))groups.push({trigger,clause});
  });
  return groups;
}
function eventOutcomeSameBranch(a={},b={}){
  return String(a.branchKey||'')===String(b.branchKey||'');
}
function eventOutcomeIncludedBranches(branches=[],target={}){
  const t=target.trigger||target;
  if(t.kind==='threshold')return branches.filter(group=>{
    const g=group.trigger;
    if(!eventOutcomeSameBranch(g,t))return false;
    return g.kind==='success'||(g.kind==='threshold'&&(Number(g.value)||0)<=(Number(t.value)||0));
  });
  return branches.filter(group=>{
    const g=group.trigger;
    if(g.kind!==t.kind)return false;
    if(g.kind==='success')return eventOutcomeSameBranch(g,t);
    return true;
  });
}
function eventOutcomeRewardGroups(scope='event',target={}){
  const reward=eventRewardState(scope);if(!reward?.groups?.length)return[];
  const t=target.trigger||target;
  return reward.groups.filter(group=>{
    const g=group.trigger||{};
    if(g.kind==='always')return true;
    if(t.kind==='threshold'){
      if(!eventOutcomeSameBranch(g,t))return false;
      return g.kind==='success'||(g.kind==='threshold'&&(Number(g.value)||0)<=(Number(t.value)||0));
    }
    if(g.kind!==t.kind)return false;
    if(g.kind==='success')return eventOutcomeSameBranch(g,t);
    return true;
  });
}
function eventOutcomeRewardLabel(row={},clause=''){
  if(String(row.eventType||'').includes('食材'))return '食材';
  const direct=eventRewardItemsFromClause(clause);
  if(direct.length){
    const rows=direct.map(item=>item.row||eventRewardItemRows().find(x=>String(x.name||'').trim()===String(item.selectedName||item.name||'').trim())).filter(Boolean);
    if(rows.length&&rows.every(r=>String(r.itemType||'').trim()==='食材'))return '食材';
    if(rows.length&&rows.every(r=>String(r.dataKind||'').trim()==='素材'))return '素材';
    return 'アイテム';
  }
  if(eventRewardTableSlotsFromClause(clause)>0)return '素材・アイテム';
  return '報酬';
}
function eventOutcomeCleanClause(row={},clause='',partySize=selectedPartySize()){
  let text=resolveEncounterTokensInText(String(clause||''),partySize).trim();
  // 代用可能技能の注記は判定情報側だけに残し、「内容コピー」には混ぜない。
  text=text.replace(/[^\s、。：「」()（）]+?で代用可能（判定\s*[+\-−－]?\d+）[。]?\s*/g,'');
  text=text.replace(/^目標値\s*\+\s*\d+\s*以上\s*[：:]\s*/,'');
  text=text.replace(/^勝利後\s*[、,:：]?\s*/,'');
  // ドロップ判定そのものはGM処理。後ろに続く「運搬を続ける」「クエストクリア」等だけを内容へ残す。
  text=text.replace(/^(?:出現した)?各魔物のドロップ判定(?:を)?(?:1回ずつ)?行(?:い|って)\s*[、,]?\s*/,'');
  text=text.replace(/^失敗\s*[：:]\s*/,'');
  text=text.replace(/^判定失敗\s*[：:]\s*/,'');
  text=text.replace(/^[^：:。]{1,24}?失敗\s*[：:]\s*/,'');
  text=text.replace(/^判定成功\s*[：:]\s*/,'');
  text=text.replace(/^[^：:。]{1,24}?成功\s*[：:]\s*/,'');
  const label=eventOutcomeRewardLabel(row,clause);
  const add=/(?:追加で|追加素材)/.test(text);
  const rewardWord=add?`${label}を追加で入手`:`${label}を入手`;
  text=text.replace(/(?:入手アイテム表の)?(?:同じ)?抽選結果(?:の)?\s*(?:\d+\s*枠目(?:まで)?(?:のみ)?|\d+\s*枠)(?:を)?\s*(?:追加で)?\s*入手/g,rewardWord);
  text=text.replace(/入手アイテム表[^。、]*?(?:を)?\s*(?:追加で)?\s*入手/g,rewardWord);
  text=text.replace(/(?:同じ)?抽選結果[^。、]*?(?:を)?\s*(?:追加で)?\s*入手/g,rewardWord);
  const direct=eventRewardItemsFromClause(clause);
  if(direct.length){
    direct.forEach(item=>{
      const name=String(item.selectedName||item.name||'').trim();if(!name)return;
      const safe=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const re=new RegExp(`${safe}\\s*(?:×\\s*(?:\\d+D\\d+|\\d+))?\\s*(?:を)?\\s*(追加で)?\\s*(?:入手|回収|採取)`,'gi');
      text=text.replace(re,(_m,extra)=>extra?`${label}を追加で入手`:`${label}を入手`);
    });
  }
  text=text.replace(/(?:素材・アイテム|素材|食材|アイテム)を入手(?:して)?、?\s*(?:素材・アイテム|素材|食材|アイテム)を入手/g,match=>match.split(/、?\s*/)[0]);
  text=text.replace(/入手なし/g,'何も得られなかった');
  text=text.replace(/追加素材なし/g,'追加の素材は得られなかった');
  text=text.replace(/\s+/g,' ').replace(/、\s*、/g,'、').trim();
  text=text.replace(/(素材・アイテム|素材|食材|アイテム)を追加で入手$/,'$1を追加で入手することができた');
  text=text.replace(/(素材・アイテム|素材|食材|アイテム)を入手$/,'$1を入手することができた');
  if(text&&!/[。！？!?]$/.test(text))text+='。';
  return text;
}
function eventOutcomeItems(scope='event',target={}){
  const map=new Map();
  const add=(name,row,count)=>{const key=String(row?.publicId||row?.id||name),cur=map.get(key)||{name,row,count:0};cur.count+=Number(count)||0;map.set(key,cur);};
  const groups=eventOutcomeRewardGroups(scope,target);
  groups.forEach(group=>(group.items||[]).forEach(item=>{const name=item.selectedName||item.name;const row=eventRewardItemRows().find(x=>String(x.name||'').trim()===String(name||'').trim())||item.row||null;add(name,row,item.count||1);}));
  const table=eventTableRewardState(scope),limit=Math.max(0,...groups.map(g=>Number(g.tableSlots)||0));
  if(table?.slots?.length&&limit){
    table.slots.slice(0,limit).forEach(slot=>{const row=slot.row||findItemByNameOrId(slot.name,slot.publicId);add(slot.name,row,slot.count||1);});
  }
  return [...map.values()];
}
function eventOutcomeItemsCopyBlock(scope='event',target={}){
  const items=eventOutcomeItems(scope,target);if(!items.length)return'';
  return items.map(item=>{const count=String(item.count||1);return item.row?acquisitionItemCopyBlock(item.row,count):dropPlayerInfoBlock({name:item.name,count:`${count}個`});}).join('\n\n');
}
function eventOutcomeIsBattle(row={}){
  const type=String(row.eventType||'');
  return !!eventBattleCopyMode(row)||/(?:魔物遭遇|強敵遭遇|ボス遭遇|二つ名遭遇|魔物$|戦闘)/.test(type);
}
function eventOutcomeHasExtraAcquisition(scope='event'){
  if(eventRewardCombinedSelectedItems(scope).length)return true;
  if(String(selectedEventTreasureCopyText(scope)||'').trim())return true;
  return false;
}
function eventOutcomeNarrative(row={},group={},scope='event'){
  const trigger=group.trigger||{},clause=String(group.clause||''),type=String(row.eventType||''),name=String(row.eventName||'イベント').trim();
  const failure=trigger.kind==='failure'||trigger.kind==='questFailure';
  const threshold=trigger.kind==='threshold';
  const victory=trigger.kind==='victory';
  const clear=trigger.kind==='questClear'||/クエストクリア/.test(clause);
  const hasItems=(group.items||[]).length>0||Number(group.tableSlots)>0||/入手|採取|回収|発見/.test(clause);
  if(/休息/.test(type)){
    if(failure)return '周囲の安全を十分に確保できず、腰を落ち着ける前にその場を離れた。';
    return '荷を下ろして身体を休め、短い時間ながら呼吸と調子を整えた。';
  }
  if(victory){
    if(hasItems)return '戦いが終わったあと、周囲を改めて調べると、通常の戦利品とは別に持ち帰れそうなものが残されていた。';
    return '';
  }
  if(clear)return failure?'目的を果たすには至らず、これ以上の続行は難しいと判断して作業を切り上げた。':'必要な確認や作業を終え、依頼の目的を無事に果たした。';
  if(/採取|食材/.test(type)||/採集|採取|群生|露頭|鉱脈|晶|茸|草|苔|根|藻/.test(name)){
    if(threshold)return 'さらに周囲を丁寧に探ると、最初は見落としていた状態の良い箇所まで見つけることができた。';
    if(failure)return hasItems?'少し手間取ったものの、手を伸ばせる範囲から傷みの少ないものを選んで確保した。':'探せる範囲を確かめたが、無理に踏み込まず今回は採取を見送った。';
    return '生え方や地層の状態を見極め、周囲を傷めないよう丁寧に必要なものを採り集めた。';
  }
  if(/発見|探索|宝箱/.test(type)||/箱|鞄|荷物|痕跡|足跡|刻印|手がかり|確認/.test(name)){
    if(threshold)return 'さらに細かな痕跡まで追うと、最初の調査では気付かなかったものまで見つかった。';
    if(failure)return hasItems?'十分な手掛かりは得られなかったが、目につく範囲から使えそうなものだけは確保した。':'周囲を探したものの、確かな手掛かりまでは掴めなかった。';
    return '痕跡を一つずつ辿り、見落とされていたものの位置を確かに突き止めた。';
  }
  if(/障害|危険|操作|異界現象|異常/.test(type)||/橋|足場|斜面|扉|隔壁|風|雷|噴気|支柱/.test(name)){
    if(failure)return '読みを外して少し手間取ったものの、危険が大きくなる前に体勢を立て直した。';
    return '周囲の動きと危険な箇所を見極め、無理のない手順で障害を切り抜けた。';
  }
  if(/拠点イベント/.test(type)){
    if(/相談|不安|動揺|聞き役|緊張|順番|交渉/.test(name))return failure?'話はすぐにはまとまらなかったが、互いの事情を整理してこれ以上こじれないところまで落ち着かせた。':'相手の話を一つずつ整理し、互いに納得できる形へうまく話をまとめた。';
    if(/負傷|咳|探索者|隊員|帰還者/.test(name))return failure?'十分な手当てや声掛けには至らなかったが、無理をさせないよう落ち着ける場所まで支えた。':'様子を確かめながら必要な手当てや声掛けを行い、ひとまず落ち着ける状態まで整えた。';
    if(/査定|買い取り|値付け|取引/.test(name))return failure?'品の状態や条件が噛み合わず、今回は無理に取引をまとめず見送ることにした。':'品の状態と条件を丁寧に見比べ、双方が納得できる取引へまとめた。';
    if(/補修|修理|洗浄|調整|封緘|選別|整理|設置|搬入|点検|締め|交換|擦り合わせ|仕分|張り直し|磨き直し|繕/.test(name))return failure?'作業には少し手間取ったものの、状態を確かめ直しながら危険のないところまで整えた。':'状態と手順を見極め、必要な作業を順序よく片付けた。';
    return failure?'思うようには進まなかったが、事情を確かめて大きな支障が残らないところまで対処した。':'事情を確かめて必要な手助けを行い、滞っていたことを無事に片付けた。';
  }
  if(/点検|交換|繕|清掃|封緘|固定|作業|選鉱|洗浄|塗り|清書|締め|手入れ|補修|整備|運搬|仕分|選別|調整|修理|整理|照合/.test(name)){
    if(failure)return '予定より時間はかかったが、手順を一つずつ確かめながら最後まで作業を終えた。';
    return '必要な手順を見極め、無駄なく手を動かして作業をきれいに片付けた。';
  }
  if(failure)return hasItems?'思うようには進まなかったが、状況を立て直しながら最低限の成果は持ち帰った。':'手を尽くしたものの、今回は狙った成果まで届かなかった。';
  if(threshold)return 'さらに注意深く確かめたことで、もう一段踏み込んだ成果へたどり着いた。';
  return hasItems?'周囲の様子を丁寧に確かめ、見つけたものを無事に回収した。':'状況を見極め、無事にこの場を切り抜けた。';
}
function eventSuccessHint(row={},group={}){
  if(String(group?.trigger?.kind||'')!=='success')return '';
  const notes=String(row?.notes||'');
  const matches=[...notes.matchAll(/【成功ヒント(?::([^】]+))?】([^\n]+)/g)];
  if(!matches.length)return '';
  const branch=String(group?.trigger?.branchKey||'').trim();
  const hit=matches.find(m=>!String(m[1]||'').trim()||String(m[1]||'').trim()===branch);
  return String(hit?.[2]||'').trim();
}
const v775EventOutcomeNarrative=eventOutcomeNarrative;
eventOutcomeNarrative=function(row={},group={},scope='event'){
  const raw=v775EventOutcomeNarrative(row,group,scope);
  if(!raw)return '';
  const hint=eventSuccessHint(row,group);
  return stripEventIdentityFromNarrative([raw,hint].filter(Boolean).join(' '),row);
};
function stripEventIdentityFromNarrative(text='',row={}){
  let out=String(text||'').trim();if(!out)return'';
  const escapeRe=v=>String(v||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const name=String(row.eventName||'').trim(),area=String(row.areaName||'').trim();
  if(name){const n=escapeRe(name);out=out.replace(new RegExp(`【\\s*${n}\\s*】`,'g'),'').replace(new RegExp(`「\\s*${n}\\s*」`,'g'),'').replace(new RegExp(n,'g'),'');}
  if(area){const a=escapeRe(area);out=out.replace(new RegExp(`${a}(?:の|で|では|に|には|から|へ)?`,'g'),'');}
  return out.replace(/^[のではに、。・：:\s]+/,'').replace(/([。！？])\s*[、。]+/g,'$1').replace(/\s{2,}/g,' ').trim();
}
function eventOutcomeSupplementText(row={},group={},partySize=selectedPartySize()){
  let clean=eventOutcomeCleanClause(row,group.clause,partySize);if(!clean)return'';
  // アイテム入手の要約は出さず、実データブロックへ任せる。
  // 文頭・文中どちらにあっても入手要約だけ除去し、疲労や進行、クエスト成否などの機械的結果は残す。
  clean=clean.replace(/(?:素材・アイテム|素材|食材|アイテム)を(?:追加で)?入手(?:することができた)?(?:して|し)?[、,]?\s*/g,'');
  clean=clean.replace(/(?:何も得られなかった|追加の素材は得られなかった|回収はできるが)[。．、,]?\s*/g,'');
  clean=clean.replace(/。{2,}/g,'。').replace(/^[。．、,\s]+|[、,\s]+$/g,'').trim();
  if(!clean)return'';
  // 事務的な成否ラベルは描写に置き換える。機械的効果・クエスト成否だけは残す。
  if(!/(?:ダメージ|疲労|回避|抵抗|防御|判定[+\-−－]|HP|MP|クエストクリア|クエスト失敗|進行|解除|補正|回復|解放)/.test(clean))return'';
  return stripEventIdentityFromNarrative(clean,row);
}
function eventOutcomeCopyText(scope='event',index=0){
  const row=eventOutcomeRow(scope);if(!row)return'';
  const branches=eventOutcomeBranches(row),target=branches[Number(index)||0];if(!target)return'';
  const included=eventOutcomeIncludedBranches(branches,target),partySize=eventOutcomePartySize(scope);
  const narratives=[];
  included.forEach(group=>{const n=eventOutcomeNarrative(row,group,scope),extra=eventOutcomeSupplementText(row,group,partySize);if(n)narratives.push(n);if(extra)narratives.push(extra);});
  const items=eventOutcomeItemsCopyBlock(scope,target);
  if(eventOutcomeIsBattle(row)&&!items)return'';
  return [...narratives,items].filter(Boolean).join('\n\n');
}
function eventContentRewardItemsBlock(scope='event'){
  const rows=eventRewardCombinedSelectedItems(scope);if(!rows.length)return'';
  return rows.map(item=>item.row?acquisitionItemCopyBlock(item.row,String(item.count||1)):dropPlayerInfoBlock({name:item.name,count:`${item.count||1}個`})).join('\n\n');
}
function stripOutcomeLabelsForContentCopy(text=''){
  return String(text||'').split('\n').map(line=>String(line||'')
    .replace(/^\s*(?:判定)?成功\s*[：:]\s*/,'')
    .replace(/^\s*[^：:。\n]{1,24}?成功\s*[：:]\s*/,'')
    .replace(/^\s*(?:判定)?失敗\s*[：:]\s*/,'')
    .replace(/^\s*[^：:。\n]{1,24}?失敗\s*[：:]\s*/,'')
  ).join('\n');
}
function eventContentCopyText(scope='event'){
  const row=eventOutcomeRow(scope);if(!row)return'';
  const reward=eventRewardState(scope),partySize=eventOutcomePartySize(scope);
  const selectedGroups=(reward?.groups||[]).filter(g=>g.selected||g.trigger.kind==='always');
  const rewardBlock=eventContentRewardItemsBlock(scope),treasure=selectedEventTreasureCopyText(scope);
  if(eventOutcomeIsBattle(row)&&!String(rewardBlock||treasure||'').trim())return'';
  const lines=[];
  selectedGroups.forEach(g=>{
    if(eventOutcomeIsBattle(row)&&!(g.items||[]).length&&!Number(g.tableSlots||0))return;
    const narrative=eventOutcomeNarrative(row,g,scope),extra=eventOutcomeSupplementText(row,g,partySize);
    if(narrative)lines.push(narrative);if(extra)lines.push(extra);
  });
  const uniqueLines=[...new Set(lines.filter(Boolean))];
  // 内容コピーは判定後の結果だけを出す。判定前の導入・状況説明は含めない。
  return stripOutcomeLabelsForContentCopy([uniqueLines.join('\n'),rewardBlock,treasure].filter(Boolean).join('\n\n'));
}
function updateEventContentCopyButtons(){[['event','copyEventContentBtn'],['quest','copyQuestContentBtn'],['base','copyBaseEventContentBtn']].forEach(([scope,id])=>{const btn=$(id);if(btn)btn.disabled=!String(eventContentCopyText(scope)||'').trim();});}

function renderEventRewardPanel(scope='event'){
  const panel=$(eventRewardPanelId(scope)),reward=eventRewardState(scope),treasureHtml=eventTreasureSelectionHtml(scope);if(!panel)return;
  const hasReward=!!reward?.groups?.length;if(!hasReward&&!treasureHtml){panel.classList.add('hidden');panel.innerHTML='';updateEventContentCopyButtons();return;}panel.classList.remove('hidden');
  let rewardHtml='';
  if(hasReward){
    const body=reward.groups.map(group=>{const choices=group.items.map(item=>item.alternatives?.length?`<label class="event-reward-choice">選択：<select data-event-reward-choice="${esc(group.uid)}" data-event-reward-item="${esc(item.uid)}">${item.alternatives.map(name=>`<option value="${esc(name)}" ${name===item.selectedName?'selected':''}>${esc(name)}</option>`).join('')}</select></label>`:'').join('');const locked=group.trigger.kind==='always';return`<article class="event-reward-row"><label class="event-reward-check"><input type="checkbox" data-event-reward-check="${esc(group.uid)}" ${group.selected||locked?'checked':''} ${locked?'disabled':''}><span><b>${esc(group.trigger.label)}</b><br><span class="muted small">${esc(eventRewardGroupText(group))}</span></span></label>${choices}</article>`;}).join('');
    const selected=eventRewardCombinedSelectedItems(scope),total=selected.length?selected.map(row=>`${row.name}×${row.count}`).join('、'):'アイテム入手なし';
    const selectedLabels=reward.groups.filter(g=>g.selected||g.trigger.kind==='always').map(g=>g.trigger.label).join(' / ')||'未選択';
    const hasDirectDice=reward.groups.some(g=>(g.items||[]).some(item=>/D/i.test(String(item.expr||'')))),rerollButton=hasDirectDice?`<div class="buttons"><button type="button" class="secondary" data-event-reward-reroll="${scope}">数量を振り直す</button></div>`:'';
    rewardHtml=`<section class="card event-reward-card"><h3>結果選択</h3><p class="muted small">実際に成立した描写・結果だけをチェックしてください。進行管理用の内部ルールはここには表示しません。「内容コピー」は、この選択内容だけをコピーします。目標値+○以上は対応する成功結果と合わせて選択されます。</p><div class="event-reward-list">${body}</div><div class="event-reward-total"><b>選択中</b><span>${esc(selectedLabels)}</span></div>${selected.length?`<div class="event-reward-total"><b>入手分</b><span>${esc(total)}</span></div>`:''}${rerollButton}</section>`;
  }
  panel.innerHTML=rewardHtml+treasureHtml;updateEventContentCopyButtons();
}
function updateEventRewardSelection(scope,uid,checked){
  const reward=eventRewardState(scope),target=reward?.groups.find(g=>String(g.uid)===String(uid));if(!target)return;
  if(target.trigger.kind==='always')return;
  target.selected=!!checked;
  const key=String(target.trigger.branchKey||'');
  const sameBranch=g=>String(g.trigger.branchKey||'')===key;
  if(target.trigger.kind==='failure'&&checked){
    reward.groups.forEach(g=>{if(g.trigger.kind!=='always'&&g!==target)g.selected=false;});
  }
  if(['questClear','questFailure'].includes(target.trigger.kind)&&checked){
    reward.groups.forEach(g=>{if(g!==target&&['questClear','questFailure'].includes(g.trigger.kind))g.selected=false;});
  }
  if(target.trigger.kind==='success'){
    if(checked){
      reward.groups.forEach(g=>{if(g.trigger.kind==='failure')g.selected=false;});
      reward.groups.forEach(g=>{if(g.trigger.kind==='success'&&g!==target&&!sameBranch(g))g.selected=false;if(g.trigger.kind==='threshold'&&!sameBranch(g))g.selected=false;});
    }else{
      reward.groups.forEach(g=>{if(g.trigger.kind==='threshold'&&sameBranch(g))g.selected=false;});
    }
  }
  if(target.trigger.kind==='threshold'){
    const n=Number(target.trigger.value)||0;
    if(checked){
      reward.groups.forEach(g=>{if(g.trigger.kind==='failure')g.selected=false;});
      reward.groups.forEach(g=>{
        if(g.trigger.kind==='success')g.selected=sameBranch(g);
        if(g.trigger.kind==='threshold')g.selected=sameBranch(g)&&(Number(g.trigger.value)||0)<=n;
      });
    }else{
      reward.groups.forEach(g=>{if(g.trigger.kind==='threshold'&&sameBranch(g)&&(Number(g.trigger.value)||0)>=n)g.selected=false;});
    }
  }
  syncEventTableRewardCopyState(scope);syncEventTreasureCopyState(scope);renderEventRewardPanel(scope);updateEventContentCopyButtons();
}
function rerollEventReward(scope='event'){const reward=eventRewardState(scope);if(!reward)return;reward.groups.forEach(g=>g.items.forEach(item=>Object.assign(item,eventRewardRoll(item.expr||'1'))));syncEventTableRewardCopyState(scope);renderEventRewardPanel(scope);updateEventContentCopyButtons();}
function dropInstanceUid(){return `drop_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;}
function renderDropMode(){state.dropMode='encounter';$('dropEncounterPanel')?.classList.remove('hidden');}
function setDropMode(){state.dropMode='encounter';renderDropMode();saveState(false);}
function encounterInstanceMonster(instance={}){return state.monsters.find(m=>String(m.id||'')===String(instance.monsterId||'')||String(m.name||'')===String(instance.name||''))||null;}
function normalizeDropInstances(rows=[]){return rows.map(row=>({uid:String(row.uid||dropInstanceUid()),monsterId:String(row.monsterId||''),name:String(row.name||''),formation:String(row.formation||''),dismantleSuccess:!!row.dismantleSuccess})).filter(row=>row.name||row.monsterId);}
function loadLastEncounterForDrops(){
  const encounter=state.lastEncounter;
  if(!encounter||!Array.isArray(encounter.groups)||!encounter.groups.length){addLog('読み込める直前の出現構成がありません。');return;}
  const rows=(Array.isArray(encounter.instances)&&encounter.instances.length?encounter.instances:encounterInstanceRows(encounter.groups||[],{fixedIv:!!encounter.fixedIv,areaName:encounter.areaName||''})).map(row=>({uid:dropInstanceUid(),monsterId:String(row.monsterId||row.monster?.id||''),name:String(row.name||row.monster?.name||''),formation:String(row.formation||''),dismantleSuccess:false}));
  state.dropEncounterInstances=normalizeDropInstances(rows);setDropMode('encounter');renderEncounterDropList();saveState(false);
}
function addSelectedMonsterToEncounter(){const m=selectedDropMonster();if(!m){addLog('先に追加する魔物を選択してください。');return;}state.dropEncounterInstances=normalizeDropInstances([...(state.dropEncounterInstances||[]),{uid:dropInstanceUid(),monsterId:m.id||'',name:m.name||m.id||'',formation:'',dismantleSuccess:false}]);setDropMode('encounter');renderEncounterDropList();saveState(false);}
function renderEncounterDropList(){
  const rows=normalizeDropInstances(state.dropEncounterInstances||[]);state.dropEncounterInstances=rows;
  const summary=$('lastEncounterSummary');
  if(summary){const source=state.lastEncounter;const initiative=source&&source.groups?.length?encounterInitiativeText(source.groups,source.areaName||''):'';const instances=Array.isArray(source?.instances)?source.instances:[],bountyEligible=source?.bountyEligible!==false,bounty=encounterBountyTotal(source);const ivLines=instances.map((row,index)=>{const selected=Array.isArray(row.selectedActionNames)?row.selectedActionNames.filter(Boolean):[];const fixedSelected=Array.isArray(row.selectedFixedActionNames)?row.selectedFixedActionNames.filter(Boolean):[];const randomSelected=selected.filter(name=>!fixedSelected.includes(name));const loadoutInfo=Number(row.actionPoolSize)>3?`（固定${fixedSelected.length}＋抽選${randomSelected.length} / 所持${Number(row.actionPoolSize)}技）`:'';const actionLine=selected.length?`<br>&emsp;選出技：${selected.map(name=>fixedSelected.includes(name)?`【固定】${esc(name)}`:esc(name)).join(' / ')}${loadoutInfo}`:'';return`${index+1}. ${esc(row.name)} / HP${esc(row.monster?.hp??'—')} / 回避${esc(row.monster?.evasionValue??'—')} / 抵抗${esc(row.monster?.resistValue??'—')} / ${esc(encounterIvLabel(row))}${bountyEligible?` / 討伐${Number(row.bountyG)||0}G`:''}${actionLine}`;}).join('<br>');summary.innerHTML=source&&source.groups?.length?`<b>${esc(source.label||'直前の出現構成')}</b>${source.areaName?`<br><span class="muted small">エリア：${esc(source.areaName)}</span>`:''}<br><span class="muted small">${source.groups.map(g=>`${esc(g.formation||'配置未設定')}：${esc(g.name)} ×${Math.max(1,Number(g.count)||1)}`).join(' / ')}</span>${initiative?`<br><span class="muted small">${esc(initiative)}</span>`:''}${ivLines?`<hr><span class="muted small">${ivLines}</span>`:''}${bounty>0?`<hr><b>討伐報酬：${bounty}G（PT共通）</b>`:''}`:'まだ出現構成が読み込まれていません。';}
  const box=$('encounterDropList');if(!box)return;
  if(!rows.length){box.innerHTML='<div class="card muted">戦闘イベント・クエストで出現構成が決定すると、ここへ自動表示されます。</div>';if($('rollEncounterDropBtn'))$('rollEncounterDropBtn').disabled=true;return;}if($('rollEncounterDropBtn'))$('rollEncounterDropBtn').disabled=false;
  const counts={};
  box.innerHTML=rows.map(row=>{const m=encounterInstanceMonster(row);const name=m?.name||row.name||'名称未設定';counts[name]=(counts[name]||0)+1;const no=counts[name];return `<article class="encounter-drop-instance"><div class="encounter-drop-title"><b>${esc(name)} #${no}</b>${row.formation?`<span class="pill">${esc(row.formation)}</span>`:''}</div><div class="muted small">解体難易度：${esc(m?.dismantleDifficulty||'未設定')}</div><label class="encounter-dismantle-check"><input type="checkbox" data-encounter-dismantle="${esc(row.uid)}" ${row.dismantleSuccess?'checked':''}><span>解体判定成功（ドロップ率+10%）</span></label></article>`;}).join('');
}
function dropQuantityRoll(raw='1'){
  const text=String(raw||'1').trim();const dice=text.match(/(\d+)D(\d+)/i);if(dice){let total=0;const rolls=[];for(let i=0;i<Number(dice[1]);i++){const v=1+Math.floor(Math.random()*Number(dice[2]));rolls.push(v);total+=v;}return{count:total,detail:`${text}→${total}（${rolls.join('+')}）`};}
  const m=text.match(/\d+/);return{count:Math.max(1,Number(m?.[0]||1)),detail:text};
}
function rollEncounterDrops(){
  const instances=normalizeDropInstances(state.dropEncounterInstances||[]);if(!instances.length){$('dropResult').textContent='出現構成が空です。';return;}
  const all=['【出現構成ドロップ判定】'];const aggregate=new Map();const html=[];const nameCounts={};
  instances.forEach(instance=>{const m=encounterInstanceMonster(instance);if(!m)return;const name=m.name||instance.name||m.id;nameCounts[name]=(nameCounts[name]||0)+1;const label=`${name} #${nameCounts[name]}`;const drops=parseDrops(m.drops);const bonus=instance.dismantleSuccess?10:0;all.push('',`〔${label}〕`,`解体：${instance.dismantleSuccess?'成功（全ドロップ率+10%）':'補正なし'}${m.dismantleDifficulty?` / 解体難易度 ${m.dismantleDifficulty}`:''}`);const resultRows=[];
    drops.forEach(d=>{const material=findDropMaterial(d);const roll=1+Math.floor(Math.random()*100);const base=rateNum(d.rate);const rate=Math.min(100,base+bonus);const ok=roll<=rate;const itemName=d.name||d.id||material?.name||'名称未設定';const rateText=instance.dismantleSuccess?`${base}%→${rate}%`:`${rate}%`;let qty=null;let qtyText=String(d.count||'1個');if(ok){qty=dropQuantityRoll(d.count||'1');qtyText=qty.detail;const key=dropPublicId(material,d)||itemName;const current=aggregate.get(key)||{name:itemName,material,d,count:0};current.count+=qty.count;aggregate.set(key,current);}all.push(`${ok?'○':'×'} ${itemName} ${qtyText}（${rateText} / 出目${roll}）`);resultRows.push(`<div class="drop-row ${ok?'success':'fail'}"><div><b>${esc(itemName)}</b>${dropDetailHtml(material)}</div><span class="pill">${esc(rateText)}</span><span class="pill">${ok?`入手 ${esc(qtyText)}`:'なし'} / ${roll}</span></div>`);});
    html.push(`<section class="encounter-drop-result-group"><h4>${esc(label)}${instance.formation?` <span class="pill">${esc(instance.formation)}</span>`:''}</h4><div class="muted small">解体：${instance.dismantleSuccess?'成功（+10%）':'補正なし'}</div><div class="drop-list">${resultRows.join('')||'<div class="muted">ドロップ設定なし</div>'}</div></section>`);
  });
  const got=['【出現構成ドロップ入手】'];if(!aggregate.size)got.push('入手なし');else aggregate.forEach(row=>{const d={...row.d,count:`${row.count}個`};got.push(dropPlayerInfoBlock(d));});kohakuCommitDropMaterials(aggregate,instances);const bounty=encounterBountyTotal(state.lastEncounter);if(bounty>0)got.push(`討伐報酬：${bounty}G（PT共通）`);state.lastDropText=all.join('\n');state.lastDropSuccessText=got.join('\n\n');$('dropResult').innerHTML=`${bounty>0?`<div class="card"><b>討伐報酬：${bounty}G（PT共通）</b></div>`:''}<div class="encounter-drop-result-list">${html.join('')}</div>`;addLog(`出現構成ドロップ判定：${instances.length}体${bounty>0?` / 討伐報酬${bounty}G`:''}`);
}
function rollDrops(){
  const m=selectedDropMonster(); if(!m){$('dropResult').textContent='候補から魔物を選択してください。';return;}
  const drops=parseDrops(m.drops); if(!drops.length){$('dropResult').textContent='ドロップ設定がありません。'; return;}
  const dismantleOk=!!$('dismantleSuccess')?.checked;
  const dismantleBonus=dismantleOk?10:0;
  const difficulty=String(m.dismantleDifficulty||'').trim();
  const all=[`【ドロップ判定】${m.name||m.id}`, `解体：${dismantleOk?'成功（全ドロップ率+10%）':'補正なし'}${difficulty?` / 解体難易度 ${difficulty}`:''}`];
  const got=[`【ドロップ入手】${m.name||m.id}`];
  const html=[];
  drops.forEach(d=>{
    const material=findDropMaterial(d);
    const r=1+Math.floor(Math.random()*100);
    const baseRate=rateNum(d.rate);
    const rate=Math.min(100,baseRate+dismantleBonus);
    const ok=r<=rate;
    const name=d.name||d.id||material?.name||'名称未設定';
    const rateText=dismantleOk?`${baseRate}%→${rate}%`:`${rate}%`;
    const line=`${ok?'○':'×'} ${name} ${d.count||''}（${rateText} / 出目${r}）`;
    all.push(line);
    if(ok) got.push(dropOutputBlock(d));
    const detail=dropDetailHtml(material);
    const chips=[d.large||material?.materialType,d.small||material?.materialCategory,material?.rank?`ランク:${progressPlayerRank(material.rank)}`:'',material?.sellPrice?`売値:${material.sellPrice}G`:''].filter(Boolean);
    html.push(`<div class="drop-row ${ok?'success':'fail'}"><div><b>${esc(name)}</b><br><span class="muted small">${esc([d.large,d.small,d.id].filter(Boolean).join(' / '))}</span>${detail}</div><span class="pill">${esc(rateText)}</span><span class="pill">${ok?'入手':'なし'} ${r}</span></div>`);
  });
  if(got.length===1) got.push('入手なし');
  state.lastDropText=all.join('\n'); state.lastDropSuccessText=got.join('\n');
  $('dropResult').innerHTML=`<div class="drop-list">${html.join('')}</div>`; addLog(`ドロップ判定：${m.name||m.id}${dismantleOk?'（解体成功・全率+10%）':''}`);
}
let copyToastTimer=null;
function copyFeedbackLabel(button=null){const raw=String(button?.dataset?.copyLabel||button?.textContent||'').replace(/\s+/g,' ').trim();if(!raw)return'内容';return raw.replace(/をコピー(?:しました)?$/,'').replace(/コピー$/,'').trim()||'内容';}
function showCopyToast(label='内容'){const el=$('copyToast');if(!el)return;const text=`${String(label||'内容').trim()||'内容'}をコピーしました`;el.textContent=text;el.classList.add('show');clearTimeout(copyToastTimer);copyToastTimer=setTimeout(()=>el.classList.remove('show'),1800);}
async function copyText(text,noteId,label=''){
  const v=String(text||'').trim(); if(!v)return;
  const resolved=String(label||'').trim()||copyFeedbackLabel(document.activeElement);
  try{await navigator.clipboard.writeText(v);}catch(e){const ta=document.createElement('textarea'); ta.value=v; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();}
  if(noteId){const el=$(noteId);if(el){el.textContent=`${resolved}をコピーしました`;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1500);}}
  showCopyToast(resolved);addLog(`${resolved}をコピーしました。`);
}
function questMemo(){const q=selected($('questSelect'),state.quests); if(!q)return ''; const p=progressObj('quests',q.id||q.name); const delivery=isDeliveryQuest(q); const qa=areaForQuest(q),qt=(!delivery&&!isBaseQuest(q)&&areaUsesWorldCycle(qa))?selectedTimeSlot():''; return [`【クエスト進行】${q.name||q.id}`,isImportantQuest(q)?'':`依頼区分：${q.requestKind||'未設定'}`,!delivery&&q.recommendedSkills?`推奨技能：${q.recommendedSkills}`:'',`実施場所：${questLocationText(q)}`,`時間帯：${questTimeRestrictionText(q)}`,qt?`現在の時間帯：${qt}`:'',delivery?`納品状況：${clamp(p.value)>=100?'完了':'未完了'}`:`進行度：${clamp(p.value)}%`,q.deliveryItems?`納品物：${q.deliveryItems}`:'',...questBattleRoundLines(q),!questSpecialConditionLabel(q)&&q.clearCondition?`クリア条件：${q.clearCondition}`:'',q.rewardMoney||q.rewardItems||q.rewardTableId||Number(q.bonusPoints||0)>0?`報酬：${[q.rewardMoney,questRewardItemDisplay(q),Number(q.bonusPoints||0)>0?`ボーナスポイント${Number(q.bonusPoints)}点`:'' ].filter(Boolean).join(' / ')}（${q.rewardScope||'各PC'}）`:'',p.note?`メモ：${p.note}`:''].filter(Boolean).join('\n');}
function questPublicRewardText(q={}){
  return [q.rewardMoney,questRewardItemDisplay(q),Number(q.bonusPoints||0)>0?`ボーナスポイント${Number(q.bonusPoints)}点`:'',q.unlockResult?`解放：${q.unlockResult}`:''].filter(Boolean).join(' / ');
}
function questPublicInfoLines(q={}){
  return [
    `クエスト名：${q.name||q.id||'名称未設定'}`,
    isImportantQuest(q)?'':`依頼区分：${q.requestKind||'未設定'}`,
    `内容種別：${q.questType||'未設定'}`,
    !isDeliveryQuest(q)&&q.recommendedSkills?`推奨技能：${q.recommendedSkills}`:'',
    `実施場所：${questLocationText(q)}`,
    `時間帯：${questTimeRestrictionText(q)}`,
    `クエスト説明：${q.description||'説明未設定'}`,
    q.deliveryItems?`納品物：${q.deliveryItems}`:'',
    ...questBattleRoundLines(q),
    !questSpecialConditionLabel(q)?`達成条件：${q.clearCondition||'未設定'}`:'',
    `報酬：${questPublicRewardText(q)||'なし'}（${q.rewardScope||'各PC'}）`
  ].filter(Boolean);
}
function questInfoMemo(){
  const q=selected($('questSelect'),state.quests);
  return q ? questPublicInfoLines(q).join('\n') : '';
}
function areaMemo(){const a=selected($('areaSelect'),state.areas); if(!a)return ''; const p=progressObj('areas',a.id||a.name); const w=currentAreaWeather(a),time=areaUsesWorldCycle(a)?selectedTimeSlot():''; return [`【エリア探索】${a.name||a.id}`,time?`時間帯：${time}`:'',w?`天気：${w.name}`:'',w?.detail?`天気詳細：${w.detail}`:'',`探索進行度：${clamp(p.value)}%`,a.eventTableId?`イベント表：${a.eventTableId}`:'',a.mainMaterials?`主な素材：${a.mainMaterials}`:'',a.mainMonsters?`主な魔物：${a.mainMonsters}`:'',a.fieldEffect&&a.fieldEffect!=='なし'?`フィールド効果：${a.fieldEffect}`:'',p.note?`メモ：${p.note}`:''].filter(Boolean).join('\n');}
