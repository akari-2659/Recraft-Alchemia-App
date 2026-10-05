function characterNumericRankValue(value, fallback=''){
  if(typeof value==='number' && Number.isFinite(value) && value>=1) return Math.floor(value);
  const raw=String(value ?? '').trim();
  if(!raw) return fallback;
  if(Object.prototype.hasOwnProperty.call(LEGACY_CHARACTER_NUMERIC_RANKS,raw)) return LEGACY_CHARACTER_NUMERIC_RANKS[raw];
  const m=raw.match(/(?:★|Rank\s*[:：]?\s*)?(\d+)/i); const n=m?Number(m[1]):NaN;
  return Number.isFinite(n)&&n>=1?Math.floor(n):fallback;
}
function characterPlayerRankLabel(value){ const n=characterNumericRankValue(value,''); return n?`★${n}`:String(value ?? '').trim(); }

function characterCraftingRequiredToolRank(rank){
  const n=Math.max(1,Number(rank)||1);
  return Math.ceil(n/3)*3;
}
function characterCraftingDifficultyRows(rank,difficulty){
  const base=Number(String(difficulty??'').trim());
  if(!Number.isFinite(base)) return [];
  const required=characterCraftingRequiredToolRank(rank);
  return [0,1,2].map(step=>({
    toolRank:required+step*3,
    reduction:step*2,
    finalDifficulty:base-step*2
  }));
}
function characterCraftingDifficultySummary(rank,difficulty){
  const rows=characterCraftingDifficultyRows(rank,difficulty);
  if(!rows.length) return String(difficulty||'未設定');
  return rows.map((r,i)=>`★${r.toolRank}対応：${r.finalDifficulty}${i?`（－${r.reduction}）`:'（基礎）'}`).join(' / ')+' / 以降1段階ごとに－2';
}
function characterCraftingToolName(craftSkill='',craftType=''){
  const skill=String(craftSkill||'').trim();
  const type=String(craftType||'').trim();
  if(skill==='調合'||type==='調合') return '調合道具';
  if(type==='細工'||type==='仕掛け製作'||skill==='設計') return '細工道具';
  if(['武器派生','防具製作','盾製作','装飾品製作','装飾品強化','バッグ製作','矢筒製作','鍛冶製作','鍛冶'].includes(type)) return '鍛冶道具';
  if(skill==='細工') return '細工道具';
  return '対応道具';
}
function characterCraftSupportName(row={}){
  const skill=String(row.craftSkill||'').trim();
  const type=String(row.craftType||'').trim();
  if(skill==='調合'||type==='調合')return '調合安定剤';
  if(skill==='設計')return '機巧調整剤';
  if(skill==='細工'){
    if(type==='武器派生'||(type==='鍛冶'&&String(row.category||'').trim()!=='矢弾'))return '武装融和剤';
    return '工作定着剤';
  }
  return '';
}
function characterCraftSupportText(row={}){const name=characterCraftSupportName(row);return name?`${name}（自作時のみ・任意個数）：1個につき作成難易度－2`:'';}
function characterCraftingSelfText(row={}){
  const skill=row.craftSkill || (row.craftType==='調合'?'調合':row.craftType==='料理'?'なし':(row.craftType==='細工'||row.craftType==='仕掛け製作')?'設計':'細工');
  const difficultyRows=characterCraftingDifficultyRows(row.rank,row.difficulty);
  if(!difficultyRows.length){
    return `自作：レシピ必須 / 製作技能：${skill} / 作成難易度：${row.difficulty||'未設定'}`;
  }
  const supportText=characterCraftSupportText(row);const support=supportText?` / 任意の作成補助材：${supportText}`:'';
  return `自作：レシピ必須 / 製作技能：${skill} / 使用道具：${characterCraftingToolName(skill,row.craftType)} / 基礎作成難易度：${row.difficulty||'未設定'} / ${characterCraftingDifficultySummary(row.rank,row.difficulty)}${support}`;
}
/* RA_PATCH_WAREHOUSE_ALL_ITEM_RANK_V90_8_575 */
