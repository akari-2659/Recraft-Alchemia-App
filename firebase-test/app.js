import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onValue, query, orderByChild, limitToLast, serverTimestamp, set, remove, runTransaction } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const GAS_URL = "https://script.google.com/macros/s/AKfycbxNQYC7-aBE23cliuD1Zdze18xHh-q45P1qpBgwCCg0dYgxd1b8A-R63eGjzMtgOxMT/exec";
const CONFIG_KEY = "ra-firebase-test-config-v1";
const PLAYER_KEY_STORAGE = "ra-firebase-test-player-key";
const ROOM_STORAGE = "ra-firebase-test-room";

const $ = id => document.getElementById(id);
const fields = {
  apiKey: $("fbApiKey"),
  authDomain: $("fbAuthDomain"),
  databaseURL: $("fbDatabaseUrl"),
  projectId: $("fbProjectId"),
  appId: $("fbAppId")
};

let firebaseApp = null;
let auth = null;
let db = null;
let roomUnsubscribe = null;
let partyUnsubscribe = null;
const partyHpUnsubscribes = new Map();
let hpUnsubscribe = null;
let hpWriteTimer = null;
let selectedCharacterData = null;
let currentUid = "";
const renderedKeys = new Set();

function setStatus(el, text, state = "") {
  el.textContent = text;
  el.className = "status" + (state ? " " + state : "");
}

function loadSavedConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_KEY) || "null");
    if (saved) {
      for (const [key, input] of Object.entries(fields)) input.value = saved[key] || "";
    }
  } catch (_) {}
  $("playerKey").value = localStorage.getItem(PLAYER_KEY_STORAGE) || "";
  $("roomId").value = localStorage.getItem(ROOM_STORAGE) || "ra-test-room-1";
}

function readConfig() {
  return Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, String(input.value || "").trim()]));
}

function validateConfig(config) {
  const missing = Object.entries(config).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error("未入力: " + missing.join(", "));
}

async function connectFirebase() {
  const config = readConfig();
  validateConfig(config);
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  setStatus($("firebaseStatus"), "Firebaseへ接続中…");

  if (roomUnsubscribe) { roomUnsubscribe(); roomUnsubscribe = null; }
  if (partyUnsubscribe) { partyUnsubscribe(); partyUnsubscribe = null; }
  clearPartyHpSubscriptions();
  if (hpUnsubscribe) { hpUnsubscribe(); hpUnsubscribe = null; }
  if (firebaseApp) {
    try { await deleteApp(firebaseApp); } catch (_) {}
  }

  firebaseApp = initializeApp(config, "ra-test-" + Date.now());
  auth = getAuth(firebaseApp);
  const credential = await signInAnonymously(auth);
  currentUid = credential.user.uid;
  db = getDatabase(firebaseApp);

  setStatus($("firebaseStatus"), "接続済み / 匿名UID: " + currentUid.slice(0, 10) + "…", "ok");
  connectRoom();
  if ($("characterSelect").value && selectedCharacterData) connectHp(String($("characterSelect").value), normalizedInitialHp(selectedCharacterData));
}

function connectRoom() {
  if (!db) {
    setStatus($("firebaseStatus"), "先にFirebaseへ接続してください。", "error");
    return;
  }

  const roomId = String($("roomId").value || "").trim();
  if (!roomId) {
    $("roomStatus").textContent = "ルームIDを入力してください";
    return;
  }

  localStorage.setItem(ROOM_STORAGE, roomId);
  if (roomUnsubscribe) {
    roomUnsubscribe();
    roomUnsubscribe = null;
  }

  renderedKeys.clear();
  $("chatLog").innerHTML = '<div class="empty">メッセージ待機中…</div>';

  const messages = query(
    ref(db, "raTest/rooms/" + roomId + "/messages"),
    orderByChild("createdAt"),
    limitToLast(200)
  );

  roomUnsubscribe = onChildAdded(
    messages,
    snapshot => {
      if (renderedKeys.has(snapshot.key)) return;
      renderedKeys.add(snapshot.key);
      if ($("chatLog").querySelector(".empty")) $("chatLog").innerHTML = "";
      renderMessage(snapshot.key, snapshot.val() || {});
    },
    error => {
      $("roomStatus").textContent = "受信エラー: " + (error.message || error);
    }
  );

  $("roomStatus").textContent = "ルーム接続中: " + roomId;
  connectParty(roomId);
}

function renderMessage(key, message) {
  const article = document.createElement("article");
  article.className = "message" + (message.type === "system" ? " system" : "");
  article.dataset.key = key;

  const head = document.createElement("div");
  head.className = "message-head";

  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent = message.type === "system" ? "SYSTEM" : (message.speakerName || "名称未設定");

  const time = document.createElement("div");
  time.className = "message-time";
  const timestamp = Number(message.createdAt) || 0;
  time.textContent = timestamp
    ? new Date(timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "送信中";

  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = String(message.text || "");

  head.append(name, time);
  article.append(head, text);
  $("chatLog").append(article);
  $("chatLog").scrollTop = $("chatLog").scrollHeight;
}

async function sendMessage(event) {
  event.preventDefault();

  if (!db || !currentUid) {
    setStatus($("firebaseStatus"), "Firebase未接続です。", "error");
    return;
  }

  const roomId = String($("roomId").value || "").trim();
  const text = String($("chatText").value || "").trim();
  const option = $("characterSelect").selectedOptions[0];
  const characterId = String(option?.value || "");
  const speakerName = String(option?.dataset?.name || option?.textContent || "").trim();

  if (!roomId) return;
  if (!characterId) {
    setStatus($("characterStatus"), "発言キャラクターを選択してください。", "error");
    return;
  }
  if (!text) return;

  await push(ref(db, "raTest/rooms/" + roomId + "/messages"), {
    speakerId: characterId,
    speakerName,
    text,
    senderUid: currentUid,
    createdAt: serverTimestamp()
  });

  $("chatText").value = "";
}

function jsonp(action, payload = {}, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const callbackName = "raFirebaseTestCb_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("キャラクター一覧の取得がタイムアウトしました。"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
      script.remove();
    }

    window[callbackName] = json => {
      cleanup();
      if (!json || json.ok === false) reject(new Error(json?.error || "キャラクター一覧を取得できませんでした。"));
      else resolve(json);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("キャラクター一覧の通信に失敗しました。"));
    };

    const url = new URL(GAS_URL);
    url.searchParams.set("api", "1");
    url.searchParams.set("action", action);
    url.searchParams.set("callback", callbackName);
    url.searchParams.set("_t", Date.now());

    for (const [key, value] of Object.entries(payload)) url.searchParams.set(key, String(value));

    script.src = url.toString();
    document.head.appendChild(script);
  });
}



function clearPartyHpSubscriptions() {
  for (const unsubscribe of partyHpUnsubscribes.values()) {
    try { unsubscribe(); } catch (_) {}
  }
  partyHpUnsubscribes.clear();
}

function connectParty(roomId) {
  if (!db || !roomId) return;

  if (partyUnsubscribe) {
    partyUnsubscribe();
    partyUnsubscribe = null;
  }
  clearPartyHpSubscriptions();
  $("partyList").innerHTML = '<div class="empty">パーティーを読み込み中…</div>';

  partyUnsubscribe = onValue(
    ref(db, "raTest/rooms/" + roomId + "/party"),
    snapshot => renderParty(snapshot.val() || {}, roomId),
    error => {
      $("partyList").innerHTML = "";
      const el = document.createElement("div");
      el.className = "status error";
      el.textContent = "パーティー受信エラー: " + (error.message || error);
      $("partyList").append(el);
    }
  );
}

function renderParty(party, roomId) {
  clearPartyHpSubscriptions();
  const entries = Object.entries(party || {}).filter(([, member]) => member && typeof member === "object");
  $("partyList").innerHTML = "";

  if (!entries.length) {
    $("partyList").innerHTML = '<div class="empty">パーティー未登録</div>';
    return;
  }

  entries.sort((a, b) => Number(a[1]?.addedAt || 0) - Number(b[1]?.addedAt || 0));

  for (const [characterId, member] of entries) {
    const card = document.createElement("article");
    card.className = "party-member";

    const main = document.createElement("div");
    main.className = "party-member-main";

    const name = document.createElement("div");
    name.className = "party-member-name";
    name.textContent = member.name || "無名のキャラクター";

    const id = document.createElement("div");
    id.className = "party-member-id";
    id.textContent = characterId;

    const hp = document.createElement("div");
    hp.className = "party-member-hp";
    hp.innerHTML = "<small>HP</small>—";

    const actions = document.createElement("div");
    actions.className = "party-member-actions";

    const removeBtn = document.createElement("button");
    removeBtn.className = "ghost";
    removeBtn.type = "button";
    removeBtn.textContent = "パーティーから外す";
    removeBtn.addEventListener("click", () => removePartyMember(characterId));

    main.append(name, id);
    actions.append(removeBtn);
    card.append(main, hp, actions);
    $("partyList").append(card);

    const hpRef = ref(db, "raTest/rooms/" + roomId + "/characters/" + characterId + "/hp");
    const unsubscribe = onValue(
      hpRef,
      snapshot => {
        const value = snapshot.val();
        hp.innerHTML = "<small>HP</small>" + (value === null || value === undefined ? "—" : String(value));
      },
      () => { hp.innerHTML = "<small>HP</small>ERR"; }
    );
    partyHpUnsubscribes.set(characterId, unsubscribe);
  }
}

async function addSelectedCharacterToParty() {
  if (!db || !currentUid) {
    setStatus($("characterStatus"), "先にFirebaseへ接続してください。", "error");
    return;
  }

  const characterId = String($("characterSelect").value || "").trim();
  const roomId = String($("roomId").value || "").trim();
  const option = $("characterSelect").selectedOptions[0];

  if (!characterId || !roomId || !option) {
    setStatus($("characterStatus"), "追加するキャラクターを選択してください。", "error");
    return;
  }

  if (!selectedCharacterData || String(selectedCharacterData.id || "") !== characterId) {
    await loadSelectedCharacterAndConnectHp();
  }

  const name = String(option.dataset.name || option.textContent || "無名のキャラクター").trim();
  const initialHp = normalizedInitialHp(selectedCharacterData);

  await runTransaction(
    ref(db, "raTest/rooms/" + roomId + "/characters/" + characterId + "/hp"),
    current => current === null ? initialHp : current
  );

  await set(ref(db, "raTest/rooms/" + roomId + "/party/" + characterId), {
    name,
    addedBy: currentUid,
    addedAt: serverTimestamp()
  });

  setStatus($("characterStatus"), name + " をパーティーに追加しました。", "ok");
}

async function removePartyMember(characterId) {
  if (!db) return;
  const roomId = String($("roomId").value || "").trim();
  if (!roomId || !characterId) return;
  await remove(ref(db, "raTest/rooms/" + roomId + "/party/" + characterId));
}

async function postHpSystemMessage(characterId, characterName, beforeHp, afterHp) {
  if (!db || !currentUid || beforeHp === afterHp) return;
  const roomId = String($("roomId").value || "").trim();
  if (!roomId) return;

  await push(ref(db, "raTest/rooms/" + roomId + "/messages"), {
    type: "system",
    speakerId: characterId,
    speakerName: characterName,
    text: characterName + "　HP " + beforeHp + " → " + afterHp,
    senderUid: currentUid,
    createdAt: serverTimestamp()
  });
}

function normalizedInitialHp(character) {
  const raw = character?.resources?.currentHp;
  if (raw === "" || raw === null || raw === undefined) return 0;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : 0;
}

async function loadSelectedCharacterAndConnectHp() {
  if (hpUnsubscribe) {
    hpUnsubscribe();
    hpUnsubscribe = null;
  }
  if (hpWriteTimer) {
    clearTimeout(hpWriteTimer);
    hpWriteTimer = null;
  }

  selectedCharacterData = null;
  $("liveHp").disabled = true;
  $("liveCharacterId").textContent = "未選択";

  const characterId = String($("characterSelect").value || "").trim();
  const playerKey = String($("playerKey").value || "").trim();

  if (!characterId) {
    setStatus($("hpStatus"), "キャラクターを選択してください。");
    return;
  }
  if (!playerKey) {
    setStatus($("hpStatus"), "プレイヤーキーが必要です。", "error");
    return;
  }

  $("liveCharacterId").textContent = characterId;
  setStatus($("hpStatus"), "キャラクターデータを読み込み中…");

  try {
    const response = await jsonp("load", { id: characterId, playerKey });
    const character = response?.data || response;
    if (!character || String(character.id || "") !== characterId) {
      throw new Error("キャラクターデータを取得できませんでした。");
    }
    selectedCharacterData = character;

    if (!db) {
      $("liveHp").value = normalizedInitialHp(character);
      setStatus($("hpStatus"), "Firebase未接続。保存済みHPのみ表示しています。");
      return;
    }

    connectHp(characterId, normalizedInitialHp(character));
  } catch (error) {
    setStatus($("hpStatus"), error.message || String(error), "error");
  }
}

async function connectHp(characterId, initialHp) {
  if (!db) return;

  const roomId = String($("roomId").value || "").trim();
  if (!roomId) {
    setStatus($("hpStatus"), "ルームIDを入力してください。", "error");
    return;
  }

  if (hpUnsubscribe) {
    hpUnsubscribe();
    hpUnsubscribe = null;
  }

  const hpRef = ref(db, "raTest/rooms/" + roomId + "/characters/" + characterId + "/hp");

  await runTransaction(hpRef, current => current === null ? initialHp : current);

  hpUnsubscribe = onValue(
    hpRef,
    snapshot => {
      const value = snapshot.val();
      if (value === null || value === undefined) return;
      $("liveHp").value = String(value);
      $("liveHp").disabled = false;
      setStatus($("hpStatus"), "リアルタイム同期中 / characterId単位", "ok");
    },
    error => {
      $("liveHp").disabled = true;
      setStatus($("hpStatus"), "HP受信エラー: " + (error.message || error), "error");
    }
  );
}

function queueHpWrite() {
  if (!db || !$("characterSelect").value) return;
  const value = Number($("liveHp").value);
  if (!Number.isFinite(value)) return;

  if (hpWriteTimer) clearTimeout(hpWriteTimer);
  hpWriteTimer = setTimeout(async () => {
    hpWriteTimer = null;
    const characterId = String($("characterSelect").value || "").trim();
    const roomId = String($("roomId").value || "").trim();
    const option = $("characterSelect").selectedOptions[0];
    const characterName = String(option?.dataset?.name || option?.textContent || "無名のキャラクター").trim();
    if (!characterId || !roomId) return;

    const nextHp = Math.trunc(value);
    let previousHp = null;

    try {
      const result = await runTransaction(
        ref(db, "raTest/rooms/" + roomId + "/characters/" + characterId + "/hp"),
        current => {
          previousHp = current === null || current === undefined ? nextHp : Number(current);
          return nextHp;
        }
      );

      if (result.committed && Number.isFinite(previousHp) && previousHp !== nextHp) {
        await postHpSystemMessage(characterId, characterName, previousHp, nextHp);
      }
    } catch (error) {
      setStatus($("hpStatus"), "HP送信エラー: " + (error.message || error), "error");
    }
  }, 120);
}

async function loadCharacters() {
  const playerKey = String($("playerKey").value || "").trim();
  if (!playerKey) {
    setStatus($("characterStatus"), "プレイヤーキーを入力してください。", "error");
    return;
  }

  localStorage.setItem(PLAYER_KEY_STORAGE, playerKey);
  setStatus($("characterStatus"), "登録キャラを読み込み中…");

  try {
    const response = await jsonp("list", { playerKey });
    const items = Array.isArray(response)
      ? response
      : (Array.isArray(response.items)
        ? response.items
        : (Array.isArray(response.data?.items) ? response.data.items : []));

    $("characterSelect").replaceChildren(new Option("未選択", ""));

    for (const character of items) {
      const option = new Option(character.name || "無名のキャラクター", String(character.id || ""));
      option.dataset.name = character.name || "無名のキャラクター";
      $("characterSelect").append(option);
    }

    setStatus($("characterStatus"), items.length + "人を読み込みました。", "ok");
    $("addPartyBtn").disabled = true;
  } catch (error) {
    setStatus($("characterStatus"), error.message || String(error), "error");
  }
}

$("connectFirebaseBtn").addEventListener("click", () => {
  connectFirebase().catch(error => setStatus($("firebaseStatus"), error.message || String(error), "error"));
});
$("clearFirebaseBtn").addEventListener("click", () => {
  localStorage.removeItem(CONFIG_KEY);
  for (const input of Object.values(fields)) input.value = "";
  setStatus($("firebaseStatus"), "保存設定を削除しました。");
});
$("loadCharactersBtn").addEventListener("click", loadCharacters);
$("reconnectRoomBtn").addEventListener("click", connectRoom);
$("roomId").addEventListener("change", () => { connectRoom(); loadSelectedCharacterAndConnectHp(); });
$("characterSelect").addEventListener("change", () => { $("addPartyBtn").disabled = !$("characterSelect").value; loadSelectedCharacterAndConnectHp(); });
$("addPartyBtn").addEventListener("click", () => { addSelectedCharacterToParty().catch(error => setStatus($("characterStatus"), error.message || String(error), "error")); });
$("liveHp").addEventListener("input", queueHpWrite);
$("chatForm").addEventListener("submit", event => {
  sendMessage(event).catch(error => setStatus($("firebaseStatus"), error.message || String(error), "error"));
});

loadSavedConfig();
