# Feza ve Pırıl: Kayıp Işıklar — Ana Plan (tek kaynak)

> Bu belge, projeyi yürüten **tüm ajanların ve LLM'lerin** önce okuması gereken tek plandır.
> Ebeveyn kararları aşağıda "KARAR" olarak işaretlidir; ebeveyn onayı olmadan değiştirilmez.
> Dil: ebeveyn Türkçe konuşur; açıklamalar sade Türkçe, teknik terimsiz. Önce `../CLAUDE.md` (tüm oyunlar için kurallar) okunur.

## 0. Durum ve kapsam
- **Durum (1 Kasım 2026): PLAN AŞAMASI TAMAM — ayrıntı planları onaylandı, kodlama başlamadı.** Sıradaki iş altyapıdır (§10). `bolumler/` altındaki 10 bölüm planı ve `bolumler/00_INDEKS.md` bağlayıcıdır.
- **Bu klasör (`feza-piril-3d-arpg/`) yeni, ayrı oyundur.** Mevcut oyunlara (`../feza-bilbo/` ve içindeki orman, huysuz, hala, piril; `../feza-piril`, `../feza-geziyor`, `../feza-unicorn`, `../bahtiyar-kabir-azabı`) **DOKUNULMAZ**. Yalnız okunur ve kopyalanır. Eski oyunlara ne olacağına yeni oyun hazır olduktan sonra ebeveyn karar verecek.
- Yeni oyun hazır olana kadar **GitHub'a gönderilmez** (ebeveyn "gönder" demeden hiçbir zaman gönderilmez; PR açılmaz, doğrudan `main`).
- Hedef: 5 yaşındaki **Feza** için, **~2 saatlik**, **10 bölümlük**, tutarlı hikâyeli, epik klasik RPG tarzında tek oyun.

## 1. KARARLAR (ebeveynden, 1 Kasım 2026)
1. **Çerçeve:** Feza, uyku arkadaşı peluş **Pırıl**'a sarılıp uyur. Bütün macera bir **rüyadır**. Sonunda Feza yatağında uyanır.
2. **Tek oyun, 10 bölüm.** (14–16 değil.) Bölümler birbiriyle uyumlu, tek hikâyeyi anlatır.
3. **Hikâye epik klasik RPG tarzındadır** (çağrı → yolculuk → sınav → karanlık an → final). Çocuğa uygun: korkutucu, kızgın yüzlü, böcekli bir şey yok; kaybetmek yok.
4. **Grafik:** Huysuzlara Karşı'nın (`../feza-bilbo/huysuz`) **zengin grafik detayı** 10 bölümün hepsinde korunur. ("Pırıl gibi sade" yapma kararından VAZGEÇİLDİ.) Pırıl'ın 3B modeli ve davranışı (`../feza-bilbo/piril`) kalır.
5. **Efekt kuralı (çok önemli):** Grafik zengin olabilir, ama **hiçbir şey birbirine ışıl ışıl girmesin.** Işık anı, uyarılar, boss saldırıları **tek net efekt**: aynı anda en fazla 1 büyük efekt ve 1 büyük yazı; her efekt tek ve net bir anlam taşır (vurdum / neşelendi / dikkat / ödül), kısa, karakterleri kapatmaz. Konfeti yağmuru, para yağmuru, iç içe halka, ışık sütunu YOK.
6. **Pırıl her bölümde Feza'nın yanında.** **Baba, Dağ Kartalı, Bilbo, Hala yalnız bazı bölümlerde** eşlik eder (§5).
7. **Saklı Toplar ve Bilbo'nun top bulma mekaniği KALDIRILDI.**
8. **Bilbo:** Feza istediğinde ona biner (yalnız oyuncu başlatır). Havlaması ve yardımı **otomatiktir**: Feza zor durumdayken ya da çok düşman gelince kendiliğinden havlar; havlama düşmanları **sersemletir, zarar vermez**. Aralarında bekleme süresi var.
9. **Baba + Dağ Kartalı** birlikte eşlik eder (**yalnız 3., 9. ve 10. bölümde**): Baba kamp ateşini yakar ve Feza'ya rehberlik eder; yeteneklerini Feza zor durumdayken **otomatik** kullanırlar.
10. **Hala'nın evi (Dev Ev) ayrı bölüm DEĞİL;** yalnız içeriği/mekaniği (pasta/malzeme/pişirme) uygun yerde kullanılır (4. bölüm).
11. **Giriş odası (yuva/hub) yok.** Hikâye girişinden sonra doğrudan 1. bölüm; bölüm bitince kısa otomatik geçişle sıradaki bölüm. Gardırop/mini oyunlar/albüm tek bir **Oyuncak Sandığı** düğmesinde (başlık ve duraklatma menüsü).
12. **Harita:** Tek **resimli Dünya Haritası** (menü gibi; yürünebilir açık dünya DEĞİL). Tepede **Büyük Fener** ışık parçalarıyla yavaş yavaş yanar. **İlk oyunda yalnız bitirilen + sıradaki diyar açık** (hikâye sırayla yaşanır); **oyun bir kez bitince HER bölüm serbest ve açık.** Harita başlıkta ve oyun içinde her zaman açılabilir. Numara/yol bölümlerin konumundan çalışma anında üretilir, sıradaki diyar parlar, bitenlerde altın yıldız.
13. **Bölüm başına yaklaşık 10–12 dakika** (toplam ~2 saat).
14. **Bölüm geçişi:** boss neşelenince ışık parçası + sıradaki diyara ipucu; ardından kısa, **atlanabilir ("Geç")** yolculuk sahnesi. Kapı arama/yürüme zorunluluğu yok.
15. **Kalite çıtası:** Huysuzlara Karşı'nın **Ejderhanın Kalesi** bölümü. Her bölümün kendine özgü bir **mekaniği**, bir **sürpriz anı**, çok aşamalı (≈3) **sevimli boss**'u, yan alanları ve gizli hazineleri olur. "Huysuzları neşelendir → boss" kalıbı her bölümde aynen tekrar etmez.
16. **Kötü karakter korkutucu değil:** Unutulan Kral (§3).
17. **Kral'a ipucu (ONAYLANDI, 1 Kasım 2026):** Unutulan Kral 9. bölümün sonundan önce **adsız, silik** iki ipucuyla sezdirilir: 6. bölümde (Ay Tapınağı) duvar resmi "yarım taçlı yaşlı biri, elinde fener"; 8. bölümde (Saat Kulesi) oyuncak rafında küçük kırık bir taç. İkisinde de ad geçmez, efekt yoktur; Pırıl yalnız "Bu kimin resmi/tacı acaba?" der.
18. **Anne ejderhanın rengi (ONAYLANDI):** Kalede anne ejderha sisin içinde **soluk gri-inci** görünür; tanıma anında (kabuk parçası oturunca) rengi **mor geri gelir**. Sıra: önce kabuğun pembe-altın parlaması biter, sonra (≥1 sn arayla) sis çekilirken renk mora döner; aynı anda iki efekt yok. "Mor yalnız Pırıl'ın" kuralının **tek istisnası**: anne ejderha, **yalnız tanıma anından sonra** (9. bölüm sonu ve 10. bölüm).
19. **Anne sürprizi (ONAYLANDI):** "anne/annem" sözcüğü oyunda **ilk kez 9. bölümde tanıma anında** söylenir. 2, 7, 8 ve 9 (tanıma öncesi) bölümlerde ipuçları yalnız duygusaldır ("Bu çok tanıdık", "Sıcak bir şey hatırlıyorum", ninni). "Anne/annem" ve "ejderha ailem" tanıma anına kadar geçmez. Mantık: Pırıl 7. bölümdeki yanardağda doğdu; anne kırık kabuğun öbür yarısını hatıra olarak kaleye götürdü (9'daki kabuk oturması buna dayanır). 7'deki Ateş Işık Ejderhası **"Ateş Dede"**, Pırıl'ın çok eski bir büyüğüdür (anne değil).
20. **Beş Işık Ejderhası (ONAYLANDI):** Su (2), Toprak (5), Ateş Dede (7), Anne (9) ve Pırıl. Uyuyan üçü 10. bölümde dostlar toplanırken **tek tek, sırayla** başını kaldırıp selam verir (kısa sahne, üst üste efekt yok).
21. **Kral'ın adı Tonton; kıvılcım Kral'ın armağanı (ONAYLANDI):** Kral **Tonton** (adı ipuçlarında geçmez, ilk kez 10. bölümde söylenir). Pırıl'ın göğsündeki kıvılcım Kral'ın eskiden her oyuncağa bıraktığı armağandır; 10. bölümde Kral'ın fenerine **bir kopyası** konar, asıl kıvılcım Pırıl'da (peluşta) kalır; sabah yine parlar.

## 2. Hikâye çerçevesi
**Giriş:** Akşam. Feza yatağında peluş Pırıl'a sarılıyor. Pencerede ay. Peluşun göğsünde minik bir kıvılcım parlıyor, Pırıl canlanıyor: "Feza, Büyük Fener söndü. Bana yardım eder misin?" Rüyaya geçiyorlar.

**Bitiş:** Sabah. Feza yatağında uyanıyor; peluş Pırıl yanında, göğsünde minik bir kıvılcım hâlâ parlıyor.

## 3. Ana hikâye: "Ejderha Işıkları Efsanesi"
Rüya dünyasını eskiden **beş Işık Ejderhası** korurmuş: **Su, Toprak, Ateş Dede, Anne ve Pırıl** (Pırıl en küçükleri); **Büyük Fener** her gece yanar, bütün çocukların rüyaları yolunu onunla bulurmuş. Sonra **Sessiz Sis** yükselmiş: kimseye zarar vermiyor ama herkese yolunu, adını ve neşesini unutturuyor. Huysuzlar kızgın değil, **yollarını kaybettikleri için huysuz** (Feza onları neşelendiriyor). Su, Toprak ve Ateş Dede uykuya dalmış (10. bölümde dostlar toplanırken tek tek başını kaldırıp selam verirler), Anne sisin içinde çocuğunu unutmuş, fenerin ışığı parçalanıp dünyaya dağılmış.

**Pırıl** beşinci ve en küçük ejderha, yumurtadan yeni çıkmış. Yanardağda (7. bölüm), Ateş Dede'nin sıcak yuvasında doğmuş; sis her şeyi unutturunca peluşa sığınmış, çünkü yalnız Feza'nın rüyasında canlanabiliyor. Göğsündeki **kıvılcım**, Kral Tonton'un eskiden her oyuncağa bıraktığı armağandır.

**Sisin sahibi — Unutulan Kral (adı Tonton):** çok eski bir rüya bekçisi. Çocuklar büyüyüp rüyalar değişince kimse onu hatırlamaz olmuş; yalnız kalmış ve "kimse beni hatırlamıyorsa herkes her şeyi unutsun, yanımda kalsın" diye sisi yaymış. Kötülük yapmak istemiyor, yalnızlıktan korkuyor. **Kızgın yüzü yok**: gümüş sakallı, yorgun, üzgün gözlü yaşlı bir kral; sis pelerini gibi etrafında. Feza ona kılıçla değil **dostlukla** karşılık verir: Kral sisten unutulmuş eşyalar/oyuncaklar çağırır, Feza onları neşelendirdikçe Kral'ın kayıp anıları geri gelir; Feza ve Pırıl ona adını söyler ("Tonton! Seni hatırlıyoruz"). Sis çekilir. Kral Tonton fenerin bekçisi olarak yalnız kalmaz. Pırıl'ın kıvılcımının bir kopyası Kral'ın fenerine konar; asıl kıvılcım Pırıl'da kalır. Kral önceden **adsız** sezdirilir: 6. bölümde silik duvar resmi, 8. bölümde rafta kırık taç; 9. bölüm sonunda kuleden gölgesi "Gelin... lütfen" der. Adı ilk kez 10. bölümde söylenir.

**Duygusal dönüm noktası:** Ejderhanın Kalesi'ndeki ejderha (Huysuz Ejderha) **Pırıl'ın annesidir**; sis yüzünden çocuğunu unutmuş, bu yüzden huysuzdur. Savaş boyunca çoğalan benekli yumurtalar bunu destekler. **Sürpriz:** "anne" sözcüğü ilk kez 9. bölümde tanıma anında geçer; öncesinde yalnız duygusal ipuçları vardır (karar 19). Anne sisin içinde soluk gri-inci görünür, tanımayla mor rengi geri gelir (karar 18).
**Kabuğun hikâyesi:** Pırıl yanardağda doğdu; anne, sis unutturmadan önce kırık kabuğun öbür yarısını hatıra olarak kaleye götürüp beşiğinin yanında saklamış. 7. bölümde bulunan parça ile kaledeki yarım kabuk aynı kabuktur; 9. bölümde birbirine tam oturur.

## 4. 10 Bölüm
Sıra, eşlik edenler ve kaynaklar (kaynak yollar `../feza-bilbo/...` altındadır):

| # | Bölüm | Eşlik eden | Kaynak / içerik |
|---|---|---|---|
| 1 | **Işıklı Mantar Vadisi** | Pırıl | `piril` (06z/05z_mantar) → Huysuz görünümüne uyarlanır |
| 2 | **Mercan Krallığı** | Pırıl | `huysuz` Tuvalet Rüyası köpük mekaniği (köpük kabarcığıyla dalış) + `piril` Mercan Denizi (mercan bahçesi, inci, Koca Kirpi Balık) |
| 3 | **Huysuz Orman** | **Baba + Dağ Kartalı** | `huysuz` Huysuz Orman (Kral Jöle) + `orman` kamp ateşi/Baba/Kartal (top bulma YOK) |
| 4 | **Altın Değirmen Vadisi** | **Hala** (rüya kılığında köy fırıncısı) | `huysuz` Kefir Vadisi içeriği yeniden çerçevelenir (nehir→berrak ışıltılı dere, yoğurt tepecikleri→altın tepeler, delikli peynir→taş duvar/kemer, güğüm/yayık→değirmen çarkı, bisküvi köprü→taş/ahşap köprü) + `hala` malzeme/pişirme mekaniği ("ışık ekmeği") |
| 5 | **Köstebek ve Salyangoz Mağarası** | **Bilbo katılır** | `huysuz` (Usta Köstebek) |
| 6 | **Ay Tapınağı** | Pırıl | `huysuz` Zıp Zıp Ay yeniden çerçevelenir (gece zirvesinde antik taş mabet, kristal kubbeler, rün taşları, hafif zıplama; Ponpon Ay Tavşanı→Mabet Bekçisi); iç salonda silik duvar resmi (Kral ipucu) |
| 7 | **Lav Yanardağı** | Pırıl | `huysuz` (Koca Lav Kaplumbağası); Pırıl'ın doğduğu yer, uyuyan **Ateş Dede**, ışığı sönmeye başlar |
| 8 | **Surlu Şehir** | **Bilbo** | `huysuz` (Huysuz Şövalye) + `piril` Oyuncak Atölyesi saat kulesi; kulede oyuncak rafında kırık taç (Kral ipucu) |
| 9 | **Ejderhanın Kalesi** | Hepsi (Baba, Kartal, Bilbo, Hala) | `huysuz` (Huysuz Ejderha = Pırıl'ın annesi; sisle soluk gri-inci, tanımayla mor) |
| 10 | **Büyük Fener** | Hepsi | `piril` Gökkuşağı Adaları (dev Pırıl, uçuş, boss geçidi) + Unutulan Kral (Tonton) karşılaşması + üç uyuyan Işık Ejderhasının selamı |

Dışarıda kalan: Kum Saati Çölü (ayrı bölüm olmaz; kum saati fikri uygunsa Mağara/Saat Kulesi bulmacasına), Saklı Toplar Ormanı (yalnız Baba/Kartal/kamp anı kalır), Hala'nın evi (ayrı bölüm yok).

### Bölüm başına özet (ayrıntı planı yazılacak)
1. **Mantar:** Pırıl'la tanışma, ilk ışık parçası, sis ilk görünür, Pırıl ışık nefesini öğrenir. Boss Koca Pofuduk Mantar; ipucu: "Işık denizlerin altında."
2. **Mercan:** köpük gölünden dalış; **Su Işık Ejderhası** uyur (Pırıl: "Bana çok tanıdık geliyor"); boss Koca Kirpi Balık; Pırıl **köpük kalkanını** geri alır.
3. **Orman:** Baba kamp ateşini yakar, Kartal yönü bulur; sis ormanı yutmuş; boss Kral Jöle; Baba+Kartal otomatik yardım başlar.
4. **Değirmen:** durmuş değirmen; un/su/ateş toplayıp ışık ekmeği pişir; Hala fırıncı; boss Değirmen Bekçisi (taş-tahta dev, un bulutu dansı; neşelenince çarklar döner).
5. **Mağara:** Bilbo mağarada kaybolmuş, bulunur ve katılır; yer altı zindanı, kristal bulmaca; **Toprak Işık Ejderhası** uyur; boss Usta Köstebek; ödül: yeni kılıç.
6. **Ay Tapınağı:** zıplayarak yıldız basamaklarına çıkma; boss Mabet Bekçisi (sevimli taş heykel); Pırıl **kanat rüzgârını** geri alır; iç salonda **silik duvar resmi** (yarım taçlı yaşlı biri, elinde fener; ad yok).
7. **Yanardağ:** **Ateş Işık Ejderhası (Ateş Dede)** uyur; Pırıl'ın kabuk parçası bulunur (burada doğmuş; kabuğun öbür yarısı yok); Pırıl'ın ışığı söner, Feza onu taşır ("karanlık an"); boss Koca Lav Kaplumbağası.
8. **Surlu Şehir:** herkes herkesi unutmuş; saat kulesi durmuş; şenlik oyunlarıyla şehirliler yeniden güler; Bilbo yolu gösterir; kulede oyuncak rafında **küçük kırık taç** (ad yok); boss Huysuz Şövalye.
9. **Kale:** sevimli çok aşamalı ejderha boss'u, çoğalan yumurtalar, **dostluk kalpleri**; ejderha (sisle soluk gri-inci) kabuk parçası oturunca Pırıl'ın annesi çıkar, rengi mor geri gelir, "anne" sözcüğü ilk kez burada; Pırıl **kalp tozu** gücünü geri alır; kuleden Kral'ın gölgesi Büyük Fener'e çağırır.
10. **Büyük Fener:** Unutulan Kral **Tonton** karşılaşması (dostlukla; kıvılcımın bir kopyası Kral'a), Pırıl büyür, Feza sırtında uçuş, fener birlikte yakılır, dostlar toplanırken Su/Toprak/Ateş Dede tek tek selam verir, sabah uyanış.

## 5. Karakterler ve yetenekleri
- **Pırıl:** her bölümde yanında (7. bölümde uyur, Feza taşır). Güçleri bölümlerle geri gelir: ışık nefesi (başlangıç), köpük kalkanı (2), kanat rüzgârı (6), kalp tozu (9), büyüme/uçuş (10). Modeli `piril/src/04_piril*.js` (≈15 bin üçgen). Dokununca kıkırdar; Feza'nın başına konar; uyurken peluş gibi kıvrılır; yalnız konuşurken gözleri açık.
- **Baba + Dağ Kartalı:** **yalnız 3., 9. ve 10. bölümde** eşlik eder (4–8'de yok; indeks incelemesi); zor durumda otomatik yardım. Modeller `orman/src/04_forest_party*.js`.
- **Bilbo:** 5. bölümde katılır (5, 8, 9, 10'da var; 6–7'de yok). Biner (oyuncu isteğiyle), otomatik havlama (sersemletir, zarar vermez). Modeller `huysuz/src/04_bilbo*.js`.
- **Hala:** yalnız 4. bölüm (ve 9–10 finalde dostlarla). Model `hala/src/04_hala.js`.
- **Anne ejderha:** 9. bölümde boss (sisle soluk gri-inci, tanımadan sonra mor), 10. bölümde yanlarında uçar. **Ateş Dede / Su / Toprak Işık Ejderhaları:** 7/2/5'te uyur, 10'da selam verir (yalnız küçük sahne).
- **Kral Tonton (Unutulan Kral):** yalnız 10. bölümde görünür (9 sonunda gölge); gümüş sakallı, yorgun, yarım taçlı, elinde sönük fener. Kızgın yüz yok.
- **Feza:** `04_feza.js`, `04_esyalar.js` (piril sürümü: 38 eşya, 6 kostüm, kılıç/pelerin/taç). Envanter yeni hikâyeye uydurulur.

## 6. Bölüm akışı ve harita
- Boss neşelenir → **tek ışık topu** Pırıl'a uçar, kanatları parlar (başka efekt yok) → ışık parçası + ipucu → (uyku molası YOK, karar 25) → kısa **atlanabilir** yolculuk sahnesi → sıradaki bölüm kendiliğinden başlar. "Seviye N!", "Yeni Yetenek!", ödül kartı **mola sonrası, sakin bir anda, tek tek** gösterilir; boss savaşında ve ışık anında yok.
- ~~Uyku molası~~ **KALDIRILDI (karar 25).** Yatak odası/uyku yalnız giriş masalında ve en sondaki uyanışta var.
- **Yazılar:** aynı anda en fazla bir büyük yazı; alan tabelaları koyu bantta; boss uyarı cümlesinin altyazısı hep görünür.
- **Boss uyarıları:** ses hangi rengi/şekli söylüyorsa yerde **o an** o işaret (≥2 sn, kalın kenarlı, düşük dolgu) görünür; tek halka; işaret, cümleden önce ya da aynı anda çizilir (kök neden: ipucu cümlelerinin düşük öncelikli sıraya girmesi — yüksek öncelik kullan).
- **Harita** (karar 12). Hikâye bütünlüğü için ilk oyunda sıralı, bittikten sonra serbest.
- **Otomatik kayıt:** bölüm bitince ve ışık alınınca. "Devam Et" sıradaki bitmemiş bölüme gider. "Baştan Başla" onay sorar (Pırıl'ın yüzüyle).

## 7. Teknik plan
**Taban motor: `../feza-bilbo/piril/`** (kopyalanır; orijinale dokunulmaz). İçinde: `BOLUM.define(id,{…})` bölüm kaydı, `HUYSUZ.type/boss/zone`, `BOSSDAV.register`, MINIGAME çerçevesi, STORY (10_story.js), harita/hub (09h_hub), Pırıl API (`PIRIL.yap`, `PIRIL_GUC`, `PIRIL_TAKIP`), müzik ve ses sistemi, 3B Three.js (klasik script, ES module yok), `index.html` çift tıklayınca çalışır. Sözleşme: `piril/PIRIL.md` (okunmalı), `piril/SPEC.md`.

**Önemli teknik gerçek:** Huysuz, **eski, tek parça motorla** (05_enemies/06_level/07_game) yazıldı; piril ise modüler `06z_<bolum>.js` + `05z_<bolum>.js` bölüm sistemiyle. Dolayısıyla Huysuz bölümleri piril motoruna **yeniden yazılarak taşınır** (görünüm, dekor, düşman, boss ve ses korunur; kod yeni bölüm sistemine çevrilir). Bu en büyük iş kalemidir; her bölüm ayrı bir ajanın sahipliğinde, bağımsız dosyalarda ilerler.

**Dosya sahipliği (çakışmayı önlemek için):** her bölüm yalnız kendi `06z_<id>.js` + `05z_<id>.js` + `02l_<id>.js` dosyalarına yazar. Motor dosyaları (`07_game`, `09_ui`, `03_fx`, `10_story`, `ui.css`) tek bir CORE/MOTOR ajanında; Pırıl dosyaları PIRIL3D'de; ses (`gen_voice.py`, `sesler.js`) SES'te; müzik (`02_audio.js`) MUZIK'te; envanter ESYA'da. Ajanlar arası istek: `scratchpad/.../istek/<KİMDEN>_<KİME>.md`.

**Klasör yapısı (öneri):** `feza-piril-3d-arpg/` altında `index.html`, `src/`, `vendor/`, `sesler.js`, `sw.js`, `manifest.webmanifest`, simgeler, `yayinla.command`, `README.md`, `CLAUDE.md`, bu `PLAN.md`.

## 8. Her oyunda olması gereken kurallar (`../CLAUDE.md`'den özet; kuralın aslı orada)
- iPad'de uygulama gibi açılsın: `manifest.webmanifest`, `apple-touch-icon` (180px) + 192/512 simge, `apple-mobile-web-app-capable`, **service worker (`sw.js`) ile internetsiz çalışma** (index.html önce ağ, diğerleri önce önbellek; eski önbellek silerken yalnız kendi öneki ör. `k.startsWith('feza-piril-3d-arpg-')`).
- Dokunmatik kolay kontrol (sürükleyerek hareket; klavye yedek).
- Seslendirme: doğal Türkçe kadın sesi **edge-tts `tr-TR-EmelNeural`**, önceden kaydedilmiş mp3; baş/sondaki sessizlik ffmpeg ile kırpılır; tarayıcı sesi yok; İngilizce kelimeler doğru telaffuzla yazılır. "Aa", "Oo" gibi kısa büyük harfli ünlemler kullanılmaz ("Bak bak", "Vay").
- Övgü ara sıra ve çeşitli.
- Kütüphaneler projeye konur; ES module import yok.
- **Test:** her zaman `?sessiz` (ebeveynin Mac'inde ses çalmasın). GitHub'a yalnız ebeveyn "yükle/gönder" derse; PR yok; hesap `goktugkarpat`, commit e-postası `goktugkarpat@users.noreply.github.com`; `yayinla.command` bulunur.
- **Performans (M1 iPad Pro, 60 FPS):** ≤150 çizim çağrısı, ≤400k üçgen (en yoğun an), 4× CPU yavaşlatmada 60 FPS ölçülür. Çocuk için: Feza ne yaptığını her an anlamalı; zemin karakterlerden soluk, dekor kenarda, yürünür alanda iri/yüksek nesne yok, kamerayı kapatan nesne yok.
- Çocuk içeriği: kızgın yüz yok, böcek yok, korkutucu/iskelet çağrışımı yok, kaybetmek yok, İngilizce yazı yok (yalnız Türkçe), mor renk yalnız Pırıl'ın (**tek istisna:** anne ejderha, yalnız tanıma anından sonra; karar 18).

## 9. Test yöntemi (öğrenilenler)
- Headless Chrome'u CDP ile sür (Mac'te `node` bozuk; sözdizimini tarayıcıda `new Function(kaynak)` ile denetle), `Emulation.setCPUThrottlingRate rate=4` ile FPS ölç, `renderer.info` ile çizim/üçgen say.
- Gerçek dokunuşla baştan sona oyna (yatay 1180×820 + dikey 820×1180); boss uyarılarını cümle anı + 1 sn sonra karelerle doğrula.
- Test sunucusu/tarayıcı iş bitince kapatılır; geçici dosyalar proje dışında (scratchpad) tutulur.

## 10. Sıradaki adımlar
**Plan aşaması tamam (1 Kasım 2026):** 10 bölümün ayrıntı planı ve indeks onaylandı; 5 karar işlendi (§1, 17–21). Kalan 17 küçük soru kodlamadan önce/sırasında karar verilir; ebeveyn itiraz etmezse `bolumler/00_INDEKS.md`'deki öneri geçerlidir.
1. **Altyapı (CORE):** `../feza-bilbo/piril/` motorunu `feza-piril-3d-arpg/`'e kopyala; yeni başlık/giriş/hikâye (STORY), 10 bölümlük sıralı akış, kayıt ve "Devam Et", resimli harita (9+1 parçalı fener), bölüm geçişi + atlanabilir yolculuk, bölüm sonu akışı, **tek net efekt kuyruğu**, boss işareti/uyarı, eşlikçi API ve `BILBO=PIRIL` takma adının ayrılması, zıplama, castle tabanı (indeks bölüm (d)). PIRIL3D, SES, MUZIK ve ESYA ajanlarının hazırlığı paralel.
2. **Ses hazırlığı:** cümle anahtar adlarını tek kurala bağla; metni kesinleşen cümleleri (Kral adı Tonton artık belli) kaydetmeye hazırla; Aa/Oo kuralı ve İngilizce kelime denetimi.
3. **Bölümleri sırayla yaz/taşı (1→10)** indeksteki bağımlılık sırasıyla; her bölüm kendi `06z_/05z_/02l_` dosyalarında, kendi testleriyle (`?sessiz`).
4. Seslendirme (yeni anlatı metni), müzik, envanter, Pırıl yetenek dağılımı.
5. QA: çocuk gibi baştan sona (yatay+dikey), efekt/okunurluk denetimi, 4× CPU FPS.
6. **Yalnız ebeveyn onayıyla** GitHub'a gönder. Eski dört oyuna ne olacağı (kaldırma/saklama) en son, ebeveynle karar verilir.

## 11. Sonradan eklenen kararlar (ebeveyn, 1 Kasım 2026, kodlama sırasında)
22. **Başlık ekranı sade:** düğmeler küçük, Feza ve Pırıl'ın üstünü kapatmaz; başlıkta yalnız "Oyna" + küçük "Harita" (+ kayıt varsa küçük "Devam Et").
23. **Oyuncak Sandığı KALDIRILDI.** Gardırop (kostüm + kazanılan kılıç/pelerin/taç) ve Pırıl'ın Köşesi (Pırıl süsleri) + küçük Çıkartma Albümü **duraklatma menüsünde**.
24. **Mini oyunlar menüde/başlıkta YOK:** yalnız bölümlerin içinde, bölüm nesnesine/istasyonuna dokununca başlar. Ayrı bir mini oyun listesi/yeri yapılmaz.
25. **Bölüm sonunda uyku molası YOK (ebeveyn):** sıra = boss neşelenir → ışık topu → ışık parçası + ipucu → kartlar tek tek (atlanabilir) → yolculuk (geçiş sahnesi). Uyku/yatak yalnız giriş masalı ve final.
26. **Zorluk seçimi YOK (ebeveyn):** Normal/Zor kalktı; menüde, başlıkta, ayarlarda ve rozet olarak hiçbir yerde görünmez. Eski kayıtlar yüklenir, tek dengeli mod (denge sayıları MOTOR2).
