/* =====================================================================
   워드 아일랜드 · 수학 섬 (섬 고르기, 수학 지도)
   - section#island, section#mmap 과 영어 지도의 "🔢 수학 섬" 버튼을 스스로 주입해요 (boss.js · shop.js 와 같은 방식)
   - 스테이지를 눌렀을 때의 시작/이어하기는 onStage 에서 이어 붙여요
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

function pick(){
  MathStages.ensure(S);
  $('islTitle').textContent = `🧒 ${S.name}야, 오늘은 뭘 할까?`;
  $('islEng').innerHTML = `<span class="big">🔤</span>영어 섬<small>🪙 ${S.coins} · 단어 ${seenWords()}개</small>`;
  $('islMath').innerHTML = `<span class="big">🔢</span>수학 섬<small>💎 ${S.math.coins} · 4-2 분수·소수</small>`;
  show('island');
}
$('islEng').onclick = goEng;
$('islMath').onclick = goMath;
$('toMathBtn').onclick = goMath;
$('mEngBtn').onclick = goEng;
$('mShopBtn').onclick = () => window.Shop && Shop.open(undefined, 'math');
$('mSetBtn').onclick = () => $('setBtn').click();

// 스테이지 버튼 처리 (시작/이어하기는 다음 태스크에서 채워요)
function onStage(id, open){
  if (!open){ toast('앞 스테이지를 먼저 깨 주세요! 🔒'); return; }
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

window.MathGame = {pick, map};
})();
