/* =====================================================================
   워드 아일랜드 · 상점 화면
   - section#shop 과 지도 하단 버튼을 스스로 주입해요 (boss.js 와 같은 방식)
   - 아이템을 누르면 미리보기(피팅)만 바뀌고, 사야 내 것이 돼요
   ===================================================================== */
(() => {
const TABS = ['hat','face','hand','back','effect','body'];   // 'deal' 탭은 Task 5 에서 추가
const TAB_NAME = {hat:'모자', face:'얼굴', hand:'손', back:'등', effect:'효과', body:'몸'};
const UNLOCK_ICON = u => u.level ? '⭐' : u.trophies ? '🏆' : '📚';

const css = `
#shop{align-items:center;gap:8px;overflow:hidden;}
#shop .sp-top{display:flex;align-items:center;gap:10px;width:100%;max-width:640px;}
#shop .sp-top h2{margin:0;font-size:30px;flex:1;}
#shop .sp-prev{flex:none;height:230px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.7);border-radius:28px;width:100%;max-width:640px;}
#shop .sp-tabs{display:flex;gap:6px;width:100%;max-width:640px;}
#shop .sp-tab{flex:1;min-width:0;border:0;border-radius:16px;padding:8px 2px;background:#fff;font-size:15px;box-shadow:0 3px 0 rgba(0,0,0,.1);}
#shop .sp-tab b{display:block;font-size:24px;font-weight:normal;}
#shop .sp-tab.on{background:#3b82f6;color:#fff;box-shadow:0 3px 0 #1d4ed8;}
#shop .sp-grid{flex:1;min-height:0;width:100%;max-width:640px;overflow-y:auto;overflow-x:hidden;display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;align-content:start;padding:2px;}
#shop .sp-cell{border:3px solid transparent;border-radius:18px;background:#fff;padding:6px 2px;box-shadow:0 3px 0 rgba(0,0,0,.1);display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0;}
#shop .sp-cell .ci{font-size:38px;line-height:1.1;}
#shop .sp-cell .cw{font-size:16px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#shop .sp-cell .cs{font-size:14px;color:#475569;}
#shop .sp-cell.sel{border-color:#f97316;}
#shop .sp-cell.lock{opacity:.6;}
#shop .sp-cell.worn{background:#dcfce7;}
#shop .sp-bar{flex:none;width:100%;max-width:640px;min-height:76px;display:flex;align-items:center;justify-content:center;gap:10px;}
#shop .sp-bar .btn{flex:1;max-width:420px;font-size:22px;padding:14px 12px;}
#shop .sp-bar .btn:disabled{opacity:.55;box-shadow:none;transform:none;}
#shop .sp-bar .hint{font-size:20px;color:#475569;}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

const sec = document.createElement('section');
sec.id = 'shop'; sec.className = 'screen';
sec.innerHTML = `<div class="sp-top"><button class="icon" id="shopBack">⬅️</button><h2>🛍️ 상점</h2><div class="pill" id="shopCoin"></div></div>
  <div class="sp-prev" id="shopPrev"></div>
  <div class="sp-tabs" id="shopTabs"></div>
  <div class="sp-grid" id="shopGrid"></div>
  <div class="sp-bar" id="shopBar"></div>`;
document.body.appendChild(sec);

const sBtn = document.createElement('button');
sBtn.className = 'btn small'; sBtn.id = 'shopBtn'; sBtn.textContent = '🛍️ 상점';
sBtn.style.cssText = 'background:#ec4899;box-shadow:0 6px 0 #be185d';
$('setBtn').before(sBtn);

/* ---------- 상태 ---------- */
let tab = 'hat', tryOn = {}, sel = null, busy = false;
const find = id => Avatar.item(id);

function refresh(){
  $('shopCoin').textContent = `🪙 ${S.coins}`;
  Avatar.render($('shopPrev'), {size:'l', pet:true, preview:tryOn});
  $('shopTabs').innerHTML = '';
  TABS.forEach(t => {
    const b = document.createElement('button');
    b.className = 'sp-tab' + (t === tab ? ' on' : '');
    b.innerHTML = `<b>${t === 'body' ? '🧒' : SLOT_ICON[t]}</b>${TAB_NAME[t]}`;
    b.onclick = () => { tab = t; tryOn = {}; sel = null; refresh(); };
    $('shopTabs').appendChild(b);
  });
  drawGrid(); drawBar();
}

function drawGrid(){
  const g = $('shopGrid'); g.innerHTML = '';
  const cell = (cls, icon, word, status, fn) => {
    const b = document.createElement('button');
    b.className = 'sp-cell ' + cls;
    b.innerHTML = `<span class="ci">${icon}</span><span class="cw">${word}</span><span class="cs">${status}</span>`;
    b.onclick = fn; g.appendChild(b);
  };
  if (tab === 'body'){
    BODIES.forEach(b => cell(S.avatar.body === b.id ? 'worn sel' : '', b.icon, '', S.avatar.body === b.id ? '선택됨' : '무료', () => {
      if (Avatar.setBody(b.id)){ sfxGood(); refresh(); }
    }));
    return;
  }
  ITEMS.filter(i => i.slot === tab).forEach(it => {
    const owned = Avatar.owns(it.id), worn = S.avatar.equip[it.slot] === it.id, open = Avatar.isUnlocked(it);
    const status = worn ? '착용중' : owned ? '보유' : open ? `🪙${it.price}` : `🔒${UNLOCK_ICON(it.unlock)}`;
    cell((worn ? 'worn ' : '') + (!owned && !open ? 'lock ' : '') + (sel === it.id ? 'sel' : ''), it.icon, it.word, status, () => pick(it));
  });
}

function pick(it){
  sel = it.id; tryOn = {[it.slot]: it.id};
  speak(it.word); refresh();
}

function drawBar(){
  const bar = $('shopBar'); bar.innerHTML = '';
  const it = sel && find(sel);
  const note = t => { bar.innerHTML = `<span class="hint">${t}</span>`; };
  if (tab === 'body') return note('마음에 드는 모습을 눌러요!');
  if (!it) return note('아이템을 눌러서 입어 봐요!');
  const btn = (label, cls, fn, dis) => {
    const b = document.createElement('button');
    b.className = 'btn ' + cls; b.textContent = label; b.disabled = !!dis;
    if (!dis) b.onclick = fn; bar.appendChild(b);
  };
  if (Avatar.owns(it.id)){
    if (S.avatar.equip[it.slot] === it.id) btn('벗기', 'gray', () => act(() => { delete tryOn[it.slot]; Avatar.unequip(it.slot); }));
    else btn('입기', 'green', () => act(() => { delete tryOn[it.slot]; Avatar.equip(it.id); sfxGood(); }));
    return;
  }
  const r = Avatar.canBuy(it.id);
  if (r.ok) btn(`🪙 ${r.price} 사기`, 'blue', () => doBuy(it));
  else if (r.reason === 'locked') btn(`🔒 ${Avatar.lockText(it)}`, 'gray', null, true);
  else if (r.reason === 'coins') btn(`코인이 ${r.need}개 더 필요해요`, 'gray', null, true);
}

// 액션 직후 연타로 다른 버튼(예: 사자마자 벗기)이 눌리지 않게 잠깐 막아요
function act(fn){
  if (busy) return;
  busy = true; setTimeout(() => busy = false, 500);
  fn(); refresh();
}

// 구매 흐름 한 곳 (Task 5 에서 퀴즈를 끼워 넣을 자리)
function doBuy(it){
  act(() => {
    const r = Avatar.buy(it.id);
    if (!r.ok) return;
    delete tryOn[it.slot]; Avatar.equip(it.id);
    sfxGood(); toast(`${it.icon} ${it.word} 샀어요!`);
  });
}

function open(t = 'hat'){
  tab = TABS.includes(t) ? t : 'hat'; tryOn = {}; sel = null; busy = false;
  refresh(); show('shop');
}
function leave(){ tryOn = {}; sel = null; renderMap(); }
sBtn.onclick = () => open('hat');
$('shopBack').onclick = leave;

window.Shop = {open};
})();
