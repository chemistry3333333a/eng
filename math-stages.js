/* =====================================================================
   워드 아일랜드 · 수학 스테이지 (챕터 표, 문제 만들기, 보기, 저장 칸 채우기)
   - DOM 을 안 건드려요. 문제는 {a, b, op, ans, kind} (JSON 으로 저장해도 돼요)
   - 소수 덧셈은 힌트의 "만들기"가 항상 딱 떨어지는 수를 만들도록 문제를 골라요
   ===================================================================== */
const MATH_CHAPTERS = [
  {id:'fr', name:'분수의 덧셈과 뺄셈', icon:'🍕', stages:['m-fr1','m-fr2','m-fr3','m-fr4','m-fr5'],
   boss:{id:'m-frB', name:'피자 마왕', icon:'👹'}},
  {id:'de', name:'소수의 덧셈과 뺄셈', icon:'🧱', stages:['m-de1','m-de2','m-de3','m-de4','m-de5'],
   boss:{id:'m-deB', name:'블록 마왕', icon:'👹'}},
];
const MATH_STAGES = [
  {id:'m-fr1', ch:0, name:'진분수 덧셈',       icon:'🍕'},
  {id:'m-fr2', ch:0, name:'1을 넘는 덧셈',     icon:'🍰'},
  {id:'m-fr3', ch:0, name:'대분수 덧셈',       icon:'🥧'},
  {id:'m-fr4', ch:0, name:'분수 뺄셈',         icon:'🍩'},
  {id:'m-fr5', ch:0, name:'대분수 뺄셈',       icon:'🎂'},
  {id:'m-frB', ch:0, name:'피자 마왕',         icon:'👹', boss:true},
  {id:'m-de1', ch:1, name:'소수 한 자리 덧셈', icon:'🧱'},
  {id:'m-de2', ch:1, name:'소수 두 자리 덧셈', icon:'🧩'},
  {id:'m-de3', ch:1, name:'자릿수 다른 덧셈',  icon:'📏'},
  {id:'m-de4', ch:1, name:'소수 뺄셈',         icon:'✂️'},
  {id:'m-de5', ch:1, name:'자연수 − 소수',     icon:'🪙'},
  {id:'m-deB', ch:1, name:'블록 마왕',         icon:'👹', boss:true},
];
const MATH_BOSS = {
  'm-frB': {skill:'swap', tip:'🔀 몬스터 자리가 계속 바뀌어요!',
            taunt:["Let's slice and swap!",'조각내서 섞어 버리자!'], rage:['Swap, swap, swap!','바꿔, 바꿔, 바꿔!']},
  'm-deB': {skill:'ice', tip:'🧊 얼어붙은 몬스터는 한 번 눌러 얼음을 깨요!',
            taunt:['I will freeze your blocks!','네 블록을 꽁꽁 얼려 주마!'], rage:['Freeze!','얼어라!']},
};

(function(){
const M = window.MathCore;
const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));   // lo..hi 포함
const D = h => M.dec(h / 100);
const F = (w, n, d) => M.frac(w, n, d);
const mk = (a, b, op) => ({a, b, op, ans: op === '+' ? M.add(a, b) : M.sub(a, b)});

// ── 스테이지별 문제 (분모는 모두 같아요) ──
// 받아올림이 있는 짝 / 없는 짝 (분자 a, b 는 1..d-1)
function fracPair(d, carry){
  if (carry){ const a = rnd(1, d - 1); return [a, rnd(d - a, d - 1)]; }
  const a = rnd(1, d - 2); return [a, rnd(1, d - 1 - a)];
}
const RAW = {
  'm-fr1'(){ const d = rnd(3, 12), [a, b] = fracPair(d, false); return mk(F(0, a, d), F(0, b, d), '+'); },
  'm-fr2'(){ const d = rnd(2, 12), [a, b] = fracPair(d, true);  return mk(F(0, a, d), F(0, b, d), '+'); },
  'm-fr3'(){
    const d = rnd(3, 12), [a, b] = fracPair(d, Math.random() < 0.5);
    return mk(F(rnd(1, 3), a, d), F(rnd(1, 3), b, d), '+');
  },
  'm-fr4'(){
    if (Math.random() < 0.5){ const d = rnd(2, 12); return mk(F(1, 0, d), F(0, rnd(1, d - 1), d), '-'); }
    const d = rnd(3, 12), a = rnd(2, d - 1);
    return mk(F(0, a, d), F(0, rnd(1, a - 1), d), '-');
  },
  'm-fr5'(){
    const d = rnd(3, 12), w2 = rnd(1, 2), w1 = rnd(w2 + 1, 3);
    let a, b;
    if (Math.random() < 0.7){ a = rnd(1, d - 2); b = rnd(a + 1, d - 1); }
    else { a = rnd(2, d - 1); b = rnd(1, a - 1); }
    return mk(F(w1, a, d), F(w2, b, d), '-');
  },
  'm-de1'(){
    const want = Math.random() < 0.5;
    for (;;){
      const x = rnd(1, 49), y = rnd(1, 49);
      if ((x % 10 + y % 10 >= 10) === want) return mk(D(x * 10), D(y * 10), '+');
    }
  },
  'm-de2'(){ return mk(D(rnd(1, 99)), D(rnd(1, 99)), '+'); },
  'm-de3'(){
    let two; do two = rnd(1, 299); while (two % 10 === 0);
    const a = D(two), b = D(rnd(1, 29) * 10);
    return Math.random() < 0.5 ? mk(a, b, '+') : mk(b, a, '+');
  },
  'm-de4'(){
    for (;;){
      const a = rnd(30, 599), b = rnd(10, 590);
      const ah = Math.random() < 0.5 ? a - a % 10 : a, bh = Math.random() < 0.5 ? b - b % 10 : b;
      if (ah > bh && bh >= 10 && !(ah % 100 === 0 && bh % 100 === 0)) return mk(D(ah), D(bh), '-');
    }
  },
  'm-de5'(){
    const a = rnd(1, 5);
    for (;;){
      const b = rnd(10, a * 100 - 10);
      if (b % 100 !== 0) return mk(D(a * 100), D(b), '-');
    }
  },
};

// 만들기·내려가기 힌트가 딱 떨어지는 수를 만드나 (소수는 단위 1이면 10 단위, 단위 10이면 100 단위)
function roundOk(plan){
  if (plan.kind !== 'make' && plan.kind !== 'down') return true;
  const m = plan.made;
  return m.t === 'f' ? m.n === 0 : m.h % (plan.unit === 10 ? 100 : 10) === 0;
}
function gen(id){
  const bs = MATH_STAGES.find(s => s.id === id && s.boss);   // 보스는 챕터 스테이지 중 하나를 무작위로
  if (bs){ const l = MATH_CHAPTERS[bs.ch].stages; id = l[rnd(0, l.length - 1)]; }
  const make = RAW[id];
  if (!make) throw new Error('MathStages: 모르는 스테이지 ' + id);
  let p, plan;
  for (let i = 0; i < 1000; i++){
    p = make(); plan = M.hintPlan(p);
    if (roundOk(plan)) break;
  }
  p.kind = plan.kind;
  return p;
}

const key = p => M.text(p.a) + p.op + M.text(p.b);
function buildQueue(id){
  const st = MATH_STAGES.find(s => s.id === id);
  if (!st) throw new Error('MathStages: 모르는 스테이지 ' + id);
  const pool = st.boss ? MATH_CHAPTERS[st.ch].stages : [id], n = st.boss ? 12 : 10;
  const q = [], seen = new Set();
  for (let i = 0; i < n; i++){
    let p;
    for (let t = 0; t < 200; t++){
      p = gen(pool[i % pool.length]);
      if (!seen.has(key(p))) break;
    }
    seen.add(key(p)); q.push(p);
  }
  return q;
}

// 정답 + 오답 n-1 개, 섞어서
function options(p, n){
  const o = [p.ans, ...M.distractors(p, n - 1)];
  for (let i = o.length - 1; i > 0; i--){ const j = rnd(0, i); [o[i], o[j]] = [o[j], o[i]]; }
  return o;
}

// ── 저장 ──
function ensure(S){
  if (!S.mode) S.mode = 'eng';
  const m = S.math && typeof S.math === 'object' ? S.math : (S.math = {});
  if (typeof m.coins !== 'number') m.coins = 0;
  if (!m.stages || typeof m.stages !== 'object') m.stages = {};
  if (!m.trophies || typeof m.trophies !== 'object') m.trophies = {};
  if (m.session === undefined) m.session = null;
  if (!m.skills || typeof m.skills !== 'object') m.skills = {};
  return S;
}
function unlocked(S, id){
  const i = MATH_STAGES.findIndex(s => s.id === id), st = (S.math && S.math.stages) || {};
  if (i < 0) return false;
  const prev = i > 0 && st[MATH_STAGES[i - 1].id];
  return i === 0 || !!(S.settings && S.settings.openAll) || !!st[id] || !!(prev && prev.stars > 0);
}

// 별: 첫 시도에 맞힌 비율 (영어와 같은 기준)
function stars(first, n){ const r = n ? first / n : 0; return r >= 0.9 ? 3 : r >= 0.7 ? 2 : 1; }

// 수학 보스 보상: 💎 30 + 별×10 + 하트×3 → S.math.coins, 트로피는 S.math.trophies 에 최고 별 (펫·S.trophies·S.coins 는 안 건드려요)
function bossReward(S, s, stars){
  ensure(S);
  const id = s.stage, prev = S.math.trophies[id] || 0;
  S.math.trophies[id] = Math.max(prev, stars);
  const hearts = Math.max(0, s.hearts || 0);
  const coins = 30 + stars * 10 + hearts * 3;
  S.math.coins += coins; s.coins += coins;
  const st = MATH_STAGES.find(x => x.id === id) || {};
  return {coins, stars, hearts, trophyUp: stars > prev, newPet: false, name: st.name, icon: '💎'};
}

window.MathStages = {gen, buildQueue, options, ensure, unlocked, stars, bossReward};
})();
