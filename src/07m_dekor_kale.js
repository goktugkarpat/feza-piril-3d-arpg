/* ── KALE_DEKOR: Bölüm 9 (Ejderhanın Kalesi) çevre süsleri — SICAK GÜN BATIMI, krem taş avlu (E8910) ──
   06z_kale.js kur() içinden:  KALE_DEKOR.olustur(L, api, K)   (K = L.kl)
   Avlu çemberi: yürünür alanın çevresinde krem taş SUR (siperli, ön tarafta alçak) + kuleler + sancaklar; içte bahçe şeridi:
   mangallar (sevimli, kor topu; ateş tehlikesi yok), ejderha heykelleri, sütunlar, ejderha yuvaları, çalı/ağaç; arkada Büyük Salon (vitray),
   uzak kule silüetleri (3 katman). Renk: krem taş + gül/turkuaz/altın sancaklar. Gün batımı ışığı: aşağıdaki ATMO + bölüm `isik` değerleri. */
if (typeof ATMO !== 'undefined' && ATMO.P && ATMO.P.kale) Object.assign(ATMO.P.kale, { gl: [0, 0xffd49a, 0x7a5a50, 0.22, 0.08], sh: 0x7a96ea, hi: 0xffd8a0, con: 0.2, haze: [0xffc49c, 0.14, 0.5], rays: [0xffd29a, 0.26], fog: [0.72, 0.88], dust: { n: 90, col: 0xffe2b0, size: 0.09, mode: 'mote', a: 0.75, h: 5 } });
if (typeof ZEMIN !== 'undefined' && ZEMIN.TEMA && ZEMIN.TEMA.kale) Object.assign(ZEMIN.TEMA.kale, { out: 0x8db060, outK: 0.5, macro: [0xffe2b8, 0xf0e8d0], dapple: [0xffd9a0, 0.2] });   // out: yürünmeyen kenar açık çimen yeşili (eskisi koyu zeytindi; taş desenin üstünde avluya kara leke gibi yayılıyordu)
const KALE_DEKOR = (() => {
  'use strict';
  const Y = YAPI, PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  function olustur(L, api, K) {
    const rnd = api.rnd, put = api.put, grid = L.grid, DF = SEHIR_DEKOR.mesafeAlani(L);
    const cell = new Map();
    const free = (x, z, r) => { const cx = Math.floor(x / 6), cz = Math.floor(z / 6); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const q = cell.get((cx + a + 500) * 1000 + cz + b + 500); if (q) for (const u of q) if (hyp(u.x - x, u.z - z) < u.r + r) return false; } return true; };
    const claim = (x, z, r) => { const k = (Math.floor(x / 6) + 500) * 1000 + Math.floor(z / 6) + 500; let q = cell.get(k); if (!q) cell.set(k, q = []); q.push({ x, z, r }); };
    const floorAt = (x, z) => { const i = Math.floor(x), j = Math.floor(z); return i >= 0 && j >= 0 && i < L.W && j < L.H && grid[j * L.W + i] > 0; };
    const southFront = (x, z) => { for (let t = 2; t <= 10; t += 2) for (const o of [0, -3, 3]) if (floorAt(x + o, z - t)) return true; return false; };
    const keep = (x, z, r) => (L.start && hyp(x - L.start.x, z - L.start.z) < r + 2) || (L.exit && hyp(x - L.exit.x, z - L.exit.z) < r + 3);
    const pick = a => a[(rnd() * a.length) | 0];
    const toward = (x, z, f) => Math.atan2(f.fx - x, f.fz - z);
    const snap = a => Math.round(a / (PI / 8)) * (PI / 8);
    const pr = (g, x, y, z, s, yaw, mk = 'shinyNS', sy) => put(g, x, y, z, s, sy ?? s, s, 0xffffff, yaw || 0, 0, 0, mk);
    const putY = (p, x, z, s, yaw, sy) => { pr(p.m, x, 0, z, s, yaw, 'shinyNS', sy); if (p.g) pr(p.g, x, 0, z, s, yaw, 'glow', sy); };
    const st = { sur: 0, kule: 0, buyuk: 0, mangal: 0, heykel: 0, sutun: 0, yuva: 0, agac: 0, bayrak: 0, salon: 0 };
    const bb = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 };
    for (let j = 0; j < L.H; j++) for (let i = 0; i < L.W; i++) if (grid[j * L.W + i]) { bb.x0 = Math.min(bb.x0, i); bb.x1 = Math.max(bb.x1, i); bb.z0 = Math.min(bb.z0, j); bb.z1 = Math.max(bb.z1, j); }
    const cands = [];
    for (let z = bb.z0 - 44; z <= bb.z1 + 44; z += 1.7) for (let x = bb.x0 - 44; x <= bb.x1 + 44; x += 1.7) {
      const xx = x + (rnd() - 0.5) * 1.6, zz = z + (rnd() - 0.5) * 1.6, f = DF.at(xx, zz);
      if (!f || f.d < 1.8 || floorAt(xx, zz)) continue;
      cands.push({ x: xx, z: zz, f });
    }
    const cx0 = (bb.x0 + bb.x1) / 2, cz0 = (bb.z0 + bb.z1) / 2;
    const banners = [];
    const bez = (x, y, z, w, h, col, yaw) => { banners.push([x, y, z, w, h, col, yaw]); };
    // ── 1) Büyük Salon: sıcak salon odasının kuzeyinde (vitray cephe güneye, oyuncuya bakar) ──
    if (K.salon) {
      const sl = Y.salon(); let ok = false, px = K.salon.x, pz = K.salon.z - K.salon.r - 4;
      for (let t = 0; t < 16 && !ok; t++) { pz = K.salon.z - K.salon.r - 3.2 - t * 0.9; px = K.salon.x + ((t % 3) - 1) * 1.2; ok = [-8, 0, 8].every(o => !floorAt(px + o, pz) && !floorAt(px + o, pz - 3)) && [-8, 0, 8].every(o => { const f = DF.at(px + o, pz); return f && f.d > 2.2; }); }
      if (ok) { putY(sl, px, pz, 1.0, 0); claim(px, pz, 11); api.glow(px, pz + 5, 7, 0xffc080, 0.14); st.salon = 1; K.salonAt = { x: px, z: pz }; }
    }
    // ── 2) sur çemberi (d 5.2–7.6): siperli, ön (güney) kısımda alçak; her 3. parçada kule ──
    const wc = cands.filter(c => c.f.d > 5.4 && c.f.d < 7.6).sort((a, b) => Math.atan2(a.z - cz0, a.x - cx0) - Math.atan2(b.z - cz0, b.x - cx0));
    let sinceT = 0;
    for (const c of wc) {
      if (keep(c.x, c.z, 2) || !free(c.x, c.z, 2.1)) continue;
      const yaw = toward(c.x, c.z, c.f), front = southFront(c.x, c.z);
      if (sinceT >= 3 && rnd() < 0.75 && free(c.x, c.z, 3.0)) {
        const t = Y.kule('kale', (rnd() * 3) | 0), s = 1.0 + rnd() * 0.25, sy = front ? 0.62 : 1;
        putY(t, c.x, c.z, s, rnd() * TAU, sy * s); claim(c.x, c.z, 3.3); sinceT = 0; st.kule++;
        bez(c.x, (t.top - 0.7) * s * sy, c.z, 1.0, 1.4, [[0.9, 0.42, 0.46], [0.36, 0.7, 0.68], [0.95, 0.72, 0.3]][st.kule % 3], rnd() * TAU);
        continue;
      }
      const w = Y.sur('kale', (rnd() * 2) | 0); putY(w, c.x, c.z, 1.0, yaw, front ? 0.62 : 1.0); claim(c.x, c.z, 2.1); sinceT++; st.sur++;
      if (rnd() < 0.3) { const lx = (rnd() - 0.5) * 2.4, cs = Math.cos(yaw), sn = Math.sin(yaw), h = (front ? 0.62 : 1) * 3.0; bez(c.x + cs * lx + sn * 0.62, h - 0.2, c.z - sn * lx + cs * 0.62, 0.95, 1.6, [[0.9, 0.42, 0.46], [0.36, 0.7, 0.68], [0.95, 0.72, 0.3]][(st.sur) % 3], yaw); }
    }
    // ── 3) bahçe şeridi (d 2.2–5.2): mangal, ejderha heykeli, sütun, yuva, çalı, küçük ağaç ──
    const mg = [], hk = [];
    for (const c of cands) {
      const d = c.f.d; if (d < 2.3 || d > 5.2 || rnd() > 0.5) continue;
      if (api.linkDist(c.x, c.z) < 2.0 || keep(c.x, c.z, 1)) continue;
      const yaw = snap(toward(c.x, c.z, c.f)), r0 = rnd();
      if (r0 < 0.2 && d < 4 && !mg.some(q => hyp(q.x - c.x, q.z - c.z) < 7.5) && free(c.x, c.z, 1.0)) {
        const m = Y.mangal(); pr(m.m, c.x, 0, c.z, 1, yaw); pr(m.g, c.x, 0, c.z, 1, yaw, 'glow'); api.glow(c.x, c.z, 3.6, 0xffa860, 0.2); if (mg.length < 9) api.light(c.x, 1.6, c.z, 0xffa860, 2.4, 8, 0.2); mg.push(c); claim(c.x, c.z, 1.0); st.mangal++;
      } else if (r0 < 0.36 && d < 4.6 && !hk.some(q => hyp(q.x - c.x, q.z - c.z) < 13) && free(c.x, c.z, 1.5)) {
        pr(Y.ejderhaHeykel(st.heykel % 3).m, c.x, 0, c.z, 0.95, yaw); hk.push(c); claim(c.x, c.z, 1.6); st.heykel++;
      } else if (r0 < 0.5 && !hk.some(q => hyp(q.x - c.x, q.z - c.z) < 4) && free(c.x, c.z, 1.0)) {
        pr(Y.sutun().m, c.x, 0, c.z, 1, yaw); claim(c.x, c.z, 0.8); st.sutun++;
      } else if (r0 < 0.58 && free(c.x, c.z, 1.5) && st.yuva < 9) {
        pr(Y.yuva().m, c.x, 0, c.z, 0.9, rnd() * TAU); claim(c.x, c.z, 1.4); st.yuva++;
      } else if (r0 < 0.82 && free(c.x, c.z, 1.0)) {
        const b = PROPKIT.bush((rnd() * 4) | 0), s0 = 0.9 + rnd() * 0.9; put(b.leaf, c.x, 0, c.z, s0, s0 * 0.9, s0, pick([0x7cb85a, 0x6aa850, 0x8cc060, 0x5a9a50]), rnd() * TAU, 0, 0, 'shinyNS');
        for (let q = 0, n = 1 + ((rnd() * 3) | 0); q < n; q++) put(PROPKIT.flower((rnd() * 5) | 0), c.x + (rnd() - 0.5) * 1.8, 0, c.z + (rnd() - 0.5) * 1.8, 1.1, 1.1, 1.1, 0xffffff, rnd() * TAU, 0, 0, 'decor');
        claim(c.x, c.z, 0.9);
      } else if (r0 < 0.95 && d > 3.2 && free(c.x, c.z, 1.8)) {
        const h = 3.8 + rnd() * 2; PROPKIT.placeTree(api, rnd() < 0.5 ? 'round' : 'pine', (rnd() * 4) | 0, c.x, c.z, h, { y: -0.06 * h, yaw: rnd() * TAU, mat: 'shinyNS', leaf: pick([0x9cc66e, 0x86b860, 0xb4cc78]) }); claim(c.x, c.z, 1.6); st.agac++;
      }
    }
    // ── 4) arka plan: sur ardında kule ve salon silüetleri (3 katman), uzun sancaklarla ──
    const bk = cands.filter(c => c.f.d > 9 && c.f.d < 42).sort(() => rnd() - 0.5);
    for (const c of bk) {
      const d = c.f.d, tall = d > 12 || !southFront(c.x, c.z);
      if (!tall && d < 12) continue;
      if (rnd() > 0.1) continue;
      const k = (rnd() * 3) | 0, big = rnd() < 0.55 || d > 22, s = big ? (d > 24 ? 1.5 + rnd() * 0.7 : 1.0 + rnd() * 0.5) : 1.5 + rnd() * 0.6, R = (big ? 2.6 : 1.9) * s + 1.6;
      if (keep(c.x, c.z, R) || !free(c.x, c.z, R)) continue;
      if (big) { const t = Y.buyukKule(k); putY(t, c.x, c.z, s, rnd() * TAU); claim(c.x, c.z, R); st.buyuk++; bez(c.x, (t.h - 0.7) * s, c.z, 1.6, 2.4, [[0.9, 0.42, 0.46], [0.36, 0.7, 0.68], [0.95, 0.72, 0.3]][k], rnd() * TAU); }
      else { const t = Y.kule('kale', k); putY(t, c.x, c.z, s, rnd() * TAU); claim(c.x, c.z, R); st.kule++; }
    }
    // ağaç/çalı arka dolgu (sur ile salon arası boş kalmasın)
    for (const c of cands) {
      const d = c.f.d; if (d < 7.8 || d > 14 || rnd() > 0.1) continue;
      if (!free(c.x, c.z, 1.8) || keep(c.x, c.z, 1)) continue;
      const h = 5 + rnd() * 3; PROPKIT.placeTree(api, pick(['round', 'pine', 'pine']), (rnd() * 4) | 0, c.x, c.z, southFront(c.x, c.z) && d < 11 ? h * 0.6 : h, { y: -0.06 * h, yaw: rnd() * TAU, mat: 'shinyNS', leaf: pick([0x9cc66e, 0x86b860, 0xb4cc78]) }); claim(c.x, c.z, 1.8); st.agac++;
    }
    // ── 5) sancaklar: dalgalanan, ejderha renklerinde ──
    for (const b of banners) { const g = Y.bez(b[3], b[4], b[5], 0, { tail: true }); put(g, b[0], b[1], b[2], 1, 1, 1, 0xffffff, b[6], 0, 0, 'decor'); st.bayrak++; }
    return { st };
  }
  return { olustur };
})();
if (typeof window !== 'undefined') window.KALE_DEKOR = KALE_DEKOR;
