# BÖLÜM 4 — Altın Değirmen Vadisi
- **Eşlik edenler:** Pırıl + **Hala** (rüya kılığında köyün fırıncısı). Bilbo, Baba, Kartal yok.
- **Tahmini süre:** 11–12 dakika
- **Işık parçası:** 4. ışık parçası, Ekmek Işığı (Değirmen Bekçisi'nin çarklarından, ışık ekmeği dilimiyle)
- **İpucu (5. bölüme):** "Işık yerin altında, taşların ve kristallerin arasında."

## 1. Bir cümlede bölüm
Sessiz Sis, altın başaklı vadideki değirmen kasabasının çarklarını durdurmuş; Feza ve Pırıl, fırıncı Hala'nın tarifiyle un, su ve ateşi toplayıp **ışık ekmeği** pişirir ve ekmek kokusuyla kasabayı, sonra Değirmen Bekçisi'ni neşelendirir.

**Hikâyedeki yeri:** 3. bölümün sonundaki ipucu "Işık, altın başakların arasında, çarkları durmuş bir değirmende." Kartal Feza'yı tarlaların kıyısına bırakır. Vadide hiç kimse hareket etmiyor; yalnız uzaktan fırın bacasından ince bir duman. Bölüm sonunda Bekçi'nin çarkları döner, ışık parçası Pırıl'a uçar; ipucu söylenir; atlanabilir yolculuk: Hala sıcak bir ışık ekmeği kırıntısı bırakır, kırıntı izi tepenin altındaki bir deliğe iner; Feza ve Pırıl kaydıraktan aşağıya kayar (mağaraya, ~10 sn, "Geç" var).

## 2. Görsel kimlik
- **Palet:** altın sarısı, krem, açık berrak mavi dere, bakır-kırmızı çatılar ve çarklar, sıcak ahşap, gri-krem taş. **Süt beyazı yok.** Mor yalnız Pırıl'ın.
- **Işık:** sıcak öğleden sonra güneşi, yumuşak. Sis yalnız kasabada ince bir inci perde (durmuş yerde); çark döndükçe çekilir.
- **Zemin:** ince toprak/başak dokusu, taş yol kenarda; düşük kontrast. Dere berrak, hafif ışıltılı (kum görünür).
- **Dekor:** altın başak tarlaları (alçak, yürünür alanda yüksek nesne yok), altın tepeler, taş kemerler, taş/ahşap köprüler, çit, çan direkleri, küçük kasaba evleri, bakır çatılı fırın, kasaba meydanı çeşmesi, dev değirmen.
- **Kaynaktan AYNEN korunan görünüm** (`huysuz/src/06_level.js` `buildDairy`, `dairyField`, `hill`, `SWIRL_TINT`, bridges, bells, meadow, falls, `05_enemies.js` krem renk dokuları `DAIRY` paleti ve parlak lathe profilleri): tepecik ve köprü yerleşim mantığı, çit/çan/çayır, parlak "cilalı" malzeme. 
- **Yeniden çerçevelenen** (PLAN §4): süt/kefir nehri → **berrak ışıltılı dere**; yoğurt tepecikleri → **altın tepeler (başak/saman rengi)**; delikli peynir duvar/kapı → **taş duvar ve taş kemer (delikler = kemer açıklıkları)**; güğüm/yayık → **değirmen çarkı ve su kovası**; bisküvi köprü → **taş/ahşap köprü**; kefir şişesi kalpleri (can) → **minik sıcak ekmek kalpleri**; uzaktaki inek sesi → **uzaktan bir çan sesi**.

## 3. Alanlar (5 ana + 2 yan, ~11,5 dk)
| Dk | Alan | Ne olur |
|---|---|---|
| 0:00–1:30 | **1. Altın Tarlalar** | Feza ve Pırıl başaklar arasında yürür; uzakta durmuş değirmen. İlk **Un Torbacığı** ve **Başak Huysuzu**. Feza **başak demetlerini** toplar (tarif adımı: un). |
| 1:30–3:30 | **2. Berrak Dere ve Köprüler** | Dere, taş ve ahşap köprüler, su çarklı kuyu. Feza kovayla **su** alır (tarif adımı: su). Küçük köprü zıplaması. |
| 3:30–5:30 | **3. Altın Tepeler ve Taş Kemerler** | Tepelerin arasında taş kemerli geçitler. Üç **Kor Taşı**'nı Pırıl'ın ışığıyla uyandırır (tarif adımı: ateş). |
| 5:30–8:30 | **4. Durmuş Kasaba ve Fırın Meydanı** | Kasaba donmuş gibi; Un torbaları ve ekmek tezgâhı. **Hala fırıncı** Feza'yı karşılar. Pişirme bulmacası (ışık ekmeği). |
| 8:30–11:30 | **5. Değirmen Arenası** | Boss: Değirmen Bekçisi. Çarklar durmuş; ekmek kokusu yolda. |
| Yan A (~1 dk) | **Kuzu Ağılı** | Sevimli kuzular çitte; Feza onları sayar (1–3) ve yün pelerin hazinesi bulur. |
| Yan B (~1 dk) | **Eski Çarklı Kuyu** | Kuyunun kapağı; içinden aşağıya inen küçük taş oda (gizli hazine). |

## 4. Bölüme özgü ana mekanik: "Işık Ekmeği"
**Fikir:** Üç malzeme (un, su, ateş) bulunur, **pişirilir**, ekmek kokusu kasabayı uyandırır. Hala'nın `hala/` pasta/malzeme sistemi (malzeme toplama, `06z_pasta`, `06z_mutfak`) uyarlanır; pasta yerine **ışık ekmeği**.

**Adım adım (çocuk gözüyle):**
1. Hala fırının önünde tarifi gösterir: üç resim (un torbası, su kovası, kıvılcım) ekranda **tarif tahtası** gibi altta görünür, Hala sesle söyler: "Önce un, sonra su, sonra ateş."
2. **Un:** tarlada 5 başak demetine dokunur. Torba doldukça yarım dolu, tam dolu görünür.
3. **Su:** dere kıyısında kova; kovaya dokununca dolar. Feza kovayı taşır (yürürken elinde, hız biraz azalır, vuruş çalışmaya devam eder); ağız "pat" diye kapatır, su dökülmez.
4. **Ateş:** üç **Kor Taşı** (gri, soğuk). Feza Pırıl'ı taşa götürür; Pırıl ışık nefesi üfler; taş **turuncu-altın kora** döner; Feza korları küçük bir fener kutusuna koyar.
5. Fırın meydanında **Hala** hamuru gösterir. **Yoğurma:** Feza parmağını hamurda çember çizerek 3 kez gezdirir (3 kalp işareti). **Pişirme:** fırın kapısına yürür, ışık nefesi düğmesine basılı tutar; **ışık göstergesi** dolar; **altın bölgede** bırakınca ekmek mükemmel olur. Altın bölge geniş; bırakırsa erken ya da geç bile olsa ekmek "biraz daha" diye kıpırdar ve Hala "Bir daha deneyelim!" der (kaybetme yok).
6. **Ekmek kokusu izi:** pişince ekmek kokusu yoldan değirmene kadar altın ince bir çizgi gibi görünür; ekmeği çarklara götürmek için bu çizgi izlenir.
7. Kasabadaki Un huysuzları ekmek kokusunu duyunca yumuşar; **kasaba çarkları** birer kez döner (güven verir).

**Sesli ipuçları:** her adımda Hala bir cümle söyler; yeni şey tek bir sesli cümleyle tanıtılır.

**Kalıbın dışı:** bölümün yarısından fazlası huysuz kovalamak değil, **toplama + pişirme bulmacasıdır**. Pişirme: basılı tutup altın bölgede bırakma (0 hata). Hasar yok, süre sınırı yok.

## 5. Sürpriz an: "Fırıncı Hala"
4. alanın başında fırıncı Hala'nın arkası dönük; Feza yaklaşınca fırıncı döner: **Hala'nın kıvırcık saçı ve bandanası** ama un lekeli beyaz önlük ve fırıncı şapkasıyla! Pırıl: "Hala?" Hala göz kırpar: "Ben köyün fırıncısıyım." (rüya kılığı, korkutucu yok). Tek efekt: Hala'nın üstünde tek küçük kalp işareti. Çocuk "Hala!" der; Hala sakin cevap verir. Aynı zamanda bölüm sonunda ışık ekmeği pişince ekmeğin üst kabuğu açılır ve **içi altın**: tek net efekt: ekmek yarılır, altın bir buhar çizgisi yalnız yola uzanır (ışık sütunu yok).

## 6. Düşmanlar (huysuzlar; hepsi sevimli, kızgın yüz yok)
Kaynak Kefir Vadisi'nden yeniden çerçeve (`05_enemies.js` 75–92):
- **Un Torbacığı** (`hala/05h_huysuzlar` unTorbasi + kefir `kaymak` davranışı): yumuşak un torbası, yuvarlanır/kayar, arkasında un izi (ince, yerde). Kaymak kayma saldırısı (şerit işareti 1 sn).
- **Başak Huysuzu** (yoğurt zıplayan): başak saçlı küçük yuvarlak; zıplayıp çarpar (çömelme işareti, küçük gölge daire).
- **Un Pufu** (kefir köpüğü uçan): uçan un bulutu kümesi; yumuşak "pof" topları atar. Bulutlar alçak ve yarı saydam, görüşü kapatmaz.
- **Değirmen Taşı** (peynir dilimi ağır ezen): yassı yuvarlak taş, yavaş yürür, yere "güm" diye düşer (yerde halka işareti); kaynak `slam`.
- **Bal Muhallebisi** (jöle varyantı): altın renkli sevimli jöle, yakın dövüşçü.
**Bu bölüme özgü yeni sevimli tür:** **Küçük Çark Kuşu** (uçan, bakır çarklı kanatlı) yalnız Fırın Meydanı'nda; çarkları hâlâ durmuştur, neşelendikçe ince "tık tık" sesiyle döner; zarar vermez, sadece kısa süre Feza'nın önünde dolanıp şaşırtır.

## 7. Mini oyun / yan etkinlik, gizli şeyler
- **Mini oyun — Hamur Şekillendirme (Hala'nın tezgâhı):** Feza hamuru parmakla çizerek hayvan şekli yapar (kuzu, yıldız, kalp); Hala fırından çıkarır; çıkartma albümüne eklenir (isteğe bağlı).
- **Gizli hazine 1:** Taş kemerin sağ deliğinden geçince **gizli taş oda** (kaynakta peynir deliği → kemer): sandıkta "Fırıncı Şapkası".
- **Gizli hazine 2:** Eski Çarklı Kuyu'nun kapağı; çarka basınca açılır, içinde altın başak.
- **Gizli hazine 3:** Kuzu Ağılı'nda 3 kuzu doğru sayılınca (1-2-3) bir yün pelerin sandığı belirir.

## 8. Boss: Değirmen Bekçisi (taş-tahta dev, çarkları durmuş)
**Görünüş:** Taş gövde, ahşap kol ve bacaklar, başında bakır çatı şapkası, sırtında dört kanatlı büyük çark (şimdi durmuş), elinde taş çark kalkanı. Yüz taş ama yumuşak, sevimli esneyen gözler (sis yüzünden uykulu). Kızgın değil.
**Kimliği:** Vadinin sessiz bekçisi; sis çarkını durdurmuş, hareket edemiyor. "Çarkım dönmeyince sesim de çıkmıyor."

**Can eşikleri:** %100→66, %66→33, %33→0.

| # | Saldırı (kaynak) | Yerdeki işaret (≥2 sn) | Seslenen uyarı | Nasıl kaçılır |
|---|---|---|---|---|
| 1 | **Taş Adım** (Kefir `slam`) | Kırmızı kalın kenarlı **daire**, dolup küçülür | b04_boss_adim: "Kırmızı daire! Taş adım geliyor, dışına çık!" | Daire dışına |
| 2 | **Un Fışkırtma** (Kefir `geyser`) | Zeminde **beyaz üçgen** (koni) | b04_boss_fiskir: "Beyaz üçgen! Un fışkırıyor, yana kaç!" | Üçgenin dışına çık |
| 3 | **Un Bulutu Dansı** (Aşama 2, Kefir `bubbles`) | Üç adımlık dans; zeminde **5 küçük beyaz nokta** yelpaze gibi | b04_boss_dans: "Bekçi dans ediyor, beyaz noktalar! Aralarından geç." | Noktalar arası boşluktan geç; saber ile vurulunca "pof!" |
| 4 | **Minik Torba Çağırma** (Aşama 2, %66/%33) | 2–3 **sarı nokta**; çıkan Un Torbacıkları | b04_boss_cagir: "Küçük un torbaları geliyor, neşelendir!" | Kolay, 1–2 vuruş |
| 5 | **Çark Dönüşü** (Aşama 3, Kefir `spout`) | Yerde yavaş dönen **mavi çizgi** (yelkenli çark yolu), 2 sn önceden | b04_boss_cark: "Mavi çizgi! Çark dönecek, çizgiden uzak dur!" | Çizgiyi aşma, kısa süre |

**Saldırı sayısı:** Aşama 1: 1+2; Aşama 2: 1+2+3+4; Aşama 3: 1+2+5. Ardışık saldırılar arasında 2–3 sn; ilk aşama yumuşak.

**Kıkırdama molası = Un Balonu** (kaynak `BONUS.balon`: dev köpük balonu → hıçkırık): Bekçi derin nefes alıp dev bir **un balonu** üfler; balon Feza'ya yavaşça süzülür; **iki vuruşla "pof!"** patlar, içinden küçük bir ekmek kalbi çıkar; Bekçi **üç kez hapşırır** ("Hapşu!"), 6 sn sersemler, vuruş fırsatı (saldırılar %25 fazla).

**Neşelenince:** Feza ışık ekmeğini Bekçi'ye ikram eder (3 sn); Bekçi ısırır, güler, **çarklar döner** (animasyon); **kalp patlaması**, ekmekten **tek altın ışık topu** Pırıl'a uçar (başka efekt yok). Kasaba çanları çalar.

## 9. Eşlik eden karakterler
- **Pırıl:** ışık nefesiyle Kor Taşları'nı uyandırır ve fırını yakar; un torbalarının yanında hapşırır, kıkırdar; Hala'ya "Sihirli ekmek yaptık!" der; boss'ta yarım ekmek taşır (gerilim yok, şaka).
- **Hala (fırıncı):** (kaynak `04_hala.js`: Pasta Topu, sarılma, Takım Hamlesi) → **hamur topu** atar (sersemletir, zarar yok; son vuruş Feza'nın), **sıcak ekmek sarılması:** Feza'nın canı %50'nin altına inerse ya da 4+ düşman yakınsa **otomatik** koşup sarılır ve ısıtır, can dolar. **Bekleme: 25 sn.** Hala hasar almaz. Pişirmede her adımda sesle yönlendirir; boss'ta ekmeği verir.

## 10. Ödüller
- **Işık parçası:** Ekmek Işığı (boss).
- **Envanter:** **Altın Başak Kılıcı** (boss, altın-sarı ışın kılıcı), **Fırıncı Pelerini** (kırmızı/krem, hamur lekeli, Hala hediyesi), **Fırıncı Şapkası** (gizli hazine), Yün Pelerin (Kuzu Ağılı), minik Değirmen Çarkı süsü.
- **Pırıl gücü:** yok (ışık nefesi artık "ateş yakma" için de kullanılır, hikâye bağı).

## 11. Anlatıcı ve Pırıl cümleleri (anahtar: `b04_...`)
1. b04_giris: "Altın Değirmen Vadisi! Ama burada her şey durmuş. Sessiz Sis çarkları susturmuş."
2. b04_kartal_veda: "Kartal bizi tarlaların kenarına bıraktı. Yürüyelim."
3. b04_tarla: "Altın başaklar rüzgârda dalgalanıyor. Ne güzel kokuyor!"
4. b04_ilk_torba: "Un torbacıkları kayarak geliyor. Dikkat et!"
5. b04_ilk_basak: "Başak huysuzları zıplıyor. Neşelendir onları."
6. b04_ilk_puf: "Un pufları uçuyor. Hafif, yumuşak toplar atıyorlar."
7. b04_ilk_tas: "Değirmen taşı yavaş yavaş geliyor. Güm diye düşecek, daireden kaç!"
8. b04_firin_duman: "Uzakta fırından ince bir duman çıkıyor. Orada biri var!"
9. b04_tarif: "Işık ekmeği için önce un, sonra su, sonra ateş lazım."
10. b04_un: "Altın başak demetlerini topla. Torba doluyor."
11. b04_dere: "Berrak dere ışıl ışıl akıyor. Kovayı doldur."
12. b04_kova: "Su kovası hazır. Dökmeden taşı."
13. b04_kor: "Soğuk bir taş! Pırıl ışığını üflesin, ısınsın."
14. b04_kor_yandi: "Taş kor oldu! Ateşimiz hazır."
15. b04_kemer: "Taş kemerin içinden geç. Belki bir sürpriz vardır."
16. b04_hala: "Bak bak! Köyün fırıncısı. Saçı kıvırcık, gözlerinde gülümseme..."
17. b04_hala_der: "Hoş geldin Feza! Ben köyün fırıncısıyım. Birlikte ışık ekmeği yapalım."
18. b04_yogurma: "Hamuru parmağınla çevir. Bir, iki, üç."
19. b04_pisir: "Fırına koy, ışık nefesini üfle. Altın yerde bırak."
20. b04_pisti: "Işık ekmeği pişti! Mis gibi kokuyor."
21. b04_koku: "Ekmek kokusu yolu gösteriyor. Altın çizgiyi izle."
22. b04_kasaba: "Ekmeği duyunca herkes yumuşadı, çarklar bir kere döndü."
23. b04_kral_giris: "İşte Değirmen Bekçisi! Taştan, tahtadan, çarkı durmuş."
24. b04_boss_adim: "Kırmızı daire! Taş adım geliyor, dışına çık!"
25. b04_boss_fiskir: "Beyaz üçgen! Un fışkırıyor, yana kaç!"
26. b04_boss_dans: "Bekçi dans ediyor, beyaz noktalar! Aralarından geç."
27. b04_boss_cagir: "Küçük un torbaları geliyor, neşelendir!"
28. b04_boss_cark: "Mavi çizgi! Çark dönecek, çizgiden uzak dur!"
29. b04_balon: "Kocaman un balonu geliyor! İki kere vur, patlat!"
30. b04_hapsu: "Balon patladı! Bekçi hapşırdı. Hadi, şimdi vur!"
31. b04_hala_yardim: "Hala sıcak ekmekle yardıma geliyor!"
32. b04_ikram: "Bekçiye ışık ekmeğini ver."
33. b04_bitti: "Bekçi güldü, çarklar döndü! Işık ekmeğinden bir ışık parçası uçtu."
34. b04_ipucu: "Işık yerin altında, taşların ve kristallerin arasında."
35. b04_yolculuk: "Ekmek kırıntıları yolu gösteriyor. Kaydıraktan aşağı!"

## 12. Müzik / ses atmosferi
Sıcak mandolin ve akordeon, hafif ritmik "tık tık"; başta çark yok, ses sessiz ve yumuşak; ekmek pişince melodi dolar. Boss'ta çark sesi ritme eklenir; neşelenince çarklar ve çan, müzik tam olur. Su şırıltısı, rüzgârda başak, uzakta çan.

## 13. Çocuk için risk ve sadelik notları
- **Üç malzeme + pişirme + boss** çok olabilir: tarif tahtası simge + sesli tek cümle; yalnız 3 simge.
- **Un bulutu:** alçak, yarı saydam; kamerayı ve karakterleri kapatmaz; yerde beyaz noktalar yalnızca işaret.
- **Efekt:** ekmek pişince tek altın buhar çizgisi; kasaba çarkları ikinci efekt yapmaz (yalnız hareket). Boss'ta aynı anda tek işaret, tek cümle.
- **Taşıma (kova):** yürürken hız yalnız %15 azalır; yanlış yok.
- **Hala'nın kimliği:** ağzı oynayan, tanıdık yüz; korkutucu yok.
- **Mor yok.**

## 14. Teknik taşıma notu
- **Kaynak:** `huysuz/src/06_level.js` (ZONES kefir ~14; `buildDairy` 4734+; `dairyField`, `hill`, bridges, `kefirBottleTpl` can kalbi), `05_enemies.js` (yogurt/kaymak/kopuk/peynir 75–92, `kefirdev` modeli ~3538–3950, `DAIRY` paleti 2988, rig'ler), `07_game.js` (`kefirdevStep` 2934–3070, `BONUS.balon` 3675–3780, `GIFT`, `RAID_NEW.spout` 2137), `hala/src/06z_mutfak.js` (malzeme/kilit yapısı, un tuzakları, tezgâh), `06z_pasta.js` (yerleşim, malzeme yuvası), `04_hala.js` (model, yardım), `05h_huysuzlar.js` (unTorbasi 1275, kasik 1273).
- **Yeniden yazılacak:** dairy temasının renk paleti (süt→altın), sıvı alanı → berrak dere (nehir shader/dokusu), peynir delikli duvar → taş kemer, güğüm/yayık → çark/kova, kefir şişesi boss modeli → taş-tahta Bekçi (yeni model, çark/çatı), kefir sesleri ("pof/fışkırma") → un sesleri, Hala'nın kıyafeti (fırıncı), boss davranış tablosu (slam/geyser/bubbles/spout kod yapısı yeniden kullanılır).
- **Yeni yazılacak:** tarif tahtası arayüzü, kova taşıma, Kor Taşı + Pırıl nefes etkileşimi, pişirme gösterge bulmacası, ekmek kokusu iz çizgisi, Hamur Şekillendirme mini oyunu, Küçük Çark Kuşu, boss'un "ikram" sahnesi, Hala otomatik yardım tetikleyicisi.
- **Zorluk:** Yüksek (yeni boss modeli + malzeme/pişirme sistemi).
- **Yeni motorda gereken:** `BOLUM.define`, `HUYSUZ.type/boss/zone`, `BOSSDAV.register`, MINIGAME çerçevesi, PIRIL_GUC hedefli ışık nefesi, envanter/eşya taşıma kancası, yardımcı karakter (Hala) otomatik yardım API.

## 15. Açık sorular
1. Pişirme bulmacasında Hala yardım etsin mi (yoğururken el ele), yoksa Feza tek başına mı yapsın? (Daha bağımsız / daha kolay.)
2. Bölüm sonunda Bekçi'ye ekmeği Feza elle mi ikram etsin (sahne), yoksa ekmek otomatik fırlayıp Bekçi'ye gitsin mi?
3. Hala'nın fırıncı kılığı: tanıdık yüzle hemen fark edilsin mi (çocuğun keşfi mi sürpriz olsun), yoksa Hala adını bölüm sonunda mı söylesin?
