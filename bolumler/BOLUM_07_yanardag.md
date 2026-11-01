# Bölüm 7 — Lav Yanardağı

**Eşlik eden:** Pırıl (Baba, Kartal, Bilbo, Hala yok; yalnız Feza + Pırıl) · **Süre:** ~11–12 dk · **Işık parçası:** 7. parça (Büyük Fener) · **İpucu:** "Kaplumbağanın kabuğundaki ışıklar bir şehrin fenerlerine dönüştü; şehir sisin içinde, saat kulesi durmuş." · **Duygu:** neşe → sessiz bir karanlık an → umut.

---

## 1. Bir cümlede bölüm
Pırıl'ın doğduğu yanardağa gelirler: uyuyan Ateş Işık Ejderhası (adı **Ateş Dede**, Pırıl'ın çok eski bir büyüğü) yanında Pırıl'ın kabuk parçası bulunuyor, Pırıl'ın ışığı yavaşça sönüyor; Feza onu kucağında taşıyıp Koca Lav Kaplumbağası'nı neşelendirir ve ışık Pırıl'a geri döner.

**Gelişi:** 6. bölümde (Ay Tapınağı) Pırıl kanat rüzgârını geri alır; Mabet Bekçisi'nin verdiği ipucu: "Sıradaki ışık ateşin kalbinde, sıcak bir dağda." Yolculuk sahnesi (atlanabilir): yıldız yapraklı yaprak kayığı bulutlardan süzülür, uzakta turuncu bir parıltı; Pırıl: "Burası... bana çok tanıdık geliyor."
**Çıkışı:** Boss neşelenir → tek ışık topu Pırıl'a uçar → uyku molası (Feza ve Pırıl sarılıp yatar; bu kez Pırıl gerçekten rahat uyur) → yolculuk sahnesi: kaplumbağanın kabuğundan çıkan minik ışıklar bir fener dizisi olup sisli bir şehre doğru yol olur.

## 2. Görsel kimlik
- **Palet:** sıcak bal-turuncu, kızıl-kahve bazalt, krem küller, bol yumuşak buhar. Mor yok (mor yalnız Pırıl'ın). Gökyüzü gün batımı: şeftali + kızıl pembe.
- **Zemin:** ince, düşük kontrastlı koyu bazalt/kül (yürünür alan açık gri-kahve, lav nehirleri kenarda ve alçak taş kenarlıkla ayrılır). Lav hiç yürünür alanın üstünde olmaz.
- **Dekor:** turuncu ışık nehirleri, parlak göller, taş köprüler, kıvılcım zerreleri, buhar bacaları, parlak obsidyen, ateş taşları (kaynak: `huysuz` Lav Yanardağı, aynen korunur). Sıcak ışık yalnız nehir ve göllerden gelir.
- **Aynen korunan:** `huysuz/src/06_level.js` volcano teması (zemin `volcanoField` ~1741, `buildVolcano` ~3892, ışık ayarı ~2472), `05_enemies.js` Minik Lav Kaplumbağası/Ateş Kuşu/lav jölesi/magma devi ve Koca Lav Kaplumbağası modelleri.
- **Yeniden çerçevelenen:** "kristaller lav nehrine dönüşür" bağı kaldırılır (5. bölüm mağarasından geçiş yeni ipucuyla anlatılır); ejderha yuvası, kabuk parçası ve karanlık yamaç **yeni** eklenir.

## 3. Alanlar (toplam ~11,5 dk)
| # | Alan | Ne var, Feza ne yapar | Süre |
|---|---|---|---|
| 1 | **Işık Nehirleri Kıyısı** | Giriş. Taş köprüler, kıvılcımlar. Feza ilk **Nehir Çarkı** düğmesine basar, köprü taşları yükselir. Minik kaplumbağalar selam verir. | 1,5 |
| 2 | **Kıvılcım Gölleri** | Parlak göller, ateş kuşları, lav jöleleri. Taş atlama mini oyunu (yan). İkinci Nehir Çarkı. | 2 |
| 3 | **Kaplumbağa Yamacı** | Minik lav kaplumbağaları kabuğa girip yuvarlanır; Feza yeşil yolu izleyip kaçar, neşelendirir. Üçüncü Nehir Çarkı yuvaya giden kapıyı açar. | 1,5 |
| 4 | **Ejderha Yuvası** | Büyük sıcak mağara: uyuyan **Ateş Dede** (Ateş Işık Ejderhası), duvarlarda minik ayak izleri, kabuk parçası bulunur (bir yarım kabuk: öbür yarısı yok), **ışık sönmeye başlar**. | 2 |
| 5 | **Sessiz Yamaç (karanlık an)** | Feza Pırıl'ı kucağında taşıyarak arenaya yürür. Düşman yok. Yolu minik kaplumbağalar ve kıvılcımlar gösterir. | 1,5 |
| 6 | **Kaplumbağa Krateri (arena)** | Boss: Koca Lav Kaplumbağası (3 aşama). | 3 |
| Yan A | **Buharlı Kaynak Bahçesi** | Sıcak su kabarcıkları, altın kaplumbağa, gizli sandık. | +0,5 (isteğe bağlı) |
| Yan B | **Pırıl'ın İlk Adımları** | Yuvanın arkasında dar bir geçit; duvarda minik pençe izleri, Pırıl'ın küçük bir çizimi, çıkartma. | +0,5 (isteğe bağlı) |

## 4. Bölüme özgü ana mekanik
**A) Nehir Çarkları (alanlar 1–3, huysuz kalıbının dışı).** Yerde büyük, sıcak turuncu bir taş düğme var. Feza üstüne basınca ışık nehri bir yana akar, nehrin içinden **taş basamaklar** yükselir, köprü olur. Ses: "Taş düğmeye bas, nehir yön değiştirsin!" Yanlış yapmak yok: köprü hep kısa sürede açılır; Feza lavın içine düşmez (kenarlık var). Pırıl'ın ışık nefesi düğmenin üstündeki kapalı taş kapıyı da ısıtıp açabilir (isteğe bağlı, Pırıl başını eğdirir).
**B) Taşıma (alan 5, yeni kare).** Pırıl uyurken Feza onu kucağında taşır: Feza biraz yavaş yürür, Pırıl omzuna yaslanır. Ekranda **tek** ipucu vardır: Feza durup parmağını Pırıl'ın üstünde tutarsa "sarılma" olur (küçük bir kalp, tek efekt) ve Pırıl'ın kıvılcımı birazcık parlar. Zorunlu değil, ama çocuk dokunmak ister. Yürüdükçe yoldaki minik kaplumbağalar ve kıvılcımlar yol gösterir; yeşil taşlar parlak kalır (okunurluk).
**C) Boss küçük oyunu: Serin Taşlar** (kaynak: `07_game.js` serintas ~3338, 3906–3990).

## 5. Sürpriz an
**Kabuğun "tın"ı.** Ejderha yuvasında Feza kabuk parçasını bulup Pırıl'a yaklaştırınca kabuk yumuşak bir "tın" sesi çıkarır ve parçanın üstündeki **tek bir altın nokta** yanar. Pırıl gözlerini açar: "Ben burada doğdum!" (hikâyenin ilk büyük ipucu; benekler 9. bölümdeki yumurtalarla aynı). Parçanın bir kenarı kırık: Pırıl bakar, sessizce "Öbür yarısı nerede acaba?" der. Başka efekt yok;

**Kabuğun hikâyesi (oyunda söylenmez, yalnız gösterilir; PLAN karar 19):** Pırıl'ın yumurtası bu yuvada, **Ateş Dede**'nin sıcağında çıktı. Sis her şeyi unutturmadan önce Pırıl'ın annesi kırık kabuğun **öbür yarısını hatıra olarak kaleye götürdü**. Bu yüzden burada yalnız yarım kabuk vardır; 9. bölümde kaledeki yarım kabuk bununla tam oturur. **Ateş Dede anne değildir**: Pırıl'ın çok eski bir büyüğü; model ona uygun yaşlı, sıcak bal-turuncu (mor değil), uykulu ve sevimli. Bölümde "anne/annem/ejderha ailem" sözcüğü geçmez; yalnız "tanıdık", "sıcak", ninni. sonra Pırıl'ın ışığı yumuşakça azalır (bkz. 13).

## 6. Düşmanlar (hepsi sevimli, "hıh" suratlı)
- **Minik Lav Kaplumbağası** (kaynak `huysuz` 05_enemies ~59, 1984): kabuğunda tüten minik yanardağ; yaklaşınca kabuğa girip şeritte yuvarlanır. Yeşil yoldan kaçılır.
- **Ateş Kuşu** (~60): alev tepeli civciv, uzaktan kıvılcım atar.
- **Lav Jölesi** (jole varyantı 'lava'): zıplar; neşelenince kaybolur.
- **Magma Kaya Devi** (tek, elit; golem 'magma'): yavaş, iri; yere vurunca halka.
- **Yeni 1 — Sıcak Taş Yavrusu:** üstünde turuncu çatlaklar olan küçük yuvarlak kaya; yaklaşınca sallanır, "pofff" diye buhar çıkarır, kendi ayağına takılıp oturur (kıkırdama).
- **Yeni 2 — Duman Bulutcuğu:** pembe-gri minik bulut; üzerine basınca mırıldanır, Feza'nın etrafında yavaşça döner (zararsız, ışığı sakinleştirir; yalnız alan 5 ve boss kenarlarında dekor).
- Alan 5'te düşman **yok** (karanlık an korunur).

## 7. Mini oyun ve gizli şeyler
- **Taş Atlama (alan 2, yan mini oyun):** Göl kenarında yassı taşlar. Feza dokunup bırakınca taş sekerek göl boyunca halkalar bırakır; Pırıl sayar (tek halka efekti, iç içe değil). Beş seken taş = ödül.
- **Gizli 1:** Buharlı Kaynak Bahçesi — altın lav kaplumbağası + sandık (çıkartma + Altın Kıvılcım).
- **Gizli 2:** Pırıl'ın İlk Adımları — yuvanın arkasında dar geçit; duvarda Pırıl'ın bebek pençe izleri ve albüm çıkartması "Doğum Yeri".
- **Gizli 3:** Kaplumbağa Yamacı'nda sessizce duran dev bir lav jölesi (dokununca kalp çıkar, ödül yok ama kıkırdatır).

## 8. Boss — Koca Lav Kaplumbağası
**Görünüş:** nane yeşili, tombul, kabuğu küçük bir yanardağ (krater, damlayan lav, buhar). Gözleri iri ve uykulu. **Kimliği:** yanardağın bekçisi; sis yüzünden kabuğundaki ışığın ne işe yaradığını unutmuş, "hıh" diye huysuz. Pırıl Feza'nın kucağında uykuda olduğu için **bu savaşta Pırıl yardım edemez** — bu yüzden boss yumuşatılır (can ×0,8, saldırı aralıkları uzun, hasar düşük; kıkırdama molası uzun).
**Aşamalar (can eşikleri):** 1: %100–66 · 2: %66–33 · 3: %33–0.
| Saldırı | Hangi aşama | Yerdeki işaret (≥2 sn, kalın kenar) | Seslendirilen uyarı | Nasıl kaçılır |
|---|---|---|---|---|
| **Lav Topları** | 1,2,3 | 3–5 **kırmızı daire** (krem kalın kenar) | "Kırmızı daireler! Üstüne basma!" | Dairelerden çık. 1. aşamada tek top. |
| **Yuvarlanma** | 2,3 | **turuncu şerit**, kaplumbağadan Feza'ya doğru | "Turuncu şerit! Yana kaç!" | Şeritten yana çık; arkasında **yeşil geçit** kalır. |
| **Lav Dalgası** | 3 | arenayı kesen bir **yeşil geçit** (dalga kırmızı olmayan her yeri geçer) | "Yeşil geçit güvenli! Yeşile gir!" | Yeşil şeride gir; dalga geçerken beklenir. |
- **Serin Taşlar oyunu (aşama 1→2 geçişi, can ≤ %70):** "Serin taşlar çıktı! Kaplumbağa yuvarlanırken taşın arkasına saklan!" Üç taş; Kaplumbağa taşa çarpıp **yan yatar** ve ayaklarını sallar (kıkırdama molası, ~5 sn, hasar ×1,25).
- **Kıkırdama molaları:** her Lav Topları dizisinden sonra kabuk "pofff" diye buhar verir ve kaplumbağa 2 sn esner; her yuvarlanma sonrası sendeler.
- **Yardımcılar:** aşama 2'de iki minik kaplumbağa (zayıf).
- **Neşelenince (tek efekt):** kaplumbağa kalp saçar (tek kalp patlaması), kabuğundan tek bir ışık topu çıkar ve **uyuyan Pırıl'a** uçar. Pırıl gözlerini açar; kanatları yeniden parlar. (Ayrıca bkz. 13: ışık topu tek, başka efekt yok.)
- **Saldırı sayısı:** 3 (ilk boss'lardan biraz fazla ama aralar uzun).

## 9. Eşlik eden karakterler
- **Pırıl:** alan 1–3: ışık nefesi (kapıları ısıtır), köpük kalkanı (sıcaklığa karşı; **otomatik**, Feza canı %50'nin altına inerse tek köpük kalkanı, bekleme 20 sn), şakalar ("Çok sıcak, kanatlarım pişecek!"). Alan 4'te kabuk parçasını keşfeder. Alan 5 ve boss'ta uyur, kucakta peluş gibi kıvrılmıştır (gözler kapalı).
- Baba, Kartal, Bilbo, Hala yok.

## 10. Ödüller
- **Işık parçası 7.** Pırıl'ın yeni gücü yok; ışığı eski parlaklığına döner (PLAN §5: kalp tozu 9. bölümde).
- **Envanter:** *Kor Kılıcı* (turuncu ışın kılıcı), *Kaplumbağa Kabuğu Pelerini*, *Lav Taşı Tacı* (yumuşak, kırmızı değil bal rengi), **Pırıl'ın Kabuk Kolyesi** (özel, hep takılabilir).
- **Albüm:** "Doğum Yeri" çıkartması.

## 11. Anlatıcı ve Pırıl cümleleri (anahtar: `b07_...`)
1. `b07_giris` — Işıldayan Dağ! Turuncu ışık nehirleri akıyor.
2. `b07_pirilgiris` — Burası çok sıcak ve çok tanıdık. Neden bilmiyorum.
3. `b07_nehir1` — Taş düğmeye bas! Nehir yön değiştirsin.
4. `b07_nehir2` — Bak, köprü yükseldi! Hadi geç.
5. `b07_kopru` — Taş basamaklar çıktı. Sakin sakin yürü.
6. `b07_pirilsicak` — Kanatlarım sıcacık! Ama köpük kalkanım yanımda.
7. `b07_goller` — Parlayan göller! Yassı bir taşla taş atlayalım mı?
8. `b07_tasatlama` — Taş atladı! Halkalar saydım: bir, iki, üç.
9. `b07_kaplumbaga_ilk` — Minik kaplumbağa! Kabuğuna girip yuvarlanıyor, yeşil yoldan çık.
10. `b07_atesKusu_ilk` — Ateş kuşu! Kıvılcım atıyor, yana kaç.
11. `b07_yamac` — Minik kaplumbağalar oyun oynuyor. Sıcak taş yavruları da kıkırdıyor.
12. `b07_yuva_giris` — Bu büyük, sıcak bir yuva. Uyuyan biri var.
13. `b07_ejderha` — Bu Ateş Işık Ejderhası, adı Ateş Dede. Uyuyor, çok sessiz, onu uyandırma.
13b. `b07_dede_p` — Ateş Dede... Sıcaklığı çok tanıdık.
14. `b07_pirilizler` — Bak, duvarda küçük ayak izleri! Bunlar benim ayaklarım gibi.
15. `b07_kabuk` — Feza, bir kabuk parçası buldun! İçinde benekler var.
16. `b07_pirildogdum` — Ben burada doğmuşum! Bu benim ilk evim.
16b. `b07_kabukyari` — Kabuğun öbür yarısı nerede acaba?
17. `b07_pirilyorgun` — Feza... biraz uykum geldi. Işığım yoruldu.
18. `b07_pirilsoz` — Ama sen yanımdasın. Korkma, kaybolmayacağım.
19. `b07_fezasarilma` — Feza Pırıl'a sımsıkı sarıldı. Pırıl'ın kalbi hâlâ atıyor.
20. `b07_pirilulus` — Hadi beni boss kaplumbağanın yanına götür. Birlikte ışığı bulalım.
21. `b07_yamac_sessiz` — Pırıl uyuyor. Feza onu yavaşça taşıyor.
22. `b07_kaplumbagayolgoster` — Minik kaplumbağalar yolu gösteriyor. Onları izle.
23. `b07_kivilcim` — Küçük kıvılcımlar Pırıl'ı ısıtıyor.
24. `b07_arena` — Burası kraterin tepesi. Kocaman bir kaplumbağa var.
25. `b07_kaplumbaga_giris` — Koca Lav Kaplumbağası! Kırmızı dairelerden uzak dur.
26. `b07_ipucu_top` — Kırmızı daireler! Üstüne basma.
27. `b07_ipucu_yuvarlan` — Turuncu şerit! Yana kaç.
28. `b07_ipucu_dalga` — Yeşil geçit güvenli! Yeşile gir.
29. `b07_tas` — Serin taşlar çıktı! Kaplumbağa yuvarlanınca taşın arkasına saklan.
30. `b07_devrildi` — Kaplumbağa yan yattı! Hadi, şimdi vur.
31. `b07_yarim` — Kaplumbağa esniyor. Az kaldı Feza!
32. `b07_bitti` — Kaplumbağa kocaman gülümsedi! Kabuğundan bir ışık çıktı.
33. `b07_isik` — Işık Pırıl'a uçuyor. Pırıl'ın kanatları parlıyor.
34. `b07_pirilacildi` — Beni taşıdığını hissettim, Feza. Çok sıcaktı.
35. `b07_sonrasi` — Işıklar bir şehrin fenerlerine dönüştü. Şehir sisin içinde.
36. `b07_siradaki` — Sıradaki ışığı şehirde bulalım!

(Cümle sayısı 38'e çıktı: `b07_dede_p`, `b07_kabukyari` eklendi.)
(ses motoru için: "yunikorn" gibi İngilizce kelime yok; "Aa/Oo/Hihi" yok.)

## 12. Müzik/ses
- **Alan 1–3:** kaynaktaki neşeli Karayip çelik davul, marimba, konga; arada "blup".
- **Alan 4:** çalgılar azalır; yalnız sıcak bir çan ve uzaktan uyuyan ejderhanın yumuşak soluk sesi (tek bas nota).
- **Alan 5 (karanlık an):** yalnız **ninni**: yavaş müzik kutusu ezgisi, tek çalgı; ses seviyesi düşük, kıvılcımlar çıt çıt.
- **Boss:** çelik davul yeniden, ama yavaş tempo; Pırıl uyandığında ezgi bir an durur, sonra tam hâle gelir.

## 13. Çocuk için risk ve sadelik
- **En büyük risk: karanlık an.** Kurallar: karartma en çok **%35 vinyet** (yumuşak, 2–3 sn'de), ani kararma/yanıp sönme yok; ana yol parlak kalır; Pırıl'ın sesi sakin ve umutlu; **ağlama, korku sesi, "gidiyorum" yok**; Pırıl yalnızca "yoruldum, uyuyacağım, kaybolmayacağım" der. Sarılma ve umut cümlesi hemen ardından gelir.
- Lav parlaklığı: bloom düşük; kırmızı daire turuncu zeminde kalın krem kenarlıyla ayrılır; zemin soluk, daire/şerit parlak.
- Aynı anda yalnız bir efekt: sürpriz anı "tın", sarılma "kalp", boss ışığı "tek ışık topu".
- Buhar/duman kamerayı kapatmasın (alçak ve şeffaf).
- Pırıl'ı taşıyan Feza yavaş yürüdüğü için taşıma alanı kısa tutulur (~1,5 dk).

## 14. Teknik taşıma notu
- **Kaynak:** `feza-bilbo/huysuz/src` — `06_level.js` (ZONES yanardag satır 19; volcanoField ~1741; buildVolcano ~3892; ışık/sis ~2472), `05_enemies.js` (EDEF kaplumbaga/ateskusu/lavkaplumbaga ~56–72; build/anim ~1871–2110, ~2795–2985), `07_game.js` (lavkaplumbagaStep ~2827; BONUS.serintas ~3338, 3906–3990; mortars ~416), `02_audio.js` (yanardag müziği ~846).
- **Yeniden yazılacak:** hepsi `06z_yanardag.js` + `05z_yanardag.js` + `02l_yanardag.js` olarak piril motoruna (BOLUM.define, HUYSUZ.type/boss/zone, BOSSDAV.register: lavTop, yuvarlan, dalga, serinTas). Volcano zemin gölgelendiricisi piril motorunda `taban` seçeneği olarak yoksa CORE'dan istenir.
- **Yeni yazılacak:** Nehir Çarkı + yükselen taş basamak, Ejderha Yuvası (uyuyan Ateş Işık Ejderhası modeli — 9. bölümdeki Huysuz Ejderha ile aynı gövde ailesi, ama uykulu/sevimli, tek soluk animasyonu), kabuk parçası, "tın" sürprizi, taşıma modu (PIRIL_TAKIP yeni durum: `tasinma`, Feza omzuna/kucağına yaslı; yürüme hızı ×0,8), yumuşak vinyet, Sıcak Taş Yavrusu, Duman Bulutcuğu, taş atlama mini oyunu (08m MINIGAME çerçevesi).
- **Gereken motor özelliği:** bölüm içi sahneli ışık değişimi (`isik` değerlerinin yumuşak geçişi), Pırıl "uyku" pozu (uyku molası pozu mevcut; yeniden kullanılır), boss'ta Pırıl yardımını kapatma bayrağı.
- **Zorluk:** Orta–Yüksek (taşıma durumu ve yuva yeni; kaplumbağa ve lav hazır).

## 15. Açık sorular
1. (Kalan küçük soru; önerim: kucakta) Pırıl'ı Feza **kucağında** mı (iki kol, ekranda büyük) taşısın, yoksa **omzunda/pelerin kesesinde** mi (daha küçük, Feza'nın elleri serbest görünür)? Kucak daha duygusal, omuz daha oynanabilir.
2. (Kalan küçük soru; önerim: yalnız müzik kutusu) Karanlık anda ninni sözlü mü olsun (kısa ses, "Uyu Pırıl...") yoksa yalnız müzik kutusu mu?
3. ~~Doğum yeri ipucu açık mı olsun?~~ **KARARLAŞTI (PLAN karar 19):** "anne" sözcüğü 9. bölüme kadar geçmez; yalnız duygusal ipuçları.
