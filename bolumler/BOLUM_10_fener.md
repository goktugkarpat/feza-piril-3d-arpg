# Bölüm 10 — Büyük Fener (FİNAL)
**Eşlik edenler:** Pırıl + Baba + Dağ Kartalı + Bilbo + Hala + anne ejderha (bölüm 9'dan; mor) · **Süre:** ~10 dk oyun + ~6 dk final sinematiği = 15–16 dk · **Işık parçası:** yok; 9 parçanın hepsi fenerde birleşir · **İpucu:** yok (jenerik) · **Pırıl'ın gücü:** büyüme + uçuş · **Yolculuk sahnesi:** bölüm 9'dan gelen kısa uçuş (atlanabilir)

---

## 1. Bir cümlede bölüm ve hikâyedeki yeri
Gökkuşağı Adaları'nın tepesinde sönmüş Büyük Fener'e varılır; Feza ve Pırıl, sisin sahibi **Unutulan Kral Tonton**'u kılıçla değil **dostlukla** karşılar, onun adını söyleyip "Seni hatırlıyoruz" der (ad ilk kez burada söylenir), sis çekilir; sonra Pırıl büyür, Feza sırtında uçar, dokuz ışık parçası ve Kral'ın kıvılcımıyla fener birlikte yakılır, dostlar toplanırken üç uyuyan Işık Ejderhası tek tek selam verir, Feza sabah yatağında uyanır.

- **Nasıl gelinir:** Bölüm 9'un sonunda kuleden gölge "Gelin... lütfen" demişti. Yolculukta herkes gökkuşağına çıkar: dostlar yürür, anne ejderha ve Kartal gökte eşlik eder.
- **Nasıl biter:** Fener yanar, harita fener görselinin tam hâli açılır, jenerik, sabah uyanışı. "Tekrar Oyna / İstediğin Bölüme Git" ekranı (PLAN karar 12: oyun bitince HER bölüm serbest).

## 2. Görsel kimlik
- **Kaynak (AYNEN):** `feza-bilbo/piril/src/06z_gokkusagi.js` Gökkuşağı Adaları: bulut basamakları, yağmur adası, gökkuşağı köprüsü, yıldız adası, pastel pembe arena zemini (lavanta tonu çıkarılır), pofuduk bulut denizi, bulut ağaçları, pamuk çalıları, yıldız çiçekleri, rüzgâr çanları, sıcak hava balonu, pastel bulut kalesi, dev gökkuşağı yayı. Hepsi sade ve pastel (zaten "SADE" turundan geçmiş).
- **Yeniden çerçevelenen:** 4. adanın üstüne **Büyük Fener** gelir: uzun, yuvarlak taş kule, tepede 9 cam yüzlü büyük lamba (her yüz bir bölümün rengi; haritadaki fener görseliyle aynı sıra ve renk, bkz. 14) ve en üstte 10. küçük boş yuva (Kral'ın kıvılcımı için). Fener sönükken camlar sis-gri ve soluk; sisle sarılı değil, hafif perdeli.
- **Sis:** sıcak inci-gri hafif örtü, yavaş akar; korkutucu değil, "sabah sisi". Mor sis yok (mor yalnız Pırıl'da; anne ejderha tanıma anından sonra mordur, PLAN karar 18).
- **Unutulan Kral'ın alanı:** fener tabanındaki yuvarlak taş meydan (kaynakta arena yerine geçer: yumuşak çimen halkası, ortada kare taş masa).
- **Sabah odası:** `10_story.js` `buildBedroom(sabah=true)` (güneş, bulut, sıcak gün ışığı) AYNEN.

## 3. Alanlar (4 ana alan + final sahnesi + 2 yan alan) ve dakika dakika
| Dk | Alan | Ne var / Feza ne yapar |
|---|---|---|
| 0:00–1:30 | **1. Bulut Basamakları** | Bölüm 9'daki herkes burada. Kısa yürüyüş; Baba ateşi, Hala'nın ekmeği, Kartal'ın yönü: dostlar "son adım" der. Sis hafifçe üstte. |
| 1:30–3:30 | **2. Yağmur Adası** | Hava huysuzları (Şimşekçik, Yağmur Damlacığı, Rüzgâr Balonu) bir de **unutulmuş oyuncaklar** ilk kez burada beliriyor: üzgün küçük tahta at, kırık davul. Neşelendir. Önceki bölümlerin dostları (Pofuduk Mantar, Kirpi Balık...) uzakta el sallar (kısa, süs). |
| 3:30–5:00 | **3. Gökkuşağı Köprüsü** | Pırıl'ın kıvılcımı köprünün altından "fener kokusu" alır; köprüde her bölümün küçük ışık izi (sade, 9 renk bayraklı); Feza yürüdükçe renkler sırayla yanar (yalnız renkli bayraklar, efekt yok). |
| 5:00–5:30 | **4. Yıldız Adası** | Fenerin dibi; Bilbo ve Pırıl Kral'ın gölgesini görür. Dostlar kenarda bekler. |
| 5:30–10:00 | **5. Kral Meydanı (boss karşılaşması)** | Unutulan Kral ve 3 aşama (bkz. 8). |
| 10:00–15:50 | **Final sinematiği** | Büyüme (0:30) → oynanabilir uçuş (1:30) → fener yakılır (1:00) → dostlar toplanır + Işık Ejderhalarının selamı (1:05, bkz. 5b) → sabah uyanışı (0:45) → jenerik (1:00) |
| yan A | **Bulut Altı Adası** (~1 dk) | Küçük adada **Peluş Sandığı** (hazine). |
| yan B | **Dostlar Duvarı** (~1 dk) | Fener tabanında bir yan oda: 9 bölümün minik heykelcikleri (çıkartma albümüne bağlı). |

## 4. Bölüme özgü ana mekanik: **"Unutulmuş Oyuncakları Neşelendir, Anıyı Geri Getir"**
Savaş yok. Kral, sisten **unutulmuş oyuncaklar** çağırır (üzgün ve yavaştırlar). Feza oyuncağa yaklaşıp **dokunur/gıdıklar** (kılıç yerine "ışık tüyü"; kılıç ekranda yok). Oyuncak gülünce küçük **tek kalp** çıkar ve oyuncak Kral'ın masasının yanına oturur. Her 3–4 oyuncakta Kral'ın **bir anı çerçevesi** yanar (üç anı: fener, dost, ad).
1. Kral elini kaldırır → sis perdesi aralanır → bir oyuncak çıkar. 
2. Altın halka oyuncağı gösterir; Pırıl: "Üzgünmüş, ona gülelim."
3. Feza dokunur, oyuncak güler, kalp patlar (tek efekt: tek kalp), oyuncak masaya gider.
4. 3 oyuncak sonra Kral'ın üstündeki çerçeve yanar: kısa kıpırtısız anı sahnesi (10 sn, atlanabilir).
- **Yanlış yapma yok:** oyuncaklar Feza'ya yavaşça yaklaşır ve **dokunuşları yumuşaktır** (hafif geri iter, kaybetme yok); can azalınca Pırıl'ın köpük kalkanı otomatik.
- **Sesli ipuçları:** "Üzgünmüş, ona gülelim", "Anı geri geldi", "Kral gülümsüyor."
- **"Neşelendir → boss" kalıbının dışı:** Boss'un canı yoktur, "anı çubuğu" (3 çerçeve) vardır; vurma, kıkırdama, saldırı kavramı yoktur. Oyuncaklar tehlikesizdir, yalnızca **yol kapatır** (işaretlenmiş şerit/halka; çarpma = hafif itme).

## 5. Sürpriz an: **Kıvılcımın sahibi**
- **Nerede:** 3. anı çerçevesi sırasında (Kral'ın son anısı).
- **Ne:** Kral Pırıl'ın göğsündeki kıvılcıma bakar: "O kıvılcım... benimdi. Her oyuncağa bir tane bırakırdım. Biri hâlâ yanıyormuş." Yani peluş Pırıl'ın göğsündeki kıvılcım, Kral'ın ilk armağanı: Feza'nın sevgisi onu söndürmemiş.
- **Tek net efekt (PLAN karar 21):** Pırıl'ın göğsündeki kıvılcımın **bir kopyası** (küçük altın tek kıvılcım) ayrılıp Kral'ın elindeki sönük fenerin içine konar; fener "tık" yanar (yalnız o fener, başka hiçbir şey). **Pırıl'ın kıvılcımı yerinde parlamaya devam eder, azalmaz**; kopya Kral'ın kalır. Kral'ın gözleri dolar (mutlu). Sonraki anı: Feza'nın "adı". Kıvılcım köken bilgisi: Kral Tonton'un eskiden her oyuncağa bıraktığı armağan.

## 5b. Küçük final sahnesi: Işık Ejderhalarının selamı (PLAN karar 20; ~20 sn, atlanabilir)
- **Nerede:** final sinematiğinde fener yandıktan sonra, **dostlar fenerin etrafında toplanırken**.
- **Ne:** uzak adalarda uyuyan üç Işık Ejderhası **tek tek, sırayla** başını kaldırır: önce **Su Işık Ejderhası** (turkuaz-nane), sonra **Toprak Işık Ejderhası** (kahve-yeşil), en son **Ateş Dede** (bal-turuncu). Her biri ~4 sn: başını kaldırır, bir kez göz kırpar/başını eğer, tek yumuşak nota; sonra yeniden uykuya döner; **sonraki ancak önceki bitince başlar**. Işın, halka, ışık yok; kamera sırayla ona bakar. Üçüncüden sonra anne ejderha ve Pırıl'la birlikte beş ejderha kısa bir an aynı karede (yalnız kadraj, efekt yok).
- **Kural:** üst üste efekt yok; anlatıcı en çok 1 cümle/ejderha; mor yalnız Pırıl ve anne ejderha.
- Bu an, sabahki peluşta kıvılcımın kalmasını mantıklı yapar (STORY giriş ve sabah cümleleri: "kıvılcım Feza'nın sevgisiyle yanıyor").

## 6. Düşmanlar (huysuzlar)
- **Gökkuşağı kaynağı (05z_gokkusagi.js):** Şimşekçik (minik gri bulut, çıtırdayan kıvılcım; ışık topu atar), Rüzgâr Balonu (pastel balon, "püüf!" üfler), Dolu Pofuduğu (elit; yumuşak kar topu atar), Yağmur Damlacığı (zıplar), Gökkuşağı Damlacığı (nadir, altın şeker). Hepsi sevimli.
- **Bu bölüme özgü yeni "Unutulmuş Oyuncaklar" (kızgın yok, hepsi üzgün ya da sessiz):**
  1. **Tahta At:** küçük sallanan at; yavaş sallanarak yaklaşır, yere basmaz, "tık-tık".
  2. **Kırık Tren:** raylı küçük tren, düz hatta "tütt" der; hat işareti mavi şerit.
  3. **Müzik Kutusu Balerin:** döner, dönerken pembe halka ses çıkarır; neşelenince melodi çalar.
  4. **Uçurtma:** kuyruklu, gökte süzülür, yeşil halka düşürür.
  5. **Dev Peluş Ayı** (aşama 3): iri, yamru yumru, bir kulağı sökük, gözü düğme; **Pırıl gibi bir peluş**.
- Hepsi neşelenince "yeni gibi" olur (renk canlanır) ve Kral'ın masasına oturur.

## 7. Mini oyun ve gizli şeyler
- **Mini oyun – "Fener Işığı Yuvaları" (final içinde, oynanabilir):** Fener tabanında 9 renkli yuva; Feza parmakla sürükleyerek 9 ışık parçasını sırayla yerine koyar (renkler bölüm sırasına göre). Yanlış yuva yok, her parça yalnız doğru yuvaya yapışır. Her parça yerleşince Pırıl bir hatıra cümlesi söyler (kısa).
- **Gizli hazine 1 – Peluş Sandığı (yan A):** Bulut Altı Adası'nda; Bilbo koklayıp bulur. İçinden **Fener Bekçisi Pelerini** ve minik tahta fener süsü.
- **Gizli hazine 2 – Dostlar Duvarı (yan B):** 9 bölümün boss/dostlarından birer minik heykelcik; hepsini görmek **"Tüm Dostlar" çıkartması** ve albüm sayfası.
- **Gizli 3 (isteğe bağlı):** Yıldız Adası'nda gökte süzülen **Altın Gökkuşağı Damlacığı** (nadir, kaynak); yakalanınca altın şeker.

## 8. Boss: **Unutulan Kral** ("kavga yok")
**Görünüş:** yaşlı, **gümüş sakallı**, yuvarlak gözlük gibi iri üzgün gözler (kızgın yok: kaşları yukarı, omuzları çökük). Sis pelerini ayaklarının dibinde bulut gibi, elinde sönük küçük bir fener, başında yarım yamru taç (bir köşesi kopmuş). Boyu insan boyundan biraz büyük; masaya oturmuş gibi durur (korkutucu yükseklik yok). Model `EMODEL.KIT` iskeleti, tek örgü, ~10–12 bin üçgen.

**Kimliği ve yaşı:** çok yaşlı (kendisi "yüz kere yüz gece" der, tam sayı söylemez). **Görevi:** Büyük Fener'in ilk **rüya bekçisi**: her akşam fenerle çocukların rüyalarına yol açar, uykuya dalan her çocuğun oyuncağına küçük bir **kıvılcım** bırakırdı. Çocuklar büyüyüp oyuncaklarını bırakınca, rüyalar değişince onu hatırlayan kalmamış; yalnız kalmış, yalnızlıktan korkmuş, "kimse beni hatırlamıyorsa herkes her şeyi unutsun, yanımda kalsın" diye sisi yaymış. **Kötü niyeti yok, korkusu var.**

**Adı: Kral Tonton** (ebeveyn kararı, 1 Kasım 2026; dede gibi sıcak). Adı 6. ve 8. bölüm ipuçlarında ve 9. bölüm gölgesinde geçmez; ilk kez bu bölümde söylenir.

**Aşamalar (anı çubuğu: 3 çerçeve; her aşama 3–4 oyuncak):**
- **Aşama 1 – "Sis Oyuncakları" (%100–66):** Kral elini kaldırır, **Tahta At** (sarı daire zıplaması) ve **Kırık Tren** (mavi şerit). 
  - *Tahta At:* yerde **sarı daire** (≥2 sn) → "Sarı daire! At zıplıyor, kenara git."
  - *Kırık Tren:* yerde **mavi şerit** (≥2 sn) → "Mavi şerit! Tren geçiyor."
  - **Anı molası (kıkırdama yerine):** 3. oyuncak sonra çerçeve 1: Kral fenerin ilk yanışını anlatır (kısa, sakin).
- **Aşama 2 – "Gökte Unutulanlar" (%66–33):** **Uçurtmalar** (yeşil halka düşürür) ve **Müzik Kutusu Balerin** (pembe halka).
  - *Uçurtma:* **yeşil halka** → "Yeşil halka! Uçurtma geliyor, kenara geç."
  - *Balerin:* **pembe halka** → "Pembe halka! Müzik kutusu dönüyor."
  - **Çerçeve 2 (anı molası):** çocukların oyuncaklarını getirdiği akşam: Feza'nın oyuncak dostları o anıda küçük görünür (**Sürpriz an**: kıvılcımın sahibi).
- **Aşama 3 – "Dev Peluş Ayı" (%33–0):** tek iri oyuncak: **Pırıl'ın akrabası gibi bir peluş**; yavaş yürür, yere basınca **kırmızı değil turuncu halka** (≥2 sn) → "Turuncu halka! Ayı basıyor." Pırıl onunla konuşur, kıvılcımını ona dokundurur (Pırıl'ın özel hamlesi; ayı gülümser, **tek kalp**). 
  - **Çerçeve 3 (ad):** Kral gözlerini kapar, kendi adını hatırlamaya çalışır; "Adım... ben... Tonton... miydi?" Feza ve Pırıl Kral'ın önüne yürür (altın halka, fener dibi). Feza dokununca (tek dokunuş) Feza ve Pırıl birlikte der: "Tonton! Seni hatırlıyoruz."
- **Neşelenince / bitiş:** Kral gözleri parlayarak gülümser, sakalı daha parlak gümüş olur; sis **tek yumuşak perde gibi** çekilir (yalnız bu efekt); oyuncaklar masada toplanmıştır; Kral'ın fenerinde ilk kıvılcım yanık. Kral: "Fenerin bekçisi olarak kalabilir miyim? Yalnız kalmak istemiyorum." Pırıl: "Hiç yalnız kalmazsın."
- **Saldırı sayısı:** aşama başına 2 oyuncak türü, aynı anda tek tehlike işareti; ilk boss gibi yumuşak. Üst üste iki saldırı yok.

## 9. Eşlik eden karakterler
- **Pırıl (Pırıl kıvılcımı, kalp tozu, köpük kalkanı, kanat rüzgârı):** karşılaşmada Pırıl **Kral'a nazikçe** yaklaşır; kıvılcımını verir. Final: **büyüme + uçuş**.
- **Baba + Kartal:** Baba kamp ateşi yakar (yumuşak sıcak); fener önünde Feza'ya cesaret: "Gurur duyuyorum." Kartal fener etrafında dönerek yön gösterir. **Otomatik:** Feza canı %35 altı/çok oyuncak: Kartal rüzgâr kanadıyla oyuncakları uzaklaştırır (30 sn), Baba battaniye atar (45 sn).
- **Bilbo:** Peluş Sandığı'nı koklar; Kral'ın oyuncak yığınına koşup bir topu ona getirir (Kral'ın ilk gülümsemesi). Biner. **Otomatik havlama:** sersemletir, zarar vermez; bekleme 20 sn.
- **Hala:** ışık ekmeği; Kral'a ekmek: "Yorgunsun, bir parça ye." **Otomatik:** can çok azalınca ekmek (60 sn).
- **Anne ejderha:** kule sonrası yanlarındadır (rengi mor, tanıma sonrası); Pırıl büyüyünce yanında uçar; fener yanarken gökte tek dönüş. **Işık Ejderhaları:** Su, Toprak ve Ateş Dede yalnız 5b'deki selam sahnesinde görünür.
- **Kural:** aynı anda en çok bir yardım gösterilir.

## 10. Ödüller
- **Pırıl gücü:** **büyüme/uçuş** (final).
- **Işık parçası:** yok; **tüm parçalar fenerde birleşir**.
- **Envanter:** Fener Bekçisi Pelerini (gizli), Kral Tonton'un Gümüş Tacı (Kral Feza'ya armağan eder, fantastik süs; 8. bölümdeki kırık tacın tamiri gibi), "Tüm Dostlar" çıkartması, final hediyesi tek kart.
- **Sakin anda:** jenerikten sonra tek kart; boss/sinematik sırasında yok.

## 11. Anlatıcı ve Pırıl cümleleri (41 cümle; `b10_...`; Kral'ın adı Tonton, kesin)
- `b10_giris_a`: "Büyük Fener sönük duruyor. Sis her yeri sarmış."
- `b10_giris_p`: "Bu yolu hatırlıyorum. Annem bana bu fenerden bahsederdi."
- `b10_dostlar`: "Hepsi yanında. Baba, Kartal, Bilbo, Hala, anne ejderha."
- `b10_baba`: "Baba dedi ki: Seninle gurur duyuyorum."
- `b10_yagmur`: "Yağmur Adası'nda bazı oyuncaklar çok üzgün."
- `b10_oyuncak`: "Bu tahta at hiç kimse oynamamış, ona gülelim."
- `b10_kopru`: "Köprüdeki renkler yanıyor. Her biri bir dostumuz."
- `b10_fener_a`: "Fenerin dibinde yaşlı bir kral oturuyor."
- `b10_resim_p`: "Mabetteki resimdeki yaşlı bu! Rafta gördüğümüz kırık taç da onun."
- `b10_kral_giris`: "Merhaba... Ben çok uzun zamandır burada bekliyorum."
- `b10_kral_sis`: "Kimse beni hatırlamıyor. O yüzden sis herkese her şeyi unutturdu."
- `b10_pirilsoyle`: "Üzgün bir kral. Ona kızmayalım, ona yardım edelim."
- `b10_kral_oyuncak`: "Bu oyuncaklar benimle kaldı. Onları kimse sevmiyor."
- `b10_ipucu_gul`: "Üzgünmüş, ona gülelim."
- `b10_sari`: "Sarı daire! At zıplıyor, kenara git."
- `b10_mavi`: "Mavi şerit! Tren geçiyor."
- `b10_yesil`: "Yeşil halka! Uçurtma geliyor, kenara geç."
- `b10_pembe`: "Pembe halka! Müzik kutusu dönüyor."
- `b10_turuncu`: "Turuncu halka! Ayı basıyor."
- `b10_ani1`: "Birinci anı: fener ilk kez yanıyor. Kral gülümsedi."
- `b10_ani2_kivilcim`: "O kıvılcım benimdi. Her oyuncağa bir tane bırakırdım."
- `b10_pirilkivilcim`: "Kıvılcımım hâlâ yanıyor. Feza beni hiç unutmadı."
- `b10_kivilcim_kopya`: "Sana da bir kıvılcım veriyorum, Tonton. Benimki de bende kalsın."
- `b10_ani2`: "İkinci anı: çocuklar oyuncaklarını bana getiriyorlar."
- `b10_ayi`: "Bu da Pırıl gibi bir peluş. Ona sarıl, Pırıl."
- `b10_ad_a`: "Kral kendi adını hatırlamaya çalışıyor."
- `b10_ad_p`: "Senin adın Tonton! Seni hatırlıyoruz."
- `b10_ad_f`: "Tonton! Seni hatırlıyoruz."
- `b10_sis`: "Sis çekiliyor. Ne kadar güzel bir gece."
- `b10_kral_son`: "Teşekkür ederim. Artık fenerin bekçisi olarak yalnız değilim."
- `b10_pirilbuyu`: "Kanatlarım büyüyor! Hadi, bin sırtıma, Feza."
- `b10_ucus`: "Gökyüzü hepimizin. Işıkları birlikte toplayalım."
- `b10_fener_yak`: "Dokuz ışık, bir fener. Hep birlikte yakalım."
- `b10_fener_oldu`: "Büyük Fener yandı. Bütün çocukların rüyaları yolunu bulacak."
- `b10_dostlar_son`: "Bütün dostlar fenerin etrafında toplandı."
- `b10_ejder_su`: "Su Işık Ejderhası başını kaldırdı. Bize selam veriyor."
- `b10_ejder_toprak`: "Toprak Işık Ejderhası da gözünü açtı. Selam, büyük dost!"
- `b10_ejder_ates`: "Ateş Dede de başını eğdi. Pırıl'a gülümsüyor."
- `b10_bes_ejder`: "Beş Işık Ejderhası yeniden bir arada: Su, Toprak, Ateş, anne ve Pırıl."
- `b10_uyanis_a`: "Sabah oldu. Feza yatağında uyanıyor."
- `b10_uyanis_p`: "Günaydın Feza. Tatlı rüyalar gördün mü?"
- `b10_son_a`: "Peluş Pırıl'ın göğsünde minik bir kıvılcım hâlâ parlıyor."

(Not: "Aa/Oo/Hihi" yok; "Fener", "Kral" doğru. Uyanışta peluş konuşmaz, yalnız anlatıcı ve Feza gülümser. `b10_uyanis_p` Pırıl'ın sessiz rüyadaki son cümlesi olarak uyanıştan hemen önce, dalgın "gelen sesle" söylenebilir.)

## 12. Müzik / ses atmosferi
- **Bulut Basamakları → Köprü:** hafif gökkuşağı çalgıları (kaynak `pr_gokkusagi`), bulut çanları.
- **Kral Meydanı:** ağır ve sıcak; viyolonsel + tek çelesta; Kral'ın teması **bölüm 9'un ninnisinin yavaş hâli**; her anıyla çalgı eklenir.
- **Final:** kaynak `pr_final` coşkusu + bölüm 9 ninnisi tam orkestra; büyüme anında kısa susma; uçuşta hafif ritim.
- **Sabah:** kuş sesleri, tek müzik kutusu. **Jenerik:** `pr_menu` ninnisi.
- Sis: hafif rüzgâr, korkutucu fısıltı yok.

## 13. Çocuk için risk ve sadelik
- **En büyük risk (final):** büyüme + uçuş + gökkuşağı + dostlar + fener yanması + sabah aynı anda "çok olay". **Önlem:** sinematik **sıralı** (altı ayrı an), her an tek efekt; fener yanışı "ışık sütunu/halka" yerine **lambanın içten yanması** ve dünyaya yumuşak sıcak ton; dostlar toplanırken başka efekt yok.
- Kral üzüntüsü fazla gelmesin: ağlama yok, sakin, nazik ses; "unutulmak" yerine "hatırlanmak".
- Anı sahneleri uzun olmasın (10 sn) ve atlanabilir.
- Uçuş oynanabilirliği kolay: parmakla yön, kaybetme yok, çarpma yok.
- Mor renk yalnız Pırıl (ve tanıma sonrası anne ejderha); sis inci-gri.
- 5 yaşın "büyüyünce unutulur" kaygısı: mesaj "büyüsen de hatırlarsın" (Pırıl'ın "kıvılcım hep yanar" cümlesi).

## 14. Teknik taşıma notu
- **Kaynak (okunan):** `piril/src/06z_gokkusagi.js` (Ada alanı, köprüler, bulut denizi, parçacıklar, süs modelleri, yerleşim; ~72 KB), `05z_gokkusagi.js` (Gökkuşağı Adaları huysuzları, **ZM işaret havuzu**, Koca Fırtına Bulutu aşamaları, `GAME.on('boss', ...)`, ~53 KB), `10_story.js` `endingBeats()` ~669–727 (büyüme `PIRIL_GUC.buyu(true)`, `sideCam`/eyer yüksekliği, `buildRainbow`, `buildCloud`, `buildBedroom(true)` sabah, `credits`, `CREDITS`), `PIRIL.md` bölüm 1–2 (final akışı), `04_piril_guc.js` (büyüme).
- **Yeniden yazılacak:** Fırtına Bulutu boss'u çıkarılır; yerine "Unutulan Kral" boss'u (`HUYSUZ.boss` + `BOSSDAV.register`, hp yok; "anı çubuğu" 3 çerçeve); final sinematiği genişletilir (Kral'dan sonra dostlar, fener yakma, jenerik güncellenir).
- **Yeni yazılacak:** Unutulan Kral modeli (`EMODEL.KIT` ~10–12k üçgen); 5 oyuncak türü (Tahta At, Kırık Tren, Balerin, Uçurtma, Dev Peluş Ayı) ve neşelenme/masaya oturma davranışı; anı çerçevesi sahnesi (3 adet, atlanabilir); **Büyük Fener modeli** (9 cam yüz + tepe yuva) ve haritadaki fener görseliyle **renk/sıra birliği** (CORE/harita ajanıyla; haritadaki fener 9+1 yapıda olmalı); **oynanabilir uçuş** (Pırıl'ın sırtında, parmakla yön; 9 ışık toplama); "Fener Işığı Yuvaları" mini sahnesi; dostların toplanma anı (önceki bölüm dostlarının küçük kopyaları; model yeniden kullanımı); jenerik içeriği güncelleme; Pırıl'ın kıvılcımının Kral fenerine geçişi (tek efekt).
- **Zorluk:** **Yüksek** (final, çok sahne). Motor ihtiyaçları: bölüm içinde sinematik kancası, boss "anı çubuğu" modu, kamera uçuş modu, harita fener görseli, sıralı efekt kuyruğu (tek büyük efekt).

## 15. Açık sorular (ebeveyne)
1. ~~Kral'ın adı~~ **KARARLAŞTI (PLAN karar 21): Tonton.**
2. ~~Kıvılcım açıklaması~~ **KARARLAŞTI (karar 21):** Kral'ın armağanı; Kral'a bir kopya konur, Pırıl'da kalır.
3. (Kalan küçük soru) **Final uzunluğu:** oyun ~10 dk + sinematik ~5–6 dk fazla gelirse "oynanabilir uçuş" ve "Fener Işığı Yuvaları"nı kısaltalım mı (öneri: ikisi de atlanabilir olsun).
