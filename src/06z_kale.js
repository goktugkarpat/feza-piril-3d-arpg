/* ── Bölüm 9: Ejderhanın Kalesi (Feza ve Pırıl: Büyük Fener) ──
   Bütün dostlar bir arada (Pırıl + Bilbo + Baba + Kartal + Hala). Ana iş: 3 benekli yumurtayı sıcak yuvaya taşımak (L.nesneler 'tasinir' + L.hedefler).
     1. Gökkuşağı Köprüsü     bayraklar gökkuşağı renginde; dostlar birer cümleyle selamlar (yalnız yürü)
     2. Oyuncak Asker Avlusu  1. yumurta + yuva; oyuncak askerler
     3. Eski Resimler Galerisi soluk resimler (rengi silik büyük ejderha + yumurta); resim hayaletleri; 2. yumurta
     4. Sıcak Salon           ateş (Baba), Hala'nın fırını, Kıpırtı Ateşçikler; 3. yumurta → sis perdesi çekilir
     5. Kule Merdiveni        kaya devleri (yavaş); kısa
     Arena: Beşik Salonu — Huysuz Ejderha (src/05z_kale.js), kırık kabuk + beşik; tanıma sahnesi; sonra kuleden gölge "Gelin... lütfen" (adı yok).
   Tek net efekt: yumurta yuvaya konunca pembeleşir (yumurta "ısınır"). Yanlış yapma yok. Cümleler: 02l_kale.js (b09_...).
   Genel ad: KALE. Gizli odalar (Hatıra Odası / Davul Geçidi) bu sürümde yok. */
const KALE = (() => {
  'use strict';
  const PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  const G_ = () => (typeof GAME !== 'undefined' ? GAME : null);
  const live = () => { const g = G_(); return !!(g && g.state === 'play' && !g.paused && g.P && !g.P.dead); };
  const said = new Set(); let sayAt = -99;
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
  const GM = {}; const geo = (k, f) => GM[k] || (GM[k] = f());
  const kp = o => { if (o) o.userData.keep = true; return o; };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const later = (s, fn) => { const g = G_(); if (g && g.later) g.later(s, fn); else setTimeout(fn, s * 1000); };

  // ════════════════ Yerleşim ════════════════
  function yerlesim(L, api) {
    const A = L.areas || [];
    const mainRooms = a => (A[a] ? A[a].rooms.filter(ri => L.rooms[ri] && L.rooms[ri].kind !== 'side') : []);
    const areaOf = {}; A.forEach((a, k) => { if (!a.boss) a.rooms.forEach(ri => { areaOf[ri] = k; }); });
    const LIST = [null, ['oyuncakAsker', 'pelusSovalye', 'oyuncakAsker'], ['resimHayalet', 'resimHayalet', 'pelusSovalye'], ['kipirtiAtescik', 'oyuncakAsker', 'kipirtiAtescik'], ['kayaDevi', 'oyuncakAsker']];
    const CAP = [0, 3, 3, 3, 2], packN = {}, keep = [];
    for (const sp of L.spawns || []) {
      const ai = areaOf[sp.room];
      if (sp.room === 0) continue;
      if (ai === undefined) { keep.push(sp); continue; }
      const list = LIST[Math.min(ai, LIST.length - 1)]; if (!list) continue;
      const n = packN[sp.pack] = (packN[sp.pack] || 0) + 1;
      if (n > CAP[Math.min(ai, CAP.length - 1)]) continue;
      sp.type = list[(n - 1 + sp.pack) % list.length];
      if (sp.elite && sp.type !== 'oyuncakAsker') sp.type = 'oyuncakAsker';
      delete sp.variant; keep.push(sp);
    }
    L.spawns.length = 0; L.spawns.push(...keep);
    const spot = (cx, cz, rmin, rmax, r = 1.2, tries = 80) => {
      for (let t = 0; t < tries; t++) {
        const a = api.rnd() * TAU, d = rmin + api.rnd() * (rmax - rmin), x = cx + Math.sin(a) * d, z = cz + Math.cos(a) * d;
        if (api.isFloor(x, z) && api.circleFree(x, z, r)) return { x, z };
      }
      return null;
    };
    const K = L.kl = { eggs: [], nests: [], rooms: [], arena: null, salon: null, galeri: null, bridge: null };
    for (let a = 1; a <= 3; a++) {
      const rm = L.rooms[mainRooms(a)[0]]; if (!rm) continue;
      const R = rm.r || Math.max(rm.hw || 6, rm.hh || 6);
      const e = spot(rm.x, rm.z, R * 0.2, R * 0.5, 1.4) || spot(rm.x, rm.z, 0.5, R * 0.8, 1.2, 160) || { x: rm.x, z: rm.z };
      let n = null; for (let t = 0; t < 30 && !n; t++) { const c = spot(rm.x, rm.z, R * 0.3, R * 0.65, 1.3); if (c && hyp(c.x - e.x, c.z - e.z) > 5) n = c; }
      // yedek: küçük odada 5 m bulunamazsa 3 m yeter; körlemesine nokta YOK (seed 4: yuva bir eşyanın içine düşüyordu, yumurta elde kalıyordu)
      for (let t = 0; t < 40 && !n; t++) { const c = spot(rm.x, rm.z, 1, R * 0.85, 1.2); if (c && hyp(c.x - e.x, c.z - e.z) > 3) n = c; }
      K.eggs.push(e); K.nests.push(n || { x: e.x + (rm.x > e.x ? 3 : -3), z: e.z }); K.rooms[a] = { x: rm.x, z: rm.z, r: R };
    }
    { const rm = L.rooms[mainRooms(0)[0]]; if (rm) K.bridge = { x: rm.x, z: rm.z, r: rm.r || 8 }; }
    { const rm = L.rooms[mainRooms(2)[0]]; if (rm) K.galeri = { x: rm.x, z: rm.z, r: rm.r || 8 }; }
    { const rm = L.rooms[mainRooms(3)[0]]; if (rm) K.salon = { x: rm.x, z: rm.z, r: rm.r || 8 }; }
    { const ar = L.rooms.filter(r => r.kind !== 'side').pop(); if (ar) K.arena = { x: ar.x, z: ar.z, r: ar.r || 11 }; }
  }

  // ════════════════ Görseller ════════════════
  const haloTex = () => {
    if (GM.haloT) return GM.haloT;
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.userData = { keep: true }; return (GM.haloT = t);
  };
  // eski resim: soluk, rengi silik büyük ejderha + küçük yumurta (korku yok)
  function paintTex(k) {
    const key = 'paint' + k; if (GM[key]) return GM[key];
    const W = 384, H = 480, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#d9cfc0'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 500; i++) { x.fillStyle = 'rgba(' + (180 + Math.random() * 50 | 0) + ',' + (170 + Math.random() * 50 | 0) + ',' + (155 + Math.random() * 50 | 0) + ',0.2)'; x.fillRect(Math.random() * W, Math.random() * H, 4 + Math.random() * 16, 3 + Math.random() * 10); }
    x.strokeStyle = 'rgba(150,120,80,0.8)'; x.lineWidth = 14; x.strokeRect(10, 10, W - 20, H - 20);
    x.globalAlpha = 0.5; x.fillStyle = '#bdb8b4';   // silik gri-inci ejderha
    x.beginPath(); x.ellipse(190, 290, 110, 70, 0, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(110, 210, 46, 38, -0.3, 0, TAU); x.fill();
    x.beginPath(); x.moveTo(250, 230); x.quadraticCurveTo(330, 120, 300, 200); x.quadraticCurveTo(330, 260, 260, 270); x.fill();
    x.beginPath(); x.moveTo(290, 330); x.quadraticCurveTo(360, 360, 340, 400); x.quadraticCurveTo(300, 380, 270, 340); x.fill();
    x.fillStyle = '#6a625a'; x.beginPath(); x.arc(96, 206, 6, 0, TAU); x.arc(128, 202, 6, 0, TAU); x.fill();
    if (k % 2 === 0) { x.fillStyle = '#e9dcc0'; x.beginPath(); x.ellipse(95, 380, 26, 34, 0, 0, TAU); x.fill(); x.fillStyle = '#9fbf9a'; for (const q of [[88, 372], [102, 384], [92, 394]]) { x.beginPath(); x.arc(q[0], q[1], 4, 0, TAU); x.fill(); } }
    x.globalAlpha = 1;
    const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(235,228,216,0.4)'); gr.addColorStop(1, 'rgba(235,228,216,0.6)'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { keep: true }; return (GM[key] = t);
  }
  function frame(api, x, y, z, yaw, k) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw;
    const wood = geo('fWoodM', () => kp(new THREE.MeshStandardMaterial({ color: 0xb48a58, roughness: 0.7 })));   // (malzemeler bir kez yapılır: her yüklemede yenisi birikmesin)
    const back = new THREE.Mesh(geo('fBox', () => kp(new THREE.BoxGeometry(1, 1, 1))), wood); back.scale.set(2.3, 2.9, 0.16); g.add(back);
    const pm = new THREE.MeshBasicMaterial({ map: paintTex(k), fog: false });
    const pic = new THREE.Mesh(geo('fPlane', () => kp(new THREE.PlaneGeometry(1, 1))), pm); pic.scale.set(2.0, 2.6, 1); pic.position.z = 0.09; g.add(pic);
    api.add(g); api.dispose(pm); return g;
  }
  // beşik + kırık kabuk (iki yarım): kabuk parlaması tek efekt
  function cradle(api, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const wood = geo('crWoodM', () => kp(new THREE.MeshStandardMaterial({ color: 0xcaa070, roughness: 0.75 }))), cloth = geo('crClothM', () => kp(new THREE.MeshStandardMaterial({ color: 0xf3c9d6, roughness: 0.95 })));
    const bowl = new THREE.Mesh(geo('cr', () => kp(new THREE.SphereGeometry(1, 20, 10, 0, TAU, PI * 0.5, PI * 0.5))), wood); bowl.scale.set(1.6, 0.9, 1.0); bowl.position.y = 0.95; g.add(bowl);
    // pembe yorgan: beşiği dolduran kabarık tümsek (eskisi içi boş çanaktı: üstten bakınca beşik boş bir kayık gibiydi, ayaklar içinden görünüyordu)
    const pad = new THREE.Mesh(geo('crp2', () => kp(new THREE.SphereGeometry(1, 18, 8))), cloth); pad.scale.set(1.42, 0.26, 0.86); pad.position.y = 0.93; g.add(pad);
    // iki ayak yerine iki sallanan kızak (beşik olduğu belli olsun)
    for (const sz of [-0.55, 0.55]) { const rk = new THREE.Mesh(geo('crk', () => kp(new THREE.TorusGeometry(1, 0.07, 6, 18, PI).rotateZ(PI))), wood); rk.scale.set(1.75, 0.58, 1); rk.position.set(0, 0.62, sz); g.add(rk); }
    // kabuk yarımları: ağzı yukarı açık, içi görünen yumurta kabuğu (eskiden ters kapalı kubbeydi, iki ekmek topu gibi duruyordu)
    const sm = new THREE.MeshStandardMaterial({ color: 0xf6eedc, roughness: 0.5, emissive: 0xffb0c8, emissiveIntensity: 0, side: THREE.DoubleSide }); api.dispose(sm);
    const half = geo('shellC', () => kp(new THREE.SphereGeometry(1, 16, 8, 0, TAU, PI * 0.4, PI * 0.6)));
    const h1 = new THREE.Mesh(half, sm); h1.scale.set(0.42, 0.52, 0.42); h1.position.set(2.0, 0.5, 1.4); h1.rotation.z = 0.28;
    const h2 = new THREE.Mesh(half, sm); h2.scale.set(0.4, 0.48, 0.4); h2.position.set(2.7, 0.46, 1.2); h2.rotation.z = -0.3; h2.rotation.y = 1.4;
    g.add(h1, h2);
    api.add(g);
    const glow = { t: 0, d: 0 };
    return { g, sm, shellX: x + 2.35, shellZ: z + 1.3, glow };
  }
  // sıcak yuva: pembe-altın taş çukur, üstünde minik fener; yumurta "ısınınca" pembeleşir
  function nestMesh(api, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const bowl = new THREE.Mesh(geo('nb', () => kp(new THREE.LatheGeometry([[0, 0.03], [0.5, 0.05], [0.85, 0.16], [1.05, 0.3], [1.2, 0.34], [1.25, 0.2], [1.1, 0.02]].map(q => new THREE.Vector2(q[0], q[1])), 20))), geo('nbM', () => kp(new THREE.MeshStandardMaterial({ color: 0xe8b8a0, roughness: 0.85 }))));
    g.add(bowl);
    // saman: kalın, kabarık tek simit (eskisi ince halkaydı; çanak kenarı + saman + sarı halka "iç içe üç halka" gibi görünüyordu)
    const hay = new THREE.Mesh(geo('nh2', () => kp(new THREE.TorusGeometry(0.8, 0.3, 7, 18).rotateX(PI / 2))), geo('nhM', () => kp(new THREE.MeshStandardMaterial({ color: 0xf0d49a, roughness: 1 })))); hay.position.y = 0.26; hay.scale.y = 0.6; g.add(hay);   // (soluk saman rengi: koyu turuncu "simit" gibi durmasın; pembe taş çanak kenarı görünsün)
    // minik fener: havada asılı top yerine kısa direğin ucunda
    const lamp = new THREE.Mesh(geo('nl', () => kp(new THREE.SphereGeometry(0.16, 10, 8))), geo('nlM', () => kp(new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd070).multiplyScalar(1.2) })))); lamp.position.set(1.45, 0.98, 0); g.add(lamp);
    const post = new THREE.Mesh(geo('np', () => kp(new THREE.CylinderGeometry(0.05, 0.07, 0.9, 6).translate(0, 0.45, 0))), geo('npM', () => kp(new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.9 })))); post.position.set(1.45, 0, 0); g.add(post);
    // tek hedef halkası: çanaktan ayrık (1.55–1.75; eskisi çanak kenarına yapışık "iç içe halka" gibiydi), zeminden yukarıda + öne çekik (iPad'de zeminle titreşmesin)
    const ring = new THREE.Mesh(geo('nr2', () => kp(new THREE.RingGeometry(1.55, 1.75, 40).rotateX(-PI / 2))), new THREE.MeshBasicMaterial({ color: 0xffd470, transparent: true, opacity: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); ring.position.y = 0.07; ring.renderOrder = 2; g.add(ring);
    api.dispose(ring.material); api.add(g); return { g, ring };
  }
  function bridgeFlags(api, K) {   // köprü odasının kenarında gökkuşağı bayrakları (mor yok)
    if (!K.bridge) return;
    const cols = [0xff6b6b, 0xffa94d, 0xffe066, 0x69db7c, 0x4dabf7, 0xff928b];
    const pole = geo('pole', () => kp(new THREE.CylinderGeometry(0.05, 0.06, 3.4, 8))), fl = geo('flag3', () => { const sh = new THREE.Shape(); sh.moveTo(0, 0.36); sh.lineTo(1.25, 0.02); sh.lineTo(0, -0.36); sh.lineTo(0, 0.36); return kp(new THREE.ShapeGeometry(sh)); });   // üçgen flama (düz dikdörtgen gölgesiz renk lekesi gibi duruyordu)
    let n = 0;
    for (let k = 0; k < 14; k++) {
      const a = k * TAU / 14, R = K.bridge.r + 1.6, x = K.bridge.x + Math.sin(a) * R, z = K.bridge.z + Math.cos(a) * R;
      if (api.isFloor(x, z) || Math.abs(Math.cos(a)) > 0.55) continue;   // yalnız doğu/batı kenarı: kuzeydekiler avluda Feza'nın önüne (kamera ile arasına) düşüyordu
      const g = new THREE.Group(); g.position.set(x, 0, z);
      const p = new THREE.Mesh(pole, geo('poleM', () => kp(new THREE.MeshStandardMaterial({ color: 0xe9e1cf })))); p.position.y = 1.7; g.add(p);
      const m = new THREE.MeshStandardMaterial({ color: cols[n++ % cols.length], roughness: 0.8, emissive: cols[(n - 1) % cols.length], emissiveIntensity: 0.18, side: THREE.DoubleSide }); api.dispose(m);
      const f = new THREE.Mesh(fl, m); f.position.set(0.04, 2.95, 0); g.add(f); g.rotation.y = ((k * 5) % 7) / 7 * 0.6 - 0.3; api.add(g);   // (rastgele sayı harcamaz: bölüm yerleşimi değişmesin)
    }
  }
  // sis perdesi (arena kapısı): inci-pembe şeffaf perde; üç yumurta tamamlanınca çekilir
  function perde(api, L, gate) {
    let dx = 0, dz = -1;
    try { if (typeof ODAKIT !== 'undefined' && ODAKIT.gateDir) [dx, dz] = ODAKIT.gateDir(L, gate); } catch (e) { /* yok */ }
    const nx = -dz, nz = dx; let lo = 0, hi = 0;
    for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(gate.x + nx * o, gate.z + nz * o)) hi = o; else break; }
    for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(gate.x - nx * o, gate.z - nz * o)) lo = o; else break; }
    const w0 = -lo - 0.6, w1 = hi + 0.6, wd = w1 - w0, cx = (w0 + w1) / 2;
    const grp = new THREE.Group(); grp.position.set(gate.x, 0, gate.z); grp.rotation.y = Math.atan2(nx, nz) - PI / 2; api.add(grp);
    const pm = new THREE.MeshBasicMaterial({ color: 0xf6dcd8, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const panel = new THREE.Mesh(geo('kPlane', () => kp(new THREE.PlaneGeometry(1, 1))), pm); panel.scale.set(wd + 0.4, 3.6, 1); panel.position.set(cx, 1.9, 0); panel.renderOrder = 4; grp.add(panel); api.dispose(pm);
    const solids = [];
    for (let o = w0 + 0.2; o <= w1 - 0.2 + 0.01; o += 0.8) { const so = { x: gate.x + nx * o, z: gate.z + nz * o, r: 0.7, alive: true, tag: 'sisPerdesi' }; L.solids.push(so); solids.push(so); }
    L._sh = null;
    return { x: gate.x, z: gate.z, panel, pm, solids, open: false, anim: 0 };
  }
  // uzak gölge (gümüş sakallı, yüzü görünmez): kule teras sahnesi için
  function golge(api, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const m = new THREE.MeshBasicMaterial({ color: 0x9fa8c4, transparent: true, opacity: 0, depthWrite: false, fog: false }); api.dispose(m);
    const body = new THREE.Mesh(geo('gb', () => kp(new THREE.ConeGeometry(1, 1, 14))), m); body.scale.set(1.0, 3.2, 1.0); body.position.y = 1.6; g.add(body);
    const head = new THREE.Mesh(geo('gh', () => kp(new THREE.SphereGeometry(1, 12, 8))), m); head.scale.setScalar(0.45); head.position.y = 3.4; g.add(head);
    const beard = new THREE.Mesh(geo('gd', () => kp(new THREE.ConeGeometry(1, 1, 10))), m); beard.scale.set(0.4, 0.9, 0.4); beard.rotation.x = PI; beard.position.set(0, 2.8, 0.2); g.add(beard);
    api.add(g); return { g, m };
  }

  // ════════════════ Dekor (kur) ════════════════
  function kur(L, api) {
    try { if (typeof SUS610 !== 'undefined') SUS610.ekle(L, api, 'kale'); } catch (e) { console.warn('SUS610', e); }
    const K = L.kl || {}, rnd = api.rnd;
    const flGrid = (x, z) => { const i = Math.floor(x), j = Math.floor(z); return i >= 0 && j >= 0 && i < L.W && j < L.H && L.grid[j * L.W + i] === 1; };
    const southHides = (x, z, topY) => {
      if (topY <= 0.82) return false;
      const dMax = Math.min(24, Math.max(4, Math.ceil(topY * 1.6)));   // (gerçek boy artık hesaplanıyor: ön surlar (≈1,9 m, ≥5 m güneyde) kalır, uzun kule/sütun/ağaç gizlenir)
      for (let dz = 1; dz <= dMax; dz += 1.5) {
        const halfW = 3.8 + dz * 0.46;
        for (const dx of [-halfW, -halfW * 0.5, 0, halfW * 0.5, halfW]) {
          if (flGrid(x + dx, z - dz)) return true;
        }
      }
      return false;
    };
    const rawPut = api.put.bind(api);
    const sphLow = api.tmp(new THREE.SphereGeometry(1, 9, 6));
    const hidAt = new Map();
    // (12. değer = malzeme anahtarı: eskiden düşüyordu → bütün kale süsleri 'shiny' oluyordu: sur/kuleler avluya kocaman koyu gölge
    //  düşürüyor, mangal/pencere parıltısı sönük kalıyor, uzak süsler hiç gizlenmiyordu. Artık aynen geçer.)
    api.put = (g, x, y, z, sx = 1, sy = 1, sz = 1, c = 0xffffff, yaw = 0, rx = 0, rz = 0, mk) => {
      if (!g.boundingBox && g.computeBoundingBox) { try { g.computeBoundingBox(); } catch (e) { /* yok */ } }
      const my = g.boundingBox ? Math.max(0.01, g.boundingBox.max.y) : 0.5, topY = (y || 0) + (my <= 1.05 ? 1 : my) * Math.abs(sy || 1);   // birim boy (ağaç, kutu) → ölçek = boy; metrelik takım (kule, sur) → gerçek boy
      const pk = Math.round(x * 20) + ',' + Math.round(z * 20);   // aynı yerdeki parçalar (kule + penceresi + sancağı, ağaç gövdesi + yaprağı) İLK parçanın kararına uyar: havada pencere / yapraksız gövde kalmasın
      let hide = hidAt.get(pk);
      if (hide === undefined) {
        hidAt.set(pk, hide = southHides(x, z, topY));
        if (hide && !flGrid(x, z) && ((Math.abs(Math.round(x * 3 + z * 5))) % 6 === 0)) rawPut(sphLow, x, 0.16, z, 0.58, 0.25, 0.58, 0x709850, 0, 0, 0);
      }
      if (hide) return null;
      return rawPut(g, x, y, z, sx, sy, sz, c, yaw, rx, rz, mk);
    };
    try { if (typeof KALE_DEKOR !== 'undefined' && typeof YAPI !== 'undefined' && typeof SEHIR_DEKOR !== 'undefined') K.dekor = KALE_DEKOR.olustur(L, api, K); } catch (e) { console.warn('KALE_DEKOR', e); }   // E8910: yeni çevre takımı (src/07m_dekor_kale.js)
    // yumuşak altın-kum sis ışığı (kale ışığı isik tanımında); odalara sıcak parıltı
    for (const rm of L.rooms) api.glow(rm.x, rm.z, (rm.r || 7) * 0.9, 0xffe0b8, 0.07);
    if (K.salon) api.glow(K.salon.x, K.salon.z, K.salon.r, 0xffa860, 0.12);
    if (K.arena) api.glow(K.arena.x, K.arena.z, K.arena.r * 0.9, 0xffe0a8, 0.11);
    bridgeFlags(api, K);
    // galeri: eski resimler
    if (K.galeri) {
      const R = K.galeri.r; let n = 0; K.frames = [];
      // kuzeyi (≤4 m, ±2,5 m) zemin olan yer = salona giden koridorun ağzı: resim yola dikiliyor, salondan bakınca ekranı kapatıyordu (seed 8 dikey)
      const yolAgzi = (x, z) => { for (let dz = 0; dz <= 4; dz += 0.5) for (let dx = -2.5; dx <= 2.5; dx += 0.5) if (flGrid(x + dx, z - dz)) return true; return false; };
      for (let pass = 0; pass < 2 && n < 2; pass++) for (let k = 0; k < 14 && n < 5; k++) {
        const a = -PI * 0.9 + k * (PI * 1.8 / 13), x = K.galeri.x + Math.sin(a) * (R + 1.1), z = K.galeri.z + Math.cos(a) * (R + 1.1);
        if (api.isFloor(x, z) || z > K.galeri.z - 1) continue;   // yalnız kuzey kenar: kamerayı kapatmaz
        if (K.frames.some(f => hyp(f.position.x - x, f.position.z - z) < 1)) continue;
        if (pass === 0 && yolAgzi(x, z)) continue;   // 2. tur (resim az kaldıysa): yine konur, Feza kuzeyine geçince söner (kurSon)
        K.frames.push(frame(api, x, 2.2, z, Math.atan2(K.galeri.x - x, K.galeri.z - z), n++));
      }
    }
    // salon: ateş yuvası + hala'nın fırını (basit)
    if (K.salon) {
      // fırın yumurta/yuvanın üstüne binmesin (görsel kutu, katı değil): dört köşeden ilk uygun olan
      const near = (x, z) => [...(K.eggs || []), ...(K.nests || [])].some(q => hyp(q.x - x, q.z - z) < 2.6);
      let x = K.salon.x + K.salon.r * 0.55, z = K.salon.z - K.salon.r * 0.35;
      for (const [sx, sz] of [[0.55, -0.35], [-0.55, -0.35], [0.55, 0.35], [-0.55, 0.35]]) { const cx = K.salon.x + K.salon.r * sx, cz = K.salon.z + K.salon.r * sz; if (api.isFloor(cx, cz) && !near(cx, cz)) { x = cx; z = cz; break; } }
      api.box(x, 0.45, z, 1.6, 0.9, 1.0, 0xb08a6a, 0); api.box(x, 1.0, z, 1.4, 0.3, 0.8, 0x6b4a36, 0);
      api.glow(x, z + 0.4, 2.4, 0xffa040, 0.28); K.oven = { x, z };
    }
    void rnd;
  }

  // ════════════════ kurSon: nesneler, yoldaşlar, konuşmalar ════════════════
  function kurSon(L, api) {
    const g0 = G_(), A = L.areas || [], K = L.kl || {};
    L.nesneler = L.nesneler || []; L.hedefler = L.hedefler || [];
    const offs = []; const on = (n, fn) => { if (g0 && g0.on) { try { const r = g0.on(n, e => { if (g0.L === L || n === 'zone') fn(e); }); if (typeof r === 'function') offs.push(r); } catch (e) { /* yok */ } } };
    let T = 0; const TQ = []; const later = (sn, fn) => { TQ.push({ t: T + sn, fn }); };
    const S = { t: 0, delivered: 0, area: -1, started: 0, eggs: [], nests: [], rec: false, endT: 0, endStep: 0, perde: null, say1: 0, hint: 0, golge: null };
    // kapı: arena girişi sis perdesi
    const gatePts = A.map(a => a.gate); for (let k = 1; k < A.length; k++) A[k].gate = null;   // motorun şeker kapılarını kapat
    const arenaK = A.length - 1;
    if (gatePts[arenaK]) S.perde = perde(api, L, gatePts[arenaK]);
    // kırık kabuk + beşik (arena)
    let cr = null;
    if (K.arena) { cr = cradle(api, K.arena.x - K.arena.r * 0.55, K.arena.z + K.arena.r * 0.2); K.shell = { x: cr.shellX, z: cr.shellZ }; K.shellGlow = sn => { cr.glow.t = 0; cr.glow.d = sn; }; if (K.arena) S.golge = golge(api, K.arena.x, K.arena.z - K.arena.r - 7); }
    // yumurtalar ve yuvalar — son kontrol: bütün eşyalar konduktan sonra yer hâlâ boş mu? (değilse en yakın boş zemine kaydır; Feza yuvaya varamazsa yumurta elde kalırdı)
    const HA0 = g0 && g0.halaApi;
    const bosYer = (p, r) => {
      if (!HA0 || !HA0.isFloor || !HA0.circleFree || !p) return p;
      if (HA0.isFloor(p.x, p.z) && HA0.circleFree(p.x, p.z, r)) return p;
      for (let d = 0.5; d <= 6; d += 0.5) for (let k = 0; k < 16; k++) { const a = k * TAU / 16, x = p.x + Math.sin(a) * d, z = p.z + Math.cos(a) * d; if (HA0.isFloor(x, z) && HA0.circleFree(x, z, r)) { p.x = x; p.z = z; return p; } }
      return p;
    };
    try { (K.eggs || []).forEach(p => bosYer(p, 0.9)); (K.nests || []).forEach(p => bosYer(p, 1.0)); } catch (e) { /* yok */ }
    const YC = ['#ffb4cc', '#ffc2a0', '#ffd3a8'];
    (K.eggs || []).forEach((p, i) => {
      let egg = null;
      try { if (typeof EJDERHA !== 'undefined' && EJDERHA.yumurta) egg = EJDERHA.yumurta(i); } catch (e) { egg = null; }
      const mesh = new THREE.Group(); if (egg) { egg.root.scale.setScalar(1.7); mesh.add(egg.root); }
      const ring = new THREE.Mesh(geo('er', () => kp(new THREE.RingGeometry(0.9, 1.1, 32).rotateX(-PI / 2))), new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); ring.position.y = 0.07; ring.renderOrder = 2; mesh.add(ring); api.dispose(ring.material);   // (öne çekik: iPad'de zeminle titreşmesin)
      const o = { id: 'yum' + i, tur: 'tasinir', x: p.x, z: p.z, r: 1.3, y: 0, mesh, kucakY: 1.05, kabulId: 'yuva', ringM: ring, egg, renk: YC[i % 3] };
      o.aldi = () => { ring.visible = false; if (i === 0) say('b09_yumurta_p', { force: true }); S.hint = 0; };   // (ipucu sayacı sıfırlanır: yoksa yumurtayı alır almaz "Yuvaya götür" denirdi)
      L.nesneler.push(o); S.eggs.push(o);
      const n = K.nests[i]; const nm = nestMesh(api, n.x, n.z); S.nests.push(nm);
      L.hedefler.push({ id: 'yuva', x: n.x, z: n.z, r: 1.7, y: 0.1, yerlesti: (eo) => { eggWarm(eo); } });
      api.glow(p.x, p.z, 1.6, 0xffe08a, 0.1);
    });
    function eggWarm(o) {
      S.delivered++; S.hint = 0;   // (kalp + pırıltı patlaması motorda zaten var: ikinci kalp patlaması üst üste biniyordu)
      if (o.egg && o.egg.mesh && o.egg.mesh.material) { const m = o.egg.mesh.material; m.emissive = new THREE.Color(0xff9ab8); m.emissiveIntensity = 0.45; try { m.color.lerp(new THREE.Color(0xffc8d8), 0.45); } catch (e) { /* yok */ } }
      try { if (o.egg) o.egg.kir(); } catch (e) { /* yok */ }
      if (S.delivered === 1) say('b09_yuva_tamam', { force: true, once: false });
      else if (S.delivered === 2) say('b09_yuva_tamam', { force: true, once: false });
      else if (S.delivered >= 3 && S.perde && S.perde.open) { /* perde zaten açık (Pırıl açtı): "Sis çekiliyor" demeyelim; kalpler yeter */ }
      else if (S.delivered >= 3) { say('b09_yumurta3', { force: true }); later(3.5, () => { if (S.perde && !S.perde.open) { S.perde.open = true; sfx('unlock', { x: S.perde.x, z: S.perde.z }); later(2.5, () => say('b09_kapi', { force: true })); } }); }
    }
    // KILIT-YUMUSAK: yumurtalar yarım kalsa da perde açılır (Feza 4,5 yaşında; hiçbir ilerleme isteğe bağlı işe bağlı değil).
    // Pırıl perdeye uçar, tek pırıltı + kilit sesi, sonra "Büyük salonun kapısı açıldı." Yumurtalar oyunda kalır (ödül/eğlence).
    function perdeYedekAc() {
      const pd = S.perde; if (!pd || pd.open) return;
      pd.open = true; S.perdeYedek = 1; pirilGit(pd.x, pd.z);
      sfx('unlock', { x: pd.x, z: pd.z }); burst('sparkle', pd.x, 1.6, pd.z, { color: '#ffe6f0', count: 14 });
      later(1.6, () => say('b09_kapi', { force: true, once: false }));
    }
    // dostlar: Baba, Kartal (BABA.kur / KARTAL.kur), Hala (fırıncı modeli, yürür)
    let baba = null, kartal = null, hala = null, halaT = 0;
    const hero = () => ({ pos: g0.P.pos, face: g0.P.face }), HA = g0 && g0.halaApi;
    try {
      if (typeof BABA !== 'undefined' && BABA.kur && HA) baba = BABA.kur({ scene, hero, free: HA.circleFree, move: HA.moveXZ, route: (x, z, tx, tz) => HA.routeTo(tx, tz, { x, z }),
        enemies: () => g0.enemies.filter(e => !e.dead), sersemlet: (e, sn) => { try { g0.stunEnemy(e, sn); } catch (er) { /* yok */ } }, sfx, say: (k, p) => HA.say(k, p) });
    } catch (e) { console.warn('[kale] Baba', e); baba = null; }
    try {
      if (typeof KARTAL !== 'undefined' && KARTAL.kur && HA) kartal = KARTAL.kur({ scene, hero, enemies: () => g0.enemies.filter(e => !e.dead), it: (e, dx, dz) => { try { g0.pushEnemy(e, e.x + dx * 4, e.z + dz * 4, 1); } catch (er) { /* yok */ } }, sfx });
    } catch (e) { console.warn('[kale] Kartal', e); kartal = null; }
    try { if (typeof HALA !== 'undefined' && HALA.firinciModel) { hala = HALA.firinciModel(api); api.add(hala); } } catch (e) { hala = null; }
    // Hala baştan beri yanımızda (cümleler "Hala köprüde bekliyordu / sepetini gösterdi" diyor; eskiden yalnız salonda beliriyordu)
    let halaPos = { x: (L.start ? L.start.x : 0) - 2, z: (L.start ? L.start.z : 0) + 1 };
    if (hala) hala.position.set(halaPos.x, 0, halaPos.z);
    api.dispose({ dispose() { try { if (baba) baba.dispose(); if (kartal) kartal.dispose(); } catch (e) { /* yok */ } for (const f of offs) { try { f(); } catch (e) { /* yok */ } } } });
    // otomatik yardım kuyruğu: Baba + Kartal (B9–B10 ayarlı), Hala (ekmek)
    try {
      if (typeof COMPANION !== 'undefined' && COMPANION.register) {
        if (!KALE._reg) {
          KALE._reg = true;
          if (typeof BABA !== 'undefined' && BABA.kayit) COMPANION.register('baba', BABA.kayit);
          if (typeof KARTAL !== 'undefined' && KARTAL.kayit) COMPANION.register('kartal', KARTAL.kayit);
          COMPANION.register({ id: 'hala_kale', ad: 'Hala ışık ekmeği', bolumler: ['kale', 'fener'], bekleme: 60, ilkBekleme: 8, sure: 2.6, esik: 0.3, dusman: 99, tetik: 'can',
            etkin: () => !!(KALE._halaOn), eylem: c => { try { if (c.api.iyilestir) c.api.iyilestir(0.5); if (c.api.burst) c.api.burst('hearts', c.P.pos.x, 1.4, c.P.pos.z, { count: 6 }); } catch (e) { return false; } return true; } });
        }
      }
    } catch (e) { console.warn('[kale] COMPANION', e); }
    KALE._halaOn = false; L.kaleS = S;   // kaleS: testler için (perde / yumurta durumu)

    // ── olaylar ──
    on('happy', e => {   // boss neşelendi: Kalp Işığı yolda; kuleden gölge
      if (!e || !e.boss || e.type !== 'huysuzEjderha') return;
      S.endT = S.t; S.endStep = 1;
    });
    on('zone', () => { KALE._halaOn = false; });

    const sayAt2 = (t, key, o) => { if (S.endStep && S.t - S.endT >= t && !S['e_' + key]) { S['e_' + key] = 1; say(key, Object.assign({ force: true, once: false }, o || {})); return true; } return false; };
    const yakinPerde = (pd, px, pz) => { const so = pd.solids; for (let i = 0; i < so.length; i++) if (hyp(px - so[i].x, pz - so[i].z) < 6) return true; return false; };
    api.anim((dt, hx, hz) => {
      dt = Math.min(dt, 0.05); T += dt; S.t = T;
      for (let i = TQ.length - 1; i >= 0; i--) if (T >= TQ[i].t) { const f = TQ[i].fn; TQ.splice(i, 1); try { f(); } catch (e) { /* yok */ } }
      const P = g0 && g0.P; if (!P) return;
      const playing = live();
      if (baba && baba.update) baba.update(dt); if (kartal && kartal.update) kartal.update(dt);
      // motor (nesneNorm) L.nesneler'i kopyalayıp değiştirir: S.eggs canlı kopyaları göstersin (tut / yerlesik / x,z güncel olsun; yoksa ipuçları teslim edilmiş yumurtayı sorar)
      const NS = L.nesneler; if (NS) for (let i = 0; i < S.eggs.length; i++) { const id = S.eggs[i].id; for (let j = 0; j < NS.length; j++) if (NS[j].id === id) { if (NS[j] !== S.eggs[i]) S.eggs[i] = NS[j]; break; } }   // (kare başına kapanış/dizi yok)
      // yumurta halkası + yuva halkası nabzı
      for (let i = 0; i < S.eggs.length; i++) { const o = S.eggs[i]; if (o.egg && o.egg.update) o.egg.update(dt); if (o.ringM && !o.tut && !o.yerlesik) { o.ringM.visible = true; o.ringM.material.opacity = 0.6 + 0.25 * Math.sin(T * 3); } }
      for (let i = 0; i < S.nests.length; i++) { const full = L.hedefler[i] && L.hedefler[i].dolu; S.nests[i].ring.material.opacity = full ? 0.2 : 0.55 + 0.25 * Math.sin(T * 3 + i); }
      // kabuk parlaması
      if (cr) { const gl = cr.glow; if (gl.d > 0) { gl.t += dt; const u = gl.t / gl.d; cr.sm.emissiveIntensity = u < 1 ? 1.2 * Math.sin(u * PI) : 0; if (u >= 1) gl.d = 0; } }
      // galeri resimleri: Feza resmin kuzeyine geçince (kamera güneyden bakar) resim önünde ekranı kapatmasın → yavaşça söner
      if (K.frames) for (const f of K.frames) { const on = !(P.pos.z < f.position.z - 0.5 && Math.abs(P.pos.x - f.position.x) < 14); const s = f.scale.y + ((on ? 1 : 0) - f.scale.y) * Math.min(1, dt * 6); f.scale.set(1, Math.max(0.001, s), 1); f.visible = s > 0.02; }
      // sis perdesi
      if (S.perde) {
        const pd = S.perde;
        if (!pd.open) pd.pm.opacity = 0.5 + 0.08 * Math.sin(T * 2);
        else if (pd.anim < 1) { pd.anim = Math.min(1, pd.anim + dt / 1.8); pd.pm.opacity = 0.5 * (1 - pd.anim); pd.panel.position.y = 1.9 + pd.anim * 2.4; if (pd.anim >= 1) { pd.panel.visible = false; for (const so of pd.solids) so.alive = false; L._sh = null; } }
        // perde önünde (≤6 m) toplam süre birikir (durmak da, geri gelmek de sayılır): 4 sn'de Pırıl perdeyi açar.
        // (Eski "yumurtayı yuvaya taşı" ipucu kaldırıldı: Feza'yı geri gönderiyor, 3 sn sonra kapı zaten açılıyordu → kafa karışıklığı.)
        if (!pd.open && playing && yakinPerde(pd, P.pos.x, P.pos.z)) {   // perdenin herhangi bir yerine yakın (kapı noktası perdenin ucunda kalabilir)
          S.perdeNear = (S.perdeNear || 0) + dt;
          if (S.perdeNear >= 4) perdeYedekAc();
        }
        if (!pd.open && (S.stuck = (S.stuck || 0) + (playing && P.area === arenaK - 1 ? dt : 0)) > 150) perdeYedekAc();   // yedek: çok uzun takılırsa perde kendiliğinden açılır
      }
      if (!playing) return;
      // konuşmalar
      const ar = P.area;
      if (T > 1 && !S.started) { S.started = 1; say('b09_giris_a', { force: true }); }
      if (T > 8 && S.started === 1) { S.started = 2; say('b09_giris_p'); }
      // (Hala modeli yoksa — HALA.firinciModel bu sürümde tanımlı değil — "Hala köprüde / sepetini gösterdi" denmez: görünmeyen birinden söz edilmesin)
      if (T > 15 && S.started === 2) { S.started = 3; if (hala) say('b09_dostlar'); }
      if (T > 21 && S.started === 3) { S.started = 4; say('b09_baba_a'); }
      if (T > 27 && S.started === 4) { S.started = 5; if (hala) say('b09_hala_a'); if (baba && baba.yolGoster && K.eggs[0]) { try { baba.yolGoster(K.eggs[0].x, K.eggs[0].z); } catch (e) { /* yok */ } } }
      if (ar !== S.area) {
        S.area = ar;
        if (ar === 1) { say('b09_avlu', { force: true }); later(8, () => { const e0 = S.eggs[0]; if (e0 && !e0.yerlesik && !e0.tut && g0.P && g0.P.area === 1 && !g0.nesne.tasinan) { say('b09_yumurta1', { force: true }); pirilGit(e0.x, e0.z); } }); }
        if (ar === 2) { say('b09_galeri_a', { force: true }); later(8, () => { if (g0.P && g0.P.area === 2) say('b09_galeri_p', { force: true }); }); }   // ("resme baktı" yalnız galerideyken)   // (b09_yumurta2 "resmin altında" dendi ama yumurta resmin altında değil: kaldırıldı; 25 sn ipucu yumurtayı gösterir)
        // salon: "Baba yumurtayı kucağına aldı / sevgiyle tuttu" cümleleri kaldırıldı — yumurtayı Feza taşıyor, Baba tutmuyor (ve merdivende kavga ortasında çalıyordu)
        if (ar === 3) { say('b09_salon_a', { force: true }); KALE._halaOn = true; if (baba && baba.kampYak && K.salon) { try { baba.kampYak(K.salon.x - 2, K.salon.z - 1); } catch (e) { /* yok */ } } }
        if (ar === 4) say('b09_merdiven', { force: true });
        if (ar === arenaK) { say('b09_boss_giris', { force: true, once: false }); later(7, () => say('b09_boss_p', { force: true, once: false })); }
      }
      // Hala: Feza'nın yanında yürür (geride kalırsa — duvar arkası — sessizce arkasına gelir)
      if (hala && hala.visible) {
        // hedef: Feza'nın SOLU, biraz kuzeyi (kamera güneyden bakar; "arkası" kameraya doğru olunca Hala ekranda Feza'yı kapatıyordu)
        let tx = P.pos.x - 2.0, tz = P.pos.z - 0.4; if (HA && !HA.isFloor(tx, tz)) { tx = P.pos.x + 2.0; }
        const dx = tx - halaPos.x, dz = tz - halaPos.z, d = hyp(dx, dz);
        if (d > 14 && HA && HA.isFloor(tx, tz)) { halaPos.x = tx; halaPos.z = tz; }
        else if (d > 1.2) { const st = Math.min(d, (d > 5 ? 6.0 : 4.0) * dt), nx = halaPos.x + dx / d * st, nz = halaPos.z + dz / d * st; if (HA && HA.isFloor(nx, nz)) { halaPos.x = nx; halaPos.z = nz; } hala.rotation.y = Math.atan2(dx, dz); }
        else hala.rotation.y = Math.atan2(P.pos.x - halaPos.x, P.pos.z - halaPos.z);
        hala.position.set(halaPos.x, 0, halaPos.z);
      }
      // yumurta ipuçları: Feza uzun süre yumurtaya gitmezse Pırıl gösterir
      if (ar >= 1 && ar <= 3 && !g0.nesne.tasinan) { const e = S.eggs[ar - 1]; if (e && !e.yerlesik && !e.tut) { S.hint += dt; if (S.hint > 25) { S.hint = 0; pirilGit(e.x, e.z); say('b09_ipucu_yumurta', { force: true, once: false, gap: 10 }); } } }
      // (taşıma ipucu yalnız yumurta odalarında: merdivende/boss savaşında "yuvaya götür" deyip Pırıl'ı geri uçurmasın — yumurtalar isteğe bağlı)
      else if (g0.nesne.tasinan && ar >= 1 && ar <= 3) { S.hint += dt; if (S.hint > 25) { S.hint = 0; let h = null, hd = 1e9; for (const q of L.hedefler) { if (q.dolu || q.id !== 'yuva') continue; const d = hyp(q.x - P.pos.x, q.z - P.pos.z); if (d < hd) { hd = d; h = q; } } if (h) pirilGit(h.x, h.z); say('b09_ipucu_yuva', { force: true, once: false, gap: 10 }); } }   // en yakın boş yuva
      // boss sonrası: gölge (adı yok), anne sözü
      if (S.endStep) {
        const el = T - S.endT;
        if (S.golge) { const u = clamp((el - 2.5) / 2.5, 0, 1); S.golge.m.opacity = 0.5 * u; }
        sayAt2(5, 'b09_kule_a'); sayAt2(11, 'b09_golge'); sayAt2(17, 'b09_anne_son'); sayAt2(23, 'b09_son_p');
        if (hala && el > 3 && !S.e_hala) { S.e_hala = 1; say('b09_hala_son', { force: true, once: false }); }
      }
    });
  }

  BOLUM.define('kale', {
    ad: 'Ejderhanın Kalesi',
    taban: 'castle', size: 100, side: 2, yoldas: ['bilbo'],
    areas: [{ id: 'a1', ad: 'Gökkuşağı Köprüsü', rooms: 1 }, { id: 'a2', ad: 'Oyuncak Asker Avlusu', rooms: 1 }, { id: 'a3', ad: 'Eski Resimler Galerisi', rooms: 1 },
      { id: 'a4', ad: 'Sıcak Salon', rooms: 1 }, { id: 'a5', ad: 'Kule Merdiveni', rooms: 1 }],
    muzik: 'kale', malzeme: 'isik9', kayipEsya: null, final: false,
    isik: { fog: [0xf6dcc0, 44, 112], hemiSky: 0xffd9b4, hemiGround: 0x8a6a58, hemi: 0.9, sunColor: 0xffa860, sun: 1.25, sunOffset: [-20, 19, 11],   // E8910: sıcak GÜN BATIMI (düşük güneş, uzun gölgeler, şeftali sis)
      env: [0xf0c8a0, 0xffd8b0, 0x7a6058, 0.6], bloom: 0.28, exposure: 1.05, sat: 1.18, vig: 0.22, fezaLight: 1.65, fezaLightColor: 0xfff4dc },
    zemin: { soluk: 0.36 },
    minimap: { zemin: '#c8b89a' },
    harita: { ad: 'Ejderhanın Kalesi', detay: 'Üç yumurta, eski resimler ve Huysuz Ejderha', renk: '#ec7f98', simge: '🏰' },
    yolculuk: { arac: 'kanat', cumle: 'Gökkuşağına doğru kanat çırpıyoruz!' },
    parcaIpucu: 'Büyük Fener gökkuşağı adalarının tepesinde.',
    huysuzlar: { oyuncakAsker: 3 }, elitler: ['oyuncakAsker'], boss: 'huysuzEjderha',
    yerlesim, kur, kurSon,
  });
  return { say };
})();
