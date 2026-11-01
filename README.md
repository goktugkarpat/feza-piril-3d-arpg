# Feza ve Pırıl: Kayıp Işıklar 🗼✨🐉

5 yaşındaki Feza için yapılmış, Zelda havasında üç boyutlu, büyülü bir macera.
Bir gece Feza'nın peluş ejderhası Pırıl canlanır: Büyük Fener sönmüştür! Feza ile Pırıl on farklı diyarı dolaşıp
fenerin kayıp ışıklarını bulur, her diyarın büyük ve huysuz dostunu neşelendirir ve ışıkları fenere geri taşır.

Korkutucu hiçbir şey yoktur; düşmanlar aslında huysuzdur, neşelenince ışıl ışıl olurlar. Feza okuma bilmediği için
her şey Feza'nın, anlatıcının sesiyle ve simgelerle anlatılır. Dünya Haritası'nda fener ortadadır, on ada onun etrafını sarar.

## Diyarlar

1. **Işıklı Mantar Vadisi** — Şarkı mantarları, zıplatan mantarlar, sisli bir tünel ve Pırıl'ın ışık nefesi. Oyunu öğreten ilk diyar. Koca Pofuduk Mantar'ı neşelendir.
2. **Mercan Krallığı** — Su altında köpükle dalış, kabarcık bacaları, mercan bahçeleri ve inci süsleme. Koca Kirpi Balık'la tanış.
3. **Huysuz Orman** — Fener fidanlarını yak, kamp ateşinin başında Baba ve Kartal'la buluş, Kral Jöle'yi neşelendir.
4. **Altın Değirmen Vadisi** — Un, su ve ateş topla, Hala'yla ışık ekmeği pişir, durmuş değirmenin çarklarını çevir.
5. **Köstebek ve Salyangoz Mağarası** — Işık aynaları ve renk yankıları, parlayan kristaller. Bilbo da bu diyarda ekibe katılır. Usta Köstebek'i neşelendir.
6. **Ay Tapınağı** — Ay ışığı altında taş bir tapınak. Alçak yerçekimiyle zıpla, yıldız basamaklarına çık, takımyıldızlarını uyandır.
7. **Lav Yanardağı** — Sıcak ama güvenli nehir çarkları. Pırıl uyur, Feza onu taşır. Koca Lav Kaplumbağası'nı neşelendir.
8. **Surlu Şehir** — Saat kulesi, unutulmuş eşyaları sahiplerine geri verme ve Huysuz Şövalye.
9. **Ejderhanın Kalesi** — Üç yumurtayı sıcak yuvaya taşı. Tüm dostlar birlikte; Pırıl'ın ailesiyle büyük tanışma.
10. **Büyük Fener** — Unutulmuş oyuncakları neşelendir, anıları geri getir ve fener yeniden yansın. Büyük final!

Her diyarın sonunda boss neşelenir, ışık topu Pırıl'a gider, fenerin bir yüzü yanar ve bir sonraki diyar için ipucu verilir.
Diyarlar arasında kısa bir yolculuk sahnesi vardır (atlanabilir).

**Dostlar:** Pırıl (hep yanında), Baba ve Kartal, Hala, Bilbo. Zor anda yardıma gelirler.
**Pırıl'ın güçleri** diyarlarla birlikte geri gelir: ışık nefesi, köpük kalkanı, kanat rüzgârı, kalp tozu.

## Nasıl açılır

- **Bilgisayarda:** `index.html` dosyasına çift tıkla (internet gerekmez). İstersen oyun klasöründe `python -m http.server 8000` çalıştırıp http://localhost:8000/ adresini de açabilirsin.
- **İnternette:** https://goktugkarpat.github.io/feza-piril-3d-arpg/
- **iPad'de:** Yukarıdaki adresi Safari'de açıp Paylaş › **Ana Ekrana Ekle** de. İlk açılışta internet gerekir, sonrası internetsiz çalışır.
- **GitHub'a göndermek:** `yayinla.command` dosyasına çift tıkla.

## Nasıl oynanır

- **Yürümek:** ekranda parmağını sürükle, Feza o tarafa yürür. Parmak uzaksa koşar.
- **Etrafı çevirmek:** kamera Feza'yı kendiliğinden izler.
- **Saldırı:** sağ alttaki kılıç düğmesine bas. Düşmanlar canı yanmadan neşelenir.
- **Zıplamak:** yalnız zıplanabilen yerlerde (örneğin Ay Tapınağı'nın yıldız basamakları) çıkan, sol alttaki yıldızlı düğme ile olur. Basamağa yaklaşınca oyun zıplamaya kendisi de yardım eder. Düşünce bulut yastığı yumuşakça bırakır, can kaybolmaz.
- **Dokunmak:** ışıklı nesnelere, sandıklara, istasyonlara dokununca küçük oyunlar açılır. Mini oyunlar sadece diyarların içindedir.
- **Pırıl ve dostlar:** can azalınca ya da çok düşman olunca kendileri yardıma gelir.
- **Yıldızlar:** yeni yetenek almak için kullanılır; her yetenek 1 yıldızdır, yıldızlar yavaş toplanır.
- **Duraklatma menüsü:** Gardırop, Pırıl'ın Köşesi ve Çıkartma Albümü buradadır.
- Klavye (ebeveyn için): **W-A-S-D / oklar** yürür, **Z** zıplar, **Q** iksir içer, **E** satıcıyla konuşur.

## Ebeveyn için notlar

- **Sessiz açmak:** adrese `?sessiz` ekle.
- **Doğrudan bir diyarı açmak:** `?bolum=mantar&hepsiacik` (diğerleri: mercan, orman, degirmen, magara, mabet, yanardag, sehir, kale, fener). `?hepsiacik` bütün diyarları açar.
- **Dünya Haritası:** ilk oyunda yalnız biten ve sıradaki diyar açıktır; oyun bir kez bitince hepsi serbest olur.
- **Kayıt:** ilerleme tarayıcıda saklanır (`fener_` ile başlayan anahtarlar).
- **Süre:** bir oturum yaklaşık 10–15 dakikalık bir diyardır; bütün oyun yaklaşık 2 saat 20 dakika sürer. Oyun istenen yerde bırakılıp sonra devam edilir.
- **Geliştirici:** yeni bir bölüm dosyası (`src/06z_<id>.js`, `05z_<id>.js`, `02l_<id>.js`) eklenince bir kez `python tools/liste.py` çalıştır; `index.html` ve `sw.js` dosya listesi yenilenir. Planlar `PLAN.md` ve `bolumler/` klasöründedir.

## Yapım

Bu oyun, Feza'nın babası **Göktuğ Karpat** (@goktugkarpat) ile yapay zekâ yardımcısı **Claude** (Anthropic) birlikte çalışarak yapılmıştır.
Fikirler, hikâye ve kararlar ailenindir; kod, 3B modeller, bölüm tasarımları ve düzenlemeler Claude ile birlikte yazılmıştır.
Oyun yalnızca Feza için, kâr amacı olmadan yapılmış bir aile projesidir.
