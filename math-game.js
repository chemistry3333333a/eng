/* =====================================================================
   워드 아일랜드 · 수학 섬 (섬 고르기, 수학 지도, 한 판, 결과)
   - section#island, section#mmap 과 영어 지도의 "🔢 수학 섬" 버튼을 스스로 주입해요 (boss.js · shop.js 와 같은 방식)
   - section#mgame (한 판: 문제 칸, 몬스터, 틀리면 #mhint 에 힌트), section#mresult (결과)
   - 수학은 S.math.* 만 써요 (S.session·S.coins·S.stages 는 안 건드려요). xp·streak·avatar 는 같이 써요
   ===================================================================== */
(() => {
const css = `
#island{align-items:center;justify-content:center;gap:18px;}
#island h2{margin:0;font-size:32px;text-align:center;}
#island .pick{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
#island .mode{width:210px;border:0;font:inherit;border-radius:22px;padding:22px 12px;text-align:center;font-weight:800;font-size:26px;color:#fff;box-shadow:0 6px 0 rgba(0,0,0,.2);cursor:pointer;}
#island .mode:active{transform:translateY(3px);box-shadow:0 3px 0 rgba(0,0,0,.2);}
#island .mode .big{font-size:64px;display:block;line-height:1.1;}
#island .mode small{display:block;font-weight:600;font-size:16px;margin-top:8px;}
#island .mode.eng{background:#3a9bf0;} #island .mode.math{background:#f08a3a;}
#island .note{font-weight:700;color:#475569;}
#mgame{gap:8px;}
#mgame .mq{align-self:center;background:#fff;border-radius:22px;padding:10px 26px;font-size:clamp(30px,7vw,54px);font-weight:800;
  line-height:1.4;text-align:center;box-shadow:0 5px 0 rgba(0,0,0,.1);max-width:100%;box-sizing:border-box;}
#mgame .mon .pic.mv{font-size:calc(var(--size)*.2);font-weight:800;line-height:1.1;}
#mgame .status .answer .mf,#mgame .status .answer .mx{font-size:.9em;}
#avPalM{position:absolute;left:14px;bottom:14px;z-index:5;pointer-events:none;}
#mhint{display:none;position:absolute;inset:0;z-index:8;overflow-y:auto;padding:16px;box-sizing:border-box;
  flex-direction:column;background:rgba(15,23,42,.4);-webkit-overflow-scrolling:touch;}
#mhint.on{display:flex;}
#mhint>.mh-root{margin:auto;flex:none;}
#mhint.ask{background:rgba(15,23,42,.18);}
#mhint.ask>.mh-root{margin:auto auto 0;}
#mresult{align-items:center;}
#mAvRes{text-align:center;}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

const isl = document.createElement('section');
isl.id = 'island'; isl.className = 'screen';
isl.innerHTML = `<h2 id="islTitle"></h2>
  <div class="pick">
    <button class="mode eng" id="islEng"></button>
    <button class="mode math" id="islMath"></button>
  </div>
  <div class="note">⬅️ 지도에서도 언제든 바꿀 수 있어요</div>`;
document.body.appendChild(isl);

const mm = document.createElement('section');
mm.id = 'mmap'; mm.className = 'screen';
mm.innerHTML = `<div class="mapbar">
    <div class="who"><span id="mWhoAv" style="cursor:pointer"></span><span id="mWhoTxt"></span></div>
    <div class="lvl"><small id="mLvlTxt"></small><div class="xpbar"><i id="mXpFill"></i></div></div>
    <div class="pill" id="mCoinTxt"></div>
    <div class="pill" id="mStreakTxt"></div>
  </div>
  <div class="stages" id="mStageList"></div>
  <div class="mapfoot">
    <button class="btn blue small" id="mEngBtn">🔤 영어 섬</button>
    <button class="btn small" id="mShopBtn" style="background:#ec4899;box-shadow:0 6px 0 #be185d">🛍️ 상점</button>
    <button class="btn gray small" id="mSetBtn">⚙️ 설정·백업</button>
  </div>`;
document.body.appendChild(mm);

// 수학 한 판 (영어 #game 과 같은 모양, 소리 버튼 대신 문제 칸)
const mg = document.createElement('section');
mg.id = 'mgame'; mg.className = 'screen';
mg.innerHTML = `<div class="topbar">
    <button class="icon" id="mQuit" aria-label="나가기">🏠</button>
    <div class="dots" id="mDots"></div>
    <div class="score">⭐ <span id="mScore">0</span></div>
  </div>
  <div class="mq" id="mQ"></div>
  <div class="status" id="mStatus"></div>
  <div class="field" id="mField"></div>
  <div id="avPalM"></div>
  <div id="mhint"></div>`;
document.body.appendChild(mg);

const mr = document.createElement('section');
mr.id = 'mresult'; mr.className = 'screen';
mr.innerHTML = `<div class="panel">
    <div id="mAvRes"></div>
    <h2 id="mrTitle"></h2>
    <div class="bigstars" id="mrStars"></div>
    <div class="rstats" id="mrStats"></div>
    <div id="mrNew"></div>
    <div class="row">
      <button class="btn gray small" id="mrMap">🗺️ 지도</button>
      <button class="btn blue small" id="mrAgain">🔄 다시</button>
      <button class="btn green small" id="mrNext">다음 ▶</button>
    </div>
  </div>`;
document.body.appendChild(mr);

// 영어 지도 하단 맨 앞에 수학 섬 버튼
const toMath = document.createElement('button');
toMath.className = 'btn small'; toMath.id = 'toMathBtn'; toMath.textContent = '🔢 수학 섬';
toMath.style.cssText = 'background:#f08a3a;box-shadow:0 6px 0 #c2410c';
document.querySelector('#map .mapfoot').prepend(toMath);

const seenWords = () => Object.keys(S.words).filter(w => S.words[w] && S.words[w].seen > 0).length;

function goEng(){
  S.mode = 'eng'; save();
  if (S.session) resumeGame(); else renderMap();
  if (!S.session && !S.xp && !Object.keys(S.stages).length) setTimeout(() => speak("Hello! Let's catch monsters!"), 300);   // 처음 영어 섬에 올 때만
}
function goMath(){
  S.mode = 'math'; save();
  map();
}

// 받침 있으면 아, 없으면(또는 한글 아님) 야
const hasFinal = n => { const c = (n || '').slice(-1).charCodeAt(0) - 0xAC00; return c >= 0 && c <= 11171 && c % 28 !== 0; };
function pick(){
  MathStages.ensure(S);
  $('islTitle').textContent = `🧒 ${S.name}${hasFinal(S.name) ? '아' : '야'}, 오늘은 뭘 할까?`;
  $('islEng').innerHTML = `<span class="big">🔤</span>영어 섬<small>🪙 ${S.coins} · 단어 ${seenWords()}개</small>`;
  $('islMath').innerHTML = `<span class="big">🔢</span>수학 섬<small>💎 ${S.math.coins} · 스테이지 ${MATH_STAGES.filter(s => (S.math.stages[s.id] || {}).stars > 0).length}/${MATH_STAGES.length}</small>`;
  show('island');
}
$('islEng').onclick = goEng;
$('islMath').onclick = goMath;
$('toMathBtn').onclick = goMath;
$('mEngBtn').onclick = goEng;
$('mShopBtn').onclick = () => window.Shop && Shop.open(undefined, 'math');
$('mSetBtn').onclick = () => $('setBtn').click();

// 스테이지 버튼: 하던 판이면 이어서, 아니면 새로 시작
function onStage(id, open){
  if (!open){ toast('앞 스테이지를 먼저 깨 주세요! 🔒'); return; }
  if (S.math.session && S.math.session.stage === id) resume(); else start(id);
}

function map(){
  MathStages.ensure(S);
  $('mWhoTxt').textContent = S.name;
  Avatar.render($('mWhoAv'), {size:'s'});
  $('mWhoAv').onclick = () => window.Shop && Shop.open('body');
  $('mLvlTxt').textContent = `Lv.${level()} · 다음 레벨까지 ${100 - S.xp % 100} XP`;
  $('mXpFill').style.width = (S.xp % 100) + '%';
  $('mCoinTxt').textContent = `💎 ${S.math.coins}`;
  $('mStreakTxt').textContent = `🔥 ${S.streak.n}일`;
  const list = $('mStageList'); list.innerHTML = '';
  let num = 0, current = null;
  MATH_STAGES.forEach((s, i) => {
    if (i === 0 || MATH_STAGES[i-1].ch !== s.ch){
      const c = MATH_CHAPTERS[s.ch], h = document.createElement('div');
      h.className = 'chhead';
      h.innerHTML = `${c.icon} ${s.ch + 1}장 · ${c.name} <small>4-2</small>`;
      list.appendChild(h);
    }
    if (!s.boss) num++;
    const open = MathStages.unlocked(S, s.id);
    const rec = S.math.stages[s.id];
    const stars = rec ? rec.stars : 0;
    const b = document.createElement('button');
    if (!current && open && !rec) current = b;
    b.className = 'stage' + (open ? '' : ' locked') + (s.boss ? ' boss' : '');
    b.innerHTML = `<div class="em">${open ? s.icon : '🔒'}</div><div class="nm">${s.boss ? 'BOSS' : num + '.'} ${s.name}</div>
      <div class="st">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      ${S.math.session && S.math.session.stage === s.id ? '<div class="badge">하던 중</div>' : ''}
      ${open && !rec ? '<div class="badge" style="background:#22c55e">NEW</div>' : ''}`;
    b.onclick = () => onStage(s.id, open);
    list.appendChild(b);
  });
  show('mmap');
  if (current) current.scrollIntoView({block:'center'});
}

/* ── 한 판 ──
   S.math.session = {stage, i, first, score, combo, maxCombo, coins, xp, queue, marks}
   지금 문제의 힌트 상태(Q)는 저장하지 않아요. 나갔다 오면 그 문제를 처음부터 다시 내요 */
const stageOf = id => MATH_STAGES.find(s => s.id === id);
const nextOf = id => MATH_STAGES[MATH_STAGES.findIndex(s => s.id === id) + 1] || null;
// 보스인지 정하는 곳은 여기 하나 (보스 연출은 boss.js 를 수학 문맥 BOSS 로 써요)
const isBoss = id => !!(stageOf(id) && stageOf(id).boss);
const bossNow = () => !!(window.Boss && S.math.session && isBoss(S.math.session.stage));
const optCount = id => MATH_STAGES.findIndex(s => s.id === id) < 2 ? 3 : 4;   // 1~2번 스테이지는 3마리
const ansHtml = p => MathCore.problemHtml(p).replace(/= \?$/, `= <b>${MathCore.html(p.ans)}</b>`);
const skill = k => { const m = S.math.skills; return m[k] || (m[k] = {c:0, wrong:0}); };

let Q = null;          // 지금 문제 {p, opts, tries, afterHint, glow, locked, t0, wrong}
let run = 0;           // 나가거나 새로 시작하면 늘어나요 → 예전 타이머는 무시
let lastStage = null;

// 힌트 칸 (#mhint). MathHint 는 이 칸의 내용을 통째로 바꿔요
function hintShow(mode){ const h = $('mhint'); h.className = 'on ' + mode; h.scrollTop = 0; }
function hintHide(){ const h = $('mhint'); h.className = ''; h.innerHTML = ''; }
const busy = () => $('mhint').classList.contains('on');   // 힌트가 열려 있는 동안 보스 swap/timer 는 쉬어요

// boss.js 에 넘기는 수학 문맥 (Boss.use). 하트·분노는 S.math.session 에, 보상은 💎·S.math.trophies 로
const BOSS = {
  root: mg,
  pal: mg.querySelector('#avPalM'),               // 수학 화면에 이미 있는 아바타 칸을 써요
  session: () => S.math && S.math.session,
  info: () => { const s = S.math && S.math.session; return (s && isBoss(s.stage) && MATH_BOSS[s.stage]) || null; },
  stage: () => stageOf(S.math.session.stage),
  busy: () => !Q || Q.locked || busy(),
  grant: (s, stars) => MathStages.bossReward(S, s, stars),
  rewardHtml: r => Boss.rewardHtml(r),
};

function start(id){
  MathStages.ensure(S);
  S.math.session = {stage:id, i:0, first:0, score:0, combo:0, maxCombo:0, coins:0, xp:0,
    queue:MathStages.buildQueue(id), marks:[]};
  save();
  resume();
}
function resume(){
  MathStages.ensure(S);
  if (!S.math.session){ map(); return; }
  run++; Q = null; hintHide();
  Avatar.render($('avPalM'), {size:'s', pet:true});
  const boss = bossNow();
  if (window.Boss){ Boss.use(BOSS); Boss.reset(); }   // 보스 칸을 #mgame 으로, 지난 판의 보스 흔적 지우기
  $('bossRow').classList.toggle('on', boss);
  show('mgame');
  if (boss){ Boss.enter(next); return; }   // 보스 등장 장면 → 도전 버튼 → 첫 문제
  next();
}
function dots(){
  const s = S.math.session;
  $('mDots').innerHTML = s.queue.map((_, i) =>
    `<i class="${i < s.i ? (s.marks[i] ? 'ok' : 'meh') : i === s.i ? 'now' : ''}"></i>`).join('');
  $('mScore').textContent = s.score;
}
function next(){
  const s = S.math.session;
  if (!s) return;
  if (s.i >= s.queue.length){ if (bossNow()) Boss.victory(finish); else finish(); return; }
  const p = s.queue[s.i];
  const n = bossNow() ? Boss.optionCount() : optCount(s.stage);
  Q = {p, opts:MathStages.options(p, n), tries:0, afterHint:false, glow:false, locked:false, t0:Date.now(), wrong:null};
  dots();
  $('mQ').innerHTML = MathCore.problemHtml(p);
  $('mStatus').innerHTML = '';
  field();
}
// 몬스터를 (다시) 섞어서 놓아요. 같은 문제를 다시 낼 때도 이걸 불러요
function field(){
  const f = $('mField'), n = Q.opts.length, colors = shuffle(MON_COLORS);
  f.className = 'field' + (n === 3 ? ' three' : n === 5 ? ' five' : '');
  f.innerHTML = '';
  shuffle(Q.opts).forEach((v, i) => {
    const b = document.createElement('button'), ok = MathCore.same(v, Q.p.ans);
    b.className = 'mon' + (Math.random() < 0.3 ? ' one' : '') + (ok && Q.glow ? ' hint' : '');
    b.style.setProperty('--c', colors[i]);
    b.style.setProperty('--d', (i * 0.35) + 's');
    if (ok) b.dataset.ok = '1';
    b._v = v;
    b.innerHTML = `<span class="horn l"></span><span class="horn r"></span>
      <span class="blob"><span class="eyes"><i></i><i></i></span><span class="mouth"></span>
      <span class="pic ko mv">${MathCore.html(v)}</span></span><span class="bubble">Hehe~</span>`;
    b.onclick = () => tap(b);
    f.appendChild(b);
  });
  Q.locked = false;
  if (bossNow()) Boss.decorate(f, Q.p);   // 보스 기술 (힌트 뒤 다시 놓을 때도 새로: timer 는 여기서 다시 시작)
}
function glowNow(){
  Q.glow = true;
  document.querySelectorAll('#mField .mon').forEach(m => { if (m.dataset.ok) m.classList.add('hint'); });
}
function tap(el){
  if (!Q || Q.locked) return;
  const boss = bossNow();
  if (boss && Boss.intercept(el)) return;   // 거미줄·얼음 먼저 걷어 내기 (정답 판정 없음)
  const s = S.math.session, p = Q.p;
  if (el.dataset.ok){
    Q.locked = true;
    const first = Q.tries === 0;
    if (first){ skill(p.kind).c++; s.first++; s.combo++; s.maxCombo = Math.max(s.maxCombo, s.combo); }
    const fast = Date.now() - Q.t0 < 4000;
    const pts = first ? 10 + Math.min(s.combo, 10) * 2 + (fast ? 5 : 0) : 5;
    const lvBefore = level();
    s.score += pts; s.xp += first ? 10 : 4; S.xp += first ? 10 : 4;
    const c = first ? (s.combo >= 3 ? 2 : 1) : 0; s.coins += c; S.math.coins += c;
    s.marks[s.i] = first;
    s.i++;
    save();

    sfxGood();
    el.classList.remove('wrong', 'hint'); el.classList.add('caught');
    document.querySelectorAll('#mField .mon').forEach(m => { if (m !== el) m.classList.add('fade'); });
    floatText(el, c ? `+${pts} 💎+${c}` : `+${pts}`);
    if (boss) Boss.onCorrect(el, {first, fast, combo:s.combo, last: s.i >= s.queue.length});
    Avatar.react($('avPalM'), 'cheer');
    $('mStatus').innerHTML = `<span class="answer">${ansHtml(p)}</span>` +
      (first && s.combo >= 2 ? `<span class="combo">🔥 ${s.combo} 콤보!</span>` : '');
    if (level() > lvBefore) setTimeout(() => { toast(`🎉 레벨 업! Lv.${level()}`, 2000); sfxWin(); }, 600);
    dots();
    const r = run;
    setTimeout(() => { if (r === run && S.math.session === s) next(); }, 1900);
    return;
  }
  // ── 틀렸을 때 (스펙 4.4) : 잘못 잡을 때마다 콤보 0, 소리, 아바타 아야 ──
  Q.tries++;
  Q.wrong = el._v;
  s.combo = 0;
  if (Q.tries === 1) skill(p.kind).wrong++;
  save();
  sfxBad(); if (!boss) Avatar.react($('avPalM'), 'hurt');   // 보스전은 boss.js 가 아야 해요
  if (boss) Boss.onWrong();   // 몬스터를 잘못 잡을 때마다 하트 −1 (힌트 안 단계 보기 오답은 여기로 안 와요)
  el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong');
  if (Q.afterHint){ glowNow(); return; }     // 4. 힌트를 본 뒤 또 틀리면 고르기 없이 정답이 빛나요
  if (Q.tries >= 2) glowNow();               // 3. 혼자 다시 풀다 또 틀리면 이번부터 정답이 빛나요
  Q.locked = true;                           // 1. 고르기를 띄우는 동안 몬스터는 잠가요
  if (boss) Boss.stop();                     //    보스 timer·swap 도 쉬어요 (힌트 뒤 field() 에서 다시 시작)
  const q = Q, r = run;
  setTimeout(() => { if (r === run && Q === q) ask(q); }, 650);   // 빨간 몬스터를 잠깐 보여 주고
}
function ask(q){
  hintShow('ask');
  MathHint.ask($('mhint'), {
    wrong: q.wrong,
    onHint(){                                // 2. 힌트 → 작업대 → 끝나면 섞어서 같은 문제
      if (Q !== q) return;
      hintShow('run');
      MathHint.run($('mhint'), q.p, q.wrong, () => {
        if (Q !== q) return;
        hintHide(); q.afterHint = true; q.t0 = Date.now(); field();
      });
    },
    onRetry(){                               // 3. 혼자 다시 → 섞어서 같은 문제
      if (Q !== q) return;
      hintHide(); q.t0 = Date.now(); field();
    },
  });
}

function finish(){
  const s = S.math.session; Q = null; run++;
  hintHide();
  const n = s.queue.length, stars = MathStages.stars(s.first, n);
  const bonus = stars * 5; s.coins += bonus; S.math.coins += bonus;
  lastStage = s.stage;
  const prev = S.math.stages[s.stage], nx = nextOf(s.stage);
  const opened = !prev && !!nx;
  S.math.stages[s.stage] = {stars: Math.max(stars, prev ? prev.stars : 0), best: Math.max(s.score, prev ? prev.best : 0)};
  const reward = (isBoss(s.stage) && window.Boss) ? BOSS.grant(s, stars) : null;   // 보물상자·수학 트로피·💎 (펫 없음)
  S.math.session = null; touchStreak(); save();
  if (window.Boss) Boss.reset();

  const st = stageOf(s.stage);
  Avatar.render($('mAvRes'), {size:'m', pose:'cheer', pet:true});
  $('mrTitle').textContent = isBoss(s.stage) ? `${st.icon} ${st.name} 클리어!` : stars === 3 ? '완벽해요! 🎉' : '스테이지 클리어! 🎉';
  $('mrStars').innerHTML = [0, 1, 2].map(i => `<span>${i < stars ? '⭐' : '☆'}</span>`).join('');
  $('mrStats').innerHTML = `<span class="pill">🎯 한 번에 ${s.first}/${n}</span>
    <span class="pill">⭐ ${s.score}점</span><span class="pill">🔥 최고 ${s.maxCombo}콤보</span>
    <span class="pill">💎 +${s.coins}</span>`;
  $('mrNew').innerHTML = (reward ? BOSS.rewardHtml(reward) : '') +
    (opened ? `<p style="margin:10px 0 0;font-size:22px;color:#16a34a">🔓 새 스테이지가 열렸어요!</p>` : '');
  $('mrNext').style.display = nx ? '' : 'none';
  show('mresult'); sfxWin();
  if (reward){ Boss.showChest(reward); return; }
  setTimeout(() => say(stars === 3 ? '완벽해요! 정말 대단해요!' : '잘했어요!'), 500);
}

$('mQuit').onclick = () => {
  if (confirm('지도로 갈까요?\n지금까지 한 것은 저장돼서 나중에 이어서 할 수 있어요 😊')){
    run++; Q = null; hintHide();
    if (window.Boss) Boss.reset();
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch(e){}
    save(); map();
  }
};
$('mrMap').onclick = () => map();
$('mrAgain').onclick = () => start(lastStage);
$('mrNext').onclick = () => { const nx = nextOf(lastStage); if (nx) start(nx.id); };

// 한국어로 읽기: ko 음성이 있을 때만 (영어 speak()/voice 는 건드리지 않아요)
function say(text){
  try {
    if (!text || !('speechSynthesis' in window)) return;
    const v = speechSynthesis.getVoices().find(x => /^ko/i.test(x.lang));
    if (!v) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'ko-KR'; u.voice = v; u.rate = 1;
    speechSynthesis.speak(u);
  } catch(e){}
}

window.MathGame = {pick, map, start, resume, say, session: () => S.math.session, isBoss, busy};
})();
