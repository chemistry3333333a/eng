/* =====================================================================
   워드 아일랜드 · 마을 규칙 (저장 정리·사기·선물·놓기)
   - 그림(three.js)은 village-3d.js, 화면은 village-screen.js 가 맡아요
   - 전역 S, save, level 은 함수가 불릴 때만 읽어요
   - S.village = {own:{id:n}, gifts:[...], placed:[{k:'d'|'c', id, x, z, r}], night}
   ===================================================================== */
(function(){
const ISLAND_R = 6.2;      // 이 반지름 안에만 놓여요
const QUIZ_RATE = 0.9;     // 영어로 주문하기·계산 문제 10% 할인
const byId = id => DECOR.find(d => d.id === id);
const snap = v => Math.round(v * 2) / 2;
const num = v => typeof v === 'number' && isFinite(v) ? v : 0;

// 빠진 값 채우기 + 이상한 자리 빼기. 사라진 장식 id 는 own 에 남겨 둬요 (아이템과 같은 원칙)
function ensure(s){
  let v = s.village;
  if (!v || typeof v !== 'object' || Array.isArray(v)) v = s.village = {};
  if (!v.own || typeof v.own !== 'object' || Array.isArray(v.own)) v.own = {};
  for (const k of Object.keys(v.own)) if (!(v.own[k] > 0)) delete v.own[k]; else v.own[k] = Math.floor(v.own[k]);
  if (!Array.isArray(v.gifts)) v.gifts = [];
  v.gifts = v.gifts.filter(g => typeof g === 'string');
  v.night = v.night === true;
  const used = {}, chars = new Set(), keep = [];
  for (const p of Array.isArray(v.placed) ? v.placed : []){
    if (!p || typeof p !== 'object') continue;
    if (p.k === 'c'){
      if (chars.has(p.id) || !BODIES.some(b => b.id === p.id) || !ownsBody(s, p.id)) continue;
      chars.add(p.id); keep.push({k:'c', id:p.id, x:num(p.x), z:num(p.z)});
    } else {
      if (!byId(p.id) || (used[p.id] || 0) >= (v.own[p.id] || 0)) continue;
      used[p.id] = (used[p.id] || 0) + 1;
      keep.push({k:'d', id:p.id, x:num(p.x), z:num(p.z), r:((p.r | 0) % 4 + 4) % 4});
    }
  }
  v.placed = keep;
  return s;
}
// S 가 아닌 세이브도 정리할 수 있게 캐릭터 소유를 직접 봐요 (Avatar.owns 는 전역 S 를 봐요)
const ownsBody = (s, id) => (Array.isArray(s.owned) && s.owned.includes(id)) || BODIES.some(b => b.id === id && b.price === 0);
// 이미 모양이 갖춰졌으면 그대로 써요 (매번 정리하면 놓인 자리 객체가 새로 만들어져 수정이 사라져요)
const V = () => { const v = S.village; return v && v.own && Array.isArray(v.placed) && Array.isArray(v.gifts) ? v : ensure(S).village; };

const list = cur => DECOR.filter(d => d.cur === cur);
const owned = id => V().own[id] || 0;
const placedCount = id => V().placed.filter(p => p.k === 'd' && p.id === id).length;

// 가방: 아직 안 놓은 장식(개수)과 안 놓은 캐릭터
function bag(){
  const v = V(), out = [];
  for (const d of DECOR){ const n = owned(d.id) - placedCount(d.id); if (n > 0) out.push({k:'d', id:d.id, n}); }
  for (const b of BODIES) if (ownsBody(S, b.id) && !v.placed.some(p => p.k === 'c' && p.id === b.id)) out.push({k:'c', id:b.id, n:1});
  return out;
}

/* ---------- 사기 ---------- */
const isUnlocked = d => Avatar.isUnlocked(d);
const lockText = d => Avatar.lockText(d);
function wallet(d){ return d.cur === 'math' ? ((S.math && S.math.coins) || 0) : S.coins; }
function priceOf(id, {quiz = false} = {}){ const d = byId(id); return quiz ? Math.ceil(d.price * QUIZ_RATE) : d.price; }
function canBuy(id, opts){
  const d = byId(id);
  if (!d) return {ok:false, reason:'unknown'};
  if (d.price == null) return {ok:false, reason:'giftOnly'};
  if (!d.stack && owned(id) > 0) return {ok:false, reason:'owned'};
  if (!isUnlocked(d)) return {ok:false, reason:'locked'};
  const price = priceOf(id, opts), have = wallet(d);
  if (have < price) return {ok:false, reason:'coins', need: price - have};
  return {ok:true, price};
}
function buy(id, opts){
  const r = canBuy(id, opts);
  if (r.ok){
    const d = byId(id);
    if (d.cur === 'math') S.math.coins -= r.price; else S.coins -= r.price;
    V().own[id] = owned(id) + 1; save();
  }
  return r;
}

/* ---------- 선물 ---------- */
const trophyCount = () => Object.values(S.trophies || {}).filter(v => v > 0).length;
const mathTrophyCount = () => Object.values((S.math && S.math.trophies) || {}).filter(v => v > 0).length;
const dexCount = () => Object.values(S.words || {}).filter(w => w && w.seen > 0).length;
function giftReady(g){
  if (g.first) return true;
  if (g.level) return level() >= g.level;
  if (g.trophies) return trophyCount() >= g.trophies;
  if (g.dex) return dexCount() >= g.dex;
  if (g.mathTrophies) return mathTrophyCount() >= g.mathTrophies;
  return false;
}
// 선물 열쇠: 첫 방문 선물은 한데 묶어 'first', 나머지는 장식 id
const giftKey = d => d.gift.first ? 'first' : d.id;
function giftText(d){
  const g = d.gift;
  if (!g) return '';
  if (g.first) return '첫 방문 선물';
  if (g.level) return `레벨 ${g.level} 선물`;
  if (g.trophies) return `보스 ${g.trophies}마리 선물`;
  if (g.dex) return `몬스터 ${g.dex}마리 선물`;
  return `수학 보스 ${g.mathTrophies}마리 선물`;
}
function claimGifts(){
  const v = V(), got = [], keys = new Set();
  for (const d of DECOR){
    if (!d.gift || v.gifts.includes(giftKey(d)) || !giftReady(d.gift)) continue;
    const n = d.giftCount || 1;
    v.own[d.id] = (v.own[d.id] || 0) + n; got.push({id:d.id, n}); keys.add(giftKey(d));
  }
  if (got.length){ v.gifts.push(...keys); save(); }
  return got;
}

/* ---------- 놓기 ---------- */
// 차지하는 칸: 한 칸 = 0.5. 칸 번호는 칸 왼쪽(작은 쪽) 모서리 × 2
function size(e){
  if (e.k === 'c') return [1, 1];
  const d = byId(e.id); if (!d) return [1, 1];
  return (e.r || 0) % 2 ? [d.d, d.w] : [d.w, d.d];
}
function cells(e){
  const [w, d] = size(e), x0 = e.x - w / 4, z0 = e.z - d / 4, out = [];
  for (let i = 0; i < w; i++) for (let j = 0; j < d; j++)
    out.push([Math.floor((x0 + i * .5) * 2 + 1e-6), Math.floor((z0 + j * .5) * 2 + 1e-6)]);
  return out;
}
const inside = c => Math.hypot((c[0] + .5) / 2, (c[1] + .5) / 2) <= ISLAND_R;
function canPlace(e, ignore = -1){
  const mine = cells(e);
  if (!mine.every(inside)) return false;
  const taken = new Set();
  V().placed.forEach((p, i) => { if (i !== ignore) cells(p).forEach(c => taken.add(c + '')); });
  return !mine.some(c => taken.has(c + ''));
}
function place(e){
  const v = V();
  const p = e.k === 'c' ? {k:'c', id:e.id, x:snap(e.x), z:snap(e.z)} : {k:'d', id:e.id, x:snap(e.x), z:snap(e.z), r:((e.r | 0) % 4 + 4) % 4};
  if (p.k === 'c'){
    if (!BODIES.some(b => b.id === p.id) || !ownsBody(S, p.id) || v.placed.some(q => q.k === 'c' && q.id === p.id)) return -1;
  } else if (!byId(p.id) || placedCount(p.id) >= owned(p.id)) return -1;
  if (!canPlace(p)) return -1;
  v.placed.push(p); save();
  return v.placed.length - 1;
}
function move(i, x, z){
  const p = V().placed[i]; if (!p) return false;
  const n = {...p, x:snap(x), z:snap(z)};
  if (!canPlace(n, i)) return false;
  p.x = n.x; p.z = n.z; save(); return true;
}
function rotate(i){
  const p = V().placed[i]; if (!p || p.k === 'c') return false;
  const n = {...p, r:(p.r + 1) % 4};
  if (!canPlace(n, i)) return false;
  p.r = n.r; save(); return true;
}
function remove(i){ const v = V(); if (v.placed[i]){ v.placed.splice(i, 1); save(); } }
function setNight(on){ V().night = !!on; save(); }

window.Village = {ensure, item:byId, list, owned, bag, canBuy, priceOf, buy, isUnlocked, lockText, giftText, claimGifts,
  cells, canPlace, place, move, rotate, remove, setNight, snap, ISLAND_R};
})();
