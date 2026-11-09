/* ── Bölüm kaydı (Feza ile Pırıl: Kayıp Ejderha Işıkları) ──
   Her bölüm kendi dosyasında (src/06z_<id>.js) BOLUM.define('<id>', {...}) ile kendini kaydeder; 06_level.js bu kayıtlardan
   ZONES listesini kurar ve LEVEL.build() bölümün kur() kancasını çağırır. Biçim ve kancalar: src/SPEC.md › "Dev Ev API".
   Genel adlar: ZONE_DEFS (id → tanım), BOLUM (kayıt yardımcıları). */
const ZONE_DEFS = {};
const BOLUM = (() => {
  'use strict';
  // Harita / kayıt sırası. Bir kimliğin yeri kayıttaki bölge numarasıdır: sırayı değiştirme, sona ekle.
  // yuva = merkez (Uyku Yuvası, hub), oyun buradan başlar; bölümler SIRAYLA açılır (PIRIL.md › 2)
  const ORDER = ['mantar', 'mercan', 'col', 'atolye', 'gokkusagi'];   // (Uyku Yuvası kaldırıldı: oyun doğrudan Mantar'da başlar)
  const FINAL = 'fener';
  const NEED = 4;   // final için gereken ışık sayısı
  const DEF = {
    ad: 'Bölüm', taban: 'bathroom', size: 90, rooms: 6, side: 2,
    muzik: 'pr_menu', line: null, final: false, malzeme: null, kayipEsya: null,
    isik: null, minimap: null, harita: null,
    huysuzlar: { jole: 4 }, elitler: ['jole'], varyantlar: null, boss: null,
    hpMult: 1, dmgMult: 1, xpMult: 1, gold: 1, ilvl: 1,
  };
  function define(id, def) {
    if (!ORDER.includes(id)) ORDER.push(id);
    const d = ZONE_DEFS[id] = Object.assign({}, ZONE_DEFS[id] || {}, def, { id });
    return d;
  }
  const get = id => ZONE_DEFS[id] || null;
  // Düşman listesi ve boss: önce HUYSUZ kaydı (src/05a_huysuz_kayit.js), yoksa bölüm tanımındaki yedek liste.
  function enemyList(id, d) {
    const H = typeof HUYSUZ !== 'undefined' && HUYSUZ && HUYSUZ.forZone ? HUYSUZ.forZone(id) : null;
    return {
      enemies: (H && H.enemies && Object.keys(H.enemies).length ? H.enemies : d.huysuzlar) || DEF.huysuzlar,
      elites: (H && H.elites && H.elites.length ? H.elites : d.elitler) || [],
      variants: (H && H.variants) || d.varyantlar || undefined,
      boss: (H && H.boss) || d.boss || null,
    };
  }
  // 06_level.js çağırır: GAME/LEVEL/UI'nin beklediği eski ZONES biçimi.
  function zones() {
    return ORDER.filter(id => ZONE_DEFS[id]).map(id => {
      const d = Object.assign({}, DEF, ZONE_DEFS[id]), e = enemyList(id, d);
      // alanlar: [{ id, ad, rooms: oda sayısı (≥1) }] → ana oda zinciri alanlara bölünür, en sonda boss arenası
      let rooms = d.rooms, areaStarts = null;
      if (Array.isArray(d.areas) && d.areas.length && !d.hub) {
        areaStarts = []; let k = 0;
        for (const a of d.areas) { areaStarts.push(k); k += Math.max(1, a.rooms | 0 || 2); }
        rooms = k + 1;
      }
      return {
        id, ad: d.ad, theme: d.taban === 'mabet' ? 'moon' : d.taban, line: d.line, music: d.muzik, size: d.size, rooms, side: d.side, hub: !!d.hub,
        areas: areaStarts ? d.areas : null, areaStarts,
        enemies: e.enemies, elites: e.elites, variants: e.variants, boss: d.hub ? null : e.boss,
        hpMult: d.hpMult, dmgMult: d.dmgMult, xpMult: d.xpMult, gold: d.gold, ilvl: d.ilvl,
        lowGravity: !!d.lowGravity, yoldas: d.yoldas || [], kamera: d.kamera || null,
        final: id === FINAL || !!d.final, malzeme: d.malzeme, kayipEsya: d.kayipEsya, def: ZONE_DEFS[id],
      };
    });
  }
  // Pırıl (ebeveyn): haritadan İSTENEN bölüme gidilir — kilit yok; sıradaki önerilen bölüm haritada parlar.
  function isOpen() { return true; }

  // Ortak yer tutucu görünüm (bölüm ajanı kendi kur() fonksiyonuyla değiştirir): yürünür alanın kenarına alçak bordür,
  // odaların çevresinde ev ölçeğinde dev kutular (kamera tarafı = güney: alçak), çıkış kapısının arkasında dev bir oda kapısı.
  function yerTutucu(L, api, o = {}) {
    const rnd = api.rnd, cols = o.kutu || [0xe8c9a0, 0xcfa27a, 0xf2dcc0, 0xb98a68];
    api.dreamEdge();
    for (const rm of L.rooms) {
      for (let k = 0; k < 7; k++) {
        const a = k * Math.PI * 2 / 7 + rnd() * 0.4, rad = (rm.r || Math.max(rm.hw, rm.hh)) + 3.5 + rnd() * 2;
        const x = rm.x + Math.sin(a) * rad, z = rm.z + Math.cos(a) * rad;
        if (api.isFloor(x, z) || api.linkDist(x, z) < 4) continue;
        const south = z > rm.z + 1, w = 2.5 + rnd() * 3.5, d = 2.5 + rnd() * 3, h = south ? 0.5 + rnd() * 0.5 : 2.5 + rnd() * 4;
        if ([[w, 0], [-w, 0], [0, d], [0, -d]].some(([dx, dz]) => api.isFloor(x + dx * 0.55, z + dz * 0.55))) continue;
        api.box(x, h / 2, z, w, h, d, cols[k % cols.length], rnd() * 0.5 - 0.25);
      }
    }
    const ex = L.exit || L.crystalSpot;
    if (ex) {   // dev oda kapısı (çıkış): kanat + çerçeve + topuz
      const c = o.kapi || 0xf6efe4;
      api.box(ex.x, 3.6, ex.z - 1.6, 4.6, 7.2, 0.3, c, 0);
      api.box(ex.x - 2.45, 3.7, ex.z - 1.5, 0.3, 7.4, 0.45, 0xffffff, 0);
      api.box(ex.x + 2.45, 3.7, ex.z - 1.5, 0.3, 7.4, 0.45, 0xffffff, 0);
      api.box(ex.x, 7.45, ex.z - 1.5, 5.2, 0.3, 0.45, 0xffffff, 0);
      api.ball(ex.x + 1.7, 3.2, ex.z - 1.35, 0.22, 0.22, 0.22, 0xf2c44a);
      api.glow(ex.x, ex.z, 3, 0xfff0c0, 0.12);
    }
    for (const rm of L.rooms) api.glow(rm.x, rm.z, (rm.r || 6) * 0.9, o.isik || 0xfff2dc, 0.08);
  }
  // Oda bölümleri için varsayılan 3 alt alan (bölüm dosyası kendi areas listesini verebilir)
  const UC_ALAN = (a, b, c) => [{ id: 'a1', ad: a, rooms: 2 }, { id: 'a2', ad: b, rooms: 2 }, { id: 'a3', ad: c, rooms: 2 }];
  return { ORDER, FINAL, NEED, define, get, zones, isOpen, yerTutucu, UC_ALAN };
})();

/* ── ZEMIN: ortak zemin + zemin örtüsü kiti (G1) ──
   Her bölümün zemini aynı kitle kurulur: katmanlı yordamsal malzemeler (çimen/yosun, çakıl, taş levha, kum, toprak, yaprak, kaya),
   geniş ölçekli ton değişimi, yumuşak yol ve kenar geçişleri, vuruş (bump) aydınlatması, prop altı gölgesi (AO), ve örnekli (instanced)
   zemin örtüsü (ot, çiçek, çakıl, mini mantar, eğrelti, deniz kabuğu...) – hafifçe sallanır, Feza yaklaşınca eğilir, yola girmez.
   Kullanım: ZEMIN.kur(L, api, 'mantar') (zemini kurar/değiştirir), ZEMIN.son(L, B, api) (örtüyü serpiştirir; LEVEL otomatik çağırır).
   Yeni tema eklemek: ZEMIN.TEMA.<id> = {...}. */
const ZEMIN = (() => {
  'use strict';
  const OTO = ['orman', 'magara', 'mabet', 'kale', 'fener', 'mercan', 'yanardag', 'sehir'];   // motorun kendi zemini yerine kit kullanılan bölümler
  // tip: 0 çimen/yosun · 1 çakıl · 2 taş levha · 3 kum · 4 toprak · 5 yaprak · 6 kaya · 7 arnavut taşı · 8 sap/anız
  const TEMA = {
    mantar: { base: [0, 0x1b5a57, 0x3c8f6a, 0x8cb25c], alt: [4, 0x3a2b36, 0x5e4a48, 0x8c7c70], path: [1, 0x6e5a3a, 0xc9b27c, 0xe0d0a0], rim: 0x2f6a45, pmoss: 0.6, out: 0x0f3338, outK: 0.5,
      macro: [0xd6c4ff, 0xc2ffd8], patch: 0.28, bump: 0.05, dapple: [0xfff0b0, 0.14], rough: 0.92,
      cover: [{ k: 'tuft', n: 20000, z: 'both', col: [0x2f8a63, 0x4fae6e, 0x7cc46a, 0x2a7a78, 0x3a9a5a], s: [0.85, 1.55], hOut: 1.8 },
        { k: 'flower', n: 900, z: 'both', col: [0xfff2a0, 0xffb0d0, 0xffffff, 0xcdb8ff, 0xffc890], s: [0.9, 1.5], clump: 0.62 },
        { k: 'pebble', n: 800, z: 'both', col: [0x9a95ab, 0xb8b0a0, 0x7d8a8a, 0xc4bcc8], s: [0.7, 1.7], edge: true },
        { k: 'mush', n: 420, z: 'both', col: [0xff9ec4, 0xfff0d0, 0x9fd8ff, 0xffc27a, 0xd2b0ff], s: [0.8, 1.9], clump: 0.6, glow: 0.45 },
        { k: 'fern', n: 260, z: 'out', col: [0x1f6a4a, 0x2f8a55, 0x3a9a6a], s: [1.0, 1.8] }] },
    orman: { base: [0, 0x3a7a2a, 0x78b83c, 0xb6d460], alt: [5, 0x7a4a22, 0xc67a2c, 0xe2a645], path: [4, 0x8c6440, 0xcc9e68, 0xa88460], rim: 0x5e4428, out: 0x1c4a1a, outK: 0.55,
      macro: [0xfff0a0, 0xd0ffb0], patch: 0.3, bump: 0.05, dapple: [0xfff4b0, 0.2], rough: 0.92,
      cover: [{ k: 'tuft', n: 6500, z: 'both', col: [0x3f8f2f, 0x62b040, 0x86c84c, 0x2f7a34], s: [0.8, 1.5], hOut: 1.8, clump: 0.5 },
        { k: 'flower', n: 800, z: 'both', col: [0xffffff, 0xffe45a, 0xff7a7a, 0xffa0d0, 0xa8c8ff], s: [0.9, 1.5], clump: 0.6 },
        { k: 'pebble', n: 500, z: 'both', col: [0x9a9486, 0xb8b0a0, 0x7e8678], s: [0.7, 1.6], edge: true },
        { k: 'mush', n: 300, z: 'both', col: [0xd8483a, 0xc8905a, 0xfff0d8], s: [0.9, 2.0], clump: 0.6 },
        { k: 'fern', n: 240, z: 'both', col: [0x2f7a34, 0x4a9a3c, 0x62b040], s: [1.0, 1.9] },
        { k: 'leaf', n: 650, z: 'both', col: [0xe08a2a, 0xd8b030, 0xb84a24, 0x7aa83a], s: [0.8, 1.5], clump: 0.55 }] },
    mercan: { base: [3, 0xd6bd86, 0xf0dca8, 0xfff4d8], alt: [1, 0x9eb4ac, 0xd4e0cc, 0xf0c4be], path: [7, 0xc8a58c, 0xf6d9c4, 0xffd2dc], rim: 0x9a7c68, out: 0x2a7078, outK: 0.55,
      macro: [0xfff0c8, 0xc8f4ff], patch: 0.3, bump: 0.04, dapple: [0xdcf8ff, 0.22], caustic: 0.25, rough: 0.85,
      cover: [{ k: 'tuft', n: 6000, z: 'both', col: [0x2fa088, 0x48c0a0, 0x78d8a8, 0x3a8a9a], s: [0.8, 1.6], hOut: 1.9, clump: 0.5 },
        { k: 'shell', n: 700, z: 'both', col: [0xffd0d8, 0xfff0d0, 0xffc8a0, 0xf0e0ff, 0xffffff], s: [0.8, 1.7], clump: 0.6 },
        { k: 'star', n: 220, z: 'both', col: [0xff9a7a, 0xffc060, 0xff8ab0], s: [0.9, 1.5], clump: 0.7 },
        { k: 'pebble', n: 700, z: 'both', col: [0xd8d0c4, 0xb8c8c4, 0xe8d0c0, 0xa8b8b8], s: [0.6, 1.5], edge: true },
        { k: 'mush', n: 300, z: 'both', col: [0xff8aa8, 0xffb070, 0xc890ff, 0x70d8d0], s: [1.0, 2.3], clump: 0.6, glow: 0.3 },
        { k: 'fern', n: 200, z: 'out', col: [0x2f9a88, 0x48c0a0], s: [1.0, 1.9] }] },
    degirmen: { base: [8, 0xb4963a, 0xe4c658, 0xf4e08c], alt: [0, 0x68983a, 0x9ec250, 0xc2da7c], path: [4, 0xa27c52, 0xd8b88a, 0xc09a72], rim: 0x7a5c38, out: 0x8c7c32, outK: 0.6,
      macro: [0xfff0a0, 0xffd890], patch: 0.3, bump: 0.05, dapple: [0xfff6c0, 0.16], rough: 0.92,
      cover: [{ k: 'wheat', n: 7000, z: 'both', col: [0xe8c458, 0xd8b040, 0xf2d878, 0xc8a038], s: [0.9, 1.5], hOut: 1.9, clump: 0.45 },
        { k: 'tuft', n: 3500, z: 'both', col: [0x7aa83a, 0x9cc250, 0xb8c85c], s: [0.8, 1.4], clump: 0.5 },
        { k: 'flower', n: 900, z: 'both', col: [0xff5a4a, 0x6a9aff, 0xffffff, 0xffe05a], s: [0.9, 1.5], clump: 0.6 },
        { k: 'pebble', n: 450, z: 'both', col: [0xb8a888, 0xa89878, 0xc8b898], s: [0.7, 1.5], edge: true }] },
    magara: { base: [6, 0x3a3e54, 0x6a708a, 0x80a0a4], alt: [0, 0x1c5a58, 0x3a9a88, 0x72d2b4], path: [7, 0x8a7e72, 0xc8b8a0, 0xe0d2b8], rim: 0x4a4238, out: 0x080a14, outK: 0.5,
      macro: [0x9cc0ff, 0xb0ffe0], patch: 0.34, bump: 0.06, dapple: [0xa0d0ff, 0.12], rough: 0.8,
      cover: [{ k: 'tuft', n: 5000, z: 'both', col: [0x2a8a78, 0x3aa890, 0x58c8a8, 0x2a7a6a], s: [0.8, 1.4], hOut: 1.6, clump: 0.5 },
        { k: 'pebble', n: 900, z: 'both', col: [0x6a708a, 0x8a90a8, 0x586070, 0xa0a8b8], s: [0.7, 1.9], edge: true },
        { k: 'mush', n: 380, z: 'both', col: [0x70e0ff, 0xff90e0, 0xa0ffd0, 0xffe090], s: [0.8, 1.9], clump: 0.6, glow: 0.7 },
        { k: 'shard', n: 150, z: 'both', col: [0x70d8ff, 0xff9ae0, 0xa0ffd8], s: [0.7, 1.6], clump: 0.7, glow: 0.8 },
        { k: 'fern', n: 140, z: 'out', col: [0x2a8a78, 0x3aa890], s: [1.0, 1.8] }] },
    mabet: { base: [2, 0xa09c8e, 0xd8d2bc, 0xe6e0cc], alt: [6, 0x726e62, 0xaaa492, 0xc4bea8], path: [7, 0x9e957e, 0xe4dcc4, 0xf4eed8], rim: 0x6a6a52, pmoss: 0.35, out: 0x4a483e, outK: 0.55,
      macro: [0xfff6e0, 0xe0ecff], patch: 0.28, bump: 0.05, dapple: [0xe8f0ff, 0.16], rough: 0.85,
      cover: [{ k: 'tuft', n: 3500, z: 'both', col: [0x5a8a4a, 0x7aa85a, 0x4a7a50, 0x8ab868], s: [0.7, 1.3], hOut: 1.7, clump: 0.42 },
        { k: 'flower', n: 450, z: 'both', col: [0xa8c8ff, 0xffffff, 0xd8c8ff], s: [0.8, 1.3], clump: 0.6 },
        { k: 'pebble', n: 1100, z: 'both', col: [0xa8a496, 0xc8c2b0, 0x8a8678, 0xd8d2c0], s: [0.7, 1.9], edge: true },
        { k: 'leaf', n: 300, z: 'both', col: [0xb8a060, 0xc8b070, 0x8a9a58], s: [0.8, 1.3], clump: 0.5 },
        { k: 'fern', n: 160, z: 'out', col: [0x4a7a50, 0x5a8a4a], s: [1.0, 1.7] }] },
    kale: { base: [2, 0x9c9888, 0xd2ccb8, 0xe2dcc8], alt: [0, 0x58784a, 0x88a860, 0xa8c47c], path: [7, 0xb09c7c, 0xe6d6b0, 0xf4e6c4], rim: 0x7a6a50, out: 0x40483a, outK: 0.55,
      macro: [0xfff2dc, 0xe8f0e0], patch: 0.2, bump: 0.05, dapple: [0xfff0d8, 0.14], rough: 0.85,
      cover: [{ k: 'tuft', n: 4000, z: 'both', col: [0x5a8a48, 0x7aa858, 0x92b868], s: [0.7, 1.3], hOut: 1.7, clump: 0.42 },
        { k: 'flower', n: 600, z: 'both', col: [0xffe45a, 0xffffff, 0xff9ab0, 0xa8c8ff], s: [0.8, 1.4], clump: 0.6 },
        { k: 'pebble', n: 1000, z: 'both', col: [0xa8a496, 0xc8c2b0, 0x908c7e], s: [0.7, 1.8], edge: true },
        { k: 'leaf', n: 250, z: 'both', col: [0xc89a40, 0xb8c05a], s: [0.8, 1.3], clump: 0.5 }] },
    yanardag: { ust: true, outT: 6, base: [6, 0x5a4034, 0x8e6a52, 0xb89472], alt: [4, 0x4a3830, 0x76594a, 0xa08468], path: [7, 0x8a7458, 0xdcc49c, 0xf0dcb8], rim: 0x5a4a3a, out: 0x2e2220, outK: 0.6,
      macro: [0xffe0c0, 0xffd0b0], patch: 0.3, bump: 0.06, dapple: [0xffe0b0, 0.1], rough: 0.88, pmoss: 0.15,
      cover: [{ k: 'tuft', n: 4500, z: 'both', col: [0x8a8a3a, 0xa89a48, 0x6a8a3a, 0xb8a050], s: [0.7, 1.3], hOut: 1.4, clump: 0.45 },
        { k: 'pebble', n: 1800, z: 'both', col: [0x6a5448, 0x8a7060, 0x4e403a, 0xa08a78], s: [0.7, 2.0], edge: true },
        { k: 'flower', n: 450, z: 'both', col: [0xffb04a, 0xff8a5a, 0xffe08a], s: [0.8, 1.3], clump: 0.6 },
        { k: 'mush', n: 220, z: 'both', col: [0xffc27a, 0xffe0b0, 0xd8905a], s: [0.8, 1.7], clump: 0.6 },
        { k: 'fern', n: 140, z: 'out', col: [0x6a8a3a, 0x8a9a48], s: [1.0, 1.6] }] },
    sehir: { outT: 0, base: [7, 0xb89c74, 0xefd9b0, 0xf8ecd0], alt: [0, 0x4a7a38, 0x7ab048, 0xa8cc68], path: [2, 0xc2b08e, 0xf2e6c8, 0xfaf2dc], rim: 0x5a7a42, out: 0x3e6a2a, outK: 0.7, pmoss: 0.5,
      macro: [0xfff0d0, 0xe8f4d0], patch: 0.34, bump: 0.05, dapple: [0xfff2c8, 0.16], rough: 0.88,
      cover: [{ k: 'tuft', n: 7000, z: 'both', col: [0x4a8a38, 0x6aaa44, 0x88c455, 0x3a7a3a], s: [0.7, 1.4], hOut: 1.6, clump: 0.55 },
        { k: 'flower', n: 900, z: 'both', col: [0xffffff, 0xffe45a, 0xff8aa8, 0xa8c8ff], s: [0.8, 1.4], clump: 0.6 },
        { k: 'pebble', n: 800, z: 'both', col: [0xa8a092, 0xc8c0aa, 0x8a8478], s: [0.6, 1.5], edge: true },
        { k: 'leaf', n: 700, z: 'both', col: [0xe08a2a, 0xd8b030, 0xb84a24, 0x8aa83a], s: [0.8, 1.4], clump: 0.55 },
        { k: 'puddle', n: 60, z: 'walk', col: [0x9fc4d8, 0xb0d0e0], s: [0.7, 1.8], clump: 0.7 }] },
    fener: { base: [2, 0x948f84, 0xc8c2ae, 0xdad4c0], alt: [3, 0xc8b88a, 0xe6d8aa, 0xf4eac8], path: [7, 0xb4a07e, 0xe8d8b4, 0xf6ead0], rim: 0x7e6e52, out: 0x3e4448, outK: 0.55,
      macro: [0xfff0d8, 0xd8ecff], patch: 0.32, bump: 0.05, dapple: [0xfff0d0, 0.14], rough: 0.85,
      cover: [{ k: 'tuft', n: 3500, z: 'both', col: [0x6a9a58, 0x8abc68, 0x4a8a6a], s: [0.7, 1.3], hOut: 1.7, clump: 0.42 },
        { k: 'shell', n: 350, z: 'both', col: [0xffd0d8, 0xfff0d0, 0xffffff], s: [0.8, 1.5], clump: 0.6 },
        { k: 'pebble', n: 900, z: 'both', col: [0xb0aca0, 0xd0cabc, 0x90908a], s: [0.7, 1.8], edge: true },
        { k: 'flower', n: 380, z: 'both', col: [0xffffff, 0xffe45a, 0xc8d8ff], s: [0.8, 1.3], clump: 0.6 }] },
  };
  const GL = `
    float zh(vec2 p){ p = fract(p * vec2(.1031, .1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
    float zN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
      return mix(mix(zh(i), zh(i + vec2(1., 0.)), f.x), mix(zh(i + vec2(0., 1.)), zh(i + vec2(1., 1.)), f.x), f.y); }
    float zF(vec2 p){ return zN(p) * .55 + zN(p * 2.03 + 7.1) * .3 + zN(p * 4.1 + 3.7) * .15; }
    // titreme önleyici: zPx = bir pikselin zeminde kapladığı metre (x, z ayrı). Ekranın gösteremeyeceği kadar ince desen (bir hücre < ~2,5 piksel)
    // ortalamasına (0,5) doğru yumuşar; yoksa kamera kayınca karıncalanır. (zMat'tan önce map_fragment'ta bir kez hesaplanır)
    vec2 zPx = vec2(.02);
    float zAA(vec2 f){ vec2 q = f * zPx; return 1. - smoothstep(.3, .7, max(q.x, q.y)); }
    vec3 zV(vec2 p){ vec2 i = floor(p), f = fract(p); float d1 = 8., d2 = 8., id = 0.;
      for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(float(x), float(y)); vec2 o = vec2(zh(i + g), zh(i + g + 17.3));
        vec2 r = g + .12 + .76 * o - f; float d = dot(r, r); if (d < d1) { d2 = d1; d1 = d; id = zh(i + g + 5.1); } else if (d < d2) d2 = d; }
      return vec3(sqrt(d1), sqrt(d2), id); }
    void zMat(int t, vec2 p, vec3 c0, vec3 c1, vec3 c2, out vec3 col, out float h) {
      if (t == 0) {
        float n = zF(p * 5.), a = mix(.5, zN(p * 31.), zAA(vec2(31.))), b = mix(.5, zN(p * 62. + n * 3.), zAA(vec2(62.))), c = mix(.5, zN(p * 17. + 4.3), zAA(vec2(17.))); h = .2 * a + .2 * b + .6 * c;   // (c: ekranda görünen çimen tanesi)
        col = mix(c0, c1, smoothstep(.2, .85, n * .6 + h * .5)); col = mix(col, c2, smoothstep(.62, .9, zF(p * 1.3 + 3.)) * .38); col *= .78 + .42 * h;
      } else if (t == 1) {
        // çakıl: çoğu açık renkli yuvarlak taşlar, aralar hafif gölgeli (eskisi koyu kahve taşlar + simsiyah aralar: çamurlu görünüyordu);
        // ekranın gösteremeyeceği kadar ince aralar uzakta yumuşar (kamera kayınca karıncalanmaz)
        vec3 v = zV(p * 4.6); float e = v.y - v.x; h = smoothstep(.62, .12, v.x) * .7 + smoothstep(0., .3, e) * .3; float k = fract(v.z * 7.3);
        col = mix(c0, c1, .42 + .58 * v.z); col = mix(col, c2, step(.8, k) * .75);
        col *= mix(.97, .76 + .32 * h, zAA(vec2(14.))); col *= .95 + .1 * mix(.5, zN(p * 40.), zAA(vec2(40.)));
      } else if (t == 2) {
        // taş levha: açık, temiz derz çizgileri (eskisi %50 karartıyordu); derz genişliği en az ~1 piksel, uzakta derz yumuşar
        vec3 v = zV(p * 1.05 + vec2(zN(p * .8) * .25)); float e = v.y - v.x, fe = zPx.x * 1.4 + .006; h = smoothstep(0., .13, e) * .75 + mix(.5, zF(p * 11.), zAA(vec2(16.))) * .25;
        col = mix(c0, c1, .25 + v.z * .65 + zN(p * 3.) * .1); col = mix(col, c2, step(.86, fract(v.z * 9.1)) * .5);
        col *= mix(1., .7 + .3 * smoothstep(0., .07 + fe, e), zAA(vec2(7.))) * (.9 + .2 * mix(.5, zN(p * 22.), zAA(vec2(22.))));
        col = mix(col, col * vec3(.8, .9, .72), smoothstep(.05 + fe, .0, e) * .4 * zN(p * 9.));
      } else if (t == 3) {
        float r = zF(p * .9) * 5.; float s = sin((p.x * .6 + p.y * 1.1 + r) * 7.); h = .5 + .22 * s + .2 * mix(.5, zN(p * 50.), zAA(vec2(50.)));
        col = mix(c0, c1, smoothstep(.2, .8, h * .6 + zF(p * 3.) * .4)); col = mix(col, c2, step(.972, zh(floor(p * 55.))) * .9 * zAA(vec2(55.))); col *= .9 + .2 * mix(.5, zN(p * 18.), zAA(vec2(18.)));
      } else if (t == 4) {
        float n = zF(p * 7.), g = mix(.5, zN(p * 41.), zAA(vec2(41.))); h = .5 * n + .5 * g; col = mix(c0, c1, smoothstep(.2, .8, h)); vec3 v = zV(p * 6.5);
        col = mix(col, c2, smoothstep(.22, .1, v.x) * step(.62, v.z)); col *= .85 + .3 * zN(p * 2.3); h += smoothstep(.22, .1, v.x) * step(.62, v.z) * .5;
      } else if (t == 5) {
        vec3 v = zV(p * 6.2); float k = fract(v.z * 3.7); h = smoothstep(0., .5, v.y - v.x) * .6 + .2 * mix(.5, zN(p * 30.), zAA(vec2(30.)));
        vec3 kc = k < .4 ? mix(c0, c1, k / .4) : mix(c1, c2, (k - .4) / .6);   // (yaprak yaprak renk farkı yumuşak; uzakta ortalamaya döner: karıncalanmaz)
        col = mix(c1, kc, .3 + .45 * zAA(vec2(12.))); col *= mix(.92, .7 + .38 * h, zAA(vec2(18.))); col *= .92 + .16 * zF(p * 3.);
      } else if (t == 6) {
        // kaya: çatlaklar ince ve yumuşak (eskisi kalın siyah çizgiler), uzakta kaybolur
        vec3 v = zV(p * 2.1); float e = v.y - v.x, fe = zPx.x * 2.8 + .01; h = mix(.5, zF(p * 9.), zAA(vec2(13.))) * .5 + smoothstep(0., .1, e) * .5;
        col = mix(c0, c1, zF(p * 3. + v.z * 4.)); col = mix(col, c2, smoothstep(.55, .9, zN(p * 1.3)) * .35);
        col *= mix(1., .7 + .33 * smoothstep(0., .07 + fe, e), zAA(vec2(9.))) * (.88 + .24 * mix(.5, zN(p * 26.), zAA(vec2(26.))));
      } else if (t == 7) {
        // arnavut taşı: yuvarlak, açık renkli taşlar; derzler gölge kadar (eskisi %42'ye kadar kararıp çamur gibi duruyordu), derz
        // genişliği ekrana göre (uzakta yumuşar, titremez); derzlerde hafif yosun
        vec3 v = zV(p * 2.5 * vec2(1., 1.25)); float eg = v.y - v.x, fe = zPx.x * 3.2 + .012;
        float gr = smoothstep(0., .06 + fe, eg); h = smoothstep(.66, .16, v.x) * .7 + smoothstep(0., .25, eg) * .3;
        col = mix(c0, c1, .3 + v.z * .6 + .1 * zN(p * 10.)); col = mix(col, c2, step(.85, fract(v.z * 5.3)) * .5);
        col = mix(col, col * vec3(.8, .95, .7), (1. - smoothstep(0., .18, eg)) * smoothstep(.4, .75, zF(p * 3. + 2.)) * .45);
        col *= mix(.95, (.64 + .36 * gr) * (.73 + .36 * h), zAA(vec2(8.))); col *= .95 + .1 * mix(.5, zN(p * 35.), zAA(vec2(35.)));
      } else {
        // saman: ince lif (yalnız çok yakında) + ekranda görünebilen saman çizgileri (küçük saman taneleri ~3 cm × 9 cm + hafif iri saman bantları)
        float sF = mix(.5, zN(vec2(p.x * 95., p.y * 9.)), zAA(vec2(95., 9.)));
        float sM = mix(.5, zN(vec2(p.x * 24., p.y * 9.)), zAA(vec2(24., 9.)));
        float sL = zN(vec2(p.x * 7., p.y * 2.2) + 9.);
        float s = .5 + (sM - .5) * .9 + (sL - .5) * .3 + (sF - .5) * .6, n = zF(p * 4.); h = s; col = mix(c0, c1, s * .55 + n * .55); col = mix(col, c2, smoothstep(.7, .95, zN(p * 2.7)) * .5); col *= .8 + .35 * mix(.5, zN(p * 30.), zAA(vec2(30.)));
      }
    }`;

  // ── yerleşim maskesi: r yol, g yürünür, b AO (prop gölgesi), a yürünür alanın dışında uzaklık (0–1 = 0–12 m) ──
  function maskKur(L) {
    const ppm = 2, pad = 24, W = L.W + pad * 2, H = L.H + pad * 2, tw = W * ppm, th = H * ppm, n = tw * th;
    const R = new Float32Array(n), G = new Float32Array(n), tmp = new Float32Array(n);
    for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) {
      const gi = Math.floor((i + 0.5) / ppm - pad), gj = Math.floor((j + 0.5) / ppm - pad);
      G[j * tw + i] = gi >= 0 && gj >= 0 && gi < L.W && gj < L.H && L.grid[gj * L.W + gi] ? 1 : 0;
    }
    const disc = (x, zz, r) => {
      for (let j = Math.floor((zz - r + pad) * ppm); j <= (zz + r + pad) * ppm; j++) for (let i = Math.floor((x - r + pad) * ppm); i <= (x + r + pad) * ppm; i++) {
        if (i < 0 || j < 0 || i >= tw || j >= th) continue;
        const dx = (i + 0.5) / ppm - pad - x, dz = (j + 0.5) / ppm - pad - zz;
        if (dx * dx + dz * dz < r * r) R[j * tw + i] = 1;
      }
    };
    const P = L.path || [], PW = 1.05;
    for (let k = 1; k < P.length; k++) {
      const a = P[k - 1], b = P[k], l = Math.hypot(b.x - a.x, b.z - a.z), m = Math.max(1, Math.ceil(l / 0.4));
      for (let q = 0; q <= m; q++) disc(a.x + (b.x - a.x) * q / m, a.z + (b.z - a.z) * q / m, PW);
    }
    if (L.start) disc(L.start.x, L.start.z, 2.3);
    for (const c of L.checkpoints || []) disc(c.x, c.z, 2.1);
    if (L.exit) disc(L.exit.x, L.exit.z + 0.6, 2.5);
    const blur = (A, rad, it) => { for (let q = 0; q < it; q++) { tmp.set(A); for (let j = rad; j < th - rad; j++) for (let i = rad; i < tw - rad; i++) { let s = 0; for (let b = -rad; b <= rad; b++) for (let a = -rad; a <= rad; a++) s += tmp[(j + b) * tw + i + a]; A[j * tw + i] = s / ((2 * rad + 1) * (2 * rad + 1)); } } };
    const D = new Float32Array(n); for (let k = 0; k < n; k++) D[k] = G[k] > 0.5 ? 0 : 1e4;
    const c1 = 1 / ppm, c2 = 1.414 / ppm;
    for (let j = 1; j < th - 1; j++) for (let i = 1; i < tw - 1; i++) { const o = j * tw + i; D[o] = Math.min(D[o], D[o - 1] + c1, D[o - tw] + c1, D[o - tw - 1] + c2, D[o - tw + 1] + c2); }
    for (let j = th - 2; j > 0; j--) for (let i = tw - 2; i > 0; i--) { const o = j * tw + i; D[o] = Math.min(D[o], D[o + 1] + c1, D[o + tw] + c1, D[o + tw + 1] + c2, D[o + tw - 1] + c2); }
    blur(R, 1, 2); blur(G, 1, 2);
    const data = new Uint8Array(n * 4);
    for (let k = 0; k < n; k++) { data[k * 4] = Math.round(R[k] * 255); data[k * 4 + 1] = Math.round(G[k] * 255); data[k * 4 + 2] = 0; data[k * 4 + 3] = Math.round(Math.min(1, D[k] / 12) * 255); }
    const tex = new THREE.DataTexture(data, tw, th, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.magFilter = tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.needsUpdate = true;
    const at = (x, zz, c) => { const i = Math.min(tw - 1, Math.max(0, Math.floor((x + pad) * ppm))), j = Math.min(th - 1, Math.max(0, Math.floor((zz + pad) * ppm))); return data[(j * tw + i) * 4 + c] / 255; };
    return { tex, data, tw, th, ppm, pad, W, H, path: (x, zz) => at(x, zz, 0), walk: (x, zz) => at(x, zz, 1), out: (x, zz) => at(x, zz, 3) * 12 };
  }

  function malzeme(L, z, M, eng) {
    const C = h => new THREE.Color(h);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: z.rough || 0.9, metalness: 0 });
    const U = {
      tLay: { value: M.tex }, uLay: { value: new THREE.Vector4(M.pad, M.pad, 1 / M.W, 1 / M.H) }, uTime: TIME.u,
      uT: { value: new THREE.Vector3(z.base[0], z.alt[0], z.path[0]) },
      uB: { value: [C(z.base[1]), C(z.base[2]), C(z.base[3])] }, uA: { value: [C(z.alt[1]), C(z.alt[2]), C(z.alt[3])] }, uP: { value: [C(z.path[1]), C(z.path[2]), C(z.path[3])] },
      uRim: { value: C(z.rim) }, uOut: { value: C(z.out) }, uOutK: { value: z.outK }, uMacA: { value: C(z.macro[0]) }, uMacB: { value: C(z.macro[1]) },
      uPatch: { value: z.patch }, uBump: { value: z.bump }, uDap: { value: C(z.dapple[0]) }, uDapK: { value: z.dapple[1] }, uCaus: { value: z.caustic || 0 }, uPMoss: { value: z.pmoss || 0 }, uOT: { value: z.outT == null ? -1 : z.outT }, uCut: { value: z.ust ? 1 : 0 },
      tGlowM: eng && eng.tGlow ? eng.tGlow : { value: null }, uGInv: { value: new THREE.Vector2(1 / L.W, 1 / L.H) },
    };
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = 'varying vec3 vZW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvZW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = `varying vec3 vZW; uniform sampler2D tLay, tGlowM; uniform vec4 uLay; uniform vec2 uGInv; uniform float uTime, uOutK, uPatch, uBump, uDapK, uCaus, uPMoss, uOT, uCut;
        uniform vec3 uT, uRim, uOut, uMacA, uMacB, uDap; uniform vec3 uB[3], uA[3], uP[3];
        float zH = .5; vec3 zE = vec3(0.);
        ${GL}
        ` + sh.fragmentShader
        .replace('#include <map_fragment>', `
          vec2 p = vZW.xz; vec4 M = texture2D(tLay, (p + uLay.xy) * uLay.zw);
          zPx = vec2(length(vec2(dFdx(p.x), dFdy(p.x))), length(vec2(dFdx(p.y), dFdy(p.y))));
          if (uCut > .5 && texture2D(tGlowM, p * uGInv).a < .9) discard;
          float w1 = zF(p * .31) * 2. - 1., w2 = zN(p * 2.7), m1 = zF(p * .045 + 5.), m2 = zF(p * .16 + 11.);
          vec3 cB, cA, cP; float hB, hA, hP;
          zMat(int(uT.x + .5), p, uB[0], uB[1], uB[2], cB, hB);
          float zpatch = smoothstep(.5, .72, m2 + (hB - .5) * .3 + w1 * .1) * uPatch * 2.;
          vec3 col = cB; float h = hB;
          if (zpatch > .01) { zMat(int(uT.y + .5), p, uA[0], uA[1], uA[2], cA, hA); float pw = clamp(zpatch, 0., 1.); col = mix(cB, cA, pw); h = mix(hB, hA, pw); }
          col *= mix(vec3(1.), mix(uMacA, uMacB, smoothstep(.35, .65, m2)), smoothstep(.3, .7, m1) * .55);
          col *= .82 + .36 * smoothstep(.2, .8, m1 * .6 + m2 * .4);
          float walk = smoothstep(.28, .72, M.g + w1 * .13 + (w2 - .5) * .1);
          // yol: temiz, net kenarlı bir şerit (kenarı yumuşak dalgalı, 1-2 piksel kenar yumuşatma). Eskisi yolun dışına ~yarım metre koyu
          // kahve bir leke ve dağınık koyu taşlar saçıyordu (çamurlu görünüyordu); şimdi kenarda yalnız hafif bir gölge ve birkaç taş
          float pe = M.r + w1 * .07 + (w2 - .5) * .12;
          float pr = smoothstep(.22, .5, pe), fP = fwidth(pe) * .7 + .02;
          float pw2 = smoothstep(.5 - fP, .5 + fP, pe);
          if (pr > .01) {
            zMat(int(uT.z + .5), p, uP[0], uP[1], uP[2], cP, hP);
            cP *= .93 + .12 * zF(p * 1.9 + 4.);
            cP = mix(cP, uRim * vec3(.8, 1.25, .85), uPMoss * .7 * smoothstep(.55, .85, zF(p * 2.3 + 9.)) * (1. - hP) * (1. - smoothstep(.6, .9, M.r) * .6));
            float rimO = pr * (1. - pw2);
            col = mix(col, uRim, rimO * .14) * (1. - .2 * rimO * rimO);
            float scat = 0.;
            if (pe > .36 && pw2 < .99) { vec3 vs = zV(p * 4.6 + 3.1); scat = step(.7, vs.z) * smoothstep(.5, .28, vs.x) * smoothstep(.36, .47, pe) * (1. - pw2); }   // (yolun içinde 9 hücrelik arama yapılmaz)
            float lip = pw2 * (1. - smoothstep(.5, .58 + fP, pe));
            col = mix(col, cP * (1. - .1 * lip), max(scat * .9, pw2)); h = mix(h, hP, max(scat, pw2));
          }
          if (uOT > -.5 && walk < .98) { vec3 cO; float hO; zMat(int(uOT + .5), p, uA[0], uA[1], uA[2], cO, hO); float kw = smoothstep(.3, .9, walk); col = mix(cO * mix(vec3(1.), uMacB, .3), col, kw); h = mix(hO, h, kw); }
          col = mix(col * uOut * 2.4 * uOutK + uOut * .15, col, walk);
          col *= mix(1., uOutK + .35, smoothstep(.0, .9, M.a) * (1. - walk));
          float dap = smoothstep(.58, .78, zF(p * .2 + vec2(uTime * .01, 0.)) + zN(p * .9) * .12);
          col = mix(col, col * (1. + uDap * 1.4), dap * uDapK * walk);
          col *= 1. - M.b * .62;
          if (uCaus > 0.) { vec2 q = p * .55; float c1 = abs(sin(q.x * 3. + zN(q + uTime * .12) * 5. + uTime * .6)), c2 = abs(sin(q.y * 3.3 + zN(q * 1.3 - uTime * .1) * 5. - uTime * .5));
            float cc = pow(1. - min(c1, c2), 6.); zE += uDap * cc * uCaus * .35 * walk; }
          zH = h;
          diffuseColor.rgb *= col;`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
          { vec3 zS1 = dFdx(-vViewPosition), zS2 = dFdy(-vViewPosition), zR1 = cross(zS2, normal), zR2 = cross(normal, zS1); float zDet = dot(zS1, zR1);
            float zFd = 1. - smoothstep(14., 42., length(vViewPosition)); float zDx = dFdx(zH) * uBump * zFd, zDy = dFdy(zH) * uBump * zFd;
            vec3 zG = sign(zDet) * (zDx * zR1 + zDy * zR2); normal = normalize(abs(zDet) * normal - zG); }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          totalEmissiveRadiance += zE + texture2D(tGlowM, vZW.xz * uGInv).rgb * 3. * (diffuseColor.rgb + .07);`);
    };
    mat.customProgramCacheKey = () => 'zemin-kit';
    mat.userData.u = {};   // (bölümlerin eski zemin kancaları için boş: onlar `U.tA` yoksa dokunmaz)
    mat.userData.Z = U;
    return mat;
  }

  function kur(L, api, id) {
    if (!L) return null;
    if (L._zemin) return L._zemin;
    const z = TEMA[id] || TEMA.mantar, eng = L._engU || (api.floor && api.floor.material && api.floor.material.userData && api.floor.material.userData.u);
    const M = maskKur(L), mat = malzeme(L, z, M, eng);
    api.dispose(M.tex); api.dispose(mat);
    const g = new THREE.PlaneGeometry(L.W + 150, L.H + 150); g.rotateX(-Math.PI / 2); g.translate(L.W / 2, 0, L.H / 2); api.dispose(g);
    let mesh = z.ust ? null : api.floor;
    if (mesh) { mesh.geometry = g; mesh.material = mat; } else { mesh = new THREE.Mesh(g, mat); mesh.name = 'zemin'; if (z.ust) { mesh.position.y = 0.004; mat.polygonOffset = true; mat.polygonOffsetFactor = 0; mat.polygonOffsetUnits = -2; } api.add(mesh); }   // (iPad: 4 mm üstteki kat alttaki lav zeminiyle titreşmesin)
    mesh.receiveShadow = true;
    L._zemin = { id, z, M, mesh, mat };
    return L._zemin;
  }
  function otomatik(L) { return !!(L && L.Z && !L._title && !L.Z.hub && OTO.includes(L.Z.id) && TEMA[L.Z.id]); }

  // ── zemin örtüsü ────────────────────────────────────────────────────────────────────────────
  const TAU = Math.PI * 2;
  function geoOf(kind) {
    const pos = [], nor = [], col = [], hd = [];
    const tri = (a, b, c, ca, cb, cc, h = 1) => {
      for (const [p, c0] of [[a, ca], [b, cb], [c, cc]]) { pos.push(p[0], p[1], p[2]); col.push(c0, c0, c0); hd.push(h); nor.push(0, 1, 0); }
    };
    let seed = 7; const rr = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    if (kind === 'tuft' || kind === 'wheat') {
      const W8 = kind === 'wheat', nb = W8 ? 8 : 7, hgt = W8 ? 0.62 : 0.32, rad = W8 ? 0.07 : 0.1, lean = W8 ? 0.08 : 0.14, w = W8 ? 0.016 : 0.032;
      for (let i = 0; i < nb; i++) {
        const a = i / nb * TAU + rr() * 0.6, hh = hgt * (0.65 + 0.4 * rr()), r0 = rad * (0.2 + 0.8 * rr()), ln = lean * (0.6 + 0.8 * rr());
        const ox = Math.cos(a), oz = Math.sin(a), tx = -oz, tz = ox, cx = ox * r0, cz = oz * r0;
        const bl = [cx - tx * w, 0, cz - tz * w], br = [cx + tx * w, 0, cz + tz * w];
        const my = hh * 0.55, mxo = ln * 0.4, ml = [cx + ox * mxo - tx * w * 0.75, my, cz + oz * mxo - tz * w * 0.75], mr = [cx + ox * mxo + tx * w * 0.75, my, cz + oz * mxo + tz * w * 0.75];
        const tp = [cx + ox * ln, hh, cz + oz * ln];
        tri(bl, br, ml, 0.5, 0.5, 0.85); tri(br, mr, ml, 0.5, 0.85, 0.85); tri(ml, mr, tp, 0.85, 0.85, 1.12);
        if (W8) tri([tp[0] - tx * w * 1.8, hh * 0.8, tp[2] - tz * w * 1.8], [tp[0] + tx * w * 1.8, hh * 0.8, tp[2] + tz * w * 1.8], [tp[0] + ox * 0.01, hh * 1.16, tp[2] + oz * 0.01], 1.0, 1.0, 1.25);
      }
    } else if (kind === 'flower') {
      const st = 0.2;
      for (const a of [0, Math.PI / 2]) { const c = Math.cos(a) * 0.006, s = Math.sin(a) * 0.006; tri([-c, 0, -s], [c, 0, s], [0, st, 0], 0.5, 0.5, 0.9, 0); }
      for (const sd of [-1, 1]) tri([0, st * 0.35, 0], [sd * 0.05, st * 0.5, 0.01], [0.0, st * 0.5, 0.012], 0.7, 0.9, 0.7, 0);
      const n = 6, R = 0.055;
      for (let i = 0; i < n; i++) {
        const a0 = i / n * TAU, a1 = (i + 0.5) / n * TAU, a2 = (i + 1) / n * TAU;
        tri([0, st + 0.004, 0], [Math.cos(a0) * R * 0.5, st, Math.sin(a0) * R * 0.5], [Math.cos(a1) * R, st - 0.012, Math.sin(a1) * R], 1.15, 1.0, 0.95, 1);
        tri([0, st + 0.004, 0], [Math.cos(a1) * R, st - 0.012, Math.sin(a1) * R], [Math.cos(a2) * R * 0.5, st, Math.sin(a2) * R * 0.5], 1.15, 0.95, 1.0, 1);
      }
      for (let i = 0; i < 4; i++) { const a0 = i / 4 * TAU, a2 = (i + 1) / 4 * TAU; tri([0, st + 0.012, 0], [Math.cos(a0) * 0.016, st + 0.006, Math.sin(a0) * 0.016], [Math.cos(a2) * 0.016, st + 0.006, Math.sin(a2) * 0.016], 1.0, 1.0, 1.0, 0); }
    } else if (kind === 'pebble') {
      const ico = new THREE.IcosahedronGeometry(0.06, 0).toNonIndexed(), p = ico.attributes.position;
      const sh = k => 0.8 + 0.4 * Math.abs(Math.sin(k[0] * 91 + k[1] * 37 + k[2] * 53));
      for (let i = 0; i < p.count; i += 3) {
        const v = [0, 1, 2].map(q => [p.getX(i + q), p.getY(i + q), p.getZ(i + q)]);
        const up = (v[0][1] + v[1][1] + v[2][1]) > 0 ? 1.1 : 0.7;
        for (const q of v) { const s = sh(q); pos.push(q[0] * s, q[1] * s * 0.55 + 0.012, q[2] * s); col.push(up, up, up); hd.push(1); nor.push(0, 1, 0); }
      }
    } else if (kind === 'mush') {
      const sg = 6, sr = 0.014, sh = 0.065;
      for (let i = 0; i < sg; i++) { const a0 = i / sg * TAU, a1 = (i + 1) / sg * TAU; const p0 = [Math.cos(a0) * sr, 0, Math.sin(a0) * sr], p1 = [Math.cos(a1) * sr, 0, Math.sin(a1) * sr], q0 = [p0[0], sh, p0[2]], q1 = [p1[0], sh, p1[2]]; tri(p0, p1, q0, 0.8, 0.8, 1.0, 0); tri(p1, q1, q0, 0.8, 1.0, 1.0, 0); }
      const rings = [[0.0, 0.052], [0.022, 0.044], [0.04, 0.026], [0.05, 0.0]], cg = 9;
      for (let r = 0; r < 3; r++) for (let i = 0; i < cg; i++) {
        const a0 = i / cg * TAU, a1 = (i + 1) / cg * TAU, [y0, R0] = rings[r], [y1, R1] = rings[r + 1];
        const A = [Math.cos(a0) * R0, sh + y0 - 0.006, Math.sin(a0) * R0], B = [Math.cos(a1) * R0, sh + y0 - 0.006, Math.sin(a1) * R0], C = [Math.cos(a0) * R1, sh + y1, Math.sin(a0) * R1], D = [Math.cos(a1) * R1, sh + y1, Math.sin(a1) * R1];
        const k0 = 0.8 + r * 0.12, k1 = 0.8 + (r + 1) * 0.12; tri(A, B, C, k0, k0, k1, 1); if (r < 2) tri(B, D, C, k0, k1, k1, 1);
      }
    } else if (kind === 'fern') {
      const nf = 7;
      for (let i = 0; i < nf; i++) {
        const a = i / nf * TAU + rr() * 0.4, L0 = 0.34 + 0.12 * rr(), ox = Math.cos(a), oz = Math.sin(a), tx = -oz, tz = ox, segs = 4;
        let prev = null;
        for (let s = 0; s <= segs; s++) {
          const t = s / segs, d = L0 * t, hy = 0.04 + 0.26 * Math.sin(t * 1.9) * (1 - t * 0.2), w = 0.05 * Math.sin(Math.min(1, t * 1.15 + 0.1) * Math.PI) * (1 - t * 0.4);
          const c = [ox * d, hy, oz * d], cur = [[c[0] - tx * w, c[1], c[2] - tz * w], [c[0] + tx * w, c[1], c[2] + tz * w], 0.6 + 0.5 * t];
          if (prev) { tri(prev[0], prev[1], cur[0], prev[2], prev[2], cur[2]); tri(prev[1], cur[1], cur[0], prev[2], cur[2], cur[2]); }
          prev = cur;
        }
      }
    } else if (kind === 'shell') {
      const n = 7, R = 0.05;
      for (let i = 0; i < n; i++) { const a0 = -1 + i / n * 2, a1 = -1 + (i + 1) / n * 2; tri([0, 0.008, 0], [Math.sin(a0) * R, 0.014, -Math.cos(a0) * R * 0.9], [Math.sin(a1) * R, 0.014, -Math.cos(a1) * R * 0.9], 1.1, 0.8 + 0.25 * (i % 2), 0.8 + 0.25 * ((i + 1) % 2), 1); }
      tri([-0.012, 0.006, 0.004], [0.012, 0.006, 0.004], [0, 0.01, 0.022], 0.9, 0.9, 0.9, 1);
    } else if (kind === 'star') {
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; tri([0, 0.014, 0], [Math.cos(a - 0.35) * 0.02, 0.01, Math.sin(a - 0.35) * 0.02], [Math.cos(a) * 0.075, 0.006, Math.sin(a) * 0.075], 1.1, 0.95, 0.85, 1); tri([0, 0.014, 0], [Math.cos(a) * 0.075, 0.006, Math.sin(a) * 0.075], [Math.cos(a + 0.35) * 0.02, 0.01, Math.sin(a + 0.35) * 0.02], 1.1, 0.85, 0.95, 1); }
    } else if (kind === 'leaf') {
      const r = 0.07, w = 0.03, A = [0, 0.004, -r], B = [w, 0.004, 0], C = [0, 0.004, r], D = [-w, 0.004, 0];
      tri(A, B, C, 0.8, 0.8, 1.1, 1); tri(A, C, D, 0.8, 1.1, 0.8, 1);
    } else if (kind === 'puddle') {
      const n = 10, R = 0.5;
      for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, r0 = R * (0.8 + 0.2 * Math.sin(a0 * 3)), r1 = R * (0.8 + 0.2 * Math.sin(a1 * 3)); tri([0, 0.003, 0], [Math.cos(a0) * r0, 0.003, Math.sin(a0) * r0], [Math.cos(a1) * r1, 0.003, Math.sin(a1) * r1], 1.15, 0.85, 0.85, 1); }
    } else if (kind === 'shard') {
      const H = 0.2, w = 0.035, s4 = [[w, 0, 0], [0, 0, w], [-w, 0, 0], [0, 0, -w]];
      for (let i = 0; i < 4; i++) { const a = s4[i], b = s4[(i + 1) % 4]; tri([a[0], 0.02, a[2]], [b[0], 0.02, b[2]], [0, H, 0], 0.7, 0.8, 1.2, 1); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('aHead', new THREE.Float32BufferAttribute(hd, 1));
    return g;
  }
  const FLAT = { leaf: 1, star: 1, shell: 1, puddle: 1 };
  function coverMat(flat, glow, hero) {
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88, metalness: 0, vertexColors: true, side: THREE.DoubleSide });
    if (glow) { m.emissive = new THREE.Color(0xffffff); m.emissiveIntensity = glow; }
    if (flat) { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; }
    const U = { uHero: hero, uFade: { value: new THREE.Vector2(26, 38) }, uTime: TIME.u };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = 'attribute float aHead; uniform float uTime; uniform vec3 uHero; uniform vec2 uFade;\n' + sh.vertexShader
        .replace('#include <color_vertex>', `#include <color_vertex>
          #ifdef USE_COLOR
          vColor = color.rgb;
          #ifdef USE_INSTANCING_COLOR
          vColor *= mix(vec3(1.0), instanceColor, aHead);
          #endif
          #endif`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          #ifdef USE_INSTANCING
          { vec2 zi = vec2(instanceMatrix[3][0], instanceMatrix[3][2]); float zd = length(zi - uHero.xz); transformed *= 1.0 - smoothstep(uFade.x, uFade.y, zd); }
          #endif`)
        .replace('#include <project_vertex>', `vec4 mvPosition = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
          #endif
          {
            float zb = clamp(mvPosition.y / 0.5, 0.0, 1.0); zb *= zb;
            float zw = sin(uTime * 1.7 + mvPosition.x * 0.9 + mvPosition.z * 0.7) * 0.6 + sin(uTime * 2.9 + mvPosition.x * 1.7 - mvPosition.z * 1.1) * 0.3;
            mvPosition.x += zw * 0.045 * zb; mvPosition.z += zw * 0.03 * zb;
            vec2 zp = mvPosition.xz - uHero.xz; float zl = length(zp);
            float zk = (1.0 - smoothstep(0.2, 1.05, zl)) * zb * 0.55;
            mvPosition.xz += zp / max(zl, 0.05) * zk * 0.9; mvPosition.y -= zk * 0.12;
          }
          mvPosition = modelViewMatrix * mvPosition;
          gl_Position = projectionMatrix * mvPosition;`);
    };
    m.customProgramCacheKey = () => 'zemin-ortu' + (flat ? 'F' : '') + (glow ? 'G' : '');
    return m;
  }

  function son(L, B, api) {
    const Zk = L && L._zemin; if (!Zk || L._title || Zk.done) return;
    Zk.done = true;
    const { z, M } = Zk;
    let sd = (((L.seed | 0) + 777) >>> 0) || 1; const rnd = () => { sd |= 0; sd = sd + 0x6D2B79F5 | 0; let t = Math.imul(sd ^ sd >>> 15, 1 | sd); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    const vn = (x, y) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return (hash(ix, iy) * (1 - u) + hash(ix + 1, iy) * u) * (1 - v) + (hash(ix, iy + 1) * (1 - u) + hash(ix + 1, iy + 1) * u) * v; };
    const keep = [];
    if (L.start) keep.push([L.start.x, L.start.z, 1.3]);
    if (L.exit) keep.push([L.exit.x, L.exit.z, 1.6]);
    if (L.boss) keep.push([L.boss.x, L.boss.z, 1.8]);
    for (const c of L.checkpoints || []) keep.push([c.x, c.z, 1.4]);
    if (L.merchant) keep.push([L.merchant.x, L.merchant.z, 1.6]);
    for (const o of L.nesneler || []) if (o && o.x != null) keep.push([o.x, o.z, (o.r || 0.7) + 0.5]);
    const blobs = [];
    for (const s of L.solids || []) if (s.r > 0.15) blobs.push([s.x, s.z, s.r]);
    for (const f of B.fp || []) blobs.push(f);
    { const d = M.data, ppm = M.ppm, pad = M.pad;
      for (const [x, zz, r] of blobs) {
        const ra = Math.min(5, r * 1.55 + 0.25), k = Math.min(0.75, 0.3 + r * 0.22);
        for (let j = Math.floor((zz - ra + pad) * ppm); j <= (zz + ra + pad) * ppm; j++) for (let i = Math.floor((x - ra + pad) * ppm); i <= (x + ra + pad) * ppm; i++) {
          if (i < 0 || j < 0 || i >= M.tw || j >= M.th) continue;
          const dx = (i + 0.5) / ppm - pad - x, dz = (j + 0.5) / ppm - pad - zz, q = (dx * dx + dz * dz) / (ra * ra); if (q >= 1) continue;
          const o = (j * M.tw + i) * 4 + 2, a = k * (1 - q) * (1 - q) * 255; if (a > d[o]) d[o] = a;
        }
      }
      M.tex.needsUpdate = true; }
    // PERF (tur 1): örnekli zemin örtüsü (ot, çiçek, çakıl…) oyunda HİÇ görünmüyordu — 03p'deki uzak parça budaması örnekli zemin-*
    // parçalarında tek bir otun kendi sınır küresine bakıp hepsini gizliyor (ölçüm: bölüm başına 100-160 parça, 0'ı görünür).
    // Görünmeyen parçaları kurmak yükleme süresi ve bellek harcıyordu → kurulmaz; görüntü aynı kalır. (?ortu ile eskisi gibi kurulur;
    // örtü yeniden açılacaksa önce budama düzeltilmeli ve çizim bütçesi gözetilmeli.)
    if (!(typeof Q !== 'undefined' && Q.has && Q.has('ortu'))) { Zk.stat = { tri: 0, inst: 0, calls: 0, blobs: blobs.length, kapali: 1 }; return; }
    const cell = 4, bw = Math.ceil(L.W / cell) + 12, bg = new Map();
    const bk = (i, j) => (j + 6) * bw + i + 6;
    for (const b of blobs) { const k = bk(Math.floor(b[0] / cell), Math.floor(b[1] / cell)); (bg.get(k) || bg.set(k, []).get(k)).push(b); }
    const blocked = (x, zz, pad, tall) => {
      if (tall) for (const [kx, kz, kr] of keep) if ((x - kx) * (x - kx) + (zz - kz) * (zz - kz) < kr * kr) return true;
      const ci = Math.floor(x / cell), cj = Math.floor(zz / cell);
      for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) { const l = bg.get(bk(i, j)); if (l) for (const b of l) { const rr = b[2] * 0.85 + pad; if ((x - b[0]) * (x - b[0]) + (zz - b[1]) * (zz - b[1]) < rr * rr) return true; } }
      return false;
    };
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let j = 0; j < L.H; j++) for (let i = 0; i < L.W; i++) if (L.grid[j * L.W + i]) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); z0 = Math.min(z0, j); z1 = Math.max(z1, j); }
    const OUTR = 13; x0 -= OUTR; z0 -= OUTR; x1 += OUTR; z1 += OUTR;
    const lava = L._volc && L._volc.lava, LV = L._volc;
    const lavaAt = (x, zz) => { for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const i = Math.floor((x + dx * 0.4) * LV.P), j = Math.floor((zz + dz * 0.4) * LV.P); if (i >= 0 && j >= 0 && i < LV.MW && j < LV.MH && lava[j * LV.MW + i] > 0.02) return true; } return false; };
    const hero = { value: new THREE.Vector3(1e5, 0, 1e5) };
    const dummy = new THREE.Object3D(), col = new THREE.Color();
    let tri = 0, inst = 0, calls = 0;
    for (const e of z.cover) {
      const cells = [];
      for (let zz = Math.floor(z0); zz < z1; zz++) for (let xx = Math.floor(x0); xx < x1; xx++) {
        const cx = xx + 0.5, cz = zz + 0.5, w = M.walk(cx, cz), o = M.out(cx, cz);
        if (w > 0.5 ? e.z === 'out' : (e.z === 'walk' || o > OUTR)) continue;
        cells.push(xx, zz);
      }
      if (!cells.length) continue;
      const nc = cells.length / 2, dens = e.n / (nc * (e.clump ? 0.42 : 0.8)), pts = [];
      const tall = e.k === 'tuft' || e.k === 'wheat' || e.k === 'fern' || e.k === 'flower' || e.k === 'shard';
      for (let q = 0; q < cells.length; q += 2) {
        let k = Math.floor(dens + rnd());
        for (; k > 0; k--) {
          const x = cells[q] + rnd(), zz = cells[q + 1] + rnd();
          if (e.clump && vn(x * 0.22 + e.n * 0.001, zz * 0.22) * 0.65 + vn(x * 0.7, zz * 0.7) * 0.35 < 1 - e.clump * 0.95 + 0.05) continue;
          const pr = M.path(x, zz), isOut = M.walk(x, zz) < 0.45;
          if (e.edge ? pr > 0.62 : pr > (tall ? 0.1 : 0.2)) continue;
          if (!e.edge && !isOut && pr > 0.05 && e.k !== 'leaf' && e.k !== 'shell') continue;
          if (lava && lavaAt(x, zz)) continue;
          if (blocked(x, zz, tall ? 0.05 : 0.1, tall && !isOut)) continue;
          pts.push(x, zz, isOut ? 1 : 0);
        }
      }
      let n = pts.length / 3; if (!n) continue;
      if (n > e.n * 1.1) { for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); for (let c = 0; c < 3; c++) { const t = pts[i * 3 + c]; pts[i * 3 + c] = pts[j * 3 + c]; pts[j * 3 + c] = t; } } n = Math.floor(e.n * 1.1); }
      const geo = geoOf(e.k), flat = !!FLAT[e.k], mat = coverMat(flat, e.glow, hero), pal = e.col.map(h => new THREE.Color(h));
      const CH = 22, bins = new Map();   // 22 m'lik parçalar: kameranın görmediği parçalar çizilmez (frustum culling)
      for (let i = 0; i < n; i++) { const key = Math.floor(pts[i * 3] / CH) * 1000 + Math.floor(pts[i * 3 + 1] / CH); (bins.get(key) || bins.set(key, []).get(key)).push(i); }
      for (const idx of bins.values()) {
        const im = new THREE.InstancedMesh(geo, mat, idx.length); im.name = 'zemin-' + e.k;
        for (let q = 0; q < idx.length; q++) {
          const i = idx[q], x = pts[i * 3], zz = pts[i * 3 + 1], isOut = pts[i * 3 + 2] > 0.5;
          const s = e.s[0] + rnd() * (e.s[1] - e.s[0]), hs = isOut && e.hOut ? e.hOut : 1;
          dummy.position.set(x, flat ? 0.006 : 0, zz); dummy.rotation.set(0, rnd() * TAU, 0);
          if (e.k === 'pebble') dummy.scale.set(s * (0.8 + rnd() * 0.5), s * (0.7 + rnd() * 0.6), s); else dummy.scale.set(s, s * (flat ? 1 : (0.8 + rnd() * 0.5) * hs), s);
          dummy.updateMatrix(); im.setMatrixAt(q, dummy.matrix);
          col.copy(pal[(rnd() * pal.length) | 0]).multiplyScalar(0.82 + rnd() * 0.36); im.setColorAt(q, col);
        }
        im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
        im.computeBoundingSphere(); if (im.boundingSphere) im.boundingSphere.radius += 1.5;
        api.add(im); calls++;
      }
      api.dispose(geo); api.dispose(mat);
      tri += n * geo.attributes.position.count / 3; inst += n;
    }
    api.anim((dt, hx, hz) => { hero.value.set(hx, 0, hz); });
    Zk.stat = { tri, inst, calls, blobs: blobs.length };
  }
  return { TEMA, OTO, kur, son, otomatik };
})();
