/* =====================================================================
   워드 아일랜드 · 영어 문장섬 (화면)
   - 단어섬의 "문장 라운드"(sentence-game.js)와는 다른 새 섬이에요. 계산은 sentence-island-core.js (SentIsland)
   - 목표: 영어를 앞에서부터 덩어리(chunk)로 끊어 바로 이해하고(👀 해석하기), 같은 순서로 바로 만들기(🧱 만들기)
   - 화면: #sisland(입구) · #sstamp(출석 도장판) · #splay(한 판) · #sres(결과) 를 스스로 주입해요
   - 점수: 🪙 코인 · XP 는 단어섬과 같은 S.coins · S.xp 에 더해요. 도장·익힌 문장은 S.sent 에 저장해요
   ===================================================================== */
(() => {
const css = `
.sisl{background:linear-gradient(180deg,#c4b5fd,#fbcfe8);}
#sisland{align-items:center;gap:14px;overflow-y:auto;}
#sisland .sbar,#sstamp .sbar{width:100%;display:flex;align-items:center;gap:10px;}
#sisland .sbar .sp,#sstamp .sbar .sp{flex:1;}
#sisland .stitle,#sstamp .stitle{margin:6px 0 0;font-size:clamp(34px,7vw,58px);color:#fff;text-shadow:0 5px 0 #7c3aed,0 10px 20px rgba(0,0,0,.15);text-align:center;}
#sisland .ssub{margin:0;font-size:clamp(18px,3.2vw,24px);color:#4c1d95;text-align:center;}
#sisland .sbox{width:min(100%,560px);display:flex;flex-direction:column;gap:14px;margin:auto 0;}
#sisland .today{background:#fff;border-radius:26px;padding:18px;text-align:center;box-shadow:0 7px 0 rgba(0,0,0,.1);display:flex;flex-direction:column;gap:6px;align-items:center;}
#sisland .today b{font-size:26px;}
#sisland .today small{font-size:18px;color:var(--muted);}
#sisland .today .btn{margin-top:6px;}
#sisland .mchips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;}
#sisland .mchip{font-size:15px;padding:4px 10px;border-radius:12px;background:#f1f5f9;color:#64748b;}
#sisland .mchip.on{background:#dcfce7;color:#15803d;}
#sisland .sbox button{position:relative;}
#sisland .sbox button.mdone::after{content:'✅';position:absolute;top:-10px;right:-6px;font-size:22px;}
#sisland .modes{display:flex;gap:12px;}
#sisland .smode{flex:1;border:0;border-radius:22px;padding:16px 8px;color:#fff;font-size:24px;box-shadow:0 6px 0 rgba(0,0,0,.2);}
#sisland .smode:active{transform:translateY(3px);box-shadow:0 3px 0 rgba(0,0,0,.2);}
#sisland .smode .big{display:block;font-size:44px;line-height:1.1;}
#sisland .smode small{display:block;font-size:15px;opacity:.92;margin-top:4px;}
#sisland .smode.read{background:#8b5cf6;} #sisland .smode.make{background:#f97316;}
#sisland .schal{border:0;border-radius:20px;padding:12px;color:#fff;font-size:22px;background:linear-gradient(90deg,#e11d48,#f59e0b);box-shadow:0 6px 0 #9f1239;}
#sisland .schal:active{transform:translateY(3px);box-shadow:0 3px 0 #9f1239;}
#sisland .schal small{display:block;font-size:15px;opacity:.95;}
#sisland .slong{border:0;border-radius:20px;padding:12px;color:#fff;font-size:22px;background:linear-gradient(90deg,#0ea5e9,#6366f1);box-shadow:0 6px 0 #3730a3;}
#sisland .slong:active{transform:translateY(3px);box-shadow:0 3px 0 #3730a3;}
#sisland .slong small{display:block;font-size:15px;opacity:.95;}
#sisland .slong.locked{background:#94a3b8;box-shadow:0 6px 0 #64748b;}
#sisland .skor{border:0;border-radius:20px;padding:12px;color:#fff;font-size:22px;background:linear-gradient(90deg,#10b981,#0d9488);box-shadow:0 6px 0 #115e59;}
#sisland .skor:active{transform:translateY(3px);box-shadow:0 3px 0 #115e59;}
#sisland .skor small{display:block;font-size:15px;opacity:.95;}
#sisland .korrow{display:flex;gap:12px;}
#sisland .korrow .skor{flex:1;}
#sisland .skor.long{background:linear-gradient(90deg,#0d9488,#4f46e5);}
#sisland .skor.locked{background:#94a3b8;box-shadow:0 6px 0 #64748b;}
#sisland .sinfo{display:flex;gap:12px;}
#sisland .sinfo button,#sisland .sinfo div{flex:1;border:0;background:#ffffffcc;border-radius:20px;padding:12px 8px;font-size:18px;text-align:center;box-shadow:0 4px 0 rgba(0,0,0,.08);}
#sisland .sinfo b{display:block;font-size:26px;margin-top:2px;}
#sisland .sinfo button:active{transform:translateY(3px);}

#sstamp{align-items:center;gap:16px;overflow-y:auto;}
#sstamp .sboard{width:min(100%,560px);background:#fff;border-radius:28px;padding:18px;box-shadow:0 8px 0 rgba(0,0,0,.1);margin:auto 0;display:flex;flex-direction:column;gap:14px;}
#sstamp .cells{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;}
#sstamp .cell{aspect-ratio:1;border-radius:16px;background:#f3f4f6;border:3px dashed #d1d5db;display:grid;place-items:center;font-size:clamp(20px,5vw,34px);color:#9ca3af;}
#sstamp .cell.on{background:#fef3c7;border:3px solid #fbbf24;}
#sstamp .cell.gift{border-color:#f59e0b;}
#sstamp .cell.new{animation:stampIn .7s;}
#sstamp .msg{text-align:center;font-size:22px;}
#sstamp .sbar2{height:14px;background:#e5e7eb;border-radius:9px;overflow:hidden;}
#sstamp .sbar2 i{display:block;height:100%;background:linear-gradient(90deg,#a78bfa,#f472b6);border-radius:9px;}
#sstamp .stats{display:flex;gap:10px;}
#sstamp .stats div{flex:1;background:#f5f3ff;border-radius:18px;padding:10px;text-align:center;font-size:17px;}
#sstamp .stats b{display:block;font-size:28px;}
@keyframes stampIn{0%{transform:scale(2.4) rotate(-20deg);opacity:0}60%{transform:scale(.9) rotate(4deg);opacity:1}100%{transform:scale(1)}}

#splay{gap:10px;}
#splay .dots i{border-color:#a78bfa;}
#splay .skind{text-align:center;font-size:22px;color:#4c1d95;}
#splay .sarea{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;min-height:0;}
#splay .scard{background:#fff;border-radius:26px;padding:16px 18px;width:min(100%,680px);box-shadow:0 7px 0 rgba(0,0,0,.1);
  display:flex;flex-direction:column;align-items:center;gap:10px;}
#splay .sko{font-size:clamp(22px,5vw,32px);text-align:center;word-break:keep-all;}
#splay .chunks{display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:6px 4px;}
#splay .ck{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 8px;border-radius:14px;transition:.2s;}
#splay .ck .e{font-family:system-ui,sans-serif;font-weight:700;font-size:clamp(24px,5.6vw,38px);color:#1e293b;white-space:nowrap;}
#splay .ck .k{font-size:clamp(15px,3.4vw,20px);color:#7c3aed;min-height:1.3em;white-space:nowrap;}
#splay .ck.later .e{opacity:.25;}
#splay .ck.now{background:#fef08a;box-shadow:0 0 0 4px #facc15;}
#splay .ck.done .k{animation:pop .35s;}
#splay .ck.slot .e{border-bottom:4px solid #c4b5fd;width:2.4em;height:1.2em;}
#splay .ck.slot .k{color:#a78bfa;}
#splay .ck.slot.now .e{border-bottom-color:#f59e0b;}
#splay .ck.kdone .e{border-bottom:4px solid #34d399;width:2.4em;height:1.2em;}
#splay .ck.kdone .k{color:#047857;font-weight:700;animation:pop .35s;}
#splay .ck.slot.now .k{color:#6d28d9;font-weight:700;}
#splay .sko{display:flex;flex-direction:column;align-items:center;gap:2px;}
#splay .olab{font-size:14px;color:#94a3b8;}
#splay .sep{font-size:clamp(22px,5vw,34px);color:#c084fc;padding-top:6px;}
#splay .end{font-family:system-ui,sans-serif;font-weight:700;font-size:clamp(24px,5.6vw,38px);padding-top:6px;}
#splay .opts{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:min(100%,680px);}
#splay .opt{border:0;background:#fff;border-radius:20px;padding:14px 20px;font-size:clamp(20px,4.6vw,28px);box-shadow:0 6px 0 #c4b5fd;
  animation:pop .3s backwards;min-width:min(40vw,180px);}
#splay .opt.en{font-family:system-ui,sans-serif;font-weight:700;color:#1d4ed8;box-shadow:0 6px 0 #93c5fd;}
#splay .opt:active{transform:translateY(4px);box-shadow:0 2px 0 #c4b5fd;}
#splay .opt.wrong{animation:shake .5s;}
#splay .opt.out{opacity:.3;pointer-events:none;}
#splay .opt.hint{box-shadow:0 0 0 6px #fde047,0 6px 0 #c4b5fd;}
#splay .opt.used{visibility:hidden;}
#splay .after{display:flex;flex-direction:column;gap:10px;align-items:center;}
#splay .tip{font-size:19px;color:#6d28d9;background:#ffffffcc;border-radius:14px;padding:6px 14px;text-align:center;}
#splay .arow{display:flex;gap:12px;}
#sres{align-items:center;}
#sres .stampmsg{background:#fef3c7;border-radius:18px;padding:10px;font-size:22px;}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

const add = (id, cls, html) => { const s = document.createElement('section'); s.id = id; s.className = 'screen ' + cls; s.innerHTML = html; document.body.appendChild(s); };

add('sisland', 'sisl', `<div class="sbar">
    <button class="icon" id="siHome" aria-label="섬 고르기">🏝️</button><span class="sp"></span>
    <div class="pill" id="siStreak"></div><div class="pill" id="siCoins"></div>
  </div>
  <h1 class="stitle">💬 영어 문장섬</h1>
  <p class="ssub">영어는 앞에서부터, 덩어리로 끊어서!</p>
  <div class="sbox">
    <div class="today"><b id="siTodayT"></b><div class="mchips" id="siChips"></div><small id="siTodayS"></small><button class="btn green" id="siTodayBtn"></button></div>
    <div class="modes">
      <button class="smode read" id="siReadBtn"><span class="big">👀</span>해석하기<small>영어 → 앞에서부터 뜻</small></button>
      <button class="smode make" id="siMakeBtn"><span class="big">🧱</span>만들기<small>뜻 → 영어 순서로</small></button>
    </div>
    <button class="schal" id="siChalBtn">🏆 도전 만들기 <small>영어 순서 뜻 힌트 없이! · 보상 UP</small></button>
    <button class="slong" id="siLongBtn"></button>
    <div class="korrow">
      <button class="skor" id="siOrderBtn">🔀 순서 바꾸기 <small>짧은 문장 · 깬 단원</small></button>
      <button class="skor long" id="siOrderLongBtn"></button>
    </div>
    <div class="sinfo">
      <button id="siStampBtn">💮 출석 도장판<b id="siStampN"></b></button>
      <div>⭐ 익힌 문장<b id="siLearnN"></b></div>
    </div>
  </div>`);

add('sstamp', 'sisl', `<div class="sbar"><button class="icon" id="siStampBack" aria-label="문장섬">⬅️</button><span class="sp"></span></div>
  <h1 class="stitle">💮 출석 도장판</h1>
  <div class="sboard">
    <div class="msg" id="siStampMsg"></div>
    <div class="cells" id="siCells"></div>
    <div class="sbar2"><i id="siStampFill"></i></div>
    <div class="stats"><div>📚 모은 도장<b id="siStampTotal"></b></div><div>🏅 다 채운 판<b id="siStampFull"></b></div></div>
  </div>`);

add('splay', 'sisl', `<div class="topbar">
    <button class="icon" id="siQuit" aria-label="나가기">⬅️</button>
    <div class="dots" id="siDots"></div>
    <div class="score">⭐ <span id="siScore">0</span></div>
  </div>
  <div class="skind" id="siKind"></div>
  <div class="sarea">
    <div class="scard" id="siCard"></div>
    <div class="opts" id="siOpts"></div>
    <div class="after" id="siAfter" style="display:none">
      <div class="tip" id="siTip"></div>
      <div class="arow"><button class="btn blue small" id="siAgain">🔊 다시 듣기</button><button class="btn green small" id="siNext">다음 ▶</button></div>
    </div>
  </div>`);

add('sres', 'sisl', `<div class="panel">
    <h2 id="sirTitle"></h2>
    <div class="bigstars" id="sirStars"></div>
    <div class="rstats" id="sirStats"></div>
    <div class="stampmsg" id="sirStamp" style="display:none"></div>
    <div class="row">
      <button class="btn gray small" id="sirHub">💬 문장섬</button>
      <button class="btn green small" id="sirMore">🔄 한 판 더</button>
    </div>
  </div>`);

const C = SentIsland;
const clean = t => t.replace(/,$/, '');   // 'Hello,' → 'Hello' (읽어 줄 때)
const END = s => s.en.slice(s.blocks.join(' ').length);

/* ---------- 입구 ---------- */
function open(){
  C.ensure(S);
  const t = today(), done = C.doneToday(S, t), b = C.board(S, t);
  $('siStreak').textContent = `🔥 ${S.streak.n}일`;
  $('siCoins').textContent = `🪙 ${S.coins}`;
  // 💮 오늘의 도장 미션: 메뉴마다 한 판씩 끝내면 도장
  const md = C.missionDone(S, t), need = C.missions(S), left = need.filter(m => !md.includes(m.mode));
  $('siTodayT').textContent = done ? '✅ 오늘 도장 받았어요!' : '💮 오늘의 도장 미션';
  $('siChips').innerHTML = need.map(m => `<span class="mchip${md.includes(m.mode) ? ' on' : ''}">${md.includes(m.mode) ? '✅' : '⬜'} ${m.name}</span>`).join('');
  $('siTodayS').textContent = done ? '더 하면 코인을 더 모을 수 있어요'
    : `${need.length - left.length} / ${need.length} 완료 · 다 끝내면 도장 쾅 💮`;
  $('siTodayBtn').textContent = done || !left.length ? '🎲 섞어서 한 판 더' : `▶ 다음 미션: ${left[0].name}`;
  $('siTodayBtn').onclick = () => { unlockAudio(); start(done || !left.length ? 'daily' : left[0].mode); };
  [['siReadBtn','read'],['siMakeBtn','make'],['siChalBtn','challenge'],['siLongBtn','long'],['siOrderBtn','order'],['siOrderLongBtn','orderLong']]
    .forEach(([id, mode]) => $(id).classList.toggle('mdone', md.includes(mode)));
  $('siStampN').textContent = `${b.on} / ${b.size}`;
  $('siLearnN').textContent = `${C.learnedCount(S)}개`;
  const lc = C.longChapters(S), lt = Object.keys(C.LONG_BY_CH).length;
  $('siLongBtn').className = 'slong' + (lc.length ? '' : ' locked');
  $('siOrderLongBtn').className = 'skor long' + (lc.length ? '' : ' locked');
  $('siOrderLongBtn').innerHTML = `${lc.length ? '🔀' : '🔒'} 순서 바꾸기 <small>긴 문장${lc.length ? ` · 열린 장 ${lc.length}` : ' · 잠김'}</small>`;
  $('siLongBtn').innerHTML = `${lc.length ? '📜' : '🔒'} 긴 문장 <small>${lc.length ? `열린 장 ${lc.length} / ${lt} · 끊어 읽기 연습` : '단어섬에서 한 장의 단원을 모두 깨면 열려요'}</small>`;
  show('sisland');
}
$('siHome').onclick = () => MathGame.pick();
$('siReadBtn').onclick = () => { unlockAudio(); start('read'); };
$('siMakeBtn').onclick = () => { unlockAudio(); start('make'); };
$('siChalBtn').onclick = () => { unlockAudio(); start('challenge'); };
$('siOrderBtn').onclick = () => { unlockAudio(); start('order'); };
$('siOrderLongBtn').onclick = () => {
  if (!C.longChapters(S).length){ toast('단어섬에서 한 장의 단원을 모두 깨면 그 장의 긴 문장이 열려요! 🔒', 2400); return; }
  unlockAudio(); start('orderLong');
};
$('siLongBtn').onclick = () => {
  if (!C.longChapters(S).length){ toast('단어섬에서 한 장의 단원을 모두 깨면 그 장의 긴 문장이 열려요! 🔒', 2400); return; }
  unlockAudio(); start('long');
};
$('siStampBtn').onclick = () => stamps();

/* ---------- 출석 도장판 ---------- */
function stamps(fresh){
  C.ensure(S);
  const b = C.board(S, today());
  const cells = $('siCells'); cells.innerHTML = '';
  for (let i = 0; i < b.size; i++){
    const c = document.createElement('div');
    const last = i === b.size - 1;
    c.className = 'cell' + (i < b.on ? ' on' : '') + (last ? ' gift' : '') + (fresh && i === b.on - 1 ? ' new' : '');
    c.textContent = i < b.on ? (last ? '🎁' : '💮') : (last ? '🎁' : i + 1);
    cells.appendChild(c);
  }
  $('siStampFill').style.width = (b.on / b.size * 100) + '%';
  $('siStampMsg').textContent = b.on === b.size ? '🎉 한 판을 다 채웠어요! 내일부터 새 판이에요'
    : `${b.size - b.on}칸 더 채우면 🎁 큰 보상!`;
  $('siStampTotal').textContent = b.total + '개';
  $('siStampFull').textContent = b.full + '판';
  show('sstamp');
}
$('siStampBack').onclick = open;

/* ---------- 한 판 ---------- */
let G = null;   // {mode, list, i, score, coins, xp, misses(문장별 실수), cur:{...}}
function start(mode){
  C.ensure(S);
  G = {mode, list:C.pick(S, mode), i:0, score:0, coins:0, xp:0, unclean:0, results:[]};
  next();
}
function dots(){
  const d = $('siDots'); d.innerHTML = '';
  G.list.forEach((_, i) => { const x = document.createElement('i'); x.className = i < G.i ? (G.results[i] ? 'ok' : 'meh') : i === G.i ? 'now' : ''; d.appendChild(x); });
  $('siScore').textContent = G.score;
}
function next(){
  if (G.i >= G.list.length) return finish();
  const q = G.list[G.i];
  G.cur = {t:q.t, s:q.s, k:0, miss:0, slotMiss:0};
  $('siAfter').style.display = 'none';
  dots();
  show('splay');
  if (q.t === 'read') readStep(); else if (q.t === 'kmake') kmakeStart(); else makeStart();
}

// 문장 카드: 덩어리마다 영어(e)와 뜻(k). state(i) → 'done' | 'now' | 'later' | 'slot'
// 빈칸의 영어 순서 뜻을 숨길 때: 🏆 도전 만들기, 🔀 순서 바꾸기 1단계(한글로 직접 순서를 만드는 중)
const hideHint = () => G && (G.mode === 'challenge' || (G.cur && G.cur.phase === 'ko'));
function card(top, state){
  const s = G.cur.s, c = $('siCard'); c.innerHTML = '';
  if (top){
    const k = document.createElement('div'); k.className = 'sko';
    k.innerHTML = '<small class="olab">🇰🇷 우리말 순서</small><span></span>';
    k.querySelector('span').textContent = top; c.appendChild(k);
    const l = document.createElement('small'); l.className = 'olab';
    l.textContent = G.cur.phase === 'ko' ? '🔀 한글 뜻 덩어리를 영어 순서로 놓아 봐요 ↓'
      : hideHint() && state(0) !== 'done' ? '🏆 힌트 없이 영어 순서로 만들어 봐요 ↓' : '🔤 영어 순서로 생각하면 ↓';
    c.appendChild(l);
  }
  const row = document.createElement('div'); row.className = 'chunks';
  s.blocks.forEach((b, i) => {
    if (i){ const sep = document.createElement('span'); sep.className = 'sep'; sep.textContent = '/'; row.appendChild(sep); }
    const stt = state(i), ck = document.createElement('div');
    const slot = stt.startsWith('slot') || stt === 'kdone';   // kdone: 한글 뜻만 놓인 칸 (영어는 아직)
    ck.className = 'ck ' + stt;
    ck.innerHTML = `<span class="e"></span><span class="k"></span>`;
    ck.querySelector('.e').textContent = slot ? '' : b;   // 빈칸은 길이로 답이 보이지 않게 같은 크기
    // 만들기 빈칸에는 영어 어순대로 한국어 뜻을 미리 보여 줘요 (이 뜻에 맞는 영어 덩어리를 차례로 고르기)
    // 🏆 도전 만들기는 빈칸 뜻을 숨겨요 (맞힌 칸은 뜻을 보여 줘요)
    ck.querySelector('.k').textContent = stt === 'done' || stt === 'kdone' || (slot && !hideHint()) ? s.gloss[i] : '';
    row.appendChild(ck);
  });
  if (state(s.blocks.length - 1) === 'done'){ const e = document.createElement('span'); e.className = 'end'; e.textContent = END(s); row.appendChild(e); }
  c.appendChild(row);
}

/* 👀 해석하기: 덩어리가 앞에서부터 하나씩 → 뜻 고르기 */
function readStep(){
  const g = G.cur, s = g.s;
  $('siKind').textContent = '👀 앞에서부터 덩어리 뜻을 골라요';
  card('', i => i < g.k ? 'done' : i === g.k ? 'now' : 'later');
  speak(clean(s.blocks[g.k]));
  const o = $('siOpts'); o.innerHTML = '';
  C.choices(s, g.k).forEach((txt, n) => {
    const b = document.createElement('button');
    b.className = 'opt'; b.textContent = txt; b.style.animationDelay = (n * .06) + 's';
    b.onclick = () => {
      if (txt === s.gloss[g.k]){ tone(880, .12, 'triangle'); g.k++; if (g.k >= s.blocks.length) solved(); else readStep(); }
      else wrong(b);
    };
    o.appendChild(b);
  });
}

/* 🔀 순서 바꾸기: 1단계 한글 뜻 덩어리를 영어 순서로 놓기 → 2단계 영어 덩어리 맞추기 */
function kmakeStart(){
  const g = G.cur;
  g.phase = 'ko'; g.korder = C.shuffleBlocks(g.s);
  kStep();
}
function kStep(){
  const g = G.cur, s = g.s;
  $('siKind').textContent = '🔀 1단계 · 한글 뜻을 영어 순서대로 눌러요';
  card(s.ko, i => i < g.k ? 'kdone' : i === g.k ? 'slot now' : 'slot');
  const o = $('siOpts'); o.innerHTML = '';
  g.korder.forEach((bi, n) => {
    const b = document.createElement('button');
    b.className = 'opt' + (bi < g.k ? ' used' : '') + (bi === g.k && g.slotMiss >= 2 ? ' hint' : '');
    b.textContent = s.gloss[bi]; b.style.animationDelay = (n * .05) + 's';
    b.onclick = () => {
      if (bi === g.k){
        tone(880, .12, 'triangle'); g.k++; g.slotMiss = 0;
        if (g.k < s.blocks.length) return kStep();
        // 한글 영어 순서 완성 → 2단계: 같은 칸에 영어 덩어리 맞추기
        g.phase = 'en'; g.k = 0; tone(1320, .2, 'triangle', .1);
        makeStart();
      } else { g.slotMiss++; wrong(b); if (g.slotMiss >= 2) kStep(); }
    };
    o.appendChild(b);
  });
}

/* 🧱 만들기: 한국어 문장 보고 영어 덩어리를 순서대로 */
function makeStart(){
  G.cur.order = C.shuffleBlocks(G.cur.s);
  makeStep();
}
function makeStep(){
  const g = G.cur, s = g.s;
  $('siKind').textContent = G.mode === 'order' || G.mode === 'orderLong' ? '🔀 2단계 · 이제 영어 덩어리를 맞춰요'
    : hideHint() ? '🏆 도전! 뜻 힌트 없이 영어 순서대로' : '🧱 영어 순서대로 덩어리를 눌러요';
  card(s.ko, i => i < g.k ? 'done' : i === g.k ? 'slot now' : 'slot');
  const o = $('siOpts'); o.innerHTML = '';
  g.order.forEach((bi, n) => {
    const b = document.createElement('button');
    b.className = 'opt en' + (bi < g.k ? ' used' : '') + (bi === g.k && g.slotMiss >= 2 ? ' hint' : '');
    b.textContent = s.blocks[bi]; b.style.animationDelay = (n * .05) + 's';
    b.onclick = () => {
      if (bi === g.k){ speak(clean(s.blocks[bi])); g.k++; g.slotMiss = 0; if (g.k >= s.blocks.length) solved(); else makeStep(); }
      else { g.slotMiss++; wrong(b); if (g.slotMiss >= 2) makeStep(); }
    };
    o.appendChild(b);
  });
}

function wrong(b){
  sfxBad(); G.cur.miss++;
  b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
  if (G.cur.t === 'read') b.classList.add('out');
}

// 한 문장 끝: 끊어 읽은 모양 + 자연스러운 뜻을 보여 주고 문장 전체를 읽어 줘요
function solved(){
  const g = G.cur, s = g.s, ok = g.miss === 0;
  card(s.ko, () => 'done');
  $('siOpts').innerHTML = '';
  $('siKind').textContent = ok ? '✨ 한 번에 성공!' : '👍 잘했어요!';
  $('siTip').textContent = '🗣️ 덩어리마다 끊어서 소리 내어 따라 읽어 봐요';
  $('siAfter').style.display = 'flex';
  const {xp:pts, coin} = C.reward(G.mode, ok);
  G.score += pts; G.xp += pts; G.coins += coin; S.xp += pts; S.coins += coin;
  if (!ok) G.unclean++;
  G.results[G.i] = ok;
  C.learn(S, s.en, ok); save();
  ok ? sfxGood() : tone(660, .15, 'triangle');
  setTimeout(() => speak(s.en), 350);
  dots();
}
$('siAgain').onclick = () => speak(G.cur.s.en);
$('siNext').onclick = () => { G.i++; next(); };
$('siQuit').onclick = async () => {
  if (G && G.i < G.list.length && !await askConfirm('그만할까요? 이번 판 도장은 못 받아요')) return;
  speechSynthesis && speechSynthesis.cancel && speechSynthesis.cancel();
  G = null; open();
};

/* ---------- 결과 ---------- */
function finish(){
  const stars = C.stars(G.unclean), bonus = stars * 2;
  G.coins += bonus; S.coins += bonus;
  S.sent.played++;
  let stampMsg = '', fresh = false;
  // 💮 오늘의 도장 미션: 이 메뉴를 끝낸 것으로 표시하고, 모두 끝냈으면 도장
  const r = C.finishMission(S, G.mode, today());
  if (r.stamp){
    fresh = true; G.coins += 5; S.coins += 5;
    stampMsg = '🎉 오늘의 미션 모두 완료! 💮 도장 쾅! +🪙5';
    if (r.full){ G.coins += 30; S.coins += 30; stampMsg += ' · 🎁 도장판 완성 보너스 +🪙30!'; }
  } else if (r.mission && r.left > 0){
    stampMsg = `✅ 미션 하나 완료! 도장까지 ${r.left}개 남았어요`;
  }
  touchStreak(); save();
  sfxWin();
  $('sirTitle').textContent = G.mode === 'daily' ? '🎲 섞어서 한 판 끝!' : G.mode === 'read' ? '👀 해석하기 끝!' : G.mode === 'challenge' ? '🏆 도전 만들기 끝!' : G.mode === 'long' ? '📜 긴 문장 끝!' : G.mode === 'order' ? '🔀 순서 바꾸기 끝!' : G.mode === 'orderLong' ? '🔀 긴 문장 순서 바꾸기 끝!' : '🧱 만들기 끝!';
  $('sirStars').innerHTML = [0, 1, 2].map(i => `<span>${i < stars ? '⭐' : '☆'}</span>`).join('');
  $('sirStats').innerHTML = `<span class="pill">✨ 한 번에 ${G.list.length - G.unclean}/${G.list.length}</span><span class="pill">🪙 +${G.coins}</span><span class="pill">XP +${G.xp}</span>`;
  $('sirStamp').style.display = stampMsg ? 'block' : 'none';
  $('sirStamp').textContent = stampMsg;
  const mode = G.mode;
  $('sirHub').onclick = () => fresh ? stamps(true) : open();   // 도장을 받았으면 도장판부터 보여 줘요
  $('sirHub').textContent = fresh ? '💮 도장판 보기' : '💬 문장섬';
  $('sirMore').onclick = () => start(mode);
  G = null;
  show('sres');
}

window.SentenceIsland = {open, stamps};
})();
