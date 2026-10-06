function switchProgressTab(tab){
  let key=String(tab || 'quest');
  const panels=[...document.querySelectorAll('[data-progress-tab]')];
  if(!panels.some(el=>el.dataset.progressTab===key)) key='quest';
  panels.forEach(el=>el.classList.toggle('active', el.dataset.progressTab===key));
  document.querySelectorAll('[data-tab-target]').forEach(btn=>btn.classList.toggle('active', btn.dataset.tabTarget===key));
  localStorage.setItem(STORE_KEY+'_tab', key);
}
/* === v90.8.738 progress modal / hidden-area layer === */
const BASE_EXPLORATION_ID='__base_recraft__';
const IMPORTANT_VISIBILITY_STORE_KEY=STORE_KEY+'_important_visibility_v1';
const GUILD_DAILY_DEFAULT_COUNTS_V738={'拠点内依頼':2,'エリア依頼':2,'納品依頼':1};
const progressUiV738={
  ready:false,questActive:false,areaActive:false,areaMode:'normal',
  dailyCounts:{...GUILD_DAILY_DEFAULT_COUNTS_V738},
  slotResolved:{quest:false,event:false,base:false},
  seen:{quest:new Set(),event:new Set(),base:new Set()},
  hidden:{active:false,snapshot:null,originScope:'',areaId:''},
  importantApplied:{quest:null,event:null,base:null},
  kohakuMaterials:{areaId:'',seq:0,currentEventToken:'',sources:{}},
  dropRestore:null,
  importantVisibility:{}
};
const GUILD_DAILY_MAX_COUNT_V740=10;
function v740NormalizeDailyCount(value,fallback=1){
  const n=Number(value),fb=Number(fallback);
  const base=Number.isFinite(n)?Math.floor(n):(Number.isFinite(fb)?Math.floor(fb):1);
  return Math.max(0,Math.min(GUILD_DAILY_MAX_COUNT_V740,base));
}
function v740DailyCount(kind=''){
  const fallback=GUILD_DAILY_DEFAULT_COUNTS_V738[kind]??1;
  return v740NormalizeDailyCount(progressUiV738.dailyCounts?.[kind],fallback);
}
function v740LoadDailyCounts(){
  const shared=readFacilityDailyQuestState();
  const saved=shared?.countsByKind&&typeof shared.countsByKind==='object'?shared.countsByKind:{};
  progressUiV738.dailyCounts=Object.fromEntries(GUILD_DAILY_REQUEST_KINDS.map(kind=>[
    kind,v740NormalizeDailyCount(saved[kind],GUILD_DAILY_DEFAULT_COUNTS_V738[kind])
  ]));
  return progressUiV738.dailyCounts;
}
function v740DailyCountOptions(kind=''){
  const current=v740DailyCount(kind);
  return Array.from({length:GUILD_DAILY_MAX_COUNT_V740+1},(_,n)=>`<option value="${n}"${n===current?' selected':''}>${n}件</option>`).join('');
}
function v740SyncDailyCountControls(){
  document.querySelectorAll('[data-progress-daily-count]').forEach(sel=>{
    const kind=String(sel.dataset.progressDailyCount||'').trim();
    if(!GUILD_DAILY_REQUEST_KINDS.includes(kind))return;
    sel.innerHTML=v740DailyCountOptions(kind);
    sel.value=String(v740DailyCount(kind));
  });
}
