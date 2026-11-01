/* ── Bölüm 7: Lav Yanardağı (Feza ile Pırıl: Büyük Fener) ──
   Sahibi: B78. Lav sıcak bir dekordur (yakmaz, zemin kısmı motorun volcano tabanı). Ana mekanik: Nehir Çarkları (büyük turuncu taş düğme;
   basınca ışık nehri yan akar, taş basamaklar yükselir, kapı açılır). Sonra uyuyan Ateş Dede'nin yuvası, kabuk parçası ("tın"),
   Pırıl'ı kucakta taşıma (sessiz yamaç, düşman yok), arena: Koca Lav Kaplumbağası (src/05z_yanardag.js).
     1. Işık Nehirleri Kıyısı   2. Kıvılcım Gölleri   3. Kaplumbağa Yamacı   4. Ejderha Yuvası   5. Sessiz Yamaç   Arena: Kaplumbağa Krateri
   Kural: "anne/ejderha ailem" yok; yalnız "tanıdık, sıcak". Mor yok. Genel ad: YANARDAG. Cümleler: src/02l_yanardag.js (b07_...). */
const YANARDAG = (() => {
  'use strict';
  const PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  const G_ = () => (typeof GAME !== 'undefined' ? GAME : null);
  const live = () => { const g = G_(); return !!(g && g.state === 'play' && !g.paused && g.P && !g.P.dead); };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const said = new Set();
  let sayAt = -99;
  function say(key, o = {}) {
    const g = G_();
    if (!g || !g.halaApi || !(typeof AUD !== 'undefined' && AUD.LINES && AUD.LINES[key])) return false;
    if (o.once !== false && said.has(key)) return false;
    const now = g.time || 0;
    if (!o.force && now - sayAt < (o.gap ?? 4.5)) return false;
    sayAt = now; said.add(key);
    try { g.halaApi.say(key, o.prio || 2); } catch (e) { return false; }
    return true;
  }
  const sfx = (n, o) => { try { if (typeof AUD !== 'undefined' && AUD.sfx) AUD.sfx(n, o); } catch (e) { /* yok */ } };
  const burst = (k, x, y, z, o) => { try { if (typeof FX !== 'undefined' && FX.burst) FX.burst(k, x, y, z, o); } catch (e) { /* yok */ } };
  const pirilGit = (x, z) => { try { if (typeof PIRIL_GUC !== 'undefined' && PIRIL_GUC && PIRIL_GUC.pointTo) PIRIL_GUC.pointTo(x, z); } catch (e) { /* yok */ } };
  const pirilDurum = d => { try { PIRIL_GUC.takip().durum(d); } catch (e) { /* yok */ } };
  const GM = {};
  const geo = (k, f) => GM[k] || (GM[k] = f());
  const kp = o => { if (o) o.userData.keep = true; return o; };

  // ════════════════ Yerleşim (saf veri) ════════════════
  function yerlesim(L, api) {
    const A = L.areas || [];
    const mainRooms = a => (A[a] ? A[a].rooms.filter(ri => L.rooms[ri] && L.rooms[ri].kind !== 'side') : []);
    const areaOf = {}; A.forEach((a, k) => { if (!a.boss) a.rooms.forEach(ri => { areaOf[ri] = k; }); });
    // düşmanlar: alan 1,2,3'te; yuva (4) ve sessiz yamaç (5) düşmansız
    const LIST = [['minikLavKaplumbaga', 'lavJolesi', 'minikLavKaplumbaga'], ['atesKusu', 'lavJolesi', 'atesKusu', 'minikLavKaplumbaga'], ['minikLavKaplumbaga', 'sicakTasYavrusu', 'atesKusu', 'sicakTasYavrusu'], null, null];
    const CAP = [2, 3, 3, 0, 0], packN = {}, keep = [];
    for (const sp of L.spawns || []) {
      const ai = areaOf[sp.room];
      if (sp.room === 0) continue;
      if (ai === undefined) { keep.push(sp); continue; }
      const list = LIST[Math.min(ai, LIST.length - 1)];
      if (!list) continue;
      const n = packN[sp.pack] = (packN[sp.pack] || 0) + 1;
      if (n > CAP[Math.min(ai, CAP.length - 1)]) continue;
      sp.type = list[(n - 1 + sp.pack) % list.length];
      if (sp.elite) sp.type = 'magmaDevi';
      delete sp.variant;
      keep.push(sp);
    }
    L.spawns.length = 0; L.spawns.push(...keep);
    const spot = (cx, cz, rmin, rmax, r = 1.2, tries = 80) => {
      for (let t = 0; t < tries; t++) {
        const a = api.rnd() * TAU, d = rmin + api.rnd() * (rmax - rmin), x = cx + Math.sin(a) * d, z = cz + Math.cos(a) * d;
        if (api.isFloor(x, z) && api.circleFree(x, z, r)) return { x, z };
      }
      return null;
    };
    const dirTo = (ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, l = hyp(dx, dz) || 1; return [dx / l, dz / l]; };
    const M = L.yd = { btn: [], dragon: null, shell: null, prints: [], hug: null, arena: null, vents: [] };
    // Nehir Çarkı düğmeleri: kapıya (alan k) 5–6 m kala, önceki alanın yolunda
    for (const k of [1, 2, 3]) {
      const g = A[k] && A[k].gate, mr = mainRooms(k - 1), rm = L.rooms[mr[mr.length - 1]];
      if (!g || !rm) { M.btn[k] = null; continue; }
      const d = dirTo(rm.x, rm.z, g.x, g.z); let p = null;
      for (const dd of [6.5, 5.5, 7.5, 4.5, 8.5]) for (const s of [0, 1, -1]) { const x = g.x - d[0] * dd + -d[1] * s * 1.4, z = g.z - d[1] * dd + d[0] * s * 1.4; if (!p && api.isFloor(x, z) && api.circleFree(x, z, 1.1)) p = { x, z }; }
      M.btn[k] = p || spot(rm.x, rm.z, 2, Math.max(3, rm.r * 0.6), 1.2) || { x: rm.x, z: rm.z };
    }
    // yuva: 4. alanın ana odası. Ejderha kuzeyde, kabuk parçası doğuda, ayak izleri kapıdan ejderhaya
    { const mr = mainRooms(3), rm = L.rooms[mr[0]], g = A[3] && A[3].gate;
      if (rm) {
        const R = rm.r || 8;
        M.dragon = { x: rm.x, z: rm.z - R * 0.28, r: Math.min(3.4, R * 0.42) };
        const sp = spot(rm.x + R * 0.30, rm.z + R * 0.1, 0, R * 0.2, 1.0) || { x: rm.x + R * 0.3, z: rm.z + R * 0.1 };
        M.shell = sp; M.room = { x: rm.x, z: rm.z, r: R };
        if (g) { const d = dirTo(g.x, g.z, rm.x, rm.z); for (let i = 0; i < 6; i++) { const t = 3 + i * 1.6; M.prints.push({ x: g.x + d[0] * t + (i % 2 ? 0.35 : -0.35) * -d[1], z: g.z + d[1] * t + (i % 2 ? 0.35 : -0.35) * d[0], yaw: Math.atan2(d[0], d[1]) }); } }
      } }
    { const mr = mainRooms(4), rm = L.rooms[mr[0]]; if (rm) M.hug = { x: rm.x, z: rm.z, r: rm.r || 8 }; }
    { const ar = L.rooms.filter(r => r.kind !== 'side').pop(); if (ar) M.arena = { x: ar.x, z: ar.z, r: ar.r || 11 }; }
  }

  // ════════════════ Görsel parçalar ════════════════
  const stoneMat = () => GM.stoneM || (GM.stoneM = kp(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })));
  function haloTex() {
    if (GM.haloT) return GM.haloT;
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.userData = { keep: true }; return (GM.haloT = t);
  }
  // Nehir Çarkı: büyük turuncu taş düğme (kenarlıklı, üstünde çark oyması)
  function carkMesh(api, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const base = new THREE.Mesh(geo('cBase', () => kp(new THREE.CylinderGeometry(1.15, 1.3, 0.22, 20))), kp(new THREE.MeshStandardMaterial({ color: 0x6a4a3c, roughness: 0.9 })));
    base.position.y = 0.11; base.receiveShadow = true; g.add(base);
    const topM = new THREE.MeshStandardMaterial({ color: 0xffa24a, roughness: 0.5, emissive: 0xff7a20, emissiveIntensity: 0.55 });
    const top = new THREE.Mesh(geo('cTop', () => kp(new THREE.CylinderGeometry(0.9, 0.95, 0.18, 20))), topM);
    top.position.y = 0.3; g.add(top);
    const spokes = new THREE.Group(); spokes.position.y = 0.42;
    const sm = new THREE.MeshBasicMaterial({ color: 0xfff0c0 });
    for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(geo('cSp', () => kp(new THREE.BoxGeometry(0.12, 0.04, 0.8))), sm); s.rotation.y = i * PI / 3; spokes.add(s); }
    const hub = new THREE.Mesh(geo('cHub', () => kp(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 12))), sm); spokes.add(hub);
    g.add(spokes);
    const rm = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.7, depthWrite: false });
    const ring = new THREE.Mesh(geo('cRing', () => kp(new THREE.RingGeometry(1.2, 1.4, 40).rotateX(-PI / 2))), rm);
    ring.position.y = 0.04; ring.renderOrder = 3; g.add(ring);
    api.add(g); api.dispose(sm); api.dispose(rm); api.dispose(topM);
    return { g, spokes, ring, top };
  }
  // Bazalt kapı: iki taş sütun + lento + ışık nehri perdesi (açılınca perde alçalır, 3 basamak yükselir)
  function kapi(api, L, gate, id) {
    let dx = 0, dz = -1;
    if (typeof ODAKIT !== 'undefined' && ODAKIT && ODAKIT.gateDir) { try { [dx, dz] = ODAKIT.gateDir(L, gate); } catch (e) { /* yok */ } }
    const nx = -dz, nz = dx;
    let lo = 0, hi = 0;
    for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(gate.x + nx * o, gate.z + nz * o)) hi = o; else break; }
    for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(gate.x - nx * o, gate.z - nz * o)) lo = o; else break; }
    const w0 = -lo - 0.6, w1 = hi + 0.6, wd = w1 - w0, cx = (w0 + w1) / 2;
    const grp = new THREE.Group(); grp.position.set(gate.x, 0, gate.z); grp.rotation.y = Math.atan2(nx, nz) - PI / 2; api.add(grp);
    const k = new Kit(), cyl = geo('kCyl', () => kp(new THREE.CylinderGeometry(1, 1, 1, 7))), box = geo('kBox', () => kp(new THREE.BoxGeometry(1, 1, 1))), ball = geo('kBall', () => kp(new THREE.SphereGeometry(1, 8, 6)));
    for (const sx of [w0 - 0.2, w1 + 0.2]) {
      k.add(box, 0x5a4540, [sx, 0.3, 0], null, [1.1, 0.6, 1.1]); k.add(cyl, 0x6e5650, [sx, 2.3, 0], null, [0.5, 3.6, 0.5]); k.add(cyl, 0x7d635a, [sx, 4.15, 0], null, [0.62, 0.3, 0.62]);
      k.add(ball, 0xffa040, [sx, 4.55, 0], null, [0.2, 0.2, 0.2]);
    }
    k.add(box, 0x5a4540, [cx, 4.0, 0], null, [wd + 2.2, 0.45, 0.9]);
    const frame = new THREE.Mesh(k.build(), stoneMat()); frame.castShadow = true; grp.add(frame); api.dispose(frame.geometry);
    const pm = new THREE.MeshBasicMaterial({ color: 0xff9440, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const panel = new THREE.Mesh(geo('kPlane', () => kp(new THREE.PlaneGeometry(1, 1))), pm); panel.scale.set(wd + 0.4, 3.4, 1); panel.position.set(cx, 1.8, 0); panel.renderOrder = 4; grp.add(panel); api.dispose(pm);
    const steps = [], stepM = new THREE.MeshStandardMaterial({ color: 0xd8a070, roughness: 0.8, emissive: 0x803010, emissiveIntensity: 0.25 }); api.dispose(stepM);
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(geo('kStep', () => kp(new THREE.CylinderGeometry(1, 1.05, 0.3, 12))), stepM); s.visible = false; s.scale.set(0.9, 1, 0.9);
      s.position.set(cx + (i - 1) * (wd / 3.4), -0.4, 1.6 + (i % 2) * 0.4); grp.add(s); steps.push(s);
    }
    const solids = [];
    for (let o = w0 + 0.2; o <= w1 - 0.2 + 0.01; o += 0.8) { const so = { x: gate.x + nx * o, z: gate.z + nz * o, r: 0.7, alive: true, tag: 'yanKapi' }; L.solids.push(so); solids.push(so); }
    L._sh = null;
    return { id, x: gate.x, z: gate.z, dx, dz, grp, panel, pm, solids, steps, open: false, anim: 0, near: 0, w: wd };
  }
  // gün batımı gökyüzü şeridi (kamerayla sabit, şeftali → kızıl pembe)
  function gokyuzu(api) {
    const skyGeo = new THREE.PlaneGeometry(1, 1);
    const skyMat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec2 vUv; void main(){float edge=smoothstep(0.0,.7,vUv.y); vec3 c=mix(vec3(1.0,.62,.42),vec3(.98,.46,.46),vUv.y); gl_FragColor=vec4(c,edge*.55);}' });
    const sky = new THREE.Mesh(skyGeo, skyMat); sky.renderOrder = 28; sky.frustumCulled = false; api.add(sky); api.dispose(skyGeo); api.dispose(skyMat);
    const up = new THREE.Vector3(), fwd = new THREE.Vector3();
    api.anim(() => {
      up.setFromMatrixColumn(camera.matrixWorld, 1); fwd.setFromMatrixColumn(camera.matrixWorld, 2).negate();
      const depth = 30, hh = Math.tan(camera.fov * PI / 360) * depth;
      sky.position.copy(camera.position).addScaledVector(fwd, depth).addScaledVector(up, (1 - 0.06 * 2) * hh);
      sky.quaternion.copy(camera.quaternion); sky.scale.set(hh * 2 * camera.aspect, hh * 2 * 0.23, 1);
    });
  }

  // ════════════════ Dekor (kur) ════════════════
  function kur(L, api) {
    const rnd = api.rnd, M = L.yd || {};
    const cyl = api.tmp(new THREE.CylinderGeometry(1, 1, 1, 7)), cone = api.tmp(new THREE.ConeGeometry(1, 1, 7)),
      ico = api.tmp(new THREE.IcosahedronGeometry(1, 0)), hemi = api.tmp(new THREE.SphereGeometry(1, 12, 6, 0, TAU, 0, PI / 2));
    const P = (g, x, y, z, sx, sy, sz, c, yaw, rx, rz) => api.put(g, x, y, z, sx, sy, sz, c, yaw || 0, rx || 0, rz || 0);
    const basalt = (x, z, s) => {
      for (let j = 0; j < 4; j++) { const a = j * 1.7 + rnd(), h = (1.2 + rnd() * 2.2) * s, ox = Math.sin(a) * 0.55 * s, oz = Math.cos(a) * 0.5 * s; P(cyl, x + ox, h / 2, z + oz, 0.38 * s, h, 0.38 * s, j & 1 ? 0x6a5650 : 0x5a4743, rnd() * PI); P(cyl, x + ox, h + 0.02, z + oz, 0.34 * s, 0.05, 0.34 * s, 0xb8a090); }
    };
    const rock = (x, z, s) => { P(ico, x, 0.35 * s, z, 0.9 * s, 0.6 * s, 0.8 * s, 0x7a625a, rnd() * PI); P(ico, x + 0.9 * s, 0.2 * s, z + 0.3 * s, 0.5 * s, 0.35 * s, 0.45 * s, 0x6a544d, rnd() * PI); };
    const ember = (x, z, s) => { P(ico, x, 0.3 * s, z, 0.55 * s, 0.4 * s, 0.5 * s, 0xffa040, rnd() * PI); api.glow(x, z, 2.0 * s, 0xff9a40, 0.12); };
    const obsid = (x, z, s) => { for (let j = 0; j < 3; j++) { const a = j * 2.1; P(cone, x + Math.sin(a) * 0.3 * s, 0.6 * s, z + Math.cos(a) * 0.3 * s, 0.2 * s, (1.0 + j * 0.3) * s, 0.2 * s, j & 1 ? 0x2c2430 : 0x3a2f3a, 0, 0, Math.sin(a) * 0.18); } };
    const vent = (x, z, s) => { P(cyl, x, 0.4 * s, z, 0.7 * s, 0.8 * s, 0.7 * s, 0x6a5650); P(cyl, x, 0.85 * s, z, 0.5 * s, 0.1 * s, 0.5 * s, 0xffa040); api.glow(x, z, 2.0 * s, 0xff9a50, 0.1); (M.vents = M.vents || []).push({ x, z, y: 0.9 * s }); };
    const mush = (x, z, s) => { P(cyl, x, 0.25 * s, z, 0.07 * s, 0.5 * s, 0.07 * s, 0xf4e8d2); P(hemi, x, 0.46 * s, z, 0.32 * s, 0.22 * s, 0.32 * s, 0xf2a45c); };
    const kinds = [basalt, rock, ember, obsid, vent, basalt, rock, ember, mush];
    // E567: yeni çevre kiti (07m_kit_e567.js + 07m_dekor_yanardag.js); yüklenemezse eski basit süsler çalışır
    const HASD = typeof YANARDAG_DEKOR !== 'undefined' && (() => { try { return YANARDAG_DEKOR.olustur(L, api, { K: typeof ODAKIT !== 'undefined' ? ODAKIT : null }); } catch (e) { console.warn('YANARDAG_DEKOR', e); return false; } })();
    const free = (x, z, r) => { for (let a = 0; a < 8; a++) if (api.isFloor(x + Math.cos(a * PI / 4) * r, z + Math.sin(a * PI / 4) * r)) return false; return !api.isFloor(x, z); };
    const places = [];
    (HASD ? [] : L.rooms).forEach((rm, ri) => {
      const n = 12 + ((rm.r || 8) > 9 ? 4 : 0);
      for (let k = 0; k < n; k++) {
        const a = k * TAU / n + rnd() * 0.2, rad = (rm.r || 8) + 3.2 + rnd() * 1.6, x = rm.x + Math.sin(a) * rad, z = rm.z + Math.cos(a) * rad;
        if (api.isFloor(x, z) || api.linkDist(x, z) < 3.4) continue;
        const south = z > rm.z + 1.0;
        let f = kinds[(k + ri) % kinds.length], s = 0.8 + rnd() * 0.4;
        if (south && (f === basalt || f === obsid)) f = (k & 1) ? ember : rock;
        if (!free(x, z, 1.3 * s)) continue;
        if (places.some(q => hyp(q.x - x, q.z - z) < 2.8)) continue;
        places.push({ x, z }); f(x, z, s);
      }
    });
    if (M.room && !HASD) { const R = M.room.r;
      for (let q = 0; q < 14; q++) { const a = PI + (q / 13 - 0.5) * PI * 1.1, x = M.room.x + Math.sin(a) * (R + 2.4), z = M.room.z + Math.cos(a) * (R + 2.4); if (!api.isFloor(x, z) && z < M.room.z + 0.5) basalt(x, z, 1.5 + (q % 3) * 0.15); }
      api.glow(M.room.x, M.room.z, R * 0.9, 0xffb060, 0.14); }
    const ar = M.arena;
    if (ar) {
      api.glow(ar.x, ar.z, ar.r * 0.85, 0xffa860, 0.08);
      for (let q = 0; q < (HASD ? 0 : 9); q++) { const a = q * TAU / 9 + 0.2, x = ar.x + Math.sin(a) * (ar.r + 2.3), z = ar.z + Math.cos(a) * (ar.r + 2.3); if (!api.isFloor(x, z) && !(z > ar.z + 1)) basalt(x, z, 1.3); }
    }
    gokyuzu(api);
    // buhar bacaları: alçak, saydam
    const puffs = [];
    const vs = (M.vents || []).slice(0, 10);
    vs.forEach((v, i) => { for (let j = 0; j < 3; j++) { const mt = new THREE.SpriteMaterial({ map: haloTex(), color: 0xfff0e6, transparent: true, opacity: 0, depthWrite: false }); const sp = new THREE.Sprite(mt); api.dispose(mt); api.add(sp); puffs.push({ sp, v, ph: j / 3 + i * 0.13 }); } });
    // kıvılcım zerreleri
    const NE = 50, ep = new Float32Array(NE * 3), eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(ep, 3));
    const em = new THREE.PointsMaterial({ size: 0.16, color: 0xffa850, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false });
    const ems = new THREE.Points(eg, em); ems.frustumCulled = false; api.add(ems); api.dispose(eg); api.dispose(em);
    const ev = []; for (let i = 0; i < NE; i++) ev.push({ x: (rnd() - 0.5) * 24, y: rnd() * 4, z: (rnd() - 0.5) * 24, s: 0.3 + rnd() * 0.5 });
    let T = 0;
    api.anim((dt, hx, hz) => {
      dt = Math.min(dt, 0.05); T += dt;
      for (const p of puffs) {
        const u = (T * 0.22 + p.ph) % 1;
        p.sp.position.set(p.v.x + Math.sin(u * 5 + p.ph * 9) * 0.25, p.v.y + u * 2.4, p.v.z); const sc = 0.8 + u * 1.9; p.sp.scale.set(sc, sc, 1);
        p.sp.material.opacity = Math.sin(u * PI) * 0.34;
      }
      for (let i = 0; i < NE; i++) {
        const e = ev[i]; e.y += e.s * dt; e.x += Math.sin(T * 0.6 + i) * 0.1 * dt; if (e.y > 4.5) { e.y = 0; e.x = (rnd() - 0.5) * 24; e.z = (rnd() - 0.5) * 24; }
        ep[i * 3] = hx + e.x; ep[i * 3 + 1] = e.y; ep[i * 3 + 2] = hz + e.z;
      }
      eg.attributes.position.needsUpdate = true;
    });
  }

  // ════════════════ kurSon: kapılar, çarklar, ejderha, kabuk, taşıma, konuşmalar ════════════════
  function kurSon(L, api) {
    const g0 = G_(), A = L.areas || [], M = L.yd || {};
    const gates = [];
    const gatePts = A.map(a => a.gate); for (let k = 1; k < A.length; k++) A[k].gate = null;
    for (const k of [1, 2, 3]) { const gp = gatePts[k]; if (gp) gates.push(Object.assign(kapi(api, L, gp, 'g' + k), { k })); }
    const S = { t: 0, started: 0, area: -1, btn: {}, shell: 0, carry: false, hug: 0, still: 0, stuck: {}, orb: null, saved: null, bossOn: false, happy: false, prints: 0 };
    L.nesneler = L.nesneler || [];
    for (const k of [1, 2, 3]) {
      const q = M.btn && M.btn[k]; if (!q) continue;
      const C = carkMesh(api, q.x, q.z);
      const o = { id: 'cark' + k, tur: 'dugme', x: q.x, z: q.z, r: 1.15, ac: [], renk: '#ffb040', mesh: C.g };
      L.nesneler.push(o); S.btn[k] = { o, C };
      api.glow(q.x, q.z, 2.6, 0xff9a40, 0.16);
    }
    let dragon = null;
    if (M.dragon && typeof EJDERHA !== 'undefined' && EJDERHA.uykulu) {
      try {
        dragon = EJDERHA.uykulu('ates'); const sc = clamp(M.dragon.r / 2.2, 1.0, 1.6); dragon.root.scale.setScalar(sc);
        dragon.root.position.set(M.dragon.x, 0, M.dragon.z); dragon.root.rotation.y = 0.35; api.add(dragon.root);
        if (api.solid) api.solid(M.dragon.x, M.dragon.z, M.dragon.r * 0.8, 'ejderha');
        api.glow(M.dragon.x, M.dragon.z, M.dragon.r * 2.2, 0xffa860, 0.16);
      } catch (e) { dragon = null; }
    }
    if ((M.prints || []).length) {
      const pm = kp(new THREE.MeshBasicMaterial({ color: 0xd9a070, transparent: true, opacity: 0.7, depthWrite: false }));
      const toe = geo('toe', () => kp(new THREE.CircleGeometry(1, 12).rotateX(-PI / 2)));
      for (const p of M.prints) {
        const gp = new THREE.Group(); gp.position.set(p.x, 0.07, p.z); gp.rotation.y = p.yaw; api.add(gp);
        const pad = new THREE.Mesh(toe, pm); pad.scale.set(0.2, 1, 0.24); pad.renderOrder = 2; gp.add(pad);
        for (let j = -1; j <= 1; j++) { const t = new THREE.Mesh(toe, pm); t.scale.set(0.08, 1, 0.09); t.position.set(j * 0.17, 0, 0.3 - Math.abs(j) * 0.05); t.renderOrder = 2; gp.add(t); }
      }
    }
    let shell = null, dot = null;
    if (M.shell) {
      shell = new THREE.Group(); shell.position.set(M.shell.x, 0, M.shell.z); api.add(shell);
      const sm = kp(new THREE.MeshStandardMaterial({ color: 0xf7ecd2, roughness: 0.7, side: THREE.DoubleSide }));
      const half = new THREE.Mesh(geo('shellH', () => kp(new THREE.SphereGeometry(1, 16, 8, 0, TAU, 0, PI * 0.46))), sm); half.scale.set(0.62, 0.62, 0.55); half.position.y = 0.05; half.rotation.z = 0.25; shell.add(half);
      const sp = kp(new THREE.MeshBasicMaterial({ color: 0xf2b86a }));
      for (let i = 0; i < 7; i++) { const a = i * 2.4, r = 0.2 + (i % 3) * 0.1, d = new THREE.Mesh(geo('spot', () => kp(new THREE.SphereGeometry(1, 6, 5))), sp); d.scale.set(0.055, 0.035, 0.055); d.position.set(Math.sin(a) * r * 0.9, 0.3 + Math.cos(a * 1.3) * 0.12, Math.cos(a) * r * 0.8); shell.add(d); }
      const dm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd45a).multiplyScalar(1.4), transparent: true, opacity: 0 });
      dot = new THREE.Mesh(geo('dot', () => kp(new THREE.SphereGeometry(1, 10, 8))), dm);
      dot.scale.setScalar(0.09); dot.position.set(0, 0.52, 0.05); shell.add(dot); api.dispose(dm);
      api.glow(M.shell.x, M.shell.z, 1.4, 0xffd890, 0.14);
    }
    const offs = [];
    const on = (n, fn) => { if (g0 && g0.on) { try { const r = g0.on(n, e => { if (g0.L === L || n === 'zone') fn(e); }); if (typeof r === 'function') offs.push(r); } catch (e) { /* yok */ } } };
    const unlock = (id, why) => { const gt = gates.find(q => q.id === id); if (gt && !gt.open) { gt.open = true; for (const s of gt.steps) s.visible = true; sfx('unlock', { x: gt.x, z: gt.z }); burst('sparkle', gt.x, 1.4, gt.z, { color: '#ffc080', count: 10 }); if (why) say(why, { force: true, once: false }); } };
    on('nesne', e => {
      if (!e || !/^cark\d$/.test(e.id)) return; const k = +e.id.slice(4);
      if (S.btn[k]) S.btn[k].done = true;
      unlock('g' + k, k === 1 ? 'b07_nehir2' : k === 2 ? 'b07_kopru' : 'b07_kapi_acildi');
    });
    on('happy', e => {
      if (!e || !e.boss || e.type !== 'kocaLavKaplumbagasi') return;
      S.happy = true; S.orb = { t: 0, x: e.x != null ? e.x : 0, z: e.z != null ? e.z : 0 };
      const b = g0.boss || {}; if (b.x != null) { S.orb.x = b.x; S.orb.z = b.z; }
    });
    on('boss', e => {
      if (!e) return;
      if (e.on && !S.bossOn) {
        S.bossOn = true; try { if (typeof PIRIL_GUC !== 'undefined' && PIRIL_GUC.gucler) { S.saved = PIRIL_GUC.gucler(); PIRIL_GUC.kapat(); } } catch (er) { /* yok */ }
      }
    });
    on('zone', () => { pirilDurum('takip'); for (const f of offs) { try { f(); } catch (e) { /* yok */ } } });
    function pirilUyan() {
      pirilDurum('takip'); S.carry = false;
      try { if (S.saved && PIRIL_GUC.ac) for (const n of (Array.isArray(S.saved) ? S.saved : Object.keys(S.saved))) PIRIL_GUC.ac(typeof n === 'string' ? n : n.id || n.ad); } catch (e) { /* yok */ }
      say('b07_isik', { force: true, once: false });
      setTimeout(() => say('b07_pirilacildi', { force: true, once: false }), 4800);
    }
    const orbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe08a).multiplyScalar(1.4), transparent: true, opacity: 0.95, fog: false });
    const orbM = new THREE.Mesh(geo('orb', () => kp(new THREE.SphereGeometry(1, 12, 10))), orbMat);
    orbM.visible = false; orbM.scale.setScalar(0.3); api.add(orbM); api.dispose(orbMat);

    const hero = () => g0 && g0.P;
    let T = 0;
    api.anim((dt, hx, hz) => {
      dt = Math.min(dt, 0.05); T += dt; S.t = T;
      const P = hero(); if (!P) return;
      const playing = live();
      if (dragon) dragon.update(dt);
      for (const k of [1, 2, 3]) { const b = S.btn[k]; if (!b) continue; b.C.spokes.rotation.y += dt * (b.o.done ? 0.4 : 1.4); b.C.ring.material.opacity = b.o.done ? 0.25 : 0.55 + 0.25 * Math.sin(T * 3); b.C.top.material.emissiveIntensity = b.o.done ? 0.2 : 0.55 + 0.25 * Math.sin(T * 3 + k); }
      for (const gt of gates) {
        if (gt.open) {
          if (gt.anim < 1) {
            gt.anim = Math.min(1, gt.anim + dt / 1.4); gt.pm.opacity = 0.55 * (1 - gt.anim); gt.panel.position.y = 1.8 - gt.anim * 1.8;
            gt.steps.forEach((s, i) => { s.position.y = -0.4 + 0.55 * clamp(gt.anim * 1.6 - i * 0.2, 0, 1); });
            if (gt.anim >= 1) { gt.panel.visible = false; for (const so of gt.solids) so.alive = false; L._sh = null; }
          }
        } else {
          gt.pm.opacity = 0.5 + 0.1 * Math.sin(T * 2.2);
          const d = hyp(P.pos.x - gt.x, P.pos.z - gt.z);
          if (playing && d < 5.5) { S.stuck[gt.id] = (S.stuck[gt.id] || 0) + dt; gt.near += dt; } else gt.near = Math.max(0, gt.near - dt * 0.5);
          if (playing && d < 4.5 && gt.near > 2.2) { gt.near = 0; const bk = S.btn[gt.k]; if (bk) { say('b07_nehir1', { force: true, once: false, gap: 12 }); pirilGit(bk.o.x, bk.o.z); } }
          if ((S.stuck[gt.id] || 0) > 70) unlock(gt.id);
        }
      }
      if (playing) {
        const ar = P.area;
        if (T > 1 && !S.started) { S.started = 1; say('b07_giris', { force: true }); }
        if (T > 8 && S.started === 1) { S.started = 2; say('b07_pirilgiris'); }
        if (T > 16 && S.started === 2 && S.btn[1] && !S.btn[1].done) { S.started = 3; say('b07_nehir1'); pirilGit(S.btn[1].o.x, S.btn[1].o.z); }
        if (ar !== S.area) {
          S.area = ar;
          if (ar === 1) { say('b07_pirilsicak', { force: true }); setTimeout(() => say('b07_goller'), 7000); }
          if (ar === 2) say('b07_yamac', { force: true });
          if (ar === 3) { say('b07_yuva_giris', { force: true }); setTimeout(() => say('b07_ejderha', { force: true }), 4500); setTimeout(() => say('b07_dede_p', { force: true }), 10000); }
          if (ar === 4) { say('b07_yamac_sessiz', { force: true }); setTimeout(() => say('b07_kaplumbagayolgoster'), 6000); }
          if (ar === A.length - 1) say('b07_arena', { force: true, once: false });
        }
        if (ar === 3 && M.prints && M.prints.length > 2 && !S.prints && hyp(P.pos.x - M.prints[2].x, P.pos.z - M.prints[2].z) < 3.5) { S.prints = 1; say('b07_pirilizler', { force: true }); }
        if (ar === 3 && shell && !S.shell && hyp(P.pos.x - M.shell.x, P.pos.z - M.shell.z) < 1.8) {
          S.shell = 1; S.shellT = T; say('b07_kabuk', { force: true }); sfx('unlock', { x: M.shell.x, z: M.shell.z, pitch: 1.6 }); dot.material.opacity = 1;
        }
        if (S.shell === 1 && T - S.shellT > 3.5) { S.shell = 2; say('b07_pirildogdum', { force: true }); }
        if (S.shell === 2 && T - S.shellT > 8) { S.shell = 3; say('b07_kabukyari', { force: true }); }
        if (S.shell === 3 && T - S.shellT > 12.5) { S.shell = 4; say('b07_pirilyorgun', { force: true }); }
        if (S.shell === 4 && T - S.shellT > 17) { S.shell = 5; say('b07_pirilsoz', { force: true }); pirilDurum('kucak'); S.carry = true; }
        if (S.shell === 5 && T - S.shellT > 22) { S.shell = 6; say('b07_pirilulus', { force: true }); }
        if (S.orb) {
          const o = S.orb; o.t += dt; orbM.visible = true;
          const k = clamp(o.t / 2.2, 0, 1), tx = P.pos.x, tz = P.pos.z, y0 = 2.6, y1 = 1.1;
          orbM.position.set(o.x + (tx - o.x) * k, y0 + (y1 - y0) * k + Math.sin(k * PI) * 1.0, o.z + (tz - o.z) * k);
          if (k >= 1) { orbM.visible = false; S.orb = null; burst('sparkle', tx, 1.2, tz, { color: '#ffe08a', count: 8 }); pirilUyan(); }
        }
      }
      if (S.carry && !S.happy) {
        P.slowT = Math.max(P.slowT || 0, 0.2); P.slowK = 0.82;
        const mov = hyp(hx - (S._hx ?? hx), hz - (S._hz ?? hz)); S._hx = hx; S._hz = hz;
        if (mov < 0.002 && playing) S.still += dt; else S.still = 0;
        if (S.still > 1.4 && !S.hug) { S.hug = 1; burst('heart', hx, 1.5, hz, { count: 3 }); say('b07_fezasarilma', { force: true }); setTimeout(() => say('b07_pirilsarilma', { force: true }), 4500); }
      }
      if (S.carry && P.area === 4 && !S.kiv && T - (S.shellT || 0) > 40) { S.kiv = 1; say('b07_kivilcim'); }
    });
  }

  BOLUM.define('yanardag', {
    ad: 'Lav Yanardağı',
    taban: 'volcano', size: 105, side: 2,
    areas: [{ id: 'a1', ad: 'Işık Nehirleri Kıyısı', rooms: 2 }, { id: 'a2', ad: 'Kıvılcım Gölleri', rooms: 2 }, { id: 'a3', ad: 'Kaplumbağa Yamacı', rooms: 2 },
      { id: 'a4', ad: 'Ejderha Yuvası', rooms: 1 }, { id: 'a5', ad: 'Sessiz Yamaç', rooms: 1 }],
    muzik: 'yanardag', malzeme: 'isik7', kayipEsya: null, final: false,
    zemin: { soluk: 0.8 },
    minimap: { zemin: '#8a6a5a' },
    harita: { ad: 'Lav Yanardağı', detay: 'Işık nehirleri, uyuyan Ateş Dede ve Koca Lav Kaplumbağası', renk: '#ff7a4d', simge: '🌋' },
    yolculuk: { arac: 'yaprak', cumle: 'Burası bana çok tanıdık geliyor...' },
    huysuzlar: { minikLavKaplumbaga: 3 }, elitler: ['magmaDevi'], boss: 'kocaLavKaplumbagasi',
    yerlesim, kur, kurSon,
  });
  return { say };
})();
