/* ── Pırıl'ın oyun içi cümleleri (pp_: aynı Emel sesi, biraz daha ince ve neşeli) ──
   Kullananlar: 04_piril_guc.js / 04_piril_takip.js (PIRIL3D), 07_game.js (CORE). Hepsi kısa; övgüler ARA SIRA ve rastgele seçilir
   (aynısı art arda gelmesin; en az ~20 s ara). Bağlantı listesi: scratchpad pr/istek/SES_HERKES.md. */
if (typeof AUD !== 'undefined' && AUD && AUD.LINES) Object.assign(AUD.LINES, {
  // ── kısa sevinç / şaşkınlık (ara sıra) ──

  // ── övgü (huysuz neşelenince ARA SIRA; her seferinde değil) ──
  pp_ovgu_1: 'Aferin sana!',
  pp_ovgu_2: 'Süpersin Feza!',
  pp_ovgu_3: 'Çok güzel gidiyorsun!',
  pp_ovgu_4: 'İşte böyle!',
  pp_ovgu_5: 'Harikasın!',
  pp_ovgu_6: 'Ne kadar da cesursun!',
  pp_ovgu_9: 'Birlikte çok iyiyiz!',

  // ── yol gösterme / kapı ipuçları (Pırıl uçup gösterir) ──
  pp_yon_1: 'Pırıl kanat çırptı. Bu tarafa, hadi!',
  pp_yon_2: 'Pırıl yolu gösteriyor. Şu tarafa uçalım!',
  pp_yon_3: 'Pırıl önden süzüldü. Yol şurada!',

  // ── yetenekler: kullanırken (çok seyrek; yeni açılınca hikâyedeki pp_guc_n söylenir) ──
  pp_nefes_1: 'Pırıl, ışıktan bir nefes üfledi.',
  pp_kalkan_1: 'Pırıl, köpükten bir kalkan yaptı.',
  pp_ruzgar_1: 'Pırıl, kanatlarıyla tatlı bir rüzgâr estirdi.',
  pp_kalptozu_1: 'Pırıl, minik kalp tozları serpti.',

  // ── Takım Hamlesi (eski Hala takım hamlesi; PIRIL_GUC.teamMove) ──
  pp_takim_hazir: 'Takım hamlesi hazır! Parlayan düğmeye bas.',

  // ── Feza'nın canı azalınca / yorulup düşünce (onFezaLow / onFezaDown) ──
  pp_can_az: 'Feza biraz yoruldu. Pırıl yanına süzüldü.',
  pp_saril_1: 'Pırıl, Feza\'yı kanatlarıyla sardı.',
  pp_kalkti_1: 'Feza yine dimdik ayakta!',

  // ── boss savaşı sırasında (giriş anlatıcıdan sonra, ara sıra) ──
  pp_boss_1: 'Pırıl da yardım ediyor. Hadi Feza!',
  // (CORE, ebeveyn isteği: yuva yok — mola bitince otomatik geçiş)
  pp_siradaki: 'Sıradaki ışığa uçalım!',
});

/* ── Bilbo'ya binme (Pırıl söyler) ve ek övgüler. Baba, Kartal ve Hala KONUŞMAZ: onların cümlesi yok. ── */
if (typeof AUD !== 'undefined' && AUD && AUD.LINES) Object.assign(AUD.LINES, {
  bilbo_bin: 'Hop! Bilbo, Feza\'yı sırtına aldı.',
});
