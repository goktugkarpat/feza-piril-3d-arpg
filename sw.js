/* Feza ve Pırıl: Büyük Fener — internetsiz çalışma. tools/liste.py üretir; elle düzenleme (tools/sw.sablon.js'i düzenle).
   index.html önce ağdan, diğer dosyalar önce önbellekten. Eski önbellekleri silerken YALNIZ 'feza-piril-3d-arpg-' ile başlayanları siler
   (aynı sitedeki başka oyunların kopyasına dokunmaz). */
'use strict';
const PREFIX = 'feza-piril-3d-arpg-';
const CACHE = PREFIX + 'v3a7984108b';
const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'src/ui.css',
  'src/hub.css',
  'src/harita.css',
  'src/gecis.css',
  'src/baslik.css',
  'vendor/three.js',
  'src/00_i18n.js',
  'sesler.js',
  'src/00_core.js',
  'src/01_textures.js',
  'src/02_audio.js',
  'src/02l_oyun.js',
  'src/02l_hikaye.js',
  'src/02l_yuva.js',
  'src/02l_piril.js',
  'src/02l_arayuz.js',
  'src/02l_mantar.js',
  'src/02l_mercan.js',
  'src/02l_orman.js',
  'src/02l_degirmen.js',
  'src/02l_magara.js',
  'src/02l_mabet.js',
  'src/02l_yanardag.js',
  'src/02l_sehir.js',
  'src/02l_kale.js',
  'src/02l_fener.js',
  'src/03_fx.js',
  'src/03g_atmosfer.js',
  'src/03p_performans.js',
  'src/04_feza.js',
  'src/04_esyalar.js',
  'src/04_piril.js',
  'src/04_piril_takip.js',
  'src/04_piril_guc.js',
  'src/04_bilbo.js',
  'src/04_bilbo_takip.js',
  'src/04_baba.js',
  'src/04_kartal.js',
  'src/04_hala.js',
  'src/04_ejderha.js',
  'src/05_enemies.js',
  'src/05a_huysuz_kayit.js',
  'src/05c_boss_davranis.js',
  'src/05z_mantar.js',
  'src/05z_mercan.js',
  'src/05z_orman.js',
  'src/05z_degirmen.js',
  'src/05z_magara.js',
  'src/05z_mabet.js',
  'src/05z_yanardag.js',
  'src/05z_sehir.js',
  'src/05z_kale.js',
  'src/05z_fener.js',
  'src/06a_bolum_kayit.js',
  'src/06y_odakit.js',
  'src/07m_kit.js',
  'src/07m_agac.js',
  'src/07m_dekor.js',
  'src/07m_kit_e567.js',
  'src/07m_dekor_magara.js',
  'src/07m_dekor_mabet.js',
  'src/07m_dekor_yanardag.js',
  'src/07m_kit_yapi.js',
  'src/07m_dekor_sehir.js',
  'src/07m_dekor_kale.js',
  'src/07m_dekor_fener.js',
  'src/07m_kit_ortak.js',
  'src/07m_dekor_orman.js',
  'src/07m_dekor_degirmen.js',
  'src/07m_dekor_mercan.js',
  'src/06z_mantar.js',
  'src/06z_mercan.js',
  'src/06z_orman.js',
  'src/06z_degirmen.js',
  'src/06z_magara.js',
  'src/06z_mabet.js',
  'src/06z_yanardag.js',
  'src/06z_sehir.js',
  'src/06z_kale.js',
  'src/06z_fener.js',
  'src/06b_bolum_sirasi.js',
  'src/06_level.js',
  'src/07_game.js',
  'src/08_skills.js',
  'src/08m_minigame.js',
  'src/08j_his.js',
  'src/08n_mini_oyunlar.js',
  'src/10_story.js',
  'src/09m_harita_art.js',
  'src/09m_harita.js',
  'src/09t_gecis.js',
  'src/09_ui.js',
  'src/09h_hub.js',
  'src/09t_baslik.js'
].map(u => u === './' ? u : './' + u);
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith(PREFIX) && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const sayfa = req.mode === 'navigate' || /(\/|index\.html)$/.test(url.pathname);
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    if (sayfa) {
      try {
        const r = await fetch(req, { cache: 'no-store' });
        if (r && r.ok) { c.put('./index.html', r.clone()); return r; }
      } catch (err) { /* internet yok: önbellekten */ }
      return (await c.match('./index.html', { ignoreSearch: true })) || (await c.match('./', { ignoreSearch: true })) || Response.error();
    }
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r && r.ok) c.put(req, r.clone());
      return r;
    } catch (err) { return Response.error(); }
  })());
});
