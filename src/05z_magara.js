/* ── Köstebek ve Salyangoz Mağarası: huysuzlar + boss (Feza ve Pırıl: Büyük Fener, Bölüm 5) ──
   Sahibi: B5 bölüm ajanı. Kaynak: feza-bilbo/huysuz Köstebek ve Salyangoz Mağarası (kostebek, salyangoz, yarasa, golem, kostebekusta modelleri
   yeniden kullanılır; hepsi neşelenince kalp saçıp kaybolur). Kristal (amber) salyangoz ve çakıl top, mevcut modellerin renk/boy farkıdır.
     madenciKostebek   Madenci Köstebek      toprağa dalar, "pıt" diye çıkar (base kostebek, 'kazici')
     baloncukSalyangoz Baloncuk Salyangozu   yavaş, yumuşak baloncuk üfler (base salyangoz, 'uzak')
     magaraYarasa      Mağara Yarasası       tavanda dolanan tombul, gülen yarasa (base yarasa, 'ucan')
     kayaDevi          Kaya Devi             uykulu, yavaş; yere basınca daire (base golem, 'agir'); alan başına en çok 1
     cakilTop          Çakıl Top             minik, gülen taş (base golem, küçük boy)
     kristalSalyangoz  Kristal Salyangoz     amber kabuklu, ışık baloncuğu üfler (base salyangoz, amber ton)
     ustaKostebek      Usta Köstebek         boss, 3 aşama: Toprak Topu (turuncu daire), Matkap Dalgası (sarı şerit 1-2-3), Kristal Parçalanma
                       (turkuaz halka), Saklambaç oyunu (altın halkalı delik). Her işaret ≥2,2 sn; cümle işaretle AYNI ANDA (BOSSDAV.tele/teleLine).
   Sesler: pr_ilk_<tip>, pr_ustaKostebek_*, b05_* (02l_magara.js). */
const HZ_MAGARA = (() => {
  'use strict';
  const PI = Math.PI;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const AT = 2.3;   // işaret süresi (≥2,2 sn)
  const HAS = typeof EMODEL !== 'undefined' && EMODEL && EMODEL.buildRaw;

  // ════════════════ Kayıt ════════════════
  const T = [
    ['madenciKostebek', 'Madenci Köstebek', 'kostebek', 'kazici', { eliteAd: 'Kocaman Madenci Köstebek', hp: 26, dmg: 5, speed: 3.0, atkCd: 2.0, windup: 0.8 }],
    ['baloncukSalyangoz', 'Baloncuk Salyangozu', 'salyangoz', 'uzak', { eliteAd: 'Kocaman Baloncuk Salyangozu', hp: 28, dmg: 3, speed: 1.1, atkCd: 3.2, windup: 0.9, shot: { kind: 'bubble', speed: 3.2, r: 0.35 } }],
    ['magaraYarasa', 'Mağara Yarasası', 'yarasa', 'ucan', { hp: 10, dmg: 3, speed: 3.4, atkCd: 2.2, windup: 0.7 }],
    ['kayaDevi', 'Kaya Devi', 'golem', 'agir', { eliteAd: 'Kocaman Kaya Devi', hp: 80, dmg: 8, speed: 1.2, atkCd: 3.4, windup: 1.2 }],
    ['cakilTop', 'Çakıl Top', 'golem', 'agir', { hp: 16, dmg: 3, speed: 2.6, atkCd: 2.6, windup: 0.9, r: 0.5, height: 0.9, slamR: 1.2 }, { boyut: 0.4 }],
    ['kristalSalyangoz', 'Kristal Salyangoz', 'salyangoz', 'uzak', { hp: 24, dmg: 2, speed: 1.1, atkCd: 3.4, windup: 1.0, shot: { kind: 'bubble', speed: 3.0, r: 0.35 } }, { tint: '#ffc24a' }],
  ];
  for (const [id, ad, base, saldiri, stats, ex] of T) {
    const def = Object.assign({ ad, base, saldiri, stats, ilkSoz: 'pr_ilk_' + id }, ex && ex.boyut ? { boyut: ex.boyut } : {});
    if (HAS && ex && ex.tint) {   // Kristal Salyangoz: amber ton (kabuğu kristal gibi parlak)
      def.model = o => { const m = EMODEL.buildRaw(base, o || {}); try { if (m.root) m.root.traverse(q => { if (q.isMesh && q.material && q.material.color && !q.userData.noTint) { q.material = q.material.clone(); q.material.color.lerp(new THREE.Color(ex.tint), 0.55); } }); } catch (e) { /* yok */ } return m; };
    }
    HUYSUZ.type(id, def);
  }

  // BOSSA: köşe renklerini zenginleştir (daha doygun/parlak); yalnız verilen ton aralığına dokunur
  function renkCanlandir(root, h0, h1, ks, kl, minS) {
    if (!root || !root.traverse) return;
    const c = new THREE.Color(), hsl = { h: 0, s: 0, l: 0 };
    root.traverse(o => {
      const g = o.geometry; if (!g || !g.attributes || !g.attributes.color || g.userData.canli) return;
      const a = g.attributes.color;
      for (let i = 0; i < a.count; i++) {
        c.setRGB(a.getX(i), a.getY(i), a.getZ(i)); c.getHSL(hsl);
        if (hsl.s > minS && hsl.h >= h0 && hsl.h <= h1) { c.setHSL(hsl.h, Math.min(1, hsl.s * ks), Math.min(0.92, hsl.l * kl)); a.setXYZ(i, c.r, c.g, c.b); }
      }
      a.needsUpdate = true; g.userData.canli = true;
    });
  }
  HUYSUZ.boss('ustaKostebek', { ad: 'Usta Köstebek', base: 'kostebekusta', stats: { r: 1.25, height: 2.6 },
    model: o => { const m = EMODEL.build.call(EMODEL, 'kostebekusta', o || {}); if (m && m.root) { renkCanlandir(m.root, 0.03, 0.12, 1.15, 1.28, 0.18); m.baseType = 'kostebekusta'; m.type = 'ustaKostebek'; } return m; },
    lines: { giris: 'b05_usta_giris', bitti: 'b05_usta_bitti', yarim: 'pr_ustaKostebek_yarim' },
    bossKit: { own: true, add: 'madenciKostebek', at: [0.66, 0.33], n: [2, 2], col: '#ffd96a', roar: 0.9, addDmg: 0.6 } });
  HUYSUZ.zone('magara', { enemies: { madenciKostebek: 4, baloncukSalyangoz: 3, magaraYarasa: 1.5, kayaDevi: 1, cakilTop: 2, kristalSalyangoz: 2 },
    elites: ['madenciKostebek', 'baloncukSalyangoz'], boss: 'ustaKostebek' });

  // ════════════════ Boss: sahne nesneleri (havuzsuz, az sayıda; hamle bitince atılır) ════════════════
  const W = { balls: [], lanes: [], crys: [], holes: [] };
  const mats = {};
  const mat = (k, c, em) => mats[k] || (mats[k] = (() => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, emissive: em || 0x000000, emissiveIntensity: em ? 0.5 : 0 }); m.userData.keep = true; return m; })());
  const bmat = (k, c, op) => mats[k] || (mats[k] = (() => { const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op ?? 1, depthWrite: false }); m.userData.keep = true; return m; })());
  const geos = {};
  const geo = (k, f) => geos[k] || (geos[k] = (() => { const g = f(); g.userData.keep = true; return g; })());
  const place = o => { if (typeof scene !== 'undefined') scene.add(o); return o; };
  const drop = o => { if (o && o.parent) o.parent.remove(o); };
  function ballMesh() {
    const g = new THREE.Group();
    const m = new THREE.Mesh(geo('ball', () => new THREE.IcosahedronGeometry(1, 1)), mat('ball', 0x8a6a4a)); m.scale.setScalar(0.62); m.castShadow = true; g.add(m);
    for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(geo('pb', () => new THREE.IcosahedronGeometry(1, 0)), mat('pb', 0xb89a74)); const a = i * 1.7; p.position.set(Math.sin(a) * 0.5, Math.cos(i * 2.1) * 0.4, Math.cos(a) * 0.5); p.scale.setScalar(0.16); g.add(p); }
    return g;
  }
  function crystalMesh() {
    const g = new THREE.Group();
    const m = mat('tq', 0x2ad8c8, 0x18a89c);
    const c = geo('cone6', () => new THREE.ConeGeometry(1, 1, 6));
    for (const [x, z, s, h] of [[0, 0, 0.42, 1.5], [0.4, 0.1, 0.28, 0.9], [-0.35, -0.15, 0.3, 1.0]]) { const q = new THREE.Mesh(c, m); q.scale.set(s, h, s); q.position.set(x, h / 2, z); q.castShadow = true; g.add(q); }
    return g;
  }
  function holeMesh() {
    const g = new THREE.Group();
    const d = new THREE.Mesh(geo('hd', () => new THREE.CircleGeometry(1, 28).rotateX(-PI / 2)), bmat('hd', 0x2a1a10, 0.92)); d.scale.setScalar(0.9); d.position.y = 0.04; g.add(d);
    const r = new THREE.Mesh(geo('hr', () => new THREE.RingGeometry(0.95, 1.2, 36).rotateX(-PI / 2)), bmat('hr', 0xffd24a, 0.95)); r.position.y = 0.06; g.add(r); g.userData.ring = r;
    return g;
  }
  const dmgOf = (b, k) => b.dmg * k;
  function fireDust(A, x, z, n, col) { for (let i = 0; i < n; i++) { const a = rnd(0, PI * 2), v = rnd(0.6, 2.2); A.emitP(x, 0.2, z, Math.sin(a) * v, rnd(1.2, 2.6), Math.cos(a) * v, rnd(0.4, 0.7), 0.26, 0.08, col || '#b89a74', '#e8d4b0', 2, 6, 0); } }

  function clearAll() {
    for (const q of W.balls) drop(q.m); for (const q of W.crys) drop(q.m); for (const h of W.holes) drop(h.m);
    W.balls.length = 0; W.lanes.length = 0; W.crys.length = 0; W.holes.length = 0;
  }
  function stepAll(dt) {
    const A = BOSSDAV.api; if (!A) return;
    for (let i = W.balls.length - 1; i >= 0; i--) {
      const q = W.balls[i]; q.t += dt;
      const u = Math.max(0, (q.t - (q.at - 0.9)) / 0.9);
      q.m.visible = u > 0;
      if (u > 0) { q.m.position.set(q.x, 0.55 + 9 * (1 - u * u), q.z); q.m.rotation.x += dt * 5; q.m.rotation.z += dt * 3; }
      if (q.t >= q.at) {
        fireDust(A, q.x, q.z, 16); A.burst('dirt', q.x, 0.2, q.z, { count: 10, scale: 1.2 }); A.fx('ring', q.x, q.z, { r0: 0.3, r1: q.r, dur: 0.4, color: '#ffb35a', width: 0.3 });
        A.sfx('slam', { x: q.x, z: q.z, vol: 0.5, pitch: 0.9 }); A.shake(0.18);
        const P = A.P; if (!P.dead && Math.hypot(P.pos.x - q.x, P.pos.z - q.z) < q.r + 0.2) A.hurtPlayer(dmgOf(q.b, 0.3), q.x, q.z, 0.5);
        drop(q.m); W.balls.splice(i, 1);
      }
    }
    for (let i = W.lanes.length - 1; i >= 0; i--) {
      const q = W.lanes[i]; q.t += dt;
      if (!q.fired && q.t >= q.at) {
        q.fired = true; A.sfx('whoosh', { x: q.x0, z: q.z0, pitch: 0.6, vol: 0.7 }); A.shake(0.16);
        for (let k = 1; k <= 9; k++) { const d = q.len * k / 9; fireDust(A, q.x0 + q.dx * d, q.z0 + q.dz * d, 4, '#d8c070'); A.burst('dirt', q.x0 + q.dx * d, 0.2, q.z0 + q.dz * d, { count: 3, scale: 0.9 }); }
        const P = A.P, ax = P.pos.x - q.x0, az = P.pos.z - q.z0, along = ax * q.dx + az * q.dz, side = Math.abs(ax * q.dz - az * q.dx);
        if (!P.dead && along > -0.3 && along < q.len + 0.4 && side < q.w / 2 + 0.25) A.hurtPlayer(dmgOf(q.b, 0.35), q.x0, q.z0, 0.5);
      }
      if (q.t >= q.at + 0.4) W.lanes.splice(i, 1);
    }
    for (let i = W.crys.length - 1; i >= 0; i--) {
      const q = W.crys[i]; q.t += dt;
      const u = Math.min(1, q.t / 0.5); q.m.scale.setScalar(u); q.m.rotation.y += dt * 0.6;
      if (q.t >= q.at - 0.2 && !q.pre) { q.pre = true; A.sfx('chime', { x: q.x, z: q.z, vol: 0.4, pitch: 1.4 }); }
      if (q.t >= q.at) {
        A.burst('sparkle', q.x, 0.8, q.z, { color: '#9ff4ec', count: 16 }); A.burst('crystal', q.x, 0.6, q.z, { count: 8 });
        A.fx('ring', q.x, q.z, { r0: 0.3, r1: q.r, dur: 0.4, color: '#7ff0e4', width: 0.28 }); A.sfx('glass', { x: q.x, z: q.z, vol: 0.5, pitch: 1.2 }); A.shake(0.1);
        const P = A.P; if (!P.dead && Math.hypot(P.pos.x - q.x, P.pos.z - q.z) < q.r) A.hurtPlayer(dmgOf(q.b, 0.2), q.x, q.z, 0.4);
        drop(q.m); W.crys.splice(i, 1);
      }
    }
    for (const h of W.holes) { h.open += ((h.closing ? 0 : 1) - h.open) * Math.min(1, dt * 5); h.m.scale.setScalar(Math.max(0.01, h.open)); if (h.glow) h.m.userData.ring.material.opacity = 0.55 + 0.4 * Math.sin(h.t = (h.t || 0) + dt * 6); }
  }

  // ════════════════ Boss hamleleri ════════════════
  const faceTo = (b, x, z, k, dt) => { b.face = dampAngle(b.face, Math.atan2(x - b.x, z - b.z), k, dt); };
  const hpF = b => b.hp / b.maxHp;
  function laneAim(b, A, spread) {   // Feza'ya doğru şerit (boss'tan)
    const ang = Math.atan2(A.P.pos.x - b.x, A.P.pos.z - b.z) + spread, dx = Math.sin(ang), dz = Math.cos(ang);
    return { ang, dx, dz };
  }
  function lane(b, A, spread, delay, len = 11) {
    const a = laneAim(b, A, spread), x0 = b.x + a.dx * b.r * 0.8, z0 = b.z + a.dz * b.r * 0.8;
    const rec = { x0, z0, dx: a.dx, dz: a.dz, len, w: 1.7, t: -delay, at: AT, fired: false, b };
    W.lanes.push(rec);
    // işaret gecikmeli çıkar: sıra ile (1-2-3)
    BOSSDAV.teleLine(x0, z0, x0 + a.dx * len, z0 + a.dz * len, rec.w, AT, '#ffd23a');
    return rec;
  }
  function dalgaMove(n) {
    return function (b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; S.lk = 0; S.lt = 0; faceTo(b, A.P.pos.x, A.P.pos.z, 30, 1);
        S.lanes = [];
      }
      // şeritler sırayla belirir: her biri öncekinden 1,0 sn sonra, kendi AT süresiyle yanar
      while (S.lk < n && t >= S.lk * 1.05) { faceTo(b, A.P.pos.x, A.P.pos.z, 30, 1); const sp = n === 1 ? 0 : (S.lk - (n - 1) / 2) * 0.55; lane(b, A, sp + (n > 1 ? rnd(-0.1, 0.1) : 0), 0); S.lk++; A.sfx('rumble', { x: b.x, z: b.z, vol: 0.4, pitch: 1.2 }); }
      if (t >= (n - 1) * 1.05 + AT + 0.7) A.bossEnd(b, 1.4, 1.2);
    };
  }
  const MOVES = {
    toprak(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; faceTo(b, A.P.pos.x, A.P.pos.z, 30, 1);
        const p = { x: A.P.pos.x, z: A.P.pos.z }, r = S.stage >= 3 ? 2.5 : 2.3;   // TELEG: 3. aşamada da 2 eşzamanlı daire yerine Feza'ya nişanlı TEK net turuncu daire
        if (A.isFloor(p.x, p.z)) {
          BOSSDAV.tele(p.x, p.z, r, AT, '#ff9a2e');
          const m = place(ballMesh()); m.visible = false; W.balls.push({ x: p.x, z: p.z, r, t: 0, at: AT, m, b });
        }
        A.sfx('rumble', { x: b.x, z: b.z, vol: 0.5, pitch: 0.8 });
      }
      if (t < 1.0) faceTo(b, A.P.pos.x, A.P.pos.z, 4, dt);
      if (t >= AT + 1.0) A.bossEnd(b, 1.5, 1.2);
    },
    dalga: dalgaMove(1), dalga2: dalgaMove(2), dalga3: dalgaMove(3),
    kristalpar(b, S, dt) {
      const A = BOSSDAV.api, t = b.stT;
      if (b.did === 0) {
        b.did = 1; faceTo(b, A.P.pos.x, A.P.pos.z, 30, 1);
        const rm = typeof A.bossRoom === 'function' ? A.bossRoom() : A.bossRoom, out = [];
        for (let k = 0; k < 40 && out.length < 3; k++) {
          const a = rnd(0, PI * 2), r = out.length === 0 ? rnd(0, 1.2) : rnd(2.6, 5.5), x = A.P.pos.x + Math.sin(a) * r, z = A.P.pos.z + Math.cos(a) * r;
          if (!A.isFloor(x, z) || (rm && A.inRoom && !A.inRoom(rm, x, z, 1.2)) || out.some(q => Math.hypot(q.x - x, q.z - z) < 3.2) || Math.hypot(x - b.x, z - b.z) < b.r + 1.2) continue;
          out.push({ x, z });
        }
        for (const p of out) {
          BOSSDAV.tele(p.x, p.z, 1.9, AT, '#2ad8c8');
          const m = place(crystalMesh()); m.position.set(p.x, 0, p.z); m.scale.setScalar(0.01); W.crys.push({ x: p.x, z: p.z, r: 1.9, t: 0, at: AT, m, b });
        }
        A.sfx('chime', { x: b.x, z: b.z, vol: 0.5, pitch: 1.1 });
      }
      if (t < 1.0) faceTo(b, A.P.pos.x, A.P.pos.z, 4, dt);
      if (t >= AT + 0.9) A.bossEnd(b, 1.5, 1.2);
    },
    // Saklambaç: köstebek toprağa dalar, 4 delik açılır; altın halkalı deliğe başını çıkarır; dokun → "tak!" (3 kez → şaşırır)
    sakla(b, S, dt) {
      const A = BOSSDAV.api;
      let K = S.sk;
      if (b.did === 0 || !K) {
        b.did = 1; const rm = typeof A.bossRoom === 'function' ? A.bossRoom() : A.bossRoom, out = [];
        const cx = rm ? rm.x : b.x, cz = rm ? rm.z : b.z, R = rm && rm.r ? rm.r * 0.55 : 5, a0 = rnd(0, PI * 2);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 8; j++) {
          const a = a0 + i * PI / 2 + (j % 2 ? 1 : -1) * Math.ceil(j / 2) * 0.12, rr = R * (1 - Math.floor(j / 4) * 0.2), x = cx + Math.sin(a) * rr, z = cz + Math.cos(a) * rr;
          if (A.isFloor(x, z) && A.circleFree(x, z, 0.8) && Math.hypot(x - A.P.pos.x, z - A.P.pos.z) > 3 && !out.some(q => Math.hypot(q.x - x, q.z - z) < 4)) { out.push({ x, z }); break; }
        }
        if (out.length < 2) { S.sk = null; A.bossEnd(b, 1, 1); return; }
        K = S.sk = { holes: out.map(p => { const m = place(holeMesh()); m.position.set(p.x, 0, p.z); m.scale.setScalar(0.01); const h = { x: p.x, z: p.z, m, open: 0, closing: false, glow: false }; W.holes.push(h); return h; }), stage: 'sink', t: 0, taps: 0, peeks: 0, cur: -1, order: out.map((p, i) => i).sort(() => Math.random() - 0.5), oi: 0 };
        A.sfx('dig', { x: b.x, z: b.z, pitch: 0.8 });
      }
      K.t += dt; b.phM = 'burrow'; const st = b.st;
      const next = () => { K.cur = K.order[K.oi++ % K.order.length]; K.stage = 'sink'; K.t = 0; for (const h of K.holes) h.glow = false; };
      if (K.cur < 0) next();
      const h = K.holes[K.cur];
      switch (K.stage) {
        case 'sink':
          b.bur = Math.min(1, K.t / 0.8); b.phTM = 0.3 * b.bur; if ((S.dg = (S.dg || 0) - dt) <= 0) { S.dg = 0.07; A.burst('dirt', b.x, 0.15, b.z, { count: 2, scale: 0.8 }); }
          if (K.t >= 0.8) { K.stage = 'travel'; K.t = 0; }
          break;
        case 'travel': {
          b.bur = 1; b.phTM = 0.5; const dx = h.x - b.x, dz = h.z - b.z, dd = Math.hypot(dx, dz);
          if (dd > 0.05) { const s = Math.min(dd, 7.5 * dt); b.x += dx / dd * s; b.z += dz / dd * s; b.face = Math.atan2(dx, dz); st.move = 1; if ((S.dg = (S.dg || 0) - dt) <= 0) { S.dg = 0.08; A.burst('dirt', b.x, 0.15, b.z, { count: 2, scale: 0.8 }); } }
          else { b.x = h.x; b.z = h.z; K.stage = 'mark'; K.t = 0; h.glow = true; BOSSDAV.tele(h.x, h.z, 1.5, AT, '#ffd24a'); A.sfx('dig', { x: h.x, z: h.z, pitch: 1.25 }); }
          break;
        }
        case 'mark':
          b.bur = 1; b.phTM = 0.5; st.windup = Math.min(1, K.t / AT); b.face = dampAngle(b.face, Math.atan2(A.P.pos.x - b.x, A.P.pos.z - b.z), 4, dt);
          if (K.t >= AT) { K.stage = 'peek'; K.t = 0; b.bur = 0.55; st.windup = 0; A.burst('dirt', h.x, 0.15, h.z, { count: 10 }); A.sfx('emerge', { x: h.x, z: h.z, pitch: 1.3, vol: 0.6 }); }
          break;
        case 'peek': {
          b.bur = 0.55; b.phTM = 0.4;
          if (!A.P.dead && Math.hypot(A.P.pos.x - h.x, A.P.pos.z - h.z) < 1.5) { tap(b, S, A); break; }
          if (K.t >= 3.0) { K.peeks++; K.stage = 'sink'; K.t = 0; if (K.peeks >= 6) { K.stage = 'out'; K.t = 0; K.win = false; } else next(); }
          break;
        }
        case 'out':
          b.bur = Math.max(0, 1 - K.t / 0.6) * (b.bur > 0 ? 1 : 0); b.phTM = 1; if (K.t === dt) { A.burst('dirt', b.x, 0.2, b.z, { count: 12 }); A.sfx('emerge', { x: b.x, z: b.z, pitch: 0.9 }); }
          if (K.t >= 0.6) {
            b.bur = 0; b.phM = null; for (const q of K.holes) q.closing = true;
            const win = K.win; S.sk = null;
            setTimeout(() => { for (let i = W.holes.length - 1; i >= 0; i--) if (W.holes[i].closing) { drop(W.holes[i].m); W.holes.splice(i, 1); } }, 700);
            if (win) A.bossPhase(b, 'kikirdat', 5.0); else A.bossEnd(b, 1, 1);
          }
          break;
      }
    },
    // Kıkırdama molası: köstebek şaşkın ve gülüyor; vuruş fırsatı (hasar ×1,5)
    kikirdat(b, S, dt) {
      const A = BOSSDAV.api;
      if ((S.zT = (S.zT || 0) - dt) <= 0) { S.zT = 0.7; A.burst('star', b.x + Math.sin(b.face) * 0.2, b.height + 0.35, b.z + Math.cos(b.face) * 0.2, { count: 3, color: '#fff3a0' }); }
      if (b.stT >= b.phD) A.bossEnd(b, 1.0, 0.9);
    },
  };
  function tap(b, S, A) {
    const K = S.sk; if (!K || K.stage !== 'peek') return;
    K.taps++; A.ftext(b.x, b.height + 0.5, b.z, 'Tak!', 'word'); A.sfx('bonk', { x: b.x, z: b.z, pitch: 1 + K.taps * 0.15 }); A.burst('sparkle', b.x, 1.2, b.z, { color: '#ffe08a', count: 10 }); A.burst('hearts', b.x, 1.6, b.z, { count: 3 });
    if (K.taps >= 3) { K.win = true; K.stage = 'out'; K.t = 0; b.bur = 0.55; if (A.hasLine('b05_saklambak_bitti')) A.say('b05_saklambak_bitti', 3); }
    else { K.stage = 'sink'; K.t = 0; K.cur = K.order[K.oi++ % K.order.length]; for (const h of K.holes) h.glow = false; }
  }
  if (typeof BOSSDAV !== 'undefined' && BOSSDAV && BOSSDAV.register) {
    BOSSDAV.register('ustaKostebek', {
      hpK: 2.2, keep: 5.5, roarD: 1.8, isaretKendi: true,
      asamalar: [0.66, 0.33], asamaSoz: { 2: 'b05_asama2', 3: 'b05_asama3' }, kikirdama: 1.8,
      choose(b, S) {
        const A = BOSSDAV.api; S.stage = S.stage || 1;
        if (S.stage >= 2 && !S.sakDone && hpF(b) <= 0.6) { S.sakDone = true; A.bossPhase(b, 'sakla', 999); return; }
        const opts = S.stage === 1 ? [['toprak', 0.5], ['dalga', 0.5]] : S.stage === 2 ? [['toprak', 0.3], ['dalga2', 0.7]] : [['toprak', 0.2], ['dalga3', 0.35], ['kristalpar', 0.45]];
        const ph = A.pickPhase(b, opts);
        A.bossPhase(b, ph, { toprak: 4.2, dalga: 4.0, dalga2: 5.2, dalga3: 6.2, kristalpar: 4.2 }[ph]);
      },
      moves: MOVES,
      hints: { toprak: 'b05_toprak', dalga: 'b05_dalga', dalga2: 'b05_dalga2', dalga3: 'b05_dalga3', kristalpar: 'b05_kristalpar', sakla: 'b05_saklambak' },
      hit(b, amount, o, S) {
        if (S && S.sk && b.ph === 'sakla') { if (S.sk.stage === 'peek') tap(b, S, BOSSDAV.api); return 0; }
        if (b.ph === 'kikirdat') amount = Math.round(amount * 1.5);
        return amount;
      },
      update(dt) { stepAll(dt); },
    });
  }
  function hook() {
    if (typeof GAME === 'undefined' || !GAME || !GAME.on) { setTimeout(hook, 250); return; }
    GAME.on('zone', () => clearAll());
  }
  hook();
  return { clearAll };
})();
