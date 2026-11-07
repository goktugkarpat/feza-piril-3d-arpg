/* ── 7. bölüm: Lav Yanardağı — huysuzlar + boss Koca Lav Kaplumbağası (Feza ile Pırıl: Büyük Fener) ──
   Sahibi: B78. Modeller motorun 05_enemies.js'inden (huysuz Lav Yanardağı); kızgın yüz yok, mor yok. Lav sıcak bir dekordur, yakmaz.
     minikLavKaplumbaga  Minik Lav Kaplumbağası  kabuğa girip şeritte yuvarlanır (yeşil yoldan çık)  base kaplumbaga
     atesKusu            Ateş Kuşu               uzaktan yavaş kıvılcım atar                          base ateskusu
     lavJolesi           Lav Jölesi              zıplar, dokununca neşelenir                          base jole (lava)
     magmaDevi           Magma Kaya Devi         tek elit, yavaş; yere vurunca halka                  base golem (magma)
     sicakTasYavrusu     Sıcak Taş Yavrusu       sallanır, "pof" buhar, kendi ayağına takılır         base kratercik (turuncu)
     kocaLavKaplumbagasi boss: kırmızı daireler (lav topu), turuncu şerit (yuvarlanma) (motorun 'lavkaplumbaga' davranışı; serin taşlar oyunu kaldırıldı).
       Pırıl uyuduğu için bu savaşta yardım edemez: can ×0,8, hasar düşük.
   Genel ad: HZ_YANARDAG. Cümleler: 02l_yanardag.js (b07_...). */
const HZ_YANARDAG = (() => {
  'use strict';
  const HAS = typeof HUYSUZ !== 'undefined' && HUYSUZ && HUYSUZ.type;
  if (!HAS) return {};
  const EM = typeof EMODEL !== 'undefined' && EMODEL ? EMODEL : null;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  function tint(root, hue, sat, lk = 1) {   // mor/pembe köşe renkleri → sıcak ton (geometri kopyalanır)
    if (!root || !root.traverse) return;
    const c = new THREE.Color(), hsl = { h: 0, s: 0, l: 0 };
    root.traverse(o => {
      let g = o.geometry; if (!g || !g.attributes || !g.attributes.color || o.userData._yan) return;
      o.userData._yan = 1; o.geometry = g = g.clone();
      const a = g.attributes.color, n = a.count;
      for (let i = 0; i < n; i++) {
        c.setRGB(a.getX(i), a.getY(i), a.getZ(i)); c.getHSL(hsl);
        if (hsl.s > 0.12 && hsl.h > 0.69 && hsl.h < 0.93 && hsl.l > 0.2) { c.setHSL(hue, sat, clamp(hsl.l * lk, 0, 0.95)); a.setXYZ(i, c.r, c.g, c.b); }
      }
      a.needsUpdate = true;
    });
  }
  function gule(m) {   // kızgın yüz yerine gülen yüz
    if (m && typeof m.setMood === 'function' && !m._yumusak) {
      const sm = m.setMood; m._yumusak = 1;
      m.setMood = function (md) { return sm.call(m, md === 'grumpy' ? 'happy' : md); };
      try { sm.call(m, 'happy'); } catch (e) { /* yok */ }
    }
  }
  // ── BOSSB: ortak parlatma yardımcıları (zemin ışıması, kenar ışığı, havada uçuşan parıltılar) ──
  const BB = (() => {
    let tex = null;
    const glowTex = () => {
      if (tex) return tex;
      const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64); tex = new THREE.CanvasTexture(c); tex.userData = { keep: true }; return tex;
    };
    // yerde yumuşak renkli ışık havuzu (boss yerden ayrışsın)
    function ground(root, color, R, k) {
      const mt = new THREE.MeshBasicMaterial({ map: glowTex(), color, transparent: true, opacity: k, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
      const g = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), mt); g.scale.set(R, 1, R); g.position.y = 0.05; g.renderOrder = 1; g.name = 'bb-zemin';
      root.add(g); return { mesh: g, mat: mt, k, R };
    }
    function halo(parent, color, s, pos, k) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, opacity: k, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      sp.scale.set(s, s, 1); sp.position.set(pos[0], pos[1], pos[2]); parent.add(sp); return sp;
    }
    // kenar ışığı rengi/gücü: malzemenin derlenmesini yakalayıp değiştirir
    function rim(m, color, k) {
      const mat = m && m.mat; if (!mat) return;
      const c = new THREE.Color(color).multiplyScalar(k), prev = mat.onBeforeCompile;
      mat.onBeforeCompile = (sh, r) => { prev.call(mat, sh, r); if (sh.uniforms.rimColor) sh.uniforms.rimColor.value.copy(c); };
      mat.needsUpdate = true;
    }
    // köşe renklerini sıcağa çevir (fn(hsl, c) → true ise c değişti)
    function recolor(root, key, fn) {
      const c = new THREE.Color(), hsl = { h: 0, s: 0, l: 0 };
      root.traverse(o => {
        let g = o.geometry; if (!g || !g.attributes || !g.attributes.color || o.userData[key]) return;
        o.userData[key] = 1; o.geometry = g = g.clone();
        const a = g.attributes.color;
        for (let i = 0; i < a.count; i++) { c.setRGB(a.getX(i), a.getY(i), a.getZ(i)); c.getHSL(hsl); if (fn(hsl, c)) a.setXYZ(i, c.r, c.g, c.b); }
        a.needsUpdate = true;
      });
    }
    return { glowTex, ground, halo, rim, recolor };
  })();

  // Koca Lav Kaplumbağası: sıcak kızıl-kahve kabuk, süs olarak parlayan çatlaklar, kabuğun etrafında uçuşan kıvılcımlar
  function lavPost(root, m) {
    gule(m); tint(root, 0.07, 0.6, 1);
    BB.recolor(root, '_kab', (hsl, c) => {   // koyu gri-kahve kabuk → zengin sıcak kızıl kahve (yeşil baş ve turuncu çatlaklar aynı kalır)
      if (hsl.l < 0.34 && (hsl.h < 0.14 || hsl.s < 0.25)) { c.setHSL(0.03, 0.5, clamp(hsl.l * 0.8 + 0.02, 0, 0.3)); return true; }
      return false;
    });
    BB.rim(m, '#ffd9a0', 0.55);
    const gl = BB.ground(root, 0xffe0a0, 3.4, 0.12);
    const em = new THREE.Group(), emM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffa040).multiplyScalar(1.5) });
    for (let i = 0; i < 8; i++) { const q = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), emM); q.userData.p = i / 8; q.userData.a = i * 2.4; em.add(q); }
    root.add(em);
    const a0 = m.anim; let ot = 0, al = 0;
    if (typeof a0 === 'function') m.anim = function (dt, st) {
      const r = a0.apply(this, arguments); dt = dt || 0.016; st = st || {};
      const ph = st.phase || '', hot = (st.windup >= 0 && st.windup < 1) || ph === 'erupt' || ph === 'hide' || ph === 'roll' || ph === 'stomp';
      al += ((hot ? 1 : 0) - al) * Math.min(1, dt * 4); ot += dt * (1 + al * 1.5);
      gl.mat.opacity = gl.k * (0.9 + 0.1 * Math.sin(ot * 1.6) + al * 0.3);
      em.children.forEach(q => { const u = (q.userData.p + ot * 0.18) % 1, a = q.userData.a + ot * 0.5; q.position.set(Math.sin(a) * (1.4 + u * 0.8), 0.8 + u * 2.6, Math.cos(a) * (1.4 + u * 0.8)); q.scale.setScalar(Math.sin(u * Math.PI) * (1 + al * 0.6) + 0.01); });
      return r;
    };
  }
  const viaBase = (base, post, variant) => o => {
    const m = EM && EM.build ? EM.build.call(EM, base, Object.assign({}, o || {}, variant ? { variant } : {})) : null;
    if (m && m.root && post) post(m.root, m);
    return m;
  };
  HUYSUZ.type('minikLavKaplumbaga', { ad: 'Minik Lav Kaplumbağası', base: 'kaplumbaga', stats: { hp: 26, dmg: 4, speed: 2.1 }, model: viaBase('kaplumbaga', (r, m) => { gule(m); tint(r, 0.07, 0.6, 1); }), ilkSoz: 'b07_kaplumbaga_ilk' });
  HUYSUZ.type('atesKusu', { ad: 'Ateş Kuşu', base: 'ateskusu', stats: { hp: 18, dmg: 3, atkCd: 3.4 }, model: viaBase('ateskusu', (r, m) => { gule(m); tint(r, 0.08, 0.7, 1); }), ilkSoz: 'b07_atesKusu_ilk' });
  HUYSUZ.type('lavJolesi', { ad: 'Lav Jölesi', base: 'jole', variant: 'lava', stats: { hp: 20, dmg: 3 }, model: viaBase('jole', (r, m) => gule(m), 'lava'), ilkSoz: 'b07_jole_ilk' });
  HUYSUZ.type('magmaDevi', { ad: 'Magma Kaya Devi', base: 'golem', variant: 'magma', stats: { hp: 80, dmg: 5 }, model: viaBase('golem', (r, m) => { gule(m); tint(r, 0.07, 0.6, 1); }, 'magma'), ilkSoz: 'b07_dev_ilk' });
  HUYSUZ.type('sicakTasYavrusu', { ad: 'Sıcak Taş Yavrusu', base: 'kratercik', saldiri: 'yakin', stats: { hp: 20, dmg: 3, speed: 1.5, atkCd: 2.6, windup: 1.0 },
    model: viaBase('kratercik', (r, m) => { gule(m); tint(r, 0.06, 0.75, 1.05); }), ilkSoz: 'b07_ilk_tasyavru' });

  HUYSUZ.boss('kocaLavKaplumbagasi', {
    ad: 'Koca Lav Kaplumbağası', base: 'lavkaplumbaga', stats: { hp: 1040, dmg: 9 },
    lines: { giris: 'b07_kaplumbaga_giris', bitti: 'b07_bitti', yarim: 'b07_yarim' },
    // (7 Kasım, ebeveyn: "Serin Taşlar" kaldırıldı — kaplumbağa yuvarlanırken doğru anda taşın arkasına saklanmak 5 yaşına zor; boss yalnız dokunarak neşelenir)
    bossKit: { add: 'minikLavKaplumbaga', at: [0.5], n: [2], roar: 0.95, col: '#ff9a3c', bonus: null, addHp: 0.5, addDmg: 0.6 },
    model: viaBase('lavkaplumbaga', (r, m) => { lavPost(r, m); m.baseType = 'lavkaplumbaga'; m.type = 'kocaLavKaplumbagasi'; }),
  });
  HUYSUZ.zone('yanardag', {
    enemies: { minikLavKaplumbaga: 3, atesKusu: 2, lavJolesi: 2.5, sicakTasYavrusu: 2, magmaDevi: 0.6 },
    elites: ['magmaDevi'], boss: 'kocaLavKaplumbagasi',
  });
  return { tint };
})();
