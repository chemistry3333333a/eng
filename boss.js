/* =====================================================================
   워드 아일랜드 · 보스전
   - 공통 연출: 등장 장면, 공격(별/불꽃/번개/크리티컬), 보스 반격과 하트, 분노 모드, 마지막 한 방, 승리 장면
   - 보스마다 다른 특수 기술 (INFO 의 skill)
   - 보상: 보물상자(코인), 트로피, 구해 낸 친구(펫)
   index.html 의 게임 코드가 Boss.* 를 불러 써요.
   ===================================================================== */
(function(){
const INFO = {
  10:  {skill:'none',     tip:'첫 보스예요. 침착하게 잘 들어 봐요!',              taunt:["I am the wizard! You can't catch me!",'나는 마법사다! 넌 날 못 잡아!'], rage:["Now I'm angry!",'이제 화났다!']},
  103: {skill:'web',      tip:'🕸️ 거미줄은 먼저 터치해서 걷어 내요!',             taunt:['My web will stop you!','내 거미줄이 널 막을 거야!'], rage:['More webs!','거미줄을 더 쳐 주마!']},
  104: {skill:'ghost',    tip:'👻 몬스터가 사라졌다 나타나요. 잘 지켜봐요!',       taunt:['Boo! Can you see me?','부! 내가 보이니?'], rage:["Now you see me, now you don't!",'보였다 안 보였다!']},
  105: {skill:'timer',    tip:'⏳ 시간 막대가 다 차기 전에 맞혀요!',               taunt:['Hurry up! Time is running out!','서둘러! 시간이 없어!'], rage:['Faster! Faster!','더 빨리! 더 빨리!']},
  20:  {skill:'swap',     tip:'🔀 몬스터 자리가 계속 바뀌어요!',                   taunt:["Let's mix them up!",'몽땅 섞어 버리자!'], rage:['Mix, mix, mix!','섞어, 섞어, 섞어!']},
  106: {skill:'shadow',   tip:'🌑 그림이 그림자로만 보여요!',                      taunt:['Welcome to the dark forest!','어둠의 숲에 온 걸 환영해!'], rage:["It's getting darker!",'점점 어두워진다!']},
  30:  {skill:'spell',    tip:'🔤 그림 대신 영어 글자를 읽고 골라요!',             taunt:['Can you read my magic words?','내 마법 글자를 읽을 수 있니?'], rage:['Read faster!','더 빨리 읽어 봐!']},
  107: {skill:'robot',    tip:'🤖 로봇이 빠르게 말해요. 🐢 버튼을 써도 돼요!',     taunt:['Beep beep! Robot attack!','삐삐! 로봇 공격!'], rage:['Speed up! Beep!','속도 올려! 삐!']},
  108: {skill:'sentence', tip:'📖 문장 속에 숨은 단어를 찾아 들어요!',             taunt:['Listen to my story!','내 이야기를 잘 들어 봐!'], rage:['Listen carefully!','아주 잘 들어!']},
  109: {skill:'ice',      tip:'🧊 얼어붙은 몬스터는 한 번 눌러 얼음을 깨요!',      taunt:['I will freeze everything!','모든 걸 얼려 버리겠다!'], rage:['Freeze!','얼어라!']},
  110: {skill:'mix',      tip:'👑 지금까지 나온 모든 기술을 써요!',                taunt:['I am the great wizard! Show me everything!','나는 대마법사! 네 실력을 모두 보여 봐!'], rage:['This is my final magic!','이게 나의 마지막 마법이다!']},
};
const SKILL_LABEL = {none:'', web:'🕸️ 거미줄', ghost:'👻 투명 마법', timer:'⏳ 시간 제한', swap:'🔀 자리 바꾸기', shadow:'🌑 그림자',
  spell:'🔤 글자 읽기', robot:'🤖 빠른 말', sentence:'📖 문장 듣기', ice:'🧊 얼음'};
const MIX = ['web','ghost','timer','swap','shadow','spell','ice','sentence'];
const DEFEAT = [['Thank you! I am free!','고마워! 이제 자유야!'],['The magic is gone! Thank you!','마법이 풀렸어! 고마워!'],["You are so smart! Let's be friends!",'정말 똑똑하구나! 우리 친구 하자!']];
const SENT = [w => `The magic word is ${w}.`, w => `Find the word ${w}!`, w => `Can you find ${w}?`, w => `Listen. ${w}!`];
const MAX_HEARTS = 5;
const PET_TALK = ['Yay!','Good!','최고!','멋져!','Wow!','짱!'];

/* ---------- 스타일 ---------- */
const css = `
.bossrow{display:none;align-items:center;gap:14px;justify-content:center;background:#ffffffcc;border-radius:24px;padding:6px 16px;align-self:center;max-width:100%;}
.bossrow.on{display:flex;}
.bx-face{font-size:68px;line-height:1;display:inline-block;animation:bob 1.8s infinite;transition:filter .3s;}
.bx-face.hit{animation:bxHit .45s;}
.bx-face.lunge{animation:bxLunge .45s;}
.bx-face.rage{filter:drop-shadow(0 0 12px #ef4444) saturate(1.8);}
.bx-info{display:flex;flex-direction:column;gap:4px;min-width:0;}
.bx-name{font-size:22px;white-space:nowrap;}
.bx-skill{font-size:15px;color:#7c3aed;margin-left:6px;}
.bossrow .hp{position:relative;width:min(48vw,380px);height:22px;background:#fff;border-radius:12px;overflow:hidden;border:3px solid #fff;box-shadow:0 0 0 2px #0002;}
.bossrow .hp b{position:absolute;left:0;top:0;bottom:0;background:#fde047;transition:width .6s .45s;}
.bossrow .hp i{position:absolute;left:0;top:0;bottom:0;height:100%;background:linear-gradient(90deg,#ef4444,#f97316);transition:width .3s;}
.bx-hearts{font-size:20px;letter-spacing:1px;}
.bx-charge{height:10px;background:#fff;border-radius:6px;overflow:hidden;display:none;}
.bx-charge.on{display:block;}
.bx-charge i{display:block;height:100%;width:0;background:linear-gradient(90deg,#facc15,#ef4444);}
#game.bx-on{background:linear-gradient(180deg,#4c1d95,#a78bfa);}
#game.bx-on.bx-rage{background:linear-gradient(180deg,#7f1d1d,#f97316);}
#game.bx-on .status{color:#fff;}
#game.bx-on .status .answer{color:#1e293b;}
.bx-shake{animation:bxShake .45s;}

.field.ghosty .mon .blob{animation:bxGhost 3.2s infinite;}
.field.ghosty.fast .mon .blob{animation-duration:2.2s;}
.field.ghosty .mon:nth-child(2) .blob{animation-delay:.8s;} .field.ghosty .mon:nth-child(3) .blob{animation-delay:1.6s;}
.field.ghosty .mon:nth-child(4) .blob{animation-delay:2.4s;} .field.ghosty .mon:nth-child(5) .blob{animation-delay:1.2s;}
.field.shadowy .mon{--c:#475569 !important;}
.field.shadowy .mon .pic:not(.ko){filter:brightness(0) opacity(.85);}
.field.robo .mon{--c:#94a3b8 !important;}
.field.robo .mon .eyes i::after{background:#ef4444;}
.mon .pic.en{font-family:system-ui,sans-serif;font-weight:700;color:#1d4ed8;font-size:calc(var(--size)*.13);word-break:break-word;}
.mon .web{position:absolute;inset:0;display:grid;place-items:center;font-size:calc(var(--size)*.85);z-index:3;pointer-events:none;filter:drop-shadow(0 0 4px #fff);transition:.3s;}
.mon .ice{position:absolute;left:0;right:0;top:10%;bottom:-4%;border-radius:30%;background:linear-gradient(135deg,#e0f2fedd,#7dd3fcbb);border:4px solid #fff;
  z-index:3;pointer-events:none;display:grid;place-items:center;font-size:calc(var(--size)*.3);transition:.3s;}
.mon .web.gone,.mon .ice.gone{opacity:0;transform:scale(1.4);}
.mon.frozen{animation:none;}
.mon.bxpop{animation:pop .35s;}

.bx-ov{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
  background:rgba(15,10,40,.9);color:#fff;text-align:center;padding:20px;}
.bx-warn{font-size:clamp(30px,6vw,52px);color:#fde047;animation:bxBlink .5s steps(2) infinite;letter-spacing:2px;}
.bx-big{font-size:clamp(110px,22vw,170px);line-height:1;display:inline-block;}
.bx-big.drop{animation:bxDrop .7s cubic-bezier(.3,1.6,.5,1) backwards .3s;}
.bx-big.burst{animation:bxBurst .8s forwards;}
.bx-big.friend{animation:pop .6s, bob 2s infinite .6s;filter:drop-shadow(0 0 24px #fde047);}
.bx-ov .bname{font-size:34px;}
.bx-say{background:#fff;color:#1e293b;border-radius:22px;padding:12px 22px;max-width:560px;animation:pop .4s backwards 1s;}
.bx-say b{display:block;font-size:26px;} .bx-say small{font-size:18px;color:#475569;}
.bx-tip{font-size:20px;color:#ddd6fe;}
.bx-ov .btn{animation:pop .4s backwards 1.3s;}
.bx-flash{position:fixed;inset:0;z-index:35;pointer-events:none;box-shadow:inset 0 0 140px 50px #ef4444;animation:bxFade .7s forwards;}
.bx-proj{position:fixed;z-index:36;font-size:54px;pointer-events:none;left:0;top:0;}
.bx-dmg{position:fixed;z-index:37;font-size:34px;color:#fff;text-shadow:0 3px 0 #b91c1c,0 0 10px #000;pointer-events:none;animation:up 1s forwards;white-space:nowrap;}
.bx-dmg.crit{font-size:40px;color:#fde047;}
.bx-banner{position:fixed;left:50%;top:42%;z-index:38;font-size:clamp(40px,9vw,80px);color:#fde047;text-shadow:0 5px 0 #b91c1c,0 0 30px #f97316;
  pointer-events:none;animation:bxBanner 1.5s forwards;white-space:nowrap;}
.bx-conf{position:fixed;left:50%;top:42%;font-size:34px;z-index:41;pointer-events:none;animation:bxConf 1.4s ease-out forwards;}
.bx-chest{font-size:150px;line-height:1;display:inline-block;animation:bxWiggle .5s infinite;cursor:pointer;}
.bx-rew{display:flex;flex-direction:column;gap:10px;font-size:26px;}
.bx-rew div{background:#ffffff22;border-radius:16px;padding:8px 18px;animation:pop .4s backwards;}
.bx-rew div:nth-child(2){animation-delay:.3s} .bx-rew div:nth-child(3){animation-delay:.6s} .bx-rew div:nth-child(4){animation-delay:.9s}
#avPal{position:absolute;left:14px;bottom:14px;z-index:5;pointer-events:none;}
#avPal .av-pet .pb{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);background:#fff;border-radius:12px;padding:2px 10px;font-size:18px;white-space:nowrap;color:#1e293b;}
#trophy{align-items:center;}
.tgrid{flex:1;width:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;padding:16px 2px;align-content:start;}
.tcard{border:0;background:#fff;border-radius:22px;padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:0 6px 0 rgba(0,0,0,.1);position:relative;}
.tcard .tt{font-size:46px;line-height:1.1;} .tcard .tn{font-size:19px;} .tcard .tp{font-size:17px;color:#475569;}
.tcard.locked{background:#e2e8f0;} .tcard.locked .tt{filter:grayscale(1) opacity(.4);}
.tcard.with{box-shadow:0 0 0 5px #22c55e,0 6px 0 rgba(0,0,0,.1);}
.tcard .tw{position:absolute;top:-8px;right:-4px;background:#22c55e;color:#fff;font-size:14px;padding:3px 9px;border-radius:10px;}
@keyframes bxDrop{0%{transform:translateY(-120vh) scale(.6)}100%{transform:none}}
@keyframes bxBlink{50%{opacity:.25}}
@keyframes bxHit{0%{filter:brightness(3)}30%{transform:translateX(-12px) rotate(-8deg)}60%{transform:translateX(12px) rotate(8deg)}100%{transform:none}}
@keyframes bxLunge{0%{transform:none}40%{transform:translateY(40px) scale(1.4)}100%{transform:none}}
@keyframes bxShake{0%,100%{transform:none}20%{transform:translate(-10px,6px)}40%{transform:translate(10px,-6px)}60%{transform:translate(-8px,-4px)}80%{transform:translate(8px,4px)}}
@keyframes bxFade{to{opacity:0}}
@keyframes bxGhost{0%,30%,100%{opacity:1}45%,65%{opacity:.04}}
@keyframes bxBanner{0%{transform:translate(-50%,-50%) scale(.2);opacity:0}20%{transform:translate(-50%,-50%) scale(1.15);opacity:1}80%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.3)}}
@keyframes bxConf{0%{transform:translate(-50%,-50%)}100%{transform:translate(calc(-50% + var(--x)),calc(-50% + var(--y))) rotate(var(--r));opacity:0}}
@keyframes bxBurst{0%{transform:scale(1)}40%{transform:scale(1.3) rotate(-10deg);filter:brightness(2.2)}100%{transform:scale(0) rotate(30deg);opacity:0}}
@keyframes bxWiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)}}
@keyframes bxJump{40%{transform:translateY(-40px) rotate(-10deg)}}
`;
const styleEl = document.createElement('style'); styleEl.textContent = css; document.head.appendChild(styleEl);

/* ---------- 화면 조각 ---------- */
$('bossRow').innerHTML = `<span class="bx-face" id="bossFace">🧙</span>
  <div class="bx-info">
    <div class="bx-name"><span id="bossName"></span><span class="bx-skill" id="bossSkill"></span></div>
    <div class="hp"><b id="hpLag"></b><i id="hpFill"></i></div>
    <div class="bx-charge" id="bxCharge"><i></i></div>
  </div>
  <div class="bx-hearts" id="bxHearts"></div>`;
const pal = document.createElement('div'); pal.id = 'avPal'; $('game').appendChild(pal);

const room = document.createElement('section');
room.id = 'trophy'; room.className = 'screen';
room.innerHTML = `<div class="dexhead"><button class="icon" id="trophyBack">⬅️</button><h2>🏆 트로피 & 친구 <span id="trophyCount" style="font-size:22px"></span></h2></div>
  <p style="margin:4px 0 0;font-size:18px;color:#0c4a6e">구해 낸 친구를 누르면 게임에서 함께 다녀요!</p>
  <div class="tgrid" id="trophyGrid"></div>`;
document.body.appendChild(room);
const tBtn = document.createElement('button');
tBtn.className = 'btn small'; tBtn.id = 'trophyBtn'; tBtn.textContent = '🏆 트로피';
tBtn.style.cssText = 'background:#eab308;box-shadow:0 6px 0 #a16207';
$('setBtn').before(tBtn);

/* ---------- 상태 ---------- */
let timers = [], won = false, qSkill = 'none', qSay = null;
const ses = () => S && S.session;
const isOn = () => { const s = ses(); return !!(s && typeof s.stage === 'number' && INFO[s.stage]); };
const info = () => INFO[ses().stage];
const bossStage = () => STAGES.find(s => s.id === ses().stage);
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
function clearTimers(){
  timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = [];
  const c = $('bxCharge'); c.classList.remove('on'); c.firstElementChild.style.transition = 'none'; c.firstElementChild.style.width = '0';
}
function overlay(html){
  const o = document.createElement('div'); o.className = 'bx-ov'; o.innerHTML = html;
  document.body.appendChild(o); return o;
}
function banner(text){
  const b = document.createElement('div'); b.className = 'bx-banner'; b.textContent = text;
  document.body.appendChild(b); setTimeout(() => b.remove(), 1500);
}
function shake(){ const g = $('game'); g.classList.remove('bx-shake'); void g.offsetWidth; g.classList.add('bx-shake'); }
function retrigger(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
const boom = () => { tone(90,.4,'sawtooth',0,.12); tone(60,.5,'square',.05,.08); };
const zap  = () => { tone(1200,.08,'square',0,.06); tone(1800,.1,'square',.06,.05); };
function confetti(n){
  const set = ['🎉','✨','⭐','🎊','💫','🌟'];
  for (let i=0;i<n;i++){
    const c = document.createElement('div'); c.className = 'bx-conf'; c.textContent = set[i % set.length];
    const a = Math.random() * Math.PI * 2, d = 160 + Math.random() * 260;
    c.style.setProperty('--x', Math.cos(a)*d + 'px'); c.style.setProperty('--y', Math.sin(a)*d + 'px');
    c.style.setProperty('--r', (Math.random()*720-360) + 'deg');
    document.body.appendChild(c); setTimeout(() => c.remove(), 1500);
  }
}

/* ---------- 보스 칸 ---------- */
function renderHearts(){
  const s = ses(), h = Math.max(0, s.hearts);
  $('bxHearts').textContent = '❤️'.repeat(h) + '🤍'.repeat(Math.max(0, MAX_HEARTS - h));
}
function updateHp(){
  const s = ses(), w = (100 - s.i / s.queue.length * 100) + '%';
  $('hpFill').style.width = w; $('hpLag').style.width = w;
}
function renderPet(){
  Avatar.render(pal, {size:'s', pet:true});   // 꾸민 캐릭터 + 고른 펫
}

/* ---------- 등장 ---------- */
function reset(){
  clearTimers(); won = false;
  document.querySelectorAll('.bx-ov').forEach(o => o.remove());
  $('game').classList.remove('bx-on','bx-rage');
  renderPet();
}
function enter(go){
  const s = ses(), st = bossStage(), inf = info();
  if (s.hearts === undefined){ s.hearts = MAX_HEARTS; s.rage = false; s.revived = false; save(); }
  $('game').classList.add('bx-on'); $('game').classList.toggle('bx-rage', !!s.rage);
  $('bossFace').textContent = st.icon; $('bossFace').classList.toggle('rage', !!s.rage);
  $('bossName').textContent = st.name; $('bossSkill').textContent = SKILL_LABEL[inf.skill === 'mix' ? 'none' : inf.skill] || '';
  renderHearts(); updateHp();
  const o = overlay(`<div class="bx-warn">⚠️ BOSS BATTLE ⚠️</div>
    <div class="bx-big drop">${st.icon}</div><div class="bname">${st.name}</div>
    <div class="bx-say"><b>${inf.taunt[0]}</b><small>${inf.taunt[1]}</small></div>
    <div class="bx-tip">${inf.tip}</div>
    <button class="btn">${s.i > 0 ? '⚔️ 계속 싸우기' : '⚔️ 도전!'}</button>`);
  setTimeout(() => { boom(); retrigger(o, 'bx-shake'); }, 900);
  setTimeout(() => speak(inf.taunt[0]), 1100);
  o.querySelector('.btn').onclick = () => { o.remove(); unlockAudio(); go(); };
}

/* ---------- 문제마다 특수 기술 ---------- */
function optionCount(){ return (ses().rage && ses().stage !== 10) ? 5 : 4; }
function pickSome(list, n){ return shuffle(list).slice(0, n); }
function decorate(field, target){
  clearTimers();
  const s = ses(), inf = info(), rage = !!s.rage;
  qSkill = inf.skill === 'mix' ? MIX[Math.floor(Math.random() * MIX.length)] : inf.skill;
  qSay = null;
  if (inf.skill === 'mix') $('bossSkill').textContent = SKILL_LABEL[qSkill];
  updateHp();
  const mons = [...field.querySelectorAll('.mon')];
  if (qSkill === 'web'){
    pickSome(mons, rage ? 2 : 1).forEach(m => { m.classList.add('webbed'); m.insertAdjacentHTML('beforeend', '<span class="web">🕸️</span>'); });
  } else if (qSkill === 'ice'){
    pickSome(mons, rage ? 3 : 2).forEach(m => { m.classList.add('frozen'); m.insertAdjacentHTML('beforeend', '<span class="ice">🧊</span>'); });
  } else if (qSkill === 'ghost'){
    field.classList.add('ghosty'); if (rage) field.classList.add('fast');
  } else if (qSkill === 'shadow'){
    field.classList.add('shadowy');
  } else if (qSkill === 'robot'){
    field.classList.add('robo');
  } else if (qSkill === 'spell'){
    mons.forEach(m => { m.querySelector('.pic').outerHTML = `<span class="pic ko en">${m.dataset.w}</span>`; });
  } else if (qSkill === 'sentence'){
    qSay = SENT[Math.floor(Math.random() * SENT.length)](target);
  } else if (qSkill === 'swap'){
    const t = setInterval(() => {
      if (!Q || Q.locked) return;
      shuffle([...field.children]).forEach(m => { field.appendChild(m); retrigger(m, 'bxpop'); });
      tone(500,.06,'triangle',0,.05);
    }, rage ? 2000 : 3000);
    timers.push(t);
  } else if (qSkill === 'timer'){
    startCharge(rage ? 6000 : 8000);
  }
  if (s.i === s.queue.length - 1) banner('FINAL BLOW!');
}
function startCharge(ms){
  const c = $('bxCharge'), bar = c.firstElementChild;
  c.classList.add('on'); bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth;
  bar.style.transition = `width ${ms}ms linear`; bar.style.width = '100%';
  later(() => {
    if (!Q || Q.locked) return;
    toast('⏳ 시간 초과! 보스의 공격!', 1400);
    attack();
    startCharge(ms);
  }, ms + 300);   // 문제를 읽어 주는 시간만큼 조금 더 줘요
}
function speech(target){
  const rage = !!ses().rage;
  if (qSkill === 'sentence' && qSay) return {text:qSay};
  if (qSkill === 'robot') return {text:target, rate: rage ? 1.35 : 1.2};
  return {text:target};
}
// 거미줄·얼음이 있으면 먼저 걷어 내요 (정답 판정 없음)
function intercept(el){
  const cover = el.querySelector('.web, .ice');
  if (!cover) return false;
  el.classList.remove('webbed', 'frozen');
  cover.classList.add('gone'); setTimeout(() => cover.remove(), 300);
  if (cover.classList.contains('ice')){ tone(1500,.05,'square',0,.06); tone(900,.08,'square',.04,.05); floatText(el, '쨍그랑!'); }
  else { tone(300,.12,'sawtooth',0,.05); floatText(el, '찢었다!'); }
  return true;
}

/* ---------- 공격과 반격 ---------- */
function fly(fromEl, emoji, dur, cb){
  const a = fromEl.getBoundingClientRect(), b = $('bossFace').getBoundingClientRect();
  const p = document.createElement('div'); p.className = 'bx-proj'; p.textContent = emoji; document.body.appendChild(p);
  const x0 = a.left + a.width/2 - 27, y0 = a.top + a.height/2 - 27, x1 = b.left + b.width/2 - 27, y1 = b.top + b.height/2 - 27;
  const done = () => { p.remove(); cb(); };
  if (!p.animate){ setTimeout(done, dur); return; }
  p.animate([
    {transform:`translate(${x0}px,${y0}px) scale(1)`},
    {transform:`translate(${(x0+x1)/2}px,${Math.min(y0,y1) - 120}px) scale(1.6) rotate(180deg)`},
    {transform:`translate(${x1}px,${y1}px) scale(.8) rotate(360deg)`}
  ], {duration:dur, easing:'ease-in'}).onfinish = done;
}
function onCorrect(el, o){
  if (!isOn()) return;
  clearTimers();
  const s = ses();
  const crit = o.first && o.fast;
  const emoji = o.last ? '💫' : o.combo >= 5 ? '⚡' : o.combo >= 3 ? '🔥' : '⭐';
  fly(el, emoji, o.last ? 1100 : 550, () => {
    const face = $('bossFace'); retrigger(face, 'hit'); zap(); if (o.last){ boom(); shake(); }
    const r = face.getBoundingClientRect(), d = document.createElement('div');
    d.className = 'bx-dmg' + (crit ? ' crit' : ''); d.textContent = crit ? 'CRITICAL! -1' : o.combo >= 3 ? `${emoji} COMBO -1` : '-1';
    d.style.left = (r.left + r.width/2) + 'px'; d.style.top = r.top + 'px';
    document.body.appendChild(d); setTimeout(() => d.remove(), 1000);
    updateHp();
    const left = s.queue.length - s.i;
    if (!s.rage && left > 0 && left <= s.queue.length / 2) rageOn();
  });
}
function rageOn(){
  const s = ses(), inf = info();
  s.rage = true; save();
  $('game').classList.add('bx-rage'); $('bossFace').classList.add('rage');
  banner('😡 분노 모드!'); boom(); shake();
  speak(inf.rage[0]); toast(`😡 "${inf.rage[1]}"`, 1600);
}
function attack(){
  const s = ses();
  retrigger($('bossFace'), 'lunge');
  setTimeout(() => {
    shake(); boom();
    const f = document.createElement('div'); f.className = 'bx-flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 700);
    s.hearts--; Avatar.react(pal, 'hurt');
    if (s.hearts <= 0 && !s.revived){            // 게임오버 대신 요정이 한 번 살려 줘요
      s.hearts = 3; s.revived = true;
      setTimeout(() => toast('🧚 요정이 하트를 채워 줬어요! 포기하지 마!', 2200), 300);
    }
    s.hearts = Math.max(0, s.hearts);
    renderHearts(); save();
  }, 220);
}
function onWrong(){ if (isOn()) attack(); }

/* ---------- 승리 ---------- */
function victory(done){
  if (won) return; won = true;
  clearTimers();
  const st = bossStage(), line = DEFEAT[Math.floor(Math.random() * DEFEAT.length)];
  const o = overlay(`<div class="bx-big" id="bxBig">${st.icon}</div><div class="bx-warn" style="animation:none">VICTORY!</div>`);
  const big = o.querySelector('#bxBig');
  setTimeout(() => { big.classList.add('burst'); boom(); confetti(28); sfxWin(); }, 500);
  setTimeout(() => {
    big.classList.remove('burst'); big.classList.add('friend');
    o.insertAdjacentHTML('beforeend', `<div class="bx-say" style="animation-delay:.2s"><b>${line[0]}</b><small>${line[1]}</small></div>
      <button class="btn green" style="animation-delay:.6s">🎁 보상 받기</button>`);
    speak(line[0]);
    o.querySelector('.btn').onclick = () => { o.remove(); done(); };
  }, 1500);
}

/* ---------- 보상 ---------- */
function grantRewards(s, stars){
  const id = s.stage;
  S.trophies = S.trophies || {}; S.pets = S.pets || [];
  const prev = S.trophies[id] || 0;
  S.trophies[id] = Math.max(prev, stars);
  const newPet = !S.pets.includes(id);
  if (newPet){ S.pets.push(id); S.petOn = id; }
  const hearts = Math.max(0, s.hearts || 0);
  const coins = 30 + stars * 10 + hearts * 3;
  S.coins += coins; s.coins += coins;
  return {coins, stars, hearts, trophyUp: stars > prev, newPet, pet: PETS[id], name: bossName(id)};
}
const bossName = id => (STAGES.find(s => s.id === id) || {}).name;
function rewardHtml(r){
  return `<p style="margin:6px 0;font-size:22px">🎁 보스 보상</p><div class="newcards">
    <span>🪙 코인 +${r.coins}</span><span>${MEDAL[r.stars]} 트로피${r.trophyUp ? ' 획득!' : ''}</span>
    ${r.newPet ? `<span>${r.pet[0]} ${r.pet[1]}를 구했어요!</span>` : ''}</div>`;
}
function showChest(r){
  const o = overlay(`<div class="bx-tip" style="font-size:26px;color:#fde047">보물상자를 눌러 열어요!</div><div class="bx-chest">🎁</div>`);
  const open = () => {
    if (o.dataset.open) return; o.dataset.open = 1;
    sfxWin(); confetti(20);
    o.innerHTML = `<div class="bx-warn" style="animation:none">🎉 보물 획득! 🎉</div>
      <div class="bx-rew">
        <div>🪙 코인 +${r.coins} <small style="font-size:16px">(하트 ${r.hearts}개 보너스 포함)</small></div>
        <div>${MEDAL[r.stars]} ${r.name} 트로피${r.trophyUp ? ' 획득!' : ''}</div>
        ${r.newPet ? `<div>${r.pet[0]} 친구 <b>${r.pet[1]}</b>를 구했어요!<br><small style="font-size:17px">이제 게임에서 함께 다녀요</small></div>` : ''}
      </div>
      <button class="btn green" style="animation-delay:1.2s">좋아요!</button>`;
    o.querySelector('.btn').onclick = () => o.remove();
    if (r.newPet) setTimeout(() => speak("Hi! Let's play together!"), 900);
  };
  o.querySelector('.bx-chest').onclick = open;
  setTimeout(open, 2500);
}

/* ---------- 펫 ---------- */
function petCheer(){
  const pet = S.petOn && pal.querySelector('.av-pet');
  if (!pet) return;
  const old = pet.querySelector('.pb'); if (old) old.remove();
  const b = document.createElement('span'); b.className = 'pb';
  b.textContent = PET_TALK[Math.floor(Math.random() * PET_TALK.length)];
  pet.appendChild(b);
  pet.animate([{transform:'translateX(-50%)'}, {transform:'translateX(-50%) translateY(-.6em) rotate(-10deg)', offset:.4}, {transform:'translateX(-50%)'}], 600);
  setTimeout(() => b.remove(), 1100);
}

/* ---------- 트로피 방 ---------- */
function renderTrophies(){
  const g = $('trophyGrid'); g.innerHTML = '';
  let got = 0;
  CHAPTERS.forEach((c, ci) => {
    const id = c.boss.id, t = (S.trophies || {})[id] || 0, pet = PETS[id], has = (S.pets || []).includes(id);
    if (t) got++;
    const b = document.createElement('button');
    b.className = 'tcard' + (t ? '' : ' locked') + (S.petOn === id ? ' with' : '');
    b.innerHTML = t
      ? `<div class="tt">${MEDAL[t]}${c.boss.icon}</div><div class="tn">${ci+1}장 ${c.boss.name}</div><div class="tp">${has ? pet[0] + ' ' + pet[1] : ''}</div>${S.petOn === id ? '<span class="tw">함께하는 중</span>' : ''}`
      : `<div class="tt">❓</div><div class="tn">${ci+1}장 보스</div><div class="tp">아직 못 깼어요</div>`;
    b.onclick = () => {
      if (!has){ toast('보스를 물리치면 친구를 구할 수 있어요!'); return; }
      S.petOn = id; save(); renderTrophies(); toast(`${pet[0]} ${pet[1]}와 함께 해요!`);
    };
    g.appendChild(b);
  });
  $('trophyCount').textContent = `(${got}/${CHAPTERS.length})`;
  show('trophy');
}
tBtn.onclick = renderTrophies;
$('trophyBack').onclick = renderMap;

window.Boss = {isOn, reset, enter, optionCount, decorate, speech, intercept, onCorrect, onWrong, victory,
  grantRewards, rewardHtml, showChest, petCheer, stop: () => { clearTimers(); document.querySelectorAll('.bx-ov').forEach(o => o.remove()); }};
})();
