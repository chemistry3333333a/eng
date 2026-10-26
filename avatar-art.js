/* =====================================================================
   워드 아일랜드 · 캐릭터 그림 (말랑 SVG)
   - SVG 문자열만 만들어요. DOM, S 를 건드리지 않아요
   - 좌표: 머리 중심 (60,58) r40, 몸 (60,112). 시안: docs/superpowers/specs/2026-10-26-mallang-character-mockup.html
   - 클래스·애니메이션 이름은 모두 av- 로 시작해요 (boss.js 의 .tw 등과 안 겹치게)
   ===================================================================== */
(function(){
const D = '#3d2a2e';                       // 눈·입 색
const VB = '-20 -24 160 180';              // 캐릭터 그림 상자 (배경 타일 크기와 같아요)
let uid = 0;                               // clipPath id 가 겹치지 않게
const MOODS = ['base','smile','wink','wow','star','love','sleep','tongue','teary'];

/* ---------- 작은 도형 ---------- */
const heart = (x, y, s, f) => `<path d="M${x} ${y+s}C${x-s*1.7} ${y-s*.1} ${x-s*.7} ${y-s*1.4} ${x} ${y-s*.45}C${x+s*.7} ${y-s*1.4} ${x+s*1.7} ${y-s*.1} ${x} ${y+s}Z" fill="${f}"/>`;
function star(x, y, r, f, k){
  const p = [];
  for (let i = 0; i < 10; i++){
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r;
    p.push((x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1));
  }
  return `<path d="M${p.join('L')}Z" fill="${f}" stroke="${k || 'none'}" stroke-width="1.5" stroke-linejoin="round"/>`;
}
const twinkle = (x, y, r, d, f) => `<path class="av-tw" style="animation-delay:${d}s" d="M${x} ${y-r}Q${x} ${y} ${x+r} ${y}Q${x} ${y} ${x} ${y+r}Q${x} ${y} ${x-r} ${y}Q${x} ${y} ${x} ${y-r}Z" fill="${f}"/>`;
const arc = (x, up) => `<path d="M${x-5} ${up ? 64 : 61}Q${x} ${up ? 56 : 67} ${x+5} ${up ? 64 : 61}" fill="none" stroke="${D}" stroke-width="2.6" stroke-linecap="round"/>`;
const dot = (x, r = 1) => `<ellipse cx="${x}" cy="62" rx="${4.2*r}" ry="${5.2*r}" fill="${D}"/><circle cx="${x+1.5}" cy="${60-r}" r="${1.7*r}" fill="#fff"/>`;
const mirror = s => s + `<g transform="translate(120 0) scale(-1 1)">${s}</g>`;   // 왼쪽 그림을 오른쪽에도
const ZZ = `<path d="M92 20h7l-7 8h7M102 8h5l-5 6h5" fill="none" stroke="#7e9cd8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

/* ---------- 표정 ---------- */
function face(mood, beak){
  let e, m;
  const w = `<path d="M54 72Q57 76 60 72Q63 76 66 72" fill="none" stroke="${D}" stroke-width="1.8" stroke-linecap="round"/>`;
  const open = `<path d="M53 70Q60 81 67 70Z" fill="#ff7a8a" stroke="${D}" stroke-width="1.8" stroke-linejoin="round"/>`;
  switch (mood){
    case 'smile': e = arc(46, 1) + arc(74, 1); m = open; break;
    case 'wink':  e = `<g class="av-ey">${dot(46)}</g>` + arc(74, 1); m = w; break;
    case 'wow':   e = `<g class="av-ey">${dot(46, 1.25) + dot(74, 1.25)}</g>`; m = `<ellipse cx="60" cy="75" rx="3.6" ry="4.6" fill="${D}"/>`; break;
    case 'star':  e = star(46, 62, 7, '#ffd54f', D) + star(74, 62, 7, '#ffd54f', D); m = open; break;
    case 'love':  e = heart(46, 61, 5.5, '#ff4d7a') + heart(74, 61, 5.5, '#ff4d7a'); m = open; break;
    case 'sleep': e = arc(46, 0) + arc(74, 0); m = `<ellipse cx="60" cy="73" rx="2.5" ry="2" fill="${D}"/>`; break;
    case 'tongue':
      e = `<path d="M42 58L50 62L42 66M78 58L70 62L78 66" fill="none" stroke="${D}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      m = `<path d="M53 70Q60 75 67 70" fill="none" stroke="${D}" stroke-width="1.8" stroke-linecap="round"/><path d="M56 72Q56 81 60 81Q64 81 64 72Z" fill="#ff8a9b" stroke="${D}" stroke-width="1.5"/>`; break;
    case 'teary':
      e = `<g class="av-ey">${dot(46, 1.2) + dot(74, 1.2)}</g><circle cx="44" cy="64" r="1.3" fill="#fff"/><circle cx="72" cy="64" r="1.3" fill="#fff"/><path d="M40 68Q37 75 40 77Q43 75 40 68Z" fill="#8ecbff"/>`;
      m = `<path d="M53 75Q56.5 71 60 75Q63.5 71 67 75" fill="none" stroke="${D}" stroke-width="1.8" stroke-linecap="round"/>`; break;
    default: e = `<g class="av-ey">${dot(46) + dot(74)}</g>`; m = w;
  }
  if (beak){
    m = `<path d="M54 70L66 70L60 78Z" fill="#ffb347" stroke="#e08a1e" stroke-width="1.5" stroke-linejoin="round"/>`;
    if (mood === 'tongue') m += `<path d="M58 76Q58 82 60 82Q62 82 62 76Z" fill="#ff8a9b"/>`;
  }
  if (mood === 'sleep') m += ZZ;
  const op = mood === 'love' || mood === 'teary' ? .85 : .6;
  return e + `<ellipse cx="37" cy="73" rx="7" ry="4.5" fill="#ff9fb5" opacity="${op}"/><ellipse cx="83" cy="73" rx="7" ry="4.5" fill="#ff9fb5" opacity="${op}"/>` + m;
}

/* ---------- 캐릭터 ----------
   f 몸색, l 외곽선, in 안쪽색, behind(머리 뒤) / front(머리 위) 장식, body/belly/foot 은 몸통 색 바꿀 때 */
const st = c => `stroke="${c.l}" stroke-width="2.2"`;
const kidEars = c => `<g ${st(c)} fill="${c.f}"><circle cx="20" cy="64" r="8"/><circle cx="100" cy="64" r="8"/></g>`;
const BODY_ART = {
  kid1: {f:'#ffe0c7', l:'#e0a989', hair:'#8a5a3b', body:'#ffd36b', foot:'#a0785f',
    behind: c => kidEars(c),
    front: c => `<path d="M20 58Q18 16 60 16Q102 16 100 58Q92 38 76 36Q66 46 52 38Q36 40 20 58Z" fill="${c.hair}" stroke="#6b4329" stroke-width="2" stroke-linejoin="round"/><path d="M60 17Q56 6 64 2" fill="none" stroke="#6b4329" stroke-width="2.4" stroke-linecap="round"/>`},
  kid2: {f:'#ffe0c7', l:'#e0a989', hair:'#6b3f2a', body:'#ffb3c7', foot:'#c2607f',
    behind: c => kidEars(c) + mirror(`<circle cx="14" cy="78" r="13" fill="${c.hair}" stroke="#4f2d1c" stroke-width="2"/><circle cx="24" cy="66" r="4.5" fill="#ff8fb1" stroke="#e0607f" stroke-width="1.5"/>`),
    front: c => `<path d="M20 60Q16 16 60 16Q104 16 100 60Q96 40 82 34Q70 40 60 32Q50 40 38 34Q24 40 20 60Z" fill="${c.hair}" stroke="#4f2d1c" stroke-width="2" stroke-linejoin="round"/>`},
  kid3: {f:'#ffe0c7', l:'#e0a989', hair:'#3e2b22', body:'#9fd3ff', foot:'#5a6b8a',
    behind: c => kidEars(c),
    front: c => `<path d="M20 56Q20 18 60 16Q100 18 100 56L92 42L84 46L78 34L68 42L60 30L52 42L42 34L36 46L28 42Z" fill="${c.hair}" stroke="#2a1c15" stroke-width="2" stroke-linejoin="round"/>`},
  cat: {f:'#ffe3ad', l:'#d9a752', in:'#ffc9a8',
    behind: c => `<g ${st(c)} fill="${c.f}" stroke-linejoin="round"><path d="M28 44L32 8L56 26Z"/><path d="M92 44L88 8L64 26Z"/></g><path d="M33 34L35 17L47 27Z" fill="${c.in}"/><path d="M87 34L85 17L73 27Z" fill="${c.in}"/>`,
    front: c => `<g stroke="${c.l}" stroke-width="2.5" stroke-linecap="round"><path d="M54 22V30M60 20V30M66 22V30"/></g>`},
  dog: {f:'#fffaf2', l:'#c9a27c', in:'#c8946a',
    front: c => `<ellipse cx="74" cy="60" rx="13" ry="12" fill="#f3dcc2"/><g ${st(c)} fill="${c.in}"><ellipse cx="25" cy="58" rx="11" ry="22" transform="rotate(18 25 58)"/><ellipse cx="95" cy="58" rx="11" ry="22" transform="rotate(-18 95 58)"/></g>`},
  bunny: {f:'#fff4f7', l:'#e9a3b8', in:'#ffc2d4',
    behind: c => `<g ${st(c)} fill="${c.f}"><ellipse cx="44" cy="10" rx="10" ry="26" transform="rotate(-10 44 10)"/><ellipse cx="76" cy="10" rx="10" ry="26" transform="rotate(10 76 10)"/></g><ellipse cx="44" cy="12" rx="4.5" ry="17" fill="${c.in}" transform="rotate(-10 44 12)"/><ellipse cx="76" cy="12" rx="4.5" ry="17" fill="${c.in}" transform="rotate(10 76 12)"/>`},
  chick: {f:'#ffe270', l:'#e0b22a', beak:true,
    behind: c => `<path d="M58 22Q52 6 60 4Q60 14 64 8Q66 16 62 22" fill="${c.f}" ${st(c)}/>`},
  hamster: {f:'#f5c98b', l:'#c98f4e', in:'#ffc2c2',
    behind: c => `<g ${st(c)} fill="${c.f}"><circle cx="30" cy="28" r="11"/><circle cx="90" cy="28" r="11"/></g><circle cx="30" cy="28" r="6" fill="${c.in}"/><circle cx="90" cy="28" r="6" fill="${c.in}"/>`,
    front: () => `<path d="M24 66Q30 96 60 97Q90 96 96 66Q86 80 60 80Q34 80 24 66Z" fill="#fff7ec"/><ellipse cx="60" cy="30" rx="9" ry="6" fill="#fff7ec"/>`},
  penguin: {f:'#3f5175', l:'#2a3550', beak:true, belly:'#ffffff', bellyOp:1, foot:'#ffb347', footLine:'#e08a1e',
    front: () => `<path d="M60 40C48 26 24 40 26 64C28 86 44 96 60 96C76 96 92 86 94 64C96 40 72 26 60 40Z" fill="#fff"/>`},
  bear: {f:'#c99a6b', l:'#9a6b40', in:'#e8c39e',
    behind: c => `<g ${st(c)} fill="${c.f}"><circle cx="28" cy="26" r="13"/><circle cx="92" cy="26" r="13"/></g><circle cx="28" cy="26" r="7" fill="${c.in}"/><circle cx="92" cy="26" r="7" fill="${c.in}"/>`,
    front: () => `<ellipse cx="60" cy="74" rx="15" ry="11" fill="#f0dcc4"/>`},
  panda: {f:'#ffffff', l:'#9aa0a6',
    behind: c => `<g ${st(c)} fill="#3d3a40"><circle cx="28" cy="26" r="13"/><circle cx="92" cy="26" r="13"/></g>`,
    front: () => `<ellipse cx="44" cy="63" rx="11" ry="13" fill="#3d3a40" transform="rotate(25 44 63)"/><ellipse cx="76" cy="63" rx="11" ry="13" fill="#3d3a40" transform="rotate(-25 76 63)"/><circle cx="46" cy="62" r="6.6" fill="#fff"/><circle cx="74" cy="62" r="6.6" fill="#fff"/>`,
    arm:'#3d3a40', foot:'#3d3a40'},
  fox: {f:'#ffa45c', l:'#d9772e', in:'#fff3e6',
    behind: c => `<path d="M96 128Q122 118 118 92Q110 104 92 112Z" fill="${c.f}" ${st(c)} stroke-linejoin="round"/><path d="M118 92Q114 102 106 106Q114 100 118 92Z" fill="#fff"/>`
      + `<g ${st(c)} fill="${c.f}" stroke-linejoin="round"><path d="M26 46L28 2L58 26Z"/><path d="M94 46L92 2L62 26Z"/></g><path d="M32 34L33 14L48 26Z" fill="${c.in}"/><path d="M88 34L87 14L72 26Z" fill="${c.in}"/>`,
    front: () => `<path d="M22 64Q38 90 60 80Q82 90 98 64Q98 98 60 98Q22 98 22 64Z" fill="#fff6ec"/>`},
  unicorn: {f:'#ffffff', l:'#c3b6e0', in:'#ffd1e8',
    behind: c => `<g ${st(c)} fill="${c.f}" stroke-linejoin="round"><path d="M32 40L34 16L50 28Z"/><path d="M88 40L86 16L70 28Z"/></g><path d="M36 33L37 22L45 28Z" fill="${c.in}"/><path d="M84 33L83 22L75 28Z" fill="${c.in}"/>`,
    front: () => `<g stroke="#fff" stroke-width="1.5"><circle cx="46" cy="22" r="9" fill="#fff0a8"/><circle cx="33" cy="30" r="9" fill="#ffc2e0"/><circle cx="25" cy="44" r="8" fill="#c9b5ff"/><circle cx="22" cy="58" r="7" fill="#b5e8ff"/></g>`
      + `<path d="M54 22L60-8L66 22Z" fill="#ffd54f" stroke="#d4a017" stroke-width="2" stroke-linejoin="round"/><path d="M56 12L64 8M55 18L65 14" stroke="#d4a017" stroke-width="1.5"/>` + star(90, 44, 4, '#ffd1e8')},
  robot: {f:'#d3e3f0', l:'#7f9cb5', belly:'#9fc1dc', bellyOp:1,
    behind: c => `<path d="M60 18V4" stroke="${c.l}" stroke-width="3"/><circle cx="60" cy="2" r="5" fill="#ff6f91" stroke="#d94a6e" stroke-width="1.5"/>`
      + `<g ${st(c)} fill="#9fc1dc"><rect x="12" y="50" width="12" height="18" rx="4"/><rect x="96" y="50" width="12" height="18" rx="4"/></g>`,
    front: () => `<rect x="46" y="27" width="28" height="9" rx="4" fill="#9fc1dc"/><circle cx="53" cy="31.5" r="2" fill="#7ee0a8"/><circle cx="60" cy="31.5" r="2" fill="#ffd54f"/><circle cx="67" cy="31.5" r="2" fill="#ff8fb1"/>`},
  dragon: {f:'#9be8c8', l:'#4fb58d', in:'#fff3b0', belly:'#fff3b0', bellyOp:1,
    behind: c => `<path d="M30 132Q2 134 4 110Q14 122 36 120Z" fill="${c.f}" ${st(c)} stroke-linejoin="round"/>`
      + `<g fill="${c.in}" stroke="#d9c25a" stroke-width="2" stroke-linejoin="round"><path d="M40 26Q30 8 38 0Q42 14 50 22Z"/><path d="M80 26Q90 8 82 0Q78 14 70 22Z"/></g>`
      + `<g fill="#6fd0a8" stroke="${c.l}" stroke-width="1.8" stroke-linejoin="round"><path d="M84 92L96 88L90 100Z"/><path d="M86 106L100 104L92 116Z"/></g>`,
    front: () => `<g fill="#6fd0a8"><circle cx="50" cy="26" r="2.5"/><circle cx="60" cy="23" r="2.5"/><circle cx="70" cy="26" r="2.5"/></g>`},
};
const hasBody = id => Object.prototype.hasOwnProperty.call(BODY_ART, id);

// 몸·머리·장식·표정 (배경·아이템은 빼고)
function figure(id, mood){
  const c = BODY_ART[hasBody(id) ? id : 'kid1'], s = st(c);
  const body = c.body || c.f, arm = c.arm || body;   // 아이들은 body 가 옷 색
  return (c.behind ? c.behind(c) : '')
    + `<g ${s} fill="${c.foot || body}"${c.footLine ? ` stroke="${c.footLine}"` : ''}><ellipse cx="47" cy="132" rx="9" ry="6"/><ellipse cx="73" cy="132" rx="9" ry="6"/></g>`
    + `<ellipse cx="60" cy="112" rx="26" ry="22" fill="${body}" ${s}/>`
    + `<g ${s} fill="${arm}"><ellipse cx="35" cy="108" rx="7" ry="10" transform="rotate(25 35 108)"/><ellipse cx="85" cy="108" rx="7" ry="10" transform="rotate(-25 85 108)"/></g>`
    + `<ellipse cx="60" cy="116" rx="14" ry="11" fill="${c.belly || '#fff'}" opacity="${c.bellyOp || .55}"/>`
    + `<circle cx="60" cy="58" r="40" fill="${c.f}" ${s}/>`
    + (c.front ? c.front(c) : '')
    + face(MOODS.includes(mood) ? mood : 'base', !!c.beak);
}

function character({body, equip = {}, mood = 'base', bg = false} = {}){
  const ch = `<ellipse cx="60" cy="140" rx="34" ry="5" fill="#000" opacity=".1"/><g class="av-fl">${figure(body, mood)}</g>`;
  return `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg">${ch}</svg>`;
}
// 상점 칸용 얼굴 썸네일
const faceThumb = id => `<svg viewBox="6 -10 108 108" xmlns="http://www.w3.org/2000/svg">${figure(id, 'base')}</svg>`;

const css = `
.av-fl{animation:av-fl 2.2s ease-in-out infinite}
@keyframes av-fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.av-ey{transform-box:fill-box;transform-origin:center;animation:av-bl 4s infinite}
@keyframes av-bl{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
.av-tw{transform-box:fill-box;transform-origin:center;animation:av-tw 1.4s ease-in-out infinite}
@keyframes av-tw{0%,100%{opacity:.35;transform:scale(.7)}50%{opacity:1;transform:scale(1.1)}}
.av-fa{animation:av-fa linear infinite}
@keyframes av-fa{from{transform:translate(0,-40px)}to{transform:translate(14px,200px)}}
.av-ri{animation:av-ri linear infinite}
@keyframes av-ri{from{transform:translateY(190px);opacity:0}15%{opacity:1}to{transform:translateY(-40px);opacity:0}}
.av-up{animation:av-up 2.4s ease-out infinite}
@keyframes av-up{from{transform:translateY(10px);opacity:0}30%{opacity:1}to{transform:translateY(-26px);opacity:0}}`;

window.AvatarArt = {MOODS, character, face: faceThumb, hasBody, css};
})();
