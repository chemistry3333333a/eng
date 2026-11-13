/* =====================================================================
   워드 아일랜드 · 계정 규칙 (아이디·비밀번호 검사, 오류 문구, 기록 고르기)
   - DOM 도 Firebase 도 안 건드려요. 판단만! (tests/account.test.js)
   ===================================================================== */
(function(){
const DOMAIN = '@wordisland.local';
const WRONG = '아이디나 비밀번호가 맞지 않아요';
const PW_SHORT = '비밀번호는 6자 이상으로 해 주세요';

const normalizeId = raw => String(raw || '').trim().toLowerCase();
const checkId = id => /^[a-z0-9]{4,12}$/.test(id) ? null : '아이디는 영어 소문자와 숫자 4~12자로 써 주세요';
function checkPassword(pw, pw2){
  if (String(pw || '').length < 6) return PW_SHORT;
  if (pw2 !== undefined && pw !== pw2) return '두 비밀번호가 서로 달라요';
  return null;
}
function checkName(name){
  const n = String(name || '').trim();
  if (!n) return '부를 이름을 써 주세요';
  if (n.length > 10) return '이름은 10자까지 쓸 수 있어요';
  return null;
}
const idToEmail = id => id + DOMAIN;

const MESSAGES = {
  'auth/invalid-credential': WRONG, 'auth/invalid-login-credentials': WRONG,
  'auth/wrong-password': WRONG, 'auth/user-not-found': WRONG, 'auth/invalid-email': WRONG,
  'auth/email-already-in-use': '이미 있는 아이디예요. 다른 아이디를 골라 주세요',
  'auth/weak-password': PW_SHORT,
  'auth/network-request-failed': '인터넷 연결을 확인해 주세요',
  'auth/too-many-requests': '너무 많이 시도했어요. 잠시 후 다시 해 주세요',
};
const authErrorMessage = code => MESSAGES[code] || '문제가 생겼어요. 잠시 후 다시 해 주세요';

// 게임을 열 때 기기 사본과 클라우드 중 무엇을 쓸까 (인터넷이 될 때만 불러요)
// 기기 사본의 base 는 그 사본이 시작한 클라우드 savedAt. 클라우드가 그대로일 때만 안 올린 플레이를 살려요
function pickStart(local, cloud){
  if (local && local.dirty && (!cloud || cloud.savedAt === local.base)) return {source:'local', upload:true};
  if (cloud) return {source:'cloud', upload:false};
  if (local) return {source:'local', upload:true};
  return {source:'none', upload:false};
}
// 옛 기기 기록(로그인 전 저장)을 어떻게 할까
const migrationStep = (legacy, accountHasData) => !legacy ? 'none' : accountHasData ? 'choose' : 'offer';
const summary = s => `${s.name} · Lv.${Math.floor((s.xp || 0) / 100) + 1} · 🪙${s.coins || 0}`;

const Account = {normalizeId, checkId, checkPassword, checkName, idToEmail, authErrorMessage, pickStart, migrationStep, summary};
if (typeof window !== 'undefined') window.Account = Account;
if (typeof module !== 'undefined') module.exports = Account;   // admin/reset-password.js 에서 require
})();
