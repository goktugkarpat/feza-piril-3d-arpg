/* ── EKIT: Bölüm 2-4 çevre süsleri için ortak yardımcılar (E234) ──
   PROPKIT'i genişletir (07m_kit.js'e dokunmadan): ucuz uzak ağaçlar (smallTree), kütük kesiti (stump), yaprak yığını (litter),
   saman balyası (hay), buğday sırası (wheatRow), çit-kazığı vb. + yerleşim yardımcıları (alan mesafe haritası, küme seçici).
   Hepsi köşe-renkli, birim boy; api.put(geo, x,y,z, sx,sy,sz, tint, yaw, rx, rz, 'shinyNS'|'decor'|'glow') ile yerleşir. */
const EKIT = (() => {
  'use strict';
  const P = PROPKIT, { GB, tube, rng, vn, fbm, sstep, mix, clamp } = P;
  const PI = Math.PI, TWO = PI * 2, sin = Math.sin, cos = Math.cos, hyp = Math.hypot;
  const CACHE = {};
  const memo = (k, f) => CACHE[k] || (CACHE[k] = (() => { const g = f(); if (g && g.isBufferGeometry) g.name = k.replace(/[0-9]+$/, ''); return g; })());
  const bark = (s, q, k, base = [0.62, 0.43, 0.3]) => { const L = 0.42 + 0.34 * vn(q * 6 + k, s * 9, k) + 0.14 * Math.abs(sin(q * TWO * 4 + s * 3)); return [base[0] * L, base[1] * L, base[2] * L]; };

  // yumuşak yaprak/kaya öbeği (ucuz): üstü açık, altı koyu
  function blob(gb, cx, cy, cz, R, sy, seed, warm = 0, nu = 8, nv = 5) {
    const ph = seed * 3.7;
    gb.grid(nu, nv, true, (u, v) => {
      const a = u * TWO, el = (v - 0.5) * PI, dx = cos(el) * sin(a), dy = sin(el), dz = cos(el) * cos(a);
      const rr = R * (1 + 0.22 * (fbm(dx * 1.7 + ph, dy * 1.7, dz * 1.7) - 0.5) * 2);
      const L = (0.46 + 0.54 * sstep(-0.9, 0.9, dy)) * (0.88 + 0.2 * fbm(dx * 3 + ph, dy * 3, dz * 3)), w = warm * 0.25 * sstep(0.2, 1, dy);
      return [cx + dx * rr, cy + dy * rr * sy * (dy < 0 ? 0.55 : 1), cz + dz * rr, L * (0.84 + w), L, L * (0.82 - w * 0.6)];
    }, { pb: true, pt: true });
  }

  // ucuz uzak ağaç: 'pine' (kat kat), 'round' (3-4 öbek), 'birch' (beyaz gövde), 'poplar' (uzun ince), 'bare' yok. Boy 1; ~150-330 üçgen
  function smallTree(kind = 'round', k = 0) {
    return memo('stree' + kind + k, () => {
      const r = rng(k * 71 + kind.length * 13), wood = new GB(), leaf = new GB(), fruit = new GB();
      if (kind === 'pine') {
        tube(wood, [[0, -0.02, 0], [0.01, 0.25, 0], [0, 0.5, 0]], s => 0.045 * (1 - 0.5 * s) + 0.01, 5, (s, q) => bark(s, q, k), { rough: 0.25 });
        const nt = 5;
        for (let i = 0; i < nt; i++) {
          const s = i / (nt - 1), R = 0.34 * (1 - s * 0.72) + 0.04, y0 = 0.16 + s * 0.52, h = 0.3 - s * 0.08, ph = r() * 6, tw = 0.55 + 0.45 * r();
          leaf.grid(11, 2, true, (u, v) => {
            const a = u * TWO + i * 0.4, sc = 1 + 0.14 * sin(a * 3 + ph), rr = v === 0 ? R * sc : R * 0.5 * sc;
            const L = mix(0.42, 1, v) * (0.9 + 0.15 * vn(a, i, k)) * (0.9 + 0.1 * tw);
            return [sin(a) * rr, y0 + (v === 0 ? 0 : h * 0.55), cos(a) * rr, L * 0.82, L, L * 0.86];
          }, { pt: true });
          void h;
        }
      } else if (kind === 'poplar') {
        tube(wood, [[0, -0.02, 0], [0, 0.2, 0]], s => 0.03, 5, (s, q) => bark(s, q, k), { rough: 0.2 });
        for (let i = 0; i < 4; i++) blob(leaf, (r() - 0.5) * 0.05, 0.28 + i * 0.2, (r() - 0.5) * 0.05, 0.17 - i * 0.015, 1.5, k * 7 + i, (r() - 0.3) * 2, 7, 4);
      } else {
        const birch = kind === 'birch', top = [0.03, 0.46, 0.0];
        tube(wood, [[0, -0.02, 0], [0.025, 0.25, 0], top], s => 0.05 * (1 - 0.45 * s) + 0.012, 5, (s, q) => birch ? (() => { const L = 0.78 + 0.22 * vn(q * 8, s * 14, k) - (vn(q * 5 + 3, s * 22, 1) > 0.78 ? 0.55 : 0); return [L, L * 0.97, L * 0.9]; })() : bark(s, q, k), { rough: 0.2 });
        const n = 3 + ((r() * 2) | 0);
        for (let i = 0; i < n; i++) { const a = i / n * TWO + r(), d = 0.11 + r() * 0.1; blob(leaf, top[0] + sin(a) * d, 0.56 + r() * 0.14, top[2] + cos(a) * d, 0.2 + r() * 0.07, 0.85, k * 9 + i, (r() - 0.3) * 2); }
        blob(leaf, top[0], 0.74 + r() * 0.05, top[2], 0.24, 0.85, k * 9 + 8, (r() - 0.3) * 2);
        if (kind === 'apple') for (let i = 0; i < 9; i++) { const a = r() * TWO, el = (0.05 + r() * 0.5) * PI * 0.5, rr = 0.27, cy = 0.56 + 0.1 * r() - 0.04; fruit.grid(5, 3, true, (u, v) => { const aa = u * TWO, e2 = (v - 0.5) * PI, L = 0.7 + 0.3 * sstep(-0.8, 0.9, sin(e2)); return [top[0] + sin(a) * rr * cos(el) + cos(e2) * sin(aa) * 0.028, cy + sin(el) * rr * 0.8 + sin(e2) * 0.028, top[2] + cos(a) * rr * cos(el) + cos(e2) * cos(aa) * 0.028, L, L * 0.9, L * 0.8]; }, { pb: true, pt: true }); }
      }
      return { wood: wood.build(), leaf: leaf.build(), fruit: fruit.n ? fruit.build() : null };
    });
  }
  function placeSmall(api, kind, k, x, z, h, o = {}) {
    const t = smallTree(kind, k), mk = o.mat || 'shinyNS', yaw = o.yaw || 0;
    api.put(t.wood, x, 0, z, h, h, h, o.wood ?? 0xffffff, yaw, 0, 0, mk);
    api.put(t.leaf, x, 0, z, h, h, h, o.leaf ?? 0xffffff, yaw, 0, 0, mk);
    if (t.fruit) api.put(t.fruit, x, 0, z, h, h, h, o.fruit ?? 0xff5a3a, yaw, 0, 0, mk);
  }

  // kütük kesiti (kök ayaklı, üstünde halka desenli disk) boy ~0.34, yarıçap ~0.25
  function stump(k = 0) {
    return memo('stump' + k, () => {
      const r = rng(k * 37 + 5), gb = new GB(), H = 0.28 + r() * 0.14, R = 0.2 + r() * 0.07;
      tube(gb, [[0, -0.03, 0], [0.005, H * 0.5, 0], [0, H, 0]], s => R * (1 + 0.5 * Math.exp(-s * 10)) * (1 - 0.1 * s), 7, (s, q) => bark(s, q, k), { rough: 0.35 });
      for (let i = 0; i < 4; i++) { const a = i / 4 * TWO + r(), rp = []; for (let j = 0; j <= 3; j++) { const s = j / 3; rp.push([sin(a) * (R * 0.8 + s * R * 1.1), R * 0.9 * Math.pow(1 - s, 2) - 0.005, cos(a) * (R * 0.8 + s * R * 1.1)]); } tube(gb, rp, s => R * 0.32 * (1 - s) + 0.008, 4, (s, q) => bark(s, q, k + i), { rough: 0.2 }); }
      gb.grid(7, 2, true, (u, v) => { const a = u * TWO, rr = R * 0.92 * (1 - v) * (1 + 0.06 * sin(a * 3 + k)), ring = 0.8 + 0.2 * sin((1 - v) * 14); return [sin(a) * rr, H + 0.004, cos(a) * rr, 0.95 * ring, 0.78 * ring, 0.52 * ring, 0]; }, { pt: true, hint: [0, 1, 0] });
      return gb.build();
    });
  }
  // yaprak yığını (zemine yassı, renkli yapraklar): yarıçap ~0.6
  function litter(k = 0, n = 7) {
    return memo('litter' + k + '_' + n, () => {
      const r = rng(k * 19 + 2), gb = new GB();
      const pal = [[1, 0.62, 0.2], [0.95, 0.82, 0.25], [0.85, 0.4, 0.16], [0.72, 0.8, 0.28], [0.9, 0.5, 0.3]];
      for (let i = 0; i < n; i++) {
        const a = r() * TWO, d = Math.sqrt(r()) * 0.6, cx = sin(a) * d, cz = cos(a) * d, y = 0.012 + i * 0.002, ya = r() * TWO, L = 0.1 + r() * 0.07, W = L * 0.55, c = pal[(r() * pal.length) | 0], sh = 0.8 + 0.2 * r();
        const s = sin(ya), co = cos(ya), p = (x, z) => [cx + x * co + z * s, y, cz - x * s + z * co];
        const t0 = gb.I.length / 3, cc = c.map(v => v * sh);
        gb.tri(p(0, -L), p(-W, 0), p(0, L), cc.map(v => v * 0.75), cc, cc); gb.tri(p(0, -L), p(0, L), p(W, 0), cc.map(v => v * 0.75), cc, cc.map(v => v * 0.9));
        gb._orient(t0, [0, 1, 0], null);
      }
      return gb.build();
    });
  }
  // saman balyası: yatan silindir (boy ~1, yarıçap 0.42) + iplik bantları
  function hay(k = 0) {
    return memo('hay' + k, () => {
      const r = rng(k * 23 + 4), gb = new GB(), R = 0.42, Lg = 0.95;
      gb.grid(12, 2, true, (u, v) => { const a = u * TWO, x = (v - 0.5) * Lg, rr = R * (v === 0 || v === 1 ? 0.97 : 1) * (1 + 0.04 * sin(a * 5 + k)), L = 0.8 + 0.2 * vn(a * 3, x * 6, k) + 0.1 * sin(x * 40 + a * 2); return [x, R + cos(a) * rr * 0.98, sin(a) * rr, 0.98 * L, 0.82 * L, 0.42 * L]; }, { hint: null });
      for (const e of [-1, 1]) gb.grid(12, 1, true, (u, v) => { const a = u * TWO, rr = R * 0.97 * (1 - v); const L = 0.65 + 0.35 * (0.5 + 0.5 * sin(rr * 40 + k)); return [e * Lg * 0.5, R + cos(a) * rr, sin(a) * rr, 0.95 * L, 0.75 * L, 0.4 * L]; }, { pt: true, hint: [e, 0, 0] });
      for (const x of [-0.26, 0.26]) gb.grid(12, 1, true, (u, v) => { const a = u * TWO, rr = R * 1.025; return [x + (v - 0.5) * 0.05, R + cos(a) * rr, sin(a) * rr, 0.5, 0.36, 0.2]; }, {});
      void r; return gb.build();
    });
  }
  // buğday sırası: n başak eğik, altın (uv.x=30 → rüzgârda sallanır). Birim: boy 1, 1.6 genişlik (x ekseni)
  function wheatRow(k = 0, n = 11) {
    return memo('wheat' + k + '_' + n, () => {
      const r = rng(k * 29 + 6), gb = new GB();
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1) - 0.5) * 1.6 + (r() - 0.5) * 0.06, z = (r() - 0.5) * 0.25, H = 0.85 + r() * 0.3, lean = (r() - 0.5) * 0.25, lz = (r() - 0.5) * 0.2, w = 0.018;
        const pts = [[x, 0, z], [x + lean * 0.4, H * 0.5, z + lz * 0.4], [x + lean, H, z + lz]];
        tube(gb, pts, s => w * (1 - 0.3 * s), 3, (s, q) => { const L = 0.55 + 0.4 * s; return [L * 0.8, L * 0.85, L * 0.4]; }, { sway: true });
        const hx = x + lean, hz = z + lz;   // başak: sivri damla + 2 yan çift
        gb.grid(5, 2, true, (u, v) => { const a = u * TWO, rr = 0.045 * Math.sin(Math.min(1, v + 0.15) * PI * 0.9) * (v === 0 ? 0.6 : 1); return [hx + sin(a) * rr + lean * 0.1 * v, H - 0.02 + v * 0.26, hz + cos(a) * rr, 1 - 0.15 * v * 0.5, 0.8 + 0.08 * (i % 3), 0.28, 30]; }, { pt: true });
      }
      return gb.build();
    });
  }
  // alan mesafe haritaları: yürünür hücrelerden kenara, kenardan dışarıya, yola
  function field(L) {
    const W = L.W, H = L.H, N = W * H, fl = new Uint8Array(N);
    for (let i = 0; i < N; i++) fl[i] = L.grid[i] ? 1 : 0;
    const chamfer = src => {
      const D = new Float32Array(N).fill(1e4); for (let i = 0; i < N; i++) if (src[i]) D[i] = 0;
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i; let d = D[k];
        if (i > 0) d = Math.min(d, D[k - 1] + 1); if (j > 0) { d = Math.min(d, D[k - W] + 1); if (i > 0) d = Math.min(d, D[k - W - 1] + 1.414); if (i < W - 1) d = Math.min(d, D[k - W + 1] + 1.414); } D[k] = d; }
      for (let j = H - 1; j >= 0; j--) for (let i = W - 1; i >= 0; i--) { const k = j * W + i; let d = D[k];
        if (i < W - 1) d = Math.min(d, D[k + 1] + 1); if (j < H - 1) { d = Math.min(d, D[k + W] + 1); if (i < W - 1) d = Math.min(d, D[k + W + 1] + 1.414); if (i > 0) d = Math.min(d, D[k + W - 1] + 1.414); } D[k] = d; }
      return D;
    };
    const inv = new Uint8Array(N); for (let i = 0; i < N; i++) inv[i] = fl[i] ? 0 : 1;
    const dOut = chamfer(fl), dIn = chamfer(inv), ps = new Uint8Array(N), Pt = L.path || [];
    const mark = (x, z) => { const i = Math.floor(x), j = Math.floor(z); if (i >= 0 && j >= 0 && i < W && j < H) ps[j * W + i] = 1; };
    for (let q = 0; q < Pt.length; q++) { mark(Pt[q].x, Pt[q].z); if (q) { const a = Pt[q - 1], b = Pt[q], n = Math.ceil(hyp(b.x - a.x, b.z - a.z) / 0.5); for (let s = 1; s < n; s++) mark(a.x + (b.x - a.x) * s / n, a.z + (b.z - a.z) * s / n); } }
    const dP = chamfer(ps), ix = (x, z) => { const i = Math.floor(x), j = Math.floor(z); return (i < 0 || j < 0 || i >= W || j >= H) ? -1 : j * W + i; };
    return { W, H, floor: fl, dp: (x, z) => { const k = ix(x, z); return k < 0 ? 99 : dP[k]; }, din: (x, z) => { const k = ix(x, z); return k < 0 ? 0 : dIn[k]; }, dout: (x, z) => { const k = ix(x, z); return k < 0 ? 99 : dOut[k]; } };
  }
  // yasak daireler: bölümün oyun nesneleri. pts: [{x,z,r}] ; fn(x,z,extra) → boş mu?
  function keepout(L, extra = []) {
    const a = extra.slice();
    const add = (o, r) => { if (o && Number.isFinite(o.x) && Number.isFinite(o.z)) a.push({ x: o.x, z: o.z, r }); };
    add(L.start, 3.2); add(L.exit, 4);
    for (const s of L.spawns || []) add(s, 1.8);
    for (const s of L.solids || []) add(s, (s.r || 0.8) + 0.9);
    for (const o of L.stations || []) add(o, 2.2);
    for (const rm of L.rooms || []) if (rm.kind === 'boss') add(rm, 0);
    return (x, z, m = 0) => { for (let i = 0; i < a.length; i++) if (hyp(a[i].x - x, a[i].z - z) < a[i].r + m) return false; return true; };
  }
  return { smallTree, placeSmall, stump, litter, hay, wheatRow, field, keepout, blob, bark };
})();
if (typeof window !== 'undefined') window.EKIT = EKIT;

// PERF: motorun birleşik dekor parçaları (20-60 bin üçgenlik) küçük hücrelere bölünür; kameranın görmediği kısım çizilmez.
// Kullanım: DEKOR_BOL(L, api, 14, 18000)  (meshler geç oluşursa birkaç saniye tekrar dener)
function DEKOR_BOL(L, api, CELL = 14, MIN = 18000) {
  if (/bolunmesiz/.test(location.search)) return;
  let bolundu = 0, sn = 0;
  const bol = () => {
    const THREE = api.THREE, lst = [];
    (L.group || scene).traverse(o => { if (o.isMesh && !o.isInstancedMesh && /^decor-(glow|decor|shinyNS|shiny)$/.test(o.name) && !o.userData._bol && o.geometry && o.geometry.attributes.position.count > MIN) lst.push(o); });
    for (const o of lst) {
      o.userData._bol = 1; bolundu++;
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry, names = Object.keys(g.attributes), pos = g.attributes.position, nT = pos.count / 3, bins = new Map();
      for (let t = 0; t < nT; t++) {
        const x = (pos.getX(t * 3) + pos.getX(t * 3 + 1) + pos.getX(t * 3 + 2)) / 3, z = (pos.getZ(t * 3) + pos.getZ(t * 3 + 1) + pos.getZ(t * 3 + 2)) / 3;
        const key = Math.floor((x + o.position.x) / CELL) * 1000 + Math.floor((z + o.position.z) / CELL); let b = bins.get(key); if (!b) bins.set(key, b = []); b.push(t);
      }
      for (const tl of bins.values()) {
        const ng = new THREE.BufferGeometry();
        for (const nm of names) { const at = g.attributes[nm], sz = at.itemSize, arr = new at.array.constructor(tl.length * 3 * sz); tl.forEach((t, q) => arr.set(at.array.subarray(t * 3 * sz, t * 3 * sz + 3 * sz), q * 3 * sz)); ng.setAttribute(nm, new THREE.BufferAttribute(arr, sz, at.normalized)); }
        ng.computeBoundingSphere();
        const m = new THREE.Mesh(ng, o.material); m.name = o.name; m.castShadow = o.castShadow; m.receiveShadow = o.receiveShadow; m.renderOrder = o.renderOrder; m.position.copy(o.position); m.rotation.copy(o.rotation); m.scale.copy(o.scale);
        o.parent.add(m);
      }
      o.parent.remove(o); o.visible = false;
    }
  };
  bol(); if (!bolundu) api.anim(() => { if (sn++ < 600 && !bolundu) bol(); });
}
