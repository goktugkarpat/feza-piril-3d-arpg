# Bölüm 1: Işıklı Mantar Vadisi
- **Eşlik eden:** yalnız Pırıl · **Süre:** ~11 dakika (giriş sinematiği ayrı, ~25 sn) · **Işık parçası:** 1. ışık (Pırıl'ın kanatları ilk kez parlar) · **Pırıl'ın gücü:** ışık nefesi · **İpucu:** "Işık denizlerin altında uyuyor."
- **Bu bölüm aynı zamanda öğreticidir:** hareket, dokunarak neşelendirme, Pırıl'a dokunma, ışık anı. Her yeni şey tek tek, sakin ve cömert anlatımla (övgü ara sıra) öğretilir.

## 1. Bir cümlede bölüm
Feza rüyaya geçer, kıvılcımdan canlanan Pırıl'la tanışır; ikisi parlayan dev mantarların vadisinde Pırıl'ın ilk ışığını arar, tünelde Sessiz Sis'i ilk kez görür, Pırıl ışık nefesini öğrenir ve Koca Pofuduk Mantar'ı neşelendirip ışığı geri alır.
- **Nasıl gelinir:** Oyunun başı. Yatak odası giriş sahnesi (CORE'un işi) bitince Feza ve Pırıl vadiye düşer. "Hub/giriş odası" yok.
- **Sonu:** Boss neşelenir → tek ışık topu Pırıl'a uçar, kanatlar parlar → ışık parçası + ipucu ("Işık denizlerin altında uyuyor") → kısa uyku molası → atlanabilir yolculuk sahnesi: vadinin ışıklı deresi akıp büyür, ucunda kocaman bir **köpük gölü** görünür; yeni bölüm (Mercan) oradan başlar.

## 2. Görsel kimlik
Karar 4: Huysuzlara Karşı'nın zengin, parlak, cilalı görünümü. Huysuz'un görsel dili kaynak koddan şöyle çıkıyor:
- **Parlak ve pastel:** hemi ışık 0,85–0,95, güneş 2,0–2,6, pozlama 1,0, bloom 0,3–0,5, doygunluk 1,04–1,1, kenar kararması (vignette) 0,2–0,26. Gün ışığı tonlu sis (Huysuz Orman: 0xb4dcc0, Tuvalet: 0xadd9df). Yüzeyler cilalı (pürüzlülük ~0,4), kenarda ince ışık çizgisi ("rim": 0,1–0,2).
- **Zemin dokusu iri parça + ince doku:** pastel çini/halı, kenarda koyu çerçeve; yürünür alan açık, dış alan koyu (sınır belli). Dekor kenarda yoğun, yürünür alanda seyrek ve alçak.
- **Işık:** tek güneş + geniş hafif ışık; zemine "pişmiş" yumuşak ışık havuzları.
Pırıl'ın kaynağı (`06z_mantar.js`) ise alacakaranlık, loş ve ışıklı mantarlıydı. **Yeni birleşim: "parlak alacakaranlık"**: Huysuz'un parlaklığı + mantarların kendi ışığı.
- **Aynen korunan (06z_mantar.js):** mantar yapıcı (sap+şapka+ışıklı benekler+şapka altı ışıltısı), dev yaprak altları, raf mantarı merdivenleri, ışıklı dere (akan ışık gölgelendiricisi), kök kemerleri, süzülen ışık tozları (tek çizim), 3B Zıp Mantarcık/Spor Pofuduğu/Tohum Topacı/Yosun Topu/Koca Pofuduk Mantar modelleri (05z_mantar.js).
- **Değişenler:** (1) **Mor yalnız Pırıl'ın** (PLAN §8): kaynaktaki mor-lavanta zemin, lavanta çakıl yol, mor-mavi sis rengi turkuaz-lacivert zemin (~0x1c3a52 – 0x2a5a6a), krem-altın çakıl yol, yeşil-turkuaz sise çevrilir. Mantar şapkalarındaki mor da çıkar (pembe, mavi, turkuaz, turuncu, nane kalır). (2) Fog 0x2a2250 yerine açık turkuaz-lacivert (~0x2a4a72, 34→90), ışık/pozlama biraz açılır (pozlama ~1,1, bloom 0,35, vignette 0,24). (3) Zemin Huysuz gibi iki kat: geniş ton dalgası + iri ışıklı yosun lekeleri. (4) Yol kenarına Huysuz'un tabela/bordür düzeni: yürünür alanı belirten ince ışıklı mantar sınırı.
- **Karar 5 uyarısı:** kaynaktaki ışık tozları ve mantar parıltıları sade kalır: yalnız zemin ışığı, sönük tozlar; titreşim yok.

## 3. Alanlar (5 ana + 2 yan) ve dakika dakika
| Dakika | Alan | Ne olur |
|---|---|---|
| 0:00–2:15 | **1. Parıltı Çayırı (öğretici)** | Tanışma, sürükleyerek yürüme, altın şeker, şarkı mantarları |
| 2:15–4:15 | **2. Dev Mantar Ormanı** | Zıplatan mantarlar, ilk huysuz (Zıp Mantarcık), ilk neşelendirme |
| 4:15–6:00 | **3. Işıklı Dere** | Suyun içinden yürüme, taş/köprü, Spor Pofuduğu, Yosun Topu |
| 6:00–7:45 | **4. Kök Tünelleri** | Sessiz Sis ilk kez, Pırıl ışık nefesini öğrenir |
| (aralara) | **Yan 1: Peri Halkası** (gizli, ~1 dk) · **Yan 2: Pofuduk Top Çukuru** (~45 sn) | Gizli ödüller |
| 7:45–11:00 | **5. Pofuduk Çayırı (arena)** | Koca Pofuduk Mantar |
- **Alan 1 Parıltı Çayırı:** yumuşak yosun, minik ışıklı mantar kümeleri. İlk oda **huysuz yok**. Pırıl yolu gösterir (pointTo). 2. odada 5 şarkı söyleyen mantar. 2 dk.
- **Alan 2 Dev Mantar Ormanı:** dev şemsiye mantarlar, raf mantarı merdivenleri, üç pembe **zıplatan mantar** halkası (basınca Feza yay çizip sonrakine uçar). İlk Zıp Mantarcık; grup en çok 2.
- **Alan 3 Işıklı Dere:** ışıl ışıl sığ dere; içinden yürünür (su sıçrar), basamak taşları, raf mantarından köprü. Tohum Topacı, Spor Pofuduğu ve Yosun Topu tanıtılır.
- **Alan 4 Kök Tünelleri:** dev kök kemerlerinin yanında alçak kökler, asılı ışıklı yosun damlaları, ışıklı mantarlar. Kamerayı kapatan kemer yok (kaynakta QA sırasında kaldırıldı).
- **Alan 5 Arena:** dev mantar çemberi, kuzeyde "taht mantarı", kenarda peri halkası mantarları.
- **Yan 1 Peri Halkası:** kaynakta yan odada; yoksa 2. alanın kenarında. **Yan 2 Pofuduk Top Çukuru:** 5 pofuduk top (tekmelenince parıltı + şeker, 10 sn sonra yeniden kabarır).

## 4. Bölüme özgü ana mekanik: "Mantar Müziği ve Zıp Zıp"
Huysuz neşelendirmenin dışında üç sakin etkileşim:
1. **Şarkı söyleyen mantarlar (Alan 1):** 5 mantar sırayla durur. Feza hangisine dokunursa **do-re-mi** söyler; hepsine dokunulunca ezgi + altın şeker. **Yanlış sıra yok:** hangi sırayla dokunsa olur; hepsi söylediğinde ezgi çalar. Ses: "Bu mantarlar şarkı söylüyor! Hepsine dokun." (kaynaktaki "sırayla" sözü kaldırılır).
2. **Zıplatan mantarlar (Alan 2):** üçlü pembe halka. Basınca otomatik yay uçuşu bir sonrakine; iniş noktası belli, kaçırma/düşme yok.
3. **Işık nefesi (Alan 4):** aşağıda "Sürpriz an" ve tünel bölümü. Pırıl'a dokunma = nefes. Bekleme süresi ~8 sn önerilir (Feza zorda kalırsa nefes **otomatik** de çıkar, en çok 20 sn'de bir).
- **Öğretim sırası (her adım yaklaşık 30–40 sn arayla, tek yeni şey):** sürükle → altın şeker → şarkı → ilk huysuz dokunma → zıplatan mantar → Pırıl'a dokun → ışık nefesi → boss.

## 5. Sürpriz an: "Sis tünele girer"
Alan 4'ün ortasında tünel ışığı **tek yumuşak hamlede** sönmeye başlar: gri-mavi **Sessiz Sis** yerden bir perde gibi yükselir; mantarlar sırayla solar, Pırıl'ın kanatları da sönükleşir. Feza Pırıl'a dokunur; Pırıl derin nefes alıp **tek ışık nefesi** üfler: mantarlar yoldan sırayla yanar, sis tek perdede çekilir. Aynı anda tek büyük efekt (sis çekilmesi) ve tek büyük yazı yok (yalnız altyazı). Korkutucu yüz/şekil yok; sis sadece sakin bir bulut. Ardından 1–2 huysuz sisin içinde "yolunu kaybetmiş" gibi dolaşır (huysuz sebebi!), Feza nefesi huysuza da dener (kısa sersemler, sonra dokunuşla neşelenir).

## 6. Düşmanlar (kaynak: 05z_mantar.js)
Hepsi sevimli, gülümseyen, kızgın yüz yok, böcek yok.
- **Zıp Mantarcık:** minik, kocaman şapkalı (mavi/turkuaz/pembe), parlak benekli; zıplayarak gelir; çömelince şapkası yaylanır. Bekleyince şapkasını köpek gibi silker. İlk öğretici düşman.
- **Spor Pofuduğu:** yuvarlak lila-beyaz pofuduk (mor yok → açık nane-beyaz yapılır); şişer, "püf" diye **yumuşak spor bulutu** üfler. Feza'ya değince hasar yok: bulutta kısa yavaşlama (canı azalmaz). Ses: "Hiç acımaz, biraz bekle geçer."
- **Tohum Topacı:** palamut topaç; dönmeye başlayınca kenara kaç; fırıl fırıl yuvarlanır.
- **Yosun Topu:** yeşil yosun yumağı; yosun tümseği gibi saklanır, yaklaşınca "cee!" diye çıkar.
- **Altın Mantarcık (nadir):** ışıl ışıl, hızlı; neşelenince altın şeker. Yalnız Alan 2'den sonra.
- **Yeni:** **Uykulu Mantarcık** (Alan 4): sis yüzünden uyuyakalmış, gözleri kapalı, yürümez; dokununca esneyip neşelenir. Çocuğa "yumuşak" ilk deneyim. Bu bölümün tek yeni türü.
- İlk huysuz sayısı: Alan 1'de yok, Alan 2'de grup ≤ 2, sonra ≤ 3–4. Elit varyant Alan 3'ten sonra.

## 7. Mini oyun / yan etkinlik / gizli şeyler
- **Peri Halkası (Yan 1):** tam ortasına basınca mantarlar sırayla yanar → altın şeker + çıkartma. Ses: "Burada bir peri halkası var. Tam ortasına bas!"
- **Işıklı palamutlar (gizli, ≥3):** yarı gömülü, alanların kenarında; yanına gidince açılır. Çıkartma "Işıklı Palamut".
- **Pofuduk toplar:** her alanda 1 (+Yan 2'de), içine girince "pof!" parıltı + şeker.
- **Yosunlu kütük sandık** (kaynakta QA ile mantara uyarlanmış kütük sandık, palamut sepeti, kocaman palamut) kırılınca şeker.
- **Gizli (yeni):** Boss arenasının dışında, kuzey kenarda "Işıklı Mantar Merdiveni": raf mantarı basamakları dev mantarın tepesine çıkar; tepede Pırıl'ın başına konabileceği küçük bir yosun koltuk + 1 sandık. Basamakta tek bir tabela yok, Pırıl yolu gösterir.

## 8. Boss: Koca Pofuduk Mantar
**Görünüş (kaynak aynen):** ~3,4 m tombul krem sap, büyük pofuduk **pembe** şapka (mor yok), ışıklı benekler, şapka kenarında saçak toplar, tepede küçük ışık topu filiz, kısa kollar, yuvarlak ayaklar; büyük gözler, pembe yanaklar. Işık topu Pırıl'ın ilk ışığıdır ("şapkasında parlıyor"). **Kimlik:** vadiyi kendi ışığıyla koruyan, sis yüzünden uykusuz kalıp burnu kaşınan, huysuzlaşan dev mantar. Kızgın değil, uykulu.
**Aşamalar (can eşikleri %66 / %33; geçişte şapka "pof" diye uçar, bu sırada vurulmaz, ışık efekti yok):**
| Aşama | Saldırılar | Uykuya dalmadan önce |
|---|---|---|
| 1 (>%66) | Hapşırık, Şapka Zıplaması | 4 saldırı (kaynakta 5; ilk boss için indirildi) |
| 2 (%66–33) | + Spor Halkası | 4 saldırı |
| 3 (<%33) | Üçlü Zıplama, Spor Halkası, Hapşırık | 3 saldırı |
**Saldırılar ve uyarılar (yerdeki işaret ≥2,2 sn, kalın kenarlı, dolgusu az; işaret çizildiği anda cümle söylenir; renk = söylenen renk):**
- **Hapşırık (3,4 sn):** yerde **yeşil halkalar** (1,5 m). Ses: "Hapşıracak! Yerdeki yeşil halkalardan uzaklaş." Spor bulutları yavaşlatır, can almaz (kısa).
- **Şapka Zıplaması (2,2 sn):** Feza'nın yanında **pembe halka**, 1,4 sn sonra "pof" iniş. Ses: "Şapkasıyla zıplayacak! Pembe halkadan kaç."
- **Spor Halkası (3,3 sn):** yakın halka, sonra uzak halka, ikisi de **yeşil**; arada güvenli boşluk. Ses: "Hoppala, şapkası uçtu! Şimdi spor halkası yapacak, boşluktan kaç!"
- **Üçlü Zıplama (4,4 sn):** art arda üç **pembe halka**, sonuncusunda yorulur. Ses: "Gıdıklandı! Şimdi üç kere zıplayacak, pembe halkalardan uzak dur!"
- **Kıkırdama molası (uyku):** her turdan sonra Zzz; vuruş ×1,5. Ses: "Koca Pofuduk Mantar uyukluyor. Tam zamanı, neşelendir onu!" (2. kez: "Yine uykusu geldi. Hadi Feza, şimdi!"). Pırıl Feza'nın yanında tutar; ışık nefesi uyku molasında vurma hızını artırır (isteğe bağlı).
- **Yardımcılar:** %60 ve %30 canda 2'şer Zıp Mantarcık (hasarı %70).
**Neşelenince (tek net efekt):** şapka havaya fırlar, konar; Koca Pofuduk Mantar küçük mantarcıklarla zıplama dansı yapar (arka planda, sade), kocaman esner, uyur ve ışığı Pırıl'a verir: **tek ışık topu** Pırıl'a uçar. Kaynaktaki "ışık sporu yağmuru / peri halkası fıskiyeleri" **kaldırılır** (karar 5).
**Zorluk:** ilk boss en yumuşağı; saldırılar arası ≥1,2 sn boşluk, düşük hasar, Feza'nın canı bitmez gibi (yenilgi yok; Pırıl kanatlarıyla sarar).

## 9. Eşlik eden karakterler
- **Pırıl (tek eşlikçi):** (a) Tanışma: kıvılcımdan canlanır, kıkırdar, "Işığımın kokusunu alıyorum." (b) **Dokununca kıkırdar**, başa konar (öğretilir). (c) İlk neşelendirmede sevinir: "Yaşasın! İlk huysuzu neşelendirdin!" (d) Zıplayınca: "Yuppi! Uçar gibiydin!" (e) Tünelde ışık nefesi (sürpriz an). (f) Boss'ta: "Feza, ben yanındayım. Birlikte yaparız!" (g) Işık topu gelince kanatları ilk kez parlar.
- **Otomatik yardım:** ışık nefesi Feza zor durumdayken/üç huysuz birden gelince kendiliğinden (en çok 20 sn'de bir; yakındaki huysuzu kısa sersemletir, zarar vermez). Baba/Kartal/Bilbo/Hala yok.

## 10. Ödüller
- **Işık parçası:** 1. ışık, Pırıl'ın kanadı. **Güç:** ışık nefesi (öğretildi, kalıcı).
- **Envanter:** Boss: **Pofuduk Mantar Şapkası** (süs/başlık, pembe); gizli: **Işıklı Palamut Kolyesi**; peri halkası çıkartması.
- Altın şeker (Altın Mantarcık, halka, palamut, kütük).

## 11. Anlatıcı ve Pırıl cümleleri (anahtar → cümle)
Kaynak `02l_mantar.js` cümleleri esas alındı; Aa/Oo ünlemi yok.
- `b01_giris` Işıklı Mantar Vadisi'ne geldik! Mantarlar fener gibi parlıyor.
- `b01_pirilGiris` Işığımın kokusunu alıyorum! Burada bir yerde olmalı.
- `b01_surukle` Parmağını ekranda kaydır, Feza o yöne yürüsün.
- `b01_seker` Yerdeki altın şekerleri topla, tatlı tatlı parlıyor.
- `b01_sarki` Bu mantarlar şarkı söylüyor! Hepsine dokun.
- `b01_ilkNese` Yaşasın! İlk huysuzu neşelendirdin!
- `b01_ogretVur` Huysuz yaklaştı! Ona dokun, Feza onu neşelendirsin.
- `b01_ziplat` Şu pembe mantara bas bakalım! Seni zıplatacak.
- `b01_pirilDokun` Bana dokunmayı dene. Ben çok gıdıklanırım!
- `b01_dere` Işıklı derede su şıpır şıpır sıçrıyor!
- `b01_spor` Spor bulutu seni yavaşlattı. Hiç acımaz, biraz bekle geçer.
- `b01_tunel` Dev köklerin altından geçiyoruz. Işıklı yosunlara bak!
- `b01_sis` Bak, sis geliyor! Mantarlar sönüyor.
- `b01_nefes` Bana dokun Feza, ışık nefesi üfleyeceğim!
- `b01_nefesBitti` Yaşasın, yol aydınlandı! Işık nefesim geldi.
- `b01_halka` Burada bir peri halkası var. Tam ortasına bas!
- `b01_halkaBulundu` Peri halkası yandı! Sana altın şeker bıraktı.
- `b01_palamut` Yerde parlayan bir palamut var. Yanına git!
- `b01_orta` Mantar şapkaları zıp zıp zıplatıyor. Yarı yola geldik!
- `b01_arena` Şşş, kocaman bir mantar uyukluyor. Işığım onun şapkasında parlıyor!
- `b01_bossGiris` Şşş, Koca Pofuduk Mantar uyandı! Burnu da çok kaşınıyor.
- `b01_hapsu` Hapşıracak! Yerdeki yeşil halkalardan uzaklaş.
- `b01_zipla` Şapkasıyla zıplayacak! Pembe halkadan kaç.
- `b01_halkaSpor` Hoppala, şapkası uçtu! Şimdi spor halkası yapacak, boşluktan kaç!
- `b01_uclu` Gıdıklandı! Şimdi üç kere zıplayacak, pembe halkalardan uzak dur!
- `b01_uyku` Koca Pofuduk Mantar uyukluyor. Tam zamanı, neşelendir onu!
- `b01_uyku2` Yine uykusu geldi. Hadi Feza, şimdi!
- `b01_yarim` Koca Pofuduk Mantar biraz gülümsedi. Devam et Feza!
- `b01_pirilBoss` Feza, ben yanındayım. Birlikte yaparız!
- `b01_bitti` Koca Pofuduk Mantar neşelendi! Bak, Pırıl'ın ilk ışığını geri veriyor!
- `b01_ipucu` Işık denizlerin altında uyuyor. Haydi, ışığı birlikte bulalım!
- Övgü (ara sıra): `b01_aferin1` Harikasın Feza! · `b01_aferin2` Bravo! · `b01_aferin3` Çok güzel oldu!
Toplam ~33 cümle. Giriş/sinematik ve uyku molası cümleleri STORY'nin (ayrı).

## 12. Müzik/ses atmosferi
Yumuşak çan/celesta + marimba + hafif flüt; yavaş, büyülü, ninni tadında. Dere şıpırtısı, damla sesleri, şarkı mantarlarının do-re-mi'si. Sis anında müzik bir an alçalır, nefesle çan sesi açılır. Boss'ta tempo biraz artar ama oyuncak/komik tonda (fagot "pof" vurguları).

## 13. Çocuk için risk ve sadelik notları
- Öğretim yoğunluğu: tek yeni şey / 30–40 sn. Alan 1'de düşman yok.
- Kaynaktaki çok sayıda parıltı: ışık tozu, kenar kuşağı sade tutulur; zemin yosun benekleri sönük ve **hareketsiz**.
- Mor yasağı: şapka, zemin, sis, spor bulutu, boss'un şapkası (pembe).
- Aynı anda en çok 1 büyük efekt: sis çekilmesi **ya da** ışık topu **ya da** nefes; boss halkaları ≤ 3 işaret aynı anda (üçlü zıplamada sırayla).
- Kameraya göre alçak dekor; kök kemerleri yolun üstünde yok.
- Spor bulutu: hasar yok → "ceza" hissi olmasın.

## 14. Teknik taşıma notu
- **Kaynak:** `piril/src/06z_mantar.js` (847 satır): `yerlesim` (~satır 230–330: spawn listesi, mzPads/mzSing/mzStreams/mzRing/mzPuffs), `kur` (~satır 300–700: mantar yapıcı, dere, kök tünel, arena, çıkış kapısı, kütük sandık), `BOLUM.define` (satır ~830); `05z_mantar.js` (824 satır): 5 düşman tipi + boss modeli (satır 124–515), `HUYSUZ.type/boss/zone` (516–545), spor bulutları (546–608), `BOSSDAV.register` (609–800); `02l_mantar.js`: cümleler.
- **Taşı:** hepsi (yeni bölüm sistemine kopya), düşman/boss kodu çok az değişir.
- **Yeniden yaz/uyarla:** (1) palet: mor→turkuaz/pembe (zemin gölgelendiricisi, `CAPS`, `GLOWC`, `isik`, `zemin`, çıkış kemeri, Spor Pofuduğu rengi); (2) Huysuz aydınlığı (isik değerleri); (3) boss sonu kutlama (satır ~670–690: ışık tozu fıskiyesi) sadeleştir; (4) saldırı sayısı 5/5/4 → 4/4/3.
- **Yeni yaz:** Sessiz Sis perdesi (tünelde mantar sönme/yanma sırası + Pırıl nefesi bağlantısı: `PIRIL_GUC` seviye 1 + yeni "Pırıl'a dokun" girdisi), Uykulu Mantarcık, öğretim tetikleyicileri, Işıklı Mantar Merdiveni gizli alanı, "yolculuk: köpük gölü" ara sahne, sis için tek net efekt.
- **Zorluk: Orta.** Yeni motor: bölüm kaydı (BOLUM.define), BOSSDAV, tek ışık topu akışı, "Pırıl'a dokun" girdisi, çocuk öğretim sırası.

## 15. Açık sorular (ebeveyne)
1. Pırıl'a dokununca ışık nefesi çıksın mı (öğretici, bekleme ~8 sn), yoksa yalnız otomatik mi? (Önerim: ikisi de.)
2. Altın şeker bu oyunda da kalsın mı (toplama puanı)? Kaynakta var; karar listesinde değil.
3. Huysuzlar "Zıp Mantarcık" gibi sevimli ama kaynak adlarıyla mı kalsın, yoksa yeniden isimlendirilsin mi?
