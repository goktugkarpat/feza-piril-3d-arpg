# Bölüm 2: Mercan Krallığı
- **Eşlik eden:** yalnız Pırıl · **Süre:** ~11 dakika · **Işık parçası:** 2. ışık · **Pırıl'ın gücü:** köpük kalkanı (Su Işık Ejderhası'ndan geri alır) · **İpucu:** "Işık, sisle yutulmuş ormanın derinliğinde." (3. bölüme: Huysuz Orman)

## 1. Bir cümlede bölüm
Feza ve Pırıl dev bir köpük kabarcığının içinde köpük gölünün dibine iner; mercan krallığında kabarcık bacalarıyla uçarak ilerler, uyuyan Su Işık Ejderhası'nı bulur (Pırıl köpük kalkanını geri alır) ve İnci Sarayı'nda Koca Kirpi Balık'ı neşelendirip ikinci ışığı alır.
- **Nasıl gelinir:** Bölüm 1 sonunda ipucu "Işık denizlerin altında uyuyor"; yolculuk sahnesinde ışıklı dere köpük gölüne akar, Pırıl dev bir köpük kabarcığı üfler, ikisi içine biner ve batar (Huysuz Tuvalet Rüyası'ndaki **köpük roketi** fikrinin ters yönü: yükselmek yerine dalmak).
- **Sonu:** Boss neşelenir → tek ışık topu Pırıl'a uçar → ışık parçası + ipucu (Orman) → uyku molası → atlanabilir yolculuk: dev bir kabarcık Feza ve Pırıl'ı yüzeye çıkarır, kıyıda sisle örtülü bir orman görünür; Bölüm 3 başlar.

## 2. Görsel kimlik
Huysuz'un görsel dili (kaynak koddan): parlak pastel, cilalı yüzeyler (pürüzlülük ~0,4), kenarda ince beyaz-açık ışık çizgisi, açık yürünür zemin / koyu dış alan, yoğun kenar dekoru / seyrek iç alan, geniş hafif ışık + tek güneş. En yakın Huysuz teması **Tuvalet Rüyası (`06_level.js`, tema bathroom)**: sis 0xadd9df (34→80), hemi 0,85, güneş 2,0, bloom 0,42, sat 1,06, vignette 0,24, pastel çini zemin (0xe0fff9 / 0xffd9ee / 0xfff4c7), baloncuk/köpük/sabun.
- **Aynen korunan (06z_mercan.js):** kumlu/dalgacıklı zemin, zeminde ışık desenleri (caustics), suya inen ışık huzmeleri, yükselen kabarcıklar, plankton, sürü balıklar, denizanaları, mercanlar (beyin, dallı, yelpaze, tüp sünger), şakayıklar, kelp, batık oyuncak gemi, İnci Sarayı (dev istiridye, mercan sütunları), Feza'nın baloncuk kaskı, girişteki el sallayan yengeç, tüm 3B modeller (05z_mercan.js).
- **Huysuz'dan alınan:** Tuvalet'in cilalı/pastel yüzey ve iki katlı "zemin + süslü bordür" düzeni (kum şeridin kenarında turkuaz çizgi + kabuklar, kaynakta SADE5 ile var); sis ve pozlama: sis 0x2a9ccc → daha açık, gün ışıklı turkuaz (~0x8fd8e8, 30→86), pozlama 1,0, bloom 0,35, rim beyaz 0,15. Köpük ve baloncuk dokusu Tuvalet'ten (cam gibi, pembe-mavi kenar parlaması: kaynakta `rimify` aynı iş).
- **Değişenler:** (1) **Mor yalnız Pırıl'ın:** kaynaktaki mor mercan/beyin mercanı (0xb98aff, 0xc8a0ff), mor-mavi mağara ağzı, mor boss yolu → turuncu/pembe/mavi/yeşil. (2) Kum yol çok açık krem, kenarda turkuaz çizgi. (3) Köpük gölü ve dev kabarcık girişi yeni (Huysuz'dan renk).
- Yürünür alanda iri/yüksek nesne yok: mercan adacıkları yolun dışında, alçak.

## 3. Alanlar (5 ana + 2 yan) ve dakika dakika
| Dakika | Alan | Ne olur |
|---|---|---|
| 0:00–0:40 | **0. Köpük Gölü dalışı (kısa sahne)** | Kabarcık içinde iniş, kask takılır |
| 0:40–2:30 | **1. Kabuk Kumsalı** | Yengeç, kabuklar, ilk kabarcık bacaları |
| 2:30–4:30 | **2. Mercan Ormanı** | Mercanlar, şakayıklar, istiridyeler, balon balığı yavruları |
| 4:30–6:30 | **3. Batık Gemi Koyu** | Kelp, batık oyuncak gemi hazinesi, takla yıldız, köpük ahtapot |
| 6:30–8:00 | **4. İnci Mağarası** | Işıklı inciler, **uyuyan Su Işık Ejderhası** |
| (aralara) | **Yan 1: Dev İnci Köşesi** · **Yan 2: Mesaj Şişesi Kumsalı** (~1 dk) | Gizliler |
| 8:00–11:00 | **5. İnci Sarayı (arena)** | Koca Kirpi Balık |
- **Alan 0:** şeffaf kabarcık yavaşça batar, yukarıdan ışık huzmeleri; Feza'nın başına baloncuk kask oturur. Oynanış yok, atlanabilir.
- **Alan 1 Kabuk Kumsalı:** kumlu koy, kabuklar, deniz otu; girişte el sallayan yengeç (dokununca zıplar, kabarcık üfler). 2. odada 3'lü **kabarcık bacası** zinciri, tepede altın şeker.
- **Alan 2 Mercan Ormanı:** renk renk mercanlar, sallanan şakayık dokunaçları, **inci istiridyeleri** (dokununca açılır, şeker).
- **Alan 3 Batık Gemi Koyu:** uzun kelp ormanı, batık **oyuncak gemi** (güverteye dokununca hazine sandığı açılır), çapa, 2'li kabarcık bacası.
- **Alan 4 İnci Mağarası:** açık deniz mağarası, yerde parlayan inciler, ışık saçan istiridyeler; içinde ejderha.
- **Alan 5 İnci Sarayı:** dev açık istiridye, mercan sütunları, ortada büyük inci.
- **Yan 1 Dev İnci Köşesi:** dev istiridyede kocaman inci → altın şeker + çıkartma. **Yan 2 Mesaj Şişesi Kumsalı:** mesaj şişesi, kum yığınları (dokununca şeker fışkırır).

## 4. Bölüme özgü ana mekanik: "Köpük Dalışı ve Kabarcık Uçuşu"
- **Dalış:** bölüm girişi köpük kabarcığıyla; su altında nefes sorunu **yok** ("bu bir rüya", Pırıl söyler). Hava çubuğu/boğulma yok.
- **Kabarcık bacası (kaynakta var):** Feza bacaya basar → kabarcık Feza'yı sarar ve yay çizerek önceden belli bir adaya/sonraki bacaya taşır. İniş noktası sabit, yanlış yok. Zincir: 3 baca ardı ardına, tepede altın şeker.
- **Yeni ("Derin Çukur"):** yol bazen **derin mavi çukurdan** (yürünmez alan) kesilir; karşı kıyıya ancak bacadan geçilir. Feza çukur kenarına yaklaşınca Pırıl baca yönüne uçup parlar (`pointTo`). Çukura düşmek yok (zemin görünmez duvar değil, koyu su; adım atamaz).
- **Pırıl'ın kabarcıkları:** Pırıl yüzerken arkasından kabarcık bırakır; Feza dokunursa Pırıl köpük üfler ve sonraki baca beliriverir (sadece görsel yardım).
- **"Neşelendir → boss" dışında:** (1) baca uçuşu, (2) istiridye/gemi hazine açma, (3) **Ejderhayı Uyandırmadan Süslemek (Alan 4 mini görev):** 3 parlayan inciyi ejderhanın yanındaki 3 kabuğa getirmek (inci üstüne dokun, Pırıl taşır; yanlış kabuk yok). Her inciyle ejderha uykuda gülümser.
- **Sesli ipucu:** "Kabarcık bacasına bas! Kabarcık seni havaya uçuracak."

## 5. Sürpriz an: "Kum tepesi nefes alıyor"
Alan 4'te, mağaranın ortasındaki yumuşak kum tepesine yaklaşınca tepe yavaşça **yükselip alçalır** (nefes). Pırıl çok hafifçe titrer, sonra fısıldar: "Bu bir Işık Ejderhası. Bana çok tanıdık geliyor." (Yalnız duygusal ipucu; "anne/akraba/ailem" sözcüğü yok, anne sözcüğü ilk kez B9 tanıma anında; PLAN karar 19.) Kum silkelenir, **Su Işık Ejderhası'nın sırtı** görünür (uyuyor, turkuaz-nane, minik yüzgeç kanatlar). Tek net efekt: ejderha uykusunda **tek büyük köpük kabarcığı** üfler; kabarcık Pırıl'ın etrafında durur ve oturur: **köpük kalkanı** geri gelir. Başka ışık/konfeti yok. Ejderha uyanmaz; Pırıl "Sen rahat uyu, seni unutmayacağız" der. (Su Işık Ejderhası uyumaya devam eder; 10. bölümde dostlar toplanırken başını kaldırıp selam verecek, PLAN karar 20.)

## 6. Düşmanlar (kaynak: 05z_mercan.js)
Hepsi yuvarlak, gülen, en fazla yaramaz; neşelenince ^ ^ gözler, kalpler; böcek yok, kızgın yüz yok.
- **Balon Balığı Yavrusu:** sarı, yumuşak dikenli; hazırlıkta kocaman şişer, zıplayıp "pof!" diye söner. Elit: pembe, taçlı.
- **Takla Denizyıldızı:** turuncu benekli; kollarını açıp tekerlek gibi takla atarak yuvarlanır. Yan kaçılır.
- **Renkli Köpük Ahtapotçuk:** mavi-turkuaz (mor yok); mürekkep yerine **renkli köpük baloncuğu** üfler (uzaktan, yumuşak); elit: denizci şapkalı.
- **Deniz Atı:** turkuaz; kuyruğunu kıvırıp hızla süzülür.
- **Yeni (bu bölüme özel):** **Uykulu Midye** (Alan 4): ejderha mağarasında gözleri kapalı, açıp kapanır; dokununca kıkırdar, içinden inci düşer; mini görev incilerini bunlar bırakır. **Yavru Balık Sürüsü** (kaynakta var): dokununca dağılır, toplanır (düşman değil, dekor).
- Dağılım: Alan 1'de ilk huysuz yok/en çok 1–2; Alan 2'de Balon Balığı + Takla Yıldız; Alan 3'te Köpük Ahtapot + Deniz Atı.

## 7. Mini oyun / yan etkinlik / gizli şeyler
- **İnci süsleme (Alan 4):** yukarıda; ödül = köpük kalkanı gösterisi öncesi 3 altın şeker.
- **Batık gemi hazinesi:** güverteye dokun → sandık açılır. Ses: "Gemi hazinesi! Altın şeker de varmış!"
- **Dev İnci (Yan 1), Mesaj Şişesi (Yan 2):** çıkartmalar ("İnci", "Mesaj Şişesi"); şişenin içinden **Köpük Pelerini** çıkar (gizli ödül).
- **Kum yığınları:** içinden altın şeker fışkırır.
- **Gizli (yeni):** Kelp ormanında dinlenen bir **balık okulu**: Feza çevresinde dönünce balıklar kalp şekli yapar (tek, sade, 3 sn).

## 8. Boss: Koca Kirpi Balık
**Görünüş:** yuvarlak, tombul, dikenleri yumuşak (balon gibi) kirpi balık; büyük sevimli gözler, pembe dudaklar; hazırlıkta şişer, sonra söner. **Kimlik:** İnci Sarayı'nın bekçisi; sis yüzünden yolunu şaşırıp sürekli hıçkıran, şişip duran balık. Kızgın değil, huzursuz.
**Aşamalar (can %66 / %33; geçişte "komik hıçkırık", hıçkırırken hasar yarısı):**
| Aşama | Saldırılar | Not |
|---|---|---|
| 1 (>%66) | Kabarcık Halkası (1 şerit), Şişip Zıplama | yalnız bunlar |
| 2 (%66–33) | + Yuvarlanma, halka 2 şerit | yuvarlanmada boşluk geniş |
| 3 (<%33) | halka 3 şerit (kaynakta 5 idi, indirildi), iki zıplama, yuvarlanma | |
Her **2 hamlede bir "Puf"** (kaynakta 3): balon gibi söner, arenada zikzak uçar (zararsız), sonra **sersem** yatar = **kıkırdama molası** (vuruş ×1,5).
**Saldırılar ve uyarılar (≥2,2 sn işaret; renk söylenenle aynı; mor yok):**
- **Kabarcık Halkası (2,6 sn):** dudaklarını büzer, Feza yönünde yolların üstüne dışa doğru **mavi halkalar**. Ses: "Mavi halkalar geliyor! Boşluğa geç." Halkalar yavaş süzülür.
- **Şişip Zıplama (1,25 sn):** Feza'nın yerinde **turuncu halka**, sonra "hop" iniş. Ses: "Kocaman şişti! Turuncu halkanın dışına çık, hop diye inecek."
- **Yuvarlanma (1,4 sn):** arenada **yeşil yol** (kaynakta mor) belirir, sonra top gibi yuvarlanır. Ses: "Yeşil yolun dışına çık, Koca Kirpi Balık yuvarlanıyor!"
- **Puf / Sersem:** Ses: "Başı döndü! Şimdi koş, ona kocaman bir gülücük ver!"
- **Aşama cümleleri:** 2. aşama: "Hıçkırık tuttu! Şimdi top gibi yuvarlanacak, yeşil yoldan çekil." · 3. aşama: "Yine hıçkırdı! Artık iki kere zıplıyor, turuncu halkadan uzak dur."
**Yumuşaklık:** saldırılar arası ≥1,2 sn, hasar düşük, Pırıl'ın köpük kalkanı Feza'nın canı azalınca **otomatik** köpük balonuyla sarar (kaybetmek yok).
**Neşelenince (tek net efekt):** Koca Kirpi Balık Feza'ya ve Pırıl'a **kabarcıktan kalp üfler**, el sallayıp yüzerek gider; **tek ışık topu** Pırıl'a uçar. Kaynaktaki "kabarcık fıskiyeleri + inci ışıltısı" kutlaması **sade**: fıskiyeler kaldırılır, yalnız kalp kabarcık kalır.

## 9. Eşlik eden karakterler
- **Pırıl:** su altında kanatlarla yüzer, arkasında kabarcık izi; Feza'nın başına konabilir. Alan 0: "Su altında da nefes alabiliyoruz, çünkü bu bir rüya!" Alan 4: ejderhayı tanır, köpük kalkanını geri alır. Boss'ta kalkanı Feza zor durumdayken **otomatik** (en çok 20 sn'de bir). Işık nefesi Bölüm 1'den (kalkanla birlikte iki güç).
- Baba/Kartal/Bilbo/Hala yok.

## 10. Ödüller
- **Işık parçası:** 2. ışık; **güç:** köpük kalkanı (kalıcı).
- **Envanter:** boss: **İnci Tacı** (taç); gizli: **Köpük Pelerini** (Huysuz'daki köpük pelerini hatırası); kabuk kolyesi, çıkartmalar.
- Altın şeker; hazine/istiridye/kum.

## 11. Anlatıcı ve Pırıl cümleleri (anahtar → cümle)
- `b02_giris` Mercan Krallığı'na geldik! Rengârenk mercanlar baloncuklar içinde.
- `b02_pirilGiris` Su altında da nefes alabiliyoruz, çünkü bu bir rüya!
- `b02_dalis` Kocaman bir köpük kabarcığı! İçine bin, birlikte dalıyoruz.
- `b02_kabarcik` Kabarcık bacasına bas! Kabarcık seni havaya uçuracak.
- `b02_altin1` Altın şeker! Ne güzel parlıyor!
- `b02_altin2` Bir altın şeker daha buldun!
- `b02_yengec` Bak, yengeç el sallıyor! Ona dokun.
- `b02_ilkBalon` Bak bak, bir balon balığı yavrusu! Şişince kocaman oluyor, sonra pof diye sönüyor.
- `b02_ilkTakla` Bu denizyıldızı takla atmayı çok seviyor! Yuvarlanınca yana kaç.
- `b02_ilkAhtapot` Minik ahtapot renkli köpük üflüyor! Köpükten kaçıp ona yaklaş.
- `b02_ilkDenizati` Bir deniz atı! Kuyruğunu kıvırınca hızla süzülecek, hazır ol.
- `b02_istiridye` İstiridye açıldı! İçinden şekerler çıktı.
- `b02_orta` Deniz kabukları şarkı söylüyor. Yarı yola geldik!
- `b02_pirilOrta` Işığım şu mercanların arkasında parlıyor olmalı!
- `b02_gemi` Bak, batık bir oyuncak gemi! Önündeki sandığa dokun.
- `b02_gemiHazine` Gemi hazinesi! Altın şeker de varmış!
- `b02_cukur` Derin su! Kabarcık bacasına bas, karşıya uçarız.
- `b02_ejderhaTepe` Şşş, kum tepesi nefes alıyor!
- `b02_ejderha` Bu bir Su Işık Ejderhası! Uyuyor, sakın uyandırma.
- `b02_ejderhaTanidik` Bana çok tanıdık geliyor. Sen rahat uyu, seni unutmayacağız.
- `b02_inciGetir` Parlayan incileri kabuklara götür. Ejderha rüyasında gülümsesin.
- `b02_kalkan` Köpük kalkanım geri geldi! Seni kabarcıkla saracağım.
- `b02_arena` Burası İnci Sarayı. Koca Kirpi Balık burada yaşıyor.
- `b02_bossGiris` Vay, Koca Kirpi Balık şişip şişip duruyor! Hadi onu güldürelim!
- `b02_halka` Mavi halkalar geliyor! Boşluğa geç.
- `b02_sisir` Kocaman şişti! Turuncu halkanın dışına çık, hop diye inecek.
- `b02_yuvarlan` Yeşil yolun dışına çık, Koca Kirpi Balık yuvarlanıyor!
- `b02_sersem` Başı döndü! Şimdi koş, ona kocaman bir gülücük ver!
- `b02_asama2` Hıçkırık tuttu! Şimdi top gibi yuvarlanacak, yeşil yoldan çekil.
- `b02_asama3` Yine hıçkırdı! Artık iki kere zıplıyor, turuncu halkadan uzak dur.
- `b02_yarim` Koca Kirpi Balık gülümsemeye başladı! Devam et!
- `b02_bitti` Yaşasın! Koca Kirpi Balık çok mutlu, Pırıl'ın ikinci ışığını geri verdi!
- `b02_kutlama` Kabarcıklar dans ediyor! Deniz bahçesi seninle gurur duyuyor.
- `b02_ipucu` Işık, sisle örtülü bir ormanın derinliğinde. Hadi oraya gidelim!
~36 cümle. Aşama cümleleri yer işareti çizildiği anda (yüksek öncelik) söylenir.

## 12. Müzik/ses atmosferi
Dalga sesi, su altı çınlaması; harp/arp, hafif ksilofon, yumuşak flüt; yavaş vals tadı. Kabarcık bacası: "fışş" + kısa çan. Mağarada ejderhanın nefesi: düşük, sıcak, tek nota; kalkan gelince tek çan. Boss: oyuncak tuba/ud "pof" vurguları, komik hıçkırık.

## 13. Çocuk için risk ve sadelik notları
- **Efekt kalabalığı riski yüksek:** ışık huzmeleri + caustics + kabarcıklar + plankton + sürü balık + denizanası. Önlem: yalnız 3 katman aynı anda (zemin caustics sönük, huzmeler tek yönlü, kabarcıklar seyrek); sürüler yalnız kenarda.
- Boss'ta kabarcık sütunları ve halkalar karışmasın: halka ve şerit renkleri **mavi/turuncu/yeşil** tek tek; ışık huzmeleri arenada kapalı.
- Çukur korkusu yok: koyu mavi ama sade; düşme yok.
- Mor yasağı; mağaranın ışığı açık mavi/pembe (mor-mavi yerine).
- Kask Feza'nın yüzünü kapatmaz (şeffaf, ince).

## 14. Teknik taşıma notu
- **Kaynak:** `piril/src/06z_mercan.js` (1396 satır): malzemeler (41–), yerleşim/vents (140–260), modeller (259–), yol (404), yengeç (441), gölgelendiriciler (473–550), sürüler (551), etkileşim: bacalar `R.arc`, picks, zones (610–700), bacalar/kabarcık sütunları (698–), Kirpi Balık kutlama `FIN` (1007–1085), yavru balık sürüsü (1085), kask (1129), `kur` (1154–1340), `kurSon` (1339), olaylar (1353), `BOLUM.define` (1379); `05z_mercan.js` (722 satır): 4 düşman + boss modeli (6–465), `BOSSDAV.register` (571–720); `02l_mercan.js`.
- **Huysuz referansı:** Tuvalet Rüyası sahne ayarları (`huysuz/src/06_level.js` ~satır 1716 zemin, 2463 ışık), köpük roketi/geçiş anlatımı (`huysuz/src/02_audio.js` satır 1489–1490 `kopukusta_bitti`, `roket_yolculuk`; `09_ui.js` satır 866+ "journeyArt").
- **Taşı:** büyük bölümü olduğu gibi. **Yeniden yaz:** (1) palet (mor→turuncu/pembe/mavi, mağara rengi); (2) taban `moon` yerine Huysuz Tuvalet tarzı cilalı zemin; (3) boss yolu mor→yeşil, sayıları kıs; (4) kutlama sadeleştir; (5) puf aralığı 3→2.
- **Yeni yaz:** Köpük Gölü dalış ara sahnesi (yolculuk sahnesi + kask takılması), Derin Çukur + Pırıl `pointTo` yönlendirmesi, Su Işık Ejderhası modeli (uyuyan, kum tepesi nefesi) ve inci süsleme mini görevi, Uykulu Midye, köpük kalkanının `PIRIL_GUC` seviye 2 ile bağlanması ve otomatik köpük balonu, Köpük Pelerini ödülü, 2. bölüme özel yolculuk (yüzeye çıkış).
- **Zorluk: Orta–Yüksek** (en çok iş: ejderha modeli + çukur/baca akışı). **Motor gereksinimi:** kabarcık yayı ile hareketin "çukur"u atlaması (R.arc zaten var), aynı anda 3 efekt sınırı, Pırıl'ın su altı pozu (kaynakta var).

## 15. Açık sorular (ebeveyne)
1. ~~Su Işık Ejderhası uyanmadan mı kalsın?~~ **KARARLAŞTI (PLAN karar 20):** bu bölümde uyur; 10. bölümde selam verir.
2. ~~Pırıl "annem/akrabam gibi" desin mi?~~ **KARARLAŞTI (karar 19):** yalnız "Bana çok tanıdık geliyor".
3. Derin Çukur (kabarcıkla karşıya uçma) çocuk için fazla "boşluk" hissi verir mi, yoksa sade mercan "duvar"ı mı olsun?
