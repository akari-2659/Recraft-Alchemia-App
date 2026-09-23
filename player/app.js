(()=>{
  'use strict';
  const APP_VERSION='1.0.52';
  const GAS_URL='https://script.google.com/macros/s/AKfycbxNQYC7-aBE23cliuD1Zdze18xHh-q45P1qpBgwCCg0dYgxd1b8A-R63eGjzMtgOxMT/exec';
  const app=document.querySelector('#playerApp'),authError=document.querySelector('#authError');
  const sidebar=document.querySelector('#sidebar'),backdrop=document.querySelector('#backdrop');
  const views=[...document.querySelectorAll('.view')],nav=[...document.querySelectorAll('.nav-btn')];
  const mobileTitle=document.querySelector('#mobileTitle'),characterCategory=document.querySelector('#characterCategory'),characterToggle=document.querySelector('#characterCategoryToggle');
  const characterNavList=document.querySelector('#characterNavList'),characterViewName=document.querySelector('#characterViewName');
  const frames={character:document.querySelector('#characterFrame'),facility:document.querySelector('#facilityFrame')};
  let characters=[],selectedCharacterId='',swRegistration=null,waitingWorker=null,characterWarmupScheduled=false,lastListRefreshAt=0;
  const moduleState={character:{ready:false,lastCharacterId:'',revision:0,storageRow:0},facility:{ready:false}};
  const LAST_CHARACTER_KEY='ra-player-last-character-id';

  const THEME_STORAGE_KEY='ra-app-theme-color';
  const THEMES={
    red:{label:"レッド",bg:"#eadfdd",paper:"#fff8f5",paper2:"#f3e3de",ink:"#352426",muted:"#70585c",line:"#d8b5ae",accent:"#963a44",accent2:"#795421",deep:"#341e26",active:"#71303a",hover:"#57272f",theme:"#71303a",soft:"#edcec6",secondary:"#506777",secondaryText:"#ffffff",input:"#fffdf9",topbar:"#f8ece7",highlight:"#f1d3a4",deepMuted:"#f0dadd"},
    blue:{label:"ブルー",bg:"#dfe8f0",paper:"#f8fbff",paper2:"#e7eff6",ink:"#213041",muted:"#566a7e",line:"#b9cadb",accent:"#356790",accent2:"#825326",deep:"#1c3047",active:"#2d577e",hover:"#274a6b",theme:"#2d577e",soft:"#d3e2ef",secondary:"#477780",secondaryText:"#ffffff",input:"#fcfeff",topbar:"#eaf2f8",highlight:"#ead5bd",deepMuted:"#dce8f3"},
    green:{label:"グリーン",bg:"#e3ebe1",paper:"#fbfcf7",paper2:"#e8efe3",ink:"#25342a",muted:"#596a5d",line:"#becdb8",accent:"#426a4b",accent2:"#765a25",deep:"#21372a",active:"#385b42",hover:"#304d38",theme:"#385b42",soft:"#d5e3ce",secondary:"#657187",secondaryText:"#ffffff",input:"#fdfef9",topbar:"#edf3e9",highlight:"#e4d4ad",deepMuted:"#dce9dd"},
    purple:{label:"パープル",bg:"#e8e2ee",paper:"#fdf9ff",paper2:"#eee6f2",ink:"#31283a",muted:"#65596f",line:"#c9b8d3",accent:"#6b4b82",accent2:"#7e4154",deep:"#32243e",active:"#594067",hover:"#493555",theme:"#594067",soft:"#dfd2e5",secondary:"#75613a",secondaryText:"#ffffff",input:"#fffcff",topbar:"#f1eaf5",highlight:"#e8c8cf",deepMuted:"#e8dded"},
    orange:{label:"オレンジ",bg:"#eee3d9",paper:"#fff9f3",paper2:"#f4e6d8",ink:"#39291f",muted:"#6e5d52",line:"#d7bfa8",accent:"#a15428",accent2:"#296469",deep:"#43291b",active:"#814a28",hover:"#6a3e24",theme:"#814a28",soft:"#edd4bc",secondary:"#39737a",secondaryText:"#ffffff",input:"#fffdf9",topbar:"#f7ebe0",highlight:"#cce0dd",deepMuted:"#f0dfd3"},
    yellow:{label:"イエロー",bg:"#ebe6d2",paper:"#fffdf3",paper2:"#f3ebcd",ink:"#373121",muted:"#696149",line:"#d5c58e",accent:"#806516",accent2:"#455f7a",deep:"#37321f",active:"#675315",hover:"#58491c",theme:"#675315",soft:"#e9dda9",secondary:"#465f7a",secondaryText:"#ffffff",input:"#fffef8",topbar:"#f5efda",highlight:"#d6dfed",deepMuted:"#eee7c9"},
    pink:{label:"ピンク",bg:"#eee1e8",paper:"#fff9fc",paper2:"#f3e5ec",ink:"#39272f",muted:"#6e5965",line:"#d5b7c5",accent:"#a24870",accent2:"#596282",deep:"#432736",active:"#7d3c59",hover:"#633047",theme:"#7d3c59",soft:"#ebceda",secondary:"#626c8e",secondaryText:"#ffffff",input:"#fffdfd",topbar:"#f7eaf0",highlight:"#dce1ef",deepMuted:"#f0dce6"},
    cyan:{label:"シアン",bg:"#dcebed",paper:"#f7fdfe",paper2:"#e3f0f1",ink:"#213538",muted:"#536b70",line:"#b4d0d2",accent:"#2f757c",accent2:"#5b4a7e",deep:"#17383d",active:"#296168",hover:"#24545a",theme:"#296168",soft:"#cee5e7",secondary:"#65598b",secondaryText:"#ffffff",input:"#fbffff",topbar:"#e7f3f4",highlight:"#ded8ed",deepMuted:"#d7eaec"},
    navy:{label:"ネイビー",bg:"#dde2e9",paper:"#f8fafc",paper2:"#e6ebf1",ink:"#222d3b",muted:"#566272",line:"#bac2ce",accent:"#3d577b",accent2:"#7d5828",deep:"#172339",active:"#304768",hover:"#283a55",theme:"#304768",soft:"#d2dae6",secondary:"#5f6d80",secondaryText:"#ffffff",input:"#fcfdff",topbar:"#e9edf3",highlight:"#eadcc1",deepMuted:"#dce3ec"},
    brown:{label:"ブラウン",bg:"#eee6da",paper:"#fff9ef",paper2:"#f4ead7",ink:"#34251d",muted:"#695b52",line:"#d8c5a8",accent:"#83502e",accent2:"#3f5d58",deep:"#2f231d",active:"#563a29",hover:"#493128",theme:"#563a29",soft:"#e8d5b8",secondary:"#53706a",secondaryText:"#ffffff",input:"#fffdf8",topbar:"#f6eddf",highlight:"#d4e0da",deepMuted:"#eadfce"}
  };
  const LEGACY_THEME_KEYS={classic:'brown',violet:'purple',amber:'orange'};
  function currentTheme(){
    let key=localStorage.getItem(THEME_STORAGE_KEY)||'brown';
    if(LEGACY_THEME_KEYS[key]){key=LEGACY_THEME_KEYS[key];try{localStorage.setItem(THEME_STORAGE_KEY,key)}catch(_){}}
    return THEMES[key]?key:'brown';
  }
  function themePairs(theme){return {
    '--bg':theme.bg,'--paper':theme.paper,'--paper2':theme.paper2,'--ink':theme.ink,'--muted':theme.muted,'--line':theme.line,
    '--accent':theme.accent,'--accent2':theme.accent2,'--app-deep':theme.deep,'--app-active':theme.active,'--app-hover':theme.hover,'--theme-soft':theme.soft,
    '--theme-secondary':theme.secondary,'--theme-secondary-text':theme.secondaryText,'--theme-input':theme.input,'--theme-topbar':theme.topbar,'--theme-highlight':theme.highlight,'--theme-deep-muted':theme.deepMuted,'--theme-on-accent':'#ffffff','--theme-on-deep':'#ffffff',
    '--ra-desk':theme.deep,'--ra-desk-2':theme.hover,'--ra-page':theme.paper,'--ra-page-2':theme.paper2,'--ra-page-3':theme.soft,
    '--ra-ink':theme.ink,'--ra-muted':theme.muted,'--ra-line':theme.line,'--ra-line-soft':theme.line,'--ra-line-dark':theme.hover,
    '--ra-navy':theme.accent,'--ra-navy-2':theme.deep,'--ra-burgundy':theme.accent,'--ra-burgundy-2':theme.deep,
    '--ra-brass':theme.accent2,'--ra-brass-light':theme.highlight
  }}
  function applyThemeToFrame(frame,theme,key=currentTheme()){
    try{
      const doc=frame?.contentDocument;if(!doc)return;
      const root=doc.documentElement,body=doc.body;root.dataset.raTheme=key;if(body)body.dataset.raTheme=key;
      Object.entries(themePairs(theme)).forEach(([k,v])=>{root.style.setProperty(k,v);body?.style.setProperty(k,v)});
      let style=doc.getElementById('raAppFullThemeV025');
      if(!style){style=doc.createElement('style');style.id='raAppFullThemeV025';doc.head?.appendChild(style)}
      style.textContent=`
        html,body{background:var(--bg)!important;color:var(--ink)!important}
        body.ra-app{color:var(--ink)!important;background:linear-gradient(145deg,var(--bg),color-mix(in srgb,var(--bg) 74%,var(--app-deep) 26%))!important}
        body.ra-app>header,body.ra-app header{background:color-mix(in srgb,var(--theme-topbar) 94%,transparent)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app>main{background:var(--paper)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app :is(.panel,.big-section,.card,.mini-card,.status-box,.resource-card,.choice-card,.help-card,.compact-storage-panel,.facility-work-block,.facility-summary,.autosave-panel,.dialog-inner,.weapon-modal-dialog,.branch-controls,.branch-graph-scroll,.catalog-rank-controls,.inventory-filter-panel,.inventory-search-panel,.tab-block,.subnav-block,.progress-fold,.community-manager-card,.weather-manager,.day-stat,.event-card,.result,.drop-row,.monster-combobox-menu,.facility-product,.facility-card,.record-list-search,.admin-global-search-panel,.admin-global-search-card,.table-pagination){border-color:var(--line)!important;background:var(--paper)!important;color:var(--ink)!important;box-shadow:0 8px 22px color-mix(in srgb,var(--app-deep) 10%,transparent)!important}
        body.ra-app :is(.tab-nav,.tabs,.subtabs,.buttons,.quest-tools,.quest-category-bar,.toolbar,.section-actions,.filter-actions,.facility-actions,.help-actions,.monster-output-actions,.modal-foot,.facility-inner-tabs,.facility-weapon-category-tabs){background:var(--paper2)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app :is(input,select,textarea){background:var(--theme-input)!important;color:var(--ink)!important;border-color:var(--line)!important;box-shadow:inset 0 1px 2px color-mix(in srgb,var(--app-deep) 8%,transparent)!important}
        body.ra-app :is(input,select,textarea):focus{border-color:var(--accent)!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent)!important}
        body.ra-app button:not(.ghost):not(.danger):not(.secondary):not(.branch-graph-node-trigger):not(.ra-branch-node-button),body.ra-app :is(.tab,.subtab,.tab-btn,.editor-tab-btn,.quest-category-btn,.facility-inner-tab,.facility-weapon-category-tab).active{background:linear-gradient(180deg,var(--accent),color-mix(in srgb,var(--accent) 82%,var(--app-deep) 18%))!important;border-color:color-mix(in srgb,var(--accent) 76%,var(--app-deep) 24%)!important;color:var(--theme-on-accent)!important;box-shadow:0 2px 0 color-mix(in srgb,var(--accent) 62%,#000 38%),0 5px 12px color-mix(in srgb,var(--accent) 22%,transparent)!important;text-shadow:0 1px 0 rgba(0,0,0,.18)!important}
        body.ra-app button.secondary,body.ra-app :is(.tab,.subtab,.tab-btn,.editor-tab-btn,.quest-category-btn,.facility-inner-tab,.facility-weapon-category-tab):not(.active){background:linear-gradient(180deg,var(--theme-secondary),color-mix(in srgb,var(--theme-secondary) 82%,var(--app-deep) 18%))!important;border-color:color-mix(in srgb,var(--theme-secondary) 74%,var(--app-deep) 26%)!important;color:var(--theme-secondary-text)!important;box-shadow:0 2px 0 color-mix(in srgb,var(--theme-secondary) 62%,#000 38%),0 4px 10px color-mix(in srgb,var(--theme-secondary) 18%,transparent)!important;text-shadow:0 1px 0 rgba(0,0,0,.16)!important}
        body.ra-app button.ghost{background:var(--paper)!important;border-color:var(--accent)!important;color:var(--accent)!important;box-shadow:none!important;text-shadow:none!important}
        body.ra-app button.danger{background:linear-gradient(180deg,#b45656,#8e3333)!important;border-color:#6b2727!important;color:#fff!important}
        body.ra-app :is(.badge,.pill,.quest-pill){background:var(--paper2)!important;border-color:var(--line)!important;color:var(--muted)!important}
        body.ra-app :is(.progress-fold>summary,.ra-progress-load-fold>summary,.ra-admin-fold>summary){background:color-mix(in srgb,var(--paper2) 82%,var(--theme-highlight) 18%)!important;color:var(--ink)!important;border-color:var(--line)!important}
        body.ra-app :is(.progress-wrap,.community-manager-progress){background:color-mix(in srgb,var(--paper2) 80%,var(--line) 20%)!important;border-color:var(--line)!important}
        body.ra-app :is(.progress-bar,.community-manager-progress span){background:linear-gradient(90deg,var(--accent),var(--accent2))!important}
        body.ra-app :is(.section-title,.big-section>h2,.panel>h2,.panel>h3,.summary-line h2,h1,h2,h3){color:var(--ink)!important;border-color:color-mix(in srgb,var(--line) 78%,var(--accent2) 22%)!important}
        body.ra-app :is(.muted,.hint,.subtitle,.version,.small,.notice){color:var(--muted)!important}
        body.ra-app :is(label,legend,.field-label,.form-label,.meta,.record-meta,.item-meta,.equipment-effect-summary){color:var(--muted)!important}
        body.ra-app :is(table,th,td,.table,.list-row,.list-item){color:var(--ink)!important}
        body.ra-app th{background:var(--paper2)!important;color:var(--ink)!important;border-color:var(--line)!important}
        body.ra-app :is(a,.text-link){color:var(--accent)!important}
        body.ra-app :is(input,select,textarea)::placeholder{color:var(--muted)!important;opacity:.9!important}
        body.ra-app select option{background:var(--paper)!important;color:var(--ink)!important}
        body.ra-app{--good:#1f6a43;--bad:#963933;--warn:#745900;--danger:#963933}
        body.ra-app :is(.status.good,.badge.random,.copy-note){color:var(--good)!important}
        body.ra-app :is(.status.bad,.account-key-status.error){color:var(--bad)!important}
        body.ra-app :is(.status.warn,.badge.fixed){color:var(--warn)!important}
        body.ra-app .ra-build-info,body.ra-app .build{background:var(--paper2)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app .tab-nav#progressTabNav{background:color-mix(in srgb,var(--paper2) 92%,var(--theme-highlight) 8%)!important;border-color:var(--line)!important}
        body.ra-app .status.good,body.ra-app .event-card.random{background:color-mix(in srgb,var(--paper) 82%,#bfe2c9 18%)!important}
        body.ra-app .status.bad{background:color-mix(in srgb,var(--paper) 84%,#e8b8b3 16%)!important}
        body.ra-app .status.warn,body.ra-app .event-card.fixed{background:color-mix(in srgb,var(--paper) 82%,var(--theme-highlight) 18%)!important}
        body.ra-app .drop-row.success{background:color-mix(in srgb,var(--paper) 58%,#bfe2c9 42%)!important;border-color:color-mix(in srgb,var(--good) 68%,var(--line) 32%)!important;box-shadow:inset 4px 0 0 var(--good),0 6px 14px color-mix(in srgb,var(--good) 12%,transparent)!important}
        body.ra-app .drop-row.success>div>b{color:var(--good)!important}
        body.ra-app .drop-row.success .pill:last-child{background:color-mix(in srgb,var(--paper2) 58%,#bfe2c9 42%)!important;border-color:color-mix(in srgb,var(--good) 55%,var(--line) 45%)!important;color:var(--good)!important;font-weight:900!important}

        /* v1.0.10: 派生図もカラーテーマの文字・紙面・枠色へ統一し、固定色による低コントラストを解消。 */
        body.ra-app :is(.branch-graph-scroll,.branch-table-scroll,.accessory-branch-scroll){background:var(--paper)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app .branch-graph-panel:fullscreen{background:var(--bg)!important;color:var(--ink)!important}
        body.ra-app .branch-graph-panel:fullscreen .branch-graph-toolbar{background:color-mix(in srgb,var(--theme-topbar) 96%,transparent)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app :is(.branch-graph-label,.branch-label-side-toggle){background:var(--paper2)!important;border-color:var(--line)!important;color:var(--ink)!important;box-shadow:4px 0 9px color-mix(in srgb,var(--app-deep) 10%,transparent)!important}
        body.ra-app .branch-graph-label.base{background:color-mix(in srgb,var(--paper2) 78%,var(--theme-highlight) 22%)!important;color:var(--ink)!important}
        body.ra-app .branch-graph-label.boss{background:color-mix(in srgb,var(--paper) 78%,#e7bbb0 22%)!important;border-color:color-mix(in srgb,var(--line) 58%,#9a4b42 42%)!important;color:var(--ink)!important}
        body.ra-app .branch-graph-scroll.branch-labels-collapsed .branch-graph-label::after{color:var(--ink)!important}
        body.ra-app :is(.branch-graph-node,.branch-table-node,.accessory-branch-node){background:var(--paper)!important;border-color:var(--line)!important;color:var(--ink)!important;box-shadow:0 4px 11px color-mix(in srgb,var(--app-deep) 10%,transparent)!important}
        body.ra-app :is(.branch-graph-node-trigger,.branch-graph-node-locked-label,.accessory-branch-node button){background:var(--paper)!important;color:var(--ink)!important;border-color:var(--line)!important;text-shadow:none!important}
        body.ra-app :is(.branch-graph-node-name-inline,.branch-graph-node-name,.branch-table-node-name,.accessory-branch-name){color:var(--ink)!important}
        body.ra-app :is(.branch-graph-node-rank-inline,.branch-graph-node-rank,.branch-table-rank,.accessory-branch-rank,.accessory-branch-effect,.branch-graph-zoom-label){color:var(--muted)!important}
        body.ra-app :is(.branch-graph-node.locked,.branch-table-node.locked){background:repeating-linear-gradient(135deg,var(--paper),var(--paper) 10px,var(--paper2) 10px,var(--paper2) 20px)!important;color:var(--ink)!important}
        body.ra-app .branch-graph-node.boss-branch{background:color-mix(in srgb,var(--paper) 86%,#e8c1b8 14%)!important;border-color:color-mix(in srgb,var(--line) 66%,#985348 34%)!important;color:var(--ink)!important}
        body.ra-app .branch-graph-node.has-named-processing{background:linear-gradient(180deg,color-mix(in srgb,var(--paper) 82%,var(--theme-highlight) 18%),var(--paper) 60%)!important;border-color:var(--accent)!important;outline-color:color-mix(in srgb,var(--accent2) 34%,transparent)!important}
        body.ra-app .branch-graph-node-named-badge{background:var(--theme-secondary)!important;border:1px solid color-mix(in srgb,var(--theme-secondary) 72%,var(--app-deep) 28%)!important;color:var(--theme-secondary-text)!important;border-radius:999px!important;padding:2px 7px!important;text-shadow:none!important}
        body.ra-app :is(.branch-graph-edge,.accessory-branch-edge){stroke:color-mix(in srgb,var(--accent) 76%,var(--ink) 24%)!important;filter:none!important}
        body.ra-app .branch-graph-edge-route{stroke:transparent!important}
        body.ra-app .branch-node.branch-focus,body.ra-app .branch-graph-node.branch-focus{outline-color:color-mix(in srgb,var(--accent) 72%,transparent)!important}
        body.ra-app .branch-table th,body.ra-app .branch-table td{background:var(--paper)!important;border-color:var(--line)!important;color:var(--ink)!important}
        body.ra-app .branch-table thead th,body.ra-app .branch-table .branch-table-label{background:var(--paper2)!important;color:var(--ink)!important;box-shadow:none!important}
        body.ra-app .branch-table thead .branch-table-label{background:color-mix(in srgb,var(--paper2) 76%,var(--theme-highlight) 24%)!important;color:var(--ink)!important}
        body.ra-app .branch-table-label small{color:var(--muted)!important}
        body.ra-app .branch-table-cell.has-next::after,body.ra-app .branch-table-node+.branch-table-node::before{color:var(--accent)!important;background:var(--paper)!important}
        body.ra-app .accessory-branch-node button:hover,body.ra-app .accessory-branch-node button:focus-visible{background:var(--paper2)!important;color:var(--ink)!important}
        /* v1.0.10: 派生図のノードは通常ボタン配色に巻き込ませない。常に明るい面＋濃い文字で読む。 */
        body.ra-app .branch-graph-node > button.branch-graph-node-trigger:not(.ghost):not(.danger):not(.secondary),
        body.ra-app .accessory-branch-node > button.ra-branch-node-button:not(.ghost):not(.danger):not(.secondary){background:var(--theme-input)!important;color:var(--ink)!important;border:0!important;box-shadow:none!important;text-shadow:none!important;filter:none!important;transform:none!important}
        body.ra-app .branch-graph-node > .branch-graph-node-locked-label{background:var(--theme-input)!important;color:var(--ink)!important;text-shadow:none!important}
        body.ra-app .branch-graph-node > button.branch-graph-node-trigger:hover,
        body.ra-app .branch-graph-node > button.branch-graph-node-trigger:focus-visible,
        body.ra-app .accessory-branch-node > button.ra-branch-node-button:hover,
        body.ra-app .accessory-branch-node > button.ra-branch-node-button:focus-visible{background:color-mix(in srgb,var(--theme-input) 86%,var(--theme-soft) 14%)!important;color:var(--ink)!important;filter:none!important}
        body.ra-app :is(.branch-graph-node-name-inline,.branch-graph-node-name,.branch-table-node-name,.accessory-branch-name){color:var(--ink)!important;font-weight:1000!important;text-shadow:none!important;letter-spacing:.01em!important}
        body.ra-app .branch-graph-node-name-inline{font-size:15px!important;line-height:1.22!important}
        body.ra-app .accessory-branch-name{font-size:14px!important;line-height:1.28!important}
        body.ra-app :is(.branch-graph-node,.accessory-branch-node){border-color:color-mix(in srgb,var(--line) 62%,var(--ink) 38%)!important}
        body.ra-app .branch-graph-scroll.has-route-focus .branch-graph-node{opacity:.42!important;filter:saturate(.70) brightness(1)!important}
        body.ra-app .branch-graph-scroll.has-route-focus .branch-graph-node.route-focus{opacity:1!important;filter:none!important}
        @media(max-width:720px){body.ra-app .branch-graph-node-name-inline{font-size:14px!important;line-height:1.2!important}body.ra-app .branch-graph-scroll.has-route-focus .branch-graph-node{opacity:.36!important}}
      `;
    }catch(_){ }
  }
  function applyTheme(key,{persist=true}={}){
    key=LEGACY_THEME_KEYS[key]||key;const theme=THEMES[key]||THEMES.brown;key=THEMES[key]?key:'brown';
    if(persist)localStorage.setItem(THEME_STORAGE_KEY,key);
    const root=document.documentElement;root.dataset.raTheme=key;document.body?.setAttribute('data-ra-theme',key);
    Object.entries(themePairs(theme)).forEach(([k,v])=>root.style.setProperty(k,v));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme.theme);
    const select=document.querySelector('#themeColorSelect');if(select&&select.value!==key)select.value=key;
    Object.values(frames||{}).forEach(frame=>applyThemeToFrame(frame,theme,key));
  }
  const ACCOUNT=window.RA_ACCOUNT;
  const accountSession=ACCOUNT?.session?.()||{loginPlayerKey:'',role:'player'};
  let binding=ACCOUNT?.readCachedBinding?.(accountSession.loginPlayerKey)||null;
  window.RA_PLAYER_CONTEXT={charKey:String(binding?.charKey||'').trim(),facilityKey:String(binding?.facilityKey||'').trim(),characterId:'',loginPlayerKey:String(accountSession.loginPlayerKey||'').trim(),role:accountSession.role||'player'};
  function closeDrawer(){sidebar.classList.remove('open');backdrop.classList.remove('show')}
  function characterButtons(){return [...document.querySelectorAll('.character-nav-btn')]}
  const frameTimers=new Map();
  function setFrameLoading(name,text='読み込み中'){
    const frame=frames[name],wrap=frame?.closest('.module-frame-wrap');if(!wrap)return;if(moduleState[name])moduleState[name].ready=false;wrap.classList.remove('loaded','load-error');
    const label=wrap.querySelector('.frame-loading-text');if(label)label.textContent=text||'読み込み中';clearTimeout(frameTimers.get(name));
    const timeout=name==='character'?120000:45000;
    frameTimers.set(name,setTimeout(()=>{if(wrap.classList.contains('loaded'))return;if(name==='character'){if(label)label.textContent='通信を再試行しています…';return;}wrap.classList.add('load-error');if(label)label.textContent='読み込みがタイムアウトしました。再読み込みできます。';},timeout));
  }
  function setFrameReady(name){const frame=frames[name],wrap=frame?.closest('.module-frame-wrap');if(!wrap)return;if(moduleState[name])moduleState[name].ready=true;clearTimeout(frameTimers.get(name));frameTimers.delete(name);wrap.classList.remove('load-error');wrap.classList.add('loaded');applyThemeToFrame(frame,THEMES[currentTheme()]);}
  function setFrameError(name,text='読み込みに失敗しました'){const frame=frames[name],wrap=frame?.closest('.module-frame-wrap');if(!wrap)return;clearTimeout(frameTimers.get(name));frameTimers.delete(name);wrap.classList.remove('loaded');wrap.classList.add('load-error');const label=wrap.querySelector('.frame-loading-text');if(label)label.textContent=text;}
  function reloadFrame(name){const frame=frames[name];if(!frame)return;const base=frame.dataset.src||frame.getAttribute('src')||'';if(!base)return;frame.dataset.loaded='1';if(moduleState[name])moduleState[name].ready=false;if(name==='character')moduleState.character.lastCharacterId='';setFrameLoading(name,'再読み込み中');try{const u=new URL(base,location.href);u.searchParams.set('retry',String(Date.now()));frame.src=u.toString();}catch(_){frame.src=base+(base.includes('?')?'&':'?')+'retry='+Date.now();}}
  function ensureFrame(name){const frame=frames[name];if(!frame||frame.dataset.loaded==='1')return;frame.dataset.loaded='1';setFrameLoading(name);frame.addEventListener('load',()=>{applyThemeToFrame(frame,THEMES[currentTheme()]);const wrap=frame.closest('.module-frame-wrap');if(!wrap?.classList.contains('loaded')){const label=wrap?.querySelector('.frame-loading-text');if(label)label.textContent='データを読み込み中';}});frame.src=frame.dataset.src;}
  function show(name,{writeHash=true}={}){if(!document.querySelector('#view-'+name))name='home';views.forEach(v=>v.classList.toggle('active',v.id==='view-'+name));nav.forEach(b=>b.classList.toggle('active',b.dataset.view===name));if(name!=='character')characterButtons().forEach(b=>b.classList.remove('active'));const active=document.querySelector('#view-'+name);mobileTitle.textContent=active?.dataset.title||'Recraft Alchemia';ensureFrame(name);closeDrawer();if(writeHash&&location.hash!=='#'+name)history.pushState(null,'','#'+name);}
  function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
  function jsonpOnce(action,payload={},timeoutMs=24000){return new Promise((resolve,reject)=>{const cb='raPlayerProtoCb_'+Date.now()+'_'+Math.random().toString(36).slice(2),script=document.createElement('script');const timer=setTimeout(()=>{cleanup();reject(new Error('キャラクター一覧の取得に時間がかかっています。'));},timeoutMs);function cleanup(){clearTimeout(timer);try{delete window[cb]}catch(_){window[cb]=undefined}script.remove()}window[cb]=json=>{cleanup();if(!json||json.ok===false)reject(new Error(json?.error||'キャラクター一覧を取得できませんでした。'));else resolve(json)};try{const u=new URL(GAS_URL);u.searchParams.set('api','1');u.searchParams.set('action',action);u.searchParams.set('callback',cb);u.searchParams.set('_t',Date.now());Object.entries(payload).forEach(([k,v])=>{if(v!==undefined&&v!==null)u.searchParams.set(k,typeof v==='object'?JSON.stringify(v):String(v))});script.onerror=()=>{cleanup();reject(new Error('キャラクター一覧の通信に失敗しました。'));};script.src=u.toString();document.head.appendChild(script);}catch(e){cleanup();reject(e)}})}
  async function jsonp(action,payload={}){let last;for(let i=0;i<3;i++){try{return await jsonpOnce(action,payload,24000+i*6000)}catch(e){last=e;if(i<2)await sleep([700,1800][i])}}throw last||new Error('キャラクター一覧を取得できませんでした。')}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function listCacheKey(){return 'ra-char-list-cache:'+window.RA_PLAYER_CONTEXT.charKey}
  function readListCache(){
    const key=listCacheKey();
    for(const storage of [localStorage,sessionStorage]){try{const v=JSON.parse(storage.getItem(key)||'null');if(Array.isArray(v?.items))return v.items}catch(_){}}
    return null;
  }
  function saveListCache(items){const payload=JSON.stringify({at:Date.now(),items});try{localStorage.setItem(listCacheKey(),payload)}catch(_){}try{sessionStorage.setItem(listCacheKey(),payload)}catch(_){}}
  function connectionAllowsWarmup(){const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;return !c?.saveData&&!['slow-2g','2g'].includes(String(c?.effectiveType||''));}
  function scheduleCharacterWarmup(){
    if(characterWarmupScheduled||!connectionAllowsWarmup())return;characterWarmupScheduled=true;
    const run=()=>{ensureFrame('character');};
    if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:2200});else setTimeout(run,900);
  }
  function lastCharacterMeta(){
    let id='';try{id=String(localStorage.getItem(LAST_CHARACTER_KEY)||'')}catch(_){}
    return characters.find(c=>String(c.id)===id)||null;
  }
  function scheduleLastCharacterPrefetch(){
    if(!moduleState.character.ready||!connectionAllowsWarmup())return;const c=lastCharacterMeta();if(!c)return;
    const run=()=>postCharacter({type:'RA_PREFETCH_CHARACTER',characterId:String(c.id),revision:Number(c.revision||0)||0,storageRow:Number(c.storageRow||0)||0});
    if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:2800});else setTimeout(run,1200);
  }
  function renderCharacterNav(){if(!characterNavList)return;const countLabel=document.querySelector('#playerCharacterCount');if(countLabel)countLabel.textContent=`保存済み ${characters.length}人`;if(!characters.length){characterNavList.innerHTML='<div class="character-nav-status empty">保存済みキャラクターはありません。</div>';return;}characterNavList.innerHTML=characters.map(c=>`<button class="character-nav-btn" type="button" data-character-id="${escapeHtml(c.id)}">${escapeHtml(c.name||'無名のキャラクター')}</button>`).join('');characterButtons().forEach(btn=>btn.addEventListener('click',()=>selectCharacterById(btn.dataset.characterId)));}
  async function loadCharacterList({background=false}={}){
    const key=window.RA_PLAYER_CONTEXT.charKey;if(!key){characterNavList.innerHTML='<div class="character-nav-status error">ログイン時のキャラクターシート用プレイヤーキー紐づけが見つかりません。</div>';return;}
    const cached=readListCache();if(cached&&!characters.length){characters=cached;renderCharacterNav();routeFromHash();}
    if(!background&&!characters.length)characterNavList.innerHTML='<div class="character-nav-status loading"><span class="mini-spinner" aria-hidden="true"></span><span>読み込み中</span></div>';
    try{
      const beforeActive=selectedCharacterId?characters.find(c=>String(c.id)===String(selectedCharacterId)):null;
      const res=await jsonp('list',{playerKey:key});const fresh=Array.isArray(res)?res:(Array.isArray(res.items)?res.items:(Array.isArray(res.data?.items)?res.data.items:[]));
      characters=fresh;lastListRefreshAt=Date.now();saveListCache(characters);renderCharacterNav();routeFromHash();scheduleCharacterWarmup();
      const current=selectedCharacterId?characters.find(c=>String(c.id)===String(selectedCharacterId)):null;
      if(current&&moduleState.character.ready){
        const remoteRev=Number(current.revision||0)||0,loadedRev=Number(moduleState.character.revision||0)||0;
        if(remoteRev&&loadedRev&&remoteRev!==loadedRev){postCharacter({type:'RA_OPEN_CHARACTER',characterId:String(current.id),revision:remoteRev,storageRow:Number(current.storageRow||0)||0,force:true});}
      }
      if(beforeActive&&current&&String(beforeActive.name||'')!==String(current.name||''))characterViewName.textContent=current.name||'無名のキャラクター';
    }catch(e){if(characters.length){scheduleCharacterWarmup();return;}characterNavList.innerHTML=`<div class="character-nav-status error"><div>${escapeHtml(e.message)}</div><button class="character-nav-retry" type="button">一覧を再読み込み</button></div>`;characterNavList.querySelector('.character-nav-retry')?.addEventListener('click',()=>loadCharacterList());}
  }
  function postCharacter(message){try{frames.character?.contentWindow?.postMessage(message,location.origin)}catch(_){}}
  function selectCharacterById(id,{writeHash=true}={}){const character=characters.find(c=>String(c.id)===String(id));if(!character)return;const nextId=String(character.id),sameCharacter=selectedCharacterId===nextId;selectedCharacterId=nextId;window.RA_PLAYER_CONTEXT.characterId=selectedCharacterId;window.RA_PLAYER_CONTEXT.characterMeta={revision:Number(character.revision||0)||0,storageRow:Number(character.storageRow||0)||0};try{localStorage.setItem(LAST_CHARACTER_KEY,selectedCharacterId)}catch(_){}characterButtons().forEach(b=>b.classList.toggle('active',String(b.dataset.characterId)===selectedCharacterId));characterViewName.textContent=character.name||'無名のキャラクター';show('character',{writeHash:false});mobileTitle.textContent=character.name||'キャラクター';ensureFrame('character');if(!sameCharacter||moduleState.character.lastCharacterId!==selectedCharacterId){moduleState.character.lastCharacterId=selectedCharacterId;postCharacter({type:'RA_OPEN_CHARACTER',characterId:selectedCharacterId,revision:Number(character.revision||0)||0,storageRow:Number(character.storageRow||0)||0,force:false});}if(writeHash)history.pushState(null,'','#character/'+encodeURIComponent(selectedCharacterId));}
  function openNewCharacter({writeHash=true}={}){selectedCharacterId='';window.RA_PLAYER_CONTEXT.characterId='__new__';characterButtons().forEach(b=>b.classList.remove('active'));characterViewName.textContent='新規キャラクター';show('character',{writeHash:false});mobileTitle.textContent='新規キャラクター';ensureFrame('character');moduleState.character.lastCharacterId='';postCharacter({type:'RA_NEW_CHARACTER'});if(writeHash&&location.hash!=='#character/new')history.pushState(null,'','#character/new');}
  window.addEventListener('message',ev=>{if(ev.origin!==location.origin)return;const name=Object.entries(frames).find(([,frame])=>frame?.contentWindow===ev.source)?.[0];if(!name)return;const type=String(ev.data?.type||'');if(type==='RA_MODULE_LOADING')setFrameLoading(name,String(ev.data?.text||'読み込み中'));else if(type==='RA_MODULE_READY'){setFrameReady(name);if(name==='character'){moduleState.character.revision=Number(ev.data?.revision||moduleState.character.revision||0)||0;moduleState.character.storageRow=Number(ev.data?.storageRow||moduleState.character.storageRow||0)||0;if(window.RA_PLAYER_CONTEXT.characterId&&!String(window.RA_PLAYER_CONTEXT.characterId).startsWith('__')){moduleState.character.lastCharacterId=String(window.RA_PLAYER_CONTEXT.characterId);const fresh=characters.find(c=>String(c.id)===moduleState.character.lastCharacterId),remoteRev=Number(fresh?.revision||0)||0;if(remoteRev&&moduleState.character.revision&&remoteRev!==moduleState.character.revision){postCharacter({type:'RA_OPEN_CHARACTER',characterId:moduleState.character.lastCharacterId,revision:remoteRev,storageRow:Number(fresh?.storageRow||0)||0,force:true});}}else scheduleLastCharacterPrefetch();}}else if(type==='RA_MODULE_ERROR')setFrameError(name,String(ev.data?.text||'読み込みに失敗しました'));else if(type==='RA_CHARACTER_SAVED'){const id=String(ev.data?.id||'');const row=characters.find(c=>String(c.id)===id);if(row){row.revision=Number(ev.data?.revision||row.revision||0)||0;row.storageRow=Number(ev.data?.storageRow||row.storageRow||0)||0;if(ev.data?.name)row.name=String(ev.data.name);row.updatedAt=ev.data?.updatedAt||row.updatedAt;saveListCache(characters);renderCharacterNav();}if(id===selectedCharacterId){moduleState.character.revision=Number(ev.data?.revision||moduleState.character.revision||0)||0;moduleState.character.storageRow=Number(ev.data?.storageRow||moduleState.character.storageRow||0)||0;}}else if(type==='RA_CHARACTER_LIST_CHANGED')loadCharacterList({background:true});});
  characterToggle?.addEventListener('click',()=>{const open=characterCategory.classList.toggle('open');characterToggle.setAttribute('aria-expanded',String(open));});document.querySelector('#menuBtn').onclick=()=>{sidebar.classList.toggle('open');backdrop.classList.toggle('show')};backdrop.onclick=closeDrawer;document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelectorAll('[data-open-view]').forEach(b=>b.onclick=()=>show(b.dataset.openView));document.querySelectorAll('[data-retry-frame]').forEach(button=>button.addEventListener('click',()=>reloadFrame(button.dataset.retryFrame)));document.querySelector('#newCharacterNavBtn')?.addEventListener('click',()=>openNewCharacter());
  document.querySelectorAll('[data-player-maintenance]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.playerMaintenance;if(action==='character-db'||action==='initial-stock'){ensureFrame('character');postCharacter({type:action==='character-db'?'RA_RELOAD_CHARACTER_DB':'RA_SYNC_INITIAL_WAREHOUSE'});}else if(action==='facility-db'){ensureFrame('facility');try{frames.facility?.contentWindow?.postMessage({type:'RA_RELOAD_FACILITY_DB'},location.origin)}catch(_){}}}));
  document.querySelector('#themeColorSelect')?.addEventListener('change',e=>applyTheme(e.currentTarget.value));applyTheme(currentTheme(),{persist:false});
  function routeFromHash(){const raw=(location.hash||'#home').slice(1);if(raw==='character/new')return openNewCharacter({writeHash:false});if(raw.startsWith('character/')){const id=decodeURIComponent(raw.slice('character/'.length));if(characters.length&&characters.some(c=>String(c.id)===id))return selectCharacterById(id,{writeHash:false});return;}show(raw,{writeHash:false});}
  addEventListener('popstate',routeFromHash);
  const notice=document.querySelector('#updateNotice'),noticeText=notice?.querySelector('span'),applyUpdateBtn=document.querySelector('#applyUpdate'),dismissUpdateBtn=document.querySelector('#dismissUpdate');
  const versionState=document.querySelector('#playerVersionState'),currentVersionLabel=document.querySelector('#playerCurrentVersion'),LAST_RUN_VERSION_KEY='ra-player-app-last-run-version';
  if(currentVersionLabel)currentVersionLabel.textContent=APP_VERSION;
  function setVersionState(text,kind=''){if(!versionState)return;versionState.textContent=text;versionState.dataset.state=kind;}
  function showAvailableUpdate(version){if(!notice)return;notice.dataset.mode='available';if(noticeText)noticeText.textContent=`Playerアプリの新しいバージョン ${version} があります（現在 ${APP_VERSION}）。`;if(applyUpdateBtn){applyUpdateBtn.hidden=false;applyUpdateBtn.disabled=false;applyUpdateBtn.textContent='アプリを更新';}if(dismissUpdateBtn)dismissUpdateBtn.textContent='あとで';notice.hidden=false;setVersionState(`v${version}あり`,'update');}
  function showAppliedUpdate(previous){if(!notice)return;notice.dataset.mode='applied';if(noticeText)noticeText.textContent=previous?`Playerアプリを ${APP_VERSION} へ更新しました（前回 ${previous}）。`:`Playerアプリ ${APP_VERSION} を読み込みました。`;if(applyUpdateBtn)applyUpdateBtn.hidden=true;if(dismissUpdateBtn)dismissUpdateBtn.textContent='閉じる';notice.hidden=false;setVersionState('最新版','current');}
  async function checkPublishedVersion(){setVersionState('確認中','checking');try{const res=await fetch('./version.json?t='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'}});if(!res.ok){setVersionState('確認失敗','error');return;}const data=await res.json(),published=String(data.version||'').trim();if(published&&published!==APP_VERSION){showAvailableUpdate(published);await swRegistration?.update().catch(()=>{});return;}setVersionState('最新版','current');}catch(_){setVersionState('確認失敗','error');}}
  async function applyUpdate(){if(applyUpdateBtn){applyUpdateBtn.disabled=true;applyUpdateBtn.textContent='アプリ更新中…';}try{if(swRegistration){await swRegistration.update();if(swRegistration.waiting){swRegistration.waiting.postMessage({type:'SKIP_WAITING'});return;}const worker=swRegistration.installing;if(worker){worker.addEventListener('statechange',()=>{if(worker.state==='installed')(swRegistration.waiting||worker).postMessage({type:'SKIP_WAITING'});});return;}}}catch(_){}location.reload();}
  if(applyUpdateBtn)applyUpdateBtn.onclick=applyUpdate;if(dismissUpdateBtn)dismissUpdateBtn.onclick=()=>{if(notice)notice.hidden=true};
  const previousRunVersion=localStorage.getItem(LAST_RUN_VERSION_KEY)||'';if(previousRunVersion&&previousRunVersion!==APP_VERSION)showAppliedUpdate(previousRunVersion);localStorage.setItem(LAST_RUN_VERSION_KEY,APP_VERSION);
  if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').then(reg=>{swRegistration=reg;if(reg.waiting&&navigator.serviceWorker.controller)showAvailableUpdate('更新準備済み');reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller){if(noticeText)noticeText.textContent='Playerアプリ一式の新しいバージョンを取得しました。更新して切り替えられます。';if(applyUpdateBtn){applyUpdateBtn.hidden=false;applyUpdateBtn.disabled=false;applyUpdateBtn.textContent='アプリを更新';}if(dismissUpdateBtn)dismissUpdateBtn.textContent='あとで';if(notice)notice.hidden=false;setVersionState('更新あり','update');}});});reg.update().catch(()=>{});}).catch(()=>setVersionState('SW未登録','error'));let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});}
  addEventListener('focus',checkPublishedVersion);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkPublishedVersion()});setInterval(checkPublishedVersion,2*60*1000);
  function applyBindingContext(next,session){binding=next;window.RA_PLAYER_CONTEXT.charKey=String(next?.charKey||'').trim();window.RA_PLAYER_CONTEXT.facilityKey=String(next?.facilityKey||'').trim();window.RA_PLAYER_CONTEXT.loginPlayerKey=String(session?.loginPlayerKey||'').trim();window.RA_PLAYER_CONTEXT.role=next?.role||session?.role||'player';}
  async function refreshBindingInBackground(session,cached){
    try{const result=await ACCOUNT.getBinding(session.loginPlayerKey);if(!result.found||!result.binding){showAuthError('このプレイヤーキーの紐づけを確認できませんでした。共通ログインからやり直してください。');return;}const oldChar=String(window.RA_PLAYER_CONTEXT.charKey||''),oldFacility=String(window.RA_PLAYER_CONTEXT.facilityKey||'');applyBindingContext(result.binding,{...session,role:result.role||session.role});if(oldChar!==window.RA_PLAYER_CONTEXT.charKey){characters=[];selectedCharacterId='';loadCharacterList({background:false});}if(oldFacility!==window.RA_PLAYER_CONTEXT.facilityKey&&moduleState.facility.ready)reloadFrame('facility');}
    catch(error){console.warn('アカウント確認に失敗したため、この端末の前回キャッシュで継続します。',error);}
  }
  function showAuthError(message='共通ログインからプレイヤーキーでログインしてください。'){if(app)app.classList.add('hidden');if(authError){authError.classList.remove('hidden');const p=authError.querySelector('.note');if(p)p.textContent=message;}}
  async function bootstrapAccount(){
    const session=ACCOUNT?.session?.()||{};
    if(!session.loginPlayerKey){showAuthError();return false;}
    const cached=ACCOUNT?.readCachedBinding?.(session.loginPlayerKey);
    if(cached?.charKey&&cached?.facilityKey){applyBindingContext(cached,session);refreshBindingInBackground(session,cached);return true;}
    try{const result=await ACCOUNT.getBinding(session.loginPlayerKey);if(!result.found||!result.binding){showAuthError('このプレイヤーキーに紐づくPlayerデータを確認できませんでした。共通ログインから紐づけを確認してください。');return false;}applyBindingContext(result.binding,{...session,role:result.role||session.role});return true;}catch(error){showAuthError('Playerデータをサーバーで確認できませんでした。共通ログインからやり直してください。');return false;}
  }
  function bindAccountKeyUi(){const dlg=document.querySelector('#accountKeyDialog'),open=document.querySelector('[data-open-account-key]'),close=document.querySelector('[data-close-account-key]'),btn=document.querySelector('#changeLoginPlayerKeyBtn'),input=document.querySelector('#newLoginPlayerKey'),status=document.querySelector('#accountKeyStatus'),current=document.querySelector('#currentLoginPlayerKey');open?.addEventListener('click',()=>{const s=ACCOUNT.session();current.textContent=s.loginPlayerKey||'-';input.value='';status.textContent='';status.className='account-key-status';dlg.showModal();input.focus();});close?.addEventListener('click',()=>dlg.close());dlg?.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});btn?.addEventListener('click',async()=>{const s=ACCOUNT.session(),next=String(input.value||'').trim();if(!next){status.textContent='新しいプレイヤーキーを入力してください。';status.className='account-key-status error';return;}btn.disabled=true;status.textContent='サーバーへ確認中…';status.className='account-key-status';try{const r=await ACCOUNT.changeLoginKey(s.loginPlayerKey,next);status.textContent=r.mode==='switch'?'既存のプレイヤーキーが見つかったため、そのアカウントへ切り替えます。':'プレイヤーキーを変更しました。';status.className='account-key-status ok';setTimeout(()=>location.reload(),650);}catch(e){status.textContent=e?.message||String(e);status.className='account-key-status error';}finally{btn.disabled=false;}});}
  (async()=>{if(!await bootstrapAccount())return;if(authError)authError.classList.add('hidden');if(app)app.classList.remove('hidden');bindAccountKeyUi();routeFromHash();loadCharacterList();checkPublishedVersion();})();
})();
