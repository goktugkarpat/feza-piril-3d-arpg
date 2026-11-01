/* ── PROPKIT.tree: yeniden kullanılabilir AĞAÇ takımı (G3) ──
   PROPKIT.tree(tur, k) → { wood, leaf, glow, fruit } (köşe renkli, birim boy 1 = ağaç boyu; yarıçap ~0.4 tepe)
   Türler: 'round' (orman ağacı, yumuşak yaprak öbekleri) · 'willow' (salkım söğüt: sarkan dallar) · 'fruit' (meyveli, değirmen)
           'coral' (mercan "ağacı": çatallı dal + ışıklı uç) · 'crystal' (kristal ağaç, mağara) · 'shelf' (mantar ağacı: raf mantarı katları,
           bölüm 1) · 'pine' (kat kat iğne yapraklı, kale/şehir) · 'dead' (kuru, yanardağ)
   Yerleştirme:  PROPKIT.placeTree(api, tur, k, x, z, boy, {yaw, leaf:0x..(tint), glow:0x.., wood:0x.., fruit:0x..})
   Hepsi tek çağrıyla birleşik süse girer (çizim çağrısı eklemez). Tema renkleri çağırandan gelir. */
(() => {
  'use strict';
  const K = PROPKIT, { GB, tube, rng, vn, fbm, sstep, mix, clamp } = K;
  const PI = Math.PI, TWO = PI * 2, sin = Math.sin, cos = Math.cos, hyp = Math.hypot;
  const CACHE = {};
  const bark = (s, q, k) => { const L = 0.42 + 0.34 * vn(q * 6 + k, s * 9, k) + 0.14 * Math.abs(sin(q * TWO * 4 + s * 3)); return [0.62 * L, 0.43 * L, 0.3 * L]; };

  // gövde: hafif S kıvrımlı, tabanda kök ayakları, yosunlu
  function trunk(gb, h, R, k, o = {}) {
    const r = rng(k * 131 + 1), pts = [], N = 5, bend = o.bend ?? 0.07, ph = r() * 6;
    for (let i = 0; i <= N; i++) { const s = i / N; pts.push([sin(s * 3 + ph) * bend * s * h * 0.6, s * h, cos(s * 2.4 + ph) * bend * s * h * 0.5]); }
    tube(gb, pts, s => R * (1 - 0.55 * s) * (1 + 0.5 * Math.exp(-s * 14)) + 0.01, o.sides || 6, (s, q) => bark(s, q, k), { rough: 0.3 });
    const nr = o.roots ?? 4;
    for (let i = 0; i < nr; i++) {
      const a = i / nr * TWO + r() * 0.6, len = R * (2.2 + r() * 1.8), dx = sin(a), dz = cos(a), rp = [];
      for (let j = 0; j <= 3; j++) { const s = j / 3; rp.push([dx * (R * 0.7 + s * len), R * 1.6 * Math.pow(1 - s, 2.4) + 0.004 - 0.01 * s, dz * (R * 0.7 + s * len)]); }
      tube(gb, rp, s => R * 0.5 * (1 - s) + 0.008, 4, (s, q) => bark(s, q, k + i), { rough: 0.3 });
    }
    return pts;
  }
  function branch(gb, from, to, R, k) {
    const mx = (from[0] + to[0]) / 2 + (vn(k, 1, 2) - 0.5) * 0.05, my = (from[1] + to[1]) / 2 + 0.03, mz = (from[2] + to[2]) / 2;
    tube(gb, [from, [mx, my, mz], to], s => R * (1 - 0.65 * s), 4, (s, q) => bark(s, q, k), { rough: 0.2 });
  }
  // yumuşak yaprak öbeği: gürültü + tırtıllı kenar; üstü açık, altı koyu, öbek başına ton oynaması
  function blob(gb, cx, cy, cz, R, sy, seed, hue = 0, o = {}) {
    const ph = seed * 3.7;
    gb.grid(o.nu || (o.lod ? 6 : 8), o.nv || (o.lod ? 4 : 5), true, (u, v) => {
      const a = u * TWO, el = (v - 0.5) * PI, dx = cos(el) * sin(a), dy = sin(el), dz = cos(el) * cos(a);
      let rr = R * (1 + 0.2 * (fbm(dx * 1.7 + ph, dy * 1.7, dz * 1.7) - 0.5) * 2) * (1 + 0.07 * Math.abs(sin(a * 6 + el * 4 + ph)));
      const yy = cy + dy * rr * sy * (dy < 0 ? 0.55 : 1);
      const L = (0.46 + 0.54 * sstep(-0.9, 0.9, dy)) * (0.88 + 0.2 * fbm(dx * 3 + ph, dy * 3, dz * 3));
      const warm = hue * 0.25 * sstep(0.2, 1, dy);
      return [cx + dx * rr, yy, cz + dz * rr, L * (0.82 + warm + 0.1 * dy), L, L * (0.82 - warm * 0.6)];
    }, { pb: true, pt: true });
  }
  function strand(gb, x, y, z, len, k, grow = 1) {   // sarkan söğüt/sarmaşık dalı: ince şerit (ucu sivri), minik yaprak çiftleri
    const r = rng(k * 7 + 3), sw = (r() - 0.5) * 0.06, N = 3, rows = [];
    const wd = 0.007;
    for (let i = 0; i <= N; i++) { const s = i / N, px = x + sw * s * s + sin(s * 4 + k) * 0.012, pz = z + cos(s * 3 + k) * 0.012, L = 0.45 + 0.55 * s, w = wd * (1 - s * 0.8); rows.push([[px - w, y - len * s, pz], [px + w, y - len * s, pz], [L * 0.7, L, L * 0.6]]); }
    const t0 = gb.I.length / 3;
    const ids = rows.map(([a, b, c]) => [gb.add(a[0], a[1], a[2], c[0], c[1], c[2]), gb.add(b[0], b[1], b[2], c[0], c[1], c[2])]);
    for (let i = 0; i < N; i++) gb.I.push(ids[i][0], ids[i + 1][0], ids[i][1], ids[i][1], ids[i + 1][0], ids[i + 1][1]);
    gb._orient(t0, [0, 0, 1], null);
    for (let i = 1; i < N; i += 2) {
      const p = rows[i][0], a = r() * TWO, L = 0.04 + r() * 0.02, aa = a, tip = [p[0] + sin(aa) * L, p[1] - L * 0.6, p[2] + cos(aa) * L], m1 = [p[0] + sin(aa + 0.6) * L * 0.5, p[1] - L * 0.1, p[2] + cos(aa + 0.6) * L * 0.5];
      const t1 = gb.I.length / 3; gb.tri(p, m1, tip, [0.5, 0.8, 0.5], [0.8, 1, 0.65], [0.9, 1, 0.7]); gb._orient(t1, [0, 1, 0], null);
    }
    void grow;
  }
  function bulb(gb, x, y, z, R, nu = 5, nv = 3, c = [1, 1, 1]) {
    gb.grid(nu, nv, true, (u, v) => { const a = u * TWO, el = (v - 0.5) * PI; const L = 0.6 + 0.4 * sstep(-0.8, 0.9, sin(el)); return [x + cos(el) * sin(a) * R, y + sin(el) * R, z + cos(el) * cos(a) * R, c[0] * L, c[1] * L, c[2] * L]; }, { pb: true, pt: true });
  }
  function shelfDisc(gb, x, y, z, R, th, yaw, col, k) {   // yarım disk raf mantarı (gövdeye yapışık), üstü kabarık
    const r = rng(k * 5 + 1);
    gb.grid(7, 2, false, (u, v) => {
      const a = (u - 0.5) * PI * 1.0 + yaw, rr = R * v * (1 + 0.08 * (vn(u * 3 + k, v * 2, 1) - 0.5)), top = th * (1 - v * v) + 0.01, wav = 0.012 * sin(u * 18 + k) * v;
      const L = mix(1, 0.72, v * v) * (0.95 + 0.08 * r());
      return [x + sin(a) * rr, y + top + wav - (v > 0.85 ? 0.01 : 0), z + cos(a) * rr, col[0] * L, col[1] * L, col[2] * L];
    }, { hint: [0, 1, 0] });
    gb.grid(7, 1, false, (u, v) => {   // alt yüz (açık krem, ince çizgili)
      const a = (u - 0.5) * PI + yaw, rr = R * (1 - v) * 0.98, L = 0.8 + 0.15 * ((u * 20) % 2 < 1 ? 1 : 0);
      return [x + sin(a) * rr, y + 0.0 + 0.012 * v, z + cos(a) * rr, L, L * 0.92, L * 0.78];
    }, { hint: [0, -1, 0] });
  }

  function treeParts(kind, k, lod = 0) {
    const wood = new GB(), leaf = new GB(), glow = new GB(), fruit = new GB(), r = rng(k * 977 + kind.length);
    let hasGlow = false, hasFruit = false;
    if (kind === 'round' || kind === 'fruit' || kind === 'willow') {
      const will = kind === 'willow', H = will ? 0.62 : 0.55;
      const tp = trunk(wood, H, will ? 0.065 : 0.07, k, { bend: will ? 0.2 : 0.09, roots: lod ? 3 : 4, sides: lod ? 5 : 6 });
      const top = tp[tp.length - 1], n = will ? 4 : (lod ? 5 : 6), blobs = [];
      for (let i = 0; i < n; i++) {
        const a = i / n * TWO + r(), d = will ? 0.12 + r() * 0.14 : 0.14 + r() * 0.18, bx = top[0] + sin(a) * d, bz = top[2] + cos(a) * d, by = H + (will ? 0.15 + r() * 0.1 : 0.12 + r() * 0.2);
        blobs.push([bx, by, bz, will ? 0.2 + r() * 0.08 : 0.21 + r() * 0.1]);
        branch(wood, [top[0] * (0.5 + 0.5 * (i / n)), H * (0.62 + 0.3 * r()), top[2] * 0.6], [bx * 0.9, by - 0.07, bz * 0.9], 0.026, k + i);
      }
      blobs.push([top[0], H + (will ? 0.28 : 0.38), top[2], will ? 0.28 : 0.3]);
      blobs.forEach((b, i) => blob(leaf, b[0], b[1], b[2], b[3], will ? 0.62 : 0.85, k * 9 + i, (r() - 0.3) * 2, { lod }));
      if (will) { for (let i = 0; i < (lod ? 6 : 10); i++) { const a = i / (lod ? 6 : 10) * TWO + r() * 0.3, d = 0.22 + r() * 0.1; strand(leaf, top[0] + sin(a) * d, H + 0.26 + r() * 0.06, top[2] + cos(a) * d, 0.35 + r() * 0.3, k * 31 + i); } }
      if (kind === 'fruit') { hasFruit = true; for (let i = 0; i < 7; i++) { const b = blobs[(r() * blobs.length) | 0], a = r() * TWO, el = (0.1 + r() * 0.5) * PI * 0.5; bulb(fruit, b[0] + sin(a) * b[3] * 0.95 * cos(el), b[1] - b[3] * 0.1 + sin(el) * 0.0, b[2] + cos(a) * b[3] * 0.95 * cos(el), 0.028, 5, 3, [1, 0.45 + 0.4 * r(), 0.25]); } }
      if (will) { hasGlow = true; for (let i = 0; i < 6; i++) { const a = r() * TWO, d = 0.25 + r() * 0.08; bulb(glow, top[0] + sin(a) * d, H + 0.05 + r() * 0.3, top[2] + cos(a) * d, 0.012, 4, 3); } }
    } else if (kind === 'pine') {
      trunk(wood, 0.5, 0.05, k, { bend: 0.03, roots: lod ? 3 : 4, sides: lod ? 5 : 6 });
      const tiers = lod ? 5 : 6; for (let i = 0; i < tiers; i++) { const s = i / (tiers - 1), R = 0.4 * (1 - s * 0.8) + 0.05, y = 0.22 + s * 0.7; leaf.grid(lod ? 9 : 10, 2, true, (u, v) => { const a = u * TWO, rr = R * (v === 0 ? 1 : v === 1 ? 0.5 : 0) * (1 + 0.12 * sin(a * 5 + i)), yy = y - 0.11 * (v === 0 ? 1 : v === 1 ? 0.4 : -0.7); const L = (v === 0 ? 0.55 : 0.85 + 0.15 * v) * (0.9 + 0.2 * vn(a, i, 1)); return [sin(a) * rr, yy, cos(a) * rr, L * 0.85, L, L * 0.85]; }, { pt: true }); }
    } else if (kind === 'dead') {
      const tp = trunk(wood, 0.8, 0.05, k, { bend: 0.25, roots: 4 });
      for (let i = 0; i < 5; i++) { const s = 0.4 + r() * 0.5, a = r() * TWO, base = tp[Math.floor(s * (tp.length - 1))], L = 0.18 + r() * 0.2; const pts = [[base[0], base[1], base[2]], [base[0] + sin(a) * L * 0.5, base[1] + L * 0.3, base[2] + cos(a) * L * 0.5], [base[0] + sin(a) * L, base[1] + L * 0.7, base[2] + cos(a) * L]]; tube(wood, pts, t => 0.022 * (1 - 0.85 * t), 4, (t, q) => bark(t, q, k + i), { rough: 0.2 }); }
    } else if (kind === 'coral') {
      hasGlow = true;
      const branchR = (gb, p, dir, len, R, depth) => {
        const q = [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + dir[2] * len], mid = [(p[0] + q[0]) / 2 + (r() - 0.5) * 0.03, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2 + (r() - 0.5) * 0.03];
        tube(gb, [p, mid, q], s => R * (1 - 0.4 * s), 5, (s, qq) => { const L = 0.65 + 0.35 * vn(qq * 5, s * 6, depth + k); return [L, L * 0.92, L * 0.9]; }, { rough: 0.25 });
        if (depth >= 3) { bulb(glow, q[0], q[1], q[2], 0.022 + r() * 0.012, 5, 3); return; }
        const kids = depth === 0 ? 3 : 2;
        for (let i = 0; i < kids; i++) {
          const a = r() * TWO + i * 2.1, sp = 0.5 + r() * 0.4; let d = [dir[0] + sin(a) * sp, dir[1] * 0.9 + 0.35, dir[2] + cos(a) * sp]; const l = hyp(...d); d = d.map(x => x / l);
          branchR(gb, q, d, len * (0.68 + 0.15 * r()), R * 0.62, depth + 1);
        }
      };
      for (let i = 0; i < 3; i++) { const a = i / 3 * TWO + r(); branchR(leaf, [sin(a) * 0.04, 0, cos(a) * 0.04], [sin(a) * 0.2, 1, cos(a) * 0.2], 0.28, 0.05, 0); }
    } else if (kind === 'crystal') {
      hasGlow = true;
      for (let i = 0; i < 9; i++) {
        const big = i === 0, H = big ? 0.95 : 0.25 + r() * 0.4, R = big ? 0.075 : 0.03 + r() * 0.04, a = r() * TWO, d = big ? 0 : 0.05 + r() * 0.12, lean = big ? 0.04 : 0.2 + r() * 0.35, la = r() * TWO, ox = sin(a) * d, oz = cos(a) * d, sides = 6;
        const ring = (y, rr, sk) => Array.from({ length: sides }, (_, s) => { const q = s / sides * TWO; return [ox + sin(q) * rr + sin(la) * lean * y * 0.6 * sk, y, oz + cos(q) * rr + cos(la) * lean * y * 0.6 * sk]; });
        const b0 = ring(-0.01, R * 0.9, 0), b1 = ring(H * 0.75, R, 1), tp = [ox + sin(la) * lean * H * 0.6, H, oz + cos(la) * lean * H * 0.6];
        for (let s = 0; s < sides; s++) {
          const s2 = (s + 1) % sides, sh = 0.7 + 0.3 * ((s * 5) % 3) / 2, lo = 0.4 * sh, hi = sh;
          const t0 = glow.I.length / 3; glow.quad(b0[s], b0[s2], b1[s2], b1[s], [lo, lo, lo]); for (let q = 0; q < 4; q++) glow.C[(glow.n - 4 + q) * 3] = glow.C[(glow.n - 4 + q) * 3 + 1] = glow.C[(glow.n - 4 + q) * 3 + 2] = q < 2 ? lo : hi * 0.9; glow._orient(t0, [b1[s][0] - ox, 0, b1[s][2] - oz], null);
          const t1 = glow.I.length / 3; glow.tri(b1[s], b1[s2], tp, [hi * 0.9, hi * 0.9, hi * 0.9], [hi * 0.9, hi * 0.9, hi * 0.9], [1, 1, 1]); glow._orient(t1, [(b1[s][0] + b1[s2][0]) / 2 - ox, 0.6, (b1[s][2] + b1[s2][2]) / 2 - oz], null);
        }
      }
      const tl = new GB(); void tl;
      // gövde yerine taşlı kaide
      for (let i = 0; i < 5; i++) { const a = i / 5 * TWO; wood.grid(7, 4, true, (u, v) => { const q = u * TWO, el = (v - 0.5) * PI, rr = 0.07 * (1 + 0.3 * (vn(q * 2, el, i) - 0.5)); const L = 0.5 + 0.3 * vn(q, el, i + 4); return [sin(a) * 0.09 + cos(el) * sin(q) * rr * 1.4, Math.max(-0.01, sin(el) * rr * 0.7 + 0.015), cos(a) * 0.09 + cos(el) * cos(q) * rr * 1.4, 0.55 * L, 0.6 * L, 0.75 * L]; }, { pb: true, pt: true }); }
    } else if (kind === 'shelf') {   // mantar ağacı: kıvrık gövde + kat kat raf mantarı + tepede şapka + sarkan ışıklar
      hasGlow = true;
      const tp = trunk(wood, 0.82, 0.075, k, { bend: 0.14, roots: lod ? 2 : 4, sides: lod ? 5 : 6 });
      const pal = [[1, 0.6, 0.82], [0.62, 0.78, 1], [1, 0.76, 0.52], [0.6, 0.92, 0.78], [1, 0.9, 0.55]];
      const nS = lod ? 4 : 5; for (let i = 0; i < nS; i++) {
        const s = 0.28 + i / nS * 0.62, p = tp[Math.min(tp.length - 1, Math.floor(s * (tp.length - 1)))], a = i * 2.4 + r(), R = 0.2 - i * 0.012 + r() * 0.04;
        shelfDisc(leaf, p[0] + sin(a) * 0.035, p[1], p[2] + cos(a) * 0.035, R, 0.045, a, pal[(i + k) % pal.length], k + i);
        for (let j = 0; j < 2; j++) { const q = (j - 0.5) * 0.6, rr = R * (0.48 + 0.22 * j); bulb(glow, p[0] + sin(a + q) * rr, p[1] + 0.05, p[2] + cos(a + q) * rr, 0.012, 4, 3); }
        if (!lod && i % 2 === 0) for (let j = 0; j < 2; j++) { const q = (j - 0.5) * 1.1; strand(leaf, p[0] + sin(a + q) * R * 0.98, p[1] + 0.005, p[2] + cos(a + q) * R * 0.98, 0.1 + r() * 0.14, k * 13 + i * 3 + j); }
      }
      const top = tp[tp.length - 1], capR = 0.3;
      leaf.grid(lod ? 10 : 12, 5, true, (u, v) => {
        const a = u * TWO, pr = [[0.9, 0], [1, 0.07], [0.97, 0.22], [0.8, 0.44], [0.5, 0.62], [0.2, 0.7], [0, 0.72]], f = clamp(v) * 6, i = Math.min(5, Math.floor(f)), t = f - i, rr = mix(pr[i][0], pr[i + 1][0], t), yy = mix(pr[i][1], pr[i + 1][1], t);
        const L = mix(0.7, 1, sstep(0, 0.5, v)) * (0.92 + 0.14 * fbm(sin(a) * 3, v * 3, cos(a) * 3));
        return [top[0] + sin(a) * rr * capR, top[1] - 0.02 + yy * capR * 0.7, top[2] + cos(a) * rr * capR, 1.0 * L, 0.58 * L, 0.82 * L];
      }, { pt: true });
      for (let i = 0; i < 5; i++) { const a = r() * TWO, t = 0.3 + r() * 0.5, rr = capR * (1 - t * 0.9) * 0.95, yy = top[1] - 0.02 + capR * 0.7 * (0.72 * (1 - t * t) * 0.9 + 0.02); bulb(leaf, top[0] + sin(a) * rr, yy, top[2] + cos(a) * rr, 0.022 + r() * 0.02, 5, 3, [1, 0.95, 0.9]); }
      for (let i = 0; i < (lod ? 3 : 5); i++) { const a = i / (lod ? 3 : 5) * TWO; strand(leaf, top[0] + sin(a) * capR * 0.92, top[1] - 0.01, top[2] + cos(a) * capR * 0.92, 0.12 + r() * 0.2, k * 17 + i); bulb(glow, top[0] + sin(a) * capR * 0.92, top[1] - 0.14 - r() * 0.2, top[2] + cos(a) * capR * 0.92, 0.014, 4, 3); }
    }
    const out = { wood: wood.build((i, nx, ny, nz, c, x, y) => { const m = sstep(0.45, 0.9, ny) * (kind === 'coral' ? 0 : 0.7) + (1 - sstep(0, 0.07, y)) * 0.35; c[0] = mix(c[0], 0.28, m); c[1] = mix(c[1], 0.58, m); c[2] = mix(c[2], 0.3, m); }), leaf: leaf.n ? leaf.build() : null, glow: hasGlow && glow.n ? glow.build() : null, fruit: hasFruit ? fruit.build() : null };
    return out;
  }
  // pofuduk top: tüylü, yumuşak (birim yarıçap, merkez 0): üst açık, alt koyu, küçük ışıklı benekler
  K.puff = () => CACHE.puff || (CACHE.puff = (() => {
    const gb = new GB();
    gb.grid(9, 6, true, (u, v) => {
      const a = u * TWO, el = (v - 0.5) * PI, dx = cos(el) * sin(a), dy = sin(el), dz = cos(el) * cos(a);
      const rr = 1 + 0.07 * (fbm(dx * 5, dy * 5, dz * 5) - 0.5) * 2 + 0.035 * Math.abs(sin(a * 9 + el * 7));
      const L = (0.62 + 0.38 * sstep(-0.8, 0.9, dy)) * (0.93 + 0.12 * fbm(dx * 8, dy * 8, dz * 8));
      return [dx * rr, dy * rr, dz * rr, L, L, L * 0.98];
    }, { pb: true, pt: true });
    return gb.build();
  })());
  // alçak çalı (boy ~0.7, yarıçap ~0.6): yaprak öbekleri + ışıklı yemişler; { leaf, glow }
  K.bush = (k = 0) => CACHE['bush' + k] || (CACHE['bush' + k] = (() => {
    const leaf = new GB(), glow = new GB(), r = rng(k * 313 + 5), n = 4;
    for (let i = 0; i < n; i++) { const a = i / n * TWO + r(), d = i ? 0.22 + r() * 0.15 : 0; blob(leaf, sin(a) * d, 0.24 + r() * 0.1, cos(a) * d, 0.26 + r() * 0.1, 0.8, k * 7 + i, (r() - 0.3) * 2, { nu: 7, nv: 4 }); }
    for (let i = 0; i < 3; i++) { const a = r() * TWO, d = 0.2 + r() * 0.3; bulb(glow, sin(a) * d, 0.3 + r() * 0.25, cos(a) * d, 0.022, 4, 3); }
    return { leaf: leaf.build(), glow: glow.build() };
  })());
  K.tree = (kind = 'round', k = 0, lod = 0) => CACHE[kind + k + '_' + lod] || (CACHE[kind + k + '_' + lod] = treeParts(kind, k, lod));
  // api.put ile yerleştir. boy: m (geometri birim boy 1)
  K.placeTree = (api, kind, k, x, z, h, o = {}) => {
    const t = K.tree(kind, k, o.lod || 0), yaw = o.yaw || 0, mk = o.mat || 'shinyNS', rx = o.rx || 0, rz = o.rz || 0, y = o.y || 0;
    api.put(t.wood, x, y, z, h, h, h, o.wood ?? 0xffffff, yaw, rx, rz, mk);
    if (t.leaf) api.put(t.leaf, x, y, z, h, h, h, o.leaf ?? 0xffffff, yaw, rx, rz, mk);
    if (t.glow) api.put(t.glow, x, y, z, h, h, h, o.glow ?? 0xffffff, yaw, rx, rz, 'glow');
    if (t.fruit) api.put(t.fruit, x, y, z, h, h, h, o.fruit ?? 0xffffff, yaw, rx, rz, mk);
    return t;
  };
})();
