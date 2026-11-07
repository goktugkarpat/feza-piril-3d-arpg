/* 03g_atmosfer.js — G2 (ışık/atmosfer): bölüm başına HAVA (mood) ön ayarları.
   ATMO.uygula(bolumId)  → renk ayarı (gölge/ışık tonu, kontrast), uzak sis perdesi, ışık huzmeleri, süzülen ışık tozu (böcek YOK).
   ATMO.kalite = 0 (kapalı) | 1 (orta: toz az, huzme yok) | 2 (tam).  URL: ?atmo=0|1|2.  Çağrı: 06_level.js build (setLighting'ten sonra).
   Renk/sis/huzme alanları 00_core.js'teki POST birleştirme gölgelendiricisinde ("ATMO (G2)" ile işaretli). */
const ATMO = (() => {
  'use strict';
  // sh/hi: gölge/ışık renk çarpanı · con: kontrast · haze: [renk, miktar, başlangıç(0-1 ekran yüksekliği)] · rays: [renk, miktar] · fog: [yakın, uzak çarpanı]
  // dust: {n, col, size, mode: 'mote'|'rise'|'ember'|'fall', a: görünürlük, h: yükseklik aralığı}
  const P = {
    mantar:   { gl: [0, 0x9ff0d8, 0x0c2a5a, 0.34, 0.11], sh: 0x7f8cff, hi: 0xfff0d0, con: 0.22, haze: [0x3f86b0, 0.2, 0.5], rays: [0x9fe8ff, 0.24], fog: [0.7, 0.9],
                dust: { n: 150, col: 0xbffff0, size: 0.11, mode: 'mote', a: 0.9, h: 5 }, orb: { n: 16, cols: [0x7ffff0, 0xffd27a, 0x8fd0ff], size: 0.9, h: [0.8, 3.2] } },
    mercan:   { gl: [1, 0xc8fff0, 0x000000, 0.4, 0.16], sh: 0x4a7cff, hi: 0xb8e8ff, con: 0.24, haze: [0x0e6a96, 0.6, 0.3], rays: [0x9ff4ff, 0.3], fog: [0.4, 0.5],
                dust: { n: 170, col: 0xd8fbff, size: 0.09, mode: 'rise', a: 0.8, h: 6 }, orb: { n: 16, cols: [0xaaf8ff, 0xffb4a0, 0xfff0a0], size: 0.9, h: [1.0, 4.0] } },
    orman:    { gl: [0, 0xfff0a8, 0x143a1a, 0.38, 0.12], sh: 0x8fa0ff, hi: 0xffecc0, con: 0.2, haze: [0xe6d8a8, 0.38, 0.4], rays: [0xfff0b8, 0.34], fog: [0.45, 0.6],
                dust: { n: 120, col: 0xfff2b8, size: 0.1, mode: 'mote', a: 0.85, h: 5 }, orb: { n: 16, cols: [0xfff0a0, 0xb8ff9a, 0xffd0a0], size: 0.9, h: [0.8, 3.0] } },
    degirmen: { gl: [0, 0xffe0a0, 0x7a4a20, 0.18, 0.10], sh: 0xa88cff, hi: 0xffdca0, con: 0.22, haze: [0xffcf9a, 0.2, 0.5], rays: [0xffd89a, 0.32], fog: [0.5, 0.65],
                dust: { n: 110, col: 0xffe6b0, size: 0.1, mode: 'mote', a: 0.8, h: 5 }, orb: { n: 14, cols: [0xffe0a0, 0xfff4d0, 0xffc08a], size: 0.8, h: [0.8, 3.0] } },
    magara:   { gl: [0, 0x6ac8ff, 0x0a1030, 0.30, 0.09], sh: 0x6a78ff, hi: 0xcfe0ff, con: 0.26, haze: [0x16224a, 0.45, 0.4], rays: [0x9fe0ff, 0.2], fog: [0.6, 0.7],
                dust: { n: 140, col: 0xb8d0ff, size: 0.1, mode: 'mote', a: 0.8, h: 4 }, orb: { n: 16, cols: [0x7fe8ff, 0x9fffd0, 0xffe49a], size: 0.9, h: [0.8, 3.0] } },
    mabet:    { gl: [0, 0xdce8ff, 0x2a3a78, 0.24, 0.08], sh: 0x6f84ff, hi: 0xdce8ff, con: 0.24, haze: [0x24366a, 0.4, 0.4], rays: [0xcfe0ff, 0.22], fog: [0.5, 0.6],
                dust: { n: 120, col: 0xdfeaff, size: 0.1, mode: 'fall', a: 0.8, h: 6 } },
    yanardag: { gl: [2, 0xff9a40, 0x5a2010, 0.20, 0.09], sh: 0xa07cff, hi: 0xffd0a0, con: 0.22, haze: [0xff9a68, 0.34, 0.45], rays: [0xffb878, 0.16], fog: [0.55, 0.65],
                dust: { n: 90, col: 0xffa860, size: 0.1, mode: 'ember', a: 0.9, h: 6 } },
    sehir:    { gl: [0, 0xffe0b0, 0x806070, 0.16, 0.08], sh: 0xa890ff, hi: 0xffe0b0, con: 0.22, haze: [0xffc8a0, 0.34, 0.45], rays: [0xffe2b0, 0.22], fog: [0.55, 0.7],
                dust: { n: 90, col: 0xfff0c8, size: 0.09, mode: 'mote', a: 0.7, h: 5 } },
    kale:     { gl: [0, 0xfff6e0, 0x6a6a90, 0.16, 0.08], sh: 0x9aa8ff, hi: 0xfff6e4, con: 0.18, haze: [0xe8e2d6, 0.32, 0.45], rays: [0xfff6dc, 0.22], fog: [0.55, 0.7],
                dust: { n: 80, col: 0xfff8e8, size: 0.09, mode: 'mote', a: 0.7, h: 5 } },
    fener:    { gl: [0, 0xffe8b0, 0x1a2870, 0.26, 0.08], sh: 0x5a6cff, hi: 0xffe8b8, con: 0.28, haze: [0x0e1a44, 0.5, 0.35], rays: [0xffe8a8, 0.3], fog: [0.5, 0.6],
                dust: { n: 130, col: 0xfff0c0, size: 0.1, mode: 'mote', a: 0.85, h: 5 } },
  };
  const S = { kalite: Q.has('atmo') ? clamp(parseInt(Q.get('atmo'), 10) || 0, 0, 2) : (QUALITY.tablet ? 1 : 2), id: null };

  // ── Süzülen ışık tozu: tek çizim çağrısı, konum tamamen GPU'da, oyuncunun çevresinde döner ──
  const N = 170, BOX = 30;
  const geo = new THREE.BufferGeometry();
  {
    const a = new Float32Array(N * 4);
    for (let i = 0; i < N * 4; i++) a[i] = Math.random();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute('r', new THREE.BufferAttribute(a, 4));
    geo.setAttribute('idx', new THREE.BufferAttribute(Float32Array.from({ length: N }, (_, i) => i), 1));
  }
  const U = { uT: TIME.u, uC: { value: new THREE.Vector3() }, uCol: { value: new THREE.Color() }, uSize: { value: 0.1 }, uA: { value: 1 }, uH: { value: 5 }, uMode: { value: 0 }, uN: { value: N }, uPx: { value: 400 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `uniform float uT, uSize, uA, uH, uMode, uN, uPx; uniform vec3 uC; attribute vec4 r; attribute float idx; varying float vA;
      void main() {
        if (idx >= uN) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vA = 0.0; gl_PointSize = 0.0; return; }
        float sp = uMode < 0.5 ? 0.03 : uMode < 1.5 ? 0.35 : uMode < 2.5 ? 0.55 : -0.3;
        vec3 p = vec3(r.x * ${BOX}.0, 0.0, r.y * ${BOX}.0);
        p.xz += vec2(sin(uT * 0.21 + r.w * 40.0), cos(uT * 0.17 + r.z * 40.0)) * 1.2 + vec2(0.15, 0.1) * uT * (uMode > 2.5 ? 0.3 : 0.1);
        float hy = fract(r.z + uT * sp / uH + r.w);
        p.y = 0.25 + hy * uH + sin(uT * 0.6 + r.w * 30.0) * 0.15 * (uMode < 0.5 ? 1.0 : 0.3);
        p.xz = mod(p.xz - uC.xz + ${BOX / 2}.0, ${BOX}.0) - ${BOX / 2}.0 + uC.xz;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.55 + 0.45 * sin(uT * (0.8 + r.x * 1.6) + r.y * 20.0);
        vA = uA * tw * smoothstep(0.0, 0.08, hy) * smoothstep(1.0, 0.8, hy) * (0.5 + 0.5 * r.w);
        gl_PointSize = uSize * (0.6 + r.z * 0.9) * uPx / max(-mv.z, 1.0);
      }`,
    fragmentShader: `uniform vec3 uCol; varying float vA;
      void main() { float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.0, d); a *= a; gl_FragColor = vec4(uCol * 1.6, a * vA); if (gl_FragColor.a < 0.003) discard; }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false; pts.renderOrder = 9; pts.name = 'atmo-toz'; pts.visible = false;
  pts.onBeforeRender = (r) => { const t = CAM.target; U.uC.value.set(t.x, 0, t.z); U.uPx.value = r.domElement.height * 2.2; };
  scene.add(pts);

  // ── Yer ışık alanı: oyuncuyu izleyen tek büyük düzlem, desen dünya koordinatında (kayma yok). Yaprak aralığı/bulut gölgesi lekeleri, su altı ışık ağı, kor titremesi. ──
  const GU = { uT: TIME.u, uC: { value: new THREE.Vector2() }, uL: { value: new THREE.Color() }, uS: { value: new THREE.Color() }, uA: { value: 0 }, uSc: { value: 0.1 }, uM: { value: 0 } };
  const gmat = new THREE.ShaderMaterial({
    uniforms: GU, transparent: true, depthWrite: false, fog: false,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    vertexShader: 'varying vec2 vW; uniform vec2 uC; void main(){ vec3 p = position; p.xz += uC; vW = p.xz; gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }',
    fragmentShader: `uniform float uT, uA, uSc, uM; uniform vec2 uC; uniform vec3 uL, uS; varying vec2 vW;
      float n(vec2 p) { return sin(p.x + sin(p.y * 1.3 + uT * 0.25)) * sin(p.y * 0.9 - sin(p.x * 1.1 - uT * 0.2)); }
      void main() {
        vec2 p = vW * uSc * 6.2832;
        float d = length(vW - uC) / 26.0;
        float edge = smoothstep(1.0, 0.55, d);
        vec3 col; float a;
        if (uM < 0.5) {   // lekeler: parlak (ışık) ve koyu (gölge)
          float f = n(p) * 0.6 + n(p * 2.3 + 4.0) * 0.4;
          float lt = smoothstep(0.0, 0.9, f), sh = smoothstep(0.1, -0.9, f) * 0.7;
          col = mix(uS, uL * 1.5, lt / max(lt + sh, 0.001)); a = (lt * 0.9 + sh) * uA;
        } else if (uM < 1.5) {   // su altı ışık ağı
          vec2 q = p * 2.2; float c = 0.0;
          for (int i = 0; i < 3; i++) { q += vec2(sin(q.y * 1.1 + uT * 0.6), cos(q.x * 1.3 - uT * 0.5)) * 0.6; c += abs(sin(q.x) + sin(q.y)); }
          float w = pow(clamp(1.0 - c / 4.2, 0.0, 1.0), 3.0);
          col = uL * 1.6; a = w * uA * 1.2;
        } else {   // sıcak titreyen havuzlar
          float f = n(p * 1.4 + uT * 0.1); float fl = 0.85 + 0.15 * sin(uT * 3.0 + p.x);
          col = mix(uS, uL * 1.4, smoothstep(0.0, 0.8, f)); a = (smoothstep(0.1, 0.8, abs(f))) * uA * fl;
        }
        gl_FragColor = vec4(col, a * edge);
        if (gl_FragColor.a < 0.004) discard;
      }`,
  });
  const gpl = new THREE.Mesh(new THREE.PlaneGeometry(56, 56, 1, 1).rotateX(-Math.PI / 2).translate(0, 0.045, 0), gmat);
  gpl.frustumCulled = false; gpl.renderOrder = -1; gpl.visible = false; gpl.name = 'atmo-yer';   // saydamların EN ALTI: uyarı halkası/su/iz hep üstünde (aynı sıra numarası kamera kayınca yer değiştirip titriyordu)
  gpl.onBeforeRender = () => { const t = CAM.target; GU.uC.value.set(Math.round(t.x), Math.round(t.z)); };
  scene.add(gpl);


  // ── SİHİR KATMANI (bölüm 1-5): yüzen ışık topları + dev dekor (landmark) + hafif animasyon ──
  const NO = 16, OU = { uT: TIME.u, uC: { value: new THREE.Vector3() }, uPx: { value: 400 }, uSize: { value: 0.9 }, uH: { value: new THREE.Vector2(0.8, 3) }, uN: { value: NO }, uCol: { value: [new THREE.Color(), new THREE.Color(), new THREE.Color()] } };
  const ogeo = new THREE.BufferGeometry();
  { const a = new Float32Array(NO * 4); for (let i = 0; i < a.length; i++) { const v = Math.sin(i * 91.7 + 3.1) * 43758.5453; a[i] = Math.abs(v - Math.floor(v)); }
    ogeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NO * 3), 3)); ogeo.setAttribute('r', new THREE.BufferAttribute(a, 4)); ogeo.setAttribute('idx', new THREE.BufferAttribute(Float32Array.from({ length: NO }, (_, i) => i), 1)); }
  const omat = new THREE.ShaderMaterial({
    uniforms: OU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `uniform float uT, uSize, uN, uPx; uniform vec2 uH; uniform vec3 uC; uniform vec3 uCol[3]; attribute vec4 r; attribute float idx; varying vec3 vC; varying float vA;
      void main() { if (idx >= uN) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; vA = 0.0; vC = vec3(0.0); return; }
        vec3 p = vec3(r.x * 26.0, 0.0, r.y * 26.0);
        p.xz += vec2(sin(uT * 0.23 + r.w * 30.0), cos(uT * 0.19 + r.z * 30.0)) * 1.6;
        p.y = uH.x + r.z * (uH.y - uH.x) + sin(uT * 0.7 + r.w * 20.0) * 0.35;
        p.xz = mod(p.xz - uC.xz + 13.0, 26.0) - 13.0 + uC.xz;
        vec4 mv = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        float k = r.w * 3.0; vC = k < 1.0 ? uCol[0] : k < 2.0 ? uCol[1] : uCol[2];
        vA = 0.5 + 0.5 * sin(uT * (0.7 + r.x) + r.y * 30.0);
        gl_PointSize = uSize * (0.7 + r.x * 0.8) * uPx / max(-mv.z, 1.0); }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main() { float d = length(gl_PointCoord - 0.5) * 2.0; float core = smoothstep(0.3, 0.0, d), halo = pow(smoothstep(1.0, 0.0, d), 2.0);
      gl_FragColor = vec4(vC * (0.7 + core * 1.2), (halo * 0.45 + core * 0.55) * (0.55 + 0.45 * vA)); if (gl_FragColor.a < 0.01) discard; }`,
  });
  const opts = new THREE.Points(ogeo, omat); opts.frustumCulled = false; opts.renderOrder = 10; opts.name = 'atmo-orb'; opts.visible = false; scene.add(opts);
  const anims = [];
  opts.onBeforeRender = (r) => {
    const t = CAM.target; OU.uC.value.set(t.x, 0, t.z); OU.uPx.value = r.domElement.height * 2.2;
    const L = typeof GAME !== 'undefined' ? GAME.L : null;
    if (L && L.group && S.id && S.kalite > 0 && L._lmId !== S.id && L.Z && L.Z.def && L.Z.def.id === S.id) { L._lmId = S.id; anims.length = 0; try { landmarks(L, S.id); } catch (e) { console.warn('ATMO landmark', e); } }
    const tt = TIME.u.value; for (const f of anims) f(tt);
  };
  function landmarks(L, id) {
    const M = (c, e = 0.0) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: e, flatShading: true });
    const B = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, blending: o < 1 ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: o >= 1, fog: true });
    const mesh = (g, m, x, y, z, sx = 1, sy = sx, sz = sx) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return o; };
    const cyl = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n), sph = (n = 10) => new THREE.SphereGeometry(1, n, Math.max(4, n * 0.7 | 0)), cone = (r, h, n = 6) => new THREE.ConeGeometry(r, h, n);
    const halo = (c, r, y) => mesh(new THREE.SphereGeometry(1, 12, 8), B(c, 0.16), 0, y, 0, r);
    const mk = {
      mushroom(g, s, cap, spot) { g.add(mesh(cyl(0.5, 0.8, 4, 8), M(0xf4ecd8, 0.25), 0, 2 * s, 0, s)); g.add(mesh(sph(14), M(cap, 0.55), 0, 4 * s, 0, 2.6 * s, 1.5 * s, 2.6 * s));
        for (let i = 0; i < 7; i++) { const a = i * 2.4; g.add(mesh(sph(6), B(spot), Math.cos(a) * 1.7 * s, 4.9 * s, Math.sin(a) * 1.7 * s, 0.38 * s, 0.2 * s, 0.38 * s)); }
        const h = halo(cap, 3.6 * s, 4 * s); g.add(h); anims.push(t => { h.scale.setScalar(3.6 * s * (1 + 0.06 * Math.sin(t * 1.4 + g.position.x))); }); },
      crystal(g, s, cols) { for (let i = 0; i < 7; i++) { const a = i * 2.4, rr = i ? 1.1 * s : 0, h = (i ? 2.2 + (i % 3) * 0.9 : 5) * s, c = cols[i % cols.length]; const m = mesh(cone(0.55 * s * (i ? 0.8 : 1.2), h, 5), M(c, 0.7), Math.cos(a) * rr, h / 2, Math.sin(a) * rr); m.rotation.z = i ? Math.cos(a) * 0.35 : 0; m.rotation.x = i ? Math.sin(a) * 0.35 : 0; g.add(m); }
        const h = halo(cols[0], 4.5 * s, 2.2 * s); g.add(h); anims.push(t => { h.material.opacity = 0.13 + 0.07 * Math.sin(t * 1.6 + g.position.z); }); },
      tree(g, s) { g.add(mesh(cyl(0.9, 1.6, 7, 8), M(0x8a5a36, 0.05), 0, 3.5 * s, 0, s)); for (const [x, y, z, r, c] of [[0, 9, 0, 4.2, 0x6cc050], [-2.6, 7.4, 0.8, 3, 0x82d058], [2.5, 7.8, -0.6, 3.2, 0x58b048]]) g.add(mesh(sph(10), M(c, 0.2), x * s, y * s, z * s, r * s, r * 0.8 * s, r * s));
        for (let i = 0; i < 14; i++) { const a = i * 2.4; g.add(mesh(sph(5), B(0xfff0a0), Math.cos(a) * (2.5 + i % 3) * s, (6.5 + (i * 7) % 4) * s, Math.sin(a) * (2.5 + i % 3) * s, 0.22 * s)); } const h = halo(0xfff0a0, 6.5 * s, 8 * s); g.add(h); anims.push(t => { h.material.opacity = 0.12 + 0.05 * Math.sin(t + g.position.x); }); },
      sunflower(g, s) { g.add(mesh(cyl(0.14, 0.2, 5, 6), M(0x4a9a3a, 0.1), 0, 2.5 * s, 0, s)); const f = new THREE.Group(); f.position.y = 5.2 * s; f.rotation.x = 1.15; g.add(f);
        f.add(mesh(cyl(1.0 * s, 1.0 * s, 0.25 * s, 14), M(0x6a4020, 0.1), 0, 0, 0)); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; const p = mesh(sph(6), M(0xffd040, 0.5), Math.cos(a) * 1.6 * s, 0, Math.sin(a) * 1.6 * s, 0.7 * s, 0.1 * s, 0.35 * s); p.rotation.y = -a; f.add(p); } anims.push(t => { f.rotation.z = Math.sin(t * 0.6 + g.position.x) * 0.15; }); },
      pinwheel(g, s) { g.add(mesh(cyl(0.12, 0.18, 7, 6), M(0xc8a070, 0.1), 0, 3.5 * s, 0, s)); const w = new THREE.Group(); w.position.set(0, 7 * s, 0.3); g.add(w);
        [0xff8a6a, 0xffd44a, 0x6ad0ff, 0x8aea7a].forEach((c, i) => { const b = mesh(new THREE.BoxGeometry(2.4 * s, 1.1 * s, 0.1 * s), M(c, 0.5), 1.2 * s, 0.5 * s, 0); const pv = new THREE.Group(); pv.rotation.z = i * 1.5708; pv.add(b); w.add(pv); }); anims.push(t => { w.rotation.z = t * 0.9; }); },
      coral(g, s, cols) { for (let i = 0; i < 6; i++) { const a = i * 1.05, h = (3.5 + (i % 3) * 1.4) * s, m = mesh(cone(0.7 * s, h, 7), M(cols[i % cols.length], 0.55), Math.cos(a) * 1.3 * s * (i > 0 ? 1 : 0), h / 2, Math.sin(a) * 1.3 * s * (i > 0 ? 1 : 0)); m.rotation.z = Math.cos(a) * 0.25; g.add(m); g.add(mesh(sph(6), B(0xfff0e0), m.position.x, h + 0.2, m.position.z, 0.4 * s)); }
        const h = halo(cols[0], 4 * s, 3 * s); g.add(h); anims.push(t => { h.scale.setScalar(4 * s * (1 + 0.05 * Math.sin(t * 1.2 + g.position.x))); }); },
      shell(g, s) { g.add(mesh(sph(14), M(0xffc8b0, 0.35), 0, 2.2 * s, 0, 3 * s, 2.2 * s, 2.2 * s));
        const p = mesh(sph(10), B(0xffffff), 0, 4.8 * s, 0, 0.9 * s); g.add(p); const h = halo(0xd8fbff, 2.6 * s, 4.8 * s); g.add(h); anims.push(t => { p.position.y = (4.8 + 0.25 * Math.sin(t * 1.3)) * s; h.position.y = p.position.y; }); },
    };
    const specs = {
      mantar: [['mushroom', 2.0, 0x3fd0c0, 0xfff0b0], ['mushroom', 1.5, 0xffa040, 0xfff6d0], ['mushroom', 1.7, 0x4aa0ff, 0xd8ffff]],
      mercan: [['coral', 1.7, [0xff8a7a, 0xffb060, 0xff7aa0]], ['shell', 1.6], ['coral', 1.4, [0x7affd0, 0x6ad0ff, 0xffe070]]],
      orman: [['tree', 1.1], ['sunflower', 1.3], ['tree', 0.9]],
      degirmen: [['sunflower', 1.7], ['pinwheel', 1.5], ['sunflower', 1.4]],
      magara: [['crystal', 1.8, [0x5ad8ff, 0x7affc8, 0x5aa8ff]], ['crystal', 1.4, [0xffe08a, 0x7affc8, 0x5ad8ff]], ['crystal', 1.6, [0x7affc8, 0x5ad8ff]]],
    }[id];
    if (!specs) return;
    const P = L.path && L.path.length > 12 ? L.path : null, fl = (x, z) => { const i = Math.floor(x), j = Math.floor(z); return i >= 0 && j >= 0 && i < L.W && j < L.H && L.grid[j * L.W + i] === 1; };
    const wall = (x, z, r) => { for (let a = 0; a < 8; a++) if (fl(x + Math.cos(a * 0.785) * r, z + Math.sin(a * 0.785) * r)) return false; return !fl(x, z); };
    const used = []; let placed = 0;
    const south = (x, z, m = 16) => { for (let q = 1; q <= m; q += 2) for (const o of [-6, -3, 0, 3, 6]) if (fl(x + o, z - q) || fl(x + o, z + q)) return true; return false; };   // kamera güneyden (+z) bakar: yürünür alanın önünde veya dibinde olmasın
    specs.forEach((sp, k) => {
      const fr = [0.18, 0.5, 0.8][k], base = P ? P[Math.floor(P.length * fr)] : { x: L.W * (0.25 + 0.25 * k), z: L.H * 0.5 }, cl = 3.5 + sp[1] * 1.5;
      for (let pass = 0; pass < 2 && placed <= k; pass++) for (let d = 5; d < 34 && placed <= k; d += 1) for (let a = 0; a < 16 && placed <= k; a++) {
        const ang = a * 0.3927 + k, x = base.x + Math.cos(ang) * d, z = base.z + Math.sin(ang) * d;
        if (x < 1 || z < 1 || x > L.W - 1 || z > L.H - 1 || !wall(x, z, cl) || !wall(x, z, cl * 0.5) || south(x, z, pass === 0 ? 14 : 8) || used.some(u => Math.hypot(u.x - x, u.z - z) < 14)) continue;
        const g = new THREE.Group(); g.name = 'atmo-lm'; g.position.set(x, 0, z); g.rotation.y = Math.random() * 6; g.scale.setScalar(0.62); mk[sp[0]](g, sp[1], sp[2], sp[3]); L.group.add(g); used.push({ x, z }); placed++;
      }
    });
    L._lmN = placed;
  }

  function uygula(id) {
    const p = P[id]; S.id = id;
    const g = POST.grade;
    if (!p || S.kalite === 0) { opts.visible = false; g.on = 0; g.rays = 0; pts.visible = false; gpl.visible = false; return; }
    g.on = 1; g.sh.set(p.sh); g.hi.set(p.hi); g.con = p.con; g.haze.set(p.haze[0]); g.hazeAmt = p.haze[1] * 0.3; g.hazeFrom = p.haze[2];
    g.rayCol.set(p.rays[0]); g.rays = S.kalite >= 2 ? p.rays[1] * 0.7 : 0;
    if (scene.fog) { scene.fog.near = Math.max(8, scene.fog.near * p.fog[0] * 1.8); scene.fog.far = Math.max(scene.fog.near + 20, scene.fog.far * p.fog[1] * 1.8); }
    if (p.gl) { gpl.visible = true; GU.uM.value = p.gl[0]; GU.uL.value.set(p.gl[1]); GU.uS.value.set(p.gl[2]); GU.uA.value = p.gl[3] * (S.kalite >= 2 ? 0.5 : 0.4); GU.uSc.value = p.gl[4]; } else gpl.visible = false;
    const o = p.orb; opts.visible = !!o && S.kalite >= 1; if (o) { OU.uN.value = Math.round(o.n * (S.kalite >= 2 ? 1 : 0.6)); OU.uSize.value = o.size; OU.uH.value.set(o.h[0], o.h[1]); o.cols.forEach((c, i) => OU.uCol.value[i].set(c)); }
    const d = p.dust;
    pts.visible = true;
    U.uN.value = Math.round(d.n * (S.kalite >= 2 ? 1 : 0.5)); U.uCol.value.set(d.col); U.uSize.value = d.size; U.uA.value = d.a; U.uH.value = d.h;
    U.uMode.value = { mote: 0, rise: 1, ember: 2, fall: 3 }[d.mode];
  }
  return { uygula, kalite: (q) => { S.kalite = q; uygula(S.id); }, P, S, pts };
})();
