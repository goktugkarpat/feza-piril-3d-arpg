# MOTOR_API — MOTOR2 eklentileri (bölüm ve yoldaş ajanları için)
Hepsi `file://` ve `?sessiz` ile çalışır. Kod: 03_fx.js (FXQ), 00_core.js (COMPANION, YOLDAS_TANIM), 05c (boss), 07_game.js (zıplama, nesne, yoldaş, sinematik, renk), 06a (alan geçişi).

## 1. Efekt kuyruğu: `FXQ` (03_fx.js)
Aynı anda en çok **1 büyük efekt + 1 büyük yazı**; ikincisi sırada bekler (en çok 4; aynı `id` eskisinin yerine geçer). Mevcut FX.burst/bloom sınırlayıcıları aynen çalışır; FXQ yalnız BÜYÜK olanlar için.
- `FXQ.efekt(fn, süreSn, {id, oncelik})` · `FXQ.yazi(fn, süreSn, {id, oncelik})` → true: hemen başladı, false: sırada.
- **Sıralı sahne efekti**: `FXQ.sira([{tur:'efekt'|'yazi', fn, sure, bosluk}], {bitti})` — her adımdan sonra `bosluk` s (varsayılan 1) beklenir.
  Örnek (anne ejderha tanıma): `FXQ.sira([{tur:'efekt', sure:1.6, bosluk:1.2, fn: kabukParlasin}, {tur:'efekt', sure:2.4, fn: ()=>GAME.renkGecisi(ejderha.root,{to:'#9b6cff'})}])`
  ya da hazır: `GAME.ejderhaDonus(root, {kabuk: fn, bekle: 1.2, to: '#9b6cff', sure: 2.4, bitti})` (kabuk parlaması → ≥1 sn → tek yumuşak renk dönüşü).
- `GAME.renkGecisi(root, {to, sure=2.4, guc=.85, bitti})` — her malzeme kendi tonunu koruyarak hedefe kayar (gri-inci → mor).
- Bölüm değişince kuyruk temizlenir.

## 2. Boss işareti ve cümle (05c): `BOSSDAV`
- İşaret **en az 2 sn** (`BOSSDAV.TELE_MIN`): `BOSSDAV.tele/teleLine/drop` süreyi en az 2 s yapar (drop'ta iniş zamanı da 2 s'ye çıkar). Kendi `A.fx('telegraph')` çağırıyorsan süreyi ≥2 ver.
- **Hamle ipucu (`hints`) ve aşama cümlesi işaretle AYNI ANDA** ve yüksek öncelikle (5) söylenir: hamle ilk kez gelince cümle beklemeye alınır, ilk `tele/teleLine/drop` çağrısında (ya da en geç 0,9 s sonra) çalar. `BOSSDAV.flushPend()` ile elle de tetiklenir.
- `BOSSDAV.register(id, {...})` yeni alanlar:
  - `asamalar: [0.66, 0.33]` can eşikleri (varsayılan bu): `S.stage` 1..3 (`choose(b,S,d)` içinde hamleyi aşamaya göre seç).
  - `kikirdama: 1.8` aşama değişince boss'un zararsız kıkırdama molası (sn; 0 = yok; faz adı `'kikir'`).
  - `asamaSoz: { 2: 'pr_x_asama2', 3: 'pr_x_asama3' }` o aşamanın ilk hamlesinde, o hamlenin işaretiyle birlikte söylenir.
  - `isaretKendi`, `hit`, `update`, `hints` (eskisi gibi). `BOSSDAV.interrupt(b)` hamle nesnelerini temizler.

## 3. Eşlikçi yardım: `COMPANION` (00_core.js)
```js
COMPANION.register({ id:'baba', ad:'Baba', bekleme:25, ilkBekleme:4, sure:2.5, sonrasi:6,   // sonrasi: bu yardımdan sonra BAŞKA yardım için en az bekleme
  esik:0.5, dusman:4, menzil:7, tetik:'ikisi'|'can'|'kalabalik'|'her'|fn({canOrani,yakinDusman,bolum}),
  bolumler:['orman'], etkin(){}, kosul(c){}, eylem(c){ ...; return true } });   // false/0 dönerse yapılamadı: bekleme başlamaz
COMPANION.register('baba', BABA.kayit);   // YOLDAS biçimi (canEsik/hazir/b5/b9) de olur; b5=magara, b9=kale+fener, b6/b8 de var, ya da bolumAyar:{id:{bekleme,canEsik}}
```
- Tetik: Feza canı < `esik` (varsayılan %50) VEYA yakında ≥ `dusman` (4) uyanık düşman. Her yardımın kendi beklemesi; **aynı anda tek yardım** (`sure` boyunca başkası başlamaz, sıra kuyruğu en çok 3, tetik hâlâ geçerliyse çalışır). Baba–Kartal ≥6 sn (sonrasi).
- `eylem(c)`: `c.yakin` (düşmanlar), `c.can`, `c.tetik`, `c.api`: ZARARSIZ araçlar `sersemlet(e|dizi, sn)`, `it(e|dizi, x, z, güç)`, `iyilestir(oran)`, `kalkan(sn)`, `burst`, `fx`, `sfx`, `say`, `ftext`, `emit`. Boss'ta yalnız boşta/hamle sırasında 1,5 sn sersemler. Hasar verilmez.
- Hazır kayıtlar (07): `bilbo` (havlama, 20 sn), `piril_koruma` (eski halka+sersemletme; Pırıl'ın köpük kalkanı/ışık nefesi kaydolunca `COMPANION.ac('piril_koruma', false)`).
- `COMPANION.zorla(id)` (dokunarak çağırma / test), `COMPANION.durum()`, `COMPANION.sira`, `COMPANION.log`. Olay: `GAME.on('yardim', {id})`.

## 4. Yoldaşlar: Pırıl + Bilbo (07)
Pırıl ana yoldaş (`PIRIL`, `PIRIL_TAKIP`, `PIRIL_GUC`; `BILBO=PIRIL` takma adı kalktı). Bölüm tanımına `yoldas: ['bilbo']` yaz → Bilbo (YOLDAS'ın `BILBO.kur`) o bölümde sahnede (Pırıl sağda, Bilbo solda, birbirinin üstüne binmez). `GAME.yoldas.ac('bilbo', true|false)` elle.
- `GAME.bilboHavla()` (sersemletir, zarar yok) — otomatik: COMPANION 'bilbo'. `GAME.bilboBin(true|false)` ya da `GAME.rideButton()` (Bilbo açıkken toggle): biner/iner, binmişken hız ×1,25, 12 sn sonra kendiliğinden iner, 20 sn bekleme. Yalnız düğmeyle.
- Başka yoldaş: `yoldasTanimla(id, {create, takip:{create(env)}, olcek, sirtY, ...})` (00_core.js).

## 5. Zıplama ve yüzeyler (07)
- Bölüm bayrağı: `lowGravity: true` (≈3 m yükseklik, ≈1,6 s havada; yoksa küçük hop). Zıp düğmesi (sol alt, yıldız) + klavye **Z** + `GAME.zip()`. Kenara/basamağa yaklaşırken **otomatik zıplama yardımı** (hedef yüzeye yönlendirir; `otoZipla:false` ile kapat), yürüyerek kenardan düşülmez (`kenarKoru:false` ile açılır). Havada yer saldırıları değmez. Havada kollar yukarı.
- Yüzeyler (bölümün `kur()`/`yerlesim` içinde `L.yuzeyler = [...]` ya da `GAME.yuzey.ekle(s)`): `{ id, x, z, w, d | r, top (yüzey yüksekliği m), thick:.6, on:true, mesh?, meshDy? }`. `s.x/z/top` bölüm tarafından her kare değiştirilebilir (kayan basamak; üstündeki Feza taşınır). `on:false` → gizli; `GAME.yuzey.goster(id)` (yumuşak büyür, olay `basamak`).
- Düşünce **bulut yastığı**: bir alttaki yüzeye (yoksa zemine) yumuşak bırakır, can kaybı yok; olay `dusme {x,z,top,id}`; `indi`, `zip` olayları. `GAME.jump` = { on, y, air, lowG, rescued… } (Feza'nın ayak yüksekliği `GAME.jump.y`; 3B model yükselir, `P.pos.y` 0 kalır).
- Rün taşı: `L.nesneler = [{ tur:'dugme', id, x, z, r:.7, ac:['b1'], tekrar? }]` basınca bağlı basamaklar görünür.

## 6. Nesneler ve taşıma (07)
`L.nesneler` (ya da `GAME.nesne.ekle(o)`): ortak alanlar `{ id, tur, x, z, r (erişim), y, mesh }`.
- `tur:'tasinir'` (kova, yumurta): yaklaşınca (ya da dokununca; `elle:true` yalnız dokunuş) kucaklanır (önünde `kucakY`), yürürken biraz yavaşlar; `GAME.nesne.birak()`; hedef alan `GAME.nesne.hedef({id,x,z,r,y,kabul(o)})` ya da `L.hedefler`: nesne hedefe girince oturur (`yerlesik`), olay `yerlesti {id, hedef}`; `o.kabulId` yanlış hedefe oturmaz; yanlışta hiçbir şey olmaz (düşme/kırılma yok). Geri çağrılar: `aldi`, `yerlesti`.
- `tur:'cevrilir'` (ayna, fener): yaklaşınca ya da dokununca sonraki açıya döner (`acilar:[...]`, `durum`), `degisti(o, durum)`; olay `nesne {id, olay:'cevir', durum}`.
- `tur:'dugme'`: basınca `bas(o)`, `ac:[yüzeyler]`, olay `nesne {olay:'bas'}`.
- Diğer: `GAME.nesne.bul(id)`, `.sil(id)`, `.al/.cevir/.bas`.

## 7. Bölüm içi sinematik ve kamera (07; kamera okuması 09_ui'de — MOTOR1 istek dosyası)
`GAME.sinematik.oyna({ adimlar:[{ sure, bak:{x,z,y}, zoom, pitch, yaw, gecis, soz:'anahtar', fn }], atlanabilir:true, bitti(atlandi) })` — Feza kilitli ve zarar görmez, düşmanlar durur, sağ üstte "Geç" düğmesi; `GAME.sinematik.atla()`. Olay `sinematik {on, atlandi}`. Kamera isteği `GAME.kameraIstek` (09_ui okur).

## 8. Taban (zemin) seçenekleri
`taban: 'cave'|'moon'|'volcano'|'town'|'castle'` (castle artık açık). Koyu/parlak tabanlar varsayılan **soluk** (zemin: `{soluk: 0..1}`; 0 = eski görünüm; `speck: 0` parlak benekleri kapatır; `tA/tB/tC/out/macro` renkler eskisi gibi). `lowGravity`, `yoldas`, `kamera` bölüm alanları 06a'dan geçer (`zone.def` içinde de var).

## 9. Zemin notu (güncel)
`taban:'moon'` ve `taban:'mabet'` aynı: eski taş mabet zemini (krem-gri levha + taş yol; ay krateri/ay tozu yok, düz). `castle` zemini artık krem-gri taş (mor değil). Bölümün kendi `zemin:{tA,tB,tC,out,macro}` ve `isik` değerleri bunun üstüne yazar. Baba/Kartal/Hala yardımı: bölüm `COMPANION.register('baba', BABA.kayit)` çağırır (motor yalnız bilbo + piril_koruma kaydeder).
- Pırıl nefes/kalkan: COMPANION `piril_nefes` (20 sn) ve `piril_kalkan` (20 sn, kale/fener 40 sn) kayıtlı; `PIRIL_GUC.motorKuyrugu` artık true: nefes/kalkan otomatiği 04_piril_guc.js içinde kapatıldı, yalnız COMPANION kuyruğundan çalışır. `L.finaleBekle()` true iken kristal kazanma töreni (victory) bekler. "Yeni Yetenek" bandı: `GAME.on("yeniGuc",{n,ad,icon,color})`.
- Zıplama yalnız `lowGravity`/yüzey/`zipla` olan bölümlerde açık (`GAME.jump.on`).

## 10. Denge ve kurallar (tek mod)
- Aşama kuralı: boss aşaması YALNIZ `S.stage`/`S.nextStage` ile değişir (05c motoru); bölüm kodu kendi `S.pending` aşamasını tutmasın (hasarı 0 yapıp boss'u dokunulmaz bırakır). `hit()` boss süzgeci `BOSSDAV.register({hit})` kayıtlı bossta yalnız `amount` döndürmeli. Test: 10 bossun 8'i gerçek saldırıyla (`GAME.input.attack()`) bitti: mantar, mercan, orman, kale, değirmen, mabet ok; magara/yanardağ/şehir/fener bu turda ölçülemedi (yükleme).
- Yıldız ekonomisi: her yükseltme 1 yıldız; toplam 6; yalnız bölüm 1,3,4,6,8,9 bossu ilk kez (HIS.addStarCandy(…,'boss')). Detay `_calisma/ekonomi_yildiz.md`.
- Zorluk: `MOB_HIT_K 3.4`, `BOSS_HIT_K 6.5 (×(1+0.06·bölüm))`, vuruş tavanı %36 can. `_calisma/denge.md`.
