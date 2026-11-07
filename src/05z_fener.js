/* ── 10. bölüm: Büyük Fener — unutulmuş oyuncaklar + boss Unutulan Kral Tonton (Feza ve Pırıl: Büyük Fener) ──
   Sahibi: B910. Cümleler 02l_fener.js (b10_...). Genel ad: HZ_FENER. Yer işareti yardımcısı HZ_KALE.mark (05z_kale.js).
   KAVGA YOK: Kral'ın canı yok, "anı çubuğu" var (3 çerçeve). Oyuncaklar üzgün ve yavaş; Feza dokunur → güler → Kral'ın masasına oturur.
     tahtaAt  Tahta At (sarı daire zıplaması)       kirikTren Kırık Tren (mavi şerit)      ucurtma Uçurtma (yeşil halka)
     balerin  Müzik Kutusu Balerin (pembe halka)    devPelusAyi Dev Peluş Ayı (turuncu halka)       damlacik Yağmur Damlacığı (alan)
   Aşama 1: At + Tren · Aşama 2: Uçurtma + Balerin · Aşama 3: Dev Peluş Ayı. Her 3 oyuncakta bir anı:
     1. fener ilk kez yanıyor · 2. çocuklar oyuncaklarını getiriyor + KIVILCIMIN SAHİBİ (Pırıl'ın kıvılcımının KOPYASI Kral'ın fenerine konur, "tık" yanar;
        Pırıl'ınki yerinde kalır) · 3. AD: "Tonton! Seni hatırlıyoruz." → sis tek perde gibi çekilir.
   Bir an bir tehlike işareti; üst üste saldırı yok. Kral ve oyuncaklar kızgın değil. Mor yok (yalnız Pırıl). */
const HZ_FENER = (() => {
  'use strict';
  const HAS = typeof HUYSUZ !== 'undefined' && HUYSUZ && HUYSUZ.type;
  if (!HAS) return {};
  const EM = typeof EMODEL !== 'undefined' && EMODEL ? EMODEL : null;
  const PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const K = () => (typeof HZ_KALE !== 'undefined' ? HZ_KALE : null);
  const mark = (...a) => { const k = K(); return k && k.mark ? k.mark(...a) : null; };
  const markOff = m => { const k = K(); if (k && k.markOff) k.markOff(m); };
  const viaBase = (base, post) => o => { const m = EM && EM.build ? EM.build.call(EM, base, o || {}) : null; if (m && m.root && post) post(m.root, m); return m; };
  const hueFix = (root, h, s, l) => { const k = K(); if (k && k.tint) k.tint(root, h, s, l); };

  // ── oyuncaklar (üzgün, yavaş, yumuşak)
  const T = { ad: 0, hp: 14, dmg: 1 };
  HUYSUZ.type('tahtaAt', { ad: 'Tahta At', base: 'ayponpon', saldiri: 'ziplayan', stats: { hp: 14, dmg: 2, speed: 1.4, atkCd: 3.0, windup: 1.2 }, model: viaBase('ayponpon', r => hueFix(r, 0.08, 0.5, 1)), ilkSoz: 'b10_oyuncak_at' });
  HUYSUZ.type('kirikTren', { ad: 'Kırık Tren', base: 'kaplumbaga', saldiri: 'yuvarlanan', stats: { hp: 16, dmg: 2, speed: 1.4, atkCd: 3.2, windup: 1.2 }, model: viaBase('kaplumbaga', r => hueFix(r, 0.6, 0.5, 1)) });
  HUYSUZ.type('balerin', { ad: 'Müzik Kutusu Balerin', base: 'kratercik', saldiri: 'yakin', stats: { hp: 14, dmg: 2, speed: 1.3, atkCd: 3.0, windup: 1.2 } });
  HUYSUZ.type('ucurtma', { ad: 'Uçurtma', base: 'yildizcik', saldiri: 'kayan', stats: { hp: 12, dmg: 2, speed: 1.8, atkCd: 3.4, windup: 1.2, fly: true, hover: 1.2 } });
  HUYSUZ.type('devPelusAyi', { ad: 'Dev Peluş Ayı', base: 'ayponpon', saldiri: 'yakin', boyut: 2.0, stats: { hp: 24, dmg: 3, speed: 1.0, atkCd: 3.4, windup: 1.4 }, model: viaBase('ayponpon', r => hueFix(r, 0.07, 0.5, 0.95)) });
  HUYSUZ.type('damlacik', { ad: 'Yağmur Damlacığı', base: 'jole', saldiri: 'ziplayan', variant: 'blue', stats: { hp: 14, dmg: 2, speed: 1.6, atkCd: 3.0, windup: 1.1 } });
  void T;

  // ── Kral Tonton: yaşlı, gümüş sakallı, üzgün gözler; elinde sönük fener, yarım taç ──
  let FENER = null;   // elindeki fener malzemesi (tık yanar)
  let KRAL = null;    // son kurulan Kral modeli
  function kralPost(root, m) {
    hueFix(root, 0.6, 0.36, 1.0);
    const g = new THREE.Group(); g.name = 'tonton'; root.add(g);
    // QA2: sevimli, oyuncak gibi yaşlı kral — yumuşak beyaz sakal (yuvarlak tüyler), yuvarlak altın gözlük, üzgün ama tatlı kaşlar, pembe yanaklar, başında küçük yamru taç
    const beardM = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.95 }), crownM = new THREE.MeshStandardMaterial({ color: 0xe6c050, roughness: 0.35, metalness: 0.3, emissive: 0x6a4a10, emissiveIntensity: 0.6 });
    const cheekM = new THREE.MeshBasicMaterial({ color: 0xf6a3a3, transparent: true, opacity: 0.7 }), rimM = new THREE.MeshStandardMaterial({ color: 0xc9a23c, roughness: 0.4, metalness: 0.5 });
    const puff = (x, y, z, r, sx, sy, sz) => { const q = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), beardM); q.scale.set(sx, sy, sz); q.position.set(x, y, z); g.add(q); return q; };
    puff(0, 1.42, 0.2, 0.3, 1.25, 0.95, 0.8); puff(-0.2, 1.52, 0.22, 0.17, 1, 1, 0.8); puff(0.2, 1.52, 0.22, 0.17, 1, 1, 0.8); puff(0, 1.26, 0.22, 0.2, 1.1, 0.9, 0.8);   // sakal: dört yumuşak top
    puff(-0.1, 1.6, 0.34, 0.09, 1.5, 0.7, 0.8); puff(0.1, 1.6, 0.34, 0.09, 1.5, 0.7, 0.8);   // bıyık
    for (const sx of [-1, 1]) {
      const ch = new THREE.Mesh(new THREE.CircleGeometry(0.1, 14), cheekM); ch.position.set(sx * 0.27, 1.62, 0.3); ch.lookAt(sx * 0.6, 1.6, 1.2); g.add(ch);   // pembe yanak
      const gl = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.016, 6, 18), rimM); gl.position.set(sx * 0.16, 1.78, 0.34); g.add(gl);   // yuvarlak gözlük
      const br = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), beardM); br.scale.set(1.1, 0.28, 0.6); br.position.set(sx * 0.17, 1.96, 0.33); br.rotation.z = sx * 0.28; g.add(br);   // dışa düşük (üzgün ama tatlı) kaşlar
    }
    const bridge = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 5, 8, PI), rimM); bridge.position.set(0, 1.8, 0.35); g.add(bridge);
    // küçük taç: başın üstünde, bir köşesi kopuk (3 sivri uç)
    const crown = new THREE.Group(); crown.position.set(0.03, 2.1, 0.02); crown.rotation.z = -0.18; crown.scale.setScalar(1.3);   // BOSSC: mavi şapkanın üstünde net görünsün g.add(crown);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.12, 14, 1, true), crownM); crownM.side = THREE.DoubleSide; crown.add(band);
    for (let i = 0; i < 5; i++) { if (i === 3) continue; const a = -0.9 + i * 0.45 + 1.1, sp = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 6), crownM); sp.position.set(Math.sin(a) * 0.27, 0.14, Math.cos(a) * 0.27); crown.add(sp); }
    const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff9ab0 })); jewel.position.set(0, 0.0, 0.3); crown.add(jewel);
    // sönük fener
    FENER = new THREE.MeshBasicMaterial({ color: 0x8c93a0 });
    const lamp = new THREE.Group(); lamp.position.set(0.75, 0.85, 0.65); lamp.scale.setScalar(1.35);
    const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.36, 10), FENER); const top = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.16, 10), crownM); top.position.y = 0.26;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 12), crownM); ring.position.y = 0.42; lamp.add(lb, top, ring); g.add(lamp);
    m.kralLamp = lamp; m.baseType = 'tellal'; m.type = 'unutulanKralTonton'; KRAL = m;
  }
  HUYSUZ.boss('unutulanKralTonton', { ad: 'Kral Tonton', base: 'tellal', boyut: 1.25, stats: { r: 1.2, height: 3.2, hp: 400, dmg: 3 },
    lines: { giris: 'b10_boss_giris', bitti: 'b10_boss_bitti', yarim: 'b10_boss_yarim' },
    bossKit: { own: true, col: '#cfd8ee', roar: 0, add: null, at: [], n: [], summonAt: 9, bonus: null }, model: viaBase('tellal', kralPost) });
  HUYSUZ.zone('fener', { enemies: { tahtaAt: 3, kirikTren: 2, balerin: 2, damlacik: 2, ucurtma: 1.5 }, elites: ['tahtaAt'], boss: 'unutulanKralTonton' });

  // ════════════════ Boss sahne durumu ════════════════
  const W = { strips: [], rings: [], toys: [], cheered: 0, frame: 0, busy: false, fin: false, spark: null, fenerT: 0, say: new Set(), sparkGM: null };
  const say = (k, prio = 3) => { const A = typeof BOSSDAV !== 'undefined' ? BOSSDAV.api : null; if (A && A.hasLine(k)) A.say(k, prio); };
  const dmgOf = (b, k) => b.dmg * k * (BOSSDAV.api.hard ? 1.25 : 1);
  const heroUp = () => { try { return (GAME.jump && GAME.jump.y) || 0; } catch (e) { return 0; } };
  const faceTo = (b, x, z, k, dt) => { b.face = dampAngle(b.face, Math.atan2(x - b.x, z - b.z), k, dt); };
  function clearAll() { for (const s of W.strips) markOff(s.mk); for (const r of W.rings) markOff(r.mk); W.strips.length = 0; W.rings.length = 0; W.toys.length = 0; W.cheered = 0; W.given = 0; W.frame = 0; W.tekrar = 0; W.busy = false; W.fin = false; W.spark = null; W.say.clear(); }
  const warn = (S, key) => { const A = BOSSDAV.api; if (!key || !A || !A.hasLine(key)) return; const sd = S.said || (S.said = {}); if (sd[key]) return; sd[key] = true; try { A.say(key, 3, { interrupt: true }); } catch (e) { /* yok */ } };

  // kıvılcım kopyası: Pırıl'dan Kral'ın fenerine uçar, fener "tık" yanar (Pırıl'ınki yerinde kalır)
  function kivilcimUc(b, P) {
    if (typeof scene === 'undefined') return;
    if (!W.sparkGM) W.sparkGM = { g: new THREE.SphereGeometry(0.16, 10, 8), m: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd45a).multiplyScalar(1.4) }) };
    const mesh = new THREE.Mesh(W.sparkGM.g, W.sparkGM.m); scene.add(mesh);
    W.spark = { m: mesh, t: 0, x0: P.pos.x + 0.6, z0: P.pos.z, y0: 1.5, done: false };
  }
  function lampPos(b) { const l = KRAL && KRAL.kralLamp; if (l) { const v = new THREE.Vector3(); l.getWorldPosition(v); if (Number.isFinite(v.y)) return v; } return new THREE.Vector3(b.x + 0.9, 1.4, b.z + 0.8); }

  // ── anı sahneleri (atlanabilir sinematik) ──
  function ani(b, n) {
    const G = GAME, A = BOSSDAV.api; if (W.busy) return false;
    // KİLİT YOK: sinematik yoksa anı sahnesiz geçilir (3. anıda Kral yine neşelenir)
    if (!G || !G.sinematik) { if (n >= 2 && FENER) FENER.color.setHex(0xffd45a); if (n === 3) fin(b); return false; }
    W.busy = true;
    const P = A.P, bak = { x: b.x, z: b.z, y: 2.0 };
    const bitir = () => { W.busy = false; if (n === 3) fin(b); };
    const adim = n === 1 ? [
      { sure: 4.2, bak, zoom: 1.3, soz: 'b10_ani1', fn: () => { A.burst('sparkle', b.x + 0.8, 1.6, b.z + 0.7, { color: '#ffd96a', count: 8 }); } },
      { sure: 3.0, bak, zoom: 1.2, soz: 'b10_kral_oyuncak' },
    ] : n === 2 ? [
      { sure: 4.0, bak, zoom: 1.3, soz: 'b10_ani2' },
      { sure: 4.6, bak, zoom: 1.3, soz: 'b10_ani2_kivilcim' },
      { sure: 3.6, bak: { x: P.pos.x, z: P.pos.z, y: 1.4 }, zoom: 1.4, soz: 'b10_pirilkivilcim', fn: () => { kivilcimUc(b, P); } },   // tek net efekt: kıvılcım kopyası → fener
      { sure: 3.8, bak, zoom: 1.3, soz: 'b10_kivilcim_kopya' },
    ] : [
      { sure: 3.6, bak, zoom: 1.3, soz: 'b10_ad_a' },   // (b10_ad_p adımı silindi: cümlesi/sesi yok, 3.6 sn sessiz bekleme oluyordu)
      { sure: 3.4, bak, zoom: 1.3, soz: 'b10_ad_f', fn: () => { A.burst('hearts', b.x, 2.4, b.z, { count: 8 }); } },
    ];
    const ok = G.sinematik.oyna({ adimlar: adim, atlanabilir: true, bitti: () => { if (n === 2 && FENER) FENER.color.setHex(0xffd45a); bitir(); } });
    if (!ok) {   // başka bir sinematik sürüyordu: W.busy takılı kalmasın (Kral sonsuza dek 'sessiz' beklerdi); sonraki seçimde yeniden dene, 3 denemeden sonra sahnesiz geç
      W.busy = false; W.tekrar = (W.tekrar || 0) + 1;
      if (W.tekrar <= 3) W.frame = n - 1; else { W.tekrar = 0; if (n >= 2 && FENER) FENER.color.setHex(0xffd45a); if (n === 3) fin(b); }
    } else W.tekrar = 0;
    return ok;
  }
  function fin(b) {
    if (W.fin) return; W.fin = true;
    if (FENER) FENER.color.setHex(0xffd45a);
    const G = GAME; b.hp = 1; try { G.damage(b, 999, { kind: 'team', force: true }); } catch (e) { /* yok */ }
  }

  const toyBusy = e => !!(e.tele || e.state === 'windup' || e.state === 'roll' || e.state === 'hop' || e.state === 'strike' || e.state === 'rise');   // oyuncağın kendi işareti/saldırısı sürüyor
  function stepObjects(dt) {
    const A = BOSSDAV.api, P = A && A.P, b = typeof GAME !== 'undefined' ? GAME.boss : null;
    const k = K(); if (k && k.markTick) k.markTick(dt);
    if (!P || !b || b.dead) return;
    // kıvılcım kopyası uçuşu
    const sp = W.spark;
    if (sp && !sp.done) {
      sp.t += dt; const u = clamp(sp.t / 2.0, 0, 1), L0 = lampPos(b);
      sp.m.position.set(sp.x0 + (L0.x - sp.x0) * u, sp.y0 + (L0.y - sp.y0) * u + Math.sin(u * PI) * 0.8, sp.z0 + (L0.z - sp.z0) * u);
      if (u >= 1) { sp.done = true; if (sp.m.parent) sp.m.parent.remove(sp.m); if (FENER) FENER.color.setHex(0xffd45a); A.burst('sparkle', L0.x, L0.y, L0.z, { color: '#ffe27a', count: 8 }); A.sfx('unlock', { x: b.x, z: b.z, vol: 0.5 }); }
    }
    // tehlike şeritleri / halkalar (sarı daire, mavi şerit, yeşil/pembe/turuncu halka)
    for (let i = W.rings.length - 1; i >= 0; i--) {
      const r = W.rings[i]; r.t += dt;
      if (!r.done && r.t >= r.at) {
        r.done = true; markOff(r.mk);
        A.bossRing(b, r.x, r.z, r.r, 0.5, 1.2, r.col, { r1: r.r * 0.92, dur: 0.3, width: 0.3 }); A.burst('sparkle', r.x, 0.3, r.z, { color: r.col, count: 6 }); A.sfx('bounce', { x: r.x, z: r.z, vol: 0.4 });
      }
      if (r.t > r.at + 0.6) W.rings.splice(i, 1);
    }
    for (let i = W.strips.length - 1; i >= 0; i--) {
      const s = W.strips[i]; s.t += dt;
      if (s.t > s.warn) {
        const u = clamp((s.t - s.warn) / s.sweep, 0, 1), cx = s.x + Math.sin(s.yaw) * s.len * (u - 0.5), cz = s.z + Math.cos(s.yaw) * s.len * (u - 0.5);
        if (s.mk) { s.mk.g.position.x = s.x; s.mk.g.position.z = s.z; s.mk.d = Math.max(s.mk.d, s.mk.t + 0.5); }
        // tren yerdeki şerit boyunca ilerler: küçük sevimli vagon (kutu) — Feza'ya değince hafifçe iter
        if (!s.wagon && typeof scene !== 'undefined') { const w = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 1.4), new THREE.MeshStandardMaterial({ color: 0x5fa8ff, roughness: 0.5 })); w.castShadow = true; scene.add(w); s.wagon = w; }
        if (s.wagon) { s.wagon.position.set(cx, 0.45, cz); s.wagon.rotation.y = s.yaw; s.wagon.visible = u < 1; }
        const dx = P.pos.x - cx, dz = P.pos.z - cz;
        if (!s.hit && !P.dead && heroUp() < 0.9 && hyp(dx, dz) < 1.0) { s.hit = true; try { A.hurtPlayer(dmgOf(b, 0.5), cx, cz, 0.4); } catch (e) { /* yok */ } }
        if (u >= 1) { markOff(s.mk); if (s.wagon && s.wagon.parent) s.wagon.parent.remove(s.wagon); W.strips.splice(i, 1); }
      }
    }
    // QA (iPad turu): Kral'ın şeridi/halkası yerdeyken oyuncak kendi saldırısını başlatmasın (mavi şeridin üstüne pembe şerit biniyordu: tek işaret kuralı)
    if (W.strips.length || W.rings.length) for (const e of W.toys) if (!e.dead && !toyBusy(e)) e.cd = Math.max(e.cd || 0, 0.9);
    // oyuncak neşelenme sayacı (boss'un "canı" = anı çubuğu): ölü oyuncakları say
    for (let i = W.toys.length - 1; i >= 0; i--) {
      const e = W.toys[i];
      if (e.dead) { W.toys.splice(i, 1); W.cheered++; if (W.cheered <= 6 && (W.given = (W.given || 0) + 1) <= 6) { W.allow = true; try { GAME.damage(b, Math.floor(b.maxHp / 7), { kind: 'team', force: true }); } catch (er) { /* yok */ } W.allow = false; } try { A.burst('hearts', e.x, 1.2, e.z, { count: 3 }); } catch (er) { /* yok */ } }
    }
  }
  function spawnToy(b, type, ang, d) {
    try {
      const A = BOSSDAV.api, P = A.P, a = ang == null ? rnd(0, TAU) : ang, r = d || rnd(5, 7);
      let x = b.x + Math.sin(a) * r, z = b.z + Math.cos(a) * r + 2;
      for (let t = 0; t < 8 && !A.isFloor(x, z); t++) { x = b.x + Math.sin(a + t) * (r - t * 0.5); z = b.z + Math.cos(a + t) * (r - t * 0.5) + 2; }
      void P;
      const e = GAME.spawnEnemy(type, x, z, { pack: 'oyuncak' });
      if (e) { W.toys.push(e); return e; }
    } catch (er) { /* yok */ }
    return null;
  }
  const MOVES = {
    // aşama 1: Tahta At: sarı daire (≥2 sn) → yumuşak zıplama
    at(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) { b.did = 1; const sp = A.approachSpot(b, 5.5); S.sp = sp; S.mk = mark('ring', sp.x, sp.z, 2.3, '#ffd23a', 2.8); W.rings.push({ x: sp.x, z: sp.z, r: 2.3, at: 2.3, t: 0, mk: S.mk, col: '#ffe08a' }); warn(S, 'b10_sari'); }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.8, 1.4); }
    },
    // aşama 1: Kırık Tren: mavi şerit (≥2 sn) → vagon geçer
    tren(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; const yaw = Math.atan2(A.P.pos.x - b.x, A.P.pos.z - b.z) + PI / 2, x = A.P.pos.x - Math.sin(yaw) * 0.0, z = A.P.pos.z;
        const mk = mark('sq', x, z, 0.8, '#4fa8ff', 5.6, yaw, 6.2);
        W.strips.push({ x, z, yaw, len: 12, warn: 2.3, sweep: 3.0, t: 0, mk, hit: false }); warn(S, 'b10_mavi');
      }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.8, 1.4); }
    },
    // aşama 2: Uçurtma: yeşil halka; Balerin: pembe halka
    ucurtma(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) { b.did = 1; const sp = A.approachSpot(b, 5.0); S.mk = mark('ring', sp.x, sp.z, 2.2, '#5cd06a', 2.8); W.rings.push({ x: sp.x, z: sp.z, r: 2.2, at: 2.3, t: 0, mk: S.mk, col: '#8ae89a' }); warn(S, 'b10_yesil'); }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.8, 1.4); }
    },
    balerin(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) { b.did = 1; S.mk = mark('ring', b.x, b.z, 3.6, '#ff7fb4', 2.8); W.rings.push({ x: b.x, z: b.z, r: 3.6, at: 2.3, t: 0, mk: S.mk, col: '#ffa0c8' }); warn(S, 'b10_pembe'); }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.8, 1.4); }
    },
    // aşama 3: Dev Peluş Ayı: turuncu halka
    ayi(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) { b.did = 1; const sp = A.approachSpot(b, 5.0); S.mk = mark('ring', sp.x, sp.z, 2.6, '#ff9a3a', 2.8); W.rings.push({ x: sp.x, z: sp.z, r: 2.6, at: 2.3, t: 0, mk: S.mk, col: '#ffb870' }); warn(S, 'b10_turuncu'); }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.8, 1.4); }
    },
    sessiz(b, S, dt) { const A = BOSSDAV.api; b.st.move = 0; faceTo(b, A.P.pos.x, A.P.pos.z, 1.2, dt); if (b.stT >= b.phD) A.bossEnd(b, 0.8, 0.8); },   // anı sahnesi sırasında bekler
  };
  const alive = () => W.toys.filter(e => !e.dead).length;
  if (typeof BOSSDAV !== 'undefined' && BOSSDAV && BOSSDAV.register) {
    BOSSDAV.register('unutulanKralTonton', {
      hpK: 1.0, keep: 6, roarD: 0.1, isaretKendi: true, asamalar: [0.66, 0.33], kikirdama: 0,
      asamaSoz: { 2: 'b10_boss_asama2', 3: 'b10_boss_asama3' },
      choose(b, S) {
        const A = BOSSDAV.api;
        S.stage = S.stage || 1; S.n = S.n || 0;
        // anı çerçeveleri: 3 oyuncak → 1. anı; 6 → 2. anı; ayı → ad
        if (!W.busy && W.frame < 1 && W.cheered >= 3) { W.frame = 1; ani(b, 1); A.bossPhase(b, 'sessiz', 14); return; }
        if (!W.busy && W.frame < 2 && W.cheered >= 6) { W.frame = 2; ani(b, 2); A.bossPhase(b, 'sessiz', 20); return; }
        if (!W.busy && W.frame < 3 && W.cheered >= 7) { W.frame = 3; ani(b, 3); A.bossPhase(b, 'sessiz', 14); return; }
        if (W.busy || W.frame >= 3) { A.bossPhase(b, 'sessiz', 4); return; }
        if (W.strips.length || W.rings.length || W.toys.some(e => !e.dead && toyBusy(e))) { A.bossPhase(b, 'sessiz', 0.8); return; }   // BOSSC: tek büyük efekt (oyuncağın kendi işareti varken Kral beklesin)
        // oyuncak sağla: aynı anda en çok 2 oyuncak
        const want = W.frame === 0 ? ['tahtaAt', 'kirikTren'] : W.frame === 1 ? ['ucurtma', 'balerin'] : ['devPelusAyi'];
        const need = W.frame >= 2 ? (W.cheered >= 6 ? 1 : 0) : 2;
        while (alive() < need && W.toys.length < 12) { if (!spawnToy(b, want[(W.toys.length + W.cheered) % want.length])) break; }
        if (W.frame >= 2 && W.cheered < 6) { A.bossPhase(b, 'sessiz', 3); return; }
        let opts;
        if (W.frame === 0) opts = [['at', 0.5], ['tren', 0.5]];
        else if (W.frame === 1) opts = [['ucurtma', 0.5], ['balerin', 0.5]];
        else opts = [['ayi', 1]];
        const ph = A.pickPhase(b, opts);
        A.bossPhase(b, ph, { at: 3.8, tren: 6.0, ucurtma: 3.8, balerin: 3.8, ayi: 3.8 }[ph]);
      },
      moves: MOVES, hints: {},
      hit(b, amount) {   // Kral'a vurulmaz (kavga yok); oyuncaklar neşelendikçe anı çubuğu dolar
        if (W.fin || W.allow) return amount;
        // QA: Feza (5 yaş) hep Kral'a dokunuyordu → hiçbir şey olmuyordu, savaş 5 dakika takıldı. Kral'a dokunmak da işe yarasın:
        // dokunuş Kral'ın yanındaki/Feza'ya en yakın üzgün oyuncağa gider (oyuncak güler), Kral'ın kendisi yine hiç incinmez.
        try {
          const P = BOSSDAV.api.P; let best = null, bd = 1e9;
          for (const e of W.toys) { if (e.dead) continue; const d = Math.min(hyp(e.x - P.pos.x, e.z - P.pos.z), hyp(e.x - b.x, e.z - b.z) + 2); if (d < bd) { bd = d; best = e; } }
          if (best && amount > 0 && (GAME.time || 0) - (W.yonT || 0) > 0.25) { W.yonT = GAME.time || 0; GAME.damage(best, Math.max(amount, Math.ceil(best.maxHp * 0.34)), { kind: 'team' }); BOSSDAV.api.burst('hearts', best.x, 1.2, best.z, { count: 2 }); }
        } catch (er) { /* yok */ }
        return 0;
      },
      update(dt) { stepObjects(dt); },
    });
  }
  function hook() {
    if (typeof GAME === 'undefined' || !GAME || !GAME.on) { setTimeout(hook, 250); return; }
    GAME.on('zone', () => clearAll());
    GAME.on('boss', e => { if (e && !e.on && (!GAME.boss || GAME.boss.dead)) clearAll(); });
  }
  hook();
  return { clearAll, W };
})();
