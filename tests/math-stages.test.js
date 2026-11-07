const test = require('node:test'), assert = require('node:assert/strict');
const {load} = require('./load');
const vm = require('vm');

const ctx = load(['math-core.js', 'math-stages.js']);
const M = ctx.MathCore, MS = ctx.MathStages;
const MATH_STAGES = vm.runInContext('MATH_STAGES', ctx);
const MATH_CHAPTERS = vm.runInContext('MATH_CHAPTERS', ctx);
const MATH_BOSS = vm.runInContext('MATH_BOSS', ctx);
const J = v => JSON.parse(JSON.stringify(v));   // vm 안 객체는 prototype 이 달라서 deepEqual 전에 옮겨요
const plain = MATH_STAGES.filter(s => !s.boss);
const calc = p => p.op === '+' ? M.add(p.a, p.b) : M.sub(p.a, p.b);
const isFrac = v => v.t === 'f';
const tot = v => v.w * v.d + v.n;

test('stage table has 2 chapters x (5 stages + boss)', () => {
  assert.equal(MATH_CHAPTERS.length, 2);
  assert.deepEqual(J(MATH_CHAPTERS[0].stages), ['m-fr1', 'm-fr2', 'm-fr3', 'm-fr4', 'm-fr5']);
  assert.deepEqual(J(MATH_CHAPTERS[1].stages), ['m-de1', 'm-de2', 'm-de3', 'm-de4', 'm-de5']);
  assert.equal(MATH_CHAPTERS[0].boss.id, 'm-frB');
  assert.equal(MATH_CHAPTERS[1].boss.id, 'm-deB');
  assert.deepEqual(J(MATH_STAGES.map(s => s.id)), [
    'm-fr1', 'm-fr2', 'm-fr3', 'm-fr4', 'm-fr5', 'm-frB',
    'm-de1', 'm-de2', 'm-de3', 'm-de4', 'm-de5', 'm-deB']);
  assert.deepEqual(J(MATH_STAGES.filter(s => s.boss).map(s => s.id)), ['m-frB', 'm-deB']);
});

test('every stage generates correct, in-range problems (500 each)', () => {
  for (const st of plain) for (let i = 0; i < 500; i++) {
    const p = MS.gen(st.id);
    assert.ok(M.same(p.ans, calc(p)), st.id);
    assert.equal(p.kind, M.hintPlan(p).kind);
    assert.ok(['make', 'down', 'gather', 'take', 'break'].includes(p.kind));
    const r = p.ans;
    assert.ok(r.t === 'f' ? tot(r) > 0 : r.h > 0, st.id + ' result > 0');
    const k = st.id.slice(2);
    if (isFrac(p.a)) {
      assert.ok(isFrac(p.b));
      assert.equal(p.a.d, p.b.d);
      assert.ok(p.a.d >= 2 && p.a.d <= 12);
    } else assert.ok(!isFrac(p.b));
    if (k === 'fr1') { assert.equal(p.op, '+'); assert.equal(p.a.w + p.b.w, 0); assert.ok(p.a.n + p.b.n < p.a.d); }
    if (k === 'fr2') { assert.equal(p.op, '+'); assert.equal(p.a.w + p.b.w, 0); assert.ok(p.a.n + p.b.n >= p.a.d); }
    if (k === 'fr3') { assert.equal(p.op, '+'); assert.ok(p.a.w >= 1 && p.a.w <= 3 && p.b.w >= 1 && p.b.w <= 3); }
    if (k === 'fr4') {
      assert.equal(p.op, '-'); assert.equal(p.b.w, 0);
      assert.ok(tot(p.a) > tot(p.b));
      if (p.a.n === 0) assert.equal(p.a.w, 1);
    }
    if (k === 'fr5') {
      assert.equal(p.op, '-'); assert.ok(p.a.w > p.b.w && p.a.w <= 3 && p.b.w >= 1);
    }
    if (k === 'de1') { assert.equal(p.op, '+'); [p.a, p.b].forEach(v => assert.ok(v.h % 10 === 0 && v.h >= 10 && v.h <= 490)); }
    if (k === 'de2') { assert.equal(p.op, '+'); [p.a, p.b].forEach(v => assert.ok(v.h >= 1 && v.h <= 99)); }
    if (k === 'de3') {
      assert.equal(p.op, '+');
      const two = [p.a, p.b].filter(v => v.h % 10 !== 0), one = [p.a, p.b].filter(v => v.h % 10 === 0);
      assert.equal(two.length, 1); assert.equal(one.length, 1);
    }
    if (k === 'de4') { assert.equal(p.op, '-'); assert.ok(p.a.h > p.b.h); }
    if (k === 'de5') {
      assert.equal(p.op, '-');
      assert.ok(p.a.h % 100 === 0 && p.a.h >= 100 && p.a.h <= 500);
      assert.ok(p.b.h >= 10 && p.b.h <= 499);
    }
  }
});

test('fractions: fr1 never carries, fr2 always carries, fr3/fr4/fr5 mix as specified', () => {
  const rate = (id, f, n = 600) => { let c = 0; for (let i = 0; i < n; i++) if (f(MS.gen(id))) c++; return c / n; };
  const carry = p => p.a.n + p.b.n >= p.a.d;
  const borrowFrac = p => p.a.n < p.b.n;
  const r3 = rate('m-fr3', carry); assert.ok(r3 > 0.35 && r3 < 0.65, 'fr3 ' + r3);
  const r4 = rate('m-fr4', p => p.a.n === 0); assert.ok(r4 > 0.35 && r4 < 0.65, 'fr4 ' + r4);
  const r5 = rate('m-fr5', borrowFrac); assert.ok(r5 > 0.6 && r5 < 0.8, 'fr5 ' + r5);
  const de1 = rate('m-de1', p => p.kind === 'make'); assert.ok(de1 > 0.35 && de1 < 0.65, 'de1 ' + de1);
});

// 결과 확인 규칙 3: 소수 덧셈은 만들기 힌트가 항상 딱 떨어지는 수를 만든다
test('decimal addition never has both operands nonzero below the carry place', () => {
  for (const id of ['m-de1', 'm-de2', 'm-de3', 'm-deB']) for (let i = 0; i < 500; i++) {
    const p = MS.gen(id);
    if (p.op !== '+' || isFrac(p.a)) continue;
    const c0 = p.a.h % 10 + p.b.h % 10 >= 10;
    const d1 = v => Math.floor(v.h / 10) % 10;
    const c1 = d1(p.a) + d1(p.b) + (c0 ? 1 : 0) >= 10;
    if (!c0 && c1) assert.ok(p.a.h % 10 === 0 || p.b.h % 10 === 0, M.text(p.a) + '+' + M.text(p.b));
  }
  for (let i = 0; i < 300; i++) { // 보스 큐 전체에서도
    MS.buildQueue('m-deB').filter(p => p.op === '+').forEach(p => {
      const c0 = p.a.h % 10 + p.b.h % 10 >= 10;
      if (!c0) assert.ok(M.hintPlan(p).kind !== 'make' || p.a.h % 10 === 0 || p.b.h % 10 === 0);
    });
  }
});

test('make/down hints always build a round number (every generated problem)', () => {
  const ids = [...plain.map(s => s.id), 'm-frB', 'm-deB'];
  for (const id of ids) for (let i = 0; i < 500; i++) {
    const ps = MS.gen(id.endsWith('B') ? MATH_CHAPTERS[id === 'm-frB' ? 0 : 1].stages[i % 5] : id);
    const plan = M.hintPlan(ps);
    if (plan.kind !== 'make' && plan.kind !== 'down') continue;
    const m = plan.made;
    if (m.t === 'f') assert.equal(m.n, 0, id + ' ' + M.text(ps.a) + ps.op + M.text(ps.b));
    else if (plan.unit === 10) assert.equal(m.h % 100, 0, id + ' ' + M.text(ps.a) + ps.op + M.text(ps.b));
    else assert.equal(m.h % 10, 0, id + ' ' + M.text(ps.a) + ps.op + M.text(ps.b));
  }
  for (const id of ['m-frB', 'm-deB']) for (let i = 0; i < 100; i++) for (const p of MS.buildQueue(id)) {
    const plan = M.hintPlan(p);
    if (plan.kind !== 'make' && plan.kind !== 'down') continue;
    const m = plan.made;
    if (m.t === 'f') assert.equal(m.n, 0);
    else assert.equal(m.h % (plan.unit === 10 ? 100 : 10), 0);
  }
});

test('options are value-distinct and contain the answer once', () => {
  for (const st of plain) for (let i = 0; i < 300; i++) {
    const p = MS.gen(st.id), n = 3 + (i % 3);
    const o = MS.options(p, n);
    assert.equal(o.length, n);
    assert.equal(o.filter(v => M.same(v, p.ans)).length, 1, st.id);
    for (let x = 0; x < n; x++) for (let y = x + 1; y < n; y++) assert.ok(!M.same(o[x], o[y]), st.id + ' ' + M.text(o[x]) + ' ' + M.text(o[y]));
  }
});

test('buildQueue: 10 for stages, 12 for bosses, no duplicates, JSON-serializable', () => {
  const key = p => M.text(p.a) + p.op + M.text(p.b);
  for (const st of MATH_STAGES) for (let i = 0; i < 40; i++) {
    const q = MS.buildQueue(st.id);
    assert.equal(q.length, st.boss ? 12 : 10, st.id);
    assert.equal(JSON.stringify(JSON.parse(JSON.stringify(q))), JSON.stringify(q));   // 저장했다 읽어도 그대로 (vm 객체라 deepEqual 은 못 써요)
    assert.equal(new Set(q.map(key)).size, q.length, st.id + ' duplicates');
    q.forEach(p => assert.ok(M.same(p.ans, calc(p))));
  }
  const q = MS.buildQueue('m-de3'); assert.equal(q.length, 10);
  assert.equal(MS.buildQueue('m-frB').length, 12);
});

test('boss queue mixes the chapter stages', () => {
  const has = (p, pred) => pred(p);
  for (let t = 0; t < 20; t++) {
    const q = MS.buildQueue('m-deB');
    const types = new Set();
    q.forEach(p => {
      if (p.op === '-' && p.a.h % 100 === 0 && p.b.h % 100 !== 0 && p.a.h <= 500) types.add('de5');
      else if (p.op === '-') types.add('de4');
      else if (p.a.h % 10 === 0 && p.b.h % 10 === 0 && p.a.h >= 10 && p.b.h >= 10) types.add('de1');
      else if (p.a.h % 10 !== 0 && p.b.h % 10 !== 0) types.add('de2');
      else types.add('de3');
    });
    assert.ok(types.size >= 3, [...types].join());
    const f = MS.buildQueue('m-frB');
    assert.ok(new Set(f.map(p => p.op + (p.a.w || p.b.w ? 'w' : 'p'))).size >= 3);
  }
});

test('ensure fills math fields and keeps English data', () => {
  const S = {coins: 50, stages: {1: {stars: 2}}, trophies: {10: 3}};
  MS.ensure(S);
  assert.deepEqual(J(S.math), {coins: 0, stages: {}, trophies: {}, session: null, skills: {}});
  assert.equal(S.mode, 'eng'); assert.equal(S.coins, 50); assert.deepEqual(J(S.trophies), {10: 3});
  S.math.coins = 7; MS.ensure(S); assert.equal(S.math.coins, 7);
  const T = {mode: 'math', math: {coins: 3}};
  MS.ensure(T);
  assert.equal(T.mode, 'math'); assert.equal(T.math.coins, 3);
  assert.deepEqual(J(T.math.stages), {}); assert.equal(T.math.session, null);
  assert.equal(MS.ensure(T), T);
});

test('unlocked follows the English rule', () => {
  const S = MS.ensure({settings: {}});
  assert.equal(MS.unlocked(S, 'm-fr1'), true);
  assert.equal(MS.unlocked(S, 'm-fr2'), false);
  S.math.stages['m-fr1'] = {stars: 0};
  assert.equal(MS.unlocked(S, 'm-fr2'), false);
  S.math.stages['m-fr4'] = {stars: 0};            // 기록이 있는 스테이지는 열림
  assert.equal(MS.unlocked(S, 'm-fr4'), true);
  delete S.math.stages['m-fr4'];
  S.math.stages['m-fr1'] = {stars: 1};
  assert.equal(MS.unlocked(S, 'm-fr2'), true);
  assert.equal(MS.unlocked(S, 'm-fr3'), false);
  S.settings.openAll = true;
  assert.equal(MS.unlocked(S, 'm-deB'), true);
});

test('boss skills are visual only', () => {
  assert.deepEqual(J(Object.keys(MATH_BOSS).sort()), ['m-deB', 'm-frB']);
  Object.values(MATH_BOSS).forEach(b => {
    assert.ok(['web', 'ice', 'ghost', 'swap', 'shadow', 'timer'].includes(b.skill));
    assert.equal(typeof b.tip, 'string');
    assert.equal(b.taunt.length, 2); assert.equal(b.rage.length, 2);
  });
});

test('stars: first-try ratio >=90% 3, >=70% 2, else 1', () => {
  assert.equal(MS.stars(10, 10), 3); assert.equal(MS.stars(9, 10), 3);
  assert.equal(MS.stars(8, 10), 2); assert.equal(MS.stars(7, 10), 2);
  assert.equal(MS.stars(6, 10), 1); assert.equal(MS.stars(0, 10), 1);
  assert.equal(MS.stars(11, 12), 3); assert.equal(MS.stars(9, 12), 2); assert.equal(MS.stars(8, 12), 1);
  assert.equal(MS.stars(0, 0), 1);
});

test('bossReward: 💎 30 + stars×10 + hearts×3, math trophy max, no English fields', () => {
  const S = MS.ensure({coins: 100, trophies: {10: 2}, pets: [10], petOn: 10});
  S.math.coins = 5;
  const s = {stage: 'm-frB', hearts: 4, coins: 12};
  const r = MS.bossReward(S, s, 2);
  assert.equal(r.coins, 30 + 20 + 12);
  assert.equal(S.math.coins, 5 + 62); assert.equal(s.coins, 12 + 62);
  assert.equal(S.math.trophies['m-frB'], 2);
  assert.equal(r.trophyUp, true); assert.equal(r.newPet, false);
  assert.equal(r.icon, '💎'); assert.equal(r.name, '피자 마왕'); assert.equal(r.hearts, 4); assert.equal(r.stars, 2);
  assert.equal(S.coins, 100); assert.deepEqual(J(S.trophies), {10: 2});
  assert.deepEqual(J(S.pets), [10]); assert.equal(S.petOn, 10);
  // 더 낮은 별은 트로피를 내리지 않고, 하트가 없거나 음수면 보너스 0
  const r2 = MS.bossReward(S, {stage: 'm-frB', hearts: -1, coins: 0}, 1);
  assert.equal(r2.coins, 40); assert.equal(r2.hearts, 0);
  assert.equal(S.math.trophies['m-frB'], 2); assert.equal(r2.trophyUp, false);
  const r3 = MS.bossReward(S, {stage: 'm-deB', coins: 0}, 3);
  assert.equal(r3.coins, 60); assert.equal(S.math.trophies['m-deB'], 3);
});
