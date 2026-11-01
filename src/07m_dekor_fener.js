/* ── FENER_DEKOR: Bölüm 10 (Büyük Fener) — GECE sahnesi, kahraman: deniz feneri (E8910) ──
   06z_fener.js kur() içinden:  FENER_DEKOR.olustur(L, api, F)   ve fenerModel() içinden  FENER_DEKOR.kule(api, x, z, CAM, kp)
   Katmanlar: ADA (yürünür alan kayalık ada) · DENİZ (yürünür alandan >3 m sonra: koyu lacivert, ay parıltısı, kıyıda köpük; tek şeffaf düzlem)
   · kayalık/uçurum blokları + çam · yer fenerleri (sıcak ışık) · unutulmuş oyuncak rafları · uzak taş köprü silüetleri
   · FENER: 9 yüzlü gövde (şeritli), balkon, 9 cam yüz (oyun kodu sırayla yakar), tepede boş yuva, süpüren yumuşak ışık huzmesi (tam yanınca).
   Gece havası: aşağıdaki ZEMIN + ATMO ayarları ve bölüm `isik` değerleri. Mor yok. */
if (typeof ATMO !== 'undefined' && ATMO.P && ATMO.P.fener) Object.assign(ATMO.P.fener, { gl: [0, 0xa8c0ff, 0x0c1438, 0.1, 0.07], sh: 0x3a84e0, hi: 0xdceaff, con: 0.26, haze: [0x1c3070, 0.3, 0.42], rays: [0xffe8b0, 0.2], fog: [0.55, 0.7], dust: { n: 140, col: 0xfff2c0, size: 0.1, mode: 'mote', a: 0.9, h: 6 } });
if (typeof ZEMIN !== 'undefined' && ZEMIN.TEMA && ZEMIN.TEMA.fener) {
  const T = ZEMIN.TEMA.fener;
  Object.assign(T, { outT: 6, base: [2, 0x434f6c, 0x7a88a8, 0xa0aecc], alt: [0, 0x1e4450, 0x387470, 0x5aa896], path: [7, 0x6a5c4c, 0xa89a82, 0xcdbf9f], rim: 0x34405a, out: 0x222e48, outK: 0.7, pmoss: 0.3,
    macro: [0xb0c4ff, 0xffe6bc], patch: 0.34, dapple: [0xa8c0ff, 0.12] });
  if (T.cover) T.cover = T.cover.map(c => c.k === 'tuft' ? Object.assign({}, c, { col: [0x2a5a58, 0x3a7a6a, 0x4a8a78, 0x2e6a5a] }) : c.k === 'flower' ? Object.assign({}, c, { col: [0xe8f0ff, 0xffe8a0, 0xb0c8ff] }) : c.k === 'pebble' ? Object.assign({}, c, { col: [0x6a7088, 0x8a90a8, 0x586070] }) : c);
}
const FENER_DEKOR = (() => {
  'use strict';
  const Y = YAPI, PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  const SC = 0.72;   // fener ölçeği (taban yarıçapı 3.6·0.72+kaya ≈ arena kenarına taşmaz)

  // ── Büyük Fener: gövde (birleşik, taş) + 9 cam yüz (ayrı malzeme: oyun yakar) + ışık topu yuvası + halo + huzme ──
  function kule(api, x, z, CAM, kp) {
    const THREE_ = api.THREE, t = Y.fenerKulesi(), g = new THREE_.Group(); g.position.set(x, 0, z);
    api.put(t.m, x, 0, z, SC, SC, SC, 0xffffff, 0, 0, 0, 'shinyNS');
    const N = 9, yb = 22 * SC, LH = 3.6 * SC, LR = (2.4 - 0.2) * SC, face = 2 * LR * Math.sin(PI / N);
    const pg = kp(new THREE_.BoxGeometry(face * 0.78, LH * 0.82, 0.1)); api.tmp(pg);
    const panes = [];
    for (let i = 0; i < N; i++) {
      const am = 0.2 + (i + 0.5) / N * TAU, m = new THREE_.MeshBasicMaterial({ color: 0x8b93a0, transparent: true, opacity: 0.94 }); api.dispose(m);
      const p = new THREE_.Mesh(pg, m); const r = LR * Math.cos(PI / N) * 0.985; p.position.set(Math.sin(am) * r, yb + LH * 0.5, Math.cos(am) * r); p.rotation.y = am; g.add(p); panes.push({ m, c: CAM[i] });
    }
    const sk = new THREE_.Mesh(kp(new THREE_.SphereGeometry(0.26, 12, 8)), new THREE_.MeshBasicMaterial({ color: 0x8b93a0 })); sk.position.y = (22 + 3.6 + 2.45) * SC; g.add(sk); api.dispose(sk.material);
    const hc = document.createElement('canvas'); hc.width = hc.height = 128; { const cx = hc.getContext('2d'), gr = cx.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128); }
    const htex = new THREE_.CanvasTexture(hc); api.dispose(htex);
    const halo = new THREE_.Mesh(kp(new THREE_.PlaneGeometry(16, 16)), new THREE_.MeshBasicMaterial({ color: 0xffe9a8, map: htex, transparent: true, opacity: 0, depthWrite: false, side: THREE_.DoubleSide, fog: false }));
    halo.position.y = yb + LH * 0.5; halo.renderOrder = 6; g.add(halo);
    // yumuşak içten ışık: odanın kendisi (cam arkası) gri iken sönük; yandıkça ısınır
    const tw = { g, panes, socket: sk, halo, lit: 0, H: yb + LH * 0.5 - 1 };
    api.add(g);
    // süpüren ışık huzmesi: düz yelpaze (yatay), iki yönlü, yavaş döner; opaklık = yanan cam sayısı / 9
    const bm = new THREE_.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE_.AdditiveBlending, side: THREE_.DoubleSide, fog: false, uniforms: { uA: { value: 0 }, uCol: { value: new THREE_.Color(0xffe6a8) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec2 vUv; uniform float uA; uniform vec3 uCol; void main(){ float e = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.25, vUv.x); float c = 1.0 - abs(vUv.y - 0.5) * 2.0; c = pow(max(c, 0.0), 1.6); gl_FragColor = vec4(uCol * 1.4, e * c * uA * 0.55); if (gl_FragColor.a < 0.003) discard; }' });
    const bg = new THREE_.BufferGeometry(), L0 = 60;
    const pos = [], uv = [], idx = [];
    for (let s = 0; s <= 1; s++) for (const sg of [1, -1]) { void s; }
    // iki kol: +x ve -x yönünde, tepe genişliği 0.8 → uç genişliği 13
    for (const sg of [1, -1]) { const b = pos.length / 3; pos.push(0, 0, -0.4, sg * L0, 0, -6.5, sg * L0, 0, 6.5, 0, 0, 0.4); uv.push(0, 0, 1, 0, 1, 1, 0, 1); idx.push(b, b + 1, b + 2, b, b + 2, b + 3); }
    bg.setAttribute('position', new THREE_.Float32BufferAttribute(pos, 3)); bg.setAttribute('uv', new THREE_.Float32BufferAttribute(uv, 2)); bg.setIndex(idx);
    const beam = new THREE_.Mesh(bg, bm); beam.position.set(x, yb + LH * 0.5, z); beam.renderOrder = 7; beam.frustumCulled = false; api.add(beam); api.dispose(bm); api.dispose(bg);
    let T = 0, a = 0;
    api.anim(dt => { T += dt; a += dt * 0.45; beam.rotation.y = a; const want = tw.lit >= 9 ? 1 : tw.lit / 9 * 0.35; bm.uniforms.uA.value += (want - bm.uniforms.uA.value) * Math.min(1, dt * 1.5); halo.material.opacity = Math.max(halo.material.opacity, 0.05 + 0.05 * Math.sin(T)); });
    return tw;
  }

  // ── deniz: yürünür alandan uzak her yer (mesafe dokusu), tek şeffaf düzlem ──
  function deniz(L, api, DF) {
    const THREE_ = api.THREE, M = DF.M, W = DF.W, H = DF.H, data = new Uint8Array(W * H * 4);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const f = DF.at(i - M + 0.5, j - M + 0.5); const d = f ? f.d : 60; data[(j * W + i) * 4] = Math.min(255, Math.round(d / 40 * 255)); data[(j * W + i) * 4 + 3] = 255; }
    const tex = new THREE_.DataTexture(data, W, H, THREE_.RGBAFormat); tex.magFilter = THREE_.LinearFilter; tex.minFilter = THREE_.LinearFilter; tex.wrapS = tex.wrapT = THREE_.ClampToEdgeWrapping; tex.needsUpdate = true; api.dispose(tex);
    const ext = 90, x0 = -M - ext, x1 = L.W + M + ext, z0 = -M - ext, z1 = L.H + M + ext;
    const gm = new THREE_.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-PI / 2).translate((x0 + x1) / 2, 0.035, (z0 + z1) / 2);
    const fc = scene.fog ? scene.fog.color : new THREE_.Color(0x101c44);
    const mat = new THREE_.ShaderMaterial({ transparent: true, depthWrite: false, fog: false,
      uniforms: { tD: { value: tex }, uT: TIME.u, uBox: { value: new THREE_.Vector4(-M, -M, W, H) }, uFog: { value: fc }, uFN: { value: new THREE_.Vector2(35, 100) }, uCam: { value: new THREE_.Vector3() } },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `varying vec3 vW; uniform sampler2D tD; uniform float uT; uniform vec4 uBox; uniform vec3 uFog, uCam; uniform vec2 uFN;
        float h(vec2 p){ p = fract(p * vec2(.1031, .1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        void main(){
          vec2 uv = (vW.xz - uBox.xy) / uBox.zw; float d = texture2D(tD, uv).r * 40.0;
          float sea = smoothstep(2.4, 3.3, d); if (sea < 0.01) discard;
          vec2 p = vW.xz;
          float w1 = n(p * 0.35 + vec2(uT * 0.05, uT * 0.03)), w2 = n(p * 0.9 - vec2(uT * 0.08, -uT * 0.04)), w = w1 * 0.6 + w2 * 0.4;
          vec3 deep = vec3(0.025, 0.07, 0.17), mid = vec3(0.06, 0.2, 0.34), col = mix(deep, mid, w);
          col += vec3(0.04, 0.09, 0.14) * smoothstep(3.3, 9.0, d) * 0.0 + vec3(0.05, 0.12, 0.16) * (1.0 - smoothstep(3.3, 8.0, d)) * w;
          // ay parıltısı: küçük dalga tepeleri
          float sp = pow(max(0.0, sin(p.x * 2.3 + uT * 0.9 + w1 * 9.0) * sin(p.y * 2.1 - uT * 0.7 + w2 * 9.0)), 14.0); col += vec3(0.75, 0.88, 1.0) * sp * 0.55;
          // kıyıda köpük: dalga halkası
          float fo = smoothstep(3.9, 3.1, d) * (0.55 + 0.45 * sin(d * 5.0 - uT * 1.4 + w1 * 6.0)); fo = max(fo, 0.0) * smoothstep(2.4, 3.0, d); col = mix(col, vec3(0.85, 0.93, 1.0), clamp(fo * 0.55, 0.0, 0.7));
          float fd = length(vW - uCam); col = mix(col, uFog, smoothstep(uFN.x * 1.2, uFN.y, fd));
          gl_FragColor = vec4(col, sea * 0.96);
        }` });
    const m = new THREE_.Mesh(gm, mat); m.renderOrder = 1; m.frustumCulled = false; m.name = 'fener-deniz'; api.add(m); api.dispose(gm); api.dispose(mat);
    m.onBeforeRender = () => { mat.uniforms.uCam.value.copy(camera.position); if (scene.fog) { mat.uniforms.uFN.value.set(scene.fog.near, scene.fog.far); mat.uniforms.uFog.value.copy(scene.fog.color); } };
    return m;
  }

  function olustur(L, api, F) {
    const rnd = api.rnd, put = api.put, grid = L.grid, DF = SEHIR_DEKOR.mesafeAlani(L);
    const cell = new Map();
    const free = (x, z, r) => { const cx = Math.floor(x / 6), cz = Math.floor(z / 6); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const q = cell.get((cx + a + 500) * 1000 + cz + b + 500); if (q) for (const u of q) if (hyp(u.x - x, u.z - z) < u.r + r) return false; } return true; };
    const claim = (x, z, r) => { const k = (Math.floor(x / 6) + 500) * 1000 + Math.floor(z / 6) + 500; let q = cell.get(k); if (!q) cell.set(k, q = []); q.push({ x, z, r }); };
    const floorAt = (x, z) => { const i = Math.floor(x), j = Math.floor(z); return i >= 0 && j >= 0 && i < L.W && j < L.H && grid[j * L.W + i] > 0; };
    const southFront = (x, z) => { for (let t = 2; t <= 10; t += 2) for (const o of [0, -3, 3]) if (floorAt(x + o, z - t)) return true; return false; };
    const keep = (x, z, r) => (L.start && hyp(x - L.start.x, z - L.start.z) < r + 2) || (L.exit && hyp(x - L.exit.x, z - L.exit.z) < r + 3);
    const pick = a => a[(rnd() * a.length) | 0];
    const toward = (x, z, f) => Math.atan2(f.fx - x, f.fz - z);
    const pr = (g, x, y, z, sx, sy, sz, yaw, col = 0xffffff, mk = 'shinyNS') => put(g, x, y, z, sx, sy, sz, col, yaw || 0, 0, 0, mk);
    const st = { kaya: 0, fener: 0, raf: 0, kopru: 0, agac: 0, deniz: 0 };
    try { deniz(L, api, DF); st.deniz = 1; } catch (e) { console.warn('FENER deniz', e); }
    const bb = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 };
    for (let j = 0; j < L.H; j++) for (let i = 0; i < L.W; i++) if (grid[j * L.W + i]) { bb.x0 = Math.min(bb.x0, i); bb.x1 = Math.max(bb.x1, i); bb.z0 = Math.min(bb.z0, j); bb.z1 = Math.max(bb.z1, j); }
    const cands = [];
    for (let z = bb.z0 - 40; z <= bb.z1 + 40; z += 1.6) for (let x = bb.x0 - 40; x <= bb.x1 + 40; x += 1.6) {
      const xx = x + (rnd() - 0.5) * 1.5, zz = z + (rnd() - 0.5) * 1.5, f = DF.at(xx, zz);
      if (!f || f.d < 1.7 || floorAt(xx, zz)) continue;
      cands.push({ x: xx, z: zz, f });
    }
    cands.sort((a, b) => a.f.d - b.f.d);
    const lamps = [], rafs = [];
    // ── kıyı şeridi (d 1.7–3.2): kayalık blokları, yer fenerleri, oyuncak rafları, çam ──
    for (const c of cands) {
      const d = c.f.d; if (d > 3.3 || keep(c.x, c.z, 1.2) || api.linkDist(c.x, c.z) < 1.5) continue;
      const yaw = toward(c.x, c.z, c.f), r0 = rnd();
      if (d >= 2.2 && d < 3.1 && r0 < 0.12 && !lamps.some(q => hyp(q.x - c.x, q.z - c.z) < 7) && free(c.x, c.z, 1.0)) {
        const fl = Y.fener(); pr(fl.m, c.x, 0, c.z, 1.15, 1.15, 1.15, yaw); pr(fl.g, c.x, 0, c.z, 1.15, 1.15, 1.15, yaw, 0xffffff, 'glow'); api.glow(c.x, c.z, 3.2, 0xffd890, 0.2);
        if (lamps.length < 12) api.light(c.x, 2.4, c.z, 0xffcf88, 2.4, 8, 0.12);
        lamps.push(c); claim(c.x, c.z, 1.0); st.fener++;
      } else if (d >= 2.2 && d < 3.1 && r0 > 0.12 && r0 < 0.2 && rafs.length < 5 && !rafs.some(q => hyp(q.x - c.x, q.z - c.z) < 14) && free(c.x, c.z, 1.6)) {
        pr(Y.oyuncakRaf(rafs.length).m, c.x, 0, c.z, 1.15, 1.15, 1.15, yaw); pr(Y.sandik().m, c.x + 1.5, 0, c.z + 0.3, 1, 1, 1, rnd() * TAU); rafs.push(c); claim(c.x, c.z, 1.8); st.raf++;
      } else if (r0 > 0.3 && r0 < 0.5 && free(c.x, c.z, 1.7)) {
        const s = southFront(c.x, c.z) ? 0.7 + rnd() * 0.5 : 1.1 + rnd() * 1.1; pr(Y.kayalik((rnd() * 4) | 0).m, c.x, -0.25, c.z, s * 1.1, s * (0.9 + rnd() * 0.9), s * 1.1, rnd() * TAU, pick([0xd0e4ee, 0xc4d8e4, 0xe0ecf2]), 'shinyNS'); claim(c.x, c.z, s * 1.0); st.kaya++;
      }
    }
    // ── ada arkası: çam, büyük kaya kütleleri, adacıklar (uzak silüet katmanları) ──
    for (const c of cands) {
      const d = c.f.d; if (d < 3.2 || d > 16 || rnd() > 0.04 || (southFront(c.x, c.z) && d < 9)) continue;
      if (keep(c.x, c.z, 2) || !free(c.x, c.z, 2.6)) continue;
      // deniz içinde (d>3.3) yalnızca kaya adacığı; d 3.3'ten küçükse çam
      if (d < 3.6) { const h = 4 + rnd() * 3; PROPKIT.placeTree(api, 'pine', (rnd() * 4) | 0, c.x, c.z, h, { y: -0.06 * h, yaw: rnd() * TAU, mat: 'shinyNS', leaf: pick([0x2a6a62, 0x30786a, 0x255a58]) }); claim(c.x, c.z, 1.6); st.agac++; continue; }
      const s = 2.6 + rnd() * 3.2; pr(Y.kayalik((rnd() * 4) | 0).m, c.x, -0.4, c.z, s * 1.4, s * (0.8 + rnd() * 0.9), s * 1.4, rnd() * TAU, pick([0xc8dce8, 0xb8d0e0, 0xd8e8f0]), 'shinyNS'); claim(c.x, c.z, s * 1.3); st.kaya++;
      if (rnd() < 0.7) { const h = 3.5 + rnd() * 2.5; PROPKIT.placeTree(api, 'pine', (rnd() * 4) | 0, c.x + (rnd() - 0.5), c.z + (rnd() - 0.5), h, { y: s * 0.7, yaw: rnd() * TAU, mat: 'shinyNS', leaf: pick([0x2a6a62, 0x30786a]) }); st.agac++; }
    }
    // ── denizde uzak taş köprü silüetleri (adacıklar arası) ──
    for (const c of cands) {
      if (st.kopru >= 4) break; const d = c.f.d; if (d < 7 || d > 18 || rnd() > 0.01) continue;
      if (!free(c.x, c.z, 6)) continue; const yaw = rnd() * TAU;
      pr(Y.tasKopru(9, 2.6).m, c.x, 0.25, c.z, 1, 1, 1, yaw); for (const sg of [-1, 1]) { pr(Y.kayalik(1).m, c.x + Math.sin(yaw) * sg * 5.4, -0.4, c.z + Math.cos(yaw) * sg * 5.4, 2.4, 1.3, 2.4, rnd() * TAU, 0xe8f0ff); }
      claim(c.x, c.z, 6); st.kopru++;
    }
    return { st, lamps };
  }
  return { olustur, kule, deniz };
})();
if (typeof window !== 'undefined') window.FENER_DEKOR = FENER_DEKOR;
