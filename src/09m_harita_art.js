/* ── Dünya Haritası çizimleri (HARITA): ortak yardımcılar + 10 yerin resmi + Büyük Fener ──
   Saf SVG metni üretir. 09m_harita.js tarafından kullanılır (HARITA_ART). Mor yalnız Pırıl'ın: burada kullanma. */
const HARITA_ART = (() => {
  'use strict';
  const IDS = ['mantar', 'mercan', 'orman', 'degirmen', 'magara', 'mabet', 'yanardag', 'sehir', 'kale', 'fener'];
  const hx = c => { const m = /^#?([0-9a-f]{6})$/i.exec(c || ''); const n = m ? parseInt(m[1], 16) : 0x888888; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgb = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (c, d, k) => { const a = hx(c), b = hx(d); return rgb(a.map((v, i) => v + (b[i] - v) * k)); };
  const lite = (c, k = .3) => mix(c, '#ffffff', k), dark = (c, k = .3) => mix(c, '#0a1230', k);
  const rng = seed => { let a = (seed * 2654435761) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const f1 = v => +v.toFixed(1);

  // yumuşak dalgalı oval
  function blob(rx, ry, seed, cy = 0, j = .08, n = 12) {
    const R = rng(seed), p = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + (R() - .5) * 2 * j; p.push([Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s = 'M' + m(p[n - 1], p[0]).map(f1).join(' ');
    for (let i = 0; i < n; i++) { const q = m(p[i], p[(i + 1) % n]); s += `Q${f1(p[i][0])} ${f1(p[i][1])} ${f1(q[0])} ${f1(q[1])}`; }
    return s + 'Z';
  }

  const GL = {
    w: '#fff2b8', p: '#ff94bd', c: '#74f0ff', g: '#98ffa8',
    o: '#ffa438', y: '#ffe270', b: '#88b8ff', r: '#ff6450', wt: '#ffffff'
  };
  function defs() {
    let s = '';
    for (const k in GL) {
      s += `<radialGradient id="hmGl_${k}"><stop offset="0" stop-color="${GL[k]}" stop-opacity=".96"/><stop offset=".42" stop-color="${GL[k]}" stop-opacity=".42"/><stop offset="1" stop-color="${GL[k]}" stop-opacity="0"/></radialGradient>`;
    }
    s += `<linearGradient id="hmGld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4b8"/><stop offset=".5" stop-color="#f0be48"/><stop offset="1" stop-color="#a8741e"/></linearGradient>`;
    s += `<linearGradient id="hmGldH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b88428"/><stop offset=".35" stop-color="#ffe88a"/><stop offset=".65" stop-color="#f2bd42"/><stop offset="1" stop-color="#9e6c1a"/></linearGradient>`;
    return s;
  }
  const glow = (x, y, rx, ry, n, op = 1) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#hmGl_${n})" opacity="${op}"/>`;
  function star(x, y, r, c, op = 1) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .44 : r;
      d += (i ? 'L' : 'M') + f1(x + Math.cos(a) * rr) + ' ' + f1(y + Math.sin(a) * rr);
    }
    return `<path d="${d}Z" fill="${c}" opacity="${op}"/>`;
  }
  const sparkle = (x, y, r, c = '#fff6d6') =>
    `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${c}"/>` +
    `<circle cx="${x}" cy="${y}" r="${f1(r * .24)}" fill="#fff"/>`;
  const fly = (x, y, r, c, d, t = 3) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"><animate attributeName="opacity" values=".15;1;.15" dur="${t}s" begin="${d}s" repeatCount="indefinite"/></circle>${glow(x, y, r * 4.2, r * 4.2, 'y', .55)}`;

  // ── Ada tabanı: sığ turkuaz lagün, çift köpük halkası, 3B falez/uçurum, kumsal/kıyı ve biyom zemini ──
  const TOP = {
    mantar: ['#52cf96', '#217562', '#d2f0c8', '#3c6878'],
    mercan: ['#6ce0d8', '#228da8', '#f7e4b2', '#38829e'],
    orman: ['#4cb562', '#1f6438', '#cfa86a', '#4a5a48'],
    degirmen: ['#f5d264', '#c48a2e', '#ebd088', '#8a6d48'],
    magara: ['#7c8ec0', '#38467a', '#b2bedc', '#354068'],
    mabet: ['#92a8de', '#465c9c', '#d8e2fa', '#4c5e8a'],
    yanardag: ['#92584e', '#482830', '#754248', '#3c2228'],
    sehir: ['#dfc49e', '#9e7e58', '#eee0c4', '#726658'],
    kale: ['#f4b6b8', '#bf6c84', '#fae0da', '#7c5668'],
    fener: ['#ebd68c', '#9e8248', '#f6ecc4', '#68769c']
  };
  function base(id, rx, ry, seed) {
    const [t1, t2, rim, cliff] = TOP[id] || TOP.mantar;
    const R = rng(seed + 9);
    let s = `<defs>
      <linearGradient id="hmT_${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lite(t1, .14)}"/><stop offset=".55" stop-color="${t1}"/><stop offset="1" stop-color="${t2}"/></linearGradient>
      <linearGradient id="hmC_${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lite(cliff, .22)}"/><stop offset=".45" stop-color="${cliff}"/><stop offset="1" stop-color="${dark(cliff, .58)}"/></linearGradient>
    </defs>`;
    // Deniz dibi gölgesi + turkuaz sığ su halesi
    s += `<ellipse cy="${ry + 19}" rx="${rx + 32}" ry="${f1(ry * .72)}" fill="#03081c" opacity=".48"/>`;
    s += `<ellipse cy="${ry + 9}" rx="${rx + 25}" ry="${f1(ry * .66)}" fill="#3ad4d8" opacity=".16"/>`;
    // Dış ve iç köpük halkaları
    s += `<path d="${blob(rx + 29, ry + 15, seed + 5, 9, .05)}" fill="none" stroke="#bce8ff" stroke-width="1.4" opacity=".28" stroke-dasharray="4 10"/>`;
    s += `<path d="${blob(rx + 17, ry + 10, seed, 7, .05)}" fill="#c8f0ff" opacity=".16"/>`;
    s += `<path d="${blob(rx + 17, ry + 10, seed, 7, .05)}" fill="none" stroke="#eefaff" stroke-width="2.3" opacity=".58" stroke-dasharray="15 7 5 7"/>`;
    // 3B Kayalık falez gövdesi (katmanlı)
    s += `<path d="${blob(rx + 5, ry + 5, seed + 1, 15, .04)}" fill="url(#hmC_${id})"/>`;
    s += `<path d="M${-rx} 8Q${-rx * .5} ${ry + 15} 0 ${ry + 17}V6H${-rx}Z" fill="${lite(cliff, .28)}" opacity=".25"/>`;
    s += `<path d="M0 ${ry + 17}Q${rx * .55} ${ry + 15} ${rx + 3} 8V4H0Z" fill="#04081c" opacity=".26"/>`;
    // Falez dikey kaya çatlakları ve kıyı kayaları
    for (let i = 0; i < 6; i++) {
      const x = -rx * .75 + i * rx * .3 + R() * 5;
      s += `<path d="M${f1(x)} ${ry + 3}l${f1(R() * 4 - 2)} ${f1(9 + R() * 5)}" stroke="${dark(cliff, .65)}" stroke-width="2.2" opacity=".42" stroke-linecap="round" fill="none"/>`;
    }
    // Kıyı şeridi / kumsal / taş bordür
    s += `<path d="${blob(rx + 4, ry + 3.5, seed + 1, 4.5, .04)}" fill="${rim}"/>`;
    s += `<path d="${blob(rx + 4, ry + 3.5, seed + 1, 4.5, .04)}" fill="none" stroke="${lite(rim, .35)}" stroke-width="1.2" opacity=".55"/>`;
    // Üst biyom terası + yumuşak tepe aydınlatması
    s += `<path d="${blob(rx, ry, seed + 2, 0, .05)}" fill="url(#hmT_${id})"/>`;
    s += `<path d="${blob(rx * .82, ry * .56, seed + 3, -ry * .22, .08)}" fill="#ffffff" opacity=".12"/>`;
    return s;
  }

  // ── Zenginleştirilmiş Biyom Yapı Taşları ──
  const mush = (x, y, k, cap, spot, g, C) =>
    `<g transform="translate(${x} ${y}) scale(${k})">${glow(0, -32, 54, 42, g, .6)}` +
    `<ellipse cy="3" rx="12" ry="3.5" fill="#081820" opacity=".32"/>` +
    `<path d="M-6.5 3Q-5 -14 -4 -31H4Q5 -14 6.5 3Q0 5 -6.5 3Z" fill="${C('#f6ead8')}"/>` +
    `<path d="M-6.5 3Q-5 -14 -4 -31H-1Q-2 -14 -1.5 3Z" fill="#fff" opacity=".55"/>` +
    `<path d="M-34 -24Q0 -11 34 -24Q26 -30 0 -28Q-26 -30 -34 -24Z" fill="${C(dark(cap, .45))}"/>` +
    `<path d="M-24 -21l4 -6M-12 -19l2 -8M0 -18v-9M12 -19l-2 -8M24 -21l-4 -6" stroke="${C(lite(cap, .4))}" stroke-width="1.2" opacity=".45"/>` +
    `<path d="M-35 -24Q-33 -66 0 -68Q33 -66 35 -24Q0 -15 -35 -24Z" fill="${C(cap)}"/>` +
    `<path d="M0 -68Q33 -66 35 -24Q16 -19 0 -19Z" fill="#060c24" opacity=".16"/>` +
    `<path d="M-24 -48Q-16 -61 -2 -63" stroke="#fff" opacity=".68" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
    [[-15, -42, 4.8], [10, -54, 5.2], [21, -36, 4], [-3, -33, 3.4], [-24, -31, 3.2], [6, -38, 2.6]].map(([a, b, r]) =>
      `<circle cx="${a}" cy="${b}" r="${r}" fill="${C(spot)}"/><circle cx="${a - r * .25}" cy="${b - r * .25}" r="${f1(r * .35)}" fill="#fff" opacity=".6"/>`
    ).join('') + '</g>';

  const pine = (x, y, k, C) =>
    `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cy="3" rx="18" ry="4.5" fill="#061e14" opacity=".4"/>` +
    `<rect x="-4" y="-12" width="8" height="15" rx="1.5" fill="${C('#70482e')}"/><rect x="-4" y="-12" width="3" height="15" fill="${C('#966846')}" opacity=".5"/>` +
    [['#1f6c3c', -72, 18, -42], ['#288248', -56, 23, -25], ['#329854', -40, 27, -8], ['#3eb062', -24, 31, 7]].map(([c, t, w, b]) =>
      `<path d="M0 ${t}L${-w} ${b}Q0 ${b + 8} ${w} ${b}Z" fill="${C(c)}"/>` +
      `<path d="M0 ${t}L${w} ${b}Q${w * .3} ${b + 5} 0 ${b + 3}Z" fill="#072818" opacity=".26"/>` +
      `<path d="M0 ${t}L${-w * .78} ${b - 2}" stroke="${C('#88e898')}" stroke-width="1.6" stroke-linecap="round" opacity=".35"/>`
    ).join('') + '</g>';

  const coral = (x, y, h, col, C, w = 7) => {
    const d = `M0 0V${-h}M0 ${-h * .42}Q${-h * .25} ${-h * .5} ${-h * .34} ${-h * .74}M0 ${-h * .58}Q${h * .26} ${-h * .66} ${h * .35} ${-h * .9}M0 ${-h * .78}Q${-h * .16} ${-h * .86} ${-h * .2} ${-h * 1.02}`;
    return `<g transform="translate(${x} ${y})" fill="none" stroke-linecap="round"><path d="${d}" stroke="${C(dark(col, .3))}" stroke-width="${w}"/><path d="${d}" stroke="${C(col)}" stroke-width="${w * .62}"/><path d="${d}" stroke="${C(lite(col, .45))}" stroke-width="${w * .22}"/></g>`;
  };

  const crystal = (x, y, h, w, col, C, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">${glow(0, -h * .52, w * 2.4, h * .85, 'c', .48)}` +
    `<path d="M${-w} 0L${-w * .85} ${-h * .72}L0 ${-h}L${w * .85} ${-h * .72}L${w} 0Z" fill="${C(col)}"/>` +
    `<path d="M${-w} 0L${-w * .85} ${-h * .72}L0 ${-h}L${-w * .15} 0Z" fill="${C(lite(col, .42))}" opacity=".75"/>` +
    `<path d="M0 ${-h}L${w * .85} ${-h * .72}L${w} 0H0Z" fill="#050b24" opacity=".24"/>` +
    `<path d="M${-w * .52} ${-h * .12}L${-w * .48} ${-h * .66}L0 ${-h * .92}" stroke="#fff" stroke-width="2" opacity=".82" fill="none" stroke-linecap="round"/></g>`;

  // ── 10 Diyar Adasının Zengin Minyatür İllüstrasyonu ──
  function mini(id, ok) {
    const C = ok ? (x => x) : (x => mix(x, '#7888ac', .3));
    const ov = [];
    let s = '';
    const rx = id === 'mercan' ? 70 : 74, ry = 24;
    const seed = IDS.indexOf(id) * 7 + 3;
    s += base(id, rx, ry, seed);

    const M = {
      mantar() {
        s += glow(0, -8, 86, 34, 'c', .28) + glow(0, -24, 70, 44, 'p', .25);
        // Parlayan şelale ve kıvrımlı biyolüminesan dere
        s += `<path d="M-58 8Q-22 0 4 11T62 6" stroke="${C('#38b8d8')}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
        s += `<path d="M-58 8Q-22 0 4 11T62 6" stroke="${C('#a6faff')}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
        // Falezden dökülen mini şelale
        s += `<path d="M8 11Q12 22 10 34" stroke="${C('#7ceeff')}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/>`;
        s += `<path d="M8 11Q12 22 10 34" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-dasharray="4 4"/>`;
        s += `<ellipse cx="10" cy="35" rx="11" ry="3.5" fill="#e8ffff" opacity=".75"/>`;
        // Kemerli ahşap peri köprüsü
        s += `<path d="M-16 11Q-4 1 8 11" stroke="${C('#8c5a36')}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
        s += `<path d="M-15 6Q-4 -4 7 6" stroke="${C('#c48c5a')}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
        // Dev ve yavru mantarlar (derinlik sıralı)
        [
          [-64, 0, .44, '#6ee8a8', '#f0fff4', 'g'],
          [-48, 5, .74, '#4fd6e8', '#e8ffff', 'c'],
          [48, 3, .78, '#ffd24c', '#fff8d0', 'y'],
          [-22, 12, .54, '#ff964f', '#fff2e2', 'o'],
          [26, 13, .54, '#ff6896', '#fff2f8', 'p'],
          [0, 5, 1.32, '#ff6090', '#fff5fa', 'p']
        ].sort((a, b) => a[1] - b[1]).forEach(([x, y, k, c, sp, g]) => s += mush(x, y, k, c, sp, g, C));
        // Parlayan spor fenerleri ve çimen kristalleri
        for (let i = 0; i < 6; i++) {
          const x = -56 + i * 22, y = 11 + (i % 2) * 5;
          s += `<circle cx="${x}" cy="${y}" r="2.3" fill="${C('#ffe888')}"/>${glow(x, y, 7, 7, 'y', .5)}`;
        }
        for (let i = 0; i < 5; i++) ov.push(fly(-54 + i * 27, -22 - (i * 19) % 42, 2, '#dcff9e', i * .45, 2.3 + i % 3));
      },

      mercan() {
        // Kristal lagün havuzu
        s += `<path d="${blob(58, 16, 77, 2, .08)}" fill="${C('#1e9ec0')}" opacity=".72"/>`;
        s += `<path d="${blob(58, 16, 77, 2, .08)}" fill="none" stroke="#dcffff" stroke-width="2.2" opacity=".75"/>`;
        s += glow(0, -14, 76, 42, 'c', .35);
        // Arka plan sedef kuleler (deniz kabuğu kuleleri)
        [[-26, -4, .82, '#ff9cb8'], [26, -4, .82, '#ffb888']].forEach(([x, y, k, c]) => {
          s += `<g transform="translate(${x} ${y}) scale(${k})">` +
            `<path d="M-12 8L-9 -26L0 -44L9 -26L12 8Z" fill="${C(c)}"/>` +
            `<path d="M-10 -6Q0 -12 10 -6M-8 -18Q0 -24 8 -18M-5 -30Q0 -34 5 -30" stroke="#fff" stroke-width="2" fill="none" opacity=".65"/>` +
            star(0, -46, 5.5, C('#ffe27a')) + `</g>`;
        });
        // Zengin mercan dalları
        s += coral(-44, 6, 38, '#ff6e96', C, 7.5) + coral(44, 7, 34, '#ffa8c2', C, 6.5) +
             coral(8, 3, 54, '#ff9240', C, 8.5) + coral(-18, 10, 28, '#ffd24c', C, 6.2) +
             coral(26, 12, 26, '#ff6482', C, 5.8);
        // Merkezde Dev Sedef İstiridye Tahtı ve Parlayan İnci
        s += `<g transform="translate(-4 -2)">` +
          `<path d="M-18 -2Q-22 -24 0 -28Q22 -24 18 -2Z" fill="${C('#ffd8c4')}" stroke="${C('#f0a890')}" stroke-width="1.6"/>` +
          `<path d="M-12 -3L-14 -20M-6 -3L-6 -24M0 -3V-25M6 -3L6 -24M12 -3L14 -20" stroke="#fff" stroke-width="1.4" opacity=".65"/>` +
          `<ellipse cy="0" rx="18" ry="8.5" fill="${C('#fff4e2')}" stroke="${C('#eaa888')}" stroke-width="1.5"/>` +
          `${glow(0, -6, 26, 20, 'wt', .85)}<circle cy="-6" r="6.5" fill="#ffffff"/><circle cx="-2" cy="-8" r="2.2" fill="#e8ffff"/>` +
          `</g>`;
        // Denizyıldızları ve kıyı köpüğü
        s += star(-52, 9, 7.5, C('#ff8838')) + star(48, 13, 5.5, C('#ffd25a'));
        s += `<path d="M-62 15q9 -6 18 0t18 0t18 0t18 0t18 0t18 0" stroke="#ecfcff" stroke-width="2.8" fill="none" opacity=".8" stroke-linecap="round"/>`;
        // Canlı kabarcıklar ve sevimli balıklar
        for (let i = 0; i < 4; i++) {
          ov.push(`<circle cx="${-34 + i * 22}" cy="-8" r="${2.2 + i % 3}" fill="#e8fbff" fill-opacity=".4" stroke="#fff" stroke-opacity=".85"><animate attributeName="cy" values="-6;-74" dur="${3.8 + i * .6}s" begin="${i * .7}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="${3.8 + i * .6}s" begin="${i * .7}s" repeatCount="indefinite"/></circle>`);
        }
        ov.push(`<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="2.8s" repeatCount="indefinite"/><path d="M48 -24q7 -7 14 0q-7 7 -14 0M62 -24l7 -5v10Z" fill="#ffb03a"/><circle cx="52" cy="-25" r="1.3" fill="#102040"/></g>`);
      },

      orman() {
        s += glow(0, 4, 78, 28, 'o', .22) + glow(0, -28, 70, 40, 'g', .18);
        // Sık ve katmanlı çam ormanı
        [[-62, 2, .65], [-50, 7, .9], [52, 7, .85], [-28, -2, 1.1], [32, -3, 1.14], [-3, -10, 1.36]].forEach(([x, y, k]) => s += pine(x, y, k, C));
        // Sağda antik yosunlu taş kemer & asılı orman feneri
        s += `<g transform="translate(38 11)"><path d="M-10 4V-12Q0 -22 10 -12V4" fill="none" stroke="${C('#7c8898')}" stroke-width="5" stroke-linecap="round"/><path d="M-10 -8Q-2 -18 8 -10" stroke="${C('#58b868')}" stroke-width="2.5" fill="none"/><circle cy="-8" r="3" fill="#ffe27a"/>${glow(0, -8, 12, 12, 'y', .65)}</g>`;
        // Solda sevimli kaşif çadırı
        s += `<g transform="translate(-35 13)"><ellipse cy="4" rx="18" ry="4" fill="#081c12" opacity=".35"/><path d="M-16 4L0 -24L16 4Z" fill="${C('#ea8c3e')}"/><path d="M0 -24L16 4H3Z" fill="#000" opacity=".22"/><path d="M-16 4L0 -24L-5 4Z" fill="${C('#ffba68')}" opacity=".5"/><path d="M-5 4L0 -10L5 4Z" fill="#3a2014"/><path d="M0 -24v-6l8 2.5-8 2.5" fill="${C('#ffd45a')}"/></g>`;
        // Merkezde taş çevrili kamp ateşi ve kütükler
        s += `<g transform="translate(2 13)">${glow(0, -8, 42, 28, 'o', .9)}<path d="M-15 2L11 -2M-11 -2L15 3" stroke="${C('#684024')}" stroke-width="5.5" stroke-linecap="round"/>` +
          [[-16, 5], [-8, 8], [0, 9], [8, 8], [16, 5]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="2.6" fill="${C('#8e98b0')}" stroke="#4a5268" stroke-width="1"/>`).join('') + `</g>`;
        // Canlı kamp ateşi alevi ve ateşböcekleri
        ov.push(`<g transform="translate(2 14)"><g class="hm-flame"><path d="M0 0Q-11 -9 -4 -23Q0 -15 4 -20Q12 -9 0 0Z" fill="#ff7a20"/><path d="M0 0Q-7 -7 -2 -16Q2 -11 5 -13Q7 -6 0 0Z" fill="#ffb838"/><path d="M0 0Q-4 -5 0 -11Q4 -5 0 0Z" fill="#fff2a0"/></g></g>`);
        for (let i = 0; i < 4; i++) ov.push(fly(-48 + i * 32, -32 - (i * 15) % 30, 1.9, '#ffe9a0', i * .6, 2.5));
      },

      degirmen() {
        s += glow(0, -18, 82, 46, 'y', .26);
        // Sürülmüş altın tarla çizgileri ve ahşap çit
        s += `<path d="M-62 7Q-30 -3 0 7T62 7" stroke="${C('#b47422')}" stroke-width="2.4" fill="none" opacity=".75"/>`;
        s += `<path d="M-66 14Q-30 4 0 14T66 14" stroke="${C('#b47422')}" stroke-width="2.4" fill="none" opacity=".75"/>`;
        // Başaklar ve ayçiçekleri
        for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) {
          const x = -60 + i * 10.5 + r * 2.5, y = 5 + r * 5.2 + (i % 2) * 1.5;
          s += `<path d="M${x} ${y}l1.5 -8.5M${x} ${y - 3.5}l-3 -3M${x} ${y - 6}l3 -3" stroke="${C('#ffe898')}" stroke-width="1.7" stroke-linecap="round" opacity=".92"/>`;
        }
        // Görkemli Yel Değirmeni Kulesi (taş kaide + ahşap kirişli gövde + kiremit kubbe)
        s += `<path d="M-19 5L-16 -10H16L19 5Z" fill="${C('#b8a890')}" stroke="${C('#7c6c58')}" stroke-width="1"/>`;
        s += `<path d="M-16 -8L-10 -48H10L16 -8Z" fill="${C('#fbf0da')}"/>`;
        s += `<path d="M3 -48H10L16 -8H5Z" fill="#8a6842" opacity=".24"/>`;
        s += `<path d="M-13 -26H13M-11 -38H11" stroke="${C('#8c623a')}" stroke-width="2"/>`;
        // Balkon ve kırmızı çatı
        s += `<rect x="-15" y="-28" width="30" height="3" rx="1.2" fill="${C('#8c5e36')}"/>`;
        s += `<path d="M-14 -48L0 -68L14 -48Z" fill="${C('#d44e38')}"/><path d="M0 -68L14 -48H4Z" fill="#000" opacity=".2"/>`;
        // Kemerli kapı ve parlayan pencere
        s += `<path d="M-4.5 5V-8Q0 -14 4.5 -8V5Z" fill="#5e3a20" stroke="${C('#d8be98')}" stroke-width="1.2"/>`;
        s += `<rect x="-3.5" y="-36" width="7" height="9" rx="3.5" fill="${C('#ffe478')}" stroke="${C('#8c5e36')}" stroke-width="1.2"/>${glow(0, -31, 14, 14, 'y', .6)}`;
        // Saman balyaları ve un çuvalları
        s += `<circle cx="42" cy="6" r="8.5" fill="${C('#eab844')}" stroke="${C('#a47222')}" stroke-width="1.6"/><path d="M35 6h14M42 -1v14" stroke="#a47222" stroke-width="1.1" opacity=".65"/>`;
        s += `<circle cx="-44" cy="10" r="7" fill="${C('#eab844')}" stroke="${C('#a47222')}" stroke-width="1.6"/>`;
        s += `<ellipse cx="-24" cy="7" rx="5.5" ry="4" fill="${C('#f8f0dc')}" stroke="${C('#b89e78')}" stroke-width="1"/>`;
        // Dönen detaylı yelken kanatları
        ov.push(`<g transform="translate(0 -45)"><g class="hm-spin">${[0, 90, 180, 270].map(a =>
          `<g transform="rotate(${a + 20})"><rect x="-2" y="-36" width="4" height="35" rx="1" fill="#7c5230"/><rect x="2" y="-35" width="12" height="25" rx="1.8" fill="#fff8e4" stroke="#c49a62" stroke-width="1.2"/><path d="M2 -27h12M2 -19h12M8 -35v25" stroke="#d8b882" stroke-width=".9"/></g>`
        ).join('')}</g><circle r="5" fill="#ffd25a" stroke="#7c5230" stroke-width="1.6"/></g>`);
        for (let i = 0; i < 3; i++) ov.push(fly(-44 + i * 44, -22 - (i * 14) % 24, 1.7, '#fff0a8', i * .6, 2.8));
      },

      magara() {
        // Çift zirveli kristal dağ kütlesi
        s += `<path d="M-64 6L-48 -32L-24 -48L0 -64L26 -48L50 -30L64 6Q0 19 -64 6Z" fill="${C('#4c5a8a')}"/>`;
        s += `<path d="M-64 6L-48 -32L-24 -48L0 -64L-10 10Z" fill="${C('#6c7eb2')}" opacity=".55"/>`;
        s += `<path d="M0 -64L26 -48L50 -30L64 6L10 12Z" fill="#060c24" opacity=".24"/>`;
        s += `<path d="M-48 -32L-24 -48L0 -64L26 -48" fill="none" stroke="#d0dcfa" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>`;
        // Ahşap tahkimatlı parlayan maden girişi ve raylar
        s += `<path d="M-17 9V-8Q0 -30 17 -8V9Z" fill="#0c122c"/>${glow(0, -6, 36, 28, 'c', .75)}`;
        s += `<path d="M-11 9V-5Q0 -19 11 -5V9Z" fill="#74f2ff" opacity=".65"/>`;
        s += `<path d="M-18 9L-15 -12H15L18 9" fill="none" stroke="${C('#8c5c38')}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
        // Maden rayları
        s += `<path d="M-8 9L-14 20M8 9L14 20M-10 13H10M-12 17H12" stroke="${C('#a8b6d4')}" stroke-width="1.8" stroke-linecap="round"/>`;
        // Zengin çok yüzeyli kristaller
        s += crystal(-14, -42, 28, 7.5, '#ff8eb8', C, -10) +
             crystal(15, -44, 24, 6.5, '#ffd060', C, 12) +
             crystal(-36, -24, 22, 6.5, '#80ffba', C, -22) +
             crystal(38, -22, 24, 6.5, '#70ecff', C, 20) +
             crystal(-48, 10, 46, 10.5, '#4ee2f8', C, -13) +
             crystal(46, 10, 42, 9.5, '#ff8eb8', C, 11) +
             crystal(-30, 12, 25, 6.8, '#c8f8ff', C, -5) +
             crystal(26, 13, 26, 7.2, '#ffd060', C, 7) +
             crystal(60, 4, 23, 6, '#70ecff', C, 18);
        // Sevimli altın salyangoz kabuğu detayı
        s += `<g transform="translate(-18 13)"><circle r="5.5" fill="${C('#ffb84d')}" stroke="${C('#8c5220')}" stroke-width="1.2"/><path d="M0 0a2.5 2.5 0 1 1 2 2" fill="none" stroke="#fff2b8" stroke-width="1.2"/></g>`;
        for (let i = 0; i < 4; i++) {
          ov.push(`<g transform="translate(${-52 + i * 34} ${-44 + (i * 23) % 44})"><g class="hm-tw" style="animation-delay:${-i * .6}s">${sparkle(0, 0, 5, '#e8ffff')}</g></g>`);
        }
      },

      mabet() {
        // Arkada devasa parlak Dolunay ve yıldız halesi
        s += glow(16, -76, 105, 90, 'b', .55) + glow(16, -76, 84, 84, 'wt', .55);
        s += `<circle cx="18" cy="-78" r="44" fill="#faf5d8"/><circle cx="18" cy="-78" r="44" fill="none" stroke="#ffffff" stroke-width="3" opacity=".7"/>`;
        s += `<circle cx="5" cy="-90" r="7.5" fill="#e4dfb8" opacity=".7"/><circle cx="33" cy="-68" r="9.5" fill="#e4dfb8" opacity=".7"/><circle cx="24" cy="-97" r="4.5" fill="#e4dfb8" opacity=".7"/>`;
        s += glow(0, -4, 86, 32, 'b', .5);
        // 3 katlı mermer tapınak podyumu ve kutsal ay havuzu
        s += `<rect x="-54" y="-3" width="108" height="9" rx="3" fill="${C('#9eadde')}"/><rect x="-48" y="-11" width="96" height="9" rx="3" fill="${C('#b8c6ec')}"/><rect x="-42" y="-18" width="84" height="8" rx="2.5" fill="${C('#d8e2fa')}"/>`;
        s += `<ellipse cy="11" rx="28" ry="5.5" fill="${C('#62e2ff')}" opacity=".75" stroke="#fff" stroke-width="1.2"/>`;
        // Yivli antik mermer sütunlar
        [-33, -20, -7, 7, 20, 33].forEach(x => {
          s += `<rect x="${x - 4.8}" y="-63" width="9.6" height="45" fill="${C('#d0daf6')}"/>` +
               `<rect x="${x - 2}" y="-63" width="2" height="45" fill="#fff" opacity=".55"/>` +
               `<rect x="${x + 1.2}" y="-63" width="3.6" height="45" fill="#7686b8" opacity=".32"/>` +
               `<rect x="${x - 6.5}" y="-66" width="13" height="4.2" rx="1.6" fill="${C('#ffffff')}"/>` +
               `<rect x="${x - 6.5}" y="-20" width="13" height="3.2" rx="1.2" fill="${C('#ffffff')}"/>`;
        });
        // Tapınak alınlığı (pediment) ve altın hilal arması
        s += `<rect x="-44" y="-68" width="88" height="4" rx="1.5" fill="${C('#e4ecff')}"/>`;
        s += `<path d="M-50 -66H50L0 -95Z" fill="${C('#c8d4f4')}" stroke="${C('#ffffff')}" stroke-width="2" stroke-linejoin="round"/>`;
        s += `<path d="M-38 -70H38L0 -89Z" fill="${C('#9fb2e4')}" opacity=".75"/>`;
        s += `<path d="M-6 -83a8.5 8.5 0 1 0 10 10a6.8 6.8 0 1 1 -10 -10Z" fill="${C('#ffe888')}"/>${glow(0, -78, 20, 20, 'y', .75)}`;
        // Kutsal kemerli geçit ve yan dikilitaş fenerleri
        s += `<path d="M-9 -18V-38Q0 -49 9 -38V-18Z" fill="#14225c"/>${glow(0, -28, 16, 18, 'b', 1)}`;
        [[-52, -2], [52, -2]].forEach(([x, y]) => {
          s += `<path d="M${x - 4} ${y}L${x - 2.5} ${y - 22}L${x} ${y - 27}L${x + 2.5} ${y - 22}L${x + 4} ${y}Z" fill="${C('#b8c6ec')}"/>` +
               `<circle cx="${x}" cy="${y - 30}" r="3" fill="#7ef4ff"/>${glow(x, y - 30, 10, 10, 'c', .7)}`;
        });
        s += star(58, -52, 6.5, C('#fff1a0')) + star(-58, -42, 5.5, C('#fff1a0'));
        for (let i = 0; i < 4; i++) ov.push(`<g transform="translate(${-52 + i * 36} ${-96 + (i * 29) % 66})"><g class="hm-tw" style="animation-delay:${-i * .55}s">${sparkle(0, 0, 5, '#fff6c8')}</g></g>`);
      },

      yanardag() {
        s += glow(0, -6, 88, 32, 'r', .32) + glow(0, -54, 48, 26, 'o', .95);
        // İkiz zirveli bazalt yanardağ gövdesi
        s += `<path d="M-64 8L-44 -28L-30 -20L-18 -54Q0 -62 18 -54L64 8Q0 22 -64 8Z" fill="${C('#7c4c4a')}"/>`;
        s += `<path d="M-64 8L-44 -28L-30 -20L-18 -54L-8 14Z" fill="${C('#9e6660')}" opacity=".5"/>`;
        s += `<path d="M18 -54L64 8Q30 17 6 14Z" fill="#08040c" opacity=".26"/>`;
        // Kaynayan krater ağzı
        s += `<path d="M-19 -54Q0 -63 19 -54Q0 -44 -19 -54Z" fill="#ff9828"/>`;
        s += `<path d="M-12 -54Q0 -59 12 -54Q0 -48 -12 -54Z" fill="#fff298"/>`;
        // Kollara ayrılan parlak lav nehirleri ve lav gölü
        s += `<path d="M2 -50Q14 -34 -2 -20Q-14 -8 4 11" stroke="#ff5e1a" stroke-width="8.5" fill="none" stroke-linecap="round"/>`;
        s += `<path d="M2 -50Q14 -34 -2 -20Q-14 -8 4 11" stroke="#ffe878" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
        s += `<path d="M-24 -24Q-34 -8 -42 8" stroke="#ff6e22" stroke-width="5.5" fill="none" stroke-linecap="round"/>`;
        s += `<path d="M-24 -24Q-34 -8 -42 8" stroke="#ffe27a" stroke-width="2" fill="none" stroke-linecap="round"/>`;
        s += `<ellipse cx="4" cy="12" rx="14" ry="4.5" fill="#ff7a24"/><ellipse cx="4" cy="12" rx="8" ry="2.4" fill="#fff098"/>`;
        // Sevimli gülümseyen yanardağ yüzü
        s += `<g transform="translate(-13 -24)"><circle cx="-6" r="2.6" fill="#241014"/><circle cx="-6.8" cy="-.8" r=".9" fill="#fff"/><circle cx="6" r="2.6" fill="#241014"/><circle cx="5.2" cy="-.8" r=".9" fill="#fff"/><path d="M-3.5 4Q0 8 3.5 4" stroke="#241014" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="-12" cy="3.5" r="3.8" fill="#ff8282" opacity=".65"/><circle cx="12" cy="3.5" r="3.8" fill="#ff8282" opacity=".65"/></g>`;
        // Buhar bulutları ve lav kıvılcımları
        for (let i = 0; i < 2; i++) {
          ov.push(`<ellipse cx="0" cy="-60" rx="${11 + i * 3}" ry="${7.5 + i}" fill="#f4e6e8" opacity="0"><animate attributeName="cy" values="-60;-104" dur="${4.8 + i}s" begin="${i * 1.6}s" repeatCount="indefinite"/><animate attributeName="cx" values="0;${15 - i * 14}" dur="${4.8 + i}s" begin="${i * 1.6}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.8;0" dur="${4.8 + i}s" begin="${i * 1.6}s" repeatCount="indefinite"/></ellipse>`);
        }
        for (let i = 0; i < 3; i++) {
          ov.push(`<circle cx="${-6 + i * 4}" cy="-56" r="2.2" fill="#ffd25a" opacity="0"><animate attributeName="cy" values="-56;${-90 - i * 6}" dur="${1.9 + i * .35}s" begin="${i * .45}s" repeatCount="indefinite"/><animate attributeName="cx" values="${-6 + i * 4};${-22 + i * 14}" dur="${1.9 + i * .35}s" begin="${i * .45}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="${1.9 + i * .35}s" begin="${i * .45}s" repeatCount="indefinite"/></circle>`);
        }
      },

      sehir() {
        const wall = C('#ecd6b6'), shade = C('#b89872'), roof = C('#d84a42');
        s += glow(0, -24, 86, 46, 'w', .26);
        // Arka plan burç kuleleri ve şehir çatıları
        [[-34, -54, 16], [36, -48, 15], [-18, -42, 13], [19, -40, 13]].forEach(([x, h, w]) => {
          s += `<rect x="${x - w / 2}" y="${h}" width="${w}" height="${-12 - h}" fill="${wall}"/>` +
               `<rect x="${x + w / 6}" y="${h}" width="${w / 3}" height="${-12 - h}" fill="${shade}" opacity=".38"/>` +
               `<path d="M${x - w / 2 - 3} ${h}L${x} ${h - 17}L${x + w / 2 + 3} ${h}Z" fill="${roof}"/>` +
               `<rect x="${x - 2.2}" y="${h + 7}" width="4.4" height="7" rx="2.2" fill="#ffe47a"/>`;
        });
        // Merkezde Görkemli Astronomik Saat Kulesi
        s += `<rect x="-10.5" y="-76" width="21" height="64" fill="${wall}"/><rect x="2.5" y="-76" width="8" height="64" fill="${shade}" opacity=".38"/>`;
        s += `<path d="M-14 -76L0 -98L14 -76Z" fill="${C('#c84434')}"/><path d="M0 -98L14 -76H4Z" fill="#000" opacity=".2"/>`;
        s += `<circle cy="-62" r="8.5" fill="#fffaf0" stroke="${C('#c89638')}" stroke-width="2"/><circle cy="-62" r="6.5" fill="none" stroke="#8a6a45" stroke-width=".7" stroke-dasharray="1.5 2"/>`;
        s += `<path d="M0 -62V-67.5M0 -62l4.2 2.2" stroke="#4a2c18" stroke-width="1.6" stroke-linecap="round"/>`;
        s += `<path d="M0 -98v-10l11 3.5-11 3.5" fill="${C('#ffd45a')}"/>`;
        // Mazgallı taş şehir surları ve kemerli ana kapı
        s += `<rect x="-62" y="-18" width="124" height="27" rx="2.5" fill="${wall}"/><rect x="-62" y="-3" width="124" height="12" fill="${shade}" opacity=".28"/>`;
        for (let i = 0; i < 9; i++) s += `<rect x="${-62 + i * 14.2}" y="-24" width="8.5" height="7" rx="1" fill="${wall}"/>`;
        // Kemerli kapı + demir parmaklık + taş köprü
        s += `<path d="M-11 9V-6Q0 -19 11 -6V9Z" fill="#321e14" stroke="${shade}" stroke-width="1.5"/>${glow(0, -1, 16, 16, 'y', .65)}`;
        s += `<path d="M-6 -10V4M0 -13V4M6 -10V4M-9 -4H9" stroke="#8a745a" stroke-width="1" opacity=".6"/>`;
        [-45, -27, 27, 45].forEach(x => s += `<rect x="${x - 3.2}" y="-10" width="6.4" height="8.5" rx="3.2" fill="#ffe47a"/>${glow(x, -6, 10, 10, 'y', .5)}`);
        ov.push(`<g class="hm-tw">${sparkle(-34, -74, 4.5, '#fff6c8')}</g><g class="hm-tw" style="animation-delay:-1.5s">${sparkle(36, -68, 4, '#fff6c8')}</g>`);
      },

      kale() {
        // Gün batımı kehribar-altın halesi
        s += `<circle cx="0" cy="-44" r="50" fill="#ffad58" opacity=".62"/>${glow(0, -44, 98, 68, 'o', .72)}`;
        const wall = C('#fae0e2'), sh = C('#c68896'), roof = C('#dc4c70');
        // Yan burçları bağlayan taş kemerli köprüler ve ana sur
        s += `<rect x="-46" y="-28" width="92" height="36" fill="${wall}"/><rect x="16" y="-28" width="30" height="36" fill="${sh}" opacity=".32"/>`;
        for (let i = 0; i < 7; i++) s += `<rect x="${-45 + i * 13.5}" y="-34" width="8.5" height="7" rx="1" fill="${wall}"/>`;
        // 5 kuleli masal şatosu
        [[-50, -52, 16], [50, -52, 16], [-24, -60, 15], [24, -60, 15], [0, -78, 20]].forEach(([x, h, w], i) => {
          const hh = i === 4 ? 56 : -h - 10;
          s += `<rect x="${x - w / 2}" y="${h}" width="${w}" height="${hh}" fill="${wall}"/>` +
               `<rect x="${x + w / 6}" y="${h}" width="${w * .32}" height="${hh}" fill="${sh}" opacity=".36"/>` +
               `<path d="M${x - w / 2 - 4} ${h}L${x} ${h - (i === 4 ? 32 : 24)}L${x + w / 2 + 4} ${h}Z" fill="${roof}"/>` +
               `<path d="M${x} ${h - (i === 4 ? 32 : 24)}L${x + w / 2 + 4} ${h}H${x + 2}Z" fill="#000" opacity=".2"/>` +
               `<rect x="${x - 2.5}" y="${h + 8}" width="5" height="9" rx="2.5" fill="#ffe066"/>`;
        });
        // Gotik gül pencere, bayraklar ve saray kapısı
        s += `<circle cy="-44" r="6" fill="#ffd86b" stroke="${sh}" stroke-width="1.4"/>`;
        s += `<path d="M0 -110v-14l15 4.5-15 4.5" fill="${C('#ffd45a')}"/>`;
        s += `<path d="M-50 -76v-9l9 3-9 3M50 -76v-9l9 3-9 3" fill="${C('#ffd45a')}"/>`;
        s += `<path d="M-9 8V-9Q0 -22 9 -9V8Z" fill="#381628" stroke="#ffd86b" stroke-width="1.2"/>${glow(0, -2, 16, 16, 'o', .6)}`;
        // Kalenin etrafında süzülen ejderha
        ov.push(`<g><animateMotion dur="11s" repeatCount="indefinite" path="M-74 -84C-42 -124 42 -124 74 -84S-42 -52 -74 -84Z" rotate="auto"/><path d="M-13 0Q-4 -3.5 5 0L16 -3.5L9 2L18 6.5L6 4.5Q0 6.5 -6 4.5L-15 6.5L-9 2Z" fill="#7c2438"/><path d="M-4 -1L-2 -13L4 -2Z" fill="#a83850"><animate attributeName="d" dur=".5s" repeatCount="indefinite" values="M-4 -1L-2 -13L4 -2Z;M-4 0L-2 7L4 0Z;M-4 -1L-2 -13L4 -2Z"/></path></g>`);
        ov.push(`<g class="hm-tw">${sparkle(50, -90, 4.5, '#ffe9a0')}</g><g class="hm-tw" style="animation-delay:-1.8s">${sparkle(-50, -88, 4, '#ffe9a0')}</g>`);
      }
    };
    (M[id] || (() => {}))();
    return { s, ov };
  }

  // ── BÜYÜK FENER: Merkezdeki Anıtsal Fener Adası, Liman İskelesi, 9 Vitray Cam Yüzü ve 10. Taç Küresi ──
  function fener(litArr, cols, bitti) {
    const n = 9, LW = 90, pw = LW / n, k = litArr.filter(Boolean).length / n;
    let g = `<defs>
      <linearGradient id="hmTw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffdf6"/><stop offset=".35" stop-color="#fff6e4"/><stop offset=".75" stop-color="#e8dac4"/><stop offset="1" stop-color="#b2a6be"/></linearGradient>
      <linearGradient id="hmRock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#98a8d0"/><stop offset=".5" stop-color="#60709e"/><stop offset="1" stop-color="#323d68"/></linearGradient>
      <linearGradient id="hmRoof" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff98b0"/><stop offset=".45" stop-color="#f05a7e"/><stop offset="1" stop-color="#9e2c4c"/></linearGradient>
      <clipPath id="hmTwC"><path d="M-48 -34L-32 -152H32L48 -34Z"/></clipPath>
    </defs>`;

    // 1) Deniz tabanı gölgesi, turkuaz lagün ve çift köpük halkası
    g += `<ellipse cy="22" rx="198" ry="38" fill="#03081c" opacity=".48"/>`;
    g += `<ellipse cy="12" rx="188" ry="36" fill="#3cd8dc" opacity=".18"/>`;
    g += `<path d="${blob(182, 40, 5, 7, .05, 14)}" fill="#c4eeff" opacity=".18"/>`;
    g += `<path d="${blob(182, 40, 5, 7, .05, 14)}" fill="none" stroke="#eefaff" stroke-width="2.6" opacity=".62" stroke-dasharray="18 8 6 8"/>`;
    g += `<path d="${blob(198, 46, 9, 9, .04, 14)}" fill="none" stroke="#a8e4ff" stroke-width="1.5" opacity=".3" stroke-dasharray="4 10"/>`;

    // Suya düşen altın fener yansıması (yanan ışıklarla güçlenir)
    if (k > 0) {
      g += glow(0, 34, 90 + 50 * k, 22 + 10 * k, 'y', .25 + .35 * k);
      for (let i = 0; i < 4; i++) {
        const wy = 24 + i * 6, ww = (44 - i * 7) * (.5 + .5 * k);
        g += `<path d="M${f1(-ww)} ${wy}H${f1(ww)}" stroke="#ffe898" stroke-width="${2.4 - i * .3}" stroke-linecap="round" opacity="${f1((.45 - i * .08) * (.4 + .6 * k))}"/>`;
      }
    }

    // 2) Katmanlı Kayalık Fener Adası ve Şelale
    g += `<path d="M-156 14Q-134 -20 -92 -26L-54 -52H54L94 -26Q136 -20 156 14Q104 42 0 44Q-104 42 -156 14Z" fill="url(#hmRock)"/>`;
    g += `<path d="M-126 8Q-100 -14 -66 -20L-46 -42H46L68 -20Q102 -14 126 8Q64 28 0 28Q-64 28 -126 8Z" fill="#b4c2e4" opacity=".48"/>`;
    g += `<path d="M0 44Q104 42 156 14Q136 -20 94 -26L54 -52H10V44Z" fill="#060c28" opacity=".2"/>`;
    // Sol yamaçta gümüş-mavi mini şelale
    g += `<path d="M-86 -18Q-96 0 -92 20" stroke="#7ceeff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>`;
    g += `<path d="M-86 -18Q-96 0 -92 20" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-dasharray="5 5"/>`;
    g += `<ellipse cx="-92" cy="21" rx="14" ry="4" fill="#e8ffff" opacity=".75"/>`;
    // Kaya sırtı altın ışık vurguları
    g += `<path d="M-156 14Q-134 -20 -92 -26L-54 -52" fill="none" stroke="#ffe9a8" stroke-width="2.6" opacity=".6"/>`;
    g += `<path d="M-104 12q-6 -9 4 -14M104 8q8 -8 -2 -14M-24 25q5 -8 16 -8M32 26q6 -6 18 -4" stroke="#222a50" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`;

    // Zümrüt çimen terası ve çiçekli çalılar
    g += `<path d="M-66 -34Q-44 -50 -22 -37Q0 -53 24 -37Q48 -48 66 -34Q42 -24 0 -26Q-42 -24 -66 -34Z" fill="#4cb868"/>`;
    g += `<path d="M-66 -34Q-44 -50 -22 -37Q0 -53 24 -37" stroke="#a8f498" stroke-width="2.4" fill="none" opacity=".7"/>`;
    [[-50, -34], [-36, -38], [38, -37], [52, -33]].forEach(([x, y]) => g += `<circle cx="${x}" cy="${y}" r="2.5" fill="#ffe27a"/>`);

    // 3) Fener Gövdesi (3B silindirik gölgeli, altın kuşaklı, oymalı taş kaideli)
    // Sekizgen taş kaide ve payandalar
    g += `<path d="M-54 -32L-48 -48H48L54 -32Q0 -26 -54 -32Z" fill="#d8ccb8" stroke="#9e8e78" stroke-width="1.5"/>`;
    g += `<path d="M-48 -34L-32 -152H32L48 -34Z" fill="url(#hmTw)"/>`;
    g += `<g clip-path="url(#hmTwC)">`;
    [['#ff88b2', -58], ['#48c4ea', -88], ['#ffd254', -118]].forEach(([c, y]) => {
      g += `<path d="M-60 ${y}Q0 ${y + 9} 60 ${y}V${y + 19}Q0 ${y + 28} -60 ${y + 19}Z" fill="${c}" opacity=".9"/>`;
      g += `<path d="M-60 ${y}Q0 ${y + 9} 60 ${y}" fill="none" stroke="#fff6d6" stroke-width="1.6" opacity=".65"/>`;
    });
    // Sol aydınlık ve sağ silindirik gölge
    g += `<rect x="-48" y="-152" width="16" height="122" fill="#ffffff" opacity=".22"/>`;
    g += `<rect x="14" y="-152" width="36" height="122" fill="#2c3258" opacity=".22"/>`;
    g += `</g>`;
    g += `<path d="M-48 -34L-32 -152H32L48 -34Z" fill="none" stroke="#c8b492" stroke-width="2.2"/>`;

    // Görkemli Kemerli Giriş Kapısı ve Merdiven
    g += `<ellipse cy="-32" rx="16" ry="3.5" fill="#e8dcc8"/>`;
    g += `<path d="M-11 -33V-60Q0 -73 11 -60V-33Z" fill="#2e2240" stroke="url(#hmGld)" stroke-width="2.8"/>`;
    g += `<path d="M-7.5 -35V-58Q0 -67 7.5 -58V-35Z" fill="#ffd878" opacity=".75"/>${glow(0, -48, 20, 20, 'y', .55)}`;
    // Kule pencereleri
    [-78, -104, -134].forEach((y, idx) => {
      const xOff = idx === 1 ? 6 : idx === 2 ? -5 : 0;
      g += `<rect x="${xOff - 4.5}" y="${y}" width="9" height="13" rx="4.5" fill="#fff0b0" stroke="#b89452" stroke-width="1.5"/>${glow(xOff, y + 6, 16, 16, 'y', .65)}`;
    });

    // 4) Oymalı Taş Konsollar ve Altın Korkuluklu Fener Balkonu
    g += `<path d="M-36 -146L-54 -152H54L36 -146Z" fill="#707c9e"/>`;
    for (let i = -4; i <= 4; i++) g += `<rect x="${i * 9.5 - 2}" y="-151" width="4" height="6" rx="1" fill="#b8a888"/>`;
    g += `<ellipse cy="-152" rx="56" ry="8" fill="#687496"/><rect x="-56" y="-156" width="112" height="5.5" rx="2.5" fill="url(#hmGldH)"/>`;
    for (let i = 0; i < 13; i++) g += `<rect x="${-51 + i * 8.5}" y="-168" width="2.5" height="13" rx="1.2" fill="url(#hmGld)"/>`;
    g += `<rect x="-56" y="-170" width="112" height="3.8" rx="1.8" fill="url(#hmGldH)"/>`;
    g += `<circle cx="-54" cy="-172" r="3" fill="#ffe27a"/><circle cx="54" cy="-172" r="3" fill="#ffe27a"/>`;

    // 5) 9 Vitray Cam Yüzlü Fener Galerisi
    g += glow(0, -202, 145 + 75 * k, 110 + 55 * k, 'w', .32 + .62 * k);
    if (k > 0) g += glow(0, -202, 95 + 50 * k, 80 + 40 * k, 'y', .35 + .5 * k);
    g += `<rect x="${-LW / 2 - 6}" y="-173" width="${LW + 12}" height="6.5" rx="2.5" fill="url(#hmGldH)"/>`;
    g += `<rect x="${-LW / 2 - 5}" y="-235" width="${LW + 10}" height="5.5" rx="2.5" fill="url(#hmGldH)"/>`;
    g += `<rect x="${-LW / 2}" y="-231" width="${LW}" height="60" rx="3" fill="#161c42"/>`;

    for (let i = 0; i < n; i++) {
      const lit = !!litArr[i], x = -LW / 2 + i * pw, c = cols[i];
      const px = f1(x + 1), pw2 = f1(pw - 2);
      g += `<rect x="${px}" y="-229" width="${pw2}" height="56" rx="3" fill="${lit ? c : '#242c5a'}"/>`;
      if (lit) {
        g += `<rect x="${f1(x + 2)}" y="-226" width="${f1(pw - 4)}" height="50" rx="2" fill="#ffffff" opacity=".32"/>`;
        g += `<rect x="${f1(x + 2.2)}" y="-225" width="2.4" height="48" rx="1.2" fill="#ffffff" opacity=".82"/>`;
        g += `<rect x="${px}" y="-229" width="${pw2}" height="56" rx="3" fill="url(#hmGl_wt)" opacity=".42"/>`;
        g += `<circle cx="${f1(x + pw / 2)}" cy="-176" r="2.2" fill="${lite(c, .5)}"/>`;
      } else {
        g += `<path d="M${f1(x + 2)} -220l${f1(pw - 4)} 12M${f1(x + 2)} -198l${f1(pw - 4)} 12" stroke="#3e4b84" stroke-width="1.1" opacity=".6"/>`;
        g += `<path d="M${f1(x + 2.6)} -222v42" stroke="#465490" stroke-width="1.3" opacity=".55"/>`;
      }
    }
    g += `<rect x="${-LW / 2}" y="-231" width="${LW}" height="60" rx="3" fill="none" stroke="url(#hmGldH)" stroke-width="2.8"/>`;

    // 6) Kraliyet Kubbesi ve 10. Taç Işık Küresi
    g += `<path d="M-56 -235Q0 -298 56 -235Z" fill="url(#hmRoof)" stroke="url(#hmGldH)" stroke-width="2.8"/>`;
    g += `<path d="M-28 -235Q0 -288 0 -266M28 -235Q0 -288 0 -266" stroke="url(#hmGld)" stroke-width="1.8" fill="none" opacity=".65"/>`;
    g += `<path d="M-34 -243Q-12 -273 10 -276" stroke="#ffffff" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>`;
    g += `<rect x="-3.5" y="-275" width="7" height="15" rx="2" fill="url(#hmGld)"/>`;
    g += `<path d="M-14 -278Q-8 -288 -5 -274M14 -278Q8 -288 5 -274" stroke="url(#hmGld)" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    if (bitti) g += glow(0, -286, 52, 52, 'y', 1) + glow(0, -286, 28, 28, 'wt', .95);
    g += `<circle cy="-286" r="12" fill="${bitti ? '#ffe478' : '#1b224c'}" stroke="url(#hmGld)" stroke-width="3.2"/>` +
         (bitti ? `<circle cy="-286" r="6" fill="#ffffff"/>` : `<path d="M0 -292l5.5 6-5.5 6-5.5-6Z" fill="#485492"/>`);

    // 7) Liman İskelesi, Taş Merdiven Yolu ve Karşılama Feneri (F düğümü: x=117, y=16)
    g += `<path d="M12 -30Q52 -22 76 -4Q100 6 122 15" stroke="#7c6244" stroke-width="11" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M12 -30Q52 -22 76 -4Q100 6 122 15" stroke="#e4c890" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="6 5"/>`;
    // İskele kazıkları ve fener direği
    g += `<rect x="108" y="12" width="20" height="6" rx="2" fill="#9c7248" stroke="#5e4024" stroke-width="1.2"/>`;
    g += `<rect x="115.5" y="-16" width="3.5" height="29" fill="#7c5836"/>`;
    g += `<rect x="111.5" y="-26" width="11" height="12" rx="3.5" fill="#ffd25a" stroke="#7c5836" stroke-width="1.6"/>`;
    g += `<circle cx="117" cy="-20" r="3.5" fill="#fffbe8"/>${glow(117, -20, 28, 28, 'y', .75)}`;
    return g;
  }

  return { mini, fener, defs, glow, sparkle, star, fly, blob, mix, lite, dark, rng, f1, IDS };
})();
