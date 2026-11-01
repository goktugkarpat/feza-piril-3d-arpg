/* ── PROPKIT eklentisi (E567): Mağara / Ay Tapınağı / Yanardağ için eşya üreticileri ──
   07m_kit.js'e dokunmadan PROPKIT'e ekler. Hepsi köşe-renkli, önbellekli, birim boy; api.put ile yerleştirilir (renk = köşe rengi × tint).
   Mağara: spire (sarkıt/dikit/kaya sütunu), archRock, woodSupport, railSeg, lantern(+glow), pedestal(+glow)
   Tapınak: column(0 sağlam,1 kırık,2 devrik gövde), archStone(0 tam,1 kırık), obelisk(+runes), steps, moonDisc(0-7), moonflower(+bloom), poolRim, fallenBlock
   Yanardağ: basalt, lavaRidge(+crack), crackPatch, gear, waterwheel, wheelFrame, stoneMound
   Palet tanımları: PROPKIT.ROCKPAL.magara/mabet/yanardag, PROPKIT.TEMA.magara/mabet/yanardag. */
(() => {
  'use strict';
  if (typeof PROPKIT === 'undefined') return;
  const K = PROPKIT, GB = K.GB, tube = K.tube, rng = K.rng, vn = K.vn, fbm = K.fbm, sstep = K.sstep, mix = K.mix, clamp = K.clamp;
  const PI = Math.PI, TWO = PI * 2, sin = Math.sin, cos = Math.cos, hyp = Math.hypot;
  const CACHE = {};
  const memo = (k, f) => CACHE[k] || (CACHE[k] = (() => { const g = f(); if (g && g.isBufferGeometry) g.name = k.replace(/[0-9]+$/, ''); return g; })());

  // ── palet ──
  K.ROCKPAL.magara = { base: [0.52, 0.6, 0.64], dark: [0.14, 0.22, 0.28], moss: [0.22, 0.5, 0.46], moss2: [0.3, 0.62, 0.5] };
  K.ROCKPAL.mabet = { base: [0.86, 0.83, 0.74], dark: [0.5, 0.5, 0.52], moss: [0.55, 0.64, 0.5], moss2: [0.62, 0.7, 0.55] };
  K.ROCKPAL.yanardag = { base: [0.62, 0.45, 0.36], dark: [0.2, 0.14, 0.14], moss: [0.62, 0.45, 0.36], moss2: [0.55, 0.4, 0.32] };
  // TEMA alanları MANTAR_DEKOR.olustur ile uyumlu: cap, glow, stem, gill, root, grass, leaf, wood, moss, crystal, rock
  K.TEMA.magara = { cap: [[0x7fe8c8, 0xd8fff0], [0xffd070, 0xfff0c0], [0x8fd8ff, 0xe0f4ff], [0xffa890, 0xffe0d0]], glow: [0x8affd8, 0xffe08a, 0xa8f0ff, 0xffb0a0], stem: [0xe8f0e8, 0xf0ecd8], gill: 0xe0f0e8, root: 0xb8b0a0,
    grass: [0x2f8a78, 0x3aa08a, 0x2a7a70, 0x4ab098], leaf: [0x2f8a78, 0x3aa08a, 0x4ab098], wood: 0xa07850, moss: [0x2f8a78, 0x3aa08a, 0x2a7a70], crystal: [0x18c8f0, 0xffa818, 0xff5a40, 0x30d870, 0x4a8cff, 0xffd030], rock: 'magara', stone: 0x8a96b4 };
  K.TEMA.mabet = { cap: [[0xdfeaff, 0xffffff], [0xfff0c8, 0xffffff]], glow: [0xdfeaff, 0xfff0c8], stem: [0xf0eee6], gill: 0xe8e4d8, root: 0xc8c0b0,
    grass: [0x6a9a7a, 0x7aaa88, 0x5a8a74, 0x88b894], leaf: [0x5a9a62, 0x6aaa6c, 0x4a8a5e], wood: 0xb09a7a, moss: [0x5a9a62, 0x6aaa6c], crystal: [0xdfeaff, 0xfff0c8, 0xbfe0ff], rock: 'mabet', stone: 0xe8e1cf, stone2: 0xd6d0c0, ivy: [0x5a9a62, 0x6aaa6c, 0x4a8a5e], gold: 0xd8b860 };
  K.TEMA.yanardag = { cap: [[0xf2a45c, 0xffe0a0], [0xe8704a, 0xffd0a0]], glow: [0xff9a40, 0xffc060], stem: [0xf4e8d2], gill: 0xffe6d2, root: 0xc8a888,
    grass: [0x8a8a3a, 0x9a9a46, 0x6f8a38, 0xa89a4a], leaf: [0x7a8a3a, 0x8a9a46, 0x5f7a38], wood: 0x9a6a42, moss: [0x7a8a3a, 0x8a9a46], crystal: [0xff9a40, 0xffc060, 0xff7a50], rock: 'yanardag', stone: 0xa88a74,
    basalt: [0x9a7868, 0x8a6a5e, 0xa88878, 0x7a5e54], ember: 0xff9a40 };

  // ── yardımcılar ──
  // düz gölgeli yüz: köşeler dışarıdan bakınca saat yönünün tersi; hint = dış normal
  const fq = (gb, a, b, c, d, col, hint, col2) => { gb.quad(a, b, c, d, col, col, col2 || col, col2 || col); gb._orient(gb.I.length / 3 - 2, hint, null); };
  const ft = (gb, a, b, c, col, hint) => { gb.tri(a, b, c, col); gb._orient(gb.I.length / 3 - 1, hint, null); };
  // yönlü kutu (z ekseninde rz, sonra y ekseninde yaw dönüşü); colf(L, yüzNo) → [r,g,b]; ox/oz: köşe bozulması
  function boxT(gb, cx, cy, cz, w, h, d, rz, yaw, colf, jit = 0, seed = 0) {
    const cr = cos(rz), sr = sin(rz), cy_ = cos(yaw), sy = sin(yaw), r = rng(seed * 17 + 5);
    const V = (x, y, z) => {
      x *= w / 2; y *= h / 2; z *= d / 2;
      if (jit) { x += (r() - 0.5) * jit; y += (r() - 0.5) * jit; z += (r() - 0.5) * jit; }
      const x1 = x * cr - y * sr, y1 = x * sr + y * cr;
      return [cx + x1 * cy_ + z * sy, cy + y1, cz - x1 * sy + z * cy_];
    };
    const N = (x, y, z) => { const x1 = x * cr - y * sr, y1 = x * sr + y * cr; return [x1 * cy_ + z * sy, y1, -x1 * sy + z * cy_]; };
    const F = [[[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1], [0, 0, 1], 0.84], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1], [0, 0, -1], 0.68], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1], [1, 0, 0], 0.76],
      [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, 0, 0], 0.72], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1], [0, 1, 0], 1.0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], [0, -1, 0], 0.5]];
    F.forEach((f, i) => { const hint = N(f[4][0], f[4][1], f[4][2]), L = f[5] * (0.5 + 0.5 * clamp(0.5 + hint[1] * 0.5 + 0.2)) + (1 - f[5]) * 0.0; fq(gb, V(...f[0]), V(...f[1]), V(...f[2]), V(...f[3]), colf(Math.min(1.1, L + 0.12), i), hint); });
  }
  const stoneCol = (base, k = 0) => (L, i) => { const g = 0.9 + 0.12 * vn(k * 3.1 + i, L * 5, 2); return [base[0] * L * g, base[1] * L * g, base[2] * L * g]; };
  // lathe: profil [[y, r, L?]...] (alttan üste); flutes: oluk sayısı, amp
  function lathe(gb, prof, nu, o = {}) {
    gb.grid(nu, prof.length - 1, true, (u, v) => {
      const j = Math.min(prof.length - 1, Math.round(v * (prof.length - 1))), p = prof[j], a = u * TWO;
      let R = p[1]; if (o.flutes && p[3]) R *= 1 + p[3] * (Math.abs(cos(a * o.flutes / 2)) - 0.85);
      if (o.rough) R *= 1 + o.rough * (vn(cos(a) * 2 + j, p[0] * 4, sin(a) * 2) - 0.5);
      const L = p[2] ?? 1;
      return [sin(a) * R, p[0], cos(a) * R, L, L, L];
    }, { pt: !!o.pt, pb: !!o.pb });
  }

  // ═════════ MAĞARA ═════════
  // sarkıt/dikit/kaya sütunu: yükseklik 1, taban yarıçapı 0.5; down=true → tepe 0'da, ucu aşağı (−1)
  K.spire = (k = 0, down = false, blunt = 0) => memo('spire' + k + (down ? 'D' : 'U') + blunt, () => {
    const r = rng(k * 91 + 3), gb = new GB(), ox = r() * 9, lean = (r() - 0.5) * 0.25, ll = r() * TWO;
    gb.grid(10, 8, true, (u, v) => {
      const a = u * TWO, prof = blunt ? Math.pow(1 - v, 0.55) * (1 - 0.3 * v) : Math.pow(1 - v, 0.9) * (0.6 + 0.4 * (1 - v));
      const R = 0.5 * prof * (1 + 0.32 * (fbm(cos(a) * 1.6 + ox, v * 3.5, sin(a) * 1.6) - 0.5) * 2 + (blunt ? 0.12 * Math.sin(v * 17 + ox) : 0)) + 0.002;
      const y = down ? -v : v, off = lean * v * v;
      return [sin(a) * R + sin(ll) * off, y, cos(a) * R + cos(ll) * off, 1, 1, 1];
    }, { pt: true, pb: down ? false : true });
    return gb.build((i, nx, ny, nz, c, x, y, z) => {
      const t = down ? -y : y, band = 0.84 + 0.16 * sin(t * 13 + vn(x * 3, t * 2, z * 3) * 4), tip = sstep(0.55, 1, t) * 0.25, base = (1 - sstep(0, 0.22, t)) * 0.22;
      const L = clamp(band * (0.8 + 0.3 * fbm(x * 4, t * 3, z * 4)) + tip - base * 0.7);
      c[0] = L * 0.92; c[1] = L * 0.98; c[2] = L * 1.08;
    });
  });
  // kaya kemer: x −1..1, yükseklik ~1.1, derinlik ~0.5
  K.archRock = (k = 0) => memo('archR' + k, () => {
    const r = rng(k * 71 + 1), gb = new GB(), pts = [];
    for (let i = 0; i <= 12; i++) { const a = i / 12 * PI; pts.push([cos(a) * 1.0, 0.0 + sin(a) * (1.0 + 0.1 * (r() - 0.5)), 0.0 + (r() - 0.5) * 0.04]); }
    tube(gb, pts, s => 0.2 + 0.1 * Math.abs(cos(s * PI)) + 0.04 * sin(s * 20 + k), 8, (s, u) => { const L = (0.62 + 0.3 * s * (1 - s) * 3 + 0.2 * vn(u * 4, s * 6, k)) * (0.9 + 0.1 * sin(s * 30)); return [L * 0.92, L * 0.98, L * 1.08]; }, { rough: 0.45 });
    return gb.build();
  });
  // tahta destek: x −0.5..0.5, y 0..1, ince (z ±0.06)
  K.woodSupport = (k = 0) => memo('wsup' + k, () => {
    const r = rng(k * 5 + 9), gb = new GB(), wood = (s, u) => { const L = 0.72 + 0.28 * vn(u * 6, s * 8, k); return [0.62 * L, 0.46 * L, 0.3 * L]; };
    for (const sd of [-1, 1]) tube(gb, [[sd * 0.5, -0.05, 0], [sd * 0.5 + (r() - 0.5) * 0.02, 0.5, 0.01], [sd * 0.5, 1.0, 0]], s => 0.045 + 0.01 * (1 - s), 6, wood, { rough: 0.2, capEnd: true });
    tube(gb, [[-0.62, 1.03, 0], [-0.2, 1.04, 0.01], [0.2, 1.02, -0.01], [0.62, 1.03, 0]], s => 0.05, 6, wood, { rough: 0.15, capEnd: true });
    for (const sd of [-1, 1]) tube(gb, [[sd * 0.5, 0.62, 0], [sd * 0.34, 0.8, 0.02], [sd * 0.2, 0.98, 0]], s => 0.028, 5, wood, { capEnd: true });
    return gb.build();
  });
  // maden rayı parçası: z ekseni boyunca uzunluk 1.1 (±0.55), genişlik 0.6
  K.railSeg = (k = 0) => memo('rail' + k, () => {
    const gb = new GB(), steel = L => [0.62 * L, 0.66 * L, 0.74 * L], wd = stoneCol([0.55, 0.38, 0.24], k);
    for (const sd of [-1, 1]) boxT(gb, sd * 0.26, 0.085, 0, 0.045, 0.06, 1.1, 0, 0, (L) => steel(L), 0, 1);
    for (const z of [-0.36, 0.36]) boxT(gb, 0, 0.035, z, 0.74, 0.06, 0.13, 0, 0, wd, 0.01, k + (z > 0 ? 1 : 2));
    return gb.build();
  });
  // fener direği/asma fener: tepe 0, aşağı doğru 0.5; gövde (demir) + camı ayrı (glow)
  K.lantern = () => memo('lant', () => {
    const gb = new GB(), iron = L => [0.25 * L, 0.25 * L, 0.3 * L];
    boxT(gb, 0, -0.1, 0, 0.22, 0.05, 0.22, 0, 0, iron); boxT(gb, 0, -0.38, 0, 0.22, 0.04, 0.22, 0, 0, iron);
    for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) boxT(gb, x * 0.1, -0.24, z * 0.1, 0.025, 0.3, 0.025, 0, 0, iron);
    gb.grid(8, 2, true, (u, v) => { const a = u * TWO; return [sin(a) * (0.17 - v * 0.15), -0.08 + v * 0.1, cos(a) * (0.17 - v * 0.15), 0.3, 0.3, 0.34]; }, { pt: true });
    tube(gb, [[0, 0.1, 0], [0, 0.0, 0]], s => 0.01, 4, () => [0.3, 0.3, 0.34]);
    return gb.build();
  });
  K.lanternGlow = () => memo('lantG', () => { const gb = new GB(); gb.grid(8, 5, true, (u, v) => { const a = u * TWO, el = v * PI; return [sin(a) * sin(el) * 0.1, -0.24 - cos(el) * 0.13, cos(a) * sin(el) * 0.1, 1, 1, 1]; }, { pb: true, pt: true }); return gb.build(); });
  // kristal kaide (ayna ayağı): sekiz kenarlı kademeli taş, boy 1, yarıçap 0.5; üstü halka (ayrı glow)
  K.pedestal = (k = 0) => memo('ped' + k, () => {
    const gb = new GB();
    lathe(gb, [[0, 0.52, 0.6], [0.0, 0.5, 0.7], [0.1, 0.5, 0.95], [0.14, 0.4, 0.8], [0.5, 0.34, 0.9], [0.6, 0.38, 0.8], [0.68, 0.46, 1.0], [0.72, 0.4, 1.0], [0.72, 0, 1.0]], 8, { rough: 0.05, pb: false, pt: true });
    return gb.build((i, nx, ny, nz, c, x, y) => { const L = 0.85 + 0.2 * fbm(x * 3, y * 3, nz); c[0] *= L * 0.9; c[1] *= L * 0.95; c[2] *= L * 1.1; });
  });
  K.pedestalGlow = () => memo('pedG', () => { const gb = new GB(), pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * TWO; pts.push([sin(a) * 0.37, 0.735, cos(a) * 0.37]); } tube(gb, pts, () => 0.018, 4, () => [1, 1, 1]); return gb.build(); });

  // ═════════ TAPINAK ═════════
  // sütun: yükseklik 1; yarıçap 0.075 (oluklu). kind: 0 sağlam, 1 kırık (0.62 yük.), 2 devrik gövde (yatık x ekseninde, uzunluk 0.55)
  K.column = (kind = 0, k = 0) => memo('col' + kind + '_' + k, () => {
    const gb = new GB(), r = rng(k * 37 + kind), Rs = 0.075;
    const ln = (y, rr, L, fl) => [y, rr, L, fl];
    if (kind === 2) {   // yatan gövde parçası
      const g2 = new GB(); lathe(g2, [[0, Rs * 1.0, 0.8, 0.12], [0.02, Rs, 0.9, 0.12], [0.5, Rs * 0.97, 1.0, 0.12], [0.55, Rs * 0.95, 0.9, 0.12], [0.55, 0, 0.9]], 14, { flutes: 10, pt: true, pb: true });
      const g = g2.build((i, nx, ny, nz, c, x, y, z) => { const L = 0.88 + 0.16 * fbm(x * 9, y * 5, z * 9) - 0.1 * (1 - ny) * 0; c[0] *= L; c[1] *= L; c[2] *= L * 0.97; });
      g.rotateZ(PI / 2); g.translate(-0.275, Rs, 0); return g;
    }
    const top = kind === 1 ? 0.64 : 0.82;
    const prof = [ln(0, 0.1, 0.62), ln(0.015, 0.1, 0.9), ln(0.045, 0.105, 0.78), ln(0.07, 0.092, 0.95), ln(0.1, Rs * 1.06, 0.9, 0.12), ln(top * 0.5, Rs, 1.0, 0.12), ln(top * 0.7, Rs * 0.97, 0.98, 0.12), ln(top, Rs * 0.93, 0.9, 0.12)];
    if (kind === 0) prof.push(ln(top + 0.01, Rs * 1.1, 0.75), ln(top + 0.03, Rs * 1.28, 0.95), ln(top + 0.06, Rs * 1.6, 1.0), ln(top + 0.075, Rs * 1.6, 0.85));
    else prof.push(ln(top + 0.0, 0, 0.9));
    lathe(gb, prof, 16, { flutes: 10, pt: kind === 0 });
    if (kind === 0) boxT(gb, 0, 0.935, 0, 0.27, 0.05, 0.27, 0, 0.3, stoneCol([0.92, 0.9, 0.84], k), 0.004, k);
    const g = gb.build((i, nx, ny, nz, c, x, y, z) => {
      let L = 0.88 + 0.16 * fbm(x * 9, y * 5, z * 9); L *= 0.78 + 0.22 * sstep(0, 0.25, y);
      if (kind === 1 && y > top - 0.1) { L *= 0.85 + 0.3 * vn(x * 30, y * 30, z * 30); }
      c[0] *= L; c[1] *= L; c[2] *= L * 0.97;
    });
    if (kind === 1) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > top - 0.02) p.setY(i, top + 0.05 * (vn(p.getX(i) * 40, 1, p.getZ(i) * 40) - 0.3) + (p.getX(i) > 0 ? 0.05 : -0.015)); } g.computeVertexNormals(); }
    return g;
  });
  // taş blok (devrik/kırık parça): yarıçap ~0.5
  K.fallenBlock = (k = 0) => memo('fblk' + k, () => {
    const gb = new GB(), r = rng(k * 23 + 4);
    boxT(gb, 0, 0.15, 0, 0.6 + r() * 0.2, 0.3, 0.45 + r() * 0.15, (r() - 0.5) * 0.12, r() * 2, stoneCol([0.9, 0.87, 0.78], k), 0.05, k);
    if (r() < 0.6) boxT(gb, 0.5, 0.1, 0.2, 0.34, 0.2, 0.3, 0.1, r() * 2, stoneCol([0.86, 0.84, 0.76], k + 3), 0.04, k + 1);
    return gb.build((i, nx, ny, nz, c, x, y, z) => { const L = 0.88 + 0.2 * fbm(x * 6, y * 6, z * 6); c[0] *= L; c[1] *= L; c[2] *= L; });
  });
  // taş kemer: x −0.5..0.5 (iç boşluk ~0.76 geniş), 0.58 sütun + yarım daire; kind 1 kırık
  K.archStone = (kind = 0, k = 0) => memo('archS' + kind + k, () => {
    const gb = new GB(), r = rng(k * 13 + kind), col = stoneCol([0.92, 0.9, 0.82], k), R = 0.4, cy = 0.58, T = 0.12, D = 0.2;
    boxT(gb, -0.5, 0.29, 0, 0.16, 0.58, D, 0, 0, col, 0.008, 1); boxT(gb, 0.5, kind ? 0.16 : 0.29, 0, 0.16, kind ? 0.32 : 0.58, D, 0, 0, col, 0.008, 2);
    boxT(gb, -0.5, 0.03, 0, 0.22, 0.06, D + 0.05, 0, 0, col, 0.004, 3); boxT(gb, 0.5, 0.03, 0, 0.22, 0.06, D + 0.05, 0, 0, col, 0.004, 4);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = (i + 0.5) / n * PI; if (kind && a < 0.58 * PI) continue;   // sağ yarı çökmüş
      const key = i === 4, w = PI * R / n * 1.9 * (key ? 1.15 : 1), rr = R + T / 2;
      boxT(gb, cos(a) * rr, cy + sin(a) * rr, 0, w, key ? T * 1.35 : T, D, a + PI / 2, 0, col, 0.006, i + 5);
    }
    return gb.build((i, nx, ny, nz, c, x, y, z) => { const L = 0.86 + 0.22 * fbm(x * 6, y * 6, z * 6); c[0] *= L; c[1] *= L; c[2] *= L * 0.97; });
  });
  // dikilitaş: yükseklik 1, taban yarım genişlik 0.08; runes: ayrı glow (bantlar)
  K.obelisk = (k = 0) => memo('obel' + k, () => {
    const gb = new GB(), col = L => [0.9 * L, 0.88 * L, 0.8 * L], w0 = 0.07, w1 = 0.045, yt = 0.88;
    boxT(gb, 0, 0.025, 0, 0.26, 0.05, 0.26, 0, 0, stoneCol([0.88, 0.86, 0.78], k), 0.004, 1); boxT(gb, 0, 0.065, 0, 0.19, 0.04, 0.19, 0, 0, stoneCol([0.92, 0.9, 0.82], k), 0.003, 2);
    const c = (x, y, z, sx, sz) => [x * sx, y, z * sz];
    for (let i = 0; i < 4; i++) {
      const a = i * PI / 2, nx = sin(a), nz = cos(a), px = cos(a), pz = -sin(a), sh = [0.85, 0.72, 0.8, 0.68][i];
      const P = (s, y, w) => [nx * w + px * s * w, y, nz * w + pz * s * w];
      fq(gb, P(-1, 0.08, w0), P(1, 0.08, w0), P(1, yt, w1), P(-1, yt, w1), col(sh * 0.8), [nx, 0.06, nz], col(sh));
      ft(gb, P(-1, yt, w1), P(1, yt, w1), [0, 1.0, 0], col(sh * 1.05), [nx, 0.5, nz]);
    }
    return gb.build((i, nx, ny, nz, c2, x, y, z) => { const L = 0.88 + 0.18 * fbm(x * 20, y * 8, z * 20); c2[0] *= L; c2[1] *= L; c2[2] *= L; });
  });
  K.obeliskRunes = (k = 0) => memo('obelR' + k, () => {
    const gb = new GB(), r = rng(k + 4);
    for (let i = 0; i < 4; i++) {
      const a = i * PI / 2, ca = cos(a), sa = sin(a);
      for (let j = 0; j < 5; j++) {
        const y = 0.2 + j * 0.13, w = 0.062 - j * 0.004, hw = 0.016 + r() * 0.012;
        boxT(gb, sa * (w + 0.002), y, ca * (w + 0.002), 0.012 + hw, 0.022 + r() * 0.02, 0.012 + hw, 0, a, () => [1, 1, 1], 0, 0);
      }
    }
    return gb.build();
  });
  // basamak: genişlik 1 (x), n kademe, her biri 0.1 yüksek 0.22 derin; yükselen yön −z; ön yüzü +z
  K.steps = (n = 4, k = 0) => memo('stp' + n + '_' + k, () => {
    const gb = new GB(), col = stoneCol([0.9, 0.88, 0.8], k);
    for (let i = 0; i < n; i++) boxT(gb, 0, 0.05 + i * 0.1, -i * 0.22, 1.0 - (i === 0 ? 0 : 0.0), 0.1 * (i + 1), 0.24, 0, 0, col, 0.006, k + i);
    return gb.build((i, nx, ny, nz, c, x, y, z) => { const L = 0.88 + 0.2 * fbm(x * 5, y * 8, z * 5); c[0] *= L; c[1] *= L; c[2] *= L * 0.97; });
  });
  // ay evresi plaketi: dik disk (xy düzlemi, +z yüzü), yarıçap 0.5; phase 0..7 (yeni ay → dolunay → ...); parlak kısım köşe rengiyle
  K.moonDisc = (phase = 0) => memo('mdisc' + phase, () => {
    const gb = new GB(), R = 0.5, th = 0.07, ph = phase / 8 * TWO, kk = (1 - cos(ph)) / 2, Rm = 0.34, lit = (x, y) => {
      if (hyp(x, y) > Rm) return 0; const w = Math.sqrt(Math.max(0, Rm * Rm - y * y)), xt = w * cos(PI * kk);
      return sin(ph) >= 0 ? (x > xt ? 1 : 0) : (x < -xt ? 1 : 0);
    };
    gb.grid(28, 7, true, (u, v) => { const a = u * TWO, rr = R * v; return [sin(a) * rr, cos(a) * rr, th, 1, 1, 1]; }, { hint: [0, 0, 1] });
    const g = gb.build((i, nx, ny, nz, c, x, y) => {
      const m = lit(x, y), rim = sstep(0.4, 0.5, hyp(x, y)), L = 0.82 + 0.1 * fbm(x * 6, y * 6, 1);
      const d = hyp(x, y), ring = (d > 0.36 && d < 0.4) ? 0.72 : 1;
      c[0] = L * (m ? 1.15 : 0.62 * ring) * (1 - rim * 0.25); c[1] = L * (m ? 1.1 : 0.64 * ring) * (1 - rim * 0.25); c[2] = L * (m ? 0.95 : 0.7 * ring) * (1 - rim * 0.25);
    });
    // yarım kalınlık: arka yüz (düz), kenar
    const b = new GB(); b.grid(28, 1, true, (u, v) => { const a = u * TWO; return [sin(a) * R, cos(a) * R, v ? th : -th, 0.62, 0.6, 0.55]; });
    const g2 = b.build(), m2 = new THREE.BufferGeometry(); void m2;
    return mergeG(g, g2);
  });
  function mergeG(a, b) {
    const pa = a.attributes, pb = b.attributes, na = pa.position.count, nb = pb.position.count, out = new THREE.BufferGeometry();
    for (const key of ['position', 'normal', 'color']) { const arr = new Float32Array((na + nb) * 3); arr.set(pa[key].array, 0); arr.set(pb[key].array, na * 3); out.setAttribute(key, new THREE.BufferAttribute(arr, 3)); }
    const idx = new Uint16Array(a.index.count + b.index.count); idx.set(a.index.array, 0); for (let i = 0; i < b.index.count; i++) idx[a.index.count + i] = b.index.array[i] + na;
    out.setIndex(new THREE.BufferAttribute(idx, 1)); out.computeBoundingSphere(); out.computeBoundingBox(); out.userData.keep = true; return out;
  }
  // ay çiçeği: sap + yapraklar (decor, rüzgârda sallanır), boy ~1; bloom ayrı (glow): geniş açık taç, tepe 0.95
  K.moonflower = (k = 0) => memo('mfl' + k, () => {
    const gb = new GB(), r = rng(k * 29 + 1), lean = (r() - 0.5) * 0.25, la = r() * TWO;
    tube(gb, [[0, 0, 0], [sin(la) * lean * 0.5, 0.35, cos(la) * lean * 0.5], [sin(la) * lean, 0.7, cos(la) * lean], [sin(la) * lean * 1.2, 0.9, cos(la) * lean * 1.2]], s => 0.022 * (1 - 0.3 * s), 5, (s, u) => [0.42 + 0.12 * s, 0.62 + 0.15 * s, 0.4], { sway: true });
    for (let i = 0; i < 3; i++) {
      const a = r() * TWO + i * 2.1, y = 0.06 + i * 0.1, L = 0.32 + r() * 0.12;
      gb.grid(4, 5, false, (u, v) => { const xx = (u - 0.5) * 2, w = sin(v * PI * 0.95) * 0.1 * (1 - 0.3 * v); const x = xx * w, z = v * L, y2 = y + v * 0.12 - v * v * 0.2 - 0.02 * xx * xx; return [sin(a) * z + cos(a) * x, y2, cos(a) * z - sin(a) * x, 0.5 + 0.4 * v, 0.7 + 0.28 * v, 0.5 + 0.2 * v, 30]; }, { hint: [0, 1, 0] });
    }
    return gb.build();
  });
  K.moonflowerBloom = (k = 0) => memo('mflb' + k, () => {
    const gb = new GB(), r = rng(k * 29 + 1), lean = (r() - 0.5) * 0.25, la = r() * TWO, cx = sin(la) * lean * 1.2, cz = cos(la) * lean * 1.2, cyb = 0.92, n = 8;
    for (let i = 0; i < n; i++) {
      const a = i / n * TWO + r() * 0.1, L = 0.2 + r() * 0.03, ca = cos(a), sa = sin(a);
      gb.grid(4, 4, false, (u, v) => { const xx = (u - 0.5) * 2, w = Math.pow(sin(Math.min(1, v * 1.05) * PI), 0.8) * 0.065 * (1 + 0.3 * v), d = v * L, up = 0.05 + 0.1 * sin(v * PI * 0.7) + v * 0.05; return [cx + sa * d + ca * xx * w, cyb + up - xx * xx * w * 0.5, cz + ca * d - sa * xx * w, 0.78 + 0.22 * (1 - v), 0.82 + 0.18 * (1 - v), 0.9 + 0.1 * (1 - v), 30]; }, { hint: [0, 1, 0] });
    }
    gb.grid(6, 3, true, (u, v) => { const a = u * TWO; return [cx + sin(a) * 0.035 * (1 - v * 0.6), cyb + 0.04 + v * 0.03, cz + cos(a) * 0.035 * (1 - v * 0.6), 1, 0.92, 0.55, 30]; }, { pt: true });
    return gb.build();
  });
  // havuz kenarı: taş halka, dış yarıçap ~1.0 (iç ~0.82), yükseklik ~0.14
  K.poolRim = (k = 0) => memo('prim' + k, () => {
    const gb = new GB(), n = 28, pts = []; for (let i = 0; i <= n; i++) { const a = i / n * TWO; pts.push([sin(a) * 0.93, 0.05, cos(a) * 0.93]); }
    tube(gb, pts, s => 0.085 + 0.03 * Math.abs(sin(s * 60 + k)), 6, (s, u) => { const L = (0.8 + 0.25 * vn(s * 30, u * 3, k)) * (0.85 + 0.15 * Math.abs(sin(s * 60 + k))); return [0.9 * L, 0.88 * L, 0.8 * L]; }, { rough: 0.25 });
    return gb.build();
  });

  // ═════════ YANARDAĞ ═════════
  // bazalt sütun kümesi: yarıçap ~0.6, boy 1 (en uzun); altıgen prizmalar, düz üst yüzler
  K.basalt = (k = 0, n = 7) => memo('bas' + k + '_' + n, () => {
    const gb = new GB(), r = rng(k * 59 + 3), hexs = [[0, 0]];
    for (let i = 0; i < 6; i++) hexs.push([cos(i * PI / 3) * 0.2 * 1.73, sin(i * PI / 3) * 0.2 * 1.73]);
    for (let i = 0; i < 6; i++) hexs.push([cos(i * PI / 3 + 0.5) * 0.4 * 1.73 + (r() - 0.5) * 0.04, sin(i * PI / 3 + 0.5) * 0.4 * 1.73]);
    const use = hexs.map((h, i) => ({ h, i, d: hyp(h[0], h[1]) + r() * 0.25 })).sort((a, b) => a.d - b.d).slice(0, n);
    for (const { h, i } of use) {
      const hh = Math.max(0.18, (1 - hyp(h[0], h[1]) * 0.9) * (0.5 + r() * 0.6)), R = 0.19, ty = (r() - 0.5) * 0.08, rot = r() * 0.15;
      const pt = (a, y) => [h[0] + cos(a + rot) * R, y, h[1] + sin(a + rot) * R], tp = a => { const p = pt(a, hh); p[1] += ty * cos(a + rot) * 1.0; return p; };
      const tc = [h[0], hh, h[1]], sh = 0.82 + 0.3 * r();
      for (let s = 0; s < 6; s++) {
        const a0 = s * PI / 3, a1 = (s + 1) * PI / 3, am = (a0 + a1) / 2, hint = [cos(am + rot), 0, sin(am + rot)], L = 0.62 + 0.3 * (0.5 + 0.5 * cos(am - 2.2)), cb = [0.5 * L * sh, 0.4 * L * sh, 0.36 * L * sh];
        fq(gb, pt(a0, -0.1), pt(a1, -0.1), tp(a1), tp(a0), [cb[0] * 0.5, cb[1] * 0.5, cb[2] * 0.5], hint, cb);
        ft(gb, tp(a0), tp(a1), tc, [0.85 * sh, 0.66 * sh, 0.58 * sh], [0, 1, 0]);
        void a0; void a1;
      }
      void i;
    }
    return gb.build((i, nx, ny, nz, c, x, y, z) => {
      const L = 0.78 + 0.3 * fbm(x * 8, y * 3, z * 8), top = sstep(0.6, 0.95, ny);
      c[0] = (c[0] + 0.02) * L * (1 + top * 0.2); c[1] = c[1] * L; c[2] = c[2] * L;
    });
  });
  // soğumuş lav sırtı: x ekseninde uzunluk 1 (±0.5), genişlik ~0.34, boy ~0.22; crack: parlayan çatlaklar (glow)
  const ridgeH = (x, z, k) => Math.max(0, (0.2 + 0.05 * vn(x * 6 + k, 0, 3)) * Math.pow(Math.max(0, 1 - Math.pow(x / 0.52, 2)), 0.6) * (1 - Math.pow(z / 0.2, 2)) * (0.7 + 0.5 * vn(x * 9, z * 9, k)));
  K.lavaRidge = (k = 0) => memo('ridge' + k, () => {
    const gb = new GB();
    gb.grid(18, 6, false, (u, v) => { const x = (u - 0.5) * 1.06, z = (v - 0.5) * 0.44, y = ridgeH(x, z, k) - 0.015, w = 0.5 + 0.5 * sin((x * 14 + k) + vn(x * 5, z * 8, k) * 3); return [x, y, z, 0.3, 0.22, 0.2, 0]; }, { hint: [0, 1, 0] });
    return gb.build((i, nx, ny, nz, c, x, y, z) => {
      const rope = 0.82 + 0.18 * sin(x * 38 + vn(x * 4, z * 9, k) * 6), L = (0.55 + 0.7 * y / 0.22) * rope * (0.85 + 0.25 * fbm(x * 10, 0, z * 10));
      c[0] = 0.5 * L; c[1] = 0.38 * L; c[2] = 0.34 * L;
    });
  });
  K.lavaRidgeCrack = (k = 0) => memo('ridgeC' + k, () => {
    const gb = new GB(), r = rng(k * 11 + 6);
    for (let q = 0; q < 3; q++) {
      const z0 = (r() - 0.5) * 0.18, pts = [];
      for (let i = 0; i <= 10; i++) { const x = -0.4 + i * 0.08 + (r() - 0.5) * 0.03, z = z0 + sin(i * 1.3 + q * 2) * 0.05 + (r() - 0.5) * 0.02; pts.push([x, ridgeH(x, z, k) + 0.004, z]); }
      tube(gb, pts, s => 0.011 * sin(Math.min(1, s * 1.1 + 0.05) * PI) + 0.003, 3, (s) => [1, 0.55 + 0.3 * (1 - s), 0.2]);
    }
    return gb.build();
  });
  // yerde duran parlak çatlak yaması (glow): ~1×1, y≈0.02
  K.crackPatch = (k = 0) => memo('crk' + k, () => {
    const gb = new GB(), r = rng(k * 7 + 21);
    const branch = (x, z, a, len, depth) => {
      const pts = [[x, 0.025, z]]; let px = x, pz = z, aa = a;
      for (let i = 0; i < 5; i++) { aa += (r() - 0.5) * 0.9; px += cos(aa) * len / 5; pz += sin(aa) * len / 5; pts.push([px, 0.025, pz]); }
      tube(gb, pts, s => 0.014 * (1 - s * 0.7) * (depth ? 0.7 : 1) + 0.002, 3, (s) => [1, 0.7 - 0.25 * s, 0.25]);
      if (depth < 2 && len > 0.2) { const m = pts[2 + (r() * 2 | 0)]; branch(m[0], m[2], aa + (r() < 0.5 ? 1 : -1) * (0.7 + r() * 0.5), len * 0.55, depth + 1); }
    };
    branch(-0.4, 0, (r() - 0.5) * 0.6, 0.85, 0); if (r() < 0.7) branch(0.0, -0.05, 2 + r(), 0.5, 1);
    return gb.build();
  });
  // taş dişli: z ekseninde düz disk, yarıçap 1 (diş uçları), kalınlık 0.22; teeth: diş sayısı
  K.gear = (teeth = 10, k = 0) => memo('gear' + teeth + '_' + k, () => {
    const gb = new GB(), r = rng(k + 2), nu = teeth * 4, T = 0.11;
    const rad = a => { const t = ((a / TWO * teeth) % 1 + 1) % 1; return t < 0.12 ? 0.8 : t < 0.5 ? 1.0 : t < 0.62 ? 0.8 : 0.8; };
    const radS = a => { const t = ((a / TWO * teeth) % 1 + 1) % 1; return t < 0.1 ? 0.8 + t * 2 : t < 0.5 ? 1.0 : t < 0.6 ? 1.0 - (t - 0.5) * 2 : 0.8; };
    void rad;
    for (const sd of [1, -1]) gb.grid(nu, 5, true, (u, v) => { const a = u * TWO, R = radS(a) * v; const ring = v > 0.5 && v < 0.62 ? 0.62 : 1; return [cos(a) * R, sin(a) * R, sd * (T - (v === 2 ? 0.02 : 0) - (v === 1 ? 0.0 : 0)), ring * 0.9, ring * 0.82, ring * 0.76]; }, { hint: [0, 0, sd] });
    gb.grid(nu, 1, true, (u, v) => { const a = u * TWO, R = radS(a); return [cos(a) * R, sin(a) * R, (v ? 1 : -1) * T, 0.62, 0.54, 0.5]; }, { hint: null });
    return gb.build((i, nx, ny, nz, c, x, y, z) => { const L = 0.85 + 0.25 * fbm(x * 4, y * 4, z * 8); const sp = Math.abs(sin(Math.atan2(y, x) * 3)) < 0.18 && hyp(x, y) > 0.2 && hyp(x, y) < 0.78 ? 0.7 : 1; c[0] *= L * sp; c[1] *= L * sp; c[2] *= L * sp; });
  });
  // su çarkı: z ekseninde, yarıçap 1, genişlik 0.5; kürek sayısı n; ahşap
  K.waterwheel = (n = 10, k = 0) => memo('wheel' + n + '_' + k, () => {
    const gb = new GB(), wood = (s, u) => { const L = 0.74 + 0.26 * vn(u * 6, s * 7, k); return [0.62 * L, 0.42 * L, 0.26 * L]; }, W = 0.25;
    for (const z of [-W, W]) { const pts = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * TWO; pts.push([cos(a) * 0.96, sin(a) * 0.96, z]); } tube(gb, pts, () => 0.045, 5, wood, { rough: 0.15 });
      for (let i = 0; i < n; i++) { const a = i / n * TWO; tube(gb, [[0, 0, z], [cos(a) * 0.5, sin(a) * 0.5, z], [cos(a) * 0.95, sin(a) * 0.95, z]], () => 0.035, 4, wood); } }
    for (let i = 0; i < n; i++) { const a = i / n * TWO + 0.1; boxT(gb, cos(a) * 1.0, sin(a) * 1.0, 0, 0.26, 0.05, W * 2 + 0.06, a, 0, (L) => [0.7 * L, 0.5 * L, 0.32 * L], 0.004, i); }
    tube(gb, [[0, 0, -0.6], [0, 0, 0], [0, 0, 0.6]], () => 0.11, 8, (s) => [0.45 + 0.1 * s, 0.32, 0.2], { capEnd: true });
    return gb.build();
  });
  // çark çerçevesi: iki taş ayak (x ±1.15), üstte yatak; boy ~1.35
  K.wheelFrame = (k = 0) => memo('wfr' + k, () => {
    const gb = new GB(), col = stoneCol([0.7, 0.55, 0.45], k);
    for (const z of [-0.6, 0.6]) { boxT(gb, 0, 0.0, z, 0.9, 0.2, 0.28, 0, 0, col, 0.01, 1); for (const sd of [-1, 1]) boxT(gb, sd * 0.28, 0.65, z, 0.18, 1.3, 0.2, sd * -0.12, 0, col, 0.01, 2 + sd); boxT(gb, 0, 1.3, z, 0.6, 0.12, 0.26, 0, 0, col, 0.008, 5); }
    return gb.build((i, nx, ny, nz, c, x, y, z) => { const L = 0.86 + 0.22 * fbm(x * 5, y * 5, z * 5); c[0] *= L; c[1] *= L; c[2] *= L; });
  });
  // taş tümsek (kaya yığını, yuvarlak): yarıçap 1, boy 0.6; ısıdan kararmış
  K.stoneMound = (k = 0) => memo('mound' + k, () => {
    const gb = new GB(), r = rng(k * 5 + 11), ox = r() * 9;
    gb.grid(14, 7, true, (u, v) => { const a = u * TWO, el = v * PI * 0.5, R = 1 + 0.18 * (fbm(cos(a) * 1.4 + ox, el, sin(a) * 1.4) - 0.5) * 2; return [cos(el) * sin(a) * R, sin(el) * 0.65 * R - 0.05, cos(el) * cos(a) * R, 1, 1, 1]; }, { pt: true });
    return gb.build((i, nx, ny, nz, c, x, y, z) => { const L = 0.5 + 0.5 * y + 0.2 * fbm(x * 5, y * 5, z * 5); c[0] = 0.62 * L; c[1] = 0.5 * L; c[2] = 0.45 * L; });
  });

  // ═════════ SU / HAVUZ (tek çizim) ═════════
  // list: [{x,z,r,k}]; opt: { c1, c2, a (opaklık), y, spark, sw (dalga) } → tek ağ (api.add), saydam ışıltılı su
  K.water = (api, list, o = {}) => {
    if (!list.length) return null;
    const pos = [], uv = [], idx = [], y = o.y ?? 0.045, N = 18;
    list.forEach((q, qi) => {
      const b = pos.length / 3, r = rng((q.k ?? qi) * 31 + 7), ph = r() * 9;
      pos.push(q.x, y, q.z); uv.push(0, 0);
      for (let i = 0; i < N; i++) { const a = i / N * TWO, rr = q.r * (1 + 0.13 * sin(a * 3 + ph) + 0.07 * sin(a * 5 + ph * 2)); pos.push(q.x + sin(a) * rr * (q.sx || 1), y, q.z + cos(a) * rr); uv.push(sin(a) * rr, cos(a) * rr); }
      for (let i = 0; i < N; i++) idx.push(b, b + 1 + i, b + 1 + (i + 1) % N);
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const u = { uTime: { value: 0 }, c1: { value: new THREE.Color(o.c1 ?? 0x2a9aa8) }, c2: { value: new THREE.Color(o.c2 ?? 0xc8fff0) }, a: { value: o.a ?? 0.8 } };
    const m = new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false,
      vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'uniform float uTime; uniform vec3 c1; uniform vec3 c2; uniform float a; varying vec2 vUv; varying vec3 vW; void main(){ vec2 p = vW.xz; float w = sin(p.x*3.1+uTime*1.1+sin(p.y*2.3+uTime*0.7)*1.6)*sin(p.y*2.7-uTime*0.9+sin(p.x*1.9)*1.4); float s = pow(max(0.0, w), 6.0); float f = 0.5 + 0.5*sin(p.x*0.9+p.y*1.3+uTime*0.5); vec3 c = mix(c1, c2, 0.18 + 0.2*f) + c2*s*' + (o.spark ?? 0.55).toFixed(2) + '; gl_FragColor = vec4(c, a); }' });
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 1; mesh.name = 'e567-su'; api.add(mesh); api.dispose(m); api.dispose(g);
    let t = 0; api.anim(dt => { t += Math.min(dt, 0.05); u.uTime.value = t; });
    return mesh;
  };
})();
