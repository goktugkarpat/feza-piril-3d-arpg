/* ── EJDERHA ailesi (Feza ve Pırıl: Büyük Fener) ──
   Kaynak: Huysuz Ejderha gövdesi (05_enemies.js › EMODEL.build('ejderha') / babyDragon) — kendi renk sistemimizle (tepe rengi yeniden boyanır).
   BAĞIMLILIK: 05_enemies.js'ten SONRA yüklenir (EMODEL). Üçgen: anne ≈ 24k, yavru ≈ 6k, yumurta ≈ 1,5k (bütçe: ejderha ≤ 25k).
   API
     EJDERHA.anne()           → { root, model, update(dt), renk(0..1), durum(ad), height, dispose() }
         renk(0)  = tanımadan önce soluk GRİ-İNCİ (sisle gri soluk)      renk(1) = tanımadan sonra MOR (tek istisna)
         durum('yorgun')  kıvrılmış, uykulu · 'saskin' büyük yuvarlak gözler, şaşkın "o" ağız (iç çeker) · 'normal' ·
               'tanima' oturur, elleri göğüste, mutlu yavaş göz kırpma · KIZGIN YÜZ YOK (yüz her zaman yorgun/şaşkın/yumuşak)
     EJDERHA.renk(t)          → son oluşturulan annenin rengi (motor için kısayol); EJDERHA.renkSure(t, sn) yumuşak geçiş başlatır
     EJDERHA.yumurta(i)       → { root, update(dt), kir(), dispose() } benekli yumurta (i = 0..2 renk: krem/mint/şeftali), sallanır
     EJDERHA.yavru(opt)       → { root, model, update(dt, hareket, saldiri), renk(t), dispose() } küçük ejderha (varsayılan krem-şeftali)
     EJDERHA.uykulu(tur)      → { root, update(dt), height, dispose() }  tur: 'su' (turkuaz) | 'toprak' (amber) | 'ates' (Ateş Dede: turuncu-kırmızı pastel)
                                gözler kapalı, yavaş nefes, kıvrılmış uyur
     EJDERHA.PIRIL_PARCALARI  → PIRIL3D'nin yapı parçaları gelince `EJDERHA.pirilGovde(parcalar)` ile bağlanır (şimdilik kendi gövde yapıcımız)  */
const EJDERHA = (() => {
  'use strict';
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const sstep = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const _c = new THREE.Color(), _o = {}, _p = {}, _wp = new THREE.Vector3();
  // ── boyama ──
  // Özgün renk (mor) → aile rengi: aynı canlılık düzeni korunur (gölgeler koyu, karın/boynuz açık), tepe ve lekeler yakın tonlara gider.
  const AILE = {
    inci:   { h: 0.60, sm: 0.13, lm: 1.03, la: 0.045, hs: 0.0 },    // soluk gri-inci
    mor:    null,                                                  // özgün
    su:     { h: 0.49, sm: 0.80, lm: 1.05, la: 0.04, hs: 0.18 },    // su turkuazı
    toprak: { h: 0.105, sm: 0.78, lm: 1.02, la: 0.03, hs: 0.18 },   // toprak amberi
    ates:   { h: 0.035, sm: 0.88, lm: 1.04, la: 0.035, hs: 0.35 },  // Ateş Dede: turuncu-kırmızı pastel
    krem:   { h: 0.09, sm: 0.35, lm: 1.10, la: 0.06, hs: 0.2 },     // yavru: krem-şeftali
  };
  function boyaKur(model) {
    let mesh = model.mesh; if (!mesh) model.root.traverse(o => { if (!mesh && o.isSkinnedMesh) mesh = o; });
    const g0 = mesh.geometry, g = g0.clone();   // paylaşılan önbelleği bozma
    mesh.geometry = g;
    const col = g.attributes.color, orig = Float32Array.from(col.array), n = col.count;
    const hsl0 = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { _c.setRGB(orig[i * 3], orig[i * 3 + 1], orig[i * 3 + 2]).getHSL(_o); hsl0[i * 3] = _o.h; hsl0[i * 3 + 1] = _o.s; hsl0[i * 3 + 2] = _o.l; }
    const own = { g, col, orig, hsl0, n, last: '' };
    own.uygula = (a, b, t) => {   // a, b = aile adı ya da null (özgün); t: 0 → a, 1 → b
      const key = a + '|' + b + '|' + t.toFixed(3); if (key === own.last) return; own.last = key;
      const A = a && AILE[a], B = b && AILE[b];
      const f = fam => (i, out) => {
        const h0 = hsl0[i * 3], s0 = hsl0[i * 3 + 1], l0 = hsl0[i * 3 + 2];
        if (!fam || ((h0 > 0.93 || h0 < 0.04) && s0 > 0.3 && l0 < 0.35)) { out.r = orig[i * 3]; out.g = orig[i * 3 + 1]; out.b = orig[i * 3 + 2]; return; }
        const hh = fam.h + (h0 - 0.745) * fam.hs * (s0 > 0.18 ? 1 : 0), ss = Math.min(1, s0 * fam.sm), ll = Math.min(0.97, l0 * fam.lm + fam.la);
        _c.setHSL((hh + 1) % 1, ss, ll); out.r = _c.r; out.g = _c.g; out.b = _c.b;
      };
      const fa = f(A), fb = f(B), pa = { r: 0, g: 0, b: 0 }, pb = { r: 0, g: 0, b: 0 }, arr = col.array;
      for (let i = 0; i < n; i++) {
        fa(i, pa); if (t <= 0) { arr[i * 3] = pa.r; arr[i * 3 + 1] = pa.g; arr[i * 3 + 2] = pa.b; continue; }
        fb(i, pb); arr[i * 3] = pa.r + (pb.r - pa.r) * t; arr[i * 3 + 1] = pa.g + (pb.g - pa.g) * t; arr[i * 3 + 2] = pa.b + (pb.b - pa.b) * t;
      }
      col.needsUpdate = true;
    };
    own.dispose = () => g.dispose();
    return own;
  }
  const ST = () => ({ phase: 'idle', phaseT: 0, move: 0, windup: -1, attack: -1, roar: -1, breath: -1, hurt: 0, frozen: false, dying: -1, aggro: true });

  // ── ANNE ejderha ──
  let sonAnne = null;
  function anneEski(opt = {}) {
    const m = EMODEL.build('ejderha', {});
    // yüz: model 'grumpy' = oyuncu/yumuşak (iri gözler, kalkık kaş); kızgın bakış yok. Yorgunluk/şaşkınlık durum() ile gelir.
    const boya = boyaKur(m), st = ST();
    const S = { renk: opt.renk ?? 0, hedef: null, hal: 'yorgun', phaseClock: 0, t: 0 };
    const root = new THREE.Group(); root.name = 'anneEjderha'; root.add(m.root);
    boya.uygula('inci', null, clamp01(S.renk));
    function renk(t) { S.renk = clamp01(t); S.hedef = null; boya.uygula('inci', null, S.renk); }
    function durum(ad) {
      S.hal = ad; S.phaseClock = 0; st.aggro = true; st.phase = 'idle'; st.phaseT = 0;
      if (ad === 'yorgun') st.aggro = false;
      else if (ad === 'saskin') st.phase = 'sigh';
      else if (ad === 'tanima') st.phase = 'charmed';
    }
    durum(opt.durum || 'yorgun');
    function update(dt) {
      S.t += dt; S.phaseClock += dt;
      if (S.hedef) { S.hedef.t += dt; const u = clamp01(S.hedef.t / S.hedef.sn); S.renk = S.hedef.a + (S.hedef.b - S.hedef.a) * sstep(u); boya.uygula('inci', null, S.renk); if (u >= 1) S.hedef = null; }
      if (S.hal === 'saskin') { st.phaseT = (S.phaseClock % 3.2) / 3.2; }       // iç çekme döngüsü (3,2 sn)
      else if (S.hal === 'tanima') { st.phaseT = Math.min(.5, S.phaseClock / 8); }   // oturmuş, ellerini kavuşturmuş kalır
      m.anim(dt, st);
    }
    const api = { root, model: m, update, renk, durum, get renkDegeri() { return S.renk; }, get height() { return m.height; },
      renkSure(b, sn = 2) { S.hedef = { a: S.renk, b: clamp01(b), t: 0, sn }; },
      dispose() { if (root.parent) root.parent.remove(root); m.dispose(); boya.dispose(); if (sonAnne === api) sonAnne = null; } };
    sonAnne = api; return api;
  }

  // ── Benekli yumurta ──
  const YUM = [[0xf4ead0, 0x8fcfb0], [0xcfeede, 0xf0a894], [0xfbe0c8, 0x9bbfe0]];
  let yumGeo = null;
  function yumurta(i = 0) {
    if (!yumGeo) {
      const pts = [], N = 26; for (let k = 0; k <= N; k++) { const a = k / N * Math.PI, y = -Math.cos(a), r = Math.sin(a); const sc = 1 - 0.18 * (y + 1) / 2 * 0.0; pts.push(new THREE.Vector2(r * (0.9 - 0.12 * y) * 0.3, (y * 0.5 + 0.5) * 0.46)); }
      yumGeo = new THREE.LatheGeometry(pts, 28);
    }
    const g = yumGeo.clone(), pos = g.attributes.position, cols = new Float32Array(pos.count * 3), P = YUM[i % YUM.length], base = new THREE.Color(P[0]), spot = new THREE.Color(P[1]);
    let sd = 7 + i * 13; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const dots = []; for (let k = 0; k < 16; k++) dots.push([rnd() * 6.283, rnd() * 0.44, 0.03 + rnd() * 0.045]);
    for (let v = 0; v < pos.count; v++) {
      const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v), a = Math.atan2(z, x); let k = 0;
      for (const d of dots) { const da = Math.atan2(Math.sin(a - d[0]), Math.cos(a - d[0])) * Math.hypot(x, z); const dd = Math.hypot(da, y - d[1]); if (dd < d[2]) k = Math.max(k, 1 - sstep(dd / d[2] * 1.2 - 0.2)); }
      _c.copy(base).lerp(spot, k * 0.85); cols[v * 3] = _c.r; cols[v * 3 + 1] = _c.g; cols[v * 3 + 2] = _c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 });
    const mesh = new THREE.Mesh(g, mat); mesh.castShadow = true;
    const root = new THREE.Group(); root.name = 'ejderhaYumurtasi'; root.add(mesh);
    let t = Math.random() * 6, nudge = 0;
    return { root, mesh, update(dt) { t += dt; const w = Math.sin(t * 2.2) * 0.035 * (0.4 + 0.6 * Math.max(0, Math.sin(t * 0.45))) + nudge * Math.sin(t * 14) * 0.08; nudge *= Math.exp(-3 * dt); mesh.rotation.z = w; mesh.rotation.x = 0.5 * w; },
      kir() { nudge = 1; }, get height() { return 0.46; }, dispose() { if (root.parent) root.parent.remove(root); g.dispose(); mat.dispose(); } };
  }

  // ── Yavru ejderha ──
  function yavruEski(opt = {}) {
    const m = EMODEL.babyDragon(), boya = boyaKur(m), aile = opt.aile || 'krem', S = { renk: 0, aile };
    const root = new THREE.Group(); root.name = 'yavruEjderha'; root.add(m.root);
    const uy = () => boya.uygula(S.aile, null, 0);
    // mor ↔ aile: renk(0) = yavru rengi (krem-şeftali), renk(1) = mor (Pırıl'a benzer, anne tanıma sonrası)
    function renk(t) { S.renk = clamp01(t); boya.uygula(S.aile, null, 0); if (S.renk > 0) boya.uygula(S.aile, 'mor', S.renk); }
    renk(opt.renk || 0);
    return { root, model: m, renk, update(dt, hareket = false, saldiri = false) { m.anim(dt, hareket, saldiri); }, get height() { return 0.9; },
      dispose() { if (root.parent) root.parent.remove(root); m.dispose(); boya.dispose(); } };
  }

  // ── Uykulu büyük ejderhalar (Su / Toprak / Ateş Dede) ──
  function uykuluEski(tur = 'su') {
    const m = EMODEL.build('ejderha', {}); m.setMood('happy'); const boya = boyaKur(m), st = ST(); st.aggro = false;
      // modelin 'mutlu' yüzü: gülen kapalı gözler (uykulu-sevimli); kalpler aşağıda gizlenir   // kıvrılmış, yan yatmış yorgun duruş
    boya.uygula(tur in AILE ? tur : 'su', null, 0);
    const root = new THREE.Group(); root.name = 'uykuluEjderha_' + tur; root.add(m.root);
    let t = Math.random() * 5;
    function update(dt) {
      t += dt; m.anim(dt, st);
      const B = m.B, br = 0.5 + 0.5 * Math.sin(t * 0.9);      // yavaş nefes (~7 sn)
      if (B.mouth) B.mouth.scale.set(0.55, 0.3, 1);                      // küçük, sakin gülümseme
      if (B.joy) B.joy.scale.setScalar(0.0001);                         // kalp parıltısı yok: tek sakin uyku yüzü
      if (B.chest) B.chest.scale.setScalar(1 + 0.045 * br);
      if (B.body) B.body.scale.set(1 + 0.02 * br, 1 + 0.03 * br, 1 + 0.02 * br);
      if (B.head) B.head.rotation.x += 0.1 * br - 0.05;
    }
    update(0.016);
    return { root, model: m, update, get height() { return m.height; }, dispose() { if (root.parent) root.parent.remove(root); m.dispose(); boya.dispose(); } };
  }

  // ═══ G5: Pırıl ailesi — ejderhalar Pırıl'ın sevimli peluş gövdesinden türer (aynı yüz, kanat, kuyruk; farklı palet/boy) ═══
  const PAL = {
    inci:   { lash: 0x3d4152, pur: 0xb7bac6, purL: 0xdee0e8, purD: 0x8a8fa2, line: 0x585c72, lime: 0xe8e3d4, limeL: 0xf5f1e6, limeD: 0xc4bea9, crest: 0x8da0b4, crestL: 0xb4c4d3, crestD: 0x6a7b8e, blush: 0xe8b6c4 },
    su:     { lash: 0x1d4f66, pur: 0x45c2c6, purL: 0x8ee6e4, purD: 0x2a8e9a, line: 0x1a5a68, lime: 0xd2f4f2, limeL: 0xeafaf8, limeD: 0xa4d8d6, crest: 0x2f74b8, crestL: 0x5a9ad6, crestD: 0x1f4f84, blush: 0xffa8b8 },
    toprak: { lash: 0x5a3a18, pur: 0xd9a24a, purL: 0xf0cd85, purD: 0xa8742a, line: 0x6b4619, lime: 0xf8e8bb, limeL: 0xfff4d6, limeD: 0xd8bf88, crest: 0x6e903c, crestL: 0x93b560, crestD: 0x4b6a24, blush: 0xff9f88 },
    ates:   { lash: 0x6a2a1c, pur: 0xf08a5a, purL: 0xffb890, purD: 0xc4573a, line: 0x7a3320, lime: 0xffe3ac, limeL: 0xfff1d0, limeD: 0xe6bd80, crest: 0xd24f3c, crestL: 0xee7a60, crestD: 0x9c3326, blush: 0xff8f9e },
    krem:   { lash: 0x6a4630, pur: 0xf3d0b0, purL: 0xfce6d2, purD: 0xd4a888, line: 0x8a5a40, lime: 0xfff1c0, limeL: 0xfff8de, limeD: 0xe6d08e, crest: 0x9ccf7a, crestL: 0xbce39c, crestD: 0x6ea352, blush: 0xff9fb8 },
  };
  const KANAT = { inci: 0xcfd3de, su: 0xa8f0ee, toprak: 0xf5d99a, ates: 0xffc29a, krem: 0xfde3cc };
  // model: Pırıl'dan türeyen dolgu; birimi yerde (ayak = 0). boyut: Pırıl'a göre çarpan. ay: aile adı. mor: renk(1) hedefi var mı
  function pirilAile(ay, boyut, opt = {}) {
    const m = PIRIL.create({ palet: PAL[ay], kanatRenk: KANAT[ay] });
    const g = new THREE.Group(); g.name = 'pirilAile_' + ay; g.add(m.root);
    if (m.golge) m.golge(false); if (m.isik) m.isik(opt.isik == null ? 2 : opt.isik);
    const S = { renk: 0, t: 0 }, A = [], B = [];
    let mor = null;
    if (opt.mor) {
      mor = PIRIL.create({}); mor.update(0, {});
      m.meshes.forEach((me, k) => { me.geometry = me.geometry.clone(); const ca = me.geometry.attributes.color, cb = mor.meshes[k].geometry.attributes.color; A.push(Float32Array.from(ca.array)); B.push(Float32Array.from(cb.array)); });
    }
    // kanat zarı dokusu: aile renginde boyanır (mor yalnız Pırıl'da); renk(1) = özgün mor doku
    let kanatDok = null, kanatSon = -1;
    try {
      const wm = (m.meshes.find(x => x.material && x.material.map && x.material.transparent) || {}).material, img = wm && wm.map && wm.map.image;
      if (img && img.width) {
        const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
        const d0 = cx.getImageData(0, 0, cv.width, cv.height), orig = Uint8ClampedArray.from(d0.data), hx = PAL[ay].purL;
        let tr = (hx >> 16) & 255, tg = (hx >> 8) & 255, tb = hx & 255; const tl = .3 * tr + .59 * tg + .11 * tb; tr /= tl; tg /= tl; tb /= tl;
        const tex = new THREE.CanvasTexture(cv); tex.colorSpace = wm.map.colorSpace; tex.flipY = wm.map.flipY; tex.anisotropy = wm.map.anisotropy;
        kanatDok = t => { if (Math.abs(t - kanatSon) < .02 && t !== 0 && t !== 1) return; kanatSon = t; const o = d0.data;
          for (let i = 0; i < o.length; i += 4) { const L = .3 * orig[i] + .59 * orig[i + 1] + .11 * orig[i + 2];
            o[i] = L * tr + (orig[i] - L * tr) * t; o[i + 1] = L * tg + (orig[i + 1] - L * tg) * t; o[i + 2] = L * tb + (orig[i + 2] - L * tb) * t; o[i + 3] = orig[i + 3]; }
          cx.putImageData(d0, 0, 0); tex.needsUpdate = true; };
        wm.map = tex; kanatDok(0);
      }
    } catch (e) { kanatDok = null; }
    const wingMats = []; m.root.traverse(o => { if (o.isMesh && !o.isSkinnedMesh && o.material && o.material.map && !wingMats.includes(o.material)) wingMats.push(o.material); });
    const tintA = new THREE.Color(KANAT[ay]);
    function renkUygula(t) {
      S.renk = clamp01(t); if (kanatDok) kanatDok(mor ? S.renk : 0); if (!mor) return;
      m.meshes.forEach((me, k) => { const ca = me.geometry.attributes.color, a = A[k], b = B[k], arr = ca.array, n = Math.min(arr.length, a.length, b.length); for (let i = 0; i < n; i++) arr[i] = a[i] + (b[i] - a[i]) * S.renk; ca.needsUpdate = true; });
    }
    const gec = { v: null };
    function guncelle(dt, durum) {
      S.t += dt;
      if (gec.v) { gec.v.t += dt; const u = clamp01(gec.v.t / gec.v.sn); renkUygula(gec.v.a + (gec.v.b - gec.v.a) * sstep(u)); if (u >= 1) gec.v = null; }
      m.update(dt, durum);
      g.position.y = -m.ayakYuksekligi() * boyut + (opt.yerY || 0); g.scale.setScalar(boyut);
    }
    guncelle(.016, {});
    return { g, m, S, gec, renkUygula, guncelle, dispose() { if (g.parent) g.parent.remove(g); m.dispose(); if (mor) mor.dispose(); } };
  }
  function anne(opt = {}) {
    if (typeof PIRIL === 'undefined') return anneEski(opt);
    const K = pirilAile('inci', 3.5, { mor: true, isik: 3 }), root = new THREE.Group(); root.name = 'anneEjderha'; root.add(K.g);
    const S = { hal: 'yorgun', clock: 0 };
    K.renkUygula(opt.renk ?? 0);
    // Anne tanıma dizisi: (0) irkilme: kocaman gözler, eller yanakta → (1,4) merakla bir adım öne → (2,8) gözler dolar: mutluluk gözyaşı → (4,6) sarılma; sonra gözyaşlı-gülümseyen bekleyiş.
    // Her adım Pırıl duyguları (m.duygu) ile; süre uzun tutulur ki dizi kesintisiz aksın.
    const adim = {};
    function tanimaDizisi(t) {
      const m = K.m, sh = (k, a, b, ad, sn) => { if (t >= a && t < b && !adim[k]) { adim[k] = 1; m.duygu(ad, sn); } };
      sh('a', 0, 1.2, 'saskin', 1.5); sh('b', 1.4, 3, 'merak', 1.4); sh('c', 2.7, 6, 'gozyasi', 99); sh('d', 4.4, 9, 'sarilma', 3.2); sh('e', 8.0, 12, 'sarilma', 99);
      const adimK = Math.max(0, Math.min(1, (t - 1.4) / 1.5)), e = adimK * adimK * (3 - 2 * adimK);
      K.g.position.z = .55 * e * K.g.scale.x * .5 + .06 * Math.sin(Math.min(t, 3) * 8) * (t > 1.4 && t < 3 ? 1 : 0);
      K.g.rotation.z = .035 * Math.sin(t * 1.4) * e;
      K.g.position.y += .05 * (Math.sin(t * 1.4) * .5 + .5) * e;
    }
    function durum(ad) { S.hal = ad; S.clock = 0; for (const k in adim) delete adim[k]; if (K.m.duyguDur) K.m.duyguDur();
      if (ad === 'tanima') { try { if (typeof GAME !== 'undefined' && GAME.Bilbo && GAME.Bilbo.dizi) GAME.Bilbo.dizi('tanima'); } catch (e) { /* yok */ } } }
    durum(opt.durum || 'yorgun');
    function update(dt) {
      S.clock += dt; const t = S.clock;
      const st = { speed: 0 };
      if (S.hal === 'yorgun') { st.sit = 1; }
      else if (S.hal === 'saskin') { st.sit = 0; st.happy = 0; const ph = (t % 3.2) / 3.2; if (ph > .55 && ph < .85) st.bark = .5; }   // iç çekme: şaşkın, ağız "o"
      else if (S.hal === 'tanima') { st.happy = t > 2.6 ? 1 : 0; }
      else { st.happy = .3; }
      K.m.uyu(false);
      K.guncelle(dt, st);
      if (S.hal === 'tanima') tanimaDizisi(t); else { K.g.rotation.z = 0; K.g.position.z = 0; }
    }
    const api = { root, model: K.m, update, renk: t => { K.gec.v = null; K.renkUygula(t); }, durum, get renkDegeri() { return K.S.renk; }, get height() { return 2.9; },
      renkSure(b, sn = 2) { K.gec.v = { a: K.S.renk, b: clamp01(b), t: 0, sn }; },
      dispose() { if (root.parent) root.parent.remove(root); K.dispose(); if (sonAnne === api) sonAnne = null; } };
    sonAnne = api; return api;
  }
  function yavru(opt = {}) {
    if (typeof PIRIL === 'undefined') return yavruEski(opt);
    const ay = opt.aile || 'krem', K = pirilAile(ay, .78, { mor: true, isik: 1 }), root = new THREE.Group(); root.name = 'yavruEjderha'; root.add(K.g);
    K.g.position.y = 0;
    K.renkUygula(opt.renk || 0);
    return { root, model: K.m, renk: t => K.renkUygula(t), get height() { return .9; },
      update(dt, hareket = false, saldiri = false) { K.guncelle(dt, { speed: hareket ? 2.2 : 0, pounce: saldiri ? 1 : 0, happy: .4 }); },
      dispose() { if (root.parent) root.parent.remove(root); K.dispose(); } };
  }
  function uykulu(tur = 'su') {
    if (typeof PIRIL === 'undefined') return uykuluEski(tur);
    const ay = tur in PAL ? tur : 'su', K = pirilAile(ay, 3.2, { isik: 2 }), root = new THREE.Group(); root.name = 'uykuluEjderha_' + tur; root.add(K.g);
    let t = Math.random() * 5;
    let birik = 0, kare = 0;
    function update(dt) {
      t += dt;
      // performans: uzaktaki (>70 m) uyuyan dede gizlenir ve güncellenmez; yakındakinin iskeleti 2 karede bir güncellenir (uyku yavaştır, görünüm aynı)
      if (typeof camera !== 'undefined' && camera && root.parent) { const d = camera.position.distanceTo(root.getWorldPosition(_wp)); if (d > 70) { root.visible = false; return; } root.visible = true; }
      birik += dt; if ((++kare & 1) && !K.ilk) return; K.ilk = false;
      K.m.uyu(true); const dd = birik; birik = 0; K.guncelle(dd, { speed: 0 }); K.g.scale.y = 3.2 * (1 + .025 * Math.sin(t * .9)); }
    K.ilk = true; update(.016);
    return { root, model: K.m, update, get height() { return 2.5; }, dispose() { if (root.parent) root.parent.remove(root); K.dispose(); } };
  }
  return { anne, yumurta, yavru, uykulu, AILE,
    renk: t => { if (sonAnne) sonAnne.renk(t); }, renkSure: (t, sn) => { if (sonAnne) sonAnne.renkSure(t, sn); },
    pirilGovde: null, PIRIL_PARCALARI: null, get aktifAnne() { return sonAnne; } };
})();
