/* =====================================================================
   워드 아일랜드 · 수학 더 배우기 (4학년 2학기 도형 ~ 6학년 2학기)
   - DOM 을 안 건드려요. 문제는 {x, say, eq, ans, g} (JSON 으로 저장해도 돼요)
     x: 문제 유형 (스테이지 id 'm-dm3' 이면 'dm3'), say: 작은 안내 글, eq: 큰 식 (QS 자리가 답),
     ans: 정답 값, g: 힌트·오답을 만들 때 쓰는 재료
   - 값: {t:'q', n, d, f, u} 정확한 분수값 (f: 'i' 자연수, 'f' 분수, 'd' 소수, 'p' 백분율, u: 단위)
         {t:'r', a, b} 비 (a : b, 정확히 같아야 같은 비예요)
     MathCore.same / html / text / bat 가 이 값들을 알아봐요
   - 힌트는 블록 대신 "풀이 노트" 단계 (단계마다 보기 3개, 마지막 단계의 답 = 정답)
   ===================================================================== */
(function(){
const M = window.MathCore;
const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));   // lo..hi 포함
const pick = a => a[rnd(0, a.length - 1)];
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => a / gcd(a, b) * b;
const P10 = e => Math.pow(10, e);

// ── 값 만들기 ──
function Q(n, d, f, u){
  if (d < 0){ n = -n; d = -d; }
  const g = gcd(n, d) || 1; n /= g; d /= g;
  const v = {t:'q', n, d, f: f === 'i' && d !== 1 ? 'f' : f || (d === 1 ? 'i' : 'f')};
  if (u) v.u = u;
  return v;
}
const N = (n, u) => Q(n, 1, 'i', u);                       // 자연수
const Fr = (n, d, u) => Q(n, d, 'f', u);                   // 분수 (가분수는 대분수로 보여요)
const Dn = (x, u) => Q(Math.round(x * 10000), 10000, 'd', u);   // 소수
const R = (a, b) => ({t:'r', a, b});                        // 비

// ── 글자 조각 ──
const QS = '<span class="co">?</span>';                     // 답 자리
const fr = (t, b) => `<span class="mf"><span>${t}</span><span class="md">${b}</span></span>`;
const mix = (w, t, b) => `<span class="mx">${w}${fr(t, b)}</span>`;
const H = v => M.html(v);
const ds = (X, pl) => M.text(Dn(X / P10(pl)));             // 정수 X 를 소수 pl 자리로 ("235", 2 → "2.35")
const last = n => String(n).slice(-1);
const jn = (n, a, b) => '013678'.includes(last(n)) ? a : b;         // 숫자 뒤 조사 (받침 있으면 a)
const jro = n => '036'.includes(last(n)) ? '으로' : '로';             // 1·7·8 (ㄹ 받침) 과 받침 없는 수는 '로'
const KO = ['', '한', '두', '세', '네'];
const S = (say, eq, ans, alt) => ({say, eq, ans, alt: alt || []});
const tbl = (xs, ys) => `<table class="mtb"><tr><th>□</th>${xs.map(v => `<td>${v}</td>`).join('')}</tr>` +
  `<tr><th>△</th>${ys.map(v => `<td>${v}</td>`).join('')}</tr></table>`;
function decInt(lo, hi){ let x; do x = rnd(lo, hi); while (x % 10 === 0); return x; }   // 끝자리가 0 이 아닌 수
function coprimeBelow(b){ let a; do a = rnd(1, b - 1); while (gcd(a, b) !== 1); return a; }   // 기약 진분수의 분자
const divs = n => { const o = []; for (let i = 1; i <= n; i++) if (n % i === 0) o.push(i); return o; };

/* ── 유형 표 ──
   gen()      → {say, eq, ans, g}
   wrong(p)   → [[값, 왜 틀렸나], …]  흔한 실수 (보기와 "아까 고른 건…" 설명에 써요)
   hint(p)    → [S(say, eq, 답, 보기 후보), …]  마지막 단계의 답은 p.ans
   valid(p,v) → false 면 그 값은 보기로 못 써요 (예: 약수 문제에 다른 약수)
   why(p,w)   → wrong 에 없는 오답 설명 (있을 때만)
   zero       → 0 도 보기로 써요 */
const T = {};

// ═════ 4-2 삼각형 · 사각형 · 다각형 (그림 없이 숫자로) ═════
T.pg1 = {
  tip:'💡 삼각형의 세 각을 모두 더하면 180°예요. 이등변삼각형은 두 밑각의 크기가 같아요!',
  gen(){
    const say = '이등변삼각형은 두 밑각의 크기가 같아요';
    if (rnd(0, 1)){ const t = rnd(2, 14) * 10; return {say, eq:`꼭지각 ${t}° → 밑각 ${QS}`, ans:N((180 - t) / 2, '°'), g:{t}}; }
    const b = rnd(6, 16) * 5;
    return {say, eq:`밑각 ${b}° → 꼭지각 ${QS}`, ans:N(180 - 2 * b, '°'), g:{b}};
  },
  wrong(p){
    const {t, b} = p.g;
    return t ? [[N(180 - t, '°'), '두 밑각을 더한 크기예요. 2로 나눠야 해요'], [N(t, '°'), '꼭지각과 밑각은 크기가 달라요']]
             : [[N(180 - b, '°'), '밑각이 2개라는 걸 잊었어요'], [N(b, '°'), '밑각과 꼭지각은 크기가 달라요']];
  },
  hint(p){
    const {t, b} = p.g, sum = S('삼각형의 세 각을 모두 더하면 몇 도일까요?', `세 각의 합 = ${QS}`, N(180, '°'), [N(360, '°'), N(90, '°')]);
    if (t) return [sum, S('꼭지각을 빼면 두 밑각의 합이 남아요.', `180° − ${t}° = ${QS}`, N(180 - t, '°')),
      S('두 밑각은 크기가 같으니까 2로 나눠요.', `${180 - t}° ÷ 2 = ${QS}`, p.ans)];
    return [sum, S('밑각은 2개예요. 두 밑각을 더하면?', `${b}° × 2 = ${QS}`, N(2 * b, '°')),
      S('180°에서 두 밑각의 합을 빼요.', `180° − ${2 * b}° = ${QS}`, p.ans)];
  },
};
const POLY = [[3, '정삼각형'], [4, '정사각형'], [5, '정오각형'], [6, '정육각형'], [8, '정팔각형']];
T.pg2 = {
  tip:'💡 정다각형은 변의 길이가 모두 같아요. 둘레 = 한 변 × 변의 수!',
  gen(){
    const [n, nm] = pick(POLY), s = rnd(2, 15);
    if (rnd(0, 1)) return {say:`한 변이 ${s}cm인 ${nm}이에요`, eq:`둘레 = ${QS}`, ans:N(n * s, 'cm'), g:{n, nm, s, m:'p'}};
    return {say:`둘레가 ${n * s}cm인 ${nm}이에요`, eq:`한 변 = ${QS}`, ans:N(s, 'cm'), g:{n, nm, s, m:'s'}};
  },
  wrong(p){
    const {n, s, m} = p.g;
    if (m === 'p') return [[N(s * (n - 1), 'cm'), '변 하나를 빠뜨렸어요. 변의 수를 다시 세어 봐요'], [N(s + n, 'cm'), '더하지 말고 곱해요']];
    const o = [[N(n * s - n, 'cm'), '빼지 말고 나눠요']];
    if ((n * s) % (n - 1) === 0) o.push([N(n * s / (n - 1), 'cm'), '변의 수를 다시 세어 봐요']);
    return o;
  },
  hint(p){
    const {n, nm, s, m} = p.g;
    return [S(`${nm}의 변은 몇 개일까요?`, `변의 수 = ${QS}`, N(n, '개'), [N(n - 1, '개'), N(n + 1, '개')]),
      m === 'p' ? S('변의 길이가 모두 같으니까 곱해요.', `${s}cm × ${n} = ${QS}`, p.ans)
                : S('둘레를 변의 수로 똑같이 나눠요.', `${n * s}cm ÷ ${n} = ${QS}`, p.ans)];
  },
};
T.pg3 = {
  tip:'💡 평행사변형은 이웃한 두 각의 합이 180°이고 마주 보는 변의 길이가 같아요. 마름모는 네 변의 길이가 모두 같아요!',
  gen(){
    const m = rnd(0, 2);
    if (m === 0){ let a; do a = rnd(10, 26) * 5; while (a === 90); return {say:`평행사변형의 한 각이 ${a}°예요`, eq:`이웃한 각 = ${QS}`, ans:N(180 - a, '°'), g:{m, a}}; }
    if (m === 1){ const s = rnd(3, 15); return {say:`한 변이 ${s}cm인 마름모예요`, eq:`둘레 = ${QS}`, ans:N(4 * s, 'cm'), g:{m, s}}; }
    const a = rnd(3, 15); let b; do b = rnd(3, 15); while (b === a);
    return {say:`두 변의 길이가 ${a}cm, ${b}cm인 평행사변형이에요`, eq:`둘레 = ${QS}`, ans:N(2 * (a + b), 'cm'), g:{m, a, b}};
  },
  wrong(p){
    const {m, a, b, s} = p.g;
    if (m === 0) return [[N(a, '°'), '마주 보는 각과 헷갈렸어요'], [N(360 - a, '°'), '이웃한 두 각의 합은 180°예요']];
    if (m === 1) return [[N(2 * s, 'cm'), '마름모의 변은 4개예요'], [N(s + 4, 'cm'), '더하지 말고 곱해요']];
    return [[N(a + b, 'cm'), '마주 보는 변도 더해야 해요'], [N(a * b, 'cm'), '둘레는 곱하지 않고 더해요']];
  },
  hint(p){
    const {m, a, b, s} = p.g;
    if (m === 0) return [S('평행사변형에서 이웃한 두 각을 더하면 몇 도일까요?', `이웃한 두 각의 합 = ${QS}`, N(180, '°'), [N(360, '°'), N(90, '°')]),
      S(`180°에서 ${a}°를 빼요.`, `180° − ${a}° = ${QS}`, p.ans)];
    if (m === 1) return [S('마름모의 변은 몇 개일까요?', `변의 수 = ${QS}`, N(4, '개'), [N(3, '개'), N(2, '개')]),
      S('네 변의 길이가 모두 같으니까 곱해요.', `${s}cm × 4 = ${QS}`, p.ans)];
    return [S('이웃한 두 변을 더해요.', `${a}cm + ${b}cm = ${QS}`, N(a + b, 'cm')),
      S('마주 보는 변은 길이가 같으니까 2배 해요.', `${a + b}cm × 2 = ${QS}`, p.ans)];
  },
};

// ═════ 5-1 자연수의 혼합 계산 ═════
// 식 하나 = {e: 식 글자, st: [[말, 계산, 값], …] 계산 순서대로, w: [[값, 왜]]}
const mxT = gens => ({
  tip:'💡 계산 순서: ① 괄호 안 ② 곱셈·나눗셈 ③ 덧셈·뺄셈. 같은 순서끼리는 앞에서부터 차례로!',
  gen(){
    for (;;){
      const f = pick(gens)();
      if (f) return {say:'계산 순서를 생각하며 풀어요', eq:`${f.e} = ${QS}`, ans:N(f.st[f.st.length - 1][2]), g:f};
    }
  },
  wrong(p){ return p.g.w.filter(x => Number.isInteger(x[0]) && x[0] >= 0).map(x => [N(x[0]), x[1]]); },
  hint(p){ return p.g.st.map(s => S(s[0], `${s[1]} = ${QS}`, N(s[2]))); },
});
T.mx1 = mxT([
  () => { const b = rnd(10, 40), c = rnd(10, 40), a = rnd(b + c + 5, 99);
    return {e:`${a} − (${b} + ${c})`, st:[['괄호 안을 먼저 계산해요.', `${b} + ${c}`, b + c], ['이제 앞의 수에서 빼요.', `${a} − ${b + c}`, a - b - c]],
            w:[[a - b + c, '괄호 안을 먼저 계산하지 않았어요']]}; },
  () => { const a = rnd(40, 99), b = rnd(10, a - 10), c = rnd(10, 50);
    return {e:`${a} − ${b} + ${c}`, st:[['덧셈과 뺄셈만 있으면 앞에서부터 차례로 계산해요.', `${a} − ${b}`, a - b], ['그다음 더해요.', `${a - b} + ${c}`, a - b + c]],
            w:[[a - b - c, '뒤의 덧셈을 먼저 계산했어요']]}; },
  () => { const c = rnd(5, 30), b = rnd(c + 5, 60), a = rnd(b - c + 5, 99);
    return {e:`${a} − (${b} − ${c})`, st:[['괄호 안을 먼저 계산해요.', `${b} − ${c}`, b - c], ['이제 앞의 수에서 빼요.', `${a} − ${b - c}`, a - b + c]],
            w:[[a - b - c, '괄호 안을 먼저 계산하지 않았어요']]}; },
]);
T.mx2 = mxT([
  () => { const b = rnd(2, 9), k = rnd(2, 12), c = rnd(2, 9), a = b * k;
    return {e:`${a} ÷ ${b} × ${c}`, st:[['곱셈과 나눗셈만 있으면 앞에서부터 차례로 계산해요.', `${a} ÷ ${b}`, k], ['그다음 곱해요.', `${k} × ${c}`, k * c]],
            w:a % (b * c) === 0 ? [[a / (b * c), '뒤의 곱셈을 먼저 계산했어요']] : []}; },
  () => { const b = rnd(2, 6), c = rnd(2, 6), k = rnd(2, 9), a = b * c * k;
    return {e:`${a} ÷ (${b} × ${c})`, st:[['괄호 안을 먼저 계산해요.', `${b} × ${c}`, b * c], ['이제 나눠요.', `${a} ÷ ${b * c}`, k]],
            w:[[a / b * c, '괄호 안을 먼저 계산하지 않았어요']]}; },
  () => { const a = rnd(2, 12), b = rnd(2, 9), c = rnd(2, 9);
    if ((a * b) % c) return null;
    return {e:`${a} × ${b} ÷ ${c}`, st:[['앞에서부터 차례로 계산해요.', `${a} × ${b}`, a * b], ['그다음 나눠요.', `${a * b} ÷ ${c}`, a * b / c]],
            w:[[a * b, '나누는 걸 잊었어요']]}; },
]);
T.mx3 = mxT([
  () => { const a = rnd(5, 50), b = rnd(2, 9), c = rnd(2, 9);
    return {e:`${a} + ${b} × ${c}`, st:[['곱셈을 덧셈보다 먼저 계산해요.', `${b} × ${c}`, b * c], ['그다음 더해요.', `${a} + ${b * c}`, a + b * c]],
            w:[[(a + b) * c, '앞에서부터 계산했어요. 곱셈이 먼저예요']]}; },
  () => { const c = rnd(2, 9), k = rnd(2, 9), b = c * k, a = rnd(k + 5, 60);
    return {e:`${a} − ${b} ÷ ${c}`, st:[['나눗셈을 뺄셈보다 먼저 계산해요.', `${b} ÷ ${c}`, k], ['그다음 빼요.', `${a} − ${k}`, a - k]],
            w:a > b && (a - b) % c === 0 ? [[(a - b) / c, '앞에서부터 계산했어요. 나눗셈이 먼저예요']] : []}; },
  () => { const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 6), s = a + b, d = rnd(1, Math.min(30, s * c - 1));
    return {e:`(${a} + ${b}) × ${c} − ${d}`, st:[['괄호 안을 먼저 계산해요.', `${a} + ${b}`, s], ['곱셈을 그다음에 계산해요.', `${s} × ${c}`, s * c], ['마지막으로 빼요.', `${s * c} − ${d}`, s * c - d]],
            w:[[a + b * c - d, '괄호 안을 먼저 계산하지 않았어요']]}; },
  () => { const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9), d = rnd(2, 9);
    if (a * b <= c * d) return null;
    return {e:`${a} × ${b} − ${c} × ${d}`, st:[['곱셈을 먼저 계산해요. 앞의 곱셈부터!', `${a} × ${b}`, a * b], ['뒤의 곱셈도 계산해요.', `${c} × ${d}`, c * d], ['마지막으로 빼요.', `${a * b} − ${c * d}`, a * b - c * d]],
            w:[[(a * b - c) * d, '앞에서부터 계산했어요. 곱셈이 먼저예요']]}; },
]);

// ═════ 5-1 약수와 배수 ═════
const DIVN = [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60];
T.dm1 = {
  tip:'💡 어떤 수를 나누어떨어지게 하는 수가 그 수의 약수예요. 1과 자기 자신도 약수예요!',
  gen(){ const n = pick(DIVN), d = pick(divs(n).filter(x => x > 1 && x < n)); return {say:'약수를 찾아 잡아요', eq:`${n}의 약수 = ${QS}`, ans:N(d), g:{n, d}}; },
  valid(p, v){ return v.t === 'q' && v.d === 1 && p.g.n % v.n !== 0; },
  wrong(p){ const {n, d} = p.g; return [[N(2 * n), `${n}의 배수예요. 약수는 ${n}보다 클 수 없어요`], [N(d + 1), '나누면 나머지가 생겨요']]; },
  why(p, w){ if (w.t === 'q' && w.d === 1 && p.g.n % w.n) return `${p.g.n}${jn(p.g.n, '을', '를')} ${w.n}${jro(w.n)} 나누면 나머지가 생겨요. 나누어떨어져야 약수예요`; },
  hint(p){
    const {n, d} = p.g;
    return [S(`${n}${jn(n, '을', '를')} ${d}${jro(d)} 나눠 봐요.`, `${n} ÷ ${d} = ${QS}`, N(n / d)),
      S('나머지 없이 나누어떨어지니까 약수예요! 약수는 어느 것일까요?', p.eq, p.ans)];
  },
};
T.dm2 = {
  tip:'💡 어떤 수에 1, 2, 3, …을 곱한 수가 그 수의 배수예요!',
  gen(){ const k = rnd(3, 12), m = rnd(2, 9); return {say:'배수를 찾아 잡아요', eq:`${k}의 배수 = ${QS}`, ans:N(k * m), g:{k, m}}; },
  valid(p, v){ return v.t === 'q' && v.d === 1 && v.n % p.g.k !== 0; },
  wrong(p){
    const {k, m} = p.g, o = [], dv = divs(k).filter(x => x > 1 && x < k);
    if (dv.length) o.push([N(dv[dv.length - 1]), `${k}의 약수예요. 배수와 헷갈렸어요`]);
    o.push([N(k * m + 1), `${k}${jro(k)} 나누어떨어지지 않아요`]);
    return o;
  },
  why(p, w){ const k = p.g.k; if (w.t === 'q' && w.d === 1 && w.n % k) return `${w.n}${jn(w.n, '은', '는')} ${k}${jro(k)} 나누어떨어지지 않아서 ${k}의 배수가 아니에요`; },
  hint(p){
    const {k, m} = p.g;
    return [S(`${k}의 배수는 ${k}에 1, 2, 3, …을 곱한 수예요. ${k} × 1은?`, `${k} × 1 = ${QS}`, N(k)),
      S(`${k}에 ${m}${jn(m, '을', '를')} 곱하면?`, `${k} × ${m} = ${QS}`, p.ans)];
  },
};
function gcdPair(gLo, gHi, cap){
  for (;;){
    const g = rnd(gLo, gHi), x = rnd(2, 9), y = rnd(2, 9);
    if (x !== y && gcd(x, y) === 1 && g * x <= 99 && g * y <= 99 && g * x * y <= cap) return {g, x, y, a:g * x, b:g * y};
  }
}
T.dm3 = {
  tip:'💡 두 수를 함께 나누어떨어지게 하는 수가 공약수, 그중 가장 큰 수가 최대공약수예요!',
  gen(){ const q = gcdPair(2, 12, 1e9); return {say:'두 수의 최대공약수를 구해요', eq:`${q.a}${jn(q.a, '과', '와')} ${q.b}의 최대공약수 = ${QS}`, ans:N(q.g), g:q}; },
  wrong(p){
    const {g, x, y} = p.g, o = [[N(g * x * y), '최소공배수와 헷갈렸어요']];
    const dv = divs(g).filter(d => d > 1 && d < g);
    if (dv.length) o.push([N(dv[dv.length - 1]), '공약수이지만 가장 큰 공약수는 아니에요']);
    o.push([N(1), '1보다 큰 공약수도 있어요']);
    return o;
  },
  hint(p){
    const {g, x, y, a, b} = p.g;
    return [S(`${a}${jn(a, '을', '를')} ${g}${jro(g)} 나눠 봐요.`, `${a} ÷ ${g} = ${QS}`, N(x)),
      S(`${b}도 ${g}${jro(g)} 나눠 봐요.`, `${b} ÷ ${g} = ${QS}`, N(y)),
      S(`몫 ${x}${jn(x, '과', '와')} ${y}${jn(y, '은', '는')} 1 말고는 함께 나누는 수가 없어요. 그래서 최대공약수는?`, p.eq, p.ans)];
  },
};
T.dm4 = {
  tip:'💡 두 수의 공통인 배수가 공배수, 그중 가장 작은 수가 최소공배수예요. 최대공약수 × 두 몫으로 구할 수 있어요!',
  gen(){ const q = gcdPair(2, 6, 150); return {say:'두 수의 최소공배수를 구해요', eq:`${q.a}${jn(q.a, '과', '와')} ${q.b}의 최소공배수 = ${QS}`, ans:N(q.g * q.x * q.y), g:q}; },
  wrong(p){
    const {g, x, y, a, b} = p.g, l = g * x * y, o = [];
    if (a * b !== l) o.push([N(a * b), '공배수이지만 가장 작은 공배수는 아니에요']);
    o.push([N(g), '최대공약수와 헷갈렸어요'], [N(2 * l), '공배수이지만 가장 작은 공배수는 아니에요']);
    return o;
  },
  hint(p){
    const {g, x, y, a, b} = p.g;
    return [S('먼저 두 수의 최대공약수를 구해요.', `${a}, ${b}의 최대공약수 = ${QS}`, N(g)),
      S('최대공약수로 나눈 몫을 구해요.', `${a} ÷ ${g} = ${QS}`, N(x)),
      S('다른 수도 나눠요.', `${b} ÷ ${g} = ${QS}`, N(y)),
      S('최대공약수와 두 몫을 모두 곱하면 최소공배수!', `${g} × ${x} × ${y} = ${QS}`, p.ans)];
  },
};

// ═════ 5-1 규칙과 대응 ═════
const crSay = '□와 △ 사이의 대응 규칙을 찾아요';
T.cr1 = {
  tip:'💡 □가 1씩 커질 때 △가 얼마씩 커지는지 보면 규칙이 보여요. △ = □ × (몇)!',
  gen(){ const k = rnd(2, 9), m = rnd(5, 12); return {say:crSay, eq:tbl([1, 2, 3, m], [k, 2 * k, 3 * k, QS]), ans:N(k * m), g:{k, m}}; },
  wrong(p){ const {k, m} = p.g; return [[N(m + k), '더하는 규칙이 아니라 곱하는 규칙이에요'], [N(k * (m + 1)), '□의 수를 다시 확인해요'], [N(k * (m - 1)), '□의 수를 다시 확인해요']]; },
  hint(p){
    const {k, m} = p.g;
    return [S(`□가 1일 때 △는 ${k}, □가 2일 때 △는 ${2 * k}${jn(2 * k, '이에요', '예요')}. △는 □의 몇 배일까요?`, `△ = □ × ${QS}`, N(k)),
      S(`□가 ${m}이면 △는?`, `${m} × ${k} = ${QS}`, p.ans)];
  },
};
T.cr2 = {
  tip:'💡 □와 △의 차이가 늘 같으면 더하거나 빼는 규칙이에요!',
  gen(){
    const k = rnd(2, 15), plus = rnd(0, 1), s = plus ? rnd(1, 10) : rnd(k + 1, k + 10), m = s + rnd(4, 15);
    const f = x => plus ? x + k : x - k;
    return {say:crSay, eq:tbl([s, s + 1, s + 2, m], [f(s), f(s + 1), f(s + 2), QS]), ans:N(f(m)), g:{k, plus, s, m}};
  },
  wrong(p){
    const {k, plus, m} = p.g;
    return plus ? [[N(m - k), '△가 □보다 커요. 더해야 해요'], [N(m * k), '곱하는 규칙이 아니에요']]
                : [[N(m + k), '△가 □보다 작아요. 빼야 해요'], [N(m * k), '곱하는 규칙이 아니에요']];
  },
  hint(p){
    const {k, plus, s, m} = p.g, t = plus ? s + k : s - k;
    return [S(`□가 ${s}일 때 △는 ${t}${jn(t, '이에요', '예요')}. △는 □보다 얼마나 ${plus ? '클까요' : '작을까요'}?`, `△ = □ ${plus ? '+' : '−'} ${QS}`, N(k)),
      S(`□가 ${m}이면 △는?`, `${m} ${plus ? '+' : '−'} ${k} = ${QS}`, p.ans)];
  },
};
T.cr3 = {
  tip:'💡 규칙을 거꾸로 쓰면 □를 찾을 수 있어요. 곱하는 규칙이면 거꾸로는 나눠요!',
  gen(){ const k = rnd(2, 9), m = rnd(5, 12); return {say:crSay, eq:tbl([1, 2, 3, QS], [k, 2 * k, 3 * k, k * m]), ans:N(m), g:{k, m}}; },
  wrong(p){ const {k, m} = p.g; return [[N(k * m - k), '빼지 말고 나눠요'], [N(k * m + k), '거꾸로는 나눠요'], [N(m + 1), '다시 나눠 봐요']]; },
  hint(p){
    const {k, m} = p.g;
    return [S(`□가 1일 때 △는 ${k}${jn(k, '이에요', '예요')}. △는 □의 몇 배일까요?`, `△ = □ × ${QS}`, N(k)),
      S('□를 찾으려면 거꾸로 나눠요.', `${k * m} ÷ ${k} = ${QS}`, p.ans)];
  },
};

// ═════ 5-1 약분과 통분 ═════
T.rc1 = {
  tip:'💡 분모와 분자에 같은 수를 곱하거나, 같은 수로 나누면 크기가 같은 분수가 돼요!',
  gen(){
    const b = rnd(2, 9), a = coprimeBelow(b), k = rnd(2, 6), B = b * k, up = rnd(0, 1);
    return up ? {say:'크기가 같은 분수를 만들어요', eq:`${fr(a, b)} = ${fr(QS, B)}`, ans:N(a * k), g:{a, b, k, up}}
              : {say:'크기가 같은 분수를 만들어요', eq:`${fr(a * k, B)} = ${fr(QS, b)}`, ans:N(a), g:{a, b, k, up}};
  },
  wrong(p){
    const {a, b, k, up} = p.g, B = b * k;
    if (up) return [[N(a + B - b), '분모에 더한 만큼 분자에 더했어요. 같은 수를 곱해야 해요'], [N(a), '분자에도 같은 수를 곱해야 해요']];
    return [[N(a * k - (B - b)), '빼지 말고 같은 수로 나눠요'], [N(a * k), '분자도 같은 수로 나눠야 해요']];
  },
  hint(p){
    const {a, b, k, up} = p.g, B = b * k;
    if (up) return [S(`분모 ${b}에 몇을 곱하면 ${B}${jn(B, '이', '가')} 될까요?`, `${b} × ${QS} = ${B}`, N(k)),
      S('분자에도 같은 수를 곱해요.', `${a} × ${k} = ${QS}`, p.ans)];
    return [S(`분모 ${B}${jn(B, '을', '를')} 몇으로 나누면 ${b}${jn(b, '이', '가')} 될까요?`, `${B} ÷ ${QS} = ${b}`, N(k)),
      S('분자도 같은 수로 나눠요.', `${a * k} ÷ ${k} = ${QS}`, p.ans)];
  },
};
T.rc2 = {
  tip:'💡 분모와 분자를 최대공약수로 나누면 더 이상 약분할 수 없는 기약분수가 돼요!',
  gen(){ const b = rnd(3, 12), a = coprimeBelow(b), k = rnd(2, 6); return {say:'기약분수로 나타내요', eq:`${fr(a * k, b * k)} = ${QS}`, ans:Fr(a, b), g:{a, b, k}}; },
  wrong(p){
    const {a, b, k} = p.g;
    return [[Fr(a * k, b), '분모만 나눴어요. 분자도 같은 수로 나눠요'], [Fr(a, b * k), '분자만 나눴어요. 분모도 같은 수로 나눠요'], [Fr(b, a), '분자와 분모를 바꿨어요']];
  },
  hint(p){
    const {a, b, k} = p.g;
    return [S('분자와 분모의 최대공약수를 찾아요.', `${a * k}, ${b * k}의 최대공약수 = ${QS}`, N(k)),
      S('분자를 최대공약수로 나눠요.', `${a * k} ÷ ${k} = ${QS}`, N(a)),
      S('분모도 최대공약수로 나눠요.', `${b * k} ÷ ${k} = ${QS}`, N(b)),
      S('기약분수는?', p.eq, p.ans)];
  },
};
// 분모가 다른 진분수 두 개 (기약분수). big: 앞이 더 커요
function twoFr(maxL, big){
  for (;;){
    const b1 = rnd(2, 10), b2 = rnd(2, 10);
    if (b1 === b2) continue;
    const l = lcm(b1, b2);
    if (l > maxL) continue;
    const a1 = coprimeBelow(b1), a2 = coprimeBelow(b2);
    if (a1 * b2 === a2 * b1 || (big && a1 * b2 < a2 * b1)) continue;
    return {a1, b1, a2, b2, l, n1:a1 * l / b1, n2:a2 * l / b2};
  }
}
T.rc3 = {
  tip:'💡 두 분모의 최소공배수를 공통분모로 하면 가장 작은 공통분모로 통분해요!',
  gen(){ const q = twoFr(60); return {say:'가장 작은 공통분모로 통분해요', eq:`${fr(q.a1, q.b1)}, ${fr(q.a2, q.b2)} → 공통분모 ${QS}`, ans:N(q.l), g:q}; },
  wrong(p){
    const {b1, b2, l} = p.g, o = [];
    if (b1 * b2 !== l) o.push([N(b1 * b2), '공통분모이지만 가장 작은 공통분모는 아니에요']);
    o.push([N(b1 + b2), '분모끼리 더하면 안 돼요']);
    if (Math.max(b1, b2) !== l) o.push([N(Math.max(b1, b2)), `${Math.min(b1, b2)}의 배수가 아니에요`]);
    return o;
  },
  hint(p){
    const {b1, b2} = p.g, g = gcd(b1, b2);
    return [S('두 분모의 최대공약수를 구해요.', `${b1}, ${b2}의 최대공약수 = ${QS}`, N(g)),
      S('최소공배수 = 최대공약수 × 두 몫이에요.', `${g} × ${b1 / g} × ${b2 / g} = ${QS}`, p.ans)];
  },
};
// 통분 세 단계 (공통분모 → 앞 분자 → 뒤 분자)
const tbSteps = q => [
  S('두 분모의 최소공배수로 통분해요. 공통분모는?', `${q.b1}, ${q.b2} → ${QS}`, N(q.l), [N(q.b1 * q.b2), N(q.b1 + q.b2)]),
  S('앞의 분수를 통분해요. 분모에 곱한 수를 분자에도 곱해요.', `${fr(q.a1, q.b1)} = ${fr(QS, q.l)}`, N(q.n1)),
  S('뒤의 분수도 통분해요.', `${fr(q.a2, q.b2)} = ${fr(QS, q.l)}`, N(q.n2)),
];
T.rc4 = {
  tip:'💡 분모가 다르면 통분해서 분자를 비교해요. 분자가 클수록 큰 분수예요!',
  gen(){
    const q = twoFr(60), big = q.n1 > q.n2 ? Fr(q.a1, q.b1) : Fr(q.a2, q.b2);
    return {say:'두 분수 중 더 큰 분수를 잡아요', eq:`${fr(q.a1, q.b1)}, ${fr(q.a2, q.b2)} → ${QS}`, ans:big, g:q};
  },
  wrong(p){ const q = p.g, small = q.n1 > q.n2 ? Fr(q.a2, q.b2) : Fr(q.a1, q.b1); return [[small, '통분해서 분자를 비교하면 더 작은 분수예요']]; },
  hint(p){ return [...tbSteps(p.g), S('분자가 큰 쪽이 더 큰 분수예요.', p.eq, p.ans)]; },
};

// ═════ 5-1 분수의 덧셈과 뺄셈 (분모가 달라요) ═════
const fuTip = '💡 분모가 다르면 먼저 통분해서 분모를 같게 만든 다음, 분자끼리 계산해요. 답은 약분하거나 대분수로!';
T.fu1 = {
  tip:fuTip,
  gen(){ const q = twoFr(40); return {say:'분모가 다른 분수의 덧셈', eq:`${fr(q.a1, q.b1)} + ${fr(q.a2, q.b2)} = ${QS}`, ans:Fr(q.n1 + q.n2, q.l), g:q}; },
  wrong(p){ const q = p.g; return [[Fr(q.a1 + q.a2, q.b1 + q.b2), '분모끼리 더하면 안 돼요. 통분한 다음 분자끼리 더해요'], [Fr(q.a1 + q.a2, q.l), '통분할 때 분자에도 같은 수를 곱해야 해요']]; },
  hint(p){ const q = p.g; return [...tbSteps(q), S('분자끼리 더하고, 약분하거나 대분수로 나타내요.', `${fr(q.n1, q.l)} + ${fr(q.n2, q.l)} = ${QS}`, p.ans)]; },
};
T.fu2 = {
  tip:fuTip,
  gen(){ const q = twoFr(40, true); return {say:'분모가 다른 분수의 뺄셈', eq:`${fr(q.a1, q.b1)} − ${fr(q.a2, q.b2)} = ${QS}`, ans:Fr(q.n1 - q.n2, q.l), g:q}; },
  wrong(p){
    const q = p.g, o = [];
    if (q.a1 > q.a2 && q.b1 > q.b2) o.push([Fr(q.a1 - q.a2, q.b1 - q.b2), '분모끼리 빼면 안 돼요. 통분한 다음 분자끼리 빼요']);
    if (q.a1 > q.a2) o.push([Fr(q.a1 - q.a2, q.l), '통분할 때 분자에도 같은 수를 곱해야 해요']);
    return o;
  },
  hint(p){ const q = p.g; return [...tbSteps(q), S('분자끼리 빼고, 약분할 수 있으면 약분해요.', `${fr(q.n1, q.l)} − ${fr(q.n2, q.l)} = ${QS}`, p.ans)]; },
};
T.fu3 = {
  tip:fuTip + ' 대분수는 자연수끼리, 분수끼리 더해요.',
  gen(){
    const q = twoFr(40); q.w1 = rnd(1, 3); q.w2 = rnd(1, 3);
    return {say:'분모가 다른 대분수의 덧셈', eq:`${mix(q.w1, q.a1, q.b1)} + ${mix(q.w2, q.a2, q.b2)} = ${QS}`, ans:Fr((q.w1 + q.w2) * q.l + q.n1 + q.n2, q.l), g:q};
  },
  wrong(p){
    const q = p.g, W = q.w1 + q.w2, o = [];
    if (q.n1 + q.n2 >= q.l) o.push([Fr(W * q.l + q.n1 + q.n2 - q.l, q.l), '분수끼리 더해서 1이 넘으면 자연수에 1을 올려야 해요']);
    o.push([Fr(W * (q.b1 + q.b2) + q.a1 + q.a2, q.b1 + q.b2), '분모끼리 더하면 안 돼요']);
    return o;
  },
  hint(p){
    const q = p.g, W = q.w1 + q.w2, fs = Fr(q.n1 + q.n2, q.l);
    return [...tbSteps(q), S('분수끼리 더해요.', `${fr(q.n1, q.l)} + ${fr(q.n2, q.l)} = ${QS}`, fs),
      S(`자연수끼리 더한 ${W}${jn(W, '과', '와')} 합쳐요.`, `${W} + ${H(fs)} = ${QS}`, p.ans)];
  },
};
T.fu4 = {
  tip:fuTip + ' 분수끼리 뺄 수 없으면 자연수에서 1을 받아내려요.',
  gen(){
    let q; do q = twoFr(40); while (q.n1 === q.n2);
    q.w1 = rnd(2, 4); q.w2 = rnd(1, q.w1 - 1);
    return {say:'분모가 다른 대분수의 뺄셈', eq:`${mix(q.w1, q.a1, q.b1)} − ${mix(q.w2, q.a2, q.b2)} = ${QS}`, ans:Fr((q.w1 - q.w2) * q.l + q.n1 - q.n2, q.l), g:q};
  },
  wrong(p){
    const q = p.g, W = q.w1 - q.w2, o = [];
    if (q.n1 < q.n2) o.push([Fr(W * q.l + q.n2 - q.n1, q.l), '분수끼리 거꾸로 뺐어요. 모자라면 자연수에서 1을 받아내려요'],
                            [Fr(W * q.l + q.l + q.n1 - q.n2, q.l), '받아내림한 다음 자연수를 1 줄이지 않았어요']);
    else if (q.a1 > q.a2 && q.b1 > q.b2) o.push([Fr(W * (q.b1 - q.b2) + q.a1 - q.a2, q.b1 - q.b2), '분모끼리 빼면 안 돼요']);
    return o;
  },
  hint(p){
    const q = p.g, {w1, w2, l, n1, n2} = q;
    if (n1 < n2){
      const fd = Fr(l + n1 - n2, l);
      return [...tbSteps(q),
        S('분수끼리 뺄 수 없어요. 자연수에서 1을 받아내려요.', `${mix(w1, n1, l)} = ${mix(w1 - 1, QS, l)}`, N(l + n1)),
        S('이제 분수끼리 빼요.', `${fr(l + n1, l)} − ${fr(n2, l)} = ${QS}`, fd),
        S('남은 자연수끼리 빼서 합쳐요.', `${w1 - 1} − ${w2} + ${H(fd)} = ${QS}`, p.ans)];
    }
    const fd = Fr(n1 - n2, l);
    return [...tbSteps(q), S('분수끼리 빼요.', `${fr(n1, l)} − ${fr(n2, l)} = ${QS}`, fd),
      S('자연수끼리 빼서 합쳐요.', `${w1} − ${w2} + ${H(fd)} = ${QS}`, p.ans)];
  },
};

// ═════ 5-1 다각형의 둘레와 넓이 (그림 대신 길이를 글로) ═════
function twoDiff(lo, hi){ const a = rnd(lo, hi); let b; do b = rnd(lo, hi); while (b === a); return [a, b]; }
T.ar1 = {
  tip:'💡 직사각형의 넓이 = 가로 × 세로, 정사각형의 넓이 = 한 변 × 한 변. 둘레는 네 변을 모두 더해요!',
  gen(){
    const m = rnd(0, 2), [a, b] = twoDiff(2, 15);
    if (m === 0) return {say:`가로 ${a}cm, 세로 ${b}cm인 직사각형이에요`, eq:`넓이 = ${QS}`, ans:N(a * b, 'cm²'), g:{m, a, b}};
    if (m === 1) return {say:`가로 ${a}cm, 세로 ${b}cm인 직사각형이에요`, eq:`둘레 = ${QS}`, ans:N(2 * (a + b), 'cm'), g:{m, a, b}};
    return {say:`한 변이 ${a}cm인 정사각형이에요`, eq:`넓이 = ${QS}`, ans:N(a * a, 'cm²'), g:{m, a}};
  },
  wrong(p){
    const {m, a, b} = p.g;
    if (m === 0) return [[N(2 * (a + b), 'cm²'), '둘레와 헷갈렸어요. 넓이는 곱해요'], [N(a + b, 'cm²'), '넓이는 더하지 않고 곱해요']];
    if (m === 1) return [[N(a * b, 'cm'), '넓이와 헷갈렸어요. 둘레는 네 변을 더해요'], [N(a + b, 'cm'), '마주 보는 변도 더해야 해요']];
    return [[N(4 * a, 'cm²'), '둘레와 헷갈렸어요'], [N(2 * a, 'cm²'), '한 변 × 한 변이에요']];
  },
  hint(p){
    const {m, a, b} = p.g;
    if (m === 0) return [S('넓이가 1cm²인 정사각형을 가로로 한 줄 놓으면 몇 개일까요?', `한 줄 = ${QS}`, N(a, '개')),
      S(`세로로 ${b}줄이 있으니까 곱해요.`, `${a} × ${b} = ${QS}`, p.ans)];
    if (m === 1) return [S('가로와 세로를 더해요.', `${a}cm + ${b}cm = ${QS}`, N(a + b, 'cm')),
      S('같은 길이의 변이 2쌍이니까 2배 해요.', `${a + b}cm × 2 = ${QS}`, p.ans)];
    return [S('정사각형은 네 변의 길이가 같아요. 가로와 세로는 몇 cm일까요?', `가로 = 세로 = ${QS}`, N(a, 'cm')),
      S('한 변 × 한 변', `${a} × ${a} = ${QS}`, p.ans)];
  },
};
T.ar2 = {
  tip:'💡 평행사변형의 넓이 = 밑변 × 높이, 삼각형의 넓이 = 밑변 × 높이 ÷ 2예요!',
  gen(){
    if (rnd(0, 1)){ const b = rnd(3, 15), h = rnd(2, 12); return {say:`밑변 ${b}cm, 높이 ${h}cm인 평행사변형이에요`, eq:`넓이 = ${QS}`, ans:N(b * h, 'cm²'), g:{m:0, b, h}}; }
    let b, h; do { b = rnd(3, 15); h = rnd(2, 12); } while ((b * h) % 2);
    return {say:`밑변 ${b}cm, 높이 ${h}cm인 삼각형이에요`, eq:`넓이 = ${QS}`, ans:N(b * h / 2, 'cm²'), g:{m:1, b, h}};
  },
  wrong(p){
    const {m, b, h} = p.g;
    if (m === 0) return [...((b * h) % 2 ? [] : [[N(b * h / 2, 'cm²'), '평행사변형은 2로 나누지 않아요']]), [N(b + h, 'cm²'), '밑변과 높이를 곱해요']];
    return [[N(b * h, 'cm²'), '2로 나누는 걸 잊었어요'], [N(b + h, 'cm²'), '밑변과 높이를 곱한 다음 2로 나눠요']];
  },
  hint(p){
    const {m, b, h} = p.g;
    if (m === 0) return [S('평행사변형을 잘라 붙이면 직사각형이 돼요. 직사각형의 가로는 밑변과 같아요.', `가로 = ${QS}`, N(b, 'cm'), [N(h, 'cm')]),
      S('넓이 = 밑변 × 높이', `${b} × ${h} = ${QS}`, p.ans)];
    return [S('똑같은 삼각형 2개를 붙이면 평행사변형이 돼요. 그 넓이는?', `${b} × ${h} = ${QS}`, N(b * h, 'cm²')),
      S('삼각형은 그 절반이에요.', `${b * h} ÷ 2 = ${QS}`, p.ans)];
  },
};
T.ar3 = {
  tip:'💡 사다리꼴의 넓이 = (윗변 + 아랫변) × 높이 ÷ 2, 마름모의 넓이 = 대각선 × 대각선 ÷ 2예요!',
  gen(){
    if (rnd(0, 1)){
      let t, u, h; do { t = rnd(2, 10); u = rnd(t + 1, 15); h = rnd(2, 10); } while (((t + u) * h) % 2);
      return {say:`윗변 ${t}cm, 아랫변 ${u}cm, 높이 ${h}cm인 사다리꼴이에요`, eq:`넓이 = ${QS}`, ans:N((t + u) * h / 2, 'cm²'), g:{m:0, t, u, h}};
    }
    let d1, d2; do [d1, d2] = twoDiff(2, 16); while ((d1 * d2) % 2);
    return {say:`두 대각선이 ${d1}cm, ${d2}cm인 마름모예요`, eq:`넓이 = ${QS}`, ans:N(d1 * d2 / 2, 'cm²'), g:{m:1, d1, d2}};
  },
  wrong(p){
    const g = p.g;
    if (g.m === 0) return [[N((g.t + g.u) * g.h, 'cm²'), '2로 나누는 걸 잊었어요'], [N(g.u * g.h, 'cm²'), '윗변도 더해야 해요']];
    return [[N(g.d1 * g.d2, 'cm²'), '2로 나누는 걸 잊었어요'], [N(g.d1 + g.d2, 'cm²'), '두 대각선을 곱한 다음 2로 나눠요']];
  },
  hint(p){
    const g = p.g;
    if (g.m === 0){
      const s = g.t + g.u;
      return [S('똑같은 사다리꼴 2개를 붙이면 평행사변형이 돼요. 밑변은 윗변 + 아랫변!', `${g.t} + ${g.u} = ${QS}`, N(s, 'cm')),
        S('높이를 곱해요.', `${s} × ${g.h} = ${QS}`, N(s * g.h, 'cm²')),
        S('사다리꼴은 그 절반이에요.', `${s * g.h} ÷ 2 = ${QS}`, p.ans)];
    }
    return [S('마름모를 둘러싼 직사각형의 넓이는 두 대각선의 곱이에요.', `${g.d1} × ${g.d2} = ${QS}`, N(g.d1 * g.d2, 'cm²')),
      S('마름모는 그 절반이에요.', `${g.d1 * g.d2} ÷ 2 = ${QS}`, p.ans)];
  },
};

// ═════ 5-2 수의 범위와 어림하기 ═════
const PLACE = {10:'십', 100:'백', 1000:'천'}, BELOW = {10:'일', 100:'십', 1000:'백'};
T.ro1 = {
  tip:'💡 이상·이하는 그 수를 포함하고, 초과·미만은 그 수를 포함하지 않아요!',
  gen(){
    const lo = rnd(10, 60), hi = lo + rnd(3, 7), iL = !!rnd(0, 1), iH = !!rnd(0, 1);
    const mn = lo + (iL ? 0 : 1), mx = hi - (iH ? 0 : 1);
    const range = `${lo} ${iL ? '이상' : '초과'} ${hi} ${iH ? '이하' : '미만'}`;
    return {say:'범위에 드는 수를 잡아요', eq:`${range}인 수 = ${QS}`, ans:N(rnd(mn, mx)), g:{lo, hi, iL, iH, mn, mx}};
  },
  valid(p, v){ return v.t === 'q' && v.d === 1 && (v.n < p.g.mn || v.n > p.g.mx); },
  wrong(p){
    const {lo, hi, iL, iH} = p.g, o = [];
    if (!iL) o.push([N(lo), `초과는 ${lo}${jn(lo, '을', '를')} 포함하지 않아요`]);
    if (!iH) o.push([N(hi), `미만은 ${hi}${jn(hi, '을', '를')} 포함하지 않아요`]);
    o.push([N(lo - 1), '범위보다 작은 수예요'], [N(hi + 1), '범위보다 큰 수예요']);
    return o;
  },
  why(p, w){ if (w.t === 'q' && w.d === 1) return w.n < p.g.mn ? '범위보다 작은 수예요' : w.n > p.g.mx ? '범위보다 큰 수예요' : null; },
  hint(p){
    const {lo, hi, iL, iH, mn, mx} = p.g;
    return [S(`${lo} ${iL ? '이상' : '초과'}: 범위에 드는 가장 작은 자연수는?`, `가장 작은 수 = ${QS}`, N(mn), [N(iL ? lo - 1 : lo), N(mn + 1)]),
      S(`${hi} ${iH ? '이하' : '미만'}: 범위에 드는 가장 큰 자연수는?`, `가장 큰 수 = ${QS}`, N(mx), [N(iH ? hi + 1 : hi), N(mx - 1)]),
      S(`${mn}부터 ${mx}까지의 수 중에서 골라요.`, p.eq, p.ans)];
  },
};
function roN(unit){ let n; do n = rnd(1001, 9999); while (n % unit === 0); return n; }
const up = (n, u) => Math.ceil(n / u) * u, down = (n, u) => Math.floor(n / u) * u, half = (n, u) => Math.round(n / u) * u;
T.ro2 = {
  tip:'💡 올림은 아래 자리 수를 올려서, 버림은 아래 자리 수를 버려서 나타내요. 아래 자리는 모두 0이 돼요!',
  gen(){
    const unit = pick([10, 100, 1000]), n = roN(unit), isUp = !!rnd(0, 1);
    return {say:`${isUp ? '올림' : '버림'}하여 ${PLACE[unit]}의 자리까지 나타내요`, eq:`${n} → ${QS}`, ans:N(isUp ? up(n, unit) : down(n, unit)), g:{unit, n, isUp}};
  },
  wrong(p){
    const {unit, n, isUp} = p.g, o = [[N(isUp ? down(n, unit) : up(n, unit)), '올림과 버림을 헷갈렸어요']];
    const other = unit === 1000 ? 100 : unit * 10;
    o.push([N(isUp ? up(n, other) : down(n, other)), `${PLACE[unit]}의 자리까지 나타내야 해요`]);
    return o;
  },
  hint(p){
    const {unit, n, isUp} = p.g, nm = PLACE[unit];
    return [S(`${nm}의 자리 아래 수는 얼마일까요?`, `${n}에서 ${nm}의 자리 아래 = ${QS}`, N(n % unit)),
      S(isUp ? `아래 수가 0이 아니니까 ${nm}의 자리 숫자를 1 크게 하고, 아래는 모두 0으로!` : '아래 자리 수를 모두 0으로 바꿔요!', p.eq, p.ans)];
  },
};
T.ro3 = {
  tip:'💡 반올림은 바로 아래 자리 숫자가 0~4면 버리고, 5~9면 올려요!',
  gen(){ const unit = pick([10, 100, 1000]), n = roN(unit); return {say:`반올림하여 ${PLACE[unit]}의 자리까지 나타내요`, eq:`${n} → ${QS}`, ans:N(half(n, unit)), g:{unit, n}}; },
  wrong(p){
    const {unit, n} = p.g, dg = Math.floor(n % unit / (unit / 10));
    const o = [[N(dg >= 5 ? down(n, unit) : up(n, unit)), dg >= 5 ? '바로 아래 숫자가 5 이상이면 올려요' : '바로 아래 숫자가 4 이하면 버려요']];
    const other = unit === 1000 ? 100 : unit * 10;
    o.push([N(half(n, other)), `${PLACE[unit]}의 자리까지 나타내야 해요`]);
    return o;
  },
  hint(p){
    const {unit, n} = p.g, dg = Math.floor(n % unit / (unit / 10));
    return [S(`바로 아래 자리인 ${BELOW[unit]}의 자리 숫자는?`, `${n}의 ${BELOW[unit]}의 자리 숫자 = ${QS}`, N(dg)),
      S(dg >= 5 ? '5 이상이니까 올려요!' : '4 이하니까 버려요!', p.eq, p.ans)];
  },
};

// ═════ 5-2 분수의 곱셈 ═════
const fmTip = '💡 분수의 곱셈은 분자끼리, 분모끼리 곱해요. 자연수는 분자에 곱하고, 대분수는 가분수로 바꿔서 곱해요!';
T.fm1 = {
  tip:fmTip,
  gen(){ const b = rnd(2, 12), a = coprimeBelow(b), k = rnd(2, 9); return {say:'분수와 자연수의 곱셈', eq:`${fr(a, b)} × ${k} = ${QS}`, ans:Fr(a * k, b), g:{a, b, k}}; },
  wrong(p){ const {a, b, k} = p.g; return [[Fr(a * k, b * k), '분모에도 곱했어요. 분자에만 곱해요'], [Fr(a, b * k), '분모에 곱하면 안 돼요'], [Fr(a + k, b), '더하지 말고 곱해요']]; },
  hint(p){
    const {a, b, k} = p.g;
    return [S('분자와 자연수를 곱해요. 분모는 그대로예요.', `${a} × ${k} = ${QS}`, N(a * k)),
      S('약분하거나 대분수로 나타내요.', `${fr(a * k, b)} = ${QS}`, p.ans)];
  },
};
T.fm2 = {
  tip:fmTip,
  gen(){ const b = rnd(2, 12), a = coprimeBelow(b), k = rnd(2, 9); return {say:'자연수와 분수의 곱셈', eq:`${k} × ${fr(a, b)} = ${QS}`, ans:Fr(a * k, b), g:{a, b, k}}; },
  wrong: T.fm1.wrong,
  hint(p){
    const {a, b, k} = p.g;
    return [S('자연수와 분자를 곱해요. 분모는 그대로예요.', `${k} × ${a} = ${QS}`, N(a * k)),
      S('약분하거나 대분수로 나타내요.', `${fr(a * k, b)} = ${QS}`, p.ans)];
  },
};
T.fm3 = {
  tip:fmTip,
  gen(){
    const b1 = rnd(2, 9), b2 = rnd(2, 9), a1 = coprimeBelow(b1), a2 = coprimeBelow(b2);
    return {say:'진분수끼리의 곱셈', eq:`${fr(a1, b1)} × ${fr(a2, b2)} = ${QS}`, ans:Fr(a1 * a2, b1 * b2), g:{a1, b1, a2, b2}};
  },
  wrong(p){
    const {a1, b1, a2, b2} = p.g;
    return [[Fr(a1 * b2, b1 * a2), '나눗셈처럼 뒤집어 곱했어요'], [Fr(a1 * a2, b1 + b2), '분모끼리도 곱해야 해요'], [Fr(a1 + a2, b1 * b2), '분자끼리도 곱해야 해요']];
  },
  hint(p){
    const {a1, b1, a2, b2} = p.g;
    return [S('분자끼리 곱해요.', `${a1} × ${a2} = ${QS}`, N(a1 * a2)), S('분모끼리 곱해요.', `${b1} × ${b2} = ${QS}`, N(b1 * b2)),
      S('약분해서 기약분수로 나타내요.', `${fr(a1 * a2, b1 * b2)} = ${QS}`, p.ans)];
  },
};
T.fm4 = {
  tip:fmTip,
  gen(){
    const w = rnd(1, 3), b = rnd(2, 9), a = coprimeBelow(b), M_ = w * b + a;
    if (rnd(0, 1)){ const k = rnd(2, 5); return {say:'대분수의 곱셈', eq:`${mix(w, a, b)} × ${k} = ${QS}`, ans:Fr(M_ * k, b), g:{w, a, b, M:M_, k}}; }
    const b2 = rnd(2, 9), a2 = coprimeBelow(b2);
    return {say:'대분수의 곱셈', eq:`${mix(w, a, b)} × ${fr(a2, b2)} = ${QS}`, ans:Fr(M_ * a2, b * b2), g:{w, a, b, M:M_, a2, b2}};
  },
  wrong(p){
    const {w, a, b, M: m, k, a2, b2} = p.g;
    if (k) return [[Fr(w * k * b + a, b), '자연수에만 곱하고 분수에는 곱하지 않았어요'], [Fr(m, b * k), '분모에 곱하면 안 돼요']];
    return [[Fr(w * b * b2 + a * a2, b * b2), '대분수를 가분수로 바꾸지 않고 따로 곱했어요'], [Fr(m * b2, b * a2), '뒤집어 곱했어요']];
  },
  hint(p){
    const {w, a, b, M: m, k, a2, b2} = p.g, first = S('대분수를 가분수로 바꿔요.', `${mix(w, a, b)} = ${fr(QS, b)}`, N(m));
    if (k) return [first, S('분자와 자연수를 곱해요.', `${m} × ${k} = ${QS}`, N(m * k)),
      S('약분하거나 대분수로 나타내요.', `${fr(m * k, b)} = ${QS}`, p.ans)];
    return [first, S('분자끼리 곱해요.', `${m} × ${a2} = ${QS}`, N(m * a2)), S('분모끼리 곱해요.', `${b} × ${b2} = ${QS}`, N(b * b2)),
      S('약분하거나 대분수로 나타내요.', `${fr(m * a2, b * b2)} = ${QS}`, p.ans)];
  },
};

// ═════ 5-2 소수의 곱셈 ═════
const dxTip = '💡 소수점을 떼고 자연수처럼 곱한 다음, 곱하는 두 수의 소수점 아래 자리 수를 더한 만큼 소수점을 찍어요!';
function dxOne(){ const pl = rnd(1, 2); return {pl, X: pl === 1 ? decInt(11, 99) : decInt(11, 999)}; }
const dxWrong = p => { const {X, k, pl} = p.g; return [[Dn(X * k / P10(pl + 1)), '소수점을 한 자리 더 왼쪽에 찍었어요'], [Dn(X * k / P10(pl - 1)), '소수점을 한 자리 더 오른쪽에 찍었어요']]; };
const dxHint = p => {
  const {X, k, pl} = p.g, xs = ds(X, pl);
  return [S('소수점을 떼고 자연수처럼 곱해요.', `${X} × ${k} = ${QS}`, N(X * k)),
    S(`${xs}${jn(xs, '은', '는')} 소수 ${KO[pl]} 자리 수니까, 곱도 소수 ${KO[pl]} 자리로 소수점을 찍어요.`, p.eq, p.ans)];
};
T.dx1 = {
  tip:dxTip,
  gen(){ const {pl, X} = dxOne(), k = rnd(2, 9); return {say:'소수와 자연수의 곱셈', eq:`${ds(X, pl)} × ${k} = ${QS}`, ans:Dn(X * k / P10(pl)), g:{pl, X, k}}; },
  wrong: dxWrong, hint: dxHint,
};
T.dx2 = {
  tip:dxTip,
  gen(){ const {pl, X} = dxOne(), k = rnd(2, 9); return {say:'자연수와 소수의 곱셈', eq:`${k} × ${ds(X, pl)} = ${QS}`, ans:Dn(X * k / P10(pl)), g:{pl, X, k}}; },
  wrong: dxWrong, hint: dxHint,
};
T.dx3 = {
  tip:dxTip,
  gen(){
    const X = decInt(2, 99), p2 = rnd(1, 2), Y = p2 === 1 ? decInt(11, 99) : decInt(11, 99);
    return {say:'소수끼리의 곱셈', eq:`${ds(X, 1)} × ${ds(Y, p2)} = ${QS}`, ans:Dn(X * Y / P10(1 + p2)), g:{X, Y, p2}};
  },
  wrong(p){ const {X, Y, p2} = p.g; return [[Dn(X * Y / P10(p2)), '소수점 아래 자리 수를 다시 세어 봐요'], [Dn(X * Y / P10(p2 + 2)), '소수점 아래 자리 수를 다시 세어 봐요']]; },
  hint(p){
    const {X, Y, p2} = p.g;
    return [S('소수점을 떼고 자연수처럼 곱해요.', `${X} × ${Y} = ${QS}`, N(X * Y)),
      S(`소수점 아래 자리 수를 더해요: 1 + ${p2} = ${1 + p2}자리`, p.eq, p.ans)];
  },
};
const MUL = {3:'1000', 2:'100', 1:'10', '-1':'0.1', '-2':'0.01'};
const shiftDec = (X, pl, e) => Q(X * P10(Math.max(e, 0)), P10(pl) * P10(Math.max(-e, 0)), 'd');
T.dx4 = {
  tip:'💡 10, 100, 1000을 곱하면 소수점이 오른쪽으로 1칸, 2칸, 3칸! 0.1, 0.01을 곱하면 왼쪽으로 1칸, 2칸 움직여요.',
  gen(){
    const {pl, X} = dxOne(), e = pick([1, 2, 3, -1, -2]);
    return {say:'곱의 소수점 위치를 찾아요', eq:`${ds(X, pl)} × ${MUL[e]} = ${QS}`, ans:shiftDec(X, pl, e), g:{pl, X, e}};
  },
  wrong(p){
    const {pl, X, e} = p.g, o = [];
    [e + 1, e - 1, -e].forEach(f => { if (f !== e && f !== 0 && Math.abs(f) <= 3) o.push([shiftDec(X, pl, f), '소수점을 움직이는 칸 수나 방향을 다시 확인해요']); });
    return o;
  },
  hint(p){
    const {e} = p.g, k = Math.abs(e), dir = e > 0 ? '오른쪽' : '왼쪽', m = MUL[e];
    return [S(`${m}${jn(m, '을', '를')} 곱하면 소수점이 ${dir}으로 몇 칸 움직일까요?`, `움직이는 칸 = ${QS}`, N(k, '칸'), [N(k + 1, '칸'), N(k === 1 ? 2 : k - 1, '칸')]),
      S(`소수점을 ${dir}으로 ${k}칸 옮겨요.`, p.eq, p.ans)];
  },
};

// ═════ 5-2 직육면체 ═════
const CB = [['면', 6, '위·아래, 앞·뒤, 왼쪽·오른쪽에 면이 2개씩 있어요.', '2 + 2 + 2'],
  ['모서리', 12, '위에 4개, 아래에 4개, 옆에 4개 있어요.', '4 + 4 + 4'],
  ['꼭짓점', 8, '위에 4개, 아래에 4개 있어요.', '4 + 4'],
  ['한 면과 수직인 면', 4, '모든 면 6개에서 자기 자신과 마주 보는 면을 빼요.', '6 − 1 − 1'],
  ['한 면과 평행한 면', 1, '모든 면 6개에서 자기 자신과 수직인 면 4개를 빼요.', '6 − 1 − 4'],
  ['한 꼭짓점에서 만나는 면', 3, '위·아래 중 하나, 앞·뒤 중 하나, 왼쪽·오른쪽 중 하나가 만나요.', '1 + 1 + 1']];
T.cb1 = {
  tip:'💡 직육면체와 정육면체는 면 6개, 모서리 12개, 꼭짓점 8개예요. 한 면과 수직인 면은 4개, 평행한 면은 1개예요!',
  gen(){ const i = rnd(0, CB.length - 1), sd = pick(['직육면체', '정육면체', '주사위(정육면체)']); return {say:`${sd}를 떠올려 봐요`, eq:`${CB[i][0]}의 수 = ${QS}`, ans:N(CB[i][1], '개'), g:{i}}; },
  wrong(p){ return CB.filter((_, j) => j !== p.g.i).map(c => [N(c[1], '개'), `${c[0]}의 수와 헷갈렸어요`]); },
  hint(p){ const c = CB[p.g.i]; return [S(c[2], `${c[3]} = ${QS}`, p.ans)]; },
};
T.cb2 = {
  tip:'💡 직육면체는 길이가 같은 모서리가 4개씩 3묶음, 정육면체는 12개 모서리의 길이가 모두 같아요!',
  gen(){
    if (rnd(0, 1)){ const s = rnd(2, 15); return {say:`한 모서리가 ${s}cm인 정육면체예요`, eq:`모서리 길이의 합 = ${QS}`, ans:N(12 * s, 'cm'), g:{s}}; }
    let a, b, c; do { a = rnd(2, 12); b = rnd(2, 12); c = rnd(2, 12); } while (a === b && b === c);
    return {say:`가로 ${a}cm, 세로 ${b}cm, 높이 ${c}cm인 직육면체예요`, eq:`모서리 길이의 합 = ${QS}`, ans:N(4 * (a + b + c), 'cm'), g:{a, b, c}};
  },
  wrong(p){
    const {s, a, b, c} = p.g;
    if (s) return [[N(6 * s, 'cm'), '모서리는 12개예요'], [N(8 * s, 'cm'), '꼭짓점의 수와 헷갈렸어요']];
    return [[N(a + b + c, 'cm'), '같은 길이의 모서리가 4개씩 있어요'], [N(2 * (a + b + c), 'cm'), '모서리는 12개예요. 4배 해야 해요'], [N(a * b * c, 'cm'), '곱하지 말고 더해요']];
  },
  hint(p){
    const {s, a, b, c} = p.g;
    if (s) return [S('정육면체의 모서리는 몇 개일까요?', `모서리의 수 = ${QS}`, N(12, '개'), [N(8, '개'), N(6, '개')]),
      S('모서리의 길이가 모두 같으니까 곱해요.', `${s} × 12 = ${QS}`, p.ans)];
    return [S('길이가 다른 모서리 3개를 더해요.', `${a} + ${b} + ${c} = ${QS}`, N(a + b + c, 'cm')),
      S('같은 길이의 모서리가 4개씩 있으니까 4배 해요.', `${a + b + c} × 4 = ${QS}`, p.ans)];
  },
};

// ═════ 5-2 평균과 가능성 ═════
function avData(){
  for (;;){
    const k = rnd(3, 5), m = rnd(5, 30), v = [];
    for (let i = 0; i < k - 1; i++) v.push(Math.max(1, m + rnd(-5, 5)));
    const lastV = m * k - v.reduce((s, x) => s + x, 0);
    if (lastV >= 1 && Math.abs(lastV - m) <= 8){ v.push(lastV); return {k, m, v}; }
  }
}
T.av1 = {
  tip:'💡 평균 = 자료의 합 ÷ 자료의 수예요!',
  gen(){ const g = avData(); return {say:'자료의 평균을 구해요', eq:`${g.v.join(', ')}의 평균 = ${QS}`, ans:N(g.m), g}; },
  wrong(p){
    const {k, m} = p.g, sum = m * k, o = [[N(sum), '합계를 자료의 수로 나눠야 해요']];
    if (sum % (k - 1) === 0) o.push([N(sum / (k - 1)), '자료의 수를 다시 세어 봐요']);
    if (sum % (k + 1) === 0) o.push([N(sum / (k + 1)), '자료의 수를 다시 세어 봐요']);
    return o;
  },
  hint(p){
    const {k, m, v} = p.g;
    return [S('자료를 모두 더해요.', `${v.join(' + ')} = ${QS}`, N(m * k)),
      S(`자료가 ${k}개니까 ${k}${jro(k)} 나눠요.`, `${m * k} ÷ ${k} = ${QS}`, p.ans)];
  },
};
T.av2 = {
  tip:'💡 평균 × 자료의 수 = 자료의 합. 합에서 아는 수를 빼면 모르는 수가 나와요!',
  gen(){
    const g = avData(); g.h = rnd(0, g.k - 1);
    return {say:`평균이 ${g.m}${jn(g.m, '이에요', '예요')}. ?에 알맞은 수를 구해요`, eq:g.v.map((x, i) => i === g.h ? QS : x).join(', '), ans:N(g.v[g.h]), g};
  },
  wrong(p){
    const {k, m, v, h} = p.g, known = m * k - v[h], o = [[N(m), '평균과 같다고 생각했어요']];
    if (m * (k - 1) - known > 0) o.push([N(m * (k - 1) - known), '자료의 수를 다시 세어 봐요']);
    return o;
  },
  hint(p){
    const {k, m, v, h} = p.g, kn = v.filter((_, i) => i !== h), sk = kn.reduce((s, x) => s + x, 0);
    return [S('평균 × 자료의 수 = 합계', `${m} × ${k} = ${QS}`, N(m * k)),
      S('알고 있는 수를 모두 더해요.', `${kn.join(' + ')} = ${QS}`, N(sk)),
      S('합계에서 빼요.', `${m * k} − ${sk} = ${QS}`, p.ans)];
  },
};
const EV = [
  ['동전을 던져서 숫자 면이 나올 가능성', 2, 1],
  ['주사위를 굴려서 7의 눈이 나올 가능성', 6, 0],
  ['주사위를 굴려서 6 이하의 눈이 나올 가능성', 6, 6],
  ['주사위를 굴려서 짝수의 눈이 나올 가능성', 6, 3],
  ['주사위를 굴려서 홀수의 눈이 나올 가능성', 6, 3],
  ['빨간 공 2개와 파란 공 2개가 든 주머니에서 빨간 공을 꺼낼 가능성', 4, 2],
  ['빨간 공만 4개 든 주머니에서 빨간 공을 꺼낼 가능성', 4, 4],
  ['빨간 공만 4개 든 주머니에서 파란 공을 꺼낼 가능성', 4, 0],
  ['1부터 10까지의 수 카드에서 10 이하의 수를 뽑을 가능성', 10, 10],
  ['흰 바둑돌 3개와 검은 바둑돌 3개 중에서 흰 바둑돌을 꺼낼 가능성', 6, 3],
  ['월요일 다음 날이 화요일일 가능성', 1, 1],
  ['내일 해가 서쪽에서 뜰 가능성', 1, 0],
];
const evVal = (t, f) => f === 0 ? N(0) : f === t ? N(1) : Fr(f, t);
T.av3 = {
  tip:`💡 일이 일어날 가능성을 수로 나타내면 불가능하다 0, 반반이다 ${fr(1, 2)}, 확실하다 1이에요!`,
  zero: true,
  gen(){ const i = rnd(0, EV.length - 1); return {say:EV[i][0], eq:`가능성 = ${QS}`, ans:evVal(EV[i][1], EV[i][2]), g:{i}}; },
  wrong(){ return [[N(0), '0은 절대 일어나지 않는 일이에요'], [Fr(1, 2), `${fr(1, 2)}은 반반인 일이에요`], [N(1), '1은 반드시 일어나는 일이에요'], [Fr(1, 4), '경우의 수를 다시 세어 봐요'], [Fr(3, 4), '경우의 수를 다시 세어 봐요']]; },
  hint(p){
    const [, t, f] = EV[p.g.i];
    return [S('일어날 수 있는 경우는 모두 몇 가지일까요?', `모든 경우 = ${QS}`, N(t, '가지')),
      S('그중에서 원하는 경우는 몇 가지일까요?', `원하는 경우 = ${QS}`, N(f, '가지')),
      S(`하나도 없으면 0, 절반이면 ${fr(1, 2)}, 모두이면 1이에요.`, p.eq, p.ans)];
  },
};

// ═════ 6-1 분수의 나눗셈 (÷ 자연수) ═════
const fdTip = `💡 (자연수) ÷ (자연수)의 몫은 분수로 나타낼 수 있어요. ÷ 3은 × ${fr(1, 3)}과 같아요!`;
T.fd1 = {
  tip:fdTip,
  gen(){ const b = rnd(2, 9); let a; do a = rnd(1, 2 * b - 1); while (a % b === 0); return {say:'몫을 분수로 나타내요', eq:`${a} ÷ ${b} = ${QS}`, ans:Fr(a, b), g:{a, b}}; },
  wrong(p){ const {a, b} = p.g, o = [[Fr(b, a), '나누는 수와 나누어지는 수를 바꿨어요']]; if (a > b) o.push([N(Math.floor(a / b)), '나머지를 버리지 말고 분수로 나타내요']); return o; },
  hint(p){
    const {a, b} = p.g;
    return [S(`1 ÷ ${b}${jn(b, '은', '는')} 1을 똑같이 ${b}조각으로 나눈 것 중 하나예요.`, `1 ÷ ${b} = ${QS}`, Fr(1, b), [N(b)]),
      S(`${a} ÷ ${b}${jn(b, '은', '는')} ${fr(1, b)}이 ${a}개예요.`, p.eq, p.ans)];
  },
};
T.fd2 = {
  tip:fdTip,
  gen(){
    for (;;){
      const b = rnd(3, 12), k = rnd(2, 5), m = rnd(1, 4), a = k * m;
      if (a < b && gcd(a, b) === 1) return {say:'분수를 자연수로 나눠요', eq:`${fr(a, b)} ÷ ${k} = ${QS}`, ans:Fr(m, b), g:{a, b, k, m}};
    }
  },
  wrong(p){ const {a, b, k, m} = p.g; return [[Fr(a * k, b), '나누지 않고 곱했어요'], [Fr(m, b * k), '분자를 나눴으면 분모는 그대로 둬요']]; },
  hint(p){
    const {a, k, m} = p.g;
    return [S('분자가 자연수로 나누어떨어지면 분자만 나눠요.', `${a} ÷ ${k} = ${QS}`, N(m)), S('분모는 그대로예요.', p.eq, p.ans)];
  },
};
T.fd3 = {
  tip:fdTip,
  gen(){
    for (;;){
      const b = rnd(2, 9), a = coprimeBelow(b), k = rnd(2, 6);
      if (a % k) return {say:'분수를 자연수로 나눠요', eq:`${fr(a, b)} ÷ ${k} = ${QS}`, ans:Fr(a, b * k), g:{a, b, k}};
    }
  },
  wrong(p){ const {a, b, k} = p.g; return [[Fr(a * k, b), '나누지 않고 곱했어요'], [Fr(a, b + k), '분모에 더하지 말고 곱해요']]; },
  hint(p){
    const {a, b, k} = p.g;
    return [S(`÷ ${k}${jn(k, '은', '는')} × ${fr(1, k)}과 같아요. 분모에 ${k}${jn(k, '을', '를')} 곱해요.`, `${b} × ${k} = ${QS}`, N(b * k)),
      S('약분할 수 있으면 약분해요.', `${fr(a, b * k)} = ${QS}`, p.ans)];
  },
};
T.fd4 = {
  tip:fdTip + ' 대분수는 가분수로 바꾼 다음 나눠요.',
  gen(){
    const w = rnd(1, 3), b = rnd(2, 9), a = coprimeBelow(b), k = rnd(2, 5), m = w * b + a;
    return {say:'대분수를 자연수로 나눠요', eq:`${mix(w, a, b)} ÷ ${k} = ${QS}`, ans:Fr(m, b * k), g:{w, a, b, k, m}};
  },
  wrong(p){ const {w, a, b, k, m} = p.g; return [[Fr(m * k, b), '나누지 않고 곱했어요'], [Fr(w * b + a * k, b * k), '대분수를 가분수로 바꾼 다음 나눠요']]; },
  hint(p){
    const {w, a, b, k, m} = p.g;
    return [S('대분수를 가분수로 바꿔요.', `${mix(w, a, b)} = ${fr(QS, b)}`, N(m)),
      S(`÷ ${k}${jn(k, '은', '는')} × ${fr(1, k)}과 같아요. 분모에 ${k}${jn(k, '을', '를')} 곱해요.`, `${b} × ${k} = ${QS}`, N(b * k)),
      S('약분하거나 대분수로 나타내요.', `${fr(m, b * k)} = ${QS}`, p.ans)];
  },
};

// ═════ 6-1 각기둥과 각뿔 ═════
const KN = ['', '', '', '삼', '사', '오', '육', '칠', '팔'];
const PART = ['면', '모서리', '꼭짓점'];
const prism = [n => n + 2, n => 3 * n, n => 2 * n], pyramid = [n => n + 1, n => 2 * n, n => n + 1];
T.pm1 = {
  tip:'💡 각기둥(밑면이 □각형): 면 □ + 2, 모서리 □ × 3, 꼭짓점 □ × 2개예요!',
  gen(){ const n = rnd(3, 8), i = rnd(0, 2); return {say:`${KN[n]}각기둥을 떠올려 봐요`, eq:`${PART[i]}의 수 = ${QS}`, ans:N(prism[i](n), '개'), g:{n, i}}; },
  wrong(p){ const {n, i} = p.g; return [0, 1, 2].filter(j => j !== i).map(j => [N(prism[j](n), '개'), `${PART[j]}의 수와 헷갈렸어요`]); },
  hint(p){
    const {n, i} = p.g;
    if (i === 0) return [S('밑면은 2개예요. 옆면은 한 밑면의 변의 수만큼 있어요. 옆면은?', `옆면의 수 = ${QS}`, N(n, '개')), S('밑면 2개와 옆면을 더해요.', `2 + ${n} = ${QS}`, p.ans)];
    if (i === 1) return [S('한 밑면의 모서리는 몇 개일까요?', `한 밑면의 모서리 = ${QS}`, N(n, '개')), S('위 밑면, 아래 밑면, 옆에 같은 수만큼 있어요.', `${n} × 3 = ${QS}`, p.ans)];
    return [S('한 밑면의 꼭짓점은 몇 개일까요?', `한 밑면의 꼭짓점 = ${QS}`, N(n, '개')), S('위 밑면과 아래 밑면에 똑같이 있어요.', `${n} × 2 = ${QS}`, p.ans)];
  },
};
T.pm2 = {
  tip:'💡 각뿔(밑면이 □각형): 면 □ + 1, 모서리 □ × 2, 꼭짓점 □ + 1개예요!',
  gen(){ const n = rnd(3, 8), i = rnd(0, 2); return {say:`${KN[n]}각뿔을 떠올려 봐요`, eq:`${PART[i]}의 수 = ${QS}`, ans:N(pyramid[i](n), '개'), g:{n, i}}; },
  wrong(p){ const {n, i} = p.g; return [[N(prism[i](n), '개'), '각기둥과 헷갈렸어요'], ...[0, 1, 2].filter(j => j !== i).map(j => [N(pyramid[j](n), '개'), `${PART[j]}의 수와 헷갈렸어요`])]; },
  hint(p){
    const {n, i} = p.g;
    if (i === 0) return [S('밑면은 1개예요. 옆면은 밑면의 변의 수만큼 있어요. 옆면은?', `옆면의 수 = ${QS}`, N(n, '개')), S('밑면 1개와 옆면을 더해요.', `1 + ${n} = ${QS}`, p.ans)];
    if (i === 1) return [S('밑면의 모서리는 몇 개일까요?', `밑면의 모서리 = ${QS}`, N(n, '개')), S('옆으로 올라가는 모서리도 같은 수만큼 있어요.', `${n} × 2 = ${QS}`, p.ans)];
    return [S('밑면의 꼭짓점은 몇 개일까요?', `밑면의 꼭짓점 = ${QS}`, N(n, '개')), S('꼭대기에 각뿔의 꼭짓점이 하나 더 있어요.', `${n} + 1 = ${QS}`, p.ans)];
  },
};
// 거꾸로: [기둥/뿔][부분] → [식 글자, 몫 구하기]
const PM3 = {
  기둥: [['면의 수 = 밑면의 변의 수 + 2', c => `${c} − 2`, c => c - 2], ['모서리의 수 = 밑면의 변의 수 × 3', c => `${c} ÷ 3`, c => c / 3], ['꼭짓점의 수 = 밑면의 변의 수 × 2', c => `${c} ÷ 2`, c => c / 2]],
  뿔: [['면의 수 = 밑면의 변의 수 + 1', c => `${c} − 1`, c => c - 1], ['모서리의 수 = 밑면의 변의 수 × 2', c => `${c} ÷ 2`, c => c / 2], ['꼭짓점의 수 = 밑면의 변의 수 + 1', c => `${c} − 1`, c => c - 1]],
};
T.pm3 = {
  tip:'💡 면·모서리·꼭짓점의 수를 알면 밑면이 몇 각형인지 거꾸로 알 수 있어요!',
  gen(){
    const n = rnd(3, 8), i = rnd(0, 2), kd = rnd(0, 1) ? '기둥' : '뿔', c = (kd === '기둥' ? prism : pyramid)[i](n);
    return {say:`${PART[i]}${i === 1 ? '가' : '이'} ${c}개인 각${kd}이에요`, eq:`${PART[i]} ${c}개 → ${QS}`, ans:N(n, '각' + kd), g:{n, i, kd, c}};
  },
  valid(p, v){ return v.t === 'q' && v.d === 1 && v.n >= 3; },
  wrong(p){
    const {n, kd, c} = p.g, u = '각' + kd, o = [];
    [c - 2, c / 3, c / 2, c - 1].forEach(x => { if (Number.isInteger(x) && x >= 3 && x !== n) o.push([N(x, u), '다른 부분의 규칙과 헷갈렸어요']); });
    return o;
  },
  hint(p){ const {i, kd, c} = p.g, r = PM3[kd][i]; return [S(`각${kd}의 ${r[0]}이에요.`, `${r[1](c)} = ${QS}`, p.ans)]; },
};

// ═════ 6-1 소수의 나눗셈 (÷ 자연수) ═════
const ddTip = '💡 소수점을 떼고 자연수 나눗셈처럼 계산한 다음, 나누어지는 수의 소수점 위치에 맞춰 몫에 소수점을 찍어요!';
const ddWrong = p => { const {Qi, pl} = p.g; return [[Dn(Qi / P10(pl - 1)), '몫의 소수점 위치를 다시 확인해요'], [Dn(Qi / P10(pl + 1)), '몫의 소수점 위치를 다시 확인해요']]; };
function ddGen(lt1){
  for (;;){
    const pl = rnd(1, 2), k = rnd(2, 9);
    const Qi = lt1 ? (pl === 1 ? rnd(1, 9) : decInt(11, 99)) : (pl === 1 ? decInt(11, 99) : decInt(101, 999));
    const X = Qi * k;
    if (X % 10) return {say:lt1 ? '몫이 1보다 작은 소수의 나눗셈' : '소수를 자연수로 나눠요', eq:`${ds(X, pl)} ÷ ${k} = ${QS}`, ans:Dn(Qi / P10(pl)), g:{pl, k, Qi, X, lt1}};
  }
}
const ddHint = p => {
  const {k, X, Qi, lt1} = p.g;
  return [S('소수점을 떼고 자연수 나눗셈처럼 계산해요.', `${X} ÷ ${k} = ${QS}`, N(Qi)),
    S(lt1 ? '몫이 1보다 작으면 일의 자리에 0을 쓰고, 나누어지는 수의 소수점 위치에 맞춰 소수점을 찍어요.' : '나누어지는 수의 소수점 위치에 맞춰 몫에도 소수점을 찍어요.', p.eq, p.ans)];
};
T.dd1 = {tip:ddTip, gen: () => ddGen(false), wrong: ddWrong, hint: ddHint};
T.dd2 = {tip:ddTip, gen: () => ddGen(true), wrong: ddWrong, hint: ddHint};
T.dd3 = {
  tip:ddTip + ' 나누어떨어지지 않으면 끝에 0을 붙여서 계속 나눠요.',
  gen(){
    for (;;){
      const k = pick([2, 4, 5, 6, 8]), Qi = decInt(11, 299), Y = Qi * k;
      if (Y % 10 === 0 && Y % 100 !== 0) return {say:'0을 내려 끝까지 나눠요', eq:`${ds(Y / 10, 1)} ÷ ${k} = ${QS}`, ans:Dn(Qi / 100), g:{k, Qi, Y}};
    }
  },
  wrong(p){ const {k, Qi, Y} = p.g; return [[Dn(Qi / 10), '몫의 소수점 위치를 다시 확인해요'], [Dn(Math.floor(Y / 10 / k) / 10), '나머지가 있으면 0을 내려서 계속 나눠요']]; },
  hint(p){
    const {k, Qi, Y} = p.g, xs = ds(Y / 10, 1);
    return [S(`${xs}${jn(xs, '을', '를')} ${xs}0으로 생각하고 소수점을 떼면?`, `${Y} ÷ ${k} = ${QS}`, N(Qi)),
      S('소수 두 자리로 소수점을 찍어요.', p.eq, p.ans)];
  },
};
const placesOf = v => { for (let e = 0; e < 8; e++) if ((v.n * P10(e)) % v.d === 0) return e; return 8; };
T.dd4 = {
  tip:'💡 (자연수) ÷ (자연수)도 나누어떨어지지 않으면 소수점 아래에 0을 붙여 계속 나눠서 몫을 소수로 나타내요!',
  gen(){ const k = pick([2, 4, 5, 8]); let a; do a = rnd(1, 3 * k); while (a % k === 0); return {say:'몫을 소수로 나타내요', eq:`${a} ÷ ${k} = ${QS}`, ans:Dn(a / k), g:{a, k}}; },
  wrong(p){ const {a, k} = p.g, o = [[Dn(a / k * 10), '몫의 소수점 위치를 다시 확인해요']]; if (a > k) o.push([N(Math.floor(a / k)), '나머지를 버리지 말고 계속 나눠요']); return o; },
  hint(p){
    const {a, k} = p.g, pl = placesOf(p.ans), A = a * P10(pl);
    return [S(`${a}${jn(a, '을', '를')} ${a}.${'0'.repeat(pl)}으로 생각하고 소수점을 떼고 나눠요.`, `${A} ÷ ${k} = ${QS}`, N(A / k)),
      S(`소수 ${KO[pl]} 자리로 소수점을 찍어요.`, p.eq, p.ans)];
  },
};

// ═════ 6-1 비와 비율 ═════
const PAIR = [['빨간 구슬', '파란 구슬', '개'], ['남학생', '여학생', '명'], ['사과', '배', '개'], ['강아지', '고양이', '마리'], ['연필', '지우개', '개']];
T.rt1 = {
  tip:'💡 "~에 대한" 쪽, "대"의 뒤쪽이 기준량이에요. 비는 비교하는 양 : 기준량 순서로 써요!',
  gen(){
    const [A, B, u] = pick(PAIR), [x, y] = twoDiff(2, 12), m = rnd(0, 3);
    const ph = [`${A} 수 대 ${B} 수`, `${B} 수에 대한 ${A} 수의 비`, `${A} 수의 ${B} 수에 대한 비`, `${A} 수에 대한 ${B} 수의 비`][m];
    const base = m === 3 ? x : y, cmp = m === 3 ? y : x;
    return {say:`${A} ${x}${u}, ${B} ${y}${u}${u === '명' ? '이' : '가'} 있어요`, eq:`${ph} = ${QS}`, ans:R(cmp, base), g:{x, y, base, cmp}};
  },
  wrong(p){ const {x, y, base, cmp} = p.g; return [[R(base, cmp), '기준량("~에 대한" 쪽)은 뒤에 써요'], [R(cmp, x + y), '전체 수가 아니라 기준량과 비교해요']]; },
  hint(p){
    const {base, cmp} = p.g;
    return [S('기준량은 "~에 대한" 쪽, "대"의 뒤쪽이에요. 기준량은?', `기준량 = ${QS}`, N(base), [N(cmp)]),
      S('비교하는 양은?', `비교하는 양 = ${QS}`, N(cmp), [N(base)]),
      S('비교하는 양 : 기준량 순서로 써요.', p.eq, p.ans)];
  },
};
const rtSteps = (x, y) => [S('비교하는 양은 앞의 수예요. 비교하는 양은?', `비교하는 양 = ${QS}`, N(x), [N(y)]),
  S('기준량은 뒤의 수예요. 기준량은?', `기준량 = ${QS}`, N(y), [N(x)])];
T.rt2 = {
  tip:'💡 비율 = 비교하는 양 ÷ 기준량. 분수로 쓰면 비교하는 양이 분자, 기준량이 분모예요!',
  gen(){ const x = rnd(1, 9), y = rnd(x + 1, 12); return {say:'비율을 분수로 나타내요', eq:`${x} : ${y}의 비율 = ${QS}`, ans:Fr(x, y), g:{x, y}}; },
  wrong(p){ const {x, y} = p.g; return [[Fr(y, x), '기준량(뒤의 수)이 분모예요'], [Fr(x, x + y), '분모는 기준량이에요']]; },
  hint(p){ const {x, y} = p.g; return [...rtSteps(x, y), S('비교하는 양을 분자, 기준량을 분모에 써요.', `${x} ÷ ${y} = ${QS}`, p.ans)]; },
};
const RTY = [2, 4, 5, 10, 20, 25, 50];
T.rt3 = {
  tip:'💡 비율을 분수로 나타낸 다음, 분모를 10이나 100으로 바꾸면 소수가 돼요!',
  gen(){ const y = pick(RTY), x = rnd(1, y - 1); return {say:'비율을 소수로 나타내요', eq:`${x} : ${y}의 비율 = ${QS}`, ans:Dn(x / y), g:{x, y}}; },
  wrong(p){ const {x, y} = p.g; return [[Dn(x / y * 10), '소수점 위치를 다시 확인해요'], [Dn(x / y / 10), '소수점 위치를 다시 확인해요']]; },
  hint(p){
    const {x, y} = p.g, f = Fr(x, y);
    return [S('먼저 비율을 분수로 나타내요.', `${x} ÷ ${y} = ${QS}`, f), S('분모를 10이나 100으로 바꾸면 소수가 돼요.', `${H(f)} = ${QS}`, p.ans)];
  },
};
T.rt4 = {
  tip:'💡 백분율은 기준량을 100으로 할 때의 비율이에요. 비율에 100을 곱하고 %를 붙여요!',
  gen(){
    const m = rnd(0, 2);
    if (m === 0){ const h = rnd(1, 99); return {say:'백분율로 나타내요', eq:`${ds(h, 2)} = ${QS}`, ans:Q(h, 100, 'p'), g:{m, n:h, d:100}}; }
    const y = pick(RTY);
    if (m === 1){ const x = coprimeBelow(y); return {say:'백분율로 나타내요', eq:`${fr(x, y)} = ${QS}`, ans:Q(x, y, 'p'), g:{m, n:x, d:y}}; }
    const x = rnd(1, y - 1);
    return {say:'백분율로 나타내요', eq:`${x} : ${y}의 비율 = ${QS}`, ans:Q(x, y, 'p'), g:{m, n:x, d:y}};
  },
  wrong(p){ const {n, d} = p.g; return [[Q(n, d * 100, 'p'), '100을 곱하는 걸 잊었어요'], [Q(n, d * 10, 'p'), '10이 아니라 100을 곱해요']]; },
  hint(p){
    const {m, n, d} = p.g, vH = m === 0 ? ds(n, 2) : m === 1 ? fr(n, d) : `${n} ÷ ${d}`;
    return [S('비율에 100을 곱해요.', `${vH} × 100 = ${QS}`, Q(n * 100, d, 'd')), S('뒤에 %를 붙이면 백분율이에요.', p.eq, p.ans)];
  },
};

// ═════ 6-1 직육면체의 부피와 겉넓이 ═════
T.vb1 = {
  tip:'💡 직육면체의 부피 = 가로 × 세로 × 높이 (밑면의 넓이 × 높이)예요!',
  gen(){ const a = rnd(2, 12), b = rnd(2, 12), c = rnd(2, 12); return {say:`가로 ${a}cm, 세로 ${b}cm, 높이 ${c}cm인 직육면체예요`, eq:`부피 = ${QS}`, ans:N(a * b * c, 'cm³'), g:{a, b, c}}; },
  wrong(p){ const {a, b, c} = p.g; return [[N(a + b + c, 'cm³'), '부피는 더하지 않고 곱해요'], [N(a * b, 'cm³'), '높이도 곱해야 해요'], [N(2 * (a * b + b * c + a * c), 'cm³'), '겉넓이와 헷갈렸어요']]; },
  hint(p){ const {a, b, c} = p.g; return [S('밑면의 넓이 = 가로 × 세로', `${a} × ${b} = ${QS}`, N(a * b, 'cm²')), S('밑면의 넓이에 높이를 곱해요.', `${a * b} × ${c} = ${QS}`, p.ans)]; },
};
T.vb2 = {
  tip:'💡 정육면체의 부피 = 한 모서리 × 한 모서리 × 한 모서리, 겉넓이 = 한 면의 넓이 × 6이에요!',
  gen(){
    const s = rnd(2, 10), vol = !!rnd(0, 1);
    return {say:`한 모서리가 ${s}cm인 정육면체예요`, eq:`${vol ? '부피' : '겉넓이'} = ${QS}`, ans:vol ? N(s * s * s, 'cm³') : N(6 * s * s, 'cm²'), g:{s, vol}};
  },
  wrong(p){
    const {s, vol} = p.g;
    return vol ? [[N(6 * s * s, 'cm³'), '겉넓이와 헷갈렸어요'], [N(s * s, 'cm³'), '한 번 더 곱해야 해요']]
               : [[N(s * s * s, 'cm²'), '부피와 헷갈렸어요'], [N(4 * s * s, 'cm²'), '정육면체의 면은 6개예요'], [N(s * s, 'cm²'), '한 면만 구했어요']];
  },
  hint(p){
    const {s, vol} = p.g, one = S('한 면의 넓이부터 구해요.', `${s} × ${s} = ${QS}`, N(s * s, 'cm²'));
    return vol ? [one, S('높이도 곱해요.', `${s * s} × ${s} = ${QS}`, p.ans)] : [one, S('정육면체의 면은 6개이고 넓이가 모두 같아요.', `${s * s} × 6 = ${QS}`, p.ans)];
  },
};
T.vb3 = {
  tip:'💡 직육면체의 겉넓이 = (세 면의 넓이의 합) × 2. 마주 보는 면은 넓이가 같아요!',
  gen(){ const a = rnd(2, 10), b = rnd(2, 10), c = rnd(2, 10); return {say:`가로 ${a}cm, 세로 ${b}cm, 높이 ${c}cm인 직육면체예요`, eq:`겉넓이 = ${QS}`, ans:N(2 * (a * b + b * c + a * c), 'cm²'), g:{a, b, c}}; },
  wrong(p){ const {a, b, c} = p.g; return [[N(a * b + b * c + a * c, 'cm²'), '마주 보는 면이 2개씩이에요. 2배 해요'], [N(a * b * c, 'cm²'), '부피와 헷갈렸어요']]; },
  hint(p){
    const {a, b, c} = p.g;
    return [S('가로 × 세로인 면의 넓이', `${a} × ${b} = ${QS}`, N(a * b, 'cm²')), S('세로 × 높이인 면의 넓이', `${b} × ${c} = ${QS}`, N(b * c, 'cm²')),
      S('가로 × 높이인 면의 넓이', `${a} × ${c} = ${QS}`, N(a * c, 'cm²')),
      S('세 면의 넓이를 더하고, 마주 보는 면이 같으니까 2배 해요.', `(${a * b} + ${b * c} + ${a * c}) × 2 = ${QS}`, p.ans)];
  },
};

// ═════ 6-2 분수의 나눗셈 (÷ 분수) ═════
const fqTip = '💡 분모가 같으면 분자끼리 나눠요. 분모가 다르면 나누는 분수의 분자와 분모를 바꿔서 곱해요!';
function fqSame(divisible){
  for (;;){
    const b = rnd(3, 12), c = rnd(divisible ? 1 : 2, 5), k = rnd(2, 6), a = divisible ? c * k : rnd(c + 1, b - 1);
    if (a < b && gcd(a, b) === 1 && gcd(c, b) === 1 && (divisible || a % c)) return {a, b, c};
  }
}
const fqSameHint = p => {
  const {a, b, c} = p.g;
  return [S(`${fr(a, b)}${jn(a, '은', '는')} ${fr(1, b)}이 몇 개일까요?`, `${fr(1, b)}이 ${QS}개`, N(a)),
    S(`${fr(c, b)}${jn(c, '은', '는')} ${fr(1, b)}이 몇 개일까요?`, `${fr(1, b)}이 ${QS}개`, N(c)),
    S('분모가 같으면 분자끼리 나눠요.', `${a} ÷ ${c} = ${QS}`, p.ans)];
};
const fqSameWrong = p => { const {a, b, c} = p.g; return [[Fr(c, a), '나누는 순서가 바뀌었어요'], [Fr(a * c, b * b), '나누지 않고 곱했어요']]; };
T.fq1 = {
  tip:fqTip,
  gen(){ const g = fqSame(true); return {say:'분모가 같은 분수의 나눗셈', eq:`${fr(g.a, g.b)} ÷ ${fr(g.c, g.b)} = ${QS}`, ans:N(g.a / g.c), g}; },
  wrong: fqSameWrong, hint: fqSameHint,
};
T.fq2 = {
  tip:fqTip,
  gen(){ const g = fqSame(false); return {say:'분모가 같은 분수의 나눗셈', eq:`${fr(g.a, g.b)} ÷ ${fr(g.c, g.b)} = ${QS}`, ans:Fr(g.a, g.c), g}; },
  wrong: fqSameWrong, hint: fqSameHint,
};
T.fq3 = {
  tip:fqTip,
  gen(){ const k = rnd(2, 9), b = rnd(2, 9), a = coprimeBelow(b); return {say:'자연수를 분수로 나눠요', eq:`${k} ÷ ${fr(a, b)} = ${QS}`, ans:Fr(k * b, a), g:{k, a, b}}; },
  wrong(p){ const {k, a, b} = p.g; return [[Fr(k * a, b), '나누는 분수를 뒤집지 않고 곱했어요'], [Fr(a, k * b), '나누는 순서가 바뀌었어요']]; },
  hint(p){
    const {k, a, b} = p.g;
    return [S(`나누는 분수를 뒤집어 곱해요: ${k} × ${fr(b, a)}. 먼저 자연수와 분자를 곱하면?`, `${k} × ${b} = ${QS}`, N(k * b)),
      S(`분모 ${a}${jro(a)} 나눠서 약분하거나 대분수로 나타내요.`, `${fr(k * b, a)} = ${QS}`, p.ans)];
  },
};
T.fq4 = {
  tip:fqTip,
  gen(){
    let b1, b2; do { b1 = rnd(2, 9); b2 = rnd(2, 9); } while (b1 === b2);
    const a1 = coprimeBelow(b1), a2 = coprimeBelow(b2);
    return {say:'분모가 다른 분수의 나눗셈', eq:`${fr(a1, b1)} ÷ ${fr(a2, b2)} = ${QS}`, ans:Fr(a1 * b2, b1 * a2), g:{a1, b1, a2, b2}};
  },
  wrong(p){ const {a1, b1, a2, b2} = p.g; return [[Fr(a1 * a2, b1 * b2), '나누는 분수를 뒤집지 않고 그냥 곱했어요'], [Fr(b1 * a2, a1 * b2), '앞의 분수를 뒤집었어요']]; },
  hint(p){
    const {a1, b1, a2, b2} = p.g;
    return [S(`÷ ${fr(a2, b2)}${jn(a2, '은', '는')} × ${fr(b2, a2)}${jn(b2, '과', '와')} 같아요. 분자끼리 곱하면?`, `${a1} × ${b2} = ${QS}`, N(a1 * b2)),
      S('분모끼리 곱하면?', `${b1} × ${a2} = ${QS}`, N(b1 * a2)),
      S('약분하거나 대분수로 나타내요.', `${fr(a1 * b2, b1 * a2)} = ${QS}`, p.ans)];
  },
};

// ═════ 6-2 소수의 나눗셈 (÷ 소수) ═════
const dqTip = '💡 나누는 수가 자연수가 되도록 두 수에 똑같이 10이나 100을 곱해도 몫은 같아요!';
T.dq1 = {
  tip:dqTip,
  gen(){ const Y = rnd(0, 1) ? rnd(2, 9) : decInt(11, 25), k = rnd(2, 9), X = Y * k; return {say:'소수를 소수로 나눠요', eq:`${ds(X, 1)} ÷ ${ds(Y, 1)} = ${QS}`, ans:N(k), g:{X, Y, k}}; },
  wrong(p){ const {k} = p.g; return [[Dn(k / 10), '두 수에 똑같이 10을 곱해야 해요'], [N(k * 10), '한쪽에만 10을 곱했어요']]; },
  hint(p){
    const {X, Y} = p.g;
    return [S('두 수에 똑같이 10을 곱해도 몫은 같아요. 나누어지는 수에 10을 곱하면?', `${ds(X, 1)} × 10 = ${QS}`, N(X)),
      S(`나누는 수도 10배 하면 ${Y}${jn(Y, '이에요', '예요')}.`, `${X} ÷ ${Y} = ${QS}`, p.ans)];
  },
};
T.dq2 = {
  tip:dqTip,
  gen(){ const Y = decInt(11, 49), Qt = decInt(11, 59), X = Y * Qt; return {say:'자릿수가 다른 소수의 나눗셈', eq:`${ds(X, 2)} ÷ ${ds(Y, 1)} = ${QS}`, ans:Dn(Qt / 10), g:{X, Y, Qt}}; },
  wrong(p){ const {Qt} = p.g; return [[Dn(Qt), '몫에 소수점을 찍어야 해요'], [Dn(Qt / 100), '몫의 소수점 위치를 다시 확인해요']]; },
  hint(p){
    const {X, Y} = p.g, x10 = ds(X, 1);
    return [S('나누는 수가 자연수가 되도록 두 수에 10을 곱해요.', `${ds(X, 2)} × 10 = ${QS}`, Dn(X / 10)),
      S(`이제 ${x10} ÷ ${Y}${jn(Y, '을', '를')} 계산해요.`, `${x10} ÷ ${Y} = ${QS}`, p.ans)];
  },
};
const DQ3 = [[2, 10], [4, 10], [5, 10], [6, 10], [8, 10], [12, 10], [15, 10], [25, 10], [25, 100], [75, 100], [5, 100], [4, 100]];
T.dq3 = {
  tip:dqTip,
  gen(){
    for (;;){
      const [Yi, sc] = pick(DQ3), m = rnd(2, 30), k = m * Yi / sc;
      if (Number.isInteger(k) && k >= 1 && k <= 60) return {say:'자연수를 소수로 나눠요', eq:`${k} ÷ ${M.text(Dn(Yi / sc))} = ${QS}`, ans:N(m), g:{Yi, sc, m, k}};
    }
  },
  wrong(p){ const {m, sc} = p.g; return [[Dn(m / sc), '두 수에 똑같이 곱해야 해요'], [N(m * 10), '한쪽에만 곱했어요']]; },
  hint(p){
    const {Yi, sc, k} = p.g, ys = M.text(Dn(Yi / sc));
    return [S(`나누는 수가 자연수가 되도록 두 수에 ${sc}${jn(sc, '을', '를')} 곱해요.`, `${k} × ${sc} = ${QS}`, N(k * sc)),
      S(`${ys} × ${sc} = ${Yi}${jn(Yi, '이니까', '니까')} 이렇게 나눠요.`, `${k * sc} ÷ ${Yi} = ${QS}`, p.ans)];
  },
};
const endless = (a, b) => { let d = b / gcd(a, b); while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d > 1; };
T.dq4 = {
  tip:'💡 몫이 나누어떨어지지 않으면 한 자리 더 구한 다음 반올림해요. 5 이상이면 올리고, 4 이하면 버려요!',
  gen(){
    for (;;){
      const b = pick([3, 6, 7, 9, 11, 12]), a = rnd(1, 2 * b);
      if (endless(a, b)) return {say:'몫을 반올림하여 소수 첫째 자리까지 나타내요', eq:`${a} ÷ ${b} → ${QS}`, ans:Dn(Math.round(a * 10 / b) / 10), g:{a, b}};
    }
  },
  wrong(p){
    const {a, b} = p.g, o = [], t = Dn(Math.floor(a * 10 / b) / 10);
    if (!M.same(t, p.ans)) o.push([t, '반올림이 아니라 버림을 했어요']);
    o.push([Dn(Math.floor(a * 100 / b) / 100), '소수 첫째 자리까지만 나타내요']);
    return o;
  },
  hint(p){
    const {a, b} = p.g;
    return [S('몫을 소수 둘째 자리까지 구해요.', `${a} ÷ ${b} = ${QS}…`, Dn(Math.floor(a * 100 / b) / 100)),
      S('소수 둘째 자리 숫자가 5 이상이면 올리고, 4 이하면 버려요.', p.eq, p.ans)];
  },
};

// ═════ 6-2 비례식과 비례배분 ═════
function coPair(){ for (;;){ const x = rnd(1, 9), y = rnd(1, 9); if (x !== y && gcd(x, y) === 1) return [x, y]; } }
T.pp1 = {
  tip:'💡 비의 앞과 뒤에 0이 아닌 같은 수를 곱하거나 나눠도 비율은 같아요. 최대공약수로 나누면 가장 간단한 자연수의 비!',
  gen(){
    const [x, y] = coPair();
    if (rnd(0, 1)){ const g = rnd(2, 9); return {say:'가장 간단한 자연수의 비로 나타내요', eq:`${g * x} : ${g * y} = ${QS}`, ans:R(x, y), g:{x, y, g, dec:false}}; }
    for (;;){
      const g = rnd(1, 3), X = x * g, Y = y * g;
      if (X < 100 && Y < 100 && (X % 10 || Y % 10)) return {say:'가장 간단한 자연수의 비로 나타내요', eq:`${ds(X, 1)} : ${ds(Y, 1)} = ${QS}`, ans:R(x, y), g:{x, y, g, dec:true}};
    }
  },
  wrong(p){
    const {x, y, g, dec} = p.g, o = [[R(y, x), '앞뒤 순서가 바뀌었어요']];
    if (dec){ if (g > 1) o.push([R(x * g, y * g), '10을 곱한 다음 더 간단하게 나타낼 수 있어요']); }
    else { const dv = divs(g).filter(d => d > 1 && d < g); if (dv.length) o.push([R(x * g / dv[0], y * g / dv[0]), '더 간단하게 나타낼 수 있어요']); }
    return o;
  },
  hint(p){
    const {x, y, g, dec} = p.g;
    if (dec){
      const X = x * g, Y = y * g;
      return [S('두 항에 10을 곱해서 자연수로 만들어요. 앞의 항은?', `${ds(X, 1)} × 10 = ${QS}`, N(X)),
        S('뒤의 항에도 10을 곱해요.', `${ds(Y, 1)} × 10 = ${QS}`, N(Y)),
        S(g > 1 ? `${X}, ${Y}의 최대공약수 ${g}${jro(g)} 나눠요.` : `${X}${jn(X, '과', '와')} ${Y}${jn(Y, '은', '는')} 더 나눌 수 없어요.`, p.eq, p.ans)];
    }
    return [S('두 항의 최대공약수로 나눠요. 최대공약수는?', `${g * x}, ${g * y}의 최대공약수 = ${QS}`, N(g)),
      S('앞의 항을 나눠요.', `${g * x} ÷ ${g} = ${QS}`, N(x)), S('뒤의 항도 나눠요.', `${g * y} ÷ ${g} = ${QS}`, N(y)),
      S('가장 간단한 자연수의 비는?', p.eq, p.ans)];
  },
};
T.pp2 = {
  tip:'💡 비례식에서는 앞의 비에 곱한 수를 뒤의 비에도 똑같이 곱해요. 외항의 곱과 내항의 곱도 같아요!',
  gen(){
    const [x, y] = twoDiff(1, 9), k = rnd(2, 9), t = [x, y, k * x, k * y], h = rnd(0, 3);
    return {say:'비례식에서 ?에 알맞은 수를 구해요', eq:(e => `${e[0]} : ${e[1]} = ${e[2]} : ${e[3]}`)(t.map((v, i) => i === h ? QS : v)), ans:N(t[h]), g:{t, h, k}};
  },
  wrong(p){
    const {t, h} = p.g, o = [], add = [t[2] - t[0], t[3] - t[1]];
    const v = h >= 2 ? t[h - 2] + add[1 - h % 2] : t[h + 2] - add[1 - h % 2];
    if (v > 0 && v !== t[h]) o.push([N(v), '더하거나 빼지 말고 같은 수를 곱하거나 나눠요']);
    return o;
  },
  hint(p){
    const {t, h, k} = p.g, col = h % 2 === 0 ? 1 : 0, s = t[col], b = t[col + 2];
    return [S(`${s}에 몇을 곱하면 ${b}${jn(b, '이', '가')} 될까요?`, `${s} × ${QS} = ${b}`, N(k)),
      h >= 2 ? S('다른 항에도 같은 수를 곱해요.', `${t[h - 2]} × ${k} = ${QS}`, p.ans) : S('다른 항은 같은 수로 나눠요.', `${t[h + 2]} ÷ ${k} = ${QS}`, p.ans)];
  },
};
T.pp3 = {
  tip:'💡 비례배분: 전체를 (앞 + 뒤) 묶음으로 나누고, 각자 비의 수만큼 묶음을 가져요!',
  gen(){
    const [x, y] = twoDiff(1, 9), m = rnd(2, 12), T_ = (x + y) * m, w = rnd(0, 1), who = w ? '지아' : '민수', part = w ? y : x;
    return {say:`구슬 ${T_}개를 민수와 지아가 ${x} : ${y}로 나누어 가져요`, eq:`${who} = ${QS}`, ans:N(m * part, '개'), g:{x, y, m, T:T_, who, part, other:w ? x : y}};
  },
  wrong(p){ const {m, other, T: t, x, y} = p.g; return [[N(m * other, '개'), '비의 순서를 다시 확인해요'], [N(Math.floor(t / 2), '개'), `${x} : ${y}로 나눠요. 똑같이 나누는 게 아니에요`]]; },
  hint(p){
    const {x, y, m, T: t, who, part} = p.g;
    return [S('전체를 몇 묶음으로 나눌까요?', `${x} + ${y} = ${QS}`, N(x + y)),
      S('한 묶음에 몇 개일까요?', `${t} ÷ ${x + y} = ${QS}`, N(m, '개')),
      S(`${who}는 ${part}묶음을 가져요.`, `${m} × ${part} = ${QS}`, p.ans)];
  },
};

// ═════ 6-2 원의 넓이 ═════
const PI = '(원주율 3.14)';
const cm = (n100, u) => Q(n100, 100, 'd', u);   // 백분의 일 단위 정수 → 소수
T.ci1 = {
  tip:'💡 원주 = 지름 × 원주율(3.14), 지름 = 반지름 × 2예요!',
  gen(){
    const r = rnd(1, 15), d = 2 * r, byR = !!rnd(0, 1);
    return {say:`${byR ? `반지름이 ${r}cm` : `지름이 ${d}cm`}인 원이에요 ${PI}`, eq:`원주 = ${QS}`, ans:cm(d * 314, 'cm'), g:{r, d, byR}};
  },
  wrong(p){
    const {r, d, byR} = p.g;
    return byR ? [[cm(r * 314, 'cm'), '반지름이 아니라 지름에 원주율을 곱해요'], [cm(r * r * 314, 'cm'), '넓이와 헷갈렸어요']]
               : [[cm(d * 2 * 314, 'cm'), '지름을 2배 하면 안 돼요'], [N(d * 3, 'cm'), '원주율은 3.14예요']];
  },
  hint(p){
    const {r, d, byR} = p.g;
    if (byR) return [S('지름 = 반지름 × 2', `${r} × 2 = ${QS}`, N(d, 'cm')), S('원주 = 지름 × 원주율', `${d} × 3.14 = ${QS}`, p.ans)];
    return [S('원주 = 지름 × 원주율이에요. 먼저 소수점을 떼고 곱해요.', `${d} × 314 = ${QS}`, N(d * 314)),
      S('3.14는 소수 두 자리니까 곱도 소수 두 자리로 소수점을 찍어요.', `${d} × 3.14 = ${QS}`, p.ans)];
  },
};
T.ci2 = {
  tip:'💡 지름 = 원주 ÷ 원주율, 반지름 = 지름 ÷ 2예요!',
  gen(){
    const askR = !!rnd(0, 1), d = askR ? 2 * rnd(1, 15) : rnd(2, 30), C = M.text(cm(d * 314));
    return {say:`원주가 ${C}cm인 원이에요 ${PI}`, eq:`${askR ? '반지름' : '지름'} = ${QS}`, ans:N(askR ? d / 2 : d, 'cm'), g:{d, askR, C}};
  },
  wrong(p){
    const {d, askR} = p.g;
    return askR ? [[N(d, 'cm'), '지름을 구했어요. 반지름은 지름 ÷ 2예요'], [N(2 * d, 'cm'), '반지름은 지름보다 작아요']]
                : [...(d % 2 ? [] : [[N(d / 2, 'cm'), '반지름을 구했어요. 지름은 원주 ÷ 원주율이에요']]), [N(2 * d, 'cm'), '2배 하지 않아요']];
  },
  hint(p){
    const {d, askR, C} = p.g, s1 = S('지름 = 원주 ÷ 원주율', `${C} ÷ 3.14 = ${QS}`, askR ? N(d, 'cm') : p.ans);
    return askR ? [s1, S('반지름 = 지름 ÷ 2', `${d} ÷ 2 = ${QS}`, p.ans)] : [s1];
  },
};
T.ci3 = {
  tip:'💡 원의 넓이 = 반지름 × 반지름 × 원주율(3.14)이에요!',
  gen(){
    const r = rnd(1, 12), byD = !!rnd(0, 1);
    return {say:`${byD ? `지름이 ${2 * r}cm` : `반지름이 ${r}cm`}인 원이에요 ${PI}`, eq:`넓이 = ${QS}`, ans:cm(r * r * 314, 'cm²'), g:{r, byD}};
  },
  wrong(p){ const {r} = p.g, d = 2 * r; return [[cm(d * d * 314, 'cm²'), '반지름이 아니라 지름으로 계산했어요'], [cm(d * 314, 'cm²'), '원주와 헷갈렸어요'], [N(r * r * 3, 'cm²'), '원주율은 3.14예요']]; },
  hint(p){
    const {r, byD} = p.g, s = [S('반지름 × 반지름', `${r} × ${r} = ${QS}`, N(r * r)), S('원주율 3.14를 곱해요.', `${r * r} × 3.14 = ${QS}`, p.ans)];
    return byD ? [S('반지름 = 지름 ÷ 2', `${2 * r} ÷ 2 = ${QS}`, N(r, 'cm')), ...s] : s;
  },
};

// ── 보기 고르기 ──
const isZero = v => v.t === 'q' && v.n === 0;
// 정답 v 에서 k 단위만큼 떨어진 값 (자연수 ±k, 소수는 끝자리 ±k, 분수는 분자 ±k, 백분율 ±5k%, 비는 한 항 ±k)
function near(v, k){
  if (v.t === 'r') return k > 0 ? R(v.a, v.b + k) : R(v.a - k, v.b);
  if (v.f === 'p') return Q(v.n * 20 + k * v.d, v.d * 20, 'p');
  if (v.f === 'd'){ const e = placesOf(v), P = P10(e); return Q(v.n * P + k * v.d, v.d * P, 'd', v.u); }
  return Q(v.n + k, v.d, v.f, v.u);
}
const okVal = (v, zero) => v && (v.t === 'r' ? v.a > 0 && v.b > 0 : v.t === 'q' && (v.n > 0 || (zero && v.n === 0)));
// ans 와 값이 다르고 서로 다른 오답 n 개 (흔한 실수 먼저, 모자라면 정답 근처 값)
function wrongs(ans, cands, n, ok, zero){
  const out = [], z = zero || isZero(ans);
  const push = v => { if (out.length < n && okVal(v, z) && !M.same(v, ans) && !out.some(o => M.same(o, v)) && (!ok || ok(v))) out.push(v); };
  cands.forEach(c => push(Array.isArray(c) ? c[0] : c));
  for (let k = 1; out.length < n && k < 400; k++){ push(near(ans, k)); push(near(ans, -k)); }
  return out;
}
const okFor = p => { const t = T[p.x]; return t.valid ? v => t.valid(p, v) : null; };

function has(id){ return !!T[String(id).replace(/^m-/, '')]; }
function gen(id){
  const x = String(id).replace(/^m-/, ''), t = T[x];
  if (!t) throw new Error('MathMore: 모르는 스테이지 ' + id);
  const p = t.gen();
  p.x = x;
  return p;
}
function distractors(p, n){ const t = T[p.x]; return wrongs(p.ans, t.wrong(p), n, okFor(p), t.zero); }
function hintPlan(p){
  const t = T[p.x], raw = t.hint(p);
  const steps = raw.map((s, i) => {
    const fin = i === raw.length - 1, cands = fin ? s.alt.concat(t.wrong(p)) : s.alt;
    const ch = wrongs(s.ans, cands, 2, fin ? okFor(p) : null, t.zero);
    ch.splice(rnd(0, ch.length), 0, s.ans);
    return {say:s.say, eq:s.eq, choices:ch, answer:s.ans};
  });
  return {kind:p.x, ext:true, name:'풀이 노트', steps, tip:t.tip};
}
const problemHtml = p => `<span class="mqs">${p.say}</span>${p.eq}`;
const answerHtml = p => p.eq.split(QS).join(`<b>${M.html(p.ans)}</b>`);
// 아이가 고른 오답이 왜 틀렸나
function why(p, w){
  const t = T[p.x], pre = `아까 고른 ${M.html(w)}${M.bat(w) ? '은' : '는'} `;
  const hit = t.wrong(p).find(c => M.same(c[0], w));
  if (hit) return pre + hit[1] + '.';
  const d = t.why && t.why(p, w);
  if (d) return pre + d + '.';
  return pre + `정답이 아니에요. 정답은 ${M.html(p.ans)}${M.bat(p.ans) ? '이에요' : '예요'}. 풀이 노트를 다시 따라가 봐요!`;
}

window.MathMore = {has, gen, distractors, hintPlan, problemHtml, answerHtml, why, QS, T, near, _v:{Q, N, Fr, Dn, R}};
})();
