const test = require('node:test'), assert = require('node:assert');
const {load} = require('./load');
const vm = require('vm');

// 매 테스트마다 새 컨텍스트: lv 는 1 에서 시작해 레벨 잠금이 실제로 잠겨 있게 해요
function mk(opts = {}) {
  const env = {day: '2026-1-1', lv: 1, saves: 0};
  const S = {coins: 0, stages: {}, words: {}, trophies: {}, pets: [], math: {coins: 0, trophies: {}}};
  const ctx = load(['items.js', 'avatar.js'], {S, save() { env.saves++; }, today: () => env.day, level: () => env.lv});
  const Avatar = ctx.Avatar;
  const ITEMS = vm.runInContext('ITEMS', ctx);
  Avatar.ensure(S);
  const unlocked = ITEMS.filter(i => i.cur === 'eng' && !i.unlock).sort((a, b) => a.price - b.price);
  const cheap = unlocked[0];
  const lockedLv = ITEMS.find(i => i.cur === 'eng' && i.unlock && i.unlock.level);
  // 특가(30% 할인)가 가격 계산에 끼어들지 않도록 다른 아이템으로 고정
  if (opts.pinDeal !== false) {
    S.shop.dealDay = env.day;
    S.shop.dealId = unlocked.find(i => i.id !== cheap.id).id;
  }
  return {env, S, ctx, Avatar, ITEMS, cheap, lockedLv};
}

test('ensure fills defaults on an old save and keeps existing fields', () => {
  const {Avatar} = mk();
  const S = {name:'민준', coins:50, xp:120, stages:{1:{stars:2}}, words:{}, petOn:10, pets:[10]};
  Avatar.ensure(S);
  assert.deepEqual(S.avatar, {body:'kid1', equip:{hat:null,face:null,hand:null,back:null,effect:null}});
  assert.deepEqual(S.owned, []); assert.deepEqual(S.shop, {freeGiven:false, dealDay:'', dealId:''});
  assert.equal(S.coins, 50); assert.equal(S.petOn, 10); assert.deepEqual(S.stages, {1:{stars:2}});
});
test('ensure keeps unknown owned ids but nulls bad equips', () => {
  const {S, Avatar, cheap, ITEMS} = mk();
  S.owned = ['nope', cheap.id]; S.avatar.equip.hat = 'nope'; S.avatar.body = 'alien';
  const other = ITEMS.find(i => i.slot === 'face');
  S.avatar.equip.face = other.id; // 소유하지 않은 아이템
  Avatar.ensure(S);
  assert.deepEqual(S.owned, ['nope', cheap.id]); assert.equal(S.avatar.equip.hat, null);
  assert.equal(S.avatar.equip.face, null); assert.equal(S.avatar.body, 'kid1');
});
test('buy deducts once; buying twice is rejected', () => {
  const {S, Avatar, cheap, env} = mk();
  S.coins = Avatar.priceOf(cheap.id) * 3;
  const p = Avatar.priceOf(cheap.id);
  assert.equal(Avatar.buy(cheap.id).ok, true);
  assert.equal(env.saves > 0, true);
  assert.deepEqual(Avatar.buy(cheap.id), {ok:false, reason:'owned'});
  assert.equal(S.coins, p * 2);
});
test('unknown item id is rejected', () => {
  const {Avatar} = mk();
  assert.deepEqual(Avatar.canBuy('nope'), {ok:false, reason:'unknown'});
});
test('exact coins is enough; one short reports need', () => {
  const {S, Avatar, cheap} = mk();
  const p = Avatar.priceOf(cheap.id);
  S.coins = p - 1;
  assert.deepEqual(Avatar.canBuy(cheap.id), {ok:false, reason:'coins', need:1});
  S.coins = p; assert.equal(Avatar.buy(cheap.id).ok, true); assert.equal(S.coins, 0);
});
test('locked item cannot be bought; unlocks by level', () => {
  const {S, Avatar, env, lockedLv} = mk();
  S.coins = 9999; env.lv = lockedLv.unlock.level - 1;
  assert.equal(Avatar.canBuy(lockedLv.id).reason, 'locked');
  assert.equal(Avatar.lockText(lockedLv), `레벨 ${lockedLv.unlock.level} 필요`);
  env.lv = lockedLv.unlock.level; assert.equal(Avatar.canBuy(lockedLv.id).ok, true);
  assert.equal(Avatar.lockText(lockedLv), '');
});
test('trophies count bosses with stars > 0; dex counts seen words', () => {
  const {S, Avatar} = mk();
  S.trophies = {10:1, 103:0, 104:3}; S.words = {apple:{seen:1}, dog:{seen:0}};
  assert.equal(Avatar.isUnlocked({unlock:{trophies:2}}), true);
  assert.equal(Avatar.isUnlocked({unlock:{trophies:3}}), false);
  assert.equal(Avatar.isUnlocked({unlock:{dex:1}}), true);
  assert.equal(Avatar.isUnlocked({unlock:{dex:2}}), false);
  assert.equal(Avatar.lockText({unlock:{trophies:3}}), '보스 3마리 물리치기');
  assert.equal(Avatar.lockText({unlock:{dex:2}}), '몬스터 2마리 잡기');
});
test('quiz gives 10% (ceil); deal gives 30% and ignores quiz', () => {
  const {Avatar, ITEMS} = mk({pinDeal: false});
  const d = Avatar.deal(); const p = Avatar.item(d.id).price;
  assert.equal(d.price, Math.ceil(p * 0.7));
  assert.equal(Avatar.priceOf(d.id, {quiz:true}), Math.ceil(p * 0.7));
  const other = ITEMS.find(i => i.id !== d.id);
  assert.equal(Avatar.priceOf(other.id, {quiz:true}), Math.ceil(other.price * 0.9));
  assert.equal(Avatar.priceOf(other.id), other.price);
});
test('deal is stable within a day, rerolls next day, skips owned, null when nothing left', () => {
  const {S, Avatar, ITEMS, env} = mk({pinDeal: false});
  const a = Avatar.deal(); assert.deepEqual(Avatar.deal(), a);
  assert.equal(Avatar.isUnlocked(Avatar.item(a.id)), true);
  S.coins = 99999; Avatar.buy(a.id); assert.notEqual(Avatar.deal()?.id, a.id);
  env.day = '2026-1-2'; assert.equal(S.shop.dealDay, '2026-1-1');
  Avatar.deal(); assert.equal(S.shop.dealDay, '2026-1-2');
  S.owned = ITEMS.map(i => i.id);   // 전부 소유하면 고를 게 없음
  assert.equal(Avatar.deal(), null);
  assert.equal(S.shop.dealId, '');
});
test('equip only owned items; same slot replaces; perks reflect equipment', () => {
  const {S, Avatar, ITEMS} = mk();
  const wand = ITEMS.find(i => i.slot === 'hand' && i.perk);
  assert.equal(Avatar.equip(wand.id), false);
  S.owned.push(wand.id); assert.equal(Avatar.equip(wand.id), true);
  assert.deepEqual(Avatar.perks(), [wand.perk]);
  const other = ITEMS.find(i => i.slot === 'hand' && i.id !== wand.id);
  S.owned.push(other.id); Avatar.equip(other.id);
  assert.equal(Avatar.equipped().hand, other.id);
  Avatar.equip(wand.id);
  Avatar.unequip('hand'); assert.deepEqual(Avatar.perks(), []);
  const e = Avatar.equipped(); e.hat = 'x'; assert.equal(Avatar.equipped().hat, null); // 복사본
});
test('setBody accepts known bodies only', () => {
  const {S, Avatar} = mk();
  assert.equal(Avatar.setBody('cat'), true); assert.equal(S.avatar.body, 'cat');
  assert.equal(Avatar.setBody('alien'), false); assert.equal(S.avatar.body, 'cat');
});
test('gift: only once, only cheap items, auto-equipped', () => {
  const {S, Avatar} = mk();
  const g = Avatar.giftChoices(); assert.ok(g.length >= 2); assert.ok(g.every(i => i.price <= 30));
  assert.equal(Avatar.claimGift(g[0].id), true);
  assert.equal(Avatar.equipped()[g[0].slot], g[0].id);
  assert.equal(S.owned.includes(g[0].id), true);
  assert.equal(Avatar.claimGift(g[1].id), false);
});
test('gift rejects non-candidates', () => {
  const {Avatar, ITEMS} = mk();
  const pricey = ITEMS.find(i => i.price > 30);
  assert.equal(Avatar.claimGift(pricey.id), false);
});
test('giftChoices excludes owned and locked; claimGift rejects them', () => {
  const {S, Avatar} = mk();
  const g = Avatar.giftChoices()[0];
  S.owned.push(g.id);
  assert.ok(!Avatar.giftChoices().some(i => i.id === g.id));
  assert.equal(Avatar.claimGift(g.id), false); assert.equal(S.shop.freeGiven, false);
});

test('math items spend math coins only', () => {
  const {S, Avatar, ITEMS} = mk(); const m = ITEMS.find(i => i.id === 'm_ruler');
  S.coins = 1000; S.math.coins = 10;
  assert.deepEqual(Avatar.canBuy(m.id), {ok:false, reason:'coins', need:30});
  S.math.coins = 40; assert.ok(Avatar.buy(m.id).ok); assert.equal(S.math.coins, 0); assert.equal(S.coins, 1000);
  assert.deepEqual(Avatar.wallet(m.id), {cur:'math', coins:0});
});
test('English items still spend English coins', () => {
  const {S, Avatar, cheap} = mk();
  S.coins = 100; S.math.coins = 100;
  const p = Avatar.priceOf(cheap.id);
  assert.ok(Avatar.buy(cheap.id).ok);
  assert.equal(S.coins, 100 - p); assert.equal(S.math.coins, 100);
  assert.deepEqual(Avatar.wallet(cheap.id), {cur:'eng', coins:100 - p});
});
test('gift and deal never offer math items', () => {
  const {Avatar, env} = mk({pinDeal: false});
  assert.ok(Avatar.giftChoices().every(i => i.cur === 'eng'));
  for (let d = 1; d <= 30; d++) {
    env.day = '2027-1-' + d;
    assert.equal(Avatar.item(Avatar.deal().id).cur, 'eng');
  }
});
test('mathTrophies unlock counts only S.math.trophies', () => {
  const {S, Avatar} = mk(); const it = Avatar.item('m_abacus');
  S.trophies = {10:3, 103:3}; assert.ok(!Avatar.isUnlocked(it));
  assert.equal(Avatar.lockText(it), '수학 보스 1마리 물리치기');
  S.math.trophies = {'m-frB':1}; assert.ok(Avatar.isUnlocked(it));
});
test('Avatar tolerates a missing S.math', () => {
  const {S, Avatar} = mk(); delete S.math;
  assert.equal(Avatar.wallet('m_ruler').coins, 0);
  assert.ok(!Avatar.isUnlocked(Avatar.item('m_abacus')));
  assert.equal(Avatar.canBuy('m_ruler').ok, false);
});
test('quiz discount is 10% for math items too', () => {
  const {Avatar} = mk();
  assert.equal(Avatar.priceOf('m_ruler', {quiz:true}), 36);
});
test('every item has cur eng or math', () => { const {ITEMS} = mk(); ITEMS.forEach(i => assert.ok(['eng','math'].includes(i.cur))); });
test('English quiz wrong-choice pool only has cur eng items', () => {
  const {Avatar, ITEMS} = mk();
  ITEMS.filter(i => i.cur === 'eng').forEach(it => {
    for (let k = 0; k < 5; k++){
      const w = Avatar.quizWrong(it, a => a.slice().sort(() => Math.random() - 0.5));
      assert.equal(w.length, 2);
      w.forEach(x => assert.equal(x.cur, 'eng'));
    }
  });
});
