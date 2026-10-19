/* =====================================================================
   워드 아일랜드 · 캐릭터 로직 (구매·장착·잠금·특가·세이브 보정)
   - 그리기는 따로 해요. 여기는 계산과 저장만!
   - 전역 S, save, today, level 은 함수가 불릴 때만 읽어요 (로드 시점엔 DOM·S 를 안 건드려요)
   ===================================================================== */
(function(){
const byId = id => ITEMS.find(i => i.id === id);
const GIFT_MAX = 30;      // 첫 선물로 고를 수 있는 최대 가격
const DEAL_RATE = 0.7;    // 오늘의 특가 30% 할인
const QUIZ_RATE = 0.9;    // 퀴즈 보너스 10% 할인

// 빠진 필드를 채우고, 사라진 아이템 id 는 정리해요 (옛 세이브·백업 복구용)
function ensure(s){
  if (!s.avatar || typeof s.avatar !== 'object') s.avatar = {};
  const a = s.avatar;
  if (!BODIES.some(b => b.id === a.body)) a.body = 'kid1';
  if (!a.equip || typeof a.equip !== 'object') a.equip = {};
  if (!Array.isArray(s.owned)) s.owned = [];
  s.owned = s.owned.filter(id => byId(id));
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
const dexCount = () => Object.values(S.words || {}).filter(w => w && w.seen > 0).length;

function isUnlocked(it){
  const u = it && it.unlock;
  if (!u) return true;
  if (u.level) return level() >= u.level;
  if (u.trophies) return trophyCount() >= u.trophies;
  if (u.dex) return dexCount() >= u.dex;
  return true;
}
function lockText(it){
  if (isUnlocked(it)) return '';
  const u = it.unlock;
  if (u.level) return `레벨 ${u.level} 필요`;
  if (u.trophies) return `보스 ${u.trophies}마리 물리치기`;
  return `몬스터 ${u.dex}마리 잡기`;
}

// 오늘의 특가: 하루 동안 고정, 풀렸고 안 산 아이템 중 무작위
function deal(){
  const sh = S.shop;
  let it = byId(sh.dealId);
  if (sh.dealDay !== today() || !it || owns(it.id) || !isUnlocked(it)){
    const pool = ITEMS.filter(i => isUnlocked(i) && !owns(i.id));
    it = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    const id = it ? it.id : '', day = today();
    if (sh.dealId !== id || sh.dealDay !== day){ sh.dealId = id; sh.dealDay = day; save(); }
  }
  return it ? {id: it.id, price: Math.ceil(it.price * DEAL_RATE)} : null;
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
  if (S.coins < price) return {ok:false, reason:'coins', need: price - S.coins};
  return {ok:true, price};
}
function buy(id, opts){
  const r = canBuy(id, opts);
  if (r.ok){ S.coins -= r.price; S.owned.push(id); save(); }
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
const giftChoices = () => ITEMS.filter(i => i.price <= GIFT_MAX);
function claimGift(id){
  const it = giftChoices().find(i => i.id === id);
  if (S.shop.freeGiven || !it) return false;
  if (!owns(id)) S.owned.push(id);
  S.avatar.equip[it.slot] = id; S.shop.freeGiven = true; save(); return true;
}

window.Avatar = {ensure, item: byId, owns, isUnlocked, lockText, deal, priceOf, canBuy, buy,
  equip, unequip, setBody, equipped, perks, giftChoices, claimGift};
})();
