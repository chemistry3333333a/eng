const test = require('node:test'), assert = require('node:assert');
const {load} = require('./load');
const vm = require('vm');

// 매 테스트마다 새 컨텍스트 (lv 1, 코인 0, 무료 캐릭터만 가짐)
function mk() {
  const env = {day: '2026-1-1', lv: 1, saves: 0};
  const S = {coins: 0, stages: {}, words: {}, trophies: {}, pets: [], math: {coins: 0, trophies: {}}};
  const ctx = load(['items.js', 'avatar-art.js', 'avatar.js', 'village-items.js', 'village.js'],
    {S, save() { env.saves++; }, today: () => env.day, level: () => env.lv, setTimeout, clearTimeout});
  ctx.Avatar.ensure(S);
  ctx.Village.ensure(S);
  return {env, S, ctx, V: ctx.Village};
}
const get = n => vm.runInContext(n, mk().ctx);

/* ---------- Task 1: 장식 데이터 ---------- */
test('decor ids unique, words, prices, sizes', () => {
  const D = get('DECOR');
  assert.equal(new Set(D.map(d => d.id)).size, D.length);
  for (const d of D){
    if (d.cur === 'eng') assert.match(d.word, /^[a-z][a-z ]*$/, d.id);
    if (d.price != null) assert.ok(d.stack ? d.price >= 10 && d.price <= 60 : d.price >= 30 && d.price <= 500, d.id);
    assert.ok(d.price != null || d.gift, d.id);
    assert.ok(d.w >= 1 && d.d >= 1, d.id);
    assert.ok(['building', 'decor'].includes(d.kind), d.id);
  }
});
test('spec catalog', () => {
  const D = get('DECOR'), by = Object.fromEntries(D.map(d => [d.id, d]));
  assert.equal(D.length, 19);
  assert.deepEqual({...by.windmill.gift}, {level:10}); assert.equal(by.windmill.price, undefined);
  assert.deepEqual({...by.castle.unlock}, {trophies:7}); assert.equal(by.castle.legend, true);
  assert.equal(by.clocktower.cur, 'math'); assert.equal(by.clocktower.price, 300);
  assert.equal(by.fountain.cur, 'math'); assert.equal(by.fountain.price, 200);
});

/* ---------- Task 2: 규칙 ---------- */
test('ensure: missing/garbage village becomes empty', () => {
  const {S, V} = mk(); S.village = 'x'; V.ensure(S);
  assert.deepEqual(JSON.parse(JSON.stringify(S.village)), {own:{}, gifts:[], placed:[], night:false});
});
test('ensure: drops overflow placed decor and unowned characters', () => {
  const {S, V} = mk();
  S.village = {own:{tree:1}, gifts:[], placed:[{k:'d',id:'tree',x:0,z:0,r:0},{k:'d',id:'tree',x:2,z:0,r:0},{k:'c',id:'unicorn',x:3,z:3},{k:'c',id:'cat',x:-3,z:0}], night:false};
  V.ensure(S);
  assert.deepEqual(S.village.placed.map(p => p.id), ['tree','cat']);
});
test('ensure: keeps unknown decor ids in own but drops them from the island', () => {
  const {S, V} = mk();
  S.village = {own:{gone:2, tree:1}, gifts:['first'], placed:[{k:'d',id:'gone',x:0,z:0,r:0},{k:'d',id:'tree',x:3,z:0,r:0}], night:true};
  V.ensure(S);
  assert.equal(S.village.own.gone, 2);
  assert.deepEqual(S.village.placed.map(p => p.id), ['tree']);
  assert.equal(S.village.night, true);
});
test('buy: coins, stack, one-only, gift-only, locked', () => {
  const {S, V} = mk(); S.coins = 1000;
  assert.equal(V.buy('tree').ok, true); assert.equal(V.buy('tree').ok, true); assert.equal(V.owned('tree'), 2);
  assert.equal(V.buy('house').ok, true); assert.equal(V.canBuy('house').reason, 'owned');
  assert.equal(V.canBuy('windmill').reason, 'giftOnly');
  assert.equal(V.canBuy('castle').reason, 'locked');
  assert.equal(S.coins, 1000 - 40 - 40 - 220);
});
test('buy: not enough coins, quiz discount', () => {
  const {S, V} = mk(); S.coins = 100;
  const r = V.canBuy('house'); assert.equal(r.reason, 'coins'); assert.equal(r.need, 120);
  S.coins = 200; assert.equal(V.priceOf('house', {quiz:true}), 198);
  assert.equal(V.buy('house', {quiz:true}).ok, true); assert.equal(S.coins, 2);
});
test('buy math decor spends gems', () => {
  const {S, V} = mk(); S.math.coins = 250;
  assert.equal(V.buy('fountain').ok, true); assert.equal(S.math.coins, 50); assert.equal(S.coins, 0);
});
test('claimGifts: first visit once, level gifts once', () => {
  const {V, env} = mk();
  assert.deepEqual(V.claimGifts().map(g => g.id).sort(), ['cottage','path','tree']);
  assert.equal(V.owned('path'), 6); assert.equal(V.owned('tree'), 2);
  assert.deepEqual(V.claimGifts(), []);
  env.lv = 10;
  assert.deepEqual(V.claimGifts().map(g => g.id).sort(), ['well','windmill']);
  assert.deepEqual(V.claimGifts(), []);
});
test('claimGifts: trophy and dex gifts', () => {
  const {S, V} = mk(); V.claimGifts();
  S.trophies = {1: 2};
  assert.deepEqual(V.claimGifts().map(g => g.id), ['mailbox']);
  for (let i = 0; i < 30; i++) S.words['w' + i] = {seen: 1};
  assert.deepEqual(V.claimGifts().map(g => g.id), ['bridge']);
});
test('place: inside island, no overlap, needs stock', () => {
  const {S, V} = mk(); S.village.own = {tree:1, house:1};
  assert.ok(V.place({k:'d', id:'house', x:0, z:0, r:0}) >= 0);
  assert.equal(V.place({k:'d', id:'tree', x:0.5, z:0, r:0}), -1);   // 겹침
  assert.equal(V.place({k:'d', id:'tree', x:9, z:0, r:0}), -1);     // 섬 밖
  assert.ok(V.place({k:'d', id:'tree', x:4, z:0, r:0}) >= 0);
  assert.equal(V.place({k:'d', id:'tree', x:-4, z:0, r:0}), -1);    // 재고 없음
});
test('characters: owned only, once each; rotate swaps footprint; remove returns to bag', () => {
  const {S, V} = mk(); S.village.own = {bench:1};
  assert.ok(V.place({k:'c', id:'cat', x:2, z:2}) >= 0);
  assert.equal(V.place({k:'c', id:'cat', x:-2, z:2}), -1);
  assert.equal(V.place({k:'c', id:'unicorn', x:-2, z:-2}), -1);
  const i = V.place({k:'d', id:'bench', x:-3, z:0, r:0});
  assert.equal(V.rotate(i), true); assert.equal(S.village.placed[i].r, 1);
  V.remove(i); assert.ok(V.bag().some(b => b.id === 'bench' && b.n === 1));
  assert.ok(V.bag().some(b => b.k === 'c' && b.id === 'dog'));
  assert.ok(!V.bag().some(b => b.k === 'c' && b.id === 'cat'));
});
test('move: blocked by others, allowed onto own old spot', () => {
  const {S, V} = mk(); S.village.own = {house:1, tree:1};
  V.place({k:'d', id:'house', x:0, z:0, r:0});
  const t = V.place({k:'d', id:'tree', x:4, z:0, r:0});
  assert.equal(V.move(t, 0.5, 0), false);
  assert.equal(V.move(t, 4.5, 0), true);
  assert.equal(S.village.placed[t].x, 4.5);
});
test('rotate fails when the turned footprint would overlap', () => {
  const {S, V} = mk(); S.village.own = {bridge:1, tree:1};
  const b = V.place({k:'d', id:'bridge', x:0, z:0, r:0});    // 4×2 칸
  assert.ok(V.place({k:'d', id:'tree', x:0, z:1, r:0}) >= 0);
  assert.equal(V.rotate(b), false);
});
