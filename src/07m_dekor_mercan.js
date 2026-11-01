/* ── MERCAN_DEKOR: Bölüm 2 (Mercan Krallığı) çevre süsleri (E234) ──
   06z_mercan.js kur() içinden çağrılır:  MERCAN_DEKOR.olustur(L, api, { avoid:[{x,z,r}], areaAt })
   Ekler (hepsi PROPKIT/EKIT üzerinden, api.put ile birleşir → ek çizim çağrısı yok):
   dallı geyik-boynuzu mercanları, masa mercanları, yelpaze mercanları (deniz yelpazesi), uzun salınan kelp şeritleri, deniz şakayıkları,
   beyin mercanı, boru süngerleri, tarak/deniz kabukları, amfora + kırık sütun (batık kalıntısı), kaya kemerleri, ışıklı sevimli denizanaları.
   Yol ve oyun nesneleri açık; yürünür alana yalnız alçak (≤0.9) süs girer; yüksekler yürünmez bölgede (kamerayı kapatanlar elenir). */
const MERCAN_DEKOR = (() => {
  'use strict';
  const P = PROPKIT, E = EKIT, { GB, tube, rng, vn, fbm, sstep, mix } = P;
  const PI = Math.PI, TAU = PI * 2, hyp = Math.hypot, sin = Math.sin, cos = Math.cos;
  P.ROCKPAL.mercan = { base: [0.62, 0.74, 0.7], dark: [0.26, 0.4, 0.4], moss: [0.95, 0.72, 0.6], moss2: [0.45, 0.85, 0.7] };
  const CACHE = {};
  const memo = (k, f) => CACHE[k] || (CACHE[k] = f());
  const CORAL = [0xff6f91, 0xff9a5a, 0xffc94a, 0x6fe0e8, 0xff7ab8, 0x7fe0a0, 0xff8a6a], PASTEL = [0xbff4ff, 0xffd0e0, 0xfff0b0, 0xc8ffe0, 0xffe0c8];
  const bulb = (gb, x, y, z, R, nu = 5, nv = 3, c = [1, 1, 1]) => gb.grid(nu, nv, true, (u, v) => { const a = u * TAU, el = (v - 0.5) * PI, L = 0.7 + 0.3 * sstep(-0.8, 0.9, sin(el)); return [x + cos(el) * sin(a) * R, y + sin(el) * R, z + cos(el) * cos(a) * R, c[0] * L, c[1] * L, c[2] * L]; }, { pb: true, pt: true });

  function staghorn(k = 0) {   // dallı mercan: boy ~1, genişlik ~0.8; { body, tips }
    return memo('stag' + k, () => {
      const r = rng(k * 91 + 3), body = new GB(), tips = new GB();
      const rec = (p, dir, len, R, depth) => {
        const q = [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + dir[2] * len], m = [(p[0] + q[0]) / 2 + (r() - 0.5) * 0.04, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2 + (r() - 0.5) * 0.04];
        tube(body, [p, m, q], s => R * (1 - 0.35 * s), 4, (s) => { const L = 0.5 + 0.17 * depth + 0.12 * s; return [L, L * 0.96, L * 0.95]; }, { rough: 0.15 });
        if (depth >= 2) { bulb(tips, q[0], q[1], q[2], R * 0.95, 5, 3, [1.15, 1.1, 1.0]); return; }
        const kids = 2 + (r() < 0.4 ? 1 : 0);
        for (let i = 0; i < kids; i++) { const a = r() * TAU + i * 2.1, sp = 0.5 + r() * 0.45; let d = [dir[0] + sin(a) * sp, dir[1] * 0.85 + 0.45, dir[2] + cos(a) * sp]; const l = hyp(...d); rec(q, d.map(x => x / l), len * (0.72 + 0.12 * r()), R * 0.66, depth + 1); }
      };
      for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + r(); rec([sin(a) * 0.05, -0.02, cos(a) * 0.05], [sin(a) * 0.25, 1, cos(a) * 0.25], 0.3 + r() * 0.08, 0.055, 0); }
      return { body: body.build(), tips: tips.build() };
    });
  }
  function tableCoral(k = 0) {   // masa mercanı: kısa gövde + dalgalı geniş disk; boy ~0.55, yarıçap ~0.55
    return memo('table' + k, () => {
      const r = rng(k * 17 + 5), gb = new GB(), ph = r() * 6;
      tube(gb, [[0, -0.03, 0], [0, 0.15, 0], [0, 0.28, 0]], s => 0.09 - 0.03 * s, 6, (s, q) => { const L = 0.5 + 0.1 * vn(q * 5, s * 4, k); return [L, L * 0.95, L * 0.9]; }, { rough: 0.2 });
      gb.grid(14, 3, true, (u, v) => {
        const a = u * TAU, rr = (0.15 + v * 0.42) * (1 + 0.12 * sin(a * 5 + ph) + 0.06 * sin(a * 11)), y = 0.3 + v * 0.1 + 0.025 * sin(a * 7 + v * 6) - v * v * 0.06;
        const rib = 0.82 + 0.18 * Math.abs(sin(a * 14)), L = (0.72 + 0.28 * v) * rib; return [sin(a) * rr, y, cos(a) * rr, L, L * 0.97, L * 0.92];
      }, { pt: true, hint: [0, 1, 0] });
      return gb.build();
    });
  }
  function seaFan(k = 0) {   // deniz yelpazesi: dolu, kaburgalı yelpaze yüzey (x-y düzlemi, iki yüzlü); boy ~1.2, genişlik ~1.1
    return memo('fan' + k, () => {
      const r = rng(k * 41 + 9), gb = new GB(), ph = r() * 6;
      tube(gb, [[0, -0.03, 0], [0, 0.16, 0], [0, 0.3, 0]], s => 0.05, 5, () => [0.55, 0.5, 0.45], { rough: 0.1, capEnd: true });
      for (const side of [1, -1]) gb.grid(20, 4, false, (u, v) => {
        const a = (u - 0.5) * 2.2, rr = (0.12 + 0.88 * v) * (1 + 0.08 * sin(a * 5 + ph)), rib = Math.abs(sin(u * 20 * PI * 0.5 * 1.0)) < 0.28 ? 1 : 0.7;
        const L = (0.62 + 0.38 * v) * (0.7 + 0.3 * rib) * (side > 0 ? 1 : 0.88);
        return [sin(a) * rr, 0.3 + cos(a) * rr * 0.98, side * 0.012 + 0.04 * sin(v * 5 + a), L, L * 0.97, L * 0.94];
      }, { hint: [0, 0, side] });
      return gb.build();
    });
  }
  function brain(k = 0) {   // beyin mercanı: yarım küre + kıvrımlı oluklar; yarıçap 0.5, boy ~0.4
    return memo('brain' + k, () => {
      const gb = new GB(), ph = k * 3.1;
      gb.grid(14, 7, true, (u, v) => {
        const a = u * TAU, el = v * PI * 0.5, dx = cos(el) * sin(a), dy = sin(el), dz = cos(el) * cos(a), g = Math.abs(sin((dx * 5 + vn(dx * 3 + ph, dy * 3, dz * 3) * 3 + dz * 2) * 3));
        const rr = 0.5 * (1 - 0.05 * g); const L = 0.65 + 0.35 * g * (0.5 + 0.5 * dy);
        return [dx * rr, dy * rr * 0.78 - 0.02, dz * rr, L, L * 0.97, L * 0.93];
      }, { pt: true });
      return gb.build();
    });
  }
  function tubes(k = 0) {   // boru mercanı/süngeri: 4-6 açık boru; { body, inner }
    return memo('tubes' + k, () => {
      const r = rng(k * 7 + 1), body = new GB(), inner = new GB(), n = 4 + ((r() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const a = i * 2.4, d = i ? 0.18 + r() * 0.1 : 0, x = sin(a) * d, z = cos(a) * d, h = 0.4 + r() * 0.5, R = 0.075 + r() * 0.04;
        tube(body, [[x, -0.02, z], [x + (r() - 0.5) * 0.04, h * 0.5, z], [x + (r() - 0.5) * 0.05, h, z + (r() - 0.5) * 0.03]], s => R * (1 + 0.15 * s), 7, (s, q) => { const L = 0.78 + 0.22 * s + 0.08 * Math.sin(q * 40); return [L, L * 0.94, L * 0.9]; }, { rough: 0.1 });
        bulb(inner, x, h + 0.005, z, R * 0.85, 7, 2, [0.28, 0.2, 0.2]);
      }
      return { body: body.build(), inner: inner.build() };
    });
  }
  function kelp(k = 0) {   // kelp şeridi: boy 1 (+z yüzü), dalgalı, uv.x=30 (rüzgâr/akıntı salınımı); ~16 üçgen
    return memo('kelp' + k, () => {
      const r = rng(k * 13 + 2), gb = new GB(), N = 8, ph = r() * 6, W = 0.07 + r() * 0.04, rows = [];
      for (let i = 0; i <= N; i++) {
        const s = i / N, w = W * (0.35 + 0.65 * sin(Math.min(1, s * 1.2 + 0.1) * PI * 0.8) + 0.2) * (1 - s * 0.55), cx = sin(s * 5 + ph) * 0.07 * s, cz = cos(s * 4 + ph) * 0.05 * s;
        const L = 0.4 + 0.6 * s, c = [L * 0.78, L, L * 0.5 + 0.3 * s * s];
        rows.push([gb.add(cx - w, s, cz, c[0] * 0.9, c[1] * 0.9, c[2], 30, s), gb.add(cx + w, s, cz, c[0], c[1], c[2] * 0.9, 30, s)]);
      }
      for (let i = 0; i < N; i++) { const a = rows[i], b = rows[i + 1]; gb.I.push(a[0], b[0], a[1], a[1], b[0], b[1], a[0], a[1], b[0], a[1], b[1], b[0]); }
      return gb.build();
    });
  }
  function anemone(k = 0) {   // deniz şakayığı: kısa gövde + dokunaçlar (salınır); boy ~0.55
    return memo('anem' + k, () => {
      const r = rng(k * 23 + 3), gb = new GB(), nt = 11;
      tube(gb, [[0, -0.02, 0], [0, 0.12, 0], [0, 0.22, 0]], s => 0.13 - 0.03 * s, 7, (s, q) => { const L = 0.6 + 0.2 * s; return [L, L * 0.85, L * 0.8]; }, { rough: 0.1 });
      for (let i = 0; i < nt; i++) {
        const a = i / nt * TAU + r() * 0.3, d = 0.03 + 0.05 * (i % 3), out = 0.12 + r() * 0.1, h = 0.32 + r() * 0.16;
        tube(gb, [[sin(a) * d, 0.22, cos(a) * d], [sin(a) * (d + out * 0.6), 0.22 + h * 0.5, cos(a) * (d + out * 0.6)], [sin(a) * (d + out * 1.3), 0.22 + h, cos(a) * (d + out * 1.3)]], s => 0.022 * (1 - 0.55 * s), 3, (s) => { const L = 0.75 + 0.35 * s * s; return [L, L * (0.92 + 0.1 * s), L * (0.9 + 0.2 * s)]; }, { sway: true });
      }
      return gb.build();
    });
  }
  function scallop(k = 0) {   // tarak kabuğu: yatık yarım disk, yivli; yarıçap ~0.3
    return memo('scal' + k, () => {
      const gb = new GB(), r = rng(k + 4);
      gb.grid(13, 2, false, (u, v) => {
        const a = (u - 0.5) * PI * 0.95, rr = 0.3 * (v === 0 ? 0.08 : 1), rib = 0.82 + 0.18 * Math.cos(a * 10), y = 0.04 + 0.1 * v * rib - 0.05 * v * v;
        const L = (0.78 + 0.22 * rib) * (0.6 + 0.4 * v); return [sin(a) * rr, y, cos(a) * rr * 1.0 - 0.02, L, L * 0.96, L * 0.92];
      }, { hint: [0, 1, 0.2] });
      void r; return gb.build();
    });
  }
  function amphora(k = 0) {   // amfora: boy 0.7, yarıçap 0.22; yosunlu
    return memo('amph' + k, () => {
      const gb = new GB(), prof = [[0.05, 0], [0.14, 0.04], [0.22, 0.22], [0.2, 0.42], [0.1, 0.56], [0.09, 0.64], [0.14, 0.7]];
      gb.grid(10, 6, true, (u, v) => {
        const a = u * TAU, f = v * 6, i = Math.min(5, Math.floor(f)), t = f - i, rr = mix(prof[i][0], prof[i + 1][0], t), y = mix(prof[i][1], prof[i + 1][1], t);
        const alg = 1 - sstep(0, 0.45, y + 0.12 * vn(a * 2, y * 5, k)); const L = 0.8 + 0.2 * vn(a * 3, y * 8, k);
        return [sin(a) * rr, y, cos(a) * rr, mix(0.88, 0.35, alg) * L, mix(0.5, 0.62, alg) * L, mix(0.36, 0.3, alg) * L];
      }, { pb: true, pt: true });
      for (const sd of [-1, 1]) tube(gb, [[sd * 0.1, 0.62, 0], [sd * 0.24, 0.55, 0], [sd * 0.21, 0.4, 0]], s => 0.03, 4, () => [0.8, 0.46, 0.33], {});
      return gb.build();
    });
  }
  function column(k = 0) {   // kırık sütun: boy ~1.2, yarıçap 0.24, eğik kırık tepe, yosunlu
    return memo('col' + k, () => {
      const gb = new GB();
      gb.grid(9, 5, true, (u, v) => { const a = u * TAU, y = v * 1.2 - 0.05, top = 1.2 - 0.25 * (0.5 + 0.5 * sin(a + k)), yy = Math.min(y, top + (v === 1 ? 0 : 0)), rr = 0.24 * (1 + 0.08 * Math.abs(sin(a * 4))) * (1 + 0.1 * Math.exp(-v * 8)), alg = 1 - sstep(0, 0.6, yy), L = 0.78 + 0.22 * vn(a * 3, y * 4, k); return [sin(a) * rr, yy, cos(a) * rr, mix(0.85, 0.35, alg) * L, mix(0.82, 0.7, alg) * L, mix(0.74, 0.38, alg) * L]; }, { pb: true, pt: true });
      return gb.build();
    });
  }
  function jelly(k = 0) {   // sevimli denizanası: ışıklı çan + salınan dokunaçlar; boy ~1; { bell, legs }
    return memo('jelly' + k, () => {
      const r = rng(k * 5 + 1), bell = new GB(), legs = new GB();
      bell.grid(12, 5, true, (u, v) => { const a = u * TAU, el = v * PI * 0.5, rr = 0.3 * cos(el) * (1 + 0.05 * sin(a * 6)), y = 0.5 + 0.28 * sin(el), L = 0.7 + 0.3 * (v) + (v === 0 ? 0.2 : 0); return [sin(a) * rr, y - (v === 0 ? 0.03 : 0), cos(a) * rr, L, L, L]; }, { pt: true });
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, d = 0.16, len = 0.35 + r() * 0.3; tube(legs, [[sin(a) * d, 0.5, cos(a) * d], [sin(a) * d * 1.1, 0.5 - len * 0.5, cos(a) * d * 1.1], [sin(a) * d * 0.8, 0.5 - len, cos(a) * d * 0.8]], s => 0.014 * (1 - 0.5 * s), 3, (s) => { const L = 1 - 0.3 * s; return [L, L, L]; }, { sway: true }); }
      return { bell: bell.build(), legs: legs.build() };
    });
  }

  function olustur(L, api, ctx = {}) {
    const rnd = api.rnd, put = api.put, pick = a => a[(rnd() * a.length) | 0], areaAt = ctx.areaAt || (() => 1);
    const F = E.field(L), free = E.keepout(L, ctx.avoid || []);
    const st = { stag: 0, table: 0, fan: 0, kelp: 0, anem: 0, brain: 0, tubes: 0, jelly: 0, arch: 0, ruin: 0, shell: 0 };
    const ok = (x, z, r = 0.5) => api.isFloor(x, z) && api.circleFree(x, z, r) && free(x, z, r);
    const hides = (x, z, h) => { for (let t = 1.2; t < h * 0.8; t += 1.2) for (const o of [-1, -0.5, 0, 0.5, 1]) if (F.floor[Math.floor(z - t) * F.W + Math.floor(x + o * (1.5 + t * 0.7))]) return true; return false; };
    // renk takımları (mor yok)
    const AREAS = [
      { coral: [0xff9a7a, 0xffc94a, 0x6fe0e8, 0xff7ab8], kelpc: [0xffffff, 0xd8ffc0] },
      { coral: [0xff6f91, 0xff9a5a, 0xffc94a, 0x6fe0e8, 0x7fe0a0, 0xff7ab8], kelpc: [0xffffff] },
      { coral: [0x7fe0a0, 0x6fe0e8, 0xffc94a, 0xff9a7a], kelpc: [0xffffff, 0xc8f0a0, 0xe8ffc0] },
      { coral: [0xbff4ff, 0xffd0e0, 0x6fe0e8, 0xfff0d0], kelpc: [0xd8fff0] },
      { coral: [0xbff4ff, 0xffd0e0, 0xfff0b0], kelpc: [0xd8fff0] },
    ];
    const pal = (x, z) => AREAS[Math.min(4, areaAt(L, x, z))];
    const stagAt = (x, z, h, c, yaw) => { const s = P.__noop, g = staghorn((rnd() * 4) | 0); put(g.body, x, 0, z, h, h, h, c, yaw ?? rnd() * TAU, 0, 0, 'shinyNS'); put(g.tips, x, 0, z, h, h, h, c, 0, 0, 0, 'glow'); st.stag++; void s; };
    const tableAt = (x, z, h, c) => { put(tableCoral((rnd() * 3) | 0), x, 0, z, h, h, h, c, rnd() * TAU, 0, 0, 'shinyNS'); st.table++; };
    const fanAt = (x, z, h, c, yaw) => { put(seaFan((rnd() * 3) | 0), x, 0, z, h, h, h, c, yaw ?? rnd() * TAU, 0, 0, 'shinyNS'); st.fan++; };
    const brainAt = (x, z, h, c) => { put(brain((rnd() * 3) | 0), x, 0, z, h, h, h, c, rnd() * TAU, 0, 0, 'shinyNS'); st.brain++; };
    const tubesAt = (x, z, h, c) => { const g = tubes((rnd() * 3) | 0); put(g.body, x, 0, z, h, h, h, c, rnd() * TAU, 0, 0, 'shinyNS'); put(g.inner, x, 0, z, h, h, h, 0xffffff, 0, 0, 0, 'shinyNS'); st.tubes++; };
    const kelpAt = (x, z, h, c, yaw) => { put(kelp((rnd() * 4) | 0), x, 0, z, h * 0.9, h, h * 0.9, c, yaw ?? rnd() * TAU, 0, 0, 'decor'); st.kelp++; };
    const anemAt = (x, z, h, c) => { put(anemone((rnd() * 3) | 0), x, 0, z, h, h, h, c, rnd() * TAU, 0, 0, 'decor'); st.anem++; };
    const shellAt = (x, z, h) => { put(scallop((rnd() * 3) | 0), x, 0, z, h, h, h, pick([0xffd8e6, 0xffe6c8, 0xfff4f0, 0xffc8b0]), rnd() * TAU, (rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.3, 'shinyNS'); st.shell++; };
    const stoneAt = (x, z, s) => put(P.rock((rnd() * 5) | 0, 'mercan', s > 0.6 ? 0 : 1), x, 0, z, s * 1.1, s * 0.95, s * 1.1, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS');
    const ruinAt = (x, z, s) => { const a = amphora((rnd() * 2) | 0); put(a, x, 0, z, s, s, s, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS'); put(a, x + 0.45 * s, 0.1, z + 0.2 * s, s * 0.8, s * 0.8, s * 0.8, 0xffffff, rnd() * TAU, 1.35, 0.3, 'shinyNS'); st.ruin++; };
    const jellyAt = (x, y, z, s) => { const j = jelly((rnd() * 3) | 0), c = pick(PASTEL); put(j.bell, x, y, z, s, s, s, c, rnd() * TAU, (rnd() - 0.5) * 0.2, 0, 'glow'); put(j.legs, x, y, z, s, s, s, c, 0, 0, 0, 'decor'); st.jelly++; };
    const around = (x, z, rmax, n, fn) => { for (let i = 0; i < n; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * rmax, px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d; if (ok(px, pz, 0.25)) fn(px, pz, i); } };

    // ── yürünmez bölge: resif katmanları (kenardan 2.4 m dışa → 16 m) ──
    for (let j = 0; j < F.H; j++) for (let i = 0; i < F.W; i++) {
      if (F.floor[j * F.W + i]) continue;
      const x = i + 0.5, z = j + 0.5, d = F.dout(x, z);
      if (d < 2.4 || d > 17) continue;
      const A = pal(x, z), arena = areaAt(L, x, z) === 4, r0 = rnd(), px = x + (rnd() - 0.5) * 0.9, pz = z + (rnd() - 0.5) * 0.9, c = pick(A.coral);
      if (d < 7) {
        if (rnd() > 0.2) continue;
        const h = 1.1 + rnd() * 1.3, hh = h * 1.3; if (hides(px, pz, hh)) continue;
        if (r0 < 0.28) stagAt(px, pz, h * 1.4, c); else if (r0 < 0.42) tableAt(px, pz, h * 1.6, c); else if (r0 < 0.58) fanAt(px, pz, h * 1.6, c, Math.atan2(F.dout(px, pz - 1) - F.dout(px, pz + 1), 1) * 0 + (rnd() * 0.8 - 0.4)); else if (r0 < 0.7) kelpAt(px, pz, 2.8 + rnd() * 2.6, pick(A.kelpc)); else if (r0 < 0.82) brainAt(px, pz, h * 1.5, c); else if (r0 < 0.92) tubesAt(px, pz, h * 1.7, c); else stoneAt(px, pz, h * 1.1);
      } else {
        if (rnd() > 0.085) continue;
        const h = 3 + rnd() * 3; if (hides(px, pz, h * 1.2)) continue;
        if (r0 < 0.45) kelpAt(px, pz, 5 + rnd() * 4, pick(A.kelpc)); else if (r0 < 0.7) stagAt(px, pz, h, c); else if (r0 < 0.85) tableAt(px, pz, h * 1.1, c); else if (r0 < 0.95) fanAt(px, pz, h * 0.9, c); else stoneAt(px, pz, h * 0.8);
      }
      // denizanası: bazı yerlerde havada
      if (d > 3.5 && d < 12 && !arena && rnd() < 0.02) jellyAt(px + 1, 2 + rnd() * 3, pz - 1, 0.9 + rnd() * 0.8);
    }
    // kaya kemerleri (set parçası): yürünmez yerde 3 adet
    for (let t = 0, got = 0; t < 400 && got < 4; t++) {
      const x = 1 + rnd() * (L.W - 2), z = 1 + rnd() * (L.H - 2); if (api.isFloor(x, z)) continue;
      const d = F.dout(x, z); if (d < 4 || d > 10 || hides(x, z, 7)) continue;
      const yaw = rnd() * TAU, ca = Math.cos(yaw), sa = -Math.sin(yaw), s = 1.6 + rnd() * 0.8;
      for (const sd of [-1, 1]) { stoneAt(x + ca * sd * s * 1.3, z + sa * sd * s * 1.3, s * 0.8); put(P.rock((rnd() * 5) | 0, 'mercan', 1), x + ca * sd * s * 1.2, s * 1.1, z + sa * sd * s * 1.2, s * 0.75, s * 0.8, s * 0.75, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS'); }
      for (let q = 0; q < 4; q++) { const tt = (q - 1.5) / 1.5, px = x + ca * tt * s * 1.1, pz = z + sa * tt * s * 1.1; put(P.rock((rnd() * 5) | 0, 'mercan', 1), px, s * (1.9 - tt * tt * 0.5), pz, s * 0.62, s * 0.48, s * 0.62, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS'); }
      stagAt(x + ca * s * 1.3, z + sa * s * 1.3 + 1, s * 0.9, pick(AREAS[1].coral)); got++; st.arch++;
    }
    // ── yürünür alan: küçük mercan bahçeleri (alçak) ──
    const centers = [], nCl = Math.round(L.W * L.H / 50);
    const kinds = ['garden', 'fans', 'kelp', 'shells', 'ruins', 'rocks', 'garden', 'anem', 'kelp', 'garden', 'fans', 'anem'];
    for (let t = 0, made = 0; t < nCl * 20 && made < nCl; t++) {
      const x = 1 + rnd() * (L.W - 2), z = 1 + rnd() * (L.H - 2);
      if (!api.isFloor(x, z)) continue;
      const dp = F.dp(x, z), din = F.din(x, z);
      if (dp < 2.4 && rnd() < 0.9) continue;
      if (!ok(x, z, 1.1) || areaAt(L, x, z) === 4) continue;
      if (centers.some(c => hyp(c.x - x, c.z - z) < 3.4)) continue;
      const kind = pick(kinds), A = pal(x, z), c = pick(A.coral); centers.push({ x, z, kind }); made++;
      switch (kind) {
        case 'garden': tubesAt(x, z, 0.8 + rnd() * 0.4, c); around(x, z, 1.5, 1, (px, pz) => brainAt(px, pz, 0.8 + rnd() * 0.4, pick(A.coral))); around(x, z, 1.7, 2, (px, pz) => anemAt(px, pz, 0.9, pick(A.coral))); around(x, z, 1.7, 3, (px, pz) => kelpAt(px, pz, 0.9 + rnd() * 0.5, pick(A.kelpc))); if (rnd() < 0.5) tableAt(x + 1.0, z - 0.8, 0.8, pick(A.coral)); break;
        case 'fans': fanAt(x, z, 0.8 + rnd() * 0.4, c, rnd() * 0.6 - 0.3); around(x, z, 1.6, 2, (px, pz) => fanAt(px, pz, 0.6 + rnd() * 0.3, pick(A.coral), rnd() * 0.8 - 0.4)); around(x, z, 1.8, 3, (px, pz) => shellAt(px, pz, 0.8)); break;
        case 'kelp': around(x, z, 1.6, 6, (px, pz) => kelpAt(px, pz, 0.9 + rnd() * 0.9, pick(A.kelpc))); around(x, z, 1.8, 2, (px, pz) => stoneAt(px, pz, 0.35)); break;
        case 'shells': around(x, z, 1.5, 4, (px, pz) => shellAt(px, pz, 0.9 + rnd() * 0.5)); around(x, z, 1.6, 1, (px, pz) => brainAt(px, pz, 0.6, c)); break;
        case 'ruins': ruinAt(x, z, 1.1 + rnd() * 0.3); put(column((rnd() * 2) | 0), x - 1.1, 0, z + 0.3, 0.9, 0.8, 0.9, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS'); api.solid(x - 1.1, z + 0.3, 0.25, 'sutun'); around(x, z, 1.8, 3, (px, pz) => kelpAt(px, pz, 0.9, pick(A.kelpc))); st.ruin++; break;
        case 'anem': for (let q = 0; q < 3; q++) around(x, z, 1.3, 1, (px, pz) => anemAt(px, pz, 0.8 + rnd() * 0.5, pick(A.coral))); around(x, z, 1.8, 2, (px, pz) => shellAt(px, pz, 0.8)); break;
        default: stoneAt(x, z, 0.6 + rnd() * 0.6); around(x, z, 1.6, 2, (px, pz) => stoneAt(px, pz, 0.25 + rnd() * 0.2)); around(x, z, 1.8, 3, (px, pz) => kelpAt(px, pz, 0.9, pick(A.kelpc)));
      }
    }
    // ── yol kenarı: kabuk + kelp serpintisi ──
    const Pt = L.path || [];
    for (let q = 4; q < Pt.length - 3; q += 2) {
      const a = Pt[q - 2], b = Pt[q + 2], dx = b.x - a.x, dz = b.z - a.z, dl = hyp(dx, dz) || 1, nx = -dz / dl, nz = dx / dl;
      for (const sg of [1, -1]) { const d = 1.8 + rnd() * 1.2, x = Pt[q].x + nx * d * sg, z = Pt[q].z + nz * d * sg; if (rnd() < 0.4 && ok(x, z, 0.2)) { if (rnd() < 0.5) shellAt(x, z, 0.8 + rnd() * 0.4); else kelpAt(x, z, 0.7 + rnd() * 0.6, pick(pal(x, z).kelpc)); } }
    }
    centers.forEach((c, i) => { if (i % 3 === 0) api.glow(c.x, c.z, 3, pick(PASTEL), 0.07); });
    if (typeof window !== 'undefined') window.__E234 = { st, centers };
    return st;
  }
  return { olustur };
})();
