/* =====================================================================
   워드 아일랜드 · 수학 핵심 (수, 그리기 문자열, 오답, 힌트 계획)
   - DOM 을 안 건드려요. 계산과 문자열만!
   - 소수는 {t:'d', h} (h = 값×100), 분수는 {t:'f', w, n, d} (0 ≤ n < d, 약분 안 함)
   - 화면 문구는 항상 html() 로 (분수는 위아래로 쌓아요). text() 는 테스트·로그용
   ===================================================================== */
(function(){
// ── 수 만들기 ──
const D = h => ({t:'d', h});
const dec = x => D(Math.round(x * 100));
// 가분수는 자연수로 올려요 (7/5 → 1 2/5)
function frac(w, n, d){ const T = w * d + n, W = Math.floor(T / d); return {t:'f', w:W, n:T - W * d, d}; }
const isD = v => v.t === 'd';
const tot = v => v.w * v.d + v.n;                 // 분수 → 분자 총합
const tot0 = v => isD(v) ? v.h : tot(v);         // 기본 단위 개수 (부호 확인용)
const neg = v => tot0(v) < 0;
const dig = (h, i) => Math.floor(h / Math.pow(10, i)) % 10;   // i: 0 백분의 일, 1 십분의 일, 2 일…

// 값이 같나 (0.3 = 0.30, 1/5 = 2/10). 소수·분수가 섞이면 false
function same(a, b){
  if (a.t !== b.t) return false;
  return isD(a) ? a.h === b.h : tot(a) * b.d === tot(b) * a.d;
}
function chk(a, b){
  if (a.t !== b.t || (!isD(a) && a.d !== b.d)) throw new Error('MathCore: 같은 종류, 같은 분모끼리만 계산해요');
}
function add(a, b){ chk(a, b); return isD(a) ? D(a.h + b.h) : frac(0, tot(a) + tot(b), a.d); }
function sub(a, b){ chk(a, b); return isD(a) ? D(a.h - b.h) : frac(0, tot(a) - tot(b), a.d); }
const le = (a, b) => isD(a) ? a.h <= b.h : tot(a) * b.d <= tot(b) * a.d;
// 기본 단위 k 개만큼 옮기기 (소수: 백분의 일, 분수: 1/d)
const shift = (v, k) => isD(v) ? D(v.h + k) : frac(0, tot(v) + k, v.d);
const whole = v => isD(v) ? D(Math.floor(v.h / 100) * 100) : frac(v.w, 0, v.d);
const one = v => isD(v) ? 100 : v.d;              // 1 = 기본 단위 몇 개
// 흔한 자리 실수: ×10, ÷10, 분모 두 배(분모끼리 더하기)
const x10 = v => isD(v) ? D(v.h * 10) : null;
const d10 = v => isD(v) && v.h % 10 === 0 ? D(v.h / 10) : null;
const dbl = v => isD(v) ? null : frac(v.w, v.n, 2 * v.d);

// ── 글자 ──
function text(v){
  if (isD(v)){
    const s = v.h < 0 ? '-' : '', h = Math.abs(v.h), w = Math.floor(h / 100), r = h % 100;
    return s + (r === 0 ? w : r % 10 === 0 ? w + '.' + r / 10 : w + '.' + String(r).padStart(2, '0'));
  }
  if (v.n === 0) return String(v.w);
  return (v.w ? v.w + ' ' : '') + v.n + '/' + v.d;
}
// 화면용: 분수는 분자 위, 가로줄, 분모 아래
function html(v, cls){
  let s;
  if (isD(v) || v.n === 0) s = text(v);
  else {
    const f = `<span class="mf"><span>${v.n}</span><span class="md">${v.d}</span></span>`;
    s = v.w ? `<span class="mx">${v.w}${f}</span>` : f;
  }
  return cls ? `<span class="${cls}">${s}</span>` : s;
}
const SIGN = {'+':'+', '-':'−'};
const problemHtml = p => `${html(p.a)} ${SIGN[p.op]} ${html(p.b)} = ?`;
// 받침: 마지막으로 읽는 숫자 (분수는 분자, "오분의 이")
function bat(v){ const s = !isD(v) && v.n ? String(v.n) : text(v); return '013678'.includes(s[s.length - 1]); }
const jo = (v, a, b) => bat(v) ? a : b;

// ── 오답 ──
function decUnit(a, b){ return a.h % 10 || b.h % 10 ? 1 : 10; }
const places = v => v.h % 10 ? 2 : v.h % 100 ? 1 : 0;
function mistakes(p){
  const {a, b, op, ans} = p;
  if (isD(a)){
    if (op === '+'){
      const out = [], pa = places(a), pb = places(b);
      // 자리 안 맞추기: 끝자리끼리 맞춰 더해요 (0.35 + 0.8 → 0.43)
      if (pa !== pb){ const [lo, sh] = pa > pb ? [a, b] : [b, a]; out.push(D(lo.h + sh.h / Math.pow(10, Math.abs(pa - pb)))); }
      // 받아올림을 아래 자리에 붙여 쓰기 (2.7 + 1.4 → 3.11)
      if (Math.max(pa, pb) === 1){
        const t = dig(a.h, 1) + dig(b.h, 1);
        if (t >= 10) out.push(D((Math.floor(a.h / 100) + Math.floor(b.h / 100)) * 100 + t));
      }
      out.push(D(ans.h - 100), D(ans.h - 10));    // 받아올림 빠뜨리기
      return out;
    }
    // 큰 숫자에서 작은 숫자 빼기 (자리마다 |차|)
    let h = 0;
    for (let i = 0, m = Math.max(a.h, b.h); Math.pow(10, i) <= m; i++) h += Math.abs(dig(a.h, i) - dig(b.h, i)) * Math.pow(10, i);
    return [D(h), D(ans.h + 10), D(ans.h + 100)]; // 받아내림 후 윗자리 안 줄이기
  }
  const d = a.d;
  if (op === '+') return [frac(a.w + b.w, a.n + b.n, 2 * d), shift(ans, -d), shift(ans, -1)];
  const out = [];
  if (a.w >= b.w) out.push(frac(a.w - b.w, Math.abs(a.n - b.n), d));   // 분자 자리 바꿔 빼기
  out.push(shift(ans, d));                                              // 자연수 안 줄이기
  return out;
}
// 정답과 값이 다르고 서로 다른 오답 n 개. 모자라면 정답 ±1단위로 채워요
function distractors(p, n){
  const out = [], ans = p.ans;
  const push = v => { if (v && !neg(v) && !same(v, ans) && !out.some(o => same(o, v))) out.push(v); };
  mistakes(p).forEach(push);
  const u = isD(ans) ? decUnit(p.a, p.b) : 1;
  for (let k = 1; out.length < n; k++){ push(shift(ans, k * u)); push(shift(ans, -k * u)); }
  return out.slice(0, n);
}

// ── 힌트 계획 ──
// 보기 3개: 정답 + 흔한 실수 (값 중복 빼고), 모자라면 ±u 단위. 정답 자리는 단계마다 달라요
function opts(ans, cands, u, seed){
  const out = [];
  const push = v => { if (out.length < 2 && v && !neg(v) && !same(v, ans) && !out.some(o => same(o, v))) out.push(v); };
  cands.forEach(push);
  for (let k = 1; out.length < 2; k++){ push(shift(ans, k * u)); push(shift(ans, -k * u)); }
  out.splice((seed + (isD(ans) ? ans.h : tot(ans))) % 3, 0, ans);
  return out;
}
const Q = '<span class="co">?</span>';
const ask = (say, eq, answer, cands, u, i) => ({say, eq, choices:opts(answer, cands, u, i), answer});
// 마지막 단계: 원래 문제의 답 (보기는 오답 규칙 그대로)
const finalStep = (p, say, eq, u, i) => ask(say, eq, p.ans, distractors(p, 4), u, i);

function hintPlan(p){ return p.op === '+' ? planAdd(p) : planSub(p); }

function planAdd(p){
  const {a, b} = p, fd = !isD(a);
  let carry, lA = true, unit, need;
  if (fd){
    unit = a.d; carry = a.n + b.n >= a.d;
    if (carry){ lA = a.n >= b.n; need = frac(0, a.d - (lA ? a : b).n, a.d); }
  } else {
    const c0 = dig(a.h, 0) + dig(b.h, 0) >= 10, c1 = dig(a.h, 1) + dig(b.h, 1) + (c0 ? 1 : 0) >= 10;
    carry = c0 || c1; unit = decUnit(a, b);
    if (carry){
      // 받아올림이 생기는 가장 낮은 자리 pi. L: 그 아래 자리가 0 인 쪽 먼저, 아니면 pi 자리 숫자가 큰 쪽
      const pi = c0 ? 0 : 1, za = pi > 0 && dig(a.h, 0) === 0, zb = pi > 0 && dig(b.h, 0) === 0;
      lA = za !== zb ? za : dig(a.h, pi) >= dig(b.h, pi);
      unit = c0 ? 1 : 10;
      need = D((10 - dig((lA ? a : b).h, pi)) * unit);
    }
  }
  const L = lA ? a : b, R = lA ? b : a, u = fd ? 1 : unit;
  const cl = v => html(v, v === L ? 'cb' : 'co');
  const eq0 = `${cl(a)} + ${cl(b)} = ?`;
  const Lh = html(L), Rh = html(R);
  if (!carry){
    const name = '같은 블록 모으기';
    return {kind:'gather', L, R, need:R, rest:null, made:null, unit, name, whole:null, afterWhole:null, steps:[
      {say:`<b>${name}</b>를 하자 🎯<br>${Rh}${jo(R, '을', '를')} 한 번에 끌어서 ${Lh} 쪽으로 옮겨 줘 ✋`, eq:eq0, drag:true},
      finalStep(p, `다 모였어! 같은 블록끼리 세어 보자. ${Lh} + ${Rh}${jo(R, '은', '는')}?`, eq0, u, 1),
    ]};
  }
  const made = add(L, need), rest = sub(R, need);
  const name = `${text(made)} 만들기 작전`;
  const Nh = html(need), Mh = html(made), Sh = html(rest);
  const piece = fd ? '조각이' : unit === 10 ? '막대가' : '작은 칸이';
  const restSay = tot0(rest) ? `이제 남은 ${Sh}만 더하면 끝!` : '남은 건 0이니까 그대로야!';
  // 왼쪽 틀 안의 조각 (빈칸 대신 있는 것을 고르는 실수)
  const inFrame = fd ? frac(0, L.n, L.d) : D(dig(L.h, unit === 10 ? 1 : 0) * unit);
  const madeEq = lA ? `${html(L, 'cb')} + ${html(need, 'cg')} + ${html(rest, 'co')} = ?`
                    : `${html(rest, 'co')} + ${html(need, 'cg')} + ${html(L, 'cb')} = ?`;
  const lastEq = lA ? `${html(made, 'hl')} + ${html(rest, 'co')} = ?` : `${html(rest, 'co')} + ${html(made, 'hl')} = ?`;
  const madeCands = fd ? [frac(L.w, L.n + need.n, 2 * L.d), shift(made, -1), shift(made, L.d)]
                       : [need.h % 10 === 0 ? D(L.h + need.h / 10) : null, x10(made), d10(made)];
  return {kind:'make', L, R, need, rest, made, unit, name, whole:null, afterWhole:null, steps:[
    ask(`<b>${name}</b>을 쓰자 🎯<br>${Lh}에 ${piece} 얼마 더 있으면 틀이 꽉 차서 <b>${Mh}</b>${jo(made, '이', '가')} 될까?`,
        eq0, need, [inFrame, dbl(need), x10(need), d10(need)], u, 0),
    {say:`맞아, ${Nh}${jo(need, '이', '가')} 모자라! ${Rh}에서 <b>${Nh} 묶음을 끌어서</b> 왼쪽 빈칸에 넣어 줘 ✋`, eq:eq0, drag:true},
    ask(`짜잔! ${Rh}에서 ${Nh}${jo(need, '을', '를')} 떼어 주고 남은 건 얼마일까?`,
        `${html(R, 'co')} = ${html(need, 'cg')} + ${Q}`, rest, [add(R, need), dbl(rest), d10(rest), x10(rest)], u, 2),
    ask(`틀이 꽉 찼어! ${Lh} + ${Nh}${jo(need, '은', '는')}?`, madeEq, made, madeCands, u, 3),
    finalStep(p, `딱 ${Mh}${jo(made, '이', '가')} 됐어! 🎉 ${restSay} ${Mh} + ${Sh}${jo(rest, '은', '는')}?`, lastEq, u, 4),
  ]};
}

// 판이나 막대를 쪼개는 말 (v 에서 r 을 뺄 때). 판을 쪼갰는데 작은 칸까지 필요하면 두 번 쪼개요
function splitWord(v, r){
  if (!isD(v)) return `판 1장을 ${v.d}칸으로`;
  if (v.h % 100 !== 0) return '막대 1개를 작은 칸 10개로';
  return r.h % 10 ? '판 1장을 막대 10개로, 막대 1개를 작은 칸 10개로' : '판 1장을 막대 10개로';
}

function planSub(p){
  const {a, b} = p, fd = !isD(a), L = a, R = b;
  let borrow;
  if (fd) borrow = a.n < b.n;
  else { const b0 = dig(a.h, 0) < dig(b.h, 0); borrow = b0 || dig(a.h, 1) - (b0 ? 1 : 0) < dig(b.h, 1); }
  const Lh = html(L), Rh = html(R), eq0 = `${html(L, 'cb')} − ${html(R, 'co')} = ?`;
  if (!borrow){
    const name = '빼내기', unit = fd ? a.d : decUnit(a, b);
    return {kind:'take', L, R, need:R, rest:null, made:null, unit, name, whole:null, afterWhole:null, steps:[
      {say:`<b>${name}</b>를 하자 🎯<br>${Lh}에서 ${Rh}만큼 묶음을 끌어서 빼내 줘 ✋`, eq:eq0, drag:true},
      finalStep(p, `남은 블록을 세어 보자. ${Lh} − ${Rh}${jo(R, '은', '는')}?`, eq0, fd ? 1 : unit, 1),
    ]};
  }
  // 빼는 수에 자연수가 있으면 그것부터 빼요 (3 1/5 − 1 3/5 → 3 1/5 − 1)
  const W = whole(R), hasW = tot0(W) > 0;
  const Lc = sub(L, W), Rr = sub(R, W), Lch = html(Lc), Rrh = html(Rr);
  const steps = [];
  if (hasW) steps.push(ask(`먼저 자연수부터 빼자! ${Lh} − ${html(W)}${jo(W, '은', '는')}?`,
    `${html(L, 'cb')} − ${html(W, 'co')} = ?`, Lc, [add(L, W), shift(Lc, -one(L)), shift(Lc, one(L))], one(L), 5));
  const eqC = `${html(Lc, 'cb')} − ${html(Rr, 'co')} = ?`;
  // 받아내림 자리 아래 조각 (0.53 → 0.03, 1.2 → 0.2, 1 2/5 → 2/5)
  // 백분의 일 자리에서 받아내림이 있을 때만 그 자리 조각, 아니면 소수 부분 전체 (1.25 − 0.4 → 0.25)
  const b0 = !fd && dig(Lc.h, 0) < dig(Rr.h, 0);
  const need = fd ? frac(0, Lc.n, Lc.d) : D(b0 && Lc.h % 10 || Lc.h % 100);
  const n0 = k => steps.length + k;   // 보기 정답 자리용 단계 번호
  if (!(tot0(need) > 0 && le(need, Rr))){
    const name = '쪼개서 빼기', unit = fd ? a.d : decUnit(Lc, Rr);
    steps.push({say:`<b>${name}</b>를 하자 🎯<br>${splitWord(Lc, Rr)} 쪼개서 ${Rrh}만큼 끌어서 빼내 줘 ✋`, eq:eqC, drag:true});
    steps.push(finalStep(p, `남은 블록을 세어 보자! ${Lch} − ${Rrh}${jo(Rr, '은', '는')}?`, eqC, fd ? 1 : unit, n0(0)));
    return {kind:'break', L, R, need:Rr, rest:null, made:null, unit, name,
            whole:hasW ? W : null, afterWhole:hasW ? Lc : null, steps};
  }
  const made = sub(Lc, need), rest = sub(Rr, need), unit = fd ? a.d : need.h % 10 ? 1 : 10, u = fd ? 1 : unit;
  const name = `${text(made)}까지 내려가기`;
  const Nh = html(need), Mh = html(made), Sh = html(rest);
  steps.push(
    ask(`<b>${name}</b>를 하자 🎯<br>${Lch}에서 얼마를 먼저 빼면 <b>${Mh}</b>${jo(made, '이', '가')} 될까?`, eqC, need,
        fd ? [dbl(need), frac(0, need.d - need.n, need.d), shift(need, 1)] : [x10(need), d10(need), made], u, n0(0)),
    {say:`맞아! ${Lch}에서 <b>${Nh} 묶음을 끌어서</b> 빼내 줘 ✋`, eq:`${html(Lc, 'cb')} − ${html(need, 'cg')} = ?`, drag:true},
    ask(`이제 빼는 수 ${Rrh}도 쪼개 보자. ${Rrh}에서 ${Nh}${jo(need, '을', '를')} 먼저 뺐으니까 남은 건 얼마일까?`,
        `${html(Rr, 'co')} = ${html(need, 'cg')} + ${Q}`, rest, [add(Rr, need), dbl(rest), d10(rest), x10(rest)], u, n0(2)),
    ask(`${Lch} − ${Nh}${jo(need, '은', '는')}?`, `${html(Lc, 'cb')} − ${html(need, 'cg')} − ${html(rest, 'co')} = ?`, made,
        [add(Lc, need), x10(made), d10(made), shift(made, one(made))], u, n0(3)),
    finalStep(p, `딱 ${Mh}${jo(made, '이', '가')} 됐어! 🎉 이제 ${splitWord(made, rest)} 쪼개서 ${Sh}${jo(rest, '을', '를')} 빼면 끝! ${Mh} − ${Sh}${jo(rest, '은', '는')}?`,
        `${html(made, 'hl')} − ${html(rest, 'co')} = ?`, u, n0(4)),
  );
  return {kind:'down', L, R, need, rest, made, unit, name, whole:hasW ? W : null, afterWhole:hasW ? Lc : null, steps};
}

window.MathCore = {dec, frac, same, add, sub, text, html, problemHtml, distractors, hintPlan};
})();
