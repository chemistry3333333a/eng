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
MATH_CHAPTERS.forEach(c => { c.g = '4-2'; });

/* ── 4학년 2학기 도형 ~ 6학년 2학기 (문제는 math-more.js) ──
   새 챕터는 언제나 맨 뒤에 붙여요. 앞 스테이지의 id·순서를 바꾸면 저장된 진행도·트로피·잠금이 어긋나요
   [챕터 id, 학년-학기, 이름, 아이콘, 보스 이름, [[스테이지 이름, 아이콘], …]] → 스테이지 id 는 'm-' + 챕터 id + 번호, 보스는 'm-' + 챕터 id + 'B' */
const MATH_MORE = [
  ['pg', '4-2', '삼각형·사각형·다각형', '🔺', '세모 마왕', [['이등변삼각형의 각', '🔺'], ['정다각형의 둘레', '🛑'], ['평행사변형·마름모', '🔷']]],
  ['mx', '5-1', '자연수의 혼합 계산', '🧮', '괄호 마왕', [['덧셈·뺄셈 섞인 식', '➕'], ['곱셈·나눗셈 섞인 식', '✖️'], ['사칙 연산 섞인 식', '🧮']]],
  ['dm', '5-1', '약수와 배수', '🔢', '나눗셈 마왕', [['약수 찾기', '🔍'], ['배수 찾기', '🔢'], ['최대공약수', '🤝'], ['최소공배수', '🔗']]],
  ['cr', '5-1', '규칙과 대응', '📊', '규칙 마왕', [['곱하는 규칙', '📊'], ['더하고 빼는 규칙', '📈'], ['거꾸로 찾기', '🔄']]],
  ['rc', '5-1', '약분과 통분', '🍫', '초콜릿 마왕', [['크기가 같은 분수', '🍫'], ['기약분수', '✂️'], ['통분', '🧲'], ['분수의 크기 비교', '⚖️']]],
  ['fu', '5-1', '분수의 덧셈과 뺄셈', '🍰', '케이크 마왕', [['분모가 다른 덧셈', '🍕'], ['분모가 다른 뺄셈', '🍰'], ['대분수의 덧셈', '🥧'], ['대분수의 뺄셈', '🎂']]],
  ['ar', '5-1', '다각형의 둘레와 넓이', '🟩', '땅따먹기 마왕', [['직사각형 둘레·넓이', '🟩'], ['평행사변형·삼각형 넓이', '📐'], ['사다리꼴·마름모 넓이', '🔶']]],
  ['ro', '5-2', '수의 범위와 어림하기', '📏', '어림 마왕', [['이상·이하·초과·미만', '📏'], ['올림과 버림', '⬆️'], ['반올림', '🎯']]],
  ['fm', '5-2', '분수의 곱셈', '🍓', '딸기 마왕', [['분수 × 자연수', '🍕'], ['자연수 × 분수', '🍪'], ['진분수의 곱셈', '🍓'], ['대분수의 곱셈', '🍉']]],
  ['dx', '5-2', '소수의 곱셈', '💠', '소수점 마왕', [['소수 × 자연수', '🧱'], ['자연수 × 소수', '🧩'], ['소수 × 소수', '💠'], ['곱의 소수점 위치', '🔎']]],
  ['cb', '5-2', '직육면체', '📦', '상자 마왕', [['면·모서리·꼭짓점', '📦'], ['모서리 길이의 합', '📐']]],
  ['av', '5-2', '평균과 가능성', '🎲', '주사위 마왕', [['평균 구하기', '📊'], ['평균으로 모르는 수', '❓'], ['가능성을 수로', '🎲']]],
  ['fd', '6-1', '분수의 나눗셈', '🍞', '빵 마왕', [['자연수 ÷ 자연수', '🍞'], ['분수 ÷ 자연수 ①', '🧀'], ['분수 ÷ 자연수 ②', '🥨'], ['대분수 ÷ 자연수', '🥐']]],
  ['pm', '6-1', '각기둥과 각뿔', '🏛️', '피라미드 마왕', [['각기둥', '🏛️'], ['각뿔', '⛺'], ['이름 맞히기', '🏷️']]],
  ['dd', '6-1', '소수의 나눗셈', '💧', '물방울 마왕', [['소수 ÷ 자연수', '🧃'], ['몫이 1보다 작은 나눗셈', '💧'], ['0을 내려 나누기', '⬇️'], ['몫을 소수로', '🔟']]],
  ['rt', '6-1', '비와 비율', '💯', '퍼센트 마왕', [['비로 나타내기', '⚖️'], ['비율을 분수로', '🍕'], ['비율을 소수로', '🔢'], ['백분율', '💯']]],
  ['vb', '6-1', '직육면체의 부피와 겉넓이', '🧊', '큐브 마왕', [['직육면체의 부피', '📦'], ['정육면체 부피·겉넓이', '🧊'], ['직육면체의 겉넓이', '🎁']]],
  ['fq', '6-2', '분수의 나눗셈', '🥧', '뒤집기 마왕', [['분모가 같은 분수 ÷ 분수', '🍕'], ['나머지가 있는 분수 ÷ 분수', '🍰'], ['자연수 ÷ 분수', '🥧'], ['분모가 다른 분수 ÷ 분수', '🎂']]],
  ['dq', '6-2', '소수의 나눗셈', '🪙', '동전 마왕', [['소수 ÷ 소수', '🧱'], ['자릿수가 다른 소수 ÷ 소수', '📏'], ['자연수 ÷ 소수', '🪙'], ['몫을 반올림하기', '🎯']]],
  ['pp', '6-2', '비례식과 비례배분', '⚖️', '저울 마왕', [['간단한 자연수의 비', '⚖️'], ['비례식', '🔗'], ['비례배분', '🍬']]],
  ['ci', '6-2', '원의 넓이', '⭕', '동그라미 마왕', [['원주 구하기', '⭕'], ['원주로 지름 구하기', '📏'], ['원의 넓이', '🍩']]],
  // 그림(math-fig.js)이 있어야 풀 수 있는 단원. 앞 챕터 번호가 안 바뀌게 맨 뒤에 붙여요
  ['lg', '4-2', '꺾은선그래프', '📈', '그래프 마왕', [['그래프 읽기', '📈'], ['변화한 양', '📉']]],
  ['sy', '5-2', '합동과 대칭', '🪞', '거울 마왕', [['합동인 도형의 변', '📐'], ['합동인 도형의 각', '📏'], ['선대칭·점대칭', '🦋']]],
  ['gr', '6-1', '여러 가지 그래프', '🥧', '띠 마왕', [['띠그래프', '🎏'], ['원그래프', '🥧']]],
  ['st', '6-2', '공간과 입체', '🧱', '블록탑 마왕', [['위에서 본 모양', '🔳'], ['쌓기나무 세기', '🧱']]],
  ['cy', '6-2', '원기둥·원뿔·구', '🥫', '원기둥 마왕', [['원기둥의 전개도', '🥫'], ['원뿔', '🍦'], ['구', '⚽']]],
];
// 보스 기술은 수학 화면에서 잘 보이는 것만 돌려 써요 (그림자·영어 글자 같은 건 수 몬스터에 안 맞아요)
const MATH_SKILLS = [
  {skill:'ice',   tip:'🧊 얼어붙은 몬스터는 한 번 눌러 얼음을 깨요!', taunt:['I will freeze your answers!', '네 답을 꽁꽁 얼려 주마!'], rage:['Freeze!', '얼어라!']},
  {skill:'swap',  tip:'🔀 몬스터 자리가 계속 바뀌어요!', taunt:["Let's mix them up!", '몽땅 섞어 버리자!'], rage:['Swap, swap, swap!', '바꿔, 바꿔, 바꿔!']},
  {skill:'web',   tip:'🕸️ 거미줄은 먼저 터치해서 걷어 내요!', taunt:['My web will stop you!', '내 거미줄이 널 막을 거야!'], rage:['More webs!', '거미줄을 더 쳐 주마!']},
  {skill:'ghost', tip:'👻 몬스터가 사라졌다 나타나요. 잘 지켜봐요!', taunt:['Boo! Can you see me?', '부! 내가 보이니?'], rage:["Now you see me, now you don't!", '보였다 안 보였다!']},
];
MATH_MORE.forEach(([id, g, name, icon, bossName, list], k) => {
  const ch = MATH_CHAPTERS.length, ids = list.map((_, i) => `m-${id}${i + 1}`), bid = `m-${id}B`;
  MATH_CHAPTERS.push({id, g, name, icon, stages:ids, boss:{id:bid, name:bossName, icon:'👹'}});
  list.forEach(([nm, ic], i) => MATH_STAGES.push({id:ids[i], ch, name:nm, icon:ic}));
  MATH_STAGES.push({id:bid, ch, name:bossName, icon:'👹', boss:true});
  MATH_BOSS[bid] = MATH_SKILLS[k % MATH_SKILLS.length];
});

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
  const make = RAW[id] || (window.MathMore && MathMore.has(id) ? () => MathMore.gen(id) : null);
  if (!make) throw new Error('MathStages: 모르는 스테이지 ' + id);
  let p, plan;
  for (let i = 0; i < 1000; i++){
    p = make(); plan = M.hintPlan(p);
    if (roundOk(plan)) break;
  }
  p.kind = plan.kind;
  return p;
}

const key = p => p.x ? p.say + p.eq + JSON.stringify(p.g) : M.text(p.a) + p.op + M.text(p.b);
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
// 보통 스테이지는 언제나 골라서 풀 수 있어요.
// 보스는 그 장의 스테이지를 모두 깨야 열려요 (한 번 도전했거나 "모두 열기"면 열림)
function unlocked(S, id){
  const s = MATH_STAGES.find(x => x.id === id), st = (S.math && S.math.stages) || {};
  if (!s) return false;
  if (!s.boss || (S.settings && S.settings.openAll) || st[id]) return true;
  return MATH_STAGES.every(x => x.ch !== s.ch || x.boss || (st[x.id] && st[x.id].stars > 0));
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
