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
  const said = new Set(); let sayAt = -99, sus = false;   // sus: Kral neşelendi → bölüm sohbeti susar (QA: sohbet cümleleri final sinematiğinin araya giriyor, ejderha sözleri bir sonraki plana kayıyordu)
  function say(key, o = {}) {
    const g = G_();
    if (sus && !o.son) return false;
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
    // uyuyan Işık Ejderhaları (final selamı): denizde, yüzleri adaya dönük; yaw = hem dönüş hem final kamerasının baktığı yön.
    // Dekor (07m_dekor_fener) bu noktaların ve kameraya giden yolun çevresine kaya/çam koymaz (QA: kaya ejderhayı örtüyordu)
    if (F.arena) F.uyku = [['su', -1], ['toprak', 1], ['ates', 0]].map(([tur, sd], i) => {
      const r = F.arena.r + 15 + i * 2;
      return { tur, x: F.arena.x + (sd === 0 ? 0 : sd * (r + 3)), z: F.arena.z + (sd === 0 ? -r - 14 : -4 - i * 3), yaw: sd === 0 ? 0 : (sd > 0 ? -PI / 2 : PI / 2) };
    });
  }

  // (ebeveyn: fener yuva mini oyunu kaldırıldı — bitiş sahnesi doğrudan gelir)

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
    try { if (typeof SUS610 !== 'undefined') SUS610.ekle(L, api, 'fener'); } catch (e) { console.warn('SUS610', e); }
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
      // QA (güzelleştirme; çizim sayısı artmaz: hepsi toplu dekor + zemine pişmiş ışık): masaya örtü, yanında yastık yığını;
      // meydanın kenarında sıcak sokak fenerleri (yürünen alanın hemen dışında; kuzeyde Büyük Fener ve giriş yolları boş). Örtü masadan ≥5 cm yukarıda (iPad derinlik kavgası olmasın)
      api.box(tx, 0.645, tz, 1.5, 0.04, 1.26, 0xfff2c4); for (const sz of [-1, 1]) api.box(tx, 0.53, tz + sz * 0.64, 1.5, 0.2, 0.02, 0xf08a5e);   // sıcak krem örtü + mercan saçak (ay ışığında morumsu görünmesin: mor yalnız Pırıl'da)
      if (typeof YAPI !== 'undefined' && YAPI.fener) {
        const fl = YAPI.fener();
        const twz = ar.z - ar.r - 4.2; let n = 0;
        for (let k = 0; k < 10 && n < 7; k++) {
          const a = (k + 0.5) * TAU / 10, sa = Math.sin(a), ca = Math.cos(a); let rad = ar.r * 0.6; while (rad < ar.r + 4 && api.isFloor(ar.x + sa * rad, ar.z + ca * rad)) rad += 0.4; rad += 0.9;
          const x = ar.x + sa * rad, z = ar.z + ca * rad; if (hyp(x - ar.x, z - twz) < 6 || api.linkDist(x, z) < 3.4 || api.isFloor(x, z)) continue;
          api.put(fl.m, x, 0, z, 1.05, 1.05, 1.05, 0xffffff, a, 0, 0, 'shinyNS'); api.put(fl.g, x, 0, z, 1.05, 1.05, 1.05, 0xffffff, a, 0, 0, 'glow'); api.glow(x, z, 5.0, 0xffcf80, 0.3); n++;
        }
      }
      api.glow(tx, tz, 2.4, 0xffd890, 0.16);
      { const yx = tx - 1.9, yz = tz + 0.5; P(sph, yx, 0.17, yz, 0.55, 0.19, 0.46, 0xff9070); P(sph, yx + 0.1, 0.43, yz - 0.05, 0.42, 0.16, 0.36, 0x7fe0a8); P(sph, yx - 0.04, 0.64, yz + 0.02, 0.31, 0.13, 0.27, 0xffd65a); }
      if (!yeni) { rainbow(api, ar.x - ar.r - 9, ar.z + 2, 1.6, PI / 2); rainbow(api, ar.x + ar.r + 9, ar.z + 2, 1.6, -PI / 2); }
    }
    if (F.kopru && !yeni) { for (const sd of [-1, 1]) rainbow(api, F.kopru.x + sd * (F.kopru.r + 6), F.kopru.z, 1.0, sd * PI / 2); }
  }

  // ════════════════ kurSon: dostlar, bayraklar, konuşmalar, final ════════════════
  function kurSon(L, api) {
    const g0 = G_(), A = L.areas || [], F = L.fn || {};
    const offs = []; const on = (n, fn) => { if (g0 && g0.on) { try { const r = g0.on(n, e => { if (g0.L === L || n === 'zone') fn(e); }); if (typeof r === 'function') offs.push(r); } catch (e) { /* yok */ } } };
    for (let k = 1; k < A.length; k++) A[k].gate = null;   // motorun şeker kapıları kapalı: bölüm açık yürünür
    sus = false; let T = 0; const TQ = []; const later = (sn, fn) => { TQ.push({ t: T + sn, fn }); };
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
        // QA (güzelleştirme): düz dikdörtgen yerine şenlik flaması (üçgen), direğe bağlı; yanınca hafifçe dalgalanır
        const f = new THREE.Mesh(geo('flag3', () => { const q = new THREE.BufferGeometry(); q.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.4, 0, 0, -0.4, 0, 1.15, -0.04, 0], 3)); q.computeVertexNormals(); return kp(q); }), m); f.position.set(0.04, 2.35, 0); gp.add(f);
        api.add(gp); flags.push({ m, c: CAM[i], x, z, on: false, f, ph: i * 0.7 });
      }
    }
    // dostlar (Baba, Kartal, Hala) + anne ejderha (mor; tanımadan sonra) — Bilbo motorun yoldaşı
    let baba = null, kartal = null, hala = null, halaPos = { x: 0, z: 0 }, anne = null, annePos = { x: 0, z: 0 };
    const HA = g0 && g0.halaApi, hero = () => ({ pos: g0.P.pos, face: g0.P.face });
    try { if (typeof BABA !== 'undefined' && BABA.kur && HA) baba = BABA.kur({ scene, hero, free: HA.circleFree, move: HA.moveXZ, route: (x, z, tx, tz) => HA.routeTo(tx, tz, { x, z }), enemies: () => g0.enemies.filter(e => !e.dead), sersemlet: (e, sn) => { try { g0.stunEnemy(e, sn); } catch (er) { /* yok */ } }, sfx, say: (k, p) => HA.say(k, p) }); } catch (e) { baba = null; }
    // QA (iPad turu): Kartal Feza'nın 4.6 m üstünde daire çiziyordu → ekranda tam Kral'ın ve oyuncakların önüne düşüyordu (dokunulacak oyuncak görünmüyordu).
    // Kral savaşı sürerken Kartal arenanın doğu kenarında süzülür; savaş bitince yine Feza'nın üstüne döner. (kare başı nesne üretmez)
    const KH = { pos: { x: 0, z: 0 }, face: 0 }, KP = { x: 0, z: 0 };
    const kHero = () => { const ar = F.arena, b = g0.boss, P = g0.P; if (ar && b && !b.dead && !S.endStep && hyp(P.pos.x - ar.x, P.pos.z - ar.z) < ar.r + 3) { KP.x = ar.x + ar.r + 1; KP.z = ar.z + 2; KH.pos = KP; } else KH.pos = P.pos; KH.face = P.face; return KH; };
    try { if (typeof KARTAL !== 'undefined' && KARTAL.kur && HA) kartal = KARTAL.kur({ scene, hero: kHero, enemies: () => g0.enemies.filter(e => !e.dead), it: (e, dx, dz) => { try { g0.pushEnemy(e, e.x + dx * 4, e.z + dz * 4, 1); } catch (er) { /* yok */ } }, sfx }); } catch (e) { kartal = null; }
    try { if (typeof HALA !== 'undefined' && HALA.firinciModel) { hala = HALA.firinciModel(api); api.add(hala); } } catch (e) { hala = null; }
    try { if (typeof EJDERHA !== 'undefined' && EJDERHA.anne) { anne = EJDERHA.anne({ renk: 1, durum: 'tanima' }); anne.root.scale.setScalar(0.42); api.add(anne.root); } } catch (e) { anne = null; }
    const sleepers = [];
    if (F.uyku && typeof EJDERHA !== 'undefined' && EJDERHA.uykulu) {
      F.uyku.forEach(({ tur, x, z, yaw }) => {
        try {
          const d = EJDERHA.uykulu(tur);
          d.root.position.set(x, 0, z); d.root.scale.setScalar(2.6); d.root.rotation.y = yaw; api.add(d.root); sleepers.push({ d, tur, x, z, yaw, up: 0, t0: -1 });
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
    on('happy', e => { if (e && e.boss && e.type === 'unutulanKralTonton') { S.endT = T; S.endStep = 1; sus = true; TQ.length = 0; } });

    const sonBitti = () => { if (S.finalDone) return; S.finalDone = true; S.oynaBekle = 0; for (let i = 0; i < 9; i++) lit(i); S.lamp = 9; S.dostGo = true; if (F.tower) F.tower.socket.material.color.setHex(0xffd45a); };   // KİLİT YOK: final ne olursa olsun biter
    function sonSahne() {   // Kral neşelendikten sonra: fener yanar → dostlar → ejderha selamı (tek sinematik, atlanabilir)
      if (S.final) return; S.final = true;
      if (!g0 || !g0.sinematik) { sonBitti(); return; }
      const tw = F.tower, ar = F.arena; if (!tw || !ar) { sonBitti(); return; }
      const tx = ar.x, tz = ar.z - ar.r - 4.2, lamp = { x: tx, z: tz, y: tw.H + 0.6 };
      // dostlar fenerin yanına toplanır
      const spots = [[-3.4, 2.5], [-1.4, 3.8], [1.4, 3.8], [3.4, 2.5]];
      S.dostPos = { baba: [tx + spots[0][0], tz + spots[0][1] + 3], kartal: [tx + spots[1][0], tz + spots[1][1] + 3], hala: [tx + spots[2][0], tz + spots[2][1] + 3], anne: [tx + 6, tz + 5] };
      const tele = (x, z) => { try { g0.teleport(x, z); } catch (e) { /* yok */ } };
      // QA: Feza artık denize ışınlanmaz (kamera ejderhalara kendisi gider; Feza dostlarla arenada kalır). Kamera her ejderhaya yüzünden bakar.
      const ejd = (tur, soz) => { const s = sleepers.find(q => q.tur === tur); if (!s) return null; return { sure: 4.6, bak: { x: s.x, z: s.z, y: 2.6 }, zoom: 1.15, pitch: 0.62, yaw: s.yaw || 0, gecis: 0.25, soz, fn: () => { kamK(40); s.t0 = T; } }; };
      // QA: ejderhalar arası kamera kayarken fener kulesinin içinden geçiyordu (ekranı dev sarı ışık kaplıyordu) → ejderha planları kısa kesme ile geçer
      const kamK = k => { try { if (g0.kameraIstek) g0.kameraIstek.k = k; } catch (e) { /* yok */ } };
      // QA: plan süresi cümleden kısaydı → sözler her planda biraz daha geride kalıyordu (Ateş Dede'nin sözü Toprak ejderhasının planında). Süre ≥ cümle + ara
      const sur = (a) => { if (!a) return a; try { const d = typeof AUD !== 'undefined' && AUD.estimate && a.soz ? AUD.estimate(a.soz) : 0; if (d > 0) a.sure = Math.max(a.sure, d + 1.0); } catch (e) { /* yok */ } return a; };
      const adim = [
        // lamba: kamera lambanın hizasında, biraz uzaktan (önceden kule gövdesine bakıyordu, lamba ekran dışındaydı)
        { sure: 6.0, bak: lamp, zoom: 1.6, pitch: 0.3, soz: 'b10_fener_yak', fn: () => { tele(tx, tz + 13); S.lamp = 0; S.lampT = T; } },
        { sure: 4.0, bak: lamp, zoom: 1.75, pitch: 0.34, soz: 'b10_fener_oldu', fn: () => { S.dostGo = true; } },
        { sure: 4.0, bak: { x: tx, z: tz + 6, y: 1.5 }, zoom: 1.15, soz: 'b10_dostlar_son', fn: () => { tele(tx, tz + 9); } },
        ejd('su', 'b10_ejder_su'), ejd('ates', 'b10_ejder_ates'), ejd('toprak', 'b10_ejder_toprak'),   // sıra: Su (batı) → Ateş (kuzey) → Toprak (doğu); aralarda kısa kesme
        { sure: 4.6, bak: { x: tx, z: tz + 6, y: 3.5 }, zoom: 2.0, pitch: 0.48, gecis: 0.25, soz: 'b10_bes_ejder', fn: () => { kamK(40); } },   // geniş plan: yanan fener + dibinde toplanan dostlar
      ].filter(Boolean).map(sur);
      // başka bir sinematik sürüyorsa kısa aralarla yeniden dene (anim döngüsü: S.oynaBekle); olmazsa final yine de biter
      const oyna = () => { if (S.finalDone) return; if (g0.sinematik.oyna({ adimlar: adim, atlanabilir: true, bitti: () => { kamK(3); sonBitti(); } })) { S.oynaBekle = 0; return; } S.oynaBekle = S.oynaBekle || T; S.oynaTekrar = T + 0.5; };   // (b10_kral_son yok: motorun final cümlesi onu hemen kesiyordu)
      S.oyna = oyna;
      oyna();   // (ebeveyn: parça yerleştirme mini oyunu yok; bitiş sahnesi doğrudan gelir. 'b10_yuvalar' artık söylenmez: yuva oyunu yok, cümleler üst üste biniyordu)
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
        else { if (!halaPos.i) { halaPos.x = P.pos.x - 2; halaPos.z = P.pos.z + 2; halaPos.i = 1; } const tx = P.pos.x - Math.sin(P.face) * 2.2 + Math.cos(P.face) * 1.6, tz = P.pos.z - Math.cos(P.face) * 2.2 - Math.sin(P.face) * 1.6, dx = tx - halaPos.x, dz = tz - halaPos.z, d = hyp(dx, dz); if (d > 1.2) { const st = Math.min(d, 4.0 * dt), nx = halaPos.x + dx / d * st, nz = halaPos.z + dz / d * st; if (!HA || !HA.isFloor || HA.isFloor(nx, nz)) { halaPos.x = nx; halaPos.z = nz; } hala.rotation.y = Math.atan2(dx, dz); } }
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
      for (const fl of flags) fl.f.rotation.y = fl.on ? Math.sin(T * 2.2 + fl.ph) * 0.32 : 0;   // yanan flama rüzgârda hafifçe dalgalanır
      // köprü bayrakları: Feza yürüdükçe renkleri sırayla yanar
      // QA: eskiden yalnız soldan sağa yürüyünce ve yanlış alan numarasında (P.area>=3; köprü 2. alan) yanıyordu → hiç yanmıyordu. Şimdi köprü adasındayken her 0.35 sn'de bir sonraki bayrak yanar.
      if (F.kopru && S.flags < flags.length && live() && hyp(P.pos.x - F.kopru.x, P.pos.z - F.kopru.z) < F.kopru.r + 1.5 && T - (S.flagT || 0) > 0.35) {
        const i = S.flags, f = flags[i]; S.flagT = T; f.on = true; f.m.color.setHex(f.c); S.flags++; sfx('star', { vol: 0.35, pitch: 1 + i * 0.06 });
      }
      // boss sonrası: sis çekilir cümlesi, sonra final sinematiği
      if (S.endStep) { const el = T - S.endT; if (el > 2 && S.endStep === 1) S.endStep = 2;   // (b10_sis söylenmez: 'b10_boss_bitti' zaten 'sis çekiliyor' diyor; kuyruğu doldurup fener cümlesini düşürüyordu)
        if (S.endStep === 2 && el > 6.4 && (el > 9 || typeof AUD === 'undefined' || !AUD.current)) { S.endStep = 3; sonSahne(); }   // Kral'ın neşe cümlesi bitsin, sonra fener (motor boss sonrası 6 sn yalnız önemli cümleleri söyler: 'b10_fener_yak' düşüyordu)
        if (S.oynaBekle && !S.finalDone) { if (T - S.oynaBekle > 12) sonBitti(); else if (T >= S.oynaTekrar && S.oyna) S.oyna(); }   // sinematik açılamadı: yeniden dene, 12 sn sonra vazgeç
        if (S.endStep === 3 && !S.finalDone && el > 90) sonBitti(); }   // emniyet: mini oyun sırasında T durur; sinematik ~32 sn — 90 sn'de final kendiliğinden biter
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
