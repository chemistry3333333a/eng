const test = require('node:test'), assert = require('node:assert');
const {load} = require('./load');
const vm = require('vm');
const ctx = load(['items.js']);
const get = n => vm.runInContext(n, ctx);
const eng = () => get('ITEMS').filter(i => i.cur === 'eng');   // 영어 상점 아이템만

test('item ids are unique and slots valid', () => {
  const ids = get('ITEMS').map(i => i.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const i of get('ITEMS')) assert.ok(get('SLOTS').includes(i.slot), i.id);
});
test('every item has an English word and a price in 30..500', () => {
  for (const i of eng()) {
    assert.match(i.word, /^[a-z][a-z ]*$/, i.id);
    assert.ok(i.price >= 30 && i.price <= 500, i.id);
  }
});
test('about 24 items, 4..6 per slot, total 4000..5000', () => {
  const items = eng();
  assert.ok(items.length >= 20 && items.length <= 30);
  for (const s of get('SLOTS')) { const n = items.filter(i => i.slot === s).length; assert.ok(n >= 4 && n <= 6, s); }
  const sum = items.reduce((a, i) => a + i.price, 0);
  assert.ok(sum >= 4000 && sum <= 5000, String(sum));
});
test('at least 3 gift candidates (price <= 30)', () => {
  assert.ok(get('ITEMS').filter(i => i.price <= 30).length >= 3);
});
test('unlock and perk values are from the allowed sets', () => {
  for (const i of get('ITEMS')) {
    if (i.unlock) { const k = Object.keys(i.unlock); assert.equal(k.length, 1, i.id); assert.ok(['level','trophies','dex','mathTrophies'].includes(k[0]), i.id); }
    assert.ok(i.perk === null || ['splash','slow','shield','pierce','coin'].includes(i.perk), i.id);
  }
});
test('items priced 300+ are locked', () => {
  for (const i of get('ITEMS')) if (i.price >= 300) assert.ok(i.unlock, i.id);
});
test('6 bodies, first is kid1; PETS has the 11 boss ids', () => {
  assert.deepEqual(get('BODIES').map(b => b.id), ['kid1','kid2','kid3','cat','dog','bunny']);
  assert.deepEqual(Object.keys(get('PETS')).map(Number).sort((a,b)=>a-b), [10,20,30,103,104,105,106,107,108,109,110]);
});
test('every unlock kind is used, trophies <= 9, and a hand item has a perk', () => {
  const items = eng();
  for (const k of ['level','trophies','dex']) assert.ok(items.some(i => i.unlock && k in i.unlock), k);
  for (const i of items) if (i.unlock && 'trophies' in i.unlock) assert.ok(i.unlock.trophies <= 9, i.id);
  assert.ok(items.some(i => i.slot === 'hand' && i.perk !== null));
});
test('math items: 9, ids m_*, Korean names, prices 30..400, no perk, every slot covered', () => {
  const m = get('ITEMS').filter(i => i.cur === 'math');
  assert.equal(m.length, 9);
  for (const i of m) {
    assert.match(i.id, /^m_/); assert.match(i.word, /[가-힣]/, i.id);
    assert.ok(i.price >= 30 && i.price <= 400, i.id); assert.equal(i.perk, null, i.id);
  }
  for (const sl of get('SLOTS')) assert.ok(m.some(i => i.slot === sl), sl);
});
