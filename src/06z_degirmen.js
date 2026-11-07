/* ── Bölüm 4: Altın Değirmen Vadisi (Feza ve Pırıl: Büyük Fener) ──
   Sessiz Sis altın başaklı vadideki değirmen kasabasının çarklarını durdurmuş. Feza ve Pırıl fırıncı Hala'nın tarifiyle
   un, su ve ateşi toplayıp IŞIK EKMEĞİ pişirir; ekmek kokusu kasabayı ve Değirmen Bekçisi'ni uyandırır.
     1. Altın Tarlalar            başaklar arasında yürüyüş; 5 başak demetini topla (un)
     2. Berrak Dere ve Köprüler   ahşap/taş köprü, su çarkları; kovayı doldur ve dökmeden taşı (su)
     3. Altın Tepeler ve Taş Kemerler   3 Kor Taşı'nı Pırıl'ın ışığıyla uyandır (ateş)
     4. Durmuş Kasaba ve Fırın Meydanı  fırıncı Hala'yı karşıla; hamuru yoğur, fırında pişir (altın bölgede bırak; hata yok)
     Arena: Dev Değirmen — Değirmen Bekçisi (src/05z_degirmen.js). Yan A: Kuzu Ağılı (3 kuzu say). Yan B: Eski Çarklı Kuyu.
   Pişince: ekmek kokusu altın iz olarak değirmene uzanır, kasaba çarkları bir kez döner, un huysuzları yumuşar.
   Bekçi neşelenince Feza ışık ekmeğini ikram eder; çarklar döner, çanlar çalar. Genel ad: DEGIRMEN. Işık: isik4 (4. ışık).
   Biçim: PIRIL.md › 5, src/SPEC.md › kur api. Cümleler: src/02l_degirmen.js (b04_...). Bilbo bu bölümde yok. Mor yalnız Pırıl'ın. */
const DEGIRMEN = (() => {
  'use strict';
  const PI = Math.PI;
  const hyp = Math.hypot;
  const OK = () => typeof ODAKIT !== 'undefined' && ODAKIT;
  const inZone = () => typeof GAME !== 'undefined' && GAME.L && GAME.L.Z && GAME.L.Z.id === 'degirmen';
  const live = () => typeof GAME !== 'undefined' && GAME.state === 'play' && !GAME.paused && GAME.P && !GAME.P.dead;
  const said = new Set();
  let sayAt = -99;
  // anlatıcı / Pırıl cümlesi (kayıt yoksa susar): once → oyun başına bir kez; arada en az 'gap' s
  function say(key, o = {}) {
    if (typeof GAME === 'undefined' || !GAME.halaApi) return false;
    if (!(typeof AUD !== 'undefined' && AUD.LINES && AUD.LINES[key])) return false;
    if (o.once !== false && said.has(key)) return false;
    const now = GAME.time || 0;
    if (!o.force && now - sayAt < (o.gap ?? 5)) return false;
    sayAt = now; said.add(key);
    try { GAME.halaApi.say(key, o.prio || 2); } catch (e) { return false; }
    return true;
  }
  const sfx = (n, o) => { try { if (typeof AUD !== 'undefined' && AUD.sfx) AUD.sfx(n, o); } catch (e) { /* yok */ } };
  const burst = (k, x, y, z, o) => { try { if (typeof FX !== 'undefined' && FX.burst) FX.burst(k, x, y, z, o); } catch (e) { /* yok */ } };
  const ring = (x, z, r, c) => { try { if (typeof FX !== 'undefined' && FX.ring) FX.ring(x, z, r, c); else if (OK()) ODAKIT.ring(x, z, r, c); } catch (e) { /* yok */ } };

  // ── Tarif durumu (bölüme girince sıfırlanır; kayıt gerekmez: bölüm 11 dk) ──
  const R = { un: 0, unN: 5, su: 0, kor: 0, korN: 3, durum: 'pisti', yogur: 0, pisti: true, bekci: false, tutan: null };
  // Ebeveyn: tarif (başak/kova/kor toplama, yoğurma, fırın, tarif çubuğu, çuval duvarı) oyundan kalktı; bölüm düz oynanır.
  const TARIFYOK = true;
  const resetR = () => { R.un = 0; R.su = 0; R.kor = 0; R.durum = TARIFYOK ? 'pisti' : 'topla'; R.yogur = 0; R.pisti = TARIFYOK; R.bekci = false; R.tutan = null; R.yardim = false; };
  const hazir = () => R.un >= R.unN && R.su >= 1 && R.kor >= R.korN;

  // ── Tarif tahtası (alt orta; 3 simge: un, su, ateş; sonra ekmek) ──
  let HUD = null;
  function hudCss() {
    if (document.getElementById('dg-css')) return;
    const st = document.createElement('style'); st.id = 'dg-css';
    st.textContent = `
#dg-tarif{position:fixed;left:50%;bottom:calc(150px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;gap:10px;padding:8px 14px;border-radius:26px;
  background:rgba(255,246,222,.92);border:3px solid #d9a441;box-shadow:0 4px 14px rgba(120,80,20,.25);z-index:30;pointer-events:none;font-family:inherit;transition:opacity .4s}
#dg-tarif .s{position:relative;width:50px;height:50px;border-radius:50%;background:#fff;border:3px solid #e6cf9a;display:flex;align-items:center;justify-content:center;font-size:28px;overflow:hidden}
#dg-tarif .s i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#ffe08a,#f2b84a);opacity:.55;height:0%;transition:height .35s}
#dg-tarif .s b{position:relative;z-index:1;filter:grayscale(.85) opacity(.55);transition:filter .3s}
#dg-tarif .s.ok{border-color:#e9a420;box-shadow:0 0 10px #ffd868}
#dg-tarif .s.ok b{filter:none}
#dg-tarif .s em{position:absolute;right:-1px;bottom:-1px;z-index:2;font-style:normal;font-size:13px;font-weight:700;color:#7a5410;background:#ffe9a8;border-radius:10px;padding:0 5px}
.dg-mini{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(60,40,10,.55);z-index:60;touch-action:none;user-select:none;-webkit-user-select:none}
.dg-mini .t{font-size:26px;font-weight:700;color:#fff6dc;text-shadow:0 2px 6px rgba(80,50,10,.7);margin-bottom:10px;text-align:center}
.dg-mini canvas{border-radius:50%;touch-action:none;background:transparent}
.dg-hearts{font-size:40px;letter-spacing:8px;margin-top:8px}
.dg-bar{position:relative;width:min(70vw,520px);height:52px;border-radius:26px;background:#fff6dc;border:4px solid #8a5a34;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,.35)}
.dg-bar .z{position:absolute;top:0;bottom:0;background:linear-gradient(#ffe36a,#f2b21c);box-shadow:inset 0 0 12px #fff6a8}
.dg-bar .f{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(#ffb36a,#e8602a);opacity:.9}
.dg-btn{margin-top:22px;width:150px;height:150px;border-radius:50%;border:6px solid #fff0c0;background:radial-gradient(circle at 35% 30%,#c9a8ff,#8a5ae0);color:#fff;font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.4)}
.dg-btn.on{transform:scale(.94);box-shadow:0 0 30px #ffe9a0}
`;
    document.head.appendChild(st);
  }
  function hudMake() {
    hudCss();
    const old = document.getElementById('dg-tarif'); if (old) old.remove();
    const d = document.createElement('div'); d.id = 'dg-tarif';
    d.innerHTML = ['🌾', '💧', '🔥', '🍞'].map(e => `<div class="s"><i></i><b>${e}</b><em></em></div>`).join('');
    (document.getElementById('ui') || document.body).appendChild(d);
    HUD = { d, s: [...d.querySelectorAll('.s')], last: '' };
    hudUpdate();
  }
  function hudUpdate() {
    if (!HUD) return;
    const v = [[R.un / R.unN, R.un + '/' + R.unN, R.un >= R.unN], [R.su >= 1 ? 1 : 0, '', R.su >= 1], [R.kor / R.korN, R.kor + '/' + R.korN, R.kor >= R.korN], [R.pisti ? 1 : R.durum === 'pisir' ? 0.5 : 0, '', R.pisti]];
    const key = JSON.stringify(v); if (key === HUD.last) return; HUD.last = key;
    v.forEach(([k, t, ok], i) => { const el = HUD.s[i]; el.querySelector('i').style.height = (k * 100) + '%'; el.querySelector('em').textContent = t; el.querySelector('em').style.display = t ? '' : 'none'; el.classList.toggle('ok', ok); });
  }
  function hudHide() { const d = document.getElementById('dg-tarif'); if (d) d.remove(); HUD = null; }

  function lathe(THREE, pts, seg) { return new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg); }
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
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 5; pts.name = 'degirmen-toz';
    api.add(pts); api.dispose(m); api.dispose(g);
    return pts;
  }

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
          float e = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
          float f = sin(vUv.x * 1.3 - uTime * 1.4 + sin(vUv.y * 6.0 + vUv.x * 0.6) * 1.2) * 0.5 + 0.5;
          float g = sin(vUv.x * 3.1 - uTime * 2.2 + vUv.y * 4.0) * 0.5 + 0.5;
          float sp = pow(max(0.0, sin(vUv.x * 7.3 - uTime * 2.4 + vUv.y * 15.0) * sin(vUv.x * 3.9 + uTime * 1.1 - vUv.y * 9.0)), 12.0);
          vec3 sand = vec3(0.86, 0.78, 0.55);
          vec3 water = mix(vec3(0.30, 0.74, 0.86), vec3(0.62, 0.92, 0.96), f * 0.5 + g * 0.2);
          float depth = smoothstep(0.1, 0.5, vUv.y) * smoothstep(0.9, 0.5, vUv.y);
          vec3 c = mix(sand, water, 0.45 + 0.4 * depth) + vec3(1.0, 1.0, 0.9) * sp * 0.4;
          float rim = (1.0 - smoothstep(0.04, 0.22, vUv.y)) + smoothstep(0.78, 0.96, vUv.y);
          c = mix(c, vec3(0.95, 0.97, 0.9), rim * 0.35);
          gl_FragColor = vec4(c, e * 0.88);
        }`,
      transparent: true, depthWrite: false,
    });
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 1; mesh.name = 'degirmen-dere';
    api.add(mesh); api.dispose(m); api.dispose(g);
    return { mesh, sp };
  }

  function floor(L, api) {
    if (typeof ZEMIN !== 'undefined') { const z = ZEMIN.kur(L, api, 'degirmen'); if (z) return z.mesh; }   // G1: ortak zemin kiti
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
          float n1 = mzN(p * 0.16), n2 = mzN(p * 0.9 + 3.1), n3 = mzN(p * 3.3 + 7.7);
          // altın tarla zemini: soluk saman-toprak, geniş yumuşak ton dalgası, ince başak çizgileri (düşük kontrast)
          vec3 soil = mix(vec3(0.78, 0.66, 0.38), vec3(0.86, 0.75, 0.46), smoothstep(0.2, 0.8, n1));
          float st = smoothstep(0.7, 1.0, abs(sin(p.x * 5.0 + n2 * 4.0))) * 0.06;
          soil *= 1.0 - st; soil *= 0.95 + 0.08 * n3;
          float gr = smoothstep(0.62, 0.8, mzN(p * 2.7 + 1.7));
          soil = mix(soil, vec3(0.62, 0.7, 0.34), gr * 0.35);
          // yol: açık krem çakıl (yuvarlak taşçıklar)
          vec2 cg = p * 2.6, ci = floor(cg); vec2 co = fract(cg) - 0.5 - (vec2(mzH(ci + 1.3), mzH(ci + 5.1)) - 0.5) * 0.5;
          float peb = smoothstep(0.42, 0.18, length(co));
          vec3 path = mix(vec3(0.78, 0.72, 0.58), vec3(0.88, 0.82, 0.68), peb * (0.6 + 0.4 * mzH(ci))) * (0.95 + 0.1 * n2);
          float wPath = smoothstep(0.25, 0.75, mzL.r) * mzL.g;
          vec3 col = mix(soil, path, wPath);
          col *= mix(0.45, 1.0, smoothstep(0.1, 0.9, mzL.g));   // yürünmez alan biraz koyu
          diffuseColor.rgb *= col;
          mzE = vec3(0.0);
          mzE += vec3(1.0, 0.9, 0.6) * wPath * 0.03;`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          vec3 mzG = texture2D(tGlowM, vMzW.xz * uGInv).rgb * 3.0;
          totalEmissiveRadiance += mzE + mzG * (diffuseColor.rgb + 0.07);`);
    };
    mat.customProgramCacheKey = () => 'degirmen-zemin'; mat.userData.U = U;
    api.dispose(mat);
    const g = new THREE.PlaneGeometry(W + 80, H + 80); g.rotateX(-PI / 2); g.translate(L.W / 2, 0, L.H / 2); api.dispose(g);
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.name = 'degirmen-zemin'; m.position.y = -0.002;
    api.add(m);
    if (api.floor) api.floor.visible = false;
    return m;
  }


  // ════════════════ Mini etkinlikler: yoğurma + pişirme (MINIGAME çerçevesi; dünya durur; hata yok) ════════════════
  function registerMini() {
    if (typeof MINIGAME === 'undefined' || !MINIGAME || !MINIGAME.register) return;
    if (!MINIGAME.get('dg_yogur')) MINIGAME.register('dg_yogur', {
      ad: 'Hamur Yoğurma', gizli: true, holdsWorld: true,
      start(ctx) {
        hudCss();
        const root = document.createElement('div'); root.className = 'dg-mini';
        root.innerHTML = '<div class="t">Hamuru parmağınla çevir!</div><canvas width="300" height="300"></canvas><div class="dg-hearts">🤍🤍🤍</div>';
        ctx.root.appendChild(root);
        const cv = root.querySelector('canvas'), g = cv.getContext('2d'), hh = root.querySelector('.dg-hearts');
        const D = ctx.data; D.acc = 0; D.laps = 0; D.last = null; D.idle = 0; D.wob = 0; D.done = 0; D.ang = 0;
        const ang = e => { const r = cv.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
        cv.addEventListener('pointerdown', e => { D.last = ang(e); D.idle = 0; D.acc += 0.4; D.wob = 1; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* yok */ } });
        cv.addEventListener('pointermove', e => {
          if (D.last === null) return;
          const a = ang(e); let d = a - D.last; if (d > PI) d -= 2 * PI; if (d < -PI) d += 2 * PI;
          D.last = a; D.acc += Math.abs(d); D.idle = 0; D.wob = Math.min(1, D.wob + Math.abs(d) * 0.6);
        });
        const up = () => { D.last = null; };
        cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
        D.draw = () => {
          g.clearRect(0, 0, 300, 300);
          const w = D.wob, t = ctx.t, cx = 150, cy = 150;
          g.save(); g.translate(cx, cy);
          g.fillStyle = 'rgba(138,90,52,.9)'; g.beginPath(); g.arc(0, 0, 146, 0, 2 * PI); g.fill();               // tahta tezgâh
          g.fillStyle = '#f6e4b8'; g.beginPath();
          for (let i = 0; i <= 48; i++) { const a = i / 48 * 2 * PI, r = 96 + 8 * w * Math.sin(a * 3 + t * 6) + 4 * Math.sin(a * 2 + D.acc * 2); i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
          g.closePath(); g.fill();
          g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-28, -32, 34, 20, -0.5, 0, 2 * PI); g.fill();
          g.strokeStyle = 'rgba(240,170,40,.95)'; g.lineWidth = 7; g.setLineDash([16, 14]); g.lineDashOffset = -t * 40; g.beginPath(); g.arc(0, 0, 124, 0, 2 * PI); g.stroke(); g.setLineDash([]);   // dön rehberi
          const ha = (D.acc * 1) % (2 * PI) - PI / 2, hand = D.idle > 2.5 || D.acc < 0.6;   // el işareti: ilerleyen rehber
          if (hand) { const a2 = t * 2.4; g.font = '44px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('👆', Math.cos(a2) * 124, Math.sin(a2) * 124); }
          g.restore(); void ha;
          D.wob *= 0.92;
        };
        D.say = false;
        const hs = '🤍🤍🤍'.match(/./gu); void hs; D.hh = hh;
      },
      update(dt, ctx) {
        const D = ctx.data;
        D.idle += dt; if (D.idle > 6) D.acc += dt * 1.2;   // yardım: bekleyince kendiliğinden kıpırdar
        const laps = Math.min(3, Math.floor(D.acc / (2 * PI)));
        if (laps > D.laps) { D.laps = laps; sfx('pop', { pitch: 0.9 + laps * 0.15 }); sfx('bell', { pitch: 1 + laps * 0.12, vol: 0.5 }); }
        D.hh.textContent = '❤️'.repeat(D.laps) + '🤍'.repeat(3 - D.laps);
        D.draw();
        if (D.laps >= 3) { D.done += dt; if (D.done > 0.9) return 'done'; }
      },
      end(ctx) { R.mgOK = ctx.data.laps >= 3; return R.mgOK ? 1 : 0; },
    });
    if (!MINIGAME.get('dg_pisir')) MINIGAME.register('dg_pisir', {
      ad: 'Işık Ekmeği Pişirme', gizli: true, holdsWorld: true,
      start(ctx) {
        hudCss();
        const root = document.createElement('div'); root.className = 'dg-mini';
        root.innerHTML = '<div class="t">Basılı tut, altın yerde bırak!</div><div class="dg-bar"><div class="z"></div><div class="f"></div></div><div class="dg-btn">Işık<br>nefesi</div>';
        ctx.root.appendChild(root);
        const D = ctx.data; D.v = 0; D.hold = false; D.zone = [0.52, 0.8]; D.miss = 0; D.done = 0; D.ok = false; D.msg = root.querySelector('.t');
        D.z = root.querySelector('.z'); D.f = root.querySelector('.f'); D.btn = root.querySelector('.dg-btn');
        const setZone = () => { D.z.style.left = (D.zone[0] * 100) + '%'; D.z.style.width = ((D.zone[1] - D.zone[0]) * 100) + '%'; };
        setZone();
        const release = () => {
          if (!D.hold) return; D.hold = false; D.btn.classList.remove('on');
          if (D.ok) return;
          if (D.v >= D.zone[0] && D.v <= D.zone[1]) { D.ok = true; D.msg.textContent = 'Tam zamanında!'; sfx('bell', { pitch: 1.3 }); sfx('unlock', { vol: 0.6 }); say('b04_pisir_aferin', { gap: 0, force: true }); }
          else if (D.v > 0.04) { D.miss++; D.v = 0; D.zone = [Math.max(0.3, D.zone[0] - 0.07), Math.min(0.97, D.zone[1] + 0.07)]; setZone(); D.msg.textContent = 'Bir daha deneyelim!'; sfx('pop', { pitch: 0.7 }); say('b04_pisir_tekrar', { once: false, gap: 4, force: true }); }
        };
        D.release = release;
        const press = e => { if (D.ok) return; D.hold = true; D.btn.classList.add('on'); if (e && e.pointerId !== undefined) { try { D.btn.setPointerCapture(e.pointerId); } catch (x) { /* yok */ } } };
        D.btn.addEventListener('pointerdown', press); D.btn.addEventListener('pointerup', release); D.btn.addEventListener('pointercancel', release);
        D.kd = e => { if (e.code === 'Space' && !e.repeat) { press(); e.preventDefault(); } }; D.ku = e => { if (e.code === 'Space') release(); };
        window.addEventListener('keydown', D.kd); window.addEventListener('keyup', D.ku);
      },
      update(dt, ctx) {
        const D = ctx.data;
        if (!D.ok && D.hold) { D.v += dt * 0.3; if (D.v >= 1) { D.v = 0.999; D.release(); if (!D.ok) { D.v = 0; } } }
        D.f.style.width = (D.v * 100) + '%';
        if (D.ok) { D.done += dt; if (D.done > 1.1) return 'done'; }
      },
      end(ctx) { const D = ctx.data; window.removeEventListener('keydown', D.kd); window.removeEventListener('keyup', D.ku); R.mgOK = !!D.ok; return D.ok ? 1 : 0; },
    });
  }

  // ════════════════ Yerleşim (saf veri) ════════════════
  function yerlesim(L, api) {
    // (taban 'forest' köy meydanı kurar: evler, kuyu, fenerler — vadide kendi kasabamız var)
    if (L.village) { L.village = null; L.solids = (L.solids || []).filter(s => !['well', 'lamp', 'bed', 'fence', 'house', 'sign'].includes(s.tag)); }
    const A = L.areas || [], room = (ai, k = 0) => { const a = A[ai]; return a && !a.boss ? L.rooms[a.rooms[Math.min(k, a.rooms.length - 1)]] : null; };
    const areaOf = {}; A.forEach((a, k) => { if (!a.boss) a.rooms.forEach(ri => { areaOf[ri] = k; }); });
    // Nazik öğretim: başlangıç odasında huysuz yok; 1. alanda yalnız Un Torbacığı/Başak; sonra türler yavaş yavaş gelir
    const LIST = [['unTorbacigi', 'basakHuysuzu'], ['basakHuysuzu', 'unTorbacigi', 'unPufu'], ['unPufu', 'degirmenTasi', 'balMuhallebisi', 'unTorbacigi'], ['unTorbacigi', 'unPufu', 'degirmenTasi', 'balMuhallebisi', 'basakHuysuzu']];
    const CAP = [2, 3, 3, 4], packN = {}, keep = [];
    for (const sp of L.spawns || []) {
      const ai = areaOf[sp.room];
      if (sp.room === 0) continue;
      if (ai === undefined) { keep.push(sp); continue; }   // (yan odalar / arena: olduğu gibi)
      const n = packN[sp.pack] = (packN[sp.pack] || 0) + 1;
      if (n > CAP[ai]) continue;
      const list = LIST[Math.min(ai, LIST.length - 1)];
      sp.type = list[(n - 1 + sp.pack) % list.length];
      if (ai === 0) sp.elite = false;
      if (sp.elite && sp.type !== 'unTorbacigi' && sp.type !== 'degirmenTasi') sp.type = ai >= 2 ? 'degirmenTasi' : 'unTorbacigi';
      delete sp.variant;
      keep.push(sp);
    }
    L.spawns.length = 0; L.spawns.push(...keep);
    const spot = (rm, dx, dz, r = 1) => {
      if (!rm) return null;
      for (let t = 0; t < 30; t++) {
        const x = rm.x + dx + (t ? (api.rnd() - 0.5) * t * 0.4 : 0), z = rm.z + dz + (t ? (api.rnd() - 0.5) * t * 0.4 : 0);
        if (api.isFloor(x, z) && api.circleFree(x, z, r)) return { x, z };
      }
      return null;
    };
    const D = L.dg = { bundles: [], streams: [], bucket: null, stones: [], hala: null, table: null, oven: null, fountain: null, lambs: [], well: null, gate: null };
    const farOK = (p, list, d) => p && hyp(p.x - L.start.x, p.z - L.start.z) > 3 && list.every(q => hyp(q.x - p.x, q.z - p.z) > d);
    // 1) 5 başak demeti: 1. alanın iki odasında (3 + 2)
    for (const [k, n] of [[0, 2], [1, 3]]) {
      const rm = room(0, k); if (!rm) continue;
      for (let t = 0, got = 0; t < 60 && got < n; t++) {
        const a = api.rnd() * TAU, d = rm.r * (0.25 + api.rnd() * 0.45), p = spot(rm, Math.sin(a) * d, Math.cos(a) * d, 0.9);
        if (farOK(p, D.bundles, 3.2)) { D.bundles.push(p); got++; }
      }
    }
    // 2) dere: 2. alanın her odasını yoldan dik keserek geçer (ahşap + taş köprü)
    for (const k of [0, 1]) {
      const rm = room(1, k); if (!rm) continue;
      const ri = L.rooms.indexOf(rm), nb = L.rooms[ri + 1] || L.rooms[ri - 1];
      const dx = nb.x - rm.x, dz = nb.z - rm.z, l = hyp(dx, dz) || 1, nx = -dz / l, nz = dx / l, R0 = rm.r + 7, pts = [];
      for (let i = 0; i <= 8; i++) { const u = i / 8 * 2 - 1, wig = Math.sin(u * 3.1 + k) * 1.2; pts.push([rm.x + nx * u * R0 + dx / l * wig, rm.z + nz * u * R0 + dz / l * wig]); }
      D.streams.push({ pts, room: ri, w: 1.25, k });
    }
    // kova: 1. dere kıyısında yürünür bir noktada (derenin hemen yanı)
    { const S0 = D.streams[0], rm = S0 && L.rooms[S0.room];
      if (rm) {
        let best = null, bd = 1e9;
        for (let t = 0; t < 120; t++) {
          const u = api.rnd(), i = Math.min(S0.pts.length - 2, Math.floor(u * (S0.pts.length - 1))), a = S0.pts[i], b = S0.pts[i + 1], f = u * (S0.pts.length - 1) - i;
          const qx = a[0] + (b[0] - a[0]) * f, qz = a[1] + (b[1] - a[1]) * f, ax = b[0] - a[0], az = b[1] - a[1], al = hyp(ax, az) || 1;
          for (const sd of [-1, 1]) { const x = qx - az / al * sd * (S0.w + 1.3), z = qz + ax / al * sd * (S0.w + 1.3);
            if (api.isFloor(x, z) && api.circleFree(x, z, 0.8) && hyp(x - rm.x, z - rm.z) < rm.r * 0.8) { const dd = hyp(x - rm.x, z - rm.z); if (dd < bd) { bd = dd; best = { x, z, qx, qz }; } } }
        }
        D.bucket = best || spot(rm, 0, 0, 1);
      } }
    // 3) 3 Kor Taşı: 3. alanın iki odasında (2 + 1), yürünür alanın içinde kenara yakın
    for (const [k, n] of [[0, 2], [1, 1]]) {
      const rm = room(2, k); if (!rm) continue;
      for (let t = 0, got = 0; t < 80 && got < n; t++) {
        const a = api.rnd() * TAU, d = rm.r * (0.35 + api.rnd() * 0.35), p = spot(rm, Math.sin(a) * d, Math.cos(a) * d, 1.0);
        if (farOK(p, D.stones, 4)) { D.stones.push(p); got++; }
      }
    }
    // 4) Kasaba: 4. alanın 2. odası = Fırın Meydanı. Fırın kuzeyde (yürünür alanın kuzey ucu), Hala'nın tezgâhı yanında
    const sq = room(3, 1) || room(3, 0);
    if (sq) {
      let nz = sq.z; for (let d = 0; d < sq.r + 8; d += 0.25) { if (!api.isFloor(sq.x, sq.z - d)) break; nz = sq.z - d; }
      D.oven = { x: sq.x, z: Math.min(sq.z, nz + 1.8), bz: nz - 3.4, rm: L.rooms.indexOf(sq) };
      const tp = spot(sq, -3.4, (D.oven.z - sq.z) + 2.0, 1.0) || spot(sq, -3, -1, 1);
      D.table = tp; D.hala = tp ? { x: tp.x + 1.4, z: tp.z - 0.8 } : null;
      if (D.hala && !(api.isFloor(D.hala.x, D.hala.z) && api.circleFree(D.hala.x, D.hala.z, 0.6))) D.hala = spot(sq, -1.5, (D.oven.z - sq.z) + 1.6, 0.6) || { x: sq.x, z: sq.z };
      // Çark Kuşları (yalnız Fırın Meydanı): 3 tane, odanın içinde
      for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.5, p = spot(sq, Math.sin(a) * sq.r * 0.5, Math.cos(a) * sq.r * 0.5, 0.6); if (p) L.spawns.push({ type: 'carkKusu', x: p.x, z: p.z, elite: false, pack: 900 + i, room: L.rooms.indexOf(sq), xpScale: 0.5 }); }
    }
    { const r1 = room(3, 0); if (r1 && OK()) { const rs = ODAKIT.rimSpots(L, r1, 0.8, 16).filter(s => hyp(s.x - L.start.x, s.z - L.start.z) > 8); if (rs.length) D.fountain = rs[(api.rnd() * rs.length) | 0]; } }
    // yan odalar: A = Kuzu Ağılı, B = Eski Çarklı Kuyu
    const side = L.rooms.filter(r => r.kind === 'side');
    if (side[0]) {
      const rm = side[0], cx = rm.x, cz = rm.z;
      for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.3, p = spot(rm, Math.sin(a) * 1.9, Math.cos(a) * 1.9, 0.5); if (p) D.lambs.push(p); }
      D.pen = { x: cx, z: cz, r: Math.min(rm.r * 0.85, 3.6) };
    }
    if (side[1]) { const p = spot(side[1], 0, 0, 1.2); if (p) D.well = p; }
    D.gate = A[4] && A[4].gate ? A[4].gate : null;
    if (TARIFYOK) { D.bundles = []; D.stones = []; D.bucket = null; }
    if (OK() && ODAKIT.extraChests && L.chests) { try { ODAKIT.extraChests(L, api); } catch (e) { /* yok */ } }
  }

  // ── rüzgârda sallanan başak öbeği (tek çizim / 14 m'lik parçalar) ──
  let wheatG = null;
  function wheatGeo() {
    if (wheatG) return wheatG;
    const k = new Kit(), cs = (x, y) => new THREE.Color().setRGB(0.62 + 0.3 * Math.min(1, Math.max(0, y)), 0.52 + 0.28 * Math.min(1, Math.max(0, y)), 0.2);
    const N = 9;
    for (let i = 0; i < N; i++) {
      const a = i / N * TAU * 1.618 + 0.4, r = 0.12 + 0.3 * ((i * 0.37) % 1), tx = Math.sin(a) * r, tz = Math.cos(a) * r, lean = 0.05 + 0.1 * r, hh = 0.82 + 0.22 * ((i * 0.61) % 1);
      k.add(G.cone(3), cs, [tx, hh * 0.5, tz], [Math.cos(a) * lean, 0, -Math.sin(a) * lean], [0.045, hh, 0.045]);
      k.add(G.octa(), 0xf2c94e, [tx + Math.sin(a) * lean * hh, hh + 0.05, tz + Math.cos(a) * lean * hh], [Math.cos(a) * lean, 0, -Math.sin(a) * lean], [0.05, 0.2, 0.05]);
    }
    wheatG = k.build(); wheatG.userData.keep = true; return wheatG;
  }
  let wheatM = null;
  function wheatMat() {
    if (wheatM) return wheatM;
    const m = wheatM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 }); m.userData.keep = true;
    m.onBeforeCompile = sh => {
      sh.uniforms.uWt = TIME.u;
      sh.vertexShader = 'uniform float uWt;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        #ifdef USE_INSTANCING
        float wPh = instanceMatrix[3].x * 0.31 + instanceMatrix[3].z * 0.19;
        float wH = max(position.y, 0.0);
        transformed.x += sin(uWt * 1.5 + wPh) * wH * wH * 0.1;
        transformed.z += cos(uWt * 1.2 + wPh * 1.3) * wH * wH * 0.07;
        #endif`);
    };
    m.customProgramCacheKey = () => 'degirmen-basak';
    return m;
  }
  function wheatField(api, items) {
    if (!items.length) return;
    const THREE = api.THREE, chunks = new Map(), CK = 14;
    for (const it of items) { const key = Math.floor(it.x / CK) * 4096 + Math.floor(it.z / CK); let a = chunks.get(key); if (!a) chunks.set(key, a = []); a.push(it); }
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), e = new THREE.Euler(), c = new THREE.Color();
    for (const list of chunks.values()) {
      const im = new THREE.InstancedMesh(wheatGeo(), wheatMat(), list.length);
      list.forEach((it, i) => { p.set(it.x, 0, it.z); q.setFromEuler(e.set(0, it.yaw || 0, 0)); s.set(it.s, it.h, it.s); m4.compose(p, q, s); im.setMatrixAt(i, m4); im.setColorAt(i, c.set(it.c)); });
      im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.name = 'degirmen-basak'; im.computeBoundingSphere(); api.add(im);
    }
  }
  // Kit ile birleşik küçük nesne (kendi malzemesiyle, gerekirse hareketli)
  function kitMesh(api, kit, o = {}) {
    const THREE = api.THREE;
    const m = new THREE.Mesh(kit.build(), api.dispose(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: o.rough ?? 0.75, metalness: o.metal ?? 0, emissive: new THREE.Color(o.emissive ?? 0x000000), emissiveIntensity: o.ei ?? 0 })));
    m.castShadow = o.cast !== false; m.name = o.name || 'degirmen-nesne'; api.dispose(m.geometry); return m;
  }
  const loafKit = (k, c = 0xd8964a, c2 = 0xf2c46c) => {   // ışık ekmeği
    k.add(G.sphere(16, 10), c, [0, 0.1, 0], null, [0.34, 0.15, 0.2]);
    k.add(G.sphere(14, 8), c2, [0, 0.19, 0], null, [0.28, 0.07, 0.15]);
    for (let i = -1; i <= 1; i++) k.add(G.sphere(8, 5), 0xf6dc96, [i * 0.1, 0.235, 0], [0, 0.5, 0.0], [0.045, 0.012, 0.11]);
  };
  const bucketKit = (k, water = true) => {   // ahşap kova + ip kulp + su
    k.add(G.cyl(1, 0.78, 16), 0xb07a44, [0, 0.2, 0], null, [0.24, 0.4, 0.24]);
    for (const y of [0.1, 0.32]) k.add(G.torus(TAU, 0.07, 18), 0x6a4426, [0, y, 0], [PI / 2, 0, 0], [0.245 - (0.4 - y) * 0.08, 0.245 - (0.4 - y) * 0.08, 0.5]);
    if (water) k.add(G.cyl(1, 1, 16), 0x6fd4ee, [0, 0.38, 0], null, [0.21, 0.025, 0.21]);
    k.add(G.torus(PI, 0.05, 14), 0x8a5a34, [0, 0.4, 0], null, [0.24, 0.26, 0.24]);
  };
  // fırıncı Hala: yer tutucu model (gerçek 04_hala.js fırıncı modeli gelince değişir): kıvırcık saç, bandana, fırıncı şapkası, un lekeli önlük
  function halaStandIn(api) {
    const THREE = api.THREE, k = new Kit(), g = new THREE.Group();
    k.add(G.cone(16), 0xc9604a, [0, 0.62, 0], null, [0.4, 0.9, 0.36]);                          // elbise
    k.add(G.rbox(2), 0xfffaf0, [0, 0.78, 0.17], null, [0.4, 0.62, 0.07]);                         // önlük
    k.add(G.sphere(8, 6), 0xe8dcc0, [0.1, 0.62, 0.21], null, [0.07, 0.05, 0.02]);                 // un lekesi
    k.add(G.sphere(14, 10), 0xc9604a, [0, 1.12, 0], null, [0.24, 0.26, 0.19]);                    // gövde üstü
    for (const sd of [-1, 1]) { k.add(G.cyl(1, 1, 8), 0x8a5a34, [0.12 * sd, 0.1, 0], null, [0.05, 0.2, 0.05]); k.add(G.sphere(8, 6), 0x5a3a24, [0.12 * sd, 0.03, 0.04], null, [0.07, 0.04, 0.09]); }
    for (const sd of [-1, 1]) { k.add(G.cyl(1, 1, 8), 0xf1c9a0, [0.3 * sd, 1.0, 0.06], [0.3 * sd, 0, 0.5 * sd], [0.055, 0.5, 0.055]); k.add(G.sphere(8, 6), 0xf6d4b0, [0.38 * sd, 0.78, 0.14], null, 0.07); }
    k.add(G.sphere(18, 12), 0xf6d4b0, [0, 1.52, 0], null, [0.2, 0.22, 0.2]);                      // yüz
    for (const sd of [-1, 1]) { k.add(G.sphere(8, 6), 0x3a2a24, [0.075 * sd, 1.55, 0.18], null, [0.028, 0.034, 0.02]); k.add(G.sphere(8, 6), 0xf49a9a, [0.12 * sd, 1.49, 0.17], null, [0.045, 0.03, 0.02]); }
    k.add(G.torus(PI, 0.1, 14), 0x8a3a30, [0, 1.46, 0.185], [0, 0, PI], [0.05, 0.03, 0.03]);       // gülümseme
    k.add(G.sphere(8, 6), 0xfffaf0, [-0.11, 1.5, 0.19], null, [0.04, 0.03, 0.02]);                // yanağında un
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 0.21; k.add(G.sphere(8, 6), 0x3a2218, [Math.sin(a) * r, 1.58 + 0.04 * Math.sin(i * 2.3), Math.cos(a) * r * 0.9 - 0.04], null, [0.075, 0.075, 0.075]); }   // kıvırcık saç
    k.add(G.cyl(1, 1, 18), 0xfffaf0, [0, 1.8, -0.01], null, [0.23, 0.24, 0.23]);                  // fırıncı şapkası
    k.add(G.sphere(16, 10), 0xfffaf0, [0, 1.95, 0], null, [0.28, 0.18, 0.28]);
    k.add(G.cyl(1, 1, 18), 0xd9d0bc, [0, 1.69, -0.01], null, [0.235, 0.03, 0.235]);
    const m = kitMesh(api, k, { name: 'degirmen-hala' }); g.add(m); g.scale.setScalar(1.0);
    return g;
  }
  // koyun (Kuzu Ağılı): yünlü yuvarlak gövde, yüz, kulaklar, ayaklar
  const sheepKit = k => {
    for (const [x, y, z, s] of [[0, 0.34, 0, 0.3], [0.12, 0.36, -0.12, 0.2], [-0.12, 0.36, -0.12, 0.2], [0, 0.48, -0.05, 0.2], [0.14, 0.3, 0.1, 0.17], [-0.14, 0.3, 0.1, 0.17]]) k.add(G.sphere(12, 8), 0xfffaf0, [x, y, z], null, s);
    k.add(G.sphere(12, 8), 0x5a4638, [0, 0.4, 0.3], null, [0.12, 0.13, 0.13]);
    for (const sd of [-1, 1]) { k.add(G.sphere(8, 6), 0x5a4638, [0.13 * sd, 0.45, 0.28], [0, 0, sd * 0.8], [0.09, 0.04, 0.05]); k.add(G.sphere(8, 6), 0xffffff, [0.05 * sd, 0.43, 0.41], null, 0.025); k.add(G.cyl(1, 1, 8), 0x5a4638, [0.1 * sd, 0.08, 0.06], null, [0.03, 0.16, 0.03]); k.add(G.cyl(1, 1, 8), 0x5a4638, [0.1 * sd, 0.08, -0.12], null, [0.03, 0.16, 0.03]); }
    k.add(G.sphere(8, 6), 0xffb0b8, [0, 0.36, 0.4], null, [0.03, 0.02, 0.02]);
  };

  // ════════════════ Görsel kurulum ════════════════
  const sadeApi = (api, gk = 0.6, lk = 0.75) => {
    if (api.__sade) return api;
    const g0 = api.glow, l0 = api.light;
    api.__sade = true;
    api.glow = (x, z, r, c, k = 0.15) => g0(x, z, r, c, k * gk);
    api.light = (x, y, z, c, i = 3, d = 7, f = 0) => l0(x, y, z, c, i * lk, d, f * 0.3);
    return api;
  };
  const CREAM = [0xf3e6c8, 0xeadcb8, 0xf7efdc, 0xefdfbe], ROOF = [0xb5532e, 0xc2693a, 0x9e4a2a, 0xb85f34], STONE = [0xa9a191, 0xb8b0a0, 0x98907f, 0xaba393];
  const HILL = [0xe4c466, 0xd3b050, 0xc8c46a, 0xb2c06a, 0xdcbc5a], TREEG = [0x8fb35a, 0x7aa54e, 0x9cbc62], WOOD = 0x8a5a34;
  function* kur(L, api) {
    api = sadeApi(api);
    const THREE = api.THREE, rnd = api.rnd, K = OK() ? ODAKIT : null;
    if (K && K.lowShadow) K.lowShadow(api, 99);
    const put = api.put, isF = (x, z) => api.isFloor(x, z), D = L.dg || {};
    resetR(); registerMini(); hudMake();
    const coneH = (x, z) => { for (let d = 0.5; d <= 14; d += 0.75) { const w = d * 0.45 + 0.8; for (let dx = -w; dx <= w; dx += 0.9) if (isF(x + dx, z - d)) return 0.5 + d * 0.85; } return 99; };
    // ekranın alt kenarı (dikey iPad'de Feza'nın ~6,5 m güneyi): yürünür alanın güneyindeki tepe/ağaç bu çizgiyi aşmasın
    // (QA: dev sarı tepe / yeşil ağaç tacı alt yarıyı kaplıyordu, 8 m kavak Feza'yı örtüyordu)
    const lowH = (x, z) => { for (let d = 0.5; d <= 22; d += 0.75) { const w = Math.min(5, d * 0.5 + 1); for (let dx = -w; dx <= w; dx += 0.9) if (isF(x + dx, z - d)) return Math.max(0.2, 1.1 * (d - 6)); } return 99; };
    const fD = (x, z, m = 8) => (K ? K.floorDist(L, x, z, m) : 9);
    const sph = api.tmp(new THREE.SphereGeometry(1, 12, 8)), sphL = api.tmp(new THREE.SphereGeometry(1, 7, 5)), cyl = api.tmp(new THREE.CylinderGeometry(1, 1, 1, 12)), cylLo = api.tmp(new THREE.CylinderGeometry(1, 1, 1, 6));
    const pyr = api.tmp(new THREE.ConeGeometry(0.7071, 1, 4)), cone = api.tmp(new THREE.ConeGeometry(1, 1, 14)), taper = api.tmp(new THREE.CylinderGeometry(0.72, 1, 1, 16)), dode = api.tmp(new THREE.DodecahedronGeometry(1, 0));
    const pick = a => a[(rnd() * a.length) | 0];
    const ids = L.rooms.map((r, i) => i);
    floor(L, api);
    yield;
    api.dreamEdge();

    // ── yapı taşları ──
    function hill(x, z, s, c, ky = 1) { put(sph, x, -s * 0.35 * ky, z, s * 1.7, s * 0.95 * ky, s * 1.4, c || pick(HILL), rnd() * TAU); }
    function tree(x, z, h) {
      put(cylLo, x, h * 0.3, z, 0.14, h * 0.6, 0.14, 0x7a5230, 0);
      put(sph, x, h * 0.72, z, h * 0.34, h * 0.3, h * 0.34, pick(TREEG), rnd() * TAU); put(sphL, x + 0.2, h * 0.9, z - 0.1, h * 0.22, h * 0.2, h * 0.22, 0xa8c46c, 0);
    }
    function hay(x, z, s) {   // saman balyası (yatık silindir)
      put(cyl, x, s * 0.5, z, s * 0.5, s * 0.8, s * 0.5, 0xe8c456, 0, 0, PI / 2); put(cyl, x, s * 0.5, z, s * 0.51, s * 0.06, s * 0.51, 0xc8a238, 0, 0, PI / 2);
    }
    function sack(x, z, s, c) { put(sph, x, s * 0.4, z, s * 0.42, s * 0.5, s * 0.36, c || 0xefe2c4, rnd() * TAU); put(sphL, x, s * 0.84, z, s * 0.17, s * 0.15, s * 0.17, 0xe0d0aa, 0); }
    function fence(x, z, yaw, len) {
      const cx = Math.cos(yaw), sx = Math.sin(yaw);
      for (const o of [-len / 2, len / 2]) api.box(x + sx * o, 0.45, z + cx * o, 0.13, 0.9, 0.13, WOOD, yaw);
      for (const y of [0.35, 0.68]) api.box(x, y, z, 0.07, 0.08, len, 0xa87040, yaw);
    }
    function wall(x, z, yaw, len, h = 0.55) { api.box(x, h / 2, z, 0.5, h, len, pick(STONE), yaw); api.box(x, h + 0.04, z, 0.62, 0.1, len + 0.05, 0xd8d0be, yaw); }
    function house(x, z, yaw, w, d, h, o = {}) {
      const wc = pick(CREAM), rc = pick(ROOF), cs = Math.cos(yaw), sn = Math.sin(yaw);
      api.box(x, h / 2, z, w, h, d, wc, yaw);
      api.box(x, h * 0.62, z, w + 0.04, 0.1, d + 0.04, WOOD, yaw);                                       // ahşap kuşak
      put(pyr, x, h + w * 0.28, z, w * 1.1 / 0.7071 * 0.7071 + 0.9, w * 0.56, d * 1.1 / 0.7071 * 0.7071 + 0.9, rc, yaw + PI / 4);   // bakır çatı
      api.box(x - sn * w * 0.28 - cs * d * 0.05, h + w * 0.5 + 0.1, z - cs * w * 0.28 + sn * d * 0.05, 0.4, 0.7, 0.4, 0xa39c8c, yaw);   // baca
      const fz = d / 2 + 0.02;   // ön yüz (yerel +z)
      api.box(x + sn * fz, 0.62, z + cs * fz, 0.62, 1.25, 0.06, 0x7a4a26, yaw);                          // kapı
      for (const sd of [-1, 1]) api.box(x + cs * sd * w * 0.3 + sn * fz, h * 0.58, z - sn * sd * w * 0.3 + cs * fz, 0.5, 0.5, 0.06, o.lit ? 0xffe9a0 : 0xd9c690, yaw, undefined, undefined);   // pencereler
    }
    function sails(x, y, z, yaw, r, n = 4) {   // durmuş çark kanatları (kendi çizimi; dönebilir)
      const k = new Kit();
      k.add(G.sphere(10, 8), 0x6a4426, [0, 0, 0], null, 0.22);
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU + PI / 4, sx = Math.sin(a), cy = Math.cos(a), px = cy, py = -sx;
        k.add(G.box(), WOOD, [sx * r * 0.5, cy * r * 0.5, 0], [0, 0, -a], [0.12, r, 0.1]);
        k.add(G.box(), 0xf1e3c2, [sx * r * 0.62 + px * 0.28, cy * r * 0.62 + py * 0.28, 0.03], [0, 0, -a], [r * 0.2, r * 0.7, 0.04]);
      }
      const m = kitMesh(api, k, { name: 'degirmen-carklar' }); m.position.set(x, y, z); m.rotation.y = yaw; api.add(m); return m;
    }
    function waterWheel(x, z, yaw, r) {   // su çarkı: halka + kollar + kepçeler
      const k = new Kit(), N = 10;
      k.add(G.torus(TAU, 0.05, 28), WOOD, [0, 0, 0], null, [r, r, 0.8]); k.add(G.torus(TAU, 0.05, 28), WOOD, [0, 0, 0.7], null, [r, r, 0.8]);
      k.add(G.cyl(1, 1, 10), 0x6a4426, [0, 0, 0.35], [PI / 2, 0, 0], [0.12, 0.9, 0.12]);
      for (let i = 0; i < N; i++) { const a = i / N * TAU; k.add(G.box(), 0xa87040, [Math.sin(a) * r * 0.5, Math.cos(a) * r * 0.5, 0.35], [0, 0, -a], [0.06, r, 0.07]); k.add(G.box(), 0x9a6a3c, [Math.sin(a) * r, Math.cos(a) * r, 0.35], [0, 0, -a], [0.5, 0.1, 0.7]); }
      const m = kitMesh(api, k, { name: 'degirmen-su-carki' }); m.position.set(x, r + 0.2, z); m.rotation.y = yaw; api.add(m); return m;
    }
    const spinners = [];   // { m, k (hız çarpanı) }

    // ── kenar dolgusu: yürünür alanın dışı (kamera önünde alçak, kuzeyde yüksek) ──
    const wheat = []; let nW = 0;
    if (K) K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const maxH = Math.min(maxH0, coneH(x, z)), r = rnd(), lim = Math.min(maxH, lowH(x, z));
      if (fd > 0.8 && nW < 1000 && r < 0.78) { const hh = Math.min(maxH * 0.9, 0.85 + rnd() * 0.45); if (hh > 0.3) { wheat.push({ x, z, h: hh, s: 0.9 + rnd() * 0.6, c: pick([0xffffff, 0xf4e8c8, 0xfff0d0]), yaw: rnd() * TAU }); nW++; } }
      else if (lim >= 3 && fd > 3 && r < 0.9) tree(x, z, Math.min(lim, 2.8 + rnd() * 2.2));
      else if (lim >= 1) hay(x, z, 0.7 + rnd() * 0.4);
    }, { step: 2.5, d0: 1.0, d1: 9, margin: 10 });
    wheatField(api, wheat);
    // (E234) çevre süsleri: buğday sıraları, balyalar, korkuluk, fıçılar, bahçe ağaçları, uzak yel değirmenleri (src/07m_dekor_degirmen.js)
    if (typeof DEGIRMEN_DEKOR !== 'undefined' && typeof EKIT !== 'undefined' && !/dekorsiz/.test(location.search)) {
      try {
        const av = [], ad = (o, r) => { if (o && Number.isFinite(o.x)) av.push({ x: o.x, z: o.z, r }); };
        for (const b of D.bundles || []) ad(b, 1.6); for (const b of D.stones || []) ad(b, 1.6); for (const b of D.lambs || []) ad(b, 1.6);
        ad(D.bucket, 2); ad(D.hala, 3); ad(D.table, 3.5); ad(D.oven, 4.5); ad(D.fountain, 3); ad(D.well, 3); ad(D.gate, 4.5); ad(D.pen, (D.pen && D.pen.r || 3) + 1.5);
        for (const S of D.streams || []) for (let i = 0; i < S.pts.length; i++) ad(S.pts[i], S.w + 1.4);
        DEGIRMEN_DEKOR.olustur(L, api, { avoid: av });
      } catch (e) { console.warn('DEGIRMEN_DEKOR', e); }
    }
    yield;
    // uzak dolgu: altın tepeler
    if (K) K.fill(L, rnd, ids, (x, z, maxH0, fd) => {
      const maxH = Math.min(maxH0, coneH(x, z), lowH(x, z));
      // tepe: tepesi 0,6·s, yerdeki yarıçapı ~1,3·s → yürünür alana uzanmasın ve ekranın altını kaplamasın
      let s = maxH >= 8 ? 4 + rnd() * 4 : maxH > 1.6 ? 1.5 + rnd() * 1.5 : 0.6 + rnd() * 0.5;
      s = Math.min(s, fd / 1.5);
      const lo = lowH(x, z - s), ky = Math.min(1, maxH / (0.6 * s), lo / (0.6 * s));   // (kuzey ucu yürünür alana yakınsa: yassı höyük)
      if (s >= 0.5 && ky > 0.08) hill(x, z, s, undefined, ky);
    }, { step: 5.5, d0: 9, d1: 24, margin: 24 });
    yield;
    // oda kenarları: çit (tarla), taş duvar (tepeler), ev (kasaba)
    if (K) for (const ri of ids) {
      const rm = L.rooms[ri]; if (rm.kind === 'boss') continue;
      const ai = (L.areas || []).findIndex(a => a.rooms.includes(ri)), spots = K.rimSpots(L, rm, 0.8, 14);
      spots.forEach((p, k) => {
        const hmax = coneH(p.x, p.z), yaw = p.a;
        if (ai === 0 || rm.kind === 'side') { if (k % 2 === 0) fence(p.x, p.z, yaw + PI / 2, 2.2); else if (hmax > 1.2) hay(p.x + Math.sin(p.a) * 0.5, p.z + Math.cos(p.a) * 0.5, 0.8); }
        else if (ai === 1) { if (k % 3 === 0) fence(p.x, p.z, yaw + PI / 2, 2.2); else if (k % 3 === 1 && hmax > 1.5) sack(p.x, p.z, 0.8); }
        else if (ai === 2) { wall(p.x, p.z, yaw + PI / 2, 2.4 + rnd()); if (k % 3 === 0 && hmax > 2) put(dode, p.x + Math.sin(p.a) * 1.2, 0.5, p.z + Math.cos(p.a) * 1.2, 0.8, 0.6, 0.7, pick(STONE), rnd() * TAU); }
        else if (ai === 3 && k % 2 === 0 && Math.min(hmax, lowH(p.x + Math.sin(p.a) * 2.3, p.z + Math.cos(p.a) * 2.3 + 1.3)) >= 3.2) house(p.x + Math.sin(p.a) * 2.3, p.z + Math.cos(p.a) * 2.3, p.a + PI, 3.0 + rnd(), 2.6, Math.min(hmax - 0.2, 2.4 + rnd() * 0.8));   // (ev + çatı ~3,2 m: kameranın önüne konmaz)
        else if (ai === 3) wall(p.x, p.z, yaw + PI / 2, 2.2, 0.5);
      });
    }
    yield;
    // taş kemerler (3. alan): kuzey kenarda duvar + kemer (yolun üstünde değil)
    if (K && L.areas && L.areas[2]) for (const ri of L.areas[2].rooms) {
      const rm = L.rooms[ri]; if (rm.kind === 'side') continue;
      for (let t = 0, got = 0; t < 30 && got < 1; t++) {
        const a = PI + (rnd() - 0.5) * 1.2, d = rm.r + 2.4 + rnd(), x = rm.x + Math.sin(a) * d, z = rm.z + Math.cos(a) * d;
        if (isF(x, z) || fD(x, z, 3) < 1.2 || coneH(x, z) < 4.6) continue;
        const yaw = Math.atan2(rm.x - x, rm.z - z) + PI / 2, rx = 1.5, ry = 2.0, cs = Math.cos(yaw), sn = Math.sin(yaw);
        for (const sd of [-1, 1]) api.box(x + cs * sd * rx, ry * 0.5, z - sn * sd * rx, 0.7, ry, 0.8, pick(STONE), yaw);
        for (let i = 1; i < 8; i++) { const tt = i / 8 * PI, lx = Math.cos(tt) * rx, ly = ry + Math.sin(tt) * 1.1; api.box(x + cs * lx, ly, z - sn * lx, 0.62, 0.55, 0.8, pick(STONE), yaw + 0); }
        api.box(x, ry + 1.35, z, 0.7, 0.45, 0.85, 0xd8d0be, yaw);
        wall(x + cs * (rx + 1.6), z - sn * (rx + 1.6), yaw, 2.4, 1.1); wall(x - cs * (rx + 1.6), z + sn * (rx + 1.6), yaw, 2.4, 1.1);
        got++;
      }
    }
    yield;

    // ── 2. alan: berrak dere + köprüler + su çarkları ──
    const streams = [], rimSet = [];
    for (const S of D.streams || []) {
      const st = streamMesh(api, S.pts, S.w); streams.push({ sp: st.sp, w: S.w });
      for (let i = 0; i < st.sp.length; i += 2) {   // kıyı: taşlar + sazlık (iri olan yürünür alanın dışında)
        const p = st.sp[i], q = st.sp[Math.min(st.sp.length - 1, i + 1)], dx = q.x - p.x, dz = q.z - p.z, l = hyp(dx, dz) || 1;
        for (const sd of [-1, 1]) {
          const x = p.x - dz / l * sd * (S.w + 0.5 + rnd() * 0.4), z = p.z + dx / l * sd * (S.w + 0.5 + rnd() * 0.4);
          if (isF(x, z)) { if (rnd() < 0.4) put(dode, x, 0.08, z, 0.16 + rnd() * 0.12, 0.1, 0.15, pick(STONE), rnd() * TAU); }
          else if (rnd() < 0.5) put(dode, x, 0.2, z, 0.4 + rnd() * 0.4, 0.3, 0.4, pick(STONE), rnd() * TAU);
        }
      }
      // köprü: yolun dereyi geçtiği yerde (k=0 ahşap, k=1 taş)
      const rm = L.rooms[S.room];
      let bx = rm.x, bz = rm.z, bd = 1e9;
      for (const p of L.path || []) for (const q of st.sp) { const d2 = dist2(p.x, p.z, q.x, q.z); if (d2 < bd) { bd = d2; bx = q.x; bz = q.z; } }
      let ang = 0, best = 1e9; for (const q of st.sp) { const d2 = dist2(q.x, q.z, bx, bz); if (d2 < best && d2 > 0.5) { best = d2; ang = Math.atan2(q.x - bx, q.z - bz); } }
      const ax = Math.sin(ang + PI / 2), az = Math.cos(ang + PI / 2), fx = Math.sin(ang), fz = Math.cos(ang);   // (ax,az): yürüyüş yönü, (fx,fz): akış yönü
      if (S.k === 0) {
        for (let i = -4; i <= 4; i++) api.box(bx + ax * i * 0.62, 0.06, bz + az * i * 0.62, 0.58, 0.1, 2.9, i % 2 ? 0xb07a44 : 0xa06c3a, ang);   // ahşap tahtalar
        for (const sd of [-1, 1]) { api.box(bx + fx * sd * 1.5, 0.45, bz + fz * sd * 1.5, 0.12, 0.08, 5.6, WOOD, ang + PI / 2 - PI / 2 + 0); for (let i = -2; i <= 2; i++) api.box(bx + ax * i * 1.2 + fx * sd * 1.5, 0.3, bz + az * i * 1.2 + fz * sd * 1.5, 0.12, 0.6, 0.12, WOOD, ang); }
      } else {
        for (let i = -3; i <= 3; i++) api.box(bx + ax * i * 0.8, 0.08, bz + az * i * 0.8, 0.78, 0.14, 3.0, pick(STONE), ang);   // taş döşeme
        for (const sd of [-1, 1]) { for (let i = -3; i <= 3; i++) api.box(bx + ax * i * 0.8 + fx * sd * 1.62, 0.3, bz + az * i * 0.8 + fz * sd * 1.62, 0.78, 0.5, 0.26, pick(STONE), ang); api.box(bx + ax * 2.9 + fx * sd * 1.62, 0.45, bz + az * 2.9 + fz * sd * 1.62, 0.5, 0.8, 0.5, 0xd8d0be, ang); api.box(bx - ax * 2.9 + fx * sd * 1.62, 0.45, bz - az * 2.9 + fz * sd * 1.62, 0.5, 0.8, 0.5, 0xd8d0be, ang); }
      }
      api.glow(bx, bz, 3, 0xd8f8ff, 0.1);
      D['köprü' + S.k] = { x: bx, z: bz };
      // su çarkı: kıyıda yürünmez bir yerde
      for (let i = 4; i < st.sp.length - 4; i += 3) {
        const p = st.sp[i], q = st.sp[i + 1], dx = q.x - p.x, dz = q.z - p.z, l = hyp(dx, dz) || 1;
        let done = false;
        for (const sd of [-1, 1]) { const d0 = S.w + 2.4, x = p.x - dz / l * sd * d0, z = p.z + dx / l * sd * d0; if (!isF(x, z) && fD(x, z, 3) > 1.2 && hyp(x - bx, z - bz) > 6 && coneH(x, z) > 4) { const m = waterWheel(x, z, Math.atan2(dx, dz), 1.5); spinners.push({ m, k: 0.35, z: 1 }); put(cylLo, x - dz / l * sd * 0.2, 0.25, z + dx / l * sd * 0.2, 0.7, 0.5, 0.5, 0xb9b2a2, 0); done = true; break; } }
        if (done) break;
      }
    }
    yield;

    // ── 4. alan: kasaba (çeşme, çark direkleri, fırın, tezgâh) ──
    const ovn = D.oven;
    const fnt = D.fountain;
    if (fnt) {
      put(cyl, fnt.x, 0.28, fnt.z, 1.35, 0.56, 1.35, 0xc4bcab, 0); put(cyl, fnt.x, 0.56, fnt.z, 1.1, 0.06, 1.1, 0xe4dcc8, 0); put(cyl, fnt.x, 0.56, fnt.z, 1.02, 0.05, 1.02, 0x88d8ee, 0);
      put(cyl, fnt.x, 0.9, fnt.z, 0.2, 0.7, 0.2, 0xcfc8b6, 0); put(sph, fnt.x, 1.3, fnt.z, 0.3, 0.2, 0.3, 0xe4dcc8, 0);
      api.solid(fnt.x, fnt.z, 1.3, 'cesme');
    }
    if (K && L.areas && L.areas[3]) for (const ri of L.areas[3].rooms) {   // çark direkleri (durmuş): kenarda 3 tane
      const rm = L.rooms[ri]; if (rm.kind === 'side') continue;
      const rs = K.rimSpots(L, rm, 1.4, 10).filter(p => coneH(p.x, p.z) > 4.5);
      for (const p of rs.slice(0, 2)) { api.box(p.x, 1.6, p.z, 0.18, 3.2, 0.18, WOOD, 0); const m = sails(p.x, 3.1, p.z + 0.2, PI / 2 * 0, 1.1, 4); m.rotation.y = 0; spinners.push({ m, k: 1, once: true }); }
    }
    if (ovn) {   // fırın binası: bakır çatılı, kemerli ocak, baca (ince duman), ekmek tezgâhı
      const x = ovn.x, z = ovn.bz;
      api.box(x, 1.9, z, 6.2, 3.8, 4.2, 0xf1dcb4, 0); api.box(x, 1.4, z + 2.12, 6.3, 0.14, 0.14, WOOD, 0); api.box(x, 3.4, z + 2.12, 6.3, 0.14, 0.14, WOOD, 0);
      put(pyr, x, 3.8 + 1.2, z, 7.4, 2.4, 5.6, 0xb5532e, PI / 4); api.box(x + 1.6, 6.4, z - 0.3, 0.9, 2.6, 0.9, 0xa39c8c, 0); put(cyl, x + 1.6, 7.8, z - 0.3, 0.55, 0.16, 0.55, 0x8c8474, 0);
      api.box(x, 1.2, z + 2.15, 2.0, 2.4, 0.16, 0x3a2418, 0);   // ocak ağzı (koyu)
      for (let i = 0; i <= 8; i++) { const t = i / 8 * PI; api.box(x + Math.cos(t) * 1.15, 2.2 + Math.sin(t) * 0.55, z + 2.17, 0.34, 0.36, 0.16, 0xb9b2a2, 0); }
      api.glow(x, z + 3.2, 3, 0xffa84a, 0.22); api.light(x, 1.4, z + 3.0, 0xff9a40, 2.8, 8, 0.2);
      for (const sd of [-1, 1]) { api.box(x + sd * 2.0, 1.55, z + 2.14, 0.7, 0.8, 0.08, 0xffe9a0, 0); api.box(x + sd * 2.0, 1.55, z + 2.17, 0.9, 0.06, 0.05, WOOD, 0); }
      // tezgâh yerleşimi: ekmek tezgâhı (yan duvarda)
      for (const sd of [-1, 1]) { api.box(x + sd * 4.2, 0.5, z + 1.6, 1.8, 1.0, 1.2, 0xb07a44, 0); api.box(x + sd * 4.2, 1.05, z + 1.6, 2.0, 0.1, 1.4, 0xd8a868, 0); api.box(x + sd * 4.2, 2.3, z + 1.6, 2.2, 0.08, 1.6, pick(ROOF), 0); for (const q of [-0.9, 0.9]) api.box(x + sd * 4.2 + q, 1.6, z + 2.2, 0.08, 1.3, 0.08, WOOD, 0); }
      api.solid(x, z + 0.4, 3.4, 'firin');
    }
    // arena değirmeni: dev taş kule, çatı, sırtta kanat çark + su çarkı (boss neşelenince döner)
    const ar = L.rooms.find(r => r.kind === 'boss');
    let bigSails = null, bigWheel = null, arMill = null;
    if (ar) {
      const mx = ar.x, mz = ar.z - ar.r - 6.5;
      put(taper, mx, 4.2, mz, 3.5, 8.4, 3.5, 0xe9dcb8, 0); put(cyl, mx, 8.55, mz, 3.0, 0.4, 3.0, 0x8a5a34, 0);
      put(cone, mx, 10.3, mz, 3.5, 3.3, 3.5, 0xb5532e, 0); put(sph, mx, 12.05, mz, 0.3, 0.3, 0.3, 0xd9a441, 0);
      for (const y of [2.2, 5.0]) put(cyl, mx, y, mz, 3.05 - y * 0.06, 0.12, 3.05 - y * 0.06, 0x8a5a34, 0);
      api.box(mx, 1.2, mz + 3.1, 1.4, 2.4, 0.2, 0x7a4a26, 0);
      for (const [wy, wx] of [[4.2, -1.3], [4.2, 1.3], [6.4, 0]]) api.box(mx + wx, wy, mz + 3.0, 0.7, 0.9, 0.12, 0xffe9a0, 0);
      bigSails = sails(mx, 6.6, mz + 3.4, 0, 4.4, 4); bigSails.scale.setScalar(1);
      bigWheel = waterWheel(mx - 6.2, mz + 1.4, PI / 2, 2.6); bigWheel.rotation.y = 0; bigWheel.position.set(mx - 5.4, 2.8, mz + 1.4);
      put(cyl, mx - 5.4, 0.3, mz + 1.4 - 0.3, 3.2, 0.6, 1.0, 0xb9b2a2, 0);
      arMill = { x: mx, z: mz };
      // arena çevresi: balyalar, çuvallar, çit (güneyde alçak)
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * TAU, d = ar.r + 2.2 + (i % 2) * 1.2, x = ar.x + Math.sin(a) * d, z = ar.z + Math.cos(a) * d;
        if (isF(x, z) || fD(x, z, 2) < 1) continue;
        if (z > ar.z - ar.r * 0.25) { if (i % 2 === 0) fence(x, z, a + PI / 2, 2.4); continue; }
        if (i % 3 === 0) { sack(x, z, 1.0); sack(x + 0.7, z + 0.2, 0.8); } else hay(x, z, 1.0 + rnd() * 0.5);
      }
      api.glow(ar.x, ar.z, ar.r + 1, 0xffe8a0, 0.1);
    }
    yield;
    // ── bölüm girişi çıkışı: çıkış kapısının yanında başak demetleri ──
    // (kurSon'da)

    // ── atmosfer: altın polen/un tozu ──
    motes(api, L, 150, { cols: ['#fff2c0', '#ffe08a', '#fffaf0', '#ffd890'], size: 0.14, y0: 0.15, rise: 0.07, h: 4.0, k: 0.7 });
    motes(api, L, 26, { cols: ['#fff6d0', '#ffe9a0'], size: 0.32, y0: 0.6, rise: 0.04, h: 5.0, k: 0.55 });
    yield;
    yield* etkilesim(L, api, { K, put, isF, coneH, fD, sph, sphL, cyl, spinners, streams, ar, bigSails, bigWheel, arMill, sack, hay, fence, wall });
  }

  // ════════════════ Etkileşimler: tarif (un-su-ateş), Hala, yoğurma, pişirme, iz, Kuzu Ağılı, Kuyu, canlı dünya ════════════════
  const lineLen = k => { try { return (typeof VOICE_DUR !== 'undefined' && VOICE_DUR && VOICE_DUR[k]) || ((AUD.LINES[k] || '').length / 12 + 0.5); } catch (e) { return 3; } };
  function* etkilesim(L, api, c) {
    const THREE = api.THREE, rnd = api.rnd, K = c.K, D = L.dg || {}, T = K ? K.toys(api) : null;
    DEGIRMEN._qa = { T, R, D };
    const sfxAt = (n, x, z, o) => sfx(n, Object.assign({ x, z }, o || {}));
    const P = () => GAME.P, hx = () => GAME.P.pos.x, hz = () => GAME.P.pos.z;
    const pirilPos = () => { try { const b = GAME.Bilbo && GAME.Bilbo.root; if (b) return b.position; } catch (e) { /* yok */ } return { x: hx() + 1, y: 1.4, z: hz() + 1 }; };
    // sıralı cümle kuyruğu (anlatıcı, sonra Pırıl…): her biri bir öncekinin süresi kadar sonra
    const Q = []; let qT = 0;
    const seq = (keys, gap0 = 0) => { let at = gap0; for (const k of keys) { Q.push({ k, at: qT + at }); at += lineLen(k) + 0.5; } };
    const anims = [];
    const sheen = 1.0;
    if (!T) return;

    // ── tutulan nesne (kova / ekmek): Feza'nın elinde ──
    const kb = new Kit(); bucketKit(kb); const bucket = kitMesh(api, kb, { name: 'degirmen-kova' }); bucket.visible = false; api.add(bucket);
    const kl = new Kit(); loafKit(kl); const loaf = kitMesh(api, kl, { name: 'degirmen-ekmek', emissive: 0xffb040, ei: 0.35 }); loaf.visible = false; api.add(loaf);
    const holdUpdate = (dt, t) => {
      const p = GAME.P, k = R.tutan, m = k === 'kova' ? bucket : k === 'ekmek' ? loaf : null;
      bucket.visible = m === bucket; loaf.visible = m === loaf && !(R.bakeAnim);
      if (!m) return;
      const f = p.face + 1.15, mv = p.speed ? 1 : 0;
      m.position.set(p.pos.x + Math.sin(f) * 0.55, 0.92 + 0.03 * Math.sin(t * 7) * mv + (k === 'ekmek' ? 0.25 : 0), p.pos.z + Math.cos(f) * 0.55);
      m.rotation.set(0, p.face + 0.4, 0.05 * Math.sin(t * 5));
      if (k === 'kova') { p.slowT = Math.max(p.slowT || 0, 0.25); if ((p.slowK ?? 1) > 0.87 || p.slowT < 0.3) p.slowK = 0.87; }
    };

    // ── 1) 5 başak demeti (un) ──
    const bk = new Kit();
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, lx = Math.sin(a) * 0.1, lz = Math.cos(a) * 0.1, lean = 0.2;
      bk.add(G.cone(3), 0xd6b648, [lx, 0.4, lz], [Math.cos(a) * lean, 0, -Math.sin(a) * lean], [0.05, 0.8, 0.05]);
      bk.add(G.octa(), 0xf4cb52, [lx + Math.sin(a) * 0.16, 0.86, lz + Math.cos(a) * 0.16], [Math.cos(a) * lean, 0, -Math.sin(a) * lean], [0.055, 0.22, 0.055]); }
    bk.add(G.torus(TAU, 0.14, 12), 0x9a6a3c, [0, 0.28, 0], [PI / 2, 0, 0], [0.12, 0.12, 0.8]);
    const bundleGeo = api.dispose(bk.build()), bundleMat = api.dispose(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, emissive: new THREE.Color(0xffc850), emissiveIntensity: 0.4 }));
    // (altın demet altın tarlada kayboluyordu: altına koyu toprak lekesi → demet zeminden ayrılır; tek, sade, ışıltısız)
    const soilGeo = api.dispose(new THREE.CircleGeometry(1.0, 24).rotateX(-PI / 2)), soilMat = api.dispose(new THREE.MeshBasicMaterial({ color: 0x8a5a2c, transparent: true, opacity: 0.5, depthWrite: false }));
    const bundleLeft = [];   // toplanmamış demetler (Pırıl en yakınını gösterir)
    (D.bundles || []).forEach((p, i) => {
      const m = new THREE.Mesh(bundleGeo, bundleMat); m.position.set(p.x, 0, p.z); m.rotation.y = i; m.scale.setScalar(1.45); m.castShadow = true; api.add(m);
      const soil = new THREE.Mesh(soilGeo, soilMat); soil.position.set(p.x, 0.035, p.z); soil.renderOrder = 2; api.add(soil);
      api.glow(p.x, p.z, 1.5, 0xffe08a, 0.22);
      const bl = { x: p.x, z: p.z, done: false }; bundleLeft.push(bl);
      let got = -1;
      T.add({ x: p.x, z: p.z, r: 1.15, hint: { y: 1.6 }, near: 7, once: true, cd: 0.5, line: i === 0 ? 'b04_un' : null,
        use: () => { got = 0; bl.done = true; R.un++; hudUpdate(); sfxAt('pop', p.x, p.z, { pitch: 1 + R.un * 0.1 }); burst('sparkle', p.x, 0.9, p.z, { color: '#ffe08a', count: 9 }); burst('hearts', p.x, 1.2, p.z, { count: 2 });
          if (R.un >= R.unN) { sfxAt('bell', p.x, p.z, { pitch: 1.3 }); say('b04_basak_tam', { gap: 1, force: true }); } },
        tick: dt => { if (got >= 0 && got < 1) { got += dt * 2.5; m.position.y = got * 1.2; m.scale.setScalar(1.45 * (1 - got)); if (got >= 1) { m.visible = false; soil.visible = false; } } else if (got < 0) { m.rotation.y += dt * 0.5; m.position.y = 0.04 * Math.sin(GAME.time * 3 + i); } } });
    });
    const nearBundle = (x, z) => { let b = null, bd = 1e9; for (const q of bundleLeft) if (!q.done) { const d = hyp(q.x - x, q.z - z); if (d < bd) { bd = d; b = q; } } return b ? { x: b.x, z: b.z, d: bd } : null; };
    const pointTo = (x, z) => { try { if (typeof PIRIL_GUC !== 'undefined' && PIRIL_GUC.pointTo) PIRIL_GUC.pointTo(x, z); } catch (e) { /* yok */ } };

    // ── 2) su kovası ──
    if (D.bucket) {
      const kb2 = new Kit(); bucketKit(kb2); const bm = kitMesh(api, kb2, { name: 'degirmen-kova-yer' }); bm.position.set(D.bucket.x, 0, D.bucket.z); bm.scale.setScalar(1.5); api.add(bm);
      api.glow(D.bucket.x, D.bucket.z, 1.6, 0xa8ecff, 0.2);
      T.add({ x: D.bucket.x, z: D.bucket.z, r: 1.15, hint: { y: 1.7 }, near: 8, once: true, line: 'b04_dere',
        use: () => { R.su = 1; R.tutan = 'kova'; bm.visible = false; hudUpdate(); sfxAt('splash', D.bucket.x, D.bucket.z); burst('bubbles', D.bucket.x, 0.6, D.bucket.z, { count: 8 }); burst('sparkle', D.bucket.x, 0.9, D.bucket.z, { color: '#a8ecff', count: 8 });
          say('b04_kova', { gap: 1, force: true }); } });
    }

    // ── 3) Kor Taşları (ateş): Pırıl'ın ışığıyla uyanır ──
    const stK = new Kit();
    stK.add(G.dodeca(), (x, y, z) => new THREE.Color(0x8c8c94).lerp(new THREE.Color(0xa8a8b0), 0.5 + 0.5 * Math.sin(x * 9 + z * 7)), [0, 0.38, 0], [0.1, 0.4, 0.05], [0.56, 0.44, 0.5]);
    for (const [x, z, r] of [[0.1, 0.38, 0.4], [-0.2, 0.3, -0.5], [0.0, -0.36, 0.2]]) stK.add(G.box(), 0x5a5a62, [x, 0.4, z], [0, r, 0.3], [0.04, 0.3, 0.03]);
    const stGeo = api.dispose(stK.build());
    const stones = (D.stones || []).map((p, i) => {
      const mat = api.dispose(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, emissive: new THREE.Color(0xff7a20), emissiveIntensity: 0 }));
      const m = new THREE.Mesh(stGeo, mat); m.position.set(p.x, 0, p.z); m.rotation.y = i * 2; m.castShadow = true; api.add(m);
      const halo = new THREE.Mesh(api.dispose(new THREE.CircleGeometry(1.3, 24).rotateX(-PI / 2)), api.dispose(new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
      halo.position.set(p.x, 0.06, p.z); halo.renderOrder = 3; api.add(halo);
      return { p, m, mat, halo, go: false, t: 0, on: false, k: 0, bt: 0 };
    });
    stones.forEach((s, i) => {
      T.add({ x: s.p.x, z: s.p.z, r: 1.5, hint: { y: 1.5 }, near: 7, once: true, cd: 0.5, line: i === 0 ? 'b04_kor' : null,
        can: () => !s.go,
        use: () => { s.go = true; s.t = 0; sfxAt('whoosh', s.p.x, s.p.z, { pitch: 1.4, vol: 0.5 }); try { if (typeof PIRIL_GUC !== 'undefined' && PIRIL_GUC.pointTo) PIRIL_GUC.pointTo(s.p.x, s.p.z); } catch (e) { /* yok */ } if (i === 0) say('pp_degirmen_kor', { gap: 1 }); },
        tick: dt => {
          if (s.go && !s.on) {
            s.t += dt; s.bt -= dt;
            if (s.bt <= 0) { s.bt = 0.07; const pp = pirilPos(), u = Math.min(1, s.t / 1.2); burst('sparkle', pp.x + (s.p.x - pp.x) * u, (pp.y || 1.4) * (1 - u) + 0.6 * u, pp.z + (s.p.z - pp.z) * u, { color: '#ffe0a0', count: 2 }); }
            if (s.t > 1.3) {
              s.on = true; R.kor++; hudUpdate(); sfxAt('unlock', s.p.x, s.p.z, { vol: 0.7 }); sfxAt('bell', s.p.x, s.p.z, { pitch: 1.2 + R.kor * 0.1, vol: 0.6 });
              burst('sparkle', s.p.x, 0.8, s.p.z, { color: '#ff9a40', count: 14 }); burst('star', s.p.x, 1.2, s.p.z, { count: 4, color: '#ffd080' }); ring(s.p.x, s.p.z, 2.4, '#ffa040');
              if (R.kor >= R.korN) say('b04_kor_tamam', { gap: 1, force: true }); else if (R.kor === 1) say('b04_kor_yandi', { gap: 1, force: true });
            }
          }
          if (s.on) { s.k = Math.min(1, s.k + dt * 1.2); const fl = 0.85 + 0.15 * Math.sin(GAME.time * 7 + s.p.x); s.mat.emissiveIntensity = s.k * 1.3 * fl; s.halo.material.opacity = s.k * 0.38 * fl; if (Math.random() < dt * 2) burst('sparkle', s.p.x + (Math.random() - 0.5) * 0.5, 0.7 + Math.random() * 0.4, s.p.z + (Math.random() - 0.5) * 0.5, { color: '#ff9a40', count: 1 }); }
          else if (s.go) { s.mat.emissiveIntensity = 0.5 * Math.min(1, s.t / 1.3); }
        } });
    });

    // ── 4) Kasaba: Hala (fırıncı), tezgâh, fırın, yoğurma + pişirme ──
    let hala = null, haSolid = null, haI = { st: 'ters', yaw: PI, t: 0, said: false, heart: 0 };
    const tbl = D.table, ov = D.oven;
    let doughM = null, bowlM = null;
    if (tbl) {   // tezgâh: masa, hamur kasesi, oklava, ekmek sepeti
      api.box(tbl.x, 0.46, tbl.z, 1.7, 0.92, 0.95, 0xb88650, 0); api.box(tbl.x, 0.95, tbl.z, 1.85, 0.08, 1.05, 0xf4ead0, 0);
      for (const sd of [-1, 1]) api.box(tbl.x + sd * 0.78, 0.45, tbl.z + 0.4, 0.08, 0.9, 0.08, WOOD, 0);
      const bk2 = new Kit(); bk2.add(G.cyl(1, 0.7, 18), 0xd8c9a8, [0, 0.12, 0], null, [0.3, 0.24, 0.3]); bowlM = kitMesh(api, bk2, { name: 'degirmen-kase' }); bowlM.position.set(tbl.x - 0.3, 0.99, tbl.z); api.add(bowlM);
      const dk = new Kit(); dk.add(G.sphere(16, 10), 0xf8e8c0, [0, 0.2, 0], null, [0.26, 0.17, 0.26]); doughM = kitMesh(api, dk, { name: 'degirmen-hamur' }); doughM.position.set(tbl.x - 0.3, 1.0, tbl.z); doughM.visible = false; api.add(doughM);
      const lk = new Kit(); loafKit(lk, 0xcf8f48, 0xe7b862); const lf = kitMesh(api, lk, { name: 'degirmen-tezgah-ekmek' }); lf.position.set(tbl.x + 0.5, 0.99, tbl.z); api.add(lf);
      const rp = new Kit(); rp.add(G.cyl(1, 1, 10), 0xc89058, [0, 0, 0], [0, 0, PI / 2], [0.04, 0.5, 0.04]); const rpm = kitMesh(api, rp, { name: 'degirmen-oklava' }); rpm.position.set(tbl.x + 0.1, 1.03, tbl.z + 0.3); rpm.rotation.y = 0.4; api.add(rpm);
      api.solid(tbl.x, tbl.z, 0.95, 'tezgah');
    }
    if (D.hala) {
      hala = (typeof HALA !== 'undefined' && HALA && HALA.firinciModel) ? (() => { try { return HALA.firinciModel(api); } catch (e) { return halaStandIn(api); } })() : halaStandIn(api);
      hala.position.set(D.hala.x, 0, D.hala.z); hala.rotation.y = PI; api.add(hala);
      haSolid = api.solid(D.hala.x, D.hala.z, 0.45, 'hala');
    }
    // masa: malzemeler tamamsa teslim al ve yoğurmayı başlat; eksikse neyin eksik olduğunu söyle
    const missingHint = () => { if (R.un < R.unN) say('b04_un', { once: false, gap: 14 }); else if (R.su < 1) say('b04_dere', { once: false, gap: 14 }); else if (R.kor < R.korN) say('b04_kor', { once: false, gap: 14 }); };
    const startKnead = () => {
      R.durum = 'yogur'; hudUpdate();
      if (typeof MINIGAME !== 'undefined' && MINIGAME.start('dg_yogur', { from: 'zone', onEnd: () => { if (R.mgOK) { R.durum = 'pisir'; hudUpdate(); say('b04_yogurma_bitti', { gap: 0, force: true }); seq(['b04_pisir'], 3.2); try { if (ov && PIRIL_GUC.pointTo) PIRIL_GUC.pointTo(ov.x, ov.z); } catch (e) { /* yok */ } } else R.durum = 'hazir'; } })) say('b04_yogurma', { gap: 0, force: true });
      else R.durum = 'hazir';
    };
    const startBake = () => {
      if (typeof MINIGAME !== 'undefined' && MINIGAME.start('dg_pisir', { from: 'zone', onEnd: () => { if (R.mgOK) bakeDone(); } })) say('b04_pisir', { once: false, gap: 0, force: true });
    };
    const trailMat = { u: { value: 0 }, mesh: null };
    function bakeDone() {
      R.durum = 'pisti'; R.pisti = true; hudUpdate();
      R.bakeAnim = { t: 0 }; R.tutan = null;
      sfxAt('unlock', hx(), hz(), { vol: 0.8 });
      seq(['b04_pisti', 'b04_koku', 'b04_kasaba', 'pp_degirmen_ekmek']);
      for (const e of GAME.enemies.slice()) if (!e.dead && !e.boss && L.areas && L.areas[3] && L.areas[3].rooms.some(ri => { const r = L.rooms[ri]; return dist2(e.x, e.z, r.x, r.z) < (r.r + 4) * (r.r + 4); })) GAME.damage(e, e.hp + 1, { kind: 'team' });
      c.spinners.forEach(s => { if (s.once) s.spin = TAU; });
      sfxAt('bell', hx(), hz(), { pitch: 0.8 }); setTimeout(() => sfxAt('bell', hx(), hz(), { pitch: 1.0 }), 400);
    }
    if (tbl && !TARIFYOK) T.add({ x: tbl.x + 0.1, z: tbl.z + 1.5, r: 1.6, hint: { y: 1.8 }, near: 8, cd: 4, repeat: true, line: 'b04_tarif',
      can: () => R.durum === 'topla' || R.durum === 'hazir',
      use: () => {
        if (hazir()) {
          R.durum = 'hazir'; R.tutan = null; sfxAt('splash', tbl.x, tbl.z); burst('bubbles', tbl.x - 0.3, 1.1, tbl.z, { count: 8 }); burst('sparkle', tbl.x, 1.4, tbl.z, { color: '#fff4d0', count: 12 }); if (doughM) { doughM.visible = true; }
          setTimeout(startKnead, 900);
        } else missingHint();
      } });
    if (ov && !TARIFYOK) T.add({ x: ov.x, z: ov.z + 0.5, r: 2.0, hint: { y: 1.9 }, near: 9, cd: 4, repeat: true,
      can: () => R.durum === 'pisir',
      use: () => startBake() });

    // Hala'nın karşılaması + sürpriz
    const halaTick = (dt, t) => {
      if (!hala) return;
      const d = hyp(hx() - D.hala.x, hz() - D.hala.z);
      if (haI.follow || help) return;
      const want = d < 6.5 ? Math.atan2(hx() - D.hala.x, hz() - D.hala.z) : PI;
      if (d < 6.5 && haI.st === 'ters') { haI.st = 'don'; }
      haI.yaw = dampAngle(haI.yaw, want, haI.st === 'don' ? 3 : 4, dt);
      hala.rotation.y = haI.yaw; hala.position.y = 0.02 * Math.sin(t * 2.2) + (haI.heart > 0 ? Math.abs(Math.sin(t * 9)) * 0.08 * haI.heart : 0); hala.rotation.z = 0.02 * Math.sin(t * 1.6);
      if (haI.st === 'don' && Math.abs(angDiff(haI.yaw, want)) < 0.35 && !haI.said) {
        haI.said = true; haI.heart = 1; burst('hearts', D.hala.x, 2.2, D.hala.z, { count: 1 }); sfxAt('bell', D.hala.x, D.hala.z, { pitch: 1.5, vol: 0.6 });
        seq(TARIFYOK ? ['b04_hala', 'pp_degirmen_hala'] : ['b04_hala', 'pp_degirmen_hala', 'b04_hala_der'], 0.2);
        setTimeout(() => { haI.heart = 0; }, 1600);
      }
    };

    // Hala'nın yardımı (COMPANION; zararsız): pişirdikten sonra Feza'nın yanına gelir; can < %50 ya da 4+ huysuz → koşup sıcak ekmek sarılması
    // (can %50 dolar, yakındakiler 2,5 sn sersemler). Bekleme 25 sn.
    let help = null;
    if (hala && typeof COMPANION !== 'undefined' && COMPANION.register) {
      COMPANION.register({ id: 'hala_degirmen', ad: 'Hala (fırıncı)', bolumler: ['degirmen'], bekleme: 25, ilkBekleme: 4, sure: 2.8, esik: 0.5, dusman: 4, menzil: 7,
        etkin: () => inZone() && haI.said,
        eylem: c => {
          const A = c.api; help = { t: 0, x: c.P.pos.x, z: c.P.pos.z, heal: false };
          if (A && A.say && AUD.LINES.b04_hala_yardim) A.say('b04_hala_yardim', 2);
          try { if (A.iyilestir) A.iyilestir(0.5); if (A.sersemlet && c.yakin && c.yakin.length) A.sersemlet(c.yakin, 2.5); } catch (e) { /* yok */ }
          return true;
        } });
    }
    const helpTick = (dt, t) => {
      if (!hala) return;
      const p = GAME.P;
      if (help) {
        help.t += dt; const u = Math.min(1, help.t / 0.7);
        const tx = p.pos.x + (haI.side || -1) * 1.0, tz = p.pos.z - 0.3;   // (yanına sarılır; önüne geçip Feza'yı örtmez)
        hala.position.x = lerp(hala.position.x, tx, 1 - Math.exp(-9 * dt)); hala.position.z = lerp(hala.position.z, tz, 1 - Math.exp(-9 * dt));
        haI.yaw = dampAngle(haI.yaw, Math.atan2(p.pos.x - hala.position.x, p.pos.z - hala.position.z), 10, dt);
        hala.position.y = (u >= 1 ? 0.06 * Math.sin(help.t * 8) : Math.abs(Math.sin(help.t * 14)) * 0.12);
        if (help.t > 0.75 && !help.heal) { help.heal = true; burst('hearts', p.pos.x, 1.6, p.pos.z, { count: 7 }); burst('sparkle', p.pos.x, 1.0, p.pos.z, { color: '#ffd9a0', count: 12 }); sfx('heal', { x: p.pos.x, z: p.pos.z }); ring(p.pos.x, p.pos.z, 3.4, '#ffd9a0'); }
        if (help.t > 2.6) { help = null; }
      } else if (R.pisti && haI.said) {   // pişirdikten sonra Feza'nın arkasından gelir (arenaya kadar)
        // yanında yürür (ekranda sol/sağ), arkasında değil: Feza hep kuzeye (kameradan öteye) yürüyor; "arkası" kameranın önü
        // demekti ve Hala Feza'yı tümüyle örtüyordu (QA). Yan duvar/çukur varsa öbür yana geçer.
        const sd = haI.side || (haI.side = -1);
        if (!api.isFloor(p.pos.x + sd * 1.8, p.pos.z - 0.5) && api.isFloor(p.pos.x - sd * 1.8, p.pos.z - 0.5)) haI.side = -sd;
        const tx = p.pos.x + haI.side * 1.8, tz = p.pos.z - 0.5;
        const d = hyp(tx - hala.position.x, tz - hala.position.z);
        if (haSolid && haSolid.alive) { haSolid.alive = false; L._sh = null; }   // (yerinden ayrıldı: tezgâh yanında görünmez engel kalmasın)
        if (d > 0.4) { const k = Math.min(1, (3.6 * dt + d * 1.6 * dt)); hala.position.x += (tx - hala.position.x) * k; hala.position.z += (tz - hala.position.z) * k; haI.yaw = dampAngle(haI.yaw, Math.atan2(tx - hala.position.x, tz - hala.position.z), 6, dt); haI.follow = true; hala.position.y = Math.abs(Math.sin(t * 9)) * 0.05; }
        else { haI.yaw = dampAngle(haI.yaw, Math.atan2(p.pos.x - hala.position.x, p.pos.z - hala.position.z), 4, dt); hala.position.y = 0; }
      }
    };

    // ── Altın ekmek kokusu izi: fırından arenaya, pişince açılır ──
    let trailM = null;
    if (L.path && L.path.length > 4 && ov) {
      let bi = 0, bd = 1e9; L.path.forEach((p, i) => { const d2 = dist2(p.x, p.z, ov.x, ov.z); if (d2 < bd) { bd = d2; bi = i; } });
      const pts = L.path.slice(bi).filter((p, i, a) => i % 3 === 0 || i === a.length - 1).map(p => [p.x, p.z]);
      if (pts.length > 3) {
        const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], 0, p[1]))), N = Math.max(20, Math.round(curve.getLength() * 1.2)), sp = curve.getSpacedPoints(N);
        const pos = [], uv = [], idx = []; let len = 0;
        for (let i = 0; i <= N; i++) {
          const a = sp[Math.max(0, i - 1)], b = sp[Math.min(N, i + 1)], dx = b.x - a.x, dz = b.z - a.z, l = hyp(dx, dz) || 1, nx = -dz / l, nz = dx / l;
          if (i > 0) len += sp[i].distanceTo(sp[i - 1]);
          pos.push(sp[i].x + nx * 0.11, 0.1, sp[i].z + nz * 0.11, sp[i].x - nx * 0.11, 0.1, sp[i].z - nz * 0.11); uv.push(len, 0, len, 1);
          if (i < N) { const q = i * 2; idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
        }
        const g = api.dispose(new THREE.BufferGeometry());
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
        const tm = api.dispose(new THREE.ShaderMaterial({
          uniforms: { uTime: TIME.u, uReveal: trailMat.u, uLen: { value: len } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: `uniform float uTime, uReveal, uLen; varying vec2 vUv;
            void main() {
              float e = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
              float rv = step(vUv.x, uReveal * (uLen + 2.0));
              float pulse = 0.6 + 0.4 * sin(vUv.x * 1.6 - uTime * 3.0);
              vec3 c = mix(vec3(1.0, 0.72, 0.2), vec3(1.0, 0.95, 0.6), pulse);
              gl_FragColor = vec4(c, e * rv * (0.55 + 0.4 * pulse));
            }`,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
        }));
        trailM = new THREE.Mesh(g, tm); trailM.renderOrder = 4; trailM.frustumCulled = false; trailM.visible = false; trailM.name = 'degirmen-ekmek-izi'; api.add(trailM);
      }
    }
    // ── Arena kapısında çuval duvarı: ekmek pişene dek ──
    let wallObj = null;
    if (D.gate && K && !TARIFYOK) {
      const g = D.gate, [dx, dz] = K.gateDir(L, g), nx = -dz, nz = dx, cx = g.x + dx * 2.6, cz = g.z + dz * 2.6;
      let lo = 0, hi = 0;
      for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(cx + nx * o, cz + nz * o)) hi = o; else break; }
      for (let o = 0; o <= 7; o += 0.5) { if (api.isFloor(cx - nx * o, cz - nz * o)) lo = o; else break; }
      const grp = new THREE.Group(), kk = new Kit(), solids = [];
      for (let o = -lo - 0.4; o <= hi + 0.4; o += 0.85) {
        const px = cx + nx * o, pz = cz + nz * o;
        for (let lv = 0; lv < 2; lv++) { const sc = lv ? 0.9 : 1; kk.add(G.sphere(12, 8), lv ? 0xe8dbb8 : 0xefe2c4, [px - cx + (lv ? 0.35 * nx : 0), 0.4 + lv * 0.72, pz - cz + (lv ? 0.35 * nz : 0)], null, [0.5 * sc, 0.42 * sc, 0.42 * sc]); }
        const so = { x: px, z: pz, r: 0.7, alive: true, tag: 'kapi' }; L.solids.push(so); solids.push(so);
      }
      const wm = kitMesh(api, kk, { name: 'degirmen-kapi-cuval' }); wm.position.set(cx, 0, cz); grp.add(wm); api.add(grp);
      for (let o = -lo; o <= hi; o += 1.6) { /* süs yok */ }
      wallObj = { grp, solids, open: false, gx: cx, gz: cz, said: -99, near: 0 }; DEGIRMEN._qa.wall = wallObj;
    }
    // Yumuşak kilit (Feza 4,5 yaşında; hiçbir ilerleme göreve bağlı değil): ekmek pişmediyse Feza duvarın yanında toplam 4 sn
    // durunca (ya da Bekçi uyanırsa) Hala ekmeği kendisi pişirip getirir, çuvallar açılır. ("Pişirdin" demez; Hala'nın cümlesi.)
    const openWall = () => {
      wallObj.open = true; for (const so of wallObj.solids) so.alive = false; L._sh = null;
      burst('confetti', wallObj.gx, 1.4, wallObj.gz, { scale: 0.8 }); burst('sparkle', wallObj.gx, 1, wallObj.gz, { color: '#ffe08a', count: 20 }); sfx('pop', { x: wallObj.gx, z: wallObj.gz }); wallObj.grp.visible = false;
    };
    const halaBakes = (woke) => {
      R.durum = 'pisti'; R.pisti = true; R.tutan = 'ekmek'; R.bakeAnim = null; R.yardim = true; hudUpdate();
      if (trailM) { trailM.visible = true; trailMat.u.value = 1; }
      if (hala) haI.said = true;   // (Hala arkasından gelir, ekmek Feza'nın elinde; Bekçi'ye ikram yine olur)
      for (let i = Q.length - 1; i >= 0; i--) if (/^(pp_degirmen_hala|b04_hala_der|b04_pisir)$/.test(Q[i].k)) Q.splice(i, 1);   // (bekleyen "birlikte ekmek yapacaklar" karşılaması artık yersiz: düşer)
      c.spinners.forEach(s => { if (s.once) s.spin = TAU; });
      sfxAt('bell', hx(), hz(), { pitch: 1.0 }); burst('hearts', hx(), 1.6, hz(), { count: 3 });
      seq((hala ? ['b04_hala_yardim'] : []).concat(woke ? [] : ['kapi_acildi']), 0.3);   // (Bekçi uyanırken az söz: yalnız Hala)
    };
    const wallTick = (dt, x, z) => {
      if (!wallObj || wallObj.open) return;
      if (R.pisti) { openWall(); return; }
      const bs0 = GAME.boss, woke = !!(bs0 && bs0.type === 'degirmenBekcisi' && bs0.aggro && !bs0.dead);   // Bekçi uyandıysa duvar kapalı kalmasın
      let dW = hyp(x - wallObj.gx, z - wallObj.gz);
      // (alanın neşe kapısı hâlâ kapalıysa Feza buraya gelemez: o kapının kendi ipucu konuşur, sayaç beklemez — iki "açıldı" üst üste gelmesin)
      if (dW < 6 && D.gate && L.solids.some(s => s.tag === 'kapi' && s.alive && !wallObj.solids.includes(s) && hyp(s.x - D.gate.x, s.z - D.gate.z) < 3.5)) dW = 99;
      if (dW < 6) wallObj.near += dt;
      if (woke || wallObj.near >= 4) { halaBakes(woke); openWall(); return; }
      // tek ipucu: neyin eksik olduğuna göre (Pırıl fırını / tezgâhı gösterir). İlk 1 sn susar: Feza doğruca yürürse Bekçi uyanır, duvar hemen
      // açılır — Pırıl tam o an geriye (fırına) uçmasın; durup bekleyen Feza ipucunu yine duyar (açılmadan ~3 sn önce).
      if (dW < 6 && wallObj.near >= 1 && tt - wallObj.said > 14) {
        wallObj.said = tt;
        if (R.durum === 'pisir') { say('b04_pisir', { once: false, gap: 3, force: true }); if (ov) pointTo(ov.x, ov.z); }
        else if (hazir()) { say('b04_tarif_geri', { once: false, gap: 3, force: true }); if (tbl) pointTo(tbl.x, tbl.z); else if (ov) pointTo(ov.x, ov.z); }
        else { say('b04_tarif', { once: false, gap: 3, force: true }); if (ov) pointTo(ov.x, ov.z); }
      }
    };

    // ── Kuzu Ağılı (yan oda A): 3 kuzuyu say ──
    const sheepK = new Kit(); sheepKit(sheepK); const sheepGeo = api.dispose(sheepK.build()), sheepMat = api.dispose(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }));
    if ((D.lambs || []).length && D.pen) {
      let counted = 0;
      D.lambs.forEach((p, i) => {
        const m = new THREE.Mesh(sheepGeo, sheepMat); m.position.set(p.x, 0, p.z); m.rotation.y = i * 2.1; m.scale.setScalar(1.4); m.castShadow = true; api.add(m);
        let hop = 9, done = false;
        T.add({ x: p.x, z: p.z, r: 1.0, hint: { y: 1.5 }, near: 6, once: true, line: i === 0 ? 'b04_kuzu' : null,
          use: () => { counted++; done = true; hop = 0; const n = counted; sfxAt('bell', p.x, p.z, { pitch: 0.9 + n * 0.2, vol: 0.7 }); sfxAt('bounce', p.x, p.z, { pitch: 1.4 }); burst('hearts', p.x, 1.2, p.z, { count: 2 });
            try { FX.floatText(p.x, 1.9, p.z, String(n), 'word'); } catch (e) { /* yok */ }
            say('b04_say_' + n, { once: false, gap: 0, force: true });
            if (n === 3) setTimeout(() => { say('b04_kuzu_bitti', { gap: 0, force: true });
              const ck = new Kit(); for (const [x, y, z, s] of [[0, 0.3, 0, 0.4], [0.3, 0.3, 0.1, 0.28], [-0.3, 0.3, 0.1, 0.28], [0, 0.55, -0.1, 0.3]]) ck.add(G.sphere(12, 8), 0xfffaf0, [x, y, z], null, s); ck.add(G.sphere(8, 6), 0xd9a441, [0, 0.35, 0.34], null, 0.07);
              K.treasure(api, T, D.pen.x, D.pen.z + 0.2, api.dispose(ck.build()), { y: 0.3, sc: 1, r: 2.2, gold: 14, n: 8, sticker: 'degirmen_yun', hintY: 2.0, cast: true }); sfxAt('chest', D.pen.x, D.pen.z); }, 1200);
          },
          tick: (dt, t) => { if (hop < 1) { hop += dt * 1.8; m.position.y = Math.abs(Math.sin(hop * PI)) * 0.8; } else { m.position.y = Math.max(0, 0.06 * Math.sin(t * 3 + i * 2)); m.rotation.y += dt * 0.2 * (done ? 0 : 1); } } });
      });
      // ağıl çiti
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, x = D.pen.x + Math.sin(a) * (D.pen.r), z = D.pen.z + Math.cos(a) * (D.pen.r); if (!api.isFloor(x, z) || i % 2) continue; c.fence(x, z, a + PI / 2, 1.9); }
    }
    // ── Eski Çarklı Kuyu (yan oda B): çarka bas → kapak açılır → altın başak ──
    if (D.well) {
      const w = D.well;
      put3(api, c, w);
      const lidK = new Kit(); lidK.add(G.cyl(1, 1, 20), 0x8a5a34, [0, 0, 0], null, [0.95, 0.12, 0.95]); lidK.add(G.torus(TAU, 0.1, 16), 0x6a4426, [0, 0.08, 0], [PI / 2, 0, 0], [0.9, 0.9, 0.5]);
      const lid = kitMesh(api, lidK, { name: 'degirmen-kuyu-kapagi' }); lid.position.set(w.x, 0.62, w.z); api.add(lid);
      const crK = new Kit(); crK.add(G.cyl(1, 1, 10), 0x6a4426, [0, 0, 0], [0, 0, PI / 2], [0.07, 0.9, 0.07]); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; crK.add(G.box(), 0xa87040, [0, Math.sin(a) * 0.3, Math.cos(a) * 0.3], [a, 0, 0], [0.06, 0.06, 0.62]); }
      const crank = kitMesh(api, crK, { name: 'degirmen-kuyu-carki' }); crank.position.set(w.x + 1.7, 0.7, w.z); api.add(crank);
      api.box(w.x + 1.7, 0.35, w.z - 0.5, 0.14, 0.7, 0.14, WOOD, 0); api.box(w.x + 1.7, 0.35, w.z + 0.5, 0.14, 0.7, 0.14, WOOD, 0);
      api.solid(w.x, w.z, 1.1, 'kuyu');
      let open = 0, st = 0;
      T.add({ x: w.x + 1.7, z: w.z + 1.2, r: 1.1, hint: { y: 1.5 }, near: 6, once: true, line: 'b04_kuyu',
        use: () => { st = 1; sfxAt('clank', w.x, w.z, { pitch: 0.8 }); },
        tick: dt => {
          if (st === 1) { open = Math.min(1, open + dt * 0.6); crank.rotation.x += dt * 5; lid.position.x = w.x + open * 1.6; lid.rotation.y = open * 0.8; if (open >= 1) { st = 2; sfxAt('unlock', w.x, w.z); burst('sparkle', w.x, 0.8, w.z, { color: '#ffe08a', count: 14 }); say('b04_kuyu_acildi', { gap: 0, force: true });
            const gk = new Kit(); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; gk.add(G.cone(3), 0xe8b830, [Math.sin(a) * 0.1, 0.45, Math.cos(a) * 0.1], [Math.cos(a) * 0.2, 0, -Math.sin(a) * 0.2], [0.07, 0.9, 0.07]); gk.add(G.octa(), 0xffd860, [Math.sin(a) * 0.2, 0.95, Math.cos(a) * 0.2], null, [0.07, 0.24, 0.07]); }
            K.treasure(api, T, w.x, w.z, api.dispose(gk.build()), { y: 0.2, sc: 1.4, r: 2.3, gold: 12, n: 7, gs: true, sticker: 'degirmen_basak', hintY: 2.0, cast: true }); } }   // (r 2,3: kuyunun engeli 1,1 — 1,6'da Feza ödüle zar zor yetişiyordu)
        } });
    }
    yield;

    // ── canlı dünya ──
    let tt = 0, intro = 0, unHintT = 2, unHintN = 0, areaSaid = {}, splashT = 0, smokeT = 0, lastX = 0, lastZ = 0, ikram = null, cheerT = -1, wasPisti = false;
    const nearStream = (x, z) => { for (const S of c.streams) for (const q of S.sp) if (dist2(q.x, q.z, x, z) < (S.w * 0.9) * (S.w * 0.9)) return true; return false; };
    const areaIdx = () => (GAME.P.area ?? -1);
    api.anim((dt, hx_, hz_) => {
      tt += dt; qT += dt;
      if (!inZone()) { hudHide(); return; }
      if (!TARIFYOK) { if (!HUD) hudMake(); hudUpdate(); }
      const p = GAME.P;
      for (let i = Q.length - 1; i >= 0; i--) if (qT >= Q[i].at && live()) { const q = Q.splice(i, 1)[0]; say(q.k, { once: false, gap: 0, force: true }); }
      if (live()) {
        holdUpdate(dt, tt); halaTick(dt, tt); helpTick(dt, tt);
        // dere: içinden yürüyünce ışıltılı su sıçrar
        const mv = hyp(hx_ - lastX, hz_ - lastZ) > dt * 0.8;
        if ((splashT -= dt) <= 0 && mv && nearStream(hx_, hz_)) { splashT = 0.22; burst('sparkle', hx_, 0.25, hz_, { color: '#bff6ff', count: 3 }); burst('bubbles', hx_, 0.15, hz_, { count: 2 }); if (Math.random() < 0.4) sfx('splash', { x: hx_, z: hz_, vol: 0.35, pitch: 1.2 }); }
        lastX = hx_; lastZ = hz_;
        // öğretici cümleler (alan girişlerinde)
        const ai = areaIdx();
        intro += dt;
        if (ai === 0 && intro > 2.2 && !said.has('b04_tarla')) say('b04_tarla');
        if (!TARIFYOK && ai === 0 && intro > 13 && said.has('b04_tarla')) say('b04_tarif', { gap: 8 });
        if (!TARIFYOK && ai === 2 && R.kor === 0) say('b04_kemer', { gap: 8 });
        if (ai === 3) say('b04_firin_duman', { gap: 6 });
        // başak ipucu: yakında (18 m) toplanmamış demet varsa Pırıl en yakınını gösterir (uzaktan, boss kapısında "topla" demez)
        if (R.un < R.unN && intro > 8 && unHintN < 5 && (unHintT -= dt) <= 0) {
          const nb = nearBundle(hx_, hz_);
          if (nb && nb.d < 18 && nb.d > 2) { if (say('b04_un', { once: false, gap: 6 })) { unHintT = 24; unHintN++; pointTo(nb.x, nb.z); } else unHintT = 2; } else unHintT = 1;
        }
        // kapı çuvalları: ekmek pişince kaybolur; önce yaklaşırsa kibarca uyarır, beklerse Hala ekmekle gelir (yumuşak kilit)
        wallTick(dt, hx_, hz_);
      }
      // ekmek pişme sahnesi: ekmek ocaktan çıkar, yarılır, altın iz yola uzanır, ekmek Feza'nın eline gelir
      if (R.bakeAnim && ov) {
        const b = R.bakeAnim; b.t += dt;
        if (!b.m) { const kk = new Kit(); loafKit(kk); b.m = kitMesh(api, kk, { name: 'degirmen-pisen-ekmek', emissive: 0xffb040, ei: 0.5 }); b.m.scale.setScalar(2.0); api.add(b.m); b.g = api.dispose(new THREE.Mesh(api.dispose(new THREE.SphereGeometry(0.2, 10, 8)), api.dispose(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.2, 0.5), transparent: true, opacity: 0 })))); api.add(b.g); if (trailM) trailM.visible = true; }
        const u1 = Math.min(1, b.t / 1.3), u2 = clamp((b.t - 2.6) / 1.1, 0, 1);
        const sx = ov.x, sz = ov.z + 2.4;
        if (b.t < 2.6) { b.m.position.set(sx, 0.9 + u1 * 1.1 + 0.05 * Math.sin(b.t * 4), sz); b.m.rotation.y += dt * 1.4; b.m.scale.setScalar(2.0 + 0.4 * Math.sin(Math.min(1, b.t / 2) * PI)); }
        else { const f = p.face + 1.15, tx = p.pos.x + Math.sin(f) * 0.55, tz = p.pos.z + Math.cos(f) * 0.55; b.m.position.set(sx + (tx - sx) * u2, 2.0 + (1.17 - 2.0) * u2 + Math.sin(u2 * PI) * 0.6, sz + (tz - sz) * u2); b.m.scale.setScalar(2.4 - 1.4 * u2); }
        b.g.position.set(sx, 2.2, sz); b.g.material.opacity = bump01(b.t, 1.0, 1.4, 2.0, 2.6) * 0.6; b.g.scale.setScalar(1 + 3 * bump01(b.t, 1.0, 1.4, 2.0, 2.6));
        if (b.t > 1.2 && b.t < 2.6 && (b.bt = (b.bt || 0) - dt) <= 0) { b.bt = 0.06; burst('sparkle', sx + (Math.random() - 0.5) * 0.6, 2.0 + Math.random() * 0.4, sz + (Math.random() - 0.5) * 0.6, { color: '#ffd060', count: 2 }); }   // yarılan ekmekten altın buhar
        trailMat.u.value = Math.min(1, b.t / 4.5);
        if (b.t >= 3.7) { R.tutan = 'ekmek'; b.m.visible = false; b.g.visible = false; R.bakeAnim = null; ring(p.pos.x, p.pos.z, 2.2, '#ffd36a'); }
      }
      // fırın bacası: ince duman; çark kuşu dönüşü; dönen çarklar
      if (ov && (smokeT -= dt) <= 0) { smokeT = R.pisti ? 0.5 : 1.1; if (dist2(hx_, hz_, ov.x, ov.bz) < 3600) burst('steam', ov.x + 1.6, 8.2, ov.bz - 0.3, { count: R.pisti ? 3 : 1 }); }
      for (const s of c.spinners) {
        if (s.once) { if (s.spin > 0) { const d = Math.min(s.spin, dt * 2.4); s.m.rotation.z -= d; s.spin -= d; } }
        else s.m.rotation.z -= dt * s.k * (s.z ? 1 : 0.5) * (R.bekci ? 3 : 1);
      }
      // boss neşelenince: ekmek ikramı, çarklar döner, çanlar çalar
      const bs = GAME.boss;
      if (bs && bs.type === 'degirmenBekcisi' && bs.dead && cheerT < 0) {
        cheerT = 0; R.bekci = true;
        // (tarif yok: ışık ekmeğini Hala getirir — yanındaysa ondan, değilse Feza'dan uçar; Bekçi ısırır, b04_bitti "ışık ekmeğinden" der)
        const hn = hala && haI.said && hyp(hala.position.x - p.pos.x, hala.position.z - p.pos.z) < 6;
        ikram = { t: 0, bx: bs.x, bz: bs.z, fx: hn ? hala.position.x : p.pos.x, fz: hn ? hala.position.z : p.pos.z };
        if (TARIFYOK) R.tutan = 'ekmek';
      }
      if (cheerT >= 0) {
        cheerT += dt;
        if (ikram && R.tutan === 'ekmek' && cheerT < 3.5) {   // ekmek Feza'dan Bekçi'ye uçar
          const u = clamp(cheerT / 1.1, 0, 1), x = ikram.fx + (ikram.bx - ikram.fx) * u, z = ikram.fz + (ikram.bz - ikram.fz) * u;
          loaf.visible = true; loaf.position.set(x, 1.1 + Math.sin(u * PI) * 1.4 + u * 1.2, z); loaf.rotation.y += dt * 6;
          if (u >= 1 && !ikram.done) { ikram.done = true; R.tutan = null; loaf.visible = false; sfx('pop', { x, z, pitch: 1.3 }); burst('hearts', x, 3, z, { count: 6 }); burst('sparkle', x, 2.8, z, { color: '#ffd060', count: 14 }); }
        }
        if (cheerT > 1.6 && cheerT < 2.0) { sfx('bell', { x: ikram ? ikram.bx : hx_, z: ikram ? ikram.bz : hz_, pitch: 0.7 }); }
        if (bigSailsSpin(c, cheerT, dt)) { /* döner */ }
        if (cheerT > 3 && (areaSaid.bell = (areaSaid.bell || 0) + dt) > 1.2) { areaSaid.bell = 0; sfx('bell', { x: hx_, z: hz_, pitch: 0.8 + Math.random() * 0.5, vol: 0.5 }); }
      }
      for (const f of anims) f(dt, tt);
    });
    if (typeof GAME !== 'undefined' && GAME.on && !DEGIRMEN._hooked) {
      DEGIRMEN._hooked = true;
      GAME.on('zone', () => { hudHide(); resetR(); });
      GAME.on('happy', e => {
        if (!inZone() || !e || e.boss) return;
        if (!said.has('pp_degirmen_ilk_nese')) say('pp_degirmen_ilk_nese', { gap: 1 });
        else if (Math.random() < 0.1) say(['pp_degirmen_aferin1', 'pp_degirmen_aferin2', 'pp_degirmen_aferin3'][(Math.random() * 3) | 0], { once: false, gap: 25 });
      });
      // (pp_degirmen_boss "Ekmeği unutma!" artık yok: tarif/ekmek taşıma kalktı, Feza'dan imkânsız bir şey istemesin)
    }
  }
  const bump01 = (t, a, b, c, d) => smooth01((t - a) / (b - a)) * (1 - smooth01((t - c) / (d - c)));
  function bigSailsSpin(c, t, dt) {   // arena değirmeninin çarkları neşelenince dönmeye başlar (yavaştan hızlıya)
    const k = smooth01((t - 1.0) / 2.5) * 1.6;
    if (c.bigSails) c.bigSails.rotation.z -= dt * k;
    if (c.bigWheel) c.bigWheel.rotation.z -= dt * k * 0.8;
    return k > 0;
  }
  function put3(api, c, w) {   // kuyu gövdesi: taş halka + iki direk + çatı kirişi
    const THREE = api.THREE;
    api.put(c.cyl, w.x, 0.3, w.z, 1.05, 0.6, 1.05, 0xb9b2a2, 0); api.put(c.cyl, w.x, 0.62, w.z, 1.12, 0.1, 1.12, 0xd8d0be, 0);
    void THREE;
  }

  function kurSon(L, api) {
    api = sadeApi(api);
    const ex = L.exit; if (!ex) return;
    const THREE = api.THREE, k = new Kit(), kd = new Kit(), c = new THREE.Color();
    const po = L.portalObj && L.portalObj.obj, px = po ? po.position.x : ex.x, pz = po ? po.position.z : ex.z, yaw = po ? po.rotation.y : 0;
    const cs = Math.cos(yaw), sn = Math.sin(yaw), at = (lx, y, lz) => [px + lx * cs + lz * sn, y, pz - lx * sn + lz * cs];
    const RX = 3.0, RY = 5.0, N = 15;
    for (let i = 0; i <= N; i++) {   // kapı kemeri boyunca altın başaklar
      const t = i / N * PI, lx = Math.cos(t) * RX, y = Math.sin(t) * (RY - 1.6) + 1.6 * Math.min(1, Math.sin(t) * 3), p = at(lx, Math.max(0.4, y), -0.6);
      c.set(i % 2 ? 0xffd860 : 0xf2b83a);
      k.add(G.octa(), c, p, [0, 0, t - PI / 2], [0.1, 0.34, 0.1]);
      k.add(G.sphere(8, 5), 0xfff0b0, [p[0], p[1] + 0.1, p[2]], null, 0.08);
      kd.add(G.cone(3), 0xc8a238, [p[0], p[1] - 0.3, p[2]], null, [0.05, 0.6, 0.05]);
    }
    for (const sd of [-1, 1]) {   // iki yanda dev saman balyası + çuval
      const q = at(sd * (RX + 0.8), 0, -0.6);
      kd.add(G.cyl(1, 1, 14), 0xe8c456, [q[0], 1.0, q[2]], [0, 0, PI / 2], [1.0, 1.6, 1.0]); kd.add(G.cyl(1, 1, 14), 0xc8a238, [q[0], 1.0, q[2]], [0, 0, PI / 2], [1.02, 0.1, 1.02]);
      kd.add(G.sphere(12, 8), 0xefe2c4, [q[0] + sd * 1.3, 0.45, q[2] + 0.4], null, [0.5, 0.5, 0.42]);
    }
    const gm = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(0.9, 0.9, 0.9) });
    const gmesh = new THREE.Mesh(k.build(), gm); gmesh.name = 'degirmen-cikis-kemeri'; api.add(gmesh); api.dispose(gm); api.dispose(gmesh.geometry);
    const dm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 });
    const dmesh = new THREE.Mesh(kd.build(), dm); dmesh.castShadow = true; dmesh.name = 'degirmen-cikis-balya'; api.add(dmesh); api.dispose(dm); api.dispose(dmesh.geometry);
    api.glow(px, pz, 4, 0xfff0a8, 0.25);
    api.light(px, 3.2, pz + 0.8, 0xffe8b0, 3.2, 10, 0.1);
    let t = 0, on = 0;
    api.anim(dt => {
      t += dt;
      const b = typeof GAME !== 'undefined' ? GAME.boss : null, open = !!(L.portalObj && L.portalObj.active) || !!(b && b.dead && b.type === 'degirmenBekcisi') || !(b && b.type === 'degirmenBekcisi');
      on = damp(on, open ? 1 : 0, 1.5, dt);
      gm.color.setScalar(0.75 + on * (1.4 + 0.6 * Math.sin(t * 3.2)));
      if (on > 0.5 && Math.random() < dt * 4) { const u = Math.random() * PI, p = at(Math.cos(u) * RX, Math.sin(u) * (RY - 1.6) + 1.2, -0.6); burst('sparkle', p[0], p[1], p[2], { color: '#fff0a8', count: 2 }); }
    });
  }

  BOLUM.define('degirmen', {
    ad: 'Altın Değirmen Vadisi',
    taban: 'forest',
    size: 100, side: 2,
    areas: [{ id: 'a1', ad: 'Altın Tarlalar', rooms: 2 }, { id: 'a2', ad: 'Berrak Dere ve Köprüler', rooms: 2 }, { id: 'a3', ad: 'Altın Tepeler ve Taş Kemerler', rooms: 2 }, { id: 'a4', ad: 'Durmuş Kasaba ve Fırın Meydanı', rooms: 2 }],
    muzik: 'degirmen',
    malzeme: 'isik4',
    kayipEsya: null,
    final: false,
    isik: { fog: [0xf0d898, 34, 95], hemiSky: 0xfff0c8, hemiGround: 0xa88a50, hemi: 0.82, sunColor: 0xffdc98, sun: 1.25, sunOffset: [-12, 26, 12],
      env: [0xf0d89a, 0xffe8b8, 0xb89a60, 0.85], bloom: 0.18, exposure: 0.96, sat: 1.05, vig: 0.28, fezaLight: 1.4, fezaLightColor: 0xfff0d8, moss: [0xd8c070, 0], rim: [0xfff0c8, 0.2] },
    zemin: { tA: 0xe2c878, tB: 0xe8dcb0, tC: 0xf0e6c4, out: 0xb09a58, outAmt: 0.5, macro: 0xfff0c8 },
    minimap: { zemin: '#d8bd6a' },
    harita: { ad: 'Altın Değirmen Vadisi', detay: 'Altın başaklar, berrak dere, fırıncı Hala ve Değirmen Bekçisi', renk: '#e9b44c', x: 50, y: 61, simge: '🌾' },
    yolculuk: { arac: 'kirinti', cumle: 'Ekmek kırıntıları yolu gösteriyor. Kaydıraktan aşağı!' },
    parcaIpucu: 'Işık yerin altında, taşların ve kristallerin arasında.',
    yerlesim,
    kur,
    kurSon,
  });
  return { _hooked: false, R };
})();
