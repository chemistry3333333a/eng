/* =====================================================================
   워드 아일랜드 · 마을 화면
   - section#village 와 지도의 🏡 마을 버튼을 스스로 붙여요 (shop.js 와 같은 방식)
   - 3D 는 village-3d.js 를 처음 열 때 import() 로 불러요
   ===================================================================== */
(() => {
const css = `
#village{padding:0;overflow:hidden;background:linear-gradient(#8ec9f0,#d9eefa 60%,#f6f1e4);}
#village .vg-stage{position:absolute;inset:0;}
#village .vg-stage.night{background:linear-gradient(#141b3d,#3b3870 55%,#8a6a8f);}
#village .vg-stage canvas{display:block;}
#village .vg-top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:8px;
  padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) 0 max(12px,env(safe-area-inset-left));pointer-events:none;}
#village .vg-top>*{pointer-events:auto;}
#village .vg-top h2{margin:0;font-size:24px;background:rgba(255,255,255,.88);padding:6px 14px;border-radius:16px;flex:none;}
#village .vg-sp{flex:1;pointer-events:none;}
#village .vg-hint{position:absolute;left:50%;transform:translateX(-50%);top:calc(max(12px,env(safe-area-inset-top)) + 66px);
  background:rgba(255,255,255,.92);padding:6px 14px;border-radius:14px;font-size:16px;color:#334155;white-space:nowrap;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis;pointer-events:none;}
#village .vg-hint:empty{display:none;}
#village .vg-sel{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(var(--bagH,150px) + 10px);display:flex;gap:8px;align-items:center;
  background:rgba(255,255,255,.95);border-radius:20px;padding:8px 10px;box-shadow:0 4px 0 rgba(0,0,0,.12);max-width:calc(100% - 24px);}
#village .vg-sel:empty{display:none;}
#village .vg-sel b{font-size:18px;padding:0 6px;white-space:nowrap;}
#village .vg-sel button{border:0;border-radius:14px;padding:8px 12px;font-size:16px;background:#f1f5f9;box-shadow:0 3px 0 rgba(0,0,0,.1);white-space:nowrap;}
#village .vg-sel button.on{background:#f59e0b;color:#fff;}
#village .vg-bag{position:absolute;left:0;right:0;bottom:0;background:rgba(255,255,255,.93);border-radius:24px 24px 0 0;
  padding:8px max(12px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));box-shadow:0 -4px 16px rgba(0,0,0,.08);}
#village .vg-tabs{display:flex;gap:6px;margin-bottom:6px;}
#village .vg-tabs button{flex:1;border:0;border-radius:14px;padding:6px 4px;font-size:15px;background:#f1f5f9;}
#village .vg-tabs button.on{background:#3b82f6;color:#fff;}
#village .vg-list{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 4px;min-height:92px;}
#village .vg-it{flex:none;width:80px;border:3px solid transparent;border-radius:16px;background:#fff;box-shadow:0 3px 0 rgba(0,0,0,.1);
  display:flex;flex-direction:column;align-items:center;padding:4px 2px;position:relative;}
#village .vg-it.on{border-color:#f97316;background:#fff7ed;}
#village .vg-it .ci{width:54px;height:54px;display:flex;align-items:center;justify-content:center;font-size:36px;}
#village .vg-it .ci img,#village .vg-it .ci svg{width:54px;height:54px;}
#village .vg-it .cw{font-size:13px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#village .vg-it .n{position:absolute;top:-6px;right:-4px;background:#3b82f6;color:#fff;font-size:12px;font-weight:bold;border-radius:10px;padding:1px 6px;}
#village .vg-empty{color:#64748b;font-size:16px;padding:26px 8px;white-space:nowrap;}
#village .vg-empty button{margin-left:8px;}
#village .vg-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;color:#334155;pointer-events:none;}
@media (max-height:500px){
#village .vg-top h2{font-size:18px;}
#village .vg-top .icon{width:42px;height:42px;font-size:20px;}
#village .vg-hint{top:60px;font-size:14px;}
#village .vg-list{min-height:72px;}
#village .vg-it{width:66px;}
#village .vg-it .ci{width:42px;height:42px;}
#village .vg-it .ci img,#village .vg-it .ci svg{width:42px;height:42px;}
}
#vgModal .row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
#vgModal .gift{background:#f1f5f9;border-radius:18px;padding:8px 12px;min-width:84px;}
#vgModal .gift img{width:64px;height:64px;display:block;margin:0 auto;}
#vgModal .gift .e{font-size:44px;display:block;}
#vgModal .gift small{display:block;font-size:15px;color:#475569;}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

const sec = document.createElement('section');
sec.id = 'village'; sec.className = 'screen';
sec.innerHTML = `<div class="vg-stage" id="vgStage"><div class="vg-load" id="vgLoad">🏝️ 마을을 불러오는 중…</div></div>
  <div class="vg-top"><button class="icon" id="vgBack">⬅️</button><h2>🏡 우리 마을</h2><span class="vg-sp"></span>
    <button class="icon" id="vgShop" title="상점">🛍️</button><button class="icon" id="vgNight" title="낮/밤">🌙</button></div>
  <div class="vg-hint" id="vgHint"></div>
  <div class="vg-sel" id="vgSel"></div>
  <div class="vg-bag" id="vgBag"><div class="vg-tabs" id="vgTabs"></div><div class="vg-list" id="vgList"></div></div>`;
document.body.appendChild(sec);

const mod = document.createElement('div');
mod.className = 'modal'; mod.id = 'vgModal';
mod.innerHTML = '<div class="panel" id="vgPanel"></div>';
document.body.appendChild(mod);
mod.onclick = e => { if (e.target === mod) mod.classList.remove('on'); };

// 지도 버튼: 🛍️ 상점 바로 뒤
const mBtn = document.createElement('button');
mBtn.className = 'btn small'; mBtn.id = 'villageBtn'; mBtn.textContent = '🏡 마을';
mBtn.style.cssText = 'background:#22a06b;box-shadow:0 6px 0 #15803d';
($('shopBtn') || $('setBtn')).after(mBtn);
mBtn.onclick = () => open('map');

/* ---------- 3D 모듈 불러오기 (한 번만) ---------- */
let modP = null;
function load3d(){
  if (!modP) modP = import('./village-3d.js').catch(e => { modP = null; throw e; });
  return modP;
}

/* ---------- 상태 ---------- */
const TABS = [['c', '🧒 캐릭터'], ['building', '🏠 건물'], ['decor', '🌳 장식']];
let from = 'map', tab = 'c', scene = null, mode = null, sel = -1, thumbs = {}, opening = false;
const nameOf = e => e.k === 'c' ? (BODIES.find(b => b.id === e.id) || {}).name : Village.item(e.id).name;
const hint = t => { $('vgHint').textContent = t || ''; };

function drawBag(){
  $('vgTabs').innerHTML = '';
  TABS.forEach(([t, label]) => {
    const b = document.createElement('button'); b.className = t === tab ? 'on' : ''; b.textContent = label;
    b.onclick = () => { tab = t; drawBag(); };
    $('vgTabs').appendChild(b);
  });
  const list = $('vgList'); list.innerHTML = '';
  const items = Village.bag().filter(b => tab === 'c' ? b.k === 'c' : b.k === 'd' && Village.item(b.id).kind === tab);
  if (!items.length){
    list.innerHTML = `<div class="vg-empty">${tab === 'c' ? '모든 캐릭터가 마을에 나와 있어요!' : '가방이 비었어요.'}<button class="btn small blue" id="vgBuy">🛍️ 사러 가기</button></div>`;
    $('vgBuy').onclick = goShop;
  }
  items.forEach(b => {
    const it = document.createElement('button');
    const on = mode && mode.type === 'place' && mode.e.k === b.k && mode.e.id === b.id;
    it.className = 'vg-it' + (on ? ' on' : '');
    const pic = b.k === 'c' ? Avatar.thumb(b.id) : thumbs[b.id] ? `<img src="${thumbs[b.id]}" alt="">` : Village.item(b.id).icon;
    it.innerHTML = `${b.n > 1 ? `<span class="n">${b.n}</span>` : ''}<span class="ci">${pic}</span><span class="cw">${nameOf(b)}</span>`;
    it.onclick = () => startPlace(b);
    list.appendChild(it);
  });
  sec.style.setProperty('--bagH', $('vgBag').offsetHeight + 'px');
}

function drawSel(){
  const box = $('vgSel'); box.innerHTML = '';
  const e = S.village.placed[sel];
  if (!e) return;
  const btn = (label, fn, on) => { const b = document.createElement('button'); b.textContent = label; if (on) b.className = 'on'; b.onclick = fn; box.appendChild(b); };
  const b = document.createElement('b'); b.textContent = nameOf(e); box.appendChild(b);
  if (e.k === 'd') btn('↻ 돌리기', () => { if (Village.rotate(sel)){ scene.sync(); sfxGood(); } else toast('돌리면 다른 것과 겹쳐요'); });
  btn('✋ 옮기기', () => { mode = mode && mode.type === 'move' ? null : {type:'move', i:sel}; hint(mode ? '옮길 곳을 눌러요' : ''); drawSel(); }, mode && mode.type === 'move');
  btn('🎒 가방에', () => { Village.remove(sel); select(-1); scene.sync(); drawBag(); });
  btn('✖', () => select(-1));
}

function select(i){
  sel = i; if (mode && mode.type === 'move') mode = null;
  scene && scene.select(i >= 0 ? i : null);
  if (i < 0) hint('');
  drawSel();
}

function startPlace(b){
  if (mode && mode.type === 'place' && mode.e.k === b.k && mode.e.id === b.id) return cancelPlace();
  select(-1);
  mode = {type:'place', e:{k:b.k, id:b.id, r:0}};
  scene.ghost(mode.e);
  hint(`${nameOf(b)} 놓을 곳을 눌러요`);
  if (b.k === 'd' && Village.item(b.id).cur === 'eng') speak(Village.item(b.id).word);
  drawBag();
}
function cancelPlace(){ mode = null; scene && scene.ghost(null); hint(''); drawBag(); }

function onGround(g){
  if (mode && mode.type === 'place'){
    const e = mode.e, i = Village.place({...e, x:g.x, z:g.z});
    if (i < 0) return toast('여기엔 놓을 수 없어요');
    scene.sync(); scene.hop(i); sfxGood();
    const left = Village.bag().some(b => b.k === e.k && b.id === e.id);
    if (!left) cancelPlace(); else drawBag();
    return;
  }
  if (mode && mode.type === 'move'){
    if (!Village.move(mode.i, g.x, g.z)) return toast('여기엔 놓을 수 없어요');
    scene.sync(); sfxGood(); mode = null; hint(''); drawSel();
    return;
  }
  if (sel >= 0) select(-1);
}
function onPick(i){
  if (mode && mode.type === 'place') return;          // 놓는 중엔 바닥 누르기로만 받아요
  if (mode && mode.type === 'move') return toast('여기엔 놓을 수 없어요');
  const e = S.village.placed[i];
  select(i === sel ? -1 : i);
  if (e && sel >= 0){
    scene.hop(i);
    if (e.k === 'd' && Village.item(e.id).cur === 'eng') speak(Village.item(e.id).word);
    else if (e.k === 'c'){ const b = BODIES.find(x => x.id === e.id); if (b && b.cur === 'eng') speak(b.word); }
  }
}

function setNightBtn(){ $('vgNight').textContent = S.village.night ? '☀️' : '🌙'; }
$('vgNight').onclick = () => { Village.setNight(!S.village.night); scene && scene.setNight(S.village.night); setNightBtn(); };

/* ---------- 선물 창 ---------- */
function giftModal(gifts){
  if (!gifts.length) return;
  const p = $('vgPanel');
  p.innerHTML = '<h2>🎁 선물이 도착했어요!</h2><div class="row" id="vgGifts"></div><button class="btn green small" id="vgGiftOk">좋아요!</button>';
  gifts.forEach(g => {
    const d = Village.item(g.id), c = document.createElement('div'); c.className = 'gift';
    c.innerHTML = `${thumbs[g.id] ? `<img src="${thumbs[g.id]}" alt="">` : `<span class="e">${d.icon}</span>`}<small>${d.name}${g.n > 1 ? ` ×${g.n}` : ''}</small>`;
    $('vgGifts').appendChild(c);
  });
  $('vgGiftOk').onclick = () => mod.classList.remove('on');
  mod.classList.add('on'); sfxWin();
}

/* ---------- 열기·닫기 ---------- */
async function open(f){
  if (opening) return;
  opening = true;
  from = f === 'shop' ? 'shop' : 'map';
  Village.ensure(S);
  const gifts = Village.claimGifts();
  let m;
  try { m = await load3d(); }
  catch(e){ opening = false; toast('마을은 인터넷이 필요해요 📶'); return; }
  try {
    thumbs = await m.thumbs(DECOR.map(d => d.id));
    mode = null; sel = -1; tab = 'c'; hint(''); drawSel();
    show('village');
    if (scene) scene.dispose();
    $('vgLoad').style.display = 'none';
    scene = await m.create($('vgStage'), {onPick, onGround, canPlace: e => Village.canPlace(e)});
    setNightBtn(); drawBag();
    giftModal(gifts);
  } finally { opening = false; }
}
function close(){
  mod.classList.remove('on');
  if (scene){ scene.dispose(); scene = null; }
  mode = null; sel = -1;
}
function goShop(){ close(); Shop.open('village'); }
$('vgShop').onclick = goShop;
$('vgBack').onclick = () => {
  close();
  if (from === 'shop') return Shop.open('village');
  if (S.mode === 'math' && window.MathGame) MathGame.map(); else renderMap();
};
// 다른 화면으로 가면 그리기를 멈춰요 (배터리)
document.addEventListener('visibilitychange', () => scene && scene.pause(document.hidden));

window.VillageScreen = {open, load3d};
})();
