const test = require('node:test'), assert = require('node:assert/strict');
const {load} = require('./load');
const vm = require('vm');

const ctx = load(['words.js', 'sentences.js', 'sentence-island-data.js', 'sentence-island-long.js', 'sentence-island-core.js']);
const C = vm.runInContext('SentIsland', ctx);
const GLOSS = vm.runInContext('SENT_GLOSS', ctx);
const STAGE_SENTENCES = vm.runInContext('STAGE_SENTENCES', ctx);
const CHAPTERS = vm.runInContext('CHAPTERS', ctx);
const J = v => JSON.parse(JSON.stringify(v));
const seq = (...v) => { let i = 0; return () => v[i++ % v.length]; };

test('every gloss matches a word-island sentence and its blocks', () => {
  const all = Object.values(STAGE_SENTENCES).flat();
  for (const en of Object.keys(GLOSS)){
    const s = all.find(x => x.en === en);
    assert.ok(s, `"${en}" is in sentences.js`);
    const g = GLOSS[en].split('|');
    assert.equal(g.length, s.blocks.length, `"${en}" has one meaning per block`);
    assert.ok(g.every(x => x.trim().length > 0), `"${en}" meanings are not empty`);
  }
});

test('every chapter unit is covered', () => {
  for (const id of CHAPTERS.flatMap(c => c.stages)){
    assert.equal(C.BY_UNIT[id] && C.BY_UNIT[id].length, STAGE_SENTENCES[id].length, `unit ${id}`);
  }
  assert.equal(C.UNITS[0], CHAPTERS[0].stages[0]);
});

test('only fully covered units open (shared sentences do not open a 1-sentence unit)', () => {
  for (const id of C.UNITS) assert.ok(C.BY_UNIT[id].length >= C.ROUND, `unit ${id}`);
  assert.deepEqual(J(C.openUnits({stages:{25:{stars:3}}})), [25]);
  assert.equal(C.UNITS.length, CHAPTERS.reduce((n, c) => n + c.stages.length, 0));
});

test('ensure fills a fresh save', () => {
  const S = C.ensure({});
  assert.deepEqual(J(S.sent), {stamps:0, last:'', daily:'', learned:{}, played:0});
});

test('pool: first unit when nothing is cleared, otherwise cleared units', () => {
  assert.deepEqual(J(C.openUnits({stages:{}})), [C.UNITS[0]]);
  assert.deepEqual(J(C.openUnits({stages:{2:{stars:1}, 3:{stars:0}, 31:{stars:3}}})), [2, 31]);
});

test('pick: 6 problems, daily alternates read/make, less-learned first', () => {
  const S = C.ensure({stages:{}});
  const first = C.BY_UNIT[C.UNITS[0]];
  first.slice(0, 2).forEach(s => S.sent.learned[s.en] = 5);
  const r = C.pick(S, 'daily');
  assert.equal(r.length, 6);
  assert.deepEqual(J(r.map(x => x.t)), ['read','make','read','make','read','make']);
  const learned = new Set(first.slice(0, 2).map(s => s.en));
  assert.ok(r.every(x => !learned.has(x.s.en)), 'well-learned sentences wait');
  assert.ok(C.pick(S, 'read').every(x => x.t === 'read'));
  assert.ok(C.pick(S, 'make').every(x => x.t === 'make'));
});

test('choices: 3 different meanings with the right one, no same-English chunk', () => {
  for (const s of C.ALL){
    s.blocks.forEach((b, i) => {
      const c = C.choices(s, i);
      assert.equal(c.length, 3, `${s.en} #${i}`);
      assert.equal(new Set(c).size, 3);
      assert.ok(c.includes(s.gloss[i]));
      // 정답 뜻을 품거나 정답에 들어 있는 뜻은 오답으로 안 나와요
      assert.ok(c.filter(x => x !== s.gloss[i]).every(x => !C.overlap(x, s.gloss[i])), `${s.en} #${i}: ${c}`);
      // 오답 뜻이 같은 영어 덩어리에서 오지 않아요 (is 는 늘 "~이에요" 라 헷갈려요)
      for (const g of c.filter(x => x !== s.gloss[i])){
        const from = C.ALL.flatMap(o => o.blocks.map((bb, j) => [bb, o.gloss[j]])).filter(([, gg]) => gg === g);
        assert.ok(from.some(([bb]) => bb.toLowerCase() !== b.toLowerCase()), `${s.en} #${i}: ${g}`);
      }
    });
  }
});

test('choices: near-synonym meanings are never wrong options for each other', () => {
  const CLOSE = vm.runInContext('SENT_CLOSE', ctx);
  for (const s of C.ALL){
    s.blocks.forEach((_, i) => {
      const g = CLOSE.find(x => x.includes(s.gloss[i]));
      if (!g) return;
      for (let n = 0; n < 5; n++){
        const wrong = C.choices(s, i).filter(x => x !== s.gloss[i]);
        assert.ok(wrong.every(x => !g.includes(x)), `${s.en} #${i}: ${wrong}`);
      }
    });
  }
});

test('shuffleBlocks never starts in the right order', () => {
  const s = C.ALL[0];
  const b = C.shuffleBlocks(s, seq(0.99, 0.99, 0.99, 0.1, 0.5));
  assert.equal(b.length, s.blocks.length);
  assert.ok(!b.every((v, i) => v === i));
  assert.deepEqual(J([...b].sort()), J(s.blocks).map((_, i) => i));
});

test('challenge mode: all make problems, bigger reward', () => {
  const S = C.ensure({stages:{}});
  assert.ok(C.pick(S, 'challenge').every(x => x.t === 'make'));
  assert.ok(C.reward('challenge', true).xp > C.reward('make', true).xp);
  assert.ok(C.reward('challenge', true).coin > C.reward('daily', true).coin);
  assert.deepEqual(J(C.reward('read', false)), {xp:4, coin:0});
});

test('stars by mistakes', () => {
  assert.equal(C.stars(0), 3); assert.equal(C.stars(2), 2); assert.equal(C.stars(3), 1);
});

test('learn counts only clean solves', () => {
  const S = C.ensure({});
  C.learn(S, 'I like rice.', false);
  assert.equal(C.learnedCount(S), 0);
  C.learn(S, 'I like rice.', true); C.learn(S, 'I like rice.', true);
  assert.equal(S.sent.learned['I like rice.'], 2);
  assert.equal(C.learnedCount(S), 1);
});

test('daily stamp: once a day, full board every 7', () => {
  const S = C.ensure({});
  assert.deepEqual(J(C.finishDaily(S, 'd1')), {stamp:true, full:false});
  assert.deepEqual(J(C.finishDaily(S, 'd1')), {stamp:false, full:false});
  assert.equal(S.sent.stamps, 1);
  assert.ok(C.doneToday(S, 'd1')); assert.ok(!C.doneToday(S, 'd2'));
  for (let d = 2; d <= 6; d++) C.finishDaily(S, 'd' + d);
  assert.deepEqual(J(C.board(S, 'd6')), {on:6, size:7, total:6, full:0});
  assert.deepEqual(J(C.finishDaily(S, 'd7')), {stamp:true, full:true});
  assert.deepEqual(J(C.board(S, 'd7')), {on:7, size:7, total:7, full:1});
  assert.deepEqual(J(C.board(S, 'd8')), {on:0, size:7, total:7, full:1});
  // 하루 빠져도 판은 이어져요
  C.finishDaily(S, 'd10');
  assert.deepEqual(J(C.board(S, 'd10')), {on:1, size:7, total:8, full:1});
});

// ---------- 📜 긴 문장 ----------
const LONG = vm.runInContext('LONG_SENTENCES', ctx);
const SHORT = new Set(Object.values(STAGE_SENTENCES).flat().map(x => x.en));

test('long sentences: 12 per chapter, well-formed', () => {
  assert.equal(Object.keys(LONG).length, CHAPTERS.length);
  const seen = new Set();
  for (const c of Object.keys(LONG)){
    assert.equal(LONG[c].length, 12, `chapter ${c}`);
    for (const [en, ko, b, g] of LONG[c]){
      const blocks = b.split('|'), gloss = g.split('|'), body = en.replace(/[.!?]$/, '');
      assert.match(en, /[.!?]$/, en);
      assert.equal(blocks.join(' '), body, en);
      const wc = body.split(/\s+/).length;
      assert.ok(wc >= 8 && wc <= 14, `${en}: ${wc} words`);
      assert.ok(blocks.length >= 4 && blocks.length <= 7, `${en}: ${blocks.length} blocks`);
      assert.equal(new Set(blocks.map(x => x.toLowerCase())).size, blocks.length, `${en}: blocks differ`);
      assert.equal(gloss.length, blocks.length, `${en}: one meaning per block`);
      assert.ok(ko.trim() && gloss.every(x => x.trim()), en);
      assert.ok(!seen.has(en) && !SHORT.has(en), `${en}: not duplicated`); seen.add(en);
    }
  }
  assert.equal(C.LONG.length, 12 * CHAPTERS.length);
});

test('long sentences open per cleared chapter', () => {
  assert.deepEqual(J(C.longChapters({stages:{}})), []);
  const all1 = {}; CHAPTERS[0].stages.forEach(id => all1[id] = {stars:1});
  assert.deepEqual(J(C.longChapters({stages:all1})), [1]);
  const most = {...all1}; delete most[CHAPTERS[0].stages[3]];
  assert.deepEqual(J(C.longChapters({stages:most})), []);
  assert.equal(C.longChapters({stages:{}, settings:{openAll:true}}).length, CHAPTERS.length);
});

test('long round: empty when locked, otherwise 6 long problems alternating', () => {
  assert.equal(C.pick(C.ensure({stages:{}}), 'long').length, 0);
  const st = {}; CHAPTERS[1].stages.forEach(id => st[id] = {stars:2});
  const r = C.pick(C.ensure({stages:st}), 'long');
  assert.equal(r.length, 6);
  assert.deepEqual(J(r.map(x => x.t)), ['read','make','read','make','read','make']);
  assert.ok(r.every(x => x.s.long && x.s.ch === 2));
  assert.ok(C.reward('long', true).xp > C.reward('daily', true).xp);
});

test('long choices: 3 meanings, wrong ones from other long sentences when possible', () => {
  const longGloss = new Set(C.LONG.flatMap(o => o.gloss));
  for (const s of C.LONG){
    s.blocks.forEach((_, i) => {
      const c = C.choices(s, i);
      assert.equal(c.length, 3, `${s.en} #${i}`);
      assert.equal(new Set(c).size, 3);
      assert.ok(c.includes(s.gloss[i]));
      assert.ok(c.filter(x => x !== s.gloss[i]).every(x => !C.overlap(x, s.gloss[i])));
    });
  }
  // 대부분의 오답은 긴 문장에서 와요
  let fromLong = 0, total = 0;
  for (const s of C.LONG.slice(0, 30)) s.blocks.forEach((_, i) => C.choices(s, i).filter(x => x !== s.gloss[i]).forEach(x => { total++; if (longGloss.has(x)) fromLong++; }));
  assert.ok(fromLong / total > 0.9, `${fromLong}/${total}`);
  // 1장 긴 문장의 오답은 1장 긴 문장에서 와요 (모르는 어려운 말이 안 나오게)
  const ch1 = new Set(C.LONG_BY_CH[1].flatMap(o => o.gloss));
  let in1 = 0, t1 = 0;
  for (const s of C.LONG_BY_CH[1]) s.blocks.forEach((_, i) => C.choices(s, i).filter(x => x !== s.gloss[i]).forEach(x => { t1++; if (ch1.has(x)) in1++; }));
  assert.ok(in1 / t1 > 0.9, `${in1}/${t1}`);
});

// ---------- 🔀 순서 바꾸기 ----------
test('order mode: sentences of cleared units in any chapter, all kmake problems', () => {
  const fresh = C.pick(C.ensure({stages:{}}), 'order');
  assert.equal(fresh.length, 6);
  assert.ok(fresh.every(x => x.t === 'kmake' && x.s.unit === CHAPTERS[0].stages[0]));
  // 깬 단원이 9장 단원뿐이면 9장 문장이 나와요
  const id9 = CHAPTERS[8].stages[0];
  const r = C.pick(C.ensure({stages:{[id9]:{stars:1}}}), 'order');
  assert.ok(r.every(x => x.t === 'kmake' && x.s.unit === id9), J(r.map(x => x.s.unit)).join());
});

test('orderLong mode: long sentences of cleared chapters, all kmake', () => {
  assert.equal(C.pick(C.ensure({stages:{}}), 'orderLong').length, 0);
  const st = {}; CHAPTERS[0].stages.forEach(id => st[id] = {stars:1});
  const r = C.pick(C.ensure({stages:st}), 'orderLong');
  assert.equal(r.length, 6);
  assert.ok(r.every(x => x.t === 'kmake' && x.s.long && x.s.ch === 1));
  assert.deepEqual(J(C.reward('orderLong', true)), J(C.reward('long', true)));
});
