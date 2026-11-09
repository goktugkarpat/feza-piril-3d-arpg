/* ── Bölüm 5: Köstebek ve Salyangoz Mağarası (Feza ve Pırıl: Büyük Fener) ──
   Altın Değirmen'in çarkından akan kıvılcımlar yer altına inip mağarada çark kristallerine dönüşmüş.
     1. Çark Deresi Ağzı        ışıklı dere kolu, ilk kristaller, minik köstebekler
     2. Pıt Pıt Madeni          raylar, köstebek tepecikleri; IŞIK BULMACASI 1 (tek ayna) → kristal kapı
     3. Salyangoz Bahçesi       ışıklı mantarlar; "hav!" → BİLBO bulunur, Pırıl "Bilbo!" deyince adını hatırlar, takıma katılır
     4. Yankı Salonu            IŞIK BULMACASI 2 (iki ayna) + RENK YANKISI (Bilbo söyler, Feza tekrar eder) → kapı
     5. Uyuyan Ejderha Mağarası kaya sanılan dev gölge aslında uyuyan Toprak Işık Ejderhası'nın sırtı (uyanmaz)
     Arena: Kristal Maden Salonu — Usta Köstebek (src/05z_magara.js). Yan A: Gizli Maden Odası. Yan B: Salyangoz Kaydırağı.
   Yanlış yok: ayna kendiliğinden döner (25 sn), Pırıl yönü gösterir (12 sn). Mor kristal YOK: amber/altın/turkuaz/mercan/yeşil.
   Genel ad: MAGARA. Işık: isik5. Cümleler: src/02l_magara.js (b05_...). */
const MAGARA = (() => {
  'use strict';
  const PI = Math.PI, hyp = Math.hypot;
  const inZone = () => typeof GAME !== 'undefined' && GAME.L && GAME.L.Z && GAME.L.Z.id === 'magara';
  const live = () => typeof GAME !== 'undefined' && GAME.state === 'play' && !GAME.paused && GAME.P && !GAME.P.dead;
  const said = new Set();
  let sayAt = -99;
  function say(key, o = {}) {
    if (typeof GAME === 'undefined' || !GAME.halaApi) return false;
    if (!(typeof AUD !== 'undefined' && AUD.LINES && AUD.LINES[key])) return false;
    if (o.once !== false && said.has(key)) return false;
    const now = GAME.time || 0;
    if (!o.force && now - sayAt < (o.gap ?? 5)) return false;
    sayAt = now; said.add(key);
    try { GAME.halaApi.say(key, o.prio || 2); } catch (e) { return false; }
    return true;
  }
  const sfx = (n, o) => { try { if (typeof AUD !== 'undefined' && AUD.sfx) AUD.sfx(n, o); } catch (e) { /* yok */ } };
  const burst = (k, x, y, z, o) => { try { if (typeof FX !== 'undefined' && FX.burst) FX.burst(k, x, y, z, o); } catch (e) { /* yok */ } };
  const ring = (x, z, r, c) => { try { if (typeof FX !== 'undefined' && FX.ring) FX.ring(x, z, r, c); } catch (e) { /* yok */ } };
  const pointTo = (x, z) => { try { if (typeof PIRIL_GUC !== 'undefined' && PIRIL_GUC.pointTo) PIRIL_GUC.pointTo(x, z); } catch (e) { /* yok */ } };
  const NS = id => { try { return GAME.nesne.bul(id); } catch (e) { return null; } };

  // ── durum (bölüme girince sıfırlanır) ──
  const R = { p1: null, p2: null, echo: null, bilbo: 'yok', bilboT: 0, ejder: 0, ejderT: 0, gizli: false, t: 0 };
  const resetR = () => { R.p1 = R.p2 = R.echo = null; R.bilbo = 'yok'; R.bilboT = 0; R.ejder = 0; R.ejderT = 0; R.gizli = false; R.t = 0; R.said1 = R.said2 = R.said3 = R.said4 = R.ejS1 = false; said.clear(); sayAt = -99; };
  const Q = []; let qT = 0;
  const later = (s, fn) => Q.push({ at: qT + s, fn });

  // ── renkler: mor YOK ──
  const AMBER = 0xffc24a, TURQ = 0x2fe0d0, CORAL = 0xff7a5a, LEAF = 0x6fdc6a, GOLD = 0xffe08a;
  const NOTE = [{ c: AMBER, h: '#ffc24a', p: 1.0 }, { c: TURQ, h: '#2fe0d0', p: 1.26 }, { c: CORAL, h: '#ff7a5a', p: 1.5 }, { c: LEAF, h: '#6fdc6a', p: 1.89 }];
  // dört yön: 0 güney(+z) 1 batı 2 kuzey 3 doğu; ayna dönüşü rotation.y = -k*PI/2
  const DIR = [[0, 1], [-1, 0], [0, -1], [1, 0]];
  const dirIdx = (dx, dz) => (Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 3 : 1) : (dz > 0 ? 0 : 2));

  function kitMesh(api, kit, o = {}) {
    const THREE = api.THREE;
    const m = new THREE.Mesh(kit.build(), api.dispose(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: o.rough ?? 0.45, metalness: o.metal ?? 0, emissive: new THREE.Color(o.emissive ?? 0x000000), emissiveIntensity: o.ei ?? 0 })));
    m.castShadow = o.cast !== false; m.name = o.name || 'magara-nesne'; api.dispose(m.geometry);
    return m;
  }
  const crystalKit = (k, c, s = 1, shades = true) => {   // kristal öbeği (birim: ~1 m yüksek)
    const c2 = new THREE.Color(c).lerp(new THREE.Color(0xffffff), 0.35);
    k.add(G.cone(6), c, [0, 0.55 * s, 0], null, [0.3 * s, 1.1 * s, 0.3 * s]);
    k.add(G.cone(6), c2, [0.32 * s, 0.32 * s, 0.1 * s], [0, 0, -0.35], [0.2 * s, 0.65 * s, 0.2 * s]);
    k.add(G.cone(6), c, [-0.28 * s, 0.28 * s, -0.1 * s], [0, 0, 0.4], [0.18 * s, 0.56 * s, 0.18 * s]);
    if (shades) k.add(G.octa(), 0xffffff, [0, 1.08 * s, 0], null, [0.04 * s, 0.07 * s, 0.04 * s]);
  };
  const sadeApi = (api, gk = 0.6, lk = 0.75) => {
    if (api.__sade) return api;
    const g0 = api.glow, l0 = api.light; api.__sade = true;
    api.glow = (x, z, r, c, k = 0.15) => g0(x, z, r, c, k * gk);
    api.light = (x, y, z, c, i = 3, d = 7, f = 0) => l0(x, y, z, c, i * lk, d, f * 0.3);
    return api;
  };

  // ════════════════ Yerleşim (saf veri) ════════════════
  const LIST = [['madenciKostebek'], ['madenciKostebek', 'baloncukSalyangoz'], ['baloncukSalyangoz', 'kristalSalyangoz', 'madenciKostebek'], ['kayaDevi', 'cakilTop', 'kristalSalyangoz', 'madenciKostebek'], ['magaraYarasa', 'cakilTop']];
  const CAP = [2, 3, 3, 3, 2];
  function yerlesim(L, api) {
    const A = L.areas || [], room = (ai, k = 0) => { const a = A[ai]; return a && !a.boss ? L.rooms[a.rooms[Math.min(k, a.rooms.length - 1)]] : null; };
    const areaOf = {}; A.forEach((a, k) => { if (!a.boss) a.rooms.forEach(ri => { areaOf[ri] = k; }); });
    const packN = {}, keep = [], deviA = {};
    for (const sp of L.spawns || []) {
      const ai = areaOf[sp.room];
      if (sp.room === 0) continue;
      if (ai === undefined) { keep.push(sp); continue; }
      const n = packN[sp.pack] = (packN[sp.pack] || 0) + 1;
      if (n > CAP[ai]) continue;
      const list = LIST[Math.min(ai, LIST.length - 1)];
      sp.type = list[(n - 1 + sp.pack) % list.length];
      if (sp.type === 'kayaDevi' && (deviA[ai] = (deviA[ai] || 0) + 1) > 1) sp.type = 'cakilTop';
      if (ai === 0) sp.elite = false;
      if (sp.elite && !['madenciKostebek', 'baloncukSalyangoz'].includes(sp.type)) sp.elite = false;
      delete sp.variant; keep.push(sp);
    }
    L.spawns.length = 0; L.spawns.push(...keep);
    const spot = (rm, dx, dz, r = 1) => {
      if (!rm) return null;
      for (let t = 0; t < 30; t++) {
        const x = rm.x + dx + (t ? (api.rnd() - 0.5) * t * 0.4 : 0), z = rm.z + dz + (t ? (api.rnd() - 0.5) * t * 0.4 : 0);
        if (api.isFloor(x, z) && api.circleFree(x, z, r)) return { x, z };
      }
      return null;
    };
    const D = L.mg = { gates: [], p1: null, p2: null, echo: null, bilbo: null, dragon: null, hide: null, slide: null, spot };
    // alan geçitlerini kendimiz yöneteceğiz (şeker direkli ortak geçit yok): kristal kapılar yalnız 2. ve 4. geçitte
    for (let k = 1; k < A.length; k++) { D.gates[k] = A[k].gate || null; A[k].gate = null; }
    // ışık bulmacası düzeni: (u,v) birim ızgara, 4 yönde döndürülür; düğümler ve ara noktalar yürünür olmalı
    const PAT = {
      1: { S: [-1, 1], M: [[1, 1]], T: [1, -1], out: [[0, -1]], dir0: [1, 0] },
      2: { S: [-2, 1], M: [[0, 1], [0, -1]], T: [2, -1], out: [[0, -1], [1, 0]], dir0: [1, 0] },
      3: { S: [-1, 1], M: [[1, 1], [1, -1]], T: [-1, -1], out: [[0, -1], [-1, 0]], dir0: [1, 0] },
    };
    function layout(rm, pat) {
      for (const d of [4.4, 3.8, 3.2, 2.7]) for (let rot = 0; rot < 4; rot++) {
        const c = Math.cos(rot * PI / 2), s = Math.sin(rot * PI / 2), tr = ([u, v]) => ({ x: rm.x + (u * c - v * s) * d, z: rm.z + (u * s + v * c) * d });
        const S = tr(pat.S), M = pat.M.map(tr), T = tr(pat.T), pts = [S, ...M, T];
        const ok = pts.every(p => api.isFloor(p.x, p.z) && api.circleFree(p.x, p.z, 0.8) && hyp(p.x - L.start.x, p.z - L.start.z) > 3.5);
        if (!ok) continue;
        let mid = true; for (let i = 0; i < pts.length - 1 && mid; i++) mid = api.isFloor((pts[i].x + pts[i + 1].x) / 2, (pts[i].z + pts[i + 1].z) / 2);
        if (!mid) continue;
        const dir0 = [pat.dir0[0] * c - pat.dir0[1] * s, pat.dir0[0] * s + pat.dir0[1] * c];
        const out = pat.out.map(([u, v]) => dirIdx(u * c - v * s, u * s + v * c));
        return { S, M, T, d, dir0, out, room: L.rooms.indexOf(rm) };
      }
      return null;
    }
    D.p1 = layout(room(1, 1) || room(1, 0), PAT[1]) || layout(room(1, 0), PAT[1]);
    D.p2 = layout(room(3, 0), PAT[2]) || layout(room(3, 1), PAT[2]) || layout(room(3, 0), PAT[3]) || layout(room(3, 1), PAT[3]) || layout(room(3, 2), PAT[3]);
    // renk yankısı: Yankı Salonu'nun 2. odasında 4 kristal. QA: ayna bulmacasıyla üst üste düşmesin (huzme kristalin içinden geçiyordu, ayna ile
    // kristal arasında 0,9 m dar aralık kalıyordu) → bulmaca noktalarından/huzme yolundan uzak dur; sığmazsa 1. odaya
    const segD = (x, z, a, b) => { const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2)); return hyp(x - a.x - dx * u, z - a.z - dz * u); };
    const p2Pts = D.p2 ? [D.p2.S, ...D.p2.M, D.p2.T] : [];
    const nearP2 = p => p2Pts.some(q => hyp(q.x - p.x, q.z - p.z) < 3.2) || p2Pts.some((q, i) => i && segD(p.x, p.z, p2Pts[i - 1], q) < 1.9);
    for (const rm of [room(3, 1), room(3, 0)].filter(Boolean)) {
      const pts = [];
      for (let t = 0; t < 64 && pts.length < 4; t++) {
        const R0 = rm.r * (t < 40 ? 0.42 - t * 0.004 : 0.62 - (t - 40) * 0.005), i = pts.length, a = i * PI / 2 + 0.78 + (t > 20 ? 0.3 : 0), p = spot(rm, Math.sin(a) * R0, Math.cos(a) * R0, 0.9);
        if (p && !nearP2(p) && pts.every(q => hyp(q.x - p.x, q.z - p.z) > 3.4)) pts.push(p); else if (t % 8 === 7) pts.length = 0;
      }
      if (pts.length === 4) { D.echo = { pts, room: L.rooms.indexOf(rm) }; break; }
    }
    { const rm = room(2, 1) || room(2, 0); D.bilbo = rm ? (spot(rm, 0, 0, 1) || { x: rm.x, z: rm.z }) : null; }
    { const rm = room(4, 0); if (rm) {
        let nz = rm.z; for (let d = 0; d < rm.r + 10; d += 0.25) { if (!api.isFloor(rm.x, rm.z - d)) break; nz = rm.z - d; }
        D.dragon = { x: rm.x, z: nz - 4.2, rm: L.rooms.indexOf(rm), front: nz + 1.0, cx: rm.x };
      } }
    const side = L.rooms.filter(r => r.kind === 'side');
    if (side[0]) D.hide = spot(side[0], 0, 0, 1.2) || { x: side[0].x, z: side[0].z };
    if (side[1]) D.slide = spot(side[1], 0, 0, 1.2) || { x: side[1].x, z: side[1].z };
    // QA (görsel): düşman bulmaca/yankı kristallerinin ve Bilbo'nun dibinde doğmasın (Kaya Devi yankı kristalinin içine giriyordu).
    // Rastgele sayı çekilmez (dekor dizilişi aynı kalsın): sabit sarmalda boş yer aranır.
    { const busy = [], addP = (p, r) => { if (p) busy.push({ x: p.x, z: p.z, r }); };
      for (const lay of [D.p1, D.p2]) if (lay) { addP(lay.S, 3); addP(lay.T, 3); lay.M.forEach(p => addP(p, 3)); }
      if (D.echo) D.echo.pts.forEach(p => addP(p, 3.4)); addP(D.bilbo, 3);
      const near = (x, z) => busy.some(q => hyp(q.x - x, q.z - z) < q.r);
      for (const sp of L.spawns) if (near(sp.x, sp.z)) {
        const rm = L.rooms[sp.room], cx = rm ? rm.x : sp.x, cz = rm ? rm.z : sp.z, big = sp.type === 'kayaDevi' ? 1.4 : 0.8;
        for (let t = 0; t < 48; t++) { const a = t * 2.39996 + sp.pack, d = 2 + (t % 8) * 0.75, x = cx + Math.sin(a) * d, z = cz + Math.cos(a) * d;
          if (api.isFloor(x, z) && api.circleFree(x, z, big) && !near(x, z) && hyp(x - L.start.x, z - L.start.z) > 12) { sp.x = x; sp.z = z; break; } }
      } }
  }

  // ════════════════ Görsel kurulum ════════════════
  const ROCK = [0x4a5470, 0x566080, 0x3c4660, 0x5e6a88], MOSS = [0x4a8a78, 0x5a9a80, 0x3f7a6c], MUSH = [0xffd27a, 0x7fe8d8, 0xff9a7a];
  function* kur(L, api) {
    api = sadeApi(api);
    const THREE = api.THREE, rnd = api.rnd, D = L.mg || {};
    resetR(); Q.length = 0; qT = 0;
    const put = api.put, isF = (x, z) => api.isFloor(x, z);
    const sph = api.tmp(new THREE.SphereGeometry(1, 10, 7)), cone = api.tmp(new THREE.ConeGeometry(1, 1, 7)), cone6 = api.tmp(new THREE.ConeGeometry(1, 1, 6));
    const dode = api.tmp(new THREE.DodecahedronGeometry(1, 0)), cyl = api.tmp(new THREE.CylinderGeometry(1, 1, 1, 10)), octa = api.tmp(new THREE.OctahedronGeometry(1, 0));
    const pick = a => a[(rnd() * a.length) | 0];
    api.dreamEdge();
    if (D.dragon) for (let dx = -6; dx <= 6; dx += 2) for (let dz = -4; dz <= 5; dz += 2) api.noDecor(D.dragon.cx + dx, D.dragon.z + dz);
    const crystalC = [AMBER, TURQ, LEAF, CORAL];
    // E567: yeni çevre kiti (07m_kit_e567.js + 07m_dekor_magara.js); yüklenemezse eski basit süsler çalışır
    const HASD = typeof MAGARA_DEKOR !== 'undefined' && (() => { try { return MAGARA_DEKOR.olustur(L, api, { K: typeof ODAKIT !== 'undefined' ? ODAKIT : null }); } catch (e) { console.warn('MAGARA_DEKOR', e); return false; } })();
    // ── odaların çevresi: kenarda kaya, dikit, kristal, ışıklı mantar, yosun; yürünen alanda iri nesne yok ──
    for (const rm of HASD ? [] : L.rooms) {
      const n = rm.kind === 'boss' ? 30 : 22, R0 = (rm.r || Math.max(rm.hw, rm.hh));
      for (let k = 0; k < n; k++) {
        const a = k * PI * 2 / n + rnd() * 0.5, rad = R0 + 2.2 + rnd() * 3.2, x = rm.x + Math.sin(a) * rad, z = rm.z + Math.cos(a) * rad;
        if (isF(x, z) || api.linkDist(x, z) < 3.5) continue;
        const south = z > rm.z + 1, r = rnd();
        if (r < 0.34) { const s = 0.6 + rnd() * 0.9; put(dode, x, south ? 0.25 : s * 0.5, z, s * 1.3, south ? 0.5 : s * 0.9, s * 1.1, pick(ROCK), rnd() * 6); }
        else if (r < 0.55) { const h = south ? 0.8 : 2 + rnd() * 3; put(cone, x, h / 2, z, 0.5 + rnd() * 0.5, h, 0.5 + rnd() * 0.5, pick(ROCK), 0); }
        else if (r < 0.8) { const c = pick(crystalC), s = south ? 0.5 : 0.8 + rnd() * 0.9; for (const [dx, dz, sc] of [[0, 0, 1], [0.5, 0.3, 0.6], [-0.4, 0.2, 0.5]]) put(cone6, x + dx * s, 0.5 * s * sc + 0.1, z + dz * s, 0.3 * s * sc, 1.1 * s * sc, 0.3 * s * sc, c, rnd() * 3, 0, (rnd() - 0.5) * 0.3, 'glow'); api.glow(x, z, 3, c, 0.12); }
        else { const c = pick(MUSH); put(cyl, x, 0.3, z, 0.08, 0.6, 0.08, 0xefe6cc, 0); put(sph, x, 0.65, z, 0.34, 0.2, 0.34, c, 0, 0, 0, 'glow'); api.glow(x, z, 2.2, c, 0.1); }
      }
      // yosun minderleri + sümük izi + tepecik (yürüyüş alanının kenarında alçak)
      for (let k = 0; k < 7; k++) {
        const a = rnd() * PI * 2, rad = R0 * (0.55 + rnd() * 0.5), x = rm.x + Math.sin(a) * rad, z = rm.z + Math.cos(a) * rad;
        if (!isF(x, z)) continue;
        if (rnd() < 0.6) put(sph, x, 0.0, z, 0.5 + rnd() * 0.5, 0.07, 0.4 + rnd() * 0.4, pick(MOSS), rnd() * 3);
        else if (rnd() < 0.6) { put(sph, x, -0.18, z, 0.55, 0.38, 0.5, 0x9a7a5a, 0); put(cyl, x + 0.2, 0.1, z, 0.03, 0.4, 0.03, 0x8a5a34, 0, 0, 0.5); }
      }
    }
    yield;
    // ── kuzey kenarında yüksek mağara duvarı: kamerayı kapatmaz (yürünen alandan uzakta) ──
    for (const rm of HASD ? [] : L.rooms) for (let k = 0; k < 6; k++) {
      const a = PI + (rnd() - 0.5) * 2.4, rad = (rm.r || 8) + 6 + rnd() * 3, x = rm.x + Math.sin(a) * rad, z = rm.z + Math.cos(a) * rad;
      if (isF(x, z) || api.linkDist(x, z) < 3.5 || z > rm.z) continue;
      const h = 1.8 + rnd() * 1.8; put(dode, x, h * 0.4, z, 2 + rnd() * 1.4, h, 2 + rnd() * 1.4, pick(ROCK), rnd() * 6);
    }
    yield;
    // ── 1. alan: değirmen deresinin yer altına akan ışıklı kolu (altın-turkuaz şerit, yol boyunca) ──
    { const a0 = L.areas[0], rms = a0.rooms.map(i => L.rooms[i]), pts = [];
      for (const rm of rms) pts.push([rm.x - rm.r * 0.45, rm.z - rm.r * 0.3]);
      const ex = L.rooms[a0.rooms[a0.rooms.length - 1]], nx = L.rooms[a0.rooms[a0.rooms.length - 1] + 1] || ex;
      pts.push([(ex.x + nx.x) / 2, (ex.z + nx.z) / 2]);
      if (pts.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], 0, p[1]))), N = Math.max(14, Math.round(curve.getLength() * 1.4)), sp = curve.getSpacedPoints(N);
        const pos = [], uv = [], idx = []; let len = 0;
        for (let i = 0; i <= N; i++) {
          const a = sp[Math.max(0, i - 1)], b = sp[Math.min(N, i + 1)], dx = b.x - a.x, dz = b.z - a.z, l = hyp(dx, dz) || 1, nx2 = -dz / l, nz2 = dx / l;
          if (i > 0) len += sp[i].distanceTo(sp[i - 1]);
          pos.push(sp[i].x + nx2 * 0.9, 0.03, sp[i].z + nz2 * 0.9, sp[i].x - nx2 * 0.9, 0.03, sp[i].z - nz2 * 0.9); uv.push(len, 0, len, 1);
          if (i < N) { const q = i * 2; idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
        const m = new THREE.ShaderMaterial({ uniforms: { uTime: TIME.u }, transparent: true, depthWrite: false,
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          // CİLA: düz parlak şerit yerine gerçek dere gibi: kenarları yumuşak, ortası derin turkuaz, akan ince dalgalar, içinde altın kıvılcımlar
          fragmentShader: `uniform float uTime; varying vec2 vUv; void main(){ float e = smoothstep(0.0,0.42,vUv.y)*smoothstep(1.0,0.58,vUv.y);
            float w = sin(vUv.x*2.6 - uTime*1.7 + sin(vUv.y*7.0 + vUv.x*0.7)*0.9); float rp = smoothstep(0.72,1.0,w)*smoothstep(0.1,0.5,e);
            float sp = pow(max(0.0, sin(vUv.x*6.0-uTime*2.4+vUv.y*12.0)*sin(vUv.x*3.1+uTime-vUv.y*8.0)), 14.0);
            vec3 c = mix(vec3(0.3,0.76,0.78), vec3(0.09,0.44,0.54), e) + vec3(0.55,0.95,0.92)*rp*0.45 + vec3(1.0,0.84,0.42)*sp*1.1; gl_FragColor = vec4(c, e*0.84); }` });
        const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 1; mesh.name = 'magara-dere'; api.add(mesh); api.dispose(m); api.dispose(g);
        for (let i = 3; i < sp.length; i += 6) api.glow(sp[i].x, sp[i].z, 2.4, 0x48e0d8, 0.12);
      } }
    yield;
    // ── 2. alan: maden rayı + sandık/kazma; arena: maden arabası köşesi, fener direği ──
    if (!HASD) { const rms = L.areas[1].rooms.map(i => L.rooms[i]);
      for (let ri = 0; ri < rms.length; ri++) { const rm = rms[ri], nb = L.rooms[L.areas[1].rooms[ri] + 1];
        if (!nb) continue; const dx = nb.x - rm.x, dz = nb.z - rm.z, l = hyp(dx, dz) || 1, yaw = Math.atan2(dx, dz);
        for (let d = 3; d < l - 3; d += 1.1) { const x = rm.x + dx / l * d + dz / l * 1.7, z = rm.z + dz / l * d - dx / l * 1.7;
          if (!isF(x, z)) continue;
          api.box(x, 0.05, z, 1.4, 0.07, 0.16, 0x6a4a30, yaw + PI / 2);
          if (Math.floor(d * 10) % 2 === 0) { for (const sd of [-0.5, 0.5]) api.box(x + dz / l * sd * 0.0 + Math.cos(yaw) * sd, 0.11, z - Math.sin(yaw) * sd, 0.07, 0.07, 1.2, 0xa8b0c0, yaw); } } } }
    { const br = L.rooms.find(r => r.kind === 'boss');
      if (br) {
        const x = br.x - br.r * 0.9, z = br.z - br.r * 0.5;
        const k = new Kit();
        k.add(G.box(), 0x6a5a48, [0, 0.55, 0], null, [1.6, 0.7, 1.0]);   // vagon gövdesi
        for (const sx of [-0.55, 0.55]) for (const sz of [-0.55, 0.55]) k.add(G.cyl(1, 1, 12), 0x3a3a46, [sx, 0.2, sz], [PI / 2, 0, 0], [0.2, 0.1, 0.2]);
        for (const [dx, dz, c, s] of [[-0.4, 0, AMBER, 0.6], [0.3, 0.1, TURQ, 0.5], [0, -0.1, LEAF, 0.55]]) { k.push([dx, 0.88, dz]); crystalKit(k, c, s, false); k.pop(); }
        const m = kitMesh(api, k, { name: 'magara-vagon', emissive: 0x302010, ei: 0.2 }); m.position.set(x, 0, z); m.rotation.y = 0.5; m.scale.setScalar(1.5); api.add(m);
        api.solid(x, z, 1.4, 'vagon'); api.glow(x, z, 4, AMBER, 0.2);
        const px = br.x + br.r * 0.85, pz = br.z - br.r * 0.6;   // fener direği
        api.box(px, 1.7, pz, 0.12, 3.4, 0.12, 0x4a4a56, 0); api.ball(px, 3.5, pz, 0.35, 0.35, 0.35, 0xffe9a0, 'glow'); api.light(px, 3.4, pz, 0xffe8b0, 3.5, 12, 0.1); api.glow(px, pz, 4, 0xffe8b0, 0.2);
        api.box(px - 0.8, 0.7, pz + 0.5, 0.1, 1.4, 0.1, 0x8a5a34, 0, undefined);   // kazma sapı
      } }
    yield;

    // ════════════════ Işık bulmacaları ════════════════
    const kapiAnim = [];   // kristal kapı: { grp, solids, open, t }
    function door(g, key) {
      if (!g) return null;
      const [dx, dz] = (typeof ODAKIT !== 'undefined' && ODAKIT.gateDir) ? ODAKIT.gateDir(L, g) : [0, -1], nx = -dz, nz = dx;
      let lo = 0, hi = 0;
      for (let o = 0; o <= 7; o += 0.5) { if (isF(g.x + nx * o, g.z + nz * o)) hi = o; else break; }
      for (let o = 0; o <= 7; o += 0.5) { if (isF(g.x - nx * o, g.z - nz * o)) lo = o; else break; }
      const grp = new THREE.Group(); grp.position.set(g.x, 0, g.z); api.add(grp);
      const k = new Kit(), solids = [];
      for (let o = -lo - 0.5, i = 0; o <= hi + 0.5; o += 0.8, i++) {
        const x = nx * o, z = nz * o, s = 0.8 + 0.35 * ((i * 7) % 3) / 2;
        k.push([x, 0, z], [0, i, 0]); k.add(G.cone(6), 0x8e98b4, [0, 1.0 * s, 0], null, [0.55 * s, 2.0 * s, 0.55 * s]); k.add(G.cone(6), 0xaab4cc, [0.3, 0.55 * s, 0.1], [0, 0, -0.4], [0.3 * s, 1.1 * s, 0.3 * s]); k.pop();
        const so = { x: g.x + x, z: g.z + z, r: 0.75, alive: true, tag: 'kapi' }; L.solids.push(so); solids.push(so);
      }
      const mesh = kitMesh(api, k, { name: 'magara-kapi-' + key, rough: 0.35, emissive: 0x60708a, ei: 0.12 }); grp.add(mesh);
      L._sh = null;
      const d = { g, grp, solids, open: false, t: 0, key, mesh, dx, dz }; kapiAnim.push(d); return d;
    }
    function openDoor(d) {
      if (!d || d.open) return; d.open = true; for (const so of d.solids) so.alive = false; L._sh = null;
      sfx('unlock', { x: d.g.x, z: d.g.z }); burst('sparkle', d.g.x, 1.4, d.g.z, { color: '#ffe08a', count: 18 });
    }
    const doors = { 2: door(D.gates[2], 'a'), 4: door(D.gates[4], 'b') };

    // kaynak/ayna/hedef kristalleri ve huzme
    const beamMat = () => api.dispose(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.15, 0.45), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    const flat = api.dispose(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2));
    function crystalBig(c, s, name, em = 0.2) { const kk = new Kit(); crystalKit(kk, c, s); const m = kitMesh(api, kk, { name, rough: 0.25, emissive: c, ei: em }); return m; }
    function mkPuzzle(lay, key, doorKey, onLit) {
      if (!lay) return null;
      const P = { key, lay, srcOn: false, srcT: 0, lit: false, idle: 0, dirty: true, segs: [], onLit, door: doors[doorKey], told: false, hinted: 0, ids: [], beams: [], fade: 0 };
      // kaynak
      const src = crystalBig(AMBER, 1.3, 'magara-kaynak', 0.08); src.position.set(lay.S.x, 0, lay.S.z); api.add(src); P.src = src;
      const baseK = new Kit(); baseK.add(G.cyl(1, 1.15, 14), 0xa39a88, [0, 0.08, 0], null, [0.8, 0.16, 0.8]); const base = kitMesh(api, baseK, { name: 'magara-kaide', cast: false });   // (yassı kaide: gölge düşürmesine gerek yok)
      base.position.set(lay.S.x, 0, lay.S.z); api.add(base); api.solid(lay.S.x, lay.S.z, 0.7, 'kaynak'); api.glow(lay.S.x, lay.S.z, 3, AMBER, 0.12);
      // hedef (gri kapı kristali)
      const tgt = crystalBig(0x8c92a8, 1.3, 'magara-hedef', 0.0); tgt.position.set(lay.T.x, 0, lay.T.z); api.add(tgt); P.tgt = tgt;
      const b2 = kitMesh(api, baseK, { name: 'magara-kaide', cast: false }); b2.position.set(lay.T.x, 0, lay.T.z); api.add(b2); api.solid(lay.T.x, lay.T.z, 0.7, 'hedef');
      // aynalar (dokununca / yaklaşınca çeyrek döner)
      lay.M.forEach((p, i) => {
        const req = lay.out[i], durum0 = 0, acilar = [0, 1, 2, 3].map(j => -(((req + j) % 4)) * PI / 2);   // SADE (ebeveyn): ayna çevirme bulmacası 5 yaş için zordu → aynalar baştan doğru yönde, dokunulmaz
        const grp = new THREE.Group(); grp.position.set(p.x, 0, p.z);
        const kk = new Kit(); kk.add(G.octa(), TURQ, [0, 1.05, 0], null, [0.42, 0.7, 0.42]); kk.add(G.octa(), 0xc8fff8, [0, 1.05, 0.06], null, [0.22, 0.4, 0.22]);
        kk.add(G.cone(4), GOLD, [0, 1.05, 0.62], [PI / 2, 0, 0], [0.16, 0.5, 0.16]);   // ok ucu: ışığın çıkış yönü
        kk.add(G.cyl(1, 1.15, 14), 0xa39a88, [0, 0.08, 0], null, [0.75, 0.16, 0.75]);
        const mm = kitMesh(api, kk, { name: 'magara-ayna', rough: 0.2, emissive: TURQ, ei: 0.25 }); grp.add(mm); api.add(grp);
        grp.rotation.y = acilar[durum0]; api.solid(p.x, p.z, 0.6, 'ayna'); api.glow(p.x, p.z, 2.4, TURQ, 0.12);
        const id = 'mg_' + key + '_' + i; P.ids.push(id);   // (çevrilir nesne DEĞİL: yaklaşınca dönüp ışığı bozmasın)
        P.beams.push({ req, durum0 });
      });
      for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(flat, beamMat()); m.visible = false; m.renderOrder = 4; api.add(m); P.beams[i] = Object.assign(P.beams[i] || {}, { m }); }
      return P;
    }
    // huzmenin gittiği yol: kaynaktan çıkar, aynaya değince aynanın çıkış yönüne döner, hedefe değerse yanar
    function beamCalc(P) {
      const lay = P.lay, segs = []; let x = lay.S.x, z = lay.S.z, dx = lay.dir0[0], dz = lay.dir0[1], hit = false, last = -1;
      const mir = lay.M.map((p, i) => { const o = NS(P.ids[i]); return { x: p.x, z: p.z, k: (lay.out[i] + (o ? o.durum : P.beams[i].durum0)) % 4 }; });
      for (let seg = 0; seg < 4; seg++) {
        let best = 40, bi = -2;
        mir.forEach((m, i) => { if (i === last) return; const ax = m.x - x, az = m.z - z, al = ax * dx + az * dz, sd = Math.abs(ax * dz - az * dx); if (al > 0.8 && sd < 0.7 && al < best) { best = al; bi = i; } });
        { const ax = lay.T.x - x, az = lay.T.z - z, al = ax * dx + az * dz, sd = Math.abs(ax * dz - az * dx); if (al > 0.8 && sd < 0.7 && al < best) { best = al; bi = -1; } }
        if (bi === -2) { segs.push({ x0: x, z0: z, x1: x + dx * 5, z1: z + dz * 5, dim: true }); break; }
        if (bi === -1) { segs.push({ x0: x, z0: z, x1: lay.T.x, z1: lay.T.z }); hit = true; break; }
        const m = mir[bi]; segs.push({ x0: x, z0: z, x1: m.x, z1: m.z }); x = m.x; z = m.z; dx = DIR[m.k][0]; dz = DIR[m.k][1]; last = bi;
      }
      P.segs = segs; return hit;
    }
    function puzzleTick(P, dt, hx, hz, t) {
      if (!P) return;
      const lay = P.lay;
      // QA1: kapının önüne gelen çocuk kaynağı hiç görmemiş olabilir (kaynak yoldan 13-15 m uzakta) → Pırıl kaynağı gösterir
      const nearDoor = !!(P.door && !P.door.open && P.door.g && hyp(hx - P.door.g.x, hz - P.door.g.z) < 9);
      if (!P.srcOn && nearDoor && t - (P.doorHintT ?? -99) > 14) { P.doorHintT = t; pointTo(lay.S.x, lay.S.z); say('pp_b05_kristal', { gap: 3, force: true }); }
      const dAcik = !!(P.door && P.door.open && !P.lit);
      if (!P.srcOn) {
        if (hyp(hx - lay.S.x, hz - lay.S.z) < 7.5) {
          if (dAcik) P.told = true;
          if (!P.told) { P.told = true; pointTo(lay.S.x, lay.S.z); say(P.key === 'p1' ? 'b05_kristal' : 'pp_b05_kristal', { gap: 2, force: true }); }
          P.srcT += dt;
          if (P.srcT > 1.5) { P.srcOn = true; P.dirty = true; sfx('star', { x: lay.S.x, z: lay.S.z, pitch: 1.1 }); burst('sparkle', lay.S.x, 1.0, lay.S.z, { color: '#ffe08a', count: 12 }); }
        }
        P.src.material.emissiveIntensity = 0.08 + 0.05 * Math.sin(t * 2);
        return;
      }
      // SADE (ebeveyn): çevirme/sıra yok. Kaynak yanınca ışık aynalardan kendiliğinden geçip kapı kristaline AKAR (segment segment uzar), kapı açılır
      if (P.dirty) { P.dirty = false; P.hit = beamCalc(P); }
      P.grow = Math.min(P.segs.length, (P.grow || 0) + dt * 1.5);
      if (P.hit && !P.lit && P.grow >= P.segs.length) { P.lit = true; P.litT = 0; }
      P.beams.forEach((b, i) => {
        const s = P.segs[i], f = s ? Math.min(1, P.grow - i) : 0;
        if (!s || f <= 0.02) { b.m.visible = false; return; }
        const ex = s.x0 + (s.x1 - s.x0) * f, ez = s.z0 + (s.z1 - s.z0) * f; b.m.visible = true;
        b.m.position.set((s.x0 + ex) / 2, 0.95, (s.z0 + ez) / 2); b.m.rotation.y = Math.atan2(s.x1 - s.x0, s.z1 - s.z0); b.m.scale.set(0.34, 1, Math.max(0.05, hyp(ex - s.x0, ez - s.z0)));
        b.m.material.opacity = (s.dim ? 0.35 : 0.85) * (0.85 + 0.15 * Math.sin(t * 7 + i));
      });
      P.src.material.emissiveIntensity = 0.6 + 0.15 * Math.sin(t * 3);
      if (P.lit) {
        P.litT += dt;
        P.tgt.material.emissive.setHex(AMBER); P.tgt.material.emissiveIntensity = Math.min(0.7, P.litT);
        if (!P.done && P.litT > 0.4) { P.done = true; sfx('unlock', { x: lay.T.x, z: lay.T.z }); burst('sparkle', lay.T.x, 1.2, lay.T.z, { color: '#ffe08a', count: 18 });
          if (!(P.door && P.door.open)) say('b05_ayna_bitti', { gap: 1, force: true });   // kapı Pırıl'la zaten açıldıysa "kapı açıldı" deme
          if (P.onLit) P.onLit(P); }
      }
    }
    const firstWrong = P => { for (let i = 0; i < P.ids.length; i++) { const o = NS(P.ids[i]); if (o && o.durum !== 0) return { id: P.ids[i], x: o.x, z: o.z }; } return null; };
    R.p1 = mkPuzzle(D.p1, 'p1', 2, () => { const sft = doors[2] && doors[2].soft; openDoor(doors[2]); if (!sft) pointTo(D.gates[2] ? D.gates[2].x : D.p1.T.x, D.gates[2] ? D.gates[2].z : D.p1.T.z); });
    R.p2 = mkPuzzle(D.p2, 'p2', 4, () => { const sft = doors[4] && doors[4].open; openDoor(doors[4]); if (!sft && D.gates[4]) pointTo(D.gates[4].x, D.gates[4].z); });   // SADE: kapı 4 yalnız ışığa (ya da Pırıl'ın yumuşak açışına) bağlı; renk yankısı kaldırıldı
    // YUMUŞAK KİLİT: Feza (4,5 yaş) bulmacayı atlayabilir. Kristal kapının önünde (6 m) toplam ~4 sn kalınca Pırıl kapıyı kendisi açar.
    // Bulmacalar oyunda kalır (geri dönüp oynanabilir); kapı açık olduğu için bitince "kapı açıldı" denmez. Kapı 2 ← bulmaca 1; kapı 4 ← bulmaca 2 + renk yankısı.
    function softDoor(d, P, dt, hx, hz) {
      if (!d || d.open) return;
      let m = 99; for (const so of d.solids) m = Math.min(m, hyp(hx - so.x, hz - so.z));
      if (m > 6) return;
      if (!d.hintOn) { d.hintOn = true;   // ilk gelişte: kaynak yanmadıysa puzzleTick zaten gösteriyor; yandıysa Pırıl sıradaki adımı gösterir (sessiz)
        if (P && !P.srcOn) pointTo(P.lay.S.x, P.lay.S.z); }
      d.nearT = (d.nearT || 0) + dt;
      if (d.nearT < 4) return;
      d.soft = true; openDoor(d); pointTo(d.g.x + d.dx * 5, d.g.z + d.dz * 5);   // açılan yolu gösterir
      say('kapi_acildi', { once: false, gap: 0, force: true, prio: 3 });
    }
    yield;

    // ── şarkı söyleyen 4 büyük kristal (amber, turkuaz, mercan, yeşil). SADE (ebeveyn): eski "renk yankısı" (sırayı ezberleyip tekrarlama) KALDIRILDI;
    //    Feza yanından geçince kristal kendi notasıyla bir kez parlar. Hiçbir kapı buna bağlı değil, Pırıl göstermez, cümle yok.
    if (D.echo) {
      const E = R.echo = { gl: [0, 0, 0, 0], inn: [false, false, false, false], items: [] };
      D.echo.pts.forEach((p, i) => {
        const kk = new Kit(); crystalKit(kk, NOTE[i].c, 1.7); kk.add(G.cyl(1, 1.15, 14), 0xa39a88, [0, 0.09, 0], null, [0.9, 0.18, 0.9]);
        const m = kitMesh(api, kk, { name: 'magara-yanki-' + i, rough: 0.25, emissive: NOTE[i].c, ei: 0.16, cast: false });   // CİLA: ışık veren kristal gölge düşürmez (Yankı Salonu bütçe içinde kalsın) m.position.set(p.x, 0, p.z); api.add(m); E.items.push(m);
        api.solid(p.x, p.z, 0.8, 'yanki'); api.glow(p.x, p.z, 3, NOTE[i].c, 0.1);
      });
    }
    yield;

    // ── Bilbo (kayıp, adını unutmuş): model Feza yaklaşınca bulunur ──
    let bilboM = null;
    if (D.bilbo && typeof BILBO !== 'undefined' && BILBO && BILBO.create) {
      try { bilboM = BILBO.create(); bilboM.root.scale.setScalar(0.78); bilboM.root.position.set(D.bilbo.x, 0, D.bilbo.z); api.add(bilboM.root); } catch (e) { bilboM = null; }
    }
    // ── Uyuyan Toprak Işık Ejderhası: önce kaya duvar sanılır ──
    let ej = null, cover = null, ejCr = [];
    if (D.dragon && typeof EJDERHA !== 'undefined' && EJDERHA && EJDERHA.uykulu) {
      try {
        ej = EJDERHA.uykulu('toprak'); ej.root.position.set(D.dragon.x, 0, D.dragon.z); ej.root.scale.setScalar(2.6); ej.root.rotation.y = 0.25; api.add(ej.root);   // QA (görsel): yüzü kameraya dönük uyusun (eskiden yalnız sırtı/kuyruğu görünüyordu, kocaman bir top gibiydi)
        ej.root.visible = false;   // QA (görsel): ejderhanın sırtı/kuyruğu kaya yığınının İÇİNDEN taşıyordu (iç içe karışık görüntü) → kayalar inmeye başlayınca görünür
        // kaya "dağ": mağaranın açık kaya rengi (eski koyu lacivert bloklar sırıtıyordu), üstünde yosun ve minik amber kristaller (tek parça, tek çizim)
        // CİLA: köşeli dev bloklar yerine yuvarlak, yumuşak kaya tepeciği (ön tarafta alçak, arkada sırt gibi yükselen); renkler mağaranın açık kayalarıyla aynı
        const ck = new Kit(), CR = [0xa8bcc4, 0x98b0bc, 0xb6c6ca, 0x9fb6c8], MO = [0x5fae8e, 0x6dbc98, 0x58a488];
        for (let i = 0; i < 13; i++) { const a = (i / 12 - 0.5) * PI * 1.9, rr = 3.5 + (i % 3) * 0.45, back = Math.max(0, -Math.cos(a)), s = 1.5 + (i % 3) * 0.32 + back * 0.6;
          ck.add(G.ico(1), CR[i % 4], [Math.sin(a) * rr * 1.15, s * 0.55, Math.cos(a) * rr * 0.85], [i * 0.7, a, 0], [s * 1.25, s * (0.85 + back * 0.35), s * 1.1]); }
        ck.add(G.ico(1), CR[2], [0, 2.4, -0.4], [0.2, 0.4, 0], [3.6, 2.9, 3.2]); ck.add(G.ico(1), CR[0], [-1.5, 2.0, 0.9], [0.5, 1.1, 0], [2.0, 1.6, 1.8]); ck.add(G.ico(1), CR[3], [1.6, 2.1, 0.6], [1.3, 0.2, 0], [2.1, 1.7, 1.9]);
        for (let i = 0; i < 6; i++) { const a = (i / 6 - 0.5) * 2.6; ck.add(G.sphere(10, 6), MO[i % 3], [Math.sin(a) * 2.3, 4.55 - Math.abs(a) * 0.55, Math.cos(a) * 1.2 - 0.6], [0, a, 0], [1.25, 0.3, 0.95]); }   // yosun örtüsü
        for (let i = 0; i < 5; i++) { ck.push([(i - 2) * 1.05, 4.75 - Math.abs(i - 2) * 0.32, -0.7 + (i % 2) * 0.3], [0, i * 1.3, (i - 2) * 0.16]); crystalKit(ck, i % 2 ? GOLD : AMBER, 0.62, false); ck.pop(); }   // sırttaki minik kristaller
        cover = kitMesh(api, ck, { name: 'magara-ejder-kaya', rough: 0.8, emissive: 0x2a2418, ei: 0.22 }); cover.position.set(D.dragon.x, 0, D.dragon.z); api.add(cover); cover.userData.y0 = 0;
        { const kk = new Kit(); for (let i = 0; i < 6; i++) { const a = (i / 5 - 0.5) * 2.4; kk.push([Math.sin(a) * 4.4, 0, Math.cos(a) * 4.4], [0, i * 1.1, 0]); crystalKit(kk, AMBER, 1.3, false); kk.pop(); }
          const m = kitMesh(api, kk, { name: 'magara-ejder-kristal', rough: 0.25, emissive: AMBER, ei: 0, cast: false }); m.position.set(D.dragon.x, 0, D.dragon.z); m.visible = false; api.add(m);
          ejCr = { m, per: m.geometry.index ? m.geometry.index.count / 6 : 0, n: 6 }; }   // QA (görsel): kristaller ejderhanın gövdesinin içinde kalıyordu → önünde yerde yay; soldan sağa yanar. CİLA: 6 kristal tek parça (sırayla görünür), gölgesiz → 12 çizim yerine 1
        api.solid(D.dragon.x, D.dragon.z, 4.6, 'ejder'); api.glow(D.dragon.x, D.dragon.z + 3, 6, AMBER, 0.12);
      } catch (e) { ej = null; }
    }
    yield;

    // ── yan alan: Gizli Maden Odası altın sandığı (yaklaşınca açılır), kaydırak sonunda fener ──
    if (D.hide) { const kk = new Kit(); kk.add(G.box(), 0x8a5a34, [0, 0.3, 0], null, [0.9, 0.6, 0.6]); kk.add(G.box(), AMBER, [0, 0.62, 0], null, [0.96, 0.12, 0.66]); crystalKit(kk, AMBER, 0.45, false);
      const m = kitMesh(api, kk, { name: 'magara-sandik', emissive: AMBER, ei: 0.15 }); m.position.set(D.hide.x, 0, D.hide.z); api.add(m); api.glow(D.hide.x, D.hide.z, 3, AMBER, 0.2); api.solid(D.hide.x, D.hide.z, 0.6, 'sandik'); }
    if (D.slide) { const kk = new Kit(); crystalKit(kk, TURQ, 0.8, false); const m = kitMesh(api, kk, { name: 'magara-fener', emissive: TURQ, ei: 0.2 }); m.position.set(D.slide.x, 0, D.slide.z); api.add(m); api.glow(D.slide.x, D.slide.z, 3, TURQ, 0.18); }

    // ════════════════ Canlı dünya ════════════════
    let tt = 0, intro = 0, lastArea = -9, areaT = 0, ejCrN = 0, bilboHop = 0;
    api.anim((dt, hx, hz) => {
      tt += dt; qT += dt; R.t += dt;
      if (!inZone()) return;
      for (let i = Q.length - 1; i >= 0; i--) if (qT >= Q[i].at && live()) { const q = Q.splice(i, 1)[0]; try { q.fn(); } catch (e) { /* yok */ } }
      const p = GAME.P, ai = p.area ?? -1;
      if (ai !== lastArea) { lastArea = ai; areaT = 0; } areaT += dt;
      for (const d of kapiAnim) if (d.open && d.t < 1) { d.t = Math.min(1, d.t + dt * 1.3); d.grp.position.y = -d.t * 3.2; d.grp.scale.setScalar(1 - d.t * 0.25); if (d.t >= 1) d.grp.visible = false; }
      if (live()) {
        intro += dt;
        if (intro > 7 && ai === 0) say('b05_giris', { gap: 6 });
        if (intro > 12 && ai === 0) say('pp_b05_giris', { gap: 4 });
        if (ai === 1 && areaT > 3) { say('b05_pit', { gap: 6 }); if (areaT > 8) say('pp_b05_pit', { gap: 4 }); if (areaT > 30) say('b05_salyangoz', { gap: 10 }); }
        if (ai === 2 && areaT > 2.5) say('b05_hav', { gap: 6 });
        if (ai === 2 && areaT > 6) say('pp_b05_hav', { gap: 4 });
        if (ai === 3 && areaT > 25) say('b05_dev', { gap: 12 });
        puzzleTick(R.p1, dt, hx, hz, tt); puzzleTick(R.p2, dt, hx, hz, tt);
        softDoor(doors[2], R.p1, dt, hx, hz); softDoor(doors[4], R.p2, dt, hx, hz);
        // ── Bilbo bulma sahnesi ──
        if (bilboM) {
          const b = D.bilbo, d = hyp(hx - b.x, hz - b.z);
          if (R.bilbo === 'yok') {
            bilboM.root.rotation.y = Math.atan2(hx - b.x, hz - b.z) * 0.0 + Math.sin(tt * 0.5) * 0.6;
            bilboM.update(dt, { speed: 0, sniff: true, bark: 0, happy: 0 });
            // QA: yol Bilbo'nun 3 m yakınından geçmeyebiliyordu (tohum 1, 4: Bilbo hiç bulunmadı, takıma katılmadı) → 7 m; Feza alanı yine de
            // geçip gittiyse Bilbo koşup yanına gelir (sahne Feza'nın yanında oynar)
            if (d >= 7 && ai > 2 && ai < 5) { let bx = hx + 2.2, bz = hz + 1.2;   // QA (görsel): Feza'nın yanında BOŞ yer seç (Bilbo kristalin/kayanın içinde beliriyordu)
              try { const Lv = GAME.L; for (let k = 0; k < 12; k++) { const a = 0.6 + k * PI / 6, x = hx + Math.sin(a) * 2.3, z = hz + Math.cos(a) * 2.3; if (LEVEL.isFloor(Lv, x, z) && LEVEL.circleFree(Lv, x, z, 0.7)) { bx = x; bz = z; break; } } } catch (e) { /* yok */ }
              b.x = bx; b.z = bz; bilboM.root.position.set(b.x, 0, b.z); }
            if (d < 7 || (ai > 2 && ai < 5)) { R.bilbo = 'bulundu'; R.bilboT = 0; say('b05_bilbo_bulundu', { gap: 0, force: true, prio: 3 }); sfx('bilboBark', { x: b.x, z: b.z, vol: 0.5, pitch: 1.2 }); }
          } else if (R.bilbo === 'bulundu') {
            R.bilboT += dt; bilboM.root.rotation.y = dampAngle(bilboM.root.rotation.y, Math.atan2(hx - b.x, hz - b.z), 5, dt);
            bilboM.update(dt, { speed: 0, sniff: R.bilboT < 3.0, bark: 0, happy: R.bilboT > 3.2 ? 1 : 0 });
            if (R.bilboT > 3.3 && !R.said1) { R.said1 = true; say('pp_b05_bilbo_adi', { gap: 0, force: true, prio: 3 }); pointTo(b.x, b.z); }
            if (R.bilboT > 5.6 && !R.said2) { R.said2 = true; sfx('bilboBark', { x: b.x, z: b.z, vol: 0.8, pitch: 1.1 }); burst('hearts', b.x, 1.4, b.z, { count: 8 }); ring(b.x, b.z, 2.6, '#ffe397'); try { GAME.storyCheer(1.6, false); } catch (e) { /* yok */ } }
            if (R.bilboT > 6.6) { R.bilbo = 'katildi'; bilboM.root.visible = false;
              try { GAME.yoldas.ac('bilbo', true); } catch (e) { /* yok */ }
              try { if (typeof COMPANION !== 'undefined' && COMPANION.register) COMPANION.register('bilbo', { ad: 'Bilbo', bekleme: 14, ilkBekleme: 5, sure: 2.2, esik: 0.35, canEsik: 0.35, dusman: 4, etkin: () => !!(GAME.yoldas.get('bilbo') && GAME.yoldas.get('bilbo').on), eylem: () => { try { return !!GAME.bilboHavla(); } catch (e) { return false; } } }); } catch (e) { /* yok */ }
              say('b05_bilbo_katildi', { gap: 0, force: true, prio: 3 }); }   // ("Bilbo'ya bin, dokun yeter" denmez: binme düğmesi oyunda yok)
          }
        }
        // ── ejderha ──
        if (ej && cover) {
          const dg = D.dragon, d = hyp(hx - dg.x, hz - dg.z);
          if (R.ejder === 0) { if (d < 40) cover.scale.y = 1 + 0.03 * Math.sin(tt * 1.15); }   // "dağ nefes alıyor": kaya yığını yavaşça kabarıp iner
          else ej.update(dt);
          if (R.ejder === 0 && (d < 12.5 || (ai === 4 && areaT > 1.5 && d < 20))) {   // QA: ejderha oda kenarının 4 m ötesinde; yol oda ortasından geçince 9 m'ye hiç girilmiyordu → sahne kaçıyordu
            R.ejder = 1; R.ejderT = 0; say('b05_dag', { gap: 0, force: true, prio: 3 }); sfx('rumble', { x: dg.x, z: dg.z, vol: 0.3, pitch: 0.7 });
            // QA: ejderha ekranın üst kenarının dışında kalıyordu (yalnız kuyruk ucu görünüyordu) → kısa, atlanabilir kamera bakışı (~6 sn, sonra Feza'ya döner)
            // CİLA: kamera biraz geride durur → ejderhanın tamamı ekrana sığar (eskiden kafası ekranı kaplıyordu); dikey ekranda daha da geride
            const dik = typeof camera !== 'undefined' && camera && camera.aspect < 0.9;
            try { if (GAME.sinematik && GAME.sinematik.oyna) GAME.sinematik.oyna({ adimlar: [{ sure: 6.4, bak: { x: dg.x, z: dg.z + 1.6, y: 2.2 }, zoom: dik ? 1.45 : 1.32, gecis: 1.2 }, { sure: 1.3, gecis: 1.0 }], atlanabilir: true }); } catch (e) { /* yok */ } }
          if (R.ejder === 1) {
            // CİLA: kaya örtüsü yumuşakça yayılıp yere iner (battaniye gibi kayar); ejderha kayalar yarıya inince görünür (kaya içinden taşma yok)
            R.ejderT += dt; const u = clamp((R.ejderT - 1.2) / 1.9, 0, 1), e = u * u * (3 - 2 * u);
            cover.position.y = -e * 1.6; cover.scale.set(1 + e * 0.3, Math.max(0.02, 1 - e * 0.98), 1 + e * 0.3); cover.rotation.z = Math.sin(R.ejderT * 20) * 0.01 * (1 - u);
            ej.root.visible = e > 0.42;
            if (R.ejderT > 2.0 && !R.ejS1) { R.ejS1 = true; say('pp_b05_dag', { gap: 0, force: true, prio: 3 }); }
            if (u >= 1) { R.ejder = 2; R.ejderT = 0; cover.visible = false; }
          }
          if (R.ejder === 2) {
            R.ejderT += dt;
            if (R.ejderT > 2.5 && !R.said3) { R.said3 = true; say('pp_b05_dag2', { gap: 0, force: true }); }
            if (ejCr && ejCr.per) {   // sırt kristalleri soldan sağa: kamera bakışı bitmeden tamamlanır (tek parça; görünen kristal sayısı kadar çizilir)
              const n = Math.min(ejCr.n, Math.floor(R.ejderT / 0.45));
              if (ejCrN < n) { while (ejCrN < n) { ejCrN++; sfx('chime', { x: dg.x, z: dg.z, vol: 0.4, pitch: 0.9 + ejCrN * 0.08 }); } ejCr.m.geometry.setDrawRange(0, ejCr.per * ejCrN); ejCr.m.visible = true; }
              if (ejCrN) ejCr.m.material.emissiveIntensity = 0.38 + 0.2 * Math.sin(tt * 1.8);
            }
            if (R.ejderT > 7 && !R.said4) { R.said4 = true; say('b05_ejder_sirt', { gap: 4 }); }
          }
        }
        // ── renk yankısı ──
        const E = R.echo;
        if (E) echoTick(E, dt, hx, hz);
        // ── gizli sandık ──
        if (D.hide && !R.gizli && hyp(hx - D.hide.x, hz - D.hide.z) < 1.9) { R.gizli = true; say('b05_gizli_oda', { gap: 2 }); sfx('unlock'); burst('sparkle', D.hide.x, 0.9, D.hide.z, { color: '#ffe08a', count: 20 }); try { GAME.dropSugar(D.hide.x, D.hide.z, 20, 8); GAME.giveSticker('gizli_magara_kulube', 'gizli'); } catch (e) { /* yok */ } }
      } else if (bilboM && R.bilbo !== 'katildi') bilboM.update(dt, { speed: 0, sniff: true });
    });
    function echoTick(E, dt, hx, hz) {
      const D2 = D.echo; if (!D2) return;
      for (let i = 0; i < 4; i++) {
        const p = D2.pts[i], d = hyp(hx - p.x, hz - p.z);
        E.gl[i] = Math.max(0, E.gl[i] - dt * 1.2);
        if (d < 2.1 && !E.inn[i]) { E.inn[i] = true; E.gl[i] = 1; sfx('bell', { x: p.x, z: p.z, pitch: NOTE[i].p, vol: 0.7 }); burst('sparkle', p.x, 1.4, p.z, { color: NOTE[i].h, count: 6 }); }
        else if (d > 2.8) E.inn[i] = false;
        E.items[i].material.emissiveIntensity = 0.16 + E.gl[i] * 0.9;
      }
    }
    // test kancası: bulmacayı çözdürür
    MAGARA.qa = {
      solve(k) { const P = k === 2 ? R.p2 : R.p1; if (!P) return false; P.srcOn = true; P.dirty = true; return true; },
      echoSolve() { return true; },   // renk yankısı kaldırıldı (eski test kancası uyumu)
      bilbo() { R.bilbo = 'bulundu'; R.bilboT = 0; return true; },
      R, D, doors,
    };
  }

  // ════════════════ Son süslemeler: çıkış kapısı (maden arabası rayı) ════════════════
  function kurSon(L, api) {
    api = sadeApi(api);
    const ex = L.exit; if (!ex) return;
    const THREE = api.THREE, k = new Kit();
    const po = L.portalObj && L.portalObj.obj, px = po ? po.position.x : ex.x, pz = po ? po.position.z : ex.z, yaw = po ? po.rotation.y : 0;
    const cs = Math.cos(yaw), sn = Math.sin(yaw), at = (lx, y, lz) => [px + lx * cs + lz * sn, y, pz - lx * sn + lz * cs];
    for (let i = 0; i <= 12; i++) { const t = i / 12 * PI, p = at(Math.cos(t) * 3, Math.max(0.4, Math.sin(t) * 3.4 + 0.4), -0.6), c = [AMBER, TURQ, LEAF, CORAL][i % 4]; k.add(G.octa(), c, p, [0, 0, t - PI / 2], [0.12, 0.36, 0.12]); }
    const gm = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(0.9, 0.9, 0.9) });
    const mesh = new THREE.Mesh(k.build(), gm); mesh.name = 'magara-cikis-kemeri'; api.add(mesh); api.dispose(gm); api.dispose(mesh.geometry);
    api.glow(px, pz, 4, 0xffe8b0, 0.22); api.light(px, 3.2, pz + 0.8, 0xffe8b0, 3, 10, 0.1);
    let t = 0, on = 0;
    api.anim(dt => { t += dt; const b = typeof GAME !== 'undefined' ? GAME.boss : null, open = !!(L.portalObj && L.portalObj.active) || !!(b && b.dead && b.type === 'ustaKostebek') || !(b && b.type === 'ustaKostebek'); on = damp(on, open ? 1 : 0, 1.5, dt); gm.color.setScalar(0.75 + on * (1.2 + 0.5 * Math.sin(t * 3))); });
  }

  BOLUM.define('magara', {
    ad: 'Köstebek ve Salyangoz Mağarası',
    taban: 'cave',
    size: 110, side: 2,
    areas: [{ id: 'a1', ad: 'Çark Deresi Ağzı', rooms: 2 }, { id: 'a2', ad: 'Pıt Pıt Madeni', rooms: 2 }, { id: 'a3', ad: 'Salyangoz Bahçesi', rooms: 2 }, { id: 'a4', ad: 'Yankı Salonu', rooms: 2 }, { id: 'a5', ad: 'Uyuyan Ejderha Mağarası', rooms: 1 }],
    muzik: 'magara',
    malzeme: 'isik5',
    kayipEsya: null,
    final: false,
    isik: { fog: [0x26344c, 34, 90], hemiSky: 0xa4bce6, hemiGround: 0x4a5a62, hemi: 0.95, sunColor: 0xdce8ff, sun: 1.25, sunOffset: [-12, 26, 12],
      env: [0x8aa4d0, 0xb8c8e8, 0x4a5a62, 0.8], bloom: 0.22, exposure: 1.12, sat: 1.06, vig: 0.28, fezaLight: 1.7, fezaLightColor: 0xfff0d8, moss: [0x5ab0a0, 0.2], rim: [0xcfe0ff, 0.14] },
    zemin: { soluk: 0.45, tA: 0xa9b8cc, tB: 0xd8d2bc, tC: 0x8cc0b4, out: 0x141a26, outAmt: 0.8, macro: 0xdce8ff },
    minimap: { zemin: '#7a8ca8' },
    harita: { ad: 'Köstebek ve Salyangoz Mağarası', detay: 'Çark kristalleri, ışık kapıları, Bilbo ve Usta Köstebek', renk: '#e0a640', x: 62, y: 84, simge: '💎' },
    yolculuk: { arac: 'vagon', cumle: 'Maden arabası bizi yıldızlı göğe çıkarıyor!' },
    parcaIpucu: 'Sıradaki ışık gecenin en tepesinde, bulutların üstünde.',
    yerlesim,
    kur,
    kurSon,
  });
  function hook() {
    if (typeof GAME === 'undefined' || !GAME || !GAME.on) { setTimeout(hook, 250); return; }
    GAME.on('zone', () => { said.clear(); sayAt = -99; });
    GAME.on('happy', e => {
      if (!inZone() || !e) return;
      if (e.boss) {
        later(2.5, () => say('b05_isik', { gap: 1, force: true }));
        try { if (typeof ITEMS !== 'undefined' && ITEMS.make && ITEMS.BASES && ITEMS.BASES.hat.some(b => b.id === 'madencifeneri')) GAME.addItem(ITEMS.make('hat', 'madencifeneri', 2, 5)); } catch (err) { /* yok */ }
        return;
      }
      if (!said.has('pp_b05_ilk_nese')) say('pp_b05_ilk_nese', { gap: 1 });
      else if (Math.random() < 0.1) say(['pp_b05_aferin1', 'pp_b05_aferin2', 'pp_b05_aferin3'][(Math.random() * 3) | 0], { once: false, gap: 25 });
    });
    GAME.on('boss', o => { if (inZone() && o && o.on && o.type === 'ustaKostebek') say('pp_b05_boss', { gap: 4 }); });
  }
  hook();
  return { R, qa: null };
})();
