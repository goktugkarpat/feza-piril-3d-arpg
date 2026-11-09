/* 09t_baslik.js — BASLIK: başlık ekranı + yatak odası cilası (büyülü gece odası).
   10_story.js'in kurduğu 'hikayeOda' grubuna eklenti yapar (pencerede gökyüzü + uzak Büyük Fener, ay ışığı huzmesi, uçuşan ışık tozu,
   peri ışıkları, dönen yıldız mobili, lamba parıltısı, Pırıl'ın nefes alan mor ışığı, duvar kâğıdı, çocuk resimleri, yumuşak gölgeler).
   Kendi rAF döngüsü vardır; oda yoksa/görünmezse hiçbir şey yapmaz. Giriş masalı kancaları: BASLIK.doldur(), STORY.playIntro sarmalı.
   Dışa: BASLIK.tilt (kamera eğimi, -1..1), BASLIK.doldur(), BASLIK.S. Test: ?baslikyok → hiçbir şey eklenmez. */
const BASLIK = (() => {
  'use strict';
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const S = { room: null, X: null, t: 0, fill: 0, fillT: -1, last: 0 };
  const off = typeof Q !== 'undefined' && Q.has && Q.has('baslikyok');
  const hasGL = typeof THREE !== 'undefined';

  // ── yardımcılar ──
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function radialTex(stops, size = 128) {
    return canvasTex(size, size, (g, w, h) => {
      const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      stops.forEach(([o, c]) => r.addColorStop(o, c)); g.fillStyle = r; g.fillRect(0, 0, w, h);
    });
  }
  function glowSprite(tex, col, sx, sy, a, pos) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: col, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    m.scale.set(sx, sy, 1); m.position.set(pos[0], pos[1], pos[2]); m.renderOrder = 6; return m;
  }
  const rnd = (() => { let s = 12345; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

  // ── pencere dışı: gece göğü, uzak ada, Büyük Fener (sönük, ara ara yanıp söner) ──
  function buildSky(R, X) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uBeat: { value: 0.1 }, uPar: { value: new THREE.Vector2() } }, fog: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uT, uBeat; uniform vec2 uPar; varying vec2 vUv;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
        float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 17.0; a *= 0.5; } return s; }
        void main(){
          float asp = 1.286; vec2 uv = vUv; vec2 q = vec2(uv.x * asp, uv.y); float hz = 0.25;
          float t = clamp((uv.y - hz) / (1.0 - hz), 0.0, 1.0);
          vec3 col = mix(vec3(0.66, 0.40, 0.78), vec3(0.17, 0.15, 0.52), smoothstep(0.0, 0.42, t));
          col = mix(col, vec3(0.035, 0.05, 0.24), smoothstep(0.30, 1.0, t));
          col += vec3(1.0, 0.62, 0.56) * 0.30 * exp(-t * 8.0);
          vec2 pa = q + uPar * 0.02;
          float ar = fbm(vec2(pa.x * 1.4 + uT * 0.03, pa.y * 4.0 + uT * 0.05));
          float rib = smoothstep(0.46, 0.78, ar) * smoothstep(0.18, 0.5, t) * smoothstep(0.98, 0.55, t);
          col += mix(vec3(0.15, 0.95, 0.78), vec3(0.85, 0.4, 1.0), vn(pa * 2.0 + uT * 0.05)) * rib * 0.32;
          vec2 sp = (q + uPar * 0.015) * vec2(24.0, 20.0); vec2 id = floor(sp), fp = fract(sp) - 0.5;
          float r = h21(id); vec2 o = (vec2(h21(id + 3.1), h21(id + 7.7)) - 0.5) * 0.6;
          float d = length(fp - o), tw = 0.5 + 0.5 * sin(uT * (1.0 + r * 3.0) + r * 40.0);
          float st = smoothstep(0.10 + r * 0.08, 0.0, d) * step(0.52, r) * (0.45 + 0.55 * tw);
          col += vec3(1.0, 0.95, 0.8) * st * smoothstep(0.10, 0.4, t) * 1.5;
          vec2 mc = vec2(0.90 * asp, 0.80); vec2 mq = q + uPar * 0.01; float md = length(mq - mc);
          float moon = clamp(smoothstep(0.100, 0.093, md) - smoothstep(0.092, 0.084, length(mq - mc - vec2(0.05, 0.022))), 0.0, 1.0);
          col += vec3(0.75, 0.82, 1.0) * exp(-md * 6.5) * 0.42; col = mix(col, vec3(1.0, 0.96, 0.80) * 1.5, moon);
          float cl = smoothstep(0.52, 0.82, fbm(vec2(q.x * 2.2 + uT * 0.015, q.y * 7.0))) * smoothstep(0.0, 0.25, t) * smoothstep(0.62, 0.22, t);
          col = mix(col, vec3(0.50, 0.40, 0.78) + vec3(0.5, 0.5, 0.6) * exp(-md * 3.0), cl * 0.55);
          float shT = fract(uT / 11.0); vec2 sa = vec2(1.15 * asp, 0.95) - vec2(0.75, 0.32) * shT * 1.4; vec2 sv = mq - sa; vec2 sd = normalize(vec2(0.75, 0.32));
          float al = dot(sv, sd), pe = abs(sv.x * sd.y - sv.y * sd.x); float sh = smoothstep(0.006, 0.0, pe) * step(0.0, -al) * exp(al * 14.0) * step(shT, 0.5) * smoothstep(0.5, 0.35, shT) * step(0.03, shT);
          col += vec3(1.0, 0.95, 0.85) * sh * 1.2;
          // deniz + ay yolu
          if (uv.y < hz) {
            float sdp = (hz - uv.y) / hz; vec3 sea = mix(vec3(0.14, 0.22, 0.48), vec3(0.02, 0.04, 0.16), sdp);
            float rx = abs(q.x - mc.x - uPar.x * 0.01);
            float refl = exp(-rx * rx * 55.0) * (0.5 + 0.5 * sin(sdp * 90.0 + uT * 1.4 + vn(vec2(q.x * 26.0, sdp * 18.0)) * 5.0)) * exp(-sdp * 1.8);
            sea += vec3(0.7, 0.8, 1.0) * refl * 0.55; col = sea;
          }
          col += vec3(1.0, 0.7, 0.7) * 0.10 * exp(-abs(uv.y - hz) * 80.0);
          float x1 = q.x + uPar.x * 0.035;
          float isl = hz + 0.045 * exp(-pow((x1 - 1.02) * 4.2, 2.0)) + 0.028 * exp(-pow((x1 - 1.55) * 6.0, 2.0)) + 0.020 * exp(-pow((x1 - 0.25) * 8.0, 2.0));
          if (uv.y < isl && uv.y > hz - 0.004) col = mix(col, vec3(0.03, 0.045, 0.14), 0.96);
          // Büyük Fener
          float sc = 1.45; float lx = 0.725 * asp - uPar.x * 0.05; float rock = hz + 0.05 * exp(-pow((q.x - lx) * 8.0, 2.0));
          if (uv.y < rock && uv.y > hz - 0.004) col = vec3(0.04, 0.05, 0.13);
          float ty0 = hz + 0.03, ty1 = hz + 0.03 + 0.185 * sc; float tu = clamp((uv.y - ty0) / (ty1 - ty0), 0.0, 1.0);
          float hw = mix(0.020, 0.0105, tu) * sc;
          if (uv.y > ty0 && uv.y < ty1 && abs(q.x - lx) < hw) col = mix(vec3(0.08, 0.09, 0.22), vec3(0.22, 0.17, 0.34), step(0.5, fract(tu * 3.0)) * 0.5);
          if (uv.y >= ty1 && uv.y < ty1 + 0.012 * sc && abs(q.x - lx) < 0.017 * sc) col = vec3(0.06, 0.07, 0.18);
          vec2 lp = vec2(lx, ty1 + 0.026 * sc);
          if (uv.y >= ty1 + 0.012 * sc && uv.y < ty1 + 0.04 * sc && abs(q.x - lx) < 0.010 * sc) col = mix(vec3(0.07, 0.08, 0.2), vec3(1.0, 0.86, 0.5), uBeat);
          if (uv.y >= ty1 + 0.04 * sc && uv.y < ty1 + 0.056 * sc && abs(q.x - lx) < (0.0135 - (uv.y - ty1 - 0.04 * sc) / sc * 0.6) * sc) col = vec3(0.05, 0.06, 0.16);
          float ld = length((q - lp) * vec2(1.0, 1.1));
          col += vec3(1.0, 0.82, 0.45) * exp(-ld * 45.0) * (0.10 + 0.9 * uBeat);
          float sg = sign(sin(uT * 0.55)); vec2 bv = q - lp; float ba = bv.x * sg;
          float beam = step(0.0, ba) * exp(-ba * 2.6) * smoothstep(0.004 + ba * 0.06, 0.0, abs(bv.y));
          col += vec3(1.0, 0.9, 0.62) * beam * (0.03 + 0.45 * uBeat);
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), mat); m.position.set(1.6, 2.35, -2.812); m.renderOrder = 1;
    R.add(m); X.sky = mat;
    // pencere camı: hafif parıltı + dış pervaz ışığı
  }

  // ── ay ışığı: pencereden zemine uzanan hafif huzme + zemindeki pencere deseni ──
  function buildShaft(R, X) {
    const W = [[0.7, 1.65], [2.5, 1.65], [2.5, 3.05], [0.7, 3.05]], z0 = -2.8, dx = -0.35, dz = 0.75;
    const pos = [], alp = [], uvs = [], idx = [];
    W.forEach(([x, y], i) => { pos.push(x, y, z0); alp.push(1); uvs.push(i === 0 || i === 3 ? 0 : 1, 0); });
    W.forEach(([x, y]) => { pos.push(x + y * dx, 0.03, z0 + y * dz); alp.push(0.45); uvs.push(0, 1); });
    uvs[8 * 1] = 0; // (sade uv; kenar solması aşağıda)
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; idx.push(i, j, 4 + i, j, 4 + j, 4 + i); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('a', new THREE.Float32BufferAttribute(alp, 1)); g.setIndex(idx);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uA: { value: 1 } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: 'attribute float a; varying float vA; varying vec3 vW; void main(){ vA = a; vW = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.0); }',
      fragmentShader: `uniform float uT, uA; varying float vA; varying vec3 vW;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
        void main(){ float n = 0.65 + 0.35 * vn(vec2(vW.x * 2.0 + vW.y * 1.3 + uT * 0.07, vW.z * 2.2 - vW.y * 1.7 - uT * 0.05) * 1.6);
          float a = vA * vA * 0.085 * n * uA; gl_FragColor = vec4(vec3(0.62, 0.74, 1.0) * 1.4, a); }`,
    });
    const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 4; R.add(m); X.shaft = mat;
    // zemindeki ışık lekesi: dört cam + çıta aralığı
    const tex = canvasTex(256, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const x = 12 + i * 122, y = 12 + j * 122, gr = c.createRadialGradient(x + 55, y + 55, 5, x + 55, y + 55, 90);
        gr.addColorStop(0, 'rgba(190,210,255,.95)'); gr.addColorStop(1, 'rgba(150,175,255,.55)'); c.fillStyle = gr;
        c.beginPath(); c.roundRect(x, y, 110, 110, 10); c.fill();
      }
    });
    const gp = new THREE.BufferGeometry();
    const fl = W.map(([x, y]) => [x + y * dx, 0.075, z0 + y * dz]);   // alt kenar (y 1.65) ve üst kenar (3.05): [BL, BR, TR, TL]
    gp.setAttribute('position', new THREE.Float32BufferAttribute([...fl[0], ...fl[1], ...fl[2], ...fl[3]], 3));
    gp.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2)); gp.setIndex([0, 1, 2, 0, 2, 3]);
    const pm = new THREE.Mesh(gp, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    pm.renderOrder = 3; R.add(pm); X.patch = pm;
  }

  // ── uçuşan ışık tozu (böcek yok): oda içinde yavaş süzülen, huzmede parlayan noktalar ──
  function buildDust(R, X) {
    const N = 80, pos = new Float32Array(N * 3), rr = new Float32Array(N * 4);
    for (let i = 0; i < N * 4; i++) rr[i] = rnd();
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('r', new THREE.BufferAttribute(rr, 4));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uPx: { value: 600 }, uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: `uniform float uT, uPx; attribute vec4 r; varying float vA; varying float vW;
        void main(){
          vec3 p = vec3(-3.4 + r.x * 6.2, 0.3 + r.y * 2.7, -2.4 + r.z * 4.6);
          p.x += sin(uT * (0.15 + r.w * 0.2) + r.y * 30.0) * 0.35; p.y += sin(uT * 0.25 + r.x * 30.0) * 0.25 + uT * 0.015 * (r.w + 0.3);
          p.y = 0.3 + mod(p.y - 0.3, 2.9); p.z += cos(uT * 0.13 + r.z * 20.0) * 0.3;
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          float inShaft = smoothstep(1.4, 0.0, abs(p.x - (1.5 - (p.y - 1.6) * 0.35 + (p.z + 2.8) * -0.0)) ) * smoothstep(0.0, 1.0, p.y);
          vW = inShaft; vA = (0.35 + 0.65 * (0.5 + 0.5 * sin(uT * (0.6 + r.w * 1.4) + r.x * 40.0))) * (0.45 + 0.8 * inShaft);
          gl_PointSize = (0.022 + r.w * 0.03) * (1.0 + inShaft * 0.6) * uPx / max(-mv.z, 0.5); }`,
      fragmentShader: `uniform float uA; varying float vA; varying float vW; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.0, d); a *= a;
        vec3 c = mix(vec3(1.0, 0.86, 0.62), vec3(0.75, 0.85, 1.0), vW); gl_FragColor = vec4(c * 1.8, a * vA * 0.5 * uA); if (gl_FragColor.a < 0.004) discard; }`,
    });
    const p = new THREE.Points(g, mat); p.frustumCulled = false; p.renderOrder = 8; R.add(p); X.dust = mat;
  }

  // ── peri ışıkları: üç sıra, yanıp sönen sıcak ışıklar + ince tel ──
  function buildFairy(R, X) {
    const strands = [
      { n: 15, f: u => [-3.9 + u * 4.2, 3.12 - Math.sin(u * Math.PI) * 0.4], z: -2.85 },
      { n: 12, f: u => [0.35 + u * 2.5, 3.3 - Math.sin(u * Math.PI) * 0.17], z: -2.84 },
      { n: 9, f: u => [3.0 + u * 1.2, 3.05 - Math.sin(u * Math.PI) * 0.3], z: -2.85 },
    ];
    const P = [], C = [], T = [], wire = [], cols = [[1, 0.8, 0.45], [1, 0.95, 0.82], [0.62, 0.95, 0.9], [1, 0.62, 0.8]];
    strands.forEach(s => {
      for (let i = 0; i <= 80; i++) { const [x, y] = s.f(i / 80); wire.push(x, y, s.z - 0.005); }
      wire.push(NaN);   // ayrım işareti
      for (let i = 0; i < s.n; i++) { const [x, y] = s.f((i + 0.5) / s.n); P.push(x, y - 0.03, s.z + 0.02); const c = cols[i % 4]; C.push(c[0], c[1], c[2]); T.push(rnd()); }
    });
    // teller: tek LineSegments
    const ls = []; let prev = null;
    for (let i = 0; i < wire.length; i += 3) { if (Number.isNaN(wire[i])) { prev = null; i -= 2; continue; } const c = [wire[i], wire[i + 1], wire[i + 2]]; if (prev) ls.push(...prev, ...c); prev = c; }
    { const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(ls, 3)); R.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: 0x4a3f68 }))); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('c', new THREE.Float32BufferAttribute(C, 3)); g.setAttribute('ph', new THREE.Float32BufferAttribute(T, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uPx: { value: 600 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: `uniform float uT, uPx; attribute vec3 c; attribute float ph; varying vec3 vC; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
          float tw = 0.55 + 0.45 * sin(uT * (1.4 + ph * 1.8) + ph * 50.0); vC = c; vA = tw; gl_PointSize = (0.22 + 0.1 * tw) * uPx / max(-mv.z, 0.5); }`,
      fragmentShader: 'varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float core = smoothstep(0.35, 0.0, d); float a = smoothstep(1.0, 0.0, d); a *= a;' +
        ' gl_FragColor = vec4(vC * (0.9 + 1.6 * core) * (0.5 + 0.7 * vA), a * (0.35 + 0.65 * vA)); if (gl_FragColor.a < 0.004) discard; }',
    });
    const pt = new THREE.Points(g, mat); pt.frustumCulled = false; pt.renderOrder = 7; R.add(pt); X.fairy = mat;
  }

  // ── dönen yıldız mobili (yataktan sarkar, hafifçe sallanır) ──
  function starGeo(r, inner) {
    const sh = new THREE.Shape();
    for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i & 1 ? r * inner : r; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? sh.lineTo(x, y) : sh.moveTo(x, y); }
    sh.closePath(); return new THREE.ShapeGeometry(sh);
  }
  function moonGeo(r) {
    const sh = new THREE.Shape(); sh.absarc(0, 0, r, 0.9, Math.PI * 2 - 0.9, false);
    sh.absarc(r * 0.42, 0, r * 0.82, Math.PI * 2 - 1.15, 1.15, true); return new THREE.ShapeGeometry(sh);
  }
  function buildMobile(R, X) {
    const BED = { x: -0.6, z: -1.3 };
    const g = new THREE.Group(); g.position.set(BED.x + 0.15, 2.45, BED.z + 0.05); R.add(g);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.2, 5), new THREE.MeshBasicMaterial({ color: 0xe8d9ff })); cord.position.y = 0.6; g.add(cord);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.012, 6, 28), new THREE.MeshBasicMaterial({ color: 0xf1e2bd })); ring.rotation.x = Math.PI / 2; g.add(ring);
    const items = [], cols = [0xffd75e, 0x6fe2d6, 0xff9ac8, 0xfff0b8, 0xb89cff], sp = [];
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2, drop = 0.36 + (i % 3) * 0.14, cx = Math.cos(a) * 0.46, cz = Math.sin(a) * 0.46;
      sp.push(cx, 0, cz, cx, -drop, cz);   // iplik (tek LineSegments)
      const hang = new THREE.Group(); hang.position.set(cx, -drop, cz); g.add(hang);
      const col = new THREE.Color(cols[i]).multiplyScalar(1.7);   // (parlaklık eşiğini aşar → hafif ışıma)
      const mesh = new THREE.Mesh(i === 0 ? moonGeo(0.14) : starGeo(0.1 + (i % 2) * 0.03, 0.46), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, fog: false }));
      mesh.position.y = -0.1; hang.add(mesh);
      items.push({ hang, ph: i * 1.3 });
    }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xf5eadc })));
    X.mobile = { g, items };
  }

  // ── Pırıl'ın nefes alan mor ışığı + lamba parıltıları ──
  function buildGlows(R, X) {
    X.texSoft = X.texSoft || radialTex([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,.55)'], [0.6, 'rgba(255,255,255,.12)'], [1, 'rgba(255,255,255,0)']]);
    X.pAura = glowSprite(X.texSoft, 0xb48cff, 1.9, 1.9, 0.55, [-0.25, 0.9, -1.25]); R.add(X.pAura);
    X.pCore = glowSprite(X.texSoft, 0xe6d0ff, 0.8, 0.8, 0.6, [-0.25, 0.9, -1.25]); R.add(X.pCore);
    X.pLight = new THREE.PointLight(0xa97cff, 1.8, 3.6, 1.6); X.pLight.position.set(-0.25, 1.0, -1.1); R.add(X.pLight);
    const lp = [-2.2, 1.0, -1.45];
    X.lamp1 = glowSprite(X.texSoft, 0xffc27a, 1.5, 1.5, 0.75, lp); R.add(X.lamp1);
    X.lamp2 = glowSprite(X.texSoft, 0xff9a52, 4.2, 3.4, 0.22, [lp[0], lp[1] - 0.15, lp[2] - 0.05]); R.add(X.lamp2);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: X.texSoft, color: 0xff9a52, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    pool.position.set(-2.0, 0.075, -0.9); pool.renderOrder = 2; R.add(pool);
  }

  // ── duvar kâğıdı, resimler, yumuşak gölgeler, ek oyuncaklar ──
  function drawLighthouse(c, w, h) {
    c.fillStyle = '#16205a'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) { c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(rnd() * w, rnd() * h * 0.6, 2 + rnd() * 3, 0, 7); c.fill(); }
    c.fillStyle = '#ffeaa0'; c.beginPath(); c.arc(w * 0.78, h * 0.2, 22, 0, 7); c.fill();
    c.fillStyle = '#2b6fd0'; c.fillRect(0, h * 0.78, w, h * 0.22);
    c.fillStyle = '#cfd8ee'; c.beginPath(); c.moveTo(w * 0.4, h * 0.8); c.lineTo(w * 0.47, h * 0.3); c.lineTo(w * 0.57, h * 0.3); c.lineTo(w * 0.64, h * 0.8); c.fill();
    c.fillStyle = '#e8564a'; for (let i = 0; i < 3; i++) { const y0 = h * (0.36 + i * 0.15); c.fillRect(w * (0.455 - i * 0.012) , y0, w * (0.12 + i * 0.024), h * 0.06); }
    c.fillStyle = '#e8564a'; c.beginPath(); c.moveTo(w * 0.45, h * 0.23); c.lineTo(w * 0.52, h * 0.1); c.lineTo(w * 0.59, h * 0.23); c.fill();
    c.fillStyle = '#ffd34a'; c.fillRect(w * 0.47, h * 0.23, w * 0.1, h * 0.07);
    c.strokeStyle = 'rgba(255,230,120,.55)'; c.lineWidth = 6; c.beginPath(); c.moveTo(w * 0.57, h * 0.26); c.lineTo(w * 0.95, h * 0.18); c.stroke();
  }
  function drawDragon(c, w, h) {
    c.fillStyle = '#fff5dc'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffe9b0'; c.fillRect(0, h * 0.78, w, h * 0.22);
    c.fillStyle = '#9b7be8'; c.beginPath(); c.ellipse(w * 0.5, h * 0.58, w * 0.22, h * 0.16, 0, 0, 7); c.fill();
    c.beginPath(); c.arc(w * 0.68, h * 0.4, w * 0.12, 0, 7); c.fill();
    c.fillStyle = '#c7b0ff'; c.beginPath(); c.moveTo(w * 0.4, h * 0.5); c.lineTo(w * 0.22, h * 0.22); c.lineTo(w * 0.55, h * 0.42); c.fill();
    c.fillStyle = '#7ad46a'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(w * (0.35 + i * 0.09), h * 0.45); c.lineTo(w * (0.38 + i * 0.09), h * 0.36); c.lineTo(w * (0.41 + i * 0.09), h * 0.45); c.fill(); }
    c.fillStyle = '#222'; c.beginPath(); c.arc(w * 0.72, h * 0.38, 5, 0, 7); c.fill();
    c.strokeStyle = '#ff7fb0'; c.lineWidth = 5; c.beginPath(); c.arc(w * 0.76, h * 0.45, 14, 0.2, 2.6); c.stroke();
    c.fillStyle = '#ffd34a'; c.beginPath(); c.arc(w * 0.18, h * 0.16, 16, 0, 7); c.fill();
  }
  function buildDecor(R, X) {
    // duvar kâğıdı: yıldız/nokta deseni + üstten karartma + lamba tarafı sıcaklığı
    const wt = canvasTex(1024, 460, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      for (let y = 0; y < 9; y++) for (let x = 0; x < 22; x++) {
        const px = x * 48 + (y & 1 ? 24 : 0) + 10, py = y * 52 + 20;
        c.fillStyle = (x + y) % 3 ? 'rgba(170,200,255,.10)' : 'rgba(255,225,150,.14)';
        c.beginPath(); c.arc(px, py, (x + y) % 3 ? 4 : 6, 0, 7); c.fill();
      }
      const v = c.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(5,8,40,.45)'); v.addColorStop(0.5, 'rgba(5,8,40,0)'); v.addColorStop(1, 'rgba(5,8,40,.25)');
      c.fillStyle = v; c.fillRect(0, 0, w, h);
      const hs = c.createLinearGradient(0, 0, w, 0); hs.addColorStop(0, 'rgba(5,8,40,.35)'); hs.addColorStop(0.3, 'rgba(5,8,40,0)'); hs.addColorStop(0.8, 'rgba(5,8,40,0)'); hs.addColorStop(1, 'rgba(5,8,40,.35)');
      c.fillStyle = hs; c.fillRect(0, 0, w, h);
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(9, 4), new THREE.MeshBasicMaterial({ map: wt, transparent: true, depthWrite: false, fog: false })); wall.position.set(0, 2, -2.896); wall.renderOrder = 0; R.add(wall);
    // duvarın üst uzantısı (dikey ekranda kamera geri çekilince logonun arkasında boş koyu bant kalmasın): aynı nokta deseni, yukarı doğru koyulaşır
    const ut = canvasTex(512, 200, (c, w, h) => {
      c.clearRect(0, 0, w, h); const pm = w / 9;   // piksel / metre (duvar kâğıdıyla aynı desen, kaldığı yerden yukarı)
      for (let y = -1; y >= -8; y--) for (let x = 0; x < 22; x++) {
        const hy = 4 - (20 + y * 52) / 115, py = h - (hy - 4) * (h / 3.5), px = (x * 48 + (y & 1 ? 24 : 0) + 10) / 1024 * w;
        if (py < -4) continue;
        const m3 = ((x + y) % 3 + 3) % 3;
        c.fillStyle = m3 ? 'rgba(170,200,255,.10)' : 'rgba(255,225,150,.14)'; c.beginPath(); c.arc(px, py, (m3 ? 4 : 6) / 1024 * w * 1.0, 0, 7); c.fill();
      }
      const v = c.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(5,8,40,.74)'); v.addColorStop(1, 'rgba(5,8,40,.45)');
      c.fillStyle = v; c.fillRect(0, 0, w, h);
      const hs = c.createLinearGradient(0, 0, w, 0); hs.addColorStop(0, 'rgba(5,8,40,.35)'); hs.addColorStop(0.3, 'rgba(5,8,40,0)'); hs.addColorStop(0.8, 'rgba(5,8,40,0)'); hs.addColorStop(1, 'rgba(5,8,40,.35)');
      c.fillStyle = hs; c.fillRect(0, 0, w, h);
    });
    const upw = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.5), new THREE.MeshBasicMaterial({ map: ut, transparent: true, depthWrite: false, fog: false })); upw.position.set(0, 5.75, -2.896); upw.renderOrder = 0; R.add(upw);
    // çocuk resimleri (bantlı)
    const pic = (draw, x, y, rz, sx, sy) => {
      const g = new THREE.Group(); g.position.set(x, y, -2.855); g.rotation.z = rz; R.add(g);
      const fr = new THREE.Mesh(new THREE.PlaneGeometry(sx + 0.05, sy + 0.05), new THREE.MeshBasicMaterial({ color: 0xfff4dc })); g.add(fr);
      const im = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy), new THREE.MeshBasicMaterial({ map: canvasTex(256, Math.round(256 * sy / sx), draw) })); im.position.z = 0.002; g.add(im);
    };
    pic(drawLighthouse, -2.0, 2.05, 0.06, 0.62, 0.78); pic(drawDragon, -1.25, 1.95, -0.05, 0.6, 0.52);
    // yumuşak yer gölgeleri (yatak, komodin, kıyı minderleri)
    const sh = new THREE.CanvasTexture(canvasTex(64, 64, (c, w, h) => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(10,10,40,.6)'); r.addColorStop(1, 'rgba(10,10,40,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); }).image);
    const bp = [], bu = [], bc = [], bi = [];
    const blob = (x, z, sx, sz, a) => { const n = bp.length / 3; const h = [[-1, -1, 0, 1], [1, -1, 1, 1], [1, 1, 1, 0], [-1, 1, 0, 0]];
      h.forEach(([i, j, u, v]) => { bp.push(x + i * sx / 2, 0.062, z + j * sz / 2); bu.push(u, v); bc.push(1, 1, 1, a); }); bi.push(n, n + 2, n + 1, n, n + 3, n + 2); };
    blob(-0.55, -1.2, 3.1, 2.0, 0.85); blob(-2.2, -1.5, 1.2, 1.0, 0.6); blob(-1.9, 1.5, 1.1, 1.0, 0.45); blob(3.0, 1.2, 1.0, 0.9, 0.4);
    { const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3)); bg.setAttribute('uv', new THREE.Float32BufferAttribute(bu, 2)); bg.setAttribute('color', new THREE.Float32BufferAttribute(bc, 4)); bg.setIndex(bi);
      const bm = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ map: sh, transparent: true, vertexColors: true, depthWrite: false, fog: false })); bm.renderOrder = 2; R.add(bm); }
    // ek oyuncaklar ve yatak süsü
    const k = new Kit(), b = G.box(), rb = G.rbox(2), s = G.sphere(16, 12), cy = G.cyl(1, 1, 20);
    k.add(rb, 0xff9fb8, [0.18, 0.64, -1.3], null, [0.5, 0.06, 1.2]); k.add(rb, 0xffc4d6, [0.18, 0.67, -1.3], null, [0.4, 0.03, 1.1]);   // örgü battaniye
    k.add(s, 0xfff0a0, [-1.05, 0.7, -1.0], null, [0.2, 0.09, 0.2]); k.add(s, 0xc9f0ff, [-1.25, 0.67, -1.55], null, [0.16, 0.08, 0.2]);   // ek yastıklar
    k.add(b, 0xff8f8f, [-2.95, 0.12, -0.55], [0, 0.3, 0], [0.24, 0.24, 0.24]); k.add(b, 0x59c9c0, [-2.65, 0.12, -0.45], [0, -0.2, 0], [0.24, 0.24, 0.24]); k.add(b, 0xffd45a, [-2.8, 0.36, -0.5], [0, 0.5, 0], [0.24, 0.24, 0.24]);   // küpler
    // oyuncak peluş ejderha (turkuaz, yerde)
    const px = 2.8, pz = -1.9, pc = 0x59c9c0;
    k.add(s, pc, [px, 0.28, pz], null, [0.3, 0.28, 0.26]); k.add(s, 0xfff0c8, [px, 0.26, pz + 0.18], null, [0.2, 0.22, 0.1]); k.add(s, pc, [px, 0.62, pz + 0.04], null, [0.2, 0.18, 0.18]);
    k.add(s, 0x25304a, [px - 0.07, 0.65, pz + 0.2], null, 0.025); k.add(s, 0x25304a, [px + 0.07, 0.65, pz + 0.2], null, 0.025); k.add(s, 0xff9fb8, [px, 0.58, pz + 0.22], null, [0.04, 0.025, 0.02]);
    k.add(b, 0xffd45a, [px - 0.08, 0.82, pz + 0.02], [0, 0, 0.7], [0.06, 0.06, 0.06]); k.add(b, 0xffd45a, [px + 0.08, 0.82, pz + 0.02], [0, 0, 0.7], [0.06, 0.06, 0.06]);
    k.add(s, 0xf7a24b, [px - 0.3, 0.38, pz - 0.05], null, [0.14, 0.2, 0.04]); k.add(s, 0xf7a24b, [px + 0.3, 0.38, pz - 0.05], null, [0.14, 0.2, 0.04]);
    // raftaki oyuncak Büyük Fener (hikâyenin ipucu)
    const lx = 2.97, ly = 1.5;
    k.add(cy, 0xf4f0ea, [lx, ly + 0.14, -2.72], null, [0.075, 0.28, 0.075]); k.add(cy, 0xe8564a, [lx, ly + 0.09, -2.72], null, [0.08, 0.07, 0.08]); k.add(cy, 0xe8564a, [lx, ly + 0.22, -2.72], null, [0.07, 0.06, 0.07]);
    k.add(cy, 0x3a3f66, [lx, ly + 0.3, -2.72], null, [0.09, 0.025, 0.09]); k.add(cy, 0xe8564a, [lx, ly + 0.37, -2.72], null, [0.06, 0.05, 0.06]);
    // dikey ekran: duvar yukarı, ahşap zemin öne uzar (oda bitmesin, alt/üst koyu bant olmasın) — aynı ağda, ek çizim yok
    k.add(b, 0x2f4f86, [0, 5.75, -3], null, [9, 3.5, 0.2]); k.add(b, 0x2b4a7c, [-4.4, 5.75, 0], null, [0.2, 3.5, 8]);
    k.add(b, 0xb98f66, [0, -0.05, 8], null, [9, 0.1, 8]);
    for (let i = 0; i < 8; i++) k.add(b, i & 1 ? 0xc29a70 : 0xb08560, [0, 0.003, 4.5 + i], null, [9, 0.004, 0.06]);
    const m = new THREE.Mesh(k.build(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 })); m.receiveShadow = true; R.add(m);
    const lt = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe6a0 })); lt.position.set(lx, ly + 0.325, -2.72); R.add(lt);
    X.toyLH = glowSprite(X.texSoft, 0xffd27a, 0.28, 0.28, 0.5, [lx, ly + 0.325, -2.7]); R.add(X.toyLH);
  }


  // ── sallanan perdeler (pembe, kıvrımlı; rüzgârla alt kenarı yavaşça sallanır) + toplama kurdelesi, pervaz ve saksı ──
  function buildCurtains(R, X) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 } }, transparent: false, side: THREE.DoubleSide, fog: false,
      vertexShader: `uniform float uT; varying vec2 vUv; varying float vF; attribute float sd;
        void main(){ vUv = uv; vec3 p = position; float k = (1.0 - uv.y); k *= k;
          p.x += sd * (sin(uT * 1.1 + p.y * 2.0) * 0.045 + sin(uT * 0.63 + p.y * 3.1) * 0.025) * k;
          p.z += (sin(uT * 0.9 + p.y * 2.4 + sd) * 0.03) * k; vF = sin(uv.x * 18.85);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `varying vec2 vUv; varying float vF;
        void main(){ vec3 c = mix(vec3(1.0, 0.62, 0.80), vec3(1.0, 0.80, 0.90), 0.5 + 0.5 * vF);
          c *= 0.62 + 0.38 * smoothstep(0.0, 1.0, vUv.y + 0.25);
          c = mix(c, vec3(1.0, 0.9, 0.7) * 0.9, smoothstep(0.08, 0.0, vUv.y) * 0.8);
          gl_FragColor = vec4(c, 1.0); }`,
    });
    [-1, 1].forEach(sx => {
      const g = new THREE.PlaneGeometry(0.46, 1.95, 10, 14);
      const n = g.attributes.position.count, sd = new Float32Array(n).fill(sx); g.setAttribute('sd', new THREE.BufferAttribute(sd, 1));
      const m = new THREE.Mesh(g, mat); m.position.set(1.6 + sx * 1.15, 2.28, -2.70); m.renderOrder = 5; R.add(m);
    });
    X.curt = mat;
    // pervaz + küçük saksı (yeşil yapraklı, sıcak)
    const k = new Kit(), b = G.box(), s = G.sphere(14, 10), cy = G.cyl(1, 1, 16);
    k.add(b, 0xd9a566, [1.6, 1.6, -2.70], null, [1.95, 0.07, 0.3]); k.add(b, 0xf3d9a6, [1.6, 1.56, -2.70], null, [1.85, 0.03, 0.26]);
    k.add(cy, 0xe8785a, [1.0, 1.72, -2.68], null, [0.12, 0.14, 0.12]);
    for (let i = 0; i < 5; i++) { const a = i * 1.26; k.add(s, i % 2 ? 0x6fcf6a : 0x4fb85a, [1.0 + Math.cos(a) * 0.07, 1.9 + (i % 3) * 0.04, -2.68 + Math.sin(a) * 0.03], null, [0.08, 0.16, 0.05]); }
    k.add(s, 0xff8fb0, [1.0, 2.05, -2.66], null, 0.045);
    k.add(cy, 0xfff1c9, [2.2, 1.7, -2.68], null, [0.05, 0.14, 0.05]); k.add(s, 0xffd96a, [2.2, 1.81, -2.68], null, 0.045);   // küçük mum fener
    const mm = new THREE.Mesh(k.build(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 })); R.add(mm);
    X.candle = glowSprite(X.texSoft, 0xffc870, 0.5, 0.5, 0.6, [2.2, 1.82, -2.64]); R.add(X.candle);
  }
  // ── süzülen renkli ışık küreleri (yıldız parıltıları; yavaş, yumuşak) ──
  function buildOrbs(R, X) {
    const N = 26, pos = new Float32Array(N * 3), rr = new Float32Array(N * 4); for (let i = 0; i < N * 4; i++) rr[i] = rnd();
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('r', new THREE.BufferAttribute(rr, 4));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uPx: { value: 600 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: `uniform float uT, uPx; attribute vec4 r; varying float vA; varying vec3 vC;
        void main(){ vec3 p = vec3(-3.2 + r.x * 6.0, 0.6 + r.y * 2.2, -2.2 + r.z * 3.4);
          p.x += sin(uT * (0.2 + r.w * 0.2) + r.y * 20.0) * 0.4; p.y = 0.5 + mod(p.y - 0.5 + uT * (0.03 + r.w * 0.04), 2.4);
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          float h = fract(r.x * 7.0); vC = h < 0.33 ? vec3(1.0, 0.85, 0.5) : (h < 0.66 ? vec3(0.6, 0.95, 0.95) : vec3(1.0, 0.7, 0.85));
          vA = (0.5 + 0.5 * sin(uT * (0.5 + r.w) + r.z * 30.0)) * smoothstep(0.0, 0.25, fract((p.y - 0.5) / 2.4)) * smoothstep(1.0, 0.7, fract((p.y - 0.5) / 2.4));
          gl_PointSize = (0.07 + r.w * 0.1) * uPx / max(-mv.z, 0.5); }`,
      fragmentShader: `varying float vA; varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; float d = length(q) * 2.0;
        float star = max(smoothstep(0.09, 0.0, abs(q.x)) * smoothstep(0.5, 0.0, abs(q.y)), smoothstep(0.09, 0.0, abs(q.y)) * smoothstep(0.5, 0.0, abs(q.x)));
        float a = smoothstep(1.0, 0.0, d); a = a * a * 0.5 + star * 0.8; gl_FragColor = vec4(vC * 1.6, a * vA * 0.7); if (gl_FragColor.a < 0.004) discard; }`,
    });
    const p = new THREE.Points(g, mat); p.frustumCulled = false; p.renderOrder = 9; R.add(p); X.orbs = mat;
  }

  // ── kurulum / her kare ──
  function build(room) {
    S.room = room; const X = S.X = {}; const t0 = performance.now();
    try {
      X.texSoft = radialTex([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,.55)'], [0.6, 'rgba(255,255,255,.12)'], [1, 'rgba(255,255,255,0)']]);
      buildSky(room, X); buildShaft(room, X); buildDust(room, X); buildFairy(room, X); buildMobile(room, X); buildGlows(room, X); buildDecor(room, X); buildCurtains(room, X); buildOrbs(room, X);
    } catch (e) { console.warn('BASLIK build', e); }
    if (typeof ATMO !== 'undefined' && ATMO.P) {
      ATMO.P.baslik = { sh: 0x7a6cff, hi: 0xffe4bc, con: 0.26, haze: [0x2c2a78, 0.34, 0.5], rays: [0xffe2b0, 0.12], fog: [1, 1], dust: { n: 1, col: 0xffffff, size: 0.01, mode: 'mote', a: 0, h: 1 } };
      try { ATMO.uygula('baslik'); } catch (e) { /* yok */ }
    }
    S.buildMs = performance.now() - t0;
  }
  function playerPos(out) {
    const g = typeof GAME !== 'undefined' ? GAME : null, B = g && g.Bilbo && g.Bilbo.root;
    if (!B) return false; B.getWorldPosition(out); S.room.worldToLocal(out); return true;
  }
  const _v = typeof THREE !== 'undefined' ? new THREE.Vector3() : null;
  function tick(now) {
    requestAnimationFrame(tick);
    if (off || !hasGL) return;
    const dt = Math.min(0.1, (now - (S.last || now)) / 1000); S.last = now;
    const st = typeof STORY !== 'undefined' ? STORY : null, room = st && st._TS && st._TS.room;
    if (!room || !room.parent) { if (S.room) { S.room = null; S.X = null; } return; }
    if (room !== S.room) build(room);
    if (!room.visible || !S.X) return;
    const X = S.X, T = (S.t += dt);
    tilt.x += (tilt.tx - tilt.x) * Math.min(1, dt * 3); tilt.y += (tilt.ty - tilt.y) * Math.min(1, dt * 3);
    // nokta boyu çizim pikseli cinsinden: iPad'de çözünürlük katsayısıyla çarp (yoksa peri ışıkları/toz tabletlerde küçücük kalır)
    const px = (typeof innerHeight === 'number' ? innerHeight : 800) * (typeof QUALITY !== 'undefined' && QUALITY.dpr > 0 ? Math.min(2, QUALITY.dpr) : 1);
    // gökyüzü, huzme, toz
    if (X.sky) { X.sky.uniforms.uT.value = T; X.sky.uniforms.uPar.value.set(tilt.x * 0.6 + Math.sin(T * 0.12) * 0.15, tilt.y * 0.3);
      const b = Math.pow(Math.max(0, Math.sin(T * 1.25)), 5) * 0.55 * (0.8 + 0.2 * Math.sin(T * 9.0)); X.sky.uniforms.uBeat.value = 0.08 + b; }
    if (X.shaft) { X.shaft.uniforms.uT.value = T; X.shaft.uniforms.uA.value = 1 + 0.15 * Math.sin(T * 0.4); }
    if (X.patch) X.patch.material.opacity = 0.17 + 0.03 * Math.sin(T * 0.4);
    if (X.dust) { X.dust.uniforms.uT.value = T; X.dust.uniforms.uPx.value = px * 1.3; }
    if (X.curt) X.curt.uniforms.uT.value = T;
    if (X.orbs) { X.orbs.uniforms.uT.value = T; X.orbs.uniforms.uPx.value = px * 1.2; }
    if (X.candle) X.candle.material.opacity = 0.5 + 0.12 * Math.sin(T * 4.1) + 0.06 * Math.sin(T * 9.7);
    if (X.fairy) { X.fairy.uniforms.uT.value = T; X.fairy.uniforms.uPx.value = px * 1.4; }
    // mobil
    if (X.mobile) { X.mobile.g.rotation.y = T * 0.28; X.mobile.g.position.y = 2.45; X.mobile.items.forEach(it => { it.hang.rotation.z = Math.sin(T * 0.9 + it.ph) * 0.12; it.hang.rotation.y = -T * 0.28 + Math.sin(T * 0.5 + it.ph) * 0.4; }); }
    // Pırıl'ın ışığı: nefes + (giriş masalında) odayı doldurur
    if (S.fillT >= 0) { S.fillT += dt; S.fill = Math.min(1, S.fillT / 1.1); if (S.fillT > 3.5) { S.fill = 0; S.fillT = -1; } }
    const br = 0.5 + 0.5 * Math.sin(T * 1.7), f = S.fill, e = f * f * (3 - 2 * f);
    if (X.pAura && playerPos(_v)) {
      const hy = _v.y + 0.35;
      X.pAura.position.set(_v.x, hy, _v.z + 0.3); X.pCore.position.set(_v.x, hy, _v.z + 0.35);
      X.pAura.scale.setScalar(2.3 + 0.45 * br + e * 14); X.pAura.material.opacity = 0.62 + 0.25 * br + e * 0.4;
      X.pCore.scale.setScalar(0.7 + 0.15 * br + e * 6); X.pCore.material.opacity = 0.45 + 0.2 * br + e * 0.5;
      X.pLight.position.set(_v.x, hy + 0.3, _v.z + 0.1); X.pLight.intensity = 2.6 + 1.0 * br + e * 14;
    }
    if (X.lamp1) { const fl = 1 + 0.04 * Math.sin(T * 3.1) + 0.03 * Math.sin(T * 7.3); X.lamp1.scale.setScalar(1.5 * fl); X.lamp1.material.opacity = 0.7 * fl; X.lamp2.material.opacity = 0.2 * fl; }
    if (X.toyLH) X.toyLH.material.opacity = 0.2 + 0.45 * Math.max(0, Math.sin(T * 1.25 + 0.4));
  }
  if (hasGL && !off) requestAnimationFrame(tick);

  // ── eğim: fare/dokunma konumuna göre kamera hafifçe kayar (paralaks) ──
  if (typeof addEventListener === 'function') {
    const mv = e => { const w = innerWidth || 1, h = innerHeight || 1; tilt.tx = (e.clientX / w - 0.5) * 2; tilt.ty = (e.clientY / h - 0.5) * 2; };
    addEventListener('pointermove', mv, { passive: true }); addEventListener('pointerdown', mv, { passive: true });
  }

  function doldur() { S.fillT = 0; S.fill = 0; }   // Pırıl'ın ışığı odayı doldurur (giriş masalı: rüyaya geçiş)

  // ── başlık → giriş masalı geçişi: oda yumuşakça kararır, sonra uyuyan Feza'yla yeniden açılır ──
  function perde() {
    let p = document.getElementById('bsPerde');
    if (!p) { p = document.createElement('div'); p.id = 'bsPerde'; document.body.appendChild(p); }
    return p;
  }
  function sarmala() {
    if (typeof STORY === 'undefined' || !STORY.playIntro || STORY._bsWrap) return;
    const orig = STORY.playIntro; STORY._bsWrap = true;
    STORY.playIntro = function () {
      const p = perde(); p.className = 'in';
      return new Promise(res => setTimeout(res, 650)).then(() => {
        const r = orig.apply(STORY, arguments);   // (yeni poz karanlıkta kurulur)
        setTimeout(() => { p.className = 'out'; }, 120);
        setTimeout(() => { if (p.className === 'out') p.className = ''; }, 2200);
        return r;
      });
    };
  }
  sarmala();

  // ── kayıt varken "Baştan Başla": 1,5 sn basılı tutmadan başlamaz (UI'nin eski tek dokunuş/onay kartı devre dışı) ──
  function kayitVar() { const u = typeof UI !== 'undefined' ? UI : null, D = u && u._D; return !!(D && D.contBtn && !D.contBtn.classList.contains('u-hide')); }
  const HOLD = { on: false, t0: 0, raf: 0, btn: null };
  function holdStop(done) {
    if (!HOLD.on) return; HOLD.on = false; cancelAnimationFrame(HOLD.raf);
    const b = HOLD.btn, f = b && b.querySelector('.bs-fill'); if (b) b.classList.remove('bs-hold');
    if (f) f.style.setProperty('--hp', done ? 1 : 0);
    if (!done && b) { b.classList.remove('bs-wiggle'); void b.offsetWidth; b.classList.add('bs-wiggle'); }
  }
  function holdTick() {
    if (!HOLD.on) return; const u = Math.min(1, (performance.now() - HOLD.t0) / 1500), f = HOLD.btn.querySelector('.bs-fill'); if (f) f.style.setProperty('--hp', u);
    if (u >= 1) { holdStop(true); try { UI.startGame(false); } catch (e) { console.warn('BASLIK hold', e); } return; }
    HOLD.raf = requestAnimationFrame(holdTick);
  }
  function holdStart(btn) {
    if (HOLD.on) return; HOLD.on = true; HOLD.btn = btn; HOLD.t0 = performance.now();
    if (!btn.querySelector('.bs-fill')) { const f = document.createElement('span'); f.className = 'bs-fill'; btn.insertBefore(f, btn.firstChild); }
    btn.classList.add('bs-hold'); HOLD.raf = requestAnimationFrame(holdTick);
  }
  if (typeof document !== 'undefined') {
    const isPlay = e => { const D = typeof UI !== 'undefined' && UI._D; return D && D.playBtn && D.playBtn.contains(e.target); };
    const guard = e => { if (isPlay(e) && kayitVar()) { e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); return true; } return false; };
    document.addEventListener('pointerdown', e => { if (guard(e)) holdStart(UI._D.playBtn); }, true);
    ['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, e => { if (HOLD.on) { holdStop(false); guard(e); } }, true));
    ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(n => document.addEventListener(n, guard, true));
    document.addEventListener('keydown', e => {   // klavye yedeği: Enter/Boşluk başlıkta "Devam Et" olur (yeni oyun değil)
      const u = typeof UI !== 'undefined' ? UI : null; if (!u || !u._S || u._S.mode !== 'title' || !kayitVar()) return;
      if (e.code === 'Enter' || e.code === 'Space') { e.stopImmediatePropagation(); e.preventDefault(); if (!e.repeat) u.startGame(true); }
    }, true);
  }

  return { tilt, doldur, S, perde, _build: build };
})();
