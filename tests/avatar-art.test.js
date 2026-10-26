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
