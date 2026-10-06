function formatDate(iso) {
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
