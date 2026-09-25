(function(){
  if(window.RAMagicLoader)return;

  const STYLE_ID='ra-magic-loader-style';
  const RA={"A":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"167.0,180.0 167.0,500.0 253.0,500.0 253.0,180.0\"/><polygon points=\"225.7,540.0 685.7,360.0 654.3,280.0 194.3,460.0\"/><polygon points=\"627.0,320.0 627.0,680.0 713.0,680.0 713.0,320.0\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","B":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"460.5,132.9 170.5,802.9 249.5,837.1 539.5,167.1\"/><polygon points=\"230.8,857.6 810.8,537.6 769.2,462.4 189.2,782.4\"/><polygon points=\"823.1,472.6 533.1,122.6 466.9,177.4 756.9,527.4\"/><rect x=\"470.8\" y=\"120.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"180.8\" y=\"790.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","C":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"777.5,138.9 317.5,278.9 342.5,361.1 802.5,221.1\"/><polygon points=\"294.2,296.1 174.2,476.1 245.8,523.9 365.8,343.9\"/><polygon points=\"194.3,540.0 654.3,720.0 685.7,640.0 225.7,460.0\"/><rect x=\"300.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","D":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"466.9,177.4 756.9,527.4 823.1,472.6 533.1,122.6\"/><polygon points=\"756.9,472.6 466.9,822.6 533.1,877.4 823.1,527.4\"/><polygon points=\"533.1,822.6 243.1,472.6 176.9,527.4 466.9,877.4\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"470.8\" y=\"820.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","E":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><polygon points=\"638.7,290.5 468.7,470.5 531.3,529.5 701.3,349.5\"/><polygon points=\"468.1,471.1 178.1,791.1 241.9,848.9 531.9,528.9\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","F":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"466.9,122.6 176.9,472.6 243.1,527.4 533.1,177.4\"/><polygon points=\"225.7,540.0 685.7,360.0 654.3,280.0 194.3,460.0\"/><polygon points=\"634.2,343.9 754.2,523.9 825.8,476.1 705.8,296.1\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","G":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"178.1,208.9 468.1,528.9 531.9,471.1 241.9,151.1\"/><polygon points=\"468.1,528.9 758.1,848.9 821.9,791.1 531.9,471.1\"/><polygon points=\"758.1,151.1 468.1,471.1 531.9,528.9 821.9,208.9\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","H":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"167.0,180.0 167.0,500.0 253.0,500.0 253.0,180.0\"/><polygon points=\"194.3,540.0 654.3,720.0 685.7,640.0 225.7,460.0\"/><polygon points=\"711.8,690.0 831.8,190.0 748.2,170.0 628.2,670.0\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","I":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"457.0,150.0 457.0,850.0 543.0,850.0 543.0,150.0\"/><polygon points=\"210.0,543.0 500.0,543.0 500.0,457.0 210.0,457.0\"/></g></svg>","J":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"747.0,180.0 747.0,500.0 833.0,500.0 833.0,180.0\"/><polygon points=\"774.3,460.0 314.3,640.0 345.7,720.0 805.7,540.0\"/><polygon points=\"370.9,693.1 540.9,163.1 459.1,136.9 289.1,666.9\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"300.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","K":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"170.5,197.1 460.5,867.1 539.5,832.9 249.5,162.9\"/><polygon points=\"466.9,177.4 756.9,527.4 823.1,472.6 533.1,122.6\"/><polygon points=\"210.0,543.0 790.0,543.0 790.0,457.0 210.0,457.0\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","L":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"758.1,151.1 468.1,471.1 531.9,528.9 821.9,208.9\"/><polygon points=\"468.1,471.1 178.1,791.1 241.9,848.9 531.9,528.9\"/><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","M":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><polygon points=\"634.2,343.9 754.2,523.9 825.8,476.1 705.8,296.1\"/><polygon points=\"774.3,460.0 314.3,640.0 345.7,720.0 805.7,540.0\"/><polygon points=\"317.5,721.1 777.5,861.1 802.5,778.9 342.5,638.9\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"300.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","N":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"466.9,122.6 176.9,472.6 243.1,527.4 533.1,177.4\"/><polygon points=\"176.9,527.4 466.9,877.4 533.1,822.6 243.1,472.6\"/><polygon points=\"539.5,867.1 829.5,197.1 750.5,162.9 460.5,832.9\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"470.8\" y=\"820.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","O":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"178.1,208.9 468.1,528.9 531.9,471.1 241.9,151.1\"/><polygon points=\"531.9,528.9 821.9,208.9 758.1,151.1 468.1,471.1\"/><polygon points=\"747.0,180.0 747.0,820.0 833.0,820.0 833.0,180.0\"/><polygon points=\"821.9,791.1 531.9,471.1 468.1,528.9 758.1,848.9\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"150.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"790.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","P":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"460.5,132.9 170.5,802.9 249.5,837.1 539.5,167.1\"/><polygon points=\"466.9,177.4 756.9,527.4 823.1,472.6 533.1,122.6\"/><polygon points=\"774.3,460.0 314.3,640.0 345.7,720.0 805.7,540.0\"/><rect x=\"470.8\" y=\"120.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","Q":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><polygon points=\"628.2,330.0 748.2,830.0 831.8,810.0 711.8,310.0\"/><polygon points=\"810.8,782.4 230.8,462.4 189.2,537.6 769.2,857.6\"/><polygon points=\"253.0,500.0 253.0,180.0 167.0,180.0 167.0,500.0\"/><rect x=\"180.8\" y=\"150.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"790.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","R":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"769.2,142.4 189.2,462.4 230.8,537.6 810.8,217.6\"/><polygon points=\"176.9,527.4 466.9,877.4 533.1,822.6 243.1,472.6\"/><polygon points=\"459.1,163.1 629.1,693.1 710.9,666.9 540.9,136.9\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","S":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"777.5,138.9 317.5,278.9 342.5,361.1 802.5,221.1\"/><polygon points=\"298.7,349.5 468.7,529.5 531.3,470.5 361.3,290.5\"/><polygon points=\"468.7,529.5 638.7,709.5 701.3,650.5 531.3,470.5\"/><polygon points=\"657.5,638.9 197.5,778.9 222.5,861.1 682.5,721.1\"/><rect x=\"300.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","T":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"189.2,217.6 769.2,537.6 810.8,462.4 230.8,142.4\"/><polygon points=\"756.9,472.6 466.9,822.6 533.1,877.4 823.1,527.4\"/><polygon points=\"466.9,122.6 176.9,472.6 243.1,527.4 533.1,177.4\"/><rect x=\"760.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","U":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"466.9,122.6 176.9,472.6 243.1,527.4 533.1,177.4\"/><polygon points=\"189.2,537.6 769.2,857.6 810.8,782.4 230.8,462.4\"/><polygon points=\"758.1,151.1 468.1,471.1 531.9,528.9 821.9,208.9\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","V":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"168.2,190.0 288.2,690.0 371.8,670.0 251.8,170.0\"/><polygon points=\"361.3,709.5 701.3,349.5 638.7,290.5 298.7,650.5\"/><polygon points=\"628.2,330.0 748.2,830.0 831.8,810.0 711.8,310.0\"/><rect x=\"300.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","W":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><polygon points=\"627.0,320.0 627.0,680.0 713.0,680.0 713.0,320.0\"/><polygon points=\"685.7,640.0 225.7,460.0 194.3,540.0 654.3,720.0\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"640.8\" y=\"650.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","X":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"197.5,221.1 657.5,361.1 682.5,278.9 222.5,138.9\"/><polygon points=\"634.2,343.9 754.2,523.9 825.8,476.1 705.8,296.1\"/><polygon points=\"365.8,656.1 245.8,476.1 174.2,523.9 294.2,703.9\"/><rect x=\"640.8\" y=\"290.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","Y":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"178.1,208.9 468.1,528.9 531.9,471.1 241.9,151.1\"/><polygon points=\"758.1,151.1 468.1,471.1 531.9,528.9 821.9,208.9\"/><polygon points=\"468.7,529.5 638.7,709.5 701.3,650.5 531.3,470.5\"/><rect x=\"470.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/></g></svg>","Z":"<svg viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"><g fill=\"currentColor\"><polygon points=\"466.9,122.6 176.9,472.6 243.1,527.4 533.1,177.4\"/><polygon points=\"189.2,537.6 769.2,857.6 810.8,782.4 230.8,462.4\"/><polygon points=\"833.0,820.0 833.0,180.0 747.0,180.0 747.0,820.0\"/><rect x=\"180.8\" y=\"470.8\" width=\"58.5\" height=\"58.5\"/><rect x=\"760.8\" y=\"790.8\" width=\"58.5\" height=\"58.5\"/></g></svg>"};
  const RA_KEYS=Object.keys(RA);
  const LATIN='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const controllers=new WeakMap();

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
.ra-ml-host{width:min(74vw,520px);display:grid;gap:12px;place-items:center;color:var(--accent,#d9c0a2);margin-inline:auto}
.ra-ml-text-stage{display:flex;align-items:center;justify-content:center;min-height:34px;width:100%}
.ra-ml-morph-line{display:flex;align-items:center;justify-content:center;gap:clamp(2px,.42vw,5px);min-height:30px;color:color-mix(in srgb,currentColor 84%,#fff 16%);filter:drop-shadow(0 0 5px color-mix(in srgb,currentColor 20%,transparent))}
.ra-ml-char{width:18px;height:26px;display:grid;place-items:center;flex:0 0 auto;font:500 16px/1 "Times New Roman",Times,serif;color:inherit;text-shadow:0 0 6px color-mix(in srgb,currentColor 18%,transparent)}
.ra-ml-char svg{width:100%;height:100%;display:block}
.ra-ml-space{width:10px;flex:0 0 auto}
.ra-ml-circuit{width:100%;height:auto;overflow:visible;filter:drop-shadow(0 0 7px color-mix(in srgb,currentColor 15%,transparent))}
.ra-ml-track{fill:none;stroke:color-mix(in srgb,currentColor 16%,transparent);stroke-width:1.7;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}
.ra-ml-track.ra-ml-main{stroke-width:2.2}
.ra-ml-flow{fill:none;stroke:currentColor;stroke-width:2.05;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;opacity:.80}
.ra-ml-flow.ra-ml-main{stroke-width:2.7}
.ra-ml-lit-group{clip-path:var(--ra-ml-lit-clip)}
.ra-ml-head-group{clip-path:var(--ra-ml-head-clip);filter:drop-shadow(0 0 6px currentColor)}
.ra-ml-head{fill:none;stroke:color-mix(in srgb,currentColor 70%,#fff 30%);stroke-width:2.9;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;opacity:.96}
.ra-ml-head-main{stroke-width:3.45}
.ra-ml-node{fill:currentColor;stroke:currentColor;stroke-width:1.1;filter:drop-shadow(0 0 4px currentColor)}
.ra-ml-lit-rect,.ra-ml-head-rect{transition:x .30s cubic-bezier(.2,.7,.2,1),width .30s cubic-bezier(.2,.7,.2,1)}
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
  .ra-ml-host{width:min(86vw,380px);gap:10px}
  .ra-ml-char{width:15px;height:22px;font-size:14px}
  .ra-ml-space{width:8px}
}
`;
    document.head.appendChild(s);
  }

  const circuit=`
<svg class="ra-ml-circuit" viewBox="0 0 760 168" aria-hidden="true">
  <defs>
    <clipPath class="ra-ml-lit-clip"><rect class="ra-ml-lit-rect" x="35" y="0" width="0" height="168"></rect></clipPath>
    <clipPath class="ra-ml-head-clip"><rect class="ra-ml-head-rect" x="35" y="0" width="0" height="168"></rect></clipPath>
  </defs>

  <g>
    <path class="ra-ml-track ra-ml-main" d="M55 84H705"/>

    <path class="ra-ml-track" d="M126 84L160 48H244L278 84"/>
    <path class="ra-ml-track" d="M198 84L232 120H316L350 84"/>
    <path class="ra-ml-track" d="M410 84L444 48H528L562 84"/>
    <path class="ra-ml-track" d="M482 84L516 120H600L634 84"/>

    <path class="ra-ml-track" d="M146 84L176 61H228L258 84"/>
    <path class="ra-ml-track" d="M216 84L246 107H298L328 84"/>
    <path class="ra-ml-track" d="M430 84L460 61H512L542 84"/>
    <path class="ra-ml-track" d="M500 84L530 107H582L612 84"/>

    <path class="ra-ml-track" d="M310 84L356 40L402 84L356 128Z"/>
    <path class="ra-ml-track" d="M298 84L356 28L414 84L356 140Z"/>
    <path class="ra-ml-track" d="M356 40V128M310 84H402"/>
    <path class="ra-ml-track" d="M332 56H380M332 112H380"/>
    <path class="ra-ml-track" d="M278 84H310M402 84H434"/>

    <circle class="ra-ml-track" cx="46" cy="84" r="9"></circle>
    <circle class="ra-ml-track" cx="714" cy="84" r="9"></circle>
  </g>

  <g class="ra-ml-lit-group">
    <path class="ra-ml-flow ra-ml-main" d="M55 84H705"/>

    <path class="ra-ml-flow" d="M126 84L160 48H244L278 84"/>
    <path class="ra-ml-flow" d="M198 84L232 120H316L350 84"/>
    <path class="ra-ml-flow" d="M410 84L444 48H528L562 84"/>
    <path class="ra-ml-flow" d="M482 84L516 120H600L634 84"/>

    <path class="ra-ml-flow" d="M146 84L176 61H228L258 84"/>
    <path class="ra-ml-flow" d="M216 84L246 107H298L328 84"/>
    <path class="ra-ml-flow" d="M430 84L460 61H512L542 84"/>
    <path class="ra-ml-flow" d="M500 84L530 107H582L612 84"/>

    <path class="ra-ml-flow" d="M310 84L356 40L402 84L356 128Z"/>
    <path class="ra-ml-flow" d="M298 84L356 28L414 84L356 140Z"/>
    <path class="ra-ml-flow" d="M356 40V128M310 84H402"/>
    <path class="ra-ml-flow" d="M332 56H380M332 112H380"/>
    <path class="ra-ml-flow" d="M278 84H310M402 84H434"/>

    <circle class="ra-ml-flow" cx="46" cy="84" r="9"></circle>
    <circle class="ra-ml-flow" cx="714" cy="84" r="9"></circle>

    <circle class="ra-ml-node" cx="126" cy="84" r="2.8"/>
    <circle class="ra-ml-node" cx="278" cy="84" r="2.8"/>
    <circle class="ra-ml-node" cx="198" cy="84" r="2.8"/>
    <circle class="ra-ml-node" cx="350" cy="84" r="2.8"/>
    <circle class="ra-ml-node" cx="410" cy="84" r="2.8"/>
    <circle class="ra-ml-node" cx="562" cy="84" r="2.8"/>
    <circle class="ra-ml-node" cx="482" cy="84" r="2.8"/>
    <circle class="ra-ml-node" cx="634" cy="84" r="2.8"/>
    <circle class="ra-ml-node" cx="356" cy="28" r="2.6"/>
    <circle class="ra-ml-node" cx="356" cy="140" r="2.6"/>
  </g>

  <g class="ra-ml-head-group">
    <path class="ra-ml-head ra-ml-head-main" d="M55 84H705"/>

    <path class="ra-ml-head" d="M126 84L160 48H244L278 84"/>
    <path class="ra-ml-head" d="M198 84L232 120H316L350 84"/>
    <path class="ra-ml-head" d="M410 84L444 48H528L562 84"/>
    <path class="ra-ml-head" d="M482 84L516 120H600L634 84"/>

    <path class="ra-ml-head" d="M146 84L176 61H228L258 84"/>
    <path class="ra-ml-head" d="M216 84L246 107H298L328 84"/>
    <path class="ra-ml-head" d="M430 84L460 61H512L542 84"/>
    <path class="ra-ml-head" d="M500 84L530 107H582L612 84"/>

    <path class="ra-ml-head" d="M310 84L356 40L402 84L356 128Z"/>
    <path class="ra-ml-head" d="M298 84L356 28L414 84L356 140Z"/>
    <path class="ra-ml-head" d="M356 40V128M310 84H402"/>
    <path class="ra-ml-head" d="M332 56H380M332 112H380"/>
    <path class="ra-ml-head" d="M278 84H310M402 84H434"/>
  </g>
</svg>`;

  function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
  function randomAlien(){return RA_KEYS[Math.floor(Math.random()*RA_KEYS.length)] || 'A';}
  function randomLatin(){return LATIN[Math.floor(Math.random()*LATIN.length)] || 'A';}

  function charHTML(ch,mode='alien',override=null){
    if(ch===' ')return '<span class="ra-ml-space"></span>';
    if(mode==='latin'){
      const shown=override ?? ch;
      return '<span class="ra-ml-char">'+String(shown)+'</span>';
    }
    const key=String(override ?? ch).toUpperCase();
    return '<span class="ra-ml-char">'+(RA[key]||'')+'</span>';
  }

  function mount(host,opts={}){
    ensureStyle();
    if(!host)return null;
    if(controllers.has(host))return controllers.get(host);

    const label=opts.label||'Now Loading';
    host.classList.add('ra-ml-host');
    host.setAttribute('role','status');
    host.setAttribute('aria-live','polite');
    host.setAttribute('aria-label',label);
    host.innerHTML=`
      <div class="ra-ml-text-stage"><div class="ra-ml-morph-line" aria-hidden="true"></div></div>
      ${circuit}`;

    const svg=host.querySelector('.ra-ml-circuit');
    const litClip=svg?.querySelector('.ra-ml-lit-clip');
    const litRect=svg?.querySelector('.ra-ml-lit-rect');
    const headClip=svg?.querySelector('.ra-ml-head-clip');
    const headRect=svg?.querySelector('.ra-ml-head-rect');
    const litGroup=svg?.querySelector('.ra-ml-lit-group');
    const headGroup=svg?.querySelector('.ra-ml-head-group');
    const morphLine=host.querySelector('.ra-ml-morph-line');

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
    let timer=null;
    let active=false;
    let morphToken=0;

    function renderText(text,modes,overrides={}){
      if(!morphLine)return;
      const chars=[...String(text||'')];
      morphLine.innerHTML=chars.map((ch,i)=>charHTML(ch,modes[i]||'alien',overrides[i])).join('');
    }

    async function settleChar(text,index,targetMode,modes,token,direction){
      const chars=[...text];
      if(chars[index]===' '){
        modes[index]='latin';
        renderText(text,modes);
        return;
      }

      const overrides={};
      for(let step=0;step<3;step++){
        if(token!==morphToken)return;
        overrides[index]=direction==='toLatin'?randomAlien():randomLatin();
        const temp=[...modes];
        temp[index]=direction==='toLatin'?'alien':'latin';
        renderText(text,temp,overrides);
        await wait(46);
      }
      for(let step=0;step<3;step++){
        if(token!==morphToken)return;
        overrides[index]=direction==='toLatin'?randomLatin():randomAlien();
        const temp=[...modes];
        temp[index]=targetMode;
        renderText(text,temp,overrides);
        await wait(48);
      }

      if(token!==morphToken)return;
      modes[index]=targetMode;
      renderText(text,modes);
      await wait(44);
    }

    async function morphLoadingLoop(){
      const token=++morphToken;
      const text=label;
      const chars=[...text];
      const modes=chars.map(ch=>ch===' '?'latin':'alien');
      renderText(text,modes);

      while(token===morphToken){
        // Alien -> English, one character at a time.
        for(let i=0;i<chars.length;i++){
          if(token!==morphToken)return;
          await settleChar(text,i,'latin',modes,token,'toLatin');
        }
        if(token!==morphToken)return;
        await wait(850);

        // English -> alien, one character at a time.
        for(let i=0;i<chars.length;i++){
          if(token!==morphToken)return;
          await settleChar(text,i,'alien',modes,token,'toAlien');
        }
        if(token!==morphToken)return;
        await wait(850);
      }
    }

    function stopMorph(){morphToken++;}

    async function revealReady(){
      stopMorph();
      const token=++morphToken;
      const text='Ready';
      const modes=[...text].map(()=> 'alien');
      renderText(text,modes);
      for(let i=0;i<text.length;i++){
        if(token!==morphToken)return;
        await settleChar(text,i,'latin',modes,token,'toLatin');
      }
    }

    function showLatin(text){
      stopMorph();
      renderText(text,[...String(text)].map(()=> 'latin'));
    }

    function render(p){
      progress=Math.max(0,Math.min(100,Number(p)||0));
      const left=35;
      const right=725;
      const span=right-left;
      const frontier=left+span*(progress/100);

      if(litRect){
        litRect.setAttribute('x',String(left));
        litRect.setAttribute('width',String(Math.max(0,frontier-left)));
      }
      if(headRect){
        const headWidth=50;
        const hx=Math.max(left,frontier-headWidth);
        headRect.setAttribute('x',String(hx));
        headRect.setAttribute('width',String(Math.max(0,Math.min(headWidth,frontier-left))));
      }

      host.setAttribute('aria-label',progress>=100?'Ready':label);
      host.classList.toggle('ready',progress>=100);
    }

    function stop(){
      if(timer)clearInterval(timer);
      timer=null;
      active=false;
    }

    function start(){
      if(active)return;
      stop();
      active=true;
      host.classList.remove('ready','error');
      morphLoadingLoop();
      progress=Math.min(progress||4,10);
      render(progress);
      timer=setInterval(()=>{
        if(progress>=88){stop();return;}
        const gain=Math.max(.45,(89-progress)*.052);
        render(Math.min(88,progress+gain));
      },150);
    }

    function setProgress(p){
      stop();
      host.classList.remove('error');
      render(p);
    }

    async function complete(){
      stop();
      host.classList.remove('error');

      // Finish the visual circuit even if the real load completed first.
      for(const step of [
        {p:36,hold:150},
        {p:66,hold:180},
        {p:92,hold:220},
        {p:100,hold:260}
      ]){
        if(progress<step.p){
          render(step.p);
          await wait(step.hold);
        }
      }

      // "Ready" is itself decoded one character at a time.
      await revealReady();

      // Keep the finished state visible long enough to read.
      await wait(3000);
    }

    function error(){
      stop();
      showLatin('Load Error');
      host.classList.add('error');
      render(Math.max(progress,64));
    }

    const controller={host,start,setProgress,complete,error,stop,get progress(){return progress;}};
    controllers.set(host,controller);
    if(opts.auto!==false)start(); else render(0);
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
    if(c)c.setProgress(p);
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
    return `<span class="ra-ml-mini-host" aria-label="Loading">
      <svg viewBox="0 0 100 28" aria-hidden="true">
        <path class="ra-ml-mini-track" d="M3 14H97M20 14L30 5H50L60 14M42 14L52 23H74L84 14"/>
        <path class="ra-ml-mini-flow" pathLength="100" d="M3 14H97"/>
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

  window.RAMagicLoader={mount,startWrap,phaseWrap,completeWrap,errorWrap,ensureFrame};
})();