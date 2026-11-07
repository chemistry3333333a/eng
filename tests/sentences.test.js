const test = require('node:test'), assert = require('node:assert/strict');
const {load} = require('./load');
const vm = require('vm');

const ctx = load(['words.js', 'sentences.js']);
const C = vm.runInContext('SentenceCore', ctx);
const STAGE_SENTENCES = vm.runInContext('STAGE_SENTENCES', ctx);
const STAGE_DEFS = vm.runInContext('STAGE_DEFS', ctx);
const J = v => JSON.parse(JSON.stringify(v));

for (const id of Object.keys(STAGE_SENTENCES)) {
  const list = STAGE_SENTENCES[id];
  const words = STAGE_DEFS[id].words.map(x => x[0]);

  test(`stage ${id}: one sentence per stage word`, () => {
    assert.deepEqual(J(list.map(s => s.w)).sort(), [...words].sort());
  });

  test(`stage ${id}: sentence data is consistent`, () => {
    for (const s of list) {
      assert.match(s.en, new RegExp(`\\b${s.w}\\b`), `${s.en} has "${s.w}"`);
      assert.ok(s.en.startsWith(s.blocks.join(' ')), `${s.en} blocks`);
      assert.match(C.end(s), /^[.!?]$/);
      assert.ok(s.blocks.length >= 3);
      assert.ok(s.ko.length > 0);
    }
  });
}

test('stage 1 has a sentence round, others do not yet', () => {
  assert.ok(C.has(1));
  assert.ok(!C.has(2));
});

test('plan: 6 different words, 3 listen → 3 order', () => {
  for (let i = 0; i < 200; i++) {
    const p = J(C.plan(1));
    assert.deepEqual(p.map(q => q.t), ['listen', 'listen', 'listen', 'order', 'order', 'order']);
    assert.equal(new Set(p.map(q => q.w)).size, 6);
  }
});

test('options include the answer and are distinct', () => {
  for (let i = 0; i < 200; i++) {
    const l = J(C.listenOpts(1, 'peach', 3));
    assert.equal(l.length, 3); assert.ok(l.some(s => s.w === 'peach')); assert.equal(new Set(l.map(s => s.ko)).size, 3);
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
