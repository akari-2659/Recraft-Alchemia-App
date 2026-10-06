
'use strict';

const APP_NAME = 'recraft_alchemia_v4';
const GAS_URL_KEY = APP_NAME + '.gas.url';
// GitHub Pagesで毎回URLを入力しない運用にする場合は、ここにApps Scriptの /exec URLを入れてください。
const DEFAULT_GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxNQYC7-aBE23cliuD1Zdze18xHh-q45P1qpBgwCCg0dYgxd1b8A-R63eGjzMtgOxMT/exec';
const EQUIPMENT_CATEGORY_CACHE_KEY = APP_NAME + '.equipmentCategories';
const EQUIPMENT_CATEGORY_CACHE_META_KEY = APP_NAME + '.equipmentCategories.meta';
const CS_ITEM_CACHE_KEY = APP_NAME + '.characterSheetItems';
let CS_ITEM_MASTER = [];
let DB_EQUIPMENT_CATEGORY_MASTER = [];
let DB_INITIAL_ITEM_MASTER = [];
let DB_INITIAL_ITEM_MASTER_INDEX = { byId:new Map(), byPublicId:new Map(), byName:new Map() };
let DB_INITIAL_SPELL_MASTER = [];
let DB_RECIPE_MASTER = [];
let DB_SKILL_MASTER = [];
let lastAppliedCharacterSheetMasterRef = null;

/* GM_ALL_ITEM_CATALOG_V1 */
const GM_ALL_ITEM_CATALOG_MODE = true;
let gmMasterVirtualCache = { source:null, rows:[], byLookup:new Map(), byName:new Map() };
function gmMasterVirtualRows(){
  if(!GM_ALL_ITEM_CATALOG_MODE)return [];
  const source=DB_INITIAL_ITEM_MASTER||[];
  if(gmMasterVirtualCache.source===source)return gmMasterVirtualCache.rows;
  const rows=[];const byLookup=new Map(),byName=new Map();const seen=new Set();
  for(const raw of source){
    try{
      if(typeof enabledLike==='function'&&!enabledLike(raw?.enabled))continue;
      if(typeof csItemVisible==='function'&&!csItemVisible(raw||{}))continue;
      const item=dbItemToInventoryItem(raw||{});
      const identity=String(item.masterId||item.id||item.publicId||item.name||'').trim();
      if(!identity||seen.has(identity))continue;seen.add(identity);
      const maxStack=Math.max(1,Number(raw?.maxStack||item?.spellSlots||99)||99);
      const row=normalizeInventoryItem({...item,count:Math.max(9999,maxStack)});
      row.__gmCatalog=true;
      rows.push(row);
      for(const value of [inventoryItemKey(row),row.id,row.masterId,String(row.publicId||'').trim().toUpperCase()]){const key=String(value||'').trim();if(key&&!byLookup.has(key))byLookup.set(key,row);}
      const name=String(row.name||'').trim();if(name&&!byName.has(name))byName.set(name,row);
    }catch(_){ }
  }
  gmMasterVirtualCache={source,rows,byLookup,byName};
  return rows;
}
function gmMasterVirtualFind(itemId='',itemName=''){
  gmMasterVirtualRows();
  const id=String(itemId||'').trim();
  if(id){return gmMasterVirtualCache.byLookup.get(id)||gmMasterVirtualCache.byLookup.get(id.toUpperCase())||null;}
  const name=String(itemName||'').trim();return name?(gmMasterVirtualCache.byName.get(name)||null):null;
}
function gmMasterVirtualHasName(name=''){return !!gmMasterVirtualFind('',name);}

let skillGachaState = null;
let skillWarehouseFilter = { category:'全て', weaponType:'全て', search:'' };

const STAT_ORDER = ['STR','CON','POW','DEX','APP','SIZ','INT','EDU'];
const STAT_MAX = { STR:18, CON:18, POW:18, DEX:18, APP:18, SIZ:18, INT:18, EDU:21 };
const STAT_LABEL = { STR:'STR', CON:'CON', POW:'POW', DEX:'DEX', APP:'APP', SIZ:'SIZ', INT:'INT', EDU:'EDU' };

const ABILITIES = [
  { key:'body', name:'体力', desc:'力仕事・耐久・近接・防御' },
  { key:'dexterity', name:'器用', desc:'採取・細工・射撃・操作' },
  { key:'sense', name:'感覚', desc:'探索・感知・回避・追跡' },
  { key:'intellect', name:'知性', desc:'調合・鑑定・知識・設計' },
  { key:'will', name:'意志', desc:'抵抗・集中・魔法・祈祷' },
  { key:'charm', name:'魅力', desc:'交渉・共感・社交・鼓舞' },
];
const ABILITY_NAMES = Object.fromEntries(ABILITIES.map(a => [a.key, a.name]));


const SKILL_CATEGORIES = [
  { key:'body', name:'体力系', ability:'body', skills:[
    { key:'athletics', name:'運動', desc:'身体行動', detail:'走る、登る、泳ぐ、跳ぶなど、身体を大きく動かす判定に使用します。足場の悪い場所の移動、障害物の突破、落下や転倒を避ける場面でも使います。' },
    { key:'force', name:'力業', desc:'力任せの作業・大振り攻撃', detail:'重い物を動かす、押す、引く、壊す、こじ開けるなど、純粋な力で状況を動かす判定に使用します。戦闘中は近接の代わりに力業で武器攻撃を行えます。命中時、通常の武器ダメージに加えて武器ダメージのダイスを+1個し、対象の防御値の半分（切り捨て）を無視します。無視するのは防御値のみで、防御技能ポイント、防御行動値、追加軽減、耐性は無視しません。ただし追加ダメージに使う技能ポイントは近接を参照します。成否に関わらず、次の自分のターンは行動できず、次の自分のターン開始時まで防御-2を受けます。' },
    { key:'melee', name:'近接', desc:'近接攻撃', detail:'素手や近接武器で攻撃する時の命中に使用します。命中した場合、装備している武器ダメージに、近接へ振り分けたポイント分のダメージを追加します。' },
    { key:'guard', name:'防御', desc:'常時軽減・防御行動・かばう', detail:'防御技能に振り分けたポイントは、防御行動の有無にかかわらず受けるダメージを減らします。防御行動時は、装備の防御行動値も追加で適用します。かばう判定にも使用します。' },
  ]},
  { key:'dexterity', name:'器用系', ability:'dexterity', skills:[
    { key:'gather', name:'採取', desc:'素材採取・ドロップ補助', detail:'薬草、鉱石、魔物素材などを傷つけずに集める判定に使用します。素材の品質維持、希少部位の回収、採取量の増加に関わります。魔物の討伐時、採取判定に成功することでドロップ判定を+1します。' },
    { key:'craft', name:'細工', desc:'精密作業', detail:'細かな手作業、修理、分解、罠解除、鍵開けなどの判定に使用します。道具や素材を精密に扱う作業に関わります。' },
    { key:'shoot', name:'射撃', desc:'射撃攻撃', detail:'弓、クロスボウ、投擲武器などで攻撃する時の命中に使用します。命中した場合、装備している武器ダメージに、射撃へ振り分けたポイント分のダメージを追加します。' },
    { key:'operate', name:'操作', desc:'装置・道具の扱い', detail:'道具、装置、乗り物、工房設備などを扱う判定に使用します。複雑な機械の起動、調整、操縦、作業設備の使用に関わります。' },
  ]},
  { key:'sense', name:'感覚系', ability:'sense', skills:[
    { key:'search', name:'探索', desc:'場所を調べる', detail:'周囲を調べ、手がかり、隠し通路、素材の群生地、違和感のある物品などを見つける判定に使用します。場所を調べる時の基本技能です。' },
    { key:'detect', name:'感知', desc:'危険や異変に気づく', detail:'気配、罠、危険、異変、接近してくる存在などに気づく判定に使用します。奇襲の察知、不自然な音や匂い、魔力や空気の変化に気づく場面で使います。' },
    { key:'evade', name:'回避', desc:'回避値の基準', detail:'攻撃、落石、罠、爆発、崩落などを避ける判定に使用します。PCが自分から行う回避判定は2D6＋回避技能合計（装備の回避補正込み）で行います。敵の行動から参照される回避値は、その回避技能合計に+5し、回避値専用補正があればさらに加算します。' },
    { key:'track', name:'追跡', desc:'痕跡を辿る', detail:'足跡、痕跡、匂い、魔力の流れなどを辿る判定に使用します。逃げた魔物や人物を追う、移動経路を推測する、痕跡から進行方向を読む場面で使います。' },
  ]},
  { key:'intellect', name:'知性系', ability:'intellect', skills:[
    { key:'alchemy', name:'調合', desc:'アイテム作成', detail:'素材を組み合わせ、アイテム・薬品・道具などを作成する判定に使用します。調合の成功、品質の向上、追加効果の付与などに関わります。' },
    { key:'appraise', name:'鑑定', desc:'価値や性質を見極める', detail:'アイテム、素材、装備、魔物素材などの性質や価値を見極める判定に使用します。未知の素材や特殊なアイテムの効果、危険性、売却価値を調べる場面で使います。' },
    { key:'knowledge', name:'知識', desc:'魔物・素材・属性', detail:'魔物、素材、属性について知っているかを確認する判定に使用します。魔物の特徴、素材の性質、属性の相性などを思い出す場面で使います。魔物に対して使用する場合、成功すると指定した1つの耐性・弱点・無効属性などを知ることができます。' },
    { key:'design', name:'設計', desc:'罠の仕組みを組む', detail:'罠の構造を考え、作成・調整する判定に使用します。現状、武器作成・武器派生・武器強化には使用せず、それらは細工で判定します。' },
  ]},
  { key:'will', name:'意志系', ability:'will', skills:[
    { key:'resist', name:'抵抗', desc:'状態異常や精神干渉に耐える', detail:'毒・汚染・呪い・麻痺・睡眠や精神干渉、弱体化などに耐える基準です。PCが自分から行う抵抗判定は2D6＋抵抗技能合計（装備の抵抗補正込み）で行います。敵の行動から参照される抵抗値は、その抵抗技能合計に+5し、抵抗値専用補正があればさらに加算します。' },
    { key:'focus', name:'集中', desc:'維持・集中攻撃', detail:'長時間の作業、高難度の調合、儀式、継続的な魔力操作など、精神を乱さずに行動を続ける判定に使用します。戦闘中は主行動を使用して集中状態になれます。集中開始後から次の自分のターン開始までに1点以上のダメージを受けると集中は解除されます。維持したまま次の自分のターンを迎えた場合、射撃武器による攻撃またはダメージを与える魔法を1回行えます。その攻撃は本来の射撃・魔法の代わりに集中技能で判定し、判定に+2します。命中時は通常どおり射撃または魔法へ割り振ったポイントをダメージへ加え、さらにダメージダイスを1個追加します。単体・複数・列・範囲を問わず適用し、複数対象では各対象のダメージロールへ適用します。敵前衛がいる状態で射撃武器から後衛を狙う-2補正は通常どおり受けます。矢弾・MPなどの消費は攻撃1回分のみで、攻撃後に集中状態を解除します。祈祷には使用できません。' },
    { key:'magic', name:'魔法', desc:'魔法術式', detail:'魔法術式を使用する時の判定に使用します。魔法術式でダメージを与える場合、術式ダメージに魔法へ振り分けたポイント分のダメージを追加します。' },
    { key:'prayer', name:'祈祷', desc:'祈祷術式', detail:'祈祷術式を使用する時の判定に使用します。祈祷術式でダメージや回復を行う場合、術式の効果量に祈祷へ振り分けたポイント分を追加します。浄化、加護、回復、精神支援にも関わります。' },
  ]},
  { key:'charm', name:'魅力系', ability:'charm', skills:[
    { key:'negotiate', name:'交渉', desc:'条件交渉', detail:'相手と話し合い、条件を整える判定に使用します。値引き、依頼、説得、情報交換、取引、相手の態度を和らげる場面で使います。' },
    { key:'service', name:'共感', desc:'感情や本心を読む', detail:'相手の感情や本心を読み取り、寄り添う判定に使用します。不安を落ち着かせる、嘘や隠し事に気づく、相手の悩みや望みを察する場面で使います。' },
    { key:'art', name:'社交', desc:'場の空気と人付き合い', detail:'礼儀、場の空気、集団内での立ち回りに関わる判定に使用します。人脈作り、評判の確認、貴族・商人・町人などとの交流、集まりの中で自然に情報を得る場面で使います。' },
    { key:'leadership', name:'鼓舞', desc:'次の判定+2', detail:'仲間を励まし、士気を高める判定に使用します。戦闘中や困難な場面で成功すると、対象の次の判定に+2します。' },
  ]},
];
const HAND_TYPE_OPTIONS = ['なし','短剣','片手剣','片手斧','片手槌','片手槍','鞭','杖','盾','大盾','魔導書','祈祷書','両手剣','大槌','長槍','弓','クロスボウ','ヘヴィクロスボウ','大鎌'];
const TWO_HAND_TYPES = new Set(['両手剣','大槌','長槍','弓','クロスボウ','ヘヴィクロスボウ','大鎌']);
const ELEMENT_TYPES = ['','物','火','水','風','雷','光','闇','無','可変','矢弾依存'];
function elementSelectOptions(selected='') {
  const current = String(selected || '').trim();
  return ELEMENT_TYPES.map(v => `<option value="${esc(v)}" ${current === v ? 'selected' : ''}>${esc(v || '未選択')}</option>`).join('');
}
const EQUIPMENT_PRESETS = {
  'なし': { power:'', hit:'', defense:'', guard:'', evade:'0', offhand:'', description:'', note:'' },
  '短剣': { element:'物', power:'1D6', hit:'+1', defense:'', guard:'', evade:'+1', offhand:'2', description:'短い刃で素早く切り込む軽量武器。近い間合いで細かな動きに合わせやすい。', note:'' },
  '片手剣': { element:'物', power:'1D6+1', hit:'0', defense:'', guard:'', evade:'0', offhand:'2', description:'扱いやすさと攻防の均衡に優れた片手剣。盾や書物とも併用しやすい。', note:'' },
  '片手斧': { element:'物', power:'1D6+2', hit:'-1', defense:'', guard:'', evade:'0', offhand:'3', description:'刃の重みを叩きつける片手斧。小回りよりも一撃の圧を重視する。', note:'' },
  '片手槌': { element:'物', power:'1D6+1', hit:'0', defense:'', guard:'', evade:'-1', offhand:'2', description:'硬い装甲や障害物を打ち砕く片手槌。重い打撃で敵の姿勢を崩す。', note:'' },
  '槍': { element:'物', power:'1D6', hit:'+1', defense:'', guard:'', evade:'0', offhand:'2', description:'片手で扱える短めの槍。間合いを取りながら敵を突き止める。', note:'' },
  '片手槍': { element:'物', power:'1D6', hit:'+1', defense:'', guard:'', evade:'0', offhand:'2', description:'片手で扱える短めの槍。間合いを取りながら敵を突き止める。', note:'' },
  '鞭': { element:'物', power:'1D6', hit:'0', defense:'', guard:'', evade:'0', offhand:'2', description:'敵後衛を前衛へ引き出し、近接攻撃の機会を作る片手武器。', note:'敵後衛1体への引き寄せ攻撃が可能。命中時はダメージを与えず対象を前衛へ移動する。引き寄せ不可には無効。' },
  '杖': { element:'物', power:'1D6', hit:'0', defense:'', guard:'', evade:'+1', offhand:'1', description:'魔力を通しやすい杖。身体の支えにもなり、術者の集中を助ける。', note:'' },
  '盾': { power:'', hit:'', defense:'+1', guard:'+2', evade:'0', description:'腕に構えて攻撃を受け止める防具。仲間を守る時にも頼りになる。', note:'' },
  '大盾': { power:'', hit:'', defense:'+2', guard:'+3', evade:'-1', description:'大きな面で攻撃を遮る重盾。取り回しは重いが守りは厚い。', note:'' },
  '魔導書': { power:'', hit:'', defense:'', guard:'', evade:'0', description:'魔法の術式を記し、戦闘中に扱える形へ整える書物。', note:'' },
  '祈祷書': { power:'', hit:'', defense:'', guard:'', evade:'0', description:'祈祷の詞と儀礼を記し、祈りを術として形にする書物。', note:'' },
  '魔印': { power:'', hit:'', defense:'', guard:'', evade:'0', description:'魔力を留めるための印。身につけた者の魔法を発動しやすく整える。', note:'' },
  '聖印': { power:'', hit:'', defense:'', guard:'', evade:'0', description:'祈りを込めるための聖なる印。身につけた者の祈祷を静かに支える。', note:'' },
  '両手剣': { element:'物', power:'2D6', hit:'0', defense:'', guard:'', evade:'-1', description:'両手で振るう大剣。重い刃で正面から敵を押し切る。', note:'' },
  '大槌': { element:'物', power:'2D6+2', hit:'-1', defense:'', guard:'', evade:'-1', description:'巨大な頭部を叩きつける大槌。硬い外殻や障害物の破壊に向く。', note:'' },
  '長槍': { element:'物', power:'1D6+2', hit:'+1', defense:'', guard:'', evade:'0', description:'長い柄で敵を遠ざける槍。前線を押し返し、足止めに使いやすい。', note:'' },
  '弓': { element:'物', power:'1D6+1', hit:'0', defense:'', guard:'', evade:'0', description:'離れた敵を狙う短弓。軽く扱いやすく、移動しながらの射撃に向く。', note:'' },
  'クロスボウ': { element:'物', power:'2D6', hit:'0', defense:'', guard:'', evade:'0', reloadTurns:'1', description:'機構で矢を放つクロスボウ。狙いを定めやすく、重い一撃を届ける。', note:'' },
  'ヘヴィクロスボウ': { element:'物', power:'2D6+2', hit:'-1', defense:'', guard:'', evade:'0', reloadTurns:'1', description:'大型のクロスボウ。構えに力はいるが、遠くの強敵にも深く食い込む。', note:'' },
  '普段着': { power:'', hit:'', defense:'0', guard:'1D3', evade:'0', description:'日常の衣服。軽く動きやすく、探索中も身体の動きを邪魔しにくい。', note:'' },
  '旅風のジャケット': { power:'', hit:'', defense:'1', guard:'1D6', evade:'+1', description:'風をはらむように軽い旅装の上着。防護布と薄革を合わせ、身軽な立ち回りを妨げにくい。', note:'' },
  '鉄紐のベスト': { power:'', hit:'', defense:'2', guard:'1D6+1', evade:'0', description:'革地に細い鉄紐を編み込んだ実用的なベスト。重すぎず、急所をほどよく守れる。', note:'' },
  '鋲打ちの胴衣': { power:'', hit:'', defense:'3', guard:'1D6+2', evade:'-1', description:'厚手の胴衣に金属鋲を打ち込んだ防具。動きは重くなるが、正面からの衝撃を受け止めやすい。', note:'' },
  '星糸のケープ': { power:'', hit:'', defense:'1', guard:'1D6', evade:'0', description:'淡く光る糸を織り込んだ術者用のケープ。肩口に刻まれた紋様が魔力の流れを整える。', note:'' },
  '祈り布のストール': { power:'', hit:'', defense:'1', guard:'1D6', evade:'0', description:'祈りの言葉を細く刺繍した清楚なストール。身につけた者の呼吸と所作を静かに整える。', note:'' },
  // 旧名称互換（保存済みキャラクター用）
  '軽装': { power:'', hit:'', defense:'1', guard:'1D6', evade:'+1', description:'旧名称：軽装。新規データでは旅風のジャケットを使用します。', note:'' },
  '中装': { power:'', hit:'', defense:'2', guard:'1D6+1', evade:'0', description:'旧名称：中装。新規データでは鉄紐のベストを使用します。', note:'' },
  '重装': { power:'', hit:'', defense:'3', guard:'1D6+2', evade:'-1', description:'旧名称：重装。新規データでは鋲打ちの胴衣を使用します。', note:'' },
  '魔導衣': { power:'', hit:'', defense:'1', guard:'1D6', evade:'0', description:'旧名称：魔導衣。新規データでは星糸のケープを使用します。', note:'' },
  '祈祷衣': { power:'', hit:'', defense:'1', guard:'1D6', evade:'0', description:'旧名称：祈祷衣。新規データでは祈り布のストールを使用します。', note:'' },
  '特殊防具': { power:'', hit:'', defense:'', guard:'', evade:'', description:'特殊な素材や仕掛けを備えた防具。通常の鎧とは異なる働きを持つ。', note:'' },
};
const HAND_SLOT_KEYS = ['rightHand','leftHand'];

const CARRY_SLOT_MAX = 30;
const CARRY_SLOT_TYPE_OPTIONS = ['なし','回復薬','魔力薬','爆弾','罠','特殊矢弾','補助品','浄化品','道具','素材','重要品','その他'];
const BASE_EQUIPMENT_SLOTS = [
  { key:'rightHand', name:'右手', kind:'hand', typeOptions:HAND_TYPE_OPTIONS },
  { key:'leftHand', name:'左手', kind:'hand', typeOptions:HAND_TYPE_OPTIONS },
  { key:'armor', name:'鎧', kind:'armor', typeOptions:['なし','普段着','旅風のジャケット','鉄紐のベスト','鋲打ちの胴衣','星糸のケープ','祈り布のストール','特殊防具'] },
  { key:'accessory1', name:'装飾品1', kind:'accessory', typeOptions:['なし','装飾品','魔印','聖印','護符','指輪','腕輪','耳飾り','首飾り','ブローチ','片眼鏡','髪飾り','魔導石','その他'] },
  { key:'accessory2', name:'装飾品2', kind:'accessory', typeOptions:['なし','装飾品','魔印','聖印','護符','指輪','腕輪','耳飾り','首飾り','ブローチ','片眼鏡','髪飾り','魔導石','その他'] },
];
const EQUIPMENT_SLOTS = BASE_EQUIPMENT_SLOTS.concat(Array.from({ length:CARRY_SLOT_MAX }, (_, i) => ({
  key:'carry' + (i + 1),
  name:'所持品' + (i + 1),
  kind:'carry',
  carryIndex:i + 1,
  typeOptions:CARRY_SLOT_TYPE_OPTIONS
})));

const SKILL_BY_KEY = {};
for (const cat of SKILL_CATEGORIES) for (const sk of cat.skills) SKILL_BY_KEY[sk.key] = { ...sk, category: cat.key, ability: cat.ability, categoryName: cat.name };

const SUPPORT_SKILL_MODES = Object.freeze([
  ['none','対象外'],['battle','戦闘'],['exploration','探索'],['both','どちらも']
]);
const LEGACY_SUPPORT_SKILL_KEYS_BY_CHARACTER_ID = Object.freeze({
  ch_mrfspilf_0vcslwu:['prayer','appraise'],
  ch_mrhjv1ai_wspdju4:['melee','guard','leadership'],
  ch_mrskymwf_iavpdvu:['magic','melee','knowledge'],
  ch_mrw7p6l1_axpi8a6:['shoot','gather','search','detect'],
  ch_mrw7zexz_zg21ivd:['force','melee'],
  ch_mrw8dq1l_5yhss8s:['melee','craft','design','negotiate'],
  ch_msw12ot0_s1sdol0:['melee'],
  ch_mswidjjf_9w14r50:['alchemy','craft','design']
});
function normalizeSupportSkillMode(value='none'){
  const raw=String(value||'none').trim().toLowerCase();
  if(['battle','戦闘'].includes(raw))return 'battle';
  if(['exploration','探索'].includes(raw))return 'exploration';
  if(['both','どちらも','両方'].includes(raw))return 'both';
  return 'none';
}
function emptySupportSkillModes(){return Object.fromEntries(Object.keys(SKILL_BY_KEY).map(key=>[key,'none']));}
function defaultSupportSettings(){return {eligible:false,skillModes:emptySupportSkillModes()};}
function supportSettingsHasExplicitValue(value){return !!(value&&typeof value==='object'&&(Object.prototype.hasOwnProperty.call(value,'eligible')||(value.skillModes&&typeof value.skillModes==='object')));}
function legacySupportSettingsForCharacterId(characterId=''){
  const keys=LEGACY_SUPPORT_SKILL_KEYS_BY_CHARACTER_ID[String(characterId||'').trim()]||[];
  const skillModes=emptySupportSkillModes();
  keys.forEach(key=>{if(SKILL_BY_KEY[key])skillModes[key]='both';});
  return {eligible:keys.length>0,skillModes};
}
function normalizeSupportSettings(value=null,characterId=''){
  const explicit=supportSettingsHasExplicitValue(value);
  const source=explicit?value:legacySupportSettingsForCharacterId(characterId);
  const modes=emptySupportSkillModes();
  const rawModes=source&&typeof source.skillModes==='object'?source.skillModes:{};
  for(const key of Object.keys(modes))modes[key]=normalizeSupportSkillMode(rawModes[key]);
  return {eligible:source?.eligible===true,skillModes:modes};
}
function supportSkillModeOptionsHtml(current='none'){
  const mode=normalizeSupportSkillMode(current);
  return SUPPORT_SKILL_MODES.map(([value,label])=>`<option value="${value}"${value===mode?' selected':''}>${label}</option>`).join('');
}
function getSupportSettings(){
  const skillModes=emptySupportSkillModes();
  for(const key of Object.keys(skillModes))skillModes[key]=normalizeSupportSkillMode($('support_skill_'+key)?.value||'none');
  return {eligible:!!$('supportEligible')?.checked,skillModes};
}
function setSupportSettings(value=null,characterId=''){
  const settings=normalizeSupportSettings(value,characterId);
  if($('supportEligible'))$('supportEligible').checked=!!settings.eligible;
  for(const [key,mode] of Object.entries(settings.skillModes||{}))if($('support_skill_'+key))$('support_skill_'+key).value=normalizeSupportSkillMode(mode);
  updateSupportSettingsSummary();
}
function updateSupportSettingsSummary(){
  const summary=$('supportSettingsSummary');if(!summary)return;
  const settings=getSupportSettings();let battle=0,exploration=0;
  Object.values(settings.skillModes||{}).forEach(mode=>{if(mode==='battle'||mode==='both')battle++;if(mode==='exploration'||mode==='both')exploration++;});
  summary.textContent=`${settings.eligible?'選出対象 / ':'選出対象外 / '}戦闘技能 ${battle}件 / 探索技能 ${exploration}件`;
}

let currentCloudPlayerKey = '';
let currentMode = 'edit'; // new/edit/view
let currentCharacter = null;
let outputTargetData = null;
let lastRolls = [];

const AUTO_SAVE_DELAY_MS = 900;
let autoSaveEnabled = true;
let autoSaveReady = false;
let autoSaveTimer = null;
let autoSaveBusy = false;
let autoSavePending = false;
let autoSaveDirty = false;
let autoSaveLastSavedHash = '';
let autoSaveDirtySections = new Set();
let cloudCharacterRevision = 0;
let cloudCharacterRowHint = 0;
let cloudCharacterFolderReady = false;
let characterLastHistoryAt = 0;
const CHARACTER_SAVE_API_VERSION = 1;
function $(id) { return document.getElementById(id); }

function showToast(message, type='ok', duration=2200) {
  const container = $('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type || 'ok'}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  window.setTimeout(() => {
    toast.classList.remove('show');
    window.setTimeout(() => toast.remove(), 260);
  }, duration);
}
function esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function uuid() { return 'ch_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9); }
function nowIso() { return new Date().toISOString(); }
function safeName(s) { return String(s || 'character').replace(/[\\/:*?"<>|]/g, '_').trim() || 'character'; }
function nval(v, fallback=0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function clampInt(v, min, max) { return Math.max(min, Math.min(max, Math.trunc(nval(v, min)))); }
function d(sides) { return Math.floor(Math.random() * sides) + 1; }
function roll(expr) {
  if (expr === '3D6') return d(6) + d(6) + d(6);
  if (expr === '2D6+6') return d(6) + d(6) + 6;
  if (expr === '3D6+3') return d(6) + d(6) + d(6) + 3;
  return 0;
}
function diceExpr(stat) {
  if (stat === 'SIZ' || stat === 'INT') return '2D6+6';
  if (stat === 'EDU') return '3D6+3';
  return '3D6';
}
function stage(raw, stat) {
  let v = clampInt(raw, 0, 99);
  v = Math.min(v, STAT_MAX[stat] || 18);
  if (v <= 2) return 0;
  if (v <= 5) return 0;
  if (v <= 8) return 1;
  if (v <= 12) return 2;
  if (v <= 15) return 3;
  return 4;
}

function computeAbilitiesFromStats(stats={}) {
  const raw = Object.fromEntries(STAT_ORDER.map(stat => [stat, nval(stats?.[stat], 0)]));
  return {
    body: Math.max(stage(raw.STR, 'STR'), stage(raw.CON, 'CON'), stage(raw.SIZ, 'SIZ')),
    dexterity: stage(raw.DEX, 'DEX'),
    sense: stage(raw.INT, 'INT'),
    intellect: Math.max(stage(raw.INT, 'INT'), stage(raw.EDU, 'EDU')),
    will: stage(raw.POW, 'POW'),
    charm: stage(raw.APP, 'APP')
  };
}

function computeAbilities(stats) {
  if (arguments.length === 0) return computeEffectiveAbilities(getAbilityValues(), getEquipmentState());
  return computeAbilitiesFromStats(stats || {});
}
function getAbilityValues() {
  const values = {};
  for (const a of ABILITIES) values[a.key] = clampInt($('ability_' + a.key)?.value || 0, 0, 4);
  return values;
}
function setAbilityValues(values={}) {
  for (const a of ABILITIES) if ($('ability_' + a.key)) $('ability_' + a.key).value = clampInt(values?.[a.key] ?? 0, 0, 4);
}
function resolveAbilities(data) {
  if (data?.effectiveAbilities) return data.effectiveAbilities;
  const base = data?.abilities || computeAbilitiesFromStats(data?.stats || {});
  return computeEffectiveAbilities(base, data?.equipment || {});
}
function clearRawStats() {
  for (const stat of STAT_ORDER) if ($('stat_' + stat)) $('stat_' + stat).value = '';
}
function rollConvertedAbility(key) {
  if (key === 'body') return Math.max(stage(roll('3D6'), 'STR'), stage(roll('3D6'), 'CON'), stage(roll('2D6+6'), 'SIZ'));
  if (key === 'dexterity') return stage(roll('3D6'), 'DEX');
  if (key === 'sense') return stage(roll('2D6+6'), 'INT');
  if (key === 'intellect') return Math.max(stage(roll('2D6+6'), 'INT'), stage(roll('3D6+3'), 'EDU'));
  if (key === 'will') return stage(roll('3D6'), 'POW');
  if (key === 'charm') return stage(roll('3D6'), 'APP');
  return 0;
}
function rollAllConvertedAbilities() {
  const values = {};
  for (const a of ABILITIES) values[a.key] = rollConvertedAbility(a.key);
  clearRawStats();
  setAbilityValues(values);
  if ($('currentHp')) $('currentHp').value = '';
  if ($('currentMp')) $('currentMp').value = '';
  updateAll();
}
function rerollOneAbility(key) {
  clearRawStats();
  if ($('ability_' + key)) $('ability_' + key).value = rollConvertedAbility(key);
  if ($('currentHp')) $('currentHp').value = '';
  if ($('currentMp')) $('currentMp').value = '';
  updateAll();
}
function getStats() {
  const stats = {};
  for (const stat of STAT_ORDER) stats[stat] = clampInt($('stat_' + stat)?.value || 0, 0, 99);
  return stats;
}
function setStats(stats, syncAbilities=true) {
  for (const stat of STAT_ORDER) if ($('stat_' + stat)) $('stat_' + stat).value = stats?.[stat] ?? '';
  if (syncAbilities) setAbilityValues(computeAbilitiesFromStats(stats || {}));
  if ($('currentHp')) $('currentHp').value = '';
  if ($('currentMp')) $('currentMp').value = '';
  updateAll();
}
function emptyCategoryBonus() {
  return Object.fromEntries(SKILL_CATEGORIES.map(c => [c.key, 0]));
}
function getManualCategoryBonuses() {
  const bonus = emptyCategoryBonus();
  for (const c of SKILL_CATEGORIES) bonus[c.key] = clampInt($('manualBonus_' + c.key)?.value || 0, 0, 99);
  return bonus;
}
function setManualCategoryBonuses(values={}) {
  for (const c of SKILL_CATEGORIES) if ($('manualBonus_' + c.key)) $('manualBonus_' + c.key).value = clampInt(values?.[c.key] || 0, 0, 99);
}
function categoryPointLimits(manual=getManualCategoryBonuses()) {
  const limits = {};
  for (const c of SKILL_CATEGORIES) limits[c.key] = 2 + (manual[c.key] || 0);
  return limits;
}
function defaultSkillAlloc() {
  const alloc = {};
  for (const key of Object.keys(SKILL_BY_KEY)) alloc[key] = { cat: 0, free: 0, other: 0 };
  return alloc;
}
function getSkillAlloc() {
  const alloc = defaultSkillAlloc();
  for (const key of Object.keys(SKILL_BY_KEY)) {
    alloc[key] = {
      cat: clampInt($('skill_cat_' + key)?.value || 0, 0, 99),
      free: clampInt($('skill_free_' + key)?.value || 0, 0, 3),
      other: 0,
    };
  }
  return alloc;
}
function setSkillAlloc(alloc={}) {
  for (const key of Object.keys(SKILL_BY_KEY)) {
    if ($('skill_cat_' + key)) $('skill_cat_' + key).value = clampInt(alloc?.[key]?.cat || 0, 0, 99);
    if ($('skill_free_' + key)) $('skill_free_' + key).value = clampInt(alloc?.[key]?.free || 0, 0, 3);
  }
  updateAll();
}
function skillTotals(abilities=computeAbilities(), alloc=getSkillAlloc(), equipment=null) {
  const equipmentMods = equipment ? computeEquipmentSkillModifiers(equipment) : {};
  const totals = {};
  for (const [key, sk] of Object.entries(SKILL_BY_KEY)) {
    // 能力補正は技能の基礎値へ反映し、技能そのものへの装備補正だけを「その他」に加える。
    // チャットパレットでは装備・装飾品由来の技能補正を +X の独立項として表示する。
    const base = Number(abilities[sk.ability] || 0);
    const cat = alloc[key]?.cat || 0;
    const free = alloc[key]?.free || 0;
    const manualOther = 0;
    const equipmentOther = Number(equipmentMods[key] || 0);
    const other = equipmentOther;
    totals[key] = { base, cat, free, manualOther, equipmentOther, other, add: cat + free + other, total: base + cat + free + other };
  }
  return totals;
}
function validateSkills(alloc=getSkillAlloc(), manual=getManualCategoryBonuses()) {
  const errors = [];
  const catSums = Object.fromEntries(SKILL_CATEGORIES.map(c => [c.key, 0]));
  const catLimits = categoryPointLimits(manual);
  let freeSum = 0;
  for (const [key, v] of Object.entries(alloc)) {
    const sk = SKILL_BY_KEY[key];
    const cat = v.cat || 0;
    const free = v.free || 0;
    catSums[sk.category] += cat;
    freeSum += free;
  }
  for (const c of SKILL_CATEGORIES) if (catSums[c.key] > catLimits[c.key]) errors.push(`${c.name}ポイントが${catLimits[c.key]}点を超えています。`);
  if (freeSum > 3) errors.push(`自由ポイントが3点を超えています。`);
  return { errors, catSums, catLimits, freeSum };
}
function renderStatic() {
  $('statInputs').innerHTML = STAT_ORDER.map(stat => `<input id="stat_${stat}" type="hidden" />`).join('');

  $('abilityOutput').innerHTML = ABILITIES.map(a => `
    <div class="ability-card">
      <label for="ability_${a.key}" class="ability-name">${a.name}</label>
      <div class="ability-values">
        <div class="ability-base-line">
          <div class="ability-mini-label">基本</div>
          <input id="ability_${a.key}" data-ability-input="1" type="number" min="0" max="4" inputmode="numeric" value="0" />
        </div>
        <div class="ability-result-line">
          <div>
            <div class="ability-mini-label">補正</div>
            <div id="ability_mod_${a.key}" class="ability-mod">0</div>
          </div>
          <div>
            <div class="ability-mini-label">合計</div>
            <div id="ability_total_${a.key}" class="computed-value">0</div>
          </div>
        </div>
      </div>
      <button type="button" class="ghost" data-reroll-ability="${a.key}">個別振り直し</button>
    </div>
  `).join('');

  $('manualCategoryBonuses').innerHTML = SKILL_CATEGORIES.map(c => `
    <div class="bonus-card">
      <div class="bonus-line">
        <label for="manualBonus_${c.key}">${c.name} 追加ボーナス</label>
        <input id="manualBonus_${c.key}" type="number" min="0" max="99" inputmode="numeric" value="0" />
      </div>
      <div class="small">このカテゴリの分類ポイント上限に加算されます。</div>
    </div>
  `).join('');

  $('skillArea').innerHTML = SKILL_CATEGORIES.map(cat => `
    <details class="skill-category-card" data-cat="${cat.key}">
      <summary class="skill-category-title"><span>${cat.name}</span><span class="small">基礎能力：${ABILITY_NAMES[cat.ability]} / 分類P 0/2</span></summary>
      <div class="skill-category-body">
        <div class="skill-row header">
          <div>技能</div><div>能力</div><div>分類P</div><div>自由P</div><div>その他</div><div>技能値</div><div>サポート</div>
        </div>
        ${cat.skills.map(sk => `
          <div class="skill-row" data-skill-search="${esc([sk.name,sk.detail||sk.desc||''].join(' '))}">
            <div class="skill-name">${sk.name}<details class="skill-detail"><summary>詳細</summary><div class="skill-detail-body">${esc(sk.detail || sk.desc || '')}</div></details></div>
            <div class="skill-cell base"><span id="skill_base_${sk.key}">0</span></div>
            <div class="skill-cell cat"><input id="skill_cat_${sk.key}" data-skill-input="1" type="number" min="0" max="99" value="0" /></div>
            <div class="skill-cell free"><input id="skill_free_${sk.key}" data-skill-input="1" type="number" min="0" max="3" value="0" /></div>
            <div class="skill-cell other"><div id="skill_other_${sk.key}" class="skill-other-auto">0</div></div>
            <div class="skill-cell total computed-value" id="skill_total_${sk.key}">0</div>
            <div class="skill-cell support"><select id="support_skill_${sk.key}" class="skill-support-select" data-support-skill-mode="${sk.key}" aria-label="${sk.name}のサポート使用範囲">${supportSkillModeOptionsHtml('none')}</select></div>
          </div>
        `).join('')}
      </div>
    </details>
  `).join('');


  $('equipmentArea').innerHTML = EQUIPMENT_SLOTS.map(slot => {
    const options = slot.typeOptions.map(op => `<option value="${op}">${op}</option>`).join('');
    if (slot.kind === 'carry') {
      return `
        <div class="equipment-card carry-slot-card carry-item-row" data-equipment-card="${slot.key}" data-carry-index="${slot.carryIndex || 0}">
          <div class="carry-item-title" id="equip_${slot.key}_summary">未設定</div>
          <div class="carry-item-primary">
            <div class="field">
              <label class="small" for="equip_${slot.key}_itemSelect">共通DB・倉庫から選択</label>
              <select id="equip_${slot.key}_itemSelect" data-equipment-input="1"><option value="">未選択（倉庫へ戻す）</option></select>
            </div>
            <div class="field">
              <label class="small" for="equip_${slot.key}_count">個数</label>
              <input id="equip_${slot.key}_count" data-equipment-input="1" type="number" min="0" max="99" value="1" />
            </div>
          </div>
          <div id="equip_${slot.key}_effectPreview" class="carry-item-effect" hidden></div>
          <button type="button" class="ghost inventory-detail-btn public-view-allowed" data-carry-item-detail="${slot.key}">アイテム詳細</button>
          <div id="equip_${slot.key}_itemDetail" hidden><div class="small">アイテムを選択すると詳細を表示します。</div></div>
          <input id="equip_${slot.key}_name" data-equipment-input="1" type="hidden" value="" />
          <select id="equip_${slot.key}_type" data-equipment-input="1" hidden aria-hidden="true" tabindex="-1">${options}</select>
          <input id="equip_${slot.key}_description" data-equipment-input="1" type="hidden" value="" />
          <input id="equip_${slot.key}_note" data-equipment-input="1" type="hidden" value="" />
          <div class="equipment-readonly-grid">
            <div class="equipment-readonly-card equipment-description-field">
              <span class="equipment-readonly-label">説明</span>
              <div id="equip_${slot.key}_descriptionDisplay" class="equipment-readonly-text">—</div>
            </div>
            <div class="equipment-readonly-card equipment-effect-field">
              <span class="equipment-readonly-label">効果</span>
              <div id="equip_${slot.key}_noteDisplay" class="equipment-readonly-text">—</div>
            </div>
          </div>
        </div>`;
    }
    return `
      <details class="equipment-card equipment-kind-${slot.kind}" data-equipment-card="${slot.key}">
        <summary class="equipment-card-summary">
          <span class="equipment-card-toggle" aria-hidden="true"></span>
          <span class="equipment-card-title"><span class="equipment-slot-label">${slot.name}</span></span>
          <span class="equipment-summary" id="equip_${slot.key}_summary">未設定</span>
        </summary>
        <div class="equipment-slot-body">
          <div class="equipment-primary-grid equipment-selection-only">
            <div class="field equipment-select-field equipment-wide">
              <label for="equip_${slot.key}_itemSelect">共通DB・倉庫から選択</label>
              <select id="equip_${slot.key}_itemSelect" data-equipment-input="1"><option value="">未選択</option></select>
            </div>
            <input id="equip_${slot.key}_name" data-equipment-input="1" type="hidden" value="" />
            <select id="equip_${slot.key}_type" data-equipment-input="1" hidden aria-hidden="true" tabindex="-1">${options}</select>
            <select id="equip_${slot.key}_element" data-equipment-input="1" hidden aria-hidden="true" tabindex="-1">${elementSelectOptions()}</select>
          </div>

          <div class="equipment-readonly-grid">
            <div class="equipment-readonly-card" data-equipment-field="type">
              <span class="equipment-readonly-label">種類</span>
              <strong id="equip_${slot.key}_typeDisplay" class="equipment-readonly-value">—</strong>
            </div>
            <div class="equipment-readonly-card" data-equipment-field="element">
              <span class="equipment-readonly-label">属性</span>
              <strong id="equip_${slot.key}_elementDisplay" class="equipment-readonly-value">—</strong>
            </div>
          </div>

          <div class="equipment-readonly-grid equipment-combat-grid" data-equipment-combat-group="${slot.key}">
            <div class="equipment-readonly-card equipment-damage-card" data-equipment-field="power">
              <span class="equipment-readonly-label">武器ダメージ</span>
              <strong id="equip_${slot.key}_powerDisplay" class="equipment-readonly-value equipment-damage-formula">—</strong>
              <span id="equip_${slot.key}_powerBreakdown" class="equipment-readonly-note"></span>
            </div>
            <div class="equipment-readonly-card" data-equipment-field="offhand">
              <span class="equipment-readonly-label">副手追撃値</span>
              <strong id="equip_${slot.key}_offhandDisplay" class="equipment-readonly-value">—</strong>
            </div>
            <div class="equipment-readonly-card" data-equipment-field="reload">
              <span class="equipment-readonly-label">装填ターン</span>
              <strong id="equip_${slot.key}_reloadTurnsDisplay" class="equipment-readonly-value">—</strong>
            </div>
            <div class="equipment-readonly-card" data-equipment-field="target">
              <span class="equipment-readonly-label">対象</span>
              <strong id="equip_${slot.key}_targetDisplay" class="equipment-readonly-value">—</strong>
            </div>
            <div class="equipment-readonly-card" data-equipment-field="check">
              <span class="equipment-readonly-label">使用技能</span>
              <strong id="equip_${slot.key}_checkTypeDisplay" class="equipment-readonly-value">—</strong>
            </div>
          </div>
          <input id="equip_${slot.key}_power" data-equipment-input="1" type="hidden" value="" />
          <input id="equip_${slot.key}_offhand" data-equipment-input="1" type="hidden" value="" />
          <input id="equip_${slot.key}_reloadTurns" data-equipment-input="1" type="hidden" value="" />
          <input id="equip_${slot.key}_target" data-equipment-input="1" type="hidden" value="" />
          <input id="equip_${slot.key}_checkType" data-equipment-input="1" type="hidden" value="" />

          <details class="equipment-extra-details">
            <summary>装備詳細（効果・補正・強化）</summary>
            <div class="equipment-extra-body">
              <div class="field equipment-wide equipment-modifier-field">
                <label>装備固有の補正値</label>
                <textarea id="equip_${slot.key}_modifiers" class="hidden internal-raw-field" hidden aria-hidden="true" tabindex="-1" style="display:none!important"></textarea>
                <div id="equip_${slot.key}_modifierRows" class="equipment-modifier-preview small">補正なし</div>
                <div class="small">選択中の装備に登録された固有値を自動適用します。</div>
              </div>
              <div class="field equipment-upgrade-limit-field"${slot.kind==='accessory'?' hidden':''}>
                <label for="equip_${slot.key}_upgradeLimit">強化枠上限</label>
                <input id="equip_${slot.key}_upgradeLimit" data-equipment-input="1" type="number" min="0" max="9" value="" placeholder="例：2" />
              </div>
              <details id="equip_${slot.key}_upgradeDetails" class="equipment-upgrade-details equipment-wide"${slot.kind==='accessory'?' hidden':''}>
                <summary>強化内容</summary>
                <div id="equip_${slot.key}_upgradeUsage" class="small"></div>
                <div id="equip_${slot.key}_upgradeSlots" class="equipment-upgrade-list" data-equipment-input="1"></div>
                <input id="equip_${slot.key}_upgradeLines" data-equipment-input="1" type="hidden" value="" />
                <div class="small">選択中の武器・鎧・盾に使用できる強化を共通DBから表示します。魔導書・祈祷書は武器として扱います。装備の「強化素材最低ランク」未満の素材による強化は表示しません。消費枠は強化内容から自動設定されます。</div>
              </details>
              <input id="equip_${slot.key}_description" data-equipment-input="1" type="hidden" value="" />
              <input id="equip_${slot.key}_note" data-equipment-input="1" type="hidden" value="" />
              <div class="field equipment-description-field">
                <label>説明</label>
                <div id="equip_${slot.key}_descriptionDisplay" class="equipment-readonly-text">—</div>
              </div>
              <div class="field equipment-effect-field">
                <label>効果</label>
                <div id="equip_${slot.key}_noteDisplay" class="equipment-readonly-text">—</div>
              </div>
            </div>
          </details>

          <details id="equip_${slot.key}_spellFields" class="spellbook-fields equipment-wide">
            <summary><span>セット術式</span><span id="equip_${slot.key}_spellLabel" class="spell-slot-badge">術式枠</span></summary>
            <div class="spellbook-fields-body">
              <div class="small" style="margin-bottom:7px">倉庫に登録されている術式から選択してください。</div>
              <div id="equip_${slot.key}_spellSlotList" class="spell-slot-list" data-equipment-input="1"></div>
              <input id="equip_${slot.key}_setSpells" data-equipment-input="1" type="hidden" value="" />
              <input id="equip_${slot.key}_knownSpells" data-equipment-input="1" type="hidden" value="" />
              <div id="equip_${slot.key}_spellHelp" class="small">倉庫に対応する術式がない場合は、倉庫タブで術式を登録してください。</div>
            </div>
          </details>
        </div>
      </details>`;
  }).join('') + `
    <details class="equipment-card equipment-wide equipment-memo-card">
      <summary class="equipment-card-summary"><span class="equipment-card-toggle" aria-hidden="true"></span><span class="equipment-card-title">装備メモ</span><span class="equipment-summary">補足</span></summary>
      <div class="field">
        <label for="equipmentMemo">メモ</label>
        <textarea id="equipmentMemo" data-equipment-input="1" placeholder="装備セット、魔導書/祈祷書のセット枠、所持品補足など"></textarea>
      </div>
    </details>`;
  const carryArea = $('carryArea');
  if (carryArea) {
    carryArea.innerHTML = '';
    for (const card of Array.from($('equipmentArea')?.querySelectorAll('.carry-slot-card') || [])) {
      carryArea.appendChild(card);
    }
  }
}
function updateAbilities() {
  const base = getAbilityValues();
  const equipment = getEquipmentState();
  const mods = computeEquipmentAbilityModifiers(equipment);
  const effective = computeEffectiveAbilities(base, equipment);
  for (const a of ABILITIES) {
    if ($('ability_mod_' + a.key)) $('ability_mod_' + a.key).textContent = signedNumberText(mods[a.key] || 0);
    if ($('ability_total_' + a.key)) $('ability_total_' + a.key).textContent = effective[a.key] || 0;
  }
  return effective;
}
function updateSkills() {
  const abilities = computeEffectiveAbilities(getAbilityValues(), getEquipmentState());
  const alloc = getSkillAlloc();
  const totals = skillTotals(abilities, alloc, getEquipmentState());
  for (const [key, t] of Object.entries(totals)) {
    if ($('skill_base_' + key)) $('skill_base_' + key).textContent = t.base;
    if ($('skill_other_' + key)) $('skill_other_' + key).textContent = signedNumberText(t.other || 0);
    if ($('skill_total_' + key)) $('skill_total_' + key).textContent = t.total;
  }
  const check = validateSkills(alloc, getManualCategoryBonuses());
  for (const cat of SKILL_CATEGORIES) {
    const el = document.querySelector(`[data-cat="${cat.key}"] .skill-category-title .small`);
    if (el) el.textContent = `基礎能力：${ABILITY_NAMES[cat.ability]} / 分類P ${check.catSums[cat.key]}/${check.catLimits[cat.key]}`;
  }
  if (check.errors.length) {
    $('skillPointStatus').className = 'status-box error';
    $('skillPointStatus').textContent = '技能ポイントに問題があります。\n' + check.errors.join('\n') + `\n自由P ${check.freeSum}/3`;
  } else {
    $('skillPointStatus').className = 'status-box ok';
    $('skillPointStatus').textContent = `技能ポイントOK。自由P ${check.freeSum}/3`;
  }
}
function skillOtherSummaryText(t={}) {
  return `その他${signedNumberText(t.other || 0)}`;
}
function makeSummary() {
  const data = collectData(false);
  const abilities = data.effectiveAbilities || computeEffectiveAbilities(data.abilities || getAbilityValues(), data.equipment || getEquipmentState());
  const totals = skillTotals(abilities, data.skills, data.equipment || {});
  const manualBonus = data.manualCategoryBonuses || emptyCategoryBonus();
  const catLimits = categoryPointLimits(manualBonus);
  const res = computeResources(abilities, data.resources || getResourceState(), data.equipment || getEquipmentState());
  const lines = [];
  lines.push(`【リクラフト・アルケミア キャラクター】`);
  lines.push(`名前：${data.name || '未設定'}`);
  if (data.gender || data.age) lines.push(`性別：${data.gender || ''} / 年齢：${data.age || ''}`);
  lines.push('');
  lines.push('■ 能力値');
  lines.push(ABILITIES.map(a => `${a.name}:${abilities[a.key]}`).join(' / '));
  lines.push('');
  lines.push('■ HP・MP');
  lines.push(`HP:${res.currentHp}/${res.maxHp}（HPボーナス${res.hpBonus}点） / MP:${res.currentMp}/${res.maxMp}（MPボーナス${res.mpBonus}点）`);
  lines.push(`疲労度:${res.fatigue} / すべての判定:${res.fatiguePenalty||'補正なし'}`);
  const combat = computeCombatStats(abilities, data.skills || defaultSkillAlloc(), data.equipment || {});
  lines.push(`防御値:${combat.defenseValue} / 防御技能軽減:${combat.defenseSkillPoints} / 常時軽減:${combat.constantDamageReduction} / 防御行動値:${combat.guardActionValue} / 回避:${combat.evasionTotal} / 抵抗:${combat.resistanceTotal}`);
  if (combat.dualWield?.available) lines.push(`二刀攻撃:${combat.dualWield.rightMain} / ${combat.dualWield.leftMain}`);
  lines.push('');
  lines.push('■ 装備');
  pushEquipmentSummaryLines(lines, data.equipment || {});
  lines.push('');
  lines.push(`■ 技能カテゴリポイント`);
  lines.push(SKILL_CATEGORIES.map(c => `${c.name}:${catLimits[c.key]}（基本2+追加${manualBonus[c.key] || 0}）`).join(' / '));
  lines.push('');
  lines.push('■ 技能値');
  for (const cat of SKILL_CATEGORIES) {
    lines.push(`［${cat.name}］`);
    for (const sk of cat.skills) {
      const t = totals[sk.key];
      lines.push(`${sk.name}: ${t.total}（能力${t.base}+分類P${t.cat}+自由P${t.free}+${skillOtherSummaryText(t)}）`);
    }
  }
  pushInventorySummaryLines(lines, data.inventory || {});
  if (data.memo) { lines.push(''); lines.push('■ メモ'); lines.push(data.memo); }
  return lines.join('\n');
}

function getResourceState() {
  return {
    hpBonus: clampInt($('hpBonus')?.value || 0, 0, 99),
    mpBonus: clampInt($('mpBonus')?.value || 0, 0, 99),
    currentHp: clampInt($('currentHp')?.value || 0, 0, 999),
    currentMp: clampInt($('currentMp')?.value || 0, 0, 999),
    fatigue: clampInt($('fatigueLevel')?.value || 0, 0, 99),
  };
}
function setResourceState(resources={}) {
  if ($('hpBonus')) $('hpBonus').value = clampInt(resources?.hpBonus || 0, 0, 99);
  if ($('mpBonus')) $('mpBonus').value = clampInt(resources?.mpBonus || 0, 0, 99);
  if ($('currentHp')) $('currentHp').value = resources?.currentHp ?? '';
  if ($('currentMp')) $('currentMp').value = resources?.currentMp ?? '';
  if ($('fatigueLevel')) $('fatigueLevel').value = clampInt(resources?.fatigue || 0, 0, 99);
}

function pushEquipmentSummaryLines(lines, equipment={}) {
  for (const slot of EQUIPMENT_SLOTS) {
    const item = (equipment || {})[slot.key] || {};
    if (!(item.name || (item.type && item.type !== 'なし') || item.setSpells)) continue;
    lines.push(`${slot.name}: ${item.name || '未設定'}${item.type ? ' / ' + item.type : ''}${item.element ? ' / 属性:' + item.element : ''}${item.count ? ' ×' + item.count : ''}${item.offhand ? ' / 副手追撃:' + item.offhand : ''}`);
    if (item.setSpells) lines.push(`  セット術式: ${String(item.setSpells).replace(/\n/g, '、')}`);
  }
}
function inventoryBuyPriceText(value, withUnit=true){
  const raw=String(value ?? '').trim();
  if(!raw) return '購入不可';
  const n=Number(raw);
  if(!Number.isFinite(n)||n<=0) return '購入不可';
  return withUnit ? `${raw}G` : raw;
}
function inventorySellPriceText(value, withUnit=true){
  const raw=String(value ?? '').trim();
  if(!raw) return '';
  const n=Number(raw);
  if(Number.isFinite(n)&&n===0) return '売却不可';
  return withUnit ? `${raw}G` : raw;
}
function pushInventorySummaryLines(lines, inventory={}) {
  const items = normalizeInventoryState(inventory).items;
  if (!items.length) return;
  lines.push('');
  lines.push('■ 倉庫');
  for (const item of items) {
    if (!(item.name || item.category || item.note)) continue;
    lines.push(`${item.name || '未設定'}${item.count !== undefined && item.count !== null ? ' ×' + item.count : ''}${item.location ? ' / ' + item.location : ''}${item.kind ? ' / ' + item.kind : ''}${item.rank ? ' / ' + inventoryRankLabel(item) : ''}${item.element ? ' / 属性:' + item.element : ''}${item.cost ? ' / コスト:' + item.cost : ''}`);
    const sellPriceText=inventorySellPriceText(item.price);
    if (item.category || sellPriceText) lines.push(`  ${[item.category ? 'カテゴリ:' + item.category : '', sellPriceText ? '売値:' + sellPriceText : ''].filter(Boolean).join(' / ')}`);
    if (item.description) lines.push(`  ${String(item.description).replace(/\n/g, ' ')}`);
    if (item.note) lines.push(`  ${String(item.note).replace(/\n/g, ' ')}`);
  }
}


function emptyCharacter() {
  const stats = Object.fromEntries(STAT_ORDER.map(k => [k, '']));
  const abilities = Object.fromEntries(ABILITIES.map(a => [a.key, 0]));
  return { id: uuid(), name: '', gender: '', age: '', stats, abilities, skills: defaultSkillAlloc(), supportSettings:defaultSupportSettings(), manualCategoryBonuses: emptyCategoryBonus(), resources: { hpBonus:0, mpBonus:0, currentHp:'', currentMp:'', fatigue:0 }, equipment: defaultEquipment(), inventory: defaultInventory(), loadoutPresets:defaultLoadoutPresets(), skillGacha:defaultSkillGachaState(), craftLists:normalizeCraftLists(), autoSaveEnabled:true, memo: '', createdAt: nowIso(), updatedAt: nowIso() };
}

function collectData(updateTime=true) {
  const base = currentCharacter || emptyCharacter();
  syncAllEquipmentUpgradesToInventory();
  syncAllEquipmentSpellSetsToInventory();
  const equipment = getEquipmentState();
  const baseAbilities = getAbilityValues();
  const abilities = computeEffectiveAbilities(baseAbilities, equipment);
  return {
    ...base,
    name: $('charName').value.trim(),
    gender: $('charGender').value.trim(),
    age: $('charAge').value.trim(),
    stats: getStats(),
    abilities: baseAbilities,
    effectiveAbilities: abilities,
    skills: getSkillAlloc(),
    supportSettings: getSupportSettings(),
    manualCategoryBonuses: getManualCategoryBonuses(),
    resources: computeResources(abilities, getResourceState(), equipment),
    equipment,
    inventory: getInventoryState(),
    loadoutPresets: normalizeLoadoutPresets(loadoutPresetsState),
    skillGacha: getSkillGachaState(),
    craftLists: getCraftListsState(),
    combatStats: computeCombatStats(abilities, getSkillAlloc(), equipment),
    autoSaveEnabled: autoSaveEnabled!==false,
    memo: $('charMemo').value,
    updatedAt: updateTime ? nowIso() : base.updatedAt,
  };
}
function applyData(data) {
  const rawSupportSettings=data&&typeof data==='object'?data.supportSettings:null;
  currentCharacter = { ...emptyCharacter(), ...(data || {}) };
  currentCharacter.autoSaveEnabled=currentCharacter.autoSaveEnabled!==false;
  autoSaveEnabled=currentCharacter.autoSaveEnabled;
  $('charName').value = currentCharacter.name || '';
  $('charGender').value = currentCharacter.gender || '';
  $('charAge').value = currentCharacter.age || '';
  if ($('playerKey')) $('playerKey').value = currentCloudPlayerKey;
  if ($('newPlayerKey')) $('newPlayerKey').value = '';
  setStats(currentCharacter.stats || {}, false);
  setAbilityValues(currentCharacter.abilities || computeAbilitiesFromStats(currentCharacter.stats || {}));
  setSkillAlloc(currentCharacter.skills || {});
  setSupportSettings(rawSupportSettings,currentCharacter.id||'');
  currentCharacter.supportSettings=getSupportSettings();
  setManualCategoryBonuses(currentCharacter.manualCategoryBonuses || {});
  setResourceState(currentCharacter.resources || {});
  legacyEquipmentUpgradeMigrationCount=0;
  // v90.8.457: 倉庫→装備→倉庫表示の順に1回だけ構築する。
  // 旧処理は setInventoryState 内で全倉庫を描画した直後、setEquipmentState が同じ候補群を再構築していた。
  setInventoryState(currentCharacter.inventory || {}, {render:false});
  markInventoryUiDirty();
  loadoutPresetsState = normalizeLoadoutPresets(currentCharacter.loadoutPresets || {});
  setEquipmentState(currentCharacter.equipment || {});
  // 倉庫カードは「倉庫」タブを開くまで生成しない。編集画面への遷移を倉庫件数から切り離す。
  renderQuiverControls();
  setSkillGachaState(currentCharacter.skillGacha || {});
  setCraftListsState(currentCharacter.craftLists || {});
  if(legacyEquipmentUpgradeMigrationCount>0){
    setTimeout(()=>showToast(`旧形式の装備強化${legacyEquipmentUpgradeMigrationCount}件を新形式へ引き継ぎました。次回保存時に確定します。`,'ok'),0);
  }
  renderBagSelect();
  applyBagCapacityToEquipmentSlots();
  renderLoadoutPresets();
  $('charMemo').value = currentCharacter.memo || '';
  updateAll();
}
function setReadOnly(readOnly) {
  const ids = ['charName','charGender','charAge','playerKey','newPlayerKey','charMemo','currentHp','currentMp','hpBonus','mpBonus','fatigueLevel','equipmentMemo','bagSelect'];
  for (const id of ids) if ($(id)) $(id).disabled = readOnly;
  for (const stat of STAT_ORDER) if ($('stat_' + stat)) $('stat_' + stat).disabled = readOnly;
  for (const a of ABILITIES) if ($('ability_' + a.key)) $('ability_' + a.key).disabled = readOnly;
  for (const c of SKILL_CATEGORIES) if ($('manualBonus_' + c.key)) $('manualBonus_' + c.key).disabled = readOnly;
  if($('supportEligible'))$('supportEligible').disabled=readOnly;
  for(const el of document.querySelectorAll('[data-support-setting-input],[data-support-skill-mode]'))el.disabled=readOnly;
  for (const key of Object.keys(SKILL_BY_KEY)) {
    if ($('skill_cat_' + key)) $('skill_cat_' + key).disabled = readOnly;
    if ($('skill_free_' + key)) $('skill_free_' + key).disabled = readOnly;
    if ($('skill_other_' + key)) $('skill_other_' + key).disabled = readOnly;
  }
  for (const el of document.querySelectorAll('[data-equipment-input]')) el.disabled = readOnly;
  for (const btn of [$('createHistoryBtn')]) if(btn) btn.disabled=readOnly;
  for (const el of document.querySelectorAll('[data-inventory-input]')) {
    const quiverSlot = el.dataset?.quiverAmmoCount || '';
    const quiverState = quiverSlot ? normalizeQuiverAmmoSlotState(quiverAmmoSlotsState[quiverSlot]) : null;
    el.disabled = readOnly || (!!quiverSlot && !quiverState?.warehouseAllocated);
  }
  for (const btn of document.querySelectorAll('[data-inventory-action]')) btn.disabled = readOnly && btn.dataset.inventoryAction !== 'detail';
  for (const el of document.querySelectorAll('[data-skill-crystal-input]')) el.disabled = readOnly;
  for (const el of document.querySelectorAll('[data-loadout-preset-input],[data-loadout-preset-action]')) el.disabled = readOnly;
  for (const el of document.querySelectorAll('[data-craft-goal-runs],[data-craft-goal-make],[data-craft-goal-reduce],[data-craft-favorite-remove]')) el.disabled = readOnly;
  for (const btn of document.querySelectorAll('[data-skill-remove],#addSkillByPublicIdBtn,#clearSkillPublicIdBtn')) btn.disabled = readOnly || (btn.dataset.skillRemove && normalizeSkillGachaState(skillGachaState||{}).equippedSkillIds.includes(btn.dataset.skillRemove));
  if ($('addInventoryItemBtn')) $('addInventoryItemBtn').disabled = readOnly;
  if ($('sortInventoryItemBtn')) $('sortInventoryItemBtn').disabled = readOnly;
  if ($('addInitialWeaponSetBtn')) $('addInitialWeaponSetBtn').disabled = readOnly;
  const editOnly = ['saveBtn','rollBtn'];
  for (const id of editOnly) if ($(id)) $(id).disabled = readOnly;
  if($('autoSaveToggle')) $('autoSaveToggle').disabled=readOnly;
  for (const btn of document.querySelectorAll('[data-reroll-ability]')) btn.disabled = readOnly;
  updateEquipmentHandLocks(false);
  $('toggleViewEditBtn').style.display = readOnly ? '' : 'none';
}
function setView(name) {
  const target = $(name + 'View');
  if (!target) {
    console.error('画面IDが見つかりません:', name + 'View');
    showToast('画面切替に失敗しました。', 'error');
    return false;
  }
  for (const v of document.querySelectorAll('.view')) {
    const active = v === target;
    v.classList.toggle('active', active);
    // class反映が遅れる/壊れる環境でも確実に切り替えるため、displayも直接同期する。
    v.style.display = active ? 'block' : 'none';
  }
  document.body.classList.toggle('editor-active', name === 'editor');
  return true;
}
function storageLabel() { return 'クラウド保存'; }
function prepareListView() {
  $('listTitle').textContent = 'クラウド保存：作成リスト';
  $('listSub').textContent = 'プレイヤーキーに紐づくキャラクターだけを表示します。';
  if ($('characterList')) $('characterList').innerHTML = '';
  if ($('listStatus')) {
    $('listStatus').className = 'status-box';
    $('listStatus').textContent = 'クラウドの作成リストを読み込み中です。';
  }
  setView('list');
}
async function openList() {
  prepareListView();
  await refreshList();
}
async function startCloudList(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); if (event.stopImmediatePropagation) event.stopImmediatePropagation(); }
  const btn = $('chooseCloudBtn');
  try {
    setGasUrl(gasUrl());
    currentCloudPlayerKey = ($('cloudPlayerKeyInput')?.value || '').trim();
    if (!gasUrl()) { $('homeStatus').className = 'status-box error'; $('homeStatus').textContent = '固定クラウド接続先が未設定です。'; showToast('固定クラウド接続先が未設定です。', 'error'); return false; }
    if (!currentCloudPlayerKey) { $('homeStatus').className = 'status-box error'; $('homeStatus').textContent = '作成リストの表示にはプレイヤーキーが必要です。'; showToast('プレイヤーキーを入力してください。', 'error'); return false; }
    if (btn) btn.disabled = true;
    if ($('homeStatus')) { $('homeStatus').className = 'status-box'; $('homeStatus').textContent = 'クラウドの作成リストへ移動します。'; }
    prepareListView();
    await refreshList();
  } catch (e) {
    prepareListView();
    $('listStatus').className = 'status-box error';
    $('listStatus').textContent = e.message || 'クラウド作成リストへの移行に失敗しました。';
    showToast($('listStatus').textContent, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
  return false;
}
function openEditor(mode, data=null) {
  autoSaveReady=false;
  clearAutoSaveTimer();
  currentMode = mode;
  if(mode==='new'){ cloudCharacterRevision=0; cloudCharacterRowHint=0; cloudCharacterFolderReady=false; characterLastHistoryAt=0; }
  applyData(data || emptyCharacter());
  const publicShareView = mode === 'view' && typeof isPublicViewMode === 'function' && isPublicViewMode();
  const title = mode === 'new' ? '新規作成' : mode === 'view' ? (publicShareView ? '共有キャラクター閲覧' : 'キャラクター閲覧') : 'キャラクター編集';
  $('editorTitle').textContent = title;
  $('editorSub').textContent = `${storageLabel()} / ID: ${currentCharacter.id}`;
  setReadOnly(mode === 'view');
  $('editorStatus').className = 'status-box';
  $('editorStatus').textContent = mode === 'view'
    ? (publicShareView ? '共有用の閲覧ページです。キャラクターシート内容を、倉庫一覧を除いて表示します。' : '閲覧モードです。編集する場合は「編集に切替」を押してください。')
    : (autoSaveEnabled ? '編集中です。変更は自動保存されます。' : '編集中です。自動保存はOFFです。');
  setActionBarCollapsed(false);
  showEditorTab('ability');
  setView('editor');
  setCharacterSheetMasterSourceStatus(lastCharacterSheetMasterResult, {loading:!lastCharacterSheetMasterResult});
  initializeAutoSaveForEditor(mode);
  scheduleInitialInventorySyncForEditor(mode);
}



function setActionBarCollapsed(collapsed=true) {
  const bar = $('editorActionBar');
  const btn = $('actionBarToggleBtn');
  if (!bar) return;
  bar.classList.toggle('collapsed', !!collapsed);
  if (btn) {
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    btn.textContent = collapsed ? '操作を開く' : '操作を閉じる';
  }
}

function boolLike(value) {
  const s = String(value ?? '').trim().toUpperCase();
  return s === 'TRUE' || s === '1' || s === 'YES' || s === 'Y' || s === '両手' || s === '有効';
}
function enabledLike(value) {
  const s = String(value ?? '').trim().toUpperCase();
  return s !== 'FALSE' && s !== '0' && s !== 'NO' && s !== 'N' && s !== '無効';
}

function defaultElementForEquipmentRow(row={}) {
  const explicit = String(row && (row.element || row.attribute || row.attributeType || row.elementName || row['属性'] || row['属性種別'] || row['攻撃属性'] || row['ダメージ属性']) || '').trim();
  if (explicit) return explicit;
  const text = [
    row && row.name,
    row && row.kind,
    row && row.category,
    row && row.itemCategory,
    row && row.equipSlot,
    row && row.slotKind,
    row && row.type
  ].map(v => String(v || '').trim()).filter(Boolean).join(' / ');
  if (!text) return '';
  if (/魔導書|祈祷書|魔印|聖印/.test(text)) return '';
  if (/弓|クロスボウ|クロスボウ|バリスタ/.test(text)) return '矢弾依存';
  if (/盾|大盾/.test(text) && !/剣|斧|槌|杖|槍|弓|クロスボウ|短剣/.test(text)) return '';
  const slotKind = (typeof equipmentSlotKind === 'function') ? equipmentSlotKind(row) : '';
  if (slotKind === 'hand' && /武器|近接|射撃|短剣|剣|斧|槌|杖|槍|鞭|弓|クロスボウ/.test(text)) return '物';
  if (/武器|近接武器|射撃武器/.test(text)) return '物';
  return '';
}

if (typeof window !== 'undefined') window.defaultElementForEquipmentRow = defaultElementForEquipmentRow;
function equipmentSlotKind(row) {
  const explicit = String(row && row.slotKind || '').trim();
  if (['hand','armor','accessory','carry'].includes(explicit)) return explicit;
  const slot = String(row && row.equipSlot || '').trim();
  if (slot.includes('鎧')) return 'armor';
  if (slot.includes('装飾')) return 'accessory';
  if (slot.includes('携' + '行') || slot.includes('所持')) return 'carry';
  if (slot.includes('なし')) return 'none';
  return 'hand';
}
function isTwoHandEquipment(row) {
  const slot = String(row && row.equipSlot || '').trim();
  const cat = String(row && row.itemCategory || '').trim();
  const h = String(row && row.hands || '').trim();
  return slot === '両手' || cat.includes('両手') || h === '2' || h === '両手' || boolLike(row && row.isTwoHand);
}
function uniqueNames(rows, slotKind) {
  const names = rows
    .filter(row => equipmentSlotKind(row) === slotKind && enabledLike(row.enabled))
    .sort((a,b) => Number(a.sortOrder || 9999) - Number(b.sortOrder || 9999))
    .map(row => String(row.name || '').trim())
    .filter(Boolean);
  const result = [];
  for (const name of names) if (!result.includes(name)) result.push(name);
  if (!result.includes('なし')) result.unshift('なし');
  return result;
}

function csItemVisible(row) {
  const s = String(row && row.csVisible !== undefined ? row.csVisible : 'TRUE').trim().toUpperCase();
  return s !== 'FALSE' && s !== '0' && s !== 'NO' && s !== 'N' && s !== '非表示';
}
function csItemKey(row) {
  return String(row && (row.id || row.name) || '').trim();
}
function inventoryItemKey(row) { return csItemKey(row); }
function equipmentCandidateRows() {
  return inventoryDerived().equipmentRows;
}
function findCsItemById(id) {
  const key = String(id || '').trim();
  if (!key) return null;
  return inventoryDerived().equipmentByKey.get(key) || null;
}
function findCsItemIdByName(name) {
  const n = String(name || '').trim();
  if (!n) return '';
  const row = inventoryDerived().equipmentByName.get(n);
  return row ? inventoryItemKey(row) : '';
}
function slotKindForCsItem(row) {
  const kind = normalizeInventoryKind(row && row.kind || 'アイテム');
  const slot = String(row && row.equipSlot || '').trim();
  if (isSpellInventoryItem(row) || kind === '術式' || kind === 'バッグ') return 'none';
  if (kind === '防具' && slot.includes('鎧')) return 'armor';
  if (kind === '装飾品' || slot.includes('装飾')) return 'accessory';
  if (slot.includes('携' + '行') || slot.includes('所持') || ['アイテム','素材','バッグ','重要品','その他'].includes(kind)) return 'carry';
  if (kind === '武器' || kind === '防具') return 'hand';
  return 'none';
}
function isTwoHandCsItem(row) {
  return String(row && row.equipSlot || '').trim() === '両手';
}
function itemMatchesEquipmentSlot(row, slot) {
  if (!row || !slot) return false;
  const kind = slotKindForCsItem(row);
  if (slot.kind === 'hand') return kind === 'hand';
  return kind === slot.kind;
}
function applyCsItemMaster(rows, {save=false, silent=false}={}) {
  // v50: 装備・所持品の候補はDBアイテムではなくキャラクターの倉庫から生成する。
  CS_ITEM_MASTER = [];
  if (save) localStorage.removeItem(CS_ITEM_CACHE_KEY);
  refreshEquipmentItemSelects();
  return true;
}
function loadCachedCsItems() { /* v50: 倉庫を候補にするためDBアイテム候補キャッシュは使いません。 */ }

function duplicateRestrictedEquipmentIdentity(row={}){
  const kind=normalizeInventoryKind(row.kind||row.itemType||row.itemCategory||row.category||'');
  const name=String(row.name||'').trim().normalize('NFKC');

  // 装飾品の既存「同一品2個同時装備不可」は維持する。
  if(kind==='装飾品'){
    const master=String(row.masterId||'').trim();
    const publicId=String(row.publicId||'').trim().toUpperCase();
    const fallbackId=String(row.id||'').trim();
    const identity=master||publicId||name||fallbackId;
    return identity?`装飾品:${identity}`:'';
  }

  // 左右手の制限対象は片手装備だけ。両手装備は既存の両手ロックで処理する。
  if(slotKindForCsItem(row)!=='hand'||isTwoHandCsItem(row))return '';

  if(isAntiqueIndividualItem(row)){
    // 骨董は個体名ではなく武器種/盾種単位。同じカテゴリの骨董を左右へ2つ持てない。
    const category=String(normalizeEquipmentType(row.itemCategory||row.category||row.type||'')).trim().normalize('NFKC');
    return category?`手装備:骨董:${category}`:(name?`手装備:骨董:${name}`:'');
  }

  // 通常の片手武器・盾は「同名」だけ禁止。別名の同武器種は左右同時装備可。
  return name?`手装備:通常:${name}`:'';
}
function duplicateRestrictedEquipmentMessage(row={},otherSlot=null){
  const name=String(row?.name||'').trim()||'名称未設定';
  if(slotKindForCsItem(row)==='hand'){
    if(isAntiqueIndividualItem(row)){
      const category=String(normalizeEquipmentType(row.itemCategory||row.category||row.type||'')).trim()||'同武器種';
      return `骨董装備は同じ武器種・盾種「${category}」を右手・左手へ同時に装備できません。`;
    }
    return `同名の片手武器・盾「${name}」は右手・左手へ同時に装備できません。`;
  }
  return `同じ装飾品「${name}」は2つ同時に装備できません。`;
}
function duplicateRestrictedEquipmentOtherSlot(slotKey='',row={}){
  const key=duplicateRestrictedEquipmentIdentity(row);
  if(!key)return null;
  for(const slot of BASE_EQUIPMENT_SLOTS){
    if(slot.key===slotKey)continue;
    const selectedKey=String($('equip_'+slot.key+'_itemSelect')?.value||'').trim();
    if(!selectedKey)continue;
    const selected=findCsItemById(selectedKey);
    if(selected&&duplicateRestrictedEquipmentIdentity(selected)===key)return slot;
  }
  return null;
}
function enforceUniqueWeaponAccessoryEquipment({notify=false}={}){
  const seen=new Map(), cleared=[];
  for(const slot of BASE_EQUIPMENT_SLOTS){
    const select=$('equip_'+slot.key+'_itemSelect');
    const selectedKey=String(select?.value||'').trim();
    if(!selectedKey)continue;
    const row=findCsItemById(selectedKey);
    const key=row?duplicateRestrictedEquipmentIdentity(row):'';
    if(!key)continue;
    if(seen.has(key)){
      cleared.push({slot,row,first:seen.get(key)});
      if(select){select.value='';select.dataset.previousItemKey='';}
      clearEquipmentSlotFields(slot.key,{keepSelection:true});
      if(typeof window.raSyncEquipmentPickerTrigger==='function'&&select)window.raSyncEquipmentPickerTrigger(select);
      continue;
    }
    seen.set(key,slot);
  }
  if(cleared.length&&notify){
    showToast('左右手の装備制限、または同一装飾品の制限により、重複分を外しました。','warn');
  }
  return cleared;
}

function refreshEquipmentItemSelects({slotKinds=null,slotKeys=null}={}) {
  const cache=inventoryDerived();
  const allowed=slotKinds ? new Set(Array.isArray(slotKinds)?slotKinds:[slotKinds]) : null;
  const allowedKeys=slotKeys ? new Set(Array.isArray(slotKeys)?slotKeys:[slotKeys]) : null;
  for (const slot of EQUIPMENT_SLOTS) {
    if(allowed && !allowed.has(slot.kind))continue;
    if(allowedKeys && !allowedKeys.has(slot.key))continue;
    const select = $('equip_' + slot.key + '_itemSelect');
    if (!select) continue;
    const current = select.value || '';
    const items = cache.equipmentBySlotKind[slot.kind] || [];
    const nameCounts=new Map();
    for(const item of items){const n=String(item.name||'').trim();if(n)nameCounts.set(n,(nameCounts.get(n)||0)+1);}
    const options = [`<option value="">${slot.kind === 'carry' ? '未選択（倉庫へ戻す）' : '未選択'}</option>`].concat(items.map(row => {
      const key = inventoryItemKey(row);
      const duplicateSlot = slot.kind!=='carry' ? duplicateRestrictedEquipmentOtherSlot(slot.key,row) : null;
      const multi=(nameCounts.get(String(row.name||'').trim())||0)>1;const individual=isAntiqueIndividualItem(row)||multi;const instance=individual?inventoryIndividualShortId(row):'';const individualStats=individual?[row.power?`威力:${row.power}`:'',row.defense?`防御:${row.defense}`:'',row.guard?`防御行動:${row.guard}`:'',`${isAntiqueIndividualItem(row)?'固定枠':'枠'}:${equipmentUpgradeUsedSlots(parseUpgradeLines(row.upgradeEntries||row.upgradeLines||''))}/${resolvedEquipmentUpgradeLimit(row)||0}`,antiqueIndividualEnhancementSummary(row)].filter(Boolean).join(' / '):'';
      const sourceLabel=slot.kind === 'carry' ? '倉庫:' + row.count : '';
      const label = [row.name,instance,row.kind,row.category,sourceLabel,row.element ? '属性:' + row.element : '',individualStats,duplicateSlot ? `${duplicateSlot.name}に装備中` : ''].filter(Boolean).join(' / ');
      return `<option value="${esc(key)}"${duplicateSlot?' disabled':''}>${esc(label)}</option>`;
    }));
    select.innerHTML = options.join('');
    let fallbackId='';
    if(!current){
      const name=String($('equip_' + slot.key + '_name')?.value || '').trim();
      const fallbackRow=name ? items.find(item=>String(item.name||'').trim()===name) : null;
      fallbackId=fallbackRow ? inventoryItemKey(fallbackRow) : '';
    }
    const nextValue = current || fallbackId;
    select.value = nextValue && Array.from(select.options).some(o=>o.value===nextValue) ? nextValue : '';
    // 候補再描画だけで切替前キーを上書きしない。実際の装備反映後に更新する。
    if(!String(select.dataset.previousItemKey || '').trim()) select.dataset.previousItemKey = select.value || '';
    if (typeof window.raSyncEquipmentPickerTrigger === 'function') {
      window.raSyncEquipmentPickerTrigger(select);
    }
  }
}
function setTypeSelectValue(slotKey, value) {
  const select = $('equip_' + slotKey + '_type');
  if (!select) return;
  const v = normalizeEquipmentType(value || 'なし');
  if (![...select.options].some(o => o.value === v)) {
    select.insertAdjacentHTML('beforeend', `<option value="${esc(v)}">${esc(v)}</option>`);
  }
  select.value = v;
}
function releaseCarryWarehouseAllocation(slotKey, {refresh=false}={}) {
  const allocation = carryWarehouseAllocationState[slotKey] || {};
  if (allocation.warehouseAllocated && allocation.count > 0) {
    adjustWarehouseItemCount(allocation.warehouseItemId, allocation.count);
  }
  carryWarehouseAllocationState[slotKey] = { warehouseAllocated:false, warehouseItemId:'', count:0, maxStack:99 };
  if (refresh) refreshWarehouseQuantityViews({quiver:false});
}
function clearCarrySlotFields(slotKey) {
  const select = $('equip_' + slotKey + '_itemSelect');
  if (select) select.value = '';
  if ($('equip_' + slotKey + '_name')) $('equip_' + slotKey + '_name').value = '';
  setTypeSelectValue(slotKey, 'なし');
  if ($('equip_' + slotKey + '_count')) {
    $('equip_' + slotKey + '_count').value = '1';
    $('equip_' + slotKey + '_count').max = '99';
  }
  if ($('equip_' + slotKey + '_description')) $('equip_' + slotKey + '_description').value = '';
  if ($('equip_' + slotKey + '_note')) $('equip_' + slotKey + '_note').value = '';
}
function applyWarehouseItemToCarrySlot(slotKey, row=null) {
  const nextId = row ? inventoryItemKey(row) : '';
  const old = carryWarehouseAllocationState[slotKey] || {};
  if (row && old.warehouseAllocated && old.warehouseItemId === nextId) return;
  releaseCarryWarehouseAllocation(slotKey);
  if (!row) {
    clearCarrySlotFields(slotKey);
    refreshWarehouseQuantityViews({quiver:false});
    updateEquipmentSummaries();
    applyBagCapacityToEquipmentSlots();
    return;
  }
  const available = Number(row.count || 0);
  if (available <= 0) {
    clearCarrySlotFields(slotKey);
    refreshWarehouseQuantityViews({quiver:false});
    showToast('倉庫に残っている個数がありません。', 'warn');
    return;
  }
  const maxStack = inventoryStackLimit(row);
  const count = Math.min(maxStack, available, 99);
  if (!adjustWarehouseItemCount(nextId, -count, row.name)) return;
  carryWarehouseAllocationState[slotKey] = { warehouseAllocated:true, warehouseItemId:nextId, count, maxStack };
  if ($('equip_' + slotKey + '_name')) $('equip_' + slotKey + '_name').value = row.name || '';
  setTypeSelectValue(slotKey, row.category || row.kind || 'なし');
  if ($('equip_' + slotKey + '_count')) {
    $('equip_' + slotKey + '_count').value = String(count);
    $('equip_' + slotKey + '_count').max = String(Math.min(maxStack, 99));
  }
  if ($('equip_' + slotKey + '_description')) $('equip_' + slotKey + '_description').value = row.description || '';
  if ($('equip_' + slotKey + '_note')) $('equip_' + slotKey + '_note').value = row.effect || '';
  refreshWarehouseQuantityViews({quiver:false});
  updateEquipmentSummaries();
  applyBagCapacityToEquipmentSlots();
}
function updateCarryWarehouseAllocationCount(slotKey, rawValue) {
  const allocation = carryWarehouseAllocationState[slotKey] || {};
  if (!allocation.warehouseAllocated) return;
  const warehouse = warehouseItemByKey(allocation.warehouseItemId);
  const available = Number(warehouse?.count || 0);
  const desired = clampInt(rawValue || 1, 1, Math.min(allocation.maxStack || 99, 99));
  const allowed = Math.min(desired, Number(allocation.count || 0) + available);
  const delta = allowed - Number(allocation.count || 0);
  if (delta > 0) adjustWarehouseItemCount(allocation.warehouseItemId, -delta);
  if (delta < 0) adjustWarehouseItemCount(allocation.warehouseItemId, -delta);
  carryWarehouseAllocationState[slotKey] = { ...allocation, count:allowed };
  const input = $('equip_' + slotKey + '_count');
  if (input) input.value = String(allowed);
  if (allowed !== desired) showToast(`倉庫在庫の範囲で${allowed}個に調整しました。`, 'warn');
  refreshWarehouseQuantityViews({quiver:false});
  updateEquipmentSummaries();
  applyBagCapacityToEquipmentSlots();
}
function applyCsItemToEquipmentSlot(slotKey) {
  const select = $('equip_' + slotKey + '_itemSelect');
  const previousItemKey = String(select?.dataset.previousItemKey || '').trim();
  const nextItemKey = String(select?.value || '').trim();
  const row = findCsItemById(nextItemKey);
  if(row&&!isCarrySlotKey(slotKey)){
    const duplicateSlot=duplicateRestrictedEquipmentOtherSlot(slotKey,row);
    if(duplicateSlot){
      if(select){
        select.value=previousItemKey&&Array.from(select.options).some(o=>o.value===previousItemKey)?previousItemKey:'';
        if(typeof window.raSyncEquipmentPickerTrigger==='function')window.raSyncEquipmentPickerTrigger(select);
      }
      showToast(duplicateRestrictedEquipmentMessage(row,duplicateSlot),'warn');
      const slotKind=EQUIPMENT_SLOTS.find(v=>v.key===slotKey)?.kind;
      if(slotKind)refreshEquipmentItemSelects({slotKinds:[slotKind]});
      return;
    }
  }
  if (previousItemKey && previousItemKey !== nextItemKey) {
    syncEquipmentModifiersToInventoryItem(slotKey, previousItemKey);
    syncEquipmentUpgradeToInventoryItem(slotKey, previousItemKey);
    syncEquippedSpellSetToInventoryItem(slotKey, previousItemKey);
  }
  if (isCarrySlotKey(slotKey)) {
    if (row && isSpellInventoryItem(row)) {
      if (select) select.value = '';
      showToast('所持品には術式を直接選択できません。魔導書/祈祷書などの術式枠から選択してください。', 'warn');
      return;
    }
    applyWarehouseItemToCarrySlot(slotKey, row);
    updateSummary();
    return;
  }
  if (!row) {
    // 倉庫装備を外したときは、旧武器の表示値・補正値・強化内容を装備枠へ残さない。
    // 装備枠の表示値は倉庫で選択した装備からのみ読み込む。
    if (previousItemKey) clearEquipmentSlotFields(slotKey, {keepSelection:true});
    if(select) select.dataset.previousItemKey='';
    const emptiedSlot=EQUIPMENT_SLOTS.find(v=>v.key===slotKey);
    if(emptiedSlot&&['hand','accessory'].includes(emptiedSlot.kind))refreshEquipmentItemSelects({slotKinds:[emptiedSlot.kind]});
    updateEquipmentHandLocks(true);
    updateCombatStats();
    updateSpellSlotHints();
    updateEquipmentSummaries();
    updateSummary();
    return;
  }
  const typeValue = row.category || row.kind || 'なし';
  if ($('equip_' + slotKey + '_name')) $('equip_' + slotKey + '_name').value = row.name || '';
  setTypeSelectValue(slotKey, typeValue);
  if ($('equip_' + slotKey + '_count')) $('equip_' + slotKey + '_count').value = Math.min(Number(row.count) || 1, 99);
  // 切替前装備の表示値を先に完全クリアし、選択した装備個体の値だけを読み込む。
  for (const suffix of ['element','power','offhand','reloadTurns','target','upgradeLimit','upgradeLines']) {
    const el = $('equip_' + slotKey + '_' + suffix);
    if (el) el.value = '';
  }
  renderEquipmentUpgradeSlots(slotKey, []);
  const map = { element:'element', power:'power', offhand:'offhand', reloadTurns:'reloadTurns', target:'target', upgradeLimit:'upgradeLimit' };
  const selectedItemFallbacks = {};
  for (const [suffix, field] of Object.entries(map)) {
    const el = $('equip_' + slotKey + '_' + suffix);
    if (!el) continue;
    const value = field==='upgradeLimit' ? resolvedEquipmentUpgradeLimit(row) : row[field];
    el.value = value !== undefined && value !== null && String(value).trim() !== '' ? value : (selectedItemFallbacks[field] || '');
  }
  const usageSkillEl=$('equip_' + slotKey + '_checkType');
  if(usageSkillEl) usageSkillEl.value = (!['盾','大盾'].includes(typeValue)) ? canonicalWeaponUsageSkill(row) : '';
  const restoredModifiers = serializeModifierRows(equipmentModifierRows(row));
  if ($('equip_' + slotKey + '_modifiers')) $('equip_' + slotKey + '_modifiers').value = restoredModifiers;
  renderModifierReadOnly('equip_' + slotKey + '_modifierRows', restoredModifiers);
  renderEquipmentUpgradeSlots(slotKey, row.upgradeEntries || row.upgradeLines || []);
  const description = row.description || '';
  const effectText = row.effect || '';
  if ($('equip_' + slotKey + '_description')) $('equip_' + slotKey + '_description').value = description;
  if ($('equip_' + slotKey + '_note')) $('equip_' + slotKey + '_note').value = effectText;
  if (!spellContainerKind(typeValue)) {
    if ($('equip_' + slotKey + '_knownSpells')) $('equip_' + slotKey + '_knownSpells').value = '';
    setSpellSelectValues(slotKey, []);
  } else {
    setSpellSelectValues(slotKey, row.setSpells || '');
    refreshSpellSetSelect(slotKey, spellContainerKind(typeValue));
  }
  if (select) select.dataset.previousItemKey = select.value || '';
  const equippedSlot=EQUIPMENT_SLOTS.find(v=>v.key===slotKey);
  if(equippedSlot&&['hand','accessory'].includes(equippedSlot.kind))refreshEquipmentItemSelects({slotKinds:[equippedSlot.kind]});
  updateEquipmentHandLocks(true);
  // 装備変更は回避などの技能「その他」にも影響するため、派生値をまとめて更新する。
  updateAll();
}
function selectedCsItemIsTwoHand(slotKey) {
  const row = findCsItemById($('equip_' + slotKey + '_itemSelect')?.value || '');
  return !!(row && isTwoHandCsItem(row));
}

function applyEquipmentCategoryMaster(rows, {save=false, silent=false, meta=null, auto=false}={}) {
  if (!Array.isArray(rows) || !rows.length) return false;
  const active = rows.filter(row => row && row.name && enabledLike(row.enabled));
  if (!active.length) return false;
  DB_EQUIPMENT_CATEGORY_MASTER=active.map(row=>({...row,intrinsicEffects:parseEquipmentEffects(row.intrinsicEffects)}));
  const namesByKind = {
    hand: uniqueNames(active, 'hand'),
    armor: uniqueNames(active, 'armor'),
    accessory: uniqueNames(active, 'accessory'),
    carry: uniqueNames(active, 'carry')
  };
  for (const slot of EQUIPMENT_SLOTS) {
    if (namesByKind[slot.kind] && namesByKind[slot.kind].length) slot.typeOptions = namesByKind[slot.kind];
  }
  TWO_HAND_TYPES.clear();
  for (const row of active) {
    const name = String(row.name || '').trim();
    if (!name || name === 'なし') continue;
    EQUIPMENT_PRESETS[name] = {
      element: row.element || defaultElementForEquipmentRow(row),
      power: row.power || '',
      offhand: row.offhandBonus || '',
      reloadTurns: row.reloadTurns || '',
      modifiers: migratedModifierTextForItem(row),
      description: row.description || row['fla' + 'vor' + 'Text'] || '',
      note: row.effect || ''
    };
    if (isTwoHandEquipment(row)) TWO_HAND_TYPES.add(name);
  }
  const cacheMeta = { ...(meta || buildEquipmentCategoryLocalMeta(active)), scopeKey: equipmentScopeKey() };
  if (save) {
    localStorage.setItem(EQUIPMENT_CATEGORY_CACHE_KEY, JSON.stringify({ rows: active, meta: cacheMeta }));
    localStorage.setItem(EQUIPMENT_CATEGORY_CACHE_META_KEY, JSON.stringify(cacheMeta));
  }
  refreshEquipmentTypeSelects();
  const status = $('equipmentCategoryStatus');
  if (status) {
    const suffix = auto ? ' / 自動更新済み' : '';
    status.textContent = `倉庫から選択カテゴリ：${active.length}件反映済み${suffix}`;
  }
  if (!silent) showToast(auto ? `倉庫から選択カテゴリを自動更新しました（${active.length}件）` : `倉庫から選択カテゴリを反映しました（${active.length}件）`, 'ok');
  return true;
}
function refreshEquipmentTypeSelects() {
  for (const slot of EQUIPMENT_SLOTS) {
    const select = $('equip_' + slot.key + '_type');
    if (!select) continue;
    const current = normalizeEquipmentType(select.value || 'なし');
    select.innerHTML = slot.typeOptions.map(op => `<option value="${esc(op)}">${esc(op)}</option>`).join('');
    select.value = slot.typeOptions.includes(current) ? current : 'なし';
  }
  updateEquipmentHandLocks(false);
  updateCombatStats();
}

function buildEquipmentCategoryLocalMeta(rows) {
  const compact = (rows || []).map(row => ({
    id: row.id || '', name: row.name || '', itemCategory: row.itemCategory || '', equipSlot: row.equipSlot || '',
    skill: row.skill || '', power: row.power || '', offhandBonus: row.offhandBonus || '', reloadTurns: row.reloadTurns || '', modifiers: row.modifiers || '',
    description: row.description || row['fla' + 'vor' + 'Text'] || '', effect: row.effect || '', sortOrder: row.sortOrder || '', enabled: row.enabled || ''
  }));
  return { hash: simpleHash(JSON.stringify(compact)), count: rows.length, generatedAt: nowIso(), source: 'local', scopeKey: equipmentScopeKey() };
}
function simpleHash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  return String(h >>> 0);
}
function readCachedEquipmentCategoryPayload() {
  try {
    const raw = localStorage.getItem(EQUIPMENT_CATEGORY_CACHE_KEY);
    if (!raw) return { rows: [], meta: null };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const meta = JSON.parse(localStorage.getItem(EQUIPMENT_CATEGORY_CACHE_META_KEY) || 'null');
      return { rows: parsed, meta };
    }
    const meta = parsed.meta || JSON.parse(localStorage.getItem(EQUIPMENT_CATEGORY_CACHE_META_KEY) || 'null');
    return { rows: parsed.rows || [], meta };
  } catch (e) {
    localStorage.removeItem(EQUIPMENT_CATEGORY_CACHE_KEY);
    localStorage.removeItem(EQUIPMENT_CATEGORY_CACHE_META_KEY);
    return { rows: [], meta: null };
  }
}

function loadCachedEquipmentCategories() {
  const cached = readCachedEquipmentCategoryPayload();
  if (!Array.isArray(cached.rows) || !cached.rows.length) return false;
  try {
    return applyEquipmentCategoryMaster(cached.rows, {silent:true, meta:cached.meta});
  } catch (e) {
    // 旧版・破損キャッシュが初期化そのものを止めないよう破棄して続行する。
    try { localStorage.removeItem(EQUIPMENT_CATEGORY_CACHE_KEY); } catch (_) {}
    try { localStorage.removeItem(EQUIPMENT_CATEGORY_CACHE_META_KEY); } catch (_) {}
    console.warn('装備カテゴリのキャッシュ反映に失敗したため破棄しました。', e);
    return false;
  }
}
async function loadEquipmentCategoriesFromDb({silent=false, auto=false, force=false}={}) {
  const res = await loadCharacterSheetMasterWithFallback({force});
  setDbCharacterSheetMaster(res || {});
  const rows = res.equipment_categories || [];
  if (!rows.length) throw new Error('共通DBとGASの装備カテゴリが空です。');
  applyEquipmentCategoryMaster(rows, {save:true, silent:true, auto, meta:res.equipment_categories_meta || res.meta});
  applyCsItemMaster(res.cs_items || [], {save:true, silent:true});
  const sourceLabel = characterSheetMasterSourceLabel(res);
  const status = $('equipmentCategoryStatus');
  if (status) {
    status.textContent =
      `${sourceLabel}${auto ? ' / 自動更新済み' : ''}` +
      `${res.__source === 'gas' && res.__githubError ? ' / GitHub取得失敗のため切替' : ''}`;
  }
  if (!silent) {
    showToast(
      res.__source === 'github'
        ? 'GitHub共通DBを再読込しました。'
        : 'GitHub共通DBを取得できなかったためGASから読み込みました。',
      res.__source === 'github' ? 'ok' : 'warn'
    );
  }
  return {
    rows,
    items: res.cs_items || [],
    meta: res.equipment_categories_meta || res.meta || null,
    source: res.__source || ''
  };
}
async function autoSyncEquipmentCategoriesFromDb() {
  const status = $('equipmentCategoryStatus');
  try {
    if (status) status.textContent = 'GitHub共通DBを確認中…';
    await loadEquipmentCategoriesFromDb({silent:true, auto:true});
  } catch (e) {
    if (status) status.textContent = '共通DBとGASの自動確認に失敗：' + e.message;
  }
}


async function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ja-JP');
}

function getOutputPayload(kind, data=outputTargetData || collectData(false)) {
  if (kind === 'token') {
    return { text: generateTokenExport(data), label: '駒出力' };
  }
  return { text: generatePaletteExport(data), label: 'チャットパレット' };
}
function setOutputStatus(message, ok=true) {
  const box = $('outputCopyStatus');
  if (box) {
    box.className = 'status-box ' + (ok ? 'ok' : 'error');
    box.textContent = message;
  }
  showToast(message, ok ? 'ok' : 'error');
}
let characterCopyToastTimer=null;
function showCharacterCopyToast(label='内容'){const el=document.getElementById('copyToast');if(!el)return;const clean=String(label||'内容').replace(/\s+/g,' ').replace(/をコピー(?:しました)?$/,'').replace(/コピー$/,'').trim()||'内容';el.textContent=`${clean}をコピーしました`;el.classList.add('show');clearTimeout(characterCopyToastTimer);characterCopyToastTimer=setTimeout(()=>el.classList.remove('show'),1800);}
function characterCopyActiveLabel(){const b=document.activeElement;return String(b?.dataset?.copyLabel||b?.textContent||'内容').trim();}
async function copyTextDirect(text) {
  const value = String(text ?? '');
  // Clipboard API は、GAS通信などの await 後にユーザー操作権限や
  // document focus を失って失敗することがある。失敗時は旧方式へ即フォールバックする。
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch (e) {
      console.warn('navigator.clipboard.writeText failed; falling back to execCommand copy.', e);
    }
  }

  const ta = document.createElement('textarea');
  const previousFocus = document.activeElement;
  ta.value = value;
  ta.setAttribute('readonly', '');
  ta.setAttribute('aria-hidden', 'true');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.style.top = '0';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  let ok = false;
  try {
    ta.focus({ preventScroll: true });
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    ok = document.execCommand('copy');
  } finally {
    ta.remove();
    try {
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll: true });
    } catch (_) {}
  }
  if (!ok) throw new Error('クリップボードへのコピーに失敗しました。画面を選択してからもう一度お試しください。');
}
async function copyOutput(kind, data=outputTargetData || collectData(false)) {
  const payload = getOutputPayload(kind, data);
  try {
    await copyTextDirect(payload.text);
    const message = `${payload.label}をコピーしました。`;
    setOutputStatus(message, true);
    const dlg = $('outputDialog');
    if (dlg?.open) dlg.close();
    outputTargetData = null;
  } catch (e) {
    setOutputStatus('コピーに失敗しました。ブラウザのクリップボード権限を確認してください。', false);
  }
}
function openOutputDialog(data=collectData(false)) {
  outputTargetData = data;
  setOutputStatus('出力種別を選択してください。', true);
  const dlg = $('outputDialog');
  if (dlg && dlg.showModal) dlg.showModal();
  else alert('このブラウザでは出力ダイアログを開けません。');
}
async function copySummary() {
  const text = makeSummary();
  try { await copyTextDirect(text); $('editorStatus').className = 'status-box ok'; $('editorStatus').textContent = 'サマリーをコピーしました。'; showToast('サマリーをコピーしました。', 'ok'); }
  catch { $('editorStatus').className = 'status-box warn'; $('editorStatus').textContent = 'コピーに失敗しました。'; showToast('コピーに失敗しました。', 'warn'); }
}


async function copyShareData() {
  const data = collectData(true);
  if (!data.name) {
    $('editorStatus').className = 'status-box error';
    $('editorStatus').textContent = '共有URLを発行する前にキャラクター名を入力してください。';
    return;
  }
  try {
    // 共有URLはクラウド保存済みデータをGASの閲覧ページで開く形式。
    const auth = getCloudAuth();
    if (!auth.playerKey && !auth.newPlayerKey) throw new Error('共有URLの発行にはプレイヤーキーが必要です。');
    await cloudRequest('save', { data: stripRuntimeOnlyData(data), playerKey: auth.playerKey, newPlayerKey: auth.newPlayerKey });
    if (auth.newPlayerKey) {
      currentCloudPlayerKey = auth.newPlayerKey;
      if ($('playerKey')) $('playerKey').value = auth.newPlayerKey;
      if ($('newPlayerKey')) $('newPlayerKey').value = '';
      if ($('cloudPlayerKeyInput')) $('cloudPlayerKeyInput').value = auth.newPlayerKey;
    }
    const url = buildShareUrl(data.id);
    await copyTextDirect(url);
    currentCharacter = data;
    $('editorStatus').className = 'status-box ok';
    $('editorStatus').textContent = '共有用の閲覧URLをコピーしました。共有先ではキャラクターシート内容を倉庫一覧を除いて表示します。';
    showToast('共有URLをコピーしました（倉庫一覧は非公開）。', 'ok');
  } catch (e) {
    $('editorStatus').className = 'status-box error';
    $('editorStatus').textContent = e.message || '共有URLの発行に失敗しました。';
    showToast($('editorStatus').textContent, 'error');
  }
}

async function copyShareUrlForListItem(id) {
  try {
    const url = buildShareUrl(id);
    await copyTextDirect(url);
    showToast('共有URLをコピーしました。', 'ok');
    $('listStatus').className = 'status-box ok';
    $('listStatus').textContent = '共有URLをクリップボードにコピーしました。';
  } catch (e) {
    $('listStatus').className = 'status-box error';
    $('listStatus').textContent = e.message;
    showToast(e.message, 'error');
  }
}

async function onSave() {
  clearAutoSaveTimer();
  setManualSaveBusy(true);
  setCharacterSpecialSaveStatus('保存中…',{automatic:false});
  try{
    // 自動保存が先に走っている場合は、その通信が終わってから最新画面をフル保存する。
    // 待機中・送信中に入った編集もcollectData()時点と追送キューで取り込む。
    await waitForAutoSaveIdle();
    clearAutoSaveTimer();
    await saveCharacterNow({automatic:false,force:true});
  }finally{
    setManualSaveBusy(false);
  }
}

function bindEvents() {
  try { localStorage.removeItem(APP_NAME + '.master.adminKey'); } catch(e) {}
  try { setGasUrl(gasUrl()); } catch(e) {}
  if ($('loadEquipmentCategoriesBtn')) $('loadEquipmentCategoriesBtn').addEventListener('click', async () => { try { await loadEquipmentCategoriesFromDb({force:true}); } catch (e) { showToast(e.message, 'error'); const st=$('equipmentCategoryStatus'); if(st) st.textContent=e.message; } });
  if($('saveEquipmentPresetBtn'))$('saveEquipmentPresetBtn').addEventListener('click',()=>openLoadoutPresetDialog('create','equipment'));
  if($('saveCarryPresetBtn'))$('saveCarryPresetBtn').addEventListener('click',()=>openLoadoutPresetDialog('create','carry'));
  if($('loadoutPresetDialogPrimaryBtn'))$('loadoutPresetDialogPrimaryBtn').addEventListener('click',handleLoadoutPresetDialogPrimary);
  if($('loadoutPresetDialogCloseBtn'))$('loadoutPresetDialogCloseBtn').addEventListener('click',closeLoadoutPresetDialog);
  if($('loadoutPresetDialog')){
    $('loadoutPresetDialog').addEventListener('click',e=>{if(e.target===$('loadoutPresetDialog'))closeLoadoutPresetDialog();});
    $('loadoutPresetDialog').addEventListener('close',()=>{loadoutPresetDialogContext={mode:'',type:'equipment',id:''};});
  }
  document.addEventListener('click',e=>{const btn=e.target.closest?.('[data-loadout-preset-action]');if(!btn||['save-equipment','save-carry'].includes(btn.dataset.loadoutPresetAction||''))return;const type=btn.dataset.presetType||'',id=btn.dataset.presetId||'',action=btn.dataset.loadoutPresetAction||'';if(['apply','overwrite','delete'].includes(action))openLoadoutPresetDialog(action,type,id);});
  $('chooseCloudBtn').addEventListener('click', startCloudList);
  $('backHomeBtn').addEventListener('click', () => setView('home'));
  $('changeCloudKeyBtn').addEventListener('click', async () => {
    const next = prompt('表示するクラウドキャラクターのプレイヤーキーを入力してください。', currentCloudPlayerKey || '') || '';
    if (!next.trim()) { showToast('プレイヤーキーが未入力です。', 'warn'); return; }
    currentCloudPlayerKey = next.trim();
    if ($('cloudPlayerKeyInput')) $('cloudPlayerKeyInput').value = currentCloudPlayerKey;
    await refreshList();
    showToast('プレイヤーキーを変更しました。', 'ok');
  });
  $('refreshListBtn').addEventListener('click', refreshList);
  $('newCharacterBtn').addEventListener('click', () => openEditor('new', emptyCharacter()));
  $('backListBtn').addEventListener('click', async () => {
    const canLeave=await flushAutoSaveBeforeLeave();
    if(!canLeave)return;
    autoSaveReady=false;
    clearAutoSaveTimer();
    setView('list');
    refreshList();
  });
  $('toggleViewEditBtn').addEventListener('click', () => {
    currentMode='edit';
    setReadOnly(false);
    $('editorTitle').textContent='キャラクター編集';
    $('editorStatus').className='status-box';
    $('editorStatus').textContent=autoSaveEnabled?'編集モードに切り替えました。変更は自動保存されます。':'編集モードに切り替えました。自動保存はOFFです。';
    initializeAutoSaveForEditor('edit');
    showToast('編集モードに切り替えました。','ok');
    scheduleInitialInventorySyncForEditor('edit');
  });
  $('saveBtn').addEventListener('click', onSave);
  if($('autoSaveToggle')) $('autoSaveToggle').addEventListener('change', async e => {
    await setAutoSaveEnabled(!!e.target.checked);
    if($('editorStatus') && currentMode!=='view'){
      $('editorStatus').className='status-box';
      $('editorStatus').textContent=autoSaveEnabled
        ? '編集中です。このキャラクターは自動保存ONです。'
        : '編集中です。このキャラクターは自動保存OFFです。';
    }
  });
  $('rollBtn').addEventListener('click', rollAllConvertedAbilities);
  $('abilityOutput').addEventListener('click', e => { const btn = e.target.closest('[data-reroll-ability]'); if (!btn) return; rerollOneAbility(btn.dataset.rerollAbility); });
  $('outputBtn').addEventListener('click', () => openOutputDialog(collectData(false)));
  $('shareBtn').addEventListener('click', copyShareData);
  $('actionBarToggleBtn').addEventListener('click', () => setActionBarCollapsed(!$('editorActionBar').classList.contains('collapsed')));

  
document.querySelectorAll('[data-craft-list-view]').forEach(btn=>btn.addEventListener('click',()=>{craftListView=btn.dataset.craftListView==='favorites'?'favorites':'goals';renderCraftLists();}));
$('craftListArea')?.addEventListener('click',async e=>{const favOpen=e.target.closest('[data-craft-favorite-open]');if(favOpen){openCraftCreateDialog(Number(favOpen.dataset.craftFavoriteOpen));return;}const favRemove=e.target.closest('[data-craft-favorite-remove]');if(favRemove){const i=Number(favRemove.dataset.craftFavoriteRemove),entry=craftListsState.favorites[i];if(entry&&window.confirm(`「${craftResolvedEntry(entry).resultName}」をお気に入りから削除しますか？`)){craftListsState.favorites.splice(i,1);renderCraftLists();autoSaveDraftSoon('craftLists');}return;}const reduce=e.target.closest('[data-craft-goal-reduce]');if(reduce){const i=Number(reduce.dataset.craftGoalReduce),entry=craftListsState.goals[i];if(!entry)return;const current=Math.max(1,Number(entry.targetRuns)||1),value=window.prompt(`減らす作成回数を入力してください。\n現在の残り：${current}回\n全て削除する場合は ${current} を入力してください。`,'1');if(value===null)return;const n=Math.floor(Number(value)||0);if(n<1||n>current){showToast('1～残り回数の範囲で入力してください。','error');return;}entry.targetRuns=current-n;if(entry.targetRuns<=0)craftListsState.goals.splice(i,1);renderCraftLists();autoSaveDraftSoon('craftLists');return;}const make=e.target.closest('[data-craft-goal-make]');if(make){const i=Number(make.dataset.craftGoalMake),entry=craftListsState.goals[i],input=$('craftListArea')?.querySelector(`[data-craft-goal-runs="${i}"]`),runs=Math.max(1,Math.min(Number(entry?.targetRuns)||1,Math.floor(Number(input?.value)||1)));await craftExecute(entry,runs,{goalIndex:i});return;}});
$('craftCreateRuns')?.addEventListener('input',updateCraftCreateDialog);
$('craftCreateCloseBtn')?.addEventListener('click',()=>{$('craftCreateDialog')?.close();craftDialogContext=null;});
$('craftCreateConfirmBtn')?.addEventListener('click',async()=>{if(!craftDialogContext)return;const entry=craftListsState.favorites[craftDialogContext.index],runs=Math.max(1,Math.floor(Number($('craftCreateRuns')?.value)||1));if(await craftExecute(entry,runs)){$('craftCreateDialog')?.close();craftDialogContext=null;}});

document.querySelectorAll('.editor-tab-btn').forEach(btn => btn.addEventListener('click', () => {
  showEditorTab(btn.dataset.editorTab);
  if(btn.dataset.editorTab==='dataMaintenance'){renderIntegrityCheck();refreshCharacterHistory();}
}));
$('runIntegrityCheckBtn')?.addEventListener('click',renderIntegrityCheck);
$('refreshHistoryBtn')?.addEventListener('click',refreshCharacterHistory);
$('createHistoryBtn')?.addEventListener('click',createCharacterHistoryNow);
$('integrityList')?.addEventListener('click',e=>{const b=e.target.closest('[data-integrity-toggle]');if(!b)return;const d=document.querySelector(`[data-integrity-detail="${b.dataset.integrityToggle}"]`);if(d)d.hidden=!d.hidden;});
$('historyList')?.addEventListener('click',e=>{const countBtn=e.target.closest('[data-history-count-restore]');if(countBtn){restoreCharacterInventoryCounts(countBtn.dataset.historyCountRestore);return;}const b=e.target.closest('[data-history-restore]');if(b)restoreCharacterHistory(b.dataset.historyRestore);});
  document.addEventListener('toggle', e => {
    const d=e.target;
    if(!(d instanceof HTMLDetailsElement)) return;
    if(d.matches('#inventoryArea details.inventory-card[data-inventory-stable-key]')){
      inventoryCardOpenState.set(String(d.dataset.inventoryStableKey||''), !!d.open);
      if(d.open && d.hasAttribute('data-inventory-row')) hydrateInventoryCardDetail(d);
    }
  }, true);

  if ($('addSkillByPublicIdBtn')) $('addSkillByPublicIdBtn').addEventListener('click', addSkillByPublicIds);
  if ($('clearSkillPublicIdBtn')) $('clearSkillPublicIdBtn').addEventListener('click',()=>{if($('skillPublicIdInput'))$('skillPublicIdInput').value='';if($('skillPublicIdStatus')){$('skillPublicIdStatus').className='status-box';$('skillPublicIdStatus').textContent='登録IDを入力してください。';}});
  if ($('skillWarehouseSearch')) $('skillWarehouseSearch').addEventListener('input',e=>{skillWarehouseFilter.search=e.target.value||'';renderSkillWarehouse();});
  if ($('skillCategoryTabs')) $('skillCategoryTabs').addEventListener('click',e=>{const b=e.target.closest('[data-skill-category]');if(!b)return;skillWarehouseFilter.category=b.dataset.skillCategory||'全て';if(skillWarehouseFilter.category!=='全て'&&skillWarehouseFilter.category!=='武器専用')skillWarehouseFilter.weaponType='全て';renderSkillWarehouse();});
  if ($('skillWeaponTabs')) $('skillWeaponTabs').addEventListener('click',e=>{const b=e.target.closest('[data-skill-weapon]');if(!b)return;skillWarehouseFilter.weaponType=b.dataset.skillWeapon||'全て';renderSkillWarehouse();});
  if ($('skillCrystalStageSelect')) $('skillCrystalStageSelect').addEventListener('change',e=>{
    const state=normalizeSkillGachaState(skillGachaState||{}),oldSlots=state.crystalSlots,nextSlots=crystalSlotNumber(e.target.value,oldSlots);
    if(nextSlots===oldSlots)return;
    const removed=state.equippedSkillIds.slice(nextSlots).filter(Boolean).length;
    state.crystalSlots=nextSlots;
    state.equippedSkillIds=state.equippedSkillIds.slice(0,nextSlots);
    while(state.equippedSkillIds.length<nextSlots)state.equippedSkillIds.push('');
    skillGachaState=normalizeSkillGachaState(state);
    renderSkillCrystalPanel();updateAll();if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('skillGacha');
    if($('editorStatus')){$('editorStatus').className='status-box ok';$('editorStatus').textContent=`スキルクリスタルを${nextSlots}枠へ変更しました。${removed?`外れたスキル${removed}件はスキル倉庫に残っています。`:''}`;}
  });
  if ($('skillCrystalSlots')) $('skillCrystalSlots').addEventListener('change',e=>{const sel=e.target.closest('[data-skill-crystal-slot]');if(!sel)return;const state=normalizeSkillGachaState(skillGachaState||{}),i=Number(sel.dataset.skillCrystalSlot),old=state.equippedSkillIds[i]||'',next=sel.value||'';if(next&&state.equippedSkillIds.some((v,j)=>j!==i&&v===next)){sel.value=old;if($('editorStatus')){$('editorStatus').className='status-box error';$('editorStatus').textContent='同じスキルを複数枠へ装着できません。';}return;}state.equippedSkillIds[i]=next;skillGachaState=state;renderSkillCrystalPanel();updateAll();if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('skillGacha');});
  if ($('skillWarehouseArea')) $('skillWarehouseArea').addEventListener('click',e=>{const b=e.target.closest('[data-skill-remove]');if(!b)return;removeSkillFromWarehouse(b.dataset.skillRemove||'');});

  $('makeTokenOutputBtn').addEventListener('click', () => copyOutput('token'));
  $('makePaletteOutputBtn').addEventListener('click', () => copyOutput('palette'));
  $('closeOutputDialogBtn').addEventListener('click', () => $('outputDialog').close());
  if ($('addInventoryItemBtn')) $('addInventoryItemBtn').addEventListener('click', () => addInventoryItem());
  if ($('addByPublicIdPasteBtn')) $('addByPublicIdPasteBtn').addEventListener('click', addInventoryByPublicIdPaste);
  if ($('publicIdInput')) $('publicIdInput').addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); addInventoryByPublicIdPaste(); } });
  if ($('clearPublicIdPasteBtn')) $('clearPublicIdPasteBtn').addEventListener('click', () => { if($('publicIdInput')) $('publicIdInput').value=''; if($('publicIdCountInput')) $('publicIdCountInput').value='1'; if($('publicIdPasteStatus')) { $('publicIdPasteStatus').className='status-box'; $('publicIdPasteStatus').textContent='登録IDを入力してください。'; } });
  if ($('addInitialWeaponSetBtn')) $('addInitialWeaponSetBtn').addEventListener('click', addInitialWeaponSet);
  if ($('sortInventoryItemBtn')) $('sortInventoryItemBtn').addEventListener('click', sortInventoryItems);
  if ($('inventorySearchInput')) $('inventorySearchInput').addEventListener('input', e => setInventoryFilter('search', e.target.value || ''));
  if ($('inventoryFormKind')) $('inventoryFormKind').addEventListener('change', updateInventoryFormVisibility);
  if ($('inventoryFormCategory')) $('inventoryFormCategory').addEventListener('input', refreshInventoryFormContextOptions);
  if ($('bagSelect')) $('bagSelect').addEventListener('change', e => { selectedBagId = e.target.value || ''; applyBagCapacityToEquipmentSlots(); updateSummary(); });
  if ($('saveInventoryDialogBtn')) $('saveInventoryDialogBtn').addEventListener('click', saveInventoryDialog);
  if ($('cancelInventoryDialogBtn')) $('cancelInventoryDialogBtn').addEventListener('click', () => $('inventoryDialog')?.close());
  if ($('closeItemDetailViewBtn')) $('closeItemDetailViewBtn').addEventListener('click', () => $('itemDetailViewDialog')?.close());
  if ($('itemDetailViewDialog')) $('itemDetailViewDialog').addEventListener('click', e => { if(e.target===$('itemDetailViewDialog'))$('itemDetailViewDialog').close(); });
  if ($('itemDetailViewDialog')) $('itemDetailViewDialog').addEventListener('click', e => { const learnRecipe=e.target.closest('[data-detail-learn-recipe]');if(learnRecipe){const index=Number(learnRecipe.dataset.detailLearnRecipe);learnRecipeFromInventory(index);inventoryDisplayMode='learned';learnedContentType='recipe';renderInventory({refreshLinked:false});$('itemDetailViewDialog')?.close();return;}const learnScroll=e.target.closest('[data-detail-learn-scroll]');if(learnScroll){learnSpellFromScrollInventory(Number(learnScroll.dataset.detailLearnScroll));return;}const apply=e.target.closest('[data-apply-named-processing]');if(apply){applyNamedProcessingAtIndex(Number(itemDetailViewContext.index),apply.dataset.applyNamedProcessing||'');return;}const clear=e.target.closest('[data-clear-named-processing]');if(clear){clearNamedProcessingAtIndex(Number(itemDetailViewContext.index),clear.dataset.clearNamedProcessing||'');return;} });
  document.addEventListener('click', e => { const b=e.target.closest('[data-carry-item-detail]');if(!b)return;const slotKey=b.dataset.carryItemDetail||'';const select=$(`equip_${slotKey}_itemSelect`);const cache=inventoryDerived();const row=cache.rowByLookup.get(String(select?.value||''))||cache.equipmentByKey.get(String(select?.value||''))||null;if(row){const idx=inventoryIndexByLookup(row.id||row.masterId||row.publicId,row.name);openCharacterItemDetail(row,row.count||1,idx);}else showToast('アイテムを選択してください。','warn'); });
  document.addEventListener('click', e => { const b=e.target.closest('[data-quiver-item-detail]');if(!b)return;const key=String(b.dataset.quiverItemDetail||'');const cache=inventoryDerived();const row=cache.rowByLookup.get(key)||cache.equipmentByKey.get(key)||null;if(row){const idx=inventoryIndexByLookup(row.id||row.masterId||row.publicId,row.name);openCharacterItemDetail(row,row.count||1,idx);}else showToast('矢弾の詳細を取得できませんでした。','warn'); });
  if ($('inventoryArea')) $('inventoryArea').addEventListener('click', e => {
    const unlearnBtn=e.target.closest('[data-unlearn-recipe]');
    if(unlearnBtn){e.preventDefault();e.stopPropagation();unlearnRecipeByKey(unlearnBtn.dataset.unlearnRecipe||'');return;}
    const skillBtn=e.target.closest('[data-skill-remove]');
    if(skillBtn){e.preventDefault();e.stopPropagation();removeSkillFromWarehouse(skillBtn.dataset.skillRemove||'');return;}
    const catalogDetail=e.target.closest('[data-gm-catalog-detail]');
    if(catalogDetail){e.preventDefault();e.stopPropagation();const row=gmCatalogFindByKey(catalogDetail.dataset.gmCatalogDetail||'');if(row)openCharacterItemDetail(row,1,-1);return;}
    const catalogAdd=e.target.closest('[data-gm-catalog-add]');
    if(catalogAdd){e.preventDefault();e.stopPropagation();const key=catalogAdd.dataset.gmCatalogAdd||'';const input=$('inventoryArea')?.querySelector(`[data-gm-catalog-count="${CSS.escape(key)}"]`);addGmCatalogItemToWarehouse(key,Number(input?.value||1));return;}
    const btn = e.target.closest('[data-inventory-action]'); if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const index = Number(btn.dataset.index || 0);
    if (btn.dataset.inventoryAction === 'detail') { if(inventoryItemsState[index])openCharacterItemDetail(inventoryItemsState[index],inventoryItemsState[index].count,index); return; }
        if (btn.dataset.inventoryAction === 'edit') { openInventoryDialog(index); return; }
    if (btn.dataset.inventoryAction === 'learn-recipe') { learnRecipeFromInventory(index); return; }
    if (btn.dataset.inventoryAction === 'delete') deleteInventoryItem(index);
    if (btn.dataset.inventoryAction === 'duplicate') duplicateInventoryItem(index);
  });
  if ($('inventoryModeTabs')) $('inventoryModeTabs').addEventListener('click', e => {
    const btn=e.target.closest('[data-inventory-mode]'); if(!btn)return;
    setInventoryDisplayMode(btn.dataset.inventoryMode || 'warehouse');
  });
  if ($('learnedKindTabs')) $('learnedKindTabs').addEventListener('click', e => {
    const btn=e.target.closest('[data-learned-kind]'); if(!btn)return;
    setLearnedContentType(btn.dataset.learnedKind || 'spell');
  });
  if ($('openLearnedKindPickerBtn')) $('openLearnedKindPickerBtn').addEventListener('click', () => { renderLearnedKindTabs(); $('learnedKindDialog')?.showModal(); });
  if ($('closeLearnedKindDialogBtn')) $('closeLearnedKindDialogBtn').addEventListener('click', () => $('learnedKindDialog')?.close());
  if ($('learnedKindDialog')) $('learnedKindDialog').addEventListener('click', e => {
    if(e.target===$('learnedKindDialog')){ $('learnedKindDialog').close(); return; }
    const btn=e.target.closest('[data-learned-kind-choice]'); if(!btn)return;
    setLearnedContentType(btn.dataset.learnedKindChoice || 'spell');
    $('learnedKindDialog').close();
  });
  if ($('inventoryLocationTabs')) $('inventoryLocationTabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-inventory-filter="location"]'); if (!btn) return;
    setInventoryFilter('location', btn.dataset.value || '全て');
  });
  if ($('inventoryKindTabs')) $('inventoryKindTabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-inventory-filter="itemType"]'); if (!btn) return;
    setInventoryFilter('itemType', btn.dataset.value || '全て');
  });
  if ($('inventoryCategoryTabs')) $('inventoryCategoryTabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-inventory-filter="category"]'); if (!btn) return;
    setInventoryFilter('category', btn.dataset.value || '全て');
  });
  $('characterList').addEventListener('click', async e => {
    const btn = e.target.closest('button[data-action]'); if (!btn) return;
    const action = btn.dataset.action, id = btn.dataset.id;
    try {
      if (action === 'delete') {
        if (!confirm('このキャラクターを削除しますか？')) return;
        await deleteItem(id); await refreshList(); showToast('削除しました。', 'ok'); return;
      }
      if (action === 'share') { await copyShareUrlForListItem(id); return; }
      if ($('listStatus')) { $('listStatus').className = 'status-box'; $('listStatus').textContent = action === 'export' ? '出力データを読み込み中です。' : '編集画面を開いています。'; }
      const itemEl=btn.closest('.list-item');
      const data = await loadItem(id,{expectedRevision:Number(itemEl?.dataset?.revision||0)||0,rowHint:Number(itemEl?.dataset?.storageRow||0)||0});
      if (action === 'export') { openOutputDialog(data); return; }
      openEditor(action === 'view' ? 'view' : 'edit', data);
    } catch (err) {
      $('listStatus').className = 'status-box error';
      $('listStatus').textContent = err.message;
      showToast(err.message, 'error');
    }
  });
  document.addEventListener('input', e => {
    if (e.target.matches('#charName,#charGender,#charAge,#playerKey,#newPlayerKey,#charMemo')) { updateSummary(); return; }
    if (e.target.classList?.contains('spell-slot-select')) {
      // 選択中のselect自身をupdateAll()で再生成せず、選択値だけを反映する。
      const slotKey = e.target.dataset.slotKey || '';
      syncSpellSetHidden(slotKey);
      syncEquippedSpellSetToInventoryItem(slotKey);
      updateSpellSlotDetails(slotKey);
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
    if (e.target.closest?.('[data-upgrade-row]')) {
      const row = e.target.closest('[data-upgrade-row]');
      const slotRoot = row?.closest('[id$="_upgradeSlots"]');
      const slotKey = slotRoot ? slotRoot.id.replace(/^equip_/, '').replace(/_upgradeSlots$/, '') : '';
      if(e.target.matches('[data-upgrade-content]')&&slotKey){
        const index=Number(row.dataset.upgradeRow||0);
        const entries=collectUpgradeEntries(slotKey);
        const next=normalizeUpgradeEntry(entries[index]||{});
        next.content=normalizeUpgradeContentName(e.target.value||'');
        const maxSlotCost=Math.max(0,Number(row.dataset.upgradeMaxCost)||equipmentUpgradeLimit(slotKey));
        next.slotCost=!next.content?0:(next.content==='素材固有効果'?Math.min(2,maxSlotCost):standardUpgradeSlotCostForSelection(slotKey,next.content,maxSlotCost));
        next.specialEffectName='';next.specialEffectDetail='';next.sourceMaterialId='';next.sourceMaterialPublicId='';next.sourceMaterialName='';next.sourceMaterialTarget='';next.legacyEffectAmount=0;next.legacyEffectDetail='';
        entries[index]=next;
        renderEquipmentUpgradeSlots(slotKey,entries);
      }else if(e.target.matches('[data-upgrade-special-select]')&&slotKey){
        applySpecialUpgradeSelection(row,slotKey,Math.max(0,Number(row.dataset.upgradeMaxCost)||equipmentUpgradeLimit(slotKey)));
        renderEquipmentUpgradeSlots(slotKey,collectUpgradeEntries(slotKey));
      }
      if(slotKey) syncEquipmentUpgradeHidden(slotKey);
      updateAll();
      return;
    }
    if (e.target.dataset.equipmentInput) { updateAll(); return; }
    if (e.target.dataset.inventoryInput) { applyInventoryFilters(); updateSummary(); return; }
    if (e.target.id?.startsWith('stat_') || e.target.dataset.abilityInput || e.target.dataset.skillInput || e.target.id?.startsWith('manualBonus_') || ['currentHp','currentMp','hpBonus','mpBonus','fatigueLevel'].includes(e.target.id)) updateAll();
  });
  document.addEventListener('change', e => {
    if(e.target.id==='supportEligible'||e.target.dataset?.supportSkillMode!==undefined){updateSupportSettingsSummary();return;}
    if(e.target.matches('[data-inventory-count-index]')){
      const index=Number(e.target.dataset.inventoryCountIndex);
      if(Number.isInteger(index)&&index>=0&&inventoryItemsState[index]){
        const current=normalizeInventoryItem(inventoryItemsState[index]);
        if(inventoryKindUsesIndividualRecord(current.kind)){
          inventoryItemsState[index]=normalizeInventoryItem({...current,count:1});
          e.target.value='1';
          showToast('武器・防具は1個体ずつ管理します。複数個は別々の個体として登録してください。','warn');
        }else{
          inventoryItemsState[index]=normalizeInventoryItem({...current,count:clampInt(e.target.value||0,0,9999)});
          e.target.value=String(inventoryItemsState[index].count);
        }
        invalidateInventoryDerivedCache();
        refreshWarehouseQuantityViews();
        if(typeof autoSaveDraftSoon==='function')autoSaveDraftSoon('inventory');
      }
      return;
    }
    if (e.target.classList?.contains('spell-slot-select')) {
      const slotKey = e.target.dataset.slotKey || '';
      syncSpellSetHidden(slotKey);
      updateSpellSlotDetails(slotKey);
      updateSpellSlotHints();
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
    if (e.target.id?.startsWith('equip_') && e.target.id.endsWith('_setSpells')) {
      const slotKey = e.target.id.replace(/^equip_/, '').replace(/_setSpells$/, '');
      enforceSpellSetLimit(slotKey);
      syncEquippedSpellSetToInventoryItem(slotKey);
      updateSpellSlotDetails(slotKey);
      updateSpellSlotHints();
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
    if (e.target.id?.startsWith('equip_') && e.target.id.endsWith('_itemSelect')) {
      const slotKey = e.target.id.replace(/^equip_/, '').replace(/_itemSelect$/, '');
      applyCsItemToEquipmentSlot(slotKey);
      return;
    }
    if (e.target.id?.startsWith('equip_') && e.target.id.endsWith('_count')) {
      const slotKey = e.target.id.replace(/^equip_/, '').replace(/_count$/, '');
      if (isCarrySlotKey(slotKey)) {
        updateCarryWarehouseAllocationCount(slotKey, e.target.value);
        return;
      }
    }
    if (e.target.id?.startsWith('equip_') && e.target.id.endsWith('_type')) {
      const slotKey = e.target.id.replace(/^equip_/, '').replace(/_type$/, '');
      if(!isCarrySlotKey(slotKey)) {
        const previousItemKey=$('equip_' + slotKey + '_itemSelect')?.dataset.previousItemKey || '';
        syncEquipmentModifiersToInventoryItem(slotKey, previousItemKey);
        syncEquipmentUpgradeToInventoryItem(slotKey, previousItemKey);
        syncEquippedSpellSetToInventoryItem(slotKey, previousItemKey);
      }
      if (isCarrySlotKey(slotKey)) releaseCarryWarehouseAllocation(slotKey, {refresh:true});
      const itemSelect = $('equip_' + slotKey + '_itemSelect');
      if (itemSelect) itemSelect.value = '';
      applyEquipmentPreset(slotKey);
      refreshSpellSetSelect(slotKey, spellContainerKind($('equip_' + slotKey + '_type')?.value || 'なし'));
      if (slotKey === 'rightHand' || slotKey === 'leftHand') updateEquipmentHandLocks(true);
      updateCombatStats();
      updateSpellSlotHints();
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
    if (e.target.id?.startsWith('equip_') && e.target.id.endsWith('_upgradeLimit')) {
      const slotKey = e.target.id.replace(/^equip_/, '').replace(/_upgradeLimit$/, '');
      renderEquipmentUpgradeSlots(slotKey);
      syncEquipmentUpgradeToInventoryItem(slotKey);
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
    if (e.target.closest?.('[data-upgrade-row]')) {
      const row = e.target.closest('[data-upgrade-row]');
      const slotRoot = row?.closest('[id$="_upgradeSlots"]');
      const slotKey = slotRoot ? slotRoot.id.replace(/^equip_/, '').replace(/_upgradeSlots$/, '') : '';
      if(slotKey) syncEquipmentUpgradeHidden(slotKey);
      updateEquipmentSummaries();
      updateSummary();
      return;
    }
  });
  document.addEventListener('input', e => { const section=autoSaveSectionForTarget(e.target); if(section)autoSaveDraftSoon(section); });
  document.addEventListener('change', e => { const section=autoSaveSectionForTarget(e.target); if(section)autoSaveDraftSoon(section); });
  document.addEventListener('focusin', e => refreshSelectionListsForTarget(e.target));
  document.addEventListener('pointerdown', e => {
    const target = e.target;
    if(target && target.tagName === 'SELECT') refreshSelectionListsForTarget(target);
  }, true);
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState==='hidden' && autoSaveEnabled && autoSaveReady && autoSaveDirty && currentMode!=='view'){
      clearAutoSaveTimer();
      saveCharacterNow({automatic:true,force:false});
    }
  });
  window.addEventListener('beforeunload', e => {
    if(autoSaveEnabled && autoSaveReady && autoSaveDirty && currentMode!=='view'){
      e.preventDefault();
      e.returnValue='';
    }
  });
}

function init() {
  try {
    // 装備カテゴリのキャッシュ反映は装備欄DOM生成後に行う。
    // 先に反映すると、キャッシュあり環境で装備UI更新が未生成DOMへ走り初期化失敗の原因になる。
    renderStatic();
    loadCachedEquipmentCategories();
    loadCachedCsItems();
    bindEvents();
    // ホーム画面の裏で空キャラの倉庫・装備を全描画しない。エディタを開いた瞬間にapplyDataする。
    currentCharacter=emptyCharacter();
    inventoryItemsState=[];
    learnedRecipesState=[];
    invalidateInventoryDerivedCache();
    autoSaveEnabled=true;
    syncAutoSaveToggle();
    setAutoSaveStatus('自動保存：ON（キャラクターごとに保存）','ok');
    setView('home');
    // 一覧取得と4MB級固定マスター取得を競合させない。ホーム描画後のアイドル時間にウォームする。
    const warmMaster=()=>{ Promise.resolve(autoSyncEquipmentCategoriesFromDb()).catch(console.error); };
    if(typeof requestIdleCallback==='function')requestIdleCallback(warmMaster,{timeout:1500});
    else window.setTimeout(warmMaster,500);
  } catch (e) {
    console.error('キャラシHTMLの初期化に失敗しました。', e);
    const st = $('homeStatus') || $('listStatus') || $('editorStatus');
    if (st) {
      st.className = 'status-box error';
      st.textContent = 'キャラシHTMLの初期化に失敗しました：' + (e && e.message ? e.message : e);
    }
    try { setView('home'); } catch (_) {}
  }
}
init();

document.addEventListener('change', (ev) => {
  const target = ev.target;
  if (target && target.id === 'quiverSelect') {
    releaseAllQuiverAmmoSlots();
    selectedQuiverId = target.value || '';
    refreshWarehouseQuantityViews();
    if (typeof autoSaveDraftSoon === 'function') autoSaveDraftSoon(['inventory','equipment']);
  }
  if (target && target.dataset && target.dataset.quiverAmmoSlot) {
    selectQuiverAmmoForSlot(target.dataset.quiverAmmoSlot, target.value || '');
    if (typeof autoSaveDraftSoon === 'function') autoSaveDraftSoon(['inventory','equipment']);
  }
  if (target && target.dataset && target.dataset.quiverAmmoCount) {
    updateQuiverAmmoSlotCount(target.dataset.quiverAmmoCount, target.value);
    if (typeof autoSaveDraftSoon === 'function') autoSaveDraftSoon(['inventory','equipment']);
  }
});

