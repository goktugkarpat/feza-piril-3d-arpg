/* ── PROPKIT: yeniden kullanılabilir, parametrik 3B eşya üreticileri (G3) ──
   Her üretici köşe-renkli (vertex color) bir THREE.BufferGeometry döndürür (önbellekli; birim boy).
   Bölüm kodu bunları api.put(geo, x,y,z, sx,sy,sz, tint, yaw, rx, rz, 'shinyNS'|'decor'|'glow') ile yerleştirir
   (06_level birleştirir: parça başına çizim çağrısı yok). 'decor' malzemesinde uv.x = 30 olan köşeler rüzgârda sallanır.
   Renk: köşe rengi (gri tonlu gölge/doku) × tint. Tema: PROPKIT.TEMA[id] (başka bölümler kendi paletini verir).
   Kullanım örnekleri: PROPKIT.cap('dome', lod) · stem('plain'|'ring', lod) · gills(lod) · capSpots(kind, lod, glow) · rim(lod) · roots(lod)
   rock(k, palette) · tuft(k) · flower(k) · frond() · broadLeaf() · crystal(k) · log(k) · rootArc(k) · vine() · pod() · signpost() · fence() · bridge(len)
   · stoneRing... Hepsi birim boyda; ölçek put ile verilir. */
const PROPKIT = (() => {
  'use strict';
  const PI = Math.PI, TWO = PI * 2, sin = Math.sin, cos = Math.cos, hyp = Math.hypot;
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const sstep = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
  const mix = (a, b, t) => a + (b - a) * t;
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const h3 = (x, y, z) => { const n = sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return n - Math.floor(n); };
  function vn(x, y = 0, z = 0) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z); let fx = x - ix, fy = y - iy, fz = z - iz;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
    const a = (dx, dy, dz) => h3(ix + dx, iy + dy, iz + dz);
    return mix(mix(mix(a(0, 0, 0), a(1, 0, 0), fx), mix(a(0, 1, 0), a(1, 1, 0), fx), fy), mix(mix(a(0, 0, 1), a(1, 0, 1), fx), mix(a(0, 1, 1), a(1, 1, 1), fx), fy), fz);
  }
  const fbm = (x, y, z) => vn(x, y, z) * 0.55 + vn(x * 2.1 + 7, y * 2.1, z * 2.1) * 0.3 + vn(x * 4.3, y * 4.3 + 3, z * 4.3) * 0.15;

  // ── köşe-renkli geometri kurucu ──
  class GB {
    constructor() { this.P = []; this.C = []; this.U = []; this.I = []; }
    get n() { return this.P.length / 3; }
    add(x, y, z, r, g, b, ux = 0, uy = 0) { this.P.push(x, y, z); this.C.push(r, g, b); this.U.push(ux, uy); return this.n - 1; }
    // yüzey ızgarası: fn(u, v) → [x,y,z,r,g,b,(ux)]; closed: u çevresi kapalı; pb/pt: alt/üst kutup tek köşe
    grid(nu, nv, closed, fn, o = {}) {
      const base = this.n, cols = closed ? nu : nu + 1, t0 = this.I.length / 3;
      const rows = []; const j0 = o.pb ? 1 : 0, j1 = o.pt ? nv - 1 : nv;
      let polB = -1, polT = -1;
      if (o.pb) { const f = fn(0, 0); polB = this.add(f[0], f[1], f[2], f[3], f[4], f[5], f[6] || 0, 0); }
      for (let j = j0; j <= j1; j++) { const row = []; for (let i = 0; i < cols; i++) { const f = fn(i / nu, j / nv); row.push(this.add(f[0], f[1], f[2], f[3], f[4], f[5], f[6] || 0, j / nv)); } rows.push(row); }
      if (o.pt) { const f = fn(0, 1); polT = this.add(f[0], f[1], f[2], f[3], f[4], f[5], f[6] || 0, 1); }
      const I = this.I, wrap = i => closed ? i % cols : i;
      for (let r = 0; r < rows.length - 1; r++) for (let i = 0; i < nu; i++) {
        const a = rows[r][i], b = rows[r][wrap(i + 1)], c = rows[r + 1][i], d = rows[r + 1][wrap(i + 1)];
        I.push(a, c, b, b, c, d);
      }
      if (o.pb) for (let i = 0; i < nu; i++) I.push(polB, rows[0][i], rows[0][wrap(i + 1)]);
      if (o.pt) { const lr = rows[rows.length - 1]; for (let i = 0; i < nu; i++) I.push(lr[i], polT, lr[wrap(i + 1)]); }
      let ctr = null;
      if (closed && !o.hint) {
        ctr = new Map(); const P = this.P;
        const cen = row => { let x = 0, y = 0, z = 0; for (const v of row) { x += P[v * 3]; y += P[v * 3 + 1]; z += P[v * 3 + 2]; } return [x / row.length, y / row.length, z / row.length]; };
        rows.forEach(row => { const c = cen(row); for (const v of row) ctr.set(v, c); });
        if (polB >= 0) ctr.set(polB, ctr.get(rows[0][0])); if (polT >= 0) ctr.set(polT, ctr.get(rows[rows.length - 1][0]));
      }
      this._orient(t0, o.hint, ctr);
      return this;
    }
    // üçgen (ayrı köşeler: düz gölgeli): colors [[r,g,b]x3]
    tri(a, b, c, ca, cb, cc) {
      const i = this.n; this.add(a[0], a[1], a[2], ca[0], ca[1], ca[2]); this.add(b[0], b[1], b[2], (cb || ca)[0], (cb || ca)[1], (cb || ca)[2]); this.add(c[0], c[1], c[2], (cc || ca)[0], (cc || ca)[1], (cc || ca)[2]);
      this.I.push(i, i + 1, i + 2); return this;
    }
    quad(a, b, c, d, ca, cb, cc, cd, ux = 0) {   // a,b,c,d saat yönünün tersi (dışarıdan bakınca)
      const i = this.n; for (const [p, k] of [[a, ca], [b, cb || ca], [c, cc || ca], [d, cd || ca]]) this.add(p[0], p[1], p[2], k[0], k[1], k[2], ux, 0);
      this.I.push(i, i + 1, i + 2, i, i + 2, i + 3); return this;
    }
    // üçgenleri yönlendir: hint verilirse o yöne bakan normal; yoksa halka merkezinden dışa (closed) ya da yukarı
    _orient(t0, hint, ctr) {
      const I = this.I, P = this.P, t1 = I.length / 3; let s = 0;
      const hv = hint || (ctr ? null : [0, 1, 0]);
      for (let t = t0; t < t1; t++) {
        const ia = I[t * 3], a = ia * 3, b = I[t * 3 + 1] * 3, c = I[t * 3 + 2] * 3;
        const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        if (hv) s += nx * hv[0] + ny * hv[1] + nz * hv[2];
        else { let cc = ctr.get(ia); if (!cc) cc = ctr.get(I[t * 3 + 1]) || ctr.get(I[t * 3 + 2]); const mx = (P[a] + P[b] + P[c]) / 3 - cc[0], my = (P[a + 1] + P[b + 1] + P[c + 1]) / 3 - cc[1], mz = (P[a + 2] + P[b + 2] + P[c + 2]) / 3 - cc[2]; s += nx * mx + ny * my + nz * mz; }
      }
      if (s < 0) for (let t = t0; t < t1; t++) { const q = I[t * 3 + 1]; I[t * 3 + 1] = I[t * 3 + 2]; I[t * 3 + 2] = q; }
    }
    // post(i, nx,ny,nz, c[3]) → normalle renk ayarı (yosun gibi)
    build(post) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.P, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(this.U, 2));
      g.setIndex(this.I.length && this.n > 65535 ? new THREE.Uint32BufferAttribute(this.I, 1) : new THREE.Uint16BufferAttribute(this.I, 1));
      g.computeVertexNormals();
      if (post) { const N = g.attributes.normal.array, C = this.C, c = [0, 0, 0]; for (let i = 0; i < this.n; i++) { c[0] = C[i * 3]; c[1] = C[i * 3 + 1]; c[2] = C[i * 3 + 2]; post(i, N[i * 3], N[i * 3 + 1], N[i * 3 + 2], c, g.attributes.position.array[i * 3], g.attributes.position.array[i * 3 + 1], g.attributes.position.array[i * 3 + 2]); C[i * 3] = c[0]; C[i * 3 + 1] = c[1]; C[i * 3 + 2] = c[2]; } }
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.C, 3));
      g.computeBoundingBox(); g.computeBoundingSphere(); g.userData.keep = true;
      return g;
    }
  }
  const CACHE = {};
  const memo = (k, f) => CACHE[k] || (CACHE[k] = (() => { const g = f(); if (g && g.isBufferGeometry) g.name = k.replace(/[0-9]+$/, ''); return g; })());
  const grey = (L, r = 1, g = 1, b = 1) => [L * r, L * g, L * b];

  // ═════════ MANTAR ═════════
  // şapka profilleri (r, y) altından üste; birim: yarıçap 1
  const CAPP = {
    dome: [[0.9, 0], [1.0, 0.07], [0.98, 0.24], [0.84, 0.5], [0.56, 0.73], [0.24, 0.85], [0, 0.88]],
    flat: [[0.93, 0.02], [1.0, 0.07], [0.99, 0.15], [0.85, 0.26], [0.52, 0.35], [0.22, 0.39], [0, 0.4]],
    cone: [[0.88, 0], [1.0, 0.05], [0.86, 0.26], [0.62, 0.56], [0.32, 0.92], [0.12, 1.18], [0, 1.32]],
    bell: [[0.8, 0], [1.03, 0.05], [1.0, 0.2], [0.86, 0.42], [0.6, 0.62], [0.3, 0.74], [0, 0.78]],
    wavy: [[0.9, 0], [1.02, 0.06], [0.97, 0.22], [0.8, 0.46], [0.5, 0.64], [0.22, 0.72], [0, 0.74]],
  };
  function prof(pts, t) {   // Catmull-Rom (düzgün aralıklı)
    const n = pts.length - 1, f = clamp(t) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
    const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])];
  }
  function capSurf(kind, a, t, seed = 0) {
    const [r0, y0] = prof(CAPP[kind] || CAPP.dome, t);
    let r = r0, y = y0;
    const rim = Math.pow(1 - t, 2.5);
    if (kind === 'wavy') { r *= 1 + 0.07 * sin(a * 7 + seed) * rim; y += 0.06 * sin(a * 7 + seed) * rim; }
    r *= 1 + 0.03 * (vn(cos(a) * 1.7 + seed, sin(a) * 1.7, t * 0.5) - 0.5) * 2; y += 0.025 * (vn(cos(a) * 2.2, sin(a) * 2.2 + seed, 4) - 0.5) * 2 * Math.min(1, t * 3);
    if (kind === 'flat' && t > 0.8) y -= 0.05 * sstep(0.8, 1, t) * (1 - 0.0);   // ortada hafif çukur
    return [sin(a) * r, y, cos(a) * r];
  }
  const LODN = { 0: [22, 9], 1: [14, 6], 2: [9, 4], 3: [6, 3] };
  function cap(kind = 'dome', lod = 0) {
    return memo('cap' + kind + lod, () => {
      const [nu, nv] = LODN[lod], gb = new GB();
      gb.grid(nu, nv, true, (u, v) => {
        const a = u * TWO, p = capSurf(kind, a, v);
        const L = mix(0.66, 1, sstep(0, 0.5, v)) * (0.93 + 0.12 * fbm(p[0] * 3, p[1] * 3, p[2] * 3)) * (1 - 0.05 * Math.abs(sin(a * 11)) * (1 - v)) * (v < 0.06 ? 0.84 : 1);
        return [p[0], p[1], p[2], L, L * (0.96 + 0.06 * v), L * (0.95 + 0.08 * v)];
      }, { pt: true });
      return gb.build();
    });
  }
  // altta solungaç (radyal ince çıtalar): koyu krem; hint aşağı
  function gills(lod = 0) {
    return memo('gills' + lod, () => {
      const nu = lod === 0 ? 48 : lod === 1 ? 32 : 18, gb = new GB();
      gb.grid(nu, 2, true, (u, v) => {
        const a = u * TWO, r = mix(0.9, 0.04, v), rid = (u * nu) % 2 < 1 ? 1 : 0, y = mix(0.0, 0.2, v) + (lod < 2 ? 0.018 * rid * (1 - v) : 0);
        const L = (0.55 + 0.4 * rid) * (0.7 + 0.3 * (1 - v));
        return [sin(a) * r, y, cos(a) * r, L * 1.0, L * 0.9, L * 0.8];
      }, { hint: [0, -1, 0], pt: true });
      return gb.build();
    });
  }
  // şapka kenarı altında ışıklı ince halka ('glow' ile)
  function rim(lod = 0) {
    return memo('rim' + lod, () => {
      const nu = lod === 0 ? 22 : 12, gb = new GB();
      gb.grid(nu, 1, true, (u, v) => { const a = u * TWO, r = 0.93 + 0.05 * v; return [sin(a) * r, -0.03 + v * 0.05, cos(a) * r, 1, 1, 1]; }, { hint: [0, -1, 0] });
      gb.grid(nu, 1, true, (u, v) => { const a = u * TWO, r = 0.97 + 0.02 * v; return [sin(a) * r, -0.03 + v * 0.05, cos(a) * r, 1, 1, 1]; });   // dış bant
      return gb.build();
    });
  }
  // şapka benekleri: soft (krem kabarık) / glow (ışıklı)
  function capSpots(kind = 'dome', lod = 0, glow = false) {
    return memo('spots' + kind + lod + glow, () => {
      const r = rng(kind.length * 977 + (glow ? 31 : 7)), gb = new GB(), n = glow ? (lod === 0 ? 5 : 3) : (lod === 0 ? 11 : lod === 1 ? 7 : 4), sides = lod === 0 ? 8 : 6;
      const seed = 0;
      for (let k = 0; k < n; k++) {
        const a = r() * TWO, t = 0.18 + r() * 0.62, rho = (glow ? 0.07 : 0.05 + r() * 0.1) * (1 - 0.35 * t);
        const c = capSurf(kind, a, t, seed), eps = 0.02, pa = capSurf(kind, a + eps, t, seed), pt = capSurf(kind, a, t + eps, seed);
        let ta = [pa[0] - c[0], pa[1] - c[1], pa[2] - c[2]], tt = [pt[0] - c[0], pt[1] - c[1], pt[2] - c[2]];
        const la = hyp(...ta), lt = hyp(...tt); ta = ta.map(x => x / la); tt = tt.map(x => x / lt);
        let nn = [ta[1] * tt[2] - ta[2] * tt[1], ta[2] * tt[0] - ta[0] * tt[2], ta[0] * tt[1] - ta[1] * tt[0]]; if (nn[1] < 0) nn = nn.map(x => -x);
        const ln = hyp(...nn); nn = nn.map(x => x / ln);
        const ox = c[0] + nn[0] * -0.01, oy = c[1] + nn[1] * -0.01, oz = c[2] + nn[2] * -0.01;
        gb.grid(sides, 2, true, (u, v) => {
          const q = u * TWO, rr = v < 1 ? rho * (1 - v) : 0, h = (1 - v * v) * rho * 0.5 + 0.014;
          return [ox + (ta[0] * cos(q) + tt[0] * sin(q)) * rr + nn[0] * h, oy + (ta[1] * cos(q) + tt[1] * sin(q)) * rr + nn[1] * h, oz + (ta[2] * cos(q) + tt[2] * sin(q)) * rr + nn[2] * h, 1, 1, 1];
        }, { pt: true, hint: nn });
      }
      return gb.build();
    });
  }
  // gövde (y 0..1, yarıçap 1): taban genişlemesi, lifli, halkalı (ring) varyant
  function stem(kind = 'plain', lod = 0) {
    return memo('stem' + kind + lod, () => {
      const [nu, nv] = lod === 0 ? [14, 8] : lod === 1 ? [10, 5] : lod === 2 ? [7, 3] : [5, 2], gb = new GB();
      gb.grid(nu, nv, true, (u, v) => {
        const a = u * TWO, y = v;
        const fl = Math.exp(-y * 12) * 0.85 + (1 - sstep(0, 0.1, y)) * 0.25;
        let r = (1 - 0.18 * sstep(0.1, 0.7, y) + 0.1 * sstep(0.7, 1, y) + fl) * (1 + 0.06 * (vn(cos(a) * 2, y * 3, sin(a) * 2) - 0.5));
        r *= 1 + 0.035 * sin(a * 9 + y * 2.5) * (1 - sstep(0.1, 0.6, y));   // gövde kabartıları
        const fib = 0.9 + 0.12 * vn(a * 3.1, y * 2.2, 1.7) + 0.05 * sin(a * 14 + y * 3);
        const L = (0.42 + 0.58 * sstep(0, 0.2, y)) * fib * (1 - 0.12 * sstep(0.88, 1, y));
        return [sin(a) * r, y, cos(a) * r, L, L * 0.98, L * 0.94];
      }, { pt: true });
      if (kind === 'ring') {
        const y0 = 0.64;
        gb.grid(nu, 2, true, (u, v) => {
          const a = u * TWO, r = mix(0.95, 1.6 + 0.1 * sin(a * 6), v), y = y0 - 0.14 * v * v - 0.01 * v;
          const L = mix(0.95, 0.7, v); return [sin(a) * r, y, cos(a) * r, L, L * 0.96, L * 0.9];
        }, {});
      }
      return gb.build();
    });
  }
  // kök ayakları: gövde tabanından yere yayılan kıvrık kökler (tint: toprak/kabuk rengi, ölçek: gövde yarıçapı)
  function roots(n = 6, lod = 0) {
    return memo('roots' + n + lod, () => {
      const r = rng(n * 101 + 5), gb = new GB(), seg = lod === 0 ? 5 : 3, sides = lod === 0 ? 5 : 4;
      for (let k = 0; k < n; k++) {
        const a = k / n * TWO + (r() - 0.5) * 0.7, len = 1.0 + r() * 1.3, dx = sin(a), dz = cos(a), wob = (r() - 0.5) * 0.9, ph = r() * 6;
        const pts = []; for (let i = 0; i <= seg; i++) { const s = i / seg, d = 1.0 + s * len; pts.push([dx * d - dz * wob * s * s, 0.42 * Math.pow(1 - s, 2.2) + 0.1 * (1 - s) + 0.05 * sin(s * 7 + ph) * s * (1 - s) - 0.03, dz * d + dx * wob * s * s]); }
        tube(gb, pts, s => 0.3 * (1 - s) * (1 - 0.5 * s) + 0.05, sides, (s, q) => { const L = 0.6 + 0.35 * h3(k, q * 7, s * 3) - 0.15 * s; return [L, L * 0.8, L * 0.6]; }, { rough: 0.35 });
      }
      return gb.build();
    });
  }
  // eğri boyunca boru: rad(s), col(s, q) → [r,g,b]
  function tube(gb, pts, rad, sides, col, o = {}) {
    const n = pts.length - 1, fr = [];
    for (let i = 0; i <= n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2]; const tl = hyp(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
      let nx = ty * 0 - tz * 1, ny = tz * 0 - tx * 0, nz = tx * 1 - ty * 0;   // T × (0,1,0)
      let nl = hyp(nx, ny, nz); if (nl < 1e-3) { nx = 1; ny = 0; nz = 0; nl = 1; } nx /= nl; ny /= nl; nz /= nl;
      const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
      fr.push([nx, ny, nz, bx, by, bz]);
    }
    gb.grid(sides, n, true, (u, v) => {
      const i = Math.round(v * n), f = fr[i], s = v, q = u * TWO, R = rad(s) * (o.rough ? 1 + o.rough * (vn(q * 1.3, s * 5, i) - 0.5) : 1), cc = cos(q), ss = sin(q), p = pts[i];
      const c = col ? col(s, u) : [0.8, 0.8, 0.8];
      return [p[0] + (f[0] * cc + f[3] * ss) * R, p[1] + (f[1] * cc + f[4] * ss) * R, p[2] + (f[2] * cc + f[5] * ss) * R, c[0], c[1], c[2], o.sway ? 30 : 0];
    }, { pt: !!o.capEnd, pb: !!o.capEnd });
  }

  // ═════════ KAYA (yosunlu) ═════════
  // pal: {base:[r,g,b], dark:[..], moss:[..]}; k: varyant
  const ROCKPAL = { mantar: { base: [0.5, 0.52, 0.6], dark: [0.2, 0.22, 0.32], moss: [0.2, 0.48, 0.3], moss2: [0.36, 0.66, 0.3] } };
  function rock(k = 0, pal = 'mantar', lod = 0) {
    return memo('rock' + k + pal + (lod ? 'L' : ''), () => {
      const P = ROCKPAL[pal] || ROCKPAL.mantar, gb = new GB(), r = rng(k * 733 + 11), sx = 0.8 + r() * 0.4, sz = 0.8 + r() * 0.4, fl = 0.55 + r() * 0.35;
      const ox = r() * 10, nn = lod ? [9, 6] : [12, 8];
      gb.grid(nn[0], nn[1], true, (u, v) => {
        const a = u * TWO, el = (v - 0.5) * PI, cx = cos(el) * sin(a), cy = sin(el), cz = cos(el) * cos(a);
        let rr = 1 + 0.32 * (fbm(cx * 1.6 + ox, cy * 1.6, cz * 1.6) - 0.5) * 2;
        const rid = Math.abs(sin((cx + cz * 0.7) * 3.2 + ox)) * 0.1; rr -= rid * 0.4;   // sert yüzler
        let y = cy * rr * fl; if (y < -0.25) y = -0.25 + (y + 0.25) * 0.3;
        return [cx * rr * sx, y, cz * rr * sz, 1, 1, 1];
      }, { pb: true, pt: true });
      return gb.build((i, nx, ny, nz, c, x, y, z) => {
        const strata = 0.9 + 0.12 * sin(y * 11 + vn(x * 2, y, z * 2) * 3);
        let L = strata * (0.85 + 0.25 * fbm(x * 3, y * 3, z * 3));
        let cr = mix(P.dark[0], P.base[0], clamp(L * 0.9 + (y + 0.2) * 0.4)), cg = mix(P.dark[1], P.base[1], clamp(L * 0.9 + (y + 0.2) * 0.4)), cb = mix(P.dark[2], P.base[2], clamp(L * 0.9 + (y + 0.2) * 0.4));
        const m = 0.7 * sstep(0.5, 0.9, ny + (vn(x * 4, y * 4, z * 4) - 0.5) * 0.6);   // üstte yosun
        const mc = vn(x * 2.5, 3, z * 2.5) > 0.55 ? P.moss2 : P.moss;
        c[0] = mix(cr, mc[0] * (0.8 + 0.3 * L), m); c[1] = mix(cg, mc[1] * (0.8 + 0.3 * L), m); c[2] = mix(cb, mc[2] * (0.8 + 0.3 * L), m);
        const ao = 0.5 + 0.5 * sstep(-0.25, 0.3, y); c[0] *= ao; c[1] *= ao; c[2] *= ao;
      });
    });
  }

  // ═════════ OT / ÇİÇEK / EĞRELTİ / YAPRAK ═════════
  // kümeler: hepsi uv.x = 30 (rüzgârda sallanır, 'decor' malzemesi). tint = çimen rengi
  function tuft(k = 0, blades = 7) {
    return memo('tuft' + k + blades, () => {
      const r = rng(k * 211 + 3), gb = new GB();
      for (let b = 0; b < blades; b++) {
        const a = r() * TWO, d0 = r() * 0.12, H = 0.55 + r() * 0.55, lean = 0.15 + r() * 0.55, w = 0.05 + r() * 0.035, curl = (r() - 0.5) * 0.12;
        const dx = sin(a), dz = cos(a), px = dx * d0, pz = dz * d0, sx = -dz, sz = dx;
        const row = t => { const bend = lean * t * t * H * 0.8, ww = w * (1 - t * 0.85) * (t < 0.05 ? 1.2 : 1); return [px + dx * bend + sx * curl * t, H * t * (1 - 0.18 * lean * t), pz + dz * bend + sz * curl * t, ww]; };
        const cl = t => { const L = mix(0.38, 1.0, Math.pow(t, 0.8)); return [L * (0.78 + 0.22 * t), L, L * (0.75 + 0.1 * (1 - t))]; };
        const rs = [0, 0.33, 0.66], rows = rs.map(t => { const p = row(t), c = cl(t); return { p, c, t }; });
        const idx = [];
        for (const e of rows) { const l = gb.add(e.p[0] - sx * e.p[3], e.p[1], e.p[2] - sz * e.p[3], e.c[0], e.c[1], e.c[2], 30, 0), rr = gb.add(e.p[0] + sx * e.p[3], e.p[1], e.p[2] + sz * e.p[3], e.c[0], e.c[1], e.c[2], 30, 0); idx.push([l, rr]); }
        const tp = row(1), tc = cl(1), tip = gb.add(tp[0], tp[1], tp[2], tc[0], tc[1], tc[2], 30, 1);
        const t0 = gb.I.length / 3;
        for (let i = 0; i < 2; i++) { const [a1, b1] = idx[i], [c1, d1] = idx[i + 1]; gb.I.push(a1, c1, b1, b1, c1, d1); }
        gb.I.push(idx[2][0], tip, idx[2][1]);
        gb._orient(t0, [dx * 0.3, 1, dz * 0.3], null);
      }
      return gb.build();
    });
  }
  const FLOWERPAL = [[[1, 0.55, 0.78], [1, 0.9, 0.3]], [[1, 0.88, 0.35], [1, 0.55, 0.15]], [[0.55, 0.78, 1], [1, 1, 0.8]], [[1, 1, 0.95], [1, 0.8, 0.25]], [[1, 0.65, 0.4], [1, 0.95, 0.5]]];
  function flower(k = 0) {   // minik çiçek: sap + 5 yapraklı baş (boy ~0.4)
    return memo('flower' + k, () => {
      const r = rng(k * 59 + 1), gb = new GB(), pal = FLOWERPAL[k % FLOWERPAL.length], H = 0.28 + r() * 0.12;
      const lean = (r() - 0.5) * 0.12;
      tube(gb, [[0, 0, 0], [lean * 0.5, H * 0.5, 0], [lean, H, 0]], s => 0.012, 3, (s) => [0.35 + 0.3 * s, 0.7, 0.35], { sway: true });
      for (let l = 0; l < 2; l++) { const a = l * PI + r() * 3, tp = [sin(a) * 0.1 + lean * 0.4, 0.08 + 0.05 * l, cos(a) * 0.1]; gb.tri([lean * 0.2 * 0.5, 0.05 + 0.04 * l, 0], [sin(a + 0.5) * 0.04, 0.05 + 0.04 * l, cos(a + 0.5) * 0.04], tp, [0.3, 0.6, 0.3], [0.3, 0.6, 0.3], [0.5, 0.85, 0.45]); }
      const cx = lean, cy = H, np = 5;
      for (let p = 0; p < np; p++) {
        const a = p / np * TWO, a2 = (p + 0.5) / np * TWO, a1 = (p - 0.5) / np * TWO, R = 0.1;
        const tip = [cx + sin(a) * R, cy + 0.015, cz(a, R)], b1 = [cx + sin(a1) * R * 0.45, cy - 0.005, cz(a1, R * 0.45)], b2 = [cx + sin(a2) * R * 0.45, cy - 0.005, cz(a2, R * 0.45)];
        const m = [cx + sin(a) * R * 0.62, cy + 0.02, cz(a, R * 0.62)];
        gb.tri([cx, cy, 0], b1, m, pal[0].map(x => x * 0.8), pal[0], pal[0]); gb.tri([cx, cy, 0], m, b2, pal[0].map(x => x * 0.8), pal[0], pal[0]);
        gb.tri(m, b1, tip, pal[0], pal[0], pal[0]); gb.tri(m, tip, b2, pal[0], pal[0], pal[0]);
      }
      gb.grid(5, 1, true, (u, v) => [cx + sin(u * TWO) * 0.03 * (1 - v), cy + 0.03 * (1 - v * v) + 0.005, cos(u * TWO) * 0.03 * (1 - v), pal[1][0], pal[1][1], pal[1][2], 30], { pt: true, hint: [0, 1, 0] });
      for (let i = 0; i < gb.n; i++) if (gb.U[i * 2] === 0) gb.U[i * 2] = 30;
      return gb.build();
    });
    function cz(a, R) { return cos(a) * R; }
  }
  function frond(k = 0) {   // eğrelti yaprağı: yaylı sap + 2×9 yaprakçık; +z yönünde uzanır, boy ~1.3
    return memo('frond' + k, () => {
      const r = rng(k * 83 + 9), gb = new GB(), N = 10, droop = 0.35 + r() * 0.25;
      const at = u => [0, 0.9 * sin(u * PI * 0.75) - droop * u * u, u * 1.3];
      for (let i = 0; i < N; i++) {
        const u0 = i / N, u1 = (i + 0.9) / N, p0 = at(u0), p1 = at(u1), ll = 0.34 * Math.pow(sin(PI * (0.12 + 0.8 * u0)), 0.8) * (1 - 0.25 * u0);
        for (const sd of [-1, 1]) {
          const sweep = 0.12 + 0.1 * u0, dr = 0.18 + 0.12 * u0;
          const o0 = [sd * ll * 0.95, p0[1] - dr * ll + 0.02, p0[2] + sweep * ll * 2], o1 = [sd * ll * 0.7, p1[1] - dr * ll * 1.1, p1[2] + sweep * ll * 2.6];
          const sh = 0.55 + 0.45 * (1 - u0), L1 = (i % 2 ? 0.97 : 1);
          const cb = [0.45 * sh, 0.7 * sh, 0.45 * sh], ct = [0.95 * L1, 1.0 * L1, 0.8 * L1];
          const t0 = gb.I.length / 3, a = gb.add(p0[0], p0[1], p0[2], cb[0], cb[1], cb[2], 30), b = gb.add(p1[0], p1[1], p1[2], cb[0], cb[1], cb[2], 30), c = gb.add(o1[0], o1[1], o1[2], ct[0], ct[1], ct[2], 30), d = gb.add(o0[0], o0[1], o0[2], ct[0], ct[1], ct[2], 30);
          gb.I.push(a, b, c, a, c, d); gb._orient(t0, [0, 1, 0], null);
        }
      }
      return gb.build();
    });
  }
  function broadLeaf(k = 0) {   // geniş yaprak: damarlı, kavisli; sapı orijinde, +z'ye uzanır, boy 1.6
    return memo('bleaf' + k, () => {
      const gb = new GB(), r = rng(k * 41 + 2), droop = 0.25 + r() * 0.2;
      gb.grid(6, 9, false, (u, v) => {
        const xx = (u - 0.5) * 2, w = Math.pow(sin(Math.min(1, v * 1.08) * PI), 0.75) * (1 - 0.3 * v) * 0.62, x = xx * w;
        const z = v * 1.6, y = 0.32 * sin(v * PI * 0.85) - droop * v * v * 0.4 - 0.22 * xx * xx * w * 2.2 + 0.03 * Math.abs(sin(v * 20 + Math.abs(xx) * 6));
        const vein = 0.84 + 0.16 * Math.abs(sin(v * 16 - Math.abs(xx) * 5)), mid = 1 - 0.18 * (1 - Math.min(1, Math.abs(xx) * 5));
        const L = (0.58 + 0.42 * sstep(0, 0.55, v)) * vein * (xx === 0 ? 1.1 : 1) * (0.9 + 0.1 * mid) * (1 - 0.25 * (1 - sstep(0, 0.5, v)) * 0);
        return [x, y, z, L * 0.9, L, L * 0.85, 30];
      }, { hint: [0, 1, 0] });
      return gb.build();
    });
  }

  // ═════════ KRİSTAL (ışıklı) ═════════
  function crystal(k = 0, n = 6) {
    return memo('crys' + k + n, () => {
      const r = rng(k * 313 + 7), gb = new GB();
      for (let i = 0; i < n; i++) {
        const big = i === 0, H = (big ? 0.9 : 0.35 + r() * 0.4) * (1 + 0.2 * r()), R = (big ? 0.14 : 0.06 + r() * 0.06), a = r() * TWO, d = big ? 0 : 0.1 + r() * 0.18, lean = big ? 0.05 : 0.2 + r() * 0.35, la = r() * TWO;
        const ox = sin(a) * d, oz = cos(a) * d, sides = 6, ring = (y, rr, sk) => Array.from({ length: sides }, (_, s) => { const q = s / sides * TWO; return [ox + sin(q) * rr + sin(la) * lean * y * 0.6 * sk, y, oz + cos(q) * rr + cos(la) * lean * y * 0.6 * sk]; });
        const b0 = ring(-0.02, R * 0.9, 0), b1 = ring(H * 0.72, R, 1), tp = [ox + sin(la) * lean * H * 0.6, H, oz + cos(la) * lean * H * 0.6];
        for (let s = 0; s < sides; s++) {
          const s2 = (s + 1) % sides, sh = 0.7 + 0.3 * ((s * 5) % 3) / 2, lo = 0.4 * sh, hi = 1.0 * sh;
          gb.quad(b0[s], b0[s2], b1[s2], b1[s], [lo, lo, lo]); const t0 = gb.I.length / 3; gb._orient(t0 - 2, [b1[s][0] - ox, 0, b1[s][2] - oz], null);
          for (let q = 0; q < 4; q++) gb.C[(gb.n - 4 + q) * 3] = gb.C[(gb.n - 4 + q) * 3 + 1] = gb.C[(gb.n - 4 + q) * 3 + 2] = q < 2 ? lo : hi * 0.9;
          const t1 = gb.I.length / 3; gb.tri(b1[s], b1[s2], tp, [hi * 0.9, hi * 0.9, hi * 0.9], [hi * 0.9, hi * 0.9, hi * 0.9], [1, 1, 1]); gb._orient(t1, [(b1[s][0] + b1[s2][0]) / 2 - ox, 0.6, (b1[s][2] + b1[s2][2]) / 2 - oz], null);
        }
      }
      return gb.build();
    });
  }

  // ═════════ KÜTÜK / KÖK / SARMAŞIK ═════════
  function log(k = 0) {   // yatan, yosunlu kütük: x ekseni boyunca, uzunluk 1 (±0.5), yarıçap ~0.3
    return memo('log' + k, () => {
      const gb = new GB(), r = rng(k * 17 + 4), ox = r() * 9, sag = 0.03 + r() * 0.05;
      const prof = (v, a) => { const rr = 0.3 * (1 + 0.1 * (vn(v * 3 + ox, cos(a) * 1.5, sin(a) * 1.5) - 0.5)) * (1 + 0.07 * sin(a * 7 + v * 4)); return rr; };
      gb.grid(12, 7, true, (u, v) => {
        const a = u * TWO, rr = prof(v, a) * (v === 0 || v === 1 ? 0.98 : 1), x = (v - 0.5) * 1;
        return [x, 0.3 + sin(a) * rr - Math.sin(v * PI) * -sag * 0, cos(a) * rr, 1, 1, 1];
      }, { hint: null });
      const bodyN = gb.n;
      for (const e of [0, 1]) {   // uç yüzler: halka dokulu
        gb.grid(12, 3, true, (u, v) => { const a = u * TWO, R = 0.29 * v, L = 0.78 + 0.18 * sin(R * 52 + ox) - 0.1 * v; return [(e - 0.5) * 1.002, 0.3 + sin(a) * R, cos(a) * R, L, L * 0.82, L * 0.58]; }, { hint: [e ? 1 : -1, 0, 0], pb: true });
      }
      return gb.build((i, nx, ny, nz, c, x, y, z) => {
        if (i >= bodyN) return;
        const bark = 0.42 + 0.35 * vn(x * 4, y * 18 + cos(z * 20), z * 18) + 0.12 * Math.abs(sin(Math.atan2(z, y - 0.3) * 8));
        c[0] = 0.55 * bark; c[1] = 0.37 * bark; c[2] = 0.24 * bark;
        const m = 0.75 * sstep(0.25, 0.7, ny + (vn(x * 5, 2, z * 5) - 0.5) * 0.7);
        c[0] = mix(c[0], 0.14, m); c[1] = mix(c[1], 0.4 * (0.8 + 0.3 * bark), m); c[2] = mix(c[2], 0.2, m);
      });
    });
  }
  function rootArc(k = 0) {   // yerden çıkıp kavis çizip tekrar giren kök; +z yönünde, uzunluk 2, yükseklik ~0.55
    return memo('rarc' + k, () => {
      const gb = new GB(), r = rng(k * 29 + 6), H = 0.45 + r() * 0.3, wob = (r() - 0.5) * 0.6;
      const pts = []; for (let i = 0; i <= 10; i++) { const s = i / 10; pts.push([wob * sin(s * PI * 1.3) * 0.5, H * Math.pow(sin(Math.min(1, s * 1.0) * PI), 0.85) - 0.08, (s - 0.5) * 2]); }
      tube(gb, pts, s => 0.16 * (0.5 + 0.5 * sin(s * PI)) + 0.06, 6, (s, q) => { const L = 0.5 + 0.4 * h3(s * 9, q * 5, k); const m = sstep(0.3, 0.8, 0.5 + 0.5 * sin(q * TWO)); return [mix(0.6 * L, 0.3, m * 0.0), mix(0.4 * L, 0.4, m * 0.0), 0.27 * L]; }, { rough: 0.5 });
      return gb.build((i, nx, ny, nz, c) => { const m = sstep(0.4, 0.85, ny); c[0] = mix(c[0], 0.3, m); c[1] = mix(c[1], 0.62, m); c[2] = mix(c[2], 0.32, m); });
    });
  }
  function vine(k = 0) {   // sarkan sarmaşık: tepe (0,0,0), aşağı doğru 1 birim; minik yapraklarla
    return memo('vine' + k, () => {
      const gb = new GB(), r = rng(k * 19 + 8), pts = []; const sw = (r() - 0.5) * 0.3;
      for (let i = 0; i <= 6; i++) { const s = i / 6; pts.push([sin(s * 5 + k) * 0.06 * s + sw * s * s, -s, cos(s * 4 + k) * 0.05 * s]); }
      tube(gb, pts, s => 0.018 * (1 - 0.5 * s) + 0.006, 4, (s) => [0.3 + 0.2 * s, 0.55 + 0.25 * s, 0.3 + 0.1 * s]);
      for (let i = 1; i < 6; i++) {
        const p = pts[i], a = r() * TWO, L = 0.13 + r() * 0.07;
        for (let q = 0; q < 2; q++) {
          const aa = a + q * PI, tip = [p[0] + sin(aa) * L, p[1] - L * 0.5, p[2] + cos(aa) * L], m1 = [p[0] + sin(aa + 0.5) * L * 0.5, p[1] - L * 0.1, p[2] + cos(aa + 0.5) * L * 0.5], m2 = [p[0] + sin(aa - 0.5) * L * 0.5, p[1] - L * 0.1, p[2] + cos(aa - 0.5) * L * 0.5];
          const t0 = gb.I.length / 3; gb.tri(p, m1, tip, [0.4, 0.7, 0.4], [0.7, 0.95, 0.6], [0.8, 1, 0.6]); gb.tri(p, tip, m2, [0.4, 0.7, 0.4], [0.8, 1, 0.6], [0.7, 0.95, 0.6]); gb._orient(t0, [0, 1, 0], null);
        }
      }
      return gb.build();
    });
  }
  function pod(lod = 0) {   // ışıklı damla/koza (glow): ucu aşağı, yarıçap 0.1, tepe 0
    return memo('pod' + lod, () => {
      const gb = new GB(), nu = lod ? 6 : 8, nv = lod ? 4 : 5;
      gb.grid(nu, nv, true, (u, v) => { const a = u * TWO, el = v * PI, R = sin(el) * 0.1; const L = 0.55 + 0.45 * Math.pow(1 - v, 0.6); return [sin(a) * R, -0.14 - (1 - cos(el)) * 0.14 + (0), cos(a) * R, L, L, L]; }, { pb: true, pt: true });
      return gb.build();
    });
  }

  // ═════════ TAHTA İŞLERİ ═════════
  function boxPart(gb, cx, cy, cz, sx, sy, sz, yaw, col) {   // düz gölgeli kutu (hafif tahta eğrisi)
    const c = cos(yaw), s = sin(yaw), V = (x, y, z) => [cx + (x * c + z * s) * sx / 2, cy + y * sy / 2, cz + (-x * s + z * c) * sz / 2];
    const f = [[V(-1, -1, 1), V(1, -1, 1), V(1, 1, 1), V(-1, 1, 1), 0.85], [V(1, -1, -1), V(-1, -1, -1), V(-1, 1, -1), V(1, 1, -1), 0.7], [V(1, -1, 1), V(1, -1, -1), V(1, 1, -1), V(1, 1, 1), 0.78], [V(-1, -1, -1), V(-1, -1, 1), V(-1, 1, 1), V(-1, 1, -1), 0.78], [V(-1, 1, 1), V(1, 1, 1), V(1, 1, -1), V(-1, 1, -1), 1.0]];
    for (const [a, b, d, e, L] of f) { const cc = col(L); gb.quad(a, b, d, e, cc); }
  }
  function woodCol(base, k = 0) { return L => { const g = 0.88 + 0.12 * h3(k, L * 7, 1); return [base[0] * L * g, base[1] * L * g, base[2] * L * g]; }; }
  function signpost(k = 0) {   // yönlü tabela direği: boy 1.5, tahtalar +x'e bakar
    return memo('sign' + k, () => {
      const gb = new GB(), wood = [0.62, 0.42, 0.26], light = [0.9, 0.7, 0.45];
      tube(gb, [[0, -0.05, 0], [0.01, 0.6, 0], [0, 1.3, 0.01]], s => 0.065 - 0.015 * s, 6, (s, q) => { const L = 0.75 + 0.25 * h3(q * 9, s * 7, 3); return [wood[0] * L, wood[1] * L, wood[2] * L]; }, { rough: 0.3, capEnd: true });
      for (const [yy, yaw, ln] of [[1.15, 0, 0.9], [0.86, 0.35, 0.75]]) {
        const hw = ln * 0.5, c = cos(yaw), s = sin(yaw), P = (x, z) => [x * c + z * s + 0.08, 0, -x * s + z * c];
        const poly = [[-hw, 0.1], [hw * 0.9, 0.1], [hw * 1.25, 0], [hw * 0.9, -0.1], [-hw, -0.1]];
        const top = poly.map(([x, h]) => { const p = P(x, 0); return [p[0], yy + 0.0, p[2] + h * 0]; });
        // dik düzlemde ok (levha: kalınlık 0.05 z)
        const th = 0.025; const poly3 = poly.map(([x, h]) => [x, yy + h]);
        const front = poly3.map(([x, y]) => { const p = P(x, th); return [p[0], y, p[2]]; }), back = poly3.map(([x, y]) => { const p = P(x, -th); return [p[0], y, p[2]]; });
        const col = L => [light[0] * L, light[1] * L, light[2] * L];
        for (let i = 1; i < 4; i++) gb.tri(front[0], front[i], front[i + 1], col(1));
        for (let i = 1; i < 4; i++) gb.tri(back[0], back[i + 1], back[i], col(0.8));
        for (let i = 0; i < 5; i++) { const j = (i + 1) % 5; gb.quad(front[i], back[i], back[j], front[j], col(0.65)); }
        void top;
        // yönlendir: tüm tahtaları kendi normaline göre dışa
      }
      return gb.build();
    });
  }
  function fenceSeg(k = 0) {   // çit: 1.6 uzunlukta (x ekseni), iki direk + iki ip/çubuk; boy 0.7
    return memo('fence' + k, () => {
      const gb = new GB(), wood = [0.64, 0.45, 0.3];
      for (const x of [-0.8, 0.8]) tube(gb, [[x, -0.05, 0], [x + 0.01, 0.35, 0], [x, 0.72, 0.01]], s => 0.05 - 0.01 * s, 5, (s, q) => { const L = 0.7 + 0.3 * h3(q * 7, s * 5, x); return [wood[0] * L, wood[1] * L, wood[2] * L]; }, { rough: 0.3, capEnd: true });
      for (const y of [0.32, 0.55]) tube(gb, [[-0.8, y, 0], [-0.27, y - 0.03, 0.01], [0.27, y - 0.03, -0.01], [0.8, y, 0]], s => 0.022, 4, (s, q) => { const L = 0.8 + 0.2 * h3(q * 5, s * 9, y); return [0.82 * L, 0.7 * L, 0.5 * L]; });
      return gb.build();
    });
  }
  function bridge(len = 3.6, wid = 1.5) {   // tahta köprü: z ekseni boyunca uzanır (uzunluk len), yüzey y≈0.07; iki yanda alçak ip korkuluk
    const key = 'bridge' + Math.round(len * 2) + Math.round(wid * 4);
    return memo(key, () => {
      const gb = new GB(), r = rng(len * 7 + 1), n = Math.round(len / 0.26), pl = len / n;
      for (let i = 0; i < n; i++) {
        const z = -len / 2 + (i + 0.5) * pl, wob = (r() - 0.5) * 0.06, sh = 0.9 + 0.1 * r();
        boxPart(gb, (r() - 0.5) * 0.04, 0.04 + 0.025 * sin((i / n) * PI), z, wid + (r() - 0.5) * 0.08, 0.07, pl * 0.9, wob, L => [0.7 * L * sh, 0.5 * L * sh, 0.32 * L * sh]);
      }
      for (const sd of [-1, 1]) {
        const x = sd * (wid / 2 + 0.03);
        for (const z of [-len / 2 + 0.1, 0, len / 2 - 0.1]) tube(gb, [[x, -0.05, z], [x, 0.3, z], [x, 0.62, z]], s => 0.045, 5, (s, q) => { const L = 0.7 + 0.3 * h3(q, s, z); return [0.62 * L, 0.43 * L, 0.28 * L]; }, { capEnd: true });
        tube(gb, [[x, 0.52, -len / 2 + 0.1], [x, 0.45, -len / 4], [x, 0.43, 0], [x, 0.45, len / 4], [x, 0.52, len / 2 - 0.1]], s => 0.02, 4, (s, q) => { const L = 0.85 + 0.15 * h3(q, s, 2); return [0.85 * L, 0.72 * L, 0.5 * L]; });
      }
      return gb.build();
    });
  }
  function stonePath(k = 0) {   // yassı basamak taşı: yarıçap 1, kalınlık ~0.2
    return memo('spath' + k, () => {
      const gb = new GB(), ox = k * 13.7;
      gb.grid(12, 3, true, (u, v) => { const a = u * TWO, R = (1 + 0.14 * (vn(cos(a) * 1.4 + ox, sin(a) * 1.4, 1) - 0.5) * 2) * (v < 1 ? sstep(-0.1, 0.5, 1 - v * 0.9) : 0); const h = mix(0.16, 0.12, sstep(0.5, 1, 1 - v)) ; return [sin(a) * R, v === 0 ? 0.0 : mix(0.0, 0.17, Math.min(1, v * 2)) * (v > 0.5 ? 1 : 1), cos(a) * R, 1, 1, 1]; }, { pt: true });
      return gb.build((i, nx, ny, nz, c, x, y, z) => { const L = 0.72 + 0.3 * fbm(x * 2.5, 0, z * 2.5); const m = sstep(0.2, 0.9, Math.hyp ? 0 : 0) + (ny > 0.5 ? 0.25 * vn(x * 4, 5, z * 4) : 0); c[0] = L * (0.7 + 0.1 * m); c[1] = L * (0.78 + 0.25 * m); c[2] = L * (0.9 - 0.2 * m); });
    });
  }
  // ince halka (peri halkası, taş çember): n küçük birim; döndürülen geometri yok — yerleştirme koduna bırakıldı

  // ═════════ BİRLEŞTİRİCİ (uzak siluetler için tek çizim) ═════════
  // list: [{geo, x,y,z, sx,sy,sz, yaw, tint:[r,g,b]}] → tek BufferGeometry
  function bake(list) {
    const gb = new GB(), m = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(), nm = new THREE.Matrix3();
    let nv = 0, ni = 0; for (const it of list) { nv += it.geo.attributes.position.count; ni += it.geo.index.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new (nv > 65535 ? Uint32Array : Uint16Array)(ni);
    let vo = 0, io = 0;
    for (const it of list) {
      m.compose(new THREE.Vector3(it.x, it.y, it.z), q.setFromEuler(e.set(it.rx || 0, it.yaw || 0, it.rz || 0)), new THREE.Vector3(it.sx, it.sy ?? it.sx, it.sz ?? it.sx));
      nm.getNormalMatrix(m); const g = it.geo, P = g.attributes.position.array, N = g.attributes.normal.array, C = g.attributes.color.array, n = g.attributes.position.count, M = m.elements, t = it.tint || [1, 1, 1];
      for (let i = 0; i < n; i++) {
        const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], o = (vo + i) * 3;
        pos[o] = M[0] * x + M[4] * y + M[8] * z + M[12]; pos[o + 1] = M[1] * x + M[5] * y + M[9] * z + M[13]; pos[o + 2] = M[2] * x + M[6] * y + M[10] * z + M[14];
        const a = N[i * 3], b = N[i * 3 + 1], c = N[i * 3 + 2], k = nm.elements; let nx = k[0] * a + k[3] * b + k[6] * c, ny = k[1] * a + k[4] * b + k[7] * c, nz = k[2] * a + k[5] * b + k[8] * c; const l = hyp(nx, ny, nz) || 1;
        nor[o] = nx / l; nor[o + 1] = ny / l; nor[o + 2] = nz / l; col[o] = C[i * 3] * t[0]; col[o + 1] = C[i * 3 + 1] * t[1]; col[o + 2] = C[i * 3 + 2] * t[2];
      }
      const I = g.index.array; for (let k = 0; k < I.length; k++) idx[io + k] = I[k] + vo; io += I.length; vo += n;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.BufferAttribute(col, 3)); out.setIndex(new THREE.BufferAttribute(idx, 1));
    out.computeBoundingSphere(); void gb; return out;
  }

  // ═════════ TEMALAR (başka bölümler kendi paletini ekler) ═════════
  const TEMA = {
    mantar: {
      cap: [[0xff7ec8, 0xffc8ec], [0x6fa8ff, 0xc8e0ff], [0x5fd8e8, 0xc8f8ff], [0xffa86a, 0xffe0b8], [0x7fe0b0, 0xd0ffe8]],   // mor yalnız Pırıl'ın
      glow: [0xa8fff4, 0xfff0a0, 0xffb8f0, 0xc8ffa0, 0x9ac8ff],
      stem: [0xf6ecdf, 0xf2ecd8, 0xe8f0e4], gill: 0xffe6d2, root: 0xd9c4a8,
      grass: [0x3fa070, 0x4cb27c, 0x5cc28a, 0x38906c, 0x6ccd8a],
      leaf: [0x4fae5a, 0x3f9a5e, 0x63c070, 0x2f8a68],
      wood: 0xffffff, moss: [0x3f8a5a, 0x4a9a62, 0x357a58, 0x5aa86a],
      crystal: [0x9ff4ff, 0xfff0a0, 0xffb0e8, 0xb0ffb8],
      rock: 'mantar',
    },
  };
  return { GB, tube, bake, rng, vn, fbm, sstep, mix, clamp, TEMA, ROCKPAL, CAPP,
    cap, gills, rim, capSpots, stem, roots, rock, tuft, flower, frond, broadLeaf, crystal, log, rootArc, vine, pod, signpost, fenceSeg, bridge, stonePath };
})();
if (typeof window !== 'undefined') window.PROPKIT = PROPKIT;
