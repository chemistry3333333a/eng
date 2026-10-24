const test = require('node:test'), assert = require('node:assert');
const {load} = require('./load');

const M = load(['math-core.js']).MathCore;

// 문자열 → 수 값 ("0.35", "1 2/5", "3/8", "3")
function num(s){
  s = s.trim();
  const m = s.match(/^(?:(\d+) )?(\d+)\/(\d+)$/);
  return m ? M.frac(+(m[1] || 0), +m[2], +m[3]) : M.dec(+s);
}
// "1 2/5-4/5" → 문제. 분수 문제의 자연수는 같은 분모 분수로 바꿔요
function prob(str){
  const m = str.match(/^(.+?)([+-])(.+)$/);
  let a = num(m[1]), b = num(m[3]);
  if (a.t !== b.t){ if (a.t === 'd') a = M.frac(a.h / 100, 0, b.d); else b = M.frac(b.h / 100, 0, a.d); }
  const op = m[2];
  return {a, b, op, ans: op === '+' ? M.add(a, b) : M.sub(a, b)};
}
const neg = v => v.t === 'd' ? v.h < 0 : v.w * v.d + v.n < 0;
const SLASH = /\d\s*\/\s*\d/;   // 화면 문구에 "3/5" 같은 한 줄 분수가 있으면 안 돼요

// 모든 계획이 지켜야 할 것
function checkPlan(p, label){
  const pl = M.hintPlan(p);
  const last = pl.steps.filter(s => s.answer).pop();
  assert.ok(last, label + ': no answer step');
  assert.ok(M.same(last.answer, p.ans), `${label}: last answer ${M.text(last.answer)} != ${M.text(p.ans)}`);
  assert.equal(pl.steps.filter(s => s.drag).length, 1, label + ': drag count');
  for (const s of pl.steps){
    assert.equal(typeof s.say, 'string'); assert.equal(typeof s.eq, 'string');
    assert.ok(!SLASH.test(s.say) && !SLASH.test(s.eq), `${label}: slash in "${s.say}" / "${s.eq}"`);
    if (s.drag){ assert.ok(!s.choices, label + ': drag step has choices'); continue; }
    assert.equal(s.choices.length, 3, label + ': 3 choices');
    for (let i = 0; i < 3; i++){
      assert.ok(!neg(s.choices[i]), `${label}: negative choice`);
      for (let j = i + 1; j < 3; j++) assert.ok(!M.same(s.choices[i], s.choices[j]),
        `${label}: duplicate choices ${s.choices.map(M.text)}`);
    }
    assert.equal(s.choices.filter(c => M.same(c, s.answer)).length, 1, label + ': answer once');
  }
  assert.equal(typeof pl.name, 'string'); assert.ok(!SLASH.test(pl.name), label + ': slash in name');
  // 단계 값들끼리 계산이 맞는지
  const {L, R, need, rest, made} = pl;
  if (pl.kind === 'make'){
    assert.ok(M.same(M.add(L, R), p.ans) && M.same(M.add(made, rest), p.ans), label + ': make sums');
    assert.ok(M.same(M.add(L, need), made) && M.same(M.add(need, rest), R), label + ': make parts');
    assert.equal(pl.steps.length, 5, label + ': make steps');
  } else if (pl.kind === 'down'){
    assert.ok(M.same(M.sub(made, rest), p.ans), label + ': down result');
    const Lc = pl.afterWhole || L;
    assert.ok(M.same(M.sub(Lc, need), made), label + ': down made');
    const Rr = pl.whole ? M.sub(R, pl.whole) : R;
    assert.ok(M.same(M.add(need, rest), Rr), label + ': down parts');
    // 내려가는 수는 딱 떨어져요 (자연수, 또는 백분의 일 자리가 0)
    assert.ok(made.t === 'd' ? made.h % 10 === 0 : made.n === 0, `${label}: made not round ${M.text(made)}`);
    assert.equal(pl.steps.length, pl.whole ? 6 : 5, label + ': down steps');
  } else if (pl.kind === 'break'){
    assert.equal(pl.steps.length, pl.whole ? 3 : 2, label + ': break steps');
  } else {
    assert.ok(['gather', 'take'].includes(pl.kind), label + ': kind');
    assert.equal(pl.steps.length, 2, label + ': ' + pl.kind + ' steps');
    assert.ok(M.same(need, R), label + ': bundle is R');
  }
  return pl;
}

// 재현 가능한 난수
function rng(seed){ let s = seed >>> 0; return n => { s = (s * 1664525 + 1013904223) >>> 0; return s % n; }; }
// 정답을 MathCore 없이 정수로 따로 계산해서 무작위 문제를 만들어요
function randomProblem(r){
  const op = r(2) ? '+' : '-';
  if (r(2)){
    const pick = () => { const pl = r(3); // 0: 자연수, 1: 한 자리, 2: 두 자리
      if (pl === 0) return 100 * (1 + r(5));
      if (pl === 1) return 10 * (1 + r(49));
      let h; do { h = 1 + r(499); } while (h % 10 === 0); return h; };
    let x = pick(), y = pick();
    if (op === '+'){ if (x % 100 === 0) x += 10 * (1 + r(9)); }      // 덧셈은 소수끼리
    if (op === '-' && x < y) [x, y] = [y, x];
    if (op === '-' && y % 100 === 0) y += 10 * (1 + r(9));
    if (op === '-' && x < y) [x, y] = [y, x];
    const a = M.dec(x / 100), b = M.dec(y / 100);
    assert.equal(a.h, x); assert.equal(b.h, y);
    return {p: {a, b, op, ans: M.dec((op === '+' ? x + y : x - y) / 100)}, exp: op === '+' ? x + y : x - y};
  }
  const d = 2 + r(11);
  const pick = () => { let T; do { T = r(4) * d + r(d); } while (T === 0); return T; };
  let x = pick(), y = pick();
  if (op === '-' && x < y) [x, y] = [y, x];
  const a = M.frac(0, x, d), b = M.frac(0, y, d);
  return {p: {a, b, op, ans: M.frac(0, op === '+' ? x + y : x - y, d)}, d, exp: op === '+' ? x + y : x - y};
}

test('dec and text round-trip without trailing zeros', () => {
  assert.equal(M.text(M.dec(0.35)), '0.35'); assert.equal(M.text(M.dec(1.10)), '1.1'); assert.equal(M.text(M.dec(3)), '3');
  assert.deepEqual(M.dec(2.7), {t:'d', h:270}); assert.equal(M.text(M.dec(0.05)), '0.05');
});
test('frac normalizes improper to mixed', () => {
  assert.deepEqual(M.frac(0,7,5), {t:'f',w:1,n:2,d:5}); assert.deepEqual(M.frac(1,5,5), {t:'f',w:2,n:0,d:5});
  assert.equal(M.text(M.frac(0,2,5)), '2/5'); assert.equal(M.text(M.frac(0,5,5)), '1');
});
test('same compares by value', () => {
  assert.ok(M.same(M.frac(0,1,5), M.frac(0,2,10))); assert.ok(M.same(M.dec(0.3), M.dec(0.30)));
  assert.ok(!M.same(M.frac(1,2,5), M.frac(0,7,10)));
  assert.ok(M.same(M.frac(0,7,5), M.frac(1,2,5))); assert.ok(!M.same(M.dec(1), M.frac(1,0,5)));
});
test('add/sub', () => {
  assert.equal(M.text(M.add(M.dec(0.35), M.dec(0.8))), '1.15');
  assert.equal(M.text(M.add(M.dec(2.7), M.dec(1.4))), '4.1');
  assert.equal(M.text(M.sub(M.dec(3), M.dec(1.25))), '1.75');
  assert.equal(M.text(M.add(M.frac(0,3,5), M.frac(0,4,5))), '1 2/5');
  assert.equal(M.text(M.sub(M.frac(3,1,5), M.frac(1,3,5))), '1 3/5');
  assert.throws(() => M.add(M.frac(0,1,5), M.frac(0,1,3)));
});
test('html stacks fractions and never prints a slash', () => {
  const h = M.html(M.frac(1,2,5));
  assert.match(h, /class="mx">1<span class="mf"><span>2<\/span><span class="md">5<\/span>/); assert.ok(!h.includes('/5'));
  assert.equal(M.html(M.frac(0,2,5)), '<span class="mf"><span>2</span><span class="md">5</span></span>');
  assert.equal(M.html(M.dec(0.35)), '0.35'); assert.equal(M.html(M.frac(2,0,5)), '2');
});
test('problemHtml uses stacked fractions and a real minus sign', () => {
  const p = prob('1 2/5-4/5');
  const h = M.problemHtml(p);
  assert.ok(h.includes(' − ') && h.endsWith(' = ?') && !SLASH.test(h));
  assert.equal(M.problemHtml(prob('0.35+0.8')), '0.35 + 0.8 = ?');
});
test('distractors include the classic mistakes when possible', () => {
  const p = {a:M.dec(0.35), b:M.dec(0.8), op:'+', ans:M.dec(1.15)};
  assert.ok(M.distractors(p, 3).some(v => M.same(v, M.dec(0.43))));          // 자리 안 맞추기
  const q = {a:M.dec(2.7), b:M.dec(1.4), op:'+', ans:M.dec(4.1)};
  assert.ok(M.distractors(q, 3).some(v => M.same(v, M.dec(3.11))));          // 받아올림을 0.11로
  const f = {a:M.frac(0,3,5), b:M.frac(0,4,5), op:'+', ans:M.frac(1,2,5)};
  assert.ok(M.distractors(f, 3).some(v => M.same(v, M.frac(0,7,10))));       // 분모끼리 더하기
  const s = prob('0.53-0.28');
  assert.ok(M.distractors(s, 3).some(v => M.same(v, M.dec(0.35))));          // 큰 숫자에서 작은 숫자 빼기
  const g = prob('3 1/5-1 3/5');
  assert.ok(M.distractors(g, 3).some(v => M.same(v, M.frac(2,2,5))));        // 분자 자리 바꿔 빼기
});
test('distractors never equal the answer or each other (2000 random problems)', () => {
  const r = rng(12345);
  for (let i = 0; i < 2000; i++){
    const {p, exp, d} = randomProblem(r);
    const label = M.text(p.a) + p.op + M.text(p.b);
    // 정답이 정말 맞는지 (MathCore 덧셈·뺄셈과 정수 계산 비교)
    const got = p.op === '+' ? M.add(p.a, p.b) : M.sub(p.a, p.b);
    if (d) assert.equal(got.w * got.d + got.n, exp, label); else assert.equal(got.h, exp, label);
    for (const n of [3, 5]){
      const ds = M.distractors(p, n);
      assert.equal(ds.length, n, label);
      ds.forEach((v, j) => {
        assert.equal(v.t, p.ans.t, label + ': same kind');
        assert.ok(!neg(v), label + ': negative ' + M.text(v));
        assert.ok(!M.same(v, p.ans), label + ': equals answer ' + M.text(v));
        for (let k = j + 1; k < n; k++) assert.ok(!M.same(v, ds[k]), `${label}: dup ${ds.map(M.text)}`);
      });
    }
  }
});

const kinds = [
  ['0.35+0.8',  'make', {L:'0.8',  R:'0.35', need:'0.2',  rest:'0.15', made:'1',   unit:10}],
  ['2.7+1.4',   'make', {L:'2.7',  R:'1.4',  need:'0.3',  rest:'1.1',  made:'3',   unit:10}],
  ['0.35+0.48', 'make', {L:'0.48', R:'0.35', need:'0.02', rest:'0.33', made:'0.5', unit:1}],
  ['3/5+4/5',   'make', {L:'4/5',  R:'3/5',  need:'1/5',  rest:'2/5',  made:'1'}],
  ['0.3+0.4',   'gather', {}], ['0.7-0.3', 'take', {}],
  ['0.53-0.28', 'down', {L:'0.53', R:'0.28', need:'0.03', rest:'0.25', made:'0.5'}],
  ['1.2-0.35',  'down', {L:'1.2',  R:'0.35', need:'0.2',  rest:'0.15', made:'1'}],
  ['1.25-0.4',  'down', {L:'1.25', R:'0.4', need:'0.25', rest:'0.15', made:'1'}],
  ['1 2/5-4/5', 'down', {L:'1 2/5', R:'4/5', need:'2/5',  rest:'2/5',  made:'1'}],
  ['3-1.25',    'break', {L:'3', R:'1.25', whole:'1', afterWhole:'2'}],
  ['1-3/8',     'break', {L:'1', R:'3/8'}],
];
for (const [str, kind, vals] of kinds){
  test(`hintPlan ${str} → ${kind}`, () => {
    const pl = checkPlan(prob(str), str);
    assert.equal(pl.kind, kind);
    for (const [k, v] of Object.entries(vals)){
      if (k === 'unit') assert.equal(pl.unit, v, str + ' unit');
      else assert.equal(M.text(pl[k]), v, `${str} ${k}`);
    }
  });
}
test('hintPlan names and the whole-number first step', () => {
  assert.equal(M.hintPlan(prob('2.7+1.4')).name, '3 만들기 작전');
  assert.equal(M.hintPlan(prob('0.35+0.48')).name, '0.5 만들기 작전');
  assert.equal(M.hintPlan(prob('0.53-0.28')).name, '0.5까지 내려가기');
  assert.equal(M.hintPlan(prob('0.3+0.4')).name, '같은 블록 모으기');
  assert.equal(M.hintPlan(prob('0.7-0.3')).name, '빼내기');
  assert.equal(M.hintPlan(prob('1-3/8')).name, '쪼개서 빼기');
  // 3 1/5 − 1 3/5: 먼저 3 1/5 − 1 = 2 1/5
  const pl = M.hintPlan(prob('3 1/5-1 3/5'));
  assert.equal(pl.kind, 'down'); assert.equal(M.text(pl.whole), '1'); assert.equal(M.text(pl.afterWhole), '2 1/5');
  assert.equal(M.text(pl.steps[0].answer), '2 1/5');
  assert.equal(M.text(pl.need), '1/5'); assert.equal(M.text(pl.made), '2'); assert.equal(M.text(pl.rest), '2/5');
  // 1.9 − 0.35 는 쪼개서 빼기 (막대만 쪼개요)
  const b19 = M.hintPlan(prob('1.9-0.35'));
  assert.equal(b19.kind, 'break');
  assert.ok(b19.steps[0].say.includes('막대 1개를 작은 칸 10개로') && !b19.steps[0].say.includes('판 1장'));
  // 두 번 쪼개야 하면 둘 다 말해요
  const two = '판 1장을 막대 10개로, 막대 1개를 작은 칸 10개로';
  assert.ok(M.hintPlan(prob('1.2-0.35')).steps[4].say.includes(two));
  assert.ok(M.hintPlan(prob('3-1.25')).steps[1].say.includes(two));
  assert.ok(M.hintPlan(prob('1.25-0.4')).steps[4].say.includes(two));         // 1 − 0.15
  assert.ok(M.hintPlan(prob('2-0.3')).steps.some(s => s.say.includes('판 1장을 막대 10개로 쪼개서')));
});
test('hintPlan invariants hold on 2000 random problems', () => {
  const r = rng(777);
  const seen = {};
  for (let i = 0; i < 2000; i++){
    const {p} = randomProblem(r);
    const pl = checkPlan(p, M.text(p.a) + p.op + M.text(p.b));
    seen[pl.kind] = (seen[pl.kind] || 0) + 1;
  }
  for (const k of ['make', 'gather', 'take', 'down', 'break']) assert.ok(seen[k] > 0, 'kind never seen: ' + k);
});
