from pathlib import Path
import json, hashlib, shutil

ROOT = Path(".")
VERSION = "90.8.836"
STAMP = "2026-10-07T16:00:00+09:00"

FILES = {
    "initial": ROOT / "data/recraft_alchemia_initial_data.json",
    "master": ROOT / "data/public/recraft_alchemia_master.json",
    "character": ROOT / "data/public/recraft_alchemia_character_master.json",
    "facility": ROOT / "data/public/recraft_alchemia_facility_master.json",
}

CHANGES = {
    "mat_glass_claw": {
        "equipmentUpgradeEffect": "威力固定強化",
    },
    "mat_ash_bison_horn": {
        "equipmentUpgradeEffect": "威力固定強化",
    },
    "mat_named_02": {
        "equipmentUpgradeDetail": "戦闘中1回、前衛・後衛間を移動した場合、次に自身を対象とする攻撃1回に対して回避値+1。攻撃の解決後に解除する。同名効果は重複しない。",
    },
    "mat_named_19": {
        "equipmentUpgradeDetail": "火・水・風・雷・光・闇属性ダメージを受けた場合、次に同じ属性のダメージを受ける1回に限り、その最終ダメージを1点軽減する。ダメージ解決後に解除する。同名効果は重複しない。",
    },
    "mat_named_21": {
        "equipmentUpgradeDetail": "この装備で水属性ダメージを1点以上与えた場合、次に自身を対象とする攻撃1回に対して回避値+1。攻撃の解決後に解除する。同名効果は重複しない。",
    },
}

DESC = "v90.8.836：装備強化効果名と重複表記を現行バリデータへ統一。威力固定系2件を標準名へ揃え、二つ名素材3件の非重複条件を明文化。効果値・対象・発動条件は変更なし。 "

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def dump(path, obj):
    text = json.dumps(obj, ensure_ascii=False, indent=2) + "\n"
    path.write_text(text, encoding="utf-8")
    return text.encode("utf-8")

def patch_items(obj):
    data = obj.get("data", obj)
    items = data.get("items", [])
    changed = []
    for row in items:
        rid = str(row.get("id", "")).strip()
        if rid in CHANGES:
            for k, v in CHANGES[rid].items():
                if row.get(k) != v:
                    row[k] = v
                    changed.append((rid, k))
    return changed

written = {}
for key, path in FILES.items():
    obj = load(path)
    patch_items(obj)
    obj["version"] = VERSION
    if "description" in obj:
        old = str(obj.get("description", ""))
        if not old.startswith(DESC):
            obj["description"] = DESC + old
    if "updatedAt" in obj:
        obj["updatedAt"] = STAMP
    if "generatedAt" in obj:
        obj["generatedAt"] = STAMP
    written[key] = dump(path, obj)

manifest_path = ROOT / "data/public/manifest.json"
manifest = load(manifest_path)
manifest["version"] = VERSION
manifest["updatedAt"] = STAMP

for key in ("master", "character", "facility"):
    info = manifest["files"][key]
    payload = written[key]
    obj = load(FILES[key])
    data = obj.get("data", obj)
    keys = info.get("dataKeys", [])
    info["sha256"] = hashlib.sha256(payload).hexdigest()
    info["bytes"] = len(payload)
    info["recordCount"] = sum(len(data.get(k, [])) for k in keys if isinstance(data.get(k, []), list))

master_info = manifest["files"]["master"]
manifest["sha256"] = master_info["sha256"]
manifest["bytes"] = master_info["bytes"]
manifest["recordCount"] = master_info["recordCount"]
dump(manifest_path, manifest)

copies = [
    ("data/recraft_alchemia_initial_data.json", "gm/modules/manager/data/recraft_alchemia_initial_data.json"),
    ("data/public/manifest.json", "gm/modules/manager/data/public/manifest.json"),
    ("data/public/recraft_alchemia_master.json", "gm/modules/manager/data/public/recraft_alchemia_master.json"),
    ("data/public/recraft_alchemia_character_master.json", "gm/modules/manager/data/public/recraft_alchemia_character_master.json"),
    ("data/public/recraft_alchemia_facility_master.json", "gm/modules/manager/data/public/recraft_alchemia_facility_master.json"),
]
for src, dst in copies:
    shutil.copyfile(ROOT/src, ROOT/dst)

admin = ROOT / "gm/modules/manager/database_admin_main.js"
text = admin.read_text(encoding="utf-8")
text = text.replace("const RECRAFT_DB_VERSION = 'v90.8.835';", "const RECRAFT_DB_VERSION = 'v90.8.836';")
text = text.replace("const RECRAFT_DB_REQUIRED_SERVER_VERSION = 'v90.8.835';", "const RECRAFT_DB_REQUIRED_SERVER_VERSION = 'v90.8.836';")
admin.write_text(text, encoding="utf-8")
