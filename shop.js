/* =====================================================================
   워드 아일랜드 · 상점 화면
   - section#shop 과 지도 하단 버튼을 스스로 주입해요 (boss.js 와 같은 방식)
   - 아이템을 누르면 미리보기(피팅)만 바뀌고, 사야 내 것이 돼요
   ===================================================================== */
(() => {
const BASE_TABS = ['body','hat','face','hand','back','effect','bg','village'];
const tabs = () => (cur === 'eng' && Avatar.deal() ? ['deal'] : []).concat(BASE_TABS);   // 특가가 없으면 특가 탭을 숨겨요
const TAB_NAME = {deal:'특가', body:'캐릭터', hat:'모자', face:'얼굴', hand:'손', back:'등', effect:'효과', bg:'배경', village:'마을'};
const PREVIEW_MOODS = ['smile','wink','wow','star','love','tongue'];   // 미리보기 캐릭터를 누르면 나오는 표정
const UNLOCK_ICON = u => u.level ? '⭐' : (u.trophies || u.mathTrophies) ? '🏆' : '📚';

const css = `
#shop{align-items:center;gap:8px;overflow:hidden;}
#shop .sp-top{display:flex;align-items:center;gap:10px;width:100%;max-width:640px;}
#shop .sp-top h2{margin:0;font-size:30px;flex:1;}
#shop .sp-cur{display:flex;gap:6px;width:100%;max-width:640px;}
#shop .sp-cur button{flex:1;border:0;border-radius:16px;padding:6px 4px;background:#fff;font-size:16px;box-shadow:0 3px 0 rgba(0,0,0,.1);}
#shop .sp-cur button.on{background:#8b5cf6;color:#fff;box-shadow:0 3px 0 #6d28d9;}
#shop .sp-prev{flex:none;height:230px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.7);border-radius:28px;width:100%;max-width:640px;}
#shop .sp-top h2 small{font-size:15px;color:#7c3aed;margin-left:6px;white-space:nowrap;}
#shop .sp-prev{cursor:pointer;}
#shop .sp-tabs{display:flex;gap:6px;width:100%;max-width:640px;overflow-x:auto;padding-bottom:4px;flex:none;}
#shop .sp-tab{flex:1 0 54px;min-width:0;border:0;border-radius:16px;padding:8px 2px;background:#fff;font-size:15px;box-shadow:0 3px 0 rgba(0,0,0,.1);white-space:nowrap;}
#shop .sp-tab b{display:block;font-size:24px;font-weight:normal;}
#shop .sp-tab.on{background:#3b82f6;color:#fff;box-shadow:0 3px 0 #1d4ed8;}
#shop .sp-grid{flex:1;min-height:0;width:100%;max-width:640px;overflow-y:auto;overflow-x:hidden;display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;align-content:start;padding:2px;}
#shop .sp-cell{border:3px solid transparent;border-radius:18px;background:#fff;padding:6px 2px;box-shadow:0 3px 0 rgba(0,0,0,.1);display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0;}
#shop .sp-cell .ci{font-size:38px;line-height:1.1;width:56px;height:56px;display:flex;align-items:center;justify-content:center;}
#shop .sp-cell .ci svg{width:56px;height:56px;}
#shop .sp-cell.legend{border-color:#f5c542;background:#fffbea;}
#shop .sp-cell.legend::after{content:'✨ 전설';position:absolute;top:-7px;left:-4px;background:#f5c542;color:#7a5200;font-size:12px;font-weight:bold;border-radius:10px;padding:1px 6px;}
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
/* 마을 탭: 장터 가판대 (줄무늬 차양 아래 진열대 + 나무 선반 + 매단 가격표) */
#shop.vill .sp-prev{position:relative;overflow:hidden;align-items:stretch;justify-content:flex-start;gap:8px;padding:30px 16px 0;
  background:#9fd8ff;border-radius:26px 26px 6px 6px;border-bottom:14px solid #8a5a34;box-shadow:inset 0 -5px 0 #b07b4a;}
#shop.vill .sp-prev::before{content:'';position:absolute;left:0;right:0;top:0;height:22px;
  background:repeating-linear-gradient(90deg,#e5484d 0 36px,#fff 36px 72px);}
#shop.vill .sp-prev::after{content:'';position:absolute;left:0;right:0;top:22px;height:12px;
  background:radial-gradient(circle at 18px 0,#e5484d 17px,transparent 18px) 0 0/72px 12px,
             radial-gradient(circle at 54px 0,#fff 17px,transparent 18px) 0 0/72px 12px;}
#shop .vs-stage{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;}
#shop .vs-emo{font-size:90px;}
#shop .vs-ptag{flex:none;align-self:center;position:relative;width:168px;background:#fff6d8;border-radius:6px 22px 22px 6px;
  padding:10px 12px 10px 24px;box-shadow:0 4px 0 #c9a35e;transform:rotate(3deg);transform-origin:10px 50%;text-align:left;}
#shop .vs-ptag::before{content:'';position:absolute;left:9px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;
  background:#9fd8ff;box-shadow:inset 0 1px 2px rgba(0,0,0,.3);}
#shop .vs-en{font-size:30px;line-height:1.05;color:#8a5a34;overflow-wrap:anywhere;}
#shop .vs-en span{font-size:17px;margin-left:4px;}
#shop .vs-ko{font-size:17px;margin:3px 0 6px;}
#shop .vs-sz{font-size:14px;color:#6b5a3e;line-height:1.35;}
#shop.vill .sp-bar{margin-top:auto;}
#shop.vill .sp-grid{flex:0 1 auto;display:block;background:#f4d9a8;border-radius:6px 6px 22px 22px;padding:2px 8px 8px;}
#shop .vs-h{margin:8px 4px 0;font-size:17px;font-weight:normal;color:#6b4423;}
#shop .vs-shelf{--pk:72px;--row:124px;display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));grid-auto-rows:var(--row);column-gap:6px;
  background:repeating-linear-gradient(to bottom,transparent 0 var(--pk),#a86f3d var(--pk) calc(var(--pk) + 10px),
    rgba(107,68,35,.25) calc(var(--pk) + 10px) calc(var(--pk) + 14px),transparent calc(var(--pk) + 14px) var(--row));}
#shop .vs-it{border:0;background:none;padding:0;min-width:0;display:flex;flex-direction:column;align-items:center;}
#shop .vs-pic{height:var(--pk);width:66px;display:flex;align-items:flex-end;justify-content:center;font-size:40px;line-height:1;}
#shop .vs-pic img{display:block;width:64px !important;height:64px !important;}
#shop .vs-tag{position:relative;margin-top:22px;font-size:14px;background:#fff;border-radius:8px;padding:2px 7px;white-space:nowrap;box-shadow:0 2px 0 #d6b98a;}
#shop .vs-tag::before{content:'';position:absolute;left:50%;top:-12px;height:12px;border-left:2px solid #6b4423;}
#shop .vs-nm{font-size:13px;margin-top:3px;color:#6b4423;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#shop .vs-it.own .vs-tag{background:#3fae5a;color:#fff;box-shadow:0 2px 0 #2b7d3f;}
#shop .vs-it.lock .vs-pic{filter:grayscale(.9) brightness(1.1);opacity:.55;}
#shop .vs-it.lock .vs-tag{background:#e8e1d3;color:#6b5a3e;}
#shop .vs-it.gift .vs-tag{background:#ffe1f0;color:#b0306a;box-shadow:0 2px 0 #f4a8cb;}
#shop .vs-it.legend .vs-nm{color:#a16207;}
#shop .vs-it.sel .vs-pic{animation:vsBob .9s ease-in-out infinite alternate;}
#shop .vs-it.sel .vs-tag{outline:3px solid #e5484d;}
#shop .vs-it:focus-visible{outline:3px solid #1d4ed8;outline-offset:2px;border-radius:10px;}
@keyframes vsBob{to{transform:translateY(-6px);}}
@media (prefers-reduced-motion:reduce){#shop .vs-it.sel .vs-pic{animation:none;}}
#shop.vill .sp-bar .btn.blue{background:#e5484d;box-shadow:0 6px 0 #9b2c31;}
@media (max-height:500px){
#shop.vill .sp-prev{padding-top:16px;border-bottom-width:8px;}
#shop.vill .sp-prev::before{height:10px;}
#shop.vill .sp-prev::after{top:10px;height:6px;}
#shop .vs-emo{font-size:44px;}
#shop .vs-ptag{width:auto;padding:4px 10px 4px 20px;display:flex;align-items:baseline;gap:8px;transform:none;}
#shop .vs-ptag::before{left:7px;}
#shop .vs-en{font-size:22px;}
#shop .vs-ko{margin:0;font-size:15px;}
#shop .vs-sz{display:none;}
#shop .vs-shelf{--pk:52px;--row:92px;}
#shop .vs-pic img{width:48px !important;height:48px !important;}
#shop .vs-tag{margin-top:16px;font-size:12px;}
#shop .vs-tag::before{top:-10px;height:10px;}
#shop .vs-nm{display:none;}
}
#shopModal .row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
#shopModal .pv{height:150px;display:flex;align-items:center;justify-content:center;}
#shopModal .opt{border:3px solid transparent;border-radius:20px;background:#f1f5f9;padding:8px 14px;box-shadow:0 4px 0 rgba(0,0,0,.1);font-size:48px;line-height:1.2;}
#shopModal .opt small{display:block;font-size:15px;color:#475569;}
#shopModal .opt.sel{border-color:#f97316;background:#fff7ed;}
#shopModal .opt.mq{font-size:34px;padding:10px 18px;}
#shopModal .opt.big{font-size:64px;padding:12px 22px;}
#shopModal .opt svg{display:block;width:64px;height:64px;margin:0 auto;}
#shopModal .opt.big svg{width:84px;height:84px;}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

const sec = document.createElement('section');
sec.id = 'shop'; sec.className = 'screen';
sec.innerHTML = `<div class="sp-top"><button class="icon" id="shopBack">⬅️</button><h2>🛍️ 상점<small id="shopCol"></small></h2><div class="pill" id="shopCoin"></div></div>
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
let cur = 'eng', tab = 'body', tryOn = {}, tryBody = null, sel = null, busy = false, moodNext = null;
const find = id => Avatar.item(id);
const nameOf = it => it.kind ? it.name : it.slot === 'body' ? it.name : it.word;
// 마을 장식(kind 가 있음)은 Village, 나머지는 Avatar 가 값·사기를 맡아요 (같은 이름의 함수)
const isD = it => !!(it && it.kind);
const A = it => isD(it) ? Village : Avatar;
let vthumbs = {}, spin = null, spinId = null;
const dthumb = d => vthumbs[d.id] ? `<img src="${vthumbs[d.id]}" alt="" style="width:100%;height:100%">` : d.icon;
const thumbOf = it => isD(it) ? dthumb(it) : Avatar.thumb(it.id);
function stopSpin(){ if (spin){ spin.then(s => s && s.dispose()); spin = null; } spinId = null; }
// 마을 탭: 3D 를 불러와 장식 그림을 만들어요 (못 불러오면 이모지 그대로)
function loadDecorThumbs(){
  if (Object.keys(vthumbs).length || !window.VillageScreen) return;
  VillageScreen.load3d().then(m => m.thumbs(DECOR.map(d => d.id))).then(t => { vthumbs = t; if (tab === 'village') refresh(); }).catch(() => {});
}
const curOf = it => it.cur === 'math' ? 'math' : 'eng';
const coinIcon = c => c === 'math' ? '💎' : '🪙';

function refresh(){
  $('shopCoin').textContent = cur === 'math' ? `💎 ${S.math.coins}` : `🪙 ${S.coins}`;
  $('shopCur').innerHTML = '';
  [['eng','🔤 영어 상점'],['math','🔢 수학 상점']].forEach(([c, name]) => {
    const b = document.createElement('button');
    b.className = c === cur ? 'on' : ''; b.textContent = name;
    b.onclick = () => { if (c === cur) return; cur = c; tab = 'body'; tryOn = {}; tryBody = null; sel = null; closeModal(); refresh(); };
    $('shopCur').appendChild(b);
  });
  const col = Avatar.collection();
  $('shopCol').textContent = `캐릭터 ${col.have}/${col.total}`;
  sec.classList.toggle('vill', tab === 'village');
  if (tab === 'village') drawDecorPreview();
  else {
    stopSpin();
    Avatar.render($('shopPrev'), {size:'l', pet:true, preview:tryOn, body:tryBody});
    if (moodNext){ Avatar.react($('shopPrev'), moodNext); moodNext = null; }   // 입어 보기·사기 반응
  }
  if (tab === 'deal' && !tabs().includes('deal')) tab = 'body';
  $('shopTabs').innerHTML = '';
  tabs().forEach(t => {
    const b = document.createElement('button');
    b.className = 'sp-tab' + (t === tab ? ' on' : '');
    b.innerHTML = `<b>${t === 'body' ? '🧒' : t === 'deal' ? '🏷️' : t === 'village' ? '🏡' : SLOT_ICON[t]}</b>${TAB_NAME[t]}`;
    b.onclick = () => { tab = t; tryOn = {}; tryBody = null; sel = null; refresh(); };
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
  const ic = coinIcon(cur);
  if (tab === 'village'){
    loadDecorThumbs();
    const list = Village.list(cur);
    [['building', '집과 건물'], ['decor', '꾸미기']].forEach(([kind, title]) => {
      const row = list.filter(d => d.kind === kind);
      if (!row.length) return;
      mk(g, 'h3', 'vs-h', title);
      const shelf = mk(g, 'div', 'vs-shelf');
      row.forEach(d => {
        const [c, t] = decorTag(d);
        const b = mk(shelf, 'button', `vs-it ${c}${d.legend ? ' legend' : ''}${sel === d.id ? ' sel' : ''}`,
          `<span class="vs-pic">${dthumb(d)}</span><span class="vs-tag">${t}</span><span class="vs-nm">${d.name}</span>`, () => pickDecor(d));
        b.setAttribute('aria-label', `${d.name} ${t}`);
      });
    });
    return;
  }
  if (tab === 'body'){
    BODIES.filter(b => curOf(b) === cur).forEach(b => {
      const it = find(b.id), owned = Avatar.owns(b.id), worn = S.avatar.body === b.id, open = Avatar.isUnlocked(it);
      const status = worn ? '선택됨' : owned ? '보유' : open ? `${ic}${b.price}` : `🔒${UNLOCK_ICON(b.unlock)}`;
      cell((worn ? 'worn ' : '') + (!owned && !open ? 'lock ' : '') + (b.legend ? 'legend ' : '') + (sel === b.id ? 'sel' : ''),
        Avatar.thumb(b.id), b.name, status, () => pick(it));
    });
    return;
  }
  const d = cur === 'eng' ? Avatar.deal() : null;
  ITEMS.filter(i => curOf(i) === cur && (tab === 'deal' ? d && i.id === d.id : i.slot === tab)).forEach(it => {
    const owned = Avatar.owns(it.id), worn = S.avatar.equip[it.slot] === it.id, open = Avatar.isUnlocked(it);
    const isDeal = !!d && d.id === it.id && !owned;
    const price = isDeal ? `<s>${ic}${it.price}</s>${ic}${d.price}` : `${ic}${it.price}`;
    const status = worn ? '착용중' : owned ? '보유' : open ? price : `🔒${UNLOCK_ICON(it.unlock)}`;
    cell((worn ? 'worn ' : '') + (!owned && !open ? 'lock ' : '') + (sel === it.id ? 'sel' : ''), Avatar.thumb(it.id), it.word, status, () => pick(it), isDeal && open);
  });
}

// 누르면 미리보기만 바뀌어요 (캐릭터는 몸을, 아이템은 그 칸을 입어 봐요)
function pick(it){
  sel = it.id;
  if (it.slot === 'body'){ tryBody = it.id; tryOn = {}; } else { tryOn = {[it.slot]: it.id}; tryBody = null; }
  if (curOf(it) === 'eng') speak(it.word);
  moodNext = 'wink';
  refresh();
}

function pickDecor(d){
  sel = d.id;
  if (d.cur === 'eng') speak(d.word);
  refresh();
}
// 선반 가격표: [모양, 글자] — 보유(초록) · 선물(분홍) · 잠김(회색) · 살 수 있음(흰색)
const lockShort = u => u.level ? `Lv${u.level}` : u.trophies ? `🏆${u.trophies}` : u.mathTrophies ? `🏆${u.mathTrophies}` : `📚${u.dex}`;
function decorTag(d){
  const n = Village.owned(d.id), ic = coinIcon(d.cur);
  if (d.price == null) return n ? ['own', n > 1 ? `${n}개` : '내 거'] : ['gift', '🎁 선물'];
  if (!n && !Village.isUnlocked(d)) return ['lock', `🔒 ${lockShort(d.unlock)}`];
  if (n && !d.stack) return ['own', '내 거'];
  return n ? ['own', `${n}개 · ${ic}${d.price}`] : ['', `${ic} ${d.price}`];
}
// 진열대 가격표 아랫줄: 지금 이 장식이 어떤 상태인지 말로 알려 줘요
function decorStatus(d){
  const n = Village.owned(d.id);
  if (d.price == null) return n ? `${n}개 가지고 있어요` : `${Village.giftText(d)}로 받아요`;
  if (!n && !Village.isUnlocked(d)) return `🔒 ${Village.lockText(d)}`;
  if (n && !d.stack) return '이미 가지고 있어요';
  return n ? `${n}개 있어요 · 더 살 수 있어요` : `${coinIcon(d.cur)} ${d.price}`;
}
// 마을 탭 미리보기: 진열대에서 고른 장식이 3D 로 돌고, 옆에 가격표가 매달려요
function drawDecorPreview(){
  const el = $('shopPrev');
  let stage = el.querySelector('.vs-stage');
  if (!stage){ stopSpin(); el.innerHTML = '<div class="vs-stage"></div><div class="vs-ptag"></div>'; stage = el.querySelector('.vs-stage'); }
  const ptag = el.querySelector('.vs-ptag');
  if (!sel){ stopSpin(); stage.innerHTML = '<span class="vs-emo">🏡</span>'; ptag.innerHTML = '<div class="vs-ko">장식을 눌러서 구경해요</div>'; return; }
  const d = Village.item(sel);
  ptag.innerHTML = `<div class="vs-en">${d.word}${d.cur === 'eng' ? '<span aria-hidden="true">🔊</span>' : ''}</div><div class="vs-ko">${d.name}</div><div class="vs-sz">땅 ${d.w}×${d.d}칸<br>${decorStatus(d)}</div>`;
  if (spinId === sel) return;
  stopSpin(); spinId = sel;
  stage.innerHTML = `<span class="vs-emo">${d.icon}</span>`;
  if (!window.VillageScreen) return;
  const id = sel;
  spin = VillageScreen.load3d().then(m => spinId === id ? m.spinPreview(stage, id) : null).catch(() => null);
}
function villageBar(bar){
  const go = document.createElement('button');
  go.className = 'btn green'; go.textContent = '🏡 마을 꾸미러 가기';
  go.onclick = () => { stopSpin(); closeModal(); VillageScreen.open('shop'); };
  bar.appendChild(go);
}

function drawBar(){
  const bar = $('shopBar'); bar.innerHTML = '';
  const note = t => { bar.innerHTML = `<span class="hint">${t}</span>`; };
  if (tab === 'village'){
    const d = sel && Village.item(sel);
    const r = d && Village.canBuy(d.id);
    if (d && r.ok){
      const b = document.createElement('button'); b.className = 'btn blue'; b.textContent = `${coinIcon(d.cur)} ${r.price} 사기`;
      b.onclick = () => doBuy(d); bar.appendChild(b);
    } else if (d && r.reason === 'coins'){
      const b = document.createElement('button'); b.className = 'btn gray'; b.disabled = true;
      b.textContent = `${d.cur === 'math' ? '💎' : '코인'}이 ${r.need}개 더 필요해요`; bar.appendChild(b);
    } else if (d && r.reason === 'locked'){
      const b = document.createElement('button'); b.className = 'btn gray'; b.disabled = true; b.textContent = `🔒 ${Village.lockText(d)}`; bar.appendChild(b);
    } else if (d && r.reason === 'giftOnly' && !Village.owned(d.id)){
      const b = document.createElement('button'); b.className = 'btn gray'; b.disabled = true; b.textContent = `🎁 ${Village.giftText(d)}`; bar.appendChild(b);
    }
    villageBar(bar);
    return;
  }
  const it = sel && find(sel);
  if (!it) return note(tab === 'body' ? '캐릭터를 눌러서 만나 봐요!' : '아이템을 눌러서 입어 봐요!');
  const btn = (label, cls, fn, dis) => {
    const b = document.createElement('button');
    b.className = 'btn ' + cls; b.textContent = label; b.disabled = !!dis;
    if (!dis) b.onclick = fn; bar.appendChild(b);
  };
  if (Avatar.owns(it.id) && it.slot === 'body'){
    if (S.avatar.body === it.id) btn('지금 이 캐릭터예요', 'gray', null, true);
    else btn('이 캐릭터로 바꾸기', 'green', () => act(() => { tryBody = null; Avatar.setBody(it.id); moodNext = 'love'; sfxGood(); }));
    return;
  }
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
  const d = isD(it) ? null : Avatar.deal();   // 특가는 장식에 안 걸어요
  if (curOf(it) === 'eng' && d && d.id === it.id) return act(() => finishBuy(it));
  if (curOf(it) === 'math') return mathOffer(it);
  quizOffer(it);
}
// 실제로 사는 곳 (Avatar.buy 는 여기서만, 확정 한 번에 한 번만 불러요)
function finishBuy(it, opts){
  if (isD(it)){
    const r = Village.buy(it.id, opts);
    if (!r.ok) return false;
    sfxGood(); toast(`${it.icon} ${it.name} 샀어요! 마을 가방에 들어갔어요`);
    return true;
  }
  const r = Avatar.buy(it.id, opts);
  if (!r.ok) return false;
  if (it.slot === 'body'){ tryBody = null; Avatar.setBody(it.id); }
  else { delete tryOn[it.slot]; Avatar.equip(it.id); }
  if (tab === 'deal') tab = it.slot;   // 특가를 샀으면 특가가 새로 뽑히니 그 칸이 있던 탭으로
  moodNext = 'love';
  sfxGood(); toast(`${it.icon} ${nameOf(it)} ${it.slot === 'body' ? '만났어요' : '샀어요'}!`);
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
  const q = A(it).priceOf(it.id, {quiz:true});
  showModal(p => {
    mk(p, 'h2', '', '영어로 주문하면 10% 할인! 🗣️');
    mk(p, 'p', '', `${it.icon} 🪙${it.price} → 🪙${q}`);
    const row = mk(p, 'div', 'row');
    mk(row, 'button', 'btn green small', '도전하기', () => quiz(it));
    mk(row, 'button', 'btn gray small', '그냥 살래요', () => {
      if (A(it).canBuy(it.id).ok) modalBuy(it); else { closeModal(); toast('코인이 모자라요'); }
    });
  });
}
function mathOffer(it){
  const q = A(it).priceOf(it.id, {quiz:true});
  showModal(p => {
    mk(p, 'h2', '', '계산 문제 맞히면 10% 할인! 🧮');
    mk(p, 'p', '', `${it.icon} 💎${it.price} → 💎${q}`);
    const row = mk(p, 'div', 'row');
    mk(row, 'button', 'btn green small', '도전하기', () => mathQuiz(it));
    mk(row, 'button', 'btn gray small', '그냥 살래요', () => {
      if (A(it).canBuy(it.id).ok) modalBuy(it); else { closeModal(); toast('💎이 모자라요'); }
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
        const full = A(it).canBuy(it.id);
        if (full.ok) mk(r2, 'button', 'btn blue small', `💎 ${full.price} 사기`, () => { if (!done2){ done2 = true; modalBuy(it); } });
        else if (full.reason === 'coins') mk(p2, 'p', '', `💎이 ${full.need}개 더 필요해요`);
        mk(r2, 'button', 'btn gray small', '닫기', closeModal);
      });
    }));
  });
}
function quiz(it){
  // 같은 슬롯의 다른 아이템 2개 (같은 그림은 빼고), 모자라면 전체에서 채워요
  const wrong = isD(it) ? shuffle(DECOR.filter(x => x.cur === 'eng' && x.id !== it.id)).slice(0, 2) : Avatar.quizWrong(it, shuffle);
  const choices = shuffle([it, ...wrong]);
  let done = false, done2 = false;
  showModal(p => {
    mk(p, 'h2', '', '무슨 뜻일까요? 🔊');
    mk(p, 'button', 'btn blue small', '다시 듣기 🔊', () => speak(it.word));
    const row = mk(p, 'div', 'row');
    choices.forEach(c => mk(row, 'button', 'opt big', isD(c) ? `<span style="display:block;width:84px;height:84px;font-size:64px">${thumbOf(c)}</span>` : Avatar.thumb(c.id), () => {
      if (done) return; done = true;
      if (c.id === it.id){ sfxGood(); modalBuy(it, {quiz:true}); return; }
      sfxBad();
      showModal(p2 => {
        mk(p2, 'h2', '', '괜찮아요!');
        mk(p2, 'p', '', `정답은 ${it.icon} ${it.word}`);
        const r2 = mk(p2, 'div', 'row');
        const full = A(it).canBuy(it.id);
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
      BODIES.filter(b => b.price === 0).forEach(b => mk(row, 'button', 'opt' + (b.id === cur ? ' sel' : ''), Avatar.thumb(b.id), () => { cur = b.id; Avatar.setBody(b.id); sfxGood(); draw(); refresh(); }));
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
      Avatar.giftChoices().forEach(c => mk(row, 'button', 'opt' + (c.id === pickId ? ' sel' : ''), `${Avatar.thumb(c.id)}<small>${c.word}</small>`, () => { pickId = c.id; speak(c.word); draw(); }));
      bar.innerHTML = '';
      const b = mk(bar, 'button', 'btn green small', '받기', () => {
        if (!pickId || !Avatar.claimGift(pickId)) return;
        const g = find(pickId); closeModal(); sfxWin(); toast(`🎁 ${g.icon} ${g.word} 받았어요!`);
        tab = g.slot; tryOn = {}; tryBody = null; sel = null; refresh();
      });
      b.disabled = !pickId;
    };
    draw();
  });
}

function open(t, c){
  cur = c === 'math' || c === 'eng' ? c : (S.mode === 'math' ? 'math' : 'eng');
  if (t === undefined) t = cur === 'eng' && Avatar.deal() ? 'deal' : 'body';   // 특가가 있으면 특가 탭부터 (영어 상점만)
  tab = tabs().includes(t) ? t : 'body'; tryOn = {}; tryBody = null; sel = null; busy = false;
  closeModal(); refresh(); show('shop');
  if (cur === 'eng' && !S.shop.freeGiven) bodyModal();
  else if (window.Village){
    const g = Village.claimGifts();
    if (g.length) toast(`🎁 마을 선물 ${g.map(x => Village.item(x.id).icon).join('')} 도착! 마을 가방을 열어 봐요`, 2600);
  }
}
function leave(){
  stopSpin(); closeModal(); tryOn = {}; tryBody = null; sel = null;
  if (S.mode === 'math' && window.MathGame) MathGame.map(); else renderMap();
}
sBtn.onclick = () => open();
// 미리보기 캐릭터를 누르면 여러 표정을 보여 줘요
// 마을 탭에서는 고른 장식의 영어 단어를 다시 읽어 줘요
$('shopPrev').onclick = () => tab === 'village' ? (sel && Village.item(sel).cur === 'eng' && speak(Village.item(sel).word)) : Avatar.react($('shopPrev'), PREVIEW_MOODS[Math.floor(Math.random() * PREVIEW_MOODS.length)]);
$('shopBack').onclick = leave;

window.Shop = {open};
})();
