/* =====================================================================
   워드 아일랜드 · 마을 3D (three.js)
   - ES 모듈이라 village-screen.js / shop.js 가 처음 쓸 때 import() 로 불러요
   - 'three' 는 index.html 의 importmap 이 jsdelivr 고정 버전으로 이어 줘요
   - 놓기 규칙·저장은 Village(village.js) 가 하고, 여기는 그리기와 누르기만 해요
   ===================================================================== */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const R = 7.6;                                   // 섬 반지름 (놓기 반지름 6.2 보다 넉넉히)
const wob = a => 1 + .05*Math.sin(3*a) + .03*Math.sin(7*a + 1) + .02*Math.sin(11*a + 2);
const lerp = (a, b, t) => a + (b - a)*t;
// 늘 같은 섬이 나오게 씨앗 있는 난수
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* ---------- 재료와 붙이기 ---------- */
const matCache = new Map();
const M = (color, o) => {
  if (o) return new THREE.MeshStandardMaterial({color, roughness:.85, flatShading:true, ...o});
  if (!matCache.has(color)) matCache.set(color, new THREE.MeshStandardMaterial({color, roughness:.85, flatShading:true}));
  return matCache.get(color);
};
function add(parent, geo, mat, x = 0, y = 0, z = 0, shadow = true){
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
}
function prism(w, h, d){
  const s = new THREE.Shape(); s.moveTo(-w/2, 0); s.lineTo(w/2, 0); s.lineTo(0, h); s.lineTo(-w/2, 0);
  const g = new THREE.ExtrudeGeometry(s, {depth:d, bevelEnabled:false}); g.translate(0, 0, -d/2); return g;
}

/* ---------- 움직이는 것들 (장면마다 따로) ---------- */
function fx(){ return {smokes:[], flags:[], spin:[], glow:[], halos:[], water:[], clocks:[]}; }
const winMat = F => { const m = M(0x6b5a3c, {emissive:0xffc45a, emissiveIntensity:.15, flatShading:false}); F.glow.push(m); return m; };
let haloTex = null;
function halo(F, parent, x, y, z, s = 1.6){
  if (!haloTex){
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,220,140,1)'); gr.addColorStop(.4, 'rgba(255,190,90,.45)'); gr.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); haloTex = new THREE.CanvasTexture(c);
  }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map:haloTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:0}));
  sp.position.set(x, y, z); sp.scale.setScalar(s); parent.add(sp); F.halos.push(sp); return sp;
}
function chimney(F, g, x, y, z){
  add(g, new THREE.BoxGeometry(.24, .7, .24), M(0x9c8b78), x, y, z);
  for (let i = 0; i < 4; i++){
    const s = add(g, new THREE.IcosahedronGeometry(.12, 1), new THREE.MeshStandardMaterial({color:0xf5f2f8, transparent:true, opacity:.7, roughness:1, depthWrite:false}), x, y + .45, z, false);
    s.userData = {ph:i/4, bx:x, by:y + .4, bz:z}; F.smokes.push(s);
  }
}
function flag(F, g, x, y, z, color = 0xe85d5d){
  add(g, new THREE.CylinderGeometry(.02, .02, .6, 6), M(0x333333), x, y + .3, z);
  const f = add(g, new THREE.PlaneGeometry(.42, .24, 6, 1), new THREE.MeshStandardMaterial({color, side:THREE.DoubleSide}), x + .22, y + .48, z, false);
  f.userData.base = f.geometry.attributes.position.array.slice(); F.flags.push(f);
}
function flowerBox(g, w, z){
  add(g, new THREE.BoxGeometry(w, .1, .14), M(0x6b4a2f), 0, .05, z);
  const fl = [0xf472b6, 0xfde047, 0xffffff, 0xf87171];
  for (let i = 0; i < 6; i++) add(g, new THREE.IcosahedronGeometry(.06, 0), M(fl[i%4]), -w/2 + .1 + i*(w - .2)/5, .14, z, false);
}

/* ---------- 집 하나 (오두막·파란 집·빵집이 같이 써요) ---------- */
function houseBody(F, g, {w, d, h, wall, roof, timber, floors = 1}){
  add(g, new RoundedBoxGeometry(w, h, d, 2, .05), M(wall, {flatShading:false}), 0, h/2, 0);
  add(g, prism(w + .4, h*.75, d + .3), M(roof), 0, h - .02, 0);
  add(g, new THREE.BoxGeometry(w + .44, .06, d + .34), M(0x6a2c24), 0, h, 0);
  if (timber){
    const t = M(0x5b3a24);
    [-w/2 + .05, w/2 - .05].forEach(px => add(g, new THREE.BoxGeometry(.08, h, .05), t, px, h/2, d/2 + .01, false));
    add(g, new THREE.BoxGeometry(w, .08, .05), t, 0, h*.5, d/2 + .01, false);
  }
  add(g, new RoundedBoxGeometry(.38, .6, .08, 2, .04), M(0x6e3f22), 0, .3, d/2 + .02);
  add(g, new THREE.SphereGeometry(.03, 6, 6), M(0xffd166), .1, .3, d/2 + .07, false);
  const wm = winMat(F);
  for (let f = 0; f < floors; f++){
    const y = floors === 1 ? h*.7 : h*(.33 + f*.4) + .1;
    for (const px of [-w/2 + .34, w/2 - .34]){
      if (f === 0 && floors > 1 && Math.abs(px) < .3) continue;
      add(g, new THREE.BoxGeometry(.3, .28, .05), wm, px, y, d/2 + .03, false);
      add(g, new THREE.BoxGeometry(.03, .28, .07), M(0x5b3a24), px, y, d/2 + .04, false);
      add(g, new THREE.BoxGeometry(.38, .05, .1), M(0x5b3a24), px, y - .16, d/2 + .05, false);
    }
  }
  add(g, new THREE.BoxGeometry(.05, .28, .3), wm, w/2 + .03, h*.62, 0, false);
  add(g, new THREE.BoxGeometry(.05, .28, .3), wm, -w/2 - .03, h*.62, 0, false);
}

/* ---------- 장식 모델 ---------- */
const leafM = [0x4f9a4a, 0x3f8a45, 0x62ad55];
const MODELS = {
  cottage(F, g){
    houseBody(F, g, {w:1.6, d:1.4, h:1.15, wall:0xf2e4c4, roof:0xb8483a, timber:true});
    chimney(F, g, .42, 1.55, -.2); flowerBox(g, 1.3, .86);
  },
  house(F, g){
    houseBody(F, g, {w:1.7, d:1.5, h:1.55, wall:0xe9d9bc, roof:0x4d5f86, timber:false, floors:2});
    chimney(F, g, -.45, 1.95, -.25); flowerBox(g, 1.4, .9);
    add(g, new THREE.BoxGeometry(.8, .06, .3), M(0x5b3a24), 0, .68, .9);   // 차양
  },
  bakery(F, g){
    houseBody(F, g, {w:1.7, d:1.4, h:1.25, wall:0xfbe7d0, roof:0xc06a3c, timber:true});
    chimney(F, g, .5, 1.65, -.2);
    // 줄무늬 차양
    for (let i = 0; i < 8; i++){
      const s = add(g, new THREE.BoxGeometry(.2, .04, .42), M(i % 2 ? 0xffffff : 0xe85d5d), -.7 + i*.2, .82, .86, false); s.rotation.x = .45;
    }
    // 빵 간판
    add(g, new THREE.CylinderGeometry(.02, .02, .5, 6), M(0x333333), .95, .95, .55).rotation.z = Math.PI/2;
    add(g, new THREE.CapsuleGeometry(.09, .2, 4, 8), M(0xd9984a), 1.15, .82, .55).rotation.z = Math.PI/2;
    add(g, new THREE.BoxGeometry(.8, .3, .3), M(0x8b5a2b), -.45, .15, 1.0);    // 빵 상자
    for (let i = 0; i < 3; i++) add(g, new THREE.SphereGeometry(.08, 8, 6), M(0xe0a458), -.7 + i*.25, .34, 1.0, false);
  },
  tower(F, g){
    add(g, new THREE.CylinderGeometry(.6, .72, 2.8, 12), M(0xb9ab96), 0, 1.4, 0);
    for (let i = 0; i < 10; i++){ const a = i/10*Math.PI*2; add(g, new THREE.BoxGeometry(.2, .22, .2), M(0xa89a86), Math.cos(a)*.64, 2.9, Math.sin(a)*.64); }
    add(g, new THREE.ConeGeometry(.88, 1.5, 12), M(0x5363a0), 0, 3.65, 0);
    flag(F, g, 0, 4.4, 0);
    const wm = winMat(F);
    for (const [a, y] of [[1.57, 1.0], [1.57, 2.1], [0.2, 1.6], [2.9, 1.6]]){ const m = add(g, new RoundedBoxGeometry(.24, .36, .08, 2, .06), wm, Math.cos(a)*.66, y, Math.sin(a)*.66, false); m.rotation.y = Math.PI/2 - a; }
    add(g, new RoundedBoxGeometry(.38, .62, .1, 2, .06), M(0x6e3f22), 0, .31, .72);
  },
  castle(F, g){
    const st = M(0xd8cfc0), st2 = M(0xc4b9a6), roof = M(0x7e57c2);
    add(g, new THREE.BoxGeometry(1.5, 1.9, 1.3), st, 0, .95, -.1);
    for (let i = 0; i < 5; i++) add(g, new THREE.BoxGeometry(.18, .2, .18), st2, -.6 + i*.3, 2.0, .48);
    add(g, prism(1.3, .8, 1.0), roof, 0, 1.9, -.25);
    for (const [x, z] of [[-1.15, -1.0], [1.15, -1.0], [-1.15, 1.0], [1.15, 1.0]]){
      add(g, new THREE.CylinderGeometry(.34, .38, 2.2, 10), st, x, 1.1, z);
      add(g, new THREE.ConeGeometry(.48, .9, 10), roof, x, 2.65, z);
      flag(F, g, x, 3.05, z, 0xfbbf24);
      const wm = winMat(F); add(g, new RoundedBoxGeometry(.16, .26, .06, 2, .05), wm, x, 1.5, z + (z > 0 ? .36 : -.36), false);
    }
    // 성벽
    for (const [x, z, w, d] of [[0, 1.0, 2.0, .2], [0, -1.0, 2.0, .2], [-1.15, 0, .2, 1.6], [1.15, 0, .2, 1.6]]) add(g, new THREE.BoxGeometry(w, .9, d), st2, x, .45, z);
    add(g, new RoundedBoxGeometry(.5, .7, .24, 2, .1), M(0x5b3a24), 0, .35, 1.02);
    const wm = winMat(F);
    for (const x of [-.4, .4]) add(g, new RoundedBoxGeometry(.2, .32, .06, 2, .06), wm, x, 1.3, .56, false);
  },
  well(F, g){
    add(g, new THREE.CylinderGeometry(.36, .4, .38, 10), M(0xa8a29a), 0, .19, 0);
    add(g, new THREE.CylinderGeometry(.28, .28, .04, 10), new THREE.MeshStandardMaterial({color:0x3c6e9e, roughness:.2}), 0, .36, 0, false);
    [-.33, .33].forEach(px => add(g, new THREE.BoxGeometry(.06, .75, .06), M(0x6b4528), px, .55, 0));
    add(g, prism(.9, .34, .6), M(0xb8483a), 0, .88, 0);
    add(g, new THREE.CylinderGeometry(.03, .03, .66, 6), M(0x6b4528), 0, .75, 0).rotation.z = Math.PI/2;
    add(g, new THREE.CylinderGeometry(.07, .06, .1, 8), M(0x8b5a2b), 0, .6, 0);
  },
  windmill(F, g){
    add(g, new THREE.CylinderGeometry(.42, .68, 2.0, 8), M(0xf3e6cf), 0, 1.0, 0);
    add(g, new THREE.ConeGeometry(.6, .7, 8), M(0x8d5a3b), 0, 2.35, 0);
    const hub = new THREE.Group(); hub.position.set(0, 1.9, .55); g.add(hub); F.spin.push(hub);
    add(hub, new THREE.CylinderGeometry(.09, .09, .14, 8), M(0x5b3a24)).rotation.x = Math.PI/2;
    for (let i = 0; i < 4; i++){
      const arm = new THREE.Group(); arm.rotation.z = i*Math.PI/2; hub.add(arm);
      add(arm, new THREE.BoxGeometry(.06, 1.2, .04), M(0x5b3a24), 0, .64, 0);
      add(arm, new THREE.BoxGeometry(.3, .86, .02), M(0xfaf5ea), .16, .75, .02);
    }
    add(g, new RoundedBoxGeometry(.32, .55, .08, 2, .05), M(0x6e3f22), 0, .28, .62);
    const wm = winMat(F); add(g, new RoundedBoxGeometry(.18, .24, .05, 2, .04), wm, 0, 1.2, .5, false);
  },
  bridge(F, g){
    add(g, new THREE.BoxGeometry(2.3, .03, 1.0), new THREE.MeshStandardMaterial({color:0x5fb7e8, roughness:.1, metalness:.15, transparent:true, opacity:.9}), 0, .02, 0, false);
    const st = M(0xb9a891), n = 9;
    for (let i = 0; i < n; i++){
      const t = i/(n - 1), x = -.95 + t*1.9, y = .1 + Math.sin(t*Math.PI)*.38, a = Math.cos(t*Math.PI)*.55;
      const s = add(g, new THREE.BoxGeometry(.24, .12, .62), st, x, y, 0); s.rotation.z = a;
      for (const z of [-.3, .3]) add(g, new THREE.BoxGeometry(.22, .14, .06), M(0x9c8b78), x, y + .12, z).rotation.z = a;
    }
  },
  clocktower(F, g){
    add(g, new THREE.BoxGeometry(.9, 2.4, .9), M(0xd9cbb3), 0, 1.2, 0);
    add(g, new THREE.BoxGeometry(1.0, .12, 1.0), M(0x9c8b78), 0, 2.45, 0);
    add(g, new THREE.ConeGeometry(.78, .9, 4), M(0x2f7d6d), 0, 2.95, 0).rotation.y = Math.PI/4;
    for (let k = 0; k < 4; k++){
      const face = new THREE.Group(); face.rotation.y = k*Math.PI/2; g.add(face);
      add(face, new THREE.CylinderGeometry(.3, .3, .04, 24), M(0xfffbea, {flatShading:false}), 0, 1.95, .46, false).rotation.x = Math.PI/2;
      for (let i = 0; i < 12; i++){ const a = i/12*Math.PI*2; add(face, new THREE.BoxGeometry(.03, .03, .02), M(0x334155), Math.sin(a)*.24, 1.95 + Math.cos(a)*.24, .49, false); }
      const hh = new THREE.Group(); hh.position.set(0, 1.95, .5); face.add(hh);
      const mh = new THREE.Group(); mh.position.set(0, 1.95, .51); face.add(mh);
      add(hh, new THREE.BoxGeometry(.03, .14, .01), M(0x1e293b), 0, .07, 0, false);
      add(mh, new THREE.BoxGeometry(.02, .22, .01), M(0x1e293b), 0, .11, 0, false);
      F.clocks.push({hh, mh});
    }
    add(g, new RoundedBoxGeometry(.36, .6, .08, 2, .06), M(0x6e3f22), 0, .3, .47);
    const wm = winMat(F); add(g, new RoundedBoxGeometry(.2, .3, .05, 2, .05), wm, 0, 1.15, .47, false);
  },
  fountain(F, g){
    add(g, new THREE.CylinderGeometry(.68, .74, .26, 16), M(0xd6d0c4), 0, .13, 0);
    const water = new THREE.MeshStandardMaterial({color:0x6cc4f0, roughness:.08, metalness:.15, transparent:true, opacity:.85});
    add(g, new THREE.CylinderGeometry(.6, .6, .03, 16), water, 0, .24, 0, false);
    add(g, new THREE.CylinderGeometry(.08, .12, .7, 8), M(0xd6d0c4), 0, .55, 0);
    add(g, new THREE.CylinderGeometry(.3, .16, .1, 12), M(0xd6d0c4), 0, .92, 0);
    add(g, new THREE.CylinderGeometry(.25, .25, .02, 12), water, 0, .97, 0, false);
    // 숫자 블록 (수학 분수)
    const nums = [0xf87171, 0x60a5fa, 0xfbbf24];
    nums.forEach((c, i) => { const a = i/3*Math.PI*2; add(g, new RoundedBoxGeometry(.16, .16, .16, 2, .03), M(c), Math.cos(a)*.66, .34, Math.sin(a)*.66); });
    for (let i = 0; i < 10; i++){
      const d = add(g, new THREE.SphereGeometry(.03, 6, 4), water, 0, 1, 0, false);
      d.userData = {a:i/10*Math.PI*2, ph:i/10}; F.water.push(d);
    }
  },
  tree(F, g){
    add(g, new THREE.CylinderGeometry(.09, .14, .8, 6), M(0x6b4528), 0, .4, 0);
    add(g, new THREE.IcosahedronGeometry(.52, 0), M(leafM[0]), 0, 1.05, 0);
    add(g, new THREE.IcosahedronGeometry(.36, 0), M(leafM[1]), .3, .85, .12);
    add(g, new THREE.IcosahedronGeometry(.32, 0), M(leafM[2]), -.2, 1.35, -.1);
  },
  pine(F, g){
    add(g, new THREE.CylinderGeometry(.07, .1, .4, 6), M(0x6b4528), 0, .2, 0);
    [[.5, .7, .55], [.4, .6, .95], [.28, .55, 1.32]].forEach(([r, h, y]) => add(g, new THREE.ConeGeometry(r, h, 7), M(0x2f7a4a), 0, y, 0));
  },
  flower(F, g){
    add(g, new THREE.CylinderGeometry(.22, .24, .05, 8), M(0x7a5236), 0, .025, 0);
    const fl = [0xf472b6, 0xfde047, 0xffffff, 0xf87171, 0xa78bfa];
    for (let i = 0; i < 5; i++){
      const a = i/5*Math.PI*2, x = Math.cos(a)*.12, z = Math.sin(a)*.12;
      add(g, new THREE.CylinderGeometry(.01, .01, .18, 4), M(0x3f8a45), x, .12, z, false);
      add(g, new THREE.IcosahedronGeometry(.055, 0), M(fl[i]), x, .23, z, false);
    }
  },
  lamp(F, g){
    add(g, new THREE.CylinderGeometry(.04, .06, 1.2, 6), M(0x2e2a2a), 0, .6, 0);
    add(g, new RoundedBoxGeometry(.18, .22, .18, 2, .03), winMat(F), 0, 1.3, 0, false);
    add(g, new THREE.ConeGeometry(.15, .12, 4), M(0x2e2a2a), 0, 1.47, 0).rotation.y = Math.PI/4;
    halo(F, g, 0, 1.3, 0, 1.8);
  },
  fence(F, g){
    const w = M(0xb08455);
    for (const x of [-.45, 0, .45]) add(g, new THREE.BoxGeometry(.07, .42, .07), w, x, .21, 0);
    for (const y of [.15, .32]) add(g, new THREE.BoxGeometry(.98, .05, .04), w, 0, y, 0);
  },
  bench(F, g){
    const w = M(0xa0703f), iron = M(0x3a3a3a);
    add(g, new THREE.BoxGeometry(.9, .05, .28), w, 0, .26, 0);
    add(g, new THREE.BoxGeometry(.9, .2, .04), w, 0, .45, -.13).rotation.x = -.15;
    for (const x of [-.38, .38]){ add(g, new THREE.BoxGeometry(.04, .26, .24), iron, x, .13, 0); add(g, new THREE.BoxGeometry(.04, .3, .04), iron, x, .38, -.13); }
  },
  path(F, g){
    const st = M(0xe6d6b4), r = rng(7);
    [[-.22, -.2], [.2, -.18], [-.15, .22], [.22, .2]].forEach(([x, z], i) => {
      const s = add(g, new THREE.CylinderGeometry(.19 + r()*.04, .2, .05, 7), st, x, .025, z, false); s.rotation.y = i;
    });
  },
  pond(F, g){
    const p = new THREE.Group(); p.scale.set(1, 1, .72); g.add(p);
    add(p, new THREE.CylinderGeometry(.92, .92, .04, 28), new THREE.MeshStandardMaterial({color:0x5fb7e8, roughness:.08, metalness:.2, transparent:true, opacity:.92}), 0, .02, 0, false);
    const rim = add(p, new THREE.TorusGeometry(.96, .09, 6, 28), M(0xb7aa95), 0, .03, 0); rim.rotation.x = Math.PI/2;
    for (const [x, z] of [[-.3, -.2], [.35, .25], [.1, -.4]]) add(p, new THREE.CylinderGeometry(.14, .14, .02, 10), M(0x4c9a4c), x, .05, z, false);
    add(p, new THREE.IcosahedronGeometry(.06, 0), M(0xf9a8d4), .35, .09, .25, false);
    for (let i = 0; i < 6; i++){ const a = i*1.1; add(g, new THREE.ConeGeometry(.04, .3, 4), M(0x5aa043), Math.cos(a)*.95, .15, Math.sin(a)*.7, false); }
  },
  mailbox(F, g){
    add(g, new THREE.BoxGeometry(.06, .55, .06), M(0x6b4528), 0, .27, 0);
    add(g, new RoundedBoxGeometry(.2, .2, .32, 3, .08), M(0xe11d48, {flatShading:false}), 0, .62, 0);
    add(g, new THREE.BoxGeometry(.02, .14, .04), M(0xfbbf24), .11, .7, -.05);
    add(g, new THREE.BoxGeometry(.02, .05, .1), M(0xfbbf24), .11, .78, -.01);
  },
};
function model(F, id){
  const g = new THREE.Group();
  (MODELS[id] || MODELS.flower)(F, g);
  return g;
}

/* ---------- 캐릭터 종이 인형 ---------- */
const CH_H = 1.25, FEET = (140 + 24)/180;        // avatar-art 의 그림 상자에서 발 위치
const texCache = new Map();
function charTex(id){
  if (texCache.has(id)) return texCache.get(id);
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 288;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const svg = AvatarArt.character({body:id, mood:'smile'}).replace('<svg ', '<svg width="256" height="288" ');
  const img = new Image();
  img.onload = () => { cv.getContext('2d').drawImage(img, 0, 0, 256, 288); tex.needsUpdate = true; };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  texCache.set(id, tex); return tex;
}
function character(id){
  const g = new THREE.Group(), tex = charTex(id), W = CH_H*160/180;
  const geo = new THREE.PlaneGeometry(W, CH_H); geo.translate(0, CH_H*FEET - CH_H/2, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({map:tex, transparent:true, alphaTest:.4, side:THREE.DoubleSide}));
  m.castShadow = true;
  m.customDepthMaterial = new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking, map:tex, alphaTest:.4});
  g.add(m); g.userData.doll = m;
  return g;
}

/* ---------- 섬 ---------- */
function island(scene, F){
  const organic = geo => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++){ const x = p.getX(i), z = p.getZ(i), k = wob(Math.atan2(z, x)); p.setX(i, x*k); p.setZ(i, z*k); }
    geo.computeVertexNormals(); return geo;
  };
  const top = add(scene, organic(new THREE.CylinderGeometry(R, R, .7, 56, 1)), M(0x84c45e), 0, -.35, 0);
  top.userData.ground = true;
  add(scene, organic(new THREE.CylinderGeometry(R*.99, R*.8, 1.6, 56, 2)), M(0x9a6a43), 0, -1.5, 0);
  add(scene, organic(new THREE.CylinderGeometry(R*.8, R*.45, 2.2, 36, 2)), M(0x7d5536), 0, -3.4, 0);
  add(scene, organic(new THREE.CylinderGeometry(R*.45, .4, 4.5, 20, 3)), M(0x5e4130), 0, -6.7, 0);
  const r = rng(3), grass = [M(0x6fb24f), M(0x5aa043), M(0x8fce64)];
  for (let i = 0; i < 90; i++){
    const a = r()*Math.PI*2, d = 6.5 + r()*.9;
    if (d > R*wob(a) - .2) continue;
    add(scene, new THREE.ConeGeometry(.05 + r()*.04, .2 + r()*.18, 4), grass[i%3], Math.cos(a)*d, .08, Math.sin(a)*d, false);
  }
  const rocks = [];
  for (let i = 0; i < 8; i++){
    const a = i*.8 + .3, d = 9.5 + (i%3)*1.3;
    const rk = add(scene, new THREE.DodecahedronGeometry(.35 + (i%4)*.15, 0), M(0x7d5536), Math.cos(a)*d, -2 - (i%3)*1.4, Math.sin(a)*d);
    add(rk, new THREE.CylinderGeometry(.38 + (i%4)*.15, .3, .12, 7), M(0x84c45e), 0, .3 + (i%4)*.12, 0);
    rk.userData = {y:rk.position.y, ph:i}; rocks.push(rk);
  }
  const cloudM = new THREE.MeshStandardMaterial({color:0xffffff, roughness:1, flatShading:true, transparent:true, opacity:.95});
  const clouds = [];
  for (let i = 0; i < 6; i++){
    const g = new THREE.Group(); scene.add(g);
    for (let j = 0; j < 4; j++) add(g, new THREE.IcosahedronGeometry(.9 + r()*.6, 1), cloudM, j*1.1 - 1.6, r()*.4, r()*.6, false);
    g.userData = {a:i/6*Math.PI*2, r:8.5 + (i%3)*3, y:-5.5 - (i%3)*1.8}; clouds.push(g);
  }
  return {rocks, clouds};
}

/* ---------- 조명 ---------- */
function lights(scene, small){
  const hemi = new THREE.HemisphereLight(0xd6ecff, 0x6b8f4e, 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d0, 2.6);
  sun.position.set(10, 16, 7); sun.castShadow = true;
  const n = small ? 1024 : 2048; sun.shadow.mapSize.set(n, n);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = .03;
  Object.assign(sun.shadow.camera, {left:-11, right:11, top:11, bottom:-11, near:1, far:50});
  scene.add(sun);
  return {hemi, sun};
}

// 움직이는 것들 한 번에 (장면, 썸네일 미리보기가 같이 써요)
function animate(F, t, dt, nt){
  F.spin.forEach(h => h.rotation.z += dt*.8);
  F.smokes.forEach(s => { const k = (t*.25 + s.userData.ph)%1; s.position.set(s.userData.bx + k*.4, s.userData.by + k*1.1, s.userData.bz); s.scale.setScalar(.6 + k*1.2); s.material.opacity = .7*(1 - k); });
  F.flags.forEach(f => { const p = f.geometry.attributes.position, b = f.userData.base; for (let i = 0; i < p.count; i++){ const x = b[i*3]; p.setZ(i, Math.sin(t*5 + x*10)*.05*(x + .21)); } p.needsUpdate = true; });
  F.water.forEach(d => { const k = (t*.6 + d.userData.ph)%1, a = d.userData.a; d.position.set(Math.cos(a)*k*.4, 1.0 + Math.sin(k*Math.PI)*.35 - k*.7, Math.sin(a)*k*.4); });
  if (F.clocks.length){ const now = new Date(), m = now.getMinutes() + now.getSeconds()/60, h = now.getHours()%12 + m/60; F.clocks.forEach(c => { c.hh.rotation.z = -h/12*Math.PI*2; c.mh.rotation.z = -m/60*Math.PI*2; }); }
  F.glow.forEach(m => m.emissiveIntensity = lerp(.15, 2.2, nt));
  F.halos.forEach(h => h.material.opacity = nt*.9);
}

/* =====================================================================
   마을 장면
   ===================================================================== */
export async function create(container, {onPick = () => {}, onGround = () => {}, canPlace = () => true} = {}){
  const small = Math.min(innerWidth, innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.touchAction = 'none';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 200);
  camera.position.set(13.5, 11.5, 15);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, .2, 0); controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 8; controls.maxDistance = 32; controls.maxPolarAngle = 1.3; controls.minPolarAngle = .45;
  controls.autoRotate = true; controls.autoRotateSpeed = .35;

  const F = fx(), L = lights(scene, small), isl = island(scene, F);

  // 놓인 것들: 저장 항목(entry) → three 객체
  const objs = new Map();
  const cellMat = c => new THREE.MeshBasicMaterial({color:c, transparent:true, opacity:.45, depthWrite:false});
  const okMat = cellMat(0x22c55e), badMat = cellMat(0xef4444), selMat = cellMat(0xf59e0b);
  function footprint(e, mat){
    const d = Village.item(e.id), [w, h] = e.k === 'c' ? [1, 1] : (e.r % 2 ? [d.d, d.w] : [d.w, d.d]);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w*.5 - .04, h*.5 - .04), mat);
    m.rotation.x = -Math.PI/2; m.position.y = .03; return m;
  }
  function build(e){
    const root = new THREE.Group();
    const body = e.k === 'c' ? character(e.id) : model(F, e.id);
    root.add(body); root.userData = {entry:e, body, ph:Math.random()*6};
    root.position.set(e.x, 0, e.z); if (e.k === 'd') body.rotation.y = -e.r*Math.PI/2;
    scene.add(root); return root;
  }
  function drop(o){ scene.remove(o); }   // 재료는 공유라 버리지 않아요 (그림자 텍스처 등은 장면이 끝날 때 같이)

  let selected = null, selMesh = null;
  function sync(){
    const list = S.village.placed, seen = new Set(list);
    for (const [e, o] of objs) if (!seen.has(e)){ drop(o); objs.delete(e); }
    for (const e of list){
      let o = objs.get(e);
      if (!o){ o = build(e); objs.set(e, o); o.userData.land = 0; continue; }
      const u = o.userData;
      if (o.position.x !== e.x || o.position.z !== e.z){ u.from = o.position.clone(); u.to = new THREE.Vector3(e.x, 0, e.z); u.k = 0; }
      if (e.k === 'd'){ const ry = -e.r*Math.PI/2; if (u.body.rotation.y !== ry){ u.ry0 = u.body.rotation.y; u.ry1 = ry; u.rk = 0; } }
    }
    if (selected && !list.includes(selected)) select(null);
    else if (selected) select(list.indexOf(selected));
  }
  function select(i){
    if (selMesh){ selMesh.parent && selMesh.parent.remove(selMesh); selMesh = null; }
    selected = i == null || i < 0 ? null : S.village.placed[i] || null;
    if (selected){ selMesh = footprint(selected, selMat); objs.get(selected).add(selMesh); controls.autoRotate = false; }
  }
  function hop(i){ const e = S.village.placed[i], o = e && objs.get(e); if (o) o.userData.land = 0; }

  // 놓기 미리보기
  let ghost = null, ghostEntry = null, ghostCell = null;
  function setGhost(e){
    if (ghost){ scene.remove(ghost); ghost = null; }
    ghostEntry = e ? {...e} : null;
    if (!e) return;
    ghost = new THREE.Group();
    const body = e.k === 'c' ? character(e.id) : model(fx(), e.id);
    body.traverse(m => { if (m.isMesh){ m.castShadow = false; m.material = m.material.map ? new THREE.MeshBasicMaterial({map:m.material.map, transparent:true, opacity:.6, alphaTest:.3}) : new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:.45}); } });
    if (e.k === 'd') body.rotation.y = -(e.r || 0)*Math.PI/2;
    ghost.add(body); ghostCell = footprint({...e, r:e.r || 0}, okMat); ghost.add(ghostCell);
    ghost.visible = false; scene.add(ghost); controls.autoRotate = false;
  }
  function moveGhost(x, z){
    if (!ghost) return;
    ghostEntry.x = x; ghostEntry.z = z;
    ghost.position.set(x, 0, z); ghost.visible = true;
    ghostCell.material = canPlace(ghostEntry) ? okMat : badMat;
  }

  // 누르기: 끌기(돌리기)와 구분해요
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const el = renderer.domElement;
  const aim = e => { const r = el.getBoundingClientRect(); ptr.set((e.clientX - r.left)/r.width*2 - 1, -(e.clientY - r.top)/r.height*2 + 1); ray.setFromCamera(ptr, camera); };
  const groundAt = () => { const p = new THREE.Vector3(); return ray.ray.intersectPlane(plane, p) && Math.hypot(p.x, p.z) < R ? {x:Village.snap(p.x), z:Village.snap(p.z)} : null; };
  let down = null;
  const onDown = e => { down = [e.clientX, e.clientY]; controls.autoRotate = false; };
  const onMove = e => { if (!ghost || e.pointerType === 'touch') return; aim(e); const g = groundAt(); if (g) moveGhost(g.x, g.z); else ghost.visible = false; };
  const onUp = e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
    down = null; aim(e);
    if (!ghost){
      const hits = ray.intersectObjects([...objs.values()], true);
      for (const h of hits){
        let o = h.object; while (o && !o.userData.entry) o = o.parent;
        if (o){ onPick(S.village.placed.indexOf(o.userData.entry)); return; }
      }
    }
    const g = groundAt();
    if (g){ if (ghost) moveGhost(g.x, g.z); onGround(g); }
  };
  el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp);

  // 크기
  const fit = () => { const w = container.clientWidth || 1, h = container.clientHeight || 1; renderer.setSize(w, h); camera.aspect = w/h; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(fit); ro.observe(container); fit();
  // 세로로 긴 화면(폰)은 섬이 잘리지 않게 카메라를 처음에 더 뒤로 빼요
  if (camera.aspect < 1){ camera.position.multiplyScalar(Math.min(1.9, .95/camera.aspect)); controls.maxDistance = Math.max(controls.maxDistance, camera.position.length() + 4); }

  // 낮/밤
  let night = !!S.village.night, nt = night ? 1 : 0;
  const setNight = on => { night = !!on; container.classList.toggle('night', night); };
  setNight(night);

  // 그리기 고리
  const clock = new THREE.Clock(); let raf = 0, paused = false, dead = false;
  function tick(){
    if (dead || paused) return;
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    nt += ((night ? 1 : 0) - nt)*Math.min(1, dt*2);
    L.sun.intensity = lerp(2.6, .35, nt); L.sun.color.setHSL(lerp(.11, .64, nt), lerp(.6, .4, nt), lerp(.9, .75, nt));
    L.hemi.intensity = lerp(1.1, .35, nt); renderer.toneMappingExposure = lerp(1.05, 1.25, nt);
    animate(F, t, dt, nt);
    isl.clouds.forEach(c => { const a = c.userData.a + t*.02; c.position.set(Math.cos(a)*c.userData.r, c.userData.y, Math.sin(a)*c.userData.r); c.lookAt(0, c.userData.y, 0); });
    isl.rocks.forEach(r => r.position.y = r.userData.y + Math.sin(t*.8 + r.userData.ph)*.15);
    const cp = camera.position, shade = lerp(1, .6, nt);
    for (const o of objs.values()){
      const u = o.userData, e = u.entry;
      if (u.to){ u.k = Math.min(1, u.k + dt*(e.k === 'c' ? 1.6 : 4)); o.position.lerpVectors(u.from, u.to, u.k); if (u.k >= 1){ u.to = null; u.land = 0; } }
      if (u.ry1 != null){ u.rk = Math.min(1, u.rk + dt*5); u.body.rotation.y = lerp(u.ry0, u.ry1, 1 - (1 - u.rk)**3); if (u.rk >= 1){ u.body.rotation.y = u.ry1; u.ry1 = null; } }
      let y = 0;
      if (u.land != null){ u.land += dt*3; y = Math.sin(Math.min(1, u.land)*Math.PI)*(e.k === 'c' ? .35 : .25); if (u.land >= 1) u.land = null; }
      if (e.k === 'c'){
        const moving = !!u.to;
        u.body.position.y = y + (moving ? Math.abs(Math.sin(t*10))*.3 : Math.abs(Math.sin(t*2.2 + u.ph))*.05) + (e === selected ? .15 : 0);
        // 위에서 내려다봐도 납작해 보이지 않게 카메라 쪽으로 살짝 눕혀요 (발이 축)
        u.body.rotation.order = 'YXZ';
        u.body.rotation.y = Math.atan2(cp.x - o.position.x, cp.z - o.position.z);
        u.body.rotation.x = -Math.atan2(cp.y, Math.hypot(cp.x - o.position.x, cp.z - o.position.z))*.55;
        u.body.userData.doll.material.color.setScalar(shade);
      } else u.body.position.y = y;
    }
    if (ghost && ghost.children[0] && ghostEntry.k === 'c'){ const gb = ghost.children[0]; gb.rotation.order = 'YXZ'; gb.rotation.y = Math.atan2(cp.x - ghost.position.x, cp.z - ghost.position.z); gb.rotation.x = -Math.atan2(cp.y, Math.hypot(cp.x - ghost.position.x, cp.z - ghost.position.z))*.55; }
    controls.update(); renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  sync(); tick();

  return {
    sync, select, hop, setNight,
    ghost(e){ setGhost(e); },
    ghostAt(x, z){ moveGhost(x, z); },
    pause(on){ if (paused === !!on) return; paused = !!on; if (!paused){ clock.getDelta(); tick(); } else cancelAnimationFrame(raf); },
    dispose(){
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
      el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', onUp);
      renderer.dispose(); renderer.forceContextLoss(); el.remove();
    },
  };
}

/* =====================================================================
   상점용: 썸네일과 도는 미리보기
   ===================================================================== */
function studio(){
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x8aa070, 1.4));
  const d = new THREE.DirectionalLight(0xfff0d0, 2.2); d.position.set(4, 8, 6); scene.add(d);
  return scene;
}
function frame(camera, obj){
  const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  const r = Math.max(s.x, s.y, s.z)*.62 + .1, dist = r/Math.tan(camera.fov*Math.PI/360);
  camera.position.set(c.x + dist*.62, c.y + dist*.5, c.z + dist*.62); camera.lookAt(c);
}
const thumbCache = new Map();
let thumbR = null;
export async function thumbs(ids){
  if (!thumbR){
    thumbR = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true});
    thumbR.setSize(160, 160); thumbR.outputColorSpace = THREE.SRGBColorSpace; thumbR.toneMapping = THREE.ACESFilmicToneMapping;
  }
  const out = {};
  for (const id of ids){
    if (!thumbCache.has(id)){
      const scene = studio(), cam = new THREE.PerspectiveCamera(30, 1, .05, 100), obj = model(fx(), id);
      scene.add(obj); frame(cam, obj); thumbR.render(scene, cam);
      thumbCache.set(id, thumbR.domElement.toDataURL('image/png'));
    }
    out[id] = thumbCache.get(id);
  }
  return out;
}
export async function spinPreview(el, id){
  const r = new THREE.WebGLRenderer({antialias:true, alpha:true});
  r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
  const w = el.clientWidth || 300, h = el.clientHeight || 200; r.setSize(w, h);
  r.domElement.style.cssText = 'width:100%;height:100%;display:block';
  el.innerHTML = ''; el.appendChild(r.domElement);
  const scene = studio(), cam = new THREE.PerspectiveCamera(30, w/h, .05, 100), F = fx(), obj = model(F, id);
  const piv = new THREE.Group(); piv.add(obj); scene.add(piv);
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, .06, 32), M(0x9ed98a)); ground.position.y = -.03; scene.add(ground);
  frame(cam, obj);
  const clock = new THREE.Clock(); let raf = 0, dead = false;
  const loop = () => { if (dead) return; const dt = Math.min(clock.getDelta(), .05); piv.rotation.y += dt*.6; animate(F, clock.elapsedTime, dt, 0); r.render(scene, cam); raf = requestAnimationFrame(loop); };
  loop();
  return {dispose(){ dead = true; cancelAnimationFrame(raf); r.dispose(); r.forceContextLoss(); r.domElement.remove(); }};
}
