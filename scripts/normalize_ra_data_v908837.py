from pathlib import Path
import json, hashlib, shutil

ROOT=Path(".")
VERSION="90.8.837"
STAMP="2026-10-07T16:12:00+09:00"
FILES={
 "initial":ROOT/"data/recraft_alchemia_initial_data.json",
 "master":ROOT/"data/public/recraft_alchemia_master.json",
 "character":ROOT/"data/public/recraft_alchemia_character_master.json",
 "facility":ROOT/"data/public/recraft_alchemia_facility_master.json",
}
DESC="v90.8.837：価格式監査により朝露薬の売値を46Gから56Gへ修正。素材売値合計34G＋施設依頼費45Gの50%を反映し、現行の自作品売値式へ一致。 "

def load(p): return json.loads(p.read_text(encoding="utf-8"))
def dump(p,obj):
    txt=json.dumps(obj,ensure_ascii=False,indent=2)+"\n"
    p.write_text(txt,encoding="utf-8")
    return txt.encode("utf-8")

written={}
for key,path in FILES.items():
    obj=load(path); data=obj.get("data",obj)
    for row in data.get("items",[]):
        if str(row.get("id","")).strip()=="con_dew_tonic":
            row["sellPrice"]=56
    obj["version"]=VERSION
    if "description" in obj and not str(obj.get("description","")).startswith(DESC):
        obj["description"]=DESC+str(obj.get("description",""))
    if "updatedAt" in obj: obj["updatedAt"]=STAMP
    if "generatedAt" in obj: obj["generatedAt"]=STAMP
    written[key]=dump(path,obj)

manifest_path=ROOT/"data/public/manifest.json"
manifest=load(manifest_path); manifest["version"]=VERSION; manifest["updatedAt"]=STAMP
for key in ("master","character","facility"):
    info=manifest["files"][key]; payload=written[key]; obj=load(FILES[key]); data=obj.get("data",obj)
    keys=info.get("dataKeys",[])
    info["sha256"]=hashlib.sha256(payload).hexdigest()
    info["bytes"]=len(payload)
    info["recordCount"]=sum(len(data.get(k,[])) for k in keys if isinstance(data.get(k,[]),list))
mi=manifest["files"]["master"]
manifest["sha256"]=mi["sha256"]; manifest["bytes"]=mi["bytes"]; manifest["recordCount"]=mi["recordCount"]
dump(manifest_path,manifest)

for src,dst in [
 ("data/recraft_alchemia_initial_data.json","gm/modules/manager/data/recraft_alchemia_initial_data.json"),
 ("data/public/manifest.json","gm/modules/manager/data/public/manifest.json"),
 ("data/public/recraft_alchemia_master.json","gm/modules/manager/data/public/recraft_alchemia_master.json"),
 ("data/public/recraft_alchemia_character_master.json","gm/modules/manager/data/public/recraft_alchemia_character_master.json"),
 ("data/public/recraft_alchemia_facility_master.json","gm/modules/manager/data/public/recraft_alchemia_facility_master.json"),
]:
    shutil.copyfile(ROOT/src,ROOT/dst)

admin=ROOT/"gm/modules/manager/database_admin_main.js"
txt=admin.read_text(encoding="utf-8")
txt=txt.replace("const RECRAFT_DB_VERSION = 'v90.8.836';","const RECRAFT_DB_VERSION = 'v90.8.837';")
txt=txt.replace("const RECRAFT_DB_REQUIRED_SERVER_VERSION = 'v90.8.836';","const RECRAFT_DB_REQUIRED_SERVER_VERSION = 'v90.8.837';")
admin.write_text(txt,encoding="utf-8")
