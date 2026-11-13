// 워드 아일랜드 · 관리자: 비밀번호 바꾸기
// 사용법: node admin/reset-password.js <아이디> <새비밀번호>
const fs = require('fs'), path = require('path');
const Account = require('../account.js');

const KEY_FILE = path.join(__dirname, 'service-account.json');
const fail = msg => { console.error('❌ ' + msg); process.exit(1); };

const [rawId, pw] = process.argv.slice(2);
if (!rawId || !pw) fail('사용법: node admin/reset-password.js <아이디> <새비밀번호>');
const id = Account.normalizeId(rawId);
const bad = Account.checkId(id) || Account.checkPassword(pw);
if (bad) fail(bad);
if (!fs.existsSync(KEY_FILE)) fail('admin/service-account.json 이 없어요. admin/README.md 를 보고 키를 넣어 주세요.');

let initializeApp, cert, getAuth;
try {
  ({initializeApp, cert} = require('firebase-admin/app'));
  ({getAuth} = require('firebase-admin/auth'));
} catch(e) { fail('firebase-admin 이 없어요. 먼저 admin 폴더에서 npm install 을 한 번 해 주세요.'); }

initializeApp({credential: cert(require(KEY_FILE))});
(async () => {
  const auth = getAuth();
  let user;
  try { user = await auth.getUserByEmail(Account.idToEmail(id)); }
  catch(e) { if (e.code === 'auth/user-not-found') fail('그런 아이디가 없어요: ' + id); throw e; }
  await auth.updateUser(user.uid, {password: pw});
  console.log(`✅ ${id}의 비밀번호를 바꿨어요`);
})().catch(e => fail('문제가 생겼어요: ' + e.message));
