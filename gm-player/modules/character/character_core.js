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

var currentCloudPlayerKey = '';
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
