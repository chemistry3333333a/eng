/* =====================================================================
   워드 아일랜드 · 문장 라운드 (영어 단원 8단어를 다 잡은 뒤 이어서 해요)
   - section#sgame 을 스스로 주입해요 (math-game.js · boss.js 와 같은 방식)
   - 문제 종류: listen(듣고 고르기) · order(블록 줄 세우기)
   - 진행은 S.session.sent 에 저장해요. 점수·코인·콤보는 S.session 에 더해서 결과 화면에서 단어와 합쳐 보여 줘요
   - 처음 틀린 문제는 라운드 끝에 한 번 더 나와요. 별 계산에는 처음 6문제의 "한 번에 맞힘"만 들어가요
   ===================================================================== */
(() => {
const css = `
#sgame{gap:8px;}
#sgame .sq{align-self:center;background:#fff;border-radius:22px;padding:12px 24px;font-size:clamp(24px,5.5vw,40px);
  line-height:1.5;text-align:center;box-shadow:0 5px 0 rgba(0,0,0,.1);max-width:100%;box-sizing:border-box;word-break:keep-all;}
#sgame .sko{font-size:20px;color:var(--muted);margin-top:2px;}
#sgame .skind{text-align:center;font-size:20px;color:#0c4a6e;}
#sgame .scards{flex:1;display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:center;}
#sgame .scard{border:0;background:#fff;border-radius:22px;width:min(92vw,520px);padding:18px 16px;font-size:clamp(22px,5vw,30px);
  box-shadow:0 7px 0 rgba(0,0,0,.13);animation:pop .35s backwards;word-break:keep-all;}
#sgame .scard:active{transform:translateY(4px);box-shadow:0 3px 0 rgba(0,0,0,.13);}
#sgame .scard.wrong{animation:shake .5s;}
#sgame .scard.out{opacity:.3;pointer-events:none;}
#sgame .scard.right{box-shadow:0 0 0 7px var(--good),0 7px 0 rgba(0,0,0,.13);}
#sgame .sorder{flex:1;display:flex;flex-direction:column;gap:22px;align-items:center;justify-content:center;}
#sgame .sline{min-height:84px;width:min(94vw,640px);background:#ffffffaa;border:4px dashed #fff;border-radius:22px;padding:10px;
  display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;transition:.15s;}
#sgame .sline.over{background:#fef9c3;border-color:#facc15;}
#sgame .sline.wrong{animation:shake .5s;}
#sgame .sline.done{background:#dcfce7;border-color:var(--good);border-style:solid;}
#sgame .sline .hintx{color:var(--muted);font-size:20px;}
#sgame .sline .end{font-size:34px;}
#sgame .spool{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;min-height:70px;}
.sblk{border:0;border-radius:18px;padding:12px 20px;font-size:clamp(24px,5vw,32px);font-family:system-ui,sans-serif;font-weight:700;
  background:#fff;color:#1d4ed8;box-shadow:0 6px 0 #93c5fd;touch-action:none;animation:pop .3s backwards;}
.still .sblk{animation:none;}
.sblk.in{background:#dbeafe;box-shadow:0 4px 0 #60a5fa;}
.sblk.ghost{position:fixed;z-index:9999;pointer-events:none;margin:0;animation:none;transform:rotate(6deg) scale(1.1);box-shadow:0 10px 18px rgba(0,0,0,.25);}
#sgame .sintro{position:absolute;inset:0;z-index:7;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.35);}
#sgame .sintro.on{display:flex;}
#sgame .sintro div{background:#fff;border-radius:30px;padding:26px 34px;text-align:center;font-size:40px;animation:pop .45s;box-shadow:0 10px 0 rgba(0,0,0,.12);}
#sgame .sintro small{display:block;font-size:20px;color:var(--muted);margin-top:8px;}
#avPalS{position:absolute;left:14px;bottom:14px;z-index:5;pointer-events:none;}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

const sg = document.createElement('section');
sg.id = 'sgame'; sg.className = 'screen';
sg.innerHTML = `<div id="avPalS"></div>
  <div class="topbar">
    <button class="icon" id="sQuit" aria-label="나가기">🏠</button>
    <div class="dots" id="sDots"></div>
    <div class="score">⭐ <span id="sScore">0</span></div>
  </div>
  <div class="skind" id="sKind"></div>
  <div class="listen" id="sListen">
    <button class="speaker" id="sPlay" aria-label="다시 듣기">🔊</button>
    <button class="slow" id="sSlow" aria-label="천천히 듣기">🐢</button>
  </div>
  <div class="sq" id="sQ"></div>
  <div class="status" id="sStatus"></div>
  <div id="sBody" style="flex:1;display:flex;flex-direction:column"></div>
  <div class="sintro" id="sIntro"><div>📜 문장 라운드!<small>배운 단어로 문장을 만들어 봐요</small></div></div>`;
document.body.appendChild(sg);

const C = SentenceCore;
const KIND = {listen:'👂 잘 듣고 맞는 뜻을 골라요', order:'🧱 블록을 순서대로 놓아 문장을 만들어요'};
let R = null;   // 지금 문제 상태 (저장 안 함)

const ses = () => S.session;
const cur = () => { const s = ses().sent; return s.q[s.i]; };
const sentOf = q => C.find(ses().stage, q.w);
const say = (slow) => { if (R) speak(R.s.en, slow ? 0.55 : undefined); };

function renderDots(){
  const s = ses().sent;
  $('sDots').innerHTML = s.q.map((_,i) =>
    `<i class="${i < s.i ? (s.marks[i] ? 'ok' : 'meh') : i === s.i ? 'now' : ''}"></i>`).join('');
  $('sScore').textContent = ses().score;
}

// 단어 8개를 다 잡았을 때 index.html 이 불러요
function start(){
  const x = ses();
  if (!x.sent){ x.sent = {q:C.plan(x.stage), i:0, first:0, n:6, marks:[]}; save(); }
  enter(true);
}
function resume(){ enter(false); }
function enter(intro){
  Avatar.render($('avPalS'), {size:'s', pet:true});
  show('sgame');
  if (ses().sent.i >= ses().sent.q.length){ finishStage(); return; }
  if (!intro){ next(); return; }
  $('sIntro').classList.add('on'); R = null; renderDots();
  $('sQ').innerHTML = ''; $('sBody').innerHTML = ''; $('sStatus').innerHTML = ''; $('sKind').textContent = '';
  $('sListen').style.display = 'none';
  sfxWin(); setTimeout(() => speak('Sentence time!'), 300);
  setTimeout(() => { $('sIntro').classList.remove('on'); if (S.session && S.session.sent) next(); }, 1900);
}

function next(){
  const s = ses().sent;
  if (s.i >= s.q.length){ R = null; finishStage(); return; }
  renderDots();
  const q = cur(), sent = sentOf(q);
  R = {q, s:sent, tries:0, locked:false, t0:Date.now()};
  $('sKind').textContent = KIND[q.t];
  $('sStatus').innerHTML = '';
  $('sBody').innerHTML = '';
  $('sListen').style.display = q.t === 'listen' ? '' : 'none';
  if (q.t === 'listen') listen();
  else order();
}

/* ---------- 공통: 맞힘 / 틀림 ---------- */
function right(el){
  const x = ses(), s = x.sent, r = R, q = r.q;
  r.locked = true;
  const first = r.tries === 0 && !q.retry;
  if (first){ s.first++; x.combo++; x.maxCombo = Math.max(x.maxCombo, x.combo); }
  const fast = Date.now() - r.t0 < 6000;
  const pts = first ? 10 + Math.min(x.combo, 10) * 2 + (fast ? 5 : 0) : 5;
  const lvBefore = level(), xp = first ? 10 : 4, coin = first ? 1 : 0;
  x.score += pts; x.xp += xp; S.xp += xp; x.coins += coin; S.coins += coin;
  s.marks[s.i] = r.tries === 0;
  s.i++;
  save();
  sfxGood(); Avatar.react($('avPalS'), 'cheer', {combo: x.combo});
  if (el) floatText(el, `+${pts}`);
  $('sStatus').innerHTML = `<span class="answer">${WORDS[q.w].e} <b>${r.s.en}</b></span>` +
    (first && x.combo >= 2 ? `<span class="combo">🔥 ${x.combo} 콤보!</span>` : '');
  $('sQ').innerHTML = `${r.s.en}<div class="sko">${r.s.ko}</div>`;
  setTimeout(() => speak(r.s.en), 250);
  if (level() > lvBefore) setTimeout(() => { toast(`🎉 레벨 업! Lv.${level()}`, 2000); sfxWin(); }, 600);
  renderDots();
  setTimeout(() => { if (R === r) next(); }, 2800);
}
function wrong(){
  const x = ses(), s = x.sent, r = R;
  r.tries++;
  if (r.tries === 1 && !r.q.retry) s.q.push({...r.q, retry:true});   // 라운드 끝에 한 번 더
  x.combo = 0;
  save(); renderDots();
  sfxBad(); Avatar.react($('avPalS'), 'hurt');
}

/* ---------- 듣고 고르기 ---------- */
function listen(){
  const r = R;
  $('sQ').innerHTML = '🎧 ? ? ?';
  const box = document.createElement('div'); box.className = 'scards';
  C.listenOpts(ses().stage, r.s.w, 3).forEach((o, i) => {
    const c = document.createElement('button');
    c.className = 'scard'; c.style.animationDelay = (i*0.1)+'s';
    c.textContent = o.ko;
    c.onclick = () => {
      if (R !== r || r.locked) return;
      if (o.w === r.s.w){ c.classList.add('right'); right(c); }
      else {
        wrong();
        c.classList.remove('wrong'); void c.offsetWidth; c.classList.add('wrong');
        setTimeout(() => c.classList.add('out'), 450);
        $('sStatus').innerHTML = '<span>다시 들어 봐요 👂</span>';
        if (r.tries >= 2) $('sQ').innerHTML = `👀 ${r.s.en}`;   // 두 번 틀리면 글자로도 보여 줘요
        setTimeout(() => { if (R === r && !r.locked) say(); }, 500);
      }
    };
    box.appendChild(c);
  });
  $('sBody').appendChild(box);
  setTimeout(() => { if (R === r) say(); }, 450);
}

/* ---------- 블록 줄 세우기 ---------- */
function order(){
  const r = R;
  r.pool = C.shuffleBlocks(r.s).map((t, k) => ({t, k}));
  r.line = [];
  $('sQ').innerHTML = `<div class="sko" style="font-size:24px;color:var(--ink)">${r.s.ko}</div>`;
  const wrap = document.createElement('div'); wrap.className = 'sorder';
  wrap.innerHTML = `<div class="sline" id="sLine"></div><div class="spool" id="sPool"></div>`;
  $('sBody').appendChild(wrap);
  drawOrder();
}
function drawOrder(){
  const r = R, line = $('sLine'), pool = $('sPool');
  if (r.drawn) pool.parentNode.classList.add('still'); r.drawn = true;   // 튀어나오는 효과는 처음 한 번만
  line.innerHTML = r.line.length ? '' : '<span class="hintx">✋ 블록을 여기로 끌거나 눌러요</span>';
  r.line.forEach(b => {
    const e = document.createElement('button'); e.className = 'sblk in'; e.textContent = b.t;
    e.onclick = () => { if (r.locked) return; r.line = r.line.filter(x => x !== b); r.pool.push(b); drawOrder(); };
    line.appendChild(e);
  });
  if (r.line.length){ const e = document.createElement('span'); e.className = 'end'; e.textContent = C.end(r.s); line.appendChild(e); }
  pool.innerHTML = '';
  r.pool.forEach(b => {
    const e = document.createElement('button'); e.className = 'sblk'; e.textContent = b.t;
    e.onpointerdown = ev => grab(ev, e, b);
    pool.appendChild(e);
  });
}
function place(b){
  const r = R;
  r.pool = r.pool.filter(x => x !== b); r.line.push(b);
  drawOrder();
  if (r.pool.length) return;
  const line = $('sLine');
  if (C.orderOk(r.s, r.line.map(x => x.t))){ line.classList.add('done'); right(line); return; }
  r.locked = true; wrong();
  line.classList.remove('wrong'); void line.offsetWidth; line.classList.add('wrong');
  $('sStatus').innerHTML = '<span>순서가 달라요! 들어 봐요 👂</span>';
  setTimeout(() => say(), 300);
  setTimeout(() => {   // 블록을 되돌려 다시 해요. 두 번 틀리면 첫 블록을 넣어 줘요
    if (R !== r) return;
    r.pool = C.shuffleBlocks(r.s).map((t, k) => ({t, k})); r.line = [];
    if (r.tries >= 2){ const f = r.pool.find(x => x.t === r.s.blocks[0]); r.pool = r.pool.filter(x => x !== f); r.line.push(f); }
    r.locked = false; line.classList.remove('wrong'); drawOrder();
  }, 1800);
}
// 블록 끌기: 조금만 움직이고 놓으면 누른 것으로 봐요
function grab(ev, el, b){
  const r = R;
  if (!r || r.locked) return;
  ev.preventDefault();
  const id = ev.pointerId, x0 = ev.clientX, y0 = ev.clientY, rc = el.getBoundingClientRect();
  const dx = x0 - rc.left, dy = y0 - rc.top;
  let ghost = null;
  const line = $('sLine');
  const over = (x, y) => { const q = line.getBoundingClientRect(); return x >= q.left && x <= q.right && y >= q.top - 20 && y <= q.bottom + 20; };
  const mv = e => {
    if (e.pointerId !== id) return;
    if (!ghost && Math.hypot(e.clientX - x0, e.clientY - y0) > 8){
      ghost = el.cloneNode(true); ghost.classList.add('ghost'); document.body.appendChild(ghost); el.style.opacity = '.3';
    }
    if (ghost){ ghost.style.left = (e.clientX - dx) + 'px'; ghost.style.top = (e.clientY - dy) + 'px'; line.classList.toggle('over', over(e.clientX, e.clientY)); }
  };
  const end = e => {
    if (e.pointerId !== id) return;
    window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
    line.classList.remove('over');
    const hit = e.type === 'pointerup' && (!ghost || over(e.clientX, e.clientY));
    if (ghost) ghost.remove();
    el.style.opacity = '';
    if (hit && R === r && !r.locked) place(b);
  };
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
}

$('sPlay').onclick = () => say();
$('sSlow').onclick = () => say(true);
$('sQuit').onclick = () => {
  if (confirm('지도로 갈까요?\n지금까지 한 것은 저장돼서 나중에 이어서 할 수 있어요 😊')){
    R = null; speak([]); save(); renderMap();
  }
};

window.SentenceGame = {
  wants: x => typeof x.stage === 'number' && C.has(x.stage),
  start, resume,
};
})();
