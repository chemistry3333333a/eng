/* =====================================================================
   워드 아일랜드 · 마을 입체 인형 (three.js)
   - 캐릭터 15종을 둥근 도형으로 만들고, 얼굴은 avatar-art 의 표정 그림을 머리 앞에 입혀요
   - 색은 AvatarArt.palette(id), 표정은 AvatarArt.expression(mood, beak) 를 그대로 써요
   - 크기: 발바닥 y=0, 머리 꼭대기 약 1.35 (scale 1 기준)
   ===================================================================== */
import * as THREE from 'three';

const hex = s => new THREE.Color(s);
// 말랑한 장난감 느낌: 매끈하게, 그늘에서 탁해지지 않게 살짝 스스로 빛나요 (밤엔 줄여요)
function T(c, o = {}){
  const col = typeof c === 'string' ? hex(c) : new THREE.Color(c);
  return new THREE.MeshStandardMaterial({color:col, roughness:.55, emissive:col, emissiveIntensity:.28, ...o});
}
function add(p, geo, mat, x = 0, y = 0, z = 0){
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
}
const ball = (r, d = 2) => new THREE.IcosahedronGeometry(r, d + 1);
const cone = (r, h, s = 4) => new THREE.ConeGeometry(r, h, s);
const capsule = (r, l) => new THREE.CapsuleGeometry(r, l, 4, 8);
const tube = (pts, r) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 16, r, 6);

/* ---------- 얼굴 그림 ----------
   그림 상자에서 x 20..100, y 20..92 를 잘라 머리 앞 조각에 붙여요 (머리 중심 60,58 r40) */
const FX0 = 20, FX1 = 100, FY0 = 20, FY1 = 92;
// 캐릭터별 얼굴 무늬 (avatar-art 의 front 중 얼굴 쪽만)
const DECAL = {
  cat: '<g stroke="#d9a752" stroke-width="2.5" stroke-linecap="round"><path d="M54 22V30M60 20V30M66 22V30"/></g>',
  dog: '<ellipse cx="74" cy="60" rx="13" ry="12" fill="#f3dcc2"/>',
  hamster: '<path d="M24 66Q30 96 60 97Q90 96 96 66Q86 80 60 80Q34 80 24 66Z" fill="#fff7ec"/><ellipse cx="60" cy="30" rx="9" ry="6" fill="#fff7ec"/>',
  penguin: '<path d="M60 40C48 26 24 40 26 64C28 86 44 96 60 96C76 96 92 86 94 64C96 40 72 26 60 40Z" fill="#fff"/>',
  bear: '<ellipse cx="60" cy="74" rx="15" ry="11" fill="#f0dcc4"/>',
  panda: '<ellipse cx="44" cy="63" rx="11" ry="13" fill="#3d3a40" transform="rotate(25 44 63)"/><ellipse cx="76" cy="63" rx="11" ry="13" fill="#3d3a40" transform="rotate(-25 76 63)"/><circle cx="46" cy="62" r="6.6" fill="#fff"/><circle cx="74" cy="62" r="6.6" fill="#fff"/>',
  fox: '<path d="M22 64Q38 90 60 80Q82 90 98 64Q98 98 60 98Q22 98 22 64Z" fill="#fff6ec"/>',
  dragon: '<g fill="#6fd0a8"><circle cx="50" cy="26" r="2.5"/><circle cx="60" cy="23" r="2.5"/><circle cx="70" cy="26" r="2.5"/></g>',
};
const texCache = new Map();
function faceTex(id, mood, beak){
  const key = id + ':' + mood;
  if (texCache.has(key)) return texCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="288" viewBox="${FX0} ${FY0} ${FX1 - FX0} ${FY1 - FY0}">${DECAL[id] || ''}${AvatarArt.expression(mood, beak)}</svg>`;
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 288;
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const img = new Image();
  img.onload = () => { cv.getContext('2d').drawImage(img, 0, 0); t.needsUpdate = true; };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  texCache.set(key, t); return t;
}
function faceCap(head, r, tex){
  const cl = v => Math.max(-.98, Math.min(.98, v));
  const x0 = cl((FX0 - 60)/40), x1 = cl((FX1 - 60)/40), y0 = cl((FY0 - 58)/40), y1 = cl((FY1 - 58)/40);
  const phiS = Math.PI/2 - Math.asin(x1), phiL = Math.asin(x1) - Math.asin(x0);
  const thS = Math.PI/2 + Math.asin(y0), thL = Math.asin(y1) - Math.asin(y0);
  const m = new THREE.Mesh(new THREE.SphereGeometry(r*1.012, 32, 24, phiS, phiL, thS, thL),
    new THREE.MeshStandardMaterial({map:tex, transparent:true, roughness:.6, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:.28}));
  head.add(m); return m;
}

/* ---------- 머리 위·뒤 장식 (캐릭터별) ---------- */
const R = .4;   // 머리 반지름
function hair(head, color, {bangs = 5, spiky = false} = {}){
  const m = T(color);
  const cap = add(head, new THREE.SphereGeometry(R*1.06, 20, 14, 0, Math.PI*2, 0, Math.PI*.5), m); cap.rotation.x = -.35;
  add(head, new THREE.SphereGeometry(R*1.05, 20, 14, Math.PI, Math.PI, 0, Math.PI*.78), m);
  for (let i = 0; i < bangs; i++){ const b = add(head, ball(.1, 1), m, -.24 + i*.12, .27 - Math.abs(i - 2)*.03, .26); b.scale.set(1, .7, .6); }
  if (spiky) for (let i = 0; i < 6; i++){ const a = -1.1 + i*.44, s = add(head, cone(.08, .22, 5), m, Math.sin(a)*.3, .36 + Math.cos(a)*.04, -.05 + Math.cos(a)*.06); s.rotation.z = -a*.6; }
  return m;
}
const kidEars = (head, c) => { for (const s of [-1, 1]) add(head, ball(.07, 1), T(c.f), s*.4, -.05, .02); };
function pointyEars(head, c, h = .28, spread = .24){
  for (const s of [-1, 1]){
    const e = add(head, cone(.15, h, 3), T(c.f), s*spread, .3 + h*.15, -.02); e.rotation.z = -s*.35; e.rotation.y = Math.PI/6;
    const n = add(head, cone(.08, h*.58, 3), T(c.in || c.f), s*spread*.98, .29 + h*.15, .045); n.rotation.z = -s*.35; n.rotation.y = Math.PI/6;
  }
}
function roundEars(head, outer, inner){
  for (const s of [-1, 1]){
    const e = add(head, ball(.13, 1), T(outer), s*.3, .3, -.04); e.scale.z = .6;
    if (inner) { const n = add(head, ball(.075, 1), T(inner), s*.3, .3, .02); n.scale.z = .4; }
  }
}
const tail = (body, pts, r, color) => add(body, tube(pts, r), T(color));

const EXTRA = {
  kid1(h, b, c){ kidEars(h, c); hair(h, c.hair); add(h, tube([[0, .4, .05], [.03, .5, .08], [.1, .55, .05]], .02), T(c.hair)); },
  kid2(h, b, c){
    kidEars(h, c); const m = hair(h, c.hair);
    for (const s of [-1, 1]){ add(h, ball(.15, 1), m, s*.43, -.18, -.05); add(h, ball(.05, 1), T('#ff8fb1'), s*.33, -.06, .02); }
    add(b, new THREE.CylinderGeometry(.18, .3, .22, 14), T('#ff9fbb'), 0, .2, 0);
  },
  kid3(h, b, c){ kidEars(h, c); hair(h, c.hair, {bangs:4, spiky:true}); },
  cat(h, b, c){
    pointyEars(h, c);
    for (const s of [-1, 1]) for (const k of [0, 1]){ const w = add(h, new THREE.CylinderGeometry(.006, .006, .2, 4), T(c.l), s*.42, -.1 + k*.05, .2); w.rotation.z = Math.PI/2 + s*(k ? .1 : -.1); }
    tail(b, [[0, .2, -.2], [.12, .3, -.4], [.25, .55, -.42], [.2, .7, -.32]], .05, c.f);
  },
  dog(h, b, c){
    for (const s of [-1, 1]){ const e = add(h, ball(.13, 1), T(c.in), s*.38, .02, -.02); e.scale.set(.6, 1.5, .6); e.rotation.z = s*.3; }
    tail(b, [[0, .22, -.22], [0, .32, -.34], [.05, .42, -.36]], .045, c.f);
  },
  bunny(h, b, c){
    for (const s of [-1, 1]){
      const ear = new THREE.Group(); ear.position.set(s*.15, .32, -.02); ear.rotation.z = -s*.15; h.add(ear);
      const e = add(ear, capsule(.08, .38), T(c.f), 0, .26, 0); e.scale.z = .7;
      const n = add(ear, capsule(.04, .3), T(c.in), 0, .26, .045); n.scale.z = .4;
      (h.userData.ears = h.userData.ears || []).push(ear);
    }
    add(b, ball(.09, 1), T('#ffffff'), 0, .24, -.24);
  },
  chick(h, b, c){ for (const [x, a] of [[-.05, .3], [0, 0], [.05, -.3]]){ const f = add(h, cone(.04, .16, 5), T(c.f), x, .44, 0); f.rotation.z = a; } },
  hamster(h, b, c){ roundEars(h, c.f, c.in); },
  penguin(h, b, c){},
  bear(h, b, c){ roundEars(h, c.f, c.in); add(b, ball(.07, 1), T(c.f), 0, .22, -.24); },
  panda(h, b, c){ roundEars(h, '#3d3a40'); },
  fox(h, b, c){
    pointyEars(h, c, .36, .25);
    const t = tail(b, [[0, .2, -.2], [.15, .26, -.42], [.32, .45, -.5]], .1, c.f);
    add(b, ball(.09, 1), T('#ffffff'), .34, .5, -.5);
  },
  unicorn(h, b, c){
    pointyEars(h, c, .2, .26);
    add(h, cone(.06, .34, 8), T('#ffd54f'), 0, .5, .12).rotation.x = .25;
    ['#fff0a8', '#ffc2e0', '#c9b5ff', '#b5e8ff', '#ffc2e0'].forEach((col, i) => add(h, ball(.09, 1), T(col), -.18 - i*.03, .32 - i*.14, -.12 - i*.05));
    tail(b, [[0, .22, -.22], [-.05, .3, -.36], [.02, .2, -.46]], .06, '#c9b5ff');
  },
  robot(h, b, c){
    add(h, new THREE.CylinderGeometry(.015, .015, .2, 6), T(c.l), 0, .48, 0);
    add(h, ball(.05, 1), T('#ff6f91'), 0, .6, 0);
    for (const s of [-1, 1]) add(h, new THREE.BoxGeometry(.08, .18, .14), T('#9fc1dc'), s*.41, -.02, 0);
    const v = add(h, new THREE.BoxGeometry(.28, .08, .06), T('#9fc1dc'), 0, .26, .3); v.rotation.x = -.6;
    ['#7ee0a8', '#ffd54f', '#ff8fb1'].forEach((col, i) => add(h, ball(.018, 0), T(col, {emissiveIntensity:.8}), -.07 + i*.07, .275, .33));
  },
  dragon(h, b, c){
    for (const s of [-1, 1]){ const k = add(h, cone(.06, .22, 6), T(c.in), s*.18, .42, -.04); k.rotation.z = -s*.35; }
    for (let i = 0; i < 3; i++) add(b, cone(.06, .12, 4), T('#6fd0a8'), 0, .48 - i*.13, -.22 - i*.02).rotation.x = -.8;
    tail(b, [[0, .18, -.2], [-.2, .12, -.38], [-.4, .2, -.42]], .07, c.f);
    for (const s of [-1, 1]){ const w = add(b, cone(.1, .2, 3), T('#6fd0a8'), s*.18, .45, -.18); w.rotation.z = s*1.2; }
  },
};

/* ---------- 인형 하나 ---------- */
export function makeDoll(id){
  const c = AvatarArt.palette(id);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const clothes = c.body || c.f;
  const feet = [-1, 1].map(s => { const f = add(body, ball(.1, 1), T(c.foot || clothes), s*.13, .06, .04); f.scale.set(1, .65, 1.25); return f; });
  const torso = add(body, ball(.26), T(clothes), 0, .3, 0); torso.scale.set(1, .9, .85);
  const belly = add(body, ball(.15, 1), T(c.belly || '#ffffff', c.belly ? {} : {transparent:true, opacity:c.bellyOp || .55}), 0, .27, .13); belly.scale.set(1, .85, .5);
  const arms = [-1, 1].map(s => {
    const pv = new THREE.Group(); pv.position.set(s*.24, .4, 0); body.add(pv);
    const a = add(pv, ball(.08, 1), T(c.arm || clothes), s*.03, -.09, 0); a.scale.set(1, 1.35, 1);
    pv.rotation.z = s*.45; return pv;
  });
  const head = new THREE.Group(); head.position.set(0, .92, 0); body.add(head);
  add(head, ball(R, 3), T(c.f));
  const tex = {base: faceTex(id, 'base', c.beak), smile: faceTex(id, 'smile', c.beak)};
  const cap = faceCap(head, R, tex.base);
  (EXTRA[id] || EXTRA.kid1)(head, body, c);
  const mats = [];
  root.traverse(o => { if (o.isMesh && o.material.emissive) mats.push(o.material); });
  root.userData.doll = {body, head, arms, feet, cap, tex, mats, ph:Math.random()*6, blink:1 + Math.random()*3, walk:0};
  return root;
}

/* ---------- 움직임 ----------
   walking: 걷는 중, yaw: 바라볼 방향(라디안), happy: 웃는 눈, nt: 밤 정도(0..1) */
export function animateDoll(root, {t, dt, walking = false, yaw = 0, happy = false, nt = 0, lift = 0}){
  const u = root.userData.doll; if (!u) return;
  u.walk += ((walking ? 1 : 0) - u.walk)*Math.min(1, dt*8);
  const s = Math.sin(t*10 + u.ph), w = u.walk;
  u.feet[0].position.z = .04 + s*.08*w; u.feet[1].position.z = .04 - s*.08*w;
  u.arms[0].rotation.x = s*.6*w; u.arms[1].rotation.x = -s*.6*w;
  u.body.position.y = lift + Math.abs(s)*.06*w + Math.abs(Math.sin(t*2.2 + u.ph))*.035*(1 - w);
  u.body.rotation.z = s*.06*w + Math.sin(t*1.3 + u.ph)*.04*(1 - w);
  u.head.rotation.z = Math.sin(t*1.1 + u.ph)*.06;
  u.head.rotation.x = Math.sin(t*.9 + u.ph)*.04;
  // 바라보는 쪽으로 부드럽게 돌아요
  let d = yaw - root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
  root.rotation.y += d*Math.min(1, dt*(walking ? 10 : 3));
  // 깜빡임 · 웃는 눈
  u.blink -= dt;
  const shut = happy || u.blink < .12;
  const want = shut ? u.tex.smile : u.tex.base;
  if (u.cap.material.map !== want){ u.cap.material.map = want; u.cap.material.emissiveMap = want; }
  if (u.blink < 0) u.blink = 2 + Math.random()*3;
  // 토끼 귀 살랑
  const ears = u.head.userData.ears;
  if (ears) ears.forEach((e, i) => e.rotation.z = (i ? -.15 : .15) + Math.sin(t*2 + u.ph + i)*.08*(i ? -1 : 1));
  // 밤엔 스스로 빛나는 정도를 줄여요
  const ei = .28 - .22*nt;
  if (u.ei !== ei){ u.mats.forEach(m => m.emissiveIntensity = m.emissiveIntensity > .5 ? m.emissiveIntensity : ei); u.ei = ei; }
}
