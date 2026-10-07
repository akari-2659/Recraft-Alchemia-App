function normalizeDayState(value={}){
  const day=Math.max(1,Math.floor(Number(value?.day)||1));
  const fatigue=Math.max(0,Math.floor(Number(value?.fatigue)||0));
  const limit=Math.max(1,BASE_DAILY_ACTIONS-fatigue);
  const usedActions=Math.max(0,Math.min(limit,Math.floor(Number(value?.usedActions)||0)));
  return {day,fatigue,usedActions,awaitingEnd:!!value?.awaitingEnd || usedActions>=limit};
}
function dailyActionLimit(){return Math.max(1,BASE_DAILY_ACTIONS-(Number(state.dayState?.fatigue)||0));}
function dailyActionsRemaining(){return Math.max(0,dailyActionLimit()-(Number(state.dayState?.usedActions)||0));}
function progressSessionActive(){return typeof progressUiV738!=='undefined'&&!!(progressUiV738.questActive||progressUiV738.areaActive||progressUiV738.hidden?.active);}
function fatigueCheckPenalty(){return -2*(Number(state.dayState?.fatigue)||0);}
function renderDayStatus(){
  state.dayState=normalizeDayState(state.dayState);
  const limit=dailyActionLimit(), remaining=dailyActionsRemaining(), fatigue=state.dayState.fatigue, penalty=fatigueCheckPenalty();
  if($('dayNumberLabel')) $('dayNumberLabel').textContent=`第${state.dayState.day}日`;
  if($('fatigueLabel')) $('fatigueLabel').textContent=String(fatigue);
  if($('fatiguePenaltyLabel')) $('fatiguePenaltyLabel').textContent=penalty ? String(penalty) : '補正なし';
  if($('remainingActionsLabel')) $('remainingActionsLabel').textContent=`${remaining} / ${limit}`;
  const status=$('dayRuleStatus');
  if(status){
    if(state.dayState.awaitingEnd || remaining<=0){
      status.className='status bad day-rule';
      status.textContent='本日の行動回数を使い切りました。宿泊するか、宿泊せず翌日へ進むまで新しい行動はできません。';
    }else if(fatigue>0){
      status.className='status warn day-rule';
      status.textContent=`疲労度${fatigue}：すべての判定${penalty}、本日の行動回数${limit}回。疲労度は宿泊で0になります。`;
    }else{
      status.className='status good day-rule';
      status.textContent=`疲労なし。本日の行動回数は${limit}回です。`;
    }
  }
  const blocked=state.dayState.awaitingEnd || remaining<=0;
  const sessionActive=progressSessionActive();
  if($('manualActionBtn'))$('manualActionBtn').disabled=blocked||sessionActive;
  if($('innRestBtn'))$('innRestBtn').disabled=blocked||sessionActive;
  if($('innStayBtn'))$('innStayBtn').disabled=sessionActive;
  if($('endDayWithoutInnBtn'))$('endDayWithoutInnBtn').disabled=sessionActive;
  if($('undoActionBtn')) $('undoActionBtn').disabled=state.dayState.usedActions<=0;
  if(typeof v738UpdateProgressControls==='function')v738UpdateProgressControls();
}
function consumeDailyAction(label='行動'){
  state.dayState=normalizeDayState(state.dayState);
  if(state.dayState.awaitingEnd || dailyActionsRemaining()<=0){
    renderDayStatus();
    alert('本日の行動回数を使い切っています。宿泊するか、宿泊せず翌日へ進んでください。');
    return false;
  }
  state.dayState.usedActions+=1;
  if(dailyActionsRemaining()<=0) state.dayState.awaitingEnd=true;
  renderDayStatus();
  addLog(`${label}：1行動を消費しました。残り${dailyActionsRemaining()}回。`);
  if(state.dayState.awaitingEnd) setTimeout(()=>alert('本日の行動回数を使い切りました。一日を終了してください。'),0);
  return true;
}
function undoDailyAction(){
  state.dayState=normalizeDayState(state.dayState);
  if(state.dayState.usedActions<=0)return;
  state.dayState.usedActions-=1;
  state.dayState.awaitingEnd=false;
  renderDayStatus();
  addLog(`行動消費を1回戻しました。残り${dailyActionsRemaining()}回。`);
}
function clearDailyRumor(){
  state.lastRumorText=''; state.lastRumorKey=''; state.savedRumorEventKey='';
  if($('rumorSelect')) $('rumorSelect').value='';
  if($('rumorSelectForInn')) $('rumorSelectForInn').value='';
  renderRumorDetail(); renderRumorResult();
}
function advanceToNextDay(stayAtInn=false){
  if(progressSessionActive()){alert('進行中のクエストまたは探索を先に終了してください。');return false;}
  state.dayState=normalizeDayState(state.dayState);
  const previousDay=state.dayState.day;
  if(stayAtInn){
    state.dayState={day:previousDay+1,fatigue:0,usedActions:0,awaitingEnd:false}; state.timeSlot='朝'; setTimeSlot('朝',{reset:false,render:false,save:false});
    clearDailyRumor(); rerollUnlockedWeatherForNewDay(); renderDayStatus(); renderWeatherManager();
    addLog(`宿屋に45Gで宿泊しました。HP・MPを全回復し、疲労度を0にして第${state.dayState.day}日へ進みました。`);
  }else{
    const nextFatigue=state.dayState.fatigue+1;
    state.dayState={day:previousDay+1,fatigue:nextFatigue,usedActions:0,awaitingEnd:false}; state.timeSlot='朝'; setTimeSlot('朝',{reset:false,render:false,save:false});
    clearDailyRumor(); rerollUnlockedWeatherForNewDay(); renderDayStatus(); renderWeatherManager();
    addLog(`宿泊せず第${state.dayState.day}日へ進みました。疲労度が${nextFatigue}になりました。`);
  }
}
function restAtInn(){
  if(progressSessionActive()){alert('進行中のクエストまたは探索を先に終了してください。');return;}
  if(!consumeDailyAction('宿屋での休息'))return;
  addLog('休息代30Gを支払い、HP・MPを全回復しました。日付と疲労度は変化しません。');
}

function sameText(a,b){return String(a||'').trim() && String(b||'').trim() && String(a||'').trim()===String(b||'').trim();}
