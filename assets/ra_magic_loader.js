(function(){
  if(window.RAMagicLoader)return;

  const STYLE_ID='ra-magic-loader-style';
  const RA={"A":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"167.0,180.0 167.0,500.0 253.0,500.0 253.0,180.0\"/><polygon points=\"225.7,540.0 685.7,360.0 654.3,280.0 194.3,460.0\"/><polygon points=\"627.0,320.0 627.0,680.0 713.0,680.0 713.0,320.0\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","B":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"460.5,132.9 170.5,802.9 249.5,837.1 539.5,167.1\"/><polygon points=\"230.8,857.6 810.8,537.6 769.2,462.4 189.2,782.4\"/><polygon points=\"823.1,472.6 533.1,122.6 466.9,177.4 756.9,527.4\"/><rect x=\"470.8\" y=\"120.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"180.8\" y=\"790.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","C":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"777.5,138.9 317.5,278.9 342.5,361.1 802.5,221.1\"/><polygon points=\"294.2,296.1 174.2,476.1 245.8,523.9 365.8,343.9\"/><polygon points=\"194.3,540.0 654.3,720.0 685.7,640.0 225.7,460.0\"/><rect x=\"300.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","D":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"466.9,177.4 756.9,527.4 823.1,472.6 533.1,122.6\"/><polygon points=\"756.9,472.6 466.9,822.6 533.1,877.4 823.1,527.4\"/><polygon points=\"533.1,822.6 243.1,472.6 176.9,527.4 466.9,877.4\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"470.8\" y=\"820.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","E":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><polygon points=\"638.7,290.5 468.7,470.5 531.3,529.5 701.3,349.5\"/><polygon points=\"468.1,471.1 178.1,791.1 241.9,848.9 531.9,528.9\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","F":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"466.9,122.6 176.9,472.6 243.1,527.4 533.1,177.4\"/><polygon points=\"225.7,540.0 685.7,360.0 654.3,280.0 194.3,460.0\"/><polygon points=\"634.2,343.9 754.2,523.9 825.8,476.1 705.8,296.1\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","G":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"178.1,208.9 468.1,528.9 531.9,471.1 241.9,151.1\"/><polygon points=\"468.1,528.9 758.1,848.9 821.9,791.1 531.9,471.1\"/><polygon points=\"758.1,151.1 468.1,471.1 531.9,528.9 821.9,208.9\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","H":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"167.0,180.0 167.0,500.0 253.0,500.0 253.0,180.0\"/><polygon points=\"194.3,540.0 654.3,720.0 685.7,640.0 225.7,460.0\"/><polygon points=\"711.8,690.0 831.8,190.0 748.2,170.0 628.2,670.0\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","I":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"457.0,150.0 457.0,850.0 543.0,850.0 543.0,150.0\"/><polygon points=\"210.0,543.0 500.0,543.0 500.0,457.0 210.0,457.0\"/></g></svg>","J":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"747.0,180.0 747.0,500.0 833.0,500.0 833.0,180.0\"/><polygon points=\"774.3,460.0 314.3,640.0 345.7,720.0 805.7,540.0\"/><polygon points=\"370.9,693.1 540.9,163.1 459.1,136.9 289.1,666.9\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"300.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","K":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"170.5,197.1 460.5,867.1 539.5,832.9 249.5,162.9\"/><polygon points=\"466.9,177.4 756.9,527.4 823.1,472.6 533.1,122.6\"/><polygon points=\"210.0,543.0 790.0,543.0 790.0,457.0 210.0,457.0\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","L":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"758.1,151.1 468.1,471.1 531.9,528.9 821.9,208.9\"/><polygon points=\"468.1,471.1 178.1,791.1 241.9,848.9 531.9,528.9\"/><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","M":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><polygon points=\"634.2,343.9 754.2,523.9 825.8,476.1 705.8,296.1\"/><polygon points=\"774.3,460.0 314.3,640.0 345.7,720.0 805.7,540.0\"/><polygon points=\"317.5,721.1 777.5,861.1 802.5,778.9 342.5,638.9\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"300.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","N":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"466.9,122.6 176.9,472.6 243.1,527.4 533.1,177.4\"/><polygon points=\"176.9,527.4 466.9,877.4 533.1,822.6 243.1,472.6\"/><polygon points=\"539.5,867.1 829.5,197.1 750.5,162.9 460.5,832.9\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"470.8\" y=\"820.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","O":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"178.1,208.9 468.1,528.9 531.9,471.1 241.9,151.1\"/><polygon points=\"531.9,528.9 821.9,208.9 758.1,151.1 468.1,471.1\"/><polygon points=\"747.0,180.0 747.0,820.0 833.0,820.0 833.0,180.0\"/><polygon points=\"821.9,791.1 531.9,471.1 468.1,528.9 758.1,848.9\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"150.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"790.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","P":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"460.5,132.9 170.5,802.9 249.5,837.1 539.5,167.1\"/><polygon points=\"466.9,177.4 756.9,527.4 823.1,472.6 533.1,122.6\"/><polygon points=\"774.3,460.0 314.3,640.0 345.7,720.0 805.7,540.0\"/><rect x=\"470.8\" y=\"120.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","Q":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><polygon points=\"628.2,330.0 748.2,830.0 831.8,810.0 711.8,310.0\"/><polygon points=\"810.8,782.4 230.8,462.4 189.2,537.6 769.2,857.6\"/><polygon points=\"253.0,500.0 253.0,180.0 167.0,180.0 167.0,500.0\"/><rect x=\"180.8\" y=\"150.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"790.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","R":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"769.2,142.4 189.2,462.4 230.8,537.6 810.8,217.6\"/><polygon points=\"176.9,527.4 466.9,877.4 533.1,822.6 243.1,472.6\"/><polygon points=\"459.1,163.1 629.1,693.1 710.9,666.9 540.9,136.9\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","S":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"777.5,138.9 317.5,278.9 342.5,361.1 802.5,221.1\"/><polygon points=\"298.7,349.5 468.7,529.5 531.3,470.5 361.3,290.5\"/><polygon points=\"468.7,529.5 638.7,709.5 701.3,650.5 531.3,470.5\"/><polygon points=\"657.5,638.9 197.5,778.9 222.5,861.1 682.5,721.1\"/><rect x=\"300.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","T":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"189.2,217.6 769.2,537.6 810.8,462.4 230.8,142.4\"/><polygon points=\"756.9,472.6 466.9,822.6 533.1,877.4 823.1,527.4\"/><polygon points=\"466.9,122.6 176.9,472.6 243.1,527.4 533.1,177.4\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","U":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"466.9,122.6 176.9,472.6 243.1,527.4 533.1,177.4\"/><polygon points=\"189.2,537.6 769.2,857.6 810.8,782.4 230.8,462.4\"/><polygon points=\"758.1,151.1 468.1,471.1 531.9,528.9 821.9,208.9\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","V":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"168.2,190.0 288.2,690.0 371.8,670.0 251.8,170.0\"/><polygon points=\"361.3,709.5 701.3,349.5 638.7,290.5 298.7,650.5\"/><polygon points=\"628.2,330.0 748.2,830.0 831.8,810.0 711.8,310.0\"/><rect x=\"300.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","W":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><polygon points=\"627.0,320.0 627.0,680.0 713.0,680.0 713.0,320.0\"/><polygon points=\"685.7,640.0 225.7,460.0 194.3,540.0 654.3,720.0\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","X":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><polygon points=\"634.2,343.9 754.2,523.9 825.8,476.1 705.8,296.1\"/><polygon points=\"365.8,656.1 245.8,476.1 174.2,523.9 294.2,703.9\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","Y":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"178.1,208.9 468.1,528.9 531.9,471.1 241.9,151.1\"/><polygon points=\"758.1,151.1 468.1,471.1 531.9,528.9 821.9,208.9\"/><polygon points=\"468.7,529.5 638.7,709.5 701.3,650.5 531.3,470.5\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","Z":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"466.9,122.6 176.9,472.6 243.1,527.4 533.1,177.4\"/><polygon points=\"189.2,537.6 769.2,857.6 810.8,782.4 230.8,462.4\"/><polygon points=\"833.0,820.0 833.0,180.0 747.0,180.0 747.0,820.0\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"790.8\" width=\"58.5\" height=\"58.5\"/></g></svg>"};
  const controllers=new WeakMap();

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
.ra-ml-host{width:min(72vw,430px);display:grid;gap:10px;place-items:center;color:var(--accent,#d9c0a2);margin-inline:auto}
.ra-ml-host.ra-ml-large{width:min(82vw,620px);gap:14px}
.ra-ml-runes{display:flex;align-items:center;justify-content:center;gap:clamp(2px,.45vw,5px);min-height:24px;color:color-mix(in srgb,currentColor 82%,#fff 18%);filter:drop-shadow(0 0 5px color-mix(in srgb,currentColor 18%,transparent))}
.ra-ml-host.ra-ml-large .ra-ml-runes{min-height:34px;gap:clamp(3px,.55vw,7px)}
.ra-ml-english{font:500 13px/1.2 "Times New Roman",Times,serif;letter-spacing:.16em;color:color-mix(in srgb,currentColor 74%,#fff 26%);text-align:center;text-shadow:0 0 8px color-mix(in srgb,currentColor 18%,transparent)}
.ra-ml-english.ra-ml-phase-text{font-size:11px;letter-spacing:.14em;opacity:.72}
.ra-ml-host.ra-ml-large .ra-ml-english{font-size:16px;letter-spacing:.19em}
.ra-ml-host.ra-ml-large .ra-ml-english.ra-ml-phase-text{font-size:12px}
.ra-ml-glyph{width:18px;height:25px;display:grid;place-items:center;flex:0 0 auto}
.ra-ml-large .ra-ml-glyph{width:24px;height:34px}
.ra-ml-glyph svg{width:100%;height:100%;display:block}
.ra-ml-space{width:10px;flex:0 0 auto}
.ra-ml-large .ra-ml-space{width:14px}
.ra-ml-phase{opacity:.58}
.ra-ml-circuit{width:100%;height:auto;overflow:visible;filter:drop-shadow(0 0 7px color-mix(in srgb,currentColor 18%,transparent))}
.ra-ml-track{fill:none;stroke:color-mix(in srgb,currentColor 18%,transparent);stroke-width:2;vector-effect:non-scaling-stroke}
.ra-ml-track.ra-ml-main{stroke-width:2.5}
.ra-ml-flow{fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;opacity:.88}
.ra-ml-flow.ra-ml-main{stroke-width:3}
.ra-ml-active-group{clip-path:var(--ra-ml-clip)}
.ra-ml-reveal-rect{transition:width .34s cubic-bezier(.2,.7,.2,1)}
.ra-ml-pulse{fill:none;stroke:color-mix(in srgb,currentColor 72%,#fff 28%);stroke-width:1.4;stroke-dasharray:2 12;stroke-linecap:round;opacity:.5;animation:ra-ml-pulse 1.35s linear infinite}
@keyframes ra-ml-pulse{to{stroke-dashoffset:-28}}
.ra-ml-node{fill:currentColor;stroke:currentColor;stroke-width:1.4;filter:drop-shadow(0 0 5px currentColor)}
.ra-ml-host.ready{color:color-mix(in srgb,var(--accent,#d9c0a2) 78%,#fff 22%)}
.ra-ml-host.error{color:var(--bad,#a64e4e);filter:none}
.ra-ml-host.error .ra-ml-pulse{animation:none;opacity:.15}
.frame-loading .loading-spinner,.character-nav-status.loading .mini-spinner{display:none!important}
.module-frame-wrap:not(.load-error) .frame-loading-text{display:none!important}
.module-frame-wrap.load-error .frame-loading-text{display:block!important;margin-top:8px}
.frame-loading .ra-ml-frame-host{margin:0 auto 8px}
.character-nav-status.loading .ra-ml-mini-host{width:62px;display:inline-grid;vertical-align:middle;margin-right:6px}
.ra-ml-mini-host svg{width:62px;height:20px;display:block;color:var(--accent,#d9c0a2)}
.ra-ml-mini-host .ra-ml-mini-track{fill:none;stroke:color-mix(in srgb,currentColor 20%,transparent);stroke-width:1.5}
.ra-ml-mini-host .ra-ml-mini-flow{fill:none;stroke:currentColor;stroke-width:1.8;stroke-dasharray:100;stroke-dashoffset:22;animation:ra-ml-mini 1.3s ease-in-out infinite alternate}
@keyframes ra-ml-mini{from{stroke-dashoffset:78;opacity:.45}to{stroke-dashoffset:18;opacity:1}}
@media(max-width:560px){
  .ra-ml-host{width:min(84vw,360px);gap:8px}
  .ra-ml-host.ra-ml-large{width:min(90vw,500px)}
  .ra-ml-glyph{width:15px;height:22px}
  .ra-ml-large .ra-ml-glyph{width:20px;height:29px}
}
`;
    document.head.appendChild(s);
  }

  function runeHTML(text){
    const label=String(text||'');
    let html='';
    for(const ch of label){
      if(ch===' '){html+='<span class="ra-ml-space" aria-hidden="true"></span>';continue;}
      const glyph=RA[ch.toUpperCase()];
      if(glyph)html+='<span class="ra-ml-glyph" aria-hidden="true">'+glyph+'</span>';
    }
    return html;
  }

  const circuit=`
<svg class="ra-ml-circuit" viewBox="0 0 640 104" aria-hidden="true">
  <defs>
    <clipPath id="ra-ml-reveal-${Math.random().toString(36).slice(2)}" class="ra-ml-reveal-clip">
      <rect class="ra-ml-reveal-rect" x="0" y="0" width="0" height="104"></rect>
    </clipPath>
  </defs>

  <!-- Base circuit: all branches are continuous from left edge to right edge. -->
  <g class="ra-ml-track">
    <path class="ra-ml-track ra-ml-main"
      d="M18 52H112L150 26H248L286 52H354L392 78H490L528 52H622"/>
    <path
      d="M18 52H96L138 82H232L276 52H366L410 22H504L546 52H622"/>
    <path
      d="M18 52H126L164 18H224L262 52H378L416 86H476L514 52H622"/>
    <path
      d="M18 52H82L122 34H190L228 52H414L452 34H520L560 52H622"/>
  </g>

  <!-- Active layer is revealed by one global left-to-right clip. -->
  <g class="ra-ml-active-group">
    <path class="ra-ml-flow ra-ml-main"
      d="M18 52H112L150 26H248L286 52H354L392 78H490L528 52H622"/>
    <path class="ra-ml-flow"
      d="M18 52H96L138 82H232L276 52H366L410 22H504L546 52H622"/>
    <path class="ra-ml-flow"
      d="M18 52H126L164 18H224L262 52H378L416 86H476L514 52H622"/>
    <path class="ra-ml-flow"
      d="M18 52H82L122 34H190L228 52H414L452 34H520L560 52H622"/>
    <path class="ra-ml-pulse"
      d="M18 52H112L150 26H248L286 52H354L392 78H490L528 52H622"/>

    <g class="ra-ml-nodes">
      <circle class="ra-ml-node" cx="112" cy="52" r="4"/>
      <circle class="ra-ml-node" cx="150" cy="26" r="4"/>
      <circle class="ra-ml-node" cx="228" cy="52" r="4"/>
      <circle class="ra-ml-node" cx="286" cy="52" r="4"/>
      <circle class="ra-ml-node" cx="366" cy="52" r="4"/>
      <circle class="ra-ml-node" cx="410" cy="22" r="4"/>
      <circle class="ra-ml-node" cx="452" cy="34" r="4"/>
      <circle class="ra-ml-node" cx="528" cy="52" r="4"/>
    </g>
  </g>
</svg>`;

  function phaseFor(p){
    if(p<36)return 'Data Scan';
    if(p<66)return 'Decode';
    if(p<92)return 'Sync';
    return 'Ready';
  }

  function mount(host,opts={}){
    ensureStyle();
    if(!host)return null;
    if(controllers.has(host))return controllers.get(host);

    const label=opts.label||'Now Loading';
    host.classList.add('ra-ml-host');
    if(opts.large)host.classList.add('ra-ml-large');
    host.setAttribute('role','status');
    host.setAttribute('aria-live','polite');
    host.setAttribute('aria-label',label);
    host.innerHTML=`
      <div class="ra-ml-runes ra-ml-title" aria-hidden="true">${runeHTML(label)}</div>
      <div class="ra-ml-english ra-ml-title-text">${label}</div>
      ${circuit}
      <div class="ra-ml-runes ra-ml-phase" aria-hidden="true">${runeHTML('Data Scan')}</div>
      <div class="ra-ml-english ra-ml-phase-text">Data Scan</div>`;

    const svg=host.querySelector('.ra-ml-circuit');
    const clipPath=svg?.querySelector('.ra-ml-reveal-clip');
    const revealRect=svg?.querySelector('.ra-ml-reveal-rect');
    const activeGroup=svg?.querySelector('.ra-ml-active-group');
    if(clipPath && activeGroup){
      const clipId=clipPath.id;
      activeGroup.style.clipPath=`url(#${clipId})`;
      activeGroup.style.setProperty('--ra-ml-clip',`url(#${clipId})`);
    }
    const phase=host.querySelector('.ra-ml-phase');
    const phaseTextEl=host.querySelector('.ra-ml-phase-text');
    let progress=0;
    let timer=null;
    let active=false;

    function render(p,phaseText){
      progress=Math.max(0,Math.min(100,Number(p)||0));
      // One shared left-to-right reveal frontier for every circuit line.
      // This prevents a branch on the right from lighting before the left side catches up.
      if(revealRect){
        const left=18;
        const right=622;
        const width=Math.max(0,(right-left)*(progress/100));
        revealRect.setAttribute('x',String(left));
        revealRect.setAttribute('width',String(width));
      }
      const text=phaseText||phaseFor(progress);
      phase.innerHTML=runeHTML(text);
      if(phaseTextEl)phaseTextEl.textContent=text;
      host.setAttribute('aria-label',label+' — '+text);
      host.classList.toggle('ready',progress>=100);
    }

    function stop(){if(timer)clearInterval(timer);timer=null;active=false;}

    function start(){
      if(active)return;
      stop();
      active=true;
      host.classList.remove('ready','error');
      progress=Math.min(progress||7,12);
      render(progress,'Data Scan');
      timer=setInterval(()=>{
        if(progress>=87){stop();return;}
        const gain=Math.max(.45,(88-progress)*.055);
        render(Math.min(87,progress+gain));
      },150);
    }

    function setProgress(p,phaseText){
      stop();
      host.classList.remove('error');
      render(p,phaseText);
    }

    async function complete(){
      stop();
      host.classList.remove('error');

      // Even when the real data load finishes instantly, finish the visual
      // analysis sequence before revealing the destination screen.
      const remaining=[
        {p:36,phase:'Data Scan',hold:140},
        {p:66,phase:'Decode',hold:170},
        {p:92,phase:'Sync',hold:190},
        {p:100,phase:'Ready',hold:360}
      ];

      for(const step of remaining){
        if(progress < step.p){
          render(step.p,step.phase);
          await new Promise(resolve=>setTimeout(resolve,step.hold));
        }else if(step.phase==='Ready'){
          render(100,'Ready');
          await new Promise(resolve=>setTimeout(resolve,step.hold));
        }
      }
    }

    function error(){
      stop();
      host.classList.add('error');
      render(Math.max(progress,64),'Data Scan');
    }

    const controller={host,start,setProgress,complete,error,stop,get progress(){return progress;}};
    controllers.set(host,controller);
    if(opts.auto!==false)start(); else render(0,'Data Scan');
    return controller;
  }

  function ensureFrame(wrap){
    if(!wrap)return null;
    const indicator=wrap.querySelector('.loading-indicator')||wrap.querySelector('.frame-loading');
    if(!indicator)return null;
    let host=indicator.querySelector('.ra-ml-frame-host');
    if(!host){
      host=document.createElement('div');
      host.className='ra-ml-frame-host';
      indicator.insertBefore(host,indicator.firstChild);
    }
    return mount(host,{label:'Now Loading'});
  }

  function startWrap(wrap){
    const c=ensureFrame(wrap);
    if(c)c.start();
    return c;
  }

  function phaseWrap(wrap,phaseText,p){
    const c=ensureFrame(wrap);
    if(c)c.setProgress(p,phaseText);
    return c;
  }

  function completeWrap(wrap){
    const c=ensureFrame(wrap);
    return c?c.complete():Promise.resolve();
  }

  function errorWrap(wrap){
    const c=ensureFrame(wrap);
    if(c)c.error();
    return c;
  }

  function miniMarkup(){
    return `<span class="ra-ml-mini-host" aria-label="Data Scan">
      <svg viewBox="0 0 100 28" aria-hidden="true">
        <path class="ra-ml-mini-track" pathLength="100" d="M3 14H97M18 14L30 4H54L64 14H84M25 14L36 24H62L74 14"/>
        <path class="ra-ml-mini-flow" pathLength="100" d="M3 14H97M18 14L30 4H54L64 14H84M25 14L36 24H62L74 14"/>
      </svg></span>`;
  }

  function upgradeMini(root=document){
    root.querySelectorAll?.('.character-nav-status.loading').forEach(el=>{
      if(el.querySelector('.ra-ml-mini-host'))return;
      el.insertAdjacentHTML('afterbegin',miniMarkup());
    });
  }

  function autoUpgrade(){
    document.querySelectorAll('.module-frame-wrap').forEach(w=>{
      if(!w.classList.contains('loaded')&&!w.classList.contains('load-error'))startWrap(w);
    });
    upgradeMini();
    const mo=new MutationObserver(muts=>{
      for(const m of muts){
        if(m.type==='childList'){
          upgradeMini(m.target.nodeType===1?m.target:document);
          m.addedNodes.forEach(n=>{if(n.nodeType===1)upgradeMini(n);});
        }
      }
    });
    mo.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',autoUpgrade,{once:true});
  else autoUpgrade();

  window.RAMagicLoader={
    mount,startWrap,phaseWrap,completeWrap,errorWrap,ensureFrame,runeHTML
  };
})();
