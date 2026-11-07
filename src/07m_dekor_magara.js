/* ── MAGARA_DEKOR: Bölüm 5 (Kristal Mağarası) çevre süsleri (E567) ──
   06z_magara.js kur() içinden:  const ok = MAGARA_DEKOR.olustur(L, api, { K: ODAKIT });  → true ise eski basit süsler atlanır.
   Yalnız çevre: kristal kümeleri (farklı renk/boy), sarkıt/dikit, kaya sütunları ve kemerler, ışıklı mantar/yosun, ahşap destek,
   ray, fener, ayna kaideleri, küçük göletler, uzak siluet katmanları. Oyun nesnelerine/yola/düşmana dokunmaz. Mor yok. */
const MAGARA_DEKOR = (() => {
  'use strict';
  const P = PROPKIT, PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  function olustur(L, api, ctx) {
    const K = ctx.K;
    if (!K || typeof MANTAR_DEKOR === 'undefined' || !P.spire || !P.TEMA.magara) return false;
    if (K.lowShadow) K.lowShadow(api, 99);
    const rnd = api.rnd, put = api.put, T = P.TEMA.magara, isF = (x, z) => api.isFloor(x, z);
    const pick = a => a[(rnd() * a.length) | 0];
    const coneH = (x, z) => { for (let d = 0.5; d <= 14; d += 0.75) { const w = d * 0.45 + 0.8; for (let dx = -w; dx <= w; dx += 0.9) if (isF(x + dx, z - d)) return 0.5 + d * 0.85; } return 99; };
    const fN = (x, z) => K.floorNorth(L, x, z, 9), fD = (x, z, m = 8) => K.floorDist(L, x, z, m);
    const D = MANTAR_DEKOR.olustur(L, api, { K, coneH, fN, fD, isF, tema: 'magara' });
    const ids = L.rooms.map((r, i) => i);
    const ROCKT = [0xa8bcc0, 0x98b0b8, 0xb4c4c4, 0x9cb4c8];
    const rockTint = () => pick(ROCKT);
    const placed = [];
    if (L.mg && L.mg.dragon) placed.push({ x: L.mg.dragon.cx, z: L.mg.dragon.z, r: 5.5 });   // QA (görsel): uyuyan ejderhanın yerine kaya/kemer konmasın (ejderha kayaların içinden taşıyordu)
    const spaced = (x, z, r) => { for (const q of placed) if (hyp(q.x - x, q.z - z) < r + q.r) return false; placed.push({ x, z, r }); return true; };

    // ── bileşenler ──
    const stalagmite = (x, z, h, w) => { put(P.spire((rnd() * 5) | 0, false, 0), x, 0, z, w, h, w, rockTint(), rnd() * TAU, 0, 0, h > 5 ? 'shiny' : 'shinyNS'); };
    const crag = (x, z, h, w, lod) => {   // kaya sütunu: kalın, düz üstlü, kenarında kristal
      put(P.spire((rnd() * 5) | 0, false, 1), x, 0, z, w, h, w, rockTint(), rnd() * TAU, (rnd() - 0.5) * 0.05, 0, h > 4 ? 'shiny' : 'shinyNS');
      if (!lod) {
        const c = pick(T.crystal), a = rnd() * TAU, s = Math.min(1.6, 0.5 + h * 0.18);
        put(P.crystal((rnd() * 4) | 0, 6), x + Math.sin(a) * w * 0.55, 0, z + Math.cos(a) * w * 0.55, s, s * 1.2, s, c, rnd() * TAU, 0, 0, 'glow');
        api.glow(x + Math.sin(a) * w * 0.7, z + Math.cos(a) * w * 0.7, s * 2.4 + 1, c, 0.1);
        if (rnd() < 0.5) D.glowCluster(x + Math.sin(a + 2) * w * 0.7, z + Math.cos(a + 2) * w * 0.7, 3, 0.9);
      }
    };
    const arch = (x, z, s, yaw, withDrips) => {
      put(P.archRock((rnd() * 3) | 0), x, 0, z, s, s * 0.85, s * (0.9 + rnd() * 0.3), rockTint(), yaw, 0, 0, 'shiny');
      const c = pick(T.crystal); put(P.crystal((rnd() * 4) | 0, 6), x + Math.cos(yaw) * s * 1.0, 0, z - Math.sin(yaw) * s * 1.0, s * 0.45, s * 0.5, s * 0.45, c, rnd() * TAU, 0, 0, 'glow'); api.glow(x, z, s * 1.6, c, 0.1);
      if (withDrips) for (let i = 0; i < 4; i++) {   // kemerin altından sarkıtlar
        const a = PI * (0.3 + 0.4 * (i / 3)) + (rnd() - 0.5) * 0.15, lx = Math.cos(a) * s, ly = Math.sin(a) * s * 0.85 * 1.02 - s * 0.22, hh = s * (0.25 + rnd() * 0.35);
        put(P.spire((rnd() * 5) | 0, true, 0), x + Math.cos(yaw) * lx, ly, z - Math.sin(yaw) * lx, s * 0.13, hh, s * 0.13, rockTint(), 0, 0, 0, 'shinyNS');
      }
    };
    const shelf = (x, z, s) => {   // üst kaya sundurması + sarkıtlar + iki kaya sütunu (yürünür alanın kuzeyi/uzağı)
      const y = 3.2 * s;
      for (const sd of [-1, 1]) crag(x + sd * 1.6 * s, z, 3.4 * s, 0.9 * s, 1);
      put(P.stoneMound((rnd() * 3) | 0), x, y, z, 2.1 * s, 0.7 * s, 1.2 * s, rockTint(), rnd() * 0.5, 0, 0, 'shiny');
      for (let i = 0; i < 5; i++) put(P.spire((rnd() * 5) | 0, true, 0), x + (i - 2) * 0.62 * s + (rnd() - 0.5) * 0.2, y + 0.05, z + (rnd() - 0.5) * 0.7 * s, 0.22 * s, (0.5 + rnd() * 0.9) * s, 0.22 * s, rockTint(), 0, 0, 0, 'shinyNS');
      const c = pick(T.crystal); api.glow(x, z + 0.5, 3 * s, c, 0.1);
    };
    const bigCrystals = (x, z, s) => {   // büyük kristal ormanı: 3-5 farklı renkli
      const n = 3 + ((rnd() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU + rnd(), d = i ? s * (0.5 + rnd() * 0.5) : 0, c = pick(T.crystal), ss = s * (i ? 0.45 + rnd() * 0.45 : 1);
        put(P.crystal((rnd() * 4) | 0, 6), x + Math.sin(a) * d, 0, z + Math.cos(a) * d, ss, ss * (1 + rnd() * 0.5), ss, c, rnd() * TAU, 0, (rnd() - 0.5) * 0.25, 'glow');
        api.glow(x + Math.sin(a) * d, z + Math.cos(a) * d, ss * 2.4 + 1, c, 0.11);
      }
      put(P.rock((rnd() * 5) | 0, 'magara'), x, 0, z, s * 0.9, s * 0.45, s * 0.9, rockTint(), rnd() * TAU, 0, 0, 'shinyNS');
    };
    let nL = 0;
    const lantern = (x, z, h, yaw) => {
      put(P.stem('plain', 3), x, 0, z, 0.05, h, 0.05, 0x7a5a3a, 0, 0, 0, 'shinyNS');
      put(P.lantern(), x, h - 0.02, z, 1.6, 1.6, 1.6, 0xffffff, yaw, 0, 0, 'shinyNS');
      put(P.lanternGlow(), x, h - 0.02, z, 1.6, 1.6, 1.6, 0xffd890, yaw, 0, 0, 'glow');
      api.glow(x, z, 3.2, 0xffd890, 0.16);
      if (nL++ < 8) api.light(x, h - 0.3, z + 0.3, 0xffd890, 2.6, 8, 0.12);
    };
    const pedestal = (x, z, s) => {
      put(P.pedestal((rnd() * 3) | 0), x, 0, z, s, s, s, 0xa8c0c4, rnd() * TAU, 0, 0, 'shiny');
      put(P.pedestalGlow(), x, 0, z, s, s, s, 0x8ff0ff, 0, 0, 0, 'glow');
      const c = pick(T.crystal); put(P.crystal((rnd() * 4) | 0, 4), x, 0.7 * s, z, 0.35 * s, 0.45 * s, 0.35 * s, c, rnd() * TAU, 0, 0, 'glow'); api.glow(x, z, 2.4 * s, c, 0.12);
    };

    // ── yakın kuşak: yürünür alanın hemen dışı (kameraya göre alçak; yüksekler yalnız kuzeyde) ──
    let nTall = 0;
    K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const maxH = Math.min(maxH0, coneH(x, z)), r = rnd();
      if (maxH >= 5.5 && fd > 2.4 && r < 0.22) { if (spaced(x, z, 1.4)) { const h = Math.min(maxH, 4 + rnd() * 4); crag(x, z, h, Math.min(0.5 + h * 0.2, fd * 0.7), 0); } }
      else if (maxH >= 3 && fd > 2.0 && r < 0.3) { if (spaced(x, z, 1.2)) { shelf(x, z, 0.8 + rnd() * 0.5); } }
      else if (maxH >= 1.4 && r < 0.46) { const n = 2 + ((rnd() * 3) | 0); for (let i = 0; i < n; i++) { const a = rnd() * TAU, d = i * 0.5; stalagmite(x + Math.sin(a) * d, z + Math.cos(a) * d, Math.min(maxH, 0.7 + rnd() * 1.8) * (i ? 0.6 : 1), 0.25 + rnd() * 0.3); } D.patch2(x + 0.6, z + 0.4, 0.8); }
      else if (r < 0.6) { if (nTall++ % 3 === 0 && maxH > 2.5) bigCrystals(x, z, 0.9 + rnd() * 0.9); else D.crystals(x, z, 0.5 + rnd() * 1.1); }
      else if (r < 0.7 && maxH >= 1.2) { const h = Math.min(maxH, 0.7 + rnd() * 1.3); D.mushroom(x, z, h, Math.min(0.45 + rnd() * 0.6, h * 0.7), { pk: 0.13 }); if (rnd() < 0.6) D.patch2(x + 0.6, z + 0.5, 0.8); }
      else if (r < 0.8) D.rockGroup(x, z, 0.5 + rnd() * 0.7);
      else if (r < 0.9) D.mossMound(x, z, 0.6 + rnd() * 0.7);
      else { D.fern(x, z, 0.7 + rnd() * 0.5); D.patch2(x + 0.5, z, 0.8); }
      if (rnd() < 0.18) D.glowCluster(x + (rnd() - 0.5) * 1.5, z + (rnd() - 0.5) * 1.5, 2 + ((rnd() * 2) | 0), 1);
    }, { step: 2.4, d0: 0.9, d1: 9, margin: 10 });

    // ── uzak kuşak: seyrek, büyük, koyu siluetler (kaya sütunları, kemerler, dev kristaller) ──
    K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const maxH = Math.min(maxH0, coneH(x, z)), r = rnd();
      if (maxH >= 9 && r < 0.3) { if (spaced(x, z, 2.2)) { const h = 7 + rnd() * 7; put(P.spire((rnd() * 5) | 0, false, rnd() < 0.5 ? 1 : 0), x, 0, z, h * 0.34, h, h * 0.34, pick([0x7a9098, 0x6c8490, 0x8aa0a8]), rnd() * TAU, 0, 0, 'shinyNS'); if (rnd() < 0.5) put(P.crystal((rnd() * 4) | 0, 6), x + 1, 0, z + 1, 2.2, 3, 2.2, pick(T.crystal), rnd() * TAU, 0, 0, 'glow'); } }
      else if (maxH >= 7 && r < 0.42) { if (spaced(x, z, 3)) arch(x, z, 3.2 + rnd() * 2.2, rnd() * PI, true); }
      else if (maxH >= 6 && r < 0.54) bigCrystals(x, z, 1.6 + rnd() * 1.4);
      else if (maxH >= 3 && r < 0.7) { if (spaced(x, z, 1.5)) shelf(x, z, 1.2 + rnd() * 0.8); }
      else put(P.rock((rnd() * 5) | 0, 'magara', 1), x, 0, z, 1.4 + rnd() * 1.6, (1.0 + rnd() * 1.4) * Math.min(1, maxH / 2.5), 1.4 + rnd() * 1.6, pick([0x7a9098, 0x8aa0a8]), rnd() * TAU, 0, 0, 'shinyNS');
    }, { step: 5.8, d0: 9, d1: 24, margin: 24 });

    // ── oda kenarları: sık parlak kuşak, fener direkleri, ayna kaideleri ──
    ids.forEach((ri, k) => {
      const rm = L.rooms[ri], spots = K.rimSpots(L, rm, 0.8, rm.kind === 'boss' ? 26 : 18);
      spots.forEach((p, j) => {
        const hmax = coneH(p.x, p.z), r = rnd();
        if (r < 0.3) D.glowCluster(p.x, p.z, 3 + ((rnd() * 3) | 0), 1.1);
        else if (r < 0.5 && hmax > 1.0) D.mushroom(p.x + Math.sin(p.a) * 0.6, p.z + Math.cos(p.a) * 0.6, Math.min(hmax, 0.8 + rnd() * 1.2), 0.4 + rnd() * 0.35, { pk: 0.14 });
        else if (r < 0.68) D.fern(p.x, p.z, 0.7 + rnd() * 0.5);
        else if (r < 0.84) D.crystals(p.x, p.z, 0.4 + rnd() * 0.5);
        else D.rockGroup(p.x, p.z, 0.4 + rnd() * 0.3);
        if (rnd() < 0.45) D.patch2(p.x - Math.sin(p.a) * 0.5, p.z - Math.cos(p.a) * 0.5, 0.8);
        if (rnd() < 0.7) { const wx = p.x + Math.sin(p.a) * 2.0, wz = p.z + Math.cos(p.a) * 2.0, wh = Math.min(coneH(wx, wz), 1.4 + rnd() * 2.2), ws = 1.0 + rnd() * 1.1; if (!isF(wx, wz) && wh > 0.8) put(P.rock((rnd() * 5) | 0, 'magara'), wx, 0, wz, ws * 1.3, Math.min(ws * 1.4, wh * 1.1), ws * 1.2, rockTint(), rnd() * TAU, 0, 0, 'shiny'); }
        void j;
      });
      // fener direği: bir oda başına en çok 1 (alçak, yoldan uzak)
      for (const p of spots) { if (hmaxOk(p) && ((k + 1) % 2 === 0 || rm.kind === 'boss') && !isF(p.x + Math.sin(p.a) * 0.6, p.z + Math.cos(p.a) * 0.6)) { lantern(p.x + Math.sin(p.a) * 0.6, p.z + Math.cos(p.a) * 0.6, 1.5 + rnd() * 0.4, rnd() * TAU); break; } }
      if (k % 3 === 1) for (const p of spots.slice().reverse()) { if (coneH(p.x, p.z) > 2 && !isF(p.x + Math.sin(p.a) * 1.4, p.z + Math.cos(p.a) * 1.4)) { pedestal(p.x + Math.sin(p.a) * 1.4, p.z + Math.cos(p.a) * 1.4, 0.9 + rnd() * 0.3); break; } }
    });
    function hmaxOk(p) { return coneH(p.x, p.z) > 1.8; }

    // ── yürünür alanın içi: yoldan ve oyun nesnelerinden uzak, ALÇAK süs (hiçbir şeyi saklamaz) ──
    const pts = [];
    const grab = (o, d) => { if (!o || d > 3) return; if (Array.isArray(o)) { for (const q of o) grab(q, d + 1); return; } if (typeof o !== 'object') return; if (typeof o.x === 'number' && typeof o.z === 'number') pts.push(o); else for (const k in o) if (k !== 'L' && k !== 'api') grab(o[k], d + 1); };
    for (const k of ['chests', 'checkpoints', 'spawns', 'stations', 'nesneler', 'mg', 'hedefler', 'yuzeyler', 'bosses', 'npcs', 'minis']) grab(L[k], 0);
    pts.push(L.start, L.exit, L.boss);
    const Pth = L.path || [];
    const nearPath = (x, z) => { let b = 1e9; for (let i = 0; i < Pth.length; i++) { const d = Math.abs(Pth[i].x - x) + Math.abs(Pth[i].z - z); if (d < b) b = d; } return b; };
    const busy = (x, z) => { for (const q of pts) if (q && hyp(q.x - x, q.z - z) < 2.4) return true; return false; };
    let nIn = 0;
    for (const rm of L.rooms) {
      const R0 = rm.r || 7, n = Math.round(R0 * 1.7);
      for (let t = 0; t < n; t++) {
        const a = rnd() * TAU, d = Math.sqrt(rnd()) * R0 * 1.05, x = rm.x + Math.sin(a) * d, z = rm.z + Math.cos(a) * d;
        if (!isF(x, z) || nearPath(x, z) < 3.0 || busy(x, z) || fD(x, z, 1) === 0 && false) continue;
        const r = rnd();
        if (r < 0.28) { const c = pick(T.crystal), s = 0.45 + rnd() * 0.5; put(P.crystal((rnd() * 4) | 0, 6), x, 0, z, s, s * 1.1, s, c, rnd() * TAU, 0, 0, 'glow'); api.glow(x, z, s * 2.4 + 0.6, c, 0.1); }
        else if (r < 0.46) D.glowCluster(x, z, 3 + ((rnd() * 3) | 0), 1.0);
        else if (r < 0.62) D.stone(x, z, 0.3 + rnd() * 0.3);
        else if (r < 0.74) stalagmite(x, z, 0.5 + rnd() * 0.5, 0.18 + rnd() * 0.16);
        else if (r < 0.86) D.mossMound(x, z, 0.4 + rnd() * 0.4);
        else D.fern(x, z, 0.5 + rnd() * 0.4);
        nIn++;
      }
    }
    void nIn;
    // ── maden rayı + ahşap destekler (2. alan: odalar arası) ──
    const A = L.areas || [];
    if (A[1]) {
      let nSup = 0;
      for (let ri = 0; ri < A[1].rooms.length; ri++) {
        const rm = L.rooms[A[1].rooms[ri]], nb = L.rooms[A[1].rooms[ri] + 1]; if (!nb) continue;
        const dx = nb.x - rm.x, dz = nb.z - rm.z, l = hyp(dx, dz) || 1, yaw = Math.atan2(dx, dz), ux = dx / l, uz = dz / l;
        for (let d = 2.5; d < l - 2.5; d += 1.1) {
          const x = rm.x + ux * d + uz * 1.9, z = rm.z + uz * d - ux * 1.9;
          if (isF(x, z)) put(P.railSeg(0), x, 0, z, 1, 1, 1, 0xffffff, yaw, 0, 0, 'shinyNS');
        }
        for (let d = 5; d < l - 4 && nSup < 6; d += 7.5) {   // yolun iki yanında ahşap destek çifti (üst kiriş yüksekte)
          const x = rm.x + ux * d, z = rm.z + uz * d;
          if (!isF(x, z)) continue;
          for (const sd of [-1, 1]) { const px = x + uz * sd * 3.4, pz = z - ux * sd * 3.4; if (!isF(px, pz)) put(P.stem('plain', 3), px, 0, pz, 0.12, 2.4, 0.12, 0x7a5a3a, 0, 0, 0, 'shiny'); }
          nSup++;
        }
      }
    }
    // ── küçük göletler: yürünmeyen cepler (ışıltılı turkuaz su) ──
    const pools = [];
    K.fill(L, rnd, ids, (x, z, maxH0, fd) => { if (pools.length < 14 && fd > 1.8 && fd < 4 && rnd() < 0.09 && coneH(x, z) > 1.2 && spaced(x, z, 1.6)) { const r = 0.9 + rnd() * 0.9; pools.push({ x, z, r }); put(P.poolRim ? P.poolRim((rnd() * 3) | 0) : P.rock(0, 'magara'), x, 0, z, r * 1.05, r * 1.0, r * 1.05, 0x9ab0b8, rnd() * TAU, 0, 0, 'shinyNS'); api.glow(x, z, r * 2.2, 0x58e8e0, 0.12); } }, { step: 4.2, d0: 1.8, d1: 5, margin: 6 });
    P.water(api, pools, { c1: 0x1a7a90, c2: 0xb8fff4, a: 0.88 });
    return true;
  }
  return { olustur };
})();
