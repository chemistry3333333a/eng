/* =====================================================================
   워드 아일랜드 · 상점 아이템 데이터
   - 순수 데이터만 둬요 (DOM, S 를 건드리지 않아요)
   - unlock: {level:n} | {trophies:n} | {dex:n} | {mathTrophies:n} | null
   - cur: 'eng'(영어 코인) | 'math'(수학 💎)
   - perk: splash | slow | shield | pierce | coin | null
   ===================================================================== */
const SLOTS = ['hat','face','hand','back','effect','bg'];
const SLOT_ICON = {hat:'🎩', face:'👓', hand:'🗡️', back:'🎒', effect:'✨', bg:'🖼️'};
// 캐릭터: 무료 6종은 price 0 (늘 가진 것), 나머지는 아이템처럼 사요. legend 는 전설(상점 금테)
const BODIES = [
  {id:'kid1',    name:'꼬마',        word:'child',   icon:'🧒', price:0,   unlock:null, cur:'eng'},
  {id:'kid2',    name:'소녀',        word:'girl',    icon:'👧', price:0,   unlock:null, cur:'eng'},
  {id:'kid3',    name:'소년',        word:'boy',     icon:'👦', price:0,   unlock:null, cur:'eng'},
  {id:'cat',     name:'버터 고양이', word:'cat',     icon:'🐱', price:0,   unlock:null, cur:'eng'},
  {id:'dog',     name:'구름 강아지', word:'dog',     icon:'🐶', price:0,   unlock:null, cur:'eng'},
  {id:'bunny',   name:'솜사탕 토끼', word:'rabbit',  icon:'🐰', price:0,   unlock:null, cur:'eng'},
  {id:'chick',   name:'삐약 병아리', word:'chick',   icon:'🐥', price:120, unlock:null, cur:'eng'},
  {id:'hamster', name:'도토리 햄스터', word:'hamster', icon:'🐹', price:150, unlock:null, cur:'eng'},
  {id:'penguin', name:'아이스 펭귄', word:'penguin', icon:'🐧', price:200, unlock:null, cur:'eng'},
  {id:'bear',    name:'꿀 곰',       word:'bear',    icon:'🐻', price:250, unlock:{level:5}, cur:'eng'},
  {id:'panda',   name:'대나무 판다', word:'panda',   icon:'🐼', price:300, unlock:{level:10}, cur:'eng'},
  {id:'fox',     name:'노을 여우',   word:'fox',     icon:'🦊', price:350, unlock:{trophies:3}, cur:'eng'},
  {id:'unicorn', name:'아기 유니콘', word:'unicorn', icon:'🦄', price:500, unlock:{trophies:7}, cur:'eng', legend:true},
  {id:'robot',   name:'숫자 로봇',   word:'숫자 로봇',   icon:'🤖', price:200, unlock:{mathTrophies:1}, cur:'math'},
  {id:'dragon',  name:'아기 드래곤', word:'아기 드래곤', icon:'🐲', price:350, unlock:{mathTrophies:2}, cur:'math', legend:true},
];
const ITEMS = [
  // 모자
  {id:'cap',        slot:'hat',    word:'cap',        icon:'🧢', price:30,  perk:null,     unlock:null, cur:'eng'},
  {id:'ribbon',     slot:'hat',    word:'ribbon',     icon:'🎀', price:50,  perk:null,     unlock:null, cur:'eng'},
  {id:'tophat',     slot:'hat',    word:'hat',        icon:'🎩', price:100, perk:null,     unlock:null, cur:'eng'},
  {id:'helmet',     slot:'hat',    word:'helmet',     icon:'⛑️', price:180, perk:null,     unlock:{level:5}, cur:'eng'},
  {id:'crown',      slot:'hat',    word:'crown',      icon:'👑', price:450, perk:null,     unlock:{trophies:5}, cur:'eng'},
  {id:'flower',     slot:'hat',    word:'flower',     icon:'🌸', price:80,  perk:null,     unlock:null, cur:'eng'},
  {id:'beret',      slot:'hat',    word:'beret',      icon:'🎨', price:90,  perk:null,     unlock:null, cur:'eng'},
  {id:'magichat',   slot:'hat',    word:'magic hat',  icon:'🧙', price:220, perk:null,     unlock:{level:8}, cur:'eng'},
  // 얼굴
  {id:'glasses',    slot:'face',   word:'glasses',    icon:'👓', price:30,  perk:null,     unlock:null, cur:'eng'},
  {id:'mask',       slot:'face',   word:'mask',       icon:'😷', price:50,  perk:null,     unlock:null, cur:'eng'},
  {id:'sunglasses', slot:'face',   word:'sunglasses', icon:'🕶️', price:120, perk:null,     unlock:null, cur:'eng'},
  {id:'goggles',    slot:'face',   word:'goggles',    icon:'🥽', price:180, perk:null,     unlock:{dex:20}, cur:'eng'},
  {id:'beard',      slot:'face',   word:'beard',      icon:'🧔', price:300, perk:null,     unlock:{level:20}, cur:'eng'},
  {id:'bandage',    slot:'face',   word:'bandage',    icon:'🩹', price:30,  perk:null,     unlock:null, cur:'eng'},
  {id:'starsticker',slot:'face',   word:'star sticker', icon:'⭐', price:40, perk:null,    unlock:null, cur:'eng'},
  {id:'heartglasses',slot:'face',  word:'heart glasses', icon:'😍', price:90, perk:null,   unlock:null, cur:'eng'},
  // 손
  {id:'balloon',    slot:'hand',   word:'balloon',    icon:'🎈', price:30,  perk:null,     unlock:null, cur:'eng'},
  {id:'snowball',   slot:'hand',   word:'snowball',   icon:'⚪', price:100, perk:'slow',   unlock:null, cur:'eng'},
  {id:'wand',       slot:'hand',   word:'wand',       icon:'🪄', price:150, perk:'splash', unlock:{level:5}, cur:'eng'},
  {id:'shield',     slot:'hand',   word:'shield',     icon:'🛡️', price:150, perk:'shield', unlock:{level:10}, cur:'eng'},
  {id:'bow',        slot:'hand',   word:'bow',        icon:'🏹', price:400, perk:'pierce', unlock:{trophies:6}, cur:'eng'},
  {id:'lollipop',   slot:'hand',   word:'lollipop',   icon:'🍭', price:50,  perk:null,     unlock:null, cur:'eng'},
  {id:'icecream',   slot:'hand',   word:'ice cream',  icon:'🍦', price:60,  perk:null,     unlock:null, cur:'eng'},
  // 등
  {id:'umbrella',   slot:'back',   word:'umbrella',   icon:'☂️', price:40,  perk:null,     unlock:null, cur:'eng'},
  {id:'backpack',   slot:'back',   word:'backpack',   icon:'🎒', price:60,  perk:null,     unlock:null, cur:'eng'},
  {id:'cape',       slot:'back',   word:'cape',       icon:'🦸', price:120, perk:null,     unlock:null, cur:'eng'},
  {id:'bag',        slot:'back',   word:'bag',        icon:'👜', price:180, perk:'coin',   unlock:{dex:10}, cur:'eng'},
  {id:'wings',      slot:'back',   word:'wings',      icon:'🪽', price:350, perk:null,     unlock:{level:15}, cur:'eng'},
  {id:'butterfly',  slot:'back',   word:'butterfly wings', icon:'🦋', price:200, perk:null, unlock:{dex:30}, cur:'eng'},
  // 이펙트
  {id:'sparkle',    slot:'effect', word:'sparkle',    icon:'✨', price:60,  perk:null,     unlock:null, cur:'eng'},
  {id:'snow',       slot:'effect', word:'snow',       icon:'❄️', price:70,  perk:null,     unlock:null, cur:'eng'},
  {id:'heart',      slot:'effect', word:'heart',      icon:'💖', price:100, perk:null,     unlock:null, cur:'eng'},
  {id:'fire',       slot:'effect', word:'fire',       icon:'🔥', price:300, perk:null,     unlock:{trophies:3}, cur:'eng'},
  {id:'rainbow',    slot:'effect', word:'rainbow',    icon:'🌈', price:500, perk:null,     unlock:{trophies:9}, cur:'eng'},
  {id:'music',      slot:'effect', word:'music',      icon:'🎵', price:80,  perk:null,     unlock:null, cur:'eng'},
  // 배경
  {id:'bg_sky',     slot:'bg',     word:'sky',        icon:'🌤️', price:60,  perk:null,     unlock:null, cur:'eng'},
  {id:'bg_bubble',  slot:'bg',     word:'bubble',     icon:'🫧', price:90,  perk:null,     unlock:null, cur:'eng'},
  {id:'bg_garden',  slot:'bg',     word:'garden',     icon:'🌷', price:100, perk:null,     unlock:null, cur:'eng'},
  {id:'bg_night',   slot:'bg',     word:'night',      icon:'🌙', price:120, perk:null,     unlock:null, cur:'eng'},
  {id:'bg_spring',  slot:'bg',     word:'spring',     icon:'🏵️', price:150, perk:null,     unlock:null, cur:'eng'},
  {id:'bg_winter',  slot:'bg',     word:'winter',     icon:'☃️', price:160, perk:null,     unlock:null, cur:'eng'},
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
  {id:'m_grid', slot:'bg', word:'모눈 칠판', icon:'🔲', price:80, perk:null, unlock:null, cur:'math'},
  {id:'m_space', slot:'bg', word:'숫자 우주', icon:'🪐', price:250, perk:null, unlock:{mathTrophies:2}, cur:'math'},
];
// 구해 낸 친구(펫): 보스 id → [이모지, 이름]
const PETS = {
  10:  ['🐣','삐약이'],   103: ['🐞','무당이'],   104: ['🦊','꼬리'],    105: ['🦉','부엉'],
  20:  ['🦄','반짝이'],   106: ['🦔','고슴이'],   30:  ['🐬','돌돌이'],  107: ['🐧','펭펭'],
  108: ['🐲','용용이'],   109: ['🐻‍❄️','북극이'], 110: ['🧚','요정 루미'],
};
