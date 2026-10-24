/* =====================================================================
   워드 아일랜드 · 캐릭터 로직 (구매·장착·잠금·특가·세이브 보정)
   - 그리기는 따로 해요. 여기는 계산과 저장만!
   - 전역 S, save, today, level 은 함수가 불릴 때만 읽어요 (로드 시점엔 DOM·S 를 안 건드려요)
   ===================================================================== */
(function(){
const byId = id => ITEMS.find(i => i.id === id);
// 슬롯별 위치·크기 (몸 이모지 크기 1em 기준. x: 가운데=0, 오른쪽 +, y: 위쪽 기준 아래로 +)
const LAYOUT = {
  box:  {w:1.3, h:1.3},                           // 캐릭터 상자 크기
  body: {x:0,     y:0.12, s:1},
  back: {x:0,     y:0.12, s:1.15},                // 몸 뒤, 살짝 크게
  face: {x:0,     y:0.62, s:0.5},                 // 얼굴 중앙
  hat:  {x:0,     y:-0.4, s:0.6},                 // 머리 위
  hand: {x:0.6,   y:1.0,  s:0.45},                 // 오른쪽 아래
  fx:   {x:-0.55, y:0.1,  s:0.35},                 // 몸 옆에서 반짝
  pet:  {x:1.05,  y:0.85, s:0.5},                // 캐릭터 오른쪽 아래
};
const SIZES = {s:56, m:96, l:160};
const POSE_MS = {cheer:700, hurt:500, attack:450};
const GIFT_MAX = 30;      // 첫 선물로 고를 수 있는 최대 가격
const DEAL_RATE = 0.7;    // 오늘의 특가 30% 할인
const QUIZ_RATE = 0.9;    // 퀴즈 보너스 10% 할인

// 빠진 필드를 채우고, 사라진 아이템 id 는 지우지 않고 보존해요 (옛 세이브·백업 복구용)
function ensure(s){
  if (!s.avatar || typeof s.avatar !== 'object') s.avatar = {};
  const a = s.avatar;
  if (!BODIES.some(b => b.id === a.body)) a.body = 'kid1';
  if (!a.equip || typeof a.equip !== 'object') a.equip = {};
  if (!Array.isArray(s.owned)) s.owned = [];
  s.owned = s.owned.filter(id => typeof id === 'string');
  for (const sl of SLOTS){
    const it = byId(a.equip[sl]);
    a.equip[sl] = (it && it.slot === sl && s.owned.includes(it.id)) ? it.id : null;
  }
  if (!s.shop || typeof s.shop !== 'object') s.shop = {};
  const sh = s.shop;
  if (typeof sh.freeGiven !== 'boolean') sh.freeGiven = false;
  if (typeof sh.dealDay !== 'string') sh.dealDay = '';
  if (typeof sh.dealId !== 'string') sh.dealId = '';
  return s;
}

const owns = id => S.owned.includes(id);

// 보스를 한 번이라도 이긴(별>0) 수 / 본 적 있는 단어 수
const trophyCount = () => Object.values(S.trophies || {}).filter(v => v > 0).length;
// 수학 섬 보스를 이긴 수 (S.math 가 아직 없어도 안전)
const mathTrophyCount = () => Object.values((S.math && S.math.trophies) || {}).filter(v => v > 0).length;
const dexCount = () => Object.values(S.words || {}).filter(w => w && w.seen > 0).length;

function isUnlocked(it){
  const u = it && it.unlock;
  if (!u) return true;
  if (u.level) return level() >= u.level;
  if (u.trophies) return trophyCount() >= u.trophies;
  if (u.dex) return dexCount() >= u.dex;
  if (u.mathTrophies) return mathTrophyCount() >= u.mathTrophies;
  return true;
}
function lockText(it){
  if (isUnlocked(it)) return '';
  const u = it.unlock;
  if (u.level) return `레벨 ${u.level} 필요`;
  if (u.trophies) return `보스 ${u.trophies}마리 물리치기`;
  if (u.mathTrophies) return `수학 보스 ${u.mathTrophies}마리 물리치기`;
  return `몬스터 ${u.dex}마리 잡기`;
}

// 오늘의 특가: 하루 동안 고정, 풀렸고 안 산 아이템 중 무작위
function deal(){
  const sh = S.shop;
  let it = byId(sh.dealId);
  if (sh.dealDay !== today() || !it || owns(it.id) || !isUnlocked(it)){
    const pool = ITEMS.filter(i => i.cur === 'eng' && isUnlocked(i) && !owns(i.id));
    it = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    const id = it ? it.id : '', day = today();
    if (sh.dealId !== id || sh.dealDay !== day){ sh.dealId = id; sh.dealDay = day; save(); }
  }
  return it ? {id: it.id, price: Math.ceil(it.price * DEAL_RATE)} : null;
}

// 아이템이 쓰는 지갑: 영어 코인(S.coins) 또는 수학 💎(S.math.coins)
function wallet(id){
  const it = byId(id), cur = it && it.cur === 'math' ? 'math' : 'eng';
  return {cur, coins: cur === 'math' ? ((S.math && S.math.coins) || 0) : S.coins};
}

function priceOf(id, {quiz = false} = {}){
  const it = byId(id), d = deal();
  if (d && d.id === id) return d.price;
  return quiz ? Math.ceil(it.price * QUIZ_RATE) : it.price;
}

function canBuy(id, opts){
  const it = byId(id);
  if (!it) return {ok:false, reason:'unknown'};
  if (owns(id)) return {ok:false, reason:'owned'};
  if (!isUnlocked(it)) return {ok:false, reason:'locked'};
  const price = priceOf(id, opts);
  const have = wallet(id).coins;
  if (have < price) return {ok:false, reason:'coins', need: price - have};
  return {ok:true, price};
}
function buy(id, opts){
  const r = canBuy(id, opts);
  if (r.ok){
    if (wallet(id).cur === 'math') S.math.coins -= r.price; else S.coins -= r.price;
    S.owned.push(id); save(); }
  return r;
}

function equip(id){
  const it = byId(id);
  if (!it || !owns(id)) return false;
  S.avatar.equip[it.slot] = id; save(); return true;
}
function unequip(slot){
  if (!SLOTS.includes(slot)) return;
  S.avatar.equip[slot] = null; save();
}
function setBody(bodyId){
  if (!BODIES.some(b => b.id === bodyId)) return false;
  S.avatar.body = bodyId; save(); return true;
}
const equipped = () => ({...S.avatar.equip});
const perks = () => Object.values(S.avatar.equip).map(byId).filter(i => i && i.perk).map(i => i.perk);

// 첫 선물: 싼 아이템 중 하나를 공짜로 (딱 한 번)
const giftChoices = () => ITEMS.filter(i => i.cur === 'eng' && i.price <= GIFT_MAX && !owns(i.id) && isUnlocked(i));
function claimGift(id){
  const it = giftChoices().find(i => i.id === id);
  if (S.shop.freeGiven || !it) return false;
  if (!owns(id)) S.owned.push(id);
  S.avatar.equip[it.slot] = id; S.shop.freeGiven = true; save(); return true;
}

// ---- 그리기 ----
let styled = false;
function injectStyle(){
  if (styled || typeof document === 'undefined') return;
  styled = true;
  const L = LAYOUT, lay = (k, z) => `.av-${k}{z-index:${z};left:calc(50% + ${L[k].x}em);top:${L[k].y}em;font-size:${L[k].s}em;}`;
  const st = document.createElement('style');
  st.textContent = `
.av{position:relative;display:inline-block;vertical-align:middle;width:${L.box.w}em;height:${L.box.h}em;line-height:1;pointer-events:none;user-select:none;flex:none;}
.av-haspet{margin-right:.7em;}   /* 펫이 상자 밖으로 나오니 자리를 확보 */
.av-s{font-size:${SIZES.s}px}.av-m{font-size:${SIZES.m}px}.av-l{font-size:${SIZES.l}px}
.av>span{position:absolute;transform:translateX(-50%);white-space:nowrap;}
${lay('body',2)}${lay('back',1)}${lay('face',3)}${lay('hat',4)}${lay('hand',5)}${lay('fx',6)}${lay('pet',2)}
.av-fx{animation:avTwinkle 1.6s ease-in-out infinite;}
.av-burst{position:absolute;z-index:7;left:50%;top:40%;font-size:.4em;font-style:normal;animation:avBurst .8s ease-out forwards;}
.av-idle{animation:avFloat 2s ease-in-out infinite;}
.av-cheer{animation:avJump .7s ease-out;}
.av-hurt{animation:avShake .5s linear;}
.av-attack{animation:avPunch .45s ease-out;}
@keyframes avFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-.05em)}}
@keyframes avJump{0%,100%{transform:translateY(0)}40%{transform:translateY(-.3em) scale(1.05)}}
@keyframes avShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-.07em)}40%{transform:translateX(.07em)}60%{transform:translateX(-.05em)}80%{transform:translateX(.05em)}}
@keyframes avPunch{0%,100%{transform:translateX(0)}40%{transform:translateX(.25em)}}
@keyframes avTwinkle{0%,100%{opacity:.5;transform:translateX(-50%) scale(.85)}50%{opacity:1;transform:translateX(-50%) scale(1.1)}}
@keyframes avBurst{0%{opacity:1;transform:translate(-50%,0) scale(.6)}100%{opacity:0;transform:translate(-50%,-1.4em) scale(1.6)}}`;
  document.head.appendChild(st);
}
function render(el, {size = 'm', pose = 'idle', pet = false, preview = null, body = null} = {}){
  injectStyle();
  if (!SIZES[size]) size = 'm';
  const eq = {...S.avatar.equip, ...(preview || {})};
  const b = BODIES.find(x => x.id === (body || S.avatar.body)) || BODIES[0];
  const layer = (cls, ch) => ch ? `<span class="av-${cls}">${ch}</span>` : '';
  const slotIcon = sl => { const it = byId(eq[sl]); return it && it.slot === sl ? it.icon : ''; };
  const p = pet && PETS[S.petOn];
  el.innerHTML = `<div class="av av-${size} av-${pose}${p ? ' av-haspet' : ''}">` +
    layer('back', slotIcon('back')) + layer('body', b.icon) + layer('face', slotIcon('face')) +
    layer('hat', slotIcon('hat')) + layer('hand', slotIcon('hand')) + layer('fx', slotIcon('effect')) +
    layer('pet', p ? p[0] : '') + `</div>`;
}
// 자세 애니메이션을 한 번 재생하고 idle 로 돌아와요
function react(el, kind){
  const root = el && el.querySelector('.av');
  if (!root || !POSE_MS[kind]) return;
  const sz = [...root.classList].find(c => /^av-[sml]$/.test(c));
  clearTimeout(root._avT);
  root.className = `av ${sz}${root.classList.contains('av-haspet') ? ' av-haspet' : ''}`; void root.offsetWidth;   // 애니메이션 재시작
  root.classList.add('av-' + kind);
  const it = byId(S.avatar.equip.effect);
  if (kind === 'cheer' && it){
    const o = document.createElement('i');
    o.className = 'av-burst'; o.textContent = it.icon;
    root.appendChild(o); setTimeout(() => o.remove(), 850);
  }
  root._avT = setTimeout(() => { root.classList.remove('av-' + kind); root.classList.add('av-idle'); }, POSE_MS[kind]);
}

// 영어 그림 퀴즈의 오답 후보: 영어 아이템만 (수학 아이템은 제외)
function quizWrong(it, shuffle = a => a){
  const bad = x => x.cur === 'eng' && x.id !== it.id && x.icon !== it.icon;
  let wrong = shuffle(ITEMS.filter(x => bad(x) && x.slot === it.slot)).slice(0, 2);
  if (wrong.length < 2) wrong = wrong.concat(shuffle(ITEMS.filter(x => bad(x) && !wrong.includes(x))).slice(0, 2 - wrong.length));
  return wrong;
}

window.Avatar = {quizWrong, ensure, item: byId, owns, isUnlocked, lockText, wallet, deal, priceOf, canBuy, buy,
  equip, unequip, setBody, equipped, perks, giftChoices, claimGift, render, react};
})();
