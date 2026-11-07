const test = require('node:test'), assert = require('node:assert');
const {load} = require('./load');

// math-hint.js 는 불러올 때 <style> 만 붙여요. 가짜 document 로 충분
const doc = {createElement: () => ({}), head: {appendChild(){}}};
const ctx = load(['math-core.js', 'math-hint.js'], {document: doc});
const M = ctx.MathCore, T = ctx.MathHint._t;

const num = s => { const m = s.match(/^(?:(\d+) )?(\d+)\/(\d+)$/); return m ? M.frac(+(m[1] || 0), +m[2], +m[3]) : M.dec(+s); };
function prob(s){
  const [, x, op, y] = s.match(/^(.+?)([+-])(.+)$/);
  let a = num(x), b = num(y);
  if (a.t === 'd' && b.t === 'f') a = M.frac(a.h / 100, 0, b.d);
  if (b.t === 'd' && a.t === 'f') b = M.frac(b.h / 100, 0, a.d);
  return {a, b, op, ans: op === '+' ? M.add(a, b) : M.sub(a, b)};
}
const EX = ['0.35+0.8', '2.7+1.4', '0.35+0.48', '3/5+4/5', '0.3+0.4', '0.7-0.3', '0.53-0.28', '1.2-0.35',
            '1 2/5-4/5', '3-1.25', '1-3/8', '1.25-0.4', '3 1/5-1 3/5', '1 2/7+2 6/7', '1.9-0.35'];
const strip = h => h.replace(/<span class="mf"><span>(\d+)<\/span><span class="md">(\d+)<\/span><\/span>/g, '[$1|$2]').replace(/<[^>]+>/g, '');

test('MathHint exposes ask and run', () => {
  assert.equal(typeof ctx.MathHint.ask, 'function'); assert.equal(typeof ctx.MathHint.run, 'function');
});

test('why() names the classic mistakes', () => {
  assert.match(strip(T.why(prob('2.7+1.4'), M.dec(3.11))), /"0\.11"로 쓴 거예요.*1\.1이에요/);
  assert.match(strip(T.why(prob('0.35+0.8'), M.dec(0.43))), /자리를 안 맞추고/);
  assert.match(strip(T.why(prob('3/5+4/5'), M.frac(0, 7, 10))), /분모끼리도 더한/);
  assert.match(strip(T.why(prob('0.53-0.28'), M.dec(0.35))), /큰 숫자에서 작은 숫자를 뺀/);
  assert.match(strip(T.why(prob('3 1/5-1 3/5'), M.frac(2, 2, 5))), /분자를 거꾸로/);
});

test('why() only blames carry/borrow when the problem has one', () => {
  assert.match(strip(T.why(prob('0.3+0.4'), M.dec(0.6))), /정답보다 0\.1만큼 작아요/);
  assert.match(strip(T.why(prob('0.7-0.3'), M.dec(0.5))), /정답보다 0\.1만큼 커요/);
  assert.match(strip(T.why(prob('2 3/5-1 1/5'), M.frac(2, 2, 5))), /정답보다 1만큼 커요/);
  assert.match(strip(T.why(prob('1.2-0.35'), M.dec(0.95))), /윗자리를 하나 줄이는/);
  assert.match(strip(T.why(prob('3/5+4/5'), M.frac(0, 2, 5))), /자연수로 올리는/);
});

test('why() and tip() never print a one-line fraction', () => {
  for (const s of EX){
    const p = prob(s), plan = M.hintPlan(p);
    const ws = M.distractors(p, 4).map(w => T.why(p, w));
    for (const h of [T.tip(plan, p), ...ws]) assert.ok(!/\d\/\d/.test(strip(h)), `${s}: ${strip(h)}`);
  }
});

test('splits() breaks a board and/or a bar only as needed', () => {
  const plain = a => a.map(x => ({b:x.b, t:x.t, s:x.s, c:x.c}));
  // 2 − 0.25: 판 → 막대 10개, 막대 → 작은 칸 10개
  let s = T.splits({b:2, t:0, s:0}, {b:0, t:2, s:5});
  assert.equal(s.length, 3); assert.deepEqual([s[0].from, s[1].from], ['b', 't']);
  assert.deepEqual(plain([s[2]])[0], {b:1, t:9, s:10, c:undefined});
  // 1.9 − 0.35: 막대 → 작은 칸 10개만
  s = T.splits({b:1, t:9, s:0}, {b:0, t:3, s:5});
  assert.equal(s.length, 2); assert.equal(s[0].from, 't'); assert.equal(s[1].s, 10);
  // 0.5 − 0.25 (내려가기 마지막): 막대 1개만 쪼개요
  s = T.splits({b:0, t:5, s:0}, {b:0, t:2, s:5});
  assert.equal(s.length, 2); assert.deepEqual([s[1].t, s[1].s], [4, 10]);
  // 1 − 3/8: 판 → 8칸
  s = T.splits({b:1, c:0}, {b:0, c:3}, 8);
  assert.equal(s.length, 2); assert.deepEqual([s[1].b, s[1].c], [0, 8]);
});

test('plain() reads stacked fractions aloud', () => {
  assert.equal(T.plain(M.html(M.frac(0, 2, 5)) + ' + 1'), '5분의 2 더하기 1');
});
