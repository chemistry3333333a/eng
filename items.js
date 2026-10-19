/* =====================================================================
   워드 아일랜드 · 상점 아이템 데이터
   - 순수 데이터만 둬요 (DOM, S 를 건드리지 않아요)
   - unlock: {level:n} | {trophies:n} | {dex:n} | null
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
  {id:'cap',        slot:'hat',    word:'cap',        icon:'🧢', price:30,  perk:null,     unlock:null},
  {id:'ribbon',     slot:'hat',    word:'ribbon',     icon:'🎀', price:50,  perk:null,     unlock:null},
  {id:'tophat',     slot:'hat',    word:'hat',        icon:'🎩', price:100, perk:null,     unlock:null},
  {id:'helmet',     slot:'hat',    word:'helmet',     icon:'⛑️', price:180, perk:null,     unlock:{level:5}},
  {id:'crown',      slot:'hat',    word:'crown',      icon:'👑', price:450, perk:null,     unlock:{trophies:5}},
  // 얼굴
  {id:'glasses',    slot:'face',   word:'glasses',    icon:'👓', price:30,  perk:null,     unlock:null},
  {id:'mask',       slot:'face',   word:'mask',       icon:'😷', price:50,  perk:null,     unlock:null},
  {id:'sunglasses', slot:'face',   word:'sunglasses', icon:'🕶️', price:120, perk:null,     unlock:null},
  {id:'goggles',    slot:'face',   word:'goggles',    icon:'🥽', price:180, perk:null,     unlock:{dex:20}},
  {id:'beard',      slot:'face',   word:'beard',      icon:'🧔', price:300, perk:null,     unlock:{level:20}},
  // 손
  {id:'balloon',    slot:'hand',   word:'balloon',    icon:'🎈', price:30,  perk:null,     unlock:null},
  {id:'snowball',   slot:'hand',   word:'snowball',   icon:'⚪', price:100, perk:'slow',   unlock:null},
  {id:'wand',       slot:'hand',   word:'wand',       icon:'🪄', price:150, perk:'splash', unlock:{level:5}},
  {id:'shield',     slot:'hand',   word:'shield',     icon:'🛡️', price:150, perk:'shield', unlock:{level:10}},
  {id:'bow',        slot:'hand',   word:'bow',        icon:'🏹', price:400, perk:'pierce', unlock:{trophies:6}},
  // 등
  {id:'umbrella',   slot:'back',   word:'umbrella',   icon:'☂️', price:40,  perk:null,     unlock:null},
  {id:'backpack',   slot:'back',   word:'backpack',   icon:'🎒', price:60,  perk:null,     unlock:null},
  {id:'cape',       slot:'back',   word:'cape',       icon:'🦸', price:120, perk:null,     unlock:null},
  {id:'bag',        slot:'back',   word:'bag',        icon:'👜', price:180, perk:'coin',   unlock:{dex:10}},
  {id:'wings',      slot:'back',   word:'wings',      icon:'🪽', price:350, perk:null,     unlock:{level:15}},
  // 이펙트
  {id:'sparkle',    slot:'effect', word:'sparkle',    icon:'✨', price:60,  perk:null,     unlock:null},
  {id:'snow',       slot:'effect', word:'snow',       icon:'❄️', price:70,  perk:null,     unlock:null},
  {id:'heart',      slot:'effect', word:'heart',      icon:'💖', price:100, perk:null,     unlock:null},
  {id:'fire',       slot:'effect', word:'fire',       icon:'🔥', price:300, perk:null,     unlock:{trophies:3}},
  {id:'rainbow',    slot:'effect', word:'rainbow',    icon:'🌈', price:500, perk:null,     unlock:{trophies:9}},
];
// 구해 낸 친구(펫): 보스 id → [이모지, 이름]
const PETS = {
  10:  ['🐣','삐약이'],   103: ['🐞','무당이'],   104: ['🦊','꼬리'],    105: ['🦉','부엉'],
  20:  ['🦄','반짝이'],   106: ['🦔','고슴이'],   30:  ['🐬','돌돌이'],  107: ['🐧','펭펭'],
  108: ['🐲','용용이'],   109: ['🐻‍❄️','북극이'], 110: ['🧚','요정 루미'],
};
