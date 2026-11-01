/* ── MANTAR_DEKOR: Bölüm 1 (Işıklı Mantar Vadisi) çevre süsleri — PROPKIT eşyalarını yerleştirir (G3) ──
   06z_mantar.js kur() içinden çağrılır:  const D = MANTAR_DEKOR.olustur(L, api, { K, coneH, fN, fD, isF });
   Dönen D: mushroom, glowCluster, mossMound, stone, fern, + zenginleştiriciler (zemin örtüsü, kümeler, dere kıyısı, tabela, çit, köprü).
   Başka bölümler: aynı yapı, farklı TEMA (PROPKIT.TEMA.<id>) ile. */
const MANTAR_DEKOR = (() => {
  'use strict';
  const P = PROPKIT, PI = Math.PI, TAU2 = PI * 2, hyp = Math.hypot;
  function olustur(L, api, ctx) {
    if (typeof window !== 'undefined' && !api.__g3cnt) { api.__g3cnt = 1; const p0 = api.put; const S = window.__G3 = { tri: {}, n: {} }; api.put = function (geo, ...a) { const k = (geo.name || 'x') + '|' + (a[10] || 'shiny'); S.tri[k] = (S.tri[k] || 0) + (geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3); S.n[k] = (S.n[k] || 0) + 1; return p0.call(api, geo, ...a); }; }
    const rnd = api.rnd, put = api.put, T = P.TEMA[ctx.tema || 'mantar'], K = ctx.K, isF = ctx.isF, coneH = ctx.coneH, fD = ctx.fD;
    const pick = a => a[(rnd() * a.length) | 0];
    const KY = { dome: 0.74, flat: 1.15, cone: 0.62, bell: 0.82, wavy: 0.85 };
    const CAPK = ['dome', 'dome', 'flat', 'bell', 'wavy', 'cone'], CAPK_S = ['dome', 'bell', 'flat'];
    let lightN = 0;
    const st = { mush: 0, tuft: 0 };

    // ── mantar: sap (lifli, kök ayaklı) + şapka (benekli, solungaçlı, ışıklı kenar) + sarkan ışıklar ──
    function mushroom(x, z, h, s, o = {}) {
      const ci = o.ci ?? ((rnd() * T.cap.length) | 0), c = T.cap[ci], gc = T.glow[(ci + (o.go || 0)) % T.glow.length], yaw = rnd() * TAU2;
      const tx = o.tilt ? (rnd() - 0.5) * o.tilt : 0, tz = o.tilt ? (rnd() - 0.5) * o.tilt : 0;
      const lod = o.lod ?? (s > 1.5 ? 0 : s > 0.7 ? 1 : 2), kind = o.kind || pick(s < 1 ? CAPK_S : CAPK), ys = (KY[kind] || 0.8) * (o.flat ? o.flat / 0.8 : 1);
      const sw = Math.max(0.16, s * 0.27), mk = h + s > 6 ? 'shiny' : 'shinyNS';
      put(P.stem(lod === 0 && s > 1.7 && rnd() < 0.4 ? 'ring' : 'plain', lod), x, 0, z, sw, h, sw, pick(T.stem), yaw, tx, tz, mk);
      if (lod < 2 && h > 0.9) put(P.roots(lod === 0 ? 5 : 4, lod), x, 0, z, sw, sw, sw, T.root, yaw, 0, 0, 'shinyNS');
      const cx = x - tz * h * 0.9, cy = h * 0.97, cz = z + tx * h * 0.9;
      put(P.cap(kind, lod), cx, cy, cz, s, s * ys, s, c[0], yaw, tx, tz, mk);
      if (lod < 2) put(P.gills(lod), cx, cy, cz, s, s * ys, s, T.gill, yaw, tx, tz, mk);
      put(P.capSpots(kind, lod, false), cx, cy, cz, s, s * ys, s, c[1], yaw, tx, tz, mk);
      put(P.capSpots(kind, lod, true), cx, cy, cz, s, s * ys, s, gc, yaw, tx, tz, 'glow');
      if (lod < 2) put(P.rim(lod), cx, cy, cz, s, s * ys, s, gc, yaw, tx, tz, 'glow');
      if (o.vines !== false && s > 1.6 && rnd() < 0.7) {   // şapka kenarından sarkan sarmaşık + ışıklı damlalar
        const nv = 3 + ((rnd() * 4) | 0);
        for (let i = 0; i < nv; i++) {
          const a = rnd() * TAU2, px = cx + Math.sin(a) * s * 0.93, pz = cz + Math.cos(a) * s * 0.93, len = Math.min(cy - 0.6, 0.7 + rnd() * 1.4);
          put(P.vine(i), px, cy - 0.02, pz, 1, len, 1, 0xffffff, a, 0, 0, 'shinyNS');
          put(P.pod(1), px, cy - len, pz, 1.4, 1.4, 1.4, gc, 0, 0, 0, 'glow');
        }
      }
      if (o.light && lightN < 14) { lightN++; api.light(x, cy + 0.5, z + 0.6, gc, o.li || 3, o.ld || 9, 0.15); }
      if (o.pool !== false) api.glow(x, z, s * 1.6 + 1, gc, o.pk ?? 0.16);
      st.mush++;
    }
    // minik ışıklı mantar öbeği (zeminde, parlayan): yassı şapkalar
    function glowCluster(x, z, n, sc = 1) {
      const ci = (rnd() * T.glow.length) | 0, gc = T.glow[ci];
      for (let i = 0; i < n; i++) {
        const a = rnd() * TAU2, d = rnd() * 0.6 * sc, h = (0.2 + rnd() * 0.35) * sc, s = (0.12 + rnd() * 0.14) * sc, px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d;
        put(P.stem('plain', 3), px, 0, pz, s * 0.32, h, s * 0.32, 0xf4f0e8, rnd() * TAU2, (rnd() - 0.5) * 0.4, (rnd() - 0.5) * 0.4, 'shinyNS');
        put(P.cap(pick(CAPK_S), 3), px, h * 0.95, pz, s, s * 0.8, s, gc, rnd() * TAU2, 0, 0, 'glow');
      }
    }
    function stone(x, z, s, mossy = true) {
      const k = (rnd() * 5) | 0; void mossy;
      put(P.rock(k, T.rock, s > 0.8 ? 0 : 1), x, 0, z, s * 1.1, s * 0.95, s * 1.1, 0xffffff, rnd() * TAU2, 0, 0, s > 1 ? 'shiny' : 'shinyNS');
    }
    function bush(x, z, s) {
      const b = P.bush((rnd() * 4) | 0), yaw = rnd() * TAU2, tint = pick(T.leaf);
      put(b.leaf, x, 0, z, s, s * 0.9, s, tint, yaw, 0, 0, 'shinyNS');
      put(b.glow, x, 0, z, s, s, s, pick(T.glow), yaw, 0, 0, 'glow');
    }
    function mossMound(x, z, s) {   // yosunlu tümsek: çalı ya da yosunlu taş
      if (rnd() < 0.55) bush(x, z, s * 1.05); else stone(x, z, s * 0.8);
      if (rnd() < 0.5) tuftAt(x + (rnd() - 0.5) * s * 1.6, z + (rnd() - 0.5) * s * 1.6, 1);
    }
    function tuftAt(x, z, sc = 1) {
      put(P.tuft((rnd() * 6) | 0), x, 0, z, sc * (0.9 + rnd() * 0.5), sc * (0.45 + rnd() * 0.45), sc * (0.9 + rnd() * 0.5), pick(T.grass), rnd() * TAU2, 0, 0, 'decor'); st.tuft++;
    }
    function flowerAt(x, z, sc = 1) { put(P.flower((rnd() * 5) | 0), x, 0, z, sc, sc, sc, 0xffffff, rnd() * TAU2, 0, 0, 'decor'); }
    function fern(x, z, s) {
      const n = 4 + ((rnd() * 3) | 0), c = pick([0x3f9a6a, 0x4aa878, 0x58b888]), k0 = (rnd() * 3) | 0;
      for (let i = 0; i < n; i++) put(P.frond(k0 + (i % 2)), x, 0.02, z, s * 0.9, s * 0.9, s * 0.9, c, i / n * TAU2 + rnd() * 0.3, 0.12 * i % 0.3, 0, 'decor');
    }
    // mini çiçekli, ışıklı yosun yaması (kenar zemin örtüsü): çim + çiçek + minik mantar
    function patch2(x, z, r = 1) {   // (not: 'patch' GLSL'de ayrılmış kelime; burada JS ama yine de kaçınıyoruz)
      if (rnd() < 0.45) return;
      const n = 2 + ((rnd() * 2) | 0);
      for (let i = 0; i < n; i++) { const a = rnd() * TAU2, d = Math.sqrt(rnd()) * r; tuftAt(x + Math.sin(a) * d, z + Math.cos(a) * d, 0.9 + rnd() * 0.5); }
      for (let i = 0, m = 1 + ((rnd() * 3) | 0); i < m; i++) { const a = rnd() * TAU2, d = rnd() * r; flowerAt(x + Math.sin(a) * d, z + Math.cos(a) * d, 0.9 + rnd() * 0.5); }
      if (rnd() < 0.35) glowCluster(x + (rnd() - 0.5) * r, z + (rnd() - 0.5) * r, 2 + ((rnd() * 2) | 0), 0.9);
    }
    function rockGroup(x, z, s) {
      stone(x, z, s);
      for (let i = 0, n = 1 + ((rnd() * 3) | 0); i < n; i++) { const a = rnd() * TAU2, d = s * (0.9 + rnd() * 0.5); stone(x + Math.sin(a) * d, z + Math.cos(a) * d, s * (0.3 + rnd() * 0.4)); }
      patch2(x + (rnd() - 0.5) * s, z + (rnd() - 0.5) * s, s * 0.9);
    }
    function crystals(x, z, s) {
      const gc = pick(T.crystal);
      put(P.crystal((rnd() * 4) | 0, 6), x, 0, z, s, s, s, gc, rnd() * TAU2, 0, 0, 'glow');
      put(P.rock((rnd() * 5) | 0, T.rock), x, 0, z, s * 0.5, s * 0.4, s * 0.5, 0xffffff, rnd() * TAU2, 0, 0, 'shinyNS');
      api.glow(x, z, s * 1.8 + 0.6, gc, 0.12);
    }
    function logAt(x, z, s) {
      const yaw = rnd() * TAU2;
      put(P.log((rnd() * 3) | 0), x, 0, z, s, s, s, 0xffffff, yaw, 0, 0, 'shinyNS');
      const a = [Math.cos(yaw), -Math.sin(yaw)];
      for (let i = 0, n = 1 + ((rnd() * 2) | 0); i < n; i++) { const t = (rnd() - 0.5) * s * 0.7; put(P.cap('flat', 2), x + a[0] * t, 0.3 * s + 0.12 * s, z + a[1] * t, 0.18 * s, 0.18 * s, 0.18 * s, pick(T.cap)[1], rnd() * TAU2, 0, 0, 'shinyNS'); }
      glowCluster(x + a[0] * s * 0.5, z + a[1] * s * 0.5, 2, 0.9); tuftAt(x - a[0] * s * 0.55, z - a[1] * s * 0.55, 1.1);
    }
    function rootArc(x, z, s, yaw) { put(P.rootArc((rnd() * 3) | 0), x, 0, z, s, s, s, 0xffffff, yaw ?? rnd() * TAU2, 0, 0, 'shinyNS'); }
    function tree(x, z, h, o = {}) { return P.placeTree(api, o.kind || 'shelf', o.k ?? ((rnd() * 4) | 0), x, z, h, Object.assign({ yaw: rnd() * TAU2, mat: h > 6.5 ? 'shiny' : 'shinyNS', leaf: 0xffffff }, o)); }
    function leafUmbrella(x, z, h, s, yaw) {   // dev yaprak: kıvrık saplı, damarlı yaprak; ucunda ışık damlası
      put(P.stem('plain', 2), x, 0, z, 0.06, h, 0.06, 0x3f8a4a, 0, 0, 0, 'shinyNS');
      const tint = pick(T.leaf);
      put(P.broadLeaf((rnd() * 3) | 0), x, h, z, s, s, s, tint, yaw, 0.28 + rnd() * 0.2, (rnd() - 0.5) * 0.3, 'decor');
      put(P.pod(1), x + Math.sin(yaw) * s * 1.55, h + 0.12, z + Math.cos(yaw) * s * 1.55, 1, 1, 1, 0xa8fff4, 0, 0, 0, 'glow');
    }
    function signpost(x, z, dirx, dirz, k = 0) {
      const yaw = Math.atan2(-dirz, dirx);
      put(P.signpost(k), x, 0, z, 1, 1, 1, 0xffffff, yaw, 0, 0, 'shinyNS');
      glowCluster(x + 0.4, z + 0.3, 3, 0.8); tuftAt(x - 0.3, z - 0.2, 1.1); flowerAt(x + 0.2, z - 0.4, 1);
      api.glow(x, z, 1.6, 0xfff0a8, 0.14);
    }
    function fenceRun(x, z, yaw, n) { const ca = Math.cos(yaw), sa = -Math.sin(yaw); for (let i = 0; i < n; i++) { const t = (i - (n - 1) / 2) * 1.6; put(P.fenceSeg(0), x + ca * t, 0, z + sa * t, 1, 1, 1, 0xffffff, yaw, 0, 0, 'shinyNS'); } }
    function bridge(x, z, yaw, len, wid) { put(P.bridge(len, wid), x, 0, z, 1, 1, 1, 0xffffff, yaw, 0, 0, 'shinyNS'); }

    // ── yürünür alan zemin örtüsü: yol dışında ot, çiçek, minik mantar, çakıl (alçak; düşmanı/Feza'yı saklamaz, çarpışma yok) ──
    function groundCover(avoid) {
      const Pth = L.path || [], W = L.W, H = L.H;
      const nearPath = (x, z) => { let b = 1e9; for (let i = 0; i < Pth.length; i++) { const d = Math.abs(Pth[i].x - x) + Math.abs(Pth[i].z - z); if (d < b) b = d; } return b; };
      let n = 0;
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
        if (!L.grid[j * W + i]) continue;
        const x = i + 0.2 + rnd() * 0.6, z = j + 0.2 + rnd() * 0.6;
        if (!isF(x, z)) continue;
        if (avoid(x, z)) continue;
        const dp = nearPath(x, z), fd = fD(x, z, 4);
        const w = Math.min(1, Math.max(0, (dp - 1.7) / 3)), edge = 1 - Math.min(1, fd / 3);   // yoldan uzak + kenara yakın = sık
        const dens = 0.1 + 0.9 * Math.max(w * 0.55, edge * 0.9 * (dp > 1.5 ? 1 : 0.2));
        if (rnd() > dens * 0.8) continue;
        const r = rnd();
        if (r < 0.62) tuftAt(x, z, 0.8 + rnd() * 0.5);
        else if (r < 0.8) flowerAt(x, z, 0.9 + rnd() * 0.6);
        else if (r < 0.9) glowCluster(x, z, 2 + ((rnd() * 2) | 0), 0.55);
        else if (r < 0.96) put(P.rock((rnd() * 5) | 0, T.rock), x, 0, z, 0.12 + rnd() * 0.1, 0.1 + rnd() * 0.07, 0.12 + rnd() * 0.1, 0xffffff, rnd() * TAU2, 0, 0, 'shinyNS');
        else fern(x, z, 0.35 + rnd() * 0.25);
        n++;
      }
      return n;
    }
    return { mushroom, glowCluster, mossMound, stone, fern, bush, tuftAt, flowerAt, patch2, rockGroup, crystals, logAt, rootArc, tree, leafUmbrella, signpost, fenceRun, bridge, groundCover, st, T, pick };
  }
  return { olustur };
})();
// PERF: mantar bölümünde çim öbeği sayısı yarıya iner, öbekler biraz iri olur (üçgen bütçesi ≤400k)
if (typeof ZEMIN !== 'undefined' && ZEMIN.TEMA && ZEMIN.TEMA.mantar) { const c = ZEMIN.TEMA.mantar.cover[0]; if (c && c.k === 'tuft' && c.n > 4500) { c.n = 4500; c.s = [1.3, 2.2]; } }
