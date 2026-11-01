/* ── 6. bölüm: Ay Tapınağı — huysuzlar + boss Ay Tavşanı (Feza ile Pırıl: Büyük Fener) ──
   Sahibi: B6. Kaynak görünüm: feza-bilbo/huysuz Zıp Zıp Ay (ponpon, yıldızcık, kraterçik, Ponpon Ay Tavşanı); motorun 05_enemies.js
   modelleri taban alınır, mor/pembe tonlar maviye/taşa çevrilir (MOR YOK). "Ay" adı yok.
     yildizPonpon      Yıldız Ponpon        beyaz-mavi ponpon tavşancık, yavaş zıplar, düştüğü yeri daire gösterir   base ayponpon 'ziplayan'
     isikYildizcik     Işık Baloncuklu Yıldızcık  uçan minik yıldız, yavaş ışık baloncuğu üfler                       base yildizcik 'uzak'
     uykuTascik        Uykucu Taşçık        yıldız çukurundan çıkıp saklanır                                       base kratercik 'kazici'
     runTascik         Rün Taşçığı          gülen yassı taş, yavaşça kayar                                         base kratercik 'yakin'
     suzulenYildizcik  Süzülen Yıldızcık    tek yönde süzülüp geçer (yol işaretli)                                  base yildizcik 'kayan'
     mabetBekcisi      Ay Tavşanı        boss: taştan sevimli tavşan heykeli. Taş Zıplama (sarı daire), Baloncuk Yelpazesi (mavi koni),
                       Kulak Dalgası (turkuaz halka; üstünden zıpla), Rün Yağmuru (turuncu kareler), Yıldız Toplama (3 yıldız → Bekçi kıkırdar).
   Genel ad: HZ_MABET. Cümleler: 02l_mabet.js (b06_...). */
const HZ_MABET = (() => {
  'use strict';
  const HAS = typeof HUYSUZ !== 'undefined' && HUYSUZ && HUYSUZ.type;
  if (!HAS) return {};
  const EM = typeof EMODEL !== 'undefined' && EMODEL ? EMODEL : null;
  const PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // ── renk dönüşümü: mor/pembe köşe renkleri → hedef ton (geometri kopyalanır; taban model etkilenmez) ──
  function tint(root, hue, sat, lk = 1) {
    if (!root || !root.traverse) return;
    const c = new THREE.Color(), hsl = { h: 0, s: 0, l: 0 };
    root.traverse(o => {
      let g = o.geometry; if (!g || !g.attributes || !g.attributes.color || o.userData._mabet) return;
      o.userData._mabet = 1; o.geometry = g = g.clone();
      const a = g.attributes.color, n = a.count;
      for (let i = 0; i < n; i++) {
        c.setRGB(a.getX(i), a.getY(i), a.getZ(i)); c.getHSL(hsl);
        const purple = hsl.s > 0.1 && (hsl.h > 0.66 || hsl.h < 0.04);
        if (purple && hsl.l > 0.28) { c.setHSL(hue, sat, clamp(hsl.l * lk, 0, 0.97)); a.setXYZ(i, c.r, c.g, c.b); }
      }
      a.needsUpdate = true;
    });
  }
  const viaBase = (base, post) => o => {
    const m = EM && EM.build ? EM.build.call(EM, base, o || {}) : null;
    if (m && m.root && post) post(m.root, m);
    return m;
  };
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

  // Ay Tavşanı: sıcak krem kumtaşı heykel, parlayan kalp, tokmak + havan, dönen ay yıldızları (dost ve çok eski)
  function bekciPost(root, m) {
    tint(root, 0.11, 0.3, 0.97);
    // koyu (göz, burun) dışındaki her şey sıcak krem taş; yüz açık kalsın
    BB.recolor(root, '_taş', (hsl, c) => {
      if (hsl.l < 0.24) return false;
      c.setHSL(0.085, 0.7, clamp(0.46 + hsl.l * 0.36, 0, 0.82)); return true;
    });
    BB.rim(m, '#ffd8a0', 0.62);
    const gl = BB.ground(root, 0xffd890, 3.6, 0.42);
    const body = new THREE.Group(); root.add(body);
    const heart = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0b8).multiplyScalar(1.3) }));
    heart.scale.set(0.8, 1.15, 0.7); heart.position.set(0, 0.95, 1.3); body.add(heart);
    const hh = BB.halo(body, 0xffe6a0, 1.1, [0, 0.95, 1.35], 0.5);
    // elinde taş havan (sıcak kil-taş) ve tokmak
    const stoneM = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.85 });
    const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.38, 0.5, 18), new THREE.MeshStandardMaterial({ color: 0xc08a62, roughness: 0.8 })); mortar.position.set(0, 0.28, 1.1); body.add(mortar);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 20).rotateX(PI / 2), stoneM); rim.position.set(0, 0.53, 1.1); body.add(rim);
    const inside = new THREE.Mesh(new THREE.CircleGeometry(0.5, 18).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe39a).multiplyScalar(1.1) })); inside.position.set(0, 0.5, 1.1); body.add(inside);   // havanda ay tozu parıltısı
    const mal = new THREE.Group(), handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0x9a6a3a, roughness: 0.9 })), head = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 12).rotateZ(PI / 2), stoneM);
    head.position.y = 0.5; mal.add(handle, head); mal.position.set(0.95, 0.95, 0.8); mal.rotation.z = -0.35; body.add(mal);
    // başının çevresinde dönen ay-ışığı yıldızları (altın, parlak) + her birinin hâlesi
    const orb = new THREE.Group(), om = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe9a8).multiplyScalar(1.5) });
    for (let i = 0; i < 4; i++) { const q = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), om); q.userData.a = i / 4 * TAU; BB.halo(q, 0xffe08a, 1.6, [0, 0, 0], 0.5); orb.add(q); }
    orb.position.y = 2.7; body.add(orb);
    m.mabetHeart = heart;
    const a0 = m.anim; let ot = 0, al = 0, hp = 0;
    if (typeof a0 === 'function') m.anim = function (dt, st) {
      const r = a0.apply(this, arguments); dt = dt || 0.016; st = st || {};
      const ph = st.phase || '', hot = (st.windup >= 0 && st.windup < 1) || ph === 'tas' || ph === 'yelpaze' || ph === 'dalga' || ph === 'yagmur';
      const happy = st.dying >= 0 || ph === 'kikir5' || ph === 'kikir';
      al += ((hot ? 1 : 0) - al) * Math.min(1, dt * 4); hp += ((happy ? 1 : 0) - hp) * Math.min(1, dt * 4);
      ot += dt * (1 + al * 1.2 + hp * 0.8);
      const pul = 1 + 0.1 * Math.sin(ot * (2.4 + hp * 4)) + al * 0.2;
      heart.rotation.y += 0.02; heart.scale.set(0.8 * pul, 1.15 * pul, 0.7 * pul); hh.material.opacity = 0.45 + 0.15 * Math.sin(ot * 2.4) + al * 0.25 + hp * 0.2;
      gl.mat.opacity = gl.k * (0.9 + 0.1 * Math.sin(ot * 1.3) + al * 0.25);
      orb.rotation.y = 0; orb.position.y = 2.7 + hp * 0.25 * Math.sin(ot * 6);
      orb.children.forEach((q, i) => { const a = q.userData.a + ot * 0.9, R = 1.7 + hp * 0.3; q.position.set(Math.sin(a) * R, Math.sin(ot * 1.7 + i * 1.6) * 0.2, Math.cos(a) * R); q.rotation.y = a * 2; q.scale.setScalar(1 + 0.25 * Math.sin(ot * 3 + i)); });
      return r;
    };
  }

  // ── Huysuz tipleri ──
  HUYSUZ.type('yildizPonpon', { ad: 'Yıldız Ponpon', base: 'ayponpon', saldiri: 'ziplayan', stats: { hp: 22, dmg: 3, speed: 2.0, atkCd: 2.6, windup: 1.0 },
    model: viaBase('ayponpon', r => tint(r, 0.58, 0.28, 1.04)), ilkSoz: 'b06_ponpon' });
  HUYSUZ.type('isikYildizcik', { ad: 'Işık Baloncuklu Yıldızcık', base: 'yildizcik', saldiri: 'uzak', stats: { hp: 16, dmg: 2, speed: 1.8, atkCd: 3.2, windup: 1.0, shot: { kind: 'bubble', speed: 3.0, r: 0.3 } } });
  HUYSUZ.type('uykuTascik', { ad: 'Uykucu Taşçık', base: 'kratercik', saldiri: 'kazici', stats: { hp: 22, dmg: 3, speed: 2.2, atkCd: 2.4, windup: 0.9 },
    model: viaBase('kratercik', r => tint(r, 0.56, 0.18, 1.0)) });
  HUYSUZ.type('runTascik', { ad: 'Rün Taşçığı', base: 'kratercik', saldiri: 'yakin', stats: { hp: 20, dmg: 3, speed: 1.4, atkCd: 2.2, windup: 0.9 },
    model: viaBase('kratercik', r => tint(r, 0.09, 0.14, 0.92)) });
  HUYSUZ.type('suzulenYildizcik', { ad: 'Süzülen Yıldızcık', base: 'yildizcik', saldiri: 'kayan', stats: { hp: 12, dmg: 2, speed: 2.6, atkCd: 3.4, windup: 1.1, fly: true, hover: 0.8 } });

  // ── Boss ──
  const bdef = { ad: 'Ay Tavşanı', base: 'aytavsan', stats: { r: 1.5, height: 3.4, hp: 300 },
    lines: { giris: 'b06_bekci_giris', bitti: 'b06_bekci_bitti', yarim: 'b06_bekci_yarim' },
    bossKit: { own: true, add: 'yildizPonpon', at: [0.66], n: [2], col: '#ffd27a', roar: 1.5 },
    model: viaBase('aytavsan', bekciPost) };
  HUYSUZ.boss('mabetBekcisi', bdef);
  HUYSUZ.zone('mabet', { enemies: { yildizPonpon: 3, isikYildizcik: 2, uykuTascik: 2, runTascik: 2, suzulenYildizcik: 1.5 },
    elites: ['yildizPonpon'], boss: 'mabetBekcisi' });

  // ════════════════ Yer işaretleri (havuz): daire, koni, kare, halka — kalın kenar + soluk dolgu ════════════════
  const MK = { pool: [], geo: null };
  function mkGeo() {
    if (MK.geo) return MK.geo;
    const sq = new THREE.Shape(); sq.moveTo(-1, -1); sq.lineTo(1, -1); sq.lineTo(1, 1); sq.lineTo(-1, 1); sq.lineTo(-1, -1);
    const h = new THREE.Path(); h.moveTo(-0.84, -0.84); h.lineTo(-0.84, 0.84); h.lineTo(0.84, 0.84); h.lineTo(0.84, -0.84); h.lineTo(-0.84, -0.84); sq.holes.push(h);
    MK.geo = {
      circ: new THREE.CircleGeometry(1, 40).rotateX(-PI / 2), ring: new THREE.RingGeometry(0.86, 1, 56).rotateX(-PI / 2),
      sq: new THREE.PlaneGeometry(2, 2).rotateX(-PI / 2), sqE: new THREE.ShapeGeometry(sq).rotateX(-PI / 2),
      cone: new THREE.CircleGeometry(1, 24, -PI / 2 - 0.5, 1.0).rotateX(-PI / 2),
    };
    for (const k in MK.geo) MK.geo[k].userData.keep = true;
    return MK.geo;
  }
  function mark(kind, x, z, r, col, dur, yaw) {   // kind: ring (daire) | sq (kare) | cone (koni, r = uzunluk)
    if (typeof scene === 'undefined') return null;
    const G = mkGeo();
    let m = MK.pool.find(q => !q.on && q.kind === kind);
    if (!m) {
      const mt = op => { const x2 = new THREE.MeshBasicMaterial({ transparent: true, opacity: op, depthWrite: false, fog: false, side: THREE.DoubleSide }); x2.userData.keep = true; return x2; };
      const g = new THREE.Group(), fill = new THREE.Mesh(kind === 'sq' ? G.sq : kind === 'cone' ? G.cone : G.circ, mt(0.26)), edge = new THREE.Mesh(kind === 'sq' ? G.sqE : kind === 'cone' ? G.cone : G.ring, mt(0.85));
      fill.renderOrder = 2; edge.renderOrder = 3; g.add(fill, edge); g.userData.keep = true;
      m = { kind, g, fill, edge, on: false, t: 0, d: 0 }; MK.pool.push(m);
      if (kind === 'cone') { edge.visible = false; }
    }
    if (!m.g.parent) scene.add(m.g);
    m.g.position.set(x, 0.08, z); m.g.rotation.set(0, yaw || 0, 0); m.g.scale.set(r, 1, r); m.g.visible = true;
    m.fill.material.color.set(col); m.edge.material.color.set(col); m.on = true; m.t = 0; m.d = dur; return m;
  }
  function markTick(dt) {
    for (const m of MK.pool) if (m.on) {
      m.t += dt;
      const pulse = 0.22 + 0.06 * Math.sin(m.t * 5);
      m.fill.material.opacity = m.kind === 'cone' ? 0.17 + 0.04 * Math.sin(m.t * 5) : pulse;
      if (m.t >= m.d) { m.on = false; m.g.visible = false; }
    }
  }
  const markOff = m => { if (m && m.on) m.d = Math.min(m.d, m.t + 0.2); };

  // ════════════════ Boss'un sahne nesneleri: baloncuk, dalga, rün taşı, yıldız ════════════════
  const W = { shots: [], rain: [], wave: null, stars: [], gm: null };
  function gm() {
    if (W.gm) return W.gm;
    const k = o => { o.userData.keep = true; return o; };
    W.gm = {
      sph: k(new THREE.SphereGeometry(1, 14, 10)), box: k(new THREE.BoxGeometry(1, 1, 1)), oct: k(new THREE.OctahedronGeometry(1, 0)),
      ringG: k(new THREE.RingGeometry(0.9, 1, 64).rotateX(-PI / 2)),
      bub: k(new THREE.MeshStandardMaterial({ color: 0xcfeeff, roughness: 0.1, transparent: true, opacity: 0.55, emissive: 0x58b8ff, emissiveIntensity: 0.5 })),
      rune: k(new THREE.MeshStandardMaterial({ color: 0xc9bfa8, roughness: 0.8, emissive: 0xff8a2a, emissiveIntensity: 0.55 })),
      star: k(new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd24a).multiplyScalar(1.3) })),
      wave: k(new THREE.MeshBasicMaterial({ color: 0x35e0d0, transparent: true, opacity: 0.75, depthWrite: false, fog: false, side: THREE.DoubleSide })),
    };
    return W.gm;
  }
  const dmgOf = (b, k) => b.dmg * k * (BOSSDAV.api.hard ? 1.25 : 1);
  const heroUp = () => { try { return (GAME.jump && GAME.jump.y) || 0; } catch (e) { return 0; } };
  function clearAll() {
    for (const s of W.shots) if (s.m && s.m.parent) s.m.parent.remove(s.m);
    for (const r of W.rain) { if (r.m && r.m.parent) r.m.parent.remove(r.m); markOff(r.mk); }
    for (const s of W.stars) { if (s.m && s.m.parent) s.m.parent.remove(s.m); markOff(s.mk); }
    if (W.wave && W.wave.m && W.wave.m.parent) W.wave.m.parent.remove(W.wave.m);
    W.shots.length = 0; W.rain.length = 0; W.stars.length = 0; W.wave = null;
    for (const m of MK.pool) { m.on = false; m.g.visible = false; }
  }
  function stepObjects(dt) {
    const A = BOSSDAV.api, P = A && A.P, b = typeof GAME !== 'undefined' ? GAME.boss : null;
    markTick(dt);
    if (!P) return;
    // baloncuklar (yavaş, hafif)
    for (let i = W.shots.length - 1; i >= 0; i--) {
      const s = W.shots[i]; s.t += dt; s.x += s.vx * dt; s.z += s.vz * dt; s.m.position.set(s.x, 0.8 + 0.1 * Math.sin(s.t * 4), s.z);
      if (!P.dead && hyp(P.pos.x - s.x, P.pos.z - s.z) < 0.7 && heroUp() < 1.2 && b && !b.dead) { try { A.hurtPlayer(dmgOf(b, 0.5), s.x, s.z, 0.3); } catch (e) { /* yok */ } s.t = 99; }
      if (s.t > 3.6 || !A.isFloor(s.x, s.z)) { A.burst('sparkle', s.x, 0.8, s.z, { color: '#cfeeff', count: 4 }); if (s.m.parent) s.m.parent.remove(s.m); W.shots.splice(i, 1); }
    }
    // rün yağmuru
    for (let i = W.rain.length - 1; i >= 0; i--) {
      const r = W.rain[i]; r.t += dt; const u = clamp(1 - (r.at - r.t) / 0.7, 0, 1);
      r.m.visible = u > 0; r.m.position.set(r.x, 0.5 + 9 * (1 - u * u), r.z); r.m.rotation.y += dt * 3;
      if (r.t >= r.at) {
        A.burst('dust', r.x, 0.2, r.z, { count: 8, scale: 1.2 }); A.burst('sparkle', r.x, 0.5, r.z, { color: '#ffb060', count: 6 }); A.sfx('slam', { x: r.x, z: r.z, vol: 0.4, pitch: 1.3 });
        if (!P.dead && b && !b.dead && Math.abs(P.pos.x - r.x) < r.h + 0.25 && Math.abs(P.pos.z - r.z) < r.h + 0.25) { try { A.hurtPlayer(dmgOf(b, 0.6), r.x, r.z, 0.4); } catch (e) { /* yok */ } }
        markOff(r.mk); if (r.m.parent) r.m.parent.remove(r.m); W.rain.splice(i, 1);
      }
    }
    // kulak dalgası
    const w = W.wave;
    if (w) {
      w.t += dt; const R = 1.6 + w.t * 4.2; w.m.scale.set(R, 1, R); w.m.position.set(w.x, 0.12, w.z); w.m.material.opacity = 0.8 * (1 - w.t / 3.1);
      const d = hyp(P.pos.x - w.x, P.pos.z - w.z);
      if (!w.hit && !P.dead && Math.abs(d - R) < 0.7 && heroUp() < 0.8 && b && !b.dead) { w.hit = true; try { A.hurtPlayer(dmgOf(b, 0.5), w.x, w.z, 0.5); } catch (e) { /* yok */ } }
      if (!w.hit && !P.dead && Math.abs(d - R) < 0.7 && heroUp() >= 0.8 && !w.over) { w.over = true; A.burst('sparkle', P.pos.x, 0.6, P.pos.z, { color: '#aef8f0', count: 6 }); }
      if (w.t > 3.1) { if (w.m.parent) w.m.parent.remove(w.m); W.wave = null; }
    }
    // yıldızlar (toplama oyunu)
    for (const s of W.stars) if (!s.done) {
      s.t += dt; s.m.position.y = 0.95 + 0.14 * Math.sin(s.t * 3 + s.x); s.m.rotation.y += dt * 1.5;
      if (!P.dead && hyp(P.pos.x - s.x, P.pos.z - s.z) < 1.3) { s.done = true; s.m.visible = false; markOff(s.mk); A.burst('sparkle', s.x, 0.9, s.z, { color: '#ffe27a', count: 12 }); A.sfx('heart', { x: s.x, z: s.z }); }
    }
  }
  // ════════════════ Boss hamleleri ════════════════
  const say = (k, prio = 2) => { const A = BOSSDAV.api; if (A && A.hasLine(k)) A.say(k, prio); };
  function warn(S, key) {
    const A = BOSSDAV.api; if (!key || !A || !A.hasLine(key)) return;
    const said = S.said || (S.said = {}); if (said[key]) return; said[key] = true;
    try { A.say(key, 3, { interrupt: true }); } catch (e) { /* yok */ }
  }
  const faceTo = (b, x, z, k, dt) => { b.face = dampAngle(b.face, Math.atan2(x - b.x, z - b.z), k, dt); };
  function spots(b, cx, cz, n, rmin, rmax, gap) {
    const A = BOSSDAV.api, out = [], rm = A.bossRoom();
    for (let t = 0; t < n * 16 && out.length < n; t++) {
      const a = rnd(0, TAU), r = out.length === 0 && t < 4 ? 0 : rnd(rmin, rmax), x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
      if (!A.isFloor(x, z) || (rm && !A.inRoom(rm, x, z, 0.9))) continue;
      if (out.some(p => hyp(p.x - x, p.z - z) < gap) || hyp(x - b.x, z - b.z) < b.r + 1.0) continue;
      out.push({ x, z });
    }
    return out;
  }
  function jumpStep(b, S, t, J, A) {
    const st = b.st;
    if (t < J.c) { st.air = 0; st.land = 0; return; }
    if (t < J.l) {
      const u = (t - J.c) / (J.l - J.c), k = u * u * (3 - 2 * u);
      b.x = J.x0 + (J.x1 - J.x0) * k; b.z = J.z0 + (J.z1 - J.z0) * k; b.y = 4 * J.h * u * (1 - u); st.air = u; st.land = 0;
      if (!J.up) { J.up = 1; A.sfx('bounce', { x: b.x, z: b.z, pitch: 0.5 }); }
      return;
    }
    st.air = 0;
    if (!J.down) {
      J.down = 1; b.y = 0; b.x = J.x1; b.z = J.z1; markOff(J.mk);
      A.bossRing(b, b.x, b.z, J.r, 0.5, 1.4, '#ffe08a', { r1: J.r * 0.9, dur: 0.3, width: 0.35 });
      A.burst('dust', b.x, 0.2, b.z, { count: 8, scale: 1.4 }); A.sfx('slam', { x: b.x, z: b.z, vol: 0.5, pitch: 0.8 }); A.shake(0.18);
    }
    st.land = Math.max(0, 1 - (t - J.l) / 0.35);
  }
  const MOVES = {
    // Taş Zıplama: sarı daire (düşeceği yer) ~2 sn önce belli
    tas(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; const sp = A.approachSpot(b, 7.5);
        S.J = { c: 0.8, l: 2.0, h: 2.4, r: 2.4, x0: b.x, z0: b.z, x1: sp.x, z1: sp.z, up: 0, down: 0 };
        S.J.mk = mark('ring', sp.x, sp.z, 2.4, '#ffd23a', 2.6); warn(S, 'b06_ziplayis');
      }
      if (t < 0.8) faceTo(b, S.J.x1, S.J.z1, 5, dt);
      jumpStep(b, S, t, S.J, A);
      if (t >= b.phD) { b.y = 0; b.st.air = 0; b.st.land = 0; S.n++; A.bossEnd(b, 1.5, 1.2); }
    },
    // Baloncuk Yelpazesi: mavi koni, sonra 3 yavaş baloncuk
    yelpaze(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; S.yaw = Math.atan2(A.P.pos.x - b.x, A.P.pos.z - b.z); b.face = S.yaw;
        S.mk = mark('cone', b.x, b.z, 8, '#4fb4ff', 2.3, S.yaw); warn(S, 'b06_baloncuk');
      }
      if (b.did === 1 && t >= 2.0) {
        b.did = 2; markOff(S.mk); const m0 = A.muzzle(b), G = gm();
        for (const da of [-0.4, 0, 0.4]) {
          const a = S.yaw + da, mesh = new THREE.Mesh(G.sph, G.bub); mesh.scale.setScalar(0.36); scene.add(mesh);
          W.shots.push({ x: m0.x, z: m0.z, vx: Math.sin(a) * 3.2, vz: Math.cos(a) * 3.2, t: 0, m: mesh });
        }
        A.sfx('pop', { x: b.x, z: b.z });
      }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.4, 1.2); }
    },
    // Kulak Dalgası: turkuaz halka genişler; alçak yerçekimiyle üstünden zıpla
    dalga(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) { b.did = 1; S.mk = mark('ring', b.x, b.z, 3.4, '#35e0d0', 1.8); warn(S, 'b06_dalga'); }
      if (b.did === 1 && t >= 1.7) {
        b.did = 2; markOff(S.mk); const G = gm(), mesh = new THREE.Mesh(G.ringG, G.wave.clone()); mesh.material.userData.keep = false; scene.add(mesh);
        W.wave = { x: b.x, z: b.z, t: 0, m: mesh, hit: false, over: false }; A.sfx('whoosh', { x: b.x, z: b.z, pitch: 0.7 });
      }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.4, 1.2); }
    },
    // Rün Yağmuru: üç turuncu kare, sonra rün taşları düşer
    yagmur(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; const G = gm(), pts = spots(b, A.P.pos.x, A.P.pos.z, 3, 2.0, 5.0, 3.0);
        for (const p of pts) {
          const mesh = new THREE.Mesh(G.box, G.rune); mesh.scale.set(0.8, 0.8, 0.8); mesh.visible = false; scene.add(mesh);
          W.rain.push({ x: p.x, z: p.z, h: 1.3, at: 2.3, t: 0, m: mesh, mk: mark('sq', p.x, p.z, 1.3, '#ff8a22', 2.6) });
        }
        warn(S, 'b06_run_yagmuru');
      }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.4, 1.2); }
    },
    // Yıldız Toplama: 3 altın yıldız; toplayınca Bekçi kıkırdar (büyük vurma fırsatı)
    yildiz(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      faceTo(b, A.P.pos.x, A.P.pos.z, 1.5, dt);
      if (b.did === 0) {
        b.did = 1; const G = gm(), pts = spots(b, b.x, b.z, 3, 3.2, 6.0, 3.2);
        for (const p of pts) { const mesh = new THREE.Mesh(G.oct, G.star); mesh.scale.set(0.34, 0.5, 0.34); mesh.position.set(p.x, 0.95, p.z); scene.add(mesh); W.stars.push({ x: p.x, z: p.z, t: 0, m: mesh, done: false, mk: mark('ring', p.x, p.z, 0.9, '#ffd24a', 24) }); }
        warn(S, 'b06_yildiz_oyun');
      }
      if (b.did === 1 && W.stars.length && W.stars.every(s => s.done)) {
        b.did = 2; W.stars.length = 0; A.bossPhase(b, 'kikir5', 5.0); return;
      }
      if (t >= b.phD) { for (const s of W.stars) { s.m.visible = false; markOff(s.mk); } W.stars.length = 0; A.bossEnd(b, 1.0, 1.0); }
    },
    kikir5(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      b.st.move = 0; faceTo(b, A.P.pos.x, A.P.pos.z, 1.5, dt);
      if ((S.zT = (S.zT || 0) - dt) <= 0) { S.zT = 0.7; A.burst('heart', b.x, b.height * 0.8, b.z, { count: 2 }); A.sfx('heart', { x: b.x, z: b.z, vol: 0.4 }); }
      if (t >= b.phD) A.bossEnd(b, 1.0, 1.0);
    },
  };
  if (typeof BOSSDAV !== 'undefined' && BOSSDAV && BOSSDAV.register) {
    BOSSDAV.register('mabetBekcisi', {
      hpK: 2.0, keep: 5.5, roarD: 1.8, isaretKendi: true, asamalar: [0.66, 0.33], kikirdama: 1.5,
      choose(b, S) {
        const A = BOSSDAV.api;
        S.stage = S.stage || 1; S.n = S.n || 0;
        if (!S.starsDone && b.hp / b.maxHp <= 0.62) { S.starsDone = true; A.bossPhase(b, 'yildiz', 24); return; }
        if (S.stage >= 2 && !S.ponSaid) { S.ponSaid = true; say('b06_ponpon2', 2); }
        let opts;
        if (S.stage <= 1) opts = [['tas', 0.5], ['yelpaze', 0.5]];
        else if (S.stage === 2) opts = [['dalga', 0.4], ['tas', 0.3], ['yelpaze', 0.3]];
        else opts = [['yagmur', 0.35], ['dalga', 0.25], ['tas', 0.2], ['yelpaze', 0.2]];
        const ph = A.pickPhase(b, opts);
        A.bossPhase(b, ph, { tas: 3.2, yelpaze: 3.2, dalga: 4.6, yagmur: 3.8 }[ph]);
      },
      moves: MOVES, hints: {},
      hit(b, amount) { if (b.ph === 'kikir5') return Math.round(amount * 1.5); return amount; },
      update(dt) { stepObjects(dt); },
    });
  }
  function hook() {
    if (typeof GAME === 'undefined' || !GAME || !GAME.on) { setTimeout(hook, 250); return; }
    GAME.on('zone', () => clearAll());
    GAME.on('boss', e => { if (e && !e.on) clearAll(); });
  }
  hook();
  return { tint, clearAll, mark };
})();
