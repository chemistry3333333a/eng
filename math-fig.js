/* =====================================================================
   워드 아일랜드 · 수학 그림 (도형·그래프 문제의 인라인 SVG)
   - MathFig.draw(p) → SVG 글자 (그림이 없는 유형이면 '')
   - 그림은 문제의 재료(p.g)로만 그려요. 저장된 문제도 똑같은 그림이 나와요
   - 문제에 나온 수(변의 길이, 각도 …)를 그림에 쓰고, 모르는 값은 주황색 "?" 로 보여요
   - 색은 흰 카드 위에서 읽히는 고정 색이에요 (수학 화면의 문제 칸·힌트 칸은 늘 흰색)
   ===================================================================== */
(function(){
const R1 = n => Math.round(n * 10) / 10;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const len = a => Math.hypot(a[0], a[1]), unit = a => mul(a, 1 / (len(a) || 1)), mid = (a, b) => mul(add(a, b), .5);
const rad = d => d * Math.PI / 180;
const P = p => `${R1(p[0])},${R1(p[1])}`;
const cen = pts => mul(pts.reduce((s, p) => add(s, p), [0, 0]), 1 / pts.length);

// 도형 좌표를 viewBox 안에 꽉 차게 옮기는 함수 (가로세로 비율 유지)
function fitter(pts, W, H, pad){
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min((W - 2 * pad) / ((x1 - x0) || 1), (H - 2 * pad) / ((y1 - y0) || 1));
  const ox = (W - (x1 - x0) * k) / 2 - x0 * k, oy = (H - (y1 - y0) * k) / 2 - y0 * k;
  return p => [p[0] * k + ox, p[1] * k + oy];
}
// ── 그리기 조각 ──
const svg = (W, H, body, label) => `<svg class="mfig" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">${body}</svg>`;
const tx = (p, s, c) => `<text x="${R1(p[0])}" y="${R1(p[1])}"${c ? ` class="${c}"` : ''}>${s}</text>`;
const lab = (p, s) => tx(p, s, s === '?' ? 'q' : '');                 // "?" 는 주황색
const poly = (pts, c) => `<polygon class="${c || 'sh'}" points="${pts.map(P).join(' ')}"/>`;
const pline = (pts, c) => `<polyline class="${c || 'ln'}" points="${pts.map(P).join(' ')}"/>`;
const seg = (a, b, c) => `<line class="${c || 'ln'}" x1="${R1(a[0])}" y1="${R1(a[1])}" x2="${R1(b[0])}" y2="${R1(b[1])}"/>`;
const dot = (p, r, c) => `<circle class="${c || 'dt'}" cx="${R1(p[0])}" cy="${R1(p[1])}" r="${r || 3.5}"/>`;
// 변 옆 글자: 도형 가운데에서 먼 쪽으로 off 만큼
function side(a, b, s, c0, off){
  const m = mid(a, b), d = unit(sub(b, a));
  let n = [-d[1], d[0]];
  if ((m[0] - c0[0]) * n[0] + (m[1] - c0[1]) * n[1] < 0) n = mul(n, -1);
  return lab(add(m, mul(n, off || 15)), s);
}
// 같은 길이 표시 (변 가운데 짧은 금, k 개)
function ticks(a, b, k){
  const m = mid(a, b), d = unit(sub(b, a)), n = [-d[1], d[0]];
  let s = '';
  for (let i = 0; i < (k || 1); i++){ const c = add(m, mul(d, (i - ((k || 1) - 1) / 2) * 5)); s += seg(add(c, mul(n, 6)), add(c, mul(n, -6)), 'tk'); }
  return s;
}
// 꼭짓점 v 에서 p1, p2 쪽 사이의 각 (호 + 글자)
function arc(v, p1, p2, r, s){
  const u1 = unit(sub(p1, v)), u2 = unit(sub(p2, v)), a = add(v, mul(u1, r)), b = add(v, mul(u2, r));
  const sw = u1[0] * u2[1] - u1[1] * u2[0] > 0 ? 1 : 0, bis = unit(add(u1, u2));
  return `<path class="arc" d="M${P(a)} A${r} ${r} 0 0 ${sw} ${P(b)}"/>` + (s ? lab(add(v, mul(bis, r + 14)), s) : '');
}
function rightMark(v, p1, p2){
  const u1 = mul(unit(sub(p1, v)), 9), u2 = mul(unit(sub(p2, v)), 9);
  return pline([add(v, u1), add(add(v, u1), u2), add(v, u2)], 'ln thin');
}
const clampR = (a, b, r) => { const k = a / b; return k > r ? [a, a / r] : k < 1 / r ? [b / r, b] : [a, b]; };   // 너무 길쭉하지 않게

// ── 4-2 이등변삼각형 ──
function pg1(g){
  const A = g.t || 180 - 2 * g.b, L = 100;
  const raw = [[0, 0], [-L * Math.sin(rad(A / 2)), L * Math.cos(rad(A / 2))], [L * Math.sin(rad(A / 2)), L * Math.cos(rad(A / 2))]];
  const f = fitter(raw, 300, 190, 34), [t, l, r] = raw.map(f), c0 = cen([t, l, r]);
  return svg(300, 190, poly([t, l, r]) + ticks(t, l) + ticks(t, r) +
    arc(t, l, r, 20, g.t ? `${g.t}°` : '?') + arc(l, t, r, 20, g.t ? '?' : `${g.b}°`) + arc(r, l, t, 20, g.t ? '' : `${g.b}°`) +
    tx(add(mid(l, r), [0, 18]), '밑변', 'sm'), '이등변삼각형');
}
// 정다각형 (아래 변이 수평)
function regular(n, R, cx, cy){ const o = []; for (let i = 0; i < n; i++){ const a = rad(90 + 180 / n + 360 * i / n); o.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); } return o; }
function pg2(g){
  const v = regular(g.n, 70, 130, 95), c0 = [130, 95];
  let s = poly(v);
  for (let i = 0; i < g.n; i++) s += ticks(v[i], v[(i + 1) % g.n]);
  s += side(v[0], v[1], g.m === 'p' ? `${g.s}cm` : '?', c0, 16);
  s += tx(c0, g.m === 'p' ? '둘레 ?' : `둘레 ${g.n * g.s}cm`, g.m === 'p' ? 'q sm' : 'sm');
  return svg(260, 190, s, g.nm);
}
function para(a, b, ang){ const tl = [b * Math.cos(rad(ang)), -b * Math.sin(rad(ang))]; return [[0, 0], [a, 0], add(tl, [a, 0]), tl]; }   // 왼쪽 아래부터
function pg3(g){
  if (g.m === 0){
    const raw = para(160, 100, g.a), f = fitter(raw, 300, 170, 34), [bl, br, tr, tl] = raw.map(f);
    return svg(300, 170, poly([bl, br, tr, tl]) + ticks(bl, br, 2) + ticks(tl, tr, 2) + arc(bl, br, tl, 20, `${g.a}°`) + arc(br, tr, bl, 20, '?'), '평행사변형');
  }
  if (g.m === 1){
    const v = [[130, 20], [215, 90], [130, 160], [45, 90]], c0 = [130, 90];
    let s = poly(v); for (let i = 0; i < 4; i++) s += ticks(v[i], v[(i + 1) % 4]);
    return svg(260, 180, s + side(v[2], v[3], `${g.s}cm`, c0) + tx(c0, '둘레 ?', 'q sm'), '마름모');
  }
  const [a, b] = clampR(g.a, g.b, 2.5), raw = para(a, b, 65), f = fitter(raw, 300, 170, 36), q = raw.map(f), c0 = cen(q);
  return svg(300, 170, poly(q) + side(q[0], q[1], `${g.a}cm`, c0) + side(q[3], q[0], `${g.b}cm`, c0) + ticks(q[0], q[1], 2) + ticks(q[3], q[2], 2) +
    ticks(q[0], q[3]) + ticks(q[1], q[2]) + tx(c0, '둘레 ?', 'q sm'), '평행사변형');
}
// ── 5-1 넓이 ──
function ar1(g){
  const sq = g.m === 2, [w, h] = sq ? [1, 1] : clampR(g.a, g.b, 3), raw = [[0, 0], [w, 0], [w, -h], [0, -h]];
  const f = fitter(raw, 300, 170, 36), q = raw.map(f), c0 = cen(q);
  let s = poly(q) + side(q[0], q[1], `${g.a}cm`, c0) + (sq ? ticks(q[0], q[1]) + ticks(q[1], q[2]) + ticks(q[2], q[3]) + ticks(q[3], q[0]) : side(q[1], q[2], `${g.b}cm`, c0, 22));
  s += rightMark(q[0], q[1], q[3]) + tx(c0, g.m === 1 ? '둘레 ?' : '넓이 ?', 'q sm');
  return svg(300, 170, s, sq ? '정사각형' : '직사각형');
}
function ar2(g){
  const [b, h] = clampR(g.b, g.h, 2.8);
  if (g.m === 0){
    const k = h * .5, raw = [[0, 0], [b, 0], [b + k, -h], [k, -h]], f = fitter(raw, 300, 170, 34), q = raw.map(f), c0 = cen(q), foot = [q[3][0], q[0][1]];
    return svg(300, 170, poly(q) + seg(q[3], foot, 'ln dz') + rightMark(foot, q[1], q[3]) + side(q[0], q[1], `${g.b}cm`, c0) +
      lab(add(mid(q[3], foot), [-22, 0]), `${g.h}cm`) + tx(add(c0, [24, 0]), '넓이 ?', 'q sm'), '평행사변형');
  }
  const raw = [[0, 0], [b, 0], [b * .35, -h]], f = fitter(raw, 300, 170, 34), q = raw.map(f), c0 = cen(q), foot = [q[2][0], q[0][1]];
  return svg(300, 170, poly(q) + seg(q[2], foot, 'ln dz') + rightMark(foot, q[1], q[2]) + side(q[0], q[1], `${g.b}cm`, c0) +
    lab(add(mid(q[2], foot), [-22, 0]), `${g.h}cm`) + tx(add(c0, [30, 8]), '넓이 ?', 'q sm'), '삼각형');
}
function ar3(g){
  if (g.m === 0){
    const [u, h] = clampR(g.u, g.h, 2.8), t = u * g.t / g.u, x0 = (u - t) * .3;
    const raw = [[0, 0], [u, 0], [x0 + t, -h], [x0, -h]], f = fitter(raw, 300, 170, 34), q = raw.map(f), c0 = cen(q), foot = [q[3][0], q[0][1]];
    return svg(300, 170, poly(q) + seg(q[3], foot, 'ln dz') + rightMark(foot, q[1], q[3]) + side(q[0], q[1], `${g.u}cm`, c0) + side(q[3], q[2], `${g.t}cm`, c0) +
      lab(add(mid(q[3], foot), [-22, 0]), `${g.h}cm`) + tx(add(c0, [20, 4]), '넓이 ?', 'q sm'), '사다리꼴');
  }
  const [w, h] = clampR(g.d1, g.d2, 2.5), raw = [[0, -h / 2], [w / 2, 0], [0, h / 2], [-w / 2, 0]], f = fitter(raw, 300, 180, 30), q = raw.map(f), c0 = cen(q);
  return svg(300, 180, poly(q) + seg(q[0], q[2], 'ln dz') + seg(q[1], q[3], 'ln dz') + rightMark(c0, q[1], q[0]) +
    lab(add(mid(c0, q[3]), [0, 14]), `${g.d1}cm`) + lab(add(mid(c0, q[2]), [22, 0]), `${g.d2}cm`) + tx(add(c0, [44, -26]), '넓이 ?', 'q sm'), '마름모');
}
// ── 직육면체 (빗각 겨냥도: 보이지 않는 모서리는 점선) ──
function cuboid(a, b, c, L, hl){
  const [w, d] = clampR(a, b, 3), [, hh] = clampR(w, c, 3), dep = [d * .5 * .72, -d * .5 * .72];
  const F = [[0, 0], [w, 0], [w, -hh], [0, -hh]], B = F.map(p => add(p, dep));
  const f = fitter([...F, ...B], 300, 180, 36), f2 = F.map(f), b2 = B.map(f), c0 = cen([...f2, ...b2]);
  let s = '';
  if (hl === 'top') s += poly([f2[3], f2[2], b2[2], b2[3]], 'hl');
  if (hl === 'front') s += poly(f2, 'hl');
  s += poly(f2, 'fc') + poly([f2[3], f2[2], b2[2], b2[3]], 'fc t') + poly([f2[1], b2[1], b2[2], f2[2]], 'fc r');
  if (hl === 'top') s += poly([f2[3], f2[2], b2[2], b2[3]], 'hl');
  if (hl === 'front') s += poly(f2, 'hl');
  s += seg(b2[0], b2[1], 'ln dz') + seg(b2[0], b2[3], 'ln dz') + seg(f2[0], b2[0], 'ln dz');
  if (L){
    if (L.a) s += side(f2[0], f2[1], L.a, c0);
    if (L.c) s += side(f2[0], f2[3], L.c, c0, 22);
    if (L.b) s += side(f2[1], b2[1], L.b, c0, 18);
  }
  if (hl === 'dots') [...f2, ...b2].forEach(p => { s += dot(p, 4.5, 'dt o'); });
  if (hl === 'vertex') s += dot(f2[2], 6, 'dt o');
  if (hl === 'edges') s += pline([f2[0], f2[1], f2[2], f2[3], f2[0]], 'ln o') + pline([f2[3], b2[3], b2[2], b2[1], f2[1]], 'ln o') + seg(f2[2], b2[2], 'ln o');
  return s;
}
const CBHL = ['front', 'edges', 'dots', 'top', 'top', 'vertex'];
function cb1(g){ return g.cube ? svg(300, 180, cuboid(1, 1, 1, null, CBHL[g.i]), '정육면체') : svg(300, 180, cuboid(5, 4, 3, null, CBHL[g.i]), '직육면체'); }
function cubeOr(g, a, b, c){ return g.s ? cuboid(1, 1, 1, {a:`${g.s}cm`, b:`${g.s}cm`, c:`${g.s}cm`}) : cuboid(a, b, c, {a:`${a}cm`, b:`${b}cm`, c:`${c}cm`}); }
// ── 각기둥·각뿔 ──
function solid(n, pyr){
  const R = 80, r = 26, cx = 150, base = 150, top = 40, ang = i => rad(90 + 360 * i / n + (n % 2 ? 0 : 180 / n));
  const bot = [], tp = [];
  for (let i = 0; i < n; i++){ const a = ang(i); bot.push([cx + R * Math.cos(a), base + r * Math.sin(a)]); tp.push([cx + R * Math.cos(a), top + r * Math.sin(a)]); }
  const back = i => Math.sin(ang(i)) < -1e-6, xs = bot.map(p => p[0]), xl = Math.min(...xs), xr = Math.max(...xs);
  const sil = i => Math.abs(bot[i][0] - xl) < .5 || Math.abs(bot[i][0] - xr) < .5;
  let s = '';
  for (let i = 0; i < n; i++){
    const j = (i + 1) % n, hid = back(i) && back(j) || (back(i) || back(j)) && Math.sin(ang(i)) + Math.sin(ang(j)) < 0;
    s += seg(bot[i], bot[j], hid ? 'ln dz' : 'ln');
    if (!pyr) s += seg(tp[i], tp[j], 'ln');
    const hidV = back(i) && !sil(i);
    s += seg(bot[i], pyr ? [cx, top - 10] : tp[i], hidV ? 'ln dz' : 'ln');
  }
  return svg(300, 185, s, pyr ? '각뿔' : '각기둥');
}
// ── 원 ──
function circle(g, kind){
  const c = [150, 98], R = 66;
  let s = `<circle class="sh" cx="${c[0]}" cy="${c[1]}" r="${R}"/>` + dot(c, 3.5);
  const radius = t => seg(c, [c[0] + R, c[1]]) + lab([c[0] + R / 2, c[1] - 12], t);
  const diam = t => seg([c[0] - R, c[1]], [c[0] + R, c[1]]) + lab([c[0] + R / 2, c[1] - 12], t);
  if (kind === 'ci1') s += (g.byR ? radius(`${g.r}cm`) : diam(`${g.d}cm`)) + tx([c[0], c[1] - R - 14], '원주 ?', 'q sm');
  if (kind === 'ci2') s += (g.askR ? radius('?') : diam('?')) + tx([c[0], c[1] - R - 14], `원주 ${g.C}cm`, 'sm');
  if (kind === 'ci3') s += (g.byD ? diam(`${2 * g.r}cm`) : radius(`${g.r}cm`)) + tx([c[0], c[1] + 30], '넓이 ?', 'q sm');
  return svg(300, 190, s, '원');
}

// ═════ 그림이 있어야 하는 단원 ═════
// 꺾은선그래프: g {ttl, u, step, v[5], mon[5], hl[]}
function lineGraph(g){
  const W = 320, H = 210, x0 = 46, x1 = 306, y0 = 178, y1 = 30, top = Math.ceil(Math.max(...g.v) / g.step + 1) * g.step;
  const X = i => x0 + 22 + i * (x1 - x0 - 44) / (g.v.length - 1), Y = v => y0 - (y0 - y1) * v / top;
  let s = '', every = top / g.step > 8 ? 2 : 1;
  for (let k = 0; k <= top / g.step; k++){
    const y = Y(k * g.step);
    s += seg([x0, y], [x1, y], k ? 'gd' : 'ln');
    if (k % every === 0) s += tx([x0 - 16, y], k * g.step, 'sm');
  }
  s += seg([x0, y0], [x0, y1 - 8], 'ln') + tx([x0 - 6, y1 - 18], `(${g.u})`, 'sm');
  g.mon.forEach((m, i) => { s += tx([X(i), y0 + 16], `${m}월`, 'sm'); });
  s += pline(g.v.map((v, i) => [X(i), Y(v)]), 'ln o');
  g.v.forEach((v, i) => { s += dot([X(i), Y(v)], g.hl.includes(i) ? 6 : 4, g.hl.includes(i) ? 'dt o' : 'dt'); });
  return svg(W, H, s, g.ttl + ' 꺾은선그래프');
}
// 세 변으로 삼각형 (ㄴ 왼쪽 아래, ㄷ 오른쪽 아래, ㄱ 위)
function triBySides(c1, c2, c3){   // c1 = ㄱㄴ, c2 = ㄴㄷ, c3 = ㄷㄱ
  const x = (c1 * c1 + c2 * c2 - c3 * c3) / (2 * c2), y = Math.sqrt(Math.max(1, c1 * c1 - x * x));
  return [[x, -y], [0, 0], [c2, 0]];
}
function triByAngles(A, B){ const C = 180 - A - B, c2 = 10, c1 = c2 * Math.sin(rad(C)) / Math.sin(rad(A)); return [[c1 * Math.cos(rad(B)), -c1 * Math.sin(rad(B))], [0, 0], [c2, 0]]; }
// 합동인 두 삼각형: 둘째는 180° 돌려서 오른쪽에. lab1/lab2: [[변 글자 0,1,2]] 와 [각 글자 0,1,2]
function twoTri(raw, n1, n2, sides1, sides2, ang1, ang2){
  const xs = raw.map(p => p[0]), x1 = Math.max(...xs), w = x1 - Math.min(...xs), y0 = Math.min(...raw.map(p => p[1]));
  // 180° 돌린 삼각형을 오른쪽에 (간격은 폭의 절반), 위아래 높이를 맞춰요
  const sh = raw.map(p => [-p[0] + 2 * x1 + w * .5, -p[1] + y0]);
  const f = fitter([...raw, ...sh], 340, 180, 30), A = raw.map(f), Bp = sh.map(f), cA = cen(A), cB = cen(Bp);
  const draw = (T, c0, names, sides, angs) => {
    let s = poly(T);
    T.forEach((p, i) => { s += tx(add(p, mul(unit(sub(p, c0)), 15)), names[i], 'nm'); });
    [[0, 1], [1, 2], [2, 0]].forEach(([i, j], k) => { if (sides[k]) s += side(T[i], T[j], sides[k], c0, 14); });
    T.forEach((p, i) => { if (angs[i]) s += arc(p, T[(i + 1) % 3], T[(i + 2) % 3], 16, angs[i]); });
    return s;
  };
  return svg(340, 180, draw(A, cA, n1, sides1, ang1) + draw(Bp, cB, n2, sides2, ang2), '합동인 두 삼각형');
}
const N1 = ['ㄱ', 'ㄴ', 'ㄷ'], N2 = ['ㄹ', 'ㅁ', 'ㅂ'];
function sy1(g){ const s1 = [`${g.s[0]}cm`, `${g.s[1]}cm`, `${g.s[2]}cm`], s2 = ['', '', '']; s2[g.k] = '?'; return twoTri(triBySides(...g.s), N1, N2, s1, s2, ['', '', ''], ['', '', '']); }
function sy2(g){ const a2 = ['', '', '']; a2[g.k] = '?'; return twoTri(triByAngles(g.A, g.B), N1, N2, ['', '', ''], ['', '', ''], [`${g.A}°`, `${g.B}°`, ''], a2); }
function sy3(g){
  if (g.m === 0){   // 선대칭 연 모양 ㄱ 위, ㄴ 오른쪽, ㄷ 아래, ㄹ 왼쪽
    const w = Math.min(g.a, g.b) * .6, h1 = Math.sqrt(g.a * g.a - w * w), h2 = Math.sqrt(g.b * g.b - w * w);
    const raw = [[0, -h1], [w, 0], [0, h2], [-w, 0]], f = fitter(raw, 300, 190, 30), q = raw.map(f), c0 = cen(q);
    let s = poly(q) + seg(add(q[0], [0, -12]), add(q[2], [0, 12]), 'ln dz o');
    ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'].forEach((n, i) => { s += tx(add(q[i], mul(unit(sub(q[i], c0)), 15)), n, 'nm'); });
    s += side(q[0], q[3], `${g.a}cm`, c0) + side(q[3], q[2], `${g.b}cm`, c0) + side(g.k ? q[1] : q[0], g.k ? q[2] : q[1], '?', c0);
    return svg(300, 190, s, '선대칭도형');
  }
  const [a, b] = clampR(g.a, g.b, 2.5), raw = para(a, b, 62), f = fitter(raw, 300, 170, 34), q = raw.map(f), c0 = cen(q);   // ㄹ ㄷ ㄴ ㄱ
  let s = poly(q) + dot(c0, 4, 'dt o') + tx(add(c0, [10, 12]), 'ㅇ', 'nm');
  [['ㄹ', 0], ['ㄷ', 1], ['ㄴ', 2], ['ㄱ', 3]].forEach(([n, i]) => { s += tx(add(q[i], mul(unit(sub(q[i], c0)), 15)), n, 'nm'); });
  s += side(q[0], q[1], `${g.a}cm`, c0) + side(q[3], q[0], `${g.b}cm`, c0) + side(g.k ? q[1] : q[3], g.k ? q[2] : q[2], '?', c0);
  return svg(300, 170, s, '점대칭도형');
}
const COLORS = ['#93c5fd', '#fca5a5', '#86efac', '#fde68a', '#c4b5fd'];
// 띠그래프 g {names[], p[], h}
function band(g){
  let x = 12, s = '';
  g.p.forEach((p, i) => {
    const w = 296 * p / 100;
    s += `<rect x="${R1(x)}" y="58" width="${R1(w)}" height="46" fill="${COLORS[i]}" class="bx"/>`;
    s += tx([x + w / 2, 42], g.names[i], 'sm') + lab([x + w / 2, 81], i === g.h ? '?' : `${p}%`);
    x += w;
  });
  return svg(320, 130, s + tx([160, 120], '(전체 100%)', 'sm'), '띠그래프');
}
// 원그래프 g {names[], p[]}
function pie(g){
  const c = [150, 100], R = 82;
  let a0 = -90, s = '';
  g.p.forEach((p, i) => {
    const a1 = a0 + 360 * p / 100, A = [c[0] + R * Math.cos(rad(a0)), c[1] + R * Math.sin(rad(a0))], B = [c[0] + R * Math.cos(rad(a1)), c[1] + R * Math.sin(rad(a1))];
    s += `<path d="M${P(c)} L${P(A)} A${R} ${R} 0 ${p > 50 ? 1 : 0} 1 ${P(B)} Z" fill="${COLORS[i]}" class="bx"/>`;
    const m = rad((a0 + a1) / 2), L = [c[0] + R * .6 * Math.cos(m), c[1] + R * .6 * Math.sin(m)];
    s += tx(add(L, [0, -8]), g.names[i], 'sm') + tx(add(L, [0, 9]), `${p}%`, 'sm');
    a0 = a1;
  });
  return svg(300, 200, s, '원그래프');
}
// 쌓기나무 (등각 그림). cols[j][i] = 높이, j 0 이 뒤
function iso(cols, W, H){
  const cubes = [];
  cols.forEach((row, j) => row.forEach((h, i) => { for (let k = 0; k < h; k++) cubes.push([i, j, k]); }));
  const pr = (i, j, k) => [(i - j) * .866, (i + j) * .5 - k];
  const corners = cubes.flatMap(([i, j, k]) => [pr(i, j, k), pr(i + 1, j, k), pr(i, j + 1, k), pr(i + 1, j + 1, k), pr(i, j, k + 1), pr(i + 1, j + 1, k + 1), pr(i + 1, j, k + 1), pr(i, j + 1, k + 1)]);
  const f = fitter(corners, W, H, 14);
  cubes.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]);
  let s = '';
  cubes.forEach(([i, j, k]) => {
    const p = (a, b, c) => f(pr(a, b, c));
    s += poly([p(i, j, k + 1), p(i + 1, j, k + 1), p(i + 1, j + 1, k + 1), p(i, j + 1, k + 1)], 'cu t');
    s += poly([p(i, j + 1, k), p(i + 1, j + 1, k), p(i + 1, j + 1, k + 1), p(i, j + 1, k + 1)], 'cu l');
    s += poly([p(i + 1, j, k), p(i + 1, j + 1, k), p(i + 1, j + 1, k + 1), p(i + 1, j, k + 1)], 'cu r');
  });
  return s;
}
function st1(g){
  const R = g.grid.length, C = g.grid[0].length, cs = 34, gx = 196, gy = 40;
  let s = `<g transform="translate(0,0)">${iso(g.grid, 180, 190)}</g>`;
  g.grid.forEach((row, j) => row.forEach((h, i) => {
    s += `<rect x="${gx + i * cs}" y="${gy + j * cs}" width="${cs}" height="${cs}" class="${h ? 'sh' : 'bx0'}"/>`;
    if (h) s += tx([gx + i * cs + cs / 2, gy + j * cs + cs / 2], h);
  }));
  s += tx([gx + C * cs / 2, gy + R * cs + 16], '앞', 'sm') + tx([gx + C * cs / 2, gy - 14], '위에서 본 모양', 'sm');
  return svg(320, 190, s, '쌓기나무');
}
function st2(g){ return svg(300, 190, iso([g.h], 300, 190), '쌓기나무'); }
// 원기둥 전개도
function cy1(g){
  const k = 150 / (2 * Math.PI * g.r), rr = Math.max(10, g.r * k), W = 2 * Math.PI * rr, hh = Math.max(36, Math.min(110, g.h * k * 1.3));
  const x0 = (320 - W) / 2, y0 = 12 + 2 * rr + 2, cx = x0 + W * .3;
  let s = `<rect x="${R1(x0)}" y="${R1(y0)}" width="${R1(W)}" height="${R1(hh)}" class="sh"/>`;
  s += `<circle cx="${R1(cx)}" cy="${R1(y0 - rr)}" r="${R1(rr)}" class="sh"/><circle cx="${R1(cx)}" cy="${R1(y0 + hh + rr)}" r="${R1(rr)}" class="sh"/>`;
  s += seg([cx, y0 - rr], [cx + rr, y0 - rr]) + dot([cx, y0 - rr], 2.5) + lab([cx + rr + 26, y0 - rr - 6], `${g.r}cm`);
  s += lab([x0 + W + 24, y0 + hh / 2], `${g.h}cm`) + seg([x0, y0 + hh + 2 * rr + 14], [x0 + W, y0 + hh + 2 * rr + 14], 'ln thin') + lab([x0 + W * .75, y0 + hh + 2 * rr + 26], '?');
  const H = y0 + hh + 2 * rr + 36;
  return svg(320, R1(H), s, '원기둥의 전개도');
}
function cy2(g){
  const c = [150, 160], R = 80, ry = 22, ap = [150, 22];
  let s = `<path class="sh" d="M${P([c[0] - R, c[1]])} L${P(ap)} L${P([c[0] + R, c[1]])} A${R} ${ry} 0 0 1 ${P([c[0] - R, c[1]])} Z"/>`;
  s += `<path class="ln dz" d="M${P([c[0] - R, c[1]])} A${R} ${ry} 0 0 1 ${P([c[0] + R, c[1]])}"/>`;
  s += seg(ap, c, 'ln dz') + rightMark(c, [c[0] + 10, c[1]], ap) + seg(c, [c[0] + R, c[1]], 'ln thin') + dot(c, 3);
  s += lab([c[0] - 18, (ap[1] + c[1]) / 2], `${g.t[1]}cm`) + lab([c[0] + R / 2 + 34, (ap[1] + c[1]) / 2 - 6], `${g.t[2]}cm`) + lab([c[0] + R / 2, c[1] + 12], `${g.t[0]}cm`);
  return svg(300, 195, s, '원뿔');
}
function cy3(g){
  const c = [150, 98], R = 72;
  let s = `<circle class="sh" cx="${c[0]}" cy="${c[1]}" r="${R}"/><path class="ln dz" d="M${c[0] - R} ${c[1]} A${R} 20 0 0 1 ${c[0] + R} ${c[1]}"/>`;
  s += `<path class="ln" d="M${c[0] - R} ${c[1]} A${R} 20 0 0 0 ${c[0] + R} ${c[1]}"/>` + dot(c, 3.5);
  if (g.m === 1) s += seg([c[0] - R, c[1]], [c[0] + R, c[1]]) + lab([c[0] - R / 2, c[1] - 12], `${2 * g.r}cm`);
  else s += seg(c, [c[0] + R, c[1]]) + lab([c[0] + R / 2, c[1] - 12], `${g.r}cm`);
  return svg(300, 190, s, '구');
}

const FIG = {
  pg1: p => pg1(p.g), pg2: p => pg2(p.g), pg3: p => pg3(p.g),
  ar1: p => ar1(p.g), ar2: p => ar2(p.g), ar3: p => ar3(p.g),
  cb1: p => cb1(p.g), cb2: p => svg(300, 180, cubeOr(p.g, p.g.a, p.g.b, p.g.c), '직육면체'),
  vb1: p => svg(300, 180, cubeOr({}, p.g.a, p.g.b, p.g.c), '직육면체'), vb3: p => svg(300, 180, cubeOr({}, p.g.a, p.g.b, p.g.c), '직육면체'),
  vb2: p => svg(300, 180, cubeOr({s:p.g.s}), '정육면체'),
  pm1: p => solid(p.g.n, false), pm2: p => solid(p.g.n, true),
  ci1: p => circle(p.g, 'ci1'), ci2: p => circle(p.g, 'ci2'), ci3: p => circle(p.g, 'ci3'),
  lg1: p => lineGraph(p.g), lg2: p => lineGraph(p.g),
  sy1: p => sy1(p.g), sy2: p => sy2(p.g), sy3: p => sy3(p.g),
  gr1: p => band(p.g), gr2: p => pie(p.g),
  st1: p => st1(p.g), st2: p => st2(p.g),
  cy1: p => cy1(p.g), cy2: p => cy2(p.g), cy3: p => cy3(p.g),
};
function draw(p){ const f = p && p.x && FIG[p.x]; return f ? f(p) : ''; }

window.MathFig = {draw, has: x => !!FIG[x]};
})();
