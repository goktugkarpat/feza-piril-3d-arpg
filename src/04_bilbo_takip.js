/* Position history, smooth arrival and one-way separation: Bilbo never pushes Feza. */
const BILBO_FOLLOW = (() => {
  const R0 = .34, SP0 = 1.75, PE0 = 1.02;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const blend = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  function create(env) {
    const radius = env.radius || R0, spacing = env.spacing || SP0, personal = env.personal || PE0, lateral = env.side || 0;   // lateral: izin yanı (+ sağ, − sol), yoldaşlar üst üste binmesin
    const pos = { x: 0, z: 0 };
    let trail = [], last = null, vx = 0, vz = 0, face = 0, speed = 0, walking = false, plan = [], planAt = 0, time = 0, leap = null;
    const free = (x, z) => env.free(x, z, radius);
    function clear(a, b) {
      const n = Math.max(1, Math.ceil(dist(a, b) / .2));
      for (let i = 1; i <= n; i++) if (!free(a.x + (b.x - a.x) * i / n, a.z + (b.z - a.z) * i / n)) return false;
      return true;
    }
    function reset(hero, x, z, angle = 0) {
      pos.x = x; pos.z = z; face = angle; speed = vx = vz = 0; walking = false; plan = []; planAt = 0; leap = null;
      trail = [{ x, z }, { x: hero.x, z: hero.z }]; last = { x: hero.x, z: hero.z };
    }
    function goal(hero) {
      // Attacking or turning the head does not move the goal. Only actual footsteps do.
      if (!last || dist(hero, last) > .18) {
        trail.push({ x: hero.x, z: hero.z }); last = { x: hero.x, z: hero.z };
        if (trail.length > 160) trail.shift();
      }
      let prev = hero, left = spacing, g = trail[0] || hero;
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i], d = dist(prev, p);
        if (d >= left) { const k = left / d; g = { x: prev.x + (p.x - prev.x) * k, z: prev.z + (p.z - prev.z) * k }; break; }
        left -= d; prev = p;
      }
      if (lateral && dist(g, hero) > .01) { const gx = g.x - hero.x, gz = g.z - hero.z, gl = Math.hypot(gx, gz); const nx = g.x - gz / gl * lateral, nz = g.z + gx / gl * lateral; if (free(nx, nz)) { g = { x: nx, z: nz }; } }
      // A U-turn may put an old footprint inside Feza. Pick a fixed, safe side instead.
      if (dist(g, hero) < personal + .18 || !free(g.x, g.z)) {
        const a = Math.atan2(pos.x - hero.x, pos.z - hero.z);
        for (const turn of [0, -.6, .6, -1.2, 1.2, Math.PI]) {
          const p = { x: hero.x + Math.sin(a + turn) * spacing, z: hero.z + Math.cos(a + turn) * spacing };
          if (free(p.x, p.z) && clear(hero, p)) { g = p; break; }
        }
      }
      return g;
    }
    function pounce(target) {
      if (leap || !target || target.dead || !Number.isFinite(target.x) || !Number.isFinite(target.z)) return false;
      const d = dist(pos, target);
      if (d < .6 || d > 5.5) return false;
      const stop = Math.max(.6, (target.r || .4) + .28), k = Math.max(0, (d - stop) / d);
      const end = { x: pos.x + (target.x - pos.x) * k, z: pos.z + (target.z - pos.z) * k };
      if (!clear(pos, end)) return false;
      leap = { target, x: pos.x, z: pos.z, end, age: 0, duration: .62, hit: false };
      vx = vz = 0; plan = []; walking = false;
      return true;
    }
    function step(dt, hero) {
      dt = Math.min(.05, Math.max(0, dt)); time += dt;
      const g = goal(hero);
      if (leap) {
        const l = leap; l.age += dt;
        const u = Math.min(1, l.age / l.duration), k = u * u * (3 - 2 * u), old = { x: pos.x, z: pos.z };
        const nx = l.x + (l.end.x - l.x) * k, nz = l.z + (l.end.z - l.z) * k;
        env.move(pos, nx - pos.x, nz - pos.z, radius);
        face = Math.atan2(l.end.x - l.x, l.end.z - l.z);
        speed = dt ? dist(old, pos) / dt : 0;
        let impact = null;
        if (u >= .87 && !l.hit) {
          l.hit = true;
          if (!l.target.dead && dist(pos, l.target) < (l.target.r || .4) + 1.25) impact = l.target;
        }
        const hop = Math.sin(Math.PI * u) * .76;
        if (u >= 1) { leap = null; vx = vz = speed = 0; }
        return { pos, face, speed, hop, pounce: Math.sin(Math.PI * u), impact };
      }
      // Only a teleport/zone warp warrants snapping, never ordinary walking or a nearby wall.
      if (dist(pos, hero) > 18 && free(g.x, g.z)) { reset(hero, g.x, g.z, face); return { pos, face, speed: 0 }; }
      let target = g;
      if (!clear(pos, g)) {
        if (time >= planAt) { plan = env.route ? env.route(pos.x, pos.z, g.x, g.z) || [] : []; planAt = time + .8; }
        while (plan.length && dist(pos, plan[0]) < .23) plan.shift();
        if (plan.length) target = plan[0];
      } else plan = [];
      const d = dist(pos, target);
      if (walking ? d < .13 : d > .36) walking = !walking;
      let dx = target.x - pos.x, dz = target.z - pos.z;
      let desired = walking ? Math.min(7.0, d * 3.0) : 0;
      let ux = d > .001 ? dx / d : 0, uz = d > .001 ? dz / d : 0;
      const hx = pos.x - hero.x, hz = pos.z - hero.z, hd = Math.hypot(hx, hz);
      // Steer around the child before reaching his body; use the same side throughout a pass.
      if (hd < 1.65 && hd > .001 && ux * hx + uz * hz < 0) {
        const into = (ux * hx + uz * hz) / (hd * hd);
        ux -= hx * into; uz -= hz * into;
        if (Math.hypot(ux, uz) < .1) { ux = -hz / hd; uz = hx / hd; }
        const l = Math.hypot(ux, uz); ux /= l; uz /= l;
      }
      vx = blend(vx, ux * desired, 9, dt); vz = blend(vz, uz * desired, 9, dt);
      if (!walking && Math.hypot(vx, vz) < .025) vx = vz = 0;
      const before = { x: pos.x, z: pos.z };
      let mx = vx * dt, mz = vz * dt;
      const len = Math.hypot(mx, mz);
      if (len > d && d > .01) { mx *= d / len; mz *= d / len; }
      env.move(pos, mx, mz, radius);
      // Project only Bilbo outward. Feza's input/position is never modified.
      const sep = dist(pos, hero);
      if (sep < personal) {
        let ax = pos.x - hero.x, az = pos.z - hero.z;
        if (sep < .001) { ax = Math.cos(face); az = -Math.sin(face); }
        const n = Math.hypot(ax, az), x = hero.x + ax / n * personal, z = hero.z + az / n * personal;
        if (free(x, z) && clear(pos, { x, z })) { pos.x = x; pos.z = z; }
      }
      const travelled = dist(before, pos), actual = dt > 0 ? travelled / dt : 0;
      speed = blend(speed, Math.min(8, actual), 9, dt);
      if (travelled > .002 && actual > .10) {
        const targetFace = Math.atan2(pos.x - before.x, pos.z - before.z);
        const delta = Math.atan2(Math.sin(targetFace - face), Math.cos(targetFace - face));
        face += delta * (1 - Math.exp(-8 * dt));
      }
      if (actual < .08 && desired > .5) { vx = vz = 0; }
      return { pos, face, speed };
    }
    return { pos, reset, step, pounce, isPouncing: () => !!leap };
  }
  return { create };
})();

/* ── BILBO yoldaşı: model + takip + biniş + otomatik havlama (Feza ve Pırıl: Büyük Fener) ──
   Top bulma / koklama YOK. Pırıl ile aynı anda takip eder: Bilbo Feza'nın SAĞ-ARKASINDA (BILBO_FOLLOW, geride 1.75 m),
   Pırıl sol-önde havada uçar (PIRIL_TAKIP), çakışmaz (ayrı yan + `ayir()` ile Pırıl'dan en az 1.1 m uzak tutar).
   Kullanım (MOTOR2, 07_game):
     const b = BILBO.kur({ scene, hero: () => P ({pos:{x,z}, face}), free: circleFree, move: moveXZ, route,
                           enemies: () => enemies ({x,z,r,dead,boss}), sersemlet: (e, sn, boss) => {...}, fx, sfx, say,
                           feza: H.root (binerken sırta oturtulur), pirilPos: () => ({x,z}) (isteğe bağlı) });
     her kare:  b.update(dt)          // Bilbo'yu yürütür/sürer, modeli günceller
     BILBO.bin() / BILBO.in()         // yalnız oyuncak düğmeden; boss arenasında çağıran engeller (BILBO.binebilir())
     BILBO.havla()                    // elle/otomatik havlama: menzildeki düşmanı sersemletir (zarar yok)
     BILBO.kayit                      // COMPANION.register('bilbo', BILBO.kayit) — tetik/bekleme/eylem
     b.hizCarpani (1.25 binikken), b.heroLift() → { k, y } Feza'nın sırt yüksekliği; b.root, b.model                       */
(() => {
  'use strict';
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const ease = u => { u = clamp01(u); return u * u * (3 - 2 * u); };
  const SCALE = 0.78, RIDE_MUL = 1.25, MOUNT = 0.32;
  const HAVLA = { yaricap: 5.5, sersem: 3, bossSersem: 1.5, bekleme: 20, beklemeB5: 14, canEsik: 0.5, canEsikB5: 0.35, dusman: 4 };
  let cur = null;
  const _v = new THREE.Vector3();

  function kur(env) {
    if (cur) cur.dispose();
    let jAd = null, jT = 0;
    const model = BILBO.create();
    const root = model.root; root.scale.setScalar(SCALE);
    if (env.scene) env.scene.add(root);
    const fol = BILBO_FOLLOW.create({ side: .9, free: env.free || (() => true), move: env.move || ((p, dx, dz) => { p.x += dx; p.z += dz; }), route: env.route });
    const st = { ride: 0, riding: false, bark: 0, happy: 0, t: 0, speed: 0, face: 0, nextAt: 0, rideT: 0 };
    const pos = fol.pos;
    let started = false;
    const hero = () => { const h = env.hero(); return h.pos || h; };
    function baslat() { const h = env.hero(), hp = h.pos || h, f = h.face || 0; fol.reset(hp, hp.x - Math.sin(f) * 1.6, hp.z - Math.cos(f) * 1.6, f); started = true; }
    function ayir(hp) {   // Pırıl'dan (yalnız yer düzleminde) en az 1.1 m uzak dur
      const pp = env.pirilPos && env.pirilPos(); if (!pp) return;
      const d = dist(pos, pp); if (d < 1.1 && d > .001) { const k = 1.1 / d; const nx = pp.x + (pos.x - pp.x) * k, nz = pp.z + (pos.z - pp.z) * k; if (!env.free || env.free(nx, nz, .34)) { pos.x = nx; pos.z = nz; } }
    }
    function update(dt) {
      dt = Math.min(.05, Math.max(0, dt)); st.t += dt;
      const h = env.hero(), hp = h.pos || h;
      if (!started) baslat();
      if (st.riding) {
        st.rideT += dt;
        const f = h.face || 0, back = .10 * SCALE;
        pos.x = hp.x + Math.sin(f) * back; pos.z = hp.z + Math.cos(f) * back; st.face = f;
        st.speed = Math.min(8, (env.heroSpeed ? env.heroSpeed() : 0) / SCALE * .8);
        fol.reset(hp, pos.x, pos.z, f);
      } else {
        const o = fol.step(dt, hp); ayir(hp);
        st.face = o.face; st.speed = o.speed;
        root.position.y = o.hop || 0;
      }
      st.ride += ((st.riding ? 1 : 0) - st.ride) * Math.min(1, dt / MOUNT);
      st.bark = Math.max(0, st.bark - dt);
      root.position.x = pos.x; root.position.z = pos.z; root.rotation.y = st.face;
      if (st.riding) root.position.y = 0;
      jT = Math.max(0, jT - dt); const jn = jT > 0 && st.speed < .3 && !st.riding ? jAd : null;
      model.update(dt, { speed: st.speed, bark: st.bark, ride: st.riding, happy: st.riding ? 1 : st.happy || (jn === 'selam' || jn === 'happy' ? .8 : 0), merak: jn === 'merak', selam: jn === 'selam', yalvar: jn === 'yalvar' });
      if (st.riding && env.feza) {   // Feza Bilbo'nun sırtında
        model.saddle.getWorldPosition(_v);
        const k = ease(st.ride); env.feza.position.set(hp.x, _v.y * k, hp.z);
      }
    }
    function bin() {
      if (st.riding || !env.hero) return false;
      st.riding = true; st.rideT = 0; st.ride = 0;
      if (env.sfx) env.sfx('bilboBark', { vol: 1, pitch: 1.1 });
      if (env.say) env.say('bilbo_bin', 2);
      return true;
    }
    function inis() {
      if (!st.riding) return false;
      st.riding = false; const h = env.hero(), hp = h.pos || h, f = h.face || 0;
      for (const side of [1, -1, 0]) {   // Feza'nın yanına zıpla
        const tx = hp.x + Math.cos(f) * 1.1 * side - Math.sin(f) * (side ? .2 : 1.1), tz = hp.z - Math.sin(f) * 1.1 * side - Math.cos(f) * (side ? .2 : 1.1);
        if (!env.free || env.free(tx, tz, .34)) { fol.reset(hp, tx, tz, f); break; }
      }
      if (env.feza) env.feza.position.y = 0;
      return true;
    }
    function havla(opt = {}) {
      st.bark = 1.3; st.happy = 1;
      const r = opt.yaricap || HAVLA.yaricap; let n = 0;
      if (env.sfx) env.sfx('bilboBark', { vol: 1, pitch: 1 });
      if (env.fx) env.fx('ring', pos.x, pos.z, { r0: .3, r1: r, dur: .6, color: '#ffe397', width: .35 });   // tek halka
      for (const e of (env.enemies ? env.enemies() : [])) {
        if (!e || e.dead || dist(e, pos) > r + (e.r || .4)) continue;
        if (env.sersemlet) env.sersemlet(e, e.boss ? HAVLA.bossSersem : HAVLA.sersem, !!e.boss);   // sersemletir, ZARAR YOK
        n++;
      }
      setTimeout(() => { st.happy = 0; }, 1500);
      return n;
    }
    function heroLift() {
      if (st.ride <= .001) return null;
      model.saddle.getWorldPosition(_v);
      const k = ease(st.ride); return { k, y: _v.y * k + .55 * Math.sin(Math.PI * st.ride) * (st.ride < 1 ? 1 : 0) };
    }
    function dispose() { if (root.parent) root.parent.remove(root); model.dispose(); if (cur === api) cur = null; }
    function jest(ad, sn = 2.5) { jAd = ad; jT = sn; return true; }
    jest('selam', 2.6);   // sahneye gelince selam verir
    const api = { jest, root, model, pos, update, bin, inis, havla, heroLift, dispose, follow: fol, get riding() { return st.riding; },
      get hizCarpani() { return st.riding ? RIDE_MUL : 1; }, get state() { return st; } };
    cur = api; BILBO.jest = (ad, sn) => (cur ? cur.jest(ad, sn) : false); return api;
  }
  // COMPANION kancası için kayıt tanımı (MOTOR2 `COMPANION.register(id, def)`; def.dene(ctx) true dönerse eylem çalıştı)
  const kayit = {
    id: 'bilbo', ad: 'Bilbo havlaması', bekleme: HAVLA.bekleme, canEsik: HAVLA.canEsik, dusman: HAVLA.dusman,
    b5: { bekleme: HAVLA.beklemeB5, canEsik: HAVLA.canEsikB5 },
    // ctx: { canOrani, yakinDusman, bolum } → tetik; eylem: havla (tek efekt: halka)
    tetik(ctx) { return ctx.canOrani < (ctx.bolum === 5 ? HAVLA.canEsikB5 : HAVLA.canEsik) || ctx.yakinDusman >= HAVLA.dusman; },
    eylem() { return cur ? cur.havla() : 0; },
    hazir() { return !!cur && !cur.riding; },
  };
  Object.assign(BILBO, {
    kur, kayit, HAVLA,
    bin: () => !!cur && cur.bin(), in: () => !!cur && cur.inis(), havla: o => cur ? cur.havla(o) : 0,
    binebilir: () => !!cur && !cur.riding,
  });
  // (Object.assign alıcıları bir kez okuyup sabit değere çeviriyordu: aktif hep null kalıyordu → canlı alıcı olarak tanımla)
  Object.defineProperty(BILBO, 'biniyor', { get() { return !!cur && cur.riding; }, configurable: true });
  Object.defineProperty(BILBO, 'aktif', { get() { return cur; }, configurable: true });
})();
