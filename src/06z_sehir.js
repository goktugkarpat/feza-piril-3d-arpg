/* ── Bölüm 8: Surlu Şehir (Feza ile Pırıl: Büyük Fener) ──
   Sahibi: B78. Sis şehri yutmuş: herkes bir şeyi unutmuş. Ana mekanik "Hatırlatma": sıradaki şehirlinin başında resimli düşünce balonu var,
   yerde onun unuttuğu eşya parlıyor; Feza eşyayı alıp şehirliye götürür → rengi geri gelir, adını söyler. Bilbo yalnız SIRADAKİ kişiye pati izi gösterir.
   5 kişi (Simitçi Selim, Süpürgeci Sevim, Boyacı Tahir, Nöbetçi Nuri, Tellal Temel) hatırlayınca Saat Kulesi'nin kapısı açılır.
   Kule içinde: çarklar, oyuncak rafı + kırık taç (AD YOK, EFEKT YOK), dev anahtar → tek çan + tek sis dalgası → şehir renklenir.
   Arena: Turnuva Meydanı — Huysuz Şövalye (src/05z_sehir.js; sancak/havuç oyunları motorun 'sovalye' davranışında).
   Genel ad: SEHIR. Cümleler: src/02l_sehir.js (b08_...). Mor yok. */
const SEHIR = (() => {
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
  const GM = {};
  const geo = (k, f) => GM[k] || (GM[k] = f());
  const kp = o => { if (o) o.userData.keep = true; return o; };
  const WHO = [
    { id: 'selim', ad: 'Simitçi Selim', model: 'simitci', esya: 'simit', balon: 'b08_simitci', hat: 'b08_hatirla1', adi: 'b08_ad_selim' },
    { id: 'sevim', ad: 'Süpürgeci Sevim', model: 'supurgeci', esya: 'supurge', balon: 'b08_supurge', hat: 'b08_hatirla2', adi: 'b08_ad_sevim' },
    { id: 'tahir', ad: 'Boyacı Tahir', model: 'simitci', esya: 'firca', balon: 'b08_boyaci', hat: 'b08_hatirla3', adi: 'b08_ad_tahir', beret: 0x4f86d8 },
    { id: 'nuri', ad: 'Nöbetçi Nuri', model: 'nobetci', esya: 'ponpon', balon: 'b08_ponpon', hat: 'b08_nobetci', adi: 'b08_ad_nuri' },
    { id: 'temel', ad: 'Tellal Temel', model: 'tellal', esya: 'tokmak', balon: 'b08_tellal', hat: 'b08_hatirla5', adi: 'b08_ad_temel' },
  ];
  const ROOM_OF = [1, 3, 5, 6, 7];   // şehirlinin durduğu oda (ana oda sırası)

  // ════════════════ Yerleşim ════════════════
  function yerlesim(L, api) {
    const A = L.areas || [];
    const mainRooms = a => (A[a] ? A[a].rooms.filter(ri => L.rooms[ri] && L.rooms[ri].kind !== 'side') : []);
    const areaOf = {}; A.forEach((a, k) => { if (!a.boss) a.rooms.forEach(ri => { areaOf[ri] = k; }); });
    // düşman az: alan 1 yok, 2 yok, 3 yok; alan 4'te (sur yolu) 1–2 sersem nöbetçi/süpürgeci; kule içi yok
    const LIST = [null, null, null, ['sehirNobetci', 'sisCocugu', 'sehirSupurgeci'], null];
    const CAP = [0, 0, 0, 2, 0], packN = {}, keep = [];
    for (const sp of L.spawns || []) {
      const ai = areaOf[sp.room];
      if (sp.room === 0) continue;
      if (ai === undefined) { keep.push(sp); continue; }
      const list = LIST[Math.min(ai, LIST.length - 1)];
      if (!list) continue;
      const n = packN[sp.pack] = (packN[sp.pack] || 0) + 1;
      if (n > CAP[Math.min(ai, CAP.length - 1)]) continue;
      sp.type = list[(n - 1 + sp.pack) % list.length];
      if (sp.elite) sp.type = 'sehirNobetci';
      delete sp.variant;
      keep.push(sp);
    }
    L.spawns.length = 0; L.spawns.push(...keep);
    const spot = (cx, cz, rmin, rmax, r = 1.2, avoid = [], gap = 3.5, tries = 120) => {
      for (let t = 0; t < tries; t++) {
        const a = api.rnd() * TAU, d = rmin + api.rnd() * (rmax - rmin), x = cx + Math.sin(a) * d, z = cz + Math.cos(a) * d;
        if (api.isFloor(x, z) && api.circleFree(x, z, r) && avoid.every(q => hyp(q.x - x, q.z - z) > gap)) return { x, z };
      }
      return null;
    };
    const Z = L.sh = { npc: [], item: [], boards: [], poles: [], fountain: null, tower: null, arena: null, path: [] };
    const used = [];
    WHO.forEach((w, i) => {
      const rm = L.rooms[ROOM_OF[i]] || L.rooms[mainRooms(i)[0]];
      const R = Math.max(5, (rm.r || 8));
      const n = spot(rm.x, rm.z, R * 0.2, R * 0.5, 1.2, used, 4) || { x: rm.x, z: rm.z }; used.push(n);
      const it = spot(n.x, n.z, 4.5, 6.5, 1.0, used, 3.5) || spot(rm.x, rm.z, 2, R * 0.6, 1.0, used, 3) || { x: rm.x + 3, z: rm.z }; used.push(it);
      Z.npc[i] = n; Z.item[i] = it;
    });
    // tabela tahtaları (alan 3 odaları) ve bayrak direkleri (alan 4 odaları)
    { const r1 = L.rooms[ROOM_OF[2]], r2 = L.rooms[4];
      for (const rm of [r2, r1]) { if (!rm) continue; for (let i = 0; i < 2 && Z.boards.length < 3; i++) { const p = spot(rm.x, rm.z, (rm.r || 8) * 0.4, (rm.r || 8) * 0.8, 0.9, used.concat(Z.boards), 3.5); if (p) Z.boards.push(p); } } }
    { for (const ri of [6, 7]) { const rm = L.rooms[ri]; if (!rm) continue; for (let i = 0; i < 3; i++) { const p = spot(rm.x, rm.z, (rm.r || 8) * 0.45, (rm.r || 8) * 0.85, 0.7, used.concat(Z.poles), 3.0); if (p) Z.poles.push(p); } } }
    { const rm = L.rooms[0]; const st = L.start || { x: rm.x, z: rm.z }; Z.fountain = spot(rm.x, rm.z, 4.5, Math.max(5, (rm.r || 8) * 0.6), 2.0, [st], 4.5) || { x: rm.x + 5, z: rm.z - 3 }; }
    // saat kulesi içi: alan 5 (2 oda): 1. oda girişte oyuncak rafı, 2. oda dev anahtar
    { const mr = mainRooms(4), a = L.rooms[mr[0]], b = L.rooms[mr[mr.length - 1]];
      if (a && b) {
        const R = a.r || 8, g = A[4] && A[4].gate;
        let sh = null;
        if (g) { const dx = a.x - g.x, dz = a.z - g.z, l = hyp(dx, dz) || 1, nx = -dz / l, nz = dx / l; for (const s of [1, -1]) for (const d of [4.6, 5.4, 3.8]) { const x = g.x + dx / l * d + nx * s * 3.2, z = g.z + dz / l * d + nz * s * 3.2; if (!sh && api.isFloor(x, z) && api.circleFree(x, z, 1.0)) sh = { x, z, yaw: Math.atan2(nx * s, nz * s) }; } }
        sh = sh || spot(a.x, a.z, R * 0.3, R * 0.6, 1.0) || { x: a.x, z: a.z, yaw: 0 };
        const key = spot(b.x, b.z, 0, (b.r || 8) * 0.25, 1.0) || { x: b.x, z: b.z };
        Z.tower = { a: { x: a.x, z: a.z, r: R }, b: { x: b.x, z: b.z, r: b.r || 8 }, shelf: sh, key };
      } }
    { const ar = L.rooms.filter(r => r.kind !== 'side').pop(); if (ar) Z.arena = { x: ar.x, z: ar.z, r: ar.r || 11 }; }
    // ana yolun poliçizgisi (Bilbo'nun pati izi için)
    { const ls = L.links.filter(l => l.main && l.curve).sort((p, q) => p.b - q.b); const pts = [];
      for (const l of ls) { let c = l.curve.map(p => ({ x: p[0], z: p[1] })); const ra = L.rooms[l.a]; if (c.length > 1 && ra && hyp(c[0].x - ra.x, c[0].z - ra.z) > hyp(c[c.length - 1].x - ra.x, c[c.length - 1].z - ra.z)) c = c.reverse(); pts.push(...c); }
      Z.path = pts; }
  }

  // ════════════════ Görsel parçalar ════════════════
  const stoneMat = () => GM.stoneM || (GM.stoneM = kp(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })));
  function haloTex() {
    if (GM.haloT) return GM.haloT;
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.userData = { keep: true }; return (GM.haloT = t);
  }
  // eşya modelleri (birim ~0,8 m; Feza kucağına alır)
  function esyaMesh(kind) {
    const g = new THREE.Group(), m = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6 }, o));
    const cy = (r0, r1, h, c, y, x = 0, z = 0) => { const q = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, 12), m(c)); q.position.set(x, y, z); g.add(q); return q; };
    const sp = (r, c, x, y, z) => { const q = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), m(c)); q.position.set(x, y, z); g.add(q); return q; };
    if (kind === 'simit') { cy(0.42, 0.42, 0.05, 0xc9a24a, 0.1); for (let i = 0; i < 5; i++) { const a = i * TAU / 5; const t = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.045, 8, 14), m(0xe8a04a)); t.rotation.x = PI / 2; t.position.set(Math.sin(a) * 0.22, 0.17, Math.cos(a) * 0.22); g.add(t); } }
    else if (kind === 'supurge') { cy(0.03, 0.03, 1.1, 0x9a6a3a, 0.55); const c = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 10), m(0xe8c54a)); c.position.y = 0.12; c.rotation.x = PI; g.add(c); }
    else if (kind === 'firca') { cy(0.025, 0.025, 0.7, 0x9a6a3a, 0.4); sp(0.1, 0xf08aa0, 0, 0.8, 0).scale.set(1, 1.4, 1); cy(0.2, 0.2, 0.12, 0x4f86d8, 0.06, 0.3, 0); }
    else if (kind === 'ponpon') { sp(0.22, 0xffffff, 0, 0.3, 0); sp(0.22, 0xffffff, 0.1, 0.4, 0.05); cy(0.05, 0.05, 0.12, 0xd84a4a, 0.1); }
    else { cy(0.03, 0.03, 0.6, 0x9a6a3a, 0.35, -0.12); cy(0.03, 0.03, 0.6, 0x9a6a3a, 0.35, 0.12); sp(0.07, 0xd84a4a, -0.12, 0.68, 0); sp(0.07, 0xd84a4a, 0.12, 0.68, 0); }
    g.scale.setScalar(1.5); return g;
  }
  // düşünce balonu: kanvas dokusu (eşya silueti → hatırlayınca kalp)
  function balonTex(kind, heart) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.fillStyle = 'rgba(255,255,255,0.95)'; x.strokeStyle = '#d6cdbd'; x.lineWidth = 6; x.beginPath(); x.arc(64, 60, 50, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.arc(48, 118, 7, 0, TAU); x.fill(); x.stroke();
    x.fillStyle = heart ? '#e9566a' : '#6c6560'; x.strokeStyle = x.fillStyle; x.lineWidth = 8; x.lineCap = 'round';
    if (heart) { x.beginPath(); x.moveTo(64, 92); x.bezierCurveTo(20, 60, 40, 24, 64, 48); x.bezierCurveTo(88, 24, 108, 60, 64, 92); x.fill(); }
    else if (kind === 'simit') { x.lineWidth = 12; x.beginPath(); x.arc(64, 60, 24, 0, TAU); x.stroke(); }
    else if (kind === 'supurge') { x.beginPath(); x.moveTo(84, 22); x.lineTo(54, 66); x.stroke(); x.beginPath(); x.moveTo(44, 62); x.lineTo(70, 96); x.lineTo(34, 88); x.closePath(); x.fill(); }
    else if (kind === 'firca') { x.beginPath(); x.moveTo(88, 22); x.lineTo(50, 74); x.stroke(); x.beginPath(); x.ellipse(44, 84, 12, 17, 0.6, 0, TAU); x.fill(); }
    else if (kind === 'ponpon') { x.beginPath(); x.arc(52, 60, 20, 0, TAU); x.arc(74, 54, 20, 0, TAU); x.arc(64, 74, 18, 0, TAU); x.fill(); }
    else { x.beginPath(); x.moveTo(34, 36); x.lineTo(62, 78); x.moveTo(94, 36); x.lineTo(66, 78); x.stroke(); x.beginPath(); x.arc(32, 32, 9, 0, TAU); x.arc(96, 32, 9, 0, TAU); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function tabelaTex(i, boyali) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d');
    x.fillStyle = boyali ? ['#ffe6a8', '#cfeedd', '#ffd3c4'][i % 3] : '#d9d3c6'; x.fillRect(0, 0, 256, 160);
    x.strokeStyle = boyali ? '#a0743a' : '#b0a898'; x.lineWidth = 10; x.strokeRect(6, 6, 244, 148);
    if (boyali) {
      x.fillStyle = ['#e0903a', '#4fa86a', '#e0607a'][i % 3];
      if (i % 3 === 0) { x.beginPath(); x.ellipse(128, 84, 70, 38, 0, 0, TAU); x.fill(); x.fillStyle = '#ffe6a8'; x.beginPath(); x.ellipse(128, 84, 24, 12, 0, 0, TAU); x.fill(); }
      else if (i % 3 === 1) { for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(128 + Math.sin(k * 1.256) * 36, 84 - Math.cos(k * 1.256) * 36, 22, 0, TAU); x.fill(); } x.fillStyle = '#ffd24a'; x.beginPath(); x.arc(128, 84, 16, 0, TAU); x.fill(); }
      else { x.beginPath(); x.ellipse(120, 84, 60, 34, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(176, 84); x.lineTo(222, 52); x.lineTo(222, 116); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(90, 76, 8, 0, TAU); x.fill(); }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function clockTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#6a5a48'; x.beginPath(); x.arc(128, 128, 124, 0, TAU); x.fill();
    x.fillStyle = '#fff4dc'; x.beginPath(); x.arc(128, 128, 108, 0, TAU); x.fill();
    x.fillStyle = '#6a5a48'; for (let i = 0; i < 12; i++) { const a = i * TAU / 12; x.beginPath(); x.arc(128 + Math.sin(a) * 90, 128 - Math.cos(a) * 90, i % 3 ? 5 : 9, 0, TAU); x.fill(); }
    x.strokeStyle = '#4a3c30'; x.lineCap = 'round'; x.lineWidth = 10; x.beginPath(); x.moveTo(128, 128); x.lineTo(128, 52); x.stroke(); x.lineWidth = 7; x.beginPath(); x.moveTo(128, 128); x.lineTo(176, 148); x.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  // kule kapısı: taş kemer + saat kadranı; kapalıyken sis perdesi
  function kapi(api, L, gate, id) {
    let dx = 0, dz = -1;
    if (typeof ODAKIT !== 'undefined' && ODAKIT && ODAKIT.gateDir) { try { [dx, dz] = ODAKIT.gateDir(L, gate); } catch (e) { /* yok */ } }
    const nx = -dz, nz = dx;
    let lo = 0, hi = 0;
    for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(gate.x + nx * o, gate.z + nz * o)) hi = o; else break; }
    for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(gate.x - nx * o, gate.z - nz * o)) lo = o; else break; }
    const w0 = -lo - 0.6, w1 = hi + 0.6, wd = w1 - w0, cx = (w0 + w1) / 2;
    const grp = new THREE.Group(); grp.position.set(gate.x, 0, gate.z); grp.rotation.y = Math.atan2(nx, nz) - PI / 2; api.add(grp);
    const k = new Kit(), box = geo('kBox', () => kp(new THREE.BoxGeometry(1, 1, 1))), cyl = geo('kCyl', () => kp(new THREE.CylinderGeometry(1, 1, 1, 12)));
    for (const sx of [w0 - 0.3, w1 + 0.3]) { k.add(box, 0xe9dcc2, [sx, 0.35, 0], null, [1.2, 0.7, 1.2]); k.add(box, 0xf3e8d0, [sx, 3.0, 0], null, [0.9, 5.2, 0.9]); k.add(box, 0xd8826a, [sx, 5.8, 0], null, [1.3, 0.5, 1.3]); }
    k.add(box, 0xf3e8d0, [cx, 5.5, 0], null, [wd + 2.4, 0.9, 1.0]);
    const frame = new THREE.Mesh(k.build(), stoneMat()); frame.castShadow = true; grp.add(frame); api.dispose(frame.geometry);
    const cm = new THREE.MeshBasicMaterial({ map: clockTex(), transparent: true }); api.dispose(cm);
    const clk = new THREE.Mesh(geo('kClk', () => kp(new THREE.PlaneGeometry(1, 1))), cm); clk.scale.set(1.5, 1.5, 1); clk.position.set(cx, 5.5, 0.52); grp.add(clk);
    const pm = new THREE.MeshBasicMaterial({ color: 0xf2e8ec, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const panel = new THREE.Mesh(geo('kPlane', () => kp(new THREE.PlaneGeometry(1, 1))), pm); panel.scale.set(wd + 0.4, 4.4, 1); panel.position.set(cx, 2.4, 0); panel.renderOrder = 4; grp.add(panel); api.dispose(pm);
    const solids = [];
    for (let o = w0 + 0.2; o <= w1 - 0.2 + 0.01; o += 0.8) { const so = { x: gate.x + nx * o, z: gate.z + nz * o, r: 0.7, alive: true, tag: 'sehirKapi' }; L.solids.push(so); solids.push(so); }
    L._sh = null;
    return { id, x: gate.x, z: gate.z, grp, panel, pm, solids, open: false, anim: 0, near: 0 };
  }

  // ════════════════ Dekor (kur) ════════════════
  function kur(L, api) {
    const rnd = api.rnd, Z = L.sh || {};
    const box = api.tmp(new THREE.BoxGeometry(1, 1, 1)), cyl = api.tmp(new THREE.CylinderGeometry(1, 1, 1, 12)), cone4 = api.tmp(new THREE.ConeGeometry(1, 1, 4)),
      sph = api.tmp(new THREE.SphereGeometry(1, 10, 7)), cone = api.tmp(new THREE.ConeGeometry(1, 1, 9)), hemi = api.tmp(new THREE.SphereGeometry(1, 12, 6, 0, TAU, 0, PI / 2));
    const P = (g, x, y, z, sx, sy, sz, c, yaw, rx, rz) => api.put(g, x, y, z, sx, sy, sz, c, yaw || 0, rx || 0, rz || 0);
    const WALL = [0xffd9b0, 0xbfe8d2, 0xfff0a8, 0xcfe4f6, 0xffc9c0], ROOF = [0xd8826a, 0xc86a5a, 0x9a6a58];
    const house = (x, z, s, yaw, south) => {
      const w = (3.0 + rnd() * 1.6) * s, d = (2.6 + rnd() * 1.2) * s, h = (south ? 1.4 : 2.4 + rnd() * 1.4) * s, c = WALL[(rnd() * WALL.length) | 0], rc = ROOF[(rnd() * ROOF.length) | 0];
      P(box, x, h / 2, z, w, h, d, c, yaw); P(cone4, x, h + 0.7 * s, z, w * 0.78, 1.4 * s, d * 0.78, rc, yaw + PI / 4);
      const f = [Math.sin(yaw), Math.cos(yaw)];   // ön yüz (+z yerel) pencere/kapı
      const px = x + f[0] * (d / 2 + 0.02), pz = z + f[1] * (d / 2 + 0.02);
      P(box, px, 0.7 * s, pz, 0.7 * s, 1.3 * s, 0.05, 0x8a5a3c, yaw); if (!south) P(box, px + Math.cos(yaw) * w * 0.28, h * 0.62, pz - Math.sin(yaw) * w * 0.28, 0.55 * s, 0.6 * s, 0.05, 0xfff3c0, yaw);
    };
    const stall = (x, z, s, yaw) => { P(box, x, 0.5 * s, z, 2.0 * s, 1.0 * s, 1.0 * s, 0xb98a5a, yaw); P(cone4, x, 1.9 * s, z, 1.9 * s, 0.7 * s, 1.0 * s, rnd() < 0.5 ? 0xe8806a : 0x6ab0d8, yaw + PI / 4); P(cyl, x - 0.9 * s, 0.9 * s, z, 0.05 * s, 1.8 * s, 0.05 * s, 0xe8d8b8); };
    const tree = (x, z, s) => { P(cyl, x, 0.7 * s, z, 0.13 * s, 1.4 * s, 0.13 * s, 0x8a6a4a); P(sph, x, 1.9 * s, z, 0.95 * s, 0.8 * s, 0.95 * s, 0x86c070); };
    const bush = (x, z, s) => { P(sph, x, 0.35 * s, z, 0.6 * s, 0.4 * s, 0.6 * s, 0x8cc47a); };
    const lampM = new THREE.MeshBasicMaterial({ color: 0xcfc6a8 }); api.dispose(lampM); Z.lampM = lampM;
    const lampGeo = api.tmp(new THREE.SphereGeometry(0.2, 8, 6)); const lamps = [];
    const lamp = (x, z) => { P(cyl, x, 1.3, z, 0.06, 2.6, 0.06, 0x5a4a3a); const m = new THREE.Mesh(lampGeo, lampM); m.position.set(x, 2.7, z); api.add(m); lamps.push({ x, z }); };
    let yeni = false;   // E8910: yeni çevre takımı (src/07m_dekor_sehir.js); yüklenemezse eski basit süsler
    try { if (typeof SEHIR_DEKOR !== 'undefined' && typeof YAPI !== 'undefined') { Z.dekor = SEHIR_DEKOR.olustur(L, api, Z); yeni = true; } } catch (e) { console.warn('SEHIR_DEKOR', e); }
    const kinds = ['house', 'tree', 'stall', 'house', 'bush', 'lamp', 'house', 'tree'];
    const free = (x, z, r) => { for (let a = 0; a < 8; a++) if (api.isFloor(x + Math.cos(a * PI / 4) * r, z + Math.sin(a * PI / 4) * r)) return false; return !api.isFloor(x, z); };
    const places = [];
    if (!yeni) L.rooms.forEach((rm, ri) => {
      const n = 14 + ((rm.r || 8) > 9 ? 4 : 0);
      for (let k = 0; k < n; k++) {
        const a = k * TAU / n + rnd() * 0.2, rad = (rm.r || 8) + 3.6 + rnd() * 1.6, x = rm.x + Math.sin(a) * rad, z = rm.z + Math.cos(a) * rad;
        if (api.isFloor(x, z) || api.linkDist(x, z) < 3.6) continue;
        const south = z > rm.z + 1.0, yaw = Math.atan2(rm.x - x, rm.z - z);
        let f = kinds[(k + ri) % kinds.length], s = 0.9 + rnd() * 0.3;
        if (south && f === 'house') f = 'stall';
        if (!free(x, z, 2.0 * s)) continue;
        if (places.some(q => hyp(q.x - x, q.z - z) < 3.6)) continue;
        places.push({ x, z });
        if (f === 'house') house(x, z, s, yaw, south); else if (f === 'stall') stall(x, z, s, yaw); else if (f === 'tree') tree(x, z, s); else if (f === 'bush') bush(x, z, s); else lamp(x, z);
      }
    });
    // çeşme (başlangıç meydanı)
    if (Z.fountain && !yeni) { const f = Z.fountain; P(cyl, f.x, 0.25, f.z, 1.7, 0.5, 1.7, 0xe0d6c0); P(cyl, f.x, 0.4, f.z, 1.45, 0.2, 1.45, 0x9fd0e8); P(cyl, f.x, 1.0, f.z, 0.22, 1.2, 0.22, 0xe0d6c0); P(cyl, f.x, 1.65, f.z, 0.7, 0.14, 0.7, 0xe0d6c0); api.solid(f.x, f.z, 1.7, 'cesme'); }
    // tabela direkleri
    const boards = [];
    (Z.boards || []).forEach((b, i) => {
      P(cyl, b.x - 0.8, 1.1, b.z, 0.06, 2.2, 0.06, 0x8a6a4a); P(cyl, b.x + 0.8, 1.1, b.z, 0.06, 2.2, 0.06, 0x8a6a4a);
      const mt = new THREE.MeshBasicMaterial({ map: tabelaTex(i, false) }); api.dispose(mt);
      const m = new THREE.Mesh(geo('bd', () => kp(new THREE.PlaneGeometry(1.9, 1.2))), mt); m.position.set(b.x, 1.6, b.z + 0.05); api.add(m); boards.push({ m, mt, i });
      api.solid(b.x, b.z, 0.9, 'tabela');
    });
    // bayrak direkleri (gri → renkli)
    const flags = [], flagCols = [0xe8554a, 0x4f86d8, 0xffd23f, 0x5ab870, 0xe8884a, 0x6ab8e8];
    (Z.poles || []).forEach((p, i) => {
      P(cyl, p.x, 1.6, p.z, 0.07, 3.2, 0.07, 0xe8d8b8); P(sph, p.x, 3.25, p.z, 0.1, 0.1, 0.1, 0xffd24a);
      const mt = new THREE.MeshBasicMaterial({ color: 0xb9b4b0, side: THREE.DoubleSide }); api.dispose(mt);
      const m = new THREE.Mesh(geo('fl', () => kp(new THREE.PlaneGeometry(1.1, 0.7))), mt); m.position.set(p.x + 0.58, 2.85, p.z); api.add(m); flags.push({ m, mt, col: flagCols[i % flagCols.length], ph: i });
      api.solid(p.x, p.z, 0.4, 'bayrak');
    });
    // sis tutamları: alçak, saydam, seyrek (alan 1–4); hatırlayanla incelir
    const wisps = [];
    const NW = 22;
    for (let i = 0; i < NW; i++) {
      const rm = L.rooms[1 + ((i * 7) % Math.max(1, L.rooms.length - 3))]; if (!rm) continue;
      const a = rnd() * TAU, d = rnd() * (rm.r || 8) * 0.8, x = rm.x + Math.sin(a) * d, z = rm.z + Math.cos(a) * d; if (!api.isFloor(x, z)) continue;
      const mt = new THREE.SpriteMaterial({ map: haloTex(), color: 0xf0e6ea, transparent: true, opacity: 0.0, depthWrite: false }); api.dispose(mt);
      const sp = new THREE.Sprite(mt); sp.position.set(x, 0.7 + rnd() * 0.5, z); sp.scale.set(5 + rnd() * 3, 2.2, 1); api.add(sp); wisps.push({ sp, x, z, ph: rnd() * 6 });
    }
    // alçak gökyüzü şeridi: sıcak şeftali
    const skyMat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec2 vUv; void main(){float e=smoothstep(0.0,.7,vUv.y); vec3 c=mix(vec3(.99,.84,.74),vec3(.78,.88,.98),vUv.y); gl_FragColor=vec4(c,e*.5);}' });
    const skyGeo = new THREE.PlaneGeometry(1, 1), sky = new THREE.Mesh(skyGeo, skyMat); sky.renderOrder = 28; sky.frustumCulled = false; api.add(sky); api.dispose(skyGeo); api.dispose(skyMat);
    const up = new THREE.Vector3(), fwd = new THREE.Vector3();
    Z.vis = { boards, flags, wisps, lamps, k: 0.4, fogBase: null };
    let T = 0;
    // Kamera ile Feza arasına giren duvar/kule/ağaç parçaları delik delik seyrelir (Feza hep görünür kalır)
    const OCC = { uH: { value: new THREE.Vector3() }, uC: { value: new THREE.Vector3() }, uR: { value: 2.6 } }, occDone = new Set();
    const occPatch = (mt) => {
      if (!mt || occDone.has(mt) || !(mt.isMeshStandardMaterial || mt.isMeshLambertMaterial || mt.isMeshPhongMaterial) || mt.transparent) return;
      occDone.add(mt); const prev = mt.onBeforeCompile;
      mt.onBeforeCompile = (sh, rd) => {
        if (prev) prev.call(mt, sh, rd);
        sh.uniforms.uH = OCC.uH; sh.uniforms.uC = OCC.uC; sh.uniforms.uR = OCC.uR;
        sh.vertexShader = 'varying vec3 vOccW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n#ifdef USE_INSTANCING\n vOccW = (modelMatrix * instanceMatrix * vec4(transformed,1.0)).xyz;\n#else\n vOccW = (modelMatrix * vec4(transformed,1.0)).xyz;\n#endif');
        sh.fragmentShader = 'varying vec3 vOccW;\nuniform vec3 uH; uniform vec3 uC; uniform float uR;\n' + sh.fragmentShader.replace('void main() {', 'void main() {\n { vec3 ab = uH - uC; float t = dot(vOccW - uC, ab) / dot(ab, ab); float dd = length(vOccW - (uC + ab * clamp(t, 0.0, 1.0)));\n  if (t > 0.0 && t < 0.88 && dd < uR) { float keep = smoothstep(uR * 0.45, uR, dd); float n = fract(sin(dot(floor(gl_FragCoord.xy / 2.0), vec2(12.9898, 78.233))) * 43758.5453); if (n > keep) discard; } }');
      };
      const k = mt.customProgramCacheKey ? mt.customProgramCacheKey() : ''; mt.customProgramCacheKey = () => k + 'occ'; mt.needsUpdate = true;
    };
    let occN = -1;
    api.anim((dt, hx, hz) => {
      dt = Math.min(dt, 0.05); T += dt;
      { const t = CAM.target; OCC.uH.value.set(t.x, t.y + 0.3, t.z); OCC.uC.value.copy(camera.position);
        if (occN !== scene.children.length) { occN = scene.children.length; scene.traverse(o => { if (o.isMesh && !o.isSkinnedMesh && o.name && o.name.startsWith('decor-')) occPatch(o.material); }); } }
      up.setFromMatrixColumn(camera.matrixWorld, 1); fwd.setFromMatrixColumn(camera.matrixWorld, 2).negate();
      const depth = 30, hh = Math.tan(camera.fov * PI / 360) * depth;
      sky.position.copy(camera.position).addScaledVector(fwd, depth).addScaledVector(up, (1 - 0.06 * 2) * hh); sky.quaternion.copy(camera.quaternion); sky.scale.set(hh * 2 * camera.aspect, hh * 2 * 0.23, 1);
      const V = Z.vis;
      for (const f of V.flags) f.m.rotation.y = Math.sin(T * 2 + f.ph) * 0.18;
      for (const w of V.wisps) { const dd = hyp(hx - w.x, hz - w.z), want = (1 - V.k) * 0.5 * clamp((dd - 3) / 5, 0, 1); w.sp.material.opacity += (want - w.sp.material.opacity) * Math.min(1, dt * 2); w.sp.position.x = w.x + Math.sin(T * 0.3 + w.ph) * 0.6; }
    });
  }

  // ════════════════ kurSon ════════════════
  function kurSon(L, api) {
    const g0 = G_(), A = L.areas || [], Z = L.sh || {}, V = Z.vis || { boards: [], flags: [], wisps: [], lamps: [] };
    const gatePts = A.map(a => a.gate); for (let k = 1; k < A.length; k++) A[k].gate = null;
    const tower = gatePts[4] ? kapi(api, L, gatePts[4], 'kule') : null;
    const S = { t: 0, started: 0, area: -1, done: [false, false, false, false, false], act: 0, items: [], carry: false, bell: 0, wave: null, orb: null, stuck: 0, shelf: 0, keySaid: 0, happy: false };
    const HUDPOS = null; void HUDPOS;
    // şehirliler
    const npcs = [];
    const EM = typeof EMODEL !== 'undefined' ? EMODEL : null;
    WHO.forEach((w, i) => {
      const p = Z.npc && Z.npc[i]; if (!p || !EM) return;
      let m = null; try { m = EM.build.call(EM, w.model, {}); } catch (e) { m = null; }
      if (!m || !m.root) return;
      m.root.position.set(p.x, 0, p.z); api.add(m.root);
      try { m.setMood('happy'); m.setTint('#9aa0aa'); } catch (e) { /* yok */ }
      if (w.beret) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 6, 0, TAU, 0, PI / 2), new THREE.MeshStandardMaterial({ color: w.beret })); b.position.set(0, (m.height || 1.3) + 0.02, 0); b.scale.set(1.3, 0.7, 1.3); m.root.add(b); }
      if (api.solid) api.solid(p.x, p.z, 0.6, 'sehirli');
      const mt = new THREE.SpriteMaterial({ map: balonTex(w.esya, false), transparent: true, depthWrite: false, depthTest: false, opacity: 0.0 }); api.dispose(mt);
      const bl = new THREE.Sprite(mt); bl.scale.set(1.5, 1.5, 1); bl.renderOrder = 40; bl.position.set(p.x, (m.height || 1.3) + 1.4, p.z); api.add(bl);
      npcs.push({ w, i, m, p, bl, mt, face: 0, st: { move: 0, windup: -1, attack: -1, hurt: 0, frozen: false, dying: -1, t: 0 }, joy: 0 });
    });
    // pati izleri (Bilbo): sıradaki kişiye
    const pawM = kp(new THREE.MeshBasicMaterial({ color: 0xc9a070, transparent: true, opacity: 0.0, depthWrite: false }));
    const toe = geo('toe', () => kp(new THREE.CircleGeometry(1, 12).rotateX(-PI / 2)));
    const trails = [];
    const path = Z.path || [];
    const cum = [0]; for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + hyp(path[i].x - path[i - 1].x, path[i].z - path[i - 1].z));
    const at = s => { if (!path.length) return null; s = clamp(s, 0, cum[cum.length - 1]); let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const u = (s - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return { x: path[i - 1].x + (path[i].x - path[i - 1].x) * u, z: path[i - 1].z + (path[i].z - path[i - 1].z) * u, dx: path[i].x - path[i - 1].x, dz: path[i].z - path[i - 1].z }; };
    const nearS = p => { let bi = 0, bd = 1e9; for (let i = 0; i < path.length; i++) { const d = hyp(path[i].x - p.x, path[i].z - p.z); if (d < bd) { bd = d; bi = i; } } return cum[bi] || 0; };
    npcs.forEach((n, i) => {
      const grp = new THREE.Group(); grp.visible = false; api.add(grp); const sN = nearS(n.p), s0 = i === 0 ? 4 : nearS(npcs[i - 1].p);
      const items = [];
      for (let s = Math.max(0, Math.max(s0, sN - 20)); s < sN - 3.5; s += 2.2) {
        const q = at(s); if (!q) continue; const l = hyp(q.dx, q.dz) || 1, side = items.length % 2 ? 0.5 : -0.5;
        const pg = new THREE.Group(); pg.position.set(q.x + (-q.dz / l) * side, 0.09, q.z + (q.dx / l) * side); pg.rotation.y = Math.atan2(q.dx, q.dz);
        const pad = new THREE.Mesh(toe, pawM); pad.scale.set(0.2, 1, 0.22); pad.renderOrder = 2; pg.add(pad);
        for (let j = -1; j <= 1; j++) { const t = new THREE.Mesh(toe, pawM); t.scale.set(0.085, 1, 0.095); t.position.set(j * 0.17, 0, 0.3 - Math.abs(j) * 0.05); t.renderOrder = 2; pg.add(t); }
        grp.add(pg); items.push(pg);
      }
      trails[i] = { grp, items };
    });
    // oyuncak rafı + kırık taç (kule içi; AD YOK, EFEKT YOK)
    let shelfAt = null;
    if (Z.tower) {
      const T0 = Z.tower;
      // kule iç duvarı: iki odanın çevresinde yüksek krem duvar (güneyde alçak); duvarda çarklar; kuzeyde kadran
      const cogs = [];
      const wallM = kp(new THREE.MeshStandardMaterial({ color: 0xf0e2c8, roughness: 0.95 }));
      const wbox = geo('wbox', () => kp(new THREE.BoxGeometry(1, 1, 1)));
      for (const rm of [T0.a, T0.b]) {
        const R = rm.r + 1.8, N = Math.max(14, Math.round(R * 2.4));
        for (let q = 0; q < N; q++) {
          const a = q * TAU / N, x = rm.x + Math.sin(a) * R, z = rm.z + Math.cos(a) * R;
          if (api.isFloor(x, z) || api.linkDist(x, z) < 3.2) continue;
          const south = z > rm.z + 1.5, h = south ? 1.2 : 6.5;
          const m = new THREE.Mesh(wbox, wallM); m.scale.set(TAU * R / N * 1.15, h, 0.9); m.position.set(x, h / 2, z); m.rotation.y = a; m.receiveShadow = true; api.add(m);
          if (!south && q % 3 === 0) {
            const gm = new THREE.MeshStandardMaterial({ color: q % 2 ? 0xd8a24a : 0xc08a3a, roughness: 0.4, metalness: 0.5 }); api.dispose(gm);
            const gk = new Kit(); const tb = geo('tooth', () => kp(new THREE.BoxGeometry(1, 1, 1))), disk = geo('disk', () => kp(new THREE.CylinderGeometry(1, 1, 0.4, 20)));
            gk.add(disk, 0xffffff, [0, 0, 0], [PI / 2, 0, 0], 1); for (let tI = 0; tI < 10; tI++) { const ta = tI * TAU / 10; gk.add(tb, 0xffffff, [Math.cos(ta) * 1.12, Math.sin(ta) * 1.12, 0], [0, 0, ta], [0.3, 0.38, 0.4]); }
            const mesh = new THREE.Mesh(gk.build(), gm); api.dispose(mesh.geometry); const sz = 0.9 + (q % 4) * 0.25; mesh.scale.setScalar(sz);
            mesh.position.set(x - Math.sin(a) * 0.55, 2.2 + (q % 3) * 1.4, z - Math.cos(a) * 0.55); mesh.rotation.y = a + PI; api.add(mesh); cogs.push({ mesh, sp: (q % 2 ? 1 : -1) * (0.5 + (q % 3) * 0.2) });
          }
        }
      }
      V.cogs = cogs;
      // büyük kadran (kuzey duvarı, 2. oda)
      const cmat = new THREE.MeshBasicMaterial({ map: clockTex() }); api.dispose(cmat);
      const clk = new THREE.Mesh(geo('clk2', () => kp(new THREE.PlaneGeometry(1, 1))), cmat); clk.scale.set(4.2, 4.2, 1); clk.position.set(T0.b.x, 4.4, T0.b.z - T0.b.r - 1.2 - 0.0); api.add(clk);
      // raf
      const sh = T0.shelf; shelfAt = sh;
      const g = new THREE.Group(); g.position.set(sh.x, 0, sh.z); g.rotation.y = sh.yaw || 0; api.add(g);
      const wm = new THREE.MeshStandardMaterial({ color: 0xa87a4a, roughness: 0.85 }), mk = (geom, mat, x, y, z) => { const o = new THREE.Mesh(geom, mat); o.position.set(x, y, z); g.add(o); return o; };
      api.dispose(wm);
      mk(new THREE.BoxGeometry(2.2, 0.12, 0.8), wm, 0, 0.55, 0); mk(new THREE.BoxGeometry(0.12, 0.55, 0.8), wm, -1.05, 0.28, 0); mk(new THREE.BoxGeometry(0.12, 0.55, 0.8), wm, 1.05, 0.28, 0); mk(new THREE.BoxGeometry(2.2, 1.0, 0.1), wm, 0, 1.1, -0.35);
      const tm = (c, o = {}) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.7 }, o)); api.dispose(m); return m; };
      mk(new THREE.CylinderGeometry(0.22, 0.22, 0.28, 12), tm(0xd84a4a), -0.7, 0.75, 0); mk(new THREE.SphereGeometry(0.2, 10, 8), tm(0xe8c58a), -0.1, 0.8, -0.1); mk(new THREE.BoxGeometry(0.45, 0.3, 0.18), tm(0x8a6a4a), 0.45, 0.76, -0.05);
      mk(new THREE.SphereGeometry(0.1, 8, 6), tm(0x8a6a4a), 0.62, 0.98, -0.05);
      // kırık taç: açık silindir halka + 4 diken (5. diken yok), önde, hafif eğik
      const crown = new THREE.Group(), cm2 = tm(0xc9a24a, { metalness: 0.5, roughness: 0.45 });
      crown.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 14, 1, true), cm2));
      for (let i = 0; i < 5; i++) { if (i === 3) continue; const a = i * TAU / 5, c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 5), cm2); c.position.set(Math.sin(a) * 0.2, 0.15, Math.cos(a) * 0.2); crown.add(c); }
      crown.scale.setScalar(1.9); crown.position.set(0.6, 0.78, 0.25); crown.rotation.set(0.12, 0.4, 0.2); g.add(crown);
      cm2.side = THREE.DoubleSide;
    }
    // anahtar (2. oda)
    let keyObj = null;
    if (Z.tower) {
      const kg = new THREE.Group(), km = new THREE.MeshStandardMaterial({ color: 0xe0b04a, metalness: 0.55, roughness: 0.35 }); api.dispose(km);
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.18, 10, 22), km); bow.position.y = 2.1; kg.add(bow);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.9, 10), km); shaft.position.y = 0.95; kg.add(shaft);
      for (const [y, w] of [[0.15, 0.55], [0.5, 0.4]]) { const t = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, 0.2), km); t.position.set(w / 2, y, 0); kg.add(t); }
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.25, 16), new THREE.MeshStandardMaterial({ color: 0x8a6a4a })); base.position.y = 0.12; kg.add(base); api.dispose(base.material);
      const k = Z.tower.key; kg.scale.setScalar(0.62); kg.position.set(k.x, 0, k.z);
      keyObj = { id: 'anahtar', tur: 'cevrilir', x: k.x, z: k.z, r: 1.9, acilar: [0, PI * 2], mesh: kg, elle: false };
      (L.nesneler = L.nesneler || []).push(keyObj); api.glow(k.x, k.z, 2.6, 0xffe08a, 0.16);
      api.solid(k.x, k.z, 0.0 + 0.01, 'anahtar');
    }
    // HUD: 5 noktalı kule kadranı
    let hud = null; const dots = [];
    try {
      hud = document.createElement('div'); hud.style.cssText = 'position:fixed;left:50%;top:92px;transform:translateX(-50%);display:flex;gap:9px;padding:7px 14px;border-radius:22px;background:rgba(255,248,230,0.82);box-shadow:0 2px 8px rgba(0,0,0,.2);pointer-events:none;z-index:30;opacity:0;transition:opacity .6s';
      const ic = document.createElement('div'); ic.textContent = '\u{1F570}️'; ic.style.cssText = 'font-size:20px;line-height:20px;margin-right:2px'; hud.appendChild(ic);
      for (let i = 0; i < 5; i++) { const d = document.createElement('div'); d.style.cssText = 'width:18px;height:18px;border-radius:50%;background:#d6cdbd;border:2px solid #b0a690;transition:all .5s'; hud.appendChild(d); dots.push(d); }
      document.body.appendChild(hud); api.dispose({ dispose() { if (hud && hud.parentNode) hud.parentNode.removeChild(hud); } });
    } catch (e) { hud = null; }
    // olaylar
    const offs = [];
    const on = (n, fn) => { if (g0 && g0.on) { try { const r = g0.on(n, e => { if (g0.L === L || n === 'zone') fn(e); }); if (typeof r === 'function') offs.push(r); } catch (e) { /* yok */ } } };
    const setLook = () => {   // hatırlayan sayısına göre renk ve sis
      const n = S.done.filter(Boolean).length; V.k = S.wave && S.wave.t >= 1.2 || S.bell >= 2 ? 1 : 0.42 + n * 0.1;
    };
    function remember(i) {
      if (S.done[i]) return; S.done[i] = true; const n = npcs[i]; if (!n) return;
      try { n.m.setTint(null); n.m.setMood('happy'); } catch (e) { /* yok */ }
      n.joy = 1.6; n.mt.map = balonTex(n.w.esya, true); n.mt.needsUpdate = true; n.hearted = true;
      burst('heart', n.p.x, (n.m.height || 1.3) + 0.4, n.p.z, { count: 4 }); sfx('heart', { x: n.p.x, z: n.p.z });
      say(n.w.hat, { force: true, once: false }); setTimeout(() => say(n.w.adi, { force: true, once: false }), 3600);
      trails[i].grp.visible = false;
      if (i === 2) V.boards.forEach(b => { b.mt.map = tabelaTex(b.i, true); b.mt.needsUpdate = true; });
      if (i === 3) V.flags.forEach(f => f.mt.color.setHex(f.col));
      if (dots[i]) { dots[i].style.background = '#ffd23f'; dots[i].style.borderColor = '#e0a020'; dots[i].style.transform = 'scale(1.25)'; setTimeout(() => { if (dots[i]) dots[i].style.transform = 'scale(1)'; }, 600); }
      const nd = S.done.filter(Boolean).length; setLook();
      if (nd >= 5) { S.towerAt = S.t + 5; } else { S.act = S.done.findIndex(q => !q); S.nextAt = S.t + 5.5; }
    }
    function activate(i) {
      const n = npcs[i]; if (!n || S.items[i]) return; const q = Z.item[i];
      const o = g0.nesne.ekle({ id: 'esya' + i, tur: 'tasinir', x: q.x, z: q.z, r: 1.3, mesh: esyaMesh(n.w.esya), kucakY: 1.0, kabulId: 'h' + i });
      g0.nesne.hedef({ id: 'h' + i, x: n.p.x, z: n.p.z, r: 2.4, yerlesti() { remember(i); } });
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: 0xffd860, transparent: true, depthWrite: false, opacity: 0.8 })); halo.scale.set(2.4, 2.4, 1); halo.position.set(q.x, 0.6, q.z); api.add(halo); api.dispose(halo.material);
      S.items[i] = { o, halo }; trails[i].grp.visible = true; pawM.opacity = 0.7;
      const first = i === 0; say(first ? 'b08_simitci' : n.w.balon, { force: true, once: false });
      if (i === 1) setTimeout(() => say('b08_nehir', { force: true }), 100);
      if (i === 2) setTimeout(() => say('b08_tabela'), 6000);
      if (i === 3) setTimeout(() => say('b08_sur'), 6000);
      pirilGit(n.p.x, n.p.z);
    }
    on('zone', () => { for (const f of offs) { try { f(); } catch (e) { /* yok */ } } try { if (scene.fog && V.fogBase) { scene.fog.near = V.fogBase.n; scene.fog.far = V.fogBase.f; } POST.saturation = V.satBase || POST.saturation; } catch (e) { /* yok */ } });
    on('nesne', e => {
      if (e && e.id === 'anahtar' && !S.bell) { S.bell = 1; S.bellT = S.t; say('b08_can', { force: true, once: false }); sfx('bell', { vol: 1 }); }
    });
    on('happy', e => {
      if (!e || !e.boss || e.type !== 'huysuzSovalye') return; S.happy = true;
      V.flags.forEach(f => f.mt.color.setHSL(((f.ph * 0.17) % 1), 0.75, 0.6)); setTimeout(() => say('b08_son', { force: true, once: false }), 6000);
      setTimeout(() => say('b08_pirilkale', { force: true, once: false }), 11500);
    });
    const hero = () => g0 && g0.P;
    let senlik = null; try { senlik = SENLIK.koy(L, api, npcs, on); } catch (e) { console.warn('senlik', e); }
    const waveM = new THREE.MeshBasicMaterial({ color: 0xfff6ec, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const wave = new THREE.Mesh(geo('wave', () => kp(new THREE.RingGeometry(0.88, 1, 72).rotateX(-PI / 2))), waveM); wave.visible = false; wave.renderOrder = 6; api.add(wave); api.dispose(waveM);
    const ringHand = new THREE.Group(); void ringHand;
    let T = 0;
    const gate = tower;
    api.anim((dt, hx, hz) => {
      dt = Math.min(dt, 0.05); T += dt; S.t = T; if (senlik) senlik.tick(T);
      const P = hero(); if (!P) return;
      const playing = live();
      // şehirliler: animasyon, balon, yüz dönme, sevinç zıplaması
      for (const n of npcs) {
        n.st.t += dt; const d = hyp(hx - n.p.x, hz - n.p.z);
        if (n.joy > 0) { n.joy -= dt; n.m.root.position.y = Math.abs(Math.sin(T * 8)) * 0.18 * clamp(n.joy, 0, 1); } else n.m.root.position.y = 0;
        if (d < 12) n.face += (((Math.atan2(hx - n.p.x, hz - n.p.z) - n.face + PI * 3) % TAU) - PI) * Math.min(1, dt * 3);
        n.m.root.rotation.y = n.face;
        try { n.m.anim(dt, n.st); } catch (e) { /* yok */ }
        const act = !S.done[n.i] && n.i === S.act && S.items[n.i], target = n.hearted ? 0.95 : act ? 1 : S.done[n.i] ? 0 : 0.0;
        n.mt.opacity += (target - n.mt.opacity) * Math.min(1, dt * 3); n.bl.position.y = (n.m.height || 1.3) + 1.4 + Math.sin(T * 2 + n.i) * 0.08;
        if (n.hearted && n.joy <= 0) n.mt.opacity *= 1 - Math.min(1, dt * 0.4);
      }
      for (const s of S.items) if (s) { const o = s.o; s.halo.visible = !o.tut && !o.yerlesik; s.halo.scale.setScalar(2.2 + Math.sin(T * 3) * 0.25); s.halo.position.set(o.x, 0.6, o.z); }
      for (const t of trails) if (t.grp.visible) t.items.forEach((p, k) => { p.visible = true; });
      pawM.opacity = 0.55 + 0.2 * Math.sin(T * 3);
      // rüzgâr/sis, renk, dikkat
      if (V.cogs) for (const c of V.cogs) c.mesh.rotation.z += c.sp * dt;
      try {
        if (scene.fog) { if (!V.fogBase) { V.fogBase = { n: scene.fog.near, f: scene.fog.far }; V.satBase = POST.saturation; } const k = V.k; scene.fog.near = V.fogBase.n * (0.45 + 0.55 * k); scene.fog.far = V.fogBase.f * (0.6 + 0.4 * k); POST.saturation = V.satBase * (0.45 + 0.55 * k); }
      } catch (e) { /* yok */ }
      // kapı
      if (gate) {
        if (gate.open) { if (gate.anim < 1) { gate.anim = Math.min(1, gate.anim + dt / 1.6); gate.pm.opacity = 0.6 * (1 - gate.anim); gate.panel.position.y = 2.4 + gate.anim * 3; if (gate.anim >= 1) { gate.panel.visible = false; for (const so of gate.solids) so.alive = false; L._sh = null; } } }
        else { gate.pm.opacity = 0.5 + 0.1 * Math.sin(T * 2); if (playing && hyp(P.pos.x - gate.x, P.pos.z - gate.z) < 6) S.stuck += dt; if (S.stuck > 80) { gate.open = true; } }
      }
      if (S.towerAt && T >= S.towerAt && gate && !gate.open) { S.towerAt = 0; gate.open = true; sfx('unlock', { x: gate.x, z: gate.z }); say('b08_kulegir', { force: true, once: false }); }
      // tek sis dalgası
      if (S.bell === 1 && T - S.bellT > 1.2) { S.bell = 2; S.wave = { t: 0, x: Z.tower.b.x, z: Z.tower.b.z }; wave.visible = true; }
      if (S.wave) {
        const w = S.wave; w.t += dt; const u = clamp(w.t / 2.4, 0, 1), R = 2 + u * 70;
        wave.position.set(w.x, 0.5, w.z); wave.scale.set(R, 1, R); waveM.opacity = 0.7 * (1 - u) * Math.min(1, w.t * 3);
        if (w.t > 0.6 && !S.lit) { S.lit = 1; V.lampM && V.lampM.color.setHex(0xffe08a); npcs.forEach(n => { try { n.m.setTint(null); } catch (e) { /* yok */ } n.joy = 2.5; }); V.flags.forEach(f => f.mt.color.setHex(f.col)); V.boards.forEach(b => { b.mt.map = tabelaTex(b.i, true); b.mt.needsUpdate = true; }); setLook(); say('b08_pirilhatirladi', { force: true, once: false }); }
        if (u >= 1) { wave.visible = false; S.wave = null; S.bell = 3; }
      }
      // konuşmalar ve akış
      if (playing) {
        const ar = P.area;
        if (T > 1 && !S.started) { S.started = 1; say('b08_giris', { force: true }); }
        if (T > 7 && S.started === 1) { S.started = 2; say('b08_pirilgiris'); }
        if (T > 12 && S.started === 2) { S.started = 3; say('b08_bilbo'); }
        if (T > 2.5 && !S.items[0]) activate(0);
        if (S.nextAt && T >= S.nextAt) { S.nextAt = 0; if (S.act >= 0) activate(S.act); }
        if (T > 22 && S.started === 3) { S.started = 4; say('b08_kule'); }
        if (ar !== S.area) {
          S.area = ar;
          if (ar === 1) say('b08_pirilruzgar', { force: true });
          if (ar === 3) { say('b08_bilbobin', { force: true }); }
          if (ar === 4) say('b08_kuleici', { force: true });
          if (ar === A.length - 1) say('b08_arena', { force: true, once: false });
        }
        if (hud) hud.style.top = innerHeight > innerWidth ? '162px' : '92px';
        if (hud) hud.style.opacity = ar >= 0 && ar < A.length - 1 && !(typeof MINIGAME !== 'undefined' && MINIGAME.active) ? '1' : '0';
        if (ar === 4 && !S.shelf && shelfAt && hyp(P.pos.x - shelfAt.x, P.pos.z - shelfAt.z) < 6) { S.shelf = 1; S.shelfT = T; say('b08_raf', { force: true }); }
        if (S.shelf === 1 && T - S.shelfT > 6.5) { S.shelf = 2; say('b08_raf_p', { force: true }); }
        if (ar === 4 && !S.keySaid && Z.tower && hyp(P.pos.x - Z.tower.b.x, P.pos.z - Z.tower.b.z) < 8) { S.keySaid = 1; say('b08_anahtar', { force: true }); pirilGit(Z.tower.key.x, Z.tower.key.z); }
      }
    });
    // ışık topu (boss → Pırıl)
    void S.orb;
  }

  // ════════════════ Şenlik mini oyunları (QA2): Yaprak, Simit, Bayrak, Davul — her biri ~30 sn, parmakla, kaybetmek yok ════════════════
  const SENLIK = (() => {
    const DEF = {
      yaprak: { ad: 'Yaprak Süpürme', ikon: '🍂', renk: '#e8a07a', arka: ['#fbe9c8', '#f3d3a0'] },
      simit:  { ad: 'Simit Yakalama', ikon: '🥯', renk: '#e9b44c', arka: ['#cfe8f7', '#f9efd0'] },
      bayrak: { ad: 'Bayrak Dikme', ikon: '🚩', renk: '#ec7f98', arka: ['#d8eefc', '#f7e3d2'] },
      davul:  { ad: 'Davul Ritmi', ikon: '🥁', renk: '#d9824a', arka: ['#1f4a66', '#3f7a86'] },
    };
    const SURE = 30, R = Math.random, TAU2 = Math.PI * 2;
    let kayitli = false;
    const snd = n => { try { if (typeof AUD !== 'undefined' && AUD.sfx) AUD.sfx(n); } catch (e) { /* sessiz */ } };
    const EMF = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    function kayit() {
      if (kayitli || typeof MINIGAME === 'undefined') return; kayitli = true;
      for (const id of Object.keys(DEF)) {
        const d = DEF[id];
        MINIGAME.register(id, { ad: d.ad, ikon: d.ikon, renk: d.renk, holdsWorld: true, yildizlar: [1, 6, 12],
          start(ctx) { ctx.data.G = kurG(ctx, id); },
          update(dt, ctx) { const G = ctx.data.G; return G ? adim(G, Math.min(Math.max(dt, 0), 0.05)) : 'done'; },
          end(ctx) { const G = ctx.data.G; if (G) { G.root.removeEventListener('pointerdown', G.dn); G.root.removeEventListener('pointermove', G.mv); G.root.removeEventListener('pointerup', G.up); removeEventListener('resize', G.rs); } return ctx.score; } });
      }
    }
    function kurG(ctx, id) {
      const root = ctx.root, d = DEF[id];
      root.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden;background:' + d.arka[0];
      root.innerHTML = '';
      const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none'; root.appendChild(cv);
      const G = { id, root, cv, c: cv.getContext('2d'), W: 0, H: 0, t: 0, ph: 'intro', pt: 0, score: 0, ptr: { x: 0, y: 0, down: false, seen: false }, o: [], parts: [], tap: null };
      G.rs = () => { const w = innerWidth, h = innerHeight, dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); G.W = w; G.H = h; G.c.setTransform(dpr, 0, 0, dpr, 0, 0); };
      G.rs(); addEventListener('resize', G.rs);
      const pos = e => { const b = root.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
      G.dn = e => { e.preventDefault(); const [x, y] = pos(e); G.ptr.x = x; G.ptr.y = y; G.ptr.down = true; G.tap = { x, y }; };
      G.mv = e => { const [x, y] = pos(e); G.ptr.x = x; G.ptr.y = y; };
      G.up = () => { G.ptr.down = false; };
      root.addEventListener('pointerdown', G.dn); root.addEventListener('pointermove', G.mv); root.addEventListener('pointerup', G.up);
      root._mini = G; INIT[id](G); return G;
    }
    const spark = (G, x, y, col, n = 7) => { for (let i = 0; i < n; i++) { const a = R() * TAU2, v = 60 + R() * 120; G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, l: 0.55, col }); } if (G.parts.length > 60) G.parts.splice(0, G.parts.length - 60); };
    const simitCiz = (c, x, y, s) => { c.save(); c.translate(x, y); c.lineCap = 'round'; c.strokeStyle = '#d9962f'; c.lineWidth = s * 0.34; c.beginPath(); c.arc(0, 0, s * 0.3, 0, TAU2); c.stroke(); c.strokeStyle = '#f2b94e'; c.lineWidth = s * 0.2; c.beginPath(); c.arc(0, -s * 0.02, s * 0.3, 0, TAU2); c.stroke(); c.fillStyle = '#fff4d0'; for (let i = 0; i < 14; i++) { const a = i * 0.9; c.fillRect(Math.cos(a) * s * 0.3 - 2, Math.sin(a) * s * 0.3 - 1, 4, 2.4); } c.restore(); };
    const emoji = (c, ch, x, y, s, rot = 0) => { if (ch === '🥯') { simitCiz(c, x, y, s); return; } c.save(); c.translate(x, y); c.rotate(rot); c.font = Math.round(s) + 'px ' + EMF; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, 0, 0); c.restore(); };
    const yap = G => ({ x: 60 + R() * (G.W - 120), y: 110 + R() * (G.H - 280), fly: 0, ch: ['🍂', '🍁', '🍃'][(R() * 3) | 0], rot: R() * 6 });
    const INIT = {
      yaprak(G) { G.basket = { x: G.W / 2, y: G.H - 70 }; G.spawnT = 0; for (let i = 0; i < 12; i++) G.o.push(yap(G)); },
      simit(G) { G.tx = G.W / 2; G.tray = G.W / 2; G.spawnT = 0; },
      bayrak(G) { G.hole = null; G.poles = []; },
      davul(G) { G.spawnT = 0.5; G.flash = 0; },
    };
    const UP = {
      yaprak(G, dt) {
        G.basket.x = G.W / 2; G.basket.y = G.H - 70;
        G.spawnT -= dt; if (G.spawnT <= 0 && G.o.length < 16) { G.spawnT = 1.1; G.o.push(yap(G)); }
        const p = G.ptr;
        for (const l of G.o) {
          if (l.fly) { l.fly += dt * 2.2; l.x += (G.basket.x - l.x) * Math.min(1, dt * 6); l.y += (G.basket.y - l.y) * Math.min(1, dt * 6); l.rot += dt * 8; if (l.fly >= 1) { l.dead = true; G.score++; snd('pop'); } continue; }
          if (p.down && Math.hypot(l.x - p.x, l.y - p.y) < 56) { l.fly = 0.01; spark(G, l.x, l.y, '#e9b44c', 4); }
        }
        G.o = G.o.filter(l => !l.dead);
      },
      simit(G, dt) {
        if (G.ptr.seen || G.ptr.down) { G.ptr.seen = true; G.tx = G.ptr.x; }
        G.tray += (Math.max(70, Math.min(G.W - 70, G.tx)) - G.tray) * Math.min(1, dt * 12);
        G.spawnT -= dt; if (G.spawnT <= 0) { G.spawnT = 0.75 + R() * 0.35; G.o.push({ x: 60 + R() * (G.W - 120), y: -30, vy: 150 + R() * 70, rot: R() * 6 }); }
        const ty = G.H - 110;
        for (const s of G.o) {
          s.y += s.vy * dt; s.rot += dt;
          if (s.y > ty - 30 && s.y < ty + 30 && Math.abs(s.x - G.tray) < 85) { s.dead = true; G.score++; snd('pop'); spark(G, s.x, ty - 30, '#ffd23f', 5); }
          if (s.y > G.H + 40) s.dead = true;
        }
        G.o = G.o.filter(s => !s.dead);
      },
      bayrak(G, dt) {
        if (!G.hole) G.hole = { x: 70 + R() * (G.W - 140), y: G.H * 0.42 + R() * (G.H * 0.42), t: 0 };
        G.hole.t += dt;
        if (G.tap && Math.hypot(G.tap.x - G.hole.x, G.tap.y - G.hole.y) < 85) {
          G.poles.push({ x: G.hole.x, y: G.hole.y, col: ['#ec5a5a', '#ffd23f', '#4fb3ff', '#7bd65a', '#ff8a2a', '#ff7ad9'][G.score % 6], u: 0 }); G.score++; snd('pop'); spark(G, G.hole.x, G.hole.y, '#fff', 6); G.hole = null;
          if (G.poles.length > 9) G.poles.shift();
        }
        for (const p of G.poles) p.u = Math.min(1, p.u + dt * 3);
      },
      davul(G, dt) {
        G.spawnT -= dt; if (G.spawnT <= 0) { G.spawnT = 1.05; G.o.push({ t: 0, dur: 1.3, done: false }); }
        G.flash = Math.max(0, G.flash - dt * 3);
        for (const n of G.o) n.t += dt;
        if (G.tap) {
          const cx = G.W / 2, cy = G.H * 0.55;
          if (Math.hypot(G.tap.x - cx, G.tap.y - cy) < Math.min(G.W, G.H) * 0.4) {
            G.flash = 1; snd('drum');
            const n = G.o.filter(q => !q.done).sort((a, b) => Math.abs(a.t - a.dur) - Math.abs(b.t - b.dur))[0];
            if (n && Math.abs(n.t - n.dur) < 0.38) { n.done = true; G.score++; spark(G, cx, cy - 20, '#ffd23f', 8); }
          }
        }
        G.o = G.o.filter(n => n.t < n.dur + 0.45);
      },
    };
    function ciz(G) {
      const c = G.c, W = G.W, H = G.H, d = DEF[G.id];
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, d.arka[0]); g.addColorStop(1, d.arka[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
      if (G.id === 'yaprak') { emoji(c, '🧺', G.basket.x, G.basket.y, 96); for (const l of G.o) emoji(c, l.ch, l.x, l.y, 54 * (l.fly ? 0.8 : 1), l.rot); }
      if (G.id === 'simit') { emoji(c, '🧑‍🍳', G.tray, H - 170, 84); c.fillStyle = '#b98a5a'; c.beginPath(); c.roundRect(G.tray - 80, H - 112, 160, 26, 12); c.fill(); for (const s of G.o) emoji(c, '🥯', s.x, s.y, 56, s.rot); }
      if (G.id === 'bayrak') {
        for (const p of G.poles) { c.strokeStyle = '#8a6a4a'; c.lineWidth = 6; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x, p.y - 96 * p.u); c.stroke(); c.fillStyle = p.col; c.beginPath(); c.moveTo(p.x, p.y - 96 * p.u); c.lineTo(p.x + 54 * p.u, p.y - 80 * p.u); c.lineTo(p.x, p.y - 62 * p.u); c.fill(); }
        if (G.hole) { const k = 1 + Math.sin(G.hole.t * 6) * 0.12; c.fillStyle = 'rgba(80,60,40,.55)'; c.beginPath(); c.ellipse(G.hole.x, G.hole.y, 34 * k, 16 * k, 0, 0, TAU2); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 5; c.setLineDash([8, 8]); c.stroke(); c.setLineDash([]); emoji(c, '👇', G.hole.x, G.hole.y - 58 + Math.sin(G.hole.t * 6) * 8, 46); }
      }
      if (G.id === 'davul') {
        const cx = W / 2, cy = H * 0.55, r0 = Math.min(W, H) * 0.2;
        emoji(c, '🥁', cx, cy, r0 * (2.2 + G.flash * 0.25));
        for (const n of G.o) { const u = n.t / n.dur; if (u > 1.25) continue; const rr = r0 * (1 + (1 - Math.min(1, u)) * 1.9); c.strokeStyle = n.done ? 'rgba(123,214,90,.8)' : 'rgba(255,226,122,' + (0.95 - Math.max(0, u - 1) * 2) + ')'; c.lineWidth = 9; c.beginPath(); c.arc(cx, cy, rr, 0, TAU2); c.stroke(); }
      }
      for (const p of G.parts) { c.globalAlpha = Math.max(0, p.l / 0.55); c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, 5, 0, TAU2); c.fill(); } c.globalAlpha = 1;
    }
    function adim(G, dt) {
      G.t += dt; G.pt += dt; const c = G.c, W = G.W, H = G.H, d = DEF[G.id];
      for (const p of G.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.l -= dt; } G.parts = G.parts.filter(p => p.l > 0);
      if (G.ph === 'intro') {
        ciz(G); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(0, 0, W, H);
        emoji(c, d.ikon, W / 2, H * 0.4, 150 + Math.sin(G.pt * 5) * 8); emoji(c, '👆', W / 2, H * 0.6, 80);
        c.fillStyle = '#5a3a28'; c.font = 'bold 34px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText(d.ad, W / 2, H * 0.18);
        if (G.pt > 2.2 || (G.tap && G.pt > 0.5)) { G.ph = 'play'; G.pt = 0; G.tap = null; }
        return;
      }
      if (G.ph === 'play') {
        UP[G.id](G, dt); G.tap = null; ciz(G);
        c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.roundRect(W / 2 - 120, 14, 240, 18, 9); c.fill(); c.fillStyle = d.renk; c.beginPath(); c.roundRect(W / 2 - 120, 14, 240 * Math.max(0.02, 1 - G.pt / SURE), 18, 9); c.fill();
        c.fillStyle = '#5a3a28'; c.font = 'bold 40px system-ui,sans-serif'; c.textAlign = 'center'; if (d.ikon === '🥯') { simitCiz(c, W / 2 - 50, 62, 56); c.fillText(String(G.score), W / 2 + 10, 80); } else c.fillText(d.ikon + ' ' + G.score, W / 2, 80);
        if (G.pt >= SURE) { G.ph = 'son'; G.pt = 0; snd('cheer'); }
        return;
      }
      ciz(G); c.fillStyle = 'rgba(255,255,255,.65)'; c.fillRect(0, 0, W, H);
      const st = G.score >= 12 ? 3 : G.score >= 6 ? 2 : 1;
      emoji(c, d.ikon, W / 2, H * 0.36, 130); c.fillStyle = '#5a3a28'; c.font = 'bold 56px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText(String(G.score), W / 2, H * 0.52);
      emoji(c, '⭐'.repeat(st), W / 2, H * 0.66, 70);
      if (G.pt > 3 || (G.tap && G.pt > 0.8)) return 'done';
      G.tap = null;
    }
    // ── bölümde istasyon + işaret ──
    function koy(L, api, npcs, on) {
      kayit();
      const ids = ['yaprak', 'simit', 'bayrak', 'davul'], who = ['sevim', 'selim', 'nuri', 'temel'], items = [];
      ids.forEach((id, k) => {
        const n = npcs.find(q => q.w.id === who[k]); if (!n) return;
        let best = null;
        for (let a = 0; a < 16 && !best; a++) for (const rr of [4.2, 5.4, 3.4]) {
          const ang = a * TAU2 / 16 + k, x = n.p.x + Math.cos(ang) * rr, z = n.p.z + Math.sin(ang) * rr;
          if (api.isFloor(x, z) && api.isFloor(x + 1, z) && api.isFloor(x - 1, z) && api.isFloor(x, z + 1) && api.isFloor(x, z - 1)) { best = { x, z }; break; }
        }
        if (!best) return;
        const st = { id: 'mini_' + id, kind: 'mini', mini: id, x: best.x, z: best.z, r: 1.15 };
        (L.stations || (L.stations = [])).push(st);
        const grp = new THREE.Group(); grp.position.set(best.x, 0, best.z);
        const rm = new THREE.MeshBasicMaterial({ color: new THREE.Color(DEF[id].renk), transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }); api.dispose(rm);
        const rg = new THREE.RingGeometry(0.75, 1.0, 36).rotateX(-Math.PI / 2); api.dispose(rg);
        const ring = new THREE.Mesh(rg, rm); ring.position.y = 0.06; grp.add(ring);
        const cvs = document.createElement('canvas'); cvs.width = cvs.height = 128; const cx = cvs.getContext('2d'); cx.font = '96px ' + EMF; cx.textAlign = 'center'; cx.textBaseline = 'middle'; if (id === 'simit') simitCiz(cx, 64, 64, 110); else cx.fillText(DEF[id].ikon, 64, 70);
        const tx = new THREE.CanvasTexture(cvs), mt = new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false }); api.dispose(mt); api.dispose(tx);
        const sp = new THREE.Sprite(mt); sp.scale.set(1.1, 1.1, 1); sp.position.y = 1.5; grp.add(sp); api.add(grp);
        items.push({ st, grp, ring, sp, id });
      });
      on('miniEnd', e => { for (const it of items) if (e && e.id === it.id) { it.st.r = 0; it.done = true; } });
      return { tick(T) { for (const it of items) { it.sp.position.y = 1.5 + Math.sin(T * 2.4 + it.st.x) * 0.12; const k = it.done ? 0.35 : 1 + Math.sin(T * 3) * 0.08; it.ring.scale.setScalar(k); it.ring.material.opacity = it.done ? 0.25 : 0.8; } } };
    }
    return { koy };
  })();


  BOLUM.define('sehir', {
    ad: 'Surlu Şehir', taban: 'town', size: 110, side: 2,
    areas: [{ id: 'a1', ad: 'Sisli Kapı ve Pazar Meydanı', rooms: 2 }, { id: 'a2', ad: 'Nehir ve Taş Köprüler', rooms: 2 }, { id: 'a3', ad: 'Tabela Sokağı', rooms: 2 },
      { id: 'a4', ad: 'Sur Yolu ve Nöbetçi Kuleleri', rooms: 2 }, { id: 'a5', ad: 'Saat Kulesi', rooms: 2 }],
    muzik: 'sehir', malzeme: 'isik8', kayipEsya: null, final: false, yoldas: ['bilbo'],
    harita: { ad: 'Surlu Şehir', detay: 'Sisli şehirliler, saat kulesi ve Huysuz Şövalye', renk: '#e8a07a', simge: '🏙️' },
    yolculuk: { arac: 'kanat', cumle: 'Beni taşıdın. Şimdi ben seninle yürürüm.' },
    yerlesim, kur, kurSon,
  });
  return { say };
})();
