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
        // QA: ejderha odanın ortasındaydı, ana yol tam içinden geçiyordu → Feza ejderhaya takılıyordu. Artık yoldan en uzak boş köşeye yatar.
        const Pth = (L.path || []).filter(q => hyp(q.x - rm.x, q.z - rm.z) < R + 4);
        const pd = (x, z) => { let b = 1e9; for (const q of Pth) { const d = hyp(q.x - x, q.z - z); if (d < b) b = d; } return b; };
        let dr = Math.min(3.0, R * 0.38), best = null;
        for (let t = 0; t < 2 && !best; t++, dr *= 0.8) {
          let bs = -1;
          for (let i = 0; i < 24; i++) for (const f of [0.62, 0.5, 0.38]) {
            const a = i * TAU / 24, x = rm.x + Math.sin(a) * R * f, z = rm.z + Math.cos(a) * R * f;
            if (!api.isFloor(x, z) || !api.circleFree(x, z, dr * 0.8 + 0.2)) continue;
            const s = pd(x, z) - dr * 0.8 + (z < rm.z ? 0.4 : 0);   // (eşitse kuzey: kamera arkadan görür)
            if (s > bs) { bs = s; best = { x, z }; }
          }
          if (best && bs < 1.8) best = null;
        }
        if (!best) { dr = Math.min(2.2, R * 0.3); best = { x: rm.x, z: rm.z - R * 0.45 }; }
        M.dragon = { x: best.x, z: best.z, r: dr };
        // kabuk parçası: ana yolun hemen yanında (Feza yürürken üstünden geçsin), ejderhadan uzak
        let sp = null, sb = 1e9;
        for (const q of Pth) {
          if (hyp(q.x - rm.x, q.z - rm.z) > R * 0.8) continue;
          for (const o of [[1.3, 0], [-1.3, 0], [0, 1.3], [0, -1.3]]) {
            const x = q.x + o[0], z = q.z + o[1];
            if (hyp(x - best.x, z - best.z) < dr + 1.6 || !api.isFloor(x, z) || !api.circleFree(x, z, 0.8)) continue;
            const s = Math.abs(hyp(x - rm.x, z - rm.z) - R * 0.25); if (s < sb) { sb = s; sp = { x, z }; }
          }
        }
        sp = sp || spot(rm.x, rm.z, 0, R * 0.4, 1.0) || { x: rm.x, z: rm.z };
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
  // ışık perdesi: yukarı akan yumuşak ışık çizgileri (map, kayar) + alttan üste sönen saydamlık (alphaMap, sabit). Bir kez çizilir.
  // (QA: eski perde 3,4 m boyunda düz turuncu yarı saydam bir levhaydı; yukarıdan bakınca kapının arkasını turuncu bir pus gibi örtüyordu)
  function perdeTex() {
    if (GM.perdeT) return GM.perdeT;
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.fillStyle = 'rgba(255,146,52,0.5)'; x.fillRect(0, 0, 64, 64);   // çizgi aralarında hafif tül: arkası net görünür
    let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 8; i++) {
      const px = 2 + i * 8 + r() * 3, w = 2.5 + r() * 2, y0 = r() * 64, len = 26 + r() * 26;
      const gr = x.createLinearGradient(0, y0, 0, y0 + len); gr.addColorStop(0, 'rgba(255,238,190,0)'); gr.addColorStop(0.5, 'rgba(255,238,190,0.95)'); gr.addColorStop(1, 'rgba(255,238,190,0)');
      x.fillStyle = gr; x.fillRect(px, y0, w, len);
      const g2 = x.createLinearGradient(0, y0 - 64, 0, y0 - 64 + len); g2.addColorStop(0, 'rgba(255,238,190,0)'); g2.addColorStop(0.5, 'rgba(255,238,190,0.95)'); g2.addColorStop(1, 'rgba(255,238,190,0)');
      x.fillStyle = g2; x.fillRect(px, y0 - 64, w, len);   // (dikişsiz tekrar)
    }
    const map = new THREE.CanvasTexture(c); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.colorSpace = THREE.SRGBColorSpace; map.userData = { keep: true };
    const c2 = document.createElement('canvas'); c2.width = 4; c2.height = 64; const y = c2.getContext('2d'), g3 = y.createLinearGradient(0, 64, 0, 0);
    g3.addColorStop(0, '#ffffff'); g3.addColorStop(0.1, '#f0f0f0'); g3.addColorStop(0.45, '#7a7a7a'); g3.addColorStop(1, '#000000');
    y.fillStyle = g3; y.fillRect(0, 0, 4, 64);
    const alpha = new THREE.CanvasTexture(c2); alpha.userData = { keep: true };
    return (GM.perdeT = { map, alpha });
  }
  // Nehir Çarkı tepesi: turuncu-altın kubbe üstünde krem çark (6 kol + göbek + ince halka) — tek doku, tek çizim
  function carkTex() {
    if (GM.carkT) return GM.carkT;
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const gr = x.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, '#ffd889'); gr.addColorStop(0.7, '#ffa646'); gr.addColorStop(1, '#f2862e');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = '#fff3d8'; x.lineCap = 'round'; x.lineWidth = 9;
    for (let i = 0; i < 6; i++) { const a = i * PI / 3; x.beginPath(); x.moveTo(64 + Math.sin(a) * 14, 64 + Math.cos(a) * 14); x.lineTo(64 + Math.sin(a) * 44, 64 + Math.cos(a) * 44); x.stroke(); }
    x.lineWidth = 5; x.beginPath(); x.arc(64, 64, 50, 0, TAU); x.stroke();
    x.fillStyle = '#fff6e2'; x.beginPath(); x.arc(64, 64, 15, 0, TAU); x.fill();
    x.fillStyle = '#ffb04e'; x.beginPath(); x.arc(64, 64, 7, 0, TAU); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { keep: true };
    return (GM.carkT = t);
  }
  // Nehir Çarkı: büyük turuncu taş düğme (kenarlıklı, üstünde çark oyması)
  // QA: düğme 0,42 m yüksekti, Feza üstüne basınca dizine kadar içine gömülüyordu ve parlak tepe ışıması Feza'yı soluk gösteriyordu.
  // Artık yere yatık alçak bir taş levha (basılınca 3 cm daha iner, üstü ~10 cm), kenarında kalın taş halka; ışıması yumuşak.
  // Cila (8 Kas): 11 parça → 3 çizim (taban+halka+kor taşları tek parça; kubbe+çark tek dokulu parça; yer halkası). Tepe hafif kubbeli, çark oyması dokuda (dönerken net).
  function carkMesh(api, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const fr = geo('cFrame3', () => {
      const k = new Kit(), cy = new THREE.CylinderGeometry(1, 1, 1, 28), tor = new THREE.TorusGeometry(1.06, 0.09, 8, 36).rotateX(PI / 2), nub = new THREE.SphereGeometry(1, 8, 6);
      k.add(cy, 0x6a4c42, [0, 0.04, 0], null, [1.3, 0.08, 1.3]);                  // geniş alçak taş taban
      k.add(tor, 0xb08262, [0, 0.08, 0]);                                        // kalın sıcak taş halka (üstü 17 cm: Feza'nın ayağı gömülmez)
      for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + PI / 8; k.add(nub, 0xffcf86, [Math.sin(a) * 1.06, 0.155, Math.cos(a) * 1.06], null, [0.07, 0.04, 0.07]); }   // halkada minik kor taşları
      const out = kp(k.build()); cy.dispose(); tor.dispose(); nub.dispose(); return out;
    });
    const frame = new THREE.Mesh(fr, stoneMat()); frame.receiveShadow = true; g.add(frame);
    const topM = new THREE.MeshStandardMaterial({ map: carkTex(), roughness: 0.45, emissive: 0xffffff, emissiveMap: carkTex(), emissiveIntensity: 0.35 });
    const top = new THREE.Mesh(geo('cDome3', () => {   // alçak kubbe (taban yarıçapı 1); düz (yukarıdan) doku koordinatı: çark oyması bozulmadan görünür
      const t = 0.55, d = new THREE.SphereGeometry(1, 32, 6, 0, TAU, 0, t), s = 1 / Math.sin(t);
      d.translate(0, -Math.cos(t), 0); d.scale(s, s, s);
      const p = d.attributes.position, uv = d.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * 0.5 + 0.5, 0.5 - p.getZ(i) * 0.5);
      return kp(d);
    }), topM);
    top.scale.set(0.9, 0.3, 0.9); top.position.y = 0.07; g.add(top);   // kubbe tepesi ~15 cm; basılınca 3,5 cm iner
    const rm = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.7, depthWrite: false });
    const ring = new THREE.Mesh(geo('cRing2', () => kp(new THREE.RingGeometry(1.36, 1.56, 40).rotateX(-PI / 2))), rm);
    ring.position.y = 0.04; ring.renderOrder = 3; g.add(ring);
    api.add(g); api.dispose(rm); api.dispose(topM);
    return { g, spokes: top, ring, top, press: 0 };
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
    // (Cila 8 Kas: sütunlar sıcak kül-kahve bazalt, kaide ve başlık açık taş; koyu kara sütunlar ürkütücü duruyordu)
    for (const sx of [w0 - 0.2, w1 + 0.2]) {
      k.add(box, 0x8a6656, [sx, 0.3, 0], null, [1.1, 0.6, 1.1]); k.add(cyl, 0x9a7262, [sx, 2.3, 0], null, [0.5, 3.6, 0.5]); k.add(cyl, 0xc49a7e, [sx, 4.15, 0], null, [0.62, 0.3, 0.62]);
      k.add(ball, 0xffb050, [sx, 4.55, 0], null, [0.2, 0.2, 0.2]);
    }
    k.add(box, 0x8a6656, [cx, 4.0, 0], null, [wd + 2.2, 0.45, 0.9]);
    const frame = new THREE.Mesh(k.build(), stoneMat()); frame.castShadow = true; grp.add(frame); api.dispose(frame.geometry);
    // ışık perdesi: alçak (2,2 m), altı parlak, üstü sönerek saydamlaşır; ışık çizgileri yavaşça yukarı akar, aralarından arkası görünür
    const PT = perdeTex(), PH = 2.2, map = PT.map.clone(); map.repeat.set(Math.max(1, Math.round(wd / 1.4)), 1); map.needsUpdate = true; api.dispose(map);
    const pm = new THREE.MeshBasicMaterial({ map, alphaMap: PT.alpha, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const panel = new THREE.Mesh(geo('kPlane', () => kp(new THREE.PlaneGeometry(1, 1))), pm); panel.scale.set(wd + 0.4, PH, 1); panel.position.set(cx, PH / 2, 0); panel.renderOrder = 4; grp.add(panel); api.dispose(pm);
    const steps = [], stepM = new THREE.MeshStandardMaterial({ color: 0x8c6a5a, roughness: 0.8, emissive: 0x7a2c08, emissiveIntensity: 0.16, flatShading: true });   // (Cila 8 Kas: somon yerine sıcak kül-kahve bazalt; açık yolda belirgin) api.dispose(stepM);   // (QA: somon renkli düz diskler gibiydi → altıgen bazalt taş)
    // QA: basamaklar kapı çizgisine paralel diziliyordu, yarısı kaya/lav kenarına taşıp havada turuncu diskler gibi duruyordu.
    // Artık kapıya giden yolda sırayla yassı taşlar (üstü zeminden 8 cm: Feza'nın ayağı içine girmez); zemin olmayan yere konmaz.
    for (let i = 0; i < 3; i++) {
      const lx = cx + (i % 2 ? 0.45 : -0.45), lz = 0.9 + i * 1.25;
      if (!api.isFloor(gate.x + nx * lx - dx * lz, gate.z + nz * lx - dz * lz)) continue;
      const s = new THREE.Mesh(geo('kStepH', () => kp(new THREE.CylinderGeometry(1, 1.08, 0.3, 6))), stepM); s.visible = false; s.scale.set(0.62, 1, 0.62); s.rotation.y = i * 0.7;
      s.position.set(lx, -0.4, lz); s.receiveShadow = true; grp.add(s); steps.push(s);
    }
    const solids = [];
    for (let o = w0 + 0.2; o <= w1 - 0.2 + 0.01; o += 0.8) { const so = { x: gate.x + nx * o, z: gate.z + nz * o, r: 0.7, alive: true, tag: 'yanKapi' }; L.solids.push(so); solids.push(so); }
    L._sh = null;
    return { id, x: gate.x, z: gate.z, dx, dz, grp, panel, pm, map, ph: PH, solids, steps, open: false, anim: 0, near: 0, w: wd };
  }
  // (Cila 8 Kas: ekranın üst dörtte birine çizilen pembe "gün batımı" şeridi kaldırıldı — kamera yukarıdan baktığı için gökyüzü hiç
  //  görünmüyor, şerit yalnız uzaktaki kayaları pembe bir pusla örtüyordu; ekran üstü artık net)

  // ════════════════ Dekor (kur) ════════════════
  function kur(L, api) {
    try { if (typeof SUS610 !== 'undefined') SUS610.ekle(L, api, 'yanardag'); } catch (e) { console.warn('SUS610', e); }
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
    // buhar bacaları: alçak, saydam
    const puffs = [];
    const vs = (M.vents || []).slice(0, 10);
    vs.forEach((v, i) => { for (let j = 0; j < 3; j++) { const mt = new THREE.SpriteMaterial({ map: haloTex(), color: 0xfff0e6, transparent: true, opacity: 0, depthWrite: false }); const sp = new THREE.Sprite(mt); api.dispose(mt); api.add(sp); puffs.push({ sp, v, ph: j / 3 + i * 0.13 }); } });
    // kıvılcım zerreleri
    const NE = 50, ep = new Float32Array(NE * 3), eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(ep, 3));
    // (Cila 8 Kas: dokusuz noktalar ekranda küçük turuncu KARELER gibi görünüyordu → yumuşak yuvarlak kıvılcım)
    const em = new THREE.PointsMaterial({ size: 0.24, map: haloTex(), color: 0xffa850, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false });
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
    said.clear();   // (bölüm ikinci kez oynanınca cümleler yine söylensin; yoksa kabuk hikâyesi "b07_kabuk" bekleyip takılıyordu)
    const gates = [];
    const gatePts = A.map(a => a.gate); for (let k = 1; k < A.length; k++) A[k].gate = null;
    for (const k of [1, 2, 3]) { const gp = gatePts[k]; if (gp) gates.push(Object.assign(kapi(api, L, gp, 'g' + k), { k })); }
    const S = { t: 0, started: 0, area: -1, btn: {}, shell: 0, carry: false, hug: 0, still: 0, stuck: {}, orb: null, saved: null, bossOn: false, happy: false, prints: 0 };
    M.S = S; M.gates = gates;   // (test için: L.yd.S / L.yd.gates)
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
    if ((M.prints || []).length) {   // minik ayak izleri: 24 ayrı parça yerine tek parça (tek çizim)
      const pm = kp(new THREE.MeshBasicMaterial({ color: 0xd9a070, transparent: true, opacity: 0.7, depthWrite: false }));
      const toe = geo('toe', () => kp(new THREE.CircleGeometry(1, 12).rotateX(-PI / 2))), k = new Kit();
      for (const p of M.prints) {
        k.push([p.x, 0.07, p.z], [0, p.yaw, 0]);
        k.add(toe, 0xffffff, [0, 0, 0], null, [0.2, 1, 0.24]);
        for (let j = -1; j <= 1; j++) k.add(toe, 0xffffff, [j * 0.17, 0, 0.3 - Math.abs(j) * 0.05], null, [0.08, 1, 0.09]);
        k.pop();
      }
      const pr = new THREE.Mesh(api.dispose(k.build()), pm); pr.renderOrder = 2; api.add(pr);
    }
    let shell = null, dot = null;
    if (M.shell) {
      shell = new THREE.Group(); shell.position.set(M.shell.x, 0, M.shell.z); api.add(shell);
      const sm = kp(new THREE.MeshStandardMaterial({ color: 0xfffaf2, roughness: 0.55, emissive: 0xffe6c0, emissiveIntensity: 0.12, side: THREE.DoubleSide }));   // (Cila 8 Kas: açık krem yolda kayboluyordu → inci beyazı, hafif ışıltılı)
      const half = new THREE.Mesh(geo('shellH2', () => {   // (Cila 8 Kas: kenarı zikzak kırık: "yarım yumurta kabuğu" olduğu bir bakışta anlaşılsın)
        const t0 = PI * 0.46, ws = 16, hs = 8, d = new THREE.SphereGeometry(1, ws, hs, 0, TAU, 0, t0), p = d.attributes.position;
        for (let i = 0; i <= ws; i++) {
          const vi = hs * (ws + 1) + i, k = i % ws; if (k % 2) continue;   // her ikinci kenar köşesi içeri (kutba doğru) çekilir → diş diş kırık kenar
          const t = t0 - (k % 4 ? 0.16 : 0.24), ph = i / ws * TAU;
          p.setXYZ(vi, -Math.cos(ph) * Math.sin(t), Math.cos(t), Math.sin(ph) * Math.sin(t));
        }
        d.computeVertexNormals(); return kp(d);
      }), sm); half.scale.set(0.62, 0.62, 0.55); half.position.y = 0.05; half.rotation.z = 0.25; shell.add(half);
      // (Cila 8 Kas: benekler ve "tın" anında yanan altın nokta kabuğun İÇİNDE kalıyordu, hiç görünmüyordu → kabuğun yüzeyine oturtuldu;
      //  kabuğun kendi çerçevesinde birim küre üstünde, ölçeği kabuğun basıklığına göre düzeltilmiş). 7 benek tek çizim.
      const sp = kp(new THREE.MeshBasicMaterial({ color: 0xf0a03c })), ks = new Kit(), spg = geo('spot', () => kp(new THREE.SphereGeometry(1, 6, 5)));
      const up = new THREE.Vector3(0, 1, 0), dv = new THREE.Vector3(), q = new THREE.Quaternion();
      for (let i = 0; i < 7; i++) {   // (açılar altın noktanın yanına düşmesin diye seçildi)
        const t = 0.42 + (i % 3) * 0.3, p = i * 2.4 + 3.74;
        dv.set(Math.sin(t) * Math.cos(p), Math.cos(t), Math.sin(t) * Math.sin(p)); q.setFromUnitVectors(up, dv); ks.add(spg, 0xffffff, [dv.x, dv.y, dv.z], q, [0.12, 0.06, 0.13]);
      }
      half.add(new THREE.Mesh(api.dispose(ks.build()), sp));
      const dm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd45a).multiplyScalar(1.4), transparent: true, opacity: 0 });
      dot = new THREE.Mesh(geo('dot', () => kp(new THREE.SphereGeometry(1, 10, 8))), dm);
      dot.scale.set(0.15, 0.15, 0.17); dot.position.set(0, Math.cos(0.3) * 1.03, Math.sin(0.3) * 1.03); half.add(dot); api.dispose(dm);   // tepede, kameraya bakan yüzde
      api.glow(M.shell.x, M.shell.z, 1.4, 0xffd890, 0.14);
    }
    const offs = [];
    const on = (n, fn) => { if (g0 && g0.on) { try { const r = g0.on(n, e => { if (g0.L === L || n === 'zone') fn(e); }); if (typeof r === 'function') offs.push(r); } catch (e) { /* yok */ } } };
    const unlock = (id, why) => { const gt = gates.find(q => q.id === id); if (gt && !gt.open) { gt.open = true; for (const s of gt.steps) s.visible = true; sfx('unlock', { x: gt.x, z: gt.z }); burst('sparkle', gt.x, 1.4, gt.z, { color: '#ffc080', count: 10 }); if (why) say(why, { force: true, once: false }); } };
    on('nesne', e => {
      if (!e || !/^cark\d$/.test(e.id)) return; const k = +e.id.slice(4);
      if (S.btn[k]) S.btn[k].done = true;
      unlock('g' + k, k === 1 ? 'b07_kopru' : k === 2 ? 'kapi_acildi' : 'b07_kapi_acildi');   // (b07_nehir2 "köprü yükseldi" kullanılmıyor: köprü yok, basamaklar çıkıyor)
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
      // (gucler() {nefes:true, ucus:false…} döner: yalnız açık olanlar geri açılsın; önceden Object.keys hepsini, kazanılmamış güçleri de açıyordu)
      try { if (S.saved && PIRIL_GUC.ac) for (const n of (Array.isArray(S.saved) ? S.saved : Object.keys(S.saved).filter(k => S.saved[k]))) PIRIL_GUC.ac(typeof n === 'string' ? n : n.id || n.ad); } catch (e) { /* yok */ }
      say('b07_isik', { force: true, once: false });
      later(() => say('b07_pirilacildi', { force: true, once: false }), 4.8);
    }
    const orbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe08a).multiplyScalar(1.4), transparent: true, opacity: 0.95, fog: false });
    const orbM = new THREE.Mesh(geo('orb', () => kp(new THREE.SphereGeometry(1, 12, 10))), orbMat);
    orbM.visible = false; orbM.scale.setScalar(0.3); api.add(orbM); api.dispose(orbMat);

    const hero = () => g0 && g0.P;
    const Q = [];   // oyun saatiyle gecikmeli cümleler (setTimeout yerine: duraklatınca beklesin, başka bölüme taşmasın)
    const later = (fn, s) => Q.push({ t: T + s, fn });
    let T = 0;
    // (her karede yeni fonksiyon yaratılmasın diye döngünün dışında)
    const sira = (n, key, dt0) => { if (S.shell === n - 1 && T - S.shellT > dt0 && (!AUD.LINES[key] || said.has(key) || say(key, { gap: 3.6 }))) { S.shell = n; S.shellT2 = T; return true; } return false; };
    api.anim((dt, hx, hz) => {
      dt = Math.min(dt, 0.05); T += dt; S.t = T;
      const P = hero(); if (!P) return;
      const playing = live();
      if (g0.L !== L) { Q.length = 0; return; }
      for (let i = Q.length - 1; i >= 0; i--) if (playing && T >= Q[i].t) { const f = Q[i].fn; Q.splice(i, 1); try { f(); } catch (e) { /* yok */ } }
      if (dragon) dragon.update(dt);
      for (let k = 1; k <= 3; k++) {   // (b.done: motor nesneyi kopyalar, b.o değişmez)
        const b = S.btn[k], C = b && b.C; if (!C) continue;
        if (!b.done) { C.top.rotation.y += dt * 0.9; C.ring.material.opacity = 0.55 + 0.25 * Math.sin(T * 3); C.top.material.emissiveIntensity = 0.35 + 0.12 * Math.sin(T * 3 + k); continue; }
        // basıldı: kubbe 3,5 cm iner, çark bir an hızlı döner ve yavaşlar, yer halkası bir kez parlayıp söner
        C.pt = (C.pt || 0) + dt; const e = Math.exp(-C.pt * 2.2);
        C.top.rotation.y += dt * (0.3 + 3.2 * e); C.ring.material.opacity = 0.18 + 0.72 * e; C.top.material.emissiveIntensity = 0.14 + 0.4 * e;
        if (C.press < 1) { C.press = Math.min(1, C.press + dt * 4); C.top.position.y = 0.07 - 0.035 * C.press; }
      }
      for (const gt of gates) {
        if (gt.panel.visible) gt.map.offset.y -= dt * 0.42;   // ışık çizgileri yukarı akar
        if (gt.open) {
          if (gt.anim < 1) {
            // açılış: perde yere süzülerek iner (yumuşak hızlanıp yavaşlar), taşlar sırayla küçük bir zıplamayla yükselir
            gt.anim = Math.min(1, gt.anim + dt / 1.4);
            const u = gt.anim, f = 1 - u * u * (3 - 2 * u), h = Math.max(0.001, gt.ph * f);
            gt.panel.scale.y = h; gt.panel.position.y = h / 2; gt.pm.opacity = 0.95 * Math.min(1, f * 1.6);
            gt.steps.forEach((s, i) => { const q = clamp(u * 1.6 - i * 0.2, 0, 1) - 1; s.position.y = -0.4 + 0.33 * (1 + 2.70158 * q * q * q + 1.70158 * q * q); });
            if (gt.anim >= 1) { gt.panel.visible = false; for (const so of gt.solids) so.alive = false; L._sh = null; }
          }
        } else {
          gt.pm.opacity = 0.88 + 0.07 * Math.sin(T * 2.2);
          // yumuşak kilit (Feza 4,5 yaşında, düğmeyi kaçırabilir): kapının 6 m yakınında toplam ~1 sn → bir kez ipucu (Pırıl düğmeyi gösterir);
          // toplam ~5 sn → Pırıl kapıya uçar, kapıyı kendisi açar (düğme de "basılmış" sayılır, artık çağırmaz). Süre birikir: gidip gelmek de sayılır.
          const d = hyp(P.pos.x - gt.x, P.pos.z - gt.z), bk = S.btn[gt.k];
          if (playing && d < 6) S.stuck[gt.id] = (S.stuck[gt.id] || 0) + dt;
          const st = S.stuck[gt.id] || 0;
          if (playing && d < 6 && !gt.ipucu && st > 1) { gt.ipucu = 1; if (bk && !bk.done) { say('b07_nehir1', { force: true, once: false }); pirilGit(bk.o.x, bk.o.z); } }
          if (playing && st > 4.8) { if (bk) { bk.done = true; try { const n = g0.nesne.bul(bk.o.id); if (n) { n.done = true; n.basili = true; } } catch (e) { /* yok */ } } pirilGit(gt.x, gt.z); unlock(gt.id, gt.k === 3 ? 'b07_kapi_acildi' : 'kapi_acildi'); }
        }
      }
      if (playing) {
        const ar = P.area;
        if (T > 1 && !S.started) { S.started = 1; say('b07_giris', { force: true }); }
        if (T > 8 && S.started === 1) { S.started = 2; say('b07_pirilgiris'); }
        if (T > 16 && S.started === 2 && S.btn[1] && !S.btn[1].done) { S.started = 3; say('b07_nehir1'); pirilGit(S.btn[1].o.x, S.btn[1].o.z); }
        if (ar !== S.area) {
          S.area = ar;
          if (ar === 1) say('b07_pirilsicak', { force: true });   // (b07_goller "taş atlayalım mı?" kaldırıldı: taş atlama oyunu yok)
          if (ar === 2) say('b07_yamac', { force: true });
          if (ar === 3) { say('b07_yuva_giris', { force: true }); S.a3T = T; if (shell) pirilGit(M.shell.x, M.shell.z); }
          // QA: kabuğu bulmadan yamaca geçerse taşıma yine başlasın (yoksa "Feza onu taşıyor" denir ama Pırıl uçuyordu). "Kaplumbağalar yolu gösteriyor" cümlesi
          // kaldırıldı: yamaçta yol gösteren kaplumbağa yok.
          if (ar === 4) { if (!S.shell) { S.shell = 3; S.shellT = T - 12.2; } if (S.carry) say('b07_yamac_sessiz', { force: true }); }
          if (ar === A.length - 1) { say('b07_arena', { force: true, once: false }); if (S.shell < 6) { S.shell = 6; if (!S.carry) { pirilDurum('kucak'); S.carry = true; } } }   // (hikâye arenaya taşmasın: kalan cümleler atlanır)
        }
        // yuva cümleleri sırayla, biri bitmeden öteki başlamaz (önceden kabuk cümleleri araya girince ejderha cümlesi hiç söylenmiyordu)
        if (ar === 3 && !S.ej && T - (S.a3T || 0) > 4.5 && say('b07_ejderha', { gap: 3.6 })) S.ej = 1;
        if (ar === 3 && S.ej === 1 && say('b07_dede_p', { gap: 3.6 })) S.ej = 2;
        if (ar === 3 && M.prints && M.prints.length > 2 && !S.prints && hyp(P.pos.x - M.prints[2].x, P.pos.z - M.prints[2].z) < 3.5) S.prints = 1;
        if (ar === 3 && S.prints === 1 && say('b07_pirilizler', { gap: 3.6 })) S.prints = 2;
        if (ar === 3 && shell && !S.shell && hyp(P.pos.x - M.shell.x, P.pos.z - M.shell.z) < 2.4) {
          S.shell = 1; S.shellT = T; S.kb = 1; sfx('unlock', { x: M.shell.x, z: M.shell.z, pitch: 1.6 }); dot.material.opacity = 1;
        }
        // kabuk hikâyesi: her cümle bir öncekinin bitmesini bekler (üst üste binip kesilmesin); cümle yoksa / söylendiyse geçer
        if (S.kb === 1 && S.shell === 1 && say('b07_kabuk', { gap: 3 })) { S.kb = 2; S.shellT = T; }
        if (S.shell >= 1 && S.shell < 6 && S.kb !== 1) {
          sira(2, 'b07_pirildogdum', 3.5); sira(3, 'b07_kabukyari', 7); sira(4, 'b07_pirilyorgun', 11);
          if (sira(5, 'b07_pirilsoz', 15)) { pirilDurum('kucak'); S.carry = true; }
          sira(6, 'b07_pirilulus', 19);
        }
        if (S.shell === 6 && ar === 4 && !S.ys && T - (S.shellT2 || 0) > 3.6 && say('b07_yamac_sessiz', { gap: 3.6 })) S.ys = 1;
        if (S.orb) {
          const o = S.orb; o.t += dt; orbM.visible = true;
          const k = clamp(o.t / 2.2, 0, 1), tx = P.pos.x, tz = P.pos.z, y0 = 2.6, y1 = 1.1;
          orbM.position.set(o.x + (tx - o.x) * k, y0 + (y1 - y0) * k + Math.sin(k * PI) * 1.0, o.z + (tz - o.z) * k);
          if (k >= 1) { orbM.visible = false; S.orb = null; burst('sparkle', tx, 1.2, tz, { color: '#ffe08a', count: 8 }); pirilUyan(); }
        }
      }
      if (S.carry && !S.happy && !S.bossOn) {   // (boss savaşında yavaşlatma yok: Feza kaçabilsin)
        P.slowT = Math.max(P.slowT || 0, 0.2); P.slowK = 0.82;
        const mov = hyp(hx - (S._hx ?? hx), hz - (S._hz ?? hz)); S._hx = hx; S._hz = hz;
        if (mov < 0.002 && playing) S.still += dt; else S.still = 0;
        if (S.still > 1.4 && !S.hug) { S.hug = 1; burst('heart', hx, 1.5, hz, { count: 3 }); }
        if (S.hug === 1 && playing && say('b07_fezasarilma', { gap: 3.6 })) S.hug = 2;   // (Pırıl'ın cümlesini kesmesin: sırasını bekler)
        else if (S.hug === 2 && playing && say('b07_pirilsarilma', { gap: 3.6 })) S.hug = 3;
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
