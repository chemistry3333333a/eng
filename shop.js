/* =====================================================================
   워드 아일랜드 · 상점 화면
   - section#shop 과 지도 하단 버튼을 스스로 주입해요 (boss.js 와 같은 방식)
   - 아이템을 누르면 미리보기(피팅)만 바뀌고, 사야 내 것이 돼요
   ===================================================================== */
(() => {
const BASE_TABS = ['hat','face','hand','back','effect','body'];
const tabs = () => (cur === 'eng' && Avatar.deal() ? ['deal'] : []).concat(BASE_TABS);   // 특가가 없으면 특가 탭을 숨겨요
const TAB_NAME = {deal:'특가', hat:'모자', face:'얼굴', hand:'손', back:'등', effect:'효과', body:'몸'};
const UNLOCK_ICON = u => u.level ? '⭐' : (u.trophies || u.mathTrophies) ? '🏆' : '📚';

const css = `
#shop{align-items:center;gap:8px;overflow:hidden;}
#shop .sp-top{display:flex;align-items:center;gap:10px;width:100%;max-width:640px;}
#shop .sp-top h2{margin:0;font-size:30px;flex:1;}
#shop .sp-cur{display:flex;gap:6px;width:100%;max-width:640px;}
#shop .sp-cur button{flex:1;border:0;border-radius:16px;padding:6px 4px;background:#fff;font-size:16px;box-shadow:0 3px 0 rgba(0,0,0,.1);}
#shop .sp-cur button.on{background:#8b5cf6;color:#fff;box-shadow:0 3px 0 #6d28d9;}
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
#shop .sp-cell{position:relative;}
#shop .sp-cell s{color:#94a3b8;margin-right:4px;}
#shop .sp-cell .badge{position:absolute;top:-6px;right:-4px;background:#ef4444;color:#fff;font-size:13px;font-weight:bold;border-radius:10px;padding:2px 6px;}
#shop .sp-cell.sel{border-color:#f97316;}
#shop .sp-cell.lock{opacity:.6;}
#shop .sp-cell.worn{background:#dcfce7;}
#shop .sp-bar{flex:none;width:100%;max-width:640px;min-height:76px;display:flex;align-items:center;justify-content:center;gap:10px;}
#shop .sp-bar .btn{flex:1;max-width:420px;font-size:22px;padding:14px 12px;}
#shop .sp-bar .btn:disabled{opacity:.55;box-shadow:none;transform:none;}
#shop .sp-bar .hint{font-size:20px;color:#475569;}
/* 가로 폰(낮은 화면): 미리보기를 줄여 아이템 칸에 자리를 줘요 */
@media (max-height:500px){
#shop{gap:4px;padding:6px 16px;}
#shop .sp-cur button{padding:2px 4px;font-size:13px;}
#shop .sp-top h2{font-size:22px;}
#shop .sp-top .icon{width:40px;height:40px;font-size:20px;}
#shop .sp-prev{height:84px;border-radius:20px;}
#shop .sp-prev .av-l{font-size:60px;}
#shop .sp-tab{padding:3px 2px;font-size:13px;}
#shop .sp-tab b{font-size:18px;}
#shop .sp-bar{min-height:44px;}
#shop .sp-bar .btn{font-size:18px;padding:6px 12px;}
}
#shopModal .row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
#shopModal .pv{height:150px;display:flex;align-items:center;justify-content:center;}
#shopModal .opt{border:3px solid transparent;border-radius:20px;background:#f1f5f9;padding:8px 14px;box-shadow:0 4px 0 rgba(0,0,0,.1);font-size:48px;line-height:1.2;}
#shopModal .opt small{display:block;font-size:15px;color:#475569;}
#shopModal .opt.sel{border-color:#f97316;background:#fff7ed;}
#shopModal .opt.mq{font-size:34px;padding:10px 18px;}
#shopModal .opt.big{font-size:64px;padding:12px 22px;}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

const sec = document.createElement('section');
sec.id = 'shop'; sec.className = 'screen';
sec.innerHTML = `<div class="sp-top"><button class="icon" id="shopBack">⬅️</button><h2>🛍️ 상점</h2><div class="pill" id="shopCoin"></div></div>
  <div class="sp-cur" id="shopCur"></div>
  <div class="sp-prev" id="shopPrev"></div>
  <div class="sp-tabs" id="shopTabs"></div>
  <div class="sp-grid" id="shopGrid"></div>
  <div class="sp-bar" id="shopBar"></div>`;
document.body.appendChild(sec);

// 모달 하나를 돌려써요 (첫 방문 · 영어로 주문하기)
const mod = document.createElement('div');
mod.className = 'modal'; mod.id = 'shopModal';
mod.innerHTML = '<div class="panel" id="shopPanel"></div>';
document.body.appendChild(mod);
mod.onclick = e => { if (e.target === mod) closeModal(); };   // 바깥을 누르면 닫혀요
function closeModal(){ mod.classList.remove('on'); $('shopPanel').innerHTML = ''; }
function showModal(build){ const p = $('shopPanel'); p.innerHTML = ''; build(p); mod.classList.add('on'); }
function mk(parent, tag, cls, html, fn){
  const e = document.createElement(tag); e.className = cls || ''; e.innerHTML = html || '';
  if (fn) e.onclick = fn; parent.appendChild(e); return e;
}

const sBtn = document.createElement('button');
sBtn.className = 'btn small'; sBtn.id = 'shopBtn'; sBtn.textContent = '🛍️ 상점';
sBtn.style.cssText = 'background:#ec4899;box-shadow:0 6px 0 #be185d';
$('setBtn').before(sBtn);

/* ---------- 상태 ---------- */
let cur = 'eng', tab = 'hat', tryOn = {}, sel = null, busy = false;
const find = id => Avatar.item(id);
const curOf = it => it.cur === 'math' ? 'math' : 'eng';
const coinIcon = c => c === 'math' ? '💎' : '🪙';

function refresh(){
  $('shopCoin').textContent = cur === 'math' ? `💎 ${S.math.coins}` : `🪙 ${S.coins}`;
  $('shopCur').innerHTML = '';
  [['eng','🔤 영어 상점'],['math','🔢 수학 상점']].forEach(([c, name]) => {
    const b = document.createElement('button');
    b.className = c === cur ? 'on' : ''; b.textContent = name;
    b.onclick = () => { if (c === cur) return; cur = c; tab = 'hat'; tryOn = {}; sel = null; closeModal(); refresh(); };
    $('shopCur').appendChild(b);
  });
  Avatar.render($('shopPrev'), {size:'l', pet:true, preview:tryOn});
  if (tab === 'deal' && !tabs().includes('deal')) tab = 'hat';
  $('shopTabs').innerHTML = '';
  tabs().forEach(t => {
    const b = document.createElement('button');
    b.className = 'sp-tab' + (t === tab ? ' on' : '');
    b.innerHTML = `<b>${t === 'body' ? '🧒' : t === 'deal' ? '🏷️' : SLOT_ICON[t]}</b>${TAB_NAME[t]}`;
    b.onclick = () => { tab = t; tryOn = {}; sel = null; refresh(); };
    $('shopTabs').appendChild(b);
  });
  drawGrid(); drawBar();
}

function drawGrid(){
  const g = $('shopGrid'); g.innerHTML = '';
  const cell = (cls, icon, word, status, fn, badge) => {
    const b = document.createElement('button');
    b.className = 'sp-cell ' + cls;
    b.innerHTML = `${badge ? '<span class="badge">-30%</span>' : ''}<span class="ci">${icon}</span><span class="cw">${word}</span><span class="cs">${status}</span>`;
    b.onclick = fn; g.appendChild(b);
  };
  if (tab === 'body'){
    BODIES.forEach(b => cell(S.avatar.body === b.id ? 'worn sel' : '', b.icon, '', S.avatar.body === b.id ? '선택됨' : '무료', () => {
      if (Avatar.setBody(b.id)){ sfxGood(); refresh(); }
    }));
    return;
  }
  const d = cur === 'eng' ? Avatar.deal() : null;
  ITEMS.filter(i => curOf(i) === cur && (tab === 'deal' ? d && i.id === d.id : i.slot === tab)).forEach(it => {
    const owned = Avatar.owns(it.id), worn = S.avatar.equip[it.slot] === it.id, open = Avatar.isUnlocked(it);
    const isDeal = !!d && d.id === it.id && !owned;
    const ic = coinIcon(cur);
    const price = isDeal ? `<s>${ic}${it.price}</s>${ic}${d.price}` : `${ic}${it.price}`;
    const status = worn ? '착용중' : owned ? '보유' : open ? price : `🔒${UNLOCK_ICON(it.unlock)}`;
    cell((worn ? 'worn ' : '') + (!owned && !open ? 'lock ' : '') + (sel === it.id ? 'sel' : ''), it.icon, it.word, status, () => pick(it), isDeal && open);
  });
}

function pick(it){
  sel = it.id; tryOn = {[it.slot]: it.id};
  if (curOf(it) === 'eng') speak(it.word);
  refresh();
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
  if (r.ok) btn(`${coinIcon(curOf(it))} ${r.price} 사기`, 'blue', () => doBuy(it));
  else if (r.reason === 'locked') btn(`🔒 ${Avatar.lockText(it)}`, 'gray', null, true);
  else if (r.reason === 'coins') btn(`${curOf(it) === 'math' ? '💎' : '코인'}이 ${r.need}개 더 필요해요`, 'gray', null, true);
}

// 액션 직후 연타로 다른 버튼(예: 사자마자 벗기)이 눌리지 않게 잠깐 막아요
function act(fn){
  if (busy) return;
  busy = true; setTimeout(() => busy = false, 500);
  fn(); refresh();
}

// 구매 흐름: 특가는 바로 사고, 그 밖에는 "영어로 주문하기" 모달을 먼저 띄워요
function doBuy(it){
  const d = Avatar.deal();
  if (curOf(it) === 'eng' && d && d.id === it.id) return act(() => finishBuy(it));
  if (curOf(it) === 'math') return mathOffer(it);
  quizOffer(it);
}
// 실제로 사는 곳 (Avatar.buy 는 여기서만, 확정 한 번에 한 번만 불러요)
function finishBuy(it, opts){
  const r = Avatar.buy(it.id, opts);
  if (!r.ok) return false;
  delete tryOn[it.slot]; Avatar.equip(it.id);
  if (tab === 'deal') tab = it.slot;   // 특가를 샀으면 특가가 새로 뽑히니 그 칸이 있던 탭으로
  sfxGood(); toast(`${it.icon} ${it.word} 샀어요!`);
  return true;
}
// 모달 안에서 사기: 모달을 먼저 닫아 버튼을 없애고(중복 방지), 연타 방지 시간도 걸어요
function modalBuy(it, opts){
  closeModal();
  busy = true; setTimeout(() => busy = false, 500);
  finishBuy(it, opts); refresh();
}
const shuffle = a => { for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function quizOffer(it){
  const q = Avatar.priceOf(it.id, {quiz:true});
  showModal(p => {
    mk(p, 'h2', '', '영어로 주문하면 10% 할인! 🗣️');
    mk(p, 'p', '', `${it.icon} 🪙${it.price} → 🪙${q}`);
    const row = mk(p, 'div', 'row');
    mk(row, 'button', 'btn green small', '도전하기', () => quiz(it));
    mk(row, 'button', 'btn gray small', '그냥 살래요', () => {
      if (Avatar.canBuy(it.id).ok) modalBuy(it); else { closeModal(); toast('코인이 모자라요'); }
    });
  });
}
function mathOffer(it){
  const q = Avatar.priceOf(it.id, {quiz:true});
  showModal(p => {
    mk(p, 'h2', '', '계산 문제 맞히면 10% 할인! 🧮');
    mk(p, 'p', '', `${it.icon} 💎${it.price} → 💎${q}`);
    const row = mk(p, 'div', 'row');
    mk(row, 'button', 'btn green small', '도전하기', () => mathQuiz(it));
    mk(row, 'button', 'btn gray small', '그냥 살래요', () => {
      if (Avatar.canBuy(it.id).ok) modalBuy(it); else { closeModal(); toast('💎이 모자라요'); }
    });
  });
}
function mathQuiz(it){
  // 쉬운 문제: 열린 챕터의 첫 스테이지에서만
  const open = MATH_STAGES.filter((s, i) => (i === 0 || MATH_STAGES[i-1].ch !== s.ch) && MathStages.unlocked(S, s.id));
  const st = open[Math.floor(Math.random() * open.length)] || MATH_STAGES[0];
  const prob = MathStages.gen(st.id), opts = MathStages.options(prob, 3);
  let done = false, done2 = false;
  showModal(p => {
    mk(p, 'h2', '', '계산해 봐요! 🧮');
    mk(p, 'p', '', MathCore.problemHtml(prob)).style.fontSize = '36px';
    const row = mk(p, 'div', 'row');
    opts.forEach(o => mk(row, 'button', 'opt mq', MathCore.html(o), () => {
      if (done) return; done = true;
      if (MathCore.same(o, prob.ans)){ sfxGood(); modalBuy(it, {quiz:true}); return; }
      sfxBad();
      showModal(p2 => {
        mk(p2, 'h2', '', '괜찮아요!');
        mk(p2, 'p', '', `정답은 ${MathCore.html(prob.ans)}`);
        const r2 = mk(p2, 'div', 'row');
        const full = Avatar.canBuy(it.id);
        if (full.ok) mk(r2, 'button', 'btn blue small', `💎 ${full.price} 사기`, () => { if (!done2){ done2 = true; modalBuy(it); } });
        else if (full.reason === 'coins') mk(p2, 'p', '', `💎이 ${full.need}개 더 필요해요`);
        mk(r2, 'button', 'btn gray small', '닫기', closeModal);
      });
    }));
  });
}
function quiz(it){
  // 같은 슬롯의 다른 아이템 2개 (같은 그림은 빼고), 모자라면 전체에서 채워요
  const wrong = Avatar.quizWrong(it, shuffle);
  const choices = shuffle([it, ...wrong]);
  let done = false, done2 = false;
  showModal(p => {
    mk(p, 'h2', '', '무슨 뜻일까요? 🔊');
    mk(p, 'button', 'btn blue small', '다시 듣기 🔊', () => speak(it.word));
    const row = mk(p, 'div', 'row');
    choices.forEach(c => mk(row, 'button', 'opt big', c.icon, () => {
      if (done) return; done = true;
      if (c.id === it.id){ sfxGood(); modalBuy(it, {quiz:true}); return; }
      sfxBad();
      showModal(p2 => {
        mk(p2, 'h2', '', '괜찮아요!');
        mk(p2, 'p', '', `정답은 ${it.icon} ${it.word}`);
        const r2 = mk(p2, 'div', 'row');
        const full = Avatar.canBuy(it.id);
        if (full.ok) mk(r2, 'button', 'btn blue small', `🪙 ${full.price} 사기`, () => { if (!done2){ done2 = true; modalBuy(it); } });
        else if (full.reason === 'coins') mk(p2, 'p', '', `코인이 ${full.need}개 더 필요해요`);
        mk(r2, 'button', 'btn gray small', '닫기', closeModal);
      });
    }));
    speak(it.word);
  });
}

// 첫 방문: 몸 고르기 → 선물 (선물을 받아야 끝나요. 중간에 닫으면 다음에 또 떠요)
function bodyModal(){
  let cur = S.avatar.body;
  showModal(p => {
    mk(p, 'h2', '', '나는 누구일까?');
    const pv = mk(p, 'div', 'pv');
    const row = mk(p, 'div', 'row');
    const draw = () => {
      Avatar.render(pv, {size:'l', body:cur});
      row.innerHTML = '';
      BODIES.forEach(b => mk(row, 'button', 'opt' + (b.id === cur ? ' sel' : ''), b.icon, () => { cur = b.id; Avatar.setBody(b.id); sfxGood(); draw(); refresh(); }));
    };
    draw();
    mk(p, 'button', 'btn green small', '다음', giftModal);
  });
}
function giftModal(){
  let pickId = null;
  showModal(p => {
    mk(p, 'h2', '', '🎁 첫 방문 선물! 하나 골라요');
    const pv = mk(p, 'div', 'pv');
    const row = mk(p, 'div', 'row');
    const bar = mk(p, 'div', 'row');
    const draw = () => {
      const it = pickId && find(pickId);
      Avatar.render(pv, {size:'l', preview: it ? {[it.slot]: it.id} : null});
      row.innerHTML = '';
      Avatar.giftChoices().forEach(c => mk(row, 'button', 'opt' + (c.id === pickId ? ' sel' : ''), `${c.icon}<small>${c.word}</small>`, () => { pickId = c.id; speak(c.word); draw(); }));
      bar.innerHTML = '';
      const b = mk(bar, 'button', 'btn green small', '받기', () => {
        if (!pickId || !Avatar.claimGift(pickId)) return;
        const g = find(pickId); closeModal(); sfxWin(); toast(`🎁 ${g.icon} ${g.word} 받았어요!`);
        tab = g.slot; tryOn = {}; sel = null; refresh();
      });
      b.disabled = !pickId;
    };
    draw();
  });
}

function open(t, c){
  cur = c === 'math' || c === 'eng' ? c : (S.mode === 'math' ? 'math' : 'eng');
  if (t === undefined) t = cur === 'eng' && Avatar.deal() ? 'deal' : 'hat';   // 특가가 있으면 특가 탭부터 (영어 상점만)
  tab = tabs().includes(t) ? t : 'hat'; tryOn = {}; sel = null; busy = false;
  closeModal(); refresh(); show('shop');
  if (cur === 'eng' && !S.shop.freeGiven) bodyModal();
}
function leave(){
  closeModal(); tryOn = {}; sel = null;
  if (S.mode === 'math' && window.MathGame) MathGame.map(); else renderMap();
}
sBtn.onclick = () => open();
$('shopBack').onclick = leave;

window.Shop = {open};
})();
