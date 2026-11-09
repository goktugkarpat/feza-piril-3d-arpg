/* ── Bölüm 1: Işıklı Mantar Vadisi (Feza ile Pırıl) ──
   Alacakaranlıkta dev, parlayan mantarlar vadisi. İlk bölüm: oyuncuyu nazikçe öğretir (ilk oda huysuzsuz, sonra tek tük Zıp Mantarcık).
     1. Parıltı Çayırı      yumuşak yosun, minik ışıklı mantar kümeleri, şarkı söyleyen mantarlar (hepsine dokun, sıra yok → ezgi + şeker)
     2. Dev Mantar Ormanı   dev şemsiye mantarlar, raf mantarı merdivenleri, ZIPLATAN MANTARLAR (Feza'yı yay çizerek fırlatır)
     3. Işıklı Dere         ışıl ışıl akan sığ dere (içinden yürünür: su sıçrar), yosunlu taşlar, mantar köprüsü, basamak taşları
     4. Kök Tünelleri       dev kök kemerleri altında, asılı ışıklı yosun damlaları, dev yaprak altları
     Arena: Pofuduk Çayırı — dev mantar çemberi, peri halkası; Koca Pofuduk Mantar (src/05z_mantar.js). Işık: isik1.
   Gizli köşeler: Peri Halkası (yan odada: ortasına basınca mantarlar sırayla yanar → altın şeker + çıkartma), yarı gömülü ışıklı
   palamut hazineleri, tekmelenince parıltı saçan pofuduk toplar. Atmosfer: süzülen ışık tozları (sporlar; böcek DEĞİL, tek çizim,
   gölgelendiricide hareket), dere tınısı, damla sesleri.
   Genel ad: MANTAR. Sesler: SES'e istek (pr_mantar_*, pp_mantar_*). Biçim: PIRIL.md › 5, src/SPEC.md › kur api. */
const MANTAR = (() => {
  'use strict';
  const PI = Math.PI;
  const hyp = Math.hypot;
  const OK = () => typeof ODAKIT !== 'undefined' && ODAKIT;
  const inZone = () => typeof GAME !== 'undefined' && GAME.L && GAME.L.Z && GAME.L.Z.id === 'mantar';
  const live = () => typeof GAME !== 'undefined' && GAME.state === 'play' && !GAME.paused && GAME.P && !GAME.P.dead;
  const said = new Set();
  let sayAt = -99;
  // anlatıcı / Pırıl cümlesi (kayıt yoksa susar): once → oyun başına bir kez; arada en az 6 s
  function say(key, o = {}) {
    if (typeof GAME === 'undefined' || !GAME.halaApi) return false;
    if (!(typeof AUD !== 'undefined' && AUD.LINES && AUD.LINES[key])) return false;
    if (o.once !== false && said.has(key)) return false;
    const now = GAME.time || 0;
    if (now - sayAt < (o.gap ?? 6)) return false;
    sayAt = now; said.add(key);
    try { GAME.halaApi.say(key, o.prio || 2); } catch (e) { return false; }
    return true;
  }
  const sfx = (n, o) => { try { if (typeof AUD !== 'undefined' && AUD.sfx) AUD.sfx(n, o); } catch (e) { /* yok */ } };
  const burst = (k, x, y, z, o) => { try { if (typeof FX !== 'undefined' && FX.burst) FX.burst(k, x, y, z, o); } catch (e) { /* yok */ } };

  // Pırıl'a dokunma bildirimi (04_piril_guc.js sfx 'pirilKikir' / 'pirilPuf' çalar): öğretici adımlar için dinlenir
  let tapFn = null;
  if (typeof AUD !== 'undefined' && AUD && AUD.sfx && !AUD.__mzWrap) {
    const o = AUD.sfx; AUD.__mzWrap = 1;
    AUD.sfx = function (n, ...a) { if (tapFn && (n === 'pirilKikir' || n === 'pirilPuf')) { try { tapFn(n); } catch (e) { /* yok */ } } return o.apply(this, [n, ...a]); };
  }
  // ── Renkler ──
  const CAPS = [[0xff7ec8, 0xffc8ec], [0x6fa8ff, 0xc8e0ff], [0x5fd8e8, 0xc8f8ff], [0xffa86a, 0xffe0b8], [0x7fe0b0, 0xd0ffe8]];   // GÜZEL: mor yalnız Pırıl'ın
  const GLOWC = [0xa8fff4, 0xfff0a0, 0xffb8f0, 0xc8ffa0, 0x9ac8ff];
  const STEM = [0xf6ecdf, 0xf2ecd8, 0xe8f0e4];
  const MOSS = [0x3f8a5a, 0x4a9a62, 0x357a58, 0x5aa86a];

  // ── Geometriler (bölüm kurulurken; süse birleşince atılır) ──
  function lathe(THREE, pts, seg) { return new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg); }
  const STEM_P = [[0.0, 0], [0.55, 0], [0.62, 0.05], [0.5, 0.25], [0.42, 0.6], [0.4, 0.9], [0.44, 1.0], [0, 1.0]];   // birim boy
  const CAP_P = [[0, -0.02], [0.55, -0.04], [0.92, 0.0], [1.0, 0.1], [0.94, 0.3], [0.72, 0.52], [0.4, 0.66], [0, 0.7]];
  const SHELF_P = [[0, 0], [0.9, -0.02], [1.0, 0.04], [0.85, 0.12], [0.4, 0.16], [0, 0.17]];
  function leafGeo(THREE) {   // dev yaprak: ortası kavisli, ucu sivri; sapı orijinde, +z'ye uzanır
    const g = new THREE.SphereGeometry(1, 12, 6), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const u = (z + 1) / 2, w = Math.sin(Math.min(1, u * 1.15) * PI) * (1 - 0.35 * u) + 0.05;
      x *= w * 0.55; y *= 0.04; z = u * 1.6;
      y += 0.3 * Math.sin(u * PI * 0.9) - 0.2 * x * x;
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals(); return g;
  }
  function frondGeo(THREE) {   // eğrelti yaprağı (sallanır: uv.x = 30 → süs gölgelendiricisinin rüzgâr dalı)
    const g = new THREE.SphereGeometry(1, 5, 3), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const u = (z + 1) / 2, w = (0.25 + 0.75 * Math.sin(u * PI)) * (1 - 0.6 * u);
      x *= 0.18 * w; y = y * 0.02 + 0.9 * Math.sin(u * PI * 0.75) - 0.4 * u * u; z = u * 1.3;
      p.setXYZ(i, x, y, z); uv.setXY(i, 30, u);
    }
    g.computeVertexNormals(); return g;
  }

  // ── Süzülen ışık tozları: tek Points, hareket gölgelendiricide (her kare yalnız zaman) ──
  function motes(api, L, n, o) {
    const THREE = api.THREE, pos = new Float32Array(n * 3), ph = new Float32Array(n), cl = new Float32Array(n * 3), sz = new Float32Array(n);
    const pal = o.cols.map(c => new THREE.Color(c));
    let k = 0;
    for (let i = 0; i < n * 6 && k < n; i++) {
      const rm = L.rooms[(Math.random() * L.rooms.length) | 0], a = Math.random() * TAU, d = Math.sqrt(Math.random()) * (rm.r + 4);
      const x = rm.x + Math.sin(a) * d, z = rm.z + Math.cos(a) * d;
      pos[k * 3] = x; pos[k * 3 + 1] = o.y0 + Math.random() * 0.5; pos[k * 3 + 2] = z;
      ph[k] = Math.random(); sz[k] = o.size * (0.6 + Math.random() * 0.8);
      const c = pal[k % pal.length]; cl[k * 3] = c.r; cl[k * 3 + 1] = c.g; cl[k * 3 + 2] = c.b; k++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, k * 3), 3));
    g.setAttribute('aPh', new THREE.BufferAttribute(ph.subarray(0, k), 1));
    g.setAttribute('aCol', new THREE.BufferAttribute(cl.subarray(0, k * 3), 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz.subarray(0, k), 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: TIME.u, uRise: { value: o.rise }, uH: { value: o.h }, uK: { value: o.k || 1 } },
      vertexShader: `attribute float aPh; attribute vec3 aCol; attribute float aSize; uniform float uTime, uRise, uH; varying vec3 vC; varying float vA;
        void main() {
          vec3 p = position; float h = mod(uTime * uRise + aPh * uH, uH), t = uTime * 0.35 + aPh * 6.2831;
          p.y += h; p.x += sin(t * 1.3 + aPh * 9.0) * 0.7; p.z += cos(t * 1.1 + aPh * 5.0) * 0.7;
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          float u = h / uH; vA = smoothstep(0.0, 0.12, u) * (1.0 - smoothstep(0.7, 1.0, u)) * (0.55 + 0.45 * sin(uTime * 2.6 + aPh * 31.0));
          gl_PointSize = aSize * (320.0 / max(1.0, -mv.z)); vC = aCol;
        }`,
      fragmentShader: `uniform float uK; varying vec3 vC; varying float vA;
        void main() { vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; float a = max(0.0, 1.0 - r); a = a * a * (0.6 + 0.4 * (1.0 - smoothstep(0.0, 0.25, r)));
          gl_FragColor = vec4(vC * a * vA * uK, a * vA); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 5; pts.name = 'mantar-isik-tozu';
    api.add(pts); api.dispose(m); api.dispose(g);
    return pts;
  }

  // ── Işıklı dere: şerit geometri + akan ışık gölgelendiricisi ──
  function streamMesh(api, pts, w) {
    const THREE = api.THREE, curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], 0, p[1])));
    const N = Math.max(12, Math.round(curve.getLength() * 1.5)), sp = curve.getSpacedPoints(N);
    const pos = [], uv = [], idx = []; let len = 0;
    for (let i = 0; i <= N; i++) {
      const a = sp[Math.max(0, i - 1)], b = sp[Math.min(N, i + 1)], dx = b.x - a.x, dz = b.z - a.z, l = hyp(dx, dz) || 1, nx = -dz / l, nz = dx / l;
      if (i > 0) len += sp[i].distanceTo(sp[i - 1]);
      const ww = w * (0.85 + 0.15 * Math.sin(i * 0.7));
      pos.push(sp[i].x + nx * ww, 0.035, sp[i].z + nz * ww, sp[i].x - nx * ww, 0.035, sp[i].z - nz * ww);
      uv.push(len, 0, len, 1);
      if (i < N) { const q = i * 2; idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: TIME.u },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uTime; varying vec2 vUv;
        void main() {
          float e = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
          float f = sin(vUv.x * 1.1 - uTime * 1.8 + sin(vUv.y * 6.0 + vUv.x * 0.6) * 1.4) * 0.5 + 0.5;
          float g = sin(vUv.x * 2.7 - uTime * 2.6 + vUv.y * 3.0) * 0.5 + 0.5;
          float sp = pow(max(0.0, sin(vUv.x * 6.3 - uTime * 3.1 + vUv.y * 13.0) * sin(vUv.x * 2.9 + uTime * 1.4 - vUv.y * 9.0)), 10.0);
          vec3 c = mix(vec3(0.04, 0.22, 0.42), vec3(0.2, 0.85, 1.0), f * 0.55 + g * 0.2) + vec3(1.0, 1.0, 0.9) * sp * 0.25;
          float rim = (1.0 - smoothstep(0.05, 0.3, vUv.y)) + (smoothstep(0.7, 0.95, vUv.y));
          c += vec3(0.5, 1.0, 0.9) * rim * e * 0.35;
          gl_FragColor = vec4(c * 0.8, e * 0.85);   // SADE: dere sakin, göz almasın
        }`,
      transparent: true, depthWrite: false,
    });
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 1; mesh.name = 'mantar-dere';
    api.add(mesh); api.dispose(m); api.dispose(g);
    return { mesh, sp };
  }

  // ── Alacakaranlık vadisi zemini: koyu turkuaz-mor yosun (gölgelendiricide gürültü), içinde ışıklı benekler; yollar hafif parıltılı
  //    lavanta çakıl. Katman dokusu (r: yol, g: yürünür) ızgaradan; motorun zemini gizlenir, pişmiş ışık havuzları (tGlow) paylaşılır. ──
  function floor(L, api) {
    if (typeof ZEMIN !== 'undefined') { const z = ZEMIN.kur(L, api, 'mantar'); if (z) return z.mesh; }   // G1: ortak zemin kiti (eski gölgelendirici yedek)
    const THREE = api.THREE, pad = 16, ppm = 2, W = L.W + pad * 2, H = L.H + pad * 2, tw = W * ppm, th = H * ppm;
    const raw = new Float32Array(tw * th * 2), tmp = new Float32Array(tw * th * 2);
    for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) {
      const gi = Math.floor((i + 0.5) / ppm - pad), gj = Math.floor((j + 0.5) / ppm - pad);
      raw[(j * tw + i) * 2 + 1] = gi >= 0 && gj >= 0 && gi < L.W && gj < L.H && L.grid[gj * L.W + gi] ? 1 : 0;
    }
    const P = L.path || [], R = 0.95;
    for (let k = 1; k < P.length; k++) {   // yol: segmentler boyunca disk damgası
      const a = P[k - 1], b = P[k], l = hyp(b.x - a.x, b.z - a.z), n = Math.max(1, Math.ceil(l / 0.4));
      for (let q = 0; q <= n; q++) {
        const x = a.x + (b.x - a.x) * q / n, z = a.z + (b.z - a.z) * q / n;
        for (let j = Math.floor((z - R + pad) * ppm); j <= (z + R + pad) * ppm; j++) for (let i = Math.floor((x - R + pad) * ppm); i <= (x + R + pad) * ppm; i++) {
          if (i < 0 || j < 0 || i >= tw || j >= th) continue;
          const dx = (i + 0.5) / ppm - pad - x, dz = (j + 0.5) / ppm - pad - z;
          if (dx * dx + dz * dz < R * R) raw[(j * tw + i) * 2] = 1;
        }
      }
    }
    for (let it = 0; it < 2; it++) {
      tmp.set(raw);
      for (let j = 1; j < th - 1; j++) for (let i = 1; i < tw - 1; i++) {
        const o = (j * tw + i) * 2;
        for (let c = 0; c < 2; c++) { let sum = 0; for (let bb = -1; bb <= 1; bb++) for (let aa = -1; aa <= 1; aa++) sum += tmp[o + (bb * tw + aa) * 2 + c]; raw[o + c] = sum / 9; }
      }
    }
    const data = new Uint8Array(tw * th * 4);
    for (let k = 0, n = tw * th; k < n; k++) { data[k * 4] = Math.round(raw[k * 2] * 255); data[k * 4 + 1] = Math.round(raw[k * 2 + 1] * 255); data[k * 4 + 3] = 255; }
    const lay = new THREE.DataTexture(data, tw, th, THREE.RGBAFormat);
    lay.magFilter = lay.minFilter = THREE.LinearFilter; lay.needsUpdate = true; api.dispose(lay);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.94, metalness: 0 });
    const eng = api.floor && api.floor.material && api.floor.material.userData.u;
    const U = { tLay: { value: lay }, uLay: { value: new THREE.Vector4(pad, pad, 1 / W, 1 / H) }, uTime: TIME.u,
      tGlowM: eng && eng.tGlow ? eng.tGlow : { value: null }, uGInv: { value: new THREE.Vector2(1 / L.W, 1 / L.H) } };
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = 'varying vec3 vMzW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvMzW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = `varying vec3 vMzW; uniform sampler2D tLay, tGlowM; uniform vec4 uLay; uniform vec2 uGInv; uniform float uTime;
        float mzH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float mzN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mzH(i), mzH(i + vec2(1.0, 0.0)), f.x), mix(mzH(i + vec2(0.0, 1.0)), mzH(i + vec2(1.0, 1.0)), f.x), f.y); }
        vec3 mzE = vec3(0.0);
        ` + sh.fragmentShader
        .replace('#include <map_fragment>', `vec4 mzL = texture2D(tLay, (vMzW.xz + uLay.xy) * uLay.zw);
          vec2 p = vMzW.xz;
          float n1 = mzN(p * 0.18), n2 = mzN(p * 0.9 + 3.1), n3 = mzN(p * 3.3 + 7.7);
          // yosun: turkuaz ↔ mor lekeler, ince tüylü doku, yumuşak tümsekler
          // GÜZEL: lekeler yok — düz, sakin koyu mor-mavi zemin; yalnız çok yumuşak geniş ton dalgası ve ince doku
          vec3 moss = mix(vec3(0.045, 0.19, 0.20), vec3(0.065, 0.24, 0.24), smoothstep(0.2, 0.8, n1));   // ZEMİN2: iki tonlu geniş dalga (±%8)
          // ZEMİN2: yosun benekleri ≈%18 açık, yeşil-turkuaz; ara ara küçük yosun öbekleri; ince toprak lifleri ≈%14 koyu (hareketsiz, parıltısız)
          float mzSpk = smoothstep(0.55, 0.72, mzN(p * 3.2 + 1.7));
          // (benek/leke yok: sakin zemin)
          float mzClu = smoothstep(0.72, 0.86, mzN(p * 0.55 + 9.3)) * smoothstep(0.45, 0.7, mzN(p * 5.5 + 3.1));   // seyrek yosun öbekleri
          
          float mzFib = smoothstep(0.86, 1.0, abs(sin(dot(p, vec2(0.6, 1.1)) * 7.0 + n2 * 5.0)));
          
          moss *= 0.93 + 0.08 * n3;
          // yol: lavanta çakıl (yuvarlak taşçıklar)
          vec2 cg = p * 2.6, ci = floor(cg); vec2 co = fract(cg) - 0.5 - (vec2(mzH(ci + 1.3), mzH(ci + 5.1)) - 0.5) * 0.5;
          float peb = smoothstep(0.42, 0.18, length(co));
          vec3 path = mix(vec3(0.50, 0.40, 0.22), vec3(0.64, 0.52, 0.31), peb * (0.6 + 0.4 * mzH(ci))) * (0.95 + 0.1 * n2);
          float wPath = smoothstep(0.25, 0.75, mzL.r) * mzL.g;
          vec3 col = mix(moss, path, wPath);
          col *= mix(0.3, 1.0, smoothstep(0.1, 0.9, mzL.g));   // yürünmez alan daha koyu
          diffuseColor.rgb *= col;
          // ışıklı benekler (yosunda), yolun ortasında akan yumuşak parıltı
          vec2 sg = p * 1.7, si = floor(sg); float sh = mzH(si);
          vec2 so = fract(sg) - 0.5 - (vec2(mzH(si + 7.1), mzH(si + 3.3)) - 0.5) * 0.6;
          // SADE: benekler seyrek, sönük ve sakin (yanıp sönme yok); yol üstünde hiç yok
          float sp = smoothstep(0.06, 0.0, length(so)) * step(0.9, sh) * 0.8;   // GÜZEL: seyrek, küçük
          vec3 spc = mix(vec3(0.5, 1.0, 0.9), mix(vec3(1.0, 0.85, 0.45), vec3(1.0, 0.6, 0.95), step(0.86, sh)), step(0.8, sh));
          mzE = vec3(0.0);
          mzE += vec3(0.75, 0.6, 0.3) * wPath * 0.05;   // yol: sabit, hafif aydınlık (akış/parıltı yok → net okunur)`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          vec3 mzG = texture2D(tGlowM, vMzW.xz * uGInv).rgb * 3.0;
          totalEmissiveRadiance += mzE + mzG * (diffuseColor.rgb + 0.07);`);
    };
    mat.customProgramCacheKey = () => 'mantar-zemin'; mat.userData.U = U;
    api.dispose(mat);
    const g = new THREE.PlaneGeometry(W + 80, H + 80); g.rotateX(-PI / 2); g.translate(L.W / 2, 0, L.H / 2); api.dispose(g);
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.name = 'mantar-zemin'; m.position.y = -0.002;
    api.add(m);
    if (api.floor) api.floor.visible = false;
    return m;
  }

  // ════════════════ Yerleşim (saf veri) ════════════════
  function yerlesim(L, api) {
    // (taban 'forest' köy meydanı kurar: evler, kuyu, fenerler, çiçek yatakları — vadide yok; baykuş tüccar kütüğünde kalır)
    if (L.village) { L.village = null; L.solids = (L.solids || []).filter(s => !['well', 'lamp', 'bed', 'fence', 'house', 'sign'].includes(s.tag)); }
    const A = L.areas || [], room = (ai, k = 0) => { const a = A[ai]; return a && !a.boss ? L.rooms[a.rooms[Math.min(k, a.rooms.length - 1)]] : null; };
    const areaOf = {}; A.forEach((a, k) => { if (!a.boss) a.rooms.forEach(ri => { areaOf[ri] = k; }); });
    // Nazik öğretim: başlangıç odasında huysuz yok; 1. alanda yalnız Zıp Mantarcık (grup en çok 2); sonra türler yavaş yavaş gelir
    const LIST = [['zipMantarcik'], ['zipMantarcik', 'tohumTopaci', 'sporPofudugu', 'zipMantarcik'], ['yosunTopu', 'sporPofudugu', 'zipMantarcik', 'tohumTopaci'], ['tohumTopaci', 'yosunTopu', 'sporPofudugu', 'zipMantarcik']];
    const CAP = [0, 2, 3, 2], packN = {}, keep = [];   // GÜZEL2: sis tünelinde (4. alan) grup en çok 2: sis + Pırıl anı sırasında etrafı huysuzla dolmasın
    for (const sp of L.spawns || []) {
      const ai = areaOf[sp.room];
      if (sp.room === 0) continue;
      if (ai === undefined) { keep.push(sp); continue; }   // (yan odalar / arena: olduğu gibi)
      const n = packN[sp.pack] = (packN[sp.pack] || 0) + 1;
      if (n > CAP[ai]) continue;
      if (sp.type === 'altinMantarcik') { if (ai === 0) sp.type = 'zipMantarcik'; keep.push(sp); continue; }
      const list = LIST[Math.min(ai, LIST.length - 1)];
      sp.type = list[(n - 1 + sp.pack) % list.length];
      if (ai === 0) sp.elite = false;
      if (sp.elite && sp.type !== 'zipMantarcik' && sp.type !== 'yosunTopu') sp.type = ai >= 2 ? 'yosunTopu' : 'zipMantarcik';
      delete sp.variant;
      keep.push(sp);
    }
    // Uykulu Mantarcık: sis tünelinde (4. alan, ikinci oda) uyuyakalmış 2 mantarcık
    { const a4s = A[3], r4 = a4s && !a4s.boss ? L.rooms[a4s.rooms[Math.min(1, a4s.rooms.length - 1)]] : null;
      if (r4) { let n = 0; const ri = L.rooms.indexOf(r4);
        for (const sp of keep) if (sp.room === ri && !sp.elite && n < 2) { sp.type = 'uykuluMantarcik'; n++; }
        for (let t = 0; n < 2 && t < 60; t++) { const a = api.rnd() * TAU, d = r4.r * (0.35 + api.rnd() * 0.4), x = r4.x + Math.sin(a) * d, z = r4.z + Math.cos(a) * d;
          if (api.isFloor(x, z) && api.circleFree(x, z, 0.8)) { keep.push({ type: 'uykuluMantarcik', x, z, room: ri, pack: 99 + n }); n++; } } } }
    // her alanda en az bir tür tanıtımı: 2. alanın ilk grubunda Tohum Topacı, 3. alanda Yosun Topu, Spor Pofuduğu
    L.spawns.length = 0; L.spawns.push(...keep);
    const spot = (rm, dx, dz, r = 1) => {
      if (!rm) return null;
      for (let t = 0; t < 24; t++) {
        const x = rm.x + dx + (t ? (api.rnd() - 0.5) * t * 0.4 : 0), z = rm.z + dz + (t ? (api.rnd() - 0.5) * t * 0.4 : 0);
        if (api.isFloor(x, z) && api.circleFree(x, z, r)) return { x, z };
      }
      return null;
    };
    // zıplatan mantarlar: 2. alanın odalarında üçlü halka (her biri bir sonrakine fırlatır)
    L.mzPads = [];
    for (const k of [0, 1]) {
      const rm = room(1, k); if (!rm) continue;
      const a0 = api.rnd() * TAU, R = Math.min(4.2, rm.r * 0.6), grp = [];
      for (let i = 0; i < 3; i++) { const a = a0 + i / 3 * TAU, p = spot(rm, Math.sin(a) * R, Math.cos(a) * R, 1.1); if (p) grp.push(p); }
      if (grp.length >= 2) grp.forEach((p, i) => L.mzPads.push({ x: p.x, z: p.z, to: grp[(i + 1) % grp.length], g: k }));
    }
    // şarkı söyleyen mantarlar (1. alanın 2. odası, kenara yakın sıra)
    L.mzSing = [];
    { const rm = room(0, 1);
      if (rm) { const a = api.rnd() * TAU, R = rm.r * 0.55; for (let i = 0; i < 5; i++) { const b = a + (i - 2) * 0.32, p = spot(rm, Math.sin(b) * R, Math.cos(b) * R, 0.6); if (p) L.mzSing.push(p); } } }
    // ışıklı dere: 3. alanın her odasını yoldan dik keserek geçer
    L.mzStreams = [];
    for (const k of [0, 1]) {
      const rm = room(2, k); if (!rm) continue;
      const ri = L.rooms.indexOf(rm), nb = L.rooms[ri + 1] || L.rooms[ri - 1];
      const dx = nb.x - rm.x, dz = nb.z - rm.z, l = hyp(dx, dz) || 1, nx = -dz / l, nz = dx / l, R = rm.r + 7, pts = [];
      for (let i = 0; i <= 8; i++) { const u = i / 8 * 2 - 1, wig = Math.sin(u * 3.1 + k) * 1.4; pts.push([rm.x + nx * u * R + dx / l * wig, rm.z + nz * u * R + dz / l * wig]); }
      L.mzStreams.push({ pts, room: ri, w: 1.15 });
    }
    // peri halkası (yan odada; yoksa 2. alanın son odasının kenarında)
    const side = L.rooms.filter(r => r.kind === 'side');
    L.mzRing = null;
    for (const rm of [side[0], side[1], room(1, 1), room(2, 1)]) {
      if (!rm || L.mzRing) continue;
      for (let t = 0; t < 40 && !L.mzRing; t++) {
        const a = api.rnd() * TAU, d = api.rnd() * rm.r * 0.45, x = rm.x + Math.sin(a) * d, z = rm.z + Math.cos(a) * d;
        if (api.isFloor(x, z) && api.circleFree(x, z, 1.2) && (L.chests || []).every(c => hyp(c.x - x, c.z - z) > 3) && (L.mzPads || []).every(c => hyp(c.x - x, c.z - z) > 4)) L.mzRing = { x, z };
      }
    }
    // pofuduk toplar (tekmelenince parıltı)
    L.mzPuffs = [];
    for (const ai of [0, 1, 2, 3]) { const rm = room(ai, 1) || room(ai, 0); const a = api.rnd() * TAU, p = rm && spot(rm, Math.sin(a) * rm.r * 0.5, Math.cos(a) * rm.r * 0.5, 0.8); if (p) L.mzPuffs.push(p); }
    if (side[1]) for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.5, p = spot(side[1], Math.sin(a) * 2.2, Math.cos(a) * 2.2, 0.8); if (p) L.mzPuffs.push(p); }   // Yan 2: Pofuduk Top Çukuru
    if (OK() && ODAKIT.extraChests && L.chests) { try { ODAKIT.extraChests(L, api); } catch (e) { /* yok */ } }
  }

  // ════════════════ Görsel kurulum ════════════════
  // SADE (okunurluk turu): zemine pişmiş ışık havuzları ve nokta ışıklar daha sönük, titreşimsiz (Feza yolu ve huysuzları net seçsin)
  //   (api yerinde değişir: ODAKIT.lowShadow gibi api.put yamaları ve api.box/ball/cyl aynı nesneyi kullanmaya devam eder)
  const sadeApi = (api, gk = 0.55, lk = 0.7) => {
    if (api.__sade) return api;
    const g0 = api.glow, l0 = api.light;
    api.__sade = true;
    api.glow = (x, z, r, c, k = 0.15) => g0(x, z, r, c, k * gk);
    api.light = (x, y, z, c, i = 3, d = 7, f = 0) => l0(x, y, z, c, i * lk, d, f * 0.3);
    return api;
  };
  function* kur(L, api) {
    api = sadeApi(api);
    const THREE = api.THREE, rnd = api.rnd, K = OK() ? ODAKIT : null;
    if (K && K.lowShadow) K.lowShadow(api, 99);   // SADE: süsler gölge düşürmez (PIRIL.md §13: gölge yalnız Feza/Pırıl/boss; üçgen bütçesi)
    const put = api.put;
    const isF = (x, z) => api.isFloor(x, z);
    // kameraya göre yükseklik sınırı: kuzeydeki ±35° koni içinde yürünür zemin varsa (Feza o tarafta olabilir) alçak kalmalı
    // GÜZEL3 (kadraj): kamera güneyde, 40° eğik, uzaklık 15,5 (dikey ekranda ×1,2 = 18,6), görüş 40°. Eski sınır (0,5 + d·0,85) yalnız
    //   Feza'yı örtmemeyi sağlıyordu: zeminin hemen güneyindeki ön plan bandında 3-6 m'lik dev şapkalar ekranın altını kaplıyordu
    //   (dikeyde ekranın %40'ı tek şapka; Feza'nın dibinde pembe şapka). Şimdi: ekranda görünen ön bantta (≤ 7,4 m) alçak
    //   (0,75 + d·0,2 ≤ 1,75 m); daha güneyde (kameranın altı) ekranın alt kenarının altında kalacak kadar.
    const coneH = (x, z) => { for (let d = 0.5; d <= 15; d += 0.75) { const w = d * 0.45 + 0.8; for (let dx = -w; dx <= w; dx += 0.9) if (isF(x + dx, z - d)) return d <= 7.4 ? 0.75 + Math.min(d, 5) * 0.2 : Math.max(1.75, 11.6 - (14.2 - d) * 1.74); } return 99; };
    const fN = (x, z) => (K ? K.floorNorth(L, x, z, 9) : 99), fD = (x, z, m = 8) => (K ? K.floorDist(L, x, z, m) : 9);
    const stem = api.tmp(lathe(THREE, STEM_P, 14)), cap = api.tmp(lathe(THREE, CAP_P, 18)), shelf = api.tmp(lathe(THREE, SHELF_P, 14));
    const sph = api.tmp(new THREE.SphereGeometry(1, 12, 8)), sphL = api.tmp(new THREE.SphereGeometry(1, 6, 4)), dode = api.tmp(new THREE.DodecahedronGeometry(1, 1));
    const leaf = api.tmp(leafGeo(THREE)), frond = api.tmp(frondGeo(THREE)), cyl = api.tmp(new THREE.CylinderGeometry(1, 1, 1, 12)), cylLo = api.tmp(new THREE.CylinderGeometry(1, 1, 1, 6));
    // alçak çözünürlüklü küçük mantar (kümeler, minik süsler: yüzlercesi var)
    const stemLo = api.tmp(lathe(THREE, [[0, 0], [0.55, 0], [0.45, 0.3], [0.42, 1.0], [0, 1.0]], 6)), capLo = api.tmp(lathe(THREE, [[0, -0.02], [0.95, -0.02], [0.98, 0.15], [0.65, 0.52], [0, 0.7]], 8));
    const pick = a => a[(rnd() * a.length) | 0];
    const bbox = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 };
    for (const r of L.rooms) { bbox.x0 = Math.min(bbox.x0, r.x - r.r - 12); bbox.x1 = Math.max(bbox.x1, r.x + r.r + 12); bbox.z0 = Math.min(bbox.z0, r.z - r.r - 12); bbox.z1 = Math.max(bbox.z1, r.z + r.r + 12); }

    // altta koyu yosun zemini (yürünmez yerlerde boşluk görünmesin)
    floor(L, api);
    yield;
    api.dreamEdge();

    // ── (G3) çevre süsleri: PROPKIT eşya takımı (src/07m_*.js) — mantar, kaya, ot, çalı, ağaç, kristal, kütük, kök ──
    const ids = L.rooms.map((r, i) => i);
    const HAS = typeof MANTAR_DEKOR !== 'undefined' && typeof PROPKIT !== 'undefined' && !!(PROPKIT.tree && PROPKIT.puff && PROPKIT.bush);
    const nop = () => {};
    const D = HAS ? MANTAR_DEKOR.olustur(L, api, { K, coneH, fN, fD, isF }) : (() => {   // kit yüklenemezse basit yedek süsler (oyun açılsın)
      const mush = (x, z, h, s, o = {}) => { const c = CAPS[(rnd() * CAPS.length) | 0]; put(stem, x, 0, z, Math.max(0.18, s * 0.28), h, Math.max(0.18, s * 0.28), 0xf6ecdf, rnd() * TAU); put(cap, x, h * 0.97, z, s, s * 0.8, s, c[0], rnd() * TAU); if (o.pool !== false) api.glow(x, z, s * 1.6 + 1, 0xa8fff4, o.pk ?? 0.16); };
      const stn = (x, z, s) => put(dode, x, s * 0.25, z, s, s * 0.6, s * 0.85, 0x6a7488, rnd() * TAU);
      return { mushroom: mush, glowCluster: nop, mossMound: (x, z, s) => put(sph, x, -s * 0.2, z, s * 1.1, s * 0.75, s, MOSS[0], rnd() * TAU), stone: stn, fern: (x, z, s) => { for (let i = 0; i < 4; i++) put(frond, x, 0.02, z, s, s, s, 0x3f9a6a, i / 4 * TAU, 0, 0, 'decor'); },
        bush: nop, tuftAt: nop, flowerAt: nop, patch2: nop, rockGroup: stn, crystals: nop, logAt: nop, rootArc: nop, tree: nop, leafUmbrella: nop, signpost: nop, fenceRun: nop, bridge: nop, groundCover: nop };
    })();
    const { glowCluster, mossMound, stone, fern } = D;
    // QA5: kameraya göre sınır şapkayı da saymalı: coneH yalnız sap boyunu sınırlıyordu, dev şapka (yarıçap 3-5 m) kuzeye taşıp üstte
    //   kalıyordu → yan odada / oda güneyinde ekranın yarısını turuncu şapka kaplıyor, Feza görünmüyordu (kamera uzaklığı 15,5).
    //   Şapkanın tepesi ve kuzey kenarı da görüş konisinin altında kalmalı; sığmazsa önce boy, sonra şapka küçülür, yine sığmazsa konmaz.
    const fitTall = (x, z, h, s, top = 0.6) => {
      for (let k = 0; k < 8; k++) {
        const lim = Math.min(coneH(x, z) - top * s, coneH(x, z - s * 0.95), coneH(x - s * 0.7, z - s * 0.7), coneH(x + s * 0.7, z - s * 0.7), coneH(x - s * 0.95, z), coneH(x + s * 0.95, z));
        if (h <= lim) return [h, s];
        if (lim >= Math.max(0.6, s * 1.5)) return [lim, s];   // GÜZEL3: kısaltılan mantarın şapkası da orantılı küçülür (alçak ama kocaman şapka ön planda leke gibiydi)
        s *= 0.8; h *= 0.85;   // GÜZEL3: boy da birlikte küçülür (uzun sap + minicik şapka "çivi" gibi duruyordu)
      }
      return null;
    };
    const mushroom = (x, z, h, s, o) => { const f = fitTall(x, z, h, s); if (f) D.mushroom(x, z, f[0], f[1], o); };
    const tree0 = D.tree;
    D.tree = (x, z, h, o) => { const f = fitTall(x, z, h, h * 0.4, 0.15); if (f && f[0] >= 3 && f[1] >= h * 0.39) tree0(x, z, f[0], o); };
    // yerleşik oyun nesnelerinden uzak dur (zemin örtüsü ve kümeler)
    const keepClear = (x, z) => {
      if (hyp(x - L.start.x, z - L.start.z) < 2.2) return true;
      if (L.exit && hyp(x - L.exit.x, z - L.exit.z) < 3.2) return true;
      for (const q of L.mzPads || []) if (hyp(x - q.x, z - q.z) < 1.8) return true;
      for (const q of L.mzSing || []) if (hyp(x - q.x, z - q.z) < 1.4) return true;
      for (const q of L.mzPuffs || []) if (hyp(x - q.x, z - q.z) < 1.4) return true;
      if (L.mzRing && hyp(x - L.mzRing.x, z - L.mzRing.z) < 3.4) return true;
      for (const c of L.chests || []) if (hyp(x - c.x, z - c.z) < 1.6) return true;
      return false;
    };
    // ── kenar dolgusu: yürünür alanın dışı. Her yer bir "sahne": ana eşya + yanında ot, çiçek, ışıklı mantarcık ──
    let nTall = 0;
    if (K) K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const r = rnd(), maxH = Math.min(maxH0, coneH(x, z));
      if (maxH >= 6 && fd > 2.6 && r < 0.2) {   // mantar ağacı (kat kat raf mantarlı, sarkan ışıklı)
        const h = Math.min(maxH, 4.2 + rnd() * 2.8); D.tree(x, z, h, { kind: 'shelf', glow: 0xfff0a0 }); api.glow(x, z, h * 0.35 + 1, 0xb8ffe8, 0.1);
      } else if (maxH >= 6 && fd > 2.2 && r < 0.5) {   // dev şemsiye mantar
        const h = Math.min(maxH, 3.5 + rnd() * 5), s = Math.min(1.4 + rnd() * 2.2 + h * 0.12, fd * 0.8 + 0.6);
        mushroom(x, z, h, s, { tilt: 0.25, light: nTall++ % 3 === 0, li: 2.6, ld: 10 });
        if (HAS && rnd() < 0.5) put(PROPKIT.cap('flat', 1), x + 0.3, h * 0.45, z + 0.35, 0.55, 0.55, 0.55, [0xffc8ec, 0xc8e0ff, 0xfff0b8][(rnd() * 3) | 0], rnd() * TAU, 0.15, 0, 'shiny');
        D.patch2(x + (rnd() - 0.5) * 2, z + 1.4, 1.2);
      } else if (maxH >= 1.2 && r < 0.64) {
        const h = Math.min(maxH, 0.8 + rnd() * 1.4), s = Math.min(0.5 + rnd() * 0.7, h * 0.75);
        mushroom(x, z, h, s, { pk: 0.12 }); if (rnd() < 0.6) D.patch2(x + 0.6, z + 0.5, 0.9);
      } else if (r < 0.7) D.rockGroup(x, z, 0.5 + rnd() * 0.6);
      else if (r < 0.76) D.crystals(x, z, 0.6 + rnd() * 0.7);
      else if (r < 0.8 && maxH > 0.8) D.logAt(x, z, 1.4 + rnd() * 1.2);
      else if (r < 0.85) { D.rootArc(x, z, 0.9 + rnd() * 0.8); D.patch2(x, z + 0.5, 0.8); }
      else if (r < 0.93) { D.mossMound(x, z, 0.6 + rnd() * 0.7); }
      else { fern(x, z, 0.8 + rnd() * 0.6); D.patch2(x + 0.5, z, 0.8); }
      if (rnd() < 0.15) glowCluster(x + (rnd() - 0.5) * 1.5, z + (rnd() - 0.5) * 1.5, 2 + ((rnd() * 2) | 0), 1);
    }, { step: 3.5, d0: 1.2, d1: 9, margin: 10 });
    yield;
    // uzak dolgu: seyrek, büyük, alçak ayrıntılı mantar/ağaç siluetleri ve yosun tepecikleri
    if (K) K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const maxH = Math.min(maxH0, coneH(x, z));
      if (maxH >= 11 && rnd() < 0.3) D.tree(x, z, 7 + rnd() * 4, { kind: 'shelf', mat: 'shinyNS', lod: 1 });
      else if (maxH >= 11 && rnd() < 0.55) mushroom(x, z, 6 + rnd() * 5, 3 + rnd() * 2.5, { pool: false, lod: 2, vines: false });
      else if (maxH > 1.2) D.mossMound(x, z, 1.4 + rnd() * 1.6);
      else D.mossMound(x, z, 0.7 + rnd() * 0.5);
    }, { step: 6.5, d0: 9, d1: 22, margin: 22 });
    yield;
    // dev yaprak altları: kuzey kenarda yüksek saplı dev yapraklar, yola doğru eğilir (kamera önünü kapatmaz)
    let nLeaf = 0;
    if (K) for (const ri of ids) {
      const rm = L.rooms[ri]; if (rm.kind === 'boss') continue;
      for (let k = 0; k < 3; k++) {
        const a = PI + (k - 1) * 0.7 + (rnd() - 0.5) * 0.3, d = rm.r + 2.2 + rnd() * 1.5, x = rm.x + Math.sin(a) * d, z = rm.z + Math.cos(a) * d;
        if (isF(x, z) || fD(x, z, 2) < 1 || coneH(x, z) < 5.5) continue;
        D.leafUmbrella(x, z, 3.4 + rnd() * 1.8, 2.0 + rnd() * 0.9, Math.atan2(rm.x - x, rm.z - z));
        nLeaf++;
      }
    }
    void nLeaf;
    yield;
    // ── yürünür alan: zemin örtüsü (ot, çiçek, ışıklı mantarcık; yolun ortası temiz) ──
    void keepClear;   // (zemin örtüsünü G1'in zemin kiti — 06a_bolum_kayit.js — yapar)
    yield;
    // oda kenarları: yürünür alanın hemen dışında sık, parlak kuşak (kameraya göre alçak)
    if (K) for (const ri of ids) {
      const rm = L.rooms[ri], spots = K.rimSpots(L, rm, 0.7, rm.kind === 'boss' ? 18 : 14);
      spots.forEach((p, k) => {
        const hmax = coneH(p.x, p.z), r = rnd();
        if (r < 0.28) glowCluster(p.x, p.z, 2 + ((rnd() * 3) | 0), 1.1);
        else if (r < 0.5 && hmax > 1.0) mushroom(p.x + Math.sin(p.a) * 0.6, p.z + Math.cos(p.a) * 0.6, Math.min(hmax, 0.9 + rnd() * 1.6), Math.min(0.85, 0.45 + rnd() * 0.4), { pk: 0.14 });
        else if (r < 0.64) fern(p.x, p.z, 0.7 + rnd() * 0.5);
        else if (r < 0.78) D.bush(p.x, p.z, 0.8 + rnd() * 0.5);
        else if (r < 0.9) D.rockGroup(p.x, p.z, 0.4 + rnd() * 0.3);
        else D.mossMound(p.x, p.z, 0.45 + rnd() * 0.4);
        if (rnd() < 0.5) D.patch2(p.x + Math.sin(p.a) * -0.5, p.z + Math.cos(p.a) * -0.5, 0.8);
      });
    }
    // ── (G3) yol göstericiler: alan girişlerinde yönlü tabela, başlangıçta çit, peri halkası çevresi ──
    if (K) {
      const Pth = L.path || [], nearP = (x, z) => { let b = 1e9, bi = 0; for (let i = 0; i < Pth.length; i++) { const d = dist2(Pth[i].x, Pth[i].z, x, z); if (d < b) { b = d; bi = i; } } return { d: Math.sqrt(b), i: bi }; };
      (L.areas || []).forEach((a, k) => {
        if (a.boss || !k) return;
        const rm = L.rooms[a.rooms[0]]; if (!rm) return;
        let best = null;
        for (const sp of K.rimSpots(L, rm, 0.9, 24)) { const q = nearP(sp.x, sp.z); if (q.d < 2.6 || q.d > 7) continue; if (!best || q.d < best.q.d) best = { sp, q }; }
        if (!best) return;
        const i = best.q.i, A = Pth[Math.max(0, i - 2)], B = Pth[Math.min(Pth.length - 1, i + 3)], dl = hyp(B.x - A.x, B.z - A.z) || 1;
        D.signpost(best.sp.x, best.sp.z, (B.x - A.x) / dl, (B.z - A.z) / dl, k);
      });
      const r0 = L.rooms[0];
      if (r0) { let n = 0; for (const sp of K.rimSpots(L, r0, 1.0, 16)) { if (n >= 3) break; if (nearP(sp.x, sp.z).d < 3 || fN(sp.x, sp.z) < 99) continue; D.fenceRun(sp.x, sp.z, sp.a, 3); n++; } }
      if (L.mzRing) {   // peri halkası: taşlar + çiçekler (mantarlar oyun nesnesi, onlara dokunulmaz)
        const R0 = L.mzRing;
        for (let i = 0; i < 9; i++) { const a = (i + 0.5) / 9 * TAU, x = R0.x + Math.sin(a) * 2.5, z = R0.z + Math.cos(a) * 2.5; if (isF(x, z)) { stone(x, z, 0.16 + rnd() * 0.08); D.flowerAt(x + 0.25, z + 0.1, 1.3); } }
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + 0.2, x = R0.x + Math.sin(a) * 3.0, z = R0.z + Math.cos(a) * 3.0; if (isF(x, z)) D.tuftAt(x, z, 1.1); }
      }
    }
    yield;
    // oda ortalarında yumuşak ışık havuzları
    for (const rm of L.rooms) api.glow(rm.x, rm.z, rm.r * 0.9, rm.kind === 'boss' ? 0xffb8f0 : 0xb8ffe8, 0.07);
    yield;

    // ── 3. alan: ışıklı dere, yosunlu taşlar, basamak taşları, mantar köprüsü ──
    const streams = [];
    for (const S of L.mzStreams || []) {
      const st = streamMesh(api, S.pts, S.w); streams.push({ sp: st.sp, w: S.w });
      // kıyı: yosunlu taşlar + ışıklı sazlar (yürünür alanın dışında büyük, içinde küçük)
      for (let i = 0; i < st.sp.length; i += 2) {
        const p = st.sp[i], q = st.sp[Math.min(st.sp.length - 1, i + 1)], dx = q.x - p.x, dz = q.z - p.z, l = hyp(dx, dz) || 1;
        for (const sd of [-1, 1]) {
          const x = p.x - dz / l * sd * (S.w + 0.5 + rnd() * 0.4), z = p.z + dx / l * sd * (S.w + 0.5 + rnd() * 0.4);
          if (isF(x, z)) { if (rnd() < 0.3) stone(x, z, 0.14 + rnd() * 0.1); }
          else if (rnd() < 0.5) { if (rnd() < 0.6) stone(x, z, 0.4 + rnd() * 0.5); else { D.tuftAt(x, z, 1.6); D.tuftAt(x + 0.2, z + 0.1, 1.3); HAS && put(PROPKIT.pod(1), x, 0.75, z + 0.05, 1, 1, 1, 0xa8fff4, 0, 0, 0, 'glow'); } }
          if (i % 6 === 0 && rnd() < 0.5) D.flowerAt(x + (rnd() - 0.5) * 0.6, z + (rnd() - 0.5) * 0.6, 1.2);
        }
      }
      // basamak taşları (yassı, derenin içinde)
      for (let i = 3; i < st.sp.length - 3; i += 5) { const p = st.sp[i]; if (HAS && isF(p.x, p.z) && rnd() < 0.6) put(PROPKIT.stonePath((rnd() * 3) | 0), p.x + (rnd() - 0.5) * 0.5, -0.02, p.z + (rnd() - 0.5) * 0.5, 0.42, 0.45, 0.38, 0xffffff, rnd() * TAU, 0, 0, 'shinyNS'); }
      // mantar köprüsü: yolun dereyi geçtiği yerde yassı raf mantarları (yürünür; ince)
      const rm = L.rooms[S.room];
      let bx = rm.x, bz = rm.z, bd = 1e9;
      for (const p of L.path || []) { for (const q of st.sp) { const d = dist2(p.x, p.z, q.x, q.z); if (d < bd) { bd = d; bx = q.x; bz = q.z; } } }
      { let ang = 0, best = 1e9; for (const q of st.sp) { const d = dist2(q.x, q.z, bx, bz); if (d < best && d > 0.5) { best = d; ang = Math.atan2(q.x - bx, q.z - bz); } }
        const ax = Math.sin(ang + PI / 2), az = Math.cos(ang + PI / 2);
        D.bridge(bx, bz, ang + PI / 2, 4.2, 1.7);   // (G3) tahta köprü, iki yanda ip korkuluk
        for (const sd of [-1, 1]) { mushroom(bx + Math.sin(ang) * sd * 1.9 + ax * 2.2, bz + Math.cos(ang) * sd * 1.9 + az * 2.2, 0.9, 0.45, { pk: 0.2 }); mushroom(bx + Math.sin(ang) * sd * 1.9 - ax * 2.2, bz + Math.cos(ang) * sd * 1.9 - az * 2.2, 0.7, 0.38, { pk: 0.2 }); }
        api.glow(bx, bz, 3, 0x8ff4ff, 0.18);
      }
    }
    yield;

    // ── 4. alan: kök tünelleri (yolun üstünde dev kök kemerleri, asılı ışıklı yosun damlaları) ──
    const a4 = (L.areas || [])[3];
    if (a4 && K && L.path) {
      const rooms4 = new Set(a4.rooms), arena = L.rooms[L.rooms.length - 1] && L.rooms.find(r => r.kind === 'boss');
      const inA4 = (x, z) => { for (const ri of rooms4) { const r = L.rooms[ri]; if (hyp(x - r.x, z - r.z) < r.r + 5) return true; } return arena ? hyp(x - arena.x, z - arena.z) > arena.r + 1 && hyp(x - arena.x, z - arena.z) < arena.r + 9 : false; };
      const arch = api.tmp(K.archGeo(1, 1, 0.075, 14, 6));
      let acc = 0, last = null;
      for (const p of L.path) {
        if (last) acc += hyp(p.x - last.x, p.z - last.z);
        const prev = last; last = p;
        if (!prev || acc < 3.2 || !inA4(p.x, p.z)) continue;
        acc = 0;
        const yaw = Math.atan2(p.x - prev.x, p.z - prev.z) + PI / 2;
        let half = 1.5; for (let d = 0.5; d < 6; d += 0.5) { if (!isF(p.x + Math.sin(yaw) * d, p.z + Math.cos(yaw) * d) || !isF(p.x - Math.sin(yaw) * d, p.z - Math.cos(yaw) * d)) { half = d; break; } }
        const rx = half + 0.9, ry = 3.4 + rnd() * 0.6;
        // SADE/QA: yolun ÜSTÜNDEN geçen kök kemerleri kaldırıldı (Feza'yı kameradan saklıyordu); yanlarda alçak kökler + ışıklı mantarlar kalır
        void rx; void ry; void arch;
        for (let k = 0; k < 0; k++) {   // kemerin üstünde minik ışıklı mantarlar + sarkan ışık yosunu
          const t = 0.2 + k * 0.3, ax = Math.cos(t * PI) * rx, ay = Math.sin(t * PI) * ry;
          const wx = p.x + Math.sin(yaw) * ax, wz = p.z + Math.cos(yaw) * ax;
          put(cap, wx, ay + 0.15, wz, 0.22, 0.18, 0.22, pick(GLOWC), 0, 0, 0, 'glow');
          if (k === 1) for (let j = 0; j < 3; j++) put(sphL, wx + (j - 1) * 0.3, ay - 0.5 - j * 0.25, wz, 0.07, 0.12, 0.07, 0xa8fff4, 0, 0, 0, 'glow');
        }
        for (const sd of [-1, 1]) { const x = p.x + Math.sin(yaw) * sd * (half + 0.9), z = p.z + Math.cos(yaw) * sd * (half + 0.9); if (!isF(x, z)) {   // QA3: koyu oval leke yerine belli bir nesne: üstü açık renk halkalı, yosunlu kök kütüğü + ışıklı mantarcıklar
          put(cyl, x, 0.32, z, 0.46, 0.64, 0.46, 0x8a5a3c, yaw); put(cyl, x, 0.645, z, 0.42, 0.02, 0.42, 0xe0bf92, yaw);
          put(sphL, x + 0.18, 0.62, z - 0.1, 0.24, 0.08, 0.2, pick(MOSS), yaw); glowCluster(x + 0.65, z + 0.25, 3, 0.6); } }
      }
    }
    yield;

    // ── arena: dev mantar çemberi + peri halkası ──
    const ar = L.rooms.find(r => r.kind === 'boss');
    let arenaGlow = null;
    if (ar) {
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU, d = ar.r + 2.4 + (i % 2) * 1.4, x = ar.x + Math.sin(a) * d, z = ar.z + Math.cos(a) * d;
        if (isF(x, z) || fD(x, z, 2) < 1) continue;
        if (z > ar.z - ar.r * 0.25) continue;   // SADE/QA: arenanın güneyinde (kamera tarafında) dev mantar yok
        const hc = coneH(x, z), h = Math.min(hc, 4 + rnd() * 3);
        if (h < 0.6) continue;
        mushroom(x, z, h, h < 2 ? Math.min(0.8, h * 0.7) : 2 + rnd() * 1.2, { light: i % 4 === 0, li: 3.4, ld: 12, pk: 0.2 });
      }
      // peri halkası: arena kenarı boyunca minik ışıklı mantarlar (kendi malzemesi: kutlamada parlar)
      const k = new Kit(), gcol = new THREE.Color(1, 1, 1);
      for (let i = 0; i < 40; i++) {
        const a = i / 40 * TAU, d = ar.r - 0.9, x = ar.x + Math.sin(a) * d, z = ar.z + Math.cos(a) * d;
        if (!isF(x, z)) continue;
        gcol.set(GLOWC[i % GLOWC.length]);
        k.add(G.sphere(8, 5), gcol, [x, 0.22, z], null, [0.2, 0.14, 0.2]);
        k.add(G.cyl(1, 1, 6), 0xf4f0e8, [x, 0.1, z], null, [0.06, 0.2, 0.06]);
      }
      const gm = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(1.1, 1.1, 1.1) });
      arenaGlow = new THREE.Mesh(k.build(), gm); arenaGlow.name = 'mantar-peri-halkasi'; api.add(arenaGlow); api.dispose(gm); api.dispose(arenaGlow.geometry);
      api.glow(ar.x, ar.z, ar.r + 1, 0xffb8f0, 0.1);
      // bossun oturduğu kuzeyde dev "taht" mantarı
      mushroom(ar.x, ar.z - ar.r - 4.5, 7.5, 4.2, { light: true, li: 4, ld: 14, ci: 0 });
    }
    yield;

    // ── atmosfer: süzülen ışık tozları (iki katman) ──
    // SADE: ışık tozu az ve sönük (okunurluk: ekranda aynı anda az şey hareket etsin)
    motes(api, L, 160, { cols: ['#c8fff0', '#fff0a8', '#ffc8f4', '#d8ffb0', '#b8c8ff'], size: 0.14, y0: 0.15, rise: 0.08, h: 4.5, k: 0.7 });
    motes(api, L, 30, { cols: ['#fff4c0', '#a8fff4', '#ffb8e8'], size: 0.36, y0: 0.6, rise: 0.04, h: 5.5, k: 0.6 });

    // ── gizli: Işıklı Mantar Merdiveni (kuzey kenar; raf mantarı basamakları dev mantarın tepesine çıkar; dibinde hazine) ──
    let merdivenBase = null;
    if (K) {
      const cand = [];
      for (const ri of ids) { const rm = L.rooms[ri]; if (rm.kind === 'boss') continue; for (const sp of K.rimSpots(L, rm, 3.2, 20)) if (fN(sp.x, sp.z) >= 99 && fD(sp.x, sp.z, 6) > 2.6 && hyp(sp.x - L.start.x, sp.z - L.start.z) > 12 && coneH(sp.x, sp.z) > 6) cand.push(sp); }
      const sp = cand.length ? cand[(rnd() * cand.length) | 0] : null;
      if (sp) {
        const bx = sp.x, bz = sp.z, tx = bx + 3.4, tz = bz - 5.2;
        // QA5: tırmanılamayan raf basamakları ve tepedeki ulaşılamaz sandık kaldırıldı (Feza çıkmaya uğraşıp takılıyordu); dev mantar süs olarak kalır
        void shelf;
        mushroom(tx + 0.6, tz - 0.6, 4.6, 2.3, { ci: 3, light: true, li: 2.4, ld: 9, pk: 0.14 });
        merdivenBase = { x: bx - 0.9, z: bz + 1.6 };
        if (!isF(merdivenBase.x, merdivenBase.z) && !(fD(merdivenBase.x, merdivenBase.z, 4) < 1.2)) { /* kenarda: hazine yine de oraya */ }
      }
    }
    void merdivenBase;
    // ── oyuncaklar ──
    const T = K ? K.toys(api) : null;
    // gizli çıkartmalar (albüm sayfası)
    try { if (typeof HUB !== 'undefined' && HUB) { HUB.GIZLI = HUB.GIZLI || {}; HUB.GIZLI.mantar = Object.assign(HUB.GIZLI.mantar || {}, { mantar_peri_halkasi: ['Peri Halkası', '🍄'], mantar_palamut: ['Işıklı Palamut', '🌰'] }); } } catch (e) { /* yok */ }
    const anims = [];
    const stemG = api.dispose(lathe(THREE, STEM_P, 16)), capG = api.dispose(lathe(THREE, CAP_P, 24));
    const mats = {};
    const mm = (key, o) => mats[key] || (mats[key] = api.dispose(new THREE.MeshStandardMaterial(o)));
    // PERF3: canlı mantarlar (zıplatan, şarkı söyleyen, dansçı, peri halkası) parça başına ayrı çizim yerine birleşik geometri + TEK
    //   ortak malzeme. Renk köşelere işlenir; aE köşe değeri: ≥ 0 → ışık alan parça (aE × renk kadar kendi ışığı: şapka 0,17),
    //   < 0 → yalnız ışıklı parça (|aE| × renk; eski MeshBasic ×2,0 ışıklı benek / kenar ile aynı). Gölge düşürmezler (§13).
    const canliMat = (() => {
      const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0 });
      m.onBeforeCompile = sh => {
        sh.vertexShader = 'attribute float aE;\nvarying float vMzE;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvMzE = aE;');
        sh.fragmentShader = 'varying float vMzE;\n' + sh.fragmentShader
          .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= step(0.0, vMzE);')
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor.rgb * abs(vMzE);');
      };
      m.customProgramCacheKey = () => 'mantar-canli';
      return api.dispose(m);
    })();
    const _m4 = new THREE.Matrix4(), _q0 = new THREE.Quaternion(), _v3 = new THREE.Vector3(), _p3 = new THREE.Vector3(), _s3 = new THREE.Vector3(), _nm = new THREE.Matrix3(), _cc = new THREE.Color();
    // parts: [geometri, ton, aE, ölçek [sx,sy,sz]?, konum [x,y,z]?] → tek geometri (köşe rengi × ton)
    function mergeTint(parts) {
      let nv = 0, ni = 0;
      for (const p of parts) { const n = p[0].attributes.position.count; nv += n; ni += p[0].index ? p[0].index.count : n; }
      const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), ae = new Float32Array(nv), idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
      let vo = 0, io = 0;
      for (const [g, tint, e, sc, at] of parts) {
        const P = g.attributes.position, N = g.attributes.normal, C = g.attributes.color; _cc.set(tint);
        _m4.compose(_p3.set(...(at || [0, 0, 0])), _q0, _s3.set(...(sc || [1, 1, 1]))); _nm.getNormalMatrix(_m4);
        for (let i = 0; i < P.count; i++) {
          const o = (vo + i) * 3;
          _v3.fromBufferAttribute(P, i).applyMatrix4(_m4); pos[o] = _v3.x; pos[o + 1] = _v3.y; pos[o + 2] = _v3.z;
          if (N) { _v3.fromBufferAttribute(N, i).applyMatrix3(_nm).normalize(); nor[o] = _v3.x; nor[o + 1] = _v3.y; nor[o + 2] = _v3.z; }
          col[o] = (C ? C.getX(i) : 1) * _cc.r; col[o + 1] = (C ? C.getY(i) : 1) * _cc.g; col[o + 2] = (C ? C.getZ(i) : 1) * _cc.b; ae[vo + i] = e;
        }
        if (g.index) { for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.getX(i) + vo; io += g.index.count; } else { for (let i = 0; i < P.count; i++) idx[io + i] = vo + i; io += P.count; }
        vo += P.count;
      }
      const out = new THREE.BufferGeometry();
      out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      out.setAttribute('color', new THREE.BufferAttribute(col, 3)); out.setAttribute('aE', new THREE.BufferAttribute(ae, 1));
      out.setIndex(new THREE.BufferAttribute(idx, 1)); out.computeBoundingSphere();
      return api.dispose(out);
    }
    const mushGeo = {};
    function liveMush(x, z, h, s, capC, o = {}) {
      if (!HAS) return liveMushOld(x, z, h, s, capC, o);
      return liveMushKit(x, z, h, s, capC, o);
    }
    function liveMushKit(x, z, h, s, capC, o = {}) {   // (G3) PROPKIT parçalarıyla: lifli gövde, benekli/solungaçlı şapka, ışıklı kenar (PERF3: 7 çizim → 2)
      const KP = PROPKIT, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rnd() * TAU;
      const lod = s > 0.7 ? 0 : 1, gc = o.gc || 0xfff0a0;
      const sw = Math.max(0.16, s * 0.34), kS = 's' + lod + '|' + h.toFixed(3) + '|' + sw.toFixed(3), kC = 'c' + lod + '|' + capC + '|' + gc;
      // GÜZEL2: kısa/tombul mantarda kökler şapkanın altından diş gibi taşıyordu → yalnız uzun saplıda
      const sg = mushGeo[kS] || (mushGeo[kS] = mergeTint([[KP.stem('plain', lod), 0xf6ecdf, 0, [sw, h, sw]]].concat(h >= 1 ? [[KP.roots(5, lod), 0xd9c4a8, 0, [sw, sw, sw]]] : [])));
      const cg = mushGeo[kC] || (mushGeo[kC] = mergeTint([[KP.cap('dome', lod), capC, 0.17], [KP.gills(lod), 0xffe6d2, 0], [KP.capSpots('dome', lod, false), capC === 0xff7ec8 ? 0xffd0ec : 0xfff4e0, 0],
        [KP.capSpots('dome', lod, true), gc, -2.0], [KP.rim(lod), gc, -2.0]]));
      g.add(new THREE.Mesh(sg, canliMat));
      const cp = new THREE.Group(); cp.position.y = h * 0.96; cp.scale.set(s, s * 0.75, s); g.add(cp);
      cp.add(new THREE.Mesh(cg, canliMat));
      api.add(g);
      return { g, cp, gl: new THREE.Group(), h, s };
    }
    function liveMushOld(x, z, h, s, capC, o = {}) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rnd() * TAU;
      const st = new THREE.Mesh(stemG, mm('stem', { color: 0xf6ecdf, roughness: 0.6 })); st.scale.set(s * 0.32, h, s * 0.32); g.add(st);
      const cp = new THREE.Mesh(capG, mm('cap' + capC, { color: capC, roughness: 0.45, emissive: new THREE.Color(capC), emissiveIntensity: 0.18 })); cp.position.y = h * 0.96; cp.scale.set(s, s * 0.75, s); g.add(cp);
      api.add(g);
      return { g, cp, gl: new THREE.Group(), h, s };
    }
    const sphG = api.dispose(new THREE.SphereGeometry(1, 12, 8));
    // şapka benekleri (birim şapka yüzeyinde, tek geometri)
    const spotG = (() => {
      const k = new Kit(), rAt = y => { for (let i = 1; i < CAP_P.length; i++) { const a = CAP_P[i - 1], b = CAP_P[i]; if ((y - a[1]) * (y - b[1]) <= 0 && a[1] !== b[1]) return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); } return 0; };
      for (let i = 0; i < 9; i++) { const y = i === 8 ? 0.7 : 0.18 + 0.38 * ((i * 0.618) % 1), a = i * 2.39996, r = rAt(y) + 0.01; k.add(G.sphere(8, 5), 0xffffff, [Math.sin(a) * r, y, Math.cos(a) * r], [0, a, 0], [0.11, 0.09, 0.05]); }
      return api.dispose(k.build());
    })();

    // zıplatan mantarlar (2. alan): basınca şapka ezilir, Feza yay çizerek bir sonrakine uçar
    // KİLİT (doğrulama): yol üstündeki mantar Feza'yı geldiği yere geri fırlatıyordu; Feza ileri yürüdükçe aynı mantara basıp
    //   döngüde kalıyordu (tohum 12: 25 sn'de 12 kez, oda geçilemedi) → yalnız Feza o mantarın fırlattığı yöne doğru yürüyorsa zıplatır
    const mv = { x: 0, z: 0, px: null, pz: null };
    if (T && (L.mzPads || []).length) api.anim((dt, hx, hz) => { if (mv.px !== null && dt > 0) { const vx = (hx - mv.px) / dt, vz = (hz - mv.pz) / dt, k = Math.min(1, dt * 8); if (hyp(vx, vz) < 20) { mv.x += (vx - mv.x) * k; mv.z += (vz - mv.z) * k; } } mv.px = hx; mv.pz = hz; });
    // QA5: halkadaki iki komşu mantardan Feza'nın yürüdüğü yöne en uygun olanına fırlatır (eskiden yalnız tek yöne çalışıyordu: ters
    //   taraftan basınca hiçbir şey olmuyordu, "bas" cümlesi boşa çıkıyordu); ikisi de arkadaysa zıplatmaz (geri fırlatma döngüsü yok)
    const padHedef = p => {
      const s = hyp(mv.x, mv.z); if (s < 0.5) return p.to;
      let best = null, bd = 0.05;
      for (const q of L.mzPads) { if (q.g !== p.g || q === p) continue; const dx = q.x - p.x, dz = q.z - p.z, d = (mv.x * dx + mv.z * dz) / (s * (hyp(dx, dz) || 1)); if (d > bd) { bd = d; best = q; } }
      return best;
    };
    const padYon = p => { p.hedef = padHedef(p); return !!p.hedef; };
    if (T) for (const p of L.mzPads || []) {
      const M = liveMush(p.x, p.z, 0.55, 1.05, 0xff7ec8, { gc: 0xa8fff4 });
      api.glow(p.x, p.z, 1.6, 0xff9fe0, 0.2);
      let sq = 9, pt = rnd() * 9;
      const it = T.add({ x: p.x, z: p.z, r: 1.05, hint: { y: 1.9 }, line: p.g === 0 ? 'b01_ziplat' : null, near: 7, cd: 0.6, repeat: true, can: () => padYon(p),
        use: () => {
          sq = 0; sfx('mantarBoing', { x: p.x, z: p.z }); sfx('bounce', { x: p.x, z: p.z, pitch: 0.9 }); burst('sparkle', p.x, 0.8, p.z, { color: '#ffd0f4', count: 6 });
          const h = p.hedef || p.to, tx = h.x, tz = h.z, D = hyp(tx - p.x, tz - p.z);
          T.ride({ pts: [[p.x, p.z], [tx, tz]], speed: D / 0.95, y: u => 4 * (2.2 + D * 0.12) * u * (1 - u),
            tick: (u, x, z) => { if (Math.random() < 0.5) burst('sparkle', x, 1 + 4 * 2.2 * u * (1 - u), z, { color: '#fff0a8', count: 2 }); },
            end: () => { burst('dust', tx, 0.1, tz, { count: 3 }); if (!said.has('b01_ziplama')) say('b01_ziplama', { gap: 3 }); } });
          it.last -= 0; },
        // GÜZEL3: boşta yumuşak yaylanır (şapka nefes alır gibi: "bana bas!"); basınca eski güçlü yay
        tick: dt => { sq += dt; pt += dt; const k = sq < 0.6 ? Math.sin(sq * 26) * Math.exp(-sq * 6) : 0, b = 0.035 * Math.sin(pt * 3.4) * Math.min(1, Math.max(0, sq - 0.6) * 2);
          M.cp.scale.set(1.05 * (1 + 0.25 * k + 0.6 * b), 1.05 * 0.75 * (1 - 0.4 * k - b), 1.05 * (1 + 0.25 * k + 0.6 * b)); } });
    }
    // şarkı söyleyen mantarlar (1. alan): her dokunuşta bir nota (sıra yok, istediği sırayla); hepsi → ezgi + şeker
    if (T && (L.mzSing || []).length) {
      const NOTES = [1.0, 1.122, 1.26, 1.335, 1.498], cols = [0xff7ec8, 0xffa86a, 0xfff07a, 0x7affa8, 0x7ac8ff];
      const heard = new Set(); let done = false, doneT = -1;
      L.mzSing.forEach((p, i) => {
        const M = liveMush(p.x, p.z, 0.75 + i * 0.08, 0.5, cols[i], { gc: cols[i] });
        let b = 9, st = i * 0.7;
        T.add({ x: p.x, z: p.z, r: 0.95, hint: i === 0 ? { y: 1.7 } : false, line: i === 0 ? 'b01_sarki' : null, near: 6, cd: 0.4, repeat: true,
          use: () => {
            b = 0; sfx('bell', { x: p.x, z: p.z, pitch: NOTES[i] * 1.2, vol: 0.7 }); burst('notes', p.x, 1.3, p.z, { count: 2 });
            if (done) return;
            heard.add(i); if (heard.size === L.mzSing.length) { done = true; doneT = 0; setTimeout(() => { L.mzSing.forEach((q, j) => setTimeout(() => { sfx('bell', { x: q.x, z: q.z, pitch: NOTES[j] * 1.2, vol: 0.6 }); burst('sparkle', q.x, 1.2, q.z, { color: '#fff0a8', count: 5 }); }, j * 160)); if (K) K.sugar(p.x, p.z, 8, 8); say('b01_sarkiBitti', { gap: 2 }); }, 300);  }
          },
          // GÜZEL3: boşta mırıldanır gibi hafifçe sallanır (şapka yana yatar, gövde nefes alır); şarkı bitince 4 sn sırayla dalga dansı
          tick: dt => { b += dt; st += dt; if (i === 0 && doneT >= 0 && doneT < 6) doneT += dt;
            const k = b < 0.8 ? Math.sin(b * 22) * Math.exp(-b * 5) : 0, wv = doneT > 0.3 && doneT < 4.6 ? Math.max(0, Math.sin(doneT * 7 - i * 0.9)) * Math.min(1, 4.6 - doneT) : 0;
            const br = 0.03 * Math.sin(st * 2.3);
            M.g.scale.set(1 + 0.18 * k - 0.4 * br + 0.1 * wv, 1 - 0.22 * k + br + 0.22 * wv, 1 + 0.18 * k - 0.4 * br + 0.1 * wv);
            M.g.position.y = 0.22 * wv; M.cp.rotation.z = 0.07 * Math.sin(st * 1.6 + 0.5) + 0.12 * wv * Math.sin(doneT * 3.5); } });
      });
    }
    // boss sonu dansçıları: minik mantarcıklar (önceden kurulu, gizli; boss neşelenince çevresinde zıplayıp dans eder)
    const dancers = [];
    if (ar) for (let i = 0; i < 5; i++) { const M = liveMush(ar.x, ar.z, 0.42, 0.4, [0xff7ec8, 0x6fa8ff, 0x5fd8e8, 0xffa86a, 0xfff07a][i], { gc: GLOWC[i] }); M.g.visible = false; dancers.push(M); }
    // pofuduk toplar: içine girince "püf!" parıltı + birkaç şeker; söner, 10 s sonra yeniden kabarır
    // GÜZEL3: soluk taş gibi duruyorlardı → pastel pembe / nane / tereyağı / bebek mavisi, boşta nefes alır gibi kabarır.
    //   PERF3: hepsi tek çizim (örnekli), gölge yok (§13: gölge yalnız Feza/Pırıl/boss)
    const puffs = T ? (L.mzPuffs || []) : [];
    if (puffs.length) {
      const PC = [0xffd2e8, 0xc8f4dc, 0xfff0bc, 0xd0e2ff];
      const IM = new THREE.InstancedMesh(HAS ? PROPKIT.puff() : sphG, mm(HAS ? 'puff3' : 'puff', { vertexColors: HAS, color: 0xffffff, roughness: 0.85, emissive: new THREE.Color(0xfff2f6), emissiveIntensity: 0.08 }), puffs.length);
      IM.name = 'mantar-pofuduk-toplar'; IM.frustumCulled = false;
      const pc = new THREE.Color(), pp = new THREE.Vector3(), ps = new THREE.Vector3(), pmx = new THREE.Matrix4(), UPV = new THREE.Vector3(0, 1, 0);
      puffs.forEach((p, i) => { pc.set(PC[i % PC.length]); IM.setColorAt(i, pc); });
      api.add(IM);
      puffs.forEach((p, i) => {
        const q = new THREE.Quaternion().setFromAxisAngle(UPV, rnd() * TAU);
        let t = 99, bt = rnd() * 9;
        const set = (k, br) => { pmx.compose(pp.set(p.x, 0.42 * k, p.z), q, ps.set((0.5 * k + 0.05) * (1 + br * 0.6), (0.42 * k + 0.04) * (1 - br), (0.5 * k + 0.05) * (1 + br * 0.6))); IM.setMatrixAt(i, pmx); IM.instanceMatrix.needsUpdate = true; };
        set(1, 0);
        T.add({ x: p.x, z: p.z, r: 0.9, hint: false, cd: 10, use: () => {
          t = 0; sfx('bubblePop', { x: p.x, z: p.z, pitch: 0.7 }); burst('sparkle', p.x, 0.9, p.z, { color: '#e8ffb8', count: 11 });
          if (K) K.sugar(p.x, p.z, 4, 4); say('b01_pofuduk', { gap: 3 });
        }, tick: dt => { t += dt; bt += dt; const k = t < 0.3 ? 1 - t / 0.3 * 0.75 : t < 9 ? 0.25 : Math.min(1, 0.25 + (t - 9) * 0.75); set(k, k > 0.99 ? 0.045 * Math.sin(bt * 2.6) : 0); } });
      });
    }
    // peri halkası (gizli): ortasına basınca mantarlar sırayla yanar → altın şeker + çıkartma
    if (T && L.mzRing) {
      // PERF3: 9 sap + 9 şapka (18 çizim) → tek birleşik parça; yanan şapkanın köşe rengi/ışığı ve boyu bir kez güncellenir
      const R0 = L.mzRing, ms = [], parts = [], nS = stemG.attributes.position.count, nC = capG.attributes.position.count, onC = new THREE.Color(0xfff0a8);
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * TAU, x = R0.x + Math.sin(a) * 2.1, z = R0.z + Math.cos(a) * 2.1;
        parts.push([stemG, 0xf6ecdf, 0, [0.09, 0.3, 0.09], [x, 0, z]], [capG, 0xdff4e8, 0, [0.24, 0.2, 0.24], [x, 0.28, z]]);
        ms.push({ x, z, v0: i * (nS + nC) + nS });
      }
      const ringG = mergeTint(parts), ringM = new THREE.Mesh(ringG, canliMat); ringM.name = 'mantar-peri-mantarlari'; api.add(ringM);
      const light = i => {   // şapka i yanar: sarı ışık (eski MeshBasic ×2,4) ve ×1,3 boy
        const m = ms[i], P = ringG.attributes.position, C = ringG.attributes.color, E = ringG.attributes.aE;
        for (let v = m.v0; v < m.v0 + nC; v++) {
          P.setXYZ(v, m.x + (P.getX(v) - m.x) * 1.3, 0.28 + (P.getY(v) - 0.28) * 1.3, m.z + (P.getZ(v) - m.z) * 1.3);
          C.setXYZ(v, onC.r, onC.g, onC.b); E.setX(v, -2.4);
        }
        P.needsUpdate = C.needsUpdate = E.needsUpdate = true;
      };
      for (const m of ms) m.position = { x: m.x, z: m.z };
      api.glow(R0.x, R0.z, 2.6, 0xdfffe8, 0.14);
      let t = -1;
      T.add({ x: R0.x, z: R0.z, r: 0.9, hint: { y: 1.4 }, line: 'b01_halka', near: 5, once: true,
        use: () => { t = 0; sfx('unlock', { x: R0.x, z: R0.z, vol: 0.6 }); },
        tick: dt => {
          if (t < 0) return; const n0 = Math.floor(t / 0.18); t += dt; const n1 = Math.floor(t / 0.18);
          for (let i = n0; i < Math.min(n1, 9); i++) { light(i); sfx('bell', { x: R0.x, z: R0.z, pitch: 1 + i * 0.09, vol: 0.5 }); burst('sparkle', ms[i].position.x, 0.5, ms[i].position.z, { color: '#fff0a8', count: 3 }); }
          if (n0 < 10 && n1 >= 10) {
            burst('star', R0.x, 1.6, R0.z, { count: 5 });
            const g = typeof GAME !== 'undefined' ? GAME : null;
            if (g) { if (g.addGoldSugar) g.addGoldSugar(1); if (K) { K.sugar(R0.x, R0.z, 10, 8); K.sticker('mantar_peri_halkasi'); } }
            say('b01_halkaBulundu', { gap: 1 });
          }
        } });
    }
    // gizli hazineler: yarı gömülü ışıklı palamutlar (alanların kenarında)
    if (T && K) {
      const kA = new Kit();
      kA.add(G.sphere(16, 12), 0xffc86a, [0, 0, 0], null, [0.55, 0.7, 0.55]);
      kA.add(G.sphere(16, 8), 0x8a5a34, [0, 0.42, 0], null, [0.62, 0.32, 0.62]);
      kA.add(G.cyl(1, 1, 8), 0x6a4428, [0, 0.78, 0], null, [0.07, 0.25, 0.07]);
      const acorn = api.dispose(kA.build());
      const spots = [];
      for (const ai of [0, 2, 3]) {
        const a = (L.areas || [])[ai]; if (!a) continue;
        const rm = L.rooms[a.rooms[a.rooms.length - 1]], rs = K.rimSpots(L, rm, 0.6, 20).filter(s => fN(s.x, s.z) >= 99 && hyp(s.x - L.start.x, s.z - L.start.z) > 6);
        if (rs.length) spots.push(rs[(rnd() * rs.length) | 0]);
      }
      if (merdivenBase && isF(merdivenBase.x, merdivenBase.z)) spots.push(merdivenBase);
      spots.forEach((s, i) => { K.treasure(api, T, s.x, s.z, acorn, { y: 0.35, sc: 1, line: i === 0 ? 'b01_palamut' : null, gold: 12, n: 7, gs: i === spots.length - 1, sticker: i === 1 ? 'mantar_palamut' : null, hintY: 2.0, cast: false }); api.glow(s.x, s.z, 1.6, 0xffd88a, 0.25); });
    }
    yield;

    // ── canlı dünya: dere sıçraması, damla sesleri, öğretim cümleleri, boss kutlaması ──
    let tt = 0, splashT = 0, dripT = 3, cheerT = -1, cbx = 0, cbz = 0, rainT = 0, zT = 0, prevHp = null, welcomed = false, wT = 0, firstCheer = false, arenaSaid = false;
    const nearStream = (x, z) => { for (const S of streams) for (let i = 0; i < S.sp.length; i += 1) { const q = S.sp[i]; if (dist2(q.x, q.z, x, z) < (S.w * 0.9) * (S.w * 0.9)) return true; } return false; };
    let lastX = 0, lastZ = 0;
    api.anim((dt, hx, hz) => {
      tt += dt;
      if (!inZone()) return;
      const P = GAME.P;
      // dere: içinden yürüyünce ışıltılı su sıçrar
      if (streams.length && live()) {
        const mv = hyp(hx - lastX, hz - lastZ) > dt * 0.8;
        if ((splashT -= dt) <= 0 && mv && nearStream(hx, hz)) { splashT = 0.22; burst('sparkle', hx, 0.25, hz, { color: '#9ff4ff', count: 3 }); burst('bubbles', hx, 0.15, hz, { count: 2 }); if (Math.random() < 0.4) sfx('splash', { x: hx, z: hz, vol: 0.35, pitch: 1.3 + Math.random() * 0.3 }); say('b01_dere'); }
        if ((dripT -= dt) <= 0) { dripT = 2.5 + Math.random() * 4; const S = streams[(Math.random() * streams.length) | 0], q = S.sp[(Math.random() * S.sp.length) | 0]; if (dist2(q.x, q.z, hx, hz) < 400) { sfx('damla', { x: q.x, z: q.z, vol: 0.5, pitch: 0.9 + Math.random() * 0.4 }); burst('sparkle', q.x, 0.2, q.z, { color: '#c8fff8', count: 2 }); } }
      }
      lastX = hx; lastZ = hz;
      // öğretim: hoş geldin → ilk huysuzu görünce dokun → ilk neşelenmede Pırıl sevinir
      if (live()) {
        wT += dt;
        if (!welcomed && wT > 2.5) welcomed = true;   // (bölüm girişi cümlesini STORY söyler)
        if (welcomed && wT > 12 && !said.has('b01_surukle') && hyp(hx - L.start.x, hz - L.start.z) < 3) say('b01_surukle');
        if (!said.has('b01_ogretVur')) { for (const e of GAME.enemies) if (!e.dead && !e.boss && dist2(e.x, e.z, hx, hz) < 49) { say('b01_ogretVur', { gap: 2 }); break; } }
        // (QA5: sis aynı odada başlıyor → tünel cümlesi sis cümlesini yutuyordu; sis varken söylenmez)
        if (a4 && !said.has('b01_tunel') && !(MANTAR._sis && MANTAR._sis.room)) { const r = L.rooms[a4.rooms[0]]; if (r && dist2(r.x, r.z, hx, hz) < r.r * r.r) say('b01_tunel'); }
        if (ar && !arenaSaid && dist2(ar.x, ar.z, hx, hz) < (ar.r + 6) * (ar.r + 6)) arenaSaid = true;   // (arena cümlesi STORY'nin)
      }
      // boss kutlaması: neşelenince peri halkası ve arena mantarları ışıl ışıl, havaya ışık tozu fıskiyeleri
      const b = GAME.boss;
      if (b && b.type === 'kocaPofudukMantar') { if (b.dead && prevHp !== null && cheerT < 0) cheerT = 0; prevHp = b.hp; }
      if (cheerT === 0 && b) { cbx = b.x; cbz = b.z; }
      if (cheerT >= 0 && cheerT < 8) {   // sevimli son: Feza ile Pırıl'a ışık sporu yağar, mantarcıklar dans eder, Koca Pofuduk uyur
        const t1 = cheerT;
        dancers.forEach((M, i) => {
          const on = t1 > 1.2 && t1 < 4.6;
          if (on !== M.g.visible) { M.g.visible = on; burst('sparkle', M.g.position.x, 0.5, M.g.position.z, { color: '#fff0a8', count: 5 }); if (on) sfx('mantarBoing', { x: cbx, z: cbz, vol: 0.5, pitch: 1.2 + i * 0.1 }); }
          if (!on) return;
          const a = i / dancers.length * TAU + t1 * 0.6, r = 2.9;
          M.g.position.set(cbx + Math.sin(a) * r, Math.abs(Math.sin(t1 * 7 + i * 1.3)) * 0.45, cbz + Math.cos(a) * r);
          M.g.rotation.y = t1 * 4 + i; const k = 1 + 0.15 * Math.sin(t1 * 14 + i); M.g.scale.set(k, 2 - k, k);
        });
        // QA6: her Zzz patlaması 3 harf, 1 s'ye yayılır ve 1,7 s yaşar (~2,7 s ekranda) → 4,6-5,6'da çıkanlar boss kaybolduktan (~5,8 s) sonra boşlukta asılı kalıyordu
        if (t1 > 2.2 && t1 < 3.0 && (zT -= dt) <= 0) { zT = 0.7; burst('zzz', cbx + 0.6, 3.4, cbz + 0.8, {}); }
      }
      if (cheerT >= 0 && ar) {
        const n0 = Math.floor(cheerT / 0.25); cheerT += dt; const n1 = Math.floor(cheerT / 0.25);
        if (arenaGlow) { const k = cheerT < 6 ? 1.2 + 1.4 * Math.abs(Math.sin(cheerT * 4)) : 1.8; arenaGlow.material.color.setScalar(k); }
      }
      if (!firstCheer && P && P.cikartmalar && P.cikartmalar.zipMantarcik) { firstCheer = true; say('b01_ilkNese', { gap: 1 }); }
      for (const f of anims) f(dt, tt);
    });
    // ═══ Sis tüneli sürprizi (4. alan): ışıklı mantarlar sırayla söner → Pırıl'a dokun → ışık nefesi → mantarlar yanar, sis çekilir ═══
    const sis = { st: 0, k: 0, t: 0, lamps: [], tap: false, init: false, said: 0, seker: false };
    MANTAR._sis = sis;
    const a4rooms = a4 ? a4.rooms.map(ri => L.rooms[ri]) : [];
    // QA5: sis tünelin İLK odasında (ikinci oda arenanın dibindeydi: sis cümleleri boss uyanışıyla üst üste biniyordu)
    sis.room = a4rooms[0] || null;
    const lampStem = api.dispose(lathe(THREE, STEM_P, 10)), lampCap = api.dispose(lathe(THREE, CAP_P, 14));
    // PERF3: tünel lambaları (her biri 3 çizim + kendi 3 malzemesi = 30 çizim) → tek birleşik parça; sönüp yanarken yalnız o
    //   lambanın köşe renkleri güncellenir (değer değişince). Görünüş aynı: şapka gri ↔ kendi rengi, benekler sönük ↔ ışıl ışıl.
    const LS = [];
    let lampG = null;
    function lamp(x, z, ci) {
      const c = CAPS[ci % CAPS.length];
      const o = { x, z, k: 1, hc: c[0], hg: GLOWC[ci % GLOWC.length], c0: new THREE.Color(c[0]), gc: new THREE.Color(GLOWC[ci % GLOWC.length]),
        set(k) { if (k === this.k || !lampG) return; this.k = k;
          const C = lampG.attributes.color, E = lampG.attributes.aE, gk = -(0.1 + 1.9 * k); _cc.copy(grey).lerp(this.c0, k);
          for (let v = this.v0; v < this.v1; v++) { C.setXYZ(v, _cc.r, _cc.g, _cc.b); E.setX(v, 0.02 + 0.3 * k); }
          for (let v = this.v1; v < this.v2; v++) E.setX(v, gk);
          C.needsUpdate = E.needsUpdate = true; } };
      LS.push(o);
      return o;
    }
    const grey = new THREE.Color(0x7a8896);
    if (a4rooms.length && L.path) {
      const rs = new Set(a4rooms), inR = (x, z) => { for (const r of rs) if (hyp(x - r.x, z - r.z) < r.r + 3) return true; return false; };
      let acc = 0, last = null, n = 0;
      for (const p of L.path) {
        if (last) acc += hyp(p.x - last.x, p.z - last.z);
        const prev = last; last = p;
        if (!prev || acc < 4.4 || !inR(p.x, p.z) || n >= 10) continue;
        const yaw = Math.atan2(p.x - prev.x, p.z - prev.z) + PI / 2, sd = n % 2 ? 1 : -1;
        for (let d = 1.3; d < 7; d += 0.5) { const x = p.x + Math.sin(yaw) * sd * d, z = p.z + Math.cos(yaw) * sd * d; if (!isF(x, z)) { sis.lamps.push(lamp(x + Math.sin(yaw) * sd * 0.7, z + Math.cos(yaw) * sd * 0.7, n)); n++; acc = 0; break; } }
      }
    }
    if (LS.length) {
      const parts = [], nS = lampStem.attributes.position.count, nC = lampCap.attributes.position.count, nG = spotG.attributes.position.count;
      let vo = 0;
      for (const o of LS) {
        parts.push([lampStem, 0xf6ecdf, 0, [0.16, 0.9, 0.16], [o.x, 0, o.z]], [lampCap, o.hc, 0.32, [0.5, 0.38, 0.5], [o.x, 0.88, o.z]], [spotG, o.hg, -2.0, [0.5, 0.38, 0.5], [o.x, 0.88, o.z]]);
        o.v0 = vo + nS; o.v1 = o.v0 + nC; o.v2 = o.v1 + nG; vo = o.v2;
      }
      lampG = mergeTint(parts);
      const lm = new THREE.Mesh(lampG, canliMat); lm.name = 'mantar-sis-lambalari'; api.add(lm);
    }
    // sis bulutu: tek çizim, büyük yumuşak gri-mavi lekeler (alçakta, Feza'nın ayak hizasında)
    const mistU = { uSis: { value: 0 } };
    if (a4rooms.length) {
      const N = 28, pos = new Float32Array(N * 3), ph = new Float32Array(N), sz = new Float32Array(N);
      for (let i = 0; i < N; i++) { const r = a4rooms[i % a4rooms.length], a = rnd() * TAU, d = Math.sqrt(rnd()) * (r.r + 3); pos[i * 3] = r.x + Math.sin(a) * d; pos[i * 3 + 1] = 0.5 + rnd() * 0.9; pos[i * 3 + 2] = r.z + Math.cos(a) * d; ph[i] = rnd(); sz[i] = 13 + rnd() * 9; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1)); g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
      const m = new THREE.ShaderMaterial({ uniforms: Object.assign({ uTime: TIME.u }, mistU),
        vertexShader: 'attribute float aPh; attribute float aSize; uniform float uTime; void main(){ vec3 p = position; p.x += sin(uTime * 0.25 + aPh * 6.28) * 0.8; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * (320.0 / max(1.0, -mv.z)); }',
        fragmentShader: 'uniform float uSis; void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; float a = max(0.0, 1.0 - r); a = a * a; gl_FragColor = vec4(0.62, 0.7, 0.8, a * 0.3 * uSis); }',
        transparent: true, depthWrite: false });
      const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 6; pts.name = 'mantar-sis'; api.add(pts); api.dispose(m); api.dispose(g);
    }
    let fogBase = null;
    const PG = () => (typeof PIRIL_GUC !== 'undefined' ? PIRIL_GUC : null);
    const pirilPos = () => { try { const f = PG() && PG().takip(); return f && f.pos ? f.pos : null; } catch (e) { return null; } };
    const clamp01 = v => Math.max(0, Math.min(1, v));
    tapFn = n => { if (inZone()) { sis.tap = true; if (sis.st === 0 && !said.has('b01_pirilDokun')) { /* erken dokunma: sorun değil */ } if (sis.st === 5 || sis.pd === 1) { sis.pd = 2; } } };
    api.anim((dt, hx, hz) => {
      if (!inZone() || !live()) return;
      const P = GAME.P;
      if (!sis.init) {   // bölüm başı: ışık nefesi henüz öğrenilmedi (tünelde öğretilir); ışık parçası alınmışsa açık kalır
        sis.init = true; sis.t0 = 0;
        try { if (PG() && !((P.isiklar || 0) >= 1)) PG().kapat('nefes'); } catch (e) { /* yok */ }
        if (K && L.path) { let acc = 0; for (let i = 1; i < L.path.length; i++) { acc += hyp(L.path[i].x - L.path[i - 1].x, L.path[i].z - L.path[i - 1].z); if (acc > 6 && sis.said < 5) { sis.said++; acc = 0; setTimeout(() => { try { if (inZone()) K.sugar(L.path[i].x, L.path[i].z, 2, 2); } catch (e) { /* yok */ } }, 400 * sis.said); } if (hyp(L.path[i].x - L.start.x, L.path[i].z - L.start.z) > 30) break; } }
      }
      sis.t0 += dt;
      // öğretici sıra: sürükle → şeker (Pırıl yolu gösterir)
      if (!sis.seker && sis.t0 > 22 && hyp(hx - L.start.x, hz - L.start.z) > 3) { sis.seker = true; say('b01_seker'); }
      // Pırıl'a dokun: 3. alana girince
      const a3 = (L.areas || [])[2];
      if (a3 && sis.pd == null) { const r3 = L.rooms[a3.rooms[0]]; if (r3 && dist2(r3.x, r3.z, hx, hz) < r3.r * r3.r * 0.8) { sis.pd = 1; say('b01_pirilDokun', { gap: 3 }); } }
      if (sis.pd === 1 && sis.tap) { sis.pd = 2; }
      if (sis.pd === 2) { sis.pd = 3; setTimeout(() => { if (inZone()) say('b01_ziplamaKikir', { gap: 1 }); }, 600); }
      // QA5: arenaya yaklaştıysa (ya da boss uyandıysa) sis sahnesi biter: sessizce aydınlanır, ışık nefesi açılır (boss cümleleriyle karışmasın)
      const bossNear = (GAME.boss && GAME.boss.aggro) || (ar && dist2(ar.x, ar.z, hx, hz) < (ar.r + 5) * (ar.r + 5));
      if (bossNear && sis.st < 3) {
        try { if (PG()) { PG().ac('nefes'); PG().isikGoster(null); } } catch (e) { /* yok */ }
        if (sis.st === 0) { sis.st = 4; sis.k = 0; sis.lamps.forEach(l => l.set(1)); } else { sis.st = 3; sis.t = 0; }
      }
      // sis durum makinesi
      if (sis.st === 0 && sis.room && dist2(sis.room.x, sis.room.z, hx, hz) < sis.room.r * sis.room.r * 0.6) {
        sis.st = 1; sis.t = 0; say('b01_sis', { gap: 1 }); try { if (PG()) PG().isikGoster(0.12); } catch (e) { /* yok */ }
        if (typeof scene !== 'undefined' && scene.fog && !fogBase) fogBase = { c: scene.fog.color.clone(), n: scene.fog.near, f: scene.fog.far };
      }
      if (sis.st === 1) {
        sis.t += dt; sis.k = clamp01(sis.t / 3);
        sis.lamps.forEach((l, i) => l.set(clamp01(1 - (sis.t - i * 0.28) / 0.5)));
        if (sis.t > 3.3) { sis.st = 2; sis.t = 0; sis.tap = false; say('b01_nefes', { gap: 1 }); try { if (PG()) PG().ac('nefes'); } catch (e) { /* yok */ } }
      } else if (sis.st === 2) {
        sis.t += dt;
        if ((sis.pT = (sis.pT || 0) - dt) <= 0) { sis.pT = 2.2; const pp = pirilPos(); if (pp) burst('sparkle', pp.x, 1.5, pp.z, { color: '#fff2a8', count: 4 }); }
        if (sis.tap && sis.t > 0.8) { sis.st = 3; sis.t = 0; }
        else if (sis.t > 12) { try { if (PG()) PG().kullan(1); } catch (e) { /* yok */ } sis.st = 3; sis.t = 0; }
        if (sis.st === 3) { try { if (PG()) PG().isikGoster(null); } catch (e) { /* yok */ } sfx('bell', { x: hx, z: hz, pitch: 1.3, vol: 0.6 }); say('b01_nefesBitti', { gap: 0.5 }); }
      } else if (sis.st === 3) {
        sis.t += dt; sis.k = clamp01(1 - sis.t / 2.8);
        sis.lamps.forEach((l, i) => { const v = clamp01((sis.t - 0.2 - i * 0.2) / 0.4); l.set(v); if (v > 0 && v < 0.1 && i % 3 === 0) { burst('sparkle', l.x, 1.0, l.z, { color: '#fff0a8', count: 3 }); } });
        if (sis.t > 3 + sis.lamps.length * 0.2) { sis.st = 4; sis.k = 0; sis.lamps.forEach(l => l.set(1)); }
      }
      mistU.uSis.value = sis.k;
      if (fogBase && typeof scene !== 'undefined' && scene.fog) {
        if (sis.k > 0.002) { scene.fog.color.copy(fogBase.c).lerp(grey, sis.k * 0.6); scene.fog.near = fogBase.n * (1 - 0.45 * sis.k); scene.fog.far = fogBase.f * (1 - 0.3 * sis.k); }
        else if (sis.st === 4) { scene.fog.color.copy(fogBase.c); scene.fog.near = fogBase.n; scene.fog.far = fogBase.f; fogBase = null; }
      }
      // Uykulu Mantarcıklar: yavaşça Zzz
      if ((sis.zT = (sis.zT || 0) - dt) <= 0) { sis.zT = 2.4; for (const e of GAME.enemies) if (!e.dead && e.type === 'uykuluMantarcik' && dist2(e.x, e.z, hx, hz) < 225) burst('zzz', e.x + 0.3, 1.1, e.z, {}); }
    });
    // ilk neşelenme Pırıl'ın sevinci (olay ile)
    if (typeof GAME !== 'undefined' && GAME.on && !MANTAR._hooked) {
      MANTAR._hooked = true;
      GAME.on('happy', e => { if (inZone() && e && !e.boss) { if (!said.has('b01_ilkNese')) say('b01_ilkNese', { gap: 1 }); else if (Math.random() < 0.12) say(['b01_aferin1', 'b01_aferin2', 'b01_aferin3'][(Math.random() * 3) | 0], { once: false, gap: 25 }); } });
      // (QA5: b01_pirilBoss kaldırıldı — boss uyanınca giriş + arena cümleleriyle aynı anda üç cümle üst üste biniyordu)
    }
  }

  // ── çıkış kapısı: kapının arkasında ışıklı mantar kemeri (kendi malzemesi: boss neşelenince parlayıp nabız gibi atar),
  //    iki yanda dev ışıklı mantar, yerde ışık havuzu ve bir ışık ──
  // GÜZEL: dokunulacak şeylerin üstündeki dev turuncu ipucu yıldızı yerine küçük, yumuşak ışıklı yuvarlak boncuk
  function softHints(api) {
    const T = OK() && ODAKIT.last; if (!T || !T.list) return;
    const THREE = api.THREE, geo = api.dispose(new THREE.SphereGeometry(0.2, 14, 10)), m = api.dispose(new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff6c8).multiplyScalar(1.3) }));
    for (const it of T.list) if (it.star) {
      it.star.geometry = geo; it.star.material = m; it.star.scale.setScalar(1);
      for (const c of it.star.children) if (c.isSprite) c.scale.setScalar(1.1);
      it.starY = Math.min(it.starY, 1.6); it.star.position.y = it.starY;
    }
  }
  // GÜZEL: motorun kırılabilir fıçı / sandık / vazoları (başka oyundan gibi duruyordu) mantar vadisine uygun görünüşe çevrilir:
  // fıçı → yosunlu mantar kütüğü (üstünde minik ışıklı mantarlar), sandık → palamut sepeti, vazo → kocaman palamut. Oyun aynı (kırılınca şeker).
  function themedBreakables(api) {
    if (typeof scene === 'undefined') return;
    const THREE = api.THREE, kitGeo = f => { const k = new Kit(); f(k); return k.build(); };
    const geo = {
      barrel: kitGeo(k => {
        k.add(G.cyl(0.92, 1, 10), 0x8a5a3c, [0, 0.3, 0], null, [0.36, 0.6, 0.36]);
        k.add(G.cyl(1, 1, 14), 0xd8b48a, [0, 0.605, 0], null, [0.33, 0.02, 0.33]);
        for (const r of [0.12, 0.22]) k.add(G.torus(TAU, 0.06, 12), 0xb08a64, [0, 0.618, 0], [PI / 2, 0, 0], r);
        k.add(G.sphere(7, 4), 0x4a9a62, [0.12, 0.6, -0.1], null, [0.22, 0.07, 0.18]);
        for (const [x, z, h, c] of [[-0.12, 0.08, 0.16, 0x5fd8e8], [0.02, 0.16, 0.12, 0xff7ec8], [-0.18, -0.08, 0.1, 0xfff0a0]]) {
          k.add(G.cyl(1, 1, 6), 0xf4ecdf, [x, 0.62 + h / 2, z], null, [0.025, h, 0.025]);
          k.add(G.sphere(7, 4), c, [x, 0.62 + h, z], null, [0.07, 0.045, 0.07]);
        }
      }),
      crate: kitGeo(k => {
        k.add(G.cyl(1, 0.8, 10), 0xc89058, [0, 0.22, 0], null, [0.42, 0.44, 0.42]);
        for (const y of [0.08, 0.22, 0.36]) k.add(G.torus(TAU, 0.08, 12), 0xa87040, [0, y, 0], [PI / 2, 0, 0], [0.38 + y * 0.1, 0.38 + y * 0.1, 0.3]);
        for (const [x, z] of [[-0.14, 0.05], [0.12, -0.06], [0, 0.14], [0.05, -0.16], [-0.1, -0.12]]) {
          k.add(G.sphere(7, 5), 0x9a6a3a, [x, 0.46, z], null, [0.1, 0.12, 0.1]);
          k.add(G.sphere(7, 4), 0x6a4426, [x, 0.55, z], null, [0.105, 0.05, 0.105]);
        }
        k.add(G.torus(PI, 0.12, 10), 0xa87040, [0, 0.45, 0], null, [0.36, 0.3, 0.36]);
      }),
      vase: kitGeo(k => {
        k.add(G.sphere(10, 7), 0xb07a48, [0, 0.3, 0], null, [0.3, 0.34, 0.3]);
        k.add(G.sphere(10, 6), 0x6a4426, [0, 0.56, 0], null, [0.32, 0.12, 0.32]);
        k.add(G.cyl(1, 1, 8), 0x5a3a20, [0, 0.7, 0], null, [0.03, 0.1, 0.03]);
        k.add(G.sphere(8, 6), 0xfff0a0, [0.12, 0.42, 0.22], null, 0.04);
      }),
    };
    const mat = api.dispose(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0 }));
    for (const g of Object.values(geo)) api.dispose(g);
    const one = new THREE.Color(1, 1, 1);
    scene.traverse(o => {
      if (!o.isInstancedMesh || !/^break-/.test(o.name || '')) return;
      const kind = o.name.slice(6), g = geo[kind] || geo.barrel;
      o.geometry = g; o.material = mat;
      if (o.instanceColor) { for (let i = 0; i < o.count; i++) o.setColorAt(i, one); o.instanceColor.needsUpdate = true; }
      o.computeBoundingSphere();
    });
  }
  // QA4: hazine sandığı mantar vadisine uygun: yosunlu kütük sandık (kabuk gövde, açık renk kesik halkaları), kapağında yosun ve
  // üç küçük ışıklı mantar. Motorun sandığı aynı kalır (açılma, parıltı, ödül); yalnız gövde/kapak geometrisi değişir.
  function themedChests(L, api) {
    if (!L.chestObjs || !L.chestObjs.length) return;
    const THREE = api.THREE, kg = f => { const k = new Kit(); f(k); return api.dispose(k.build()); };
    const BARK = 0x7a4e32, BARK2 = 0x9a6a44, CUT = 0xe2c194, MOSSC = 0x4a9a62;
    const body = kg(k => {
      k.add(G.rbox(2), (x, y, z) => new THREE.Color(BARK).lerp(new THREE.Color(BARK2), 0.5 + 0.5 * Math.sin(x * 40 + y * 9)), [0, 0.27, 0], null, [0.92, 0.54, 0.62]);
      for (const sd of [-1, 1]) { k.add(G.cyl(1, 1, 18), CUT, [sd * 0.465, 0.27, 0], [0, 0, PI / 2], [0.25, 0.02, 0.25]); k.add(G.torus(TAU, 0.08, 18), 0xc8a070, [sd * 0.476, 0.27, 0], [0, PI / 2, 0], 0.15); }
      for (const [x, z, s] of [[-0.38, 0.29, 0.14], [0.36, 0.3, 0.12], [-0.2, 0.31, 0.1]]) k.add(G.sphere(10, 6), MOSSC, [x, 0.06, z], null, [s, s * 0.5, s * 0.6]);
      k.add(G.sphere(12, 8), 0xffd86a, [0, 0.42, 0.315], null, [0.06, 0.07, 0.03]);   // ışıklı kilit boncuğu
    });
    const lid = kg(k => {
      k.add(G.cyl(1, 1, 18, false), (x, y, z) => new THREE.Color(BARK2).lerp(new THREE.Color(BARK), 0.5 + 0.5 * Math.sin(x * 35)), [0, 0.0, 0.31], [0, 0, PI / 2], [0.32, 0.94, 0.32]);
      k.add(G.sphere(12, 8), MOSSC, [0.05, 0.22, 0.31], null, [0.36, 0.12, 0.24]);
      for (const sd of [-1, 1]) k.add(G.cyl(1, 1, 18), CUT, [sd * 0.47, 0.0, 0.31], [0, 0, PI / 2], [0.3, 0.02, 0.3]);
      for (const [x, z, h] of [[-0.18, 0.28, 0.14], [0.02, 0.36, 0.18], [0.2, 0.26, 0.12]]) k.add(G.cyl(1, 1, 6), 0xf4ecdf, [x, 0.26 + h / 2, z], null, [0.025, h, 0.025]);
    });
    const caps = kg(k => { for (const [x, z, h, c] of [[-0.18, 0.28, 0.14, 0x5fd8e8], [0.02, 0.36, 0.18, 0xff7ec8], [0.2, 0.26, 0.12, 0xfff0a0]]) k.add(G.sphere(10, 6), c, [x, 0.26 + h, z], null, [0.08, 0.05, 0.08]); });
    const mat = api.dispose(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0 }));
    const glowM = api.dispose(new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(1.6, 1.6, 1.6) }));
    for (const o of L.chestObjs) {
      const g = o.obj; if (!g) continue;
      const meshes = g.children.filter(c => c.isMesh), piv = g.children.find(c => c.isGroup);
      const bd = meshes.find(m => m.geometry !== (piv && piv.children[0] && piv.children[0].geometry) && m.position.y < 0.1);
      if (bd) { bd.geometry = body; bd.material = mat; }
      const ld = piv && piv.children.find(c => c.isMesh);
      if (ld) { ld.geometry = lid; ld.material = mat; ld.position.y = 0.05; const cm = new THREE.Mesh(caps, glowM); cm.position.copy(ld.position); piv.add(cm); }
    }
  }
  function kurSon(L, api) {
    api = sadeApi(api);
    try { themedChests(L, api); } catch (e) { console.warn('mantar sandık', e); }
    try { softHints(api); } catch (e) { console.warn('mantar ipucu', e); }
    try { themedBreakables(api); } catch (e) { console.warn('mantar kırılabilir', e); }
    const ex = L.exit; if (!ex) return;
    const THREE = api.THREE, k = new Kit(), kd = new Kit(), c = new THREE.Color();
    const po = L.portalObj && L.portalObj.obj, px = po ? po.position.x : ex.x, pz = po ? po.position.z : ex.z, yaw = po ? po.rotation.y : 0;
    const cs = Math.cos(yaw), sn = Math.sin(yaw), at = (lx, y, lz) => [px + lx * cs + lz * sn, y, pz - lx * sn + lz * cs];
    const RX = 3.0, RY = 5.4, N = 15;
    for (let i = 0; i <= N; i++) {   // kemer boyunca ışıklı mantar şapkaları + aralarda parıltı topları
      const t = i / N * PI, lx = Math.cos(t) * RX, y = Math.sin(t) * (RY - 1.6) + 1.6 * Math.min(1, Math.sin(t) * 3), p = at(lx, Math.max(0.4, y), -0.6);
      c.set(GLOWC[i % GLOWC.length]);
      k.add(G.sphere(10, 6), c, p, [0, 0, 0], [0.34, 0.2, 0.34]);
      k.add(G.sphere(8, 5), c.clone().lerp(new THREE.Color(1, 1, 1), 0.5), [p[0], p[1] - 0.2, p[2]], null, 0.12);
      kd.add(G.cyl(1, 1, 6), 0xf4ecdf, [p[0], p[1] - 0.25, p[2]], null, [0.07, 0.3, 0.07]);
    }
    for (const sd of [-1, 1]) {   // yanlardaki dev mantarların şapka altı ışıltısı
      const p = at(sd * (RX + 0.6), 3.25, -0.6);
      k.add(G.cyl(1, 0.8, 16), new THREE.Color(sd < 0 ? 0xffb8f0 : 0xa8fff4), p, null, [1.3, 0.08, 1.3]);
      const q = at(sd * (RX + 0.6), 0, -0.6);
      kd.add(G.cyl(0.9, 1, 12), 0xf6ecdf, [q[0], 1.7, q[2]], null, [0.42, 3.4, 0.42]);
      kd.add(G.sphere(16, 10), sd < 0 ? 0xff7ec8 : 0x6fa8ff, [q[0], 3.45, q[2]], null, [1.5, 0.7, 1.5]);
    }
    const gm = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(0.9, 0.9, 0.9) });
    const gmesh = new THREE.Mesh(k.build(), gm); gmesh.name = 'mantar-cikis-kemeri'; api.add(gmesh); api.dispose(gm); api.dispose(gmesh.geometry);
    const dm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, emissive: new THREE.Color(0x40304a), emissiveIntensity: 0.4 });
    const dmesh = new THREE.Mesh(kd.build(), dm); dmesh.castShadow = true; dmesh.name = 'mantar-cikis-mantarlari'; api.add(dmesh); api.dispose(dm); api.dispose(dmesh.geometry);
    api.glow(px, pz, 4, 0xfff0a8, 0.25);
    api.light(px, 3.2, pz + 0.8, 0xffe0f8, 3.5, 10, 0.1);
    let t = 0, on = 0;
    api.anim(dt => {
      t += dt;
      const b = typeof GAME !== 'undefined' ? GAME.boss : null, open = !!(L.portalObj && L.portalObj.active) || !!(b && b.dead && b.type === 'kocaPofudukMantar') || !(b && b.type === 'kocaPofudukMantar');
      on = damp(on, open ? 1 : 0, 1.5, dt);
      const k2 = 0.75 + on * (1.6 + 0.7 * Math.sin(t * 3.2));
      gm.color.setScalar(k2);
      if (on > 0.5 && Math.random() < dt * 4) { const u = Math.random() * PI, p = at(Math.cos(u) * RX, Math.sin(u) * (RY - 1.6) + 1.2, -0.6); burst('sparkle', p[0], p[1], p[2], { color: '#fff0a8', count: 2 }); }
    });
  }

  BOLUM.define('mantar', {
    ad: 'Işıklı Mantar Vadisi',
    taban: 'forest',
    size: 100, side: 2,
    areas: [{ id: 'a1', ad: 'Parıltı Çayırı', rooms: 2 }, { id: 'a2', ad: 'Dev Mantar Ormanı', rooms: 2 }, { id: 'a3', ad: 'Işıklı Dere', rooms: 2 }, { id: 'a4', ad: 'Kök Tünelleri', rooms: 2 }],
    muzik: 'pr_mantar',
    malzeme: 'isik1',
    kayipEsya: null,
    final: false,
    // GÜZEL2: "parlak alacakaranlık" biraz daha sıcak ve aydınlık (bulanık koyu turkuaz yerine; sis daha açık mavi-turkuaz)
    isik: { fog: [0x2f5c7c, 36, 92], hemiSky: 0xb4e0ff, hemiGround: 0x2f6a5e, hemi: 1.16, sunColor: 0xffe6c4, sun: 1.85, sunOffset: [-12, 26, 12],
      env: [0x6a9ac0, 0xa8d8e8, 0x1c4040, 0.8], bloom: 0.35, exposure: 1.1, sat: 1.08, vig: 0.24, fezaLight: 1.6, fezaLightColor: 0xfff0d8, moss: [0x3a8a6a, 0.6], rim: [0xc8f0ff, 0.18] },
    zemin: { tA: 0x60c096, tB: 0xeedfb0, tC: 0xd8caa0, out: 0x1c3a52, outAmt: 0.75, macro: 0xdaffda },   // GÜZEL2: çimen bulanık mavi yerine taze yosun yeşili-turkuaz
    minimap: { zemin: '#6a9a8a' },
    harita: { ad: 'Işıklı Mantar Vadisi', detay: 'Parlayan dev mantarlar, ışıklı dere ve Koca Pofuduk Mantar', renk: '#5fd8c8', x: 14, y: 68, simge: '🍄' },
    yolculuk: { arac: 'dere', cumle: 'b01_yolculuk' },   // TODO(MOTOR1): şema onaylanınca uyarla (köpük gölüne akan ışıklı dere)
    yerlesim,
    kur,
    kurSon,
  });
  return { _hooked: false };
})();
