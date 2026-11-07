/* =====================================================================
   워드 아일랜드 · 수학 힌트 (틀렸을 때 고르기 + 블록 작업대)
   - MathHint.ask(container, {wrong, onHint, onRetry}) : "힌트 볼래? 혼자 다시 할래?"
   - MathHint.run(container, p, wrongPick, onDone)    : MathCore.hintPlan(p) 단계를 블록으로 진행
   - 화면은 container 안에만 그려요. CSS 는 boss.js 처럼 여기서 주입 (분수 .mf/.md/.mx 도 여기서 정의)
   - 끌 때 복제본(ghost)은 position:fixed 가 되도록 document.body 에 붙이고, 놓거나 새 힌트를 띄우면 지워요
   - 블록: 판 1장 = 1, 막대 1개 = 0.1, 작은 칸 1개 = 0.01, 분수는 분모만큼 칸이 있는 틀
   ===================================================================== */
(() => {
const css = `
.mf{display:inline-flex;flex-direction:column;align-items:stretch;text-align:center;vertical-align:middle;line-height:1.05;margin:0 .1em;}
.mf>span{padding:0 .18em;}
.mf>.md{border-top:.1em solid currentColor;}
.mx{display:inline-flex;align-items:center;vertical-align:middle;}
.mx>.mf{font-size:.78em;margin-left:.08em;}
.hl{background:#fff1a8;border-radius:8px;padding:0 4px;}
.cg{color:#16a34a;} .co{color:#ea7a1a;} .cb{color:#2f80ed;} .cr{color:#e03131;}

.mh-root{position:relative;overflow:hidden;box-sizing:border-box;width:100%;max-width:900px;margin:0 auto;padding:16px;
  background:linear-gradient(#bfe9ff,#f3fbff);border-radius:20px;color:#1d2b3a;text-align:left;}
.mh-eq{background:#fff;border-radius:14px;font-size:26px;font-weight:800;padding:8px 16px;text-align:center;min-height:56px;
  line-height:1.9;box-sizing:border-box;display:flex;align-items:center;justify-content:center;}
.mh-eq>span.mh-eqin{display:block;}
.mh-steps{display:flex;gap:6px;justify-content:center;margin:8px 0 2px;}
.mh-steps i{width:28px;height:8px;border-radius:4px;background:#cfdbe6;transition:.2s;}
.mh-steps i.on{background:#ff8a3d;} .mh-steps i.now{background:#ffc9a3;transform:scaleY(1.4);}
.mh-owl{display:flex;gap:10px;align-items:flex-start;margin:12px 0;}
.mh-who{font-size:40px;line-height:1;}
.mh-bub{background:#fff;border-radius:16px;padding:10px 14px;font-size:18px;font-weight:600;line-height:1.7;box-shadow:0 2px 0 rgba(0,0,0,.08);flex:1;min-width:0;}
.mh-oops{color:#e67e22;font-weight:700;}
.mh-pick{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;padding:10px 0 4px;}
.mh-big{border:0;border-radius:18px;padding:14px 20px;font-size:20px;font-weight:800;cursor:pointer;color:#fff;min-width:200px;}
.mh-big small{display:block;font-size:14px;font-weight:600;opacity:.9;margin-top:4px;}
.mh-big:active{transform:translateY(3px);}
.mh-big.mh-h{background:#7c5cff;box-shadow:0 5px 0 #5a3fd6;}
.mh-big.mh-s{background:#ff8a3d;box-shadow:0 5px 0 #d96a20;}

.mh-bench{display:flex;gap:18px;justify-content:center;align-items:stretch;flex-wrap:wrap;margin-top:6px;}
.mh-box{background:#fff;border-radius:16px;padding:12px;min-width:220px;max-width:100%;box-sizing:border-box;text-align:center;
  box-shadow:0 3px 0 rgba(0,0,0,.08);transition:background .2s,outline-color .2s;outline:4px solid transparent;}
.mh-box h4{margin:0 0 8px;font-size:17px;line-height:1.6;}
.mh-box.mh-over{outline-color:#2ecc71;background:#dcfce7;}
.mh-row{display:flex;gap:8px;align-items:flex-end;justify-content:center;flex-wrap:wrap;min-height:70px;}
.mh-cap{margin-top:8px;font-size:22px;font-weight:900;line-height:1.7;}
.mh-cap small{font-size:16px;font-weight:700;}
.mh-cap .cr{font-size:30px;}
.mh-frame{display:inline-flex;gap:4px;padding:6px;border-radius:10px;background:#eef2f6;border:3px solid #cbd5e1;transition:all .4s;align-items:flex-end;}
.mh-frame.mh-fr-sq{display:inline-grid;grid-template-columns:repeat(5,14px);padding:10px;}
.mh-frame.mh-full{background:#ffe066;border-color:#f59f00;animation:mhPop .6s;}
.mh-frame.mh-over{border-color:#2ecc71;background:#dcfce7;transform:scale(1.04);}
.mh-slot{border-radius:4px;border:2px dashed #b9c4d0;box-sizing:border-box;}
.mh-slot-bar{width:16px;height:110px;}
.mh-slot-sq{width:14px;height:14px;border-radius:3px;}
.mh-slot-cell{height:70px;border-radius:6px;}
.mh-slot.mh-q{border-color:#2ecc71;animation:mhBlink 1s infinite;}
.mh-slot.mh-ghost{border-color:#ffb37a;opacity:.6;}
.mh-stk{width:16px;height:110px;border-radius:4px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.15);flex:none;}
.mh-fcell{width:52px;height:70px;border-radius:6px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.15);flex:none;}
.mh-board{width:118px;height:118px;border-radius:8px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;
  font-size:34px;font-weight:900;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.2);flex:none;}
.mh-board.mh-sm{width:64px;height:64px;font-size:22px;}
.mh-B{background:#54a0ff;} .mh-O{background:#ff9f43;} .mh-G{background:#2ecc71;} .mh-Y{background:#ffe066;}
.mh-board.mh-B{background:repeating-linear-gradient(90deg,#54a0ff 0 10px,#3d8be6 10px 12px);}
.mh-board.mh-O{background:repeating-linear-gradient(90deg,#ff9f43 0 10px,#e88a2c 10px 12px);}
.mh-board.mh-G{background:repeating-linear-gradient(90deg,#2ecc71 0 10px,#25b263 10px 12px);}
.mh-board.mh-Y{background:repeating-linear-gradient(90deg,#ffe066 0 10px,#fcc419 10px 12px);color:#8a5a00;text-shadow:none;}
.mh-dots{display:grid;grid-template-columns:repeat(5,14px);gap:4px;}
.mh-dot{width:14px;height:14px;border-radius:3px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.15);}
.mh-tap{cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;animation:mhWiggle 1.2s infinite;}
.mh-tap:hover{filter:brightness(1.05);}
.mh-bundle{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 5px 2px;border:3px dashed #2ecc71;border-radius:10px;background:#f0fff4;box-sizing:border-box;}
.mh-bundle .mh-in{display:flex;gap:4px;align-items:flex-end;flex-wrap:wrap;justify-content:center;pointer-events:none;}
.mh-bundle b{color:#16a34a;font-size:17px;pointer-events:none;line-height:1.6;}
.mh-drag{position:fixed;z-index:9999;pointer-events:none;margin:0;animation:none;transform:rotate(8deg) scale(1.15);box-shadow:0 10px 18px rgba(0,0,0,.25);}
.mh-back{transition:all .25s;}
.mh-zone{border:3px dashed #ffb37a;border-radius:12px;min-height:80px;min-width:150px;display:flex;align-items:flex-end;justify-content:center;
  gap:4px;flex-wrap:wrap;padding:8px;box-sizing:border-box;color:#e8590c;font-weight:800;font-size:18px;align-self:stretch;}
.mh-zone.mh-q{animation:mhBlink 1s infinite;align-items:center;}
.mh-row .mh-zone:only-child{flex:1;}
.mh-gone{opacity:.35;filter:grayscale(.5);}
.mh-done{font-size:20px;font-weight:800;color:#16a34a;align-self:center;}
.mh-none{font-size:20px;font-weight:800;color:#94a3b8;align-self:center;}
.mh-split{animation:mhSplit .6s forwards;}
.mh-chs{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:14px;}
.mh-ch{border:0;background:#fff;border-radius:16px;min-width:84px;padding:10px 14px;font-size:24px;font-weight:800;line-height:1.5;box-shadow:0 4px 0 #b9c8d6;cursor:pointer;color:#1d2b3a;}
.mh-ch.mh-no{background:#ffe1e1;animation:mhShake .35s;}
.mh-ch.mh-yes{background:#d3f9d8;}
.mh-pop{animation:mhPop .5s;}
.mh-conf{position:absolute;font-size:24px;animation:mhFall 1.4s ease-in forwards;pointer-events:none;z-index:5;}
.mh-tip{background:#fff6cc;border-radius:14px;padding:12px;font-size:17px;margin-top:12px;line-height:1.9;}
.mh-tip small{font-size:15px;}
.mh-center{text-align:center;margin-top:12px;}
.mh-btn{border:0;border-radius:14px;padding:12px 20px;font-size:18px;font-weight:800;color:#fff;background:#2ecc71;box-shadow:0 4px 0 #1f9d55;cursor:pointer;}
.mh-btn:active{transform:translateY(3px);}
@keyframes mhWiggle{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes mhBlink{50%{opacity:.35}}
@keyframes mhShake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes mhPop{0%{transform:scale(.6)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
@keyframes mhSplit{0%{transform:scale(1)}40%{transform:scale(1.12) rotate(-4deg);filter:brightness(1.4)}100%{transform:scale(.7);opacity:.15}}
@keyframes mhFall{from{transform:translateY(-30px) rotate(0)}to{transform:translateY(620px) rotate(360deg);opacity:0}}
@media (max-width:520px){
  .mh-root{padding:10px;border-radius:16px;}
  .mh-eq{font-size:22px;padding:6px 10px;}
  .mh-bub{font-size:16px;}
  .mh-who{font-size:32px;}
  .mh-bench{gap:10px;}
  .mh-box{min-width:0;width:100%;padding:10px;}
  .mh-big{min-width:0;width:100%;}
  .mh-board{width:96px;height:96px;font-size:30px;}
  .mh-board.mh-sm{width:56px;height:56px;font-size:20px;}
  .mh-ch{font-size:22px;min-width:72px;}
}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

const MINUS = '−';
const H = (v, c) => MathCore.html(v, c);
const isD = v => v.t === 'd';
// 받침 (MathCore 와 같은 규칙: 마지막으로 읽는 숫자)
const bat = v => { const s = !isD(v) && v.n ? String(v.n) : MathCore.text(v); return '013678'.includes(s[s.length - 1]); };
const jo = (v, a, b) => bat(v) ? a : b;
const snd = (f, d, ty) => { if (typeof tone === 'function') tone(f, d || .15, ty || 'triangle'); };
const good = () => { if (typeof sfxGood === 'function') sfxGood(); };
const win = () => { if (typeof sfxWin === 'function') sfxWin(); };
// 말풍선 HTML → 읽어 줄 글자 (분수는 "5분의 2")
function plain(h){
  return String(h)
    .replace(/<span class="mf"><span>(\d+)<\/span><span class="md">(\d+)<\/span><\/span>/g, ' $2분의 $1')
    .replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/−/g, '빼기').replace(/\+/g, '더하기')
    .replace(/\s+/g, ' ').trim();
}
const say = h => { try { if (window.MathGame && typeof MathGame.say === 'function') MathGame.say(plain(h)); } catch(e){} };

// ── 블록 개수 ── 소수 {b 판, t 막대, s 작은 칸}, 분수 {b 판, c 칸}
const pcs = v => isD(v) ? {b:Math.floor(v.h / 100), t:Math.floor(v.h / 10) % 10, s:v.h % 10} : {b:v.w, c:v.n};
const KEYS = ['b', 't', 's', 'c'];
function minus(x, y){ const o = {}; KEYS.forEach(k => { if (k in x) o[k] = x[k] - (y[k] || 0); }); return o; }
// 빼려면 쪼개야 하는 순서. 상태 배열을 돌려주고, 각 상태의 from 은 다음에 쪼개질 블록 ('b' 판, 't' 막대)
function splits(pc, nd, d){
  let c = Object.assign({}, pc); const out = [c];
  const go = (from, nx) => { c.from = from; c = nx; out.push(c); };
  if (d){ if (c.c < nd.c && c.b > 0) go('b', {b:c.b - 1, c:c.c + d}); return out; }
  if (c.s < nd.s && c.t === 0 && c.b > 0) go('b', {b:c.b - 1, t:c.t + 10, s:c.s});
  if (c.s < nd.s && c.t > 0) go('t', {b:c.b, t:c.t - 1, s:c.s + 10});
  if (c.t < nd.t && c.b > 0) go('b', {b:c.b - 1, t:c.t + 10, s:c.s});
  return out;
}

// ── 블록 그리기 ──
let CW = 52;   // 분수 칸 너비 (분모가 크면 좁게)
const rep = (n, f) => { let s = ''; for (let k = 0; k < n; k++) s += f(k); return s; };
const cls = (...a) => a.filter(Boolean).join(' ');
const boardsH = (n, col, o = {}) => rep(n, k => `<div class="${cls('mh-board', 'mh-' + col, o.sm && 'mh-sm', o.pop && 'mh-pop', o.split && k === n - 1 && 'mh-split', o.gone && 'mh-gone')}">1</div>`);
const barsH = (n, col, o = {}) => rep(n, k => `<div class="${cls('mh-stk', 'mh-' + col, o.pop && 'mh-pop', o.split && k === n - 1 && 'mh-split', o.gone && 'mh-gone')}"></div>`);
const sqH = (n, col, o = {}) => n > 0 ? `<div class="${cls('mh-dots', o.pop && 'mh-pop', o.gone && 'mh-gone')}">${rep(n, () => `<div class="mh-dot mh-${col}"></div>`)}</div>` : '';
const cellsH = (n, col, o = {}) => rep(n, () => `<div class="${cls('mh-fcell', 'mh-' + col, o.pop && 'mh-pop', o.gone && 'mh-gone')}" style="width:${CW}px"></div>`);
// 낱개 블록. o.split: 'b'|'t' 쪼개지는 블록, o.popT/popS: 방금 생긴 막대(분수는 칸)/작은 칸
function loose(pc, col, o = {}){
  const s = boardsH(pc.b, col, {sm:o.sm || pc.b >= 3, pop:o.pop, split:o.split === 'b', gone:o.gone});
  if ('c' in pc) return s + cellsH(pc.c, col, {pop:o.pop || o.popT, gone:o.gone});
  return s + barsH(pc.t, col, {pop:o.pop || o.popT, split:o.split === 't', gone:o.gone}) + sqH(pc.s, col, {pop:o.pop || o.popS, gone:o.gone});
}
// 틀: kind 'bar'(막대 10칸) | 'sq'(작은 칸 10칸) | 'cell'(분모 칸), parts [[개수, 색, pop]]
function frameH(kind, parts, total, o = {}){
  const one = (col, pop) => kind === 'bar' ? `<div class="${cls('mh-stk', 'mh-' + col, pop && 'mh-pop')}"></div>`
    : kind === 'sq' ? `<div class="${cls('mh-dot', 'mh-' + col, pop && 'mh-pop')}"></div>`
    : `<div class="${cls('mh-fcell', 'mh-' + col, pop && 'mh-pop')}" style="width:${CW}px"></div>`;
  const slot = c => `<div class="${cls('mh-slot', 'mh-slot-' + kind, c)}"${kind === 'cell' ? ` style="width:${CW}px"` : ''}></div>`;
  let s = '', used = 0;
  parts.forEach(p => { if (p && p[0] > 0){ s += rep(p[0], () => one(p[1], p[2])); used += p[0]; } });
  s += rep(o.ghost || 0, () => slot('mh-ghost')); used += o.ghost || 0;
  s += rep(total - used, () => slot(o.blink && 'mh-q'));
  return `<div class="${cls('mh-frame', 'mh-fr-' + kind, o.full && 'mh-full')}"${o.drop ? ' data-drop' : ''}>${s}</div>`;
}
const bundleH = (inner, label, tap) => `<div class="${cls('mh-bundle', tap && 'mh-tap')}"><div class="mh-in">${inner}</div>${label ? `<b>${label}</b>` : ''}</div>`;
const boxH = (head, body, cap, o = {}) => `<div class="mh-box"${o.drop ? ' data-drop' : ''}><h4>${head}</h4><div class="mh-row">${body}</div>${o.extra || ''}${cap ? `<div class="mh-cap">${cap}</div>` : ''}</div>`;
// "판 2장 + 틀" 같은 머리말
function desc(pc, unit, fd){
  const a = [];
  if (pc.b) a.push(`판 ${pc.b}장`);
  if (!fd && unit === 1 && pc.t) a.push(`막대 ${pc.t}개`);
  a.push('틀');
  return a.join(' + ');
}

// container 를 비우고 힌트 화면 뿌리를 붙여요
let ghostEl = null;
function mount(container){
  if (ghostEl){ ghostEl.remove(); ghostEl = null; }
  container.innerHTML = '';
  const root = document.createElement('div'); root.className = 'mh-root';
  container.appendChild(root);
  return root;
}
function confetti(root){
  for (let k = 0; k < 18; k++){
    const s = document.createElement('div'); s.className = 'mh-conf';
    s.textContent = ['🎉', '⭐', '✨', '💯'][k % 4];
    s.style.left = Math.random() * 95 + '%'; s.style.top = '0'; s.style.animationDelay = Math.random() * .4 + 's';
    root.appendChild(s); setTimeout(() => s.remove(), 2000);
  }
}

// ── 틀렸을 때: 힌트 고르기 ──
function ask(container, o = {}){
  const root = mount(container);
  const w = o.wrong ? `<b>${H(o.wrong)}</b>${jo(o.wrong,'은','는')} ` : '그건 ';
  root.innerHTML = `<div class="mh-owl"><div class="mh-who">🦉</div><div class="mh-bub">앗, 아까웠어! ${w}정답이 아니야. 어떻게 할래?</div></div>
    <div class="mh-pick">
      <button type="button" class="mh-big mh-h">🦉 힌트 보고 풀기<small>부엉이랑 같이 블록으로!</small></button>
      <button type="button" class="mh-big mh-s">💪 혼자 다시 풀기<small>힌트 없이 한 번 더</small></button>
    </div>`;
  say(root.querySelector('.mh-bub').innerHTML);
  let done = false;
  const pick = (f, hz) => () => { if (done) return; done = true; snd(hz); if (typeof f === 'function') f(); };
  root.querySelector('.mh-h').onclick = pick(o.onHint, 700);
  root.querySelector('.mh-s').onclick = pick(o.onRetry, 600);
}

// ── 비밀 규칙 한 줄 ──
function tip(pl, p){
  const f = !isD(p.a), d = f ? p.a.d : 0;
  const W = pl.whole, Lc = W ? pl.afterWhole : pl.L, Rr = W ? MathCore.sub(pl.R, W) : pl.R;
  const w0 = W ? `⓪ 자연수 먼저: ${H(pl.L)} ${MINUS} ${H(W)} = ${H(Lc)} ` : '';
  const brk = f ? `1 = ${d}칸` : '판 1장 = 막대 10개, 막대 1개 = 작은 칸 10개';
  const head = `💡 <b>비밀 규칙 · ${pl.name}</b>: `;
  switch (pl.kind){
    case 'make': {
      const r = f ? `${d}칸이 꽉 차면 1!` : pl.unit === 10 ? '막대 10개가 꽉 차면 판 1장(1)!' : '작은 칸 10개가 꽉 차면 막대 1개(0.1)!';
      return head + r + `<br>① ${H(pl.L)} → ${H(pl.made)}까지 ${H(pl.need)}${jo(pl.need, '이', '가')} 모자라요 ② ${H(pl.R)}에서 ${H(pl.need)}${jo(pl.need, '을', '를')} 떼어 와요 (${H(pl.R)} = ${H(pl.need)} + ${H(pl.rest)}) ③ ${H(pl.made)} + ${H(pl.rest)} = ${H(p.ans)}`;
    }
    case 'down':
      return head + `딱 떨어지는 수까지 먼저 내려가요!<br>${w0}① ${H(Lc)} ${MINUS} ${H(pl.need)} = ${H(pl.made)} ② ${H(Rr)} = ${H(pl.need)} + ${H(pl.rest)} ③ ${H(pl.made)} ${MINUS} ${H(pl.rest)} = ${H(p.ans)}<br><small>모자라면 쪼개요: ${brk}</small>`;
    case 'break':
      return head + `모자라면 큰 블록을 쪼개요! (${brk})<br>${w0}① ${H(Lc)} ${MINUS} ${H(Rr)} = ${H(p.ans)}`;
    case 'gather':
      return head + (f ? '분모는 그대로, 분자끼리 더해요!' : '같은 블록끼리 모아서 세요! 막대는 막대끼리, 작은 칸은 작은 칸끼리!') + `<br>${H(pl.L)} + ${H(pl.R)} = ${H(p.ans)}`;
    default:
      return head + (f ? '분모는 그대로, 분자끼리 빼요!' : '같은 블록끼리 빼요! 막대는 막대끼리, 작은 칸은 작은 칸끼리!') + `<br>${H(pl.L)} ${MINUS} ${H(pl.R)} = ${H(p.ans)}`;
  }
}

// ── 아이가 고른 오답이 왜 틀렸나 (MathCore 오답 규칙과 같은 식) ──
function why(p, w){
  const M = MathCore, {a, b, op, ans} = p, is = x => !!x && M.same(w, x);
  // 받아올림/받아내림이 있는 문제에서만 그 실수라고 말해요 (0.3 + 0.4 의 0.6 은 그냥 "0.1 작아요")
  const kind = M.hintPlan(p).kind, carry = kind === 'make', borrow = kind === 'down' || kind === 'break';
  const pre = `아까 고른 ${H(w)}${jo(w, '은', '는')} `;
  const Dh = h => ({t:'d', h});
  if (isD(a)){
    const dg = (h, k) => Math.floor(h / Math.pow(10, k)) % 10;
    const pl = v => v.h % 10 ? 2 : v.h % 100 ? 1 : 0;
    if (op === '+'){
      const pa = pl(a), pb = pl(b);
      if (pa !== pb){
        const [lo, sh] = pa > pb ? [a, b] : [b, a];
        if (is(Dh(lo.h + sh.h / Math.pow(10, Math.abs(pa - pb))))) return pre + '소수점 자리를 안 맞추고 끝자리끼리 더한 거예요. 0.1은 0.1끼리, 0.01은 0.01끼리 줄을 맞춰 더해요!';
      }
      if (Math.max(pa, pb) === 1){
        const ta = dg(a.h, 1), tb = dg(b.h, 1), t = ta + tb;
        if (t >= 10 && is(Dh((Math.floor(a.h / 100) + Math.floor(b.h / 100)) * 100 + t))){
          const v = Dh(t * 10), vb = Dh(tb * 10);
          return pre + `${H(Dh(ta * 10))} + ${H(vb)}${jo(vb, '을', '를')} "0.${t}"로 쓴 거예요. 막대 ${ta}개 + ${tb}개 = ${t}개 = 판 1장${t > 10 ? ` + 막대 ${t - 10}개` : ''}, 즉 ${H(v)}${jo(v, '이에요', '예요')}!`;
        }
      }
      if (carry && (is(Dh(ans.h - 100)) || is(Dh(ans.h - 10)))) return pre + '받아올림을 빠뜨린 거예요. 블록 10개가 꽉 차면 윗자리 블록 1개로 올려 줘요!';
    } else {
      let h = 0;
      for (let k = 0, m = Math.max(a.h, b.h); Math.pow(10, k) <= m; k++) h += Math.abs(dg(a.h, k) - dg(b.h, k)) * Math.pow(10, k);
      if (is(Dh(h))) return pre + '자리마다 큰 숫자에서 작은 숫자를 뺀 거예요. 위 숫자가 모자라면 윗자리 블록을 쪼개 와야 해요!';
      if (borrow && (is(Dh(ans.h + 10)) || is(Dh(ans.h + 100)))) return pre + '블록을 쪼개 오고 나서 윗자리를 하나 줄이는 걸 잊은 거예요!';
    }
  } else {
    const d = a.d, sh = k => M.frac(0, ans.w * d + ans.n + k, d);
    if (op === '+'){
      if (is(M.frac(a.w + b.w, a.n + b.n, 2 * d))) return pre + '분모끼리도 더한 거예요. 분모는 "몇 칸으로 나눴나"라서 그대로예요!';
      if (carry && is(sh(-d))) return pre + `${d}칸이 꽉 차서 생긴 1을 자연수로 올리는 걸 빠뜨린 거예요!`;
      if (is(sh(-1))) return pre + '조각을 하나 덜 센 거예요. 한 칸씩 다시 세어 봐요!';
    } else {
      if (a.w >= b.w && is(M.frac(a.w - b.w, Math.abs(a.n - b.n), d))) return pre + `분자를 거꾸로(큰 수에서 작은 수) 뺀 거예요. 분자가 모자라면 1을 ${d}칸으로 쪼개 와요!`;
      if (borrow && is(sh(d))) return pre + '1을 쪼개 왔으면 자연수를 하나 줄여야 해요!';
    }
  }
  let diff = null;
  try { if (w.t === ans.t && (isD(w) || w.d === ans.d)) diff = M.sub(w, ans); } catch(e){}
  if (diff){
    const big = (isD(diff) ? diff.h : diff.w * diff.d + diff.n) > 0, dv = big ? diff : M.sub(ans, w);
    return pre + `정답보다 ${H(dv)}만큼 ${big ? '커요' : '작아요'}. 블록으로 하나씩 세어 보면 알 수 있어요!`;
  }
  return pre + '정답과 달라요. 블록으로 하나씩 세어 보면 알 수 있어요!';
}

// ── 힌트 진행 ──
function run(container, p, wrongPick, onDone){
  const plan = MathCore.hintPlan(p), steps = plan.steps, kind = plan.kind;
  const fd = !isD(p.a), d = fd ? p.a.d : 0;
  CW = !fd || d <= 5 ? 52 : Math.max(16, Math.floor(260 / d) - 4);
  const root = mount(container);
  root.innerHTML = `<div class="mh-eq"></div><div class="mh-steps"></div>
    <div class="mh-owl"><div class="mh-who">🦉</div><div class="mh-bub"></div></div>
    <div class="mh-bench"></div><div class="mh-chs"></div><div class="mh-end"></div>`;
  const q = s => root.querySelector(s);
  const E = {eq:q('.mh-eq'), dots:q('.mh-steps'), bub:q('.mh-bub'), bench:q('.mh-bench'), chs:q('.mh-chs'), end:q('.mh-end')};
  const alive = () => root.isConnected;

  // 단계 역할: whole(자연수 먼저) need drag rest made final
  const iDrag = steps.findIndex(s => s.drag);
  const roles = steps.map((s, k) => s.drag ? 'drag' : k === steps.length - 1 ? 'final'
    : plan.whole && k === 0 ? 'whole' : k === iDrag - 1 ? 'need' : k === iDrag + 1 ? 'rest' : k === iDrag + 2 ? 'made' : 'ask');
  const iRest = roles.indexOf('rest'), iMade = roles.indexOf('made');
  const isSub = kind === 'take' || kind === 'down' || kind === 'break';
  const W = plan.whole;
  const Lc = W ? plan.afterWhole : plan.L, Rr = W ? MathCore.sub(plan.R, W) : plan.R;
  const pN = pcs(plan.need);
  let i = 0, busy = false, sk = 0, popNow = false, backTimer = null, backGhost = null;

  // 지금 단계에서 쪼개기 장면이 있나 (break 의 끌기, down 의 마지막)
  const splitSeq = () => kind === 'break' && roles[i] === 'drag' ? splits(pcs(Lc), pN, d)
    : kind === 'down' && roles[i] === 'final' ? splits(pcs(plan.made), pcs(plan.rest), d) : null;

  function draw(){
    const r = roles[i] || 'end', moved = i > iDrag;
    const wDone = !W || i > 0, L0 = wDone ? Lc : plan.L, R0 = wDone ? Rr : plan.R;
    const madeDone = iMade >= 0 && i > iMade, restDone = iRest >= 0 && i > iRest;
    const dragNow = r === 'drag' && !busy;
    const jm = popNow && i === iDrag + 1;               // 방금 옮김
    let left, right;
    if (kind === 'make'){
      const pL = pcs(plan.L), u = plan.unit, fk = fd ? 'cell' : u === 10 ? 'bar' : 'sq';
      const pick = pc => fd ? pc.c : u === 10 ? pc.t : pc.s;
      let body;
      if (madeDone){
        const yp = popNow && i === iMade + 1, sm = pL.b + 1 >= 3;
        body = fd || u === 10 ? boardsH(pL.b, 'B', {sm}) + boardsH(1, 'Y', {sm, pop:yp}) + (fd ? '' : sqH(pL.s, 'B'))
                              : boardsH(pL.b, 'B', {sm:pL.b >= 3}) + barsH(pL.t, 'B') + barsH(1, 'Y', {pop:yp});
        left = boxH(`<span class="cb">${H(plan.L)}</span> + <span class="cg">${H(plan.need)}</span>`, body, `= <span class="hl">${H(plan.made)}</span>`);
      } else {
        const fr = frameH(fk, [[pick(pL), 'B'], moved && [pick(pN), 'G', jm]], fd ? d : 10, {blink:!moved, full:moved, drop:true});
        body = boardsH(pL.b, 'B', {sm:pL.b >= 3}) + (!fd && u === 1 ? barsH(pL.t, 'B') : '') + fr + (!fd && u === 10 ? sqH(pL.s, 'B') : '');
        left = boxH(`<span class="cb">${desc(pL, u, fd)}</span>`, body,
          moved ? `<span class="cr${jm ? ' mh-pop' : ''}" style="display:inline-block">${fd || u === 10 ? '1' : '0.1'}</span>` : `<span class="cb">${H(plan.L)}</span>`);
      }
      const pR = pcs(plan.R);
      if (!moved){
        const body2 = r === 'drag' ? loose(minus(pR, pN), 'O') + bundleH(loose(pN, 'O', {sm:true}), H(plan.need), dragNow) : loose(pR, 'O');
        right = boxH(`<span class="co">${H(plan.R)}</span>`, body2, r === 'drag' ? `<small>✋ ${H(plan.need)} 묶음을 왼쪽 빈칸으로!</small>` : `= ${H(plan.R)}`);
      } else {
        right = boxH(`<span class="co">${H(plan.R)}</span>에서 남은 것`, loose(pcs(plan.rest), 'O', {pop:jm}) || '<span class="mh-none">0</span>',
          restDone ? `= ${H(plan.rest)}` : '?');
      }
    } else if (kind === 'gather'){
      const pL = pcs(plan.L), pR = pcs(plan.R), u = plan.unit, fk = fd ? 'cell' : u === 10 ? 'bar' : 'sq';
      const pick = pc => fd ? pc.c : u === 10 ? pc.t : pc.s;
      const fr = frameH(fk, [[pick(pL), 'B'], moved && [pick(pR), 'G', jm]], fd ? d : 10, {drop:true});
      const sm = pL.b + (moved ? pR.b : 0) >= 3;
      const body = boardsH(pL.b, 'B', {sm}) + (moved ? boardsH(pR.b, 'G', {sm, pop:jm}) : '')
        + (!fd && u === 1 ? barsH(pL.t, 'B') + (moved ? barsH(pR.t, 'G', {pop:jm}) : '') : '') + fr
        + (!fd && u === 10 ? sqH(pL.s, 'B') + (moved ? sqH(pR.s, 'G', {pop:jm}) : '') : '');
      left = boxH(`<span class="cb">${desc(pL, u, fd)}</span>`, body, moved ? '= ?' : `= <span class="cb">${H(plan.L)}</span>`);
      right = !moved
        ? boxH(`<span class="co">${H(plan.R)}</span>`, bundleH(loose(pR, 'O', {sm:true}), H(plan.R), dragNow), dragNow ? `<small>✋ ${H(plan.R)} 묶음을 왼쪽 틀로!</small>` : '')
        : boxH(`<span class="co">${H(plan.R)}</span>`, '<div class="mh-done">✓ 다 옮겼어!</div>', ' ');
    } else {
      // 빼기 (take / down / break): 왼쪽에서 묶음을 끌어내 오른쪽 "빼는 곳"으로
      let pc = pcs(L0), bun = false, mark = null, prev = null;
      const stage = seq => { const k = Math.min(sk, seq.length - 1); pc = seq[k]; if (k < seq.length - 1) mark = pc.from; if (k > 0) prev = seq[k - 1].from; return k === seq.length - 1; };
      if (kind === 'take'){ if (moved) pc = minus(pc, pN); else bun = true; }
      else if (kind === 'break' && wDone){
        const seq = splits(pcs(Lc), pN, d);
        if (moved) pc = minus(seq[seq.length - 1], pN);
        else if (r === 'drag') bun = stage(seq);
      } else if (kind === 'down'){
        if (moved){
          pc = pcs(plan.made);
          if (r === 'final') stage(splits(pc, pcs(plan.rest), d));
          else if (r === 'end'){ const seq = splits(pc, pcs(plan.rest), d); pc = minus(seq[seq.length - 1], pcs(plan.rest)); }
        } else if (r === 'drag') bun = true;
      }
      const plain = bun ? minus(pc, pN) : pc;
      const wp = !!(popNow && W && i === 1 && !mark);    // 자연수를 막 뺐을 때 (쪼개기 장면과는 안 겹치게)
      const popT = prev === 'b', popS = prev === 't';
      let body;
      if (fd){
        const ghost = bun ? pN.c : 0;
        const showF = plain.c > 0 || ghost > 0 || (moved && pN.c > 0) || prev === 'b';
        body = boardsH(plain.b, 'B', {sm:plain.b >= 3, split:mark === 'b', pop:wp})
          + (showF ? frameH('cell', [[plain.c, 'B', popT || wp]], Math.max(d, plain.c + ghost), {ghost}) : '');
      } else body = loose(plain, 'B', {split:mark, popT, popS, pop:wp});
      if (bun) body += bundleH(loose(pN, 'B', {sm:true}), H(plan.need), dragNow);
      const lcap = !moved ? '' : kind === 'down' && madeDone && r !== 'end' ? `= <span class="cr">${H(plan.made)}</span>` : '= ?';
      left = boxH(moved ? `<span class="cb">${H(L0)}</span>에서 남은 것` : `<span class="cb">${H(L0)}</span>`, body || '<span class="mh-none">0</span>',
        mark ? '<small>✂️ 쪼개는 중…</small>' : lcap);
      const hint = '<small>✋ 묶음을 여기로 끌어내!</small>';
      if (kind === 'down'){
        const zone = dragNow ? '<div class="mh-zone mh-q" style="margin-top:8px">🗑️ 빼는 곳</div>' : '';
        right = boxH(moved ? `빼는 수 <span class="co">${H(R0)}</span>에서 남은 것` : `빼는 수 <span class="co">${H(R0)}</span>`,
          loose(moved ? pcs(plan.rest) : pcs(R0), 'O', {pop:jm || wp}) || '<span class="mh-none">0</span>',
          !moved ? (dragNow ? hint : `= ${H(R0)}`) : restDone ? `= ${H(plan.rest)}` : '?', {drop:true, extra:zone});
      } else {
        const zone = `<div class="mh-zone${dragNow ? ' mh-q' : ''}">${moved ? loose(pN, 'B', {sm:true, gone:true}) : '🗑️ 빼는 곳'}</div>`;
        right = boxH(`빼는 수 <span class="co">${H(R0)}</span>`, zone, moved ? '✓ 빼냈어!' : dragNow ? hint : ' ', {drop:true});
      }
    }
    E.bench.innerHTML = left + right;
    const tap = E.bench.querySelector('.mh-tap');
    if (tap) tap.onpointerdown = grab;
  }

  function dots(){ E.dots.innerHTML = steps.map((_, k) => `<i class="${k < i ? 'on' : k === i ? 'now' : ''}"></i>`).join(''); }

  // 단계를 보여주고, 쪼개기 장면이 있으면 0.6초씩 먼저 보여줘요
  function show(){
    const s = steps[i];
    E.eq.innerHTML = `<span class="mh-eqin">${s.eq}</span>`; dots();
    E.bub.innerHTML = s.say; say(s.say); E.chs.innerHTML = '';
    const seq = splitSeq();
    if (seq && seq.length > 1){
      busy = true; draw(); popNow = false;
      const tick = () => {
        if (!alive()) return;
        sk++;
        if (sk >= seq.length - 1){ busy = false; draw(); choices(); snd(520, .12); }
        else { draw(); snd(440, .1); setTimeout(tick, 650); }
      };
      setTimeout(tick, 650);
    } else { busy = false; draw(); choices(); }
    popNow = false;
  }
  function next(){
    i++; sk = 0; popNow = true;
    if (iMade >= 0 && i === iMade + 1) confetti(root);
    if (i >= steps.length) return finish();
    show();
  }
  function choices(){
    const s = steps[i]; E.chs.innerHTML = '';
    if (!s.choices) return;
    let done = false;
    s.choices.forEach(v => {
      const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'mh-ch'; bt.innerHTML = H(v);
      bt.onclick = () => {
        if (done || !alive()) return;
        if (MathCore.same(v, s.answer)){
          done = true; bt.classList.add('mh-yes'); good();
          setTimeout(() => { if (alive()) next(); }, 300);
        } else {
          bt.classList.remove('mh-no'); void bt.offsetWidth; bt.classList.add('mh-no'); snd(200, .2, 'sine');
          E.bub.innerHTML = s.say + `<br><small class="mh-oops">${nudge(roles[i])}</small>`;
        }
      };
      E.chs.appendChild(bt);
    });
  }
  function nudge(r){
    if (r === 'whole') return `🔎 판(자연수) ${H(W)}만 먼저 빼 봐!`;
    if (r === 'need') return kind === 'make' ? '🔎 틀의 빈칸을 세어 봐!' : `🔎 ${H(plan.made)}${jo(plan.made, '이', '가')} 되려면 무엇을 빼야 할지 블록을 세어 봐!`;
    if (r === 'rest') return '🔎 오른쪽 상자에 남은 블록을 세어 봐!';
    if (r === 'made') return kind === 'make' ? (fd || plan.unit === 10 ? '🔎 판을 모두 세어 봐!' : '🔎 막대를 모두 세어 봐!') : '🔎 왼쪽 상자에 남은 블록을 세어 봐!';
    return '🔎 블록을 하나씩 세어 봐!';
  }
  function finish(){
    busy = false; draw(); popNow = false; dots(); E.chs.innerHTML = '';
    E.eq.innerHTML = `<span class="mh-eqin">${H(p.a)} ${p.op === '+' ? '+' : MINUS} ${H(p.b)} = <span class="hl mh-pop" style="display:inline-block">${H(p.ans)}</span> 🎉</span>`;
    E.bub.innerHTML = '짜잔! 스스로 풀었어! 👏 이제 원래 문제를 다시 풀어 보자';
    say(E.bub.innerHTML);
    E.end.innerHTML = `<div class="mh-tip">${tip(plan, p)}${wrongPick ? `<br><small class="cr">${why(p, wrongPick)}</small>` : ''}</div>
      <div class="mh-center"><button type="button" class="mh-btn">이제 알겠어요! 문제 다시 풀기 →</button></div>`;
    confetti(root); win();
    let done = false;
    E.end.querySelector('.mh-btn').onclick = () => { if (done) return; done = true; snd(700); if (typeof onDone === 'function') onDone(); };
  }

  // 끌어서 놓기 (시안 v8 grab): 복제본이 손가락을 따라오고, 놓는 곳 ±20px 안에서 떼면 성공
  function grab(e){
    if (busy || roles[i] !== 'drag' || !alive() || ghostEl) return;
    if (e.button > 0) return;
    // 놓쳐서 제자리로 돌아가는 중에 다시 잡으면, 돌아가던 복제본을 지금 지워요 (투명도 되돌리기와 안 겹치게)
    if (backTimer){ clearTimeout(backTimer); backTimer = null; if (backGhost) backGhost.remove(); backGhost = null; }
    e.preventDefault();
    const src = e.currentTarget, r = src.getBoundingClientRect(), target = root.querySelector('[data-drop]');
    if (!target) return;
    const ghost = src.cloneNode(true); ghost.classList.remove('mh-tap'); ghost.classList.add('mh-drag');
    ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px';
    const dx = e.clientX - r.left, dy = e.clientY - r.top, id = e.pointerId;
    const place = (x, y) => { ghost.style.left = (x - dx) + 'px'; ghost.style.top = (y - dy) + 'px'; };
    place(e.clientX, e.clientY); document.body.appendChild(ghost); ghostEl = ghost;
    src.style.opacity = '.25'; snd(440, .1);
    const over = (x, y) => { const f = target.getBoundingClientRect(); return x > f.left - 20 && x < f.right + 20 && y > f.top - 20 && y < f.bottom + 20; };
    const mv = ev => { if (ev.pointerId !== id) return; if (ev.cancelable) ev.preventDefault(); place(ev.clientX, ev.clientY); target.classList.toggle('mh-over', over(ev.clientX, ev.clientY)); };
    const end = (ev, cancel) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cc);
      if (ghostEl === ghost) ghostEl = null;
      if (!alive()){ ghost.remove(); return; }
      target.classList.remove('mh-over');
      if (!cancel && over(ev.clientX, ev.clientY)){
        ghost.remove(); snd(700, .08, 'square'); setTimeout(() => snd(880, .15), 120);
        next();
      } else {
        ghost.classList.add('mh-back'); place(r.left + dx, r.top + dy);
        backGhost = ghost;
        backTimer = setTimeout(() => { backTimer = null; backGhost = null; ghost.remove(); src.style.opacity = ''; }, 260);
        E.bub.innerHTML = steps[i].say + `<br><small class="mh-oops">${isSub ? '🤏 빼는 곳 위에서 손을 떼 봐!' : '🤏 빈칸 위에서 손을 떼 봐!'}</small>`;
        snd(220, .15, 'sine');
      }
    };
    const up = ev => end(ev, false), cc = ev => end(ev, true);
    window.addEventListener('pointermove', mv, {passive:false});
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', cc);
  }

  show();
}

window.MathHint = {ask, run, _t:{why, tip, splits, plain}};
})();
