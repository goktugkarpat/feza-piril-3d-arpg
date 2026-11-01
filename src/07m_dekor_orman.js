/* ── ORMAN_DEKOR: Bölüm 3 (Huysuz Orman) çevre süsleri (E234) ──
   06z_orman.js kurSon() başında çağrılır:  ORMAN_DEKOR.olustur(L, api, { avoid:[{x,z,r}] })
   Motorun orman teması zemin/çalı/ağacı zaten çizer; bu dosya ONA EK olarak: uzak ağaç katmanları (çam/huş/kavak/yuvarlak, ucuz),
   kütük+eğrelti+mantar kümeleri, kesik kütükler, kaya grupları, çiçek tarlaları, çalı öbekleri, yaprak yığınları, tabelalar, ışık havuzları.
   Yol ve oyun nesnelerinin çevresi açık; yalnız alçak süs (<0.7) yaklaşır. Çizim çağrısı eklemez (api.put birleştirir). */
const ORMAN_DEKOR = (() => {
  'use strict';
  const P = PROPKIT, E = EKIT, PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  P.ROCKPAL.orman = { base: [0.6, 0.57, 0.5], dark: [0.26, 0.24, 0.22], moss: [0.26, 0.52, 0.22], moss2: [0.44, 0.68, 0.26] };
  const GREENS = [0x5aa844, 0x6cba4c, 0x4a9a42, 0x82c452, 0x3f8a46], AUTUMN = [0xd9a23a, 0xe0842f, 0xc8c43a];
  const GLASS = [0xfff2c0, 0xfff0d0];

  function olustur(L, api, ctx = {}) {
    const rnd = api.rnd, put = api.put, pick = a => a[(rnd() * a.length) | 0];
    const F = E.field(L), free = E.keepout(L, ctx.avoid || []);
    const st = { far: 0, log: 0, stump: 0, rock: 0, flo: 0, bush: 0, fern: 0, mush: 0, sign: 0 };
    const ok = (x, z, r = 0.5) => api.isFloor(x, z) && api.circleFree(x, z, r) && free(x, z, r);

    // ── uzak/orta ağaç katmanları: yürünmez bölgede kenardan 2.2..14 m dışarıda ──
    const lay = [[3.2, 6.5, 0.14, 'near'], [6, 11, 0.06, 'mid'], [11, 17, 0.025, 'far']];
    const hides = (x, z, h) => { for (let t = 1.2; t < h * 0.8; t += 1.2) for (const o of [-1, -0.5, 0, 0.5, 1]) if (F.floor[Math.floor(z - t) * F.W + Math.floor(x + o * (1.5 + t * 0.7))]) return true; return false; };
    for (let j = 0; j < F.H; j++) for (let i = 0; i < F.W; i++) {
      if (F.floor[j * F.W + i]) continue;
      const x = i + 0.5, z = j + 0.5, d = F.dout(x, z);
      for (const [d0, d1, dens, nm] of lay) {
        if (d < d0 || d >= d1 || rnd() > dens) continue;
        const px = x + (rnd() - 0.5) * 0.9, pz = z + (rnd() - 0.5) * 0.9, r0 = rnd(), s = 0.75 + rnd() * 0.5;
        if (hides(px, pz, (nm === 'near' ? 9 : 14) * s)) continue;
        const k = (rnd() * 4) | 0, mk = nm === 'near' ? 'shinyNS' : 'decor', yaw = rnd() * TAU;
        if (nm === 'near') {
          if (r0 < 0.38) E.placeSmall(api, 'pine', k, px, pz, (5.5 + rnd() * 3.5) * s, { yaw, leaf: pick([0x3f8a4a, 0x4a9a50, 0x2f7a46]) });
          else if (r0 < 0.7) E.placeSmall(api, 'round', k, px, pz, (5 + rnd() * 3) * s, { yaw, leaf: pick(GREENS) });
          else if (r0 < 0.85) E.placeSmall(api, 'birch', k, px, pz, (4.5 + rnd() * 2.5) * s, { yaw, leaf: pick(r0 < 0.78 ? GREENS : AUTUMN) });
          else E.placeSmall(api, 'poplar', k, px, pz, (6.5 + rnd() * 3) * s, { yaw, leaf: pick(GREENS) });
        } else {   // orta/uzak: yalnız silüet ağaçlar, daha büyük + sisle solar
          const c = nm === 'mid' ? pick([0x3f8a4a, 0x4a9a50, 0x5aa044]) : pick([0x4f8a5a, 0x5a9a68, 0x6aa078]);
          E.placeSmall(api, r0 < 0.6 ? 'pine' : 'round', k, px, pz, (nm === 'mid' ? 9 : 12) * s + rnd() * 3, { yaw, leaf: c, wood: 0xb0a090, mat: 'shinyNS' });
        }
        st.far++; void mk;
      }
    }
    // ── yürünür alanda küme süsleri ──
    const centers = [];
    const nCl = Math.round(L.W * L.H / 68);
    const kinds = ['logs', 'stump', 'rocks', 'flowers', 'ferns', 'bushes', 'mushring', 'litter', 'flowers', 'ferns', 'logs', 'bushes'];
    function around(x, z, rmax, n, fn) { for (let i = 0; i < n; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * rmax, px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d; if (ok(px, pz, 0.25)) fn(px, pz, i); } }
    const fernAt = (x, z, s) => { const n = 3 + ((rnd() * 2) | 0), c = pick([0x4aa850, 0x5ab85a, 0x6cc860, 0x3f9a50]), k0 = (rnd() * 3) | 0; for (let i = 0; i < n; i++) put(P.frond(k0 + (i % 2)), x, 0.02, z, s, s, s, c, i / n * TAU + rnd() * 0.3, 0.1 * i % 0.3, 0, 'decor'); st.fern++; };
    const tuftAt = (x, z, s) => put(P.tuft((rnd() * 6) | 0), x, 0, z, s * (0.9 + rnd() * 0.4), s * (0.8 + rnd() * 0.6), s * (0.9 + rnd() * 0.4), pick([0x5ab04a, 0x6cc050, 0x4a9a44, 0x82c456]), rnd() * TAU, 0, 0, 'decor');
    const flowerAt = (x, z, s) => put(P.flower((rnd() * 5) | 0), x, 0, z, s, s, s, 0xffffff, rnd() * TAU, 0, 0, 'decor');
    const smallMush = (x, z, s) => { const cc = pick([[0xe8503a, 0xffffff], [0xe89a3a, 0xfff0c8], [0xf0e0c0, 0xffffff], [0xc8683a, 0xffe8c0]]), h = (0.14 + rnd() * 0.16) * s; put(P.stem('plain', 3), x, 0, z, 0.05 * s, h, 0.05 * s, 0xf4ecdc, rnd() * TAU, 0, 0, 'shinyNS'); put(P.cap(pick(['dome', 'bell', 'flat']), 3), x, h * 0.95, z, 0.13 * s, 0.11 * s, 0.13 * s, cc[0], rnd() * TAU, 0, 0, 'shinyNS'); st.mush++; };
    const bushAt = (x, z, s) => { const b = P.bush((rnd() * 4) | 0), yaw = rnd() * TAU; put(b.leaf, x, 0, z, s, s * 0.9, s, pick(rnd() < 0.15 ? AUTUMN : GREENS), yaw, 0, 0, 'shinyNS'); put(b.glow, x, 0, z, s * 0.9, s * 0.9, s * 0.9, pick([0xff8a6a, 0xfff08a, 0xffb0d8]), yaw, 0, 0, 'shinyNS'); st.bush++; };
    const stoneAt = (x, z, s) => put(P.rock((rnd() * 5) | 0, 'orman', s > 0.8 ? 0 : 1), x, 0, z, s * 1.1, s * 0.95, s * 1.1, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS');
    const litterAt = (x, z) => put(E.litter((rnd() * 4) | 0), x, 0, z, 1, 1, 1, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS');
    function cluster(kind, x, z, dp) {
      switch (kind) {
        case 'logs': {
          const yaw = rnd() * TAU, s = 1.1 + rnd() * 0.9; put(P.log((rnd() * 3) | 0), x, 0, z, s, s, s, 0xffffff, yaw, 0, 0, 'shinyNS'); st.log++;
          const ca = Math.cos(yaw), sa = -Math.sin(yaw);
          for (let i = 0, n = 1 + ((rnd() * 2) | 0); i < n; i++) smallMush(x + ca * (rnd() - 0.5) * s * 0.7 + 0.1, z + sa * (rnd() - 0.5) * s * 0.7 + 0.3 * s, 1.2);
          around(x, z, 1.7, 3, (px, pz) => fernAt(px, pz, 0.5 + rnd() * 0.3)); around(x, z, 1.6, 3, (px, pz) => tuftAt(px, pz, 1.2));
          if (rnd() < 0.5) litterAt(x + 0.9, z - 0.5);
          break;
        }
        case 'stump': {
          const s = 0.9 + rnd() * 1.1; put(E.stump((rnd() * 3) | 0), x, 0, z, s, s, s, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS'); st.stump++;
          around(x, z, 1.1 * s, 3, (px, pz) => { if (hyp(px - x, pz - z) > 0.35 * s) smallMush(px, pz, 1.1); });
          around(x, z, 1.6, 3, (px, pz) => tuftAt(px, pz, 1.1)); litterAt(x + 0.6, z + 0.5); if (rnd() < 0.5) fernAt(x - 0.8, z + 0.4, 0.55);
          break;
        }
        case 'rocks': {
          const s = 0.7 + rnd() * 0.8; stoneAt(x, z, s); st.rock++;
          for (let i = 0, n = 1 + ((rnd() * 2) | 0); i < n; i++) { const a = rnd() * TAU, d = s * (0.9 + rnd() * 0.5), px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d; if (ok(px, pz, 0.2)) stoneAt(px, pz, s * (0.3 + rnd() * 0.35)); }
          around(x, z, 1.8, 2, (px, pz) => fernAt(px, pz, 0.5)); around(x, z, 1.8, 3, (px, pz) => tuftAt(px, pz, 1.3));
          if (rnd() < 0.5) smallMush(x + 0.8, z - 0.6, 1);
          break;
        }
        case 'flowers': {
          const n = 4 + ((rnd() * 3) | 0); around(x, z, 1.9, n, (px, pz) => flowerAt(px, pz, 1 + rnd() * 0.7)); around(x, z, 2, 4, (px, pz) => tuftAt(px, pz, 1)); st.flo += n;
          if (rnd() < 0.35) { put(P.cap('dome', 2), x + 0.3, 0.17, z, 0.25, 0.2, 0.25, 0xff9a3a, 0, 0, 0, 'shinyNS'); }
          break;
        }
        case 'ferns': { const n = 3 + ((rnd() * 2) | 0); around(x, z, 1.6, n, (px, pz) => fernAt(px, pz, 0.6 + rnd() * 0.5)); around(x, z, 1.6, 3, (px, pz) => tuftAt(px, pz, 1.2)); if (rnd() < 0.4) stoneAt(x + 0.4, z - 0.5, 0.35); break; }
        case 'bushes': { const n = 1 + ((rnd() * 2) | 0); for (let i = 0; i < n; i++) { const a = rnd() * TAU, d = i ? 1 + rnd() * 0.7 : 0, px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d; if (ok(px, pz, 0.5)) bushAt(px, pz, 0.7 + rnd() * 0.6); } around(x, z, 2, 2, (px, pz) => flowerAt(px, pz, 1)); around(x, z, 2, 2, (px, pz) => fernAt(px, pz, 0.45)); break; }
        case 'mushring': { const n = 5 + ((rnd() * 3) | 0), R = 0.7 + rnd() * 0.4; for (let i = 0; i < n; i++) { const a = i / n * TAU + rnd() * 0.3, px = x + Math.sin(a) * R, pz = z + Math.cos(a) * R; if (ok(px, pz, 0.15)) smallMush(px, pz, 0.9 + rnd() * 0.6); } api.glow(x, z, 1.4, 0xffe8b0, 0.1); break; }
        default: { litterAt(x, z); litterAt(x + 1.1, z + 0.4); around(x, z, 1.8, 3, (px, pz) => tuftAt(px, pz, 1.1)); }
      }
    }
    // (düzeltme) kümeler: yardımcı sabitler tanımlandıktan sonra yerleştirilir
    for (let t = 0, made = 0; t < nCl * 20 && made < nCl; t++) {
      const x = 1 + rnd() * (L.W - 2), z = 1 + rnd() * (L.H - 2);
      if (!api.isFloor(x, z)) continue;
      const dp = F.dp(x, z), din = F.din(x, z);
      if (dp < 2.4 && rnd() < 0.85) continue;   // yol çevresi açık
      if (!ok(x, z, 1.1)) continue;
      if (centers.some(c => hyp(c.x - x, c.z - z) < 3.4)) continue;
      centers.push({ x, z, kind: null }); made++;
      let kind = pick(kinds); if (din < 3 && rnd() < 0.5) kind = pick(['bushes', 'rocks', 'logs', 'ferns']);
      centers[centers.length - 1].kind = kind; cluster(kind, x, z, dp);
    }
    // ── yol kenarı: tabelalar (4 adet) ve yolun iki yanında yaprak serpintisi + alçak çiçek ──
    const Pt = L.path || [];
    let lastSign = -99;
    for (let q = 10; q < Pt.length - 6; q++) {
      const a = Pt[q - 3], b = Pt[q + 3], dx = b.x - a.x, dz = b.z - a.z, dl = hyp(dx, dz) || 1, nx = -dz / dl, nz = dx / dl;
      if (q - lastSign > 28 && st.sign < 5) {
        const sg = rnd() < 0.5 ? 1 : -1, x = Pt[q].x + nx * 2.2 * sg, z = Pt[q].z + nz * 2.2 * sg;
        if (ok(x, z, 0.5)) { put(P.signpost((rnd() * 2) | 0), x, 0, z, 1.1, 1.1, 1.1, 0xffffff, Math.atan2(-dz, dx), 0, 0, 'shinyNS'); tuftAt(x + 0.3, z + 0.3, 1.2); flowerAt(x - 0.3, z + 0.2, 1); lastSign = q; st.sign++; }
      }
      if (q % 2 === 0) for (const sg of [1, -1]) {
        const d = 1.7 + rnd() * 1.4, x = Pt[q].x + nx * d * sg, z = Pt[q].z + nz * d * sg;
        if (rnd() < 0.55 && ok(x, z, 0.2)) { const r0 = rnd(); if (r0 < 0.4) litterAt(x, z); else if (r0 < 0.75) flowerAt(x, z, 1 + rnd() * 0.5); else tuftAt(x, z, 1.2); }
      }
    }
    // ── ışık havuzları: kümelerin bir kısmında sıcak, sisli aydınlık ──
    centers.forEach((c, i) => { if (i % 4 === 0) api.glow(c.x, c.z, 3.2, pick(GLASS), 0.08); });
    if (typeof window !== 'undefined') window.__E234 = { st, centers };
    return st;
  }
  return { olustur };
})();
// PERF: orman çim öbeği sayısı azaltılır, ORMAN_DEKOR zaten yaprak/eğrelti/mantar kümesi koyduğu için mükerrer zemin instanced çağrıları kaldırılır
if (typeof ZEMIN !== 'undefined' && ZEMIN.TEMA && ZEMIN.TEMA.orman) {
  ZEMIN.TEMA.orman.cover = ZEMIN.TEMA.orman.cover.filter(c => c.k !== 'pebble' && c.k !== 'leaf' && c.k !== 'fern' && c.k !== 'mush');
  const c = ZEMIN.TEMA.orman.cover[0];
  if (c && c.k === 'tuft' && c.n > 1700) { c.n = 1700; c.s = [1.2, 2.1]; }
}
// PERF: DEKOR_BOL hücre boyu en az 24m tutularak fazla parça çizim çağrısı (draw call) önlenir, üçgenler yine frustum-culled kalır
if (typeof window !== 'undefined' && typeof DEKOR_BOL === 'function' && !DEKOR_BOL._perf) {
  const _db0 = DEKOR_BOL;
  window.DEKOR_BOL = function (L, api, cell = 24, min = 18000) { return _db0(L, api, Math.max(cell || 24, 24), Math.max(min || 18000, 18000)); };
  window.DEKOR_BOL._perf = 1;
}
