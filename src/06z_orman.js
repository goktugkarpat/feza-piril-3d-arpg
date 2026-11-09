/* ── Bölüm 3: Huysuz Orman (Feza ile Pırıl: Büyük Fener) ──
   Sessiz Sis koca ormanı yutmuş. Baba kamp ateşini yakar, Kartal gökte sönük fenerin üstünde daire çizer, Baba yere dalla ok çizer,
   Pırıl ışık nefesiyle feneri yakar, sis duvarı alçalır. YANLIŞ YOL YOK (Kartal'ı izlemek hep doğru). Dört fener = dört sis duvarı.
     1. Kamp Açıklığı     Baba'yla buluşma, kamp ateşi, ilk jöleler (geçit açık)
     2. Sisli Çam Yolu    1. fener fidanı (Çam Yolu → Mantar Çayırı sis duvarı)
     3. Mantar Çayırı     zıplatan mantarlar, 2. fener → SÜRPRİZ: Kartal Feza'yı kaldırır (sis denizi, atlanabilir)
     4. Baykuşun Ağacı    3. fener (Baykuş'un sesi geri gelir), dinlenme ateşi (marşmelov, can dolar)
     5. Goblin Köprüsü    4. (son) fener → Kral'ın bahçesi
     Arena: Kral'ın Jöle Bahçesi — Kral Jöle (src/05z_orman.js); Baba ve Kartal kenardan izler.
   Zemin/ağaç/mantar dekoru motorun orman temasından gelir (zengin görünüm: kaynaktaki Huysuz Orman); burada yalnız kurSon ile
   kamp, fener fidanları, sis duvarları, Baba, Kartal, zıplatan mantarlar eklenir. MOR YOK. Otomatik yardım: Baba (25 sn) ve Kartal
   (30 sn) yalnız zor durumda: can < %50 ya da 4+ düşman yakında; aralarında ≥ 6 sn; hasar yok, yalnız sersemletme/geri itme.
   Genel ad: ORMAN. Cümleler: src/02l_orman.js (b03_...). TODO: COMPANION kancası (MOTOR2) ve sinematik kancası gelince onlara geç. */
const ORMAN = (() => {
  'use strict';
  const PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  const G_ = () => (typeof GAME !== 'undefined' ? GAME : null);
  const OK = () => typeof ODAKIT !== 'undefined' && ODAKIT;
  const live = () => { const g = G_(); return !!(g && g.state === 'play' && !g.paused && g.P && !g.P.dead); };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const said = new Set();
  let sayAt = -99;
  // anlatıcı cümlesi (kayıt yoksa susar). once: oyun başına bir kez; arada en az `gap` sn
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

  // ana yola (L.path çizgisi) en kısa uzaklık: yol üstüne engel/oyuncak konmasın
  function yolD(L, x, z) {
    const PT = L.path || []; let d = 1e9;
    for (let i = 1; i < PT.length; i++) { const a = PT[i - 1], b = PT[i], ux = b.x - a.x, uz = b.z - a.z, l2 = ux * ux + uz * uz || 1, t = clamp(((x - a.x) * ux + (z - a.z) * uz) / l2, 0, 1); d = Math.min(d, hyp(a.x + ux * t - x, a.z + uz * t - z)); }
    return d;
  }

  // ════════════════ Yerleşim (saf veri) ════════════════
  function yerlesim(L, api) {
    // köy meydanı yok (kamp açıklığı var)
    if (L.village) { L.village = null; L.solids = (L.solids || []).filter(s => !['well', 'lamp', 'bed', 'fence', 'house', 'sign'].includes(s.tag)); }
    const A = L.areas || [];
    const mainRooms = a => (A[a] ? A[a].rooms.filter(ri => L.rooms[ri] && L.rooms[ri].kind !== 'side') : []);
    const areaOf = {}; A.forEach((a, k) => { if (!a.boss) a.rooms.forEach(ri => { areaOf[ri] = k; }); });
    // Nazik öğretim: kamp odası boş; alan başına tür listesi ve grup sınırı
    const LIST = [['ormanJole'], ['ormanJole', 'ormanMantar', 'ormanJole'], ['ormanMantar', 'ormanYarasa', 'palamutKasif', 'ormanJole'],
      ['sisPamugu', 'ormanJole', 'ormanMantar', 'ormanYarasa'], ['ormanGoblin', 'sisPamugu', 'palamutKasif', 'ormanGoblin']];
    const CAP = [3, 3, 4, 3, 4], packN = {}, keep = [];
    for (const sp of L.spawns || []) {
      const ai = areaOf[sp.room];
      if (sp.room === 0) continue;
      if (ai === undefined) { keep.push(sp); continue; }
      const n = packN[sp.pack] = (packN[sp.pack] || 0) + 1;
      if (n > CAP[Math.min(ai, CAP.length - 1)]) continue;
      const list = LIST[Math.min(ai, LIST.length - 1)];
      sp.type = list[(n - 1 + sp.pack) % list.length];
      if (ai === 0) sp.elite = false;
      if (sp.elite && sp.type !== 'ormanJole' && sp.type !== 'ormanGoblin') sp.type = ai >= 3 ? 'ormanGoblin' : 'ormanJole';
      delete sp.variant;
      keep.push(sp);
    }
    L.spawns.length = 0; L.spawns.push(...keep);
    const spot = (cx, cz, rmin, rmax, r = 1.2, tries = 60) => {
      for (let t = 0; t < tries; t++) {
        const a = api.rnd() * TAU, d = rmin + api.rnd() * (rmax - rmin), x = cx + Math.sin(a) * d, z = cz + Math.cos(a) * d;
        if (api.isFloor(x, z) && api.circleFree(x, z, r)) return { x, z };
      }
      return null;
    };
    const rm0 = L.rooms[0];
    // kamp ateşi: başlangıcın yakınında (Baba yanında)
    const st = L.start || { x: rm0.x, z: rm0.z };
    L.orKamp = null;
    for (const yd of [2.6, 0]) for (const [dx, dz] of [[2.7, -3.9], [-2.7, -3.9], [3.3, -2.4], [-3.3, -2.4], [3.8, -3.6], [-3.8, -3.6], [4.2, 1.5], [-4.2, 1.5], [0, -5]]) { const x = st.x + dx, z = st.z + dz; if (!L.orKamp && api.isFloor(x, z) && api.circleFree(x, z, 1.6) && yolD(L, x, z) >= yd && (!L.npc || hyp(L.npc.x - x, L.npc.z - z) > 3.8)) L.orKamp = { x, z }; }   // (önce yolun kenarında: Feza ateşin içinden yürümesin; QA dikey ekran: önce ileride ve ortaya yakın → ateş ve Baba ekranda kalır)
    if (!L.orKamp) L.orKamp = spot(st.x, st.z, 3.2, 5.2, 1.6) || { x: st.x + 3, z: st.z - 3 };
    // dinlenme ateşi: Baykuş'un ağacı alanında (4. alan)
    { const rm = L.rooms[mainRooms(3)[0]]; L.orKamp2 = rm ? spot(rm.x, rm.z, 2.5, Math.max(3, rm.r * 0.5), 1.8) : null; }
    // fener fidanları: alan 1..4'ün son ana odasında, çıkış geçidinin 4 m önünde
    L.orF = [];
    for (let a = 1; a <= 4; a++) {
      const gate = A[a + 1] && A[a + 1].gate, mr = mainRooms(a), rm = L.rooms[mr[mr.length - 1]];
      if (!gate || !rm) continue;
      let dx = gate.x - rm.x, dz = gate.z - rm.z; const dl = hyp(dx, dz) || 1; dx /= dl; dz /= dl;
      let p = null;
      for (let d = 4.4; d <= 9 && !p; d += 0.8) { const x = gate.x - dx * d, z = gate.z - dz * d; if (api.isFloor(x, z) && api.circleFree(x, z, 0.7)) p = { x, z }; }
      if (!p) p = spot(rm.x, rm.z, 1, Math.max(2, rm.r * 0.5), 0.8) || { x: rm.x, z: rm.z };
      L.orF.push({ x: p.x, z: p.z, area: a, gate: { x: gate.x, z: gate.z } });
    }
    // zıplatan mantarlar: 3. alan (Mantar Çayırı) odalarında üçlü halka
    // (QA takılma: mantar halkası yolun üstündeydi; Feza yürürken mantara basıp GERİYE fırlıyor, dönünce yine basıp sonsuz döngüde
    //  kalıyordu. Artık mantarlar ana yoldan ≥ 3.4 m uzakta, oda kenarında küçük bir oyun köşesinde; yoldan geçen çocuk hiç basmaz.)
    L.orPads = [];
    const yolUzak = (x, z, m) => yolD(L, x, z) >= m;
    const padOk = (x, z) => api.isFloor(x, z) && api.circleFree(x, z, 1.1) && yolUzak(x, z, 3.4) && !L.orF.some(f => hyp(f.x - x, f.z - z) < 3.5) &&
      !(L.areas || []).some(a => a.gate && hyp(a.gate.x - x, a.gate.z - z) < 4.5);
    for (const k of [0, 1]) {
      const rm = L.rooms[mainRooms(2)[k]]; if (!rm) continue;
      let grp = [];
      for (let t = 0; t < 24 && grp.length < 3; t++) {   // halka merkezi: oda içinde yoldan uzak bir köşe; yarıçap küçük
        const c = t ? spot(rm.x, rm.z, 1.5, Math.max(2.5, rm.r * 0.75), 1.5, 20) : { x: rm.x, z: rm.z }; if (!c) continue;
        const a0 = api.rnd() * TAU, R = 2.6, g = [];
        for (let i = 0; i < 3; i++) { const a = a0 + i / 3 * TAU, x = c.x + Math.sin(a) * R, z = c.z + Math.cos(a) * R; if (padOk(x, z)) g.push({ x, z }); }
        if (g.length > grp.length) grp = g;
      }
      if (grp.length >= 2) grp.forEach((p, i) => L.orPads.push({ x: p.x, z: p.z, to: grp[(i + 1) % grp.length], g: k }));
    }
    // Kral'ın bahçesi: kenarda minik kamp ateşi (Baba ve Kartal oradan izler)
    { const ar = L.rooms[L.rooms.length - 1 - L.rooms.filter(r => r.kind === 'side').length] || L.rooms.filter(r => r.kind !== 'side').pop();
      L.orArena = ar ? { x: ar.x, z: ar.z, r: ar.r || 11 } : null;
      if (ar) { let p = null; for (let d = 0.8; d >= 0.4 && !p; d -= 0.08) for (const sg of [1, -1]) { const x = ar.x + sg * (ar.r || 11) * d, z = ar.z - 1; if (!p && api.isFloor(x, z) && api.circleFree(x, z, 1.2)) p = { x, z }; } L.orArenaKamp = p; } }
  }

  // ════════════════ Görsel parçalar ════════════════
  const GM = {};   // paylaşılan geometri / malzeme
  const geo = (k, f) => GM[k] || (GM[k] = f());
  const mbasic = (k, o) => GM[k] || (GM[k] = new THREE.MeshBasicMaterial(Object.assign({ fog: false }, o)));
  const mstd = (k, o) => GM[k] || (GM[k] = new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.7 }, o)));
  // kamp ateşi: taş halka, kütükler, alev (yanınca görünür), sıcak ışık
  // üç dilli alev geometrisi: ortada uzun damla + iki yanda kısa, dışa eğik iki dil (tek geometri: çizim sayısı aynı)
  function flame3Geo(drop) {
    return geo('flDrop3', () => {
      const parts = [[0, 0, 0, 1, 1], [0.17, 0, -0.42, 0.62, 0.7], [-0.16, 0, 0.4, 0.58, 0.64]], pos = [], idx = [];
      const m4 = new THREE.Matrix4(), v = new THREE.Vector3(), src = drop.attributes.position, sidx = drop.index;
      for (const [ox, oz, rz, sxz, sy] of parts) {
        m4.compose(new THREE.Vector3(ox, 0, oz * 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rz)), new THREE.Vector3(sxz, sy, sxz));
        const base = pos.length / 3;
        for (let i = 0; i < src.count; i++) { v.fromBufferAttribute(src, i).applyMatrix4(m4); pos.push(v.x, v.y, v.z); }
        if (sidx) for (let i = 0; i < sidx.count; i++) idx.push(base + sidx.getX(i)); else for (let i = 0; i < src.count; i++) idx.push(base + i);
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere(); return g;
    });
  }
  // ateşten yükselen minik kıvılcımlar: tek Points çizimi, hareket tamamen gölgelendiricide (yalnız ateş yanarken ve ekrandayken çizilir)
  function sparkMat() {
    return new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uK: { value: 0 }, uScale: GM.ptScale || { value: 400 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: `attribute vec3 aR; uniform float uT, uK, uScale; varying float vA;
        void main() { float t = fract(uT * (0.32 + aR.x * 0.22) + aR.y); vec3 p = position;
          p.x += sin(aR.z * 6.28 + t * 4.0) * (0.12 + 0.3 * t); p.z += cos(aR.z * 5.1 + t * 3.0) * (0.12 + 0.3 * t); p.y += 0.25 + t * 2.1;
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          vA = uK * smoothstep(0.0, 0.12, t) * (1.0 - t); gl_PointSize = (0.07 + 0.05 * aR.x) * (1.0 - 0.5 * t) * uScale / max(0.5, -mv.z); }`,
      fragmentShader: `varying float vA; void main() { vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; float a = (1.0 - smoothstep(0.2, 1.0, r)) * vA; if (a < 0.01) discard;
          gl_FragColor = vec4(mix(vec3(1.0, 0.55, 0.15), vec3(1.0, 0.92, 0.6), 1.0 - r) * a, a); }` });
  }
  function campfire(api, x, z, o = {}) {
    const rnd = api.rnd, sc = o.scale || 1;
    GM.ptScale = GM.ptScale || api.B.ptScale;
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, s = 0.2 * sc * (0.8 + rnd() * 0.5); api.ball(x + Math.sin(a) * 0.72 * sc, s * 0.6, z + Math.cos(a) * 0.72 * sc, s * 1.2, s * 0.8, s, i % 2 ? 0x9a968c : 0x7d7a72); }
    // GÜZELLİK (tur 1): köşeli kutu odunlar → yuvarlak kütükler, uçlarında açık renkli kesik halka (birleşik süs: çizim yok)
    { const cyl = geo('cyl10', () => new THREE.CylinderGeometry(1, 1, 1, 10));
      for (let i = 0; i < 3; i++) { const yaw = i / 3 * PI + 0.3, ca = Math.cos(yaw), sa = Math.sin(yaw), L = 1.2 * sc, r = 0.1 * sc, y = (0.1 + 0.035 * i) * sc;
        api.put(cyl, x, y, z, r, L, r, i % 2 ? 0x6a4526 : 0x7b5430, yaw, 0, PI / 2);
        for (const e of [-1, 1]) api.put(cyl, x + ca * e * L * 0.5, y, z - sa * e * L * 0.5, r * 0.82, 0.02 * sc, r * 0.82, 0xd9b07a, yaw, 0, PI / 2); } }
    // (iPad titreme: kare kül plakası 0.055'te, ışık diski 0.045'te üst üsteydi → yuvarlak kül tümseği; ışık diski açıkça üstünde)
    api.ball(x, 0.0, z, 0.62 * sc, 0.06, 0.62 * sc, 0x3b2e24);
    const fg = new THREE.Group(); fg.position.set(x, 0.18 * sc, z); fg.visible = false; api.add(fg);
    // yumuşak damla şekilli 4 katmanlı alev (dışta turuncu, içte sarı-krem); dıştaki iki katman üç dilli (çizgi film ateşi)
    const drop = geo('flDrop', () => new THREE.LatheGeometry([[0, 0], [0.2, 0.03], [0.3, 0.18], [0.29, 0.38], [0.2, 0.6], [0.1, 0.78], [0.03, 0.9], [0, 0.96]].map(p => new THREE.Vector2(p[0], p[1])), 14));
    const drop3 = flame3Geo(drop);
    const cols = [0xff7a22, 0xff9e30, 0xffc548, 0xfff0a8], flames = [];
    for (let i = 0; i < 4; i++) {
      const m = mbasic('fl' + i, { color: cols[i], transparent: true, opacity: [0.62, 0.72, 0.86, 0.95][i], depthWrite: false });   // (katmanlar derinlik yazmaz: içteki sarı çekirdek görünür)
      const q = new THREE.Mesh(i < 2 ? drop3 : drop, m), a0 = i * 1.7;
      if (i === 1) q.rotation.y = 1.1;
      q.userData = { sx: (1.15 - i * 0.22) * sc, sy: (1.0 - i * 0.14) * sc, a0, ox: i === 0 ? 0 : Math.sin(a0) * 0.1 * sc, oz: i === 0 ? 0 : Math.cos(a0) * 0.1 * sc };
      q.position.set(q.userData.ox, 0, q.userData.oz); q.renderOrder = 3 + i; fg.add(q); flames.push(q);
    }
    // minik kıvılcımlar (alevle birlikte görünür/gizlenir)
    const NS = 14, sp = [], sr = [];
    let hs = 7919; const hr = () => { hs = (hs * 16807) % 2147483647; return hs / 2147483647; };   // (yerel sayı üreteci: bölümün ortak rastgele sırası değişmesin)
    for (let i = 0; i < NS; i++) { sp.push((hr() - 0.5) * 0.34 * sc, 0, (hr() - 0.5) * 0.34 * sc); sr.push(hr(), hr(), hr()); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); sg.setAttribute('aR', new THREE.Float32BufferAttribute(sr, 3));
    sg.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.3, 0), 1.9);
    const smt = sparkMat(), sparks = new THREE.Points(sg, smt); sparks.renderOrder = 8; fg.add(sparks); api.dispose(sg); api.dispose(smt);
    api.light(x, 1.3 * sc, z, 0xffa245, 0, 9, 1);
    const le = api.B.lights[api.B.lights.length - 1];
    const disc = new THREE.Mesh(geo('disc', () => new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2)), new THREE.MeshBasicMaterial({ map: haloTex(), color: 0xffa850, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    disc.position.set(x, 0.11, z); disc.scale.setScalar(9 * sc); disc.renderOrder = 1; api.add(disc); api.dispose(disc.material);
    const h = { x, z, lit: false, k: 0, set(on) { h.lit = on; } };
    api.anim((dt) => {
      h.k += ((h.lit ? 1 : 0) - h.k) * Math.min(1, dt * 3.2);
      fg.visible = h.k > 0.04; le.int = 2.1 * h.k; disc.material.opacity = 0.32 * h.k; disc.visible = h.k > 0.02;   // (PERF: sönük ateşin görünmez ışık diski çizilmez)
      if (fg.visible) { const t = performance.now() / 1000; smt.uniforms.uT.value = t % 1000; smt.uniforms.uK.value = 0.9 * h.k; flames.forEach((q, i) => { const u = q.userData, w = Math.sin(t * (7 + i * 2.3) + u.a0), hop = 0.9 + 0.14 * w + 0.06 * Math.sin(t * 19 + i); q.scale.set(u.sx * (1 - 0.06 * w), u.sy * hop * h.k, u.sx * (1 - 0.06 * w)); q.rotation.z = 0.06 * Math.sin(t * 5 + u.a0); q.position.x = u.ox + 0.04 * Math.sin(t * 6 + i); }); }
    });
    return h;
  }

  // fener fidanı: ahşap direk, cam fener (sönükken soluk), yerde altın halka; yanınca sıcak ışık
  function fener(api, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); api.add(g);
    const wood = mstd('fWood', { color: 0x8a5a32 }), leafM = mstd('fLeaf', { color: 0x4f9a46 }), orange = mstd('fOr', { color: 0xe0762a, roughness: 0.5 });
    const add = (gm, m, px, py, pz, s, r) => { const q = new THREE.Mesh(gm, m); q.position.set(px, py, pz); if (s) q.scale.set(s[0], s[1], s[2]); if (r) q.rotation.set(r[0], r[1], r[2]); q.castShadow = true; g.add(q); return q; };
    const cyl = geo('cyl8', () => new THREE.CylinderGeometry(1, 1, 1, 8)), sph = geo('sph10', () => new THREE.SphereGeometry(1, 10, 8)), box = geo('box1', () => new THREE.BoxGeometry(1, 1, 1));
    // PERF+güzellik: direk, kol, filizler, kafes çubukları, çatı ve taban artık birleşik süs (fener başına 16 → 4 çizim); yalnız cam, ampul,
    // halka ve hale ayrı (onlar yanınca değişir). Direğin dibinde küçük toprak tümseği ve iki yaprak; çatıda minik tepelik.
    void add; void wood; void leafM; void orange;
    const P = (gm, px, py, pz, sx, sy, sz, c, ry = 0, rx = 0, rz = 0) => api.put(gm, x + px, py, z + pz, sx, sy, sz, c, ry, rx, rz);
    // GÜZELLİK (tur 1): fener çok küçüktü (ince direk, 30 cm'lik kutu) ve oyun kamerasından zor seçiliyordu. Artık gerçek bir fidan:
    // kalın gövde, tepede yapraklı küçük taç, tacın içinden çıkan kıvrık dal ve dala asılı ~1,4 kat büyük, yuvarlak çatılı fener.
    // Hepsi yine birleşik süs (fazladan çizim yok); yalnız cam, ampul, halka ve hale ayrı.
    const BARK = 0x8a5a32, LEAF = [0x4f9a46, 0x5aae4c, 0x66b850], FR = 0xe0762a;
    P(cyl, 0, 0.75, 0, 0.12, 1.5, 0.12, BARK);   // gövde (alt, kalın)
    P(cyl, 0.02, 2.05, 0, 0.085, 1.2, 0.085, BARK, 0, 0, -0.05);   // gövde (üst, ince, hafif eğik)
    P(sph, 0, 0.03, 0, 0.2, 0.12, 0.2, BARK);   // gövde dibi (kök)
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.5; P(sph, Math.sin(a) * 0.24, 0.12 + 0.05 * i, Math.cos(a) * 0.24, 0.2, 0.1, 0.11, LEAF[i % 3], a, 0, 0.4); }   // fidan filizleri
    for (let i = 0; i < 3; i++) { const a = i * 2.2 + 1.1; P(sph, Math.sin(a) * 0.12, 1.0 + 0.42 * i, Math.cos(a) * 0.12, 0.2, 0.06, 0.11, LEAF[(i + 1) % 3], a, 0, 0.5); }   // gövdeden çıkan yapraklar
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; P(sph, Math.sin(a) * 0.2, 2.68 + 0.06 * (i % 2), Math.cos(a) * 0.2, 0.26, 0.13, 0.17, LEAF[i % 3], a, 0, 0.35); }   // tepede yaprak tacı
    P(sph, 0, 2.78, 0, 0.17, 0.15, 0.17, LEAF[1]);
    P(sph, 0, 0, 0, 0.5, 0.11, 0.5, 0x6a5232);   // dipte toprak tümseği
    const cx = 0.5, cy = 2.02;
    P(cyl, 0.25, 2.66, 0, 0.045, 0.5, 0.045, BARK, 0, 0, PI / 2);   // tacın içinden çıkan dal
    P(sph, cx, 2.66, 0, 0.06, 0.06, 0.06, BARK);   // dal ucu
    P(cyl, cx, 2.56, 0, 0.014, 0.2, 0.014, 0x5a4030);   // askı
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) P(box, cx + sx * 0.23, cy, sz * 0.23, 0.06, 0.74, 0.06, FR);   // kafes çubukları
    P(geo('cone12', () => new THREE.ConeGeometry(1, 1, 12)), cx, cy + 0.5, 0, 0.36, 0.26, 0.36, FR);   // çatı
    P(sph, cx, cy + 0.38, 0, 0.33, 0.05, 0.33, FR);   // çatı kenarı (yumuşak saçak)
    P(sph, cx, cy + 0.68, 0, 0.07, 0.07, 0.07, 0xffc548);   // çatı tepeliği
    P(box, cx, cy - 0.39, 0, 0.54, 0.07, 0.54, FR);   // taban
    P(sph, cx, cy - 0.46, 0, 0.1, 0.07, 0.1, FR);   // tabanın altındaki minik top
    const cage = new THREE.Group(); cage.position.set(cx, cy, 0); g.add(cage);
    const glassM = new THREE.MeshStandardMaterial({ color: 0xf4ead0, roughness: 0.15, transparent: true, opacity: 0.45, emissive: 0xffb030, emissiveIntensity: 0, depthWrite: false });
    const bulbM = new THREE.MeshStandardMaterial({ color: 0x6a5a44, roughness: 0.5, emissive: 0xffb030, emissiveIntensity: 0 });
    const q1 = new THREE.Mesh(box, glassM); q1.scale.set(0.42, 0.68, 0.42); q1.renderOrder = 2; cage.add(q1);   // (cam çubukların biraz içinde: kenarlar çakışıp titremesin)
    const q2 = new THREE.Mesh(sph, bulbM); q2.scale.setScalar(0.17); cage.add(q2);
    const ring = new THREE.Mesh(geo('ring', () => new THREE.RingGeometry(0.95, 1.2, 40).rotateX(-PI / 2)), new THREE.MeshBasicMaterial({ color: 0xffcf4a, transparent: true, opacity: 0.6, depthWrite: false, fog: false }));
    ring.position.set(0, 0.06, 0); g.add(ring);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: 0xffd070, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    halo.scale.setScalar(2.8); halo.position.set(cx, cy, 0); halo.visible = false; g.add(halo);   // (PERF: sönükken gizli; görünmez hale de çizim sayılıyordu)
    api.light(x + cx, cy, z, 0xffc060, 0, 8, 0.3);
    const le = api.B.lights[api.B.lights.length - 1];
    const h = { x, z, g, lit: false, k: 0, bulbM, glassM, ring, halo, le, cageX: cx, cageY: cy };
    api.dispose(glassM); api.dispose(bulbM); api.dispose(halo.material);
    return h;
  }
  function haloTex() {
    if (GM.haloT) return GM.haloT;
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.userData = { keep: true }; return (GM.haloT = t);
  }

  // sis duvarı: koridoru kapatan inci beyazı pamuk bulutları (tek Points çizimi); uOpen 0..1 alçalıp erir
  // (QA: engel 0.25'te kalkıyor ama bulut 0.6'ya dek koyu kalıyordu → Feza beyaz bulutun içinde kayboluyordu; artık ~1.3 sn'de tümüyle erir)
  function sisDuvari(api, L, gate) {
    const THREE_ = api.THREE;
    let dx = 0, dz = -1;
    if (OK() && ODAKIT.gateDir) { try { [dx, dz] = ODAKIT.gateDir(L, gate); } catch (e) { /* yok */ } }
    const nx = -dz, nz = dx;
    let lo = 0, hi = 0;
    for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(gate.x + nx * o, gate.z + nz * o)) hi = o; else break; }
    for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(gate.x - nx * o, gate.z - nz * o)) lo = o; else break; }
    const w0 = -lo - 0.8, w1 = hi + 0.8, rnd = api.rnd, pos = [], ph = [], sz = [];
    // (iPad/QA: alttaki iri bulut topları yerin içine giriyordu → bulutun altı cetvelle kesilmiş gibi düz çizgiydi. Artık 5 sıra;
    //  alttakiler küçük, boyut yüksekliğe göre sınırlı (gölgelendiricide); bulut yere yumuşakça oturur)
    for (let o = w0; o <= w1 + 0.01; o += 0.55) for (let r = 0; r < 5; r++) {
      const jx = (rnd() - 0.5) * 0.5, jd = (rnd() - 0.5) * 0.8;
      pos.push(gate.x + nx * (o + jx) + dx * jd, 0.22 + r * 0.42 + rnd() * 0.25, gate.z + nz * (o + jx) + dz * jd); ph.push(rnd()); sz.push(1.5 + rnd() * 0.9);
    }
    const g = new THREE_.BufferGeometry();
    g.setAttribute('position', new THREE_.Float32BufferAttribute(pos, 3)); g.setAttribute('aPh', new THREE_.Float32BufferAttribute(ph, 1)); g.setAttribute('aSz', new THREE_.Float32BufferAttribute(sz, 1));
    const u = { uOpen: { value: 0 }, uTime: { value: 0 }, uScale: api.B.ptScale };
    // GÜZELLİK (tur 1): eskiden her top kenara doğru çok erken (yarıçapın %35'inde) soluyordu → duvar bulanık beyaz bir leke gibiydi.
    // Artık her top küçük bir pamuk yumağı: üstü sıcak beyaz ve aydınlık, altı inci rengi gölgeli, kenarı yumuşak ama belirgin
    // (aynı tek çizim; gölgelendiricide yalnız birkaç çarpma).
    const m = new THREE_.ShaderMaterial({
      uniforms: u,
      vertexShader: `attribute float aPh; attribute float aSz; uniform float uOpen, uTime, uScale; varying float vA; varying float vS;
        void main() { vec3 p = position; p.y = p.y * (1.0 - uOpen * 0.9) - uOpen * 0.2; p.x += sin(uTime * 0.7 + aPh * 6.28) * 0.12; p.z += cos(uTime * 0.6 + aPh * 5.0) * 0.12;
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSz * clamp((p.y + 0.12) / 1.2, 0.3, 1.0) * uScale / max(0.5, -mv.z);
          vA = 0.94 * (1.0 - smoothstep(0.0, 0.4, uOpen)); vS = 0.95 + 0.05 * sin(aPh * 20.0); }`,
      fragmentShader: `varying float vA; varying float vS; void main() { vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; if (r > 1.0) discard;
          float a = (1.0 - smoothstep(0.62, 1.0, r)) * vA; if (a < 0.01) discard;
          vec3 n = vec3(d.x * 2.0, -d.y * 2.0, sqrt(max(0.0, 1.0 - r * r)));
          float l = clamp(0.66 + 0.5 * dot(n, vec3(-0.35, 0.72, 0.6)), 0.0, 1.0);
          vec3 c = mix(vec3(0.9, 0.9, 0.88), vec3(1.0, 1.0, 0.97), l) * vS;
          gl_FragColor = vec4(c, a); }`,
      transparent: true, depthWrite: false });
    const pts = new THREE_.Points(g, m); pts.renderOrder = 4; pts.name = 'orman-sis';
    // PERF: dört sis duvarının dördü de her kare çiziliyordu (frustumCulled=false); artık ekranda olmayan duvar çizilmez
    g.computeBoundingSphere(); if (g.boundingSphere) g.boundingSphere.radius += 2.5;
    api.add(pts); api.dispose(g); api.dispose(m);
    // çarpışma: koridoru kapatan dairesel engeller (açılınca alive=false)
    const solids = [];
    for (let o = w0 + 0.3; o <= w1 - 0.3 + 0.01; o += 0.8) { const so = { x: gate.x + nx * o, z: gate.z + nz * o, r: 0.7, alive: true, tag: 'sis' }; L.solids.push(so); solids.push(so); }
    L._sh = null;
    return { pts, u, solids, open: 0, state: 'closed', x: gate.x, z: gate.z, dx, dz, w0, w1 };
  }

  // zıplatan mantar (basınca ezilir)
  function zipMantar(api, x, z, col) {
    const g = new THREE.Group(); g.position.set(x, 0, z); api.add(g);
    const stem = new THREE.Mesh(geo('cyl8', () => new THREE.CylinderGeometry(1, 1, 1, 8)), mstd('mStem', { color: 0xf3ead8 })); stem.scale.set(0.34, 0.5, 0.34); stem.position.y = 0.25; g.add(stem);
    const cap = new THREE.Mesh(geo('capH', () => new THREE.SphereGeometry(1, 16, 8, 0, TAU, 0, PI / 2)), mstd('mCap' + col, { color: col, roughness: 0.45 })); cap.scale.set(1.05, 0.55, 1.05); cap.position.y = 0.48; cap.castShadow = true; g.add(cap);
    return { g, cap };
  }

  // ════════════════ Kur (zemin/ağaç dekoru motorun orman temasından; burada bölüme özgü parçalar) ════════════════
  // GÖRÜNÜŞ (tur 1): koyu kahve ok, kahverengi toprak yolda zor seçiliyordu → altında açık krem bir kenar (aynı geometri, köşe renkli: çizim sayısı aynı)
  function chevronGeo() {
    return geo('chev2', () => {
      const xz = [0, 0.6, 0.5, -0.4, 0, -0.12, 0, 0.6, 0, -0.12, -0.5, -0.4], pos = [], col = [];
      const kat = (s, y, hex, oz) => { const c = new THREE.Color(hex); for (let i = 0; i < xz.length; i += 2) { pos.push(xz[i] * s, y, xz[i + 1] * s + oz); col.push(c.r, c.g, c.b); } };
      kat(1.34, 0.015, 0xfff0c8, -0.03); kat(1.0, 0.03, 0x8a5a2a, 0);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
    });
  }
  // rota: L.path boyunca hero'dan lantern'e doğru d metre ilerideki nokta {x,z,dx,dz}
  function pathAhead(L, hx, hz, tx, tz, d) {
    const P = L.path; if (!P || P.length < 2) return null;
    const near = (x, z) => { let bi = 0, bd = 1e9; for (let i = 0; i < P.length; i++) { const q = hyp(P[i].x - x, P[i].z - z); if (q < bd) { bd = q; bi = i; } } return bi; };
    const i0 = near(hx, hz), i1 = near(tx, tz), st = i1 >= i0 ? 1 : -1;
    if (i0 === i1) { const l = hyp(tx - hx, tz - hz) || 1; return { x: hx + (tx - hx) / l * Math.min(d, l), z: hz + (tz - hz) / l * Math.min(d, l), dx: (tx - hx) / l, dz: (tz - hz) / l }; }
    let acc = 0, px = hx, pz = hz;
    for (let i = i0; i !== i1 + st; i += st) {
      const q = P[i], seg = hyp(q.x - px, q.z - pz);
      if (acc + seg >= d || i === i1) { const f = seg > 0 ? Math.min(1, (d - acc) / seg) : 1, x = px + (q.x - px) * f, z = pz + (q.z - pz) * f, l = hyp(x - hx, z - hz) || 1; return { x, z, dx: (x - hx) / l, dz: (z - hz) / l }; }
      acc += seg; px = q.x; pz = q.z;
    }
    return null;
  }

  function kurSon(L, api) {
    const g0 = G_(), A = L.areas || [], T = OK() && ODAKIT.toys ? ODAKIT.toys(api) : null;
    if (typeof DEKOR_BOL === 'function') DEKOR_BOL(L, api, 14, 14000);   // PERF: büyük birleşik dekor parçalarını böl
    // PERF: üçgen/çizim bütçesi için ağaç ve çalı örnekleri seyrelir (ağaçların ~%35'i, çalıların ~%40'ı); boşalan parçalar gizlenir
    try {
      const keep = /seyreksiz/.test(location.search) ? {} : { oak: 0.4, blossom: 0.4, pine: 0.4, lolli: 0.4, bush: 0.25 }, m4 = new api.THREE.Matrix4(), cl = new api.THREE.Color();
      let h = 12345; const rr = () => { h = (h * 16807) % 2147483647; return h / 2147483647; };
      let bulundu = 0;
      const seyrelt = () => (L.group || scene).traverse(o => {
        if (!o.isInstancedMesh || !(o.name in keep) || o.userData._seyrek) return;
        o.userData._seyrek = 1; bulundu++; const n = o.count, ks = [];
        for (let i = 0; i < n; i++) if (rr() < keep[o.name]) ks.push(i);
        if (ks.length === n) return;
        const mats = ks.map(i => { o.getMatrixAt(i, m4); return m4.clone(); }), cols = o.instanceColor ? ks.map(i => { o.getColorAt(i, cl); return cl.clone(); }) : null;
        ks.forEach((_, q) => { o.setMatrixAt(q, mats[q]); if (cols) o.setColorAt(q, cols[q]); });
        o.count = ks.length; o.instanceMatrix.needsUpdate = true; if (o.instanceColor) o.instanceColor.needsUpdate = true;
        if (!ks.length) o.visible = false; else o.computeBoundingSphere();
      });
      // PERF: zemin örtüsünün 22 m'lik parçaları 44 m'lik büyük parçalarda birleştirilir (çizim çağrısı ~3 kat azalır)
      const birlestir = () => {
        const grp = {}; (L.group || scene).traverse(o => { if (o.isInstancedMesh && /^zemin-/.test(o.name) && !o.userData._birl) (grp[o.name] = grp[o.name] || []).push(o); });
        for (const nm in grp) {
          const ms = grp[nm], bins = new Map(), m4 = new api.THREE.Matrix4(), cl = new api.THREE.Color();
          for (const o of ms) for (let i = 0; i < o.count; i++) {
            o.getMatrixAt(i, m4); const key = Math.floor(m4.elements[12] / 66) * 1000 + Math.floor(m4.elements[14] / 66);
            let b = bins.get(key); if (!b) bins.set(key, b = []); const c = new api.THREE.Color(1, 1, 1); if (o.instanceColor) o.getColorAt(i, c); b.push([m4.clone(), c]);
          }
          const o0 = ms[0];
          for (const b of bins.values()) {
            const im = new api.THREE.InstancedMesh(o0.geometry, o0.material, b.length); im.name = nm; im.userData._birl = 1;
            im.castShadow = o0.castShadow; im.receiveShadow = o0.receiveShadow; im.renderOrder = o0.renderOrder;
            b.forEach(([m, c], q) => { im.setMatrixAt(q, m); im.setColorAt(q, c); });
            im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.computeBoundingSphere(); if (im.boundingSphere) im.boundingSphere.radius += 1.5;
            o0.parent.add(im);
          }
          for (const o of ms) { o.parent.remove(o); o.count = 0; }
        }
        return Object.keys(grp).length;
      };
      seyrelt(); let birl = birlestir(); if (!bulundu) { let sn = 0; api.anim(() => { if (sn++ < 600 && (!bulundu || !birl)) { seyrelt(); if (!birl) birl = birlestir(); } }); }
    } catch (e) { console.warn('[orman] seyreltme', e); }
    // şeker baston geçitleri yerine sis duvarları: motorun alan geçitlerini kapat (geçit noktaları L._orGates'te)
    L._orGates = A.map(a => a.gate); for (let k = 1; k < A.length; k++) A[k].gate = null;
    const S = { t: 0, lit: [], lighting: null, lift: null, active: 0, helpB: -99, helpK: -99, helpAt: -99, arrowAt: -30, bump: 0, started: false, campStep: 0, campT: 0, camp2: 0, camp2T: 0, owl: 0, bossPh: '', arenaSeen: false };

    // (E234) çevre süsleri: uzak ağaç katmanları, kütük/eğrelti/mantar/çiçek kümeleri, tabelalar (src/07m_dekor_orman.js)
    if (typeof ORMAN_DEKOR !== 'undefined' && typeof EKIT !== 'undefined' && !/dekorsiz/.test(location.search)) {
      try {
        const av = []; const ad = (o, r) => { if (o) av.push({ x: o.x, z: o.z, r }); };
        ad(L.orKamp, 7.5); ad(L.orKamp2, 4.5); ad(L.orArenaKamp, 3); (L.orF || []).forEach(f => { ad(f, 3.2); ad(f.gate, 4); }); (L.orPads || []).forEach(p => ad(p, 2.4)); (L._orGates || []).forEach(g => ad(g, 4.5));
        if (L.orArena) ad(L.orArena, L.orArena.r * 0.8);   // (QA: arenada koca kütükler Kral Jöle'nin içinden geçiyordu) dövüş alanı açık, yalnız kenar süslü
        ORMAN_DEKOR.olustur(L, api, { avoid: av });
      } catch (e) { console.warn('ORMAN_DEKOR', e); }
    }
    // ── kamp (1. alan): ateş, çadır, kütük oturaklar ──
    const K = L.orKamp, fire = K ? campfire(api, K.x, K.z) : null;
    // GÜZELLİK (tur 1): oturaklar düz kahverengi silindirdi (teneke kutu gibi) → kök ayaklı, üstü halkalı gerçek kütük kesitleri (birleşik süs)
    const stool = (x, z, i, c) => {
      if (typeof EKIT !== 'undefined' && EKIT.stump) { try { api.put(EKIT.stump(i % 3), x, 0, z, 1.25, 1.12, 1.25, 0xcfae90, i * 1.9 + 0.4, 0, 0, 'shiny'); return; } catch (e) { /* yedek */ } }
      api.cyl(x, 0.2, z, 0.28, 0.4, c); api.ball(x, 0.405, z, 0.25, 0.035, 0.25, 0xb98a55);   // (kesik yüz kenarı silindir kapağıyla çakışmasın)
    };
    if (K) {
      [[-1.9, 0.3, 0x7b5430], [1.5, 1.2, 0x6a4526], [0.2, 1.9, 0x7b5430]].forEach(([dx, dz, c], i) => stool(K.x + dx, K.z + dz, i, c));
      // çadır: dört yüzlü piramit, kenarda
      const tent = api.tmp(new THREE.ConeGeometry(1, 1, 4)), sp = L.start || K;
      for (const [dx, dz] of [[-5.2, -2.4], [-5.2, 1.8], [5.2, -2.4], [0.5, -6.0], [-6.5, 0]]) {
        const x = K.x + dx, z = K.z + dz;
        // (QA takılma: çadır yolun üstüne düşüyordu, Feza ona dayanıp kalıyordu → yoldan ≥ 3.6 m uzak; yer yoksa çadır yok)
        if (api.isFloor(x, z) && api.circleFree(x, z, 1.6) && hyp(x - sp.x, z - sp.z) > 4.5 && hyp(x - K.x, z - K.z) > 4 && yolD(L, x, z) > 3.6) { api.put(tent, x, 0.8, z, 1.6, 1.6, 1.6, 0xd9622e, PI / 4);
          // (kapı dik kutuydu: yarısı çadırın içinde, üstü havada → artık çadır yüzüne yaslı, eğik ince kapı)
          { const dg = api.tmp(new THREE.BoxGeometry(1, 1, 1)), R = 1.6 * Math.SQRT1_2, H = 1.6, l = hyp(H, R), yc = 0.42, zf = R * (1 - yc / H);
            api.put(dg, x, yc + 0.06 * R / l, z + zf + 0.06 * H / l, 0.55, 0.9, 0.04, 0x5a2e18, 0, Math.atan2(-R / l, H / l), 0); }
          api.solid(x, z, 1.2, 'tent'); break; }
      }
    }
    // ── fener fidanları + sis duvarları ──
    const F = [], W = [];
    for (const f of L.orF || []) { F.push(fener(api, f.x, f.z)); W.push(sisDuvari(api, L, f.gate)); S.lit.push(false); }
    // ── dinlenme ateşi (4. alan) ve Kral'ın bahçesindeki minik kamp ateşi ──
    const fire2 = L.orKamp2 ? campfire(api, L.orKamp2.x, L.orKamp2.z, { scale: 1.0 }) : null;
    if (L.orKamp2) [[-1.7, 0.4], [1.5, 1.1]].forEach(([dx, dz], i) => stool(L.orKamp2.x + dx, L.orKamp2.z + dz, i + 1, 0x7b5430));
    const fireA = L.orArenaKamp ? campfire(api, L.orArenaKamp.x, L.orArenaKamp.z, { scale: 0.7 }) : null;
    if (fireA) fireA.set(true);
    // ── zıplatan mantarlar ──
    if (T) for (const p of L.orPads || []) {
      const M = zipMantar(api, p.x, p.z, [0xff6a5a, 0xffa23a][p.g % 2]);
      api.glow(p.x, p.z, 1.6, 0xffe8a0, 0.14);
      let sq = 9;
      // (cümle yok: 'b03_mantar_zipla' dere diyordu, dere yok. can: bir zıplamadan sonra 2.5 sn hiçbir mantar fırlatmaz → zincirleme döngü olmaz)
      const it = T.add({ x: p.x, z: p.z, r: 1.05, hint: { y: 1.7 }, line: null, near: 7, cd: 0.6, repeat: true, can: () => S.t - (S.padAt ?? -99) > 2.5,
        use: () => {
          sq = 0; S.padAt = S.t; sfx('bounce', { x: p.x, z: p.z, pitch: 0.95 }); burst('sparkle', p.x, 0.8, p.z, { color: '#ffe9a0', count: 6 });
          const tx = p.to.x, tz = p.to.z, D = hyp(tx - p.x, tz - p.z);
          T.ride({ pts: [[p.x, p.z], [tx, tz]], speed: D / 0.95, y: u => 4 * (2.0 + D * 0.12) * u * (1 - u), end: () => burst('dust', tx, 0.1, tz, { count: 3 }) });
        },
        tick: dt => { sq += dt; const k = sq < 0.6 ? Math.sin(sq * 26) * Math.exp(-sq * 6) : 0; M.cap.scale.set(1.05 * (1 + 0.25 * k), 0.55 * (1 - 0.4 * k), 1.05 * (1 + 0.25 * k)); } });
      void it;
    }

    // ── Baba ve Kartal (YOLDAS modelleri; yoksa görünmez) ──
    let baba = null, kartal = null;
    try { if (typeof BABA !== 'undefined' && BABA.model) { baba = BABA.model(); api.add(baba.root); if (baba.setGear) baba.setGear({ tool: 'none', backpack: true }); } } catch (e) { console.warn('[orman] Baba', e); baba = null; }
    try { if (typeof KARTAL !== 'undefined' && KARTAL.model) { kartal = KARTAL.model(); kartal.root.scale.setScalar(2.0); api.add(kartal.root); } } catch (e) { console.warn('[orman] Kartal', e); kartal = null; }
    // (QA dikey: Baba ateşin Feza tarafında, ekranın içinde el sallar; baykuşun kütüğüne ve oturak kütüklere basmaz)
    const st0 = (() => { if (!K) return { x: L.rooms[0].x, z: L.rooms[0].z }; const sg = (L.start || K).x > K.x ? 1 : -1, nc = L.npc;
      for (const [dx, dz] of [[sg * 1.6, -0.9], [sg * 1.0, 1.0], [sg * 1.8, 0.1], [0, -1.7], [-sg * 1.6, -0.9], [1.5, -0.5]]) { const x = K.x + dx, z = K.z + dz; if (api.isFloor(x, z) && (!nc || (hyp(nc.x - x, nc.z - z) > 2.1 && !(Math.abs(nc.x - x) < 1.5 && z - nc.z > -0.8 && z - nc.z < 4)))) return { x, z }; }
      return { x: K.x + 1.5, z: K.z - 0.5 }; })();
    // (Baba'nın takip yerleri ve dolu yerler: kare başına dizi kurulmasın diye bir kez; Feza'nın tam önü en sonda → Baba'nın başı Feza'yı örtmez)
    const B_OFFS = [[-2.3, 1.5], [2.3, 1.5], [-2.3, -1.5], [2.3, -1.5], [0, -2.7], [0, 2.7]], B_FIRES = [fire, fire2, fireA].filter(Boolean);
    const dolu = (x, z) => { for (const f of F) if (hyp(f.x - x, f.z - z) < 1.9) return true; for (const q of B_FIRES) if (hyp(q.x - x, q.z - z) < 1.7) return true; return false; };
    const B = { x: st0.x, z: st0.z, face: 2.4, speed: 0, mode: 'fire', pose: 'wave', poseT: 0, modeT: 0, tx: st0.x, tz: st0.z };
    const E = { x: st0.x, y: 9, z: st0.z - 6, face: 0, mode: 'circle', ang: 0, bank: 0, passT: -1, px0: 0, pz0: 0, px1: 0, pz1: 0 };
    if (baba) { baba.root.position.set(B.x, 0, B.z); baba.root.rotation.y = B.face; }
    // ok: 3 dal oku
    const arrow = new THREE.Group(); arrow.visible = false; api.add(arrow);
    const arrowM = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, fog: false });
    api.dispose(arrowM);
    const chev = []; for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(chevronGeo(), arrowM); c.renderOrder = 2; c.scale.setScalar(1.15); arrow.add(c); chev.push(c); }
    const arrow2 = [0, 1, 2].map(() => 0);
    let arrowT = -1, arrowPts = null;
    // sis denizi + altın çizgiler (Kartal sürprizi)
    const sea = new THREE.Mesh(geo('plane', () => new THREE.PlaneGeometry(260, 260).rotateX(-PI / 2)), new THREE.MeshBasicMaterial({ color: 0xf6f3ea, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    sea.position.y = 2.6; sea.renderOrder = 6; sea.visible = false; api.add(sea); api.dispose(sea.material);
    let lines = null;
    const mkLines = () => {
      const pts = []; if (K) pts.push(new THREE.Vector3(K.x, 0.5, K.z)); for (const f of F) pts.push(new THREE.Vector3(f.x, 0.5, f.z));
      if (pts.length < 2) return null;
      const gm = new THREE.BufferGeometry().setFromPoints(pts), ln = new THREE.Line(gm, new THREE.LineBasicMaterial({ color: 0xffd060, transparent: true, opacity: 0, fog: false, depthTest: false }));
      ln.renderOrder = 7; ln.visible = false; ln.frustumCulled = false; api.add(ln); api.dispose(gm); api.dispose(ln.material); return ln;
    };
    lines = mkLines();

    const hero = () => g0 && g0.P;
    const flatDist = (a, x, z) => hyp(a.x - x, a.z - z);
    const activeIdx = () => { for (let i = 0; i < F.length; i++) if (!S.lit[i]) return i; return F.length; };
    function ignite(i) {
      S.lit[i] = true; const f = F[i]; f.lit = true; W[i].state = 'opening';
      burst('sparkle', f.x + (f.cageX || 0.34), f.cageY || 2.0, f.z, { color: '#ffd060', count: 16 }); sfx('unlock', { x: f.x, z: f.z });
      say('b03_fener_yandi', { force: true, once: false });
      if (g0 && g0.heal) { try { g0.heal(0.15, true); } catch (e) { /* yok */ } }
      if (i === 1) S.liftAt = S.t + 1.6;
      if (i === 2) setTimeout(() => say('b03_baykus_ses', { force: true }), 900);
    }
    // ── Kartal'ın sürprizi: Feza'yı yukarı kaldırır (sis denizi manzarası; ekrana dokun = atla) ──
    function startLift() {
      const P = hero(); if (!P || S.lift) return;
      const sx = P.pos.x, sz = P.pos.z, f = F[1], w = W[1];
      let ex = sx + w.dx * 4.5, ez = sz + w.dz * 4.5;
      if (!api.isFloor(ex, ez) || !api.circleFree(ex, ez, 0.6)) { ex = sx; ez = sz; }   // (ağaç/kaya içine inmesin)
      S.lift = { t: 0, T: 5.2, sx, sz, ex, ez, skip: false, h: 3.2 };
      E.mode = 'carry'; say('b03_kartal_kaldir', { force: true, once: false }); sfx('whoosh', { x: sx, z: sz });
      if (lines) { lines.visible = true; } sea.visible = true;
      setTimeout(() => say('b03_piril_yildiz', { force: true, once: false }), 3400);
      void f;
    }
    const skipLift = () => { if (S.lift && S.lift.t > 0.8) S.lift.skip = true; };
    try { const cv = document.getElementById('c') || document.querySelector('canvas'); (cv || window).addEventListener('pointerdown', skipLift); api.dispose({ dispose() { (cv || window).removeEventListener('pointerdown', skipLift); } }); } catch (e) { /* yok */ }

    // ── otomatik yardım ──
    const hard = () => { const P = hero(); return !!P && (P.hp < P.maxHp * 0.5); };
    const crowd = (P) => { let n = 0, cx = 0, cz = 0; for (const e of g0.enemies || []) { if (e.dead || e.boss) continue; const d = hyp(e.x - P.pos.x, e.z - P.pos.z); if (d < 8) { n++; cx += e.x; cz += e.z; } } return { n, cx: n ? cx / n : P.pos.x, cz: n ? cz / n : P.pos.z }; };
    function helpTick() {
      const P = hero(); if (!P || S.lift || S.lighting || !live()) return;
      if (S.t - S.helpAt < 6) return;
      const c = crowd(P), need = hard() || c.n >= 4;
      if (!need || (!c.n && !(g0.boss && !g0.boss.dead))) return;
      if (S.t - S.helpB >= 25 && B.mode !== 'help' && baba) {
        S.helpB = S.helpAt = S.t; B.mode = 'help'; B.modeT = 0; B.hit = false;
        let best = null, bd = 1e9; for (const e of g0.enemies || []) { if (e.dead || e.boss) continue; const d = hyp(e.x - P.pos.x, e.z - P.pos.z); if (d < bd && d < 12) { bd = d; best = e; } }
        B.target = best; say('b03_baba_yardim', { force: true, once: false });
      } else if (S.t - S.helpK >= 30 && E.mode !== 'pass' && kartal) {
        S.helpK = S.helpAt = S.t; E.mode = 'pass'; E.passT = 0;
        const dx = c.cx - P.pos.x, dz = c.cz - P.pos.z, l = hyp(dx, dz) || 1, nx = -dz / l, nz = dx / l;
        E.px0 = c.cx - nx * 11; E.pz0 = c.cz - nz * 11; E.px1 = c.cx + nx * 11; E.pz1 = c.cz + nz * 11; E.cx = c.cx; E.cz = c.cz; E.pushed = false;
        say('b03_kartal_yardim', { force: true, once: false });
      }
    }
    const walkTo = (o, dt, tx, tz, vmax, step = true) => {
      const dx = tx - o.x, dz = tz - o.z, d = hyp(dx, dz);
      if (d < 0.12) { o.speed = 0; return d; }
      const v = Math.min(vmax, d * 2.6 + 0.3), nxp = o.x + dx / d * v * dt, nzp = o.z + dz / d * v * dt;
      if (!step || api.isFloor(nxp, nzp)) { o.x = nxp; o.z = nzp; o.speed = v; } else o.speed = 0;
      let da = Math.atan2(dx, dz) - o.face; da = Math.atan2(Math.sin(da), Math.cos(da)); o.face += da * Math.min(1, dt * 9);
      return d;
    };

    api.anim((dt, hx, hz) => {
      dt = Math.min(dt, 0.05);
      const P = hero(); if (!P) return;
      const playing = live(); S.t += dt;
      const arenaMode = !!(A.length && P.area === A.length - 1);
      const act = activeIdx(); S.active = act;
      // ─ sis duvarları ─
      for (let i = 0; i < W.length; i++) {
        const w = W[i]; w.u.uTime.value = S.t;
        if (w.state === 'opening') { w.open = Math.min(1, w.open + dt / 3.2); w.u.uOpen.value = w.open;
          // (QA: sis gözle ~1 sn'de eriyor ama görünmez engel 3.2 sn kalıyordu → Feza boş yolda takılı gibi duruyordu) yol hemen açılır
          if (w.open >= 0.25 && w.solids[0] && w.solids[0].alive) { for (const so of w.solids) so.alive = false; L._sh = null; }
          if (w.open >= 1) { w.state = 'open'; for (const so of w.solids) so.alive = false; L._sh = null; w.pts.visible = false; } }
      }
      // ─ fenerler ─
      for (let i = 0; i < F.length; i++) {
        const f = F[i], target = f.lit ? 1 : 0; f.k += (target - f.k) * Math.min(1, dt * 2.5);
        f.bulbM.emissiveIntensity = 2.0 * f.k; f.glassM.emissiveIntensity = 0.9 * f.k; f.glassM.opacity = 0.45 + 0.2 * f.k; f.le.int = 2.4 * f.k; f.halo.material.opacity = 0.75 * f.k; f.halo.visible = f.k > 0.02;
        f.bulbM.color.setHex(f.lit ? 0xffe9a0 : 0x6a5a44);
        f.ring.visible = !f.lit && i === act; if (f.ring.visible) { const s = 1 + 0.12 * Math.sin(S.t * 3); f.ring.scale.set(s, 1, s); f.ring.material.opacity = 0.45 + 0.2 * Math.sin(S.t * 3); }
        // Pırıl yaklaşınca sönük feneri yakar: Feza dokunur → Pırıl nefes üfler
        if (playing && !f.lit && !S.lighting && i === act && !S.lift && flatDist(f, P.pos.x, P.pos.z) < 2.7) { S.lighting = { i, t: 0 }; pirilGit(f.x, f.z); sfx('whoosh', { x: f.x, z: f.z, pitch: 1.4 }); }
      }
      if (S.lighting) { S.lighting.t += dt; if (S.lighting.t > 0.75) { ignite(S.lighting.i); S.lighting = null; } }
      if (S.liftAt && S.t >= S.liftAt && playing) { S.liftAt = 0; startLift(); }
      // ─ sisin önünde bekleme: ipucu + YUMUŞAK KİLİT (eski 3.2 m / 2.2 sn ipucunun yerine). Feza feneri bulamasa da yol açılır:
      //   sisin ~6 m yakınında toplam ~1.5 sn → ipucu bir kez (cümle + Pırıl fenere uçar); toplam ~4 sn (gelip gitmek de sayılır) →
      //   Pırıl feneri kendisi yakar (aynı yakma: kıvılcım + 'Fener yandı, sis çekildi' + sis erir).
      if (S.soft === undefined) S.soft = W.map(() => 0);
      if (playing && act < W.length && W[act].state === 'closed' && !S.lighting && !S.lift && !F[act].lit) {
        const w = W[act];
        if (hyp(P.pos.x - w.x, P.pos.z - w.z) < 6) {
          const t0 = S.soft[act]; S.soft[act] += dt;
          if (t0 < 1.5 && S.soft[act] >= 1.5) pirilGit(F[act].x, F[act].z);
          // ipucu cümlesi: anlatıcı o an konuşuyorsa sıraya girmez (fener yandıktan sonra çalardı); susunca 3 sn'ye dek yeniden dener
          S.hint = S.hint || W.map(() => 0);
          if (S.soft[act] >= 1.5 && !S.hint[act]) { const mesgul = typeof AUD !== 'undefined' && AUD.speaking && AUD.speaking();
            if (!mesgul) { S.hint[act] = 1; if (!say('b03_sis_dondu', { force: true })) say('b03_fener', { once: false, gap: 8 }); }   // (aynı cümle 8 sn içinde iki kez olmasın)
            else if (S.soft[act] >= 3) S.hint[act] = 1; }
          if (S.soft[act] >= 4) { S.lighting = { i: act, t: 0 }; pirilGit(F[act].x, F[act].z); sfx('whoosh', { x: F[act].x, z: F[act].z, pitch: 1.4 }); }
        }
      }
      // ─ kamp ateşi (başlangıç): Baba yakar, Pırıl kıvılcım ─
      if (fire && playing) {
        if (S.campStep === 0) {
          if (!S.started && S.t > 0.9) { S.started = true; say('b03_giris', { force: true }); }
          if (S.t > 7.5 && B.mode === 'fire') say('b03_baba_selam');
          // (Feza ateşe gelmese de ~12 sn sonra Baba ateşi yine yakar ve peşine düşer: Baba ateş başında takılı kalmaz)
          if (hyp(P.pos.x - fire.x, P.pos.z - fire.z) < 6.5 || S.t > 12) { S.campStep = 1; S.campT = 0; B.pose = 'kneel'; B.face = Math.atan2(fire.x - B.x, fire.z - B.z); say('b03_baba_selam', { force: true }); }
        } else if (S.campStep < 5) {
          S.campT += dt;
          if (S.campStep === 1 && S.campT > 2.8) { S.campStep = 2; fire.set(true); sfx('unlock', { x: fire.x, z: fire.z, pitch: 0.7 }); burst('sparkle', fire.x, 0.7, fire.z, { color: '#ffb050', count: 12 }); say('b03_kamp1', { force: true }); }
          if (S.campStep === 2 && S.campT > 6.2) { S.campStep = 3; pirilGit(fire.x, fire.z); say('b03_piril_kivilcim', { force: true }); B.pose = 'cheer'; }
          if (S.campStep === 3 && S.campT > 9.5) { S.campStep = 4; B.pose = null; B.mode = 'follow'; say('b03_baba_rehber', { force: true }); }
          if (S.campStep === 4 && S.campT > 14) S.campStep = 5;
        }
        if (fire.lit && hyp(P.pos.x - fire.x, P.pos.z - fire.z) < 3.4 && P.hp < P.maxHp && (S.fireHeal = (S.fireHeal || 0) + dt) > 1.2) { S.fireHeal = 0; try { g0.heal(0.08, true); } catch (e) { /* yok */ } }
      }
      // ─ dinlenme ateşi: marşmelov ─
      if (fire2 && playing) {
        const d2 = hyp(P.pos.x - fire2.x, P.pos.z - fire2.z);
        if (S.camp2 === 0 && d2 < 4.5 && act >= 3) { S.camp2 = 1; S.camp2T = 0; fire2.set(true); say('b03_kamp2', { force: true }); if (baba) { B.mode = 'cozy'; B.tx = fire2.x + 1.4; B.tz = fire2.z - 1.0; if (baba.setGear) baba.setGear({ tool: 'cubuk', backpack: true }); } }
        if (S.camp2 === 1) { S.camp2T += dt; if (baba && baba.gear) baba.gear.toast(clamp(S.camp2T / 6, 0, 1)); if (d2 < 3.6 && (S.camp2H = (S.camp2H || 0) + dt) > 1.0) { S.camp2H = 0; try { g0.heal(0.12, true); } catch (e) { /* yok */ } }
          if (S.camp2T > 9 || d2 > 9) { S.camp2 = 2; if (B.mode === 'cozy') B.mode = 'follow'; if (baba && baba.setGear) baba.setGear({ tool: 'none', backpack: true }); } }
      }
      // ─ konuşmalar ─
      if (playing) {
        const f0 = F[act];
        if (f0 && flatDist(f0, P.pos.x, P.pos.z) < 11) say('b03_fener');
        if (f0 && act === 0 && flatDist(f0, P.pos.x, P.pos.z) < 20) say('b03_kartal_yon');
        if (act === 2 && F[2] && flatDist(F[2], P.pos.x, P.pos.z) < 18) { if (!S.owl) { S.owl = 1; say('b03_baykus', { force: true }); } }
        // ('b03_kopru' susturuldu: "Köprüyü geç" diyordu, bölümde köprü yok)
        if (arenaMode && !S.arenaSeen) { S.arenaSeen = true; say('b03_kral_giris', { force: true, once: false }); }
        // boss hamle cümleleri
        const b = g0.boss;
        if (b && !b.dead && b.type === 'kralJole') {
          const mv = b.encounter && b.encounter.move, key = mv ? 'm:' + mv.kind : 'p:' + b.ph;
          if (key !== S.bossPh) {
            S.bossPh = key;
            const map = { 'p:hop': 'b03_boss_ziplama', 'p:spit': 'b03_boss_tukurme', 'p:summon': 'b03_boss_cagir', 'm:jellyspin': 'b03_boss_kasirga', 'm:split': 'b03_boss_ayri', 'p:shy': 'b03_tac_dustu', 'p:blush': 'b03_tac_geri' };
            if (map[key]) say(map[key], { once: false, gap: 7 });
          }
        }
      }
      // ─ Kartal'ın yükseltmesi ─
      let lifting = false;
      if (S.lift) {
        const Lf = S.lift; lifting = true; Lf.t += dt * (Lf.skip ? 6 : 1);
        const u = clamp(Lf.t / Lf.T, 0, 1), e = u * u * (3 - 2 * u), y = Lf.h * sstep(0, 0.2, u) * sstep(1, 0.78, u);
        const x = Lf.sx + (Lf.ex - Lf.sx) * e, z = Lf.sz + (Lf.ez - Lf.sz) * e;
        P.pos.x = x; P.pos.z = z; P.pos.y = y; if (g0.H && g0.H.root) { g0.H.root.position.set(x, y, z); }
        const hh = y / Lf.h;
        window.CAMEXTRA = { on: true, ty: y * 0.9, zoom: 1 + 0.55 * hh, pitch: -0.2 * hh };
        sea.position.set(x, 2.7, z); sea.material.opacity = 0.62 * sstep(0.12, 0.4, u) * sstep(1, 0.7, u);
        if (lines) lines.material.opacity = 0.9 * sstep(0.3, 0.5, u) * sstep(0.95, 0.75, u);
        E.x = x; E.z = z - 0.2; E.y = y + 2.1; E.face = P.face;
        if (u >= 1) { S.lift = null; E.mode = 'circle'; window.CAMEXTRA = null; sea.visible = false; if (lines) lines.visible = false; P.pos.y = 0; if (g0.H && g0.H.root) g0.H.root.position.y = 0; }
      }
      // ─ Baba ─
      if (baba) {
        let pose = B.pose, tx = B.x, tz = B.z, vmax = 3.6;
        // (QA: Baba fener fidanının/ateşin tam içinde duruyordu, Pırıl da üstüne konunca üçü iç içe görünüyordu) dolu yerlere durmaz
        const fol = () => { for (const o of B_OFFS) if (api.isFloor(hx + o[0], hz + o[1]) && !dolu(hx + o[0], hz + o[1])) return [hx + o[0], hz + o[1]]; return [hx, hz]; };
        if (B.mode === 'fire') { tx = B.x; tz = B.z; }
        else if (B.mode === 'follow') { [tx, tz] = fol(); if (arenaMode && L.orArenaKamp) { tx = L.orArenaKamp.x + 1.4; tz = L.orArenaKamp.z - 0.8; vmax = 4.5; } pose = null; if (hyp(tx - B.x, tz - B.z) > 14) { B.x = tx; B.z = tz; } }
        else if (B.mode === 'cozy') { tx = B.tx; tz = B.tz; pose = S.camp2 === 1 && hyp(B.x - tx, B.z - tz) < 0.4 ? 'stick' : null; }
        else if (B.mode === 'arrow') { tx = B.tx; tz = B.tz; pose = hyp(B.x - tx, B.z - tz) < 0.5 ? 'point' : null; }
        else if (B.mode === 'help') {
          B.modeT += dt; vmax = 7; pose = null;
          const tg = B.target && !B.target.dead ? B.target : null;
          tx = tg ? tg.x : hx; tz = tg ? tg.z : hz;
          if (tg && !B.hit) { const ddx = B.x - tg.x, ddz = B.z - tg.z, dl = hyp(ddx, ddz) || 1; if (dl < 3.2) { tx = tg.x + ddx / dl * 2.3; tz = tg.z + ddz / dl * 2.3; } }   // (QA: Baba düşmanın gövdesinin içine giriyordu → yanında durur)
          if (tg ? hyp(tg.x - B.x, tg.z - B.z) < 2.6 && !B.hit : (hyp(tx - B.x, tz - B.z) < 1.5 && !B.hit)) {
            B.hit = true; B.hitT = 0;
            if (tg) { const dx = tg.x - B.x, dz = tg.z - B.z, l = hyp(dx, dz) || 1; tg.stun = Math.max(tg.stun || 0, 2.4); tg.kvx = (tg.kvx || 0) + dx / l * 6; tg.kvz = (tg.kvz || 0) + dz / l * 6; }
            burst('sparkle', B.x, 1.2, B.z, { color: '#ffe9a0', count: 8 }); sfx('pop', { x: B.x, z: B.z });
            try { g0.heal(0.15, false); } catch (e) { /* yok */ }
          }
          if (B.hit) { B.hitT += dt; pose = 'cheer'; vmax = 0.5; if (B.hitT > 1.0) B.mode = 'follow'; }
          if (B.modeT > 4.5) B.mode = 'follow';
        }
        if (!B.fixed) walkTo(B, dt, tx, tz, vmax);
        if (B.mode === 'fire' && S.campStep === 0) pose = B.pose;
        if (B.mode === 'fire' && S.campStep >= 1) pose = B.pose;
        if (lifting) pose = 'lookUp';
        baba.root.position.set(B.x, 0, B.z); baba.root.rotation.y = B.face;
        baba.update(dt, { speed: B.speed, pose, poseT: S.t });
      }
      // ─ Dal oku: Baba yere ok çizer ─
      const needArrow = playing && !lifting && act < F.length && act >= 0 && P.area >= 1 && S.t - S.arrowAt > 15 && flatDist(F[act], P.pos.x, P.pos.z) > 7 && B.mode === 'follow' && arrowT < 0;
      if (needArrow) {
        const p0 = pathAhead(L, hx, hz, F[act].x, F[act].z, 2.4), p1 = pathAhead(L, hx, hz, F[act].x, F[act].z, 5.0), p2 = pathAhead(L, hx, hz, F[act].x, F[act].z, 7.6);
        if (p0 && p1 && p2) { arrowPts = [p0, p1, p2]; arrowT = 0; S.arrowAct = act; S.arrowAt = S.t; say('b03_baba_ok', { force: false }); B.mode = 'arrow'; B.tx = p0.x - p0.dz * 1.6; B.tz = p0.z + p0.dx * 1.6; B.arrowDir = Math.atan2(p0.dx, p0.dz); }
      }
      if (arrowT >= 0) {
        arrowT += dt; arrow.visible = true;
        if (S.arrowAct !== act || lifting) arrowT = Math.max(arrowT, 5.6);   // fener yandı (ya da Kartal kaldırdı): eski ok geriyi göstermesin, hemen solar
        arrowPts.forEach((p, i) => { chev[i].position.set(p.x, 0.03, p.z); chev[i].rotation.y = Math.atan2(p.dx, p.dz); chev[i].visible = arrowT > 1.0 + i * 0.35; });
        arrowM.opacity = 0.85 * sstep(1.0, 1.5, arrowT) * (1 - sstep(5.0, 6.5, arrowT));
        if (arrowT > 3.2 && B.mode === 'arrow') { B.mode = 'follow'; }
        if (arrowT > 6.5) { arrowT = -1; arrow.visible = false; }
      }
      // ─ Kartal ─
      if (kartal) {
        let tx = E.x, ty = E.y, tz = E.z, st = { flap: 4.2, bank: 0 };
        if (E.mode === 'circle') {
          E.ang += dt * 0.55;
          // OYNANIŞ (tur 1): Kartal 7.6 m yükseklikte, fenerin tepesinde dönüyordu → oyun kamerasından HİÇ görünmüyordu (ekranın üstünün
          // dışında). Artık alçakta (≈3.6 m) ve yolun 6 m ilerisinde, fenere yaklaşınca da fenerin üstünde döner: Feza Kartal'ı hep görür
          // ve "Kartal'ın altına git" gerçekten işe yarar. Arenada Baba'nın ateşinin üstünde (kenarda) süzülür.
          let cx, cz, R = 2.0, h0 = 2.8; const f0 = F[act];
          E.ang += dt * 0.1;
          if (arenaMode && L.orArena) { const q = L.orArenaKamp || L.orArena; cx = q.x; cz = q.z; R = 2.2; h0 = 4.2; }
          else if (f0 && flatDist(f0, hx, hz) < 4.5) { cx = f0.x; cz = f0.z; R = 1.7; h0 = 3.25; }   // (fenerin tepesinin biraz üstünde: feneri örtmez)
          else if (f0) { const pa = pathAhead(L, hx, hz, f0.x, f0.z, 4); cx = pa ? pa.x : f0.x; cz = pa ? pa.z : f0.z; }
          else { cx = hx; cz = hz - 4; }
          tx = cx + Math.sin(E.ang) * R; tz = cz + Math.cos(E.ang) * R; ty = h0 + Math.sin(E.ang * 1.7) * 0.25;
          const k = Math.min(1, dt * 1.6); E.x += (tx - E.x) * k; E.y += (ty - E.y) * k; E.z += (tz - E.z) * k;
          E.face = Math.atan2(Math.cos(E.ang), -Math.sin(E.ang)) + PI; st.bank = 0.14;
        } else if (E.mode === 'pass') {
          E.passT += dt; const u = clamp(E.passT / 1.5, 0, 1);
          E.x = E.px0 + (E.px1 - E.px0) * u; E.z = E.pz0 + (E.pz1 - E.pz0) * u; E.y = 3.4 - 1.4 * Math.sin(u * PI); E.face = Math.atan2(E.px1 - E.px0, E.pz1 - E.pz0);
          st.dive = 0.5 * Math.sin(u * PI); st.flap = 6;
          if (!E.pushed && u > 0.45) { E.pushed = true; sfx('whoosh', { x: E.cx, z: E.cz, pitch: 0.8 }); burst('dust', E.cx, 0.3, E.cz, { count: 10 });
            for (const e of g0.enemies || []) { if (e.dead || e.boss) continue; const dx = e.x - E.cx, dz = e.z - E.cz, d = hyp(dx, dz); if (d < 8) { const l = d || 1; e.kvx = (e.kvx || 0) + dx / l * 8; e.kvz = (e.kvz || 0) + dz / l * 8; e.stun = Math.max(e.stun || 0, 1.0); } } }
          if (u >= 1) E.mode = 'circle';
        } else if (E.mode === 'carry') { st.carry = 1; st.flap = 5.5; }
        kartal.root.position.set(E.x, E.y, E.z); kartal.root.rotation.y = E.face;
        { const sc = E.mode === 'carry' ? 2.0 : 1.55, s0 = kartal.root.scale.x; if (Math.abs(sc - s0) > 0.001) kartal.root.scale.setScalar(s0 + (sc - s0) * Math.min(1, dt * 3)); }   // (alçakta dönerken biraz küçük: önünü kapatmaz)
        kartal.update(dt, st);
        kartal.root.visible = P.area >= 1 || lifting || arenaMode;
      }
      helpTick();
    });

    // test / QA kancaları
    ORMAN._qa = { S, F, W, B, E, baba, kartal, T, fire, fire2, ignite, startLift, helpB: () => { S.helpB = -99; S.helpAt = -99; }, say };
  }

  BOLUM.define('orman', {
    ad: 'Huysuz Orman',
    taban: 'forest',
    size: 110, side: 2,
    areas: [{ id: 'a1', ad: 'Kamp Açıklığı', rooms: 2 }, { id: 'a2', ad: 'Sisli Çam Yolu', rooms: 2 }, { id: 'a3', ad: 'Mantar Çayırı', rooms: 2 },
      { id: 'a4', ad: 'Baykuşun Ağacı', rooms: 2 }, { id: 'a5', ad: 'Goblin Köprüsü', rooms: 2 }],
    muzik: 'orman',
    malzeme: 'isik3',
    kayipEsya: null,
    final: false,
    isik: { fog: [0xeef0e2, 32, 84], hemiSky: 0xfff0d6, hemiGround: 0x4e6a34, hemi: 0.95, sunColor: 0xffd49a, sun: 2.3, sunOffset: [-14, 22, 14],
      env: [0xcfe6ff, 0xffe2b4, 0x4a6634, 0.95], bloom: 0.4, exposure: 1.0, sat: 1.08, vig: 0.3, fezaLight: 0.5, fezaLightColor: 0xffd9a0, moss: [0x5a9a3a, 0.75], rim: [0xfff0c8, 0.12] },
    zemin: { tA: 0xcfe0b8, tB: 0xf2e6d2, tC: 0xf0e6d0, out: 0x2c4a22, outAmt: 0.5, macro: 0xffe6a0 },
    minimap: { zemin: '#7aa46a' },
    harita: { ad: 'Huysuz Orman', detay: 'Sisli orman, fener fidanları, Baba, Kartal ve Kral Jöle', renk: '#8cc86a', x: 50, y: 46, simge: '🌲' },
    yolculuk: { ad: 'Kartal uçuşu', ses: 'b03_yolculuk', sure: 10 },
    yerlesim,
    kur: true,   // işaret: gerçek bölüm (yer tutucu değil); işlev değil → motorun orman teması (buildForest) çizilir
    kurSon,
  });
  return { _qa: null };
})();
