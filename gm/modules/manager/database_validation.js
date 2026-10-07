function parsePriceRecipeMaterials(text=''){
  return String(text||'').split(/[,、\n]+/).map(part=>String(part||'').trim()).filter(Boolean).map(part=>{
    const m=part.match(/^(.*?)×\s*(\d+)$/);
    return m ? {name:String(m[1]||'').trim(), count:Number(m[2])||1} : {name:part, count:1};
  });
}
function assertItemPriceRows(rows=[], recipesForValidation=null){
  const invalid=[];
  const mergedItems=new Map();
  for(const item of (state.items||[])) mergedItems.set(String(item.name||'').trim(), item);
  for(const item of (rows||[])) mergedItems.set(String(item.name||'').trim(), item);
  const recipes=(recipesForValidation||state.recipes||[]);
  const craftRecipeByResult=new Map();
  for(const item of mergedItems.values()){
    const resultName=String(item?.name||'').trim();
    if(resultName && String(item?.materialType||'').trim()==='加工素材' && String(item?.processingRequiredMaterials||'').trim()){
      craftRecipeByResult.set(resultName,{
        craftSkill:String(item?.processingSkill||'').trim(),
        resultItem:resultName,
        requiredMaterials:item.processingRequiredMaterials,
        price:item.processingFee,
        resultCount:item.processingResultCount||1
      });
    }
  }
  for(const recipe of recipes){
    const skill=String(recipe?.craftSkill||'').trim();
    const resultName=String(recipe?.resultItem||'').trim();
    if(resultName && (skill==='細工' || skill==='調合' || skill==='設計')) craftRecipeByResult.set(resultName,recipe);
  }
  const sellOf=(name)=>{
    const item=mergedItems.get(String(name||'').trim());
    if(!item) return null;
    const raw=String(item.sellPrice ?? '').trim();
    if(!raw) return null;
    const value=Number(raw);
    return Number.isInteger(value) && value>=0 ? value : null;
  };
  const buyOf=(name)=>{
    const item=mergedItems.get(String(name||'').trim());
    if(!item) return null;
    const raw=String(item.buyPrice ?? '').trim();
    if(!raw) return null;
    const value=Number(raw);
    return Number.isInteger(value) && value>=1 ? value : null;
  };
  const craftTargetMemo=new Map();
  const craftTargetVisiting=new Set();
  const craftTargetFor=(resultName)=>{
    const name=String(resultName||'').trim();
    if(craftTargetMemo.has(name)) return craftTargetMemo.get(name);
    const recipe=craftRecipeByResult.get(name);
    if(!recipe) return null;
    if(craftTargetVisiting.has(name)) throw new Error(`価格計算のレシピ依存が循環しています：${name}`);
    craftTargetVisiting.add(name);
    let materialSellTotal=0;
    let materialBuyTotal=0;
    let allMaterialsBuyable=true;
    for(const req of parsePriceRecipeMaterials(recipe.requiredMaterials)){
      if(!mergedItems.has(req.name)) throw new Error(`${name}：必要素材「${req.name}」がItemsにありません`);
      const nested=craftRecipeByResult.has(req.name) ? craftTargetFor(req.name) : null;
      const sv=nested ? nested.target : sellOf(req.name);
      if(sv===null) throw new Error(`${name}：必要素材「${req.name}」の売値が不正です`);
      materialSellTotal += sv * req.count;
      const bv=buyOf(req.name);
      if(bv===null) allMaterialsBuyable=false;
      else materialBuyTotal += bv * req.count;
    }
    const feeRaw=String(recipe.price??'').trim();
    const fee=Number(feeRaw);
    if(!feeRaw || !Number.isInteger(fee) || fee<0) throw new Error(`${name}：施設依頼費(price)は0以上の整数で設定してください`);
    const resultCount=Math.max(1,Number(recipe.resultCount)||1);
    let target=Math.floor((materialSellTotal + fee*0.5) / resultCount);
    const caps=[];
    const resultRow=mergedItems.get(name);
    if(!resultRow) throw new Error(`${name}：完成品がItemsにありません`);
    const resultBuy=buyOf(name);
    if(resultBuy!==null){
      const cap=Math.floor(resultBuy*0.8);
      if(target>cap){ target=cap; caps.push(`完成品買値80%上限${cap}G`); }
    }
    if(allMaterialsBuyable){
      const cap=Math.floor((materialBuyTotal-1)/resultCount);
      if(target>cap){ target=cap; caps.push(`購入素材転売防止上限${cap}G`); }
    }
    target=Math.max(1,target);
    const out={target,materialSellTotal,fee,resultCount,allMaterialsBuyable,materialBuyTotal,caps};
    craftTargetMemo.set(name,out);
    craftTargetVisiting.delete(name);
    return out;
  };
  for(const resultName of craftRecipeByResult.keys()){
    try{ craftTargetFor(resultName); }
    catch(err){ invalid.push(`・${resultName}：${String(err&&err.message||err)}`); }
  }
  const branchResults=new Set(recipes.filter(r=>String(r.craftType||'').trim()==='武器派生').map(r=>String(r.resultItem||'').trim()).filter(Boolean));
  const shopSourcePattern=/(?:^|[\/／,、\s])(?:鍛冶屋|薬屋|骨董屋)(?=$|[（(\/／,、\s])/u;
  const requiresBuy=(row)=>{const name=String(row.name||'').trim();const tags=[row.tags,row.usageTags].map(v=>String(v||'')).join(' ');const source=String(row.source||'');return branchResults.has(name)||tags.includes('常設販売')||shopSourcePattern.test(source);};
  const canSellZero=(row)=>{const text=[row.name,row.itemType,row.tags,row.usageTags].map(v=>String(v||'')).join(' ');return /売却不可|システム|重要アイテム|素手|共鳴片/u.test(text);};
  for(const row of rows || []){
    const name=String(row.name || row.id || '名称未設定');
    const sellRaw=String(row.sellPrice ?? '').trim();
    if(!sellRaw){ invalid.push(`・${name}：売値が未設定`); continue; }
    const sell=Number(sellRaw);
    if(!Number.isInteger(sell) || sell<0){ invalid.push(`・${name}：売値は0以上の整数で設定してください`); continue; }
    if(sell===0 && !canSellZero(row)){ invalid.push(`・${name}：売却可能品の売値は1G以上にしてください。0Gは売却不可のシステム定義だけです`); continue; }
    const buyRaw=String(row.buyPrice ?? '').trim();
    if(!buyRaw){ if(requiresBuy(row)) invalid.push(`・${name}：店頭販売品・武器派生完成品には買値が必要です`); }
    else{
      const buy=Number(buyRaw);
      if(!Number.isInteger(buy) || buy<1){ invalid.push(`・${name}：買値は1以上の整数で設定してください`); continue; }
      if(buy<=sell){ invalid.push(`・${name}：買値${buy}Gは売値${sell}Gより高く設定してください`); continue; }
      if(buy-sell<2){ invalid.push(`・${name}：買値と売値を1G差だけにしないでください`); continue; }
    }
    const craftTarget=craftTargetMemo.get(String(row.name||'').trim());
    if(craftTarget){
      if(sell!==craftTarget.target){
        const capText=craftTarget.caps.length?` / ${craftTarget.caps.join(' / ')}`:'';
        invalid.push(`・${name}：自作品売値は${craftTarget.target}Gにしてください（素材売値合計${craftTarget.materialSellTotal}G＋施設依頼費${craftTarget.fee}Gの50%を完成数${craftTarget.resultCount}で割り、端数切り捨て${capText}）`);
      }
      continue;
    }
    if(buyRaw){
      const normalCap=Math.floor(Number(buyRaw)*0.8);
      if(sell>normalCap) invalid.push(`・${name}：売値${sell}Gが通常上限${normalCap}Gを超えています（買値の80%以下）`);
    }
  }
  if(invalid.length) throw new Error(`価格設定に不整合があります。加工素材および調合・細工・設計の自作品は「素材売値合計＋施設依頼費の50%」を基準に完成数で割り、1G未満を切り捨てます。店頭販売品は買値の80%以下、全素材を店頭購入できる場合は完成品売却総額を素材購入総額未満にします。\n${invalid.slice(0,15).join('\n')}${invalid.length>15?`\nほか${invalid.length-15}件`:''}`);
}
function assertItemClassificationRows(rows=[]){
  const invalid=[];
  for(const row of rows || []){
    const name=String(row.name || row.id || '名称未設定');
    const dataKind=String(row.dataKind || 'アイテム').trim() || 'アイテム';
    const itemType=String(row.itemType || '').trim();
    const materialType=String(row.materialType || '').trim();
    if(dataKind==='素材'){
      if(!materialType) invalid.push(`・${name}：素材種別が未設定`);
      if(itemType) invalid.push(`・${name}：素材なのにアイテム種別「${itemType}」が設定されています`);
    }else{
      if(!itemType) invalid.push(`・${name}：アイテム種別が未設定`);
      if(materialType) invalid.push(`・${name}：アイテムなのに素材種別「${materialType}」が設定されています`);
    }
  }
  if(invalid.length) throw new Error(`アイテム／素材の分類に不整合があります。\n${invalid.slice(0,15).join('\n')}${invalid.length>15?`\nほか${invalid.length-15}件`:''}`);
}
function assertWeaponKatakanaNames(rows=[]){
  const invalid=(rows || []).filter(row=>String(row.dataKind || 'アイテム').trim()!=='素材' && String(row.itemType || '').trim()==='武器').filter(row=>{
    const name=String(row.name || '').trim();
    return name!=='素手' && !/^[ァ-ヶー]+$/.test(name);
  });
  if(!invalid.length) return;
  const details=invalid.slice(0,15).map(row=>`・${String(row.name || row.id || '名称未設定')}`).join('\n');
  throw new Error(`武器名は「素手」を除き、記号を含まないカタカナ名で登録してください。\n${details}${invalid.length>15?`\nほか${invalid.length-15}件`:''}`);
}
function recommendedEquipmentUpgradeSlotCost(row={}){
  const effect=String(row.equipmentUpgradeEffect||'').trim();
  const id=String(row.id||'').trim();
  // 3枠は、現行データで「強力な複合効果／ボス・二つ名固有効果」として明示設計した素材だけ。
  // 通常強化名を持つ素材は、ボス素材であっても通常強化の枠数（1/2枠）を優先する。
  const strongSpecialIds=new Set([
    'mat_dolgan_ley_core','mat_glaboros_mire_gland','mat_nereive_reflection_fin','mat_dolgan_magic_crystal_horn','mat_vein_salamander_core',
    'mat_named_17','mat_named_18','mat_named_19','mat_named_20','mat_named_21','mat_named_23','mat_named_24','mat_named_27','mat_named_28','mat_named_29','mat_named_33','mat_named_38'
  ]);
  if(['威力強化','命中強化','防御行動強化','回避強化','抵抗強化','副手追撃強化','回復量強化','最大スタック拡張','HP強化','MP強化'].includes(effect))return 1;
  if(['威力固定強化','回復量固定強化','防御強化','術式枠拡張','術式省力化','力業補助','魔法補助','祈祷補助','水属性軽減','水耐性付与','光耐性付与','風属性強化','風属性軽減','風属性増幅','魔力循環','風歌省力'].includes(effect))return 2;
  if(strongSpecialIds.has(id))return 3;
  return 2;
}
function assertNoDefenseIgnoreUpgradeRows(rows=[]){
  const invalid=(rows||[]).filter(row=>String(row.dataKind||'').trim()==='素材'&&String(row.materialType||'').trim()==='魔物素材').filter(row=>{
    const effect=String(row.equipmentUpgradeEffect||'').trim();
    const detail=String(row.equipmentUpgradeDetail||'').trim();
    return ['防御貫通','装甲貫通','雷脈貫通','天雷貫通','防御無視'].includes(effect)||effect.includes('防御値無視')||/防御貫通|装甲貫通|防御(?:値)?(?:を|の).*無視/.test(detail);
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(row=>`・${String(row.name||row.id||'名称未設定')}`).join('\n');
  throw new Error(`装備強化では防御貫通・装甲貫通・防御値無視を使用できません。安定したダメージ補正には「威力固定強化」を使用してください。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function assertMaterialUpgradeSlotCostRows(rows=[]){
  const invalid=[];
  (rows||[]).filter(row=>String(row.dataKind||'').trim()==='素材'&&String(row.materialType||'').trim()==='魔物素材'&&String(row.equipmentUpgradeEffect||'').trim()).forEach(row=>{
    const effect=String(row.equipmentUpgradeEffect||'').trim(), cost=Number(row.equipmentUpgradeSlotCost||0), recommended=recommendedEquipmentUpgradeSlotCost(row);
    if(![1,2,3].includes(cost)){invalid.push({row,message:'1～3枠で設定してください'});return;}
    if(['威力固定強化','回復量固定強化'].includes(effect)&&cost<2){invalid.push({row,message:'最低2枠に設定してください'});return;}
    if(cost!==recommended)invalid.push({row,message:`${recommended}枠に設定してください`});
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.row.name||x.row.id||'名称未設定')}：${x.message}`).join('\n');
  throw new Error(`装備強化の消費枠が効果の強さと一致していません。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function monsterMaterialUpgradeMissingFields(row={}){
  const isMonsterMaterial = String(row.dataKind || '').trim()==='素材' && String(row.materialType || '').trim()==='魔物素材';
  if(!isMonsterMaterial) return [];
  const missing=[];
  const effect=String(row.equipmentUpgradeEffect || '').trim();
  if(!effect || effect==='なし') missing.push('装備強化内容');
  if(!String(row.equipmentUpgradeDetail || '').trim()) missing.push('効果説明');
  if(!String(row.equipmentUpgradeTarget || '').trim()) missing.push('強化対象');
  return missing;
}
function assertMonsterMaterialUpgradeRows(rows=[]){
  const invalid=(rows || []).map(row=>({row,missing:monsterMaterialUpgradeMissingFields(row)})).filter(x=>x.missing.length);
  if(!invalid.length) return;
  const details=invalid.slice(0,10).map(x=>`・${String(x.row.name || x.row.id || '名称未設定')}：${x.missing.join('・')}`).join('\n');
  const rest=invalid.length>10 ? `\nほか${invalid.length-10}件` : '';
  throw new Error(`魔物素材には装備強化内容・効果説明・強化対象の設定が必須です。\n${details}${rest}`);
}
function isStandardEquipmentUpgradeEffectName(effect=''){
  return ['威力強化','威力固定強化','命中強化','防御強化','防御行動強化','回避強化','抵抗強化','副手追撃強化','術式枠拡張','術式省力化','回復量強化','回復量固定強化','最大スタック拡張','HP強化','MP強化','力業補助','魔法補助','祈祷補助'].includes(String(effect||'').trim());
}
function assertSpecialUpgradeNonStackRows(rows=[]){
  const invalid=(rows||[]).filter(row=>{
    const isMonsterMaterial=String(row.dataKind||'').trim()==='素材'&&String(row.materialType||'').trim()==='魔物素材';
    const effect=String(row.equipmentUpgradeEffect||'').trim();
    if(!isMonsterMaterial||!effect||isStandardEquipmentUpgradeEffectName(effect))return false;
    return !/同名(?:の特殊)?効果は重複しない。?/.test(String(row.equipmentUpgradeDetail||'').trim());
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(row=>`・${String(row.name||row.id||'名称未設定')}：${String(row.equipmentUpgradeEffect||'特殊効果')}`).join('\n');
  throw new Error(`素材固有の特殊効果には「同名効果は重複しない。」を効果説明へ明記してください。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function materialEffectContainsUpgradeText(row={}){
  if(String(row.dataKind || '').trim()!=='素材') return false;
  const text=String(row.effect || '').trim();
  if(!text) return false;
  return /強化(?:に使うと|に使用すると|に使用した|に使用できる|素材になる)/.test(text);
}
function nonMonsterMaterialUpgradeFields(row={}){
  const isMaterial=String(row.dataKind || '').trim()==='素材';
  const isMonster=String(row.materialType || '').trim()==='魔物素材';
  if(!isMaterial || isMonster) return [];
  return ['equipmentUpgradeEffect','equipmentUpgradeSlotCost','equipmentUpgradeDetail','equipmentUpgradeTarget']
    .filter(field=>String(row[field] || '').trim());
}
function assertMaterialUpgradeSeparationRows(rows=[]){
  const effectInvalid=(rows || []).filter(materialEffectContainsUpgradeText);
  const metadataInvalid=(rows || []).map(row=>({row,fields:nonMonsterMaterialUpgradeFields(row)})).filter(x=>x.fields.length);
  if(!effectInvalid.length && !metadataInvalid.length) return;
  const details=[];
  effectInvalid.slice(0,10).forEach(row=>details.push(`・${String(row.name || row.id || '名称未設定')}：一般の「効果」欄に装備強化内容が記載されています`));
  metadataInvalid.slice(0,10).forEach(x=>details.push(`・${String(x.row.name || x.row.id || '名称未設定')}：魔物素材ではないため装備強化項目を設定できません`));
  const count=effectInvalid.length+metadataInvalid.length;
  throw new Error(`素材の一般効果と装備強化データを分けてください。魔物素材の強化内容は専用項目だけに設定し、採取素材・加工素材・特殊素材には設定しません。\n${details.join('\n')}${count>20?`\nほか${count-20}件`:''}`);
}
function isUniqueMonsterMaterialRow(row={}){
  const tags=String(row.tags || '').split(/[,、，]/).map(v=>v.trim()).filter(Boolean);
  return tags.includes('固有素材') || tags.includes('ボス素材') || tags.includes('ボス');
}
function monsterProperNamesInMaterialDescription(row={}){
  const isMonsterMaterial=String(row.dataKind || '').trim()==='素材' && String(row.materialType || '').trim()==='魔物素材';
  if(!isMonsterMaterial || isUniqueMonsterMaterialRow(row)) return [];
  const description=String(row.description || '').trim();
  if(!description) return [];
  return [...new Set((state.monsters || [])
    .map(monster=>String(monster.name || '').trim())
    .filter(name=>name && description.includes(name)))];
}
function assertMonsterMaterialDescriptionRows(rows=[]){
  const invalid=(rows || []).map(row=>({row,names:monsterProperNamesInMaterialDescription(row)})).filter(x=>x.names.length);
  if(!invalid.length) return;
  const details=invalid.slice(0,10).map(x=>`・${String(x.row.name || x.row.id || '名称未設定')}：${x.names.join('、')}`).join('\n');
  const rest=invalid.length>10 ? `\nほか${invalid.length-10}件` : '';
  throw new Error(`固有素材・ボス素材以外の魔物素材説明には、魔物の固有名を記載しないでください。種族や性質による一般表現へ置き換えてください。\n${details}${rest}`);
}
function monsterMaterialBandByAreaName(areaName=''){
  const bands={
    '街はずれの草原':[1,1],
    '近郊の森':[1,2],
    '水辺の湿地':[2,2],
    '山麓の旧鉱山':[3,3],
    '反照の水庭':[3,4],
    '風渡りの高原':[3,4],
    '灰冠の火山峡谷':[4,4]
  };
  return bands[String(areaName||'').trim()]||null;
}
function monsterMaterialAllowedRanks(row={}){
  const rowId=String(row.id||'').trim(),rowName=String(row.name||'').trim();
  if(!rowId&&!rowName)return null;
  const areaByMonster=new Map();
  (state.exploration_areas||[]).forEach(area=>{
    const names=String(area.mainMonsters||'').split(/[、,，\n]+/).map(v=>v.trim()).filter(Boolean);
    names.forEach(name=>{if(!areaByMonster.has(name))areaByMonster.set(name,area);});
  });
  let intersection=null;
  for(const monster of state.monsters||[]){
    const traits=String(monster.monsterTraits||'').split(/[,、，]/).map(v=>v.trim()).filter(Boolean);
    const isBoss=traits.includes('ボス'),isNamed=traits.includes('二つ名')||String(monster.id||'').startsWith('mon_named_');
    if(isBoss||isNamed)continue;
    const hit=parseMonsterDrops(monster.drops||'').find(d=>String(d.itemId||'').trim()===rowId||String(d.itemName||'').trim()===rowName);
    if(!hit)continue;
    const area=areaByMonster.get(String(monster.name||'').trim());
    const band=monsterMaterialBandByAreaName(area&&area.name);
    if(!band)continue;
    const [low,high]=band;
    const rate=Number(String(hit.rate||'').replace('%','').trim());
    if(!Number.isFinite(rate))continue;
    const isStrong=traits.includes('強敵');
    let allowed;
    if(low===high){
      allowed=new Set([rate===20?low+1:low]);
    }else if(isStrong){
      allowed=new Set([low,high,high+1]);
    }else{
      allowed=new Set([rate===20?high:low]);
    }
    intersection=intersection===null?allowed:new Set([...intersection].filter(v=>allowed.has(v)));
  }
  return intersection;
}
function assertLateAreaMonsterMaterialRankRows(rows=[]){
  const invalid=[];
  for(const row of rows||[]){
    if(String(row.dataKind||'').trim()!=='素材'||String(row.materialType||'').trim()!=='魔物素材')continue;
    const allowed=monsterMaterialAllowedRanks(row);if(!allowed||!allowed.size)continue;
    const actual=numericRankValueIncludingLegacyMaterialGrade(row.rank,'');
    if(!allowed.has(actual))invalid.push({row,allowed:[...allowed].sort((a,b)=>a-b),actual});
  }
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.row.name||x.row.id||'名称未設定')}：★${x.actual||'?'}（許可：${x.allowed.map(v=>'★'+v).join(' / ')}）`).join('\n');
  throw new Error(`魔物素材の★が現行エリア帯ルールと一致していません。単一帯★xは通常素材★x・20%固有素材★x+1、幅帯★x～★yは通常魔物の通常素材★x・20%固有素材★y、強敵枠のみ★x/★y/★(y+1)を使用できます。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function assertMonsterEffectClarityRows(rows=[]){
  const errors=[];
  (rows||[]).forEach(row=>{
    const parts=[{name:'固有パッシブ',effect:row.passiveEffect||''},...parseMonsterActions(row.actions||'')];
    parts.forEach(part=>RAMonsterRules.validateText(part.effect||'').forEach(error=>errors.push(`${row.name||row.id}／${part.name}：${error}`)));
  });
  if(errors.length)throw new Error(errors.slice(0,12).join('\n'));
}
function assertMonsterActionBaseValueRows(rows=[]){
  const invalid=[];
  (rows||[]).forEach(monster=>{
    parseMonsterActions(monster.actions||'').forEach(action=>{
      const check=String(action.checkType||'').trim();
      if(!check || check==='なし') return;
      const n=Number(action.baseValue);
      if(!Number.isInteger(n) || n < 0) invalid.push({monster,action});
    });
  });
  if(!invalid.length) return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.monster.name||x.monster.id||'名称未設定')}／${String(x.action.name||'行動名未設定')}`).join('\n');
  throw new Error(`魔物行動の基礎技能値は0以上の整数で設定してください。妨害・バフ等の変動値は基礎技能値へ埋め込まず、{補正}として戦闘中に加算します。\n${details}`);
}
function assertMonsterActionCheckSourceRows(rows=[]){
  const invalid=[];
  (rows||[]).forEach(monster=>{
    parseMonsterActions(monster.actions||'').forEach(action=>{
      const check=String(action.checkType||'').trim();
      if(!check || check==='なし') return;
      const parsed=parseCheckType(check);
      if(parsed.left!=='技能値') invalid.push({monster,action,check});
    });
  });
  if(!invalid.length) return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.monster.name||x.monster.id||'名称未設定')}／${String(x.action.name||'行動名未設定')}：${x.check}`).join('\n');
  throw new Error(`魔物の判定欄は「技能値>=回避値」「技能値>=抵抗値」「技能値>=固定達成値」で登録し、行動ごとの基礎技能値を設定してください。\n${details}`);
}
function assertMonsterSupportActionCheckRows(rows=[]){
  const invalid=[];
  (rows||[]).forEach(monster=>{
    parseMonsterActions(monster.actions||'').forEach(action=>{
      const type=normalizeMonsterActionType(action);
      if(!['防御','補助','回復'].includes(type)) return;
      const parsed=parseCheckType(action.checkType||'');
      const right=String(parsed.right||'').trim();
      const fixed=Number(right);
      if(parsed.left!=='技能値' || !Number.isFinite(fixed)) invalid.push({monster,action});
    });
  });
  if(!invalid.length) return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.monster.name||x.monster.id||'名称未設定')}／${String(x.action.name||'行動名未設定')}`).join('\n');
  throw new Error(`魔物の防御・補助・回復行動は「技能値>=固定達成値」の判定と行動ごとの基礎技能値を設定してください。\n${details}`);
}
function isValidBaseDamageFormula(value=''){
  const power=String(value||'').trim().replace(/\s+/g,'');
  const formula=/^(\d+)D6(?:\+(\d+)D([2-5]))?(?:\+(\d+))?$/i;
  const match=power.match(formula);
  if(!match)return false;
  const x=Number(match[1]||0), y=Number(match[2]||0);
  return x>=1 && y<=x;
}
function assertWeaponBaseDamageDieRows(rows=[]){
  const invalid=[];
  (rows||[]).forEach(item=>{
    if(String(item.dataKind||'アイテム').trim()==='素材')return;
    if(String(item.itemType||'').trim()!=='武器')return;
    if(String(item.name||'').trim()==='素手' || String(item.itemCategory||'').trim()==='素手')return;
    const power=String(item.power||'').trim();
    if(!power)return; // 魔導書・祈祷書など基礎武器ダメージを持たない武器は対象外。
    if(!isValidBaseDamageFormula(power))invalid.push({item,power});
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.item.name||x.item.id||'名称未設定')}：${x.power}`).join('\n');
  throw new Error(`武器の基礎ダメージ式はD6を必ず含め、最大構成を「xD6+yD2～D5+z」としてください。補助ダイス個数yはD6個数x以下（y <= x）、固定値zは0以上です。条件成立時に別途加算される追加ダメージはこの式制限から除外します。素手は武器データ上の例外です。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function assertMonsterDirectDamageDieRows(rows=[]){
  const invalid=[];
  const damageTypes=new Set(['近接攻撃','遠距離攻撃']);
  (rows||[]).forEach(monster=>{
    parseMonsterActions(monster.actions||'').forEach(action=>{
      const type=normalizeMonsterActionType(action);
      if(!damageTypes.has(type))return;
      const power=String(action.power||'').trim();
      if(!power || power==='なし')return;
      if(!isValidBaseDamageFormula(power))invalid.push({monster,action,power});
      // 条件付き追加ダメージは基礎ダメージ式の制限から除外する。
    });
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.monster.name||x.monster.id||'名称未設定')}／${String(x.action.name||'行動名未設定')}：${x.power}`).join('\n');
  throw new Error(`魔物の基礎直接ダメージ式はD6を必ず含め、最大構成を「xD6+yD2～D5+z」としてください。補助ダイス個数yはD6個数x以下（y <= x）、固定値zは0以上です。条件成立時に別途加算される追加ダメージと毒などの継続ダメージはこの式制限から除外します。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function monsterFixedActionNames(row={}){
  return [...new Set(String(row.fixedActionNames||'').split(/[,、，\n]+/).map(v=>v.trim()).filter(Boolean))];
}
function monsterPassiveOnlyActionNames(row={}){
  return [...new Set(String(row.passiveOnlyActionNames||'').split(/[,、，\n]+/).map(v=>v.trim()).filter(Boolean))];
}
function assertMonsterFixedActionSelectionRows(rows=[]){
  const invalid=[];
  (rows||[]).forEach(row=>{
    const traits=String(row.monsterTraits||'').split(/[,、，]/).map(v=>v.trim());
    const isBoss=traits.includes('ボス'),isNamed=traits.includes('二つ名')||String(row.id||'').startsWith('mon_named_');
    const fixed=monsterFixedActionNames(row),actionCount=parseMonsterActions(row.actions||'').length;
    if(isBoss&&fixed.length){invalid.push({row,reason:'ボスは4技固定のため固定選出技は設定しません'});return;}
    if(isNamed&&actionCount<=4&&fixed.length){invalid.push({row,reason:'全行動を使用する二つ名には固定選出技を設定しません。5技以上の候補制二つ名だけ指定できます'});return;}
    const maxFixed=isNamed?3:2;
    if(fixed.length>maxFixed){invalid.push({row,reason:`固定選出技は最大${maxFixed}個です（${fixed.length}個）`});return;}
    const actionNames=new Set(parseMonsterActions(row.actions||'').map(a=>String(a.name||'').trim()).filter(Boolean));
    const missing=fixed.filter(name=>!actionNames.has(name));
    if(missing.length)invalid.push({row,reason:`行動プールに存在しない固定技：${missing.join('、')}`});
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.row.name||x.row.id||'名称未設定')}：${x.reason}`).join('\n');
  throw new Error(`固定選出技の設定を確認してください。固定枠は戦闘コンセプトの成立に必要な行動だけに限定し、通常魔物は0～2技、5技以上の候補制二つ名は0～3技まで指定できます。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function assertMonsterPassiveOnlyActionRows(rows=[]){
  const invalid=[];
  (rows||[]).forEach(row=>{
    const actionNames=new Set(parseMonsterActions(row.actions||'').map(a=>String(a.name||'').trim()).filter(Boolean));
    const passiveOnly=monsterPassiveOnlyActionNames(row),fixed=new Set(monsterFixedActionNames(row));
    const missing=passiveOnly.filter(name=>!actionNames.has(name));
    const overlap=passiveOnly.filter(name=>fixed.has(name));
    if(missing.length)invalid.push({row,reason:`行動プールに存在しないパッシブ専用技：${missing.join('、')}`});
    if(overlap.length)invalid.push({row,reason:`固定選出技とパッシブ専用技が重複：${overlap.join('、')}`});
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.row.name||x.row.id||'名称未設定')}：${x.reason}`).join('\n');
  throw new Error(`パッシブ専用技の設定を確認してください。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function monsterLoadoutReferencedNames(text='',actionNames=new Set()){
  const refs=[];
  for(const match of String(text||'').matchAll(/[《「]([^》」]+)[》」]/g)){
    const name=String(match[1]||'').trim();
    if(name&&actionNames.has(name)&&!refs.includes(name))refs.push(name);
  }
  return refs;
}
function monsterLoadoutCombinations(actions=[],count=3){
  const out=[],pick=[];
  function walk(start){
    if(pick.length===count){out.push(pick.slice());return;}
    for(let i=start;i<actions.length;i++){pick.push(actions[i]);walk(i+1);pick.pop();}
  }
  if(count>0&&actions.length>=count)walk(0);
  return out;
}
function monsterLoadoutActionIsDirectDamage(action={}){
  const type=normalizeMonsterActionType(action),power=String(action.power||'').trim();
  return ['近接攻撃','遠距離攻撃'].includes(type)&&!!power&&power!=='なし'&&power!=='-';
}
function monsterLegalLoadouts(row={}){
  const fullPool=parseMonsterActions(row.actions||'');
  const passiveOnly=new Set(monsterPassiveOnlyActionNames(row));
  const pool=fullPool.filter(a=>!passiveOnly.has(String(a.name||'').trim()));
  const traits=String(row.monsterTraits||'').split(/[,、，]/).map(v=>v.trim());
  const isNamed=traits.includes('二つ名')||String(row.id||'').startsWith('mon_named_');
  const selectCount=isNamed&&pool.length>4?4:Math.min(isNamed?4:3,pool.length);
  const actionNames=new Set(fullPool.map(a=>String(a.name||'').trim()).filter(Boolean));
  const mandatory=new Set(monsterFixedActionNames(row));
  const loadouts=monsterLoadoutCombinations(pool,selectCount).filter(combo=>{
    const selected=new Set(combo.map(a=>String(a.name||'').trim()));
    if([...mandatory].some(name=>!selected.has(name)))return false;
    if(!combo.some(monsterLoadoutActionIsDirectDamage))return false;
    for(const action of combo){
      const refs=monsterLoadoutReferencedNames(action.effect||'',actionNames);
      // パッシブ専用技は通常の所持技抽選から外れるため、効果文から参照されていても
      // そのロードアウト内へ同時選出されている必要はない。
      if(refs.some(name=>!passiveOnly.has(name)&&!selected.has(name)))return false;
    }
    return true;
  });
  return {mandatory:[...mandatory],loadouts,selectCount};
}
function assertMonsterLoadoutViabilityRows(rows=[]){
  const invalid=[];
  (rows||[]).forEach(row=>{
    const traits=String(row.monsterTraits||'').split(/[,、，]/).map(v=>v.trim());
    const isBoss=traits.includes('ボス'),isNamed=traits.includes('二つ名')||String(row.id||'').startsWith('mon_named_');
    const poolCount=parseMonsterActions(row.actions||'').length;
    const needsSelection=!isBoss&&(!isNamed||poolCount>4);
    if(!needsSelection)return;
    const result=monsterLegalLoadouts(row);
    if(!result.loadouts.length){
      invalid.push({row,reason:`固定/依存技を満たし、直接ダメージ行動を1つ以上含む${result.selectCount}技構成を作れません（必須：${result.mandatory.join('、')||'なし'}）`});
    }
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.row.name||x.row.id||'名称未設定')}：${x.reason}`).join('\n');
  throw new Error(`魔物の技選出条件を満たせません。候補抽選を行う個体は通常魔物3技、候補制二つ名4技になるよう、固定選出技・パッシブ専用技・行動間依存を確認してください。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function assertMonsterActionCountRows(rows=[]){
  const invalid=(rows || []).map(row=>{
    const traits=String(row.monsterTraits || '').split(/[,、，]/).map(v=>v.trim());
    const isBoss=traits.includes('ボス'),isNamed=traits.includes('二つ名')||String(row.id||'').startsWith('mon_named_');
    const actual=parseMonsterActions(row.actions || '').length;
    const ok=isBoss?actual===4:actual>=3;
    const expected=isBoss?'4個固定':'3個以上（役割に必要な数。候補が多い場合のみ遭遇時抽選）';
    return {row,expected,actual,ok};
  }).filter(x=>!x.ok);
  if(!invalid.length) return;
  const details=invalid.slice(0,10).map(x=>`・${String(x.row.name || x.row.id || '名称未設定')}：${x.actual}個（必要${x.expected}）`).join('\n');
  const rest=invalid.length>10 ? `\nほか${invalid.length-10}件` : '';
  throw new Error(`魔物の登録行動数は役割に必要な数とし、通常・強敵・二つ名は最低3行動、ボスは4行動固定です。行動数を強さのためのノルマとして増やさないでください。\n${details}${rest}`);
}
function monsterActionCanDamageBackline(action={}){
  const power=String(action.power||'').trim();
  if(!power || power==='なし') return false;
  const target=String(action.target||'').trim();
  const range=normalizeMonsterActionRange(action);
  const effect=String(action.effect||'');
  if(range==='遠距離' && /^敵(?:1体|2体|3体|複数|全体|1列|後衛)/.test(target)) return true;
  if(range==='特殊' && /前衛が残って.*敵後衛|敵後衛.*対象にできる/u.test(effect)) return true;
  return false;
}
function assertMonsterActionTypeSemanticsRows(rows=[]){
  const invalid=[];
  (rows||[]).forEach(monster=>parseMonsterActions(monster.actions||'').forEach(action=>{
    const type=normalizeMonsterActionType(action),power=String(action.power||'').trim(),hasDamage=!!power&&power!=='なし'&&power!=='-';
    if(['近接攻撃','遠距離攻撃'].includes(type)&&!hasDamage)invalid.push({monster,action,reason:`${type}は直接ダメージ必須`});
    if(type==='特殊'&&hasDamage)invalid.push({monster,action,reason:'特殊は直接ダメージなしの効果用'});
  }));
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.monster.name||x.monster.id||'名称未設定')}／${String(x.action.name||'行動名未設定')}：${x.reason}`).join('\n');
  throw new Error(`魔物の行動種別と処理内容が一致していません。近接攻撃・遠距離攻撃は直接ダメージを必ず含め、特殊は状態付与・拘束・移動など直接ダメージを伴わない効果、補助は自身・味方の能力変動、回復は自身・味方のHP等の回復に使用してください。術式・祈祷は魔物の行動種別として使用しません。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function assertNamedBacklineAttackRows(rows=[]){
  // 二つ名だからという理由だけで後衛攻撃枠を強制しない。
  // 後衛圧は個体の役割・行動構成に必要な場合だけ持たせる。
  return;
}
function areaBossMonsterNameSet(){
  const names=new Set();
  (state.event_tables||[]).forEach(event=>{
    if(String(event.eventType||'').trim()!=='ボス遭遇') return;
    String(event.encounterComposition||'').split(/\n+/).forEach(line=>{
      const cols=line.split(',').map(v=>String(v||'').trim());
      if(cols[1]) names.add(cols[1]);
    });
  });
  return names;
}
function assertAreaBossBacklineAttackRows(rows=[]){
  const areaBossNames=areaBossMonsterNameSet();
  const invalid=(rows||[]).filter(row=>{
    if(!areaBossNames.has(String(row.name||'').trim())) return false;
    return !parseMonsterActions(row.actions||'').some(monsterActionCanDamageBackline);
  });
  if(!invalid.length) return;
  const details=invalid.slice(0,10).map(row=>`・${String(row.name||row.id||'名称未設定')}`).join('\n');
  const rest=invalid.length>10?`\nほか${invalid.length-10}件`:'';
  throw new Error(`エリアボスには、前衛が残っている状態でも後衛へ直接ダメージを与えられる行動を最低1つ設定してください。弱体・状態異常だけの全体行動では代用できません。\n${details}${rest}`);
}
const SKILL_PROGRESS_EXPECTED_AREA=Object.freeze({
  1:'area_nearby_forest',
  2:'area_sector3_2_tbd',
  3:'area_sector5_2_tbd',
  4:'area_sector7_2_tbd',
  5:'area_sector9_2_tbd'
});
const SKILL_CRYSTAL_EXPECTED_AREA_BY_RESULT_SLOTS=Object.freeze({
  3:'area_sector3_1_tbd',
  4:'area_sector5_1_tbd',
  5:'area_sector7_1_tbd',
  6:'area_sector9_1_tbd'
});
function assertSkillProgressionRows(rows=[]){
  const invalid=[];
  for(const row of rows||[]){
    const rank=Math.floor(Number(row?.rank)||0),expected=SKILL_PROGRESS_EXPECTED_AREA[rank];
    if(!expected)continue;
    const actual=String(row?.unlockAreaKey||'').trim();
    if(actual!==expected)invalid.push(`${row?.name||row?.id||'名称未設定'}：★${rank}の解放段階は ${expected} 固定（現在 ${actual||'未設定'}）`);
  }
  if(invalid.length)throw new Error(`スキル解放段階に不整合があります。★1=1-2、★2=3-2、★3=5-2、★4=7-2、★5=9-2です。\n${invalid.slice(0,20).join('\n')}${invalid.length>20?`\nほか${invalid.length-20}件`:''}`);
}
function assertSkillCrystalProgressionRows(rows=[]){
  const invalid=[];
  for(const row of rows||[]){
    if(String(row?.craftType||'').trim()!=='クリスタル強化')continue;
    const slots=crystalSlotNumber(row?.resultItem||'');
    const expected=SKILL_CRYSTAL_EXPECTED_AREA_BY_RESULT_SLOTS[slots];
    if(!expected)continue;
    const actual=String(row?.unlockAreaKey||'').trim();
    if(actual!==expected)invalid.push(`${row?.name||row?.id||'名称未設定'}：${slots}枠への強化は ${expected} 固定（現在 ${actual||'未設定'}）`);
  }
  if(invalid.length)throw new Error(`スキルクリスタル強化の解放段階に不整合があります。★2以降のスキル解放の1エリア前（3-1 / 5-1 / 7-1 / 9-1）で強化を解放します。\n${invalid.slice(0,20).join('\n')}${invalid.length>20?`\nほか${invalid.length-20}件`:''}`);
}
function assertNumericRankRows(key,rows=[]){
  const invalid=(rows||[]).filter(row=>{
    if(key==='material_ranks') return !numericRankValueIncludingLegacyMaterialGrade(row.name,'');
    if(['items','recipes','spells','skills','quest_rewards','quests','monsters'].includes(key)) return !numericRankValueIncludingLegacyMaterialGrade(row.rank,'');
    if(key==='treasure_tables') return !numericRankValueIncludingLegacyMaterialGrade(row.treasureRank,'');
    return false;
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,10).map(row=>`・${String(row.name||row.id||'名称未設定')}`).join('\n');
  throw new Error(`ランクは1以上の数値で設定してください。\n${details}`);
}
function treasureDifficultyRequiredRow(row={}){
  const purpose=String(row?.tablePurpose??'').trim();
  const chestName=String(row?.chestName??'').trim();
  if(purpose==='入手アイテム'||purpose==='ボス褒賞')return false;
  if(chestName==='入手アイテム表'||/褒賞箱/.test(chestName))return false;
  return true;
}
function assertTreasureDifficultyRows(rows=[]){
  const fields=[['unlockDifficulty','解錠難易度'],['trapDetectDifficulty','罠感知難易度'],['trapDisarmDifficulty','罠解除難易度']];
  const invalid=[];
  (rows||[]).filter(treasureDifficultyRequiredRow).forEach(row=>fields.forEach(([field,label])=>{
    const raw=String(row?.[field]??'').trim(),n=Number(raw);
    if(!raw||!Number.isInteger(n)||n<1)invalid.push({row,label});
  }));
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(x=>`・${String(x.row.chestName||x.row.tableId||x.row.id||'宝箱名未設定')}：${x.label}`).join('\n');
  const rest=invalid.length>12?`\nほか${invalid.length-12}件`:'';
  throw new Error(`通常の宝箱表には、1以上の解錠・罠感知・罠解除の基準難易度を設定してください。入手アイテム表とボス褒賞箱は対象外です。\n${details}${rest}`);
}
function isUpgradeSlotEligibleItemRow(row={}){
  const itemType=String(row.itemType||'').trim();
  return String(row.dataKind||'アイテム').trim()!=='素材' && ['武器','防具','盾'].includes(itemType);
}
function assertUpgradeSlotScopeRows(rows=[]){
  const invalid=(rows||[]).filter(row=>{
    if(String(row.dataKind||'アイテム').trim()==='素材')return false;
    if(isUpgradeSlotEligibleItemRow(row))return false;
    return Number(row.upgradeLimit||0)>0 || String(row.upgradeMaterialMinRank||'').trim();
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(row=>`・${String(row.name||row.id||'名称未設定')}（${String(row.itemType||row.dataKind||'種別未設定')}）`).join('\n');
  throw new Error(`強化枠を設定できるのは武器・鎧・盾だけです。装飾品・バッグ・矢筒・道具・消耗品などには強化枠／強化素材最低ランクを設定できません。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function assertUpgradeMaterialTargetScopeRows(rows=[]){
  const banned=['装飾品','バッグ','矢筒','道具','調合品','消耗品','スクロール','アイテム'];
  const invalid=(rows||[]).filter(row=>{
    const isMonsterMaterial=String(row.dataKind||'').trim()==='素材'&&String(row.materialType||'').trim()==='魔物素材';
    if(!isMonsterMaterial)return false;
    const target=String(row.equipmentUpgradeTarget||'').trim();
    return banned.some(token=>target.includes(token));
  });
  if(!invalid.length)return;
  const details=invalid.slice(0,12).map(row=>`・${String(row.name||row.id||'名称未設定')}：${String(row.equipmentUpgradeTarget||'対象未設定')}`).join('\n');
  throw new Error(`魔物素材の装備強化対象は武器（魔導書・祈祷書を含む）・鎧・盾だけにしてください。装飾品など強化枠を持たない品は対象にできません。\n${details}${invalid.length>12?`\nほか${invalid.length-12}件`:''}`);
}
function assertEquipmentUpgradeMinimumRows(rows=[]){
  const invalid=(rows||[]).filter(row=>isUpgradeSlotEligibleItemRow(row)&&Number(row.upgradeLimit||0)>0&&!numericRankValueIncludingLegacyMaterialGrade(row.upgradeMaterialMinRank,''));
  if(!invalid.length)return;
  const details=invalid.slice(0,10).map(row=>`・${String(row.name||row.id||'名称未設定')}`).join('\n');
  throw new Error(`強化可能な装備には強化素材最低ランクが必要です。\n${details}`);
}
function weaponBranchMaterialSummary(row={}){
  if(String(row.craftType || '').trim()!=='武器派生') return {types:0,total:0};
  const parts=String(row.requiredMaterials || '').split(/[,、\n]+/).map(v=>v.trim()).filter(Boolean);
  const names=new Set();
  let total=0;
  parts.forEach(part=>{
    const m=part.match(/^(.*?)×\s*(\d+)/);
    const name=String(m ? m[1] : part).trim();
    if(name) names.add(name);
    total += m ? Math.max(0,Number(m[2])||0) : 1;
  });
  return {types:names.size,total};
}
function assertWeaponBranchMaterialRows(rows=[]){
  const invalid=(rows || []).filter(row=>{
    if(String(row.craftType || '').trim()!=='武器派生') return false;
    const s=weaponBranchMaterialSummary(row);
    return s.types<2 || s.total<2;
  });
  if(!invalid.length) return;
  const details=invalid.slice(0,10).map(row=>`・${String(row.name || row.id || '名称未設定')}：${String(row.requiredMaterials || '必要素材未設定')}`).join('\n');
  const rest=invalid.length>10 ? `\nほか${invalid.length-10}件` : '';
  throw new Error(`武器派生には複数種類かつ合計複数個の素材が必要です。単一素材だけでは保存・DB送信できません。\n${details}${rest}`);
}

function parseRequiredMaterialEntries(text=''){
  return String(text||'').split(/[,、\n]+/).map(v=>v.trim()).filter(Boolean).map(part=>{
    const m=part.match(/^(.*?)×\s*(\d+)/);
    const name=String(m ? m[1] : part).trim();
    const qty=m ? Math.max(1,Number(m[2])||1) : 1;
    return {name,qty};
  }).filter(x=>x.name);
}
function parseRequiredMaterialNames(text=''){
  return parseRequiredMaterialEntries(text).map(x=>x.name);
}
function otherworldAreaByKey(key=''){
  const area=(state.exploration_areas||[]).find(a=>String(a.id||'').trim()===String(key||'').trim());
  return area && String(area.areaType||'').trim()==='異界' ? area : null;
}
function accessoryOriginRecipe(itemName='',recipeUniverse=[]){
  const recipes=recipeUniverse||[];
  const seen=new Set();
  let current=String(itemName||'').trim();
  while(current && !seen.has(current)){
    seen.add(current);
    const makers=recipes.filter(r=>String(r.resultItem||'').trim()===current && String(r.category||'').trim()==='装飾品');
    if(!makers.length) return null;
    const upgrade=makers.find(r=>String(r.craftType||'').trim()==='装飾品強化');
    const initial=makers.find(r=>String(r.craftType||'').trim()!=='装飾品強化');
    const maker=initial||upgrade||makers[0];
    if(String(maker.craftType||'').trim()!=='装飾品強化' || !String(maker.baseItem||'').trim()) return maker;
    current=String(maker.baseItem||'').trim();
  }
  return null;
}
function materialBelongsToOtherworldArea(materialName='',area={}){
  const name=String(materialName||'').trim();
  if(!name||!area) return false;
  const material=(state.items||[]).find(x=>String(x.dataKind||'').trim()==='素材' && String(x.name||'').trim()===name);
  if(!material) return false;
  const areaName=String(area.name||'').trim();
  const source=String(material.source||'').trim();
  if(areaName && source.includes(areaName)) return true;
  const monsters=String(area.mainMonsters||'').split(/[,、，\n]+/).map(v=>v.trim()).filter(Boolean);
  if(monsters.includes(source)) return true;
  const tags=[material.tags,material.usageTags,material.notes].map(v=>String(v||'')).join(',');
  if(areaName && tags.includes(areaName)) return true;
  return false;
}
function assertOtherworldAccessoryUpgradeMaterialRows(rows=[]){
  const incoming=rows||[];
  const incomingIds=new Set(incoming.map(r=>String(r.id||'')).filter(Boolean));
  const recipeUniverse=[...(state.recipes||[]).filter(r=>!incomingIds.has(String(r.id||''))),...incoming];
  const invalid=[];
  incoming.forEach(row=>{
    if(String(row.craftType||'').trim()!=='装飾品強化' || String(row.category||'').trim()!=='装飾品') return;
    const base=String(row.baseItem||'').trim();
    const origin=accessoryOriginRecipe(base,recipeUniverse);
    if(!origin) return;
    const originArea=otherworldAreaByKey(origin.unlockAreaKey||'');
    if(!originArea) return;
    const upgradeArea=otherworldAreaByKey(row.unlockAreaKey||'');
    if(!upgradeArea){
      invalid.push({row,reason:`異界産装飾品「${base}」の強化先は異界エリア解放にしてください。`});
      return;
    }
    const mats=parseRequiredMaterialEntries(row.requiredMaterials||'');
    if(!mats.length){
      invalid.push({row,reason:'必要素材が未設定です。'});
      return;
    }
    const otherworldQty=mats.reduce((sum,m)=>sum+(materialBelongsToOtherworldArea(m.name,upgradeArea)?m.qty:0),0);
    const outsideQty=mats.reduce((sum,m)=>sum+(materialBelongsToOtherworldArea(m.name,upgradeArea)?0:m.qty),0);
    if(otherworldQty<=outsideQty){
      invalid.push({row,reason:`「${upgradeArea.name}」由来の異界素材を、異界外素材より合計個数で多くしてください（現在：異界素材${otherworldQty}個 / 異界外${outsideQty}個）。`});
    }
  });
  if(!invalid.length) return;
  const details=invalid.slice(0,10).map(x=>`・${String(x.row.name||x.row.id||'名称未設定')}：${x.reason}`).join('\n');
  const rest=invalid.length>10?`\nほか${invalid.length-10}件`:'';
  throw new Error(`異界産の装飾品は異界で段階強化し、強化先の異界由来素材を必ず主材料にしてください。異界外素材も副材料として使用できますが、必要個数の合計は異界素材より少なくしてください。\n${details}${rest}`);
}
function assertProcessedMaterialRows(rows=[]){
  const fields=['processingSkill','processingToolType','processingToolRank','processingRequiredMaterials','processingResultCount','processingDifficulty'];
  const invalid=[];
  (rows||[]).forEach(row=>{
    const processed=String(row.materialType||'').trim()==='加工素材';
    if(processed){
      const missing=fields.filter(field=>!String(row[field]??'').trim());
      const fee=Number(String(row.processingFee??'').trim());
      if(missing.length||!Number.isFinite(fee)||fee<=0) invalid.push(`${row.name||row.id||'名称未設定'}：${missing.length?'未設定 '+missing.join(', '):''}${(!Number.isFinite(fee)||fee<=0)?' 施設加工依頼費は1G以上で設定':''}`.trim());
    }else{
      const has=fields.concat('processingFee').some(field=>String(row[field]??'').trim() && !(field==='processingFee'&&Number(row[field])===0));
      if(has) invalid.push(`${row.name||row.id||'名称未設定'}：加工素材以外に加工専用項目が設定されています。`);
    }
  });
  if(invalid.length) throw new Error(`加工素材はレシピを持たず、加工情報を素材側へ設定してください。自作は対応道具と判定成功で0G、施設依頼には1G以上の加工依頼費を設定します。
${invalid.slice(0,10).map(x=>'・'+x).join('\n')}`);
}
function assertNamedProcessingArmorDefenseRows(rows=[]){
  const invalid=[];
  (rows||[]).forEach(row=>{
    if(String(row?.itemType||'').trim()!=='防具') return;
    const options=parseAdminNamedProcessingOptions(row?.namedProcessingOptions);
    options.forEach(opt=>{
      if(String(opt?.applyKind||'').trim()==='modifier' && String(opt?.applyTarget||'').trim()==='combat:defense'){
        invalid.push(String(row?.name||row?.id||'名称未設定'));
      }
    });
  });
  if(invalid.length) throw new Error(`防具の異名加工では防御値そのものを上げられません。命中・回避など他の常時補正値の上昇とは別ルールです。\n${invalid.slice(0,10).map(name=>'・'+name).join('\n')}`);
}
function collectFormRow(){
  const {key,idx}=formState; if(!key) throw new Error('編集中のデータがありません');
  syncAllCheckBuilders($('editModal'));
  if(key==='monsters') syncAllMonsterEditors();
  if(key==='quests') syncAllQuestFixedEventEditors();
  syncAllModifierEditors();
  syncAllAdminEquipmentEffectsEditors();
  syncAllAdminNamedProcessingEditors();
  const base = idx===null ? newBlankRow(key) : {...state[key][idx]};
  if(key==='items' && !base.dataKind) base.dataKind = formState.defaultDataKind || 'アイテム';
  if(key==='items' && base.dataKind !== '素材' && !String(base.csVisible || '').trim()) base.csVisible = 'TRUE';
  SCHEMA[key].forEach(field=>{
    const el = $('editModal').querySelector(`[data-form-field="${field}"]`);
    if(el) base[field] = el.value ?? '';
  });
  if(key==='items'){
    base.equipmentEffects=parseAdminEquipmentEffects(base.equipmentEffects);
    base.namedProcessingOptions=parseAdminNamedProcessingOptions(base.namedProcessingOptions);
    if(['武器','防具','盾','装飾品'].includes(String(base.itemType||'').trim()) && base.equipmentEffects.length) base.effect=equipmentEffectsLegacyText(base.equipmentEffects);
  }
  if(key==='equipment_categories'){
    base.intrinsicEffects=parseAdminEquipmentEffects(base.intrinsicEffects);
    if(base.intrinsicEffects.length) base.effect=equipmentEffectsLegacyText(base.intrinsicEffects);
  }
  if(base.checkType !== undefined) normalizeRowCheckType(key, base);
  normalizeEncounterPlacementRow(key,base);
  if(key==='equipment_categories' || key==='items') { Object.assign(base, migrateLegacyModifierFields(base)); ensurePhysicalElementForWeapon(base); }
  if(!String(base.id||'').trim()) base.id = `${key}_${Date.now()}`;
  ensurePlayerFacingPublicId(key, base);
  base.updatedAt = nowIso();
  base.ownerKey='';
  base.createdBy='';
  if(isStructuredNumericRankRecord(key,base)) base.rank=numericRankValueIncludingLegacyMaterialGrade(base.rank,1);
  if(key==='material_ranks') base.name=numericRankValueIncludingLegacyMaterialGrade(base.name,1);
  if(key==='items'){
    delete base.price;
    if(String(base.toolRank??'').trim()) base.toolRank=numericRankValueIncludingLegacyMaterialGrade(base.toolRank,1);
    if(String(base.guaranteeUpgradeMaxRank??'').trim()) base.guaranteeUpgradeMaxRank=numericRankValueIncludingLegacyMaterialGrade(base.guaranteeUpgradeMaxRank,1);
    if(String(base.toolRank??'').trim()) base.rank=base.toolRank;
    if(isEquipmentItemRow(base)) base.upgradeMaterialMinRank=numericRankValueIncludingLegacyMaterialGrade(base.upgradeMaterialMinRank,base.rank);
    else { base.upgradeLimit='0'; base.upgradeMaterialMinRank=''; }
  }
  if(key==='treasure_tables'){
    base.treasureRank=numericRankValueIncludingLegacyMaterialGrade(base.treasureRank,1);
    base.trapDetectDifficulty=numericRankValue(base.trapDetectDifficulty,'');
    if(String(base.scrollRank ?? '').trim()) base.scrollRank=numericRankValue(base.scrollRank,1);
  }
  if(key==='appraisal_rules'){
    if(String(base.scrollRank ?? '').trim()) base.scrollRank=numericRankValue(base.scrollRank,1);
    if(String(base.spellRank ?? '').trim()) base.spellRank=numericRankValue(base.spellRank,1);
  }
  const clean = {};
  (SCHEMA[key]||[]).forEach(field=>clean[field]=base[field] === undefined || base[field] === null ? '' : base[field]);
  if(key==='items'){ assertNumericRankRows('items',[clean]); assertItemPriceRows([clean]); assertItemClassificationRows([clean]); assertWeaponKatakanaNames([clean]); assertWeaponBaseDamageDieRows([clean]); assertUpgradeSlotScopeRows([clean]); assertUpgradeMaterialTargetScopeRows([clean]); assertEquipmentUpgradeMinimumRows([clean]); assertMonsterMaterialUpgradeRows([clean]); assertSpecialUpgradeNonStackRows([clean]); assertNoDefenseIgnoreUpgradeRows([clean]); assertNamedProcessingArmorDefenseRows([clean]); assertMaterialUpgradeSlotCostRows([clean]); assertMaterialUpgradeSeparationRows([clean]); assertProcessedMaterialRows([clean]); assertMonsterMaterialDescriptionRows([clean]); assertLateAreaMonsterMaterialRankRows([clean]); }
  if(key==='material_ranks') assertNumericRankRows('material_ranks',[clean]);
  if(key==='spells') assertNumericRankRows('spells',[clean]);
  if(key==='skills'){ assertNumericRankRows('skills',[clean]); assertSkillProgressionRows([clean]); }
  if(key==='recipes'){ assertNumericRankRows('recipes',[clean]); assertSkillCrystalProgressionRows([clean]); assertWeaponBranchMaterialRows([clean]); assertOtherworldAccessoryUpgradeMaterialRows([clean]); const projected=(state.recipes||[]).slice(); if(formState.idx===null) projected.push(clean); else projected[formState.idx]=clean; assertItemPriceRows(state.items||[], projected); }
  if(key==='quest_rewards') assertNumericRankRows('quest_rewards',[clean]);
  if(key==='quests') assertNumericRankRows('quests',[clean]);
  if(key==='treasure_tables'){ assertNumericRankRows('treasure_tables',[clean]); assertTreasureDifficultyRows([clean]); }
  if(key==='monsters'){ assertMonsterEffectClarityRows([clean]); assertNumericRankRows('monsters',[clean]); assertMonsterFixedActionSelectionRows([clean]); assertMonsterPassiveOnlyActionRows([clean]); assertMonsterLoadoutViabilityRows([clean]); assertMonsterActionCountRows([clean]); assertMonsterActionTypeSemanticsRows([clean]); assertNamedBacklineAttackRows([clean]); assertAreaBossBacklineAttackRows([clean]); assertMonsterActionBaseValueRows([clean]); assertMonsterActionCheckSourceRows([clean]); assertMonsterSupportActionCheckRows([clean]); assertMonsterDirectDamageDieRows([clean]); }
  return clean;
}
function applyFormToState(){
  const {key,idx}=formState; const row=collectFormRow();
  if(idx===null) state[key].push(row); else state[key][idx]=row;
  markDirty(key);
  rerenderTableGroup(key); updateCounts(); updateJsonBox(); closeForm(); toast('保存しました');
  return {key,row};
}
async function applyFormAndSave(){
  const {key}=formState;
  try{
    const shouldSaveCategories = quickCategoryDirty;
    applyFormToState();
    if(shouldSaveCategories){
      await Promise.all(['item_types','item_categories','material_types','material_categories','material_ranks'].map(saveSheet));
      quickCategoryDirty = false;
    }
    await saveSheet(key);
  }catch(e){ toast(e.message,'error'); }
}
