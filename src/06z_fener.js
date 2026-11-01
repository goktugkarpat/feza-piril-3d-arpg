/* ── Bölüm 10: Büyük Fener (FİNAL) (Feza ve Pırıl: Büyük Fener) ──
   Gökkuşağı Adaları'nın tepesinde sönmüş Büyük Fener. Savaş yok: unutulmuş oyuncakları neşelendir, Kral Tonton'un anılarını geri getir (src/05z_fener.js).
     1. Bulut Basamakları   herkes burada; kısa yürüyüş
     2. Yağmur Adası        Yağmur Damlacıkları + ilk unutulmuş oyuncaklar (üzgün tahta at, kırık tren)
     3. Gökkuşağı Köprüsü   Feza yürüdükçe 9 renkli bayrak sırayla yanar (her biri bir bölüm; haritadaki fenerle aynı sıra/renk)
     4. Yıldız Adası        fenerin dibi; uzakta Kral'ın gölgesi
     Arena: Kral Meydanı — Büyük Fener (9 cam yüzlü lamba + tepede 10. boş yuva), Kral Tonton ve masası.
   FİNAL (Kral neşelenince): fener lambası içten sırayla yanar → dostlar fenerin yanında toplanır → Su / Toprak / Ateş Dede tek tek selam verir
   → (motor) neşe kristali → Pırıl büyür, uçuş, Feza sabah yatağında uyanır (10_story.js endingBeats). Tek efekt, sıralı.
   Mor yalnız Pırıl ve anne ejderha (tanıma sonrası). Cümleler: 02l_fener.js (b10_...). Genel ad: FENER. Gizli odalar bu sürümde yok. */
const FENER = (() => {
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
  // haritadaki fener ile aynı sıra ve renk (9 cam yüz: 06b_bolum_sirasi DIYAR renkleri; mor yok)
  const CAM = [0xff8fb8, 0x4fc3e8, 0x5cbf6a, 0xe9b44c, 0x6fa8d8, 0x5b8def, 0xff7a4d, 0xe8a07a, 0xec7f98];

  // ════════════════ Yerleşim ════════════════
  function yerlesim(L, api) {
    const A = L.areas || [];
    const mainRooms = a => (A[a] ? A[a].rooms.filter(ri => L.rooms[ri] && L.rooms[ri].kind !== 'side') : []);
    const areaOf = {}; A.forEach((a, k) => { if (!a.boss) a.rooms.forEach(ri => { areaOf[ri] = k; }); });
    const LIST = [null, ['damlacik', 'tahtaAt', 'damlacik'], ['balerin', 'tahtaAt', 'kirikTren'], ['kirikTren', 'balerin']];
    const CAP = [0, 3, 3, 2], packN = {}, keep = [];
    for (const sp of L.spawns || []) {
      const ai = areaOf[sp.room];
      if (sp.room === 0) continue;
      if (ai === undefined) { keep.push(sp); continue; }
      const list = LIST[Math.min(ai, LIST.length - 1)]; if (!list) continue;
      const n = packN[sp.pack] = (packN[sp.pack] || 0) + 1;
      if (n > CAP[Math.min(ai, CAP.length - 1)]) continue;
      sp.type = list[(n - 1 + sp.pack) % list.length];
      if (sp.elite) sp.type = 'tahtaAt';
      delete sp.variant; keep.push(sp);
    }
    L.spawns.length = 0; L.spawns.push(...keep);
    const F = L.fn = { arena: null, kopru: null, adim: null, yagmur: null, yildiz: null };
    const rm = a => { const r = L.rooms[mainRooms(a)[0]]; return r ? { x: r.x, z: r.z, r: r.r || 8 } : null; };
    F.adim = rm(0); F.yagmur = rm(1); F.kopru = rm(2); F.yildiz = rm(3);
    const ar = L.rooms.filter(r => r.kind !== 'side').pop(); if (ar) F.arena = { x: ar.x, z: ar.z, r: ar.r || 11 };
  }

  // ════════════════ Fener Işığı Yuvaları (QA2): 9 ışık parçası, 9 renkli yuva; parmakla sürükle, yanlış yuva yok ════════════════
  const YUVA = (() => {
    let kay = false;
    const TAU2 = Math.PI * 2, hexs = c => '#' + c.toString(16).padStart(6, '0');
    const snd = n => { try { if (typeof AUD !== 'undefined' && AUD.sfx) AUD.sfx(n); } catch (e) { /* sessiz */ } };
    function kayit() {
      if (kay || typeof MINIGAME === 'undefined') return false; kay = true;
      MINIGAME.register('fenerYuvalari', { ad: 'Fener Işığı Yuvaları', ikon: '💡', renk: '#ffe27a', holdsWorld: true, yildizlar: [1, 9, 9],
        start(ctx) {
          const root = ctx.root;
          root.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden;background:#1b2a4a';
          root.innerHTML = '';
          const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none'; root.appendChild(cv);
          const skip = document.createElement('button'); skip.textContent = 'Geç ▶'; skip.style.cssText = 'position:absolute;right:16px;top:16px;font:bold 22px system-ui,sans-serif;padding:10px 18px;border-radius:22px;border:3px solid #fff;background:rgba(255,255,255,.25);color:#fff';
          root.appendChild(skip);
          const G = { root, cv, c: cv.getContext('2d'), W: 0, H: 0, t: 0, n: 0, drag: null, pl: [], so: null, bitti: 0, atla: false, parts: [] };
          skip.addEventListener('pointerdown', e => { e.stopPropagation(); G.atla = true; });
          G.rs = () => {
            const w = innerWidth, h = innerHeight, d = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(w * d); cv.height = Math.round(h * d); G.W = w; G.H = h; G.c.setTransform(d, 0, 0, d, 0, 0);
            const cx = w / 2, R = Math.min(w * 0.42, 330), oldS = G.so, oldP = G.pl;
            G.so = CAM.map((col, i) => { const a = Math.PI * (0.06 + 0.88 * i / 8); return { col, x: cx - Math.cos(a) * R * 1.12, y: h * 0.7 - Math.sin(a) * R * 0.42 + R * 0.12, ok: oldS ? oldS[i].ok : false }; });
            G.pl = CAM.map((col, i) => { const o = oldP[i], hx = w * (0.14 + 0.72 * i / 8), hy = h * 0.15 + (i % 2) * 44; return { col, hx, hy, x: o && (o.on || G.drag) ? o.x : hx, y: o && (o.on || G.drag) ? o.y : hy, on: o ? o.on : false }; });
          };
          G.rs(); addEventListener('resize', G.rs);
          const pos = e => { const b = root.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
          G.dn = e => { const [x, y] = pos(e), p = G.pl[G.n]; if (p && !p.on && Math.hypot(x - p.x, y - p.y) < 90) { G.drag = { id: e.pointerId, dx: p.x - x, dy: p.y - y }; e.preventDefault(); } };
          G.mv = e => { if (G.drag && G.drag.id === e.pointerId) { const [x, y] = pos(e), p = G.pl[G.n]; p.x = x + G.drag.dx; p.y = y + G.drag.dy; } };
          G.up = e => {
            if (!G.drag) return; const p = G.pl[G.n], s = G.so[G.n]; G.drag = null;
            if (Math.hypot(p.x - s.x, p.y - s.y) < 120) {
              p.x = s.x; p.y = s.y; p.on = true; s.ok = true; G.n++; snd('star');
              for (let i = 0; i < 8; i++) { const a = i * TAU2 / 8; G.parts.push({ x: s.x, y: s.y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, l: 0.5, col: hexs(s.col) }); }
              if (G.n >= 9) { G.bitti = 0.001; snd('cheer'); }
            } else p.back = 1;
          };
          root.addEventListener('pointerdown', G.dn); root.addEventListener('pointermove', G.mv); root.addEventListener('pointerup', G.up); root.addEventListener('pointercancel', G.up);
          root._mini = G; ctx.data.G = G;
        },
        update(dt, ctx) {
          const G = ctx.data.G; if (!G) return 'done'; dt = Math.min(Math.max(dt, 0), 0.05); G.t += dt; const c = G.c, W = G.W, H = G.H;
          if (G.atla) { for (const s of G.so) s.ok = true; G.n = 9; return 'done'; }
          const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b2a4a'); g.addColorStop(1, '#3b6a86'); c.fillStyle = g; c.fillRect(0, 0, W, H);
          c.fillStyle = 'rgba(255,255,255,.1)'; c.beginPath(); c.moveTo(W / 2 - 70, H); c.lineTo(W / 2 - 40, H * 0.32); c.lineTo(W / 2 + 40, H * 0.32); c.lineTo(W / 2 + 70, H); c.fill();
          for (const q of G.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.l -= dt; } G.parts = G.parts.filter(q => q.l > 0);
          G.so.forEach((s, i) => {
            const act = i === G.n; c.lineWidth = 8; c.strokeStyle = hexs(s.col); c.globalAlpha = s.ok ? 1 : act ? 0.6 + 0.4 * Math.sin(G.t * 6) : 0.35;
            c.beginPath(); c.arc(s.x, s.y, 30 + (act ? 4 * Math.sin(G.t * 6) : 0), 0, TAU2); c.stroke(); c.globalAlpha = 1;
            if (s.ok) { c.fillStyle = hexs(s.col); c.globalAlpha = 0.35; c.beginPath(); c.arc(s.x, s.y, 42, 0, TAU2); c.fill(); c.globalAlpha = 1; }
          });
          G.pl.forEach((p, i) => {
            if (p.back) { p.x += (p.hx - p.x) * Math.min(1, dt * 10); p.y += (p.hy - p.y) * Math.min(1, dt * 10); if (Math.hypot(p.x - p.hx, p.y - p.hy) < 2) p.back = 0; }
            const act = i === G.n, r = p.on ? 24 : act ? 30 + 3 * Math.sin(G.t * 6) : 22;
            c.globalAlpha = p.on || act ? 1 : 0.55; c.fillStyle = hexs(p.col); c.beginPath(); c.arc(p.x, p.y, r, 0, TAU2); c.fill();
            c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(p.x - r * 0.3, p.y - r * 0.3, r * 0.28, 0, TAU2); c.fill(); c.globalAlpha = 1;
            if (act && !p.on && !G.drag && G.t > 0.5) { c.font = '44px "Segoe UI Emoji","Apple Color Emoji",sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText('👇', p.x + 8, p.y + 70 + 6 * Math.sin(G.t * 5)); }
          });
          for (const q of G.parts) { c.globalAlpha = Math.min(1, q.l * 2); c.fillStyle = q.col; c.beginPath(); c.arc(q.x, q.y, 6, 0, TAU2); c.fill(); } c.globalAlpha = 1;
          if (G.bitti) { G.bitti += dt; c.fillStyle = 'rgba(255,240,170,' + Math.min(0.5, G.bitti * 0.5) + ')'; c.fillRect(0, 0, W, H); if (G.bitti > 2.2) return 'done'; }
        },
        end(ctx) { const G = ctx.data.G; if (G) { G.root.removeEventListener('pointerdown', G.dn); G.root.removeEventListener('pointermove', G.mv); G.root.removeEventListener('pointerup', G.up); removeEventListener('resize', G.rs); } return 9; } });
      return true;
    }
    return { ac(onEnd) { kayit(); let ok = false; try { ok = typeof MINIGAME !== 'undefined' && MINIGAME.start('fenerYuvalari', { from: 'zone', onEnd }); } catch (e) { ok = false; } return ok; } };
  })();

  // ════════════════ Büyük Fener modeli ════════════════
  function fenerModel(api, x, z) {
    if (typeof FENER_DEKOR !== 'undefined' && typeof YAPI !== 'undefined') { try { return FENER_DEKOR.kule(api, x, z, CAM, kp); } catch (e) { console.warn('FENER_DEKOR.kule', e); } }   // E8910: yeni 9 yüzlü fener; hata olursa eski basit model
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const stone = kp(new THREE.MeshStandardMaterial({ color: 0xe9e1d2, roughness: 0.85 })), stripe = kp(new THREE.MeshStandardMaterial({ color: 0xd9a58f, roughness: 0.8 }));
    const gold = kp(new THREE.MeshStandardMaterial({ color: 0xd9b24a, roughness: 0.35, metalness: 0.5 }));
    const H = 9;
    for (let i = 0; i < 5; i++) {   // taş gövde: 5 halka, yukarı daralır, aralarda şerit
      const r0 = 2.6 - i * 0.3, r1 = 2.6 - (i + 1) * 0.3, h = H / 5;
      const c = new THREE.Mesh(geo('ft' + i, () => kp(new THREE.CylinderGeometry(r1, r0, h, 24))), i % 2 ? stripe : stone); c.position.y = h * (i + 0.5); c.castShadow = true; g.add(c);
    }
    const base = new THREE.Mesh(geo('fb', () => kp(new THREE.CylinderGeometry(3.4, 3.7, 0.7, 24))), stone); base.position.y = 0.35; g.add(base);
    const door = new THREE.Mesh(geo('fd', () => kp(new THREE.BoxGeometry(1.1, 1.9, 0.3))), gold); door.position.set(0, 1.0, 2.75); g.add(door);
    const gal = new THREE.Mesh(geo('fg', () => kp(new THREE.CylinderGeometry(2.2, 1.9, 0.35, 24))), gold); gal.position.y = H + 0.1; g.add(gal);
    // 9 cam yüz
    const panes = [];
    for (let i = 0; i < 9; i++) {
      const a = i * TAU / 9, m = new THREE.MeshBasicMaterial({ color: 0x8b93a0, transparent: true, opacity: 0.92 }); api.dispose(m);
      const p = new THREE.Mesh(geo('fpane', () => kp(new THREE.BoxGeometry(1.0, 1.6, 0.12))), m);
      p.position.set(Math.sin(a) * 1.4, H + 1.1, Math.cos(a) * 1.4); p.rotation.y = a; g.add(p); panes.push({ m, c: CAM[i] });
    }
    const roof = new THREE.Mesh(geo('fr', () => kp(new THREE.ConeGeometry(2.2, 1.5, 9))), gold); roof.position.y = H + 2.7; g.add(roof);
    // 10. küçük boş yuva (Kral'ın kıvılcımı): tepede
    const sk = new THREE.Mesh(geo('fs', () => kp(new THREE.SphereGeometry(0.28, 12, 8))), new THREE.MeshBasicMaterial({ color: 0x8b93a0 })); sk.position.y = H + 3.7; g.add(sk); api.dispose(sk.material);
    const halo = new THREE.Mesh(geo('fh', () => kp(new THREE.PlaneGeometry(12, 12))), new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false })); halo.position.y = H + 1.1; halo.renderOrder = 6; g.add(halo); api.dispose(halo.material);
    api.add(g);
    return { g, panes, socket: sk, halo, lit: 0, H };
  }
  // gökkuşağı yayı (yumuşak, kalın şeritler) — yalnız kenar süsü
  function rainbow(api, x, z, s, yaw) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; g.scale.setScalar(s);
    const cols = [0xff8a8a, 0xffb86b, 0xffe27a, 0x8fe08f, 0x7cc4f0, 0xf6a6d0];
    cols.forEach((c, i) => { const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85, fog: false }); api.dispose(m); const t = new THREE.Mesh(geo('rb' + i, () => kp(new THREE.TorusGeometry(7 - i * 0.35, 0.2, 6, 28, PI))), m); g.add(t); });
    api.add(g); return g;
  }

  // ════════════════ Dekor ════════════════
  function kur(L, api) {
    const F = L.fn || {}, rnd = api.rnd;
    try {
      const fl = api.floor || L.floorMesh;
      if (fl && fl.geometry && fl.geometry.attributes.position) { const p = fl.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, 0); p.needsUpdate = true; fl.geometry.computeVertexNormals(); }
    } catch (e) { /* yok */ }
    const sph = api.tmp(new THREE.SphereGeometry(1, 12, 8)), cyl = api.tmp(new THREE.CylinderGeometry(1, 1, 1, 10)), cone = api.tmp(new THREE.ConeGeometry(1, 1, 8));
    const P = (g, x, y, z, sx, sy, sz, c) => api.put(g, x, y, z, sx, sy, sz, c, 0, 0, 0);
    const cloud = (x, z, s) => { P(sph, x, 0.05, z, 2.6 * s, 0.5 * s, 2.2 * s, 0xfff4f4); P(sph, x + 1.4 * s, 0.12, z + 0.6 * s, 1.8 * s, 0.5 * s, 1.5 * s, 0xffffff); P(sph, x - 1.3 * s, 0.1, z - 0.4 * s, 1.6 * s, 0.45 * s, 1.4 * s, 0xf0e8f4); };
    const flower = (x, z, s) => { P(cyl, x, 0.3 * s, z, 0.03 * s, 0.6 * s, 0.03 * s, 0x7fcf8a); P(sph, x, 0.65 * s, z, 0.16 * s, 0.1 * s, 0.16 * s, [0xffd86b, 0xffa0c4, 0x9fd8ff][((x * 7 + z * 3) | 0) % 3 < 0 ? 0 : ((x * 7 + z * 3) | 0) % 3]); };
    const bell = (x, z, s) => { P(cyl, x, 1.2 * s, z, 0.04 * s, 2.4 * s, 0.04 * s, 0xe9e1d2); P(cone, x, 0.55 * s, z, 0.2 * s, 0.4 * s, 0.2 * s, 0xffe08a); };
    const free = (x, z, r) => { for (let a = 0; a < 8; a++) if (api.isFloor(x + Math.cos(a * PI / 4) * r, z + Math.sin(a * PI / 4) * r)) return false; return !api.isFloor(x, z); };
    let yeni = false;   // E8910: gece adası + deniz + fener takımı (src/07m_dekor_fener.js); yüklenemezse eski bulut süsleri
    try { if (typeof FENER_DEKOR !== 'undefined' && typeof YAPI !== 'undefined' && typeof SEHIR_DEKOR !== 'undefined') { F.dekor = FENER_DEKOR.olustur(L, api, F); yeni = true; } } catch (e) { console.warn('FENER_DEKOR', e); }
    if (!yeni) L.rooms.forEach(rm => {
      const R = rm.r || 8, n = 14;
      for (let k = 0; k < n; k++) {
        const a = k * TAU / n + rnd() * 0.2, rad = R + 2.6 + rnd() * 1.5, x = rm.x + Math.sin(a) * rad, z = rm.z + Math.cos(a) * rad;
        if (api.isFloor(x, z) || api.linkDist(x, z) < 3.2 || !free(x, z, 1.1)) continue;
        const f = k % 3; if (f === 0) flower(x, z, 1 + rnd() * 0.5); else if (f === 1) bell(x, z, 0.9 + rnd() * 0.4); else cloud(x, z, 0.5 + rnd() * 0.3);
      }
      for (let q = 0; q < 3; q++) { const a = rnd() * TAU, rad = R + 7 + rnd() * 5; cloud(rm.x + Math.sin(a) * rad, rm.z + Math.cos(a) * rad, 1.4 + rnd()); }
    });
    // pastel bulut adaları: oda zeminleri yumuşak inci rengi (taş döşeme altta kalır, yollar taş)
    { const dm = new THREE.MeshLambertMaterial({ color: 0xf3e6e2, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); api.dispose(dm);
      const dg = api.tmp(new THREE.CircleGeometry(1, 40).rotateX(-PI / 2));
      for (const rm of L.rooms) { if (true) continue; const d = new THREE.Mesh(dg, dm); d.position.set(rm.x, 0.03, rm.z); const R = (rm.r || 8) + 0.6; d.scale.set(R, 1, R); api.add(d); } }
    // arena: Büyük Fener (kuzeyde, yürünen alanın dışında), Kral'ın masası ve yastık yığını
    const ar = F.arena;
    if (ar) {
      F.tower = fenerModel(api, ar.x, ar.z - ar.r - 4.2);
      api.glow(ar.x, ar.z, ar.r * 0.9, 0xfff0d0, 0.1);
      const tx = ar.x - 2.6, tz = ar.z - 2.2;
      api.box(tx, 0.55, tz, 2.2, 0.12, 1.2, 0xb88a5a, 0); for (const sx of [-0.9, 0.9]) for (const sz of [-0.45, 0.45]) api.box(tx + sx, 0.28, tz + sz, 0.1, 0.56, 0.1, 0x8f6a44, 0);
      F.masa = { x: tx, z: tz };
      if (!yeni) { rainbow(api, ar.x - ar.r - 9, ar.z + 2, 1.6, PI / 2); rainbow(api, ar.x + ar.r + 9, ar.z + 2, 1.6, -PI / 2); }
    }
    if (F.kopru && !yeni) { for (const sd of [-1, 1]) rainbow(api, F.kopru.x + sd * (F.kopru.r + 6), F.kopru.z, 1.0, sd * PI / 2); }
  }

  // ════════════════ kurSon: dostlar, bayraklar, konuşmalar, final ════════════════
  function kurSon(L, api) {
    const g0 = G_(), A = L.areas || [], F = L.fn || {};
    const offs = []; const on = (n, fn) => { if (g0 && g0.on) { try { const r = g0.on(n, e => { if (g0.L === L || n === 'zone') fn(e); }); if (typeof r === 'function') offs.push(r); } catch (e) { /* yok */ } } };
    for (let k = 1; k < A.length; k++) A[k].gate = null;   // motorun şeker kapıları kapalı: bölüm açık yürünür
    let T = 0; const TQ = []; const later = (sn, fn) => { TQ.push({ t: T + sn, fn }); };
    const S = { started: 0, area: -1, flags: 0, endT: 0, endStep: 0, lamp: -1, lampT: 0, final: false, ejd: [], dostPos: null };
    // dost bayrakları (köprü): 9 renkli, Feza yürüdükçe sırayla yanar
    const flags = [];
    if (F.kopru) {
      for (let i = 0; i < 9; i++) {
        const x = F.kopru.x - F.kopru.r * 0.8 + i * (F.kopru.r * 1.6 / 8), z = F.kopru.z - F.kopru.r * 0.7 - 0.2;
        if (!api.isFloor(x, z + 1.2)) { /* kenarda: yürünen alanın dışında bile olsa dursun */ }
        const gp = new THREE.Group(); gp.position.set(x, 0, z);
        const pole = new THREE.Mesh(geo('pole', () => kp(new THREE.CylinderGeometry(0.05, 0.06, 2.8, 8))), kp(new THREE.MeshStandardMaterial({ color: 0xe9e1cf }))); pole.position.y = 1.4; gp.add(pole);
        const m = new THREE.MeshBasicMaterial({ color: 0x9aa2b0, side: THREE.DoubleSide }); api.dispose(m);
        const f = new THREE.Mesh(geo('flag', () => kp(new THREE.PlaneGeometry(1.0, 0.65))), m); f.position.set(0.55, 2.35, 0); gp.add(f); api.add(gp); flags.push({ m, c: CAM[i], x, z, on: false });
      }
    }
    // dostlar (Baba, Kartal, Hala) + anne ejderha (mor; tanımadan sonra) — Bilbo motorun yoldaşı
    let baba = null, kartal = null, hala = null, halaPos = { x: 0, z: 0 }, anne = null, annePos = { x: 0, z: 0 };
    const HA = g0 && g0.halaApi, hero = () => ({ pos: g0.P.pos, face: g0.P.face });
    try { if (typeof BABA !== 'undefined' && BABA.kur && HA) baba = BABA.kur({ scene, hero, free: HA.circleFree, move: HA.moveXZ, route: (x, z, tx, tz) => HA.routeTo(tx, tz, { x, z }), enemies: () => g0.enemies.filter(e => !e.dead), sersemlet: (e, sn) => { try { g0.stunEnemy(e, sn); } catch (er) { /* yok */ } }, sfx, say: (k, p) => HA.say(k, p) }); } catch (e) { baba = null; }
    try { if (typeof KARTAL !== 'undefined' && KARTAL.kur && HA) kartal = KARTAL.kur({ scene, hero, enemies: () => g0.enemies.filter(e => !e.dead), it: (e, dx, dz) => { try { g0.pushEnemy(e, e.x + dx * 4, e.z + dz * 4, 1); } catch (er) { /* yok */ } }, sfx }); } catch (e) { kartal = null; }
    try { if (typeof HALA !== 'undefined' && HALA.firinciModel) { hala = HALA.firinciModel(api); api.add(hala); } } catch (e) { hala = null; }
    try { if (typeof EJDERHA !== 'undefined' && EJDERHA.anne) { anne = EJDERHA.anne({ renk: 1, durum: 'tanima' }); anne.root.scale.setScalar(0.42); api.add(anne.root); } } catch (e) { anne = null; }
    const sleepers = [];
    if (F.arena && typeof EJDERHA !== 'undefined' && EJDERHA.uykulu) {
      [['su', -1], ['toprak', 1], ['ates', 0]].forEach(([tur, sd], i) => {
        try {
          const d = EJDERHA.uykulu(tur), r = F.arena.r + 15 + i * 2;
          const x = F.arena.x + (sd === 0 ? 0 : sd * (r + 3)), z = F.arena.z + (sd === 0 ? -r - 14 : -4 - i * 3);
          d.root.position.set(x, 0, z); d.root.scale.setScalar(2.6); d.root.rotation.y = sd === 0 ? 0 : (sd > 0 ? -PI / 2 : PI / 2); api.add(d.root); sleepers.push({ d, tur, x, z, up: 0, t0: -1 });
        } catch (e) { /* yok */ }
      });
    }
    api.dispose({ dispose() { try { if (baba) baba.dispose(); if (kartal) kartal.dispose(); if (anne) anne.dispose(); for (const s of sleepers) s.d.dispose(); } catch (e) { /* yok */ } for (const f of offs) { try { f(); } catch (e) { /* yok */ } } } });
    try {
      if (typeof COMPANION !== 'undefined' && COMPANION.register && !FENER._reg) {
        FENER._reg = true;
        if (typeof BABA !== 'undefined' && BABA.kayit && !(typeof KALE !== 'undefined' && KALE._reg)) COMPANION.register('baba', BABA.kayit);
        if (typeof KARTAL !== 'undefined' && KARTAL.kayit && !(typeof KALE !== 'undefined' && KALE._reg)) COMPANION.register('kartal', KARTAL.kayit);
        if (!(typeof KALE !== 'undefined' && KALE._reg)) COMPANION.register({ id: 'hala_kale', ad: 'Hala ışık ekmeği', bolumler: ['kale', 'fener'], bekleme: 60, ilkBekleme: 8, sure: 2.6, esik: 0.3, dusman: 99, tetik: 'can',
          etkin: () => true, eylem: c => { try { if (c.api.iyilestir) c.api.iyilestir(0.5); if (c.api.burst) c.api.burst('hearts', c.P.pos.x, 1.4, c.P.pos.z, { count: 6 }); } catch (e) { return false; } return true; } });
      }
    } catch (e) { /* yok */ }

    // MOTOR2 isteği (B910_MOTOR2.md): nesilli finalde 'neşe kristali' töreni, fener finali bitene dek beklesin
    L.finaleBekle = () => S.endStep > 0 && !S.finalDone;
    on('happy', e => { if (e && e.boss && e.type === 'unutulanKralTonton') { S.endT = T; S.endStep = 1; } });

    function sonSahne() {   // Kral neşelendikten sonra: fener yanar → dostlar → ejderha selamı (tek sinematik, atlanabilir)
      if (S.final || !g0 || !g0.sinematik) return; S.final = true;
      const tw = F.tower, ar = F.arena; if (!tw || !ar) return;
      const tx = ar.x, tz = ar.z - ar.r - 4.2, lamp = { x: tx, z: tz, y: tw.H + 1 };
      // dostlar fenerin yanına toplanır
      const spots = [[-3.4, 2.5], [-1.4, 3.8], [1.4, 3.8], [3.4, 2.5]];
      S.dostPos = { baba: [tx + spots[0][0], tz + spots[0][1] + 3], kartal: [tx + spots[1][0], tz + spots[1][1] + 3], hala: [tx + spots[2][0], tz + spots[2][1] + 3], anne: [tx + 6, tz + 5] };
      const sirala = (ix) => { const s = sleepers[ix]; if (s) { s.t0 = T; } };
      const tele = (x, z) => { try { g0.teleport(x, z); } catch (e) { /* yok */ } };
      const adim = [
        { sure: 6.0, bak: { x: tx, z: tz, y: 9 }, zoom: 1.0, pitch: 0.6, soz: 'b10_fener_yak', fn: () => { tele(tx, tz + 13); S.lamp = 0; S.lampT = T; } },
        { sure: 4.0, bak: { x: tx, z: tz, y: 9 }, zoom: 1.0, pitch: 0.6, soz: 'b10_fener_oldu', fn: () => { S.dostGo = true; } },
        { sure: 4.0, bak: { x: tx, z: tz + 4, y: 1.5 }, zoom: 1.2, soz: 'b10_dostlar_son', fn: () => { tele(tx, tz + 9); } },
        { sure: 4.6, bak: sleepers[0] ? { x: sleepers[0].x, z: sleepers[0].z, y: 3 } : { x: tx, z: tz, y: 3 }, zoom: 1.2, soz: 'b10_ejder_su', fn: () => { if (sleepers[0]) tele(sleepers[0].x + 9, sleepers[0].z + 4); sirala(0); } },
        { sure: 4.6, bak: sleepers[1] ? { x: sleepers[1].x, z: sleepers[1].z, y: 3 } : { x: tx, z: tz, y: 3 }, zoom: 1.2, soz: 'b10_ejder_toprak', fn: () => { if (sleepers[1]) tele(sleepers[1].x - 9, sleepers[1].z + 4); sirala(1); } },
        { sure: 4.6, bak: sleepers[2] ? { x: sleepers[2].x, z: sleepers[2].z, y: 3 } : { x: tx, z: tz, y: 3 }, zoom: 1.2, soz: 'b10_ejder_ates', fn: () => { if (sleepers[2]) tele(sleepers[2].x, sleepers[2].z + 11); sirala(2); } },
        { sure: 4.2, bak: { x: tx, z: tz + 5, y: 2 }, zoom: 1.0, soz: 'b10_bes_ejder', fn: () => { tele(tx, tz + 10); } },
      ];
      void lamp;
      const oyna = () => { if (!g0.sinematik.oyna({ adimlar: adim, atlanabilir: true, bitti: () => { S.finalDone = true; for (let i = 0; i < 9; i++) lit(i); S.lamp = 9; S.dostGo = true; say('b10_kral_son', { force: true, once: false }); } })) S.final = false; };
      say('b10_yuvalar', { force: true, once: false });
      if (!YUVA.ac(oyna)) oyna();
    }
    function lit(i) { const p = F.tower && F.tower.panes[i]; if (p) p.m.color.setHex(p.c); if (F.tower) { F.tower.lit = Math.max(F.tower.lit, i + 1); F.tower.halo.material.opacity = 0.16 + 0.12 * (F.tower.lit / 9); } }

    api.anim((dt) => {
      dt = Math.min(dt, 0.05); T += dt;
      for (let i = TQ.length - 1; i >= 0; i--) if (T >= TQ[i].t) { const f = TQ[i].fn; TQ.splice(i, 1); try { f(); } catch (e) { /* yok */ } }
      const P = g0 && g0.P; if (!P) return;
      if (baba && baba.update) baba.update(dt); if (kartal && kartal.update) kartal.update(dt);
      if (anne) { anne.update(dt); const tx = P.pos.x + 2.6, tz = P.pos.z - 2.4, dx = tx - annePos.x, dz = tz - annePos.z, d = hyp(dx, dz); if (!annePos.i) { annePos.x = P.pos.x - 3; annePos.z = P.pos.z - 3; annePos.i = 1; } let gx = tx, gz = tz; if (S.dostGo && S.dostPos) { gx = S.dostPos.anne[0]; gz = S.dostPos.anne[1]; } const ddx = gx - annePos.x, ddz = gz - annePos.z, dd = hyp(ddx, ddz); if (dd > 0.6) { annePos.x += ddx / dd * Math.min(dd, 3.2 * dt); annePos.z += ddz / dd * Math.min(dd, 3.2 * dt); anne.root.rotation.y = Math.atan2(ddx, ddz); } anne.root.position.set(annePos.x, 0.8 + Math.sin(T * 1.6) * 0.15, annePos.z); void d; void dx; void dz; }
      if (hala) {
        if (S.dostGo && S.dostPos) { halaPos.x += (S.dostPos.hala[0] - halaPos.x) * Math.min(1, dt * 1.2); halaPos.z += (S.dostPos.hala[1] - halaPos.z) * Math.min(1, dt * 1.2); }
        else { if (!halaPos.i) { halaPos.x = P.pos.x - 2; halaPos.z = P.pos.z + 2; halaPos.i = 1; } const tx = P.pos.x - Math.sin(P.face) * 2.2 + Math.cos(P.face) * 1.6, tz = P.pos.z - Math.cos(P.face) * 2.2 - Math.sin(P.face) * 1.6, dx = tx - halaPos.x, dz = tz - halaPos.z, d = hyp(dx, dz); if (d > 1.2) { const st = Math.min(d, 4.0 * dt), nx = halaPos.x + dx / d * st, nz = halaPos.z + dz / d * st; if (HA.isFloor(nx, nz)) { halaPos.x = nx; halaPos.z = nz; } hala.rotation.y = Math.atan2(dx, dz); } }
        hala.position.set(halaPos.x, 0, halaPos.z);
      }
      if (S.dostGo && S.dostPos && baba && baba.pos) { baba.pos.x += (S.dostPos.baba[0] - baba.pos.x) * Math.min(1, dt * 0.8); baba.pos.z += (S.dostPos.baba[1] - baba.pos.z) * Math.min(1, dt * 0.8); }
      // lamba içten yanar (tek efekt): cam yüzler sırayla
      if (S.lamp >= 0 && S.lamp < 9 && T - S.lampT > 0.55 * (S.lamp + 1)) { lit(S.lamp); S.lamp++; if (S.lamp === 9 && F.tower) F.tower.socket.material.color.setHex(0xffd45a); }
      // uyuyan ejderha selamı: başını kaldırır, bir kez eğilir, tekrar uyur
      for (const s of sleepers) {
        s.d.update(dt);
        if (s.t0 >= 0) { const u = (T - s.t0) / 4.2; const k = u < 0 ? 0 : u > 1 ? 0 : Math.sin(u * PI); s.d.root.position.y = 0.0 + k * 0.5; s.d.root.rotation.x = -k * 0.18; if (u > 1) { s.t0 = -1; s.d.root.rotation.x = 0; s.d.root.position.y = 0; } }
      }
      // köprü bayrakları: Feza yürüdükçe renkleri sırayla yanar
      flags.forEach((f, i) => { if (!f.on && live() && P.pos.x > f.x - 0.8 && hyp(P.pos.z - (F.kopru ? F.kopru.z : 0), 0) < (F.kopru ? F.kopru.r + 2 : 99) && P.area >= 3 && Math.abs(P.pos.x - f.x) < 1.6) { f.on = true; f.m.color.setHex(f.c); S.flags++; sfx('star', { vol: 0.35, pitch: 1 + i * 0.06 }); if (S.flags === 9) say('b10_kopru', { force: true }); } });
      // boss sonrası: sis çekilir cümlesi, sonra final sinematiği
      if (S.endStep) { const el = T - S.endT; if (el > 2 && S.endStep === 1) { S.endStep = 2; say('b10_sis', { force: true, once: false }); } if (el > 3.2 && S.endStep === 2) { S.endStep = 3; sonSahne(); } }
      if (!live()) return;
      const ar = P.area, N = A.length - 1;
      if (T > 1 && !S.started) { S.started = 1; say('b10_giris_a', { force: true }); }
      if (T > 8 && S.started === 1) { S.started = 2; say('b10_giris_p'); }
      if (T > 15 && S.started === 2) { S.started = 3; say('b10_dostlar'); }
      if (T > 22 && S.started === 3) { S.started = 4; say('b10_baba'); }
      if (ar !== S.area) {
        S.area = ar;
        if (ar === 1) { say('b10_yagmur', { force: true }); later(8, () => say('b10_oyuncak', { force: true })); }
        if (ar === 2) { say('b10_kopru', { force: true }); }
        if (ar === 3) { say('b10_fener_a', { force: true }); later(8, () => say('b10_resim_p', { force: true })); }
        if (ar === N) { say('b10_kral_giris', { force: true, once: false }); later(6, () => say('b10_kral_sis', { force: true })); later(13, () => say('b10_pirilsoyle', { force: true })); later(20, () => say('b10_ipucu_gul', { force: true })); }
      }
    });
  }

  BOLUM.define('fener', {
    ad: 'Büyük Fener',
    taban: 'moon', size: 100, side: 2, yoldas: ['bilbo'],
    areas: [{ id: 'a1', ad: 'Bulut Basamakları', rooms: 1 }, { id: 'a2', ad: 'Yağmur Adası', rooms: 1 }, { id: 'a3', ad: 'Gökkuşağı Köprüsü', rooms: 1 }, { id: 'a4', ad: 'Yıldız Adası', rooms: 1 }],
    muzik: 'fener', malzeme: 'isik10', kayipEsya: null, final: true,
    isik: { fog: [0x101c46, 70, 170], hemiSky: 0x6ca0dc, hemiGround: 0x1e3048, hemi: 0.9, sunColor: 0xb8d4ff, sun: 1.15, sunOffset: [-14, 22, 10],   // E8910: GECE (ay ışığı, lacivert sis); ışıklar fener/lambalar
      env: [0x2a4a80, 0x5a7aa8, 0x142440, 0.5], bloom: 0.42, exposure: 1.18, sat: 1.1, vig: 0.28, fezaLight: 1.7, fezaLightColor: 0xfff0d8 },
    zemin: { tA: 0x56607a, tB: 0x7a86a2, tC: 0xa0aac4, out: 0x1a2438, outAmt: 0.9, macro: 0xb0c4ff },
    minimap: { zemin: '#f4d8e0' },
    harita: { ad: 'Büyük Fener', detay: 'Unutulmuş oyuncaklar, Kral Tonton ve Büyük Fener', renk: '#ffe27a', simge: '💡' },
    yolculuk: { arac: 'isik', cumle: 'Fener bizi çağırıyor!' },
    parcaIpucu: '',
    huysuzlar: { tahtaAt: 3 }, elitler: ['tahtaAt'], boss: 'unutulanKralTonton',
    yerlesim, kur, kurSon,
  });
  return { say };
})();
