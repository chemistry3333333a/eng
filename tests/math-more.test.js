const test = require('node:test'), assert = require('node:assert/strict');
const {load} = require('./load');
const vm = require('vm');

// math-hint.js 는 불러올 때 <style> 만 붙여요. 가짜 document 로 충분
const doc = {createElement: () => ({}), head: {appendChild(){}}};
const ctx = load(['math-core.js', 'math-more.js', 'math-fig.js', 'math-stages.js', 'math-hint.js'], {document: doc});
const M = ctx.MathCore, MS = ctx.MathStages, MM = ctx.MathMore, MH = ctx.MathHint, MF = ctx.MathFig;
const {Q, N, Fr, Dn, R} = MM._v;
const MATH_STAGES = vm.runInContext('MATH_STAGES', ctx);
const MATH_CHAPTERS = vm.runInContext('MATH_CHAPTERS', ctx);
const MATH_BOSS = vm.runInContext('MATH_BOSS', ctx);
const J = v => JSON.parse(JSON.stringify(v));
const NEW = MATH_STAGES.slice(12), plainNew = NEW.filter(s => !s.boss);
const SLASH = /\d\s*\/\s*\d/;                       // 화면 문구에 "3/5" 같은 한 줄 분수가 있으면 안 돼요
const strip = h => String(h).replace(/<[^>]+>/g, '');
const val = v => v.t === 'r' ? v.a / v.b : v.n / v.d;   // 값 (비는 비율)
const close = (a, b) => Math.abs(a - b) < 1e-9;

// ── 값 ──
test('new values print and compare as expected', () => {
  assert.equal(M.text(Dn(0.075)), '0.075');
  assert.equal(M.text(Dn(9.4)), '9.4');
  assert.equal(M.text(Q(35, 100, 'p')), '35%');
  assert.equal(M.text(Q(3, 8, 'p')), '37.5%');
  assert.equal(M.text(Fr(7, 3)), '2 1/3');
  assert.equal(M.text(Fr(6, 8)), '3/4');
  assert.equal(M.text(Fr(6, 3)), '2');
  assert.equal(M.text(N(12, 'cm²')), '12cm²');
  assert.equal(M.text(R(3, 4)), '3 : 4');
  assert.ok(M.same(Dn(0.5), Fr(1, 2)) && M.same(Q(1, 2, 'p'), Dn(0.5)));    // 값이 같으면 같아요
  assert.ok(!M.same(R(2, 3), R(4, 6)) && M.same(R(2, 3), R(2, 3)));          // 비는 항이 같아야 해요
  assert.ok(!M.same(N(2), M.dec(2)));                                          // 예전 값과는 섞지 않아요
  assert.ok(M.html(Fr(7, 3)).includes('class="mf"') && !SLASH.test(strip(M.html(Fr(7, 3)))));
  assert.ok(M.html(N(5, 'cm')).includes('class="mu"'));
  assert.equal(M.html(N(60, '°')), '60°');
  assert.equal(M.bat(N(10)), true); assert.equal(M.bat(N(5)), false);         // 십 / 오
  assert.equal(M.bat(Fr(1, 3)), true); assert.equal(M.bat(Fr(2, 3)), false);  // 삼분의 일 / 삼분의 이
  assert.equal(M.bat(N(7, 'cm')), false); assert.equal(M.bat(N(6, '각기둥')), true);
});

// ── 저장 호환 ──
test('old stages keep ids, order and chapters; new chapters only append', () => {
  assert.deepEqual(J(MATH_STAGES.slice(0, 12).map(s => s.id)), [
    'm-fr1', 'm-fr2', 'm-fr3', 'm-fr4', 'm-fr5', 'm-frB', 'm-de1', 'm-de2', 'm-de3', 'm-de4', 'm-de5', 'm-deB']);
  assert.equal(MATH_CHAPTERS[0].id, 'fr'); assert.equal(MATH_CHAPTERS[1].id, 'de');
  const ids = MATH_STAGES.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length, 'unique ids');
  MATH_CHAPTERS.forEach((c, i) => {
    assert.ok(/^[456]-[12]$/.test(c.g), c.id + ' grade');
    const st = MATH_STAGES.filter(s => s.ch === i);
    assert.deepEqual(J(st.filter(s => !s.boss).map(s => s.id)), J(c.stages));
    assert.equal(st[st.length - 1].id, c.boss.id); assert.ok(st[st.length - 1].boss);
    assert.ok(MATH_BOSS[c.boss.id], c.boss.id + ' boss info');
  });
  // 첫 PR 의 21개 챕터는 학년 순서대로, 그림 단원 5개는 번호가 안 바뀌게 맨 뒤에
  const ids2 = MATH_CHAPTERS.map(c => c.id);
  assert.deepEqual(J(ids2.slice(2, 23)), ['pg', 'mx', 'dm', 'cr', 'rc', 'fu', 'ar', 'ro', 'fm', 'dx', 'cb', 'av', 'fd', 'pm', 'dd', 'rt', 'vb', 'fq', 'dq', 'pp', 'ci']);
  assert.deepEqual(J(ids2.slice(23)), ['lg', 'sy', 'gr', 'st', 'cy']);
  assert.equal(MATH_STAGES.findIndex(s => s.id === 'm-ciB'), 104);             // 첫 PR 의 마지막 스테이지(105번째) 번호 그대로
});

test('an old save opens the first new stage only after the last old boss', () => {
  const S = MS.ensure({settings: {}, math: {coins: 40, stages: {'m-fr1': {stars: 3, best: 120}}, trophies: {'m-frB': 2}}});
  assert.equal(MS.unlocked(S, 'm-pg1'), false);
  S.math.stages['m-deB'] = {stars: 1, best: 50};
  assert.equal(MS.unlocked(S, 'm-pg1'), true);
  assert.equal(MS.unlocked(S, 'm-pg2'), false);
  assert.equal(S.math.trophies['m-frB'], 2); assert.equal(S.math.coins, 40);
  assert.equal(MS.unlocked(MS.ensure({settings: {openAll: true}}), 'm-ciB'), true);
});

test('boss skills for new bosses are math-friendly', () => {
  for (const s of NEW.filter(x => x.boss)) assert.ok(['ice', 'swap', 'web', 'ghost'].includes(MATH_BOSS[s.id].skill), s.id);
});

// ── 모든 새 스테이지: 문제, 보기, 힌트, 설명 ──
test('every new stage makes sound problems, options and hint plans (300 each)', () => {
  for (const st of plainNew) for (let i = 0; i < 300; i++) {
    const p = MS.gen(st.id), L = `${st.id} ${strip(p.say)} ${strip(p.eq)}`;
    assert.equal(p.x, st.id.slice(2), L);
    assert.equal(p.kind, p.x, L);
    assert.equal(JSON.stringify(JSON.parse(JSON.stringify(p))), JSON.stringify(p), L + ' JSON');
    assert.ok(p.eq.includes(MM.QS), L + ' no ? in eq');
    assert.ok(val(p.ans) > 0 || (p.x === 'av3' && val(p.ans) === 0), L + ' answer > 0');
    for (const h of [M.problemHtml(p), M.answerHtml(p)]) {
      assert.ok(!SLASH.test(strip(h)), L + ' slash: ' + strip(h));
      assert.ok(!/NaN|undefined|Infinity/.test(h), L + ' broken: ' + strip(h));
    }
    assert.ok(M.answerHtml(p).includes(M.html(p.ans)), L + ' answer line shows the answer');
    // 보기: 정답 한 번, 값이 모두 달라요
    const n = 3 + (i % 3), o = MS.options(p, n);
    assert.equal(o.length, n, L);
    assert.equal(o.filter(v => M.same(v, p.ans)).length, 1, L + ' ' + o.map(M.text));
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) assert.ok(!M.same(o[a], o[b]), L + ' dup ' + o.map(M.text));
    o.forEach(v => assert.ok(val(v) >= 0, L + ' negative option'));
    // 힌트: 단계마다 보기 3개, 마지막 답 = 정답
    const pl = M.hintPlan(p);
    assert.ok(pl.ext && pl.steps.length >= 1, L);
    assert.ok(M.same(pl.steps[pl.steps.length - 1].answer, p.ans), L + ' last step answer');
    for (const s of pl.steps) {
      assert.equal(s.choices.length, 3, L + ' 3 choices');
      assert.equal(s.choices.filter(c => M.same(c, s.answer)).length, 1, L + ' answer once ' + s.choices.map(M.text));
      for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) assert.ok(!M.same(s.choices[a], s.choices[b]), L + ' dup choice');
      assert.ok(s.eq.includes(MM.QS), L + ' step eq needs ?');
      assert.ok(!SLASH.test(strip(s.say)) && !SLASH.test(strip(s.eq)), L + ' slash in step ' + strip(s.say + s.eq));
      assert.ok(!/NaN|undefined/.test(s.say + s.eq + s.choices.map(M.text)), L + ' broken step');
    }
    assert.ok(!SLASH.test(strip(pl.tip)), st.id + ' tip slash');
    // 고른 오답마다 설명 (한 줄 분수 없이)
    o.filter(v => !M.same(v, p.ans)).forEach(w => {
      const y = MH._t.why(p, w);
      assert.equal(typeof y, 'string'); assert.ok(!SLASH.test(strip(y)) && !/NaN|undefined/.test(y), L + ' why: ' + strip(y));
    });
  }
});

test('buildQueue: 10 per new stage, 12 per new boss mixing its chapter, no duplicates', () => {
  for (const st of NEW) for (let i = 0; i < 15; i++) {
    const q = MS.buildQueue(st.id), key = p => p.say + p.eq + JSON.stringify(p.g);
    assert.equal(q.length, st.boss ? 12 : 10, st.id);
    assert.equal(new Set(q.map(key)).size, q.length, st.id + ' duplicates');
    if (st.boss) assert.ok(new Set(q.map(p => p.x)).size >= Math.min(2, MATH_CHAPTERS[st.ch].stages.length), st.id + ' mixes');
  }
});

// ── 정답을 따로 계산해서 맞춰 봐요 ──
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const CHECK = {
  dm1: p => p.g.n % val(p.ans) === 0,
  dm2: p => val(p.ans) % p.g.k === 0,
  dm3: p => val(p.ans) === gcd(p.g.a, p.g.b),
  dm4: p => val(p.ans) === p.g.a * p.g.b / gcd(p.g.a, p.g.b),
  rc2: p => gcd(p.ans.n, p.ans.d) === 1 && close(val(p.ans), p.g.a / p.g.b),
  rc3: p => val(p.ans) === p.g.b1 * p.g.b2 / gcd(p.g.b1, p.g.b2),
  rc4: p => close(val(p.ans), Math.max(p.g.a1 / p.g.b1, p.g.a2 / p.g.b2)),
  fu1: p => close(val(p.ans), p.g.a1 / p.g.b1 + p.g.a2 / p.g.b2),
  fu2: p => close(val(p.ans), p.g.a1 / p.g.b1 - p.g.a2 / p.g.b2),
  fu3: p => close(val(p.ans), p.g.w1 + p.g.a1 / p.g.b1 + p.g.w2 + p.g.a2 / p.g.b2),
  fu4: p => close(val(p.ans), p.g.w1 + p.g.a1 / p.g.b1 - p.g.w2 - p.g.a2 / p.g.b2),
  fm1: p => close(val(p.ans), p.g.a / p.g.b * p.g.k),
  fm3: p => close(val(p.ans), p.g.a1 / p.g.b1 * p.g.a2 / p.g.b2),
  fd3: p => close(val(p.ans), p.g.a / p.g.b / p.g.k),
  fd4: p => close(val(p.ans), (p.g.w + p.g.a / p.g.b) / p.g.k),
  fq3: p => close(val(p.ans), p.g.k / (p.g.a / p.g.b)),
  fq4: p => close(val(p.ans), (p.g.a1 / p.g.b1) / (p.g.a2 / p.g.b2)),
  dx3: p => close(val(p.ans), p.g.X / 10 * p.g.Y / Math.pow(10, p.g.p2)),
  dd3: p => close(val(p.ans) * p.g.k, p.g.Y / 100),
  dq2: p => close(val(p.ans), (p.g.X / 100) / (p.g.Y / 10)),
  dq4: p => close(val(p.ans), Math.round(p.g.a / p.g.b * 10) / 10),
  rt2: p => close(val(p.ans), p.g.x / p.g.y),
  rt4: p => close(val(p.ans), p.g.n / p.g.d) && p.ans.f === 'p',
  pp1: p => p.ans.t === 'r' && gcd(p.ans.a, p.ans.b) === 1,
  pp2: p => { const t = p.g.t; return t[0] * t[3] === t[1] * t[2]; },            // 외항의 곱 = 내항의 곱
  pp3: p => val(p.ans) * (p.g.x + p.g.y) === p.g.T * p.g.part,
  ci3: p => close(val(p.ans), p.g.r * p.g.r * 3.14),
  av1: p => val(p.ans) === p.g.v.reduce((s, x) => s + x, 0) / p.g.k,
  ro3: p => val(p.ans) === Math.round(p.g.n / p.g.unit) * p.g.unit,
  pg1: p => p.g.t ? 2 * val(p.ans) + p.g.t === 180 : val(p.ans) + 2 * p.g.b === 180,
  vb3: p => val(p.ans) === 2 * (p.g.a * p.g.b + p.g.b * p.g.c + p.g.a * p.g.c),
};
test('answers match an independent calculation (300 each)', () => {
  for (const [x, ok] of Object.entries(CHECK)) for (let i = 0; i < 300; i++) {
    const p = MS.gen('m-' + x);
    assert.ok(ok(p), `${x}: ${strip(p.say)} ${strip(M.answerHtml(p))}`);
  }
});

test('valid() keeps other correct answers out of the options', () => {
  for (let i = 0; i < 300; i++) {
    const a = MS.gen('m-dm1'); MS.options(a, 5).filter(v => !M.same(v, a.ans)).forEach(v => assert.ok(a.g.n % v.n !== 0, 'dm1 another divisor ' + v.n));
    const b = MS.gen('m-dm2'); MS.options(b, 5).filter(v => !M.same(v, b.ans)).forEach(v => assert.ok(v.n % b.g.k !== 0, 'dm2 another multiple ' + v.n));
    const c = MS.gen('m-ro1'); MS.options(c, 5).filter(v => !M.same(v, c.ans)).forEach(v => assert.ok(v.n < c.g.mn || v.n > c.g.mx, 'ro1 in range ' + v.n));
  }
});

test('classic mistakes show up with an explanation', () => {
  const p = {x:'fu1', say:'', eq:MM.QS, ans:Fr(7, 12), g:{a1:1, b1:4, a2:1, b2:3, l:12, n1:3, n2:4}};
  assert.ok(MS.options(p, 4).some(v => M.same(v, Fr(2, 7))), 'adding denominators 1/4 + 1/3 → 2/7');
  assert.ok(MH._t.why(p, Fr(2, 7)).includes('분모끼리 더하면 안 돼요'));
  const q = {x:'mx3', say:'', eq:MM.QS, ans:N(26), g:{e:'5 + 3 × 7', st:[['', '3 × 7', 21], ['', '5 + 21', 26]], w:[[56, '앞에서부터 계산했어요. 곱셈이 먼저예요']]}};
  assert.ok(MS.options(q, 4).some(v => M.same(v, N(56))));
  assert.ok(MH._t.why(q, N(56)).includes('곱셈이 먼저'));
  assert.ok(MH._t.why(q, N(99)).includes('정답은'));                            // 모르는 오답은 정답을 알려 줘요
  assert.equal(MH._t.tip(M.hintPlan(q), q), MM.T.mx3.tip);
});

// ── 그림 ──
const FIGX = ['pg1', 'pg2', 'pg3', 'ar1', 'ar2', 'ar3', 'cb1', 'cb2', 'pm1', 'pm2', 'vb1', 'vb2', 'vb3', 'ci1', 'ci2', 'ci3',
  'lg1', 'lg2', 'sy1', 'sy2', 'sy3', 'gr1', 'gr2', 'st1', 'st2', 'cy1', 'cy2', 'cy3'];
const texts = svg => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m => m[1]);
test('every shape and graph stage draws a clean SVG figure (200 each)', () => {
  for (const x of FIGX) for (let i = 0; i < 200; i++) {
    const p = MS.gen('m-' + x), f = MF.draw(p), L = x + ' ' + strip(M.answerHtml(p));
    assert.ok(/^<svg class="mfig" viewBox="0 0 \d+(\.\d)? \d+(\.\d)?"[^>]*>.*<\/svg>$/s.test(f), L + ' svg');
    assert.ok(!/NaN|undefined|Infinity/.test(f), L + ' broken numbers');
    assert.ok(M.problemHtml(p).includes(f), L + ' figure shown with the question');
  }
  assert.equal(MF.draw(MS.gen('m-mx1')), '');                                   // 그림이 필요 없는 유형
  assert.equal(MF.draw(MS.gen('m-fr1')), '');                                   // 4-2 블록 문제는 그대로
});
test('figures show the problem numbers and mark the unknown with ?', () => {
  for (let i = 0; i < 200; i++) {
    let p = MS.gen('m-ar1'), t = texts(MF.draw(p));
    assert.ok(t.includes(p.g.a + 'cm') && t.some(s => /\?/.test(s)), 'ar1 ' + t);
    p = MS.gen('m-pg1'); t = texts(MF.draw(p));
    assert.ok(t.includes(p.g.t ? p.g.t + '°' : p.g.b + '°') && t.includes('?'), 'pg1 ' + t);
    p = MS.gen('m-sy1'); t = texts(MF.draw(p));
    assert.ok(p.g.s.every(v => t.includes(v + 'cm')) && t.filter(s => s === '?').length === 1, 'sy1 ' + t);
    p = MS.gen('m-gr1'); t = texts(MF.draw(p));
    assert.ok(t.includes('?') && !t.includes(M.text(p.ans)) || p.g.p.filter(v => v + '%' === M.text(p.ans)).length > 1, 'gr1 hides the answer ' + t);
    p = MS.gen('m-st1'); t = texts(MF.draw(p));
    assert.equal(t.filter(s => /^\d$/.test(s)).length, p.g.grid.flat().length, 'st1 numbers in grid');
    p = MS.gen('m-ci2'); t = texts(MF.draw(p));
    assert.ok(t.includes('?') && t.some(s => s.includes(p.g.C)), 'ci2 ' + t);
  }
});
test('picture units: answers match the data', () => {
  for (let i = 0; i < 300; i++) {
    let p = MS.gen('m-lg1'); assert.equal(val(p.ans), p.g.v[p.g.i]);
    p = MS.gen('m-lg2'); assert.equal(val(p.ans), Math.abs(p.g.v[p.g.j] - p.g.v[p.g.i]));
    p = MS.gen('m-gr1'); assert.equal(p.g.p.reduce((s, x) => s + x, 0), 100); assert.ok(close(val(p.ans) * 100, p.g.p[p.g.h]));
    p = MS.gen('m-gr2'); assert.equal(val(p.ans), p.g.n * p.g.p[p.g.k] / 100); assert.ok(Number.isInteger(val(p.ans)));
    p = MS.gen('m-st1'); assert.equal(val(p.ans), p.g.grid.flat().reduce((s, x) => s + x, 0));
    p = MS.gen('m-sy2'); assert.equal(val(p.ans), p.g.k === 1 ? p.g.B : 180 - p.g.A - p.g.B);
    p = MS.gen('m-cy1'); assert.ok(close(val(p.ans), 2 * p.g.r * 3.14));
    p = MS.gen('m-cy2'); const [r, h, l] = p.g.t; assert.equal(r * r + h * h, l * l);
  }
});
