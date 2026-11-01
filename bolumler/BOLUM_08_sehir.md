# Bölüm 8 — Surlu Şehir

**Eşlik eden:** Pırıl + **Bilbo** (Bilbo 5. bölümde katılmıştı; burada yolu gösterir) · **Süre:** ~11–12 dk · **Işık parçası:** 8. parça · **İpucu:** "Uzakta, şehrin üstünde bir kale görünüyor; bayraklar o yöne uzanıyor ve Pırıl o kaleye bakınca 'tanıdık' diyor." · **Duygu:** sıcak, umutlu, kıkırdatan (7. bölümün karanlığından sonra).

---

## 1. Bir cümlede bölüm
Sessiz Sis surlu şehri yutmuş: herkes kendini ve birbirini unutmuş, saat kulesi durmuş; Feza ve Bilbo şehirlilere unuttukları şeyleri hatırlatıp kulenin saatini kurar, sonunda kendini unutan Huysuz Şövalye'yi ve atını neşelendirir.

**Gelişi:** 7. bölümün sonunda Pırıl uyanır, kaplumbağanın kabuğundan çıkan ışıklar bir şehre yol olur. Yolculuk sahnesi (atlanabilir): Pırıl Feza'nın omzunda, Bilbo önde koşuyor, uzakta gri-pembe sisli surlar. Pırıl kısık sesle: "Beni taşıdın. Şimdi ben seninle yürürüm."
**Çıkışı:** Şövalye neşelenir → tek ışık topu Pırıl'a → uyku molası → yolculuk: şenlik bayrakları gökkuşağı olup uzaktaki kaleye uzanır; kule çanı akşamı çalar.

## 2. Görsel kimlik
- **Palet:** bal rengi kaldırım, pastel ahşap evler (şeftali, nane, sarı, açık mavi), kırmızı/mavi şenlik bayrakları, sıcak fener ışığı; **sis**: süt beyazı + çok hafif pembe-gri. Mor yok.
- **Başlangıç → son:** bölüm sisli ve soluk başlar (şehirliler gri tonlu, tabelalar boş); **her hatırlayan şehirli çevresine renk geri getirir**: gri → renkli, boş tabela → resimli tabela. Böylece Feza ilerlemeyi gözle görür.
- **Zemin:** ince, düşük kontrastlı arnavut kaldırımı; ana cadde daha açık taş; kenarlarda ince yeşil çimen. Su: nehir ve kanallar alçakta, taş köprülerle geçilir (yürünür alan hep geniş, kenarlıklı).
- **Aynen korunan:** `huysuz/src/06_level.js` town teması (zemin ~1728, `townData` ~831, nehir/kanal/köprü ~5606, bayraklar ~3047), `05_enemies.js` şehirli modelleri (nöbetçi, simitçi, süpürgeci, tellal, sancak, Şövalye; ~4000–5600), `huysuz` README "7. Surlu Şehir" tanımı (çeşme, pazar tezgâhları, evler, surlar, kuleler, uzakta kale).
- **Yeniden çerçevelenen:** huysuzlar artık "ejderha onları kandırdı" değil, **sis yüzünden kendini unutmuş şehirliler**; "hıh" yüzü yerine şaşkın, sisli gözlü, hafifçe kayıp ifade (kızgın değil). **Saat Kulesi** `piril` Oyuncak Atölyesi'nden uyarlanır (çarklar, müzik kutuları, anahtar, saat kadranı).

## 3. Alanlar (toplam ~11,5 dk)
| # | Alan | Ne var, Feza ne yapar | Süre |
|---|---|---|---|
| 1 | **Sisli Kapı ve Pazar Meydanı** | Sur kapısından girerler. Bilbo burnunu yere dayayıp pati izi gösterir. Çeşme sessiz; simitçi tezgâhının önünde unutmuş. **İlk hatırlatma** (öğretici). | 1,5 |
| 2 | **Nehir ve Taş Köprüler** | Renkli ahşap evler, kanallar. Süpürgeci Sevim yapraklarını süpürmeyi unutmuş. Pırıl kanat rüzgârıyla yoldaki sis perdesini savurur. İkinci hatırlatma + Yaprak Süpürme oyunu. | 1,5 |
| 3 | **Tabela Sokağı (Pazar Tezgâhları)** | İsimsiz dükkân tabelaları. Her hatırlayan dükkân adını geri alır. Simit Yakalama şenlik oyunu. Üçüncü hatırlatma. | 1,5 |
| 4 | **Sur Yolu ve Nöbetçi Kuleleri** | Ponpon uçlu mızraklı Nöbetçi Nuri sersem. Bilbo'ya binip merdivenden çıkılabilir. Bayrak Dikme oyunu: direklere bayrak. Dördüncü hatırlatma. | 1,5 |
| 5 | **Saat Kulesi** | Atölye'den uyarlanmış iç mekân: dönen çarklar, müzik kutuları, dev kurma anahtarı, kadran penceresi. Feza ve Bilbo anahtarı çevirir; **sürpriz**. Kule içinde, giriş duvarında **oyuncak rafı** (Kral ipucu, bkz. 7b). | 2 |
| 6 | **Turnuva Meydanı (arena)** | Boss: Huysuz Şövalye ve atı. | 3 |
| Yan A | **Tellal'in Çatı Terası** | Davul ritmi oyunu (tellal davulu hatırlar), gizli sandık. | +0,5 |
| Yan B | **Gizli Kanal Bahçesi** | Sur diplerinde saklı küçük bahçe, altın simit, çıkartma. | +0,5 |

## 4. Bölüme özgü ana mekanik — "Hatırlatma"
**Kural (çocuk için adım adım):** Her şehirlinin başının üstünde **resimli küçük bir düşünce balonu** var: soru işareti yerine onun unuttuğu şeyin siluet resmi (simit, süpürge, davul, mızrak, ekmek...). Sokakta o şeye ait **parlak bir eşya** durur (simit tepsisi, süpürge, davul tokmakları, nöbet ponponu...). Feza eşyayı alıp şehirliye götürür. Bilbo, **sıradaki** şehirliye giden pati izini yerde gösterir (eşyaları bulmaz — yalnız hedef kişiyi gösterir; top bulma mekaniği yok).
**Hatırlayınca (tek net efekt):** şehirlinin rengi geri gelir ("renk dalgası" yalnız kendi üstünde, ekran taşmaz), adını söyler ("Ben Simitçi Selim!"), işine döner (simit satar, süpürür, davul çalar). Üstündeki balon kalbe dönüşür. Dükkân tabelası resimli olur.
**İlerleme:** sağ üstte kule simgesi **5 noktalı** (kadran gibi); her hatırlayanla bir nokta altına döner. 5 nokta dolunca kule kapısı açılır. Yanlış yok: yanlış eşyayı verirsen şehirli "Hımm bu değil" der gülümseyerek (sadece ışıklı doğru eşya zaten parlak, yanlış seçim zaten olmaz).
**Şenlik oyunları (isteğe bağlı kıkırdama; her biri bir hatırlatmayı tamamlar):** Yaprak Süpürme (süpürge ile yaprakları rüzgâra savur), Simit Yakalama (simit tepsisine yakala), Bayrak Dikme (renkli bayrağı direğe sürükle), Davul Ritmi (yan: halkaya dokun).
Huysuz neşelendirme kalıbı: **yoktur** — hatırlama vuruş değil, yardım ve oyun; yalnız alan 4 ve arenada 1–2 "sersem" nöbetçi (bkz. 6).
**Kule mekaniği:** kuleye bir de **Kule Çarkı** eklenir; her hatırlayanın ardından kulede tek bir çark tık diye döner (sesli, tek efekt).

## 5. Sürpriz an
**Kule çanı ve tek sis dalgası.** Feza ve Bilbo kurma anahtarını çevirip kuleyi kurunca saat 12'yi vurur: **tek, büyük bir çan sesi** ve kuleden **tek bir yumuşak sis dalgası** kaldırımlardan dışarı doğru akıp gider; geçtiği yerde sokaklar renklenir, fenerler yanar, tüm şehirliler birden döner ve el sallar. Başka efekt yok (halka tek, iç içe değil; kısa, 1,5 sn). Pırıl: "Hatırladılar!"

## 6. Düşmanlar (huysuzlar = unutmuş şehirliler)
- **Unutmuş Nöbetçi** (kaynak nobetci, 05_enemies ~97): ponpon uçlu tahta mızrak, hafif uzatıp itme. Havlama sersemletir.
- **Unutmuş Simitçi** (simitci ~98): tepsiden simit fırlatır (uzak); simit yere düşünce yeşil yoldan kaçılır.
- **Unutmuş Süpürgeci** (supurgeci ~99): süpürgeyle kayarak gelir (kayan; şeritte yön izi).
- **Unutmuş Tellal** (tellal ~100, tek elit): davul "güm" diye halka yapar. Davulunu hatırlayınca sakinleşir.
- **Yeni 1 — Sis Çocuğu:** küçük sis topu, 4 yaşında gibi; yaklaşınca gizlice arkana geçer ve "bu ben miyim?" diye ayna gibi taklit eder; zarar vermez, yavaş vurunca kıkırdayıp kaybolur.
- **Yeni 2 — Susmuş Kuş:** gri kuş, öterken ses çıkmıyor; hatırlayınca (Feza ıslık çalar/dokunur) renklenir ve şarkı söyler. Süs değil, **hatırlatma alanı 3'ün dekor oyunu**.
- Tüm "vuruş" etkileşimleri hafif; düşman sayısı az; bölümün ana işi hatırlatma.

## 7. Mini oyun ve gizli şeyler
- Dört şenlik oyunu (bkz. 4): Yaprak Süpürme (alan 2), Simit Yakalama (alan 3), Bayrak Dikme (alan 4), Davul Ritmi (yan A).
- **Gizli 1:** Tellal'in Çatı Terası — davul ritmini tutturunca sandık açılır (çıkartma + ponponlu miğfer).
- **Gizli 2:** Gizli Kanal Bahçesi — altın simit (nadir), çıkartma.
- **Gizli 3:** Çeşmenin dibi — Feza çeşmeye dokunup sırayla üç kez "su" der (Pırıl), çeşmeden küçük kurbağa/ördek lastik oyuncak fırlar (kıkırdama, ödül yok).
- **Gizli 4 (isteğe bağlı, eski):** rafta ayrıca Atölye'deki Tahta Askercik minik hâliyle durur (dokununca kıkırdar, ödül yok). Raf artık gizli değildir; bkz. 7b.

## 7b. Sezdirme: oyuncak rafında kırık taç (Unutulan Kral'a ikinci ipucu; PLAN karar 17)
- **Alan:** Saat Kulesi içi (alan 5), kapıdan girince solda alçak ahşap **unutulmuş oyuncak rafı** (zorunlu yolda, gözün önünde; oynanış yok).
- **Görsel:** tozlu rafta birkaç eski oyuncak (tahta at, davul, bez bebek) ve **en önde küçük, kırık bir taç** (bir köşesi kopmuş, mat altın; 6. bölümdeki duvar resminin yarım tacıyla aynı biçim). **Ad, yazı yok.** Efekt yok (parıltı, halka yok); mor yok.
- **Pırıl (tek cümle):** rafa bakar: "Bu kimin tacı acaba? Kırılmış." Feza ve Bilbo anahtara geçer; cevap verilmez. Dokunmak isteğe bağlı: dokununca taç yerinde durur (alınmaz; envantere girmez).
- **Çelişki yok:** 9. bölümde Kral yalnız gölge, 10'da ad (Tonton); Şövalye'nin "unutmuş nöbetçi" teması ayrıca Kral'a gönderme yapmaz (karar 17 yalnız bu iki ipucunu söyler).
- **Anahtarlar:** `b08_raf` (A), `b08_raf_p` (P).

## 8. Boss — Huysuz Şövalye ve atı
**Görünüş:** parlak gümüş zırhlı, ponponlu miğferli, iri gözlü, yuvarlak hatlı (kaynak `buildSovalye` ~4887). Atı kocaman, tombul, kuyruğu ponponlu. **Kimliği:** şehrin en eski nöbetçisi, **Şövalye Yiğit**; adını ve atının adını (**Pamuk**) unutmuş, "hıh" diyen suratsız bir turnuvacı. Unutulan Kral'ın sisinin etkisini bir yanıyla temsil eder; neşelenince adını hatırlar (8'in hatırlama temasıyla kapanır).
**Aşamalar:** 1: %100–66 · 2: %66–33 · 3: %33–0.
| Saldırı | Aşama | Yerdeki işaret (≥2 sn) | Uyarı cümlesi | Kaçış |
|---|---|---|---|---|
| **Dörtnala** (Berserker Charge) | 1: tek hat · 3: artı (iki hat) | **mavi şerit(ler)** meydanın kenarından kenarına | "Mavi şerit! At buradan koşacak, yana çık!" | Şeridin dışına çık. |
| **Şahlanma** | 1,2,3 | **turuncu halka** atın etrafında | "Turuncu halka! At şaha kalkacak, uzaklaş!" | Halkanın dışına. |
| **At Nalı** | 2,3 | 3 küçük **sarı daire** | "Sarı daireler! At nalı düşecek, üstünden çekil!" | Dairelerden çık. |
| **Mızrak Savurma** | 2,3 | Şövalye'nin önünde **kırmızı yarım daire** | "Kırmızı alan! Mızrak savruluyor, uzak dur!" | Yakından çık. |
| **Nöbetçi Çağırma** | 3 (tek) | işaret yok (boru sesi) | "Boru çaldı! İki nöbetçi geldi." | Bilbo havlar (otomatik), nöbetçiler sersemler. |
- **Sancaklar oyunu (aşama 1→2, can ≤ %70):** "Sancaklara vur! Üçü de devrilince şövalyenin başı dönecek!" Üç turnuva sancağı (mavi-krem). Hepsi devrilince Şövalye **başı dönerek** oturur (kıkırdama molası ~5 sn, hasar ×1,25).
- **Havuç oyunu (aşama 2→3, can ≤ %40):** meydanın kenarında altın havuç. Feza başının üstüne alıp tutarsa aç at gelir, havucu yer, Şövalye surat asıp bekler (kıkırdama ~5 sn).
- **Kıkırdama molaları:** dörtnala sonrası atın nefes nefese durması (2–3 sn); şahlanma sonrası atın homurdanması.
- **Neşelenince (tek efekt):** Şövalye miğferini çıkarıp sallar, adını hatırlar ("Ben Yiğit!"), at kişner ve dans eder; **tek kalp patlaması**, sonra **tek ışık topu** Pırıl'a uçar. Meydandaki bayraklar renklenir (bayrak dalgası ayrıca yok; kalp ve top yeter).
- **Saldırı sayısı:** 5 (3'ü ilk aşamada yok → yumuşak giriş).

## 9. Eşlik eden karakterler
- **Pırıl:** alan 2'de **kanat rüzgârıyla** (6. bölümde geri aldığı güç) sis perdelerini savurur (tek rüzgâr, Feza yaklaşınca **otomatik**), köpük kalkanı otomatik savunma (Feza canı < %50, bekleme 20 sn). Pırıl 7'den sonra daha yumuşak ve minnettar: "Beni sen taşıdın, ben de seni taşırım."
- **Bilbo:** başından beri Feza'nın yanında; **pati izi yolu** gösterir (yalnız sıradaki hedefe kadar, tek iz). Feza isterse dokunup **Bilbo'ya biner** (hızlı geçiş, köprüler ve sur yolu; **yalnız oyuncu başlatır**, istediği an iner). **Otomatik havlama:** Feza zor durumdayken (can < %50) ya da çok düşman yakınındayken kendiliğinden havlar; havlama düşmanları **sersemletir, zarar vermez**; bekleme 20 sn. Bilbo'nun "şaka" hâli: simitçinin düşen simidini yer (kıkırdama), Şövalye'nin atına koklar.
- Baba, Kartal, Hala yok.

## 10. Ödüller
- **Işık parçası 8.** Pırıl'ın yeni gücü yok (kanat rüzgârı bölüm içinde kullanılır; kalp tozu 9'da).
- **Envanter:** *Turnuva Kılıcı* (gümüş-mavi), *Şövalye Arma Pelerini* (güneşli şehir arması), *Ponponlu Miğfer*, **Bilbo'nun şövalye bandanası** (Bilbo'ya aksesuar).
- **Albüm:** "Şehir Dostları" çıkartması (5 şehirlinin yüzleri).

## 11. Anlatıcı ve Pırıl cümleleri (anahtar: `b08_...`)
1. `b08_giris` — Surlu Şehir! Ama çok sessiz. Sis her yeri sarmış.
2. `b08_pirilgiris` — Feza, insanlar renkli değil. Sanki herkes bir şeyi unutmuş.
3. `b08_bilbo` — Bilbo burnunu yere dayadı. Küçük pati izlerini takip edelim!
4. `b08_simitci` — Simitçi bir şeyi unutmuş. Tepsisini bulalım!
5. `b08_hatirla1` — Simitçi Selim hatırladı! Rengi geri geldi.
6. `b08_kule` — Bak, saat kulesi durmuş. Her hatırlayan, bir çarkı çalıştırıyor.
7. `b08_nehir` — Nehir ve taş köprüler! Süpürgeci yapraklarını unutmuş.
8. `b08_supurge` — Süpürgeyi ver, birlikte yaprakları süpürelim.
9. `b08_pirilruzgar` — Sis perdesi! Dur, ben kanatlarımla üflerim.
10. `b08_tabela` — Dükkânların tabelası boş. Adlarını geri getirelim!
11. `b08_simityakala` — Simitleri yakala! Tepsiyi uzat.
12. `b08_susmusKus` — Susmuş bir kuş! Şarkısını hatırlasın.
13. `b08_sur` — Surlar ve kuleler! Nöbetçi şaşkın, sersem sersem bakıyor.
14. `b08_bayrak` — Bayrakları direklere dik. Şehir renklensin!
15. `b08_bilbobin` — İstersen Bilbo'ya binebilirsin. Hadi, Bilbo hızlı koşar!
16. `b08_havla` — Bilbo havladı! Nöbetçiler sersemledi, ama zarar görmediler.
17. `b08_nobetci` — Nöbetçi Nuri hatırladı! Ponponunu salladı.
18. `b08_kulegir` — Beş kişi hatırladı! Kule kapısı açıldı.
19. `b08_kuleici` — Kulenin içi çarklarla dolu. Müzik kutuları çalıyor.
20. `b08_anahtar` — Dev anahtarı birlikte çevirelim. Feza ve Bilbo, bir, iki, üç!
21. `b08_can` — Saat on ikiyi vurdu! Şehir uyandı.
22. `b08_pirilhatirladi` — Hatırladılar! Bak, herkes el sallıyor.
23. `b08_arena` — Turnuva Meydanı! Ortada kocaman bir at ve bir şövalye.
24. `b08_sovalye_giris` — Huysuz Şövalye! Önce yolunu gösteriyor, kenara çek.
25. `b08_ipucu_kosu` — Mavi şerit! At buradan koşacak, yana çık.
26. `b08_ipucu_sah` — Turuncu halka! At şaha kalkacak, uzaklaş.
27. `b08_ipucu_nal` — Sarı daireler! At nalı düşecek, üstünden çekil.
28. `b08_ipucu_mizrak` — Kırmızı alan! Mızrak savruluyor, uzak dur.
29. `b08_boru` — Boru çaldı! İki nöbetçi geldi.
30. `b08_sancak` — Sancaklara vur! Üçü de devrilince şövalyenin başı dönecek.
31. `b08_havuc` — Bak bak, bir havuç! Havucu al, at gelince onu besle.
32. `b08_atdoydu` — At havucu çok sevdi! Şövalye bekliyor, hadi vur.
33. `b08_yarim` — Şövalye yoruldu. Az kaldı Feza!
34. `b08_bitti` — Şövalye adını hatırladı: Yiğit! Atının adı Pamuk!
35. `b08_isik` — Işık Pırıl'a uçuyor. Pırıl'ın kanatları parlıyor.
36. `b08_son` — Bayraklar gökkuşağı oldu. Yol uzaktaki kaleye çıkıyor.
37. `b08_pirilkale` — O kaleye bakınca içim ısınıyor. Sanki beni bekliyor.
38. `b08_raf` — Kulenin içinde unutulmuş oyuncaklar duruyor. En önde küçük, kırık bir taç var.
39. `b08_raf_p` — Bu kimin tacı acaba? Kırılmış.

(İngilizce kelime yok, "Aa/Oo" yok.)

## 12. Müzik/ses
- **Başlangıç:** çok yavaş, tek müzik kutusu ezgisi + uzaktan rüzgâr; kaynak (`02_audio.js` sehir ~883) çalgıları: blok flüt, lavta, davul. Her hatırlayanla **bir çalgı katmanı** eklenir (flüt → lavta → davul → akordeon).
- **Kule:** tik-tak, çark sesleri, tek çan. Sis dalgasında müzik tam hâle gelir.
- **Boss:** turnuva fanfarı, davul + trompet (yumuşak), at nalı tıkırtısı.

## 13. Çocuk için risk ve sadelik
- **Hatırlatma karışabilir:** çok eşya, çok şehirli olursa kaybolur. Çözüm: bir seferde yalnız bir şehirli ve onun eşyası parlak; diğerlerinin balonları sönük. Bilbo'nun pati izi tek.
- Gri-renkli geçişte zemin renklenmesi çok küçük alanlı, ekran akın etmez; "renk dalgası" tek.
- Sis tabakası okunurluğu bozmasın: sis hep alçak ve seyrek; yürünür alan açık; kameranın önünü kapatmaz.
- Bilbo'ya binme isteğe bağlı: düğme çok belirgin ama "binmezsen de olur"; binme ilk iki kez Pırıl söyler, sonra sessiz.
- Boss uyarıları: renk-şekil ses ile birebir; aynı anda en fazla bir işaret (Dörtnala + Şahlanma üst üste gelmez).
- Karanlıktan sonra umut: bölüm başında kısık, her hatırlayanla artan renk ve müzik; kimse ağlamaz/üzülmez.

## 14. Teknik taşıma notu
- **Kaynak:** `huysuz/src/06_level.js` (ZONES sehir satır 22; zemin town ~1728, `townData` ~831, nehir/kanal ~5606, banner ~3047), `05_enemies.js` (EDEF nobetci/simitci/supurgeci/tellal/sovalye ~93–110; build/anim ~4000–5600; sancak ~4653), `07_game.js` (SOV ~3138, `sovalyeStep` ~3176; sancakPool ~2436; BONUS.havuc ~3339; havucFeed ~3280), `02_audio.js` (sehir müziği ~883, satır ~1417 ve 1458–1462).
- **Saat Kulesi için kaynak:** `feza-bilbo/piril/src/06z_atolye.js` (çarklar ~819–840, çark düğmesi ~858, tren ~870, müzik kutuları ~885, saat kadranı pencereleri ~909, çıkış saat kulesi kapısı ~934, anim ~949–1062), `05z_atolye.js` (Tahta Askercik, Kurmalı Ayıcık anahtar animasyonu ~9, 806), `02l_atolye.js` (çark/müzik kutusu cümle desenleri).
- **Yeniden yazılacak:** Şövalye + at + sancak + havuç + şehir zemini → `05z_sehir.js`/`06z_sehir.js` olarak piril motoruna; nöbetçi/simitçi/süpürgeci/tellal "sis" versiyonları (gri→renk geçişi için materyal parametresi).
- **Yeni yazılacak:** Hatırlatma sistemi (şehirli durumu: unutmuş→hatırlamış; balon+eşya+ilerleme sayacı), tabela dokusu değişimi, Kule iç mekânı (Atölye'den uyarlama), kurma anahtarı etkileşimi (Feza+Bilbo), tek sis dalgası, 4 şenlik oyunu (08m MINIGAME çerçevesi), Bilbo pati izi (tek çizgi/iz sistemi), Bilbo'ya binme.
- **Kritik uyarı:** `piril` motorunda `BILBO = PIRIL` **takma adı** var (motor eski Bilbo adlarını Pırıl'a bağlıyor). Bu bölümde (ve 5,9,10'da) **hem Pırıl hem Bilbo** aynı anda var; CORE'un takma adı kaldırıp iki yoldaş sistemini ayırması gerekir (PIRIL_TAKIP + BILBO_FOLLOW ayrı). Bilbo havlaması/biniş `huysuz/src/04_bilbo*.js` + `bilbo-ses.js` kaynak.
- **Gereken motor özelliği:** bölümde bölge-bölgeye renk geri kazanma (zemin/ışık parametresinin hatırlayan sayısına bağlı), tek karede kısa sis dalgası, Pırıl'ın kanat rüzgârı otomatik tetiği.
- **Zorluk:** Yüksek (hatırlatma sistemi + kule iç mekânı + Bilbo/Pırıl birlikte).

## 15. Açık sorular
1. (Kalan küçük soru; önerim: adlar kalsın) Şövalyeye **Yiğit**, ata **Pamuk** adları uygun mu? Şehirlilerin diğer adları (Selim, Sevim, Nuri, Tahir) sizin aileden ya da arkadaşlardan biriyle değiştirilebilir mi?
2. ~~Şövalye'nin teması Kral'a ipucu olsun mu?~~ **KARARLAŞTI (PLAN karar 17):** Şövalye'de ayrıca söylenmez; Kral ipucu yalnız kulede rafta kırık taçtır.
3. (Kalan küçük soru; önerim: ikisi de, arenada kapalı) Bilbo'ya binme hızlı seyahat için mi (köprü ve sur yolu), yoksa yalnız eğlence için mi (Bilbo ile sokakta dolaşma)? Boss arenasında binme kapalı olsun mu?
