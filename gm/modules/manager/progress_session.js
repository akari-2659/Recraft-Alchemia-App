function v738DeepClone(value){try{return structuredClone(value);}catch(_e){try{return JSON.parse(JSON.stringify(value));}catch(_e2){return value;}}}
function v738Bool(value){return ['1','true','yes','on'].includes(String(value??'').trim().toLowerCase())||String(value??'').trim().toUpperCase()==='TRUE';}
function isHiddenAreaRow(row={}){row=row||{};return v738Bool(row.isHiddenArea)||String(row.id||'').startsWith('hidden_')||String(row.areaType||'').trim()==='隠しエリア';}
function visibleExplorationAreas(){return (state.areas||[]).filter(a=>!isHiddenAreaRow(a));}
function hiddenExplorationAreas(){return (state.areas||[]).filter(isHiddenAreaRow);}
function hiddenAreaById(id=''){return (state.areas||[]).find(a=>isHiddenAreaRow(a)&&String(a.id||'')===String(id||''))||null;}
function selectedExplorationArea(){return selected($('areaSelect'),state.areas);}
function isBaseExplorationSelected(){return String($('areaSelect')?.value||'')===BASE_EXPLORATION_ID;}
function fillExplorationAreaSelect(prefer=''){
  const sel=$('areaSelect');if(!sel)return;
  const prev=String(prefer||sel.value||'').trim();
  const rows=visibleExplorationAreas().slice().sort((a,b)=>(Number(a.unlockOrder)||999999)-(Number(b.unlockOrder)||999999)||String(a.name||a.id||'').localeCompare(String(b.name||b.id||''),'ja'));
  sel.innerHTML='';
  const base=document.createElement('option');base.value=BASE_EXPLORATION_ID;base.textContent='開拓拠点リクラフト';sel.appendChild(base);
  rows.forEach(a=>{const o=document.createElement('option');o.value=String(a.id||a.name||'');o.textContent=String(a.name||a.id||'');sel.appendChild(o);});
  const values=new Set([...sel.options].map(o=>o.value));sel.value=values.has(prev)?prev:BASE_EXPLORATION_ID;
}
function v738LoadImportantVisibility(){try{const raw=localStorage.getItem(IMPORTANT_VISIBILITY_STORE_KEY);progressUiV738.importantVisibility=raw?JSON.parse(raw):{};}catch(_e){progressUiV738.importantVisibility={};}}
function v738SaveImportantVisibility(){try{localStorage.setItem(IMPORTANT_VISIBILITY_STORE_KEY,JSON.stringify(progressUiV738.importantVisibility||{}));}catch(_e){}}
const v737QuestEnabled=questEnabled;
questEnabled=function(row={}){
  const key=String(row.id||row.name||'').trim();
  if(key&&Object.prototype.hasOwnProperty.call(progressUiV738.importantVisibility,key))return !!progressUiV738.importantVisibility[key];
  return v737QuestEnabled(row);
};
const v737SortedQuestAreas=sortedQuestAreas;
sortedQuestAreas=function(){return v737SortedQuestAreas().filter(a=>!isHiddenAreaRow(a));};
const v737SortedDropAreas=sortedDropAreas;
sortedDropAreas=function(){return v737SortedDropAreas().filter(a=>!isHiddenAreaRow(a));};
const v737ApplyProgressMaster=applyProgressMaster;
applyProgressMaster=function(master){
  const questBefore=String($('questSelect')?.value||'');
  const areaBefore=String($('areaSelect')?.value||BASE_EXPLORATION_ID);
  const result=v737ApplyProgressMaster(master);
  fillQuestSelect(questBefore);
  fillExplorationAreaSelect(areaBefore);
  if(progressUiV738.hidden.active&&areaBefore){
    const hidden=hiddenAreaById(areaBefore),sel=$('areaSelect');
    if(hidden&&sel){
      let opt=[...sel.options].find(o=>o.value===areaBefore);
      if(!opt){opt=document.createElement('option');opt.value=areaBefore;opt.textContent=String(hidden.name||areaBefore);opt.dataset.hiddenTemp='1';sel.appendChild(opt);}
      sel.value=areaBefore;
    }
  }
  normalizeBaseUnlockedAreaIds();renderBaseEventControls();renderDailyUnlockedAreaControl();renderArea();renderQuest();
  return result;
};
function v738CurrentSeenSet(scope='event'){return progressUiV738.seen[scope]||(progressUiV738.seen[scope]=new Set());}
function v738FilterUnseen(scope,rows=[]){
  const list=(rows||[]).filter(Boolean),seen=v738CurrentSeenSet(scope);
  if(!list.length)return [];
  // 通常の探索・クエスト・拠点では、同一進行中に一度出たイベントは再登場させない。
  // 隠しエリアの二つ名遭遇だけは eventRowsForArea() 側で別扱いにしている。
  return list.filter(row=>!seen.has(eventUniqueKey(row)));
}
function v738MarkSeen(scope,key=''){if(key)v738CurrentSeenSet(scope).add(String(key));}
const v737QuestRandomEvents=questRandomEvents;
questRandomEvents=function(q){const rows=v737QuestRandomEvents(q);return progressUiV738.questActive?v738FilterUnseen('quest',rows):rows;};
const v737EventRowsForArea=eventRowsForArea;
eventRowsForArea=function(area,options={}){
  const rows=v737EventRowsForArea(area,options);
  if(!(progressUiV738.areaActive||progressUiV738.hidden.active))return rows;
  // 隠しエリアは二つ名戦闘のみ。二つ名遭遇は狩り直し用途のため同一探索中でも再出現可。
  if(isHiddenAreaRow(area)||progressUiV738.hidden.active){
    return rows.filter(row=>isNamedEncounterEvent(row));
  }
  return v738FilterUnseen('event',rows);
};
const v737BaseEventRows=baseEventRows;
baseEventRows=function(){const rows=v737BaseEventRows();return progressUiV738.areaActive&&progressUiV738.areaMode==='base'?v738FilterUnseen('base',rows):rows;};

function v738CreateModal(id,titleId,z=1200){
  const back=document.createElement('div');back.id=id;back.className='progress-modal-backdrop hidden';back.style.zIndex=String(z);back.setAttribute('aria-hidden','true');
  back.innerHTML=`<div class="progress-modal-card" role="dialog" aria-modal="true" aria-labelledby="${titleId}"><header class="progress-modal-head"><h2 id="${titleId}">進行</h2></header><div class="progress-modal-body"></div><footer class="progress-modal-foot"></footer></div>`;
  document.body.appendChild(back);return back;
}
function v738MoveRange(start,end,host){let node=start;while(node){const next=node.nextSibling;host.appendChild(node);if(node===end)break;node=next;}}
function v738Button(id,label,cls=''){const b=document.createElement('button');b.id=id;b.type='button';b.textContent=label;if(cls)b.className=cls;return b;}
function setupProgressModalUi(){
  if(progressUiV738.ready)return;progressUiV738.ready=true;v738LoadImportantVisibility();
  const nav=$('progressTabNav');nav?.querySelector('[data-tab-target="base-event"]')?.remove();
  const questSection=document.querySelector('[data-progress-tab="quest"]'),areaSection=document.querySelector('[data-progress-tab="area"]'),baseSection=document.querySelector('[data-progress-tab="base-event"]');
  const qModal=v738CreateModal('questProgressModal','questProgressModalTitle',1200),aModal=v738CreateModal('areaProgressModal','areaProgressModalTitle',1200),hModal=v738CreateModal('hiddenProgressModal','hiddenProgressModalTitle',1300),dModal=v738CreateModal('dropProgressModal','dropProgressModalTitle',1400);
  qModal.querySelector('.progress-modal-head').insertAdjacentHTML('beforeend','<div class="progress-modal-subtabs"><button id="questOpenDropBtn" class="secondary hidden" type="button">アイテムドロップ</button></div>');
  aModal.querySelector('.progress-modal-head').insertAdjacentHTML('beforeend','<div class="progress-modal-subtabs"><button id="areaOpenDropBtn" class="secondary hidden" type="button">アイテムドロップ</button></div>');
  hModal.querySelector('.progress-modal-head').insertAdjacentHTML('beforeend','<span class="hidden-area-badge">隠しエリア</span><div class="progress-modal-subtabs"><button id="hiddenOpenDropBtn" class="secondary hidden" type="button">アイテムドロップ</button></div>');
  dModal.querySelector('.progress-modal-head h2').textContent='アイテムドロップ';
  qModal.querySelector('.progress-modal-foot').append(v738Button('questEndBtn','クエストを終了','ghost'));
  aModal.querySelector('.progress-modal-foot').append(v738Button('areaEndBtn','探索を終了','ghost'));
  hModal.querySelector('.progress-modal-foot').append(v738Button('hiddenEndBtn','探索を終了','ghost'));
  dModal.querySelector('.progress-modal-foot').append(v738Button('dropModalCloseBtn','閉じる','ghost'));

  const qStart=$('questBar')?.closest('.progress-wrap')?.previousElementSibling,qEnd=$('questNote');
  const qRuntime=document.createElement('div');qRuntime.id='questProgressRuntime';qRuntime.className='progress-runtime';qModal.querySelector('.progress-modal-body').appendChild(qRuntime);if(qStart&&qEnd)v738MoveRange(qStart,qEnd,qRuntime);
  if($('questResetBtn'))$('questResetBtn').classList.add('hidden');if($('questAdvanceBtn'))$('questAdvanceBtn').textContent='進行';if($('rollQuestEventBtn'))$('rollQuestEventBtn').textContent='エリアイベント';
  const qReroll=v738Button('rerollQuestEventBtn','再抽選','secondary hidden');$('rollQuestEventBtn')?.insertAdjacentElement('afterend',qReroll);
  const qEntry=document.createElement('div');qEntry.id='questHiddenEntryPanel';qEntry.className='card hidden hidden-entry-panel';$('questImportantUseResult')?.insertAdjacentElement('afterend',qEntry);
  const qStartActions=document.createElement('div');qStartActions.className='buttons start-actions';qStartActions.append(v738Button('questStartBtn','クエスト開始'),v738Button('toggleImportantQuestVisibilityBtn','非表示にする','ghost hidden'));$('questDetail')?.insertAdjacentElement('afterend',qStartActions);

  const areaStart=$('areaBar')?.closest('.progress-wrap')?.previousElementSibling,areaEnd=$('areaNote');
  const areaRuntime=document.createElement('div');areaRuntime.id='areaProgressRuntime';areaRuntime.className='progress-runtime';aModal.querySelector('.progress-modal-body').appendChild(areaRuntime);if(areaStart&&areaEnd)v738MoveRange(areaStart,areaEnd,areaRuntime);
  if($('areaResetBtn'))$('areaResetBtn').classList.add('hidden');if($('areaAdvanceBtn'))$('areaAdvanceBtn').textContent='進行';if($('rollEventBtn'))$('rollEventBtn').textContent='エリアイベント';
  const aReroll=v738Button('rerollEventBtn','再抽選','secondary hidden');$('rollEventBtn')?.insertAdjacentElement('afterend',aReroll);
  const aEntry=document.createElement('div');aEntry.id='areaHiddenEntryPanel';aEntry.className='card hidden hidden-entry-panel';$('eventImportantUseResult')?.insertAdjacentElement('afterend',aEntry);
  const areaStartActions=document.createElement('div');areaStartActions.className='buttons start-actions';areaStartActions.append(v738Button('areaStartBtn','探索開始'));$('areaDetail')?.insertAdjacentElement('afterend',areaStartActions);

  const baseRuntime=document.createElement('div');baseRuntime.id='baseProgressRuntime';baseRuntime.className='progress-runtime hidden';
  if(baseSection){while(baseSection.firstChild)baseRuntime.appendChild(baseSection.firstChild);baseSection.remove();}aModal.querySelector('.progress-modal-body').appendChild(baseRuntime);
  if($('rollBaseEventBtn'))$('rollBaseEventBtn').textContent='エリアイベント';const bReroll=v738Button('rerollBaseEventBtn','再抽選','secondary hidden');$('rollBaseEventBtn')?.insertAdjacentElement('afterend',bReroll);
  const bEntry=document.createElement('div');bEntry.id='baseHiddenEntryPanel';bEntry.className='card hidden hidden-entry-panel';$('baseImportantUseResult')?.insertAdjacentElement('afterend',bEntry);

  // Daily quest draw/count controls are always visible when the Daily category is selected.
  const daily=$('dailyQuestTools'),dailySelection=$('dailyQuestSelectionPanel');if(daily&&dailySelection){
    v740LoadDailyCounts();
    const areaControl=document.createElement('div');areaControl.className='area-select-control';
    areaControl.innerHTML=`<div class="area-select-control-main"><b>デイリー抽選対象の解放エリア</b><div id="dailyUnlockedAreaSummary" class="area-select-summary">DB読込後、選択状況を表示します。</div></div><button id="openDailyAreaModalBtn" class="secondary" type="button">抽選対象エリアを選択</button>`;
    const countGrid=document.createElement('div');countGrid.className='daily-count-grid';
    countGrid.innerHTML=GUILD_DAILY_REQUEST_KINDS.map(kind=>`<label>${kind}の抽選件数<select data-progress-daily-count="${kind}">${v740DailyCountOptions(kind)}</select></label>`).join('');
    const draw=document.createElement('div');draw.className='daily-draw-grid';draw.innerHTML=`<button type="button" class="secondary" data-progress-daily-reroll="拠点内依頼">拠点内依頼：個別抽選</button><button type="button" class="secondary" data-progress-daily-reroll="エリア依頼">エリア依頼：個別抽選</button><button type="button" class="secondary" data-progress-daily-reroll="納品依頼">納品依頼：個別抽選</button><button type="button" data-progress-daily-reroll="">全体抽選</button>`;
    $('dailyAreaControlMount')?.appendChild(areaControl);
    $('dailyCountGridMount')?.appendChild(countGrid);
    $('dailyDrawGridMount')?.appendChild(draw);
    renderDailyUnlockedAreaControl();
    const old=$('refreshDailyQuestsBtn');if(old)old.textContent='保存済み選出を再読込';
  }
  document.querySelectorAll('[data-important-use-copy]').forEach(b=>b.classList.add('hidden'));
  if($('copyDropSuccessBtn'))$('copyDropSuccessBtn').textContent='入手アイテムをコピー';

  // Drop section remains a normal utility tab, but is temporarily moved into a child modal during combat.
  const dropSection=document.querySelector('[data-progress-tab="drop"]');if(dropSection){progressUiV738.dropRestore={parent:dropSection.parentNode,next:dropSection.nextSibling,wasActive:false,section:dropSection};}
  fillExplorationAreaSelect();v738RefreshMainSelectionUi();
}
function v738SetModalOpen(id,open){const m=$(id);if(!m)return;m.classList.toggle('hidden',!open);m.setAttribute('aria-hidden',open?'false':'true');document.body.classList.toggle('progress-modal-open',!!document.querySelector('.progress-modal-backdrop:not(.hidden)'));}
function v738RefreshMainSelectionUi(){
  const q=selected($('questSelect'),state.quests),toggle=$('toggleImportantQuestVisibilityBtn');
  if(toggle){const important=q&&questCategoryFor(q)==='重要';toggle.classList.toggle('hidden',!important);if(important)toggle.textContent=questEnabled(q)?'非表示にする':'表示する';}
  const detail=$('areaDetail');if(isBaseExplorationSelected()&&detail){detail.innerHTML='<div class="kv"><b>探索先</b><span>開拓拠点リクラフト</span><b>進行</b><span>+25%</span><b>イベント</b><span>解放済みエリアに応じた拠点内イベント</span></div><p class="muted">開拓拠点内を巡り、持ち込まれた仕事や小さな出来事を確認します。</p>';}
}
function v738OpenQuestModal(){const q=selected($('questSelect'),state.quests);if(!q)return; $('questProgressModalTitle').textContent=String(q.name||q.id||'クエスト');v738SetModalOpen('questProgressModal',true);}
function v738OpenAreaModal(title=''){const name=title||(isBaseExplorationSelected()?'開拓拠点リクラフト：探索':`${selectedExplorationArea()?.name||'エリア'}：探索`);$('areaProgressModalTitle').textContent=name;v738SetModalOpen('areaProgressModal',true);}
function v738ToggleAreaRuntime(mode='normal'){
  progressUiV738.areaMode=mode;
  // The gauge and [進行] controls are common to normal-area and base exploration.
  // Only the event engine below them is switched.
  $('areaProgressRuntime')?.classList.remove('hidden');
  document.querySelector('#areaProgressRuntime .area-event-block')?.classList.toggle('hidden',mode==='base');
  const note=$('areaNote'),noteLabel=note?.previousElementSibling;if(note)note.classList.toggle('hidden',mode==='base');if(noteLabel&&noteLabel.tagName==='LABEL')noteLabel.classList.toggle('hidden',mode==='base');
  $('baseProgressRuntime')?.classList.toggle('hidden',mode!=='base');
}
function v738ResetQuestSessionState(q){
  const key=String(q.id||q.name||'');const p=progressObj('quests',key);p.value=0;progressUiV738.seen.quest=new Set();progressUiV738.slotResolved.quest=false;progressUiV738.questActive=true;
  Object.keys(state.triggeredQuestEvents||{}).filter(k=>k.startsWith(key+':')).forEach(k=>delete state.triggeredQuestEvents[k]);
  state.lastQuestFixedEventText='';state.lastQuestFixedEventKey='';clearQuestRandomEventHistory();progressUiV738.importantApplied.quest=null;
}
function v738ResetAreaSessionState(areaKey,scope='event'){
  const p=progressObj('areas',areaKey);p.value=0;progressUiV738.seen[scope]=new Set();progressUiV738.slotResolved[scope]=false;progressUiV738.areaActive=true;
  if(scope==='event'&&!isHiddenAreaRow(selectedExplorationArea()||{})){
    const area=selectedExplorationArea()||{id:areaKey};
    delete state.areaBossEncountered[areaEventKey(area)];
    kohakuResetLedger(area);
  }
  if(scope==='base'){
    state.lastBaseEventText='';state.lastBaseEventKey='';state.lastBaseCheckCopyText='';state.lastBaseOutcomeKey='';state.lastBaseRewardText='';state.lastBaseRewardCopyText='';state.lastBaseEventRewardState=null;state.lastBaseEventTableRewardState=null;progressUiV738.importantApplied.base=null;renderBaseEventControls();
  }else{clearAreaRandomEventHistory();progressUiV738.importantApplied.event=null;}
}
function v738QuestFixedAt(q,value){return questSpecificEvents(q).filter(e=>Number(eventThreshold(e))===Number(value));}
function v738PrepareQuestSlot(q){
  const p=progressObj('quests',q.id||q.name),current=clamp(p.value);
  if(isDeliveryQuest(q)){progressUiV738.slotResolved.quest=true;v738UpdateProgressControls();return;}
  const rows=v738QuestFixedAt(q,current);if(rows.length){triggerQuestSpecificEvents(q,current-0.001,current);progressUiV738.slotResolved.quest=true;}else{progressUiV738.slotResolved.quest=false;}
  v738UpdateProgressControls();renderQuest();
}
function v738PrepareAreaSlot(a){
  if(!a)return;const p=progressObj('areas',a.id||a.name),current=clamp(p.value);
  // 100%のボス噂は、モーダルを開いただけでは未処理。
  // 「噂を追う」または「通常イベント」を実際に決定した時点で slotResolved を立てる。
  if(!isHiddenAreaRow(a)&&current===100)triggerAreaClearRumorEvent(a);
  progressUiV738.slotResolved.event=false;v738UpdateProgressControls();renderArea();
}
function v738PrepareBaseSlot(){progressUiV738.slotResolved.base=false;v738UpdateProgressControls();renderBaseEventControls();}
function startQuestProgressSession(){
  const q=selected($('questSelect'),state.quests);if(!q)return;v738ResetQuestSessionState(q);v738OpenQuestModal();v738PrepareQuestSlot(q);renderQuest();saveState(false);addLog(`クエスト開始：${q.name||q.id}`);
}
function startAreaProgressSession(){
  const baseSelected=isBaseExplorationSelected();
  const selectedArea=baseSelected?null:selectedExplorationArea();
  if(!baseSelected&&(!selectedArea||isHiddenAreaRow(selectedArea)))return;
  if(!consumeDailyAction(baseSelected?'開拓拠点リクラフトの探索':`${selectedArea.name||'エリア'}の探索`))return;
  if(baseSelected){
    v738ToggleAreaRuntime('base');v738ResetAreaSessionState(BASE_EXPLORATION_ID,'base');v738OpenAreaModal('開拓拠点リクラフト：探索');
    $('areaBar').style.width='0%';$('areaLabel').textContent='0%';$('areaStepInfo').innerHTML='<div class="kv"><b>現在</b><span>0%</span><b>1回の進行</b><span>+25%</span><b>イベント</b><span>毎回ランダム</span></div>';v738PrepareBaseSlot();saveState(false);addLog('探索開始：開拓拠点リクラフト');return;
  }
  const a=selectedArea;v738ToggleAreaRuntime('normal');v738ResetAreaSessionState(a.id||a.name,'event');v738OpenAreaModal(`${a.name||a.id}：探索`);renderArea();v738PrepareAreaSlot(a);saveState(false);addLog(`探索開始：${a.name||a.id}`);
}
function v738CloseQuestSession(){
  const q=selected($('questSelect'),state.quests);
  if(!q){progressUiV738.questActive=false;v738SetModalOpen('questProgressModal',false);return;}
  const key=String(q.id||q.name||''),p=progressObj('quests',key),value=clamp(p.value),completed=value>=100&&!!progressUiV738.slotResolved.quest;
  if(!completed){
    const msg=value>=100&&!progressUiV738.slotResolved.quest
      ?'100%地点のイベントがまだ未処理です。クエストを終了すると進行度は破棄されます。撤退しますか？'
      :'未完了のクエストから撤退しますか？\n現在のクエスト進行度は破棄され、次回は0%から開始します。';
    if(!confirm(msg))return;
    p.value=0;
    Object.keys(state.triggeredQuestEvents||{}).filter(k=>k.startsWith(key+':')).forEach(k=>delete state.triggeredQuestEvents[k]);
    state.lastQuestFixedEventText='';state.lastQuestFixedEventKey='';state.lastQuestCheckCopyText='';state.lastQuestBattleCheckCopyText='';
    state.lastQuestTreasureCopyText='';state.lastQuestTreasureResults=[];state.lastQuestEventTableRewardText='';state.lastQuestEventTableRewardCopyText='';
    state.lastQuestEventRewardState=null;state.lastQuestReinforcementText='';if(state.questWorkReinforcementCounts)delete state.questWorkReinforcementCounts[key];
    clearQuestRandomEventHistory();progressUiV738.slotResolved.quest=false;progressUiV738.importantApplied.quest=null;
    addLog(`クエスト撤退：${q.name||q.id}（進行度を破棄）`);
  }else addLog(`クエスト完了：${q.name||q.id}`);
  progressUiV738.questActive=false;progressUiV738.slotResolved.quest=false;v738SetModalOpen('questProgressModal',false);saveState(false);renderQuest();v738UpdateProgressControls();
}
function v738CloseAreaSession(){
  if(progressUiV738.hidden.active){endHiddenExploration();return;}
  const scope=progressUiV738.areaMode==='base'?'base':'event';
  const a=scope==='base'?null:selectedExplorationArea();
  const key=scope==='base'?BASE_EXPLORATION_ID:String(a?.id||a?.name||'');
  const p=key?progressObj('areas',key):null,value=clamp(p?.value||0),resolved=!!progressUiV738.slotResolved[scope];
  if(value<100||!resolved){
    const msg=value>=100&&!resolved
      ?'100%地点のイベントがまだ未処理です。探索を終了すると、この探索進行度は破棄されます。終了しますか？'
      :'探索を途中で終了しますか？\n現在の探索進行度は破棄され、次回は0%から開始します。';
    if(!confirm(msg))return;
  }
  const completed=value>=100&&resolved;
  if(p)p.value=0;
  if(!completed){
    if(scope==='base'){
      state.lastBaseEventText='';state.lastBaseEventKey='';state.lastBaseCheckCopyText='';state.lastBaseOutcomeKey='';
      state.lastBaseRewardText='';state.lastBaseRewardCopyText='';state.lastBaseEventRewardState=null;state.lastBaseEventTableRewardState=null;
      progressUiV738.importantApplied.base=null;
    }else{
      clearAreaRandomEventHistory();progressUiV738.importantApplied.event=null;
      if(a)kohakuResetLedger(a);
    }
  }
  progressUiV738.areaActive=false;progressUiV738.slotResolved[scope]=false;v738SetModalOpen('areaProgressModal',false);
  renderEventRewardPanel(scope);updateTreasureCopyButtons();saveState(false);addLog(completed?'探索完了。次回の探索は0%から開始します。':'探索撤退：進行度と探索中の一時状態を破棄しました。');
}
function v738CurrentProgressValue(scope){if(scope==='quest'){const q=selected($('questSelect'),state.quests);return q?clamp(progressObj('quests',q.id||q.name).value):0;}if(scope==='base')return clamp(progressObj('areas',BASE_EXPLORATION_ID).value);const a=selectedExplorationArea();return a?clamp(progressObj('areas',a.id||a.name).value):0;}
function v738UpdateProgressControls(){
  const qVal=v738CurrentProgressValue('quest'),aScope=progressUiV738.areaMode==='base'?'base':'event',aVal=v738CurrentProgressValue(aScope);
  const selectedQuest=selected($('questSelect'),state.quests)||{};
  const questNeedsAction=!isDeliveryQuest(selectedQuest);
  const noQuestActions=questNeedsAction&&(state.dayState?.awaitingEnd||dailyActionsRemaining()<=0);
  if($('questAdvanceBtn'))$('questAdvanceBtn').disabled=!progressUiV738.slotResolved.quest||qVal>=100||noQuestActions;
  if($('areaAdvanceBtn'))$('areaAdvanceBtn').disabled=!progressUiV738.slotResolved[aScope]||aVal>=100;
  if($('questEndBtn'))$('questEndBtn').textContent=qVal>=100&&progressUiV738.slotResolved.quest?'クエスト完了':'撤退';
  if($('areaEndBtn'))$('areaEndBtn').textContent=aVal>=100&&progressUiV738.slotResolved[aScope]?'探索完了':'探索を終了';
  if($('hiddenEndBtn'))$('hiddenEndBtn').textContent='元の探索へ戻る';
  const qFixed=progressUiV738.questActive&&!!v738QuestFixedAt(selected($('questSelect'),state.quests)||{},qVal).length;
  if($('rollQuestEventBtn'))$('rollQuestEventBtn').disabled=!progressUiV738.questActive||progressUiV738.slotResolved.quest||qFixed||isDeliveryQuest(selected($('questSelect'),state.quests)||{});
  if($('rollEventBtn'))$('rollEventBtn').disabled=!(progressUiV738.areaActive&&aScope==='event')||progressUiV738.slotResolved.event;
  if($('rollBaseEventBtn'))$('rollBaseEventBtn').disabled=!(progressUiV738.areaActive&&aScope==='base')||progressUiV738.slotResolved.base;
  $('rerollQuestEventBtn')?.classList.toggle('hidden',!progressUiV738.questActive||!state.lastQuestEventKey||qFixed);
  $('rerollEventBtn')?.classList.toggle('hidden',!(progressUiV738.areaActive&&aScope==='event'&&state.lastEventKey));
  $('rerollBaseEventBtn')?.classList.toggle('hidden',!(progressUiV738.areaActive&&aScope==='base'&&state.lastBaseEventKey));
  v738RefreshCombatDropButtons();v738RefreshHiddenEntryAction('quest');v738RefreshHiddenEntryAction('event');v738RefreshHiddenEntryAction('base');
}
const v737AdvanceQuestProgress=advanceQuestProgress;
advanceQuestProgress=function(){
  if(!progressUiV738.questActive)return v737AdvanceQuestProgress();const q=selected($('questSelect'),state.quests);if(!q)return;const p=progressObj('quests',q.id||q.name),before=clamp(p.value);
  if(!progressUiV738.slotResolved.quest){alert('先に現在の進行度のイベントを処理してください。');return;}
  if(isDeliveryQuest(q)){p.value=100;renderQuest();v738UpdateProgressControls();saveState(false);addLog(`${q.name||q.id} の納品を完了しました。`);return;}
  if(before>=100)return;
  if(!questMatchesTime(q)){
    const msg=`${q.name||q.id} は ${questTimeRestrictionText(q)} の時間帯のみ進行できます。現在は ${selectedTimeSlot()} です。`;
    addLog(msg);alert(msg);renderQuest();return;
  }
  if(!consumeDailyAction(`${q.name||q.id} のクエスト進行`))return;
  const add=questStepAmount(q);p.value=clamp(before+add);clearQuestRandomEventHistory();progressUiV738.importantApplied.quest=null;
  const fired=triggerQuestSpecificEvents(q,before,p.value);progressUiV738.slotResolved.quest=fired.length>0;renderQuest();v738UpdateProgressControls();saveState(false);addLog(`${q.name||q.id} の進行度を +${add}% しました。${before}% → ${p.value}%`);
};
const v737AdvanceAreaProgress=advanceAreaProgress;
advanceAreaProgress=function(){
  if(!progressUiV738.areaActive)return v737AdvanceAreaProgress();
  if(progressUiV738.areaMode==='base'){
    const p=progressObj('areas',BASE_EXPLORATION_ID),before=clamp(p.value);if(!progressUiV738.slotResolved.base){alert('先に現在の進行度のイベントを処理してください。');return;}if(before>=100)return;p.value=clamp(before+25);state.lastBaseEventText='';state.lastBaseEventKey='';state.lastBaseCheckCopyText='';state.lastBaseOutcomeKey='';state.lastBaseRewardText='';state.lastBaseRewardCopyText='';state.lastBaseEventRewardState=null;state.lastBaseEventTableRewardState=null;progressUiV738.importantApplied.base=null;progressUiV738.slotResolved.base=false;$('areaBar').style.width=p.value+'%';$('areaLabel').textContent=p.value+'%';$('areaStepInfo').innerHTML=`<div class="kv"><b>現在</b><span>${p.value}%</span><b>1回の進行</b><span>+25%</span><b>進行後</b><span>${Math.min(100,p.value+25)}%</span></div>`;renderBaseEventControls();v738UpdateProgressControls();saveState(false);addLog(`開拓拠点リクラフトの探索進行度：${before}% → ${p.value}%`);return;
  }
  const a=selectedExplorationArea();if(!a)return;const p=progressObj('areas',a.id||a.name),before=clamp(p.value);if(!progressUiV738.slotResolved.event){alert('先に現在の進行度のイベントを処理してください。');return;}if(before>=100)return;kohakuCommitCurrentAreaEventMaterials();const add=areaStepAmount(a);p.value=clamp(before+add);clearAreaRandomEventHistory();progressUiV738.importantApplied.event=null;if(!isHiddenAreaRow(a)&&p.value===100)triggerAreaClearRumorEvent(a);progressUiV738.slotResolved.event=false;renderArea();v738UpdateProgressControls();saveState(false);addLog(`${a.name||a.id} の探索進行度：${before}% → ${p.value}%`);
};

const v737RollQuestEvent=rollQuestEvent;
rollQuestEvent=function(){progressUiV738.importantApplied.quest=null;progressUiV738.slotResolved.quest=false;v737RollQuestEvent();if(state.lastQuestEventKey){v738MarkSeen('quest',state.lastQuestEventKey);progressUiV738.slotResolved.quest=true;}else if(progressUiV738.questActive){progressUiV738.slotResolved.quest=true;}v738UpdateProgressControls();v738RefreshCombatDropButtons();saveState(false);};
const v737RollEvent=rollEvent;
rollEvent=function(){progressUiV738.importantApplied.event=null;progressUiV738.slotResolved.event=false;kohakuDiscardCurrentEventMaterials();v737RollEvent();if(state.lastEventKey){v738MarkSeen('event',state.lastEventKey);progressUiV738.slotResolved.event=true;const ledger=kohakuLedger();ledger.seq=(Number(ledger.seq)||0)+1;ledger.currentEventToken=`${ledger.seq}:${state.lastEventKey}`;progressUiV738.kohakuMaterials=ledger;}else if(progressUiV738.areaActive){progressUiV738.slotResolved.event=true;}v738UpdateProgressControls();v738RefreshCombatDropButtons();saveState(false);};
const v737RollBaseEvent=rollBaseEvent;
rollBaseEvent=function(){progressUiV738.importantApplied.base=null;progressUiV738.slotResolved.base=false;v737RollBaseEvent();if(state.lastBaseEventKey){v738MarkSeen('base',state.lastBaseEventKey);progressUiV738.slotResolved.base=true;}else if(progressUiV738.areaActive&&progressUiV738.areaMode==='base'){progressUiV738.slotResolved.base=true;}if(progressUiV738.areaMode==='base'){const p=progressObj('areas',BASE_EXPLORATION_ID);$('areaBar').style.width=clamp(p.value)+'%';$('areaLabel').textContent=clamp(p.value)+'%';}v738UpdateProgressControls();v738RefreshCombatDropButtons();saveState(false);};

function v738CurrentEventRow(scope='event'){
  const key=scope==='quest'?state.lastQuestEventKey:scope==='base'?state.lastBaseEventKey:state.lastEventKey;if(!key)return null;return (state.events||[]).find(e=>eventUniqueKey(e)===String(key))||null;
}
function v738HiddenAreaFromEntrance(row={}){
  if(String(row.eventType||'').trim()!=='隠しエリア入口')return null;const direct=String(row.conditionValue||'').trim();if(direct)return hiddenAreaById(direct);const m=String(row.notes||'').match(/hiddenAreaId=([^\s;]+)/);return m?hiddenAreaById(m[1]):null;
}
function v738RefreshHiddenEntryAction(scope='event'){
  const panel=$(scope==='quest'?'questHiddenEntryPanel':scope==='base'?'baseHiddenEntryPanel':'areaHiddenEntryPanel');if(!panel)return;const row=v738CurrentEventRow(scope),hidden=v738HiddenAreaFromEntrance(row||{});
  if(!hidden||progressUiV738.hidden.active){panel.classList.add('hidden');panel.innerHTML='';return;}
  panel.classList.remove('hidden');panel.innerHTML=`<h3>${esc(hidden.name||'隠しエリア')}</h3><p class="muted small">通常の探索路から外れた場所へ入れます。侵入時に行動回数を追加で1回消費します。</p><div class="buttons"><button type="button" data-hidden-area-start="${esc(hidden.id||'') }" data-hidden-origin="${esc(scope)}">探索開始</button></div>`;
}
const V738_EVENT_SNAPSHOT_FIELDS=['lastEventText','lastEventKey','lastEventCheckCopyText','lastEventTreasureCopyText','lastEventTreasureResults','lastEventTableRewardText','lastEventTableRewardCopyText','lastEventTableRewardState','lastEventRewardState','lastEventOutcomeKey','lastRecipeMerchantOffers','lastRecipeMerchantTrades','selectedRecipeMerchantId','lastRecipeMerchantContext','lastEncounter','dropEncounterInstances','lastDropText','lastDropSuccessText','tokenExportEncounter','areaBossEncountered','treasureSetup','treasureContext','lastTreasureText','lastTreasureCopyText'];
function v738SnapshotEventScope(){const out={};V738_EVENT_SNAPSHOT_FIELDS.forEach(k=>out[k]=v738DeepClone(state[k]));return out;}
function v738RestoreEventScope(snap={}){V738_EVENT_SNAPSHOT_FIELDS.forEach(k=>{if(Object.prototype.hasOwnProperty.call(snap,k))state[k]=v738DeepClone(snap[k]);});}
function startHiddenExploration(areaId='',originScope='event'){
  const hidden=hiddenAreaById(areaId);if(!hidden||progressUiV738.hidden.active)return;
  const areaSel=$('areaSelect'),runtime=$('areaProgressRuntime'),hiddenBody=$('hiddenProgressModal')?.querySelector('.progress-modal-body');if(!areaSel||!runtime||!hiddenBody)return;
  if(!consumeDailyAction(`${hidden.name||'隠しエリア'}への侵入`))return;
  progressUiV738.hidden={active:true,originScope,snapshot:{areaSelectValue:areaSel.value,eventState:v738SnapshotEventScope(),seen:[...v738CurrentSeenSet('event')],areaActive:progressUiV738.areaActive,areaMode:progressUiV738.areaMode,slotResolved:progressUiV738.slotResolved.event,importantAppliedEvent:v738DeepClone(progressUiV738.importantApplied.event),kohakuMaterials:v738DeepClone(progressUiV738.kohakuMaterials||{areaId:'',seq:0,currentEventToken:'',sources:{}})},areaId:String(areaId)};
  let opt=[...areaSel.options].find(o=>o.value===String(hidden.id||''));if(!opt){opt=document.createElement('option');opt.value=String(hidden.id||'');opt.textContent=String(hidden.name||hidden.id||'');opt.dataset.hiddenTemp='1';areaSel.appendChild(opt);}areaSel.value=String(hidden.id||'');
  hiddenBody.appendChild(runtime);v738ResetAreaSessionState(hidden.id||hidden.name,'event');progressUiV738.areaActive=true;progressUiV738.areaMode='normal';progressUiV738.slotResolved.event=false;v738ToggleAreaRuntime('normal');const hiddenEventBlock=runtime.querySelector('.area-event-block');if(hiddenEventBlock)hiddenEventBlock.classList.remove('hidden');if($('rollEventBtn')){$('rollEventBtn').classList.remove('hidden');$('rollEventBtn').disabled=false;$('rollEventBtn').textContent='エリアイベント';}if($('areaAdvanceBtn'))$('areaAdvanceBtn').disabled=true;$('hiddenProgressModalTitle').textContent=`${hidden.name||'隠しエリア'}：探索`;v738SetModalOpen('hiddenProgressModal',true);renderArea();v738PrepareAreaSlot(hidden);v738UpdateProgressControls();addLog(`隠しエリア探索開始：${hidden.name||hidden.id}`);
}
function endHiddenExploration(){
  if(!progressUiV738.hidden.active)return;const snap=progressUiV738.hidden.snapshot||{},hiddenId=String(progressUiV738.hidden.areaId||''),areaSel=$('areaSelect'),runtime=$('areaProgressRuntime'),areaBody=$('areaProgressModal')?.querySelector('.progress-modal-body');v738SetModalOpen('hiddenProgressModal',false);
  if(hiddenId){const hiddenProgress=progressObj('areas',hiddenId);hiddenProgress.value=0;}
  if(runtime&&areaBody)areaBody.insertBefore(runtime,$('baseProgressRuntime')||null);v738RestoreEventScope(snap.eventState||{});progressUiV738.seen.event=new Set(snap.seen||[]);progressUiV738.areaActive=!!snap.areaActive;progressUiV738.areaMode=snap.areaMode||'normal';progressUiV738.slotResolved.event=!!snap.slotResolved;progressUiV738.importantApplied.event=v738DeepClone(snap.importantAppliedEvent||null);if(snap.kohakuMaterials&&typeof snap.kohakuMaterials==='object')progressUiV738.kohakuMaterials=v738DeepClone(snap.kohakuMaterials);else{const legacy=v738DeepClone(progressUiV738.kohakuMaterials||{areaId:'',seq:0,currentEventToken:'',sources:{}});legacy.currentEventToken=String(snap.kohakuCurrentEventToken||'');progressUiV738.kohakuMaterials=legacy;}
  if(areaSel){[...areaSel.options].filter(o=>o.dataset.hiddenTemp==='1').forEach(o=>o.remove());areaSel.value=String(snap.areaSelectValue||BASE_EXPLORATION_ID);}const hiddenName=hiddenAreaById(hiddenId)?.name||'隠しエリア';progressUiV738.hidden={active:false,snapshot:null,originScope:'',areaId:''};
  saveState(false);renderArea();renderQuest();renderPersistedStandaloneResults();renderRecipeMerchantPanel();renderEventRewardPanel('event');renderTokenExportPanels();renderEncounterDropList();v738UpdateProgressControls();addLog(`隠しエリア探索終了：${hiddenName}`);
}

const v737EventContentCopyText=eventContentCopyText;
eventContentCopyText=function(scope='event'){
  const base=v737EventContentCopyText(scope),applied=progressUiV738.importantApplied[scope],row=v738CurrentEventRow(scope);
  if(!applied||!row||applied.eventKey!==eventUniqueKey(row))return base;
  const narrative=stripEventIdentityFromNarrative(applied.narrative||'',row);
  return [narrative,String(base||'').trim(),applied.copyText].filter(Boolean).join('\n\n');
};
resolveDeclaredImportantItem=function(scope='event'){
  const row=currentRandomEventForImportantUse(scope),result=$(importantUseElementId(scope,'Result'));
  const showResult=text=>{if(result){result.textContent=String(text||'');result.classList.remove('hidden');}};
  if(!row){showResult('先にエリアイベントを抽選してください。');return;}const applied=progressUiV738.importantApplied[scope];if(applied&&applied.eventKey===eventUniqueKey(row)){showResult([applied.narrative,applied.displayText].filter(Boolean).join('\n\n'));const action=$(importantUseElementId(scope,'ActionBtn'));if(action)action.disabled=true;return;}const spec=crossoverImportantSpec(row);if(!spec){showResult('このイベントには対応する越境アイテムがありません。');return;}const item=findImportantItemByPublicId(spec.publicId);if(!item){showResult('対応する越境アイテムをDBから確認できません。');return;}
  const reward=rollRewardItemTable(spec.tableId,1,row.areaName||'',row.eventName||'イベント');const consumeLine=`使用：《${item.name||'越境アイテム'}》×${spec.consume}`;const narrative=[consumeLine,`《${item.name||'越境アイテム'}》を取り出して使うと、これまで静かだった周囲に変化が現れた。その反応を辿ることで、普段の探索だけでは届かなかった場所まで確かめることができた。`].filter(Boolean).join('\n');
  progressUiV738.importantApplied[scope]={eventKey:eventUniqueKey(row),narrative,copyText:reward.copyText||'',displayText:reward.displayText||''};importantUseCopyState[scope]='';showResult([narrative,reward.displayText||''].filter(Boolean).join('\n\n'));const action=$(importantUseElementId(scope,'ActionBtn'));if(action)action.disabled=true;updateEventContentCopyButtons();addLog(`越境アイテム使用：${row.eventName||'イベント'} / ${item.name||'重要アイテム'}`);
};
const v737ResetImportantUsePanel=resetImportantUsePanel;
resetImportantUsePanel=function(scope='event'){
  v737ResetImportantUsePanel(scope);const row=currentRandomEventForImportantUse(scope),applied=progressUiV738.importantApplied[scope];if(row&&applied&&applied.eventKey===eventUniqueKey(row)){
    const result=$(importantUseElementId(scope,'Result')),action=$(importantUseElementId(scope,'ActionBtn'));if(result){result.textContent=[applied.narrative,applied.displayText].filter(Boolean).join('\n\n');result.classList.remove('hidden');}if(action)action.disabled=true;
  }
  const panel=$(importantUseElementId(scope,'Panel'));panel?.querySelectorAll('[data-important-use-copy]').forEach(b=>b.classList.add('hidden'));updateEventContentCopyButtons();
};

function v738RefreshCombatDropButtons(){
  const encounterReady=(!$('eventTokenExportPanel')?.classList.contains('hidden')||((state.lastEncounter?.groups||[]).length>0));
  const qCombat=progressUiV738.questActive&&!progressUiV738.hidden.active&&(!$('questTokenExportPanel')?.classList.contains('hidden')||((state.lastEncounter?.groups||[]).length>0));
  const aCombat=progressUiV738.areaActive&&!progressUiV738.hidden.active&&encounterReady;
  const hCombat=progressUiV738.hidden.active&&encounterReady;
  $('questOpenDropBtn')?.classList.toggle('hidden',!qCombat);
  $('areaOpenDropBtn')?.classList.toggle('hidden',!aCombat);
  $('hiddenOpenDropBtn')?.classList.toggle('hidden',!hCombat);
}
function openCombatDropModal(){
  const restore=progressUiV738.dropRestore;if(!restore?.section)return;const section=restore.section;restore.wasActive=section.classList.contains('active');$('dropProgressModal')?.querySelector('.progress-modal-body')?.appendChild(section);section.classList.add('active');v738SetModalOpen('dropProgressModal',true);renderEncounterDropList();
}
function closeCombatDropModal(){
  const restore=progressUiV738.dropRestore;if(!restore?.section)return;v738SetModalOpen('dropProgressModal',false);const {section,parent,next,wasActive}=restore;if(next&&next.parentNode===parent)parent.insertBefore(section,next);else parent.appendChild(section);section.classList.toggle('active',!!wasActive);
}

function v738Shuffle(rows=[]){const a=[...(rows||[])];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function v738NamedDaily(q={}){return String(q.questType||'').trim()==='二つ名討伐'||String(q.id||'').startsWith('quest_named_');}
function v738DailyUnique(rows=[]){const areas=new Set(),out=[];for(const q of rows){if(v738NamedDaily(q)){const a=String(q.areaName||q.questLocation||'').trim();if(a&&areas.has(a))continue;if(a)areas.add(a);}out.push(q);}return out;}
function v738DailyUnlockedIds(){const ids=normalizeBaseUnlockedAreaIds();return new Set((ids||[]).map(String));}
function v738DailyCandidates(kind){
  const unlocked=v738DailyUnlockedIds(),areaByName=new Map(visibleExplorationAreas().map(a=>[String(a.name||'').trim(),a]));return (state.quests||[]).filter(q=>questCategoryFor(q)==='デイリー'&&questEnabled(q)&&String(q.requestKind||'').trim()===kind).filter(q=>{const a=areaByName.get(String(q.areaName||'').trim());return !a||unlocked.has(String(a.id||a.name||''));});
}
function v738WriteDailySelection(){
  const data={keysByKind:state.lastDailyQuestKeysByKind,keys:GUILD_DAILY_REQUEST_KINDS.flatMap(k=>state.lastDailyQuestKeysByKind[k]||[]),countsByKind:Object.fromEntries(GUILD_DAILY_REQUEST_KINDS.map(k=>[k,v740DailyCount(k)])),areaId:'',unlockedAreaIds:[...v738DailyUnlockedIds()],updatedAt:new Date().toISOString()};try{localStorage.setItem(GUILD_DAILY_STORAGE_KEY,JSON.stringify(data));}catch(_e){}try{const ch=new BroadcastChannel(GUILD_DAILY_CHANNEL_NAME);ch.postMessage({type:'updated',updatedAt:data.updatedAt});ch.close();}catch(_e){}
  state.lastDailyQuestKeys=data.keys;state.dailyQuestUnlockedAreaIds=data.unlockedAreaIds;state.lastDailyQuestText=dailyQuestTextFor(selectedFacilityDailyQuestRowsByKind());saveState(false);renderDailyQuestResult();if(currentQuestCategory==='デイリー'){fillQuestSelect(state.lastDailyQuestKeys[0]||'');renderQuest();}
}
function rerollDailyQuestsInProgress(kind=''){
  const kinds=GUILD_DAILY_REQUEST_KINDS.includes(kind)?[kind]:GUILD_DAILY_REQUEST_KINDS;state.lastDailyQuestKeysByKind=state.lastDailyQuestKeysByKind||emptyDailyQuestKeysByKind();kinds.forEach(k=>{const rows=v738DailyCandidates(k),current=new Set((state.lastDailyQuestKeysByKind[k]||[]).map(String)),fresh=v738Shuffle(rows.filter(q=>!current.has(String(q.id||q.name||'')))),old=v738Shuffle(rows.filter(q=>current.has(String(q.id||q.name||'')))),count=Math.min(v740DailyCount(k),rows.length);state.lastDailyQuestKeysByKind[k]=v738DailyUnique(fresh.concat(old)).slice(0,count).map(q=>String(q.id||q.name||''));});v738WriteDailySelection();addLog(kind?`${kind}を抽選しました。`:'デイリークエストを全体抽選しました。');
}
function toggleSelectedImportantQuestVisibility(){const q=selected($('questSelect'),state.quests);if(!q||questCategoryFor(q)!=='重要')return;const key=String(q.id||q.name||'');progressUiV738.importantVisibility[key]=!questEnabled(q);v738SaveImportantVisibility();const keep=key;fillQuestSelect(keep);renderQuest();v738RefreshMainSelectionUi();addLog(`重要クエスト「${q.name||q.id}」を${questEnabled(q)?'表示':'非表示'}にしました。`);}

function v738SerializableUiState(){
  return {
    questActive:!!progressUiV738.questActive,
    areaActive:!!progressUiV738.areaActive,
    areaMode:String(progressUiV738.areaMode||'normal'),
    questCategory:String(currentQuestCategory||'重要'),
    questId:String($('questSelect')?.value||''),
    areaId:String($('areaSelect')?.value||''),
    slotResolved:{quest:!!progressUiV738.slotResolved.quest,event:!!progressUiV738.slotResolved.event,base:!!progressUiV738.slotResolved.base},
    seen:{
      quest:[...v738CurrentSeenSet('quest')],
      event:[...v738CurrentSeenSet('event')],
      base:[...v738CurrentSeenSet('base')]
    },
    hidden:v738DeepClone(progressUiV738.hidden||{active:false,snapshot:null,originScope:'',areaId:''}),
    kohakuMaterials:v738DeepClone(progressUiV738.kohakuMaterials||{areaId:'',seq:0,currentEventToken:'',sources:{}})
  };
}
function v738ResetProgressModalDomBeforeRestore(){
  if(!$('dropProgressModal')?.classList.contains('hidden'))closeCombatDropModal();
  ['questProgressModal','areaProgressModal','hiddenProgressModal','bossRumorChoiceModal'].forEach(id=>v738SetModalOpen(id,false));
  const areaRuntime=$('areaProgressRuntime'),areaBody=$('areaProgressModal')?.querySelector('.progress-modal-body');
  if(areaRuntime&&areaBody&&areaRuntime.parentNode!==areaBody)areaBody.insertBefore(areaRuntime,$('baseProgressRuntime')||null);
  const areaSel=$('areaSelect');
  if(areaSel)[...areaSel.options].filter(o=>o.dataset.hiddenTemp==='1').forEach(o=>o.remove());
}
function v738RestoreSavedSessionUi(saved={}){
  v738ResetProgressModalDomBeforeRestore();
  const ui=(saved&&typeof saved==='object')?saved:{};
  progressUiV738.questActive=!!ui.questActive;
  progressUiV738.areaActive=!!ui.areaActive;
  progressUiV738.areaMode=ui.areaMode==='base'?'base':'normal';
  progressUiV738.slotResolved={
    quest:!!ui.slotResolved?.quest,
    event:!!ui.slotResolved?.event,
    base:!!ui.slotResolved?.base
  };
  progressUiV738.seen={
    quest:new Set(Array.isArray(ui.seen?.quest)?ui.seen.quest:[]),
    event:new Set(Array.isArray(ui.seen?.event)?ui.seen.event:[]),
    base:new Set(Array.isArray(ui.seen?.base)?ui.seen.base:[])
  };
  progressUiV738.hidden=(ui.hidden&&typeof ui.hidden==='object')?v738DeepClone(ui.hidden):{active:false,snapshot:null,originScope:'',areaId:''};
  progressUiV738.kohakuMaterials=(ui.kohakuMaterials&&typeof ui.kohakuMaterials==='object')
    ?v738DeepClone(ui.kohakuMaterials)
    :{areaId:'',seq:0,currentEventToken:'',sources:{}};

  const savedQuestId=String(ui.questId||'');
  const savedQuest=(state.quests||[]).find(q=>String(q.id||q.name||'')===savedQuestId)||null;
  const savedQuestCategory=savedQuest?questCategoryFor(savedQuest):(ui.questCategory==='デイリー'?'デイリー':'重要');
  setQuestCategory(savedQuestCategory,{resetContext:false,save:false,render:false});
  const questSel=$('questSelect');
  if(savedQuestId&&questSel){
    let opt=[...questSel.options].find(o=>o.value===savedQuestId);
    if(!opt&&savedQuest&&progressUiV738.questActive){
      opt=document.createElement('option');
      opt.value=savedQuestId;
      opt.textContent=`${savedQuest.name||savedQuestId} / 保存済み進行`;
      opt.dataset.restoredSession='1';
      questSel.appendChild(opt);
    }
    if(opt)questSel.value=savedQuestId;
    else if(progressUiV738.questActive){
      progressUiV738.questActive=false;
      progressUiV738.slotResolved.quest=false;
    }
  }else if(progressUiV738.questActive){
    progressUiV738.questActive=false;
    progressUiV738.slotResolved.quest=false;
  }

  const savedAreaId=String(ui.areaId||'');
  fillExplorationAreaSelect(savedAreaId||BASE_EXPLORATION_ID);
  const areaSel=$('areaSelect');
  if(areaSel&&savedAreaId&&[...areaSel.options].some(o=>o.value===savedAreaId))areaSel.value=savedAreaId;

  if(progressUiV738.hidden.active){
    const hiddenId=String(progressUiV738.hidden.areaId||savedAreaId||'');
    const hidden=hiddenAreaById(hiddenId);
    const runtime=$('areaProgressRuntime'),hiddenBody=$('hiddenProgressModal')?.querySelector('.progress-modal-body');
    if(hidden&&areaSel&&runtime&&hiddenBody){
      let opt=[...areaSel.options].find(o=>o.value===hiddenId);
      if(!opt){opt=document.createElement('option');opt.value=hiddenId;opt.textContent=String(hidden.name||hiddenId);opt.dataset.hiddenTemp='1';areaSel.appendChild(opt);}
      areaSel.value=hiddenId;
      hiddenBody.appendChild(runtime);
      progressUiV738.areaActive=true;progressUiV738.areaMode='normal';
      v738ToggleAreaRuntime('normal');
      $('hiddenProgressModalTitle').textContent=`${hidden.name||'隠しエリア'}：探索`;
      v738SetModalOpen('hiddenProgressModal',true);
    }else{
      const snap=progressUiV738.hidden.snapshot||{};
      v738RestoreEventScope(snap.eventState||{});
      progressUiV738.seen.event=new Set(snap.seen||[]);
      progressUiV738.areaActive=!!snap.areaActive;
      progressUiV738.areaMode=snap.areaMode||'normal';
      progressUiV738.slotResolved.event=!!snap.slotResolved;
      progressUiV738.importantApplied.event=v738DeepClone(snap.importantAppliedEvent||null);
      if(snap.kohakuMaterials&&typeof snap.kohakuMaterials==='object')progressUiV738.kohakuMaterials=v738DeepClone(snap.kohakuMaterials);
      else if(Object.prototype.hasOwnProperty.call(snap,'kohakuCurrentEventToken')){const legacy=v738DeepClone(progressUiV738.kohakuMaterials||{areaId:'',seq:0,currentEventToken:'',sources:{}});legacy.currentEventToken=String(snap.kohakuCurrentEventToken||'');progressUiV738.kohakuMaterials=legacy;}
      const parentId=String(snap.areaSelectValue||BASE_EXPLORATION_ID);
      fillExplorationAreaSelect(parentId);
      if(areaSel&&[...areaSel.options].some(o=>o.value===parentId))areaSel.value=parentId;
      progressUiV738.hidden={active:false,snapshot:null,originScope:'',areaId:''};
      if(progressUiV738.areaActive){
        v738ToggleAreaRuntime(progressUiV738.areaMode);
        const title=progressUiV738.areaMode==='base'?'開拓拠点リクラフト：探索':`${selectedExplorationArea()?.name||'エリア'}：探索`;
        v738OpenAreaModal(title);
      }
    }
  }else if(progressUiV738.areaActive){
    v738ToggleAreaRuntime(progressUiV738.areaMode);
    const title=progressUiV738.areaMode==='base'?'開拓拠点リクラフト：探索':`${selectedExplorationArea()?.name||'エリア'}：探索`;
    v738OpenAreaModal(title);
    if(progressUiV738.areaMode==='normal'&&!progressUiV738.slotResolved.event){
      const area=selectedExplorationArea();
      if(area&&clamp(progressObj('areas',area.id||area.name).value)>=100)triggerAreaClearRumorEvent(area);
    }
  }
  if(progressUiV738.questActive)v738OpenQuestModal();

  renderQuest();renderArea();renderBaseEventControls();
  resetImportantUsePanel('quest');resetImportantUsePanel('event');resetImportantUsePanel('base');
  v738UpdateProgressControls();v738RefreshCombatDropButtons();
}

const v737RenderArea=renderArea;
renderArea=function(){
  if(isBaseExplorationSelected()&&!progressUiV738.hidden.active){
    const p=progressObj('areas',BASE_EXPLORATION_ID);if($('areaBar'))$('areaBar').style.width=clamp(p.value)+'%';if($('areaLabel'))$('areaLabel').textContent=clamp(p.value)+'%';if($('areaNote'))$('areaNote').value=p.note||'';v738RefreshMainSelectionUi();renderBaseEventControls();v738UpdateProgressControls();return;
  }
  v737RenderArea();if($('rollEventBtn'))$('rollEventBtn').textContent='エリアイベント';v738RefreshMainSelectionUi();v738UpdateProgressControls();
};
const v737RenderQuest=renderQuest;
renderQuest=function(){v737RenderQuest();if($('rollQuestEventBtn'))$('rollQuestEventBtn').textContent='エリアイベント';v738RefreshMainSelectionUi();v738UpdateProgressControls();};
const v737RenderBaseEventControls=renderBaseEventControls;
renderBaseEventControls=function(){v737RenderBaseEventControls();if($('rollBaseEventBtn'))$('rollBaseEventBtn').textContent='エリアイベント';v738UpdateProgressControls();};
const v737RenderTokenExportPanels=renderTokenExportPanels;
renderTokenExportPanels=function(){v737RenderTokenExportPanels();v738RefreshCombatDropButtons();};

function bindV738ProgressUi(){
  $('questStartBtn')?.addEventListener('click',startQuestProgressSession);$('areaStartBtn')?.addEventListener('click',startAreaProgressSession);$('questEndBtn')?.addEventListener('click',v738CloseQuestSession);$('areaEndBtn')?.addEventListener('click',v738CloseAreaSession);$('hiddenEndBtn')?.addEventListener('click',endHiddenExploration);$('dropModalCloseBtn')?.addEventListener('click',closeCombatDropModal);$('questOpenDropBtn')?.addEventListener('click',openCombatDropModal);$('areaOpenDropBtn')?.addEventListener('click',openCombatDropModal);$('hiddenOpenDropBtn')?.addEventListener('click',openCombatDropModal);$('rerollQuestEventBtn')?.addEventListener('click',rollQuestEvent);$('rerollEventBtn')?.addEventListener('click',rollEvent);$('rerollBaseEventBtn')?.addEventListener('click',rollBaseEvent);$('toggleImportantQuestVisibilityBtn')?.addEventListener('click',toggleSelectedImportantQuestVisibility);$('openDailyAreaModalBtn')?.addEventListener('click',openBaseAreaModal);
  $('areaSelect')?.addEventListener('change',()=>{v738RefreshMainSelectionUi();renderArea();});$('questSelect')?.addEventListener('change',v738RefreshMainSelectionUi);
  document.addEventListener('click',e=>{const daily=e.target.closest('[data-progress-daily-reroll]');if(daily){rerollDailyQuestsInProgress(String(daily.dataset.progressDailyReroll||''));return;}const hidden=e.target.closest('[data-hidden-area-start]');if(hidden){startHiddenExploration(hidden.dataset.hiddenAreaStart||'',hidden.dataset.hiddenOrigin||'event');return;}});
  document.addEventListener('change',e=>{const sel=e.target?.closest?.('[data-progress-daily-count]');if(!sel)return;const kind=String(sel.dataset.progressDailyCount||'').trim();if(!GUILD_DAILY_REQUEST_KINDS.includes(kind))return;progressUiV738.dailyCounts[kind]=v740NormalizeDailyCount(sel.value,GUILD_DAILY_DEFAULT_COUNTS_V738[kind]);state.lastDailyQuestKeysByKind=state.lastDailyQuestKeysByKind||emptyDailyQuestKeysByKind();state.lastDailyQuestKeysByKind[kind]=[];rerollDailyQuestsInProgress(kind);v740SyncDailyCountControls();addLog(`${kind}の抽選件数を${v740DailyCount(kind)}件に変更しました。`);});
  document.addEventListener('change',e=>{const max=e.target?.closest?.('#baseMaxNormalAreaSelect');if(max){const normals=baseLinearNormalAreas(),idx=normals.findIndex(a=>baseAreaId(a)===String(max.value||'')),otherworld=new Set(baseAreaModalDraftIds.filter(id=>baseOptionalOtherworldAreas().some(a=>baseAreaId(a)===String(id))));baseAreaModalDraftIds=[...normals.filter((a,i)=>i<=Math.max(0,idx)).map(baseAreaId),...otherworld];renderBaseAreaModal();return;}const ow=e.target?.closest?.('[data-base-otherworld-check]');if(ow){const id=String(ow.dataset.baseOtherworldCheck||''),set=new Set(baseAreaModalDraftIds.map(String));if(ow.checked)set.add(id);else set.delete(id);baseAreaModalDraftIds=baseCanonicalUnlockedIds([...set]);}});
  document.querySelectorAll('.progress-modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target!==m)return;if(m.id==='dropProgressModal')closeCombatDropModal();}));
  const copyDrop=$('copyDropSuccessBtn');copyDrop?.addEventListener('click',()=>setTimeout(()=>{if(!$('dropProgressModal')?.classList.contains('hidden'))closeCombatDropModal();},0));
}
const v737AreaUsesWorldCycle=areaUsesWorldCycle;
areaUsesWorldCycle=function(area={}){return isHiddenAreaRow(area)?false:v737AreaUsesWorldCycle(area);};
const v737DefaultBaseUnlockedAreaIds=defaultBaseUnlockedAreaIds;
defaultBaseUnlockedAreaIds=function(){const initial=visibleExplorationAreas().filter(a=>String(a.unlockCondition||'').includes('初期解放')).map(a=>String(a.id||a.name||'')).filter(Boolean);if(initial.length)return initial;const first=visibleExplorationAreas()[0];return first?[String(first.id||first.name||'')]:[];};
function baseLinearNormalAreas(){return visibleExplorationAreas().filter(a=>String(a.areaType||'').trim()!=='異界').sort((a,b)=>Number(a.unlockOrder||999)-Number(b.unlockOrder||999)||String(a.name||'').localeCompare(String(b.name||''),'ja'));}
function baseOptionalOtherworldAreas(){return visibleExplorationAreas().filter(a=>String(a.areaType||'').trim()==='異界').sort((a,b)=>Number(a.unlockOrder||999)-Number(b.unlockOrder||999)||String(a.name||'').localeCompare(String(b.name||''),'ja'));}
function baseAreaId(a={}){return String(a.id||a.name||'').trim();}
function baseMaxNormalIdFromIds(ids=[]){const set=new Set((ids||[]).map(String)),rows=baseLinearNormalAreas().filter(a=>set.has(baseAreaId(a)));return rows.length?baseAreaId(rows[rows.length-1]):baseAreaId(baseLinearNormalAreas()[0]||{});}
function baseCanonicalUnlockedIds(ids=[]){const valid=new Set(visibleExplorationAreas().map(baseAreaId).filter(Boolean)),source=new Set((ids||[]).map(String).filter(id=>valid.has(id))),normals=baseLinearNormalAreas(),otherworld=baseOptionalOtherworldAreas();let maxIndex=-1;normals.forEach((a,i)=>{if(source.has(baseAreaId(a)))maxIndex=Math.max(maxIndex,i);});if(maxIndex<0&&normals.length)maxIndex=0;const next=[];normals.forEach((a,i)=>{if(i<=maxIndex)next.push(baseAreaId(a));});otherworld.forEach(a=>{const id=baseAreaId(a);if(source.has(id))next.push(id);});defaultBaseUnlockedAreaIds().forEach(id=>{if(valid.has(String(id))&&!next.includes(String(id)))next.push(String(id));});return [...new Set(next)];}
normalizeBaseUnlockedAreaIds=function(){state.baseUnlockedAreaIds=baseCanonicalUnlockedIds(Array.isArray(state.baseUnlockedAreaIds)?state.baseUnlockedAreaIds:defaultBaseUnlockedAreaIds());return state.baseUnlockedAreaIds;};
renderBaseAreaModal=function(){const modal=$('baseAreaModal'),list=$('baseUnlockedAreaModalList');if(!modal||!list)return;baseAreaModalDraftIds=baseCanonicalUnlockedIds(baseAreaModalDraftIds);const selected=new Set(baseAreaModalDraftIds.map(String)),normals=baseLinearNormalAreas(),otherworld=baseOptionalOtherworldAreas(),maxId=baseMaxNormalIdFromIds(baseAreaModalDraftIds);const normalOptions=normals.map(a=>`<option value="${esc(baseAreaId(a))}"${baseAreaId(a)===maxId?' selected':''}>${esc(a.name||baseAreaId(a))}（解放順 ${esc(a.unlockOrder??'-')}）</option>`).join('');const otherworldHtml=otherworld.length?otherworld.map(a=>{const id=baseAreaId(a);return `<label class="base-unlock-item"><input type="checkbox" data-base-otherworld-check="${esc(id)}"${selected.has(id)?' checked':''}><span>${esc(a.name||id)}<small>異界 / 任意解放</small></span></label>`;}).join(''):'<div class="muted small">現在、任意解放の異界はありません。</div>';list.innerHTML=`<section class="base-unlock-section"><h4>通常エリア</h4><label>最大解放エリア<select id="baseMaxNormalAreaSelect" class="base-unlock-select">${normalOptions}</select></label><div class="base-unlock-help">選択したエリアまでの通常エリアをすべて解放済みとして扱います。</div></section><section class="base-unlock-section"><h4>異界</h4><div class="base-unlock-otherworld-list">${otherworldHtml}</div><div class="base-unlock-help">異界は通常エリアの最大解放位置とは別に、個別に解放状態を指定します。</div></section>`;};
const v1038OpenBaseAreaModal=openBaseAreaModal;
openBaseAreaModal=function(){baseAreaModalDraftIds=baseCanonicalUnlockedIds(normalizeBaseUnlockedAreaIds());renderBaseAreaModal();const modal=$('baseAreaModal');if(modal){modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');document.body.classList.add('area-select-modal-open');}};
applyBaseAreaModal=function(){const next=baseCanonicalUnlockedIds(baseAreaModalDraftIds);const before=normalizeBaseUnlockedAreaIds().slice().sort().join('|'),after=next.slice().sort().join('|');state.baseUnlockedAreaIds=next;if(before!==after){state.lastBaseEventText='';state.lastBaseEventKey='';state.lastBaseCheckCopyText='';state.lastBaseOutcomeKey='';state.lastBaseRewardText='';state.lastBaseRewardCopyText='';state.lastBaseEventRewardState=null;state.lastBaseEventTableRewardState=null;const q=selected($('questSelect'),state.quests);if(isBaseQuest(q)){clearQuestRandomEventHistory();progressUiV738.importantApplied.quest=null;progressUiV738.slotResolved.quest=false;}}ensureWeatherForUnlockedAreas(false);saveState(false);closeBaseAreaModal();renderBaseEventControls();renderDailyUnlockedAreaControl();renderWeatherManager();renderQuest();updateTreasureCopyButtons();};
