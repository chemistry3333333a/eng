/* =====================================================================
   워드 아일랜드 문장 목록 (단원 끝 "📜 문장 라운드")
   - 단원 번호(id)마다 그 단원 단어가 들어간 문장을 적어요. 문장이 있는 단원만 문장 라운드가 열려요.
   - 형식: [단어, 영어 문장, 한글 뜻, 블록]  → {w, en, ko, blocks} 로 바꿔서 써요
     · en 안에 단어가 그대로 들어가야 해요 (문장 첫 글자만 대문자여도 돼요). 같은 단원의 다른 단어는 안 들어가요.
     · 블록은 '|' 로 나눠요. 블록을 띄어쓰기로 이으면 en 에서 끝 문장부호를 뺀 것과 같아야 해요 (줄 세우기 문제).
   - 지금은 1장(첫걸음 해변)과 2장(동물 숲) 단원에 문장이 있어요.
   ===================================================================== */
const STAGE_SENTENCES = (() => {
  const raw = {
    // ---------- 1장 · 첫걸음 해변 ----------
    1: [   // 과일 숲
      ['apple',      'This apple is red.',          '이 사과는 빨간색이에요.',    'This apple|is|red'],
      ['banana',     'The banana is yellow.',       '바나나는 노란색이에요.',     'The banana|is|yellow'],
      ['grape',      'I like grape juice.',         '나는 포도 주스를 좋아해요.', 'I|like|grape juice'],
      ['orange',     'This orange is big.',         '이 오렌지는 커요.',          'This orange|is|big'],
      ['strawberry', 'The strawberry is sweet.',    '딸기는 달콤해요.',           'The strawberry|is|sweet'],
      ['watermelon', 'I eat watermelon in summer.', '나는 여름에 수박을 먹어요.', 'I|eat|watermelon|in summer'],
      ['peach',      'The peach is soft.',          '복숭아는 말랑해요.',         'The peach|is|soft'],
      ['lemon',      'The lemon is sour.',          '레몬은 셔요.',               'The lemon|is|sour'],
    ],
    2: [   // 동물 농장
      ['dog',    'My dog is small.',          '내 개는 작아요.',                'My dog|is|small'],
      ['cat',    'The cat is sleeping.',      '고양이가 자고 있어요.',          'The cat|is|sleeping'],
      ['rabbit', 'The rabbit can jump.',      '토끼는 깡충 뛸 수 있어요.',      'The rabbit|can|jump'],
      ['pig',    'The pig is pink.',          '돼지는 분홍색이에요.',           'The pig|is|pink'],
      ['cow',    'A cow gives us milk.',      '소는 우리에게 우유를 줘요.',     'A cow|gives|us|milk'],
      ['lion',   'The lion is strong.',       '사자는 힘이 세요.',              'The lion|is|strong'],
      ['monkey', 'The monkey likes bananas.', '원숭이는 바나나를 좋아해요.',    'The monkey|likes|bananas'],
      ['bear',   'I see a big bear.',         '나는 큰 곰을 봐요.',             'I|see|a big bear'],
    ],
    3: [   // 무지개 언덕
      ['red',    'My bag is red.',            '내 가방은 빨간색이에요.',    'My bag|is|red'],
      ['blue',   'The sky is blue.',          '하늘은 파란색이에요.',       'The sky|is|blue'],
      ['green',  'The leaf is green.',        '나뭇잎은 초록색이에요.',     'The leaf|is|green'],
      ['yellow', 'I like the yellow flower.', '나는 노란 꽃이 좋아요.',     'I|like|the yellow flower'],
      ['purple', 'Grapes are purple.',        '포도는 보라색이에요.',       'Grapes|are|purple'],
      ['black',  'My cat is black.',          '내 고양이는 검은색이에요.',  'My cat|is|black'],
      ['white',  'Snow is white.',            '눈은 하얀색이에요.',         'Snow|is|white'],
      ['brown',  'The bear is brown.',        '곰은 갈색이에요.',           'The bear|is|brown'],
    ],
    31: [  // 숫자 놀이 1
      ['one',   'I have one brother.',      '나는 남자 형제가 한 명 있어요.', 'I|have|one brother'],
      ['two',   'I have two hands.',        '나는 손이 두 개 있어요.',        'I|have|two hands'],
      ['three', 'I see three birds.',       '나는 새 세 마리를 봐요.',        'I|see|three birds'],
      ['four',  'A dog has four legs.',     '개는 다리가 네 개예요.',         'A dog|has|four legs'],
      ['five',  'I eat five cookies.',      '나는 쿠키 다섯 개를 먹어요.',    'I|eat|five cookies'],
      ['six',   'I am six years old.',      '나는 여섯 살이에요.',            'I|am|six years old'],
      ['seven', 'A week has seven days.',   '일주일은 7일이에요.',            'A week|has|seven days'],
      ['eight', 'A spider has eight legs.', '거미는 다리가 여덟 개예요.',     'A spider|has|eight legs'],
    ],
    6: [   // 몸튼튼 체육관
      ['eye',   'My left eye hurts.',            '내 왼쪽 눈이 아파요.',     'My|left eye|hurts'],
      ['ear',   'Touch your ear.',               '귀를 만져요.',             'Touch|your|ear'],
      ['nose',  'The elephant has a long nose.', '코끼리는 코가 길어요.',    'The elephant|has|a long nose'],
      ['mouth', 'Open your mouth.',              '입을 벌려요.',             'Open|your|mouth'],
      ['hand',  'Raise your hand.',              '손을 들어요.',             'Raise|your|hand'],
      ['foot',  'My foot is cold.',              '내 발이 차가워요.',        'My foot|is|cold'],
      ['leg',   'I hurt my leg.',                '나는 다리를 다쳤어요.',    'I|hurt|my leg'],
      ['tooth', 'My tooth is loose.',            '내 이가 흔들려요.',        'My tooth|is|loose'],
    ],
    32: [  // 우리 가족
      ['mother',      'My mother is kind.',            '우리 엄마는 친절해요.',             'My mother|is|kind'],
      ['father',      'My father is tall.',            '우리 아빠는 키가 커요.',            'My father|is|tall'],
      ['sister',      'My sister likes cats.',         '내 여자 형제는 고양이를 좋아해요.', 'My sister|likes|cats'],
      ['brother',     'I play with my brother.',       '나는 남자 형제와 놀아요.',          'I|play|with my brother'],
      ['grandmother', 'My grandmother makes cookies.', '할머니는 쿠키를 만들어요.',         'My grandmother|makes|cookies'],
      ['grandfather', 'My grandfather reads books.',   '할아버지는 책을 읽어요.',           'My grandfather|reads|books'],
      ['uncle',       'My uncle drives a bus.',        '삼촌은 버스를 운전해요.',           'My uncle|drives|a bus'],
      ['aunt',        'My aunt lives in Seoul.',       '이모는 서울에 살아요.',             'My aunt|lives|in Seoul'],
    ],
    5: [   // 냠냠 식당
      ['bread',  'I eat bread for breakfast.', '나는 아침으로 빵을 먹어요.', 'I|eat|bread|for breakfast'],
      ['milk',   'I drink milk every day.',    '나는 매일 우유를 마셔요.',   'I|drink|milk|every day'],
      ['egg',    'The egg is hot.',            '달걀이 뜨거워요.',           'The egg|is|hot'],
      ['pizza',  "Let's eat pizza.",           '우리 피자 먹어요.',          "Let's|eat|pizza"],
      ['cake',   'This cake is sweet.',        '이 케이크는 달콤해요.',      'This cake|is|sweet'],
      ['rice',   'I like rice.',               '나는 밥을 좋아해요.',        'I|like|rice'],
      ['cookie', 'Can I have a cookie?',       '쿠키 하나 먹어도 돼요?',     'Can|I|have|a cookie'],
      ['juice',  'This juice is cold.',        '이 주스는 차가워요.',        'This juice|is|cold'],
    ],
    50: [  // 인사 마을
      ['hello',        'Hello, I am Mina.',             '안녕, 나는 미나예요.',        'Hello,|I am|Mina'],
      ['goodbye',      'Goodbye, see you tomorrow.',    '잘 가, 내일 봐요.',           'Goodbye,|see you|tomorrow'],
      ['thanks',       'Thanks for the cake.',          '케이크 고마워요.',            'Thanks|for|the cake'],
      ['sorry',        'I am sorry.',                   '미안해요.',                   'I|am|sorry'],
      ['please',       'Please sit down.',              '앉아 주세요.',                'Please|sit|down'],
      ['welcome',      'Welcome to my house.',          '우리 집에 온 걸 환영해요.',   'Welcome|to|my house'],
      ['excuse me',    'Excuse me, where is the park?', '실례지만, 공원이 어디예요?',  'Excuse me,|where is|the park'],
      ['good morning', 'Good morning, how are you?',    '좋은 아침이에요, 잘 지내요?', 'Good morning,|how are|you'],
    ],
    8: [   // 장난감 방
      ['book',   'I read a book.',            '나는 책을 읽어요.',        'I|read|a book'],
      ['pencil', 'This is my pencil.',        '이것은 내 연필이에요.',    'This|is|my pencil'],
      ['bag',    'My bag is heavy.',          '내 가방은 무거워요.',      'My bag|is|heavy'],
      ['chair',  'Sit on the chair.',         '의자에 앉아요.',           'Sit|on|the chair'],
      ['clock',  'The clock is on the wall.', '시계가 벽에 있어요.',      'The clock|is|on the wall'],
      ['ball',   'I kick the ball.',          '나는 공을 차요.',          'I|kick|the ball'],
      ['cup',    'The cup is full.',          '컵이 가득 찼어요.',        'The cup|is|full'],
      ['hat',    'I wear a hat.',             '나는 모자를 써요.',        'I|wear|a hat'],
    ],

    // ---------- 2장 · 동물 숲 ----------
    35: [  // 정글 탐험
      ['tiger',    'The tiger is fast.',           '호랑이는 빨라요.',            'The tiger|is|fast'],
      ['elephant', 'The elephant is very big.',    '코끼리는 아주 커요.',         'The elephant|is|very big'],
      ['giraffe',  'The giraffe has a long neck.', '기린은 목이 길어요.',         'The giraffe|has|a long neck'],
      ['zebra',    'A zebra has stripes.',         '얼룩말은 줄무늬가 있어요.',   'A zebra|has|stripes'],
      ['fox',      'The fox is clever.',           '여우는 영리해요.',            'The fox|is|clever'],
      ['wolf',     'I hear a wolf at night.',      '밤에 늑대 소리가 들려요.',    'I|hear|a wolf|at night'],
      ['snake',    'The snake is long.',           '뱀은 길어요.',                'The snake|is|long'],
      ['horse',    'I can ride a horse.',          '나는 말을 탈 수 있어요.',     'I|can|ride|a horse'],
    ],
    36: [  // 작은 친구들
      ['ant',       'The ant is small.',        '개미는 작아요.',             'The ant|is|small'],
      ['bee',       'A bee makes honey.',       '벌은 꿀을 만들어요.',        'A bee|makes|honey'],
      ['butterfly', 'The butterfly is pretty.', '나비는 예뻐요.',             'The butterfly|is|pretty'],
      ['spider',    'The spider makes a web.',  '거미는 거미줄을 만들어요.',  'The spider|makes|a web'],
      ['frog',      'The frog can jump.',       '개구리는 뛸 수 있어요.',     'The frog|can|jump'],
      ['mouse',     'The mouse likes cheese.',  '쥐는 치즈를 좋아해요.',      'The mouse|likes|cheese'],
      ['duck',      'The duck can swim.',       '오리는 헤엄칠 수 있어요.',   'The duck|can|swim'],
      ['chicken',   'The chicken lays eggs.',   '닭은 알을 낳아요.',          'The chicken|lays|eggs'],
    ],
    9: [   // 깊은 바다
      ['fish',    'The fish lives in water.',   '물고기는 물에 살아요.',      'The fish|lives|in water'],
      ['whale',   'The whale is very big.',     '고래는 아주 커요.',          'The whale|is|very big'],
      ['dolphin', 'The dolphin is smart.',      '돌고래는 똑똑해요.',         'The dolphin|is|smart'],
      ['octopus', 'An octopus has eight arms.', '문어는 팔이 여덟 개예요.',   'An octopus|has|eight arms'],
      ['crab',    'The crab walks sideways.',   '게는 옆으로 걸어요.',        'The crab|walks|sideways'],
      ['shark',   'The shark has sharp teeth.', '상어는 이빨이 날카로워요.',  'The shark|has|sharp teeth'],
      ['turtle',  'The turtle is slow.',        '거북이는 느려요.',           'The turtle|is|slow'],
      ['penguin', 'A penguin cannot fly.',      '펭귄은 날 수 없어요.',       'A penguin|cannot|fly'],
    ],
    37: [  // 새와 목장
      ['bird',     'The bird is singing.',       '새가 노래하고 있어요.',     'The bird|is|singing'],
      ['owl',      'The owl wakes up at night.', '부엉이는 밤에 깨어나요.',   'The owl|wakes up|at night'],
      ['eagle',    'The eagle flies high.',      '독수리는 높이 날아요.',     'The eagle|flies|high'],
      ['parrot',   'The parrot can talk.',       '앵무새는 말할 수 있어요.',  'The parrot|can|talk'],
      ['sheep',    'The sheep is white.',        '양은 하얀색이에요.',        'The sheep|is|white'],
      ['goat',     'The goat eats grass.',       '염소는 풀을 먹어요.',       'The goat|eats|grass'],
      ['kangaroo', 'The kangaroo jumps high.',   '캥거루는 높이 뛰어요.',     'The kangaroo|jumps|high'],
      ['hamster',  'My hamster is cute.',        '내 햄스터는 귀여워요.',     'My hamster|is|cute'],
    ],
    38: [  // 채소밭
      ['carrot',   'The rabbit eats a carrot.', '토끼가 당근을 먹어요.',      'The rabbit|eats|a carrot'],
      ['potato',   'I like potato chips.',      '나는 감자칩을 좋아해요.',    'I|like|potato chips'],
      ['tomato',   'The tomato is red.',        '토마토는 빨간색이에요.',     'The tomato|is|red'],
      ['onion',    'The onion makes me cry.',   '양파 때문에 눈물이 나요.',   'The onion|makes|me|cry'],
      ['corn',     'The corn is yellow.',       '옥수수는 노란색이에요.',     'The corn|is|yellow'],
      ['cucumber', 'The cucumber is green.',    '오이는 초록색이에요.',       'The cucumber|is|green'],
      ['mushroom', 'This mushroom is big.',     '이 버섯은 커요.',            'This mushroom|is|big'],
      ['pumpkin',  'The pumpkin is orange.',    '호박은 주황색이에요.',       'The pumpkin|is|orange'],
    ],
    101: [ // 과일 2
      ['pear',      'This pear is juicy.',           '이 배는 즙이 많아요.',             'This pear|is|juicy'],
      ['cherry',    'The cherry is small and red.',  '체리는 작고 빨개요.',              'The cherry|is|small and red'],
      ['melon',     'I cut the melon.',              '나는 멜론을 잘라요.',              'I|cut|the melon'],
      ['pineapple', 'The pineapple is sweet.',       '파인애플은 달콤해요.',             'The pineapple|is|sweet'],
      ['kiwi',      'The kiwi is green inside.',     '키위는 속이 초록색이에요.',        'The kiwi|is|green inside'],
      ['mango',     'I like mango juice.',           '나는 망고 주스를 좋아해요.',       'I|like|mango juice'],
      ['coconut',   'The coconut is hard.',          '코코넛은 딱딱해요.',               'The coconut|is|hard'],
      ['blueberry', 'I put a blueberry on my cake.', '나는 케이크에 블루베리를 올려요.', 'I|put|a blueberry|on my cake'],
    ],
    41: [  // 간식 가게
      ['candy',     'This candy is sweet.',   '이 사탕은 달콤해요.',            'This candy|is|sweet'],
      ['chocolate', 'I love chocolate.',      '나는 초콜릿을 정말 좋아해요.',   'I|love|chocolate'],
      ['ice cream', 'I want ice cream.',      '나는 아이스크림을 먹고 싶어요.', 'I|want|ice cream'],
      ['donut',     'The donut is round.',    '도넛은 동그래요.',               'The donut|is|round'],
      ['sandwich',  'I make a sandwich.',     '나는 샌드위치를 만들어요.',      'I|make|a sandwich'],
      ['hamburger', 'This hamburger is big.', '이 햄버거는 커요.',              'This hamburger|is|big'],
      ['noodles',   'The noodles are hot.',   '국수가 뜨거워요.',               'The noodles|are|hot'],
      ['salad',     'I eat salad for lunch.', '나는 점심으로 샐러드를 먹어요.', 'I|eat|salad|for lunch'],
    ],
    4: [   // 씽씽 도로
      ['car',      'My father has a red car.',       '아빠는 빨간 자동차가 있어요.', 'My father|has|a red car'],
      ['bus',      'I go to school by bus.',         '나는 버스로 학교에 가요.',     'I|go|to school|by bus'],
      ['train',    'The train is fast.',             '기차는 빨라요.',               'The train|is|fast'],
      ['airplane', 'The airplane flies in the sky.', '비행기가 하늘을 날아요.',      'The airplane|flies|in the sky'],
      ['ship',     'The ship is on the sea.',        '배가 바다 위에 있어요.',       'The ship|is|on the sea'],
      ['bike',     'I ride my bike.',                '나는 자전거를 타요.',          'I|ride|my bike'],
      ['taxi',     'We take a taxi.',                '우리는 택시를 타요.',          'We|take|a taxi'],
      ['rocket',   'The rocket goes to the moon.',   '로켓이 달에 가요.',            'The rocket|goes|to the moon'],
    ],
    39: [  // 옷장
      ['shirt',  'My shirt is blue.',        '내 셔츠는 파란색이에요.',      'My shirt|is|blue'],
      ['pants',  'These pants are long.',    '이 바지는 길어요.',            'These pants|are|long'],
      ['dress',  'She wears a pink dress.',  '그녀는 분홍 원피스를 입어요.', 'She|wears|a pink dress'],
      ['shoes',  'I put on my shoes.',       '나는 신발을 신어요.',          'I|put on|my shoes'],
      ['socks',  'My socks are white.',      '내 양말은 하얀색이에요.',      'My socks|are|white'],
      ['coat',   'Wear your coat.',          '코트를 입어요.',               'Wear|your|coat'],
      ['gloves', 'I wear gloves in winter.', '나는 겨울에 장갑을 껴요.',     'I|wear|gloves|in winter'],
      ['scarf',  'My scarf is warm.',        '내 목도리는 따뜻해요.',        'My scarf|is|warm'],
    ],
  };
  const out = {};
  for (const id in raw) out[id] = raw[id].map(([w, en, ko, b]) => ({w, en, ko, blocks:b.split('|')}));
  return out;
})();

// 화면 없이 쓰는 계산 (테스트에서도 불러요)
const SentenceCore = (() => {
  // 문제 순서: 듣고 뜻 고르기 → 듣고 빈칸 채우기 → 블록 줄 세우기 (쉬운 것부터)
  const ROUND = ['listen','listen','blank','blank','order','order'];
  const mix = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const list = id => STAGE_SENTENCES[id] || [];
  const find = (id, w) => list(id).find(s => s.w === w);
  // 문장 속 단어 찾기 (첫 글자가 대문자여도 찾아요)
  const wordRe = w => new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
  const sameSound = (a, b) => typeof HOMOPHONES !== 'undefined' && HOMOPHONES.some(g => g.includes(a) && g.includes(b));
  return {
    ROUND,
    has: id => list(id).length >= ROUND.length,
    list, find, wordRe,
    // 문장 라운드 문제 순서: 단어가 겹치지 않게 6문제
    plan: id => mix(list(id)).slice(0, ROUND.length).map((s, i) => ({t:ROUND[i], w:s.w})),
    // 듣고 고르기 보기: 정답 문장 + 같은 단원의 다른 문장
    listenOpts: (id, w, n) => mix([find(id, w), ...mix(list(id).filter(s => s.w !== w)).slice(0, n - 1)]),
    // 빈칸 문장: {pre, word, post}. word 는 문장에 적힌 그대로 (대문자 포함)
    blank: s => {
      const m = wordRe(s.w).exec(s.en);
      return {pre: s.en.slice(0, m.index), word: m[0], post: s.en.slice(m.index + m[0].length)};
    },
    // 빈칸 보기: 정답 단어 + 같은 단원의 다른 단어 (소리가 같은 단어는 빼요)
    blankOpts: (id, w, n) => mix([w, ...mix(list(id).map(s => s.w).filter(x => x !== w && !sameSound(x, w))).slice(0, n - 1)]),
    // 블록을 섞되, 처음부터 정답 순서로 나오지는 않게
    shuffleBlocks: s => { let b; do { b = mix(s.blocks); } while (b.join(' ') === s.blocks.join(' ')); return b; },
    orderOk: (s, arr) => arr.join(' ') === s.blocks.join(' '),
    end: s => s.en.slice(s.blocks.join(' ').length),   // 끝 문장부호
  };
})();
