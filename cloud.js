/* =====================================================================
   워드 아일랜드 · 클라우드 (Firebase 로그인 + 기록 저장)
   - firebase compat SDK, firebase-config.js, account.js 다음에 붙여요
   - 기록 문서: saves/<uid> = {data, savedAt, id, updatedAt}
   ===================================================================== */
(function(){
let auth = null, db = null;
const LOAD_TIMEOUT = 8000;

function init(){
  if (auth) return;
  if (!window.FIREBASE_CONFIG) throw new Error('FIREBASE_CONFIG 가 비어 있어요 (firebase-config.js)');
  firebase.initializeApp(window.FIREBASE_CONFIG);
  auth = firebase.auth();
  db = firebase.firestore();
  // 인터넷이 끊겨도 쓰기가 기기에 쌓였다가 다시 연결되면 올라가요
  db.enablePersistence({synchronizeTabs:true}).catch(() => {});
}

const toUser = u => u ? {uid:u.uid, id:String(u.email || '').split('@')[0]} : null;
const onUser = cb => auth.onAuthStateChanged(u => cb(toUser(u)));

const signIn = (id, pw) => auth.signInWithEmailAndPassword(Account.idToEmail(id), pw).then(() => {});
const signUp = (id, pw) => auth.createUserWithEmailAndPassword(Account.idToEmail(id), pw).then(() => {});
const signOut = () => auth.signOut();

const ref = uid => db.collection('saves').doc(uid);
function load(uid){
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => { const e = new Error('timeout'); e.code = 'auth/network-request-failed'; reject(e); }, LOAD_TIMEOUT);
  });
  // 기기에 남은 사본이 아니라 서버에서 읽어요 (다른 기기의 최신 기록이 필요해서)
  const get = ref(uid).get({source:'server'}).then(snap => {
    if (!snap.exists) return null;
    const d = snap.data();
    return {data:d.data, savedAt:d.savedAt || 0};
  });
  return Promise.race([get, timeout]).finally(() => clearTimeout(timer));
}
const write = (uid, id, data, savedAt) =>
  ref(uid).set({data, savedAt, id, updatedAt:firebase.firestore.FieldValue.serverTimestamp()});

window.Cloud = {init, onUser, signIn, signUp, signOut, load, write};
})();
