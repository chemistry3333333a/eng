/* =====================================================================
   워드 아일랜드 · 마을 장식 데이터
   - 순수 데이터만 둬요 (DOM, S, three 를 건드리지 않아요)
   - price: 있으면 상점에서 사요 / gift: 있으면 조건을 채울 때 선물로 들어와요 (둘 다 가질 수 있어요)
   - gift: {first:true} | {level:n} | {trophies:n} | {dex:n} | {mathTrophies:n}, giftCount 는 선물 개수 (기본 1)
   - unlock: 아이템과 같은 잠금 (살 수 있게 되는 조건)
   - w, d: 바닥에서 차지하는 칸 수 (한 칸 = 0.5), stack: 여러 개 살 수 있어요
   ===================================================================== */
const DECOR = [
  // 건물
  {id:'cottage',    kind:'building', word:'cottage',  name:'오두막',     icon:'🏡', price:150, cur:'eng', unlock:null, gift:{first:true}, w:4, d:4},
  {id:'house',      kind:'building', word:'house',    name:'파란 지붕 집', icon:'🏠', price:220, cur:'eng', unlock:null, w:4, d:4},
  {id:'bakery',     kind:'building', word:'bakery',   name:'빵집',       icon:'🥐', price:260, cur:'eng', unlock:{level:3}, w:4, d:4},
  {id:'tower',      kind:'building', word:'tower',    name:'마법사 탑',   icon:'🗼', price:400, cur:'eng', unlock:{trophies:3}, w:3, d:3},
  {id:'castle',     kind:'building', word:'castle',   name:'성',         icon:'🏰', price:500, cur:'eng', unlock:{trophies:7}, w:6, d:6, legend:true},
  {id:'well',       kind:'building', word:'well',     name:'우물',       icon:'🪣', cur:'eng', unlock:null, gift:{level:5}, w:2, d:2},
  {id:'windmill',   kind:'building', word:'windmill', name:'풍차',       icon:'🌬️', cur:'eng', unlock:null, gift:{level:10}, w:4, d:4},
  {id:'bridge',     kind:'building', word:'bridge',   name:'돌다리',     icon:'🌉', cur:'eng', unlock:null, gift:{dex:30}, w:4, d:2},
  {id:'clocktower', kind:'building', word:'시계탑',   name:'시계탑',     icon:'🕰️', price:300, cur:'math', unlock:{mathTrophies:1}, w:3, d:3},
  {id:'fountain',   kind:'building', word:'분수',     name:'숫자 분수',   icon:'⛲', price:200, cur:'math', unlock:null, w:3, d:3},
  // 장식
  {id:'tree',       kind:'decor', word:'tree',    name:'나무',     icon:'🌳', price:40, cur:'eng', unlock:null, gift:{first:true}, giftCount:2, stack:true, w:2, d:2},
  {id:'pine',       kind:'decor', word:'pine',    name:'소나무',   icon:'🌲', price:40, cur:'eng', unlock:null, stack:true, w:2, d:2},
  {id:'flower',     kind:'decor', word:'flower',  name:'꽃밭',     icon:'🌷', price:20, cur:'eng', unlock:null, stack:true, w:1, d:1},
  {id:'lamp',       kind:'decor', word:'lamp',    name:'가로등',   icon:'🏮', price:50, cur:'eng', unlock:null, stack:true, w:1, d:1},
  {id:'fence',      kind:'decor', word:'fence',   name:'울타리',   icon:'🪵', price:30, cur:'eng', unlock:null, stack:true, w:2, d:1},
  {id:'bench',      kind:'decor', word:'bench',   name:'벤치',     icon:'🪑', price:60, cur:'eng', unlock:null, stack:true, w:2, d:1},
  {id:'path',       kind:'decor', word:'path',    name:'돌길',     icon:'🪨', price:10, cur:'eng', unlock:null, gift:{first:true}, giftCount:6, stack:true, w:2, d:2},
  {id:'pond',       kind:'decor', word:'pond',    name:'연못',     icon:'💧', price:180, cur:'eng', unlock:null, w:4, d:3},
  {id:'mailbox',    kind:'decor', word:'mailbox', name:'우체통',   icon:'📮', cur:'eng', unlock:null, gift:{trophies:1}, w:1, d:1},
];
