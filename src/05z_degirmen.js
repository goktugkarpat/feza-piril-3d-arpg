/* ── Altın Değirmen Vadisi: huysuzlar + boss (Feza ve Pırıl: Büyük Fener, Bölüm 4) ──
   Sahibi: B4 bölüm ajanı. Biçim: HUYSUZ.type / HUYSUZ.boss / HUYSUZ.zone, boss hamleleri BOSSDAV.register (mantar örnek).
   Hepsi SEVİMLİ (kızgın yüz yok, böcek yok). Kaynak: Kefir Vadisi huysuzları yeniden çerçeveli (süt yok; un, başak, taş, bal).
     unTorbacigi     Un Torbacığı      yumuşak un torbası, kayarak gelir, arkasında ince un izi (base kaymak, 'kayan')
     basakHuysuzu    Başak Huysuzu     başak saçlı altın top, çömelip zıplar (base yogurt, 'ziplayan')
     unPufu          Un Pufu           uçan un bulutu, yumuşak "pof" topları atar (base kopuk, 'uzak')
     degirmenTasi    Değirmen Taşı     yassı yuvarlak taş, yavaş yürür, güm diye düşer; yerde halka (base peynir, 'agir')
     balMuhallebisi  Bal Muhallebisi   altın bal jölesi, yakın dövüşçü (base jole, 'yakin')
     carkKusu        Küçük Çark Kuşu   bakır çark kanatlı, zarar vermez, önünde dolanır (base ateskusu, 'ucan'); yalnız Fırın Meydanı
     unBalonu        Un Balonu         (boss molası) dev un balonu; iki vuruşla "pof!" → Bekçi hapşırır, sersemler
     degirmenBekcisi Değirmen Bekçisi  taş-tahta dev, 3 aşama: Taş Adım, Un Fışkırtma, Un Bulutu Dansı, çağırma, Çark Dönüşü
   Sesler: pr_ilk_<tip>, pr_degirmenBekcisi_giris|_yarim|_bitti, b04_boss_* (02l_degirmen.js). */
const HZ_DEGIRMEN = (() => {
  'use strict';
  const PI = Math.PI;
  // ── yer uyarıları (havuzlu): halka, şerit, üçgen. Sesle söylenen renkle aynı; ≥ 2,2 s yerde kalır ──
  const ZM = { pool: [], geo: null };
  function zmGet(kind) {
    if (typeof scene === 'undefined' || typeof THREE === 'undefined') return null;
    if (!ZM.geo) {
      const tri = new THREE.BufferGeometry();
      tri.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -1, 0, 1, 1, 0, 1], 3)); tri.setIndex([0, 1, 2]); tri.computeVertexNormals();
      ZM.geo = { c: new THREE.CircleGeometry(1, 40).rotateX(-PI / 2), r: new THREE.RingGeometry(0.84, 1, 56).rotateX(-PI / 2), p: new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), t: tri };
      for (const k in ZM.geo) ZM.geo[k].userData.keep = true;
    }
    let m = ZM.pool.find(q => !q.on && q.kind === kind);
    if (!m) {
      const mat = op => { const x = new THREE.MeshBasicMaterial({ transparent: true, opacity: op, depthWrite: false, fog: false, side: THREE.DoubleSide }); x.userData.keep = true; return x; };
      const g = new THREE.Group(), fill = new THREE.Mesh(kind === 'ring' ? ZM.geo.c : kind === 'tri' ? ZM.geo.t : ZM.geo.p, mat(0.28)); fill.renderOrder = 2; g.add(fill);
      const edges = kind === 'ring' ? [new THREE.Mesh(ZM.geo.r, mat(0.92))] : kind === 'tri' ? [0, 1, 2].map(() => new THREE.Mesh(ZM.geo.p, mat(0.92))) : [new THREE.Mesh(ZM.geo.p, mat(0.92)), new THREE.Mesh(ZM.geo.p, mat(0.92))];
      for (const e of edges) { e.renderOrder = 3; e.position.y = 0.004; g.add(e); }
      m = { kind, g, fill, edges, on: false, t: 0, d: 1 }; ZM.pool.push(m);
    }
    if (!m.g.parent) scene.add(m.g);
    return m;
  }
  function zmShow(m, col, dur, fillOp) {
    m.fill.material.color.set(col); m.fill.material.opacity = fillOp ?? 0.28;
    for (const e of m.edges) e.material.color.set(col);
    m.g.visible = true; m.on = true; m.t = 0; m.d = Math.max(2.2, dur || 2.2); return m;
  }
  function zoneMark(x, z, r, col, dur, fillOp) {
    const m = zmGet('ring'); if (!m) return null;
    m.g.position.set(x, 0.07, z); m.g.rotation.set(0, 0, 0); m.g.scale.set(r, 1, r); return zmShow(m, col, dur, fillOp);
  }
  function laneMark(x0, z0, x1, z1, w, col, dur, fillOp) {
    const m = zmGet('lane'); if (!m) return null;
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz) || 1;
    m.g.position.set((x0 + x1) / 2, 0.07, (z0 + z1) / 2); m.g.rotation.set(0, Math.atan2(dx, dz), 0); m.g.scale.set(1, 1, 1);
    m.fill.scale.set(w, 1, len); const ew = Math.max(0.12, w * 0.07);
    m.edges.forEach((e, i) => { e.scale.set(ew, 1, len); e.position.x = (i ? 1 : -1) * (w / 2 - ew / 2); e.position.z = 0; e.rotation.y = 0; });
    return zmShow(m, col, dur, fillOp);
  }
  // koni (üçgen): tepe (x,z), yön açısı a, uzunluk L, yarım açı ha
  function triMark(x, z, a, L, ha, col, dur, fillOp) {
    const m = zmGet('tri'); if (!m) return null;
    const hw = Math.tan(ha) * L;
    m.g.position.set(x, 0.07, z); m.g.rotation.set(0, a, 0); m.g.scale.set(1, 1, 1);
    m.fill.scale.set(hw, 1, L);
    const ew = 0.16, sides = [[0, 0, -hw, L], [0, 0, hw, L], [-hw, L, hw, L]];   // [x0,z0,x1,z1] yerel
    sides.forEach(([x0, z0, x1, z1], i) => {
      const e = m.edges[i], dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
      e.position.set((x0 + x1) / 2, 0.004, (z0 + z1) / 2); e.rotation.y = Math.atan2(dx, dz); e.scale.set(ew, 1, len);
    });
    return zmShow(m, col, dur, fillOp);
  }
  function zoneTick(dt) { for (const m of ZM.pool) if (m.on && (m.t += dt) >= m.d) { m.on = false; m.g.visible = false; } }
  function zoneClear() { for (const m of ZM.pool) { m.on = false; m.g.visible = false; } }
  const shut = m => { if (m && m.on) m.d = Math.min(m.d, m.t + 0.25); };

  const HAS = typeof EMODEL !== 'undefined' && EMODEL && EMODEL.KIT && EMODEL.addType && EMODEL.buildRaw;
  const K = HAS ? EMODEL.KIT : null, G = HAS ? K.G : null;
  const col = h => new THREE.Color(h), hdr = (h, k) => new THREE.Color(h).multiplyScalar(k);
  const mixc = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t);
  const hash = (a, b, c) => (K ? K.hash3(a, b, c) : 0.5);
  const sm = x => smooth01(x);
  const yuz = o => Object.assign({ tilt: 0.3, browT: 0.32, browRaise: 0.26 }, o);
  const bumpU = (u, a, b) => (u > a && u < b ? Math.sin(PI * (u - a) / (b - a)) : 0);
  const breath = (s, f = 2.4) => Math.sin(s.t * f + s.ph);
  const UN = '#fff4dc';   // un izi / un topu rengi
  // ── ortak hareket yardımcıları ──
  function boing(s, st, dt, b, k = 1) {
    if (st.hurt > (s.hzH || 0) + 0.25) s.hzB = 0;
    s.hzH = st.hurt;
    if (s.hzB === undefined || s.hzB > 1.2) return;
    s.hzB += dt;
    const w = Math.sin(s.hzB * 30) * Math.exp(-s.hzB * 5.5) * 0.22 * k;
    b.scale.y *= 1 + w; b.scale.x *= 1 - w * 0.6; b.scale.z *= 1 - w * 0.6;
  }
  const HOP = { y: 0, sy: 1, sxz: 1, u: 0, air: 0 };
  function hopGait(s, st, dt, rate, h) {
    s.hopK = damp(s.hopK || 0, st.move > 0.05 ? 1 : 0, 6, dt);
    if (s.hopK > 0.02 || (s.hop % 1) > 0.03) s.hop += dt * (rate + 0.8 * s.mv);
    const u = s.hop % 1, A = s.hopK;
    let y = 0, sy = 1, sxz = 1, air = 0;
    if (u < 0.2) { const k = Math.sin(PI * u / 0.2); sy -= 0.18 * k * A; sxz += 0.1 * k * A; }
    else if (u < 0.82) { const k = (u - 0.2) / 0.62; air = Math.sin(PI * k) * A; y = air * h; const e = Math.abs(Math.cos(PI * k)); sy += 0.14 * e * A; sxz -= 0.06 * e * A; }
    else { const k = Math.sin(PI * (u - 0.82) / 0.18); sy -= 0.2 * k * A; sxz += 0.12 * k * A; }
    HOP.y = y; HOP.sy = sy; HOP.sxz = sxz; HOP.u = u; HOP.air = air;
    return HOP;
  }
  function foot(r, x, y, z, sx, sy, sz, c) {
    r.fx(0, 0.3).add(G.sphere(14, 9), c, [x, y, z], null, [sx, sy, sz]);
    r.fx(0, 0);
  }
  const faceCol = c => mixc(c, '#ffffff', 0.15);

  // ════════════════ UN TORBACIĞI ════════════════
  // Yuvarlak karınlı krem bez torba, boynu ipli, tepesinde un tutamı, yamalar. Kayarken öne yatar, arkasında un izi.
  const TORBA_P = [[0, 0.02], [0.22, 0.03], [0.36, 0.14], [0.43, 0.34], [0.39, 0.55], [0.27, 0.7], [0.13, 0.78], [0, 0.8]];
  function buildTorba(r, o) {
    const E = o.elite;
    r.bone('body', 'root', [0, 0, 0]);
    r.bone('tie', 'body', [0, 0.74, 0]);
    r.bone('feet', 'root', [0, 0.03, 0.06]);
    r.on('body').fx(0, 0.08, 0, (x, y) => 0.1 * sm(y / 0.5));
    r.add(K.lathe('dgTorba', TORBA_P, 28), K.vgrad(0.02, 0.8, [[0, '#c4a46c'], [0.4, '#e8d6a8'], [1, '#f6ecd0']]), [0, 0, 0]);
    r.add(G.sphere(12, 8), '#c9a46a', [0.28, 0.2, 0.28], [0, 0.6, 0], [0.12, 0.1, 0.02]);       // yama
    r.add(G.sphere(12, 8), '#a8c8d8', [-0.3, 0.15, 0.26], [0, -0.6, 0], [0.1, 0.09, 0.02]);
    r.on('tie').fx(0, 0.1);
    r.add(G.torus(TAU, 0.2, 14), '#9a6a3c', [0, 0.74, 0], [PI / 2, 0, 0], [0.17, 0.17, 0.17]);   // boyun ipi
    r.add(G.sphere(12, 8), '#fff6e0', [0, 0.84, 0], null, [0.2, 0.13, 0.2]);                      // un tutamı
    r.add(G.sphere(10, 7), '#fffaf0', [0.1, 0.9, 0.02], null, [0.1, 0.08, 0.1]);
    if (E) K.crown(r.on('tie'), [0, 0.88, 0], 0.5);
    r.on('feet');
    for (const sd of [-1, 1]) foot(r, 0.15 * sd, 0.045, 0.12, 0.09, 0.05, 0.12, '#b08a58');
    r.on('body');
    K.face(r, [0, 0.36, 0], 0.4, yuz({ bone: 'body', tilt: 0.2, ex: 0.14, ey: 0.06, er: 0.1, iris: '#4a3a28', skin: faceCol('#f5ead0'), browCol: '#8a6a40', browY: 1.36,
      mouthY: -0.12, mouthW: 0.1, heartY: 1.1, heartX: 1.2 }));
    r.on('body').mark('muzzle', [0, 0.4, 0.4]);
    return { height: 0.85, glowC: col('#fff3d0'), mat: { rough: 0.85, sss: col('#ffffff').multiplyScalar(0.03), rim: '#fff6e0', rimK: 0.4, rimP: 2.0, wob: 0.01, wobF: 5, wobS: 4 } };
  }
  function animTorba(m, dt, st, s) {
    const B = m.B, b = B.body;
    let sy = 1 + 0.03 * breath(s, 2.2), sxz = 1 - 0.015 * breath(s, 2.2), rx = 0, rz = 0, y = 0;
    s.wk = damp(s.wk || 0, st.move > 0.05 ? 1 : 0, 6, dt);
    if (s.wk > 0.01) s.walk += dt * 7 * s.wk;
    rz += Math.sin(s.walk) * 0.1 * s.wk; y += Math.abs(Math.sin(s.walk)) * 0.04 * s.wk;
    if (st.windup >= 0) { const w = sm(st.windup * 1.4); rx -= 0.32 * w; sy *= 1 - 0.1 * w; sxz *= 1 + 0.06 * w; b.position.x = Math.sin(s.t * 55) * 0.012 * st.windup; }
    if (st.attack >= 0) { const a = st.attack; if (a < 1) { const k = Math.sin(PI * Math.min(1, a)); rx += 0.5 * k; sy *= 1 - 0.18 * k; sxz *= 1 + 0.1 * k; rz += Math.sin(s.t * 30) * 0.06; } else { sy *= 0.9; sxz *= 1.06; } }
    b.position.y = y; b.rotation.x = rx; b.rotation.z = rz; b.scale.set(sxz, sy, sxz);
    B.tie.rotation.z = Math.sin(s.t * 3 + s.ph) * 0.18 - rz * 0.8; B.tie.rotation.x = -rx * 0.6;
    boing(s, st, dt, b);
  }

  // ════════════════ BAŞAK HUYSUZU ════════════════
  // Altın yuvarlak gövde, başında başak demeti saç, minik yeşil yapraklar. Zıplayıp çarpar: çömelir, saçı titrer.
  function buildBasak(r, o) {
    const E = o.elite;
    r.bone('body', 'root', [0, 0, 0]);
    r.bone('hair', 'body', [0, 0.62, 0]);
    r.bone('feet', 'root', [0, 0.03, 0.06]);
    r.on('body').fx(0, 0.25, 0, (x, y) => 0.1 * sm(y / 0.6));
    r.add(G.sphere(22, 16), K.vgrad(0.04, 0.68, [[0, '#d99a2a'], [0.5, '#f2c14e'], [1, '#ffe08a']]), [0, 0.34, 0], null, [0.37, 0.34, 0.37]);
    r.add(G.sphere(16, 10), '#fff0b8', [0, 0.2, 0.2], null, [0.2, 0.15, 0.1]);
    r.on('hair').fx(0, 0.2);
    for (let i = 0; i < 5; i++) {
      const a = (i - 2) * 0.34, tx = Math.sin(a) * 0.3, ty = 0.62 + Math.cos(a) * 0.3;
      r.seg([Math.sin(a) * 0.05, 0.62, 0], [tx, ty, 0], 0.014, '#b88a30', 0.01, 6);
      for (let k = 0; k < 4; k++) { const u = 0.45 + k * 0.17, gx = Math.sin(a) * (0.05 + 0.25 * u), gy = 0.62 + Math.cos(a) * 0.3 * u;
        for (const sd of [-1, 1]) r.add(G.sphere(8, 6), '#f4c94a', [gx + 0.025 * sd, gy, 0.0], [0, 0, a + sd * 0.4], [0.022, 0.05, 0.02]); }
    }
    for (const sd of [-1, 1]) r.add(G.sphere(10, 7), '#7bc06a', [0.1 * sd, 0.66, 0.05], [0, 0, -sd * 0.7], [0.14, 0.03, 0.06]);
    if (E) K.crown(r.on('hair'), [0, 0.62, 0.05], 0.55);
    r.on('feet');
    for (const sd of [-1, 1]) foot(r, 0.13 * sd, 0.045, 0.1, 0.09, 0.05, 0.11, '#b87a2a');
    r.on('body');
    K.face(r, [0, 0.34, 0], 0.34, yuz({ bone: 'body', tilt: 0.2, ex: 0.115, ey: 0.05, er: 0.09, iris: '#5a3a18', skin: faceCol('#ffe6a8'), browCol: '#a07020', browY: 1.36,
      mouthY: -0.1, mouthW: 0.09, heartY: 1.15, heartX: 1.2 }));
    r.on('body').mark('muzzle', [0, 0.36, 0.34]);
    return { height: 0.9, glowC: col('#ffe08a'), mat: { rough: 0.5, sss: col('#fff0b8').multiplyScalar(0.05), rim: '#fff0b8', rimK: 0.5, rimP: 2.0, wob: 0.008, wobF: 6, wobS: 4 } };
  }
  function animBasak(m, dt, st, s) {
    const B = m.B, b = B.body, h = B.hair;
    const g = hopGait(s, st, dt, 2.5, 0.26);
    let y = g.y, sy = g.sy * (1 + 0.025 * breath(s, 3)), sxz = g.sxz, rx = 0.1 * g.air;
    s.hv = s.hv || 0; s.hy = s.hy || 0;
    const tgt = -0.5 * g.air; s.hv += ((tgt - s.hy) * 120 - s.hv * 10) * dt; s.hy += s.hv * dt;
    let hrx = s.hy * 0.8, hrz = Math.sin(s.t * 1.8 + s.ph) * 0.05;
    if (st.windup >= 0) { const w = sm(st.windup * 1.4); sy *= 1 - 0.28 * w; sxz *= 1 + 0.14 * w; hrz += Math.sin(s.t * 50) * 0.06 * w; }
    if (st.attack >= 0) { const a = st.attack; if (a < 1) { const k = Math.sin(PI * a); sy *= 1 + 0.2 * k; sxz *= 1 - 0.1 * k; rx += 0.25 * k; } else { sy *= 0.88; sxz *= 1.1; } }
    b.position.y = y; b.scale.set(sxz, sy, sxz); b.rotation.x = rx;
    h.rotation.x = hrx; h.rotation.z = hrz;
    B.feet.position.y += g.air * 0.1; B.feet.rotation.x = -0.4 * g.air;
    boing(s, st, dt, b);
  }

  // ════════════════ UN PUFU ════════════════
  // Uçan, yumuşacık un bulutu: büyük yuvarlak ön yüz, arkada ve yanlarda pofuduk lobları. Hazırlıkta şişer, "pof" diye söner.
  function buildPuf(r, o) {
    const E = o.elite;
    r.bone('body', 'root', [0, 0.4, 0]);
    r.bone('lobes', 'body', [0, 0.4, 0]);
    r.on('body').fx(0, 0.05, 0, (x, y) => 0.15);
    r.add(G.sphere(22, 16), K.vgrad(0.05, 0.75, [[0, '#f0e6d2'], [0.5, '#fffaf0'], [1, '#ffffff']]), [0, 0.4, 0], null, [0.32, 0.29, 0.31]);
    r.on('lobes').fx(0, 0.05, 0, 0.12);
    const L = [[-0.3, 0.5, -0.1, 0.2], [0.3, 0.5, -0.1, 0.2], [0, 0.66, -0.12, 0.22], [-0.2, 0.3, -0.26, 0.2], [0.2, 0.3, -0.26, 0.2], [0, 0.45, -0.34, 0.2], [-0.34, 0.34, 0.0, 0.14], [0.34, 0.34, 0.0, 0.14]];
    for (const [x, y, z, s0] of L) r.add(G.sphere(14, 10), mixc('#fffaf0', '#f0e6d2', 0.3 * hash(x * 9, y * 9, z * 9)), [x, y, z], null, s0);
    if (E) K.crown(r.on('body'), [0, 0.66, 0.1], 0.55);
    r.on('body');
    K.face(r, [0, 0.4, 0], 0.31, yuz({ bone: 'body', tilt: 0.2, ex: 0.11, ey: 0.05, er: 0.085, iris: '#4a3a2a', skin: faceCol('#fffaf0'), browCol: '#a89878', browY: 1.36,
      mouthY: -0.1, mouthW: 0.09, heartY: 1.2, heartX: 1.2 }));
    r.on('body').mark('muzzle', [0, 0.4, 0.34]);
    return { height: 0.85, glowC: col('#fffaf0'), mat: { rough: 0.9, sss: col('#ffffff').multiplyScalar(0.05), rim: '#ffffff', rimK: 0.5, rimP: 2.0, wob: 0.012, wobF: 4, wobS: 5 } };
  }
  function animPuf(m, dt, st, s) {
    const B = m.B, b = B.body;
    let k = 1 + 0.04 * breath(s, 2.0), y = 0.04 * Math.sin(s.t * 2.2 + s.ph), rz = Math.sin(s.t * 1.2 + s.ph) * 0.06;
    if (st.windup >= 0) { const w = sm(st.windup * 1.2); k *= 1 + 0.3 * w; b.position.x = Math.sin(s.t * 40) * 0.01 * w; }
    if (st.attack >= 0) { const a = st.attack; if (a < 1) k *= 1 - 0.18 * Math.sin(PI * a); }
    b.position.y = y; b.scale.set(k, 2 - k * 0.98 + 0.02, k); b.rotation.z = rz;
    B.lobes.rotation.y = Math.sin(s.t * 0.9 + s.ph) * 0.15;
    boing(s, st, dt, b, 0.6);
  }

  // ════════════════ DEĞİRMEN TAŞI ════════════════
  // Ayakta duran kalın taş çark: ortasında gülen yüz, kenarı oluklu, tepesinde yosun, iki kısa ayak. Hazırlıkta geriye yaslanır, "güm" öne yatar.
  function buildTas(r, o) {
    const E = o.elite;
    r.bone('body', 'root', [0, 0, 0]);
    r.bone('feet', 'root', [0, 0.05, 0.05]);
    r.on('body').fx(0, 0.1, 0);
    r.add(G.sphere(26, 18), (x, y, z) => mixc('#b3ab9b', '#d6cfbf', 0.5 + 0.5 * Math.sin(x * 14 + y * 9 + z * 6)), [0, 0.7, 0], null, [0.66, 0.66, 0.4]);
    r.add(G.torus(TAU, 0.07, 36), '#8e8676', [0, 0.7, 0.0], null, [0.64, 0.64, 0.62]);    // kenar oluğu
    r.add(G.torus(TAU, 0.05, 28), '#a39b8a', [0, 0.7, 0.28], null, [0.5, 0.5, 0.1]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; r.add(G.box(), '#8e8676', [Math.sin(a) * 0.3, 0.7 + Math.cos(a) * 0.3, 0.37], [0, 0, -a], [0.02, 0.18, 0.03]); }   // oluk çizgileri
    r.add(G.sphere(12, 8), '#6fae5a', [0.05, 1.3, 0.0], null, [0.34, 0.1, 0.2]);                  // yosun
    r.add(G.sphere(10, 6), '#86c46c', [-0.16, 1.3, 0.04], null, [0.14, 0.08, 0.12]);
    if (E) K.crown(r.on('body'), [0, 1.34, 0], 0.7);
    r.on('feet');
    for (const sd of [-1, 1]) foot(r, 0.25 * sd, 0.1, 0.1, 0.17, 0.1, 0.22, '#7e7666');
    r.on('body');
    K.face(r, [0, 0.72, 0.0], 0.4, yuz({ bone: 'body', tilt: 0.1, ex: 0.17, ey: 0.05, er: 0.12, iris: '#3a3228', skin: faceCol('#d6cfbf'), browCol: '#6a8a4a', browY: 1.4,
      mouthY: -0.15, mouthW: 0.14, heartY: 1.0, heartX: 1.1 }));
    r.on('body').mark('muzzle', [0, 0.75, 0.38]);
    return { height: 1.4, glowC: col('#e8e0cc'), mat: { rough: 0.8, sss: col('#ffffff').multiplyScalar(0.02), rim: '#fff6e0', rimK: 0.3, rimP: 2.0, wob: 0.003, wobF: 3, wobS: 2 } };
  }
  function animTas(m, dt, st, s) {
    const B = m.B, b = B.body;
    let y = 0, rx = 0, rz = 0, sy = 1 + 0.015 * breath(s, 1.6);
    s.wk = damp(s.wk || 0, st.move > 0.05 ? 1 : 0, 5, dt);
    if (s.wk > 0.01) s.walk += dt * 4.5 * s.wk;
    rz += Math.sin(s.walk) * 0.07 * s.wk; y += Math.abs(Math.sin(s.walk)) * 0.05 * s.wk;
    B.feet.position.y += Math.max(0, Math.sin(s.walk)) * 0.06 * s.wk;
    if (st.windup >= 0) { const w = sm(st.windup * 1.3); rx -= 0.45 * w; y += 0.1 * w; b.position.z = -0.05 * w; }
    if (st.attack >= 0) { const a = st.attack; if (a < 0.25) { rx += 0.55 * Math.sin(PI * a / 0.25) - 0.1; } else if (a < 1) { rx += 0.15 * (1 - (a - 0.25) / 0.75); sy *= 0.96; } }
    b.position.y = y; b.rotation.x = rx; b.rotation.z = rz; b.scale.y = sy;
    boing(s, st, dt, b, 0.3);
  }

  // ════════════════ BAL MUHALLEBİSİ ════════════════
  // Altın bal renkli sevimli jöle kubbe, tepesinden bal damlaları süzülür. Yakın dövüşçü: sallanıp üstüne atlar.
  const MUH_P = [[0, 0.0], [0.42, 0.0], [0.5, 0.12], [0.45, 0.35], [0.3, 0.6], [0.12, 0.72], [0, 0.75]];
  function buildMuh(r, o) {
    const E = o.elite;
    r.bone('body', 'root', [0, 0, 0]);
    r.bone('drip', 'body', [0, 0.7, 0]);
    r.on('body').fx(0.05, 0.7, 0, (x, y) => 0.15 * sm(y / 0.7));
    r.add(K.lathe('dgMuh', MUH_P, 30), K.vgrad(0.0, 0.75, [[0, '#e8a020'], [0.45, '#f7bf3a'], [1, '#ffe08a']]), [0, 0, 0]);
    r.fx(0, 0.9, 0).add(G.sphere(12, 8), hdr('#fff6d0', 1.3), [-0.12, 0.62, 0.22], null, [0.12, 0.05, 0.04]);
    r.on('drip').fx(0, 0.9);
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.5; r.add(G.sphere(10, 8), '#ffd24a', [Math.sin(a) * 0.2, 0.62 - (i % 2) * 0.05, Math.cos(a) * 0.2], null, [0.07, 0.11 + (i % 2) * 0.05, 0.07]); }
    r.add(G.sphere(12, 8), '#f0a020', [0, 0.78, 0], null, [0.1, 0.07, 0.1]);
    if (E) K.crown(r.on('drip'), [0, 0.74, 0.0], 0.55);
    r.on('body');
    K.face(r, [0, 0.34, 0], 0.42, yuz({ bone: 'body', tilt: 0.2, ex: 0.15, ey: 0.06, er: 0.1, iris: '#6a3a10', skin: faceCol('#ffd878'), browCol: '#b07010', browY: 1.36,
      mouthY: -0.12, mouthW: 0.11, heartY: 1.1, heartX: 1.2 }));
    r.on('body').mark('muzzle', [0, 0.38, 0.42]);
    return { height: 0.8, glowC: col('#ffd24a'), mat: { rough: 0.3, sss: col('#ffd24a').multiplyScalar(0.08), rim: '#fff0b0', rimK: 0.6, rimP: 2.0, wob: 0.018, wobF: 5, wobS: 5 } };
  }
  function animMuh(m, dt, st, s) {
    const B = m.B, b = B.body;
    const g = hopGait(s, st, dt, 2.1, 0.18);
    let sy = g.sy * (1 + 0.05 * breath(s, 2.6)), sxz = g.sxz * (1 - 0.025 * breath(s, 2.6)), rx = 0.1 * g.air;
    if (st.windup >= 0) { const w = sm(st.windup * 1.4); sy *= 1 - 0.25 * w; sxz *= 1 + 0.14 * w; }
    if (st.attack >= 0) { const a = st.attack; if (a < 1) { const k = Math.sin(PI * a); sy *= 1 + 0.18 * k; rx += 0.35 * k; } else { sy *= 0.88; sxz *= 1.08; } }
    b.position.y = g.y; b.scale.set(sxz, sy, sxz); b.rotation.x = rx;
    B.drip.position.y += 0.015 * Math.sin(s.t * 3 + s.ph);
    boing(s, st, dt, b, 0.8);
  }

  // ════════════════ KÜÇÜK ÇARK KUŞU ════════════════
  // Krem tüylü yuvarlak kuş, turuncu gaga, kanatları bakır pervane çark. Çarklar donuk; yaklaşınca yavaş yavaş dönmeye çalışır.
  function pinwheel(r, sd, c0, c1) {
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * TAU, cy = 0.34 + Math.cos(a) * 0.13, cz = Math.sin(a) * 0.13;
      r.add(G.box(), i % 2 ? c0 : c1, [0.34 * sd, cy, cz], [a, 0, 0], [0.025, 0.2, 0.09]);
    }
    r.add(G.sphere(10, 8), '#8a5a2a', [0.34 * sd, 0.34, 0], null, 0.04);
  }
  function buildKus(r, o) {
    r.bone('body', 'root', [0, 0.3, 0]);
    r.bone('wingL', 'body', [0.3, 0.34, 0]); r.bone('wingR', 'body', [-0.3, 0.34, 0]);
    r.bone('tail', 'body', [0, 0.28, -0.26]);
    r.on('body').fx(0, 0.15, 0, 0);
    r.add(G.sphere(20, 14), K.vgrad(0.05, 0.6, [[0, '#e8d8b0'], [0.5, '#fbf0d4'], [1, '#fffaf0']]), [0, 0.32, 0], null, [0.27, 0.26, 0.27]);
    r.add(G.sphere(12, 8), '#fffaf0', [0, 0.2, 0.15], null, [0.16, 0.12, 0.1]);
    r.add(G.cone(8), '#f0902a', [0, 0.3, 0.3], [PI / 2, 0, 0], [0.05, 0.12, 0.05]);                // gaga
    r.add(G.sphere(8, 6), '#fffaf0', [0, 0.56, 0.02], [0.3, 0, 0], [0.06, 0.09, 0.05]);             // tepelik
    r.on('wingL').fx(0, 0.5); pinwheel(r, 1, '#c9773a', '#e0a050');
    r.on('wingR').fx(0, 0.5); pinwheel(r, -1, '#c9773a', '#e0a050');
    r.on('tail'); r.add(G.cone(6), '#c9773a', [0, 0.28, -0.34], [-PI / 2 - 0.3, 0, 0], [0.07, 0.2, 0.03]);
    r.on('body');
    K.face(r, [0, 0.34, 0], 0.27, yuz({ bone: 'body', tilt: 0.2, ex: 0.1, ey: 0.06, er: 0.075, iris: '#3a2a18', skin: faceCol('#fbf0d4'), browCol: '#a08850', browY: 1.4, noMouth: true, heartY: 1.2, heartX: 1.2 }));
    r.on('body').mark('muzzle', [0, 0.32, 0.3]);
    return { height: 0.75, glowC: col('#e0a050'), mat: { rough: 0.55, sss: col('#fff6e0').multiplyScalar(0.04), rim: '#ffe0b0', rimK: 0.5, rimP: 2.0, wob: 0.006, wobF: 5, wobS: 4 } };
  }
  function animKus(m, dt, st, s) {
    const B = m.B, b = B.body;
    s.wa = (s.wa || 0) + dt * (0.5 + 3.2 * Math.min(1, s.mv + (st.attack >= 0 ? 1 : 0)) + 0.6 * Math.max(0, Math.sin(s.t * 0.7)));
    B.wingL.rotation.x = s.wa; B.wingR.rotation.x = -s.wa;
    b.position.y = 0.06 * Math.sin(s.t * 3 + s.ph); b.rotation.z = Math.sin(s.t * 1.7 + s.ph) * 0.1; b.rotation.x = 0.12 * Math.min(1, s.mv);
    B.tail.rotation.x = Math.sin(s.t * 4) * 0.12;
    if (st.windup >= 0) { const w = sm(st.windup * 1.3); b.scale.setScalar(1 + 0.15 * w); } else b.scale.setScalar(1);
    boing(s, st, dt, b, 0.6);
  }

  // ════════════════ UN BALONU ════════════════
  // Boss molası: kocaman, yumuşak, gülen un balonu; iki vuruşla "pof!" patlar.
  function buildBalon(r, o) {
    r.bone('body', 'root', [0, 0.75, 0]);
    r.bone('knot', 'body', [0, 0.1, 0]);
    r.on('body').fx(0, 0.5, 0, 0.1);
    r.add(G.sphere(26, 18), K.vgrad(0.1, 1.4, [[0, '#f2e8d0'], [0.5, '#fffaf0'], [1, '#ffffff']]), [0, 0.8, 0], null, [0.62, 0.7, 0.62]);
    r.fx(0, 0.9).add(G.sphere(12, 8), hdr('#ffffff', 1.4), [-0.22, 1.1, 0.4], null, [0.14, 0.07, 0.05]);
    r.on('knot').fx(0, 0.2);
    r.add(G.cone(10), '#f0e6d2', [0, 0.05, 0], [PI, 0, 0], [0.1, 0.12, 0.1]);
    r.seg([0, 0.02, 0], [0.04, -0.4, 0.02], 0.012, '#c9a46a', 0.01, 6);
    r.on('body');
    K.face(r, [0, 0.8, 0], 0.62, yuz({ bone: 'body', tilt: 0.1, ex: 0.2, ey: 0.06, er: 0.14, iris: '#3a2a18', skin: faceCol('#fffaf0'), browCol: '#b0a080', browY: 1.36,
      mouthY: -0.2, mouthW: 0.17, heartY: 1.05, heartX: 1.1 }));
    r.on('body').mark('muzzle', [0, 0.8, 0.6]);
    return { height: 1.6, glowC: col('#ffffff'), mat: { rough: 0.35, sss: col('#ffffff').multiplyScalar(0.06), rim: '#ffffff', rimK: 0.6, rimP: 2.0, wob: 0.02, wobF: 3, wobS: 5 } };
  }
  function animBalon(m, dt, st, s) {
    const B = m.B, b = B.body;
    const k = 1 + 0.04 * Math.sin(s.t * 2.6 + s.ph);
    b.position.y = 0.08 * Math.sin(s.t * 1.8 + s.ph); b.scale.set(k, 2 - k, k); b.rotation.z = Math.sin(s.t * 1.1) * 0.06;
    B.knot.rotation.z = Math.sin(s.t * 2.2) * 0.2;
    boing(s, st, dt, b, 1.2);
  }

  // ════════════════ DEĞİRMEN BEKÇİSİ (boss) ════════════════
  // Taş gövde (tuğla çizgili), ahşap kol ve bacaklar, başında bakır çatı şapkası, sırtında dört kanatlı büyük çark (durmuş),
  // elinde taş çark kalkanı. Uykulu, yumuşak yüz (kızgın değil). Neşelenince çark döner.
  function buildBekci(r, o) {
    const stone = (x, y, z) => { const row = Math.floor(y * 4), off = (row & 1) * 0.5, lx = x * 3 + off, ln = Math.abs(((y * 4) % 1) - 0.5) > 0.46 || Math.abs((lx % 1) - 0.5) > 0.47 ? 0.78 : 1; const v = 0.9 + 0.1 * hash(Math.floor(lx), row, 3); return new THREE.Color(0xe0b27a).multiplyScalar(ln * v); };
    r.bone('body', 'root', [0, 0, 0]);
    r.bone('head', 'body', [0, 2.55, 0]);
    r.bone('wheel', 'body', [0, 2.0, -0.78]);
    r.bone('armL', 'body', [0.92, 2.15, 0]); r.bone('armR', 'body', [-0.92, 2.15, 0]);
    r.bone('legL', 'body', [0.5, 1.1, 0]); r.bone('legR', 'body', [-0.5, 1.1, 0]);
    r.bone('door', 'body', [0, 1.55, 0.58]);
    // gövde
    r.on('body').fx(0, 0.1, 0);
    r.add(G.rbox(2), stone, [0, 1.65, 0], null, [1.55, 1.35, 1.15]);
    r.add(G.rbox(2), '#c9895a', [0, 1.05, 0], null, [1.3, 0.35, 1.0]);                  // kemer/kuşak
    r.add(G.box(), '#8a5a34', [0, 1.1, 0.5], null, [1.34, 0.12, 0.12]);                // ahşap kuşak
    for (const sd of [-1, 1]) r.add(G.sphere(14, 10), '#f0c590', [0.9 * sd, 2.2, 0], null, [0.38, 0.32, 0.38]);   // omuz taşları
    r.on('door').fx(0.9, 0.2);
    r.add(G.cyl(1, 1, 22), hdr('#ffd88a', 1.6), [0, 1.55, 0.585], [PI / 2, 0, 0], [0.26, 0.04, 0.26]);   // göbekte sıcak pencere
    r.fx(0, 0.2).add(G.torus(TAU, 0.12, 22), '#8a5a34', [0, 1.55, 0.6], null, [0.28, 0.28, 0.3]);
    r.fx(0, 0);
    // başın üstü: taş kafa + bakır çatı şapka
    r.on('head').fx(0, 0.1, 0);
    r.add(G.sphere(26, 18), (x, y, z) => mixc('#f0c08a', '#ffd9a8', 0.5 + 0.5 * Math.sin(x * 9 + y * 6)), [0, 2.55, 0.05], null, [0.66, 0.6, 0.62]);
    for (const sd of [-1, 1]) r.add(G.sphere(12, 8), '#f0c590', [0.62 * sd, 2.5, 0.0], null, [0.14, 0.2, 0.12]);
    r.add(G.cyl(1, 1, 30), '#9a4f2a', [0, 3.1, 0.0], null, [0.8, 0.07, 0.8]);        // şapka kenarı
    r.add(G.cone(30), (x, y, z) => mixc('#b5653a', '#d98a56', 0.5 + 0.5 * Math.sin(Math.atan2(x, z) * 8)), [0, 3.56, 0.0], null, [0.68, 0.85, 0.68]);   // çatı
    r.add(G.box(), '#8a5a34', [0.36, 3.7, -0.1], null, [0.16, 0.34, 0.16]);              // baca
    r.add(G.sphere(10, 8), '#fff6e0', [0.38, 3.98, -0.1], null, [0.12, 0.1, 0.12]);      // minik duman
    r.fx(0, 0.2);
    // yüz
    K.face(r, [0, 2.52, 0.04], 0.6, yuz({ bone: 'head', tilt: 0.5, ex: 0.22, ey: 0.04, er: 0.14, iris: '#5a4a30', skin: faceCol('#ffe0b8'), browCol: '#7a4a2a', browY: 1.42, browW: 1.2,
      mouthY: -0.2, mouthW: 0.18, noTongue: true, blushCol: '#ffb08a', heartY: 1.0, heartX: 1.1 }));
    r.on('head').mark('muzzle', [0, 2.45, 0.62]);
    // kollar (ahşap) + eller
    for (const sd of [-1, 1]) {
      r.on(sd > 0 ? 'armL' : 'armR').fx(0, 0.15);
      r.seg([0.92 * sd, 2.15, 0], [1.2 * sd, 1.5, 0.15], 0.17, '#8a5a34', 0.15, 10);
      r.seg([1.2 * sd, 1.5, 0.15], [1.28 * sd, 0.95, 0.4], 0.15, '#9a6a3c', 0.14, 10);
      r.add(G.sphere(14, 10), '#c9a46a', [1.28 * sd, 0.88, 0.45], null, [0.22, 0.2, 0.2]);
      r.add(G.torus(TAU, 0.2, 14), '#6a4426', [1.2 * sd, 1.5, 0.15], [0, PI / 2, 0], 0.17);    // dirsek bileziği
    }
    // taş çark kalkan (sağ el: -x)
    r.on('armR').fx(0, 0.1);
    r.add(G.cyl(1, 1, 28), '#d9a070', [-1.48, 0.95, 0.55], [PI / 2, 0, 0], [0.62, 0.12, 0.62]);
    r.add(G.torus(TAU, 0.1, 28), '#8e8676', [-1.48, 0.95, 0.62], null, [0.6, 0.6, 0.6]);
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; r.add(G.box(), '#8e8676', [-1.48 + Math.sin(a) * 0.3, 0.95 + Math.cos(a) * 0.3, 0.64], [0, 0, -a], [0.06, 0.6, 0.04]); }
    // bacaklar (ahşap) + taş ayaklar
    for (const sd of [-1, 1]) {
      r.on(sd > 0 ? 'legL' : 'legR').fx(0, 0.15);
      r.seg([0.5 * sd, 1.15, 0], [0.5 * sd, 0.3, 0.05], 0.22, '#8a5a34', 0.2, 10);
      r.add(G.rbox(2), '#d9a070', [0.5 * sd, 0.12, 0.2], null, [0.56, 0.24, 0.72]);
      r.add(G.torus(TAU, 0.2, 14), '#6a4426', [0.5 * sd, 0.55, 0.04], [PI / 2, 0, 0], 0.2);
    }
    // sırttaki büyük çark: dört kanat, çıtalı yelken
    r.on('wheel').fx(0, 0.1);
    r.add(G.sphere(14, 10), '#6a4426', [0, 2.0, -0.78], null, [0.28, 0.28, 0.28]);
    r.add(G.cyl(1, 1, 12), '#6a4426', [0, 2.0, -0.55], [PI / 2, 0, 0], [0.1, 0.4, 0.1]);   // mil
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * TAU + PI / 4, sx = Math.sin(a), cy = Math.cos(a), px = cy, py = -sx;   // yön + dik
      r.add(G.box(), '#8a5a34', [sx * 0.78, 2.0 + cy * 0.78, -0.8], [0, 0, -a], [0.12, 1.6, 0.1]);
      r.add(G.box(), '#fff1d0', [sx * 1.1 + px * 0.26, 2.0 + cy * 1.1 + py * 0.26, -0.82], [0, 0, -a], [0.5, 0.8, 0.04]);
      for (let k = 0; k < 3; k++) r.add(G.box(), '#8a5a34', [sx * (0.65 + 0.3 * k) + px * 0.26, 2.0 + cy * (0.65 + 0.3 * k) + py * 0.26, -0.8], [0, 0, -a + PI / 2], [0.52, 0.05, 0.05]);
    }
    r.fx(0, 0);
    return { height: 3.5, glowC: col('#ffd88a'), portrait: { cx: 0, cy: 2.5, cz: 0, rad: 1.6 },
      mat: { rough: 0.8, sss: col('#fff0d0').multiplyScalar(0.02), rim: '#ffe8c0', rimK: 0.4, rimP: 2.0, wob: 0.002, wobF: 3, wobS: 2 } };
  }
  const bph = st => (st.dying >= 0 ? 'dying' : (st.phase || 'idle'));
  const bpt = st => clamp(+st.phaseT || 0, 0, 1);
  function animBekci(m, dt, st, s) {
    const B = m.B, b = B.body, hd = B.head, ph = bph(st), t = bpt(st), br = Math.sin(s.t * 1.2 + s.ph);
    let sy = 1 + 0.015 * br, y = 0, rx = 0, rz = 0, ry = 0, hrx = -0.12, hrz = 0, aL = 0.15, aR = -0.15, aLx = 0, aRx = 0, wspin = 0, legL = 0, legR = 0;
    s.wk = damp(s.wk || 0, st.move > 0.05 ? 1 : 0, 5, dt);
    if (s.wk > 0.01) s.walk += dt * 3.6 * s.wk;
    const w0 = Math.sin(s.walk);
    rz += w0 * 0.035 * s.wk; y += Math.abs(w0) * 0.06 * s.wk; aL += w0 * 0.25 * s.wk; aR += w0 * 0.25 * s.wk;
    B.legL.position.y += Math.max(0, w0) * 0.18 * s.wk; B.legR.position.y += Math.max(0, -w0) * 0.18 * s.wk;
    // uyuyor (Feza'yı görmeden): kafa öne düşer, horlar
    const sleep = st.aggro === false && ph === 'idle' ? 1 : 0;
    s.slK = damp(s.slK || 0, sleep, 3, dt);
    if (s.slK > 0.01) { const z = Math.sin(s.t * 1.4) * 0.5 + 0.5, k = s.slK; hrx += 0.3 * k; sy *= 1 + 0.015 * z * k; s.eyeK = lerp(s.eyeK, 0.06, k); s.mouthO = Math.max(s.mouthO, 0.3 * z * k); aL = lerp(aL, 0.05, k); aR = lerp(aR, -0.05, k); }
    switch (ph) {
      case 'roar': {   // uyanış: esner, kollar yukarı, çark bir sarsılır
        const k = sm(t / 0.25) * (1 - sm((t - 0.85) / 0.15));
        rx -= 0.1 * k; hrx -= 0.2 * k; aL = 0.15 + 2.3 * k; aR = -0.15 - 2.3 * k; s.mouthO = k; s.eyeK = 1 - 0.7 * bumpU(t, 0.2, 0.6); wspin = 0.8 * bumpU(t, 0.4, 0.9);
        break;
      }
      case 'adim': {   // sağ bacağı kaldırır, yere "güm" basar (b.y'yi BOSSDAV verir: air 0..1)
        const air = clamp(+st.air || 0, 0, 1), land = st.land || 0;
        if (air <= 0 && land <= 0) { const k = bumpU(t, 0, 0.3); sy *= 1 - 0.08 * k; rx -= 0.12 * k; B.legL.position.y += 0.3 * k; aL += 0.8 * k; aR -= 0.8 * k; }
        if (air > 0) { const e = Math.sin(PI * air); sy *= 1 + 0.04 * e; aL = 0.4 + 1.4 * e; aR = -0.4 - 1.4 * e; s.mouthW = e; B.legL.position.y += 0.3 * e; B.legR.position.y += 0.2 * e; }
        if (land > 0) { sy *= 1 - 0.1 * land; rx += 0.1 * land; hrx += 0.15 * land; }
        break;
      }
      case 'fiskir': {   // geriye yaslanır, göbek penceresinden un fışkırtır (0.55'ten sonra)
        const inh = sm(t / 0.5) * (1 - sm((t - 0.55) / 0.05)), sp = sm((t - 0.55) / 0.08) * (1 - sm((t - 0.9) / 0.1));
        rx += -0.16 * inh + 0.22 * sp; hrx += -0.2 * inh; aL = 0.15 + 1.2 * inh + 0.6 * sp; aR = -0.15 - 1.2 * inh - 0.6 * sp; sy *= 1 + 0.04 * inh - 0.05 * sp;
        s.eyeK = 1 - 0.5 * inh; s.mouthO = 0.6 * sp; b.position.x = Math.sin(s.t * 50) * 0.02 * sp;
        break;
      }
      case 'dans': {   // sağa sola sallanır, çark yavaş döner
        const k = sm(t / 0.12) * (1 - sm((t - 0.9) / 0.1)), b3 = Math.sin(t * PI * 6);
        rz += 0.12 * b3 * k; ry += 0.3 * Math.sin(t * PI * 3) * k; y += Math.abs(b3) * 0.14 * k; aL = 0.4 + 1.2 * Math.max(0, b3) * k; aR = -0.4 - 1.2 * Math.max(0, -b3) * k; wspin = 1.0 * k; s.mouthW = k; hrz += 0.15 * b3 * k;
        break;
      }
      case 'cagir': {   // kollarını sallayıp küçükleri çağırır
        const k = sm(t / 0.2) * (1 - sm((t - 0.85) / 0.15));
        aL = 0.15 + 1.9 * k + 0.3 * Math.sin(s.t * 12) * k; aR = -0.15 - 1.9 * k - 0.3 * Math.sin(s.t * 12 + 1) * k; s.mouthW = k; y += Math.abs(Math.sin(s.t * 9)) * 0.06 * k; wspin = 0.6 * k;
        break;
      }
      case 'cark': {   // çark hızla döner (çizgi işareti yerde), sağa sola savrulur
        const k = sm(t / 0.2) * (1 - sm((t - 0.85) / 0.15));
        wspin = 5.5 * k; ry += Math.sin(t * PI * 2) * 0.35 * k; aL = 0.15 + 1.0 * k; aR = -0.15 - 1.0 * k; rx -= 0.06 * k; s.mouthO = 0.4 * k; s.eyeK = 1 + 0.2 * k;
        break;
      }
      case 'balon': {   // derin nefes alır, un balonu üfler
        const inh = sm(t / 0.4) * (1 - sm((t - 0.42) / 0.05)), bl = bumpU(t, 0.45, 0.9);
        rx += -0.18 * inh + 0.12 * bl; hrx += -0.25 * inh + 0.1 * bl; sy *= 1 + 0.08 * inh - 0.05 * bl; aL = 0.15 + 0.9 * inh; aR = -0.15 - 0.9 * inh; s.mouthO = Math.max(0.3 * inh, bl); s.eyeK = 1 - 0.5 * inh;
        break;
      }
      case 'hapsu': {   // balon patladı: üç kez hapşırır, sersemler (6 sn)
        const k = bumpU(((t * 3) % 1), 0.45, 0.8), inh = bumpU(((t * 3) % 1), 0, 0.45);
        rx += -0.12 * inh + 0.2 * k; hrx += -0.2 * inh + 0.25 * k; s.eyeK = 1 - 0.8 * Math.max(inh * 0.7, k); s.mouthO = Math.max(0.6 * inh, k); aL = 0.15 + 0.6 * inh; aR = -0.15 - 0.6 * inh;
        hrz += Math.sin(s.t * 3) * 0.1; wspin = 0.15;
        break;
      }
      case 'kikir': case 'sasir': {   // aşama arası kıkırdama: omuzlar sallanır, çark küçük bir tur
        const k = sm(t / 0.15) * (1 - sm((t - 0.85) / 0.15)), g = Math.sin(s.t * 22);
        y += Math.abs(g) * 0.08 * k; rz += g * 0.03 * k; aL = 0.15 + 0.9 * k; aR = -0.15 - 0.9 * k; s.mouthW = k; s.eyeK = 1 - 0.7 * k; wspin = 0.7 * k; hrx -= 0.1 * k;
        break;
      }
      case 'dying': {   // neşelendi (~7 s): ekmeği ısırır, kahkaha, çark döner, kalp kalp
        s.giving = true;
        const u = st.dying;
        const take = bumpU(u, 0.1, 0.34);                                  // ekmeği alıp ağzına götürür
        aL += 2.0 * take; aLx = -1.1 * take; hrx -= 0.1 * take; s.mouthO = Math.max(0, take * 0.7);
        const bite = bumpU(u, 0.24, 0.3); s.mouthO = Math.max(s.mouthO, bite * 0.2);
        const lg = sm((u - 0.34) / 0.05) * (1 - sm((u - 0.88) / 0.06));   // kahkaha
        const g = Math.sin(s.t * 9);
        y += Math.abs(g) * 0.16 * lg; rz += Math.sin(s.t * 4.5) * 0.06 * lg; ry += Math.sin(s.t * 2) * 0.3 * lg;
        aL = lerp(aL, 0.4 + (1.6 + 0.5 * g) * lg, lg); aR = -0.4 - (1.6 + 0.5 * Math.sin(s.t * 9 + 1.5)) * lg; s.mouthW = Math.max(s.mouthW, lg); s.eyeK = lerp(s.eyeK, 0.3, lg);
        wspin = 3.5 * sm((u - 0.28) / 0.2) * (1 - sm((u - 0.9) / 0.1));
        B.legL.position.y += Math.max(0, g) * 0.12 * lg; B.legR.position.y += Math.max(0, -g) * 0.12 * lg;
        const out = sm((u - 0.93) / 0.07);
        if (B.root) B.root.scale.setScalar(Math.max(0.0001, 1 - out));
        break;
      }
      default: break;
    }
    s.wheelA = (s.wheelA || 0) + dt * wspin;
    B.wheel.rotation.z = -s.wheelA;
    b.position.y += y; b.rotation.x += rx; b.rotation.z += rz; b.rotation.y += ry; b.scale.y = sy;
    hd.rotation.x = hrx; hd.rotation.z = hrz;
    B.armL.rotation.z = aL; B.armR.rotation.z = aR; B.armL.rotation.x = aLx; B.armR.rotation.x = aRx;
    boing(s, st, dt, b, 0.15);
  }

  // ════════════════ Kayıt ════════════════
  const T = [
    // id, ad, base, saldiri, stats, kurucu, anim, lod
    ['unTorbacigi', 'Un Torbacığı', 'kaymak', 'kayan', { eliteAd: 'Kocaman Un Torbacığı', hp: 22, dmg: 4, speed: 3.2, r: 0.45, height: 0.85, atkRange: 2.4, atkCd: 2.2, windup: 0.7, aggro: 9, trail: 'dust', trailCol: UN }, buildTorba, animTorba, 0.55],
    ['basakHuysuzu', 'Başak Huysuzu', 'yogurt', 'ziplayan', { eliteAd: 'Kocaman Başak Huysuzu', hp: 20, dmg: 4, speed: 2.5, r: 0.45, height: 0.9, atkRange: 2.4, atkCd: 2.1, windup: 0.85, aggro: 8.5 }, buildBasak, animBasak, 0.55],
    ['unPufu', 'Un Pufu', 'kopuk', 'uzak', { eliteAd: 'Kocaman Un Pufu', hp: 16, dmg: 2, speed: 1.8, r: 0.45, height: 0.85, atkRange: 6.0, range: 6.0, atkCd: 3.0, windup: 1.0, aggro: 8.5, fly: true, hover: 0.7, shot: { kind: 'fizz', speed: 3.4, r: 0.32, col: UN } }, buildPuf, animPuf, 0.55],
    ['degirmenTasi', 'Değirmen Taşı', 'peynir', 'agir', { eliteAd: 'Kocaman Değirmen Taşı', hp: 50, dmg: 5, speed: 1.5, r: 0.62, height: 1.4, atkRange: 1.7, atkCd: 2.8, windup: 1.0, slamR: 1.9, aggro: 9 }, buildTas, animTas, 0.6],
    ['balMuhallebisi', 'Bal Muhallebisi', 'jole', 'yakin', { eliteAd: 'Kocaman Bal Muhallebisi', hp: 18, dmg: 4, speed: 2.4, r: 0.45, height: 0.8, atkRange: 1.4, atkCd: 2.0, windup: 0.7, aggro: 8.5 }, buildMuh, animMuh, 0.55],
    ['carkKusu', 'Küçük Çark Kuşu', 'ateskusu', 'ucan', { hp: 12, dmg: 1, speed: 2.6, r: 0.35, height: 0.75, atkRange: 1.4, atkCd: 3.0, windup: 0.8, aggro: 9, fly: true, hover: 0.8, xp: 8 }, buildKus, animKus, 0.55],
    ['unBalonu', 'Un Balonu', 'kopuk', 'ucan', { hp: 12, dmg: 3, speed: 1.3, r: 0.7, height: 1.6, atkRange: 1.6, atkCd: 3.0, windup: 1.0, aggro: 30, fly: true, hover: 0.8, xp: 4, gold: 0 }, buildBalon, animBalon, 0.7],
  ];
  for (const [id, ad, base, saldiri, stats, mk, an, lod, variants] of T) {
    const def = { ad, base, saldiri, stats, ilkSoz: 'pr_ilk_' + id };
    if (HAS) {
      EMODEL.addType(id, mk, an, lod, variants || undefined);
      def.model = o => EMODEL.buildRaw(id, o || {});
    }
    HUYSUZ.type(id, def);
  }
  const bdef = { ad: 'Değirmen Bekçisi', base: 'kraljole', stats: { r: 1.6, height: 3.5 },
    lines: { giris: 'b04_kral_giris', bitti: 'b04_bitti', yarim: 'pr_degirmenBekcisi_yarim' },
    bossKit: { own: true, add: 'unTorbacigi', at: [0.66, 0.33], n: [2, 2], col: '#ffe9b0', roar: 0.8, addDmg: 0.7 } };
  if (HAS) { EMODEL.addType('degirmenBekcisi', buildBekci, animBekci, 0.8); bdef.model = o => EMODEL.buildRaw('degirmenBekcisi', o || {}); }
  HUYSUZ.boss('degirmenBekcisi', bdef);
  HUYSUZ.zone('degirmen', { enemies: { unTorbacigi: 4, basakHuysuzu: 3, unPufu: 2.5, degirmenTasi: 2, balMuhallebisi: 2 },
    elites: ['unTorbacigi', 'degirmenTasi'], boss: 'degirmenBekcisi' });

  // ════════════════ Boss hamleleri (BOSSDAV.register) ════════════════
  const rnd = (a, b) => a + Math.random() * (b - a);
  const faceTo = (b, x, z, k, dt) => { b.face = dampAngle(b.face, Math.atan2(x - b.x, z - b.z), k, dt); };
  function tele(S, x, z, r, dur, c) { const A = BOSSDAV.api, h = A.fx('telegraph', x, z, r, dur, c); if (h) (S.marks || (S.marks = [])).push(h); return h; }
  function clearMarks(S) { const A = BOSSDAV.api; if (S && S.marks) { for (const h of S.marks) try { A.remove(h); } catch (e) { /* yok */ } S.marks.length = 0; } }
  const flour = (A, x, y, z, n, sp = 2.4) => { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = rnd(0.5, sp); A.emitP(x, y, z, Math.sin(a) * v, rnd(0.6, 1.8), Math.cos(a) * v, rnd(0.5, 0.9), 0.3, 0.08, '#fff4dc', '#ffffff', 2, 0, 0); } };
  // zıplama/adım (adim hamlesi): b.y yay, iniş halkası
  function stepJump(b, S, t, J, A) {
    const st = b.st;
    if (t < J.c) { st.air = 0; st.land = 0; return; }
    if (t < J.l) {
      const u = (t - J.c) / (J.l - J.c), k = u * u * (3 - 2 * u);
      b.x = J.x0 + (J.x1 - J.x0) * k; b.z = J.z0 + (J.z1 - J.z0) * k; b.y = 4 * J.h * u * (1 - u); st.air = u; st.land = 0;
      if (!J.up) { J.up = 1; A.sfx('bounce', { x: b.x, z: b.z, pitch: 0.5 }); }
      return;
    }
    st.air = 0;
    if (!J.down) {
      J.down = 1; b.y = 0; b.x = J.x1; b.z = J.z1; if (J.mark) { A.remove(J.mark); J.mark = null; } shut(J.zm);
      A.bossRing(b, b.x, b.z, J.r, 0.2, 1.1, '#ffd9b0', { r1: J.r * 0.9, dur: 0.3, width: 0.35 });
      A.burst('dust', b.x, 0.2, b.z, { count: 9, scale: 1.6 }); flour(A, b.x, 0.3, b.z, 12, 3);
      A.sfx('slam', { x: b.x, z: b.z, vol: 0.5, pitch: 0.9 }); A.sfx('clank', { x: b.x, z: b.z, vol: 0.4, pitch: 0.7 }); A.shake(0.2);
    }
    st.land = Math.max(0, 1 - (t - J.l) / 0.4);
  }
  function newStep(b, S, c, l, h, r, maxD) {
    const A = BOSSDAV.api, sp = A.approachSpot(b, maxD);
    const J = { c, l, h, r, x0: b.x, z0: b.z, x1: sp.x, z1: sp.z, up: 0, down: 0 };
    J.mark = A.fx('telegraph', sp.x, sp.z, r, l, '#ff3b2a'); J.zm = zoneMark(sp.x, sp.z, r, '#ff3b2a', l + 0.4);   // ses: "kırmızı daire"
    if (J.mark) (S.marks || (S.marks = [])).push(J.mark);
    return J;
  }
  const inCone = (A, ox, oz, a, L, ha) => {
    const dx = A.P.pos.x - ox, dz = A.P.pos.z - oz, d = Math.hypot(dx, dz);
    return d < L + 0.3 && d > 0.2 && Math.abs(angDiff(a, Math.atan2(dx, dz))) < ha + Math.atan2(0.35, Math.max(1, d));
  };
  function balloonAlive() { return !!(typeof GAME !== 'undefined' && GAME.enemies.some(e => !e.dead && e.type === 'unBalonu')); }
  const MOVES = {
    // Taş Adım (Kefir 'slam'): Feza'nın yanındaki kırmızı daire ≥2 sn önceden belli, Bekçi oraya "güm" diye basar.
    adim(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) { b.did = 1; S.J = newStep(b, S, 0.7, 2.1, 1.5, 2.4, 7.0); }
      if (t < 0.7) faceTo(b, S.J.x1, S.J.z1, 6, dt);
      stepJump(b, S, t, S.J, A);
      if (t >= b.phD) { b.y = 0; b.st.air = 0; b.st.land = 0; S.n++; clearMarks(S); A.bossEnd(b, 1.3, 1.2); }
    },
    // Un Fışkırtma (Kefir 'geyser'): yerde beyaz üçgen (koni) 2,3 sn belli; sonra göbek penceresinden un fışkırır.
    fiskir(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT, AT = S.stage === 1 ? 2.4 : 2.2, L = 7.5, HA = 0.42;
      if (b.did === 0) {
        b.did = 1; faceTo(b, A.P.pos.x, A.P.pos.z, 20, 1); S.fa = Math.atan2(A.P.pos.x - b.x, A.P.pos.z - b.z);
        S.fx0 = b.x + Math.sin(S.fa) * b.r * 0.7; S.fz0 = b.z + Math.cos(S.fa) * b.r * 0.7;
        S.tm = triMark(S.fx0, S.fz0, S.fa, L, HA, '#ffffff', AT + 0.6, 0.34);   // ses: "beyaz üçgen"
        // TELEG: tek işaret (triMark); telegraphCone ikinci çizimi kaldırıldı
        A.sfx('sigh', { x: b.x, z: b.z, pitch: 0.6, vol: 0.6 });
      }
      if (t < AT) b.face = S.fa;
      if (b.did === 1 && t > 0.3 && t < AT && (S.inT = (S.inT || 0) - dt) <= 0) { S.inT = 0.09; const a = rnd(0, TAU), r = rnd(1.2, 2.4); A.emitP(S.fx0 + Math.sin(a) * r, 1.4 + rnd(-0.3, 0.5), S.fz0 + Math.cos(a) * r, -Math.sin(a) * r * 1.5, 0, -Math.cos(a) * r * 1.5, 0.5, 0.2, 0.05, '#fff4dc', '#ffffff', 2, 0, 0); }
      if (b.did === 1 && t >= AT) {
        b.did = 2; shut(S.tm); A.sfx('whoosh', { x: b.x, z: b.z, pitch: 0.6 }); A.sfx('bubblePop', { x: b.x, z: b.z, pitch: 0.5 }); A.shake(0.22);
        for (let k = 0; k < 40; k++) { const u = rnd(0.1, 1), a = S.fa + rnd(-HA, HA) * u; A.emitP(S.fx0, 1.5, S.fz0, Math.sin(a) * u * 11, rnd(0.2, 1.4), Math.cos(a) * u * 11, rnd(0.5, 0.8), 0.45, 0.2, '#fff8e8', '#ffffff', 2, 0, 0); }
        if (inCone(A, S.fx0, S.fz0, S.fa, L, HA)) A.hurtPlayer(b.dmg * 0.4, S.fx0, S.fz0, 0.6);
      }
      if (t >= b.phD) { S.n++; clearMarks(S); A.bossEnd(b, 1.4, 1.3); }
    },
    // Un Bulutu Dansı (Kefir 'bubbles'): iki ardışık sıra; her sırada yerde 4 küçük beyaz nokta yelpaze gibi (2,0 sn uyarı), aralarından geçilir.
    dans(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; S.dots = []; S.hit = false;
        const base = Math.atan2(A.P.pos.x - b.x, A.P.pos.z - b.z);
        [[3.4, 0.72, 0.0, 2.0], [5.2, 0.55, 2.2, 4.2]].forEach(([R, da, t0, tp], k) => {
          const a0 = base + (k % 2 ? 0.18 : -0.18);
          for (let i = -1.5; i <= 1.5; i += 1) { const a = a0 + i * da, x = b.x + Math.sin(a) * R, z = b.z + Math.cos(a) * R; if (A.isFloor(x, z)) S.dots.push({ x, z, t0, tp, on: false, done: false, m: null }); }
        });
      }
      faceTo(b, A.P.pos.x, A.P.pos.z, 2, dt);
      for (const d of S.dots) {
        if (!d.on && t >= d.t0) { d.on = true; d.m = zoneMark(d.x, d.z, 0.6, '#ffffff', d.tp - d.t0 + 0.35, 0.4); }   // TELEG: nokta başına tek işaret (zoneMark), iki sıra ardışık (≥2,0 sn)
        if (d.on && !d.done && t >= d.tp) {
          d.done = true; shut(d.m); A.fx('ring', d.x, d.z, { r0: 0.3, r1: 1.2, dur: 0.4, color: '#ffffff', width: 0.4 }); flour(A, d.x, 0.3, d.z, 7, 1.6);
          if (!S.hit && Math.hypot(A.P.pos.x - d.x, A.P.pos.z - d.z) < 0.95) { S.hit = true; A.hurtPlayer(b.dmg * 0.3, d.x, d.z, 0.3); }
        }
      }
      if (b.did === 1 && t > 0.9) { b.did = 2; A.sfx('bell', { x: b.x, z: b.z, pitch: 0.6, vol: 0.5 }); }
      if (t >= b.phD) { S.n += 2; clearMarks(S); A.bossEnd(b, 1.4, 1.3); }
    },
    // Çark Dönüşü (Kefir 'spout'): yerde yavaş dönen mavi çizgiler (çarkın kanatları), 2 sn önceden; sonra çark süpürür.
    cark(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT, L = 6.8, AT = 2.2;
      if (b.did === 0) {
        b.did = 1; S.a0 = Math.atan2(A.P.pos.x - b.x, A.P.pos.z - b.z) + 0.4; S.cm = []; S.cx = b.x; S.cz = b.z; S.hitT = 0;
        for (let i = 0; i < 4; i++) S.cm.push(laneMark(S.cx, S.cz, S.cx + Math.sin(S.a0 + i * PI / 2) * L, S.cz + Math.cos(S.a0 + i * PI / 2) * L, 1.1, '#3a8cff', 5.4, 0.3));   // ses: "mavi çizgi"
      }
      faceTo(b, A.P.pos.x, A.P.pos.z, 1.2, dt);
      const sw = t < AT ? 0 : clamp((t - AT) / 1.6, 0, 1), ang = S.a0 + sm(sw) * 1.5;
      S.cx = b.x; S.cz = b.z;
      for (let i = 0; i < 4; i++) { const m = S.cm[i]; if (!m) continue; const a = ang + i * PI / 2; m.g.position.set(S.cx + Math.sin(a) * L / 2, 0.07, S.cz + Math.cos(a) * L / 2); m.g.rotation.y = a; if (!m.on) m.on = false; m.t = Math.min(m.t, 4.0); }
      if (t >= AT && t < AT + 1.7 && (S.hitT -= dt) <= 0) {
        for (let i = 0; i < 4; i++) { const a = ang + i * PI / 2, dx = A.P.pos.x - S.cx, dz = A.P.pos.z - S.cz, along = dx * Math.sin(a) + dz * Math.cos(a), side = Math.abs(dx * Math.cos(a) - dz * Math.sin(a));
          if (along > 0.5 && along < L + 0.4 && side < 0.95) { A.hurtPlayer(b.dmg * 0.35, S.cx, S.cz, 0.5); S.hitT = 1.2; break; } }
      }
      if (t >= AT && b.did === 1) { b.did = 2; A.sfx('whoosh', { x: b.x, z: b.z, pitch: 0.5 }); }
      if (b.did === 2 && (S.wT = (S.wT || 0) - dt) <= 0) { S.wT = 0.12; const i = (Math.random() * 4) | 0, a = ang + i * PI / 2, d = rnd(1, L); A.emitP(S.cx + Math.sin(a) * d, 0.4, S.cz + Math.cos(a) * d, 0, 0.8, 0, 0.5, 0.25, 0.05, '#cfe6ff', '#ffffff', 2, 0, 0); }
      if (t >= b.phD) { for (const m of S.cm) shut(m); S.cm = null; S.n += 2; clearMarks(S); A.bossEnd(b, 1.5, 1.4); }
    },
    // Un Balonu (kıkırdama molası): derin nefes, dev balon üfler; iki vuruşla "pof!"
    balon(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      faceTo(b, A.P.pos.x, A.P.pos.z, 3, dt);
      if (b.did === 0) { b.did = 1; A.sfx('sigh', { x: b.x, z: b.z, pitch: 0.7 }); }
      if (b.did === 1 && t > b.phD * 0.45) {
        b.did = 2; const m = A.muzzle(b);
        try { const e = GAME.spawnEnemy('unBalonu', m.x + Math.sin(b.face) * 1.2, m.z + Math.cos(b.face) * 1.2, { pack: 'bossadds' }); if (e) { e.bornAt = performance.now(); e.xp = 0; e.gold = 0; } } catch (err) { console.warn('[degirmen] balon', err); }
        A.sfx('whoosh', { x: b.x, z: b.z, pitch: 0.8 }); A.sfx('bubble', { x: m.x, z: m.z, pitch: 0.7 }); flour(A, m.x, m.y, m.z, 10, 2);
      }
      if (t >= b.phD) A.bossEnd(b, 1.2, 1.0);
    },
    // Balon patlayınca: üç hapşırık, sersemler (6 sn); vuruş fırsatı
    hapsu(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT, k = Math.floor(t / (b.phD / 3));
      if ((S.hk ?? -1) < k && k < 3 && t > 0.01 && ((t % (b.phD / 3)) / (b.phD / 3)) > 0.5) { S.hk = k; const m = A.muzzle(b); flour(A, m.x, m.y, m.z, 14, 3); A.sfx('whoosh', { x: b.x, z: b.z, pitch: 0.9, vol: 0.6 }); A.shake(0.1); if (k === 0) A.ftext(b.x, b.height + 0.4, b.z, 'Hapşu!', 'word'); }
      if (b.did === 0) { b.did = 1; S.hk = -1; }
      if ((S.zT = (S.zT || 0) - dt) <= 0) { S.zT = 0.7; A.burst('star', b.x + Math.sin(b.face) * 0.2, b.height + 0.35, b.z + Math.cos(b.face) * 0.2, { count: 3, color: '#fff3a0' }); }
      if (t >= b.phD) { S.hk = -1; A.bossEnd(b, 1.0, 0.9); }
    },
  };
  if (typeof BOSSDAV !== 'undefined' && BOSSDAV && BOSSDAV.register) {
    BOSSDAV.register('degirmenBekcisi', {
      hpK: 2.4, keep: 5.4, roarD: 2.0, isaretKendi: true,
      asamalar: [0.66, 0.33], asamaSoz: { 2: 'b04_asama2', 3: 'b04_asama3' }, kikirdama: 1.8,
      choose(b, S) {
        const A = BOSSDAV.api;
        S.stage = S.stage || 1; S.n = S.n || 0;
        if (S.stunNow) { S.stunNow = false; A.bossPhase(b, 'hapsu', 6.0); return; }
        if (S.stage >= 2 && A.gt - (S.lastBalon === undefined ? -99 : S.lastBalon) > 22 && !balloonAlive()) { S.lastBalon = A.gt; A.bossPhase(b, 'balon', 2.8); return; }
        const opts = S.stage === 1 ? [['adim', 0.5], ['fiskir', 0.5]] : S.stage === 2 ? [['adim', 0.25], ['fiskir', 0.25], ['dans', 0.5]] : [['adim', 0.2], ['fiskir', 0.3], ['cark', 0.5]];
        const ph = A.pickPhase(b, opts);
        A.bossPhase(b, ph, { adim: 2.7, fiskir: 3.4, dans: 4.8, cark: 4.4 }[ph]);
      },
      moves: MOVES,
      hints: { adim: 'b04_boss_adim', fiskir: 'b04_boss_fiskir', dans: 'b04_boss_dans', cark: 'b04_boss_cark', balon: 'b04_balon', hapsu: 'b04_hapsu' },
      hit(b, amount, o, S) { if (b.ph === 'hapsu') amount = Math.round(amount * 1.25); if (S && !S.ikramSaid && (b.hp - amount) / b.maxHp <= 0.14) { S.ikramSaid = true; const A = BOSSDAV.api; if (A && A.hasLine('b04_ikram')) A.say('b04_ikram', 3); } return amount; },
      update(dt) {
        zoneTick(dt);
        if (typeof GAME === 'undefined') return;
        const b = GAME.boss;
        if (b && b.type === 'degirmenBekcisi' && b.ph === 'summon' && !HZ.sumSaid) { HZ.sumSaid = true; const A = BOSSDAV.api; if (A && A.hasLine('b04_boss_cagir')) A.say('b04_boss_cagir', 3, { interrupt: true }); }
        for (const e of GAME.enemies) if (e.type === 'unBalonu' && !e.dead && e.bornAt && performance.now() - e.bornAt > 16000) { e.noStun = true; e.bornAt = 0; GAME.damage(e, e.hp + 1, { force: true }); }
      },
    });
  }
  const HZ = { sumSaid: false };

  // ════════════════ Olaylar ════════════════
  function hook() {
    if (typeof GAME === 'undefined' || !GAME || !GAME.on) { setTimeout(hook, 250); return; }
    GAME.on('zone', () => { zoneClear(); HZ.sumSaid = false; });
    GAME.on('happy', e => {
      if (!e) return;
      if (e.boss && e.type === 'degirmenBekcisi') { const b = GAME.boss; if (b && b.type === e.type) b.dieDur = 7.0; return; }
      if (e.type === 'unBalonu' && !e.noStun) {
        const b = GAME.boss; if (b && b.dv && !b.dead && b.type === 'degirmenBekcisi') b.dv.stunNow = true;
        try { FX.burst('sparkle', e.x, 1.0, e.z, { color: '#fff4dc', count: 12 }); } catch (err) { /* yok */ }
      }
    });
  }
  hook();
  return { zoneMark, laneMark, triMark, zoneClear };
})();
