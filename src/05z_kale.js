/* ── 9. bölüm: Ejderhanın Kalesi — huysuzlar + boss Huysuz Ejderha (Pırıl'ın annesi) (Feza ve Pırıl: Büyük Fener) ──
   Sahibi: B910. Cümleler 02l_kale.js (b09_...). Genel ad: HZ_KALE (yer işareti yardımcısı: HZ_KALE.mark / markTick / markOff — 05z_fener.js de kullanır).
     oyuncakAsker  Oyuncak Asker      bez-sünger mızraklı, huysuz suratlı ama kızgın değil           base asker   'yakin'
     pelusSovalye  Pofuduk Pelüş Şövalye  yastık kalkanlı küçük asker                                 base asker   'yakin'
     kipirtiAtescik Kıpırtı Ateşçik   yumurtayı ısıtmaya çalışan ateş topu (vurulunca kalp)           base atescik 'uzak'
     resimHayalet  Resim Hayaleti     mavi, gülümseyen, süzülür                                       base hayalet 'uzak'
     kayaDevi      Kaya Devi          yavaş golem, yerde sarı daire                                   base golem   'agir'
     huysuzEjderha Huysuz Ejderha     boss: sisin içinde soluk gri-inci, yorgun-şaşkın. Pofuduk Pati (sarı daire), Pembe Kabarcıklar,
                   Arama Işığı (mavi çizgiler), Yorgun Kuyruk (yeşil şerit), Dostluk Kalpleri (3 pembe kalp → ejderha oturur).
                   %12'de TANIMA: kabuk parlaması → (≥1 sn) → gözler açılır → gri-inciden mora (tek yumuşak hareket) → "Anne?" → kalp tozu.
   Bir an bir saldırı; kalp/kıkırdama sırasında saldırı yok. */
const HZ_KALE = (() => {
  'use strict';
  const HAS = typeof HUYSUZ !== 'undefined' && HUYSUZ && HUYSUZ.type;
  if (!HAS) return {};
  const EM = typeof EMODEL !== 'undefined' && EMODEL ? EMODEL : null;
  const PI = Math.PI, TAU = PI * 2, hyp = Math.hypot;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const tint = (r, h, s, l) => { try { if (typeof HZ_MABET !== 'undefined' && HZ_MABET.tint) HZ_MABET.tint(r, h, s, l); } catch (e) { /* yok */ } };
  const viaBase = (base, post) => o => { const m = EM && EM.build ? EM.build.call(EM, base, o || {}) : null; if (m && m.root && post) post(m.root, m); return m; };

  // ── Huysuz tipleri ──
  HUYSUZ.type('oyuncakAsker', { ad: 'Oyuncak Asker', base: 'asker', saldiri: 'yakin', stats: { hp: 30, dmg: 3, speed: 1.9, atkCd: 2.6, windup: 1.0 },
    model: viaBase('asker', r => tint(r, 0.02, 0.5, 1.0)), ilkSoz: 'b09_oyuncak_asker' });
  HUYSUZ.type('pelusSovalye', { ad: 'Pofuduk Pelüş Şövalye', base: 'asker', saldiri: 'yakin', boyut: 0.8, stats: { hp: 28, dmg: 2, speed: 1.6, atkCd: 2.8, windup: 1.1 },
    model: viaBase('asker', r => tint(r, 0.07, 0.35, 1.12)), ilkSoz: 'b09_pofuduk' });
  HUYSUZ.type('kipirtiAtescik', { ad: 'Kıpırtı Ateşçik', base: 'atescik', saldiri: 'uzak', stats: { hp: 18, dmg: 2, speed: 1.8, atkCd: 3.2, windup: 1.0 }, ilkSoz: 'b09_ates_cik' });
  HUYSUZ.type('resimHayalet', { ad: 'Resim Hayaleti', base: 'hayalet', saldiri: 'uzak', stats: { hp: 20, dmg: 2, speed: 1.7, atkCd: 3.2, windup: 1.0 },
    model: viaBase('hayalet', r => tint(r, 0.58, 0.3, 1.05)), ilkSoz: 'b09_hayalet' });
  HUYSUZ.type('kayaDevi', { ad: 'Kaya Devi', base: 'golem', saldiri: 'agir', stats: { hp: 70, dmg: 4, speed: 1.1, atkCd: 3.2, windup: 1.4 } });

  // ── Boss: Huysuz Ejderha ──
  let ANNE = null;   // son kurulan anne ejderha (renk geçişi için)
  function ejderhaModel(o) {
    if (typeof EJDERHA === 'undefined' || !EJDERHA || !EJDERHA.anne) return viaBase('ejderha')(o);
    const a = EJDERHA.anne({ renk: 0, durum: 'saskin' }); ANNE = a;
    const m = a.model; m.root = a.root; m.anneApi = a;
    // BOSSC: oyun kamerasında daha görkemli (görsel 1.3x, çarpışma aynı) + inci parıltısı (pembe-nane-lila yavaş kayar; mora dönünce söner)
    a.root.scale.setScalar(1.3);
    let pelus = null; a.root.traverse(o => { if (o.isMesh && o.name === 'Piril pelus') pelus = o; });
    let sh = Math.random() * 6; const anim0 = m.anim;
    m.anim = function (dt, st) {
      if (anim0) anim0.apply(this, arguments);
      sh += dt; if (!pelus || !pelus.material || !pelus.material.emissive) return;
      const k = 1 - clamp(a.renkDegeri || 0, 0, 1);
      pelus.material.emissive.setHSL(0.5 + 0.28 * Math.sin(sh * 0.5) + 0.12 * Math.sin(sh * 0.23), 0.55, 0.55); pelus.material.emissiveIntensity = 0.13 * k;
    };
    const d0 = m.dispose; m.dispose = function () { try { if (d0) d0.call(m); } catch (e) { /* yok */ } if (a.root.parent) a.root.parent.remove(a.root); };
    return m;
  }
  HUYSUZ.boss('huysuzEjderha', { ad: 'Huysuz Ejderha', base: 'ejderha', stats: { r: 2.2, height: 4.6, hp: 620, dmg: 11 },
    lines: { giris: 'b09_boss_giris', bitti: 'b09_boss_bitti', yarim: 'b09_boss_yarim' },
    bossKit: { own: true, col: '#ffd0e4', roar: 0, add: null, at: [], n: [], summonAt: 9, bonus: null }, model: ejderhaModel });
  HUYSUZ.zone('kale', { enemies: { oyuncakAsker: 3, pelusSovalye: 2, kipirtiAtescik: 2, resimHayalet: 2, kayaDevi: 1 }, elites: ['oyuncakAsker'], boss: 'huysuzEjderha' });

  // ════════════════ Yer işaretleri (havuz): daire, kare/şerit, koni ════════════════
  const MK = { pool: [], geo: null };
  function mkGeo() {
    if (MK.geo) return MK.geo;
    const sq = new THREE.Shape(); sq.moveTo(-1, -1); sq.lineTo(1, -1); sq.lineTo(1, 1); sq.lineTo(-1, 1); sq.lineTo(-1, -1);
    const h = new THREE.Path(); h.moveTo(-0.8, -0.9); h.lineTo(-0.8, 0.9); h.lineTo(0.8, 0.9); h.lineTo(0.8, -0.9); h.lineTo(-0.8, -0.9); sq.holes.push(h);
    MK.geo = { circ: new THREE.CircleGeometry(1, 40).rotateX(-PI / 2), ring: new THREE.RingGeometry(0.86, 1, 56).rotateX(-PI / 2),
      sq: new THREE.PlaneGeometry(2, 2).rotateX(-PI / 2), sqE: new THREE.ShapeGeometry(sq).rotateX(-PI / 2), cone: new THREE.CircleGeometry(1, 24, -PI / 2 - 0.5, 1.0).rotateX(-PI / 2) };
    for (const k in MK.geo) MK.geo[k].userData.keep = true;
    return MK.geo;
  }
  // kind: ring | sq (rz verilirse dikdörtgen: x yarı-genişlik r, z yarı-boy rz) | cone
  function mark(kind, x, z, r, col, dur, yaw, rz) {
    if (typeof scene === 'undefined') return null;
    const G = mkGeo(); let m = MK.pool.find(q => !q.on && q.kind === kind);
    if (!m) {
      const mt = op => { const x2 = new THREE.MeshBasicMaterial({ transparent: true, opacity: op, depthWrite: false, fog: false, side: THREE.DoubleSide }); x2.userData.keep = true; return x2; };
      const g = new THREE.Group(), fill = new THREE.Mesh(kind === 'sq' ? G.sq : kind === 'cone' ? G.cone : G.circ, mt(0.26)), edge = new THREE.Mesh(kind === 'sq' ? G.sqE : kind === 'cone' ? G.cone : G.ring, mt(0.85));
      fill.renderOrder = 2; edge.renderOrder = 3; g.add(fill, edge); g.userData.keep = true;
      m = { kind, g, fill, edge, on: false, t: 0, d: 0 }; MK.pool.push(m); if (kind === 'cone') edge.visible = false;
    }
    if (!m.g.parent) scene.add(m.g);
    m.g.position.set(x, 0.08, z); m.g.rotation.set(0, yaw || 0, 0); m.g.scale.set(r, 1, rz || r); m.g.visible = true;
    m.fill.material.color.set(col); m.edge.material.color.set(col); m.on = true; m.t = 0; m.d = dur; return m;
  }
  function markTick(dt) {
    for (const m of MK.pool) if (m.on) {
      m.t += dt; m.fill.material.opacity = m.kind === 'cone' ? 0.34 : 0.22 + 0.06 * Math.sin(m.t * 5);
      if (m.t >= m.d) { m.on = false; m.g.visible = false; }
    }
  }
  const markOff = m => { if (m && m.on) m.d = Math.min(m.d, m.t + 0.2); };
  const markClear = () => { for (const m of MK.pool) { m.on = false; m.g.visible = false; } };

  // ════════════════ Boss sahne nesneleri ════════════════
  const W = { shots: [], strips: [], hearts: [], kids: [], gm: null, rec: null, kalpDone: 0 };
  function gm() {
    if (W.gm) return W.gm;
    const k = o => { o.userData.keep = true; return o; };
    const heartShape = new THREE.Shape(); heartShape.moveTo(0, -0.5); heartShape.bezierCurveTo(-0.9, 0.1, -0.5, 0.8, 0, 0.35); heartShape.bezierCurveTo(0.5, 0.8, 0.9, 0.1, 0, -0.5);
    W.gm = { sph: k(new THREE.SphereGeometry(1, 14, 10)), heart: k(new THREE.ExtrudeGeometry(heartShape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 })),
      bub: k(new THREE.MeshStandardMaterial({ color: 0xffd6ea, roughness: 0.15, transparent: true, opacity: 0.6, emissive: 0xff9ac4, emissiveIntensity: 0.45 })),
      hrt: k(new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff7fb4).multiplyScalar(1.2) })) };
    return W.gm;
  }
  const dmgOf = (b, k) => b.dmg * k * (BOSSDAV.api.hard ? 1.25 : 1);
  const heroUp = () => { try { return (GAME.jump && GAME.jump.y) || 0; } catch (e) { return 0; } };
  const say = (k, prio = 2) => { const A = BOSSDAV.api; if (A && A.hasLine(k)) A.say(k, prio); };
  function clearAll() {
    for (const s of W.shots) if (s.m && s.m.parent) s.m.parent.remove(s.m);
    for (const h of W.hearts) { if (h.m && h.m.parent) h.m.parent.remove(h.m); markOff(h.mk); }
    for (const s of W.strips) markOff(s.mk);
    for (const k of W.kids) { try { k.d.dispose(); } catch (e) { /* yok */ } }
    W.shots.length = 0; W.hearts.length = 0; W.strips.length = 0; W.kids.length = 0; W.rec = null; W.fin = false; W.kalpDone = 0; markClear();
  }
  const inRect = (px, pz, x, z, yaw, hw, hl) => { const dx = px - x, dz = pz - z, c = Math.cos(yaw), s = Math.sin(yaw); const lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) < hw && Math.abs(lz) < hl; };
  // yaw: yön (sin(yaw), cos(yaw)); dikdörtgenin uzun ekseni bu yönde, merkezi (x,z)
  function rectHit(px, pz, x, z, yaw, hw, hl) { const dx = px - x, dz = pz - z, fx = Math.sin(yaw), fz = Math.cos(yaw); const along = dx * fx + dz * fz, side = dx * fz - dz * fx; return Math.abs(along) < hl && Math.abs(side) < hw; }
  void inRect;

  // minik ejderha kardeşler: yumuşak süs, en çok 4, Feza'nın çevresinde oynar (itme yok)
  function kidsSpawn(b) {
    if (typeof EJDERHA === 'undefined' || !EJDERHA.yavru || W.kids.length >= 4) return;
    for (let i = W.kids.length; i < 4; i++) {
      try {
        const d = EJDERHA.yavru({}); d.root.scale.setScalar(0.8); scene.add(d.root);
        W.kids.push({ d, a: i * TAU / 4, r: 3.5 + i * 0.5, x: b.x, z: b.z + 3, mv: 0 });
      } catch (e) { /* yok */ }
    }
    say('b09_yumurta_cik', 2);
  }
  function kidsTick(dt, b, A) {
    const P = A.P;
    for (const k of W.kids) {
      k.a += dt * (0.4 + 0.1 * (k.r % 1)); const tx = P.pos.x + Math.sin(k.a) * k.r, tz = P.pos.z + Math.cos(k.a) * k.r;
      const dx = tx - k.x, dz = tz - k.z, d = hyp(dx, dz), st = Math.min(d, 2.2 * dt);
      const nx = k.x + (dx / (d || 1)) * st, nz = k.z + (dz / (d || 1)) * st;
      if (A.isFloor(nx, nz)) { k.x = nx; k.z = nz; }
      k.mv = d > 0.3 ? 1 : 0; k.d.root.position.set(k.x, 0, k.z); k.d.root.rotation.y = Math.atan2(dx, dz);
      try { k.d.update(dt, k.mv > 0, false); } catch (e) { /* yok */ }
    }
  }

  // ── tanıma: sahne ──
  function tanimaBasla(b) {
    if (W.rec) return;
    const A = BOSSDAV.api, G = typeof GAME !== 'undefined' ? GAME : null;
    W.rec = { t: 0, step: 0, color: 0, tween: null, b, done: false };
    const kl = G && G.L && G.L.kl, shell = kl && kl.shell;
    const sx = shell ? shell.x : b.x, sz = shell ? shell.z : b.z + 3;
    let done = false;
    const fin = () => {
      if (done) return; done = true; W.rec = null; W.fin = true;
      if (ANNE) ANNE.renk(1);
      try { if (typeof PIRIL_GUC !== 'undefined' && PIRIL_GUC.gucVer) PIRIL_GUC.gucVer('kalptozu'); } catch (e) { /* yok */ }
      b.hp = 1; try { G.damage(b, 999, { kind: 'team', force: true }); } catch (e) { /* yok */ }
    };
    const tele = (x, z) => { try { G.teleport(x, z); } catch (e) { /* yok */ } };
    const adim = [
      { sure: 2.6, bak: { x: sx, z: sz, y: 0.8 }, zoom: 1.5, fn: () => { tele(clamp((sx + b.x) / 2, b.x - 5, b.x + 5), b.z + 9.5);  say('b09_kabuk_yer', 3); if (kl && kl.shellGlow) kl.shellGlow(1.6); } },        // 1) kabuk pembe-altın parlar
      { sure: 2.2, bak: { x: b.x, z: b.z, y: 3.0 }, zoom: 1.3, fn: () => { if (ANNE) ANNE.durum('tanima'); } },                                       // 2) ≥1 sn sessizlik sonra gözler kocaman (yalnız bu)
      { sure: 3.4, bak: { x: b.x, z: b.z, y: 3.0 }, zoom: 1.3, fn: () => { if (W.rec) W.rec.tween = { t: 0, sn: 3.0 }; } },                                      // 3) gri-inciden mora, tek yumuşak hareket
      { sure: 3.8, bak: { x: (b.x + sx) / 2, z: (b.z + sz) / 2, y: 2.0 }, zoom: 1.2, soz: 'b09_kabuk_p', fn: () => { burst('hearts', b.x, 3.2, b.z, 5); } },  // 4) "Anne?"
      { sure: 3.6, bak: { x: b.x, z: b.z, y: 3.0 }, zoom: 1.3, soz: 'b09_tanima_anne' },
      { sure: 3.0, bak: { x: b.x, z: b.z, y: 2.5 }, zoom: 1.2, soz: 'b09_kalptozu', fn: () => { burst('hearts', b.x, 3, b.z, 8); } },
    ];
    const burst = (k, x, y, z, n) => { try { A.burst(k, x, y, z, { count: n || 6 }); } catch (e) { /* yok */ } };
    if (G && G.sinematik && G.sinematik.oyna) G.sinematik.oyna({ adimlar: adim, atlanabilir: true, bitti: () => fin() });
    else setTimeout(fin, 12000);
  }

  // ════════════════ stepObjects ════════════════
  function stepObjects(dt) {
    const A = BOSSDAV.api, P = A && A.P, b = typeof GAME !== 'undefined' ? GAME.boss : null;
    markTick(dt);
    if (!P) return;
    // renk geçişi (tanıma 3. adım)
    const r = W.rec;
    if (r && r.tween && ANNE) { r.tween.t += dt; const u = clamp(r.tween.t / r.tween.sn, 0, 1), k = Math.round(u * u * (3 - 2 * u) * 25) / 25; if (k !== r.color) { r.color = k; ANNE.renk(k); } if (u >= 1) r.tween = null; }
    if (b && !b.dead && W.kids.length) kidsTick(dt, b, A);
    if (!b || b.dead) return;
    // kabarcıklar
    for (let i = W.shots.length - 1; i >= 0; i--) {
      const s = W.shots[i]; s.t += dt; s.x += s.vx * dt; s.z += s.vz * dt; s.m.position.set(s.x, 0.9 + 0.1 * Math.sin(s.t * 4), s.z);
      if (!P.dead && hyp(P.pos.x - s.x, P.pos.z - s.z) < 0.95 && heroUp() < 1.2) { try { A.hurtPlayer(dmgOf(b, 0.95), s.x, s.z, 0.3); } catch (e) { /* yok */ } s.t = 99; }
      if (s.t > 4.2 || !A.isFloor(s.x, s.z)) { A.burst('sparkle', s.x, 0.9, s.z, { color: '#ffd6ea', count: 4 }); if (s.m.parent) s.m.parent.remove(s.m); W.shots.splice(i, 1); }
    }
    // mavi çizgiler / yeşil şerit: işaret 2 sn, sonra yavaş tarama (≤2 vuruş)
    for (let i = W.strips.length - 1; i >= 0; i--) {
      const s = W.strips[i]; s.t += dt;
      if (s.t > s.warn) {
        const u = clamp((s.t - s.warn) / s.sweep, 0, 1), off = s.off * (u - 0.5);
        if (s.mk) { s.mk.g.position.x = s.x + Math.cos(s.yaw) * off; s.mk.g.position.z = s.z - Math.sin(s.yaw) * off; s.mk.d = Math.max(s.mk.d, s.mk.t + 0.5); }
        const cx = s.x + Math.cos(s.yaw) * off, cz = s.z - Math.sin(s.yaw) * off;
        if (!s.hit && !P.dead && heroUp() < (s.over || 0.9) && rectHit(P.pos.x, P.pos.z, cx, cz, s.yaw, s.hw, s.hl)) {
          s.hit = true; try { A.hurtPlayer(dmgOf(b, 0.95), cx, cz, 0.4); } catch (e) { /* yok */ }
        }
        if (u >= 1) { markOff(s.mk); W.strips.splice(i, 1); }
      }
    }
    // kalpler (toplama)
    for (const h of W.hearts) if (!h.done) {
      h.t += dt; h.m.position.y = 1.0 + 0.15 * Math.sin(h.t * 3 + h.x); h.m.rotation.y += dt * 1.6;
      if (!P.dead && hyp(P.pos.x - h.x, P.pos.z - h.z) < 1.3) { h.done = true; h.m.visible = false; markOff(h.mk); A.burst('hearts', h.x, 1.1, h.z, { count: 4 }); A.sfx('heart', { x: h.x, z: h.z }); }
    }
  }
  const faceTo = (b, x, z, k, dt) => { b.face = dampAngle(b.face, Math.atan2(x - b.x, z - b.z), k, dt); };
  function warn(S, key) {
    const A = BOSSDAV.api; if (!key || !A || !A.hasLine(key)) return;
    const said = S.said || (S.said = {}); if (said[key]) return; said[key] = true;
    try { A.say(key, 3, { interrupt: true }); } catch (e) { /* yok */ }
  }
  function spots(b, cx, cz, n, rmin, rmax, gap) {
    const A = BOSSDAV.api, out = [], rm = A.bossRoom();
    for (let t = 0; t < n * 16 && out.length < n; t++) {
      const a = rnd(0, TAU), r = rnd(rmin, rmax), x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
      if (!A.isFloor(x, z) || (rm && !A.inRoom(rm, x, z, 0.9))) continue;
      if (out.some(p => hyp(p.x - x, p.z - z) < gap) || hyp(x - b.x, z - b.z) < b.r + 1.0) continue;
      out.push({ x, z });
    }
    return out;
  }
  const MOVES = {
    // Pofuduk Pati: sarı daire (≥2 sn), sonra yumuşak yere basış
    pati(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; const pp = A.P.pos, sp = hyp(pp.x - b.x, pp.z - b.z) < 9.5 && A.isFloor(pp.x, pp.z) ? { x: pp.x, z: pp.z } : A.approachSpot(b, 6.5); S.sp = sp;   // TELEG/B9: daire Feza'nın yakın durduğu yeri de kapsar (2,2 sn uyarı)
        S.mk = mark('ring', sp.x, sp.z, 2.6, '#ffd23a', 2.8); warn(S, 'b09_uyari_sari');
      }
      if (t < 2.0) faceTo(b, S.sp.x, S.sp.z, 4, dt);
      if (b.did === 1 && t >= 2.2) {
        b.did = 2; markOff(S.mk); A.bossRing(b, S.sp.x, S.sp.z, 2.6, 0.95, 1.4, '#ffe08a', { r1: 2.4, dur: 0.3, width: 0.35 });
        A.burst('dust', S.sp.x, 0.2, S.sp.z, { count: 8, scale: 1.4 }); A.sfx('slam', { x: S.sp.x, z: S.sp.z, vol: 0.45, pitch: 0.8 }); A.shake(0.14);
      }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.8, 1.4); }
    },
    // Pembe Kabarcıklar: yerde pembe koni, sonra 3 yavaş kabarcık (yakın mesafeyi de kapsar)
    pembe(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) { b.did = 1; S.yaw = Math.atan2(A.P.pos.x - b.x, A.P.pos.z - b.z); b.face = S.yaw; S.mk = mark('cone', b.x, b.z, 8, '#ff7fb4', 2.4, S.yaw); warn(S, 'b09_uyari_pembe'); }
      if (b.did === 1 && t >= 2.1) {
        b.did = 2; markOff(S.mk); const G = gm(), sx = b.x + Math.sin(S.yaw) * 1.1, sz = b.z + Math.cos(S.yaw) * 1.1;
        for (const da of [-0.38, 0, 0.38]) {
          const a = S.yaw + da, mesh = new THREE.Mesh(G.sph, G.bub); mesh.scale.setScalar(0.4); scene.add(mesh);
          W.shots.push({ x: sx, z: sz, vx: Math.sin(a) * 2.8, vz: Math.cos(a) * 2.8, t: 0, m: mesh });
        }
        A.sfx('pop', { x: b.x, z: b.z });
      }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.8, 1.4); }
    },
    // Arama Işığı: iki ince mavi çizgi (işaret ≥2 sn), sonra yavaş tarar (yakın duran Feza'nın üstünden de geçer)
    mavi(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; const yaw = Math.atan2(A.P.pos.x - b.x, A.P.pos.z - b.z); b.face = yaw; S.yaw = yaw;
        const slow = S.stage >= 3 ? 1.35 : 1;
        for (const sd of [-1.1, 1.1]) {
          const x = b.x + Math.cos(yaw) * sd + Math.sin(yaw) * 4.4, z = b.z - Math.sin(yaw) * sd + Math.cos(yaw) * 4.4;
          const mk = mark('sq', x, z, 0.42, '#4fa8ff', 5.4, yaw, 4.8);
          W.strips.push({ x, z, yaw, hw: 0.55, hl: 4.8, warn: 2.2, sweep: 2.6 * slow, off: -sd * 2.4, t: 0, mk, hit: false });
        }
        warn(S, 'b09_uyari_mavi');
      }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 1.8, 1.4); }
    },
    // Yorgun Kuyruk: yeşil şerit (≥2 sn), sonra kuyruk yavaş süpürür (yakın mesafeyi de kapsar)
    kuyruk(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; const yaw = Math.atan2(A.P.pos.x - b.x, A.P.pos.z - b.z); b.face = yaw;
        const x = b.x + Math.sin(yaw) * 3.8, z = b.z + Math.cos(yaw) * 3.8, mk = mark('sq', x, z, 0.95, '#5cd06a', 5.0, yaw, 4.6);
        W.strips.push({ x, z, yaw, hw: 1.05, hl: 4.6, warn: 2.3, sweep: 2.2, off: 3.2, t: 0, mk, hit: false, over: 0.8 }); warn(S, 'b09_uyari_yesil');
      }
      if (t >= b.phD) { S.n++; A.bossEnd(b, 2.0, 1.4); }
    },
    // Dostluk Kalpleri: 3 pembe kalp; üçü toplanınca ejderha oturur (vurma fırsatı)
    kalp(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      b.st.move = 0; faceTo(b, A.P.pos.x, A.P.pos.z, 1.5, dt);
      if (b.did === 0) {
        b.did = 1; const G = gm(), pts = spots(b, b.x, b.z, 3, 3.6, 7.0, 3.4);
        for (const p of pts) {
          const mesh = new THREE.Mesh(G.heart, G.hrt); mesh.scale.set(0.8, 0.8, 0.8); mesh.position.set(p.x, 1.0, p.z); scene.add(mesh);
          W.hearts.push({ x: p.x, z: p.z, t: 0, m: mesh, done: false, mk: mark('ring', p.x, p.z, 1.0, '#ff7fb4', 14) });
        }
        warn(S, 'b09_kalp'); if (S.stage >= 2) kidsSpawn(b);
      }
      if (b.did === 1 && W.hearts.length && W.hearts.every(h => h.done)) { b.did = 2; for (const h of W.hearts) if (h.m.parent) h.m.parent.remove(h.m); W.hearts.length = 0; say('b09_kalp_tamam', 3); A.bossPhase(b, 'charmed', 4.5); return; }
      if (t >= b.phD) { for (const h of W.hearts) { h.m.visible = false; markOff(h.mk); } W.hearts.length = 0; A.bossEnd(b, 1.0, 1.0); }
    },
    bekle(b, S, dt) {   // BOSSC: önceki saldırının kabarcıkları/şeritleri bitsin; aynı anda iki büyük efekt olmasın
      const A = BOSSDAV.api; b.st.move = 0; faceTo(b, A.P.pos.x, A.P.pos.z, 1.5, dt);
      if (b.stT >= b.phD) A.bossEnd(b, 0.6, 0.6);
    },
    charmed(b, S, dt) {   // kalp tamam: ejderha oturur; kıkırdama; (tanımada da burada bekler)
      const A = BOSSDAV.api, t = b.stT;
      b.st.move = 0; faceTo(b, A.P.pos.x, A.P.pos.z, 1.2, dt);
      if (!S.rec && (S.zT = (S.zT || 0) - dt) <= 0) { S.zT = 0.8; A.burst('heart', b.x, b.height * 0.8, b.z, { count: 2 }); A.sfx('heart', { x: b.x, z: b.z, vol: 0.4 }); }
      if (!S.rec && t >= b.phD) A.bossEnd(b, 1.0, 1.0);
    },
  };
  if (typeof BOSSDAV !== 'undefined' && BOSSDAV && BOSSDAV.register) {
    BOSSDAV.register('huysuzEjderha', {
      hpK: 1.6, keep: 6, roarD: 0.1, isaretKendi: true, asamalar: [0.66, 0.33], kikirdama: 1.6,
      asamaSoz: { 2: 'b09_boss_asama2', 3: 'b09_boss_asama3' },
      choose(b, S) {
        const A = BOSSDAV.api;
        S.stage = S.stage || 1; S.n = S.n || 0;
        if (!S.rec && b.hp / b.maxHp <= 0.12) { S.rec = true; tanimaBasla(b); A.bossPhase(b, 'charmed', 90); return; }
        if (S.rec) { A.bossPhase(b, 'charmed', 90); return; }
        if (W.shots.length || W.strips.length || MK.pool.some(m => m.on)) { A.bossPhase(b, 'bekle', 0.8); return; }   // BOSSC: tek büyük efekt
        S.sinceKalp = (S.sinceKalp || 0) + 1;
        const kalpNeed = (S.stage === 1 && !S.k1 && b.hp / b.maxHp <= 0.8) ? 'k1' : (S.stage === 2 && !S.k2 && b.hp / b.maxHp <= 0.55) ? 'k2' : (S.stage === 3 && !S.k3 && b.hp / b.maxHp <= 0.3) ? 'k3' : null;
        if (kalpNeed) { S[kalpNeed] = true; A.bossPhase(b, 'kalp', 22); return; }
        let opts;
        if (S.stage <= 1) opts = [['pati', 0.5], ['pembe', 0.5]];
        else if (S.stage === 2) opts = [['mavi', 0.4], ['pati', 0.3], ['pembe', 0.3]];
        else opts = [['kuyruk', 0.4], ['pati', 0.2], ['pembe', 0.2], ['mavi', 0.2]];
        const ph = A.pickPhase(b, opts);
        A.bossPhase(b, ph, { pati: 3.8, pembe: 3.8, mavi: 5.8, kuyruk: 5.4 }[ph]);
      },
      moves: MOVES, hints: {},
      hit(b, amount) { if (W.fin) return amount; if (W.rec) return 0; if (b.hp - amount < b.maxHp * 0.11) amount = Math.max(0, Math.floor(b.hp - b.maxHp * 0.11)); if (b.ph === 'charmed') return Math.round(amount * 1.5); return amount; },
      update(dt) { stepObjects(dt); },
    });
  }
  function hook() {
    if (typeof GAME === 'undefined' || !GAME || !GAME.on) { setTimeout(hook, 250); return; }
    GAME.on('zone', () => clearAll());
    GAME.on('boss', e => { if (e && !e.on) clearAll(); });
  }
  hook();
  return { mark, markTick, markOff, markClear, rectHit, tint, clearAll, viaBase };
})();
