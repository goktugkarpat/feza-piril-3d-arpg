# Feza ve Pırıl: Kayıp Işıklar

5 yaşındaki Feza için, 10 bölümlük, Türkçe seslendirmeli, korkutucu hiçbir şey içermeyen 3B bir macera. Feza ve peluş ejderhası Pırıl, sönen Büyük Fener'in kayıp ışıklarını on farklı diyarda bulur: Işıklı Mantar Vadisi, Mercan Krallığı, Huysuz Orman, Altın Değirmen Vadisi, Köstebek ve Salyangoz Mağarası, Ay Tapınağı, Lav Yanardağı, Surlu Şehir, Ejderhanın Kalesi ve Büyük Fener. `index.html`'ye çift tıklayınca (file://) da çalışır.
iPad'de: Safari › Paylaş › Ana Ekrana Ekle (internetsiz çalışır, `sw.js`).

## Akış
Başlık → Oyna → kahraman seçimi → giriş masalı (yatak odası) → rüya → 10 bölüm (sıra: mantar, mercan, orman, degirmen, magara, mabet, yanardag, sehir, kale, fener).
Bölüm sonu: boss neşelenir → ışık topu Pırıl'a → Büyük Fener'in bir yüzü yanar + ipucu → atlanabilir yolculuk ("Geç") → sıradaki bölüm.
Dünya Haritası: ilk oyunda yalnız biten + sıradaki diyar açık; oyun bir kez bitince (`fener_bitti`) hepsi serbest.
Mola menüsü: Gardırop, Pırıl'ın Köşesi, Çıkartma Albümü. Mini oyunlar yalnız bölümlerin içinde.

## Geliştirici notları
- Bölüm dosyası eklenince (`src/06z_<id>.js`, `05z_<id>.js`, `02l_<id>.js`) bir kez `python3 tools/liste.py` çalıştır: `index.html` işaretlerini ve `sw.js` dosya listesini yeniler.
- `src/06b_bolum_sirasi.js`: sıra, yer tutucu bölümler, harita verisi, kilit kuralı. Bölüm dosyası `BOLUM.define({ harita:{ad,renk,simge}, yolculuk:{arac,cumle}, parcaIpucu })` verebilir
  (arac: yaprak, kabarcik, kartal, kirinti, vagon, isik, kanat). Ses anahtarları: `pp_yol_<id>` (yolculuk), `pr_parca_<id>` (ışık parçası ipucu).
- Test: adrese `?sessiz` ekle. Kayıt anahtarları `fener_` ile başlar (`fener_ayar`, `fener_kayit.v1`, `fener_bitti`). `?hepsiacik` tüm diyarları açar.
- Yayın: `yayinla.command` (yalnız ebeveyn "gönder" dediğinde).

## Yapım

Bu oyun, Feza'nın babası **Göktuğ Karpat** (@goktugkarpat) ile yapay zekâ yardımcısı **Claude** (Anthropic) birlikte çalışarak yapılmıştır.
Fikirler, hikâye ve kararlar ailenindir; kod, 3B modeller, bölüm tasarımları ve düzenlemeler Claude ile birlikte yazılmıştır.
Oyun yalnızca Feza için, kâr amacı olmadan yapılmış bir aile projesidir.

iPad adresi: https://goktugkarpat.github.io/feza-piril-3d-arpg/
