#!/usr/bin/env python3
import ast
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAMP = "2026-10-07T13:49:00+09:00"
VERSION = "90.8.835"

master_path = ROOT / "data/recraft_alchemia_initial_data.json"
public_master_path = ROOT / "data/public/recraft_alchemia_master.json"
facility_path = ROOT / "data/public/recraft_alchemia_facility_master.json"
character_path = ROOT / "data/public/recraft_alchemia_character_master.json"
manifest_path = ROOT / "data/public/manifest.json"
progress_js_path = ROOT / "gm/modules/manager/progress_manager_main.js"
db_admin_path = ROOT / "gm/modules/manager/database_admin_main.js"

def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))

def dump_json(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

progress_js = progress_js_path.read_text(encoding="utf-8")
patch_match = re.search(
    r"const PROGRESS_IMMEDIATE_EVENT_RESULT_PATCHES=\{(.*?)\n\};",
    progress_js,
    re.S,
)
if not patch_match:
    raise SystemExit("PROGRESS_IMMEDIATE_EVENT_RESULT_PATCHES not found")

event_patches = {}
for line in patch_match.group(1).splitlines():
    line = line.strip().rstrip(",")
    if not line:
        continue
    m = re.fullmatch(r"([A-Za-z0-9_]+):'(.*)'", line)
    if not m:
        raise SystemExit(f"Unexpected patch row: {line}")
    event_patches[m.group(1)] = ast.literal_eval("'" + m.group(2) + "'")
if len(event_patches) != 25:
    raise SystemExit(f"Expected 25 event patches, got {len(event_patches)}")

master = load_json(master_path)
facility = load_json(facility_path)
character = load_json(character_path)

def apply_event_patches(rows):
    count = 0
    for row in rows:
        rid = str(row.get("id", ""))
        if rid in event_patches:
            row["result"] = event_patches[rid]
            row["updatedAt"] = STAMP
            count += 1
    return count

if apply_event_patches(master["data"]["event_tables"]) != 25:
    raise SystemExit("Master event patch count mismatch")
if apply_event_patches(facility["data"]["event_tables"]) != 25:
    raise SystemExit("Facility event patch count mismatch")

threshold_map = {20: 25, 60: 50, 80: 75, 100: 100}
step_changed = 0
for quest in master["data"]["quests"]:
    if int(quest.get("progressStep") or 0) != 20:
        continue
    quest["progressStep"] = 25
    lines = []
    for line in str(quest.get("fixedEvents") or "").splitlines():
        m = re.match(r"^(\s*)(\d+)(%.*)$", line)
        if not m:
            lines.append(line)
            continue
        pct = int(m.group(2))
        if pct not in threshold_map:
            raise SystemExit(f"Unmapped 20-step threshold: {quest.get('id')} {pct}")
        lines.append(f"{m.group(1)}{threshold_map[pct]}{m.group(3)}")
    quest["fixedEvents"] = "\n".join(lines)
    quest["updatedAt"] = STAMP
    step_changed += 1
if step_changed != 31:
    raise SystemExit(f"Expected 31 step changes, got {step_changed}")

return_route = next((q for q in master["data"]["quests"] if q.get("id") == "quest_daily_return_route"), None)
if not return_route:
    raise SystemExit("quest_daily_return_route not found")
return_route["fixedEvents"] = "100%\t帰路の歪み\t判定：知識>=11または細工>=11。成功：歪みの状態を確認して安全に帰還し、クエストクリア。失敗：帰還時に消耗し、味方全員の疲労度+1。"
return_route["updatedAt"] = STAMP

for obj in (master, facility, character):
    obj["version"] = VERSION
    obj["updatedAt"] = STAMP
    obj["generatedAt"] = STAMP

master["description"] = (
    "v90.8.835：探索イベントの即時効果25件を正本DBへ統合。重要・デイリーの非納品クエスト進行上昇値を25%以上へ統一し、"
    "旧20%クエストは25%へ変更。固定イベント地点は20→25、60→50、80→75へ移設。 "
    + str(master.get("description") or "")
)
facility["description"] = (
    "v90.8.835：探索イベント即時効果25件を正本へ統合し、RA共通データ版を同期。 "
    + str(facility.get("description") or "")
)
character["description"] = (
    "v90.8.835：RA共通データ版を更新。探索イベント正本化とクエスト進行値整理に版番号を同期。キャラクター表示用データ内容は維持。 "
    + str(character.get("description") or "")
)

dump_json(master_path, master)
dump_json(public_master_path, master)
dump_json(facility_path, facility)
dump_json(character_path, character)

progress_js = re.sub(
    r"const PROGRESS_IMMEDIATE_EVENT_RESULT_PATCHES=\{.*?\n\};\n"
    r"function progressImmediatePatchedEvents\(rows=\[\]\)\{.*?\n\}\n"
    r"function progressImmediatePatchedQuests\(rows=\[\]\)\{.*?\n\}\n",
    "",
    progress_js,
    flags=re.S,
)
progress_js = progress_js.replace(
    "const quests=progressImmediatePatchedQuests(data.quests||[]);",
    "const quests=data.quests||[];",
)
progress_js = progress_js.replace(
    "const events=progressImmediatePatchedEvents(data.event_tables||[]);",
    "const events=data.event_tables||[];",
)
if "PROGRESS_IMMEDIATE_EVENT_RESULT_PATCHES" in progress_js or "progressImmediatePatched" in progress_js:
    raise SystemExit("Runtime progress patch references remain")
progress_js_path.write_text(progress_js, encoding="utf-8")

db_admin = db_admin_path.read_text(encoding="utf-8")
old_hint = "進行ボタン1回で加算する数値。標準4段階は25、長めの調査・巡回・運搬保護・継続行動は20、短い採取等は50、拠点内単発は100を目安に内容で選択"
new_hint = "進行ボタン1回で加算する数値。重要クエスト・デイリークエストは25未満にしない。標準は25、短い採取等は50、拠点内単発は100を目安に内容で選択"
if old_hint not in db_admin:
    raise SystemExit("progressStep help text not found")
db_admin_path.write_text(db_admin.replace(old_hint, new_hint), encoding="utf-8")

def info(path):
    data = path.read_bytes()
    obj = json.loads(data.decode("utf-8"))
    return {
        "file": path.name,
        "sha256": hashlib.sha256(data).hexdigest(),
        "bytes": len(data),
        "recordCount": sum(len(v) for v in obj.get("data", {}).values() if isinstance(v, list)),
        "dataKeys": list(obj.get("data", {}).keys()),
    }

manifest = {
    "format": "recraft-alchemia-public-manifest",
    "version": VERSION,
    "updatedAt": STAMP,
    "files": {
        "master": info(public_master_path),
        "character": info(character_path),
        "facility": info(facility_path),
    },
}
manifest["sha256"] = manifest["files"]["master"]["sha256"]
manifest["bytes"] = manifest["files"]["master"]["bytes"]
manifest["recordCount"] = manifest["files"]["master"]["recordCount"]
dump_json(manifest_path, manifest)

print(f"updated events={len(event_patches)} quests20to25={step_changed} version={VERSION}")
