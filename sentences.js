/* =====================================================================
   워드 아일랜드 문장 목록 (단원 끝 "📜 문장 라운드")
   - 단원 번호(id)마다 그 단원 단어가 들어간 문장을 적어요. 문장이 있는 단원만 문장 라운드가 열려요.
   - 형식: {w:'단어', en:'영어 문장', ko:'한글 뜻', blocks:['블록','순서','대로']}
     · en 안에 w 가 배운 철자 그대로 들어가야 해요.
     · blocks 를 띄어쓰기로 이으면 en 에서 끝 문장부호를 뺀 것과 같아야 해요 (줄 세우기 문제).
   ===================================================================== */
const STAGE_SENTENCES = {
  1: [
    {w:'apple',      en:'This apple is red.',          ko:'이 사과는 빨간색이에요.',    blocks:['This apple','is','red']},
    {w:'banana',     en:'The banana is yellow.',       ko:'바나나는 노란색이에요.',     blocks:['The banana','is','yellow']},
    {w:'grape',      en:'I like grape juice.',         ko:'나는 포도 주스를 좋아해요.', blocks:['I','like','grape juice']},
    {w:'orange',     en:'This orange is big.',         ko:'이 오렌지는 커요.',          blocks:['This orange','is','big']},
    {w:'strawberry', en:'The strawberry is sweet.',    ko:'딸기는 달콤해요.',           blocks:['The strawberry','is','sweet']},
    {w:'watermelon', en:'I eat watermelon in summer.', ko:'나는 여름에 수박을 먹어요.', blocks:['I','eat','watermelon','in summer']},
    {w:'peach',      en:'The peach is soft.',          ko:'복숭아는 말랑해요.',         blocks:['The peach','is','soft']},
    {w:'lemon',      en:'The lemon is sour.',          ko:'레몬은 셔요.',               blocks:['The lemon','is','sour']},
  ],
};

// 화면 없이 쓰는 계산 (테스트에서도 불러요)
const SentenceCore = (() => {
  const ROUND = ['listen','listen','listen','order','order','order'];   // 쉬운 것부터
  const mix = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const list = id => STAGE_SENTENCES[id] || [];
  const find = (id, w) => list(id).find(s => s.w === w);
  return {
    has: id => list(id).length >= ROUND.length,
    list, find,
    // 문장 라운드 문제 순서: 단어가 겹치지 않게 6문제
    plan: id => mix(list(id)).slice(0, ROUND.length).map((s, i) => ({t:ROUND[i], w:s.w})),
    // 듣고 고르기 보기: 정답 문장 + 같은 단원의 다른 문장
    listenOpts: (id, w, n) => mix([find(id, w), ...mix(list(id).filter(s => s.w !== w)).slice(0, n - 1)]),
    // 블록을 섞되, 처음부터 정답 순서로 나오지는 않게
    shuffleBlocks: s => { let b; do { b = mix(s.blocks); } while (b.join(' ') === s.blocks.join(' ')); return b; },
    orderOk: (s, arr) => arr.join(' ') === s.blocks.join(' '),
    end: s => s.en.slice(s.blocks.join(' ').length),   // 끝 문장부호
  };
})();
