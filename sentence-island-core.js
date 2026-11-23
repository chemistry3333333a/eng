/* =====================================================================
   워드 아일랜드 · 영어 문장섬 계산 (화면 없이 쓰는 부분, 테스트에서도 불러요)
   - 문장: sentences.js 의 STAGE_SENTENCES 중 SENT_GLOSS(덩어리 뜻)가 있는 것만 써요
   - 수준: 단어섬에서 깬 단원(별 1개 이상)의 문장이 나와요. 아직 깬 단원이 없으면 첫 단원 문장으로 시작해요
   - 저장: S.sent = {stamps, last, daily, learned:{영어 문장: 한 번에 맞힌 횟수}, played}
   ===================================================================== */
const SentIsland = (() => {
  const ROUND = 6;
  const TYPES = {
    daily: ['read', 'make', 'read', 'make', 'read', 'make'],   // 오늘의 문장: 해석 ↔ 만들기 번갈아
    read:  Array(ROUND).fill('read'),
    make:  Array(ROUND).fill('make'),
    challenge: Array(ROUND).fill('make'),   // 🏆 도전 만들기: 영어 순서 뜻 힌트 없이 (화면에서 숨겨요)
  };
  const REWARD = {   // 한 문장 끝낼 때: 한 번에 맞히면 clean, 아니면 retry
    normal:    {clean:{xp:10, coin:1}, retry:{xp:4, coin:0}},
    challenge: {clean:{xp:15, coin:2}, retry:{xp:6, coin:0}},
  };
  const reward = (mode, clean) => (REWARD[mode] || REWARD.normal)[clean ? 'clean' : 'retry'];
  const BOARD = 7;   // 도장판 한 판 칸 수

  const mix = (a, rnd = Math.random) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gloss = en => (SENT_GLOSS[en] || '').split('|').filter(Boolean);

  // 단어섬 순서(챕터 → 단원)대로, 덩어리 뜻이 있는 문장
  const UNITS = [];
  const BY_UNIT = {};
  CHAPTERS.forEach(ch => ch.stages.forEach(id => {
    // 단원 문장 전부에 뜻이 있어야 그 단원을 열어요 (다른 장과 문장이 겹쳐 한두 개만 있는 단원은 빼요)
    const src = STAGE_SENTENCES[id] || [];
    if (!src.length || !src.every(s => SENT_GLOSS[s.en])) return;
    UNITS.push(id);
    BY_UNIT[id] = src.map(s => ({unit:id, w:s.w, en:s.en, ko:s.ko, blocks:s.blocks, gloss:gloss(s.en)}));
  }));
  const ALL = UNITS.flatMap(id => BY_UNIT[id]);

  function ensure(S){
    const d = S.sent || (S.sent = {});
    if (typeof d.stamps !== 'number') d.stamps = 0;
    if (typeof d.last !== 'string') d.last = '';
    if (typeof d.daily !== 'string') d.daily = '';
    if (!d.learned || typeof d.learned !== 'object') d.learned = {};
    if (typeof d.played !== 'number') d.played = 0;
    return S;
  }

  // 단어섬에서 깬 단원 (없으면 첫 단원)
  function openUnits(S){
    const open = UNITS.filter(id => S.stages && S.stages[id] && S.stages[id].stars > 0);
    return open.length ? open : UNITS.slice(0, 1);
  }
  const pool = S => openUnits(S).flatMap(id => BY_UNIT[id]);

  // 한 판 문제: 덜 익힌 문장부터 6개, 종류는 mode 에 따라
  function pick(S, mode, rnd = Math.random){
    const L = S.sent ? S.sent.learned : {};
    const p = mix(pool(S), rnd).sort((a, b) => (L[a.en] || 0) - (L[b.en] || 0));
    const types = TYPES[mode] || TYPES.daily;
    return types.map((t, i) => ({t, s:p[i % p.length]}));
  }

  // 해석하기 보기: 정답 뜻 + 다른 문장의 같은 자리 뜻 2개
  // 영어 덩어리가 같은 뜻(is ↔ is)이나 같은 글자의 뜻은 빼서 헷갈리지 않게 해요
  function choices(s, i, rnd = Math.random, n = 3){
    const right = s.gloss[i], en = s.blocks[i].toLowerCase();
    const close = (typeof SENT_CLOSE !== 'undefined' ? SENT_CLOSE : []).find(g => g.includes(right)) || [];
    const ok = (o, j) => o.blocks[j].toLowerCase() !== en && o.gloss[j] !== right && !close.includes(o.gloss[j]);
    const seen = new Set([right]), out = [];
    const take = list => { for (const [o, j] of mix(list, rnd)){ if (out.length >= n - 1) break; const g = o.gloss[j]; if (!seen.has(g) && ok(o, j)){ seen.add(g); out.push(g); } } };
    take(ALL.filter(o => o.blocks.length > i).map(o => [o, i]));                       // 같은 자리
    if (out.length < n - 1) take(ALL.flatMap(o => o.blocks.map((_, j) => [o, j])));     // 모자라면 아무 자리
    return mix([right, ...out], rnd);
  }

  // 만들기: 덩어리를 섞되, 처음부터 정답 순서로 나오지는 않게
  function shuffleBlocks(s, rnd = Math.random){
    const idx = s.blocks.map((_, i) => i);
    let b; do { b = mix(idx, rnd); } while (b.every((v, i) => v === i));
    return b;
  }

  const stars = mistakes => mistakes <= 0 ? 3 : mistakes <= 2 ? 2 : 1;

  // 한 문장을 끝냈을 때: 한 번에 맞혔으면 익힌 횟수 +1
  function learn(S, en, clean){ ensure(S); if (clean) S.sent.learned[en] = (S.sent.learned[en] || 0) + 1; }
  const learnedCount = S => Object.keys((S.sent || {}).learned || {}).filter(k => S.sent.learned[k] > 0).length;

  // 오늘의 문장을 끝냈을 때 도장: 하루에 한 번만
  function finishDaily(S, today){
    ensure(S);
    const d = S.sent;
    if (d.daily === today) return {stamp:false, full:false};
    d.daily = today; d.stamps += 1; d.last = today;
    return {stamp:true, full:d.stamps % BOARD === 0};
  }
  // 도장판 보기: 이번 판에 찍힌 칸 수(0~7), 다 채운 판 수
  function board(S, today){
    const n = (S.sent || {}).stamps || 0;
    let on = n % BOARD;
    if (on === 0 && n > 0 && S.sent.last === today) on = BOARD;   // 오늘 막 다 채웠으면 꽉 찬 판을 보여 줘요
    return {on, size:BOARD, total:n, full:Math.floor(n / BOARD)};
  }
  const doneToday = (S, today) => !!S.sent && S.sent.daily === today;

  return {ROUND, TYPES, BOARD, reward, UNITS, BY_UNIT, ALL, gloss, ensure, openUnits, pool, pick, choices, shuffleBlocks,
    stars, learn, learnedCount, finishDaily, board, doneToday};
})();
