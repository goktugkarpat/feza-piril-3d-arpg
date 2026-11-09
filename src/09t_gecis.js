/* ── Bölüm geçişi: sinematik yolculuk (GECIS) ──
   Tam ekran boyalı tuval sahnesi: solda önceki diyarın, sağda sonraki diyarın silüeti; aralarında ışıklı gece denizi,
   bulutlar, yıldızlar, ışık tozu, parlayan yol; Feza ile Pırıl bölüme özgü araçta (yaprak/kabarcık/kartal/kırıntı/vagon/ışık/kanat);
   Pırıl'ın ışık izi; hedef ada yükselip yanar; uzakta Büyük Fener'in ışığı döner (bölümler ilerledikçe parlar).
   Kullanım: GECIS.start(kapsayici, { from, to, arac, feza, piril, sure }) → { stop }   ·   GECIS.stop()
   from/to = BOLUM.diyar(id) çıktısı (id, no, renk, simge). Bölüm başına veri: aşağıdaki TEMA tablosu. */
const GECIS = (() => {
  'use strict';
  const TEMA = {   // sil: silüet türü; ust/alt: gökyüzü renkleri; isik: parıltı rengi; renk: ada yanınca silüetin kendi rengi (mor yok: yalnız Pırıl'ın)
    mantar:   { sil: 'mantar',  ust: '#0c1f4a', alt: '#2f6f86', isik: '#ff9cc4', deniz: '#12485c', renk: '#f07aa6' },
    mercan:   { sil: 'mercan',  ust: '#08324f', alt: '#2fa6bd', isik: '#6fdcff', deniz: '#0f6f8a', renk: '#ff8f7e' },
    orman:    { sil: 'orman',   ust: '#0d2a2a', alt: '#4f8a62', isik: '#ffe08a', deniz: '#1c4a44', renk: '#4fae64' },
    degirmen: { sil: 'degirmen', ust: '#22284e', alt: '#d49a5a', isik: '#ffd67a', deniz: '#4a4a62', renk: '#e8b46a' },
    magara:   { sil: 'magara',  ust: '#0b1736', alt: '#3d6296', isik: '#8fd8ff', deniz: '#1a3358', renk: '#78b4f0' },
    mabet:    { sil: 'mabet',   ust: '#0a1840', alt: '#5072c6', isik: '#bcd2ff', deniz: '#1b3470', renk: '#d6e0f6' },
    yanardag: { sil: 'yanardag', ust: '#2a1216', alt: '#c0583c', isik: '#ff9a50', deniz: '#4a2428', renk: '#a8604a' },
    sehir:    { sil: 'sehir',   ust: '#232a4c', alt: '#e0a27c', isik: '#ffd9a0', deniz: '#46506e', renk: '#ecc89a' },
    kale:     { sil: 'kale',    ust: '#2a2a4a', alt: '#e88ea4', isik: '#ffc2b0', deniz: '#4a4468', renk: '#f4b2c2' },
    fener:    { sil: 'fener',   ust: '#121c48', alt: '#ffe08a', isik: '#fff2b8', deniz: '#2a3a72', renk: '#f6f0e4' },
  };
  const VARSAYILAN = TEMA.mantar;
  let cur = null;

  // ── yardımcılar ──
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rgb = h => { if (h[0] === 'r') return h.match(/\d+/g).slice(0, 3).map(Number); const m = /^#?([0-9a-f]{6})$/i.exec(h) || [0, '888888']; const n = parseInt(m[1], 16); return [n >> 16, n >> 8 & 255, n & 255]; };
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; };
  const rgba = (h, a) => { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
  const sprites = {};
  function glow(color) {   // yumuşak ışık lekesi (önceden çizilmiş)
    if (sprites[color]) return sprites[color];
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, rgba(color, 1)); g.addColorStop(.25, rgba(color, .55)); g.addColorStop(1, rgba(color, 0));
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return sprites[color] = c;
  }
  function spot(ctx, color, x, y, r, a) { ctx.globalAlpha = a; ctx.drawImage(glow(color), x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1; }
  // portre resmi yoksa / henüz yüklenmediyse: sevimli çizim yüz (Feza: ten + kahverengi saç; Pırıl: yeşil boynuzlu mor ejderha)
  function yuzCiz(x, r, piril) {
    const u = r / 40;
    if (piril) {
      x.fillStyle = '#fff6dc'; x.beginPath(); x.arc(0, 0, r, 0, 7); x.fill();
      x.fillStyle = '#9fd65a'; [-1, 1].forEach(d => { x.beginPath(); x.moveTo(d * 14 * u, -18 * u); x.lineTo(d * 22 * u, -36 * u); x.lineTo(d * 26 * u, -14 * u); x.fill(); });
      x.fillStyle = '#b184e2'; x.beginPath(); x.ellipse(0, 4 * u, 30 * u, 26 * u, 0, 0, 7); x.fill();
      x.fillStyle = '#d9c2f6'; x.beginPath(); x.ellipse(0, 14 * u, 15 * u, 10 * u, 0, 0, 7); x.fill();
    } else {
      x.fillStyle = '#dff3ff'; x.beginPath(); x.arc(0, 0, r, 0, 7); x.fill();
      x.fillStyle = '#ffd6aa'; x.beginPath(); x.ellipse(0, 6 * u, 27 * u, 28 * u, 0, 0, 7); x.fill();
      x.fillStyle = '#7a4a2a'; x.beginPath(); x.moveTo(-29 * u, 4 * u); x.bezierCurveTo(-34 * u, -30 * u, 30 * u, -36 * u, 29 * u, 2 * u);
      x.lineTo(20 * u, -10 * u); x.lineTo(10 * u, -4 * u); x.lineTo(2 * u, -12 * u); x.lineTo(-8 * u, -4 * u); x.lineTo(-18 * u, -10 * u); x.closePath(); x.fill();
      x.fillStyle = 'rgba(255,140,150,.45)'; [-1, 1].forEach(d => { x.beginPath(); x.ellipse(d * 15 * u, 14 * u, 5.5 * u, 3.5 * u, 0, 0, 7); x.fill(); });
    }
    x.fillStyle = '#2e2440'; [-1, 1].forEach(d => { x.beginPath(); x.ellipse(d * 9 * u, 4 * u, 3.6 * u, 4.6 * u, 0, 0, 7); x.fill(); });
    x.fillStyle = '#ffffff'; [-1, 1].forEach(d => { x.beginPath(); x.arc(d * 9 * u - 1.2 * u, 2.4 * u, 1.4 * u, 0, 7); x.fill(); });
    x.strokeStyle = piril ? '#6a3f6e' : '#a15b53'; x.lineWidth = 2.6 * u; x.lineCap = 'round';
    x.beginPath(); x.arc(0, 12 * u, 6 * u, .25, Math.PI - .25); x.stroke();
  }

  // ── silüetler: taban (0,0), yukarı -y; ölçek s (~100 birim yükseklik) ──
  // k: silüet rengi, lit: 0..1 yanma, c: parıltı rengi, t: zaman
  const SIL = {
    mantar(x, k, lit, c, t, r, s) {
      for (let i = 0; i < 4; i++) {
        const px = (i - 1.5) * 38 + (r() - .5) * 14, h = 38 + r() * 40, w = 24 + r() * 20;
        x.fillStyle = k; x.beginPath(); x.rect(px - w * .16, -h, w * .32, h); x.fill();
        x.beginPath(); x.ellipse(px, -h, w, w * .62, 0, Math.PI, 0); x.fill();
        for (let j = 0; j < 3; j++) spot(x, c, px + (j - 1) * w * .45, -h - w * .22 - (j % 2) * 4, 9 + 8 * lit, .35 + .65 * lit);
        spot(x, c, px, -h - w * .3, w * 1.5, .12 + .22 * lit);
      }
    },
    mercan(x, k, lit, c, t, r, s) {
      const branch = (px, py, a, len, d) => {
        if (d > 3) { spot(x, c, px, py, 9 + 6 * lit, .4 + .6 * lit); return; }
        const nx = px + Math.sin(a) * len, ny = py - Math.cos(a) * len;
        x.lineWidth = 9 - d * 2; x.strokeStyle = k; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, py); x.lineTo(nx, ny); x.stroke();
        branch(nx, ny, a - .5 - r() * .3, len * .72, d + 1); branch(nx, ny, a + .5 + r() * .3, len * .72, d + 1);
      };
      branch(-30, 0, -.15, 34, 0); branch(14, 0, .25, 42, 0); branch(46, 0, .5, 26, 1);
      x.fillStyle = k; x.beginPath(); x.ellipse(-62, 0, 22, 14, 0, Math.PI, 0); x.fill();
    },
    orman(x, k, lit, c, t, r, s) {
      for (let i = 0; i < 6; i++) {
        const px = (i - 2.5) * 26 + (r() - .5) * 10, h = 60 + r() * 44, w = 20 + r() * 8;
        x.fillStyle = k; for (let j = 0; j < 3; j++) { const y0 = -h * (.12 + j * .26), ww = w * (1.25 - j * .3); x.beginPath(); x.moveTo(px - ww, y0); x.lineTo(px, y0 - h * .46); x.lineTo(px + ww, y0); x.fill(); }
        if (i % 2 === 0) spot(x, c, px, -h * .35, 6 + 6 * lit, .3 + .7 * lit);
      }
    },
    degirmen(x, k, lit, c, t, r, s) {
      x.fillStyle = k; x.beginPath(); x.moveTo(-18, 0); x.lineTo(-11, -74); x.lineTo(11, -74); x.lineTo(18, 0); x.fill();
      x.beginPath(); x.moveTo(-15, -74); x.lineTo(0, -92); x.lineTo(15, -74); x.fill();
      x.save(); x.translate(0, -68); x.rotate(t * .9); x.fillStyle = k;
      for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.fillRect(-3, 0, 6, 54); x.fillRect(3, 20, 14, 30); }
      x.restore(); spot(x, c, 0, -30, 14, .3 + .7 * lit);
      for (let i = 0; i < 16; i++) { const px = -90 + i * 12; x.strokeStyle = k; x.lineWidth = 2; x.beginPath(); x.moveTo(px, 0); x.quadraticCurveTo(px + 4, -14, px + 8 + Math.sin(t * 2 + i) * 2, -26 - (i % 3) * 4); x.stroke(); spot(x, c, px + 8, -26 - (i % 3) * 4, 5, .25 + .5 * lit); }
    },
    magara(x, k, lit, c, t, r, s) {
      for (let i = 0; i < 7; i++) {
        const px = (i - 3) * 22 + (r() - .5) * 8, h = 30 + r() * 62, w = 8 + r() * 8, a = (r() - .5) * .5;
        x.save(); x.translate(px, 0); x.rotate(a); x.fillStyle = k; x.beginPath(); x.moveTo(-w, 0); x.lineTo(-w * .7, -h * .8); x.lineTo(0, -h); x.lineTo(w * .7, -h * .8); x.lineTo(w, 0); x.fill();
        x.fillStyle = rgba(c, .2 + .6 * lit); x.beginPath(); x.moveTo(0, -h); x.lineTo(w * .7, -h * .8); x.lineTo(w * .3, 0); x.lineTo(0, -4); x.fill(); x.restore();
        spot(x, c, px, -h * .7, 18, .12 + .3 * lit);
      }
    },
    mabet(x, k, lit, c, t, r, s) {
      x.fillStyle = k; x.fillRect(-70, -8, 140, 8); x.fillRect(-62, -16, 124, 8);
      for (let i = 0; i < 6; i++) x.fillRect(-52 + i * 20, -68, 8, 52);
      x.fillRect(-60, -76, 120, 8); x.beginPath(); x.moveTo(-64, -76); x.lineTo(0, -108); x.lineTo(64, -76); x.fill();
      spot(x, c, 0, -92, 26, .25 + .75 * lit); spot(x, c, 0, -40, 50, .1 + .3 * lit);
      x.fillStyle = rgba(c, .5 + .5 * lit); x.beginPath(); x.arc(0, -92, 7, 0, 7); x.fill();
    },
    yanardag(x, k, lit, c, t, r, s) {
      x.fillStyle = k; x.beginPath(); x.moveTo(-90, 0); x.lineTo(-24, -88); x.lineTo(-12, -80); x.lineTo(12, -88); x.lineTo(26, -84); x.lineTo(94, 0); x.fill();
      x.strokeStyle = rgba(c, .5 + .5 * lit); x.lineWidth = 3; x.lineCap = 'round';
      x.beginPath(); x.moveTo(-4, -84); x.quadraticCurveTo(-14, -50, -30, -18); x.moveTo(8, -84); x.quadraticCurveTo(24, -52, 18, -14); x.stroke();
      spot(x, c, 0, -92, 46 + Math.sin(t * 3) * 4, .4 + .6 * lit);
      for (let i = 0; i < 5; i++) { const ph = (t * .6 + i * .2) % 1; spot(x, c, (i - 2) * 9 + Math.sin(ph * 6 + i) * 6, -90 - ph * 70, 5, (1 - ph) * .9 * (.4 + .6 * lit)); }
    },
    sehir(x, k, lit, c, t, r, s) {
      const kule = (px, w, h) => {
        x.fillStyle = k; x.fillRect(px, -h, w, h);
        for (let j = 0; j < Math.floor(h / 16); j++) if ((j + Math.floor(px)) % 2 === 0) { x.fillStyle = rgba(c, .15 + .85 * lit); x.fillRect(px + w * .3, -h + 8 + j * 16, w * .22, 7); }
      };
      kule(-80, 26, 50); kule(-50, 22, 70); kule(-24, 30, 58); kule(10, 22, 96); kule(36, 30, 62); kule(70, 22, 46);
      x.fillStyle = k; x.beginPath(); x.moveTo(8, -96); x.lineTo(21, -122); x.lineTo(34, -96); x.fill();
      spot(x, c, 21, -80, 40, .1 + .35 * lit);
    },
    kale(x, k, lit, c, t, r, s) {
      x.fillStyle = k; x.fillRect(-78, -34, 156, 34);
      const kule = (px, w, h) => { x.fillStyle = k; x.fillRect(px - w / 2, -h, w, h); x.beginPath(); x.moveTo(px - w / 2 - 4, -h); x.lineTo(px, -h - 28); x.lineTo(px + w / 2 + 4, -h); x.fill(); };
      kule(-62, 20, 76); kule(0, 28, 104); kule(62, 20, 76);
      x.strokeStyle = k; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -132); x.lineTo(0, -148); x.stroke();
      x.fillStyle = rgba(c, .5 + .5 * lit); x.beginPath(); x.moveTo(0, -148); x.lineTo(16 + Math.sin(t * 4) * 2, -143); x.lineTo(0, -138); x.fill();
      [[-62, -52], [0, -70], [62, -52]].forEach(p => spot(x, c, p[0], p[1], 12, .2 + .8 * lit));
    },
    fener(x, k, lit, c, t, r, s) {
      x.fillStyle = k; x.beginPath(); x.moveTo(-22, 0); x.lineTo(-12, -110); x.lineTo(12, -110); x.lineTo(22, 0); x.fill();
      x.fillRect(-18, -122, 36, 12); x.beginPath(); x.moveTo(-16, -122); x.lineTo(0, -144); x.lineTo(16, -122); x.fill();
      spot(x, c, 0, -134, 60, .5 + .5 * lit); x.fillStyle = rgba('#ffffff', .6 + .4 * lit); x.beginPath(); x.arc(0, -133, 6, 0, 7); x.fill();
    },
  };

  // ── araçlar: (0,0) = oturma yeri; passengers ayrıca çizilir. koltuk: yolcuların dy'si ──
  const ARAC = {
    yaprak: { ucar: false, koltuk: -6,
      arka(x, t) {
        const g = x.createLinearGradient(0, -10, 0, 50); g.addColorStop(0, '#9fe08a'); g.addColorStop(1, '#3f9a55');
        x.fillStyle = g; x.strokeStyle = '#2f7a46'; x.lineWidth = 3; x.beginPath(); x.moveTo(-108, -14); x.bezierCurveTo(-76, 54, 64, 56, 112, -12); x.bezierCurveTo(60, 14, -62, 16, -108, -14); x.fill(); x.stroke();
        x.strokeStyle = '#d8ffc8'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(-100, -8); x.quadraticCurveTo(0, 28, 104, -6); x.stroke();
        for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(i * 28, 14 + Math.abs(i) * -1); x.lineTo(i * 28 + 16, 36 - Math.abs(i) * 4); x.stroke(); }
        x.fillStyle = '#6fc864'; x.beginPath(); x.moveTo(-108, -14); x.quadraticCurveTo(-130, -30, -118, -52); x.quadraticCurveTo(-98, -36, -100, -10); x.fill();
      } },
    kabarcik: { ucar: true, koltuk: 8,
      arka(x, t) { const g = x.createRadialGradient(0, 0, 40, 0, 0, 112); g.addColorStop(0, 'rgba(190,240,255,.06)'); g.addColorStop(1, 'rgba(160,230,255,.38)'); x.fillStyle = g; x.beginPath(); x.arc(0, -4, 108, 0, 7); x.fill(); },
      on(x, t) {
        x.lineWidth = 4; x.strokeStyle = 'rgba(235,252,255,.85)'; x.beginPath(); x.arc(0, -4, 108, 0, 7); x.stroke();
        x.strokeStyle = 'rgba(255,200,230,.5)'; x.lineWidth = 3; x.beginPath(); x.arc(0, -4, 102, .3, 1.5); x.stroke(); x.strokeStyle = 'rgba(170,255,230,.5)'; x.beginPath(); x.arc(0, -4, 102, 3.5, 4.5); x.stroke();
        x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 8; x.lineCap = 'round'; x.beginPath(); x.arc(0, -4, 88, 3.75, 4.35); x.stroke(); x.lineWidth = 5; x.beginPath(); x.arc(0, -4, 88, 4.5, 4.7); x.stroke();
      } },
    kartal: { ucar: true, koltuk: -18,
      arka(x, t) {
        const f = Math.sin(t * 5) * .5;
        const kanat = d => { x.save(); x.translate(d * 8, -4); x.rotate(d * (-.25 - f)); x.scale(d, 1);
          const g = x.createLinearGradient(0, 0, 130, 0); g.addColorStop(0, '#b0794a'); g.addColorStop(1, '#6a4428'); x.fillStyle = g; x.strokeStyle = '#4a2e1a'; x.lineWidth = 2;
          x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(30, -50, 100, -60, 150, -34); for (let i = 0; i < 5; i++) x.quadraticCurveTo(142 - i * 26, -22 + i * 4, 132 - i * 28, -8 + i * 2); x.lineTo(0, 22); x.closePath(); x.fill(); x.stroke(); x.restore(); };
        kanat(-1); kanat(1);
        x.fillStyle = '#7a4e2e'; x.beginPath(); x.moveTo(-60, 16); x.lineTo(-118, 30); x.lineTo(-112, 12); x.lineTo(-120, 0); x.lineTo(-62, 4); x.fill();
        const g = x.createLinearGradient(0, -10, 0, 50); g.addColorStop(0, '#c88e5a'); g.addColorStop(1, '#8a5a34'); x.fillStyle = g; x.beginPath(); x.ellipse(0, 22, 74, 32, -.08, 0, 7); x.fill();
        x.fillStyle = '#fff3d4'; x.beginPath(); x.ellipse(74, 12, 24, 20, 0, 0, 7); x.fill(); x.fillStyle = '#ffc94a'; x.beginPath(); x.moveTo(92, 8); x.quadraticCurveTo(122, 14, 110, 32); x.quadraticCurveTo(100, 22, 92, 22); x.fill();
        x.fillStyle = '#2a1a10'; x.beginPath(); x.arc(84, 8, 3.4, 0, 7); x.fill();
      },
    },
    kirinti: { ucar: false, koltuk: -4,
      arka(x, t) {
        const g = x.createLinearGradient(0, -10, 0, 60); g.addColorStop(0, '#f6d68e'); g.addColorStop(1, '#c58b3e'); x.fillStyle = g; x.strokeStyle = '#9a6a2a'; x.lineWidth = 3;
        x.beginPath(); x.moveTo(-92, 28); x.bezierCurveTo(-98, -22, 98, -22, 94, 28); x.bezierCurveTo(98, 60, -98, 60, -92, 28); x.fill(); x.stroke();
        x.strokeStyle = '#a8772f'; x.lineWidth = 3; x.lineCap = 'round'; for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(i * 36 - 8, 2); x.quadraticCurveTo(i * 36, 16, i * 36 + 10, 8); x.stroke(); }
        x.fillStyle = '#fff2c0'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(-60 + i * 24, 40 + (i % 2) * 5, 2.4, 0, 7); x.fill(); }
      } },
    vagon: { ucar: false, koltuk: -4,
      arka(x, t) {
        x.strokeStyle = '#9fd0ff'; x.lineWidth = 4; x.beginPath(); x.moveTo(-170, 78); x.lineTo(170, 78); x.stroke();
        x.fillStyle = '#6b7aa0'; for (let i = -4; i < 5; i++) { const px = ((i * 44 - t * 160) % 396) - 0; x.fillRect(((px + 198 + 396) % 396) - 198, 78, 12, 8); }
        for (let i = 0; i < 4; i++) { const px = -50 + i * 34; x.fillStyle = '#8fe0ff'; x.beginPath(); x.moveTo(px - 8, 10); x.lineTo(px, -14 - (i % 2) * 8); x.lineTo(px + 8, 10); x.fill(); spot(x, '#8fe0ff', px, -2, 20, .5); }
        const g = x.createLinearGradient(0, 10, 0, 80); g.addColorStop(0, '#a6adc6'); g.addColorStop(1, '#5e6584'); x.fillStyle = g; x.strokeStyle = '#3a4060'; x.lineWidth = 3;
        x.beginPath(); x.moveTo(-86, 14); x.lineTo(86, 14); x.lineTo(68, 70); x.lineTo(-68, 70); x.closePath(); x.fill(); x.stroke();
        x.fillStyle = '#c8cee4'; x.fillRect(-92, 8, 184, 12);
        [-44, 44].forEach(wx => { x.save(); x.translate(wx, 76); x.rotate(t * 7); x.fillStyle = '#454c6c'; x.beginPath(); x.arc(0, 0, 15, 0, 7); x.fill(); x.strokeStyle = '#c0c6e0'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(-12, 0); x.lineTo(12, 0); x.moveTo(0, -12); x.lineTo(0, 12); x.stroke(); x.restore(); });
      } },
    isik: { ucar: true, koltuk: 0,
      arka(x, t) {
        x.globalCompositeOperation = 'lighter';
        const g = x.createLinearGradient(-300, 0, 0, 0); g.addColorStop(0, 'rgba(255,230,140,0)'); g.addColorStop(1, 'rgba(255,226,120,.22)'); x.fillStyle = g; x.beginPath(); x.moveTo(-300, 4); x.lineTo(30, -26); x.lineTo(30, 52); x.lineTo(-300, 20); x.fill();
        spot(x, '#ffd860', 0, 20, 130 + Math.sin(t * 4) * 6, .35); spot(x, '#fff3b0', 0, 40, 70, .5);
        for (let i = 0; i < 10; i++) { const a = i * .628 + t * .8; x.strokeStyle = 'rgba(255,248,200,.18)'; x.lineWidth = 3; x.beginPath(); x.moveTo(Math.cos(a) * 70, 30 + Math.sin(a) * 18); x.lineTo(Math.cos(a) * 130, 30 + Math.sin(a) * 34); x.stroke(); }
        x.globalCompositeOperation = 'source-over';
        const pg = x.createLinearGradient(0, 36, 0, 62); pg.addColorStop(0, 'rgba(255,250,225,.95)'); pg.addColorStop(1, 'rgba(255,214,110,.75)'); x.fillStyle = pg; x.beginPath(); x.ellipse(0, 46, 80, 15, 0, 0, 7); x.fill();
      } },
    kanat: { ucar: true, koltuk: -4,
      arka(x, t) {
        const f = Math.sin(t * 3.2) * .35;
        const kanat = (d, ofs) => { x.save(); x.translate(-6, -16); x.rotate(-f * d + ofs); x.scale(1, d);
          const g = x.createLinearGradient(0, 0, -150, -90); g.addColorStop(0, 'rgba(235,210,255,.95)'); g.addColorStop(1, 'rgba(180,150,240,.25)'); x.fillStyle = g; x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 2.5;
          x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-50, -100, -140, -110, -170, -60); x.bezierCurveTo(-130, -70, -110, -40, -120, -20); x.bezierCurveTo(-80, -30, -50, -10, -20, 16); x.closePath(); x.fill(); x.stroke();
          x.beginPath(); x.moveTo(-6, -4); x.quadraticCurveTo(-70, -70, -150, -62); x.moveTo(-8, 0); x.quadraticCurveTo(-60, -34, -112, -26); x.stroke(); x.restore(); };
        x.globalCompositeOperation = 'lighter'; spot(x, '#d8c0ff', -40, -10, 150, .5); x.globalCompositeOperation = 'source-over';
        kanat(1, .2); kanat(-1, -.2);
        const g = x.createLinearGradient(0, 30, 0, 70); g.addColorStop(0, '#f6eaff'); g.addColorStop(1, '#bfa4f0'); x.fillStyle = g; x.strokeStyle = '#8d6ed0'; x.lineWidth = 3; x.beginPath(); x.ellipse(0, 44, 74, 22, 0, 0, 7); x.fill(); x.stroke();
      } },
  };

  // ── ana ──
  function start(host, o) {
    stop();
    o = o || {};
    const A = o.from || {}, B = o.to || {}, tA = TEMA[A.id] || VARSAYILAN, tB = TEMA[B.id] || VARSAYILAN;
    [tA, tB].forEach(t => { if (!t.koy) t.koy = mix(mix(t.ust, t.renk || t.alt, .42), '#0a1440', .3); });   // uzak kıyı silüeti: kara değil, diyarın renginde soluk
    const ALIAS = { dere: 'yaprak', kayik: 'yaprak', tren: 'vagon' }, ar0 = ALIAS[o.arac] || o.arac, arac = ARAC[ar0] ? ar0 : 'isik', V = ARAC[arac], DUR = (o.sure || 9.4);
    const noB = typeof B.no === 'number' ? B.no : 2, fenerParlak = clamp(noB / 10);
    const cv = document.createElement('canvas'); cv.className = 'gecis-cv'; host.innerHTML = ''; host.classList.add('gecis'); host.appendChild(cv);
    const x = cv.getContext('2d');
    const imgs = {}; ['feza', 'piril'].forEach(k => { if (o[k]) { const im = new Image(); im.src = o[k]; imgs[k] = im; } });
    let W = 0, H = 0, dpr = 1, U = 1;
    // iPad (2×): keskin çizim (3B dünya bu sırada duraklı)
    function size() { const r = host.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); W = Math.max(2, r.width); H = Math.max(2, r.height); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); U = Math.min(W / 520, H / 560, 1.7); }
    size(); const ro = window.ResizeObserver ? new ResizeObserver(size) : null; if (ro) ro.observe(host);
    const R = rng(7), stars = Array.from({ length: 130 }, () => ({ x: R(), y: R() * .66, r: .4 + R() * 1.4, p: R() * 6 })),
      clouds = Array.from({ length: 7 }, (_, i) => ({ x: R(), y: .12 + R() * .4, s: .5 + R() * .9, v: .006 + R() * .012, z: .2 + R() * .6 })),
      dust = Array.from({ length: 70 }, () => ({ x: R(), y: R(), z: .3 + R() * .9, p: R() * 6 })), trail = [];
    const state = { t0: performance.now(), last: 0, raf: 0, dead: false, shoot: -1 };
    const hor = () => H * .6;
    const pathPt = u => ({ x: lerp(W * .22, W * .7, u), y: H * .74 - H * .1 * u + Math.sin(u * Math.PI * 2) * H * .025 });

    function island(cx, by, sc, tema, tt, lit, seedN, rim, kur) {   // yüzen ada: kaya + silüet
      x.save(); x.translate(cx, by); x.scale(sc, sc);
      const rock = mix(tema.deniz, '#000000', .42);
      x.fillStyle = rock; x.beginPath(); x.moveTo(-130, 0); x.quadraticCurveTo(-110, 14, -70, 22); x.quadraticCurveTo(-20, 56, 10, 50); x.quadraticCurveTo(60, 40, 80, 22); x.quadraticCurveTo(120, 12, 130, 0); x.closePath(); x.fill();
      const top = mix(tema.alt, '#10203a', .5 - .32 * lit); x.fillStyle = top; x.beginPath(); x.ellipse(0, 0, 132, 18, 0, 0, 7); x.fill();
      x.strokeStyle = rgba(tema.isik, rim * .8); x.lineWidth = 2.5; x.beginPath(); x.ellipse(0, 0, 132, 18, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
      spot(x, tema.isik, 0, -30, 160, .16 + .4 * lit);
      // silüet: ada yandıkça karanlıktan kendi rengine (mantar pembe, mercan mercan rengi, orman yeşil…)
      const dk = mix(mix(tema.ust, tema.alt, .2), '#04081a', .55 - .3 * lit);
      SIL[tema.sil](x, tema.renk ? mix(dk, tema.renk, clamp(lit * .88)) : dk, lit, tema.isik, tt, rng(seedN), sc);
      x.restore();
    }
    function sky(p) {   // gece göğü ama aydınlık ve temiz (pus yok): tepe derin mavi, ufka doğru sıcak ve açık
      const top = mix(mix(tA.ust, tB.ust, p), '#2a3f8e', .3), bot = mix(tA.alt, tB.alt, p);
      const g = x.createLinearGradient(0, 0, 0, hor()); g.addColorStop(0, top); g.addColorStop(.62, mix(top, bot, .55)); g.addColorStop(1, mix(bot, '#fff1d0', .16)); x.fillStyle = g; x.fillRect(0, 0, W, H);
    }
    function fenerFar(t, p) {   // uzak Büyük Fener: tepede dönen ışık huzmesi
      const fx = W * .5, fy = hor() - 6, k = .22 + .78 * fenerParlak;
      x.save(); x.translate(fx, fy);
      const a = Math.sin(t * .75) * 1.05; const len = Math.max(W, H) * 1.1;
      x.globalCompositeOperation = 'lighter';
      for (const d of [0, 1]) { x.save(); x.translate(0, -34 * U * .8); x.rotate(a + d * Math.PI); const g = x.createLinearGradient(0, 0, len, 0); g.addColorStop(0, `rgba(255,244,190,${.5 * k})`); g.addColorStop(1, 'rgba(255,244,190,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(0, -3); x.lineTo(len, -len * .09); x.lineTo(len, len * .09); x.lineTo(0, 3); x.fill(); x.restore(); }
      x.globalCompositeOperation = 'source-over';
      spot(x, '#fff2b8', 0, -34 * U * .8, 40 * U * (.6 + k), .4 + .6 * k);
      x.fillStyle = '#0a1230'; x.beginPath(); x.moveTo(-5 * U, 0); x.lineTo(-3 * U, -32 * U * .8); x.lineTo(3 * U, -32 * U * .8); x.lineTo(5 * U, 0); x.fill();
      x.restore();
    }
    function cloud(c, t, p) {
      const cx = ((c.x - t * c.v * c.z * 3) % 1.3 + 1.3) % 1.3 - .15, cy = c.y * H;
      x.save(); x.translate(cx * W, cy); x.scale(c.s * U * 1.2, c.s * U * 1.2);
      for (let i = 0; i < 5; i++) spot(x, '#9fb8e0', (i - 2) * 34, Math.sin(i * 1.7) * 6, 50 - Math.abs(i - 2) * 8, .08 * c.z + .03);
      x.restore();
    }

    function frame(now) {
      if (state.dead) return;
      const t = (now - state.t0) / 1000; state.raf = requestAnimationFrame(frame);
      if (!cv.isConnected || t > DUR + 3) { stop(); return; }
      const dt = Math.min(.05, t - state.last); state.last = t;
      const p = clamp((t - .6) / (DUR - 2.0)), pe = ease(p), pEnd = smooth(.82, 1, p);
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
      sky(pe);
      // yıldızlar
      for (const s of stars) { const a = .35 + .65 * Math.abs(Math.sin(t * 1.3 + s.p)); x.fillStyle = `rgba(255,250,225,${a * (1 - s.y / .7 * .6)})`; x.beginPath(); x.arc(s.x * W, s.y * H, s.r * Math.max(.7, U * .8), 0, 7); x.fill(); }
      // uykucu, gülümseyen dolunay (boş göğü doldurur; masal havası) — yumuşak hale + gözleri kapalı sevimli yüz
      { const por = W < H, mx = W * (por ? .76 : .82), my = H * (por ? .15 : .19), mr = Math.min(W, H) * (por ? .085 : .075), bb = Math.sin(t * .8) * mr * .04;
        x.globalCompositeOperation = 'lighter'; spot(x, '#cfe0ff', mx, my + bb, mr * 4, .2); spot(x, '#fff3c8', mx, my + bb, mr * 1.9, .35); x.globalCompositeOperation = 'source-over';
        x.fillStyle = '#fff4d6'; x.beginPath(); x.arc(mx, my + bb, mr, 0, 7); x.fill();
        x.fillStyle = 'rgba(236,214,160,.5)'; x.beginPath(); x.arc(mx - mr * .42, my + bb - mr * .45, mr * .17, 0, 7); x.arc(mx + mr * .5, my + bb - mr * .3, mr * .11, 0, 7); x.fill();
        x.strokeStyle = '#a07a52'; x.lineWidth = Math.max(1.5, mr * .07); x.lineCap = 'round';
        x.beginPath(); x.arc(mx - mr * .33, my + bb - mr * .02, mr * .16, .2, Math.PI - .2); x.moveTo(mx + mr * .49, my + bb - mr * .02); x.arc(mx + mr * .33, my + bb - mr * .02, mr * .16, .2, Math.PI - .2);
        x.moveTo(mx + mr * .14, my + bb + mr * .32); x.arc(mx, my + bb + mr * .3, mr * .14, .3, Math.PI - .3); x.stroke();
        x.fillStyle = 'rgba(255,150,150,.4)'; x.beginPath(); x.ellipse(mx - mr * .55, my + bb + mr * .22, mr * .14, mr * .08, 0, 0, 7); x.ellipse(mx + mr * .55, my + bb + mr * .22, mr * .14, mr * .08, 0, 0, 7); x.fill(); }
      if (t > 3 && t < 4.2) { const u = (t - 3) / 1.2; x.strokeStyle = `rgba(255,255,235,${1 - u})`; x.lineWidth = 2; x.beginPath(); x.moveTo(W * (.8 - u * .3), H * (.08 + u * .16)); x.lineTo(W * (.8 - u * .3 + .07), H * (.08 + u * .16 - .035)); x.stroke(); }
      // ufuk parıltısı
      x.globalCompositeOperation = 'lighter'; const hg = x.createLinearGradient(0, hor() - H * .22, 0, hor()); hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(1, rgba(pe < .5 ? tA.isik : tB.isik, .10 + .10 * pe)); x.fillStyle = hg; x.fillRect(0, hor() - H * .22, W, H * .22); x.globalCompositeOperation = 'source-over';
      clouds.filter(c => c.z < .5).forEach(c => cloud(c, t, pe));
      // uzak silüet şeridi (solda önceki, sağda sonraki diyar)
      const ridge = (tema, x0, x1, alpha, seed, sc) => {
        x.save(); x.globalAlpha = alpha; const r = rng(seed); const step = 130 * sc * U * .8;
        for (let px = x0; px < x1; px += step) { x.save(); x.translate(px + (r() - .5) * step * .4, hor() + 2); x.scale(sc * U * .8 * (.8 + r() * .5), sc * U * .8 * (.8 + r() * .5)); SIL[tema.sil](x, tema.koy, .2 + .5 * pe, tema.isik, t, rng(seed + Math.floor(px)), 1); x.restore(); }
        x.restore();
      };
      ridge(tA, -W * .05 - pe * W * .08, W * .5, 1 - pe * .85, 11, .5); ridge(tB, W * .5, W * 1.05, .35 + .65 * pe, 23, .5 + .2 * pe);
      fenerFar(t, pe);
      // deniz
      const sg = x.createLinearGradient(0, hor(), 0, H); sg.addColorStop(0, mix(mix(tA.alt, tB.alt, pe), '#0a2a50', .32)); sg.addColorStop(.35, mix(mix(tA.deniz, tB.deniz, pe), '#0a1c40', .18)); sg.addColorStop(1, mix(mix(tA.deniz, tB.deniz, pe), '#020a22', .5));
      x.fillStyle = sg; x.fillRect(0, hor(), W, H - hor());
      // yıldız/ay yansıması ve dalgalar
      x.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) { const yy = hor() + 6 + Math.pow((i / 26), 1.6) * (H - hor()); const ph = (t * (.25 + i * .01) + i * .37) % 1; const px = ((i * 0.6180339) % 1) * W; const wd = (20 + i * 4) * U; x.strokeStyle = rgba(mix(tA.isik, tB.isik, pe).length ? '#bfe0ff' : '#bfe0ff', .07 + .1 * Math.sin(ph * Math.PI)); x.lineWidth = 1.5 + i * .08; x.beginPath(); x.moveTo(px - wd, yy); x.quadraticCurveTo(px, yy + 3, px + wd, yy); x.stroke(); }
      x.globalCompositeOperation = 'source-over';
      // parlayan yol
      const pc = rgba('#fff0b0', 1);
      x.globalCompositeOperation = 'lighter';
      let prev = pathPt(0); for (let i = 1; i <= 40; i++) { const u = i / 40, q = pathPt(u); x.strokeStyle = `rgba(255,236,160,${.12 + .08 * Math.sin(t * 2 + u * 9)})`; x.lineWidth = 16 * U * (1 - u * .4); x.lineCap = 'round'; x.beginPath(); x.moveTo(prev.x, prev.y); x.lineTo(q.x, q.y); x.stroke(); prev = q; }
      for (let i = 0; i < 26; i++) { const u = ((i / 26) + t * .05) % 1, q = pathPt(u); spot(x, '#fff3c0', q.x, q.y, (7 + 5 * Math.sin(t * 3 + i)) * U * (1 - u * .4), .75); }
      x.globalCompositeOperation = 'source-over';
      // hedef ada (yükselir, yanar)
      const lit = smooth(.4, .98, p), dsc = U * (.62 + .45 * pe), dy = (1 - pe) * H * .1;
      const dxp = W * .76, dyp = hor() + H * .05 + dy;
      x.globalAlpha = .4 + .6 * smooth(0, .3, p); island(dxp, dyp, dsc, tB, t, lit, 5, .3 + .7 * lit); x.globalAlpha = 1;
      if (pEnd > 0) { x.globalCompositeOperation = 'lighter'; const q = Math.sin(pEnd * Math.PI); spot(x, tB.isik, dxp, dyp - 60 * dsc, 260 * dsc * (.6 + pEnd * .8), .35 * q + .12 * pEnd); x.globalCompositeOperation = 'source-over'; }
      // önceki ada (sola kayar)
      const sx = lerp(W * .2, -W * .35, smooth(0, .75, p)), sc1 = U * lerp(1.15, .9, p);
      if (sx > -300 * sc1) island(sx, pathPt(0).y + 14 * U, sc1, tA, t, .78, 3, .6);   // ışığını geri getirdiğimiz diyar: yanık kalır
      // araç yolu
      const u = lerp(.02, .82, pe), q = pathPt(u), bob = Math.sin(t * 2.4) * 6 * U;
      let vx = q.x, vy = q.y + bob * (V.ucar ? 1.2 : .6);
      if (V.ucar) vy -= H * .16 + Math.sin(t * 1.2) * H * .01;
      const vsc = U * 1.15 * (1.0 - .22 * pEnd), tilt = Math.cos(t * 2.4) * .04 + (V.ucar ? -.06 : 0);
      // gölge/yansıma
      x.save(); x.globalAlpha = .35; x.fillStyle = '#02081a'; x.beginPath(); x.ellipse(q.x, q.y + 30 * vsc, 90 * vsc, 11 * vsc, 0, 0, 7); x.fill(); x.restore();
      x.globalCompositeOperation = 'lighter'; spot(x, '#ffe9a0', q.x, q.y + 28 * vsc, 120 * vsc, .2); x.globalCompositeOperation = 'source-over';
      // yolcu konumları
      const fi = { x: -30 * vsc, y: (V.koltuk - 38) * vsc }, pi = { x: 42 * vsc, y: (V.koltuk - 50 + Math.sin(t * 3) * 4) * vsc };
      // Pırıl'ın ışık izi
      if (dt > 0) { for (let i = 0; i < 2; i++) trail.push({ x: vx + pi.x - 8 * U, y: vy + pi.y + 6 * U, vx: -40 * U - Math.random() * 40 * U, vy: (Math.random() - .5) * 30 * U, a: 1, c: Math.random() < .5 ? '#ffe9a0' : '#d8c4ff', s: 6 + Math.random() * 10 }); }
      for (let i = trail.length - 1; i >= 0; i--) { const q2 = trail[i]; q2.a -= dt * .8; q2.x += q2.vx * dt; q2.y += q2.vy * dt; if (q2.a <= 0) trail.splice(i, 1); }
      x.globalCompositeOperation = 'lighter'; for (const q2 of trail) spot(x, q2.c, q2.x, q2.y, q2.s * U * q2.a + 2, q2.a * .85); x.globalCompositeOperation = 'source-over';
      // araç + yolcular
      x.save(); x.translate(vx, vy); x.rotate(tilt); x.scale(vsc, vsc);
      V.arka(x, t);
      x.restore();
      const yolcu = (img, cx, cy, r, ring, gl, pir) => {
        x.save(); x.translate(vx + cx, vy + cy);
        x.globalCompositeOperation = 'lighter'; spot(x, gl, 0, 0, r * 2.3, .45); x.globalCompositeOperation = 'source-over';
        x.beginPath(); x.arc(0, 0, r, 0, 7); x.fillStyle = '#ffffff'; x.fill(); x.save(); x.clip();
        if (img && img.complete && img.naturalWidth) x.drawImage(img, -r, -r, r * 2, r * 2); else yuzCiz(x, r, pir); x.restore();
        x.lineWidth = 4 * vsc; x.strokeStyle = ring; x.beginPath(); x.arc(0, 0, r, 0, 7); x.stroke(); x.restore();
      };
      yolcu(imgs.feza, fi.x, fi.y, 38 * vsc, '#bfe4ff', '#9fd8ff', false);
      yolcu(imgs.piril, pi.x, pi.y, 34 * vsc, '#ffe08a', '#ffe9a0', true);
      if (V.on) { x.save(); x.translate(vx, vy); x.rotate(tilt); x.scale(vsc, vsc); V.on(x, t); x.restore(); }
      // bulutlar (ön)
      clouds.filter(c => c.z >= .5).forEach(c => cloud(c, t, pe));
      // ışık tozu
      x.globalCompositeOperation = 'lighter';
      for (const d of dust) { const dx = ((d.x - t * .02 * d.z) % 1 + 1) % 1, dy2 = ((d.y - t * .012 * d.z) % 1 + 1) % 1; spot(x, '#fff0c0', dx * W, dy2 * H, (3 + 5 * d.z) * U * .7, .25 + .3 * Math.abs(Math.sin(t + d.p))); }
      x.globalCompositeOperation = 'source-over';
      // hafif vinyet + yumuşak açılış/kapanış
      const vg = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .45, W / 2, H / 2, Math.max(W, H) * .78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(2,6,20,.36)'); x.fillStyle = vg; x.fillRect(0, 0, W, H);
      const fo = 1 - smooth(0, .9, t) + smooth(DUR - 1.0, DUR - .2, t);
      if (fo > .001) { x.fillStyle = `rgba(8,12,34,${clamp(fo)})`; x.fillRect(0, 0, W, H); }
    }
    state.raf = requestAnimationFrame(frame);
    state.step = ms => frame(state.t0 + ms);   // testler için
    cur = { stop() { state.dead = true; cancelAnimationFrame(state.raf); if (ro) ro.disconnect(); host.classList.remove('gecis'); }, state };
    return cur;
  }
  function stop() { if (cur) { cur.stop(); cur = null; } }
  return { start, stop, TEMA, ARAC: Object.keys(ARAC), get cur() { return cur; } };
})();
if (typeof window !== 'undefined') window.GECIS = GECIS;
