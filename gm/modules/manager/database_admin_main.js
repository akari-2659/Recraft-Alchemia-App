
// ローカル管理ツールから毎回URLを入力しない運用にする場合は、ここにApps Scriptの /exec URLを入れてください。
const DEFAULT_GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxNQYC7-aBE23cliuD1Zdze18xHh-q45P1qpBgwCCg0dYgxd1b8A-R63eGjzMtgOxMT/exec';
const RECRAFT_DB_VERSION = 'v90.8.835';
const RECRAFT_DB_REQUIRED_SERVER_VERSION = 'v90.8.835';
const DB_ID = '1c9nmVu-O6o3AcnLHJ5SwmT0oRy5lDEhRw4YuM6BMPZ8';
const DATA_KEYS = ['item_types','item_categories','material_types','material_categories','material_ranks','equipment_categories','items','recipes','spells','skills','quest_rewards','quests','exploration_areas','event_tables','treasure_tables','appraisal_rules','monsters'];
const FULL_DB_KEYS = [...DATA_KEYS];
const CATEGORY_KEYS = ['item_types','item_categories','material_types','material_categories','material_ranks'];
const MAIN_PANELS = ['categories','equipment_categories','items','materials','recipes','spells','skills','quest_rewards','quests','exploration_areas','event_tables','treasure_tables','appraisal_rules','monsters','named_individuals','facilities','json','help'];
const NAMED_INDIVIDUALS = [{"index":1,"areaName":"街はずれの草原","areaKey":"area_outskirts_grass","baseMonster":"プチスライム","namedMonster":"千変なるプチスライム","dailyQuestTitle":"草露に揺らぐ千変の影","partyBountyG":150,"dailyRewardPerPcG":70,"namedMaterialId":"mat_named_01","namedMaterialName":"千変凝核","materialRank":2,"materialSellPriceG":42,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"千変適応","equipmentUpgradeTarget":"武器・魔導書・祈祷書","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、この装備を使用した攻撃・魔法術式・祈祷の判定に失敗した直後に適用できる。次にこの装備を使用して行う同系統の判定+1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_01","baseMonsterId":"mon_petit_slime","hp":78,"evasionValue":8,"resistValue":9,"defenseValue":3,"initiative":7,"dismantleDifficulty":7,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"プチスライム？×1"},{"index":2,"areaName":"街はずれの草原","areaKey":"area_outskirts_grass","baseMonster":"ラフィンラット","namedMonster":"風より疾きラフィンラット","dailyQuestTitle":"風を置き去りにする足音","partyBountyG":160,"dailyRewardPerPcG":70,"namedMaterialId":"mat_named_02","namedMaterialName":"疾風鼠の瞬脚筋","materialRank":2,"materialSellPriceG":40,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"瞬脚転身","equipmentUpgradeTarget":"防具","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、前衛・後衛間を移動した時、次の自分の手番開始時まで回避値+1。同名効果は重複しない。","monsterId":"mon_named_02","baseMonsterId":"mon_raffin_rat","hp":73,"evasionValue":11,"resistValue":8,"defenseValue":2,"initiative":10,"dismantleDifficulty":8,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ラフィンラット？×1"},{"index":3,"areaName":"街はずれの草原","areaKey":"area_outskirts_grass","baseMonster":"ラピットホーン","namedMonster":"天を衝くラピットホーン","dailyQuestTitle":"草原に跳ねる天衝の角","partyBountyG":180,"dailyRewardPerPcG":70,"namedMaterialId":"mat_named_03","namedMaterialName":"天衝角芯","materialRank":2,"materialSellPriceG":46,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"移動照準","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、移動後に行う次の通常攻撃判定+1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_03","baseMonsterId":"mon_rapithorn","hp":82,"evasionValue":12,"resistValue":8,"defenseValue":2,"initiative":11,"dismantleDifficulty":9,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ラピットホーン？×1"},{"index":4,"areaName":"街はずれの草原","areaKey":"area_outskirts_grass","baseMonster":"ヴェスパット","namedMonster":"風を裂くヴェスパット","dailyQuestTitle":"草原を裂く羽音","partyBountyG":170,"dailyRewardPerPcG":70,"namedMaterialId":"mat_named_04","namedMaterialName":"裂風鋒翅","materialRank":2,"materialSellPriceG":44,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"裂風追撃","equipmentUpgradeTarget":"弓・クロスボウ・ヘヴィクロスボウ","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"敵前衛がいる状態で敵後衛への遠距離通常攻撃が命中した場合、そのダメージ+1。敵後衛を狙う判定補正は軽減しない。同名効果は重複しない。","monsterId":"mon_named_04","baseMonsterId":"mon_vespat","hp":69,"evasionValue":14,"resistValue":8,"defenseValue":2,"initiative":12,"dismantleDifficulty":10,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ヴェスパット？×1"},{"index":5,"areaName":"街はずれの草原","areaKey":"area_outskirts_grass","baseMonster":"カラパスビートル","namedMonster":"鉄殻を纏うカラパスビートル","dailyQuestTitle":"街道を塞ぐ鉄殻","partyBountyG":200,"dailyRewardPerPcG":70,"namedMaterialId":"mat_named_05","namedMaterialName":"鉄殻重甲","materialRank":2,"materialSellPriceG":50,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"鉄殻堅守","equipmentUpgradeTarget":"防具・盾","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、防御行動中に物属性ダメージを受ける際、その最終ダメージを追加で1点軽減する。同名効果は重複しない。","monsterId":"mon_named_05","baseMonsterId":"mon_carapace_beetle","hp":114,"evasionValue":8,"resistValue":9,"defenseValue":4,"initiative":6,"dismantleDifficulty":11,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"カラパスビートル？×1"},{"index":6,"areaName":"街はずれの草原","areaKey":"area_outskirts_grass","baseMonster":"グラウワーム","namedMonster":"地を穿つグラウワーム","dailyQuestTitle":"地の底より響く穿孔音","partyBountyG":190,"dailyRewardPerPcG":70,"namedMaterialId":"mat_named_06","namedMaterialName":"穿地顎晶","materialRank":2,"materialSellPriceG":48,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"穿地崩し","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"防御行動中の対象へこの武器の通常攻撃で与えるダメージ+1。同名効果は重複しない。","monsterId":"mon_named_06","baseMonsterId":"mon_grauworm","hp":133,"evasionValue":8,"resistValue":9,"defenseValue":3,"initiative":6,"dismantleDifficulty":10,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"グラウワーム？×1"},{"index":7,"areaName":"近郊の森","areaKey":"area_nearby_forest","baseMonster":"ラスクレイル","namedMonster":"梢を駆けるラスクレイル","dailyQuestTitle":"梢の果てを駆ける影","partyBountyG":205,"dailyRewardPerPcG":90,"namedMaterialId":"mat_named_07","namedMaterialName":"梢走の風尾","materialRank":3,"materialSellPriceG":52,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"梢撹乱","equipmentUpgradeTarget":"弓・クロスボウ・ヘヴィクロスボウ","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、遠距離通常攻撃が命中した時、対象が次に行う攻撃判定-1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_07","baseMonsterId":"mon_rascreil","hp":92,"evasionValue":15,"resistValue":8,"defenseValue":2,"initiative":11,"dismantleDifficulty":9,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ラスクレイル？×1"},{"index":8,"areaName":"近郊の森","areaKey":"area_nearby_forest","baseMonster":"マイコニド","namedMonster":"夢胞子を纏うマイコニド","dailyQuestTitle":"眠り誘う胞子の森","partyBountyG":220,"dailyRewardPerPcG":90,"namedMaterialId":"mat_named_08","namedMaterialName":"夢胞子晶嚢","materialRank":3,"materialSellPriceG":54,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"夢胞子誘導","equipmentUpgradeTarget":"杖・魔導書","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、敵へ状態異常を付与する魔法術式の判定+1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_08","baseMonsterId":"mon_myconid","hp":101,"evasionValue":8,"resistValue":10,"defenseValue":3,"initiative":6,"dismantleDifficulty":9,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"マイコニド？×1"},{"index":9,"areaName":"近郊の森","areaKey":"area_nearby_forest","baseMonster":"ルートハウンド","namedMonster":"根脈を辿るルートハウンド","dailyQuestTitle":"根の道を追う猟犬","partyBountyG":235,"dailyRewardPerPcG":90,"namedMaterialId":"mat_named_09","namedMaterialName":"根脈導牙","materialRank":3,"materialSellPriceG":58,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"根脈追撃","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"拘束状態の対象へこの武器で与えるダメージ+1。同名効果は重複しない。","monsterId":"mon_named_09","baseMonsterId":"mon_roothound","hp":125,"evasionValue":12,"resistValue":10,"defenseValue":3,"initiative":9,"dismantleDifficulty":10,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ルートハウンド？×1"},{"index":10,"areaName":"近郊の森","areaKey":"area_nearby_forest","baseMonster":"ブランチリング","namedMonster":"枝冠を戴くブランチリング","dailyQuestTitle":"枝冠の主、木立に立つ","partyBountyG":245,"dailyRewardPerPcG":90,"namedMaterialId":"mat_named_10","namedMaterialName":"枝冠の芽心","materialRank":3,"materialSellPriceG":58,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"枝冠返し","equipmentUpgradeTarget":"盾","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、前の自分の手番で防御行動を行っていた場合、次に行う通常攻撃のダメージ+1。攻撃後に解除し、同名効果は重複しない。","monsterId":"mon_named_10","baseMonsterId":"mon_branchling","hp":145,"evasionValue":8,"resistValue":10,"defenseValue":4,"initiative":6,"dismantleDifficulty":9,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ブランチリング？×1"},{"index":11,"areaName":"近郊の森","areaKey":"area_nearby_forest","baseMonster":"モスバック","namedMonster":"深苔を纏うモスバック","dailyQuestTitle":"深苔を背負う森の巨影","partyBountyG":240,"dailyRewardPerPcG":90,"namedMaterialId":"mat_named_11","namedMaterialName":"深苔古皮","materialRank":3,"materialSellPriceG":56,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"深苔被覆","equipmentUpgradeTarget":"防具","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"毒・火傷などの状態異常によってラウンド終了時に受けるダメージを1点軽減する（最低1）。同名効果は重複しない。","monsterId":"mon_named_11","baseMonsterId":"mon_mossback","hp":154,"evasionValue":11,"resistValue":10,"defenseValue":4,"initiative":7,"dismantleDifficulty":10,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"モスバック？×1"},{"index":12,"areaName":"近郊の森","areaKey":"area_nearby_forest","baseMonster":"ウィスパウル","namedMonster":"静夜を告ぐウィスパウル","dailyQuestTitle":"静夜に告ぐ羽音","partyBountyG":210,"dailyRewardPerPcG":90,"namedMaterialId":"mat_named_12","namedMaterialName":"静夜の無音羽","materialRank":3,"materialSellPriceG":52,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"静夜初矢","equipmentUpgradeTarget":"弓・クロスボウ・ヘヴィクロスボウ","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"各戦闘で最初に行う遠距離攻撃判定+1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_12","baseMonsterId":"mon_whisperowl","hp":87,"evasionValue":14,"resistValue":11,"defenseValue":2,"initiative":11,"dismantleDifficulty":10,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ウィスパウル？×1"},{"index":13,"areaName":"水辺の湿地","areaKey":"area_waterside_wetland","baseMonster":"マッドホッパー","namedMonster":"泥濘蹴散らすマッドホッパー","dailyQuestTitle":"泥濘を蹴って跳ぶもの","partyBountyG":275,"dailyRewardPerPcG":110,"namedMaterialId":"mat_named_13","namedMaterialName":"泥跳の強靭腱","materialRank":3,"materialSellPriceG":50,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"移動照準","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、移動後に行う次の通常攻撃判定+1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_13","baseMonsterId":"mon_mudhopper","hp":108,"evasionValue":13,"resistValue":8,"defenseValue":2,"initiative":10,"dismantleDifficulty":9,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"マッドホッパー？×1"},{"index":14,"areaName":"水辺の湿地","areaKey":"area_waterside_wetland","baseMonster":"バブルスライム","namedMonster":"泡界なるバブルスライム","dailyQuestTitle":"泡に閉ざされた浅瀬","partyBountyG":285,"dailyRewardPerPcG":110,"namedMaterialId":"mat_named_14","namedMaterialName":"泡界晶核","materialRank":3,"materialSellPriceG":50,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"泡界耐圧","equipmentUpgradeTarget":"防具","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"2体以上・1列・全体を対象とする攻撃から受ける最終ダメージを1点軽減する。同名効果は重複しない。","monsterId":"mon_named_14","baseMonsterId":"mon_bubble_slime","hp":118,"evasionValue":8,"resistValue":9,"defenseValue":3,"initiative":7,"dismantleDifficulty":8,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"バブルスライム？×1"},{"index":15,"areaName":"水辺の湿地","areaKey":"area_waterside_wetland","baseMonster":"ミストモスキート","namedMonster":"毒霧を纏うミストモスキート","dailyQuestTitle":"霧中に潜む毒針","partyBountyG":290,"dailyRewardPerPcG":110,"namedMaterialId":"mat_named_15","namedMaterialName":"毒霧の濃針","materialRank":3,"materialSellPriceG":52,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"毒霧追撃","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、毒状態の対象へこの武器で与えるダメージ+1。同名効果は重複しない。","monsterId":"mon_named_15","baseMonsterId":"mon_mist_mosquito","hp":82,"evasionValue":15,"resistValue":8,"defenseValue":2,"initiative":13,"dismantleDifficulty":10,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ミストモスキート？×1"},{"index":16,"areaName":"水辺の湿地","areaKey":"area_waterside_wetland","baseMonster":"ドロマール","namedMonster":"泥城を成すドロマール","dailyQuestTitle":"沼に築かれた泥の城","partyBountyG":315,"dailyRewardPerPcG":110,"namedMaterialId":"mat_named_16","namedMaterialName":"泥城の心核","materialRank":3,"materialSellPriceG":55,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"泥城不動","equipmentUpgradeTarget":"盾","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"自分の手番に移動せず防御行動を選択した場合、その防御行動中の防御行動値+1。同名効果は重複しない。","monsterId":"mon_named_16","baseMonsterId":"mon_dromarl","hp":160,"evasionValue":8,"resistValue":10,"defenseValue":4,"initiative":5,"dismantleDifficulty":9,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ドロマール？×1"},{"index":17,"areaName":"水辺の湿地","areaKey":"area_waterside_wetland","baseMonster":"リードリザード","namedMonster":"葦波を裂くリードリザード","dailyQuestTitle":"葦波を割る水影","partyBountyG":295,"dailyRewardPerPcG":110,"namedMaterialId":"mat_named_17","namedMaterialName":"葦裂の水尾鱗","materialRank":3,"materialSellPriceG":52,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"葦波横断","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"2体以上を対象とする武器攻撃で、各対象へ与えるダメージ+1。対象ごとに個別適用し、同名効果は重複しない。","monsterId":"mon_named_17","baseMonsterId":"mon_reed_lizard","hp":140,"evasionValue":12,"resistValue":10,"defenseValue":3,"initiative":8,"dismantleDifficulty":10,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"リードリザード？×1"},{"index":18,"areaName":"水辺の湿地","areaKey":"area_waterside_wetland","baseMonster":"ミアズマリーチ","namedMonster":"瘴血啜るミアズマリーチ","dailyQuestTitle":"瘴血を求める沼の影","partyBountyG":305,"dailyRewardPerPcG":110,"namedMaterialId":"mat_named_18","namedMaterialName":"瘴血濃嚢","materialRank":3,"materialSellPriceG":54,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"瘴血吸収","equipmentUpgradeTarget":"武器・魔導書","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"戦闘中1回、状態異常の敵へ1点以上のダメージを与えた時、自身のHPを1D3回復する。同名効果は重複しない。","monsterId":"mon_named_18","baseMonsterId":"mon_miasma_leech","hp":114,"evasionValue":10,"resistValue":12,"defenseValue":2,"initiative":6,"dismantleDifficulty":10,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ミアズマリーチ？×1"},{"index":19,"areaName":"反照の水庭","areaKey":"area_reflection_water_garden","baseMonster":"ミラースライム","namedMonster":"万象映すミラースライム","dailyQuestTitle":"水鏡に揺らぐ万象の影","partyBountyG":420,"dailyRewardPerPcG":160,"namedMaterialId":"mat_named_19","namedMaterialName":"万象鏡核","materialRank":4,"materialSellPriceG":100,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"万象反照","equipmentUpgradeTarget":"防具・盾","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"火・水・風・雷・光・闇属性ダメージを受けた時、次の自分の手番開始時まで同属性から受ける最終ダメージを1点軽減する。同名効果は重複しない。","monsterId":"mon_named_19","baseMonsterId":"mon_mirror_slime","hp":155,"evasionValue":12,"resistValue":12,"defenseValue":3,"initiative":8,"dismantleDifficulty":12,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ミラースライム？×1"},{"index":20,"areaName":"反照の水庭","areaKey":"area_reflection_water_garden","baseMonster":"フェイズモス","namedMonster":"境界を掠めるフェイズモス","dailyQuestTitle":"境界を掠める翅音","partyBountyG":430,"dailyRewardPerPcG":160,"namedMaterialId":"mat_named_20","namedMaterialName":"境界位相翅","materialRank":4,"materialSellPriceG":96,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"位相残像","equipmentUpgradeTarget":"防具","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"同一ラウンド中、2回目以降に自身を対象とする攻撃に対して回避値+1。同名効果は重複しない。","monsterId":"mon_named_20","baseMonsterId":"mon_phase_moth","hp":115,"evasionValue":16,"resistValue":10,"defenseValue":2,"initiative":14,"dismantleDifficulty":12,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"フェイズモス？×1"},{"index":21,"areaName":"反照の水庭","areaKey":"area_reflection_water_garden","baseMonster":"グラスレイ","namedMonster":"水鏡を翔けるグラスレイ","dailyQuestTitle":"水鏡を走る玻璃の影","partyBountyG":450,"dailyRewardPerPcG":160,"namedMaterialId":"mat_named_21","namedMaterialName":"水鏡透鰭","materialRank":4,"materialSellPriceG":102,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"水鏡滑走","equipmentUpgradeTarget":"武器・杖・魔導書","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"この装備で水属性ダメージを1点以上与えた手番の終了時から、次の自分の手番開始時まで回避値+1。同名効果は重複しない。","monsterId":"mon_named_21","baseMonsterId":"mon_glass_ray","hp":200,"evasionValue":14,"resistValue":12,"defenseValue":4,"initiative":10,"dismantleDifficulty":13,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"グラスレイ？×1"},{"index":22,"areaName":"反照の水庭","areaKey":"area_reflection_water_garden","baseMonster":"エコーリード","namedMonster":"反響根を張るエコーリード","dailyQuestTitle":"水庭に響く根の声","partyBountyG":440,"dailyRewardPerPcG":160,"namedMaterialId":"mat_named_22","namedMaterialName":"反響根芯","materialRank":4,"materialSellPriceG":98,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"反響追奏","equipmentUpgradeTarget":"武器・魔導書","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"対象の次の判定へマイナス補正が付与されている場合、その対象へこの装備で与えるダメージ+1。同名効果は重複しない。","monsterId":"mon_named_22","baseMonsterId":"mon_echo_reed","hp":165,"evasionValue":9,"resistValue":13,"defenseValue":3,"initiative":7,"dismantleDifficulty":13,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"エコーリード？×1"},{"index":23,"areaName":"反照の水庭","areaKey":"area_reflection_water_garden","baseMonster":"ミラード","namedMonster":"鏡盾を掲げるミラード","dailyQuestTitle":"水面に立つ鏡盾","partyBountyG":470,"dailyRewardPerPcG":160,"namedMaterialId":"mat_named_23","namedMaterialName":"鏡盾主甲","materialRank":4,"materialSellPriceG":106,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"鏡盾偏向","equipmentUpgradeTarget":"盾","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"防御行動中、遠距離攻撃から受ける最終ダメージを追加で1点軽減する。同名効果は重複しない。","monsterId":"mon_named_23","baseMonsterId":"mon_rift_crab","hp":250,"evasionValue":9,"resistValue":12,"defenseValue":6,"initiative":6,"dismantleDifficulty":14,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ミラード？×1"},{"index":24,"areaName":"反照の水庭","areaKey":"area_reflection_water_garden","baseMonster":"ヴェイル","namedMonster":"虚界を裂くヴェイル","dailyQuestTitle":"虚ろな水面に走る裂け目","partyBountyG":480,"dailyRewardPerPcG":160,"namedMaterialId":"mat_named_24","namedMaterialName":"裂界虚膜","materialRank":4,"materialSellPriceG":110,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"裂界露出","equipmentUpgradeTarget":"武器・魔導書","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"戦闘中1回、この装備による攻撃・魔法術式で1点以上のダメージを与えた時、対象の回避値・抵抗値-1。次にその対象へ攻撃判定または魔法術式判定を1回行った後に解除し、同名効果は重複しない。","monsterId":"mon_named_24","baseMonsterId":"mon_void_hound","hp":235,"evasionValue":15,"resistValue":12,"defenseValue":4,"initiative":13,"dismantleDifficulty":14,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ヴェイル？×1"},{"index":25,"areaName":"山麓の旧鉱山","areaKey":"area_foothill_old_mine","baseMonster":"レゾナバット","namedMonster":"坑声を裂くレゾナバット","dailyQuestTitle":"坑声を裂く反響音","partyBountyG":360,"dailyRewardPerPcG":140,"namedMaterialId":"mat_named_25","namedMaterialName":"坑声共鳴骨","materialRank":4,"materialSellPriceG":90,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"追響照準","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、この武器による攻撃判定に失敗した時、次に同じ対象へ行う攻撃判定+1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_25","baseMonsterId":"mon_resona_bat","hp":140,"evasionValue":15,"resistValue":12,"defenseValue":2,"initiative":11,"dismantleDifficulty":12,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"レゾナバット？×1"},{"index":26,"areaName":"山麓の旧鉱山","areaKey":"area_foothill_old_mine","baseMonster":"ピックモール","namedMonster":"鉱脈を穿つピックモール","dailyQuestTitle":"鉱脈の先を穿つ爪","partyBountyG":380,"dailyRewardPerPcG":140,"namedMaterialId":"mat_named_26","namedMaterialName":"鉱脈穿爪","materialRank":4,"materialSellPriceG":94,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"穿点照準","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"防御行動中の対象へこの武器で行う攻撃判定+1。同名効果は重複しない。","monsterId":"mon_named_26","baseMonsterId":"mon_pick_mole","hp":164,"evasionValue":12,"resistValue":11,"defenseValue":3,"initiative":9,"dismantleDifficulty":12,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ピックモール？×1"},{"index":27,"areaName":"山麓の旧鉱山","areaKey":"area_foothill_old_mine","baseMonster":"オアスケイル","namedMonster":"黒鉱を纏うオアスケイル","dailyQuestTitle":"坑道を歩く黒鉱の鱗","partyBountyG":410,"dailyRewardPerPcG":140,"namedMaterialId":"mat_named_27","namedMaterialName":"黒鉱晶鱗","materialRank":4,"materialSellPriceG":100,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"黒鉱硬殻","equipmentUpgradeTarget":"防具・盾","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"戦闘中1回、物属性ダメージを受ける際、その最終ダメージを2点軽減する。防御行動中に適用した場合は、代わりに3点軽減する。同名効果は重複しない。","monsterId":"mon_named_27","baseMonsterId":"mon_ore_scale","hp":193,"evasionValue":9,"resistValue":12,"defenseValue":5,"initiative":7,"dismantleDifficulty":13,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"オアスケイル？×1"},{"index":28,"areaName":"山麓の旧鉱山","areaKey":"area_foothill_old_mine","baseMonster":"ラストマイト","namedMonster":"赤錆喰らうラストマイト","dailyQuestTitle":"赤錆を追う小さな群影","partyBountyG":390,"dailyRewardPerPcG":140,"namedMaterialId":"mat_named_28","namedMaterialName":"赤錆蝕腺","materialRank":4,"materialSellPriceG":96,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"防御行動妨害","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"この武器の攻撃が命中した対象は、次に防御行動を行った際、その防御行動中の防御行動値-1。防御行動終了時に解除し、同名効果は重複しない。","monsterId":"mon_named_28","baseMonsterId":"mon_rust_mite","hp":130,"evasionValue":13,"resistValue":13,"defenseValue":3,"initiative":10,"dismantleDifficulty":12,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ラストマイト？×1"},{"index":29,"areaName":"山麓の旧鉱山","areaKey":"area_foothill_old_mine","baseMonster":"マインゴーレム","namedMonster":"坑律を刻むマインゴーレム","dailyQuestTitle":"坑道に刻まれる重い律動","partyBountyG":450,"dailyRewardPerPcG":140,"namedMaterialId":"mat_named_29","namedMaterialName":"坑律駆動核","materialRank":4,"materialSellPriceG":108,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"駆動定着","equipmentUpgradeTarget":"防具・盾","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"戦闘中1回、自身を移動させる敵の強制移動効果を無効化する。ダメージやその他の効果は通常どおり受ける。同名効果は重複しない。","monsterId":"mon_named_29","baseMonsterId":"mon_mine_golem","hp":212,"evasionValue":8,"resistValue":14,"defenseValue":6,"initiative":6,"dismantleDifficulty":14,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"マインゴーレム？×1"},{"index":30,"areaName":"山麓の旧鉱山","areaKey":"area_foothill_old_mine","baseMonster":"ルミナウィスプ","namedMonster":"燐晶を灯すルミナウィスプ","dailyQuestTitle":"坑奥に灯る燐晶の光","partyBountyG":400,"dailyRewardPerPcG":140,"namedMaterialId":"mat_named_30","namedMaterialName":"燐晶灯核","materialRank":4,"materialSellPriceG":96,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"燐光標定","equipmentUpgradeTarget":"武器・杖・魔導書","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、この装備で光属性の弱点を突いて1点以上のダメージを与えた時、その対象へ次にこの装備で行う攻撃・魔法術式判定+1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_30","baseMonsterId":"mon_lumina_wisp","hp":154,"evasionValue":15,"resistValue":14,"defenseValue":2,"initiative":10,"dismantleDifficulty":13,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ルミナウィスプ？×1"},{"index":31,"areaName":"風渡りの高原","areaKey":"area_wind_swept_highland","baseMonster":"ブリーズホップ","namedMonster":"疾風を踏むブリーズホップ","dailyQuestTitle":"風より先へ跳ぶ影","partyBountyG":490,"dailyRewardPerPcG":170,"namedMaterialId":"mat_named_31","namedMaterialName":"疾風跳腱","materialRank":4,"materialSellPriceG":100,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"移動照準","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、移動後に行う次の通常攻撃判定+1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_31","baseMonsterId":"mon_breeze_hop","hp":174,"evasionValue":16,"resistValue":13,"defenseValue":3,"initiative":16,"dismantleDifficulty":12,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ブリーズホップ？×1"},{"index":32,"areaName":"風渡りの高原","areaKey":"area_wind_swept_highland","baseMonster":"クラッグラム","namedMonster":"嵐壁を背負うクラッグラム","dailyQuestTitle":"崖道を塞ぐ嵐壁の角","partyBountyG":540,"dailyRewardPerPcG":170,"namedMaterialId":"mat_named_32","namedMaterialName":"嵐壁重角","materialRank":4,"materialSellPriceG":108,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"嵐壁防護","equipmentUpgradeTarget":"盾","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"防御行動中、2体以上・1列・全体を対象とする攻撃から受ける最終ダメージを追加で1点軽減する。同名効果は重複しない。","monsterId":"mon_named_32","baseMonsterId":"mon_crag_ram","hp":270,"evasionValue":11,"resistValue":14,"defenseValue":7,"initiative":11,"dismantleDifficulty":14,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"クラッグラム？×1"},{"index":33,"areaName":"風渡りの高原","areaKey":"area_wind_swept_highland","baseMonster":"カイトビーク","namedMonster":"天風を駆るカイトビーク","dailyQuestTitle":"天風を切り裂く翼","partyBountyG":520,"dailyRewardPerPcG":170,"namedMaterialId":"mat_named_33","namedMaterialName":"天風翔刃羽","materialRank":4,"materialSellPriceG":110,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"後衛突破","equipmentUpgradeTarget":"弓・クロスボウ・ヘヴィクロスボウ","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"戦闘中1回、敵前衛がいる状態で敵後衛を狙う射撃判定の-2補正を受けない。判定前に使用し、同名効果は重複しない。","monsterId":"mon_named_33","baseMonsterId":"mon_kite_beak","hp":193,"evasionValue":16,"resistValue":14,"defenseValue":3,"initiative":18,"dismantleDifficulty":13,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"カイトビーク？×1"},{"index":34,"areaName":"風渡りの高原","areaKey":"area_wind_swept_highland","baseMonster":"ソノラブルーム","namedMonster":"風歌を奏でるソノラブルーム","dailyQuestTitle":"高原に響く風の歌","partyBountyG":500,"dailyRewardPerPcG":170,"namedMaterialId":"mat_named_34","namedMaterialName":"風奏花心","materialRank":4,"materialSellPriceG":102,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"風歌拡散","equipmentUpgradeTarget":"杖・魔導書・祈祷書","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、2体以上を対象とする魔法術式・祈祷の判定+1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_34","baseMonsterId":"mon_sonora_bloom","hp":183,"evasionValue":12,"resistValue":16,"defenseValue":3,"initiative":13,"dismantleDifficulty":12,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ソノラブルーム？×1"},{"index":35,"areaName":"風渡りの高原","areaKey":"area_wind_swept_highland","baseMonster":"グライドスケイル","namedMonster":"風路を翔けるグライドスケイル","dailyQuestTitle":"風路を渡る滑空影","partyBountyG":530,"dailyRewardPerPcG":170,"namedMaterialId":"mat_named_35","namedMaterialName":"風路滑翔膜","materialRank":4,"materialSellPriceG":106,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"移動回避","equipmentUpgradeTarget":"防具","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、移動した手番の終了後、次に自身を対象とする攻撃1回に対して回避値+1。攻撃処理後に解除し、同名効果は重複しない。","monsterId":"mon_named_35","baseMonsterId":"mon_glide_scale","hp":231,"evasionValue":14,"resistValue":14,"defenseValue":5,"initiative":15,"dismantleDifficulty":14,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"グライドスケイル？×1"},{"index":36,"areaName":"風渡りの高原","areaKey":"area_wind_swept_highland","baseMonster":"ボルトバイソン","namedMonster":"雷雲を引くボルトバイソン","dailyQuestTitle":"雷雲を連れてくる蹄音","partyBountyG":580,"dailyRewardPerPcG":170,"namedMaterialId":"mat_named_36","namedMaterialName":"雷雲蓄雷角","materialRank":4,"materialSellPriceG":116,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"雷鳴萎縮","equipmentUpgradeTarget":"武器・杖・魔導書","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"戦闘中1回、雷属性で1点以上のダメージを与えた対象1体が次に行う攻撃判定-1。判定後に解除し、同名効果は重複しない。","monsterId":"mon_named_36","baseMonsterId":"mon_bolt_bison","hp":304,"evasionValue":10,"resistValue":15,"defenseValue":6,"initiative":14,"dismantleDifficulty":15,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ボルトバイソン？×1"},{"index":37,"areaName":"灰冠の火山峡谷","areaKey":"area_ashcrown_volcanic_canyon","baseMonster":"スコリアゲッコー","namedMonster":"灼壁を駆けるスコリアゲッコー","dailyQuestTitle":"灼けた岩壁を走る影","partyBountyG":650,"dailyRewardPerPcG":210,"namedMaterialId":"mat_named_37","namedMaterialName":"灼壁熔殻鱗","materialRank":5,"materialSellPriceG":138,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"移動回避","equipmentUpgradeTarget":"防具","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、移動した手番の終了後、次に自身を対象とする攻撃1回に対して回避値+1。攻撃処理後に解除し、同名効果は重複しない。","monsterId":"mon_named_37","baseMonsterId":"mon_scoria_gecko","hp":188,"evasionValue":17,"resistValue":13,"defenseValue":3,"initiative":18,"dismantleDifficulty":14,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"スコリアゲッコー？×1"},{"index":38,"areaName":"灰冠の火山峡谷","areaKey":"area_ashcrown_volcanic_canyon","baseMonster":"シンダースライム","namedMonster":"熾泥を抱くシンダースライム","dailyQuestTitle":"熾泥に沈まぬもの","partyBountyG":640,"dailyRewardPerPcG":210,"namedMaterialId":"mat_named_38","namedMaterialName":"熾泥心核","materialRank":5,"materialSellPriceG":140,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"熾泥防壁","equipmentUpgradeTarget":"防具・盾","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"防御行動中に受ける火属性ダメージを追加で2点軽減する。同名効果は重複しない。","monsterId":"mon_named_38","baseMonsterId":"mon_cinder_slime","hp":207,"evasionValue":11,"resistValue":16,"defenseValue":4,"initiative":9,"dismantleDifficulty":14,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"シンダースライム？×1"},{"index":39,"areaName":"灰冠の火山峡谷","areaKey":"area_ashcrown_volcanic_canyon","baseMonster":"サルファマーモット","namedMonster":"噴煙を告ぐサルファマーモット","dailyQuestTitle":"噴煙より先に響く声","partyBountyG":610,"dailyRewardPerPcG":210,"namedMaterialId":"mat_named_39","namedMaterialName":"噴煙硫気嚢","materialRank":5,"materialSellPriceG":132,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"噴煙警戒","equipmentUpgradeTarget":"防具","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、状態異常を付与する敵の判定に対して抵抗値+2。同名効果は重複しない。","monsterId":"mon_named_39","baseMonsterId":"mon_sulfur_marmot","hp":169,"evasionValue":15,"resistValue":15,"defenseValue":3,"initiative":17,"dismantleDifficulty":13,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"サルファマーモット？×1"},{"index":40,"areaName":"灰冠の火山峡谷","areaKey":"area_ashcrown_volcanic_canyon","baseMonster":"サーマルカイト","namedMonster":"熱天を舞うサーマルカイト","dailyQuestTitle":"熱天を渡る翼影","partyBountyG":680,"dailyRewardPerPcG":210,"namedMaterialId":"mat_named_40","namedMaterialName":"熱天昇流羽","materialRank":5,"materialSellPriceG":144,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"後衛突破","equipmentUpgradeTarget":"弓・クロスボウ・ヘヴィクロスボウ","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"戦闘中1回、敵前衛がいる状態で敵後衛を狙う射撃判定の-2補正を受けない。判定前に使用し、同名効果は重複しない。","monsterId":"mon_named_40","baseMonsterId":"mon_thermal_kite","hp":197,"evasionValue":17,"resistValue":14,"defenseValue":3,"initiative":19,"dismantleDifficulty":15,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"サーマルカイト？×1"},{"index":41,"areaName":"灰冠の火山峡谷","areaKey":"area_ashcrown_volcanic_canyon","baseMonster":"グラスケイル","namedMonster":"黒曜を纏うグラスケイル","dailyQuestTitle":"黒曜の鱗痕を追って","partyBountyG":730,"dailyRewardPerPcG":210,"namedMaterialId":"mat_named_41","namedMaterialName":"黒曜鏡晶鱗","materialRank":5,"materialSellPriceG":150,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"黒曜硬化","equipmentUpgradeTarget":"防具・盾","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"戦闘中1回、物属性ダメージを受けた直後、次の自分の手番開始時まで防御値+1。同名効果は重複しない。","monsterId":"mon_named_41","baseMonsterId":"mon_glass_scale","hp":273,"evasionValue":10,"resistValue":16,"defenseValue":7,"initiative":10,"dismantleDifficulty":16,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"グラスケイル？×1"},{"index":42,"areaName":"灰冠の火山峡谷","areaKey":"area_ashcrown_volcanic_canyon","baseMonster":"ヴェインサラマンダー","namedMonster":"火脈を泳ぐヴェインサラマンダー","dailyQuestTitle":"岩下を走る火脈の影","partyBountyG":710,"dailyRewardPerPcG":210,"namedMaterialId":"mat_named_42","namedMaterialName":"火脈灼腺","materialRank":5,"materialSellPriceG":146,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"火脈再燃","equipmentUpgradeTarget":"武器・杖・魔導書","equipmentUpgradeSlotCost":2,"equipmentUpgradeDetail":"戦闘中1回、火傷状態の対象へ火属性で1点以上のダメージを与えた時、その火傷の残り期間を2ラウンドへ更新する。火傷を新規付与する効果ではない。同名効果は重複しない。","monsterId":"mon_named_42","baseMonsterId":"mon_vein_salamander","hp":235,"evasionValue":13,"resistValue":16,"defenseValue":5,"initiative":13,"dismantleDifficulty":15,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"ヴェインサラマンダー？×1"},{"index":43,"areaName":"灰冠の火山峡谷","areaKey":"area_ashcrown_volcanic_canyon","baseMonster":"アッシュバイソン","namedMonster":"灰原を踏み鳴らすアッシュバイソン","dailyQuestTitle":"灰原を揺らす重い蹄音","partyBountyG":760,"dailyRewardPerPcG":210,"namedMaterialId":"mat_named_43","namedMaterialName":"灰原熾角","materialRank":5,"materialSellPriceG":155,"dropRule":"通常種の汎用ドロップを維持し、通常種の20%固有素材を除外。二つ名専用素材を20%で1個抽選","equipmentUpgradeEffect":"灰原踏破","equipmentUpgradeTarget":"武器","equipmentUpgradeSlotCost":3,"equipmentUpgradeDetail":"《力業攻撃》使用後に発生する次の手番の防御-2を防御-1へ軽減する。行動不能は通常どおり発生する。同名効果は重複しない。","monsterId":"mon_named_43","baseMonsterId":"mon_ash_bison","hp":324,"evasionValue":10,"resistValue":16,"defenseValue":7,"initiative":14,"dismantleDifficulty":16,"randomEncounterRule":"該当エリアの通常ランダムイベント抽選時、二つ名専用枠5%に当選した場合に同エリアの二つ名から1体を抽選","randomEncounterDisplay":"アッシュバイソン？×1"}];
const SCHEMA = {
  item_types: ['id','name','description','sortOrder','enabled','notes','updatedAt','ownerKey','createdBy'],
  item_categories: ['id','name','itemType','description','sortOrder','enabled','notes','updatedAt','ownerKey','createdBy'],
  material_types: ['id','name','description','sortOrder','enabled','notes','updatedAt','ownerKey','createdBy'],
  material_categories: ['id','name','materialType','description','sortOrder','enabled','notes','updatedAt','ownerKey','createdBy'],
  material_ranks: ['id','name','price','description','sortOrder','enabled','notes','updatedAt','ownerKey','createdBy'],
  equipment_categories: ['id','name','itemCategory','equipSlot','skill','element','power','maxStack','offhandBonus','reloadTurns','modifiers','description','effect','intrinsicEffects','sortOrder','enabled','notes','updatedAt','ownerKey','createdBy'],
  items: ['id','publicId','dataKind','itemType','itemCategory','materialType','materialCategory','name','csVisible','buyPrice','sellPrice','rank','toolRank','guaranteeUpgradeMaxRank','equipSlot','skill','power','maxStack','ammoUse','ammoKind','compatibleWeaponTypes','quiverCapacity','bagCapacity','offhandBonus','reloadTurns','spellSlots','modifiers','upgradeLimit','upgradeMaterialMinRank','mpCost','target','checkType','element','enchantTarget','enchantEffectType','enchantValue','enchantDuration','enchantRounds','enchantStackRule','description','effect','equipmentEffects','processingSkill','processingToolType','processingToolRank','processingRequiredMaterials','processingResultCount','processingDifficulty','processingFee','source','usageTags','equipmentUpgradeEffect','equipmentUpgradeSlotCost','equipmentUpgradeDetail','equipmentUpgradeTarget','namedProcessingOptions','unlockAreaKey','unlockFacility','tags','notes','updatedAt','ownerKey','createdBy'],
  recipes: ['id','publicId','name','rank','price','recipePrice','limitedRecipePrice','recipeSellPrice','recipeSource','craftSkill','craftType','category','baseItem','branchType','resultItem','resultKind','resultCount','requiredMaterials','difficulty','description','effect','unlockAreaKey','unlockOrder','unlockCondition','unlockFacility','tags','notes','updatedAt','ownerKey','createdBy'],
  spells: ['id','publicId','type','name','rank','mpCost','target','checkType','element','power','description','effect','role','scrollPrice','setItem','unlockFacility','tags','notes','updatedAt','ownerKey','createdBy'],
  skills: ['id','publicId','dataKind','name','rank','category','weaponType','timing','cost','ct','effect','description','drawWeight','balanceTier','balanceReason','enabled','probability','unlockAreaKey','unlockCondition','notes','updatedAt','ownerKey','createdBy'],
  quest_rewards: ['id','rank','rewardMin','rewardMax','rewardAvg','scale','description','extraRewards','notes','updatedAt','ownerKey','createdBy'],
  quests: ['id','name','questCategory','enabled','requestKind','questType','rank','areaName','questLocation','timeSlots','recommendedSkills','rewardScope','deliveryItems','progressStep','fixedEvents','clearCondition','bossMonster','questBossName','questBossFormation','questBossComposition','battleRoundLimit','battleRoundSuccess','battleRoundFailure','rewardMoney','rewardItems','rewardTableId','rewardDrawCount','bonusPoints','unlockResult','description','notes','updatedAt','ownerKey','createdBy'],
  exploration_areas: ['id','name','unlockKey','unlockOrder','areaType','difficulty','unlockCondition','parentAreaId','isHiddenArea','mainMaterials','mainMonsters','fieldEffect','weatherProfiles','timeProfiles','eventTableId','progressStep','description','notes','updatedAt','ownerKey','createdBy'],
  event_tables: ['id','tableId','areaName','eventName','eventType','description','conditionType','conditionValue','timeSlots','weatherWeights','timeWeights','rumorScope','checkType','targetValue','treasureTableId','rewardTableId','rewardDrawCount','encounterCountRule','encounterCountMin','encounterCountMax','encounterFormation','encounterComposition','encounterVariantTable','result','progressEffect','notes','updatedAt','ownerKey','createdBy'],
  treasure_tables: ['id','tableId','tablePurpose','areaName','treasureRank','chestName','hasLock','unlockDifficulty','hasTrap','trapDetectDifficulty','trapDisarmDifficulty','trapName','trapEffect','hasLock','hasTrap','entryType','entryName','entryPublicId','recipeName','scrollRank','quantity','weight','description','enabled','notes','updatedAt','ownerKey','createdBy'],
  appraisal_rules: ['id','facilityName','scrollRank','difficulty','spellType','spellRank','candidateTags','description','enabled','notes','updatedAt','ownerKey','createdBy'],
  monsters: ['id','name','monsterType','monsterTraits','rank','hp','mp','evasionValue','resistValue','defenseValue','initiative','encounterValue','individualValueEnabled','individualValueRule','dismantleDifficulty','physicalAffinity','fireAffinity','waterAffinity','windAffinity','thunderAffinity','lightAffinity','darkAffinity','neutralAffinity','imageUrl','pullRule','passiveName','passiveEffect','behaviorAI','fixedActionNames','passiveOnlyActionNames','actionSelectionRules','actions','drops','habit','description','notes','updatedAt','ownerKey','createdBy']
};
const LABELS = {
  id:'ID', publicId:'公開ID', dataKind:'登録種別', itemType:'アイテム種別', itemCategory:'アイテムカテゴリ', materialType:'素材種別', materialCategory:'素材カテゴリ', name:'名称', csVisible:'キャラシ表示', price:'価格', buyPrice:'買値', sellPrice:'売値', recipePrice:'販売価格', limitedRecipePrice:'旧限定販売価格', recipeSellPrice:'売値', recipeSource:'レシピ入手先', craftSkill:'製作技能', rank:'ランク', toolRank:'使用可能上限ランク', guaranteeUpgradeMaxRank:'強化確定上限ランク', craftType:'製作区分', baseItem:'派生元', branchType:'派生系統名', equipSlot:'装備/使用枠', skill:'使用技能', power:'威力', baseValue:'基礎技能値', hitMod:'命中補正', alwaysDefense:'防御値', guardValue:'防御行動値', evasionMod:'回避補正', maxStack:'最大スタック数', ammoUse:'矢弾消費', ammoKind:'矢弾種別', compatibleWeaponTypes:'対応武器種', quiverCapacity:'矢筒収納種類数', bagCapacity:'バッグ容量', offhandBonus:'副手追撃値', reloadTurns:'装填ターン', spellSlots:'術式追加枠', modifiers:'補正値', upgradeLimit:'強化枠上限', upgradeMaterialMinRank:'強化素材最低ランク', mpCost:'MP', target:'対象', checkType:'判定', element:'属性', enchantTarget:'エンチャント対象', enchantEffectType:'エンチャント効果種別', enchantValue:'エンチャント値', enchantDuration:'持続期間', enchantRounds:'持続ラウンド', enchantStackRule:'重複ルール', physicalAffinity:'物', fireAffinity:'火', waterAffinity:'水', windAffinity:'風', thunderAffinity:'雷', lightAffinity:'光', darkAffinity:'闇', neutralAffinity:'無', imageUrl:'魔物画像URL', pullRule:'引き寄せ', passiveName:'固有パッシブ名', passiveEffect:'固有パッシブ効果', behaviorAI:'固有行動AI', areaVariants:'エリア別数値補正', fixedActionNames:'固定選出技', passiveOnlyActionNames:'パッシブ専用技', actionSelectionRules:'技選出候補条件', habit:'習性', description:'説明', effect:'旧互換効果全文', equipmentEffects:'固有効果', intrinsicEffects:'武器種固有', processingSkill:'加工技能', processingToolType:'対応道具', processingToolRank:'必要道具ランク', processingRequiredMaterials:'加工に必要な素材', processingResultCount:'加工完成数', processingDifficulty:'加工難易度', processingFee:'施設加工依頼費', source:'入手先', category:'分類', resultItem:'完成品', resultKind:'完成品種別', resultCount:'完成数', requiredMaterials:'必要素材', difficulty:'難度', usageTags:'用途タグ', equipmentUpgradeEffect:'装備強化内容', equipmentUpgradeSlotCost:'消費強化枠', equipmentUpgradeDetail:'効果説明', equipmentUpgradeTarget:'強化対象', namedProcessingOptions:'異名加工データ', unlockAreaKey:'必要解放エリア', unlockFacility:'解放施設', tags:'タグ', notes:'メモ', updatedAt:'更新日時', type:'種別', role:'役割', scrollPrice:'スクロール価格', setItem:'必要装備', rewardMin:'最小報酬', rewardMax:'最大報酬', rewardAvg:'基準報酬', scale:'規模', extraRewards:'追加報酬', sortOrder:'表示順', enabled:'有効', ownerKey:'管理キー', createdBy:'登録者', questCategory:'クエスト分類', requestKind:'依頼区分', questType:'内容種別', areaName:'エリア', questLocation:'実施場所', recommendedSkills:'推奨技能', rewardScope:'報酬範囲', deliveryItems:'納品物', progressStep:'進行度上昇', fixedEvents:'固定イベント', clearCondition:'クリア条件', bossMonster:'設定魔物', questBossName:'クエストボス名', questBossFormation:'クエストボス配置', questBossComposition:'クエストボス構成', battleRoundLimit:'戦闘制限ラウンド', battleRoundSuccess:'制限成功条件', battleRoundFailure:'制限失敗条件', rewardMoney:'報酬金', rewardItems:'報酬アイテム', bonusPoints:'ボーナスポイント', unlockResult:'解放内容', areaType:'エリア種別', unlockKey:'エリア解放キー', unlockOrder:'解放順', unlockCondition:'解放条件', mainMaterials:'主な素材', mainMonsters:'主な魔物', fieldEffect:'フィールド効果', weatherProfiles:'天気プロファイル', timeProfiles:'時間帯プロファイル', eventTableId:'イベント表ID', tableId:'表ID', eventName:'イベント名', eventType:'イベント種別', targetValue:'目標値', treasureTableId:'宝箱表ID', rewardTableId:'入手アイテム表ID', rewardDrawCount:'抽選枠数', tablePurpose:'表用途', encounterCountRule:'出現数ルール', encounterCountMin:'最小出現数', encounterCountMax:'最大出現数', encounterFormation:'配置', encounterComposition:'出現構成', encounterVariantTable:'イベント編成表', treasureRank:'宝箱ランク', chestName:'宝箱名', hasLock:'鍵', unlockDifficulty:'解錠基準難易度', hasTrap:'罠', trapDetectDifficulty:'罠感知基準難易度', trapDisarmDifficulty:'罠解除基準難易度', trapName:'罠の種類', trapEffect:'罠の効果', entryType:'中身種別', entryName:'中身名称', entryPublicId:'中身公開ID', recipeName:'レシピ名', scrollRank:'スクロールランク', quantity:'数量', weight:'重み', facilityName:'施設名', spellType:'術式種別', spellRank:'術式ランク', candidateTags:'候補タグ', conditionType:'前提条件', conditionValue:'条件内容', timeSlots:'有効時間帯', weatherWeights:'天気別抽選倍率', timeWeights:'時間帯別抽選倍率', rumorScope:'噂の有効範囲', result:'結果', progressEffect:'進行/探索効果', monsterType:'魔物種別', monsterTraits:'魔物特性', hp:'HP', mp:'MP', evasionValue:'回避値', resistValue:'抵抗値', defenseValue:'防御値', initiative:'先制値', encounterValue:'遭遇値', individualValueEnabled:'個体値有効', individualValueRule:'個体値ルール', dismantleDifficulty:'解体難易度', actions:'行動', drops:'ドロップ', weaponType:'武器種', timing:'タイミング', cost:'消費', ct:'CT', drawWeight:'排出ウェイト', balanceTier:'強さ区分', balanceReason:'バランス評価', probability:'排出率'
};
function fieldLabelFor(key='', field=''){
  const base=baseKeyForTable(key);
  if(base==='quests' && field==='areaName') return '解放段階';
  if(base==='recipes' && field==='price') return '施設依頼費';
  if(base==='recipes' && field==='recipePrice') return '買値';
  if(base==='recipes' && field==='recipeSellPrice') return '売値';
  return LABELS[field] || field;
}

const FORM_PRIMARY_FIELDS = {
  item_types: ['id','name','description','sortOrder','enabled'],
  item_categories: ['name','itemType','description','sortOrder','enabled'],
  material_types: ['id','name','description','sortOrder','enabled'],
  material_categories: ['name','materialType','description','sortOrder','enabled'],
  material_ranks: ['id','name','price','description','sortOrder','enabled'],
  equipment_categories: ['name','itemCategory','equipSlot','skill','element','power','maxStack','offhandBonus','reloadTurns','modifiers','description','effect','intrinsicEffects','sortOrder','enabled'],
  items: ['name','publicId','csVisible','itemType','itemCategory','buyPrice','sellPrice','rank','toolRank','guaranteeUpgradeMaxRank','equipSlot','skill','power','spellSlots','upgradeLimit','upgradeMaterialMinRank','mpCost','target','checkType','element','description','effect','equipmentEffects','equipmentUpgradeEffect','equipmentUpgradeSlotCost','equipmentUpgradeDetail','equipmentUpgradeTarget','namedProcessingOptions','unlockAreaKey','unlockFacility','tags'],
  recipes: ['name','publicId','rank','recipePrice','recipeSellPrice','recipeSource','craftSkill','price','craftType','category','baseItem','branchType','resultItem','resultKind','resultCount','requiredMaterials','difficulty','description','effect','unlockAreaKey','unlockFacility','tags'],
  materials: ['name','publicId','materialType','materialCategory','rank','buyPrice','sellPrice','source','usageTags','equipmentUpgradeEffect','equipmentUpgradeTarget','description','effect','notes'],
  spells: ['type','name','publicId','rank','mpCost','target','checkType','element','power','description','effect','role','scrollPrice','setItem','unlockFacility','tags'],
  skills: ['name','publicId','rank','category','weaponType','timing','cost','ct','effect','description','drawWeight','balanceTier','balanceReason','enabled','unlockAreaKey','unlockCondition','notes'],
  quest_rewards: ['rank','rewardMin','rewardMax','rewardAvg','scale','description','extraRewards'],
  quests: ['name','questCategory','enabled','requestKind','questType','rank','areaName','questLocation','timeSlots','recommendedSkills','rewardScope','deliveryItems','progressStep','fixedEvents','clearCondition','bossMonster','questBossName','questBossFormation','questBossComposition','battleRoundLimit','battleRoundSuccess','battleRoundFailure','rewardMoney','rewardItems','rewardTableId','rewardDrawCount','bonusPoints','unlockResult','description','notes'],
  exploration_areas: ['name','unlockKey','unlockOrder','areaType','difficulty','unlockCondition','parentAreaId','isHiddenArea','mainMaterials','mainMonsters','fieldEffect','weatherProfiles','timeProfiles','eventTableId','progressStep','description','notes'],
  event_tables: ['tableId','areaName','eventName','eventType','description','conditionType','conditionValue','timeSlots','weatherWeights','timeWeights','rumorScope','checkType','targetValue','treasureTableId','rewardTableId','rewardDrawCount','encounterCountRule','encounterCountMin','encounterCountMax','encounterFormation','encounterComposition','encounterVariantTable','result','progressEffect','notes'],
  treasure_tables: ['tableId','tablePurpose','areaName','treasureRank','chestName','hasLock','unlockDifficulty','hasTrap','trapDetectDifficulty','trapDisarmDifficulty','trapName','trapEffect','hasLock','hasTrap','entryType','entryName','entryPublicId','recipeName','scrollRank','quantity','weight','description','enabled','notes'],
  appraisal_rules: ['facilityName','scrollRank','difficulty','spellType','spellRank','candidateTags','description','enabled','notes'],
  monsters: ['name','monsterType','monsterTraits','rank','hp','mp','evasionValue','resistValue','defenseValue','initiative','encounterValue','individualValueEnabled','individualValueRule','dismantleDifficulty','physicalAffinity','fireAffinity','waterAffinity','windAffinity','thunderAffinity','lightAffinity','darkAffinity','neutralAffinity','pullRule','passiveName','passiveEffect','behaviorAI','fixedActionNames','passiveOnlyActionNames','actionSelectionRules','actions','drops','habit','description','notes']
};
const FORM_LONG_FIELDS = new Set(['habit','description','description','effect','notes','extraRewards','tags','usageTags','fixedEvents','clearCondition','battleRoundSuccess','battleRoundFailure','rewardItems','deliveryItems','unlockResult','mainMaterials','mainMonsters','weatherProfiles','timeProfiles','weatherWeights','timeWeights','result','progressEffect','actions','drops','passiveEffect','behaviorAI','passiveOnlyActionNames','actionSelectionRules','modifiers','encounterComposition','encounterVariantTable','equipmentUpgradeDetail','equipmentEffects','intrinsicEffects','balanceReason','individualValueRule']);
const RECORD_CARD_KEYS = new Set(['items','materials','recipes','spells','skills','exploration_areas']);
const FIELD_PLACEHOLDERS = {
  id:'種別は任意IDを入力。未入力なら自動生成', name:'例：ポーション', csVisible:'TRUEならキャラシ側のDB装備/アイテム候補に表示。FALSEならDBには残るが候補に出しません。', dataKind:'アイテム / 素材', itemType:'例：武器', itemCategory:'例：片手武器', materialType:'例：採取素材', materialCategory:'例：草花', price:'例：100', buyPrice:'例：180', sellPrice:'例：160', rank:'魔物・素材・装備・道具・レシピ・術式・クエスト・宝箱などは1以上の数値。すべての画面で★N表示', toolRank:'例：6。この道具で扱える上限ランク。道具本体も★6に揃え、飛び番を許可します', guaranteeUpgradeMaxRank:'例：6。このアイテムを使うと★6以下の強化素材を使う装備強化が確定成功になります。', description:'見た目や雰囲気を入力', effect:'数値・ルール処理を入力', source:'例：森、獣系魔物、調合', craftType:'例：武器派生 / 調合 / 鍛冶', baseItem:'例：ロングソード。武器派生の派生元を選びます。', branchType:'例：鉱石 / 獣牙 / 植生 / 異界 / 草角。通常武器は大枠の素材系統、ボス武器は素材・特徴を表す固有系統を入力します。画面では「鉱石派生」のように表示します。', equipmentUpgradeEffect:'効果が単独で分かる名称を設定します。例：威力強化、威力固定強化、回復量強化、回復量固定強化、水属性軽減、抵抗妨害。数値や固有名を別欄へ分けません。', equipmentUpgradeSlotCost:'命中強化・回避強化などの基礎補正は1枠。威力固定強化・回復量固定強化・防御強化・術式枠拡張・術式省力化・属性系効果・技能補助は2枠以上。強力な複合効果やボス固有効果は3枠にできます。装備強化に防御値無視は設定しません。', equipmentUpgradeDetail:'すべての装備強化で、実際に適用される処理・補正・条件・重複可否を具体的に入力します。', upgradeMaterialMinRank:'例：3。この装備を強化できる素材の最低ランク。空欄時は装備ランクを使用します。', bagCapacity:'例：8。バッグ種別アイテムの所持品枠数。maxStackには入れません。', usageTags:'例：回復,薬,探索', notes:'補足メモ', sortOrder:'例：10', ownerKey:'空欄なら公開データ', createdBy:'例：GM名・制作者名', requestKind:'通常依頼のみ：拠点内依頼 / エリア依頼 / 納品依頼。重要クエストは空欄', questType:'例：仕分け / 採取 / 討伐 / 納品 / 制限戦闘 / 運搬保護 / 継続行動', battleRoundLimit:'制限戦闘・継続行動など、戦闘中に期限がある依頼へ設定。例：3。第3ラウンド終了までに成功条件を満たす。期限がない依頼は空欄', battleRoundSuccess:'例：3ラウンド以内に指定魔物を撃破する。', battleRoundFailure:'例：第3ラウンド終了時に指定魔物が生存している場合、対象が撤退してクエスト失敗。', recommendedSkills:'納品依頼以外に設定。例：採取・戦闘系技能', rewardScope:'各PC / パーティー共通', deliveryItems:'例：薬草×3, 中和剤×2', areaName:'例：街はずれの草原', questLocation:'例：拠点 / 街はずれの草原', progressStep:'進行ボタン1回で加算する数値。重要クエスト・デイリークエストは25未満にしない。標準は25、短い採取等は50、拠点内単発は100を目安に内容で選択', fixedEvents:'クエスト専用。固定で発生させたい進行区切りだけ登録します。未登録の区切り（0%を含む）は対象エリアのランダムイベントを使用します。探索エリアには通常固定イベントを設定しません', clearCondition:'クリア条件を入力', bossMonster:'例：プチスライム', rewardMoney:'例：80G', rewardItems:'例：ポーション×1', unlockResult:'例：通常依頼の受注許可', areaType:'例：草原 / 異界', difficulty:'例：★1', unlockKey:'例：7UCX-JAUE-E2TH-GLRG-MEGW。エリア名や順番を推測しにくい文字列を設定', unlockOrder:'例：2。表示・並び替え・進行目安に使用します。施設HTMLの自動累積解放には使用しません', unlockAreaKey:'例：area_nearby_forest。商品・作成・派生に必要なエリアID', unlockCondition:'例：初期解放', mainMaterials:'例：薬草, 澄んだ水', mainMonsters:'例：プチスライム', eventTableId:'例：evt_grass_trial', tableId:'例：evt_grass_trial', eventName:'例：薬草の群生', eventType:'例：採取', targetValue:'例：8', treasureTableId:'例：grass_common_cache', rewardTableId:'例：reward_outskirts_grass。拠点内イベント・拠点内依頼・一部エリアイベントで使う入手アイテム表', rewardDrawCount:'例：1 / 2。入手アイテム表から何枠抽選するか', tablePurpose:'宝箱 / 入手アイテム。入手アイテム表は宝箱抽選画面には表示しません', treasureRank:'例：1。画面では★1と表示します', entryType:'例：換金品 / アイテム / レシピ / 未鑑定スクロール', entryName:'例：未鑑定の魔法スクロール：★1', entryPublicId:'例：RCA-XXXX-XXXX', recipeName:'例：ポーション', scrollRank:'例：1。画面では★1と表示します', quantity:'例：1 / 1D3', weight:'例：10。数字が大きいほど出やすい', facilityName:'例：宿屋', spellType:'例：魔法', spellRank:'例：1。画面では★1と表示します', candidateTags:'例：火,攻撃。空欄ならランク内全候補', encounterVariantTable:'1行ごとに「人数範囲<TAB>重み<TAB>出現構成」。例：4-5\t2\t前衛,ミラード,1;前衛,ヴェイル,1。候補が複数ある場合は重み付き抽選。強敵2体以上の候補には通常魔物を混在させません。', result:'成功時の結果', progressEffect:'例：次の採取判定+1、または補足効果', monsterType:'大分類：粘体 / 獣 / 虫 / 植物 / 爬虫 / 水棲 / 軟体 / 霊体 / 造魔 / 竜 / 異界', monsterTraits:'例：飛行,甲殻,異界。複数指定はカンマ区切り', encounterValue:'1～3。魔物単体の戦闘負荷。エリアではなく能力・行動の強さで設定します。', individualValueEnabled:'通常魔物はTRUE、二つ名個体はFALSE。エリアボスはFALSEまたは空欄。', individualValueRule:'通常魔物の遭遇時個体値ルール。二つ名個体・ボスは固定値のため空欄。', dismantleDifficulty:'例：7。採取技能>=解体難易度で判定し、成功時は全ドロップ率+10%（上限100%）。目安はチュートリアル5～6、通常6～9、ボス10以上', pullRule:'可 / 不可', passiveName:'例：胞子反応', passiveEffect:'発動条件・処理・回数制限を具体的に入力', habit:'生息場所・群れ方・警戒時の行動などを1～3文で入力', actions:'行動内容', drops:'例：ゼラチン液：100%（1個）\nぷるぷる膜：50%（1個）', modifiers:'例：hit\t+1\t命中補正。行追加式で能力/技能/戦闘ステータス補正を登録します。', reloadTurns:'例：1。攻撃後に必要な装填ターン数。クロスボウ/ヘヴィクロスボウは1が目安です。'
};

FIELD_PLACEHOLDERS.timeProfiles='1行につき「時間帯\t説明\t出やすい魔物\t出にくい魔物\t出現しない魔物」。通常エリアのみ。例：朝\t朝露が残る\tプチスライム\tカラパスビートル\t';
FIELD_PLACEHOLDERS.timeSlots='例：朝 / 朝,夕。空欄なら制限なし。異界では無視します。';
FIELD_PLACEHOLDERS.timeWeights='例：朝:1.5;昼:0.7。空欄は各時間帯1.0。天気倍率とは乗算します。';
FIELD_PLACEHOLDERS.rumorScope='一日 / 時間帯。時間帯を選んだ場合は「有効時間帯」も設定します。';
FIELD_PLACEHOLDERS.encounterFormation='1体なら前衛。2体以上も前衛を最低1体置きます。全員前衛は可、全員後衛は不可。';
FIELD_PLACEHOLDERS.encounterComposition='例：前衛,ルートハウンド,1;後衛,マイコニド,1。人数確定後に前衛不在なら1体を前衛へ自動移動します。';
FIELD_PLACEHOLDERS.weaponType='例：短剣。汎用戦闘・探索系は「汎用」または「探索」。';
FIELD_PLACEHOLDERS.timing='例：片手槍による攻撃を行う前';
FIELD_PLACEHOLDERS.cost='例：MP1 / HP2 / なし';
FIELD_PLACEHOLDERS.ct='例：2 / 戦闘終了 / クエスト終了';
FIELD_PLACEHOLDERS.drawWeight='例：100。大きいほど排出されやすい。';
FIELD_PLACEHOLDERS.balanceTier='例：標準 / 強力 / 最上位';
FIELD_PLACEHOLDERS.balanceReason='排出ウェイトを決めた理由や、効果の強さ・条件の狭さを記載。';
FIELD_PLACEHOLDERS.fixedActionNames='通常の所持技抽選に必ず含めたい行動名をカンマ区切りで指定します（通常魔物0～2個、候補制二つ名0～3個）。パッシブで参照されるだけでは固定選出になりません。例：雷脈充填 / 高空旋回,風脈急襲';
FIELD_PLACEHOLDERS.behaviorAI='固有の標的・行動優先ルールがある魔物だけ入力します。空欄なら通常どおりGMがランダムに対象・行動を選択します。例：HPが半分以下のPCがいる場合、その中から単体攻撃の対象を優先して選ぶ。';
FIELD_PLACEHOLDERS.passiveOnlyActionNames='固有パッシブからのみ発動し、通常手番の所持技抽選には入れない行動名をカンマ区切りで指定します。チャットパレットには掲載されます。';
FIELD_PLACEHOLDERS.actionSelectionRules='1行につき「行動名\t候補条件」。条件を満たす遭遇では所持技の抽選候補に入り、条件を満たさない場合は候補外になります。条件成立でも確定所持にはなりません。対応条件：味方あり / 前衛後衛あり / 前衛あり / 後衛あり / 強敵不在 / 同名N体未満 / HP:A以上 / 回避:A以上 / 抵抗:A以上 / 攻撃:精密 / 攻撃:強打 / 攻撃:精密I以上 / 攻撃:強打II以上。複数条件は & で連結します。例：鏡像誘導\t味方あり';
const FORM_SELECT_FIELDS = new Set(['dataKind','csVisible','itemType','itemCategory','materialType','materialCategory','rank','toolRank','guaranteeUpgradeMaxRank','equipSlot','skill','checkType','type','role','setItem','unlockAreaKey','unlockFacility','equipmentUpgradeEffect','equipmentUpgradeTarget','ammoUse','ammoKind','craftSkill','craftType','baseItem','branchType','enabled','hasLock','hasTrap','scale','requestKind','questType','rewardScope','areaName','bossMonster','areaType','difficulty','eventType','conditionType','conditionValue','rumorScope','treasureTableId','rewardTableId','tableId','tablePurpose','treasureRank','hasLock','hasTrap','hasLock','hasTrap','entryType','entryName','entryPublicId','recipeName','scrollRank','facilityName','spellType','spellRank','monsterType','resultKind','element','enchantTarget','enchantEffectType','enchantDuration','enchantStackRule','physicalAffinity','fireAffinity','waterAffinity','windAffinity','thunderAffinity','lightAffinity','darkAffinity','neutralAffinity','pullRule','category','weaponType','balanceTier','individualValueEnabled']);
let formState = { key:null, idx:null, mode:'new', defaultDataKind:'', defaultItemType:'' };
let quickCategoryDirty = false;
let currentMainTab = 'categories';
let currentCategoryTab = 'item_types';
let currentRecipeView = '全て';
let currentItemTypeView = '武器';
let currentItemCategoryView = '全て';
let currentMaterialTypeView = '全て';
let currentMaterialCategoryView = '全て';
let currentFacilityView = '鍛冶屋';
let facilityRemovalEntryIds = [];
const currentFacilitySectionByName = {
  '鍛冶屋':'sales','薬屋':'sales','食事処':'recommendations','宿屋':'services','骨董屋':'sales','レシピ販売':'daily','ギルド':'support'
};
let currentFacilityRankLimit = '';
let currentFacilityWeaponCategory = '';
let currentFacilityWeaponBranchSearch = '';
let currentAntiqueRandomRows = [];
let currentAntiqueRandomArea = '';
let currentAntiqueGearRows = [];
let currentAntiqueGearArea = ''; // v90.8.579以前の単一エリア選択との互換用
let currentAntiqueGearUnlockedAreaIds = [];
let antiqueGearAreaModalDraftIds = [];
let currentAntiqueGearDate = '';
let currentAntiqueAppraisalText = '';
let currentSkillDrawResults=[];
let currentSkillStatusMessage='抽選結果だけを表示します。キャラクターの読込・保存は行いません。';
let currentSkillStatusType='ok';
const MEAL_RECOMMEND_STORAGE_KEY = 'recraft_alchemia_meal_recommendation_v2';
const FACILITY_GENERAL_AREA_STORAGE_KEY = 'recraft_alchemia_facility_general_unlocked_areas_v1';
const COPYIST_DAILY_STORAGE_KEY = 'recraft_alchemia_copyist_daily_selection_v2';
const ANTIQUE_GEAR_AREA_STORAGE_KEY = 'recraft_alchemia_antique_gear_area_selection_v1';
const COPYIST_DAILY_COUNT = 6;
let currentMealRecommendationAreaId = ''; // 旧単一選択との互換用
let currentMealRecommendationIds = [];
let currentFacilityGeneralUnlockedAreaIds = [];
let facilityGeneralAreaModalDraftIds = [];
let currentCopyistUnlockedAreaIds = [];
let currentCopyistSpecifiedAreaId = '';
let copyistAreaModalDraftIds = [];
let currentCopyistSelectedIds = [];
let currentCopyistSelectionDate = '';
function copyistTokyoDateKey(){
  try{
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const map=Object.fromEntries(parts.map(part=>[part.type,part.value]));
    return `${map.year}-${map.month}-${map.day}`;
  }catch(_e){return new Date().toISOString().slice(0,10);}
}
function loadCopyistDailyState(){
  try{
    const raw=localStorage.getItem(COPYIST_DAILY_STORAGE_KEY);
    if(!raw)return;
    const data=JSON.parse(raw);
    currentCopyistUnlockedAreaIds=Array.isArray(data.unlockedAreaIds)?data.unlockedAreaIds.map(String):[];
    currentCopyistSpecifiedAreaId=String(data.specifiedAreaId||'');
    currentCopyistSelectionDate=String(data.selectionDate||'');
    currentCopyistSelectedIds=currentCopyistSelectionDate===copyistTokyoDateKey()&&Array.isArray(data.selectedIds)?data.selectedIds.map(String):[];
    if(currentCopyistSelectionDate!==copyistTokyoDateKey())currentCopyistSelectionDate='';
  }catch(e){console.warn('copyist daily state load failed',e);}
}
function saveCopyistDailyState(){
  try{
    localStorage.setItem(COPYIST_DAILY_STORAGE_KEY,JSON.stringify({
      unlockedAreaIds:currentCopyistUnlockedAreaIds.map(String),
      specifiedAreaId:String(currentCopyistSpecifiedAreaId||''),
      selectedIds:currentCopyistSelectedIds.map(String),
      selectionDate:String(currentCopyistSelectionDate||''),
      updatedAt:new Date().toISOString()
    }));
  }catch(e){console.warn('copyist daily state save failed',e);}
}
function loadAntiqueGearAreaState(){
  try{
    const raw=localStorage.getItem(ANTIQUE_GEAR_AREA_STORAGE_KEY);
    if(!raw)return;
    const data=JSON.parse(raw);
    currentAntiqueGearUnlockedAreaIds=Array.isArray(data.unlockedAreaIds)?data.unlockedAreaIds.map(String):[];
  }catch(e){console.warn('antique gear area state load failed',e);}
}
function saveAntiqueGearAreaState(){
  try{
    localStorage.setItem(ANTIQUE_GEAR_AREA_STORAGE_KEY,JSON.stringify({
      unlockedAreaIds:currentAntiqueGearUnlockedAreaIds.map(String),
      updatedAt:new Date().toISOString()
    }));
  }catch(e){console.warn('antique gear area state save failed',e);}
}
function loadFacilityGeneralAreaState(){
  try{
    const raw=localStorage.getItem(FACILITY_GENERAL_AREA_STORAGE_KEY);
    if(!raw)return;
    const data=JSON.parse(raw);
    currentFacilityGeneralUnlockedAreaIds=Array.isArray(data.unlockedAreaIds)?data.unlockedAreaIds.map(String):[];
  }catch(e){ console.warn('facility general area state load failed',e); }
}
function saveFacilityGeneralAreaState(){
  try{localStorage.setItem(FACILITY_GENERAL_AREA_STORAGE_KEY,JSON.stringify({unlockedAreaIds:currentFacilityGeneralUnlockedAreaIds.map(String),updatedAt:new Date().toISOString()}));}
  catch(e){console.warn('facility general area state save failed',e);}
}
function loadMealRecommendationState(){
  try{
    const raw=localStorage.getItem(MEAL_RECOMMEND_STORAGE_KEY);
    if(!raw)return;
    const data=JSON.parse(raw);
    currentMealRecommendationAreaId=String(data.areaId||'');
    currentMealRecommendationIds=Array.isArray(data.ids)?data.ids.map(String):[];
    if(Array.isArray(data.unlockedAreaIds)&&data.unlockedAreaIds.length)currentFacilityGeneralUnlockedAreaIds=data.unlockedAreaIds.map(String);
  }catch(e){ console.warn('meal recommendation state load failed',e); }
}
function saveMealRecommendationState(){
  try{
    localStorage.setItem(MEAL_RECOMMEND_STORAGE_KEY,JSON.stringify({
      areaId:currentMealRecommendationAreaId,
      unlockedAreaIds:currentFacilityGeneralUnlockedAreaIds.map(String),
      ids:currentMealRecommendationIds
    }));
  }catch(e){ console.warn('meal recommendation state save failed',e); }
}
loadFacilityGeneralAreaState();
loadMealRecommendationState();
loadCopyistDailyState();
loadAntiqueGearAreaState();
const GUILD_SUPPORT_STORAGE_KEY = 'recraft_alchemia_guild_support_selection_v2';
const GUILD_SUPPORT_PLAYER_KEY = 'akari';
let currentGuildSupportPlayerKey = GUILD_SUPPORT_PLAYER_KEY;
let currentGuildSupportCount = 3;
let currentGuildSupportDate = '';
let currentGuildSupportIds = [];
let currentGuildSupportCharacters = [];
let currentGuildSupportLoading = false;
let currentGuildSupportLoaded = false;
let currentGuildSupportError = '';

function guildSupportTodayKey(){
  return new Date().toLocaleDateString('sv-SE');
}
function loadGuildSupportState(){
  currentGuildSupportPlayerKey=GUILD_SUPPORT_PLAYER_KEY;
  try{
    const raw=localStorage.getItem(GUILD_SUPPORT_STORAGE_KEY);
    if(!raw){
      currentGuildSupportDate=guildSupportTodayKey();
      return;
    }
    const data=JSON.parse(raw);
    currentGuildSupportCount=Math.max(1,Math.min(10,Number(data.count)||3));
    currentGuildSupportDate=String(data.date||'');
    currentGuildSupportIds=Array.isArray(data.ids)?data.ids.map(String):[];
    if(currentGuildSupportDate!==guildSupportTodayKey()){
      currentGuildSupportDate=guildSupportTodayKey();
      currentGuildSupportIds=[];
    }
  }catch(e){
    console.warn('guild support state load failed',e);
    currentGuildSupportCount=3;
    currentGuildSupportDate=guildSupportTodayKey();
    currentGuildSupportIds=[];
  }
}
function saveGuildSupportState(){
  currentGuildSupportPlayerKey=GUILD_SUPPORT_PLAYER_KEY;
  try{
    currentGuildSupportDate=guildSupportTodayKey();
    localStorage.setItem(GUILD_SUPPORT_STORAGE_KEY,JSON.stringify({
      count:Math.max(1,Math.min(10,Number(currentGuildSupportCount)||3)),
      date:currentGuildSupportDate,
      ids:(currentGuildSupportIds||[]).map(String)
    }));
  }catch(e){console.warn('guild support state save failed',e);}
}
loadGuildSupportState();
const RECIPE_VIEW_META = {
  '全て': {title:'全レシピ', description:'製作区分を問わず、登録されているレシピをすべて表示します。', types:null, defaultCraftType:''},
  '調合': {title:'調合レシピ', description:'薬品・爆弾・香など、薬屋/調合施設で作るアイテムを管理します。', types:['調合'], defaultCraftType:'調合'},
  '料理': {title:'料理', description:'食事処へ持ち込む食材、調理代、食事効果を管理します。', types:['料理'], defaultCraftType:'料理'},
  '鍛冶': {title:'鍛冶レシピ', description:'装備や金属加工など、鍛冶屋で作る通常の鍛冶データを管理します。', types:['鍛冶'], defaultCraftType:'鍛冶'},
  '細工系': {title:'細工・仕掛け製作', description:'細工道具を使う製作と、戦闘用の仕掛け製作をまとめて管理します。', types:['細工','仕掛け製作'], defaultCraftType:'細工'},
  '武器派生': {title:'武器派生', description:'初期武器や基礎武器から素材で上位武器へ派生させるデータです。自作には対応レシピ、必要素材、道具、製作判定が必要です。施設依頼ではレシピ不要です。', types:['武器派生'], defaultCraftType:'武器派生'},
  '防具製作': {title:'防具製作', description:'防具を素材から作成するデータを管理します。', types:['防具製作'], defaultCraftType:'防具製作'},
  '装飾品': {title:'装飾品製作・強化', description:'装飾品の新規製作と、既存装飾品を上位品へ作り替える強化レシピをまとめて表示します。', types:['装飾品製作','装飾品強化'], defaultCraftType:'装飾品製作'},
  'バッグ製作': {title:'バッグ製作', description:'バッグ系アイテムを素材から作成するデータを管理します。', types:['バッグ製作'], defaultCraftType:'バッグ製作'},
  'その他': {title:'その他のレシピ', description:'専用強化など、主要分類に含まれない製作データを表示します。', types:['クリスタル強化'], defaultCraftType:'クリスタル強化'}
};

const ADVANCED_FILTERS = {
  item_types: [{field:'enabled', label:'有効'}],
  item_categories: [{field:'itemType', label:'アイテム種別'},{field:'enabled', label:'有効'}],
  material_types: [{field:'enabled', label:'有効'}],
  material_categories: [{field:'materialType', label:'素材種別'},{field:'enabled', label:'有効'}],
  material_ranks: [{field:'enabled', label:'有効'}],
  equipment_categories: [{field:'itemCategory', label:'分類'},{field:'equipSlot', label:'装備/使用枠'},{field:'skill', label:'使用技能'},{field:'enabled', label:'有効'}],
  items: [{field:'csVisible', label:'キャラシ表示'},{field:'rank', label:'ランク'},{field:'toolRank', label:'使用可能上限'},{field:'guaranteeUpgradeMaxRank', label:'強化確定上限'},{field:'equipSlot', label:'装備/使用枠'},{field:'skill', label:'使用技能'},{field:'unlockAreaKey', label:'必要解放エリア'},{field:'unlockFacility', label:'解放施設'}],
  materials: [{field:'rank', label:'ランク'},{field:'source', label:'入手先'},{field:'equipmentUpgradeEffect', label:'装備強化内容'},{field:'equipmentUpgradeTarget', label:'強化対象'}],
  recipes: [{field:'rank', label:'ランク'},{field:'craftType', label:'製作区分'},{field:'category', label:'分類'},{field:'baseItem', label:'派生元'},{field:'branchType', label:'派生系統名'},{field:'resultKind', label:'完成品種別'},{field:'difficulty', label:'難度'},{field:'unlockAreaKey', label:'必要解放エリア'},{field:'unlockFacility', label:'解放施設'}],
  spells: [{field:'type', label:'種別'},{field:'rank', label:'ランク'},{field:'role', label:'役割'},{field:'target', label:'対象'},{field:'setItem', label:'必要装備'},{field:'unlockFacility', label:'解放施設'}],
  skills: [{field:'rank', label:'ランク'},{field:'category', label:'分類'},{field:'weaponType', label:'武器種'},{field:'balanceTier', label:'強さ区分'},{field:'enabled', label:'有効'},{field:'unlockAreaKey', label:'必要解放エリア'}],
  quest_rewards: [{field:'rank', label:'ランク'},{field:'scale', label:'規模'}],
  quests: [{field:'questCategory', label:'クエスト分類'},{field:'requestKind', label:'依頼区分'},{field:'enabled', label:'有効'},{field:'questType', label:'内容種別'},{field:'rank', label:'ランク'},{field:'areaName', label:'解放段階'},{field:'questLocation', label:'実施場所'},{field:'timeSlots', label:'有効時間帯'},{field:'recommendedSkills', label:'推奨技能'},{field:'rewardScope', label:'報酬範囲'},{field:'bonusPoints', label:'ボーナスポイント'},{field:'questBossName', label:'クエストボス'},{field:'battleRoundLimit', label:'戦闘制限'},{field:'bossMonster', label:'設定魔物'}],
  exploration_areas: [{field:'unlockOrder', label:'解放順'},{field:'areaType', label:'エリア種別'},{field:'isHiddenArea', label:'隠しエリア'},{field:'parentAreaId', label:'親エリアID'},{field:'difficulty', label:'難度'},{field:'eventTableId', label:'イベント表ID'},{field:'progressStep', label:'進行度上昇'},{field:'weatherProfiles', label:'天気設定'},{field:'timeProfiles', label:'時間帯設定'}],
  event_tables: [{field:'tableId', label:'表ID'},{field:'areaName', label:'エリア'},{field:'eventType', label:'イベント種別'},{field:'conditionType', label:'前提条件'},{field:'conditionValue', label:'条件内容'},{field:'timeSlots', label:'有効時間帯'},{field:'weatherWeights', label:'天気倍率'},{field:'timeWeights', label:'時間倍率'},{field:'rumorScope', label:'噂範囲'},{field:'encounterCountRule', label:'出現数'},{field:'treasureTableId', label:'宝箱表'},{field:'rewardTableId', label:'入手アイテム表'},{field:'checkType', label:'判定'}],
  treasure_tables: [{field:'tableId', label:'表ID'},{field:'tablePurpose', label:'表用途'},{field:'areaName', label:'エリア'},{field:'treasureRank', label:'ランク'},{field:'entryType', label:'中身種別'},{field:'enabled', label:'有効'}],
  appraisal_rules: [{field:'facilityName', label:'施設'},{field:'scrollRank', label:'スクロールランク'},{field:'spellType', label:'術式種別'},{field:'spellRank', label:'術式ランク'},{field:'enabled', label:'有効'}],
  monsters: [{field:'monsterType', label:'魔物種別'},{field:'monsterTraits', label:'魔物特性'},{field:'rank', label:'ランク'}]
};

const TABLE_KEYS = [...DATA_KEYS, 'materials'];
const tableUiState = Object.fromEntries(TABLE_KEYS.map(key => [key, { sortField: '', sortDir: 'asc', filters: {}, page: 1, pageSize: 100 }]));
const SHARED_SEARCH_STORAGE_KEY='recraft_alchemia_admin_shared_search_v1';
let sharedSearchTerm='';
try{sharedSearchTerm=String(localStorage.getItem(SHARED_SEARCH_STORAGE_KEY)||'');}catch(_e){}
function syncSharedSearchInputs(except=null){ /* legacy no-op: 一覧検索はタブごとに独立 */ }
function setSharedSearchTerm(value,source=null){ /* legacy no-op: 全横断検索はglobalDataSearchへ分離 */ }
function applySharedSearchToKey(key){ /* v90.8.735: 一覧検索は各一覧ごとに独立。全横断は上部検索を使用する。 */ }

const INITIAL_DATA_FORMAT = 'recraft-alchemia-initial-data';
const GITHUB_COMMON_DATA_FORMAT = 'recraft-alchemia-github-master';
const INITIAL_DATA_PATH = './data/recraft_alchemia_initial_data.json';
const GITHUB_COMMON_DB_REMOTE_BASE = new URL('../../../data/public/',window.location.href).toString();
function setGroupActive(group){
  document.querySelectorAll('[data-tab-group]').forEach(b=>b.classList.toggle('active',b.dataset.tabGroup===group));
  document.querySelectorAll('[data-subnav-group]').forEach(n=>n.classList.toggle('hidden',n.dataset.subnavGroup!==group));
  if(group!=='records') $('recordInternalCategoryBlock')?.classList.add('hidden');
}
function namedIndividualAreaOrder(){
  const out=[];
  NAMED_INDIVIDUALS.forEach(r=>{ if(!out.includes(r.areaName)) out.push(r.areaName); });
  return out;
}
function initializeNamedIndividualsAreaFilter(){
  const sel=$('filter-named_individuals_area');
  if(!sel || sel.dataset.ready==='1') return;
  namedIndividualAreaOrder().forEach(area=>{
    const opt=document.createElement('option'); opt.value=area; opt.textContent=area; sel.appendChild(opt);
  });
  sel.dataset.ready='1';
}
function namedIndividualSearchText(r){
  return [r.areaName,r.baseMonster,r.namedMonster,r.dailyQuestTitle,r.partyBountyG,r.dailyRewardPerPcG,r.namedMaterialName,r.materialRank,r.materialSellPriceG,r.dropRule,r.randomEncounterRule,r.hp,r.evasionValue,r.resistValue,r.defenseValue,r.initiative,r.equipmentUpgradeEffect,r.equipmentUpgradeTarget,r.equipmentUpgradeSlotCost,r.equipmentUpgradeDetail].join(' ').toLowerCase();
}
function namedIndividualCardHtml(r){
  return `<details class="monster-card named-individual-card">
    <summary>
      <div class="monster-card-head"><div class="monster-title"><b>${escapeHtml(r.namedMonster)}</b><span class="monster-id">通常種：${escapeHtml(r.baseMonster)}</span></div></div>
      <div class="named-quest-title">デイリー「${escapeHtml(r.dailyQuestTitle)}」</div>
      <div class="monster-card-summary">
        <div class="monster-stat"><span>PT討伐額</span><b>${escapeHtml(r.partyBountyG)}G</b></div>
        <div class="monster-stat"><span>デイリー報酬</span><b>${escapeHtml(r.dailyRewardPerPcG)}G / PC</b></div>
        <div class="monster-stat"><span>専用素材</span><b>${escapeHtml(r.namedMaterialName)}</b></div>
        <div class="monster-stat"><span>素材ランク</span><b>★${escapeHtml(r.materialRank)}</b></div>
        <div class="monster-stat"><span>HP</span><b>${escapeHtml(r.hp)}</b></div>
        <div class="monster-stat"><span>先制値</span><b>${escapeHtml(r.initiative)}</b></div>
      </div>
    </summary>
    <div class="monster-card-body">
      <div class="record-field-grid">
        <div class="record-field"><span class="record-field-label">二つ名個体</span><div class="record-field-value">${escapeHtml(r.namedMonster)}</div></div>
        <div class="record-field"><span class="record-field-label">通常種</span><div class="record-field-value">${escapeHtml(r.baseMonster)}</div></div>
        <div class="record-field"><span class="record-field-label">固有クエスト表示名</span><div class="record-field-value">${escapeHtml(r.dailyQuestTitle)}</div></div>
        <div class="record-field"><span class="record-field-label">固定討伐額</span><div class="record-field-value">${escapeHtml(r.partyBountyG)}G（PT共通）</div></div>
        <div class="record-field"><span class="record-field-label">デイリー報酬</span><div class="record-field-value">${escapeHtml(r.dailyRewardPerPcG)}G（各PC）</div></div>
        <div class="record-field"><span class="record-field-label">固定戦闘値</span><div class="record-field-value">HP ${escapeHtml(r.hp)} / 回避 ${escapeHtml(r.evasionValue)} / 抵抗 ${escapeHtml(r.resistValue)} / 防御 ${escapeHtml(r.defenseValue)} / 先制 ${escapeHtml(r.initiative)}</div></div>
        <div class="record-field"><span class="record-field-label">ランダム遭遇</span><div class="record-field-value">${escapeHtml(r.randomEncounterRule||'')}</div></div>
        <div class="record-field"><span class="record-field-label">戦闘前表示</span><div class="record-field-value">${escapeHtml(r.randomEncounterDisplay||'')}</div></div>
        <div class="record-field"><span class="record-field-label">専用素材</span><div class="record-field-value named-material-line"><b>${escapeHtml(r.namedMaterialName)}</b><span>★${escapeHtml(r.materialRank)} / 売却${escapeHtml(r.materialSellPriceG)}G</span></div></div>
        <div class="record-field"><span class="record-field-label">ドロップ方式</span><div class="record-field-value">${escapeHtml(r.dropRule)}</div></div>
        <div class="record-field"><span class="record-field-label">特殊強化</span><div class="record-field-value"><b>${escapeHtml(r.equipmentUpgradeEffect)}</b></div></div>
        <div class="record-field"><span class="record-field-label">強化対象 / 消費枠</span><div class="record-field-value">${escapeHtml(r.equipmentUpgradeTarget)} / ${escapeHtml(r.equipmentUpgradeSlotCost)}枠</div></div>
      </div>
      <div class="monster-section"><h4>強化効果</h4><div class="monster-text-block named-upgrade-detail">${escapeHtml(r.equipmentUpgradeDetail)}</div></div>
    </div>
  </details>`;
}
function renderNamedIndividuals(){
  initializeNamedIndividualsAreaFilter();
  const host=$('namedIndividualsList'); if(!host) return;
  const q=String($('filter-named_individuals')?.value||'').trim().toLowerCase();
  const area=String($('filter-named_individuals_area')?.value||'').trim();
  const filtered=NAMED_INDIVIDUALS.filter(r=>(!area||r.areaName===area)&&(!q||namedIndividualSearchText(r).includes(q)));
  const areaOrder=namedIndividualAreaOrder();
  const groups=areaOrder.map(areaName=>({areaName,items:filtered.filter(r=>r.areaName===areaName)})).filter(g=>g.items.length);
  host.innerHTML=groups.length?groups.map(g=>`<section class="monster-area-group"><div class="monster-area-head"><b>${escapeHtml(g.areaName)}</b><span>${g.items.length}体</span></div><div class="monster-card-list">${g.items.map(namedIndividualCardHtml).join('')}</div></section>`).join(''):'<div class="monster-empty-note">条件に一致する二つ名個体がありません。</div>';
  const count=$('namedIndividualsCount'); if(count) count.textContent=`表示 ${filtered.length} / ${NAMED_INDIVIDUALS.length}体`;
}

const GLOBAL_DATA_SEARCH_KEYS=['item_types','item_categories','material_types','material_categories','material_ranks','equipment_categories','items','recipes','spells','skills','quest_rewards','quests','exploration_areas','event_tables','treasure_tables','appraisal_rules','monsters'];
function globalSearchDisplayType(key,row={}){
  if(key==='items') return (String(row.dataKind||'').trim()==='素材'||String(row.itemType||'').trim()==='食材')?'素材':'アイテム';
  return labelKey(key);
}
function globalSearchTitle(key,row={}){
  return String(row.name||row.eventName||row.resultItem||row.tableId||row.publicId||row.id||globalSearchDisplayType(key,row)).trim();
}
function globalSearchMetaParts(key,row={}){
  const vals=[];
  const push=(label,value)=>{const v=String(value??'').trim();if(v)vals.push(`${label}:${v}`);};
  if(row.rank) push('ランク',`★${row.rank}`);
  if(key==='items'){
    push('種別',String(row.dataKind||'').trim()==='素材'?(row.materialType||'素材'):(row.itemType||''));
    push('分類',row.materialCategory||row.itemCategory);
    push('登録ID',row.publicId);
  }else if(key==='recipes'){
    push('製作',row.craftType);push('分類',row.category);push('完成品',row.resultItem);push('解放',row.unlockAreaKey);
  }else if(key==='quests'){
    push('分類',row.questCategory);push('内容',row.questType);push('エリア',row.areaName);
  }else if(key==='monsters'){
    push('種別',row.monsterType);push('エリア',row.areaName);
  }else if(key==='event_tables'){
    push('エリア',row.areaName);push('種別',row.eventType);push('表ID',row.tableId);
  }else if(key==='spells'){
    push('種別',row.type);push('役割',row.role);push('登録ID',row.publicId);
  }else if(key==='skills'){
    push('分類',row.category);push('武器種',row.weaponType);push('登録ID',row.publicId);
  }else{
    push('ID',row.publicId||row.id);push('分類',row.category||row.itemCategory||row.materialCategory||row.areaType||row.tablePurpose);
  }
  return vals.slice(0,5);
}
function globalSearchScore(key,row,tokens){
  const title=normalizeAdminSearchText(globalSearchTitle(key,row));
  const id=normalizeAdminSearchText(row.publicId||row.id||'');
  let score=0;
  tokens.forEach(t=>{if(title===t)score+=40;else if(title.startsWith(t))score+=20;else if(title.includes(t))score+=10;if(id===t)score+=30;else if(id.includes(t))score+=8;});
  return score;
}
function globalSearchRows(query){
  const tokens=adminSearchTokens(query);if(!tokens.length)return [];
  const out=[];
  GLOBAL_DATA_SEARCH_KEYS.forEach(key=>{
    (state[key]||[]).forEach((row,idx)=>{
      if(rowMatchesTextQuery(row,query,key)) out.push({key,row,idx,score:globalSearchScore(key,row,tokens)});
    });
  });
  out.sort((a,b)=>b.score-a.score || globalSearchDisplayType(a.key,a.row).localeCompare(globalSearchDisplayType(b.key,b.row),'ja') || globalSearchTitle(a.key,a.row).localeCompare(globalSearchTitle(b.key,b.row),'ja',{numeric:true}));
  return out;
}
function renderGlobalDataSearch(){
  const input=$('globalDataSearch'),host=$('globalDataSearchResults'),count=$('globalDataSearchCount');
  if(!input||!host||!count)return;
  const q=String(input.value||'').trim();
  if(!q){host.classList.add('hidden');host.innerHTML='';count.textContent='未検索';return;}
  const rows=globalSearchRows(q);count.textContent=`${rows.length}件ヒット`;
  const visible=rows.slice(0,100);
  const groups=new Map();
  visible.forEach(item=>{const label=globalSearchDisplayType(item.key,item.row);if(!groups.has(label))groups.set(label,[]);groups.get(label).push(item);});
  const html=[...groups.entries()].map(([label,items])=>`<section class="admin-global-search-group"><div class="admin-global-search-group-head"><span>${escapeHtml(label)}</span><span>${items.length}件</span></div><div class="admin-global-search-cards">${items.map(({key,row,idx})=>`<article class="admin-global-search-card"><div><div class="admin-global-search-card-title">${escapeHtml(globalSearchTitle(key,row))}</div><div class="admin-global-search-card-meta">${globalSearchMetaParts(key,row).map(v=>`<span class="admin-search-chip">${escapeHtml(v)}</span>`).join('')}</div></div><div class="admin-global-search-card-actions"><button type="button" class="ghost" data-global-search-list="${escapeHtml(key)}:${idx}">一覧で見る</button><button type="button" class="secondary" data-global-search-edit="${escapeHtml(key)}:${idx}">編集</button></div></article>`).join('')}</div></section>`).join('');
  host.innerHTML=html || '<div class="admin-global-search-empty">一致するデータがありません。</div>';
  if(rows.length>visible.length)host.insertAdjacentHTML('beforeend',`<div class="notice">先頭100件を表示しています。検索語を追加して絞り込んでください。</div>`);
  host.classList.remove('hidden');
}
function setLocalListSearch(key,value){
  const input=$('filter-'+key);if(input)input.value=String(value||'');
  resetTablePage(key);
}
function navigateToGlobalSearchRow(key,idx){
  const row=(state[key]||[])[Number(idx)];if(!row)return;
  const title=globalSearchTitle(key,row);
  if(key==='items'){
    const isMaterial=String(row.dataKind||'').trim()==='素材'||String(row.itemType||'').trim()==='食材';
    if(isMaterial){
      currentMaterialTypeView=String(row.itemType||'').trim()==='食材'?'食材':(canonicalMaterialTypeName(row.materialType)||'全て');
      currentMaterialCategoryView=String(row.itemType||'').trim()==='食材'?(String(row.itemCategory||'').trim()||'全て'):(String(row.materialCategory||'').trim()||'全て');
      setLocalListSearch('materials',title);showPanel('materials');
    }else{
      currentItemTypeView=adminBroadItemType(row)||'全て';currentItemCategoryView=adminItemInternalCategory(row,currentItemTypeView)||'全て';
      setLocalListSearch('items',title);showPanel('items');
    }
  }else if(key==='recipes'){
    currentRecipeView=recipeViewKeyForCraftType(row.craftType);setLocalListSearch('recipes',title);showPanel('recipes');
  }else if(['item_types','item_categories','material_types','material_categories','material_ranks'].includes(key)){
    setLocalListSearch(key,title);showCategorySubpanel(key);
  }else{
    setLocalListSearch(key,title);showPanel(key);
  }
  const panel=key==='items'&&((String(row.dataKind||'').trim()==='素材')||String(row.itemType||'').trim()==='食材')?$('panel-materials'):$('panel-'+key);
  panel?.scrollIntoView({behavior:'smooth',block:'start'});
}


function showPanel(key){
  currentMainTab=key;
  const group = inferGroupFromPanel(key);
  setGroupActive(group);
  document.querySelectorAll('[data-main-tab]').forEach(b=>{
    const isActive = key === 'recipes' && b.dataset.mainTab === 'recipes' && b.dataset.recipeView !== undefined
      ? b.dataset.recipeView === activeRecipeCraftType()
      : key === 'facilities' && b.dataset.mainTab === 'facilities' && b.dataset.facilityView !== undefined
        ? b.dataset.facilityView === currentFacilityView
        : key === 'items' && b.dataset.mainTab === 'items' && b.dataset.itemTypeView !== undefined
          ? b.dataset.itemTypeView === currentItemTypeView
          : b.dataset.mainTab === key;
    b.classList.toggle('active', isActive);
  });
  if (group !== 'categories') document.querySelectorAll('[data-category-subtab]').forEach(b=>b.classList.remove('active'));
  MAIN_PANELS.forEach(k=>$('panel-'+k).classList.toggle('hidden',k!==key));
  renderRecordItemTypeTabs();
  renderRecordInternalCategoryTabs();
  if(key==='items') updateItemViewUi();
  if(TABLE_KEYS.includes(key)){ applySharedSearchToKey(key); renderTable(key); }
  if(key==='named_individuals') renderNamedIndividuals();
}
function showCategorySubpanel(key){
  setGroupActive('categories');
  currentMainTab='categories';
  document.querySelectorAll('[data-main-tab]').forEach(b=>b.classList.remove('active'));
  currentCategoryTab=key;
  document.querySelectorAll('[data-category-subtab]').forEach(b=>b.classList.toggle('active',b.dataset.categorySubtab===key));
  MAIN_PANELS.forEach(k=>$('panel-'+k).classList.toggle('hidden',k!=='categories'));
  CATEGORY_KEYS.forEach(k=>$('panel-'+k).classList.toggle('hidden',k!==key));
  if(TABLE_KEYS.includes(key)){ applySharedSearchToKey(key); renderTable(key); }
}
function inferGroupFromPanel(key){
  if(key==='categories' || key==='equipment_categories') return 'categories';
  if(['items','materials','recipes','spells','skills'].includes(key)) return 'records';
  if(['quest_rewards','quests','exploration_areas','event_tables','treasure_tables','appraisal_rules','monsters','named_individuals'].includes(key)) return 'adventure';
  if(key==='facilities') return 'facilities';
  if(key==='json' || key==='help') return 'tools';
  return 'categories';
}

document.addEventListener('change',e=>{
  if(e.target?.id==='filter-named_individuals_area'){ renderNamedIndividuals(); return; }
  const el=e.target;
  if(!(el instanceof HTMLSelectElement)) return;
  if(el.matches('[data-record-item-type-select]')){
    currentItemTypeView=el.value||'全て'; currentItemCategoryView='全て'; resetTablePage('items');
    if(currentMainTab!=='items') showPanel('items'); else { renderRecordItemTypeTabs(); renderRecordInternalCategoryTabs(); updateItemViewUi(); renderTable('items'); }
    return;
  }
  if(el.matches('[data-record-item-category-select]')){
    currentItemCategoryView=el.value||'全て'; resetTablePage('items'); renderRecordInternalCategoryTabs(); updateItemViewUi(); renderTable('items'); return;
  }
  if(el.matches('[data-record-material-type-select]')){
    currentMaterialTypeView=el.value||'全て'; currentMaterialCategoryView='全て'; resetTablePage('materials'); renderRecordInternalCategoryTabs(); updateMaterialViewUi(); renderTable('materials'); return;
  }
  if(el.matches('[data-record-material-category-select]')){
    currentMaterialCategoryView=el.value||'全て'; resetTablePage('materials'); renderRecordInternalCategoryTabs(); renderTable('materials'); return;
  }
});

document.addEventListener('click',e=>{
  const globalClear=e.target.closest('#globalDataSearchClear'); if(globalClear){const input=$('globalDataSearch');if(input)input.value='';renderGlobalDataSearch();input?.focus();return;}
  const globalEdit=e.target.closest('[data-global-search-edit]'); if(globalEdit){const [k,i]=String(globalEdit.dataset.globalSearchEdit||'').split(':');if(k&&Number.isInteger(Number(i)))openForm(k,Number(i),'edit');return;}
  const globalList=e.target.closest('[data-global-search-list]'); if(globalList){const [k,i]=String(globalList.dataset.globalSearchList||'').split(':');if(k&&Number.isInteger(Number(i)))navigateToGlobalSearchRow(k,Number(i));return;}
  const addMealMaterial=e.target.closest('[data-add-meal-material]');
  if(addMealMaterial){
    const target=$('editModal')?.querySelector('[data-form-field="requiredMaterials"]');
    if(!target)return;
    const name=String(addMealMaterial.dataset.addMealMaterial||'').trim();
    if(!name)return;
    const lines=String(target.value||'').split(/\n+/).map(v=>v.trim()).filter(Boolean);
    if(!lines.some(line=>line.replace(/×\s*\d+.*$/,'').trim()===name)) lines.push(`${name}×1`);
    target.value=lines.join('\n');
    target.dispatchEvent(new Event('input',{bubbles:true}));
    toast(`${name}を必要素材へ追加しました`);
    return;
  }
  const monsterCardActionButton=e.target.closest('.monster-card-actions button');
  if(monsterCardActionButton) e.preventDefault();
  const monsterToken=e.target.closest('[data-monster-token]'); if(monsterToken){ outputMonsterToken(+monsterToken.dataset.monsterToken); return; }
  const monsterPalette=e.target.closest('[data-monster-palette]'); if(monsterPalette){ outputMonsterPalette(+monsterPalette.dataset.monsterPalette); return; }
  const copyCard=e.target.closest('[data-copy-card]'); if(copyCard){ const [k,i]=copyCard.dataset.copyCard.split(':'); copyRowCard(k,+i); return; }
  const copyId=e.target.closest('[data-copy-public-id]'); if(copyId){ const [k,i]=copyId.dataset.copyPublicId.split(':'); copyRowPublicId(k,+i); return; }
  const rowSave=e.target.closest('[data-row-save]'); if(rowSave){ const [k,i]=rowSave.dataset.rowSave.split(':'); saveSingleRow(k,+i,'upsert'); return; }
  const rowReplace=e.target.closest('[data-row-replace]'); if(rowReplace){ const [k,i]=rowReplace.dataset.rowReplace.split(':'); saveSingleRow(k,+i,'replace'); return; }
  const addAction=e.target.closest('[data-monster-action-add]'); if(addAction){ const editor=addAction.closest('[data-monster-actions-editor]'); editor.querySelector('[data-monster-action-list]').insertAdjacentHTML('beforeend', monsterActionRowHtml({element:'物'})); syncMonsterActionEditor(editor); return; }
  const remAction=e.target.closest('[data-monster-action-remove]'); if(remAction){ const editor=remAction.closest('[data-monster-actions-editor]'); remAction.closest('[data-monster-action-row]')?.remove(); syncMonsterActionEditor(editor); return; }
  const addDrop=e.target.closest('[data-monster-drop-add]'); if(addDrop){ const editor=addDrop.closest('[data-monster-drops-editor]'); editor.querySelector('[data-monster-drop-list]').insertAdjacentHTML('beforeend', monsterDropRowHtml({})); syncMonsterDropEditor(editor); return; }
  const remDrop=e.target.closest('[data-monster-drop-remove]'); if(remDrop){ const editor=remDrop.closest('[data-monster-drops-editor]'); remDrop.closest('[data-monster-drop-row]')?.remove(); syncMonsterDropEditor(editor); return; }
  const addFixed=e.target.closest('[data-quest-fixed-event-add]'); if(addFixed){ const editor=addFixed.closest('[data-quest-fixed-events-editor]'); const list=editor.querySelector('[data-quest-fixed-event-list]'); list.querySelector('[data-quest-fixed-empty]')?.remove(); const rows=readQuestFixedEventRows(editor); const step=currentFormValue('progressStep')||'25%'; list.insertAdjacentHTML('beforeend', questFixedEventRowHtml({progress:nextQuestFixedEventPercent(rows, step)}, step, rows.length)); syncQuestFixedEventsEditor(editor); return; }
  const remFixed=e.target.closest('[data-quest-fixed-event-remove]'); if(remFixed){ const editor=remFixed.closest('[data-quest-fixed-events-editor]'); remFixed.closest('[data-quest-fixed-event-row]')?.remove(); const list=editor.querySelector('[data-quest-fixed-event-list]'); if(!list.querySelector('[data-quest-fixed-event-row]')) list.innerHTML='<div class="muted small" data-quest-fixed-empty>固定イベントはまだありません。</div>'; syncQuestFixedEventsEditor(editor); return; }
  const addMod=e.target.closest('[data-modifier-add]'); if(addMod){ const editor=addMod.closest('[data-modifier-editor]'); const list=editor.querySelector('[data-modifier-list]'); list.querySelector('[data-modifier-empty]')?.remove(); const idx=list.querySelectorAll('[data-modifier-row]').length; list.insertAdjacentHTML('beforeend', modifierEditorRowHtml({}, idx)); syncModifierEditor(editor); return; }
  const remMod=e.target.closest('[data-modifier-remove]'); if(remMod){ const editor=remMod.closest('[data-modifier-editor]'); remMod.closest('[data-modifier-row]')?.remove(); const list=editor.querySelector('[data-modifier-list]'); if(!list.querySelector('[data-modifier-row]')) list.innerHTML='<div class="muted small" data-modifier-empty>補正値はまだありません。</div>'; syncModifierEditor(editor); return; }
  const addEqEffect=e.target.closest('[data-equipment-effect-add]'); if(addEqEffect){
    const editor=addEqEffect.closest('[data-equipment-effects-editor]'); const list=editor.querySelector('[data-equipment-effect-list]');
    list.querySelector('[data-equipment-effect-empty]')?.remove();
    list.insertAdjacentHTML('beforeend',adminEquipmentEffectRowHtml({})); syncAdminEquipmentEffectsEditor(editor); return;
  }
  const remEqEffect=e.target.closest('[data-equipment-effect-remove]'); if(remEqEffect){
    const editor=remEqEffect.closest('[data-equipment-effects-editor]'); remEqEffect.closest('[data-equipment-effect-row]')?.remove();
    const list=editor.querySelector('[data-equipment-effect-list]'); if(!list.querySelector('[data-equipment-effect-row]')) list.innerHTML='<div class="muted small" data-equipment-effect-empty>効果はまだありません。</div>';
    syncAdminEquipmentEffectsEditor(editor); return;
  }
  const addNp=e.target.closest('[data-named-process-add]'); if(addNp){
    const editor=addNp.closest('[data-named-process-editor]');
    const list=editor.querySelector('[data-named-process-list]');
    const empty=[{id:'',namedMonster:'',material:'',changeLabel:'',fullBefore:'',fullAfter:'',requiredMaterials:'',facilityFeeG:'',difficulty:'',craftSkill:''}];
    const tmp=document.createElement('div'); tmp.innerHTML=adminNamedProcessingEditor(empty);
    const body=tmp.querySelector('[data-named-process-body]');
    list.innerHTML=body?body.outerHTML:'<div class="muted small">編集欄の生成に失敗しました。</div>';
    addNp.remove(); syncAdminNamedProcessingEditor(editor); return;
  }
  const remNp=e.target.closest('[data-named-process-remove]'); if(remNp){
    const editor=remNp.closest('[data-named-process-editor]'); const list=editor.querySelector('[data-named-process-list]');
    list.innerHTML='<div class="muted small" data-named-process-empty>異名加工は未設定です。</div>';
    if(!editor.querySelector('[data-named-process-add]')) editor.insertAdjacentHTML('beforeend','<button type="button" class="secondary" data-named-process-add>異名加工を追加</button>');
    syncAdminNamedProcessingEditor(editor); return;
  }
  const quickCat=e.target.closest('[data-quick-category-field]'); if(quickCat){ quickCreateCategory(quickCat.dataset.quickCategoryField); return; }
  const upgradeReset=e.target.closest('[data-facility-upgrade-reset]'); if(upgradeReset){ if($('facilityUpgradeEquipmentSelect')) $('facilityUpgradeEquipmentSelect').value=''; if($('facilityUpgradeMaterialInput')) $('facilityUpgradeMaterialInput').value=''; if($('facilityUpgradeGuaranteeItem')) $('facilityUpgradeGuaranteeItem').value=''; if($('facilityUpgradeCountInput')) $('facilityUpgradeCountInput').value='0'; if($('facilityUpgradeStepInput')) $('facilityUpgradeStepInput').value='1'; if($('facilityUpgradeSupportCountInput')) $('facilityUpgradeSupportCountInput').value='0'; facilityRemovalEntryIds=[]; renderFacilityUpgradeResult(''); renderFacilityRemovalCalculator(); toast('装備強化の選択をリセットしました'); return; }
  const facilitySection=e.target.closest('[data-facility-section]'); if(facilitySection){
    currentFacilitySectionByName[currentFacilityView]=facilitySection.dataset.facilitySection||facilitySectionDefs(currentFacilityView)[0][0];
    renderFacilitiesPanel();
    if(currentFacilityView==='ギルド' && currentFacilitySectionByName[currentFacilityView]==='support' && currentGuildSupportPlayerKey && !currentGuildSupportLoaded && !currentGuildSupportLoading){
      loadGuildSupportCharacters(false);
    }
    return;
  }
  const fortuneRoll=e.target.closest('[data-fortune-roll]'); if(fortuneRoll){ rollAdminFortune(); toast('今日の運勢を決定しました'); return; }
  const fortuneCopy=e.target.closest('[data-fortune-copy]'); if(fortuneCopy){ const text=adminFortuneCopyText(); if(!text){toast('先に運勢を振ってください');return;} copyAdminTextDirect(text).then(ok=>{if(ok)toast('今日の運勢をコピーしました');}); return; }
  const facilityGeneralAreaOpen=e.target.closest('[data-facility-general-area-open]'); if(facilityGeneralAreaOpen){ openFacilityGeneralAreaModal(); return; }
  const facilityGeneralAreaCancel=e.target.closest('[data-facility-general-area-cancel]'); if(facilityGeneralAreaCancel){ closeFacilityGeneralAreaModal(); return; }
  const facilityGeneralAreaApply=e.target.closest('[data-facility-general-area-apply]'); if(facilityGeneralAreaApply){ applyFacilityGeneralAreaModal(); return; }
  const mealAreaOpen=e.target.closest('[data-meal-area-modal-open]'); if(mealAreaOpen){ openFacilityMealAreaModal(); return; }
  const mealReroll=e.target.closest('[data-meal-reroll]'); if(mealReroll){ drawMealRecommendations(); renderFacilitiesPanel(); toast('今日のおすすめ3品を再抽選しました'); return; }
  const mealRecommendCopy=e.target.closest('[data-meal-recommend-copy]'); if(mealRecommendCopy){ copyAdminTextDirect(mealRecommendationsText()).then(ok=>{if(ok)toast('今日のおすすめ3品をコピーしました');}); return; }
  const copyistAreaOpen=e.target.closest('[data-copyist-area-open]'); if(copyistAreaOpen){openCopyistAreaModal();return;}
  const copyistAreaCancel=e.target.closest('[data-copyist-area-cancel]'); if(copyistAreaCancel){closeCopyistAreaModal();return;}
  const copyistAreaApply=e.target.closest('[data-copyist-area-apply]'); if(copyistAreaApply){applyCopyistAreaModal();return;}
  const copyistDraw=e.target.closest('[data-copyist-draw]'); if(copyistDraw){ const full=drawCopyistDailyRows(); renderFacilitiesPanel(); toast(full?'レシピ販売の販売する6枠を選出しました':'候補数が不足しているため選出可能な範囲で決定しました'); return; }
  const copyistCopy=e.target.closest('[data-copyist-copy]'); if(copyistCopy){ if(!copyistSelectedRows().length){toast('先に販売品を選出してください');return;} copyAdminTextDirect(copyistDailyText()).then(ok=>{if(ok)toast('レシピ販売の品揃えをコピーしました');}); return; }
  const weaponCategory=e.target.closest('[data-facility-weapon-category]'); if(weaponCategory){ currentFacilityWeaponCategory=weaponCategory.dataset.facilityWeaponCategory||''; renderFacilitiesPanel(); return; }
  const guildSupportLoad=e.target.closest('[data-guild-support-load]'); if(guildSupportLoad){ loadGuildSupportCharacters(true); return; }
  const guildSupportReroll=e.target.closest('[data-guild-support-reroll]'); if(guildSupportReroll){ rerollGuildSupportCharacters(); return; }
  const guildSupportCopy=e.target.closest('[data-guild-support-copy]'); if(guildSupportCopy){ copyAdminTextDirect(guildSupportListText()).then(ok=>{if(ok)toast('本日のサポートキャラクター一覧をコピーしました');}); return; }
  const facilityRemovalAdd=e.target.closest('[data-facility-removal-add]'); if(facilityRemovalAdd){addFacilityRemovalEntry();return;}
  const facilityRemovalClear=e.target.closest('[data-facility-removal-clear]'); if(facilityRemovalClear){facilityRemovalEntryIds=[];renderFacilityRemovalCalculator();toast('全強化解除の設定をクリアしました');return;}
  const facilityRemovalRemove=e.target.closest('[data-facility-removal-remove]'); if(facilityRemovalRemove){const idx=Number(facilityRemovalRemove.dataset.facilityRemovalRemove);if(Number.isInteger(idx)&&idx>=0)facilityRemovalEntryIds.splice(idx,1);renderFacilityRemovalCalculator();return;}
  const facilityUpgradeCheck=e.target.closest('[data-facility-upgrade-check]'); if(facilityUpgradeCheck){ renderFacilityUpgradeResult(); return; }
  const facilityAlchemyCheck=e.target.closest('[data-facility-alchemy-check]'); if(facilityAlchemyCheck){ renderFacilityAlchemyResult(); return; }
  const antiqueGearAreaOpen=e.target.closest('[data-antique-gear-area-open]'); if(antiqueGearAreaOpen){openAntiqueGearAreaModal();return;}
  const antiqueGearAreaCancel=e.target.closest('[data-antique-gear-area-cancel]'); if(antiqueGearAreaCancel){closeAntiqueGearAreaModal();return;}
  const antiqueGearAreaApply=e.target.closest('[data-antique-gear-area-apply]'); if(antiqueGearAreaApply){applyAntiqueGearAreaModal();return;}
  const facilityAntiqueGearDraw=e.target.closest('[data-facility-antique-gear-draw]'); if(facilityAntiqueGearDraw){ drawAntiqueGearStock(); return; }
  const antiqueGearIssueId=e.target.closest('[data-antique-gear-issue-id]'); if(antiqueGearIssueId){const idx=Number(antiqueGearIssueId.dataset.antiqueGearIssueId);if(Number.isInteger(idx)&&idx>=0)antiqueIssueRegistrationId(idx);return;}
  const facilityAntiqueGearCopy=e.target.closest('[data-facility-antique-gear-copy]'); if(facilityAntiqueGearCopy){
    if(!(currentAntiqueGearRows||[]).length){toast('先に骨董装備を選出してください');return;}
    copyAdminTextDirect(antiqueGearCopyText()).then(ok=>{if(ok)toast('骨董装備の選出結果をコピーしました');});return;
  }
  const facilityAntiqueRandom=e.target.closest('[data-facility-antique-random]'); if(facilityAntiqueRandom){ renderAntiqueRandomStock(); return; }
  const facilityAntiqueRandomCopy=e.target.closest('[data-facility-antique-random-copy]'); if(facilityAntiqueRandomCopy){
    if(!(currentAntiqueRandomRows||[]).length){ toast('先に未鑑定スクロールを選出してください'); return; }
    copyAdminTextDirect(antiqueRandomStockText()).then(ok=>{if(ok)toast('未鑑定スクロールの選出結果をコピーしました');});
    return;
  }
  const facilityAppraisalCheck=e.target.closest('[data-facility-appraisal-check]'); if(facilityAppraisalCheck){ renderAntiqueAppraisalResult(true); return; }
  const facilityAppraisalCopy=e.target.closest('[data-facility-appraisal-copy]'); if(facilityAppraisalCopy){
    if(!currentAntiqueAppraisalText){ toast('先に鑑定結果を決定してください'); return; }
    copyAdminTextDirect(currentAntiqueAppraisalText).then(ok=>{if(ok) toast('鑑定後スクロールをコピーしました');});
    return;
  }
  const facilityTranscribeCheck=e.target.closest('[data-facility-transcribe-check]'); if(facilityTranscribeCheck){ renderAntiqueTranscriptionResult(); return; }
  const skillDraw=e.target.closest('[data-skill-gacha-draw]'); if(skillDraw){ executeSkillGacha(); return; }
  const skillCopy=e.target.closest('[data-skill-gacha-copy]'); if(skillCopy){ copySkillGachaResults(); return; }
  const helpCopy=e.target.closest('[data-help-copy]'); if(helpCopy){ copySystemHelp(); return; }
  const helpExpand=e.target.closest('[data-help-expand]'); if(helpExpand){ document.querySelectorAll('#helpCards details').forEach(d=>d.open=true); return; }
  const helpCollapse=e.target.closest('[data-help-collapse]'); if(helpCollapse){ document.querySelectorAll('#helpCards details').forEach(d=>d.open=false); return; }
  const pageButton=e.target.closest('[data-table-page]');
  if(pageButton){
    const [key,direction]=String(pageButton.dataset.tablePage||'').split(':');
    const ui=tableUiState[key];
    if(ui){ ui.page=Math.max(1,(Number(ui.page)||1)+(direction==='next'?1:-1)); renderTable(key); }
    return;
  }
  const groupTab=e.target.closest('[data-tab-group]');
  if(groupTab){
    const group=groupTab.dataset.tabGroup;
    setGroupActive(group);
    if(group==='categories') showCategorySubpanel(currentCategoryTab || 'item_types');
    else if(group==='records') showPanel('items');
    else {
      const first=document.querySelector(`[data-subnav-group="${group}"] [data-main-tab]:not(:disabled)`);
      if(first){ showPanel(first.dataset.mainTab); }
    }
    return;
  }
  const mainTab=e.target.closest('[data-main-tab]');
  if(mainTab){
    const key=mainTab.dataset.mainTab;
    if(mainTab.dataset.recipeView !== undefined){ currentRecipeView = mainTab.dataset.recipeView || '全て'; resetTablePage('recipes'); }
    if(mainTab.dataset.itemTypeView !== undefined){ currentItemTypeView = mainTab.dataset.itemTypeView || currentItemTypeView; currentItemCategoryView='全て'; resetTablePage('items'); }
    if(mainTab.dataset.facilityView !== undefined) currentFacilityView = mainTab.dataset.facilityView || '鍛冶屋';
    setGroupActive(inferGroupFromPanel(key));
    showPanel(key);
    if(key==='facilities') renderFacilitiesPanel();
    if(key!=='categories') document.querySelectorAll('[data-category-subtab]').forEach(b=>b.classList.remove('active'));
  }
  const catTab=e.target.closest('[data-category-subtab]');
  if(catTab){
    setGroupActive('categories');
    showCategorySubpanel(catTab.dataset.categorySubtab);
  }
  const recordItemCategory=e.target.closest('[data-record-item-category]'); if(recordItemCategory){ currentItemCategoryView=recordItemCategory.dataset.recordItemCategory||'全て'; renderRecordInternalCategoryTabs(); updateItemViewUi(); resetTablePage('items'); renderTable('items'); return; }
  const recordMaterialType=e.target.closest('[data-record-material-type]'); if(recordMaterialType){ currentMaterialTypeView=recordMaterialType.dataset.recordMaterialType||'全て'; currentMaterialCategoryView='全て'; renderRecordInternalCategoryTabs(); updateMaterialViewUi(); resetTablePage('materials'); renderTable('materials'); return; }
  const recordMaterialCategory=e.target.closest('[data-record-material-category]'); if(recordMaterialCategory){ currentMaterialCategoryView=recordMaterialCategory.dataset.recordMaterialCategory||'全て'; renderRecordInternalCategoryTabs(); resetTablePage('materials'); renderTable('materials'); return; }
  const addCurrentType=e.target.closest('[data-add-current-item-type]'); if(addCurrentType){ addCurrentItemType(); return; }
  const addCurrentMaterialBtn=e.target.closest('[data-add-current-material]'); if(addCurrentMaterialBtn){ addCurrentMaterial(); return; }
  const copyUnlockKey=e.target.closest('[data-copy-unlock-key]'); if(copyUnlockKey){ copyExplorationUnlockKey(copyUnlockKey.dataset.copyUnlockKey); return; }
  const copyFormUnlock=e.target.closest('[data-copy-form-unlock-key]'); if(copyFormUnlock){ copyFormExplorationUnlockKey(); return; }
  const generateFormUnlock=e.target.closest('[data-generate-form-unlock-key]'); if(generateFormUnlock){ generateFormExplorationUnlockKey(); return; }
  const addRecipeCraft=e.target.closest('[data-add-recipe-craft]'); if(addRecipeCraft){ addRecipeWithCraft(addRecipeCraft.dataset.addRecipeCraft); return; }
  const addKind=e.target.closest('[data-add-kind]'); if(addKind) addRowWithKind(addKind.dataset.addKind);
  const add=e.target.closest('[data-add]'); if(add) addRow(add.dataset.add);
  const editRow=e.target.closest('[data-edit-row]'); if(editRow){const [k,i]=editRow.dataset.editRow.split(':'); openForm(k,+i,'edit');}
  const reset=e.target.closest('[data-reset]'); if(reset) resetKey(reset.dataset.reset);
  const load=e.target.closest('[data-load]'); if(load) loadSheet(load.dataset.load);
  const save=e.target.closest('[data-save]'); if(save) saveSheet(save.dataset.save);
  const replace=e.target.closest('[data-replace]'); if(replace) replaceSheet(replace.dataset.replace);
  const del=e.target.closest('[data-del]'); if(del){const [k,i]=del.dataset.del.split(':'); deleteRow(k,+i);}
  const dup=e.target.closest('[data-dup]'); if(dup){const [k,i]=dup.dataset.dup.split(':'); duplicateRow(k,+i);}
  const sort=e.target.closest('[data-sort]'); if(sort){
    const [key,field]=sort.dataset.sort.split(':');
    const ui=tableUiState[key];
    if(ui.sortField===field){ ui.sortDir = ui.sortDir==='asc' ? 'desc' : 'asc'; }
    else { ui.sortField=field; ui.sortDir='asc'; }
    resetTablePage(key);
    renderTable(key);
  }
  const clearFilters=e.target.closest('[data-clear-filters]'); if(clearFilters){
    const key=clearFilters.dataset.clearFilters;
    tableUiState[key].filters={};
    resetTablePage(key);
    const f=$('filter-'+key); if(f) f.value='';
    renderTable(key);
  }
  const clearSort=e.target.closest('[data-clear-sort]'); if(clearSort){
    const key=clearSort.dataset.clearSort;
    tableUiState[key].sortField=''; tableUiState[key].sortDir='asc';
    resetTablePage(key);
    renderTable(key);
  }
});
document.addEventListener('input',e=>{
  if(e.target?.id==='globalDataSearch'){renderGlobalDataSearch();return;}
  const edit=e.target.dataset.edit;
  if(edit){ const [key,idx,field]=edit.split(':'); state[key][+idx][field]=e.target.textContent; updateCounts(); updateJsonBox(); }
  if(e.target.id && e.target.id.startsWith('filter-')){
    const key=e.target.id.replace('filter-','');
    if(TABLE_KEYS.includes(key)){
      resetTablePage(key);
      renderTable(key);
    }
  }
  if(e.target.id==='filter-named_individuals') renderNamedIndividuals();
  if(['facilityAntiqueGearKind','facilityAntiqueGearCategory','facilityAntiqueGearRank','facilityAntiqueGearCount'].includes(e.target.id)){currentAntiqueGearRows=[];syncAntiqueGearSelectors();renderAntiqueGearStock(false);return;}
  if(e.target.id==='facilitySkillGachaRank'){renderSkillGachaManagement();return;}
  if(e.target.id==='facilitySkillGachaCount'){renderSkillGachaManagement();return;}
  if(e.target.id==='facilityRankLimitSelect'){ currentFacilityRankLimit = e.target.value || ''; renderFacilitiesPanel(); return; }
  if(e.target.id==='facilityWeaponBranchSearch'){ currentFacilityWeaponBranchSearch=e.target.value||''; renderFacilitiesPanel(); const input=$('facilityWeaponBranchSearch'); if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);} return; }
  if(['facilityUpgradeMaterialInput','facilityUpgradeCountInput','facilityUpgradeStepInput','facilitySmithToolRankInput','facilityUpgradeSupportCountInput','facilityUpgradeGuaranteeItem'].includes(e.target.id)) renderFacilityUpgradeResult();
  if(['facilityAlchemyRecipeSelect','facilityAlchemyToolRankInput'].includes(e.target.id)) renderFacilityAlchemyResult();
  if(['facilityAppraisalTypeInput','facilityAppraisalRankInput'].includes(e.target.id)) renderAntiqueAppraisalResult();
  if(e.target.id==='facilityAntiqueGearCount'){currentAntiqueGearRows=[];renderAntiqueGearStock(false);} 
  if(e.target.id==='facilityAntiqueStockCount') renderAntiqueRandomStock();
  if(['facilityTranscribeTypeInput','facilityTranscribeRankInput'].includes(e.target.id)) renderAntiqueTranscriptionResult();
  if(e.target.closest('[data-check-builder]')) syncCheckBuilder(e.target.closest('[data-check-builder]'));
  if(e.target.closest('[data-monster-actions-editor]')) syncMonsterActionEditor(e.target.closest('[data-monster-actions-editor]'));
  if(e.target.closest('[data-monster-drops-editor]')) syncMonsterDropEditor(e.target.closest('[data-monster-drops-editor]'));
  if(e.target.closest('[data-quest-fixed-events-editor]')) syncQuestFixedEventsEditor(e.target.closest('[data-quest-fixed-events-editor]'));
  if(e.target.closest('[data-modifier-editor]')) syncModifierEditor(e.target.closest('[data-modifier-editor]'));
  if(e.target.closest('[data-named-process-editor]')) syncAdminNamedProcessingEditor(e.target.closest('[data-named-process-editor]'));
});
document.addEventListener('change',e=>{
  if(e.target?.matches?.('[data-facility-general-area-check]')){
    const id=String(e.target.dataset.facilityGeneralAreaCheck||e.target.value||''),set=new Set(facilityGeneralAreaModalDraftIds.map(String));
    if(e.target.checked){if(id)set.add(id);}else set.delete(id);
    const initialId=facilityGeneralInitialAreaId();if(initialId)set.add(initialId);
    facilityGeneralAreaModalDraftIds=[...set];renderFacilityGeneralAreaModal();return;
  }
  if(e.target?.matches?.('[data-antique-gear-area-modal-check]')){
    const id=String(e.target.value||''),set=new Set(antiqueGearAreaModalDraftIds.map(String));
    if(e.target.checked){if(id)set.add(id);}else set.delete(id);
    const areas=antiqueAreaRows(),initial=areas.find(a=>Number(a.unlockOrder)===1)||areas[0],initialId=antiqueAreaId(initial||{});if(initialId)set.add(initialId);
    antiqueGearAreaModalDraftIds=[...set];return;
  }
  if(e.target?.matches?.('[data-copyist-area-modal-check]')){
    const id=String(e.target.value||''),set=new Set(copyistAreaModalDraftIds.map(String));
    if(e.target.checked){if(id)set.add(id);}else set.delete(id);
    const areas=copyistAreaRows(),initial=areas.find(area=>Number(area.unlockOrder)===1)||areas[0],initialId=mealAreaId(initial||{});if(initialId)set.add(initialId);
    copyistAreaModalDraftIds=[...set];return;
  }
  if(e.target?.matches?.('[data-copyist-specified-area]')){
    currentCopyistSpecifiedAreaId=String(e.target.value||'');currentCopyistSelectedIds=[];currentCopyistSelectionDate='';saveCopyistDailyState();renderFacilitiesPanel();return;
  }
  if(e.target?.matches?.('[data-guild-support-count]')){
    currentGuildSupportCount=Math.max(1,Math.min(10,Number(e.target.value)||3));
    currentGuildSupportIds=[];
    saveGuildSupportState();
    if(currentGuildSupportCharacters.length)guildSupportSelectedCharacters();
    renderFacilitiesPanel();
    return;
  }
  if(e.target?.id==='facilityUpgradeEquipmentType'){ facilityRemovalEntryIds=[]; renderFacilityUpgradeEquipmentSelect(); if($('facilityUpgradeMaterialInput')) $('facilityUpgradeMaterialInput').value=''; renderFacilityUpgradeLookupList(); renderFacilityUpgradeResult(''); renderFacilityRemovalCalculator(); return; }
  if(e.target?.id==='facilityUpgradeEquipmentSelect'){ facilityRemovalEntryIds=[]; if($('facilityUpgradeMaterialInput'))$('facilityUpgradeMaterialInput').value=''; renderFacilityUpgradeLookupList(); renderFacilityUpgradeResult(''); renderFacilityRemovalCalculator(); return; }
  if(e.target.id==='facilitySkillGachaRank'){renderSkillGachaManagement();return;}
  if(e.target.id==='facilitySkillGachaCount'){renderSkillGachaManagement();return;}
  if(e.target.id==='facilityRankLimitSelect'){ currentFacilityRankLimit = e.target.value || ''; renderFacilitiesPanel(); return; }
  if(['facilityUpgradeMaterialInput','facilityUpgradeCountInput','facilityUpgradeStepInput','facilitySmithToolRankInput','facilityUpgradeSupportCountInput','facilityUpgradeGuaranteeItem'].includes(e.target.id)){ renderFacilityUpgradeResult(); return; }
  if(['facilityAlchemyRecipeSelect','facilityAlchemyToolRankInput'].includes(e.target.id)){ renderFacilityAlchemyResult(); return; }
  if(['facilityAppraisalTypeInput','facilityAppraisalRankInput'].includes(e.target.id)){ renderAntiqueAppraisalResult(); return; }
  if(e.target.id==='facilityAntiqueGearCount'){currentAntiqueGearRows=[];renderAntiqueGearStock(false);return;}
  if(e.target.id==='facilityAntiqueStockCount'){ renderAntiqueRandomStock(); return; }
  if(['facilityTranscribeTypeInput','facilityTranscribeRankInput'].includes(e.target.id)){ renderAntiqueTranscriptionResult(); return; }
  if(e.target.dataset.formField==='dataKind'){ rerenderCurrentForm(); return; }
  if(e.target.dataset.formField==='craftType'){ currentRecipeView = e.target.value || currentRecipeView; rerenderCurrentForm(); return; }
  if(e.target.dataset.formField==='progressStep'){ document.querySelectorAll('[data-quest-fixed-events-editor]').forEach(refreshQuestFixedEventPercentOptions); return; }
  if(['itemType','materialType','itemCategory','equipSlot','skill','type','eventType'].includes(e.target.dataset.formField)){ rerenderCurrentForm(); return; }
  if(e.target.closest('[data-check-builder]')) syncCheckBuilder(e.target.closest('[data-check-builder]'));
  const dropRow=e.target.closest('[data-monster-drop-row]');
  if(dropRow && e.target.dataset.monsterDropField==='itemName'){
    const matched=findMaterialForDrop({ itemName:e.target.value||'' });
    if(matched){
      const type=canonicalMaterialTypeName(matched.materialType);
      const category=String(matched.materialCategory||'').trim();
      const id=String(matched.id||matched.name||'').trim();
      const typeSelect=dropRow.querySelector('[data-monster-drop-field="materialType"]');
      const categorySelect=dropRow.querySelector('[data-monster-drop-field="materialCategory"]');
      const hidden=dropRow.querySelector('[data-monster-drop-field="itemId"]');
      if(typeSelect) typeSelect.innerHTML=optionHtml(materialTypeOptionsForDrop(type),type,'大カテゴリ');
      if(categorySelect) categorySelect.innerHTML=optionHtml(materialCategoryOptionsForDrop(type,category),category,'小カテゴリ');
      if(hidden) hidden.value=id;
      e.target.value=String(matched.name||e.target.value||'').trim();
    }
    syncMonsterDropEditor(dropRow.closest('[data-monster-drops-editor]'));
    return;
  }
  if(dropRow && (e.target.dataset.monsterDropField==='materialType' || e.target.dataset.monsterDropField==='materialCategory')){
    const editor=dropRow.closest('[data-monster-drops-editor]');
    const rows=readMonsterDropRows(editor);
    const currentRows=Array.from(editor.querySelectorAll('[data-monster-drop-row]'));
    const idx=currentRows.indexOf(dropRow);
    if(e.target.dataset.monsterDropField==='materialType' && rows[idx]){ rows[idx].materialCategory=''; rows[idx].itemId=''; rows[idx].itemName=''; }
    if(e.target.dataset.monsterDropField==='materialCategory' && rows[idx]){ rows[idx].itemId=''; rows[idx].itemName=''; }
    editor.querySelector('[data-monster-drop-list]').innerHTML = rows.map(monsterDropRowHtml).join('');
    syncMonsterDropEditor(editor);
    return;
  }
  if(e.target.closest('[data-monster-actions-editor]')) syncMonsterActionEditor(e.target.closest('[data-monster-actions-editor]'));
  if(e.target.closest('[data-monster-drops-editor]')) syncMonsterDropEditor(e.target.closest('[data-monster-drops-editor]'));
  if(e.target.closest('[data-quest-fixed-events-editor]')) syncQuestFixedEventsEditor(e.target.closest('[data-quest-fixed-events-editor]'));
  if(e.target.closest('[data-modifier-editor]')) syncModifierEditor(e.target.closest('[data-modifier-editor]'));
  const adv=e.target.dataset.advFilter;
  if(adv){
    const [key,field]=adv.split(':');
    tableUiState[key].filters[field]=e.target.value;
    resetTablePage(key);
    renderTable(key);
  }
});

$('btnCloseModal').addEventListener('click',closeForm);
$('btnCancelEdit').addEventListener('click',closeForm);
$('btnApplyEdit').addEventListener('click',()=>{try{applyFormToState()}catch(e){toast(e.message,'error')}});
$('btnApplyAndSave').addEventListener('click',applyFormAndSave);
$('editModal').addEventListener('click',e=>{ if(e.target.id==='editModal') closeForm(); });
$('facilityGeneralAreaModal')?.addEventListener('click',e=>{if(e.target===$('facilityGeneralAreaModal'))closeFacilityGeneralAreaModal();});
$('copyistAreaModal')?.addEventListener('click',e=>{if(e.target===$('copyistAreaModal'))closeCopyistAreaModal();});
$('antiqueGearAreaModal')?.addEventListener('click',e=>{if(e.target===$('antiqueGearAreaModal'))closeAntiqueGearAreaModal();});
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && !$('facilityGeneralAreaModal')?.classList.contains('hidden')){closeFacilityGeneralAreaModal();return;} if(e.key==='Escape' && !$('antiqueGearAreaModal')?.classList.contains('hidden')){closeAntiqueGearAreaModal();return;} if(e.key==='Escape' && !$('copyistAreaModal')?.classList.contains('hidden')){closeCopyistAreaModal();return;} if(e.key==='Escape' && !$('editModal').classList.contains('hidden')) closeForm(); });
$('btnSetup').addEventListener('click',setup);
if($('btnCleanupUploadTemps')) $('btnCleanupUploadTemps').addEventListener('click',cleanupUploadTemps);
if($('btnDiagnoseSheets')) $('btnDiagnoseSheets').addEventListener('click',diagnoseSheets);
if($('btnRepairHeaders')) $('btnRepairHeaders').addEventListener('click',repairHeaders);
if($('btnSaveAll')) $('btnSaveAll').addEventListener('click',saveAll);
if($('btnReplaceAll')) $('btnReplaceAll').addEventListener('click',replaceAll);
if($('btnLoadAll')) $('btnLoadAll').addEventListener('click',loadAll);
if($('btnSavePages')) $('btnSavePages').addEventListener('click',saveAll);
if($('btnReplacePages')) $('btnReplacePages').addEventListener('click',replaceAll);
$('btnDedupeAll').addEventListener('click',dedupeAll);
$('btnExportJson').addEventListener('click',()=>{updateJsonBox(true);toast('JSONを更新しました')});
$('btnImportJson').addEventListener('click',()=>{try{fromJsonBox()}catch(e){toast(e.message,'error')}});
$('btnDownloadJson').addEventListener('click',downloadJson);
if($('btnExportGithubPublicDb')) $('btnExportGithubPublicDb').addEventListener('click',exportGithubPublicDb);
if($('btnReloadGithubCommonDb')) $('btnReloadGithubCommonDb').addEventListener('click',async()=>{
  const button=$('btnReloadGithubCommonDb');
  if(button)button.disabled=true;
  try{
    const result=await loadManagerDisplayData({force:true});
    if(result&&result.source==='github')toast('GitHub共通DBを再読込しました');
  }finally{
    if(button)button.disabled=false;
  }
});
if($('btnClearWorkingData')) $('btnClearWorkingData').addEventListener('click',clearWorkingData);
$('schemaPreview').textContent=JSON.stringify(SCHEMA,null,2);
syncSkillProgressFields();
updateInitialDataStatus();
loadManagerDisplayData();

function helpItemText(item) {
  const body = Array.isArray(item.body) ? item.body.join('\n') : String(item.body || '');
  const tags = Array.isArray(item.tags) ? item.tags.join(', ') : String(item.tags || '');
  return `${item.title || ''}\n${tags}\n${body}`;
}
function renderSystemHelp() {
  const area = document.getElementById('helpList');
  if (!area) return;
  const q = String(document.getElementById('filter-help')?.value || '').trim().toLowerCase();
  const rows = (typeof SYSTEM_HELP !== 'undefined' && Array.isArray(SYSTEM_HELP)) ? SYSTEM_HELP : [];
  const filtered = rows.filter(item => !q || helpItemText(item).toLowerCase().includes(q));
  area.innerHTML = filtered.map(item => {
    const body = Array.isArray(item.body) ? item.body.map(v => `<p>${escapeHtml(v)}</p>`).join('') : `<p>${escapeHtml(item.body || '')}</p>`;
    const tags = Array.isArray(item.tags) && item.tags.length ? `<div class="small">タグ：${escapeHtml(item.tags.join(' / '))}</div>` : '';
    return `<details class="help-card"><summary>${escapeHtml(item.title || 'ヘルプ')}</summary>${tags}<div class="help-body">${body}</div></details>`;
  }).join('') || '<p class="hint">該当するヘルプがありません。</p>';
}
document.addEventListener('input', (ev) => {
  if (ev.target && ev.target.id === 'filter-help') renderSystemHelp();
});
document.addEventListener('click', (ev) => {
  if (ev.target && ev.target.id === 'openAllHelpBtn') document.querySelectorAll('#helpList details').forEach(d => d.open = true);
  if (ev.target && ev.target.id === 'closeAllHelpBtn') document.querySelectorAll('#helpList details').forEach(d => d.open = false);
  if (ev.target && ev.target.id === 'copyAllHelpBtn') {
    const rows = (typeof SYSTEM_HELP !== 'undefined' && Array.isArray(SYSTEM_HELP)) ? SYSTEM_HELP : [];
    const text = rows.map(helpItemText).join('\n\n---\n\n');
    navigator.clipboard?.writeText(text);
  }
});


