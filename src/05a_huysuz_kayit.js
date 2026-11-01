/* ── Huysuz kaydı (Dev Ev Macerası) ──
   Normal huysuzlar src/05h_huysuzlar.js'te, bosslar src/05b_bosslar.js'te bu kayıtla tanımlanır:
     HUYSUZ.type(id, tanım)   normal huysuz          HUYSUZ.boss(id, tanım)   boss
     HUYSUZ.zone(bolumId, { enemies: {id: adet}, elites: [id], variants: {id: [varyant]}, boss: id })
   Tanım: { ad, base (davranış/yer tutucu model için eski tip: 'jole', 'goblin', 'kraljole'…), variant, saldiri, boyut,
            stats: {EDEF alanları: hp, dmg, speed, r, height, atkRange, atkCd, windup, aggro, shot…}, model(o) → EMODEL sözleşmesi,
            lines: {giris, bitti, yarim} (boss), ilkSoz (ilk görüşte söylenecek ses anahtarı), bossKit: {…07_game BOSS_KIT alanları} }
   saldiri: 'yakin' | 'uzak' | 'ziplayan' | 'yuvarlanan' | 'kayan' | 'agir' | 'kazici' | 'ucan' (EDEF.kind'e çevrilir).
   Kayıt EDEF'e yazılır, EMODEL.build sarılır (model() yoksa base'in modeli kullanılır); 07_game başlarken HUYSUZ.each ile
   tipin davranış tablolarını base'den kopyalar (GAME tarafı: aliasType). Ayrıntı: src/SPEC.md › "Dev Ev API". */
const HUYSUZ = (() => {
  'use strict';
  const T = {}, Z = {};
  const KIND = { yakin: 'melee', uzak: 'ranged', ziplayan: 'hop', yuvarlanan: 'roll', kayan: 'glide', agir: 'slam', kazici: 'burrow', ucan: 'melee' };
  function reg(id, def, boss) {
    const d = T[id] = Object.assign({ base: boss ? 'kraljole' : 'jole' }, def, { id, boss: !!boss });
    if (typeof EDEF !== 'undefined' && EDEF) {
      const st = Object.assign({}, EDEF[d.base] || {}, d.stats || {});
      if (d.ad) st.ad = d.ad;
      if (boss) st.kind = 'boss';
      else if (d.saldiri && KIND[d.saldiri]) { st.kind = KIND[d.saldiri]; if (d.saldiri === 'ucan') { st.fly = true; st.hover = st.hover || 0.8; } }
      if (d.lines) st.lines = Object.assign({}, st.lines || {}, d.lines);
      EDEF[id] = st;
    }
    return d;
  }
  const type = (id, def) => reg(id, def, false);
  const boss = (id, def) => reg(id, def, true);
  // Repeated calls for the same room MERGE (several files may add types to one room): enemies / variants per id, elites as a set; scalars override.
  function zone(zid, o) {
    const z = Z[zid] || (Z[zid] = {});
    for (const k in o) {
      const v = o[k];
      if (k === 'elites' && Array.isArray(v)) z.elites = Array.from(new Set((z.elites || []).concat(v)));
      else if ((k === 'enemies' || k === 'variants') && v && typeof v === 'object') z[k] = Object.assign({}, z[k] || {}, v);
      else z[k] = v;
    }
    return z;
  }
  const forZone = zid => Z[zid] || null;
  const get = id => T[id] || null;
  const each = fn => { for (const id in T) fn(id, T[id]); };
  const baseOf = id => (T[id] ? T[id].base : id);


  // G6: yumuşak belirme (patlama yok: 0,5 sn'de hafif taşarak büyür), "fark etti" şaşkınlığı (gözler iri, kaşlar kalkık), neşelenince kalpler
  const easeBack = u => { const c = 1.9, x = u - 1; return 1 + (c + 1) * x * x * x + c * x * x; };
  function wrapAnim(m) {
    m._gAnim = 1;
    const a0 = m.anim, base = m.mesh.scale.x, S = { age: 0, notice: -1, seen: false, hearts: false };
    m.anim = function (dt, st) {
      a0.call(m, dt, st);
      S.age += dt;
      if (S.age < 0.55) m.mesh.scale.setScalar(base * (0.25 + 0.75 * Math.max(0, easeBack(Math.min(1, S.age / 0.55)))));
      else if (S.age < 0.6) m.mesh.scale.setScalar(base);
      if (!st) return;
      const dying = st.dying >= 0;
      if (!S.seen && !dying && (st.move > 0.6 || st.windup >= 0 || st.attack >= 0) && S.age > 0.8) { S.seen = true; S.notice = 0; }
      if (S.notice >= 0) {
        S.notice += dt;
        const u = S.notice / 0.45;
        if (u >= 1) S.notice = -1;
        else if (m.B && m.B.eyes && m.s.mood !== 'happy') {
          const k = Math.sin(Math.PI * Math.min(1, u * 1.3)); m.B.eyes.scale.y *= 1 + 0.3 * k; m.B.eyes.scale.x *= 1 + 0.12 * k;
          if (m.B.brow) m.B.brow.position.y += 0.05 * k * m.height / (base || 1);
        }
      }
      if (dying && !S.hearts) {
        S.hearts = true;
        try { if (typeof FX !== 'undefined' && FX && FX.burst) { const p = m.root.position; FX.burst('hearts', p.x, p.y + m.height * 0.8, p.z, { count: 6, scale: 0.7 }); } } catch (e) { /* yok */ }
      }
    };
  }

  // EMODEL.build sarmalayıcı: kayıtlı tip → kendi model() kurucusu ya da base modeli (+ boyut ölçeği)
  if (typeof EMODEL !== 'undefined' && EMODEL && EMODEL.build) {
    const build0 = EMODEL.build, warm0 = EMODEL.warm;
    EMODEL.build = function (t, o = {}) {
      const d = T[t];
      if (!d) return build0(t, o);
      let m = null;
      if (typeof d.model === 'function') { try { m = d.model(o); } catch (e) { console.warn('[HUYSUZ] model ' + t, e); } }
      if (!m || !m.root) m = build0(d.base, Object.assign({}, o, { variant: o.variant || d.variant }));
      if (m && !d.model) { m.baseType = m.type || d.base; m.type = t; }   // (yer tutucu model: UI boss portresi bu tip için çizsin)
      const s = d.boyut || 1;
      if (s !== 1 && m && m.root && !m._boyut) { m._boyut = 1; m.root.scale.multiplyScalar(s); if (m.height) m.height *= s; if (m.radius) m.radius *= s; }
      // G6: kamera yukarıdan baktığı için küçük huysuzlar ekranda çok ufaktı (Feza'nın yarısı); yüzleri okunsun diye yalnız GÖRÜNTÜ %30 büyür
      // (çarpışma yarıçapı değişmez). Bosslar zaten büyük: dokunulmaz.
      if (m && m.root && !d.boss && !m._gorsel && m.mesh && m.mesh.scale) { m._gorsel = 1; m.mesh.scale.multiplyScalar(HUYSUZ.GORSEL); if (m.height) m.height *= HUYSUZ.GORSEL; }
      if (m && m.root && !d.boss && !m._gAnim && m.anim && m.mesh && m.mesh.scale) wrapAnim(m);
      return m;
    };
    if (warm0) EMODEL.warm = function (types, compile, variants) {
      return warm0((types || []).map(tv => { const [t, v] = String(tv).split(':'); return T[t] && !T[t].model ? T[t].base + (v ? ':' + v : '') : tv; }), compile, variants);
    };
  }
  return { type, boss, zone, forZone, get, each, baseOf, KIND, GORSEL: 1.3 };
})();
