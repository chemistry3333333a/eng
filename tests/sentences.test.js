const test = require('node:test'), assert = require('node:assert/strict');
const {load} = require('./load');
const vm = require('vm');

const ctx = load(['words.js', 'sentences.js']);
const C = vm.runInContext('SentenceCore', ctx);
const STAGE_SENTENCES = vm.runInContext('STAGE_SENTENCES', ctx);
const STAGE_DEFS = vm.runInContext('STAGE_DEFS', ctx);
const CHAPTERS = vm.runInContext('CHAPTERS', ctx);
const J = v => JSON.parse(JSON.stringify(v));

for (const id of Object.keys(STAGE_SENTENCES)) {
  const list = STAGE_SENTENCES[id];
  const words = STAGE_DEFS[id].words.map(x => x[0]);

  test(`stage ${id}: one sentence per stage word`, () => {
    assert.deepEqual(J(list.map(s => s.w)).sort(), [...words].sort());
  });

  test(`stage ${id}: sentence data is consistent`, () => {
    for (const s of list) {
      assert.match(s.en, C.wordRe(s.w), `${s.en} has "${s.w}"`);
      assert.ok(s.en.startsWith(s.blocks.join(' ')), `${s.en} blocks`);
      assert.match(C.end(s), /^[.!?]$/, `${s.en} ends with . ! ?`);
      assert.ok(s.blocks.length >= 3, `${s.en} has 3+ blocks`);
      assert.equal(new Set(s.blocks).size, s.blocks.length, `${s.en} blocks are different`);
      assert.ok(s.ko.length > 0);
      // 빈칸 보기가 헷갈리지 않게: 같은 단원의 다른 단어는 문장에 없어요
      for (const o of words) if (o !== s.w) assert.doesNotMatch(s.en, C.wordRe(o), `${s.en} has other word "${o}"`);
    }
  });

  test(`stage ${id}: meanings are all different`, () => {
    assert.equal(new Set(list.map(s => s.ko)).size, list.length);
    assert.equal(new Set(list.map(s => s.en)).size, list.length);
  });
}

test('chapter 1 and 2 stages have a sentence round, bosses and later chapters do not', () => {
  for (const ci of [0, 1]) {
    for (const id of CHAPTERS[ci].stages) assert.ok(C.has(id), `stage ${id}`);
    assert.ok(!C.has(CHAPTERS[ci].boss.id));
  }
  assert.ok(!C.has(CHAPTERS[2].stages[0]));
  assert.ok(!C.has('review'));
});

test('plan: 6 different words, 2 listen → 2 blank → 2 order', () => {
  for (const id of Object.keys(STAGE_SENTENCES)) {
    for (let i = 0; i < 50; i++) {
      const p = J(C.plan(id));
      assert.deepEqual(p.map(q => q.t), ['listen', 'listen', 'blank', 'blank', 'order', 'order']);
      assert.equal(new Set(p.map(q => q.w)).size, 6);
    }
  }
});

test('listen options include the answer and are distinct', () => {
  for (let i = 0; i < 200; i++) {
    const l = J(C.listenOpts(1, 'peach', 3));
    assert.equal(l.length, 3); assert.ok(l.some(s => s.w === 'peach')); assert.equal(new Set(l.map(s => s.ko)).size, 3);
  }
});

test('blank: splits the sentence around the word, keeps capital letters', () => {
  assert.deepEqual(J(C.blank(C.find(1, 'grape'))), {pre: 'I like ', word: 'grape', post: ' juice.'});
  assert.deepEqual(J(C.blank(C.find(50, 'excuse me'))), {pre: '', word: 'Excuse me', post: ', where is the park?'});
  assert.deepEqual(J(C.blank(C.find(32, 'mother'))), {pre: 'My ', word: 'mother', post: ' is kind.'});   // grandmother 와 헷갈리지 않아요
  for (const id of Object.keys(STAGE_SENTENCES)) {
    for (const s of STAGE_SENTENCES[id]) {
      const b = C.blank(s);
      assert.equal(b.pre + b.word + b.post, s.en);
      assert.equal(b.word.toLowerCase(), s.w.toLowerCase());
    }
  }
});

test('blank options: answer + other words of the stage, no repeats', () => {
  for (const id of Object.keys(STAGE_SENTENCES)) {
    const words = STAGE_SENTENCES[id].map(s => s.w);
    for (let i = 0; i < 50; i++) {
      const w = words[i % words.length];
      const o = J(C.blankOpts(id, w, 3));
      assert.equal(o.length, 3);
      assert.ok(o.includes(w));
      assert.equal(new Set(o).size, 3);
      assert.ok(o.every(x => words.includes(x)));
    }
  }
});

test('order: shuffled blocks never start solved, check works', () => {
  const s = C.find(1, 'watermelon');
  for (let i = 0; i < 200; i++) {
    const b = J(C.shuffleBlocks(s));
    assert.notDeepEqual(b, J(s.blocks));
    assert.deepEqual([...b].sort(), [...J(s.blocks)].sort());
  }
  assert.ok(C.orderOk(s, ['I', 'eat', 'watermelon', 'in summer']));
  assert.ok(!C.orderOk(s, ['eat', 'I', 'watermelon', 'in summer']));
});

test('old saved rounds (listen/order only) still find their sentences', () => {
  // 예전에 저장된 문장 라운드: {t:'listen'|'order', w}. 과일 숲 문장은 그대로라 이어서 할 수 있어요
  for (const w of ['apple', 'banana', 'grape', 'orange', 'strawberry', 'watermelon', 'peach', 'lemon']) assert.ok(C.find(1, w));
});
