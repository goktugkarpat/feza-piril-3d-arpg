/* ── 10 bölümlük sıra, yer tutucu bölümler, harita kilidi, harita/yolculuk verisi (MOTOR1) ──
   06a_bolum_kayit.js (BOLUM) ve bütün 06z_<id>.js dosyalarından SONRA, 06_level.js'den ÖNCE yüklenir.
   • BOLUM.ORDER = mantar, mercan, orman, degirmen, magara, mabet, yanardag, sehir, kale, fener (bu dosya kurar).
   • Gerçek dosyası (06z_<id>.js) olmayan bölüm için yer tutucu bölüm tanımlanır (Mantar'ın düşmanları + boss'u; akış testi için).
   • Bölüm dosyası kendi BOLUM.define'ında şunları verebilir (hepsi isteğe bağlı; yoksa aşağıdaki varsayılan kullanılır):
       harita:   { ad, renk, simge }            // Dünya Haritası adası (x, y'yi harita kendisi yerleştirir; mor renk KULLANMA)
       yolculuk: { arac, cumle }                // bu bölüm BİTİNCE oynayan ~10 sn'lik yolculuk sahnesi (arac: yaprak|kabarcik|kartal|kirinti|vagon|isik|kanat)
                                                //   cumle = Pırıl'ın cümlesi; ses anahtarı 'pp_yol_<id>' (kendi 02l dosyanda tanımla)
       parcaIpucu: 'cümle'                      // ışık parçası ipucu; ses anahtarı 'pr_parca_<id>'
   • BOLUM.diyar(id) → birleşmiş { id, no, ad, renk, simge, x, y, yolculuk:{arac,cumle}, ipucu }.  BOLUM.bittiMi(id) · BOLUM.isOpen(id, P).
   • Kilit kuralı: ilk oyunda yalnız bitirilen + sıradaki bölüm açık; localStorage 'fener_bitti' varsa (oyun bir kez bitti) hepsi açık. ?hepsiacik hepsini açar. */
(() => {
  'use strict';
  if (typeof BOLUM === 'undefined') return;
  const KEY_BITTI = 'fener_bitti';
  // x, y: harita yüzdesi (soldan sağa, iki sıralı zigzag). Mor yalnız Pırıl'ın: harita renklerinde yok.
  const DIYAR = [
    { id: 'mantar',   ad: 'Işıklı Mantar Vadisi',   renk: '#ff8fb8', simge: '🍄', arac: 'yaprak',   cumle: 'Işıklı dere bizi denizlere götürüyor!',
      ipucu: 'Işık denizlerin altında uyuyor.' },
    { id: 'mercan',   ad: 'Mercan Krallığı',        renk: '#4fc3e8', simge: '🐠', arac: 'kabarcik', cumle: 'Kabarcık bizi yukarı çıkarıyor. Sisli bir orman görünüyor!',
      ipucu: 'Işık, sisle örtülü bir ormanın derinliğinde.' },
    { id: 'orman',    ad: 'Huysuz Orman',           renk: '#5cbf6a', simge: '🌲', arac: 'kartal',   cumle: 'Kartal bizi altın tarlalara uçuruyor!',
      ipucu: 'Işık, altın başakların arasında, çarkları durmuş bir değirmende.' },
    { id: 'degirmen', ad: 'Altın Değirmen Vadisi',  renk: '#e9b44c', simge: '🌾', arac: 'kirinti',  cumle: 'Ekmek kırıntılarını izleyelim. Mağaraya kayıyoruz!',
      ipucu: 'Işık yerin altında, taşların ve kristallerin arasında.' },
    { id: 'magara',   ad: 'Kristal Mağarası',       renk: '#6fa8d8', simge: '💎', arac: 'vagon',    cumle: 'Maden arabası bizi yıldızlı göğe çıkarıyor!',
      ipucu: 'Sıradaki ışık gecenin en tepesinde, bulutların üstünde.' },
    { id: 'mabet',    ad: 'Ay Tapınağı',          renk: '#5b8def', simge: '🌙', arac: 'yaprak',   cumle: 'Yaprak kayığımız kızıl parıltıya doğru süzülüyor!',
      ipucu: 'Sıradaki ışık ateşin kalbinde, sıcak bir dağda.' },
    { id: 'yanardag', ad: 'Lav Yanardağı',          renk: '#ff7a4d', simge: '🌋', arac: 'isik',     cumle: 'Işıklar şehrin fenerlerine dönüyor. Bak, yol parlıyor!',
      ipucu: 'Işıklar şehrin fenerlerine döndü; şehir sisin içinde, saat kulesi durmuş.' },
    { id: 'sehir',    ad: 'Surlu Şehir',            renk: '#e8a07a', simge: '🏙️', arac: 'kanat',   cumle: 'Bayraklar gökkuşağı oluyor. Kaleye uçuyoruz!',
      ipucu: 'Bayraklar uzaktaki kaleye uzanıyor. Pırıl "tanıdık" diyor.' },
    { id: 'kale',     ad: 'Ejderhanın Kalesi',      renk: '#ec7f98', simge: '🏰', arac: 'kanat',    cumle: 'Gökkuşağına doğru kanat çırpıyoruz!',
      ipucu: 'Büyük Fener gökkuşağı adalarının tepesinde.' },
    { id: 'fener',    ad: 'Büyük Fener',            renk: '#ffe27a', simge: '💡', arac: 'isik',     cumle: 'Fener bizi çağırıyor!',
      ipucu: '' },
  ];
  // zigzag: soldan sağa 10 diyar, iki sıra (üst sıra, alt sıra, ...)
  DIYAR.forEach((d, i) => { d.x = +(8.5 + i * (83 / 9)).toFixed(1); d.y = i % 2 ? 84 : 61; });
  const IDS = DIYAR.map(d => d.id);

  // ── sıra ──
  BOLUM.ORDER.length = 0; IDS.forEach(id => BOLUM.ORDER.push(id));

  // ── yer tutucu bölümler ──
  IDS.forEach((id, i) => {
    if (BOLUM.get(id) && (BOLUM.get(id).kur || BOLUM.get(id).kurSon || BOLUM.get(id).yerlesim)) return;   // gerçek dosyası yüklendi
    const d = DIYAR[i];
    BOLUM.define(id, {
      ad: d.ad, taban: id === 'mabet' ? 'moon' : 'forest', size: 90, side: 2, areas: BOLUM.UC_ALAN('Birinci Alan', 'İkinci Alan', 'Üçüncü Alan'),
      muzik: id, malzeme: 'isik' + (i + 1), kayipEsya: null, final: id === 'fener',
      huysuzlar: { jole: 4 }, elitler: ['jole'], boss: 'kocaPofudukMantar',
      minimap: { zemin: '#6a9a8a' },
      yerTutucu: true,
      kur(L, api) { BOLUM.yerTutucu(L, api, { isik: 0xfff2dc }); },
    });
  });

  // ── birleşik diyar verisi ── (mor yalnız Pırıl'ın: bölümün verdiği renk mor tonundaysa varsayılan renk kullanılır)
  function mor(c) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(c)); if (!m) return false;
    const r = parseInt(m[1].slice(0, 2), 16) / 255, g = parseInt(m[1].slice(2, 4), 16) / 255, b = parseInt(m[1].slice(4), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 0.08) return false;
    let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360;
    return h >= 255 && h <= 320;
  }
  function diyar(id) {
    const i = IDS.indexOf(id); if (i < 0) return null;
    const v = DIYAR[i], z = BOLUM.get(id) || {}, h = z.harita || {}, y = z.yolculuk || {};
    return {
      id, no: i + 1, x: v.x, y: v.y,
      ad: (!z.yerTutucu && (h.ad || z.ad)) || v.ad, renk: (h.renk && !mor(h.renk)) ? h.renk : v.renk, simge: h.simge || v.simge,
      yolculuk: { arac: y.arac || v.arac, cumle: y.cumle || v.cumle }, ipucu: z.parcaIpucu || v.ipucu,
    };
  }
  // ── kayıt / kilit ──
  const P_ = () => { try { return typeof GAME !== 'undefined' && GAME.P ? GAME.P : null; } catch (e) { return null; } };
  const qs = new URLSearchParams(location.search);
  let bitti = null;
  function oyunBittiMi() {
    if (bitti === null) { try { bitti = localStorage.getItem(KEY_BITTI) === '1'; } catch (e) { bitti = false; } }
    return bitti;
  }
  function oyunBitti() { bitti = true; try { localStorage.setItem(KEY_BITTI, '1'); } catch (e) { /* gizli mod */ } }
  // biten bölümler: oyun içinde P.bossNese; başlıkta (oyun yüklenmeden) kayıttan okunur (kayıt anahtarı: MOTOR2 'fener_kayit.v1' yapınca ikisini de dener)
  function biten(P) {
    P = P || P_(); const own = P && P.bossNese;
    if (own && Object.keys(own).length) return own;
    try {
      if (typeof GAME !== 'undefined' && GAME.state === 'title') {
        for (const k of ['fener_kayit.v1', 'piril_kayit.v1']) { const v = JSON.parse(localStorage.getItem(k) || 'null'); if (v && v.bossNese) return v.bossNese; }
      }
    } catch (e) { /* kayıt yok */ }
    return own || {};
  }
  function bittiMi(id, P) { return !!biten(P)[id]; }
  function siradaki(P) { return IDS.find(id => !bittiMi(id, P)) || null; }   // ilk bitmemiş (hepsi bitmişse null)
  function isOpen(id, P) {
    if (window.__qaAc || qs.has('hepsiacik') || oyunBittiMi()) return true;
    if (bittiMi(id, P)) return true;
    return id === siradaki(P);
  }
  BOLUM.isOpen = isOpen;
  Object.assign(BOLUM, { DIYAR, IDS, diyar, biten, bittiMi, siradaki, oyunBitti, oyunBittiMi, parcaSayisi: P => IDS.filter(id => bittiMi(id, P)).length });
})();
