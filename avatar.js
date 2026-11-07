/* =====================================================================
   워드 아일랜드 · 캐릭터 로직 (구매·장착·잠금·특가·세이브 보정)
   - 그림(SVG)은 avatar-art.js 가 만들고, 여기는 계산·저장과 화면에 붙이기만 해요
   - 전역 S, save, today, level 은 함수가 불릴 때만 읽어요 (로드 시점엔 DOM·S 를 안 건드려요)
   ===================================================================== */
(function(){
// 아이템 또는 캐릭터 (캐릭터는 slot:'body' 를 붙인 복사본)
const byId = id => {
  const it = ITEMS.find(i => i.id === id);
  if (it) return it;
  const b = BODIES.find(x => x.id === id);
  return b ? {...b, slot:'body'} : undefined;
};
// 무료 캐릭터(price 0)는 늘 가진 것으로 쳐요
const ownsIn = (s, id) => s.owned.includes(id) || BODIES.some(b => b.id === id && b.price === 0);
const SIZES = {s:56, m:96, l:160};
const POSE_MS = {cheer:700, hurt:500, attack:450};
const MOOD_MS = 1000;     // 반응 표정이 머무는 시간 (자세 움직임보다 조금 길게)
const SLEEP_MS = 20000;   // 이만큼 아무 입력이 없으면 졸려요
const GIFT_MAX = 30;      // 첫 선물로 고를 수 있는 최대 가격
const DEAL_RATE = 0.7;    // 오늘의 특가 30% 할인
const QUIZ_RATE = 0.9;    // 퀴즈 보너스 10% 할인

// 빠진 필드를 채우고, 사라진 아이템 id 는 지우지 않고 보존해요 (옛 세이브·백업 복구용)
function ensure(s){
  if (!s.avatar || typeof s.avatar !== 'object') s.avatar = {};
  const a = s.avatar;
  if (!a.equip || typeof a.equip !== 'object') a.equip = {};
  if (!Array.isArray(s.owned)) s.owned = [];
  s.owned = s.owned.filter(id => typeof id === 'string');
  if (!BODIES.some(b => b.id === a.body) || !ownsIn(s, a.body)) a.body = 'kid1';
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

const owns = id => ownsIn(S, id);

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
  if (!it || it.slot === 'body' || !owns(id)) return false;
  S.avatar.equip[it.slot] = id; save(); return true;
}
function unequip(slot){
  if (!SLOTS.includes(slot)) return;
  S.avatar.equip[slot] = null; save();
}
function setBody(bodyId){
  if (!BODIES.some(b => b.id === bodyId) || !owns(bodyId)) return false;
  S.avatar.body = bodyId; save(); return true;
}
const equipped = () => ({...S.avatar.equip});
// 모은 캐릭터 수
const collection = () => ({have: BODIES.filter(b => owns(b.id)).length, total: BODIES.length});
const perks = () => Object.values(S.avatar.equip).map(byId).filter(i => i && i.perk).map(i => i.perk);

// 첫 선물: 싼 아이템 중 하나를 공짜로 (딱 한 번)
const giftChoices = () => ITEMS.filter(i => i.cur === 'eng' && i.price <= GIFT_MAX && !owns(i.id) && isUnlocked(i));
function claimGift(id){
  const it = giftChoices().find(i => i.id === id);
  if (S.shop.freeGiven || !it) return false;
  if (!owns(id)) S.owned.push(id);
  S.avatar.equip[it.slot] = id; S.shop.freeGiven = true; save(); return true;
}

// ---- 그리기 (그림은 avatar-art.js 의 AvatarArt) ----
let styled = false;
function injectStyle(){
  if (styled || typeof document === 'undefined') return;
  styled = true;
  const st = document.createElement('style');
  st.textContent = `
.av{position:relative;display:inline-block;vertical-align:middle;width:1.25em;height:1.4em;line-height:1;pointer-events:none;user-select:none;flex:none;}
.av-fig{width:100%;height:100%;}
.av-fig>svg{display:block;width:100%;height:100%;overflow:visible;}
.av-s{font-size:${SIZES.s}px}.av-m{font-size:${SIZES.m}px}.av-l{font-size:${SIZES.l}px}
.av-haspet{margin-right:.45em;}   /* 펫이 상자 밖으로 나오니 자리를 확보 */
.av-pet{position:absolute;right:-.42em;bottom:.08em;font-size:.42em;}
.av-burst{position:absolute;left:50%;top:30%;width:.45em;height:.45em;animation:avBurst .8s ease-out forwards;}
.av-burst svg{width:100%;height:100%;}
.av-cheer{animation:avJump .7s ease-out;}
.av-hurt{animation:avShake .5s linear;}
.av-attack{animation:avPunch .45s ease-out;}
@keyframes avJump{0%,100%{transform:translateY(0)}40%{transform:translateY(-.3em) scale(1.05)}}
@keyframes avShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-.07em)}40%{transform:translateX(.07em)}60%{transform:translateX(-.05em)}80%{transform:translateX(.05em)}}
@keyframes avPunch{0%,100%{transform:translateX(0)}40%{transform:translateX(.25em)}}
@keyframes avBurst{0%{opacity:1;transform:translate(-50%,0) scale(.6)}100%{opacity:0;transform:translate(-50%,-1.4em) scale(1.6)}}
${AvatarArt.css}`;
  document.head.appendChild(st);
}
// 요소에 붙여 둔 상태(el._av)로 다시 그려요. react 와 졸림은 full 없이 불러서 그림(.av-fig)만 바꿔요
// (펫 span 은 그대로 둬야 boss.js 의 펫 말풍선·깡총이 살아 있어요)
function draw(el, mood, pose, burst, full){
  const o = el._av, b = BODIES.some(x => x.id === o.body) ? o.body : (S.avatar.body || 'kid1');
  const eq = {...S.avatar.equip, ...(o.preview || {})};
  const p = o.pet && PETS[S.petOn];
  const svg = AvatarArt.character({body:b, equip:eq, mood, bg:o.bg});
  const fx = burst && eq.effect && AvatarArt.hasItem(eq.effect) ? AvatarArt.thumb(eq.effect) : '';
  const cls = `av av-${o.size} av-${pose}${p ? ' av-haspet' : ''}`;
  const root = !full && el.querySelector && el.querySelector('.av'), fig = root && el.querySelector('.av-fig');
  if (fig){
    root.className = `av av-${o.size}${p ? ' av-haspet' : ''}`; void root.offsetWidth;   // 자세 애니메이션 재시작
    root.className = cls; fig.innerHTML = svg;
    if (root.querySelectorAll) root.querySelectorAll('.av-burst').forEach(x => x.remove());
    if (fx && typeof document !== 'undefined'){ const i = document.createElement('i'); i.className = 'av-burst'; i.innerHTML = fx; root.appendChild(i); }
    return;
  }
  el.innerHTML = `<div class="${cls}"><div class="av-fig">${svg}</div>`
    + (p ? `<span class="av-pet">${p[0]}</span>` : '') + (fx ? `<i class="av-burst">${fx}</i>` : '') + `</div>`;
}
function render(el, {size = 'm', pose = 'idle', pet = false, preview = null, body = null, mood = 'base', bg, sleepy = false} = {}){
  if (!el) return;
  injectStyle();
  if (!SIZES[size]) size = 'm';
  clearTimeout(el._avT);
  el._av = {size, pet, preview, body, mood, bg: bg === undefined ? size !== 's' : !!bg, sleepy};
  if (sleepy){ sleepers.add(el); armSleep(); } else sleepers.delete(el);
  draw(el, mood, pose, false, true);
}
// 게임 상황 → 표정
function moodFor(kind, {combo = 0, boss = false} = {}){
  if (kind === 'cheer') return combo >= 3 ? 'star' : 'smile';
  if (kind === 'hurt') return boss ? 'teary' : 'wow';
  if (kind === 'attack') return 'wink';
  return AvatarArt.MOODS.includes(kind) ? kind : 'base';
}
// 반응: 자세 움직임(cheer/hurt/attack)과 표정을 잠깐 보여 주고 render 때 표정으로 돌아와요
function react(el, kind, opts){
  if (!el || !el._av) return;
  clearTimeout(el._avT);
  el._av.asleep = false;
  draw(el, moodFor(kind, opts), POSE_MS[kind] ? kind : 'idle', kind === 'cheer');
  el._avT = setTimeout(() => draw(el, el._av.mood, 'idle'), MOOD_MS);
}

// 졸림: sleepy 로 그린 캐릭터는 SLEEP_MS 동안 입력이 없으면 잠들고, 누르면 깨요
const sleepers = new Set();
let sleepT = null, listening = false;
function armSleep(){
  if (!listening && typeof document !== 'undefined'){
    listening = true;
    const wake = () => {
      sleepers.forEach(el => { if (el._av && el._av.asleep){ el._av.asleep = false; draw(el, el._av.mood, 'idle'); } });
      armSleep();
    };
    document.addEventListener('pointerdown', wake, true);
    document.addEventListener('keydown', wake, true);
  }
  clearTimeout(sleepT);
  sleepT = setTimeout(() => {
    sleepers.forEach(el => {
      if (el.isConnected === false || !el._av || !el._av.sleepy){ sleepers.delete(el); return; }
      el._av.asleep = true; draw(el, 'sleep', 'idle');
    });
  }, SLEEP_MS);
}
// 상점 칸·퀴즈용 작은 그림 (그림이 없으면 이모지)
function thumb(id){
  const it = byId(id);
  if (!it) return '';
  if (it.slot === 'body') return AvatarArt.hasBody(id) ? AvatarArt.face(id) : it.icon;
  return AvatarArt.hasItem(id) ? AvatarArt.thumb(id) : it.icon;
}

// 영어 그림 퀴즈의 오답 후보: 영어 아이템만 (수학 아이템은 제외)
function quizWrong(it, shuffle = a => a){
  if (it.slot === 'body')   // 캐릭터는 다른 영어 캐릭터 그림에서 골라요
    return shuffle(BODIES.filter(b => b.cur === 'eng' && b.id !== it.id && b.word !== it.word)).slice(0, 2).map(b => byId(b.id));
  const bad = x => x.cur === 'eng' && x.id !== it.id && x.icon !== it.icon;
  let wrong = shuffle(ITEMS.filter(x => bad(x) && x.slot === it.slot)).slice(0, 2);
  if (wrong.length < 2) wrong = wrong.concat(shuffle(ITEMS.filter(x => bad(x) && !wrong.includes(x))).slice(0, 2 - wrong.length));
  return wrong;
}

window.Avatar = {quizWrong, ensure, item: byId, owns, isUnlocked, lockText, wallet, deal, priceOf, canBuy, buy,
  equip, unequip, setBody, equipped, collection, perks, giftChoices, claimGift, render, react, moodFor, thumb};
})();
