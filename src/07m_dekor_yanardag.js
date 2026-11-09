/* ── YANARDAG_DEKOR: Bölüm 7 (Lav Yanardağı) çevre süsleri (E567) ──
   06z_yanardag.js kur() içinden:  const ok = YANARDAG_DEKOR.olustur(L, api, { K: ODAKIT });  → true ise eski basit süsler atlanır.
   Sıcak bazalt sütunları, soğumuş lav sırtları + sönük kor çatlakları, sert yapraklı eğreltiler, taş dişliler ve su çarkları (lav kıyısında,
   yavaşça dönen), buhar bacaları ve tek çizimlik yumuşak buhar, Ateş Dede'nin yuvası çevresi (saman halka, kabuk kırıkları), uzak yanardağ siluetleri.
   Yalnız süs: tehlikeli görünmez, oyun nesnelerini/yolu/düşmanı saklamaz. Mor yok. */
const YANARDAG_DEKOR = (() => {
  'use strict';
  const P = PROPKIT, PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  function olustur(L, api, ctx) {
    const K = ctx.K;
    if (!K || typeof MANTAR_DEKOR === 'undefined' || !P.basalt || !P.TEMA.yanardag) return false;
    if (K.lowShadow) K.lowShadow(api, 99);
    const THREE_ = api.THREE || THREE, rnd = api.rnd, put = api.put, T = P.TEMA.yanardag, isF = (x, z) => api.isFloor(x, z), M = L.yd || {};
    const pick = a => (Array.isArray(a) && a.length ? a[(rnd() * a.length) | 0] : (a != null ? a : 0xa88a74));   // (eksik palet → süs yarıda çökmesin; T.fern yoktu)
    if (!T.fern) T.fern = T.leaf || T.grass || [0x7a8a3a];
    if (!T.basalt) T.basalt = [0x9a7868, 0x8a6a5e];
    const coneH = (x, z) => { for (let d = 0.5; d <= 14; d += 0.75) { const w = d * 0.45 + 0.8; for (let dx = -w; dx <= w; dx += 0.9) if (isF(x + dx, z - d)) return 0.5 + d * 0.85; } return 99; };
    const fN = (x, z) => K.floorNorth(L, x, z, 9), fD = (x, z, m = 8) => K.floorDist(L, x, z, m);
    const D = MANTAR_DEKOR.olustur(L, api, { K, coneH, fN, fD, isF, tema: 'yanardag' });
    const ids = L.rooms.map((r, i) => i);
    const ROCKT = [0xd4b49a, 0xc4a28a, 0xdcbea2, 0xb4927a], rockT = () => pick(ROCKT);   // (QA: pembeye çalıyordu → sıcak kül-kahve)
    const placed = [], vents = [], spin = [];
    const spaced = (x, z, r) => { for (const q of placed) if (hyp(q.x - x, q.z - z) < r + q.r) return false; placed.push({ x, z, r }); return true; };
    const wheelMat = api.dispose(new THREE_.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 })), gearMat = api.dispose(new THREE_.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, color: 0xe8c8b0 }));

    // ── bileşenler ──
    const basalt = (x, z, s, n) => { put(P.basalt((rnd() * 5) | 0, n || 7), x, 0, z, s, s * (1.5 + rnd() * 1.3), s, pick(T.basalt), rnd() * TAU, 0, 0, s > 2 ? 'shiny' : 'shinyNS'); if (rnd() < 0.5) api.glow(x, z, s * 1.4 + 1, 0xff9a40, 0.07); };
    const ridge = (x, z, len, yaw, cracks) => {
      const k = (rnd() * 4) | 0;
      put(P.lavaRidge(k), x, 0, z, len, len * 1.4, len * 1.3, 0xd0ae94, yaw, 0, 0, 'shinyNS');
      if (cracks) { put(P.lavaRidgeCrack(k), x, 0, z, len, len * 1.4, len * 1.3, 0xff9040, yaw, 0, 0, 'glow'); api.glow(x, z, len * 0.9 + 0.6, 0xff8a30, 0.08); }
    };
    const fern = (x, z, s) => {
      const n = 5 + ((rnd() * 3) | 0), c = pick(T.fern), k0 = (rnd() * 3) | 0;
      for (let i = 0; i < n; i++) put(P.frond(k0 + (i % 2)), x, 0.02, z, s * 0.8, s * 0.75, s * 0.8, c, i / n * TAU + rnd() * 0.3, 0.1 * i % 0.3, 0, 'decor');
    };
    const mound = (x, z, s) => { put(P.stoneMound((rnd() * 3) | 0), x, 0, z, s, s * (0.8 + rnd() * 0.6), s * 0.9, rockT(), rnd() * TAU, 0, 0, s > 1.6 ? 'shiny' : 'shinyNS'); if (rnd() < 0.55) fern(x + s * 0.9, z + s * 0.3, 0.7 + rnd() * 0.4); };
    const bigRock = (x, z, s) => { put(P.rock((rnd() * 5) | 0, 'yanardag'), x, 0, z, s * 1.2, s * (0.9 + rnd() * 0.5), s * 1.1, rockT(), rnd() * TAU, 0, 0, s > 1.2 ? 'shiny' : 'shinyNS'); if (rnd() < 0.5) D.tuftAt(x + s, z, 1.2); };
    const vent = (x, z, s) => {   // buhar bacası: bazalt halka + sıcak ağız
      put(P.basalt((rnd() * 5) | 0, 5), x, 0, z, s * 0.9, s * 0.9, s * 0.9, pick(T.basalt), rnd() * TAU, 0, 0, 'shinyNS');
      put(P.crackPatch((rnd() * 4) | 0), x, 0.0, z, s * 1.3, 1, s * 1.3, 0xff9040, rnd() * TAU, 0, 0, 'glow'); api.glow(x, z, s * 2 + 0.6, 0xff9a50, 0.1);
      vents.push({ x, y: s * 0.6, z });
    };
    const addWheel = (x, z, s, yaw) => {   // çerçeve + yavaş dönen çark; lav kıyısında
      put(P.wheelFrame((rnd() * 3) | 0), x, 0, z, s, s, s, 0xe8c8b0, yaw, 0, 0, 'shiny');
      const g = new THREE_.Mesh(P.waterwheel(10, (rnd() * 3) | 0), wheelMat); g.position.set(x, 1.3 * s, z); g.rotation.y = yaw; g.scale.setScalar(s * 0.95); api.add(g); spin.push({ m: g, v: 0.22 * (rnd() < 0.5 ? 1 : -1) / Math.max(0.8, s) });
      api.glow(x, z, s * 2.5, 0xff9a40, 0.1);
      if (rnd() < 0.7) { const gx = Math.cos(yaw) * s * 1.9, gz = -Math.sin(yaw) * s * 1.9, gs = s * 0.7;   // yanında küçük dişli
        const q = new THREE_.Mesh(P.gear(10, (rnd() * 3) | 0), gearMat); q.position.set(x + gx, gs * 1.1, z + gz); q.rotation.y = yaw; q.scale.setScalar(gs); api.add(q); spin.push({ m: q, v: -0.4 / gs, a: 'z' });
        put(P.stoneMound(1), x + gx, 0, z + gz, gs * 0.7, gs * 0.5, gs * 0.7, rockT(), 0, 0, 0, 'shinyNS'); }
    };
    const gearDeco = (x, z, s) => {   // yarı gömülü taş dişli (yatık/dik, dönmez)
      put(P.gear(8 + ((rnd() * 4) | 0), (rnd() * 3) | 0), x, s * 0.7, z, s, s, s, 0xe0c0a8, rnd() * TAU, 0, 0, 'shinyNS');
      put(P.stoneMound(0), x, 0, z, s * 0.8, s * 0.55, s * 0.8, rockT(), 0, 0, 0, 'shinyNS');
    };

    // ── Ateş Dede'nin yuvası: saman halka, taş yığınları, kabuk kırıkları (ejderhanın çevresi; ejderha yarıçapının dışında, alçak) ──
    if (M.dragon) {
      const dx = M.dragon.x, dz = M.dragon.z, R = M.dragon.r;
      // QA: 78 uzun saman tutamı ejderhanın gövdesine giriyor, önünü kapatıp karışık görünüyordu → arkada ve yanlarda 14 alçak tutam (kameraya bakan güney yayı boş)
      for (let i = 0; i < 14; i++) { const a = PI * 0.62 + i / 13 * PI * 0.76 * 2 - PI * 0.76 + rnd() * 0.1, d = R * (1.45 + rnd() * 0.25), x = dx + Math.sin(a) * d, z = dz + Math.cos(a) * d; if (!isF(x, z) || z > dz + R * 0.6) continue; D.tuftAt(x, z, 1.0); }
      // (Cila 8 Kas: yuva taşları iri yassı "basamak taşı" gibi duruyordu → daha küçük, tombul, yuvarlak taşlar)
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + 0.3, d = R * 1.55, x = dx + Math.sin(a) * d, z = dz + Math.cos(a) * d; if (isF(x, z)) put(P.stoneMound((rnd() * 3) | 0), x, 0, z, 0.36 + rnd() * 0.18, 0.5 + rnd() * 0.25, 0.36 + rnd() * 0.18, rockT(), rnd() * TAU, 0, 0, 'shinyNS'); }
      for (let i = 0; i < 6; i++) { const a = rnd() * TAU, d = R * (1.3 + rnd() * 0.6), x = dx + Math.sin(a) * d, z = dz + Math.cos(a) * d; if (isF(x, z)) put(P.cap('dome', 2), x, 0.04, z, 0.16, 0.12, 0.16, 0xfff4dc, rnd() * TAU, (rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.6, 'shinyNS'); }
      api.glow(dx, dz, R * 2.8, 0xffa860, 0.1);
    }

    // ── yakın kuşak ──
    K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const mh = Math.min(maxH0, coneH(x, z)), r = rnd();
      if (mh >= 5 && fd > 2.2 && r < 0.2 && spaced(x, z, 1.4)) basalt(x, z, Math.min(mh / 3.2, 1.0 + rnd() * 1.0), 7);
      else if (mh >= 3.5 && fd > 2 && r < 0.3 && spaced(x, z, 2.2)) { bigRock(x, z, Math.min(1.1 + rnd() * 1.1, fd * 0.6)); }
      else if (fd > 1.6 && fd < 5.5 && mh >= 2.2 && r < 0.38 && spaced(x, z, 3)) addWheel(x, z, 0.9 + rnd() * 0.5, (rnd() - 0.5) * 1.1);   // (Cila 8 Kas: çark yüzü kameraya dönük; yandan bakınca merdiven gibi görünüyordu)
      else if (fd > 1.4 && r < 0.46 && vents.length < 22 && spaced(x, z, 1.4)) vent(x, z, 0.7 + rnd() * 0.5);
      else if (r < 0.58) ridge(x, z, 2.2 + rnd() * 2.2, rnd() * PI, rnd() < 0.18);   // (QA: her sırtta parlak çatlak çizgisi karışık görünüyordu; ön plan kayaları hâlâ zikzak çizgiliydi → seyrek)
      else if (r < 0.68) mound(x, z, 0.8 + rnd() * 0.8);
      else if (r < 0.74 && mh >= 1 && spaced(x, z, 1.2)) gearDeco(x, z, 0.7 + rnd() * 0.5);
      else if (r < 0.86) { fern(x, z, 0.8 + rnd() * 0.5); D.tuftAt(x + 0.6, z, 1.4); }
      else { D.rockGroup(x, z, 0.45 + rnd() * 0.5); }
      if (rnd() < 0.08) put(P.crackPatch((rnd() * 4) | 0), x + (rnd() - 0.5) * 2, 0, z + (rnd() - 0.5) * 2, 1.4, 1, 1.4, 0xff9040, rnd() * TAU, 0, 0, 'glow');
    }, { step: 2.1, d0: 0.9, d1: 8, margin: 10 });

    // ── lav göllerinin kıyısı: ek küçük süs (kor çatlağı, sırt, bazalt, eğrelti) ──
    K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const r = rnd(); if (r < 0.34) ridge(x, z, 1.6 + rnd() * 1.8, rnd() * PI, rnd() < 0.15);
      else if (r < 0.52) put(P.crackPatch((rnd() * 4) | 0), x, 0, z, 1.8, 1, 1.8, 0xff9040, rnd() * TAU, 0, 0, 'glow');
      else if (r < 0.7 && Math.min(maxH0, coneH(x, z)) > 1.2) basalt(x, z, 0.4 + rnd() * 0.5, 5);
      else if (r < 0.86) { fern(x, z, 0.7 + rnd() * 0.4); D.tuftAt(x + 0.5, z, 1.4); }
      else mound(x, z, 0.6 + rnd() * 0.5);
    }, { step: 1.9, d0: 0.7, d1: 6, margin: 8 });

    // ── uzak kuşak: yanardağ siluetleri, büyük bazalt ve sırtlar ──
    K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const mh = Math.min(maxH0, coneH(x, z)), r = rnd();
      if (mh >= 12 && r < 0.2 && spaced(x, z, 5)) { const h = 10 + rnd() * 9; put(P.spire((rnd() * 5) | 0, false, 0), x, 0, z, h * 1.1, h, h * 1.1, pick([0x8a6a5e, 0x7a5a52, 0x946e60]), rnd() * TAU, 0, 0, 'shinyNS'); put(P.pod(1), x, h - 0.4, z, h * 0.35, h * 0.12, h * 0.35, 0xff9a40, 0, 0, 0, 'glow'); api.glow(x, z, h * 0.6, 0xff8a30, 0.06); }
      else if (mh >= 7 && r < 0.42 && spaced(x, z, 2.4)) basalt(x, z, 1.8 + rnd() * 1.6, 9);
      else if (mh >= 4 && r < 0.6) bigRock(x, z, 1.8 + rnd() * 1.6);
      else ridge(x, z, 4 + rnd() * 3, rnd() * PI, rnd() < 0.2);   // (Cila 8 Kas: uzaktaki her iki sırttan birinde parlak zikzak çizgi vardı → seyrek, lav ışıltısı sade)
    }, { step: 6.0, d0: 8, d1: 26, margin: 26 });

    // ── oda kenarları: sık kuşak ──
    ids.forEach(ri => {
      const rm = L.rooms[ri], spots = K.rimSpots(L, rm, 0.8, rm.kind === 'boss' ? 22 : 16);
      spots.forEach(p => {
        const hmax = coneH(p.x, p.z), r = rnd(), x = p.x, z = p.z;
        if (r < 0.26) fern(x, z, 0.7 + rnd() * 0.5);
        else if (r < 0.46) D.rockGroup(x, z, 0.4 + rnd() * 0.4);
        else if (r < 0.6 && hmax > 1.5) basalt(x, z, 0.45 + rnd() * 0.35, 5);
        else if (r < 0.74) mound(x, z, 0.5 + rnd() * 0.4);
        else D.tuftAt(x, z, 1.5);
        if (rnd() < 0.4) D.tuftAt(x - Math.sin(p.a) * 0.6, z - Math.cos(p.a) * 0.6, 1.3);
      });
    });

    // ── yürünür alanın içi: yoldan ve oyun nesnelerinden uzak ALÇAK süs ──
    const pts = [];
    const grab = (o, d) => { if (!o || d > 3) return; if (Array.isArray(o)) { for (const q of o) grab(q, d + 1); return; } if (typeof o !== 'object') return; if (typeof o.x === 'number' && typeof o.z === 'number') pts.push(o); else for (const k in o) if (k !== 'L' && k !== 'api' && k !== 'vents') grab(o[k], d + 1); };
    for (const k of ['chests', 'checkpoints', 'spawns', 'stations', 'nesneler', 'yd', 'hedefler', 'yuzeyler', 'npcs', 'minis']) grab(L[k], 0);
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
        if (r < 0.3) fern(x, z, 0.5 + rnd() * 0.4);
        else if (r < 0.52) D.stone(x, z, 0.28 + rnd() * 0.3);
        else if (r < 0.68) { put(P.lavaRidge((rnd() * 4) | 0), x, 0, z, 1.6 + rnd() * 1.2, 1.2, 1.2, 0xd0ae94, rnd() * PI, 0, 0, 'shinyNS'); }
        else if (r < 0.8) put(P.basalt((rnd() * 5) | 0, 4), x, 0, z, 0.38, 0.45, 0.38, pick(T.basalt), rnd() * TAU, 0, 0, 'shinyNS');
        else D.tuftAt(x, z, 1.5);
      }
    }

    // ── buhar: tek çizim, yumuşak, alçak (bacalardan yükselir) ──
    if (vents.length) {
      const N = vents.length * 5, pos = new Float32Array(N * 3), ph = new Float32Array(N), sz = new Float32Array(N);
      let o = 0; for (const v of vents) for (let j = 0; j < 5; j++, o++) { pos[o * 3] = v.x + (rnd() - 0.5) * 0.4; pos[o * 3 + 1] = v.y; pos[o * 3 + 2] = v.z + (rnd() - 0.5) * 0.4; ph[o] = j / 5 + rnd() * 0.15; sz[o] = 0.8 + rnd() * 0.7; }
      const g = new THREE_.BufferGeometry(); g.setAttribute('position', new THREE_.BufferAttribute(pos, 3)); g.setAttribute('aPh', new THREE_.BufferAttribute(ph, 1)); g.setAttribute('aSz', new THREE_.BufferAttribute(sz, 1));
      const u = { uTime: { value: 0 }, uScale: { value: 900 } };
      const m = new THREE_.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false,
        vertexShader: 'attribute float aPh; attribute float aSz; uniform float uTime; uniform float uScale; varying float vA; void main(){ float t = fract(uTime*0.16 + aPh); vec3 p = position; p.y += t*2.8; p.x += sin(t*6.0 + aPh*30.0)*0.3; vA = sin(t*3.14159)*0.55; vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = aSz*(0.6+t*1.9)*uScale/max(0.1,-mv.z); }',
        fragmentShader: 'varying float vA; void main(){ vec2 c = gl_PointCoord-0.5; float d = length(c); float a = smoothstep(0.5,0.05,d)*vA; gl_FragColor = vec4(vec3(1.0,0.94,0.88), a*0.5); }' });
      const pts2 = new THREE_.Points(g, m); pts2.frustumCulled = false; pts2.renderOrder = 6; pts2.name = 'e567-buhar'; api.add(pts2); api.dispose(g); api.dispose(m);
      let t = 0;
      api.anim(dt => { t += Math.min(dt, 0.05); u.uTime.value = t; try { u.uScale.value = innerHeight / (2 * Math.tan(camera.fov * PI / 360)); } catch (e) { /* yok */ } });
    }
    api.anim(dt => { dt = Math.min(dt, 0.05); for (const s of spin) { if (s.a === 'z') s.m.rotation.z += s.v * dt; else s.m.rotation.z += s.v * dt; } });
    return true;
  }
  return { olustur };
})();
