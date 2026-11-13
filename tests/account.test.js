const test = require('node:test'), assert = require('node:assert/strict');
const {load} = require('./load');

const A = load(['account.js']).Account;
const J = v => JSON.parse(JSON.stringify(v));   // vm 안 객체는 prototype 이 달라서 deepEqual 전에 옮겨요

test('normalizeId trims and lowercases', () => assert.equal(A.normalizeId('  Mallang1 '), 'mallang1'));

test('checkId accepts 4-12 lowercase letters and digits only', () => {
  assert.equal(A.checkId('mallang1'), null);
  assert.equal(A.checkId('abcd'), null);
  assert.equal(A.checkId('a'.repeat(12)), null);
  for (const bad of ['abc', 'a'.repeat(13), '말랑말랑', 'mal_lang', 'mal lang', ''])
    assert.match(A.checkId(bad), /아이디는 영어 소문자와 숫자 4~12자/);
});

test('checkPassword needs 6+ chars and a matching repeat', () => {
  assert.equal(A.checkPassword('123456'), null);
  assert.match(A.checkPassword('12345'), /6자 이상/);
  assert.match(A.checkPassword('123456', '123457'), /서로 달라요/);
  assert.equal(A.checkPassword('123456', '123456'), null);
});

test('checkName needs 1-10 chars', () => {
  assert.equal(A.checkName('말랑'), null);
  assert.match(A.checkName('  '), /이름을 써 주세요/);
  assert.match(A.checkName('가'.repeat(11)), /10자/);
});

test('idToEmail', () => assert.equal(A.idToEmail('mallang1'), 'mallang1@wordisland.local'));

test('authErrorMessage hides firebase codes behind plain Korean', () => {
  for (const c of ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email', 'auth/invalid-login-credentials'])
    assert.equal(A.authErrorMessage(c), '아이디나 비밀번호가 맞지 않아요');
  assert.match(A.authErrorMessage('auth/email-already-in-use'), /이미 있는 아이디/);
  assert.match(A.authErrorMessage('auth/weak-password'), /6자 이상/);
  assert.match(A.authErrorMessage('auth/network-request-failed'), /인터넷 연결/);
  assert.match(A.authErrorMessage('auth/too-many-requests'), /잠시 후/);
  assert.doesNotMatch(A.authErrorMessage('auth/whatever'), /auth\//);
  assert.doesNotMatch(A.authErrorMessage(undefined), /undefined/);
});

// base = 기기 사본이 시작한 클라우드 버전(savedAt). 기기 시계끼리 비교하지 않아요
test('pickStart keeps unsent device play only if the cloud has not changed since its base', () => {
  const L = (base, dirty, savedAt = 999) => ({data:{n:'L'}, savedAt, dirty, base}), C = savedAt => ({data:{n:'C'}, savedAt});
  assert.deepEqual(J(A.pickStart(null, null)), {source:'none', upload:false});
  assert.deepEqual(J(A.pickStart(null, C(5))), {source:'cloud', upload:false});
  assert.deepEqual(J(A.pickStart(L(5, true), C(5))), {source:'local', upload:true});    // 닫기 직전 플레이, 클라우드 그대로
  assert.deepEqual(J(A.pickStart(L(5, true, 1), C(5))), {source:'local', upload:true}); // 기기 시계가 늦어도 같아요
  assert.deepEqual(J(A.pickStart(L(3, true), C(5))), {source:'cloud', upload:false});   // 그사이 다른 기기가 올림
  assert.deepEqual(J(A.pickStart(L(5, false), C(5))), {source:'cloud', upload:false});
  assert.deepEqual(J(A.pickStart(L(null, true), null)), {source:'local', upload:true});
  assert.deepEqual(J(A.pickStart(L(5, false), null)), {source:'local', upload:true});   // 클라우드 문서가 사라짐
});

test('migrationStep', () => {
  assert.equal(A.migrationStep(null, false), 'none');
  assert.equal(A.migrationStep(null, true), 'none');
  assert.equal(A.migrationStep({name:'a'}, false), 'offer');
  assert.equal(A.migrationStep({name:'a'}, true), 'choose');
});

test('summary', () => assert.equal(A.summary({name:'말랑', xp:250, coins:120}), '말랑 · Lv.3 · 🪙120'));

test('account.js can be required from plain node (admin script)', () => {
  const req = require('../account.js');
  assert.equal(req.idToEmail('abcd'), 'abcd@wordisland.local');
});
