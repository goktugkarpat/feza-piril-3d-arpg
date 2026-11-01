/* ── MABET_DEKOR: Bölüm 6 (Ay Tapınağı) çevre süsleri (E567) ──
   06z_mabet.js kur() içinden:  const ok = MABET_DEKOR.olustur(L, api, { K: ODAKIT });  → true ise eski basit süsler atlanır.
   Sakin, krem-gri antik taş: oymalı sütun sıraları, yıkık kemerler, ay evresi plaketleri (friz), dikilitaşlar, ay çiçekleri,
   gümüş-mavi havuzlar, taş basamaklı kalıntılar, sarmaşık, servi, uzak dağ zirveleri ve bulut denizi. Ay yüzeyi/krater YOK. Mor yok. */
const MABET_DEKOR = (() => {
  'use strict';
  const P = PROPKIT, PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  function olustur(L, api, ctx) {
    const K = ctx.K;
    if (!K || typeof MANTAR_DEKOR === 'undefined' || !P.column || !P.TEMA.mabet) return false;
    if (K.lowShadow) K.lowShadow(api, 99);
    const rnd = api.rnd, put = api.put, T = P.TEMA.mabet, isF = (x, z) => api.isFloor(x, z);
    const pick = a => a[(rnd() * a.length) | 0];
    const coneH = (x, z) => { for (let d = 0.5; d <= 14; d += 0.75) { const w = d * 0.45 + 0.8; for (let dx = -w; dx <= w; dx += 0.9) if (isF(x + dx, z - d)) return 0.5 + d * 0.85; } return 99; };
    const fN = (x, z) => K.floorNorth(L, x, z, 9), fD = (x, z, m = 8) => K.floorDist(L, x, z, m);
    const D = MANTAR_DEKOR.olustur(L, api, { K, coneH, fN, fD, isF, tema: 'mabet' });
    const ids = L.rooms.map((r, i) => i);
    const STONE = [0xfff2dc, 0xf6ead4, 0xfdf0d8, 0xefe4cc], stone = () => pick(STONE);
    const placed = [];
    const spaced = (x, z, r) => { for (const q of placed) if (hyp(q.x - x, q.z - z) < r + q.r) return false; placed.push({ x, z, r }); return true; };
    const pools = [];
    let shafts = 0;
    const shaftG = api.dispose(new THREE.CylinderGeometry(0.7, 1.7, 6.5, 14, 1, true));
    const shaftM = api.dispose(new THREE.MeshBasicMaterial({ color: 0xdfeaff, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
    const shaft = (x, z) => { if (shafts >= 10) return; shafts++; const m = new THREE.Mesh(shaftG, shaftM); m.position.set(x + 1.2, 3.1, z + 0.6); m.rotation.z = 0.2; m.renderOrder = 3; api.add(m); };

    // ── bileşenler ──
    const vines = (x, y, z, w, n) => { for (let i = 0; i < n; i++) { const a = rnd() * TAU, hh = 0.6 + rnd() * 1.1; put(P.vine((rnd() * 4) | 0), x + Math.sin(a) * w, y, z + Math.cos(a) * w, 1, Math.min(hh, y - 0.3), 1, pick(T.ivy), a, 0, 0, 'shinyNS'); } };
    const flowers = (x, z, n, sc = 1) => {
      for (let i = 0, nn = Math.max(1, Math.round(n * 0.4)); i < nn; i++) {   // PERF: çiçek sayısı azaltıldı, çiçekler biraz iri
        const a = rnd() * TAU, d = Math.sqrt(rnd()) * 0.7 * sc, k = (rnd() * 3) | 0, s = (0.7 + rnd() * 0.6) * sc, px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d, yw = rnd() * TAU;
        put(P.moonflower(k), px, 0, pz, s, s, s, 0xffffff, yw, 0, 0, 'decor'); put(P.moonflowerBloom(k), px, 0, pz, s, s, s, 0xe6efff, yw, 0, 0, 'glow');
      }
      api.glow(x, z, 1.4 * sc + 0.8, 0xcfe0ff, 0.1);
    };
    const column = (x, z, s, kind, o = {}) => {
      const k = (rnd() * 4) | 0, yw = rnd() * TAU;
      put(P.column(kind, k), x, 0, z, s, s, s, stone(), yw, 0, 0, s > 2.6 ? 'shiny' : 'shinyNS');
      if (kind === 0 && o.ivy !== false && rnd() < 0.55) vines(x, s * 0.78, z, 0.12 * s, 2);
      if (rnd() < 0.5) put(P.broadLeaf((rnd() * 3) | 0), x + 0.3, 0.05, z + 0.2, 0.6, 0.6, 0.6, pick(T.ivy), rnd() * TAU, 0.3, 0, 'decor');
      if (kind === 0 && rnd() < 0.4) shaft(x, z);
      if (rnd() < 0.5) flowers(x + 0.7, z + 0.5, 3, 0.8);
    };
    const archS = (x, z, s, yaw, kind) => {
      put(P.archStone(kind, (rnd() * 3) | 0), x, 0, z, s, s, s, stone(), yaw, 0, 0, 'shiny');
      if (!kind) vines(x, 1.12 * s, z, 0.3 * s, 3);
      flowers(x + 0.6 * s, z + 0.4, 4, 0.9);
    };
    const obelisk = (x, z, s) => {
      put(P.obelisk((rnd() * 3) | 0), x, 0, z, s, s, s, stone(), rnd() * TAU, 0, 0, 'shiny');
      const k = (rnd() * 3) | 0; const yaw = rnd() * TAU; put(P.obeliskRunes(k), x, 0, z, s, s, s, pick([0x9fd8ff, 0xffe9a8]), yaw, 0, 0, 'glow');
      api.glow(x, z, s * 1.5 + 1, 0xaadcff, 0.1); shaft(x, z);
    };
    const frieze = (x, z, n, s) => {   // alçak taş duvar + ay evresi plaketleri (güneye bakar)
      const w = n * 0.95 * s, hW = 0.9 * s;
      put(P.steps(1, 2), x, 0, z, w, hW / 0.1, 1.4 * s / 0.24, stone(), 0, 0, 0, 'shinyNS');
      put(P.steps(1, 3), x, hW, z, w * 1.04, 0.5, 1.7 * s / 0.24, stone(), 0, 0, 0, 'shinyNS');
      const ph0 = (rnd() * 8) | 0;
      for (let i = 0; i < n; i++) put(P.moonDisc((ph0 + i) % 8), x + (i - (n - 1) / 2) * 0.95 * s, hW * 0.5, z + 0.7 * s + 0.01, 0.8 * s, 0.8 * s, 1, pick([0xfff2dc, 0xf6ead4]), 0, 0, 0, 'shinyNS');
    };
    const stairsRuin = (x, z, s) => {   // kuzeye yükselen basamaklar + taş taban + sütunlar
      const S1 = s * 1.1, zTop = z + 0.4 * s - 4 * 0.22 * S1, topY = 0.5 * S1, pz = zTop - 1.8 * s;
      put(P.steps(5, (rnd() * 3) | 0), x, 0, z + 0.4 * s, 3.2 * s, S1, S1, stone(), 0, 0, 0, 'shiny');
      put(P.steps(1, 4), x, 0, pz, 3.6 * s, topY / 0.1, 3.4 * s / 0.24, stone(), 0, 0, 0, 'shiny');
      for (const sd of [-1, 1]) put(P.column(rnd() < 0.6 ? 0 : 1, (rnd() * 4) | 0), x + sd * 1.3 * s, topY, pz, 2.4 * s, 2.4 * s, 2.4 * s, stone(), rnd() * 6, 0, 0, 'shiny');
      flowers(x - 1.4 * s, z + 0.8 * s, 4, 0.9);
    };
    const pool = (x, z, r) => { pools.push({ x, z, r: r * 0.9 }); put(P.poolRim((rnd() * 3) | 0), x, 0, z, r, r * 1.1, r, stone(), rnd() * TAU, 0, 0, 'shinyNS'); api.glow(x, z, r * 2.6, 0xbcd8ff, 0.14); if (rnd() < 0.7) flowers(x + r * 1.1, z + 0.3, 4, 0.9); };
    const cypress = (x, z, h) => {
      const t = P.tree('pine', (rnd() * 3) | 0, h > 6 ? 0 : 1), w = h * 0.2;
      put(t.wood, x, 0, z, w, h, w, 0x8a7a68, rnd() * TAU, 0, 0, 'shinyNS'); if (t.leaf) put(t.leaf, x, 0, z, w, h, w, pick([0x3f6a5a, 0x4a7a64, 0x35604f]), rnd() * TAU, 0, 0, 'shinyNS');
    };
    const rubble = (x, z, s) => { put(P.fallenBlock((rnd() * 3) | 0), x, 0, z, s, s, s, stone(), rnd() * TAU, 0, 0, 'shinyNS'); if (rnd() < 0.6) put(P.column(2, (rnd() * 4) | 0), x + 0.9 * s, 0, z + 0.4 * s, 1.2 * s, 1.2 * s, 1.2 * s, stone(), rnd() * 6, 0, 0, 'shinyNS'); D.tuftAt(x + 0.5, z - 0.4, 1.2); };

    // ── sütun sıraları: her odanın kenarında dairesel revak (kuzey yarı yüksek, güney alçak/kırık) ──
    ids.forEach((ri, k) => {
      const rm = L.rooms[ri], spots = K.rimSpots(L, rm, 1.0, rm.kind === 'boss' ? 22 : 16);
      spots.forEach((p, j) => {
        if (k % 2 === 1 && j % 3 === 0) return;   // aralık: bazı odalarda sıra kopuk
        const x = p.x + Math.sin(p.a) * 0.9, z = p.z + Math.cos(p.a) * 0.9; if (isF(x, z)) return;
        const mh = coneH(x, z); if (!spaced(x, z, 1.1)) return;
        const north = z < rm.z - rm.r * 0.15, r = rnd();
        if (north && mh >= 3.4 && r < 0.78) column(x, z, Math.min(mh * 0.95, 3.5 + rnd() * 0.9), 0);
        else if (mh >= 2.2 && r < 0.6) column(x, z, Math.min(mh * 0.9, 2.6), 1);
        else if (r < 0.8) rubble(x, z, 0.5 + rnd() * 0.4);
        else flowers(x, z, 5, 1);
      });
    });

    // ── yakın kuşak (yürünür alanın dışı) ──
    K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const mh = Math.min(maxH0, coneH(x, z)), r = rnd();
      if (mh >= 6.5 && fd > 2.6 && r < 0.12 && spaced(x, z, 1.4)) obelisk(x, z, Math.min(mh / 1.15, 4 + rnd() * 2));
      else if (mh >= 7 && fd > 3 && r < 0.2 && spaced(x, z, 3)) archS(x, z, Math.min(mh / 1.2, 4.2 + rnd() * 1.6), pick([0, 0.4, -0.4]), rnd() < 0.35 ? 1 : 0);
      else if (mh >= 2.8 && fd > 2 && r < 0.3 && spaced(x, z, 2.4)) frieze(x, z, 3 + ((rnd() * 3) | 0), 0.8 + rnd() * 0.3);
      else if (mh >= 4.2 && fd > 2.2 && r < 0.38 && spaced(x, z, 1.4)) cypress(x, z, Math.min(mh, 4.6 + rnd() * 3));
      else if (fd > 1.8 && fd < 6 && r < 0.46 && pools.length < 16 && spaced(x, z, 2)) pool(x, z, 0.9 + rnd() * 0.9);
      else if (r < 0.62) flowers(x, z, 6 + ((rnd() * 5) | 0), 1.0 + rnd() * 0.5);
      else if (r < 0.72) rubble(x, z, 0.5 + rnd() * 0.5);
      else if (r < 0.82) D.rockGroup(x, z, 0.4 + rnd() * 0.5);
      else if (r < 0.92) { D.bush(x, z, 0.7 + rnd() * 0.5); D.patch2(x + 0.5, z + 0.4, 0.9); }
      else D.fern(x, z, 0.7 + rnd() * 0.5);
    }, { step: 2.2, d0: 0.9, d1: 8, margin: 10 });

    // ── uzak kuşak: büyük kalıntılar, dağ zirveleri, bulut denizi ──
    K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const mh = Math.min(maxH0, coneH(x, z)), r = rnd();
      if (mh >= 10 && r < 0.18 && spaced(x, z, 3.5)) archS(x, z, 6 + rnd() * 3, rnd() * 0.6 - 0.3, rnd() < 0.5 ? 1 : 0);
      else if (mh >= 9 && r < 0.34 && spaced(x, z, 3)) stairsRuin(x, z, 1.8 + rnd() * 0.9);
      else if (mh >= 8 && r < 0.48 && spaced(x, z, 2)) obelisk(x, z, 4.5 + rnd() * 2.5);
      else if (mh >= 8 && r < 0.62 && spaced(x, z, 1.6)) cypress(x, z, 6 + rnd() * 4);
      else if (mh >= 12 && r < 0.78) { const h = 9 + rnd() * 9; put(P.rock((rnd() * 5) | 0, 'mabet', 1), x, 0, z, h * 0.55, h, h * 0.5, pick([0xb4bed4, 0xa6b2cc, 0xc2c8da]), rnd() * TAU, 0, 0, 'shinyNS'); }
      else { const s = 3 + rnd() * 4; put(P.puff(), x, -0.1, z, s * 1.3, s * 0.42, s, pick([0xd4def0, 0xc8d4ec, 0xe2e8f6]), rnd() * TAU, 0, 0, 'shinyNS'); }
    }, { step: 6.0, d0: 8, d1: 26, margin: 26 });

    // ── yürünür alanın içi: yoldan ve oyun nesnelerinden uzak ALÇAK süs ──
    const pts = [];
    const grab = (o, d) => { if (!o || d > 3) return; if (Array.isArray(o)) { for (const q of o) grab(q, d + 1); return; } if (typeof o !== 'object') return; if (typeof o.x === 'number' && typeof o.z === 'number') pts.push(o); else for (const k in o) if (k !== 'L' && k !== 'api') grab(o[k], d + 1); };
    for (const k of ['chests', 'checkpoints', 'spawns', 'stations', 'nesneler', 'mb', 'hedefler', 'yuzeyler', 'npcs', 'minis']) grab(L[k], 0);
    pts.push(L.start, L.exit, L.boss);
    const Pth = L.path || [];
    const nearPath = (x, z) => { let b = 1e9; for (let i = 0; i < Pth.length; i++) { const d = Math.abs(Pth[i].x - x) + Math.abs(Pth[i].z - z); if (d < b) b = d; } return b; };
    const busy = (x, z) => { for (const q of pts) if (q && hyp(q.x - x, q.z - z) < 2.6) return true; return false; };
    for (const rm of L.rooms) {
      const R0 = rm.r || 7, n = Math.round(R0 * 2.2);
      for (let t = 0; t < n; t++) {
        const a = rnd() * TAU, d = Math.sqrt(rnd()) * R0 * 1.05, x = rm.x + Math.sin(a) * d, z = rm.z + Math.cos(a) * d;
        if (!isF(x, z) || nearPath(x, z) < 3.0 || busy(x, z)) continue;
        const r = rnd();
        if (r < 0.4) flowers(x, z, 4 + ((rnd() * 4) | 0), 0.9);
        else if (r < 0.58) rubble(x, z, 0.35 + rnd() * 0.25);
        else if (r < 0.72) D.stone(x, z, 0.25 + rnd() * 0.2);
        else if (r < 0.88) D.tuftAt(x, z, 1.3);
        else D.fern(x, z, 0.45 + rnd() * 0.3);
      }
    }
    // gümüş-mavi havuz suyu (tek çizim) ve parıltı
    P.water(api, pools, { c1: 0x4a78b8, c2: 0xf0f8ff, a: 0.9, spark: 0.9 });
    return true;
  }
  return { olustur };
})();

/* ── SUS610: bölüm 6–10 ortak ek (dev dekor + yüzen ışık topları). 06z_*.js kur() başında: SUS610.ekle(L, api, 'bolumId') ── */
const SUS610 = (() => {
  'use strict';
  const PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  const PAL = {   // taş / ışık / vurgu renkleri (mor YOK)
    mabet: { st: 0xf3ead6, st2: 0xdfe6f2, gl: 0xbfe0ff, gl2: 0xfff2c8, orb: 0xcfe6ff },
    yanardag: { st: 0x9a5a3c, st2: 0x6e3a28, gl: 0xff9a3a, gl2: 0xffd27a, orb: 0xffb060 },
    sehir: { st: 0xf0dcc0, st2: 0xd7a878, gl: 0xffc870, gl2: 0xfff0c0, orb: 0xffd890 },
    kale: { st: 0xe8e2d4, st2: 0xc9c2b2, gl: 0xfff0b8, gl2: 0xffffff, orb: 0xfff4d0 },
    fener: { st: 0xe9edf2, st2: 0xc86a4a, gl: 0xffe9a0, gl2: 0xffffff, orb: 0xffeeb0 },
  };
  function spots(L, api, n) {
    const W = L.W || 160, H = L.H || 160, fl = [];
    for (let z = 0; z < H; z += 2) for (let x = 0; x < W; x += 2) if (api.isFloor(x + 0.5, z + 0.5)) fl.push([x + 0.5, z + 0.5]);
    if (!fl.length) return [];
    const c = [];
    for (let z = 3; z < H - 3; z += 3) for (let x = 3; x < W - 3; x += 3) {
      if (api.isFloor(x, z)) continue;
      let b = 1e9, bz = 0, bx = 0; for (const f of fl) { const d = hyp(f[0] - x, f[1] - z); if (d < b) { b = d; bz = f[1]; bx = f[0]; } }
      if (b >= 9 && b <= 13 && z < bz) c.push({ x, z, d: b, fx: bx, fz: bz });
    }
    const refs = [L.start, L.boss, L.exit].filter(Boolean), out = [];
    const take = (ref) => {
      let best = null, bs = 1e9;
      for (const q of c) { if (out.some(o => hyp(o.x - q.x, o.z - q.z) < 28)) continue; const s = ref ? Math.abs(hyp(q.x - ref.x, q.z - ref.z) - 16) : Math.random() * 50; if (s < bs) { bs = s; best = q; } }
      if (best) out.push(best);
    };
    for (let i = 0; i < n; i++) take(refs[i] || null);
    return out;
  }
  function orbs(L, api, id, col) {
    const T = THREE, N = 16, fl = [];
    for (let k = 0; k < 400 && fl.length < N; k++) { const x = api.rnd() * (L.W || 160), z = api.rnd() * (L.H || 160); if (api.isFloor(x, z)) fl.push([x, z]); }
    const g = new T.SphereGeometry(0.16, 8, 6), m = new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false, fog: false });
    const im = new T.InstancedMesh(g, m, fl.length); im.frustumCulled = false; im.renderOrder = 8; im.name = 'sus610-toplar';
    api.add(im); api.dispose(g); api.dispose(m);
    const o = new T.Object3D(), ph = fl.map(() => api.rnd() * TAU); let t = 0;
    api.anim(dt => { t += Math.min(dt, 0.05); fl.forEach((f, i) => { const a = t * 0.3 + ph[i]; o.position.set(f[0] + Math.sin(a) * 1.4, 2.2 + Math.sin(t * 0.8 + ph[i] * 3) * 0.5 + (i % 3) * 0.5, f[1] + Math.cos(a * 0.9) * 1.4); const s = 0.8 + 0.4 * Math.sin(t * 2 + ph[i]); o.scale.setScalar(s); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.instanceMatrix.needsUpdate = true; });
  }
  const tg = (api, g) => api.tmp(g);
  const LM = {
    mabet(api, x, z, s, p, yaw) {   // dev ay kapısı: iki taş sütun + taş halka + parlak ay
      const put = api.put, c = Math.cos(yaw), si = Math.sin(yaw);
      for (const sd of [-1, 1]) { const px = x + c * sd * 4.2 * s, pz = z - si * sd * 4.2 * s; put(tg(api, new THREE.CylinderGeometry(0.9, 1.1, 9, 14)), px, 4.5 * s, pz, s, s, s, p.st, 0, 0, 0, 'shinyNS'); api.box(px, 0.5 * s, pz, 3 * s, 1 * s, 3 * s, p.st2, yaw, 'shinyNS'); api.ball(px, 9.3 * s, pz, 1.1 * s, 1.1 * s, 1.1 * s, p.gl, 'glow'); }
      put(tg(api, new THREE.TorusGeometry(4.6, 0.55, 6, 20)), x, 8.6 * s, z, s, s, s, p.st, yaw, 0, 0, 'shinyNS');
      put(tg(api, new THREE.CircleGeometry(3.7, 20)), x, 8.6 * s, z, s, s, s, p.gl2, yaw, 0, 0, 'glow');
      for (let i = 0; i < 5; i++) api.box(x + c * (i - 2) * 1.1 * s, 0.15 * s, z - si * (i - 2) * 1.1 * s, 0.9 * s, 0.3 * s, 6 * s, p.st2, yaw, 'shinyNS');
      api.glow(x, z, 9 * s, p.gl, 0.2);
    },
    yanardag(api, x, z, s, p) {   // dev ateş kristalleri
      const put = api.put;
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, h = (6 + (i % 3) * 3.5) * s, r = (1.1 + (i % 2) * 0.5) * s; put(tg(api, new THREE.ConeGeometry(1, 1, 6)), x + Math.sin(a) * 2.2 * s, h / 2, z + Math.cos(a) * 2.2 * s, r, h, r, i % 2 ? p.gl : p.gl2, a, 0.0, Math.sin(a) * 0.15, 'glow'); }
      put(tg(api, new THREE.ConeGeometry(1, 1, 7)), x, 6 * s, z, 2.4 * s, 12 * s, 2.4 * s, p.gl2, 0, 0, 0, 'glow');
      put(tg(api, new THREE.ConeGeometry(1, 1, 8)), x, 1.6 * s, z, 5.5 * s, 3.2 * s, 5.5 * s, p.st2, 0, 0, 0, 'shinyNS');
      api.glow(x, z, 12 * s, p.gl, 0.28);
    },
    sehir(api, x, z, s, p) {   // dev fener ağacı
      const put = api.put;
      api.cyl(x, 0.6 * s, z, 2.2 * s, 1.2 * s, p.st2, 'shinyNS'); put(tg(api, new THREE.CylinderGeometry(0.28, 0.4, 1, 8)), x, 7 * s, z, s, 14 * s, s, p.st, 0, 0, 0, 'shinyNS');
      [[0, 12.5, 2.2, p.gl], [-2.6, 10, 1.6, p.gl2], [2.6, 9.4, 1.7, p.gl], [0, 7.2, 1.4, p.gl2]].forEach(q => { const dx = q[0] * s; if (dx) api.box(x + dx / 2, (q[1] + 1.5) * s, z, Math.abs(dx), 0.15 * s, 0.15 * s, p.st, 0, 'shinyNS'); api.ball(x + dx, q[1] * s, z, q[2] * s, q[2] * 1.2 * s, q[2] * s, q[3], 'glow'); });
      api.glow(x, z, 10 * s, p.gl, 0.24);
    },
    kale(api, x, z, s, p) {   // dev sancak kulesi
      const put = api.put;
      put(tg(api, new THREE.CylinderGeometry(2.4, 3, 1, 14)), x, 7 * s, z, s, 14 * s, s, p.st, 0, 0, 0, 'shinyNS');
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; api.box(x + Math.sin(a) * 2.5 * s, 14.4 * s, z + Math.cos(a) * 2.5 * s, 1 * s, 1.2 * s, 1 * s, p.st2, a, 'shinyNS'); }
      put(tg(api, new THREE.ConeGeometry(1, 1, 14)), x, 17.5 * s, z, 3.4 * s, 6 * s, 3.4 * s, 0xd0584a, 0, 0, 0, 'shinyNS');
      api.cyl(x, 23 * s, z, 0.12 * s, 6 * s, p.st2, 'shinyNS'); api.box(x + 1.7 * s, 23.2 * s, z, 3.4 * s, 1.8 * s, 0.1 * s, 0xffc94a, 0, 'decor');
      for (let i = 0; i < 3; i++) api.box(x, (5 + i * 3) * s, z + 2.6 * s, 0.5 * s, 1.1 * s, 0.2 * s, p.gl, 0, 'glow');
      api.glow(x, z, 9 * s, p.gl, 0.16);
    },
    fener(api, x, z, s, p) {   // dev yıldız kulesi + dönen ışık hüzmesi
      const put = api.put;
      put(tg(api, new THREE.CylinderGeometry(1.3, 2.4, 1, 14)), x, 5 * s, z, s, 10 * s, s, p.st, 0, 0, 0, 'shinyNS');
      for (let i = 0; i < 3; i++) put(tg(api, new THREE.CylinderGeometry(1.34, 1.34, 1, 14)), x, (2.5 + i * 3.2) * s, z, s, 1 * s, s, p.st2, 0, 0, 0, 'shinyNS');
      api.ball(x, 11.4 * s, z, 2.2 * s, 2.2 * s, 2.2 * s, p.gl, 'glow');
      const T = THREE, cg = new T.ConeGeometry(2.6, 14, 14, 1, true); cg.translate(0, -7, 0).rotateZ(PI / 2);
      const cm = new T.MeshBasicMaterial({ color: p.gl, transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false });
      const beam = new T.Mesh(cg, cm); beam.position.set(x, 11.4 * s, z); beam.scale.setScalar(s); beam.renderOrder = 4; beam.frustumCulled = false; api.add(beam); api.dispose(cg); api.dispose(cm);
      api.anim(dt => { beam.rotation.y += Math.min(dt, 0.05) * 0.5; });
      api.glow(x, z, 9 * s, p.gl, 0.2);
    },
  };
  function ekle(L, api, id) {
    const p = PAL[id], f = LM[id]; if (!p || !f) return;
    if (new URLSearchParams(location.search).has('susyok')) return;
    L._sus = window.__sus610 = []; for (const sp of spots(L, api, id === 'mabet' ? 2 : 3)) L._sus.push(sp), f(api, sp.x, sp.z, (id === 'mabet' ? 1.1 : 1) * (0.9 + api.rnd() * 0.3), p, api.rnd() * TAU);
    orbs(L, api, id, p.orb);
  }
  return { ekle };
})();
if (typeof window !== 'undefined') window.SUS610 = SUS610;
