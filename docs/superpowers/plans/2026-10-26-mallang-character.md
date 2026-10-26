# 말랑 캐릭터 + 상점 개편 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이모지 캐릭터를 SVG 말랑 캐릭터 15종으로 바꾸고, 표정 9가지가 게임 상황에 맞춰 바뀌며, 상점에 캐릭터 모으기·새 아이템·배경 칸을 더한다.

**Architecture:** 그림은 새 파일 `avatar-art.js`(`window.AvatarArt`, DOM·S 안 건드리는 순수 문자열 생성)에 모은다. `avatar.js`는 지금처럼 구매·장착·저장 계산과 `render`/`react`를 맡되, 그리기를 `AvatarArt`에 맡긴다. 캐릭터를 쓰는 화면들은 `Avatar.render`/`react`만 부르므로, 호출부는 표정 힌트(`mood`, `combo`, `boss`)만 더한다.

**Tech Stack:** 빌드 없는 HTML/JS, `<script src>`, 인라인 SVG + CSS 애니메이션, `localStorage`, Node `node:test` + `vm` 로더(`tests/load.js`).

**Spec:** `docs/superpowers/specs/2026-10-26-mallang-character-design.md` (그림 기준 시안: `docs/superpowers/specs/2026-10-26-mallang-character-mockup.html`)

## Global Constraints

- 테스트 명령은 `node --test tests/*.test.js` (`node --test tests/`는 이 환경에서 실패한다).
- 그림 좌표·표정·아이템 그리는 법은 시안 파일을 기준으로 한다. 머리 중심 (60,58) r40, 몸 (60,112) 타원, 외곽선 2.2px, 눈 (46,62)/(74,62), 볼터치, 바닥 그림자.
- `avatar-art.js`가 넣는 CSS 클래스와 keyframes 이름은 모두 `av-` 접두어를 쓴다(시안의 `.fl .ey .tw .fa .ri .up`은 `av-fl` 등으로). `boss.js`가 이미 `.tw` 클래스를 쓴다.
- SVG 안의 `id`(clipPath 등)는 한 페이지에 캐릭터가 여러 개여도 겹치지 않게 호출마다 새로 만든다(카운터).
- 반응 표정은 약 1초(`MOOD_MS = 1000`) 뒤 그 요소의 기본 `mood`로 돌아온다. 오답은 `wow`(놀람)이고, `teary`(울먹)는 보스에게 맞을 때만 쓴다.
- 표정 이름(정확히 이 문자열): `base, smile, wink, wow, star, love, sleep, tongue, teary`.
- 기존 아이템 id·가격·잠금·perk는 바꾸지 않는다. 기존 세이브의 `S.owned`, `S.avatar`가 그대로 동작해야 한다.
- 랜덤 뽑기는 넣지 않는다. 오늘의 특가와 첫 선물에는 캐릭터를 넣지 않는다.
- 375px 폭과 가로 폰(높이 500px 이하)에서 상점이 잘리지 않는다.
- 사용자의 작업 중 파일(`sentence-game.js`, `sentences.js`, `tests/sentences.test.js`, `index.html`의 커밋 안 된 변경)은 이 작업과 섞어 커밋하지 않는다. 각 커밋은 그 태스크가 바꾼 줄만 담는다(`git add -p`).

## Review Focus

1. **옛 세이브:** `body:'kid2'`, 장착 `{hat:'crown', effect:'rainbow'}`, `equip.bg` 없음 → 그대로 보이고 `equip.bg === null`. → Task 2 `old save keeps body and equips, adds bg` 테스트.
2. **그림이 없는 id:** 세이브에 남은 옛 id나 그림이 빠진 아이템이 장착돼 있어도 `render`가 죽지 않고 그 칸만 건너뛴다. `thumb`은 이모지 `icon`으로 대신한다. → Task 5 `render skips equips without art` 테스트.
3. **정답 연타:** `react`를 빠르게 여러 번 불러도 마지막 반응 1초 뒤 기본 표정으로 돌아오고 멈춰 있지 않는다. → Task 5 `rapid reacts settle to base mood` 테스트(가짜 타이머).
4. **캐릭터 할인 퀴즈:** 영어 캐릭터를 "영어로 주문하기"로 살 때 오답 그림이 아이템이 아니라 다른 캐릭터이고, 수학 캐릭터는 퀴즈에 나오지 않는다. → Task 2 `quizWrong for a body offers other English bodies` 테스트.
5. **id 충돌:** 캐릭터 id와 아이템 id가 겹치면 `S.owned` 하나로 구분이 안 된다. → Task 1 `body and item ids never collide` 테스트.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `items.js` (수정) | `SLOTS`에 `bg` 추가, `BODIES` 15종(가격·잠금·지갑·단어), 새 아이템 18개. 데이터만. |
| `avatar-art.js` (새) | `window.AvatarArt`: 캐릭터/표정/아이템/배경 SVG 문자열, 썸네일, CSS 문자열. DOM·S 안 건드림. |
| `avatar.js` (수정) | 캐릭터 구매·소유, `ensure` 보강, `render`/`react`를 SVG로, `thumb`, `collection`, 졸림 타이머. |
| `shop.js` (수정) | 캐릭터 탭·배경 탭, SVG 썸네일, 캐릭터 구매 흐름, 반응 표정, 모은 수 표시. |
| `index.html`, `boss.js`, `math-game.js`, `sentence-game.js` (수정) | `react`/`render` 호출에 표정 힌트 추가, `avatar-art.js` 스크립트 태그. |
| `tests/items.test.js`, `tests/avatar.test.js` (수정), `tests/avatar-art.test.js` (새) | 데이터·로직·그림 문자열 테스트. |
| `tests/avatar-preview.html` (수정) | 15종 × 표정 9 × 아이템 전부를 한 페이지에서 눈으로 확인. |

---

### Task 1: 데이터 — 캐릭터 15종, 새 아이템, 배경 칸

**Files:**
- Modify: `items.js`
- Test: `tests/items.test.js`

**Interfaces:**
- Produces:
  - `SLOTS = ['hat','face','hand','back','effect','bg']`, `SLOT_ICON.bg = '🖼️'`
  - `BODIES[i] = {id, name, word, icon, price, unlock, cur, legend?:true}`. 무료는 `price:0, unlock:null, cur:'eng'`.
  - 새 `ITEMS` 항목(기존 필드 형식 그대로)

- [ ] **Step 1: 테스트 고치기/추가 (`tests/items.test.js`)**

```js
test('6 slots including bg', () => assert.deepEqual(get('SLOTS'), ['hat','face','hand','back','effect','bg']));
test('15 bodies in this order with prices and unlocks', () => {
  const B = get('BODIES');
  assert.deepEqual(B.map(b => b.id), ['kid1','kid2','kid3','cat','dog','bunny','chick','hamster','penguin','bear','panda','fox','unicorn','robot','dragon']);
  const p = Object.fromEntries(B.map(b => [b.id, [b.price, b.cur, b.unlock]]));
  for (const id of ['kid1','kid2','kid3','cat','dog','bunny']) assert.deepEqual(p[id], [0, 'eng', null]);
  assert.deepEqual(p.chick, [120,'eng',null]); assert.deepEqual(p.hamster, [150,'eng',null]); assert.deepEqual(p.penguin, [200,'eng',null]);
  assert.deepEqual(p.bear, [250,'eng',{level:5}]); assert.deepEqual(p.panda, [300,'eng',{level:10}]);
  assert.deepEqual(p.fox, [350,'eng',{trophies:3}]); assert.deepEqual(p.unicorn, [500,'eng',{trophies:7}]);
  assert.deepEqual(p.robot, [200,'math',{mathTrophies:1}]); assert.deepEqual(p.dragon, [350,'math',{mathTrophies:2}]);
  assert.deepEqual(B.filter(b => b.legend).map(b => b.id), ['unicorn','dragon']);
});
test('English words are unique across English items and bodies', () => {
  const w = [...eng(), ...get('BODIES').filter(b => b.cur === 'eng')].map(x => x.word);
  assert.equal(new Set(w).size, w.length);
  for (const b of get('BODIES').filter(b => b.cur === 'eng')) assert.match(b.word, /^[a-z][a-z ]*$/, b.id);
});
test('body and item ids never collide', () => {
  const ids = [...get('ITEMS'), ...get('BODIES')].map(x => x.id);
  assert.equal(new Set(ids).size, ids.length);
});
test('new items exist with spec prices', () => {
  const I = Object.fromEntries(get('ITEMS').map(i => [i.id, i]));
  const want = {flower:['hat',80], beret:['hat',90], magichat:['hat',220], bandage:['face',30], starsticker:['face',40],
    heartglasses:['face',90], lollipop:['hand',50], icecream:['hand',60], butterfly:['back',200], music:['effect',80],
    bg_sky:['bg',60], bg_garden:['bg',100], bg_bubble:['bg',90], bg_night:['bg',120], bg_spring:['bg',150], bg_winter:['bg',160],
    m_grid:['bg',80], m_space:['bg',250]};
  for (const [id, [slot, price]] of Object.entries(want)) { assert.ok(I[id], id); assert.equal(I[id].slot, slot, id); assert.equal(I[id].price, price, id); }
  assert.deepEqual(I.magichat.unlock, {level:8}); assert.deepEqual(I.butterfly.unlock, {dex:30}); assert.deepEqual(I.m_space.unlock, {mathTrophies:2});
});
```

기존 테스트 숫자 바꾸기:
- `about 24 items…` → 영어 아이템 35..45개, 칸마다 4..8개, 가격 합 5000..6500.
- `6 bodies, first is kid1…` → 위 15종 테스트로 대체하고, PETS 부분만 남긴다.
- `math items: 9…` → 11개.

- [ ] **Step 2: 실패 확인** — `node --test tests/items.test.js` → 새 테스트 FAIL.

- [ ] **Step 3: `items.js` 수정**

새 아이템의 `word`와 `icon`:

| id | word | icon |
|---|---|---|
| flower | flower | 🌸 |
| beret | beret | 🎨 |
| magichat | magic hat | 🧙 |
| bandage | bandage | 🩹 |
| starsticker | star sticker | ⭐ |
| heartglasses | heart glasses | 😍 |
| lollipop | lollipop | 🍭 |
| icecream | ice cream | 🍦 |
| butterfly | butterfly wings | 🦋 |
| music | music | 🎵 |
| bg_sky | sky | 🌤️ |
| bg_garden | garden | 🌷 |
| bg_bubble | bubble | 🫧 |
| bg_night | night | 🌙 |
| bg_spring | spring | 🏵️ |
| bg_winter | winter | ☃️ |
| m_grid | 모눈 칠판 | 🔲 |
| m_space | 숫자 우주 | 🪐 |

BODIES의 `name`/`word`/`icon`:

| id | name | word | icon |
|---|---|---|---|
| kid1 | 꼬마 | child | 🧒 |
| kid2 | 소녀 | girl | 👧 |
| kid3 | 소년 | boy | 👦 |
| cat | 버터 고양이 | cat | 🐱 |
| dog | 구름 강아지 | dog | 🐶 |
| bunny | 솜사탕 토끼 | rabbit | 🐰 |
| chick | 삐약 병아리 | chick | 🐥 |
| hamster | 도토리 햄스터 | hamster | 🐹 |
| penguin | 아이스 펭귄 | penguin | 🐧 |
| bear | 꿀 곰 | bear | 🐻 |
| panda | 대나무 판다 | panda | 🐼 |
| fox | 노을 여우 | fox | 🦊 |
| unicorn | 아기 유니콘 | unicorn | 🦄 |
| robot | 숫자 로봇 | 숫자 로봇 | 🤖 |
| dragon | 아기 드래곤 | 아기 드래곤 | 🐲 |

새 아이템은 모두 `perk:null`, `cur`는 m_ 접두어만 `'math'`, 잠금은 위 테스트에 있는 3개만 둔다.

- [ ] **Step 4: 통과 확인** — `node --test tests/items.test.js` → PASS. `node --test tests/*.test.js`에서 `avatar.test.js`가 칸 수 때문에 깨지면 `ensure` 기대값에 `bg:null`을 더한다(Task 2에서 구현). 이 태스크에서는 그 한 줄만 기대값으로 고친다.

- [ ] **Step 5: 커밋** — `git add items.js tests/items.test.js` → `feat(shop): 15 characters, new items and bg slot data`

---

### Task 2: 캐릭터 사기·가지기 로직

**Files:**
- Modify: `avatar.js` (로직 부분: `byId`, `ensure`, `owns`, `canBuy`/`buy`, `setBody`, `quizWrong`, 새 `collection`, `body`)
- Test: `tests/avatar.test.js`

**Interfaces:**
- Consumes: Task 1의 `BODIES`, `SLOTS`
- Produces (`window.Avatar`에 추가·변경):
  - `item(id)`: 아이템 **또는 캐릭터**를 찾아 돌려준다. 캐릭터면 `{...body, slot:'body'}`.
  - `owns(id) -> boolean`: 무료 캐릭터(`price:0`)는 항상 `true`
  - `setBody(id) -> boolean`: 가진 캐릭터만 `true`
  - `collection() -> {have:number, total:number}`: 가진 캐릭터 수 / 15
  - `canBuy`, `buy`, `priceOf`, `wallet`, `isUnlocked`, `lockText`는 캐릭터 id도 받는다(규칙은 아이템과 같다).
  - `quizWrong(it, shuffle)`: `it.slot === 'body'`면 다른 영어 캐릭터 2개

- [ ] **Step 1: 실패하는 테스트**

```js
test('old save keeps body and equips, adds bg', () => {
  const {Avatar} = mk();
  const S = {coins:0, words:{}, owned:['crown','rainbow'], avatar:{body:'kid2', equip:{hat:'crown',face:null,hand:null,back:null,effect:'rainbow'}}};
  Avatar.ensure(S);
  assert.equal(S.avatar.body, 'kid2'); assert.equal(S.avatar.equip.hat, 'crown'); assert.equal(S.avatar.equip.effect, 'rainbow');
  assert.equal(S.avatar.equip.bg, null);
});
test('free bodies are owned; paid bodies are not until bought', () => {
  const {Avatar} = mk();
  assert.ok(Avatar.owns('bunny')); assert.ok(!Avatar.owns('chick'));
  assert.equal(Avatar.setBody('chick'), false);
});
test('buy a body spends coins once and allows setBody', () => {
  const {S, Avatar} = mk(); S.coins = 120;
  assert.ok(Avatar.buy('chick').ok); assert.equal(S.coins, 0);
  assert.ok(S.owned.includes('chick')); assert.ok(Avatar.setBody('chick'));
  assert.equal(Avatar.buy('chick').ok, false);
});
test('locked body unlocks to buy, not for free', () => {
  const {S, env, Avatar} = mk(); S.coins = 1000;
  assert.equal(Avatar.canBuy('bear').reason, 'locked'); assert.equal(Avatar.lockText(Avatar.item('bear')), '레벨 5 필요');
  env.lv = 5; assert.ok(!Avatar.owns('bear')); assert.ok(Avatar.canBuy('bear').ok);
});
test('math bodies spend 💎', () => {
  const {S, Avatar} = mk(); S.coins = 999; S.math.coins = 200; S.math.trophies = {a:1};
  assert.ok(Avatar.buy('robot').ok); assert.equal(S.math.coins, 0); assert.equal(S.coins, 999);
});
test('ensure resets an unowned body to kid1', () => {
  const {S, Avatar} = mk(); S.avatar.body = 'unicorn'; Avatar.ensure(S); assert.equal(S.avatar.body, 'kid1');
});
test('collection counts owned bodies', () => {
  const {S, Avatar} = mk(); assert.deepEqual(Avatar.collection(), {have:6, total:15});
  S.owned.push('chick'); assert.deepEqual(Avatar.collection(), {have:7, total:15});
});
test('quizWrong for a body offers other English bodies', () => {
  const {Avatar} = mk(); const w = Avatar.quizWrong(Avatar.item('penguin'));
  assert.equal(w.length, 2); for (const x of w) { assert.equal(x.slot, 'body'); assert.equal(x.cur, 'eng'); assert.notEqual(x.id, 'penguin'); }
});
test('deal and gift never offer bodies', () => {
  const {Avatar} = mk({pinDeal:false});
  for (const c of Avatar.giftChoices()) assert.notEqual(c.slot, 'body');
  const d = Avatar.deal(); assert.ok(!d || Avatar.item(d.id).slot !== 'body');
});
```

기존 `ensure fills defaults…` 기대값의 `equip`에 `bg:null`을 더하고, `setBody accepts known bodies only`는 무료 캐릭터 기준으로 둔다.

- [ ] **Step 2: 실패 확인** — `node --test tests/avatar.test.js` → 새 테스트 FAIL.

- [ ] **Step 3: `avatar.js` 로직 구현** — `byId`는 `ITEMS`를 먼저 찾고, 없으면 `BODIES`에서 찾아 `slot:'body'`를 붙인 복사본을 돌려준다. `ensure`의 몸 검사는 `owns`로 바꾼다(`owns`가 `S`를 읽으므로 `ensure` 안에서는 인자 `s`로 판단). 오늘의 특가와 첫 선물 풀은 `ITEMS`만 본다(지금 그대로).

- [ ] **Step 4: 통과 확인** — `node --test tests/*.test.js` → 모두 PASS.

- [ ] **Step 5: 커밋** — `feat(shop): characters can be bought and collected`

---

### Task 3: 그림 1 — 캐릭터 15종과 표정 9가지

**Files:**
- Create: `avatar-art.js`
- Create: `tests/avatar-art.test.js`
- Modify: `tests/avatar-preview.html` (로드 순서와 표정 줄)

**Interfaces:**
- Consumes: `BODIES` (Task 1)
- Produces (`window.AvatarArt`):
  - `MOODS: string[]` — Global Constraints의 9개, 그 순서
  - `character({body, equip = {}, mood = 'base', bg = false}) -> string` — 완전한 `<svg …>…</svg>`. `equip`은 `{slot: itemId}`. 그림 없는 `itemId`는 조용히 건너뛴다. 이 태스크에서는 몸과 표정만 그리고, `equip`과 `bg`는 Task 4에서 채운다.
  - `face(body) -> string` — 캐릭터 칸 썸네일용 `<svg>`(머리 위주, 기본 표정)
  - `hasBody(id) -> boolean`
  - `css: string` — `av-` 접두어 애니메이션(둥실, 깜빡임, 반짝, 떨어짐, 떠오름)

- [ ] **Step 1: 실패하는 테스트**

```js
const ctx = load(['items.js', 'avatar-art.js']); const A = ctx.AvatarArt, B = vm.runInContext('BODIES', ctx);
const ok = s => { assert.match(s, /^<svg[\s>]/); assert.match(s, /<\/svg>$/); assert.doesNotMatch(s, /undefined|NaN/); };
test('MOODS are the nine names', () => assert.deepEqual([...A.MOODS], ['base','smile','wink','wow','star','love','sleep','tongue','teary']));
test('every body draws in every mood', () => { for (const b of B) { assert.ok(A.hasBody(b.id), b.id); for (const m of A.MOODS) ok(A.character({body:b.id, mood:m})); ok(A.face(b.id)); } });
test('moods draw differently', () => { const s = new Set(A.MOODS.map(m => A.character({body:'cat', mood:m}))); assert.equal(s.size, 9); });
test('unknown body or mood falls back instead of throwing', () => { ok(A.character({body:'alien', mood:'???'})); });
test('css uses only av- prefixed classes and keyframes', () => {
  for (const m of A.css.matchAll(/(?:^|[\s,}])\.([a-zA-Z][\w-]*)/g)) assert.match(m[1], /^av-/);
  for (const m of A.css.matchAll(/@keyframes\s+([\w-]+)/g)) assert.match(m[1], /^av-/);
});
```

- [ ] **Step 2: 실패 확인** — `node --test tests/avatar-art.test.js` → FAIL (파일 없음).

- [ ] **Step 3: `avatar-art.js` 구현** — 시안의 `draw`/`face` 함수를 출발점으로, 몸통·얼굴 틀은 공유하고 캐릭터마다 색(`f`, `l`, `in`)과 머리 장식만 다르게 둔다. 시안에 없는 캐릭터의 특징:
  - kid1: 둥근 앞머리, kid2: 양갈래, kid3: 짧은 삐침머리. 살구색 피부, 작은 사람 귀.
  - hamster: 작은 둥근 귀와 볼주머니. penguin: 남색 머리에 흰 얼굴 타원, 주황 발.
  - bear: 둥근 귀와 연한 주둥이. panda: 검은 귀와 눈 둘레 무늬(눈이 묻히지 않게 무늬 위에 눈).
  - fox: 주황 삼각 귀와 흰 볼. unicorn: 흰 몸, 금색 뿔, 파스텔 갈기, 볼에 반짝이.
  - robot: 하늘빛 회색, 안테나와 볼트, 네모진 귀. dragon: 민트색, 작은 뿔 두 개, 등 쪽 뾰족 비늘.
  - 부리 캐릭터(chick, penguin)는 입 대신 부리를 그린다. `sleep`의 zz는 그린다.
  - 전설(unicorn, dragon)은 그림 자체에는 차이를 두지 않는다. 금테는 상점 칸에서 처리한다(Task 7).

- [ ] **Step 4: 통과 확인** — `node --test tests/avatar-art.test.js` → PASS.

- [ ] **Step 5: 눈으로 확인** — `tests/avatar-preview.html`이 `items.js`, `avatar-art.js`만 읽고 15종 × 9표정 표를 `AvatarArt.character`로 그리게 고친다(`avatar.js` 의존은 Task 5에서 다시 붙인다). 브라우저로 열어 캐릭터마다 귀·장식이 머리와 맞는지, 표정이 모두 보이는지 확인한다.

- [ ] **Step 6: 커밋** — `feat(avatar): mallang SVG characters and nine moods`

---

### Task 4: 그림 2 — 아이템 52개와 배경 8개

**Files:**
- Modify: `avatar-art.js`
- Modify: `tests/avatar-art.test.js`, `tests/avatar-preview.html`

**Interfaces:**
- Consumes: `ITEMS`, `SLOTS` (Task 1), Task 3의 `character`
- Produces:
  - `hasItem(id) -> boolean`
  - `thumb(id) -> string` — 아이템 하나만 그린 `<svg>`(칸 썸네일). 배경은 작은 둥근 타일.
  - `character({…, equip, bg:true})`가 칸별로 그린다. 순서는 배경 → 등 → 몸 → 얼굴 표정 → 얼굴 아이템 → 모자 → 손 → 효과.

- [ ] **Step 1: 실패하는 테스트**

```js
test('every item has art and a thumb', () => { for (const i of vm.runInContext('ITEMS', ctx)) { assert.ok(A.hasItem(i.id), i.id); ok(A.thumb(i.id)); } });
test('equipping changes the drawing for every item', () => {
  for (const i of vm.runInContext('ITEMS', ctx)) {
    const on = A.character({body:'bunny', equip:{[i.slot]: i.id}, bg:true}), off = A.character({body:'bunny', bg:true});
    assert.notEqual(on.replace(/ id="[^"]+"|url\(#[^)]+\)/g, ''), off.replace(/ id="[^"]+"|url\(#[^)]+\)/g, ''), i.id);
  }
});
test('bg is only drawn when bg:true', () => {
  const a = A.character({body:'cat', equip:{bg:'bg_night'}, bg:false}), b = A.character({body:'cat', equip:{}, bg:false});
  assert.equal(a.replace(/ id="[^"]+"|url\(#[^)]+\)/g, ''), b.replace(/ id="[^"]+"|url\(#[^)]+\)/g, ''));
});
test('two renders never share an svg id', () => {
  const ids = s => [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  const a = ids(A.character({body:'cat', bg:true, equip:{bg:'bg_sky'}})), b = ids(A.character({body:'cat', bg:true, equip:{bg:'bg_sky'}}));
  for (const x of a) assert.ok(!b.includes(x), x);
});
test('unknown equip id is skipped', () => ok(A.character({body:'cat', equip:{hat:'nope', bg:'nope'}, bg:true})));
```

- [ ] **Step 2: 실패 확인** — `node --test tests/avatar-art.test.js` → FAIL.

- [ ] **Step 3: 구현** — 시안에 있는 것은 시안 그대로 쓴다. 매핑: `ribbon, crown, flower, magichat←wizard, beret, glasses, heartglasses←heartg, starsticker←sticker, bandage←bandaid, wand, balloon, icecream, lollipop←lolli, cape, wings←angel, butterfly, sparkle, heart←hearts, music←notes, bg_sky←rainbow, bg_night←night, bg_spring←sakura, bg_bubble←bubble, bg_winter←snow, bg_garden←meadow`. 나머지(cap, tophat, helmet, mask, sunglasses, goggles, beard, snowball, shield, bow, umbrella, backpack, bag, snow, fire, rainbow 효과, 수학 아이템 11개)는 같은 선 굵기와 파스텔 색으로 새로 그린다. 수학 아이템은 숫자·도형 모티프(🔢 숫자 모자는 숫자가 적힌 모자, 📐 삼각자 칼 등)로 그린다. `bg:true`일 때만 배경 타일과 clipPath를 넣는다.

- [ ] **Step 4: 통과 확인** — `node --test tests/*.test.js` → PASS.

- [ ] **Step 5: 눈으로 확인** — 미리보기 페이지에 아이템 전부를 토끼, 펭귄, 드래곤에 하나씩 입힌 표와 배경 8종을 추가한다. 모자가 귀(토끼, 고양이, 유니콘 뿔)와 어색하게 겹치는 곳을 고친다.

- [ ] **Step 6: 커밋** — `feat(avatar): SVG art for every item and background`

---

### Task 5: `render` / `react` / `thumb`을 SVG로

**Files:**
- Modify: `avatar.js` (그리기 부분)
- Modify: `tests/avatar.test.js` (`mk()`가 `avatar-art.js`도 로드), `tests/avatar-preview.html`
- Modify: `index.html` (`<script src="avatar-art.js">`를 `items.js`와 `avatar.js` 사이에)

**Interfaces:**
- Consumes: `AvatarArt.character/face/thumb/css/hasItem/hasBody` (Task 3, 4)
- Produces (`window.Avatar`):
  - `render(el, {size='m', pose='idle', pet=false, preview=null, body=null, mood='base', bg, sleepy=false})` — `bg` 기본값은 `size !== 's'`. 루트 `div.av`에 그릴 상태를 붙여 두고 `react`가 다시 그린다.
  - `react(el, kind, {combo=0, boss=false} = {})` — `kind`는 `cheer|hurt|attack` 또는 표정 이름
  - `moodFor(kind, {combo=0, boss=false} = {}) -> string` — `cheer`: `combo >= 3 ? 'star' : 'smile'`, `hurt`: `boss ? 'teary' : 'wow'`, `attack`: `'wink'`, 표정 이름이면 그대로, 그 밖엔 `'base'`
  - `thumb(id) -> string` — 캐릭터면 `AvatarArt.face`, 아이템이면 `AvatarArt.thumb`, 그림이 없으면 `item.icon`
  - `sleepy:true`: 20초(`SLEEP_MS = 20000`) 동안 `pointerdown`/`keydown`이 없으면 `sleep` 표정, 입력이 오면 `base`로 돌아온다. 리스너는 `document`에 한 번만 단다.

- [ ] **Step 1: 실패하는 테스트** — 가짜 요소는 `{innerHTML:''}`, 가짜 `querySelector`가 필요하면 `render` 결과 상태를 읽는 작은 헬퍼로 대신한다. 타이머는 `load`에 넘기는 가짜 `setTimeout`/`clearTimeout`(직접 진행시키는 큐)로 테스트한다.

```js
test('moodFor maps game events', () => {
  const {Avatar} = mk();
  assert.equal(Avatar.moodFor('cheer'), 'smile'); assert.equal(Avatar.moodFor('cheer', {combo:3}), 'star');
  assert.equal(Avatar.moodFor('hurt'), 'wow'); assert.equal(Avatar.moodFor('hurt', {boss:true}), 'teary');
  assert.equal(Avatar.moodFor('attack'), 'wink'); assert.equal(Avatar.moodFor('love'), 'love'); assert.equal(Avatar.moodFor('zzz'), 'base');
});
test('render draws SVG with the body and mood', () => {
  const {S, Avatar} = mk(); S.avatar.body = 'cat'; const el = {innerHTML:''};
  Avatar.render(el, {mood:'love'}); assert.match(el.innerHTML, /<svg/); assert.match(el.innerHTML, /class="av /);
});
test('render skips equips without art', () => {
  const {S, Avatar} = mk(); S.owned.push('ghost'); S.avatar.equip.hat = 'ghost'; const el = {innerHTML:''};
  assert.doesNotThrow(() => Avatar.render(el, {})); assert.match(el.innerHTML, /<svg/);
});
test('rapid reacts settle to base mood', () => { /* react cheer ×5 at 100ms 간격 → 마지막 뒤 1000ms 진행 → 그려진 표정이 base 와 같은 문자열 */ });
test('thumb falls back to the emoji icon', () => { /* AvatarArt.hasItem 을 false 로 덮은 컨텍스트에서 thumb('cap') === '🧢' */ });
```

`rapid reacts`와 `thumb fallback`의 몸체는 위 주석대로 작성한다. 비교 기준은 `Avatar.render(el2, {mood:'base'})`의 SVG에서 id를 지운 문자열이다.

- [ ] **Step 2: 실패 확인** — `node --test tests/avatar.test.js` → FAIL.

- [ ] **Step 3: 구현** — `LAYOUT`과 이모지 레이어를 지우고 `AvatarArt.character`로 그린다. 크기는 `SIZES`(s56 m96 l160)를 SVG 폭으로 쓰고 높이는 비율대로 둔다. 펫은 지금처럼 이모지 `span`을 캐릭터 오른쪽 아래에 둔다. `pose` 움직임 클래스(`av-idle/cheer/hurt/attack`)와 `POSE_MS`는 그대로 둔다. 표정은 `MOOD_MS` 뒤 `render` 때 받은 `mood`로 돌아온다. 효과 아이템의 `av-burst`는 이모지 대신 `AvatarArt.thumb(effectId)`를 작게 띄운다. `injectStyle`은 `AvatarArt.css`도 넣는다.

- [ ] **Step 4: 통과 확인** — `node --test tests/*.test.js` → PASS.

- [ ] **Step 5: 눈으로 확인** — `tests/avatar-preview.html`을 다시 `avatar.js`로 그리게 하고 반응 버튼(cheer, cheer+combo3, hurt, hurt+boss, attack)을 둔다. 크기 s/m/l에서 펫 위치가 캐릭터와 겹치지 않는지 확인한다.

- [ ] **Step 6: 커밋** — `feat(avatar): render SVG characters with game-reactive moods`

---

### Task 6: 게임 상황 연결

**Files:**
- Modify: `index.html` (`react` 660·672·920·929줄 근처, 결과 `render` 712·960줄, 지도 `whoAv` 489줄)
- Modify: `boss.js` (`hurt` 340줄 근처, 공격 연출이 있으면 `attack`)
- Modify: `math-game.js` (135·212·286·301·344줄 근처)
- Modify: `sentence-game.js` (125·141줄 근처) — **사용자 작업 중 파일이다.** 이 두 줄만 바꾸고 `git add -p`로 그 줄만 커밋한다.

**Interfaces:**
- Consumes: Task 5의 `render(…, {mood, sleepy})`, `react(el, kind, {combo, boss})`

- [ ] **Step 1: 호출 바꾸기**
  - 정답 `cheer`: `{combo: ses.combo}` / `{combo: P.combo}` / 수학 세션의 콤보를 넘긴다.
  - 보스전 `hurt`(`boss.js`): `{boss:true}`.
  - 결과 화면: `mood: (stars === 3 || isBoss) ? 'love' : 'smile'`. 앵무새 결과는 `stars === 3 ? 'love' : 'smile'`.
  - 지도 프로필(`whoAv`, `mWhoAv`): `{size:'s', bg:true, sleepy:true}`.

- [ ] **Step 2: 회귀 테스트** — `node --test tests/*.test.js` → PASS.

- [ ] **Step 3: 브라우저 확인** — `index.html`을 열어 확인한다.
  - 영어 스테이지: 정답이면 방긋, 3콤보부터 반짝눈, 오답이면 놀람이고 1초 뒤 기본으로 돌아온다.
  - 보스전에서 맞으면 울먹이다.
  - 결과 화면이 별 3개면 하트눈이다.
  - 지도에서 20초 가만히 있으면 졸림이고, 누르면 깬다.
  - 수학 섬, 문장 게임, 앵무새탐정도 같은 방식으로 반응한다.
  - 콘솔 오류가 없다.

- [ ] **Step 4: 커밋** — `feat(avatar): characters react to answers, combos, bosses and results`

---

### Task 7: 상점 화면 개편

**Files:**
- Modify: `shop.js`

**Interfaces:**
- Consumes: `Avatar.item/owns/canBuy/buy/setBody/collection/thumb/render/react` (Task 2, 5), `BODIES`

- [ ] **Step 1: 구현**
  - 탭: `['body','hat','face','hand','back','effect','bg']`(+특가 맨 앞). 이름은 `body:'캐릭터'`, `bg:'배경'`. `open()` 기본 탭은 특가가 있으면 특가, 없으면 `'body'`이다. 지도 프로필에서 `Shop.open('body')`는 그대로 동작한다.
  - 칸 아이콘(`.ci`)은 `Avatar.thumb(id)`의 SVG이다. 칸 크기에 맞게 `.ci svg{width:56px;height:56px}`.
  - 캐릭터 탭: 현재 지갑(`cur`)의 캐릭터만 보인다(영어 상점은 `cur:'eng'` 13종, 수학 상점은 robot·dragon). 상태는 선택됨, 보유, 가격, 🔒 중 하나이다. `legend`면 칸에 금테(`border-color:#f5c542`)와 반짝임을 둔다. 탭 위나 제목 옆에 `모은 캐릭터 {have}/{total}`을 표시한다.
  - 캐릭터를 누르면 미리보기가 그 캐릭터가 된다(`render(…, {body})`). 장착 아이템은 유지하고, 영어면 `speak(word)`이다. 가진 캐릭터는 아래 버튼이 "고르기", 아니면 아이템과 같은 사기 흐름이다(`doBuy` → 영어 퀴즈 / 수학 퀴즈). `finishBuy`는 캐릭터면 `setBody`, 아이템이면 `equip`이다.
  - 영어 퀴즈와 첫 선물 모달의 그림 버튼은 `Avatar.thumb`이다. 첫 방문 "나는 누구일까?"는 무료 6종만 보여 준다.
  - 미리보기 반응: 아이템이나 캐릭터를 누르면 `react(prev, 'wink')`, 사면 `react(prev, 'love')`, 미리보기 캐릭터를 누르면 무작위 표정 중 하나(메롱 포함)이다.
  - 토스트 문구는 지금처럼 `icon` 이모지를 쓴다.
  - 가로 폰 미디어쿼리에서 미리보기 SVG도 작게(높이 84px) 맞춘다.

- [ ] **Step 2: 회귀 테스트** — `node --test tests/*.test.js` → PASS.

- [ ] **Step 3: 브라우저 확인** — 375×812, 812×375, 데스크톱에서 확인한다.
  - 새 세이브: 첫 방문 모달(무료 6종)을 거쳐 선물을 받는다.
  - 코인이 있는 세이브: 병아리를 영어 퀴즈로 산다. 오답 그림이 캐릭터인지 보고, 사면 하트눈이 나오고 캐릭터가 바뀐다.
  - 곰은 🔒 "레벨 5 필요"로 나온다.
  - 수학 상점에서 로봇이 💎로 표시된다.
  - 배경 탭에서 배경을 입히면 지도 프로필에도 보인다.
  - 옛 세이브(백업 코드로 복구)의 아이템이 그대로이다.

- [ ] **Step 4: 커밋** — `feat(shop): character collection tab, SVG thumbnails and backgrounds`

---

### Task 8: 마무리 확인

- [ ] **Step 1:** `node --test tests/*.test.js` → 모두 PASS(출력 첨부).
- [ ] **Step 2:** 브라우저에서 지도 → 스테이지 → 보스전 → 결과 → 앵무새탐정 → 수학 섬 → 상점을 한 바퀴 돈다. 콘솔 오류 0, 캐릭터가 이모지로 보이는 곳이 없는지(펫 제외) 확인한다.
- [ ] **Step 3:** 폰 폭(375px)에서 스테이지 화면의 작은 캐릭터(s)가 문제를 가리지 않는지 확인한다.
