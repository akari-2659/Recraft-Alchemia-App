import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onValue, query, orderByChild, limitToLast, serverTimestamp, set, remove, runTransaction } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const GAS_URL = "https://script.google.com/macros/s/AKfycbxNQYC7-aBE23cliuD1Zdze18xHh-q45P1qpBgwCCg0dYgxd1b8A-R63eGjzMtgOxMT/exec";
const CONFIG_KEY = "ra-firebase-test-config-v1";
const PLAYER_KEY_STORAGE = "ra-firebase-test-player-key";
const ROOM_STORAGE = "ra-firebase-test-room";
const CHAT_COLORS_STORAGE = "ra-firebase-test-chat-colors-v1";
const DEFAULT_CHAT_COLOR = "#6B4933";
const BCDICE_SERVERS = [
  "https://bcdice.onlinesession.app",
  "https://bcdice.trpg.net"
];
const BCDICE_SYSTEM = "DiceBot";

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
let mpWriteTimer = null;
let selectedCharacterData = null;
let registeredCharacters = [];
let chatColors = {};
let currentUid = "";
const renderedKeys = new Set();

function setStatus(el, text, state = "") {
  el.textContent = text;
  el.className = "status" + (state ? " " + state : "");
}
function setResourceStatus(text, state = "") {
  const el = $("hpStatus");
  if (!el) return;
  el.textContent = text;
  el.className = "resource-strip-status" + (state ? " " + state : "");
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
  try {
    const savedColors = JSON.parse(localStorage.getItem(CHAT_COLORS_STORAGE) || "{}");
    chatColors = savedColors && typeof savedColors === "object" ? savedColors : {};
  } catch (_) {
    chatColors = {};
  }
  renderSpeakerOptions();
  applyCurrentSpeakerColor();
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
  handleSpeakerChange();
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
  const messageType = String(message.type || "");
  article.className = "message" +
    (messageType === "system" ? " system" : "") +
    (messageType === "dice" ? " dice" : "") +
    (messageType === "secret-dice" ? " secret-dice" : "");
  article.dataset.key = key;

  const head = document.createElement("div");
  head.className = "message-head";

  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent = messageType === "system"
    ? "SYSTEM"
    : (message.speakerName || "名称未設定");

  const time = document.createElement("div");
  time.className = "message-time";
  const timestamp = Number(message.createdAt) || 0;
  time.textContent = timestamp
    ? new Date(timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "送信中";

  const text = document.createElement("div");
  text.className = "message-text";
  if (messageType === "dice" || messageType === "secret-dice") {
    text.classList.add("message-dice-command");
  }
  text.textContent = String(message.text || "");

  if (messageType !== "system") {
    const color = normalizeHexColor(message.color) || DEFAULT_CHAT_COLOR;
    article.style.setProperty("--message-color", color);
  }

  head.append(name, time);
  article.append(head, text);

  const diceResultText = String(message.diceResult || "").trim();
  if (diceResultText) {
    const diceResult = document.createElement("div");
    diceResult.className = "message-dice-result";
    diceResult.textContent = diceResultText;
    article.append(diceResult);
  }
  $("chatLog").append(article);
  $("chatLog").scrollTop = $("chatLog").scrollHeight;
}


function extractDiceCommand(messageText = "") {
  const raw = String(messageText || "").trim();
  if (!raw) return null;

  // RA palette labels are display text; BCDice receives only the command part.
  const withoutLabel = raw.replace(/\s*【[^】]*】\s*$/, "").trim();
  const candidate = withoutLabel;

  const commonPattern = /^(?:S)?(?:\d+[dD]\d+(?:(?:KH|KL|DH|DL)\d+|MAX|MIN)?|\d+[bB]\d+|\d+[rR]\d+|\d+[uU]\d+|\d+(?:TY|TZ)\d+|D66(?:A|D|N|S)?|C(?:\(|\s*)|CHOICE\d*(?:\[|\(|\s)|(?:X|REP|REPEAT)\d+\s|BCDICEVERSION)/i;
  if (!commonPattern.test(candidate)) return null;
  return candidate;
}

async function rollBCDice(command) {
  let lastError = null;
  for (const server of BCDICE_SERVERS) {
    try {
      const url = server + "/v2/game_system/" + encodeURIComponent(BCDICE_SYSTEM) +
        "/roll?command=" + encodeURIComponent(command);
      const response = await fetch(url, { method:"GET", mode:"cors", cache:"no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.reason || ("HTTP " + response.status));
      }
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("BCDiceへ接続できませんでした。");
}


function classifyRa2D6Special(command, result) {
  const raw = String(command || "").trim();
  // RAの通常2D6判定のみ。KH/KL等の加工ダイスは対象外。
  if (!/^(?:S)?2D6(?=$|[+\-*/<>=\s])/i.test(raw)) {
    return { critical:false, fumble:false, label:"" };
  }

  const d6 = Array.isArray(result?.rands)
    ? result.rands
        .filter(row => Number(row?.sides) === 6 && Number.isFinite(Number(row?.value)))
        .slice(0, 2)
        .map(row => Number(row.value))
    : [];

  if (d6.length !== 2) {
    return { critical:false, fumble:false, label:"" };
  }

  if (d6[0] === 1 && d6[1] === 1) {
    return { critical:false, fumble:true, label:"ファンブル" };
  }
  if (d6[0] === 6 && d6[1] === 6) {
    return { critical:true, fumble:false, label:"クリティカル" };
  }
  return { critical:false, fumble:false, label:"" };
}

function formatDiceResult(command, result) {
  const base = String(result?.text || command);
  const special = classifyRa2D6Special(command, result);
  let text = base;

  if (special.label) {
    // BCDiceの通常結果末尾「成功／失敗」をRAのクリティカル／ファンブル表示へ置き換える。
    const replaced = text.replace(
      /(→|＞)\s*(成功|失敗)\s*$/u,
      (_, arrow) => arrow + " " + special.label
    );
    text = replaced === text
      ? text.replace(/\s*(成功|失敗)\s*$/u, " " + special.label)
      : replaced;

    // 成否語がないコマンドでも、同じ結果行の末尾に収める。
    if (text === base && !/(クリティカル|ファンブル)\s*$/u.test(text)) {
      text += " → " + special.label;
    }
  }

  return {
    text,
    critical: special.critical || result?.critical === true,
    fumble: special.fumble || result?.fumble === true
  };
}

function appendLocalSecretDiceResult(speakerName, color, originalText, command, result) {
  const key = "secret-" + Date.now() + "-" + Math.random().toString(36).slice(2);
  const formatted = formatDiceResult(command, result);
  renderMessage(key, {
    type:"secret-dice",
    speakerName,
    color,
    text: originalText,
    diceCommand: command,
    diceResult: formatted.text,
    diceSuccess: result?.success === true,
    diceFailure: result?.failure === true,
    diceCritical: formatted.critical,
    diceFumble: formatted.fumble,
    createdAt: Date.now()
  });
}

async function sendMessage() {
  if (!db || !currentUid) {
    setStatus($("firebaseStatus"), "Firebase未接続です。", "error");
    return;
  }

  const roomId = String($("roomId").value || "").trim();
  const text = String($("chatText").value || "").trim();
  const selectedCharacter = getSelectedRegisteredCharacter();
  const speakerName = String($("speakerName").value || "").trim();

  if (!roomId) return;
  if (!speakerName) {
    setStatus($("characterStatus"), "発言者名を入力してください。", "error");
    return;
  }
  if (!text) return;

  const color = currentChatColor();
  const speakerId = selectedCharacter?.id || ("manual:" + currentUid);
  const diceCommand = extractDiceCommand(text);
  const isSecretDice = !!diceCommand && /^S/i.test(diceCommand);

  $("chatText").value = "";

  if (!diceCommand) {
    await push(ref(db, "raTest/rooms/" + roomId + "/messages"), {
      speakerId,
      speakerName,
      color,
      text,
      senderUid: currentUid,
      createdAt: serverTimestamp()
    });
    return;
  }

  try {
    const result = await rollBCDice(diceCommand);

    if (result?.secret || isSecretDice) {
      appendLocalSecretDiceResult(speakerName, color, text, diceCommand, result);
      return;
    }

    const formatted = formatDiceResult(diceCommand, result);
    await push(ref(db, "raTest/rooms/" + roomId + "/messages"), {
      type:"dice",
      speakerId,
      speakerName,
      color,
      text,
      diceCommand,
      diceResult: formatted.text,
      diceSuccess: result?.success === true,
      diceFailure: result?.failure === true,
      diceCritical: formatted.critical,
      diceFumble: formatted.fumble,
      senderUid: currentUid,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    const errorText = "ダイス実行エラー: " + (error.message || error);

    if (isSecretDice) {
      appendLocalSecretDiceResult(
        speakerName,
        color,
        text,
        diceCommand,
        { text:errorText }
      );
      return;
    }

    await push(ref(db, "raTest/rooms/" + roomId + "/messages"), {
      type:"dice",
      speakerId,
      speakerName,
      color,
      text,
      diceCommand,
      diceResult:errorText,
      senderUid: currentUid,
      createdAt: serverTimestamp()
    });
  }
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





function normalizeHexColor(value) {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return ("#" + raw).toUpperCase();
  return "";
}

function speakerColorKey() {
  const selected = getSelectedRegisteredCharacter();
  if (selected?.id) return "character:" + selected.id;
  const name = String($("speakerName")?.value || "").trim();
  return name ? "manual:" + name : "manual:default";
}

function currentChatColor() {
  return normalizeHexColor($("chatColorCode")?.value) ||
    normalizeHexColor($("chatColorPicker")?.value) ||
    DEFAULT_CHAT_COLOR;
}

function saveCurrentSpeakerColor(color) {
  const normalized = normalizeHexColor(color);
  if (!normalized) return;
  chatColors[speakerColorKey()] = normalized;
  try { localStorage.setItem(CHAT_COLORS_STORAGE, JSON.stringify(chatColors)); } catch (_) {}
}

function setChatColorUi(color, save = false) {
  const normalized = normalizeHexColor(color) || DEFAULT_CHAT_COLOR;
  $("chatColorPicker").value = normalized;
  $("chatColorCode").value = normalized;
  if ($("chatColorSwatch")) $("chatColorSwatch").style.background = normalized;
  if (save) saveCurrentSpeakerColor(normalized);
}

function applyCurrentSpeakerColor() {
  const color = normalizeHexColor(chatColors[speakerColorKey()]) || DEFAULT_CHAT_COLOR;
  setChatColorUi(color, false);
}

function handleColorPickerInput() {
  setChatColorUi($("chatColorPicker").value, true);
}

function handleColorCodeInput(commit = false) {
  const normalized = normalizeHexColor($("chatColorCode").value);
  if (!normalized) {
    if (commit) {
      $("chatColorCode").value = currentChatColor();
    }
    return;
  }
  $("chatColorPicker").value = normalized;
  $("chatColorCode").value = normalized;
  saveCurrentSpeakerColor(normalized);
}


function fallbackPaletteLines(data = {}) {
  const abilities = data.effectiveAbilities || data.abilities || {};
  const skills = data.skills || {};
  const categories = [
    ["body","体力",[["athletics","運動"],["force","力業"],["melee","近接"],["guard","防御"]]],
    ["dexterity","器用",[["gather","採取"],["craft","細工"],["shoot","射撃"],["operate","操作"]]],
    ["sense","感覚",[["search","探索"],["detect","感知"],["evade","回避"],["track","追跡"]]],
    ["intellect","知性",[["alchemy","調合"],["appraise","鑑定"],["knowledge","知識"],["design","設計"]]],
    ["will","意志",[["resist","抵抗"],["focus","集中"],["magic","魔法"],["prayer","祈祷"]]],
    ["charm","魅力",[["negotiate","交渉"],["service","共感"],["art","社交"],["leadership","鼓舞"]]]
  ];
  const lines = [];
  for (const [abilityKey,, rows] of categories) {
    const base = Number(abilities?.[abilityKey]) || 0;
    for (const [key, name] of rows) {
      const row = skills?.[key] || {};
      const total = Number(row.total);
      const value = Number.isFinite(total)
        ? total
        : base + (Number(row.cat) || 0) + (Number(row.free) || 0);
      lines.push(`2D6+${value}>=目標値 【${name}】`);
    }
  }
  return lines;
}

function paletteLinesForCharacter(data) {
  try {
    if (typeof window.generatePaletteExport === "function") {
      const text = String(window.generatePaletteExport(data) || "");
      if (text.trim()) return text.split(/\r?\n/);
    }
  } catch (error) {
    console.warn("Existing palette generator failed; fallback palette is used.", error);
  }
  return fallbackPaletteLines(data);
}

function renderChatPalette(data) {
  const list = $("paletteList");
  if (!list) return;
  list.innerHTML = "";

  if (!data) {
    list.innerHTML = '<div class="empty compact-empty">登録キャラクターを選択してください。</div>';
    return;
  }

  const lines = paletteLinesForCharacter(data);
  let previousBlank = false;

  for (const rawLine of lines) {
    const line = String(rawLine || "").trim();

    if (!line) {
      if (!previousBlank && list.childElementCount) {
        const separator = document.createElement("div");
        separator.className = "palette-separator";
        list.append(separator);
      }
      previousBlank = true;
      continue;
    }
    previousBlank = false;

    if (line.startsWith("//")) {
      const note = document.createElement("div");
      note.className = "palette-note";
      note.textContent = line.replace(/^\/\/\s?/, "");
      list.append(note);
      continue;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "palette-entry";
    button.textContent = line;
    button.addEventListener("click", () => {
      const input = $("chatText");
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const before = input.value.slice(0, start);
      const after = input.value.slice(end);
      input.value = before + line + after;
      const cursor = start + line.length;
      input.focus();
      input.setSelectionRange(cursor, cursor);
      $("palettePanel").hidden = true;
    });
    list.append(button);
  }

  if (!list.childElementCount) {
    list.innerHTML = '<div class="empty compact-empty">使用できる項目がありません。</div>';
  }
}

function closeChatPopovers(except = "") {
  if (except !== "palette" && $("palettePanel")) $("palettePanel").hidden = true;
  if (except !== "color" && $("colorPanel")) $("colorPanel").hidden = true;
}

function renderSpeakerOptions(selectedValue = "") {
  const select = $("characterSelect");
  if (!select) return;

  const previous = selectedValue || select.value || "";
  select.replaceChildren(new Option("キャラクターを選択", ""));

  for (const character of registeredCharacters) {
    const id = String(character.id || "").trim();
    if (!id) continue;
    const option = new Option(character.name || "無名のキャラクター", id);
    option.dataset.characterId = id;
    option.dataset.name = character.name || "無名のキャラクター";
    select.append(option);
  }

  if ([...select.options].some(option => option.value === previous)) select.value = previous;
}

function getSelectedRegisteredCharacter() {
  const option = $("characterSelect")?.selectedOptions?.[0];
  if (!option || !option.value) return null;
  return {
    id: String(option.dataset.characterId || option.value || "").trim(),
    name: String(option.dataset.name || option.textContent || "").trim()
  };
}

async function handleSpeakerChange() {
  const character = getSelectedRegisteredCharacter();

  if (!character) {
    if (hpUnsubscribe) {
      hpUnsubscribe();
      hpUnsubscribe = null;
    }
    selectedCharacterData = null;
    $("resourcePanel").hidden = true;
    $("togglePaletteBtn").disabled = true;
    renderChatPalette(null);
    closeChatPopovers();
    applyCurrentSpeakerColor();
    return;
  }

  $("speakerName").value = character.name;
  applyCurrentSpeakerColor();
  $("resourcePanel").hidden = false;
  $("resourceCharacterName").textContent = character.name;
  await loadSelectedCharacterAndConnectHp();
}


function renderPartyCandidates() {
  const list = $("partyCandidateList");
  if (!list) return;
  list.innerHTML = "";

  if (!registeredCharacters.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "このプレイヤーキーの登録キャラクターが読み込まれていません。";
    list.append(empty);
    return;
  }

  for (const character of registeredCharacters) {
    const characterId = String(character.id || "").trim();
    if (!characterId) continue;

    const row = document.createElement("div");
    row.className = "party-candidate";

    const name = document.createElement("div");
    name.className = "party-candidate-name";
    name.textContent = character.name || "無名のキャラクター";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "追加";
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await addCharacterToParty(characterId, character.name || "無名のキャラクター");
        $("partyAddDialog").close();
      } catch (error) {
        setStatus($("characterStatus"), error.message || String(error), "error");
      } finally {
        button.disabled = false;
      }
    });

    row.append(name, button);
    list.append(row);
  }
}

function openPartyAddDialog() {
  renderPartyCandidates();
  const dialog = $("partyAddDialog");
  if (dialog?.showModal) dialog.showModal();
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

    const stats = document.createElement("div");
    stats.className = "party-member-stats";
    const hp = document.createElement("div");
    hp.className = "party-member-stat";
    hp.innerHTML = "<small>HP</small>— / —";
    const mp = document.createElement("div");
    mp.className = "party-member-stat";
    mp.innerHTML = "<small>MP</small>— / —";
    stats.append(hp, mp);

    const actions = document.createElement("div");
    actions.className = "party-member-actions";

    const removeBtn = document.createElement("button");
    removeBtn.className = "ghost";
    removeBtn.type = "button";
    removeBtn.textContent = "パーティーから外す";
    removeBtn.addEventListener("click", () => removePartyMember(characterId));

    main.append(name, id);
    actions.append(removeBtn);
    card.append(main, stats, actions);
    $("partyList").append(card);

    const resourceRef = ref(db, "raTest/rooms/" + roomId + "/characters/" + characterId);
    const unsubscribe = onValue(
      resourceRef,
      snapshot => {
        const value = snapshot.val() || {};
        const hpCurrent = value.hp === null || value.hp === undefined ? "—" : String(value.hp);
        const hpMax = value.maxHp === null || value.maxHp === undefined ? "—" : String(value.maxHp);
        const mpCurrent = value.mp === null || value.mp === undefined ? "—" : String(value.mp);
        const mpMax = value.maxMp === null || value.maxMp === undefined ? "—" : String(value.maxMp);
        hp.innerHTML = "<small>HP</small>" + hpCurrent + " / " + hpMax;
        mp.innerHTML = "<small>MP</small>" + mpCurrent + " / " + mpMax;
      },
      () => {
        hp.innerHTML = "<small>HP</small>ERR";
        mp.innerHTML = "<small>MP</small>ERR";
      }
    );
    partyHpUnsubscribes.set(characterId, unsubscribe);
  }
}

async function addCharacterToParty(characterId, characterName) {
  if (!db || !currentUid) {
    throw new Error("先にFirebaseへ接続してください。");
  }

  const roomId = String($("roomId").value || "").trim();
  const playerKey = String($("playerKey").value || "").trim();

  if (!characterId || !roomId) throw new Error("追加するキャラクターを選択してください。");
  if (!playerKey) throw new Error("プレイヤーキーが必要です。");

  const response = await jsonp("load", { id: characterId, playerKey });
  const character = response?.data || response;
  if (!character || String(character.id || "") !== characterId) {
    throw new Error("キャラクターデータを取得できませんでした。");
  }

  const resource = characterResourceSnapshot(character);

  await runTransaction(
    ref(db, "raTest/rooms/" + roomId + "/characters/" + characterId),
    current => {
      const base = current && typeof current === "object" ? current : {};
      return {
        ...base,
        hp: base.hp === null || base.hp === undefined ? resource.hp : base.hp,
        mp: base.mp === null || base.mp === undefined ? resource.mp : base.mp,
        maxHp: resource.maxHp,
        maxMp: resource.maxMp
      };
    }
  );

  await set(ref(db, "raTest/rooms/" + roomId + "/party/" + characterId), {
    name: characterName || character.name || "無名のキャラクター",
    addedBy: currentUid,
    addedAt: serverTimestamp()
  });

  setStatus($("characterStatus"), (characterName || character.name || "無名のキャラクター") + " をパーティーに追加しました。", "ok");
}

async function removePartyMember(characterId) {
  if (!db) return;
  const roomId = String($("roomId").value || "").trim();
  if (!roomId || !characterId) return;
  await remove(ref(db, "raTest/rooms/" + roomId + "/party/" + characterId));
}

async function postResourceSystemMessage(characterId, characterName, resourceLabel, beforeValue, afterValue) {
  if (!db || !currentUid || beforeValue === afterValue) return;
  const roomId = String($("roomId").value || "").trim();
  if (!roomId) return;

  await push(ref(db, "raTest/rooms/" + roomId + "/messages"), {
    type: "system",
    speakerId: characterId,
    speakerName: characterName,
    text: characterName + "　" + resourceLabel + " " + beforeValue + " → " + afterValue,
    senderUid: currentUid,
    createdAt: serverTimestamp()
  });
}

function normalizedResourceValue(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) return Math.trunc(Number(fallback) || 0);
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : Math.trunc(Number(fallback) || 0);
}
function characterResourceSnapshot(character) {
  const resources = character?.resources || {};
  const maxHp = normalizedResourceValue(resources.maxHp, 0);
  const maxMp = normalizedResourceValue(resources.maxMp, 0);
  return {
    hp: normalizedResourceValue(resources.currentHp, maxHp),
    mp: normalizedResourceValue(resources.currentMp, maxMp),
    maxHp,
    maxMp
  };
}
function normalizedInitialHp(character) {
  return characterResourceSnapshot(character).hp;
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
  if (mpWriteTimer) {
    clearTimeout(mpWriteTimer);
    mpWriteTimer = null;
  }

  selectedCharacterData = null;
  $("liveHp").disabled = true;
  $("liveMp").disabled = true;
  $("liveMaxHp").textContent = "—";
  $("liveMaxMp").textContent = "—";
  $("liveCharacterId").textContent = "未選択";

  const character = getSelectedRegisteredCharacter();
  const characterId = character?.id || "";
  const playerKey = String($("playerKey").value || "").trim();

  if (!characterId) {
    $("resourcePanel").hidden = true;
    setResourceStatus("登録キャラクターを選択してください。");
    return;
  }
  if (!playerKey) {
    setResourceStatus("プレイヤーキーが必要です。", "error");
    return;
  }

  $("liveCharacterId").textContent = characterId;
  setResourceStatus("キャラクターデータを読み込み中…");

  try {
    const response = await jsonp("load", { id: characterId, playerKey });
    const character = response?.data || response;
    if (!character || String(character.id || "") !== characterId) {
      throw new Error("キャラクターデータを取得できませんでした。");
    }
    selectedCharacterData = character;
    $("togglePaletteBtn").disabled = false;
    renderChatPalette(character);

    const resource = characterResourceSnapshot(character);
    $("liveMaxHp").textContent = String(resource.maxHp);
    $("liveMaxMp").textContent = String(resource.maxMp);

    if (!db) {
      $("liveHp").value = resource.hp;
      $("liveMp").value = resource.mp;
      setResourceStatus("Firebase未接続。保存済みHP/MPのみ表示しています。");
      return;
    }

    connectResources(characterId, resource);
  } catch (error) {
    $("togglePaletteBtn").disabled = true;
    renderChatPalette(null);
    setResourceStatus(error.message || String(error), "error");
  }
}

async function connectResources(characterId, initialResource) {
  if (!db) return;

  const roomId = String($("roomId").value || "").trim();
  if (!roomId) {
    setResourceStatus("ルームIDを入力してください。", "error");
    return;
  }

  if (hpUnsubscribe) {
    hpUnsubscribe();
    hpUnsubscribe = null;
  }

  const characterRef = ref(db, "raTest/rooms/" + roomId + "/characters/" + characterId);

  await runTransaction(characterRef, current => {
    const base = current && typeof current === "object" ? current : {};
    return {
      ...base,
      hp: base.hp === null || base.hp === undefined ? initialResource.hp : base.hp,
      mp: base.mp === null || base.mp === undefined ? initialResource.mp : base.mp,
      maxHp: initialResource.maxHp,
      maxMp: initialResource.maxMp
    };
  });

  hpUnsubscribe = onValue(
    characterRef,
    snapshot => {
      const value = snapshot.val() || {};
      if (value.hp !== null && value.hp !== undefined) $("liveHp").value = String(value.hp);
      if (value.mp !== null && value.mp !== undefined) $("liveMp").value = String(value.mp);
      $("liveMaxHp").textContent = value.maxHp === null || value.maxHp === undefined ? "—" : String(value.maxHp);
      $("liveMaxMp").textContent = value.maxMp === null || value.maxMp === undefined ? "—" : String(value.maxMp);
      $("liveHp").disabled = false;
      $("liveMp").disabled = false;
      setResourceStatus("リアルタイム同期中 / characterId単位", "ok");
    },
    error => {
      $("liveHp").disabled = true;
      $("liveMp").disabled = true;
      setResourceStatus("HP/MP受信エラー: " + (error.message || error), "error");
    }
  );
}

function queueHpWrite() {
  const selectedCharacter = getSelectedRegisteredCharacter();
  if (!db || !selectedCharacter) return;
  const value = Number($("liveHp").value);
  if (!Number.isFinite(value)) return;

  if (hpWriteTimer) clearTimeout(hpWriteTimer);
  hpWriteTimer = setTimeout(async () => {
    hpWriteTimer = null;
    const activeCharacter = getSelectedRegisteredCharacter();
    const characterId = activeCharacter?.id || "";
    const roomId = String($("roomId").value || "").trim();
    const characterName = String($("speakerName").value || activeCharacter?.name || "無名のキャラクター").trim();
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
        await postResourceSystemMessage(characterId, characterName, "HP", previousHp, nextHp);
      }
    } catch (error) {
      setResourceStatus("HP送信エラー: " + (error.message || error), "error");
    }
  }, 120);
}


function queueMpWrite() {
  const selectedCharacter = getSelectedRegisteredCharacter();
  if (!db || !selectedCharacter) return;
  const value = Number($("liveMp").value);
  if (!Number.isFinite(value)) return;

  if (mpWriteTimer) clearTimeout(mpWriteTimer);
  mpWriteTimer = setTimeout(async () => {
    mpWriteTimer = null;
    const activeCharacter = getSelectedRegisteredCharacter();
    const characterId = activeCharacter?.id || "";
    const roomId = String($("roomId").value || "").trim();
    const characterName = String($("speakerName").value || activeCharacter?.name || "無名のキャラクター").trim();
    if (!characterId || !roomId) return;

    const nextMp = Math.max(0, Math.trunc(value));
    let previousMp = null;

    try {
      const result = await runTransaction(
        ref(db, "raTest/rooms/" + roomId + "/characters/" + characterId + "/mp"),
        current => {
          previousMp = current === null || current === undefined ? nextMp : Number(current);
          return nextMp;
        }
      );

      if (result.committed && Number.isFinite(previousMp) && previousMp !== nextMp) {
        await postResourceSystemMessage(characterId, characterName, "MP", previousMp, nextMp);
      }
    } catch (error) {
      setResourceStatus("MP送信エラー: " + (error.message || error), "error");
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

    registeredCharacters = items;
    renderSpeakerOptions();
    renderPartyCandidates();
    setStatus($("characterStatus"), items.length + "人を読み込みました。", "ok");
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
$("roomId").addEventListener("change", () => { connectRoom(); handleSpeakerChange(); });
$("characterSelect").addEventListener("change", handleSpeakerChange);
$("speakerName").addEventListener("change", () => {
  if (!getSelectedRegisteredCharacter()) applyCurrentSpeakerColor();
});
$("chatColorPicker").addEventListener("input", handleColorPickerInput);
$("chatColorCode").addEventListener("input", () => handleColorCodeInput(false));
$("chatColorCode").addEventListener("change", () => handleColorCodeInput(true));
$("chatColorCode").addEventListener("blur", () => handleColorCodeInput(true));
$("togglePaletteBtn").addEventListener("click", event => {
  event.stopPropagation();
  if ($("togglePaletteBtn").disabled) return;
  const opening = $("palettePanel").hidden;
  closeChatPopovers(opening ? "palette" : "");
  $("palettePanel").hidden = !opening;
});
$("palettePanel").addEventListener("click", event => event.stopPropagation());
$("toggleColorPanelBtn").addEventListener("click", event => {
  event.stopPropagation();
  const opening = $("colorPanel").hidden;
  closeChatPopovers(opening ? "color" : "");
  $("colorPanel").hidden = !opening;
});
$("colorPanel").addEventListener("click", event => event.stopPropagation());
document.addEventListener("click", () => closeChatPopovers());
$("openPartyAddBtn").addEventListener("click", openPartyAddDialog);
$("liveHp").addEventListener("input", queueHpWrite);
$("liveMp").addEventListener("input", queueMpWrite);
$("sendChatBtn").addEventListener("click", () => {
  sendMessage().catch(error => setStatus($("firebaseStatus"), error.message || String(error), "error"));
});
$("chatText").addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage().catch(error => setStatus($("firebaseStatus"), error.message || String(error), "error"));
  }
});

loadSavedConfig();
handleSpeakerChange();
