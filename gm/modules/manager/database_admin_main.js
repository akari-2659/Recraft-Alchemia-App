
// ローカル管理ツールから毎回URLを入力しない運用にする場合は、ここにApps Scriptの /exec URLを入れてください。
const DEFAULT_GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxNQYC7-aBE23cliuD1Zdze18xHh-q45P1qpBgwCCg0dYgxd1b8A-R63eGjzMtgOxMT/exec';
const RECRAFT_DB_VERSION = 'v90.8.834';
const RECRAFT_DB_REQUIRED_SERVER_VERSION = 'v90.8.834';
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
  id:'種別は任意IDを入力。未入力なら自動生成', name:'例：ポーション', csVisible:'TRUEならキャラシ側のDB装備/アイテム候補に表示。FALSEならDBには残るが候補に出しません。', dataKind:'アイテム / 素材', itemType:'例：武器', itemCategory:'例：片手武器', materialType:'例：採取素材', materialCategory:'例：草花', price:'例：100', buyPrice:'例：180', sellPrice:'例：160', rank:'魔物・素材・装備・道具・レシピ・術式・クエスト・宝箱などは1以上の数値。すべての画面で★N表示', toolRank:'例：6。この道具で扱える上限ランク。道具本体も★6に揃え、飛び番を許可します', guaranteeUpgradeMaxRank:'例：6。このアイテムを使うと★6以下の強化素材を使う装備強化が確定成功になります。', description:'見た目や雰囲気を入力', effect:'数値・ルール処理を入力', source:'例：森、獣系魔物、調合', craftType:'例：武器派生 / 調合 / 鍛冶', baseItem:'例：ロングソード。武器派生の派生元を選びます。', branchType:'例：鉱石 / 獣牙 / 植生 / 異界 / 草角。通常武器は大枠の素材系統、ボス武器は素材・特徴を表す固有系統を入力します。画面では「鉱石派生」のように表示します。', equipmentUpgradeEffect:'効果が単独で分かる名称を設定します。例：威力強化、威力固定強化、回復量強化、回復量固定強化、水属性軽減、抵抗妨害。数値や固有名を別欄へ分けません。', equipmentUpgradeSlotCost:'命中強化・回避強化などの基礎補正は1枠。威力固定強化・回復量固定強化・防御強化・術式枠拡張・術式省力化・属性系効果・技能補助は2枠以上。強力な複合効果やボス固有効果は3枠にできます。装備強化に防御値無視は設定しません。', equipmentUpgradeDetail:'すべての装備強化で、実際に適用される処理・補正・条件・重複可否を具体的に入力します。', upgradeMaterialMinRank:'例：3。この装備を強化できる素材の最低ランク。空欄時は装備ランクを使用します。', bagCapacity:'例：8。バッグ種別アイテムの所持品枠数。maxStackには入れません。', usageTags:'例：回復,薬,探索', notes:'補足メモ', sortOrder:'例：10', ownerKey:'空欄なら公開データ', createdBy:'例：GM名・制作者名', requestKind:'通常依頼のみ：拠点内依頼 / エリア依頼 / 納品依頼。重要クエストは空欄', questType:'例：仕分け / 採取 / 討伐 / 納品 / 制限戦闘 / 運搬保護 / 継続行動', battleRoundLimit:'制限戦闘・継続行動など、戦闘中に期限がある依頼へ設定。例：3。第3ラウンド終了までに成功条件を満たす。期限がない依頼は空欄', battleRoundSuccess:'例：3ラウンド以内に指定魔物を撃破する。', battleRoundFailure:'例：第3ラウンド終了時に指定魔物が生存している場合、対象が撤退してクエスト失敗。', recommendedSkills:'納品依頼以外に設定。例：採取・戦闘系技能', rewardScope:'各PC / パーティー共通', deliveryItems:'例：薬草×3, 中和剤×2', areaName:'例：街はずれの草原', questLocation:'例：拠点 / 街はずれの草原', progressStep:'進行ボタン1回で加算する数値。標準4段階は25、長めの調査・巡回・運搬保護・継続行動は20、短い採取等は50、拠点内単発は100を目安に内容で選択', fixedEvents:'クエスト専用。固定で発生させたい進行区切りだけ登録します。未登録の区切り（0%を含む）は対象エリアのランダムイベントを使用します。探索エリアには通常固定イベントを設定しません', clearCondition:'クリア条件を入力', bossMonster:'例：プチスライム', rewardMoney:'例：80G', rewardItems:'例：ポーション×1', unlockResult:'例：通常依頼の受注許可', areaType:'例：草原 / 異界', difficulty:'例：★1', unlockKey:'例：7UCX-JAUE-E2TH-GLRG-MEGW。エリア名や順番を推測しにくい文字列を設定', unlockOrder:'例：2。表示・並び替え・進行目安に使用します。施設HTMLの自動累積解放には使用しません', unlockAreaKey:'例：area_nearby_forest。商品・作成・派生に必要なエリアID', unlockCondition:'例：初期解放', mainMaterials:'例：薬草, 澄んだ水', mainMonsters:'例：プチスライム', eventTableId:'例：evt_grass_trial', tableId:'例：evt_grass_trial', eventName:'例：薬草の群生', eventType:'例：採取', targetValue:'例：8', treasureTableId:'例：grass_common_cache', rewardTableId:'例：reward_outskirts_grass。拠点内イベント・拠点内依頼・一部エリアイベントで使う入手アイテム表', rewardDrawCount:'例：1 / 2。入手アイテム表から何枠抽選するか', tablePurpose:'宝箱 / 入手アイテム。入手アイテム表は宝箱抽選画面には表示しません', treasureRank:'例：1。画面では★1と表示します', entryType:'例：換金品 / アイテム / レシピ / 未鑑定スクロール', entryName:'例：未鑑定の魔法スクロール：★1', entryPublicId:'例：RCA-XXXX-XXXX', recipeName:'例：ポーション', scrollRank:'例：1。画面では★1と表示します', quantity:'例：1 / 1D3', weight:'例：10。数字が大きいほど出やすい', facilityName:'例：宿屋', spellType:'例：魔法', spellRank:'例：1。画面では★1と表示します', candidateTags:'例：火,攻撃。空欄ならランク内全候補', encounterVariantTable:'1行ごとに「人数範囲<TAB>重み<TAB>出現構成」。例：4-5\t2\t前衛,ミラード,1;前衛,ヴェイル,1。候補が複数ある場合は重み付き抽選。強敵2体以上の候補には通常魔物を混在させません。', result:'成功時の結果', progressEffect:'例：次の採取判定+1、または補足効果', monsterType:'大分類：粘体 / 獣 / 虫 / 植物 / 爬虫 / 水棲 / 軟体 / 霊体 / 造魔 / 竜 / 異界', monsterTraits:'例：飛行,甲殻,異界。複数指定はカンマ区切り', encounterValue:'1～3。魔物単体の戦闘負荷。エリアではなく能力・行動の強さで設定します。', individualValueEnabled:'通常魔物はTRUE、二つ名個体はFALSE。エリアボスはFALSEまたは空欄。', individualValueRule:'通常魔物の遭遇時個体値ルール。二つ名個体・ボスは固定値のため空欄。', dismantleDifficulty:'例：7。採取技能>=解体難易度で判定し、成功時は全ドロップ率+10%（上限100%）。目安はチュートリアル5～6、通常6～9、ボス10以上', pullRule:'可 / 不可', passiveName:'例：胞子反応', passiveEffect:'発動条件・処理・回数制限を具体的に入力', habit:'生息場所・群れ方・警戒時の行動などを1～3文で入力', actions:'行動内容', drops:'例：ゼラチン液：100%（1個）\nぷるぷる膜：50%（1個）', modifiers:'例：hit\t+1\t命中補正。行追加式で能力/技能/戦闘ステータス補正を登録します。', reloadTurns:'例：1。攻撃後に必要な装填ターン数。クロスボウ/ヘヴィクロスボウは1が目安です。'
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
function githubCommonDbBaseCandidates(){
  // 公開共通DBへフォールバックする場合も、Appの公開DBだけを正本として参照する。
  return [GITHUB_COMMON_DB_REMOTE_BASE];
}
let githubCommonMasterPromise = null;
let DEFAULTS = createEmptyDataSet();
let initialDataLoaded = false;
let initialDataSource = '';
let state = createEmptyDataSet();

function createEmptyDataSet(){
  return Object.fromEntries(DATA_KEYS.map(key => [key, []]));
}
function initialDataRowCount(data){
  return DATA_KEYS.reduce((sum,key)=>sum+(Array.isArray(data?.[key]) ? data[key].length : 0),0);
}
function extractInitialDataPayload(raw){
  if(!raw || typeof raw !== 'object') throw new Error('表示用マスターJSONの形式が正しくありません');
  const acceptedFormats = [INITIAL_DATA_FORMAT, GITHUB_COMMON_DATA_FORMAT, 'recraft-alchemia-public-master'];
  if(raw.format && !acceptedFormats.includes(raw.format)) throw new Error(`対応していない表示用マスター形式です: ${raw.format}`);
  return raw.data && typeof raw.data === 'object' ? raw.data : raw;
}
function normalizeInitialDataPayload(raw){
  const source = extractInitialDataPayload(raw);
  const out = createEmptyDataSet();
  for(const key of DATA_KEYS){
    if(source[key] !== undefined && !Array.isArray(source[key])) throw new Error(`${key} が配列ではありません`);
    out[key] = Array.isArray(source[key]) ? source[key].map(row=>({...row})) : [];
  }
  return unifyEffectNotesForDisplayRows(out);
}
function updateInitialDataStatus(){
  const el = $('initialDataStatus');
  if(!el) return;
  if(initialDataLoaded){
    el.className = 'status-box ok';
    el.textContent = `初期復元元：${initialDataSource || '表示用マスター'}（${initialDataRowCount(DEFAULTS)}件）`;
  }else{
    el.className = 'status-box warn';
    el.textContent = 'GitHub共通DBを確認しています。';
  }
}
function applyInitialData(raw, sourceLabel='表示用マスター'){
  const source = extractInitialDataPayload(raw);
  const loaded = normalizeInitialDataPayload(raw);
  window.RA_SKILL_MASTER = { skills: Array.isArray(loaded.skills) ? loaded.skills : [] };
  if(initialDataRowCount(loaded) === 0) throw new Error('表示用マスターに登録データがありません');
  DEFAULTS = loaded;
  initialDataLoaded = true;
  initialDataSource = sourceLabel;
  state = unifyEffectNotesForDisplayRows(raDeepClone(DEFAULTS));
  renderAll();
  updateInitialDataStatus();
  toast(`表示用マスターを読み込みました（${initialDataRowCount(DEFAULTS)}件）`);
}
function managerGithubDelay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function managerMasterDataRowCount(master){
  const data=master&&master.data&&typeof master.data==='object'?master.data:master;
  if(!data||typeof data!=='object')return 0;
  return DATA_KEYS.reduce((sum,key)=>sum+(Array.isArray(data[key])?data[key].length:0),0);
}
function validateManagerCommonMaster(master){
  const data=master&&master.data&&typeof master.data==='object'?master.data:master;
  if(!data||typeof data!=='object')throw new Error('共通DB本体が不正です。');
  for(const key of DATA_KEYS){
    if(data[key]!==undefined&&!Array.isArray(data[key]))throw new Error(`共通DB ${key} が配列ではありません。`);
  }
  const monsters=Array.isArray(data.monsters)?data.monsters:[],ids=new Set();
  monsters.forEach((row,index)=>{
    const id=String(row?.id||'').trim();if(!id)throw new Error(`共通DB 魔物 ${index+1}件目にIDがありません。`);
    if(ids.has(id))throw new Error(`共通DB 魔物IDが重複しています：${id}`);ids.add(id);
  });
  const byId=new Map(monsters.map(row=>[String(row.id||''),row]));
  const affinityFields=['physicalAffinity','fireAffinity','waterAffinity','windAffinity','thunderAffinity','lightAffinity','darkAffinity','neutralAffinity'];
  monsters.filter(row=>/^mon_named_/.test(String(row.id||''))).forEach(row=>{
    const base=byId.get(String(row.baseMonsterId||''));
    if(!base)throw new Error(`二つ名個体 ${row.id} のbaseMonsterIdが不正です。`);
    const mismatch=affinityFields.find(field=>String(row[field]||'')!==String(base[field]||''));
    if(mismatch)throw new Error(`二つ名個体 ${row.id} の耐性が通常個体と一致していません：${mismatch}`);
  });
  assertSkillProgressionRows(Array.isArray(data.skills)?data.skills:[]);
  assertSkillCrystalProgressionRows(Array.isArray(data.recipes)?data.recipes:[]);
  return true;
}
async function managerFetchGithubJson(url,{timeoutMs=15000,cacheMode='force-cache'}={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),Math.max(1000,Number(timeoutMs)||15000));
  try{
    const response=await fetch(url,{cache:cacheMode,signal:controller.signal});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }catch(error){
    if(error&&error.name==='AbortError')throw new Error(`GitHub共通DBの取得がタイムアウトしました（${Math.round((Number(timeoutMs)||15000)/1000)}秒）`);
    throw error;
  }finally{clearTimeout(timer);}
}
async function fetchGithubCommonMaster({force=false}={}){
  if(githubCommonMasterPromise&&!force)return githubCommonMasterPromise;
  const task=(async()=>{
    const errors=[];
    for(const base of githubCommonDbBaseCandidates()){
      let manifest=null;
      try{
        const manifestUrl=new URL('manifest.json',base);
        manifest=await managerFetchGithubJson(manifestUrl.toString(),{timeoutMs:6000,cacheMode:'no-cache'});
      }catch(error){
        // manifestは小さいので1回だけ再試行。巨大なmaster本体は再取得しない。
        try{
          await managerGithubDelay(250);
          const manifestUrl=new URL('manifest.json',base);
          manifest=await managerFetchGithubJson(manifestUrl.toString(),{timeoutMs:6000,cacheMode:'reload'});
        }catch(second){errors.push(`${base}: manifest ${second.message||second}`);}
      }
      if(manifest){
        try{
          const nested=manifest?.files?.master,info=nested&&typeof nested==='object'?nested:{};
          const masterFile=String(manifest.master||info.file||info.path||(typeof nested==='string'?nested:'')||'').trim();
          if(!masterFile||masterFile.includes('..')||masterFile.includes(String.fromCharCode(92)))throw new Error('manifestのmasterファイル名が不正です');
          const cacheKey=String(manifest.sha256||info.sha256||manifest.version||'master').trim();
          const masterUrl=new URL(masterFile,base);masterUrl.searchParams.set('_ra',cacheKey);
          const master=await managerFetchGithubJson(masterUrl.toString(),{timeoutMs:20000,cacheMode:force?'reload':'force-cache'});
          validateManagerCommonMaster(master);
          const rows=managerMasterDataRowCount(master);if(!rows)throw new Error('共通DBの更新データが空です');
          const manifestVersion=String(manifest.version||'').trim(),masterVersion=String(master.version||'').trim();
          return{manifest,master,version:masterVersion||manifestVersion,base,versionWarning:manifestVersion&&masterVersion&&manifestVersion.replace(/^v/i,'')!==masterVersion.replace(/^v/i,'')?`manifest ${manifestVersion} / master ${masterVersion}`:''};
        }catch(error){errors.push(`${base}: master ${error.message||error}`);}
      }
      // manifest経路が使えない場合だけdirectを1回試す。masterを何度も落とさない。
      try{
        const directUrl=new URL('recraft_alchemia_master.json',base);
        const master=await managerFetchGithubJson(directUrl.toString(),{timeoutMs:20000,cacheMode:force?'reload':'force-cache'});
        validateManagerCommonMaster(master);
        const rows=managerMasterDataRowCount(master);if(!rows)throw new Error('共通DBの更新データが空です');
        return{manifest:{master:'recraft_alchemia_master.json'},master,version:String(master.version||''),base,versionWarning:''};
      }catch(error){errors.push(`${base}: direct ${error.message||error}`);}
    }
    throw new Error(errors.join(' / ')||'GitHub共通DBの取得先がありません');
  })();
  githubCommonMasterPromise=task;
  try{return await task;}
  catch(error){if(githubCommonMasterPromise===task)githubCommonMasterPromise=null;throw error;}
}

async function loadBundledInitialData(){
  const url=new URL(INITIAL_DATA_PATH,window.location.href);
  url.searchParams.set('v',RECRAFT_DB_VERSION);
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const res = await fetch(url.toString(), {cache:'force-cache',signal:controller.signal});
    if(!res.ok) throw new Error(`同梱JSON HTTP ${res.status}`);
    return await res.json();
  }catch(error){
    if(error&&error.name==='AbortError')throw new Error('管理用同梱DBの取得がタイムアウトしました（8秒）');
    throw error;
  }finally{clearTimeout(timer);}
}
async function loadManagerDisplayData({force=false}={}){
  const status = $('initialDataStatus');
  if(status){
    status.className = 'status-box warn';
    status.textContent = 'GitHub共通DBを読み込んでいます。';
  }
  try{
    // 画面の説明どおり、起動時・再読込ともManagerの公開共通DBを正本として直接読む。
    const result = await fetchGithubCommonMaster({force});
    applyInitialData(
      result.master,
      `GitHub共通DB${result.version ? ' v' + result.version : ''}`
    );
    return {source:'github', version:result.version};
  }catch(githubError){
    console.warn('GitHub共通DBを取得できないため管理用同梱DBへ切り替えます。', githubError);
    if(status){
      status.className = 'status-box warn';
      status.textContent = 'GitHub共通DB取得失敗。管理用同梱DBへ切り替えています。';
    }
    try{
      const bundled = await loadBundledInitialData();
      validateManagerCommonMaster(bundled);
      applyInitialData(bundled, '管理用同梱DB（GitHub共通DBフォールバック）');
      if(status){
        status.className = 'status-box warn';
        status.textContent =
          `初期復元元：管理用同梱DB（GitHub共通DB取得失敗：${githubError.message || githubError}）` +
          `（${initialDataRowCount(DEFAULTS)}件）`;
      }
      toast('GitHub共通DBを取得できなかったため、管理用同梱DBを読み込みました。', 'warn');
      return {source:'bundled', version:String(bundled?.version||''), error:githubError};
    }catch(bundledError){
      if(status){
        status.className = 'status-box bad';
        status.textContent =
          `表示用マスター読込失敗：GitHub=${githubError.message || githubError} / 同梱=${bundledError.message || bundledError}`;
      }
      toast('GitHub共通DBと管理用同梱DBの両方を読み込めませんでした。', 'error');
      return {source:'error', error:githubError, bundledError};
    }
  }
}
function clearWorkingData(){
  if(!confirm('画面上のデータを空にしますか？\nDB上のデータは変更されません。')) return;
  state = createEmptyDataSet();
  renderAll();
  toast('画面上のデータを空にしました');
}

function raDeepClone(obj){
  if(typeof globalThis.structuredClone==='function') return globalThis.structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}
function mergeTextUnique(...values){
  const seen = new Set();
  const parts = [];
  values.forEach(value => {
    String(value ?? '').split(/\n+/).map(v => v.trim()).filter(Boolean).forEach(line => {
      if(!seen.has(line)){ seen.add(line); parts.push(line); }
    });
  });
  return parts.join('\n');
}
function unifyEffectNotesForDisplayRows(data){
  const out = data || {};
  // 旧版互換: 過去の flavorText 列だけ説明へ移す。
  // メモを効果へ混ぜる処理は廃止し、説明と効果を別々に保持する。
  ['equipment_categories','items','spells','recipes'].forEach(key => {
    if(!Array.isArray(out[key])) return;
    out[key].forEach(row => {
      if(!row) return;
      const oldDescription = row['fla' + 'vor' + 'Text'];
      if(!String(row.description || '').trim() && String(oldDescription || '').trim()) row.description = oldDescription;
      delete row['fla' + 'vor' + 'Text'];
      if(!String(row.description || '').trim() && String(row['説明'] || '').trim()) row.description = row['説明'];
      if(!String(row.effect || '').trim() && String(row['効果'] || '').trim()) row.effect = row['効果'];
      delete row['説明']; delete row['効果'];
    });
  });
  return out;
}
function $(id){ return document.getElementById(id); }
const raDirtyTables=new Set();
function updateDirtyStateBadge(){
  const badge=$('dirtyStateBadge');if(!badge)return;
  const dirty=raDirtyTables.size>0;
  badge.classList.toggle('is-dirty',dirty);
  badge.textContent=dirty?`未保存の変更あり${raDirtyTables.has('*')?'':`（${raDirtyTables.size}表）`}`:'保存済み';
}
function markDirty(tableKey='*'){raDirtyTables.add(tableKey||'*');updateDirtyStateBadge();}
function clearDirty(tableKey='*'){
  if(tableKey==='*')raDirtyTables.clear();
  else{raDirtyTables.delete(tableKey);if(raDirtyTables.has('*'))raDirtyTables.delete('*');}
  updateDirtyStateBadge();
}
window.addEventListener('beforeunload',e=>{if(!raDirtyTables.size)return;e.preventDefault();e.returnValue='';});
function nowIso(){ return new Date().toISOString(); }
const LEGACY_NUMERIC_RANKS = {'初期':1,'初級':1,'チュートリアル':1,'小規模':1,'中級':2,'通常':2,'標準':2,'上級':3,'大規模':3,'特級':4,'強敵':4,'ボス':4,'高難度':4,'最上級':5};
const LEGACY_MATERIAL_GRADE_TO_NUMERIC_RANK = {'低級':1,'普通':2,'良質':3,'希少':4,'高級':5};
function numericRankValue(value, fallback=''){
  if(typeof value === 'number' && Number.isFinite(value) && value >= 1) return Math.floor(value);
  const raw=String(value ?? '').trim();
  if(!raw) return fallback;
  if(Object.prototype.hasOwnProperty.call(LEGACY_NUMERIC_RANKS, raw)) return LEGACY_NUMERIC_RANKS[raw];
  const m=raw.match(/(?:★|Rank\s*[:：]?\s*)?(\d+)/i);
  const n=m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}
function numericRankValueIncludingLegacyMaterialGrade(value, fallback=''){
  const raw=String(value ?? '').trim();
  if(Object.prototype.hasOwnProperty.call(LEGACY_MATERIAL_GRADE_TO_NUMERIC_RANK, raw)) return LEGACY_MATERIAL_GRADE_TO_NUMERIC_RANK[raw];
  return numericRankValue(value, fallback);
}
function playerRankLabel(value){ const n=numericRankValue(value,''); return n ? `★${n}` : String(value ?? '').trim(); }

function adminCraftingRequiredToolRank(rank){
  const n=Math.max(1,Number(rank)||1);
  return Math.ceil(n/3)*3;
}
function adminCraftingDifficultyRows(rank,difficulty){
  const base=Number(String(difficulty??'').trim());
  if(!Number.isFinite(base)) return [];
  const required=adminCraftingRequiredToolRank(rank);
  return [0,1,2].map(step=>({
    toolRank:required+step*3,
    reduction:step*2,
    finalDifficulty:base-step*2
  }));
}
function adminCraftingDifficultySummary(rank,difficulty){
  const rows=adminCraftingDifficultyRows(rank,difficulty);
  if(!rows.length) return String(difficulty||'未設定');
  return rows.map((r,i)=>`★${r.toolRank}対応：${r.finalDifficulty}${i?`（－${r.reduction}）`:'（基礎）'}`).join(' / ')+' / 以降1段階ごとに－2';
}
function adminCraftingToolName(craftSkill='',craftType=''){
  const skill=String(craftSkill||'').trim();
  const type=String(craftType||'').trim();
  if(skill==='調合'||type==='調合') return '調合道具';
  if(type==='細工'||type==='仕掛け製作'||skill==='設計') return '細工道具';
  if(['武器派生','防具製作','盾製作','装飾品製作','装飾品強化','バッグ製作','矢筒製作','鍛冶製作','鍛冶'].includes(type)) return '鍛冶道具';
  if(skill==='細工') return '細工道具';
  return '対応道具';
}
const ADMIN_CRAFT_SUPPORT_REDUCTION=2;
function adminCraftSupportName(row={}){
  const skill=String(row.craftSkill||row.processingSkill||'').trim();
  const type=String(row.craftType||'').trim();
  if(skill==='調合'||type==='調合')return '調合安定剤';
  if(skill==='設計')return '機巧調整剤';
  if(skill==='細工'){
    if(type==='武器派生')return '武装融和剤';
    if(type==='鍛冶'){
      const result=String(row.resultItem||row.name||'').trim();
      const item=(state.items||[]).find(x=>String(x.name||'').trim()===result)||{};
      if(String(item.itemType||'').trim()==='武器')return '武装融和剤';
    }
    return '工作定着剤';
  }
  return '';
}
function adminCraftSupportText(row={}){
  const name=adminCraftSupportName(row);return name?`${name}（自作時のみ・任意個数）／1個につき作成難易度－${ADMIN_CRAFT_SUPPORT_REDUCTION}`:'';
}
function adminCraftingRouteLines(row={}){
  const difficulty=String(row.difficulty??'').trim();
  const rows=adminCraftingDifficultyRows(row.rank,difficulty);
  if(!rows.length) return difficulty ? [`作成難易度：${difficulty}`] : [];
  const skill=String(row.craftSkill||recipeSkillForCraftType(row.craftType)||'細工').trim();
  const lines=[
    `使用技能：${skill}`,
    `使用道具：${adminCraftingToolName(skill,row.craftType)}`,
    `基礎作成難易度：${difficulty}`,
    `道具使用時：${adminCraftingDifficultySummary(row.rank,difficulty)}`
  ];
  const supportText=adminCraftSupportText(row);if(supportText)lines.push(`任意の作成補助材：${supportText}`);
  return lines;
}
function adminCraftingRouteHtml(row={}){
  return adminCraftingRouteLines(row).map(line=>{
    const idx=line.indexOf('：');
    const k=idx>=0?line.slice(0,idx):'';
    const v=idx>=0?line.slice(idx+1):line;
    return `<div><b>${escapeHtml(k)}：</b>${escapeHtml(v)}</div>`;
  }).join('');
}
function adminRankLabel(value){ return playerRankLabel(value); }
function isStructuredNumericRankRecord(key,row={}){
  return ['items','recipes','spells','skills','quest_rewards','quests','monsters'].includes(key);
}
function isStructuredNumericSubRank(key,field){
  return (key==='treasure_tables' && ['treasureRank','scrollRank'].includes(field))
    || (key==='appraisal_rules' && ['scrollRank','spellRank'].includes(field))
    || (key==='items' && field==='guaranteeUpgradeMaxRank');
}
function isEquipmentItemRow(row={}){
  return String(row.dataKind || 'アイテム').trim() !== '素材' && ['武器','防具','盾'].includes(String(row.itemType || '').trim());
}
function equipmentUpgradeMinimumRank(row={}){
  const own=numericRankValueIncludingLegacyMaterialGrade(row.rank,1);
  return numericRankValueIncludingLegacyMaterialGrade(row.upgradeMaterialMinRank,own);
}

function stripSkillPointTerms(value){
  return String(value || '')
    .replace(/\+?\s*(魔法|祈祷)\s*(ポイント|P)\s*/g, '')
    .replace(/\s*\+\s*$/g, '')
    .replace(/^\s*\+\s*/g, '')
    .replace(/\+\s*\+/g, '+')
    .trim();
}
function normalizePowerForDb(key, value){
  return key === 'spells' ? stripSkillPointTerms(value) : String(value || '').trim();
}
function currentAdminKey(){ return ''; }
function currentCreatedBy(){ return ''; }
function markRowOwnership(row){
  if(!row) return row;
  // ownerKey / createdBy は旧DB互換列としてのみ残し、管理画面では使用しない。
  row.ownerKey = '';
  row.createdBy = '';
  return row;
}

function normalizeStoredEncounterComposition(raw=''){
  const text=String(raw||'').trim();
  if(!text || /^(ランダム編成|指定対象＋ランダム随伴)/.test(text)) return text;
  const lines=text.split(/\n+|;|；/).map(line=>line.trim()).filter(Boolean);
  const parsed=lines.map(line=>line.split(/\t|,|，|、/).map(value=>String(value||'').trim()).filter(Boolean));
  if(!parsed.length || parsed.some(cols=>cols.length<3)) return text;
  parsed.forEach(cols=>{ cols[0]=String(cols[0]||'').startsWith('後衛')?'後衛':'前衛'; });
  if(!parsed.some(cols=>cols[0]==='前衛')) parsed[0][0]='前衛';
  return parsed.map(cols=>cols.join(',')).join(';');
}
function normalizeEncounterPlacementRow(key,row={}){
  if(!row) return row;
  if(key==='event_tables' && String(row.encounterComposition||'').trim()){
    row.encounterComposition=normalizeStoredEncounterComposition(row.encounterComposition);
  }
  if(key==='quests' && String(row.questBossComposition||'').trim()){
    const formation=String(row.questBossFormation||'').trim();
    let composition=String(row.questBossComposition||'').trim();
    // 表示上「指定対象＋ランダム随伴」なのに固定編成として保存される事故を防ぐ。
    if(formation.includes('ランダム随伴') && !composition.startsWith('指定対象＋ランダム随伴')){
      const first=composition.split(/\n+|;|；/).map(v=>v.trim()).filter(Boolean)[0]||'';
      const cols=first.split(/\t|,|，|、/).map(v=>String(v||'').trim()).filter(Boolean);
      const target=cols[1]||String(row.bossMonster||'').split('/')[0].trim();
      const count=Math.max(1,Number(cols[2])||1);
      const area=cols[3]||String(row.areaName||'').trim();
      if(target&&area) composition=`指定対象＋ランダム随伴,${target},${count},${area}`;
    }else if(formation.includes('ランダム編成') && !composition.startsWith('ランダム編成')){
      const area=String(row.areaName||'').trim();
      if(area) composition=`ランダム編成,${area}`;
    }
    row.questBossComposition=normalizeStoredEncounterComposition(composition);
  }
  return row;
}

function normalizeStateData(data){
  const out = data || {};
  // 旧版DBからの移行: material_groups は material_types へ寄せる。
  if(!Array.isArray(out.material_types) && Array.isArray(out.material_groups)) out.material_types = out.material_groups.map(r=>({id:String(r.id||'').replace('matgrp_','mtype_'), name:r.name||'', description:r.description||'', sortOrder:r.sortOrder||'', enabled:r.enabled||'TRUE', notes:r.notes||'', updatedAt:r.updatedAt||'', ownerKey:r.ownerKey||'', createdBy:r.createdBy||''}));
  DATA_KEYS.forEach(key=>{ if(!Array.isArray(out[key])) out[key]=[]; });

  const addUnique=(key,row,fields)=>{
    const sig=fields.map(f=>String(row[f]||'').trim()).join('|');
    if(!sig.replace(/\|/g,'')) return;
    if(!out[key].some(r=>fields.map(f=>String(r[f]||'').trim()).join('|')===sig)) out[key].push(row);
  };



  // 旧データ対策: 「素材ランク」を素材カテゴリ扱いで登録していた行は、素材ランク表へ移してアイテム一覧から除外する。
  const migratedRankIds = new Set();
  (out.items||[]).forEach(row=>{
    if(!row) return;
    if(String(row.dataKind||'').trim()==='素材' && String(row.materialCategory||'').trim()==='素材ランク'){
      const rankName = String(row.rank || row.name || '').trim();
      if(rankName){
        addUnique('material_ranks',{id:String(row.id||'').replace(/^mat_/,'mrank_'), name:rankName, price:row.price||'', description:row.effect||row.notes||'', sortOrder:'', enabled:'TRUE', notes:row.notes||'', updatedAt:row.updatedAt||'', ownerKey:'', createdBy:row.createdBy||''}, ['name']);
        if(row.id) migratedRankIds.add(String(row.id));
        row.__deleteAfterMigration = true;
      }
    }
  });
  out.items = (out.items||[]).filter(row=>!row.__deleteAfterMigration);

  // 旧アイテムカテゴリから新しいアイテム種別/カテゴリ/素材カテゴリへ移行。
  if(Array.isArray(data && data.item_categories)){
    const oldCats = data.item_categories;
    const byId = Object.fromEntries(oldCats.map(r=>[String(r.id||''), r]));
    oldCats.forEach(row=>{
      if(!row) return;
      if(row.name === 'モンスタードロップ') row.name = '魔物素材';
      const isMaterial = String(row.materialGroup||'').trim() || String(row.categoryType||'').includes('素材');
      if(isMaterial){
        addUnique('material_categories',{id:String(row.id||'').replace(/^cat_/,'mcat_'), name:row.name||'', materialType:row.materialGroup||'特殊素材', description:row.description||'', sortOrder:row.sortOrder||'', enabled:row.enabled||'TRUE', notes:row.notes||'', updatedAt:row.updatedAt||'', ownerKey:row.ownerKey||'', createdBy:row.createdBy||''}, ['materialType','name']);
      }else if(String(row.categoryType||'')==='大分類' && row.name && row.name!=='素材'){
        addUnique('item_types',{id:String(row.id||'').replace(/^cat_/,'itype_'), name:row.name||'', description:row.description||'', sortOrder:row.sortOrder||'', enabled:row.enabled||'TRUE', notes:row.notes||'', updatedAt:row.updatedAt||'', ownerKey:row.ownerKey||'', createdBy:row.createdBy||''}, ['name']);
      }else if(row.name){
        const parent = byId[String(row.parentId||'')] || {};
        addUnique('item_categories',{id:String(row.id||'').replace(/^cat_/,'icat_'), name:row.name||'', itemType:parent.name||row.itemType||'', description:row.description||'', sortOrder:row.sortOrder||'', enabled:row.enabled||'TRUE', notes:row.notes||'', updatedAt:row.updatedAt||'', ownerKey:row.ownerKey||'', createdBy:row.createdBy||''}, ['itemType','name']);
      }
    });
  }

  (out.items||[]).forEach(row=>{
    if(!row) return;
    if(row.category==='素材' || row.materialGroup || row.materialType || row.materialCategory){
      row.dataKind = row.dataKind || '素材';
      row.materialType = row.materialType || row.materialGroup || '';
      row.materialCategory = row.materialCategory || row.subcategory || '';
    }else{
      row.dataKind = row.dataKind || 'アイテム';
      row.itemType = row.itemType || row.category || '';
      row.itemCategory = row.itemCategory || row.subcategory || '';
      if(!String(row.csVisible || '').trim()) row.csVisible = 'TRUE';
    }
    if(row.category==='素材' && row.subcategory==='モンスタードロップ') row.subcategory='魔物素材';
    if(String(row.dataKind||'').trim()==='素材' || row.materialType || row.materialCategory){
      row.materialType = canonicalMaterialTypeName(row.materialType);
    }
  });

  (out.material_ranks || []).forEach(row=>{ if(row) row.name = numericRankValueIncludingLegacyMaterialGrade(row.name, 1); });
  (out.items || []).forEach(row=>{
    if(!row) return;
    row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1);
    if(String(row.toolRank ?? '').trim()) row.toolRank = numericRankValueIncludingLegacyMaterialGrade(row.toolRank, 1);
    if(String(row.guaranteeUpgradeMaxRank ?? '').trim()) row.guaranteeUpgradeMaxRank = numericRankValueIncludingLegacyMaterialGrade(row.guaranteeUpgradeMaxRank, 1);
    if(String(row.toolRank ?? '').trim()) row.rank = row.toolRank;
    if(isEquipmentItemRow(row)) row.upgradeMaterialMinRank = equipmentUpgradeMinimumRank(row);
    else { row.upgradeLimit = '0'; row.upgradeMaterialMinRank = ''; }
  });
  (out.recipes || []).forEach(row=>{
    if(!row) return;
    if(!String(row.recipePrice??'').trim() && String(row.limitedRecipePrice??'').trim()) row.recipePrice=row.limitedRecipePrice;
    row.limitedRecipePrice='';
    row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1);
  });
  (out.spells || []).forEach(row=>{ if(row) row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1); });
  (out.quest_rewards || []).forEach(row=>{ if(row) row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1); });
  (out.quests || []).forEach(row=>{ if(row){ row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1); normalizeEncounterPlacementRow('quests',row); } });
  (out.monsters || []).forEach(row=>{ if(row) row.rank = numericRankValueIncludingLegacyMaterialGrade(row.rank, 1); });
  (out.treasure_tables || []).forEach(row=>{ if(!row) return; row.treasureRank = numericRankValueIncludingLegacyMaterialGrade(row.treasureRank, 1); if(String(row.scrollRank ?? '').trim()) row.scrollRank = numericRankValue(row.scrollRank, 1); });
  (out.appraisal_rules || []).forEach(row=>{ if(!row) return; if(String(row.scrollRank ?? '').trim()) row.scrollRank = numericRankValue(row.scrollRank, 1); if(String(row.spellRank ?? '').trim()) row.spellRank = numericRankValue(row.spellRank, 1); });

  (out.equipment_categories || []).forEach((row,idx,arr)=>{ if(row){ arr[idx]=migrateLegacyModifierFields(row); ensurePhysicalElementForWeapon(arr[idx]); } });
  (out.items || []).forEach((row,idx,arr)=>{ if(row){ if(!String(row.sellPrice??'').trim() && String(row.price??'').trim()) row.sellPrice=row.price; delete row.price; arr[idx]=ensureItemModifierFromCategory(row, out); ensurePhysicalElementForWeapon(arr[idx]); normalizeRowCheckType('items', arr[idx]); } });
  (out.recipes || []).forEach(row=>{
    if(!row) return;
    const recipeText = [row.category, row.tags, row.unlockFacility, row.description, row.effect].map(v=>String(v||'')).join(' ');
    if(!String(row.craftType || '').trim()){
      if(/武器|派生|強化/.test(recipeText)) row.craftType = '武器派生';
      else if(/鍛冶|防具|バッグ|金属|装備/.test(recipeText)) row.craftType = '鍛冶';
      else row.craftType = '調合';
    }
    if(row.baseItem === undefined || row.baseItem === null) row.baseItem = '';
    if(row.branchType === undefined || row.branchType === null) row.branchType = '';
  });
  (out.spells || []).forEach(row=>{ if(row){ row.power = normalizePowerForDb('spells', row.power); normalizeRowCheckType('spells', row); } });
  (out.event_tables || []).forEach(row=>{ if(row){ normalizeRowCheckType('event_tables', row); normalizeEncounterPlacementRow('event_tables',row); } });
  (out.monsters || []).forEach(row=>{
    if(!row) return;
    if(row.actions !== undefined) row.actions = serializeMonsterActions(parseMonsterActions(row.actions, row.hitValue));
    delete row.hitValue;
  });

  // 最新スキーマにない過去版の分類項目は画面状態から除外する。
  DATA_KEYS.forEach(key=>{
    out[key]=(out[key]||[]).map(row=>{
      const clean={};
      (SCHEMA[key]||[]).forEach(h=>clean[h]=row && row[h] !== undefined && row[h] !== null ? row[h] : '');
      return clean;
    });
  });
  return unifyEffectNotesForDisplayRows(out);
}
function prepareRowsBeforeSave(key){
  state[key].forEach(r=>{
    if(key === 'equipment_categories') Object.assign(r, migrateLegacyModifierFields(r));
    if(key === 'items') Object.assign(r, ensureItemModifierFromCategory(r, state));
    if((key === 'items' || key === 'spells' || key === 'equipment_categories')){
      r.power = normalizePowerForDb(key, r.power);
    }
    if(!String(r.description || '').trim() && String(r['説明'] || '').trim()) r.description = r['説明'];
    if(!String(r.effect || '').trim() && String(r['効果'] || '').trim()) r.effect = r['効果'];
    delete r['説明']; delete r['効果'];
    r.updatedAt=nowIso(); markRowOwnership(r);
  });
}
function toast(msg, type='ok'){
  const t=$('toast'); t.textContent=msg; t.className='toast show '+type;
  clearTimeout(window.__toastTimer); window.__toastTimer=setTimeout(()=>t.className='toast',3200);
}
function escapeHtml(s){ return String(s ?? '').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

const FACILITY_DEFS = [
  {
    id:'smithy', name:'鍛冶屋',
    role:'炉と作業台を備えた鍛冶職人の店。武器や防具の製作から素材加工、装備強化まで幅広く請け負う。',
    services:[
      {name:'鍛冶施設利用', price:'レシピ依存', description:'備え付けの炉と道具を借りて作業できるほか、素材と依頼費を渡せば職人に製作を任せられる。'},
      {name:'仕掛け製作', price:'レシピ依存', description:'細工道具を使う戦闘用の仕掛けを作る。素材と依頼費を渡して職人へ製作を頼むこともできる。'},
      {name:'装備強化', price:'素材ランク・強化回数依存', description:'素材の性質を武具へ馴染ませ、性能を引き上げる。依頼時は素材に応じた加工費が必要。'},
      {name:'装備強化の全解除', price:'装備ランク・消費枠・効果依存', description:'武具に馴染ませた強化を一度にすべて外し、再び強化できる状態へ戻す。'},
      {name:'クリスタル強化', price:'段階別', description:'必要な素材を使ってスキルクリスタルを調整し、装着できる力の枠を広げる。'}
    ]
  },
  {
    id:'pharmacy', name:'薬屋',
    role:'薬草の香りが漂う小さな店。薬品や調合素材を扱い、持ち込まれた素材の調合も請け負う。',
    services:[
      {name:'調合施設利用', price:'レシピ依存', description:'店の調合器具を借りて自分で作るか、素材と依頼費を渡して調合を任せられる。'}
    ]
  },
  {
    id:'eatery', name:'食事処',
    role:'店主マリエッタが旅人の腹を満たす食事処。各地で得た食材を生かした料理が日ごとに並ぶ。',
    services:[
      {name:'今日のおすすめ', price:'料理別', description:'その日に用意できる食材から三品が並ぶ。食材の持ち込みは不要で、料理ごとの代金を支払う。'},
      {name:'食材持ち込み調理', price:'料理別', description:'必要な食材を持ち込めば、少額の調理代で指定した料理に仕立ててもらえる。'}
    ]
  },
  {
    id:'inn', name:'宿屋',
    role:'旅人が身体を休め、街や周辺の噂を集められる宿。冒険者向けの情報も自然と集まってくる。',
    services:[
      {name:'宿泊', price:'45G', description:'一晩ゆっくり休み、翌朝にはHPとMPを全回復し、疲労も取り除く。'},
      {name:'休息', price:'30G', description:'短い休息を取り、HPとMPを全回復する。日付は進まず、疲労はそのまま残る。'},
      {name:'噂を聞く', price:'0〜10G', description:'旅人や宿の者から、依頼・探索地・素材・魔物にまつわる噂を聞く。'}
    ]
  },
  {
    id:'antique', name:'骨董屋',
    role:'古い巻物や術式用品、不思議な結晶に加え、魔物素材を用いた骨董装備ガチャも扱う骨董屋。価値の分からない品の鑑定も引き受ける。',
    services:[
      {name:'スクロール鑑定', price:'★1 150G〜', description:'未鑑定の巻物を調べ、その内側に封じられた術式を明らかにする。鑑定具を使って自分で見極めることもできる。'},
      {name:'集中術式化', price:'施設依頼不可', description:'鑑定済みの巻物へ魔導インクや祈祷紙を用い、自ら集中して術式として定着させる。'},
      {name:'骨董装備ガチャ', price:'魔物素材の★合計', description:'武器種・防具種と★帯を指定し、来歴不詳の骨董装備を抽選する。個体ごとに基礎性能・属性・強化枠・固定強化内容が異なる。抽選後の強化追加・変更は不可。'},
      {name:'スキルガチャ', price:'共鳴用素材の★合計', description:'共鳴する素材を結晶へ捧げ、その時点で扱える力の中から一つを引き出す。'}
    ]
  },
  {
    id:'copyist', name:'レシピ販売',
    role:'各地で見つかった書付や職人の写本を扱う小さな店。日ごとに六つのレシピが店先へ並ぶ。',
    services:[
      {name:'日替わりレシピ販売', price:'レシピ別', description:'その日の仕入れから六つのレシピが並ぶ。常設の店では見かけない、宝箱から見つかるような珍しい写本も扱う。'}
    ]
  },
  {
    id:'guild', name:'ギルド',
    role:'冒険者向けの依頼が集まる受付所。クエストの表示・抽選・進行操作は進行管理HTMLに集約している。',
    services:[
      {name:'重要クエスト受付', price:'0G', description:'街や探索地の先へつながる、重要な一度きりの依頼を受け付ける。'},
      {name:'デイリークエスト掲示', price:'0G', description:'その日に持ち込まれた拠点内の仕事、探索地の依頼、納品の頼み事を掲示する。'}
    ]
  }
];
const ADMIN_FORTUNE_ROWS=[
 {from:1,to:4,name:'星巡りの幸運',oracle:'遠い星々が、今日はあなたの歩みに寄り添っているようです。',effect:'1日1回、判定前に宣言して任意の判定+2。'},
 {from:5,to:7,name:'双星の祝福',oracle:'二つの星が同じ道を照らしています。小さな幸運を分けて使うとよいでしょう。',effect:'1日2回、判定前に宣言して任意の判定+1。'},
 {from:8,to:10,name:'運命輪の巡り',oracle:'止まっていた輪が、ほんの少しだけあなたの方へ回り始めました。',effect:'1日1回、失敗した判定を振り直す。振り直した結果を採用する。'},
 {from:11,to:16,name:'剣星の導き',oracle:'刃の先に細い光が見えます。狙いを定めるなら今日でしょう。',effect:'1日2回、命中判定+1。'},
 {from:17,to:22,name:'隠者の灯火',oracle:'見落としていた足跡を、小さな灯りが照らしてくれそうです。',effect:'1日2回、探索・感知・追跡のいずれかの判定+1。'},
 {from:23,to:28,name:'豊穣杯の恵み',oracle:'満ちた杯は、手を伸ばした者へ少し多くの実りを返します。',effect:'1日2回、採取判定+1。'},
 {from:29,to:34,name:'魔術師の指先',oracle:'今日は道具がよく手になじむ日。細かな仕事ほど冴えるでしょう。',effect:'1日2回、調合・細工・設計のいずれかの判定+1。'},
 {from:35,to:39,name:'獅子座の加護',oracle:'胸の奥に力が満ちています。身体を使う仕事なら追い風になるでしょう。',effect:'1日2回、力業・運動のいずれかの判定+1。'},
 {from:40,to:45,name:'梟書の啓示',oracle:'閉じた頁の間から、必要な答えだけが覗いています。',effect:'1日2回、知識判定+1。'},
 {from:46,to:54,name:'暁星の兆し',oracle:'最初の一歩だけ、夜明けの星が強く照らしてくれます。',effect:'その日の最初に行う判定+1。'},
 {from:55,to:62,name:'均衡の天秤',oracle:'わずかな傾きが結果を変える日。最後のひと押しを見逃さないで。',effect:'1日1回、判定後・成否確定前に達成値+1。'},
 {from:63,to:70,name:'幸運の残り火',oracle:'小さな火は消えにくいもの。役目を果たすまで手元に残るでしょう。',effect:'1日1回、判定前に宣言して判定+1。その判定に失敗した場合、この運勢の使用回数を消費しない。'},
 {from:71,to:78,name:'薄雲の影',oracle:'薄い雲が一度だけ光を遮ります。避けるより、軽いうちに通り過ぎるのがよさそうです。',effect:'その日のうち1回、任意の判定に-1を適用しなければならない。未消費のまま1日を終えた場合、翌日の最初の判定に-1を強制適用する。'},
 {from:79,to:84,name:'絡み糸の兆し',oracle:'細い糸が二度、足元へ絡みます。大事な場面まで残さない方がよいでしょう。',effect:'その日のうち2回、任意の判定に-1を適用しなければならない。未消費分が残ったまま1日を終えた場合、残り回数を翌日に持ち越し、翌日の最初の判定から1回ずつ-1を強制適用する。'},
 {from:85,to:89,name:'欠けた杯',oracle:'器の縁に小さな欠けがあります。今日は手仕事と採集に少し注意を。',effect:'その日のうち1回、調合・細工・採取のいずれかの判定に-2を適用しなければならない。未消費のまま1日を終えた場合、翌日の最初の判定に-2を強制適用する。'},
 {from:90,to:95,name:'迷い月の囁き',oracle:'月の光が道を二つに見せています。手掛かりを追う時ほど迷いが入りそうです。',effect:'その日のうち1回、探索・感知・追跡のいずれかの判定に-2を適用しなければならない。未消費のまま1日を終えた場合、翌日の最初の判定に-2を強制適用する。'},
 {from:96,to:98,name:'黒星の宣告',oracle:'黒い星がひとつ落ちています。避け切るより、受ける場所を選ぶべき日です。',effect:'その日のうち1回、任意の判定に-2を適用しなければならない。未消費のまま1日を終えた場合、翌日の最初の判定に-2を強制適用する。'},
 {from:99,to:100,name:'崩塔の凶兆',oracle:'高く積み上げたものほど、小さな揺らぎを恐れるもの。今日は足元をよくご覧なさい。',effect:'その日のうち3回、任意の判定に-1を適用しなければならない。未消費分が残ったまま1日を終えた場合、残り回数を翌日に持ち越し、翌日の最初の判定から1回ずつ-1を強制適用する。'}
];
let currentAdminFortune=null;
function adminFortuneCopyText(row=currentAdminFortune){
  if(!row)return '';
  return `【今日の運勢】
${row.name}
${row.effect}`;
}
function renderAdminFortuneResult(){
  const box=$('facilityFortuneResult');
  const copy=document.querySelector('[data-fortune-copy]');
  if(!box)return;
  if(!currentAdminFortune){box.innerHTML='<span class="muted">まだ運勢を振っていません。</span>';if(copy)copy.disabled=true;return;}
  const row=currentAdminFortune;
  box.innerHTML=`<div class="fortune-roll">1D100：${row.roll}</div><div class="fortune-name">${escapeHtml(row.name)}</div><div class="fortune-oracle">${escapeHtml(row.oracle)}</div><div><b>効果：</b>${escapeHtml(row.effect)}</div>`;
  if(copy)copy.disabled=false;
}
function rollAdminFortune(){
  const roll=Math.floor(Math.random()*100)+1;
  const row=ADMIN_FORTUNE_ROWS.find(r=>roll>=r.from&&roll<=r.to)||ADMIN_FORTUNE_ROWS[ADMIN_FORTUNE_ROWS.length-1];
  currentAdminFortune={...row,roll};
  renderAdminFortuneResult();
  return currentAdminFortune;
}


const SYSTEM_HELP = [
  {
    "title": "施設",
    "tags": [
      "鍛冶屋",
      "薬屋",
      "宿屋",
      "NPC"
    ],
    "body": [
      "基本施設は鍛冶屋、薬屋、食事処、宿屋、骨董屋、レシピ販売、ギルド。",
      "鍛冶屋は武器、盾、防具、バッグ、矢筒、鍛冶素材、戦闘用罠、細工道具、鍛冶・仕掛け製作施設利用を扱う。",
      "薬屋はポーション系、薬品系調合品、調合素材、調合施設利用を扱う。",
      "食事処は、パーティーの解放エリアに応じた今日のおすすめ3品と、必要食材を持ち込んで作る料理を扱う。今日のおすすめは食材不要で、管理HTMLから再抽選できる。",
      "レシピ販売の本日の品揃えは管理HTMLで選出・コピーする。選出6枠のうち1枠は指定エリア、残り5枠は選択した解放済みエリア全体から完全ランダムで選ぶ。候補は常設店売りされず、ボス以外の宝箱から実際に入手できるレシピだけとし、料理・装備強化・装飾品強化・クリスタル強化・ボス専用レシピは含めない。",
      "料理は各エリア5品を基本とし、その5品を持ち込み料理と今日のおすすめ候補の両方に使用する。",
      "料理材料は食材カテゴリに限定せず、丸茸など用途タグが「食用可能」の採取素材・魔物素材も使用できる。",
      "宿屋は宿泊45G、休息30G、噂、クエスト情報を扱う。休息は1行動を消費してHP/MPを全回復し、宿泊は一日を終了してHP/MP全回復・疲労度0にする。",
      "骨董屋は未鑑定スクロールの高額ランダム販売、施設鑑定、魔物素材を使う骨董装備ガチャ、魔導インク・祈祷紙・術式鑑定具・聖印・魔印の常設販売を扱う。骨董装備ガチャは管理HTMLのモーダルで解放済み通常エリア・異界を指定し、装備区分・武器種/防具種・★帯を選んで骨董屋専用個体を抽選する。既存装備を素体にはせず、個体ごとに基礎性能・属性（対応武器のみ）・強化枠・固定強化内容が変化し、抽選後の強化追加・変更はできない。通常強化に加えて骨董品限定強化が低確率で付く。ボス装備・ボス素材は候補外とし、店頭では未鑑定スクロールの中身を公開しない。",
      "重要クエストの戦闘は4人を基準にし、サポートを含む2人相当を下限として出現数を調整する。人数は公開クエスト本文には表示しない。",
      "戦闘デイリーは1人から受注でき、重要クエストより軽い人数補正を使う。採取・納品・調査などの非戦闘デイリーは人数で条件を増減させない。",
      "スクロール鑑定は鑑定技能で行う。術式化の自力判定は集中で行う。",
      "魔法スクロールの術式化には魔導インクを、祈祷スクロールの術式化には祈祷紙を使う。術式化は集中技能のみで行い、施設へは依頼できない。",
      "雑貨屋は現時点では使用しない。",
      "施設NPCは、リネット、ガルド・ヴェルナー、マリエッタ・ロゼル、ミレイユ・オルセーヌ、ロジーナ・エルメル。",
      "リネットは拠点と工房の案内役。",
      "ガルド・ヴェルナーは鍛冶屋担当。",
      "ミレイユ・オルセーヌは薬屋担当。",
      "ロジーナ・エルメルは宿屋担当。"
    ]
  },
  {
    "title": "倉庫・所持品・バッグ",
    "tags": [
      "倉庫",
      "所持品",
      "バッグ"
    ],
    "body": [
      "旧所持品は倉庫。旧携行品は所持品。",
      "倉庫は保管上限なし。スタック数や枠数を気にせず最大限所持できる。",
      "冒険中に使用できるのは所持品に入っているアイテムのみ。",
      "バッグは倉庫内アイテムから選択する。",
      "バッグに設定された容量に応じて、キャラシート側の所持品枠数が変化する。",
      "初期バッグは簡素なバッグ。バッグ容量は8。",
      "採取袋は使用しない。袋カテゴリも使用しない。"
    ]
  },
  {
    "title": "道具カテゴリ",
    "tags": [
      "道具",
      "調合",
      "鍛冶"
    ],
    "body": [
      "道具カテゴリは戦闘、調合、鍛冶、その他。",
      "調合道具と鍛冶道具は細かく分割しない。",
      "調合と鍛冶は施設を借りられる前提。",
      "採取道具セット、採掘道具セット、探索道具セットは現時点では使用しない。",
      "武器と防具の破損、修理ルールは現時点では扱わない。",
      "調合道具と鍛冶道具は、アイテムランクと使用可能上限ランクを分けて登録する。",
      "素材を含むランクは1以上の数値で管理し、プレイヤー表示は★Nとする。",
      "調合道具は旅薬師の乳鉢具、硝子秤の調合具、晶瓶の調合具、星滴の蒸留具、月環の錬成具。",
      "鍛冶道具は野鍛冶の槌箱、焼入れ金床具、鋼噛み火ばさみ具、星鉄火ばさみ具、竜炉の鍛冶具。",
      "道具は★3、★6、★9、★12、★15以下のように複数ランクをまとめて扱う。レシピ側に要求道具ランクは設定しない。",
      "作成するレシピまたは装備強化に使う素材のランクが、道具の使用可能上限以下なら使用できる。上位道具による難易度軽減は通常の作成・加工・装備強化に適用する。",
      "装備強化は、強化回数で自作目標値と施設依頼成功率を算出する。施設依頼価格は素材基準価格・今回消費枠・装備ランク・現在の使用済み枠から算出する。自作用の道具補正は施設依頼成功率へ適用しない。",
      "作成補助材は対応する自作判定で任意個数を追加消費し、1個につき作成難易度－2。調合安定剤＝調合、機巧調整剤＝設計、工作定着剤＝武装・装備強化以外の細工、武装融和剤＝武器作成・武器派生、強化定着剤＝装備強化。道具軽減と重複し、施設依頼には適用しない。",
      "調合道具は薬屋、鍛冶道具は鍛冶屋で扱う。"
    ]
  },
  {
    "title": "店売り・初期販売",
    "tags": [
      "店売り",
      "初期武器",
      "防具",
      "矢筒"
    ],
    "body": [
      "鍛冶屋では、DB上の初期所持品タグ付き武器を購入可能にする。",
      "初期販売武器はショートダガー、ロングソード、ハンドアックス、ウォーハンマー、ショートスピア、ウッドスタッフ、ショートボウ、クロスボウ、ヘヴィクロスボウ、ロングスピア、グレートソード、グレートハンマー。",
      "鍛冶屋販売枠としてバトルサイズ、アイアンガントレットも扱う。",
      "防具の商品名はカテゴリ名をそのまま使わない。",
      "初期販売防具は、旅風のジャケット、鉄紐のベスト、鋲打ちの胴衣、星糸のケープ、祈り布のストール。",
      "普段着は0Gの初期装備扱い。店売り防具にはしない。",
      "矢筒は初期配布しない。鍛冶屋販売品にする。"
    ]
  },
  {
    "title": "矢弾・矢筒",
    "tags": [
      "遠距離武器",
      "矢弾",
      "矢筒",
      "スタック"
    ],
    "body": [
      "遠距離武器は通常攻撃でも矢弾を1つ消費する。",
      "矢弾がない場合、対応する遠距離武器で攻撃できない。",
      "矢弾は種類ごとに管理する。",
      "矢弾は種類ごとに最大スタック数を持つ。",
      "矢弾を矢筒に入れない場合、1種類につき所持品枠を1枠使う。",
      "初期遠距離武器を選んだ場合、対応する通常矢弾を最大スタック数分だけ初期支給する。",
      "通常矢は最大20。通常ボルトは最大20。大型ボルトは最大10。",
      "特殊矢弾の最大スタック数は効果に応じて個別に設定する。",
      "矢筒は装備枠『矢筒』に装備する。",
      "矢筒自体は所持品枠を消費しない。",
      "矢筒に入れた矢弾は所持品枠を消費しない。",
      "簡素な矢筒は2種類、旅人の矢筒は3種類、狩人の矢筒は4種類の矢弾を収納できる。",
      "キャラシート側では、矢筒を装備した場合、収納種類数ぶんの矢弾枠を入力する。"
    ]
  },
  {
    "title": "レシピ・武器派生",
    "tags": [
      "レシピ",
      "武器派生",
      "鍛冶"
    ],
    "body": [
      "レシピはDB上では1表で管理する。",
      "管理HTML上では、調合レシピ、鍛冶レシピ、仕掛け製作、武器派生、防具製作、バッグ製作、素材加工に分けて表示する。プレイヤー施設の武器派生は武器種選択モーダルの横書きボタンで選択し、「全て」も選べる。武器種ボタンを押した時点で表示を切り替え、素材系統を縦、★ランクを横にした派生図で表示する。順当強化と分岐は派生元から矢印で接続し、素材やエリアだけを理由に派生名を増やさず、分岐は派生元の直下へ配置する。同じ★ランクでの順当強化は連続2個までとし、別派生へ降りた後に元の派生列へ戻る接続は作らない。草角・樹心・沼核・穿王・反照のボス素材武器は、素手を除く全17武器カテゴリへ必ず用意する。",
      "各エリアボスには、ボス素材を使う防具または装飾品も必ず用意する。通常魔物素材の★2派生は横方向の選択肢として追加し、ボス派生の必須前提にはしない。",
      "武器派生の魔物素材要求量は、★2で合計1～2個、★3で合計2～3個を目安とする。既存の複合素材派生は維持してよい。",
      "★3以降は複数の魔物素材を要求してよいが、ボス固有素材は原則1個のままとし、大量周回を前提にしない。",
      "鉱石を主題とする鉱山鋼派生などは、魔物素材を要求しない例外にしてよい。",
      "武器上位化は、初期武器や基礎武器から素材で派生する方式。",
      "武器派生はモンハンに近い素材派生として扱う。",
      "武器派生を含む作成可能品には対応レシピを用意する。",
      "自作ではレシピ、素材、道具、製作判定が必要。施設依頼ではレシピ不要。",
      "属性派生を全属性分作る方針にはしない。物属性派生は基礎火力を維持し、属性を持つ派生は同格の物属性派生より基礎威力を少し低くする。",
      "弓・クロスボウ・ヘヴィクロスボウの攻撃属性は矢弾依存とし、一部の派生だけが特定属性の矢・ボルトへ命中・ダメージなどの適性を持つ。武器の属性は派生武器自体の性能として設定し、魔物素材による後付けの属性付与は行わない。攻撃属性は物・火・水・風・雷・光・闇・無の8種のみとし、可変属性は使用しない。武器の効果文言は同じ処理なら同じ表現へ統一し、外観説明は現武器単体の素材・形状・意匠を中心に書いて派生元武器名を安易に入れない。"
    ]
  },
  {
    "title": "魔物素材・装備強化",
    "tags": [
      "魔物素材",
      "装備強化",
      "武器",
      "防具",
      "equipmentUpgradeEffect"
    ],
    "body": [
      "魔物素材には、装備強化に使用した際の効果名と効果説明を専用項目へ設定する。一般の効果欄には重複記載しない。",
      "魔物素材はすべて何かしらの装備強化内容を持つ。",
      "魔物素材は装備強化内容・効果説明・強化対象の3項目を必須とし、未設定のまま保存またはDB送信できない。",
      "効果が複数の素材で重複しても問題ない。",
      "威力強化・命中強化・防御強化などの通常強化は、同名でも同一装備へ複数付与でき、段階数または合計値として累積する。",
      "同名効果の重複不可は素材固有の特殊効果だけに適用する。",
      "装備強化内容は選択式の項目『equipmentUpgradeEffect / 装備強化内容』で管理する。",
      "装備強化は『equipmentUpgradeEffect / 装備強化内容』へ効果名を、『equipmentUpgradeDetail / 効果説明』へ実際の処理を記録する。独立した数値項目は使用しない。",
      "装備強化内容は、直接補正の名称、属性効果、特殊効果、その他に分類する。",
      "武器用の例：威力強化、威力固定強化、命中強化、術式枠拡張、術式省力化、回復量強化、回復量固定強化、特殊効果。武器には魔導書・祈祷書を含む。",
      "防具用の例：防御値(防具)、防御行動値(防具)、回避補正(防具)、属性効果、特殊効果(防具)。",
      "防具の防御系強化は、キャラシのステータス名に準拠して防御値と防御行動値を分ける。",
      "防御値(防具)は、通常時から適用されるダメージ軽減値を上げる。",
      "防御行動値(防具)は、行動として防御した時の追加軽減値を上げる。",
      "回避補正(防具)は、装備による回避値の補正を上げる。",
      "防御値(防具)は強力な強化として扱い、低ランク素材では原則付与しない。",
      "低ランク素材の防具強化は、防御行動値、回避補正、属性効果、特殊効果を基本とする。",
      "硬い甲殻や金属殻など、常時の硬さを明確に表す素材だけ防御値(防具)を持たせる。",
      "強化内容は、何が上がるのか、何が付与されるのかを表す。",
      "補正値・属性・耐性・固有効果は、効果名と効果説明の組み合わせで表す。",
      "例：装備強化内容『威力強化』、効果説明『1段階は+1、2段階は+1D2、3段階は+1D3としてダメージへ追加する。』。",
      "武器へ属性を後付けする強化内容は使用しない。",
      "例：装備強化内容『防御行動強化』、効果説明『防御行動中のみ防御行動値+1。』。",
      "例：装備強化内容『回避強化』、効果説明『回避値+1。』。",
      "例：装備強化内容『水耐性付与』、効果説明『水属性に「耐」を得る。』。",
      "武器は素材による派生や強化に反映する。",
      "防具は派生式ではなく、購入または作成した防具を後から強化する方式。",
      "制作と購入の両方が可能な商品は、店頭購入価格を必要素材の価格合計＋施設制作費より高く設定する。",
      "実際の攻撃属性は、物、火、水、風、雷、光、闇、無の8種だけを使用する。『可変』は使用禁止。弓・クロスボウ・ヘヴィクロスボウのみ、使用する矢・ボルトで決まる表示補助『矢弾依存』を使用する。",
      "採取素材・加工素材・特殊素材など、魔物素材ではない素材は装備強化内容・消費強化枠・効果説明・強化対象をすべて空欄にし、一般の効果欄にも装備強化内容を記載しない。",
      "魔物素材の特徴が装備性能に出るように、素材ごとに分かりやすい装備強化名と効果説明を設定する。",
      "ドロップ判定やドロップ入手の出力では、素材の説明、効果、売値などを表示してよい。",
      "ドロップ出力では、装備強化内容と効果説明は表示しない。",
      "装備強化内容・効果説明・強化対象は、施設タブの強化項目と素材の情報コピーで確認できる。",
      "特殊効果を付与する魔物素材は、発動条件・対象・補正値・持続または解除条件・重複可否を特殊効果詳細へ具体的に記載し、施設表示と情報コピーへ出す。"
    ]
  },
  {
    "title": "魔物データ",
    "tags": [
      "魔物",
      "属性耐性",
      "ドロップ",
      "行動"
    ],
    "body": [
      "魔物は物、火、水、風、雷、光、闇、無の8属性に対する相性を持つ。",
      "魔物種別は粘体・獣・虫・植物・爬虫・水棲・軟体・霊体・造魔・竜・異界の大分類で管理する。飛行・甲殻・異界・鉱質などは魔物特性へ分ける。",
      "魔物素材カテゴリは魔物種別と同じ大分類を使用し、派生候補を種別から探せるようにする。",
      "属性相性は、通常、耐、無、反、吸、弱で管理する。",
      "山麓の旧鉱山以降に初登場する通常魔物の魔物素材は、基本ドロップを★3、ドロップ率20%のレア固有素材だけ★4にする。20%以外の通常素材を★4にしない。エリアボス固有素材は対象外。",
      "耐はダメージ半減。",
      "無はダメージ0、属性効果なし。",
      "反はダメージ0、受けるはずだったダメージを攻撃者へ返す。",
      "吸はダメージ0、受けるはずだったダメージ分だけHPを回復する。",
      "弱はダメージ2倍。",
      "魔物の行動は1行動1行で管理する。",
      "魔物本体には共通の命中値を持たせず、判定を行う各行動ごとに固有の基礎技能値を設定する。チャットパレットは「2D6+基礎技能値+{補正}>=参照値」の形で出力し、{補正}には妨害・バフ・デバフ・一時的なパッシブ効果など戦闘中に変動する値だけを加算する。",
      "行動ごとの基礎技能値と威力は独立して評価する。基礎技能値だけを理由にダメージを機械的に上下させず、エリア難易度・対象数・追加効果・防御貫通・予告の有無・期待値と振れ幅を合わせて個別に決める。高技能低威力・低技能高威力・抵抗参照だけ低技能など、役割に応じて個別設定してよい。",
      "魔物の基礎直接ダメージ式と武器の基礎ダメージ式はD6を必須とし、最大構成をxD6+yD2～D5+zとする。D2～D5はD6へ追加する補助ダイスとしてのみ使用でき、補助ダイスを含む場合はy<=xを必須とする。固定値zは0以上のみとし、ダメージ式へのマイナス固定値は禁止。D2～D5だけの基礎ダメージ式は禁止。毒などの継続ダメージと、条件成立時に別途加算される追加ダメージはこの式制限の対象外。D2～D5の使用自体は強制せず、D2は小さい振れ幅、D3は軽～中程度、D4は標準的な補助、D5は大きめの振れ幅を持たせたい攻撃に使い分ける。",
      "防御・補助・回復行動も自動成功にせず、行動ごとの基礎技能値を使う『技能値>=固定達成値』判定を設定する。失敗時はその行動の防御・強化・回復・準備効果を適用しない。妨害などの変動補正は{補正}へ加算し、この判定にも適用する。",
      "通常魔物は役割に必要な行動だけを登録し、選択可能な行動が4個以上なら遭遇時に3個を選出する。3個なら全て使用する。二つ名個体も3～4個なら全て使用し、選択可能な行動が5個以上なら遭遇時に4個を選出してよい。ボスは4個固定。固有パッシブは技数に含めない。固定選出技は戦闘コンセプトの成立に不可欠な場合だけ指定し、固有パッシブ参照技を一律に固定しない。準備・連携などで別行動を明示参照する場合は、参照関係が成立する組み合わせだけを選出候補にする。",
      "エリアボスは、前衛が残っている状態でも後衛へ直接ダメージを与えられる行動を最低1つ必ず持つ。後衛へ届くかは行動種別ではなく距離で判定し、原則として距離：遠距離の直接ダメージ行動を用意する。通常は距離：近距離だが固有パッシブや事前効果で後衛まで対象拡張される行動をこの条件へ含める場合は、その拡張条件を効果文へ明記する。状態異常や弱体だけの行動はこの条件を満たさない。",
      "準備と次ターンの大技で構成される予告攻撃は、2段階を1つの技として同じ行に登録する。",
      "魔物行動は行動種別と距離を別々に管理する。種別は近接攻撃、遠距離攻撃、防御、補助、回復、特殊。術式・祈祷は魔物の種別には使用しない。距離は近距離、遠距離、自身。近距離は敵前衛のみ、遠距離は敵前衛・敵後衛を対象にできる。近接攻撃は前衛へ出て行動する。遠距離攻撃は自身以外の味方前衛がいれば後衛へ下がり、いなければ前衛で行動する。攻撃以外は原則その場で処理し、自身以外の味方前衛がいない場合だけ前衛へ移動する。",
      "魔物の判定は行動種別にかかわらず、その行動に設定された基礎技能値を使用する。判定欄は『技能値>=回避値』『技能値>=抵抗値』『技能値>=固定達成値』で参照先を示す。",
      "ドロップはメモ式ではなく行単位で管理する。",
      "ドロップ素材は魔物素材カテゴリから選択する。"
    ]
  },
  {
    "title": "戦闘の基本",
    "tags": [
      "戦闘",
      "行動",
      "ダメージ"
    ],
    "body": [
      "戦闘中は移動だけが行動を消費せず、それ以外の攻撃、力業、術式、祈祷、防御、かばう、妨害、鼓舞、解析、道具使用などはターンを消費する。",
      "通常は移動後に、ターンを消費する行動を1回行う。装備効果だけで追加の攻撃行動や反撃行動を発生させない。",
      "戦闘後処理として、採取やドロップチェックを扱う。",
      "防御と回避は別処理。",
      "防御は攻撃を受け止めてダメージを減らす行動。",
      "回避は攻撃を避ける判定。"
    ]
  },
  {
    "title": "防御",
    "tags": [
      "防御",
      "防御値",
      "防御行動値",
      "防御技能"
    ],
    "body": [
      "防御値は、通常時にも適用されるダメージ軽減値。",
      "防御行動値は、行動として防御を選んだ時にだけ使う追加軽減値。",
      "防御行動値が1D6なら、防御行動時に1D6点ダメージを軽減する。",
      "防御技能に振り分けたポイントは、防御行動の有無にかかわらず常時ダメージを軽減する。",
      "通常時の最終ダメージは、受けるダメージ - 防御値 - 防御技能ポイント。",
      "防御行動時の最終ダメージは、受けるダメージ - 防御行動値 - 防御技能ポイント - 防御値。",
      "防御行動そのものに判定は行わない。",
      "防御は回避ではない。攻撃を受け止めてダメージを減らす行動。",
      "最終ダメージは0未満にならない。"
    ]
  },
  {
    "title": "かばう",
    "tags": [
      "かばう",
      "防御技能",
      "先制値"
    ],
    "body": [
      "かばうは、味方への攻撃に割り込んで自分が攻撃を引き受ける行動。",
      "かばう判定は、防御技能 >= 敵の先制値。",
      "成功した場合、攻撃対象を自分に変更する。",
      "成功後、自分が防御行動を取ったものとしてダメージを軽減する。",
      "かばう成功時の最終ダメージは、受けるダメージ - 防御行動値 - 防御技能ポイント - 防御値。",
      "単体攻撃はかばえる。",
      "複数対象攻撃は、対象のうち1人分だけかばえる。",
      "範囲攻撃は状況次第で1人だけかばえる。",
      "全体攻撃は原則かばえない。",
      "攻撃行動ごとにかばう難易度は変えない。成功難易度は敵の先制値で決める。"
    ]
  },
  {
    "title": "妨害",
    "tags": [
      "妨害",
      "先制値",
      "判定補正"
    ],
    "body": [
      "妨害は、敵の攻撃、移動、詠唱、道具使用、逃走などを邪魔する行動。",
      "妨害判定は、使用技能 >= 敵の先制値。",
      "使用技能は妨害内容に応じて決める。",
      "武器で牽制する場合は近接または射撃。",
      "押さえ込む、突き飛ばす場合は力業。",
      "詠唱や術式を邪魔する場合は魔法、知識、状況に合う技能。",
      "注意を引く、挑発する場合は交渉、社交、鼓舞など。",
      "妨害成功時、攻撃、術式、祈祷などの判定に-2を与える。",
      "移動、逃走、準備行動、道具使用など、-2しても意味が薄い行動は、GM判断で中断、停止、遅延にする。",
      "妨害失敗時、敵は通常通り行動する。",
      "妨害失敗時の追加ペナルティは基本なし。"
    ]
  },
  {
    "title": "武器攻撃・力業攻撃",
    "tags": [
      "武器攻撃",
      "力業",
      "近接",
      "射撃"
    ],
    "body": [
      "通常の近接武器攻撃は近接を使う。",
      "通常の遠距離武器攻撃は射撃を使う。",
      "力業攻撃は、近接武器攻撃の命中で近接の代わりに力業を使う攻撃。",
      "力業攻撃に命中した場合、武器ダメージのダイスを+1個する。",
      "力業攻撃のダメージ計算は、通常の武器攻撃と同じ。",
      "ダメージに加算する技能ポイントは近接を参照する。",
      "力業ポイントはダメージ加算には使わない。",
      "力業攻撃を行った場合、成否に関わらず次ターン行動不可。",
      "さらに次ターン終了まで防御-2。",
      "このデメリットは、力任せの大振りによって体勢が崩れることを表す。"
    ]
  },
  {
    "title": "術式・祈祷",
    "tags": [
      "術式",
      "祈祷",
      "属性",
      "防御判定"
    ],
    "body": [
      "初期魔法術式は魔力弾のみ。",
      "初期祈祷は癒しの祈りのみ。",
      "初期魔法術式と初期祈祷は全員が取得する。",
      "術式と祈祷には属性を設定する。",
      "魔導書のセット術式枠は、1 + 魔法に割り振ったポイント。",
      "祈祷書のセット術式枠は、1 + 祈祷に割り振ったポイント。",
      "セット術式とセット祈祷は、所持している術式データから選択する。",
      "火球、氷槍、雷撃、光弾、闇弾、爆発範囲などの攻撃・投射・範囲系魔法は回避で防ぐ。",
      "毒・汚染・呪い・火傷などの状態異常系効果は抵抗または各行動に指定された判定で防ぐ。敵からPCへの状態異常は蓄積せず、1回の判定で付与する。魔物が後衛を対象にできる行動では、PC側の後衛狙い判定-2を適用しない。状態異常の説明には、その状態そのものの効果と自然解除条件だけを書く。解除できるアイテム名・祈祷名・その他の回復手段は列挙しない。解除手段は各アイテム・祈祷・行動側の効果文で管理する。同一個体の行動は、威力・命中・対象範囲・追加効果・貫通・自己強化/自己リスクを合わせて評価し、実質上位互換を作らない。差別化のために弱い側の直接ダメージを安易に上げず、命中・効果・対象・貫通・条件で差を作るか、強い側の直接火力を下げて調整する。毒はラウンド終了時に1D3の無属性・防御無視ダメージ、火傷はラウンド終了時に1D3の火属性・防御無視ダメージを受け、どちらも戦闘終了後に解除する。汚染はHP回復量-2、呪いは攻撃・魔法・祈祷判定-1。状態名が同じという理由だけで一律に重複禁止にはせず、同一の技・行動から付与された同じ効果は重複しない。別の技・行動による同種効果は、個別に重複禁止が指定されていない限り別枠で扱う。",
      "魔物行動も同じ基準とし、攻撃・投射・範囲攻撃は回避、身体・精神・状態異常系効果は抵抗を達成値にする。",
      "効果文に「抵抗に失敗」とある魔物行動は、必ず抵抗値を使用する。"
    ]
  },
  {
    "title": "技能の戦闘利用",
    "tags": [
      "採取",
      "知識",
      "鼓舞",
      "魅力"
    ],
    "body": [
      "採取は、魔物撃破後の採取判定に成功するとドロップチェックに+1する。",
      "知識カテゴリは魔物、素材、属性。",
      "魔物知識に成功した場合、選んだ属性1つの耐性、弱点、無効、反射、吸収などを確認できる。",
      "魔物知識で全属性を一度に開示しない。",
      "鼓舞は、成功すると対象の次の判定に+2する。",
      "鼓舞の対象は、戦闘中または難しい場面の味方。",
      "魅力系技能は、交渉、共感、社交、鼓舞。"
    ]
  },
  {
    "title": "判定式",
    "tags": [
      "判定",
      "対抗",
      "カスタムチェック"
    ],
    "body": [
      "対抗式の表記は『○○vs○○』ではなく『○○>=○○』に統一する。",
      "左側はカテゴリに合う技能を使う。",
      "右側は任意入力、または選択肢から設定する。",
      "非術式系のチェックも、必要なものは同じ形式に統一する。",
      "カスタムチェックは保存と読込を可能にする。"
    ]
  },
  {
    "title": "キャラクター出力",
    "tags": [
      "チャットパレット",
      "ココフォリア",
      "出力"
    ],
    "body": [
      "武器ダメージ出力は、片手武器の場合『【左手(右手)武器ダメージ】』形式にする。",
      "両手武器のダメージ出力は『【両手武器ダメージ】』形式にする。",
      "術式の出力名は『【術式名】』形式にする。",
      "武器ダメージが設定されている武器のみ出力する。",
      "防御値の出力ラベルは『防御』。",
      "回避値の出力ラベルは『回避』。"
    ]
  },
  {
    "title": "魔物出力",
    "tags": [
      "魔物",
      "チャットパレット",
      "出力"
    ],
    "body": [
      "魔物出力はJSONではなく、クリップボードコピー形式にする。",
      "魔物出力にキャラクターメモは含めない。",
      "魔物出力にドロップは含めない。",
      "チャットパレットは『choice[技名1,技名2,…]』から始める。",
      "ラウンド開始時にプレイヤーへ公開するのは使用予定の行動名だけ。対象となるPC・対象列・距離・威力・効果は事前公開しない。対象PC・対象列は、その魔物の行動を実際に解決する時点で選ぶ。",
      "GM用チャットパレットには行動種別、対象、距離（近距離／遠距離／自身）、ダメージ、効果を表示する。",
      "行動効果欄には付与条件・状態名・固有の期限だけを記載する。具体的な状態・フィールドの定義は、チャットパレット末尾の【状態・フィールド】へ使用するものだけ1回ずつ表示する。段階制は全段階をまとめて表示する。",
      "ダイスのない効果も技能セクションに入れる。"
    ]
  },
  {
    "title": "管理HTML",
    "tags": [
      "管理",
      "検索",
      "コピー"
    ],
    "body": [
      "アイテム、素材、装備カテゴリなどの一覧では名前検索を常時表示する。",
      "詳細フィルターとソート情報は折り畳み式の『絞り込み・ソート』にまとめる。",
      "各行の情報コピーから、プレイヤーに渡すアイテム情報と登録IDをコピーできる。",
      "情報コピーには、内部ID、登録者、解放施設を含めない。魔物素材では装備強化内容・消費強化枠・効果説明・強化対象を表示する。",
      "情報コピーは、プレイヤーが読んで分かる範囲のアイテム情報と登録IDを出す。",
      "素材は、名称、登録ID、個数、ランク、分類、売値、説明を基本に出す。魔物素材は装備強化内容・消費強化枠・効果説明・強化対象を追加する。",
      "武器、防具、術式、道具、矢弾などは、使用に必要なコスト、対象、判定、属性、威力、最大スタックなどを追加で出す。"
    ]
  },
  {
    "title": "公開ID・貼り付け登録",
    "tags": [
      "公開ID",
      "倉庫",
      "ドロップ",
      "ネタバレ対策"
    ],
    "body": [
      "公開IDは、プレイヤーに渡しても内容を推測しにくい規則性のないID。",
      "キャラクターシートの倉庫では、貼り付けられた登録IDと個数を読み取り、DBから必要情報を自動登録する。",
      "プレイヤーは未入手アイテム一覧を検索しない。",
      "貼り付け登録では装備強化内容と効果説明を表示・登録しない。",
      "プレイヤーに渡す情報は、未入手一覧ではなく、入手したアイテムごとの情報と登録IDにする。",
      "装備強化内容、効果説明、内部ID、登録者、解放施設などの内部管理情報は表示しない。"
    ]
  },
  {
    "title": "初期矢弾",
    "tags": [
      "初期所持品",
      "矢弾",
      "所持品"
    ],
    "body": [
      "初期武器の選択に関係なく、通常矢、通常ボルト、大型ボルトをそれぞれ1スタック分、初期所持品に入れる。",
      "通常矢と通常ボルトは20個、大型ボルトは10個を1スタックとする。",
      "矢筒は初期支給しない。矢弾は所持品枠を使用する。"
    ]
  },
  {
    "title": "装飾品段階強化",
    "tags": [
      "装飾品",
      "固有名称",
      "段階強化",
      "5セット"
    ],
    "body": [
      "段階強化型装飾品は、通常の装備強化枠とは別に『装飾品強化』で上位段階へ置き換え、固有効果そのものを強くする。",
      "装飾品強化は、強化元の装飾品1個と必要素材を使い、上位段階の装飾品へ置き換える。施設依頼は判定不要、自作は細工で判定する。",
      "装飾品は種類を問わず通常の装備強化枠を持たない。性能成長は『装飾品強化』による段階強化・派生だけで扱い、素材強化との二重取りをしない。",
      "進行の大区切りは『通常エリア3つ＋異界1つ』を1セットとし、5セットで1区切りとして装飾品の最大段階を設計する。",
      "低負荷の数値型（最大HP・最大MPなど）は最大5段階を目安にし、1セットごとに伸ばしてよい。",
      "技能補正型は最大3段階程度を目安にし、+1、+2、+3のように伸ばす。段階間隔は数値型より広くしてよい。",
      "回復調合品補助など対象が限定される効果は3～4段階程度まで許可し、適用範囲が広いほど段階数を減らす。攻撃調合品の直接ダメージ補助は、複数対象にも各対象へ適用されるため回復補助より段階数を少なめにする。",
      "罠の直接ダメージ補助も装飾品固有効果として扱い、継続ダメージ・状態異常由来のダメージには適用しない。水辺の湿地で『刻歯の指輪（罠直接ダメージ+1）』、山麓の旧鉱山で『震牙の指輪（罠直接ダメージ+2）』へ段階強化する。",
      "装飾品による技能・能力・最大HP/MP・近接ダメージ・攻撃調合品ダメージ・罠ダメージ・回復調合品回復量などの数値補正は、効果文だけでなく補正値データへ別項として登録する。キャラシでは技能値・ダメージ式・回復式へ+Xの別項として加算し、チャットパレットには装飾品名・補正値・効果詳細を併記する。",
      "後衛狙い補正の緩和、回数制の強力効果、複数効果を持つ特殊装飾品なども通常の装備強化枠は持たせず、必要な成長は専用の段階強化・派生で扱う。",
      "異界由来の特殊装飾品は通常エリアの数値型と同じ速度で伸ばさず、必要な場合のみ後続異界で専用の段階強化・派生を追加する。",
      "異界産の装飾品を段階強化する場合、強化段階の解放先も異界とする。異界外の素材や通常加工素材を副材料として要求してよいが、強化先の異界由来素材を必ず主材料とし、必要個数の合計は異界外素材より多くする。異界に生息する魔物・異界ボスのドロップ素材は、その異界由来素材として数える。",
      "未定義の将来エリア名や解放キーは先に作らない。現在実装済みのエリアだけ実データ化し、残りの段階は5セット設計に沿って後続エリア実装時に追加する。",
      "装飾品では、武器・防具の素材強化で扱う威力・命中・防御値・防御行動値の単純な焼き直しより、技能、最大HP/MP、調合品効率、状態対策、探索補助など装飾品固有の役割を優先する。"
    ]
  },
  {
    "title": "装備強化",
    "tags": [
      "装備",
      "強化",
      "素材"
    ],
    "body": [
      "強化枠上限を持つのは武器・鎧・盾だけとする。魔導書・祈祷書は武器に含む。装飾品・バッグ・矢筒・道具・消耗品・素材などには強化枠を設定しない。",
      "★1の武器・防具・盾は原則2枠の強化枠上限を持つ。",
      "装飾品の性能成長は通常の素材強化ではなく、専用の『装飾品強化』による段階強化・派生で扱う。",
      "魔導書と祈祷書は武器として、対応する武器ランクの強化枠ルールを適用する。",
      "素手、普段着、装飾品、バッグ、矢筒、素材、調合品、道具、矢弾、スクロールには強化枠上限を表示しない。",
      "実際に適用した強化内容はキャラクターシートの装備欄で、1強化1行で記録する。"
    ]
  }
];
SYSTEM_HELP.push({title:'状態・フィールドの共通定義',tags:['魔物','状態','フィールド'],body:[...RAMonsterRules.common,...Object.values(RAMonsterRules.definitions).flat()]});
function buildSystemHelpText(){
  return SYSTEM_HELP.map(section=>{
    const tagText = (section.tags||[]).length ? `【${section.tags.join(' / ')}】\n` : '';
    return `■ ${section.title}\n${tagText}${(section.body||[]).map(line=>`・${line}`).join('\n')}`;
  }).join('\n\n');
}
function renderHelpPanel(){
  const wrap=$('helpCards');
  if(!wrap) return;
  wrap.innerHTML = SYSTEM_HELP.map((section,idx)=>`<details class="help-card" ${idx===0?'open':''}>
    <summary>${escapeHtml(section.title)}</summary>
    <div class="help-card-body">
      ${(section.tags||[]).length ? `<div class="help-mini">${section.tags.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      <ul>${(section.body||[]).map(line=>`<li>${escapeHtml(line)}</li>`).join('')}</ul>
    </div>
  </details>`).join('');
}
async function copySystemHelp(){
  const text = buildSystemHelpText();
  const out=$('helpTextOutput');
  if(out){ out.value=text; out.classList.remove('hidden'); }
  await copyAdminTextDirect(text);
  toast('ヘルプ全文コピーしました');
}

function payload(action, extra={}){
  return {action, ...extra};
}
function isGasMode(){ return typeof google !== 'undefined' && google.script && google.script.run; }
const JSONP_ACTIONS = new Set(['ping','schema','setup','list','listAll','getEquipmentCategories','characterSheetMaster','resolveRegistrationId','dedupeAll','dedupe','cleanupUploadTemps','repairAll','repairSheet','dbHashes','beginUpload','putUploadChunk','putUploadTextChunk','putUploadGzipChunk','putUploadCell','commitUpload','abortUpload','upsert','replaceSheet','beginDirectChunkUpload','directChunkUploadStatus','antiqueRegistrationStatus','putDirectRowsChunk','finishDirectChunkUpload','beginRepairSheetChunked','repairSheetChunkStatus','repairSheetRowsChunk','finishRepairSheetChunked','validateItemRecipePrices']);
function apiBaseUrl(){
  return (DEFAULT_GAS_WEB_APP_URL || '').trim();
}
function jsonpTimeoutMs(action){
  const a = String(action || '').trim();
  // Apps Scriptの1実行上限(6分)より先にブラウザ側だけが諦めないよう、書込系は約380秒待つ。
  if (['commitUpload','beginUpload','putUploadChunk','putUploadTextChunk','putUploadGzipChunk','putUploadCell','abortUpload','upsert','replaceSheet','repairSheet','repairAll','dedupe','dedupeAll','setup','beginDirectChunkUpload','directChunkUploadStatus','antiqueRegistrationStatus','putDirectRowsChunk','finishDirectChunkUpload','beginRepairSheetChunked','repairSheetChunkStatus','repairSheetRowsChunk','finishRepairSheetChunked'].includes(a)) return 380000;
  if (['list','listAll','characterSheetMaster','getEquipmentCategories','dbHashes'].includes(a)) return 45000;
  return 25000;
}
function jsonpActionLabel(action){
  const a = String(action || '').trim();
  if (['beginUpload','putUploadChunk','putUploadTextChunk','putUploadGzipChunk','putUploadCell','commitUpload','abortUpload','upsert','replaceSheet','beginDirectChunkUpload','directChunkUploadStatus','antiqueRegistrationStatus','putDirectRowsChunk','finishDirectChunkUpload','beginRepairSheetChunked','repairSheetChunkStatus','repairSheetRowsChunk','finishRepairSheetChunked'].includes(a)) return 'DB送信/反映';
  return 'DB読み込み';
}
const PERSISTENT_JSONP_WRITE_ACTIONS=new Set([
  'setup','cleanupUploadTemps','dedupe','dedupeAll','repairSheet','repairAll',
  'beginUpload','putUploadChunk','putUploadTextChunk','putUploadGzipChunk','putUploadCell','commitUpload','abortUpload',
  'upsert','replaceSheet',
  'beginDirectChunkUpload','directChunkUploadStatus','putDirectRowsChunk','finishDirectChunkUpload',
  'beginRepairSheetChunked','repairSheetChunkStatus','repairSheetRowsChunk','finishRepairSheetChunked',
  'antiqueRegistrationStatus','dbHashes','validateItemRecipePrices',
  'guildSupportSave','mealRecommendationSave','copyistDailySave','antiqueGearAreaSave','facilityGeneralAreaSave'
]);
function jsonpApi(data){
  return new Promise((resolve,reject)=>{
    const base=apiBaseUrl();
    if(!base){ reject(new Error('ローカルHTMLからDB読み込み/送信する場合はWeb App URLを入力してください。')); return; }
    const action=String(data&&data.action||'').trim(),actionLabel=jsonpActionLabel(action),persistent=PERSISTENT_JSONP_WRITE_ACTIONS.has(action);
    let settled=false,activeScript=null,activeCallback='',retryTimer=0;
    function cleanupCurrent(){
      if(retryTimer){clearTimeout(retryTimer);retryTimer=0;}
      if(activeCallback){try{delete window[activeCallback];}catch(_){window[activeCallback]=undefined;}activeCallback='';}
      if(activeScript&&activeScript.parentNode)activeScript.parentNode.removeChild(activeScript);
      activeScript=null;
    }
    function finishResolve(res){if(settled)return;settled=true;cleanupCurrent();resolve(res);}
    function finishReject(err){if(settled)return;settled=true;cleanupCurrent();reject(err);}
    function scheduleRetry(){if(settled)return;cleanupCurrent();retryTimer=setTimeout(send,800);}
    function send(){
      if(settled)return;
      cleanupCurrent();
      const callback='recraftDbCb_'+Date.now()+'_'+Math.random().toString(36).slice(2),script=document.createElement('script');
      activeCallback=callback;activeScript=script;
      window[callback]=(res)=>finishResolve(res);
      try{
        const u=new URL(base);u.searchParams.set('api','1');u.searchParams.set('callback',callback);
        Object.entries(data||{}).forEach(([k,v])=>{if(v===undefined||v===null)return;if(typeof v==='object')u.searchParams.set(k,JSON.stringify(v));else u.searchParams.set(k,String(v));});
        script.onerror=()=>{if(persistent)scheduleRetry();else finishReject(new Error(`${actionLabel}に失敗しました。WebアプリURL・公開設定・デプロイ版を確認してください。`));};
        script.src=u.toString();document.head.appendChild(script);
        retryTimer=setTimeout(()=>{
          if(settled)return;
          if(persistent)scheduleRetry();
          else finishReject(new Error(`${actionLabel}の応答を確認できませんでした。`));
        },jsonpTimeoutMs(action));
      }catch(e){if(persistent)scheduleRetry();else finishReject(e);}
    }
    send();
  });
}
function estimateJsonpUrlLength(data){
  const base=apiBaseUrl() || 'https://example.invalid/exec';
  const u=new URL(base);
  u.searchParams.set('api','1');
  u.searchParams.set('callback','recraftDbCb_ESTIMATE');
  Object.entries(data||{}).forEach(([k,v])=>{
    if(v===undefined || v===null) return;
    if(typeof v==='object') u.searchParams.set(k, JSON.stringify(v));
    else u.searchParams.set(k, String(v));
  });
  return u.toString().length;
}


const UPLOAD_RESUME_STORAGE_KEY = 'recraft_alchemia_upload_resume_v90_8_110';
const ALL_DB_RESUME_STORAGE_KEY = 'recraft_alchemia_all_db_resume_v90_8_110';
function uploadResumeLoad(){
  try{return JSON.parse(localStorage.getItem(UPLOAD_RESUME_STORAGE_KEY)||'null');}catch(e){return null;}
}
function uploadResumeSave(v){
  try{localStorage.setItem(UPLOAD_RESUME_STORAGE_KEY,JSON.stringify(v||{}));}catch(e){console.warn('upload resume save failed',e);}
}
function uploadResumeClear(){try{localStorage.removeItem(UPLOAD_RESUME_STORAGE_KEY);}catch(e){}}
function uploadResumeFingerprint(key,mode,dataKindScope,rows){
  const text=JSON.stringify((rows||[]).map(cleanUploadRow));
  let h=2166136261;
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
  return [key,mode,dataKindScope||'',(rows||[]).length,text.length,(h>>>0).toString(16)].join('|');
}
function allDbResumeLoad(){try{return JSON.parse(localStorage.getItem(ALL_DB_RESUME_STORAGE_KEY)||'null');}catch(e){return null;}}
function allDbResumeSave(v){try{localStorage.setItem(ALL_DB_RESUME_STORAGE_KEY,JSON.stringify(v||{}));}catch(e){}}
function allDbResumeClear(){try{localStorage.removeItem(ALL_DB_RESUME_STORAGE_KEY);}catch(e){}}
let __uploadProgress = {active:false, startedAt:0, title:'', totalRows:0, logs:[], displayedPercent:0};
function formatUploadBytes(n){
  const v=Number(n||0);
  if(v>=1024*1024) return (v/(1024*1024)).toFixed(2)+'MB';
  if(v>=1024) return (v/1024).toFixed(1)+'KB';
  return Math.round(v)+'B';
}
function formatUploadTime(ms){
  const v=Number(ms||0);
  if(v>=1000) return (v/1000).toFixed(1)+'秒';
  return Math.round(v)+'ms';
}
function uploadProgressElements(){
  return {
    panel:$('uploadProgressPanel'),
    title:$('uploadProgressTitle'),
    percent:$('uploadProgressPercent'),
    bar:$('uploadProgressBar'),
    meta:$('uploadProgressMeta'),
    log:$('uploadProgressLog')
  };
}
function uploadProgressStart(title,totalRows){
  __uploadProgress={active:true,startedAt:performance.now(),title:String(title||'DB送信'),totalRows:Number(totalRows||0),logs:[],displayedPercent:0};
  const el=uploadProgressElements();
  if(el.panel) el.panel.classList.remove('hidden');
  uploadProgressUpdate({phase:title||'DB送信を開始します',percent:0,currentRows:0,totalRows,detail:'準備中です。'});
  uploadProgressLog(`${title||'DB送信'}を開始します。対象${totalRows||0}行。`);
}
function uploadProgressUpdate(info={}){
  const el=uploadProgressElements();
  const requestedPercent=Math.max(0,Math.min(100,Number(info.percent||0)));
  const percent=info.allowBacktrack ? requestedPercent : Math.max(Number(__uploadProgress.displayedPercent||0), requestedPercent);
  __uploadProgress.displayedPercent=percent;
  const elapsed=__uploadProgress.startedAt ? performance.now()-__uploadProgress.startedAt : 0;
  if(el.title) el.title.textContent=info.phase || __uploadProgress.title || 'DB送信中';
  if(el.percent) el.percent.textContent=`${percent.toFixed(0)}%`;
  if(el.bar) el.bar.style.width=percent+'%';
  const lines=[];
  if(info.currentRows!==undefined || info.totalRows!==undefined){
    lines.push(`行数：${Number(info.currentRows||0)} / ${Number(info.totalRows||__uploadProgress.totalRows||0)}行`);
  }
  if(info.chunks!==undefined) lines.push(`チャンク：${info.chunks}`);
  if(info.parts!==undefined) lines.push(`送信パーツ：${info.parts}`);
  if(info.rawChars!==undefined || info.sentChars!==undefined){
    const raw=Number(info.rawChars||0);
    const sent=Number(info.sentChars||0);
    const ratio=raw ? Math.round((sent/raw)*100) : 0;
    lines.push(`サイズ：元JSON ${formatUploadBytes(raw)} / 送信目安 ${formatUploadBytes(sent)} / 約${ratio}%`);
  }
  lines.push(`経過：${formatUploadTime(elapsed)}`);
  if(info.detail) lines.push(String(info.detail));
  if(percent>0 && percent<100 && /推定/.test(String(info.detail||''))) lines.push('※ %は推定値です。完了判定はGASの応答で確定します。');
  if(el.meta) el.meta.textContent=lines.filter(Boolean).join('\n');
}
function uploadProgressLog(line){
  const text=`[${new Date().toLocaleTimeString('ja-JP',{hour12:false})}] ${line}`;
  __uploadProgress.logs.push(text);
  __uploadProgress.logs=__uploadProgress.logs.slice(-40);
  const el=uploadProgressElements();
  if(el.log) el.log.textContent=__uploadProgress.logs.join('\n');
}
function uploadProgressHeartbeat(infoFn, intervalMs=700){
  let ticks=0;
  return setInterval(()=>{
    ticks++;
    try{
      const info = typeof infoFn === 'function' ? infoFn(ticks) : {};
      uploadProgressUpdate(info || {});
      if(ticks % 5 === 0 && info && info.detail) uploadProgressLog(info.detail);
    }catch(e){
      console.warn('upload progress heartbeat failed', e);
    }
  }, intervalMs);
}
function uploadProgressSmoothHeartbeat(config={}){
  const start=Math.max(0,Math.min(99,Number(config.start||5)));
  const cap=Math.max(start,Math.min(99,Number(config.cap||94)));
  const interval=Math.max(180,Number(config.interval||360));
  const softness=Math.max(8,Number(config.softness||34));
  const phase=String(config.phase||'DB送信・反映中');
  const detail=String(config.detail||'送信後、Apps Script側の反映完了を待っています。進捗率は処理段階から算出した推定値です。');
  let ticks=0;
  uploadProgressUpdate({...config,start:undefined,cap:undefined,interval:undefined,softness:undefined,percent:start,phase,detail});
  return setInterval(()=>{
    ticks++;
    const eased=1-Math.exp(-ticks/softness);
    const percent=Math.min(cap,start+(cap-start)*eased);
    uploadProgressUpdate({...config,start:undefined,cap:undefined,interval:undefined,softness:undefined,percent,phase,detail});
  },interval);
}
function uploadProgressStopHeartbeat(timer){ if(timer) clearInterval(timer); }

function uploadProgressDone(result={}){
  const elapsed=__uploadProgress.startedAt ? performance.now()-__uploadProgress.startedAt : 0;
  const raw=Number(result.rawChars||0);
  const sent=Number(result.gzipBase64Chars ? result.gzipBase64Chars*0.75 : 0);
  uploadProgressUpdate({
    phase:'DB送信が完了しました',
    percent:100,
    currentRows:result.sentRows||__uploadProgress.totalRows||0,
    totalRows:__uploadProgress.totalRows||result.sentRows||0,
    chunks:result.sentChunks||0,
    parts:result.sentParts||0,
    rawChars:raw||undefined,
    sentChars:sent||undefined,
    detail:`完了しました。処理時間：${formatUploadTime(elapsed)} / 方式：${result.uploadEncoding||'text'}`
  });
  uploadProgressLog(`完了：${result.sentRows||0}行 / ${result.sentChunks||0}チャンク / ${result.sentParts||0}パーツ / ${formatUploadTime(elapsed)}`);
}
function uploadProgressFail(err){
  uploadProgressUpdate({phase:'DB送信に失敗しました',percent:100,detail:String(err && err.message ? err.message : err)});
  uploadProgressLog('失敗：'+String(err && err.message ? err.message : err));
}

function utf8ToBase64(str){
  const text = String(str ?? '');
  return btoa(unescape(encodeURIComponent(text)));
}
function bytesToBase64(bytes){
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let binary = '';
  const step = 0x8000;
  for(let i=0; i<arr.length; i+=step){
    binary += String.fromCharCode(...arr.subarray(i, i + step));
  }
  return btoa(binary);
}
function uploadToken(prefix, key){
  return `${prefix}_${key}_${Date.now()}_${Math.random().toString(36).slice(2)}`.replace(/[^A-Za-z0-9_-]/g,'').slice(0,48);
}
function cleanUploadRow(row){
  const out={};
  Object.entries(row || {}).forEach(([k,v])=>{
    if(!k || k === '__ui') return;
    out[k] = v == null ? '' : v;
  });
  return out;
}
function utf8ByteLength(text){ return typeof TextEncoder==='function' ? new TextEncoder().encode(String(text||'')).byteLength : unescape(encodeURIComponent(String(text||''))).length; }

const DIRECT_POST_TIMEOUT_MS = 90000;
const DIRECT_CHUNK_POST_TIMEOUT_MS = 120000;
const REPAIR_CHUNK_ROWS = 20;

function dbHashScopeCode(scope){
  const s=String(scope||'').trim();
  if(s==='素材') return 'materials';
  if(s==='アイテム') return 'items';
  return 'all';
}
function dbHashPublicKey(mode,key,scope=''){
  return `${mode||'upsert'}|${key||''}|${dbHashScopeCode(scope)}`;
}
async function sha256HexText(text){
  if(!(window.crypto && crypto.subtle && typeof TextEncoder==='function')) throw new Error('SHA-256を利用できないブラウザです。');
  const bytes=new TextEncoder().encode(String(text||''));
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
}
function directPostForm(action,payloadObject,timeoutMs=DIRECT_POST_TIMEOUT_MS,probeOptions=null){
  return new Promise((resolve,reject)=>{
    const base=apiBaseUrl();
    if(!base){reject(new Error('Web App URLが設定されていません。'));return;}
    const token=String(payloadObject&&payloadObject.token||''),frames=[];
    let settled=false,probeTimer=0,probeStarter=0,retryTimer=0,timeoutTimer=0,probing=false,attemptNo=0;
    function cleanup(){
      if(probeStarter)clearTimeout(probeStarter);if(probeTimer)clearInterval(probeTimer);if(retryTimer)clearInterval(retryTimer);if(timeoutTimer)clearTimeout(timeoutTimer);
      window.removeEventListener('message',onMessage);frames.forEach(frame=>setTimeout(()=>{try{frame.remove();}catch(_){}},0));
    }
    function finishResolve(value){if(settled)return;settled=true;cleanup();resolve(value);}
    function finishReject(error){if(settled)return;settled=true;cleanup();reject(error);}
    function onMessage(event){
      const data=event.data||{};if(data.type!=='recraft-db-post-result'||String(data.token||'')!==token)return;
      const result=data.result||{ok:false,error:'DB送信結果が空です。'};
      if(result.ok===false){finishReject(new Error(result.error||'DB更新に失敗しました'));return;}
      finishResolve(result);
    }
    async function runProbe(){if(settled||probing||!probeOptions||typeof probeOptions.check!=='function')return;probing=true;try{const value=await probeOptions.check();if(value)finishResolve(value);}catch(_){}finally{probing=false;}}
    function submitAttempt(){
      if(settled)return;attemptNo++;
      const frame=document.createElement('iframe');frame.name='recraftDbPost_'+Date.now()+'_'+attemptNo+'_'+Math.random().toString(36).slice(2);frame.style.display='none';frame.setAttribute('aria-hidden','true');document.body.appendChild(frame);frames.push(frame);
      try{const doc=frame.contentDocument||frame.contentWindow?.document;if(!doc)throw new Error('DB送信用通信フレームを初期化できませんでした。');const form=doc.createElement('form'),actionUrl=new URL(base);actionUrl.searchParams.set('action',String(action||''));actionUrl.searchParams.set('responseMode','postMessage');actionUrl.searchParams.set('token',token);form.method='POST';form.action=actionUrl.toString();form.enctype='application/x-www-form-urlencoded';form.acceptCharset='UTF-8';const field=doc.createElement('input');field.type='hidden';field.name='payload';field.value=JSON.stringify(payloadObject||{});form.appendChild(field);doc.body.appendChild(form);form.submit();}
      catch(error){try{frame.remove();}catch(_){}const idx=frames.indexOf(frame);if(idx>=0)frames.splice(idx,1);if(attemptNo===1)finishReject(error);}
    }
    if(probeOptions&&typeof probeOptions.check==='function'){const delay=Math.max(250,Number(probeOptions.delayMs||700)),interval=Math.max(300,Number(probeOptions.intervalMs||700));probeStarter=setTimeout(()=>{if(settled)return;runProbe();probeTimer=setInterval(runProbe,interval);},delay);}
    window.addEventListener('message',onMessage);submitAttempt();if(settled)return;
    retryTimer=setInterval(()=>{runProbe();submitAttempt();},Math.max(10000,Math.min(20000,Math.floor((Number(timeoutMs)||DIRECT_POST_TIMEOUT_MS)/4))));
    timeoutTimer=setTimeout(()=>finishReject(new Error('DB送信の応答確認がタイムアウトしました。')),Math.max(15000,Number(timeoutMs)||DIRECT_POST_TIMEOUT_MS));
  });
}

function directChunkStatusProbe(token,minimumNextChunk=0){
  return {
    delayMs:650,intervalMs:650,
    check:async()=>{
      const status=await jsonpApi(payload('directChunkUploadStatus',{token}));
      if(!status||!status.ok||!status.found)return null;
      if(Number(status.nextChunk||0)<Number(minimumNextChunk||0))return null;
      return {...status,ok:true,acknowledgedByStatus:true};
    }
  };
}
function repairChunkStatusProbe(sheetKey,minimumProcessedRows=0){
  return {
    delayMs:650,intervalMs:650,
    check:async()=>{
      const status=await jsonpApi(payload('repairSheetChunkStatus',{sheetKey}));
      if(!status||!status.ok||!status.found)return null;
      if(Number(status.processedRows||0)<Number(minimumProcessedRows||0))return null;
      return {...status,ok:true,acknowledgedByStatus:true};
    }
  };
}
function antiqueRegistrationProbe(publicId){
  return {
    delayMs:450,intervalMs:500,
    check:async()=>{
      const status=await jsonpApi(payload('antiqueRegistrationStatus',{publicId}));
      if(!status||!status.ok||!status.found)return null;
      return {...status,ok:true,acknowledgedByStatus:true,inserted:1,updated:0,total:1};
    }
  };
}
function canUseDirectPostUpload(){
  return !!apiBaseUrl()
    && (isGasMode() || (typeof document!=='undefined' && typeof HTMLFormElement!=='undefined'));
}
async function loadServerDbHashes(){
  const res=await callApi(payload('dbHashes'));
  if(!res||!res.ok) throw new Error((res&&res.error)||'DBハッシュの取得に失敗しました');
  return res.hashes||{};
}

const UPLOAD_JSONP_URL_LIMIT = 2200;
const UPLOAD_PART_CHAR_STEP = 260;
const UPLOAD_GZIP_B64_PART_STEP = 1150;
const UPLOAD_GZIP_RAW_BYTES_PER_CHUNK = 32768;
const UPLOAD_GZIP_MAX_ROWS_PER_CHUNK = 40;
const UPLOAD_GZIP_COMPRESSION_SCHEMA = 'gzipUtf8Bytes32kRows40_v90_8_385';
// v90.8.599: 大量DBは無圧縮・直接分割書込を標準にする。
// v90.8.678: 実測タイムアウト対策として、実データPOSTだけを最大25行/約64KBへ縮小。
// begin/status/finish/abortなどデータ本体を含まない制御命令はJSONP/google.script.runへ分離する。
// GAS側は開始時に既存キーを1回だけ索引化し、各データチャンクでは対象行だけ更新/appendする。
const DIRECT_CHUNK_MAX_ROWS = 25;
const DIRECT_CHUNK_MAX_BYTES = 65536;
const DIRECT_SMALL_UPSERT_ROWS = 25;
// v90.8.678: 小さい表まで一括処理のchecksum付き経路でPOSTへ送らない。
// JSONP分割ならWebアプリのPOST/iframe応答に依存せず、カテゴリ類を確実に処理できる。
const JSONP_SMALL_UPLOAD_MAX_ROWS = 80;
const JSONP_SMALL_UPLOAD_MAX_BYTES = 65536;
function shouldUseSmallJsonpUpload(rows){
  const list=(rows||[]).map(cleanUploadRow);
  if(list.length>JSONP_SMALL_UPLOAD_MAX_ROWS)return false;
  return utf8ByteLength(JSON.stringify(list))<=JSONP_SMALL_UPLOAD_MAX_BYTES;
}
function uploadPartPayload(token, chunkIndex, partIndex, textPart){
  return payload('putUploadChunk', {
    token,
    chunkIndex,
    partIndex,
    valueB64: utf8ToBase64(textPart)
  });
}
function uploadGzipPartPayload(token, chunkIndex, partIndex, gzipBase64Part){
  return payload('putUploadGzipChunk', {
    token,
    chunkIndex,
    partIndex,
    valueB64: String(gzipBase64Part || '')
  });
}
function isUploadPartUrlSafe(token, chunkIndex, partIndex, textPart){
  return estimateJsonpUrlLength(uploadPartPayload(token, chunkIndex, partIndex, textPart)) <= UPLOAD_JSONP_URL_LIMIT;
}
function isGzipPartUrlSafe(token, chunkIndex, partIndex, gzipBase64Part){
  return estimateJsonpUrlLength(uploadGzipPartPayload(token, chunkIndex, partIndex, gzipBase64Part)) <= UPLOAD_JSONP_URL_LIMIT;
}
function splitTextForJsonpUpload(token, chunkIndex, text){
  const s = String(text ?? '');
  if(!s.length) return [''];
  const parts=[];
  let pos=0;
  while(pos < s.length){
    let size = Math.min(UPLOAD_PART_CHAR_STEP, s.length - pos);
    let part = s.slice(pos, pos + size);
    while(size > 1 && !isUploadPartUrlSafe(token, chunkIndex, parts.length, part)){
      size = Math.max(1, Math.floor(size * 0.72));
      part = s.slice(pos, pos + size);
    }
    if(size <= 1 && !isUploadPartUrlSafe(token, chunkIndex, parts.length, part)){
      throw new Error('1文字でも送信URLが長すぎます。WebアプリURLが異常に長い可能性があります。');
    }
    parts.push(part);
    pos += size;
  }
  return parts;
}
function splitGzipBase64ForJsonpUpload(token, chunkIndex, gzipBase64){
  const s = String(gzipBase64 || '');
  if(!s.length) return [''];
  const parts=[];
  let pos=0;
  while(pos < s.length){
    let size = Math.min(UPLOAD_GZIP_B64_PART_STEP, s.length - pos);
    let part = s.slice(pos, pos + size);
    while(size > 1 && !isGzipPartUrlSafe(token, chunkIndex, parts.length, part)){
      size = Math.max(1, Math.floor(size * 0.72));
      part = s.slice(pos, pos + size);
    }
    if(size <= 1 && !isGzipPartUrlSafe(token, chunkIndex, parts.length, part)){
      throw new Error('圧縮済みデータ1文字分でも送信URLが長すぎます。WebアプリURLが異常に長い可能性があります。');
    }
    parts.push(part);
    pos += size;
  }
  return parts;
}
function canUseGzipUpload(){
  return typeof CompressionStream === 'function'
    && typeof TextEncoder === 'function'
    && typeof Response === 'function'
    && typeof Uint8Array === 'function';
}
async function gzipBase64FromText(text){
  // readable側を同時に消費するpipeThrough方式にする。
  // 旧方式は大きめの入力でbackpressureが発生し、圧縮中のまま止まることがあった。
  const source = new Blob([String(text ?? '')]).stream();
  const compressed = source.pipeThrough(new CompressionStream('gzip'));
  const buffer = await new Response(compressed).arrayBuffer();
  return bytesToBase64(new Uint8Array(buffer));
}
function estimateRowsChunkUrlSafe(token, chunkIndex, rows){
  const text = JSON.stringify(rows || []);
  return isUploadPartUrlSafe(token, chunkIndex, 0, text);
}
function makeUploadRowChunks(token, rows){
  const list = (rows || []).map(cleanUploadRow);
  const chunks=[];
  let current=[];
  for(const row of list){
    const attempt = current.concat([row]);
    if(attempt.length && estimateRowsChunkUrlSafe(token, chunks.length, attempt)){
      current = attempt;
      continue;
    }
    if(current.length){
      chunks.push(current);
      current=[];
    }
    // 1行だけでも長い場合は、この1行だけのチャンクにして、送信時に文字列分割する。
    current=[row];
    if(!estimateRowsChunkUrlSafe(token, chunks.length, current)){
      chunks.push(current);
      current=[];
    }
  }
  if(current.length) chunks.push(current);
  return chunks;
}
function makeGzipUploadRowChunks(rows){
  const list = (rows || []).map(cleanUploadRow);
  const encoder = new TextEncoder();
  const chunks=[];
  let current=[];
  let currentBytes=2; // []
  for(const row of list){
    const rowText = JSON.stringify(row || {});
    const addBytes = encoder.encode(rowText).byteLength + (current.length ? 1 : 0);
    if(current.length && (currentBytes + addBytes > UPLOAD_GZIP_RAW_BYTES_PER_CHUNK || current.length >= UPLOAD_GZIP_MAX_ROWS_PER_CHUNK)){
      chunks.push(current);
      current=[];
      currentBytes=2;
    }
    current.push(row);
    currentBytes += addBytes;
  }
  if(current.length) chunks.push(current);
  return chunks;
}
function yieldUploadUi(){
  return new Promise(resolve=>{
    if(typeof requestAnimationFrame==='function') requestAnimationFrame(()=>setTimeout(resolve,0));
    else setTimeout(resolve,0);
  });
}

function makeDirectRowChunks(rows){
  const list=(rows||[]).map(cleanUploadRow);
  const chunks=[];
  let current=[];
  let currentBytes=2;
  for(const row of list){
    const rowText=JSON.stringify(row||{});
    const addBytes=utf8ByteLength(rowText)+(current.length?1:0);
    if(current.length && (current.length>=DIRECT_CHUNK_MAX_ROWS || currentBytes+addBytes>DIRECT_CHUNK_MAX_BYTES)){
      chunks.push(current); current=[]; currentBytes=2;
    }
    current.push(row); currentBytes+=addBytes;
  }
  if(current.length)chunks.push(current);
  return chunks;
}


async function uploadRowsByTextChunks(key, rows, mode, dataKindScope='', options={}){
  const token = uploadToken(mode === 'replace' ? 'rp' : 'up', key);
  const list = rows || [];
  uploadProgressStart(`${labelKey(key)}の通常DB送信`, list.length);
  const begin = await callApi(payload('beginUpload', {sheetKey:key, mode, token, uploadEncoding:'text', dataKindScope, checksum:String(options.checksum||''), deferPriceCrossValidation:!!options.deferPriceCrossValidation}));
  if(!begin.ok) throw new Error(begin.error || `${labelKey(key)}のDB送信準備に失敗しました`);
  let sentChunks = 0;
  let sentParts = 0;
  let rawChars = 0;
  try{
    const chunks = makeUploadRowChunks(token, list);
    uploadProgressLog(`通常送信用に${chunks.length}チャンクへ分割しました。`);
    for(let c=0; c<chunks.length; c++){
      const text = JSON.stringify(chunks[c]);
      rawChars += text.length;
      const parts = splitTextForJsonpUpload(token, c, text);
      uploadProgressLog(`チャンク${c+1}/${chunks.length}：${chunks[c].length}行 / ${parts.length}パーツ送信`);
      for(let p=0; p<parts.length; p++){
        const res = await callApi(uploadPartPayload(token, c, p, parts[p]));
        if(!res.ok) throw new Error(res.error || `${labelKey(key)}のDB送信に失敗しました`);
        sentParts++;
        uploadProgressUpdate({
          phase:`${labelKey(key)}を通常送信中`,
          percent:Math.min(88, ((c + (p+1)/parts.length) / Math.max(1,chunks.length)) * 88),
          currentRows:chunks.slice(0,c).reduce((sum,rows)=>sum+rows.length,0),
          totalRows:list.length,
          chunks:`${c+1}/${chunks.length}`,
          parts:sentParts,
          rawChars,
          sentChars:rawChars,
          detail:`チャンク${c+1}の${p+1}/${parts.length}パーツを送信しました。`
        });
      }
      sentChunks++;
      if(chunks.length > 3) await sleep(15);
    }
    uploadProgressUpdate({phase:'DB反映中',percent:92,currentRows:list.length,totalRows:list.length,chunks:`${sentChunks}/${chunks.length}`,parts:sentParts,rawChars,sentChars:rawChars,detail:'Apps Script側でシートへ一括反映しています。'});
    uploadProgressLog('Apps Script側でDB反映を開始します。');
    const commit = await callApi(payload('commitUpload', {token}));
    if(!commit.ok) throw new Error(commit.error || `${labelKey(key)}のDB反映に失敗しました`);
    const result={...commit, uploadEncoding:'text', sentRows:list.length, sentChunks, sentParts, rawChars};
    uploadProgressDone(result);
    return result;
  }catch(e){
    uploadProgressFail(e);
    try{ await callApi(payload('abortUpload', {token})); }catch(abortErr){ console.warn('upload abort failed', abortErr); }
    throw e;
  }
}
async function uploadRowsByGzipChunks(key, rows, mode, dataKindScope='', options={}){
  const list = rows || [];
  const fingerprint = uploadResumeFingerprint(key,mode,dataKindScope,list);
  const previous = uploadResumeLoad();
  const canResume = previous && previous.encoding==='gzipBase64'
    && previous.chunkSchema===UPLOAD_GZIP_COMPRESSION_SCHEMA
    && previous.fingerprint===fingerprint && previous.token
    && !!previous.deferPriceCrossValidation===!!options.deferPriceCrossValidation;
  if(previous && previous.token && !canResume){
    try{await callApi(payload('abortUpload',{token:previous.token}));}catch(e){console.warn('old upload session cleanup failed',e);}
    uploadResumeClear();
  }
  const token = canResume ? previous.token : uploadToken(mode === 'replace' ? 'gzrp' : 'gzup', key);
  uploadProgressStart(`${labelKey(key)}の圧縮分割DB送信${canResume?'（続きから）':''}`, list.length);
  if(!canResume){
    const begin = await callApi(payload('beginUpload', {sheetKey:key, mode, token, uploadEncoding:'gzipBase64', chunkSchema:UPLOAD_GZIP_COMPRESSION_SCHEMA, dataKindScope, checksum:String(options.checksum||''), deferPriceCrossValidation:!!options.deferPriceCrossValidation}));
    if(!begin.ok) throw new Error(begin.error || `${labelKey(key)}のDB圧縮送信準備に失敗しました`);
  }else uploadProgressLog(`保存済み位置から再開します：チャンク${Number(previous.nextChunk||0)+1} / パーツ${Number(previous.nextPart||0)+1}`);
  let sentChunks = Number(canResume ? previous.nextChunk||0 : 0);
  let sentParts = Number(canResume ? previous.sentParts||0 : 0);
  let rawChars = 0;
  let gzipBase64Chars = 0;
  const chunks = makeGzipUploadRowChunks(list);
  let startChunk = Math.min(chunks.length, Number(canResume ? previous.nextChunk||0 : 0));
  let startPart = Math.max(0, Number(canResume ? previous.nextPart||0 : 0));
  try{
    uploadProgressLog(`圧縮単位：未圧縮UTF-8最大${formatUploadBytes(UPLOAD_GZIP_RAW_BYTES_PER_CHUNK)}・最大${UPLOAD_GZIP_MAX_ROWS_PER_CHUNK}行。全${chunks.length}チャンクを個別に圧縮します。`);
    let sentRows = chunks.slice(0,startChunk).reduce((n,r)=>n+r.length,0);
    for(let c=startChunk; c<chunks.length; c++){
      const text = JSON.stringify(chunks[c]); rawChars += text.length;
      uploadProgressUpdate({phase:`${labelKey(key)}を圧縮中`,percent:10+Math.min(20,(c/Math.max(1,chunks.length))*20),currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:sentParts,detail:`チャンク${c+1}を圧縮しています。`});
      await yieldUploadUi();
      const gzipBase64 = await gzipBase64FromText(text);
      await yieldUploadUi();
      gzipBase64Chars += gzipBase64.length;
      const parts = splitGzipBase64ForJsonpUpload(token,c,gzipBase64);
      const p0 = c===startChunk ? Math.min(startPart,parts.length) : 0;
      uploadProgressLog(`チャンク${c+1}/${chunks.length}：${chunks[c].length}行 / ${parts.length}パーツ（${p0?`${p0+1}から再開`:'先頭から'}）`);
      for(let p=p0;p<parts.length;p++){
        const res=await callApi(uploadGzipPartPayload(token,c,p,parts[p]));
        if(!res.ok) throw new Error(res.error||`${labelKey(key)}のDB圧縮送信に失敗しました`);
        sentParts++;
        const nextPart=p+1;
        const checkpoint=nextPart>=parts.length
          ? {nextChunk:c+1,nextPart:0}
          : {nextChunk:c,nextPart:nextPart};
        uploadResumeSave({encoding:'gzipBase64',chunkSchema:UPLOAD_GZIP_COMPRESSION_SCHEMA,fingerprint,token,key,mode,dataKindScope,deferPriceCrossValidation:!!options.deferPriceCrossValidation,sentParts,...checkpoint,updatedAt:new Date().toISOString()});
        uploadProgressUpdate({phase:`${labelKey(key)}を圧縮分割送信中`,percent:30+Math.min(60,((c+(p+1)/parts.length)/Math.max(1,chunks.length))*60),currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:sentParts,rawChars,sentChars:gzipBase64Chars*.75,detail:`チャンク${c+1}の${p+1}/${parts.length}パーツを送信しました。`});
      }
      sentChunks=c+1; sentRows+=chunks[c].length; startPart=0;
      if(chunks.length>1) await sleep(15);
    }
    uploadProgressUpdate({phase:'DB反映中',percent:94,currentRows:list.length,totalRows:list.length,chunks:`${sentChunks}/${chunks.length}`,parts:sentParts,detail:'Apps Script側で復元してDBへ反映しています。'});
    const commit=await callApi(payload('commitUpload',{token}));
    if(!commit.ok) throw new Error(commit.error||`${labelKey(key)}のDB反映に失敗しました`);
    uploadResumeClear();
    const result={...commit,uploadEncoding:'gzipBase64',sentRows:list.length,sentChunks, sentParts,rawChars,gzipBase64Chars};
    uploadProgressDone(result); return result;
  }catch(e){
    uploadProgressFail(e);
    uploadProgressLog('送信位置を保存しました。「続きから再開」を選ぶと未送信パーツから再開します。');
    throw e;
  }
}
async function uploadRowsByTextPostChunks(key, rows, mode, dataKindScope='', options={}){
  const list=(rows||[]).map(cleanUploadRow);
  const token=uploadToken(mode==='replace'?'txtrp':'txtup',key);
  const maxBytes=262144;
  const chunks=[];
  let current=[];
  let currentBytes=2;
  for(const row of list){
    const rowText=JSON.stringify(row||{});
    const addBytes=utf8ByteLength(rowText)+(current.length?1:0);
    if(current.length && currentBytes+addBytes>maxBytes){ chunks.push(current); current=[]; currentBytes=2; }
    current.push(row); currentBytes+=addBytes;
  }
  if(current.length)chunks.push(current);
  uploadProgressStart(`${labelKey(key)}の無圧縮分割POST送信`,list.length);
  const begin=await callApi(payload('beginUpload',{sheetKey:key,mode,token,uploadEncoding:'text',dataKindScope,deferPriceCrossValidation:!!options.deferPriceCrossValidation}));
  if(!begin||!begin.ok)throw new Error((begin&&begin.error)||`${labelKey(key)}の送信準備に失敗しました`);
  let sentRows=0, rawBytes=0;
  try{
    for(let c=0;c<chunks.length;c++){
      const text=JSON.stringify(chunks[c]);
      const bytes=utf8ByteLength(text);rawBytes+=bytes;
      const res=await directPostForm('putUploadTextChunk',{token,chunkIndex:c,partIndex:0,jsonPart:text},90000);
      if(!res||!res.ok)throw new Error((res&&res.error)||`${labelKey(key)}の無圧縮分割POST送信に失敗しました`);
      sentRows+=chunks[c].length;
      uploadProgressUpdate({phase:`${labelKey(key)}を無圧縮分割POST送信中`,percent:Math.min(90,((c+1)/Math.max(1,chunks.length))*90),currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:c+1,rawChars:rawBytes,sentChars:rawBytes,detail:`${formatUploadBytes(bytes)}を無圧縮で送信しました。`});
      if(chunks.length>1)await sleep(10);
    }
    uploadProgressUpdate({phase:'DB反映中',percent:94,currentRows:list.length,totalRows:list.length,chunks:`${chunks.length}/${chunks.length}`,parts:chunks.length,detail:'Apps Script側で受信済みデータをDBへ反映しています。'});
    const commit=await callApi(payload('commitUpload',{token}));
    if(!commit||!commit.ok)throw new Error((commit&&commit.error)||`${labelKey(key)}のDB反映に失敗しました`);
    const result={...commit,uploadEncoding:'text-post-chunks',sentRows:list.length,sentChunks:chunks.length,sentParts:chunks.length,rawChars:rawBytes};
    uploadProgressDone(result);return result;
  }catch(e){
    uploadProgressFail(e);
    try{await callApi(payload('abortUpload',{token}));}catch(_e){}
    throw e;
  }
}

async function uploadRowsByGzipPostChunks(key, rows, mode, dataKindScope='', options={}){
  const list = rows || [];
  const fingerprint = uploadResumeFingerprint(key,mode,dataKindScope,list);
  const previous = uploadResumeLoad();
  const canResume = previous && previous.encoding==='gzipBase64'
    && previous.chunkSchema===UPLOAD_GZIP_COMPRESSION_SCHEMA
    && previous.fingerprint===fingerprint && previous.token
    && !!previous.deferPriceCrossValidation===!!options.deferPriceCrossValidation;
  if(previous && previous.token && !canResume){
    try{await callApi(payload('abortUpload',{token:previous.token}));}catch(e){console.warn('old upload session cleanup failed',e);}
    uploadResumeClear();
  }
  const token = canResume ? previous.token : uploadToken(mode === 'replace' ? 'gzpostrp' : 'gzpostup', key);
  uploadProgressStart(`${labelKey(key)}の圧縮分割POST送信${canResume?'（続きから）':''}`, list.length);
  if(!canResume){
    const begin = await callApi(payload('beginUpload', {sheetKey:key, mode, token, uploadEncoding:'gzipBase64', chunkSchema:UPLOAD_GZIP_COMPRESSION_SCHEMA, dataKindScope, deferPriceCrossValidation:!!options.deferPriceCrossValidation}));
    if(!begin.ok) throw new Error(begin.error || `${labelKey(key)}のDB圧縮送信準備に失敗しました`);
  }else uploadProgressLog(`保存済み位置から再開します：チャンク${Number(previous.nextChunk||0)+1}`);
  const chunks = makeGzipUploadRowChunks(list);
  let startChunk = Math.min(chunks.length, Number(canResume ? previous.nextChunk||0 : 0));
  let sentChunks = startChunk;
  let sentParts = Number(canResume ? previous.sentParts||0 : 0);
  let rawChars = 0;
  let gzipBase64Chars = 0;
  try{
    uploadProgressLog(`圧縮単位：未圧縮UTF-8最大${formatUploadBytes(UPLOAD_GZIP_RAW_BYTES_PER_CHUNK)}・最大${UPLOAD_GZIP_MAX_ROWS_PER_CHUNK}行。全${chunks.length}チャンクを個別圧縮してPOST送信します。`);
    let sentRows = chunks.slice(0,startChunk).reduce((n,r)=>n+r.length,0);
    for(let c=startChunk;c<chunks.length;c++){
      const text=JSON.stringify(chunks[c]);
      rawChars+=text.length;
      uploadProgressUpdate({
        phase:`${labelKey(key)}を圧縮中`,
        percent:10+Math.min(20,(c/Math.max(1,chunks.length))*20),
        currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:sentParts,
        detail:`チャンク${c+1}を圧縮しています。`
      });
      await yieldUploadUi();
      const gzipBase64=await gzipBase64FromText(text);
      await yieldUploadUi();
      gzipBase64Chars+=gzipBase64.length;
      uploadProgressLog(`チャンク${c+1}/${chunks.length}：${chunks[c].length}行 / ${formatUploadBytes(gzipBase64.length*.75)}をPOST送信`);
      const res=await directPostForm('putUploadGzipChunk',{
        token,chunkIndex:c,partIndex:0,valueB64:gzipBase64
      },90000);
      if(!res.ok)throw new Error(res.error||`${labelKey(key)}のDB圧縮分割POST送信に失敗しました`);
      sentChunks=c+1;
      sentParts++;
      sentRows+=chunks[c].length;
      uploadResumeSave({
        encoding:'gzipBase64',transport:'post',chunkSchema:UPLOAD_GZIP_COMPRESSION_SCHEMA,fingerprint,token,key,mode,dataKindScope,deferPriceCrossValidation:!!options.deferPriceCrossValidation,
        sentParts,nextChunk:c+1,nextPart:0,updatedAt:new Date().toISOString()
      });
      uploadProgressUpdate({
        phase:`${labelKey(key)}を圧縮分割POST送信中`,
        percent:30+Math.min(60,((c+1)/Math.max(1,chunks.length))*60),
        currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:sentParts,
        rawChars,sentChars:gzipBase64Chars*.75,
        detail:`チャンク${c+1}/${chunks.length}を送信しました。`
      });
      if(chunks.length>1)await sleep(15);
    }
    uploadProgressUpdate({
      phase:'DB反映中',percent:94,currentRows:list.length,totalRows:list.length,
      chunks:`${sentChunks}/${chunks.length}`,parts:sentParts,
      detail:'Apps Script側で復元してDBへ反映しています。'
    });
    const commit=await callApi(payload('commitUpload',{token}));
    if(!commit.ok)throw new Error(commit.error||`${labelKey(key)}のDB反映に失敗しました`);
    uploadResumeClear();
    const result={...commit,uploadEncoding:'gzipBase64-post-chunks',sentRows:list.length,sentChunks,sentParts,rawChars,gzipBase64Chars};
    uploadProgressDone(result);
    return result;
  }catch(e){
    uploadProgressFail(e);
    uploadProgressLog('送信位置を保存しました。再実行時は未送信チャンクから再開します。');
    throw e;
  }
}

async function uploadRowsSmallDirectPost(key, rows, mode, dataKindScope=''){
  const list=(rows||[]).map(cleanUploadRow);
  const token=uploadToken(mode==='replace'?'smallrp':'smallup',key);
  const rawBytes=utf8ByteLength(JSON.stringify(list));
  uploadProgressStart(`${labelKey(key)}の軽量直接送信`,list.length);
  const started=performance.now();
  const action=mode==='replace'?'replaceSheet':'upsert';
  const res=await directPostForm(action,{sheetKey:key,token,rows:list,dataKindScope,returnRows:false},DIRECT_CHUNK_POST_TIMEOUT_MS);
  if(!res||!res.ok)throw new Error((res&&res.error)||`${labelKey(key)}の直接DB送信に失敗しました`);
  const elapsed=performance.now()-started;
  uploadProgressLog(`直接POST：${list.length}行 / 通信+GAS ${formatUploadTime(elapsed)}${res.elapsedMs!==undefined?` / GAS ${formatUploadTime(res.elapsedMs)}`:''}`);
  const result={...res,uploadEncoding:'direct-small-raw-post',sentRows:list.length,sentChunks:1,sentParts:1,rawChars:rawBytes};
  uploadProgressDone(result);return result;
}

async function uploadRowsByDirectChunks(key, rows, mode, dataKindScope='', options={}){
  const list=(rows||[]).map(cleanUploadRow);
  const fingerprint=uploadResumeFingerprint(key,mode,dataKindScope,list);
  const previous=uploadResumeLoad();
  const chunks=makeDirectRowChunks(list);
  const canResume=previous && previous.encoding==='directRowsV661' && previous.fingerprint===fingerprint && previous.token && !!previous.deferPriceCrossValidation===!!options.deferPriceCrossValidation;
  if(previous && previous.token && !canResume){
    try{await callApi(payload('abortUpload',{token:previous.token}));}catch(e){console.warn('old direct upload session cleanup failed',e);}
    uploadResumeClear();
  }
  const token=canResume?previous.token:uploadToken(mode==='replace'?'drp':'dup',key);
  const checksum=String(options.checksum||'').trim();
  uploadProgressStart(`${labelKey(key)}の無圧縮・直接分割書込${canResume?'（続きから）':''}`,list.length);
  let nextChunk=0;
  if(canResume){
    try{
      const status=await callApi(payload('directChunkUploadStatus',{token}));
      if(status&&status.ok&&status.found) nextChunk=Math.min(chunks.length,Number(status.nextChunk||0));
      else throw new Error('保存済み送信セッションがサーバー側にありません。');
      uploadProgressLog(`サーバー側の実績位置から再開します：${nextChunk}/${chunks.length}チャンク。`);
    }catch(statusError){
      uploadProgressLog(`保存済みセッションを確認できないため、この表を最初から開始します：${statusError.message||statusError}`);
      uploadResumeClear();
      return uploadRowsByDirectChunks(key,list,mode,dataKindScope,{...options,forceNewSession:true});
    }
  }else{
    uploadProgressUpdate({phase:`${labelKey(key)}の送信開始処理中`,percent:0,currentRows:0,totalRows:list.length,chunks:`0/${chunks.length}`,parts:0,detail:'接続確認と置換対象の初期化を行っています。ここで長時間止まる場合はPOST応答またはGAS開始処理の異常です。'});
    await yieldUploadUi();
    const started=performance.now();
    const begin=await callApi(payload('beginDirectChunkUpload',{sheetKey:key,mode,token,dataKindScope,rowCount:list.length,totalChunks:chunks.length,checksum,deferPriceCrossValidation:!!options.deferPriceCrossValidation}));
    const elapsed=performance.now()-started;
    if(!begin||!begin.ok)throw new Error((begin&&begin.error)||`${labelKey(key)}の直接分割書込準備に失敗しました`);
    nextChunk=Math.min(chunks.length,Number(begin.nextChunk||0));
    uploadProgressLog(`開始処理：${formatUploadTime(elapsed)}${begin.elapsedMs!==undefined?` / GAS ${formatUploadTime(begin.elapsedMs)}`:''}。${mode==='replace'?`対象${begin.resetRemoved||0}行を初期化。`:''}`);
  }
  let sentRows=chunks.slice(0,nextChunk).reduce((n,c)=>n+c.length,0);
  let rawBytes=chunks.slice(0,nextChunk).reduce((n,c)=>n+utf8ByteLength(JSON.stringify(c)),0);
  uploadResumeSave({encoding:'directRowsV661',fingerprint,token,key,mode,dataKindScope,deferPriceCrossValidation:!!options.deferPriceCrossValidation,nextChunk,sentRows,totalChunks:chunks.length,updatedAt:new Date().toISOString()});
  try{
    for(let c=nextChunk;c<chunks.length;c++){
      const chunk=chunks[c];
      const bytes=utf8ByteLength(JSON.stringify(chunk));
      uploadProgressUpdate({phase:`${labelKey(key)}をDBへ直接書込中`,percent:chunks.length?Math.min(96,(sentRows/list.length)*96):96,currentRows:sentRows,totalRows:list.length,chunks:`${c+1}/${chunks.length}`,parts:c,rawChars:rawBytes,sentChars:rawBytes,detail:`次の${chunk.length}行だけをPOST送信します。開始・状態確認・完了命令はPOSTを使いません。`});
      const started=performance.now();
      const res=await directPostForm('putDirectRowsChunk',{token,chunkIndex:c,rows:chunk},DIRECT_CHUNK_POST_TIMEOUT_MS,directChunkStatusProbe(token,c+1));
      const elapsed=performance.now()-started;
      if(!res||!res.ok)throw new Error((res&&res.error)||`${labelKey(key)}の直接分割書込に失敗しました`);
      const confirmedNext=Math.max(c+1,Number(res.nextChunk||c+1));
      if(res.alreadyApplied){
        sentRows=chunks.slice(0,confirmedNext).reduce((n,x)=>n+x.length,0);
      }else sentRows+=chunk.length;
      rawBytes+=bytes;
      uploadProgressLog(`チャンク${c+1}/${chunks.length}：${chunk.length}行 / ${formatUploadBytes(bytes)} / 通信+GAS ${formatUploadTime(elapsed)}${res.elapsedMs!==undefined?` / GAS ${formatUploadTime(res.elapsedMs)}`:''}${res.alreadyApplied?'（既に反映済み）':''}`);
      uploadResumeSave({encoding:'directRowsV661',fingerprint,token,key,mode,dataKindScope,deferPriceCrossValidation:!!options.deferPriceCrossValidation,nextChunk:confirmedNext,sentRows,totalChunks:chunks.length,updatedAt:new Date().toISOString()});
      uploadProgressUpdate({phase:`${labelKey(key)}をDBへ直接書込中`,percent:list.length?Math.min(96,(sentRows/list.length)*96):96,currentRows:sentRows,totalRows:list.length,chunks:`${confirmedNext}/${chunks.length}`,parts:confirmedNext,rawChars:rawBytes,sentChars:rawBytes,detail:`${sentRows}/${list.length}行までDB反映済みです。%は実件数ベースです。`});
      if(chunks.length>1)await sleep(10);
    }
    uploadProgressUpdate({phase:'DB送信結果を確定中',percent:98,currentRows:list.length,totalRows:list.length,chunks:`${chunks.length}/${chunks.length}`,parts:chunks.length,detail:'チャンクごとの全件走査は行いません。必要な全件整合性確認だけを最後に1回実行します。'});
    const finishStarted=performance.now();
    const finish=await callApi(payload('finishDirectChunkUpload',{token,checksum}));
    const finishElapsed=performance.now()-finishStarted;
    if(!finish||!finish.ok)throw new Error((finish&&finish.error)||`${labelKey(key)}の直接分割書込完了確認に失敗しました`);
    uploadProgressLog(`完了確認：${formatUploadTime(finishElapsed)}${finish.elapsedMs!==undefined?` / GAS ${formatUploadTime(finish.elapsedMs)}`:''}。全件再書込なし / ${finish.finalValidation||'行単位検証'}。`);
    if(finish.timing)uploadProgressLog(`GASチャンク実測：平均 ${formatUploadTime(finish.timing.averageMs||0)} / 最大 ${formatUploadTime(finish.timing.maxMs||0)} / 合計 ${formatUploadTime(finish.timing.totalMs||0)}`);
    uploadResumeClear();
    const result={...finish,uploadEncoding:'direct-raw-row-chunks',sentRows:list.length,sentChunks:chunks.length,sentParts:chunks.length,rawChars:rawBytes};
    uploadProgressDone(result);return result;
  }catch(e){
    uploadProgressFail(e);
    uploadProgressLog('直接書込済み位置はサーバー側にも記録されています。再実行すると未反映チャンクから再開します。');
    throw e;
  }
}

async function uploadRowsByChunksFallback(key, rows, mode, dataKindScope='', options={}){
  const list=rows||[];
  // direct POSTを使えない古い環境だけ、v598以前の仮シート分割経路を互換用として残す。
  if(canUseGzipUpload()){
    try{return await uploadRowsByGzipChunks(key,list,mode,dataKindScope,options);}
    catch(gzipError){const saved=uploadResumeLoad();if(saved)throw gzipError;}
  }
  return await uploadRowsByTextChunks(key,list,mode,dataKindScope,options);
}
async function uploadRowsByChunks(key, rows, mode, dataKindScope='', options={}){
  await assertServerVersion();
  const list=(rows||[]).map(cleanUploadRow);

  // v90.8.678: 一括登録/置換ではchecksumが付くため、644までは2KB程度のitem_typesまで
  // direct POST経路へ入り、POST/iframe応答が不調な環境では最初の表で止まっていた。
  // 小規模表はmode/checksumに関係なくJSONP分割へ固定する。
  if(shouldUseSmallJsonpUpload(list)){
    if(canUseGzipUpload()) return uploadRowsByGzipChunks(key,list,mode,dataKindScope,options);
    return uploadRowsByTextChunks(key,list,mode,dataKindScope,options);
  }

  if(canUseDirectPostUpload()){
    try{
      // 大量データは従来どおり無圧縮の直接分割POSTを優先する。
      return await uploadRowsByDirectChunks(key,list,mode,dataKindScope,options);
    }catch(postError){
      const message=String(postError&&postError.message||postError||'');
      // POST経路そのものが応答不能なら、処理全体を止めずJSONP分割へ退避する。
      // upsertは同一キー更新、replaceは再初期化されるため、途中反映後でも再送可能。
      if(/Failed to fetch|NetworkError|Load failed|接続できません/i.test(message)){
        uploadProgressLog(`POST経路で失敗したためJSONP分割送信へ切り替えます：${message}`);
        const saved=uploadResumeLoad();
        if(saved&&saved.token){
          try{await callApi(payload('abortUpload',{token:saved.token}));}catch(abortError){console.warn('direct upload fallback cleanup failed',abortError);}
          uploadResumeClear();
        }
        return uploadRowsByChunksFallback(key,list,mode,dataKindScope,options);
      }
      throw postError;
    }
  }
  return uploadRowsByChunksFallback(key,list,mode,dataKindScope,options);
}
function callApi(data){
  return new Promise((resolve,reject)=>{
    if(isGasMode()){
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(err=>reject(new Error(err && err.message ? err.message : String(err || 'GAS呼び出しに失敗しました'))))
        .api(data);
      return;
    }
    const url=apiBaseUrl();
    if(!url){ reject(new Error('ローカルHTMLから送信する場合はWeb App URLを入力してください。')); return; }
    jsonpApi(data).then(resolve).catch(reject);
  });
}
const NO_POST_CONTROL_WRITE_ACTIONS = new Set([
  'cleanupUploadTemps','setup','dedupe','dedupeAll','repairSheet','repairAll',
  'beginUpload','commitUpload','abortUpload',
  'beginDirectChunkUpload','directChunkUploadStatus','finishDirectChunkUpload',
  'beginRepairSheetChunked','repairSheetChunkStatus','repairSheetRowsChunk','finishRepairSheetChunked','validateItemRecipePrices'
]);
async function writeApi(data){
  await assertServerVersion();
  const action=String(data&&data.action||'').trim();
  if(NO_POST_CONTROL_WRITE_ACTIONS.has(action)) return callApi(data);
  if(!isGasMode() && canUseDirectPostUpload()){
    const token=uploadToken('cmd',action||'write');
    const timeoutMs=DIRECT_POST_TIMEOUT_MS;
    const res=await directPostForm(action,{...(data||{}),token},timeoutMs);
    if(!res||res.ok===false)throw new Error((res&&res.error)||'DB更新に失敗しました');
    return res;
  }
  return callApi(data);
}

async function upsertSheetRowsByJsonp(key, rows, dataKindScope='', options={}){
  return uploadRowsByChunks(key, rows || [], 'upsert', dataKindScope, options);
}
async function replaceSheetRowsByJsonp(key, rows, dataKindScope='', options={}){
  return uploadRowsByChunks(key, rows || [], 'replace', dataKindScope, options);
}
let __serverVersionChecked = false;
function parseVersionParts(value){
  return String(value || '')
    .replace(/^v/i, '')
    .split('.')
    .map(part => {
      const m = String(part).match(/\d+/);
      return m ? Number(m[0]) : 0;
    });
}
function compareVersions(a, b){
  const av = parseVersionParts(a);
  const bv = parseVersionParts(b);
  const len = Math.max(av.length, bv.length, 3);
  for(let i=0; i<len; i++){
    const ai = av[i] || 0;
    const bi = bv[i] || 0;
    if(ai > bi) return 1;
    if(ai < bi) return -1;
  }
  return 0;
}
async function assertServerVersion(){
  if(isGasMode()) return true;
  if(__serverVersionChecked) return true;
  const res = await jsonpApi(payload('ping'));
  const actual = String(res && res.version || '').trim();
  const required = typeof RECRAFT_DB_REQUIRED_SERVER_VERSION !== 'undefined' ? RECRAFT_DB_REQUIRED_SERVER_VERSION : RECRAFT_DB_VERSION;
  if(!actual || compareVersions(actual, required) < 0){
    throw new Error(`Apps Script側のCode.gsが古い可能性があります。必要サーバー版=${required} 実際=${actual || '不明'}
Code.gsを差し替えて保存し、既存デプロイを新バージョンで更新してから、管理ツールを開き直してください。`);
  }
  __serverVersionChecked = true;
  return true;
}
function sleep(ms){ return new Promise(resolve=>setTimeout(resolve, ms)); }
const VERIFY_SAVE_FIELDS = {
  equipment_categories: ['element','power','modifiers','description','effect','intrinsicEffects','skill','itemCategory','equipSlot'],
  items: ['dataKind','itemType','itemCategory','materialType','materialCategory','name','rank','toolRank','guaranteeUpgradeMaxRank','power','modifiers','upgradeLimit','upgradeMaterialMinRank','mpCost','target','checkType','element','description','effect','equipmentEffects','namedProcessingOptions'],
  spells: ['type','name','rank','mpCost','target','checkType','element','power','description','effect'],
  recipes: ['rank','recipePrice','recipeSellPrice','recipeSource','craftSkill','price','craftType','category','baseItem','branchType','resultItem','requiredMaterials','difficulty','description','effect'],
  quest_rewards: ['rank','rewardMin','rewardMax','rewardAvg','scale'],
  quests: ['rank','questCategory','requestKind','questType','areaName','questLocation','recommendedSkills','rewardScope','deliveryItems','progressStep','fixedEvents','clearCondition'],
  treasure_tables: ['treasureRank','scrollRank','entryType','entryName','quantity','weight'],
  monsters: ['rank','monsterType','monsterTraits','physicalAffinity','fireAffinity','waterAffinity','windAffinity','thunderAffinity','lightAffinity','darkAffinity','neutralAffinity','behaviorAI','fixedActionNames','passiveOnlyActionNames','actionSelectionRules','actions','drops','modifiers']
};
function verifyRowKey(row){
  return String(row && row.id || '').trim();
}
function verifyValue(v){
  return String(v ?? '').replace(/\r\n/g,'\n').trim();
}
function verifyDataMatches(expectedData, actualData, keys){
  const issues=[];
  (keys||DATA_KEYS).forEach(key=>{
    const expectedRows = expectedData[key] || [];
    const actualRows = actualData[key] || [];
    const actualById = new Map(actualRows.map(r=>[verifyRowKey(r), r]).filter(([id])=>id));
    expectedRows.forEach(row=>{
      const id = verifyRowKey(row);
      if(!id) return;
      const actual = actualById.get(id);
      if(!actual){ issues.push(`${labelKey(key)}:${id} がDB読込結果にありません`); return; }
      const fields = (VERIFY_SAVE_FIELDS[key] || []).filter(f => (SCHEMA[key]||[]).includes(f));
      fields.forEach(field=>{
        const ev = verifyValue(row[field]);
        const av = verifyValue(actual[field]);
        if(ev !== av) issues.push(`${labelKey(key)}:${id}.${field} 期待=${ev || '(空)'} 実際=${av || '(空)'}`);
      });
    });
  });
  return issues;
}
async function loadSheets(keys){
  const actual = {};
  for (const key of keys) {
    const res = await callApi(payload('list', { sheetKey: key }));
    if(!res.ok) throw new Error(res.error || `${labelKey(key)}のDB読込に失敗しました`);
    actual[key] = res.rows || [];
  }
  return normalizeStateData({ ...Object.fromEntries(DATA_KEYS.map(key=>[key, []])), ...actual });
}
async function verifyRemoteSaved(keys){
  // JSONP書き込み後に、対象シートだけを再読込して実データを照合する。
  const targetKeys = (keys && keys.length) ? keys : DATA_KEYS;
  let issues = [];
  for(let i=0; i<8; i++){
    await sleep(600 + i * 250);
    const actual = await loadSheets(targetKeys);
    issues = verifyDataMatches(state, actual, targetKeys);
    if(!issues.length) return actual;
  }
  throw new Error('DB反映確認に失敗しました。\n' + issues.slice(0,12).join('\n') + (issues.length>12 ? `\nほか${issues.length-12}件` : ''));
}
async function setup(){
  try{
    await assertServerVersion();
    const res=await callApi(payload('setup'));
    if(!res.ok) throw new Error(res.error||'失敗');
    toast('DBシートを作成/確認しました。一時シート整理は専用ボタンからのみ実行します。');
  }catch(e){ toast(e.message,'error'); }
}
async function cleanupUploadTemps(){
  if(!confirm('旧DB送信で残った __recraft_upload_* 一時シートを削除します。\n現行の無圧縮直接分割送信では使用しません。\nよろしいですか？')) return;
  try{
    await assertServerVersion();
    const res=await writeApi(payload('cleanupUploadTemps'));
    if(!res||!res.ok) throw new Error((res&&res.error)||'一時シート整理に失敗しました');
    const names=Array.isArray(res.deletedTempSheets)?res.deletedTempSheets:[];
    toast(names.length?`一時シートを${names.length}枚削除しました`:'削除対象の一時シートはありませんでした');
    alert(names.length?`一時シート整理\n${names.length}枚削除しました。\n${names.join('\n')}`:'一時シート整理\n削除対象はありませんでした。');
  }catch(e){ toast(e.message,'error'); }
}
async function diagnoseSheets(){
  try{
    await assertServerVersion();
    const res = await callApi(payload('diagnoseSheets'));
    if(!res.ok) throw new Error(res.error || 'DB列診断に失敗しました');
    const lines = Object.entries(res.results || {}).map(([key,r])=>{
      if(!r.exists) return `${labelKey(key)}: シートなし`;
      const status = r.ok ? (r.orderOk ? 'OK' : '列順') : '不足あり';
      const missing = (r.missing||[]).length ? ` / 不足:${r.missing.join(',')}` : '';
      const extra = (r.extra||[]).length ? ` / 旧列・余分:${r.extra.join(',')}` : '';
      return `${labelKey(key)}: ${status} / ${r.rows||0}行${missing}${extra}`;
    });
    alert('DB列診断 v90.3\n' + lines.join('\n'));
    toast('DB列診断を表示しました');
  }catch(e){ toast(e.message,'error'); }
}
async function repairHeaders(){
  if(!confirm('DB列を標準ヘッダー順に修復します。\n最初に列だけを診断し、修復が必要なシートだけを行分割して書き直します。\nよろしいですか？')) return;
  try{
    await assertServerVersion();
    const diag=await callApi(payload('diagnoseSheets'));
    if(!diag||!diag.ok)throw new Error((diag&&diag.error)||'DB列診断に失敗しました');
    const targets=Object.entries(diag.results||{}).filter(([key,r])=>!r.exists||!r.ok||!r.orderOk);
    if(!targets.length){
      toast('DB列はすべて正常です。修復は不要です。');
      alert('DB列修復\n修復が必要なシートはありませんでした。');
      return;
    }
    const totalRows=targets.reduce((n,[,r])=>n+Math.max(0,Number(r.rows||0)),0);
    uploadProgressStart('DB列修復',totalRows||targets.length);
    const lines=[];
    let globalDone=0;
    for(let i=0;i<targets.length;i++){
      const [key,diagRow]=targets[i];
      uploadProgressLog(`${labelKey(key)}：分割修復を開始します（${Number(diagRow.rows||0)}行）。`);
      const beginStarted=performance.now();
      const repairToken=uploadToken('repair',key);
      const beginPayload=payload('beginRepairSheetChunked',{sheetKey:key,token:repairToken});
      const begin=await callApi(beginPayload);
      const beginElapsed=performance.now()-beginStarted;
      if(!begin||!begin.ok)throw new Error((begin&&begin.error)||`${labelKey(key)}のDB列修復準備に失敗しました`);
      if(begin.skipped){
        lines.push(`${labelKey(key)}: ${begin.rows||0}行（変更なし）`);
        uploadProgressLog(`${labelKey(key)}：変更不要 / ${formatUploadTime(beginElapsed)}`);
        continue;
      }
      let nextRow=Math.max(2,Number(begin.nextDataRow||2));
      let done=Math.max(0,Number(begin.processedRows||0));
      const sheetTotal=Math.max(0,Number(begin.totalRows||diagRow.rows||0));
      if(done) globalDone+=done;
      while(done<sheetTotal){
        const count=Math.min(REPAIR_CHUNK_ROWS,sheetTotal-done);
        const started=performance.now();
        const rowPayload=payload('repairSheetRowsChunk',{sheetKey:key,startRow:nextRow,rowCount:count});
        const res=await callApi(rowPayload);
        const elapsed=performance.now()-started;
        if(!res||!res.ok)throw new Error((res&&res.error)||`${labelKey(key)}のDB列修復に失敗しました`);
        const beforeDone=done;
        nextRow=Math.max(nextRow+count,Number(res.nextDataRow||nextRow+count));
        done=Math.max(done+count,Number(res.processedRows||done+count));
        globalDone+=Math.max(0,done-beforeDone);
        const pct=totalRows?Math.min(96,(globalDone/totalRows)*96):Math.min(96,((i+done/Math.max(1,sheetTotal))/targets.length)*96);
        uploadProgressUpdate({phase:`${labelKey(key)}の列を分割修復中`,percent:pct,currentRows:globalDone,totalRows:totalRows||targets.length,chunks:`${i+1}/${targets.length}`,parts:Math.ceil(done/REPAIR_CHUNK_ROWS),detail:`${labelKey(key)}：${done}/${sheetTotal}行修復済み。実件数ベースです。`});
        uploadProgressLog(`${labelKey(key)} ${done}/${sheetTotal}行：通信+GAS ${formatUploadTime(elapsed)}${res.elapsedMs!==undefined?` / GAS ${formatUploadTime(res.elapsedMs)}`:''}`);
      }
      const finish=await callApi(payload('finishRepairSheetChunked',{sheetKey:key}));
      if(!finish||!finish.ok)throw new Error((finish&&finish.error)||`${labelKey(key)}のDB列修復完了処理に失敗しました`);
      if(finish.timing)uploadProgressLog(`${labelKey(key)} GAS実測：平均 ${formatUploadTime(finish.timing.averageMs||0)} / 最大 ${formatUploadTime(finish.timing.maxMs||0)}`);
      lines.push(`${labelKey(key)}: ${finish.rows||sheetTotal}行（分割修復）`);
    }
    uploadProgressDone({sentRows:totalRows||targets.length,sentChunks:targets.length,sentParts:targets.length,uploadEncoding:'chunked-column-repair'});
    alert('DB列修復\n' + lines.join('\n'));
    toast('必要なDB列だけ分割修復しました');
  }catch(e){ uploadProgressFail(e); toast(e.message,'error'); }
}
function rowsForTableForSave(tableKey){
  const base = baseKeyForTable(tableKey);
  const rows = state[base] || [];
  const want = dataKindForTable(tableKey);
  if(base !== 'items' || !want) return rows;
  return rows.filter(row=>{
    const kind = String(row.dataKind || 'アイテム').trim() || 'アイテム';
    return want === '素材' ? kind === '素材' : kind !== '素材';
  });
}
function assertMonsterPassiveDesignRows(rows){
  const bad=[];
  const affinityFields={物:'physicalAffinity',火:'fireAffinity',水:'waterAffinity',風:'windAffinity',雷:'thunderAffinity',光:'lightAffinity',闇:'darkAffinity',無:'neutralAffinity'};
  const strong=new Set(['耐','無','反','吸']);
  (rows||[]).forEach(row=>{
    const p=String(row?.passiveEffect||'').trim();
    if(!p)return;
    if(/PCが前衛から後衛へ移動した時|PCが後衛から前衛へ移動した時|前衛・後衛を移動した直後/.test(p)){
      bad.push(`${row.name||row.id||'魔物'}：PCの任意の前後移動だけを起点・解除条件にした固有パッシブは登録できません。`);
    }
    Object.entries(affinityFields).forEach(([label,field])=>{
      if(strong.has(String(row?.[field]||'').trim()) && new RegExp(`(?:自身が|自身へ|自身に)[^。\n]{0,40}${label}属性(?:ダメージ)?を受け`).test(p)){
        bad.push(`${row.name||row.id||'魔物'}：${label}属性へ${row?.[field]}を持つのに、その属性を受けることだけを主要発動条件にした固有パッシブは登録できません。`);
      }
    });
  });
  if(bad.length)throw new Error(`固有パッシブの発動条件に、通常攻略で恒常的に無視できる条件が含まれています。\n${bad.slice(0,12).join('\n')}${bad.length>12?`\nほか${bad.length-12}件`:''}`);
}

function assertMonsterActionRangeRows(rows){
  const bad=[];
  (rows||[]).forEach(row=>{
    const passive=String(row?.passiveEffect||'');
    const randomPassiveStates=[...passive.matchAll(/([ぁ-んァ-ヶ一-龠A-Za-z0-9]+状態)/g)].map(m=>m[1]);
    const randomMarking=/(ランダム|行動可能なPC|各PC|全PC)/.test(passive);
    parseMonsterActions(row?.actions||'').forEach(action=>{
      const type=normalizeMonsterActionType(action), range=normalizeMonsterActionRange(action), target=String(action.target||'').trim();
      const effect=String(action.effect||'').trim();
      const effectRearReach=/(?:前衛[^。\n]{0,50}(?:いる|残って)[^。\n]{0,50}後衛[^。\n]{0,35}(?:対象|狙)|前衛の有無[^。\n]{0,50}後衛[^。\n]{0,35}(?:対象|狙)|後衛にいても[^。\n]{0,35}(?:対象|狙)|すでに後衛)/.test(effect);
      const passivePayoff=randomMarking && randomPassiveStates.some(state=>effect.includes(state));
      if((/敵(?:後衛|1列|全体)/.test(target) || effectRearReach || passivePayoff) && range==='近接'){
        bad.push(`${row.name||row.id||'魔物'} / ${action.name||'行動'}：特性・対象・効果文が後衛到達を前提としているため、距離「近接」では成立しません。距離を「遠距離」、条件付きなら「特殊」にしてください。`);
      }
    });
  });
  if(bad.length)throw new Error(`魔物行動の対象・効果文と距離に矛盾があります。\n${bad.slice(0,12).join('\n')}${bad.length>12?`\nほか${bad.length-12}件`:''}`);
}

function assertMonsterSelfMoveConditionRows(rows){
  const bad=[];
  const movePerf=/(?:この|自身の)?手番[^\n]{0,30}移動[^\n]{0,50}(?:判定|命中|ダメージ|回避値|防御値|抵抗値|最終ダメージ)|移動してから使用した場合|移動していない場合|この手番に移動した場合/;
  (rows||[]).forEach(row=>{
    const actions=String(row?.actions||'').split(/\r?\n/).filter(Boolean);
    actions.forEach(line=>{const c=line.split('\t');const effect=String(c[6]||'');if(movePerf.test(effect))bad.push(`${row.name||row.id||'魔物'} / ${c[0]||'行動'}：${effect}`);});
  });
  if(bad.length)throw new Error(`魔物自身の通常移動を条件に、命中・ダメージ・回避・防御・抵抗などの性能を変化させる行動は登録できません。位置条件、対象条件、または行動そのものの効果として設計してください。\n${bad.slice(0,12).join('\n')}${bad.length>12?`\nほか${bad.length-12}件`:''}`);
}

function cloneRowsForSave(baseKey, rows){
  if(baseKey==='skills') recalculateSkillProbabilities();
  if(['items','recipes','spells','skills','material_ranks','quest_rewards','quests','treasure_tables','monsters'].includes(baseKey)) assertNumericRankRows(baseKey,rows||[]);
  if(baseKey==='skills') assertSkillProgressionRows(rows||[]);
  if(baseKey==='treasure_tables') assertTreasureDifficultyRows(rows||[]);
  if(baseKey==='items'){ assertItemPriceRows(rows||[]); assertItemClassificationRows(rows||[]); assertWeaponKatakanaNames(rows||[]); assertWeaponBaseDamageDieRows(rows||[]); assertUpgradeSlotScopeRows(rows||[]); assertUpgradeMaterialTargetScopeRows(rows||[]); assertEquipmentUpgradeMinimumRows(rows||[]); assertMonsterMaterialUpgradeRows(rows || []); assertSpecialUpgradeNonStackRows(rows || []); assertNoDefenseIgnoreUpgradeRows(rows || []); assertMaterialUpgradeSlotCostRows(rows || []); assertMaterialUpgradeSeparationRows(rows || []); assertProcessedMaterialRows(rows || []); assertMonsterMaterialDescriptionRows(rows || []); assertLateAreaMonsterMaterialRankRows(rows || []); }
  if(baseKey==='recipes'){ assertSkillCrystalProgressionRows(rows||[]); assertWeaponBranchMaterialRows(rows || []); assertOtherworldAccessoryUpgradeMaterialRows(rows || []); assertItemPriceRows(state.items||[], rows||[]); }
  if(baseKey==='monsters'){ assertMonsterEffectClarityRows(rows||[]); assertMonsterPassiveDesignRows(rows || []); assertMonsterActionRangeRows(rows || []); assertMonsterSelfMoveConditionRows(rows || []); assertMonsterFixedActionSelectionRows(rows || []); assertMonsterPassiveOnlyActionRows(rows || []); assertMonsterLoadoutViabilityRows(rows || []); assertMonsterActionCountRows(rows || []); assertMonsterActionTypeSemanticsRows(rows || []); assertNamedBacklineAttackRows(rows || []); assertAreaBossBacklineAttackRows(rows || []); assertMonsterActionBaseValueRows(rows || []); assertMonsterActionCheckSourceRows(rows || []); assertMonsterSupportActionCheckRows(rows || []); assertMonsterDirectDamageDieRows(rows || []); }
  return (rows || []).map(src=>{
    const r = {...(src || {})};
    normalizeEncounterPlacementRow(baseKey,r);
    if(baseKey==='material_ranks') r.name=numericRankValueIncludingLegacyMaterialGrade(r.name,1);
    if(baseKey==='items'){ delete r.price; r.rank=numericRankValueIncludingLegacyMaterialGrade(r.rank,1); if(String(r.toolRank??'').trim()){r.toolRank=numericRankValueIncludingLegacyMaterialGrade(r.toolRank,1);r.rank=r.toolRank;} if(String(r.guaranteeUpgradeMaxRank??'').trim())r.guaranteeUpgradeMaxRank=numericRankValueIncludingLegacyMaterialGrade(r.guaranteeUpgradeMaxRank,1); if(isEquipmentItemRow(r))r.upgradeMaterialMinRank=numericRankValueIncludingLegacyMaterialGrade(r.upgradeMaterialMinRank,r.rank); else { r.upgradeLimit='0'; r.upgradeMaterialMinRank=''; } }
    if(baseKey==='recipes'){ if(!String(r.recipePrice??'').trim()&&String(r.limitedRecipePrice??'').trim())r.recipePrice=r.limitedRecipePrice; r.limitedRecipePrice=''; r.rank=numericRankValueIncludingLegacyMaterialGrade(r.rank,1); }
    if(baseKey==='spells' || baseKey==='skills') r.rank=numericRankValueIncludingLegacyMaterialGrade(r.rank,1);
    if(['quest_rewards','quests','monsters'].includes(baseKey)) r.rank=numericRankValueIncludingLegacyMaterialGrade(r.rank,1);
    if(baseKey==='treasure_tables'){ r.treasureRank=numericRankValueIncludingLegacyMaterialGrade(r.treasureRank,1); r.trapDetectDifficulty=numericRankValue(r.trapDetectDifficulty,''); if(String(r.scrollRank??'').trim())r.scrollRank=numericRankValue(r.scrollRank,1); }
    if((baseKey === 'items' || baseKey === 'spells' || baseKey === 'equipment_categories')){
      r.power = normalizePowerForDb(baseKey, r.power);
    }
    if(r.checkType !== undefined) r.checkType = normalizeCheckTypeValue(r.checkType);
    if(r.actions !== undefined) r.actions = serializeMonsterActions(parseMonsterActions(r.actions));
    if(!String(r.description || '').trim() && String(r['説明'] || '').trim()) r.description = r['説明'];
    if(!String(r.effect || '').trim() && String(r['効果'] || '').trim()) r.effect = r['効果'];
    delete r['説明']; delete r['効果'];
    r.updatedAt = nowIso();
    markRowOwnership(r);
    return r;
  });
}
async function verifyRowsSaved(baseKey, expectedRows){
  let issues = [];
  for(let i=0; i<8; i++){
    await sleep(600 + i * 250);
    const actual = await loadSheets([baseKey]);
    const expected = {...state, [baseKey]: expectedRows || []};
    issues = verifyDataMatches(expected, actual, [baseKey]);
    if(!issues.length) return actual;
  }
  throw new Error('DB反映確認に失敗しました。\n' + issues.slice(0,12).join('\n') + (issues.length>12 ? `\nほか${issues.length-12}件` : ''));
}
async function tryVerifyRowsSaved(baseKey, expectedRows, tableKey){
  try{
    return await verifyRowsSaved(baseKey, expectedRows);
  }catch(e){
    console.warn('DB反映後の確認用再読込に失敗しました:', e);
    toast(`${labelKey(tableKey || baseKey)}をDBへ反映しました。更新後データの取得に失敗しました。Code.gsと管理HTMLをv90で揃えてください。`, 'warn');
    return null;
  }
}


const MANAGEMENT_PRIVATE_FIELDS = [];

async function hydratePrivateFieldsForWrite(baseKey,rows=[]){
  // ownerKey / createdBy は廃止。旧シート列との互換性のため空欄で送る。
  return (rows||[]).map(source=>({...source, ownerKey:'', createdBy:''}));
}

function applySavedRowsToState(tableKey, rows, mode){
  const base = baseKeyForTable(tableKey);
  const nextRows = cloneRowsForSave(base, rows || []);
  if(base === 'items' && mode !== 'replaceAllBase'){
    const want = dataKindForTable(tableKey);
    const prev = state[base] || [];
    const preserved = prev.filter(row=>{
      const kind = String(row.dataKind || 'アイテム').trim() || 'アイテム';
      return want === '素材' ? kind !== '素材' : kind === '素材';
    });
    state = normalizeStateData({ ...state, [base]: preserved.concat(nextRows) });
  }else{
    state = normalizeStateData({ ...state, [base]: nextRows });
  }
}

async function loadSheet(tableKey){
  const base = baseKeyForTable(tableKey);
  try{
    toast(`${labelKey(tableKey)}のDB読込を開始します`, 'warn');
    const res = await callApi(payload('list', { sheetKey: base }));
    if(!res.ok) throw new Error(res.error || `${labelKey(tableKey)}のDB読込に失敗しました`);
    state = normalizeStateData({ ...state, [base]: res.rows || [] });
    clearDirty(tableKey);
    rerenderTableGroup(tableKey);
    updateCounts();
    updateJsonBox();
    toast(`${labelKey(tableKey)}をDBから読み込みました`);
  }catch(e){toast(e.message,'error')}
}
async function saveSheetInternal(tableKey, options={}){
  const base = baseKeyForTable(tableKey);
  const preparedRows = cloneRowsForSave(base, rowsForTableForSave(tableKey));
  const rows = await hydratePrivateFieldsForWrite(base, preparedRows);
  const res = await upsertSheetRowsByJsonp(base, rows, dataKindForTable(tableKey));
  if(!res || !res.ok){
    throw new Error((res && res.error) || `${labelKey(tableKey)}のDB登録に失敗しました`);
  }
  applySavedRowsToState(tableKey, rows, 'upsert');
  clearDirty(tableKey);
  rerenderTableGroup(tableKey);
  updateCounts();
  updateJsonBox();
  if(!options.silent) toast(`${labelKey(tableKey)}をDB登録しました`);
  return res;
}
async function saveSheet(tableKey){
  try{
    toast(`${labelKey(tableKey)}のDB登録を開始します`, 'warn');
    await saveSheetInternal(tableKey);
  }catch(e){toast(e.message,'error')}
}
function rowForSingleDbSave(tableKey, idx){
  const base = baseKeyForTable(tableKey);
  const row = (state[base] || [])[idx];
  if(!row) throw new Error(`${labelKey(tableKey)}の対象行が見つかりません`);
  const cloned = cloneRowsForSave(base, [row])[0];
  if(!cloned) throw new Error(`${labelKey(tableKey)}の対象行をDB送信用に変換できません`);
  return cloned;
}
async function saveSingleRow(tableKey, idx, mode='upsert'){
  const base = baseKeyForTable(tableKey);
  const preparedRow = rowForSingleDbSave(tableKey, idx);
  const label = mode === 'replace' ? '個別DB置換' : '個別DB登録';
  const name = preparedRow.name || preparedRow.eventName || preparedRow.tableId || preparedRow.id || labelKey(tableKey);
  if(mode === 'replace' && !confirm(`「${name}」だけをDB置換します。\n同じ表の他データは保持します。\nよろしいですか？`)) return;
  try{
    toast(`${labelKey(tableKey)}「${name}」の${label}を開始します`, 'warn');
    const row = (await hydratePrivateFieldsForWrite(base, [preparedRow]))[0];
    const res = await upsertSheetRowsByJsonp(base, [row], dataKindForTable(tableKey));
    if(!res || !res.ok) throw new Error((res && res.error) || `${name}の${label}に失敗しました`);
    rerenderTableGroup(tableKey);
    updateCounts();
    updateJsonBox();
    toast(`${labelKey(tableKey)}「${name}」を${label}しました`);
  }catch(e){
    toast(e.message, 'error');
  }
}
function setAllPageButtonsDisabled(disabled){
  ['btnSavePages','btnReplacePages','btnDiagnoseSheets','btnRepairHeaders'].forEach(id=>{ const b=$(id); if(b) b.disabled = disabled; });
  document.querySelectorAll('[data-save],[data-replace],[data-load],[data-reset],[data-row-save],[data-row-replace]').forEach(b=>{ b.disabled = disabled; });
}
function showTablePageForOperation(tableKey){
  if(CATEGORY_KEYS.includes(tableKey)){
    setGroupActive('categories');
    showCategorySubpanel(tableKey);
    return;
  }
  setGroupActive(inferGroupFromPanel(tableKey));
  showPanel(tableKey);
}
function fullDbLabel(key){
  return key === 'items' ? 'アイテム・素材' : labelKey(key);
}
async function writeFullDbKeyInternal(dbKey, mode, options={}){
  const preparedRows = cloneRowsForSave(dbKey, state[dbKey] || []);
  const rows = await hydratePrivateFieldsForWrite(dbKey, preparedRows);
  const cleanRows = rows.map(cleanUploadRow);
  const serializedRows = JSON.stringify(cleanRows);
  const checksum = await sha256HexText(serializedRows);
  const uploadMode = mode === 'replace' ? 'replace' : 'upsert';
  const hashKey = dbHashPublicKey(uploadMode, dbKey, '');
  const remoteHashes = options.remoteHashes || {};
  if(remoteHashes[hashKey] === checksum){
    return {ok:true,skipped:true,sheetKey:dbKey,total:rows.length,checksum,hashKey,message:'変更なし'};
  }
  const uploadOptions={checksum,serializedRows,deferPriceCrossValidation:!!options.deferPriceCrossValidation};
  const res = uploadMode === 'replace'
    ? await replaceSheetRowsByJsonp(dbKey, rows, '', uploadOptions)
    : await upsertSheetRowsByJsonp(dbKey, rows, '', uploadOptions);
  if(!res || !res.ok){
    throw new Error((res && res.error) || `${fullDbLabel(dbKey)}のDB${uploadMode === 'replace' ? '置換' : '登録'}に失敗しました`);
  }
  remoteHashes[hashKey]=checksum;
  state = normalizeStateData({ ...state, [dbKey]: rows });
  rerenderTableGroup(dbKey);
  updateCounts();
  updateJsonBox();
  return {...res,checksum,hashKey};
}
async function runAllPages(mode){
  if(window.__recraftAllPageRunning){toast('全データ処理中です。','warn');return;}
  const rowCount = initialDataRowCount(state);
  if(rowCount === 0){ toast('画面上のデータが空です。初期データJSONまたはDBデータを読み込んでください。', 'error'); return; }
  const isReplace=mode==='replace'; const actionLabel=isReplace?'DB置換':'DB登録'; const total=FULL_DB_KEYS.length;
  try{
    const failures=[];
    for(const dbKey of FULL_DB_KEYS){
      try{ cloneRowsForSave(dbKey,state[dbKey]||[]); }
      catch(e){ failures.push(`${fullDbLabel(dbKey)}：${String(e?.message||e||'規定違反')}`); }
    }
    if(failures.length)throw new Error(`全DBの事前規定チェックで問題が見つかりました。送信はまだ開始していません。\n\n${failures.join('\n\n')}`);
  }catch(e){
    alert(String(e?.message||e));
    toast('DB規定チェックに失敗しました。送信前にデータを修正してください。','error');
    return;
  }
  const savedAll=allDbResumeLoad();
  let index=0;
  if(savedAll && savedAll.mode===mode && Number(savedAll.index||0)<total){
    const resume=confirm(`前回の全データ${actionLabel}が「${fullDbLabel(FULL_DB_KEYS[Number(savedAll.index||0)])}」の途中で停止しています。\n\nOK：続きから再開\nキャンセル：最初からやり直す`);
    if(resume) index=Number(savedAll.index||0); else {allDbResumeClear();uploadResumeClear();}
  }else if(!confirm(`全データ${actionLabel}を開始します。\n変更のないDBは送信を省略します。\n途中で失敗した場合は、続きから再開できます。\nよろしいですか？`)) return;
  toast(`全データ${actionLabel}${index?'を続きから再開':'を開始'}します`,'warn');
  window.__recraftAllPageRunning=true; setAllPageButtonsDisabled(true);
  let remoteHashes={};
  let skipped=0;
  try{
    try{
      remoteHashes=await loadServerDbHashes();
    }catch(hashError){
      console.warn('DB hash load failed; upload all databases',hashError);
      toast('変更判定を取得できなかったため、全DBを送信します。','warn');
    }
    while(index<total){
      const dbKey=FULL_DB_KEYS[index];
      allDbResumeSave({mode,index,dbKey,updatedAt:new Date().toISOString()});
      showTablePageForOperation(dbKey);
      toast(`${index+1}/${total} ${fullDbLabel(dbKey)}を確認中...`,'warn');
      try{
        const pairPriceTable = dbKey==='items' || dbKey==='recipes';
        const res=await writeFullDbKeyInternal(dbKey,isReplace?'replace':'upsert',{remoteHashes,deferPriceCrossValidation:pairPriceTable});
        if(res&&res.skipped){
          skipped++;
          toast(`${index+1}/${total} ${fullDbLabel(dbKey)}は変更なし：送信を省略`);
        }
        if(dbKey==='recipes'){
          toast('Items＋Recipesの価格整合性を最終確認中...','warn');
          const priceCheck=await callApi(payload('validateItemRecipePrices'));
          if(!priceCheck||!priceCheck.ok) throw new Error((priceCheck&&priceCheck.error)||'Items＋Recipesの価格整合性確認に失敗しました');
          uploadProgressLog(`価格整合性：Items ${Number(priceCheck.items||0)}件 / Recipes ${Number(priceCheck.recipes||0)}件 OK`);
        }
        index++; allDbResumeSave({mode,index,dbKey:FULL_DB_KEYS[index]||'',updatedAt:new Date().toISOString()});
      }catch(e){
        const retry=confirm(`${fullDbLabel(dbKey)}の${actionLabel}中に失敗しました。\n${e.message||e}\n\nOK：この表を再試行\nキャンセル：全データ処理を中止（次回はこの表から再開できます）`);
        if(retry) continue;
        const sess=uploadResumeLoad();
        if(sess&&sess.token){try{await callApi(payload('abortUpload',{token:sess.token}));}catch(_){} }
        uploadResumeClear();
        toast(`全データ${actionLabel}を中止しました。次回は${fullDbLabel(dbKey)}から再開できます。`,'warn');
        return;
      }
    }
    allDbResumeClear();uploadResumeClear();
    clearDirty('*');
    toast(`全データ${actionLabel}が完了しました（送信${total-skipped}／省略${skipped}）`);
  }finally{window.__recraftAllPageRunning=false;setAllPageButtonsDisabled(false);}
}
async function saveAll(){
  return runAllPages('save');
}
async function dedupeAll(){
  if(!confirm('DB内の重複行を整理します。\n同じIDの行は後ろにある行を最新として残します。IDが空の場合は、名称・分類などから重複判定します。')) return;
  try{
    const res=await writeApi(payload('dedupeAll'));
    if(!res.ok) throw new Error(res.error||'失敗');
    const removed = Object.values(res.results||{}).reduce((sum,r)=>sum+Number(r.removed||0),0);
    toast(`DB重複整理が完了しました\n削除した重複行:${removed}`);
    await loadAll();
  }catch(e){toast(e.message,'error')}
}
async function replaceSheetInternal(tableKey, options={}){
  const base = baseKeyForTable(tableKey);
  const preparedRows = cloneRowsForSave(base, rowsForTableForSave(tableKey));
  const rows = await hydratePrivateFieldsForWrite(base, preparedRows);
  const dataKindScope = dataKindForTable(tableKey);
  // アイテムと素材は同じDBシートを共有するが、反対側のデータは送らない。
  // GAS側がdataKindScope外の既存行を保持して部分置換する。
  const res = await replaceSheetRowsByJsonp(base, rows, dataKindScope);
  if(!res || !res.ok){
    throw new Error((res && res.error) || `${labelKey(tableKey)}のDB置換に失敗しました`);
  }
  applySavedRowsToState(tableKey, rows, 'replace');
  clearDirty(tableKey);
  rerenderTableGroup(tableKey);
  updateCounts();
  updateJsonBox();
  if(!options.silent) toast(`${labelKey(tableKey)}をDB置換しました`);
  return res;
}

async function replaceSheet(tableKey){
  if(!confirm(`${labelKey(tableKey)}だけを、画面上の内容でDB置換します。
他の表には触りません。よろしいですか？`)) return;
  try{
    toast(`${labelKey(tableKey)}のDB置換を開始します`, 'warn');
    await replaceSheetInternal(tableKey);
  }catch(e){toast(e.message,'error')}
}
async function replaceAll(){
  return runAllPages('replace');
}
async function loadAll(){
  try{
    toast('全データDB読込を開始します', 'warn');
    const nextState = {};
    for (const key of DATA_KEYS) {
      const res = await callApi(payload('list', { sheetKey: key }));
      if(!res.ok) throw new Error(res.error || `${labelKey(key)}のDB読込に失敗しました`);
      nextState[key] = res.rows || [];
    }
    state = normalizeStateData(nextState);
    clearDirty('*');
    renderAll(); toast('DBから分割読み込みしました');
  }catch(e){toast(e.message,'error')}
}
function labelKey(key){ if(key==='items') return currentItemTypeView || '登録データ'; return {item_types:'アイテム種別',item_categories:'アイテムカテゴリ',material_types:'素材種別',material_categories:'素材カテゴリ',material_ranks:'素材ランク',equipment_categories:'装備カテゴリ',materials:'素材',recipes:'レシピ',spells:'術式',skills:'スキル',quest_rewards:'依頼報酬', quests:'クエスト', exploration_areas:'探索エリア', event_tables:'イベント表', treasure_tables:'宝箱表', appraisal_rules:'鑑定ルール', monsters:'魔物'}[key]||key}
function downloadJson(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='recraft_alchemia_master_data.json'; a.click(); URL.revokeObjectURL(a.href);
}

const GITHUB_PUBLIC_DB_VERSION = String(RECRAFT_DB_VERSION||'').trim().replace(/^v/i,'');
const GITHUB_PUBLIC_DB_UPDATED_AT = new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'});
const GITHUB_PUBLIC_DB_MASTER_FILENAME = 'recraft_alchemia_master.json';
const GITHUB_PUBLIC_DB_CHARACTER_FILENAME = 'recraft_alchemia_character_master.json';
const GITHUB_PUBLIC_DB_FACILITY_FILENAME = 'recraft_alchemia_facility_master.json';
const GITHUB_PUBLIC_GM_ALL_UNLOCK_KEY_HASH = '99c441f2f2479e89671c1835c55014048c0ddf8cb58fc3af013ecb65129c39cb';
const GITHUB_PUBLIC_DB_OMIT_FIELDS = new Set([
  'ownerKey','createdBy','adminKey','playerKey','masterKey',
  'managementKey','githubToken','accessToken','apiToken',
  'password','secret','unlockKey'
]);

function setGithubPublicDbStatus(message='', stateName=''){
  const el=$('githubPublicDbStatus');
  if(!el)return;
  el.className='github-public-db-status'+(stateName?` is-${stateName}`:'');
  el.textContent=message;
}

function sanitizeGithubPublicValue(value){
  if(Array.isArray(value)) return value.map(sanitizeGithubPublicValue);
  if(value && typeof value==='object'){
    const out={};
    Object.entries(value).forEach(([key,rowValue])=>{
      if(GITHUB_PUBLIC_DB_OMIT_FIELDS.has(key))return;
      out[key]=sanitizeGithubPublicValue(rowValue);
    });
    return out;
  }
  return value;
}

function githubPublicSkillRows(){
  const rows=Array.isArray(state.skills)?state.skills:[];
  return sanitizeGithubPublicValue(rows);
}
function normalizeGithubPublicUnlockKey(value=''){
  return String(value||'').normalize('NFKC').toUpperCase().replace(/[‐‑‒–—―−－]/g,'-').replace(/[\s\u200B-\u200D\uFEFF]/g,'');
}
async function buildGithubPublicMaster(){
  const source=normalizeStateData(raDeepClone(state||{}));
  const data={};
  for(const key of DATA_KEYS){
    const rows=Array.isArray(source[key])?source[key]:[];
    if(key==='exploration_areas'){
      data[key]=[];
      for(const row of rows){
        const clean=sanitizeGithubPublicValue(row);
        delete clean.unlockKey;
        const normalized=normalizeGithubPublicUnlockKey(row.unlockKey||'');
        if(normalized)clean.unlockKeyHash=await githubPublicSha256Hex(normalized);
        data[key].push(clean);
      }
    }else data[key]=sanitizeGithubPublicValue(rows);
  }
  data.skills=githubPublicSkillRows();
  return {
    format:'recraft-alchemia-github-master',
    version:GITHUB_PUBLIC_DB_VERSION,
    updatedAt:GITHUB_PUBLIC_DB_UPDATED_AT,
    encoding:'UTF-8',
    sourceRepository:'akari-2659/Recraft-Alchemia-App',
    description:'Recraft-Alchemiaのキャラシ・施設・管理画面で共通参照する静的マスターデータ。エリア解放キーは平文を含めず、照合用SHA-256のみ収録する。',
    gmAllUnlockKeyHash:GITHUB_PUBLIC_GM_ALL_UNLOCK_KEY_HASH,
    recordCount:Object.values(data).reduce((sum,rows)=>sum+(Array.isArray(rows)?rows.length:0),0),
    data
  };
}
function buildGithubPublicSpecializedMaster(master,kind='character'){
  const source=master?.data&&typeof master.data==='object'?master.data:{};
  const keys=kind==='facility'
    ? ['items','recipes','exploration_areas','monsters','event_tables','equipment_categories','material_ranks']
    : ['item_types','item_categories','material_types','material_categories','material_ranks','equipment_categories','recipes','spells','skills','items'];
  const data={};
  for(const key of keys){
    let rows=Array.isArray(source[key])?source[key]:[];
    if(kind==='character'&&key==='skills')rows=rows.filter(row=>String(row?.enabled??'').trim().toUpperCase()!=='FALSE');
    data[key]=raDeepClone(rows);
  }
  return {
    format:kind==='facility'?'recraft-alchemia-facility-master':'recraft-alchemia-character-master',
    version:String(master?.version||GITHUB_PUBLIC_DB_VERSION),
    encoding:'UTF-8',
    description:String(master?.description||''),
    updatedAt:String(master?.updatedAt||GITHUB_PUBLIC_DB_UPDATED_AT),
    generatedAt:new Date().toISOString(),
    data
  };
}
function githubPublicRecordCount(doc={}){
  const data=doc?.data&&typeof doc.data==='object'?doc.data:{};
  return Object.values(data).reduce((sum,rows)=>sum+(Array.isArray(rows)?rows.length:0),0);
}
async function githubPublicFileInfo(filename,text,doc){
  const bytes=new TextEncoder().encode(text).length;
  return {file:filename,sha256:await githubPublicSha256Hex(text),bytes,recordCount:githubPublicRecordCount(doc),dataKeys:Object.keys(doc?.data||{})};
}
async function githubPublicSha256Hex(textValue=''){
  if(!globalThis.crypto?.subtle)return '';
  const bytes=new TextEncoder().encode(String(textValue));
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
}

function githubZipCrc32(bytes){
  if(!githubZipCrc32.table){
    githubZipCrc32.table=Array.from({length:256},(_,n)=>{
      let c=n;
      for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);
      return c>>>0;
    });
  }
  let crc=0xFFFFFFFF;
  for(const b of bytes)crc=githubZipCrc32.table[(crc^b)&0xFF]^(crc>>>8);
  return (crc^0xFFFFFFFF)>>>0;
}

function githubZipU16(value){
  return new Uint8Array([value&255,(value>>>8)&255]);
}
function githubZipU32(value){
  return new Uint8Array([value&255,(value>>>8)&255,(value>>>16)&255,(value>>>24)&255]);
}
function githubZipConcat(parts){
  const size=parts.reduce((sum,p)=>sum+p.length,0);
  const out=new Uint8Array(size);
  let offset=0;
  parts.forEach(p=>{out.set(p,offset);offset+=p.length;});
  return out;
}
function githubZipDosDateTime(date=new Date()){
  const year=Math.max(1980,date.getFullYear());
  return {
    time:((date.getHours()&31)<<11)|((date.getMinutes()&63)<<5)|((Math.floor(date.getSeconds()/2))&31),
    date:(((year-1980)&127)<<9)|(((date.getMonth()+1)&15)<<5)|(date.getDate()&31)
  };
}
function createGithubStoredZip(files=[]){
  const encoder=new TextEncoder();
  const localParts=[];
  const centralParts=[];
  let offset=0;
  const stamp=githubZipDosDateTime(new Date());

  files.forEach(file=>{
    const nameBytes=encoder.encode(file.name);
    const dataBytes=typeof file.content==='string'?encoder.encode(file.content):file.content;
    const crc=githubZipCrc32(dataBytes);

    const local=githubZipConcat([
      githubZipU32(0x04034b50),
      githubZipU16(20),githubZipU16(0x0800),githubZipU16(0),
      githubZipU16(stamp.time),githubZipU16(stamp.date),
      githubZipU32(crc),githubZipU32(dataBytes.length),githubZipU32(dataBytes.length),
      githubZipU16(nameBytes.length),githubZipU16(0),
      nameBytes,dataBytes
    ]);
    localParts.push(local);

    const central=githubZipConcat([
      githubZipU32(0x02014b50),
      githubZipU16(20),githubZipU16(20),githubZipU16(0x0800),githubZipU16(0),
      githubZipU16(stamp.time),githubZipU16(stamp.date),
      githubZipU32(crc),githubZipU32(dataBytes.length),githubZipU32(dataBytes.length),
      githubZipU16(nameBytes.length),githubZipU16(0),githubZipU16(0),
      githubZipU16(0),githubZipU16(0),githubZipU32(0),githubZipU32(offset),
      nameBytes
    ]);
    centralParts.push(central);
    offset+=local.length;
  });

  const localData=githubZipConcat(localParts);
  const centralData=githubZipConcat(centralParts);
  const end=githubZipConcat([
    githubZipU32(0x06054b50),githubZipU16(0),githubZipU16(0),
    githubZipU16(files.length),githubZipU16(files.length),
    githubZipU32(centralData.length),githubZipU32(localData.length),
    githubZipU16(0)
  ]);
  return new Blob([localData,centralData,end],{type:'application/zip'});
}

function downloadGithubBlob(blob,filename){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}

async function exportGithubPublicDb(){
  const button=$('btnExportGithubPublicDb');
  if(button)button.disabled=true;
  setGithubPublicDbStatus('公開JSONを生成しています…','saving');
  try{
    const master=await buildGithubPublicMaster();
    if(!master.recordCount)throw new Error('管理画面にデータが読み込まれていません。');
    const characterMaster=buildGithubPublicSpecializedMaster(master,'character');
    const facilityMaster=buildGithubPublicSpecializedMaster(master,'facility');
    const masterText=JSON.stringify(master,null,2)+'\n';
    const characterText=JSON.stringify(characterMaster,null,2)+'\n';
    const facilityText=JSON.stringify(facilityMaster,null,2)+'\n';
    const masterInfo=await githubPublicFileInfo(GITHUB_PUBLIC_DB_MASTER_FILENAME,masterText,master);
    const characterInfo=await githubPublicFileInfo(GITHUB_PUBLIC_DB_CHARACTER_FILENAME,characterText,characterMaster);
    const facilityInfo=await githubPublicFileInfo(GITHUB_PUBLIC_DB_FACILITY_FILENAME,facilityText,facilityMaster);
    const manifest={
      format:'recraft-alchemia-public-manifest',
      version:GITHUB_PUBLIC_DB_VERSION,
      updatedAt:new Date().toISOString(),
      files:{master:masterInfo,character:characterInfo,facility:facilityInfo},
      sha256:masterInfo.sha256,
      bytes:masterInfo.bytes,
      recordCount:masterInfo.recordCount
    };
    const manifestText=JSON.stringify(manifest,null,2)+'\n';
    const instructions=[
      'Recraft-Alchemia GitHub共通DB 配置手順',
      '',
      '1. このZIPを展開します。',
      '2. Recraft-Alchemia-Appリポジトリを開きます。',
      '3. ZIP内の data/public/ にある4ファイルを、リポジトリの data/public/ へアップロードします。',
      '4. 既存のmanifest.jsonは上書きします。',
      '5. GitHub Pages反映後、次のURLを開いてversionを確認します。',
      '   https://akari-2659.github.io/Recraft-Alchemia-App/data/public/manifest.json',
      '',
      `公開DBバージョン: ${GITHUB_PUBLIC_DB_VERSION}`,
      `収録件数: ${master.recordCount}件`,
      '',
      '注意:',
      '- このZIPは、ボタンを押した時点で管理画面に読み込まれていたデータから生成されます。',
      '- DBを変更した後は、スプレへ保存したうえで再度書き出してください。',
      '- キャラクターデータ、プレイヤーキー、管理キー、平文のエリア解放キーは収録しません。',
      '- エリア解放キーとGM全エリア解放キーはSHA-256ハッシュだけを収録し、施設HTML内で照合します。'
    ].join('\n')+'\n';

    const zip=createGithubStoredZip([
      {name:'data/public/manifest.json',content:manifestText},
      {name:`data/public/${GITHUB_PUBLIC_DB_MASTER_FILENAME}`,content:masterText},
      {name:`data/public/${GITHUB_PUBLIC_DB_CHARACTER_FILENAME}`,content:characterText},
      {name:`data/public/${GITHUB_PUBLIC_DB_FACILITY_FILENAME}`,content:facilityText},
      {name:'UPLOAD_INSTRUCTIONS.txt',content:instructions}
    ]);
    downloadGithubBlob(zip,`recraft_alchemia_github_public_db_v${GITHUB_PUBLIC_DB_VERSION}.zip`);
    setGithubPublicDbStatus(
      `書き出しました：v${GITHUB_PUBLIC_DB_VERSION} / ${master.recordCount}件\n管理GitHubの data/public/ へアップロードしてください。`,
      'ok'
    );
    toast('GitHub共通DB一式を書き出しました');
  }catch(e){
    setGithubPublicDbStatus(`書き出しに失敗しました：${e.message||e}`,'error');
    toast(e.message||String(e),'error');
  }finally{
    if(button)button.disabled=false;
  }
}

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


