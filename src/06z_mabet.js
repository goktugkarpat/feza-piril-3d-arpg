/* ── Bölüm 6: Ay Tapınağı (Feza ile Pırıl: Büyük Fener) ──
   Bulutların üstünde, gece zirvesinde antik taş mabet. Ana mekanik: yıldız tozunda alçak yerçekimiyle zıplama (MOTOR2: lowGravity,
   Zıp düğmesi, kenarda otomatik zıplama, rün taşı → basamak belirir, bulut yastığı). Düşme cezası yok.
     1. Bulut Kapısı        büyük yıldız taşına zıpla → taş kapı açılır
     2. Yıldız Tozu Avlusu  sütunlar, kristal kubbeler, yıldız çukurları; alçak taşlar; yüksek "kuyruklu yıldız taşı" ve çatı bahçesi (gizli)
     3. Rün Taşları Bahçesi 3 rün taşına bas → 3 basamak belirir; tepeye çık → kapı açılır
     4. Yıldız Basamakları  3 kat × 4 yüzen taş; her kat gökte Küçük Ejderha takımyıldızının çizgisini uzatır; bitince mabet kapısı açılır
     5. Mabet İç Salonu     uyuyan taş tavşan, silik duvar resmi (yarım taçlı yaşlı biri, elinde fener; AD YOK, EFEKT YOK; Pırıl: "Bu kimin resmi acaba?")
     Arena: Büyük Mabet Salonu — Mabet Bekçisi (src/05z_mabet.js). Neşelenince Pırıl kanat rüzgârını geri alır (PIRIL_GUC.gucVer('ruzgar')).
   Görünüm kaynağı: feza-bilbo/huysuz Zıp Zıp Ay (kubbe, anten, krater, kuyruklu yıldız) — "Ay" yok, Dünya/halkalı gezegen yok; MOR YOK.
   Genel ad: MABET. Cümleler: src/02l_mabet.js (b06_...).
   TODO(MOTOR2): COMPANION kancası (Pırıl ışık nefesi) ve Pırıl'ın "uçmadan süzülme/hoplama" kipi gelince bağla; Pırıl bu bölümde şimdilik motorun varsayılan takibiyle gelir. */
const MABET = (() => {
  'use strict';
  const PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  const G_ = () => (typeof GAME !== 'undefined' ? GAME : null);
  const OK = () => typeof ODAKIT !== 'undefined' && ODAKIT;
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
    try { return g.halaApi.say(key, o.prio || 2) !== 0; } catch (e) { return false; }   // 0: ses motoru reddetti (ör. aynı cümle 24 sn içinde)
  }
  const sfx = (n, o) => { try { if (typeof AUD !== 'undefined' && AUD.sfx) AUD.sfx(n, o); } catch (e) { /* yok */ } };
  const burst = (k, x, y, z, o) => { try { if (typeof FX !== 'undefined' && FX.burst) FX.burst(k, x, y, z, o); } catch (e) { /* yok */ } };
  const pirilGit = (x, z) => { try { if (typeof PIRIL_GUC !== 'undefined' && PIRIL_GUC && PIRIL_GUC.pointTo) PIRIL_GUC.pointTo(x, z); } catch (e) { /* yok */ } };
  const GM = {};
  const geo = (k, f) => GM[k] || (GM[k] = f());
  const kp = o => { if (o) o.userData.keep = true; return o; };

  // ════════════════ Yerleşim (saf veri) ════════════════
  function yerlesim(L, api) {
    const A = L.areas || [];
    const mainRooms = a => (A[a] ? A[a].rooms.filter(ri => L.rooms[ri] && L.rooms[ri].kind !== 'side') : []);
    const areaOf = {}; A.forEach((a, k) => { if (!a.boss) a.rooms.forEach(ri => { areaOf[ri] = k; }); });
    // düşmanlar: 1. alan (bulut kapısı), 4. (basamaklar) ve 5. (iç salon) alanlarında yok
    const LIST = [null, ['yildizPonpon', 'isikYildizcik', 'yildizPonpon'], ['yildizPonpon', 'uykuTascik', 'runTascik', 'suzulenYildizcik'], null, null];
    const CAP = [0, 3, 4, 0, 0], packN = {}, keep = [];
    for (const sp of L.spawns || []) {
      const ai = areaOf[sp.room];
      if (sp.room === 0) continue;
      if (ai === undefined) { keep.push(sp); continue; }
      const list = LIST[Math.min(ai, LIST.length - 1)];
      if (!list) continue;
      const n = packN[sp.pack] = (packN[sp.pack] || 0) + 1;
      if (n > CAP[Math.min(ai, CAP.length - 1)]) continue;
      sp.type = list[(n - 1 + sp.pack) % list.length];
      if (sp.elite && sp.type !== 'yildizPonpon') sp.type = 'yildizPonpon';
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
    const M = L.mb = { gates: [], tas1: null, low: [], high: null, cati: null, runs: [], rsteps: [], pads: [], paint: null, salon: null, arena: null };
    const r0 = L.rooms[0], st = L.start || { x: r0.x, z: r0.z };
    // 1) büyük yıldız taşı: başlangıç ile 1. geçit arasında
    { const g = A[1] && A[1].gate; let d = g ? dirTo(st.x, st.z, g.x, g.z) : [0, -1]; const dist = g ? Math.max(3.2, Math.min(5.5, hyp(g.x - st.x, g.z - st.z) * 0.45)) : 4;
      let p = null;
      for (const dd of [dist, dist * 0.8, dist * 1.2, 3.2]) { const x = st.x + d[0] * dd, z = st.z + d[1] * dd; if (!p && api.isFloor(x, z) && api.circleFree(x, z, 1.4)) p = { x, z }; }
      M.tas1 = p || spot(st.x, st.z, 3, 5, 1.4) || { x: st.x + 3, z: st.z - 3 }; }
    // 2) avlu: alçak taş sırası (1. odada) + kuyruklu yıldız taşı / çatı bahçesi (2. odada, kenara yakın)
    { const mr = mainRooms(1), a = L.rooms[mr[0]], b = L.rooms[mr[mr.length - 1]];
      if (a) { const g = A[1].gate || { x: a.x, z: a.z - 5 }, d = dirTo(g.x, g.z, a.x, a.z);
        for (let i = 0; i < 3; i++) { const x = a.x + d[0] * (i * 2.4 - 1.5) + -d[1] * (i % 2 ? 1.2 : -1.2), z = a.z + d[1] * (i * 2.4 - 1.5) + d[0] * (i % 2 ? 1.2 : -1.2); if (api.isFloor(x, z) && api.circleFree(x, z, 1.0)) M.low.push({ x, z, top: 0.6 + i * 0.1 }); } }
      if (b) {
        const rim = (rmin, rmax) => spot(b.x, b.z, Math.min(rmin, b.r * 0.4), Math.min(rmax, b.r * 0.7), 1.6);
        const h1 = rim(4.5, 6.5), c1 = rim(4.0, 6.5);
        if (h1) M.high = h1;
        if (c1 && (!h1 || hyp(c1.x - h1.x, c1.z - h1.z) > 6)) M.cati = c1;
      } }
    // 3) rün bahçesi: 3 rün taşı (alanın odalarına) + 3 basamak (son odada, 3. geçidin 4–10 m önünde)
    { const mr = mainRooms(2), last = L.rooms[mr[mr.length - 1]], g = A[3] && A[3].gate;
      if (last && g) {
        const d = dirTo(last.x, last.z, g.x, g.z); let ok = true; const pts = [];
        for (const dd of [10.5, 7.6, 4.8]) { let p = null; for (let s = 0; s < 3 && !p; s++) { const x = g.x - d[0] * dd + -d[1] * (s - 1) * 0.8, z = g.z - d[1] * dd + d[0] * (s - 1) * 0.8; if (api.isFloor(x, z) && api.circleFree(x, z, 0.8)) p = { x, z }; } if (!p) ok = false; pts.push(p || { x: g.x - d[0] * dd, z: g.z - d[1] * dd }); }
        void ok; M.rsteps = pts;
        const rooms = mr.map(ri => L.rooms[ri]);
        for (let i = 0; i < 3; i++) { const rm = rooms[i % rooms.length]; const p = spot(rm.x, rm.z, 2.5, Math.max(3.5, rm.r * 0.6), 1.3); if (p && !pts.some(q => hyp(q.x - p.x, q.z - p.z) < 4) && !M.runs.some(q => hyp(q.x - p.x, q.z - p.z) < 3.5)) M.runs.push(p); }
        let guard = 0; while (M.runs.length < 3 && guard++ < 30) { const rm = rooms[guard % rooms.length], p = spot(rm.x, rm.z, 2, Math.max(3, rm.r * 0.7), 1.2); if (p && !M.runs.some(q => hyp(q.x - p.x, q.z - p.z) < 3)) M.runs.push(p); }
      } }
    // 4) basamaklar: odanın içinde 3 kat × 4 taş sarmal; son taş 4. geçit tarafında
    { const mr = mainRooms(3), rm = L.rooms[mr[0]], g = A[4] && A[4].gate;
      if (rm) {
        const R = clamp(rm.r * 0.5, 4.2, 6.6), step = 2.65 / R, tg = g ? Math.atan2(g.x - rm.x, g.z - rm.z) : 0, pads = [];
        for (let n = 0; n < 12; n++) {
          const a = tg - (11 - n) * step, kat = (n / 4) | 0, j = n % 4;
          pads.push({ id: 'p' + n, x: rm.x + Math.sin(a) * R, z: rm.z + Math.cos(a) * R, top: 0.7 + n * 0.62, r: j === 3 ? 1.35 : 0.98, kat, j, a, R, cx: rm.x, cz: rm.z });
        }
        M.pads = pads; M.padRoom = { x: rm.x, z: rm.z, r: rm.r };
      } }
    // 5) iç salon: kuzey kenarda silik duvar resmi, uyuyan taş tavşan
    { const mr = mainRooms(4), rm = L.rooms[mr[0]]; if (rm) { M.salon = { x: rm.x, z: rm.z, r: rm.r }; } }
    { const ar = L.rooms.filter(r => r.kind !== 'side').pop(); if (ar) M.arena = { x: ar.x, z: ar.z, r: ar.r || 11 }; }
  }

  // ════════════════ Görsel parçalar ════════════════
  function starShape(Ro, Ri, n = 5) {
    const s = new THREE.Shape();
    for (let i = 0; i < n * 2; i++) { const a = -PI / 2 + i * PI / n, r = i % 2 ? Ri : Ro, x = Math.cos(a) * r, y = Math.sin(a) * r; if (i) s.lineTo(x, y); else s.moveTo(x, y); }
    s.closePath(); return s;
  }
  // ay evresi: ph 0 yeni ay (halka), 1 hilal, 2 yarım, 3 dolunay
  function moonShape(ph, R) {
    const sh = new THREE.Shape(), t = [0, 0.5, 0, -1][ph];
    if (ph === 3) { sh.absarc(0, 0, R, 0, TAU, false); return sh; }
    for (let i = 0; i <= 20; i++) { const a = -PI / 2 + PI * i / 20, x = Math.cos(a) * R, y = Math.sin(a) * R; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); }
    for (let i = 20; i >= 0; i--) { const a = -PI / 2 + PI * i / 20; sh.lineTo(-Math.cos(a) * R * (ph === 1 ? -0.45 : 0), Math.sin(a) * R); }
    void t; return sh;
  }
  const moonFlat = (ph, R) => ph === 0 ? new THREE.RingGeometry(R * 0.78, R, 28).rotateX(-PI / 2) : new THREE.ShapeGeometry(moonShape(ph, R)).rotateX(-PI / 2);
  const starFlat = (Ro, Ri) => new THREE.ShapeGeometry(starShape(Ro, Ri)).rotateX(-PI / 2);
  const stoneMat = () => GM.stoneM || (GM.stoneM = kp(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88 })));
  const litMat = () => GM.litM || (GM.litM = kp(new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd45a).multiplyScalar(1.25), transparent: true, opacity: 0.95, depthWrite: false })));
  // yüzen taş basamak: tepe y=0 (motor yüzey yüksekliğine koyar), altında kaya sivrisi, üstünde oyma yıldız
  function padGeo(r, ph) {
    return geo('pad' + r + '_' + ph, () => {
      const k = new Kit();
      k.add(new THREE.CylinderGeometry(1, 0.96, 1, 20), 0xd9d1bd, [0, -0.28, 0], null, [r, 0.56, r]);
      k.add(new THREE.CylinderGeometry(1, 1, 1, 20), 0xb9b09a, [0, -0.5, 0], null, [r * 1.01, 0.1, r * 1.01]);
      k.add(new THREE.ConeGeometry(1, 1, 10), 0x8e8774, [0, -1.0, 0], [PI, 0, 0], [r * 0.85, 0.9, r * 0.85]);
      k.add(moonFlat(ph, r * 0.62), 0x7f8aa0, [0, 0.012, 0], null, 1);
      const g = k.build(); g.userData.keep = true; return g;
    });
  }
  function makePad(api, p) {
    const m = new THREE.Mesh(padGeo(p.r, p.ph), stoneMat()); m.castShadow = true; m.receiveShadow = true;
    const lit = new THREE.Mesh(geo('moonLit' + p.r + '_' + p.ph, () => moonFlat(p.ph, p.r * 0.62)), litMat()); lit.position.y = 0.03; lit.visible = false; lit.renderOrder = 4; m.add(lit);
    m.userData.lit = lit; api.add(m); return m;
  }
  function haloTex() {
    if (GM.haloT) return GM.haloT;
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.userData = { keep: true }; return (GM.haloT = t);
  }
  // rün taşı: yassı taş disk, üstünde turuncu-altın rün
  function runeMesh(api, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const disc = new THREE.Mesh(geo('runeDisc', () => kp(new THREE.CylinderGeometry(0.9, 1.0, 0.14, 18))), kp(new THREE.MeshStandardMaterial({ color: 0xcfc6b0, roughness: 0.85 })));
    disc.position.y = 0.07; disc.receiveShadow = true; g.add(disc);
    const glyph = new THREE.Mesh(geo('runeG', () => kp(moonFlat(1, 0.62))), new THREE.MeshBasicMaterial({ color: 0x7ea2c8, transparent: true, opacity: 0.9, depthWrite: false }));
    glyph.position.y = 0.16; glyph.renderOrder = 3; g.add(glyph);
    const ring = new THREE.Mesh(geo('runeR', () => kp(new THREE.RingGeometry(0.72, 0.86, 28).rotateX(-PI / 2))), new THREE.MeshBasicMaterial({ color: 0xa8d4ff, transparent: true, opacity: 0.8, depthWrite: false }));
    ring.position.y = 0.17; ring.renderOrder = 3; g.add(ring);
    api.add(g); api.dispose(glyph.material); api.dispose(ring.material); return { g, glyph, ring };
  }

  // taş kapı: iki sütun + lento + yıldız perdesi; kapalıyken perde parlak mavi-beyaz (bölüm 3 sis duvarı değil: taş kapı)
  function kapi(api, L, gate, id) {
    let dx = 0, dz = -1;
    if (OK() && ODAKIT.gateDir) { try { [dx, dz] = ODAKIT.gateDir(L, gate); } catch (e) { /* yok */ } }
    const nx = -dz, nz = dx;
    let lo = 0, hi = 0;
    for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(gate.x + nx * o, gate.z + nz * o)) hi = o; else break; }
    for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(gate.x - nx * o, gate.z - nz * o)) lo = o; else break; }
    const w0 = -lo - 0.6, w1 = hi + 0.6, wd = w1 - w0, cx = (w0 + w1) / 2;
    const grp = new THREE.Group(); grp.position.set(gate.x, 0, gate.z); grp.rotation.y = Math.atan2(nx, nz) - PI / 2; api.add(grp);
    const k = new Kit(), cyl = geo('kCyl', () => kp(new THREE.CylinderGeometry(1, 1, 1, 14))), box = geo('kBox', () => kp(new THREE.BoxGeometry(1, 1, 1)));
    for (const sx of [w0 - 0.2, w1 + 0.2]) {
      k.add(box, 0xd8d0bb, [sx, 0.22, 0], null, [0.92, 0.44, 0.92]); k.add(cyl, 0xe6dfcb, [sx, 0.95, 0], null, [0.36, 1.15, 0.36]); k.add(box, 0xcfc6ae, [sx, 1.62, 0], null, [0.92, 0.26, 0.92]);
      k.add(moonFlat(1, 0.2), 0xd9dde8, [sx, 1.0, 0.37], [PI / 2, 0, 0], 1);
    }
    const frame = new THREE.Mesh(k.build(), stoneMat()); frame.castShadow = true; grp.add(frame); api.dispose(frame.geometry);
    const pm = new THREE.MeshBasicMaterial({ color: 0x9cc8ff, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const panel = new THREE.Mesh(geo('kPlane', () => kp(new THREE.PlaneGeometry(1, 1))), pm); panel.scale.set(wd + 0.4, 1.55, 1); panel.position.set(cx, 0.92, 0); panel.renderOrder = 4; grp.add(panel); api.dispose(pm);
    const solids = [];
    for (let o = w0 + 0.2; o <= w1 - 0.2 + 0.01; o += 0.8) { const so = { x: gate.x + nx * o, z: gate.z + nz * o, r: 0.7, alive: true, tag: 'mabetKapi' }; L.solids.push(so); solids.push(so); }
    L._sh = null;
    return { id, x: gate.x, z: gate.z, dx, dz, grp, panel, pm, solids, open: false, anim: 0, near: 0, w: wd };
  }

  // gökyüzü: kamerayla birlikte duran yıldızlı ufuk şeridi + zararsız kuyruklu yıldızlar/meteor (kaynak: buildDreamSky; mor yok)
  function gokyuzu(api) {
    const skyGeo = new THREE.PlaneGeometry(1, 1);
    const skyMat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec2 vUv; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} void main(){float edge=smoothstep(0.0,.68,vUv.y); vec2 cell=floor(vUv*vec2(110.,24.));vec2 q=fract(vUv*vec2(110.,24.))-.5;float star=(1.-smoothstep(.025,.07,length(q)))*step(.975,hash(cell));vec3 c=mix(vec3(.035,.07,.18),vec3(.015,.035,.11),vUv.y)+star*vec3(.7,.82,1.);gl_FragColor=vec4(c,edge*.86);}' });
    const sky = new THREE.Mesh(skyGeo, skyMat); sky.renderOrder = 28; sky.frustumCulled = false; api.add(sky); api.dispose(skyGeo); api.dispose(skyMat);
    const ts = new THREE.SphereGeometry(1, 10, 6), ck = new Kit();
    ck.add(ts, 0xfff0c8, [0, 0, 0], null, [0.24, 0.17, 0.17]);
    for (let q = 1; q < 5; q++) ck.add(ts, q & 1 ? 0x9ad5eb : 0xdff2ff, [-0.5 - q * 0.25, 0, 0], null, [0.8, Math.max(0.025, 0.12 - q * 0.021), 0.03]);
    const cg = ck.build(), cm = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, depthTest: false, depthWrite: false, fog: false });
    api.dispose(cg); api.dispose(cm);
    // koca, dost, dolunay: gümüş-altın, sakin, yüz yok
    const mc = document.createElement('canvas'); mc.width = mc.height = 256; { const x = mc.getContext('2d'), g = x.createRadialGradient(128, 128, 20, 128, 128, 128);
      g.addColorStop(0, 'rgba(255,250,228,0.30)'); g.addColorStop(0.42, 'rgba(255,246,214,0.16)'); g.addColorStop(1, 'rgba(255,246,214,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      const d = x.createRadialGradient(112, 108, 10, 128, 128, 78); d.addColorStop(0, '#fffdf0'); d.addColorStop(0.7, '#f3ecd0'); d.addColorStop(1, '#e2d6ae'); x.fillStyle = d; x.beginPath(); x.arc(128, 128, 78, 0, TAU); x.fill();
      x.fillStyle = 'rgba(205,190,150,0.22)'; for (const [a, b, r] of [[100, 112, 16], [150, 96, 11], [140, 150, 19], [98, 152, 9]]) { x.beginPath(); x.arc(a, b, r, 0, TAU); x.fill(); } }
    const mt = new THREE.CanvasTexture(mc); mt.colorSpace = THREE.SRGBColorSpace;
    const moonMat = new THREE.MeshBasicMaterial({ map: mt, transparent: true, depthTest: false, depthWrite: false, fog: false });
    const moon = new THREE.Mesh(skyGeo, moonMat); moon.renderOrder = 29; moon.frustumCulled = false; api.add(moon); api.dispose(mt); api.dispose(moonMat);
    const comets = [];
    for (let k = 0; k < 3; k++) { const o = new THREE.Mesh(cg, cm); o.renderOrder = 31; o.frustumCulled = false; api.add(o); comets.push(o); }
    const right = new THREE.Vector3(), up = new THREE.Vector3(), fwd = new THREE.Vector3();
    const anchor = (o, sx, sy, rf, depth) => {
      right.setFromMatrixColumn(camera.matrixWorld, 0); up.setFromMatrixColumn(camera.matrixWorld, 1); fwd.setFromMatrixColumn(camera.matrixWorld, 2).negate();
      const hh = Math.tan(camera.fov * PI / 360) * depth;
      o.position.copy(camera.position).addScaledVector(fwd, depth).addScaledVector(right, (sx * 2 - 1) * hh * camera.aspect).addScaledVector(up, (1 - sy * 2) * hh);
      o.quaternion.copy(camera.quaternion); o.scale.setScalar(hh * 2 * rf);
    };
    let t = 0;
    api.anim(dt => {
      t += Math.min(dt, 0.05); anchor(sky, 0.5, 0.06, 0.23, 30); sky.scale.x *= camera.aspect / 0.23;
      anchor(moon, camera.aspect > 1 ? 0.27 : 0.3, 0.16, camera.aspect > 1 ? 0.5 : 0.36, 29); moon.scale.y = moon.scale.x * (1 + Math.sin(t * 0.5) * 0.004);
      comets.forEach((o, k) => { const u = (t * (0.07 + k * 0.012) + k * 0.34) % 1; anchor(o, 0.16 + 0.68 * u, 0.145 + k * 0.025 + Math.sin(u * PI) * 0.01, k === 0 ? 0.023 : 0.017, 19); o.rotateZ(0.06 + k * 0.035); });
    });
  }

  // ════════════════ Dekor (kur): zemin renkleri + kenarda sütun, kristal kubbe, yıldız çukuru, dikilitaş, flama, bulut ════════════════
  function kur(L, api) {
    try { if (typeof SUS610 !== 'undefined') SUS610.ekle(L, api, 'mabet'); } catch (e) { console.warn('SUS610', e); }
    const rnd = api.rnd, A = L.areas || [];
    // zemin: yumuşak, düz (dışarıdaki tümsekler düzleşir: bulut denizi gibi)
    try {
      const fl = api.floor || L.floorMesh;
      if (fl && fl.geometry && fl.geometry.attributes.position) { const p = fl.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, 0); p.needsUpdate = true; fl.geometry.computeVertexNormals(); }
      const U = fl && fl.material && fl.material.userData && fl.material.userData.u; if (U && U.uDream) U.uDream.value = 0;
    } catch (e) { /* yok */ }
    const cyl = api.tmp(new THREE.CylinderGeometry(1, 1, 1, 14)), cone = api.tmp(new THREE.ConeGeometry(1, 1, 8)), sph = api.tmp(new THREE.SphereGeometry(1, 12, 8)),
      box = api.tmp(new THREE.BoxGeometry(1, 1, 1)), hemi = api.tmp(new THREE.SphereGeometry(1, 14, 7, 0, TAU, 0, PI / 2)), ico = api.tmp(new THREE.IcosahedronGeometry(1, 0)),
      bowl = api.tmp(new THREE.LatheGeometry([[0, 0.03], [0.4, 0.04], [0.7, 0.1], [0.9, 0.2], [1.0, 0.3], [1.14, 0.12], [1.2, 0.03]].map(q => new THREE.Vector2(q[0], q[1])), 20));
    // E567: yeni çevre kiti (07m_kit_e567.js + 07m_dekor_mabet.js); yüklenemezse eski basit süsler çalışır
    // Kamera güneyde (+z, pitch 0.86): yürünebilir zeminin güneyinde kalan yüksek sütun/kemer/dikilitaşları alçalt
    const flGrid = (x, z) => { const i = Math.floor(x), j = Math.floor(z); return i >= 0 && j >= 0 && i < L.W && j < L.H && L.grid[j * L.W + i] === 1; };
    const southHides = (x, z, topY) => {
      if (topY <= 0.85) return false;
      const dMax = Math.min(22, Math.max(10, Math.ceil(topY * 2.4)));
      for (let dz = 1; dz <= dMax; dz += 1.5) {
        const halfW = 3.6 + dz * 0.44;
        for (const dx of [-halfW, -halfW * 0.5, 0, halfW * 0.5, halfW]) {
          if (flGrid(x + dx, z - dz)) return true;
        }
      }
      return false;
    };
    const rawPut = api.put.bind(api);
    const sphLow = api.tmp(new THREE.SphereGeometry(1, 10, 7));
    api.put = (g, x, y, z, sx = 1, sy = 1, sz = 1, c = 0xffffff, yaw = 0, rx = 0, rz = 0) => {
      const h = Math.abs(sy || 1), topY = (y || 0) + h * 0.5;
      if (southHides(x, z, topY)) {
        if (!flGrid(x, z) && ((Math.abs(Math.round(x * 3 + z * 5))) % 5 === 0)) {
          rawPut(sphLow, x, 0.14, z, 0.55, 0.22, 0.55, 0xd8d0bc, 0, 0, 0);
        }
        return;
      }
      rawPut(g, x, y, z, sx, sy, sz, c, yaw, rx, rz);
    };
    let origBake = null;
    if (typeof PROPKIT !== 'undefined' && PROPKIT && PROPKIT.bake) {
      origBake = PROPKIT.bake;
      PROPKIT.bake = function(kit, x, z, yaw = 0, s = 1) {
        const b = kit && kit.bounds;
        const topY = b ? b.max.y * s : 2.6 * s;
        if (southHides(x, z, topY)) return;
        return origBake.call(this, kit, x, z, yaw, s);
      };
    }
    let HASD = false;
    try {
      if (typeof MABET_DEKOR !== 'undefined') HASD = MABET_DEKOR.olustur(L, api, { K: typeof ODAKIT !== 'undefined' ? ODAKIT : null });
    } catch (e) { console.warn('MABET_DEKOR', e); HASD = false; }
    finally { if (origBake) PROPKIT.bake = origBake; }
    // Antik taş mabet avlusu: oda merkezlerine alçak taş usturlap / güneş-ay rozeti (y=0.02, engel olmaz)
    const ringFlat = api.tmp(new THREE.RingGeometry(0.78, 1.0, 28).rotateX(-PI / 2));
    for (let ri = 0; ri < L.rooms.length; ri++) {
      const rm = L.rooms[ri]; if (!rm || rm.kind === 'side') continue;
      const rr = Math.min(3.8, (rm.r || 7) * 0.45);
      rawPut(ringFlat, rm.x, 0.022, rm.z, rr, 1, rr, 0xc8b482, 0, 0, 0);
      rawPut(ringFlat, rm.x, 0.024, rm.z, rr * 0.58, 1, rr * 0.58, 0x9ab4d8, 0, 0, 0);
    }
    const P = (g, x, y, z, sx, sy, sz, c, yaw, rx, rz) => api.put(g, x, y, z, sx, sy, sz, c, yaw || 0, rx || 0, rz || 0);
    const clouds = (x, z, s) => { P(sph, x, 0.05, z, 2.6 * s, 0.5 * s, 2.2 * s, 0xc4d4ee); P(sph, x + 1.4 * s, 0.12, z + 0.6 * s, 1.8 * s, 0.5 * s, 1.5 * s, 0xdbe6f8); P(sph, x - 1.3 * s, 0.1, z - 0.4 * s, 1.6 * s, 0.45 * s, 1.4 * s, 0xb4c6e6); };
    let shafts = 0;
    const shaftG = api.dispose(new THREE.CylinderGeometry(0.75, 1.5, 5.2, 14, 1, true));
    const shaftM = api.dispose(new THREE.MeshBasicMaterial({ color: 0xdfeaff, transparent: true, opacity: 0.085, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
    const pillar = (x, z, s) => {   // sütun + ay ışığı huzmesi
      if (shafts < 12 && rnd() < 0.4) { shafts++; const m = new THREE.Mesh(shaftG, shaftM); m.position.set(x + 0.9, 2.6, z + 0.5); m.rotation.z = 0.2; m.renderOrder = 3; api.add(m); }
      P(box, x, 0.2 * s, z, 1.1 * s, 0.4 * s, 1.1 * s, 0xcfc6ae); P(cyl, x, 2.0 * s, z, 0.38 * s, 3.2 * s, 0.38 * s, 0xe6dfcb); P(box, x, 3.75 * s, z, 1.0 * s, 0.3 * s, 1.0 * s, 0xd2c9b1);
      P(cyl, x, 1.2 * s, z, 0.4 * s, 0.14 * s, 0.4 * s, 0xc9a24a); P(cyl, x, 2.6 * s, z, 0.4 * s, 0.14 * s, 0.4 * s, 0xc9a24a);
    };
    const dome = (x, z, s) => {   // kristal kubbe
      P(cyl, x, 0.3 * s, z, 1.5 * s, 0.6 * s, 1.5 * s, 0xcfc6ae); P(hemi, x, 0.6 * s, z, 1.3 * s, 1.1 * s, 1.3 * s, 0xbfe0f4); P(cone, x, 1.95 * s, z, 0.12 * s, 0.7 * s, 0.12 * s, 0xf0d890);
      P(box, x, 0.5 * s, z + 1.45 * s, 0.7 * s, 0.9 * s, 0.14 * s, 0x9aa6c4);
      api.glow(x, z, 3.2 * s, 0x9fd4ff, 0.13);
    };
    const obelisk = (x, z, s) => {   // yıldız dikilitaşı: tepesi kristal
      P(box, x, 0.2 * s, z, 0.9 * s, 0.4 * s, 0.9 * s, 0xcfc6ae); P(cone, x, 2.4 * s, z, 0.42 * s, 4.0 * s, 0.42 * s, 0xe0d8c2, PI / 4); P(ico, x, 4.65 * s, z, 0.24 * s, 0.4 * s, 0.24 * s, 0xa8e4ff);
      api.glow(x, z, 2.4 * s, 0x9fd4ff, 0.1);
    };
    const pit = (x, z, s) => {   // yıldız çukuru: yuvarlak taş havuz
      api.put(bowl, x, 0.01, z, s, s, s, 0x6f7897, 0, 0, 0);
      for (let q = 0; q < 7; q++) { const a = q * TAU / 7 + 0.3; P(sph, x + Math.sin(a) * s * 1.05, s * 0.2, z + Math.cos(a) * s * 1.05, s * 0.16, s * 0.1, s * 0.17, q & 1 ? 0xcfc6ae : 0xe2dac4); }
      P(cyl, x, 0.2 * s, z, s * 0.95, 0.03, s * 0.95, 0xbfe4ff); api.glow(x, z, s * 2.6, 0x9fd4ff, 0.14);
    };
    const flag = (x, z, s) => { P(cyl, x, 1.1 * s, z, 0.04 * s, 2.2 * s, 0.04 * s, 0xe6dfcb); P(box, x + 0.35 * s, 1.9 * s, z, 0.7 * s, 0.4 * s, 0.04 * s, 0x4f86d8); P(sph, x + 0.3 * s, 1.92 * s, z + 0.03, 0.09 * s, 0.09 * s, 0.015, 0xffe28a); };
    const crystals = (x, z, s) => {   // ay çiçekleri: gümüş-beyaz, yumuşak parlayan
      for (let j = 0; j < 4; j++) { const a2 = j * 1.7, fx = x + Math.sin(a2) * 0.45 * s, fz = z + Math.cos(a2) * 0.35 * s, h = (0.5 + (j % 3) * 0.22) * s;
        P(cyl, fx, h * 0.5, fz, 0.025 * s, h, 0.025 * s, 0x6fae8c); P(sph, fx, h, fz, 0.2 * s, 0.07 * s, 0.2 * s, 0xf4f8ff); P(sph, fx, h + 0.03, fz, 0.07 * s, 0.05 * s, 0.07 * s, 0xffe9a0); }
      api.glow(x, z, 1.9 * s, 0xcfe6ff, 0.11);
    };
    const kinds = [pillar, dome, obelisk, pit, crystals, pillar, flag, dome, pit];
    const places = [];
    const free = (x, z, r) => { for (let a = 0; a < 8; a++) if (api.isFloor(x + Math.cos(a * PI / 4) * r, z + Math.sin(a * PI / 4) * r)) return false; return !api.isFloor(x, z); };
    (HASD ? [] : L.rooms).forEach((rm, ri) => {
      const n = 12 + ((rm.r || 8) > 9 ? 4 : 0);
      for (let k = 0; k < n; k++) {
        const a = k * TAU / n + rnd() * 0.18, rad = (rm.r || 8) + 3.0 + rnd() * 1.4, x = rm.x + Math.sin(a) * rad, z = rm.z + Math.cos(a) * rad;
        if (api.isFloor(x, z) || api.linkDist(x, z, ) < 3.4) continue;
        const south = z > rm.z + 1.0;
        let f = kinds[(k + ri) % kinds.length], s = 0.8 + rnd() * 0.35;
        if (south && (f === pillar || f === dome || f === obelisk || f === flag)) f = (k & 1) ? pit : crystals;   // güney (kamera tarafı) alçak
        if (!free(x, z, f === pit ? 1.3 * s : 1.2 * s)) continue;
        if (places.some(q => hyp(q.x - x, q.z - z) < 2.6)) continue;
        places.push({ x, z }); f(x, z, s);
      }
      if (ri === 0) { for (const sd of [-1, 1]) { const x = rm.x + sd * (rm.r + 3.6), z = rm.z - 0.8; if (!api.isFloor(x, z)) obelisk(x, z, 1.0); } }
      for (let q = 0; q < 3; q++) { const a = rnd() * TAU, rad = (rm.r || 8) + 7 + rnd() * 5; clouds(rm.x + Math.sin(a) * rad, rm.z + Math.cos(a) * rad, 1.4 + rnd()); }
    });
    // yıldız tozu: yürüyüş alanının kıyısında minik parlak taşlar (sınır belli olsun)
    for (let z = 1; z < L.H - 1; z += 3) for (let x = 1; x < L.W - 1; x += 3) {
      const c = z * L.W + x; if (!L.grid[c] || (L.dWall && L.dWall[c] > 1.6)) continue;
      const s = 0.07 + rnd() * 0.08; P(sph, x + 0.4, s * 0.6, z + 0.4, s, s * 0.6, s, 0xdfeaff);
    }
    // arena: zeminde büyük soluk altın yıldız, çevrede sütunlar
    const ar = L.mb && L.mb.arena;
    if (ar) {
      api.glow(ar.x, ar.z, ar.r * 0.8, 0xffe08a, 0.1);
      for (let q = 0; q < (HASD ? 0 : 8); q++) { const a = q * TAU / 8 + 0.2, x = ar.x + Math.sin(a) * (ar.r + 2.2), z = ar.z + Math.cos(a) * (ar.r + 2.2); if (!api.isFloor(x, z) && !(z > ar.z + 1)) pillar(x, z, 1.1); }
    }
    gokyuzu(api);
    void A;
  }

  // ════════════════ Silik duvar resmi (Kral'a ilk ipucu; AD YOK, EFEKT YOK) ════════════════
  function paintTex() {
    if (GM.paintT) return GM.paintT;
    const W = 512, H = 640, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#c9c1b0'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) { x.fillStyle = 'rgba(' + (150 + Math.random() * 60 | 0) + ',' + (145 + Math.random() * 55 | 0) + ',' + (130 + Math.random() * 50 | 0) + ',0.16)'; x.fillRect(Math.random() * W, Math.random() * H, 4 + Math.random() * 18, 3 + Math.random() * 12); }
    x.strokeStyle = 'rgba(120,112,96,0.6)'; x.lineWidth = 10; x.strokeRect(22, 22, W - 44, H - 44);
    // yaşlı biri: omuzlar (soluk gri-mavi), yüz (krem), gümüş sakal, yarım taç (altın, yalnız sol yarısı), elinde küçük fener
    x.globalAlpha = 0.82;
    x.fillStyle = '#8f9ab0'; x.beginPath(); x.ellipse(256, 560, 150, 110, 0, Math.PI, 0); x.fill();
    x.fillStyle = '#e6d9c3'; x.beginPath(); x.ellipse(256, 270, 82, 98, 0, 0, TAU); x.fill();
    x.fillStyle = '#d7d9de'; x.beginPath(); x.moveTo(176, 300); x.quadraticCurveTo(256, 520, 336, 300); x.quadraticCurveTo(256, 360, 176, 300); x.fill();
    x.fillStyle = '#4a4538'; x.beginPath(); x.ellipse(222, 252, 7, 9, 0, 0, TAU); x.ellipse(290, 252, 7, 9, 0, 0, TAU); x.fill();
    x.strokeStyle = '#6a5f4c'; x.lineWidth = 5; x.beginPath(); x.arc(256, 308, 24, 0.2 * PI, 0.8 * PI); x.stroke();
    x.strokeStyle = '#a89c86'; x.lineWidth = 6; x.beginPath(); x.moveTo(204, 226); x.quadraticCurveTo(222, 214, 240, 226); x.moveTo(272, 226); x.quadraticCurveTo(290, 214, 308, 226); x.stroke();
    x.fillStyle = '#c9a24a'; x.beginPath(); x.moveTo(176, 190); x.lineTo(176, 130); x.lineTo(206, 160); x.lineTo(236, 118); x.lineTo(256, 190); x.closePath(); x.fill();   // yarım taç
    x.strokeStyle = '#8a7a52'; x.lineWidth = 4; x.stroke();
    x.fillStyle = '#c9a24a'; x.fillRect(400, 420, 6, 70); x.strokeStyle = '#8a7a52'; x.lineWidth = 6; x.strokeRect(384, 460, 38, 56);
    x.fillStyle = '#f0e2b0'; x.fillRect(390, 468, 26, 40);
    x.strokeStyle = '#8f9ab0'; x.lineWidth = 22; x.beginPath(); x.moveTo(340, 520); x.lineTo(398, 500); x.stroke();
    x.globalAlpha = 1;
    // solgunluk: açık gri sis katmanı
    const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(210,205,192,0.35)'); gr.addColorStop(1, 'rgba(210,205,192,0.55)'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { keep: true }; return (GM.paintT = t);
  }

  // ════════════════ kurSon: basamaklar, rünler, kapılar, takımyıldızı, resim, konuşmalar ════════════════
  function kurSon(L, api) {
    const g0 = G_(), A = L.areas || [], M = L.mb || {};
    DEKOR_BOL(L, api, 14, 18000);   // PERF: büyük birleşik dekor parçalarını böl (bkz. 07m_kit_ortak.js)
    const gates = [];                       // alan geçitleri (motorun şeker kapıları kapatılır)
    const gatePts = A.map(a => a.gate); for (let k = 1; k < A.length; k++) A[k].gate = null;
    const GATE_ID = { 1: 'tas1', 3: 'rs3', 4: 'p11' };
    for (const k of [1, 3, 4]) { const gp = gatePts[k]; if (gp) gates.push(Object.assign(kapi(api, L, gp, GATE_ID[k]), { k })); }
    const S = { t: 0, started: 0, tas: false, rune: 0, kat: 0, kapiOpenAt: 0, done: false, paintAt: 0, paintSaid: 0, area: -1, stuck: {}, lit: {}, hiDone: false, catiDone: false, comp: 0, compT: -99, cProg: 0, cTarget: 0, fell: 0 };
    L.yuzeyler = L.yuzeyler || []; L.nesneler = L.nesneler || [];
    const surf = [];
    const addPad = (id, x, z, top, r, o = {}) => {
      const phase = o.phase !== undefined ? o.phase : 3;
      const p = { id, x, z, top, r, thick: 0.6, on: o.on !== false, x0: x, z0: z, top0: top, ph: o.ph || 0, bob: o.bob || 0, slide: o.slide || 0, sdx: o.sdx || 0, sdz: o.sdz || 0 };
      p.mesh = makePad(api, { r, ph: phase }); p.mesh.position.set(x, top, z); p.mesh.visible = p.on;
      L.yuzeyler.push(p); surf.push(p); return p;
    };
    if (M.tas1) addPad('tas1', M.tas1.x, M.tas1.z, 0.95, 1.5, { phase: 3 });
    (M.low || []).forEach((q, i) => addPad('low' + i, q.x, q.z, q.top, 0.95, { phase: 1 + (i % 2) }));
    if (M.high) { addPad('hi0', M.high.x, M.high.z, 1.5, 1.05); addPad('hi1', M.high.x + 2.6, M.high.z - 1.2, 3.0, 1.3, { bob: 0.12 }); }
    if (M.cati) { addPad('ca0', M.cati.x, M.cati.z, 1.5, 1.05); addPad('ca1', M.cati.x - 2.5, M.cati.z - 1.3, 3.0, 1.9, { bob: 0.1 }); }
    // rün basamakları: gizli, rün taşına basınca belirir
    (M.rsteps || []).forEach((q, i) => addPad('rs' + (i + 1), q.x, q.z, 0.8 + i * 0.8, i === 2 ? 1.5 : 1.05, { on: false, phase: 1 + i }));
    // 3 kat basamak
    (M.pads || []).forEach(p => addPad(p.id, p.x, p.z, p.top, p.r, { phase: p.j, bob: p.kat >= 1 ? 0.12 : 0, ph: p.j * 1.3 + p.kat, slide: p.kat === 2 && p.j < 3 ? 0.55 : 0, sdx: Math.cos(p.a), sdz: -Math.sin(p.a) }));
    // rün taşları
    (M.runs || []).forEach((q, i) => {
      const R = runeMesh(api, q.x, q.z);
      const o = { id: 'run' + i, tur: 'dugme', x: q.x, z: q.z, r: 1.0, ac: ['rs' + (i + 1)], renk: '#ffb040', mesh: R.g };
      L.nesneler.push(o); S['R' + i] = { o, R };
      api.glow(q.x, q.z, 2.2, 0xa8d4ff, 0.14);
    });
    // yıldız oyması ışıkları
    const lightPad = id => { const p = surf.find(s => s.id === id); if (p && p.mesh && p.mesh.userData.lit && !p.mesh.userData.lit.visible) { p.mesh.userData.lit.visible = true; burst('sparkle', p.x, p.top + 0.1, p.z, { color: '#ffe27a', count: 5 }); return true; } return false; };
    // altın çıkartma / küçük ödül
    const prize = (stickerId, gold) => { try { if (g0 && g0.giveSticker) g0.giveSticker(stickerId, 'gizli'); if (g0 && g0.addGoldSugar) g0.addGoldSugar(gold || 1); } catch (e) { /* yok */ } };
    // sandık: altın yıldız sandığı (çatı bahçesi)
    if (M.cati) { const bx = M.cati.x - 2.5, bz = M.cati.z - 1.3; const chest = new THREE.Group(); const m1 = kp(new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.4, metalness: 0.3 }));
      const b1 = new THREE.Mesh(geo('chB', () => kp(new THREE.BoxGeometry(0.9, 0.5, 0.6))), m1); b1.position.y = 0.25; chest.add(b1);
      const l1 = new THREE.Mesh(geo('chL', () => kp(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 10, 1, false, 0, PI).rotateZ(PI / 2))), m1); l1.position.y = 0.5; chest.add(l1);
      chest.position.set(bx, 3.0, bz); const ps = surf.find(s => s.id === 'ca1'); if (ps && ps.mesh) ps.mesh.add(chest); chest.position.set(0, 0, 0); }
    // gece bekçi heykeli (uyuyan taş tavşan) ve silik duvar resmi: iç salon
    const sal = M.salon; let paint = null, sleeper = null;
    if (sal) {
      // kuzey duvar: yürünebilir alanın dışında kalan kuzey uç
      let wz = sal.z - sal.r - 1.2; for (let d = 0; d < 6 && api.isFloor(sal.x, wz); d++) wz -= 1;
      const slabM = kp(new THREE.MeshStandardMaterial({ color: 0xcfc6ae, roughness: 0.9 }));
      const slab = new THREE.Mesh(geo('slab', () => kp(new THREE.BoxGeometry(1, 1, 1))), slabM); slab.scale.set(7.4, 6.2, 0.6); slab.position.set(sal.x, 3.1, wz - 0.3); api.add(slab);
      const pm = new THREE.MeshBasicMaterial({ map: paintTex(), side: THREE.FrontSide, fog: false }); api.dispose(pm);
      paint = new THREE.Mesh(geo('paintP', () => kp(new THREE.PlaneGeometry(1, 1))), pm); paint.scale.set(4.0, 5.0, 1); paint.position.set(sal.x, 3.15, wz + 0.02); api.add(paint);
      paint.userData.at = { x: sal.x, z: wz + 4 };
      // uyuyan taş tavşan: kenarda küçük heykel
      const sg = new THREE.Group(), sm = kp(new THREE.MeshStandardMaterial({ color: 0xd6cfbb, roughness: 0.9 }));
      const body = new THREE.Mesh(geo('slS', () => kp(new THREE.SphereGeometry(1, 14, 10))), sm); body.scale.set(0.8, 0.65, 0.9); body.position.y = 0.6; sg.add(body);
      const head = new THREE.Mesh(body.geometry, sm); head.scale.set(0.5, 0.45, 0.5); head.position.set(0, 0.95, 0.75); sg.add(head);
      for (const sx of [-1, 1]) { const ear = new THREE.Mesh(body.geometry, sm); ear.scale.set(0.12, 0.5, 0.1); ear.position.set(sx * 0.2, 1.5, 0.72); ear.rotation.z = -sx * 0.25; sg.add(ear); }
      const sx0 = sal.x - sal.r * 0.62, sz0 = sal.z - sal.r * 0.2;
      sg.position.set(sx0, 0, sz0); sg.scale.setScalar(1.3); api.add(sg); sleeper = sg;
      if (api.solid) api.solid(sx0, sz0, 1.0, 'bekci');
    }
    // takımyıldızı: ekranın üstünde Küçük Ejderha çizgisi (2B kanvas; yalnız basamaklar alanında ve tamamlanınca bir süre)
    let cv = null, cx = null;
    try {
      cv = document.createElement('canvas'); cv.width = 190; cv.height = 190;
      cv.style.cssText = 'position:fixed;left:50%;top:92px;transform:translateX(-50%);width:min(30vw,150px);pointer-events:none;z-index:30;opacity:0;transition:opacity .8s';
      document.body.appendChild(cv); cx = cv.getContext('2d');
      api.dispose({ dispose() { if (cv && cv.parentNode) cv.parentNode.removeChild(cv); } });
    } catch (e) { cv = null; }
    function drawConst() {   // ay evresi göstergesi: yeni ay → hilal → yarım → dolunay
      if (!cx) return; cx.clearRect(0, 0, 190, 190);
      const R = 62, c0 = 95;
      cx.strokeStyle = 'rgba(220,235,255,0.7)'; cx.lineWidth = 4; cx.beginPath(); cx.arc(c0, c0, R, 0, TAU); cx.stroke();
      cx.save(); cx.shadowColor = '#fff2c0'; cx.shadowBlur = 14; cx.fillStyle = '#fff4cc'; cx.beginPath(); cx.arc(c0, c0, R - 3, 0, TAU); cx.fill(); cx.restore();
      cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = '#000'; cx.beginPath(); cx.arc(c0 + S.cProg * 2.2 * R, c0, R - 1, 0, TAU); cx.fill(); cx.globalCompositeOperation = 'source-over';
    }
    drawConst();
    const beamG = api.dispose(new THREE.CylinderGeometry(1.1, 1.8, 11, 18, 1, true)), beamM = api.dispose(new THREE.MeshBasicMaterial({ color: 0xeaf2ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
    const beam = new THREE.Mesh(beamG, beamM); beam.visible = false; beam.renderOrder = 5; api.add(beam); let beamT = -1;
    const unlock = (id, why) => { const gt = gates.find(q => q.id === id); if (gt && !gt.open) { gt.open = true; sfx('unlock', { x: gt.x, z: gt.z }); burst('sparkle', gt.x, 1.6, gt.z, { color: '#bfe2ff', count: 10 }); if (why) say(why, { force: true, once: false }); } };
    // ── olaylar ──
    const offs = [];
    const on = (n, fn) => { if (g0 && g0.on) { try { const r = g0.on(n, e => { if (g0.L === L || n === 'zone') fn(e); }); if (typeof r === 'function') offs.push(r); } catch (e) { /* yok */ } } };
    on('indi', e => {
      if (!e || !e.id) return;
      if (e.id === 'tas1' && !S.tas) { S.tas = true; lightPad('tas1'); say('b06_ziplama_p', { force: true }); unlock('tas1'); }
      if (e.id === 'rs3' && S.rune >= 3) unlock('rs3');
      if (/^p\d+$/.test(e.id)) {
        lightPad(e.id); const n = +e.id.slice(1);
        if (n === 3 && S.kat < 1) { S.kat = 1; S.cTarget = 4 / 11; say('b06_kat1', { force: true }); }
        if (n === 7 && S.kat < 2) { S.kat = 2; S.cTarget = 8 / 11; say('b06_kat2', { force: true }); }
        if (n === 11 && S.kat < 3) { S.kat = 3; S.cTarget = 1; S.compT = S.t; const gp = gates.find(q => q.id === 'p11'); if (gp) { beam.position.set(gp.x, 5.5, gp.z); beam.visible = true; beamT = 0; } say('b06_takim', { force: true }); S.kapiOpenAt = S.t + 3.0; }
      }
      if (/^rs\d$/.test(e.id)) lightPad(e.id);
      if (e.id === 'hi1' && !S.hiDone) { S.hiDone = true; lightPad('hi1'); prize('mabet_kuyruklu', 1); say('b06_dilek', { force: true, once: false }); burst('sparkle', e.x || 0, 3, 0, {}); }
      if (e.id === 'ca1' && !S.catiDone) { S.catiDone = true; lightPad('ca1'); prize('gizli_mabet_cati', 2); say('b06_cati', { force: true, once: false }); }
    });
    on('nesne', e => { if (e && /^run\d$/.test(e.id)) { const rr = S['R' + e.id.slice(3)]; if (rr) rr.o.done = true;   // motor nesneyi kopyalar: bizim kopyayı da işaretle (parlama + en yakın taş)
      S.rune++; if (S.rune === 1) say('b06_run_p', { force: true }); if (S.rune === 3) pirilGit((M.rsteps[0] || {}).x || 0, (M.rsteps[0] || {}).z || 0); } });
    on('dusme', () => { if (S.fell++ === 0) say('b06_dusme', { force: true }); });
    on('happy', e => {
      if (!e || !e.boss || e.type !== 'mabetBekcisi') return;
      setTimeout(() => { try { if (typeof PIRIL_GUC !== 'undefined' && PIRIL_GUC && PIRIL_GUC.gucVer) PIRIL_GUC.gucVer('ruzgar'); } catch (er) { /* yok */ } say('b06_ruzgar', { force: true, once: false }); }, 5200);
      setTimeout(() => say('b06_ruzgar2', { force: true, once: false }), 10500);
    });
    on('zone', () => { for (const f of offs) { try { f(); } catch (e) { /* yok */ } } });

    const hero = () => g0 && g0.P;
    S.soft = {};   // Pırıl'ın kendisi açtığı kapılar (görev yapılmadan)
    // basılmamış en yakın ay işareti taşı (sırayla değil, herhangi biri basılabilir)
    const enYakinRun = P => { let best = null, bd = 1e9; for (let i = 0; i < 3; i++) { const r = S['R' + i]; if (!r || r.o.done) continue; const d = hyp(P.pos.x - r.o.x, P.pos.z - r.o.z); if (d < bd) { bd = d; best = r.o; } } return best || M.rsteps[0]; };
    MABET.qa = { S, M, surf, gates, unlock, lightPad };
    let T = 0;
    api.anim((dt, hx, hz) => {
      dt = Math.min(dt, 0.05); T += dt; S.t = T;
      const P = hero(); if (!P) return;
      const playing = live();
      // hareketli basamaklar (hafif süzülme, hız ≤ 0,3 m/sn)
      for (const s of surf) {
        if (s.bob) s.top = s.top0 + Math.sin(T * 0.9 + s.ph) * s.bob;
        if (s.slide) { const o = Math.sin(T * 0.45 + s.ph) * s.slide; s.x = s.x0 + s.sdx * o; s.z = s.z0 + s.sdz * o; }
        if (s.mesh && s.on && s.k >= 1) s.mesh.position.set(s.x, s.top, s.z);
      }
      // rün taşları: basılınca parlar
      for (const k of ['R0', 'R1', 'R2']) { const r = S[k]; if (!r) continue; const on2 = r.o.done ? 1 : 0.55 + 0.25 * Math.sin(T * 3 + k.charCodeAt(1)); r.R.glyph.material.opacity = on2; r.R.glyph.material.color.setHex(r.o.done ? 0xfff0b0 : 0x7ea2c8); r.R.ring.material.opacity = r.o.done ? 0.95 : 0.5; }
      // kapılar
      for (const gt of gates) {
        if (gt.open) {
          if (gt.anim < 1) { gt.anim = Math.min(1, gt.anim + dt / 1.6); gt.pm.opacity = 0.42 * (1 - gt.anim); gt.panel.position.y = 1.4 + gt.anim * 2.4; if (gt.anim >= 1) { gt.panel.visible = false; for (const so of gt.solids) so.alive = false; L._sh = null; } }
        } else {
          gt.pm.opacity = 0.34 + 0.1 * Math.sin(T * 2.2);
          const d = hyp(P.pos.x - gt.x, P.pos.z - gt.z);
          // YUMUŞAK KAPI: görev isteğe bağlı. Feza kapının yanında (6 m) toplam ~4,5 sn durursa (gidip gelse de sayılır) Pırıl kapıyı kendisi açar.
          if (playing && d < 6) { S.stuck[gt.id] = (S.stuck[gt.id] || 0) + dt; gt.near += dt; }
          if (playing && d < 6 && !gt.hint && gt.near > 0.8) {   // ipucu bir kez: cümle + Pırıl görevin yerini gösterir
            gt.hint = true; const first = { tas1: 'b06_kapi1', rs3: 'b06_kapi2', p11: 'b06_bas_ipucu2' }[gt.id]; if (first) say(first, { force: true, once: false });
            const tgt = gt.id === 'tas1' ? M.tas1 : gt.id === 'rs3' ? (S.rune < 3 ? enYakinRun(P) : M.rsteps[0]) : (M.pads && M.pads[0]); if (tgt) pirilGit(tgt.x, tgt.z);
          }
          if (playing && (S.stuck[gt.id] || 0) > 4.5) {   // Pırıl açar: kapıya uçar, parıltı + "yol açıldı"
            pirilGit(gt.x, gt.z); S.soft[gt.id] = true; unlock(gt.id);
            // tapınak kapısı (p11) için "Tapınağın kapısı açıldı"; ses motoru aynı cümleyi 24 sn içinde tekrar söylemez → öbürüne geç
            for (const k of gt.id === 'p11' ? ['b06_kapi', 'kapi_acildi'] : ['kapi_acildi', 'b06_kapi']) if (say(k, { force: true, once: false, prio: 3 })) break;
          }
        }
      }
      if (beamT >= 0) { beamT += dt; const u = beamT / 4.2; beamM.opacity = Math.sin(clamp(u, 0, 1) * PI) * 0.3; if (u >= 1) { beamT = -1; beam.visible = false; } }
      if (S.kapiOpenAt && T >= S.kapiOpenAt) { S.kapiOpenAt = 0; unlock('p11', 'b06_kapi'); }
      // takımyıldızı çizgisi
      S.cProg += (S.cTarget - S.cProg) * Math.min(1, dt * 1.6); if (Math.abs(S.cTarget - S.cProg) < 0.002) S.cProg = S.cTarget;
      if (cv) {
        const inArea = P.area === 3 && playing, show = inArea || (S.compT > 0 && T - S.compT < 7);
        cv.style.opacity = show && S.cTarget > 0 ? '0.95' : '0';
        if (show) { S._dc = (S._dc || 0) + dt; if (S._dc > 0.04) { S._dc = 0; drawConst(); } }
      }
      // konuşmalar
      if (playing) {
        const ar = P.area;
        if (T > 1 && !S.started) { S.started = 1; say('b06_giris', { force: true }); }
        if (T > 8 && S.started === 1) { S.started = 2; say('b06_giris_p'); }
        if (T > 15 && S.started === 2 && !S.tas && !S.soft.tas1) { S.started = 3; say('b06_zip_ipucu'); }
        if (T > 22 && S.started === 3 && !S.tas && !S.soft.tas1) { S.started = 4; say('b06_ziplama'); if (M.tas1) pirilGit(M.tas1.x, M.tas1.z); }
        if (ar !== S.area) {
          S.area = ar;
          if (ar === 1) { say('b06_avlu', { force: true }); setTimeout(() => say('b06_kuyruklu'), 9000); }
          if (ar === 2) say('b06_run', { force: true });
          if (ar === 3) { say('b06_bas_ipucu', { force: true }); setTimeout(() => say('b06_bas_ipucu2'), 7000); if (M.pads && M.pads[0]) pirilGit(M.pads[0].x, M.pads[0].z); }
          if (ar === 4) { say('b06_salon', { force: true }); setTimeout(() => say('b06_bekci_uyur'), 6500); }
          if (ar === A.length - 1) say('b06_arena', { force: true, once: false });
        }
        // silik duvar resmi: yola çıkınca; yalnız anlatıcı + Pırıl tek cümle (efekt/ses vurgusu yok)
        if (paint && P.area === 4) {
          const a = paint.userData.at, d = hyp(P.pos.x - a.x, P.pos.z - a.z);
          if (!S.paintSaid && d < 8.5 && T - (S.areaT || 0) > 0) { S.paintSaid = 1; S.paintAt = T; say('b06_resim', { force: true }); }
          if (S.paintSaid === 1 && T - S.paintAt > 7.5) { S.paintSaid = 2; say('b06_resim_p', { force: true }); }
        }
        if (ar === 4 && !S.areaT) S.areaT = T;
        if (ar === 0 && !S.tas && !S.soft.tas1 && M.tas1 && T > 3 && hyp(P.pos.x - M.tas1.x, P.pos.z - M.tas1.z) < 6) say('b06_ziplama');
      }
      if (sleeper) sleeper.rotation.z = Math.sin(T * 1.4) * 0.02;
    });
  }

  if (typeof ZEMIN !== 'undefined' && ZEMIN.TEMA && ZEMIN.TEMA.mabet) {
    Object.assign(ZEMIN.TEMA.mabet, {
      tile:  { n: 26, r: 0.88, h: 0.04, bev: 0.06, rough: 0.78, c1: 0xd6cfc0, c2: 0xc8c0b0, c3: 0xe0d8c8, edge: 0x8c94a8 },
      cover: ['grass', 0x5c7396, [0xa8d4ff, 0xf4f8ff, 0xffe8a0]],   // MOR YOK: gümüş-mavi, inci beyazı, yıldız altını
      spark: [0x9fd8ff, 0xffe8a0],
    });
  }

  BOLUM.define('mabet', {
    ad: 'Ay Tapınağı',
    taban: 'mabet',              // bulutların üstünde gece zirvesi, antik taş mabet; dekor kur()'da yeniden çerçevelenir
    size: 100, side: 2, lowGravity: true,
    areas: [{ id: 'a1', ad: 'Bulut Kapısı', rooms: 1 }, { id: 'a2', ad: 'Yıldız Tozu Avlusu', rooms: 2 }, { id: 'a3', ad: 'Rün Taşları Bahçesi', rooms: 2 }, { id: 'a4', ad: 'Yıldız Basamakları', rooms: 1 }, { id: 'a5', ad: 'Mabet İç Salonu', rooms: 1 }],
    muzik: 'ay', malzeme: 'isik6', kayipEsya: null, final: false,
    isik: { fog: [0x182650, 36, 98], hemiSky: 0xc4d8f8, hemiGround: 0x464e6a, hemi: 0.88, sunColor: 0xfff2dc, sun: 1.28, sunOffset: [-12, 26, 14],
      env: [0x385482, 0x6482ae, 0x1e2846, 0.56], bloom: 0.30, exposure: 1.08, sat: 1.08, vig: 0.22, fezaLight: 1.72, fezaLightColor: 0xfff4dc },
    zemin: { tA: 0xd8d1c2, tB: 0xe2dbd0, tC: 0xcfdbe8, out: 0x384e7c, outAmt: 0.82, macro: 0xb8c6dc, soluk: 0.22 },
    minimap: { zemin: '#2c3b66' },
    harita: { ad: 'Ay Tapınağı', detay: 'Dolunayın altında taş tapınak, ay evresi basamakları ve Ay Tavşanı', renk: '#5b8def', simge: '🌙' },
    yolculuk: { arac: 'yaprak', cumle: 'Yaprak kayığımız kızıl parıltıya doğru süzülüyor!' },
    huysuzlar: { yildizPonpon: 3 }, elitler: ['yildizPonpon'], boss: 'mabetBekcisi',
    yerlesim, kur, kurSon,
  });
  return { say, qa: null };
})();
