/* =====================================================================
   워드 아일랜드 · 상점 아이템 데이터
   - 순수 데이터만 둬요 (DOM, S 를 건드리지 않아요)
   - unlock: {level:n} | {trophies:n} | {dex:n} | {mathTrophies:n} | null
   - cur: 'eng'(영어 코인) | 'math'(수학 💎)
   - perk: splash | slow | shield | pierce | coin | null
   ===================================================================== */
const SLOTS = ['hat','face','hand','back','effect'];
const SLOT_ICON = {hat:'🎩', face:'👓', hand:'🗡️', back:'🎒', effect:'✨'};
const BODIES = [
  {id:'kid1', icon:'🧒'}, {id:'kid2', icon:'👧'}, {id:'kid3', icon:'👦'},
  {id:'cat', icon:'🐱'}, {id:'dog', icon:'🐶'}, {id:'bunny', icon:'🐰'},
];
const ITEMS = [
  // 모자
  {id:'cap',        slot:'hat',    word:'cap',        icon:'🧢', price:30,  perk:null,     unlock:null, cur:'eng'},
  {id:'ribbon',     slot:'hat',    word:'ribbon',     icon:'🎀', price:50,  perk:null,     unlock:null, cur:'eng'},
  {id:'tophat',     slot:'hat',    word:'hat',        icon:'🎩', price:100, perk:null,     unlock:null, cur:'eng'},
  {id:'helmet',     slot:'hat',    word:'helmet',     icon:'⛑️', price:180, perk:null,     unlock:{level:5}, cur:'eng'},
  {id:'crown',      slot:'hat',    word:'crown',      icon:'👑', price:450, perk:null,     unlock:{trophies:5}, cur:'eng'},
  // 얼굴
  {id:'glasses',    slot:'face',   word:'glasses',    icon:'👓', price:30,  perk:null,     unlock:null, cur:'eng'},
  {id:'mask',       slot:'face',   word:'mask',       icon:'😷', price:50,  perk:null,     unlock:null, cur:'eng'},
  {id:'sunglasses', slot:'face',   word:'sunglasses', icon:'🕶️', price:120, perk:null,     unlock:null, cur:'eng'},
  {id:'goggles',    slot:'face',   word:'goggles',    icon:'🥽', price:180, perk:null,     unlock:{dex:20}, cur:'eng'},
  {id:'beard',      slot:'face',   word:'beard',      icon:'🧔', price:300, perk:null,     unlock:{level:20}, cur:'eng'},
  // 손
  {id:'balloon',    slot:'hand',   word:'balloon',    icon:'🎈', price:30,  perk:null,     unlock:null, cur:'eng'},
  {id:'snowball',   slot:'hand',   word:'snowball',   icon:'⚪', price:100, perk:'slow',   unlock:null, cur:'eng'},
  {id:'wand',       slot:'hand',   word:'wand',       icon:'🪄', price:150, perk:'splash', unlock:{level:5}, cur:'eng'},
  {id:'shield',     slot:'hand',   word:'shield',     icon:'🛡️', price:150, perk:'shield', unlock:{level:10}, cur:'eng'},
  {id:'bow',        slot:'hand',   word:'bow',        icon:'🏹', price:400, perk:'pierce', unlock:{trophies:6}, cur:'eng'},
  // 등
  {id:'umbrella',   slot:'back',   word:'umbrella',   icon:'☂️', price:40,  perk:null,     unlock:null, cur:'eng'},
  {id:'backpack',   slot:'back',   word:'backpack',   icon:'🎒', price:60,  perk:null,     unlock:null, cur:'eng'},
  {id:'cape',       slot:'back',   word:'cape',       icon:'🦸', price:120, perk:null,     unlock:null, cur:'eng'},
  {id:'bag',        slot:'back',   word:'bag',        icon:'👜', price:180, perk:'coin',   unlock:{dex:10}, cur:'eng'},
  {id:'wings',      slot:'back',   word:'wings',      icon:'🪽', price:350, perk:null,     unlock:{level:15}, cur:'eng'},
  // 이펙트
  {id:'sparkle',    slot:'effect', word:'sparkle',    icon:'✨', price:60,  perk:null,     unlock:null, cur:'eng'},
  {id:'snow',       slot:'effect', word:'snow',       icon:'❄️', price:70,  perk:null,     unlock:null, cur:'eng'},
  {id:'heart',      slot:'effect', word:'heart',      icon:'💖', price:100, perk:null,     unlock:null, cur:'eng'},
  {id:'fire',       slot:'effect', word:'fire',       icon:'🔥', price:300, perk:null,     unlock:{trophies:3}, cur:'eng'},
  {id:'rainbow',    slot:'effect', word:'rainbow',    icon:'🌈', price:500, perk:null,     unlock:{trophies:9}, cur:'eng'},
  // 수학 섬 (💎 수학 코인으로 사요)
  {id:'m_numhat', slot:'hat', word:'숫자 모자', icon:'🔢', price:40, perk:null, unlock:null, cur:'math'},
  {id:'m_pi', slot:'hat', word:'파이 모자', icon:'🥧', price:120, perk:null, unlock:{level:5}, cur:'math'},
  {id:'m_glass', slot:'face', word:'공부 안경', icon:'🤓', price:50, perk:null, unlock:null, cur:'math'},
  {id:'m_ruler', slot:'hand', word:'자 지팡이', icon:'📏', price:40, perk:null, unlock:null, cur:'math'},
  {id:'m_tri', slot:'hand', word:'삼각자 칼', icon:'📐', price:120, perk:null, unlock:null, cur:'math'},
  {id:'m_abacus', slot:'hand', word:'주판 방패', icon:'🧮', price:200, perk:null, unlock:{mathTrophies:1}, cur:'math'},
  {id:'m_cape', slot:'back', word:'등호 망토', icon:'🟰', price:80, perk:null, unlock:null, cur:'math'},
  {id:'m_plus', slot:'effect', word:'더하기 반짝이', icon:'➕', price:60, perk:null, unlock:null, cur:'math'},
  {id:'m_star', slot:'effect', word:'백점 이펙트', icon:'💯', price:300, perk:null, unlock:{mathTrophies:2}, cur:'math'},
];
// 구해 낸 친구(펫): 보스 id → [이모지, 이름]
const PETS = {
  10:  ['🐣','삐약이'],   103: ['🐞','무당이'],   104: ['🦊','꼬리'],    105: ['🦉','부엉'],
  20:  ['🦄','반짝이'],   106: ['🦔','고슴이'],   30:  ['🐬','돌돌이'],  107: ['🐧','펭펭'],
  108: ['🐲','용용이'],   109: ['🐻‍❄️','북극이'], 110: ['🧚','요정 루미'],
};
