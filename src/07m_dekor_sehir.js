/* ── SEHIR_DEKOR: Bölüm 8 (Surlu Şehir) çevre süsleri — YAPI parçalarını yürünür alanın çevresine yerleştirir (E8910) ──
   06z_sehir.js kur() içinden:  SEHIR_DEKOR.olustur(L, api, Z)  (Z = L.sh; Z.vis.k kasaba uyandıkça 0.4 → 1 olur)
   Katmanlar: ön bant (alçak: tezgâh, lamba, saksı, araba, fıçı, bank, ağaç) · evler (ahşap çerçeveli, 12 çeşit) · sur + kuleler (uzak kontur)
   · saat kulesi (kuzeyde uzak kahraman) · bayrak ipleri/sancaklar/tenteler (uyanan renk: gri → renkli, tek çizim).
   Yürünür alan ve oyun nesneleri açık kalır: yalnızca yürünmez alana, kamera önünde (güney) alçak. */
if (typeof ZEMIN !== 'undefined' && ZEMIN.TEMA && ZEMIN.TEMA.sehir) Object.assign(ZEMIN.TEMA.sehir, { out: 0x5a8c3e, outK: 0.45,   // kenar zemini daha açık çimen (evlerin dibi çok karanlık kalmasın)
  // bal rengi kaldırım: taşların ortasındaki yeşil yosun lekeleri (alt=çimen yaması) karmaşık görünüyordu → sıcak bal tonlu taş yaması, az yosun
  alt: [7, 0xa8865e, 0xf2d29e, 0xfae6c0], patch: 0.24, pmoss: 0.14 });
const SEHIR_DEKOR = (() => {
  'use strict';
  const Y = YAPI, PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  // yürünür hücrelere en yakın mesafe + en yakın hücre (iki geçişli talaş mesafesi)
  function mesafeAlani(L, M = 46) {
    const W = L.W + M * 2, H = L.H + M * 2, N = W * H, d = new Float32Array(N).fill(1e9), sx = new Int16Array(N), sz = new Int16Array(N);
    for (let j = 0; j < L.H; j++) for (let i = 0; i < L.W; i++) if (L.grid[j * L.W + i]) { const k = (j + M) * W + i + M; d[k] = 0; sx[k] = i; sz[k] = j; }
    const rel = (k, k2, c) => { const nd = d[k2] + c; if (nd < d[k]) { d[k] = nd; sx[k] = sx[k2]; sz[k] = sz[k2]; } };
    for (let it = 0; it < 2; it++) {
      for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) { const k = j * W + i; rel(k, k - 1, 1); rel(k, k - W, 1); rel(k, k - W - 1, 1.414); rel(k, k - W + 1, 1.414); }
      for (let j = H - 2; j > 0; j--) for (let i = W - 2; i > 0; i--) { const k = j * W + i; rel(k, k + 1, 1); rel(k, k + W, 1); rel(k, k + W + 1, 1.414); rel(k, k + W - 1, 1.414); }
    }
    return { M, W, H, at(x, z) { const i = Math.floor(x) + M, j = Math.floor(z) + M; if (i < 1 || j < 1 || i >= W - 1 || j >= H - 1) return null; const k = j * W + i; return d[k] > 1e8 ? null : { d: d[k], fx: sx[k] + 0.5, fz: sz[k] + 0.5 }; } };
  }
  function olustur(L, api, Z) {
    const rnd = api.rnd, put = api.put, TH = typeof THREE !== 'undefined' ? THREE : api.THREE;
    const DF = mesafeAlani(L), grid = L.grid;
    const used = [], cell = new Map();
    const hk = (x, z) => ((Math.floor(x / 6) + 500) * 1000 + Math.floor(z / 6) + 500);
    const free = (x, z, r) => { const cx = Math.floor(x / 6), cz = Math.floor(z / 6); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const q = cell.get((cx + a + 500) * 1000 + cz + b + 500); if (q) for (const u of q) if (hyp(u.x - x, u.z - z) < u.r + r) return false; } return true; };
    const claim = (x, z, r, g = false) => { const k = hk(x, z); let q = cell.get(k); if (!q) cell.set(k, q = []); q.push({ x, z, r, g }); used.push({ x, z, r }); };
    // g: kamera önünde kaldığı için gizlenen evin yeri ("hayalet"); yalnız alçak pazar bandı bu yerleri kullanabilir
    const freeP = (x, z, r) => { const cx = Math.floor(x / 6), cz = Math.floor(z / 6); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const q = cell.get((cx + a + 500) * 1000 + cz + b + 500); if (q) for (const u of q) if (hyp(u.x - x, u.z - z) < (u.g ? 0.8 + r * 0.5 : u.r + r)) return false; } return true; };   // (hayalet evin ortasında kalan küçük çalıya da değmesin)
    const floorAt = (x, z) => { const i = Math.floor(x), j = Math.floor(z); return i >= 0 && j >= 0 && i < L.W && j < L.H && grid[j * L.W + i] > 0; };
    const southFront = (x, z) => { for (let t = 2; t <= 10; t += 2) for (const o of [0, -3, 3]) if (floorAt(x + o, z - t)) return true; return false; };
    const keep = (x, z, r) => {
      if (L.start && hyp(x - L.start.x, z - L.start.z) < r + 2) return true;
      if (L.exit && hyp(x - L.exit.x, z - L.exit.z) < r + 3) return true;
      return false;
    };
    const st = { ev: 0, tezgah: 0, lamba: 0, sur: 0, kule: 0, agac: 0, diger: 0 };
    const MESH = 'shinyNS';
    const awake = [];   // {geo, x,y,z, sx,sy,sz, yaw}
    const pr = (g, x, y, z, s, yaw, col = 0xffffff, mk = MESH, sy) => put(g, x, y, z, s, sy ?? s, s, col, yaw || 0, 0, 0, mk);
    // alçak pazar süsü (≤ 2,6 m): dar gizleme kuralı (Z.lowHides) — yolların güneyi bomboş çimen kalmasın; yürünür alanın dibine konmaz
    const prL = (g, x, y, z, s, yaw, h) => {
      if (Z && Z.putRaw && Z.lowHides) { if (Z.lowHides(x, z, h)) return false; Z.putRaw(g, x, y, z, s, s, s, 0xffffff, yaw || 0, 0, 0, MESH); return true; }
      pr(g, x, y, z, s, yaw); return true;
    };
    const putYapi = (p, x, z, s, yaw, y = 0) => { pr(p.m, x, y, z, s, yaw); if (p.g) pr(p.g, x, y, z, s, yaw, 0xffffff, 'glow'); };
    const snap = a => Math.round(a / (PI / 8)) * (PI / 8);
    const toward = (x, z, f) => Math.atan2(f.fx - x, f.fz - z);   // +z yerel ön yüz → yürünür alana bak
    const pick = a => a[(rnd() * a.length) | 0];
    const lampsAt = [], lampG = [];
    // ── zemin kenarı konumları: d (hücre mesafesi) aralığında rastgele, ön bant ve arka alan ayrı ──
    const bb = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 };
    for (let j = 0; j < L.H; j++) for (let i = 0; i < L.W; i++) if (grid[j * L.W + i]) { bb.x0 = Math.min(bb.x0, i); bb.x1 = Math.max(bb.x1, i); bb.z0 = Math.min(bb.z0, j); bb.z1 = Math.max(bb.z1, j); }
    const cands = [];
    for (let z = bb.z0 - 36; z <= bb.z1 + 36; z += 1.7) for (let x = bb.x0 - 36; x <= bb.x1 + 36; x += 1.7) {
      const xx = x + (rnd() - 0.5) * 1.6, zz = z + (rnd() - 0.5) * 1.6, f = DF.at(xx, zz);
      if (!f || f.d < 1.8 || floorAt(xx, zz)) continue;
      cands.push({ x: xx, z: zz, f });
    }
    // sıralama: yakından uzağa (ön bant önce dolsun)
    cands.sort((a, b) => a.f.d - b.f.d);
    // ── 2) evler: ikinci sıra (d 3.2–16); güney önünde alçak sınırı yok (ev yüksek: yalnız kuzey/yan veya d>9) ──
    const placedHouses = [];
    for (const c of cands) {
      const d = c.f.d; if (d < 3.4 || d > 17) continue;
      const k = (rnd() * 12) | 0, e = Y.ev(k), s = 0.95 + rnd() * 0.35, R = Math.max(e.w, e.d) * s * 0.55 + 0.45;
      if (rnd() > (d < 9 ? 0.95 : 0.6)) continue;
      if (southFront(c.x, c.z) && d < 9.5 && e.h * s > 3.4) continue;
      if (api.linkDist(c.x, c.z) < R + 0.6 || keep(c.x, c.z, R) || !free(c.x, c.z, R)) continue;
      // ayak izi tamamen yürünmez olmalı
      let ok = true; for (let a = 0; a < 8 && ok; a++) if (floorAt(c.x + Math.sin(a * PI / 4) * R, c.z + Math.cos(a * PI / 4) * R)) ok = false; if (!ok) continue;
      const yaw = snap(toward(c.x, c.z, c.f));
      const gz = !!(Z && Z.southHides && Z.southHides(c.x, c.z, e.h * s));
      pr(e.m, c.x, 0, c.z, s, yaw); claim(c.x, c.z, R, gz); if (!gz) placedHouses.push({ x: c.x, z: c.z, s, yaw, h: e.h * s }); st.ev++;
    }
    // ── 1) ön bant (d 2.2–4.6): lamba, tezgâh, saksı, fıçı, araba, bank, küçük ağaç ──
    let lampGap = 0;
    for (const c of cands) {
      const d = c.f.d; if (d < 2.4 || d > 5.2) continue;
      if (api.linkDist(c.x, c.z) < 2.2 || keep(c.x, c.z, 1)) continue;
      const yaw = snap(toward(c.x, c.z, c.f)), r0 = rnd();
      if (r0 < 0.45 && free(c.x, c.z, 4.2)) {   // sokak lambası: aralıklı
        if (lampsAt.some(q => hyp(q.x - c.x, q.z - c.z) < 8.5)) continue;
        pr(Y.lamba().m, c.x, 0, c.z, 1, yaw); lampG.push({ geo: Y.lamba().g, x: c.x, y: 0, z: c.z, sx: 1, sy: 1, sz: 1, yaw, tint: [1, 1, 1] }); api.glow(c.x + Math.sin(yaw) * 0.6, c.z + Math.cos(yaw) * 0.6, 3.2, 0xffd890, 0.16); if (lampsAt.length < 14) api.light(c.x + 0.5, 2.3, c.z, 0xffcf88, 2.2, 7.5, 0.1);
        claim(c.x, c.z, 1.6); lampsAt.push({ x: c.x, z: c.z, yaw }); st.lamba++;
      } else if (r0 < 0.6 && free(c.x, c.z, 2.0)) {   // pazar tezgâhı
        const k = (rnd() * 5) | 0, t = Y.tezgah(k), s = 1.0 + rnd() * 0.15;
        if (prL(t.m, c.x, 0, c.z, s, yaw, 2.6)) awake.push({ geo: t.a, x: c.x, y: 0, z: c.z, sx: s, sy: s, sz: s, yaw, low: true });   // (tente gövdeyle aynı kuralla: havada tente kalmasın)
        for (const q of [[-0.7, 0.9], [0.1, 1.2], [0.8, 0.8]]) if (rnd() < 0.5 && isFinite(q[0])) { /* tezgâh önü boş bırak */ }
        claim(c.x, c.z, 2.2); st.tezgah++;
      } else if (r0 < 0.72 && free(c.x, c.z, 1.0)) {
        const m = rnd();
        if (m < 0.34) { prL(Y.fici().m, c.x, 0, c.z, 1 + rnd() * 0.3, rnd() * TAU, 1.1); prL(Y.fici().m, c.x + 0.6, 0, c.z + 0.2, 0.9, rnd() * TAU, 1.1); claim(c.x, c.z, 1.1); }
        else if (m < 0.6) { prL(Y.sandik().m, c.x, 0, c.z, 1.1, yaw, 1.0); prL(Y.sandik().m, c.x + 0.1, 0.5, c.z, 0.8, yaw + 0.4, 1.0); claim(c.x, c.z, 0.9); }
        else if (m < 0.8) { prL(Y.saksi((rnd() * 4) | 0).m, c.x, 0, c.z, 1.1 + rnd() * 0.4, rnd() * TAU, 1.0); prL(Y.saksi((rnd() * 4) | 0).m, c.x + 0.7, 0, c.z - 0.2, 0.9, rnd() * TAU, 1.0); claim(c.x, c.z, 1.1); }
        else { prL(Y.bank().m, c.x, 0, c.z, 1.2, yaw, 1.0); claim(c.x, c.z, 1.1); }
        st.diger++;
      } else if (r0 < 0.78 && free(c.x, c.z, 2.0)) {
        const a = Y.araba((rnd() * 2) | 0); prL(a.m, c.x, 0, c.z, 1.1, yaw + PI / 2 + (rnd() - 0.5) * 0.5, 1.2); claim(c.x, c.z, 1.7); st.diger++;
      } else if (r0 < 0.9 && free(c.x, c.z, 2.3)) {   // küçük meyve/süs ağacı
        const h = 3.4 + rnd() * 1.8; PROPKIT.placeTree(api, rnd() < 0.5 ? 'round' : 'fruit', (rnd() * 4) | 0, c.x, c.z, h, { y: -0.06 * h, yaw: rnd() * TAU, mat: 'shinyNS', leaf: pick([0xb8dc78, 0x9fd070, 0xc4e080, 0x8cc86c]), fruit: pick([0xff7a6a, 0xffd060, 0xffa0b8]) }); claim(c.x, c.z, 1.7); st.agac++;
      }
    }
    // ── 1b) pazar bandı: yolların güneyindeki/aralarındaki boş çimene (kamera önünde gizlenen evlerin yeri) alçak pazar süsleri
    //        (tezgâh, araba, fıçı+sandık, bank+saksı; ≤ 2,6 m). Kamera bunların üstünden bakar; yürünür alanın dibine konmaz (Z.lowHides). ──
    if (Z && Z.lowHides && Z.putRaw) {
      let nP = 0; const perRoom = new Map(), RM = L.rooms || [];
      const roomOf = (x, z) => { let bi = -1, bd = 1e9; for (let i = 0; i < RM.length; i++) { const dd = hyp(RM[i].x - x, RM[i].z - z) - (RM[i].r || 8); if (dd < bd) { bd = dd; bi = i; } } return bi; };
      for (const c of cands) {
        const d = c.f.d; if (d < 3.2 || d > 10 || nP >= 40 || rnd() > 0.3) continue;
        const ri = roomOf(c.f.fx, c.f.fz); if ((perRoom.get(ri) || 0) >= 4) continue;   // her meydana birkaç tane: hepsi ilk odalara yığılmasın
        if (api.linkDist(c.x, c.z) < 2.8 || keep(c.x, c.z, 2) || !freeP(c.x, c.z, 2.3)) continue;
        const yaw = snap(toward(c.x, c.z, c.f)), r0 = rnd();
        if (r0 < 0.42) { const k = (rnd() * 5) | 0, t = Y.tezgah(k), s = 1.0 + rnd() * 0.1; if (!prL(t.m, c.x, 0, c.z, s, yaw, 2.6)) continue; awake.push({ geo: t.a, x: c.x, y: 0, z: c.z, sx: s, sy: s, sz: s, yaw, low: true }); claim(c.x, c.z, 2.3); }
        else if (r0 < 0.62) { if (!prL(Y.araba((rnd() * 2) | 0).m, c.x, 0, c.z, 1.1, yaw + PI / 2 + (rnd() - 0.5) * 0.5, 1.2)) continue; claim(c.x, c.z, 1.8); }
        else if (r0 < 0.82) { if (!prL(Y.fici().m, c.x, 0, c.z, 1.1, rnd() * TAU, 1.1)) continue; prL(Y.fici().m, c.x + 0.65, 0, c.z + 0.25, 0.95, rnd() * TAU, 1.1); prL(Y.sandik().m, c.x - 0.6, 0, c.z + 0.3, 1.1, yaw, 1.0); claim(c.x, c.z, 1.4); }
        else { if (!prL(Y.bank().m, c.x, 0, c.z, 1.2, yaw, 1.0)) continue; prL(Y.saksi((rnd() * 4) | 0).m, c.x + Math.cos(yaw) * 1.0, 0, c.z - Math.sin(yaw) * 1.0, 1.2, rnd() * TAU, 1.0); prL(Y.saksi((rnd() * 4) | 0).m, c.x - Math.cos(yaw) * 1.0, 0, c.z + Math.sin(yaw) * 1.0, 1.2, rnd() * TAU, 1.0); claim(c.x, c.z, 1.6); }
        nP++; st.pazar = nP; perRoom.set(ri, (perRoom.get(ri) || 0) + 1);
      }
    }
    // ev aralarına: ağaç, saksı, fıçı, lamba (kuzey tarafı serbest alan)
    for (const c of cands) {
      const d = c.f.d; if (d < 3.5 || d > 20 || rnd() > 0.12) continue;
      if (api.linkDist(c.x, c.z) < 2.4 || keep(c.x, c.z, 1) || !free(c.x, c.z, 1.8)) continue;
      const h = 4.5 + rnd() * 3.5, tall = southFront(c.x, c.z) && d < 9;
      PROPKIT.placeTree(api, tall ? 'fruit' : pick(['round', 'round', 'pine', 'fruit']), (rnd() * 4) | 0, c.x, c.z, tall ? h * 0.55 : h, { y: -0.06 * h, yaw: rnd() * TAU, mat: 'shinyNS', leaf: pick([0xb0d878, 0x98cc70, 0xc8e088, 0x86c068]), fruit: pick([0xff7a6a, 0xffd060, 0xffa0b8]) });
      claim(c.x, c.z, 1.8); st.agac++;
    }
    // ── 2b) çalı + çiçek öbekleri: evlerin diplerinde ve yol kenarında (alçak, yürünmez alan) ──
    for (const c of cands) {
      const d = c.f.d; if (d < 2.0 || d > 9 || rnd() > 0.34) continue;
      if (api.linkDist(c.x, c.z) < 1.8 || keep(c.x, c.z, 1) || !free(c.x, c.z, 0.9)) continue;
      const bsh = PROPKIT.bush((rnd() * 4) | 0), s0 = 0.9 + rnd() * 0.9, yw = rnd() * TAU;
      put(bsh.leaf, c.x, 0, c.z, s0, s0 * 0.9, s0, pick([0x6cb85a, 0x5aa850, 0x7cc860, 0x4f9a56]), yw, 0, 0, 'shinyNS');
      for (let q = 0, n = 1 + ((rnd() * 3) | 0); q < n; q++) put(PROPKIT.flower((rnd() * 5) | 0), c.x + (rnd() - 0.5) * 1.8, 0, c.z + (rnd() - 0.5) * 1.8, 1.1, 1.1, 1.1, 0xffffff, rnd() * TAU, 0, 0, 'decor');
      claim(c.x, c.z, 0.9); st.diger++;
    }
    // ── 3) sur + kuleler: d ≈ 20–23 kontur boyunca, teğet yönde (uzak silüet) ──
    let lastT = -9;
    const wallCand = cands.filter(c => c.f.d > 19.5 && c.f.d < 23.5).sort((a, b) => (a.x * 0.37 + a.z * 0.61) - (b.x * 0.37 + b.z * 0.61));
    for (const c of wallCand) {
      if (!free(c.x, c.z, 2.2) || keep(c.x, c.z, 4)) continue;
      const yaw = toward(c.x, c.z, c.f);   // ön yüz (+z) yürünür alana bakar → uzun eksen teğet
      if (st.sur - lastT > 3 && rnd() < 0.7) { const kk = (rnd() * 3) | 0, t = Y.kule('sehir', kk), s = 1.1 + rnd() * 0.4; putYapi(t, c.x, c.z, s, rnd() * TAU); awake.push({ geo: Y.bez(1.1, 1.5, Y.STRIPE[(rnd() * 5) | 0], 0, { tail: true }), x: c.x + 0.05, y: (t.top + 0.35) * s, z: c.z, sx: s, sy: s, sz: s, yaw: rnd() * TAU }); claim(c.x, c.z, 3.2); lastT = st.sur; st.kule++; st.sur++; continue; }
      putYapi(Y.sur('sehir', (rnd() * 2) | 0), c.x, c.z, 1.0, yaw); claim(c.x, c.z, 2.2); st.sur++;
    }
    // ── 4) saat kulesi: kuzeyde (kule odalarının kuzeyi) + çok uzak ikinci siluet ──
    const saat = Y.saatKulesi();
    if (Z.tower && Z.tower.a) { const a = Z.tower.a; let ok = false, px = a.x, pz = a.z - a.r - 5; for (let t = 0; t < 14 && !ok; t++) { pz = a.z - a.r - 3.5 - t * 1.2; px = a.x + (t % 2 ? 1 : -1) * t * 0.5; ok = !floorAt(px, pz) && DF.at(px, pz) && DF.at(px, pz).d > 3; } if (ok) { putYapi(saat, px, pz, 1.25, 0); claim(px, pz, 5.5); st.saat = 1; } }
    { const ex = L.boss || L.exit || { x: bb.x0, z: bb.z0 }; const sx = ex.x + 10, sz = ex.z - 30; putYapi(saat, sx, sz, 1.9, 0.2); claim(sx, sz, 8); st.saat2 = 1; }
    // ── 5) bayrak iplerini lambalar arasına ger; sancaklar ──
    const KOL = [0xff6f61, 0xffd23f, 0x5aa9e6, 0x5ab870, 0xff9a4a];
    for (let i = 0; i < lampsAt.length; i++) for (let j = i + 1; j < lampsAt.length; j++) {
      const a = lampsAt[i], b = lampsAt[j], dd = hyp(a.x - b.x, a.z - b.z); if (dd < 7 || dd > 17 || a.u || b.u) continue;
      if (!(floorAt((a.x + b.x) / 2, (a.z + b.z) / 2) || true)) continue;
      a.u = b.u = true; const n = Math.max(4, Math.round(dd / 0.6)), yaw = Math.atan2(-(b.z - a.z), b.x - a.x), g = Y.bayrakIpi(n, i), len = n * 0.55;
      awake.push({ geo: g, x: a.x + Math.cos(0) * 0.0, y: 2.55, z: a.z, sx: dd / len, sy: 1, sz: 1, yaw, bx: a.x, bz: a.z });
    }
    for (const h of placedHouses) if (rnd() < 0.18 && h.h > 3.2) {   // çatıya sancak
      awake.push({ geo: Y.bez(1.0, 1.3, Y.STRIPE[(rnd() * 5) | 0], 0, { tail: true }), x: h.x, y: h.h * 1.0 + 0.9, z: h.z, sx: 1, sy: 1, sz: 1, yaw: rnd() * TAU, pole: 2.4 });
    }
    // ── 6) çeşme (başlangıç meydanı) ──
    if (Z.fountain) { const f = Z.fountain, c = Y.cesme(); pr(c.m, f.x, 0, f.z, 0.9, 0); api.glow(f.x, f.z, 4.2, 0xbfe8ff, 0.1); api.solid(f.x, f.z, 1.75, 'cesme'); claim(f.x, f.z, 2.2); }
    // ── 7) uyanan renk: tente + sancak + flama tek çizimde, doygunluk Z.vis.k ile ──
    if (lampG.length) { const lg = PROPKIT.bake(lampG), lm = Z.lampM || api.dispose(new TH.MeshBasicMaterial({ color: 0xcfc6a8 })); const lmesh = new TH.Mesh(lg, lm); lmesh.frustumCulled = false; api.add(lmesh); api.dispose(lg); }
    const mesh = bakeAwake(api, awake, Y);
    return { st, lampsAt, mesh, placedHouses };
  }
  // tente/sancak/flamalar: tek geometri, özel malzeme (doygunluk + rüzgâr); k=Z.vis.k 0.4→1
  function bakeAwake(api, list, Y) {
    const THREE_ = api.THREE;
    const items = list.filter(a => a.geo).map(a => ({ geo: a.geo, x: a.x, y: a.y, z: a.z, sx: a.sx, sy: a.sy, sz: a.sz, yaw: a.yaw, tint: [1, 1, 1], low: !!a.low }));
    // direkler (sancaklar için)
    for (const a of list) if (a.pole) items.push({ geo: Y.sancakDirek(), x: a.x, y: a.y - a.pole, z: a.z, sx: 0.6, sy: a.pole / 4, sz: 0.6, yaw: 0, tint: [1, 1, 1] });
    if (!items.length) return null;
    const geo = PROPKIT.bake(items);
    const fl = new Float32Array(geo.attributes.position.count); let o = 0;
    for (const it of (PROPKIT.sonSecilen || items)) { const uv = it.geo.attributes.uv, n = it.geo.attributes.position.count; for (let i = 0; i < n; i++) fl[o + i] = uv && uv.getX(i) > 35 ? uv.getY(i) : 0; o += n; }
    geo.setAttribute('aFl', new THREE_.BufferAttribute(fl, 1));
    const satU = { value: 0.45 }, mat = new THREE_.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0, side: THREE_.DoubleSide });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uSat = satU; sh.uniforms.uTime = TIME.u;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aFl; uniform float uTime;').replace('#include <begin_vertex>', `#include <begin_vertex>
        { float lvP = position.x * 1.7 + position.z * 1.3; transformed.x += sin(uTime * 3.4 + lvP + aFl * 2.0) * 0.07 * aFl; transformed.z += cos(uTime * 2.9 + lvP * 0.8 + aFl * 2.5) * 0.09 * aFl; transformed.y += sin(uTime * 4.1 + lvP) * 0.03 * aFl; }`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uSat;').replace('#include <color_fragment>', `#include <color_fragment>
        { float lvG = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11)); diffuseColor.rgb = mix(vec3(lvG * 0.92 + 0.06), diffuseColor.rgb, uSat); }`);
    };
    mat.customProgramCacheKey = () => 'sehirAwake';
    const mesh = new THREE_.Mesh(geo, mat); mesh.name = 'sehir-uyanis'; mesh.frustumCulled = false;
    api.add(mesh); api.dispose(mat); api.dispose(geo);
    api.anim(() => { const V = api.L && api.L.sh && api.L.sh.vis; const k = V ? V.k : 1; satU.value += ((0.45 + 0.55 * Math.min(1, Math.max(0, (k - 0.4) / 0.6))) - satU.value) * 0.05; });   // (başta da yarı renkli: tenteler bembeyaz değil; şehir uyandıkça tam renk)
    return mesh;
  }
  return { olustur, mesafeAlani };
})();
if (typeof window !== 'undefined') window.SEHIR_DEKOR = SEHIR_DEKOR;
