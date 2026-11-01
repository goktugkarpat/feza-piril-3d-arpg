/* Pırıl'ın takibi: Feza'nın yanında havada uçar (motorun yoldaş takibi; Bilbo'nunki ayrı: 04_bilbo_takip.js).
   PIRIL_TAKIP.create(env) → { pos:{x,z}, reset(heroPos, x, z, açı), step(dt, heroPos) → { pos, face, speed, hop, pounce, impact },
   pounce(e), isPouncing(), goster(x, z, sn) }.
   Uçtuğu için duvar/eşya engellemez (env.move kullanılmaz) ama Feza'dan hiç uzaklaşmaz; Feza'yı itmez, içinden geçmez.
   Hedef nokta: Feza'nın gidiş yönüne göre bir yanında, biraz geride, omuz hizasında (yükseklik modelin içinde: m.lift).
   DURUMLAR (tek API): takip.durum('takip'|'kucak'|'omuz'|'uyku'|'kon'|'ucus'|'buyume'|'kucukluk') — durumAd() şimdiki durumu verir.
     takip = serbest uçuş (varsayılan) · kucak = Feza onu kucağında taşır (B7 karanlık an: uykulu, ışığı sönük, yumuşak sallanır) ·
     omuz = Feza'nın omzunda oturur (B8 yolculuk) · uyku = yanında yere kıvrılır · kon = başına konar (yürüyünce kalkar) ·
     ucus = büyür, Feza sırtına biner (B10) · buyume = yalnız büyür · kucukluk = normal boya döner (ucus/buyume kapanır).
   Dururken yavaşça "8" çizer gibi süzülür; hızlı yürürken yanında kalır, dönüşlerde aynı tarafı korur. */
const PIRIL_TAKIP = (() => {
  'use strict';
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const blend = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const SIDE = 1.2, BACK = 0.35, FRONT = 0.55, PERSONAL = 0.9, MAXV = 9;
  // Taşınma durumları: ön uzaklık / yan uzaklık (Feza'nın gidiş yönüne göre), kök yüksekliği (hop), model ölçeği çarpanı
  const AYAR = {
    kucak: { on: .38, yan: .0, hop: .3, olcek: .8 },
    omuz: { on: .05, yan: .32, hop: .45, olcek: .7 },
    uyku: { on: .0, yan: .9, hop: 0, olcek: 1 },
  };
  function create(env = {}) {
    const pos = { x: 0, z: 0 };
    let vx = 0, vz = 0, face = 0, speed = 0, time = 0, side = 1, sideHold = 0;
    let yanKilit = 0, mod = null, modHop = 0, modOlcek = 1, hx = 0, hz = 0, hdx = 0, hdz = 1, last = null, hvx = 0, hvz = 0, leap = null, show = null, kon = null, tur = null, poz = null;
    function reset(hero, x, z, angle = 0) {
      pos.x = x; pos.z = z; face = angle; vx = vz = speed = 0; leap = null; show = null;
      hdx = Math.sin(angle); hdz = Math.cos(angle); last = hero ? { x: hero.x, z: hero.z } : null;
      // hangi yanda başladıysa o yan
      if (hero) { const cx = hdz, cz = -hdx; side = ((x - hero.x) * cx + (z - hero.z) * cz) >= 0 ? 1 : -1; }
    }
    function heroDir(hero, dt) {
      if (!last) last = { x: hero.x, z: hero.z };
      const dx = hero.x - last.x, dz = hero.z - last.z;
      if (dt > 0) { hvx = blend(hvx, dx / dt, 6, dt); hvz = blend(hvz, dz / dt, 6, dt); }
      last.x = hero.x; last.z = hero.z;
      const hs = Math.hypot(hvx, hvz);
      if (hs > .4) { hdx = blend(hdx, hvx / hs, 3, dt); hdz = blend(hdz, hvz / hs, 3, dt); const l = Math.hypot(hdx, hdz) || 1; hdx /= l; hdz /= l; }
      return hs;
    }
    function pounce(target) {
      if (mod || poz || leap || show || !target || target.dead || !Number.isFinite(target.x) || !Number.isFinite(target.z)) return false;
      const d = dist(pos, target);
      if (d < .5 || d > 6.5) return false;
      kon = null; tur = null;
      leap = { target, x: pos.x, z: pos.z, age: 0, duration: .85, hit: false };
      return true;
    }
    // Bir yeri göster (ör. saklanan boss, kapı): oraya uçup üstünde tur atar, sonra döner.
    // Feza'nın başına kon (hop: başın üstü için kök yüksekliği; çağıran hesaplar). Feza yürüyünce kendiliğinden kalkar.
    function konBas(sn = 4, hop = 0) { if (leap || mod) return false; show = null; tur = null; kon = { age: 0, dur: sn, hop, ok: false }; return true; }
    // Poz (ışık geri geldi anı): Feza'nın yanında, kameraya bakan tarafta, yüzü kameraya dönük durur (yakın plan kadrajda)
    function pozVer(sn = 6) { mod = null; leap = null; show = null; kon = null; tur = null; poz = { age: 0, dur: sn }; return true; }
    // Feza'nın çevresinde kıkırdayarak bir-iki tur dön
    function etrafinda(sn = 2.2) { if (leap || mod) return false; kon = null; tur = { age: 0, dur: sn, a: Math.atan2(pos.x - (last ? last.x : 0), pos.z - (last ? last.z : 0)) }; return true; }
    function goster(x, z, sn = 3) { if (poz || mod) return false; if (!Number.isFinite(x) || !Number.isFinite(z)) return false; leap = null; show = { x, z, age: 0, dur: Math.max(1, sn) }; return true; }
    function G() { return typeof PIRIL_GUC !== 'undefined' ? PIRIL_GUC : null; }
    function durum(ad) {
      const g = G();
      if (ad === 'kucak' || ad === 'omuz' || ad === 'uyku') {
        leap = null; show = null; kon = null; tur = null; poz = null; mod = ad;
        if (g && g.riding) g.ucus(false);
        return true;
      }
      if (ad === 'takip' || ad == null) {
        const eski = mod; mod = null; leap = null; show = null; kon = null; tur = null; poz = null;
        if (g && g.riding) g.ucus(false);
        if (eski === 'uyku' && g && g.model && g.model()) { const m = g.model(); if (m.gerin) m.gerin(1.6); }
        return true;
      }
      if (ad === 'kon') { mod = null; if (g && g.saka) g.saka('kon'); return true; }
      if (ad === 'ucus') { mod = null; leap = null; show = null; kon = null; tur = null; if (g && g.ucus) g.ucus(true); return true; }
      if (ad === 'buyume') { mod = null; if (g && g.buyu) g.buyu(true); return true; }
      if (ad === 'kucukluk') { if (g && g.riding) g.ucus(false); if (g && g.buyu) g.buyu(false); return true; }
      return false;
    }
    function durumAd() { return mod || (kon ? 'kon' : (G() && G().riding ? 'ucus' : 'takip')); }
    function yanSec(k) { yanKilit = k ? (k < 0 ? -1 : 1) : 0; if (yanKilit) side = yanKilit; }   // Pırıl hep bu yanda (ör. Bilbo karşı yanda); yanSec(0) → serbest
    function step(dt, hero, others) {
      dt = Math.min(.05, Math.max(0, dt)); time += dt;
      const hs = heroDir(hero, dt);
      // ışınlanma / bölge değişimi: hemen yanına
      if (dist(pos, hero) > 16) { reset(hero, hero.x + hdz * SIDE * side, hero.z - hdx * SIDE * side, Math.atan2(hdx, hdz)); return { pos, face, speed: 0, hop: 0 }; }
      // Dalış (huysuza ışık çarpması): kavisle iner, dokunur, geri döner
      if (leap) {
        const l = leap; l.age += dt;
        const u = Math.min(1, l.age / l.duration), tg = l.target;
        const tx = tg && !tg.dead ? tg.x : l.x, tz = tg && !tg.dead ? tg.z : l.z;
        const stop = Math.max(.55, (tg && tg.r || .4) + .35);
        const d0 = Math.hypot(tx - l.x, tz - l.z) || 1, ex = tx - (tx - l.x) / d0 * stop, ez = tz - (tz - l.z) / d0 * stop;
        // gidiş (0..0.55) → dönüş (0.55..1): yuvarlak bir yay
        const go = u < .55 ? u / .55 : 1 - (u - .55) / .45, k = go * go * (3 - 2 * go);
        const gx = hero.x + hdz * SIDE * side - hdx * BACK, gz = hero.z - hdx * SIDE * side - hdz * BACK;
        const bx = u < .55 ? l.x : gx, bz = u < .55 ? l.z : gz;
        const ox = pos.x, oz = pos.z;
        pos.x = bx + (ex - bx) * k; pos.z = bz + (ez - bz) * k;
        speed = dt ? Math.hypot(pos.x - ox, pos.z - oz) / dt : 0;
        face = Math.atan2(tx - pos.x, tz - pos.z);
        let impact = null;
        if (u >= .55 && !l.hit) { l.hit = true; if (tg && !tg.dead && Math.hypot(tg.x - pos.x, tg.z - pos.z) < (tg.r || .4) + 1.3) impact = tg; }
        if (u >= 1) { leap = null; vx = vz = 0; }
        return { pos, face, speed, hop: -.45 * Math.sin(Math.PI * Math.min(1, u / .55)) * (u < .55 ? 1 : 0), pounce: Math.sin(Math.PI * u), impact };
      }
      // Taşınma durumları: kucak / omuz / uyku (kalıcı; durum('takip') ile çıkılır)
      if (mod) {
        const A = AYAR[mod], px = hdz, pz = -hdx;   // gidiş yönüne dik (sağ)
        const gx = hero.x + hdx * A.on + px * A.yan, gz = hero.z + hdz * A.on + pz * A.yan;
        const ox = pos.x, oz = pos.z, k = mod === 'uyku' ? 4 : 12;
        pos.x = blend(pos.x, gx, k, dt); pos.z = blend(pos.z, gz, k, dt);
        speed = dt ? Math.hypot(pos.x - ox, pos.z - oz) / dt : 0;
        modHop = blend(modHop, A.hop, 8, dt); modOlcek = blend(modOlcek, A.olcek, 6, dt);
        const tf = mod === 'uyku' ? Math.atan2(hero.x - pos.x, hero.z - pos.z) : Math.atan2(hdx, hdz);
        const dl = Math.atan2(Math.sin(tf - face), Math.cos(tf - face)); face += dl * (1 - Math.exp(-6 * dt));
        return { pos, face, speed: mod === 'uyku' ? Math.min(speed, 3) : 0, hop: modHop };
      }
      modHop = blend(modHop, 0, 8, dt); modOlcek = blend(modOlcek, 1, 6, dt);
      // Işık anı pozu
      if (poz) {
        const p = poz; p.age += dt;
        let cx = 0, cz = 1;
        const cam = env.camera || (typeof camera !== 'undefined' && camera && camera.isCamera ? camera : null);
        if (cam) { cx = cam.position.x - hero.x; cz = cam.position.z - hero.z; const l = Math.hypot(cx, cz) || 1; cx /= l; cz /= l; }
        const lx = cz, lz = -cx;
        const gx = hero.x + lx * .95 * side + cx * .55, gz = hero.z + lz * .95 * side + cz * .55;
        const ox = pos.x, oz = pos.z;
        pos.x = blend(pos.x, gx, 5, dt); pos.z = blend(pos.z, gz, 5, dt);
        speed = dt ? Math.hypot(pos.x - ox, pos.z - oz) / dt : 0;
        const tf = Math.atan2(cx, cz), df = Math.atan2(Math.sin(tf - face), Math.cos(tf - face));
        face += df * (1 - Math.exp(-7 * dt));
        if (p.age >= p.dur) poz = null;
        return { pos, face, speed: Math.min(speed, 1.5), hop: 0 };
      }
      // Başa konma: Feza'nın tam üstüne süzülür, iner, oturur
      if (kon) {
        const k = kon; k.age += dt;
        if (hs > .6 || k.age >= k.dur) { kon = null; }
        else {
          const ox = pos.x, oz = pos.z;
          pos.x = blend(pos.x, hero.x - hdx * .05, 6, dt); pos.z = blend(pos.z, hero.z - hdz * .05, 6, dt);
          speed = dt ? Math.hypot(pos.x - ox, pos.z - oz) / dt : 0;
          const near = Math.hypot(pos.x - hero.x, pos.z - hero.z) < .25;
          k.ok = near;
          const df = Math.atan2(Math.sin(Math.atan2(hdx, hdz) - face), Math.cos(Math.atan2(hdx, hdz) - face)); face += df * (1 - Math.exp(-6 * dt));
          return { pos, face, speed: near ? 0 : speed, hop: near ? k.hop : k.hop * .5 + .3, kon: near };
        }
      }
      // Feza'nın çevresinde tur (dokununca)
      if (tur) {
        const u = tur; u.age += dt;
        const a = u.a + u.age * 5.2, r = 1.25;
        const ox = pos.x, oz = pos.z;
        pos.x = blend(pos.x, hero.x + Math.sin(a) * r, 10, dt); pos.z = blend(pos.z, hero.z + Math.cos(a) * r, 10, dt);
        speed = dt ? Math.hypot(pos.x - ox, pos.z - oz) / dt : 0;
        if (speed > .3) face = Math.atan2(pos.x - ox, pos.z - oz);
        if (u.age >= u.dur) tur = null;
        return { pos, face, speed, hop: .1 * Math.sin(u.age * 8) };
      }
      // Gösterme: hedefe uç, üstünde küçük daireler çiz
      if (show) {
        const s = show; s.age += dt;
        const a = s.age * 3.2, tx = s.x + Math.sin(a) * .9, tz = s.z + Math.cos(a) * .9;
        const ox = pos.x, oz = pos.z;
        pos.x = blend(pos.x, tx, 3.5, dt); pos.z = blend(pos.z, tz, 3.5, dt);
        speed = dt ? Math.hypot(pos.x - ox, pos.z - oz) / dt : 0;
        if (speed > .3) face = Math.atan2(pos.x - ox, pos.z - oz);
        if (s.age >= s.dur || dist(hero, s) > 14) show = null;
        return { pos, face, speed, hop: .25 + .1 * Math.sin(s.age * 5) };
      }
      // Hedef: kameraya bakan tarafta (Feza'nın biraz önünde, kameraya yakın) ve yanında → her an görünür, Feza'yı örtmez.
      // Yan: Feza yatay yürürken onun gerisindeki yanda kalır (yolunu kesmez); en az 2 s'de bir değişir.
      let cx = 0, cz = 1;
      const cam = env.camera || (typeof camera !== 'undefined' && camera && camera.isCamera ? camera : null);
      if (cam) { cx = cam.position.x - hero.x; cz = cam.position.z - hero.z; const l = Math.hypot(cx, cz) || 1; cx /= l; cz /= l; }
      const lx = cz, lz = -cx;                       // ekranda yatay yön
      sideHold -= dt;
      const lat = hvx * lx + hvz * lz;
      if (!yanKilit && Math.abs(lat) > .8 && sideHold <= 0) { const want = lat > 0 ? -1 : 1; if (want !== side) { side = want; sideHold = 2; } }
      const idle = Math.max(0, 1 - hs / 1.2);
      const w1 = Math.sin(time * .7) * .35 * idle, w2 = Math.sin(time * 1.4) * .22 * idle;
      const rx = lx, rz = lz;
      let gx = hero.x + lx * (SIDE + w2) * side + cx * (FRONT + w1);
      let gz = hero.z + lz * (SIDE + w2) * side + cz * (FRONT + w1);
      // Yaylı uçuş (hafif gecikme, aşmadan yerleşir)
      const ax = (gx - pos.x) * 18 - vx * 7.5, az = (gz - pos.z) * 18 - vz * 7.5;
      vx += ax * dt; vz += az * dt;
      const v = Math.hypot(vx, vz); if (v > MAXV) { vx *= MAXV / v; vz *= MAXV / v; }
      const ox = pos.x, oz = pos.z;
      pos.x += vx * dt; pos.z += vz * dt;
      // Feza'nın içine girme (yalnız Pırıl kayar)
      const sx = pos.x - hero.x, sz = pos.z - hero.z, sd = Math.hypot(sx, sz);
      if (sd < PERSONAL) { const n = sd > .001 ? sd : 1, ux = sd > .001 ? sx / n : rx * side, uz = sd > .001 ? sz / n : rz * side; pos.x = hero.x + ux * PERSONAL; pos.z = hero.z + uz * PERSONAL; }
      if (others) for (const o of others) {   // diğer yoldaşın (Bilbo vb.) üstüne binme: yalnız Pırıl kayar
        if (!o || !Number.isFinite(o.x) || !Number.isFinite(o.z)) continue;
        const ex = pos.x - o.x, ez = pos.z - o.z, ed = Math.hypot(ex, ez), R = o.r || 1.0;
        if (ed < R) { const n = ed > .001 ? ed : 1, ux = ed > .001 ? ex / n : lx * side, uz = ed > .001 ? ez / n : lz * side; pos.x = o.x + ux * R; pos.z = o.z + uz * R; }
      }
      const actual = dt > 0 ? Math.hypot(pos.x - ox, pos.z - oz) / dt : 0;
      speed = blend(speed, Math.min(8, actual), 8, dt);
      // Yüz: hızlıyken uçuş yönüne, yavaşken Feza'nın baktığı yöne (yanında beraber yürüyormuş gibi), dururken hafifçe Feza'ya
      let tf;
      if (actual > 1.2) tf = Math.atan2(pos.x - ox, pos.z - oz);
      else { const fx = hdx + (hero.x - pos.x) * .5 * idle, fz = hdz + (hero.z - pos.z) * .5 * idle; tf = Math.atan2(fx, fz); }
      const dlt = Math.atan2(Math.sin(tf - face), Math.cos(tf - face));
      face += dlt * (1 - Math.exp(-5 * dt));
      return { pos, face, speed, hop: 0 };
    }
    return { pos, reset, step, yanSec, durum, durumAd, olcek: () => mod ? AYAR[mod].olcek : 1, modu: () => mod, pounce, goster, konBas, etrafinda, pozVer, pozda: () => !!poz, isPouncing: () => !!leap, gosteriyor: () => !!show, konuyor: () => !!kon, konmus: () => !!(kon && kon.ok), donuyor: () => !!tur };
  }
  return { create, AYAR };
})();


/* ── G5: Pırıl ve yoldaşlar oyun olaylarına tepki verir (sessiz karakterler: kişilik jestlerle anlaşılır). GAME.on olayları, 04_piril.js duyguları. ── */
(() => {
  'use strict';
  let kuruldu = false, endiseT = 0, sonHint = 0;
  const P = () => (typeof GAME !== 'undefined' && GAME.Bilbo && GAME.Bilbo.duygu) ? GAME.Bilbo : null;
  const hala = (ad, sn) => { try { if (typeof HALA !== 'undefined' && HALA.pose) { HALA.pose(ad, 1); setTimeout(() => { try { HALA.pose(null); } catch (e) { /* yok */ } }, sn * 1000); } } catch (e) { /* yok */ } };
  const hepsi = (jb, jk, jl) => { try { if (typeof BABA !== 'undefined' && BABA.jest) BABA.jest(jb, 4); if (typeof KARTAL !== 'undefined' && KARTAL.jest) KARTAL.jest(jk, 4); if (typeof BILBO !== 'undefined' && BILBO.jest) BILBO.jest(jl, 4); } catch (e) { /* yok */ } };
  function kur() {
    if (kuruldu || typeof GAME === 'undefined' || !GAME.on) return; kuruldu = true;
    GAME.on('boss', e => { const p = P(); if (!p || !e) return; if (e.on) { p.duygu('saskin', 1.6); setTimeout(() => { const q = P(); if (q) q.duygu('merak', 1.4); }, 1700); hepsi('think', 'merak', 'merak'); } else { p.dizi('bulus'); hepsi('thumbs', 'joy', 'selam'); } });
    GAME.on('happy', e => { const p = P(); if (!p) return; if (e && e.boss) { p.dizi(e.type === 'unutulanKralTonton' ? 'kralIsim' : 'bulus'); hepsi('cheer', 'joy', 'selam'); hala('mutlu', 3); } else { p.sevin(1.6); if (Math.random() < .5) p.alkis(1.1); else p.donus && p.donus(1.1); } });
    GAME.on('isikDegdi', () => { const p = P(); if (!p) return; p.dizi('bulus'); try { p.takla(); } catch (e) { /* yok */ } hepsi('thumbs', 'joy', 'selam'); });
    GAME.on('dead', () => { const p = P(); if (p) { p.duygu('saskin', 5); endiseT = 5; } hepsi('shrug', 'merak', 'yalvar'); });
    GAME.on('respawn', () => { const p = P(); if (!p) return; p.duyguDur(); p.duygu('gozyasi', 2.2); p.sevin(2); p.alkis(1.2); hepsi('laugh', 'joy', 'selam'); });
    const merak = () => { const p = P(), t = performance.now(); if (p && t - sonHint > 5000) { sonHint = t; p.duygu('merak', 1.5); } };
    GAME.on('area', merak); GAME.on('zone', merak); GAME.on('station', merak); GAME.on('portalOpen', merak);
    GAME.on('yardim', e => { const id = e && e.id; try { if (id === 'baba' && BABA.jest) BABA.jest('thumbs', 3); else if (id === 'kartal' && KARTAL.jest) KARTAL.jest('joy', 3); else if (id === 'bilbo' && BILBO.jest) BILBO.jest('happy', 2.5); } catch (er) { /* yok */ } const p = P(); if (p && id !== 'piril_koruma') p.sevin(1.2); });
    GAME.on('victory', () => { const p = P(); if (p) { p.dizi('bulus'); p.takla(); } hepsi('cheer', 'joy', 'selam'); hala('mutlu', 5); });
    for (const k of ['ingredient', 'cakeDeco', 'gift']) GAME.on(k, () => hala('mutlu', 2.5));
    GAME.on('sinematik', e => { if (e && e.on) { const p = P(); if (p) p.duygu('merak', 1.5); } });
  }
  const iv = setInterval(() => { if (typeof GAME !== 'undefined' && GAME.on) { clearInterval(iv); kur(); } }, 300);
})();
