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
.ra-ml-host{width:min(74vw,520px);display:grid;gap:10px;place-items:center;color:var(--accent,#d9c0a2);margin-inline:auto}
.ra-ml-text-stage{position:relative;display:grid;place-items:center;min-height:34px;width:100%;overflow:visible}
.ra-ml-runes,.ra-ml-english{grid-area:1/1;transition:opacity .34s ease,filter .34s ease,transform .34s ease}
.ra-ml-runes{display:flex;align-items:center;justify-content:center;gap:clamp(2px,.45vw,5px);min-height:28px;color:color-mix(in srgb,currentColor 82%,#fff 18%);filter:drop-shadow(0 0 6px color-mix(in srgb,currentColor 26%,transparent));opacity:1}
.ra-ml-english{font:500 15px/1.2 "Times New Roman",Times,serif;letter-spacing:.18em;color:color-mix(in srgb,currentColor 82%,#fff 18%);text-align:center;text-shadow:0 0 8px color-mix(in srgb,currentColor 22%,transparent);opacity:0}
.ra-ml-text-stage.show-english .ra-ml-runes{opacity:0;filter:blur(2px);transform:scale(.985)}
.ra-ml-text-stage.show-english .ra-ml-english{opacity:1}
.ra-ml-glyph{width:18px;height:25px;display:grid;place-items:center;flex:0 0 auto}
.ra-ml-glyph svg{width:100%;height:100%;display:block}
.ra-ml-space{width:10px;flex:0 0 auto}
.ra-ml-circuit{width:100%;height:auto;overflow:visible;filter:drop-shadow(0 0 8px color-mix(in srgb,currentColor 16%,transparent))}
.ra-ml-track{fill:none;stroke:color-mix(in srgb,currentColor 16%,transparent);stroke-width:1.8;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}
.ra-ml-track.ra-ml-main{stroke-width:2.3}
.ra-ml-flow{fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;opacity:.78}
.ra-ml-flow.ra-ml-main{stroke-width:2.8}
.ra-ml-lit-group{clip-path:var(--ra-ml-lit-clip)}
.ra-ml-head-group{clip-path:var(--ra-ml-head-clip);filter:drop-shadow(0 0 7px currentColor)}
.ra-ml-head{fill:none;stroke:color-mix(in srgb,currentColor 68%,#fff 32%);stroke-width:3.1;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;opacity:.95}
.ra-ml-head-main{stroke-width:3.6}
.ra-ml-nodes circle{fill:currentColor;stroke:currentColor;stroke-width:1.2;filter:drop-shadow(0 0 5px currentColor)}
.ra-ml-lit-rect,.ra-ml-head-rect{transition:x .30s cubic-bezier(.2,.7,.2,1),width .30s cubic-bezier(.2,.7,.2,1)}
.ra-ml-phase-line{font:500 11px/1.2 "Times New Roman",Times,serif;letter-spacing:.15em;opacity:.6;text-align:center;min-height:14px}
.ra-ml-host.ready{color:color-mix(in srgb,var(--accent,#d9c0a2) 78%,#fff 22%)}
.ra-ml-host.error{color:var(--bad,#a64e4e)}
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
<svg class="ra-ml-circuit" viewBox="0 0 700 126" aria-hidden="true">
  <defs>
    <clipPath class="ra-ml-lit-clip">
      <rect class="ra-ml-lit-rect" x="26" y="0" width="0" height="126"></rect>
    </clipPath>
    <clipPath class="ra-ml-head-clip">
      <rect class="ra-ml-head-rect" x="26" y="0" width="0" height="126"></rect>
    </clipPath>
  </defs>

  <g class="ra-ml-track">
    <path class="ra-ml-track ra-ml-main"
      d="M26 63H102L136 31H214L248 63H302L338 95H424L460 63H512L548 31H622L658 63H674"/>
    <path
      d="M26 63H84L122 97H202L240 63H318L356 29H444L482 63H528L566 97H640L674 63"/>
    <path
      d="M26 63H116L150 45H234L268 63H432L466 45H550L584 63H674"/>
    <path
      d="M26 63H68L108 21H182L224 63H474L516 105H590L632 63H674"/>
    <path
      d="M26 63H148L178 79H270L302 63H398L430 79H522L552 63H674"/>
  </g>

  <g class="ra-ml-lit-group">
    <path class="ra-ml-flow ra-ml-main"
      d="M26 63H102L136 31H214L248 63H302L338 95H424L460 63H512L548 31H622L658 63H674"/>
    <path class="ra-ml-flow"
      d="M26 63H84L122 97H202L240 63H318L356 29H444L482 63H528L566 97H640L674 63"/>
    <path class="ra-ml-flow"
      d="M26 63H116L150 45H234L268 63H432L466 45H550L584 63H674"/>
    <path class="ra-ml-flow"
      d="M26 63H68L108 21H182L224 63H474L516 105H590L632 63H674"/>
    <path class="ra-ml-flow"
      d="M26 63H148L178 79H270L302 63H398L430 79H522L552 63H674"/>
    <g class="ra-ml-nodes">
      <circle cx="102" cy="63" r="4"/><circle cx="136" cy="31" r="4"/>
      <circle cx="240" cy="63" r="4"/><circle cx="302" cy="63" r="4"/>
      <circle cx="356" cy="29" r="4"/><circle cx="460" cy="63" r="4"/>
      <circle cx="516" cy="105" r="4"/><circle cx="584" cy="63" r="4"/>
      <circle cx="658" cy="63" r="4"/>
    </g>
  </g>

  <g class="ra-ml-head-group">
    <path class="ra-ml-head ra-ml-head-main"
      d="M26 63H102L136 31H214L248 63H302L338 95H424L460 63H512L548 31H622L658 63H674"/>
    <path class="ra-ml-head"
      d="M26 63H84L122 97H202L240 63H318L356 29H444L482 63H528L566 97H640L674 63"/>
    <path class="ra-ml-head"
      d="M26 63H116L150 45H234L268 63H432L466 45H550L584 63H674"/>
    <path class="ra-ml-head"
      d="M26 63H68L108 21H182L224 63H474L516 105H590L632 63H674"/>
    <path class="ra-ml-head"
      d="M26 63H148L178 79H270L302 63H398L430 79H522L552 63H674"/>
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
      <div class="ra-ml-text-stage">
        <div class="ra-ml-runes" aria-hidden="true">${runeHTML(label)}</div>
        <div class="ra-ml-english">${label}</div>
      </div>
      ${circuit}
      <div class="ra-ml-phase-line">Data Scan</div>`;

    const svg=host.querySelector('.ra-ml-circuit');
    const litClip=svg?.querySelector('.ra-ml-lit-clip');
    const litRect=svg?.querySelector('.ra-ml-lit-rect');
    const headClip=svg?.querySelector('.ra-ml-head-clip');
    const headRect=svg?.querySelector('.ra-ml-head-rect');
    const litGroup=svg?.querySelector('.ra-ml-lit-group');
    const headGroup=svg?.querySelector('.ra-ml-head-group');
    const textStage=host.querySelector('.ra-ml-text-stage');
    const runeEl=host.querySelector('.ra-ml-runes');
    const englishEl=host.querySelector('.ra-ml-english');
    const phaseLine=host.querySelector('.ra-ml-phase-line');

    const clipToken='ra-ml-'+Math.random().toString(36).slice(2);
    if(litClip){
      litClip.id=clipToken+'-lit';
      if(litGroup)litGroup.style.clipPath=`url(#${litClip.id})`;
    }
    if(headClip){
      headClip.id=clipToken+'-head';
      if(headGroup)headGroup.style.clipPath=`url(#${headClip.id})`;
    }

    let progress=0;
    let morphTimer=null;
    let morphEnglish=false;

    function setTextPhrase(text){
      if(runeEl)runeEl.innerHTML=runeHTML(text);
      if(englishEl)englishEl.textContent=text;
    }

    function startMorph(){
      if(morphTimer)return;
      morphEnglish=false;
      textStage?.classList.remove('show-english');
      morphTimer=setInterval(()=>{
        morphEnglish=!morphEnglish;
        textStage?.classList.toggle('show-english',morphEnglish);
      },760);
    }

    function stopMorph(showEnglish=false){
      if(morphTimer)clearInterval(morphTimer);
      morphTimer=null;
      morphEnglish=!!showEnglish;
      textStage?.classList.toggle('show-english',morphEnglish);
    }
    let timer=null;
    let active=false;

    function render(p,phaseText){
      progress=Math.max(0,Math.min(100,Number(p)||0));

      const left=26;
      const right=674;
      const span=right-left;
      const frontier=left+span*(progress/100);

      if(litRect){
        litRect.setAttribute('x',String(left));
        litRect.setAttribute('width',String(Math.max(0,frontier-left)));
      }

      if(headRect){
        const headWidth=42;
        const hx=Math.max(left,frontier-headWidth);
        headRect.setAttribute('x',String(hx));
        headRect.setAttribute('width',String(Math.max(0,Math.min(headWidth,frontier-left))));
      }

      const text=phaseText||phaseFor(progress);
      if(phaseLine)phaseLine.textContent=text;
      host.setAttribute('aria-label',label+' — '+text);
      host.classList.toggle('ready',progress>=100);
    }

    function stop(){if(timer)clearInterval(timer);timer=null;active=false;}

    function start(){
      if(active)return;
      stop();
      active=true;
      host.classList.remove('ready','error');
      setTextPhrase(label);
      startMorph();
      progress=Math.min(progress||4,10);
      render(progress,'Data Scan');
      timer=setInterval(()=>{
        if(progress>=88){stop();return;}
        const gain=Math.max(.45,(89-progress)*.052);
        render(Math.min(88,progress+gain));
      },150);
    }

    function setProgress(p,phaseText){
      stop();
      host.classList.remove('error');
      if(progress<100)startMorph();
      render(p,phaseText);
    }

    async function complete(){
      stop();
      host.classList.remove('error');

      const remaining=[
        {p:36,phase:'Data Scan',hold:150},
        {p:66,phase:'Decode',hold:180},
        {p:92,phase:'Sync',hold:220}
      ];

      for(const step of remaining){
        if(progress < step.p){
          render(step.p,step.phase);
          await new Promise(resolve=>setTimeout(resolve,step.hold));
        }
      }

      stopMorph(true);
      setTextPhrase('Ready');
      render(100,'Ready');
      await new Promise(resolve=>setTimeout(resolve,2000));
    }

    function error(){
      stop();
      stopMorph(true);
      host.classList.add('error');
      setTextPhrase('Load Error');
      render(Math.max(progress,64),'Load Error');
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
