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
test('35..45 items, 4..8 per slot, total 5000..6500', () => {
  const items = eng();
  assert.ok(items.length >= 35 && items.length <= 45, String(items.length));
  for (const s of get('SLOTS')) { const n = items.filter(i => i.slot === s).length; assert.ok(n >= 4 && n <= 8, s); }
  const sum = items.reduce((a, i) => a + i.price, 0);
  assert.ok(sum >= 5000 && sum <= 6500, String(sum));
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
test('PETS has the 11 boss ids', () => {
  assert.deepEqual(Object.keys(get('PETS')).map(Number).sort((a,b)=>a-b), [10,20,30,103,104,105,106,107,108,109,110]);
});
test('every unlock kind is used, trophies <= 9, and a hand item has a perk', () => {
  const items = eng();
  for (const k of ['level','trophies','dex']) assert.ok(items.some(i => i.unlock && k in i.unlock), k);
  for (const i of items) if (i.unlock && 'trophies' in i.unlock) assert.ok(i.unlock.trophies <= 9, i.id);
  assert.ok(items.some(i => i.slot === 'hand' && i.perk !== null));
});
test('math items: 11, ids m_*, Korean names, prices 30..400, no perk, every slot covered', () => {
  const m = get('ITEMS').filter(i => i.cur === 'math');
  assert.equal(m.length, 11);
  for (const i of m) {
    assert.match(i.id, /^m_/); assert.match(i.word, /[가-힣]/, i.id);
    assert.ok(i.price >= 30 && i.price <= 400, i.id); assert.equal(i.perk, null, i.id);
  }
  for (const sl of get('SLOTS')) assert.ok(m.some(i => i.slot === sl), sl);
});
test('6 slots including bg', () => assert.deepEqual([...get('SLOTS')], ['hat','face','hand','back','effect','bg']));
test('15 bodies in this order with prices and unlocks', () => {
  const B = get('BODIES');
  assert.deepEqual(B.map(b => b.id), ['kid1','kid2','kid3','cat','dog','bunny','chick','hamster','penguin','bear','panda','fox','unicorn','robot','dragon']);
  const p = Object.fromEntries(B.map(b => [b.id, JSON.stringify([b.price, b.cur, b.unlock])]));
  const eq = (id, v) => assert.equal(p[id], JSON.stringify(v), id);
  for (const id of ['kid1','kid2','kid3','cat','dog','bunny']) eq(id, [0, 'eng', null]);
  eq('chick', [120,'eng',null]); eq('hamster', [150,'eng',null]); eq('penguin', [200,'eng',null]);
  eq('bear', [250,'eng',{level:5}]); eq('panda', [300,'eng',{level:10}]);
  eq('fox', [350,'eng',{trophies:3}]); eq('unicorn', [500,'eng',{trophies:7}]);
  eq('robot', [200,'math',{mathTrophies:1}]); eq('dragon', [350,'math',{mathTrophies:2}]);
  assert.deepEqual(B.filter(b => b.legend).map(b => b.id), ['unicorn','dragon']);
  for (const b of B) { assert.ok(b.name && b.icon, b.id); }
});
test('English words are unique across English items and bodies', () => {
  const w = [...eng(), ...get('BODIES').filter(b => b.cur === 'eng')].map(x => x.word);
  assert.equal(new Set(w).size, w.length);
  for (const b of get('BODIES').filter(b => b.cur === 'eng')) assert.match(b.word, /^[a-z][a-z ]*$/, b.id);
});
test('body and item ids never collide', () => {
  const ids = [...get('ITEMS'), ...get('BODIES')].map(x => x.id);
  assert.equal(new Set(ids).size, ids.length);
});
test('new items exist with spec prices', () => {
  const I = Object.fromEntries(get('ITEMS').map(i => [i.id, i]));
  const want = {flower:['hat',80], beret:['hat',90], magichat:['hat',220], bandage:['face',30], starsticker:['face',40],
    heartglasses:['face',90], lollipop:['hand',50], icecream:['hand',60], butterfly:['back',200], music:['effect',80],
    bg_sky:['bg',60], bg_garden:['bg',100], bg_bubble:['bg',90], bg_night:['bg',120], bg_spring:['bg',150], bg_winter:['bg',160],
    m_grid:['bg',80], m_space:['bg',250]};
  for (const [id, [slot, price]] of Object.entries(want)) { assert.ok(I[id], id); assert.equal(I[id].slot, slot, id); assert.equal(I[id].price, price, id); }
  assert.equal(JSON.stringify(I.magichat.unlock), '{"level":8}'); assert.equal(JSON.stringify(I.butterfly.unlock), '{"dex":30}');
  assert.equal(JSON.stringify(I.m_space.unlock), '{"mathTrophies":2}');
});
