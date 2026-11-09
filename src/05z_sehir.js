/* ── 8. bölüm: Surlu Şehir — huysuzlar (sisin unutturduğu şehirliler) + boss Huysuz Şövalye (Feza ile Pırıl: Büyük Fener) ──
   Sahibi: B8. Kaynak görünüm: feza-bilbo/huysuz Surlu Şehir (nöbetçi, simitçi, süpürgeci, tellal, Şövalye ve atı); modeller
   motorun 05_enemies.js'inde hazır, burada yeniden çerçevelenir: kızgın yüz YOK (grumpy yüz yerine gülen yüz), kızgın değil,
   "sis yüzünden kendini unutmuş". Düşman sayısı az; asıl iş 06z_sehir.js'teki Hatırlatma.
     sehirNobetci   Unutmuş Nöbetçi   ponpon uçlu mızrak, hafif uzatıp itme     base nobetci
     sehirSimitci   Unutmuş Simitçi    tepsiden simit fırlatır (yerde işaret)    base simitci
     sehirSupurgeci Unutmuş Süpürgeci  süpürgeyle kayarak gelir                  base supurgeci 'kayan'
     sehirTellal    Unutmuş Tellal     davul "güm" diye halka yapar (tek elit)   base tellal
     sisCocugu      Sis Çocuğu         küçük sis topu, yaklaşınca dolanır; zararı çok az   base kopuk
     huysuzSovalye  Huysuz Şövalye     boss: Dörtnala (mavi şerit), Şahlanma (turuncu halka), At Nalı (sarı daire), Mızrak (kırmızı alan),
                    Nöbetçi Çağırma (aşama 3). Sancaklar ve havuç oyunu motorun 'sovalye' davranışında hazır. Neşelenince adını hatırlar.
   Genel ad: HZ_SEHIR. Cümleler: 02l_sehir.js (b08_...). */
const HZ_SEHIR = (() => {
  'use strict';
  const HAS = typeof HUYSUZ !== 'undefined' && HUYSUZ && HUYSUZ.type;
  if (!HAS) return {};
  const EM = typeof EMODEL !== 'undefined' && EMODEL ? EMODEL : null;

  // kızgın yüz yok: motor 'grumpy' isterse gülen yüz göster (sis yüzünden şaşkın/kayıp hâl)
  function yumusat(m) {
    if (m && typeof m.setMood === 'function' && !m._yumusak) {
      const sm = m.setMood; m._yumusak = 1;
      m.setMood = function (md) { return sm.call(m, md === 'grumpy' ? 'happy' : md); };
      try { sm.call(m, 'happy'); } catch (e) { /* yok */ }
    }
  }
  // mor → mavi (mor yalnız Pırıl'ın) + isteğe bağlı "sisli" süt-gri pastel hâl (unutmuş şehirli; hatırlayınca tam renk).
  // Boyanmış geometri asıl geometri başına BİR KEZ yapılır ve bütün kopyalar paylaşır (eskiden her düşman kendi kopyasını alıyordu);
  // motor setMood ile geometriyi değiştirince (ör. neşelenince) mor geri gelmesin diye setMood sarılır.
  const PAL = new WeakMap(), SRC = new WeakMap();
  function palGeo(g0) {
    let p = PAL.get(g0); if (p) return p;
    const c = new THREE.Color(), hsl = { h: 0, s: 0, l: 0 };
    const mk = gri => {
      const g = g0.clone(), a = g.attributes.color, n = a.count;
      for (let i = 0; i < n; i++) {
        c.setRGB(a.getX(i), a.getY(i), a.getZ(i)); c.getHSL(hsl);
        if (hsl.s > 0.2 && hsl.h > 0.69 && hsl.h < 0.9) c.setHSL(0.6, Math.min(0.75, hsl.s), hsl.l);
        if (gri) { const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11, v = 0.2 + l * 0.72; c.setRGB(v + (c.r - l) * 0.18, v + (c.g - l) * 0.18, v * 1.03 + (c.b - l) * 0.18); }
        a.setXYZ(i, c.r, c.g, c.b);
      }
      a.needsUpdate = true; g.userData.keep = true; SRC.set(g, g0); return g;
    };
    p = { renk: mk(false), gri: mk(true) }; PAL.set(g0, p); return p;
  }
  function boya(root, gri) {
    root.traverse(o => {
      const g = o.geometry; if (!g || !g.attributes || !g.attributes.color) return;
      const g0 = SRC.get(g) || g, p = palGeo(g0), w = gri ? p.gri : p.renk;
      if (o.geometry !== w) o.geometry = w;
    });
  }
  function morKaldir(root, m, gri = false) {
    if (!root || !root.traverse) return;
    root.userData._sehirGri = gri; boya(root, gri);
    if (m && typeof m.setMood === 'function' && !m._sehirPal) {
      const sm = m.setMood; m._sehirPal = 1;
      m.setMood = function (md) { const r = sm.call(m, md); boya(root, !!root.userData._sehirGri); return r; };
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

  // Yiğit (Huysuz Şövalye) ve atı Pamuk: yüz yukarıdan görünsün diye şövalyenin başı biraz büyük, altın ışık havuzu, kenar ışığı
  function sovalyePost(root, m) {
    morKaldir(root, m);
    BB.rim(m, '#ffe2b0', 0.6);
    const gl = BB.ground(root, 0xffd890, 4.2, 0.34);
    const sp = new THREE.Group(), spM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0b0).multiplyScalar(1.5) });
    for (let i = 0; i < 5; i++) { const q = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), spM); q.userData.a = i * 1.26; sp.add(q); }
    root.add(sp);
    const a0 = m.anim; let ot = 0, al = 0;
    if (typeof a0 === 'function') m.anim = function (dt, st) {
      const r = a0.apply(this, arguments); dt = dt || 0.016; st = st || {};
      const ph = st.phase || '', hot = (st.windup >= 0 && st.windup < 1) || ph === 'charge' || ph === 'rear' || ph === 'sweep' || ph === 'toss';
      al += ((hot ? 1 : 0) - al) * Math.min(1, dt * 4); ot += dt * (1 + al);
      if (m.B && m.B.head) m.B.head.scale.multiplyScalar(1.22);   // büyük sevimli kafa: yüzü görünsün
      gl.mat.opacity = gl.k * (0.9 + 0.1 * Math.sin(ot * 1.4) + al * 0.25);
      sp.children.forEach((q, i) => { const a = q.userData.a + ot * 0.8; q.position.set(Math.sin(a) * 1.9, 3.7 + Math.sin(ot * 1.6 + i) * 0.25, Math.cos(a) * 1.9); q.rotation.y = a * 2; q.scale.setScalar(0.8 + 0.3 * Math.sin(ot * 3 + i)); });
      return r;
    };
  }
  const viaBase = (base, post) => o => {
    const m = EM && EM.build ? EM.build.call(EM, base, o || {}) : null;
    if (m && m.root && post) post(m.root, m);
    return m;
  };
  const yum = base => viaBase(base, (root, m) => { yumusat(m); morKaldir(root, m); });

  HUYSUZ.type('sehirNobetci', { ad: 'Unutmuş Nöbetçi', base: 'nobetci', saldiri: 'yakin', stats: { hp: 40, dmg: 5 }, model: yum('nobetci'), ilkSoz: 'b08_sur' });
  HUYSUZ.type('sehirSimitci', { ad: 'Unutmuş Simitçi', base: 'simitci', saldiri: 'uzak', stats: { hp: 30, dmg: 4 }, model: yum('simitci') });
  HUYSUZ.type('sehirSupurgeci', { ad: 'Unutmuş Süpürgeci', base: 'supurgeci', saldiri: 'kayan', stats: { hp: 26, dmg: 4 }, model: yum('supurgeci') });
  HUYSUZ.type('sehirTellal', { ad: 'Unutmuş Tellal', base: 'tellal', saldiri: 'agir', stats: { hp: 90, dmg: 7 }, model: yum('tellal') });
  HUYSUZ.type('sisCocugu', { ad: 'Sis Çocuğu', base: 'kopuk', saldiri: 'yakin', boyut: 0.9, stats: { hp: 14, dmg: 1, speed: 2.4, atkCd: 2.6 }, model: yum('kopuk') });

  // ── Boss: Huysuz Şövalye (Yiğit) ve atı (Pamuk) ──
  HUYSUZ.boss('huysuzSovalye', {
    ad: 'Huysuz Şövalye', base: 'sovalye',
    lines: { giris: 'b08_sovalye_giris', bitti: 'b08_bitti', yarim: 'b08_yarim', sancak: 'b08_sancak' },
    bossKit: { add: 'sehirNobetci', at: [0.33], n: [2], roar: 1.05, col: '#ffd23f', roarSfx: 'neigh', summonAt: 0.5, horn: true, word: 'Hımf!', roam: true, addHp: 0.5, addDmg: 0.6, bonus: 'havuc' },
    model: viaBase('sovalye', (root, m) => { sovalyePost(root, m); m.baseType = 'sovalye'; m.type = 'huysuzSovalye'; }),
  });

  HUYSUZ.zone('sehir', {
    enemies: { sehirNobetci: 3, sehirSimitci: 2.5, sehirSupurgeci: 2, sisCocugu: 2, sehirTellal: 1 },
    elites: ['sehirTellal'], boss: 'huysuzSovalye',
  });
  return { morKaldir };
})();
