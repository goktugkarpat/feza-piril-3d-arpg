/* ── DEGIRMEN_DEKOR: Bölüm 4 (Altın Değirmen Vadisi) çevre süsleri (E234) ──
   06z_degirmen.js kur() içinden çağrılır:  DEGIRMEN_DEKOR.olustur(L, api, { avoid:[{x,z,r}] })
   Ekler: altın buğday sıraları, saman balyası yığınları, korkuluk (korkuluk bahçesi), fıçı/çuval/sandık köşeleri, çiçek şeritleri,
   çit koşuları, elma bahçesi ağaçları (dış halka), uzak yel değirmeni siluetleri, kaya grupları, saman yığını, dolu ışık havuzları.
   Yol ve oyun nesneleri açık kalır; yürünür alana yalnız alçak (<0.8) süs girer. api.put birleştirir: çizim çağrısı eklemez. */
const DEGIRMEN_DEKOR = (() => {
  'use strict';
  const P = PROPKIT, E = EKIT, { GB, tube, rng, vn, sstep, mix } = P;
  const PI = Math.PI, TAU = PI * 2, hyp = Math.hypot, sin = Math.sin, cos = Math.cos;
  P.ROCKPAL.degirmen = { base: [0.74, 0.68, 0.56], dark: [0.38, 0.32, 0.26], moss: [0.62, 0.66, 0.3], moss2: [0.74, 0.74, 0.34] };
  const CACHE = {};
  const memo = (k, f) => CACHE[k] || (CACHE[k] = f());
  const WOODC = (s, q, k, b = [0.6, 0.4, 0.24]) => { const L = 0.7 + 0.3 * vn(q * 7 + k, s * 9, k); return [b[0] * L, b[1] * L, b[2] * L]; };

  function scarecrow(k = 0) {   // boy ~1.9: direk, kol çubuğu, gömlek, çuval baş, hasır şapka; { wood, cloth, head, hat }
    return memo('scare' + k, () => {
      const wood = new GB(), cloth = new GB(), head = new GB(), hat = new GB(), r = rng(k * 5 + 1);
      tube(wood, [[0, -0.04, 0], [0.01, 0.9, 0], [0, 1.65, 0.01]], s => 0.04 - 0.01 * s, 5, (s, q) => WOODC(s, q, k), { rough: 0.2, capEnd: true });
      tube(wood, [[-0.62, 1.22, 0], [0, 1.25, 0], [0.62, 1.22, 0]], s => 0.032, 5, (s, q) => WOODC(s, q, k + 3), { rough: 0.15, capEnd: true });
      E.blob(cloth, 0, 1.0, 0, 0.23, 1.35, k + 11, 0, 9, 6);
      for (const sd of [-1, 1]) E.blob(cloth, sd * 0.38, 1.23, 0, 0.12, 0.9, k + 20 + sd, 0, 7, 4);
      E.blob(head, 0, 1.68, 0, 0.17, 1.0, k + 31, 0, 9, 6);
      for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; head.grid(5, 1, true, (u, v) => { const a = u * TAU; return [s * 0.07 + sin(a) * 0.026, 1.7 + cos(a) * 0.026, 0.155 + v * 0.01, 0.08, 0.06, 0.05]; }, { pt: true, hint: [0, 0, 1] }); }
      hat.grid(12, 2, true, (u, v) => { const a = u * TAU, rr = v === 0 ? 0.36 : 0.15, y = v === 0 ? 1.8 : 1.86; const L = 0.78 + 0.22 * vn(a * 3, v, k); return [sin(a) * rr, y + (v === 0 ? 0 : 0.02), cos(a) * rr, L, L * 0.85, L * 0.5]; }, { pt: true });
      hat.grid(10, 2, true, (u, v) => { const a = u * TAU, rr = 0.15 * (1 - v * 0.55), y = 1.86 + v * 0.18; const L = 0.9; return [sin(a) * rr, y, cos(a) * rr, L, L * 0.8, L * 0.45]; }, { pt: true });
      void r; return { wood: wood.build(), cloth: cloth.build(), head: head.build(), hat: hat.build() };
    });
  }
  function barrel(k = 0) {   // fıçı: boy 0.8, yarıçap 0.34
    return memo('barrel' + k, () => {
      const gb = new GB(), r = rng(k + 2);
      gb.grid(10, 6, true, (u, v) => {
        const a = u * TAU, bulge = 1 + 0.12 * sin(v * PI), band = (Math.abs(v - 0.15) < 0.05 || Math.abs(v - 0.85) < 0.05 || Math.abs(v - 0.5) < 0.04), rr = 0.3 * bulge * (band ? 1.04 : 1);
        const L = (band ? 0.42 : 0.72 + 0.28 * Math.abs(sin(a * 5))) * (0.9 + 0.1 * r());
        return [sin(a) * rr, 0.02 + v * 0.78, cos(a) * rr, band ? 0.5 : 0.78 * L, band ? 0.5 : 0.52 * L, band ? 0.5 : 0.3 * L];
      }, {});
      gb.grid(10, 1, true, (u, v) => { const a = u * TAU, rr = 0.285 * (1 - v); return [sin(a) * rr, 0.8, cos(a) * rr, 0.85 - 0.2 * v, 0.62 - 0.15 * v, 0.38]; }, { pt: true, hint: [0, 1, 0] });
      return gb.build();
    });
  }
  function haystack(k = 0) {   // konik saman yığını: boy 1.3, yarıçap 0.75
    return memo('hstack' + k, () => {
      const gb = new GB();
      gb.grid(11, 4, true, (u, v) => { const a = u * TAU, rr = 0.75 * Math.pow(1 - v, 0.7) * (1 + 0.05 * sin(a * 4 + k)), L = 0.7 + 0.3 * v + 0.12 * (vn(a * 4, v * 8, k) - 0.5); return [sin(a) * rr, 0.0 + v * 1.25 + 0.08 * sin(a * 3) * (1 - v), cos(a) * rr, 0.98 * L, 0.82 * L, 0.42 * L]; }, { pt: true });
      return gb.build();
    });
  }
  function windmillFar() {   // uzak yel değirmeni siluet: boy 1 (kule 0.62 + çatı + 4 kanat); { body, roof, sails }
    return memo('wfar', () => {
      const body = new GB(), roof = new GB(), sails = new GB();
      body.grid(8, 3, true, (u, v) => { const a = u * TAU, rr = 0.2 - v * 0.07, L = 0.92 + 0.08 * vn(a * 3, v * 5, 1) - (v < 0.1 ? 0.15 : 0); return [sin(a) * rr, v * 0.6, cos(a) * rr, 0.96 * L, 0.9 * L, 0.78 * L]; }, {});
      roof.grid(8, 2, true, (u, v) => { const a = u * TAU, rr = v === 0 ? 0.25 : 0.14; return [sin(a) * rr, 0.58 + (v === 0 ? 0 : 0.08), cos(a) * rr, 0.75, 0.38, 0.22]; }, { pt: true });
      const cx = 0, cy = 0.66, cz = 0.2;
      for (let i = 0; i < 4; i++) {
        const a = i * PI / 2 + 0.3, dx = sin(a), dy = cos(a), L = 0.5, w = 0.1;
        const p = (t, o) => [cx + dx * t + dy * o, cy + dy * t - dx * o, cz + 0.02];
        const t0 = sails.I.length / 3; sails.quad(p(0.06, -w * 0.3), p(L, -w), p(L, w), p(0.06, w * 0.3), [0.95, 0.9, 0.8]); sails.quad(p(0.06, w * 0.3), p(L, w), p(L, -w), p(0.06, -w * 0.3), [0.8, 0.74, 0.62]);
        void t0;
      }
      return { body: body.build(), roof: roof.build(), sails: sails.build() };
    });
  }

  function olustur(L, api, ctx = {}) {
    const rnd = api.rnd, put = api.put, pick = a => a[(rnd() * a.length) | 0];
    const F = E.field(L), free = E.keepout(L, ctx.avoid || []);
    const st = { tree: 0, wind: 0, hay: 0, scare: 0, wheat: 0, barrel: 0, flo: 0, fence: 0 };
    const ok = (x, z, r = 0.5) => api.isFloor(x, z) && api.circleFree(x, z, r) && free(x, z, r);
    // kameranın önü: kuzeyinde (h/1,1 + 6) m içinde yürünür alan varsa konmaz — dikey iPad'de ekranın altı ~6,5 m güneye
    // kadar görünür; eski sınır (0,8·h) dev ağaç taçlarını alt yarıya, 8 m'lik kavakları Feza'nın önüne koyuyordu (QA)
    const hides = (x, z, h) => { for (let t = 1.2; t < h / 1.1 + 6; t += 1.2) for (const o of [-1, -0.5, 0, 0.5, 1]) if (F.floor[Math.floor(z - t) * F.W + Math.floor(x + o * (1.5 + t * 0.7))]) return true; return false; };
    const GOLD = [0xffffff, 0xfff0c8, 0xf4dc9a, 0xffe4a0], APPLE = [0x9cc45a, 0x8ab84e, 0xa8c860], WHEATT = [0xffffff, 0xffe9ae, 0xf6d884];
    // ── dış halka: elma bahçesi ağaçları, kavaklar, uzak yel değirmenleri ──
    let wm = 0;
    for (let j = 0; j < F.H; j++) for (let i = 0; i < F.W; i++) {
      if (F.floor[j * F.W + i]) continue;
      const x = i + 0.5, z = j + 0.5, d = F.dout(x, z), r0 = rnd();
      const px = x + (rnd() - 0.5) * 0.9, pz = z + (rnd() - 0.5) * 0.9, yaw = rnd() * TAU, k = (rnd() * 4) | 0;
      if (d >= 3.4 && d < 7 && rnd() < 0.045) {
        const h = 3.4 + rnd() * 2.6; if (hides(px, pz, r0 < 0.6 ? h : r0 < 0.8 ? h * 1.5 : h * 1.1)) continue;   // (gerçek boy: kavak 1,5·h)
        if (r0 < 0.6) E.placeSmall(api, 'apple', k, px, pz, h, { yaw, leaf: pick(APPLE), fruit: pick([0xe8503a, 0xf0a030, 0xe8503a]) });
        else if (r0 < 0.8) E.placeSmall(api, 'poplar', k, px, pz, h * 1.5, { yaw, leaf: pick([0x9cbc50, 0xb8c85a]) });
        else E.placeSmall(api, 'round', k, px, pz, h * 1.1, { yaw, leaf: pick(APPLE) });
        st.tree++;
      } else if (d >= 7 && d < 14 && rnd() < 0.03) {
        const h = 6 + rnd() * 3; if (hides(px, pz, h)) continue;
        E.placeSmall(api, r0 < 0.5 ? 'round' : 'poplar', k, px, pz, h, { yaw, leaf: pick([0x8aae58, 0x9cbc62, 0x7aa050]), wood: 0xc0b098 }); st.tree++;
      } else if (d >= 12 && d < 30 && wm < 7 && rnd() < 0.012) {
        const h = 8 + rnd() * 3; if (hides(px, pz, h)) continue;
        const w = windmillFar(), a2 = rnd() * 0.5 - 0.25;
        put(w.body, px, 0, pz, h, h, h, 0xf2e6cc, a2, 0, 0, 'shinyNS'); put(w.roof, px, 0, pz, h, h, h, 0xc2693a, a2, 0, 0, 'shinyNS'); put(w.sails, px, 0, pz, h, h, h, 0xfff2d8, a2, 0, 0, 'shinyNS'); wm++; st.wind++;
      }
    }
    // ── yürünür alan: küme süsleri ──
    const centers = [];
    const nCl = Math.round(L.W * L.H / 48);
    const kinds = ['wheat', 'hay', 'wheat', 'scare', 'flowers', 'barrels', 'fence', 'rocks', 'wheat', 'stack', 'flowers', 'hay'];
    function around(x, z, rmax, n, fn) { for (let i = 0; i < n; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * rmax, px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d; if (ok(px, pz, 0.25)) fn(px, pz, i); } }
    const tuftAt = (x, z, s) => put(P.tuft((rnd() * 6) | 0), x, 0, z, s, s * (0.9 + rnd() * 0.7), s, pick([0xe0c060, 0xd4b050, 0xc8c060, 0xe8d070]), rnd() * TAU, 0, 0, 'decor');
    const flowerAt = (x, z, s) => put(P.flower((rnd() * 5) | 0), x, 0, z, s, s, s, 0xffffff, rnd() * TAU, 0, 0, 'decor');
    const wheatRowAt = (x, z, yaw, s = 1) => { put(E.wheatRow((rnd() * 3) | 0), x, 0, z, s * (0.9 + rnd() * 0.2), s * (0.9 + rnd() * 0.3), s, pick(WHEATT), yaw, 0, 0, 'decor'); st.wheat++; };
    const hayAt = (x, z, s, yaw) => { put(E.hay((rnd() * 3) | 0), x, 0, z, s, s, s, pick([0xffffff, 0xf4e4b0, 0xe8d090]), yaw ?? rnd() * TAU, 0, 0, 'shinyNS'); st.hay++; };
    const barrelAt = (x, z, s) => { put(barrel((rnd() * 2) | 0), x, 0, z, s, s, s, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS'); st.barrel++; };
    const sackAt = (x, z, s) => { put(api.G ? api.G.sphere(8, 6) : api.tmp(new THREE.SphereGeometry(1, 8, 6)), x, s * 0.34, z, s * 0.36, s * 0.42, s * 0.32, pick([0xefe2c4, 0xe8d8b0, 0xf4ecd4]), rnd() * TAU, 0, 0, 'shinyNS'); };
    const stoneAt = (x, z, s) => put(P.rock((rnd() * 5) | 0, 'degirmen', s > 0.6 ? 0 : 1), x, 0, z, s * 1.1, s * 0.95, s * 1.1, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS');
    function cluster(kind, x, z, dp, din) {
      const yaw = rnd() * TAU, ca = Math.cos(yaw), sa = -Math.sin(yaw);
      switch (kind) {
        case 'wheat': {   // 3-5 sıra altın başak (tarla şeridi), aralarında ot
          const n = 3 + ((rnd() * 3) | 0); for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 0.62, px = x - sa * o, pz = z + ca * o; if (ok(px, pz, 0.3)) wheatRowAt(px, pz, yaw, 1.15); if (ok(px + ca * 1.5, pz + sa * 1.5, 0.3)) wheatRowAt(px + ca * 1.5, pz + sa * 1.5, yaw, 1.1); }
          break;
        }
        // (yürünür alanda engel yok — Feza içinden geçer: balya alçak (~0,85 m), üst üste balya yok; QA: 1,4-2,2 m'lik balya yığınının içinden yürüyordu)
        case 'hay': { const s = 0.9 + rnd() * 0.2; hayAt(x, z, s, yaw); if (ok(x + ca * 1.1, z + sa * 1.1, 0.5)) hayAt(x + ca * 1.1, z + sa * 1.1, s * 0.95, yaw + 0.1); around(x, z, 2, 4, (px, pz) => tuftAt(px, pz, 1.2)); break; }
        case 'stack': {   // konik saman yığını (1,2 m): yalnız yoldan uzakta, kendi engeliyle (içinden geçilmez)
          if (dp < 3.5 || !ok(x, z, 1.6)) break;
          const s = 0.85 + rnd() * 0.25; put(haystack((rnd() * 2) | 0), x, 0, z, s, s, s, pick([0xffffff, 0xf4e4b0]), yaw, 0, 0, 'shinyNS'); api.solid(x, z, 0.62 * s, 'scare'); st.hay++; around(x, z, 1.8, 4, (px, pz) => tuftAt(px, pz, 1.1)); break; }
        case 'scare': {   // korkuluk bahçesi: korkuluk + etrafında buğday + karga yok (korkuluk huysuz değil)
          const sc = scarecrow((rnd() * 2) | 0), s = 1.0 + rnd() * 0.2;
          put(sc.wood, x, 0, z, s, s, s, 0xffffff, yaw, 0, 0, 'shinyNS'); put(sc.cloth, x, 0, z, s, s, s, pick([0x4a78c8, 0xc8503a, 0x3a9a6a, 0xd89a2a]), yaw, 0, 0, 'shinyNS');
          put(sc.head, x, 0, z, s, s, s, 0xe8d29a, yaw, 0, 0, 'shinyNS'); put(sc.hat, x, 0, z, s, s, s, 0xffe08a, yaw, 0, 0, 'shinyNS'); api.solid(x, z, 0.3, 'scare'); st.scare++;
          for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rnd() * 0.3, d = 1.3 + rnd() * 0.5, px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d; if (ok(px, pz, 0.3)) wheatRowAt(px, pz, a + PI / 2, 0.9); }
          break;
        }
        case 'flowers': { const n = 8 + ((rnd() * 6) | 0); const dx = ca * 0.45, dz = sa * 0.45; for (let i = 0; i < n; i++) { const t = (i - n / 2) * 0.45, px = x + dx * t * 2 + (rnd() - 0.5) * 0.4, pz = z + dz * t * 2 + (rnd() - 0.5) * 0.4; if (ok(px, pz, 0.15)) { flowerAt(px, pz, 1 + rnd() * 0.7); if (rnd() < 0.5) tuftAt(px + 0.2, pz, 1); } } st.flo += n; break; }
        case 'barrels': { barrelAt(x, z, 1.1); if (ok(x + 0.8, z + 0.2, 0.4)) barrelAt(x + 0.8, z + 0.2, 1.0); if (rnd() < 0.7 && ok(x + 0.3, z + 0.9, 0.4)) sackAt(x + 0.3, z + 0.9, 1.1); if (ok(x - 0.7, z + 0.5, 0.4)) sackAt(x - 0.7, z + 0.5, 0.9); if (rnd() < 0.5) put(P.stonePath(0), x, 0, z + 0.2, 1.2, 0.5, 1.2, 0xc8b898, 0, 0, 0, 'shinyNS'); around(x, z, 1.6, 3, (px, pz) => tuftAt(px, pz, 1)); break; }
        case 'fence': { const n = 3 + ((rnd() * 2) | 0); for (let i = 0; i < n; i++) { const t = (i - (n - 1) / 2) * 1.6, px = x + ca * t, pz = z + sa * t; if (ok(px, pz, 0.3)) { put(P.fenceSeg(0), px, 0, pz, 1, 1, 1, 0xffffff, yaw, 0, 0, 'shinyNS'); st.fence++; } }
          for (const sg of [-1, 1]) around(x - sa * sg * 0.55, z + ca * sg * 0.55, 1.6, 4, (px, pz) => { if (rnd() < 0.6) flowerAt(px, pz, 1.1); else tuftAt(px, pz, 1.2); }); break; }
        default: { const s = 0.5 + rnd() * 0.3; stoneAt(x, z, s); /* (alçak taş: içinden geçilir; eskiden 1,4 m'lik kaya) */ around(x, z, 1.7, 3, (px, pz) => { if (rnd() < 0.5) stoneAt(px, pz, 0.25 + rnd() * 0.25); else tuftAt(px, pz, 1.3); }); }
      }
    }
    for (let t = 0, made = 0; t < nCl * 20 && made < nCl; t++) {
      const x = 1 + rnd() * (L.W - 2), z = 1 + rnd() * (L.H - 2);
      if (!api.isFloor(x, z)) continue;
      const dp = F.dp(x, z), din = F.din(x, z);
      if (dp < 2.6 && rnd() < 0.9) continue;
      if (!ok(x, z, 1.2)) continue;
      if (centers.some(c => hyp(c.x - x, c.z - z) < 3.6)) continue;
      centers.push({ x, z, kind: null }); made++;
      let kind = pick(kinds); if (din < 3 && rnd() < 0.5) kind = pick(['hay', 'fence', 'rocks', 'wheat']);
      centers[centers.length - 1].kind = kind; cluster(kind, x, z, dp, din);
    }
    // ── yol kenarı: çiçek şeridi + saman tutamı ──
    const Pt = L.path || [];
    for (let q = 4; q < Pt.length - 3; q += 2) {
      const a = Pt[q - 2], b = Pt[q + 2], dx = b.x - a.x, dz = b.z - a.z, dl = hyp(dx, dz) || 1, nx = -dz / dl, nz = dx / dl;
      for (const sg of [1, -1]) {
        const d = 1.8 + rnd() * 1.2, x = Pt[q].x + nx * d * sg, z = Pt[q].z + nz * d * sg;
        if (rnd() < 0.5 && ok(x, z, 0.2)) { if (rnd() < 0.55) flowerAt(x, z, 1 + rnd() * 0.6); else tuftAt(x, z, 1.2); }
      }
    }
    centers.forEach((c, i) => { if (i % 4 === 1) api.glow(c.x, c.z, 3, 0xfff0b8, 0.08); });
    if (typeof window !== 'undefined') window.__E234 = { st, centers };
    return st;
  }
  return { olustur, scarecrow, barrel };
})();
