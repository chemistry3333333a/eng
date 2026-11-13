const test = require('node:test'), assert = require('node:assert');
const {load} = require('./load');
const vm = require('vm');

const ctx = load(['items.js', 'avatar-art.js']);
const A = ctx.AvatarArt, B = vm.runInContext('BODIES', ctx);
const ok = s => { assert.match(s, /^<svg[\s>]/); assert.match(s, /<\/svg>$/); assert.doesNotMatch(s, /undefined|NaN/); };

test('MOODS are the nine names', () => assert.deepEqual([...A.MOODS], ['base','smile','wink','wow','star','love','sleep','tongue','teary']));
test('every body draws in every mood', () => {
  for (const b of B) {
    assert.ok(A.hasBody(b.id), b.id);
    for (const m of A.MOODS) ok(A.character({body:b.id, mood:m}));
    ok(A.face(b.id));
  }
});
test('moods draw differently', () => {
  const s = new Set(A.MOODS.map(m => A.character({body:'cat', mood:m})));
  assert.equal(s.size, 9);
});
test('bodies draw differently', () => {
  const s = new Set(B.map(b => A.character({body:b.id})));
  assert.equal(s.size, B.length);
});
test('unknown body or mood falls back instead of throwing', () => { ok(A.character({body:'alien', mood:'???'})); });
test('css uses only av- prefixed classes and keyframes', () => {
  for (const m of A.css.matchAll(/(?:^|[\s,}])\.([a-zA-Z][\w-]*)/g)) assert.match(m[1], /^av-/);
  for (const m of A.css.matchAll(/@keyframes\s+([\w-]+)/g)) assert.match(m[1], /^av-/);
});

// ---- 아이템·배경 ----
const ITEMS = vm.runInContext('ITEMS', ctx);
const noIds = s => s.replace(/ id="[^"]+"|url\(#[^)]+\)/g, '');
test('every item has art and a thumb', () => { for (const i of ITEMS) { assert.ok(A.hasItem(i.id), i.id); ok(A.thumb(i.id)); } });
test('equipping changes the drawing for every item', () => {
  const off = noIds(A.character({body:'bunny', bg:true}));
  for (const i of ITEMS) assert.notEqual(noIds(A.character({body:'bunny', equip:{[i.slot]: i.id}, bg:true})), off, i.id);
});
test('bg is only drawn when bg:true', () => {
  const a = A.character({body:'cat', equip:{bg:'bg_night'}, bg:false}), b = A.character({body:'cat', equip:{}, bg:false});
  assert.equal(noIds(a), noIds(b));
});
test('two renders never share an svg id', () => {
  const ids = s => [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  const a = ids(A.character({body:'cat', bg:true, equip:{bg:'bg_sky'}})), b = ids(A.character({body:'cat', bg:true, equip:{bg:'bg_sky'}}));
  assert.ok(a.length > 0);
  for (const x of a) assert.ok(!b.includes(x), x);
});
test('unknown equip id is skipped', () => ok(A.character({body:'cat', equip:{hat:'nope', bg:'nope'}, bg:true})));

test('expression and palette for 3D dolls', () => {
  for (const b of B) {
    const p = A.palette(b.id);
    assert.match(p.f, /^#[0-9a-f]{6}$/i, b.id); assert.match(p.l, /^#[0-9a-f]{6}$/i, b.id);
    for (const m of A.MOODS) assert.doesNotMatch(A.expression(m, p.beak), /undefined|NaN/);
  }
  assert.match(A.expression('base', true), /#ffb347/);   // 부리
  assert.equal(A.palette('nope').f, A.palette('kid1').f);
});
