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

/* ---------- 아이템 ----------
   문자열이면 그 칸 자리에 그려요. 등(back) 아이템은 {under, over}: under 는 몸 뒤, over 는 몸 위(끈·걸쇠) */
const flame = (x, y, d) => `<g class="av-fk" style="animation-delay:${d}s"><path d="M${x} ${y}Q${x-9} ${y-10} ${x} ${y-24}Q${x+9} ${y-10} ${x} ${y}Z" fill="#ff8a3d"/><path d="M${x} ${y}Q${x-4} ${y-6} ${x} ${y-13}Q${x+4} ${y-6} ${x} ${y}Z" fill="#ffe066"/></g>`;
const plus = (x, y, d, f) => `<path class="av-tw" style="animation-delay:${d}s" d="M${x-2} ${y-7}h4v5h5v4h-5v5h-4v-5h-5v-4h5Z" fill="${f}"/>`;
const ITEM_ART = {
  // 모자
  cap: `<path d="M28 32Q28 2 60 2Q92 2 92 32Z" fill="#5aa9ff" stroke="#2f7fd6" stroke-width="2" stroke-linejoin="round"/><path d="M60 30Q98 22 114 32Q98 40 60 36Z" fill="#3d8fe6" stroke="#2f7fd6" stroke-width="2" stroke-linejoin="round"/><path d="M60 3V30" stroke="#2f7fd6" stroke-width="1.5"/><circle cx="60" cy="4" r="3" fill="#2f7fd6"/>`,
  ribbon: `<g transform="translate(84 28)"><path d="M0 0L-13-9L-13 9ZM0 0L13-9L13 9Z" fill="#ff8fb1" stroke="#e0607f" stroke-width="2" stroke-linejoin="round"/><circle r="4.5" fill="#ff6f99" stroke="#e0607f" stroke-width="1.5"/></g>`,
  tophat: `<rect x="40" y="-18" width="40" height="42" rx="5" fill="#4a3f5c" stroke="#2e2638" stroke-width="2"/><rect x="40" y="10" width="40" height="7" fill="#ff6f91"/><ellipse cx="60" cy="25" rx="32" ry="6" fill="#4a3f5c" stroke="#2e2638" stroke-width="2"/>`,
  helmet: `<path d="M24 36Q24 0 60 0Q96 0 96 36Z" fill="#fff" stroke="#bfc6cf" stroke-width="2"/><rect x="18" y="32" width="84" height="8" rx="4" fill="#e6eaef" stroke="#bfc6cf" stroke-width="2"/><path d="M56 8h8v6h6v8h-6v6h-8v-6h-6v-8h6Z" fill="#ff5c6c"/>`,
  crown: `<path d="M42 24L40 4L51 14L60-2L69 14L80 4L78 24Z" fill="#ffd54f" stroke="#d4a017" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="16" r="3" fill="#ff7aa2"/><circle cx="48" cy="19" r="2" fill="#7ec8ff"/><circle cx="72" cy="19" r="2" fill="#7ec8ff"/>`,
  flower: (() => {
    let o = '';
    const cs = ['#ff9fc0','#fff','#c9a8ff','#ffd36b','#ff9fc0','#fff','#c9a8ff'];
    for (let i = 0; i < 7; i++){
      const a = (-160 + i * 23.3) * Math.PI / 180, x = (60 + 39 * Math.cos(a)).toFixed(1), y = (58 + 39 * Math.sin(a)).toFixed(1);
      o += `<ellipse cx="${(+x + 4).toFixed(1)}" cy="${(+y + 3).toFixed(1)}" rx="4" ry="2.4" fill="#8fd18a"/><circle cx="${x}" cy="${y}" r="5.5" fill="${cs[i]}" stroke="#e39ab5" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="2" fill="#ffc94d"/>`;
    }
    return o;
  })(),
  beret: `<ellipse cx="52" cy="24" rx="32" ry="11" fill="#ff7a6b" stroke="#d4503f" stroke-width="2" transform="rotate(-8 52 24)"/><rect x="50" y="9" width="4" height="7" rx="2" fill="#d4503f"/>`,
  magichat: `<path d="M32 26Q60 34 88 26L66-12Q60-20 56-10Z" fill="#7a6fd6" stroke="#4f45a8" stroke-width="2" stroke-linejoin="round"/><ellipse cx="60" cy="27" rx="34" ry="6" fill="#7a6fd6" stroke="#4f45a8" stroke-width="2"/>${star(58, 8, 5, '#ffe066')}${star(70, 18, 3.5, '#ffe066')}`,
  m_numhat: `<path d="M42 24L60-16L78 24Z" fill="#7ed6a5" stroke="#3fa872" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="-16" r="5" fill="#ffd54f" stroke="#d4a017" stroke-width="1.5"/><text x="60" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="#fff" font-family="sans-serif">123</text>`,
  m_pi: `<ellipse cx="60" cy="24" rx="32" ry="10" fill="#e8b26a" stroke="#b97a32" stroke-width="2"/><ellipse cx="60" cy="20" rx="25" ry="6" fill="#d9536f"/><path d="M42 18L78 22M44 23L76 16M52 15L56 26M64 15L68 26" stroke="#e8b26a" stroke-width="2.5"/><text x="60" y="8" text-anchor="middle" font-size="16" font-weight="bold" fill="#b97a32" font-family="serif">π</text>`,
  // 얼굴
  glasses: `<g fill="#fff" fill-opacity=".25" stroke="#8d5a3b" stroke-width="2.2"><circle cx="46" cy="62" r="9.5"/><circle cx="74" cy="62" r="9.5"/></g><path d="M55.5 61Q60 58 64.5 61" fill="none" stroke="#8d5a3b" stroke-width="2.2"/>`,
  mask: `<path d="M24 62L36 72M96 62L84 72" stroke="#9ec9ee" stroke-width="1.5"/><path d="M34 70Q60 64 86 70L84 88Q60 96 36 88Z" fill="#eef7ff" stroke="#9ec9ee" stroke-width="2" stroke-linejoin="round"/><path d="M38 77Q60 73 82 77M38 83Q60 81 82 83" fill="none" stroke="#c8e1f5" stroke-width="1.5"/>`,
  sunglasses: `<g fill="#2d2d3a" stroke="#14141c" stroke-width="1.5"><rect x="33" y="54" width="24" height="16" rx="7"/><rect x="63" y="54" width="24" height="16" rx="7"/></g><path d="M57 59Q60 56 63 59" fill="none" stroke="#14141c" stroke-width="2"/><path d="M37 58L42 58M67 58L72 58" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
  goggles: `<rect x="20" y="57" width="80" height="9" rx="4" fill="#ff9f43" stroke="#d4761e" stroke-width="1.5"/><g fill="#a8e6ff" fill-opacity=".7" stroke="#3d6b8a" stroke-width="3"><circle cx="46" cy="62" r="11"/><circle cx="74" cy="62" r="11"/></g><path d="M40 57Q43 54 47 55M68 57Q71 54 75 55" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  beard: `<path d="M26 68Q28 106 60 106Q92 106 94 68Q82 84 60 82Q38 84 26 68Z" fill="#f4f4f4" stroke="#c8c8c8" stroke-width="2" stroke-linejoin="round"/><path d="M60 72Q50 66 42 74Q52 76 60 74Q68 76 78 74Q70 66 60 72Z" fill="#f4f4f4" stroke="#c8c8c8" stroke-width="1.5"/>`,
  bandage: `<g transform="rotate(-25 36 46)"><rect x="26" y="42" width="20" height="8" rx="4" fill="#f5c9a0" stroke="#d99b66" stroke-width="1.2"/><rect x="33" y="43" width="6" height="6" fill="#e8b48a"/></g>`,
  starsticker: star(86, 64, 6.5, '#ffe066', '#e0b22a'),
  heartglasses: `<g opacity=".9">${heart(46, 62, 8.5, '#ff5c8a') + heart(74, 62, 8.5, '#ff5c8a')}</g><path d="M54 60Q60 57 66 60" fill="none" stroke="#c23a63" stroke-width="2"/>`,
  m_glass: `<g fill="#fff" fill-opacity=".2" stroke="#3d2a2e" stroke-width="3"><rect x="34" y="53" width="23" height="18" rx="3"/><rect x="63" y="53" width="23" height="18" rx="3"/></g><path d="M57 60H63" stroke="#3d2a2e" stroke-width="3"/><rect x="58" y="57" width="4" height="6" fill="#fff" stroke="#ccc" stroke-width="1"/>`,
  // 손
  balloon: `<path d="M88 110Q98 92 104 64" fill="none" stroke="#999" stroke-width="1.2"/><ellipse cx="106" cy="48" rx="12" ry="14.5" fill="#ff8fb1" stroke="#e0607f" stroke-width="2"/><ellipse cx="102" cy="42" rx="3" ry="5" fill="#fff" opacity=".6"/><path d="M103 62L109 62L106 65Z" fill="#e0607f"/>`,
  snowball: `<circle cx="98" cy="98" r="11" fill="#fff" stroke="#b8d4ea" stroke-width="2"/><path d="M92 94Q96 90 100 92" fill="none" stroke="#dcebf7" stroke-width="2" stroke-linecap="round"/>${twinkle(110, 84, 4, 0, '#b8e1ff')}`,
  wand: `<path d="M88 112L104 82" stroke="#a1887f" stroke-width="3.5" stroke-linecap="round"/>${star(104, 76, 10, '#ffe066', '#e0b22a')}`,
  shield: `<path d="M84 86H110V100Q110 114 97 121Q84 114 84 100Z" fill="#7ec8ff" stroke="#3f86c4" stroke-width="2.2" stroke-linejoin="round"/>${star(97, 101, 7, '#fff')}`,
  bow: `<path d="M96 66Q122 98 96 132" fill="none" stroke="#a1887f" stroke-width="4" stroke-linecap="round"/><path d="M96 66V132" stroke="#d6c8c0" stroke-width="1.2"/><path d="M86 100H112M108 96L113 100L108 104" fill="none" stroke="#8a6a5a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  lollipop: `<path d="M88 112L99 88" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><path d="M88 112L99 88" stroke="#ccc" stroke-width="1"/><circle cx="101" cy="80" r="11" fill="#ffd6ec" stroke="#e0607f" stroke-width="2"/><path d="M101 80m-7 0a7 7 0 1 1 7 7a4 4 0 1 1 4-4" fill="none" stroke="#ff6f99" stroke-width="2.4" stroke-linecap="round"/>`,
  icecream: `<path d="M89 96L103 96L96 118Z" fill="#f2c27b" stroke="#c98f3c" stroke-width="1.8" stroke-linejoin="round"/><circle cx="96" cy="91" r="7.5" fill="#ffb3c7" stroke="#e0789a" stroke-width="1.8"/><circle cx="96" cy="81" r="6.5" fill="#b5f0d5" stroke="#5fbf96" stroke-width="1.8"/>`,
  m_ruler: `<g transform="rotate(22 97 89)"><rect x="92" y="58" width="10" height="60" rx="2" fill="#ffe066" stroke="#d4a017" stroke-width="1.8"/><path d="M92 66h4M92 74h6M92 82h4M92 90h6M92 98h4M92 106h6" stroke="#b98a12" stroke-width="1.2"/></g>`,
  m_tri: `<path d="M88 112L112 60V112Z" fill="#9fd3ff" fill-opacity=".85" stroke="#3f86c4" stroke-width="2" stroke-linejoin="round"/><path d="M100 104L108 86V104Z" fill="#fff" opacity=".8"/>`,
  m_abacus: `<rect x="80" y="84" width="34" height="32" rx="4" fill="#e8c39e" stroke="#8a5a2b" stroke-width="2.2"/><path d="M82 93H112M82 100H112M82 107H112" stroke="#8a5a2b" stroke-width="1.2"/><g><circle cx="88" cy="93" r="3" fill="#ff6f91"/><circle cx="95" cy="93" r="3" fill="#ff6f91"/><circle cx="104" cy="100" r="3" fill="#7ec8ff"/><circle cx="90" cy="107" r="3" fill="#7ed6a5"/><circle cx="97" cy="107" r="3" fill="#7ed6a5"/><circle cx="106" cy="107" r="3" fill="#7ed6a5"/></g>`,
  // 등
  umbrella: {under: `<path d="M24 58L34 126" stroke="#8a5a2b" stroke-width="3" stroke-linecap="round"/><path d="M-8 58Q20 12 52 58Q45 52 38 58Q31 52 24 58Q17 52 10 58Q3 52-8 58Z" fill="#ff8fb1" stroke="#e0607f" stroke-width="2" stroke-linejoin="round"/>`},
  backpack: {under: `<rect x="20" y="86" width="80" height="48" rx="16" fill="#ff9f43" stroke="#d4761e" stroke-width="2"/>`,
    over: `<path d="M44 94Q40 112 44 130M76 94Q80 112 76 130" fill="none" stroke="#d4761e" stroke-width="4" stroke-linecap="round"/>`},
  cape: {under: `<path d="M36 90Q60 82 84 90L98 140Q60 150 22 140Z" fill="#b39ddb" stroke="#7e67b8" stroke-width="2"/>`,
    over: `<circle cx="60" cy="96" r="3.5" fill="#ffd54f" stroke="#d4a017" stroke-width="1.2"/>`},
  bag: {over: `<path d="M40 92L88 124" stroke="#8a5a2b" stroke-width="3" stroke-linecap="round"/><rect x="80" y="114" width="24" height="20" rx="6" fill="#c98f4e" stroke="#8a5a2b" stroke-width="2"/><circle cx="92" cy="124" r="4.5" fill="#ffd54f" stroke="#d4a017" stroke-width="1.5"/>`},
  wings: {under: mirror(`<path d="M40 100Q14 74 4 92Q8 100 16 100Q6 106 12 114Q20 118 26 114Q22 122 32 122Q40 118 42 110Z" fill="#fff" stroke="#9ec9ee" stroke-width="2" stroke-linejoin="round"/>`)},
  butterfly: {under: mirror(`<ellipse cx="22" cy="94" rx="17" ry="14" fill="#d7b8ff" stroke="#9a72d6" stroke-width="2"/><ellipse cx="26" cy="118" rx="11" ry="9" fill="#ffc2e0" stroke="#d47aa8" stroke-width="2"/><circle cx="20" cy="92" r="4" fill="#fff" opacity=".7"/>`)},
  m_cape: {under: `<path d="M36 90Q60 82 84 90L98 140Q60 150 22 140Z" fill="#7ed6a5" stroke="#3fa872" stroke-width="2"/><path d="M86 128h10M87 133h10M23 128h10M22 133h10" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`},
  // 효과
  sparkle: [[12,30,0],[110,36,.5],[14,96,.9],[106,120,.3]].map(([x, y, d]) => twinkle(x, y, 7, d, '#ffd54f')).join(''),
  snow: [[10,20,0],[104,30,.8],[18,80,1.6],[108,96,.4],[30,0,1.2]].map(([x, y, d]) => `<g class="av-dn" style="animation-delay:${d}s"><circle cx="${x}" cy="${y}" r="3" fill="#fff" stroke="#b8d4ea" stroke-width="1.2"/></g>`).join(''),
  heart: [[14,80,0,4],[106,70,.8,5],[20,40,1.5,3.5],[100,110,1.1,3]].map(([x, y, d, s]) => `<g class="av-up" style="animation-delay:${d}s">${heart(x, y, s, '#ff6f99')}</g>`).join(''),
  fire: flame(14, 138, 0) + flame(106, 138, .3) + flame(4, 120, .6),
  rainbow: `<g class="av-tw" style="animation-duration:2.4s">${['#ff9b9b','#ffd27a','#9be3a0','#8ecbff'].map((c, i) => `<path d="M${-6+i*4} 44A${20-i*4} ${20-i*4} 0 0 1 ${34-i*4} 44" fill="none" stroke="${c}" stroke-width="4"/>`).join('')}</g>`,
  music: [[12,70,0,'#7e9cd8'],[106,52,.7,'#b39ddb'],[104,104,1.4,'#7fcfa8']].map(([x, y, d, c]) => `<g class="av-up" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="${c}" transform="rotate(-20 ${x} ${y})"/><path d="M${x+3.5} ${y-1}V${y-14}l6 3" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/></g>`).join(''),
  m_plus: plus(12, 36, 0, '#7ed6a5') + plus(108, 50, .5, '#7ec8ff') + plus(16, 104, 1, '#ffb347') + plus(104, 118, .3, '#ff8fb1'),
  m_star: `<g class="av-up" style="animation-duration:3s"><text x="100" y="40" text-anchor="middle" font-size="16" font-weight="bold" fill="#ff4d6d" font-family="sans-serif">100</text><path d="M86 44H114M88 48H112" stroke="#ff4d6d" stroke-width="2" stroke-linecap="round"/></g>${twinkle(14, 40, 6, .4, '#ffd54f')}${twinkle(12, 100, 5, 1, '#ffd54f')}`,
};

/* ---------- 배경 (캐릭터 뒤 둥근 타일, 상자 -20,-24,160,180) ---------- */
const tile = f => `<rect x="-20" y="-24" width="160" height="180" fill="${f}"/>`;
const BG_ART = {
  bg_sky: () => tile('#e3f3ff') + ['#ffb3b3','#ffd9a3','#fff1a3','#c4f0b8','#b8dcff','#d4c4ff'].map((c, i) => `<path d="M-10 120A70 70 0 0 1 130 120" fill="none" stroke="${c}" stroke-width="7" opacity=".9" style="transform-origin:60px 120px;transform:scale(${1-i*.1})"/>`).join('')
    + `<g fill="#fff"><circle cx="-4" cy="118" r="12"/><circle cx="10" cy="122" r="10"/><circle cx="122" cy="118" r="12"/><circle cx="108" cy="122" r="10"/></g>`,
  bg_night: () => tile('#2e3166') + `<circle cx="112" cy="-2" r="12" fill="#fff3b0"/><circle cx="118" cy="-6" r="11" fill="#2e3166"/>`
    + [[-8,10,0],[20,-12,.4],[100,30,.8],[-4,60,1.2],[128,80,.2],[30,20,1],[90,-14,.6],[-10,120,.9],[126,130,1.3]].map(([x, y, d]) => twinkle(x, y, 4, d, '#fff6c2')).join(''),
  bg_spring: () => { let o = tile('#fff0f5'); for (let i = 0; i < 10; i++) o += `<g class="av-fa" style="animation-duration:${4+i%3}s;animation-delay:-${(i*.55).toFixed(2)}s"><ellipse cx="${-14+i*16}" cy="0" rx="4" ry="2.6" fill="#ffb7cf" transform="rotate(${i*40} ${-14+i*16} 0)"/></g>`; return o; },
  bg_bubble: () => { let o = tile('#e0f7fa'); for (let i = 0; i < 8; i++) o += `<g class="av-ri" style="animation-duration:${5+i%3}s;animation-delay:-${(i*.8).toFixed(1)}s"><circle cx="${-12+i*20}" cy="0" r="${4+i%3*3}" fill="#fff" fill-opacity=".4" stroke="#7fd3e6" stroke-width="1.2"/></g>`; return o; },
  bg_winter: () => { let o = tile('#dde8f5'); for (let i = 0; i < 14; i++) o += `<g class="av-fa" style="animation-duration:${5+i%4}s;animation-delay:-${(i*.45).toFixed(2)}s"><circle cx="${-16+i*11}" cy="0" r="${1.6+i%3}" fill="#fff"/></g>`; return o + `<ellipse cx="60" cy="160" rx="110" ry="24" fill="#fff"/>`; },
  bg_garden: () => tile('#e6f6ff') + `<ellipse cx="60" cy="168" rx="120" ry="40" fill="#bfe8a6"/>`
    + [[-8,140,'#ff9fc0'],[12,150,'#fff'],[108,142,'#ffd36b'],[126,152,'#c9a8ff'],[90,154,'#ff9fc0']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/><circle cx="${x}" cy="${y}" r="1.5" fill="#ffc94d"/>`).join(''),
  m_grid: () => { let o = tile('#2f5d50'); for (let i = -20; i <= 140; i += 16) o += `<path d="M${i} -24V156M-20 ${i}H140" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>`;
    return o + [['1+2',-6,4],['3×4',96,0],['5−1',-8,120],['½',112,110]].map(([t, x, y]) => `<text x="${x}" y="${y}" font-size="13" fill="#fff" fill-opacity=".55" font-family="sans-serif">${t}</text>`).join(''); },
  m_space: () => tile('#25204a') + `<circle cx="112" cy="4" r="12" fill="#ffb37a"/><ellipse cx="112" cy="4" rx="20" ry="4" fill="none" stroke="#ffd9b8" stroke-width="2"/><circle cx="-4" cy="126" r="8" fill="#7ec8ff"/>`
    + [['7',4,10,0],['3',96,60,.7],['9',-10,70,1.3],['2',120,130,.4]].map(([t, x, y, d]) => `<text class="av-tw" style="animation-delay:${d}s" x="${x}" y="${y}" font-size="14" font-weight="bold" fill="#fff6c2" font-family="sans-serif">${t}</text>`).join(''),
};
const hasItem = id => Object.prototype.hasOwnProperty.call(ITEM_ART, id) || Object.prototype.hasOwnProperty.call(BG_ART, id);
const slotOf = id => { const it = ITEMS.find(i => i.id === id); return it && it.slot; };
// 칸 자리에 맞는 그림만 (그림 없거나 칸이 다르면 '')
function part(equip, slot, layer){
  const id = equip[slot];
  if (!id || slotOf(id) !== slot || !Object.prototype.hasOwnProperty.call(ITEM_ART, id)) return '';
  const a = ITEM_ART[id];
  if (typeof a === 'string') return layer ? '' : a;
  return a[layer || 'under'] || '';
}
function tileOf(id){
  if (!Object.prototype.hasOwnProperty.call(BG_ART, id)) return '';
  const c = 'av-c' + (++uid);
  return `<defs><clipPath id="${c}"><rect x="-20" y="-24" width="160" height="180" rx="14"/></clipPath></defs><g clip-path="url(#${c})">${BG_ART[id]()}</g>`;
}

function character({body, equip = {}, mood = 'base', bg = false} = {}){
  equip = equip || {};
  const bgId = bg && slotOf(equip.bg) === 'bg' ? equip.bg : null;
  const fig = part(equip, 'back', 'under') + figure(body, mood) + part(equip, 'back', 'over')
    + part(equip, 'face') + part(equip, 'hat') + part(equip, 'hand') + part(equip, 'effect');
  const ch = `<ellipse cx="60" cy="140" rx="34" ry="5" fill="#000" opacity=".1"/><g class="av-fl">${fig}</g>`;
  return `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg">${bgId ? tileOf(bgId) : ''}${ch}</svg>`;
}
// 상점 칸용 얼굴 썸네일
const faceThumb = id => `<svg viewBox="6 -10 108 108" xmlns="http://www.w3.org/2000/svg">${figure(id, 'base')}</svg>`;
// 아이템 하나만 그린 썸네일: 그림 둘레에 꼭 맞춘 정사각 상자 (브라우저 getBBox 로 잰 값)
const THUMB_VB = {cap:'24 -28 94 94', ribbon:'67 11 34 34', tophat:'24 -29 72 72', helmet:'14 -26 92 92', crown:'36 -13 48 48',
  flower:'14 -15 95 95', beret:'15 -13 74 74', magichat:'22 -29 76 76', glasses:'33 35 55 55', mask:'20 37 80 80',
  sunglasses:'29 31 62 62', goggles:'16 18 88 88', beard:'22 49 76 76', bandage:'21 31 30 30', starsticker:'76 53 20 20',
  heartglasses:'34 37 52 52', balloon:'61 30 85 85', snowball:'82 77 36 36', wand:'74 62 54 54', shield:'76 82 43 43',
  bow:'63 62 74 74', lollipop:'75 65 51 51', icecream:'70 71 52 52', umbrella:'-27 31 99 99', backpack:'16 66 88 88',
  cape:'18 74 84 84', bag:'36 77 72 72', wings:'0 43 120 120', butterfly:'1 45 118 118', sparkle:'3 17 118 118',
  snow:'3 -8 112 112', heart:'6 21 108 108', fire:'-4 58 119 119', rainbow:'-4 16 36 36', music:'3 15 116 116',
  m_numhat:'34 -25 53 53', m_pi:'24 -24 72 72', m_glass:'30 32 60 60', m_ruler:'64 54 67 67', m_tri:'70 56 60 60',
  m_abacus:'76 79 42 42', m_cape:'18 74 84 84', m_plus:'3 20 116 116', m_star:'3 11 115 115'};
function thumb(id){
  if (slotOf(id) === 'bg') return `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg">${tileOf(id)}</svg>`;
  const a = ITEM_ART[id], s = !a ? '' : typeof a === 'string' ? a : (a.under || '') + (a.over || '');
  return `<svg viewBox="${THUMB_VB[id] || VB}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

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
@keyframes av-up{from{transform:translateY(10px);opacity:0}30%{opacity:1}to{transform:translateY(-26px);opacity:0}}
.av-dn{animation:av-dn 2.6s linear infinite}
@keyframes av-dn{from{transform:translateY(-12px);opacity:0}20%{opacity:1}to{transform:translateY(26px);opacity:0}}
.av-fk{transform-box:fill-box;transform-origin:50% 100%;animation:av-fk .5s ease-in-out infinite alternate}
@keyframes av-fk{from{transform:scaleY(.85)}to{transform:scaleY(1.1)}}`;

window.AvatarArt = {MOODS, character, face: faceThumb, thumb, hasBody, hasItem, css};
})();
