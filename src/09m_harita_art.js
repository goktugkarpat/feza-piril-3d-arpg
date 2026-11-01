/* ── Dünya Haritası çizimleri (HARITA): ortak yardımcılar + 10 yerin resmi + Büyük Fener ──
   Saf SVG metni üretir. 09m_harita.js tarafından kullanılır (HARITA_ART). Mor yalnız Pırıl'ın: burada kullanma. */
const HARITA_ART = (() => {
  'use strict';
  const IDS = ['mantar', 'mercan', 'orman', 'degirmen', 'magara', 'mabet', 'yanardag', 'sehir', 'kale', 'fener'];
  const hx = c => { const m = /^#?([0-9a-f]{6})$/i.exec(c || ''); const n = m ? parseInt(m[1], 16) : 0x888888; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgb = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (c, d, k) => { const a = hx(c), b = hx(d); return rgb(a.map((v, i) => v + (b[i] - v) * k)); };
  const lite = (c, k = .3) => mix(c, '#ffffff', k), dark = (c, k = .3) => mix(c, '#0c1233', k);
  const rng = seed => { let a = (seed * 2654435761) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const f1 = v => +v.toFixed(1);
  // yumuşak dalgalı oval
  function blob(rx, ry, seed, cy = 0, j = .08, n = 10) {
    const R = rng(seed), p = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + (R() - .5) * 2 * j; p.push([Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s = 'M' + m(p[n - 1], p[0]).map(f1).join(' ');
    for (let i = 0; i < n; i++) { const q = m(p[i], p[(i + 1) % n]); s += `Q${f1(p[i][0])} ${f1(p[i][1])} ${f1(q[0])} ${f1(q[1])}`; }
    return s + 'Z';
  }
  const GL = { w: '#fff0b0', p: '#ff9cc4', c: '#7fe9ff', g: '#9dffa8', o: '#ffa040', y: '#ffe27a', b: '#8cb4ff', r: '#ff6c5a', wt: '#ffffff' };
  function defs() {
    let s = '';
    for (const k in GL) s += `<radialGradient id="hmGl_${k}"><stop offset="0" stop-color="${GL[k]}" stop-opacity=".95"/><stop offset=".4" stop-color="${GL[k]}" stop-opacity=".4"/><stop offset="1" stop-color="${GL[k]}" stop-opacity="0"/></radialGradient>`;
    return s;
  }
  const glow = (x, y, rx, ry, n, op = 1) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#hmGl_${n})" opacity="${op}"/>`;
  function star(x, y, r, c, op = 1) { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + f1(x + Math.cos(a) * rr) + ' ' + f1(y + Math.sin(a) * rr); } return `<path d="${d}Z" fill="${c}" opacity="${op}"/>`; }
  const sparkle = (x, y, r, c = '#fff6d6') => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${c}"/>`;
  const fly = (x, y, r, c, d, t = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"><animate attributeName="opacity" values=".1;1;.1" dur="${t}s" begin="${d}s" repeatCount="indefinite"/></circle>${glow(x, y, r * 4, r * 4, 'y', .5)}`;

  // ── ada tabanı: gölge, köpük, uçurum, kıyı, çim ──
  const TOP = { mantar: ['#58c490', '#2a7f6a', '#d9efd0'], mercan: ['#69d6d0', '#2b97b0', '#f3dfae'], orman: ['#4fae62', '#25683e', '#c9a870'], degirmen: ['#f0cd66', '#c8923a', '#e4c47a'],
    magara: ['#7a88b8', '#3f4c80', '#aab4d0'], mabet: ['#8da0d4', '#4a5c9a', '#cdd6f0'], yanardag: ['#8a5a50', '#4d2f3a', '#6a4048'], sehir: ['#d7bc98', '#a58662', '#e6d4b8'],
    kale: ['#f0b4b4', '#c5758a', '#f7d9d2'], fener: ['#e6d28a', '#a58a50', '#f2e6bd'] };
  function base(id, rx, ry, seed) {
    const [t1, t2, rim] = TOP[id] || TOP.mantar;
    const R = rng(seed + 9);
    let s = `<defs><linearGradient id="hmT_${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t1}"/><stop offset="1" stop-color="${t2}"/></linearGradient><linearGradient id="hmC_${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(rim, t2, .45)}"/><stop offset="1" stop-color="${dark(t2, .55)}"/></linearGradient></defs>`;
    s += `<ellipse cy="${ry + 16}" rx="${rx + 26}" ry="${ry * .62}" fill="#04091f" opacity=".38"/>`;
    s += `<path d="${blob(rx + 15, ry + 9, seed, 6, .05)}" fill="#bfe8ff" opacity=".14"/><path d="${blob(rx + 15, ry + 9, seed, 6, .05)}" fill="none" stroke="#e8f8ff" stroke-width="2.2" opacity=".5" stroke-dasharray="14 7"/>`;
    s += `<path d="${blob(rx + 30, ry + 15, seed + 5, 8, .05)}" fill="none" stroke="#cfeeff" stroke-width="1.4" opacity=".22" stroke-dasharray="3 9"/>`;
    s += `<path d="${blob(rx + 3, ry + 3, seed + 1, 13, .04)}" fill="url(#hmC_${id})"/>`;   // uçurum / kayalık
    for (let i = 0; i < 5; i++) { const x = -rx * .7 + i * rx * .35 + R() * 6; s += `<path d="M${f1(x)} ${ry + 5}q4 9 ${f1(R() * 8 - 2)} ${f1(10 + R() * 5)}" stroke="${dark(t2, .6)}" stroke-width="2" opacity=".35" fill="none"/>`; }
    s += `<path d="${blob(rx + 3, ry + 3, seed + 1, 4, .04)}" fill="${rim}"/>`;   // kıyı kumu
    s += `<path d="${blob(rx, ry, seed + 2, 0, .05)}" fill="url(#hmT_${id})"/>`;
    s += `<path d="${blob(rx * .8, ry * .55, seed + 3, -ry * .22, .1)}" fill="#fff" opacity=".08"/>`;
    return s;
  }
  const mush = (x, y, k, cap, spot, g, C) => `<g transform="translate(${x} ${y}) scale(${k})">${glow(0, -30, 50, 40, g, .55)}<path d="M-6 3Q-5 -14 -4 -30H4Q5 -14 6 3Z" fill="${C('#f4e8d8')}"/><path d="M-6 3Q-5 -14 -4 -30H-1Q-2 -14 -1 3Z" fill="#fff" opacity=".4"/>` +
    `<path d="M-33 -24Q-31 -64 0 -66Q31 -64 33 -24Q0 -13 -33 -24Z" fill="${C(cap)}"/><path d="M-33 -24Q0 -13 33 -24Q26 -29 0 -27Q-26 -29 -33 -24Z" fill="#000" opacity=".2"/><path d="M-22 -47Q-16 -59 -3 -61" stroke="#fff" opacity=".6" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
    [[-14, -42, 4.5], [10, -53, 5], [20, -36, 3.8], [-3, -33, 3.2], [-24, -32, 3]].map(([a, b, r]) => `<circle cx="${a}" cy="${b}" r="${r}" fill="${C(spot)}"/>`).join('') + '</g>';
  const pine = (x, y, k, C) => `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cy="2" rx="16" ry="4" fill="#0a2a1c" opacity=".35"/><rect x="-3.5" y="-12" width="7" height="14" fill="${C('#7a5238')}"/>` +
    [['#2a7c47', -64, 20, -30], ['#33924f', -46, 24, -12], ['#3da85a', -28, 28, 6]].map(([c, t, w, b]) => `<path d="M0 ${t}L${-w} ${b}Q0 ${b + 7} ${w} ${b}Z" fill="${C(c)}"/><path d="M0 ${t}L${w} ${b}Q${w * .3} ${b + 5} 0 ${b + 3}Z" fill="#0c3a24" opacity=".25"/>`).join('') + '</g>';
  const coral = (x, y, h, col, C, w = 7) => { const d = `M0 0V${-h}M0 ${-h * .45}l${-h * .3} ${-h * .3}M0 ${-h * .6}l${h * .32} ${-h * .32}M0 ${-h * .85}l${-h * .16} ${-h * .22}`; return `<g transform="translate(${x} ${y})" fill="none" stroke-linecap="round"><path d="${d}" stroke="${C(dark(col, .25))}" stroke-width="${w}"/><path d="${d}" stroke="${C(col)}" stroke-width="${w * .55}"/></g>`; };
  const crystal = (x, y, h, w, col, C, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})">${glow(0, -h * .5, w * 2.2, h * .8, 'c', .45)}<path d="M${-w} 0L${-w * .8} ${-h * .7}L0 ${-h}L${w * .8} ${-h * .7}L${w} 0Z" fill="${C(col)}"/><path d="M0 ${-h}L${w * .8} ${-h * .7}L${w} 0H0Z" fill="#000" opacity=".16"/><path d="M${-w * .5} ${-h * .1}L${-w * .45} ${-h * .62}" stroke="#fff" stroke-width="2.4" opacity=".7" stroke-linecap="round"/></g>`;

  // ── 10 yerin resmi (yerel: zemin y≈0; ov = canlı katman parçaları) ──
  function mini(id, ok) {
    const C = ok ? (x => x) : (x => mix(x, '#7d8bad', .28));
    const ov = []; let s = ''; const rx = id === 'mercan' ? 68 : 72, ry = 23;
    const seed = IDS.indexOf(id) * 7 + 3;
    s += base(id, rx, ry, seed);
    const M = {
      mantar() {
        s += glow(0, 0, 80, 26, 'p', .22);
        s += `<path d="M-60 12Q-20 4 6 14T64 8" stroke="#8ff0ff" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>`;
        [[-48, 6, .7, '#5fd8e8', '#e8ffff', 'c'], [48, 4, .75, '#ffd45a', '#fff6c8', 'y'], [-22, 12, .5, '#ff9a5a', '#fff0e0', 'o'], [26, 14, .5, '#ff6f9c', '#fff2f8', 'p'], [0, 6, 1.3, '#ff6f9c', '#fff2f8', 'p'], [-66, 0, .4, '#7fe8a8', '#f0fff0', 'g']].sort((a, b) => a[1] - b[1]).forEach(([x, y, k, c, sp, g]) => s += mush(x, y, k, c, sp, g, C));
        for (let i = 0; i < 6; i++) { const x = -56 + i * 22, y = 10 + (i % 2) * 6; s += `<circle cx="${x}" cy="${y}" r="2" fill="${C('#ffe27a')}"/>`; }
        for (let i = 0; i < 4; i++) ov.push(fly(-50 + i * 34, -20 - (i * 17) % 40, 1.8, '#d8ff9a', i * .5, 2.4 + i % 3));
      },
      mercan() {
        s += `<path d="${blob(54, 14, 77, 2, .08)}" fill="#2aa7c8" opacity=".6"/><path d="${blob(54, 14, 77, 2, .08)}" fill="none" stroke="#d8f8ff" stroke-width="2" opacity=".6"/>`;
        s += coral(-38, 6, 36, '#ff7f9f', C) + coral(38, 8, 30, '#ffb6c8', C, 6) + coral(6, 5, 52, '#ff9a4a', C, 8) + coral(-14, 10, 26, '#ffd45a', C, 6) + coral(24, 12, 24, '#ff6f8a', C, 5.5);
        s += `<ellipse cx="-4" cy="-4" rx="12" ry="9" fill="${C('#fff2d8')}"/><path d="M-14 -4Q-4 -18 6 -4" fill="${C('#ffe2c0')}" stroke="${C('#f0b890')}" stroke-width="1.2"/><circle cx="-4" cy="-4" r="3.5" fill="#fffef2"/>${glow(-4, -4, 18, 14, 'wt', .7)}`;
        s += star(-52, 8, 7, C('#ff9a4a')) + `<path d="M-60 14q9 -6 18 0t18 0t18 0t18 0t18 0" stroke="#e8fbff" stroke-width="3" fill="none" opacity=".75" stroke-linecap="round"/>`;
        for (let i = 0; i < 3; i++) ov.push(`<circle cx="${-30 + i * 28}" cy="-10" r="${2 + i % 3}" fill="#e8fbff" fill-opacity=".35" stroke="#fff" stroke-opacity=".8"><animate attributeName="cy" values="-6;-70" dur="${4 + i * .7}s" begin="${i * .8}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="${4 + i * .7}s" begin="${i * .8}s" repeatCount="indefinite"/></circle>`);
        ov.push(`<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="3s" repeatCount="indefinite"/><path d="M50 -22q6 -6 12 0q-6 6 -12 0M62 -22l6 -5v10Z" fill="#ffb347"/></g>`);
      },
      orman() {
        s += glow(0, 6, 70, 22, 'o', .12);
        [[-52, 8, .85], [52, 8, .8], [-30, 0, 1.05], [34, -2, 1.1], [-4, -8, 1.3], [-62, 2, .6]].forEach(([x, y, k]) => s += pine(x, y, k, C));
        s += `<g transform="translate(0 12)">${glow(0, -8, 38, 26, 'o', .85)}<path d="M-14 2L10 -2M-10 -2L14 3" stroke="${C('#6a4428')}" stroke-width="5" stroke-linecap="round"/><ellipse cx="-16" cy="6" rx="4" ry="2.5" fill="#9aa2b8"/><ellipse cx="16" cy="6" rx="4" ry="2.5" fill="#9aa2b8"/><ellipse cx="0" cy="8" rx="4" ry="2.5" fill="#9aa2b8"/></g>`;
        s += `<g transform="translate(-34 14)"><path d="M-15 4L0 -22L15 4Z" fill="${C('#e8914a')}"/><path d="M0 -22L15 4H3Z" fill="#000" opacity=".2"/><path d="M-4 4L0 -9L4 4Z" fill="#3a2418"/></g>`;
        ov.push(`<g transform="translate(0 14)"><g class="hm-flame"><path d="M0 0Q-9 -8 -3 -20Q-1 -13 3 -17Q10 -8 0 0Z" fill="#ff8a2a"/><path d="M0 0Q-4 -5 0 -12Q4 -5 0 0Z" fill="#ffe27a"/></g></g>`);
        for (let i = 0; i < 3; i++) ov.push(fly(-50 + i * 45, -34 - (i * 13) % 28, 1.7, '#ffe9a0', i * .7, 2.6));
      },
      degirmen() {
        s += `<path d="M-62 8Q-30 -2 0 8T62 8" stroke="${C('#b87a28')}" stroke-width="2.2" fill="none" opacity=".7"/><path d="M-66 14Q-30 3 0 14T66 14" stroke="${C('#b87a28')}" stroke-width="2.2" fill="none" opacity=".7"/>`;
        for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const x = -60 + i * 10.5 + r * 3, y = 5 + r * 5.5 + (i % 2) * 1.5; s += `<path d="M${x} ${y}l1.5 -8M${x} ${y - 3}l-3 -3M${x} ${y - 5}l3 -3" stroke="${C('#ffe9a0')}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`; }
        s += `<path d="M-16 4L-9 -46H9L16 4Z" fill="${C('#f6ecd6')}"/><path d="M4 -46H9L16 4H4Z" fill="#8a6a45" opacity=".25"/><path d="M-12 -46L0 -64L12 -46Z" fill="${C('#c9573f')}"/><path d="M0 -64L12 -46H4Z" fill="#000" opacity=".2"/><path d="M-4 4V-9Q0 -15 4 -9V4Z" fill="#6a4428"/><rect x="-3" y="-30" width="6" height="8" rx="3" fill="${C('#ffe27a')}"/>${glow(0, -26, 12, 12, 'y', .5)}`;
        s += `<circle cx="42" cy="6" r="8" fill="${C('#e8b84a')}" stroke="${C('#a87a28')}" stroke-width="1.6"/><path d="M36 6h12M42 0v12" stroke="#a87a28" stroke-width="1" opacity=".6"/><circle cx="-44" cy="10" r="6.5" fill="${C('#e8b84a')}" stroke="${C('#a87a28')}" stroke-width="1.6"/>`;
        ov.push(`<g transform="translate(0 -44)"><g class="hm-spin">${[0, 90, 180, 270].map(a => `<g transform="rotate(${a + 20})"><rect x="-2" y="-34" width="4" height="32" fill="#8a6a45"/><rect x="2" y="-33" width="11" height="22" rx="1.5" fill="#fff7e0" stroke="#c9b58a" stroke-width="1"/></g>`).join('')}</g><circle r="4.5" fill="#8a6a45"/></g>`);
        for (let i = 0; i < 0; i++) ov.push(`<path d="M${-60 + i * 30} 6q4 -3 8 0" stroke="#fff3b8" stroke-width="2" fill="none" opacity="0"><animate attributeName="opacity" values="0;.9;0" dur="3s" begin="${i * .6}s" repeatCount="indefinite"/></path>`);
      },
      magara() {
        s += `<path d="M-62 6Q-52 -30 -22 -44Q0 -62 24 -46Q54 -30 62 6Q0 18 -62 6Z" fill="${C('#56628f')}"/><path d="M-22 -44Q0 -62 24 -46Q54 -30 62 6L10 12Z" fill="#000" opacity=".16"/><path d="M-40 -20L-22 -44L0 -30Z" fill="#fff" opacity=".12"/><path d="M-62 6Q-52 -30 -22 -44" fill="none" stroke="#c4cdea" stroke-width="2.4" opacity=".5"/>`;
        s += `<path d="M-15 8V-6Q0 -28 15 -6V8Z" fill="#101530"/>${glow(0, -6, 30, 24, 'c', .65)}<path d="M-9 8V-4Q0 -16 9 -4V8Z" fill="#7fe9ff" opacity=".55"/>`;
        s += crystal(-12, -40, 26, 7, '#ff9ac0', C, -8) + crystal(14, -42, 22, 6, '#ffd070', C, 12) + crystal(-34, -22, 20, 6, '#8fffb8', C, -22) + crystal(36, -20, 22, 6, '#7fe8f0', C, 20) + crystal(-46, 10, 44, 10, '#5fe0f0', C, -12) + crystal(44, 10, 40, 9, '#ff9ac0', C, 10) + crystal(-30, 12, 22, 6, '#c4f6ff', C, -4) + crystal(26, 13, 24, 7, '#ffd070', C, 6) + crystal(60, 4, 22, 6, '#7fe8f0', C, 18);
        for (let i = 0; i < 3; i++) ov.push(`<g transform="translate(${-52 + i * 42} ${-40 + (i * 23) % 44})"><g class="hm-tw" style="animation-delay:${-i * .7}s"><path d="M0 -5Q0 0 5 0Q0 0 0 5Q0 0 -5 0Q0 0 0 -5Z" fill="#e8ffff"/></g></g>`);
      },
      mabet() {
        s += glow(0, -50, 100, 80, 'b', .5) + `<circle cx="20" cy="-78" r="42" fill="#f6f2d4"/><circle cx="20" cy="-78" r="42" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/><circle cx="8" cy="-90" r="7" fill="#e0dcb8"/><circle cx="34" cy="-68" r="9" fill="#e0dcb8"/><circle cx="26" cy="-96" r="4" fill="#e0dcb8"/>` + glow(20, -78, 80, 80, 'wt', .5) + glow(0, -4, 80, 30, 'b', .45);
        s += `<rect x="-52" y="-3" width="104" height="9" rx="2.5" fill="${C('#a9b6de')}"/><rect x="-46" y="-11" width="92" height="9" rx="2.5" fill="${C('#bfcaec')}"/><rect x="-40" y="-18" width="80" height="8" rx="2.5" fill="${C('#d6def6')}"/>`;
        [-32, -19, -6, 6, 19, 32].forEach(x => s += `<rect x="${x - 4.5}" y="-62" width="9" height="44" fill="${C('#bfcaec')}"/><rect x="${x + 1}" y="-62" width="3.5" height="44" fill="#7f8eb8" opacity=".28"/><rect x="${x - 6}" y="-65" width="12" height="4" rx="1.5" fill="${C('#fff')}"/><rect x="${x - 6}" y="-20" width="12" height="3" rx="1" fill="${C('#fff')}"/>`);
        s += `<path d="M-48 -64H48L0 -92Z" fill="${C('#c4cfee')}" stroke="${C('#b8c0dc')}" stroke-width="2"/><path d="M-36 -68H36L0 -86Z" fill="${C('#b9c6ee')}" opacity=".6"/>`;
        s += `<path d="M-6 -81a8 8 0 1 0 9 9a6.5 6.5 0 1 1 -9 -9Z" fill="${C('#ffe9a0')}"/>${glow(-1, -76, 18, 18, 'y', .6)}`;
        s += `<path d="M-8 -18V-36Q0 -46 8 -36V-18Z" fill="#1d2a64"/>${glow(0, -26, 12, 14, 'b', 1)}`;
        s += star(58, -50, 6, C('#fff1a0')) + star(-58, -40, 5, C('#fff1a0'));
        for (let i = 0; i < 3; i++) ov.push(`<g transform="translate(${-50 + i * 48} ${-96 + (i * 31) % 70})"><g class="hm-tw" style="animation-delay:${-i * .6}s">${sparkle(0, 0, 4.5, '#fff6c8')}</g></g>`);
      },
      yanardag() {
        s += glow(0, -4, 84, 28, 'r', .26);
        s += `<path d="M-64 8L-18 -52Q0 -60 18 -52L64 8Q0 22 -64 8Z" fill="${C('#8a5a56')}"/><path d="M18 -52L64 8Q30 16 8 14Z" fill="#000" opacity=".2"/><path d="M-18 -52Q0 -60 18 -52Q0 -44 -18 -52Z" fill="#ffb340"/>${glow(0, -52, 34, 18, 'o', .9)}`;
        s += `<path d="M2 -50Q12 -34 -2 -22Q-14 -10 2 10" stroke="#ff7a2a" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M2 -50Q12 -34 -2 -22Q-14 -10 2 10" stroke="#ffe27a" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M-26 -22Q-34 -6 -40 8" stroke="#ff7a2a" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".9"/><path d="M-26 -22Q-34 -6 -40 8" stroke="#ffe27a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
        s += `<g transform="translate(-14 -24)"><circle cx="-6" r="2.4" fill="#2a1418"/><circle cx="6" r="2.4" fill="#2a1418"/><path d="M-3 4Q0 8 3 4" stroke="#2a1418" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="-12" cy="4" r="3.6" fill="#ff8a8a" opacity=".6"/><circle cx="12" cy="4" r="3.6" fill="#ff8a8a" opacity=".6"/></g>`;
        for (let i = 0; i < 5; i++) s += `<path d="M${-58 + i * 26} ${12 + (i % 2) * 4}l6 -3l5 3" stroke="#ff8a3a" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round"/>`;
        for (let i = 0; i < 2; i++) ov.push(`<ellipse cx="0" cy="-58" rx="${10 + i * 2}" ry="${7 + i}" fill="#e6eaf4" opacity="0"><animate attributeName="cy" values="-58;-100" dur="${5 + i}s" begin="${i * 1.7}s" repeatCount="indefinite"/><animate attributeName="cx" values="0;${14 - i * 12}" dur="${5 + i}s" begin="${i * 1.7}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.75;0" dur="${5 + i}s" begin="${i * 1.7}s" repeatCount="indefinite"/></ellipse>`);
        for (let i = 0; i < 2; i++) ov.push(`<circle cx="${-6 + i * 3}" cy="-56" r="1.8" fill="#ffb040" opacity="0"><animate attributeName="cy" values="-56;${-86 - i * 5}" dur="${2 + i * .4}s" begin="${i * .5}s" repeatCount="indefinite"/><animate attributeName="cx" values="${-6 + i * 3};${-20 + i * 10}" dur="${2 + i * .4}s" begin="${i * .5}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="${2 + i * .4}s" begin="${i * .5}s" repeatCount="indefinite"/></circle>`);
      },
      sehir() {
        const wall = C('#e4cdb0'), shade = C('#b89a7a');
        s += glow(0, -20, 80, 40, 'w', .2);
        [[-30, -52, 15], [34, -44, 14]].forEach(([x, h, w]) => s += `<rect x="${x - w / 2}" y="${h}" width="${w}" height="${-14 - h}" fill="${wall}"/><rect x="${x + w / 6}" y="${h}" width="${w / 3}" height="${-14 - h}" fill="${shade}" opacity=".35"/><path d="M${x - w / 2 - 3} ${h}L${x} ${h - 16}L${x + w / 2 + 3} ${h}Z" fill="${C('#d9574f')}"/><rect x="${x - 2}" y="${h + 8}" width="4" height="7" rx="2" fill="#ffe27a"/>`);
        s += `<rect x="-9" y="-72" width="18" height="60" fill="${wall}"/><rect x="2" y="-72" width="7" height="60" fill="${shade}" opacity=".35"/><path d="M-12 -72L0 -92L12 -72Z" fill="${C('#c9573f')}"/><circle cy="-60" r="7.5" fill="#fff8e6" stroke="${C('#8a6a45')}" stroke-width="1.6"/><path d="M0 -60V-65M0 -60l4 2" stroke="#6a4428" stroke-width="1.5" stroke-linecap="round"/><path d="M0 -92v-9l9 3-9 3" fill="#ffd45a"/>`;
        s += `<rect x="-62" y="-18" width="124" height="26" rx="2" fill="${wall}"/><rect x="-62" y="-4" width="124" height="12" fill="${shade}" opacity=".25"/>`;
        for (let i = 0; i < 9; i++) s += `<rect x="${-62 + i * 14}" y="-24" width="8" height="7" fill="${wall}"/>`;
        s += `<path d="M-9 8V-6Q0 -17 9 -6V8Z" fill="#3a2418"/>${glow(0, -2, 14, 14, 'y', .55)}`;
        [-44, -26, 28, 46].forEach(x => s += `<rect x="${x - 3}" y="-10" width="6" height="8" rx="3" fill="#ffe27a"/>${glow(x, -6, 9, 9, 'y', .45)}`);
        ov.push(`<g class="hm-tw">${sparkle(-30, -72, 4)}</g>`);
      },
      kale() {
        s += `<circle cx="0" cy="-40" r="46" fill="#ffb060" opacity=".55"/>${glow(0, -40, 92, 62, 'o', .65)}`;
        const wall = C('#f6dcdc'), sh = C('#c9909c'), roof = C('#e0607f');
        s += `<rect x="-44" y="-26" width="88" height="34" fill="${wall}"/><rect x="18" y="-26" width="26" height="34" fill="${sh}" opacity=".3"/>`;
        for (let i = 0; i < 7; i++) s += `<rect x="${-44 + i * 13}" y="-32" width="8" height="7" fill="${wall}"/>`;
        [[-48, -50, 17], [48, -50, 17], [0, -72, 19]].forEach(([x, h, w], i) => s += `<rect x="${x - w / 2}" y="${h}" width="${w}" height="${i == 2 ? 50 : -h - 12}" fill="${wall}"/><rect x="${x + w / 5}" y="${h}" width="${w * .3}" height="${i == 2 ? 50 : -h - 12}" fill="${sh}" opacity=".35"/><path d="M${x - w / 2 - 4} ${h}L${x} ${h - 28}L${x + w / 2 + 4} ${h}Z" fill="${roof}"/><path d="M${x} ${h - 28}L${x + w / 2 + 4} ${h}H${x + 3}Z" fill="#000" opacity=".18"/><rect x="${x - 2.5}" y="${h + 9}" width="5" height="9" rx="2.5" fill="#ffd45a"/>`);
        s += `<path d="M0 -100v-14l14 4-14 5" fill="${C('#ffd45a')}"/><path d="M-8 8V-8Q0 -20 8 -8V8Z" fill="#3a1a2e"/>${glow(0, -2, 14, 14, 'o', .5)}`;
        ov.push(`<g><animateMotion dur="11s" repeatCount="indefinite" path="M-70 -80C-40 -120 40 -120 70 -80S-40 -50 -70 -80Z" rotate="auto"/><path d="M-12 0Q-4 -3 4 0L14 -3L8 2L16 6L6 4Q0 6 -6 4L-14 6L-8 2Z" fill="#7a2a3a"/><path d="M-4 -1L-2 -12L4 -2Z" fill="#9a3a4a"><animate attributeName="d" dur=".5s" repeatCount="indefinite" values="M-4 -1L-2 -12L4 -2Z;M-4 0L-2 6L4 0Z;M-4 -1L-2 -12L4 -2Z"/></path></g>`);
        ov.push(`<g class="hm-tw">${sparkle(48, -86, 4, '#ffe9a0')}</g>`);
      },
    };
    (M[id] || (() => { }))();
    return { s, ov };
  }

  // ── Büyük Fener: yerel 0,0 = tabanın merkezi (kayalığın üstü). 9 cam yüz + 10. tepe yuvası ──
  function fener(litArr, cols, bitti) {
    const n = 9, LW = 84, pw = LW / n, k = litArr.filter(Boolean).length / n;
    let g = `<defs><linearGradient id="hmTw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffaf0"/><stop offset=".55" stop-color="#f3e8d6"/><stop offset="1" stop-color="#b5a9bd"/></linearGradient>
      <linearGradient id="hmRock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d9bbf"/><stop offset="1" stop-color="#3b4670"/></linearGradient>
      <linearGradient id="hmRoof" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8aa0"/><stop offset="1" stop-color="#b8405e"/></linearGradient>
      <clipPath id="hmTwC"><path d="M-46 -34L-30 -150H30L46 -34Z"/></clipPath></defs>`;
    g += `<ellipse cy="20" rx="190" ry="34" fill="#04091f" opacity=".4"/><path d="${blob(176, 38, 5, 6, .05, 12)}" fill="#bfe8ff" opacity=".16"/><path d="${blob(176, 38, 5, 6, .05, 12)}" fill="none" stroke="#e8f8ff" stroke-width="2.4" opacity=".5" stroke-dasharray="16 8"/>`;
    g += `<path d="M-150 14Q-130 -18 -90 -24L-52 -50H52L92 -24Q132 -18 150 14Q100 40 0 42Q-100 40 -150 14Z" fill="url(#hmRock)"/><path d="M-120 8Q-96 -12 -64 -18L-44 -40H44L66 -18Q100 -12 122 8Q60 26 0 26Q-60 26 -120 8Z" fill="#a8b4d4" opacity=".5"/>`;
    g += `<path d="M-150 14Q-130 -18 -90 -24" fill="none" stroke="#ffe9a8" stroke-width="2.5" opacity=".55"/><path d="M-96 12q-6 -9 4 -13M100 8q8 -8 -2 -14M-20 24q4 -8 14 -8M30 26q6 -6 16 -4" stroke="#2a3258" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`;
    g += `<path d="M-60 -34Q-40 -48 -20 -36Q0 -50 24 -36Q46 -46 62 -34Q40 -26 0 -28Q-40 -26 -60 -34Z" fill="#58b070"/><path d="M-60 -34Q-40 -48 -20 -36" stroke="#9de88a" stroke-width="2" fill="none" opacity=".6"/>`;
    g += `<path d="M-46 -34L-30 -150H30L46 -34Z" fill="url(#hmTw)"/><g clip-path="url(#hmTwC)">`;
    [['#ff8fb8', -56], ['#4fc3e8', -86], ['#ffd45a', -116]].forEach(([c, y]) => g += `<path d="M-60 ${y}Q0 ${y + 8} 60 ${y}V${y + 18}Q0 ${y + 26} -60 ${y + 18}Z" fill="${c}" opacity=".85"/>`);
    g += `<rect x="14" y="-150" width="36" height="120" fill="#4a4a6a" opacity=".16"/></g><path d="M-46 -34L-30 -150H30L46 -34Z" fill="none" stroke="#c4b8a0" stroke-width="2"/>`;
    g += `<path d="M-9 -34V-58Q0 -70 9 -58V-34Z" fill="#3a2a4a" stroke="#d9c79a" stroke-width="2.5"/><path d="M-6 -36V-56Q0 -64 6 -56V-36Z" fill="#ffd27a" opacity=".5"/>`;
    [-76, -100, -132].forEach(y => g += `<rect x="-4" y="${y}" width="8" height="12" rx="4" fill="#ffe9a8"/>${glow(0, y + 6, 14, 14, 'y', .6)}`);
    g += `<ellipse cy="-151" rx="52" ry="8" fill="#6a7494"/><rect x="-52" y="-154" width="104" height="5" rx="2" fill="#8a94b4"/>`;
    for (let i = 0; i < 11; i++) g += `<rect x="${-48 + i * 9.6}" y="-166" width="2.4" height="13" rx="1" fill="#d9c79a"/>`;
    g += `<rect x="-52" y="-168" width="104" height="3.5" rx="1.7" fill="#d9c79a"/>`;
    g += glow(0, -198, 130 + 60 * k, 100 + 50 * k, 'w', .25 + .6 * k);
    g += `<rect x="-${LW / 2 + 5}" y="-171" width="${LW + 10}" height="6" rx="2" fill="#d9c79a"/><rect x="-${LW / 2 + 4}" y="-232" width="${LW + 8}" height="5" rx="2" fill="#d9c79a"/><rect x="-${LW / 2}" y="-228" width="${LW}" height="58" fill="#1b2048"/>`;
    for (let i = 0; i < n; i++) {
      const lit = !!litArr[i], x = -LW / 2 + i * pw, c = cols[i];
      g += `<rect x="${f1(x + .9)}" y="-226" width="${f1(pw - 1.8)}" height="54" rx="2.4" fill="${lit ? c : '#2b3262'}"/>`;
      if (lit) g += `<rect x="${f1(x + 2)}" y="-223" width="2.2" height="46" rx="1.1" fill="#fff" opacity=".7"/><rect x="${f1(x + .9)}" y="-226" width="${f1(pw - 1.8)}" height="54" rx="2.4" fill="url(#hmGl_wt)" opacity=".35"/>`;
      else g += `<path d="M${f1(x + 2.5)} -218v36" stroke="#4a5590" stroke-width="1.4" opacity=".6"/>`;
    }
    g += `<rect x="-${LW / 2}" y="-228" width="${LW}" height="58" rx="3" fill="none" stroke="#d9c79a" stroke-width="2.5"/>`;
    g += `<path d="M-52 -232Q0 -292 52 -232Z" fill="url(#hmRoof)" stroke="#d9c79a" stroke-width="2.5"/><path d="M-30 -240Q-10 -268 8 -272" stroke="#fff" stroke-width="3.5" fill="none" opacity=".4" stroke-linecap="round"/><rect x="-3" y="-270" width="6" height="14" fill="#d9c79a"/>`;
    if (bitti) g += glow(0, -282, 40, 40, 'y', 1);
    g += `<circle cy="-282" r="11" fill="${bitti ? '#ffe27a' : '#1d2350'}" stroke="#d9c79a" stroke-width="3"/>` + (bitti ? '<circle cy="-282" r="5" fill="#fff"/>' : '<path d="M0 -288l5 6-5 6-5-6Z" fill="#46508a"/>');
    g += `<path d="M62 -2Q96 -2 120 14" stroke="#9a7a52" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M62 -2Q96 -2 120 14" stroke="#d9b980" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 5"/>`;
    g += `<rect x="116" y="-14" width="3" height="26" fill="#8a6a45"/><rect x="113" y="-22" width="9" height="10" rx="3" fill="#ffcf5a"/>${glow(117, -17, 24, 24, 'y', .6)}`;
    return g;
  }
  return { mini, fener, defs, glow, sparkle, star, fly, blob, mix, lite, dark, rng, f1, IDS };
})();
