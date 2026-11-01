/* ── 3. bölüm: Huysuz Orman — huysuzlar + boss Kral Jöle (Feza ile Pırıl: Büyük Fener) ──
   Sahibi: B3 (orman bölüm ajanı). Kaynak görünüm: feza-bilbo/huysuz (jöle, huysuz mantar, yarasa, haylaz goblin, Kral Jöle) — ZENGİN
   modeller motorun 05_enemies.js'inde hazır; burada yeniden çerçevelenir:
     ormanJole      Jöle          yeşil/pembe/mavi/sarı (MOR YOK: mor yalnız Pırıl'ın)         base jole
     ormanMantar    Huysuz Mantar uzaktan spor atar (yerde açık sarı işaret)                   base mantar
     ormanYarasa    Yarasa        minik, hızlı, uçar                                           base yarasa
     ormanGoblin    Haylaz Goblin oyunbaz, kocaman şapka                                       base goblin
     palamutKasif   Palamut Kaşif şapkalı yuvarlak palamut; şerit boyunca kayarak yuvarlanır (yol 1 sn önce soluk çizgi)  base kaymak 'kayan'
     sisPamugu      Sis Pamuğu    küçük uçan pamuk bulutu; yumuşak "pof" topu atar; fener ışığında zayıflar  base kopuk 'uzak'
     kralJole       Kral Jöle     boss: zıplama, tükürme, kasırga, bölünme, minik jöle çağırma, Taç Kovalamaca (motorun kraljole davranışı);
                                  pelerin bordo (mor değil). Neşelenince Orman Işığı (motor: ingredient → PIRIL_GUC.ac(3)).
   Genel ad: HZ_ORMAN. */
const HZ_ORMAN = (() => {
  'use strict';
  const HAS = typeof HUYSUZ !== 'undefined' && HUYSUZ && HUYSUZ.type;
  if (!HAS) return {};
  const EM = typeof EMODEL !== 'undefined' && EMODEL ? EMODEL : null;
  const hasRaw = id => !!(EM && EM.buildRaw) && (id !== 'tohumTopaci' || typeof HZ_MANTAR !== 'undefined');   // (EMODEL.TYPES önceden alınmış kopya: sonradan eklenenler görünmez)

  // ── mor → bordo: köşe renklerinde mor tonları bordoya çevir (Kral'ın pelerini) ──
  function morKaldir(root) {
    if (!root || !root.traverse) return;
    const c = new THREE.Color(), hsl = { h: 0, s: 0, l: 0 };
    root.traverse(o => {
      const g = o.geometry; if (!g || !g.attributes || !g.attributes.color || g.userData.bordo) return;
      const a = g.attributes.color, n = a.count, sz = a.itemSize;
      for (let i = 0; i < n; i++) {
        c.setRGB(a.getX(i), a.getY(i), a.getZ(i)); c.getHSL(hsl);
        if (hsl.s > 0.28 && hsl.h > 0.69 && hsl.h < 0.87) { hsl.h = 0.985; hsl.s = Math.min(1, hsl.s * 0.95); hsl.l *= 0.92; c.setHSL(hsl.h, hsl.s, hsl.l); a.setXYZ(i, c.r, c.g, c.b); }
      }
      void sz; a.needsUpdate = true; g.userData.bordo = true;
    });
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
  const viaBase = (base, post) => o => {
    const m = EM && EM.build ? EM.build.call(EM, base, o || {}) : null;   // (HUYSUZ sarmalayıcısı kendi tipimizi tanır; taban model için base adını ver)
    if (m && m.root && post) post(m.root, m);
    return m;
  };

  // ── Huysuz tipleri ──
  const BASE = { hp: 0 };
  void BASE;
  HUYSUZ.type('ormanJole', { ad: 'Jöle', base: 'jole', variant: 'green', saldiri: 'yakin', stats: { hp: 20, dmg: 4 }, ilkSoz: 'b03_ilk_jole' });
  HUYSUZ.type('ormanMantar', { ad: 'Huysuz Mantar', base: 'mantar', saldiri: 'uzak', stats: { hp: 24, dmg: 3, atkCd: 3.0, windup: 1.0, shot: { kind: 'spore', speed: 3.6, r: 0.32 } }, ilkSoz: 'b03_ilk_mantar' });
  HUYSUZ.type('ormanYarasa', { ad: 'Yarasa', base: 'yarasa', saldiri: 'ucan', stats: { hp: 12, dmg: 3, speed: 3.6 }, ilkSoz: 'b03_ilk_yarasa' });
  HUYSUZ.type('ormanGoblin', { ad: 'Haylaz Goblin', base: 'goblin', saldiri: 'yakin', stats: { hp: 34, dmg: 5, speed: 2.7 }, ilkSoz: 'b03_ilk_goblin' });
  const kasif = { ad: 'Palamut Kaşif', base: 'kaymak', saldiri: 'kayan', stats: { hp: 22, dmg: 4, speed: 3.0, atkCd: 2.6, windup: 1.0, height: 0.8, r: 0.45 }, ilkSoz: 'b03_ilk_kasif' };
  if (hasRaw('tohumTopaci')) kasif.model = o => EM.buildRaw('tohumTopaci', o || {});   // (palamut gibi tohum topacı: şapkalı yuvarlak palamut)
  HUYSUZ.type('palamutKasif', kasif);
  HUYSUZ.type('sisPamugu', { ad: 'Sis Pamuğu', base: 'kopuk', saldiri: 'uzak', stats: { hp: 16, dmg: 2, speed: 2.0, atkCd: 3.0, windup: 1.0, shot: { kind: 'fizz', speed: 3.2, r: 0.36 } }, ilkSoz: 'b03_ilk_pamuk' });

  // ── Boss: Kral Jöle ──
  const bdef = { ad: 'Kral Jöle', base: 'kraljole',
    lines: { giris: 'b03_kral_giris', bitti: 'b03_kral_bitti', yarim: 'b03_kral_yarim' },
    bossKit: { add: 'ormanJole', at: [0.66, 0.33], n: [3, 3], col: '#5cc8ff', roar: 1.45, bonus: 'tac' },
    model: viaBase('kraljole', (root, m) => { morKaldir(root); renkCanlandir(root, 0.44, 0.58, 1.12, 1.07, 0.25); m.baseType = 'kraljole'; m.type = 'kralJole'; }) };
  HUYSUZ.boss('kralJole', bdef);

  HUYSUZ.zone('orman', { enemies: { ormanJole: 4, ormanMantar: 2.5, ormanYarasa: 2, ormanGoblin: 2, palamutKasif: 2, sisPamugu: 1.5 },
    elites: ['ormanJole', 'ormanGoblin'], variants: { ormanJole: ['green', 'pink', 'blue', 'muhallebi'] }, boss: 'kralJole' });
  return { morKaldir };
})();
