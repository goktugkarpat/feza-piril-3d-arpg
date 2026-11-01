/* ── YAPI: şehir / kale / fener için yapı parçaları (G3, E8910) — PROPKIT.GB üzerine kurulu, köşe renkli, önbellekli ──
   Hepsi yerel koordinatta (ön yüz = +z, taban y=0) geometri döndürür: api.put(geo, x,y,z, s,s,s, 0xffffff, yaw, 0,0, 'shinyNS').
   Parlayan parçalar ayrı geometri ('glow' malzemesi): { m, g }. Mor kullanma (yalnız Pırıl). */
const YAPI = (() => {
  'use strict';
  const K = PROPKIT, { GB, tube, rng, vn, fbm } = K;
  const PI = Math.PI, TWO = PI * 2, sin = Math.sin, cos = Math.cos;
  const CACHE = {}, memo = (k, f) => CACHE[k] || (CACHE[k] = f());
  const hx = h => [(h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255];
  const sc = (c, L) => [c[0] * L, c[1] * L, c[2] * L];
  const h3 = (x, y, z) => { const n = sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return n - Math.floor(n); };
  const punch = (c, k = 1.3, v = 1) => { const m = (c[0] + c[1] + c[2]) / 3; return c.map(x => Math.max(0, Math.min(1, (m + (x - m) * k) * v))); };
  const PLASTER = [[1, 0.85, 0.69], [0.76, 0.91, 0.83], [1, 0.94, 0.68], [0.82, 0.9, 0.97], [1, 0.8, 0.76], [0.98, 0.95, 0.86]].map(c => punch(c, 1.35));
  const ROOFC = [[0.86, 0.5, 0.4], [0.78, 0.4, 0.34], [0.5, 0.6, 0.72], [0.42, 0.62, 0.56], [0.82, 0.62, 0.34]].map(c => punch(c, 1.6, 0.92));
  const SHUT = [[0.8, 0.3, 0.28], [0.3, 0.55, 0.78], [0.35, 0.65, 0.42], [0.95, 0.72, 0.25]];
  const BEAM = [0.34, 0.23, 0.15], STONE = [0.8, 0.77, 0.7], WOOD = [0.62, 0.43, 0.27], IRON = [0.2, 0.2, 0.24], GLASS = [0.55, 0.76, 0.92];
  const STRIPE = [[0.9, 0.3, 0.28], [1, 0.97, 0.9], [0.28, 0.55, 0.85], [0.98, 0.78, 0.25], [0.35, 0.7, 0.42]];

  // ── temel şekiller ──
  function quadO(gb, a, b, c, d, col, out) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nx * out[0] + ny * out[1] + nz * out[2] < 0) gb.quad(a, d, c, b, col); else gb.quad(a, b, c, d, col);
  }
  function triO(gb, a, b, c, col, out) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nx * out[0] + ny * out[1] + nz * out[2] < 0) gb.tri(a, c, b, col); else gb.tri(a, b, c, col);
  }
  const FL = [0.86, 0.7, 0.78, 0.78, 1.0];
  // taban merkezli kutu: (cx, y0, cz) taban ortası; sx (x), sh (yükseklik), sz (z)
  function bb(gb, cx, y0, cz, sx, sh, sz, col, o = {}) {
    const x0 = cx - sx / 2, x1 = cx + sx / 2, z0 = cz - sz / 2, z1 = cz + sz / 2, y1 = y0 + sh;
    const a = [x0, y0, z1], b = [x1, y0, z1], c = [x1, y1, z1], d = [x0, y1, z1], e = [x1, y0, z0], f = [x0, y0, z0], g = [x0, y1, z0], h = [x1, y1, z0];
    const Fs = [[a, b, c, d], [e, f, g, h], [b, e, h, c], [f, a, d, g], [d, c, h, g]];
    Fs.forEach((q, i) => { if (i === 4 && o.notop) return; gb.quad(q[0], q[1], q[2], q[3], sc(col, FL[i] * (0.94 + 0.12 * h3(cx * 7.1 + i, y0 * 3.3, cz * 5.7)) * (o.k || 1))); });
  }
  function beam(gb, p0, p1, r, col) { tube(gb, [p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2], p1], () => r, 4, () => col, { capEnd: true }); }
  // dönel gövde: prof [[r,y],...] alttan üste
  function lathe(gb, prof, seg, colf, T = {}) {
    const n = prof.length - 1, cx = T.x || 0, cy = T.y || 0, cz = T.z || 0, sx = T.sx || 1, sz = T.sz || sx, sy = T.sy || 1;
    gb.grid(seg, n, true, (u, v) => {
      const i = Math.round(v * n), r = prof[i][0], y = prof[i][1], a = u * TWO, c = colf(y, a, i);
      return [cx + sin(a) * r * sx, cy + y * sy, cz + cos(a) * r * sz, c[0], c[1], c[2]];
    }, T.hint ? { hint: T.hint } : {});
  }
  const BP = {}; const ballProf = n => BP[n] || (BP[n] = Array.from({ length: n + 1 }, (_, i) => { const t = i / n * PI; return [sin(t), 1 - cos(t)]; }));
  function ball(gb, cx, cy, cz, rx, ry, rz, col, seg = 7) { lathe(gb, ballProf(4), seg, (y, a) => sc(col, 0.78 + 0.22 * y / 2 + 0.04 * sin(a * 3)), { x: cx, y: cy - ry, z: cz, sx: rx, sz: rz, sy: ry }); }
  // düz yüzlü n-gen kesik koni
  function prismN(gb, cx, y0, cz, r0, r1, h, n, rot, colf) {
    for (let i = 0; i < n; i++) {
      const a0 = rot + i / n * TWO, a1 = rot + (i + 1) / n * TWO, am = (a0 + a1) / 2;
      quadO(gb, [cx + sin(a0) * r0, y0, cz + cos(a0) * r0], [cx + sin(a1) * r0, y0, cz + cos(a1) * r0], [cx + sin(a1) * r1, y0 + h, cz + cos(a1) * r1], [cx + sin(a0) * r1, y0 + h, cz + cos(a0) * r1], colf(i, am), [sin(am), 0.05, cos(am)]);
    }
  }
  function capN(gb, cx, y, cz, r, n, rot, col) { for (let i = 0; i < n; i++) { const a0 = rot + i / n * TWO, a1 = rot + (i + 1) / n * TWO; triO(gb, [cx, y, cz], [cx + sin(a1) * r, y, cz + cos(a1) * r], [cx + sin(a0) * r, y, cz + cos(a0) * r], col, [0, 1, 0]); } }
  // beşik çatı (sırt x ekseninde)
  function gable(gb, cx, y0, cz, w, d, h, ov, col, wall) {
    const hw = w / 2 + ov * 0.7, hd = d / 2 + ov, rows = 4;
    for (const sg of [1, -1]) {
      for (let r = 0; r < rows; r++) {
        const t0 = r / rows, t1 = (r + 1) / rows, L = (r % 2 ? 0.8 : 1.0) * (0.96 + 0.08 * h3(r, sg, cx));
        quadO(gb, [cx - hw, y0 + h * t0, cz + sg * hd * (1 - t0)], [cx + hw, y0 + h * t0, cz + sg * hd * (1 - t0)], [cx + hw, y0 + h * t1, cz + sg * hd * (1 - t1)], [cx - hw, y0 + h * t1, cz + sg * hd * (1 - t1)], sc(col, L * (sg > 0 ? 1 : 0.84)), [0, 1, sg]);
      }
      quadO(gb, [cx - hw, y0 - 0.1, cz + sg * hd], [cx + hw, y0 - 0.1, cz + sg * hd], [cx + hw, y0, cz + sg * hd], [cx - hw, y0, cz + sg * hd], sc(col, 0.55), [0, 0, sg]);
    }
    const hh = h * (d / 2) / hd;
    for (const sg of [1, -1]) triO(gb, [cx + sg * w / 2, y0, cz - d / 2], [cx + sg * w / 2, y0, cz + d / 2], [cx + sg * w / 2, y0 + hh, cz], sc(wall, 0.8), [sg, 0, 0]);
    beam(gb, [cx - hw - 0.02, y0 + h, cz], [cx + hw + 0.02, y0 + h, cz], 0.07, sc(col, 0.7));
  }

  // ═════════ EV: ahşap çerçeveli şehir evi (k: 0..11) ═════════
  function ev(k = 0) {
    return memo('ev' + k, () => {
      const gb = new GB();
      const pl = PLASTER[k % 6], rf = ROOFC[(k * 3 + (k >> 2)) % 5], sh = SHUT[(k + (k >> 1)) % 4];
      const w = 3.3 + (k % 3) * 0.7, d = 2.9 + (k % 2) * 0.5, fl = k % 4 === 3 ? 3 : (k % 3 === 0 ? 1 : 2), fh = 1.45, base = 0.3, W2 = w / 2, D2 = d / 2;
      bb(gb, 0, 0, 0, w + 0.14, base, d + 0.14, STONE);
      for (let f = 0; f < fl; f++) {
        const y0 = base + f * fh, jet = f > 0 ? 0.14 : 0;
        bb(gb, 0, y0, jet / 2, w + (f > 0 ? 0.1 : 0), fh, d + jet, pl, { notop: f < fl - 1 });
        bb(gb, 0, y0 + fh - 0.1, jet / 2, w + 0.18, 0.12, d + jet + 0.18, BEAM);
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) bb(gb, sx * (W2 + 0.02), y0, sz * (D2 + jet / 2 + 0.02), 0.12, fh, 0.12, BEAM);
      }
      const top = base + fl * fh;
      const face = (fc, u, y0, n, su, sh_, sn, col) => {
        if (fc === 0) bb(gb, u, y0, D2 + n / 2, su, sh_, sn + n, col); else if (fc === 1) bb(gb, -u, y0, -D2 - n / 2, su, sh_, sn + n, col);
        else if (fc === 2) bb(gb, W2 + n / 2, y0, -u, sn + n, sh_, su, col); else bb(gb, -W2 - n / 2, y0, u, sn + n, sh_, su, col);
      };
      const win = (fc, u, y0, ww, hh) => {
        face(fc, u, y0 - 0.06, 0.07, ww + 0.2, hh + 0.12, 0.02, BEAM);
        face(fc, u, y0, 0.1, ww, hh, 0.02, GLASS);
        face(fc, u, y0, 0.12, 0.05, hh, 0.02, BEAM); face(fc, u, y0 + hh * 0.5, 0.12, ww, 0.05, 0.02, BEAM);
        if (fc === 0 || fc === 2) {
          face(fc, u - ww * 0.5 - 0.22, y0 - 0.02, 0.1, 0.34, hh + 0.04, 0.03, sh); face(fc, u + ww * 0.5 + 0.22, y0 - 0.02, 0.1, 0.34, hh + 0.04, 0.03, sh);
          face(fc, u, y0 - 0.28, 0.2, ww + 0.1, 0.2, 0.06, [0.55, 0.36, 0.22]);
          for (let q = 0; q < 4; q++) { const cu = u + (q - 1.5) * ww * 0.24, fcn = [[1, 0.45, 0.6], [1, 0.85, 0.3], [1, 0.55, 0.3], [0.95, 0.95, 1]][(q + k) % 4]; face(fc, cu, y0 - 0.1, 0.2, 0.16, 0.18, 0.1, [0.3, 0.62, 0.32]); face(fc, cu, y0 + 0.06, 0.22, 0.09, 0.09, 0.07, fcn); }
        }
      };
      const bays = w > 4.2 ? 3 : 2;
      for (let f = 0; f < fl; f++) {
        const y0 = base + f * fh;
        for (let b = 0; b < bays; b++) {
          const u = -W2 + (b + 0.5) * w / bays;
          if (f === 0 && b === (k % bays)) {
            face(0, u, 0, 0.1, 0.95, 1.2, 0.02, BEAM); face(0, u, 0.05, 0.14, 0.78, 1.1, 0.02, [0.5, 0.33, 0.2]);
            bb(gb, u + 0.25, 0.55, D2 + 0.17, 0.07, 0.07, 0.05, [0.9, 0.75, 0.3]);
            bb(gb, u, 0, D2 + 0.28, 1.1, 0.1, 0.5, STONE);
            bb(gb, u, 1.22, D2 + 0.3, 1.25, 0.08, 0.6, sh); beam(gb, [u - 0.55, 1.2, D2 + 0.58], [u - 0.55, 0.4, D2 + 0.58], 0.04, BEAM); beam(gb, [u + 0.55, 1.2, D2 + 0.58], [u + 0.55, 0.4, D2 + 0.58], 0.04, BEAM);
          } else win(0, u, y0 + 0.5, 0.62, 0.62);
          if (b > 0) face(0, -W2 + b * w / bays, y0, 0.06, 0.1, fh - 0.1, 0.02, BEAM);
        }
        for (const sg of [-1, 1]) beam(gb, [sg * (W2 - 0.1), y0 + fh - 0.1, D2 + 0.05], [sg * (W2 - 0.55), y0 + fh - 0.55, D2 + 0.05], 0.04, BEAM);
        win(2, 0, y0 + 0.5, 0.55, 0.6); win(3, 0, y0 + 0.5, 0.55, 0.6); if (f > 0) win(1, 0, y0 + 0.5, 0.6, 0.6);
      }
      gable(gb, 0, top, 0, w, d, 1.05 + 0.2 * (d - 2.9) + 0.18 * (k % 2), 0.32, rf, pl);
      const chx = (k % 2 ? 1 : -1) * w * 0.27;
      bb(gb, chx, top + 0.2, -d * 0.12, 0.5, 1.1, 0.5, [0.72, 0.45, 0.38]); bb(gb, chx, top + 1.3, -d * 0.12, 0.62, 0.12, 0.62, STONE); bb(gb, chx, top + 1.42, -d * 0.12, 0.34, 0.12, 0.34, [0.18, 0.16, 0.16]);
      if (fl < 3 && w > 3.9) { bb(gb, -w * 0.2, top + 0.15, d * 0.22, 0.7, 0.55, 0.5, pl); gable(gb, -w * 0.2, top + 0.7, d * 0.22, 0.7, 0.5, 0.35, 0.1, rf, pl); bb(gb, -w * 0.2, top + 0.28, d * 0.22 + 0.26, 0.3, 0.3, 0.04, GLASS); }
      gb.U.fill(0); return { m: gb.build(), h: top + 1.1, w, d };
    });
  }
  // ═════════ KULE: yuvarlak taş kule, koni çatı (tur: 'sehir' | 'kale') ═════════
  function kule(tur = 'sehir', k = 0) {
    return memo('kule' + tur + k, () => {
      const gb = new GB(), g = new GB(), sehir = tur === 'sehir';
      const st = sehir ? [0.86, 0.8, 0.7] : [0.95, 0.9, 0.8], roof = sehir ? ROOFC[k % 3] : [[0.9, 0.5, 0.52], [0.45, 0.68, 0.66], [0.9, 0.7, 0.35]][k % 3];
      const R = 1.25 + (k % 3) * 0.25, H = 4.2 + (k % 4) * 0.7;
      lathe(gb, [[R * 1.18, 0], [R * 1.12, 0.35], [R, 0.6], [R * 0.99, H * 0.5], [R * 0.96, H], [R * 1.22, H + 0.12], [R * 1.22, H + 0.55]], 14, (y, a) => sc(st, (y > H ? 1.02 : 0.88 + 0.1 * (Math.floor(y * 2.2) % 2)) * (0.94 + 0.12 * vn(a * 2, y * 1.4, k))));
      for (let i = 0; i < 10; i++) { const a = i / 10 * TWO; bb(gb, sin(a) * R * 1.2, H + 0.55, cos(a) * R * 1.2, 0.4, 0.38, 0.4, st); }
      const rr = R * 1.05, rh = R * 2.2;
      lathe(gb, [[rr * 1.1, H + 0.55], [rr * 1.0, H + 0.9], [rr * 0.55, H + 0.9 + rh * 0.6], [rr * 0.2, H + 0.9 + rh * 0.9], [0.02, H + 0.9 + rh]], 12, (y, a, i) => sc(roof, 0.86 + 0.07 * sin(a * 6 + 1) + 0.08 * (i % 2)));
      beam(gb, [0, H + 0.9 + rh, 0], [0, H + 2.6 + rh, 0], 0.025, [0.6, 0.5, 0.35]);
      for (let i = 0; i < 3; i++) { const a = 0.6 + i * 2.0 + k, y = 1.6 + i * (H - 2.6) / 2; bb(gb, sin(a) * R * 0.99, y, cos(a) * R * 0.99, 0.28, 0.75, 0.28, [0.18, 0.2, 0.26]); bb(gb, sin(a) * R, y + 0.75, cos(a) * R, 0.36, 0.08, 0.36, sc(st, 0.7)); }
      if (!sehir) for (let i = 0; i < 3; i++) { const a = 1.6 + i * 2.0 + k, y = 2.2 + i * 0.5; bb(g, sin(a) * R * 1.0, y, cos(a) * R * 1.0, 0.3, 0.5, 0.3, [1, 0.75, 0.4]); }
      gb.U.fill(0); return { m: gb.build(), g: g.n ? g.build() : null, h: H + 2.6 + rh, r: R, top: H + 2.6 + rh };
    });
  }
  // ═════════ SUR PARÇASI: x boyunca uzar, uzunluk 4 ═════════
  function sur(tur = 'sehir', k = 0) {
    return memo('sur' + tur + k, () => {
      const gb = new GB(), st = tur === 'sehir' ? [0.84, 0.78, 0.68] : [0.95, 0.91, 0.82], L = 4, T = 0.95, H = tur === 'sehir' ? 2.7 : 3.1;
      bb(gb, 0, 0, 0, L, 0.35, T + 0.3, sc(st, 0.82)); bb(gb, 0, 0.35, 0, L, H * 0.5, T + 0.1, sc(st, 0.95)); bb(gb, 0, 0.35 + H * 0.5, 0, L, H * 0.5 - 0.35, T, st);
      bb(gb, 0, H, 0, L + 0.02, 0.2, T + 0.28, sc(st, 1.05));
      for (let i = 0; i < 4; i++) bb(gb, -L / 2 + 0.3 + i * (L - 0.6) / 3, H + 0.2, T / 2 - 0.12, 0.62, 0.5, 0.26, st);
      bb(gb, 0, H + 0.2, -T / 2 + 0.12, L, 0.18, 0.2, sc(st, 0.85));
      if (k % 2) bb(gb, 0.3, 0.9, T / 2 + 0.02, 0.22, 0.7, 0.04, [0.15, 0.17, 0.22]);
      gb.U.fill(0); return { m: gb.build(), h: H + 0.7 };
    });
  }
  // ═════════ TEZGÂH + çizgili TENTE (tente ayrı: kasaba uyanınca renklenir) ═════════
  function tezgah(k = 0) {
    return memo('tezgah' + k, () => {
      const gb = new GB(), w = 2.3;
      for (const sx of [-1, 1]) { beam(gb, [sx * (w / 2 - 0.05), 0, 0.45], [sx * (w / 2 - 0.05), 1.95, 0.45], 0.05, WOOD); beam(gb, [sx * (w / 2 - 0.05), 0, -0.45], [sx * (w / 2 - 0.05), 2.25, -0.45], 0.05, WOOD); }
      bb(gb, 0, 0.62, 0.3, w, 0.1, 0.8, WOOD); bb(gb, 0, 0.1, 0.33, w - 0.1, 0.52, 0.7, sc(WOOD, 0.8)); bb(gb, 0, 0.3, -0.38, w, 0.05, 0.5, sc(WOOD, 0.9));
      const goods = [[[0.9, 0.25, 0.2], [0.98, 0.7, 0.2], [0.55, 0.8, 0.3]], [[0.85, 0.6, 0.3], [0.95, 0.8, 0.5], [0.7, 0.45, 0.25]], [[0.4, 0.7, 0.9], [0.95, 0.9, 0.5], [1, 0.6, 0.7]]][k % 3];
      for (let i = 0; i < 5; i++) { const u = -w / 2 + 0.3 + i * (w - 0.6) / 4; bb(gb, u, 0.72, 0.3, 0.36, 0.14, 0.34, [0.7, 0.5, 0.3]); for (let q = 0; q < 3; q++) ball(gb, u + (q - 1) * 0.1, 0.9 + 0.02 * q, 0.3 + ((q * 5 + i) % 3 - 1) * 0.06, 0.09, 0.09, 0.09, goods[(i + q) % 3], 5); }
      bb(gb, -w * 0.3, 0, -0.1, 0.4, 0.45, 0.4, [0.6, 0.42, 0.26]); bb(gb, w * 0.3, 0, -0.15, 0.5, 0.3, 0.4, [0.75, 0.62, 0.35]);
      gb.U.fill(0);
      const ag = new GB(), c1 = STRIPE[k % 5], c2 = [1, 0.97, 0.9], n = 6, wd = w + 0.4;
      for (let i = 0; i < n; i++) {
        const x0 = -wd / 2 + i * wd / n, x1 = x0 + wd / n, col = i % 2 ? c2 : c1;
        quadO(ag, [x0, 1.95, 0.95], [x1, 1.95, 0.95], [x1, 2.35, -0.5], [x0, 2.35, -0.5], col, [0, 1, 0.4]);
        ag.tri([x0, 1.95, 0.95], [x1, 1.95, 0.95], [(x0 + x1) / 2, 1.68, 0.95], sc(col, 0.95)); ag.tri([x0, 1.95, 0.95], [(x0 + x1) / 2, 1.68, 0.95], [x1, 1.95, 0.95], sc(col, 0.95));
      }
      ag.U.fill(0); return { m: gb.build(), a: ag.build() };
    });
  }
  // ═════════ SOKAK LAMBASI ═════════
  function lamba() {
    return memo('lamba', () => {
      const gb = new GB(), g = new GB();
      tube(gb, [[0, 0, 0], [0, 0.6, 0], [0, 2.4, 0]], s => 0.07 - 0.03 * s, 6, () => IRON, { capEnd: true });
      lathe(gb, [[0.2, 0], [0.18, 0.12], [0.1, 0.3], [0.07, 0.5]], 8, y => sc(IRON, 1 + y * 0.3));
      tube(gb, [[0, 2.3, 0], [0.18, 2.55, 0], [0.4, 2.55, 0], [0.5, 2.38, 0]], () => 0.025, 4, () => IRON, {});
      const lx = 0.5, ly = 2.0; bb(gb, lx, ly + 0.02, 0, 0.3, 0.06, 0.3, IRON); bb(gb, lx, ly + 0.5, 0, 0.34, 0.06, 0.34, IRON);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) beam(gb, [lx + sx * 0.14, ly, sz * 0.14], [lx + sx * 0.14, ly + 0.52, sz * 0.14], 0.018, IRON);
      lathe(gb, [[0.22, ly + 0.52], [0.12, ly + 0.64], [0.02, ly + 0.74]], 4, () => IRON, { x: lx });
      ball(g, lx, ly + 0.27, 0, 0.12, 0.17, 0.12, [1, 0.82, 0.45], 7);
      gb.U.fill(0); g.U.fill(0); return { m: gb.build(), g: g.build() };
    });
  }
  // ═════════ ÇEŞME ═════════
  function cesme() {
    return memo('cesme', () => {
      const gb = new GB(), st = [0.9, 0.85, 0.76], wt = [0.55, 0.82, 0.95];
      lathe(gb, [[1.95, 0], [1.9, 0.25], [1.8, 0.62], [1.95, 0.7], [1.9, 0.78], [1.62, 0.78]], 20, (y, a, i) => sc(st, 0.8 + 0.1 * (i % 2) + 0.06 * sin(a * 10)));
      lathe(gb, [[1.62, 0.78], [1.62, 0.5]], 20, () => sc(st, 0.7));
      lathe(gb, [[1.62, 0.5], [0.01, 0.5]], 20, () => sc(wt, 1.0), { hint: [0, 1, 0] });
      lathe(gb, [[0.3, 0.5], [0.22, 0.9], [0.2, 1.7], [0.26, 1.85]], 10, y => sc(st, 0.9 + 0.1 * sin(y * 9)));
      lathe(gb, [[0.9, 1.5], [0.95, 1.6], [0.88, 1.7], [0.2, 1.75]], 16, (y, a) => sc(st, 0.9 + 0.08 * sin(a * 8)));
      lathe(gb, [[0.8, 1.66], [0.01, 1.7]], 16, () => sc(wt, 1.05), { hint: [0, 1, 0] });
      lathe(gb, [[0.16, 1.7], [0.12, 2.1], [0.2, 2.4], [0.12, 2.6], [0.01, 2.75]], 8, () => st);
      ball(gb, 0, 2.85, 0, 0.17, 0.17, 0.17, [0.95, 0.78, 0.3], 7);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TWO; tube(gb, [[sin(a) * 0.25, 2.0, cos(a) * 0.25], [sin(a) * 0.7, 2.1, cos(a) * 0.7], [sin(a) * 1.05, 1.5, cos(a) * 1.05], [sin(a) * 1.35, 0.55, cos(a) * 1.35]], s => 0.035 * (1 - 0.3 * s), 4, () => sc(wt, 1.1), {}); }
      for (let i = 0; i < 6; i++) { const a = i / 6 * TWO; bb(gb, sin(a) * 1.9, 0.78, cos(a) * 1.9, 0.3, 0.14, 0.3, st); }
      gb.U.fill(0); return { m: gb.build() };
    });
  }
  // ═════════ KUMAŞLAR (rüzgârda sallanır: 'decor', uv.x=40) ═════════
  function sancakDirek() { return memo('sdirek', () => { const gb = new GB(); tube(gb, [[0, 0, 0], [0, 2, 0], [0, 4.0, 0]], s => 0.05 - 0.02 * s, 6, () => [0.85, 0.8, 0.7], { capEnd: true }); ball(gb, 0, 4.05, 0, 0.09, 0.09, 0.09, [0.95, 0.78, 0.3], 6); gb.U.fill(0); return gb.build(); }); }
  function bez(w, h, col, k = 0, o = {}) {
    return memo('bez' + w + h + col.join() + (o.tail ? 't' : ''), () => {
      const gb = new GB(), n = 6;
      for (let i = 0; i <= n; i++) {
        const t = i / n, wave = sin(t * 3) * 0.05, bot = o.tail ? h * (1 - 0.35 * sin(t * PI * 0.5)) : h, c = sc(col, 0.88 + 0.12 * cos(t * 6));
        gb.add(t * w, 0, wave, c[0], c[1], c[2], 40, t); gb.add(t * w, -bot, wave, c[0] * 0.95, c[1] * 0.95, c[2] * 0.95, 40, t);
      }
      for (let i = 0; i < n; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; gb.I.push(a, b, c, c, b, d, a, c, b, c, d, b); }
      return gb.build();
    });
  }
  function bayrakIpi(n = 8, tur = 0) {
    return memo('flama' + n + '_' + tur, () => {
      const gb = new GB(), len = n * 0.55;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, x = t * len, y = -0.36 * sin(t * PI), col = STRIPE[(i + tur) % 5], q = i * 3;
        gb.add(x - 0.2, y, 0, col[0], col[1], col[2], 40, 0); gb.add(x + 0.2, y, 0, col[0], col[1], col[2], 40, 0); gb.add(x, y - 0.42, 0.02, col[0] * 0.9, col[1] * 0.9, col[2] * 0.9, 40, 1);
        gb.I.push(q, q + 1, q + 2, q, q + 2, q + 1);
      }
      return gb.build();
    });
  }
  // ═════════ ARABA, FIÇI, SANDIK, BANK, SAKSI ═════════
  function araba(k = 0) {
    return memo('araba' + k, () => {
      const gb = new GB(); bb(gb, 0, 0.45, 0, 1.9, 0.12, 1.1, WOOD);
      for (const sx of [-1, 1]) bb(gb, sx * 0.93, 0.5, 0, 0.07, 0.5, 1.1, sc(WOOD, 0.9));
      bb(gb, 0, 0.5, -0.52, 1.9, 0.5, 0.07, sc(WOOD, 0.85)); bb(gb, 0, 0.5, 0.52, 1.9, 0.5, 0.07, sc(WOOD, 0.95));
      for (const sx of [-1, 1]) tube(gb, Array.from({ length: 9 }, (_, i) => { const a = i / 8 * TWO; return [sx * 0.98, 0.42 + sin(a) * 0.36, cos(a) * 0.36]; }), () => 0.035, 4, () => sc(WOOD, 0.8), {});
      beam(gb, [-1.0, 0.42, 0], [1.0, 0.42, 0], 0.03, IRON); beam(gb, [1.0, 0.55, 0], [1.9, 0.7, 0.3], 0.04, WOOD); beam(gb, [1.0, 0.55, 0], [1.9, 0.7, -0.3], 0.04, WOOD);
      const hayc = k % 2 ? [0.92, 0.78, 0.4] : [0.55, 0.78, 0.4];
      for (let i = 0; i < 6; i++) ball(gb, -0.55 + i * 0.22, 0.78 + 0.08 * (i % 2), (i % 3 - 1) * 0.2, 0.28, 0.2, 0.25, hayc, 6);
      gb.U.fill(0); return { m: gb.build() };
    });
  }
  function fici() {
    return memo('fici', () => {
      const gb = new GB(); lathe(gb, [[0.28, 0], [0.34, 0.2], [0.37, 0.45], [0.33, 0.8], [0.28, 0.85]], 10, (y, a) => sc(WOOD, 0.85 + 0.15 * sin(a * 12)));
      for (const y of [0.15, 0.45, 0.72]) lathe(gb, [[0.3 + 0.08 * sin((y / 0.85) * PI), y - 0.02], [0.3 + 0.08 * sin((y / 0.85) * PI), y + 0.03]], 10, () => IRON);
      lathe(gb, [[0.27, 0.85], [0.01, 0.85]], 10, () => sc(WOOD, 0.6), { hint: [0, 1, 0] });
      gb.U.fill(0); return { m: gb.build() };
    });
  }
  function sandik() { return memo('sandik', () => { const gb = new GB(); bb(gb, 0, 0, 0, 0.7, 0.5, 0.55, WOOD); for (const x of [-0.3, 0.3]) bb(gb, x, 0, 0, 0.06, 0.52, 0.57, sc(WOOD, 0.6)); bb(gb, 0, 0.5, 0, 0.72, 0.04, 0.57, sc(WOOD, 0.7)); gb.U.fill(0); return { m: gb.build() }; }); }
  function bank() { return memo('bank', () => { const gb = new GB(); bb(gb, 0, 0.42, 0, 1.3, 0.08, 0.42, WOOD); bb(gb, 0, 0.78, -0.2, 1.3, 0.3, 0.06, sc(WOOD, 0.9)); for (const x of [-0.55, 0.55]) bb(gb, x, 0, 0, 0.08, 0.45, 0.4, IRON); gb.U.fill(0); return { m: gb.build() }; }); }
  function saksi(k = 0) {
    return memo('saksi' + k, () => {
      const gb = new GB(), r = rng(k + 5);
      lathe(gb, [[0.2, 0], [0.3, 0.38], [0.32, 0.42]], 8, (y, a) => sc([0.82, 0.48, 0.34], 0.9 + 0.1 * sin(a * 6)));
      lathe(gb, [[0.3, 0.4], [0.01, 0.36]], 8, () => [0.3, 0.22, 0.15], { hint: [0, 1, 0] });
      const cols = [[1, 0.5, 0.6], [1, 0.82, 0.3], [0.98, 0.5, 0.3], [0.96, 0.96, 1]][k % 4];
      for (let i = 0; i < 6; i++) { const a = r() * TWO, d = r() * 0.2; ball(gb, sin(a) * d, 0.5 + r() * 0.2, cos(a) * d, 0.17, 0.14, 0.17, [0.3, 0.62 + r() * 0.1, 0.3], 6); }
      for (let i = 0; i < 5; i++) { const a = r() * TWO, d = r() * 0.2; ball(gb, sin(a) * d, 0.62 + r() * 0.2, cos(a) * d, 0.07, 0.07, 0.07, cols, 5); }
      gb.U.fill(0); return { m: gb.build() };
    });
  }
  // ═════════ SAAT KULESİ (şehrin uzak kahramanı) ═════════
  function saatKulesi() {
    return memo('saat', () => {
      const gb = new GB(), st = [0.92, 0.84, 0.7], rf = [0.78, 0.4, 0.36], W = 3.6, H = 12;
      bb(gb, 0, 0, 0, W + 0.9, 1.2, W + 0.9, sc(st, 0.85)); bb(gb, 0, 1.2, 0, W, H - 1.2, W, st);
      for (let y = 2; y < H; y += 1.1) bb(gb, 0, y, 0, W + 0.08, 0.07, W + 0.08, sc(st, 0.82), { notop: true });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) bb(gb, sx * W / 2, 0, sz * W / 2, 0.36, H + 0.3, 0.36, sc(st, 0.9));
      bb(gb, 0, H, 0, W + 0.7, 0.4, W + 0.7, sc(st, 0.8));
      for (const [dx, dz] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const cyy = H - 2.6, loc = (u, v, n) => [dx * (W / 2 + n) + u * dz, cyy + v, dz * (W / 2 + n) - u * dx], nrm = [dx, 0, dz];
        for (let i = 0; i < 16; i++) { const a0 = i / 16 * TWO, a1 = (i + 1) / 16 * TWO; triO(gb, loc(0, 0, 0.03), loc(sin(a0) * 1.15, cos(a0) * 1.15, 0.03), loc(sin(a1) * 1.15, cos(a1) * 1.15, 0.03), [1, 0.98, 0.92], nrm); }
        for (let i = 0; i < 16; i++) { const a0 = i / 16 * TWO, a1 = (i + 1) / 16 * TWO; quadO(gb, loc(sin(a0) * 1.3, cos(a0) * 1.3, 0.02), loc(sin(a1) * 1.3, cos(a1) * 1.3, 0.02), loc(sin(a1) * 1.12, cos(a1) * 1.12, 0.04), loc(sin(a0) * 1.12, cos(a0) * 1.12, 0.04), [0.9, 0.72, 0.28], nrm); }
        for (let i = 0; i < 12; i++) { const a = i / 12 * TWO; beam(gb, loc(sin(a) * 0.95, cos(a) * 0.95, 0.07), loc(sin(a) * 0.78, cos(a) * 0.78, 0.07), 0.03, [0.25, 0.2, 0.2]); }
        beam(gb, loc(0, 0, 0.12), loc(0, 0.75, 0.12), 0.05, [0.2, 0.17, 0.17]); beam(gb, loc(0, 0, 0.14), loc(0.5, -0.25, 0.14), 0.045, [0.2, 0.17, 0.17]);
      }
      bb(gb, 0, H + 0.4, 0, W - 0.3, 2.6, W - 0.3, st);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) bb(gb, sx * (W / 2 - 0.1), H + 0.4, sz * (W / 2 - 0.1), 0.28, 2.6, 0.28, sc(st, 0.9));
      for (const [dx, dz] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) bb(gb, dx * (W / 2 - 0.12), H + 0.8, dz * (W / 2 - 0.12), dx ? 0.1 : 1.3, 1.5, dz ? 0.1 : 1.3, [0.18, 0.2, 0.28]);
      ball(gb, 0, H + 1.3, 0, 0.5, 0.45, 0.5, [0.95, 0.75, 0.28], 8);
      lathe(gb, [[W * 0.78, H + 3.0], [W * 0.7, H + 3.3], [W * 0.4, H + 5.2], [W * 0.15, H + 6.6], [0.02, H + 7.4]], 4, (y, a, i) => sc(rf, 0.82 + 0.1 * i));
      beam(gb, [0, H + 7.3, 0], [0, H + 8.4, 0], 0.04, [0.95, 0.78, 0.3]); ball(gb, 0, H + 8.45, 0, 0.14, 0.14, 0.14, [0.95, 0.78, 0.3], 6);
      gb.U.fill(0); return { m: gb.build(), h: H + 8.5 };
    });
  }
  // ═════════ KALE ═════════
  function kemer() {
    return memo('kemer', () => {
      const gb = new GB(), st = [0.95, 0.9, 0.8];
      for (const sx of [-1, 1]) { bb(gb, sx * 1.9, 0, 0, 1.0, 4.4, 1.4, st); bb(gb, sx * 1.9, 4.4, 0, 1.2, 0.25, 1.6, sc(st, 1.06)); }
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * PI, a2 = (i + 1) / 10 * PI, x0 = cos(a) * 1.4, y0 = 3.5 + sin(a) * 1.1, x1 = cos(a2) * 1.4, y1 = 3.5 + sin(a2) * 1.1, xo0 = cos(a) * 2.35, yo0 = 3.5 + sin(a) * 1.9, xo1 = cos(a2) * 2.35, yo1 = 3.5 + sin(a2) * 1.9, cc = sc(st, 0.9 + 0.12 * (i % 2));
        quadO(gb, [x0, y0, 0.7], [x1, y1, 0.7], [xo1, yo1, 0.7], [xo0, yo0, 0.7], cc, [0, 0, 1]); quadO(gb, [x0, y0, -0.7], [x1, y1, -0.7], [xo1, yo1, -0.7], [xo0, yo0, -0.7], cc, [0, 0, -1]);
        quadO(gb, [xo0, yo0, 0.7], [xo1, yo1, 0.7], [xo1, yo1, -0.7], [xo0, yo0, -0.7], sc(cc, 1.05), [xo0, yo0 - 3.5, 0]);
      }
      bb(gb, 0, 5.4, 0, 4.9, 0.7, 1.5, st); for (let i = 0; i < 5; i++) bb(gb, -2.0 + i * 1.0, 6.1, 0, 0.55, 0.5, 0.5, st);
      gb.U.fill(0); return { m: gb.build() };
    });
  }
  function buyukKule(k = 0) {
    return memo('bkule' + k, () => {
      const gb = new GB(), g = new GB(), st = [0.96, 0.9, 0.78], rc = [[0.86, 0.42, 0.45], [0.38, 0.66, 0.64], [0.92, 0.66, 0.3]][k % 3], R = 2.0 + (k % 2) * 0.4, H = 8 + (k % 3) * 1.6;
      lathe(gb, [[R * 1.3, 0], [R * 1.2, 0.8], [R * 1.05, 1.4], [R, 2.6], [R * 0.97, H * 0.6], [R * 0.92, H], [R * 1.28, H + 0.3], [R * 1.3, H + 1.3]], 16, (y, a) => sc(st, (y > H ? 1.0 : 0.86 + 0.1 * (Math.floor(y * 1.8) % 2)) * (0.94 + 0.12 * vn(a * 2.2, y * 1.2, k))));
      for (let i = 0; i < 12; i++) { const a = i / 12 * TWO; bb(gb, sin(a) * R * 1.27, H + 1.3, cos(a) * R * 1.27, 0.55, 0.6, 0.55, st); }
      lathe(gb, [[R * 1.2, H + 1.3], [R * 1.1, H + 1.8], [R * 0.7, H + 1.8 + R * 1.3], [R * 0.25, H + 1.8 + R * 2.4], [0.02, H + 1.8 + R * 3.0]], 12, (y, a, i) => sc(rc, 0.84 + 0.05 * sin(a * 6) + 0.1 * (i % 2)));
      beam(gb, [0, H + 1.8 + R * 3, 0], [0, H + 3.3 + R * 3, 0], 0.05, [0.95, 0.78, 0.3]);
      const gl = [[0.95, 0.4, 0.45], [0.35, 0.75, 0.95], [1, 0.85, 0.3], [0.45, 0.85, 0.55], [1, 0.6, 0.3]];
      for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) {
        const a = (i / 3 + 0.12 + j * 0.17 + k * 0.05) * TWO, y = 2.8 + j * (H * 0.4), rr = R * 0.99;
        bb(gb, sin(a) * rr, y, cos(a) * rr, 0.62, 1.7, 0.2, [0.22, 0.2, 0.26]);
        for (let q = 0; q < 3; q++) bb(g, sin(a) * (rr + 0.05), y + 0.12 + q * 0.5, cos(a) * (rr + 0.05), 0.4, 0.42, 0.14, gl[(i + q + j) % 5]);
      }
      gb.U.fill(0); g.U.fill(0); return { m: gb.build(), g: g.build(), h: H + 3.3 + R * 3, r: R };
    });
  }
  function vitray(k = 0) {
    return memo('vitray' + k, () => {
      const gb = new GB(), g = new GB(), fr = [0.9, 0.84, 0.72], gl = [[0.95, 0.4, 0.45], [0.35, 0.75, 0.95], [1, 0.85, 0.3], [0.45, 0.85, 0.55], [1, 0.6, 0.3], [0.98, 0.7, 0.8]];
      bb(gb, 0, 0, 0, 1.7, 3.0, 0.3, fr);
      for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) bb(g, -0.5 + i * 0.5, 0.25 + j * 0.45, 0.16, 0.44, 0.4, 0.04, gl[(i * 3 + j * 2 + k) % 6]);
      bb(g, 0, 2.45, 0.16, 0.5, 0.4, 0.04, gl[(k + 1) % 6]);
      gb.U.fill(0); g.U.fill(0); return { m: gb.build(), g: g.build() };
    });
  }
  function ejderhaHeykel(k = 0) {
    return memo('ejh' + k, () => {
      const gb = new GB(), st = [0.84, 0.82, 0.76], acc = [[0.5, 0.72, 0.68], [0.86, 0.55, 0.55], [0.85, 0.72, 0.4]][k % 3];
      bb(gb, 0, 0, 0, 1.9, 0.5, 1.9, sc(st, 0.8)); bb(gb, 0, 0.5, 0, 1.6, 0.12, 1.6, sc(st, 0.9));
      ball(gb, 0, 1.45, 0, 0.62, 0.74, 0.58, st, 10); ball(gb, 0, 1.55, 0.12, 0.42, 0.52, 0.2, sc(st, 1.08), 8);
      ball(gb, 0, 2.5, 0.2, 0.46, 0.4, 0.44, st, 10); ball(gb, 0, 2.38, 0.6, 0.24, 0.17, 0.2, sc(st, 1.05), 8);
      for (const sx of [-1, 1]) {
        ball(gb, sx * 0.2, 2.62, 0.52, 0.1, 0.12, 0.06, [0.15, 0.15, 0.2], 6); ball(gb, sx * 0.22, 2.65, 0.55, 0.035, 0.035, 0.03, [1, 1, 1], 4);
        tube(gb, [[sx * 0.3, 2.78, 0.0], [sx * 0.42, 3.0, -0.05], [sx * 0.4, 3.2, -0.15]], s => 0.09 * (1 - 0.9 * s), 5, () => acc, { capEnd: true });
        tube(gb, [[sx * 0.5, 1.9, -0.3], [sx * 1.0, 2.4, -0.55], [sx * 1.5, 2.9, -0.6]], s => 0.09 * (1 - 0.5 * s), 5, () => sc(st, 0.9), {});
        for (let q = 0; q < 3; q++) { const t = (q + 1) / 3.2, p = [sx * (0.5 + t), 1.9 + t * 1.0, -0.4 - 0.2 * t]; quadO(gb, [sx * 0.55, 1.9, -0.35], p, [p[0], p[1] - 0.8 - 0.1 * q, p[2] + 0.05], [sx * 0.55, 1.7 - 0.2 * q, -0.35], acc, [0, 0, -1]); }
        ball(gb, sx * 0.36, 0.78, 0.5, 0.2, 0.14, 0.3, sc(st, 0.95), 7);
      }
      tube(gb, [[0, 1.0, -0.5], [0.5, 0.75, -1.0], [1.0, 0.6, -0.8], [1.2, 0.8, -0.3]], s => 0.2 * (1 - 0.8 * s), 6, () => st, {});
      for (let i = 0; i < 4; i++) ball(gb, 0, 1.9 - i * 0.2, -0.5 - i * 0.04, 0.1, 0.13, 0.1, acc, 5);
      gb.U.fill(0); return { m: gb.build() };
    });
  }
  function mangal() {
    return memo('mangal', () => {
      const gb = new GB(), g = new GB(), cu = [0.82, 0.5, 0.3];
      for (let i = 0; i < 3; i++) { const a = i / 3 * TWO + 0.4; tube(gb, [[sin(a) * 0.1, 0.95, cos(a) * 0.1], [sin(a) * 0.3, 0.45, cos(a) * 0.3], [sin(a) * 0.4, 0, cos(a) * 0.4]], () => 0.035, 4, () => IRON, {}); }
      lathe(gb, [[0.12, 0.85], [0.35, 0.95], [0.5, 1.2], [0.48, 1.24], [0.42, 1.22], [0.2, 1.05]], 12, (y, a) => sc(cu, 0.85 + 0.2 * sin(a * 2)));
      ball(g, 0, 1.28, 0, 0.3, 0.2, 0.3, [1, 0.68, 0.3], 9); ball(g, 0, 1.45, 0, 0.17, 0.2, 0.17, [1, 0.88, 0.5], 8);
      gb.U.fill(0); g.U.fill(0); return { m: gb.build(), g: g.build() };
    });
  }
  function yuva() {
    return memo('yuva', () => {
      const gb = new GB(), r = rng(9);
      for (let i = 0; i < 26; i++) { const a = i / 26 * TWO, rr = 1.05 + 0.1 * r(); tube(gb, [[sin(a) * rr, 0.12, cos(a) * rr], [sin(a + 0.4) * (rr + 0.08), 0.22, cos(a + 0.4) * (rr + 0.08)], [sin(a + 0.8) * rr, 0.14, cos(a + 0.8) * rr]], () => 0.07, 4, () => [0.85 + 0.1 * r(), 0.68 + 0.1 * r(), 0.35], {}); }
      lathe(gb, [[1.0, 0.1], [0.5, 0.05], [0.01, 0.1]], 12, () => [0.7, 0.55, 0.3], { hint: [0, 1, 0] });
      const ec = [[0.55, 0.8, 0.75], [0.95, 0.7, 0.72], [0.95, 0.85, 0.5]];
      for (let i = 0; i < 3; i++) { const a = i / 3 * TWO + 0.5; lathe(gb, [[0.01, 0.1], [0.22, 0.2], [0.27, 0.42], [0.22, 0.65], [0.1, 0.78], [0.01, 0.8]], 8, (y, a2) => sc(ec[i], 0.9 + 0.12 * sin(y * 20 + a2 * 3)), { x: sin(a) * 0.35, z: cos(a) * 0.35 }); }
      gb.U.fill(0); return { m: gb.build() };
    });
  }
  function salon() {   // büyük salon cephesi: x boyunca 18, derinlik 6, yükseklik ~11; 3 vitray + çift kapı + payandalar + sivri kemerli çatı
    return memo('salon', () => {
      const gb = new GB(), g = new GB(), st = [0.96, 0.9, 0.78], rf = [0.82, 0.44, 0.42], W = 18, D = 6, H = 7;
      bb(gb, 0, 0, 0, W + 0.8, 0.8, D + 0.8, sc(st, 0.8)); bb(gb, 0, 0.8, 0, W, H, D, st, { notop: true });
      for (let i = -2; i <= 2; i++) bb(gb, i * W / 4, 0.8, D / 2 + 0.3, 0.9, H - 0.4, 0.8, sc(st, 0.9));   // payandalar
      for (let i = -2; i <= 2; i++) bb(gb, i * W / 4, H + 0.4, D / 2 + 0.3, 1.0, 0.4, 0.9, sc(st, 1.05));
      for (const sx of [-1, 1]) { const x = sx * W * 0.31; bb(gb, x, 1.8, D / 2 + 0.06, 1.7, 3.0, 0.3, [0.9, 0.84, 0.72]); for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) bb(g, x - 0.5 + i * 0.5, 2.05 + j * 0.45, D / 2 + 0.24, 0.42, 0.38, 0.04, [[0.95, 0.4, 0.45], [0.35, 0.75, 0.95], [1, 0.85, 0.3], [0.45, 0.85, 0.55], [1, 0.6, 0.3], [0.98, 0.7, 0.8]][(i * 3 + j * 2 + (sx > 0 ? 1 : 0)) % 6]); bb(g, x, 4.35, D / 2 + 0.24, 0.5, 0.4, 0.04, [1, 0.85, 0.3]); }
      bb(gb, 0, 0.8, D / 2 + 0.1, 3.2, 3.8, 0.3, [0.5, 0.33, 0.2]); bb(gb, 0, 4.4, D / 2 + 0.1, 3.6, 0.3, 0.5, sc(st, 1.0)); for (const sx of [-1, 1]) bb(gb, sx * 0.8, 0.8, D / 2 + 0.28, 0.07, 3.6, 0.06, [0.85, 0.7, 0.3]);
      ball(gb, 0, 4.3, D / 2 + 0.1, 1.7, 0.7, 0.3, [0.5, 0.33, 0.2], 10);
      gable(gb, 0, 0.8 + H, 0, W, D, 3.4, 0.7, rf, st);
      for (let i = -3; i <= 3; i++) bb(gb, i * 2.6, 0.8 + H, D / 2 + 0.05, 0.6, 0.45, 0.3, st);
      gb.U.fill(0); g.U.fill(0); return { m: gb.build(), g: g.build(), h: H + 4.2 };
    });
  }
  function sutun() {
    return memo('sutun', () => { const gb = new GB(), st = [0.95, 0.91, 0.82]; bb(gb, 0, 0, 0, 1.0, 0.3, 1.0, sc(st, 0.9)); lathe(gb, [[0.36, 0.3], [0.31, 0.5], [0.3, 3.0], [0.34, 3.2]], 10, (y, a) => sc(st, 0.86 + 0.14 * Math.abs(sin(a * 5)))); bb(gb, 0, 3.2, 0, 0.9, 0.3, 0.9, sc(st, 1.05)); gb.U.fill(0); return { m: gb.build() }; });
  }
  // ═════════ FENER ═════════
  const CAM9 = [[1, 0.35, 0.4], [1, 0.62, 0.28], [1, 0.9, 0.3], [0.5, 0.88, 0.45], [0.3, 0.85, 0.8], [0.35, 0.65, 1], [0.55, 0.5, 1], [1, 0.5, 0.85], [1, 0.8, 0.85]];
  function fenerKulesi() {
    return memo('fener', () => {
      const gb = new GB(), g = new GB(), st = [0.96, 0.93, 0.86], red = [0.82, 0.33, 0.33], N = 9, H = 22, R0 = 3.6, R1 = 2.4;
      lathe(gb, [[R0 + 1.6, -0.4], [R0 + 1.2, 0.6], [R0 + 0.5, 1.3], [R0 + 0.1, 1.6]], 9, (y, a) => sc([0.5, 0.5, 0.52], 0.8 + 0.3 * vn(a * 2, y * 2, 4)));
      const bands = 6, bh = (H - 1.6) / bands;
      for (let b = 0; b < bands; b++) {
        const ra = R0 + (R1 - R0) * b / bands, rb = R0 + (R1 - R0) * (b + 1) / bands, col = b % 2 ? red : st;
        prismN(gb, 0, 1.6 + b * bh, 0, ra, rb, bh, N, 0.2, (i, am) => sc(col, 0.8 + 0.2 * (0.5 + 0.5 * cos(am - 0.6)) + 0.04 * (i % 2)));
      }
      bb(gb, 0, 1.6, R0 * 0.94, 1.5, 2.3, 0.4, [0.45, 0.3, 0.2]); ball(gb, 0, 3.9, R0 * 0.93, 0.75, 0.4, 0.15, [0.45, 0.3, 0.2], 8);
      for (let b = 0; b < bands - 1; b++) { const rr = R0 + (R1 - R0) * ((b + 1) / bands + 0.08); for (const a of [0.8, 2.6, 4.4]) { const aa = a + b * 0.5; bb(gb, sin(aa) * rr * 0.96, 1.6 + b * bh + bh * 0.5, cos(aa) * rr * 0.96, 0.42, 0.8, 0.14, [0.2, 0.25, 0.35]); } }
      const yb = H;
      prismN(gb, 0, yb - 0.3, 0, R1 + 1.15, R1 + 1.15, 0.3, N, 0.2, () => sc(red, 0.9)); capN(gb, 0, yb, 0, R1 + 1.15, N, 0.2, sc(st, 0.9));
      for (let i = 0; i < N * 2; i++) { const a = 0.2 + i / (N * 2) * TWO, a2 = a + TWO / (N * 2), R = R1 + 1.05; beam(gb, [sin(a) * R, yb, cos(a) * R], [sin(a) * R, yb + 0.9, cos(a) * R], 0.04, IRON); beam(gb, [sin(a) * R, yb + 0.9, cos(a) * R], [sin(a2) * R, yb + 0.9, cos(a2) * R], 0.035, IRON); }
      const LR = R1 - 0.2, LH = 3.6;
      for (let i = 0; i < N; i++) {
        const a0 = 0.2 + i / N * TWO, a1 = 0.2 + (i + 1) / N * TWO, am = (a0 + a1) / 2, c = CAM9[i];
        const A = [sin(a0) * LR, yb, cos(a0) * LR], B = [sin(a1) * LR, yb, cos(a1) * LR], C = [sin(a1) * LR * 0.96, yb + LH, cos(a1) * LR * 0.96], D = [sin(a0) * LR * 0.96, yb + LH, cos(a0) * LR * 0.96];
        const lp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t], e = 0.12;
        const L0 = lp(A, B, e), L1 = lp(A, B, 1 - e), T0 = lp(D, C, e), T1 = lp(D, C, 1 - e);
        quadO(g, lp(L0, T0, 0.06), lp(L1, T1, 0.06), lp(L1, T1, 0.94), lp(L0, T0, 0.94), [c[0] * 1.1, c[1] * 1.1, c[2] * 1.1], [sin(am), 0, cos(am)]);
        beam(gb, A, D, 0.07, IRON);
      }
      lathe(gb, [[LR * 1.12, yb + LH], [LR * 1.15, yb + LH + 0.25], [LR * 1.05, yb + LH + 0.5]], N, () => sc(red, 0.9));
      lathe(gb, [[LR * 1.1, yb + LH + 0.5], [LR * 0.9, yb + LH + 1.1], [LR * 0.5, yb + LH + 1.8], [LR * 0.1, yb + LH + 2.2], [0.01, yb + LH + 2.3]], 12, (y, a) => sc(red, 0.86 + 0.14 * sin(a * 5)));
      ball(gb, 0, yb + LH + 2.45, 0, 0.2, 0.2, 0.2, [0.95, 0.78, 0.3], 7); beam(gb, [0, yb + LH + 2.6, 0], [0, yb + LH + 3.4, 0], 0.03, IRON);
      ball(g, 0, yb + 1.7, 0, 0.55, 0.55, 0.55, [1, 0.92, 0.6], 8);
      gb.U.fill(0); g.U.fill(0); return { m: gb.build(), g: g.build(), h: yb + LH + 3.4, topY: yb + 1.7, R0 };
    });
  }
  function kayalik(k = 0) {
    return memo('kaya' + k, () => {
      const gb = new GB(), r = rng(k * 41 + 11);
      gb.grid(14, 8, true, (u, v) => { const a = u * TWO, rad = (1.0 - v * v * 0.55) * (1 + 0.28 * (vn(sin(a) * 1.3 + k * 5, v * 2, cos(a) * 1.3) - 0.5)); const L = 0.72 + 0.4 * fbm(sin(a) * 2 + k, v * 3, cos(a) * 2); const g = v > 0.82 ? [0.4, 0.62, 0.35] : [0.6, 0.6, 0.62]; return [sin(a) * rad, v * (1.0 + 0.2 * r()), cos(a) * rad, g[0] * L, g[1] * L, g[2] * L]; }, { pt: true });
      gb.U.fill(0); return { m: gb.build() };
    });
  }
  function tasKopru(len = 8, wid = 2.6) {
    return memo('tkopru' + len + '_' + wid, () => {
      const gb = new GB(), st = [0.86, 0.82, 0.74], n = Math.round(len / 0.5);
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n, z0 = -len / 2 + t0 * len, z1 = -len / 2 + t1 * len, y0 = 0.5 * sin(t0 * PI), y1 = 0.5 * sin(t1 * PI), L = 0.92 + 0.08 * (i % 2);
        quadO(gb, [-wid / 2, y0, z0], [wid / 2, y0, z0], [wid / 2, y1, z1], [-wid / 2, y1, z1], sc(st, L), [0, 1, 0]);
        for (const sx of [-1, 1]) quadO(gb, [sx * wid / 2, y0 - 0.45, z0], [sx * wid / 2, y1 - 0.45, z1], [sx * wid / 2, y1, z1], [sx * wid / 2, y0, z0], sc(st, 0.8 * L), [sx, 0, 0]);
      }
      for (const sx of [-1, 1]) for (let i = 0; i <= 4; i++) {
        const t = i / 4, z = -len / 2 + t * len, y = 0.5 * sin(t * PI);
        bb(gb, sx * wid / 2, y, z, 0.3, 0.95, 0.3, st); bb(gb, sx * wid / 2, y + 0.95, z, 0.4, 0.12, 0.4, sc(st, 1.05));
        if (i < 4) { const z2 = -len / 2 + (i + 1) / 4 * len, y2 = 0.5 * sin((i + 1) / 4 * PI); beam(gb, [sx * wid / 2, y + 0.75, z], [sx * wid / 2, y2 + 0.75, z2], 0.06, sc(st, 0.9)); }
      }
      gb.U.fill(0); return { m: gb.build() };
    });
  }
  function fener() {
    return memo('fenerl', () => {
      const gb = new GB(), g = new GB(); tube(gb, [[0, 0, 0], [0, 1.0, 0], [0, 1.8, 0]], () => 0.06, 5, () => [0.3, 0.26, 0.24], { capEnd: true });
      bb(gb, 0, 1.75, 0, 0.36, 0.05, 0.36, IRON); bb(gb, 0, 2.3, 0, 0.4, 0.05, 0.4, IRON);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) beam(gb, [sx * 0.15, 1.78, sz * 0.15], [sx * 0.15, 2.3, sz * 0.15], 0.018, IRON);
      lathe(gb, [[0.26, 2.33], [0.01, 2.6]], 4, () => IRON); ball(g, 0, 2.03, 0, 0.13, 0.2, 0.13, [1, 0.82, 0.45], 7);
      gb.U.fill(0); g.U.fill(0); return { m: gb.build(), g: g.build() };
    });
  }
  function oyuncakRaf(k = 0) {
    return memo('raf' + k, () => {
      const gb = new GB(), c = [[0.9, 0.35, 0.3], [0.3, 0.55, 0.85], [0.95, 0.78, 0.28], [0.4, 0.75, 0.5], [0.95, 0.6, 0.35]];
      for (const sx of [-1, 1]) bb(gb, sx * 0.95, 0, 0, 0.1, 2.0, 0.5, WOOD);
      for (const y of [0.05, 0.7, 1.35, 1.95]) bb(gb, 0, y, 0, 2.0, 0.08, 0.52, sc(WOOD, 0.9));
      bb(gb, 0, 0.1, -0.24, 1.9, 1.85, 0.04, sc(WOOD, 0.7));
      for (let sh = 0; sh < 3; sh++) {
        const y = 0.13 + sh * 0.65;
        for (let i = 0; i < 4; i++) {
          const t = (i + sh * 2 + k) % 5, x = -0.7 + i * 0.47 + (sh % 2) * 0.1;
          if (t === 0) bb(gb, x, y, 0, 0.3, 0.3, 0.3, c[(i + sh) % 5]); else if (t === 1) ball(gb, x, y + 0.17, 0, 0.17, 0.17, 0.17, c[(i + 2) % 5], 7);
          else if (t === 2) { ball(gb, x, y + 0.2, 0, 0.17, 0.2, 0.15, [0.72, 0.5, 0.3], 7); ball(gb, x, y + 0.45, 0, 0.12, 0.12, 0.12, [0.72, 0.5, 0.3], 6); }
          else if (t === 3) { bb(gb, x, y, 0, 0.16, 0.16, 0.16, c[i % 5]); bb(gb, x + 0.05, y + 0.16, 0, 0.16, 0.16, 0.16, c[(i + 1) % 5]); }
          else { bb(gb, x, y, 0, 0.36, 0.2, 0.2, sc(WOOD, 1.1)); for (const wx of [-0.12, 0.12]) ball(gb, x + wx, y + 0.06, 0.12, 0.07, 0.07, 0.03, [0.3, 0.2, 0.15], 5); }
        }
      }
      gb.U.fill(0); return { m: gb.build() };
    });
  }
  return { salon, ev, kule, sur, tezgah, lamba, cesme, sancakDirek, bez, bayrakIpi, araba, fici, sandik, bank, saksi, saatKulesi, kemer, buyukKule, vitray, ejderhaHeykel, mangal, yuva, sutun,
    fenerKulesi, kayalik, tasKopru, fener, oyuncakRaf, CAM9, bb, beam, lathe, ball, prismN, quadO, triO, gable, hx, sc, PLASTER, ROOFC, STRIPE, STONE, WOOD, IRON };
})();
if (typeof window !== 'undefined') window.YAPI = YAPI;
